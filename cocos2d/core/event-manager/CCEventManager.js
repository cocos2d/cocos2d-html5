/****************************************************************************
 Copyright (c) 2010-2014 cocos2d-x.org

 http://www.cocos2d-x.org

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 ****************************************************************************/

cc._EventListenerVector = cc.Class.extend({
    _fixedListeners: null,
    _sceneGraphListeners: null,
    gt0Index: 0,

    ctor: function () {
        this._fixedListeners = [];
        this._sceneGraphListeners = [];
    },

    size: function () {
        return this._fixedListeners.length + this._sceneGraphListeners.length;
    },

    empty: function () {
        return (this._fixedListeners.length === 0) && (this._sceneGraphListeners.length === 0);
    },

    push: function (listener) {
        if (listener._getFixedPriority() == 0)
            this._sceneGraphListeners.push(listener);
        else
            this._fixedListeners.push(listener);
    },

    clearSceneGraphListeners: function () {
        this._sceneGraphListeners.length = 0;
    },

    clearFixedListeners: function () {
        this._fixedListeners.length = 0;
    },

    clear: function () {
        this._sceneGraphListeners.length = 0;
        this._fixedListeners.length = 0;
    },

    getFixedPriorityListeners: function () {
        return this._fixedListeners;
    },

    getSceneGraphPriorityListeners: function () {
        return this._sceneGraphListeners;
    }
});

cc.__getListenerID = function (event) {
    var eventType = cc.Event;
    switch (event.getType()) {
        case eventType.ACCELERATION:
            return cc._EventListenerAcceleration.LISTENER_ID;
        case eventType.CUSTOM:
            return event.getEventName();
        case eventType.KEYBOARD:
            return cc._EventListenerKeyboard.LISTENER_ID;
        case eventType.MOUSE:
            return cc._EventListenerMouse.LISTENER_ID;
        case eventType.TOUCH:
            // Touch listener is very special, it contains two kinds of listeners, EventListenerTouchOneByOne and EventListenerTouchAllAtOnce.
            // return UNKNOWN instead.
            cc.log("Don't call this method if the event is for touch.");
            return "";
        default:
            cc.log("Invalid event type!");
            return "";
    }
};

/**
 * @namespace<p>
 *  This class manages event listener subscriptions and event dispatching.                                      <br/>
 *                                                                                                              <br/>
 *  The EventListener list is managed in such a way that event listeners can be added and removed even          <br/>
 *  from within an EventListener, while events are being dispatched.
 * </p>
 */
cc.eventManager = /** @lends cc.eventManager# */{
    //Priority dirty flag
    DIRTY_NONE:0,
    DIRTY_FIXED_PRIORITY:1 <<0,
    DIRTY_SCENE_GRAPH_PRIORITY : 1<< 1,
    DIRTY_ALL: 3,

    _listenersMap: {},
    _priorityDirtyFlagMap: {},
    _nodeListenersMap: {},
    _nodePriorityMap: {},
    _globalZOrderNodeMap: {},
    _toAddedListeners: [],
    _dirtyNodes: [],
    _inDispatch: 0,
    _isEnabled: true,
    _nodePriorityIndex: 0,

    _internalCustomListenerIDs:[cc.game.EVENT_HIDE, cc.game.EVENT_SHOW],

    _setDirtyForNode: function (node) {
        // Mark the node dirty only when there is an event listener associated with it.
        if (this._nodeListenersMap[node.__instanceId] != null)
            this._dirtyNodes.push(node);
    },

    /**
     * Pauses all listeners which are associated the specified target.
     * @param {cc.Node} node
     * @param {Boolean} [recursive=false]
     */
    pauseTarget: function (node, recursive) {
        var listeners = this._nodeListenersMap[node.__instanceId], i, len;
        if (listeners) {
            for ( i = 0, len = listeners.length; i < len; i++)
                listeners[i]._setPaused(true);
        }
        if (recursive === true) {
            var locChildren = node.getChildren();
            for ( i = 0, len = locChildren.length; i< len; i++)
                this.pauseTarget(locChildren[i], true);
        }
    },

    /**
     * Resumes all listeners which are associated the specified target.
     * @param {cc.Node} node
     * @param {Boolean} [recursive=false]
     */
    resumeTarget: function (node, recursive) {
        var listeners = this._nodeListenersMap[node.__instanceId], i, len;
        if (listeners){
            for ( i = 0, len = listeners.length; i < len; i++)
                listeners[i]._setPaused(false);
        }
        this._setDirtyForNode(node);
        if (recursive === true) {
            var locChildren = node.getChildren();
            for ( i = 0, len = locChildren.length; i< len; i++)
                this.resumeTarget(locChildren[i], true);
        }
    },

    _addListener: function (listener) {
        if (this._inDispatch === 0)
            this._forceAddEventListener(listener);
        else
            this._toAddedListeners.push(listener);
    },

    _forceAddEventListener: function (listener) {
        var listenerID = listener._getListenerID();
        var listeners = this._listenersMap[listenerID];
        if (!listeners) {
            listeners = new cc._EventListenerVector();
            this._listenersMap[listenerID] = listeners;
        }
        listeners.push(listener);

        if (listener._getFixedPriority() == 0) {
            this._setDirty(listenerID, this.DIRTY_SCENE_GRAPH_PRIORITY);

            var node = listener._getSceneGraphPriority();
            if (node == null)
                cc.log("Invalid scene graph priority!");

            this._associateNodeAndEventListener(node, listener);
            if (node.isRunning())
                this.resumeTarget(node);
        } else
            this._setDirty(listenerID, this.DIRTY_FIXED_PRIORITY);
    },

    _getListeners: function (listenerID) {
        return this._listenersMap[listenerID];
    },

    _updateDirtyFlagForSceneGraph: function () {
        if (this._dirtyNodes.length == 0)
            return;

        var locDirtyNodes = this._dirtyNodes, selListeners, selListener, locNodeListenersMap = this._nodeListenersMap;
        for (var i = 0, len = locDirtyNodes.length; i < len; i++) {
            selListeners = locNodeListenersMap[locDirtyNodes[i].__instanceId];
            if (selListeners) {
                for (var j = 0, listenersLen = selListeners.length; j < listenersLen; j++) {
                    selListener = selListeners[j];
                    if (selListener)
                        this._setDirty(selListener._getListenerID(), this.DIRTY_SCENE_GRAPH_PRIORITY);
                }
            }
        }
        this._dirtyNodes.length = 0;
    },

    _removeAllListenersInVector: function (listenerVector) {
        if (!listenerVector)
            return;
        var selListener;
        for (var i = 0; i < listenerVector.length;) {
            selListener = listenerVector[i];
            selListener._setRegistered(false);
            if (selListener._getSceneGraphPriority() != null)
                this._dissociateNodeAndEventListener(selListener._getSceneGraphPriority(), selListener);

            if (this._inDispatch === 0)
                cc.arrayRemoveObject(listenerVector, selListener);
            else
                ++i;
        }
    },

    _removeListenersForListenerID: function (listenerID) {
        var listeners = this._listenersMap[listenerID], i;
        if (listeners) {
            var fixedPriorityListeners = listeners.getFixedPriorityListeners();
            var sceneGraphPriorityListeners = listeners.getSceneGraphPriorityListeners();

            this._removeAllListenersInVector(sceneGraphPriorityListeners);
            this._removeAllListenersInVector(fixedPriorityListeners);

            // Remove the dirty flag according the 'listenerID'.
            // No need to check whether the dispatcher is dispatching event.
            delete this._priorityDirtyFlagMap[listenerID];

            if (!this._inDispatch) {
                listeners.clear();
                delete this._listenersMap[listenerID];
            }
        }

        var locToAddedListeners = this._toAddedListeners, listener;
        for (i = 0; i < locToAddedListeners.length;) {
            listener = locToAddedListeners[i];
            if (listener && listener._getListenerID() == listenerID)
                cc.arrayRemoveObject(locToAddedListeners, listener);
            else
                ++i;
        }
    },

    _sortEventListeners: function (listenerID) {
        var dirtyFlag = this.DIRTY_NONE;
        if (this._priorityDirtyFlagMap[listenerID])
            dirtyFlag = this._priorityDirtyFlagMap[listenerID];

        if (dirtyFlag != this.DIRTY_NONE) {
            if (dirtyFlag & this.DIRTY_FIXED_PRIORITY)
                this._sortListenersOfFixedPriority(listenerID);

            if (dirtyFlag & this.DIRTY_SCENE_GRAPH_PRIORITY)
                this._sortListenersOfSceneGraphPriority(listenerID);

            this._priorityDirtyFlagMap[listenerID] = this.DIRTY_NONE;
        }
    },

    _sortListenersOfSceneGraphPriority: function (listenerID) {
        var listeners = this._getListeners(listenerID);
        if (!listeners)
            return;

        var sceneGraphListener = listeners.getSceneGraphPriorityListeners();
        if(!sceneGraphListener || sceneGraphListener.length === 0)
            return;

        var rootNode = cc.director.getRunningScene();
        // Reset priority index
        this._nodePriorityIndex = 0;
        this._nodePriorityMap = {};

        this._visitTarget(rootNode, true);

        // After sort: priority < 0, > 0
        listeners.getSceneGraphPriorityListeners().sort(this._sortEventListenersOfSceneGraphPriorityDes);
    },

    _sortEventListenersOfSceneGraphPriorityDes : function(l1, l2){
        var locNodePriorityMap = cc.eventManager._nodePriorityMap;
        return locNodePriorityMap[l2._getSceneGraphPriority().__instanceId] - locNodePriorityMap[l1._getSceneGraphPriority().__instanceId];
    },

    _sortListenersOfFixedPriority: function (listenerID) {
        var listeners = this._listenersMap[listenerID];
        if (!listeners)
            return;

        var fixedListeners = listeners.getFixedPriorityListeners();
        if(!fixedListeners || fixedListeners.length === 0)
            return;
        // After sort: priority < 0, > 0
        fixedListeners.sort(this._sortListenersOfFixedPriorityAsc);

        // FIXME: Should use binary search
        var index = 0;
        for (var len = fixedListeners.length; index < len;) {
            if (fixedListeners[index]._getFixedPriority() >= 0)
                break;
            ++index;
        }
        listeners.gt0Index = index;
    },

    _sortListenersOfFixedPriorityAsc: function (l1, l2) {
        return l1._getFixedPriority() - l2._getFixedPriority();
    },

    _onUpdateListeners: function (listenerID) {
        var listeners = this._listenersMap[listenerID];
        if (!listeners)
            return;

        var fixedPriorityListeners = listeners.getFixedPriorityListeners();
        var sceneGraphPriorityListeners = listeners.getSceneGraphPriorityListeners();
        var i, selListener;

        if (sceneGraphPriorityListeners) {
            for (i = 0; i < sceneGraphPriorityListeners.length;) {
                selListener = sceneGraphPriorityListeners[i];
                if (!selListener._isRegistered()) {
                    cc.arrayRemoveObject(sceneGraphPriorityListeners, selListener);
                } else
                    ++i;
            }
        }

        if (fixedPriorityListeners) {
            for (i = 0; i < fixedPriorityListeners.length;) {
                selListener = fixedPriorityListeners[i];
                if (!selListener._isRegistered())
                    cc.arrayRemoveObject(fixedPriorityListeners, selListener);
                else
                    ++i;
            }
        }

        if (sceneGraphPriorityListeners && sceneGraphPriorityListeners.length === 0)
            listeners.clearSceneGraphListeners();

        if (fixedPriorityListeners && fixedPriorityListeners.length === 0)
            listeners.clearFixedListeners();
    },

    _updateListeners: function (event) {
        var locInDispatch = this._inDispatch;
        cc.assert(locInDispatch > 0, "If program goes here, there should be event in dispatch.");
        if (event.getType() == cc.Event.TOUCH) {
            this._onUpdateListeners(cc._EventListenerTouchOneByOne.LISTENER_ID);
            this._onUpdateListeners(cc._EventListenerTouchAllAtOnce.LISTENER_ID);
        } else
            this._onUpdateListeners(cc.__getListenerID(event));

        if(locInDispatch > 1)
            return;

        cc.assert(locInDispatch == 1, "_inDispatch should be 1 here.");
        var locListenersMap = this._listenersMap, locPriorityDirtyFlagMap = this._priorityDirtyFlagMap;
        for( var selKey in locListenersMap ){
             if(locListenersMap[selKey].empty()){
                 delete locPriorityDirtyFlagMap[selKey];
                 delete locListenersMap[selKey];
             }
        }

        var locToAddedListeners = this._toAddedListeners;
        if (locToAddedListeners.length !== 0) {
            for (var i = 0, len = locToAddedListeners.length; i < len; i++)
                this._forceAddEventListener(locToAddedListeners[i]);
            this._toAddedListeners.length = 0;
        }
    },

    _onTouchEventCallback: function(listener, argsObj){
        // Skip if the listener was removed.
        if (!listener._isRegistered)
            return false;

        var event = argsObj.event, selTouch = argsObj.selTouch;
        event._setCurrentTarget(listener._node);

        var isClaimed = false, removedIdx;
        var getCode = event.getEventCode(), eventCode = cc.EventTouch.EventCode;
        if (getCode == eventCode.BEGAN) {
            if (listener.onTouchBegan) {
                isClaimed = listener.onTouchBegan(selTouch, event);
                if (isClaimed && listener._registered)
                    listener._claimedTouches.push(selTouch);
            }
        } else if (listener._claimedTouches.length > 0
            && ((removedIdx = listener._claimedTouches.indexOf(selTouch)) != -1)) {
            isClaimed = true;
            switch (getCode) {
                case eventCode.MOVED:
                    if (listener.onTouchMoved)
                        listener.onTouchMoved(selTouch, event);
                    break;
                case eventCode.ENDED:
                    if (listener.onTouchEnded)
                        listener.onTouchEnded(selTouch, event);
                    if (listener._registered)
                        listener._claimedTouches.splice(removedIdx, 1);
                    break;
                case eventCode.CANCELLED:
                    if (listener.onTouchCancelled)
                        listener.onTouchCancelled(selTouch, event);
                    if (listener._registered)
                        listener._claimedTouches.splice(removedIdx, 1)
                    break;
                default:
                    cc.log("The event code is invalid.");
                    break;
            }
        }

        // If the event was stopped, return directly.
        if (event.isStopped()) {
            cc.eventManager._updateListeners(event);
            return true;
        }

        if (isClaimed && listener._registered && listener.swallowTouches) {
            if (argsObj.needsMutableSet)
                argsObj.touches.splice(selTouch, 1)
            return true;
        }
        return false;
    },

    _dispatchTouchEvent: function (event) {
        this._sortEventListeners(cc._EventListenerTouchOneByOne.LISTENER_ID);
        this._sortEventListeners(cc._EventListenerTouchAllAtOnce.LISTENER_ID);

        var oneByOneListeners = this._getListeners(cc._EventListenerTouchOneByOne.LISTENER_ID);
        var allAtOnceListeners = this._getListeners(cc._EventListenerTouchAllAtOnce.LISTENER_ID);

        // If there aren't any touch listeners, return directly.
        if (null == oneByOneListeners && null == allAtOnceListeners)
            return;

        var originalTouches = event.getTouches(), mutableTouches = cc.copyArray(originalTouches);
        var oneByOneArgsObj = {event: event, needsMutableSet: (oneByOneListeners && allAtOnceListeners), touches: mutableTouches, selTouch: null};

        //
        // process the target handlers 1st
        //
        if (oneByOneListeners) {
            for (var i = 0; i < originalTouches.length; i++) {
                oneByOneArgsObj.selTouch = originalTouches[i];
                this._dispatchEventToListeners(oneByOneListeners, this._onTouchEventCallback, oneByOneArgsObj);
                if (event.isStopped())
                    return;
            }
        }

        //
        // process standard handlers 2nd
        //
        if (allAtOnceListeners && mutableTouches.length > 0) {
            this._dispatchEventToListeners(allAtOnceListeners, this._onTouchesEventCallback, {event: event, touches: mutableTouches});
            if (event.isStopped())
                return;
        }
        this._updateListeners(event);
    },

    _onTouchesEventCallback: function (listener, callbackParams) {
        // Skip if the listener was removed.
        if (!listener._registered)
            return false;

        var eventCode = cc.EventTouch.EventCode, event = callbackParams.event, touches = callbackParams.touches;
        event._setCurrentTarget(listener._node);

        switch (event.getEventCode()) {
            case eventCode.BEGAN:
                if (listener.onTouchesBegan)
                    listener.onTouchesBegan(touches, event);
                break;
            case eventCode.MOVED:
                if (listener.onTouchesMoved)
                    listener.onTouchesMoved(touches, event);
                break;
            case eventCode.ENDED:
                if (listener.onTouchesEnded)
                    listener.onTouchesEnded(touches, event);
                break;
            case eventCode.CANCELLED:
                if (listener.onTouchesCancelled)
                    listener.onTouchesCancelled(touches, event);
                break;
            default:
                cc.log("The event code is invalid.");
                break;
        }

        // If the event was stopped, return directly.
        if (event.isStopped()) {
            cc.eventManager._updateListeners(event);
            return true;
        }
        return false;
    },

    _associateNodeAndEventListener: function (node, listener) {
        var listeners = this._nodeListenersMap[node.__instanceId];
        if (!listeners) {
            listeners = [];
            this._nodeListenersMap[node.__instanceId] = listeners;
        }
        listeners.push(listener);
    },

    _dissociateNodeAndEventListener: function (node, listener) {
        var listeners = this._nodeListenersMap[node.__instanceId];
        if (listeners) {
            cc.arrayRemoveObject(listeners, listener);
            if (listeners.length === 0)
                delete this._nodeListenersMap[node.__instanceId];
        }
    },

    _dispatchEventToListeners: function (listeners, onEvent, eventOrArgs) {
        var shouldStopPropagation = false;
        var fixedPriorityListeners = listeners.getFixedPriorityListeners();
        var sceneGraphPriorityListeners = listeners.getSceneGraphPriorityListeners();

        var i = 0, j, selListener;
        if (fixedPriorityListeners) {  // priority < 0
            if (fixedPriorityListeners.length !== 0) {
                for (; i < listeners.gt0Index; ++i) {
                    selListener = fixedPriorityListeners[i];
                    if (!selListener._isPaused() && selListener._isRegistered() && onEvent(selListener, eventOrArgs)) {
                        shouldStopPropagation = true;
                        break;
                    }
                }
            }
        }

        if (sceneGraphPriorityListeners && !shouldStopPropagation) {    // priority == 0, scene graph priority
            for (j = 0; j < sceneGraphPriorityListeners.length; j++) {
                selListener = sceneGraphPriorityListeners[j];
                if (!selListener._isPaused() && selListener._isRegistered() && onEvent(selListener, eventOrArgs)) {
                    shouldStopPropagation = true;
                    break;
                }
            }
        }

        if (fixedPriorityListeners && !shouldStopPropagation) {    // priority > 0
            for (; i < fixedPriorityListeners.length; ++i) {
                selListener = fixedPriorityListeners[i];
                if (!selListener._isPaused() && selListener._isRegistered() && onEvent(selListener, eventOrArgs)) {
                    shouldStopPropagation = true;
                    break;
                }
            }
        }
    },

    _setDirty: function (listenerID, flag) {
        var locDirtyFlagMap = this._priorityDirtyFlagMap;
        if (locDirtyFlagMap[listenerID] == null)
            locDirtyFlagMap[listenerID] = flag;
        else
            locDirtyFlagMap[listenerID] = flag | locDirtyFlagMap[listenerID];
    },

    _visitTarget: function (node, isRootNode) {
        var i = 0;
        var children = node.getChildren();
        var childrenCount = children.length;
        var locGlobalZOrderNodeMap = this._globalZOrderNodeMap, locNodeListenersMap = this._nodeListenersMap;

        if (childrenCount > 0) {
            var child;
            // visit children zOrder < 0
            for (; i < childrenCount; i++) {
                child = children[i];
                if (child && child.getLocalZOrder() < 0)
                    this._visitTarget(child, false);
                else
                    break;
            }

            if (locNodeListenersMap[node.__instanceId] != null) {
                if (!locGlobalZOrderNodeMap[node.getGlobalZOrder()])
                    locGlobalZOrderNodeMap[node.getGlobalZOrder()] = [];
                locGlobalZOrderNodeMap[node.getGlobalZOrder()].push(node.__instanceId);
            }

            for (; i < childrenCount; i++) {
                child = children[i];
                if (child)
                    this._visitTarget(child, false);
            }
        } else {
            if (locNodeListenersMap[node.__instanceId] != null) {
                if (!locGlobalZOrderNodeMap[node.getGlobalZOrder()])
                    locGlobalZOrderNodeMap[node.getGlobalZOrder()] = [];
                locGlobalZOrderNodeMap[node.getGlobalZOrder()].push(node.__instanceId);
            }
        }

        if (isRootNode) {
            var globalZOrders = [];
            for (var selKey in locGlobalZOrderNodeMap)
                globalZOrders.push(selKey);

            globalZOrders.sort(this._sortNumberAsc);

            var zOrdersLen = globalZOrders.length, selZOrders, j, locNodePriorityMap = this._nodePriorityMap;
            for (i = 0; i < zOrdersLen; i++) {
                selZOrders = locGlobalZOrderNodeMap[globalZOrders[i]];
                for (j = 0; j < selZOrders.length; j++)
                    locNodePriorityMap[selZOrders[j]] = ++this._nodePriorityIndex;
            }
            this._globalZOrderNodeMap = {};
        }
    },

    _sortNumberAsc : function (a, b) {
        return a - b;
    },

    /**
     * <p>
     * Adds a event listener for a specified event.                                                                                                            <br/>
     * if the parameter "nodeOrPriority" is a node, it means to add a event listener for a specified event with the priority of scene graph.                   <br/>
     * if the parameter "nodeOrPriority" is a Number, it means to add a event listener for a specified event with the fixed priority.                          <br/>
     * </p>
     * @param {cc.EventListener|Object} listener The listener of a specified event or a object of some event parameters.
     * @param {cc.Node|Number} nodeOrPriority The priority of the listener is based on the draw order of this node or fixedPriority The fixed priority of the listener.
     * @note  The priority of scene graph will be fixed value 0. So the order of listener item in the vector will be ' <0, scene graph (0 priority), >0'.
     *         A lower priority will be called before the ones that have a higher value. 0 priority is forbidden for fixed priority since it's used for scene graph based priority.
     *         The listener must be a cc.EventListener object when adding a fixed priority listener, because we can't remove a fixed priority listener without the listener handler,
     *         except calls removeAllListeners().
     */
    addListener: function (listener, nodeOrPriority) {
        if (!listener || !nodeOrPriority)
            throw "Invalid parameters.";

        if(!(listener instanceof cc.EventListener)){
            if(typeof(nodeOrPriority) === "number")
                throw "listener must be a cc.EventListener object when adding a fixed priority listener";
            listener = cc.EventListener.create(listener);
        } else{
            if (listener._isRegistered())
                throw "The listener has been registered.";
        }

        if (!listener.checkAvailable())
            return;

        if (typeof nodeOrPriority == "number") {
            if (nodeOrPriority == 0) {
                cc.log("0 priority is forbidden for fixed priority since it's used for scene graph based priority.");
                return;
            }

            listener._setSceneGraphPriority(null);
            listener._setFixedPriority(nodeOrPriority);
            listener._setRegistered(true);
            listener._setPaused(false);
            this._addListener(listener);
        } else {
            listener._setSceneGraphPriority(nodeOrPriority);
            listener._setFixedPriority(0);
            listener._setRegistered(true);
            this._addListener(listener);
        }
    },

    /**
     * Adds a Custom event listener. It will use a fixed priority of 1.
     * @param {string} eventName
     * @param {function} callback
     * @return {cc.EventListener} the generated event. Needed in order to remove the event from the dispatcher
     */
    addCustomListener: function (eventName, callback) {
        var listener = cc._EventListenerCustom.create(eventName, callback);
        this.addListener(listener, 1);
        return listener;
    },

    /**
     * Remove a listener
     * @param {cc.EventListener} listener an event listener or a registered node target
     */
    removeListener: function (listener) {
        if (listener == null)
            return;

        var isFound, locListener = this._listenersMap;
        for (var selKey in locListener) {
            var listeners = locListener[selKey];
            var fixedPriorityListeners = listeners.getFixedPriorityListeners();
            var sceneGraphPriorityListeners = listeners.getSceneGraphPriorityListeners();

            isFound = this._removeListenerInVector(sceneGraphPriorityListeners, listener);
            if (isFound){
                // fixed #4160: Dirty flag need to be updated after listeners were removed.
               this._setDirty(listener._getListenerID(), this.DIRTY_SCENE_GRAPH_PRIORITY);
            }else{
                isFound = this._removeListenerInVector(fixedPriorityListeners, listener);
                if (isFound)
                    this._setDirty(listener._getListenerID(), this.DIRTY_FIXED_PRIORITY);
            }

            if (listeners.empty()) {
                delete this._priorityDirtyFlagMap[listener._getListenerID()];
                delete locListener[selKey];
            }

            if (isFound)
                break;
        }

        if (!isFound) {
            var locToAddedListeners = this._toAddedListeners;
            for (var i = 0, len = locToAddedListeners.length; i < len; i++) {
                var selListener = locToAddedListeners[i];
                if (selListener == listener) {
                    cc.arrayRemoveObject(locToAddedListeners, selListener);
                    break;
                }
            }
        }
    },

    _removeListenerInVector : function(listeners, listener){
        if (listeners == null)
            return false;

        for (var i = 0, len = listeners.length; i < len; i++) {
            var selListener = listeners[i];
            if (selListener == listener) {
                selListener._setRegistered(false);
                if (selListener._getSceneGraphPriority() != null)
                    this._dissociateNodeAndEventListener(selListener._getSceneGraphPriority(), selListener);

                if (this._inDispatch == 0)
                    cc.arrayRemoveObject(listeners, selListener);
                return true;
            }
        }
        return false;
    },

    /**
     * Removes all listeners with the same event listener type or removes all listeners of a node
     * @param {Number|cc.Node} listenerType or a node
     * @param {Boolean} [recursive=false]
     */
    removeListeners: function (listenerType, recursive) {
        if (listenerType instanceof cc.Node) {
            var listeners = this._nodeListenersMap[listenerType.__instanceId];
            if (!listeners)
                return;

            var listenersCopy = cc.copyArray(listeners);
            for (var i = 0; i < listenersCopy.length; i++)
                this.removeListener(listenersCopy[i]);
            listenersCopy.length = 0;
        } else {
            if (listenerType == cc.EventListener.TOUCH_ONE_BY_ONE)
                this._removeListenersForListenerID(cc._EventListenerTouchOneByOne.LISTENER_ID);
            else if (listenerType == cc.EventListener.TOUCH_ALL_AT_ONCE)
                this._removeListenersForListenerID(cc._EventListenerTouchAllAtOnce.LISTENER_ID);
            else if (listenerType == cc.EventListener.MOUSE)
                this._removeListenersForListenerID(cc._EventListenerMouse.LISTENER_ID);
            else if (listenerType == cc.EventListener.ACCELERATION)
                this._removeListenersForListenerID(cc._EventListenerAcceleration.LISTENER_ID);
            else if (listenerType == cc.EventListener.KEYBOARD)
                this._removeListenersForListenerID(cc._EventListenerKeyboard.LISTENER_ID);
            else
                cc.log("Invalid listener type!");
        }
    },

    /**
     * Removes all custom listeners with the same event name
     * @param {string} customEventName
     */
    removeCustomListeners: function (customEventName) {
        this._removeListenersForListenerID(customEventName);
    },

    /**
     * Removes all listeners
     */
    removeAllListeners: function () {
        var locListeners = this._listenersMap, locInternalCustomEventIDs = this._internalCustomListenerIDs;
        for (var selKey in locListeners){
            if(locInternalCustomEventIDs.indexOf(selKey) === -1)
                this._removeListenersForListenerID(selKey);
        }
    },

    /**
     * Sets listener's priority with fixed value.
     * @param {cc.EventListener} listener
     * @param {Number} fixedPriority
     */
    setPriority: function (listener, fixedPriority) {
        if (listener == null)
            return;

        var locListeners = this._listenersMap;
        for (var selKey in locListeners) {
            var selListeners = locListeners[selKey];
            var fixedPriorityListeners = selListeners.getFixedPriorityListeners();
            if (fixedPriorityListeners) {
                var found = fixedPriorityListeners.indexOf(listener);
                if (found != -1) {
                    if(listener._getSceneGraphPriority() != null)
                        cc.log("Can't set fixed priority with scene graph based listener.");
                    if (listener._getFixedPriority() !== fixedPriority) {
                        listener._setFixedPriority(fixedPriority);
                        this._setDirty(listener._getListenerID(), this.DIRTY_FIXED_PRIORITY);
                    }
                    return;
                }
            }
        }
    },

    /**
     * Whether to enable dispatching events
     * @param {boolean} enabled
     */
    setEnabled: function (enabled) {
        this._isEnabled = enabled;
    },

    /**
     * Checks whether dispatching events is enabled
     * @returns {boolean}
     */
    isEnabled: function () {
        return this._isEnabled;
    },

    /**
     * Dispatches the event, also removes all EventListeners marked for deletion from the event dispatcher list.
     * @param {cc.Event} event
     */
    dispatchEvent: function (event) {
        if (!this._isEnabled)
            return;

        this._updateDirtyFlagForSceneGraph();
        this._inDispatch++;
        if (event.getType() == cc.Event.TOUCH) {
            this._dispatchTouchEvent(event);
            this._inDispatch--;
            return;
        }

        var listenerID = cc.__getListenerID(event);
        this._sortEventListeners(listenerID);
        var selListeners = this._listenersMap[listenerID];
        if (selListeners != null)
            this._dispatchEventToListeners(selListeners, this._onListenerCallback, event);

        this._updateListeners(event);
        this._inDispatch--;
    },

    _onListenerCallback: function(listener, event){
        event._setCurrentTarget(listener._getSceneGraphPriority());
        listener._onEvent(event);
        return event.isStopped();
    },

    /**
     * Dispatches a Custom Event with a event name an optional user data
     * @param {string} eventName
     * @param {*} optionalUserData
     */
    dispatchCustomEvent: function (eventName, optionalUserData) {
        var ev = new cc.EventCustom(eventName);
        ev.setUserData(optionalUserData);
        this.dispatchEvent(ev);
    }
};