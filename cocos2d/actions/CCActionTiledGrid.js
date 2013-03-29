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

/**
 * cc.ShakyTiles3D action
 * @class
 * @extends cc.TiledGrid3DAction
 */
cc.ShakyTiles3D = cc.TiledGrid3DAction.extend(/** @lends cc.ShakyTiles3D# */{
    _randRange:0,
    _shakeZ:false,

    /**
     * initializes the action with a range, whether or not to shake Z vertices, a grid size, and duration
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
        for (var i = 0; i < this._gridSize.width; ++i) {
            for (var j = 0; j < this._gridSize.height; ++j) {
                var coords = this.originalTile(cc.p(i, j));

                // X
                coords.bl.x += ( cc.rand() % (this._randRange * 2) ) - this._randRange;
                coords.br.x += ( cc.rand() % (this._randRange * 2) ) - this._randRange;
                coords.tl.x += ( cc.rand() % (this._randRange * 2) ) - this._randRange;
                coords.tr.x += ( cc.rand() % (this._randRange * 2) ) - this._randRange;

                // Y
                coords.bl.y += ( cc.rand() % (this._randRange * 2) ) - this._randRange;
                coords.br.y += ( cc.rand() % (this._randRange * 2) ) - this._randRange;
                coords.tl.y += ( cc.rand() % (this._randRange * 2) ) - this._randRange;
                coords.tr.y += ( cc.rand() % (this._randRange * 2) ) - this._randRange;

                if (this._shakeZ) {
                    coords.bl.z += ( cc.rand() % (this._randRange * 2) ) - this._randRange;
                    coords.br.z += ( cc.rand() % (this._randRange * 2) ) - this._randRange;
                    coords.tl.z += ( cc.rand() % (this._randRange * 2) ) - this._randRange;
                    coords.tr.z += ( cc.rand() % (this._randRange * 2) ) - this._randRange;
                }

                this.setTile(cc.p(i, j), coords);
            }
        }
    }
});

/**
 * creates the action with a range, whether or not to shake Z vertices, a grid size, and duration
 * @param {Number} duration
 * @param {cc.Size} gridSize
 * @param {Number} range
 * @param {Boolean} shakeZ
 * @return {cc.ShakyTiles3D}
 */
cc.ShakyTiles3D.create = function (duration, gridSize, range, shakeZ) {
    var action = new cc.ShakyTiles3D();
    action.initWithDuration(duration, gridSize, range, shakeZ);
    return action;
};

/**
 * cc.ShatteredTiles3D action
 * @class
 * @extends cc.TiledGrid3DAction
 */
cc.ShatteredTiles3D = cc.TiledGrid3DAction.extend(/** @lends cc.ShatteredTiles3D# */{
    _randRange:0,
    _once:false,
    _shatterZ:false,

    /**
     * initializes the action with a range, whether or not to shatter Z vertices, a grid size and duration
     * @param {Number} duration
     * @param {cc.Size} gridSize
     * @param {Number} range
     * @param {Boolean} shatterZ
     * @return {Boolean}
     */
    initWithDuration:function (duration, gridSize, range, shatterZ) {
        if (this._super(duration, gridSize)) {
            this._once = false;
            this._randRange = range;
            this._shatterZ = shatterZ;
            return true;
        }
        return false;
    },

    update:function (time) {
        if (this._once === false) {
            for (var i = 0; i < this._gridSize.width; ++i) {
                for (var j = 0; j < this._gridSize.height; ++j) {
                    var coords = this.originalTile(cc.p(i, j));

                    // X
                    coords.bl.x += ( cc.rand() % (this._randRange * 2) ) - this._randRange;
                    coords.br.x += ( cc.rand() % (this._randRange * 2) ) - this._randRange;
                    coords.tl.x += ( cc.rand() % (this._randRange * 2) ) - this._randRange;
                    coords.tr.x += ( cc.rand() % (this._randRange * 2) ) - this._randRange;

                    // Y
                    coords.bl.y += ( cc.rand() % (this._randRange * 2) ) - this._randRange;
                    coords.br.y += ( cc.rand() % (this._randRange * 2) ) - this._randRange;
                    coords.tl.y += ( cc.rand() % (this._randRange * 2) ) - this._randRange;
                    coords.tr.y += ( cc.rand() % (this._randRange * 2) ) - this._randRange;

                    if (this._shatterZ) {
                        coords.bl.z += ( cc.rand() % (this._randRange * 2) ) - this._randRange;
                        coords.br.z += ( cc.rand() % (this._randRange * 2) ) - this._randRange;
                        coords.tl.z += ( cc.rand() % (this._randRange * 2) ) - this._randRange;
                        coords.tr.z += ( cc.rand() % (this._randRange * 2) ) - this._randRange;
                    }
                    this.setTile(cc.p(i, j), coords);
                }
            }
            this._once = true;
        }
    }
});

/**
 * creates the action with a range, whether of not to shatter Z vertices, a grid size and duration
 * @param {Number} duration
 * @param {cc.Size} gridSize
 * @param {Number} range
 * @param {Boolean} shatterZ
 * @return {cc.ShatteredTiles3D}
 */
cc.ShatteredTiles3D.create = function (duration, gridSize, range, shatterZ) {
    var action = new cc.ShatteredTiles3D();
    action.initWithDuration(duration, gridSize, range, shatterZ);
    return action;
};

/**
 * A Tile composed of position, startPosition and delta
 * @Class
 * @constructor
 * @param {cc.Point} position
 * @param {cc.Point} startPosition
 * @param {cc.Size} delta
 */
cc.Tile = function (position, startPosition, delta) {
    this.position = position || cc.POINT_ZERO;
    this.startPosition = startPosition || cc.POINT_ZERO;
    this.delta = delta || cc.POINT_ZERO;
};

/**
 * cc.ShuffleTiles action, Shuffle the tiles in random order
 * @class
 * @extends cc.TiledGrid3DAction
 */
cc.ShuffleTiles = cc.TiledGrid3DAction.extend(/** @lends cc.ShuffleTiles# */{
    _seed:0,
    _tilesCount:0,
    _tilesOrder:null,
    _tiles:null,

    ctor:function () {
        this._tilesOrder = [];
        this._tiles = [];
    },

    /**
     * initializes the action with a random seed, the grid size and the duration
     * @param {Number} duration
     * @param {cc.Size} gridSize
     * @param {Number} seed
     * @return {Boolean}
     */
    initWithDuration:function (duration, gridSize, seed) {
        if (this._super(duration, gridSize)) {
            this._seed = seed;
            this._tilesOrder = null;
            this._tiles = null;
            return true;
        }
        return false;
    },

    /**
     *  shuffle
     * @param {Array} array
     * @param {Number} len
     */
    shuffle:function (array, len) {
        for (var i = len - 1; i >= 0; i--) {
            var j = 0 | (cc.rand() % (i + 1));
            var v = array[i];
            array[i] = array[j];
            array[j] = v;
        }
    },

    /**
     * get Delta
     * @param {cc.Size} pos
     */
    getDelta:function (pos) {
        var idx = pos.width * this._gridSize.height + pos.height;
        return cc.SizeMake(((this._tilesOrder[idx] / this._gridSize.height) - pos.width),
            ((this._tilesOrder[idx] % this._gridSize.height) - pos.height));
    },

    /**
     * place Tile
     * @param {cc.Point} pos
     * @param {cc.Tile} tile
     */
    placeTile:function (pos, tile) {
        var coords = this.originalTile(pos);

        var step = this._target.getGrid().getStep();
        coords.bl.x += (tile.position.x * step.x);
        coords.bl.y += (tile.position.y * step.y);

        coords.br.x += (tile.position.x * step.x);
        coords.br.y += (tile.position.y * step.y);

        coords.tl.x += (tile.position.x * step.x);
        coords.tl.y += (tile.position.y * step.y);

        coords.tr.x += (tile.position.x * step.x);
        coords.tr.y += (tile.position.y * step.y);

        this.setTile(pos, coords);
    },

    /**
     * start with target
     * @param {cc.Node} target
     */
    startWithTarget:function (target) {
        this._super(target);

        this._tilesCount = this._gridSize.width * this._gridSize.height;
        this._tilesOrder = [];

        /**
         * Use k to loop. Because m_nTilesCount is unsigned int,
         * and i is used later for int.
         */
        for (var k = 0; k < this._tilesCount; ++k)
            this._tilesOrder[k] = k;

        this.shuffle(this._tilesOrder, this._tilesCount);

        this._tiles = [];
        var tileIndex = 0;
        for (var i = 0; i < this._gridSize.width; ++i) {
            for (var j = 0; j < this._gridSize.height; ++j) {
                this._tiles[tileIndex] = new cc.Tile();
                this._tiles[tileIndex].position = cc.p(i, j);
                this._tiles[tileIndex].startPosition = cc.p(i, j);
                this._tiles[tileIndex].delta = this.getDelta(cc.SizeMake(i, j));
                ++tileIndex;
            }
        }
    },

    update:function (time) {
        var tileIndex = 0;
        for (var i = 0; i < this._gridSize.width; ++i) {
            for (var j = 0; j < this._gridSize.height; ++j) {
                var selTile = this._tiles[tileIndex];
                selTile.position = cc.pMult(cc.p(selTile.delta.width, selTile.delta.height), time);
                this.placeTile(cc.p(i, j), selTile);
                ++tileIndex;
            }
        }
    }
});

/**
 * creates the action with a random seed, the grid size and the duration
 * @param {Number} duration
 * @param {cc.Size} gridSize
 * @param {Number} seed
 * @return {cc.ShuffleTiles}
 */
cc.ShuffleTiles.create = function (duration, gridSize, seed) {
    var action = new cc.ShuffleTiles();
    action.initWithDuration(duration, gridSize, seed);
    return action;
};

/**
 * cc.FadeOutTRTiles action. Fades out the tiles in a Top-Right direction
 * @class
 * @extends cc.TiledGrid3DAction
 */
cc.FadeOutTRTiles = cc.TiledGrid3DAction.extend(/** @lends cc.FadeOutTRTiles# */{
    /**
     * @param {cc.Size} pos
     * @param {Number} time
     */
    testFunc:function (pos, time) {
        var n = cc.pMult(cc.p(this._gridSize.width, this._gridSize.height), time);
        if ((n.x + n.y) == 0.0)
            return 1.0;

        return Math.pow((pos.width + pos.height) / (n.x + n.y), 6);
    },

    /**
     * turn on Tile
     * @param {cc.Point} pos
     */
    turnOnTile:function (pos) {
        this.setTile(pos, this.originalTile(pos));
    },

    /**
     * turn Off Tile
     * @param {cc.Point} pos
     */
    turnOffTile:function (pos) {
        this.setTile(pos, new cc.Quad3());
    },

    /**
     * transform tile
     * @param {cc.Point} pos
     * @param {Number} distance
     */
    transformTile:function (pos, distance) {
        var coords = this.originalTile(pos);
        var step = this._target.getGrid().getStep();

        coords.bl.x += (step.x / 2) * (1.0 - distance);
        coords.bl.y += (step.y / 2) * (1.0 - distance);

        coords.br.x -= (step.x / 2) * (1.0 - distance);
        coords.br.y += (step.y / 2) * (1.0 - distance);

        coords.tl.x += (step.x / 2) * (1.0 - distance);
        coords.tl.y -= (step.y / 2) * (1.0 - distance);

        coords.tr.x -= (step.x / 2) * (1.0 - distance);
        coords.tr.y -= (step.y / 2) * (1.0 - distance);

        this.setTile(pos, coords);
    },

    update:function (time) {
        for (var i = 0; i < this._gridSize.width; ++i) {
            for (var j = 0; j < this._gridSize.height; ++j) {
                var distance = this.testFunc(cc.SizeMake(i, j), time);
                if (distance == 0)
                    this.turnOffTile(cc.p(i, j));
                else if (distance < 1)
                    this.transformTile(cc.p(i, j), distance);
                else
                    this.turnOnTile(cc.p(i, j));
            }
        }
    }
});

/**
 * creates the action with the grid size and the duration
 * @param duration
 * @param gridSize
 * @return {cc.FadeOutTRTiles}
 */
cc.FadeOutTRTiles.create = function (duration, gridSize) {
    var action = new cc.FadeOutTRTiles();
    action.initWithDuration(duration, gridSize);
    return action;
};

/**
 * cc.FadeOutBLTiles action. Fades out the tiles in a Bottom-Left direction
 * @class
 * @extends cc.FadeOutTRTiles
 */
cc.FadeOutBLTiles = cc.FadeOutTRTiles.extend(/** @lends cc.FadeOutBLTiles# */{
    /**
     * @param {cc.Size} pos
     * @param {Number} time
     */
    testFunc:function (pos, time) {
        var n = cc.pMult(cc.p(this._gridSize.width, this._gridSize.height), (1.0 - time));
        if ((pos.width + pos.height) == 0)
            return 1.0;

        return Math.pow((n.x + n.y) / (pos.width + pos.height), 6);
    }
});

/**
 * creates the action with the grid size and the duration
 * @param duration
 * @param gridSize
 * @return {cc.FadeOutBLTiles}
 */
cc.FadeOutBLTiles.create = function (duration, gridSize) {
    var action = new cc.FadeOutBLTiles();
    action.initWithDuration(duration, gridSize);
    return action;
};

/**
 * cc.FadeOutUpTiles action. Fades out the tiles in upwards direction
 * @class
 * @extends cc.FadeOutTRTiles
 */
cc.FadeOutUpTiles = cc.FadeOutTRTiles.extend(/** @lends cc.FadeOutUpTiles# */{
    testFunc:function (pos, time) {
        var n = cc.pMult(cc.p(this._gridSize.width, this._gridSize.height), time);
        if (n.y == 0.0)
            return 1.0;

        return Math.pow(pos.height / n.y, 6);
    },

    transformTile:function (pos, distance) {
        var coords = this.originalTile(pos);
        var step = this._target.getGrid().getStep();

        coords.bl.y += (step.y / 2) * (1.0 - distance);
        coords.br.y += (step.y / 2) * (1.0 - distance);
        coords.tl.y -= (step.y / 2) * (1.0 - distance);
        coords.tr.y -= (step.y / 2) * (1.0 - distance);

        this.setTile(pos, coords);
    }
});

/**
 * creates the action with the grid size and the duration
 * @param {Number} duration
 * @param {cc.Size} gridSize
 * @return {cc.FadeOutUpTiles}
 */
cc.FadeOutUpTiles.create = function (duration, gridSize) {
    var action = new cc.FadeOutUpTiles();
    action.initWithDuration(duration, gridSize);
    return action;
};

/**
 * cc.FadeOutDownTiles action. Fades out the tiles in downwards direction
 * @class
 * @extends cc.FadeOutUpTiles
 */
cc.FadeOutDownTiles = cc.FadeOutUpTiles.extend(/** @lends cc.FadeOutDownTiles# */{
    testFunc:function (pos, time) {
        var n = cc.pMult(cc.p(this._gridSize.width, this._gridSize.height), (1.0 - time));
        if (pos.height == 0)
            return 1.0;

        return Math.pow(n.y / pos.height, 6);
    }
});

/**
 * creates the action with the grid size and the duration
 * @param {Number} duration
 * @param {cc.Size} gridSize
 * @return {cc.FadeOutDownTiles}
 */
cc.FadeOutDownTiles.create = function (duration, gridSize) {
    var action = new cc.FadeOutDownTiles();
    action.initWithDuration(duration, gridSize);
    return action;
};


/**
 * cc.TurnOffTiles action.<br/>
 * Turn off the files in random order
 * @class
 * @extends cc.TiledGrid3DAction
 */
cc.TurnOffTiles = cc.TiledGrid3DAction.extend(/** @lends cc.TurnOffTiles# */{
    _seed:null,
    _tilesCount:0,
    _tilesOrder:null,

    ctor:function () {
        this._tilesOrder = [];
    },

    /** initializes the action with a random seed, the grid size and the duration
     * @param {Number} duration
     * @param {cc.Size} gridSize
     * @param {Number} seed
     * @return {Boolean}
     */
    initWithDuration:function (duration, gridSize, seed) {
        if (this._super(duration, gridSize)) {
            this._seed = seed;
            this._tilesOrder = null;
            return true;
        }
        return false;
    },

    /**
     * @param {Array} array
     * @param {Number} len
     */
    shuffle:function (array, len) {
        for (var i = len - 1; i >= 0; i--) {
            var j = 0 | (cc.rand() % (i + 1));
            var v = array[i];
            array[i] = array[j];
            array[j] = v;
        }
    },

    /**
     * @param {cc.Point} pos
     */
    turnOnTile:function (pos) {
        this.setTile(pos, this.originalTile(pos));
    },

    /**
     * @param {cc.Point} pos
     */
    turnOffTile:function (pos) {
        this.setTile(pos, new cc.Quad3());
    },

    /**
     * @param {cc.Node} target
     */
    startWithTarget:function (target) {
        this._super(target);

        this._tilesCount = this._gridSize.width * this._gridSize.height;
        this._tilesOrder = [];

        for (var i = 0; i < this._tilesCount; ++i)
            this._tilesOrder[i] = i;

        this.shuffle(this._tilesOrder, this._tilesCount);
    },

    /**
     * @param {Number} time
     */
    update:function (time) {
        var l = 0 | (time * this._tilesCount);
        for (var i = 0; i < this._tilesCount; i++) {
            var t = this._tilesOrder[i];
            var tilePos = cc.p(0 | (t / this._gridSize.height), t % (0 | this._gridSize.height));
            if (i < l)
                this.turnOffTile(tilePos);
            else
                this.turnOnTile(tilePos);
        }
    }
});

/**
 * creates the action with a random seed, the grid size and the duration
 * @param {Number} duration
 * @param {cc.Size} gridSize
 * @param {Number|Null} seed
 * @return {cc.TurnOffTiles}
 * @example
 * // example
 * // turnOffTiles without seed
 * var toff = cc.TurnOffTiles.create(this._duration, cc.size(x, y), );
 *
 * // turnOffTiles with seed
 * var toff = cc.TurnOffTiles.create(this._duration, cc.size(x, y), 0);
 */
cc.TurnOffTiles.create = function (duration, gridSize, seed) {
    seed = seed || 0;
    var action = new cc.TurnOffTiles();
    action.initWithDuration(duration, gridSize, seed);
    return action;
};

/**
 * cc.WavesTiles3D action.
 * @class
 * @extends cc.TiledGrid3DAction
 */
cc.WavesTiles3D = cc.TiledGrid3DAction.extend(/** @lends cc.WavesTiles3D# */{
    _waves:0,
    _amplitude:0,
    _amplitudeRate:0,

    /**
     * get amplitude of waves
     * @return {Number}
     */
    getAmplitude:function () {
        return this._amplitude;
    },

    /**
     * set amplitude of waves
     * @param {Number} amplitude
     */
    setAmplitude:function (amplitude) {
        this._amplitude = amplitude;
    },

    /**
     * get amplitude rate of waves
     * @return {Number}
     */
    getAmplitudeRate:function () {
        return this._amplitudeRate;
    },

    /**
     * set amplitude rate of waves
     * @param {Number} amplitudeRate
     */
    setAmplitudeRate:function (amplitudeRate) {
        this._amplitudeRate = amplitudeRate;
    },

    /**
     * initializes the action with a number of waves, the waves amplitude, the grid size and the duration
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
        for (var i = 0; i < this._gridSize.width; i++) {
            for (var j = 0; j < this._gridSize.height; j++) {
                var coords = this.originalTile(cc.p(i, j));
                coords.bl.z = (Math.sin(time * Math.PI * this._waves * 2 +
                    (coords.bl.y + coords.bl.x) * 0.01) * this._amplitude * this._amplitudeRate);
                coords.br.z = coords.bl.z;
                coords.tl.z = coords.bl.z;
                coords.tr.z = coords.bl.z;
                this.setTile(cc.p(i, j), coords);
            }
        }
    }
});

/**
 * creates the action with a number of waves, the waves amplitude, the grid size and the duration
 * @param {Number} duration
 * @param {cc.Size} gridSize
 * @param {Number} waves
 * @param {Number} amplitude
 * @return {cc.FadeOutDownTiles}
 */
cc.WavesTiles3D.create = function (duration, gridSize, waves, amplitude) {
    var action = new cc.WavesTiles3D();
    action.initWithDuration(duration, gridSize, waves, amplitude);
    return action;
};

/**
 * cc.JumpTiles3D action.  A sin function is executed to move the tiles across the Z axis
 * @class
 * @extends cc.TiledGrid3DAction
 */
cc.JumpTiles3D = cc.TiledGrid3DAction.extend(/** @lends cc.JumpTiles3D# */{
    _jumps:0,
    _amplitude:0,
    _amplitudeRate:0,

    /**
     * get amplitude of the sin
     * @return {Number}
     */
    getAmplitude:function () {
        return this._amplitude;
    },

    /**
     * set amplitude of the sin
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
     * @param amplitudeRate
     */
    setAmplitudeRate:function (amplitudeRate) {
        this._amplitudeRate = amplitudeRate;
    },

    /**
     * initializes the action with the number of jumps, the sin amplitude, the grid size and the duration
     * @param {Number} duration
     * @param {cc.Size} gridSize
     * @param {Number} numberOfJumps
     * @param {Number} amplitude
     */
    initWithDuration:function (duration, gridSize, numberOfJumps, amplitude) {
        if (this._super(duration, gridSize)) {
            this._jumps = numberOfJumps;
            this._amplitude = amplitude;
            this._amplitudeRate = 1.0;
            return true;
        }
        return false;
    },

    update:function (time) {
        var sinz = (Math.sin(Math.PI * time * this._jumps * 2) * this._amplitude * this._amplitudeRate );
        var sinz2 = (Math.sin(Math.PI * (time * this._jumps * 2 + 1)) * this._amplitude * this._amplitudeRate );

        for (var i = 0; i < this._gridSize.width; i++) {
            for (var j = 0; j < this._gridSize.height; j++) {
                var coords = this.originalTile(cc.p(i, j));

                if (((i + j) % 2) == 0) {
                    coords.bl.z += sinz;
                    coords.br.z += sinz;
                    coords.tl.z += sinz;
                    coords.tr.z += sinz;
                } else {
                    coords.bl.z += sinz2;
                    coords.br.z += sinz2;
                    coords.tl.z += sinz2;
                    coords.tr.z += sinz2;
                }

                this.setTile(cc.p(i, j), coords);
            }
        }
    }
});

/**
 * creates the action with the number of jumps, the sin amplitude, the grid size and the duration
 * @param {Number} duration
 * @param {cc.Size} gridSize
 * @param {Number} numberOfJumps
 * @param {Number} amplitude
 * @return {cc.JumpTiles3D}
 */
cc.JumpTiles3D.create = function (duration, gridSize, numberOfJumps, amplitude) {
    var action = new cc.JumpTiles3D();
    action.initWithDuration(duration, gridSize, numberOfJumps, amplitude);
    return action;
};

/**
 * cc.SplitRows action
 * @class
 * @extends cc.TiledGrid3DAction
 */
cc.SplitRows = cc.TiledGrid3DAction.extend(/** @lends cc.SplitRows# */{
    _rows:0,
    _winSize:null,

    /**
     * initializes the action with the number of rows to split and the duration
     * @param {Number} duration
     * @param {Number} rows
     * @return {Boolean}
     */
    initWithDuration:function (duration, rows) {
        this._rows = rows;

        return this._super(duration, cc.SizeMake(1, this._rows));
    },

    update:function (time) {
        for (var j = 0; j < this._gridSize.height; ++j) {
            var coords = this.originalTile(cc.p(0, j));
            var direction = 1;

            if ((j % 2 ) == 0)
                direction = -1;

            coords.bl.x += direction * this._winSize.width * time;
            coords.br.x += direction * this._winSize.width * time;
            coords.tl.x += direction * this._winSize.width * time;
            coords.tr.x += direction * this._winSize.width * time;

            this.setTile(cc.p(0, j), coords);
        }
    },

    startWithTarget:function (target) {
        this._super(target);
        this._winSize = cc.Director.getInstance().getWinSizeInPixels();
    }
});

/**
 * creates the action with the number of rows to split and the duration
 * @param {Number} duration
 * @param {Number} rows
 * @return {cc.SplitRows}
 */
cc.SplitRows.create = function (duration, rows) {
    var action = new cc.SplitRows();
    action.initWithDuration(duration, rows);
    return action;
};

/**
 * cc.SplitCols action
 * @class
 * @extends cc.TiledGrid3DAction
 */
cc.SplitCols = cc.TiledGrid3DAction.extend(/** @lends cc.SplitCols# */{
    _cols:0,
    _winSize:null,

    /**
     * initializes the action with the number of columns to split and the duration
     * @param {Number} duration
     * @param {Number} cols
     * @return {Boolean}
     */
    initWithDuration:function (duration, cols) {
        this._cols = cols;
        return this._super(duration, cc.SizeMake(this._cols, 1));
    },

    update:function (time) {
        for (var i = 0; i < this._gridSize.width; ++i) {
            var coords = this.originalTile(cc.p(i, 0));
            var direction = 1;

            if ((i % 2 ) == 0)
                direction = -1;

            coords.bl.y += direction * this._winSize.height * time;
            coords.br.y += direction * this._winSize.height * time;
            coords.tl.y += direction * this._winSize.height * time;
            coords.tr.y += direction * this._winSize.height * time;

            this.setTile(cc.p(i, 0), coords);
        }
    },

    startWithTarget:function (target) {
        this._super(target);
        this._winSize = cc.Director.getInstance().getWinSizeInPixels();
    }
});

/**
 *
 * @param duration
 * @param cols
 * @return {cc.SplitCols}
 */
cc.SplitCols.create = function (duration, cols) {
    var action = new cc.SplitCols();
    action.initWithDuration(duration, cols);
    return action;
};

