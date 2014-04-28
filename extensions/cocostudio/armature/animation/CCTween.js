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

/**
 * Base class for ccs.Tween objects.
 * @class
 * @extends ccs.ProcessBase
 *
 * @property {ccs.ArmatureAnimation}    animation   - The animation
 */
ccs.Tween = ccs.ProcessBase.extend(/** @lends ccs.Tween# */{
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
    animation:null,
    _passLastFrame:false,
    ctor:function () {
        ccs.ProcessBase.prototype.ctor.call(this);
        this._tweenData = null;
        this._to = null;
        this._from = null;
        this._between = null;
        this._bone = null;
        this._movementBoneData = null;
        this._frameTweenEasing = ccs.TweenType.linear;
        this._toIndex = 0;
        this._fromIndex = 0;
        this.animation = null;
        this._passLastFrame = false;
    },

    /**
     * init with a CCBone
     * @param {ccs.Bone} bone
     * @return {Boolean}
     */
    init:function (bone) {
        this._from = new ccs.FrameData();
        this._between = new ccs.FrameData();

        this._bone = bone;
        this._tweenData = this._bone.getTweenData();
        this._tweenData.displayIndex = -1;
         var armature = bone.getArmature();
        if (armature) this.animation = armature.getAnimation();
        return true;
    },

    /**
     * Start the Process
     * @param {ccs.MovementBoneData} movementBoneData
     * @param {Number} durationTo
     * @param {Number} durationTween
     * @param {Boolean} loop
     * @param {ccs.TweenType} tweenEasing
     */
    play:function (movementBoneData, durationTo, durationTween, loop, tweenEasing) {
        ccs.ProcessBase.prototype.play.call(this, durationTo, tweenEasing);

        if(loop){
            this._loopType = ccs.ANIMATION_TYPE_TO_LOOP_FRONT;
        }else{
            this._loopType = ccs.ANIMATION_TYPE_NO_LOOP;
        }

        this._totalDuration = 0;
        this._betweenDuration = 0;
        this._fromIndex = this._toIndex = 0;

        var difMovement = movementBoneData != this._movementBoneData;
        this._movementBoneData = movementBoneData;
        this._rawDuration = this._movementBoneData.duration;
        var nextKeyFrame = this._movementBoneData.getFrameData(0);
        this._tweenData.displayIndex = nextKeyFrame.displayIndex;

        if (this._bone.getArmature().getArmatureData().dataVersion >= ccs.CONST_VERSION_COMBINED)        {
            ccs.TransformHelp.nodeSub(this._tweenData, this._bone.getBoneData());
            this._tweenData.scaleX += 1;
            this._tweenData.scaleY += 1;
        }

        if (this._rawDuration == 0 || this._movementBoneData.frameList.length == 1) {
            this._loopType = ccs.ANIMATION_TYPE_SINGLE_FRAME;
            if (durationTo == 0) {
                this.setBetween(nextKeyFrame, nextKeyFrame);
            } else {
                this.setBetween(this._tweenData, nextKeyFrame);
            }
            this._frameTweenEasing = ccs.TweenType.linear;
        }
        else if (this._movementBoneData.frameList.length > 1) {
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

    gotoAndPlay: function (frameIndex) {
        ccs.ProcessBase.prototype.gotoFrame.call(this, frameIndex);
        this._totalDuration = 0;
        this._betweenDuration = 0;
        this._fromIndex = this._toIndex = 0;
        this._isPlaying = true;
        this._isComplete = this._isPause = false;
        this._currentPercent = this._curFrameIndex / (this._rawDuration-1);
        this._currentFrame = this._nextFrameIndex * this._currentPercent;
    },

    gotoAndPause: function (frameIndex) {
        this.gotoAndPlay(frameIndex);
        this.pause();
    },

    /**
     * update will call this handler, you can handle your logic here
     */
    updateHandler:function () {
        var locCurrentPercent = this._currentPercent;
        var locLoopType = this._loopType;
        if (locCurrentPercent >= 1) {
            switch (locLoopType) {
                case ccs.ANIMATION_TYPE_SINGLE_FRAME:
                    locCurrentPercent = 1;
                    this._isComplete = true;
                    this._isPlaying = false;
                    break;
                case ccs.ANIMATION_TYPE_NO_LOOP:
                    locLoopType = ccs.ANIMATION_TYPE_MAX;
                    if (this._durationTween <= 0) {
                        locCurrentPercent = 1;
                    }
                    else {
                        locCurrentPercent = (locCurrentPercent - 1) * this._nextFrameIndex / this._durationTween;
                    }
                    if (locCurrentPercent >= 1) {
                        locCurrentPercent = 1;
                        this._isComplete = true;
                        this._isPlaying = false;
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
                case ccs.ANIMATION_TYPE_TO_LOOP_FRONT:
                    locLoopType = ccs.ANIMATION_TYPE_LOOP_FRONT;
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
                case ccs.ANIMATION_TYPE_MAX:
                    locCurrentPercent = 1;
                    this._isComplete = true;
                    this._isPlaying = false;
                    break;
                default:
                    this._currentFrame = ccs.fmodf(this._currentFrame, this._nextFrameIndex);
                    this._totalDuration = 0;
                    this._betweenDuration = 0;
                    break;
            }
        }

        if (locCurrentPercent < 1 && locLoopType < ccs.ANIMATION_TYPE_TO_LOOP_BACK) {
            locCurrentPercent = Math.sin(locCurrentPercent * cc.PI / 2);
        }

        this._currentPercent = locCurrentPercent;
        this._loopType = locLoopType;

        if (locLoopType > ccs.ANIMATION_TYPE_TO_LOOP_BACK) {
            locCurrentPercent = this.updateFrameData(locCurrentPercent);
        }
        if (this._frameTweenEasing != ccs.TweenType.tweenEasingMax) {
            this.tweenNodeTo(locCurrentPercent);
        }
    },

    /**
     * Calculate the between value of _from and _to, and give it to between frame data
     * @param {ccs.FrameData} from
     * @param {ccs.FrameData} to
     * @param {Boolean} limit
     */
    setBetween:function (from, to, limit) {
        if (typeof limit == "undefined") {
            limit = true;
        }
        do
        {
            if (from.displayIndex < 0 && to.displayIndex >= 0) {
                this._from.copy(to);
                this._between.subtract(to, to, limit);
                break;
            }
            if (to.displayIndex < 0 && from.displayIndex >= 0) {
                this._from.copy(from);
                this._between.subtract(to, to, limit);
                break;
            }
            this._from.copy(from);
            this._between.subtract(from, to, limit);
        } while (0);
        if (!from.isTween){
            this._tweenData.copy(from);
            this._tweenData.isTween = true;
        }
        this.arriveKeyFrame(from);
    },

    /**
     * Update display index and process the key frame event when arrived a key frame
     * @param {ccs.FrameData} keyFrameData
     */
    arriveKeyFrame:function (keyFrameData) {
        if (keyFrameData) {
            var locBone = this._bone;
            var displayIndex = keyFrameData.displayIndex;
            var displayManager = locBone.getDisplayManager();
            if (!displayManager.getForceChangeDisplay()) {
                displayManager.changeDisplayWithIndex(displayIndex, false);
                var locRenderNode = displayManager.getDisplayRenderNode();
                if(locRenderNode)
                    locRenderNode.setBlendFunc(keyFrameData.blendFunc);
            }
            this._tweenData.zOrder = keyFrameData.zOrder;
            locBone.updateZOrder();
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
     * @param {ccs.FrameData} node
     * @return {ccs.FrameData}
     */
    tweenNodeTo:function (percent, node) {
        if (!node) {
            node = this._tweenData;
        }
        var locFrom = this._from;
        var locBetween = this._between;
        if (!locFrom.isTween){
            percent = 0;
        }
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
     * @return {Number}
     */
    updateFrameData:function (currentPercent) {
        if (currentPercent > 1 && this._movementBoneData.delay != 0) {
            currentPercent = ccs.fmodf(currentPercent,1);
        }
        var playedTime = (this._rawDuration-1) * currentPercent;
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
            else if (playedTime >= frames[length - 1].frameID) {
                if (this._passLastFrame) {
                    from = to = frames[length - 1];
                    this.setBetween(from, to);
                    return currentPercent;
                }
                this._passLastFrame = true;
            } else {
                this._passLastFrame = false;
            }

            do {
                this._fromIndex = locToIndex;
                from = frames[this._fromIndex];
                locTotalDuration = from.frameID;
                locToIndex = this._fromIndex + 1;
                if (locToIndex >= length) {
                    locToIndex = 0;
                }
                to = frames[locToIndex];

                //! Guaranteed to trigger frame event
                if(from.event&& !this.animation.isIgnoreFrameEvent()){
                    this.animation.frameEvent(this._bone, from.event,from.frameID, playedTime);
                }

                if (playedTime == from.frameID|| (this._passLastFrame && this._fromIndex == length-1)){
                    break;
                }
            }
            while  (playedTime < from.frameID || playedTime >= to.frameID);

            locBetweenDuration = to.frameID - from.frameID;
            this._frameTweenEasing = from.tweenEasing;
            this.setBetween(from, to, false);
            this._totalDuration = locTotalDuration;
            this._betweenDuration = locBetweenDuration;
            this._toIndex = locToIndex;
        }

        currentPercent = locBetweenDuration == 0 ? 0 : (playedTime - locTotalDuration) / locBetweenDuration;

        /*
         *  if frame tween easing equal to TWEEN_EASING_MAX, then it will not do tween.
         */
        var tweenType = (this._frameTweenEasing != ccs.TweenType.linear) ? this._frameTweenEasing : this._tweenEasing;
        if (tweenType != ccs.TweenType.tweenEasingMax&&tweenType != ccs.TweenType.linear&& !this._passLastFrame) {
            currentPercent = ccs.TweenFunction.tweenTo(currentPercent, tweenType, this._from.easingParams);
        }
        return currentPercent;
    },

    /**
     * animation setter
     * @param {ccs.ArmatureAnimation} animation
     */
    setAnimation:function (animation) {
        this.animation = animation;
    },

    /**
     * animation getter
     * @return {ccs.ArmatureAnimation}
     */
    getAnimation:function () {
        return this.animation;
    },

    release:function () {
        this._from = null;
        this._between = null;
    }
});

/**
 * allocates and initializes a ArmatureAnimation.
 * @constructs
 * @param {ccs.Bone} bone
 * @return {ccs.ArmatureAnimation}
 * @example
 * // example
 * var animation = ccs.ArmatureAnimation.create();
 */
ccs.Tween.create = function (bone) {
    var tween = new ccs.Tween();
    if (tween && tween.init(bone)) {
        return tween;
    }
    return null;
};
