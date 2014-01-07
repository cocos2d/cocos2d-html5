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

/**
 * Action frame type
 * @constant
 * @type Object
 */
ccs.FrameType = {
    move: 0,
    scale: 1,
    rotate: 2,
    tint: 3,
    fade: 4,
    max: 5
};

/**
 * Base class for ccs.ActionFrame
 * @class
 * @extends ccs.Class
 */
ccs.ActionFrame = ccs.Class.extend(/** @lends ccs.ActionFrame# */{
    _frameType: 0,
    _easingType: 0,
    _frameIndex: 0,
    _time: 0,
    ctor: function () {
        this._frameType = 0;
        this._easingType = 0;
        this._frameIndex = 0;
        this._time = 0;
    },

    /**
     * Changes the index of action frame
     * @param {number} index
     */
    setFrameIndex: function (index) {
        this._frameIndex = index;
    },

    /**
     * Gets the index of action frame
     * @returns {number}
     */
    getFrameIndex: function () {
        return this._frameIndex;
    },

    /**
     * Changes the time of action frame
     * @param {number} fTime
     */
    setFrameTime: function (time) {
        this._time = time;
    },

    /**
     * Gets the time of action frame
     * @returns {number}
     */
    getFrameTime: function () {
        return this._time;
    },

    /**
     * Changes the type of action frame
     * @param {number} frameType
     */
    setFrameType: function (frameType) {
        this._frameType = frameType;
    },

    /**
     * Gets the type of action frame
     * @returns {number}
     */
    getFrameType: function () {
        return this._frameType;
    },

    /**
     * Changes the easing type.
     * @param {number} easingType
     */
    setEasingType: function (easingType) {
        this._easingType = easingType;
    },

    /**
     * Gets the easing type.
     * @returns {number}
     */
    getEasingType: function () {
        return this._easingType;
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
ccs.ActionMoveFrame = ccs.ActionFrame.extend({
    _position: null,
    ctor: function () {
        ccs.ActionFrame.prototype.ctor.call(this);
        this._position = cc.p(0, 0);
        this._frameType = ccs.FrameType.move;
    },

    /**
     * Changes the move action position.
     * @param {cc.Point} pos
     */
    setPosition: function (pos) {
        this._position = pos;
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
ccs.ActionScaleFrame = ccs.ActionFrame.extend({
    _scaleX: 1,
    _scaleY: 1,
    ctor: function () {
        ccs.ActionFrame.prototype.ctor.call(this);
        this._scaleX = 1;
        this._scaleY = 1;
        this._frameType = ccs.FrameType.scale;
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
ccs.ActionRotationFrame = ccs.ActionFrame.extend({
    _rotation: 0,
    ctor: function () {
        ccs.ActionFrame.prototype.ctor.call(this);
        this._rotation = 0;
        this._frameType = ccs.FrameType.rotate;
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
ccs.ActionFadeFrame = ccs.ActionFrame.extend({
    _opacity: 255,
    ctor: function () {
        ccs.ActionFrame.prototype.ctor.call(this);
        this._opacity = 255;
        this._frameType = ccs.FrameType.fade;
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
ccs.ActionTintFrame = ccs.ActionFrame.extend({
    _color: 255,
    ctor: function () {
        ccs.ActionFrame.prototype.ctor.call(this);
        this._color = 255;
        this._frameType = ccs.FrameType.tint;
    },

    /**
     * Changes the tint action color.
     * @param {number} color
     */
    setColor: function (color) {
        this._color = color;
    },

    /**
     * Gets the tint action color.
     * @returns {number}
     */
    getColor: function () {
        return this._color;
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