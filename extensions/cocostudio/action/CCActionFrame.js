/****************************************************************************
 Copyright (c) 2010-2012 cocos2d-x.org

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

//Action frame type
/**
 * @ignore
 */
ccs.FRAME_TYPE_MOVE = 0;
ccs.FRAME_TYPE_SCALE = 1;
ccs.FRAME_TYPE_ROTATE = 2;
ccs.FRAME_TYPE_TINT = 3;
ccs.FRAME_TYPE_FADE = 4;
ccs.FRAME_TYPE_MAX = 5;

/**
 * Base class for ccs.ActionFrame
 * @class
 * @extends ccs.Class
 */
ccs.ActionFrame = ccs.Class.extend(/** @lends ccs.ActionFrame# */{
    frameType: 0,
    easingType: 0,
    frameIndex: 0,
    time: 0,
    ctor: function () {
        this.frameType = 0;
        this.easingType = 0;
        this.frameIndex = 0;
        this.time = 0;
    },

    /**
     * Gets the action of ActionFrame.
     * @param {number} duration
     * @returns {null}
     */
    getAction: function (duration) {
        return null;
    }
});

/**
 * Base class for ccs.ActionMoveFrame
 * @class
 * @extends ccs.ActionFrame
 */
ccs.ActionMoveFrame = ccs.ActionFrame.extend(/** @lends ccs.ActionMoveFrame# */{
    _position: null,
    ctor: function () {
        ccs.ActionFrame.prototype.ctor.call(this);
        this._position = cc.p(0, 0);
        this.frameType = ccs.FRAME_TYPE_MOVE;
    },

    /**
     * Changes the move action position.
     * @param {cc.Point|Number} pos
     * @param {Number} y
     */
    setPosition: function (pos, y) {
        if (y === undefined) {
            this._position.x = pos.x;
            this._position.y = pos.y;
        } else {
            this._position.x = pos;
            this._position.y = y;
        }
    },

    /**
     * Gets the move action position.
     * @returns {cc.Point}
     */
    getPosition: function () {
        return this._position;
    },

    /**
     * Gets the CCAction of ActionFrame.
     * @param {number} duration
     * @returns {cc.MoveTo}
     */
    getAction: function (duration) {
        return cc.MoveTo.create(duration, this._position);
    }
});

/**
 * Base class for ccs.ActionScaleFrame
 * @class
 * @extends ccs.ActionFrame
 */
ccs.ActionScaleFrame = ccs.ActionFrame.extend(/** @lends ccs.ActionScaleFrame# */{
    _scaleX: 1,
    _scaleY: 1,
    ctor: function () {
        ccs.ActionFrame.prototype.ctor.call(this);
        this._scaleX = 1;
        this._scaleY = 1;
        this.frameType = ccs.FRAME_TYPE_SCALE;
    },

    /**
     * Changes the scale action scaleX.
     * @param {number} scaleX
     */
    setScaleX: function (scaleX) {
        this._scaleX = scaleX;
    },

    /**
     * Gets the scale action scaleX.
     * @returns {number} {number}
     */
    getScaleX: function () {
        return this._scaleX;
    },

    /**
     * Changes the scale action scaleY.
     * @param {number} scaleY
     */
    setScaleY: function (scaleY) {
        this._scaleY = scaleY;
    },

    /**
     * Gets the scale action scaleY.
     * @returns {number}
     */
    getScaleY: function () {
        return this._scaleY;
    },

    /**
     * Gets the action of ActionFrame.
     * @param duration
     * @returns {cc.ScaleTo}
     */
    getAction: function (duration) {
        return cc.ScaleTo.create(duration, this._scaleX, this._scaleY);
    }
});

/**
 * Base class for ccs.ActionRotationFrame
 * @class
 * @extends ccs.ActionFrame
 */
ccs.ActionRotationFrame = ccs.ActionFrame.extend(/** @lends ccs.ActionRotationFrame# */{
    _rotation: 0,
    ctor: function () {
        ccs.ActionFrame.prototype.ctor.call(this);
        this._rotation = 0;
        this.frameType = ccs.FRAME_TYPE_ROTATE;
    },

    /**
     * Changes rotate action rotation.
     * @param {number} rotation
     */
    setRotation: function (rotation) {
        this._rotation = rotation;
    },

    /**
     * Gets the rotate action rotation.
     * @returns {number}
     */
    getRotation: function () {
        return this._rotation;
    },

    /**
     * Gets the CCAction of ActionFrame.
     * @param {number} duration
     * @returns {cc.RotateTo}
     */
    getAction: function (duration) {
        return cc.RotateTo.create(duration, this._rotation);
    }
});

/**
 * Base class for ccs.ActionFadeFrame
 * @class
 * @extends ccs.ActionFrame
 */
ccs.ActionFadeFrame = ccs.ActionFrame.extend(/** @lends ccs.ActionFadeFrame# */{
    _opacity: 255,
    ctor: function () {
        ccs.ActionFrame.prototype.ctor.call(this);
        this._opacity = 255;
        this.frameType = ccs.FRAME_TYPE_FADE;
    },

    /**
     * Changes the fade action opacity.
     * @param {number} opacity
     */
    setOpacity: function (opacity) {
        this._opacity = opacity;
    },

    /**
     * Gets the fade action opacity.
     * @returns {number}
     */
    getOpacity: function () {
        return this._opacity;
    },

    /**
     * Gets the CCAction of ActionFrame.
     * @param duration
     * @returns {cc.FadeTo}
     */
    getAction: function (duration) {
        return cc.FadeTo.create(duration, this._opacity);
    }
});

/**
 * Base class for ccs.ActionTintFrame
 * @class
 * @extends ccs.ActionFrame
 */
ccs.ActionTintFrame = ccs.ActionFrame.extend(/** @lends ccs.ActionTintFrame# */{
    _color: null,
    ctor: function () {
        ccs.ActionFrame.prototype.ctor.call(this);
        this._color = cc.color(255, 255, 255, 255);
        this.frameType = ccs.FRAME_TYPE_TINT;
    },

    /**
     * Changes the tint action color.
     * @param {cc.Color} color
     */
    setColor: function (color) {
        var locColor = this._color;
        locColor.r = color.r;
        locColor.g = color.g;
        locColor.b = color.b;
    },

    /**
     * Gets the tint action color.
     * @returns {cc.Color}
     */
    getColor: function () {
        var locColor = this._color;
        return cc.color(locColor.r, locColor.g, locColor.b, locColor.a);
    },

    /**
     * Gets the action of ActionFrame.
     * @param duration
     * @returns {cc.TintTo}
     */
    getAction: function (duration) {
        return cc.TintTo.create(duration, this._color.r, this._color.g, this._color.b);
    }
});