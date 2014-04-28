cc.SP_ANIMATION_EVENT_TYPE = {
    START: 0,
    END: 1,
    COMPLETE: 2,
    EVENT: 3
};

cc.SkeletonAnimation = cc.Skeleton.extend({
    _state: null,
    _target: null,
    _callback: null,
    init: function () {
        this._super();
        this.setAnimationStateData(new spine.AnimationStateData(this._skeleton.data));
    },
    setAnimationStateData: function (stateData) {
        this._state = new spine.AnimationState(stateData);
        this._state.onStart = this._onAnimationStateStart.bind(this);
        this._state.onComplete = this._onAnimationStateComplete.bind(this);
        this._state.onEnd = this._onAnimationStateEnd.bind(this);
        this._state.onEvent = this._onAnimationStateEvent.bind(this);
    },
    setMix: function (fromAnimation, toAnimation, duration) {
        this._state.data.setMixByName(fromAnimation, toAnimation, duration);
    },
    setAnimationListener: function (target, callback) {
        this._target = target;
        this._callback = callback;
    },
    setAnimation: function (trackIndex, name, loop) {
        var animation = this._skeleton.data.findAnimation(name);
        if (!animation) {
            cc.log("Spine: Animation not found: " + name);
            return 0;
        }
        return this._state.setAnimation(trackIndex, animation, loop);
    },
    addAnimation: function (trackIndex, name, loop, delay) {
        var animation = this._skeleton.data.findAnimation(name);
        if (!animation) {
            cc.log("Spine: Animation not found:" + name);
            return 0;
        }
        return this._state.addAnimation(trackIndex, animation, loop, delay);
    },
    getCurrent: function (trackIndex) {
        return this._state.getCurrent(trackIndex);
    },
    clearTracks: function () {
        this._state.clearTracks();
    },
    clearTrack: function (trackIndex) {
        this._state.clearTrack(trackIndex);
    },
    update: function (dt) {
        this._super(dt);

        dt *= this._timeScale;
        this._state.update(dt);
        this._state.apply(this._skeleton);
        this._skeleton.updateWorldTransform();
    },
    _onAnimationStateStart: function (trackIndex) {
        this._animationStateCallback(trackIndex, cc.SP_ANIMATION_EVENT_TYPE.START, null, 0);
    },
    _onAnimationStateEnd: function (trackIndex) {
        this._animationStateCallback(trackIndex, cc.SP_ANIMATION_EVENT_TYPE.END, null, 0);
    },
    _onAnimationStateComplete: function (trackIndex, count) {
        this._animationStateCallback(trackIndex, cc.SP_ANIMATION_EVENT_TYPE.COMPLETE, null, count);
    },
    _onAnimationStateEvent: function (trackIndex, event) {
        this._animationStateCallback(trackIndex, cc.SP_ANIMATION_EVENT_TYPE.EVENT, event, 0);
    },
    _animationStateCallback: function (trackIndex, type, event, loopCount) {
        if (this._target && this._callback) {
            this._callback.call(this._target, this, trackIndex, type, event, loopCount)
        }
    }
});

cc.SkeletonAnimation.createWithData = function (skeletonData) {
    var c = new cc.SkeletonAnimation();
    c.initWithArgs.apply(c, arguments);
    return c;
};

cc.SkeletonAnimation.createWithFile = function (skeletonDataFile, atlasFile/* or atlas*/, scale) {
    var c = new cc.SkeletonAnimation();
    c.initWithArgs.apply(c, arguments);
    return c;
};