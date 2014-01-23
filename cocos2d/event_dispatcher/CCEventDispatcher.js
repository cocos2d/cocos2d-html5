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
    _listeners: null,
    _priorityDirtyFlagMap: null,
    _nodeListenersMap: null,
    _nodePriorityMap: null,
    _toAddedListeners: null,
    _dirtyNodes: null,
    _inDispatch: 0,
    _isEnabled: false,
    _nodePriorityIndex: null,

    ctor: function () {

    },

    _setDirtyForNode: function (node) {

    },

    _pauseTarget: function (node) {

    },

    _resumeTarget: function (node) {

    },

    _cleanTarget: function (node) {

    },

    _addEventListener: function (listener) {

    },

    _forceAddEventListener: function (listener) {

    },

    _getListeners: function (listenerID) {

    },

    _updateDirtyFlagForSceneGraph: function () {

    },

    _removeEventListenersForListenerID: function (listenerID) {

    },

    _sortEventListeners: function (listenerID) {

    },

    _sortEventListenersOfSceneGraphPriority: function (listenerID) {

    },

    _sortEventListenersOfFixedPriority: function (listenerID) {

    },

    _updateListeners: function (event) {

    },

    _dispatchTouchEvent: function (event) {

    },

    _associateNodeAndEventListener: function (node, listener) {

    },

    _dissociateNodeAndEventListener: function (node, listener) {

    },

    _dispatchEventToListeners: function (listeners, onEvent) {

    },

    _setDirty: function (listenerID, flag) {

    },

    _visitTarget: function (node) {

    },

    /**
     * Adds a event listener for a specified event with the priority of scene graph.
     * @param {cc.EventListener} listener The listener of a specified event.
     * @param {cc.Node} node The priority of the listener is based on the draw order of this node.
     * @note  The priority of scene graph will be fixed value 0. So the order of listener item in the vector will be ' <0, scene graph (0 priority), >0'.
     */
    addEventListenerWithSceneGraphPriority: function (listener, node) {

    },

    /**
     * Adds a event listener for a specified event with the fixed priority.
     * @param {cc.EventListener} listener The listener of a specified event.
     * @param {Number} fixedPriority The fixed priority of the listener.
     * @note A lower priority will be called before the ones that have a higher value. 0 priority is forbidden for fixed priority since it's used for scene graph based priority.
     */
    addEventListenerWithFixedPriority: function (listener, fixedPriority) {

    },

    /**
     * Adds a Custom event listener. It will use a fixed priority of 1.
     * @param {string} eventName
     * @param {function} callback
     * @return the generated event. Needed in order to remove the event from the dispatcher
     */
    addCustomEventListener: function (eventName, callback) {
        return null;
    },

    /**
     * Remove a listener
     * @param {cc.EventListener} listener
     */
    removeEventListener: function (listener) {

    },

    /**
     * Removes all listeners with the same event listener type
     * @param {Number} listenerType
     */
    removeEventListeners: function (listenerType) {

    },

    /**
     * Removes all custom listeners with the same event name
     * @param {string} customEventName
     */
    removeCustomEventListeners: function (customEventName) {

    },

    /**
     * Removes all listeners
     */
    removeAllEventListeners: function () {

    },

    /**
     * Sets listener's priority with fixed value.
     * @param {cc.EventListener} listener
     * @param {Number} fixedPriority
     */
    setPriority: function (listener, fixedPriority) {

    },

    /**
     * Whether to enable dispatching events
     * @param {boolean} enabled
     */
    setEnabled: function (enabled) {

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

    },

    /**
     * Dispatches a Custom Event with a event name an optional user data
     * @param {string} eventName
     * @param {*} optionalUserData
     */
    dispatchCustomEvent: function (eventName, optionalUserData) {

    }
});


cc._EventListenerVector = cc.Class.extend({
    _fixedListeners: null,
    _sceneGraphListeners: null,
    _gt0Index: 0,

    ctor: function () {

    },
    size: function () {

    },
    empty: function () {

    },
    push_back: function (item) {

    },

    clearSceneGraphListeners: function () {

    },

    clearFixedListeners: function () {

    },

    clear: function () {

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
 * Priority dirty flag
 */
cc.EventDispatcher.DirtyFlag = {NONE: 0, FIXED_PRIORITY: 1 << 0, SCENE_GRAPH_PRIORITY: 1 << 1, ALL: 3};