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

//movement event type
CC_MovementEventType_START = 0;
CC_MovementEventType_COMPLETE = 1;
CC_MovementEventType_LOOP_COMPLETE = 2;

/**
 * Base class for cc.MovementEvent objects.
 * @class
 * @extends cc.Class
 */
cc.AnimationEvent = cc.Class.extend({
    _arguments:null,
    _callFunc:null,
    _selectorTarget:null,
    ctor:function (target, callFunc, data) {
        this._data = data;
        this._callFunc = callFunc;
        this._selectorTarget = target;
    },
    call:function () {
        if (this._callFunc) {
            this._callFunc.apply(this._selectorTarget, this._arguments);
        }
    },
    setArguments:function (args) {
        this._arguments = args;
    }
});

/**
 * Base class for cc.ArmatureAnimation objects.
 * @class
 * @extends cc.ProcessBase
 */
cc.ArmatureAnimation = cc.ProcessBase.extend({
    _animationData:null,
    _movementData:null,
    _armature:null,
    _movementID:"",
    _prevFrameIndex:0,
    _toIndex:0,
    _tweenList:null,
    _frameEvent:null,
    _movementEvent:null,
    _speedScale:1,
    ctor:function () {
        cc.ProcessBase.prototype.ctor.call(this);
        this._animationData = null;
        this._movementData = null;
        this._movementID = "";
        this._armature = null;
        this._prevFrameIndex = 0;
        this._toIndex = 0;
        this._tweenList = [];
        this._frameEvent = null;
        this._movementEvent = null;
        this._speedScale = 1;
    },

    /**
     * init with a CCArmature
     * @param {cc.Armature} armature
     * @return {Boolean}
     */
    init:function (armature) {
        this._armature = armature;
        this._tweenList = [];
        return true;
    },
    pause:function () {
        for (var i = 0; i < this._tweenList.length; i++) {
            this._tweenList[i].pause();
        }
        cc.ProcessBase.prototype.pause.call(this);
    },
    resume:function () {
        for (var i = 0; i < this._tweenList.length; i++) {
            this._tweenList[i].resume();
        }
        cc.ProcessBase.prototype.resume.call(this);
    },

    stop:function () {
        for (var i = 0; i < this._tweenList.length; i++) {
            this._tweenList[i].stop();
        }
        this._tweenList = [];
        cc.ProcessBase.prototype.stop.call(this);
    },

    /**
     * scale animation play speed
     * @param {Number} speedScale
     */
    setSpeedScale:function (speedScale) {
        if (speedScale == this._speedScale) {
            return;
        }
        this._speedScale = speedScale;
        this._processScale = !this._movementData ? this._speedScale : this._speedScale * this._movementData.scale;
        var dict = this._armature.getBoneDic();
        for (var key in dict) {
            var bone = dict[key];
            bone.getTween().setProcessScale(this._processScale);
            if (bone.getChildArmature()) {
                bone.getChildArmature().getAnimation().setProcessScale(this._processScale);
            }
        }
    },

    getSpeedScale:function(){
        return this._speedScale;
    },

    getAnimationScale:function(){
        return this.getSpeedScale();
    },
    setAnimationScale:function(animationScale){
        return this.setSpeedScale(animationScale);
    },

    setAnimationInternal:function (animationInternal) {
        if (animationInternal == this._animationInternal) {
            return;
        }
        this._animationInternal = animationInternal;

        var dict = this._armature.getBoneDic();
        for (var key in dict) {
            var bone = dict[key];
            bone.getTween().setAnimationInternal(this._animationInternal);
            if (bone.getChildArmature()) {
                bone.getChildArmature().getAnimation().setAnimationInternal(this._animationInternal);
            }
        }
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
    play:function (animationName, durationTo, durationTween, loop, tweenEasing) {
        if (this._animationData == null) {
            cc.log("this._animationData can not be null");
            return;
        }
        this._movementData = this._animationData.getMovement(animationName);
        if (this._movementData == null) {
            cc.log("this._movementData can not be null");
            return;
        }
        if (typeof durationTo == "undefined") {
            durationTo = -1;
        }
        if (typeof durationTween == "undefined") {
            durationTween = -1;
        }
        if (typeof loop == "undefined") {
            loop = -1;
        }
        if (typeof tweenEasing == "undefined") {
            tweenEasing = cc.TweenType.TWEEN_EASING_MAX;
        }
        var locMovementData = this._movementData;
        //Get key frame count
        this._rawDuration = locMovementData.duration;
        this._movementID = animationName;
        this._processScale = this._speedScale * locMovementData.scale;
        //Further processing parameters
        durationTo = (durationTo == -1) ? locMovementData.durationTo : durationTo;
        durationTween = (durationTween == -1) ? locMovementData.durationTween : durationTween;
        durationTween = (durationTween == 0) ? locMovementData.duration : durationTween;//todo
        tweenEasing = (tweenEasing == cc.TweenType.TWEEN_EASING_MAX) ? locMovementData.tweenEasing : tweenEasing;
        loop = (loop < 0) ? locMovementData.loop : loop;

        cc.ProcessBase.prototype.play.call(this, animationName, durationTo, durationTween, loop, tweenEasing);

        if (this._rawDuration == 0) {
            this._loopType = CC_ANIMATION_TYPE_SINGLE_FRAME;
        }
        else {
            if (loop) {
                this._loopType = CC_ANIMATION_TYPE_TO_LOOP_FRONT;
            }
            else {
                this._loopType = CC_ANIMATION_TYPE_NO_LOOP;
                this._rawDuration--;
            }
            this._durationTween = durationTween;
        }

        this._tweenList = [];

        var movementBoneData;
        var dict = this._armature.getBoneDic();
        for (var key in dict) {
            var bone = dict[key];
            movementBoneData = locMovementData.getMovementBoneData(bone.getName());
            var tween = bone.getTween();
            if (movementBoneData && movementBoneData.frameList.length > 0) {
                this._tweenList.push(tween);
                movementBoneData.duration = locMovementData.duration;
                tween.play(movementBoneData, durationTo, durationTween, loop, tweenEasing);

                tween.setProcessScale(this._processScale);
                tween.setAnimationInternal(this._animationInternal);
                if (bone.getChildArmature()) {
                    bone.getChildArmature().getAnimation().setProcessScale(this._processScale);
                    bone.getChildArmature().getAnimation().setAnimationInternal(this._animationInternal);
                }
            } else {
                if (!bone.getIgnoreMovementBoneData()) {
                    bone.getDisplayManager().changeDisplayByIndex(-1, false);
                    tween.stop();
                }
            }
        }
    },

    /**
     * Play animation by index, the other param is the same to play.
     * @param {Number} animationIndex
     * @param {Number} durationTo
     * @param {Number} durationTween
     * @param {Number} loop
     * @param {Number} tweenEasing
     */
    playByIndex:function (animationIndex, durationTo, durationTween, loop, tweenEasing) {
        if (typeof durationTo == "undefined") {
            durationTo = -1;
        }
        if (typeof durationTween == "undefined") {
            durationTween = -1;
        }
        if (typeof loop == "undefined") {
            loop = -1;
        }
        if (typeof tweenEasing == "undefined") {
            tweenEasing = 10000;
        }
        var moveNames = this._animationData.movementNames;
        if (animationIndex < -1 || animationIndex >= moveNames.length) {
            return;
        }
        var animationName = moveNames[animationIndex];
        this.play(animationName, durationTo, durationTween, loop, tweenEasing);
    },

    /**
     * get movement count
     * @return {Number}
     */
    getMovementCount:function () {
        return this._animationData.getMovementCount();
    },

    update:function (dt) {
        if(cc.ProcessBase.prototype.update.call(this, dt)){
            for (var i = 0; i < this._tweenList.length; i++) {
                this._tweenList[i].update(dt);
            }
        }
    },

    /**
     * update will call this handler, you can handle your logic here
     */
    updateHandler:function () {
        var locCurrentPercent = this._currentPercent;
        if (locCurrentPercent >= 1) {
            switch (this._loopType) {
                case CC_ANIMATION_TYPE_NO_LOOP:
                    this._loopType = CC_ANIMATION_TYPE_MAX;
                    this._currentFrame = (locCurrentPercent - 1) * this._nextFrameIndex;
                    locCurrentPercent = this._currentFrame / this._durationTween;
                    if (locCurrentPercent < 1.0) {
                        this._nextFrameIndex = this._durationTween;
                        this.callMovementEvent([this._armature, CC_MovementEventType_START, this._movementID]);
                        break;
                    }
                case CC_ANIMATION_TYPE_MAX:
                case CC_ANIMATION_TYPE_SINGLE_FRAME:
                    locCurrentPercent = 1;
                    this._isComplete = true;
                    this._isPlaying = false;
                    this.callMovementEvent([this._armature, CC_MovementEventType_COMPLETE, this._movementID]);
                    break;
                case CC_ANIMATION_TYPE_TO_LOOP_FRONT:
                    this._loopType = CC_ANIMATION_TYPE_LOOP_FRONT;
                    locCurrentPercent = cc.fmodf(locCurrentPercent, 1);
                    this._currentFrame = this._nextFrameIndex == 0 ? 0 : cc.fmodf(this._currentFrame, this._nextFrameIndex);
                    this._nextFrameIndex = this._durationTween > 0 ? this._durationTween : 1;
                    this.callMovementEvent([this, CC_MovementEventType_START, this._movementID]);
                    break;
                default:
                    locCurrentPercent = cc.fmodf(locCurrentPercent, 1);
                    this._currentFrame = cc.fmodf(this._currentFrame, this._nextFrameIndex);
                    this._toIndex = 0;
                    this.callMovementEvent([this._armature, CC_MovementEventType_LOOP_COMPLETE, this._movementID]);
                    break;
            }
            this._currentPercent = locCurrentPercent;
        }
    },

    /**
     * Get current movementID
     * @returns {String}
     */
    getCurrentMovementID: function () {
        if (this._isComplete)
            return "";
        return this._movementID;
    },

    /**
     * connect a event
     * @param {Object} target
     * @param {function} callFunc
     */
    setMovementEventCallFunc:function (callFunc, target) {
        this._movementEvent = new cc.AnimationEvent(target, callFunc);
    },

    /**
     * call event
     * @param {Array} args
     */
    callMovementEvent:function (args) {
        if (this._movementEvent) {
            this._movementEvent.setArguments(args);
            this._movementEvent.call();
        }
    },

    /**
     * connect a event
     * @param {Object} target
     * @param {function} callFunc
     */
    setFrameEventCallFunc:function (callFunc, target) {
        this._frameEvent = new cc.AnimationEvent(target, callFunc);
    },

    /**
     * call event
     * @param {Array} args
     */
    callFrameEvent:function (args) {
        if (this._frameEvent) {
            this._frameEvent.setArguments(args);
            this._frameEvent.call();
        }
    },

    /**
     * animationData setter
     * @param {cc.AnimationData} aniData
     */
    setAnimationData:function (aniData) {
        this._animationData = aniData;
    },

    /**
     * animationData getter
     * @return {cc.AnimationData}
     */
    getAnimationData:function () {
        return this._animationData;
    }
});

/**
 * allocates and initializes a ArmatureAnimation.
 * @constructs
 * @return {cc.ArmatureAnimation}
 * @example
 * // example
 * var animation = cc.ArmatureAnimation.create();
 */
cc.ArmatureAnimation.create = function (armature) {
    var animation = new cc.ArmatureAnimation();
    if (animation && animation.init(armature)) {
        return animation;
    }
    return null;
};