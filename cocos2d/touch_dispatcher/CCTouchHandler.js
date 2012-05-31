/****************************************************************************
 Copyright (c) 2010-2012 cocos2d-x.org
 Copyright (c) 2008-2010 Ricardo Quesada
 Copyright (c) 2011      Zynga Inc.

 http://www.cocos2d-x.org

 Created by JetBrains WebStorm.
 User: wuhao
 Date: 12-3-5

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

var cc = cc = cc || {};

/**
 CCTouchHandler
 Object than contains the delegate and priority of the event handler.
 */
cc.TouchHandler = cc.Class.extend({
    _delegate:null,
    _priority:0,
    _enabledSelectors:0,

    /** delegate */
    getDelegate:function () {
        return this._delegate;
    },
    setDelegate:function (delegate) {
        this._delegate = delegate;
    },

    /** priority */
    getPriority:function () {
        return this._priority;
    },
    setPriority:function (priority) {
        this._priority = priority;
    },

    /** enabled selectors */
    getEnabledSelectors:function () {
        return this._enabledSelectors;
    },
    setEnalbedSelectors:function (nValue) {
        this._enabledSelectors = nValue;
    },

    /** initializes a TouchHandler with a delegate and a priority */
    initWithDelegate:function (delegate, priority) {
        cc.Assert(delegate != null, "TouchHandler.initWithDelegate():touch delegate should not be null");

        this._delegate = delegate;

        this._priority = priority;
        this._enabledSelectors = 0;

        return true;
    }
});

/** allocates a TouchHandler with a delegate and a priority */
cc.TouchHandler.handlerWithDelegate = function (delegate, priority) {
    var handler = new cc.TouchHandler();

    if (handler) {
        handler.initWithDelegate(delegate, priority);
    }

    return handler;
};

/**
 * CCStandardTouchHandler
 It forwardes each event to the delegate.
 */
cc.StandardTouchHandler = cc.TouchHandler.extend({
    /** initializes a TouchHandler with a delegate and a priority */
    initWithDelegate:function (delegate, priority) {
        if (this._super(delegate, priority)) {
            return true;
        }
        return false;
    }
});

/** allocates a TouchHandler with a delegate and a priority */
cc.StandardTouchHandler.handlerWithDelegate = function (delegate, priority) {
    var handler = new cc.StandardTouchHandler();

    if (handler) {
        handler.initWithDelegate(delegate, priority);
    }

    return handler;
};

cc.TargetedTouchHandler = cc.TouchHandler.extend({
    _swallowsTouches:false,
    _claimedTouches:null,

    /** whether or not the touches are swallowed */
    isSwallowsTouches:function () {
        return this._swallowsTouches;
    },
    setSwallowsTouches:function (swallowsTouches) {
        this._swallowsTouches = swallowsTouches;
    },

    /** MutableSet that contains the claimed touches */
    getClaimedTouches:function () {
        return this._claimedTouches;
    },

    /** initializes a TargetedTouchHandler with a delegate, a priority and whether or not it swallows touches or not */
    initWithDelegate:function (delegate, priority, bSwallow) {
        if (this._super(delegate, priority)) {
            this._claimedTouches = [];
            this._swallowsTouches = bSwallow;

            return true;
        }
        return false;
    }
});

/** allocates a TargetedTouchHandler with a delegate, a priority and whether or not it swallows touches or not */
cc.TargetedTouchHandler.handlerWithDelegate = function (delegate, priority, bSwallow) {
    var handler = new cc.TargetedTouchHandler();

    if (handler) {
        handler.initWithDelegate(delegate, priority, bSwallow);
    }

    return handler;
};