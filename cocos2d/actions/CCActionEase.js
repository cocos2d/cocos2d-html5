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

/**
 @brief Base class for Easing actions
 */
cc.ActionEase = cc.ActionInterval.extend({

    /** initializes the action */
    initWithAction:function (action) {
        cc.Assert(action != null, "");

        if (this.initWithDuration(action.getDuration())) {
            this._other = action;
            return true;
        }
        return false;
    },

    copyWithZone:function (zone) {

    },

    startWithTarget:function (target) {
        this._super(target);
        this._other.startWithTarget(this._target);   //TODO, need to be checked
    },

    stop:function () {
        this._other.stop();
        this._super();
    },

    update:function (time1) {
        this._other.update(time1);

    },

    reverse:function () {
        return cc.ActionEase.actionWithAction(this._other.reverse());
    },

    _other:null
});

/** creates the action */
cc.ActionEase.actionWithAction = function (action) {
    var ret = new cc.ActionEase();
    if (ret) {
        ret.initWithAction(action);

    }
    return ret;
};

/**
 @brief Base class for Easing actions with rate parameters
 */
cc.EaseRateAction = cc.ActionEase.extend({

    /** set rate value for the actions */
    setRate:function (rate) {
        this._rate = rate;
    },
    /** get rate value for the actions */
    getRate:function () {
        return this._rate;
    },

    /** Initializes the action with the inner action and the rate parameter */
    initWithAction:function (action, rate) {
        if (this._super(action)) {
            this._rate = rate;
            return true;
        }

        return false;
    },

    copyWithZone:function (zone) {

    },

    reverse:function () {
        return cc.EaseRateAction.actionWithAction(this._other.reverse(), 1 / this._rate);
    },

    _rate:null
});

/** Creates the action with the inner action and the rate parameter */
cc.EaseRateAction.actionWithAction = function (action, rate) {
    var ret = new cc.EaseRateAction();
    if (ret) {
        ret.initWithAction(action, rate);

    }
    return ret;

};

/**
 @brief CCEaseIn action with a rate
 */
cc.EaseIn = cc.EaseRateAction.extend({

    update:function (time1) {
        this._other.update(Math.pow(time1, this._rate));
    },
    copyWithZone:function (zone) {

    }

});

/** Creates the action with the inner action and the rate parameter */
cc.EaseIn.actionWithAction = function (action, rate) {
    var ret = new cc.EaseIn();
    if (ret) {
        ret.initWithAction(action, rate);

    }
    return ret;
};
/**
 @brief CCEaseOut action with a rate
 */
cc.EaseOut = cc.EaseRateAction.extend({

    update:function (time1) {
        this._other.update(Math.pow(time1, 1 / this._rate));
    },
    copyWithZone:function (zone) {

    }


});

/** Creates the action with the inner action and the rate parameter */
cc.EaseOut.actionWithAction = function (action, rate) {
    var ret = new cc.EaseOut();
    if (ret) {
        ret.initWithAction(action, rate);

    }
    return ret;
};

/**
 @brief CCEaseInOut action with a rate
 */
cc.EaseInOut = cc.EaseRateAction.extend({

    update:function (time1) {

        var sign = 1;
        var r = this._rate;

        if (r % 2 == 0) {
            sign = -1;
        }

        time1 *= 2;
        if (time1 < 1) {
            this._other.update(0.5 * Math.pow(time1, this._rate));
        } else {
            this._other.update(sign * 0.5 * (Math.pow(time1 - 2, this._rate) + sign * 2));
        }

    },

    copyWithZone:function (zone) {

    },

    reverse:function () {
        return cc.EaseInOut.actionWithAction(this._other.reverse(), this._rate);

    }


});

/** Creates the action with the inner action and the rate parameter */
cc.EaseInOut.actionWithAction = function (action, rate) {
    var ret = new cc.EaseInOut();
    if (ret) {
        ret.initWithAction(action, rate);

    }
    return ret;
};
/**
 @brief CCEase Exponential In
 */
cc.EaseExponentialIn = cc.ActionEase.extend({

    update:function (time1) {
        this._other.update(time1 == 0 ? 0 : Math.pow(2, 10 * (time1 / 1 - 1)) - 1 * 0.001);

    },

    reverse:function () {
        return cc.EaseExponentialOut.actionWithAction(this._other.reverse());
    },

    copyWithZone:function (zone) {

    }


});

/** creates the action */
cc.EaseExponentialIn.actionWithAction = function (action) {
    var ret = new cc.EaseExponentialIn();
    if (ret) {
        ret.initWithAction(action);

    }
    return ret;
};
/**
 @brief Ease Exponential Out
 */
cc.EaseExponentialOut = cc.ActionEase.extend({

    update:function (time1) {
        this._other.update(time1 == 1 ? 1 : (-(Math.pow(2, -10 * time1 / 1)) + 1));
    },

    reverse:function () {
        return cc.EaseExponentialIn.actionWithAction(this._other.reverse());
    },

    copyWithZone:function (zone) {

    }



});

/** creates the action */
cc.EaseExponentialOut.actionWithAction = function (action) {
    var ret = new cc.EaseExponentialOut();
    if (ret) {
        ret.initWithAction(action);

    }
    return ret;
};
/**
 @brief Ease Exponential InOut
 */
cc.EaseExponentialInOut = cc.ActionEase.extend({


    update:function (time1) {
        time1 /= 0.5;
        if (time1 < 1) {
            time1 = 0.5 * Math.pow(2, 10 * (time1 - 1));
        } else {
            time1 = 0.5 * (-Math.pow(2, 10 * (time1 - 1)) + 2);
        }

        this._other.update(time1);

    },
    copyWithZone:function (zone) {

    }

});


/** creates the action */
cc.EaseExponentialInOut.actionWithAction = function (action) {
    var ret = new cc.EaseExponentialInOut();
    if (ret) {
        ret.initWithAction(action);

    }
    return ret;
};


/**
 @brief Ease Sine In
 */
cc.EaseSineIn = cc.ActionEase.extend({

    update:function (time1) {
        this._other.update(-1 * Math.cos(time1 * Math.PI / 2) + 1);
    },

    reverse:function () {
        return cc.EaseSineOut.actionWithAction(this._other.reverse());
    },

    copyWithZone:function (zone) {

    }
});

/** creates the action */
cc.EaseSineIn.actionWithAction = function (action) {
    var ret = new cc.EaseSineIn();
    if (ret) {
        ret.initWithAction(action);

    }
    return ret;
};
/**
 @brief Ease Sine Out
 */
cc.EaseSineOut = cc.ActionEase.extend({

    update:function (time1) {
        this._other.update(Math.sin(time1 * Math.PI / 2));
    },

    reverse:function () {
        return cc.EaseSineIn.actionWithAction(this._other.reverse());
    },

    copyWithZone:function (zone) {

    }
});


/** creates the action */
cc.EaseSineOut.actionWithAction = function (action) {
    var ret = new cc.EaseSineOut();
    if (ret) {
        ret.initWithAction(action);

    }
    return ret;
};


/**
 @brief Ease Sine InOut
 */
cc.EaseSineInOut = cc.ActionEase.extend({

    update:function (time1) {
        this._other.update(-0.5 * (Math.cos(Math.PI * time1) - 1));

    },

    copyWithZone:function (zone) {

    }

});

/** creates the action */
cc.EaseSineInOut.actionWithAction = function (action) {
    var ret = new cc.EaseSineInOut();
    if (ret) {
        ret.initWithAction(action);

    }
    return ret;
};
//noinspection JSDuplicatedDeclaration
/**
 @brief Ease Elastic abstract class
 @since v0.8.2
 */
cc.EaseElastic = cc.ActionEase.extend({

    /** get period of the wave in radians. default is 0.3 */
    getPeriod:function () {
        return this._period;
    },
    /** set period of the wave in radians. */
    setPeriod:function (period) {
        this._period = period;
    },

    /** Initializes the action with the inner action and the period in radians (default is 0.3) */
    initWithAction:function (action, period) {
        this._super(action);
        this._period = (period == null) ? 3.0 : period;
        return true;
    },

    reverse:function () {
        cc.Assert(0, "");

        return null;
    },

    copyWithZone:function (zone) {

    },

    _period:null
});

/** Creates the action with the inner action and the period in radians (default is 0.3) */
cc.EaseElastic.actionWithAction = function (action, period) {
    var ret = new cc.EaseElastic();
    if (ret) {
        if (period == null) {
            ret.initWithAction(action);
        } else {
            ret.initWithAction(action, period);
        }

    }
    return ret;
};


/**
 @brief Ease Elastic In action.
 @warning This action doesn't use a bijective fucntion. Actions like Sequence might have an unexpected result when used with this action.
 @since v0.8.2
 */
cc.EaseElasticIn = cc.EaseElastic.extend({

    update:function (time1) {
        var newT = 0;
        if (time1 == 0 || time1 == 1) {
            newT = time1;
        } else {
            var s = this._period / 4;
            time1 = time1 - 1;
            newT = -Math.pow(2, 10 * time1) * Math.sin((time1 - s) * Math.PI * 2 / this._period);
        }

        this._other.update(newT);
    },

    reverse:function () {
        return cc.EaseElasticOut.actionWithAction(this._other.reverse(), this._period);
    },

    copyWithZone:function (zone) {

    }


});


/** Creates the action with the inner action and the period in radians (default is 0.3) */
cc.EaseElasticIn.actionWithAction = function (action, period) {
    var ret = new cc.EaseElasticIn();
    if (ret) {
        if (period == null) {
            ret.initWithAction(action);
        } else {
            ret.initWithAction(action, period);
        }

    }
    return ret;
};

/**
 @brief Ease Elastic Out action.
 @warning This action doesn't use a bijective fucntion. Actions like Sequence might have an unexpected result when used with this action.
 @since v0.8.2
 */
cc.EaseElasticOut = cc.EaseElastic.extend({

    update:function (time1) {
        var newT = 0;
        if (time1 == 0 || time1 == 1) {
            newT = time1;
        } else {
            var s = this._period / 4;
            newT = Math.pow(2, -10 * time1) * Math.sin((time1 - s) * Math.PI  * 2 / this._period) + 1;
        }

        this._other.update(newT);

    },

    reverse:function () {
        return cc.EaseElasticIn.actionWithAction(this._other.reverse(), this._period);
    },

    copyWithZone:function (zone) {

    }


});


/** Creates the action with the inner action and the period in radians (default is 0.3) */
cc.EaseElasticOut.actionWithAction = function (action, period) {
    var ret = new cc.EaseElasticOut();
    if (ret) {
        if (period == null) {
            ret.initWithAction(action);
        } else {
            ret.initWithAction(action, period);
        }

    }
    return ret;
};

/**
 @brief Ease Elastic InOut action.
 @warning This action doesn't use a bijective fucntion. Actions like Sequence might have an unexpected result when used with this action.
 @since v0.8.2
 */
cc.EaseElasticInOut = cc.EaseElastic.extend({

    update:function (time1) {
        var newT = 0;
        if (time1 == 0 || time1 == 1) {
            newT = time1;
        } else {
            time1 = time1 * 2;
            if (!this._period) {
                this._period = 0.3 * 1.5;
            }

            var s = this._period / 4;

            time1 = time1 - 1;
            if (time1 < 0) {
                newT = -0.5 * Math.pow(2, 10 * time1) * Math.sin((time1 - s) * Math.PI * 2 / this._period);
            } else {
                newT = Math.pow(2, -10 * time1) * Math.sin((time1 - s) * Math.PI * 2 / this._period) * 0.5 + 1;
            }
        }

        this._other.update(newT);

    },
    reverse:function () {
        return cc.EaseInOut.actionWithAction(this._other.reverse(), this._period);
    },

    copyWithZone:function (zone) {

    }

});

/** Creates the action with the inner action and the period in radians (default is 0.3) */
cc.EaseElasticInOut.actionWithAction = function (action, period) {
    var ret = new cc.EaseElasticInOut();
    if (ret) {
        if (period == null) {
            ret.initWithAction(action);
        } else {
            ret.initWithAction(action, period);
        }

    }
    return ret;
};

/**
 @brief CCEaseBounce abstract class.
 @since v0.8.2
 */
cc.EaseBounce = cc.ActionEase.extend({

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

    copyWithZone:function (zone) {

    }


});

/** creates the action */
cc.EaseBounce.actionWithAction = function (action) {
    var ret = new cc.EaseBounce();
    if (ret) {
        ret.initWithAction(action);
    }
    return ret;
};

/**
 @brief CCEaseBounceIn action.
 @warning This action doesn't use a bijective function. Actions like Sequence might have an unexpected result when used with this action.
 @since v0.8.2
 */
cc.EaseBounceIn = cc.EaseBounce.extend({

    update:function (time1) {
        var newT = 1 - this.bounceTime(1 - time1);
        this._other.update(newT);
    },
    reverse:function () {
        return cc.EaseBounceOut.actionWithAction(this._other.reverse());
    },
    copyWithZone:function (zone) {

    }


});

/** creates the action */
cc.EaseBounceIn.actionWithAction = function (action) {
    var ret = new cc.EaseBounceIn();
    if (ret) {
        ret.initWithAction(action);
    }
    return ret;
};
/**
 @brief EaseBounceOut action.
 @warning This action doesn't use a bijective fucntion. Actions like Sequence might have an unexpected result when used with this action.
 @since v0.8.2
 */
cc.EaseBounceOut = cc.EaseBounce.extend({


    update:function (time1) {
        var newT = this.bounceTime(time1);
        this._other.update(newT);
    },
    reverse:function () {
        return cc.EaseBounceIn.actionWithAction(this._other.reverse());
    },
    copyWithZone:function (zone) {

    }


});

/** creates the action */
cc.EaseBounceOut.actionWithAction = function (action) {
    var ret = new cc.EaseBounceOut();
    if (ret) {
        ret.initWithAction(action);
    }
    return ret;
};

/**
 @brief CCEaseBounceInOut action.
 @warning This action doesn't use a bijective fucntion. Actions like Sequence might have an unexpected result when used with this action.
 @since v0.8.2
 */
cc.EaseBounceInOut = cc.EaseBounce.extend({


    update:function (time1) {
        var newT = 0;
        if (time1 < 0.5) {
            time1 = time1 * 2;
            newT = (1 - this.bounceTime(1 - time1)) * 0.5;
        } else {
            newT = this.bounceTime(time1 * 2 - 1) * 0.5 + 0.5;
        }

        this._other.update(newT);

    },
    copyWithZone:function (zone) {

    }

});

/** creates the action */
cc.EaseBounceInOut.actionWithAction = function (action) {
    var ret = new cc.EaseBounceInOut();
    if (ret) {
        ret.initWithAction(action);
    }
    return ret;
};

/**
 @brief CCEaseBackIn action.
 @warning This action doesn't use a bijective fucntion. Actions like Sequence might have an unexpected result when used with this action.
 @since v0.8.2
 */
cc.EaseBackIn = cc.ActionEase.extend({


    update:function (time1) {
        var overshoot = 1.70158;
        this._other.update(time1 * time1 * ((overshoot + 1) * time1 - overshoot));

    },
    reverse:function () {
        return cc.EaseBackOut.actionWithAction(this._other.reverse());

    },
    copyWithZone:function (zone) {

    }

});


/** creates the action */
cc.EaseBackIn.actionWithAction = function (action) {
    var ret = new cc.EaseBackIn();
    if (ret) {
        ret.initWithAction(action);
    }
    return ret;
};

/**
 @brief CCEaseBackOut action.
 @warning This action doesn't use a bijective fucntion. Actions like Sequence might have an unexpected result when used with this action.
 @since v0.8.2
 */
cc.EaseBackOut = cc.ActionEase.extend({

    update:function (time1) {
        var overshoot = 1.70158;

        time1 = time1 - 1;
        this._other.update(time1 * time1 * ((overshoot + 1) * time1 + overshoot) + 1);
    },
    reverse:function () {
        return cc.EaseBackIn.actionWithAction(this._other.reverse());
    },
    copyWithZone:function (zone) {

    }
});

/** creates the action */
cc.EaseBackOut.actionWithAction = function (action) {
    var ret = new cc.EaseBackOut();
    if (ret) {
        ret.initWithAction(action);
    }
    return ret;
};

/**
 @brief CCEaseBackInOut action.
 @warning This action doesn't use a bijective fucntion. Actions like Sequence might have an unexpected result when used with this action.
 @since v0.8.2
 */
cc.EaseBackInOut = cc.ActionEase.extend({

    update:function (time1) {
        var overshoot = 1.70158 * 1.525;

        time1 = time1 * 2;
        if (time1 < 1) {
            this._other.update((time1 * time1 * ((overshoot + 1) * time1 - overshoot)) / 2);
        } else {
            time1 = time1 - 2;
            this._other.update((time1 * time1 * ((overshoot + 1) * time1 + overshoot)) / 2 + 1);
        }
    },
    copyWithZone:function (zone) {

    }

});


/** creates the action */
cc.EaseBackInOut.actionWithAction = function (action) {
    var ret = new cc.EaseBackInOut();
    if (ret) {
        ret.initWithAction(action);
    }
    return ret;
};

