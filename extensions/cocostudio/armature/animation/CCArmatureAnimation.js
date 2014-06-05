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
 * movement event type
 * @type {Object}
 */
ccs.MovementEventType = {
    start: 0,
    complete: 1,
    loopComplete: 2
};
/**
 * Base class for cc.MovementEvent objects.
 * @class
 * @extends ccs.Class
 */
ccs.AnimationEvent = ccs.Class.extend(/** @lends ccs.AnimationEvent# */{
    _arguments: null,
    _callFunc: null,
    _selectorTarget: null,
    ctor: function (target, callFunc, data) {
        this._data = data;
        this._callFunc = callFunc;
        this._selectorTarget = target;
    },
    call: function () {
        if (this._callFunc) {
            this._callFunc.apply(this._selectorTarget, this._arguments);
        }
    },
    setArguments: function (args) {
        this._arguments = args;
    }
});
/**
 * movement event
 * @constructor
 */
ccs.MovementEvent = function () {
    this.armature = null;
    this.movementType = "";
    this.movementID = "";
};
/**
 * frame event
 * @constructor
 */
ccs.FrameEvent = function () {
    this.bone = null;
    this.frameEventName = "";
    this.originFrameIndex = 0;
    this.currentFrameIndex = 0;
};
/**
 * Base class for ccs.ArmatureAnimation objects.
 * @class
 * @extends ccs.ProcessBase
 *
 * @property {ccs.AnimationData}    animationData       - Animation data
 * @property {Object}               userObject          - User custom object
 * @property {Boolean}              ignoreFrameEvent    - Indicate whether the frame event is ignored
 * @property {Number}               speedScale          - Animation play speed scale
 * @property {Number}               animationScale      - Animation play speed scale
 *
 */
ccs.ArmatureAnimation = ccs.ProcessBase.extend(/** @lends ccs.ArmatureAnimation# */{
    animationData: null,
    _movementData: null,
    _armature: null,
    _movementID: "",
    _prevFrameIndex: 0,
    _toIndex: 0,
    _tweenList: null,
    _frameEvent: null,
    _movementEvent: null,
    _speedScale: 1,
    ignoreFrameEvent: false,
    _frameEventQueue: null,
    _movementEventQueue: null,
    userObject: null,
    _movementList: null,
    _onMovementList: false,
    _movementListLoop: false,
    _movementIndex: 0,
    ctor: function () {
        ccs.ProcessBase.prototype.ctor.call(this);
        this.animationData = null;
        this._movementData = null;
        this._movementID = "";
        this._armature = null;
        this._prevFrameIndex = 0;
        this._toIndex = 0;
        this._tweenList = [];
        this._frameEvent = null;
        this._movementEvent = null;
        this._speedScale = 1;
        this.ignoreFrameEvent = false;
        this._frameEventQueue = [];
        this._movementEventQueue = [];
        this.userObject = null;
        this._movementList = [];
        this._onMovementList = false;
        this._movementListLoop = false;
        this._movementIndex = 0;
    },

    /**
     * init with a CCArmature
     * @param {ccs.Armature} armature
     * @return {Boolean}
     */
    init: function (armature) {
        this._armature = armature;
        this._tweenList = [];
        return true;
    },
    pause: function () {
        for (var i = 0; i < this._tweenList.length; i++) {
            this._tweenList[i].pause();
        }
        ccs.ProcessBase.prototype.pause.call(this);
    },
    resume: function () {
        for (var i = 0; i < this._tweenList.length; i++) {
            this._tweenList[i].resume();
        }
        ccs.ProcessBase.prototype.resume.call(this);
    },

    stop: function () {
        for (var i = 0; i < this._tweenList.length; i++) {
            this._tweenList[i].stop();
        }
        this._tweenList = [];
        ccs.ProcessBase.prototype.stop.call(this);
    },

    /**
     * scale animation play speed
     * @param {Number} speedScale
     */
    setSpeedScale: function (speedScale) {
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

    getSpeedScale: function () {
        return this._speedScale;
    },

    getAnimationScale: function () {
        return this.getSpeedScale();
    },
    setAnimationScale: function (animationScale) {
        return this.setSpeedScale(animationScale);
    },

    /**
     * play animation by animation name.
     * @param {String} animationName The animation name you want to play
     * @param {Number} [durationTo=-1]
     *         he frames between two animation changing-over.It's meaning is changing to this animation need how many frames
     *         -1 : use the value from CCMovementData get from flash design panel
     * @param {Number} [loop=-1]
     *          Whether the animation is loop.
     *         loop < 0 : use the value from CCMovementData get from flash design panel
     *         loop = 0 : this animation is not loop
     *         loop > 0 : this animation is loop
     * @example
     * // example
     * armature.getAnimation().play("run",-1,1);//loop play
     * armature.getAnimation().play("run",-1,0);//not loop play
     */
    play: function (animationName, durationTo, loop) {
        if (this.animationData == null) {
            cc.log("this.animationData can not be null");
            return;
        }
        this._movementData = this.animationData.getMovement(animationName);
        if (this._movementData == null) {
            cc.log("this._movementData can not be null");
            return;
        }
        if (durationTo === undefined) {
            durationTo = -1;
        }

        if (loop === undefined) {
            loop = -1;
        }

        var locMovementData = this._movementData;
        //Get key frame count
        this._rawDuration = locMovementData.duration;
        this._movementID = animationName;
        this._processScale = this._speedScale * locMovementData.scale;
        //Further processing parameters
        durationTo = (durationTo == -1) ? locMovementData.durationTo : durationTo;
        var durationTween = locMovementData.durationTween;
        durationTween = (durationTween == 0) ? this._rawDuration : durationTween;//todo
        var tweenEasing = locMovementData.tweenEasing;

        if (loop < 0) {
            loop = locMovementData.loop;
        } else {
            loop = Boolean(loop);
        }

        this._onMovementList = false;
        ccs.ProcessBase.prototype.play.call(this, durationTo, tweenEasing);

        if (this._rawDuration == 0) {
            this._loopType = ccs.ANIMATION_TYPE_SINGLE_FRAME;
        }
        else {
            if (loop) {
                this._loopType = ccs.ANIMATION_TYPE_TO_LOOP_FRONT;
            }
            else {
                this._loopType = ccs.ANIMATION_TYPE_NO_LOOP;
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
                if (bone.getChildArmature()) {
                    bone.getChildArmature().getAnimation().setProcessScale(this._processScale);
                }
            } else {
                if (!bone.getIgnoreMovementBoneData()) {
                    bone.getDisplayManager().changeDisplayWithIndex(-1, false);
                    tween.stop();
                }
            }
        }
        this._armature.update(0);
    },

    /**
     * play with names
     * @param {Array} movementNames
     * @param {Number} durationTo
     * @param {Boolean} loop
     */
    playWithNames: function (movementNames, durationTo, loop) {
        this._movementList = [];
        this._movementListLoop = loop;
        this._onMovementList = true;
        this._movementIndex = 0;

        for (var i = 0; i < movementNames.length; i++) {
            this._movementList.push({name: movementNames[i], durationTo: durationTo});
        }

        this.updateMovementList();
    },

    updateMovementList: function () {
        if (this._onMovementList) {
            if (this._movementListLoop) {
                var movementObj = this._movementList[this._movementIndex];
                this.play(movementObj.name, movementObj.durationTo, -1, 0);
                this._movementIndex++;
                if (this._movementIndex >= this._movementList.length) {
                    this._movementIndex = 0;
                }
            }
            else {
                if (this._movementIndex < this._movementList.length) {
                    var movementObj = this._movementList[this._movementIndex];
                    this.play(movementObj.name, movementObj.durationTo, -1, 0);
                    this._movementIndex++;
                }
                else {
                    this._onMovementList = false;
                }
            }
            this._onMovementList = true;
        }
    },

    /**
     * Go to specified frame and play current movement.
     * You need first switch to the movement you want to play, then call this function.
     *
     * example : playByIndex(0);
     *           gotoAndPlay(0);
     *           playByIndex(1);
     *           gotoAndPlay(0);
     *           gotoAndPlay(15);
     * @param {Number} frameIndex
     */
    gotoAndPlay: function (frameIndex) {
        if (!this._movementData || frameIndex < 0 || frameIndex >= this._movementData.duration) {
            cc.log("Please ensure you have played a movement, and the frameIndex is in the range.");
            return;
        }

        var ignoreFrameEvent = this.ignoreFrameEvent;
        this.ignoreFrameEvent = true;
        this._isPlaying = true;
        this._isComplete = this._isPause = false;

        ccs.ProcessBase.prototype.gotoFrame.call(this, frameIndex);
        this._currentPercent = this._curFrameIndex / (this._movementData.duration - 1);
        this._currentFrame = this._nextFrameIndex * this._currentPercent;

        for (var i = 0; i < this._tweenList.length; i++) {
            var tween = this._tweenList[i];
            tween.gotoAndPlay(frameIndex);
        }
        this._armature.update(0);
        this.ignoreFrameEvent = ignoreFrameEvent;
    },

    /**
     * Go to specified frame and pause current movement.
     * @param {Number} frameIndex
     */
    gotoAndPause: function (frameIndex) {
        this.gotoAndPlay(frameIndex);
        this.pause();
    },

    /**
     * Play animation with index, the other param is the same to play.
     * @param {Number||Array} animationIndex
     * @param {Number} durationTo
     * @param {Number} durationTween
     * @param {Number} loop
     * @param {Number} tweenEasing
     */
    playWithIndex: function (animationIndex, durationTo, durationTween, loop, tweenEasing) {
        if (typeof durationTo == "undefined") {
            durationTo = -1;
        }
        if (typeof loop == "undefined") {
            loop = -1;
        }
        var moveNames = this.animationData.movementNames;
        if (animationIndex < -1 || animationIndex >= moveNames.length) {
            return;
        }
        var animationName = moveNames[animationIndex];
        this.play(animationName, durationTo, loop, 0);
    },

    /**
     * Play animation with index, the o ther param is the same to play.
     * @param {Number} animationIndex
     * @param {Number} durationTo
     * @param {Number} durationTween
     * @param {Number} loop
     * @param {Number} tweenEasing
     */
    playByIndex: function (animationIndex, durationTo, durationTween, loop, tweenEasing) {
        cc.log("playByIndex is deprecated. Use playWithIndex instead.");
        this.playWithIndex(animationIndex, durationTo, durationTween, loop, tweenEasing);
    },

    /**
     *  play by indexes
     * @param movementIndexes
     * @param {Number} durationTo
     * @param {Boolean} loop
     */
    playWithIndexes: function (movementIndexes, durationTo, loop) {
        this._movementList = [];
        this._movementListLoop = loop;
        this._onMovementList = true;
        this._movementIndex = 0;

        var movName = this.animationData.movementNames;

        for (var i = 0; i < movementIndexes.length; i++) {
            var name = movName[movementIndexes[i]];
            this._movementList.push({name: name, durationTo: durationTo});
        }

        this.updateMovementList();
    },

    /**
     * get movement count
     * @return {Number}
     */
    getMovementCount: function () {
        return this.animationData.getMovementCount();
    },

    update: function (dt) {
        if (ccs.ProcessBase.prototype.update.call(this, dt)) {
            for (var i = 0; i < this._tweenList.length; i++) {
                this._tweenList[i].update(dt);
            }
        }

        var frameEvents = this._frameEventQueue;
        while (frameEvents.length > 0) {
            var frameEvent = frameEvents.shift();
            this.ignoreFrameEvent = true;
            this.callFrameEvent([frameEvent.bone, frameEvent.frameEventName, frameEvent.originFrameIndex, frameEvent.currentFrameIndex]);
            this.ignoreFrameEvent = false;
        }

        var movementEvents = this._movementEventQueue;
        while (movementEvents.length > 0) {
            var movEvent = movementEvents.shift();
            this.callMovementEvent([movEvent.armature, movEvent.movementType, movEvent.movementID]);
        }
    },

    /**
     * update will call this handler, you can handle your logic here
     */
    updateHandler: function () {
        var locCurrentPercent = this._currentPercent;
        if (locCurrentPercent >= 1) {
            switch (this._loopType) {
                case ccs.ANIMATION_TYPE_NO_LOOP:
                    this._loopType = ccs.ANIMATION_TYPE_MAX;
                    this._currentFrame = (locCurrentPercent - 1) * this._nextFrameIndex;
                    locCurrentPercent = this._currentFrame / this._durationTween;
                    if (locCurrentPercent < 1.0) {
                        this._nextFrameIndex = this._durationTween;
                        this.movementEvent(this._armature, ccs.MovementEventType.start, this._movementID);
                        break;
                    }
                case ccs.ANIMATION_TYPE_MAX:
                case ccs.ANIMATION_TYPE_SINGLE_FRAME:
                    locCurrentPercent = 1;
                    this._isComplete = true;
                    this._isPlaying = false;
                    this.movementEvent(this._armature, ccs.MovementEventType.complete, this._movementID);
                    this.updateMovementList();
                    break;
                case ccs.ANIMATION_TYPE_TO_LOOP_FRONT:
                    this._loopType = ccs.ANIMATION_TYPE_LOOP_FRONT;
                    locCurrentPercent = ccs.fmodf(locCurrentPercent, 1);
                    this._currentFrame = this._nextFrameIndex == 0 ? 0 : ccs.fmodf(this._currentFrame, this._nextFrameIndex);
                    this._nextFrameIndex = this._durationTween > 0 ? this._durationTween : 1;
                    this.movementEvent(this, ccs.MovementEventType.start, this._movementID);
                    break;
                default:
                    //locCurrentPercent = ccs.fmodf(locCurrentPercent, 1);
                    this._currentFrame = ccs.fmodf(this._currentFrame, this._nextFrameIndex);
                    this._toIndex = 0;
                    this.movementEvent(this._armature, ccs.MovementEventType.loopComplete, this._movementID);
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
    setMovementEventCallFunc: function (callFunc, target) {
        this._movementEvent = new ccs.AnimationEvent(target, callFunc);
    },

    /**
     * call event
     * @param {Array} args
     */
    callMovementEvent: function (args) {
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
    setFrameEventCallFunc: function (callFunc, target) {
        this._frameEvent = new ccs.AnimationEvent(target, callFunc);
    },

    /**
     * call event
     * @param {Array} args
     */
    callFrameEvent: function (args) {
        if (this._frameEvent) {
            this._frameEvent.setArguments(args);
            this._frameEvent.call();
        }
    },

    movementEvent: function (armature, movementType, movementID) {
        if (this._movementEvent) {
            var event = new ccs.MovementEvent();
            event.armature = armature;
            event.movementType = movementType;
            event.movementID = movementID;
            this._movementEventQueue.push(event);
        }
    },

    /**
     * @param {ccs.Bone} bone
     * @param {String} frameEventName
     * @param {Number} originFrameIndex
     * @param {Number} currentFrameIndex
     */
    frameEvent: function (bone, frameEventName, originFrameIndex, currentFrameIndex) {
        if (this._frameEvent) {
            var frameEvent = new ccs.FrameEvent();
            frameEvent.bone = bone;
            frameEvent.frameEventName = frameEventName;
            frameEvent.originFrameIndex = originFrameIndex;
            frameEvent.currentFrameIndex = currentFrameIndex;
            this._frameEventQueue.push(frameEvent);
        }
    },

    /**
     * animationData setter
     * @param {ccs.AnimationData} aniData
     */
    setAnimationData: function (aniData) {
        this.animationData = aniData;
    },

    /**
     * animationData getter
     * @return {ccs.AnimationData}
     */
    getAnimationData: function () {
        return this.animationData;
    },
    /**
     * userObject setter
     * @param {Object} userObject
     */
    setUserObject: function (userObject) {
        this.userObject = userObject;
    },

    /**
     * userObject getter
     * @return {Object}
     */
    getUserObject: function () {
        return this.userObject;
    },

    /**
     * Determines if the frame event is ignored
     * @returns {boolean}
     */
    isIgnoreFrameEvent: function () {
        return this.ignoreFrameEvent;
    },

    /**
     * Sets whether the frame event is ignored
     * @param {Boolean} bool
     */
    setIgnoreFrameEvent: function (bool) {
        this.ignoreFrameEvent = bool;
    }
});

var _p = ccs.ArmatureAnimation.prototype;

// Extended properties
/** @expose */
_p.speedScale;
cc.defineGetterSetter(_p, "speedScale", _p.getSpeedScale, _p.setSpeedScale);
/** @expose */
_p.animationScale;
cc.defineGetterSetter(_p, "animationScale", _p.getAnimationScale, _p.setAnimationScale);

_p = null;

/**
 * allocates and initializes a ArmatureAnimation.
 * @constructs
 * @return {ccs.ArmatureAnimation}
 * @example
 * // example
 * var animation = ccs.ArmatureAnimation.create();
 */
ccs.ArmatureAnimation.create = function (armature) {
    var animation = new ccs.ArmatureAnimation();
    if (animation && animation.init(armature)) {
        return animation;
    }
    return null;
};