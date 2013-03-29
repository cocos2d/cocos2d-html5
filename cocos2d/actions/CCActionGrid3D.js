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
cc.rand = function(){
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
        if (this._super(duration, gridSize)) {
            this._waves = waves;
            this._amplitude = amplitude;
            this._amplitudeRate = 1.0;
            return true;
        }
        return false;
    },

    update:function (time) {
        for (var i = 0; i < this._gridSize.width + 1; ++i) {
            for (var j = 0; j < this._gridSize.height + 1; ++j) {
                var v = this.originalVertex(cc.g(i, j));
                v.z += (Math.sin(Math.PI * time * this._waves * 2 + (v.y + v.x) * 0.01) * this._amplitude * this._amplitudeRate);
                //cc.log("v.z offset is" + (Math.sin(Math.PI * time * this._waves * 2 + (v.y + v.x) * 0.01) * this._amplitude * this._amplitudeRate));
                this.setVertex(cc.p(i, j), v);
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
        return this._super(duration, cc.size(1, 1));
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
            cc.Assert(0, "");
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

        var v0 = this.originalVertex(cc.p(1, 1));
        var v1 = this.originalVertex(cc.p(0, 0));

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

        var v0 = this.originalVertex(cc.p(1, 1));
        var v1 = this.originalVertex(cc.p(0, 0));

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

    _dirty:false,

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
        if (!cc.Point.CCPointEqualToPoint(position, this._position)) {
            this._position = position;
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
        if (this._super(duration, gridSize)) {
            this._position = cc.p(-1, -1);
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
            for (var i = 0; i < this._gridSize.width + 1; ++i) {
                for (var j = 0; j < this._gridSize.height + 1; ++j) {
                    var v = this.originalVertex(cc.p(i, j));
                    var vect = cc.pSub(this._position, cc.p(v.x, v.y));
                    var r = cc.pLength(vect);

                    if (r < this._radius) {
                        r = this._radius - r;
                        var pre_log = r / this._radius;
                        if (pre_log == 0)
                            pre_log = 0.001;

                        var l = Math.log(pre_log) * this._lensEffect;
                        var new_r = Math.exp(l) * this._radius;

                        if (cc.pLength(vect) > 0) {
                            vect = cc.pNormalize(vect);
                            var new_vect = cc.pMult(vect, new_r);
                            v.z += cc.pLength(new_vect) * this._lensEffect;
                        }
                    }
                    this.setVertex(cc.p(i, j), v);
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
        this._position = position;
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
        if (this._super(duration, gridSize)) {
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
        for (var i = 0; i < (this._gridSize.width + 1); ++i) {
            for (var j = 0; j < (this._gridSize.height + 1); ++j) {
                var v = this.originalVertex(cc.p(i, j));
                var vect = cc.pSub(this._position, cc.p(v.x, v.y));
                var r = cc.pLength(vect);

                if (r < this._radius) {
                    r = this._radius - r;
                    var rate = Math.pow(r / this._radius, 2);
                    v.z += (Math.sin(time * Math.PI * this._waves * 2 + r * 0.1) * this._amplitude * this._amplitudeRate * rate);
                }

                this.setVertex(cc.p(i, j), v);
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

    /**
     * initializes the action with a range, shake Z vertices, a grid and duration
     * @param {Number} duration
     * @param {cc.Size} gridSize
     * @param {Number} range
     * @param {Boolean} shakeZ
     * @return {Boolean}
     */
    initWithDuration:function (duration, gridSize, range, shakeZ) {
        if (this._super(duration, gridSize)) {
            this._randRange = range;
            this._shakeZ = shakeZ;
            return true;
        }
        return false;
    },

    update:function (time) {
        for (var i = 0; i < (this._gridSize.width + 1); ++i) {
            for (var j = 0; j < (this._gridSize.height + 1); ++j) {
                var v = this.originalVertex(cc.p(i, j));
                v.x += (cc.rand() % (this._randRange * 2)) - this._randRange;
                v.y += (cc.rand() % (this._randRange * 2)) - this._randRange;
                if (this._shakeZ)
                    v.z += (cc.rand() % (this._randRange * 2)) - this._randRange;
                this.setVertex(cc.p(i, j), v);
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
        if (this._super(duration, gridSize)) {
            this._waves = waves;
            this._amplitude = amplitude;
            this._amplitudeRate = 1.0;
            return true;
        }
        return false;
    },

    update:function (time) {
        for (var i = 1; i < this._gridSize.width; ++i) {
            for (var j = 1; j < this._gridSize.height; ++j) {
                var v = this.originalVertex(cc.p(i, j));
                v.x = (v.x + (Math.sin(time * Math.PI * this._waves * 2 + v.x * .01) * this._amplitude * this._amplitudeRate));
                v.y = (v.y + (Math.sin(time * Math.PI * this._waves * 2 + v.y * .01) * this._amplitude * this._amplitudeRate));
                this.setVertex(cc.p(i, j), v);
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
        if (this._super(duration, gridSize)) {
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
        for (var i = 0; i < this._gridSize.width + 1; ++i) {
            for (var j = 0; j < this._gridSize.height + 1; ++j) {
                var v = this.originalVertex(cc.p(i, j));
                if (this._vertical)
                    v.x = (v.x + (Math.sin(time * Math.PI * this._waves * 2 + v.y * .01) * this._amplitude * this._amplitudeRate));
                if (this._horizontal)
                    v.y = (v.y + (Math.sin(time * Math.PI * this._waves * 2 + v.x * .01) * this._amplitude * this._amplitudeRate));
                this.setVertex(cc.p(i, j), v);
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

    /**
     * get twirl center
     * @return {cc.Point}
     */
    getPosition:function () {
        return this._position;
    },

    /**
     * set twirl center
     * @param {Number} position
     */
    setPosition:function (position) {
        this._position = position;
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
        if (this._super(duration, gridSize)) {
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
        for (var i = 0; i < (this._gridSize.width + 1); ++i) {
            for (var j = 0; j < (this._gridSize.height + 1); ++j) {
                var v = this.originalVertex(cc.p(i, j));

                var avg = cc.p(i - (this._gridSize.width / 2.0), j - (this._gridSize.height / 2.0));

                var amp = 0.1 * this._amplitude * this._amplitudeRate;
                var a = cc.pLength(avg) * Math.cos(Math.PI / 2.0 + time * Math.PI * this._twirls * 2) * amp;

                var d = cc.p(Math.sin(a) * (v.y - c.y) + Math.cos(a) * (v.x - c.x), Math.cos(a) * (v.y - c.y) - Math.sin(a) * (v.x - c.x));

                v.x = c.x + d.x;
                v.y = c.y + d.y;

                this.setVertex(cc.p(i, j), v);
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
