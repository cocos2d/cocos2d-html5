/****************************************************************************
 Copyright (c) 2010-2012 cocos2d-x.org
 Copyright (c) 2008-2010 Ricardo Quesada
 Copyright (c) 2011      Zynga Inc.

 http://www.cocos2d-x.org

 Created by JetBrains WebStorm.
 User: wuhao
 Date: 12-3-12

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
 @brief Instant actions are immediate actions. They don't have a duration like
 the CCIntervalAction actions.
 */
cc.ActionInstant = cc.FiniteTimeAction.extend({
    isDone:function () {
        return true;
    },
    step:function (dt) {
        this.update(1);
    },
    update:function (time) {
        //cc.UNUSED_PARAM(time);
    }
});

/** @brief Show the node
 */
cc.Show = cc.ActionInstant.extend({
    startWithTarget:function (target) {
        this._super(target);
        target.setIsVisible(true);
    },
    reverse:function () {
        return cc.Hide.action.call(this);
    }
});
cc.Show.action = function () {
    return new cc.Show();
};

/**
 @brief Hide the node
 */
cc.Hide = cc.ActionInstant.extend({
    startWithTarget:function (target) {
        this._super(target);
        target.setIsVisible(false);
    },
    reverse:function () {
        return cc.Show.action.call(this);
    }
});
cc.Hide.action = function () {
    return (new cc.Hide());
};


/** @brief Toggles the visibility of a node
 */
cc.ToggleVisibility = cc.ActionInstant.extend({
    startWithTarget:function (target) {
        this._super();
        target.setIsVisible(!target.getIsVisible());
    },
    reverse:function () {
        return new cc.ToggleVisibility();
    }
});
cc.ActionInstant.action = function () {
    return (new cc.ToggleVisibility());
};

/**
 @brief Flips the sprite horizontally
 @since v0.99.0
 */
cc.FlipX = cc.ActionInstant.extend({
    initWithFlipX:function (x) {
        this._flipX = x;
        return true;
    },
    startWithTarget:function (target) {
        this._super();
        target.setFlipX(this._flipX);
    },
    reverse:function () {
        return this.actionWithFlipX(!this._flipX);
    },
    _flipX:false
});
cc.FlipX.actionWithFlipX = function (x) {
    var ret = new cc.FlipX();
    if (ret.initWithFlipX(x))
        return ret;
};

/**
 @brief Flips the sprite vertically
 @since v0.99.0
 */
cc.FlipY = cc.ActionInstant.extend({
    initWithFlipY:function (Y) {
        this._flipY = Y;
        return true;
    },
    startWithTarget:function (target) {
        this._super();
        target.setFlipY(this._flipY);
    },
    reverse:function () {
        return this.actionWithFlipY(!this._flipY);
    },
    _flipY:false
});
cc.FlipY.actionWithFlipY = function (y) {
    var ret = new cc.FlipY();
    if (ret.initWithFlipY(y))
        return ret;
};


/** @brief Places the node in a certain position
 */
cc.Place = cc.ActionInstant.extend({
    /** Initializes a Place action with a position */
    initWithPosition:function (pos) {
        this._position = pos;
        return true;
    },
    startWithTarget:function (target) {
        this._super(target);
        this._target.setPosition(this._position);
    }
});
/** creates a Place action with a position */
cc.Place.actionWithPosition = function (pos) {
    var ret = new cc.Place();
    ret.initWithPosition(pos);
    return ret;
};


/** @brief Calls a 'callback'
 */
cc.CallFunc = cc.ActionInstant.extend({
    initWithTarget:function (selectorTarget, selector, d) {
        this._data = d || null;
        this._callFunc = selector || null;
        this._selectorTarget = selectorTarget || null;
        return true;
    },
    execute:function () {
        if (this._callFunc != null)//CallFunc, N, ND
        {
            this._callFunc.call(this._selectorTarget, this._target, this._data);
        }
    },
    startWithTarget:function (target) {
        this._super(target);
        this.execute();
    },
    getTargetCallback:function () {
        return this._selectorTarget;
    },
    setTargetCallback:function (pSel) {
        if (pSel != this._selectorTarget) {
            if (this._selectorTarget) {
                this._selectorTarget = null;
            }
            this._selectorTarget = pSel;
        }
    },
    _selectorTarget:null,
    _callFunc:null
});
/** creates the action with the callback

 typedef void (CCObject::*SEL_CallFunc)();
 */
cc.CallFunc.actionWithTarget = function (selectorTarget, selector, d) {
    var ret = new cc.CallFunc();
    if (ret && ret.initWithTarget(selectorTarget, selector, d)) {
        ret._callFunc = selector;
        return ret;
    }
    return null;
};