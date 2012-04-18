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

cc.kSceneFade = parseInt("0xFADEFADE");

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
cc.kOrientationLeftOver = 0;
/// An horizontal orientation where the Right is nearer
cc.kOrientationRightOver = 1;
/// A vertical orientation where the Up is nearer
cc.kOrientationUpOver = 0;
/// A vertical orientation where the Bottom is nearer
cc.kOrientationDownOver = 1;

cc.TransitionScene = cc.Scene.extend({
    _m_pInScene:null,
    _m_pOutScene:null,
    _m_fDuration:null,
    _m_bIsInSceneOnTop:false,
    _m_bIsSendCleanupToScene:false,

    //private
    _setNewScene:function (dt) {
        //TODO
        //cc.UNUSED_PARAM(dt);
        // [self unschedule:_cmd];
        // "_cmd" is a local variable automatically defined in a method
        // that contains the selector for the method

        //TODO
        //this.unschedule(schedule_selector(CCTransitionScene::setNewScene));
        var director = cc.Director.sharedDirector();
        // Before replacing, save the "send cleanup to scene"
        this._m_bIsSendCleanupToScene = director.isSendCleanupToScene();
        director.replaceScene(this._m_pInScene);

        // enable events while transitions
        cc.TouchDispatcher.sharedDispatcher().setDispatchEvents(true);
        // issue #267
        this._m_pOutScene.setIsVisible(true);
    },

    //protected
    _sceneOrder:function () {
        this._m_bIsInSceneOnTop = true;
    },

    draw:function () {
        this._super();

        if (this._m_bIsInSceneOnTop) {
            this._m_pOutScene.visit();
            this._m_pInScene.visit();
        } else {
            this._m_pInScene.visit();
            this._m_pOutScene.visit();
        }
    },

    // custom onEnter
    onEnter:function () {
        this._super();
        this._m_pInScene.onEnter();
    },
    // custom onExit
    onExit:function () {
        this._super();
        this._m_pOutScene.onExit();

        // inScene should not receive the onExit callback
        // only the onEnterTransitionDidFinish
        this._m_pInScene.onEnterTransitionDidFinish();
    },
    // custom cleanup
    cleanup:function () {
        this._super();

        if (this._m_bIsSendCleanupToScene)
            this._m_pOutScene.cleanup();
    },

    /** initializes a transition with duration and incoming scene */
    initWithDuration:function (t, scene) {
        cc.Assert(scene != null, "CCTransitionScene.initWithDuration() Argument scene must be non-nil");

        if (this.init()) {
            this._m_fDuration = t;

            // retain
            this._m_pInScene = scene;
            this._m_pOutScene = cc.Director.sharedDirector().getRunningScene();

            cc.Assert(this._m_pInScene != this._m_pOutScene, "CCTransitionScene.initWithDuration() Incoming scene must be different from the outgoing scene");

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
        this._m_pInScene.setIsVisible(true);
        this._m_pInScene.setPosition(ccp(0, 0));
        this._m_pInScene.setScale(1.0);
        this._m_pInScene.setRotation(0.0);
        this._m_pInScene.getCamera().restore();

        this._m_pOutScene.setIsVisible(false);
        this._m_pOutScene.setPosition(ccp(0, 0));
        this._m_pOutScene.setScale(1.0);
        this._m_pOutScene.setRotation(0.0);
        this._m_pOutScene.getCamera().restore();

        //[self schedule:@selector(setNewScene:) interval:0];
        //TODO
        this.schedule(this._setNewScene, 0);
    },

    hideOutShowIn:function () {
        this._m_pInScene.setIsVisible(true);
        this._m_pOutScene.setIsVisible(false);
    }
});
/** creates a base transition with duration and incoming scene */
cc.TransitionScene.transitionWithDuration = function (t, scene) {
    var pScene = new cc.TransitionScene();
    if ((pScene != null) && (pScene.initWithDuration(t, scene))) {
        return pScene;
    }
    return null;
};

/** @brief A CCTransition that supports orientation like.
 * Possible orientation: LeftOver, RightOver, UpOver, DownOver
 */
cc.TransitionSceneOriented = cc.TransitionScene.extend({
    _m_eOrientation:0,

    initWithDuration:function (t, scene, orientation) {
        if (this._super(t, scene)) {
            this._m_eOrientation = orientation;
        }
        return true;
    }
});
/** creates a base transition with duration and incoming scene */
cc.TransitionSceneOriented.transitionWithDuration = function (t, scene, orientation) {
    var pScene = new cc.TransitionSceneOriented();
    pScene.initWithDuration(t, scene, orientation);

    return pScene;
};

/** @brief CCTransitionRotoZoom:
 Rotate and zoom out the outgoing scene, and then rotate and zoom in the incoming
 */
cc.TransitionRotoZoom = cc.TransitionScene.extend({
    ctor:function () {
    },
    onEnter:function () {
        this._super();

        this._m_pInScene.setScale(0.001);
        this._m_pOutScene.setScale(1.0);

        this._m_pInScene.setAnchorPoint(cc.ccp(0.5, 0.5));
        this._m_pOutScene.setAnchorPoint(cc.ccp(0.5, 0.5));

        //TODO
        var rotozoom = cc.Sequence.actions(
            cc.Spawn.actions(cc.ScaleBy.actionWithDuration(this._m_fDuration / 2, 0.001),
                cc.RotateBy.actionWithDuration(this._m_fDuration / 2, 360 * 2), null),
            cc.DelayTime.actionWithDuration(this._m_fDuration / 2), null);

        this._m_pOutScene.runAction(rotozoom);
        this._m_pInScene.runAction(
            cc.Sequence.actions(rotozoom.reverse(),
                cc.CallFunc.actionWithTarget(this, this.finish), null));
    }
});

cc.TransitionRotoZoom.transitionWithDuration = function (t, scene) {
    var pScene = new cc.TransitionRotoZoom();
    if ((pScene != null) && (pScene.initWithDuration(t, scene))) {
        return pScene;
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

        this._m_pInScene.setScale(0.5);
        this._m_pInScene.setPosition(cc.ccp(s.width, 0));
        this._m_pInScene.setAnchorPoint(cc.ccp(0.5, 0.5));
        this._m_pOutScene.setAnchorPoint(cc.ccp(0.5, 0.5));
        //TODO
        var jump = cc.JumpBy.actionWithDuration(this._m_fDuration / 4, ccp(-s.width, 0), s.width / 4, 2);
        var scaleIn = cc.ScaleTo.actionWithDuration(this._m_fDuration / 4, 1.0);
        var scaleOut = cc.ScaleTo.actionWithDuration(this._m_fDuration / 4, 0.5);

        var jumpZoomOut = cc.Sequence.actions(scaleOut, jump, null);
        var jumpZoomIn = cc.Sequence.actions(jump, scaleIn, null);

        var delay = cc.DelayTime.actionWithDuration(this._m_fDuration / 2);

        this._m_pOutScene.runAction(jumpZoomOut);
        this._m_pInScene.runAction(cc.Sequence.actions(delay, jumpZoomIn,
            cc.CallFunc.actionWithTarget(this, this.finish),
            null));
    }
});

cc.TransitionJumpZoom.transitionWithDuration = function (t, scene) {
    var pScene = new cc.TransitionJumpZoom();
    if ((pScene != null) && (pScene.initWithDuration(t, scene))) {
        return pScene;
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

        //TODO
        this._m_pInScene.runAction(
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
        var s = cc.Director.sharedDirector().getWinSize();
        this._m_pInScene.setPosition(cc.ccp(-s.width, 0));
    },
    /** returns the action that will be performed */
    action:function () {
        return cc.MoveTo.actionWithDuration(this._m_fDuration, cc.ccp(0, 0));
    },
    easeActionWithAction:function (action) {
        return cc.EaseOut.actionWithAction(action, 2.0);
    }
});
cc.TransitionMoveInL.transitionWithDuration = function (t, scene) {
    var pScene = new cc.TransitionMoveInL();
    if ((pScene != null) && (pScene.initWithDuration(t, scene))) {
        return pScene;
    }
    return null;
};

/** @brief CCTransitionMoveInR:
 Move in from to the right the incoming scene.
 */
cc.TransitionMoveInR = cc.TransitionMoveInL.extend({
    initScenes:function () {
        var s = cc.Director.sharedDirector().getWinSize();
        this._m_pInScene.setPosition(cc.ccp(s.width, 0));
    }
});
cc.TransitionMoveInR.transitionWithDuration = function (t, scene) {
    var pScene = new cc.TransitionMoveInR();
    if ((pScene != null) && (pScene.initWithDuration(t, scene))) {
        return pScene;
    }
    return null;
};

/** @brief CCTransitionMoveInT:
 Move in from to the top the incoming scene.
 */
cc.TransitionMoveInT = cc.TransitionMoveInL.extend({
    initScenes:function () {
        var s = cc.Director.sharedDirector().getWinSize();
        this._m_pInScene.setPosition(cc.ccp(s.height, 0));
    }
});
cc.TransitionMoveInT.transitionWithDuration = function (t, scene) {
    var pScene = new cc.TransitionMoveInT();
    if ((pScene != null) && (pScene.initWithDuration(t, scene))) {
        return pScene;
    }
    return null;
};

/** @brief CCTransitionMoveInB:
 Move in from to the bottom the incoming scene.
 */
cc.TransitionMoveInB = cc.TransitionMoveInL.extend({
    initScenes:function () {
        var s = cc.Director.sharedDirector().getWinSize();
        this._m_pInScene.setPosition(cc.ccp(0, -s.height));
    }
});
cc.TransitionMoveInB.transitionWithDuration = function (t, scene) {
    var pScene = new cc.TransitionMoveInB();
    if ((pScene != null) && (pScene.initWithDuration(t, scene))) {
        return pScene;
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
        this._m_bIsInSceneOnTop = false;
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
        this._m_pInScene.runAction(inAction);
        this._m_pOutScene.runAction(outAction);
    },
    /** initializes the scenes */
    initScenes:function () {
        var s = cc.Director.sharedDirector().getWinSize();
        this._m_pInScene.setPosition(cc.ccp(-(s.width - cc.ADJUST_FACTOR), 0));
    },
    /** returns the action that will be performed by the incomming and outgoing scene */
    action:function () {
        var s = cc.Director.sharedDirector().getWinSize();
        return cc.MoveBy.actionWithDuration(this._m_fDuration, cc.ccp(s.width - cc.ADJUST_FACTOR, 0));
    },
    easeActionWithAction:function (action) {
        return cc.EaseOut.actionWithAction(action, 2.0);
    }
});
cc.TransitionSlideInL.transitionWithDuration = function (t, scene) {
    var pScene = new cc.TransitionSlideInL();
    if ((pScene != null) && (pScene.initWithDuration(t, scene))) {
        return pScene;
    }
    return null;
};

/** @brief CCTransitionSlideInR:
 Slide in the incoming scene from the right border.
 */
cc.TransitionSlideInR = cc.TransitionSlideInL.extend({
    _sceneOrder:function () {
        this._m_bIsInSceneOnTop = true;
    },
    /** initializes the scenes */
    initScenes:function () {
        var s = cc.Director.sharedDirector().getWinSize();
        this._m_pInScene.setPosition(cc.ccp(s.width - cc.ADJUST_FACTOR, 0));
    },
    /** returns the action that will be performed by the incomming and outgoing scene */
    action:function () {
        var s = cc.Director.sharedDirector().getWinSize();
        return cc.MoveBy.actionWithDuration(this._m_fDuration, cc.ccp(-(s.width - cc.ADJUST_FACTOR), 0));
    }
});
cc.TransitionSlideInR.transitionWithDuration = function (t, scene) {
    var pScene = new cc.TransitionSlideInR();
    if ((pScene != null) && (pScene.initWithDuration(t, scene))) {
        return pScene;
    }
    return null;
};

/** @brief CCTransitionSlideInB:
 Slide in the incoming scene from the bottom border.
 */
cc.TransitionSlideInB = cc.TransitionSlideInL.extend({
    _sceneOrder:function () {
        this._m_bIsInSceneOnTop = false;
    },
    /** initializes the scenes */
    initScenes:function () {
        var s = cc.Director.sharedDirector().getWinSize();
        this._m_pInScene.setPosition(cc.ccp(0, s.height - cc.ADJUST_FACTOR));
    },
    /** returns the action that will be performed by the incomming and outgoing scene */
    action:function () {
        var s = cc.Director.sharedDirector().getWinSize();
        return cc.MoveBy.actionWithDuration(this._m_fDuration, cc.ccp(0, -(s.height - cc.ADJUST_FACTOR)));
    }
});
cc.TransitionSlideInB.transitionWithDuration = function (t, scene) {
    var pScene = new cc.TransitionSlideInB();
    if ((pScene != null) && (pScene.initWithDuration(t, scene))) {
        return pScene;
    }
    return null;
};

/** @brief CCTransitionSlideInT:
 Slide in the incoming scene from the top border.
 */
cc.TransitionSlideInT = cc.TransitionSlideInL.extend({
    _sceneOrder:function () {
        this._m_bIsInSceneOnTop = true;
    },
    /** initializes the scenes */
    initScenes:function () {
        var s = cc.Director.sharedDirector().getWinSize();
        this._m_pInScene.setPosition(cc.ccp(0, -(s.height - cc.ADJUST_FACTOR)));
    },
    /** returns the action that will be performed by the incomming and outgoing scene */
    action:function () {
        var s = cc.Director.sharedDirector().getWinSize();
        return cc.MoveBy.actionWithDuration(this._m_fDuration, cc.ccp(0, s.height - cc.ADJUST_FACTOR));
    }
});
cc.TransitionSlideInT.transitionWithDuration = function (t, scene) {
    var pScene = new cc.TransitionSlideInT();
    if ((pScene != null) && (pScene.initWithDuration(t, scene))) {
        return pScene;
    }
    return null;
};

/**
 @brief Shrink the outgoing scene while grow the incoming scene
 */
cc.TransitionShrinkGrow = cc.TransitionScene.extend({
    onEnter:function () {
        this._super();

        this._m_pInScene.setScale(0.001);
        this._m_pOutScene.setScale(1.0);

        this._m_pInScene.setAnchorPoint(cc.ccp(2 / 3.0, 0.5));
        this._m_pOutScene.setAnchorPoint(cc.ccp(1 / 3.0, 0.5));

        var scaleOut = cc.ScaleTo.actionWithDuration(this._m_fDuration, 0.01);
        var scaleIn = cc.ScaleTo.actionWithDuration(this._m_fDuration, 1.0);

        //TODO
        this._m_pInScene.runAction(this.easeActionWithAction(scaleIn));
        this._m_pOutScene.runAction
            (
                cc.Sequence.actions
                    (
                        this.easeActionWithAction(scaleOut),
                        cc.CallFunc.actionWithTarget(this, this.finish),
                        null
                    )
            );
    },
    easeActionWithAction:function (action) {
        return cc.EaseOut.actionWithAction(action, 2.0);
    }
});
cc.TransitionShrinkGrow.transitionWithDuration = function (t, scene) {
    var pScene = new cc.TransitionShrinkGrow();
    if ((pScene != null) && (pScene.initWithDuration(t, scene))) {
        return pScene;
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
        this._m_pInScene.setIsVisible(false);

        var inDeltaZ, inAngleZ;
        var outDeltaZ, outAngleZ;

        if (this._m_eOrientation == cc.kOrientationRightOver) {
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
                cc.DelayTime.actionWithDuration(this._m_fDuration / 2),
                cc.Show.action(),
                cc.OrbitCamera.actionWithDuration(this._m_fDuration / 2, 1, 0, inAngleZ, inDeltaZ, 0, 0),
                cc.CallFunc.actionWithTarget(this, this.finish),
                null
            );

        outA = cc.Sequence.actions
            (
                cc.OrbitCamera.actionWithDuration(this._m_fDuration / 2, 1, 0, outAngleZ, outDeltaZ, 0, 0),
                cc.Hide.action(),
                cc.DelayTime.actionWithDuration(this._m_fDuration / 2),
                null
            );

        this._m_pInScene.runAction(inA);
        this._m_pOutScene.runAction(outA);
    }
});
cc.TransitionFlipX.transitionWithDuration = function (t, scene, o) {
    if (o == null)
        o = cc.kOrientationRightOver;

    var pScene = new cc.TransitionFlipX();
    pScene.initWithDuration(t, scene, o);

    return pScene;
};

/** @brief CCTransitionFlipY:
 Flips the screen vertically.
 The front face is the outgoing scene and the back face is the incoming scene.
 */
cc.TransitionFlipY = cc.TransitionSceneOriented.extend({
    onEnter:function () {
        this._super();

        var inA, outA;
        this._m_pInScene.setIsVisible(false);

        var inDeltaZ, inAngleZ;
        var outDeltaZ, outAngleZ;

        if (this._m_eOrientation == cc.kOrientationUpOver) {
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
                cc.DelayTime.actionWithDuration(this._m_fDuration / 2),
                cc.Show.action(),
                cc.OrbitCamera.actionWithDuration(this._m_fDuration / 2, 1, 0, inAngleZ, inDeltaZ, 90, 0),
                cc.CallFunc.actionWithTarget(this, this.finish),
                null
            );
        outA = cc.Sequence.actions
            (
                cc.OrbitCamera.actionWithDuration(this._m_fDuration / 2, 1, 0, outAngleZ, outDeltaZ, 90, 0),
                cc.Hide.action(),
                cc.DelayTime.actionWithDuration(this._m_fDuration / 2),
                null
            );

        this._m_pInScene.runAction(inA);
        this._m_pOutScene.runAction(outA);
    }
});
cc.TransitionFlipY.transitionWithDuration = function (t, scene, o) {
    if (o == null)
        o = cc.kOrientationUpOver;

    var pScene = new cc.TransitionFlipY();
    pScene.initWithDuration(t, scene, o);

    return pScene;
};

/** @brief CCTransitionFlipAngular:
 Flips the screen half horizontally and half vertically.
 The front face is the outgoing scene and the back face is the incoming scene.
 */
cc.TransitionFlipAngular = cc.TransitionSceneOriented.extend({
    onEnter:function () {
        this._super();

        var inA, outA;
        this._m_pInScene.setIsVisible(false);

        var inDeltaZ, inAngleZ;
        var outDeltaZ, outAngleZ;

        if (this._m_eOrientation == cc.kOrientationRightOver) {
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
                cc.DelayTime.actionWithDuration(this._m_fDuration / 2),
                cc.Show.action(),
                cc.OrbitCamera.actionWithDuration(this._m_fDuration / 2, 1, 0, inAngleZ, inDeltaZ, -45, 0),
                cc.CallFunc.actionWithTarget(this, this.finish),
                null
            );
        outA = cc.Sequence.actions
            (
                cc.OrbitCamera.actionWithDuration(this._m_fDuration / 2, 1, 0, outAngleZ, outDeltaZ, 45, 0),
                cc.Hide.action(),
                cc.DelayTime.actionWithDuration(this._m_fDuration / 2),
                null
            );

        this._m_pInScene.runAction(inA);
        this._m_pOutScene.runAction(outA);
    }
});
cc.TransitionFlipAngular.transitionWithDuration = function (t, scene, o) {
    if (o == null)
        o = cc.kOrientationRightOver;

    var pScene = new cc.TransitionFlipAngular();
    pScene.initWithDuration(t, scene, o);

    return pScene;
};

/** @brief CCTransitionZoomFlipX:
 Flips the screen horizontally doing a zoom out/in
 The front face is the outgoing scene and the back face is the incoming scene.
 */
cc.TransitionZoomFlipX = cc.TransitionSceneOriented.extend({
    onEnter:function () {
        this._super();

        var inA, outA;
        this._m_pInScene.setIsVisible(false);

        var inDeltaZ, inAngleZ;
        var outDeltaZ, outAngleZ;

        if (this._m_eOrientation == cc.kOrientationRightOver) {
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
                cc.DelayTime.actionWithDuration(this._m_fDuration / 2),
                cc.Spawn.actions
                    (
                        cc.OrbitCamera.actionWithDuration(this._m_fDuration / 2, 1, 0, inAngleZ, inDeltaZ, 0, 0),
                        cc.ScaleTo.actionWithDuration(this._m_fDuration / 2, 1),
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
                        cc.OrbitCamera.actionWithDuration(this._m_fDuration / 2, 1, 0, outAngleZ, outDeltaZ, 0, 0),
                        cc.ScaleTo.actionWithDuration(this._m_fDuration / 2, 0.5),
                        null
                    ),
                cc.Hide.action(),
                cc.DelayTime.actionWithDuration(this._m_fDuration / 2),
                null
            );

        this._m_pInScene.setScale(0.5);
        this._m_pInScene.runAction(inA);
        this._m_pOutScene.runAction(outA);
    }
});
cc.TransitionZoomFlipX.transitionWithDuration = function (t, scene, o) {
    if (o == null)
        o = cc.kOrientationRightOver;

    var pScene = new cc.TransitionZoomFlipX();
    pScene.initWithDuration(t, scene, o);

    return pScene;
};

/** @brief CCTransitionZoomFlipY:
 Flips the screen vertically doing a little zooming out/in
 The front face is the outgoing scene and the back face is the incoming scene.
 */
cc.TransitionZoomFlipY = cc.TransitionSceneOriented.extend({
    onEnter:function () {
        this._super();

        var inA, outA;
        this._m_pInScene.setIsVisible(false);

        var inDeltaZ, inAngleZ;
        var outDeltaZ, outAngleZ;

        if (this._m_eOrientation == cc.kOrientationUpOver) {
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
                cc.DelayTime.actionWithDuration(this._m_fDuration / 2),
                cc.Spawn.actions
                    (
                        cc.OrbitCamera.actionWithDuration(this._m_fDuration / 2, 1, 0, inAngleZ, inDeltaZ, 90, 0),
                        cc.ScaleTo.actionWithDuration(this._m_fDuration / 2, 1),
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
                        cc.OrbitCamera.actionWithDuration(this._m_fDuration / 2, 1, 0, outAngleZ, outDeltaZ, 90, 0),
                        cc.ScaleTo.actionWithDuration(this._m_fDuration / 2, 0.5),
                        null
                    ),
                cc.Hide.action(),
                cc.DelayTime.actionWithDuration(this._m_fDuration / 2),
                null
            );

        this._m_pInScene.setScale(0.5);
        this._m_pInScene.runAction(inA);
        this._m_pOutScene.runAction(outA);
    }
});
cc.TransitionZoomFlipY.transitionWithDuration = function (t, scene, o) {
    if (o == null)
        o = cc.kOrientationUpOver;

    var pScene = new cc.TransitionZoomFlipY();
    pScene.initWithDuration(t, scene, o);

    return pScene;
};

/** @brief CCTransitionZoomFlipAngular:
 Flips the screen half horizontally and half vertically doing a little zooming out/in.
 The front face is the outgoing scene and the back face is the incoming scene.
 */
cc.TransitionZoomFlipAngular = cc.TransitionSceneOriented.extend({
    onEnter:function () {
        this._super();

        var inA, outA;
        this._m_pInScene.setIsVisible(false);

        var inDeltaZ, inAngleZ;
        var outDeltaZ, outAngleZ;

        if (this._m_eOrientation == cc.kOrientationRightOver) {
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
                cc.DelayTime.actionWithDuration(this._m_fDuration / 2),
                cc.Spawn.actions
                    (
                        cc.OrbitCamera.actionWithDuration(this._m_fDuration / 2, 1, 0, inAngleZ, inDeltaZ, -45, 0),
                        cc.ScaleTo.actionWithDuration(this._m_fDuration / 2, 1),
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
                        cc.OrbitCamera.actionWithDuration(this._m_fDuration / 2, 1, 0, outAngleZ, outDeltaZ, 45, 0),
                        cc.ScaleTo.actionWithDuration(this._m_fDuration / 2, 0.5),
                        null
                    ),
                cc.Hide.action(),
                cc.DelayTime.actionWithDuration(this._m_fDuration / 2),
                null
            );

        this._m_pInScene.setScale(0.5);
        this._m_pInScene.runAction(inA);
        this._m_pOutScene.runAction(outA);
    }
});
cc.TransitionZoomFlipAngular.transitionWithDuration = function (t, scene, o) {
    if (o == null)
        o = cc.kOrientationRightOver;

    var pScene = new cc.TransitionZoomFlipAngular();
    pScene.initWithDuration(t, scene, o);

    return pScene;
};

/** @brief CCTransitionFade:
 Fade out the outgoing scene and then fade in the incoming scene.'''
 */
cc.TransitionFade = cc.TransitionScene.extend({
    _m_tColor:null,

    ctor:function () {
    },
    onEnter:function () {
        this._super();

        var l = cc.LayerColor.layerWithColor(this._m_tColor);
        this._m_pInScene.setIsVisible(false);

        this.addChild(l, 2, cc.kSceneFade);
        var f = this.getChildByTag(cc.kSceneFade);

        //TODO
        var a = cc.Sequence.actions
            (
                cc.FadeIn.actionWithDuration(this._m_fDuration / 2),
                cc.CallFunc.actionWithTarget(this, this.hideOutShowIn), //CCCallFunc.actionWithTarget:self selector:@selector(hideOutShowIn)],
                cc.FadeOut.actionWithDuration(this._m_fDuration / 2),
                cc.CallFunc.actionWithTarget(this, this.finish), //:self selector:@selector(finish)],
                null
            );
        f.runAction(a);
    },
    onExit:function () {
        this._super();
        this.removeChildByTag(cc.kSceneFade, false);
    },
    /** initializes the transition with a duration and with an RGB color */
    initWithDuration:function (t, scene, color) {
        if ((color == 'undefined') || (color == null)) {
            color = cc.BLACK();
        }

        if (this._super(t, scene)) {
            this._m_tColor.r = color.r;
            this._m_tColor.g = color.g;
            this._m_tColor.b = color.b;
            this._m_tColor.a = 0;
        }
        return true;
    }
});
/** creates the transition with a duration and with an RGB color
 * Example: FadeTransition::transitionWithDuration(2, scene, ccc3(255,0,0); // red color
 */
cc.TransitionFade.transitionWithDuration = function (t, scene, color) {
    var pTransition = new cc.TransitionFade();
    pTransition.initWithDuration(t, scene, color);

    return pTransition;
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
        this._m_pInScene.visit();
        inTexture.end();

        // create the second render texture for outScene
        var outTexture = cc.RenderTexture.renderTextureWithWidthAndHeight(size.width, size.height);
        outTexture.getSprite().setAnchorPoint(cc.ccp(0.5, 0.5));
        outTexture.setPosition(cc.ccp(size.width / 2, size.height / 2));
        outTexture.setAnchorPoint(cc.ccp(0.5, 0.5));

        // render outScene to its texturebuffer
        outTexture.begin();
        this._m_pOutScene.visit();
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
                cc.FadeTo.actionWithDuration(this._m_fDuration, 0),
                cc.CallFunc.actionWithTarget(this, this.hideOutShowIn),
                cc.CallFunc.actionWithTarget(this, this.finish),
                null
            );

        // run the blend action
        outTexture.getSprite().runAction(layerAction);

        // add the layer (which contains our two rendertextures) to the scene
        this.addChild(layer, 2, cc.kSceneFade);
    },
    onExit:function () {
        this.removeChildByTag(cc.kSceneFade, false);
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
        this._m_bIsInSceneOnTop = false;
    },
    onEnter:function () {
        this._super();
        var s = cc.Director.sharedDirector().getWinSize();
        var aspect = s.width / s.height;
        var x = (12 * aspect);
        var y = 12;

        var toff = cc.TurnOffTiles.actionWithSize(cc.ccg(x, y), this._m_fDuration);
        var action = this.easeActionWithAction(toff);
        //TODO
        this._m_pOutScene.runAction
            (
                cc.Sequence.actions
                    (
                        action,
                        cc.CallFunc.actionWithTarget(this, this.finish),
                        cc.StopGrid.action(),
                        null
                    )
            );
    },
    easeActionWithAction:function (action) {
        return action;
    }
});
cc.TransitionTurnOffTiles.transitionWithDuration = function (t, scene) {
    var pScene = new cc.TransitionTurnOffTiles();
    if ((pScene != null) && (pScene.initWithDuration(t, scene))) {
        return pScene;
    }
    return null;
};

/** @brief CCTransitionSplitCols:
 The odd columns goes upwards while the even columns goes downwards.
 */
cc.TransitionSplitCols = cc.TransitionScene.extend({
    onEnter:function () {
        this._super();
        this._m_pInScene.setIsVisible(false);

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
        return cc.EaseInOut.actionWithAction(action, 3.0);
    },
    action:function () {
        return cc.SplitCols.actionWithCols(3, this._m_fDuration / 2.0);
    }
});
cc.TransitionSplitCols.transitionWithDuration = function (t, scene) {
    var pScene = new cc.TransitionSplitCols();
    if ((pScene != null) && (pScene.initWithDuration(t, scene))) {
        return pScene;
    }
    return null;
};

/** @brief CCTransitionSplitRows:
 The odd rows goes to the left while the even rows goes to the right.
 */
cc.TransitionSplitRows = cc.TransitionSplitCols.extend({
    action:function () {
        return cc.SplitRows.actionWithRows(3, this._m_fDuration / 2.0);
    }
});
cc.TransitionSplitRows.transitionWithDuration = function (t, scene) {
    var pScene = new cc.TransitionSplitRows();
    if ((pScene != null) && (pScene.initWithDuration(t, scene))) {
        return pScene;
    }
    return null;
};

/** @brief CCTransitionFadeTR:
 Fade the tiles of the outgoing scene from the left-bottom corner the to top-right corner.
 */
cc.TransitionFadeTR = cc.TransitionScene.extend({
    _sceneOrder:function () {
        this._m_bIsInSceneOnTop = false;
    },

    onEnter:function () {
        this._super();

        var s = cc.Director.sharedDirector().getWinSize();
        var aspect = s.width / s.height;
        var x = (12 * aspect);
        var y = 12;

        var action = this.actionWithSize(cc.ccg(x, y));

        this._m_pOutScene.runAction
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
        return cc.FadeOutTRTiles.actionWithSize(size, this._m_fDuration);
    }
});
cc.TransitionFadeTR.transitionWithDuration = function (t, scene) {
    var pScene = new cc.TransitionFadeTR();
    if ((pScene != null) && (pScene.initWithDuration(t, scene))) {
        return pScene;
    }
    return null;
};

/** @brief CCTransitionFadeBL:
 Fade the tiles of the outgoing scene from the top-right corner to the bottom-left corner.
 */
cc.TransitionFadeBL = cc.TransitionFadeTR.extend({
    actionWithSize:function (size) {
        return cc.FadeOutBLTiles.actionWithSize(size, this._m_fDuration);
    }
});
cc.TransitionFadeBL.transitionWithDuration = function (t, scene) {
    var pScene = new cc.TransitionFadeBL();
    if ((pScene != null) && (pScene.initWithDuration(t, scene))) {
        return pScene;
    }
    return null;
};

/** @brief CCTransitionFadeUp:
 * Fade the tiles of the outgoing scene from the bottom to the top.
 */
cc.TransitionFadeUp = cc.TransitionFadeTR.extend({
    actionWithSize:function (size) {
        return cc.FadeOutUpTiles.actionWithSize(size, this._m_fDuration);
    }
});
cc.TransitionFadeUp.transitionWithDuration = function (t, scene) {
    var pScene = new cc.TransitionFadeUp();
    if ((pScene != null) && (pScene.initWithDuration(t, scene))) {
        return pScene;
    }
    return null;
};

/** @brief CCTransitionFadeDown:
 * Fade the tiles of the outgoing scene from the top to the bottom.
 */
cc.TransitionFadeDown = cc.TransitionFadeTR.extend({
    actionWithSize:function (size) {
        return cc.FadeOutDownTiles.actionWithSize(size, this._m_fDuration);
    }
});
cc.TransitionFadeDown.transitionWithDuration = function (t, scene) {
    var pScene = new cc.TransitionFadeDown();
    if ((pScene != null) && (pScene.initWithDuration(t, scene))) {
        return pScene;
    }
    return null;
};