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
    _bone:null,
    _frameTweenEasing:0,
    _betweenDuration:0,
    _totalDuration:0,
    _toIndex:0,
    _fromIndex:0,
    _animation:null,
    ctor:function () {
        cc.ProcessBase.prototype.ctor.call(this);
        this._tweenData = null;
        this._to = null;
        this._from = null;
        this._between = null;
        this._bone = null;
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
        this._tweenData.displayIndex = -1;
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

        this._totalDuration = 0;
        this._betweenDuration = 0;
        this._fromIndex = this._toIndex = 0;

        var difMovement = movementBoneData != this._movementBoneData;

        this._movementBoneData = movementBoneData;

        this._rawDuration = this._movementBoneData.duration;

        var nextKeyFrame = this._movementBoneData.getFrameData(0);
        this._tweenData.displayIndex = nextKeyFrame.displayIndex;

        if (this._bone.getArmature().getArmatureData().dataVersion >= cc.CONST_VERSION_COMBINED)        {
            cc.TransformHelp.nodeSub(this._tweenData, this._bone.getBoneData());
            this._tweenData.scaleX += 1;
            this._tweenData.scaleY += 1;
        }

        if (this._rawDuration==0) {
            this._loopType = CC_ANIMATION_TYPE_SINGLE_FRAME;
            if (durationTo == 0) {
                this.setBetween(nextKeyFrame, nextKeyFrame);
            } else {
                this.setBetween(this._tweenData, nextKeyFrame);
            }
            this._frameTweenEasing = cc.TweenType.Linear;
        }
        else if (this._movementBoneData.frameList.length > 1) {
            if (loop) {
                this._loopType = CC_ANIMATION_TYPE_TO_LOOP_BACK;
            }
            else {
                this._loopType = CC_ANIMATION_TYPE_NO_LOOP;
            }

            this._durationTween = durationTween * this._movementBoneData.scale;
            if (loop && this._movementBoneData.delay != 0) {
                this.setBetween(this._tweenData, this.tweenNodeTo(this.updateFrameData(1 - this._movementBoneData.delay), this._between));
            }
            else {
                if (!difMovement || durationTo == 0)
                    this.setBetween(nextKeyFrame, nextKeyFrame);
                else
                    this.setBetween(this._tweenData, nextKeyFrame);
            }
        }
        this.tweenNodeTo(0);
    },

    /**
     * update will call this handler, you can handle your logic here
     */
    updateHandler:function () {
        var locCurrentPercent = this._currentPercent;
        var locLoopType = this._loopType;
        if (locCurrentPercent >= 1) {
            switch (locLoopType) {
                case CC_ANIMATION_TYPE_SINGLE_FRAME:
                    locCurrentPercent = 1;
                    this._isComplete = true;
                    break;
                case CC_ANIMATION_TYPE_NO_LOOP:
                    locLoopType = CC_ANIMATION_TYPE_MAX;
                    if (this._durationTween <= 0) {
                        locCurrentPercent = 1;
                    }
                    else {
                        locCurrentPercent = (locCurrentPercent - 1) * this._nextFrameIndex / this._durationTween;
                    }
                    if (locCurrentPercent >= 1) {
                        locCurrentPercent = 1;
                        this._isComplete = true;
                        break;
                    }
                    else {
                        this._nextFrameIndex = this._durationTween;
                        this._currentFrame = locCurrentPercent * this._nextFrameIndex;
                        this._totalDuration = 0;
                        this._betweenDuration = 0;
                        this._fromIndex = this._toIndex = 0;
                        break;
                    }
                case CC_ANIMATION_TYPE_TO_LOOP_BACK:
                    locLoopType = CC_ANIMATION_TYPE_LOOP_BACK;
                    this._nextFrameIndex = this._durationTween > 0 ? this._durationTween : 1;
                    if (this._movementBoneData.delay != 0) {
                        this._currentFrame = (1 - this._movementBoneData.delay) * this._nextFrameIndex;
                        locCurrentPercent = this._currentFrame / this._nextFrameIndex;

                    } else {
                        locCurrentPercent = 0;
                        this._currentFrame = 0;
                    }

                    this._totalDuration = 0;
                    this._betweenDuration = 0;
                    this._fromIndex = this._toIndex = 0;
                    break;
                case CC_ANIMATION_TYPE_MAX:
                    locCurrentPercent = 1;
                    this._isComplete = true;
                    break;
                default:
                    locCurrentPercent = cc.fmodf(locCurrentPercent, 1);
                    this._currentFrame = cc.fmodf(this._currentFrame, this._nextFrameIndex);
                    this._totalDuration = 0;
                    this._betweenDuration = 0;
                    this._fromIndex = this._toIndex = 0;
                    break;
            }
        }

        if (locCurrentPercent < 1 && locLoopType < CC_ANIMATION_TYPE_TO_LOOP_BACK) {
            locCurrentPercent = Math.sin(locCurrentPercent * cc.PI / 2);
        }

        this._currentPercent = locCurrentPercent;
        this._loopType = locLoopType;

        if (locLoopType > CC_ANIMATION_TYPE_TO_LOOP_BACK) {
            locCurrentPercent = this.updateFrameData(locCurrentPercent, true);
        }
        if (this._frameTweenEasing != cc.TweenType.TWEEN_EASING_MAX) {
            this.tweenNodeTo(locCurrentPercent);
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
            if (from.displayIndex < 0 && to.displayIndex >= 0) {
                this._from.copy(to);
                this._between.subtract(to, to);
                break;
            }
            if (to.displayIndex < 0 && from.displayIndex >= 0) {
                this._from.copy(from);
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
            var locBone = this._bone;
            var displayIndex = keyFrameData.displayIndex;
            var displayManager = locBone.getDisplayManager();
            if (!displayManager.getForceChangeDisplay()) {
                displayManager.changeDisplayByIndex(displayIndex, false);

            }
            this._tweenData.zOrder = keyFrameData.zOrder;
            locBone.updateZOrder();
            locBone.setBlendType(keyFrameData.blendType);
            var childAramture = locBone.getChildArmature();
            if (childAramture) {
                if (keyFrameData.movement != "") {
                    childAramture.getAnimation().play(keyFrameData.movement);
                }
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
        var locFrom = this._from;
        var locBetween = this._between;
        node.x = locFrom.x + percent * locBetween.x;
        node.y = locFrom.y + percent * locBetween.y;
        node.scaleX = locFrom.scaleX + percent * locBetween.scaleX;
        node.scaleY = locFrom.scaleY + percent * locBetween.scaleY;
        node.skewX = locFrom.skewX + percent * locBetween.skewX;
        node.skewY = locFrom.skewY + percent * locBetween.skewY;

        this._bone.setTransformDirty(true);
        if (node && locBetween.isUseColorInfo)
            this.tweenColorTo(percent, node);

        return node;
    },

    tweenColorTo:function(percent,node){
        var locFrom = this._from;
        var locBetween = this._between;
        node.a = locFrom.a + percent * locBetween.a;
        node.r = locFrom.r + percent * locBetween.r;
        node.g = locFrom.g + percent * locBetween.g;
        node.b = locFrom.b + percent * locBetween.b;
        this._bone.updateColor();
    },

    /**
     * Calculate which frame arrived, and if current frame have event, then call the event listener
     * @param {Number} currentPercent
     * @param {Boolean} activeFrame
     * @return {Number}
     */
    updateFrameData:function (currentPercent) {
        if (currentPercent > 1 && this._movementBoneData.delay != 0) {
            currentPercent = cc.fmodf(currentPercent,1);
        }
        var playedTime = this._rawDuration * currentPercent;
        var from, to;
        var locTotalDuration = this._totalDuration,locBetweenDuration = this._betweenDuration, locToIndex = this._toIndex;
        // if play to current frame's front or back, then find current frame again
        if (playedTime < locTotalDuration || playedTime >= locTotalDuration + locBetweenDuration) {
            /*
             *  get frame length, if this._toIndex >= _length, then set this._toIndex to 0, start anew.
             *  this._toIndex is next index will play
             */
            var length = this._movementBoneData.frameList.length;
            var frames = this._movementBoneData.frameList;
            if (playedTime < frames[0].frameID){
                from = to = frames[0];
                this.setBetween(from, to);
                return currentPercent;
            }
            else if(playedTime >= frames[length - 1].frameID){
                from = to = frames[length - 1];
                this.setBetween(from, to);
                return currentPercent;
            }

            do {
                from = frames[this._fromIndex];
                locTotalDuration = from.frameID;
                if (++locToIndex >= length) {
                    locToIndex = 0;
                }
                this._fromIndex = locToIndex;
                to = frames[locToIndex];

                //! Guaranteed to trigger frame event
                if(from.event){
                    this._animation.callFrameEvent([this._bone, from.event,from.frameID, playedTime]);
                }

                if (playedTime == from.frameID)                {
                    break;
                }
            }
            while  (playedTime < from.frameID || playedTime >= to.frameID);

            locBetweenDuration = to.frameID - from.frameID;
            this._frameTweenEasing = from.tweenEasing;
            this.setBetween(from, to);
            this._totalDuration = locTotalDuration;
            this._betweenDuration = locBetweenDuration;
            this._toIndex = locToIndex;
        }

        currentPercent = locBetweenDuration == 0 ? 0 : (playedTime - locTotalDuration) / locBetweenDuration;

        /*
         *  if frame tween easing equal to TWEEN_EASING_MAX, then it will not do tween.
         */
        var tweenType = null;
        var locTWEEN_EASING_MAX = cc.TweenType.TWEEN_EASING_MAX;
        if (this._frameTweenEasing != locTWEEN_EASING_MAX) {
            tweenType = (this._tweenEasing == locTWEEN_EASING_MAX) ? this._frameTweenEasing : this._tweenEasing;
            if (tweenType != locTWEEN_EASING_MAX&&tweenType != cc.TweenType.Linear) {
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
