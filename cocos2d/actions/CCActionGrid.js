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
    _gridSize:null,
    startWithTarget:function (target) {
        this._super(target);
        var newgrid = this.getGrid();
        var t = this._target;
        var targetGrid = t.getGrid();
        if (targetGrid && targetGrid.getReuseGrid() > 0) {
            if (targetGrid.isActive() && targetGrid.getGridSize().x == this._gridSize.x && targetGrid.getGridSize().y == this._gridSize.y) {
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
        return cc.ReverseTime.create(this);
    },

    /** initializes the action with size and duration */
    initWithSize:function (gridSize, duration) {
        if (this.initWithDuration(duration)) {
            this._gridSize = gridSize;
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
cc.GridAction.create = function (gridSize, duration) {
    var action = new cc.GridAction();
    action.initWithSize(gridSize, duration)
    return action;
},

/**
 @brief Base class for cc.Grid3D actions.
 Grid3D actions can modify a non-tiled grid.
 */
    cc.Grid3DAction = cc.GridAction.extend({
        /** returns the grid */
        getGrid:function () {
            return cc.Grid3D.create(this._gridSize);
        },

        /** returns the vertex than belongs to certain position in the grid */
        vertex:function (pos) {
            var g = this._target.getGrid();
            return g.vertex(pos);
        },

        /** returns the non-transformed vertex than belongs to certain position in the grid */
        originalVertex:function (pos) {
            var g = this._target.getGrid();
            return g.originalVertex(pos);
        },

        /** sets a new vertex to a certain position of the grid */
        setVertex:function (pos, vertex) {
            var g = this._target.getGrid();
            g.setVertex(pos, vertex);
        }
    });
/** creates the action with size and duration */
cc.Grid3DAction.create = function () {

};
/** @brief Base class for cc.TiledGrid3D actions */
cc.TiledGrid3DAction = cc.GridAction.extend({
    /** returns the tile that belongs to a certain position of the grid */
    tile:function (pos) {
        var g = this._target.getGrid();
        return g.tile(pos);
    },

    /** returns the non-transformed tile that belongs to a certain position of the grid */
    originalTile:function (pos) {
        var g = this._target.getGrid();
        return g.originalTile(pos);
    },

    /** sets a new tile to a certain position of the grid */
    setTile:function (pos, coords) {
        var g = this._target.getGrid();
        return g.setTile(pos, coords);
    },

    /** returns the grid */
    getGrid:function () {
        return cc.TiledGrid3D.create(this._gridSize);
    }
});

/** creates the action with size and duration */
cc.TiledGrid3DAction.create = function (gridSize, duration) {

};

/** @brief cc.AccelDeccelAmplitude action */
cc.AccelDeccelAmplitude = cc.ActionInterval.extend({
    _rate:null,
    _other:null,
    /** initializes the action with an inner action that has the amplitude property, and a duration time */
    initWithAction:function (action, duration) {
        if (cc.ActionInterval.initWithDuration(duration)) {
            this._rate = 1.0;
            this._other = action;
            return true;
        }
        return false;
    },

    startWithTarget:function (target) {
        cc.ActionInterval.startWithTarget(target);
        this._other.startWithTarget(target);
    },

    update:function (time) {
        var f = time * 2;
        if (f > 1) {
            f -= 1;
            f = 1 - f;
        }
        this._other.setAmplitudeRate(Math.pow(f, this._rate));
    },

    reverse:function () {
        return cc.AccelDeccelAmplitude.create(this._other.reverse(), this._duration);
    },

    /** get amplitude rate */
    getRate:function () {
        return this._rate;
    },

    /** set amplitude rate */
    setRate:function (rate) {
        this._rate = rate;
    }
});

/** creates the action with an inner action that has the amplitude property, and a duration time */
cc.AccelDeccelAmplitude.create = function (action, duration) {
    var ret = new cc.AccelDeccelAmplitude();
    return ret;
};

/** @brief cc.AccelAmplitude action */
cc.AccelAmplitude = cc.ActionInterval.extend({
    _rate:null,
    _other:null,
    /** initializes the action with an inner action that has the amplitude property, and a duration time */
    initWithAction:function (action, duration) {
        if (cc.ActionInterval.initWithDuration(duration)) {
            this._rate = 1.0;
            this._other = action;

            return true;
        }
        return false;
    },

    /** get amplitude rate */
    getRate:function () {
        return this._rate;
    },

    /** set amplitude rate */
    setRate:function (rate) {
        this._rate = rate;
    },

    startWithTarget:function (target) {
        cc.ActionInterval.startWithTarget(target);
        this._other.startWithTarget(target);
    },

    update:function (time) {

        this._other.setAmplitudeRate(Math.pow(time, this._rate));
        this._other.update(time);
    },

    reverse:function () {
        return cc.AccelAmplitude.create(this._other.reverse(), this._duration);
    }
});

/** creates the action with an inner action that has the amplitude property, and a duration time */
cc.AccelAmplitude.create = function (action, duration) {
    var ret = new cc.AccelAmplitude();
    return ret;
};

/** @brief cc.DeccelAmplitude action */
cc.DeccelAmplitude = cc.ActionInterval.extend({
    _rate:null,
    _other:null,
    /** initializes the action with an inner action that has the amplitude property, and a duration time */
    initWithAction:function (action, duration) {
        if (cc.ActionInterval.initWithDuration(duration)) {
            this._rate = 1.0;
            this._other = action;
            return true;
        }

        return false;
    },

    /** get amplitude rate */
    getRate:function () {
        return this._rate;
    },

    /** set amplitude rate */
    setRate:function (rate) {
        this._rate = rate;
    },

    startWithTarget:function (target) {
        cc.ActionInterval.startWithTarget(target);
        this._other.startWithTarget(target);
    },

    update:function (time) {
        this._other.setAmplitudeRate(Math.pow((1 - time), this._rate));
        this._other.update(time);
    },

    reverse:function () {
        return cc.DeccelAmplitude.create(this._other.reverse(), this._duration);
    }
});

/** creates the action with an inner action that has the amplitude property, and a duration time */
cc.DeccelAmplitude.create = function (action, duration) {
    var ret = new cc.DeccelAmplitude();
    return ret;
};

/** @brief cc.StopGrid action.
 @warning Don't call this action if another grid action is active.
 Call if you want to remove the the grid effect. Example:
 cc.Sequence.create(Lens.action(...), cc.StopGrid.create(...), null);
 */
cc.StopGrid = cc.ActionInstant.extend({
    startWithTarget:function (target) {
        this._super(target);
        var grid = this._target.getGrid();
        if (grid && grid.isActive()) {
            grid.setActive(false);
        }
    }
});

/** Allocates and initializes the action */
cc.StopGrid.create = function () {
    var action = new cc.StopGrid();
    return action;
};

/** @brief cc.ReuseGrid action */
cc.ReuseGrid = cc.ActionInstant.extend({
    _times:null,
    /** initializes an action with the number of times that the current grid will be reused */
    initWithTimes:function (times) {
        this._times = times;

        return true;
    },

    startWithTarget:function (target) {
        cc.ActionInstant.startWithTarget(target);

        if (this._target.getGrid() && this._target.getGrid().isActive()) {
            this._target.getGrid().setReuseGrid(this._target.getGrid().getReuseGrid() + this._times);
        }
    }

});

/** creates an action with the number of times that the current grid will be reused */
cc.ReuseGrid.create = function (times) {
    var action = new cc.ReuseGrid();
    return action;
};
