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

cc.RAND_MAX = 0xffffff;
cc.rand = function () {
    return Math.random() * cc.RAND_MAX;
};
/**
 * cc.Waves3D action
 * @class
 * @extends cc.Grid3DAction
 */
cc.Waves3D = cc.Grid3DAction.extend(/** @lends cc.Waves3D# */{
    _waves:null,
    _amplitude:null,
    _amplitudeRate:null,

    ctor:function () {
        cc.GridAction.prototype.ctor.call(this);

        this._waves = 0;
        this._amplitude = 0;
        this._amplitudeRate = 0;
    },

    /**
     * get Amplitude
     * @return {Number}
     */
    getAmplitude:function () {
        return this._amplitude;
    },

    /**
     * set Amplitude
     * @param {Number} amplitude
     */
    setAmplitude:function (amplitude) {
        this._amplitude = amplitude;
    },

    /**
     * get Amplitude Rate
     * @return {Number}
     */
    getAmplitudeRate:function () {
        return this._amplitudeRate;
    },

    /**
     * set Amplitude Rate
     * @param {Number} amplitudeRate
     */
    setAmplitudeRate:function (amplitudeRate) {
        this._amplitudeRate = amplitudeRate;
    },

    /**
     * initializes an action with duration, grid size, waves and amplitude
     * @param {Number} duration
     * @param {cc.Size} gridSize
     * @param {Number} waves
     * @param {Number} amplitude
     * @return {Boolean}
     */
    initWithDuration:function (duration, gridSize, waves, amplitude) {
        if (cc.Grid3DAction.prototype.initWithDuration.call(this, duration, gridSize)) {
            this._waves = waves;
            this._amplitude = amplitude;
            this._amplitudeRate = 1.0;
            return true;
        }
        return false;
    },

    update:function (time) {
        var locGridSize = this._gridSize;
        var locAmplitude = this._amplitude, locPos = cc.p(0, 0);
        var locAmplitudeRate = this._amplitudeRate, locWaves = this._waves;
        for (var i = 0; i < locGridSize.width + 1; ++i) {
            for (var j = 0; j < locGridSize.height + 1; ++j) {
                locPos.x = i;
                locPos.y = j;
                var v = this.originalVertex(locPos);
                v.z += (Math.sin(Math.PI * time * locWaves * 2 + (v.y + v.x) * 0.01) * locAmplitude * locAmplitudeRate);
                //cc.log("v.z offset is" + (Math.sin(Math.PI * time * this._waves * 2 + (v.y + v.x) * 0.01) * this._amplitude * this._amplitudeRate));
                this.setVertex(locPos, v);
            }
        }
    }
});

/**
 * creates an action with duration, grid size, waves and amplitude
 * @param {Number} duration
 * @param {cc.Size} gridSize
 * @param {Number} waves
 * @param {Number} amplitude
 * @return {cc.Waves3D}
 */
cc.Waves3D.create = function (duration, gridSize, waves, amplitude) {
    var action = new cc.Waves3D();
    action.initWithDuration(duration, gridSize, waves, amplitude);
    return action;
};

/**
 * cc.FlipX3D action
 * @class
 * @extends cc.Grid3DAction
 */
cc.FlipX3D = cc.Grid3DAction.extend(/** @lends cc.Waves3D# */{
    /**
     * initializes the action with duration
     * @param {Number} duration
     * @return {Boolean}
     */
    initWithDuration:function (duration) {
        return cc.Grid3DAction.prototype.initWithDuration.call(this, duration, cc.size(1, 1));
    },

    /**
     * initializes the action with gridSize and duration
     * @param {cc.Size} gridSize
     * @param {Number} duration
     * @return {Boolean}
     */
    initWithSize:function (gridSize, duration) {
        if (gridSize.width != 1 || gridSize.height != 1) {
            // Grid size must be (1,1)
            cc.log("Grid size must be (1,1)");
            return false;
        }
        return  cc.Grid3DAction.prototype.initWithDuration.call(this, duration, gridSize);
    },

    update:function (time) {
        var angle = Math.PI * time; // 180 degrees
        var mz = Math.sin(angle);
        angle = angle / 2.0; // x calculates degrees from 0 to 90
        var mx = Math.cos(angle);

        var diff = new cc.Vertex3F();
        var tempVer = cc.p(0, 0);
        tempVer.x = tempVer.y = 1;
        var v0 = this.originalVertex(tempVer);
        tempVer.x = tempVer.y = 0;
        var v1 = this.originalVertex(tempVer);

        var x0 = v0.x;
        var x1 = v1.x;
        var x;
        var a, b, c, d;

        if (x0 > x1) {
            // Normal Grid
            a = cc.p(0, 0);
            b = cc.p(0, 1);
            c = cc.p(1, 0);
            d = cc.p(1, 1);
            x = x0;
        } else {
            // Reversed Grid
            c = cc.p(0, 0);
            d = cc.p(0, 1);
            a = cc.p(1, 0);
            b = cc.p(1, 1);
            x = x1;
        }

        diff.x = ( x - x * mx );
        diff.z = Math.abs(parseFloat((x * mz) / 4.0));

        // bottom-left
        var v = this.originalVertex(a);
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

/**
 * creates FlipX3D action with duration
 * @param {Number} duration
 * @return {cc.FlipX3D}
 */
cc.FlipX3D.create = function (duration) {
    var action = new cc.FlipX3D();
    action.initWithDuration(duration);
    return action;
};

/**
 * cc.FlipY3D action
 * @class
 * @extends cc.FlipX3D
 */
cc.FlipY3D = cc.FlipX3D.extend(/** @lends cc.FlipY3D# */{
    update:function (time) {
        var angle = Math.PI * time; // 180 degrees
        var mz = Math.sin(angle);
        angle = angle / 2.0;     // x calculates degrees from 0 to 90
        var my = Math.cos(angle);

        var diff = new cc.Vertex3F();

        var tempP = cc.p(0, 0);
        tempP.x = tempP.y = 1;
        var v0 = this.originalVertex(tempP);
        tempP.x = tempP.y = 0;
        var v1 = this.originalVertex(tempP);

        var y0 = v0.y;
        var y1 = v1.y;
        var y;
        var a, b, c, d;

        if (y0 > y1) {
            // Normal Grid
            a = cc.p(0, 0);
            b = cc.p(0, 1);
            c = cc.p(1, 0);
            d = cc.p(1, 1);
            y = y0;
        } else {
            // Reversed Grid
            b = cc.p(0, 0);
            a = cc.p(0, 1);
            d = cc.p(1, 0);
            c = cc.p(1, 1);
            y = y1;
        }

        diff.y = y - y * my;
        diff.z = Math.abs(parseFloat(y * mz) / 4.0);

        // bottom-left
        var v = this.originalVertex(a);
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
    }
});

/**
 * creates the action with duration
 * @param {Number} duration
 * @return {cc.FlipY3D}
 */
cc.FlipY3D.create = function (duration) {
    var action = new cc.FlipY3D();
    action.initWithDuration(duration);
    return action;
};

/**
 * cc.Lens3D action
 * @class
 * @extends cc.FlipX3D
 */
cc.Lens3D = cc.Grid3DAction.extend(/** @lends cc.Lens3D# */{
    /* lens center position */
    _position:null,
    _radius:0,
    /** lens effect. Defaults to 0.7 - 0 means no effect, 1 is very strong effect */
    _lensEffect:0,
    /** lens is concave. (true = concave, false = convex) default is convex i.e. false */
    _concave:false,
    _dirty:false,

    ctor:function () {
        cc.GridAction.prototype.ctor.call(this);

        this._position = cc._pConst(0, 0);
        this._radius = 0;
        this._lensEffect = 0;
        this._concave = false;
        this._dirty = false;
    },

    /**
     * Get lens center position
     * @return {Number}
     */
    getLensEffect:function () {
        return this._lensEffect;
    },

    /**
     * Set lens center position
     * @param {Number} lensEffect
     */
    setLensEffect:function (lensEffect) {
        this._lensEffect = lensEffect;
    },

    /**
     * Set whether lens is concave
     * @param {Boolean} concave
     */
    setConcave:function (concave) {
        this._concave = concave;
    },

    /**
     * get Position
     * @return {cc.Point}
     */
    getPosition:function () {
        return this._position;
    },

    /**
     * set Position
     * @param {cc.Point} position
     */
    setPosition:function (position) {
        if (!cc.pointEqualToPoint(position, this._position)) {
            this._position._x = position.x;
            this._position._y = position.y;
            this._dirty = true;
        }
    },

    /**
     * initializes the action with center position, radius, a grid size and duration
     * @param {Number} duration
     * @param {cc.Size} gridSize
     * @param {cc.Point} position
     * @param {Number} radius
     * @return {Boolean}
     */
    initWithDuration:function (duration, gridSize, position, radius) {
        if (cc.Grid3DAction.prototype.initWithDuration.call(this, duration, gridSize)) {
            this.setPosition(position);
            this._radius = radius;
            this._lensEffect = 0.7;
            this._dirty = true;
            return true;
        }
        return false;
    },

    update:function (time) {
        if (this._dirty) {
            var locGridSizeWidth = this._gridSize.width, locGridSizeHeight = this._gridSize.height;
            var locRadius = this._radius, locLensEffect = this._lensEffect;
            var locPos = cc.p(0, 0);
            var vect = cc.p(0, 0);
            var v, r, l, new_r, pre_log;
            for (var i = 0; i < locGridSizeWidth + 1; ++i) {
                for (var j = 0; j < locGridSizeHeight + 1; ++j) {
                    locPos.x = i;
                    locPos.y = j;
                    v = this.originalVertex(locPos);
                    vect.x = this._position.x - v.x;
                    vect.y = this._position.y - v.y;
                    r = cc.pLength(vect);

                    if (r < locRadius) {
                        r = locRadius - r;
                        pre_log = r / locRadius;
                        if (pre_log == 0)
                            pre_log = 0.001;

                        l = Math.log(pre_log) * locLensEffect;
                        new_r = Math.exp(l) * locRadius;

                        r = cc.pLength(vect);
                        if (r > 0) {
                            vect.x = vect.x / r;
                            vect.y = vect.y / r;

                            vect.x = vect.x * new_r;
                            vect.y = vect.y * new_r;
                            v.z += cc.pLength(vect) * locLensEffect;
                        }
                    }
                    this.setVertex(locPos, v);
                }
            }
            this._dirty = false;
        }
    }
});

/**
 * creates the action with center position, radius, a grid size and duration
 * @param {Number} duration
 * @param {cc.Size} gridSize
 * @param {cc.Point} position
 * @param {Number} radius
 * @return {cc.Lens3D}
 */
cc.Lens3D.create = function (duration, gridSize, position, radius) {
    var action = new cc.Lens3D();
    action.initWithDuration(duration, gridSize, position, radius);
    return action;
};

/**
 * cc.Ripple3D action
 * @class
 * @extends cc.Grid3DAction
 */
cc.Ripple3D = cc.Grid3DAction.extend(/** @lends cc.Ripple3D# */{
    /* center position */
    _position:null,
    _radius:null,
    _waves:null,
    _amplitude:null,
    _amplitudeRate:null,

    ctor:function () {
        cc.GridAction.prototype.ctor.call(this);

        this._position = cc._pConst(0, 0);
        this._radius = 0;
        this._waves = 0;
        this._amplitude = 0;
        this._amplitudeRate = 0;
    },

    /**
     * get center position
     * @return {cc.Point}
     */
    getPosition:function () {
        return this._position;
    },

    /**
     * set center position
     * @param {cc.Point} position
     */
    setPosition:function (position) {
        this._position._x = position.x;
        this._position._y = position.y;
    },

    /**
     * get Amplitude
     * @return {Number}
     */
    getAmplitude:function () {
        return this._amplitude;
    },

    /**
     * set Amplitude
     * @param {Number} amplitude
     */
    setAmplitude:function (amplitude) {
        this._amplitude = amplitude;
    },

    /**
     * get Amplitude rate
     * @return {*}
     */
    getAmplitudeRate:function () {
        return this._amplitudeRate;
    },

    /**
     * get amplitude rate
     * @param {Number} amplitudeRate
     */
    setAmplitudeRate:function (amplitudeRate) {
        this._amplitudeRate = amplitudeRate;
    },

    /**
     * initializes the action with radius, number of waves, amplitude, a grid size and duration
     * @param {Number} duration
     * @param {cc.Size} gridSize
     * @param {cc.Point} position
     * @param {Number} radius
     * @param {Number} waves
     * @param {Number} amplitude
     * @return {Boolean}
     */
    initWithDuration:function (duration, gridSize, position, radius, waves, amplitude) {
        if (cc.Grid3DAction.prototype.initWithDuration.call(this, duration, gridSize)) {
            this.setPosition(position);
            this._radius = radius;
            this._waves = waves;
            this._amplitude = amplitude;
            this._amplitudeRate = 1.0;
            return true;
        }
        return false;
    },

    update:function (time) {
        var locGridSizeWidth = this._gridSize.width, locGridSizeHeight = this._gridSize.height;
        var locPos = cc.p(0, 0), locRadius = this._radius;
        var locWaves = this._waves, locAmplitude = this._amplitude, locAmplitudeRate = this._amplitudeRate;
        var v, r, tempPos = cc.p(0, 0);
        for (var i = 0; i < (locGridSizeWidth + 1); ++i) {
            for (var j = 0; j < (locGridSizeHeight + 1); ++j) {
                locPos.x = i;
                locPos.y = j;
                v = this.originalVertex(locPos);

                tempPos.x = this._position.x - v.x;
                tempPos.y = this._position.y - v.y;
                r = cc.pLength(tempPos);

                if (r < locRadius) {
                    r = locRadius - r;
                    var rate = Math.pow(r / locRadius, 2);
                    v.z += (Math.sin(time * Math.PI * locWaves * 2 + r * 0.1) * locAmplitude * locAmplitudeRate * rate);
                }
                this.setVertex(locPos, v);
            }
        }
    }
});

/**
 * creates the action with radius, number of waves, amplitude, a grid size and duration
 * @param {Number} duration
 * @param {cc.Size} gridSize
 * @param {cc.Point} position
 * @param {Number} radius
 * @param {Number} waves
 * @param {Number} amplitude
 * @return {cc.Ripple3D}
 */
cc.Ripple3D.create = function (duration, gridSize, position, radius, waves, amplitude) {
    var action = new cc.Ripple3D();
    action.initWithDuration(duration, gridSize, position, radius, waves, amplitude);
    return action;
};

/**
 * cc.Shaky3D action
 * @class
 * @extends cc.Grid3DAction
 */
cc.Shaky3D = cc.Grid3DAction.extend(/** @lends cc.Shaky3D# */{
    _randRange:null,
    _shakeZ:null,

    ctor:function () {
        cc.GridAction.prototype.ctor.call(this);

        this._randRange = 0;
        this._shakeZ = false;
    },

    /**
     * initializes the action with a range, shake Z vertices, a grid and duration
     * @param {Number} duration
     * @param {cc.Size} gridSize
     * @param {Number} range
     * @param {Boolean} shakeZ
     * @return {Boolean}
     */
    initWithDuration:function (duration, gridSize, range, shakeZ) {
        if (cc.Grid3DAction.prototype.initWithDuration.call(this, duration, gridSize)) {
            this._randRange = range;
            this._shakeZ = shakeZ;
            return true;
        }
        return false;
    },

    update:function (time) {
        var locGridSizeWidth = this._gridSize.width, locGridSizeHeight = this._gridSize.height;
        var locRandRange = this._randRange, locShakeZ = this._shakeZ, locP = cc.p(0, 0);
        var v;
        for (var i = 0; i < (locGridSizeWidth + 1); ++i) {
            for (var j = 0; j < (locGridSizeHeight + 1); ++j) {
                locP.x = i;
                locP.y = j;
                v = this.originalVertex(locP);
                v.x += (cc.rand() % (locRandRange * 2)) - locRandRange;
                v.y += (cc.rand() % (locRandRange * 2)) - locRandRange;
                if (locShakeZ)
                    v.z += (cc.rand() % (locRandRange * 2)) - locRandRange;
                this.setVertex(locP, v);
            }
        }
    }
});

/**
 * creates the action with a range, shake Z vertices, a grid and duration
 * @param {Number} duration
 * @param {cc.Size} gridSize
 * @param {Number} range
 * @param {Boolean} shakeZ
 * @return {cc.Shaky3D}
 */
cc.Shaky3D.create = function (duration, gridSize, range, shakeZ) {
    var action = new cc.Shaky3D();
    action.initWithDuration(duration, gridSize, range, shakeZ);
    return action;
};

/**
 * cc.Liquid action
 * @class
 * @extends cc.Grid3DAction
 */
cc.Liquid = cc.Grid3DAction.extend(/** @lends cc.Liquid# */{
    _waves:null,
    _amplitude:null,
    _amplitudeRate:null,

    ctor:function () {
        cc.GridAction.prototype.ctor.call(this);

        this._waves = 0;
        this._amplitude = 0;
        this._amplitudeRate = 0;
    },

    /**
     * get amplitude
     * @return {Number}
     */
    getAmplitude:function () {
        return this._amplitude;
    },

    /**
     * set amplitude
     * @param {Number} amplitude
     */
    setAmplitude:function (amplitude) {
        this._amplitude = amplitude;
    },

    /**
     * get amplitude rate
     * @return {Number}
     */
    getAmplitudeRate:function () {
        return this._amplitudeRate;
    },

    /**
     * set amplitude rate
     * @param {Number} amplitudeRate
     */
    setAmplitudeRate:function (amplitudeRate) {
        this._amplitudeRate = amplitudeRate;
    },

    /**
     * initializes the action with amplitude, a grid and duration
     * @param {Number} duration
     * @param {cc.Size} gridSize
     * @param {Number} waves
     * @param {Number} amplitude
     * @return {Boolean}
     */
    initWithDuration:function (duration, gridSize, waves, amplitude) {
        if (cc.Grid3DAction.prototype.initWithDuration.call(this, duration, gridSize)) {
            this._waves = waves;
            this._amplitude = amplitude;
            this._amplitudeRate = 1.0;
            return true;
        }
        return false;
    },

    update:function (time) {
        var locSizeWidth = this._gridSize.width, locSizeHeight = this._gridSize.height, locPos = cc.p(0, 0);
        var locWaves = this._waves, locAmplitude = this._amplitude, locAmplitudeRate = this._amplitudeRate;
        var v;
        for (var i = 1; i < locSizeWidth; ++i) {
            for (var j = 1; j < locSizeHeight; ++j) {
                locPos.x = i;
                locPos.y = j;
                v = this.originalVertex(locPos);
                v.x = (v.x + (Math.sin(time * Math.PI * locWaves * 2 + v.x * .01) * locAmplitude * locAmplitudeRate));
                v.y = (v.y + (Math.sin(time * Math.PI * locWaves * 2 + v.y * .01) * locAmplitude * locAmplitudeRate));
                this.setVertex(locPos, v);
            }
        }
    }
});

/**
 * creates the action with amplitude, a grid and duration
 * @param {Number} duration
 * @param {cc.Size} gridSize
 * @param {Number} waves
 * @param {Number} amplitude
 * @return {cc.Liquid}
 */
cc.Liquid.create = function (duration, gridSize, waves, amplitude) {
    var action = new cc.Liquid();
    action.initWithDuration(duration, gridSize, waves, amplitude);
    return action;
};

/**
 * cc.Waves action
 * @class
 * @extends cc.Grid3DAction
 */
cc.Waves = cc.Grid3DAction.extend(/** @lends cc.Waves# */{
    _waves:null,
    _amplitude:null,
    _amplitudeRate:null,
    _vertical:null,
    _horizontal:null,

    ctor:function () {
        cc.GridAction.prototype.ctor.call(this);

        this._waves = 0;
        this._amplitude = 0;
        this._amplitudeRate = 0;
        this._vertical = false;
        this._horizontal = false;
    },

    /**
     * get amplitude
     * @return {Number}
     */
    getAmplitude:function () {
        return this._amplitude;
    },

    /**
     * set amplitude
     * @param {Number} amplitude
     */
    setAmplitude:function (amplitude) {
        this._amplitude = amplitude;
    },

    /**
     * get amplitude rate
     * @return {Number}
     */
    getAmplitudeRate:function () {
        return this._amplitudeRate;
    },

    /**
     * set amplitude rate
     * @param {Number} amplitudeRate
     */
    setAmplitudeRate:function (amplitudeRate) {
        this._amplitudeRate = amplitudeRate;
    },

    /**
     * initializes the action with amplitude, horizontal sin, vertical sin, a grid and duration
     * @param {Number} duration
     * @param {cc.Size} gridSize
     * @param {Number} waves
     * @param {Number} amplitude
     * @param {Boolean} horizontal
     * @param {Boolean} vertical
     * @return {Boolean}
     */
    initWithDuration:function (duration, gridSize, waves, amplitude, horizontal, vertical) {
        if (cc.Grid3DAction.prototype.initWithDuration.call(this, duration, gridSize)) {
            this._waves = waves;
            this._amplitude = amplitude;
            this._amplitudeRate = 1.0;
            this._horizontal = horizontal;
            this._vertical = vertical;
            return true;
        }
        return false;
    },

    update:function (time) {
        var locSizeWidth = this._gridSize.width, locSizeHeight = this._gridSize.height, locPos = cc.p(0, 0);
        var locVertical = this._vertical, locHorizontal = this._horizontal;
        var locWaves = this._waves, locAmplitude = this._amplitude, locAmplitudeRate = this._amplitudeRate;
        var v;
        for (var i = 0; i < locSizeWidth + 1; ++i) {
            for (var j = 0; j < locSizeHeight + 1; ++j) {
                locPos.x = i;
                locPos.y = j;
                v = this.originalVertex(locPos);
                if (locVertical)
                    v.x = (v.x + (Math.sin(time * Math.PI * locWaves * 2 + v.y * .01) * locAmplitude * locAmplitudeRate));
                if (locHorizontal)
                    v.y = (v.y + (Math.sin(time * Math.PI * locWaves * 2 + v.x * .01) * locAmplitude * locAmplitudeRate));
                this.setVertex(locPos, v);
            }
        }
    }
});

/**
 * initializes the action with amplitude, horizontal sin, vertical sin, a grid and duration
 * @param {Number} duration
 * @param {cc.Size} gridSize
 * @param {Number} waves
 * @param {Number} amplitude
 * @param {Boolean} horizontal
 * @param {Boolean} vertical
 * @return {cc.Waves}
 */
cc.Waves.create = function (duration, gridSize, waves, amplitude, horizontal, vertical) {
    var action = new cc.Waves();
    action.initWithDuration(duration, gridSize, waves, amplitude, horizontal, vertical);
    return action;
};

/** @brief  */
/**
 * cc.Twirl action
 * @class
 * @extends cc.Grid3DAction
 */
cc.Twirl = cc.Grid3DAction.extend({
    /* twirl center */
    _position:null,
    _twirls:null,
    _amplitude:null,
    _amplitudeRate:null,

    ctor:function () {
        cc.GridAction.prototype.ctor.call(this);

        this._position = cc._pConst(0, 0);
        this._twirls = 0;
        this._amplitude = 0;
        this._amplitudeRate = 0;
    },

    /**
     * get twirl center
     * @return {cc.Point}
     */
    getPosition:function () {
        return this._position;
    },

    /**
     * set twirl center
     * @param {cc.Point} position
     */
    setPosition:function (position) {
        this._position._x = position.x;
        this._position._y = position.y;
    },

    /**
     * get amplitude
     * @return {Number}
     */
    getAmplitude:function () {
        return this._amplitude;
    },

    /**
     * set amplitude
     * @param {Number} amplitude
     */
    setAmplitude:function (amplitude) {
        this._amplitude = amplitude;
    },

    /**
     * get amplitude rate
     * @return {Number}
     */
    getAmplitudeRate:function () {
        return this._amplitudeRate;
    },

    /**
     * set amplitude rate
     * @param {Number} amplitudeRate
     */
    setAmplitudeRate:function (amplitudeRate) {
        this._amplitudeRate = amplitudeRate;
    },

    /** initializes the action with center position, number of twirls, amplitude, a grid size and duration */
    initWithDuration:function (duration, gridSize, position, twirls, amplitude) {
        if (cc.Grid3DAction.prototype.initWithDuration.call(this, duration, gridSize)) {
            this.setPosition(position);
            this._twirls = twirls;
            this._amplitude = amplitude;
            this._amplitudeRate = 1.0;
            return true;
        }
        return false;
    },

    update:function (time) {
        var c = this._position;
        var locSizeWidth = this._gridSize.width, locSizeHeight = this._gridSize.height, locPos = cc.p(0, 0);
        var amp = 0.1 * this._amplitude * this._amplitudeRate;
        var locTwirls = this._twirls;
        var v, a, dX, dY, avg = cc.p(0, 0);
        for (var i = 0; i < (locSizeWidth + 1); ++i) {
            for (var j = 0; j < (locSizeHeight + 1); ++j) {
                locPos.x = i;
                locPos.y = j;
                v = this.originalVertex(locPos);

                avg.x = i - (locSizeWidth / 2.0);
                avg.y = j - (locSizeHeight / 2.0);

                a = cc.pLength(avg) * Math.cos(Math.PI / 2.0 + time * Math.PI * locTwirls * 2) * amp;

                dX = Math.sin(a) * (v.y - c.y) + Math.cos(a) * (v.x - c.x);
                dY = Math.cos(a) * (v.y - c.y) - Math.sin(a) * (v.x - c.x);

                v.x = c.x + dX;
                v.y = c.y + dY;

                this.setVertex(locPos, v);
            }
        }
    }
});

/**
 * creates the action with center position, number of twirls, amplitude, a grid size and duration
 * @param {Number} duration
 * @param {cc.Size} gridSize
 * @param {cc.Point} position
 * @param {Number} twirls
 * @param {Number} amplitude
 * @return {cc.Twirl}
 */
cc.Twirl.create = function (duration, gridSize, position, twirls, amplitude) {
    var action = new cc.Twirl();
    action.initWithDuration(duration, gridSize, position, twirls, amplitude);
    return action;
};
