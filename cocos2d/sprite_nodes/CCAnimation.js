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
 *    cc.AnimationFrame
 *    A frame of the animation. It contains information like:
 *       - sprite frame name
 *       - # of delay units.
 *       - offset
 * </p>
 * @class
 * @extends cc.Class
 */
cc.AnimationFrame = cc.Class.extend(/** @lends cc.AnimationFrame# */{
    _spriteFrame:null,
    _delayPerUnit:0,
    _userInfo:null,

    ctor:function () {
        this._delayPerUnit = 0;
    },

    copyWithZone:function (pZone) {
        return cc.clone(this);
    },

    copy:function (pZone) {
        var newFrame = new cc.AnimationFrame();
        newFrame.initWithSpriteFrame(this._spriteFrame, this._delayPerUnit, this._userInfo);
        return newFrame;
    },

    /**
     * initializes the animation frame with a spriteframe, number of delay units and a notification user info
     * @param {cc.SpriteFrame} spriteFrame
     * @param {Number} delayUnits
     * @param {object} userInfo
     */
    initWithSpriteFrame:function (spriteFrame, delayUnits, userInfo) {
        this.setSpriteFrame(spriteFrame);
        this.setDelayUnits(delayUnits);
        this.setUserInfo(userInfo);

        return true;
    },

    /**
     * cc.SpriteFrameName to be used
     * @return {cc.SpriteFrame}
     */
    getSpriteFrame:function () {
        return this._spriteFrame;
    },

    /**
     * cc.SpriteFrameName to be used
     * @param {cc.SpriteFrame} spriteFrame
     */
    setSpriteFrame:function (spriteFrame) {
        this._spriteFrame = spriteFrame;
    },

    /**
     * how many units of time the frame takes getter
     * @return {Number}
     */
    getDelayUnits:function () {
        return this._delayPerUnit;
    },

    /**
     *  how many units of time the frame takes setter
     * @param delayUnits
     */
    setDelayUnits:function (delayUnits) {
        this._delayPerUnit = delayUnits;
    },

    /**
     *  <p>A cc.AnimationFrameDisplayedNotification notification will be broadcasted when the frame is displayed with this dictionary as UserInfo.<br/>
     *  If UserInfo is nil, then no notification will be broadcasted. </p>
     * @return {object}
     */
    getUserInfo:function () {
        return this._userInfo;
    },

    /**
     * @param {object} userInfo
     */
    setUserInfo:function (userInfo) {
        this._userInfo = userInfo;
    }
});

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
 * animation.addFrameWithFile("grossini_dance_01.png");
 *
 * //create an animate with this animation
 * var action = cc.Animate.create(animation);
 *
 * //run animate
 * this._grossini.runAction(action);
 */
cc.Animation = cc.Class.extend(/** @lends cc.Animation# */{
    _frames:null,
    _loops:0,
    _restoreOriginalFrame:false,
    _duration:0,
    _delayPerUnit:0,
    _totalDelayUnits:0,

    /**
     * Constructor
     */
    ctor:function () {
        this._frames = [];
    },

    // attributes

    /**
     * return array of CCAnimationFrames
     * @return {Array}
     */
    getFrames:function () {
        return this._frames;
    },

    /**
     * array of CCAnimationFrames setter
     * @param {Array} frames
     */
    setFrames:function (frames) {
        this._frames = frames;
    },

    /**
     * adds a frame to a cc.Animation  The frame will be added with one "delay unit".
     * @param {cc.SpriteFrame} frame
     */
    addSpriteFrame:function (frame) {
        var animFrame = new cc.AnimationFrame();

        animFrame.initWithSpriteFrame(frame, 1, null);
        this._frames.push(animFrame);
        // update duration
        this._totalDelayUnits++;
    },

    /**
     * Adds a frame with an image filename. Internally it will create a cc.SpriteFrame and it will add it. The frame will be added with one "delay unit".
     * @param {String} fileName
     */
    addSpriteFrameWithFile:function (fileName) {
        var texture = cc.TextureCache.getInstance().addImage(fileName);
        var rect = cc.RectZero();
        if ((texture instanceof HTMLImageElement) || (texture instanceof HTMLCanvasElement)) {
            rect.size = cc.size(texture.width, texture.height);
        } else {
            rect.size = texture.getContentSize();
        }
        var frame = cc.SpriteFrame.createWithTexture(texture, rect);
        this.addSpriteFrame(frame);
    },

    /**
     * Adds a frame with a texture and a rect. Internally it will create a cc.SpriteFrame and it will add it. The frame will be added with one "delay unit".
     * @param {cc.Texture2D} texture
     * @param {cc.Rect} rect
     */
    addSpriteFrameWithTexture:function (texture, rect) {
        var pFrame = cc.SpriteFrame.createWithTexture(texture, rect);
        this.addSpriteFrame(pFrame);
    },

    /**
     * Initializes a cc.Animation with cc.AnimationFrame
     * @param {Array} arrayOfAnimationFrames
     * @param {Number} delayPerUnit
     * @param {Number} loops
     */
    initWithAnimationFrames:function (arrayOfAnimationFrames, delayPerUnit, loops) {
        cc.ArrayVerifyType(arrayOfAnimationFrames, cc.AnimationFrame);

        this._delayPerUnit = delayPerUnit;
        this._loops = loops;

        this.setFrames([]);
        for (var i = 0; i < arrayOfAnimationFrames.length; i++) {
            var animFrame = arrayOfAnimationFrames[i];
            this._frames.push(animFrame);
            this._totalDelayUnits += animFrame.getDelayUnits();
        }

        return true;
    },

    /**
     * @param {cc.Animation} pZone
     */
    copyWithZone:function (pZone) {
        var pCopy = new cc.Animation();
        pCopy.initWithAnimationFrames(this._frames, this._delayPerUnit, this._loops);
        pCopy.setRestoreOriginalFrame(this._restoreOriginalFrame);
        return pCopy;
    },

    copy:function (pZone) {
        return this.copyWithZone(null);
    },

    /**
     * return how many times the animation is going to loop. 0 means animation is not animated. 1, animation is executed one time, ...
     * @return {Number}
     */
    getLoops:function () {
        return this._loops;
    },

    /**
     * set how many times the animation is going to loop. 0 means animation is not animated. 1, animation is executed one time, ...
     * @param {Number} value
     */
    setLoops:function (value) {
        this._loops = value;
    },

    /**
     * whether or not it shall restore the original frame when the animation finishes
     * @param {Boolean} restOrigFrame
     */
    setRestoreOriginalFrame:function (restOrigFrame) {
        this._restoreOriginalFrame = restOrigFrame;
    },

    /**
     * return whether or not it shall restore the original frame when the animation finishes
     * @return {Boolean}
     */
    getRestoreOriginalFrame:function () {
        return this._restoreOriginalFrame;
    },

    /**
     * return duration in seconds of the whole animation. It is the result of totalDelayUnits * delayPerUnit
     * @return {Number}
     */
    getDuration:function () {
        return this._totalDelayUnits * this._delayPerUnit;
    },

    /**
     * return Delay in seconds of the "delay unit"
     * @return {Number}
     */
    getDelayPerUnit:function () {
        return this._delayPerUnit;
    },

    /**
     * set Delay in seconds of the "delay unit"
     * @param {Number} delayPerUnit
     */
    setDelayPerUnit:function (delayPerUnit) {
        this._delayPerUnit = delayPerUnit;
    },

    /**
     * return total Delay units of the cc.Animation.
     * @return {Number}
     */
    getTotalDelayUnits:function () {
        return this._totalDelayUnits;
    },

    /**
     * Initializes a cc.Animation with frames and a delay between frames
     * @param {Array} frames
     * @param {Number} delay
     */
    initWithSpriteFrames:function (frames, delay) {
        cc.ArrayVerifyType(frames, cc.SpriteFrame);
        this._loops = 1;
        delay = delay || 0;
        this._delayPerUnit = delay;

        var tempFrames = [];
        this.setFrames(tempFrames);
        if (frames) {
            for (var i = 0; i < frames.length; i++) {
                var frame = frames[i];
                var animFrame = new cc.AnimationFrame();
                animFrame.initWithSpriteFrame(frame, 1, null);
                this._frames.push(animFrame);
                this._totalDelayUnits++;
            }
        }
        return true;
    }
});

/**
 * Creates an animation.
 * @param {Array} frames
 * @param {Number} delay
 * @param {Number} loops
 * @return {cc.Animation}
 * @example
 * //Creates an animation
 * var animation1 = cc.Animation.create();
 *
 * //Create an animation with sprite frames
 * var animFrames = [];
 * var frame = cache.getSpriteFrame("grossini_dance_01.png");
 * animFrames.push(frame);
 * var animation2 = cc.Animation.create(animFrames);
 *
 * //Create an animation with sprite frames and delay
 * var animation3 = cc.Animation.create(animFrames, 0.2);
 */
cc.Animation.create = function (frames, delay, loops) {
    var len = arguments.length;
    var animation = new cc.Animation();
    if (len == 0) {
        animation.initWithSpriteFrames(null, 0);
    } else if (len == 2) {
        /** with frames and a delay between frames */
        delay = delay || 0;
        animation.initWithSpriteFrames(frames, delay);
    } else if (len == 3) {
        animation.initWithAnimationFrames(frames, delay, loops);
    }
    return animation;
};

/**
 * Creates an animation with an array of cc.AnimationFrame, the delay per units in seconds and and how many times it should be executed.
 * @param {Array} arrayOfAnimationFrameNames
 * @param {Number} delayPerUnit
 * @param {Number} loops
 * @return {cc.Animation}
 */
cc.Animation.createWithAnimationFrames = function (arrayOfAnimationFrameNames, delayPerUnit, loops) {
    var animation = new cc.Animation();
    animation.initWithAnimationFrames(arrayOfAnimationFrameNames, delayPerUnit, loops);
    return animation;
};

