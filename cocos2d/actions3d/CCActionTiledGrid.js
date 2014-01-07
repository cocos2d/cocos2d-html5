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

    ctor:function () {
        cc.GridAction.prototype.ctor.call(this);
        this._randRange = 0;
        this._shakeZ = false;
    },

    /**
     * initializes the action with a range, whether or not to shake Z vertices, a grid size, and duration
     * @param {Number} duration
     * @param {cc.Size} gridSize
     * @param {Number} range
     * @param {Boolean} shakeZ
     * @return {Boolean}
     */
    initWithDuration:function (duration, gridSize, range, shakeZ) {
        if (cc.TiledGrid3DAction.prototype.initWithDuration.call(this, duration, gridSize)) {
            this._randRange = range;
            this._shakeZ = shakeZ;
            return true;
        }
        return false;
    },

    update:function (time) {
        var locGridSize = this._gridSize, locRandRange = this._randRange;
        var locPos = cc.p(0, 0);
        for (var i = 0; i < locGridSize.width; ++i) {
            for (var j = 0; j < locGridSize.height; ++j) {
                locPos.x = i;
                locPos.y = j;
                var coords = this.originalTile(locPos);

                // X
                coords.bl.x += ( cc.rand() % (locRandRange * 2) ) - locRandRange;
                coords.br.x += ( cc.rand() % (locRandRange * 2) ) - locRandRange;
                coords.tl.x += ( cc.rand() % (locRandRange * 2) ) - locRandRange;
                coords.tr.x += ( cc.rand() % (locRandRange * 2) ) - locRandRange;

                // Y
                coords.bl.y += ( cc.rand() % (locRandRange * 2) ) - locRandRange;
                coords.br.y += ( cc.rand() % (locRandRange * 2) ) - locRandRange;
                coords.tl.y += ( cc.rand() % (locRandRange * 2) ) - locRandRange;
                coords.tr.y += ( cc.rand() % (locRandRange * 2) ) - locRandRange;

                if (this._shakeZ) {
                    coords.bl.z += ( cc.rand() % (locRandRange * 2) ) - locRandRange;
                    coords.br.z += ( cc.rand() % (locRandRange * 2) ) - locRandRange;
                    coords.tl.z += ( cc.rand() % (locRandRange * 2) ) - locRandRange;
                    coords.tr.z += ( cc.rand() % (locRandRange * 2) ) - locRandRange;
                }

                this.setTile(locPos, coords);
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

    ctor:function () {
        cc.GridAction.prototype.ctor.call(this);
        this._randRange = 0;
        this._shakeZ = false;
        this._once = false;
    },

    /**
     * initializes the action with a range, whether or not to shatter Z vertices, a grid size and duration
     * @param {Number} duration
     * @param {cc.Size} gridSize
     * @param {Number} range
     * @param {Boolean} shatterZ
     * @return {Boolean}
     */
    initWithDuration:function (duration, gridSize, range, shatterZ) {
        if (cc.TiledGrid3DAction.prototype.initWithDuration.call(this, duration, gridSize)) {
            this._once = false;
            this._randRange = range;
            this._shatterZ = shatterZ;
            return true;
        }
        return false;
    },

    update:function (time) {
        if (this._once === false) {
            var locGridSize = this._gridSize, locRandRange = this._randRange;
            var coords, locPos = cc.p(0, 0);
            for (var i = 0; i < locGridSize.width; ++i) {
                for (var j = 0; j < locGridSize.height; ++j) {
                    locPos.x = i;
                    locPos.y = j;
                    coords = this.originalTile(locPos);

                    // X
                    coords.bl.x += ( cc.rand() % (locRandRange * 2) ) - locRandRange;
                    coords.br.x += ( cc.rand() % (locRandRange * 2) ) - locRandRange;
                    coords.tl.x += ( cc.rand() % (locRandRange * 2) ) - locRandRange;
                    coords.tr.x += ( cc.rand() % (locRandRange * 2) ) - locRandRange;

                    // Y
                    coords.bl.y += ( cc.rand() % (locRandRange * 2) ) - locRandRange;
                    coords.br.y += ( cc.rand() % (locRandRange * 2) ) - locRandRange;
                    coords.tl.y += ( cc.rand() % (locRandRange * 2) ) - locRandRange;
                    coords.tr.y += ( cc.rand() % (locRandRange * 2) ) - locRandRange;

                    if (this._shatterZ) {
                        coords.bl.z += ( cc.rand() % (locRandRange * 2) ) - locRandRange;
                        coords.br.z += ( cc.rand() % (locRandRange * 2) ) - locRandRange;
                        coords.tl.z += ( cc.rand() % (locRandRange * 2) ) - locRandRange;
                        coords.tr.z += ( cc.rand() % (locRandRange * 2) ) - locRandRange;
                    }
                    this.setTile(locPos, coords);
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
 * @param {cc.Point} [position=cc.Point_ZERO]
 * @param {cc.Point} [startPosition=cc.Point_ZERO]
 * @param {cc.Size} [delta=cc.Point_ZERO]
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
        cc.GridAction.prototype.ctor.call(this);
        this._tilesOrder = [];
        this._tiles = [];
        this._seed = 0;
        this._tilesCount = 0;
    },

    /**
     * initializes the action with a random seed, the grid size and the duration
     * @param {Number} duration
     * @param {cc.Size} gridSize
     * @param {Number} seed
     * @return {Boolean}
     */
    initWithDuration:function (duration, gridSize, seed) {
        if (cc.TiledGrid3DAction.prototype.initWithDuration.call(this, duration, gridSize)) {
            this._seed = seed;
            this._tilesOrder.length = 0;
            this._tiles.length = 0;
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
        var locGridSize = this._gridSize;
        var idx = pos.width * locGridSize.height + pos.height;
        return cc.size(((this._tilesOrder[idx] / locGridSize.height) - pos.width),
            ((this._tilesOrder[idx] % locGridSize.height) - pos.height));
    },

    /**
     * place Tile
     * @param {cc.Point} pos
     * @param {cc.Tile} tile
     */
    placeTile:function (pos, tile) {
        var coords = this.originalTile(pos);

        var step = this._target.getGrid().getStep();
        var locPosition = tile.position;
        coords.bl.x += (locPosition.x * step.x);
        coords.bl.y += (locPosition.y * step.y);

        coords.br.x += (locPosition.x * step.x);
        coords.br.y += (locPosition.y * step.y);

        coords.tl.x += (locPosition.x * step.x);
        coords.tl.y += (locPosition.y * step.y);

        coords.tr.x += (locPosition.x * step.x);
        coords.tr.y += (locPosition.y * step.y);

        this.setTile(pos, coords);
    },

    /**
     * start with target
     * @param {cc.Node} target
     */
    startWithTarget:function (target) {
        cc.TiledGrid3DAction.prototype.startWithTarget.call(this, target);
        var locGridSize = this._gridSize;

        this._tilesCount = locGridSize.width * locGridSize.height;
        var locTilesOrder = this._tilesOrder;
        locTilesOrder.length = 0;

        /**
         * Use k to loop. Because m_nTilesCount is unsigned int,
         * and i is used later for int.
         */
        for (var k = 0; k < this._tilesCount; ++k)
            locTilesOrder[k] = k;
        this.shuffle(locTilesOrder, this._tilesCount);

        var locTiles = this._tiles ;
        locTiles.length = 0;
        var tileIndex = 0, tempSize = cc.size(0,0);
        for (var i = 0; i < locGridSize.width; ++i) {
            for (var j = 0; j < locGridSize.height; ++j) {
                locTiles[tileIndex] = new cc.Tile();
                locTiles[tileIndex].position = cc.p(i, j);
                locTiles[tileIndex].startPosition = cc.p(i, j);
                tempSize.width = i;
                tempSize.height = j;
                locTiles[tileIndex].delta = this.getDelta(tempSize);
                ++tileIndex;
            }
        }
    },

    update:function (time) {
        var tileIndex = 0, locGridSize = this._gridSize, locTiles = this._tiles;
        var selTile, locPos = cc.p(0, 0);
        for (var i = 0; i < locGridSize.width; ++i) {
            for (var j = 0; j < locGridSize.height; ++j) {
                locPos.x = i;
                locPos.y = j;
                selTile = locTiles[tileIndex];
                selTile.position.x = selTile.delta.width * time;
                selTile.position.y = selTile.delta.height * time;
                this.placeTile(locPos, selTile);
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
        var locX = this._gridSize.width * time;
        var locY = this._gridSize.height * time;
        if ((locX + locY) == 0.0)
            return 1.0;
        return Math.pow((pos.width + pos.height) / (locX + locY), 6);
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
        var locGridSize = this._gridSize;
        var locPos = cc.p(0, 0), locSize = cc.size(0, 0), distance;
        for (var i = 0; i < locGridSize.width; ++i) {
            for (var j = 0; j < locGridSize.height; ++j) {
                locPos.x = i;
                locPos.y = j;
                locSize.width = i;
                locSize.height = j;
                distance = this.testFunc(locSize, time);
                if (distance == 0)
                    this.turnOffTile(locPos);
                else if (distance < 1)
                    this.transformTile(locPos, distance);
                else
                    this.turnOnTile(locPos);
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
        var locX = this._gridSize.width * (1.0 - time);
        var locY = this._gridSize.height * (1.0 - time);
        if ((pos.width + pos.height) == 0)
            return 1.0;

        return Math.pow((locX + locY) / (pos.width + pos.height), 6);
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
        var locY = this._gridSize.height * time;
        if (locY == 0.0)
            return 1.0;
        return Math.pow(pos.height / locY, 6);
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
        var locY = this._gridSize.height * (1.0 - time);
        if (pos.height == 0)
            return 1.0;
        return Math.pow(locY / pos.height, 6);
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
        cc.GridAction.prototype.ctor.call(this);
        this._tilesOrder = [];
        this._seed = null;
        this._tilesCount = 0;
    },

    /** initializes the action with a random seed, the grid size and the duration
     * @param {Number} duration
     * @param {cc.Size} gridSize
     * @param {Number} seed
     * @return {Boolean}
     */
    initWithDuration:function (duration, gridSize, seed) {
        if (cc.TiledGrid3DAction.prototype.initWithDuration.call(this, duration, gridSize)) {
            this._seed = seed;
            this._tilesOrder.length = 0;
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
        cc.TiledGrid3DAction.prototype.startWithTarget.call(this, target);

        this._tilesCount = this._gridSize.width * this._gridSize.height;
        var locTilesOrder = this._tilesOrder;
        locTilesOrder.length = 0;
        for (var i = 0; i < this._tilesCount; ++i)
            locTilesOrder[i] = i;
        this.shuffle(locTilesOrder, this._tilesCount);
    },

    /**
     * @param {Number} time
     */
    update:function (time) {
        var l = 0 | (time * this._tilesCount), locGridSize = this._gridSize;
        var t,tilePos = cc.p(0,0), locTilesOrder = this._tilesOrder;
        for (var i = 0; i < this._tilesCount; i++) {
            t = locTilesOrder[i];
            tilePos.x = 0 | (t / locGridSize.height);
            tilePos.y = t % (0 | locGridSize.height);
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
 * @param {Number|Null} [seed=0]
 * @return {cc.TurnOffTiles}
 * @example
 * // example
 * // turnOffTiles without seed
 * var toff = cc.TurnOffTiles.create(this._duration, cc.size(x, y));
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

    ctor:function () {
        cc.GridAction.prototype.ctor.call(this);
        this._waves = 0;
        this._amplitude = 0;
        this._amplitudeRate = 0;
    },

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
        if (cc.TiledGrid3DAction.prototype.initWithDuration.call(this, duration, gridSize)) {
            this._waves = waves;
            this._amplitude = amplitude;
            this._amplitudeRate = 1.0;
            return true;
        }
        return false;
    },

    update:function (time) {
        var locGridSize = this._gridSize, locWaves = this._waves, locAmplitude = this._amplitude, locAmplitudeRate = this._amplitudeRate;
        var locPos = cc.p(0, 0), coords;
        for (var i = 0; i < locGridSize.width; i++) {
            for (var j = 0; j < locGridSize.height; j++) {
                locPos.x = i;
                locPos.y = j;
                coords = this.originalTile(locPos);
                coords.bl.z = (Math.sin(time * Math.PI * locWaves * 2 +
                    (coords.bl.y + coords.bl.x) * 0.01) * locAmplitude * locAmplitudeRate);
                coords.br.z = coords.bl.z;
                coords.tl.z = coords.bl.z;
                coords.tr.z = coords.bl.z;
                this.setTile(locPos, coords);
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
 * @return {cc.WavesTiles3D}
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

    ctor:function () {
        cc.GridAction.prototype.ctor.call(this);
        this._jumps = 0;
        this._amplitude = 0;
        this._amplitudeRate = 0;
    },

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
        if (cc.TiledGrid3DAction.prototype.initWithDuration.call(this, duration, gridSize)) {
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

        var locGridSize = this._gridSize;
        var locGrid = this._target.getGrid();
        var coords, locPos = cc.p(0, 0);
        for (var i = 0; i < locGridSize.width; i++) {
            for (var j = 0; j < locGridSize.height; j++) {
                locPos.x = i;
                locPos.y = j;
                //hack for html5
                //var coords = this.originalTile(cc.p(i, j));
                coords = locGrid.originalTile(locPos);

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
                //hack for html5
                //this.setTile(cc.p(i, j), coords);
                locGrid.setTile(locPos, coords);
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

    ctor:function () {
        cc.GridAction.prototype.ctor.call(this);
        this._rows = 0;
        this._winSize = null;
    },

    /**
     * initializes the action with the number of rows to split and the duration
     * @param {Number} duration
     * @param {Number} rows
     * @return {Boolean}
     */
    initWithDuration:function (duration, rows) {
        this._rows = rows;
        return cc.TiledGrid3DAction.prototype.initWithDuration.call(this, duration, cc.size(1, rows));
    },

    update:function (time) {
        var locGridSize = this._gridSize, locWinSizeWidth = this._winSize.width;
        var coords, direction, locPos = cc.p(0, 0);
        for (var j = 0; j < locGridSize.height; ++j) {
            locPos.y = j;
            coords = this.originalTile(locPos);
            direction = 1;

            if ((j % 2 ) == 0)
                direction = -1;

            coords.bl.x += direction * locWinSizeWidth * time;
            coords.br.x += direction * locWinSizeWidth * time;
            coords.tl.x += direction * locWinSizeWidth * time;
            coords.tr.x += direction * locWinSizeWidth * time;

            this.setTile(locPos, coords);
        }
    },

    startWithTarget:function (target) {
        cc.TiledGrid3DAction.prototype.startWithTarget.call(this, target);
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

    ctor:function () {
        cc.GridAction.prototype.ctor.call(this);
        this._cols = 0;
        this._winSize = null;
    },
    /**
     * initializes the action with the number of columns to split and the duration
     * @param {Number} duration
     * @param {Number} cols
     * @return {Boolean}
     */
    initWithDuration:function (duration, cols) {
        this._cols = cols;
        return cc.TiledGrid3DAction.prototype.initWithDuration.call(this, duration, cc.size(cols, 1));
    },

    update:function (time) {
        var locGridSizeWidth = this._gridSize.width, locWinSizeHeight = this._winSize.height;
        var coords, direction, locPos = cc.p(0, 0);
        for (var i = 0; i < locGridSizeWidth; ++i) {
            locPos.x = i;
            coords = this.originalTile(locPos);
            direction = 1;

            if ((i % 2 ) == 0)
                direction = -1;

            coords.bl.y += direction * locWinSizeHeight * time;
            coords.br.y += direction * locWinSizeHeight * time;
            coords.tl.y += direction * locWinSizeHeight * time;
            coords.tr.y += direction * locWinSizeHeight * time;

            this.setTile(locPos, coords);
        }
    },

    /**
     * @param {cc.Node} target
     */
    startWithTarget:function (target) {
        cc.TiledGrid3DAction.prototype.startWithTarget.call(this, target);
        this._winSize = cc.Director.getInstance().getWinSizeInPixels();
    }
});

/**
 * creates the action with the number of columns to split and the duration
 * @param {Number} duration
 * @param {Number} cols
 * @return {cc.SplitCols}
 */
cc.SplitCols.create = function (duration, cols) {
    var action = new cc.SplitCols();
    action.initWithDuration(duration, cols);
    return action;
};