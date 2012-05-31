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

cc.Touch = cc.Class.extend({
    _viewId:0,
    _point:null,
    _prevPoint:cc.PointZero(),
    _id:0,

    ctor:function (viewId, x, y) {
        this._viewId = viewId;
        this._point = new cc.Point(x || 0, y || 0);
    },

    locationInView:function (viewId) {
        return this._point;
    },

    previousLocationInView:function (viewId) {
        return this._prevPoint;
    },

    view:function () {
        return this._viewId;
    },
    id:function () {
        return this._id;
    },

    setTouchInfo:function (viewId, x, y, iId) {
        this._viewId = viewId;
        this._prevPoint = this._point;
        this._point = new cc.Point(x || 0, y || 0);
        this._id = iId || 0;
    },
    _setPrevPoint:function (x, y) {
        this._prevPoint = new cc.Point(x || 0, y || 0);
    }
});

cc.TouchDelegate = cc.Class.extend({
    _eventTypeFuncMap:null,

    ccTouchBegan:function (touch, event) {
        return false;
    },

    // optional
    ccTouchMoved:function (touch, event) {
    },
    ccTouchEnded:function (touch, event) {
    },
    ccTouchCancelled:function (touch, event) {
    },

    // optional
    ccTouchesBegan:function (touches, event) {
    },
    ccTouchesMoved:function (touches, event) {
    },
    ccTouchesEnded:function (touches, event) {
    },
    ccTouchesCancelled:function (touches, event) {
    },

    /*
     * In TouchesTest, class Padle inherits from CCSprite and CCTargetedTouchDelegate.
     * When it invoke  CCTouchDispatcher::sharedDispatcher()->addTargetedDelegate(this, 0, true),
     * it will crash in CCTouchHandler::initWithDelegate() because of dynamic_cast() on android.
     * I don't know why, so add these functions for the subclass to invoke it's own retain() and
     * release().
     * More detain info please refer issue #926(cocos2d-x).
     */
    touchDelegateRetain:function () {
    },
    touchDelegateRelease:function () {
    }
});

/**
 @brief
 Using this type of delegate results in two benefits:
 - 1. You don't need to deal with CCSets, the dispatcher does the job of splitting
 them. You get exactly one UITouch per call.
 - 2. You can *claim* a UITouch by returning YES in ccTouchBegan. Updates of claimed
 touches are sent only to the delegate(s) that claimed them. So if you get a move/
 ended/cancelled update you're sure it's your touch. This frees you from doing a
 lot of checks when doing multi-touch.

 (The name TargetedTouchDelegate relates to updates "targeting" their specific
 handler, without bothering the other handlers.)
 @since v0.8
 */
cc.TargetedTouchDelegate = cc.TouchDelegate.extend({
    /** Return YES to claim the touch.
     @since v0
     */
    ccTouchBegan:function (touch, event) {
        return false;
    },

    // optional
    ccTouchMoved:function (touch, event) {
    },
    ccTouchEnded:function (touch, event) {
    },
    ccTouchCancelled:function (touch, event) {
    }
});

/** @brief
 This type of delegate is the same one used by CocoaTouch. You will receive all the events (Began,Moved,Ended,Cancelled).
 @since v0.8
 */
cc.StandardTouchDelegate = cc.TouchDelegate.extend({
    // optional
    ccTouchesBegan:function (touches, event) {
    },
    ccTouchesMoved:function (touches, event) {
    },
    ccTouchesEnded:function (touches, event) {
    },
    ccTouchesCancelled:function (touches, event) {
    }
});

