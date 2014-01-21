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

cc.EventDispatcher = cc.Class.extend({
    _listeners: null,
    _priorityDirtyFlagMap:null,
    _nodeListenersMap:null,
    _nodePriorityMap:null,
    _toAddedListeners:null,
    _dirtyNodes:null,
    _inDispatch:0,
    _isEnabled: false,
    _nodePriorityIndex:null,

    ctor: function(){
           cc.p()
    },

    _setDirtyForNode:function(node){

    },

    _pauseTarget: function(node){

    },

    _resumeTarget: function(node){

    },

    _cleanTarget: function(node){

    },

    _addEventListener: function(listener){

    },

    _forceAddEventListener: function(listener){

    },

    _getListeners: function(listenerID){

    },

    _updateDirtyFlagForSceneGraph: function(){

    },

    _removeEventListenersForListenerID: function(listenerID){

    },

    _sortEventListeners: function(listenerID){

    },

    _sortEventListenersOfSceneGraphPriority: function(listenerID){

    },

    _sortEventListenersOfFixedPriority: function(listenerID){

    },

    _updateListeners: function(event){

    },

    _dispatchTouchEvent: function(event){

    },

    _associateNodeAndEventListener: function(node, listener){

    },

    _dissociateNodeAndEventListener: function(node, listener){

    },

    _dispatchEventToListeners: function(listeners, onEvent){

    },

    _setDirty: function(listenerID, flag){

    },

    _visitTarget: function(node){

    },

    addEventListenerWithSceneGraphPriority: function(listener, node){

    },

    addEventListenerWithFixedPriority: function(listener, fixedPriority){

    },

    addCustomEventListener: function(eventName, callback){

    },

    removeEventListener: function(listener){

    },

    removeEventListeners: function(listenerType){

    },

    removeCustomEventListeners: function(customEventName){

    },

    removeAllEventListeners: function(){

    },

    setPriority: function(listener, fixedPriority){

    },

    setEnabled: function(enabled){

    },

    isEnabled: function(){

    },

    dispatchEvent: function(event){

    },

    dispatchCustomEvent: function(eventName, optionalUserData){

    }
});

cc.EventListenerVector = cc.Class.extend({
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