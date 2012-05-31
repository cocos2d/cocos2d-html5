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
cc.CCACTION_TAG_INVALID = -1;

/**
 @brief Base class for CCAction objects.
 */
cc.Action = cc.Class.extend({
    //***********variables*************
    _originalTarget:null,
    /** The "target".
     The target will be set with the 'startWithTarget' method.
     When the 'stop' method is called, target will be set to nil.
     The target is 'assigned', it is not 'retained'.
     */
    _target:null,
    _tag:cc.CCACTION_TAG_INVALID,
    //**************Public Functions***********
    description:function () {
        return "<CCAction | Tag = " + this._tag + ">";
    },
    copyWithZone:function (zone) {
        return this.copy();
    },
    copy:function () {
        return cc.clone(this);
    },
    //! return true if the action has finished
    isDone:function () {
        return true;
    },
    //! called before the action start. It will also set the target.
    startWithTarget:function (target) {
        this._originalTarget = target;
        this._target = target;
    },
    /**
     called after the action has finished. It will set the 'target' to nil.
     IMPORTANT: You should never call "[action stop]" manually. Instead, use: "target->stopAction(action);"
     */
    stop:function () {
        this._target = null;
    },
    //! called every frame with it's delta time. DON'T override unless you know what you are doing.
    step:function (dt) {
        cc.LOG("[Action step]. override me");
    },
    /**
     called once per frame. time a value between 0 and 1

     For example:
     - 0 means that the action just started
     - 0.5 means that the action is in the middle
     - 1 means that the action is over
     */
    update:function (time) {
        cc.LOG("[Action update]. override me");
    },
    getTarget:function () {
        return this._target;
    },
    /** The action will modify the target properties. */
    setTarget:function (target) {
        this._target = target;
    },
    getOriginalTarget:function () {
        return this._originalTarget;
    },
    /** Set the original target, since target can be nil.
     Is the target that were used to run the action. Unless you are doing something complex, like CCActionManager, you should NOT call this method.
     The target is 'assigned', it is not 'retained'.
     @since v0.8.2
     */
    setOriginalTarget:function (originalTarget) {
        this._originalTarget = originalTarget;
    },
    getTag:function () {
        return this._tag;
    },
    setTag:function (tag) {
        this._tag = tag;
    }
});
/** Allocates and initializes the action */
cc.Action.action = function () {
    var ret = new cc.Action();
    return ret;
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
    _duration:0,
    //! get duration in seconds of the action
    getDuration:function () {
        return this._duration;
    },
    //! set duration in seconds of the action
    setDuration:function (duration) {
        this._duration = duration;
    },
    /** returns a reversed action */
    reverse:function () {
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
    _speed:0.0,
    _innerAction:null,
    getSpeed:function () {
        return this._speed;
    },
    /** alter the speed of the inner function in runtime */
    setSpeed:function (speed) {
        this._speed = speed;
    },
    /** initializes the action */
    initWithAction:function (action, rate) {
        cc.Assert(action != null, "");
        this._innerAction = action;
        this._speed = rate;
        return true;
    },
    startWithTarget:function (target) {
        this._super(target);
        this._innerAction.startWithTarget(target);
    },
    stop:function () {
        this._innerAction.stop();
        cc.Action.stop();
    },
    step:function (dt) {
        this._innerAction.step(dt * this._speed);
    },
    isDone:function () {
        return this._innerAction.isDone();
    },
    reverse:function () {
        return (cc.Speed.actionWithAction(this._innerAction.reverse(), this._speed));
    },
    setInnerAction:function (action) {
        if (this._innerAction != action) {
            this._innerAction = action;
        }
    },
    getInnerAction:function () {
        return this._innerAction;
    }
});
/** creates the action */
cc.Speed.actionWithAction = function (action, rate) {
    var ret = new cc.Speed();
    if (ret && ret.initWithAction(action, rate)) {
        return ret;
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
    isBoundarySet:function () {
        return this._boundarySet;
    },
    /** alter behavior - turn on/off boundary */
    setBoudarySet:function (value) {
        this._boundarySet = value;
    },
    /** initializes the action */
    /** initializes the action with a set boundary */
    initWithTarget:function (followedNode, rect) {
        cc.Assert(followedNode != null, "");
        this._followedNode = followedNode;
        this._boundarySet = false;
        this._boundaryFullyCovered = false;

        var winSize = cc.Director.sharedDirector().getWinSize();
        this._fullScreenSize = cc.PointMake(winSize.width, winSize.height);
        this._halfScreenSize = cc.ccpMult(this._fullScreenSize, 0.5);

        if (rect) {
            this.leftBoundary = -((rect.origin.x + rect.size.width) - this._fullScreenSize.x);
            this.rightBoundary = -rect.origin.x;
            this.topBoundary = -rect.origin.y;
            this.bottomBoundary = -((rect.origin.y + rect.size.height) - this._fullScreenSize.y);

            if (this.rightBoundary < this.leftBoundary) {
                // screen width is larger than world's boundary width
                //set both in the middle of the world
                this.rightBoundary = this.leftBoundary = (this.leftBoundary + this.rightBoundary) / 2;
            }
            if (this.topBoundary < this.bottomBoundary) {
                // screen width is larger than world's boundary width
                //set both in the middle of the world
                this.topBoundary = this.bottomBoundary = (this.topBoundary + this.bottomBoundary) / 2;
            }

            if ((this.topBoundary == this.bottomBoundary) && (this.leftBoundary == this.rightBoundary)) {
                this._boundaryFullyCovered = true;
            }
        }
        return true;
    }, //this is a function overload
    step:function (dt) {
        if (this._boundarySet) {
            // whole map fits inside a single screen, no need to modify the position - unless map boundaries are increased
            if (this._boundaryFullyCovered)
                return;

            var tempPos = cc.ccpSub(this._halfScreenSize, this._followedNode.getPosition());

            this._target.setPosition(cc.ccp(cc.clampf(tempPos.x, this.leftBoundary, this.rightBoundary),
                cc.clampf(tempPos.y, this.bottomBoundary, this.topBoundary)));
        }
        else {
            this._target.setPosition(cc.ccpSub(this._halfScreenSize, this._followedNode.getPosition()));
        }
    },
    isDone:function () {
        return ( !this._followedNode.getIsRunning() );
    },
    stop:function () {
        this._target = null;
        cc.Action.stop();
    },
    // node to follow
    _followedNode:null,
    // whether camera should be limited to certain area
    _boundarySet:false,
    // if screen size is bigger than the boundary - update not needed
    _boundaryFullyCovered:false,
    // fast access to the screen dimensions
    _halfScreenSize:null,
    _fullScreenSize:null,
    // world boundaries
    leftBoundary:0.0,
    rightBoundary:0.0,
    topBoundary:0.0,
    bottomBoundary:0.0
});
/** creates the action with a set boundary */
/** creates the action with no boundary set */
cc.Follow.actionWithTarget = function (followedNode, rect) {
    var ret = new cc.Follow();
    if (rect != null && ret && ret.initWithTarget(followedNode, rect)) {
        return ret;
    }
    else if (ret && ret.initWithTarget(followedNode)) {
        return ret;
    }
    return null;
};