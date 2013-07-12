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
CC_MovementEventType_START = 0;
CC_MovementEventType_COMPLETE = 1;
CC_MovementEventType_LOOP_COMPLETE = 2;

cc.MovementEvent = cc.Class.extend({
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

cc.ArmatureAnimation = cc.ProcessBase.extend({
        _animationData:null,
        _movementData:null,
        _armature:null,
        _movementID:"",
        _prevFrameIndex:0,
        _toIndex:0,
        _tweenList:[],
        MovementEventSignal:{},
        _frameEvent:null,

        ctor:function () {
            cc.ProcessBase.prototype.ctor.call(this);
            this._animationData = null;
            this._currentFrameData = null;
            this._movementID = "";
            this._armature = null;
            this._prevFrameIndex = 0;
            this._toIndex = 0;
            this.MovementEventSignal = {};
            this.FrameEventSignal = {};
        },
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

        setAnimationScale:function (animationScale) {
            if (animationScale == this._animationScale) {
                return;
            }
            this._animationScale = animationScale;

            var dict = this._armature.getBoneDic();
            for (var key in dict) {
                var bone = dict[key];
                bone.getTween().setAnimationScale(this._animationScale);
                if (bone.getChildArmature()) {
                    bone.getChildArmature().getAnimation().setAnimationScale(this._animationScale);
                }
            }
        },

        play:function (animationName, durationTo, durationTween, loop, tweenEasing) {
            this.stop();
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
                tweenEasing = 10000;
            }
            //Get key frame count
            this._rawDuration = this._movementData.duration;
            this._movementID = animationName;
            //Further processing parameters
            durationTo = (durationTo == -1) ? this._movementData.durationTo : durationTo;
            durationTween = (durationTween == -1) ? this._movementData.durationTween : durationTween;
            durationTween = (durationTween == 0) ? this._movementData.duration : durationTween;//todo
            tweenEasing = (tweenEasing == cc.TweenType.TWEEN_EASING_MAX) ? this._movementData.tweenEasing : tweenEasing;
            loop = (loop < 0) ? this._movementData.loop : loop;

            cc.ProcessBase.prototype.play.call(this, animationName, durationTo, durationTween, loop, tweenEasing);

            if (this._rawDuration == 1) {
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
            var movementBoneData;
            var dict = this._armature.getBoneDic();
            for (var key in dict) {
                var bone = dict[key];
                movementBoneData = this._movementData.getMovementBoneData(bone.getName());
                var tween = bone.getTween();
                if (movementBoneData && movementBoneData.frameList.length > 0) {
                    this._tweenList.push(tween);
                    tween.play(movementBoneData, durationTo, durationTween, loop, tweenEasing);

                    tween.setAnimationScale(this._animationScale);
                    if (bone.getChildArmature()) {
                        bone.getChildArmature().getAnimation().setAnimationScale(this._animationScale);
                    }
                } else {
                    if (!bone.getIgnoreMovementBoneData()) {
                        bone.getDisplayManager().changeDisplayByIndex(-1, false);
                        tween.stop();
                    }
                }
            }
        },

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
                return
            }
            var animationName = moveNames[animationIndex];
            this.play(animationName, durationTo, durationTween, loop, tweenEasing);
        },

        getMovementCount:function () {
            return this._animationData.getMovementCount();
        },

        update:function (dt) {
            cc.ProcessBase.prototype.update.call(this, dt);
            for (var i = 0; i < this._tweenList.length; i++) {
                this._tweenList[i].update(dt);
            }
        },

        updateHandler:function () {
            if (this._currentPercent >= 1) {
                switch (this._loopType) {
                    case CC_ANIMATION_TYPE_NO_LOOP:
                        this._loopType = CC_ANIMATION_TYPE_MAX;
                        this._currentFrame = (this._currentPercent - 1) * this._nextFrameIndex;
                        this._currentPercent = this._currentFrame / this._durationTween;
                        if (this._currentPercent < 1.0) {
                            this._nextFrameIndex = this._durationTween;
                            this.callEvent([this, CC_MovementEventType_START, this._movementID]);
                            break;
                        }
                    case CC_ANIMATION_TYPE_MAX:
                    case CC_ANIMATION_TYPE_SINGLE_FRAME:
                        this._currentPercent = 1;
                        this._isComplete = true;
                        this.callEvent([this, CC_MovementEventType_COMPLETE, this._movementID]);
                        break;
                    case CC_ANIMATION_TYPE_TO_LOOP_FRONT:
                        this._loopType = CC_ANIMATION_TYPE_LOOP_FRONT;
                        this._currentPercent = cc.fmodf(this._currentPercent, 1);
                        this._currentFrame = cc.fmodf(this._currentFrame, this._nextFrameIndex);
                        this._nextFrameIndex = this._durationTween > 0 ? this._durationTween : 1;
                        this.callEvent([this, CC_MovementEventType_START, this._movementID]);
                        break;
                    default:
                        this._currentPercent = cc.fmodf(this._currentPercent, 1);
                        this._currentFrame = cc.fmodf(this._currentFrame, this._nextFrameIndex);
                        this._toIndex = 0;
                        this.callEvent([this, CC_MovementEventType_LOOP_COMPLETE, this._movementID]);
                        break;
                }
            }

            if (this._loopType == CC_ANIMATION_TYPE_LOOP_BACK || this._loopType == CC_ANIMATION_TYPE_LOOP_FRONT) {
                this.updateFrameData(this._currentPercent);
            }
        },
        updateFrameData:function (currentPercent) {
            this._prevFrameIndex = this._curFrameIndex;
            this._curFrameIndex = this._rawDuration * currentPercent;
            this._curFrameIndex = this._curFrameIndex % this._rawDuration;
        },
        connectEvent:function (taget, callFunc) {
            this._frameEvent = new cc.MovementEvent(taget, callFunc);
        },
        callEvent:function (args) {
            if (this._frameEvent) {
                this._frameEvent.setArguments(args);
                this._frameEvent.call();
            }
        },
        setAnimationData:function (aniData) {
            this._animationData = aniData;
        },
        getAnimationData:function () {
            return this._animationData;
        }
    }
);

cc.ArmatureAnimation.create = function (armature) {
    var animation = new cc.ArmatureAnimation();
    if (animation && animation.init(armature)) {
        return animation;
    }
    return null;
};