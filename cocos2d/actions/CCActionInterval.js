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
 @brief An interval action is an action that takes place within a certain period of time.
 It has an start time, and a finish time. The finish time is the parameter
 duration plus the start time.

 These CCActionInterval actions have some interesting properties, like:
 - They can run normally (default)
 - They can run reversed with the reverse method
 - They can run with the time altered with the Accelerate, AccelDeccel and Speed actions.

 For example, you can simulate a Ping Pong effect running the action normally and
 then running it again in Reverse mode.

 Example:

 CCAction *pingPongAction = CCSequence::actions(action, action->reverse(), NULL);
 */
cc.ActionInterval = cc.FiniteTimeAction.extend({
    _m_elapsed: 0,
    _m_bFirstTick: false,
    /** how many seconds had elapsed since the actions started to run. */
    getElapsed: function(){return this._m_elapsed;},
    /** initializes the action */
    initWithDuration: function(d)
    {
        this._m_fDuration = (d==0)? cc.FLT_EPSILON: d;
        // prevent division by 0
        // This comparison could be in step:, but it might decrease the performance
        // by 3% in heavy based action games.
        this._m_bFirstTick = true;
        return true;
    },
    /** returns true if the action has finished */
    isDone: function()
    {
        return (this._m_elapsed >= this._m_fDuration);
    },
    step: function(dt)
    {
        if(this._m_bFirstTick)
        {
            this._m_bFirstTick = false;
            this._m_elapsed = 0;
        }
        else
        {
            this._m_elapsed +=dt;
        }
        this.update((1 > (this._m_elapsed/this._m_fDuration))?this._m_elapsed/this._m_fDuration: 1);
    },
    startWithTarget:function(pTarget)
    {
        this._super(pTarget);
        this._m_elapsed = 0;
        this._m_bFirstTick = true;
    },
    reverse:function()
    {
        /*
         NSException* myException = [NSException
         exceptionWithName:@"ReverseActionNotImplemented"
         reason:@"Reverse Action not implemented"
         userInfo:nil];
         @throw myException;
         */
        return null;
    },
    setAmplitudeRate:function(amp)
    {
        cc.UNUSED_PARAM(amp);
        cc.Assert(0, 'Actioninterval setAmplitudeRate');
    },
    getAmplitudeRate:function()
    {
        cc.Assert(0, 'Actioninterval getAmplitudeRate');
        return 0;
    }
});
cc.ActionInterval.actionWithDuration=function(d)
{
    var pAction = new cc.ActionInterval();
    pAction.initWithDuration(d);
    return pAction;
};



/** @brief Runs actions sequentially, one after another
 */
cc.Sequence = cc.ActionInterval.extend({
    _m_pActions: [],
    _m_split: null,
    _m_last:0,

    /** initializes the action */
   // bool initOneTwo(CCFiniteTimeAction *pActionOne, CCFiniteTimeAction *pActionTwo);
    initOneTwo: function(pActionOne, pActionTwo)
    {
        cc.Assert(pActionOne != null, "Sequence.initOneTwo");
        cc.Assert(pActionTwo != null, "Sequence.initOneTwo");

        var d = pActionOne.getDuration() + pActionTwo.getDuration();
        this.initWithDuration(d);

        this._m_pActions[0] = pActionOne;
        this._m_pActions[1] = pActionTwo;

        return true;
    },
    startWithTarget:function(pTarget)
    {
        this._super(pTarget);
        this._m_split = this._m_pActions[0].getDuration() / this._m_fDuration;
        this._m_last = -1;
    },
    stop: function()
    {
        this._m_pActions[0].stop();
        this._m_pActions[1].stop();
        this._super();
    },
    update: function(time)
    {
        var found = 0;
        var new_t = 0;
        if(time >= this._m_split)
        {
            found = 1;
            new_t = (this._m_split == 1)? 1 : (time - this._m_split) / (1-this._m_split);
        }
        else
        {
            found = 0;
            new_t = (this._m_split != 0)? time / this._m_split : 1;
        }
        if(this._m_last == -1 && found == 1)
        {
            this._m_pActions[0].startWithTarget(this._m_pTarget);
            this._m_pActions[0].update(1);
            this._m_pActions[0].stop();
        }
        if (this._m_last != found)
        {
            if (this._m_last != -1)
            {
                this._m_pActions[this._m_last].update(1);
                this._m_pActions[this._m_last].stop();
            }

            this._m_pActions[found].startWithTarget(this._m_pTarget);
        }
        this._m_pActions[found].update(new_t);
        this._m_last = found;
    },
    reverse: function()
    {
        return cc.Sequence.actionOneTwo(this._m_pActions[1].reverse(), this._m_pActions[0].reverse());
    }
});
/** helper constructor to create an array of sequenceable actions */
cc.Sequence.actions = function(/*Multiple Arguments*/)
{
    var pPrev = arguments[0];
    for(var i = 1; i < arguments.length; i++)
    {
        if(arguments[i]!=null)
        {
            pPrev = cc.Sequence.actionOneTwo(pPrev, arguments[i]);
        }
    }
    return pPrev;
};
/** helper contructor to create an array of sequenceable actions given an array */
cc.Sequence.actionsWithArray = function(actions)
{
    var prev = this.actions[0];
    for(var i = 1; i < this.actions.length; ++i)
    {
        prev = this.actionOneTwo(prev, this.actions[i]);
    }
    return prev;
};
/** creates the action */
cc.Sequence.actionOneTwo = function(pActionOne, pActionTwo)
{
    var pSequence = new cc.Sequence();
    pSequence.initOneTwo(pActionOne, pActionTwo);
    return pSequence;
};



/** @brief Repeats an action a number of times.
 * To repeat an action forever use the CCRepeatForever action.
 */
cc.Repeat = cc.ActionInterval.extend({
    _m_uTimes: 0,
    _m_uTotal: 0,
    _m_pInnerAction: null,//CCFiniteTimeAction
    initWithAction:function(pAction, times)
    {
        var d = pAction.getDuration() * times;

        if (this._super(d))
        {
            this._m_uTimes = times;
            this._m_pInnerAction = pAction;
            this._m_uTotal = 0;
            return true;
        }
        return false;
    },
    startWithTarget: function(pTarget)
    {
        this._m_uTotal = 0;
        this._super(pTarget);
        this._m_pInnerAction.startWithTarget(pTarget);
    },
    stop:function()
    {
        this._m_pInnerAction.stop();
        this._super();
    },
    update:function(time)
    {
        var t = time * this._m_uTimes;
        if (t > this._m_uTotal + 1)
        {
            this._m_pInnerAction.update(1);
            thi._m_uTotal++;
            this._m_pInnerAction.stop();
            this._m_pInnerAction.startWithTarget(this._m_pTarget);

            // repeat is over?
            if (this._m_uTotal == this._m_uTimes)
            {
                // so, set it in the original position
                this._m_pInnerAction.update(0);
            }
            else
            {
                // no ? start next repeat with the right update
                // to prevent jerk (issue #390)
                this._m_pInnerAction.update(t - this._m_uTotal);
            }
        }
        else
        {
            var r = t % 1;

            // fix last repeat position
            // else it could be 0.
            if (time == 1)
            {
                r = 1;
                this._m_uTotal++; // this is the added line
            }

            //		m_pOther->update(min(r, 1));
            this._m_pInnerAction.update((r > 1) ? 1 : r);
        }
    },
    isDone:function()
    {
        return this._m_uTotal == this._m_uTimes;
    },
    reverse:function()
    {
        return cc.Repeat.actionWithAction(this._m_pInnerAction.reverse(), this._m_uTimes);
    },
    setInnerAction:function(pAction)
    {
        if(this._m_pInnerAction != pAction)
        {
            this._m_pInnerAction = pAction;
        }
    },
    getInnerAction:function(){return this._m_pInnerAction;}
});
/** creates a CCRepeat action. Times is an unsigned integer between 1 and pow(2,30) */
cc.Repeat.actionWithAction = function(pAction,times)
{
    var pRepeat = new cc.Repeat();
    pRepeat.initWithAction(pAction, times);
    return pRepeat;
};


/** @brief Repeats an action for ever.
 To repeat the an action for a limited number of times use the Repeat action.
 @warning This action can't be Sequenceable because it is not an IntervalAction
 */
cc.RepeatForever = cc.ActionInterval.extend({
    _m_pInnerAction:null,//CCActionInterval
    initWithAction:function(pAction){},
    startWithTarget:function(pTarget)
    {
        this._super(pTarget);
        this._m_pInnerAction.startWithTarget(pTarget);
    },
    step:function(dt)
    {
        this._m_pInnerAction.step(dt);
        if (this._m_pInnerAction.isDone())
        {
            var diff = dt + this._m_pInnerAction.getDuration() - this._m_pInnerAction.getElapsed();
            this._m_pInnerAction.startWithTarget(this._m_pTarget);
            // to prevent jerk. issue #390
            this._m_pInnerAction.step(diff);
        }
    },
    isDone:function(){return false;},
    reverse:function(){return (cc.RepeatForever.actionWithAction(this._m_pInnerAction.reverse()));},
    setInnerAction:function(pAction)
    {
        if(this._m_pInnerAction != pAction)
        {
            this._m_pInnerAction = pAction;
        }
    },
    getInnerAction:function()
    {
        return this._m_pInnerAction;
    }
});
cc.RepeatForever.actionWithAction = function(pAction)
{
    var pRet = new cc.RepeatForever();
    if (pRet && pRet.initWithAction(pAction))
    {
        return pRet;
    }
    return null;
};


/** @brief Spawn a new action immediately
 */
cc.Spawn = cc.ActionInterval.extend({
    /** initializes the Spawn action with the 2 actions to spawn */
    initOneTwo:function(pAction1, pAction2)
    {
        cc.Assert(pAction1 != null, "");
        cc.Assert(pAction2 != null, "");

        var bRet = false;

        var d1 = pAction1.getDuration();
        var d2 = pAction2.getDuration();

        if (cc.ActionInterval.initWithDuration(Math.max(d1, d2)))
        {
            this._m_pOne = pAction1;
            this._m_pTwo = pAction2;

            if (d1 > d2)
            {
                this._m_pTwo = cc.Sequence.actionOneTwo(pAction2, cc.DelayTime.actionWithDuration(d1 - d2));
            } else
            if (d1 < d2)
            {
                this._m_pOne = cc.Sequence.actionOneTwo(pAction1, cc.DelayTime.actionWithDuration(d2 - d1));
            }

            bRet = true;
        }
        return bRet;
    },
    startWithTarget:function(pTarget)
    {
        cc.ActionInterval.startWithTarget(pTarget);
        this._m_pOne.startWithTarget(pTarget);
        this._m_pTwo.startWithTarget(pTarget);
    },
    stop: function()
    {
        this._m_pOne.stop();
        this._m_pTwo.stop();
        this._super();
    },
    update: function(time)
    {
        if (this._m_pOne)
        {
            this._m_pOne.update(time);
        }
        if (this._m_pTwo)
        {
            this._m_pTwo.update(time);
        }
    },
    reverse: function()
    {
        return cc.Spawn.actionOneTwo(this._m_pOne.reverse(), this._m_pTwo.reverse());
    },
    _m_pOne: null,
    _m_pTwo:null
});
cc.Spawn.actions = function(/*Multiple Arguments*/)
{
    var pPrev = arguments[0];
    for(var i = 1; i < arguments.length; i++)
    {
        pPrev = this.actionOneTwo(pPrev, arguments[i]);
    }
    return pPrev;
};
cc.Spawn.actionsWithArray= function(actions)
{
    var prev = actions[0];

    for (var i = 1; i < actions.length; ++i)
    {
        prev = this.actionOneTwo(prev, actions[i]);
    }

    return prev;
};
cc.Spawn.actionOneTwo = function(pAction1, pAction2)
{
    var pSpawn = new cc.Spawn();
    pSpawn.initOneTwo(pAction1, pAction2);

    return pSpawn;
};


/** @brief Rotates a CCNode object to a certain angle by modifying it's
 rotation attribute.
 The direction will be decided by the shortest angle.
 */
cc.RotateTo = cc.ActionInterval.extend({
    _m_fDstAngle: 0,
    _m_fStartAngle: 0,
    _m_fDiffAngle: 0,
    initWithDuration:function(duration, fDeltaAngle)
    {
        if (this._super(duration))
        {
            this._m_fDstAngle = fDeltaAngle;
            return true;
        }

        return false;
    },
    startWithTarget:function(pTarget)
    {
        this._super(pTarget);

        this._m_fStartAngle = pTarget.getRotation();

        if (this._m_fStartAngle > 0)
        {
            this._m_fStartAngle = this._m_fStartAngle % 360.0;
        }
        else
        {
            this._m_fStartAngle = this._m_fStartAngle % 360.0;
        }

        this._m_fDiffAngle = this._m_fDstAngle - this._m_fStartAngle;
        if (this._m_fDiffAngle > 180)
        {
            this._m_fDiffAngle -= 360;
        }

        if (this._m_fDiffAngle < -180)
        {
            this._m_fDiffAngle += 360;
        }
    },
    update:function(time)
    {
        if (this._m_pTarget)
        {
            this._m_pTarget.setRotation(this._m_fStartAngle + this._m_fDiffAngle * time);
        }
    }
});
cc.RotateTo.actionWithDuration = function(duration, fDeltaAngle)
{
    var pRotateTo = new cc.RotateTo();
    pRotateTo.initWithDuration(duration, fDeltaAngle);

    return pRotateTo;
};


/** @brief Rotates a CCNode object clockwise a number of degrees by modifying it's rotation attribute.
 */
cc.RotateBy = cc.ActionInterval.extend({
    _m_fAngle:0,
    _m_fStartAngle:0,
    initWithDuration:function(duration, fDeltaAngle)
    {
        if (this._super(duration))
        {
            this._m_fAngle = fDeltaAngle;
            return true;
        }

        return false;
    },
    startWithTarget:function(pTarget)
    {
        cc.ActionInterval(pTarget);
        this._m_fStartAngle = pTarget.getRotation();
    },
    update:function(time)
    {
        if (this._m_pTarget)
        {
            this._m_pTarget.setRotation(this._m_fStartAngle + this._m_fAngle * time);
        }
    },
    reverse:function()
    {
        return cc.RotateBy.actionWithDuration(this._m_fDuration, -this._m_fAngle);
    }
});
cc.RotateBy.actionWithDuration = function(duration, fDeltaAngle)
{
    var pRotateBy = new cc.RotateBy();
    pRotateBy.initWithDuration(duration, fDeltaAngle);

    return pRotateBy;
};


/** @brief Moves a CCNode object to the position x,y. x and y are absolute coordinates by modifying it's position attribute.
 */
cc.MoveTo = cc.ActionInterval.extend({
    initWithDuration:function(duration, position)
    {
        if (this._super(duration))
        {
            this._m_endPosition = position;
            return true;
        }

        return false;
    },
    startWithTarget:function(pTarget)
    {
        this._super(pTarget);
        this._m_startPosition = pTarget.getPosition();
        this._m_delta = cc.ccpSub(this._m_endPosition, this._m_startPosition);
    },
    update:function(time)
    {
        if (this._m_pTarget)
        {
            this._m_pTarget.setPosition(cc.ccp(this._m_startPosition.x + this._m_delta.x * time,
                this._m_startPosition.y + this._m_delta.y * time));
        }
    },
    _m_endPosition:new cc.Point(),
    _m_startPosition: new cc.Point(),
    _m_delta: new cc.Point()
});
cc.MoveTo.actionWithDuration = function(duration, position)
{
    var pMoveTo = new cc.MoveTo();
    pMoveTo.initWithDuration(duration, position);

    return pMoveTo;
};



/** @brief Moves a CCNode object x,y pixels by modifying it's position attribute.
 x and y are relative to the position of the object.
 Duration is is seconds.
 */
cc.MoveBy = cc.MoveTo.extend({
    initWithDuration:function(duration, position)
    {
        if (this._super(duration, position))
        {
            this._m_delta = position;
            return true;
        }

        return false;
    },
    startWithTarget:function(pTarget)
    {
        var dTmp = this._m_delta;
        this._super(pTarget);
        this._m_delta = dTmp;
    },
    reverse: function()
    {
        return cc.MoveBy.actionWithDuration(this._m_fDuration, cc.ccp(-this._m_delta.x, -this._m_delta.y));
    }
});
cc.MoveBy.actionWithDuration = function(duration, position)
{
    var pMoveBy = new cc.MoveBy();
    pMoveBy.initWithDuration(duration, position);

    return pMoveBy;
};



/** Skews a CCNode object to given angles by modifying it's skewX and skewY attributes
 @since v1.0
 */
cc.SkewTo = cc.ActionInterval.extend({
    initWithDuration:function(t, sx, sy)
    {
        var bRet = false;

        if (this._super(t))
        {
            this._m_fEndSkewX = sx;
            this._m_fEndSkewY = sy;

            bRet = true;
        }

        return bRet;
    },
    startWithTarget:function(pTarget)
    {
        this._super(pTarget);

        this._m_fStartSkewX = pTarget.getSkewX();

        if (this._m_fStartSkewX > 0)
        {
            this._m_fStartSkewX = this._m_fStartSkewX % 180;
        }
        else
        {
            this._m_fStartSkewX = this._m_fStartSkewX % -180;
        }

        this._m_fDeltaX = this._m_fEndSkewX - this._m_fStartSkewX;

        if (this._m_fDeltaX > 180)
        {
            this._m_fDeltaX -= 360;
        }
        if (this._m_fDeltaX < -180)
        {
            this._m_fDeltaX += 360;
        }

        this._m_fStartSkewY = pTarget.getSkewY();

        if (this._m_fStartSkewY > 0)
        {
            this._m_fStartSkewY = this._m_fStartSkewY % 360;
        }
        else
        {
            this._m_fStartSkewY = this._m_fStartSkewY % -360;
        }

        this._m_fDeltaY = this._m_fEndSkewY - this._m_fStartSkewY;

        if (this._m_fDeltaY > 180)
        {
            this._m_fDeltaY -= 360;
        }
        if (this._m_fDeltaY < -180)
        {
            this._m_fDeltaY += 360;
        }
    },
    update:function(t)
    {
        this._m_pTarget.setSkewX(this._m_fStartSkewX + this._m_fDeltaX * t);
        this._m_pTarget.setSkewY(this._m_fStartSkewY + this._m_fDeltaY * t);
    },
    _m_fSkewX:0,
    _m_fSkewY:0,
    _m_fStartSkewX:0,
    _m_fStartSkewY:0,
    _m_fEndSkewX:0,
    _m_fEndSkewY:0,
    _m_fDeltaX:0,
    _m_fDeltaY:0
});
cc.SkewTo.actionWithDuration= function(t, sx, sy)
{
    var pSkewTo = new cc.SkewTo();
    if (pSkewTo)
    {
        pSkewTo.initWithDuration(t, sx, sy)
    }
    return pSkewTo;
};


/** Skews a CCNode object by skewX and skewY degrees
 @since v1.0
 */
cc.SkewBy = cc.SkewTo.extend({
    initWithDuration:function(t, deltaSkewX, deltaSkewY)
    {
        var bRet = false;

        if (this._super(t, deltaSkewX, deltaSkewY))
        {
            this._m_fSkewX = deltaSkewX;
            this._m_fSkewY = deltaSkewY;

            bRet = true;
        }

        return bRet;
    },
    startWithTarget:function(pTarget)
    {
        this._super(pTarget);
        this._m_fDeltaX = this._m_fSkewX;
        this._m_fDeltaY = this._m_fSkewY;
        this._m_fEndSkewX = this._m_fStartSkewX + this._m_fDeltaX;
        this._m_fEndSkewY = this._m_fStartSkewY + this._m_fDeltaY;
    },
    reverse: function()
    {
        return cc.SkewBy.actionWithDuration(this._m_fDuration, -this._m_fSkewX, -this._m_fSkewY);
    }
});
cc.SkewBy.actionWithDuration= function(t, sx, sy)
{
    var pSkewBy = new cc.SkewBy();
    if (pSkewBy)
    {
        pSkewBy.initWithDuration(t, sx, sy);
    }

    return pSkewBy;
};


/** @brief Moves a CCNode object simulating a parabolic jump movement by modifying it's position attribute.
 */
cc.JumpBy = cc.ActionInterval.extend({
    initWithDuration:function(duration, position, height, jumps)
    {
        if (this._super(duration))
        {
            this._m_delta = position;
            this._m_height = height;
            this._m_nJumps = jumps;

            return true;
        }

        return false;
    },
    startWithTarget:function(pTarget)
    {
        this._super(pTarget);
        this._m_startPosition = pTarget.getPosition();
    },
    update:function(time)
    {
        if (this._m_pTarget)
        {
            var frac = time * this._m_nJumps % 1.0;
            var y = this._m_height * 4 * frac * (1 - frac);
            y += this._m_delta.y * time;
            var x = this._m_delta.x * time;
            this._m_pTarget.setPosition(cc.ccp(this._m_startPosition.x + x, this._m_startPosition.y + y));
        }
    },
    reverse: function()
    {
        return cc.JumpBy.actionWithDuration(this._m_fDuration, cc.ccp(-this._m_delta.x, -this._m_delta.y), this._m_height, this._m_nJumps);
    },
    _m_startPosition:new cc.Point(),
    _m_delta:new cc.Point(),
    _m_height:0,
    _m_nJumps:0
});
cc.JumpBy.actionWithDuration=function(duration,position, height, jumps)
{
    var pJumpBy = new cc.JumpBy();
    pJumpBy.initWithDuration(duration, position, height, jumps);

    return pJumpBy;
};


/** @brief Moves a CCNode object to a parabolic position simulating a jump movement by modifying it's position attribute.
 */
cc.JumpTo = cc.JumpBy.extend({
    startWithTarget:function(pTarget)
    {
        this._super(pTarget);
        this._m_delta = cc.ccp(this._m_delta.x - this._m_startPosition.x, this._m_delta.y - this._m_startPosition.y);
    }
});
cc.JumpTo.actionWithDuration = function(duration, position, height, jumps)
{
    var pJumpTo = new cc.JumpTo();
    pJumpTo.initWithDuration(duration, position, height, jumps);

    return pJumpTo;
};

/** @typedef bezier configuration structure
 */
cc.BezierConfig = cc.Class.extend({
    endPosition: new cc.Point(),
    controlPoint_1: new cc.Point(),
    controlPoint_2: new cc.Point()
});
cc.bezierat = function(a,b,c,d,t )
{
    return (Math.pow(1-t,3) * a +
        3*t*(Math.pow(1-t,2))*b +
        3*Math.pow(t,2)*(1-t)*c +
        Math.pow(t,3)*d );
};

/** @brief An action that moves the target with a cubic Bezier curve by a certain distance.
 */
cc.BezierBy = cc.ActionInterval.extend({
    initWithDuration:function(t, c)
    {
        if (this._super(t))
        {
            this._m_sConfig = c;
            return true;
        }

        return false;
    },
    startWithTarget:function(pTarget)
    {
        this._super(pTarget);
        this._m_startPosition = pTarget.getPosition();
    },
    update:function(time)
    {
        if (this._m_pTarget)
        {
            var xa = 0;
            var xb = this._m_sConfig.controlPoint_1.x;
            var xc = this._m_sConfig.controlPoint_2.x;
            var xd = this._m_sConfig.endPosition.x;

            var ya = 0;
            var yb = this._m_sConfig.controlPoint_1.y;
            var yc = this._m_sConfig.controlPoint_2.y;
            var yd = this._m_sConfig.endPosition.y;

            var x = cc.bezierat(xa, xb, xc, xd, time);
            var y = cc.bezierat(ya, yb, yc, yd, time);
            this._m_pTarget.setPosition(cc.ccpAdd(this._m_startPosition, cc.ccp(x, y)));
        }
    },
    reverse: function()
    {
        var r;

        r.endPosition = cc.ccpNeg(this._m_sConfig.endPosition);
        r.controlPoint_1 = cc.ccpAdd(this._m_sConfig.controlPoint_2, cc.ccpNeg(this._m_sConfig.endPosition));
        r.controlPoint_2 = cc.ccpAdd(this._m_sConfig.controlPoint_1, cc.ccpNeg(this._m_sConfig.endPosition));

        var pAction = cc.BezierBy.actionWithDuration(this._m_fDuration, r);
        return pAction;
    },
    _m_sConfig: new cc.BezierConfig(),
    _m_startPosition: new cc.Point()
});
cc.BezierBy.actionWithDuration = function(t, c)
{
    var pBezierBy = new cc.BezierBy();
    pBezierBy.initWithDuration(t, c);

    return pBezierBy;
};


/** @brief An action that moves the target with a cubic Bezier curve to a destination point.
 @since v0.8.2
 */
cc.BezierTo = cc.BezierBy.extend({
    update:function(time){},
    reverse:function(){},
    startWithTarget: function(pTarget)
    {
        this._super(pTarget);
        this._m_sConfig.controlPoint_1 = cc.ccpSub(this._m_sConfig.controlPoint_1, this._m_startPosition);
        this._m_sConfig.controlPoint_2 = cc.ccpSub(this._m_sConfig.controlPoint_2, this._m_startPosition);
        this._m_sConfig.endPosition = cc.ccpSub(this._m_sConfig.endPosition, this._m_startPosition);
    }
});
cc.BezierTo.actionWithDuration=function(t, c)
{
    var pBezierTo = new cc.BezierTo();
    pBezierTo.initWithDuration(t, c);

    return pBezierTo;
};


/** @brief Scales a CCNode object to a zoom factor by modifying it's scale attribute.
 @warning This action doesn't support "reverse"
 */
cc.ScaleTo = cc.ActionInterval.extend({
    initWithDuration:function(duration, sx, sy)//function overload here
    {
        if (this._super(duration))
        {
            this._m_fEndScaleX = sx;
            this._m_fEndScaleY = (sy!=null)? sy: sx;

            return true;
        }

        return false;
    },
    startWithTarget: function(pTarget)
    {
        this._super(pTarget);
        this._m_fStartScaleX = pTarget.getScaleX();
        this._m_fStartScaleY = pTarget.getScaleY();
        this._m_fDeltaX = this._m_fEndScaleX - this._m_fStartScaleX;
        this._m_fDeltaY = this._m_fEndScaleY - this._m_fStartScaleY;
    },
    update:function(time)
    {
        if (this._m_pTarget)
        {
            this._m_pTarget.setScaleX(this._m_fStartScaleX + this._m_fDeltaX * time);
            this._m_pTarget.setScaleY(this._m_fStartScaleY + this._m_fDeltaY * time);
        }
    },
    _m_fScaleX:1,
    _m_fScaleY:1,
    _m_fStartScaleX:1,
    _m_fStartScaleY:1,
    _m_fEndScaleX:0,
    _m_fEndScaleY:0,
    _m_fDeltaX:0,
    _m_fDeltaY:0
});
cc.ScaleTo.actionWithDuration=function(duration,sx, sy)//function overload
{
    var pScaleTo = new cc.ScaleTo();
    if(sy)
    {
        pScaleTo.initWithDuration(duration, sx, sy);
    }
    else
    {
        pScaleTo.initWithDuration(duration, sx);
    }

    return pScaleTo;
};


/** @brief Scales a CCNode object a zoom factor by modifying it's scale attribute.
 */
cc.ScaleBy = cc.ScaleTo.extend({
    startWithTarget: function(pTarget)
    {
        this._super(pTarget);
        this._m_fDeltaX = this._m_fStartScaleX * this._m_fEndScaleX - this._m_fStartScaleX;
        this._m_fDeltaY = this._m_fStartScaleY * this._m_fEndScaleY - this._m_fStartScaleY;
    },
    reverse:function()
    {
        return cc.ScaleBy.actionWithDuration(this._m_fDuration, 1 / this._m_fEndScaleX, 1 / this._m_fEndScaleY);
    }
});
cc.ScaleBy.actionWithDuration= function(duration, sx, sy)
{
    var pScaleBy = new cc.ScaleBy();
    if(arguments.length == 3)
    {
        pScaleBy.initWithDuration(duration, sx, sy);
    }
    else
    {
        pScaleBy.initWithDuration(duration, sx);
    }

    return pScaleBy;
};

/** @brief Blinks a CCNode object by modifying it's visible attribute
 */
cc.Blink = cc.ActionInterval.extend({
    initWithDuration:function(duration, uBlinks)
    {
        if (this._super(duration))
        {
            this._m_nTimes = uBlinks;
            return true;
        }

        return false;
    },
    update:function(time)
    {
        if (this._m_pTarget && ! this.isDone())
        {
            var slice = 1.0 / this._m_nTimes;
            var m = time % slice;
            this._m_pTarget.setIsVisible(m > slice / 2 ? true : false);
        }
    },
    reverse:function()
    {
        return cc.Blink.actionWithDuration(this._m_fDuration, this._m_nTimes);
    },
    _m_nTimes:0
});
cc.Blink.actionWithDuration= function(duration, uBlinks)
{
    var pBlink = new cc.Blink();
    pBlink.initWithDuration(duration, uBlinks);

    return pBlink;
};


/** @brief Fades In an object that implements the CCRGBAProtocol protocol. It modifies the opacity from 0 to 255.
 The "reverse" of this action is FadeOut
 */
cc.FadeIn = cc.ActionInterval.extend({
    update:function(time)
    {
        //if (this._m_pTarget.RGBAProtocol)
        //{
            this._m_pTarget.setOpacity(255 * time);
        //}
    },
    reverse:function()
    {
        return cc.FadeOut.actionWithDuration(this._m_fDuration);
    }
});
cc.FadeIn.actionWithDuration = function(d)
{
    var pAction = new cc.FadeIn();

    pAction.initWithDuration(d);

    return pAction;
};



/** @brief Fades Out an object that implements the CCRGBAProtocol protocol. It modifies the opacity from 255 to 0.
 The "reverse" of this action is FadeIn
 */
cc.FadeOut = cc.ActionInterval.extend({
    update:function(time)
    {
        this._m_pTarget.setOpacity(255 * (1 - time));
    },
    reverse:function()
    {
        return cc.FadeIn.actionWithDuration(this._m_fDuration);
    }
});
cc.FadeOut.actionwithDuration = function(d)
{
    var pAction = new cc.FadeOut();

    pAction.initWithDuration(d);

    return pAction;
};



/** @brief Fades an object that implements the CCRGBAProtocol protocol. It modifies the opacity from the current value to a custom one.
 @warning This action doesn't support "reverse"
 */
cc.FadeTo = cc.ActionInterval.extend({
    initWithDuration:function(duration, opacity)
    {
        if (this._super(duration))
        {
            this._m_toOpacity = opacity;
            return true;
        }

        return false;
    },
    update:function(time)
    {
        this._m_pTarget.setOpacity((this._m_fromOpacity + (this._m_toOpacity - this._m_fromOpacity) * time));
    },
    startWithTarget: function(pTarget)
    {
        this._super(pTarget);
        this._m_fromOpacity = pTarget.getOpacity();
    },
    _m_toOpacity:'',
    _m_fromOpacity:''
});
cc.FadeTo.actionWithDuration=function(duration, opacity)
{
    var pFadeTo = new cc.FadeTo();
    pFadeTo.initWithDuration(duration, opacity);

    return pFadeTo;
};



/** @brief Tints a CCNode that implements the CCNodeRGB protocol from current tint to a custom one.
 @warning This action doesn't support "reverse"
 @since v0.7.2
 */
cc.TintTo = cc.ActionInterval.extend({
    initWithDuration:function(duration, red, green, blue)
    {
        if (this._super(duration))
        {
            this._m_to = cc.ccc3(red, green, blue);
            return true;
        }

        return false;
    },
    startWithTarget: function(pTarget)
    {
        this._super(pTarget);
        if (this._m_pTarget.RGBAProtocol)
        {
            this._m_from = this._m_pTarget.getColor();
        }
    },
    update:function(time)
    {
        if (this._m_pTarget.RGBAProtocol)
        {
            this._m_pTarget.setColor(cc.ccc3(this._m_from.r + (this._m_to.r - this._m_from.r) * time,
                (this._m_from.g + (this._m_to.g - this._m_from.g) * time),
                (this._m_from.b + (this._m_to.b - this._m_from.b) * time)));
        }
    },
    _m_to:new cc.Color3B(),
    _m_from:new cc.Color3B()
});
cc.TintTo.actionWithDuration=function(duration, red, green, blue)
{
    var pTintTo = new cc.TintTo();
    pTintTo.initWithDuration(duration, red, green, blue);

    return pTintTo;
};



/** @brief Tints a CCNode that implements the CCNodeRGB protocol from current tint to a custom one.
 @since v0.7.2
 */
cc.TintBy = cc.ActionInterval.extend({
    initWithDuration:function(duration, deltaRed, deltaGreen, deltaBlue)
    {
        if (this._super(duration))
        {
            this._m_deltaR = deltaRed;
            this._m_deltaG = deltaGreen;
            this._m_deltaB = deltaBlue;

            return true;
        }

        return false;
    },
    startWithTarget: function(pTarget)
    {
        this._super(pTarget);
        if (pTarget.RGBAProtocol)
        {
            var color = pTarget.getColor();
            this._m_fromR = color.r;
            this._m_fromG = color.g;
            this._m_fromB = color.b;
        }
    },
    update:function(time)
    {
        if (this._m_pTarget.RGBAProtocol)
        {
            this._m_pTarget.setColor(cc.ccc3((this._m_fromR + this._m_deltaR * time),
                (this._m_fromG + this._m_deltaG * time),
                (this._m_fromB + this._m_deltaB * time)));
        }
    },
    reverse:function()
    {
        return cc.TintBy.actionWithDuration(this._m_fDuration, -this._m_deltaR, -this._m_deltaG, -this._m_deltaB);
    },
    _m_deltaR:0,
    _m_deltaG:0,
    _m_deltaB:0,

    _m_fromR:0,
    _m_fromG:0,
    _m_fromB:0
});
cc.TintBy.actionwithDuration = function(duration, deltaRed, deltaGreen, deltaBlue)
{
    var pTintBy = new cc.TintBy();
    pTintBy.initWithDuration(duration, deltaRed, deltaGreen, deltaBlue);

    return pTintBy;
};


/** @brief Delays the action a certain amount of seconds
 */
cc.DelayTime = cc.ActionInterval.extend({
    update:function(time)
    {

    },
    reverse:function()
    {
        return cc.DelayTime.actionWithDuration(this._m_fDuration);
    }
});
cc.DelayTime.actionwithDuration= function(d)
{
    var pAction = new cc.DelayTime();

    pAction.initWithDuration(d);

    return pAction;
};


/** @brief Executes an action in reverse order, from time=duration to time=0

 @warning Use this action carefully. This action is not
 sequenceable. Use it as the default "reversed" method
 of your own actions, but using it outside the "reversed"
 scope is not recommended.
 */
cc.ReverseTime = cc.ActionInterval.extend({
    initWithAction:function(pAction)
    {
        cc.Assert(pAction != null, "");
        cc.Assert(pAction != this._m_pOther, "");

        if (this._super(pAction.getDuration()))
        {
            // Don't leak if action is reused

            this._m_pOther = pAction;

            return true;
        }

        return false;
    },
    startWithTarget: function(pTarget)
    {
        this._super(pTarget);
        this._m_pOther.startWithTarget(pTarget);
    },
    update:function(time)
    {
        if (this._m_pOther)
        {
            this._m_pOther.update(1 - time);
        }
    },
    reverse:function()
    {
        return this._m_pOther.copy();
    },
    stop:function()
    {
        this._m_pOther.stop();
        this._super();
    },
    _m_pOther: null
});
cc.ReverseTime.actionsWithAction=function(pAction)
{
    var pReverseTime = new cc.ReverseTime();
    pReverseTime.initWithAction(pAction);

    return pReverseTime;
};



/** @brief Animates a sprite given the name of an Animation */
cc.Animate = cc.ActionInterval.extend({
    _m_pAnimation: null,
    _m_pOrigFrame: null,
    _m_bRestoreOriginalFrame: false,
    getAnimation:function(){return this._m_pAnimation;},
    setAnimation:function(pAnimation)
    {
        this._m_pAnimation= pAnimation;
    },
    initWithAnimation:function(pAnimation, bRestoreOriginalFrame)
    {
        cc.Assert(pAnimation != null, "");

        if (this._super(pAnimation.getFrames().count() * pAnimation.getDelay()))
        {
            this._m_bRestoreOriginalFrame = bRestoreOriginalFrame;
            this._m_pAnimation = pAnimation;
            this._m_pOrigFrame = null;

            return true;
        }

        return false;
    },
    initWithDuration:function(duration, pAnimation, bRestoreOriginalFrame)
    {
        cc.Assert(pAnimation != null, "");

        if (this._super(duration))
        {
            this._m_bRestoreOriginalFrame = bRestoreOriginalFrame;
            this._m_pAnimation = pAnimation;
            this._m_pOrigFrame = null;

            return true;
        }

        return false;
    },
    startWithTarget: function(pTarget)
    {
        cc.ActionInterval.startWithTarget(pTarget);
        var pSprite = pTarget;

        if (this._m_bRestoreOriginalFrame)
        {
            this._m_pOrigFrame = pSprite.displayedFrame();
        }
    },
    update:function(time)
    {
        var pFrames = this._m_pAnimation.getFrames();
        var numberOfFrames = pFrames.count();

        var idx = time * numberOfFrames;

        if (idx >= numberOfFrames)
        {
            idx = numberOfFrames - 1;
        }

        var pSprite = this._m_pTarget;
        if (! pSprite.isFrameDisplayed(pFrames[idx]))
        {
            pSprite.setDisplayFrame(pFrames[idx]);
        }
    },
    reverse:function()
    {
        var pNewAnim = cc.Animation.animationWithFrames(this._m_pAnimation.getFrames().reverse(), this._m_pAnimation.getDelay());
        return cc.Animate.actionWithDuration(this._m_fDuration, pNewAnim, this._m_bRestoreOriginalFrame);
    },
    stop:function()
    {
        if (this._m_bRestoreOriginalFrame && this._m_pTarget)
        {
            this._m_pTarget.setDisplayFrame(this._m_pOrigFrame);
        }

        this._super();
    }
});
cc.Animate.actionWithAnimation = function(pAnimation, bRestoreOriginalFrame)
{
    var pAnimate = new cc.Animate();
    var go = (bRestoreOriginalFrame)?bRestoreOriginalFrame: true;
    pAnimate.initWithAnimation(pAnimation, go);

    return pAnimate;
};
cc.Animate.actionwithDuration = function(duration, pAnimation, bRestoreOriginalFrame)
{
    var pAnimate = new cc.Animate();
    pAnimate.initWithDuration(duration, pAnimation, bRestoreOriginalFrame);

    return pAnimate;
};