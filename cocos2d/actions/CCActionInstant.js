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
    isDone: function(){ return true;},
    step: function(dt)
    {
        cc.UNUSED_PARAM(dt);
        this.update(1);
    },
    update: function(time)
    {
        //cc.UNUSED_PARAM(time);
    }
});

/** @brief Show the node
 */
cc.Show = cc.ActionInstant.extend({
    startWithTarget:function(pTarget)
    {
        this._super(pTarget);
        pTarget.setIsVisible(true);
    },
    reverse:function()
    {
        return cc.Hide.action.call(this);
    }
});
cc.Show.action = function()
{
    return new cc.Show();
};

/**
 @brief Hide the node
 */
cc.Hide = cc.ActionInstant.extend({
    startWithTarget:function(pTarget)
    {
        this._super(pTarget);
        pTarget.setIsVisible(false);
    },
    reverse:function()
    {
        return cc.Show.action.call(this);
    }
});
cc.Hide.action = function()
{
    return (new cc.Hide());
};


/** @brief Toggles the visibility of a node
 */
cc.ToggleVisibility = cc.ActionInstant.extend({
    startWithTarget:function(pTarget)
    {
        this._super();
        pTarget.setIsVisible(!pTarget.getIsVisible());
    },
    reverse:function()
    {
        return new cc.ToggleVisibility();
    }
});
cc.ActionInstant.action = function()
{
    return (new cc.ToggleVisibility());
};

/**
 @brief Flips the sprite horizontally
 @since v0.99.0
 */
cc.FlipX = cc.ActionInstant.extend({
    initWithFlipX:function(x)
    {
        this._m_bFlipX = x;
        return true;
    },
    startWithTarget:function(pTarget)
    {
        this._super();
        pTarget.setFlipX(this._m_bFlipX);
    },
    reverse:function()
    {
        return this.actionWithFlipX(!this._m_bFlipX);
    },
    _m_bFlipX: false
});
cc.FlipX.actionWithFlipX = function(x)
{
    var pRet = new cc.FlipX();
    if(pRet.initWithFlipX(x))
    return pRet;
};

/**
 @brief Flips the sprite vertically
 @since v0.99.0
 */
cc.FlipY = cc.ActionInstant.extend({
    initWithFlipY:function(Y)
    {
        this._m_bFlipY = Y;
        return true;
    },
    startWithTarget:function(pTarget)
    {
        this._super();
        pTarget.setFlipY(this._m_bFlipY);
    },
    reverse:function()
    {
        return this.actionWithFlipY(!this._m_bFlipY);
    },
    _m_bFlipY: false
});
cc.FlipY.actionWithFlipY = function(y)
{
    var pRet = new cc.FlipY();
    if(pRet.initWithFlipY(y))
        return pRet;
};


/** @brief Places the node in a certain position
 */
cc.Place = cc.ActionInstant.extend({
    /** Initializes a Place action with a position */
    initWithPosition: function(pos)
    {
        this._m_tPosition = pos;
        return true;
    },
    startWithTarget:function(pTarget)
    {
        this._super(pTarget);
        this._m_pTarget.setPosition(this._m_tPosition);
    }
});
/** creates a Place action with a position */
cc.Place.actionWithPosition= function(pos)
{
    var ret = new cc.Place();
    ret.initWithPosition(pos);
    return ret;
};


/** @brief Calls a 'callback'
 */
cc.CallFunc = cc.ActionInstant.extend({
    initWithTarget: function(pSelectorTarget, selector, d)
    {
        this._m_pData = d || null;
        this._m_pCallFunc = selector || null;
        this._m_pSelectorTarget = pSelectorTarget || null;
        return true;
    },
    execute:function()
    {
        if(this._m_pCallFunc != null)//CallFunc, N, ND
        {
            this._m_pCallFunc.call(this._m_pSelectorTarget,this._m_pTarget, this._m_pData);
        }
    },
    startWithTarget:function(pTarget)
    {
        this._super(pTarget);
        this.execute();
    },
    getTargetCallback: function(){return this._m_pSelectorTarget;},
    setTargetCallback: function(pSel)
    {
        if(pSel != this._m_pSelectorTarget)
        {
            if(this._m_pSelectorTarget)
            {
                this._m_pSelectorTarget = null;
            }
            this._m_pSelectorTarget = pSel;
        }
    },
    _m_pSelectorTarget: null,
    _m_pCallFunc: null
});
/** creates the action with the callback

 typedef void (CCObject::*SEL_CallFunc)();
 */
cc.CallFunc.actionWithTarget= function(pSelectorTarget, selector, d)
{
    var pRet = new cc.CallFunc();
    if(pRet && pRet.initWithTarget(pSelectorTarget, selector, d))
    {
        pRet._m_pCallFunc = selector;
        return pRet;
    }
    return null;
};