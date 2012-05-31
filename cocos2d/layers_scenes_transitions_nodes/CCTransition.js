/****************************************************************************
 Copyright (c) 2010-2012 cocos2d-x.org
 Copyright (c) 2008-2010 Ricardo Quesada
 Copyright (c) 2011      Zynga Inc.

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
var cc = cc = cc || {};

cc.SCENE_FADE = parseInt("0xFADEFADE");

/** @brief CCTransitionEaseScene can ease the actions of the scene protocol.
 @since v0.8.2
 */
cc.TransitionEaseScene = cc.Class.extend({
    /** returns the Ease action that will be performed on a linear action.
     @since v0.8.2
     */
    easeActionWithAction:function () {
    }
});

/**
 * Orientation Type used by some transitions
 */
/// An horizontal orientation where the Left is nearer
cc.ORIENTATION_LEFT_OVER = 0;
/// An horizontal orientation where the Right is nearer
cc.ORIENTATION_RIGHT_OVER = 1;
/// A vertical orientation where the Up is nearer
cc.ORIENTATION_UP_OVER = 0;
/// A vertical orientation where the Bottom is nearer
cc.ORIENTATION_DOWN_OVER = 1;

cc.TransitionScene = cc.Scene.extend({
    _inScene:null,
    _outScene:null,
    _duration:null,
    _isInSceneOnTop:false,
    _isSendCleanupToScene:false,

    //private
    _setNewScene:function (dt) {
        // [self unschedule:_cmd];
        // "_cmd" is a local variable automatically defined in a method
        // that contains the selector for the method
        this.unschedule(this._setNewScene);
        var director = cc.Director.sharedDirector();
        // Before replacing, save the "send cleanup to scene"
        this._isSendCleanupToScene = director.isSendCleanupToScene();
        director.replaceScene(this._inScene);

        // enable events while transitions
        cc.TouchDispatcher.sharedDispatcher().setDispatchEvents(true);
        // issue #267
        this._outScene.setIsVisible(true);
    },

    //protected
    _sceneOrder:function () {
        this._isInSceneOnTop = true;
    },

    draw:function () {
        this._super();

        if (this._isInSceneOnTop) {
            this._outScene.visit();
            this._inScene.visit();
        } else {
            this._inScene.visit();
            this._outScene.visit();
        }
    },

    // custom onEnter
    onEnter:function () {
        this._super();
        this._inScene.onEnter();
    },
    // custom onExit
    onExit:function () {
        this._super();
        this._outScene.onExit();

        // inScene should not receive the onExit callback
        // only the onEnterTransitionDidFinish
        this._inScene.onEnterTransitionDidFinish();
    },
    // custom cleanup
    cleanup:function () {
        this._super();

        if (this._isSendCleanupToScene)
            this._outScene.cleanup();
    },

    /** initializes a transition with duration and incoming scene */
    initWithDuration:function (t, scene) {
        cc.Assert(scene != null, "CCTransitionScene.initWithDuration() Argument scene must be non-nil");

        if (this.init()) {
            this._duration = t;
            this.setAnchorPoint(cc.ccp(0,0));
            this.setPosition(cc.ccp(0,0));
            // retain
            this._inScene = scene;
            this._outScene = cc.Director.sharedDirector().getRunningScene();

            cc.Assert(this._inScene != this._outScene, "CCTransitionScene.initWithDuration() Incoming scene must be different from the outgoing scene");

            // disable events while transitions
            cc.TouchDispatcher.sharedDispatcher().setDispatchEvents(false);
            this._sceneOrder();

            return true;
        } else {
            return false;
        }
    },

    /** called after the transition finishes */
    finish:function () {
        // clean up
        this._inScene.setIsVisible(true);
        this._inScene.setPosition(cc.ccp(0, 0));
        this._inScene.setScale(1.0);
        this._inScene.setRotation(0.0);
        this._inScene.getCamera().restore();

        this._outScene.setIsVisible(false);
        this._outScene.setPosition(cc.ccp(0, 0));
        this._outScene.setScale(1.0);
        this._outScene.setRotation(0.0);
        this._outScene.getCamera().restore();

        //[self schedule:@selector(setNewScene:) interval:0];
        this.schedule(this._setNewScene, 0);
    },

    hideOutShowIn:function () {
        this._inScene.setIsVisible(true);
        this._outScene.setIsVisible(false);
    }
});
/** creates a base transition with duration and incoming scene */
cc.TransitionScene.transitionWithDuration = function (t, scene) {
    var tempScene = new cc.TransitionScene();
    if ((tempScene != null) && (tempScene.initWithDuration(t, scene))) {
        return tempScene;
    }
    return null;
};

/** @brief A CCTransition that supports orientation like.
 * Possible orientation: LeftOver, RightOver, UpOver, DownOver
 */
cc.TransitionSceneOriented = cc.TransitionScene.extend({
    _orientation:0,

    initWithDuration:function (t, scene, orientation) {
        if (this._super(t, scene)) {
            this._orientation = orientation;
        }
        return true;
    }
});
/** creates a base transition with duration and incoming scene */
cc.TransitionSceneOriented.transitionWithDuration = function (t, scene, orientation) {
    var tempScene = new cc.TransitionSceneOriented();
    tempScene.initWithDuration(t, scene, orientation);

    return tempScene;
};

/** @brief CCTransitionRotoZoom:
 Rotate and zoom out the outgoing scene, and then rotate and zoom in the incoming
 */
cc.TransitionRotoZoom = cc.TransitionScene.extend({
    ctor:function () {
    },
    onEnter:function () {
        this._super();

        this._inScene.setScale(0.001);
        this._outScene.setScale(1.0);

        this._inScene.setAnchorPoint(cc.ccp(0.5, 0.5));
        this._outScene.setAnchorPoint(cc.ccp(0.5, 0.5));

        var rotozoom = cc.Sequence.actions(
            cc.Spawn.actions(cc.ScaleBy.actionWithDuration(this._duration / 2, 0.001),
                cc.RotateBy.actionWithDuration(this._duration / 2, 360 * 2), null),
            cc.DelayTime.actionWithDuration(this._duration / 2), null);

        this._outScene.runAction(rotozoom);
        this._inScene.runAction(
            cc.Sequence.actions(rotozoom.reverse(),
                cc.CallFunc.actionWithTarget(this, this.finish), null));
    }
});

cc.TransitionRotoZoom.transitionWithDuration = function (t, scene) {
    var tempScene = new cc.TransitionRotoZoom();
    if ((tempScene != null) && (tempScene.initWithDuration(t, scene))) {
        return tempScene;
    }
    return null;
};

/** @brief CCTransitionJumpZoom:
 Zoom out and jump the outgoing scene, and then jump and zoom in the incoming
 */
cc.TransitionJumpZoom = cc.TransitionScene.extend({
    onEnter:function () {
        this._super();

        var s = cc.Director.sharedDirector().getWinSize();

        this._inScene.setScale(0.5);
        this._inScene.setPosition(cc.ccp(s.width, 0));
        this._inScene.setAnchorPoint(cc.ccp(0.5, 0.5));
        this._outScene.setAnchorPoint(cc.ccp(0.5, 0.5));

        //TODO
        var jump = cc.JumpBy.actionWithDuration(this._duration / 4, cc.ccp(-s.width, 0), s.width / 4, 2);
        var scaleIn = cc.ScaleTo.actionWithDuration(this._duration / 4, 1.0);
        var scaleOut = cc.ScaleTo.actionWithDuration(this._duration / 4, 0.5);

        var jumpZoomOut = cc.Sequence.actions(scaleOut, jump, null);
        var jumpZoomIn = cc.Sequence.actions(jump, scaleIn, null);

        var delay = cc.DelayTime.actionWithDuration(this._duration / 2);
        this._outScene.runAction(jumpZoomOut);
        this._inScene.runAction(cc.Sequence.actions(delay, jumpZoomIn,
            cc.CallFunc.actionWithTarget(this, this.finish),
            null));
    }
});

cc.TransitionJumpZoom.transitionWithDuration = function (t, scene) {
    var tempScene = new cc.TransitionJumpZoom();
    if ((tempScene != null) && (tempScene.initWithDuration(t, scene))) {
        return tempScene;
    }
    return null;
};

/** @brief CCTransitionMoveInL:
 Move in from to the left the incoming scene.
 */
cc.TransitionMoveInL = cc.TransitionScene.extend({
    onEnter:function () {
        this._super();
        this.initScenes();

        var a = this.action();

        this._inScene.runAction(
            cc.Sequence.actions
                (
                    this.easeActionWithAction(a),
                    cc.CallFunc.actionWithTarget(this, this.finish),
                    null
                )
        );
    },
    /** initializes the scenes */
    initScenes:function () {
        this._inScene.setPosition(cc.ccp(-cc.Director.sharedDirector().getWinSize().width, 0));
    },
    /** returns the action that will be performed */
    action:function () {
        return cc.MoveTo.actionWithDuration(this._duration, cc.ccp(0, 0));
    },
    easeActionWithAction:function (action) {
        //TODO need implement
        return cc.EaseOut.actionWithAction(action, 2.0);
    }
});
cc.TransitionMoveInL.transitionWithDuration = function (t, scene) {
    var tempScene = new cc.TransitionMoveInL();
    if ((tempScene != null) && (tempScene.initWithDuration(t, scene))) {
        return tempScene;
    }
    return null;
};

/** @brief CCTransitionMoveInR:
 Move in from to the right the incoming scene.
 */
cc.TransitionMoveInR = cc.TransitionMoveInL.extend({
    initScenes:function () {
        var s = cc.Director.sharedDirector().getWinSize();
        this._inScene.setPosition(cc.ccp(s.width, 0));
    }
});
cc.TransitionMoveInR.transitionWithDuration = function (t, scene) {
    var tempScene = new cc.TransitionMoveInR();
    if ((tempScene != null) && (tempScene.initWithDuration(t, scene))) {
        return tempScene;
    }
    return null;
};

/** @brief CCTransitionMoveInT:
 Move in from to the top the incoming scene.
 */
cc.TransitionMoveInT = cc.TransitionMoveInL.extend({
    initScenes:function () {
        var s = cc.Director.sharedDirector().getWinSize();
        this._inScene.setPosition(cc.ccp(s.height, 0));
    }
});
cc.TransitionMoveInT.transitionWithDuration = function (t, scene) {
    var tempScene = new cc.TransitionMoveInT();
    if ((tempScene != null) && (tempScene.initWithDuration(t, scene))) {
        return tempScene;
    }
    return null;
};

/** @brief CCTransitionMoveInB:
 Move in from to the bottom the incoming scene.
 */
cc.TransitionMoveInB = cc.TransitionMoveInL.extend({
    initScenes:function () {
        var s = cc.Director.sharedDirector().getWinSize();
        this._inScene.setPosition(cc.ccp(0, -s.height));
    }
});
cc.TransitionMoveInB.transitionWithDuration = function (t, scene) {
    var tempScene = new cc.TransitionMoveInB();
    if ((tempScene != null) && (tempScene.initWithDuration(t, scene))) {
        return tempScene;
    }
    return null;
};

cc.ADJUST_FACTOR = 0.5;
/** @brief CCTransitionSlideInL:
 Slide in the incoming scene from the left border.
 */
// The adjust factor is needed to prevent issue #442
// One solution is to use DONT_RENDER_IN_SUBPIXELS images, but NO
// The other issue is that in some transitions (and I don't know why)
// the order should be reversed (In in top of Out or vice-versa).
cc.TransitionSlideInL = cc.TransitionScene.extend({
    _sceneOrder:function () {
        this._isInSceneOnTop = false;
    },
    ctor:function () {
    },
    onEnter:function () {
        this._super();
        this.initScenes();

        var inA = this.action();
        var outA = this.action();

        var inAction = this.easeActionWithAction(inA);
        var outAction = cc.Sequence.actions
            (
                this.easeActionWithAction(outA),
                cc.CallFunc.actionWithTarget(this, this.finish),
                null
            );
        this._inScene.runAction(inAction);
        this._outScene.runAction(outAction);
    },
    /** initializes the scenes */
    initScenes:function () {
        var s = cc.Director.sharedDirector().getWinSize();
        this._inScene.setPosition(cc.ccp(-(s.width - cc.ADJUST_FACTOR), 0));
    },
    /** returns the action that will be performed by the incomming and outgoing scene */
    action:function () {
        var s = cc.Director.sharedDirector().getWinSize();
        return cc.MoveBy.actionWithDuration(this._duration, cc.ccp(s.width - cc.ADJUST_FACTOR, 0));
    },
    easeActionWithAction:function (action) {
        return cc.EaseOut.actionWithAction(action, 2.0);
    }
});
cc.TransitionSlideInL.transitionWithDuration = function (t, scene) {
    var tempScene = new cc.TransitionSlideInL();
    if ((tempScene != null) && (tempScene.initWithDuration(t, scene))) {
        return tempScene;
    }
    return null;
};

/** @brief CCTransitionSlideInR:
 Slide in the incoming scene from the right border.
 */
cc.TransitionSlideInR = cc.TransitionSlideInL.extend({
    _sceneOrder:function () {
        this._isInSceneOnTop = true;
    },
    /** initializes the scenes */
    initScenes:function () {
        var s = cc.Director.sharedDirector().getWinSize();
        this._inScene.setPosition(cc.ccp(s.width - cc.ADJUST_FACTOR, 0));
    },
    /** returns the action that will be performed by the incomming and outgoing scene */
    action:function () {
        var s = cc.Director.sharedDirector().getWinSize();
        return cc.MoveBy.actionWithDuration(this._duration, cc.ccp(-(s.width - cc.ADJUST_FACTOR), 0));
    }
});
cc.TransitionSlideInR.transitionWithDuration = function (t, scene) {
    var tempScene = new cc.TransitionSlideInR();
    if ((tempScene != null) && (tempScene.initWithDuration(t, scene))) {
        return tempScene;
    }
    return null;
};

/** @brief CCTransitionSlideInB:
 Slide in the incoming scene from the bottom border.
 */
cc.TransitionSlideInB = cc.TransitionSlideInL.extend({
    _sceneOrder:function () {
        this._isInSceneOnTop = false;
    },
    /** initializes the scenes */
    initScenes:function () {
        var s = cc.Director.sharedDirector().getWinSize();
        this._inScene.setPosition(cc.ccp(0, s.height - cc.ADJUST_FACTOR));
    },
    /** returns the action that will be performed by the incomming and outgoing scene */
    action:function () {
        var s = cc.Director.sharedDirector().getWinSize();
        return cc.MoveBy.actionWithDuration(this._duration, cc.ccp(0, -(s.height - cc.ADJUST_FACTOR)));
    }
});
cc.TransitionSlideInB.transitionWithDuration = function (t, scene) {
    var tempScene = new cc.TransitionSlideInB();
    if ((tempScene != null) && (tempScene.initWithDuration(t, scene))) {
        return tempScene;
    }
    return null;
};

/** @brief CCTransitionSlideInT:
 Slide in the incoming scene from the top border.
 */
cc.TransitionSlideInT = cc.TransitionSlideInL.extend({
    _sceneOrder:function () {
        this._isInSceneOnTop = true;
    },
    /** initializes the scenes */
    initScenes:function () {
        var s = cc.Director.sharedDirector().getWinSize();
        this._inScene.setPosition(cc.ccp(0, -(s.height - cc.ADJUST_FACTOR)));
    },
    /** returns the action that will be performed by the incomming and outgoing scene */
    action:function () {
        var s = cc.Director.sharedDirector().getWinSize();
        return cc.MoveBy.actionWithDuration(this._duration, cc.ccp(0, s.height - cc.ADJUST_FACTOR));
    }
});
cc.TransitionSlideInT.transitionWithDuration = function (t, scene) {
    var tempScene = new cc.TransitionSlideInT();
    if ((tempScene != null) && (tempScene.initWithDuration(t, scene))) {
        return tempScene;
    }
    return null;
};

/**
 @brief Shrink the outgoing scene while grow the incoming scene
 */
cc.TransitionShrinkGrow = cc.TransitionScene.extend({
    onEnter:function () {
        this._super();

        this._inScene.setScale(0.001);
        this._outScene.setScale(1.0);

        this._inScene.setAnchorPoint(cc.ccp(2 / 3.0, 0.5));
        this._outScene.setAnchorPoint(cc.ccp(1 / 3.0, 0.5));

        var scaleOut = cc.ScaleTo.actionWithDuration(this._duration, 0.01);
        var scaleIn = cc.ScaleTo.actionWithDuration(this._duration, 1.0);

        this._inScene.runAction(this.easeActionWithAction(scaleIn));
        this._outScene.runAction(
            cc.Sequence.actions(
                this.easeActionWithAction(scaleOut),
                cc.CallFunc.actionWithTarget(this, this.finish),
                null
            )
        );
    },
    easeActionWithAction:function (action) {
        //TODO
        return cc.EaseOut.actionWithAction(action, 2.0);
    }
});
cc.TransitionShrinkGrow.transitionWithDuration = function (t, scene) {
    var tempScene = new cc.TransitionShrinkGrow();
    if ((tempScene != null) && (tempScene.initWithDuration(t, scene))) {
        return tempScene;
    }
    return null;
};

/** @brief CCTransitionFlipX:
 Flips the screen horizontally.
 The front face is the outgoing scene and the back face is the incoming scene.
 */
cc.TransitionFlipX = cc.TransitionSceneOriented.extend({
    onEnter:function () {
        this._super();

        var inA, outA;
        this._inScene.setIsVisible(false);

        var inDeltaZ, inAngleZ;
        var outDeltaZ, outAngleZ;

        if (this._orientation == cc.ORIENTATION_RIGHT_OVER) {
            inDeltaZ = 90;
            inAngleZ = 270;
            outDeltaZ = 90;
            outAngleZ = 0;
        } else {
            inDeltaZ = -90;
            inAngleZ = 90;
            outDeltaZ = -90;
            outAngleZ = 0;
        }

        inA = cc.Sequence.actions
            (
                cc.DelayTime.actionWithDuration(this._duration / 2),
                cc.Show.action(),
                //TODO
                cc.OrbitCamera.actionWithDuration(this._duration / 2, 1, 0, inAngleZ, inDeltaZ, 0, 0),
                cc.CallFunc.actionWithTarget(this, this.finish),
                null
            );

        outA = cc.Sequence.actions
            (
                cc.OrbitCamera.actionWithDuration(this._duration / 2, 1, 0, outAngleZ, outDeltaZ, 0, 0),
                cc.Hide.action(),
                cc.DelayTime.actionWithDuration(this._duration / 2),
                null
            );

        this._inScene.runAction(inA);
        this._outScene.runAction(outA);
    }
});
cc.TransitionFlipX.transitionWithDuration = function (t, scene, o) {
    if (o == null)
        o = cc.ORIENTATION_RIGHT_OVER;

    var tempScene = new cc.TransitionFlipX();
    tempScene.initWithDuration(t, scene, o);

    return tempScene;
};

/** @brief CCTransitionFlipY:
 Flips the screen vertically.
 The front face is the outgoing scene and the back face is the incoming scene.
 */
cc.TransitionFlipY = cc.TransitionSceneOriented.extend({
    onEnter:function () {
        this._super();

        var inA, outA;
        this._inScene.setIsVisible(false);

        var inDeltaZ, inAngleZ;
        var outDeltaZ, outAngleZ;

        if (this._orientation == cc.ORIENTATION_UP_OVER) {
            inDeltaZ = 90;
            inAngleZ = 270;
            outDeltaZ = 90;
            outAngleZ = 0;
        } else {
            inDeltaZ = -90;
            inAngleZ = 90;
            outDeltaZ = -90;
            outAngleZ = 0;
        }

        //TODO
        inA = cc.Sequence.actions
            (
                cc.DelayTime.actionWithDuration(this._duration / 2),
                cc.Show.action(),
                cc.OrbitCamera.actionWithDuration(this._duration / 2, 1, 0, inAngleZ, inDeltaZ, 90, 0),
                cc.CallFunc.actionWithTarget(this, this.finish),
                null
            );
        outA = cc.Sequence.actions
            (
                cc.OrbitCamera.actionWithDuration(this._duration / 2, 1, 0, outAngleZ, outDeltaZ, 90, 0),
                cc.Hide.action(),
                cc.DelayTime.actionWithDuration(this._duration / 2),
                null
            );

        this._inScene.runAction(inA);
        this._outScene.runAction(outA);
    }
});
cc.TransitionFlipY.transitionWithDuration = function (t, scene, o) {
    if (o == null)
        o = cc.ORIENTATION_UP_OVER;

    var tempScene = new cc.TransitionFlipY();
    tempScene.initWithDuration(t, scene, o);

    return tempScene;
};

/** @brief CCTransitionFlipAngular:
 Flips the screen half horizontally and half vertically.
 The front face is the outgoing scene and the back face is the incoming scene.
 */
cc.TransitionFlipAngular = cc.TransitionSceneOriented.extend({
    onEnter:function () {
        this._super();

        var inA, outA;
        this._inScene.setIsVisible(false);

        var inDeltaZ, inAngleZ;
        var outDeltaZ, outAngleZ;

        if (this._orientation == cc.ORIENTATION_RIGHT_OVER) {
            inDeltaZ = 90;
            inAngleZ = 270;
            outDeltaZ = 90;
            outAngleZ = 0;
        } else {
            inDeltaZ = -90;
            inAngleZ = 90;
            outDeltaZ = -90;
            outAngleZ = 0;
        }

        //TODO
        inA = cc.Sequence.actions
            (
                cc.DelayTime.actionWithDuration(this._duration / 2),
                cc.Show.action(),
                cc.OrbitCamera.actionWithDuration(this._duration / 2, 1, 0, inAngleZ, inDeltaZ, -45, 0),
                cc.CallFunc.actionWithTarget(this, this.finish),
                null
            );
        outA = cc.Sequence.actions
            (
                cc.OrbitCamera.actionWithDuration(this._duration / 2, 1, 0, outAngleZ, outDeltaZ, 45, 0),
                cc.Hide.action(),
                cc.DelayTime.actionWithDuration(this._duration / 2),
                null
            );

        this._inScene.runAction(inA);
        this._outScene.runAction(outA);
    }
});
cc.TransitionFlipAngular.transitionWithDuration = function (t, scene, o) {
    if (o == null)
        o = cc.ORIENTATION_RIGHT_OVER;

    var tempScene = new cc.TransitionFlipAngular();
    tempScene.initWithDuration(t, scene, o);

    return tempScene;
};

/** @brief CCTransitionZoomFlipX:
 Flips the screen horizontally doing a zoom out/in
 The front face is the outgoing scene and the back face is the incoming scene.
 */
cc.TransitionZoomFlipX = cc.TransitionSceneOriented.extend({
    onEnter:function () {
        this._super();

        var inA, outA;
        this._inScene.setIsVisible(false);

        var inDeltaZ, inAngleZ;
        var outDeltaZ, outAngleZ;

        if (this._orientation == cc.ORIENTATION_RIGHT_OVER) {
            inDeltaZ = 90;
            inAngleZ = 270;
            outDeltaZ = 90;
            outAngleZ = 0;
        } else {
            inDeltaZ = -90;
            inAngleZ = 90;
            outDeltaZ = -90;
            outAngleZ = 0;
        }
        //TODO
        inA = cc.Sequence.actions
            (
                cc.DelayTime.actionWithDuration(this._duration / 2),
                cc.Spawn.actions
                    (
                        cc.OrbitCamera.actionWithDuration(this._duration / 2, 1, 0, inAngleZ, inDeltaZ, 0, 0),
                        cc.ScaleTo.actionWithDuration(this._duration / 2, 1),
                        cc.Show.action(),
                        null
                    ),
                cc.CallFunc.actionWithTarget(this, this.finish),
                null
            );
        outA = cc.Sequence.actions
            (
                cc.Spawn.actions
                    (
                        cc.OrbitCamera.actionWithDuration(this._duration / 2, 1, 0, outAngleZ, outDeltaZ, 0, 0),
                        cc.ScaleTo.actionWithDuration(this._duration / 2, 0.5),
                        null
                    ),
                cc.Hide.action(),
                cc.DelayTime.actionWithDuration(this._duration / 2),
                null
            );

        this._inScene.setScale(0.5);
        this._inScene.runAction(inA);
        this._outScene.runAction(outA);
    }
});
cc.TransitionZoomFlipX.transitionWithDuration = function (t, scene, o) {
    if (o == null)
        o = cc.ORIENTATION_RIGHT_OVER;

    var tempScene = new cc.TransitionZoomFlipX();
    tempScene.initWithDuration(t, scene, o);

    return tempScene;
};

/** @brief CCTransitionZoomFlipY:
 Flips the screen vertically doing a little zooming out/in
 The front face is the outgoing scene and the back face is the incoming scene.
 */
cc.TransitionZoomFlipY = cc.TransitionSceneOriented.extend({
    onEnter:function () {
        this._super();

        var inA, outA;
        this._inScene.setIsVisible(false);

        var inDeltaZ, inAngleZ;
        var outDeltaZ, outAngleZ;

        if (this._orientation == cc.ORIENTATION_UP_OVER) {
            inDeltaZ = 90;
            inAngleZ = 270;
            outDeltaZ = 90;
            outAngleZ = 0;
        } else {
            inDeltaZ = -90;
            inAngleZ = 90;
            outDeltaZ = -90;
            outAngleZ = 0;
        }

        //TODO
        inA = cc.Sequence.actions
            (
                cc.DelayTime.actionWithDuration(this._duration / 2),
                cc.Spawn.actions
                    (
                        cc.OrbitCamera.actionWithDuration(this._duration / 2, 1, 0, inAngleZ, inDeltaZ, 90, 0),
                        cc.ScaleTo.actionWithDuration(this._duration / 2, 1),
                        cc.Show.action(),
                        null
                    ),
                cc.CallFunc.actionWithTarget(this, this.finish),
                null
            );

        outA = cc.Sequence.actions
            (
                cc.Spawn.actions
                    (
                        cc.OrbitCamera.actionWithDuration(this._duration / 2, 1, 0, outAngleZ, outDeltaZ, 90, 0),
                        cc.ScaleTo.actionWithDuration(this._duration / 2, 0.5),
                        null
                    ),
                cc.Hide.action(),
                cc.DelayTime.actionWithDuration(this._duration / 2),
                null
            );

        this._inScene.setScale(0.5);
        this._inScene.runAction(inA);
        this._outScene.runAction(outA);
    }
});
cc.TransitionZoomFlipY.transitionWithDuration = function (t, scene, o) {
    if (o == null)
        o = cc.ORIENTATION_UP_OVER;

    var tempScene = new cc.TransitionZoomFlipY();
    tempScene.initWithDuration(t, scene, o);

    return tempScene;
};

/** @brief CCTransitionZoomFlipAngular:
 Flips the screen half horizontally and half vertically doing a little zooming out/in.
 The front face is the outgoing scene and the back face is the incoming scene.
 */
cc.TransitionZoomFlipAngular = cc.TransitionSceneOriented.extend({
    onEnter:function () {
        this._super();

        var inA, outA;
        this._inScene.setIsVisible(false);

        var inDeltaZ, inAngleZ;
        var outDeltaZ, outAngleZ;

        if (this._orientation == cc.ORIENTATION_RIGHT_OVER) {
            inDeltaZ = 90;
            inAngleZ = 270;
            outDeltaZ = 90;
            outAngleZ = 0;
        } else {
            inDeltaZ = -90;
            inAngleZ = 90;
            outDeltaZ = -90;
            outAngleZ = 0;
        }

        //TODO
        inA = cc.Sequence.actions
            (
                cc.DelayTime.actionWithDuration(this._duration / 2),
                cc.Spawn.actions
                    (
                        cc.OrbitCamera.actionWithDuration(this._duration / 2, 1, 0, inAngleZ, inDeltaZ, -45, 0),
                        cc.ScaleTo.actionWithDuration(this._duration / 2, 1),
                        cc.Show.action(),
                        null
                    ),
                cc.Show.action(),
                cc.CallFunc.actionWithTarget(this, this.finish),
                null
            );
        outA = cc.Sequence.actions
            (
                cc.Spawn.actions
                    (
                        cc.OrbitCamera.actionWithDuration(this._duration / 2, 1, 0, outAngleZ, outDeltaZ, 45, 0),
                        cc.ScaleTo.actionWithDuration(this._duration / 2, 0.5),
                        null
                    ),
                cc.Hide.action(),
                cc.DelayTime.actionWithDuration(this._duration / 2),
                null
            );

        this._inScene.setScale(0.5);
        this._inScene.runAction(inA);
        this._outScene.runAction(outA);
    }
});
cc.TransitionZoomFlipAngular.transitionWithDuration = function (t, scene, o) {
    if (o == null)
        o = cc.ORIENTATION_RIGHT_OVER;

    var tempScene = new cc.TransitionZoomFlipAngular();
    tempScene.initWithDuration(t, scene, o);

    return tempScene;
};

/** @brief CCTransitionFade:
 Fade out the outgoing scene and then fade in the incoming scene.'''
 */
cc.TransitionFade = cc.TransitionScene.extend({
    _color:new cc.Color3B(),

    ctor:function () {
    },
    onEnter:function () {
        this._super();

        var l = cc.LayerColor.layerWithColor(this._color);
        this._inScene.setIsVisible(false);

        this.addChild(l, 2, cc.SCENE_FADE);
        var f = this.getChildByTag(cc.SCENE_FADE);

        //TODO
        var a = cc.Sequence.actions
            (
                cc.FadeIn.actionWithDuration(this._duration / 2),
                cc.CallFunc.actionWithTarget(this, this.hideOutShowIn), //CCCallFunc.actionWithTarget:self selector:@selector(hideOutShowIn)],
                cc.FadeOut.actionWithDuration(this._duration / 2),
                cc.CallFunc.actionWithTarget(this, this.finish), //:self selector:@selector(finish)],
                null
            );
        f.runAction(a);
    },
    onExit:function () {
        this._super();
        this.removeChildByTag(cc.SCENE_FADE, false);
    },
    /** initializes the transition with a duration and with an RGB color */
    initWithDuration:function (t, scene, color) {
        if ((color == 'undefined') || (color == null)) {
            color = cc.BLACK();
        }

        if (this._super(t, scene)) {
            this._color.r = color.r;
            this._color.g = color.g;
            this._color.b = color.b;
            this._color.a = 0;
        }
        return true;
    }
});

/** creates the transition with a duration and with an RGB color
 * Example: FadeTransition::transitionWithDuration(2, scene, ccc3(255,0,0); // red color
 */
cc.TransitionFade.transitionWithDuration = function (t, scene, color) {
    var transition = new cc.TransitionFade();
    transition.initWithDuration(t, scene, color);

    return transition;
};

/**
 @brief CCTransitionCrossFade:
 Cross fades two scenes using the CCRenderTexture object.
 */
cc.TransitionCrossFade = cc.TransitionScene.extend({
    onEnter:function () {
        this._super();

        // create a transparent color layer
        // in which we are going to add our rendertextures
        var color = new cc.Color4B(0, 0, 0, 0);
        var size = cc.Director.sharedDirector().getWinSize();
        var layer = cc.LayerColor.layerWithColor(color);

        // create the first render texture for inScene
        var inTexture = cc.RenderTexture.renderTextureWithWidthAndHeight(size.width, size.height);

        if (null == inTexture) {
            return;
        }

        inTexture.getSprite().setAnchorPoint(cc.ccp(0.5, 0.5));
        inTexture.setPosition(cc.ccp(size.width / 2, size.height / 2));
        inTexture.setAnchorPoint(cc.ccp(0.5, 0.5));

        // render inScene to its texturebuffer
        inTexture.begin();
        this._inScene.visit();
        inTexture.end();

        // create the second render texture for outScene
        var outTexture = cc.RenderTexture.renderTextureWithWidthAndHeight(size.width, size.height);
        outTexture.getSprite().setAnchorPoint(cc.ccp(0.5, 0.5));
        outTexture.setPosition(cc.ccp(size.width / 2, size.height / 2));
        outTexture.setAnchorPoint(cc.ccp(0.5, 0.5));

        // render outScene to its texturebuffer
        outTexture.begin();
        this._outScene.visit();
        outTexture.end();

        // create blend functions

        var blend1 = new cc.BlendFunc(cc.GL_ONE, cc.GL_ONE); // inScene will lay on background and will not be used with alpha
        var blend2 = cc.BlendFunc(cc.GL_SRC_ALPHA, cc.GL_ONE_MINUS_SRC_ALPHA); // we are going to blend outScene via alpha

        // set blendfunctions
        inTexture.getSprite().setBlendFunc(blend1);
        outTexture.getSprite().setBlendFunc(blend2);

        // add render textures to the layer
        layer.addChild(inTexture);
        layer.addChild(outTexture);

        // initial opacity:
        inTexture.getSprite().setOpacity(255);
        outTexture.getSprite().setOpacity(255);

        // create the blend action
        //TODO
        var layerAction = cc.Sequence.actions
            (
                cc.FadeTo.actionWithDuration(this._duration, 0),
                cc.CallFunc.actionWithTarget(this, this.hideOutShowIn),
                cc.CallFunc.actionWithTarget(this, this.finish),
                null
            );

        // run the blend action
        outTexture.getSprite().runAction(layerAction);

        // add the layer (which contains our two rendertextures) to the scene
        this.addChild(layer, 2, cc.SCENE_FADE);
    },
    onExit:function () {
        this.removeChildByTag(cc.SCENE_FADE, false);
        this._super();
    },
    draw:function () {
        // override draw since both scenes (textures) are rendered in 1 scene
    }
});
cc.TransitionCrossFade.transitionWithDuration = function (t, scene) {
    var Transition = new cc.TransitionCrossFade();
    Transition.initWithDuration(t, scene);
    return Transition;
};

/** @brief CCTransitionTurnOffTiles:
 Turn off the tiles of the outgoing scene in random order
 */
cc.TransitionTurnOffTiles = cc.TransitionScene.extend({
    _sceneOrder:function () {
        this._isInSceneOnTop = false;
    },
    onEnter:function () {
        this._super();
        var s = cc.Director.sharedDirector().getWinSize();
        var aspect = s.width / s.height;
        var x = 12 * aspect;
        var y = 12;
        var toff = cc.TurnOffTiles.actionWithSize(cc.ccg(x, y), this._duration);
        var action = this.easeActionWithAction(toff);
        //TODO
        this._outScene.runAction(cc.Sequence.actions(action,cc.CallFunc.actionWithTarget(this, this.finish),cc.StopGrid.action(),null));
    },
    easeActionWithAction:function (action) {
        return action;
    }
});
cc.TransitionTurnOffTiles.transitionWithDuration = function (t, scene) {
    var tempScene = new cc.TransitionTurnOffTiles();
    if ((tempScene != null) && (tempScene.initWithDuration(t, scene))) {
        return tempScene;
    }
    return null;
};

/** @brief CCTransitionSplitCols:
 The odd columns goes upwards while the even columns goes downwards.
 */
cc.TransitionSplitCols = cc.TransitionScene.extend({
    onEnter:function () {
        this._super();
        this._inScene.setIsVisible(false);

        var split = this.action();
        //TODO
        var seq = cc.Sequence.actions
            (
                split,
                cc.CallFunc.actionWithTarget(this, this.hideOutShowIn),
                split.reverse(),
                null
            );

        this.runAction
            (
                cc.Sequence.actions
                    (
                        this.easeActionWithAction(seq),
                        cc.CallFunc.actionWithTarget(this, this.finish),
                        cc.StopGrid.action(),
                        null
                    )
            );
    },
    easeActionWithAction:function (action) {
        //TODO
        return cc.EaseInOut.actionWithAction(action, 3.0);
    },
    action:function () {
        //TODO
        return cc.SplitCols.actionWithCols(3, this._duration / 2.0);
    }
});
cc.TransitionSplitCols.transitionWithDuration = function (t, scene) {
    var tempScene = new cc.TransitionSplitCols();
    if ((tempScene != null) && (tempScene.initWithDuration(t, scene))) {
        return tempScene;
    }
    return null;
};

/** @brief CCTransitionSplitRows:
 The odd rows goes to the left while the even rows goes to the right.
 */
cc.TransitionSplitRows = cc.TransitionSplitCols.extend({
    action:function () {
        return cc.SplitRows.actionWithRows(3, this._duration / 2.0);
    }
});
cc.TransitionSplitRows.transitionWithDuration = function (t, scene) {
    var tempScene = new cc.TransitionSplitRows();
    if ((tempScene != null) && (tempScene.initWithDuration(t, scene))) {
        return tempScene;
    }
    return null;
};

/** @brief CCTransitionFadeTR:
 Fade the tiles of the outgoing scene from the left-bottom corner the to top-right corner.
 */
cc.TransitionFadeTR = cc.TransitionScene.extend({
    _sceneOrder:function () {
        this._isInSceneOnTop = false;
    },

    onEnter:function () {
        this._super();

        var s = cc.Director.sharedDirector().getWinSize();
        var aspect = s.width / s.height;
        var x = (12 * aspect);
        var y = 12;

        var action = this.actionWithSize(cc.ccg(x, y));

        this._outScene.runAction
            (
                cc.Sequence.actions
                    (
                        this.easeActionWithAction(action),
                        cc.CallFunc.actionWithTarget(this, this.finish),
                        cc.StopGrid.action(),
                        null
                    )
            );
    },
    easeActionWithAction:function (action) {
        return action;
    },
    actionWithSize:function (size) {
        return cc.FadeOutTRTiles.actionWithSize(size, this._duration);
    }
});
cc.TransitionFadeTR.transitionWithDuration = function (t, scene) {
    var tempScene = new cc.TransitionFadeTR();
    if ((tempScene != null) && (tempScene.initWithDuration(t, scene))) {
        return tempScene;
    }
    return null;
};

/** @brief CCTransitionFadeBL:
 Fade the tiles of the outgoing scene from the top-right corner to the bottom-left corner.
 */
cc.TransitionFadeBL = cc.TransitionFadeTR.extend({
    actionWithSize:function (size) {
        return cc.FadeOutBLTiles.actionWithSize(size, this._duration);
    }
});
cc.TransitionFadeBL.transitionWithDuration = function (t, scene) {
    var tempScene = new cc.TransitionFadeBL();
    if ((tempScene != null) && (tempScene.initWithDuration(t, scene))) {
        return tempScene;
    }
    return null;
};

/** @brief CCTransitionFadeUp:
 * Fade the tiles of the outgoing scene from the bottom to the top.
 */
cc.TransitionFadeUp = cc.TransitionFadeTR.extend({
    actionWithSize:function (size) {
        return cc.FadeOutUpTiles.actionWithSize(size, this._duration);
    }
});
cc.TransitionFadeUp.transitionWithDuration = function (t, scene) {
    var tempScene = new cc.TransitionFadeUp();
    if ((tempScene != null) && (tempScene.initWithDuration(t, scene))) {
        return tempScene;
    }
    return null;
};

/** @brief CCTransitionFadeDown:
 * Fade the tiles of the outgoing scene from the top to the bottom.
 */
cc.TransitionFadeDown = cc.TransitionFadeTR.extend({
    actionWithSize:function (size) {
        return cc.FadeOutDownTiles.actionWithSize(size, this._duration);
    }
});
cc.TransitionFadeDown.transitionWithDuration = function (t, scene) {
    var tempScene = new cc.TransitionFadeDown();
    if ((tempScene != null) && (tempScene.initWithDuration(t, scene))) {
        return tempScene;
    }
    return null;
}