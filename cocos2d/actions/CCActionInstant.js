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
 * Instant actions are immediate actions. They don't have a duration like
 * the CCIntervalAction actions.
 * @class
 * @extends cc.FiniteTimeAction
 */
cc.ActionInstant = cc.FiniteTimeAction.extend(/** @lends cc.ActionInstant# */{
    /**
     * @return {Boolean}
     */
    isDone:function () {
        return true;
    },

    /**
     * @param {Number} dt
     */
    step:function (dt) {
        this.update(1);
    },

    /**
     * @param {Number} time
     */
    update:function (time) {
        //nothing
    },

    reverse:function(){
        return this.clone();
    },

    clone:function(){
        return new cc.ActionInstant();
    }
});

/**  Show the node
 * @class
 * @extends cc.ActionInstant
 */
cc.Show = cc.ActionInstant.extend(/** @lends cc.Show# */{
    /**
     * @param {Number} time
     */
    update:function (time) {
        this.target.visible = true;
    },

    /**
     * @return {cc.FiniteTimeAction}
     */
    reverse:function () {
        return cc.Hide.create();
    },

    clone:function(){
        return new cc.Show();
    }
});
/**
 * @return {cc.Show}
 * @example
 * // example
 * var showAction = cc.Show.create();
 */
cc.Show.create = function () {
    return new cc.Show();
};

/**
 * Hide the node
 * @class
 * @extends cc.ActionInstant
 */
cc.Hide = cc.ActionInstant.extend(/** @lends cc.Hide# */{
    /**
     * @param {Number} time
     */
    update:function (time) {
        this.target.visible = false;
    },

    /**
     * @return {cc.FiniteTimeAction}
     */
    reverse:function () {
        return cc.Show.create();
    },

    clone:function(){
        return new cc.Hide();
    }
});
/**
 * @return {cc.Hide}
 * @example
 * // example
 * var hideAction = cc.Hide.create();
 */
cc.Hide.create = function () {
    return new cc.Hide();
};


/** Toggles the visibility of a node
 * @class
 * @extends cc.ActionInstant
 */
cc.ToggleVisibility = cc.ActionInstant.extend(/** @lends cc.ToggleVisibility# */{
    /**
     * @param {Number} time
     */
    update:function (time) {
        this.target.visible = !this.target.visible;
    },

    /**
     * @return {cc.ToggleVisibility}
     */
    reverse:function () {
        return new cc.ToggleVisibility();
    },

    clone:function(){
        return new cc.ToggleVisibility();
    }
});

/**
 * @return {cc.ToggleVisibility}
 * @example
 * // example
 * var toggleVisibilityAction = cc.ToggleVisibility.create();
 */
cc.ToggleVisibility.create = function () {
    return new cc.ToggleVisibility();
};

cc.RemoveSelf = cc.ActionInstant.extend({
     _isNeedCleanUp: true,

	/**
	 * Create a RemoveSelf object with a flag indicate whether the target should be cleaned up while removing.
	 *
	 * @constructor
	 * @param {Boolean} [isNeedCleanUp=true]
	 *
	 * @example
	 * // example
	 * var removeSelfAction = new cc.RemoveSelf(false);
	 */
    ctor:function(isNeedCleanUp){
        cc.FiniteTimeAction.prototype.ctor.call(this);

	    isNeedCleanUp !== undefined && this.init(isNeedCleanUp);
    },

    update:function(time){
        this.target.removeFromParent(this._isNeedCleanUp);
    },

    init:function(isNeedCleanUp){
        this._isNeedCleanUp = isNeedCleanUp;
        return true;
    },

    reverse:function(){
        return new cc.RemoveSelf(this._isNeedCleanUp);
    },

    clone:function(){
        return new cc.RemoveSelf(this._isNeedCleanUp);
    }
});

/**
 * Create a RemoveSelf object with a flag indicate whether the target should be cleaned up while removing.
 *
 * @param {Boolean} [isNeedCleanUp=true]
 * @return {cc.RemoveSelf}
 *
 * @example
 * // example
 * var removeSelfAction = cc.RemoveSelf.create();
 */
cc.RemoveSelf.create = function(isNeedCleanUp){
    return new cc.RemoveSelf(isNeedCleanUp);
};

/**
 * Flips the sprite horizontally
 * @class
 * @extends cc.ActionInstant
 */
cc.FlipX = cc.ActionInstant.extend(/** @lends cc.FlipX# */{
    _flippedX:false,

	/**
	 * Create a FlipX action to flip or unflip the target
	 *
	 * @constructor
	 * @param {Boolean} flip Indicate whether the target should be flipped or not
	 *
	 * @example
	 * var flipXAction = new cc.FlipX(true);
	 */
    ctor:function(flip){
        cc.FiniteTimeAction.prototype.ctor.call(this);
        this._flippedX = false;
		flip !== undefined && this.initWithFlipX(flip);
    },

    /**
     * @param {Boolean} flip
     * @return {Boolean}
     */
    initWithFlipX:function (flip) {
        this._flippedX = flip;
        return true;
    },

    /**
     * @param {Number} time
     */
    update:function (time) {
        this.target.flippedX = this._flippedX;
    },

    /**
     * @return {cc.FiniteTimeAction}
     */
    reverse:function () {
        return cc.FlipX.create(!this._flippedX);
    },

    clone:function(){
        var action = new cc.FlipX();
        action.initWithFlipX(this._flippedX);
        return action;
    }
});

/**
 * Create a FlipX action to flip or unflip the target
 *
 * @param {Boolean} flip Indicate whether the target should be flipped or not
 * @return {cc.FlipX}
 * @example
 * var flipXAction = cc.FlipX.create(true);
 */
cc.FlipX.create = function (flip) {
    return new cc.FlipX(flip);
};

/**
 * Flips the sprite vertically
 * @class
 * @extends cc.ActionInstant
 */
cc.FlipY = cc.ActionInstant.extend(/** @lends cc.FlipY# */{
    _flippedY:false,

	/**
	 * Create a FlipY action to flip or unflip the target
	 *
	 * @constructor
	 * @param {Boolean} flip
	 * @example
	 * var flipYAction = new cc.FlipY(true);
	 */
    ctor: function(flip){
        cc.FiniteTimeAction.prototype.ctor.call(this);
        this._flippedY = false;

		flip !== undefined && this.initWithFlipY(flip);
    },
    /**
     * @param {Boolean} flip
     * @return {Boolean}
     */
    initWithFlipY:function (flip) {
        this._flippedY = flip;
        return true;
    },

    /**
     * @param {Number} time
     */
    update:function (time) {
        //this._super();
        this.target.flippedY = this._flippedY;
    },

    /**
     * @return {cc.FiniteTimeAction}
     */
    reverse:function () {
        return cc.FlipY.create(!this._flippedY);
    },

    clone:function(){
        var action = new cc.FlipY();
        action.initWithFlipY(this._flippedY);
        return action;
    }
});
/**
 * Create a FlipY action to flip or unflip the target
 *
 * @param {Boolean} flip
 * @return {cc.FlipY}
 * @example
 * var flipYAction = cc.FlipY.create(true);
 */
cc.FlipY.create = function (flip) {
    return new cc.FlipY(flip);
};


/** Places the node in a certain position
 * @class
 * @extends cc.ActionInstant
 */
cc.Place = cc.ActionInstant.extend(/** @lends cc.Place# */{
    _x: 0,
	_y: 0,

	/**
	 * Creates a Place action with a position
	 *
	 * @constructor
	 * @param {cc.Point|Number} pos
	 * @param {Number} [y]
	 * @example
	 * var placeAction = new cc.Place.create(cc.p(200, 200));
	 * var placeAction = new cc.Place.create(200, 200);
	 */
    ctor:function(pos, y){
        cc.FiniteTimeAction.prototype.ctor.call(this);
        this._x = 0;
	    this._y = 0;

		if (pos !== undefined) {
			if (pos.x !== undefined) {
				y = pos.y;
				pos = pos.x;
			}
			this.initWithPosition(pos, y);
		}
    },

    /** Initializes a Place action with a position
     * @param {cc.Point} pos
     * @return {Boolean}
     */
    initWithPosition: function (x, y) {
        this._x = x;
        this._y = y;
        return true;
    },

    /**
     * @param {Number} time
     */
    update:function (time) {
        this.target.setPosition(this._x, this._y);
    },

    clone:function(){
        var action = new cc.Place();
        action.initWithPosition(this._x, this._y);
        return action;
    }
});
/**
 * Creates a Place action with a position
 * @param {cc.Point|Number} pos
 * @param {Number} [y]
 * @return {cc.Place}
 * @example
 * // example
 * var placeAction = cc.Place.create(cc.p(200, 200));
 * var placeAction = cc.Place.create(200, 200);
 */
cc.Place.create = function (pos, y) {
    return new cc.Place(pos, y);
};


/** Calls a 'callback'
 * @class
 * @extends cc.ActionInstant
 */
cc.CallFunc = cc.ActionInstant.extend(/** @lends cc.CallFunc# */{
    _selectorTarget:null,
    _callFunc:null,
    _function:null,
    _data:null,

	/**
	 * Creates a CallFunc action with the callback
	 *
	 * @constructor
	 * @param {function} selector
	 * @param {object|null} [selectorTarget]
	 * @param {*|null} [data] data for function, it accepts all data types.
	 * @example
	 * // example
	 * // CallFunc without data
	 * var finish = new cc.CallFunc(this.removeSprite, this);
	 *
	 * // CallFunc with data
	 * var finish = new cc.CallFunc(this.removeFromParentAndCleanup, this,  true);
	 */
    ctor:function(selector, selectorTarget, data){
        cc.FiniteTimeAction.prototype.ctor.call(this);

		if(selector !== undefined){
			if(selectorTarget === undefined)
				this.initWithFunction(selector);
			else this.initWithFunction(selector, selectorTarget, data);
		}
    },

    /**
     * Initializes the action with a function or function and its target
     * @param {function} selector
     * @param {object|Null} selectorTarget
     * @param {*|Null} [data] data for function, it accepts all data types.
     * @return {Boolean}
     */
    initWithFunction:function (selector, selectorTarget, data) {
	    if (selectorTarget) {
            this._data = data;
            this._callFunc = selector;
            this._selectorTarget = selectorTarget;
	    }
	    else if (selector)
		    this._function = selector;
        return true;
    },

    /**
     * execute the function.
     */
    execute:function () {
        if (this._callFunc != null)         //CallFunc, N, ND
            this._callFunc.call(this._selectorTarget, this.target, this._data);
        else if(this._function)
            this._function.call(null, this.target);
    },

    /**
     * @param {Number} time
     */
    update:function (time) {
        //this._super(target);
        this.execute();
    },

    /**
     * @return {object}
     */
    getTargetCallback:function () {
        return this._selectorTarget;
    },

    /**
     * @param {object} sel
     */
    setTargetCallback:function (sel) {
        if (sel != this._selectorTarget) {
            if (this._selectorTarget)
                this._selectorTarget = null;
            this._selectorTarget = sel;
        }
    },

    copy:function() {
        var n = new cc.CallFunc();
        if(this._selectorTarget){
            n.initWithFunction(this._callFunc,  this._selectorTarget, this._data)
        }else if(this._function){
            n.initWithFunction(this._function);
        }
        return n;
    },

    clone:function(){
       var action = new cc.CallFunc();
        if(this._selectorTarget){
             action.initWithFunction(this._callFunc,  this._selectorTarget, this._data)
        }else if(this._function){
             action.initWithFunction(this._function);
        }
        return action;
    }
});
/**
 * Creates the action with the callback
 * @param {function} selector
 * @param {object|null} [selectorTarget]
 * @param {*|null} [data] data for function, it accepts all data types.
 * @return {cc.CallFunc}
 * @example
 * // example
 * // CallFunc without data
 * var finish = cc.CallFunc.create(this.removeSprite, this);
 *
 * // CallFunc with data
 * var finish = cc.CallFunc.create(this.removeFromParentAndCleanup, this._grossini,  true);
 */
cc.CallFunc.create = function (selector, selectorTarget, data) {
    return new cc.CallFunc(selector, selectorTarget, data);
};
