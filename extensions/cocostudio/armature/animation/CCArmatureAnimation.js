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

    /**
     *
     * @param {function} callFunc
     * @param {object} target
     * @param {object} [data]
     */
    ctor: function (callFunc,target, data) {
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
    _animationData: null,
    _movementData: null,
    _armature: null,
    _movementID: "",
    _toIndex: 0,
    _tweenList: null,
    _speedScale: 1,
    _ignoreFrameEvent: false,
    _frameEventQueue: null,
    _movementEventQueue: null,
    _movementList: null,
    _onMovementList: false,
    _movementListLoop: false,
    _movementIndex: 0,
    _movementListDurationTo: -1,

    _movementEventCallFunc: null,
    _frameEventCallFunc: null,
    _movementEventTarget: null,
    _frameEventTarget:null,
    _movementEventListener: null,
    _frameEventListener: null,

    ctor: function () {
        ccs.ProcessBase.prototype.ctor.call(this);

        this._tweenList = [];
        this._movementList = [];
        this._frameEventQueue = [];
        this._movementEventQueue = [];
    },

    /**
     * init with a CCArmature
     * @param {ccs.Armature} armature
     * @return {Boolean}
     */
    init: function (armature) {
        this._armature = armature;
        this._tweenList.length = 0;
        return true;
    },

    pause: function () {
        var locTweenList = this._tweenList;
        for (var i = 0; i < locTweenList.length; i++)
            locTweenList[i].pause();
        ccs.ProcessBase.prototype.pause.call(this);
    },

    resume: function () {
        var locTweenList = this._tweenList;
        for (var i = 0; i < locTweenList.length; i++)
            locTweenList[i].resume();
        ccs.ProcessBase.prototype.resume.call(this);
    },

    stop: function () {
        var locTweenList = this._tweenList;
        for (var i = 0; i < locTweenList.length; i++)
            locTweenList[i].stop();
        locTweenList.length = 0;
        ccs.ProcessBase.prototype.stop.call(this);
    },

    setAnimationScale: function (animationScale) {
        return this.setSpeedScale(animationScale);
    },

    getAnimationScale: function () {
        return this.getSpeedScale();
    },

    /**
     * scale animation play speed
     * @param {Number} speedScale
     */
    setSpeedScale: function (speedScale) {
        if (speedScale == this._speedScale)
            return;
        this._speedScale = speedScale;
        this._processScale = !this._movementData ? this._speedScale : this._speedScale * this._movementData.scale;
        var dict = this._armature.getBoneDic();
        for (var key in dict) {
            var bone = dict[key];
            bone.getTween().setProcessScale(this._processScale);
            if (bone.getChildArmature())
                bone.getChildArmature().getAnimation().setProcessScale(this._processScale);
        }
    },

    getSpeedScale: function () {
        return this._speedScale;
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
        cc.assert(this._animationData, "this.animationData can not be null");

        this._movementData = this._animationData.getMovement(animationName);
        cc.assert(this._movementData, "this._movementData can not be null");

        durationTo = (durationTo === undefined) ? -1 : durationTo;
        loop = (loop === undefined) ? -1 : loop;

        //! Get key frame count
        this._rawDuration = this._movementData.duration;
        this._movementID = animationName;
        this._processScale = this._speedScale * this._movementData.scale;

        //! Further processing parameters
        durationTo = (durationTo == -1) ? this._movementData.durationTo : durationTo;
        var durationTween = this._movementData.durationTween == 0 ? this._rawDuration : this._movementData.durationTween;

        var tweenEasing = this._movementData.tweenEasing;
        loop = (!loop || loop < 0) ? this._movementData.loop : loop;
        this._onMovementList = false;

        ccs.ProcessBase.prototype.play.call(this, durationTo, durationTween, loop, tweenEasing);

        if (this._rawDuration == 0)
            this._loopType = ccs.ANIMATION_TYPE_SINGLE_FRAME;
        else {
            this._loopType = loop ? ccs.ANIMATION_TYPE_TO_LOOP_FRONT : ccs.ANIMATION_TYPE_NO_LOOP;
            this._durationTween = durationTween;
        }

        var movementBoneData;
        this._tweenList = [];

        var map = this._armature.getBoneDic();
        for(var element in map) {
            var bone = map[element];
            movementBoneData = this._movementData.movBoneDataDic[bone.getName()];

            var tween = bone.getTween();
            if(movementBoneData && movementBoneData.frameList.length > 0) {
                this._tweenList.push(tween);
                movementBoneData.duration = this._movementData.duration;
                tween.play(movementBoneData, durationTo, durationTween, loop, tweenEasing);
                tween.setProcessScale(this._processScale);

                if (bone.getChildArmature())
                    bone.getChildArmature().getAnimation().setProcessScale(this._processScale);
            } else {
                if(!bone.isIgnoreMovementBoneData()){
                    //! this bone is not include in this movement, so hide it
                    bone.getDisplayManager().changeDisplayWithIndex(-1, false);
                    tween.stop();
                }
            }
        }
        this._armature.update(0);
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
        this.playWithIndex(animationIndex, durationTo, loop);
    },

    /**
     * Play animation with index, the other param is the same to play.
     * @param {Number||Array} animationIndex
     * @param {Number} durationTo
     * @param {Number} loop
     */
    playWithIndex: function (animationIndex, durationTo, loop) {
        var movName = this._animationData.movementNames;
        cc.assert((animationIndex > -1) && (animationIndex < movName.length));

        var animationName = movName[animationIndex];
        this.play(animationName, durationTo, loop);
    },

    /**
     * play with names
     * @param {Array} movementNames
     * @param {Number} durationTo
     * @param {Boolean} loop
     */
    playWithNames: function (movementNames, durationTo, loop) {
        durationTo = (durationTo === undefined) ? -1 : durationTo;
        loop = (loop === undefined) ? true : loop;

        this._movementListLoop = loop;
        this._movementListDurationTo = durationTo;
        this._onMovementList = true;
        this._movementIndex = 0;
        if(movementNames instanceof Array)
            this._movementList = movementNames;
        else
            this._movementList.length = 0;

        this.updateMovementList();
    },

    /**
     *  play by indexes
     * @param movementIndexes
     * @param {Number} durationTo
     * @param {Boolean} loop
     */
    playWithIndexes: function (movementIndexes, durationTo, loop) {
        durationTo = (durationTo === undefined) ? -1 : durationTo;
        loop = (loop === undefined) ? true : loop;

        this._movementList.length = 0;
        this._movementListLoop = loop;
        this._movementListDurationTo = durationTo;
        this._onMovementList = true;
        this._movementIndex = 0;

        var movName = this._animationData.movementNames;

        for (var i = 0; i < movementIndexes.length; i++) {
            var name = movName[movementIndexes[i]];
            this._movementList.push(name);
        }

        this.updateMovementList();
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

        var ignoreFrameEvent = this._ignoreFrameEvent;
        this._ignoreFrameEvent = true;
        this._isPlaying = true;
        this._isComplete = this._isPause = false;

        ccs.ProcessBase.prototype.gotoFrame.call(this, frameIndex);
        this._currentPercent = this._curFrameIndex / (this._movementData.duration - 1);
        this._currentFrame = this._nextFrameIndex * this._currentPercent;

        var locTweenList = this._tweenList;
        for (var i = 0; i < locTweenList.length; i++) {
            locTweenList[i].gotoAndPlay(frameIndex);
        }
        this._armature.update(0);
        this._ignoreFrameEvent = ignoreFrameEvent;
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
     * get movement count
     * @return {Number}
     */
    getMovementCount: function () {
        return this._animationData.getMovementCount();
    },

    update: function (dt) {
        ccs.ProcessBase.prototype.update.call(this, dt);

        var locTweenList = this._tweenList;
        for (var i = 0; i < locTweenList.length; i++)
            locTweenList[i].update(dt);

        var frameEvents = this._frameEventQueue, event;
        while (frameEvents.length > 0) {
            event = frameEvents.shift();
            this._ignoreFrameEvent = true;
            if(this._frameEventCallFunc)
                this._frameEventCallFunc.call(this._frameEventTarget, event.bone, event.frameEventName, event.originFrameIndex, event.currentFrameIndex);
            if(this._frameEventListener)
                this._frameEventListener(event.bone, event.frameEventName, event.originFrameIndex, event.currentFrameIndex);
            this._ignoreFrameEvent = false;
        }

        var movementEvents = this._movementEventQueue;
        while (movementEvents.length > 0) {
            event = movementEvents.shift();
            if(this._movementEventCallFunc)
                this._movementEventCallFunc.call(this._movementEventTarget, event.armature, event.movementType, event.movementID);
            if (this._movementEventListener)
                this._movementEventListener(event.armature, event.movementType, event.movementID);
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
                    break;
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
     * @param {function} callFunc
     * @param {Object} target
     */
    setMovementEventCallFunc: function (callFunc, target) {
        if(arguments.length == 1){
            this._frameEventListener = target;
        }else if(arguments.length == 2){
            this._movementEventTarget = target;
            this._movementEventCallFunc = callFunc;
        }
    },

    /**
     * connect a event
     * @param {function} callFunc
     * @param {Object} target
     */
    setFrameEventCallFunc: function (callFunc, target) {
        if(arguments.length == 1){
            this._frameEventListener = target;
        }else if(arguments.length == 2){
            this._frameEventTarget = target;
            this._frameEventCallFunc = callFunc;
        }
    },

    /**
     * userObject setter
     * @param {Object} userObject
     */
    setUserObject: function (userObject) {
        this._userObject = userObject;
    },

    /**
     * @param {ccs.Bone} bone
     * @param {String} frameEventName
     * @param {Number} originFrameIndex
     * @param {Number} currentFrameIndex
     */
    frameEvent: function (bone, frameEventName, originFrameIndex, currentFrameIndex) {
        if ((this._frameEventTarget && this._frameEventCallFunc) || this._frameEventListener) {
            var frameEvent = new ccs.FrameEvent();
            frameEvent.bone = bone;
            frameEvent.frameEventName = frameEventName;
            frameEvent.originFrameIndex = originFrameIndex;
            frameEvent.currentFrameIndex = currentFrameIndex;

            this._frameEventQueue.push(frameEvent);
        }
    },

    movementEvent: function (armature, movementType, movementID) {
        if ((this._movementEventTarget && this._movementEventCallFunc) || this._movementEventListener) {
            var event = new ccs.MovementEvent();
            event.armature = armature;
            event.movementType = movementType;
            event.movementID = movementID;
            this._movementEventQueue.push(event);
        }
    },

    updateMovementList: function () {
        if (this._onMovementList) {
            var movementObj, locMovementList = this._movementList;
            if (this._movementListLoop) {
                movementObj = locMovementList[this._movementIndex];
                this.play(movementObj, movementObj.durationTo, 0);
                this._movementIndex++;
                if (this._movementIndex >= locMovementList.length)
                    this._movementIndex = 0;
            } else {
                if (this._movementIndex < locMovementList.length) {
                    movementObj = locMovementList[this._movementIndex];
                    this.play(movementObj, movementObj.durationTo, 0);
                    this._movementIndex++;
                } else
                    this._onMovementList = false;
            }
            this._onMovementList = true;
        }
    },

    /**
     * animationData setter
     * @param {ccs.AnimationData} data
     */
    setAnimationData: function (data) {
        if(this._animationData != data)
            this._animationData = data;
    },

    /**
     * animationData getter
     * @return {ccs.AnimationData}
     */
    getAnimationData: function () {
        return this._animationData;
    },

    /**
     * userObject getter
     * @return {Object}
     */
    getUserObject: function () {
        return this._userObject;
    },

    /**
     * Determines if the frame event is ignored
     * @returns {boolean}
     */
    isIgnoreFrameEvent: function () {
        return this._ignoreFrameEvent;
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