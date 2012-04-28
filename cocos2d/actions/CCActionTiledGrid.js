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
    _m_nSeed:null,
    _m_nTilesCount:0,
    _m_pTilesOrder:[],
    /** initializes the action with a random seed, the grid size and the duration */
    initWithSeed:function (s, gridSize, duration) {
        if (this.initWithSize(gridSize, duration)) {
            this._m_nSeed = s;
            this._m_pTilesOrder = null;

            return true;
        }

        return false;
    },
    shuffle:function (pArray, nLen) {
        var i;
        for (i = nLen - 1; i >= 0; i--) {
            var j = parseInt(Math.random()*(i + 1));
            var v = pArray[i];
            pArray[i] = pArray[j];
            pArray[j] = v;
        }
    },
    turnOnTile:function (pos) {
        this.setTile(pos, this.originalTile(pos));
    },
    turnOffTile:function (pos) {
        var coords = new cc.Quad3();
        this.setTile(pos, coords);
    },
    startWithTarget:function (pTarget) {
        var i;

        this._super(pTarget);

        if (this._m_nSeed != -1) {
            parseInt(Math.random() * this._m_nSeed);
        }
        this._m_nTilesCount = this._m_sGridSize.x * this._m_sGridSize.y;
        this._m_pTilesOrder = [];

        for (i = 0; i < this._m_nTilesCount; ++i) {
            this._m_pTilesOrder[i] = i;
        }

        this.shuffle(this._m_pTilesOrder, this._m_nTilesCount);
    },
    update:function (time) {
        var i, l, t;

        l = time * this._m_nTilesCount;

        for (i = 0; i < this._m_nTilesCount; i++) {
            t = this._m_pTilesOrder[i];
            var tilePos = cc.ccg(t / this._m_sGridSize.y, t % this._m_sGridSize.y);

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
    var pAction = new cc.TurnOffTiles();
    pAction.initWithSize(size, d)
    return pAction;
};
/** creates the action with a random seed, the grid size and the duration */
cc.TurnOffTiles.actionWithSeed = function (s, gridSize, duration) {
    var pAction = new cc.TurnOffTiles();
    pAction.initWithSeed(s, gridSize, duration)
    return pAction;
};