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
    initWithAction:function (pAction) {
        cc.Assert(pAction != null, "");

        if (this.initWithDuration(pAction.getDuration())) {
            this._m_pOther = pAction;
            return true;
        }
        return false;
    },

    copyWithZone:function (pZone) {

    },

    startWithTarget:function (pTarget) {
        this._super(pTarget);
        this._m_pOther.startWithTarget(this._m_pTarget);   //TODO, need to be checked
    },

    stop:function () {
        this._m_pOther.stop();
        this._super();
    },

    update:function (time1) {
        this._m_pOther.update(time1);

    },

    reverse:function () {
        return cc.ActionEase.actionWithAction(this._m_pOther.reverse());
    },

    _m_pOther:null
});

/** creates the action */
cc.ActionEase.actionWithAction = function (pAction) {
    var pRet = new cc.ActionEase();
    if (pRet) {
        pRet.initWithAction(pAction);

    }
    return pRet;
};

/**
 @brief Base class for Easing actions with rate parameters
 */
cc.EaseRateAction = cc.ActionEase.extend({

    /** set rate value for the actions */
    setRate:function (rate) {
        this._m_fRate = rate;
    },
    /** get rate value for the actions */
    getRate:function () {
        return this._m_fRate;
    },

    /** Initializes the action with the inner action and the rate parameter */
    initWithAction:function (pAction, fRate) {
        if (this._super(pAction)) {
            this._m_fRate = fRate;
            return true;
        }

        return false;
    },

    copyWithZone:function (pZone) {

    },

    reverse:function () {
        return cc.EaseRateAction.actionWithAction(this._m_pOther.reverse(), 1 / this._m_fRate);
    },

    _m_fRate:null
});

/** Creates the action with the inner action and the rate parameter */
cc.EaseRateAction.actionWithAction = function (pAction, fRate) {
    var pRet = new cc.EaseRateAction();
    if (pRet) {
        pRet.initWithAction(pAction, fRate);

    }
    return pRet;

};

/**
 @brief CCEaseIn action with a rate
 */
cc.EaseIn = cc.EaseRateAction.extend({

    update:function (time1) {
        this._m_pOther.update(Math.pow(time1, this._m_fRate));
    },
    copyWithZone:function (pZone) {

    }

});

/** Creates the action with the inner action and the rate parameter */
cc.EaseIn.actionWithAction = function (pAction, fRate) {
    var pRet = new cc.EaseIn();
    if (pRet) {
        pRet.initWithAction(pAction, fRate);

    }
    return pRet;
};
/**
 @brief CCEaseOut action with a rate
 */
cc.EaseOut = cc.EaseRateAction.extend({

    update:function (time1) {
        this._m_pOther.update(Math.pow(time1, 1 / this._m_fRate));
    },
    copyWithZone:function (pZone) {

    }


});

/** Creates the action with the inner action and the rate parameter */
cc.EaseOut.actionWithAction = function (pAction, fRate) {
    var pRet = new cc.EaseOut();
    if (pRet) {
        pRet.initWithAction(pAction, fRate);

    }
    return pRet;
};

/**
 @brief CCEaseInOut action with a rate
 */
cc.EaseInOut = cc.EaseRateAction.extend({

    update:function (time1) {

        var sign = 1;
        var r = this._m_fRate;

        if (r % 2 == 0) {
            sign = -1;
        }

        time1 *= 2;
        if (time1 < 1) {
            this._m_pOther.update(0.5 * Math.pow(time1, this._m_fRate));
        } else {
            this._m_pOther.update(sign * 0.5 * (Math.pow(time1 - 2, this._m_fRate) + sign * 2));
        }

    },

    copyWithZone:function (pZone) {

    },

    reverse:function () {
        return cc.EaseInOut.actionWithAction(this._m_pOther.reverse(), this._m_fRate);

    }


});

/** Creates the action with the inner action and the rate parameter */
cc.EaseInOut.actionWithAction = function (pAction, fRate) {
    var pRet = new cc.EaseInOut();
    if (pRet) {
        pRet.initWithAction(pAction, fRate);

    }
    return pRet;
};
/**
 @brief CCEase Exponential In
 */
cc.EaseExponentialIn = cc.ActionEase.extend({

    update:function (time1) {
        this._m_pOther.update(time1 == 0 ? 0 : Math.pow(2, 10 * (time1 / 1 - 1)) - 1 * 0.001);

    },

    reverse:function () {
        return cc.EaseExponentialOut.actionWithAction(this._m_pOther.reverse());
    },

    copyWithZone:function (pZone) {

    }


});

/** creates the action */
cc.EaseExponentialIn.actionWithAction = function (pAction) {
    var pRet = new cc.EaseExponentialIn();
    if (pRet) {
        pRet.initWithAction(pAction);

    }
    return pRet;
};
/**
 @brief Ease Exponential Out
 */
cc.EaseExponentialOut = cc.ActionEase.extend({

    update:function (time1) {
        this._m_pOther.update(time1 == 1 ? 1 : (-(Math.pow(2, -10 * time1 / 1)) + 1));
    },

    reverse:function () {
        return cc.EaseExponentialIn.actionWithAction(this._m_pOther.reverse());
    },

    copyWithZone:function (pZone) {

    }



});

/** creates the action */
cc.EaseExponentialOut.actionWithAction = function (pAction) {
    var pRet = new cc.EaseExponentialOut();
    if (pRet) {
        pRet.initWithAction(pAction);

    }
    return pRet;
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

        this._m_pOther.update(time1);

    },
    copyWithZone:function (pZone) {

    }

});


/** creates the action */
cc.EaseExponentialInOut.actionWithAction = function (pAction) {
    var pRet = new cc.EaseExponentialInOut();
    if (pRet) {
        pRet.initWithAction(pAction);

    }
    return pRet;
};


/**
 @brief Ease Sine In
 */
cc.EaseSineIn = cc.ActionEase.extend({

    update:function (time1) {
        this._m_pOther.update(-1 * Math.cos(time1 * Math.PI / 2) + 1);
    },

    reverse:function () {
        return cc.EaseSineOut.actionWithAction(this._m_pOther.reverse());
    },

    copyWithZone:function (pZone) {

    }
});

/** creates the action */
cc.EaseSineIn.actionWithAction = function (pAction) {
    var pRet = new cc.EaseSineIn();
    if (pRet) {
        pRet.initWithAction(pAction);

    }
    return pRet;
};
/**
 @brief Ease Sine Out
 */
cc.EaseSineOut = cc.ActionEase.extend({

    update:function (time1) {
        this._m_pOther.update(Math.sin(time1 * Math.PI / 2));
    },

    reverse:function () {
        return cc.EaseSineIn.actionWithAction(this._m_pOther.reverse());
    },

    copyWithZone:function (pZone) {

    }
});


/** creates the action */
cc.EaseSineOut.actionWithAction = function (pAction) {
    var pRet = new cc.EaseSineOut();
    if (pRet) {
        pRet.initWithAction(pAction);

    }
    return pRet;
};


/**
 @brief Ease Sine InOut
 */
cc.EaseSineInOut = cc.ActionEase.extend({

    update:function (time1) {
        this._m_pOther.update(-0.5 * (Math.cos(Math.PI * time1) - 1));

    },

    copyWithZone:function (pZone) {

    }

});

/** creates the action */
cc.EaseSineInOut.actionWithAction = function (pAction) {
    var pRet = new cc.EaseSineInOut();
    if (pRet) {
        pRet.initWithAction(pAction);

    }
    return pRet;
};
//noinspection JSDuplicatedDeclaration
/**
 @brief Ease Elastic abstract class
 @since v0.8.2
 */
cc.EaseElastic = cc.ActionEase.extend({

    /** get period of the wave in radians. default is 0.3 */
    getPeriod:function () {
        return this._m_fPeriod;
    },
    /** set period of the wave in radians. */
    setPeriod:function (fPeriod) {
        this._m_fPeriod = fPeriod;
    },

    /** Initializes the action with the inner action and the period in radians (default is 0.3) */
    initWithAction:function (pAction, fPeriod) {
        this._super(pAction);
        this._m_fPeriod = (fPeriod == null) ? 3.0 : fPeriod;
        return true;
    },

    reverse:function () {
        cc.Assert(0, "");

        return null;
    },

    copyWithZone:function (pZone) {

    },

    _m_fPeriod:null
});

/** Creates the action with the inner action and the period in radians (default is 0.3) */
cc.EaseElastic.actionWithAction = function (pAction, fPeriod) {
    var pRet = new cc.EaseElastic();
    if (pRet) {
        if (fPeriod == null) {
            pRet.initWithAction(pAction);
        } else {
            pRet.initWithAction(pAction, fPeriod);
        }

    }
    return pRet;
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
            var s = this._m_fPeriod / 4;
            time1 = time1 - 1;
            newT = -Math.pow(2, 10 * time1) * Math.sin((time1 - s) * Math.PI * 2 / this._m_fPeriod);
        }

        this._m_pOther.update(newT);
    },

    reverse:function () {
        return cc.EaseElasticOut.actionWithAction(this._m_pOther.reverse(), this._m_fPeriod);
    },

    copyWithZone:function (pZone) {

    }


});


/** Creates the action with the inner action and the period in radians (default is 0.3) */
cc.EaseElasticIn.actionWithAction = function (pAction, fPeriod) {
    var pRet = new cc.EaseElasticIn();
    if (pRet) {
        if (fPeriod == null) {
            pRet.initWithAction(pAction);
        } else {
            pRet.initWithAction(pAction, fPeriod);
        }

    }
    return pRet;
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
            var s = this._m_fPeriod / 4;
            newT = Math.pow(2, -10 * time1) * Math.sin((time1 - s) * Math.PI  * 2 / this._m_fPeriod) + 1;
        }

        this._m_pOther.update(newT);

    },

    reverse:function () {
        return cc.EaseElasticIn.actionWithAction(this._m_pOther.reverse(), this._m_fPeriod);
    },

    copyWithZone:function (pZone) {

    }


});


/** Creates the action with the inner action and the period in radians (default is 0.3) */
cc.EaseElasticOut.actionWithAction = function (pAction, fPeriod) {
    var pRet = new cc.EaseElasticOut();
    if (pRet) {
        if (fPeriod == null) {
            pRet.initWithAction(pAction);
        } else {
            pRet.initWithAction(pAction, fPeriod);
        }

    }
    return pRet;
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
            if (!this._m_fPeriod) {
                this._m_fPeriod = 0.3 * 1.5;
            }

            var s = this._m_fPeriod / 4;

            time1 = time1 - 1;
            if (time1 < 0) {
                newT = -0.5 * Math.pow(2, 10 * time1) * Math.sin((time1 - s) * Math.PI * 2 / this._m_fPeriod);
            } else {
                newT = Math.pow(2, -10 * time1) * Math.sin((time1 - s) * Math.PI * 2 / this._m_fPeriod) * 0.5 + 1;
            }
        }

        this._m_pOther.update(newT);

    },
    reverse:function () {
        return cc.EaseInOut.actionWithAction(this._m_pOther.reverse(), this._m_fPeriod);
    },

    copyWithZone:function (pZone) {

    }

});

/** Creates the action with the inner action and the period in radians (default is 0.3) */
cc.EaseElasticInOut.actionWithAction = function (pAction, fPeriod) {
    var pRet = new cc.EaseElasticInOut();
    if (pRet) {
        if (fPeriod == null) {
            pRet.initWithAction(pAction);
        } else {
            pRet.initWithAction(pAction, fPeriod);
        }

    }
    return pRet;
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

    copyWithZone:function (pZone) {

    }


});

/** creates the action */
cc.EaseBounce.actionWithAction = function (pAction) {
    var pRet = new cc.EaseBounce();
    if (pRet) {
        pRet.initWithAction(pAction);
    }
    return pRet;
};

/**
 @brief CCEaseBounceIn action.
 @warning This action doesn't use a bijective function. Actions like Sequence might have an unexpected result when used with this action.
 @since v0.8.2
 */
cc.EaseBounceIn = cc.EaseBounce.extend({

    update:function (time1) {
        var newT = 1 - this.bounceTime(1 - time1);
        this._m_pOther.update(newT);
    },
    reverse:function () {
        return cc.EaseBounceOut.actionWithAction(this._m_pOther.reverse());
    },
    copyWithZone:function (pZone) {

    }


});

/** creates the action */
cc.EaseBounceIn.actionWithAction = function (pAction) {
    var pRet = new cc.EaseBounceIn();
    if (pRet) {
        pRet.initWithAction(pAction);
    }
    return pRet;
};
/**
 @brief EaseBounceOut action.
 @warning This action doesn't use a bijective fucntion. Actions like Sequence might have an unexpected result when used with this action.
 @since v0.8.2
 */
cc.EaseBounceOut = cc.EaseBounce.extend({


    update:function (time1) {
        var newT = this.bounceTime(time1);
        this._m_pOther.update(newT);
    },
    reverse:function () {
        return cc.EaseBounceIn.actionWithAction(this._m_pOther.reverse());
    },
    copyWithZone:function (pZone) {

    }


});

/** creates the action */
cc.EaseBounceOut.actionWithAction = function (pAction) {
    var pRet = new cc.EaseBounceOut();
    if (pRet) {
        pRet.initWithAction(pAction);
    }
    return pRet;
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

        this._m_pOther.update(newT);

    },
    copyWithZone:function (pZone) {

    }

});

/** creates the action */
cc.EaseBounceInOut.actionWithAction = function (pAction) {
    var pRet = new cc.EaseBounceInOut();
    if (pRet) {
        pRet.initWithAction(pAction);
    }
    return pRet;
};

/**
 @brief CCEaseBackIn action.
 @warning This action doesn't use a bijective fucntion. Actions like Sequence might have an unexpected result when used with this action.
 @since v0.8.2
 */
cc.EaseBackIn = cc.ActionEase.extend({


    update:function (time1) {
        var overshoot = 1.70158;
        this._m_pOther.update(time1 * time1 * ((overshoot + 1) * time1 - overshoot));

    },
    reverse:function () {
        return cc.EaseBackOut.actionWithAction(this._m_pOther.reverse());

    },
    copyWithZone:function (pZone) {

    }

});


/** creates the action */
cc.EaseBackIn.actionWithAction = function (pAction) {
    var pRet = new cc.EaseBackIn();
    if (pRet) {
        pRet.initWithAction(pAction);
    }
    return pRet;
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
        this._m_pOther.update(time1 * time1 * ((overshoot + 1) * time1 + overshoot) + 1);
    },
    reverse:function () {
        return cc.EaseBackIn.actionWithAction(this._m_pOther.reverse());
    },
    copyWithZone:function (pZone) {

    }
});

/** creates the action */
cc.EaseBackOut.actionWithAction = function (pAction) {
    var pRet = new cc.EaseBackOut();
    if (pRet) {
        pRet.initWithAction(pAction);
    }
    return pRet;
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
            this._m_pOther.update((time1 * time1 * ((overshoot + 1) * time1 - overshoot)) / 2);
        } else {
            time1 = time1 - 2;
            this._m_pOther.update((time1 * time1 * ((overshoot + 1) * time1 + overshoot)) / 2 + 1);
        }
    },
    copyWithZone:function (pZone) {

    }

});


/** creates the action */
cc.EaseBackInOut.actionWithAction = function (pAction) {
    var pRet = new cc.EaseBackInOut();
    if (pRet) {
        pRet.initWithAction(pAction);
    }
    return pRet;
};

