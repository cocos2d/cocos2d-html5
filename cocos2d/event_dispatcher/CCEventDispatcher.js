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
    _gt0Index: 0,

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

    push_back: function (listener) {
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
    },

    getGt0Index: function () {
        return this._gt0Index;
    },

    setGt0Index: function (index) {
        this._gt0Index = index;
    }
});

/**
 * <p>
 *  This class manages event listener subscriptions and event dispatching.                                      <br/>
 *                                                                                                              <br/>
 *  The EventListener list is managed in such a way that event listeners can be added and removed even          <br/>
 *  from within an EventListener, while events are being dispatched.
 * </p>
 * @class
 * @extends cc.Class
 */
cc.EventDispatcher = cc.Class.extend(/** @lends cc.EventDispatcher# */{
    _listenersMap: null,
    _priorityDirtyFlagMap: null,
    _nodeListenersMap: null,
    _nodePriorityMap: null,
    _globalZOrderNodeMap:null,
    _toAddedListeners: null,
    _dirtyNodes: null,
    _inDispatch: 0,
    _isEnabled: false,
    _nodePriorityIndex: 0,

    ctor: function () {
        this._listenersMap = {};
        this._priorityDirtyFlagMap = {};
        this._nodeListenersMap = {};
        this._nodePriorityMap = {};
        this._globalZOrderNodeMap = {};

        this._toAddedListeners = [];
        this._dirtyNodes = [];
    },

    _setDirtyForNode: function (node) {
        // Mark the node dirty only when there is an eventlistener associated with it.
        if (this._nodeListenersMap[node.__instanceId] != null)
            this._dirtyNodes.push(node);
    },

    _pauseTarget: function (node) {
        var listeners = this._nodeListenersMap[node.__instanceId];
        if (!listeners)
            return;

        for (var i = 0; i < listeners.length; i++)
            listeners[i]._setPaused(true);
    },

    _resumeTarget: function (node) {
        var listeners = this._nodeListenersMap[node.__instanceId];
        if (!listeners)
            return;

        for (var i = 0; i < listeners.length; i++)
            listeners[i]._setPaused(false);
        this._setDirtyForNode(node);
    },

    _cleanTarget: function (node) {
        var listeners = this._nodeListenersMap[node.__instanceId];
        if (!listeners)
            return;

        var listenersCopy = listeners;              // TODO Copy an array                why?
        for (var i = 0; i < listenersCopy.length; i++)
            this.removeEventListener(listenersCopy[i]);
    },

    _addEventListener: function (listener) {
        if (this._inDispatch == 0)
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
        listeners.push_back(listener);

        if (listener._getFixedPriority() == 0) {
            this._setDirty(listenerID, cc.EventDispatcher.DirtyFlag.SCENE_GRAPH_PRIORITY);

            var node = listener._getSceneGraphPriority();
            if (node == null)
                cc.log("Invalid scene graph priority!");

            this._associateNodeAndEventListener(node, listener);
            if (node.isRunning())
                this._resumeTarget(node);
        } else
            this._setDirty(listenerID, cc.EventDispatcher.DirtyFlag.FIXED_PRIORITY);
    },

    _getListeners: function (listenerID) {
        return this._listenersMap[listenerID];
    },

    _updateDirtyFlagForSceneGraph: function () {
        if (this._dirtyNodes.length == 0)
            return;

        var locDirtyNodes = this._dirtyNodes, selListeners, selListener;
        for (var i = 0, len = locDirtyNodes.length; i < len; i++) {
            selListeners = locDirtyNodes[i];
            if (selListeners) {
                for (var j = 0, listenersLen = selListeners.length; j < listenersLen; j++) {
                    selListener = selListeners[j];
                    if (selListener)
                        this._setDirty(selListener._getListenerID(), cc.EventDispatcher.DirtyFlag.SCENE_GRAPH_PRIORITY);
                }
            }
        }
        this._dirtyNodes.length = 0;
    },

    _removeEventListenersForListenerID: function (listenerID) {
        var listeners = this._listenersMap[listenerID], i;
        if (listeners) {
            var fixedPriorityListeners = listeners.getFixedPriorityListeners();
            var sceneGraphPriorityListeners = listeners.getSceneGraphPriorityListeners();

            var selPointer = this;
            var removeAllListenersInVector = function (listenerVector) {
                if (!listenerVector)
                    return;
                var selListener;
                for (i = 0; i < listenerVector.length;) {
                    selListener = listenerVector[i];
                    selListener._setRegistered(false);
                    if (selListener._getSceneGraphPriority() != null)
                        this._dissociateNodeAndEventListener(selListener._getSceneGraphPriority(), l);

                    if (selPointer._inDispatch == 0)
                        cc.ArrayRemoveObject(listenerVector, selListener);
                    else
                        ++i;
                }
            };

            removeAllListenersInVector(sceneGraphPriorityListeners);
            removeAllListenersInVector(fixedPriorityListeners);

            if (!this._inDispatch) {
                listeners.clear();
                delete this._listenersMap[listenerID];
                delete this._priorityDirtyFlagMap[listenerID];
            }
        }

        var locToAddedListeners = this._toAddedListeners, listener;
        for (i = 0; i < locToAddedListeners.length;) {
            listener = locToAddedListeners[i];
            if (listener && listener._getListenerID == listenerID)
                cc.ArrayRemoveObject(locToAddedListeners, listener);
            else
                ++i;
        }
    },

    _sortEventListeners: function (listenerID) {
        var locDirtyFlag = cc.EventDispatcher.DirtyFlag;
        var dirtyFlag = locDirtyFlag.NONE;
        if (this._priorityDirtyFlagMap[listenerID])
            dirtyFlag = this._priorityDirtyFlagMap[listenerID];

        if (dirtyFlag != locDirtyFlag.NONE) {
            if (dirtyFlag & locDirtyFlag.FIXED_PRIORITY)
                this._sortEventListenersOfFixedPriority(listenerID);

            if (dirtyFlag & locDirtyFlag.SCENE_GRAPH_PRIORITY)
                this._sortEventListenersOfSceneGraphPriority(listenerID);

            this._priorityDirtyFlagMap[listenerID] = locDirtyFlag.NONE;
        }
    },

    _sortEventListenersOfSceneGraphPriority: function (listenerID) {
        var listeners = this._getListeners(listenerID);
        if (!listeners)
            return;

        var rootNode = cc.Director.getInstance().getRunningScene();
        // Reset priority index
        this._nodePriorityIndex = 0;
        this._nodePriorityMap = {};

        this._visitTarget(rootNode, true);

        // After sort: priority < 0, > 0
        var sceneGraphListeners = listeners.getSceneGraphPriorityListeners();
        sceneGraphListeners.sort(this._sortEventListenersOfSceneGraphPriorityDes);
    },

    _sortEventListenersOfSceneGraphPriorityDes: function (l1, l2) {
        //TODO need to test
        return this._nodePriorityMap[l2._getSceneGraphPriority()] - this._nodePriorityMap[l1._getSceneGraphPriority()];
    },

    _sortEventListenersOfFixedPriority: function (listenerID) {
        var listeners = this._listenersMap[listenerID];

        if (!listeners)
            return;

        // After sort: priority < 0, > 0
        var fixedListeners = listeners.getFixedPriorityListeners();
        fixedListeners.sort(this._sortEventListenersOfFixedPriorityAsc);

        // FIXME: Should use binary search
        var index = 0;
        for (var len = fixedListeners.length; index < len;) {
            if (fixedListeners[index]._getFixedPriority() >= 0)
                break;
            ++index;
        }
        listeners.setGt0Index(index);
    },

    _sortEventListenersOfFixedPriorityAsc: function (l1, l2) {
        return l1._getFixedPriority() - l2._getFixedPriority();
    },

    _updateListeners: function (event) {
        //TODO
        var onUpdateListeners = function (listenerID) {
            var listeners = this._listenersMap[listenerID];
            if (!listeners)
                return;

            var fixedPriorityListeners = listeners.getFixedPriorityListeners();
            var sceneGraphPriorityListeners = listeners.getSceneGraphPriorityListeners();
            var i, selListener;

            if (sceneGraphPriorityListeners) {
                for (i = 0; i < sceneGraphPriorityListeners.length;) {
                    selListener = sceneGraphPriorityListeners[i];
                    if (selListener._isRegistered()) {
                        cc.ArrayRemoveObject(sceneGraphPriorityListeners, selListener);
                    } else {
                        ++i;
                    }
                }
            }

            if (fixedPriorityListeners) {
                for (i = 0; i < fixedPriorityListeners.length;) {
                    selListener = fixedPriorityListeners[i];
                    if (selListener._isRegistered())
                        cc.ArrayRemoveObject(fixedPriorityListeners, selListener);
                    else
                        ++i;
                }
            }

            if (sceneGraphPriorityListeners && sceneGraphPriorityListeners.length === 0)
                listeners.clearSceneGraphListeners();

            if (fixedPriorityListeners && fixedPriorityListeners.length === 0)
                listeners.clearFixedListeners();

            if (listeners.empty()) {
                delete this._priorityDirtyFlagMap[listenerID];
                delete this._listenersMap[listenerID] ;
            }
        };

        if (event.getType() == Event.Type.TOUCH) {
            onUpdateListeners(cc.EventListenerTouchOneByOne.LISTENER_ID);
            onUpdateListeners(cc.EventListenerTouchAllAtOnce.LISTENER_ID);
        } else {
            //TODO
            onUpdateListeners(this.__getListenerID(event));
        }

        var locToAddedListeners = this._toAddedListeners;
        if (locToAddedListeners.length !== 0) {
            for (var i = 0, len = locToAddedListeners.length; i < len; i++)
                this._forceAddEventListener(locToAddedListeners[i]);
            this._toAddedListeners.length = 0;
        }
    },

    _dispatchTouchEvent: function (event) {
        this._sortEventListeners(cc.EventListenerTouchOneByOne.LISTENER_ID);
        this._sortEventListeners(cc.EventListenerTouchAllAtOnce.LISTENER_ID);

        var oneByOneListeners = this._getListeners(cc.EventListenerTouchOneByOne.LISTENER_ID);
        var allAtOnceListeners = this._getListeners(cc.EventListenerTouchAllAtOnce.LISTENER_ID);

        // If there aren't any touch listeners, return directly.
        if (null == oneByOneListeners && null == allAtOnceListeners)
            return;

        var isNeedsMutableSet = (oneByOneListeners && allAtOnceListeners);

        var originalTouches = event.getTouches();
        //TODO
        var mutableTouches = cc.clone(originalTouches);
        var eventCode = cc.EventTouch.EventCode;
        //
        // process the target handlers 1st
        //
        if (oneByOneListeners) {
            var selMutableTouch = mutableTouches[0];
            var selTouch = originalTouches[0];

            for(var i = 0; i< originalTouches.length; i++){
                var isSwallowed = false;

                var onTouchEvent = function (listener) { // Return true to break
                    // Skip if the listener was removed.
                    if (!listener._isRegistered)
                        return false;

                    event._setCurrentTarget(listener._node);

                    var isClaimed = false;
                    var removedIdx;

                    var eventCode = event.getEventCode();
                    if (eventCode == eventCode.BEGAN) {
                        if (listener.onTouchBegan) {
                            isClaimed = listener.onTouchBegan(selTouch, event);
                            if (isClaimed && listener._registered)
                                listener._claimedTouches.push(selTouch);
                        }
                    } else if (listener._claimedTouches.length > 0
                        && ((removedIdx = listener._claimedTouches.indexOf(selTouch)) != -1)) {
                        isClaimed = true;
                        switch (eventCode) {
                            case eventCode.MOVED:
                                if (listener.onTouchMoved)
                                    listener.onTouchMoved(selTouch, event);
                                break;
                            case eventCode.ENDED:
                                if (listener.onTouchEnded)
                                    listener.onTouchEnded(selTouch, event);
                                if (listener._registered)
                                    cc.ArrayRemoveObjectAtIndex(removedIdx);
                                break;
                            case eventCode.CANCELLED:
                                if (listener.onTouchCancelled)
                                    listener.onTouchCancelled(selTouch, event);
                                if (listener._registered)
                                    cc.ArrayRemoveObjectAtIndex(removedIdx);
                                break;
                            default:
                                cc.assert(false, "The event code is invalid.");
                                break;
                        }
                    }

                    // If the event was stopped, return directly.
                    if (event.isStopped()) {
                        this._updateListeners(event);
                        return true;
                    }

                    cc.assert(selTouch.getID() == selMutableTouch.getID(), " ");
                    if (isClaimed && listener._registered && listener._needSwallow) {
                        if (isNeedsMutableSet) {
                            //TODO
                            mutableTouchesIter = mutableTouches.erase(mutableTouchesIter);
                            isSwallowed = true;
                        }
                        return true;
                    }
                    return false;
                };

                //TODO
                this._dispatchEventToListeners(oneByOneListeners, onTouchEvent);
                if (event.isStopped())
                    return;

                if (!isSwallowed)
                    ++mutableTouchesIter;
            }
        }

        //
        // process standard handlers 2nd
        //
        if (allAtOnceListeners && mutableTouches.length > 0) {
            var onTouchesEvent = function (listener) {
                // Skip if the listener was removed.
                if (!listener._registered)
                    return false;

                event._setCurrentTarget(listener._node);

                switch (event.getEventCode()) {
                    case eventCode.BEGAN:
                        if (listener.onTouchesBegan)
                            listener.onTouchesBegan(mutableTouches, event);
                        break;
                    case eventCode.MOVED:
                        if (listener.onTouchesMoved)
                            listener.onTouchesMoved(mutableTouches, event);
                        break;
                    case eventCode.ENDED:
                        if (listener.onTouchesEnded)
                            listener.onTouchesEnded(mutableTouches, event);
                        break;
                    case eventCode.CANCELLED:
                        if (listener.onTouchesCancelled)
                            listener.onTouchesCancelled(mutableTouches, event);
                        break;
                    default:
                        cc.log("The event code is invalid.");
                        break;
                }

                // If the event was stopped, return directly.
                if (event.isStopped()) {
                    this._updateListeners(event);
                    return true;
                }

                return false;
            };

            this._dispatchEventToListeners(allAtOnceListeners, onTouchesEvent);
            if (event.isStopped())
                return;
        }

        this._updateListeners(event);
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
            cc.ArrayRemoveObject(listeners, listener);
            if (listeners.length === 0)
                delete this._nodeListenersMap[node.__instanceId];
        }
    },

    _dispatchEventToListeners: function (listeners, onEvent) {
        var shouldStopPropagation = false;
        var fixedPriorityListeners = listeners.getFixedPriorityListeners();
        var sceneGraphPriorityListeners = listeners.getSceneGraphPriorityListeners();

        var i = 0, j, len, selListener;
        // priority < 0
        if (fixedPriorityListeners) {
            var isEmpty = fixedPriorityListeners.length === 0;
            for (; !isEmpty && i < listeners.getGt0Index(); ++i) {
                selListener = fixedPriorityListeners[i];
                if (!selListener.isPaused() && selListener._isRegistered() && onEvent(selListener)) {
                    shouldStopPropagation = true;
                    break;
                }
            }
        }

        if (sceneGraphPriorityListeners && !shouldStopPropagation) {
            // priority == 0, scene graph priority
            for (j = 0, len = sceneGraphPriorityListeners.length; j < len; j++) {
                selListener = sceneGraphPriorityListeners[j];
                if (!selListener.isPaused() && selListener._isRegistered() && onEvent(selListener)) {
                    shouldStopPropagation = true;
                    break;
                }
            }
        }

        if (fixedPriorityListeners && !shouldStopPropagation) {
            // priority > 0
            var size = fixedPriorityListeners.length;
            for (; i < size; ++i) {
                selListener = fixedPriorityListeners[i];
                if (!selListener.isPaused() && selListener._isRegistered() && onEvent(selListener)) {
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
        var locGlobalZOrderNodeMap = this._globalZOrderNodeMap;

        if (childrenCount > 0) {
            var child;
            // visit children zOrder < 0
            for (; i < childrenCount; i++) {
                child = children[i];

                //TODO
                if (child && child.getLocalZOrder() < 0)
                    this._visitTarget(child, false);
                else
                    break;
            }

            //TODO
            if (this._nodeListenersMap[node.__instanceId] != null)
                locGlobalZOrderNodeMap[node.getGlobalZOrder()] = node;

            for (; i < childrenCount; i++) {
                child = children[i];
                if (child)
                    this._visitTarget(child, false);
            }
        } else {
            if (this._nodeListenersMap[node.__instanceId] != null) {
                locGlobalZOrderNodeMap[node.getGlobalZOrder()] = node;
            }
        }

        if (isRootNode) {
            var globalZOrders = [];

            for(var selKey in locGlobalZOrderNodeMap)
                 globalZOrders.push(selKey);

            var sortNumberAsc = function(a, b){
                return a - b;
            };
            globalZOrders.sort(sortNumberAsc);

            var zOrdersLen = globalZOrders.length, selZOrders, j;
            for (i = 0; i < zOrdersLen; i++) {
                selZOrders = locGlobalZOrderNodeMap[globalZOrders[i]];
                for (j = 0; j < selZOrders.length; j++)
                    this._nodePriorityMap[selZOrders[j]] = ++this._nodePriorityIndex;
            }

            this._globalZOrderNodeMap = {};
        }
    },

    /**
     * Adds a event listener for a specified event with the priority of scene graph.
     * @param {cc.EventListener} listener The listener of a specified event.
     * @param {cc.Node} node The priority of the listener is based on the draw order of this node.
     * @note  The priority of scene graph will be fixed value 0. So the order of listener item in the vector will be ' <0, scene graph (0 priority), >0'.
     */
    addEventListenerWithSceneGraphPriority: function (listener, node) {
        if (!listener || !node)
            throw "Invalid parameters.";
        if (listener._isRegistered())
            throw "The listener has been registered.";

        if (!listener.checkAvailable())
            return;

        listener._setSceneGraphPriority(node);
        listener._setFixedPriority(0);
        listener._setRegistered(true);

        this._addEventListener(listener);
    },

    /**
     * Adds a event listener for a specified event with the fixed priority.
     * @param {cc.EventListener} listener The listener of a specified event.
     * @param {Number} fixedPriority The fixed priority of the listener.
     * @note A lower priority will be called before the ones that have a higher value. 0 priority is forbidden for fixed priority since it's used for scene graph based priority.
     */
    addEventListenerWithFixedPriority: function (listener, fixedPriority) {
        if (!listener)
            throw "Invalid parameters.";
        if (listener._isRegistered())
            throw "The listener has been registered.";
        if (fixedPriority == 0) {
            cc.log("0 priority is forbidden for fixed priority since it's used for scene graph based priority.");
            return;
        }

        if (!listener.checkAvailable())
            return;

        listener._setSceneGraphPriority(null);
        listener._setFixedPriority(fixedPriority);
        listener._setRegistered(true);
        listener._setPaused(false);

        this._addEventListener(listener);
    },

    /**
     * Adds a Custom event listener. It will use a fixed priority of 1.
     * @param {string} eventName
     * @param {function} callback
     * @return {cc.EventListener} the generated event. Needed in order to remove the event from the dispatcher
     */
    addCustomEventListener: function (eventName, callback) {
        var listener = cc.EventListenerCustom.create(eventName, callback);
        this.addEventListenerWithFixedPriority(listener, 1);
        return listener;
    },

    /**
     * Remove a listener
     * @param {cc.EventListener} listener
     */
    removeEventListener: function (listener) {
        if (listener == null)
            return;

        var isFound = false;

        var removeListenerInVector = function (listeners) {
            if (listeners == null)
                return;

            for (var i = 0, len = listeners.length; i < len; i++) {
                var selListener = listeners[i];
                if (selListener == listener) {
                    selListener._setRegistered(false);
                    if (selListener._getSceneGraphPriority() != null)
                        this._dissociateNodeAndEventListener(selListener._getSceneGraphPriority(), selListener);

                    if (this._inDispatch == 0)
                        cc.ArrayRemoveObject(listeners, selListener);

                    isFound = true;
                    break;
                }
            }
        };

        var locListener = this._listenersMap;
        for (var selKey in locListener) {
            var listeners = locListener[selKey];
            var fixedPriorityListeners = listeners.getFixedPriorityListeners();
            var sceneGraphPriorityListeners = listeners.getSceneGraphPriorityListeners();

            removeListenerInVector(sceneGraphPriorityListeners);
            if (!isFound)
                removeListenerInVector(fixedPriorityListeners);

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
                    cc.ArrayRemoveObject(locToAddedListeners, selListener);
                    break;
                }
            }
        }
    },

    /**
     * Removes all listeners with the same event listener type
     * @param {Number} listenerType
     */
    removeEventListeners: function (listenerType) {
        if (listenerType == cc.EventListener.Type.TOUCH_ONE_BY_ONE)
            this._removeEventListenersForListenerID(cc.EventListenerTouchOneByOne.LISTENER_ID);
        else if (listenerType == cc.EventListener.Type.TOUCH_ALL_AT_ONCE)
            this._removeEventListenersForListenerID(cc.EventListenerTouchAllAtOnce.LISTENER_ID);
        else if (listenerType == cc.EventListener.Type.MOUSE)
            this._removeEventListenersForListenerID(cc.EventListenerMouse.LISTENER_ID);
        else if (listenerType == cc.EventListener.Type.ACCELERATION)
            this._removeEventListenersForListenerID(cc.EventListenerAcceleration.LISTENER_ID);
        else if (listenerType == cc.EventListener.Type.KEYBOARD)
            this._removeEventListenersForListenerID(cc.EventListenerKeyboard.LISTENER_ID);
        else
            cc.log("Invalid listener type!");
    },

    /**
     * Removes all custom listeners with the same event name
     * @param {string} customEventName
     */
    removeCustomEventListeners: function (customEventName) {
        this._removeEventListenersForListenerID(customEventName);
    },

    /**
     * Removes all listeners
     */
    removeAllEventListeners: function () {
        var locListeners = this._listenersMap;
        for (var selKey in locListeners)
            this._removeEventListenersForListenerID(selKey);
        if (!this._inDispatch)
            this._listenersMap = {};
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
                    cc.assert(listener._getSceneGraphPriority() == null, "Can't set fixed priority with scene graph based listener.");

                    if (listener._getFixedPriority() != fixedPriority) {
                        listener._setFixedPriority(fixedPriority);
                        this.setDirty(listener._getListenerID(), cc.EventDispatcher.DirtyFlag.FIXED_PRIORITY);
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

        //TODO
        //DispatchGuard guard(_inDispatch);

        if (event.getType() == cc.Event.Type.TOUCH) {
            this._dispatchTouchEvent(event);
            return;
        }

        //TODO
        var listenerID = this.__getListenerID(event);

        this._sortEventListeners(listenerID);
        var selListeners = this._listenersMap[listenerID];
        if (selListeners != null) {
            var onEvent = function (listener) {
                event._setCurrentTarget(listener._getSceneGraphPriority());
                listener._onEvent(event);
                return event.isStopped();
            };
            this._dispatchEventToListeners(selListeners, onEvent);
        }
        this._updateListeners(event);
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
});

/**
 * Priority dirty flag
 */
cc.EventDispatcher.DirtyFlag = {NONE: 0, FIXED_PRIORITY: 1 << 0, SCENE_GRAPH_PRIORITY: 1 << 1, ALL: 3};