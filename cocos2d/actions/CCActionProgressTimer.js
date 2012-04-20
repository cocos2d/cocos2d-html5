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
    _m_fTo:0,
    _m_fFrom:0,
    /** Initializes with a duration and a percent */
    initWithDuration:function (duration, fPercent) {
        if (this._super(duration)) {
            this._m_fTo = fPercent;
            return true;
        }
        return false;
    },
    copyWithZone:function (pZone) {
        var pNewZone = null;
        var pCopy = null;
        if (pZone && pZone._m_pCopyObject) {
            //in case of being called at sub class
            pCopy = pZone._m_pCopyObject;
        } else {
            pCopy = new cc.ProgressTo();
            pZone = pNewZone = new cc.Zone(pCopy);
        }

        this._super(pZone);

        pCopy.initWithDuration(this._m_fDuration, this._m_fTo);

        return pCopy;
    },
    startWithTarget:function (pTarget) {
        this._super(pTarget);
        this._m_fFrom = pTarget.getPercentage();

        // XXX: Is this correct ?
        // Adding it to support CCRepeat
        if (this._m_fFrom == 100) {
            this._m_fFrom = 0;
        }
    },
    update:function (time) {
        if (this._m_pTarget  instanceof cc.ProgressTimer) {
            this._m_pTarget.setPercentage(this._m_fFrom + (this._m_fTo - this._m_fFrom) * time);
        }
    }
});

/** Creates and initializes with a duration and a percent */
cc.ProgressTo.actionWithDuration = function (duration, fPercent) {
    var pProgressTo = new cc.ProgressTo();
    pProgressTo.initWithDuration(duration, fPercent);

    return pProgressTo;
};

/**
 @brief Progress from a percentage to another percentage
 @since v0.99.1
 */
cc.ProgressFromTo = cc.ActionInterval.extend({
    _m_fTo:0,
    _m_fFrom:0,
    /** Initializes the action with a duration, a "from" percentage and a "to" percentage */
    initWithDuration:function (duration, fFromPercentage, fToPercentage) {
        if (this._super(duration)) {
            this._m_fTo = fToPercentage;
            this._m_fFrom = fFromPercentage;
            return true;
        }
        return false;
    },
    copyWithZone:function (pZone) {
        var pNewZone = null;
        var pCopy = null;
        if (pZone && pZone._m_pCopyObject) {
            //in case of being called at sub class
            pCopy = pZone._m_pCopyObject;
        } else {
            pCopy = new cc.ProgressFromTo();
            pZone = pNewZone = new cc.Zone(pCopy);
        }

        this._super(pZone);
        pCopy.initWithDuration(this._m_fDuration, this._m_fFrom, this._m_fTo);
        return pCopy;
    },
    reverse:function () {
        return cc.ProgressFromTo.actionWithDuration(this._m_fDuration, this._m_fTo, this._m_fFrom);
    },
    startWithTarget:function (pTarget) {
        this._super(pTarget);
    },
    update:function (time) {
        if (this._m_pTarget  instanceof cc.ProgressTimer) {
            this._m_pTarget.setPercentage(this._m_fFrom + (this._m_fTo - this._m_fFrom) * time);
        }
    }
});

/** Creates and initializes the action with a duration, a "from" percentage and a "to" percentage */
cc.ProgressFromTo.actionWithDuration = function (duration, fFromPercentage, fToPercentage) {
    var pProgressFromTo = new cc.ProgressFromTo();
    pProgressFromTo.initWithDuration(duration, fFromPercentage, fToPercentage);
    return pProgressFromTo;
};
