/****************************************************************************
 Copyright (c) 2010-2012 cocos2d-x.org
 Copyright (C) 2010      Lam Pham

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
 @brief Progress to percentage
 @since v0.99.1
 */
cc.ProgressTo = cc.ActionInterval.extend({
    _to:0,
    _from:0,
    /** Initializes with a duration and a percent */
    initWithDuration:function (duration, percent) {
        if (this._super(duration)) {
            this._to = percent;
            return true;
        }
        return false;
    },
    copyWithZone:function (zone) {
        var newZone = null;
        var copy = null;
        if (zone && zone._copyObject) {
            //in case of being called at sub class
            copy = zone._copyObject;
        } else {
            copy = new cc.ProgressTo();
            zone = newZone = new cc.Zone(copy);
        }

        this._super(zone);

        copy.initWithDuration(this._duration, this._to);

        return copy;
    },
    startWithTarget:function (target) {
        this._super(target);
        this._from = target.getPercentage();

        // XXX: Is this correct ?
        // Adding it to support CCRepeat
        if (this._from == 100) {
            this._from = 0;
        }
    },
    update:function (time) {
        if (this._target  instanceof cc.ProgressTimer) {
            this._target.setPercentage(this._from + (this._to - this._from) * time);
        }
    }
});

/** Creates and initializes with a duration and a percent */
cc.ProgressTo.actionWithDuration = function (duration, percent) {
    var progressTo = new cc.ProgressTo();
    progressTo.initWithDuration(duration, percent);

    return progressTo;
};

/**
 @brief Progress from a percentage to another percentage
 @since v0.99.1
 */
cc.ProgressFromTo = cc.ActionInterval.extend({
    _to:0,
    _from:0,
    /** Initializes the action with a duration, a "from" percentage and a "to" percentage */
    initWithDuration:function (duration, fromPercentage, toPercentage) {
        if (this._super(duration)) {
            this._to = toPercentage;
            this._from = fromPercentage;
            return true;
        }
        return false;
    },
    copyWithZone:function (zone) {
        var newZone = null;
        var copy = null;
        if (zone && zone._copyObject) {
            //in case of being called at sub class
            copy = zone._copyObject;
        } else {
            copy = new cc.ProgressFromTo();
            zone = newZone = new cc.Zone(copy);
        }

        this._super(zone);
        copy.initWithDuration(this._duration, this._from, this._to);
        return copy;
    },
    reverse:function () {
        return cc.ProgressFromTo.actionWithDuration(this._duration, this._to, this._from);
    },
    startWithTarget:function (target) {
        this._super(target);
    },
    update:function (time) {
        if (this._target  instanceof cc.ProgressTimer) {
            this._target.setPercentage(this._from + (this._to - this._from) * time);
        }
    }
});

/** Creates and initializes the action with a duration, a "from" percentage and a "to" percentage */
cc.ProgressFromTo.actionWithDuration = function (duration, fromPercentage, toPercentage) {
    var progressFromTo = new cc.ProgressFromTo();
    progressFromTo.initWithDuration(duration, fromPercentage, toPercentage);
    return progressFromTo;
};
