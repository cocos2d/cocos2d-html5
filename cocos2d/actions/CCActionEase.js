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
 * Base class for Easing actions
 * @class
 * @extends cc.ActionInterval
 */

cc.ActionEase = cc.ActionInterval.extend(/** @lends cc.ActionEase# */{
    _inner:null,

	/**
	 * creates the action of ActionEase
	 *
	 * Constructor of cc.ActionEase
	 * @param {cc.ActionInterval} action
	 *
	 * @example
	 * var moveEase = new cc.ActionEase(action);
	 */
    ctor: function (action) {
        cc.ActionInterval.prototype.ctor.call(this);
        action && this.initWithAction(action);
    },

    /** initializes the action
     * @param {cc.ActionInterval} action
     * @return {Boolean}
     */
    initWithAction:function (action) {
        if(!action)
            throw "cc.ActionEase.initWithAction(): action must be non nil";

        if (this.initWithDuration(action.getDuration())) {
            this._inner = action;
            return true;
        }
        return false;
    },

    clone:function(){
       var action = new cc.ActionEase();
        action.initWithAction(this._inner.clone());
        return action;
    },

    /**
     * @param {cc.Node} target
     */
    startWithTarget:function (target) {
        cc.ActionInterval.prototype.startWithTarget.call(this, target);
        this._inner.startWithTarget(this.target);
    },

    /**
     * Stop the action.
     */
    stop:function () {
        this._inner.stop();
        cc.ActionInterval.prototype.stop.call(this);
    },

    /**
     * @param {Number} time1
     */
    update:function (time1) {
        this._inner.update(time1);
    },

    /**
     * @return {cc.ActionInterval}
     */
    reverse:function () {
        return cc.ActionEase.create(this._inner.reverse());
    },

    getInnerAction:function(){
       return this._inner;
    }
});

/** creates the action of ActionEase
 * @param {cc.ActionInterval} action
 * @return {cc.ActionEase}
 * @example
 * // example
 * var moveEase = cc.ActionEase.create(action);
 */
cc.ActionEase.create = function (action) {
    return new cc.ActionEase(action);
};

/**
 * Base class for Easing actions with rate parameters
 * @class
 * @extends cc.ActionEase
 */
cc.EaseRateAction = cc.ActionEase.extend(/** @lends cc.EaseRateAction# */{
    _rate:0,

	/**
	 * Creates the action with the inner action and the rate parameter
	 *
	 * Constructor of cc.EaseRateAction
	 * @param {cc.ActionInterval} action
	 * @param {Number} rate
	 *
	 * @example
	 * // example
	 * var moveEaseRateAction = new cc.EaseRateAction(action, 3.0);
	 */
    ctor: function(action, rate){
        cc.ActionEase.prototype.ctor.call(this);

		rate !== undefined && this.initWithAction(action, rate);
    },

    /** set rate value for the actions
     * @param {Number} rate
     */
    setRate:function (rate) {
        this._rate = rate;
    },

    /** get rate value for the actions
     * @return {Number}
     */
    getRate:function () {
        return this._rate;
    },

    /**
     * Initializes the action with the inner action and the rate parameter
     * @param {cc.ActionInterval} action
     * @param {Number} rate
     * @return {Boolean}
     */
    initWithAction:function (action, rate) {
        if (cc.ActionEase.prototype.initWithAction.call(this, action)) {
            this._rate = rate;
            return true;
        }
        return false;
    },

    clone:function(){
        var action = new cc.EaseRateAction();
        action.initWithAction(this._inner.clone(), this._rate);
        return action;
    },

    /**
     * @return {cc.EaseRateAction}
     */
    reverse:function () {
        return cc.EaseRateAction.create(this._inner.reverse(), 1 / this._rate);
    }
});

/** Creates the action with the inner action and the rate parameter
 * @param {cc.ActionInterval} action
 * @param {Number} rate
 * @return {cc.EaseRateAction}
 * @example
 * // example
 * var moveEaseRateAction = cc.EaseRateAction.create(action, 3.0);
 */
cc.EaseRateAction.create = function (action, rate) {
    return new cc.EaseRateAction(action, rate);
};

/**
 * cc.EaseIn action with a rate
 * @class
 * @extends cc.EaseRateAction
 */
cc.EaseIn = cc.EaseRateAction.extend(/** @lends cc.EaseIn# */{
    /**
     * @param {Number} time1
     */
    update:function (time1) {
        this._inner.update(Math.pow(time1, this._rate));
    },

    /**
     * @return {cc.EaseIn}
     */
    reverse:function () {
        return cc.EaseIn.create(this._inner.reverse(), 1 / this._rate);
    },

    clone:function(){
        var action = new cc.EaseIn();
        action.initWithAction(this._inner.clone(), this._rate);
        return action;
    }
});

/** Creates the action with the inner action and the rate parameter
 * @param {cc.ActionInterval} action
 * @param {Number} rate
 * @return {cc.EaseIn}
 * @example
 * // example
 * var moveEaseIn = cc.EaseIn.create(action, 3.0);
 */
cc.EaseIn.create = function (action, rate) {
    return new cc.EaseIn(action, rate);
};

cc.easeIn = function (rate) {
    return {
        _rate: rate,
        easing: function (dt) {
            return Math.pow(dt, this._rate);
        },
        reverse: function(){
            return cc.easeIn(1 / this._rate);
        }
    };
};

/**
 * cc.EaseOut action with a rate
 * @class
 * @extends cc.EaseRateAction
 */
cc.EaseOut = cc.EaseRateAction.extend(/** @lends cc.EaseOut# */{
    /**
     * @param {Number} time1
     */
    update:function (time1) {
        this._inner.update(Math.pow(time1, 1 / this._rate));
    },

    /**
     * @return {cc.EaseOut}
     */
    reverse:function () {
        return cc.EaseOut.create(this._inner.reverse(), 1 / this._rate);
    },

    clone:function(){
        var action = new cc.EaseOut();
        action.initWithAction(this._inner.clone(),this._rate);
        return action;
    }
});

/** Creates the action with the inner action and the rate parameter
 * @param {cc.ActionInterval} action
 * @param {Number} rate
 * @return {cc.EaseOut}
 * @example
 * // example
 * var moveEaseOut = cc.EaseOut.create(action, 3.0);
 */
cc.EaseOut.create = function (action, rate) {
    return new cc.EaseOut(action, rate);
};

cc.easeOut = function (rate) {
    return {
        _rate: rate,
        easing: function (dt) {
            return Math.pow(dt, 1 / this._rate);
        },
        reverse: function(){
            return cc.easeOut(1 / this._rate)
        }
    };
};

/**
 * cc.EaseInOut action with a rate
 * @class
 * @extends cc.EaseRateAction
 */
cc.EaseInOut = cc.EaseRateAction.extend(/** @lends cc.EaseInOut# */{
    /**
     * @param {Number} time1
     */
    update:function (time1) {
        time1 *= 2;
        if (time1 < 1)
            this._inner.update(0.5 * Math.pow(time1, this._rate));
        else
            this._inner.update(1.0 - 0.5 * Math.pow(2 - time1, this._rate));
    },

    clone:function(){
        var action = new cc.EaseInOut();
        action.initWithAction(this._inner.clone(), this._rate);
        return action;
    },

    /**
     * @return {cc.EaseInOut}
     */
    reverse:function () {
        return cc.EaseInOut.create(this._inner.reverse(), this._rate);
    }
});

/** Creates the action with the inner action and the rate parameter
 * @param {cc.ActionInterval} action
 * @param {Number} rate
 * @return {cc.EaseInOut}
 * @example
 * // example
 * var moveEaseInOut = cc.EaseInOut.create(action, 3.0);
 */
cc.EaseInOut.create = function (action, rate) {
    return new cc.EaseInOut(action, rate);
};

cc.easeInOut = function (rate) {
    return {
        _rate: rate,
        easing: function (dt) {
            dt *= 2;
            if (dt < 1)
                return 0.5 * Math.pow(dt, this._rate);
            else
                return 1.0 - 0.5 * Math.pow(2 - dt, this._rate);
        },
        reverse: function(){
            return cc.easeInOut(this._rate);
        }
    };
};

/**
 * cc.Ease Exponential In
 * @class
 * @extends cc.ActionEase
 */
cc.EaseExponentialIn = cc.ActionEase.extend(/** @lends cc.EaseExponentialIn# */{
    /**
     * @param {Number} time1
     */
    update:function (time1) {
        this._inner.update(time1 === 0 ? 0 : Math.pow(2, 10 * (time1 - 1)));
    },

    /**
     * @return {cc.EaseExponentialOut}
     */
    reverse:function () {
        return cc.EaseExponentialOut.create(this._inner.reverse());
    },

    clone:function(){
        var action = new cc.EaseExponentialIn();
        action.initWithAction(this._inner.clone());
        return action;
    }
});

/** creates the action
 * @param {cc.ActionInterval} action
 * @return {cc.EaseExponentialIn}
 * @example
 * // example
 * var moveEaseExponentialIn = cc.EaseExponentialIn.create(action);
 */
cc.EaseExponentialIn.create = function (action) {
    return new cc.EaseExponentialIn(action);
};

cc._easeExponentialInObj = {
    easing: function(dt){
        return dt === 0 ? 0 : Math.pow(2, 10 * (dt - 1));
    },
    reverse: function(){
        return cc._easeExponentialOutObj;
    }
};
cc.easeExponentialIn = function(){
    return cc._easeExponentialInObj;
};

/**
 * Ease Exponential Out
 * @class
 * @extends cc.ActionEase
 */
cc.EaseExponentialOut = cc.ActionEase.extend(/** @lends cc.EaseExponentialOut# */{
    /**
     * @param {Number} time1
     */
    update:function (time1) {
        this._inner.update(time1 == 1 ? 1 : (-(Math.pow(2, -10 * time1)) + 1));
    },

    /**
     * @return {cc.EaseExponentialIn}
     */
    reverse:function () {
        return cc.EaseExponentialIn.create(this._inner.reverse());
    },

    clone:function(){
        var action = new cc.EaseExponentialOut();
        action.initWithAction(this._inner.clone());
        return action;
    }
});

/** creates the action
 * @param {cc.ActionInterval} action
 * @return {cc.EaseExponentialOut}
 * @example
 * // example
 * var moveEaseExponentialOut = cc.EaseExponentialOut.create(action);
 */
cc.EaseExponentialOut.create = function (action) {
    return new cc.EaseExponentialOut(action);
};

cc._easeExponentialOutObj = {
    easing: function(dt){
        return dt == 1 ? 1 : (-(Math.pow(2, -10 * dt)) + 1);
    },
    reverse: function(){
        return cc._easeExponentialInObj;
    }
};
cc.easeExponentialOut = function(){
    return cc._easeExponentialOutObj;
};

/**
 * Ease Exponential InOut
 * @class
 * @extends cc.ActionEase
 */
cc.EaseExponentialInOut = cc.ActionEase.extend(/** @lends cc.EaseExponentialInOut# */{
    /**
     * @param {Number} time
     */
    update:function (time) {
        if( time != 1 && time !== 0) {
            time *= 2;
            if (time < 1)
                time = 0.5 * Math.pow(2, 10 * (time - 1));
            else
                time = 0.5 * (-Math.pow(2, -10 * (time - 1)) + 2);
        }
        this._inner.update(time);
    },

    /**
     * @return {cc.EaseExponentialInOut}
     */
    reverse:function () {
        return cc.EaseExponentialInOut.create(this._inner.reverse());
    },

    clone:function(){
        var action = new cc.EaseExponentialInOut();
        action.initWithAction(this._inner.clone());
        return action;
    }
});

/** creates an EaseExponentialInOut action
 * @param {cc.ActionInterval} action
 * @return {cc.EaseExponentialInOut}
 * @example
 * // example
 * var moveEaseExponentialInOut = cc.EaseExponentialInOut.create(action);
 */
cc.EaseExponentialInOut.create = function (action) {
    return new cc.EaseExponentialInOut(action);
};

cc._easeExponentialInOutObj = {
    easing: function(dt){
        if( dt !== 1 && dt !== 0) {
            dt *= 2;
            if (dt < 1)
                return 0.5 * Math.pow(2, 10 * (dt - 1));
            else
                return 0.5 * (-Math.pow(2, -10 * (dt - 1)) + 2);
        }
        return dt;
    },
    reverse: function(){
        return cc._easeExponentialInOutObj;
    }
};
cc.easeExponentialInOut = function(){
    return cc._easeExponentialInOutObj;
};

/**
 * Ease Sine In
 * @class
 * @extends cc.ActionEase
 */
cc.EaseSineIn = cc.ActionEase.extend(/** @lends cc.EaseSineIn# */{
    /**
     * @param {Number} time1
     */
    update:function (time1) {
        time1 = time1===0 || time1===1 ? time1 : -1 * Math.cos(time1 * Math.PI / 2) + 1;
        this._inner.update(time1);
    },

    /**
     * @return {cc.EaseSineOut}
     */
    reverse:function () {
        return cc.EaseSineOut.create(this._inner.reverse());
    },

    clone:function(){
        var action = new cc.EaseSineIn();
        action.initWithAction(this._inner.clone());
        return action;
    }
});

/** creates an EaseSineIn action
 * @param {cc.ActionInterval} action
 * @return {cc.EaseSineIn}
 * @example
 * // example
 * var moveSineIn = cc.EaseSineIn.create(action);
 */
cc.EaseSineIn.create = function (action) {
    return new cc.EaseSineIn(action);
};

cc._easeSineInObj = {
    easing: function(dt){
        return (dt===0 || dt===1) ? dt : -1 * Math.cos(dt * Math.PI / 2) + 1;
    },
    reverse: function(){
        return cc._easeSineOutObj;
    }
};
cc.easeSineIn = function(){
    return cc._easeSineInObj;
};

/**
 * Ease Sine Out
 * @class
 * @extends cc.ActionEase
 */
cc.EaseSineOut = cc.ActionEase.extend(/** @lends cc.EaseSineOut# */{
    /**
     * @param {Number} time1
     */
    update:function (time1) {
        time1 = time1===0 || time1===1 ? time1 : Math.sin(time1 * Math.PI / 2);
        this._inner.update(time1);
    },

    /**
     * @return {cc.EaseSineIn}
     */
    reverse:function () {
        return cc.EaseSineIn.create(this._inner.reverse());
    },

    clone:function(){
        var action = new cc.EaseSineOut();
        action.initWithAction(this._inner.clone());
        return action;
    }
});

/** creates an EaseSineOut action
 * @param {cc.ActionInterval} action
 * @return {cc.EaseSineOut}
 * @example
 * // example
 * var moveEaseOut = cc.EaseSineOut.create(action);
 */
cc.EaseSineOut.create = function (action) {
    return new cc.EaseSineOut(action);
};

cc._easeSineOutObj = {
    easing: function(dt){
        return (dt===0 || dt==1) ? dt : Math.sin(dt * Math.PI / 2);
    },
    reverse: function(){
        return cc._easeSineInObj;
    }
};
cc.easeSineOut = function(){
    return cc._easeSineOutObj;
};

/**
 * Ease Sine InOut
 * @class
 * @extends cc.ActionEase
 */
cc.EaseSineInOut = cc.ActionEase.extend(/** @lends cc.EaseSineInOut# */{
    /**
     * @param {Number} time1
     */
    update:function (time1) {
        time1 = time1===0 || time1===1 ? time1 : -0.5 * (Math.cos(Math.PI * time1) - 1);
        this._inner.update(time1);
    },

    clone:function(){
        var action = new cc.EaseSineInOut();
        action.initWithAction(this._inner.clone());
        return action;
    },

    /**
     * @return {cc.EaseSineInOut}
     */
    reverse:function () {
        return cc.EaseSineInOut.create(this._inner.reverse());
    }
});

/** creates the action
 * @param {cc.ActionInterval} action
 * @return {cc.EaseSineInOut}
 * @example
 * // example
 * var moveEaseSineInOut = cc.EaseSineInOut.create(action);
 */
cc.EaseSineInOut.create = function (action) {
    return new cc.EaseSineInOut(action);
};

cc._easeSineInOutObj = {
    easing: function(dt){
        return (dt === 0 || dt === 1) ? dt : -0.5 * (Math.cos(Math.PI * dt) - 1);
    },
    reverse: function(){
        return cc._easeSineInOutObj;
    }
};
cc.easeSineInOut = function(){
    return cc._easeSineInOutObj;
};

/**
 * Ease Elastic abstract class
 * @class
 * @extends cc.ActionEase
 */
cc.EaseElastic = cc.ActionEase.extend(/** @lends cc.EaseElastic# */{
    _period: 0.3,

	/** Creates the action with the inner action and the period in radians (default is 0.3)
	 *
	 * Constructor of cc.EaseElastic
	 * @param {cc.ActionInterval} action
	 * @param {Number} [period=0.3]
	 *
	 * @example
	 * // example
	 * var moveEaseElastic = new cc.EaseElastic(action, 3.0);
	 */
    ctor:function(action, period){
        cc.ActionEase.prototype.ctor.call(this);

		action && this.initWithAction(action, period);
    },

    /** get period of the wave in radians. default is 0.3
     * @return {Number}
     */
    getPeriod:function () {
        return this._period;
    },

    /** set period of the wave in radians.
     * @param {Number} period
     */
    setPeriod:function (period) {
        this._period = period;
    },

    /** Initializes the action with the inner action and the period in radians (default is 0.3)
     * @param {cc.ActionInterval} action
     * @param {Number} [period=0.3]
     * @return {Boolean}
     */
    initWithAction:function (action, period) {
        cc.ActionEase.prototype.initWithAction.call(this, action);
        this._period = (period == null) ? 0.3 : period;
        return true;
    },

    /**
     * @return {Null}
     */
    reverse:function () {
        cc.log("cc.EaseElastic.reverse(): it should be overridden in subclass.");
        return null;
    },

    clone:function(){
        var action = new cc.EaseElastic();
        action.initWithAction(this._inner.clone(), this._period);
        return action;
    }
});

/** Creates the action with the inner action and the period in radians (default is 0.3)
 * @param {cc.ActionInterval} action
 * @param {Number} [period=0.3]
 * @return {cc.EaseElastic}
 * @example
 * // example
 * var moveEaseElastic = cc.EaseElastic.create(action, 3.0);
 */
cc.EaseElastic.create = function (action, period) {
    return new cc.EaseElastic(action, period);
};

/**
 * Ease Elastic In action.
 * @warning This action doesn't use a bijective function. Actions like Sequence might have an unexpected result when used with this action.
 * @class
 * @extends cc.EaseElastic
 */
cc.EaseElasticIn = cc.EaseElastic.extend(/** @lends cc.EaseElasticIn# */{
    /**
     * @param {Number} time1
     */
    update:function (time1) {
        var newT = 0;
        if (time1 === 0 || time1 === 1) {
            newT = time1;
        } else {
            var s = this._period / 4;
            time1 = time1 - 1;
            newT = -Math.pow(2, 10 * time1) * Math.sin((time1 - s) * Math.PI * 2 / this._period);
        }
        this._inner.update(newT);
    },

    /**
     * @return {cc.EaseElasticOut}
     */
    reverse:function () {
        return cc.EaseElasticOut.create(this._inner.reverse(), this._period);
    },

    clone:function(){
        var action = new cc.EaseElasticIn();
        action.initWithAction(this._inner.clone(), this._period);
        return action;
    }
});

/** Creates the action with the inner action and the period in radians (default is 0.3)
 * @param {cc.ActionInterval} action
 * @param {Number} [period=0.3]
 * @return {cc.EaseElasticIn}
 * @example
 * // example
 * var moveEaseElasticIn = cc.EaseElasticIn.create(action, 3.0);
 */
cc.EaseElasticIn.create = function (action, period) {
    return new cc.EaseElasticIn(action, period);
};

//default ease elastic in object (period = 0.3)
cc._easeElasticInObj = {
   easing:function(dt){
       if (dt === 0 || dt === 1)
           return dt;
       dt = dt - 1;
       return -Math.pow(2, 10 * dt) * Math.sin((dt - (0.3 / 4)) * Math.PI * 2 / 0.3);
   },
    reverse:function(){
        return cc._easeElasticOutObj;
    }
};

cc.easeElasticIn = function (period) {
    if(period && period !== 0.3){
        return {
            _period: period,
            easing: function (dt) {
                if (dt === 0 || dt === 1)
                    return dt;
                dt = dt - 1;
                return -Math.pow(2, 10 * dt) * Math.sin((dt - (this._period / 4)) * Math.PI * 2 / this._period);
            },
            /**
             * @return {cc.EaseElasticIn}
             */
            reverse:function () {
                return cc.easeElasticOut(this._period);
            }
        };
    }
    return cc._easeElasticInObj;
};

/**
 * Ease Elastic Out action.
 * @warning This action doesn't use a bijective function. Actions like Sequence might have an unexpected result when used with this action.
 * @class
 * @extends cc.EaseElastic
 */
cc.EaseElasticOut = cc.EaseElastic.extend(/** @lends cc.EaseElasticOut# */{
    /**
     * @param {Number} time1
     */
    update:function (time1) {
        var newT = 0;
        if (time1 === 0 || time1 == 1) {
            newT = time1;
        } else {
            var s = this._period / 4;
            newT = Math.pow(2, -10 * time1) * Math.sin((time1 - s) * Math.PI * 2 / this._period) + 1;
        }

        this._inner.update(newT);
    },

    /**
     * @return {cc.EaseElasticIn}
     */
    reverse:function () {
        return cc.EaseElasticIn.create(this._inner.reverse(), this._period);
    },

    clone:function(){
        var action = new cc.EaseElasticOut();
        action.initWithAction(this._inner.clone(), this._period);
        return action;
    }
});

/** Creates the action with the inner action and the period in radians (default is 0.3)
 * @param {cc.ActionInterval} action
 * @param {Number} [period=0.3]
 * @return {cc.EaseElasticOut}
 * @example
 * // example
 * var moveEaseElasticOut = cc.EaseElasticOut.create(action, 3.0);
 */
cc.EaseElasticOut.create = function (action, period) {
    return new cc.EaseElasticOut(action, period);
};

//default ease elastic out object (period = 0.3)
cc._easeElasticOutObj = {
    easing: function (dt) {
        return (dt === 0 || dt === 1) ? dt : Math.pow(2, -10 * dt) * Math.sin((dt - (0.3 / 4)) * Math.PI * 2 / 0.3) + 1;
    },
    reverse:function(){
        return cc._easeElasticInObj;
    }
};

cc.easeElasticOut = function (period) {
    if(period && period !== 0.3){
        return {
            _period: period,
            easing: function (dt) {
                return (dt === 0 || dt === 1) ? dt : Math.pow(2, -10 * dt) * Math.sin((dt - (this._period / 4)) * Math.PI * 2 / this._period) + 1;
            },
            reverse:function(){
                return cc.easeElasticIn(this._period);
            }
        };
    }
    return cc._easeElasticOutObj;
};

/**
 * Ease Elastic InOut action.
 * @warning This action doesn't use a bijective function. Actions like Sequence might have an unexpected result when used with this action.
 * @class
 * @extends cc.EaseElastic
 */
cc.EaseElasticInOut = cc.EaseElastic.extend(/** @lends cc.EaseElasticInOut# */{
    /**
     * @param {Number} time1
     */
    update:function (time1) {
        var newT = 0;
        var locPeriod = this._period;
        if (time1 === 0 || time1 == 1) {
            newT = time1;
        } else {
            time1 = time1 * 2;
            if (!locPeriod)
                locPeriod = this._period = 0.3 * 1.5;

            var s = locPeriod / 4;
            time1 = time1 - 1;
            if (time1 < 0)
                newT = -0.5 * Math.pow(2, 10 * time1) * Math.sin((time1 - s) * Math.PI * 2 / locPeriod);
            else
                newT = Math.pow(2, -10 * time1) * Math.sin((time1 - s) * Math.PI * 2 / locPeriod) * 0.5 + 1;
        }
        this._inner.update(newT);
    },

    /**
     * @return {cc.EaseElasticInOut}
     */
    reverse:function () {
        return cc.EaseElasticInOut.create(this._inner.reverse(), this._period);
    },

    clone:function(){
        var action = new cc.EaseElasticInOut();
        action.initWithAction(this._inner.clone(), this._period);
        return action;
    }
});

/** Creates the action with the inner action and the period in radians (default is 0.3)
 * @param {cc.ActionInterval} action
 * @param {Number} [period=0.3]
 * @return {cc.EaseElasticInOut}
 * @example
 * // example
 * var moveEaseElasticInOut = cc.EaseElasticInOut.create(action, 3.0);
 */
cc.EaseElasticInOut.create = function (action, period) {
    return new cc.EaseElasticInOut(action, period);
};

cc.easeElasticInOut = function (period) {
    period = period || 0.3;
    return {
        _period: period,
        easing: function (dt) {
            var newT = 0;
            var locPeriod = this._period;
            if (dt === 0 || dt === 1) {
                newT = dt;
            } else {
                dt = dt * 2;
                if (!locPeriod)
                    locPeriod = this._period = 0.3 * 1.5;
                var s = locPeriod / 4;
                dt = dt - 1;
                if (dt < 0)
                    newT = -0.5 * Math.pow(2, 10 * dt) * Math.sin((dt - s) * Math.PI * 2 / locPeriod);
                else
                    newT = Math.pow(2, -10 * dt) * Math.sin((dt - s) * Math.PI * 2 / locPeriod) * 0.5 + 1;
            }
            return newT;
        },
        reverse: function(){
            return cc.easeElasticInOut(this._period);
        }
    };
};

/**
 * cc.EaseBounce abstract class.
 * @class
 * @extends cc.ActionEase
 */
cc.EaseBounce = cc.ActionEase.extend(/** @lends cc.EaseBounce# */{
    /**
     * @param {Number} time1
     * @return {Number}
     */
    bounceTime:function (time1) {
        if (time1 < 1 / 2.75) {
            return 7.5625 * time1 * time1;
        } else if (time1 < 2 / 2.75) {
            time1 -= 1.5 / 2.75;
            return 7.5625 * time1 * time1 + 0.75;
        } else if (time1 < 2.5 / 2.75) {
            time1 -= 2.25 / 2.75;
            return 7.5625 * time1 * time1 + 0.9375;
        }

        time1 -= 2.625 / 2.75;
        return 7.5625 * time1 * time1 + 0.984375;
    },

    clone:function(){
        var action = new cc.EaseBounce();
        action.initWithAction(this._inner.clone());
        return action;
    },

    /**
     * @return {cc.EaseBounce}
     */
    reverse:function () {
        return cc.EaseBounce.create(this._inner.reverse());
    }
});

/** creates an ease bounce action
 * @param {cc.ActionInterval} action
 * @return {cc.EaseBounce}
 * @example
 * // example
 * var moveEaseBounce = cc.EaseBounce.create(action);
 */
cc.EaseBounce.create = function (action) {
    return new cc.EaseBounce(action);
};

/**
 * cc.EaseBounceIn action.
 * @warning This action doesn't use a bijective function. Actions like Sequence might have an unexpected result when used with this action.
 * @class
 * @extends cc.EaseBounce
 */
cc.EaseBounceIn = cc.EaseBounce.extend(/** @lends cc.EaseBounceIn# */{
    /**
     * @param {Number} time1
     */
    update:function (time1) {
        var newT = 1 - this.bounceTime(1 - time1);
        this._inner.update(newT);
    },

    /**
     * @return {cc.EaseBounceOut}
     */
    reverse:function () {
        return cc.EaseBounceOut.create(this._inner.reverse());
    },

    clone:function(){
        var action = new cc.EaseBounceIn();
        action.initWithAction(this._inner.clone());
        return action;
    }
});

/** creates the action
 * @param {cc.ActionInterval} action
 * @return {cc.EaseBounceIn}
 * @example
 * // example
 * var moveEaseBounceIn = cc.EaseBounceIn.create(action);
 */
cc.EaseBounceIn.create = function (action) {
    return new cc.EaseBounceIn(action);
};

cc._bounceTime = function (time1) {
    if (time1 < 1 / 2.75) {
        return 7.5625 * time1 * time1;
    } else if (time1 < 2 / 2.75) {
        time1 -= 1.5 / 2.75;
        return 7.5625 * time1 * time1 + 0.75;
    } else if (time1 < 2.5 / 2.75) {
        time1 -= 2.25 / 2.75;
        return 7.5625 * time1 * time1 + 0.9375;
    }

    time1 -= 2.625 / 2.75;
    return 7.5625 * time1 * time1 + 0.984375;
};

cc._easeBounceInObj = {
    easing: function(dt){
        return 1 - cc._bounceTime(1 - dt);
    },
    reverse: function(){
        return cc._easeBounceOutObj;
    }
};
cc.easeBounceIn = function(){
    return cc._easeBounceInObj;
};

/**
 * cc.EaseBounceOut action.
 * @warning This action doesn't use a bijective function. Actions like Sequence might have an unexpected result when used with this action.
 * @class
 * @extends cc.EaseBounce
 */
cc.EaseBounceOut = cc.EaseBounce.extend(/** @lends cc.EaseBounceOut# */{
    /**
     * @param {Number} time1
     */
    update:function (time1) {
        var newT = this.bounceTime(time1);
        this._inner.update(newT);
    },

    /**
     * @return {cc.ActionInterval}
     */
    reverse:function () {
        return cc.EaseBounceIn.create(this._inner.reverse());
    },

    clone:function(){
        var action = new cc.EaseBounceOut();
        action.initWithAction(this._inner.clone());
        return action;
    }
});

/** creates the action
 * @param {cc.ActionInterval} action
 * @return {cc.EaseBounceOut}
 * @example
 * // example
 * var moveEaseBounceOut = cc.EaseBounceOut.create(action);
 */
cc.EaseBounceOut.create = function (action) {
    return new cc.EaseBounceOut(action);
};

cc._easeBounceOutObj = {
    easing: function(dt){
        return cc._bounceTime(dt);
    },
    reverse:function () {
        return cc._easeBounceInObj;
    }
};
cc.easeBounceOut = function(){
    return cc._easeBounceOutObj;
};

/**
 * cc.EaseBounceInOut action.
 * @warning This action doesn't use a bijective function. Actions like Sequence might have an unexpected result when used with this action.
 * @class
 * @extends cc.EaseBounce
 */
cc.EaseBounceInOut = cc.EaseBounce.extend(/** @lends cc.EaseBounceInOut# */{
    /**
     * @param {Number} time1
     */
    update:function (time1) {
        var newT = 0;
        if (time1 < 0.5) {
            time1 = time1 * 2;
            newT = (1 - this.bounceTime(1 - time1)) * 0.5;
        } else {
            newT = this.bounceTime(time1 * 2 - 1) * 0.5 + 0.5;
        }
        this._inner.update(newT);
    },

    clone:function(){
        var action = new cc.EaseBounceInOut();
        action.initWithAction(this._inner.clone());
        return action;
    },

    /**
     * @return {cc.EaseBounceInOut}
     */
    reverse:function () {
        return cc.EaseBounceInOut.create(this._inner.reverse());
    }
});

/** creates the action
 * @param {cc.ActionInterval} action
 * @return {cc.EaseBounceInOut}
 * @example
 * // example
 * var moveEaseBounceInOut = cc.EaseBounceInOut.create(action);
 */
cc.EaseBounceInOut.create = function (action) {
    return new cc.EaseBounceInOut(action);
};

cc._easeBounceInOutObj = {
    easing: function (time1) {
        var newT;
        if (time1 < 0.5) {
            time1 = time1 * 2;
            newT = (1 - cc._bounceTime(1 - time1)) * 0.5;
        } else {
            newT = cc._bounceTime(time1 * 2 - 1) * 0.5 + 0.5;
        }
        return newT;
    },
    reverse: function(){
        return cc._easeBounceInOutObj;
    }
};

cc.easeBounceInOut = function(){
    return cc._easeBounceInOutObj;
};

/**
 * cc.EaseBackIn action.
 * @warning This action doesn't use a bijective function. Actions like Sequence might have an unexpected result when used with this action.
 * @class
 * @extends cc.ActionEase
 */
cc.EaseBackIn = cc.ActionEase.extend(/** @lends cc.EaseBackIn# */{
    /**
     * @param {Number} time1
     */
    update:function (time1) {
        var overshoot = 1.70158;
        time1 = time1===0 || time1==1 ? time1 : time1 * time1 * ((overshoot + 1) * time1 - overshoot);
        this._inner.update(time1);
    },

    /**
     * @return {cc.EaseBackOut}
     */
    reverse:function () {
        return cc.EaseBackOut.create(this._inner.reverse());
    },

    clone:function(){
        var action = new cc.EaseBackIn();
        action.initWithAction(this._inner.clone());
        return action;
    }
});


/** creates the action
 * @param {cc.ActionInterval} action
 * @return {cc.EaseBackIn}
 * @example
 * // example
 * var moveEaseBackIn = cc.EaseBackIn.create(action);
 */
cc.EaseBackIn.create = function (action) {
    return new cc.EaseBackIn(action);
};

cc._easeBackInObj = {
    easing: function (time1) {
        var overshoot = 1.70158;
        return (time1===0 || time1===1) ? time1 : time1 * time1 * ((overshoot + 1) * time1 - overshoot);
    },
    reverse: function(){
        return cc._easeBackOutObj;
    }
};

cc.easeBackIn = function(){
    return cc._easeBackInObj;
};

/**
 * cc.EaseBackOut action.
 * @warning This action doesn't use a bijective function. Actions like Sequence might have an unexpected result when used with this action.
 * @class
 * @extends cc.ActionEase
 */
cc.EaseBackOut = cc.ActionEase.extend(/** @lends cc.EaseBackOut# */{
    /**
     * @param {Number} time1
     */
    update:function (time1) {
        var overshoot = 1.70158;
        time1 = time1 - 1;
        this._inner.update(time1 * time1 * ((overshoot + 1) * time1 + overshoot) + 1);
    },

    /**
     * @return {cc.EaseBackIn}
     */
    reverse:function () {
        return cc.EaseBackIn.create(this._inner.reverse());
    },

    clone:function(){
        var action = new cc.EaseBackOut();
        action.initWithAction(this._inner.clone());
        return action;
    }
});

/** creates the action
 * @param {cc.ActionInterval} action
 * @return {cc.EaseBackOut}
 * @example
 * // example
 * var moveEaseBackOut = cc.EaseBackOut.create(action);
 */
cc.EaseBackOut.create = function (action) {
    return new cc.EaseBackOut(action);
};

cc._easeBackOutObj = {
    easing: function (time1) {
        var overshoot = 1.70158;
        time1 = time1 - 1;
        return time1 * time1 * ((overshoot + 1) * time1 + overshoot) + 1;
    },
    reverse: function(){
        return cc._easeBackInObj;
    }
};

cc.easeBackOut = function(){
    return cc._easeBackOutObj;
};

/**
 * cc.EaseBackInOut action.
 * @warning This action doesn't use a bijective function. Actions like Sequence might have an unexpected result when used with this action.
 * @class
 * @extends cc.ActionEase
 */
cc.EaseBackInOut = cc.ActionEase.extend(/** @lends cc.EaseBackInOut# */{
    /**
     * @param {Number} time1
     */
    update:function (time1) {
        var overshoot = 1.70158 * 1.525;
        time1 = time1 * 2;
        if (time1 < 1) {
            this._inner.update((time1 * time1 * ((overshoot + 1) * time1 - overshoot)) / 2);
        } else {
            time1 = time1 - 2;
            this._inner.update((time1 * time1 * ((overshoot + 1) * time1 + overshoot)) / 2 + 1);
        }
    },

    clone:function(){
        var action = new cc.EaseBackInOut();
        action.initWithAction(this._inner.clone());
        return action;
    },

    /**
     * @return {cc.EaseBackInOut}
     */
    reverse:function () {
        return cc.EaseBackInOut.create(this._inner.reverse());
    }
});


/** creates the action
 * @param {cc.ActionInterval} action
 * @return {cc.EaseBackInOut}
 * @example
 * // example
 * var moveEaseBackInOut = cc.EaseBackInOut.create(action);
 */
cc.EaseBackInOut.create = function (action) {
    return new cc.EaseBackInOut(action);
};

cc._easeBackInOutObj = {
    easing: function (time1) {
        var overshoot = 1.70158 * 1.525;
        time1 = time1 * 2;
        if (time1 < 1) {
            return (time1 * time1 * ((overshoot + 1) * time1 - overshoot)) / 2;
        } else {
            time1 = time1 - 2;
            return (time1 * time1 * ((overshoot + 1) * time1 + overshoot)) / 2 + 1;
        }
    },
    reverse: function(){
        return cc._easeBackInOutObj;
    }
};

cc.easeBackInOut = function(){
    return cc._easeBackInOutObj;
};

