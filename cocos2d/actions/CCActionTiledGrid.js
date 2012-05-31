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


/** @brief cc.TurnOffTiles action.
 Turn off the files in random order
 */
cc.TurnOffTiles = cc.TiledGrid3DAction.extend({
    _seed:null,
    _tilesCount:0,
    _tilesOrder:[],
    /** initializes the action with a random seed, the grid size and the duration */
    initWithSeed:function (s, gridSize, duration) {
        if (this.initWithSize(gridSize, duration)) {
            this._seed = s;
            this._tilesOrder = null;

            return true;
        }

        return false;
    },
    shuffle:function (array, len) {
        var i;
        for (i = len - 1; i >= 0; i--) {
            var j = parseInt(Math.random()*(i + 1));
            var v = array[i];
            array[i] = array[j];
            array[j] = v;
        }
    },
    turnOnTile:function (pos) {
        this.setTile(pos, this.originalTile(pos));
    },
    turnOffTile:function (pos) {
        var coords = new cc.Quad3();
        this.setTile(pos, coords);
    },
    startWithTarget:function (target) {
        var i;

        this._super(target);

        if (this._seed != -1) {
            parseInt(Math.random() * this._seed);
        }
        this._tilesCount = this._gridSize.x * this._gridSize.y;
        this._tilesOrder = [];

        for (i = 0; i < this._tilesCount; ++i) {
            this._tilesOrder[i] = i;
        }

        this.shuffle(this._tilesOrder, this._tilesCount);
    },
    update:function (time) {
        var i, l, t;

        l = time * this._tilesCount;

        for (i = 0; i < this._tilesCount; i++) {
            t = this._tilesOrder[i];
            var tilePos = cc.ccg(t / this._gridSize.y, t % this._gridSize.y);

            if (i < l) {
                this.turnOffTile(tilePos);
            }
            else {
                this.turnOnTile(tilePos);
            }
        }
    }

});
/** creates the action with the grid size and the duration */
cc.TurnOffTiles.actionWithSize = function (size, d) {
    var action = new cc.TurnOffTiles();
    action.initWithSize(size, d)
    return action;
};
/** creates the action with a random seed, the grid size and the duration */
cc.TurnOffTiles.actionWithSeed = function (s, gridSize, duration) {
    var action = new cc.TurnOffTiles();
    action.initWithSeed(s, gridSize, duration)
    return action;
};