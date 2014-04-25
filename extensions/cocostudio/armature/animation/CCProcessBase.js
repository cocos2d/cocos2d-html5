/****************************************************************************
 Copyright (c) 2011-2012 cocos2d-x.org
 Copyright (c) 2013-2014 Chukong Technologies Inc.

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


//animation type
/**
 * the animation just have one frame
 * @constant
 * @type {number}
 */
ccs.ANIMATION_TYPE_SINGLE_FRAME = -4;
/**
 * the animation isn't loop
 * @constant
 * @type {number}
 */
ccs.ANIMATION_TYPE_NO_LOOP = -3;
/**
 * the animation to loop from front
 * @constant
 * @type {number}
 */
ccs.ANIMATION_TYPE_TO_LOOP_FRONT = -2;
/**
 * the animation to loop from back
 * @constant
 * @type {number}
 */
ccs.ANIMATION_TYPE_TO_LOOP_BACK = -1;
/**
 * the animation loop from front
 * @constant
 * @type {number}
 */
ccs.ANIMATION_TYPE_LOOP_FRONT = 0;
/**
 * the animation loop from back
 * @constant
 * @type {number}
 */
ccs.ANIMATION_TYPE_LOOP_BACK = 1;
/**
 * the animation max
 * @constant
 * @type {number}
 */
ccs.ANIMATION_TYPE_MAX = 2;

/**
 * Base class for ccs.ProcessBase objects.
 * @class
 * @extends ccs.Class
 *
 * @property {Number}   currentFrameIndex   - <@readonly> The current frame's index
 * @property {Boolean}  paused              - <@readonly> Indicate whether the process is paused
 * @property {Boolean}  completed           - <@readonly> Indicate whether the process is done
 * @property {Number}   currentPercent      - <@readonly> The current percentage of the process
 * @property {Number}   rawDuration         - <@readonly> The duration
 * @property {Number}   loop                - <@readonly> The number of loop
 * @property {Number}   tweenEasing         - <@readonly> The tween easing
 * @property {Number}   animationInterval   - The animation internal
 * @property {Number}   processScale        - The process scale
 * @property {Boolean}  playing             - <@readonly> Indicate whether the process is playing
 */
ccs.ProcessBase = ccs.Class.extend(/** @lends ccs.ProcessBase# */{
    processScale: 1,
    _isComplete: true,
    _isPause: true,
    _isPlaying: false,
    _currentPercent: 0.0,
    _rawDuration: 0,
    _loopType: 0,
    _tweenEasing: 0,
    animationInternal: null,
    _currentFrame: 0,
    _durationTween: 0,
    _nextFrameIndex: 0,
    _curFrameIndex: null,
    _isLoopBack: false,
    ctor: function () {
        this.processScale = 1;
        this._isComplete = true;
        this._isPause = true;
        this._isPlaying = false;
        this._currentFrame = 0;
        this._currentPercent = 0.0;
        this._durationTween = 0;
        this._rawDuration = 0;
        this._loopType = ccs.ANIMATION_TYPE_LOOP_BACK;
        this._tweenEasing = ccs.TweenType.linear;
        this.animationInternal = 1 / 60;
        this._curFrameIndex = 0;
        this._durationTween = 0;
        this._isLoopBack = false;
    },

    /**
     * Pause the Process
     */
    pause: function () {
        this._isPause = true;
        this._isPlaying = false;
    },

    /**
     * Resume the Process
     */
    resume: function () {
        this._isPause = false;
        this._isPlaying = true;
    },

    /**
     * Stop the Process
     */
    stop: function () {
        this._isComplete = true;
        this._isPlaying = false;
    },

    /**
     * Play the Process
     * @param {Number} durationTo
     * @param {ccs.TweenType} tweenEasing
     */
    play: function (durationTo, tweenEasing) {
        this._isComplete = false;
        this._isPause = false;
        this._isPlaying = true;
        this._currentFrame = 0;
        this._nextFrameIndex = durationTo;
        this._tweenEasing = tweenEasing;
    },

    update: function (dt) {
        if (this._isComplete || this._isPause) {
            return false;
        }
        if (this._rawDuration <= 0) {
            return false;
        }
        var locNextFrameIndex = this._nextFrameIndex;
        var locCurrentFrame = this._currentFrame;
        if (locNextFrameIndex <= 0) {
            this._currentPercent = 1;
            locCurrentFrame = 0;
        } else {
            /*
             *  update currentFrame, every update add the frame passed.
             *  dt/this.animationInternal determine it is not a frame animation. If frame speed changed, it will not make our
             *  animation speed slower or quicker.
             */
            locCurrentFrame += this.processScale * (dt / this.animationInternal);

            this._currentPercent = locCurrentFrame / locNextFrameIndex;

            /*
             *	if currentFrame is bigger or equal than this._nextFrameIndex, then reduce it util currentFrame is
             *  smaller than this._nextFrameIndex
             */
            locCurrentFrame = ccs.fmodf(locCurrentFrame, locNextFrameIndex);
        }
        this._currentFrame = locCurrentFrame
        this.updateHandler();
        return true;
    },

    /**
     * update will call this handler, you can handle your logic here
     */
    updateHandler: function () {
        //override
    },

    /**
     * goto frame
     * @param {Number} frameIndex
     */
    gotoFrame: function (frameIndex) {
        var locLoopType = this._loopType;
        if (locLoopType == ccs.ANIMATION_TYPE_NO_LOOP) {
            locLoopType = ccs.ANIMATION_TYPE_MAX;
        }
        else if (locLoopType == ccs.ANIMATION_TYPE_TO_LOOP_FRONT) {
            locLoopType = ccs.ANIMATION_TYPE_LOOP_FRONT;
        }
        this._loopType = locLoopType;
        this._curFrameIndex = frameIndex;
        this._nextFrameIndex = this._durationTween;
    },

    /**
     * get currentFrameIndex
     * @return {Number}
     */
    getCurrentFrameIndex: function () {
        this._curFrameIndex = (this._rawDuration - 1) * this._currentPercent;
        return this._curFrameIndex;
    },

    /**
     * whether the animation is pause
     * @returns {boolean}
     */
    isPause: function () {
        return this._isPause;
    },

    /**
     * whether the animation is complete
     * @returns {boolean}
     */
    isComplete: function () {
        return this._isComplete;
    },

    /**
     * current percent getter
     * @returns {number}
     */
    getCurrentPercent: function () {
        return this._currentPercent;
    },

    /**
     * rawDuration getter
     * @returns {number}
     */
    getRawDuration: function () {
        return this._rawDuration;
    },

    /**
     *  loop type getter
     * @returns {number}
     */
    getLoop: function () {
        return this._loopType;
    },

    /**
     * tween easing getter
     * @returns {number}
     */
    getTweenEasing: function () {
        return this._tweenEasing;
    },

    /**
     * animationInternal getter
     * @returns {number}
     */
    getAnimationInternal: function () {
        return this.animationInternal;
    },

    /**
     * animationInternal setter
     * @param animationInternal
     */
    setAnimationInternal: function (animationInternal) {
        this.animationInternal = animationInternal;
    },

    /**
     * process scale getter
     * @returns {number}
     */
    getProcessScale: function () {
        return this.processScale;
    },

    /**
     * process scale setter
     * @param processScale
     */
    setProcessScale: function (processScale) {
        this.processScale = processScale;
    },

    /**
     * whether the animation is playing
     * @returns {boolean}
     */
    isPlaying: function () {
        return this._isPlaying;
    }
});

var _p = ccs.ProcessBase.prototype;

// Extended properties
/** @expose */
_p.currentFrameIndex;
cc.defineGetterSetter(_p, "currentFrameIndex", _p.getCurrentFrameIndex);
/** @expose */
_p.paused;
cc.defineGetterSetter(_p, "paused", _p.isPause);
/** @expose */
_p.completed;
cc.defineGetterSetter(_p, "completed", _p.isComplete);
/** @expose */
_p.currentPercent;
cc.defineGetterSetter(_p, "currentPercent", _p.getCurrentPercent);
/** @expose */
_p.rawDuration;
cc.defineGetterSetter(_p, "rawDuration", _p.getRawDuration);
/** @expose */
_p.loop;
cc.defineGetterSetter(_p, "loop", _p.getLoop);
/** @expose */
_p.tweenEasing;
cc.defineGetterSetter(_p, "tweenEasing", _p.getTweenEasing);
/** @expose */
_p.playing;
cc.defineGetterSetter(_p, "playing", _p.isPlaying);

_p = null;
