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
 @brief cc.Waves3D action
 */
cc.Waves3D = cc.Grid3DAction.extend({
    _m_nWaves:null,
    _m_fAmplitude:null,
    _m_fAmplitudeRate:null,
    getAmplitude:function () {
        return this._m_fAmplitude;
    },
    setAmplitude:function (fAmplitude) {
        this._m_fAmplitude = fAmplitude;
    },

    getAmplitudeRate:function () {
        return this._m_fAmplitudeRate;
    },
    setAmplitudeRate:function (fAmplitudeRate) {
        this._m_fAmplitudeRate = fAmplitudeRate;
    },

    /** init the action */
    initWithWaves:function (wav, amp, gridSize, duration) {
        if (cc.Grid3DAction.initWithSize(gridSize, duration)) {
            this._m_nWaves = wav;
            this._m_fAmplitude = amp;
            this._m_fAmplitudeRate = 1.0;

            return true;
        }

        return false;
    },

    copyWithZone:function (pZone) {
        var pNewZone = null;
        var pCopy = null;
        if (pZone && pZone.m_pCopyObject) {
            //in case of being called at sub class
            pCopy = pZone.m_pCopyObject;
        }
        else {
            pCopy = new cc.Waves3D();
            pZone = pNewZone = new cc.Zone(pCopy);
        }

        cc.Grid3DAction.copyWithZone(pZone);


        pCopy.initWithWaves(this._m_nWaves, this._m_fAmplitude, this._m_sGridSize, this.m_fDuration);

        return pCopy;
    },
    update:function (time) {
        var i, j;
        for (i = 0; i < this._m_sGridSize.x + 1; ++i) {
            for (j = 0; j < this._m_sGridSize.y + 1; ++j) {
                var v = this.originalVertex(cc.ccg(i, j));
                v.z += (Math.sin(Math.PI * time * this._m_nWaves * 2 + (v.y + v.x) * .01) * this._m_fAmplitude * this._m_fAmplitudeRate);
                cc.Log("v.z offset is" + (Math.sin(Math.PI * time * this._m_nWaves * 2 + (v.y + v.x) * .01) * this._m_fAmplitude * this._m_fAmplitudeRate));
                this.setVertex(cc.ccg(i, j), v);
            }
        }
    }
});

/** create the action */
cc.Waves3D.actionWithWaves = function (wav, amp, gridSize, duration) {
    var pAction = new cc.Waves3D();
    return pAction;
};

/** @brief cc.FlipX3D action */
cc.FlipX3D = cc.Grid3DAction({
    /** initializes the action with duration */
    initWithDuration:function (duration) {
        return cc.Grid3DAction.initWithSize(cc.ccg(1, 1), duration);
    },
    initWithSize:function (gridSize, duration) {
        if (gridSize.x != 1 || gridSize.y != 1) {
            // Grid size must be (1,1)
            cc.Assert(0, "");

            return false;
        }

        return cc.Grid3DAction.initWithSize(gridSize, duration);
    },
    copyWithZone:function (pZone) {
        var pNewZone = null;
        var pCopy = null;
        if (pZone && pZone.m_pCopyObject) {
            //in case of being called at sub class
            pCopy = pZone.m_pCopyObject;
        }
        else {
            pCopy = new cc.FlipX3D();
            pZone = pNewZone = new cc.Zone(pCopy);
        }

        cc.Grid3DAction.copyWithZone(pZone);

        pCopy.initWithSize(this._m_sGridSize, this.m_fDuration);

        return pCopy;
    },
    update:function (time) {
        var angle = Math.PI * time; // 180 degrees
        var mz = Math.sin(angle);
        angle = angle / 2.0; // x calculates degrees from 0 to 90
        var mx = Math.cos(angle);

        var v0, v1, v, diff;

        v0 = this.originalVertex(cc.ccg(1, 1));
        v1 = this.originalVertex(cc.ccg(0, 0));

        var x0 = v0.x;
        var x1 = v1.x;
        var x;
        var a, b, c, d;

        if (x0 > x1) {
            // Normal Grid
            a = cc.ccg(0, 0);
            b = cc.ccg(0, 1);
            c = cc.ccg(1, 0);
            d = cc.ccg(1, 1);
            x = x0;
        }
        else {
            // Reversed Grid
            c = cc.ccg(0, 0);
            d = cc.ccg(0, 1);
            a = cc.ccg(1, 0);
            b = cc.ccg(1, 1);
            x = x1;
        }

        diff.x = ( x - x * mx );
        diff.z = Math.abs(parseFloat((x * mz) / 4.0));

        // bottom-left
        v = this.originalVertex(a);
        v.x = diff.x;
        v.z += diff.z;
        this.setVertex(a, v);

        // upper-left
        v = this.originalVertex(b);
        v.x = diff.x;
        v.z += diff.z;
        this.setVertex(b, v);

        // bottom-right
        v = this.originalVertex(c);
        v.x -= diff.x;
        v.z -= diff.z;
        this.setVertex(c, v);

        // upper-right
        v = this.originalVertex(d);
        v.x -= diff.x;
        v.z -= diff.z;
        this.setVertex(d, v);
    }

});

/** creates the action with duration */
cc.FlipX3D.actionWithDuration = function (duration) {
    var pAction = new cc.FlipX3D();
    return pAction;
};

/** @brief cc.FlipY3D action */
cc.FlipY3D = cc.FlipX3D.extend({
    update:function (time) {
        var angle = Math.PI * time; // 180 degrees
        var mz = Math.sin(angle);
        angle = angle / 2.0;     // x calculates degrees from 0 to 90
        var my = Math.cos(angle);

        var v0, v1, v, diff;

        v0 = this.originalVertex(cc.ccg(1, 1));
        v1 = this.originalVertex(cc.ccg(0, 0));

        var y0 = v0.y;
        var y1 = v1.y;
        var y;
        var a, b, c, d;

        if (y0 > y1) {
            // Normal Grid
            a = cc.ccg(0, 0);
            b = cc.ccg(0, 1);
            c = cc.ccg(1, 0);
            d = cc.ccg(1, 1);
            y = y0;
        }
        else {
            // Reversed Grid
            b = cc.ccg(0, 0);
            a = cc.ccg(0, 1);
            d = cc.ccg(1, 0);
            c = cc.ccg(1, 1);
            y = y1;
        }

        diff.y = y - y * my;
        diff.z = Math.abs(parseFloat(y * mz) / 4.0);

        // bottom-left
        v = this.originalVertex(a);
        v.y = diff.y;
        v.z += diff.z;
        this.setVertex(a, v);

        // upper-left
        v = this.originalVertex(b);
        v.y -= diff.y;
        v.z -= diff.z;
        this.setVertex(b, v);

        // bottom-right
        v = this.originalVertex(c);
        v.y = diff.y;
        v.z += diff.z;
        this.setVertex(c, v);

        // upper-right
        v = this.originalVertex(d);
        v.y -= diff.y;
        v.z -= diff.z;
        this.setVertex(d, v);
    },
    copyWithZone:function (pZone) {
        var pNewZone = null;
        var pCopy = null;
        if (pZone && pZone.m_pCopyObject) {
            //in case of being called at sub class
            pCopy = pZone.m_pCopyObject;
        }
        else {
            pCopy = new cc.FlipY3D();
            pZone = pNewZone = new cc.Zone(pCopy);
        }

        cc.FlipX3D.copyWithZone(pZone);

        pCopy.initWithSize(this._m_sGridSize, this.m_fDuration);

        return pCopy;
    }
});

/** creates the action with duration */
cc.FlipY3D.actionWithDuration = function (duration) {
    var pAction = new cc.FlipY3D();
    return pAction;
};

/** @brief cc.Lens3D action */
cc.Lens3D = cc.Grid3DAction.extend({
    /* lens center position */
    _m_position:null,
    _m_fRadius:null,
    /** lens effect. Defaults to 0.7 - 0 means no effect, 1 is very strong effect */
    _m_fLensEffect:null,

    /* @since v0.99.5 */
// cc.Point this.m_lastPosition;
    _m_positionInPixels:null,
    _m_bDirty:null,
    /** Get lens center position */
    getLensEffect:function () {
        return this._m_fLensEffect;
    },
    /** Set lens center position */
    setLensEffect:function (fLensEffect) {
        this._m_fLensEffect = fLensEffect;
    },

    getPosition:function () {
        return this._m_position;
    },
    setPosition:function (pos) {
        if (!cc.Point.CCPointEqualToPoint(pos, this._m_position)) {
            this._m_position = pos;
            this._m_positionInPixels.x = pos.x * cc.CONTENT_SCALE_FACTOR();
            this._m_positionInPixels.y = pos.y * cc.CONTENT_SCALE_FACTOR();

            this._m_bDirty = true;
        }
    },

    /** initializes the action with center position, radius, a grid size and duration */
    initWithPosition:function (pos, r, gridSize, duration) {
        if (cc.Grid3DAction.initWithSize(gridSize, duration)) {
            this._m_position = cc.ccp(-1, -1);
            this.setPosition(pos);
            this._m_fRadius = r;
            this._m_fLensEffect = 0.7;
            this._m_bDirty = true;

            return true;
        }

        return false;
    },
    copyWithZone:function (pZone) {
        var pNewZone = null;
        var pCopy = null;
        if (pZone && pZone.m_pCopyObject) {
            //in case of being called at sub class
            pCopy = pZone.m_pCopyObject;
        }
        else {
            pCopy = new cc.Lens3D();
            pZone = pNewZone = new cc.Zone(pCopy);
        }

        cc.Grid3DAction.copyWithZone(pZone);

        pCopy.initWithPosition(this._m_position, this._m_fRadius, this._m_sGridSize, this.m_fDuration);

        return pCopy;
    },
    update:function (time) {
        if (this._m_bDirty) {
            var i, j;

            for (i = 0; i < this._m_sGridSize.x + 1; ++i) {
                for (j = 0; j < this._m_sGridSize.y + 1; ++j) {
                    var v = this.originalVertex(cc.ccg(i, j));
                    var vect = cc.ccpSub(this._m_positionInPixels, ccp(v.x, v.y));
                    var r = cc.ccpLength(vect);

                    if (r < this._m_fRadius) {
                        r = this._m_fRadius - r;
                        var pre_log = r / this._m_fRadius;
                        if (pre_log == 0) {
                            pre_log = 0.001;
                        }

                        var l = Math.log(pre_log) * this._m_fLensEffect;
                        var new_r = Math.exp(l) * this._m_fRadius;

                        if (cc.ccpLength(vect) > 0) {
                            vect = cc.ccpNormalize(vect);
                            var new_vect = cc.ccpMult(vect, new_r);
                            v.z += cc.ccpLength(new_vect) * this._m_fLensEffect;
                        }
                    }

                    this.setVertex(cc.ccg(i, j), v);
                }
            }

            this._m_bDirty = false;
        }
    }
});

/** creates the action with center position, radius, a grid size and duration */
cc.Lens3D.actionWithPosition = function (pos, r, gridSize, duration) {
    var pAction = new cc.Lens3D();
    return pAction;
};

/** @brief cc.Ripple3D action */
cc.Ripple3D = cc.Grid3DAction.extend({
    /* center position */
    _m_position:null,
    _m_fRadius:null,
    _m_nWaves:null,
    _m_fAmplitude:null,
    _m_fAmplitudeRate:null,

    /*@since v0.99.5*/
    _m_positionInPixels:null,
    /** get center position */
    getPosition:function () {
        return this._m_position;
    },
    /** set center position */
    setPosition:function (position) {
        this._m_position = position;
        this._m_positionInPixels.x = position.x * cc.CONTENT_SCALE_FACTOR();
        this._m_positionInPixels.y = position.y * cc.CONTENT_SCALE_FACTOR();
    },

    getAmplitude:function () {
        return this._m_fAmplitude;
    },
    setAmplitude:function (fAmplitude) {
        this._m_fAmplitude = fAmplitude;
    },

    getAmplitudeRate:function () {
        return this._m_fAmplitudeRate;
    },
    setAmplitudeRate:function (fAmplitudeRate) {
        this._m_fAmplitudeRate = fAmplitudeRate;
    },

    /** initializes the action with radius, number of waves, amplitude, a grid size and duration */
    initWithPosition:function (pos, r, wav, amp, gridSize, duration) {
        if (cc.Grid3DAction.initWithSize(gridSize, duration)) {
            this.setPosition(pos);
            this._m_fRadius = r;
            this._m_nWaves = wav;
            this._m_fAmplitude = amp;
            this._m_fAmplitudeRate = 1.0;

            return true;
        }

        return false;
    },
    copyWithZone:function (pZone) {
        var pNewZone = null;
        var pCopy = null;
        if (pZone && pZone.m_pCopyObject) {
            //in case of being called at sub class
            pCopy = pZone.m_pCopyObject;
        }
        else {
            pCopy = new cc.Ripple3D();
            pZone = pNewZone = new cc.Zone(pCopy);
        }

        cc.Grid3DAction.copyWithZone(pZone);

        pCopy.initWithPosition(this._m_position, this._m_fRadius, this._m_nWaves, this._m_fAmplitude, this._m_sGridSize, this.m_fDuration);

        return pCopy;
    },
    update:function (time) {
        var i, j;

        for (i = 0; i < (this._m_sGridSize.x + 1); ++i) {
            for (j = 0; j < (this._m_sGridSize.y + 1); ++j) {
                var v = this.originalVertex(cc.ccg(i, j));
                var vect = cc.ccpSub(this._m_positionInPixels, ccp(v.x, v.y));
                var r = cc.ccpLength(vect);

                if (r < this._m_fRadius) {
                    r = this._m_fRadius - r;
                    var rate = Math.pow(r / this._m_fRadius, 2);
                    v.z += (Math.sin(time * Math.PI * this._m_nWaves * 2 + r * 0.1) * this._m_fAmplitude * this._m_fAmplitudeRate * rate);
                }

                this.setVertex(cc.ccg(i, j), v);
            }
        }
    }
});
/** creates the action with radius, number of waves, amplitude, a grid size and duration */
cc.Ripple3D.actionWithPosition = function (pos, r, wav, amp, gridSize, duration) {
    var pAction = new cc.Ripple3D();
    return pAction;
};


/** @brief cc.Shaky3D action */
cc.Shaky3D = cc.Grid3DAction.extend({
    _m_nRandrange:null,
    _m_bShakeZ:null,
    /** initializes the action with a range, shake Z vertices, a grid and duration */
    initWithRange:function (range, shakeZ, gridSize, duration) {
        if (cc.Grid3DAction.initWithSize(gridSize, duration)) {
            this._m_nRandrange = range;
            this._m_bShakeZ = shakeZ;

            return true;
        }

        return false;
    },
    copyWithZone:function (pZone) {
        var pNewZone = null;
        var pCopy = null;
        if (pZone && pZone.m_pCopyObject) {
            //in case of being called at sub class
            pCopy = pZone.m_pCopyObject;
        }
        else {
            pCopy = new cc.Shaky3D();
            pZone = pNewZone = new cc.Zone(pCopy);
        }

        cc.Grid3DAction.copyWithZone(pZone);

        pCopy.initWithRange(this._m_nRandrange, this._m_bShakeZ, this._m_sGridSize, this.m_fDuration);

        return pCopy;
    },
    update:function (time) {
        var i, j;

        for (i = 0; i < (this._m_sGridSize.x + 1); ++i) {
            for (j = 0; j < (this._m_sGridSize.y + 1); ++j) {
                var v = this.originalVertex(cc.ccg(i, j));
                v.x += (Math.random() % (this._m_nRandrange * 2)) - this._m_nRandrange;
                v.y += (Math.random() % (this._m_nRandrange * 2)) - this._m_nRandrange;
                if (this._m_bShakeZ) {
                    v.z += (Math.random() % (this._m_nRandrange * 2)) - this._m_nRandrange;
                }

                this.setVertex(cc.ccg(i, j), v);
            }
        }
    }
});

/** creates the action with a range, shake Z vertices, a grid and duration */
cc.Shaky3D.actionWithRange = function (range, shakeZ, gridSize, duration) {
    var pAction = new cc.Shaky3D();
    return pAction;
};

/** @brief cc.Liquid action */
cc.Liquid = cc.Grid3DAction.extend({
    _m_nWaves:null,
    _m_fAmplitude:null,
    _m_fAmplitudeRate:null,
    getAmplitude:function () {
        return this._m_fAmplitude;
    },
    setAmplitude:function (fAmplitude) {
        this._m_fAmplitude = fAmplitude;
    },

    getAmplitudeRate:function () {
        return this._m_fAmplitudeRate;
    },
    setAmplitudeRate:function (fAmplitudeRate) {
        this._m_fAmplitudeRate = fAmplitudeRate;
    },

    /** initializes the action with amplitude, a grid and duration */
    initWithWaves:function (wav, amp, gridSize, duration) {
        if (cc.Grid3DAction.initWithSize(gridSize, duration)) {
            this._m_nWaves = wav;
            this._m_fAmplitude = amp;
            this._m_fAmplitudeRate = 1.0;

            return true;
        }

        return false;
    },
    copyWithZone:function (pZone) {
        var pNewZone = null;
        var pCopy = null;
        if (pZone && pZone.m_pCopyObject) {
            //in case of being called at sub class
            pCopy = pZone.m_pCopyObject;
        }
        else {
            pCopy = new cc.Liquid();
            pZone = pNewZone = new cc.Zone(pCopy);
        }

        cc.Grid3DAction.copyWithZone(pZone);

        pCopy.initWithWaves(this._m_nWaves, this._m_fAmplitude, this._m_sGridSize, this.m_fDuration);

        return pCopy;
    },
    update:function (time) {
        var i, j;

        for (i = 1; i < this._m_sGridSize.x; ++i) {
            for (j = 1; j < this._m_sGridSize.y; ++j) {
                var v = this.originalVertex(cc.ccg(i, j));
                v.x = (v.x + (Math.sin(time * Math.PI * this._m_nWaves * 2 + v.x * .01) * this._m_fAmplitude * this._m_fAmplitudeRate));
                v.y = (v.y + (Math.sin(time * Math.PI * this._m_nWaves * 2 + v.y * .01) * this._m_fAmplitude * this._m_fAmplitudeRate));
                this.setVertex(cc.ccg(i, j), v);
            }
        }
    }
});

/** creates the action with amplitude, a grid and duration */
cc.Liquid.actionWithWaves = function (wav, amp, gridSize, duration) {
    var pAction = new cc.Liquid();
    return pAction;
};

/** @brief cc.Waves action */
cc.Waves = cc.Grid3DAction.extend({
    _m_nWaves:null,
    _m_fAmplitude:null,
    _m_fAmplitudeRate:null,
    _m_bVertical:null,
    _m_bHorizontal:null,
    getAmplitude:function () {
        return this._m_fAmplitude;
    },
    setAmplitude:function (fAmplitude) {
        this._m_fAmplitude = fAmplitude;
    },

    getAmplitudeRate:function () {
        return this._m_fAmplitudeRate;
    },
    setAmplitudeRate:function (fAmplitudeRate) {
        this._m_fAmplitudeRate = fAmplitudeRate;
    },

    /** initializes the action with amplitude, horizontal sin, vertical sin, a grid and duration */
    initWithWaves:function (wav, amp, h, v, gridSize, duration) {
        if (cc.Grid3DAction.initWithSize(gridSize, duration)) {
            this._m_nWaves = wav;
            this._m_fAmplitude = amp;
            this._m_fAmplitudeRate = 1.0;
            this._m_bHorizontal = h;
            this._m_bVertical = v;

            return true;
        }

        return false;
    },
    copyWithZone:function (pZone) {
        var pNewZone = null;
        var pCopy = null;
        if (pZone && pZone.m_pCopyObject) {
            //in case of being called at sub class
            pCopy = pZone.m_pCopyObject;
        }
        else {
            pCopy = new cc.Waves();
            pZone = pNewZone = new cc.Zone(pCopy);
        }

        cc.Grid3DAction.copyWithZone(pZone);

        pCopy.initWithWaves(this._m_nWaves, this._m_fAmplitude, this._m_bHorizontal, this._m_bVertical, this._m_sGridSize, this.m_fDuration);

        return pCopy;
    },
    update:function (time) {
        var i, j;

        for (i = 0; i < this._m_sGridSize.x + 1; ++i) {
            for (j = 0; j < this._m_sGridSize.y + 1; ++j) {
                var v = this.originalVertex(cc.ccg(i, j));

                if (this._m_bVertical) {
                    v.x = (v.x + (Math.sin(time * Math.PI * this._m_nWaves * 2 + v.y * .01) * this._m_fAmplitude * this._m_fAmplitudeRate));
                }

                if (this._m_bHorizontal) {
                    v.y = (v.y + (Math.sin(time * Math.PI * this._m_nWaves * 2 + v.x * .01) * this._m_fAmplitude * this._m_fAmplitudeRate));
                }

                this.setVertex(cc.ccg(i, j), v);
            }
        }
    }
});

/** initializes the action with amplitude, horizontal sin, vertical sin, a grid and duration */
cc.Waves.actionWithWaves = function (wav, amp, h, v, gridSize, duration) {
    var pAction = new cc.Waves();
    return pAction;
};

/** @brief cc.Twirl action */
cc.Twirl = cc.Grid3DAction.extend({
    /* twirl center */
    _m_position:null,
    _m_nTwirls:null,
    _m_fAmplitude:null,
    _m_fAmplitudeRate:null,
    /*@since v0.99.5 */
    _m_positionInPixels:null,
    /** get twirl center */
    getPosition:function () {
        return this._m_position;
    },
    /** set twirl center */
    setPosition:function (position) {
        this._m_position = position;
        this._m_positionInPixels.x = position.x * cc.CONTENT_SCALE_FACTOR();
        this._m_positionInPixels.y = position.y * cc.CONTENT_SCALE_FACTOR();
    },

    getAmplitude:function () {
        return this._m_fAmplitude;
    },
    setAmplitude:function (fAmplitude) {
        this._m_fAmplitude = fAmplitude;
    },

    getAmplitudeRate:function () {
        return this._m_fAmplitudeRate;
    },
    setAmplitudeRate:function (fAmplitudeRate) {
        this._m_fAmplitudeRate = fAmplitudeRate;
    },

    /** initializes the action with center position, number of twirls, amplitude, a grid size and duration */
    initWithPosition:function (pos, t, amp, gridSize, duration) {
        if (cc.Grid3DAction.initWithSize(gridSize, duration)) {
            this.setPosition(pos);
            this._m_nTwirls = t;
            this._m_fAmplitude = amp;
            this._m_fAmplitudeRate = 1.0;

            return true;
        }

        return false;
    },
    copyWithZone:function (pZone) {
        var pNewZone = null;
        var pCopy = null;
        if (pZone && pZone.m_pCopyObject) {
            //in case of being called at sub class
            pCopy = pZone.m_pCopyObject;
        }
        else {
            pCopy = new cc.Twirl();
            pZone = pNewZone = new cc.Zone(pCopy);
        }

        cc.Grid3DAction.copyWithZone(pZone);


        pCopy.initWithPosition(this._m_position, this._m_nTwirls, this._m_fAmplitude, this._m_sGridSize, this.m_fDuration);

        return pCopy;
    },
    update:function (time) {
        var i, j;
        var c = this._m_positionInPixels;

        for (i = 0; i < (this._m_sGridSize.x + 1); ++i) {
            for (j = 0; j < (this._m_sGridSize.y + 1); ++j) {
                var v = this.originalVertex(cc.ccg(i, j));

                var avg = cc.ccp(i - (this._m_sGridSize.x / 2.0), j - (this._m_sGridSize.y / 2.0));
                var r = cc.ccpLength(avg);

                var amp = 0.1 * this._m_fAmplitude * this._m_fAmplitudeRate;
                var a = r * Math.cos(Math.PI / 2.0 + time * Math.PI * this._m_nTwirls * 2) * amp;

                var d = new cc.Point();

                d.x = Math.sin(a) * (v.y - c.y) + Math.cos(a) * (v.x - c.x);
                d.y = Math.cos(a) * (v.y - c.y) - Math.sin(a) * (v.x - c.x);

                v.x = c.x + d.x;
                v.y = c.y + d.y;

                this.setVertex(cc.ccg(i, j), v);
            }
        }
    }
});


/** creates the action with center position, number of twirls, amplitude, a grid size and duration */
cc.Twirl.actionWithPosition = function (pos, t, amp, gridSize, duration) {
    var pAction = new cc.Twirl();
    return pAction;
};