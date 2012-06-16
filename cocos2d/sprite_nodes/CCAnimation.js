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
 * <p>
 *     A cc.Animation object is used to perform animations on the cc.Sprite objects.<br/>
 *     <br/>
 *      The cc.Animation object contains cc.SpriteFrame objects, and a possible delay between the frames. <br/>
 *      You can animate a cc.Animation object by using the cc.Animate action. Example:  <br/>
 * </p>
 * @class
 * @extends cc.Class
 *
 * @example
 * //create an animation object
 * var animation = cc.Animation.create();
 *
 * //add a sprite frame to this animation
 * animation.addFrameWithFileName("grossini_dance_01.png");
 *
 * //create an animate with this animation
 * var action = cc.Animate.create(3, animation, false);
 *
 * //run animate
 * this._grossini.runAction(action);
 */
cc.Animation = cc.Class.extend(/** @lends cc.Animation# */{
    _name:"",
    _delay:0,
    _frames:null,

    /**
     * Constructor
     */
    ctor:function () {
        this._frames = [];
    },

    // attributes
    /**
     * get name of the animation
     * @return {String}
     */
    getName:function () {
        return this._name;
    },

    /**
     * set name of the animation
     * @param {String} name
     */
    setName:function (name) {
        this._name = name;
    },

    /**
     * get delay between frames in seconds
     * @return {Number}
     */
    getDelay:function () {
        return this._delay;
    },

    /**
     * set delay between frames in seconds
     * @param {Number} delay
     */
    setDelay:function (delay) {
        this._delay = delay;
    },

    /**
     * get array of frames
     * @return {Array}
     */
    getFrames:function () {
        return this._frames;
    },

    /**
     * set array of frames, the Frames is retained
     * @param {Array} frames
     */
    setFrames:function (frames) {
        this._frames = frames;
    },

    /**
     * Initializes a cc.Animation with frames and a delay between frames
     * @param {Array} frames
     * @param {Number} delay
     * @return {Boolean}
     */
    initWithFrames:function (frames, delay) {
        this._delay = delay;
        if (frames)
            this._frames = frames;
        else
            this._frames = [];

        return true;
    },

    /**
     * adds a frame to a cc.Animation
     * @param {cc.SpriteFrame} frame
     */
    addFrame:function (frame) {
        this._frames.push(frame);
    },

    /**
     * Adds a frame with an image filename. Internally it will create a cc.SpriteFrame and it will add it.
     * @param {String} fileName
     */
    addFrameWithFileName:function (fileName) {
        var texture = cc.TextureCache.sharedTextureCache().addImage(fileName);
        var rect = cc.RectZero();
        if ((texture instanceof HTMLImageElement) || (texture instanceof HTMLCanvasElement)) {
            rect.size = cc.SizeMake(texture.width, texture.height);
        } else {
            rect.size = texture.getContentSize();
        }

        var frame = cc.SpriteFrame.create(texture, rect);

        this._frames.push(frame);
    },

    /**
     * Adds a frame with a texture and a rect. Internally it will create a CCSpriteFrame and it will add it.
     * @param {cc.Texture2D} texture
     * @param {cc.Rect} rect
     */
    addFrameWithTexture:function (texture, rect) {
        var pFrame = cc.SpriteFrame.create(texture, rect);
        this._frames.push(pFrame);
    },

    init:function () {
        return this.initWithFrames(null, 0);
    }
});

/**
 * Creates an animation.
 * @param {Array} frames
 * @param {Number} delay
 * @return {cc.Animation}
 * @example
 * //Creates an animation
 * var animation1 = cc.Animation.create();
 *
 * //Create an animation with sprite frames
 * var animFrames = [];
 * var frame = cache.spriteFrameByName("grossini_dance_01.png");
 * animFrames.push(frame);
 * var animation2 = cc.Animation.create(animFrames);
 *
 * //Create an animation with sprite frames and delay
 * var animation3 = cc.Animation.create(animFrames, 0.2);
 */
cc.Animation.create = function (frames, delay) {
    var animation = new cc.Animation();
    if (frames == null) {
        animation.init();
    } else {
        /** with frames and a delay between frames */
        if (!delay) {
            delay = 0;
        }
        animation.initWithFrames(frames, delay);
    }
    return animation;
};
