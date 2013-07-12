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
 * Base class for cc.Tween objects.
 * @class
 * @extends cc.ProcessBase
 */
cc.Tween = cc.ProcessBase.extend({
    _tweenData:null,
    _to:null,
    _from:null,
    _between:null,
    _movementBoneData:null,
    _currentKeyFrame:null,
    _bone:null,
    _frameTweenEasing:0,
    _isTweenKeyFrame:false,
    _betweenDuration:0,
    _totalDuration:0,
    _toIndex:0,
    _fromIndex:0,
    _animation:false,
    ctor:function () {
        cc.ProcessBase.prototype.ctor.call(this);
        this._from = null;
        this._between = null;
        this._bone = null;
        this._currentKeyFrame = null;
        this._nextKeyFrame = null;
        this._editKeyFrame = null;
        this._movementBoneData = null;
        this._frameTweenEasing = cc.TweenType.Linear;
        this._toIndex = 0;
        this._fromIndex = 0;
        this._animation = null;
    },

    /**
     * init with a CCBone
     * @param {cc.Bone} bone
     * @return {Boolean}
     */
    init:function (bone) {
        this._from = new cc.FrameData();
        this._between = new cc.FrameData();

        this._bone = bone;
        this._tweenData = this._bone.getTweenData();
        this._animation = this._bone.getArmature() != null ? this._bone.getArmature().getAnimation() : null;
        return true;
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
    play:function (movementBoneData, durationTo, durationTween, loop, tweenEasing) {
        cc.ProcessBase.prototype.play.call(this, null, durationTo, durationTween, loop, tweenEasing);
        this._loopType = loop;
        this._currentKeyFrame = null;
        this._isTweenKeyFrame = false;

        this._totalDuration = 0;
        this._betweenDuration = 0;
        this._toIndex = 0;

        this._movementBoneData = movementBoneData;

        if (this._movementBoneData.frameList.length == 1) {
            this._loopType = CC_ANIMATION_TYPE_SINGLE_FRAME;
            var nextKeyFrame = this._movementBoneData.getFrameData(0);
            if (durationTo == 0) {
                this.setBetween(nextKeyFrame, nextKeyFrame);
            } else {
                this._tweenData.displayIndex = nextKeyFrame.displayIndex;
                this.setBetween(this._tweenData, nextKeyFrame);
            }

            this._isTweenKeyFrame = true;
            this._frameTweenEasing = cc.TweenType.Linear;
            this._rawDuration = this._movementBoneData.duration;
            this._fromIndex = this._toIndex = 0;
        }
        else if (this._movementBoneData.frameList.length > 1) {
            if (loop) {
                this._loopType = CC_ANIMATION_TYPE_TO_LOOP_BACK;
                this._rawDuration = this._movementBoneData.duration;
            }
            else {
                this._loopType = CC_ANIMATION_TYPE_NO_LOOP;
                this._rawDuration = this._movementBoneData.duration - 1;
            }

            this._durationTween = durationTween * this._movementBoneData.scale;
            if (loop && this._movementBoneData.delay != 0) {
                this.setBetween(this._tweenData, this.tweenNodeTo(this.updateFrameData(1 - this._movementBoneData.delay), this._between));
            }
            else {
                var nextKeyFrame = this._movementBoneData.getFrameData(0);
                this.setBetween(this._tweenData, nextKeyFrame);
                this._isTweenKeyFrame = true;
            }
        }
    },

    /**
     * update will call this handler, you can handle your logic here
     */
    updateHandler:function () {
        if (this._currentPercent >= 1) {
            switch (this._loopType) {
                case CC_ANIMATION_TYPE_SINGLE_FRAME:
                    this._currentPercent = 1;
                    this._isComplete = true;
                    break;
                case CC_ANIMATION_TYPE_NO_LOOP:
                    this._loopType = CC_ANIMATION_TYPE_MAX;
                    if (this._durationTween <= 0) {
                        this._currentPercent = 1;
                    }
                    else {
                        this._currentPercent = (this._currentPercent - 1) * this._nextFrameIndex / this._durationTween;
                    }
                    if (this._currentPercent >= 1) {
                        this._currentPercent = 1;
                        this._isComplete = true;
                        break;
                    }
                    else {
                        this._nextFrameIndex = this._durationTween;
                        this._currentFrame = this._currentPercent * this._nextFrameIndex;
                        this._totalDuration = 0;
                        this._betweenDuration = 0;
                        this._toIndex = 0;
                        break;
                    }
                case CC_ANIMATION_TYPE_TO_LOOP_BACK:
                    this._loopType = CC_ANIMATION_TYPE_LOOP_BACK;
                    this._nextFrameIndex = this._durationTween > 0 ? this._durationTween : 1;
                    if (this._movementBoneData.delay != 0) {
                        this._currentFrame = (1 - this._movementBoneData.delay) * this._nextFrameIndex;
                        this._currentPercent = this._currentFrame / this._nextFrameIndex;

                    } else {
                        this._currentPercent = 0;
                        this._currentFrame = 0;
                    }

                    this._totalDuration = 0;
                    this._betweenDuration = 0;
                    this._toIndex = 0;
                    break;
                case CC_ANIMATION_TYPE_MAX:
                    this._currentPercent = 1;
                    this._isComplete = true;
                    break;
                default:
                    this._currentPercent = cc.fmodf(this._currentPercent, 1);
                    this._currentFrame = cc.fmodf(this._currentFrame, this._nextFrameIndex);
                    this._totalDuration = 0;
                    this._betweenDuration = 0;
                    this._toIndex = 0;
                    break;
            }
        }

        if (this._currentPercent < 1 && this._loopType < CC_ANIMATION_TYPE_TO_LOOP_BACK) {
            this._currentPercent = Math.sin(this._currentPercent * cc.PI / 2);
        }

        var percent = this._currentPercent;
        if (this._loopType > CC_ANIMATION_TYPE_TO_LOOP_BACK) {
            percent = this.updateFrameData(percent, true);
        }
        if (this._frameTweenEasing != cc.TWEEN_EASING_MAX) {
            this.tweenNodeTo(percent);
        }
        else if (this._currentKeyFrame) {
            this.tweenNodeTo(0);
        }

    },

    /**
     * Calculate the between value of _from and _to, and give it to between frame data
     * @param {cc.FrameData} from
     * @param {cc.FrameData} to
     */
    setBetween:function (from, to) {
        do
        {
            if (to.displayIndex < 0 && from.displayIndex > 0) {
                this._from.copy(from);
                this._between.subtract(to, to);
                break;
            } else if (from.displayIndex < 0 && to.displayIndex > 0) {
                this._from.copy(to);
                this._between.subtract(to, to);
                break;
            }
            this._from.copy(from);
            this._between.subtract(from, to);
        } while (0);
        this.arriveKeyFrame(from);
    },

    /**
     * Update display index and process the key frame event when arrived a key frame
     * @param {cc.FrameData} keyFrameData
     */
    arriveKeyFrame:function (keyFrameData) {
        if (keyFrameData) {
            var displayIndex = keyFrameData.displayIndex;
            if (!this._bone.getDisplayManager().getForceChangeDisplay()) {
                this._bone.getDisplayManager().changeDisplayByIndex(displayIndex, false);
            }
            this._bone.setZOrder(keyFrameData.zOrder);
            var childAramture = this._bone.getChildArmature();
            if (childAramture) {
                if (keyFrameData.movement != "") {
                    childAramture.getAnimation().play(keyFrameData.movement);
                }
            }
            if (keyFrameData.event != "") {
                //this._animation.FrameEventSignal.emit(this._bone, keyFrameData.event);
            }
            if (keyFrameData.sound) {
                //soundManager.dispatchEventWith(Event.SOUND_FRAME, m_pCurrentKeyFrame.sound);
            }
        }
    },

    /**
     * According to the percent to calculate current CCFrameData with tween effect
     * @param {Number} percent
     * @param {cc.FrameData} node
     * @return {cc.FrameData}
     */
    tweenNodeTo:function (percent, node) {
        if (!node) {
            node = this._tweenData;
        }
        node.x = this._from.x + percent * this._between.x;
        node.y = this._from.y + percent * this._between.y;
        node.scaleX = this._from.scaleX + percent * this._between.scaleX;
        node.scaleY = this._from.scaleY + percent * this._between.scaleY;
        node.skewX = this._from.skewX + percent * this._between.skewX;
        node.skewY = this._from.skewY + percent * this._between.skewY;
        this._bone.setTransformDirty(true);
        if (this._between.isUseColorInfo) {
            node.a = this._from.a + percent * this._between.a;
            node.r = this._from.r + percent * this._between.r;
            node.g = this._from.g + percent * this._between.g;
            node.b = this._from.b + percent * this._between.b;
            this._bone.updateColor();
        }
        return node;
    },

    /**
     * Calculate which frame arrived, and if current frame have event, then call the event listener
     * @param {Number} currentPercent
     * @param {Boolean} activeFrame
     * @return {Number}
     */
    updateFrameData:function (currentPercent, activeFrame) {
        var playedTime = this._rawDuration * currentPercent;
        var from;
        var to;
        var isListEnd;
        // if play to current frame's front or back, then find current frame again
        if (playedTime >= this._totalDuration || playedTime < this._totalDuration - this._betweenDuration) {
            /*
             *  get frame length, if this._toIndex >= _length, then set this._toIndex to 0, start anew.
             *  this._toIndex is next index will play
             */
            var length = this._movementBoneData.frameList.length;
            do {
                this._betweenDuration = this._movementBoneData.getFrameData(this._toIndex).duration;
                this._totalDuration += this._betweenDuration;
                this._fromIndex = this._toIndex;
                if (++this._toIndex >= length) {
                    this._toIndex = 0;
                }
            }
            while (playedTime >= this._totalDuration);

            isListEnd = this._loopType == CC_ANIMATION_TYPE_MAX && this._toIndex == 0;

            if (isListEnd) {
                to = from = this._movementBoneData.getFrameData(this._fromIndex);
            }
            else {
                from = this._movementBoneData.getFrameData(this._fromIndex);
                to = this._movementBoneData.getFrameData(this._toIndex);
            }

            this._frameTweenEasing = from.tweenEasing;
            this.setBetween(from, to);
        }
        currentPercent = 1 - (this._totalDuration - playedTime) / this._betweenDuration;
        /*
         *  if frame tween easing equal to TWEEN_EASING_MAX, then it will not do tween.
         */
        var tweenType = null;

        if (this._frameTweenEasing != cc.TweenType.TWEEN_EASING_MAX) {
            tweenType = (this._tweenEasing == cc.TweenType.TWEEN_EASING_MAX) ? this._frameTweenEasing : this._tweenEasing;
            if (tweenType != cc.TweenType.TWEEN_EASING_MAX) {
                currentPercent = cc.TweenFunction.tweenTo(0, 1, currentPercent, 1, tweenType);
            }
        }
        return currentPercent;
    },

    /**
     * animation setter
     * @param {cc.ArmatureAnimation} animation
     */
    setAnimation:function (animation) {
        this._animation = animation;
    },

    /**
     * animation getter
     * @return {cc.ArmatureAnimation}
     */
    getAnimation:function () {
        return this._animation;
    },

    release:function () {
        this._from = null;
        this._between = null;
    }
});

/**
 * allocates and initializes a ArmatureAnimation.
 * @constructs
 * @param {cc.Bone} bone
 * @return {cc.ArmatureAnimation}
 * @example
 * // example
 * var animation = cc.ArmatureAnimation.create();
 */
cc.Tween.create = function (bone) {
    var tween = new cc.Tween();
    if (tween && tween.init(bone)) {
        return tween;
    }
    return null;
};
