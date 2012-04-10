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
var cc = cc = cc || {};
//! Default tag
cc.kCCActionTagInvalid = -1;

/**
 @brief Base class for CCAction objects.
 */
cc.Action = cc.Class.extend({
    //***********variables*************
    _m_pOriginalTarget: null,
    /** The "target".
     The target will be set with the 'startWithTarget' method.
     When the 'stop' method is called, target will be set to nil.
     The target is 'assigned', it is not 'retained'.
     */
    _m_pTarget: null,
    _m_nTag: cc.kCCActionTagInvalid,
    //**************Public Functions***********
    description: function()
    {
        return "<CCAction | Tag = "+ this._m_nTag +">";
    },
    copyWithZone: function(pZone)
    {
        return this.copy();
    },
    copy: function()
    {
        return Object.create(this);
    },
    //! return true if the action has finished
    isDone: function(){return true;},
    //! called before the action start. It will also set the target.
    startWithTarget: function(aTarget)
    {
        this._m_pOriginalTarget =aTarget;
        this._m_pTarget = aTarget;
    },
    /**
     called after the action has finished. It will set the 'target' to nil.
     IMPORTANT: You should never call "[action stop]" manually. Instead, use: "target->stopAction(action);"
     */
    stop: function()
    {
        this._m_pTarget = null;
    },
    //! called every frame with it's delta time. DON'T override unless you know what you are doing.
    step:function(dt)
    {
        cc.LOG("[Action step]. override me");
    },
    /**
     called once per frame. time a value between 0 and 1

     For example:
     - 0 means that the action just started
     - 0.5 means that the action is in the middle
     - 1 means that the action is over
     */
    update: function(time)
    {
        cc.LOG("[Action update]. override me");
    },
    getTarget: function() { return this._m_pTarget; },
    /** The action will modify the target properties. */
    setTarget: function(pTarget) { this._m_pTarget = pTarget; },
    getOriginalTarget:function() { return this._m_pOriginalTarget; },
    /** Set the original target, since target can be nil.
     Is the target that were used to run the action. Unless you are doing something complex, like CCActionManager, you should NOT call this method.
     The target is 'assigned', it is not 'retained'.
     @since v0.8.2
     */
    setOriginalTarget: function(pOriginalTarget) { this._m_pOriginalTarget = pOriginalTarget; },
    getTag:function() { return this._m_nTag; },
    setTag:function(nTag) { this._m_nTag = nTag; }
});
/** Allocates and initializes the action */
cc.Action.action = function(){
    var pRet = new cc.Action();
    return pRet;
};



/**
 @brief
 Base class actions that do have a finite time duration.
 Possible actions:
 - An action with a duration of 0 seconds
 - An action with a duration of 35.5 seconds

 Infinite time actions are valid
 */
cc.FiniteTimeAction = cc.Action.extend({
    //! duration in seconds
    _m_fDuration:0,
    //! get duration in seconds of the action
    getDuration: function() { return this._m_fDuration; },
    //! set duration in seconds of the action
    setDuration: function(duration) { this._m_fDuration = duration; },
    /** returns a reversed action */
    reverse: function()
    {
        cc.LOG("cocos2d: FiniteTimeAction#reverse: Implement me");
        return null;
    }
});


/**
 @brief Changes the speed of an action, making it take longer (speed>1)
 or less (speed<1) time.
 Useful to simulate 'slow motion' or 'fast forward' effect.
 @warning This action can't be Sequenceable because it is not an CCIntervalAction
 */
cc.Speed = cc.Action.extend({
    _m_fSpeed: 0.0,
    _m_pInnerAction:null,
    getSpeed: function() { return this._m_fSpeed; },
    /** alter the speed of the inner function in runtime */
    setSpeed: function(fSpeed) { this._m_fSpeed = fSpeed; },
    /** initializes the action */
    initWithAction: function(pAction, fRate)
    {
        cc.Assert(pAction != null, "");
        pAction.retain();
        this._m_pInnerAction = pAction;
        this._m_fSpeed = fRate;
        return true;
    },
    startWithTarget:function(pTarget)
    {
        cc.Action.startWithTarget(pTarget);
        this._m_pInnerAction.startWithTarget(pTarget);
    },
    stop: function()
    {
        this._m_pInnerAction.stop();
        cc.Action.stop();
    },
    step: function(dt)
    {
        this._m_pInnerAction.step(dt * this._m_fSpeed);
    },
    isDone: function()
    {
        return this._m_pInnerAction.isDone();
    },
    reverse: function()
    {
        return (cc.Speed.actionWithAction(this._m_pInnerAction.reverse(), this._m_fSpeed));
    },
    setInnerAction: function(pAction)
    {
        if (this._m_pInnerAction != pAction)
        {
            this._m_pInnerAction = pAction;
        }
    },
    getInnerAction: function()
    {
        return this._m_pInnerAction;
    }
});
/** creates the action */
cc.Speed.actionWithAction = function(pAction, fRate)
{
    var pRet = new cc.Speed();
    if (pRet && pRet.initWithAction(pAction, fRate))
    {
        return pRet;
    }
    return null;
};

/**
 @brief CCFollow is an action that "follows" a node.

 Eg:
 layer->runAction(CCFollow::actionWithTarget(hero));

 Instead of using CCCamera as a "follower", use this action instead.
 @since v0.99.2
 */
cc.Follow = cc.Action.extend({
    isBoundarySet: function(){ return this._m_bBoundarySet; },
    /** alter behavior - turn on/off boundary */
    setBoudarySet:function(bValue) { this._m_bBoundarySet = bValue; },
    /** initializes the action */
    /** initializes the action with a set boundary */
    initWithTarget:function(pFollowedNode, rect)
    {
        cc.Assert(pFollowedNode != null, "");
        pFollowedNode.retain();
        this._m_pobFollowedNode = pFollowedNode;
        this._m_bBoundarySet = false;
        this._m_bBoundaryFullyCovered = false;

        var winSize = cc.Director.sharedDirector().getWinSize();
        this._m_obFullScreenSize = cc.PointMake(winSize.width, winSize.height);
        this._m_obHalfScreenSize = cc.ccpMult(m_obFullScreenSize, 0.5);

        if(rect)
        {
            this.m_fLeftBoundary = -((rect.origin.x+rect.size.width) - this._m_obFullScreenSize.x);
            this.m_fRightBoundary = -rect.origin.x ;
            this.m_fTopBoundary = -rect.origin.y;
            this.m_fBottomBoundary = -((rect.origin.y+rect.size.height) - this.m_obFullScreenSize.y);

            if(this.m_fRightBoundary < this.m_fLeftBoundary)
            {
                // screen width is larger than world's boundary width
                //set both in the middle of the world
                this.m_fRightBoundary = this.m_fLeftBoundary = (this.m_fLeftBoundary + this.m_fRightBoundary) / 2;
            }
            if(this.m_fTopBoundary < this.m_fBottomBoundary)
            {
                // screen width is larger than world's boundary width
                //set both in the middle of the world
                this.m_fTopBoundary = this.m_fBottomBoundary = (this.m_fTopBoundary + this.m_fBottomBoundary) / 2;
            }

            if( (this.m_fTopBoundary == this.m_fBottomBoundary) && (this.m_fLeftBoundary == this.m_fRightBoundary) )
            {
                this._m_bBoundaryFullyCovered = true;
            }
        }
        return true;
    },//this is a function overload
    step:function(dt)
    {
        cc.UNUSED_PARAM(dt);

        if(this._m_bBoundarySet)
        {
            // whole map fits inside a single screen, no need to modify the position - unless map boundaries are increased
            if(this._m_bBoundaryFullyCovered)
                return;

            var tempPos = cc.ccpSub( this._m_obHalfScreenSize, this._m_pobFollowedNode.getPosition());

            this._m_pTarget.setPosition(cc.ccp(cc.clampf(tempPos.x, m_fLeftBoundary, m_fRightBoundary),
                cc.clampf(tempPos.y, m_fBottomBoundary, m_fTopBoundary)));
        }
        else
        {
            this._m_pTarget.setPosition(cc.ccpSub(this._m_obHalfScreenSize, this._m_pobFollowedNode.getPosition()));
        }
    },
    isDone:function()
    {
        return ( !this._m_pobFollowedNode.getIsRunning() );
    },
    stop:function()
    {
        this._m_pTarget = null;
        cc.Action.stop();
    },
    // node to follow
    _m_pobFollowedNode:null,
    // whether camera should be limited to certain area
    _m_bBoundarySet:false,
    // if screen size is bigger than the boundary - update not needed
    _m_bBoundaryFullyCovered:false,
    // fast access to the screen dimensions
    _m_obHalfScreenSize:null,
    _m_obFullScreenSize:null,
    // world boundaries
    m_fLeftBoundary:0.0,
    m_fRightBoundary:0.0,
    m_fTopBoundary:0.0,
    m_fBottomBoundary:0.0
});
/** creates the action with a set boundary */
/** creates the action with no boundary set */
cc.Follow.actionWithTarget = function(pFollowedNode, rect)
{
    var pRet = new cc.Follow();
    if(rect != null && pRet && pRet.initWithTarget(pFollowedNode, rect))
    {
        return pRet;
    }
    else if(pRet && pRet.initWithTarget(pFollowedNode))
    {
        return pRet;
    }
    return null;
};