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
    _waves:null,
    _amplitude:null,
    _amplitudeRate:null,
    getAmplitude:function () {
        return this._amplitude;
    },
    setAmplitude:function (amplitude) {
        this._amplitude = amplitude;
    },

    getAmplitudeRate:function () {
        return this._amplitudeRate;
    },
    setAmplitudeRate:function (amplitudeRate) {
        this._amplitudeRate = amplitudeRate;
    },

    /** init the action */
    initWithWaves:function (wav, amp, gridSize, duration) {
        if (cc.Grid3DAction.initWithSize(gridSize, duration)) {
            this._waves = wav;
            this._amplitude = amp;
            this._amplitudeRate = 1.0;

            return true;
        }

        return false;
    },

    copyWithZone:function (zone) {
        var newZone = null;
        var copy = null;
        if (zone && zone.copyObject) {
            //in case of being called at sub class
            copy = zone.copyObject;
        }
        else {
            copy = new cc.Waves3D();
            zone = newZone = new cc.Zone(copy);
        }

        cc.Grid3DAction.copyWithZone(zone);


        copy.initWithWaves(this._waves, this._amplitude, this._gridSize, this.duration);

        return copy;
    },
    update:function (time) {
        var i, j;
        for (i = 0; i < this._gridSize.x + 1; ++i) {
            for (j = 0; j < this._gridSize.y + 1; ++j) {
                var v = this.originalVertex(cc.g(i, j));
                v.z += (Math.sin(Math.PI * time * this._waves * 2 + (v.y + v.x) * .01) * this._amplitude * this._amplitudeRate);
                cc.log("v.z offset is" + (Math.sin(Math.PI * time * this._waves * 2 + (v.y + v.x) * .01) * this._amplitude * this._amplitudeRate));
                this.setVertex(cc.g(i, j), v);
            }
        }
    }
});

/** create the action */
cc.Waves3D.create = function (wav, amp, gridSize, duration) {
    var action = new cc.Waves3D();
    return action;
};

/** @brief cc.FlipX3D action */
cc.FlipX3D = cc.Grid3DAction({
    /** initializes the action with duration */
    initWithDuration:function (duration) {
        return cc.Grid3DAction.initWithSize(cc.g(1, 1), duration);
    },
    initWithSize:function (gridSize, duration) {
        if (gridSize.x != 1 || gridSize.y != 1) {
            // Grid size must be (1,1)
            cc.Assert(0, "");

            return false;
        }

        return cc.Grid3DAction.initWithSize(gridSize, duration);
    },
    copyWithZone:function (zone) {
        var newZone = null;
        var copy = null;
        if (zone && zone.copyObject) {
            //in case of being called at sub class
            copy = zone.copyObject;
        }
        else {
            copy = new cc.FlipX3D();
            zone = newZone = new cc.Zone(copy);
        }

        cc.Grid3DAction.copyWithZone(zone);

        copy.initWithSize(this._gridSize, this.duration);

        return copy;
    },
    update:function (time) {
        var angle = Math.PI * time; // 180 degrees
        var mz = Math.sin(angle);
        angle = angle / 2.0; // x calculates degrees from 0 to 90
        var mx = Math.cos(angle);

        var v0, v1, v, diff;

        v0 = this.originalVertex(cc.g(1, 1));
        v1 = this.originalVertex(cc.g(0, 0));

        var x0 = v0.x;
        var x1 = v1.x;
        var x;
        var a, b, c, d;

        if (x0 > x1) {
            // Normal Grid
            a = cc.g(0, 0);
            b = cc.g(0, 1);
            c = cc.g(1, 0);
            d = cc.g(1, 1);
            x = x0;
        }
        else {
            // Reversed Grid
            c = cc.g(0, 0);
            d = cc.g(0, 1);
            a = cc.g(1, 0);
            b = cc.g(1, 1);
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
cc.FlipX3D.create = function (duration) {
    var action = new cc.FlipX3D();
    return action;
};

/** @brief cc.FlipY3D action */
cc.FlipY3D = cc.FlipX3D.extend({
    update:function (time) {
        var angle = Math.PI * time; // 180 degrees
        var mz = Math.sin(angle);
        angle = angle / 2.0;     // x calculates degrees from 0 to 90
        var my = Math.cos(angle);

        var v0, v1, v, diff;

        v0 = this.originalVertex(cc.g(1, 1));
        v1 = this.originalVertex(cc.g(0, 0));

        var y0 = v0.y;
        var y1 = v1.y;
        var y;
        var a, b, c, d;

        if (y0 > y1) {
            // Normal Grid
            a = cc.g(0, 0);
            b = cc.g(0, 1);
            c = cc.g(1, 0);
            d = cc.g(1, 1);
            y = y0;
        }
        else {
            // Reversed Grid
            b = cc.g(0, 0);
            a = cc.g(0, 1);
            d = cc.g(1, 0);
            c = cc.g(1, 1);
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
    copyWithZone:function (zone) {
        var newZone = null;
        var copy = null;
        if (zone && zone.copyObject) {
            //in case of being called at sub class
            copy = zone.copyObject;
        }
        else {
            copy = new cc.FlipY3D();
            zone = newZone = new cc.Zone(copy);
        }

        cc.FlipX3D.copyWithZone(zone);

        copy.initWithSize(this._gridSize, this.duration);

        return copy;
    }
});

/** creates the action with duration */
cc.FlipY3D.create = function (duration) {
    var action = new cc.FlipY3D();
    return action;
};

/** @brief cc.Lens3D action */
cc.Lens3D = cc.Grid3DAction.extend({
    /* lens center position */
    _position:null,
    _radius:null,
    /** lens effect. Defaults to 0.7 - 0 means no effect, 1 is very strong effect */
    _lensEffect:null,

    /* @since v0.99.5 */
// cc.Point this.lastPosition;
    _positionInPixels:null,
    _dirty:null,
    /** Get lens center position */
    getLensEffect:function () {
        return this._lensEffect;
    },
    /** Set lens center position */
    setLensEffect:function (lensEffect) {
        this._lensEffect = lensEffect;
    },

    getPosition:function () {
        return this._position;
    },
    setPosition:function (pos) {
        if (!cc.Point.CCPointEqualToPoint(pos, this._position)) {
            this._position = pos;
            this._positionInPixels.x = pos.x * cc.CONTENT_SCALE_FACTOR();
            this._positionInPixels.y = pos.y * cc.CONTENT_SCALE_FACTOR();

            this._dirty = true;
        }
    },

    /** initializes the action with center position, radius, a grid size and duration */
    initWithPosition:function (pos, r, gridSize, duration) {
        if (cc.Grid3DAction.initWithSize(gridSize, duration)) {
            this._position = cc.p(-1, -1);
            this.setPosition(pos);
            this._radius = r;
            this._lensEffect = 0.7;
            this._dirty = true;

            return true;
        }

        return false;
    },
    copyWithZone:function (zone) {
        var newZone = null;
        var copy = null;
        if (zone && zone.copyObject) {
            //in case of being called at sub class
            copy = zone.copyObject;
        }
        else {
            copy = new cc.Lens3D();
            zone = newZone = new cc.Zone(copy);
        }

        cc.Grid3DAction.copyWithZone(zone);

        copy.initWithPosition(this._position, this._radius, this._gridSize, this.duration);

        return copy;
    },
    update:function (time) {
        if (this._dirty) {
            var i, j;

            for (i = 0; i < this._gridSize.x + 1; ++i) {
                for (j = 0; j < this._gridSize.y + 1; ++j) {
                    var v = this.originalVertex(cc.g(i, j));
                    var vect = cc.pSub(this._positionInPixels, ccp(v.x, v.y));
                    var r = cc.pLength(vect);

                    if (r < this._radius) {
                        r = this._radius - r;
                        var pre_log = r / this._radius;
                        if (pre_log == 0) {
                            pre_log = 0.001;
                        }

                        var l = Math.log(pre_log) * this._lensEffect;
                        var new_r = Math.exp(l) * this._radius;

                        if (cc.pLength(vect) > 0) {
                            vect = cc.pNormalize(vect);
                            var new_vect = cc.pMult(vect, new_r);
                            v.z += cc.pLength(new_vect) * this._lensEffect;
                        }
                    }

                    this.setVertex(cc.g(i, j), v);
                }
            }

            this._dirty = false;
        }
    }
});

/** creates the action with center position, radius, a grid size and duration */
cc.Lens3D.create = function (pos, r, gridSize, duration) {
    var action = new cc.Lens3D();
    return action;
};

/** @brief cc.Ripple3D action */
cc.Ripple3D = cc.Grid3DAction.extend({
    /* center position */
    _position:null,
    _radius:null,
    _waves:null,
    _amplitude:null,
    _amplitudeRate:null,

    /*@since v0.99.5*/
    _positionInPixels:null,
    /** get center position */
    getPosition:function () {
        return this._position;
    },
    /** set center position */
    setPosition:function (position) {
        this._position = position;
        this._positionInPixels.x = position.x * cc.CONTENT_SCALE_FACTOR();
        this._positionInPixels.y = position.y * cc.CONTENT_SCALE_FACTOR();
    },

    getAmplitude:function () {
        return this._amplitude;
    },
    setAmplitude:function (amplitude) {
        this._amplitude = amplitude;
    },

    getAmplitudeRate:function () {
        return this._amplitudeRate;
    },
    setAmplitudeRate:function (amplitudeRate) {
        this._amplitudeRate = amplitudeRate;
    },

    /** initializes the action with radius, number of waves, amplitude, a grid size and duration */
    initWithPosition:function (pos, r, wav, amp, gridSize, duration) {
        if (cc.Grid3DAction.initWithSize(gridSize, duration)) {
            this.setPosition(pos);
            this._radius = r;
            this._waves = wav;
            this._amplitude = amp;
            this._amplitudeRate = 1.0;

            return true;
        }

        return false;
    },
    copyWithZone:function (zone) {
        var newZone = null;
        varcopy = null;
        if (zone && zone.copyObject) {
            //in case of being called at sub class
            copy = zone.copyObject;
        }
        else {
            copy = new cc.Ripple3D();
            zone = newZone = new cc.Zone(copy);
        }

        cc.Grid3DAction.copyWithZone(zone);

        copy.initWithPosition(this._position, this._radius, this._waves, this._amplitude, this._gridSize, this.duration);

        return copy;
    },
    update:function (time) {
        var i, j;

        for (i = 0; i < (this._gridSize.x + 1); ++i) {
            for (j = 0; j < (this._gridSize.y + 1); ++j) {
                var v = this.originalVertex(cc.g(i, j));
                var vect = cc.pSub(this._positionInPixels, ccp(v.x, v.y));
                var r = cc.pLength(vect);

                if (r < this._radius) {
                    r = this._radius - r;
                    var rate = Math.pow(r / this._radius, 2);
                    v.z += (Math.sin(time * Math.PI * this._waves * 2 + r * 0.1) * this._amplitude * this._amplitudeRate * rate);
                }

                this.setVertex(cc.g(i, j), v);
            }
        }
    }
});
/** creates the action with radius, number of waves, amplitude, a grid size and duration */
cc.Ripple3D.create = function (pos, r, wav, amp, gridSize, duration) {
    var action = new cc.Ripple3D();
    return action;
};


/** @brief cc.Shaky3D action */
cc.Shaky3D = cc.Grid3DAction.extend({
    _randrange:null,
    _shakeZ:null,
    /** initializes the action with a range, shake Z vertices, a grid and duration */
    initWithRange:function (range, shakeZ, gridSize, duration) {
        if (cc.Grid3DAction.initWithSize(gridSize, duration)) {
            this._randrange = range;
            this._shakeZ = shakeZ;

            return true;
        }

        return false;
    },
    copyWithZone:function (zone) {
        var newZone = null;
        var copy = null;
        if (zone && zone.copyObject) {
            //in case of being called at sub class
            copy = zone.copyObject;
        }
        else {
            copy = new cc.Shaky3D();
            zone = newZone = new cc.Zone(copy);
        }

        cc.Grid3DAction.copyWithZone(zone);

        copy.initWithRange(this._randrange, this._shakeZ, this._gridSize, this.duration);

        return copy;
    },
    update:function (time) {
        var i, j;

        for (i = 0; i < (this._gridSize.x + 1); ++i) {
            for (j = 0; j < (this._gridSize.y + 1); ++j) {
                var v = this.originalVertex(cc.g(i, j));
                v.x += (Math.random() % (this._randrange * 2)) - this._randrange;
                v.y += (Math.random() % (this._randrange * 2)) - this._randrange;
                if (this._shakeZ) {
                    v.z += (Math.random() % (this._randrange * 2)) - this._randrange;
                }

                this.setVertex(cc.g(i, j), v);
            }
        }
    }
});

/** creates the action with a range, shake Z vertices, a grid and duration */
cc.Shaky3D.create = function (range, shakeZ, gridSize, duration) {
    var action = new cc.Shaky3D();
    return action;
};

/** @brief cc.Liquid action */
cc.Liquid = cc.Grid3DAction.extend({
    _waves:null,
    _amplitude:null,
    _amplitudeRate:null,
    getAmplitude:function () {
        return this._amplitude;
    },
    setAmplitude:function (amplitude) {
        this._amplitude = amplitude;
    },

    getAmplitudeRate:function () {
        return this._amplitudeRate;
    },
    setAmplitudeRate:function (amplitudeRate) {
        this._amplitudeRate = amplitudeRate;
    },

    /** initializes the action with amplitude, a grid and duration */
    initWithWaves:function (wav, amp, gridSize, duration) {
        if (cc.Grid3DAction.initWithSize(gridSize, duration)) {
            this._waves = wav;
            this._amplitude = amp;
            this._amplitudeRate = 1.0;

            return true;
        }

        return false;
    },
    copyWithZone:function (zone) {
        var newZone = null;
        var copy = null;
        if (zone && zone.copyObject) {
            //in case of being called at sub class
            copy = zone.copyObject;
        }
        else {
            copy = new cc.Liquid();
            zone = newZone = new cc.Zone(copy);
        }

        cc.Grid3DAction.copyWithZone(zone);

        copy.initWithWaves(this._waves, this._amplitude, this._gridSize, this.duration);

        return copy;
    },
    update:function (time) {
        var i, j;

        for (i = 1; i < this._gridSize.x; ++i) {
            for (j = 1; j < this._gridSize.y; ++j) {
                var v = this.originalVertex(cc.g(i, j));
                v.x = (v.x + (Math.sin(time * Math.PI * this._waves * 2 + v.x * .01) * this._amplitude * this._amplitudeRate));
                v.y = (v.y + (Math.sin(time * Math.PI * this._waves * 2 + v.y * .01) * this._amplitude * this._amplitudeRate));
                this.setVertex(cc.g(i, j), v);
            }
        }
    }
});

/** creates the action with amplitude, a grid and duration */
cc.Liquid.create = function (wav, amp, gridSize, duration) {
    var action = new cc.Liquid();
    return action;
};

/** @brief cc.Waves action */
cc.Waves = cc.Grid3DAction.extend({
    _waves:null,
    _amplitude:null,
    _amplitudeRate:null,
    _vertical:null,
    _horizontal:null,
    getAmplitude:function () {
        return this._amplitude;
    },
    setAmplitude:function (amplitude) {
        this._amplitude = amplitude;
    },

    getAmplitudeRate:function () {
        return this._amplitudeRate;
    },
    setAmplitudeRate:function (amplitudeRate) {
        this._amplitudeRate = amplitudeRate;
    },

    /** initializes the action with amplitude, horizontal sin, vertical sin, a grid and duration */
    initWithWaves:function (wav, amp, h, v, gridSize, duration) {
        if (cc.Grid3DAction.initWithSize(gridSize, duration)) {
            this._waves = wav;
            this._amplitude = amp;
            this._amplitudeRate = 1.0;
            this._horizontal = h;
            this._vertical = v;

            return true;
        }

        return false;
    },
    copyWithZone:function (zone) {
        var newZone = null;
        var copy = null;
        if (zone && zone.copyObject) {
            //in case of being called at sub class
            copy = zone.copyObject;
        }
        else {
            copy = new cc.Waves();
            zone = newZone = new cc.Zone(copy);
        }

        cc.Grid3DAction.copyWithZone(zone);

        copy.initWithWaves(this._waves, this._amplitude, this._horizontal, this._vertical, this._gridSize, this.duration);

        return copy;
    },
    update:function (time) {
        var i, j;

        for (i = 0; i < this._gridSize.x + 1; ++i) {
            for (j = 0; j < this._gridSize.y + 1; ++j) {
                var v = this.originalVertex(cc.g(i, j));

                if (this._vertical) {
                    v.x = (v.x + (Math.sin(time * Math.PI * this._waves * 2 + v.y * .01) * this._amplitude * this._amplitudeRate));
                }

                if (this._horizontal) {
                    v.y = (v.y + (Math.sin(time * Math.PI * this._waves * 2 + v.x * .01) * this._amplitude * this._amplitudeRate));
                }

                this.setVertex(cc.g(i, j), v);
            }
        }
    }
});

/** initializes the action with amplitude, horizontal sin, vertical sin, a grid and duration */
cc.Waves.create = function (wav, amp, h, v, gridSize, duration) {
    var action = new cc.Waves();
    return action;
};

/** @brief cc.Twirl action */
cc.Twirl = cc.Grid3DAction.extend({
    /* twirl center */
    _position:null,
    _twirls:null,
    _amplitude:null,
    _amplitudeRate:null,
    /*@since v0.99.5 */
    _positionInPixels:null,
    /** get twirl center */
    getPosition:function () {
        return this._position;
    },
    /** set twirl center */
    setPosition:function (position) {
        this._position = position;
        this._positionInPixels.x = position.x * cc.CONTENT_SCALE_FACTOR();
        this._positionInPixels.y = position.y * cc.CONTENT_SCALE_FACTOR();
    },

    getAmplitude:function () {
        return this._amplitude;
    },
    setAmplitude:function (amplitude) {
        this._amplitude = amplitude;
    },

    getAmplitudeRate:function () {
        return this._amplitudeRate;
    },
    setAmplitudeRate:function (amplitudeRate) {
        this._amplitudeRate = amplitudeRate;
    },

    /** initializes the action with center position, number of twirls, amplitude, a grid size and duration */
    initWithPosition:function (pos, t, amp, gridSize, duration) {
        if (cc.Grid3DAction.initWithSize(gridSize, duration)) {
            this.setPosition(pos);
            this._twirls = t;
            this._amplitude = amp;
            this._amplitudeRate = 1.0;

            return true;
        }

        return false;
    },
    copyWithZone:function (zone) {
        var newZone = null;
        var copy = null;
        if (zone && zone.copyObject) {
            //in case of being called at sub class
            copy = zone.copyObject;
        }
        else {
            copy = new cc.Twirl();
            zone = newZone = new cc.Zone(copy);
        }

        cc.Grid3DAction.copyWithZone(zone);


        copy.initWithPosition(this._position, this._twirls, this._amplitude, this._gridSize, this.duration);

        return copy;
    },
    update:function (time) {
        var i, j;
        var c = this._positionInPixels;

        for (i = 0; i < (this._gridSize.x + 1); ++i) {
            for (j = 0; j < (this._gridSize.y + 1); ++j) {
                var v = this.originalVertex(cc.g(i, j));

                var avg = cc.p(i - (this._gridSize.x / 2.0), j - (this._gridSize.y / 2.0));
                var r = cc.pLength(avg);

                var amp = 0.1 * this._amplitude * this._amplitudeRate;
                var a = r * Math.cos(Math.PI / 2.0 + time * Math.PI * this._twirls * 2) * amp;

                var d = cc.p(0, 0);

                d.x = Math.sin(a) * (v.y - c.y) + Math.cos(a) * (v.x - c.x);
                d.y = Math.cos(a) * (v.y - c.y) - Math.sin(a) * (v.x - c.x);

                v.x = c.x + d.x;
                v.y = c.y + d.y;

                this.setVertex(cc.g(i, j), v);
            }
        }
    }
});


/** creates the action with center position, number of twirls, amplitude, a grid size and duration */
cc.Twirl.create = function (pos, t, amp, gridSize, duration) {
    var action = new cc.Twirl();
    return action;
};
