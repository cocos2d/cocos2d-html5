/****************************************************************************
 Copyright (c) 2008-2010 Ricardo Quesada
 Copyright (c) 2011-2012 cocos2d-x.org
 Copyright (c) 2013-2014 Chukong Technologies Inc.

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
 * <p> An interval action is an action that takes place within a certain period of time. <br/>
 * It has an start time, and a finish time. The finish time is the parameter<br/>
 * duration plus the start time.</p>
 *
 * <p>These CCActionInterval actions have some interesting properties, like:<br/>
 * - They can run normally (default)  <br/>
 * - They can run reversed with the reverse method   <br/>
 * - They can run with the time altered with the Accelerate, AccelDeccel and Speed actions. </p>
 *
 * <p>For example, you can simulate a Ping Pong effect running the action normally and<br/>
 * then running it again in Reverse mode. </p>
 *
 * @class
 * @extends cc.FiniteTimeAction
 * @Example
 * // example
 * var pingPongAction = cc.Sequence.create(action, action.reverse());
 */
cc.ActionInterval = cc.FiniteTimeAction.extend(/** @lends cc.ActionInterval# */{
    _elapsed:0,
    _firstTick:false,
    _easeList: null,

	/**
	 * @constructor
	 * @param {Number} d duration in seconds
	 * @example
	 * var actionInterval = new cc.ActionInterval(3);
	 */
    ctor:function (d) {
        cc.FiniteTimeAction.prototype.ctor.call(this);
		d !== undefined && this.initWithDuration(d);
    },

    /** how many seconds had elapsed since the actions started to run.
     * @return {Number}
     */
    getElapsed:function () {
        return this._elapsed;
    },

    /** initializes the action
     * @param {Number} d duration in seconds
     * @return {Boolean}
     */
    initWithDuration:function (d) {
        this._duration = (d === 0) ? cc.FLT_EPSILON : d;
        // prevent division by 0
        // This comparison could be in step:, but it might decrease the performance
        // by 3% in heavy based action games.
        this._elapsed = 0;
        this._firstTick = true;
        return true;
    },

    /** returns true if the action has finished
     * @return {Boolean}
     */
    isDone:function () {
        return (this._elapsed >= this._duration);
    },

    /**
     * returns a new clone of the action
     * @returns {cc.ActionInterval}
     */
    clone:function () {
        return new cc.ActionInterval(this._duration);
    },

    easing: function (easeObj) {
        var locEaseList = this._easeList;
        if (locEaseList)
            locEaseList.length = 0;
        else
            locEaseList = [];
        for (var i = 0; i < arguments.length; i++)
            locEaseList.push(arguments[i]);
        return this;
    },

    _computeEaseTime: function (dt) {
        var locList = this._easeList;
        if ((!locList) || (locList.length === 0))
            return dt;
        for (var i = 0, n = locList.length; i < n; i++)
            dt = locList.easing(dt);
        return dt;
    },

    /**
     * @param {Number} dt delta time in seconds
     */
    step:function (dt) {
        dt = this._computeEaseTime(dt);
        if (this._firstTick) {
            this._firstTick = false;
            this._elapsed = 0;
        } else
            this._elapsed += dt;

        //this.update((1 > (this._elapsed / this._duration)) ? this._elapsed / this._duration : 1);
        //this.update(Math.max(0, Math.min(1, this._elapsed / Math.max(this._duration, cc.FLT_EPSILON))));
        var t = this._elapsed / (this._duration > 0.0000001192092896 ? this._duration : 0.0000001192092896);
        t = (1 > t ? t : 1);
        this.update(t > 0 ? t : 0);
    },

    /**
     * @param {cc.Node} target
     */
    startWithTarget:function (target) {
        cc.Action.prototype.startWithTarget.call(this, target);
        this._elapsed = 0;
        this._firstTick = true;
    },

    /**
     * @return {Null}
     */
    reverse:function () {
        cc.log("cc.IntervalAction: reverse not implemented.");
        return null;
    },

    /**
     * @param {Number} amp
     */
    setAmplitudeRate:function (amp) {
        // Abstract class needs implementation
        cc.log("cc.ActionInterval.setAmplitudeRate(): it should be overridden in subclass.");
    },

    /**
     * @return {Number}
     */
    getAmplitudeRate:function () {
        // Abstract class needs implementation
        cc.log("cc.ActionInterval.getAmplitudeRate(): it should be overridden in subclass.");
        return 0;
    },

    _speed:0.0,

    /**
     * Changes the speed of an action, making it take longer (speed>1)
     * or less (speed<1) time. <br/>
     * Useful to simulate 'slow motion' or 'fast forward' effect.
     *
     * @param speed
     * @returns {cc.Action}
     */
    speed: function(speed){

        var self = this;
        self._speed = speed;
        var _step = self.step;
        self.step = function(dt){
            _step.call(self, dt * speed);
        };

        return this;
    },

    /**
     * @return {Number}
     */
    getSpeed: function(speed){
        return this._speed;
    }
});

/**
 * @param {Number} d duration in seconds
 * @return {cc.ActionInterval}
 * @example
 * // example
 * var actionInterval = cc.ActionInterval.create(3);
 */
cc.ActionInterval.create = function (d) {
    return new cc.ActionInterval(d);
};


/** Runs actions sequentially, one after another
 * @class
 * @extends cc.ActionInterval
 */
cc.Sequence = cc.ActionInterval.extend(/** @lends cc.Sequence# */{
    _actions:null,
    _split:null,
    _last:0,

	/** Create an array of sequenceable actions
	 * @constructor
	 * @param {Array|cc.FiniteTimeAction} tempArray
	 * @example
	 * // create sequence with actions
	 * var seq = new cc.Sequence(act1, act2);
	 *
	 * // create sequence with array
	 * var seq = new cc.Sequence(actArray);
	 */
    ctor:function (tempArray) {
        cc.ActionInterval.prototype.ctor.call(this);
        this._actions = [];

		var paramArray = (tempArray instanceof Array) ? tempArray : arguments;
		var last = paramArray.length - 1;
		if ((last >= 0) && (paramArray[last] == null))
			cc.log("parameters should not be ending with null in Javascript");

		if (last >= 0) {
			var prev = paramArray[0], action1;
			for (var i = 1; i < last; i++) {
				if (paramArray[i]) {
					action1 = prev;
					prev = cc.Sequence.create();
					prev.initWithTwoActions(action1, paramArray[i]);
				}
			}
			this.initWithTwoActions(prev, paramArray[last]);
		}
    },

    /** initializes the action <br/>
     * @param {cc.FiniteTimeAction} actionOne
     * @param {cc.FiniteTimeAction} actionTwo
     * @return {Boolean}
     */
    initWithTwoActions:function (actionOne, actionTwo) {
        if(!actionOne || !actionTwo)
            throw "cc.Sequence.initWithTwoActions(): arguments must all be non nil";

        var d = actionOne.getDuration() + actionTwo.getDuration();
        this.initWithDuration(d);

        this._actions[0] = actionOne;
        this._actions[1] = actionTwo;
        return true;
    },

    /**
     * returns a new clone of the action
     * @returns {cc.Sequence}
     */
    clone:function () {
        var action = new cc.Sequence();
        action.initWithTwoActions(this._actions[0].clone(), this._actions[1].clone());
        return action;
    },

    /**
     * @param {cc.Node} target
     */
    startWithTarget:function (target) {
        cc.ActionInterval.prototype.startWithTarget.call(this, target);
        this._split = this._actions[0].getDuration() / this._duration;
        this._last = -1;
    },

    /**
     * stop the action
     */
    stop:function () {
        // Issue #1305
        if (this._last !== -1)
            this._actions[this._last].stop();
        cc.Action.prototype.stop.call(this);
    },

    /**
     * @param {Number} time  time in seconds
     */
    update:function (time) {
        var new_t, found = 0;
        var locSplit = this._split, locActions = this._actions, locLast = this._last;
        if (time < locSplit) {
            // action[0]
            new_t = (locSplit !== 0) ? time / locSplit : 1;

            if (found === 0 && locLast === 1) {
                // Reverse mode ?
                // XXX: Bug. this case doesn't contemplate when _last==-1, found=0 and in "reverse mode"
                // since it will require a hack to know if an action is on reverse mode or not.
                // "step" should be overriden, and the "reverseMode" value propagated to inner Sequences.
                locActions[1].update(0);
                locActions[1].stop();
            }
        } else {
            // action[1]
            found = 1;
            new_t = (locSplit === 1) ? 1 : (time - locSplit) / (1 - locSplit);

            if (locLast === -1) {
                // action[0] was skipped, execute it.
                locActions[0].startWithTarget(this.target);
                locActions[0].update(1);
                locActions[0].stop();
            }
            if (!locLast) {
                // switching to action 1. stop action 0.
                locActions[0].update(1);
                locActions[0].stop();
            }
        }

        // Last action found and it is done.
        if (locLast === found && locActions[found].isDone())
            return;

        // Last action found and it is done
        if (locLast !== found)
            locActions[found].startWithTarget(this.target);

        locActions[found].update(new_t);
        this._last = found;
    },

    /**
     * @return {cc.ActionInterval}
     */
    reverse:function () {
        return cc.Sequence._actionOneTwo(this._actions[1].reverse(), this._actions[0].reverse());
    }
});
/** helper constructor to create an array of sequenceable actions
 * @param {Array|cc.FiniteTimeAction} tempArray
 * @return {cc.Sequence}
 * @example
 * // example
 * // create sequence with actions
 * var seq = cc.Sequence.create(act1, act2);
 *
 * // create sequence with array
 * var seq = cc.Sequence.create(actArray);
 */
cc.Sequence.create = function (/*Multiple Arguments*/tempArray) {
    var paramArray = (tempArray instanceof Array) ? tempArray : arguments;
    if ((paramArray.length > 0) && (paramArray[paramArray.length - 1] == null))
        cc.log("parameters should not be ending with null in Javascript");

    var prev = paramArray[0];
    for (var i = 1; i < paramArray.length; i++) {
        if (paramArray[i])
            prev = cc.Sequence._actionOneTwo(prev, paramArray[i]);
    }
    return prev;
};

/** creates the action
 * @param {cc.FiniteTimeAction} actionOne
 * @param {cc.FiniteTimeAction} actionTwo
 * @return {cc.Sequence}
 * @private
 */
cc.Sequence._actionOneTwo = function (actionOne, actionTwo) {
    var sequence = new cc.Sequence();
    sequence.initWithTwoActions(actionOne, actionTwo);
    return sequence;
};


/**
 * Repeats an action a number of times.
 * To repeat an action forever use the CCRepeatForever action.
 * @class
 * @extends cc.ActionInterval
 */
cc.Repeat = cc.ActionInterval.extend(/** @lends cc.Repeat# */{
    _times:0,
    _total:0,
    _nextDt:0,
    _actionInstant:false,
    _innerAction:null, //CCFiniteTimeAction

	/**
	 * Creates a Repeat action. Times is an unsigned integer between 1 and pow(2,30)
	 * @constructor
	 * @param {cc.FiniteTimeAction} action
	 * @param {Number} times
	 * @example
	 * var rep = new cc.Repeat(cc.Sequence.create(jump2, jump1), 5);
	 */
    ctor: function (action, times) {
        cc.ActionInterval.prototype.ctor.call(this);

		times !== undefined && this.initWithAction(action, times);
    },

    /**
     * @param {cc.FiniteTimeAction} action
     * @param {Number} times
     * @return {Boolean}
     */
    initWithAction:function (action, times) {
        var duration = action.getDuration() * times;

        if (this.initWithDuration(duration)) {
            this._times = times;
            this._innerAction = action;
            if (action instanceof cc.ActionInstant){
                this._actionInstant = true;
                this._times -= 1;
            }
            this._total = 0;
            return true;
        }
        return false;
    },

    /**
     * returns a new clone of the action
     * @returns {cc.Repeat}
     */
    clone:function () {
        var action = new cc.Repeat();
        action.initWithAction(this._innerAction.clone(), this._times);
        return action;
    },

    /**
     * @param {cc.Node} target
     */
    startWithTarget:function (target) {
        this._total = 0;
        this._nextDt = this._innerAction.getDuration() / this._duration;
        cc.ActionInterval.prototype.startWithTarget.call(this, target);
        this._innerAction.startWithTarget(target);
    },

    /**
     * stop the action
     */
    stop:function () {
        this._innerAction.stop();
        cc.Action.prototype.stop.call(this);
    },

    /**
     * @param {Number} time time in seconds
     */
    update:function (time) {
        var locInnerAction = this._innerAction;
        var locDuration = this._duration;
        var locTimes = this._times;
        var locNextDt = this._nextDt;

        if (time >= locNextDt) {
            while (time > locNextDt && this._total < locTimes) {
                locInnerAction.update(1);
                this._total++;
                locInnerAction.stop();
                locInnerAction.startWithTarget(this.target);
                locNextDt += locInnerAction.getDuration() / locDuration;
                this._nextDt = locNextDt;
            }

            // fix for issue #1288, incorrect end value of repeat
            if (time >= 1.0 && this._total < locTimes)
                this._total++;

            // don't set a instant action back or update it, it has no use because it has no duration
            if (!this._actionInstant) {
                if (this._total === locTimes) {
                    locInnerAction.update(1);
                    locInnerAction.stop();
                } else {
                    // issue #390 prevent jerk, use right update
                    locInnerAction.update(time - (locNextDt - locInnerAction.getDuration() / locDuration));
                }
            }
        } else {
            locInnerAction.update((time * locTimes) % 1.0);
        }
    },

    /**
     * @return {Boolean}
     */
    isDone:function () {
        return this._total == this._times;
    },

    /**
     * @return {cc.ActionInterval}
     */
    reverse:function () {
        return cc.Repeat.create(this._innerAction.reverse(), this._times);
    },

    /**
     * @param {cc.FiniteTimeAction} action
     */
    setInnerAction:function (action) {
        if (this._innerAction != action) {
            this._innerAction = action;
        }
    },

    /**
     * @return {cc.FiniteTimeAction}
     */
    getInnerAction:function () {
        return this._innerAction;
    }
});
/**
 * Creates a Repeat action. Times is an unsigned integer between 1 and pow(2,30)
 * @param {cc.FiniteTimeAction} action
 * @param {Number} times
 * @return {cc.Repeat}
 * @example
 * // example
 * var rep = cc.Repeat.create(cc.Sequence.create(jump2, jump1), 5);
 */
cc.Repeat.create = function (action, times) {
    return new cc.Repeat(action, times);
};


/**  Repeats an action for ever.  <br/>
 * To repeat the an action for a limited number of times use the Repeat action. <br/>
 * @warning This action can't be Sequenceable because it is not an IntervalAction
 * @class
 * @extends cc.ActionInterval
 */

cc.RepeatForever = cc.ActionInterval.extend(/** @lends cc.RepeatForever# */{
    _innerAction:null, //CCActionInterval

	/**
	 * Create a acton which repeat forever
	 * @param {cc.FiniteTimeAction} action
	 * @example
	 * var repeat = new cc.RepeatForever(cc.RotateBy.create(1.0, 360));
	 */
    ctor:function (action) {
        cc.ActionInterval.prototype.ctor.call(this);
        this._innerAction = null;

		action && this.initWithAction(action);
    },

    /**
     * @param {cc.ActionInterval} action
     * @return {Boolean}
     */
    initWithAction:function (action) {
        if(!action)
            throw "cc.RepeatForever.initWithAction(): action must be non null";

        this._innerAction = action;
        return true;
    },

    /**
     * returns a new clone of the action
     * @returns {cc.RepeatForever}
     */
    clone:function () {
        var action = new cc.RepeatForever();
        action.initWithAction(this._innerAction.clone());
        return action;
    },

    /**
     * @param {cc.Node} target
     */
    startWithTarget:function (target) {
        cc.ActionInterval.prototype.startWithTarget.call(this, target);
        this._innerAction.startWithTarget(target);
    },

    /**
     * @param dt delta time in seconds
     */
    step:function (dt) {
        var locInnerAction = this._innerAction;
        locInnerAction.step(dt);
        if (locInnerAction.isDone()) {
            //var diff = locInnerAction.getElapsed() - locInnerAction.getDuration();
            locInnerAction.startWithTarget(this.target);
            // to prevent jerk. issue #390 ,1247
            //this._innerAction.step(0);
            //this._innerAction.step(diff);
            locInnerAction.step(locInnerAction.getElapsed() - locInnerAction.getDuration());
        }
    },

    /**
     * @return {Boolean}
     */
    isDone:function () {
        return false;
    },

    /**
     * @return {cc.ActionInterval}
     */
    reverse:function () {
        return (cc.RepeatForever.create(this._innerAction.reverse()));
    },

    /**
     *
     * @param {cc.ActionInterval} action
     */
    setInnerAction:function (action) {
        if (this._innerAction != action) {
            this._innerAction = action;
        }
    },

    /**
     * @return {cc.ActionInterval}
     */
    getInnerAction:function () {
        return this._innerAction;
    }
});
/**
 * Create a acton which repeat forever
 * @param {cc.FiniteTimeAction} action
 * @return {cc.RepeatForever}
 * @example
 * // example
 * var repeat = cc.RepeatForever.create(cc.RotateBy.create(1.0, 360));
 */
cc.RepeatForever.create = function (action) {
    return new cc.RepeatForever(action);
};


/** Spawn a new action immediately
 * @class
 * @extends cc.ActionInterval
 */
cc.Spawn = cc.ActionInterval.extend(/** @lends cc.Spawn# */{
    _one:null,
    _two:null,

	/**
	 * @constructor
	 * @param {Array|cc.FiniteTimeAction} tempArray
	 * @example
	 * var action = new cc.Spawn(cc.JumpBy.create(2, cc.p(300, 0), 50, 4), cc.RotateBy.create(2, 720));
	 */
    ctor:function (tempArray) {
        cc.ActionInterval.prototype.ctor.call(this);
        this._one = null;
        this._two = null;

		var paramArray = (tempArray instanceof Array) ? tempArray : arguments;
		var last = paramArray.length - 1;
		if ((last >= 0) && (paramArray[last] == null))
			cc.log("parameters should not be ending with null in Javascript");

		if (last >= 0) {
			var prev = paramArray[0], action1;
			for (var i = 1; i < last; i++) {
				if (paramArray[i]) {
					action1 = prev;
					prev = cc.Spwan.create();
					prev.initWithTwoActions(action1, paramArray[i]);
				}
			}
			this.initWithTwoActions(prev, paramArray[last]);
		}
    },

    /** initializes the Spawn action with the 2 actions to spawn
     * @param {cc.FiniteTimeAction} action1
     * @param {cc.FiniteTimeAction} action2
     * @return {Boolean}
     */
    initWithTwoActions:function (action1, action2) {
        if(!action1 || !action2)
            throw "cc.Spawn.initWithTwoActions(): arguments must all be non null" ;

        var ret = false;

        var d1 = action1.getDuration();
        var d2 = action2.getDuration();

        if (this.initWithDuration(Math.max(d1, d2))) {
            this._one = action1;
            this._two = action2;

            if (d1 > d2) {
                this._two = cc.Sequence._actionOneTwo(action2, cc.DelayTime.create(d1 - d2));
            } else if (d1 < d2) {
                this._one = cc.Sequence._actionOneTwo(action1, cc.DelayTime.create(d2 - d1));
            }

            ret = true;
        }
        return ret;
    },

    /**
     * returns a new clone of the action
     * @returns {cc.Spawn}
     */
    clone:function () {
        var action = new cc.Spawn();
        action.initWithTwoActions(this._one.clone(), this._two.clone());
        return action;
    },

    /**
     * @param {cc.Node} target
     */
    startWithTarget:function (target) {
        cc.ActionInterval.prototype.startWithTarget.call(this, target);
        this._one.startWithTarget(target);
        this._two.startWithTarget(target);
    },

    /**
     * Stop the action
     */
    stop:function () {
        this._one.stop();
        this._two.stop();
        cc.Action.prototype.stop.call(this);
    },

    /**
     * @param {Number} time time in seconds
     */
    update:function (time) {
        if (this._one)
            this._one.update(time);
        if (this._two)
            this._two.update(time);
    },

    /**
     * @return {cc.FiniteTimeAction}
     */
    reverse:function () {
        return cc.Spawn._actionOneTwo(this._one.reverse(), this._two.reverse());
    }
});

/**
 * @param {Array|cc.FiniteTimeAction}tempArray
 * @return {cc.FiniteTimeAction}
 * @example
 * // example
 * var action = cc.Spawn.create(cc.JumpBy.create(2, cc.p(300, 0), 50, 4), cc.RotateBy.create(2, 720));
 */
cc.Spawn.create = function (/*Multiple Arguments*/tempArray) {
    var paramArray = (tempArray instanceof Array) ? tempArray : arguments;
    if ((paramArray.length > 0) && (paramArray[paramArray.length - 1] == null))
        cc.log("parameters should not be ending with null in Javascript");

    var prev = paramArray[0];
    for (var i = 1; i < paramArray.length; i++) {
        if (paramArray[i] != null)
            prev = this._actionOneTwo(prev, paramArray[i]);
    }
    return prev;
};

/**
 * @param {cc.FiniteTimeAction} action1
 * @param {cc.FiniteTimeAction} action2
 * @return {cc.Spawn}
 * @private
 */
cc.Spawn._actionOneTwo = function (action1, action2) {
    var pSpawn = new cc.Spawn();
    pSpawn.initWithTwoActions(action1, action2);
    return pSpawn;
};


/** Rotates a cc.Node object to a certain angle by modifying it's
 * rotation attribute. <br/>
 * The direction will be decided by the shortest angle.
 * @class
 * @extends cc.ActionInterval
 */
cc.RotateTo = cc.ActionInterval.extend(/** @lends cc.RotateTo# */{
    _dstAngleX:0,
    _startAngleX:0,
    _diffAngleX:0,

    _dstAngleY:0,
    _startAngleY:0,
    _diffAngleY:0,

	/**
	 * Creates a RotateTo action with x and y rotation angles
	 * @constructor
	 * @param {Number} duration duration in seconds
	 * @param {Number} deltaAngleX deltaAngleX in degrees.
	 * @param {Number} [deltaAngleY] deltaAngleY in degrees.
	 * @example
	 * var rotateTo = new cc.RotateTo(2, 61.0);
	 */
    ctor:function (duration, deltaAngleX, deltaAngleY) {
        cc.ActionInterval.prototype.ctor.call(this);

		deltaAngleX !== undefined && this.initWithDuration(duration, deltaAngleX, deltaAngleY);
    },

    /**
     * @param {Number} duration
     * @param {Number} deltaAngleX
     * @param {Number} deltaAngleY
     * @return {Boolean}
     */
    initWithDuration:function (duration, deltaAngleX, deltaAngleY) {
        if (cc.ActionInterval.prototype.initWithDuration.call(this, duration)) {
            this._dstAngleX = deltaAngleX || 0;
            this._dstAngleY = deltaAngleY || this._dstAngleX;
            return true;
        }
        return false;
    },

    /**
     * returns a new clone of the action
     * @returns {cc.RotateTo}
     */
    clone:function () {
        var action = new cc.RotateTo();
        action.initWithDuration(this._duration, this._dstAngleX, this._dstAngleY);
        return action;
    },

    /**
     * @param {cc.Node} target
     */
    startWithTarget:function (target) {
        cc.ActionInterval.prototype.startWithTarget.call(this, target);

        // Calculate X
        var locStartAngleX = target.rotationX % 360.0;
        var locDiffAngleX = this._dstAngleX - locStartAngleX;
        if (locDiffAngleX > 180)
            locDiffAngleX -= 360;
        if (locDiffAngleX < -180)
            locDiffAngleX += 360;
        this._startAngleX = locStartAngleX;
        this._diffAngleX = locDiffAngleX;

        // Calculate Y  It's duplicated from calculating X since the rotation wrap should be the same
        this._startAngleY = target.rotationY % 360.0;
        var locDiffAngleY = this._dstAngleY - this._startAngleY;
        if (locDiffAngleY > 180)
            locDiffAngleY -= 360;
        if (locDiffAngleY < -180)
            locDiffAngleY += 360;
        this._diffAngleY = locDiffAngleY;
    },

    /**
     * RotateTo reverse not implemented
     */
    reverse:function () {
        cc.log("cc.RotateTo.reverse(): it should be overridden in subclass.");
    },

    /**
     * @param {Number} time time in seconds
     */
    update:function (time) {
        if (this.target) {
            this.target.rotationX = this._startAngleX + this._diffAngleX * time;
            this.target.rotationY = this._startAngleY + this._diffAngleY * time;
        }
    }
});

/**
 * Creates a RotateTo action with separate rotation angles
 * @param {Number} duration duration in seconds
 * @param {Number} deltaAngleX deltaAngleX in degrees.
 * @param {Number} [deltaAngleY] deltaAngleY in degrees.
 * @return {cc.RotateTo}
 * @example
 * // example
 * var rotateTo = cc.RotateTo.create(2, 61.0);
 */
cc.RotateTo.create = function (duration, deltaAngleX, deltaAngleY) {
    return new cc.RotateTo(duration, deltaAngleX, deltaAngleY);
};


/** Rotates a cc.Node object clockwise a number of degrees by modifying it's rotation attribute.
 * @class
 * @extends  cc.ActionInterval
 */
cc.RotateBy = cc.ActionInterval.extend(/** @lends cc.RotateBy# */{
    _angleX:0,
    _startAngleX:0,
    _angleY:0,
    _startAngleY:0,

	/**
	 * @constructor
	 * @param {Number} duration duration in seconds
	 * @param {Number} deltaAngleX deltaAngleX in degrees
	 * @param {Number} [deltaAngleY] deltaAngleY in degrees
	 * @example
	 * var actionBy = new cc.RotateBy(2, 360);
	 */
    ctor: function (duration, deltaAngleX, deltaAngleY) {
        cc.ActionInterval.prototype.ctor.call(this);

		deltaAngleX !== undefined && this.initWithDuration(duration, deltaAngleX, deltaAngleY);
    },

    /**
     * @param {Number} duration duration in seconds
     * @param {Number} deltaAngleX deltaAngleX in degrees
     * @param {Number} [deltaAngleY=] deltaAngleY in degrees
     * @return {Boolean}
     */
    initWithDuration:function (duration, deltaAngleX, deltaAngleY) {
        if (cc.ActionInterval.prototype.initWithDuration.call(this, duration)) {
            this._angleX = deltaAngleX || 0;
            this._angleY = deltaAngleY || this._angleX;
            return true;
        }
        return false;
    },

    /**
     * returns a new clone of the action
     * @returns {cc.RotateBy}
     */
    clone:function () {
        var action = new cc.RotateBy();
        action.initWithDuration(this._duration, this._angleX, this._angleY);
        return action;
    },

    /**
     * @param {cc.Node} target
     */
    startWithTarget:function (target) {
        cc.ActionInterval.prototype.startWithTarget.call(this, target);
        this._startAngleX = target.rotationX;
        this._startAngleY = target.rotationY;
    },

    /**
     * @param {Number} time
     */
    update:function (time) {
        if (this.target) {
            this.target.rotationX = this._startAngleX + this._angleX * time;
            this.target.rotationY = this._startAngleY + this._angleY * time;
        }
    },

    /**
     * @return {cc.RotateBy}
     */
    reverse:function () {
        return cc.RotateBy.create(this._duration, -this._angleX, -this._angleY);
    }
});

/**
 * @param {Number} duration duration in seconds
 * @param {Number} deltaAngleX deltaAngleX in degrees
 * @param {Number} [deltaAngleY] deltaAngleY in degrees
 * @return {cc.RotateBy}
 * @example
 * // example
 * var actionBy = cc.RotateBy.create(2, 360);
 */
cc.RotateBy.create = function (duration, deltaAngleX, deltaAngleY) {
    var rotateBy = new cc.RotateBy();
    rotateBy.initWithDuration(duration, deltaAngleX, deltaAngleY);
    return rotateBy;
};


/**
 * <p>
 *     Moves a CCNode object x,y pixels by modifying it's position attribute.                                  <br/>
 *     x and y are relative to the position of the object.                                                     <br/>
 *     Several CCMoveBy actions can be concurrently called, and the resulting                                  <br/>
 *     movement will be the sum of individual movements.
 * </p>
 * @class
 * @extends cc.ActionInterval
 */
cc.MoveBy = cc.ActionInterval.extend(/** @lends cc.MoveBy# */{
    _positionDelta:null,
    _startPosition:null,
    _previousPosition:null,

	/**
	 * @constructor
	 * @param {Number} duration duration in seconds
	 * @param {cc.Point|Number} deltaPos
	 * @param {Number} [deltaY]
	 * @example
	 * var actionTo = cc.MoveBy.create(2, cc.p(windowSize.width - 40, windowSize.height - 40));
	 */
    ctor:function (duration, deltaPos, deltaY) {
        cc.ActionInterval.prototype.ctor.call(this);

        this._positionDelta = cc.p(0, 0);
        this._startPosition = cc.p(0, 0);
        this._previousPosition = cc.p(0, 0);

		deltaPos !== undefined && this.initWithDuration(duration, deltaPos, deltaY);
    },

    /**
     * @param {Number} duration duration in seconds
     * @param {cc.Point} position
     * @param {Number} [y]
     * @return {Boolean}
     */
    initWithDuration:function (duration, position, y) {
        if (cc.ActionInterval.prototype.initWithDuration.call(this, duration)) {
	        if(position.x !== undefined) {
		        y = position.y;
		        position = position.x;
	        }

            this._positionDelta.x = position;
            this._positionDelta.y = y;
            return true;
        }
        return false;
    },

    /**
     * returns a new clone of the action
     * @returns {cc.MoveBy}
     */
    clone:function () {
        var action = new cc.MoveBy();
        action.initWithDuration(this._duration, this._positionDelta)
        return action;
    },

    /**
     * @param {Number} target
     */
    startWithTarget:function (target) {
        cc.ActionInterval.prototype.startWithTarget.call(this, target);
        var locPosX = target.getPositionX();
        var locPosY = target.getPositionY();
        this._previousPosition.x = locPosX;
        this._previousPosition.y = locPosY;
        this._startPosition.x = locPosX;
        this._startPosition.y = locPosY;
    },

    /**
     * @param {Number} time time in seconds
     */
    update:function (time) {
        if (this.target) {
            var x = this._positionDelta.x * time;
            var y = this._positionDelta.y * time;
            var locStartPosition = this._startPosition;
            if (cc.ENABLE_STACKABLE_ACTIONS) {
                var targetX = this.target.getPositionX();
                var targetY = this.target.getPositionY();
                var locPreviousPosition = this._previousPosition;

                locStartPosition.x = locStartPosition.x + targetX - locPreviousPosition.x;
                locStartPosition.y = locStartPosition.y + targetY - locPreviousPosition.y;
                x = x + locStartPosition.x;
                y = y + locStartPosition.y;
	            locPreviousPosition.x = x;
	            locPreviousPosition.y = y;
	            this.target.setPosition(x, y);
            } else {
                this.target.setPosition(locStartPosition.x + x, locStartPosition.y + y);
            }
        }
    },

    /**
     * MoveTo reverse is not implemented
     */
    reverse:function () {
        return cc.MoveBy.create(this._duration, cc.p(-this._positionDelta.x, -this._positionDelta.y));
    }
});

/**
 * @param {Number} duration duration in seconds
 * @param {cc.Point|Number} deltaPos
 * @param {Number} deltaY
 * @return {cc.MoveBy}
 * @example
 * // example
 * var actionTo = cc.MoveBy.create(2, cc.p(windowSize.width - 40, windowSize.height - 40));
 */
cc.MoveBy.create = function (duration, deltaPos, deltaY) {
    return new cc.MoveBy(duration, deltaPos, deltaY);
};


/**
 * Moves a CCNode object to the position x,y. x and y are absolute coordinates by modifying it's position attribute. <br/>
 * Several CCMoveTo actions can be concurrently called, and the resulting                                            <br/>
 * movement will be the sum of individual movements.
 * @class
 * @extends cc.MoveBy
 */
cc.MoveTo = cc.MoveBy.extend(/** @lends cc.MoveTo# */{
    _endPosition:null,

	/**
	 * @constructor
	 * @param {Number} duration duration in seconds
	 * @param {cc.Point|Number} position
	 * @param {Number} y
	 * @example
	 * var actionBy = cc.MoveTo.create(2, cc.p(80, 80));
	 */
    ctor:function (duration, position, y) {
        cc.MoveBy.prototype.ctor.call(this);
        this._endPosition = cc.p(0, 0);

		position !== undefined && this.initWithDuration(duration, position, y);
    },

    /**
     * @param {Number} duration  duration in seconds
     * @param {cc.Point} position
     * @param {Number} y
     * @return {Boolean}
     */
    initWithDuration:function (duration, position, y) {
        if (cc.MoveBy.prototype.initWithDuration.call(this, duration, position, y)) {
	        if(position.x !== undefined) {
		        y = position.y;
		        position = position.x;
	        }

            this._endPosition.x = position;
            this._endPosition.y = y;
            return true;
        }
        return false;
    },

    /**
     * returns a new clone of the action
     * @returns {cc.MoveTo}
     */
    clone:function () {
        var action = new cc.MoveTo();
        action.initWithDuration(this._duration, this._endPosition);
        return action;
    },

    /**
     * @param {cc.Node} target
     */
    startWithTarget:function (target) {
        cc.MoveBy.prototype.startWithTarget.call(this, target);
        this._positionDelta.x = this._endPosition.x - target.getPositionX();
        this._positionDelta.y = this._endPosition.y - target.getPositionY();
    }
});
/**
 * @param {Number} duration duration in seconds
 * @param {cc.Point} position
 * @param {Number} y
 * @return {cc.MoveBy}
 * @example
 * // example
 * var actionBy = cc.MoveTo.create(2, cc.p(80, 80));
 */
cc.MoveTo.create = function (duration, position, y) {
    return new cc.MoveTo(duration, position, y);
};

/**
 * Skews a cc.Node object to given angles by modifying it's skewX and skewY attributes
 * @class
 * @extends cc.ActionInterval
 */
cc.SkewTo = cc.ActionInterval.extend(/** @lends cc.SkewTo# */{
    _skewX:0,
    _skewY:0,
    _startSkewX:0,
    _startSkewY:0,
    _endSkewX:0,
    _endSkewY:0,
    _deltaX:0,
    _deltaY:0,

	/**
	 * @constructor
	 * @param {Number} t time in seconds
	 * @param {Number} sx
	 * @param {Number} sy
	 * @example
	 * var actionTo = new cc.SkewTo(2, 37.2, -37.2);
	 */
    ctor: function (t, sx, sy) {
        cc.ActionInterval.prototype.ctor.call(this);

		sy !== undefined && this.initWithDuration(t, sx, sy);
    },

    /**
     * @param {Number} t time in seconds
     * @param {Number} sx
     * @param {Number} sy
     * @return {Boolean}
     */
    initWithDuration:function (t, sx, sy) {
        var ret = false;
        if (cc.ActionInterval.prototype.initWithDuration.call(this, t)) {
            this._endSkewX = sx;
            this._endSkewY = sy;
            ret = true;
        }
        return ret;
    },

    /**
     * returns a new clone of the action
     * @returns {cc.SkewTo}
     */
    clone:function () {
        var action = new cc.SkewTo();
        action.initWithDuration(this._duration, this._endSkewX, this._endSkewY);
        return action;
    },

    /**
     * @param {cc.Node} target
     */
    startWithTarget:function (target) {
        cc.ActionInterval.prototype.startWithTarget.call(this, target);

        this._startSkewX = target.skewX % 180;
        this._deltaX = this._endSkewX - this._startSkewX;
        if (this._deltaX > 180)
            this._deltaX -= 360;
        if (this._deltaX < -180)
            this._deltaX += 360;

        this._startSkewY = target.skewY % 360;
        this._deltaY = this._endSkewY - this._startSkewY;
        if (this._deltaY > 180)
            this._deltaY -= 360;
        if (this._deltaY < -180)
            this._deltaY += 360;
    },

    /**
     * @param {Number} t time in seconds
     */
    update:function (t) {
        this.target.skewX = this._startSkewX + this._deltaX * t;
        this.target.skewY = this._startSkewY + this._deltaY * t;
    }
});
/**
 * @param {Number} t time in seconds
 * @param {Number} sx
 * @param {Number} sy
 * @return {cc.SkewTo}
 * @example
 * // example
 * var actionTo = cc.SkewTo.create(2, 37.2, -37.2);
 */
cc.SkewTo.create = function (t, sx, sy) {
    return new cc.SkewTo(t, sx, sy);
};

/** Skews a cc.Node object by skewX and skewY degrees
 * @class
 * @extends cc.SkewTo
 */
cc.SkewBy = cc.SkewTo.extend(/** @lends cc.SkewBy# */{

	/**
	 * @constructor
	 * @param {Number} t time in seconds
	 * @param {Number} sx  skew in degrees for X axis
	 * @param {Number} sy  skew in degrees for Y axis
	 */
	ctor: function(t, sx, sy) {
		cc.SkewTo.prototype.ctor.call(this);
		sy !== undefined && this.initWithDuration(t, sx, sy);
	},

    /**
     * @param {Number} t time in seconds
     * @param {Number} deltaSkewX  skew in degrees for X axis
     * @param {Number} deltaSkewY  skew in degrees for Y axis
     * @return {Boolean}
     */
    initWithDuration:function (t, deltaSkewX, deltaSkewY) {
        var ret = false;
        if (cc.SkewTo.prototype.initWithDuration.call(this, t, deltaSkewX, deltaSkewY)) {
            this._skewX = deltaSkewX;
            this._skewY = deltaSkewY;
            ret = true;
        }
        return ret;
    },

    /**
     * returns a new clone of the action
     * @returns {cc.SkewBy}
     */
    clone:function () {
        var action = new cc.SkewBy();
        action.initWithDuration(this._duration, this._skewX, this._skewY);
        return action;
    },

    /**
     * @param {cc.Node} target
     */
    startWithTarget:function (target) {
        cc.SkewTo.prototype.startWithTarget.call(this, target);
        this._deltaX = this._skewX;
        this._deltaY = this._skewY;
        this._endSkewX = this._startSkewX + this._deltaX;
        this._endSkewY = this._startSkewY + this._deltaY;
    },

    /**
     * @return {cc.ActionInterval}
     */
    reverse:function () {
        return cc.SkewBy.create(this._duration, -this._skewX, -this._skewY);
    }
});
/**
 * @param {Number} t time in seconds
 * @param {Number} sx sx skew in degrees for X axis
 * @param {Number} sy sy skew in degrees for Y axis
 * @return {cc.SkewBy}
 * @example
 * // example
 * var actionBy = cc.SkewBy.create(2, 0, -90);
 */
cc.SkewBy.create = function (t, sx, sy) {
    var skewBy = new cc.SkewBy();
    if (skewBy)
        skewBy.initWithDuration(t, sx, sy);
    return skewBy;
};


/**  Moves a cc.Node object simulating a parabolic jump movement by modifying it's position attribute.
 * @class
 * @extends cc.ActionInterval
 */
cc.JumpBy = cc.ActionInterval.extend(/** @lends cc.JumpBy# */{
    _startPosition:null,
    _delta:null,
    _height:0,
    _jumps:0,
    _previousPosition:null,

	/**
	 * @constructor
	 * @param {Number} duration
	 * @param {cc.Point|Number} position
	 * @param {Number} [y]
	 * @param {Number} height
	 * @param {Number} jumps
	 * @example
	 * var actionBy = new cc.JumpBy(2, cc.p(300, 0), 50, 4);
	 * var actionBy = new cc.JumpBy(2, 300, 0, 50, 4);
	 */
    ctor:function (duration, position, y, height, jumps) {
        cc.ActionInterval.prototype.ctor.call(this);
        this._startPosition = cc.p(0, 0);
        this._previousPosition = cc.p(0, 0);
        this._delta = cc.p(0, 0);

		height !== undefined && this.initWithDuration(duration, position, y, height, jumps);
    },
    /**
     * @param {Number} duration
     * @param {cc.Point|Number} position
     * @param {Number} [y]
     * @param {Number} height
     * @param {Number} jumps
     * @return {Boolean}
     * @example
     * actionBy.initWithDuration(2, cc.p(300, 0), 50, 4);
     * actionBy.initWithDuration(2, 300, 0, 50, 4);
     */
    initWithDuration:function (duration, position, y, height, jumps) {
        if (cc.ActionInterval.prototype.initWithDuration.call(this, duration)) {
	        if (jumps === undefined) {
		        jumps = height;
		        height = y;
		        y = position.y;
		        position = position.x;
	        }
            this._delta.x = position;
            this._delta.y = y;
            this._height = height;
            this._jumps = jumps;
            return true;
        }
        return false;
    },

    /**
     * returns a new clone of the action
     * @returns {cc.JumpBy}
     */
    clone:function () {
        var action = new cc.JumpBy();
        action.initWithDuration(this._duration, this._delta, this._height, this._jumps);
        return action;
    },

    /**
     * @param {cc.Node} target
     */
    startWithTarget:function (target) {
        cc.ActionInterval.prototype.startWithTarget.call(this, target);
        var locPosX = target.getPositionX();
        var locPosY = target.getPositionY();
        this._previousPosition.x = locPosX;
        this._previousPosition.y = locPosY;
        this._startPosition.x = locPosX;
        this._startPosition.y = locPosY;
    },

    /**
     * @param {Number} time
     */
    update:function (time) {
        if (this.target) {
            var frac = time * this._jumps % 1.0;
            var y = this._height * 4 * frac * (1 - frac);
            y += this._delta.y * time;

            var x = this._delta.x * time;
            var locStartPosition = this._startPosition;
            if (cc.ENABLE_STACKABLE_ACTIONS) {
                var targetX = this.target.getPositionX();
                var targetY = this.target.getPositionY();
                var locPreviousPosition = this._previousPosition;

                locStartPosition.x = locStartPosition.x + targetX - locPreviousPosition.x;
                locStartPosition.y = locStartPosition.y + targetY - locPreviousPosition.y;
                x = x + locStartPosition.x;
                y = y + locStartPosition.y;
	            locPreviousPosition.x = x;
	            locPreviousPosition.y = y;
	            this.target.setPosition(x, y);
            } else {
                this.target.setPosition(locStartPosition.x + x, locStartPosition.y + y);
            }
        }
    },

    /**
     * @return {cc.ActionInterval}
     */
    reverse:function () {
        return cc.JumpBy.create(this._duration, cc.p(-this._delta.x, -this._delta.y), this._height, this._jumps);
    }
});

/**
 * @param {Number} duration
 * @param {cc.Point|Number} position
 * @param {Number} [y]
 * @param {Number} height
 * @param {Number} jumps
 * @return {cc.JumpBy}
 * @example
 * // example
 * var actionBy = cc.JumpBy.create(2, cc.p(300, 0), 50, 4);
 * var actionBy = cc.JumpBy.create(2, 300, 0, 50, 4);
 */
cc.JumpBy.create = function (duration, position, y, height, jumps) {
    return new cc.JumpBy(duration, position, y, height, jumps);
};

/**  Moves a cc.Node object to a parabolic position simulating a jump movement by modifying it's position attribute.
 * @class
 * @extends cc.JumpBy
 */
cc.JumpTo = cc.JumpBy.extend(/** @lends cc.JumpTo# */{

	/**
     * @param {cc.Node} target
     */
    startWithTarget:function (target) {
        cc.JumpBy.prototype.startWithTarget.call(this, target);
        this._delta.x = this._delta.x - this._startPosition.x;
        this._delta.y = this._delta.y - this._startPosition.y;
    },

    /**
     * returns a new clone of the action
     * @returns {cc.JumpTo}
     */
    clone:function () {
        var action = new cc.JumpTo();
        action.initWithDuration(this._duration, this._delta, this._height, this._jumps);
        return action;
    }
});

/**
 * @param {Number} duration
 * @param {cc.Point|Number} position
 * @param {Number} [y]
 * @param {Number} height
 * @param {Number} jumps
 * @return {cc.JumpTo}
 * @example
 * // example
 * var actionTo = cc.JumpTo.create(2, cc.p(300, 300), 50, 4);
 * var actionTo = cc.JumpTo.create(2, 300, 300, 50, 4);
 */
cc.JumpTo.create = function (duration, position, y, height, jumps) {
    return new cc.JumpTo(duration, position, y, height, jumps);
};

/**
 * @function
 * @param {Number} a
 * @param {Number} b
 * @param {Number} c
 * @param {Number} d
 * @param {Number} t
 * @return {Number}
 */
cc.bezierAt = function (a, b, c, d, t) {
    return (Math.pow(1 - t, 3) * a +
        3 * t * (Math.pow(1 - t, 2)) * b +
        3 * Math.pow(t, 2) * (1 - t) * c +
        Math.pow(t, 3) * d );
};

/** An action that moves the target with a cubic Bezier curve by a certain distance.
 * @class
 * @extends cc.ActionInterval
 */
cc.BezierBy = cc.ActionInterval.extend(/** @lends cc.BezierBy# */{
    _config:null,
    _startPosition:null,
    _previousPosition:null,

	/**
	 * @constructor
	 * @param {Number} t time in seconds
	 * @param {Array} c Array of points
	 * @example
	 * var bezier = [cc.p(0, windowSize.height / 2), cc.p(300, -windowSize.height / 2), cc.p(300, 100)];
	 * var bezierForward = new cc.BezierBy(3, bezier);
	 */
    ctor:function (t, c) {
        cc.ActionInterval.prototype.ctor.call(this);
        this._config = [];
        this._startPosition = cc.p(0, 0);
        this._previousPosition = cc.p(0, 0);

		c && this.initWithDuration(t, c);
    },
    /**
     * @param {Number} t time in seconds
     * @param {Array} c Array of points
     * @return {Boolean}
     */
    initWithDuration:function (t, c) {
        if (cc.ActionInterval.prototype.initWithDuration.call(this, t)) {
            this._config = c;
            return true;
        }
        return false;
    },

    /**
     * returns a new clone of the action
     * @returns {cc.BezierBy}
     */
    clone:function () {
        var action = new cc.BezierBy();
        var newConfigs = [];
        for (var i = 0; i < this._config.length; i++) {
            var selConf = this._config[i];
            newConfigs.push(cc.p(selConf.x, selConf.y));
        }
        action.initWithDuration(this._duration, newConfigs);
        return action;
    },

    /**
     * @param {cc.Node} target
     */
    startWithTarget:function (target) {
        cc.ActionInterval.prototype.startWithTarget.call(this, target);
        var locPosX = target.getPositionX();
        var locPosY = target.getPositionY();
        this._previousPosition.x = locPosX;
        this._previousPosition.y = locPosY;
        this._startPosition.x = locPosX;
        this._startPosition.y = locPosY;
    },

    /**
     * @param {Number} time
     */
    update:function (time) {
        if (this.target) {
            var locConfig = this._config;
            var xa = 0;
            var xb = locConfig[0].x;
            var xc = locConfig[1].x;
            var xd = locConfig[2].x;

            var ya = 0;
            var yb = locConfig[0].y;
            var yc = locConfig[1].y;
            var yd = locConfig[2].y;

            var x = cc.bezierAt(xa, xb, xc, xd, time);
            var y = cc.bezierAt(ya, yb, yc, yd, time);

            var locStartPosition = this._startPosition;
            if (cc.ENABLE_STACKABLE_ACTIONS) {
                var targetX = this.target.getPositionX();
                var targetY = this.target.getPositionY();
                var locPreviousPosition = this._previousPosition;

                locStartPosition.x = locStartPosition.x + targetX - locPreviousPosition.x;
                locStartPosition.y = locStartPosition.y + targetY - locPreviousPosition.y;
                x = x + locStartPosition.x;
                y = y + locStartPosition.y;
	            locPreviousPosition.x = x;
	            locPreviousPosition.y = y;
	            this.target.setPosition(x, y);
            } else {
                this.target.setPosition(locStartPosition.x + x, locStartPosition.y + y);
            }
        }
    },

    /**
     * @return {cc.ActionInterval}
     */
    reverse:function () {
        var locConfig = this._config;
        var r = [
            cc.pAdd(locConfig[1], cc.pNeg(locConfig[2])),
            cc.pAdd(locConfig[0], cc.pNeg(locConfig[2])),
            cc.pNeg(locConfig[2]) ];
        return cc.BezierBy.create(this._duration, r);
    }
});

/**
 * @param {Number} t time in seconds
 * @param {Array} c Array of points
 * @return {cc.BezierBy}
 * @example
 * // example
 * var bezier = [cc.p(0, windowSize.height / 2), cc.p(300, -windowSize.height / 2), cc.p(300, 100)];
 * var bezierForward = cc.BezierBy.create(3, bezier);
 */
cc.BezierBy.create = function (t, c) {
    return new cc.BezierBy(t, c);
};


/** An action that moves the target with a cubic Bezier curve to a destination point.
 * @class
 * @extends cc.BezierBy
 */
cc.BezierTo = cc.BezierBy.extend(/** @lends cc.BezierTo# */{
    _toConfig:null,

	/**
	 * @constructor
	 * @param {Number} t
	 * @param {Array} c array of points
	 * @example
	 * var bezier = [cc.p(0, windowSize.height / 2), cc.p(300, -windowSize.height / 2), cc.p(300, 100)];
	 * var bezierTo = new cc.BezierTo(2, bezier);
	 */
    ctor:function (t, c) {
        cc.BezierBy.prototype.ctor.call(this);
        this._toConfig = [];
		c && this.initWithDuration(t, c);
    },

    /**
     * @param {Number} t time in seconds
     * @param {Array} c Array of points
     * @return {Boolean}
     */
    initWithDuration:function (t, c) {
        if (cc.ActionInterval.prototype.initWithDuration.call(this, t)) {
            this._toConfig = c;
            return true;
        }
        return false;
    },

    /**
     * returns a new clone of the action
     * @returns {cc.BezierTo}
     */
    clone:function () {
        var action = new cc.BezierTo();
        action.initWithDuration(this._duration, this._toConfig);
        return action;
    },

    /**
     * @param {cc.Node} target
     */
    startWithTarget:function (target) {
        cc.BezierBy.prototype.startWithTarget.call(this, target);
        var locStartPos = this._startPosition;
        var locToConfig = this._toConfig;
        var locConfig = this._config;

        locConfig[0] = cc.pSub(locToConfig[0], locStartPos);
        locConfig[1] = cc.pSub(locToConfig[1], locStartPos);
        locConfig[2] = cc.pSub(locToConfig[2], locStartPos);
    }
});
/**
 * @param {Number} t
 * @param {Array} c array of points
 * @return {cc.BezierTo}
 * @example
 * // example
 * var bezier = [cc.p(0, windowSize.height / 2), cc.p(300, -windowSize.height / 2), cc.p(300, 100)];
 * var bezierTo = cc.BezierTo.create(2, bezier);
 */
cc.BezierTo.create = function (t, c) {
    return new cc.BezierTo(t, c);
};


/** Scales a cc.Node object to a zoom factor by modifying it's scale attribute.
 * @warning This action doesn't support "reverse"
 * @class
 * @extends cc.ActionInterval
 */
cc.ScaleTo = cc.ActionInterval.extend(/** @lends cc.ScaleTo# */{
    _scaleX:1,
    _scaleY:1,
    _startScaleX:1,
    _startScaleY:1,
    _endScaleX:0,
    _endScaleY:0,
    _deltaX:0,
    _deltaY:0,

	/**
	 * @constructor
	 * @param {Number} duration
	 * @param {Number} sx  scale parameter in X
	 * @param {Number} [sy] scale parameter in Y, if Null equal to sx
	 * @example
	 * // It scales to 0.5 in both X and Y.
	 * var actionTo = new cc.ScaleTo(2, 0.5);
	 *
	 * // It scales to 0.5 in x and 2 in Y
	 * var actionTo = new cc.ScaleTo(2, 0.5, 2);
	 */
    ctor:function (duration, sx, sy) {
        cc.ActionInterval.prototype.ctor.call(this);
		sx !== undefined && this.initWithDuration(duration, sx, sy);
    },

    /**
     * @param {Number} duration
     * @param {Number} sx
     * @param {Number} [sy=]
     * @return {Boolean}
     */
    initWithDuration:function (duration, sx, sy) { //function overload here
        if (cc.ActionInterval.prototype.initWithDuration.call(this, duration)) {
            this._endScaleX = sx;
            this._endScaleY = (sy != null) ? sy : sx;
            return true;
        }
        return false;
    },

    /**
     * returns a new clone of the action
     * @returns {cc.ScaleTo}
     */
    clone:function () {
        var action = new cc.ScaleTo();
        action.initWithDuration(this._duration, this._endScaleX, this._endScaleY);
        return action;
    },

    /**
     * @param {cc.Node} target
     */
    startWithTarget:function (target) {
        cc.ActionInterval.prototype.startWithTarget.call(this, target);
        this._startScaleX = target.scaleX;
        this._startScaleY = target.scaleY;
        this._deltaX = this._endScaleX - this._startScaleX;
        this._deltaY = this._endScaleY - this._startScaleY;
    },

    /**
     * @param {Number} time
     */
    update:function (time) {
        if (this.target) {
            this.target.scaleX = this._startScaleX + this._deltaX * time;
	        this.target.scaleY = this._startScaleY + this._deltaY * time;
        }
    }
});
/**
 * @param {Number} duration
 * @param {Number} sx  scale parameter in X
 * @param {Number} [sy] scale parameter in Y, if Null equal to sx
 * @return {cc.ScaleTo}
 * @example
 * // example
 * // It scales to 0.5 in both X and Y.
 * var actionTo = cc.ScaleTo.create(2, 0.5);
 *
 * // It scales to 0.5 in x and 2 in Y
 * var actionTo = cc.ScaleTo.create(2, 0.5, 2);
 */
cc.ScaleTo.create = function (duration, sx, sy) { //function overload
    var scaleTo = new cc.ScaleTo();
    scaleTo.initWithDuration(duration, sx, sy);
    return scaleTo;
};


/** Scales a cc.Node object a zoom factor by modifying it's scale attribute.
 * @class
 * @extends cc.ScaleTo
 */
cc.ScaleBy = cc.ScaleTo.extend(/** @lends cc.ScaleBy# */{
    /**
     * @param {Number} target
     */
    startWithTarget:function (target) {
        cc.ScaleTo.prototype.startWithTarget.call(this, target);
        this._deltaX = this._startScaleX * this._endScaleX - this._startScaleX;
        this._deltaY = this._startScaleY * this._endScaleY - this._startScaleY;
    },

    /**
     * @return {cc.ActionInterval}
     */
    reverse:function () {
        return cc.ScaleBy.create(this._duration, 1 / this._endScaleX, 1 / this._endScaleY);
    },

    /**
     * returns a new clone of the action
     * @returns {cc.ScaleBy}
     */
    clone:function () {
        var action = new cc.ScaleBy();
        action.initWithDuration(this._duration, this._endScaleX, this._endScaleY);
        return action;
    }
});
/**
 * @param {Number} duration duration in seconds
 * @param {Number} sx sx  scale parameter in X
 * @param {Number|Null} [sy=] sy scale parameter in Y, if Null equal to sx
 * @return {cc.ScaleBy}
 * @example
 * // example without sy, it scales by 2 both in X and Y
 * var actionBy = cc.ScaleBy.create(2, 2);
 *
 * //example with sy, it scales by 0.25 in X and 4.5 in Y
 * var actionBy2 = cc.ScaleBy.create(2, 0.25, 4.5);
 */
cc.ScaleBy.create = function (duration, sx, sy) {
    return new cc.ScaleBy(duration, sx, sy);
};

/** Blinks a cc.Node object by modifying it's visible attribute
 * @class
 * @extends cc.ActionInterval
 */
cc.Blink = cc.ActionInterval.extend(/** @lends cc.Blink# */{
    _times:0,
    _originalState:false,

	/**
	 * @constructor
	 * @param {Number} duration  duration in seconds
	 * @param (Number) blinks  blinks in times
	 * @example
	 * var action = new cc.Blink(2, 10);
	 */
    ctor:function (duration, blinks) {
        cc.ActionInterval.prototype.ctor.call(this);
		blinks !== undefined && this.initWithDuration(duration, blinks);
    },

    /**
     * @param {Number} duration duration in seconds
     * @param {Number} blinks blinks in times
     * @return {Boolean}
     */
    initWithDuration:function (duration, blinks) {
        if (cc.ActionInterval.prototype.initWithDuration.call(this, duration)) {
            this._times = blinks;
            return true;
        }
        return false;
    },

    /**
     * returns a new clone of the action
     * @returns {cc.Blink}
     */
    clone:function () {
        var action = new cc.Blink();
        action.initWithDuration(this._duration, this._times);
        return action;
    },

    /**
     * @param {Number} time time in seconds
     */
    update:function (time) {
        if (this.target && !this.isDone()) {
            var slice = 1.0 / this._times;
            var m = time % slice;
            this.target.visible = (m > (slice / 2));
        }
    },

    startWithTarget:function (target) {
        cc.ActionInterval.prototype.startWithTarget.call(this, target);
        this._originalState = target.visible;
    },

    stop:function () {
        this.target.visible = this._originalState;
        cc.ActionInterval.prototype.stop.call(this);
    },

    /**
     * @return {cc.ActionInterval}
     */
    reverse:function () {
        return cc.Blink.create(this._duration, this._times);
    }
});
/**
 * @param {Number} duration  duration in seconds
 * @param blinks blinks in times
 * @return {cc.Blink}
 * @example
 * // example
 * var action = cc.Blink.create(2, 10);
 */
cc.Blink.create = function (duration, blinks) {
    var blink = new cc.Blink();
    blink.initWithDuration(duration, blinks);
    return blink;
};

/** Fades an object that implements the cc.RGBAProtocol protocol. It modifies the opacity from the current value to a custom one.
 * @warning This action doesn't support "reverse"
 * @class
 * @extends cc.ActionInterval
 */
cc.FadeTo = cc.ActionInterval.extend(/** @lends cc.FadeTo# */{
    _toOpacity:0,
    _fromOpacity:0,

	/**
	 * @constructor
	 * @param {Number} duration
	 * @param {Number} opacity 0-255, 0 is transparent
	 * @example
	 * var action = new cc.FadeTo(1.0, 0);
	 */
    ctor:function (duration, opacity) {
        cc.ActionInterval.prototype.ctor.call(this);
		opacity !== undefined && this.initWithDuration(duration, opacity);
    },

    /**
     * @param {Number} duration  duration in seconds
     * @param {Number} opacity
     * @return {Boolean}
     */
    initWithDuration:function (duration, opacity) {
        if (cc.ActionInterval.prototype.initWithDuration.call(this, duration)) {
            this._toOpacity = opacity;
            return true;
        }
        return false;
    },

    /**
     * returns a new clone of the action
     * @returns {cc.FadeTo}
     */
    clone:function () {
        var action = new cc.FadeTo();
        action.initWithDuration(this._duration, this._toOpacity);
        return action;
    },

    /**
     * @param {Number} time time in seconds
     */
    update:function (time) {
        if (this.target.RGBAProtocol) {
            var fromOpacity = this._fromOpacity;
            this.target.opacity = fromOpacity + (this._toOpacity - fromOpacity) * time;
        }
    },

    /**
     * @param {cc.Sprite} target
     */
    startWithTarget:function (target) {
        cc.ActionInterval.prototype.startWithTarget.call(this, target);
        if(this.target.RGBAProtocol){
            this._fromOpacity = target.opacity;
        }
    }
});

/**
 * @param {Number} duration
 * @param {Number} opacity 0-255, 0 is transparent
 * @return {cc.FadeTo}
 * @example
 * // example
 * var action = cc.FadeTo.create(1.0, 0);
 */
cc.FadeTo.create = function (duration, opacity) {
    return new cc.FadeTo(duration, opacity);
};

/** Fades In an object that implements the cc.RGBAProtocol protocol. It modifies the opacity from 0 to 255.<br/>
 * The "reverse" of this action is FadeOut
 * @class
 * @extends cc.FadeTo
 */
cc.FadeIn = cc.FadeTo.extend(/** @lends cc.FadeIn# */{
    _reverseAction: null,
    /**
     * @return {cc.ActionInterval}
     */
    reverse:function () {
        var action = new cc.FadeOut();
        action.initWithDuration(this._duration, 0);
        return action;
    },

    /**
     * returns a new clone of the action
     * @returns {cc.FadeIn}
     */
    clone:function () {
        var action = new cc.FadeIn();
        action.initWithDuration(this._duration, this._toOpacity);
        return action;
    },

    /**
     * @param {cc.Sprite} target
     */
    startWithTarget:function (target) {
        if(this._reverseAction)
            this._toOpacity = this._reverseAction._fromOpacity;
        cc.FadeTo.prototype.startWithTarget.call(this, target);
    }
});

/**
 * @param {Number} duration duration in seconds
 * @param {Number} [toOpacity] to opacity
 * @return {cc.FadeIn}
 * @example
 * //example
 * var action = cc.FadeIn.create(1.0);
 */
cc.FadeIn.create = function (duration, toOpacity) {
    if(toOpacity == null)
        toOpacity = 255;
    return new cc.FadeIn(duration, toOpacity);
};


/** Fades Out an object that implements the cc.RGBAProtocol protocol. It modifies the opacity from 255 to 0.
 * The "reverse" of this action is FadeIn
 * @class
 * @extends cc.FadeTo
 */
cc.FadeOut = cc.FadeTo.extend(/** @lends cc.FadeOut# */{
    /**
     * @return {cc.ActionInterval}
     */
    reverse:function () {
        var action = new cc.FadeIn();
        action._reverseAction = this;
        action.initWithDuration(this._duration, 255);
        return action;
    },

    /**
     * returns a new clone of the action
     * @returns {cc.FadeOut}
     */
    clone:function () {
        var action = new cc.FadeOut();
        action.initWithDuration(this._duration, this._toOpacity);
        return action;
    }
});

/**
 * @param {Number} d  duration in seconds
 * @return {cc.FadeOut}
 * @example
 * // example
 * var action = cc.FadeOut.create(1.0);
 */
cc.FadeOut.create = function (d) {
    var action = new cc.FadeOut();
    action.initWithDuration(d, 0);
    return action;
};

/** Tints a cc.Node that implements the cc.NodeRGB protocol from current tint to a custom one.
 * @warning This action doesn't support "reverse"
 * @class
 * @extends cc.ActionInterval
 */
cc.TintTo = cc.ActionInterval.extend(/** @lends cc.TintTo# */{
    _to:null,
    _from:null,

	/**
	 * @constructor
	 * @param {Number} duration
	 * @param {Number} red 0-255
	 * @param {Number} green  0-255
	 * @param {Number} blue 0-255
	 * @example
	 * var action = new cc.TintTo(2, 255, 0, 255);
	 */
    ctor:function (duration, red, green, blue) {
        cc.ActionInterval.prototype.ctor.call(this);
        this._to = cc.color(0, 0, 0);
        this._from = cc.color(0, 0, 0);

		blue !== undefined && this.initWithDuration(duration, red, green, blue);
    },

    /**
     * @param {Number} duration
     * @param {Number} red 0-255
     * @param {Number} green 0-255
     * @param {Number} blue 0-255
     * @return {Boolean}
     */
    initWithDuration:function (duration, red, green, blue) {
        if (cc.ActionInterval.prototype.initWithDuration.call(this, duration)) {
            this._to = cc.color(red, green, blue);
            return true;
        }
        return false;
    },

    /**
     * returns a new clone of the action
     * @returns {cc.TintTo}
     */
    clone:function () {
        var action = new cc.TintTo();
        var locTo = this._to;
        action.initWithDuration(this._duration, locTo.r, locTo.g, locTo.b);
        return action;
    },

    /**
     * @param {cc.Sprite} target
     */
    startWithTarget:function (target) {
        cc.ActionInterval.prototype.startWithTarget.call(this, target);
        if (this.target.RGBAProtocol) {
            this._from = this.target.color;
        }
    },

    /**
     * @param {Number} time time in seconds
     */
    update:function (time) {
        var locFrom = this._from, locTo = this._to;
        if (this.target.RGBAProtocol) {
            this.target.color = cc.color(locFrom.r + (locTo.r - locFrom.r) * time,
                                        locFrom.g + (locTo.g - locFrom.g) * time,
	                                    locFrom.b + (locTo.b - locFrom.b) * time);
        }
    }
});

/**
 * @param {Number} duration
 * @param {Number} red 0-255
 * @param {Number} green  0-255
 * @param {Number} blue 0-255
 * @return {cc.TintTo}
 * @example
 * // example
 * var action = cc.TintTo.create(2, 255, 0, 255);
 */
cc.TintTo.create = function (duration, red, green, blue) {
    return new cc.TintTo(duration, red, green, blue);
};


/**  Tints a cc.Node that implements the cc.NodeRGB protocol from current tint to a custom one.
 * @class
 * @extends cc.ActionInterval
 */
cc.TintBy = cc.ActionInterval.extend(/** @lends cc.TintBy# */{
    _deltaR:0,
    _deltaG:0,
    _deltaB:0,

    _fromR:0,
    _fromG:0,
    _fromB:0,

	/**
	 * @constructor
	 * @param {Number} duration  duration in seconds
	 * @param {Number} deltaRed
	 * @param {Number} deltaGreen
	 * @param {Number} deltaBlue
	 * @example
	 * var action = new cc.TintBy(2, -127, -255, -127);
	 */
    ctor:function (duration, deltaRed, deltaGreen, deltaBlue) {
        cc.ActionInterval.prototype.ctor.call(this);
		deltaBlue !== undefined && this.initWithDuration(duration, deltaRed, deltaGreen, deltaBlue);
    },

    /**
     * @param {Number} duration
     * @param {Number} deltaRed 0-255
     * @param {Number} deltaGreen 0-255
     * @param {Number} deltaBlue 0-255
     * @return {Boolean}
     */
    initWithDuration:function (duration, deltaRed, deltaGreen, deltaBlue) {
        if (cc.ActionInterval.prototype.initWithDuration.call(this, duration)) {
            this._deltaR = deltaRed;
            this._deltaG = deltaGreen;
            this._deltaB = deltaBlue;
            return true;
        }
        return false;
    },

    /**
     * returns a new clone of the action
     * @returns {cc.TintBy}
     */
    clone:function () {
        var action = new cc.TintBy();
        action.initWithDuration(this._duration, this._deltaR, this._deltaG, this._deltaB);
        return action;
    },

    /**
     * @param {cc.Sprite} target
     */
    startWithTarget:function (target) {
        cc.ActionInterval.prototype.startWithTarget.call(this, target);
        if (target.RGBAProtocol) {
            var color = target.color;
            this._fromR = color.r;
            this._fromG = color.g;
            this._fromB = color.b;
        }
    },

    /**
     * @param {Number} time time in seconds
     */
    update:function (time) {
        if (this.target.RGBAProtocol) {
            this.target.color = cc.color(this._fromR + this._deltaR * time,
                                        this._fromG + this._deltaG * time,
                                        this._fromB + this._deltaB * time);
        }
    },

    /**
     * @return {cc.ActionInterval}
     */
    reverse:function () {
        return cc.TintBy.create(this._duration, -this._deltaR, -this._deltaG, -this._deltaB);
    }
});

/**
 * @param {Number} duration  duration in seconds
 * @param {Number} deltaRed
 * @param {Number} deltaGreen
 * @param {Number} deltaBlue
 * @return {cc.TintBy}
 * @example
 * // example
 * var action = cc.TintBy.create(2, -127, -255, -127);
 */
cc.TintBy.create = function (duration, deltaRed, deltaGreen, deltaBlue) {
    return new cc.TintBy(duration, deltaRed, deltaGreen, deltaBlue);
};

/** Delays the action a certain amount of seconds
 * @class
 * @extends cc.ActionInterval
 */
cc.DelayTime = cc.ActionInterval.extend(/** @lends cc.DelayTime# */{
    /**
     * @param {Number} time time in seconds
     */
    update:function (time) {
    },

    /**
     * @return {cc.ActionInterval}
     */
    reverse:function () {
        return cc.DelayTime.create(this._duration);
    },

    /**
     * returns a new clone of the action
     * @returns {cc.DelayTime}
     */
    clone:function () {
        var action = new cc.DelayTime();
        action.initWithDuration(this._duration);
        return action;
    }
});

/**
 * @param {Number} d duration in seconds
 * @return {cc.DelayTime}
 * @example
 * // example
 * var delay = cc.DelayTime.create(1);
 */
cc.DelayTime.create = function (d) {
    return new cc.DelayTime(d);
};

/**
 * <p>
 * Executes an action in reverse order, from time=duration to time=0                                     <br/>
 * @warning Use this action carefully. This action is not sequenceable.                                 <br/>
 * Use it as the default "reversed" method of your own actions, but using it outside the "reversed"      <br/>
 * scope is not recommended.
 * </p>
 * @class
 * @extends cc.ActionInterval
 */
cc.ReverseTime = cc.ActionInterval.extend(/** @lends cc.ReverseTime# */{
    _other:null,

	/**
	 * @constructor
	 * @param {cc.FiniteTimeAction} action
	 * @example
	 *  var reverse = new cc.ReverseTime(this);
	 */
    ctor:function (action) {
        cc.ActionInterval.prototype.ctor.call(this);
        this._other = null;

		action && this.initWithAction(action);
    },

    /**
     * @param {cc.FiniteTimeAction} action
     * @return {Boolean}
     */
    initWithAction:function (action) {
        if(!action)
            throw "cc.ReverseTime.initWithAction(): action must be non null";
        if(action == this._other)
            throw "cc.ReverseTime.initWithAction(): the action was already passed in.";

        if (cc.ActionInterval.prototype.initWithDuration.call(this, action.getDuration())) {
            // Don't leak if action is reused
            this._other = action;
            return true;
        }
        return false;
    },

    /**
     * returns a new clone of the action
     * @returns {cc.ReverseTime}
     */
    clone:function () {
        var action = new cc.ReverseTime();
        action.initWithAction(this._other.clone());
        return action;
    },

    /**
     * @param {cc.Node} target
     */
    startWithTarget:function (target) {
        cc.ActionInterval.prototype.startWithTarget.call(this, target);
        this._other.startWithTarget(target);
    },

    /**
     * @param {Number} time time in seconds
     */
    update:function (time) {
        if (this._other)
            this._other.update(1 - time);
    },

    /**
     * @return {cc.ActionInterval}
     */
    reverse:function () {
        return this._other.clone();
    },

    /**
     * Stop the action
     */
    stop:function () {
        this._other.stop();
        cc.Action.prototype.stop.call(this);
    }
});

/**
 * @param {cc.FiniteTimeAction} action
 * @return {cc.ReverseTime}
 * @example
 * // example
 *  var reverse = cc.ReverseTime.create(this);
 */
cc.ReverseTime.create = function (action) {
    return new cc.ReverseTime(action);
};


/**  Animates a sprite given the name of an Animation
 * @class
 * @extends cc.ActionInterval
 */
cc.Animate = cc.ActionInterval.extend(/** @lends cc.Animate# */{
    _animation:null,
    _nextFrame:0,
    _origFrame:null,
    _executedLoops:0,
    _splitTimes:null,

	/**
	 * @constructor
	 * create the animate with animation
	 * @param {cc.Animation} animation
	 * @example
	 * // create the animation with animation
	 * var anim = new cc.Animate(dance_grey);
	 */
    ctor:function (animation) {
        cc.ActionInterval.prototype.ctor.call(this);
        this._splitTimes = [];

		animation && this.initWithAnimation(animation);
    },

    /**
     * @return {cc.Animation}
     */
    getAnimation:function () {
        return this._animation;
    },

    /**
     * @param {cc.Animation} animation
     */
    setAnimation:function (animation) {
        this._animation = animation;
    },

    /**
     * @param {cc.Animation} animation
     * @return {Boolean}
     */
    initWithAnimation:function (animation) {
        if(!animation)
            throw "cc.Animate.initWithAnimation(): animation must be non-NULL";
        var singleDuration = animation.getDuration();
        if (this.initWithDuration(singleDuration * animation.getLoops())) {
            this._nextFrame = 0;
            this.setAnimation(animation);

            this._origFrame = null;
            this._executedLoops = 0;
            var locTimes = this._splitTimes;
            locTimes.length = 0;

            var accumUnitsOfTime = 0;
            var newUnitOfTimeValue = singleDuration / animation.getTotalDelayUnits();

            var frames = animation.getFrames();
            cc.arrayVerifyType(frames, cc.AnimationFrame);

            for (var i = 0; i < frames.length; i++) {
                var frame = frames[i];
                var value = (accumUnitsOfTime * newUnitOfTimeValue) / singleDuration;
                accumUnitsOfTime += frame.getDelayUnits();
                locTimes.push(value);
            }
            return true;
        }
        return false;
    },

    /**
     * returns a new clone of the action
     * @returns {cc.Animate}
     */
    clone:function () {
        var action = new cc.Animate();
        action.initWithAnimation(this._animation.clone());
        return action;
    },

    /**
     * @param {cc.Sprite} target
     */
    startWithTarget:function (target) {
        cc.ActionInterval.prototype.startWithTarget.call(this, target);
        if (this._animation.getRestoreOriginalFrame())
            this._origFrame = target.displayFrame();
        this._nextFrame = 0;
        this._executedLoops = 0;
    },

    /**
     * @param {Number} time
     */
    update:function (time) {
        // if t==1, ignore. Animation should finish with t==1
        if (time < 1.0) {
            time *= this._animation.getLoops();

            // new loop?  If so, reset frame counter
            var loopNumber = 0 | time;
            if (loopNumber > this._executedLoops) {
                this._nextFrame = 0;
                this._executedLoops++;
            }

            // new t for animations
            time = time % 1.0;
        }

        var frames = this._animation.getFrames();
        var numberOfFrames = frames.length, locSplitTimes = this._splitTimes;
        for (var i = this._nextFrame; i < numberOfFrames; i++) {
            if (locSplitTimes[i] <= time) {
                this.target.setSpriteFrame(frames[i].getSpriteFrame());
                this._nextFrame = i + 1;
            } else {
                // Issue 1438. Could be more than one frame per tick, due to low frame rate or frame delta < 1/FPS
                break;
            }
        }
    },

    /**
     * @return {cc.ActionInterval}
     */
    reverse:function () {
        var locAnimation = this._animation;
        var oldArray = locAnimation.getFrames();
        var newArray = [];
        cc.arrayVerifyType(oldArray, cc.AnimationFrame);
        if (oldArray.length > 0) {
            for (var i = oldArray.length - 1; i >= 0; i--) {
                var element = oldArray[i];
                if (!element)
                    break;
                newArray.push(element.clone());
            }
        }
        var newAnim = cc.Animation.create(newArray, locAnimation.getDelayPerUnit(), locAnimation.getLoops());
        newAnim.setRestoreOriginalFrame(locAnimation.getRestoreOriginalFrame());
        return cc.Animate.create(newAnim);
    },

    /**
     * stop the action
     */
    stop:function () {
        if (this._animation.getRestoreOriginalFrame() && this.target)
            this.target.setSpriteFrame(this._origFrame);
        cc.Action.prototype.stop.call(this);
    }
});

/**
 * create the animate with animation
 * @param {cc.Animation} animation
 * @return {cc.Animate}
 * @example
 * // example
 * // create the animation with animation
 * var anim = cc.Animate.create(dance_grey);
 */
cc.Animate.create = function (animation) {
    return new cc.Animate(animation);
};

/**
 * <p>
 *     Overrides the target of an action so that it always runs on the target<br/>
 *     specified at action creation rather than the one specified by runAction.
 * </p>
 * @class
 * @extends cc.ActionInterval
 */
cc.TargetedAction = cc.ActionInterval.extend(/** @lends cc.TargetedAction# */{
    _action:null,
    _forcedTarget:null,

	/**
	 * Create an action with the specified action and forced target
	 * @constructor
	 * @param {cc.Node} target
	 * @param {cc.FiniteTimeAction} action
	 */
    ctor: function (target, action) {
        cc.ActionInterval.prototype.ctor.call(this);
		action && this.initWithTarget(target, action);
    },

    /**
     * Init an action with the specified action and forced target
     * @param {cc.Node} target
     * @param {cc.FiniteTimeAction} action
     * @return {Boolean}
     */
    initWithTarget:function (target, action) {
        if (this.initWithDuration(action.getDuration())) {
            this._forcedTarget = target;
            this._action = action;
            return true;
        }
        return false;
    },

    /**
     * returns a new clone of the action
     * @returns {cc.TargetedAction}
     */
    clone:function () {
        var action = new cc.TargetedAction();
        action.initWithTarget(this._forcedTarget, this._action.clone());
        return action;
    },

    startWithTarget:function (target) {
        cc.ActionInterval.prototype.startWithTarget.call(this, target);
        this._action.startWithTarget(this._forcedTarget);
    },

    stop:function () {
        this._action.stop();
    },

    update:function (time) {
        this._action.update(time);
    },

    /**
     * return the target that the action will be forced to run with
     * @return {cc.Node}
     */
    getForcedTarget:function () {
        return this._forcedTarget;
    },

    /**
     * set the target that the action will be forced to run with
     * @param {cc.Node} forcedTarget
     */
    setForcedTarget:function (forcedTarget) {
        if (this._forcedTarget != forcedTarget)
            this._forcedTarget = forcedTarget;
    }
});

/**
 * Create an action with the specified action and forced target
 * @param {cc.Node} target
 * @param {cc.FiniteTimeAction} action
 * @return {cc.TargetedAction}
 */
cc.TargetedAction.create = function (target, action) {
    return new cc.TargetedAction(target, action);
};
