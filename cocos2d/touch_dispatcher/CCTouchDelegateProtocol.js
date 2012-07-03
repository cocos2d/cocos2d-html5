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
 * @class
 * @extends cc.Class
 */
cc.Touch = cc.Class.extend(/** @lends cc.Touch# */{
    _point:null,
    _prevPoint:cc.PointZero(),
    _id:0,

    /**
     * Constructor
     */
    ctor:function (x, y) {
        this._point = new cc.Point(x || 0, y || 0);
    },

    /**
     * get point of touch
     * @return {cc.Point}
     */
    locationInView:function () {
        return this._point;
    },

    /**
     * @return {cc.Point}
     */
    previousLocationInView:function () {
        return this._prevPoint;
    },

    /**
     * @return {Number}
     */
    getID:function () {
        return this._id;
    },

    /**
     * set information to touch
     * @param {Number} id
     * @param  {Number} x
     * @param  {Number} y
     */
    setTouchInfo:function (id, x, y) {
        this._prevPoint = this._point;
        this._point = new cc.Point(x || 0, y || 0);
        this._id = id;
    },

    _setPrevPoint:function (x, y) {
        this._prevPoint = new cc.Point(x || 0, y || 0);
    }
});

/**
 * @class
 * @extends cc.Class
 */
cc.TouchDelegate = cc.Class.extend(/** @lends cc.TouchDelegate# */{
    _eventTypeFuncMap:null,

    /**
     * Virtual function
     * @param {cc.Touch} touch
     * @param {event} event
     * @return {Boolean}
     */
    ccTouchBegan:function (touch, event) {
        return false;
    },

    /**
     * Virtual function
     * @param {cc.Touch} touch
     * @param {event} event
     */
    ccTouchMoved:function (touch, event) {
    },

    /**
     * Virtual function
     * @param {cc.Touch} touch
     * @param {event} event
     */
    ccTouchEnded:function (touch, event) {
    },

    /**
     * Virtual function
     * @param {cc.Touch} touch
     * @param {event} event
     */
    ccTouchCancelled:function (touch, event) {
    },

    /**
     * Virtual function
     * @param {cc.Touch} touch
     * @param {event} event
     */
    ccTouchesBegan:function (touches, event) {
    },

    /**
     * Virtual function
     * @param {cc.Touch} touch
     * @param {event} event
     */
    ccTouchesMoved:function (touches, event) {
    },

    /**
     * Virtual function
     * @param {cc.Touch} touch
     * @param {event} event
     */
    ccTouchesEnded:function (touches, event) {
    },

    /**
     * Virtual function
     * @param {cc.Touch} touch
     * @param {event} event
     */
    ccTouchesCancelled:function (touches, event) {
    },

    /*
     * In TouchesTest, class Padle inherits from cc.Sprite and cc.TargetedTouchDelegate.
     * When it invoke  cc.Director.sharedDirector().getTouchDispatcher().addTargetedDelegate(this, 0, true),
     * it will crash in cc.TouchHandler.initWithDelegate() because of dynamic_cast() on android.
     * I don't know why, so add these functions for the subclass to invoke it's own retain() and  release
     *Virtual function
     */
    touchDelegateRetain:function () {
    },

    /**
     * Virtual function
     */
    touchDelegateRelease:function () {
    }
});

/**
 * Using this type of delegate results in two benefits:
 * - 1. You don't need to deal with cc.Sets, the dispatcher does the job of splitting
 * them. You get exactly one UITouch per call.
 * - 2. You can *claim* a UITouch by returning YES in ccTouchBegan. Updates of claimed
 * touches are sent only to the delegate(s) that claimed them. So if you get a move/
 * ended/cancelled update you're sure it's your touch. This frees you from doing a
 * lot of checks when doing multi-touch.
 *
 * (The name TargetedTouchDelegate relates to updates "targeting" their specific
 * handler, without bothering the other handlers.)
 * @class
 * @extends cc.Class
 */
cc.TargetedTouchDelegate = cc.TouchDelegate.extend(/** @lends cc.TargetedTouchDelegate# */{

    /**
     * Return YES to claim the touch.
     * @param {cc.Touch} touch
     * @param {event} event
     * @return {Boolean}
     */
    ccTouchBegan:function (touch, event) {
        return false;
    },

    /**
     * Virtual function
     * @param {cc.Touch} touch
     * @param {event} event
     */
    ccTouchMoved:function (touch, event) {
    },

    /**
     * Virtual function
     * @param {cc.Touch} touch
     * @param {event} event
     */
    ccTouchEnded:function (touch, event) {
    },

    /**
     * Virtual function
     * @param {cc.Touch} touch
     * @param {event} event
     */
    ccTouchCancelled:function (touch, event) {
    }
});

/**
 * This type of delegate is the same one used by CocoaTouch. You will receive all the events (Began,Moved,Ended,Cancelled).
 * @class
 * @extends cc.Class
 */
cc.StandardTouchDelegate = cc.TouchDelegate.extend(/** @lends cc.StandardTouchDelegate# */{

    /**
     * Virtual function
     * @param {Array} touches
     * @param {event} event
     */
    ccTouchesBegan:function (touches, event) {
    },

    /**
     * Virtual function
     * @param {Array} touches
     * @param {event} event
     */
    ccTouchesMoved:function (touches, event) {
    },

    /**
     * Virtual function
     * @param {Array} touches
     * @param {event} event
     */
    ccTouchesEnded:function (touches, event) {
    },

    /**
     * Virtual function
     * @param {Array} touches
     * @param {event} event
     */
    ccTouchesCancelled:function (touches, event) {
    }
});

