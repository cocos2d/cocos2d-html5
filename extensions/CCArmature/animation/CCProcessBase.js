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


//animation type
CC_ANIMATION_TYPE_SINGLE_FRAME = -4;//the animation just have one frame
CC_ANIMATION_TYPE_NO_LOOP = -3;//the animation isn't loop
CC_ANIMATION_TYPE_TO_LOOP_FRONT = -2;//the animation to loop from front
CC_ANIMATION_TYPE_TO_LOOP_BACK = -1;//the animation to loop from back
CC_ANIMATION_TYPE_LOOP_FRONT = 0;//the animation loop from front
CC_ANIMATION_TYPE_LOOP_BACK = 1;//the animation loop from back
CC_ANIMATION_TYPE_MAX = 2;//the animation max

/**
 * Base class for cc.ProcessBase objects.
 * @class
 * @extends cc.Class
 */
cc.ProcessBase = cc.Class.extend({
    _animationScale:1,
    _isComplete:true,
    _isPause:true,
    _isPlaying:false,
    _currentPercent:0.0,
    _rawDuration:0,
    _loopType:0,
    _tweenEasing:0,
    _animationInternal:null,
    _currentFrame:0,
    _durationTween:0,
    _nextFrameIndex:0,
    _curFrameIndex:null,
    _isLoopBack:false,
    ctor:function () {
        this._animationScale = 1;
        this._isComplete = true;
        this._isPause = true;
        this._isPlaying = false;
        this._currentFrame = 0;
        this._currentPercent = 0.0;
        this._durationTween = 0;
        this._rawDuration = 0;
        this._loopType = CC_ANIMATION_TYPE_LOOP_BACK;
        this._tweenEasing = cc.TweenType.Linear;
        this._animationInternal = cc.Director.getInstance().getAnimationInterval();
        this._curFrameIndex = 0;
        this._durationTween = 0;
        this._isLoopBack = false;
    },


    pause:function () {
        this._isPause = true;
    },


    resume:function () {
        this._isPause = false;
    },

    stop:function () {
        this._isComplete = true;
        this._currentFrame = 0;
        this._currentPercent = 0;
    },

    /**
     * play animation by animation name.
     * @param {Number} animationName The animation name you want to play
     * @param {Number} durationTo
     *         he frames between two animation changing-over.It's meaning is changing to this animation need how many frames
     *         -1 : use the value from CCMovementData get from flash design panel
     * @param {Number} durationTween he
     *         frame count you want to play in the game.if  _durationTween is 80, then the animation will played 80 frames in a loop
     *         -1 : use the value from CCMovementData get from flash design panel
     * @param {Number} loop
     *          Whether the animation is loop.
     *         loop < 0 : use the value from CCMovementData get from flash design panel
     *         loop = 0 : this animation is not loop
     *         loop > 0 : this animation is loop
     * @param {Number} tweenEasing
     *          CCTween easing is used for calculate easing effect
     *         TWEEN_EASING_MAX : use the value from CCMovementData get from flash design panel
     *         -1 : fade out
     *         0  : line
     *         1  : fade in
     *         2  : fade in and out
     */
    play:function (animation, durationTo, durationTween, loop, tweenEasing) {
        this._isComplete = false;
        this._isPause = false;
        this._isPlaying = true;
        this._currentFrame = 0;

        /*
         *  Set this._nextFrameIndex to durationTo, it is used for change tween between two animation.
         *  When changing end, this._nextFrameIndex will be setted to _durationTween
         */
        this._nextFrameIndex = durationTo;
        this._tweenEasing = tweenEasing;
    },

    update:function (dt) {
        if (this._isComplete || this._isPause) {
            return;
        }
        if (this._rawDuration <= 0 || dt > 1) {
            return;
        }
        if (this._nextFrameIndex <= 0) {
            this._currentFrame = this._nextFrameIndex = 1;
        }
        /*
         *  update this._currentFrame, every update add the frame passed.
         *  dt/this._animationInternal determine it is not a frame animation. If frame speed changed, it will not make our
         *  animation speed slower or quicker.
         */
        this._currentFrame += this._animationScale * (dt / this._animationInternal);

        this._currentPercent = this._currentFrame / this._nextFrameIndex;

        /*
         *	if this._currentFrame is bigger or equal than this._nextFrameIndex, then reduce it util this._currentFrame is
         *  smaller than this._nextFrameIndex
         */
        this._currentFrame = cc.fmodf(this._currentFrame, this._nextFrameIndex);
        this.updateHandler();
    },

    /**
     * update will call this handler, you can handle your logic here
     */
    updateHandler:function () {
        //override
    },
    gotoFrame:function (keyFrameIndex) {
        this._curFrameIndex = keyFrameIndex;
        this.stop();
    },

    /**
     * get currentFrameIndex
     * @return {Number}
     */
    getCurrentFrameIndex:function () {
        return this._curFrameIndex;
    },

    isPause:function () {
        return this._isPause;
    },
    isComplete:function () {
        return this._isComplete;
    },
    getCurrentPercent:function () {
        return this._currentPercent;
    },
    getRawDuration:function () {
        return this._rawDuration;
    },
    getLoop:function () {
        return this._loopType;
    },
    getTweenEasing:function () {
        return this._tweenEasing;
    },
    getAnimationInternal:function () {
        return this._animationInternal;
    },
    getAnimationScale:function () {
        return this._animationScale;
    },
    setAnimationScale:function (animationScale) {
        this._animationScale = animationScale;
    },
    isPlaying:function () {
        return this._isPlaying;
    }
});
