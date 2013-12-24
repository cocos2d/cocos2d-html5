/****************************************************************************
 Copyright (c) 2010-2012 cocos2d-x.org
 Copyright (c) 2008-2010 Ricardo Quesada
 Copyright (c) 2011      Zynga Inc.

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
 * cc.TouchHandler
 * Object than contains the delegate and priority of the event handler.
 * @class
 * @extends cc.Class
 */
cc.TouchHandler = cc.Class.extend(/** @lends cc.TouchHandler# */{
    _delegate:null,
    _priority:0,
    _enabledSelectors:0,

    /**
     * @return {cc.TouchDelegate}
     */
    getDelegate:function () {
        return this._delegate;
    },

    /**
     * @param {cc.TouchDelegate} delegate
     */
    setDelegate:function (delegate) {
        this._delegate = delegate;
    },

    /**
     * @return {Number}
     */
    getPriority:function () {
        return this._priority;
    },

    /**
     * @param {Number} priority
     */
    setPriority:function (priority) {
        this._priority = priority;
    },

    /**
     *  Enabled selectors
     * @return {Number}
     */
    getEnabledSelectors:function () {
        return this._enabledSelectors;
    },

    /**
     * @param {Number} value
     */
    setEnalbedSelectors:function (value) {
        this._enabledSelectors = value;
    },

    /**
     * initializes a TouchHandler with a delegate and a priority
     * @param {cc.TouchDelegate} delegate
     * @param {Number} priority
     * @return {Boolean}
     */
    initWithDelegate:function (delegate, priority) {
        if(!delegate)
             throw "cc.TouchHandler.initWithDelegate(): touch delegate should not be null";
        this._delegate = delegate;
        this._priority = priority;
        this._enabledSelectors = 0;
        return true;
    }
});

/**
 *  Create a TouchHandler with a delegate and a priority
 * @param {cc.TouchDelegate} delegate
 * @param {Number} priority
 * @return {cc.TouchHandler}
 */
cc.TouchHandler.create = function (delegate, priority) {
    var handler = new cc.TouchHandler();
    if (handler) {
        handler.initWithDelegate(delegate, priority);
    }
    return handler;
};

/**
 * cc.StandardTouchHandler
 * It forwardes each event to the delegate.
 * @class
 * @extends cc.TouchHandler
 */
cc.StandardTouchHandler = cc.TouchHandler.extend(/** @lends cc.StandardTouchHandler# */{
    /**
     * Initializes a TouchHandler with a delegate and a priority
     * @param {cc.TouchDelegate} delegate
     * @param {Number} priority
     * @return {Boolean}
     */
    initWithDelegate:function (delegate, priority) {
        return cc.TouchHandler.prototype.initWithDelegate.call(this, delegate, priority);
    }
});

/**
 * Create a TouchHandler with a delegate and a priority
 * @param {Object} delegate
 * @param {Number} priority
 * @return {cc.StandardTouchHandler}
 */
cc.StandardTouchHandler.create = function (delegate, priority) {
    var handler = new cc.StandardTouchHandler();
    if (handler) {
        handler.initWithDelegate(delegate, priority);
    }
    return handler;
};

/**
 * @class
 * @extends cc.TouchHandler
 */
cc.TargetedTouchHandler = cc.TouchHandler.extend(/** @lends cc.TargetedTouchHandler# */{
    _swallowsTouches:false,
    _claimedTouches:null,

    /**
     * Whether or not the touches are swallowed
     * @return {Boolean}
     */
    isSwallowsTouches:function () {
        return this._swallowsTouches;
    },

    /**
     * @param {Boolean} swallowsTouches
     */
    setSwallowsTouches:function (swallowsTouches) {
        this._swallowsTouches = swallowsTouches;
    },

    /**
     * MutableSet that contains the claimed touches
     * @return {Array}
     */
    getClaimedTouches:function () {
        return this._claimedTouches;
    },

    /**
     * Initializes a TargetedTouchHandler with a delegate, a priority and whether or not it swallows touches or not
     * @param {cc.TouchDelegate} delegate
     * @param {Number} priority
     * @param {Boolean} swallow
     * @return {Boolean}
     */
    initWithDelegate:function (delegate, priority, swallow) {
        if (cc.TouchHandler.prototype.initWithDelegate.call(this, delegate, priority)) {
            this._claimedTouches = [];
            this._swallowsTouches = swallow;
            return true;
        }
        return false;
    }
});

/**
 * Create a TargetedTouchHandler with a delegate, a priority and whether or not it swallows touches or not
 * @param {Object} delegate
 * @param {Number} priority
 * @param {Boolean} swallow
 * @return {cc.TargetedTouchHandler}
 */
cc.TargetedTouchHandler.create = function (delegate, priority, swallow) {
    var handler = new cc.TargetedTouchHandler();
    if (handler) {
        handler.initWithDelegate(delegate, priority, swallow);
    }
    return handler;
};
