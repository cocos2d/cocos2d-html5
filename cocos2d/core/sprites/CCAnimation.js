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

    clone: function(){
        var frame = new cc.AnimationFrame();
        frame.initWithSpriteFrame(this._spriteFrame.clone(), this._delayPerUnit, this._userInfo);
        return frame;
    },

    copyWithZone:function (pZone) {
        return cc.clone(this);
    },

    copy:function (pZone) {
        var newFrame = new cc.AnimationFrame();
        newFrame.initWithSpriteFrame(this._spriteFrame.clone(), this._delayPerUnit, this._userInfo);
        return newFrame;
    },

    /**
     * initializes the animation frame with a spriteframe, number of delay units and a notification user info
     * @param {cc.SpriteFrame} spriteFrame
     * @param {Number} delayUnits
     * @param {object} userInfo
     */
    initWithSpriteFrame:function (spriteFrame, delayUnits, userInfo) {
        this._spriteFrame = spriteFrame;
        this._delayPerUnit = delayUnits;
        this._userInfo = userInfo;

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
	 * Creates an animation.
	 * @constructor
	 * @param {Array} frames
	 * @param {Number} delay
	 * @param {Number} [loops=1]
	 * @example
	 * // 1. Creates an empty animation
	 * var animation1 = new cc.Animation();
	 *
	 * // 2. Create an animation with sprite frames, delay and loops.
	 * var spriteFrames = [];
	 * var frame = cache.getSpriteFrame("grossini_dance_01.png");
	 * spriteFrames.push(frame);
	 * var animation1 = new cc.Animation(spriteFrames);
	 * var animation2 = new cc.Animation(spriteFrames, 0.2);
	 * var animation2 = new cc.Animation(spriteFrames, 0.2, 2);
	 *
	 * // 3. Create an animation with animation frames, delay and loops.
	 * var animationFrames = [];
	 * var frame =  new cc.AnimationFrame();
	 * animationFrames.push(frame);
	 * var animation1 = new cc.Animation(animationFrames);
	 * var animation2 = new cc.Animation(animationFrames, 0.2);
	 * var animation3 = new cc.Animation(animationFrames, 0.2, 2);
	 */
    ctor:function (frames, delay, loops) {
        this._frames = [];

		if (frames === undefined) {
			this.initWithSpriteFrames(null, 0);
		} else {
			var frame0 = frames[0];
			if(frame0){
				if (frame0 instanceof cc.SpriteFrame) {
					//init with sprite frames , delay and loops.
					this.initWithSpriteFrames(frames, delay, loops);
				}else if(frame0 instanceof cc.AnimationFrame) {
					//init with sprite frames , delay and loops.
					this.initWithAnimationFrames(frames, delay, loops);
				}
			}
		}
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
        var texture = cc.textureCache.addImage(fileName);
        var rect = cc.rect(0, 0, 0, 0);
        rect.width = texture.width;
        rect.height = texture.height;
        var frame = cc.SpriteFrame.create(texture, rect);
        this.addSpriteFrame(frame);
    },

    /**
     * Adds a frame with a texture and a rect. Internally it will create a cc.SpriteFrame and it will add it. The frame will be added with one "delay unit".
     * @param {cc.Texture2D} texture
     * @param {cc.Rect} rect
     */
    addSpriteFrameWithTexture:function (texture, rect) {
        var pFrame = cc.SpriteFrame.create(texture, rect);
        this.addSpriteFrame(pFrame);
    },

    /**
     * Initializes a cc.Animation with cc.AnimationFrame
     * @param {Array} arrayOfAnimationFrames
     * @param {Number} delayPerUnit
     * @param {Number} [loops=1]
     */
    initWithAnimationFrames:function (arrayOfAnimationFrames, delayPerUnit, loops) {
        cc.arrayVerifyType(arrayOfAnimationFrames, cc.AnimationFrame);

        this._delayPerUnit = delayPerUnit;
        this._loops = loops === undefined ? 1 : loops;
        this._totalDelayUnits = 0;

        var locFrames = this._frames;
        locFrames.length = 0;
        for (var i = 0; i < arrayOfAnimationFrames.length; i++) {
            var animFrame = arrayOfAnimationFrames[i];
            locFrames.push(animFrame);
            this._totalDelayUnits += animFrame.getDelayUnits();
        }

        return true;
    },

    clone: function(){
        var animation = new cc.Animation();
        animation.initWithAnimationFrames(this._copyFrames(), this._delayPerUnit, this._loops);
        animation.setRestoreOriginalFrame(this._restoreOriginalFrame);
        return animation;
    },

    /**
     * @param {cc.Animation} pZone
     */
    copyWithZone:function (pZone) {
        var pCopy = new cc.Animation();
        pCopy.initWithAnimationFrames(this._copyFrames(), this._delayPerUnit, this._loops);
        pCopy.setRestoreOriginalFrame(this._restoreOriginalFrame);
        return pCopy;
    },

    _copyFrames:function(){
       var copyFrames = [];
        for(var i = 0; i< this._frames.length;i++)
            copyFrames.push(this._frames[i].clone());
        return copyFrames;
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
     * @param {Number} [loops=1]
     */
    initWithSpriteFrames:function (frames, delay, loops) {
        cc.arrayVerifyType(frames, cc.SpriteFrame);
        this._loops = loops === undefined ? 1 : loops;
        this._delayPerUnit = delay || 0;
        this._totalDelayUnits = 0;

        var locFrames = this._frames;
        locFrames.length = 0;
        if (frames) {
            for (var i = 0; i < frames.length; i++) {
                var frame = frames[i];
                var animFrame = new cc.AnimationFrame();
                animFrame.initWithSpriteFrame(frame, 1, null);
                locFrames.push(animFrame);
            }
            this._totalDelayUnits += frames.length;
        }
        return true;
    },
    /**
     * Currently JavaScript Bindings (JSB), in some cases, needs to use retain and release. This is a bug in JSB,
     * and the ugly workaround is to use retain/release. So, these 2 methods were added to be compatible with JSB.
     * This is a hack, and should be removed once JSB fixes the retain/release bug
     */
    retain:function () {
    },
    release:function () {
    }
});

/**
 * Creates an animation.
 * @param {Array} frames
 * @param {Number} delay
 * @param {Number} [loops=1]
 * @return {cc.Animation}
 * @example
 * 1.
 * //Creates an empty animation
 * var animation1 = cc.Animation.create();
 *
 * 2.
 * //Create an animation with sprite frames , delay and loops.
 * var spriteFrames = [];
 * var frame = cache.getSpriteFrame("grossini_dance_01.png");
 * spriteFrames.push(frame);
 * var animation1 = cc.Animation.create(spriteFrames);
 * var animation2 = cc.Animation.create(spriteFrames, 0.2);
 * var animation2 = cc.Animation.create(spriteFrames, 0.2, 2);
 *
 * 3.
 * //Create an animation with animation frames , delay and loops.
 * var animationFrames = [];
 * var frame =  new cc.AnimationFrame();
 * animationFrames.push(frame);
 * var animation1 = cc.Animation.create(animationFrames);
 * var animation2 = cc.Animation.create(animationFrames, 0.2);
 * var animation3 = cc.Animation.create(animationFrames, 0.2, 2);
 */
cc.Animation.create = function (frames, delay, loops) {
    return new cc.Animation(frames, delay, loops);
};
