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
    _elapsed:0,
    _firstTick:false,
    /** how many seconds had elapsed since the actions started to run. */
    getElapsed:function () {
        return this._elapsed;
    },
    /** initializes the action */
    initWithDuration:function (d) {
        this._duration = (d == 0) ? cc.FLT_EPSILON : d;
        // prevent division by 0
        // This comparison could be in step:, but it might decrease the performance
        // by 3% in heavy based action games.
        this._elapsed = 0;
        this._firstTick = true;
        return true;
    },
    /** returns true if the action has finished */
    isDone:function () {
        return (this._elapsed >= this._duration);
    },
    step:function (dt) {
        if (this._firstTick) {
            this._firstTick = false;
            this._elapsed = 0;
        }
        else {
            this._elapsed += dt;
        }
        this.update((1 > (this._elapsed / this._duration)) ? this._elapsed / this._duration : 1);
    },
    startWithTarget:function (target) {
        this._super(target);
        this._elapsed = 0;
        this._firstTick = true;
    },
    reverse:function () {
        /*
         NSException* myException = [NSException
         exceptionWithName:@"ReverseActionNotImplemented"
         reason:@"Reverse Action not implemented"
         userInfo:nil];
         @throw myException;
         */
        return null;
    },
    setAmplitudeRate:function (amp) {
        cc.Assert(0, 'Actioninterval setAmplitudeRate');
    },
    getAmplitudeRate:function () {
        cc.Assert(0, 'Actioninterval getAmplitudeRate');
        return 0;
    }
});
cc.ActionInterval.actionWithDuration = function (d) {
    var action = new cc.ActionInterval();
    action.initWithDuration(d);
    return action;
};


/** @brief Runs actions sequentially, one after another
 */
cc.Sequence = cc.ActionInterval.extend({
    _actions:null,
    _split:null,
    _last:0,

    ctor:function () {
        this._actions = [];
    },

    /** initializes the action */
    // bool initOneTwo(CCFiniteTimeAction *actionOne, CCFiniteTimeAction *actionTwo);
    initOneTwo:function (actionOne, actionTwo) {
        cc.Assert(actionOne != null, "Sequence.initOneTwo");
        cc.Assert(actionTwo != null, "Sequence.initOneTwo");

        var one = actionOne.getDuration();
        var two = actionTwo.getDuration();
        if (isNaN(one) || isNaN(two)) {
            console.log(actionOne);
            console.log(actionTwo);
        }
        var d = actionOne.getDuration() + actionTwo.getDuration();
        this.initWithDuration(d);

        this._actions[0] = actionOne;
        this._actions[1] = actionTwo;

        return true;
    },
    startWithTarget:function (target) {
        this._super(target);
        this._split = this._actions[0].getDuration() / this._duration;
        this._last = -1;
    },
    stop:function () {
        this._actions[0].stop();
        this._actions[1].stop();
        this._super();
    },
    update:function (time) {
        var found = 0;
        var new_t = 0;
        if (time >= this._split) {
            found = 1;
            new_t = (this._split == 1) ? 1 : (time - this._split) / (1 - this._split);
        }
        else {
            found = 0;
            new_t = (this._split != 0) ? time / this._split : 1;
        }
        if (this._last == -1 && found == 1) {
            this._actions[0].startWithTarget(this._target);
            this._actions[0].update(1);
            this._actions[0].stop();
        }
        if (this._last != found) {
            if (this._last != -1) {
                this._actions[this._last].update(1);
                this._actions[this._last].stop();
            }

            this._actions[found].startWithTarget(this._target);
        }
        this._actions[found].update(new_t);
        this._last = found;
    },
    reverse:function () {
        return cc.Sequence.actionOneTwo(this._actions[1].reverse(), this._actions[0].reverse());
    }
});
/** helper constructor to create an array of sequenceable actions */
cc.Sequence.actions = function (/*Multiple Arguments*/) {
    var prev = arguments[0];
    for (var i = 1; i < arguments.length; i++) {
        if (arguments[i] != null) {
            prev = cc.Sequence.actionOneTwo(prev, arguments[i]);
        }
    }
    return prev;

};
/** helper contructor to create an array of sequenceable actions given an array */
cc.Sequence.actionsWithArray = function (actions) {
    var prev = this.actions[0];
    for (var i = 1; i < this.actions.length; ++i) {
        prev = this.actionOneTwo(prev, this.actions[i]);
    }
    return prev;
};
/** creates the action */
cc.Sequence.actionOneTwo = function (actionOne, actionTwo) {
    var sequence = new cc.Sequence();
    sequence.initOneTwo(actionOne, actionTwo);
    return sequence;
};


/** @brief Repeats an action a number of times.
 * To repeat an action forever use the CCRepeatForever action.
 */
cc.Repeat = cc.ActionInterval.extend({
    _times:0,
    _total:0,
    _innerAction:null, //CCFiniteTimeAction
    initWithAction:function (action, times) {
        var d = action.getDuration() * times;

        if (this.initWithDuration(d)) {
            this._times = times;
            this._innerAction = action;
            this._total = 0;
            return true;
        }
        return false;
    },
    startWithTarget:function (target) {
        this._total = 0;
        this._super(target);
        this._innerAction.startWithTarget(target);
    },
    stop:function () {
        this._innerAction.stop();
        this._super();
    },
    update:function (time) {
        var t = time * this._times;
        if (t > this._total + 1) {
            this._innerAction.update(1);
            this._total++;
            this._innerAction.stop();
            this._innerAction.startWithTarget(this._target);

            // repeat is over?
            if (this._total == this._times) {
                // so, set it in the original position
                this._innerAction.update(0);
            }
            else {
                // no ? start next repeat with the right update
                // to prevent jerk (issue #390)
                this._innerAction.update(t - this._total);
            }
        }
        else {
            var r = t % 1;

            // fix last repeat position
            // else it could be 0.
            if (time == 1) {
                r = 1;
                this._total++; // this is the added line
            }

            //		other->update(min(r, 1));
            this._innerAction.update((r > 1) ? 1 : r);
        }
    },
    isDone:function () {
        return this._total == this._times;
    },
    reverse:function () {
        return cc.Repeat.actionWithAction(this._innerAction.reverse(), this._times);
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
/** creates a CCRepeat action. Times is an unsigned integer between 1 and pow(2,30) */
cc.Repeat.actionWithAction = function (action, times) {
    var repeat = new cc.Repeat();
    repeat.initWithAction(action, times);
    return repeat;
};


/** @brief Repeats an action for ever.
 To repeat the an action for a limited number of times use the Repeat action.
 @warning This action can't be Sequenceable because it is not an IntervalAction
 */
cc.RepeatForever = cc.ActionInterval.extend({
    _innerAction:null, //CCActionInterval
    initWithAction:function (action) {
        cc.Assert(action != null, "");

        this._innerAction = action;
        return true;
    },
    startWithTarget:function (target) {
        this._super(target);
        this._innerAction.startWithTarget(target);
    },
    step:function (dt) {
        this._innerAction.step(dt);
        if (this._innerAction.isDone()) {
            var diff = dt + this._innerAction.getDuration() - this._innerAction.getElapsed();
            this._innerAction.startWithTarget(this._target);
            // to prevent jerk. issue #390
            this._innerAction.step(diff);
        }
    },
    isDone:function () {
        return false;
    },
    reverse:function () {
        return (cc.RepeatForever.actionWithAction(this._innerAction.reverse()));
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
cc.RepeatForever.actionWithAction = function (action) {
    var ret = new cc.RepeatForever();
    if (ret && ret.initWithAction(action)) {
        return ret;
    }
    return null;
};


/** @brief Spawn a new action immediately
 */
cc.Spawn = cc.ActionInterval.extend({
    /** initializes the Spawn action with the 2 actions to spawn */
    initOneTwo:function (action1, action2) {
        cc.Assert(action1 != null, "no action1");
        cc.Assert(action2 != null, "no action2");

        var ret = false;

        var d1 = action1.getDuration();
        var d2 = action2.getDuration();

        if (this.initWithDuration(Math.max(d1, d2))) {
            this._one = action1;
            this._two = action2;

            if (d1 > d2) {
                this._two = cc.Sequence.actionOneTwo(action2, cc.DelayTime.actionWithDuration(d1 - d2));
            } else
            if (d1 < d2) {
                this._one = cc.Sequence.actionOneTwo(action1, cc.DelayTime.actionWithDuration(d2 - d1));
            }

            ret = true;
        }
        return ret;
    },
    startWithTarget:function (target) {
        this._super(target);
        this._one.startWithTarget(target);
        this._two.startWithTarget(target);
    },
    stop:function () {
        this._one.stop();
        this._two.stop();
        this._super();
    },
    update:function (time) {
        if (this._one) {
            this._one.update(time);
        }
        if (this._two) {
            this._two.update(time);
        }
    },
    reverse:function () {
        return cc.Spawn.actionOneTwo(this._one.reverse(), this._two.reverse());
    },
    _one:null,
    _two:null
});
cc.Spawn.actions = function (/*Multiple Arguments*/) {
    var prev = arguments[0];
    for (var i = 1; i < arguments.length; i++) {
        if (arguments[i] != null) {
            prev = this.actionOneTwo(prev, arguments[i]);
        }
    }
    return prev;
};
cc.Spawn.actionsWithArray = function (actions) {
    var prev = actions[0];

    for (var i = 1; i < actions.length; ++i) {
        prev = this.actionOneTwo(prev, actions[i]);
    }

    return prev;
};
cc.Spawn.actionOneTwo = function (action1, action2) {
    var pSpawn = new cc.Spawn();
    pSpawn.initOneTwo(action1, action2);

    return pSpawn;
};


/** @brief Rotates a CCNode object to a certain angle by modifying it's
 rotation attribute.
 The direction will be decided by the shortest angle.
 */
cc.RotateTo = cc.ActionInterval.extend({
    _dstAngle:0,
    _startAngle:0,
    _diffAngle:0,
    initWithDuration:function (duration, deltaAngle) {
        if (this._super(duration)) {
            this._dstAngle = deltaAngle;
            return true;
        }

        return false;
    },
    startWithTarget:function (target) {
        this._super(target);

        this._startAngle = target.getRotation();

        if (this._startAngle > 0) {
            this._startAngle = this._startAngle % 360.0;
        }
        else {
            this._startAngle = this._startAngle % 360.0;
        }

        this._diffAngle = this._dstAngle - this._startAngle;
        if (this._diffAngle > 180) {
            this._diffAngle -= 360;
        }

        if (this._diffAngle < -180) {
            this._diffAngle += 360;
        }
    },
    reverse:function () {
        cc.Assert(0, "RotateTo reverse not implemented");
    },
    update:function (time) {
        if (this._target) {
            this._target.setRotation(this._startAngle + this._diffAngle * time);
        }
    }
});
cc.RotateTo.actionWithDuration = function (duration, deltaAngle) {
    var rotateTo = new cc.RotateTo();
    rotateTo.initWithDuration(duration, deltaAngle);

    return rotateTo;
};


/** @brief Rotates a CCNode object clockwise a number of degrees by modifying it's rotation attribute.
 */
cc.RotateBy = cc.ActionInterval.extend({
    _angle:0,
    _startAngle:0,
    initWithDuration:function (duration, deltaAngle) {
        if (this._super(duration)) {
            this._angle = deltaAngle;
            return true;
        }

        return false;
    },
    startWithTarget:function (target) {
        this._super(target);
        this._startAngle = target.getRotation();
    },
    update:function (time) {
        if (this._target) {
            this._target.setRotation(this._startAngle + this._angle * time);
        }
    },
    reverse:function () {
        return cc.RotateBy.actionWithDuration(this._duration, -this._angle);
    }
});
cc.RotateBy.actionWithDuration = function (duration, deltaAngle) {
    var rotateBy = new cc.RotateBy();
    rotateBy.initWithDuration(duration, deltaAngle);

    return rotateBy;
};


/** @brief Moves a CCNode object to the position x,y. x and y are absolute coordinates by modifying it's position attribute.
 */
cc.MoveTo = cc.ActionInterval.extend({
    initWithDuration:function (duration, position) {
        if (this._super(duration)) {
            this._endPosition = position;
            return true;
        }

        return false;
    },
    startWithTarget:function (target) {
        this._super(target);
        this._startPosition = target.getPosition();
        this._delta = cc.ccpSub(this._endPosition, this._startPosition);
    },
    update:function (time) {
        if (this._target) {
            this._target.setPosition(cc.ccp(this._startPosition.x + this._delta.x * time,
                this._startPosition.y + this._delta.y * time));
        }
    },
    reverse:function () {
        cc.Assert(0, "moveto implement reverse");
    },
    _endPosition:new cc.Point(),
    _startPosition:new cc.Point(),
    _delta:new cc.Point()
});
cc.MoveTo.actionWithDuration = function (duration, position) {
    var moveTo = new cc.MoveTo();
    moveTo.initWithDuration(duration, position);

    return moveTo;
};


/** @brief Moves a CCNode object x,y pixels by modifying it's position attribute.
 x and y are relative to the position of the object.
 Duration is is seconds.
 */
cc.MoveBy = cc.MoveTo.extend({
    initWithDuration:function (duration, position) {
        if (this._super(duration, position)) {
            this._delta = position;
            return true;
        }

        return false;
    },
    startWithTarget:function (target) {
        var temp = this._delta;
        this._super(target);
        this._delta = temp;
    },
    reverse:function () {
        return cc.MoveBy.actionWithDuration(this._duration, cc.ccp(-this._delta.x, -this._delta.y));
    }
});
cc.MoveBy.actionWithDuration = function (duration, position) {
    var moveBy = new cc.MoveBy();
    moveBy.initWithDuration(duration, position);

    return moveBy;
};


/** Skews a CCNode object to given angles by modifying it's skewX and skewY attributes
 @since v1.0
 */
cc.SkewTo = cc.ActionInterval.extend({
    initWithDuration:function (t, sx, sy) {
        var ret = false;

        if (this._super(t)) {
            this._endSkewX = sx;
            this._endSkewY = sy;

            ret = true;
        }

        return ret;
    },
    startWithTarget:function (target) {
        this._super(target);

        this._startSkewX = target.getSkewX();


        if (this._startSkewX > 0) {
            this._startSkewX = this._startSkewX % 180;
        }
        else {
            this._startSkewX = this._startSkewX % -180;
        }

        this._deltaX = this._endSkewX - this._startSkewX;

        if (this._deltaX > 180) {
            this._deltaX -= 360;
        }
        if (this._deltaX < -180) {
            this._deltaX += 360;
        }


        this._startSkewY = target.getSkewY();
        if (this._startSkewY > 0) {
            this._startSkewY = this._startSkewY % 360;
        }
        else {
            this._startSkewY = this._startSkewY % -360;
        }

        this._deltaY = this._endSkewY - this._startSkewY;

        if (this._deltaY > 180) {
            this._deltaY -= 360;
        }
        if (this._deltaY < -180) {
            this._deltaY += 360;
        }
    },
    update:function (t) {
        this._target.setSkewX(this._startSkewX + this._deltaX * t);

        this._target.setSkewY(this._startSkewY + this._deltaY * t);
    },
    _skewX:0,
    _skewY:0,
    _startSkewX:0,
    _startSkewY:0,
    _endSkewX:0,
    _endSkewY:0,
    _deltaX:0,
    _deltaY:0
});
cc.SkewTo.actionWithDuration = function (t, sx, sy) {
    var skewTo = new cc.SkewTo();
    if (skewTo) {
        skewTo.initWithDuration(t, sx, sy)
    }
    return skewTo;
};


/** Skews a CCNode object by skewX and skewY degrees
 @since v1.0
 */
cc.SkewBy = cc.SkewTo.extend({
    initWithDuration:function (t, deltaSkewX, deltaSkewY) {
        var ret = false;

        if (this._super(t, deltaSkewX, deltaSkewY)) {
            this._skewX = deltaSkewX;
            this._skewY = deltaSkewY;

            ret = true;
        }

        return ret;
    },
    startWithTarget:function (target) {
        this._super(target);
        this._deltaX = this._skewX;
        this._deltaY = this._skewY;
        this._endSkewX = this._startSkewX + this._deltaX;
        this._endSkewY = this._startSkewY + this._deltaY;
    },
    reverse:function () {
        return cc.SkewBy.actionWithDuration(this._duration, -this._skewX, -this._skewY);
    }
});
cc.SkewBy.actionWithDuration = function (t, sx, sy) {
    var skewBy = new cc.SkewBy();
    if (skewBy) {
        skewBy.initWithDuration(t, sx, sy);
    }

    return skewBy;
};


/** @brief Moves a CCNode object simulating a parabolic jump movement by modifying it's position attribute.
 */
cc.JumpBy = cc.ActionInterval.extend({
    initWithDuration:function (duration, position, height, jumps) {
        if (this._super(duration)) {
            this._delta = position;
            this._height = height;
            this._jumps = jumps;

            return true;
        }

        return false;
    },
    startWithTarget:function (target) {
        this._super(target);
        this._startPosition = target.getPosition();
    },
    update:function (time) {
        if (this._target) {
            var frac = time * this._jumps % 1.0;
            var y = this._height * 4 * frac * (1 - frac);
            y += this._delta.y * time;
            var x = this._delta.x * time;
            this._target.setPosition(cc.ccp(this._startPosition.x + x, this._startPosition.y + y));
        }
    },
    reverse:function () {
        return cc.JumpBy.actionWithDuration(this._duration, cc.ccp(-this._delta.x, -this._delta.y), this._height, this._jumps);
    },
    _startPosition:new cc.Point(),
    _delta:new cc.Point(),
    _height:0,
    _jumps:0
});
cc.JumpBy.actionWithDuration = function (duration, position, height, jumps) {
    var jumpBy = new cc.JumpBy();
    jumpBy.initWithDuration(duration, position, height, jumps);

    return jumpBy;
};


/** @brief Moves a CCNode object to a parabolic position simulating a jump movement by modifying it's position attribute.
 */
cc.JumpTo = cc.JumpBy.extend({
    startWithTarget:function (target) {
        this._super(target);
        this._delta = cc.ccp(this._delta.x - this._startPosition.x, this._delta.y - this._startPosition.y);
    }
});
cc.JumpTo.actionWithDuration = function (duration, position, height, jumps) {
    var jumpTo = new cc.JumpTo();
    jumpTo.initWithDuration(duration, position, height, jumps);

    return jumpTo;
};

/** @typedef bezier configuration structure
 */
cc.BezierConfig = cc.Class.extend({
    ctor:function () {
        this.endPosition = new cc.Point();
        this.controlPoint_1 = new cc.Point();
        this.controlPoint_2 = new cc.Point();
    }
});
cc.bezierat = function (a, b, c, d, t) {
    return (Math.pow(1 - t, 3) * a +
        3 * t * (Math.pow(1 - t, 2)) * b +
        3 * Math.pow(t, 2) * (1 - t) * c +
        Math.pow(t, 3) * d );
};

/** @brief An action that moves the target with a cubic Bezier curve by a certain distance.
 */
cc.BezierBy = cc.ActionInterval.extend({
    initWithDuration:function (t, c) {
        if (this._super(t)) {
            this._config = c;
            return true;
        }

        return false;
    },
    startWithTarget:function (target) {
        this._super(target);
        this._startPosition = target.getPosition();
    },
    update:function (time) {
        if (this._target) {
            var xa = 0;
            var xb = this._config.controlPoint_1.x;
            var xc = this._config.controlPoint_2.x;
            var xd = this._config.endPosition.x;

            var ya = 0;
            var yb = this._config.controlPoint_1.y;
            var yc = this._config.controlPoint_2.y;
            var yd = this._config.endPosition.y;

            var x = cc.bezierat(xa, xb, xc, xd, time);
            var y = cc.bezierat(ya, yb, yc, yd, time);
            this._target.setPosition(cc.ccpAdd(this._startPosition, cc.ccp(x, y)));
        }
    },
    reverse:function () {
        var r = new cc.BezierConfig();

        r.endPosition = cc.ccpNeg(this._config.endPosition);
        r.controlPoint_1 = cc.ccpAdd(this._config.controlPoint_2, cc.ccpNeg(this._config.endPosition));
        r.controlPoint_2 = cc.ccpAdd(this._config.controlPoint_1, cc.ccpNeg(this._config.endPosition));

        var action = cc.BezierBy.actionWithDuration(this._duration, r);
        return action;
    },
    ctor:function () {
        this._config = new cc.BezierConfig();
        this._startPosition = new cc.Point();
    }
});
cc.BezierBy.actionWithDuration = function (t, c) {
    var bezierBy = new cc.BezierBy();
    bezierBy.initWithDuration(t, c);

    return bezierBy;
};


/** @brief An action that moves the target with a cubic Bezier curve to a destination point.
 @since v0.8.2
 */
cc.BezierTo = cc.BezierBy.extend({
    startWithTarget:function (target) {
        this._super(target);
        this._config.controlPoint_1 = cc.ccpSub(this._config.controlPoint_1, this._startPosition);
        this._config.controlPoint_2 = cc.ccpSub(this._config.controlPoint_2, this._startPosition);
        this._config.endPosition = cc.ccpSub(this._config.endPosition, this._startPosition);
    }
});
cc.BezierTo.actionWithDuration = function (t, c) {
    var bezierTo = new cc.BezierTo();
    bezierTo.initWithDuration(t, c);

    return bezierTo;
};


/** @brief Scales a CCNode object to a zoom factor by modifying it's scale attribute.
 @warning This action doesn't support "reverse"
 */
cc.ScaleTo = cc.ActionInterval.extend({
    initWithDuration:function (duration, sx, sy)//function overload here
    {
        if (this._super(duration)) {
            this._endScaleX = sx;
            this._endScaleY = (sy != null) ? sy : sx;

            return true;
        }

        return false;
    },
    startWithTarget:function (target) {
        this._super(target);
        this._startScaleX = target.getScaleX();
        this._startScaleY = target.getScaleY();
        this._deltaX = this._endScaleX - this._startScaleX;
        this._deltaY = this._endScaleY - this._startScaleY;
    },
    update:function (time) {
        if (this._target) {
            this._target.setScaleX(this._startScaleX + this._deltaX * time);
            this._target.setScaleY(this._startScaleY + this._deltaY * time);
        }
    },
    _scaleX:1,
    _scaleY:1,
    _startScaleX:1,
    _startScaleY:1,
    _endScaleX:0,
    _endScaleY:0,
    _deltaX:0,
    _deltaY:0
});
cc.ScaleTo.actionWithDuration = function (duration, sx, sy)//function overload
{
    var scaleTo = new cc.ScaleTo();
    if (sy) {
        scaleTo.initWithDuration(duration, sx, sy);
    }
    else {
        scaleTo.initWithDuration(duration, sx);
    }

    return scaleTo;
};


/** @brief Scales a CCNode object a zoom factor by modifying it's scale attribute.
 */
cc.ScaleBy = cc.ScaleTo.extend({
    startWithTarget:function (target) {
        this._super(target);
        this._deltaX = this._startScaleX * this._endScaleX - this._startScaleX;
        this._deltaY = this._startScaleY * this._endScaleY - this._startScaleY;
    },
    reverse:function () {
        return cc.ScaleBy.actionWithDuration(this._duration, 1 / this._endScaleX, 1 / this._endScaleY);
    }
});
cc.ScaleBy.actionWithDuration = function (duration, sx, sy) {
    var scaleBy = new cc.ScaleBy();
    if (arguments.length == 3) {
        scaleBy.initWithDuration(duration, sx, sy);
    }
    else {
        scaleBy.initWithDuration(duration, sx);
    }

    return scaleBy;
};

/** @brief Blinks a CCNode object by modifying it's visible attribute
 */
cc.Blink = cc.ActionInterval.extend({
    initWithDuration:function (duration, blinks) {
        if (this._super(duration)) {
            this._times = blinks;
            return true;
        }

        return false;
    },
    update:function (time) {
        if (this._target && !this.isDone()) {
            var slice = 1.0 / this._times;
            var m = time % slice;
            this._target.setIsVisible(m > slice / 2 ? true : false);
        }
    },
    reverse:function () {
        return cc.Blink.actionWithDuration(this._duration, this._times);
    },
    _times:0
});
cc.Blink.actionWithDuration = function (duration, blinks) {
    var blink = new cc.Blink();
    blink.initWithDuration(duration, blinks);

    return blink;
};


/** @brief Fades In an object that implements the CCRGBAProtocol protocol. It modifies the opacity from 0 to 255.
 The "reverse" of this action is FadeOut
 */
cc.FadeIn = cc.ActionInterval.extend({
    update:function (time) {
        this._target.setOpacity(255 * time);
    },
    reverse:function () {
        return cc.FadeOut.actionWithDuration(this._duration);
    }
});
cc.FadeIn.actionWithDuration = function (d) {
    var action = new cc.FadeIn();

    action.initWithDuration(d);

    return action;
};


/** @brief Fades Out an object that implements the CCRGBAProtocol protocol. It modifies the opacity from 255 to 0.
 The "reverse" of this action is FadeIn
 */
cc.FadeOut = cc.ActionInterval.extend({
    update:function (time) {
        this._target.setOpacity(255 * (1 - time));
    },
    reverse:function () {
        return cc.FadeIn.actionWithDuration(this._duration);
    }
});
cc.FadeOut.actionWithDuration = function (d) {
    var action = new cc.FadeOut();

    action.initWithDuration(d);

    return action;
};


/** @brief Fades an object that implements the CCRGBAProtocol protocol. It modifies the opacity from the current value to a custom one.
 @warning This action doesn't support "reverse"
 */
cc.FadeTo = cc.ActionInterval.extend({
    initWithDuration:function (duration, opacity) {
        if (this._super(duration)) {
            this._toOpacity = opacity;
            return true;
        }

        return false;
    },
    update:function (time) {
        this._target.setOpacity((this._fromOpacity + (this._toOpacity - this._fromOpacity) * time));
    },
    startWithTarget:function (target) {
        this._super(target);
        this._fromOpacity = target.getOpacity();
    },
    _toOpacity:'',
    _fromOpacity:''
});
cc.FadeTo.actionWithDuration = function (duration, opacity) {
    var fadeTo = new cc.FadeTo();
    fadeTo.initWithDuration(duration, opacity);

    return fadeTo;
};


/** @brief Tints a CCNode that implements the CCNodeRGB protocol from current tint to a custom one.
 @warning This action doesn't support "reverse"
 @since v0.7.2
 */
cc.TintTo = cc.ActionInterval.extend({
    initWithDuration:function (duration, red, green, blue) {
        if (this._super(duration)) {
            this._to = cc.ccc3(red, green, blue);
            return true;
        }

        return false;
    },
    startWithTarget:function (target) {
        this._super(target);
        this._from = this._target.getColor();
    },
    update:function (time) {
        this._target.setColor(cc.ccc3(this._from.r + (this._to.r - this._from.r) * time,
            (this._from.g + (this._to.g - this._from.g) * time),
            (this._from.b + (this._to.b - this._from.b) * time)));
    },
    _to:new cc.Color3B(),
    _from:new cc.Color3B()
});
cc.TintTo.actionWithDuration = function (duration, red, green, blue) {
    var tintTo = new cc.TintTo();
    tintTo.initWithDuration(duration, red, green, blue);

    return tintTo;
};


/** @brief Tints a CCNode that implements the CCNodeRGB protocol from current tint to a custom one.
 @since v0.7.2
 */
cc.TintBy = cc.ActionInterval.extend({
    initWithDuration:function (duration, deltaRed, deltaGreen, deltaBlue) {
        if (this._super(duration)) {
            this._deltaR = deltaRed;
            this._deltaG = deltaGreen;
            this._deltaB = deltaBlue;

            return true;
        }

        return false;
    },
    startWithTarget:function (target) {
        this._super(target);
        //if (target.RGBAProtocol) {
        var color = target.getColor();
        this._fromR = color.r;
        this._fromG = color.g;
        this._fromB = color.b;
        //}
    },
    update:function (time) {
        //if (this._target.RGBAProtocol) {
        this._target.setColor(cc.ccc3((this._fromR + this._deltaR * time),
            (this._fromG + this._deltaG * time),
            (this._fromB + this._deltaB * time)));
        //}
    },
    reverse:function () {
        return cc.TintBy.actionWithDuration(this._duration, -this._deltaR, -this._deltaG, -this._deltaB);
    },
    _deltaR:0,
    _deltaG:0,
    _deltaB:0,

    _fromR:0,
    _fromG:0,
    _fromB:0
});
cc.TintBy.actionWithDuration = function (duration, deltaRed, deltaGreen, deltaBlue) {
    var tintBy = new cc.TintBy();
    tintBy.initWithDuration(duration, deltaRed, deltaGreen, deltaBlue);

    return tintBy;
};


/** @brief Delays the action a certain amount of seconds
 */
cc.DelayTime = cc.ActionInterval.extend({
    update:function (time) {

    },
    reverse:function () {
        return cc.DelayTime.actionWithDuration(this._duration);
    }
});
cc.DelayTime.actionWithDuration = function (d) {
    var action = new cc.DelayTime();

    action.initWithDuration(d);

    return action;
};


/** @brief Executes an action in reverse order, from time=duration to time=0

 @warning Use this action carefully. This action is not
 sequenceable. Use it as the default "reversed" method
 of your own actions, but using it outside the "reversed"
 scope is not recommended.
 */
cc.ReverseTime = cc.ActionInterval.extend({
    initWithAction:function (action) {
        cc.Assert(action != null, "");
        cc.Assert(action != this._other, "");

        if (this._super(action.getDuration())) {
            // Don't leak if action is reused

            this._other = action;

            return true;
        }

        return false;
    },
    startWithTarget:function (target) {
        this._super(target);
        this._other.startWithTarget(target);
    },
    update:function (time) {
        if (this._other) {
            this._other.update(1 - time);
        }
    },
    reverse:function () {
        return this._other.copy();
    },
    stop:function () {
        this._other.stop();
        this._super();
    },
    _other:null
});
cc.ReverseTime.actionsWithAction = function (action) {
    var reverseTime = new cc.ReverseTime();
    reverseTime.initWithAction(action);

    return reverseTime;
};


/** @brief Animates a sprite given the name of an Animation */
cc.Animate = cc.ActionInterval.extend({
    _animation:null,
    _origFrame:null,
    _restoreOriginalFrame:false,
    getAnimation:function () {
        return this._animation;
    },
    setAnimation:function (animation) {
        this._animation = animation;
    },
    initWithAnimation:function (animation, restoreOriginalFrame) {
        cc.Assert(animation != null, "");
        if (this.initWithDuration(animation.getFrames().length * animation.getDelay(), null, null, true)) {
            this._restoreOriginalFrame = restoreOriginalFrame;
            this._animation = animation;
            this._origFrame = null;
            return true;
        }

        return false;
    },
    initWithDuration:function (duration, animation, restoreOriginalFrame, isDirectCall) {
        if (isDirectCall) {
            return this._super(duration);
        }
        cc.Assert(animation != null, "");

        if (this._super(duration)) {
            this._restoreOriginalFrame = restoreOriginalFrame;
            this._animation = animation;
            this._origFrame = null;

            return true;
        }

        return false;
    },
    startWithTarget:function (target) {
        this._super(target);

        if (this._restoreOriginalFrame) {
            this._origFrame = target.displayedFrame();
        }
    },
    update:function (time) {
        var frames = this._animation.getFrames();
        var numberOfFrames = frames.length;

        var idx = Math.round(time * numberOfFrames);

        if (idx >= numberOfFrames) {
            idx = numberOfFrames - 1;
        }

        var sprite = this._target;
        if (!sprite.isFrameDisplayed(frames[idx])) {
            sprite.setDisplayFrame(frames[idx]);
        }
    },
    reverse:function () {
        var newAnim = cc.Animation.animationWithFrames(this._animation.getFrames().reverse(), this._animation.getDelay());
        return cc.Animate.actionWithDuration(this._duration, newAnim, this._restoreOriginalFrame);
    },
    stop:function () {
        if (this._restoreOriginalFrame && this._target) {
            this._target.setDisplayFrame(this._origFrame);
        }

        this._super();
    }
});
cc.Animate.actionWithAnimation = function (animation, restoreOriginalFrame) {
    var animate = new cc.Animate();
    var go = (restoreOriginalFrame) ? restoreOriginalFrame : true;
    animate.initWithAnimation(animation, go);

    return animate;
};
cc.Animate.actionWithDuration = function (duration, animation, restoreOriginalFrame) {
    var animate = new cc.Animate();
    animate.initWithDuration(duration, animation, restoreOriginalFrame);

    return animate;
};