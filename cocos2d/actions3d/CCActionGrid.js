/****************************************************************************
 Copyright (c) 2010-2013 cocos2d-x.org
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
 * Base class for Grid actions
 * @class
 * @extends cc.ActionInterval
 */
cc.GridAction = cc.ActionInterval.extend(/** @lends cc.GridAction# */{
    _gridSize:null,

    ctor:function(){
        cc.ActionInterval.prototype.ctor.call(this);
        this._gridSize = cc.size(0,0);
    },

    clone:function(){
        var action = new cc.GridAction();
        var locGridSize = this._gridSize;
        action.initWithDuration(this._duration, cc.size(locGridSize.width, locGridSize.height));
        return action;
    },

    startWithTarget:function (target) {
        cc.ActionInterval.prototype.startWithTarget.call(this, target);
        var newGrid = this.getGrid();
        var t = this._target;
        var targetGrid = t.getGrid();
        if (targetGrid && targetGrid.getReuseGrid() > 0) {
            var locGridSize = targetGrid.getGridSize();
            if (targetGrid.isActive() && (locGridSize.width == this._gridSize.width) && (locGridSize.height == this._gridSize.height))
                targetGrid.reuse();
        } else {
            if (targetGrid && targetGrid.isActive())
                targetGrid.setActive(false);
            t.setGrid(newGrid);
            t.getGrid().setActive(true);
        }
    },

    reverse:function () {
        return cc.ReverseTime.create(this);
    },

    /**
     * initializes the action with size and duration
     * @param {Number} duration
     * @param {cc.Size} gridSize
     * @return {Boolean}
     */
    initWithDuration:function (duration, gridSize) {
        if (cc.ActionInterval.prototype.initWithDuration.call(this, duration)) {
            this._gridSize.width = gridSize.width;
            this._gridSize.height = gridSize.height;
            return true;
        }
        return false;
    },

    /**
     * returns the grid
     * @return {cc.GridBase}
     */
    getGrid:function () {
        // Abstract class needs implementation
        cc.log("cc.GridAction.getGrid(): it should be overridden in subclass.");
    }
});

/**
 * creates the action with size and duration
 * @param {Number} duration
 * @param {cc.Size} gridSize
 * @return {cc.GridAction}
 */
cc.GridAction.create = function (duration, gridSize) {
    var action = new cc.GridAction();
    action.initWithDuration(duration, gridSize);
    return action;
};

/**
 * Base class for cc.Grid3D actions.                     <br/>
 * Grid3D actions can modify a non-tiled grid.
 * @class
 * @extends cc.GridAction
 */
cc.Grid3DAction = cc.GridAction.extend(/** @lends cc.GridAction# */{
    /**
     * returns the grid
     * @return {cc.GridBase}
     */
    getGrid:function () {
        return cc.Grid3D.create(this._gridSize);
    },

    /**
     * returns the vertex than belongs to certain position in the grid
     * @param {cc.Point} position
     * @return {cc.Vertex3F}
     */
    vertex:function (position) {
        return this._target.getGrid().vertex(position);
    },

    /**
     * returns the non-transformed vertex than belongs to certain position in the grid
     * @param {cc.Point} position
     * @return {*}
     */
    originalVertex:function (position) {
        return this._target.getGrid().originalVertex(position);
    },

    /**
     * sets a new vertex to a certain position of the grid
     * @param {cc.Point} position
     * @param {cc.Vertex3F} vertex
     */
    setVertex:function (position, vertex) {
        this._target.getGrid().setVertex(position, vertex);
    }
});

/**
 * creates the action with size and duration
 * @param {Number} duration
 * @param {cc.Size} gridSize
 * @return {cc.Grid3DAction}
 */
cc.Grid3DAction.create = function (duration,gridSize) {
    var action = new cc.Grid3DAction();
    action.initWithDuration(duration,gridSize);
    return action;
};

/**
 * Base class for cc.TiledGrid3D actions
 * @class
 * @extends cc.GridAction
 */
cc.TiledGrid3DAction = cc.GridAction.extend(/** @lends cc.TiledGrid3DAction# */{
    /**
     * returns the tile that belongs to a certain position of the grid
     * @param {cc.Point} position
     * @return {cc.Quad3}
     */
    tile:function (position) {
        return this._target.getGrid().tile(position);
    },

    /**
     * returns the non-transformed tile that belongs to a certain position of the grid
     * @param {cc.Point} position
     * @return {cc.Quad3}
     */
    originalTile:function (position) {
        return this._target.getGrid().originalTile(position);
    },

    /**
     * sets a new tile to a certain position of the grid
     * @param {cc.Point} position
     * @param {cc.Quad3} coords
     */
    setTile:function (position, coords) {
        this._target.getGrid().setTile(position, coords);
    },

    /**
     * returns the grid
     * @return {cc.GridBase}
     */
    getGrid:function () {
        return cc.TiledGrid3D.create(this._gridSize);
    }
});

/**
 * creates the action with size and duration
 * @param {Number} duration
 * @param {cc.Size} gridSize
 * @return {cc.TiledGrid3DAction}
 */
cc.TiledGrid3DAction.create = function (duration, gridSize) {
     var ret = new cc.TiledGrid3DAction();
    ret.initWithDuration(duration, gridSize);
    return ret;
};

/**
 * <p>
 * cc.StopGrid action.                                                               <br/>
 * @warning Don't call this action if another grid action is active.                 <br/>
 * Call if you want to remove the the grid effect. Example:                          <br/>
 * cc.Sequence.create(Lens.action(...), cc.StopGrid.create(...), null);              <br/>
 * </p>
 * @class
 * @extends cc.ActionInstant
 */
cc.StopGrid = cc.ActionInstant.extend(/** @lends cc.StopGrid# */{
    startWithTarget:function (target) {
        cc.ActionInstant.prototype.startWithTarget.call(this, target);
        var grid = this._target.getGrid();
        if (grid && grid.isActive())
            grid.setActive(false);
    }
});

/**
 * Allocates and initializes the action
 * @return {cc.StopGrid}
 */
cc.StopGrid.create = function () {
    return new cc.StopGrid();
};

/**
 * cc.ReuseGrid action
 * @class
 * @extends cc.ActionInstant
 */
cc.ReuseGrid = cc.ActionInstant.extend(/** @lends cc.ReuseGrid# */{
    _times:null,

    /**
     * initializes an action with the number of times that the current grid will be reused
     * @param {Number} times
     * @return {Boolean}
     */
    initWithTimes:function (times) {
        this._times = times;
        return true;
    },

    startWithTarget:function (target) {
        cc.ActionInstant.prototype.startWithTarget.call(this, target);
        if (this._target.getGrid() && this._target.getGrid().isActive())
            this._target.getGrid().setReuseGrid(this._target.getGrid().getReuseGrid() + this._times);
    }
});

/**
 * creates an action with the number of times that the current grid will be reused
 * @param {Number} times
 * @return {cc.ReuseGrid}
 */
cc.ReuseGrid.create = function (times) {
    return new cc.ReuseGrid();
};
