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
    _m_pDelegate:null,
    _m_nPriority:0,
    _m_nEnabledSelectors:0,

    /** delegate */
    getDelegate:function(){
        return this._m_pDelegate;
    },
    setDelegate:function(pDelegate){
        this._m_pDelegate = pDelegate;
    },

    /** priority */
    getPriority:function(){
        return this._m_nPriority;
    },
    setPriority:function(nPriority){
        this._m_nPriority = nPriority;
    },

    /** enabled selectors */
    getEnabledSelectors:function(){return this._m_nEnabledSelectors;},
    setEnalbedSelectors:function(nValue){this._m_nEnabledSelectors = nValue;},

    /** initializes a TouchHandler with a delegate and a priority */
    initWithDelegate:function(pDelegate,nPriority){
        cc.Assert(pDelegate != null, "TouchHandler.initWithDelegate():touch delegate should not be null");

        this._m_pDelegate = pDelegate;

        this._m_nPriority = nPriority;
        this._m_nEnabledSelectors = 0;

        return true;
    }
});

/** allocates a TouchHandler with a delegate and a priority */
cc.TouchHandler.handlerWithDelegate = function(pDelegate,nPriority){
    var pHandler = new cc.TouchHandler();

    if (pHandler){
        pHandler.initWithDelegate(pDelegate, nPriority);
    }

    return pHandler;
};

/**
 * CCStandardTouchHandler
 It forwardes each event to the delegate.
 */
cc.StandardTouchHandler=cc.TouchHandler.extend({
    /** initializes a TouchHandler with a delegate and a priority */
    initWithDelegate:function(pDelegate,nPriority){
        if(this._super(pDelegate,nPriority)){
            return true;
        }
        return false;
    }
});

/** allocates a TouchHandler with a delegate and a priority */
cc.StandardTouchHandler.handlerWithDelegate = function(pDelegate,nPriority){
    var pHandler = new cc.StandardTouchHandler();

    if (pHandler){
        pHandler.initWithDelegate(pDelegate, nPriority);
    }

    return pHandler;
};

cc.TargetedTouchHandler=cc.TouchHandler.extend({
    _m_bSwallowsTouches:false,
    _m_pClaimedTouches:null,

    /** whether or not the touches are swallowed */
    isSwallowsTouches:function(){return this._m_bSwallowsTouches;},
    setSwallowsTouches:function(bSwallowsTouches){this._m_bSwallowsTouches = bSwallowsTouches;},

    /** MutableSet that contains the claimed touches */
    getClaimedTouches:function(){return this._m_pClaimedTouches;},

    /** initializes a TargetedTouchHandler with a delegate, a priority and whether or not it swallows touches or not */
    initWithDelegate:function(pDelegate,nPriority,bSwallow){
        if(this._super(pDelegate, nPriority)){
            this._m_pClaimedTouches = [];
            this._m_bSwallowsTouches = bSwallow;

            return true;
        }
        return false;
    }
});

/** allocates a TargetedTouchHandler with a delegate, a priority and whether or not it swallows touches or not */
cc.TargetedTouchHandler.handlerWithDelegate = function(pDelegate,nPriority,bSwallow){
    var pHandler = new cc.TargetedTouchHandler();

    if (pHandler){
        pHandler.initWithDelegate(pDelegate, nPriority,bSwallow);
    }

    return pHandler;
};