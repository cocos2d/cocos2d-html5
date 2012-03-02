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
var CC = CC = CC || {};
//! Default tag
CC.kCCActionTagInvalid = -1;

/**
 @brief Base class for CCAction objects.
 */
var CCAction = CCClass.extend({
    //***********variables*************
    _m_pOriginalTarget: null,
    /** The "target".
     The target will be set with the 'startWithTarget' method.
     When the 'stop' method is called, target will be set to nil.
     The target is 'assigned', it is not 'retained'.
     */
    _m_pTarget: null,
    _m_nTag: 0,
    //**************Public Functions***********
    ctor: function(){},
    description: function(){},
    copyWithZone: function(pZone){},
    //! return true if the action has finished
    isDone: function(){},
    //! called before the action start. It will also set the target.
    startWithTarget: function(pTarget){},
    /**
     called after the action has finished. It will set the 'target' to nil.
     IMPORTANT: You should never call "[action stop]" manually. Instead, use: "target->stopAction(action);"
     */
    stop: function(){},
    //! called every frame with it's delta time. DON'T override unless you know what you are doing.
    step:function(dt){},
    /**
     called once per frame. time a value between 0 and 1

     For example:
     - 0 means that the action just started
     - 0.5 means that the action is in the middle
     - 1 means that the action is over
     */
    update: function(time){},
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
CCAction.action = function(){
};



/**
 @brief
 Base class actions that do have a finite time duration.
 Possible actions:
 - An action with a duration of 0 seconds
 - An action with a duration of 35.5 seconds

 Infinite time actions are valid
 */
var CCFiniteTimeAction = CCAction.extend({
    //! duration in seconds
    _m_fDuration:0,
    //! get duration in seconds of the action
    getDuration: function() { return this._m_fDuration; },
    //! set duration in seconds of the action
    setDuration: function(duration) { this._m_fDuration = duration; },
    /** returns a reversed action */
    reverse: function(){},
});


/**
 @brief Changes the speed of an action, making it take longer (speed>1)
 or less (speed<1) time.
 Useful to simulate 'slow motion' or 'fast forward' effect.
 @warning This action can't be Sequenceable because it is not an CCIntervalAction
 */
var CCSpeed = CCAction.extend({
    _m_fSpeed: 0.0,
    _m_pInnerAction:null,
    getSpeed: function() { return this._m_fSpeed; },
    /** alter the speed of the inner function in runtime */
    setSpeed: function(fSpeed) { this._m_fSpeed = fSpeed; },
    /** initializes the action */
    initWithAction: function(pAction, fRate){},
    copyWithZone: function(pZone){},
    startWithTarget:function(pTarget){},
    stop: function(){},
    step: function(dt){},
    isDone: function(){},
    reverse: function(){},
    setInnerAction: function(pAction){},
    getInnerAction: function()
    {
        return this._m_pInnerAction;
    }
});
/** creates the action */
CCSpeed.actionWithAction = function(pAction, fRate){};