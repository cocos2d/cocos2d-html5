/****************************************************************************
 Copyright (c) 2008-2010 Ricardo Quesada
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
 * @class
 * @extends cc.Class
 */
cc.ActionTweenDelegate = cc.Class.extend(/** @lends cc.ActionTweenDelegate */{
     updateTweenAction:function(value, key){

     }
});

/**
 * cc.ActionTween
 * cc.ActionTween is an action that lets you update any property of an object.
 *
 * @class
 * @extends cc.ActionInterval
 * @example
 * //For example, if you want to modify the "width" property of a target from 200 to 300 in 2 seconds, then:
 *  var modifyWidth = cc.ActionTween.create(2,"width",200,300)
 *  target.runAction(modifyWidth);
 *
 * //Another example: cc.ScaleTo action could be rewriten using cc.PropertyAction:
 * // scaleA and scaleB are equivalents
 * var scaleA = cc.ScaleTo.create(2,3);
 * var scaleB = cc.ActionTween.create(2,"scale",1,3);
 */
cc.ActionTween = cc.ActionInterval.extend(/** @lends cc.ActionTween */{
    key:"",
    from:0,
    to:0,
    delta:0,

	/**
	 * Creates an initializes the action with the property name (key), and the from and to parameters.
	 * Constructor of cc.ActionTween
	 * @param {Number} duration
	 * @param {String} key
	 * @param {Number} from
	 * @param {Number} to
	 */
    ctor:function(duration, key, from, to){
        cc.ActionInterval.prototype.ctor.call(this);
        this.key = "";

		to !== undefined && this.initWithDuration(duration, key, from, to);
    },

    /**
     * initializes the action with the property name (key), and the from and to parameters.
     * @param {Number} duration
     * @param {String} key
     * @param {Number} from
     * @param {Number} to
     * @return {Boolean}
     */
    initWithDuration:function (duration, key, from, to) {
        if (cc.ActionInterval.prototype.initWithDuration.call(this, duration)) {
            this.key = key;
            this.to = to;
            this.from = from;
            return true;
        }
        return false;
    },
    /**
     * @param {cc.Node} target
     */
    startWithTarget:function (target) {
        if(!target || !target.updateTweenAction)
            throw "cc.ActionTween.startWithTarget(): target must be non-null, and target must implement updateTweenAction function";
        cc.ActionInterval.prototype.startWithTarget.call(this, target);
        this.delta = this.to - this.from;
    },
    /**
     * @param {Number} dt
     */
    update:function (dt) {
        this.target.updateTweenAction(this.to - this.delta * (1 - dt), this.key);
    },
    /**
     * @return {cc.ActionTween}
     */
    reverse:function () {
        return cc.ActionTween.create(this.duration, this.key, this.to, this.from);
    },

    clone:function(){
        var action = new cc.ActionTween();
        action.initWithDuration(this._duration, this.key, this.from, this.to);
        return action;
    }
});

/**
 * Creates an initializes the action with the property name (key), and the from and to parameters.
 * @param {Number} duration
 * @param {String} key
 * @param {Number} from
 * @param {Number} to
 * @return {cc.ActionTween}
 */
cc.ActionTween.create = function (duration, key, from, to) {
    var ret = new cc.ActionTween();
    if (ret.initWithDuration(duration, key, from, to))
        return ret;
    return null;
};

cc.action = cc.Action.create;
cc.speed = cc.Speed.create;
cc.follow = cc.Follow.create;
cc.orbitCamera = cc.OrbitCamera.create;
cc.cardinalSplineTo = cc.CardinalSplineTo.create;
cc.cardinalSplineBy = cc.CardinalSplineBy.create;
cc.catmullRomTo = cc.CatmullRomTo.create;
cc.catmullRomBy = cc.CatmullRomBy.create;
cc.show = cc.Show.create;
cc.hide = cc.Hide.create;
cc.toggleVisibility = cc.ToggleVisibility.create;
cc.removeSelf = cc.RemoveSelf.create;
cc.flipX = cc.FlipX.create;
cc.flipY = cc.FlipY.create;
cc.place = cc.Place.create;
cc.callFunc = cc.CallFunc.create;
cc.actionInterval = cc.ActionInterval.create;
cc.sequence = cc.Sequence.create;
cc.repeat = cc.Repeat.create;
cc.repeatForever = cc.RepeatForever.create;
cc.spawn = cc.Spawn.create;
cc.rotateTo = cc.RotateTo.create;
cc.rotateBy = cc.RotateBy.create;
cc.moveBy = cc.MoveBy.create;
cc.moveTo = cc.MoveTo.create;
cc.skewTo = cc.SkewTo.create;
cc.skewBy = cc.SkewBy.create;
cc.jumpBy = cc.JumpBy.create;
cc.jumpTo = cc.JumpTo.create;
cc.bezierBy = cc.BezierBy.create;
cc.bezierTo = cc.BezierTo.create;
cc.scaleTo = cc.ScaleTo.create;
cc.scaleBy = cc.ScaleBy.create;
cc.blink = cc.Blink.create;
cc.fadeTo = cc.FadeTo.create;
cc.fadeIn = cc.FadeIn.create;
cc.fadeOut = cc.FadeOut.create;
cc.tintTo = cc.TintTo.create;
cc.tintBy = cc.TintBy.create;
cc.delayTime = cc.DelayTime.create;
cc.reverseTime = cc.ReverseTime.create;
cc.animate = cc.Animate.create;
cc.targetedAction = cc.TargetedAction.create;
cc.actionTween = cc.ActionTween.create;