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

/** @brief Base class for Grid actions */
cc.GridAction = cc.ActionInterval.extend({
    _m_sGridSize:null,
    copyWithZone:function (pZone) {
        var pNewZone = null;
        var pCopy = null;
        if (pZone && pZone.m_pCopyObject) {
            //in case of being called at sub class
            pCopy = pZone.m_pCopyObject;
        }
        else {
            pCopy = new cc.GridAction();
            pZone = pNewZone = new cc.Zone(pCopy);
        }
        cc.ActionInterval.copyWithZone(pZone);
        pCopy.initWithSize(this._m_sGridSize, this._m_fDuration);
        return pCopy;
    },

    startWithTarget:function (pTarget) {
        cc.ActionInterval.startWithTarget(pTarget);
        var newgrid = this.getGrid();
        var t = this._m_pTarget;
        var targetGrid = t.getGrid();
        if (targetGrid && targetGrid.getReuseGrid() > 0) {
            if (targetGrid.isActive() && targetGrid.getGridSize().x == this._m_sGridSize.x && targetGrid.getGridSize().y == this._m_sGridSize.y) {
                targetGrid.reuse();
            }
            else {
                cc.Assert(0, "");
            }
        }
        else {
            if (targetGrid && targetGrid.isActive()) {
                targetGrid.setActive(false);
            }
            t.setGrid(newgrid);
            t.getGrid().setActive(true);
        }
    },

    reverse:function () {
        return cc.ReverseTime.actionWithAction(this);
    },

    /** initializes the action with size and duration */
    initWithSize:function (gridSize, duration) {
        if (cc.ActionInterval.initWithDuration(duration)) {
            this._m_sGridSize = gridSize;
            return true;
        }
        return false;
    },

    /** returns the grid */
    getGrid:function () {
        // Abstract class needs implementation
        cc.Assert(0, "");
        return null;
    }
});

/** creates the action with size and duration */
cc.GridAction.actionWithSize = function (gridSize, duration) {
    var pAction = new cc.GridAction();
    return pAction;
},

/**
 @brief Base class for cc.Grid3D actions.
 Grid3D actions can modify a non-tiled grid.
 */
    cc.Grid3DAction = cc.GridAction.extend({
        /** returns the grid */
        getGrid:function () {
            return cc.Grid3D.gridWithSize(this._m_sGridSize);
        },

        /** returns the vertex than belongs to certain position in the grid */
        vertex:function (pos) {
            var g = this._m_pTarget.getGrid();
            return g.vertex(pos);
        },

        /** returns the non-transformed vertex than belongs to certain position in the grid */
        originalVertex:function (pos) {
            var g = this._m_pTarget.getGrid();
            return g.originalVertex(pos);
        },

        /** sets a new vertex to a certain position of the grid */
        setVertex:function (pos, vertex) {
            var g = this._m_pTarget.getGrid();
            g.setVertex(pos, vertex);
        }
    });
/** creates the action with size and duration */
cc.Grid3DAction.actionWithSize = function (gridSize, duration) {

};
/** @brief Base class for cc.TiledGrid3D actions */
cc.TiledGrid3DAction = cc.GridAction.extend({
    /** returns the tile that belongs to a certain position of the grid */
    tile:function (pos) {
        var g = this._m_pTarget.getGrid();
        return g.tile(pos);
    },

    /** returns the non-transformed tile that belongs to a certain position of the grid */
    originalTile:function (pos) {
        var g = this._m_pTarget.getGrid();
        return g.originalTile(pos);
    },

    /** sets a new tile to a certain position of the grid */
    setTile:function (pos, coords) {
        var g = this._m_pTarget.getGrid();
        return g.setTile(pos, coords);
    },

    /** returns the grid */
    getGrid:function () {
        return cc.TiledGrid3D.gridWithSize(this._m_sGridSize);
    }
});

/** creates the action with size and duration */
cc.TiledGrid3DAction.actionWithSize = function (gridSize, duration) {

};

/** @brief cc.AccelDeccelAmplitude action */
cc.AccelDeccelAmplitude = cc.ActionInterval.extend({
    _m_fRate:null,
    _m_pOther:null,
    /** initializes the action with an inner action that has the amplitude property, and a duration time */
    initWithAction:function (pAction, duration) {
        if (cc.ActionInterval.initWithDuration(duration)) {
            this._m_fRate = 1.0;
            this._m_pOther = pAction;
            return true;
        }
        return false;
    },

    startWithTarget:function (pTarget) {
        cc.ActionInterval.startWithTarget(pTarget);
        this._m_pOther.startWithTarget(pTarget);
    },

    update:function (time) {
        var f = time * 2;
        if (f > 1) {
            f -= 1;
            f = 1 - f;
        }
        this._m_pOther.setAmplitudeRate(Math.pow(f, this._m_fRate));
    },

    reverse:function () {
        return cc.AccelDeccelAmplitude.actionWithAction(this._m_pOther.reverse(), this._m_fDuration);
    },

    /** get amplitude rate */
    getRate:function () {
        return this._m_fRate;
    },

    /** set amplitude rate */
    setRate:function (fRate) {
        this._m_fRate = fRate;
    }
});

/** creates the action with an inner action that has the amplitude property, and a duration time */
cc.AccelDeccelAmplitude.actionWithAction = function (pAction, duration) {
    var pRet = new cc.AccelDeccelAmplitude();
    return pRet;
};

/** @brief cc.AccelAmplitude action */
cc.AccelAmplitude = cc.ActionInterval.extend({
    _m_fRate:null,
    _m_pOther:null,
    /** initializes the action with an inner action that has the amplitude property, and a duration time */
    initWithAction:function (pAction, duration) {
        if (cc.ActionInterval.initWithDuration(duration)) {
            this._m_fRate = 1.0;
            this._m_pOther = pAction;

            return true;
        }
        return false;
    },

    /** get amplitude rate */
    getRate:function () {
        return this._m_fRate;
    },

    /** set amplitude rate */
    setRate:function (fRate) {
        this._m_fRate = fRate;
    },

    startWithTarget:function (pTarget) {
        cc.ActionInterval.startWithTarget(pTarget);
        this._m_pOther.startWithTarget(pTarget);
    },

    update:function (time) {

        this._m_pOther.setAmplitudeRate(Math.pow(time, this._m_fRate));
        this._m_pOther.update(time);
    },

    reverse:function () {
        return cc.AccelAmplitude.actionWithAction(this._m_pOther.reverse(), this._m_fDuration);
    }
});

/** creates the action with an inner action that has the amplitude property, and a duration time */
cc.AccelAmplitude.actionWithAction = function (pAction, duration) {
    var pRet = new cc.AccelAmplitude();
    return pRet;
};

/** @brief cc.DeccelAmplitude action */
cc.DeccelAmplitude = cc.ActionInterval.extend({
    _m_fRate:null,
    _m_pOther:null,
    /** initializes the action with an inner action that has the amplitude property, and a duration time */
    initWithAction:function (pAction, duration) {
        if (cc.ActionInterval.initWithDuration(duration)) {
            this._m_fRate = 1.0;
            this._m_pOther = pAction;
            return true;
        }

        return false;
    },

    /** get amplitude rate */
    getRate:function () {
        return this._m_fRate;
    },

    /** set amplitude rate */
    setRate:function (fRate) {
        this._m_fRate = fRate;
    },

    startWithTarget:function (pTarget) {
        cc.ActionInterval.startWithTarget(pTarget);
        this._m_pOther.startWithTarget(pTarget);
    },

    update:function (time) {
        this._m_pOther.setAmplitudeRate(Math.pow((1 - time), this._m_fRate));
        this._m_pOther.update(time);
    },

    reverse:function () {
        return cc.DeccelAmplitude.actionWithAction(this._m_pOther.reverse(), this._m_fDuration);
    }
});

/** creates the action with an inner action that has the amplitude property, and a duration time */
cc.DeccelAmplitude.actionWithAction = function (pAction, duration) {
    var pRet = new cc.DeccelAmplitude();
    return pRet;
};

/** @brief cc.StopGrid action.
 @warning Don't call this action if another grid action is active.
 Call if you want to remove the the grid effect. Example:
 cc.Sequence.actions(Lens.action(...), cc.StopGrid.action(...), null);
 */
cc.StopGrid = cc.ActionInstant.extend({
    startWithTarget:function (pTarget) {
        cc.ActionInstant.startWithTarget(pTarget);

        var pGrid = this._m_pTarget.getGrid();
        if (pGrid && pGrid.isActive()) {
            pGrid.setActive(false);
        }
    }
});

/** Allocates and initializes the action */
cc.StopGrid.action = function () {
    var pAction = new cc.StopGrid();
    return pAction;
};

/** @brief cc.ReuseGrid action */
cc.ReuseGrid = cc.ActionInstant.extend({
    _m_nTimes:null,
    /** initializes an action with the number of times that the current grid will be reused */
    initWithTimes:function (times) {
        this._m_nTimes = times;

        return true;
    },

    startWithTarget:function (pTarget) {
        cc.ActionInstant.startWithTarget(pTarget);

        if (this._m_pTarget.getGrid() && this.__m_pTarget.getGrid().isActive()) {
            this._m_pTarget.getGrid().setReuseGrid(this.__m_pTarget.getGrid().getReuseGrid() + this._m_nTimes);
        }
    }

});

/** creates an action with the number of times that the current grid will be reused */
cc.ReuseGrid.actionWithTimes = function (times) {
    var pAction = new cc.ReuseGrid();
    return pAction;
};