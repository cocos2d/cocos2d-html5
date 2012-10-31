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
/**
 * A tag constant for identifying fade scenes
 * @constant
 * @type Number
 */
cc.SCENE_FADE = 4208917214;

/**
 * cc.TransitionEaseScene can ease the actions of the scene protocol.
 * @class
 * @extends cc.Class
 */
cc.TransitionEaseScene = cc.Class.extend(/** @lends cc.TransitionEaseScene# */{
    /**
     * returns the Ease action that will be performed on a linear action.
     */
    easeActionWithAction:function () {
    }
});

/**
 * horizontal orientation Type where the Left is nearer
 * @constant
 * @type Number
 */
cc.TRANSITION_ORIENTATION_LEFT_OVER = 0;
/**
 * horizontal orientation type where the Right is nearer
 * @constant
 * @type Number
 */
cc.TRANSITION_ORIENTATION_RIGHT_OVER = 1;
/**
 * vertical orientation type where the Up is nearer
 * @constant
 * @type Number
 */
cc.TRANSITION_ORIENTATION_UP_OVER = 0;
/**
 * vertical orientation type where the Bottom is nearer
 * @constant
 * @type Number
 */
cc.TRANSITION_ORIENTATION_DOWN_OVER = 1;

/**
 * @class
 * @extends cc.Scene
 */
cc.TransitionScene = cc.Scene.extend(/** @lends cc.TransitionScene# */{
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
        var director = cc.Director.getInstance();
        // Before replacing, save the "send cleanup to scene"
        this._isSendCleanupToScene = director.isSendCleanupToScene();
        director.replaceScene(this._inScene);

        // enable events while transitions
        director.getTouchDispatcher().setDispatchEvents(true);
        // issue #267
        this._outScene.setVisible(true);
    },

    //protected
    _sceneOrder:function () {
        this._isInSceneOnTop = true;
    },

    /**
     * stuff gets drawn here
     */
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

    /**
     * custom onEnter
     */
    onEnter:function () {
        this._super();
        this._inScene.onEnter();
    },

    /**
     * custom onExit
     */
    onExit:function () {
        this._super();
        this._outScene.onExit();

        // inScene should not receive the onExit callback
        // only the onEnterTransitionDidFinish
        this._inScene.onEnterTransitionDidFinish();
    },

    /**
     * custom cleanup
     */
    cleanup:function () {
        this._super();

        if (this._isSendCleanupToScene)
            this._outScene.cleanup();
    },

    /**
     * initializes a transition with duration and incoming scene
     * @param {Number} t time in seconds
     * @param {cc.Scene} scene a scene to transit to
     * @return {Boolean} return false if error
     */
    initWithDuration:function (t, scene) {
        cc.Assert(scene != null, "CCTransitionScene.initWithDuration() Argument scene must be non-nil");

        if (this.init()) {
            this._duration = t;
            this.setAnchorPoint(cc.p(0, 0));
            this.setPosition(cc.p(0, 0));
            // retain
            this._inScene = scene;
            this._outScene = cc.Director.getInstance().getRunningScene();
            if (!this._outScene) {
                this._outScene = cc.Scene.create();
                this._outScene.init();
            }

            cc.Assert(this._inScene != this._outScene, "CCTransitionScene.initWithDuration() Incoming scene must be different from the outgoing scene");

            // disable events while transitions
            cc.Director.getInstance().getTouchDispatcher().setDispatchEvents(false);
            this._sceneOrder();

            return true;
        } else {
            return false;
        }
    },

    /**
     * called after the transition finishes
     */
    finish:function () {
        // clean up
        this._inScene.setVisible(true);
        this._inScene.setPosition(cc.p(0, 0));
        this._inScene.setScale(1.0);
        this._inScene.setRotation(0.0);
        this._inScene.getCamera().restore();

        this._outScene.setVisible(false);
        this._outScene.setPosition(cc.p(0, 0));
        this._outScene.setScale(1.0);
        this._outScene.setRotation(0.0);
        this._outScene.getCamera().restore();

        //[self schedule:@selector(setNewScene:) interval:0];
        this.schedule(this._setNewScene, 0);
    },

    /**
     * set hide the out scene and show in scene
     */
    hideOutShowIn:function () {
        this._inScene.setVisible(true);
        this._outScene.setVisible(false);
    }
});
/**
 * creates a base transition with duration and incoming scene
 * @param {Number} t time in seconds
 * @param {cc.Scene} scene the scene to transit with
 * @return {cc.TransitionScene|Null}
 */
cc.TransitionScene.create = function (t, scene) {
    var tempScene = new cc.TransitionScene();
    if ((tempScene != null) && (tempScene.initWithDuration(t, scene))) {
        return tempScene;
    }
    return null;
};

/**
 * A cc.Transition that supports orientation like.<br/>
 * Possible orientation: LeftOver, RightOver, UpOver, DownOver<br/>
 * useful for when you want to make a transition happen between 2 orientations
 * @class
 * @extends cc.TransitionScene
 */
cc.TransitionSceneOriented = cc.TransitionScene.extend(/** @lends cc.TransitionSceneOriented# */{
    _orientation:0,

    /**
     * initialize the transition
     * @param {Number} t time in seconds
     * @param {cc.Scene} scene
     * @param {cc.TRANSITION_ORIENTATION_LEFT_OVER|cc.TRANSITION_ORIENTATION_RIGHT_OVER|cc.TRANSITION_ORIENTATION_UP_OVER|cc.TRANSITION_ORIENTATION_DOWN_OVER} orientation
     * @return {Boolean}
     */
    initWithDuration:function (t, scene, orientation) {
        if (this._super(t, scene)) {
            this._orientation = orientation;
        }
        return true;
    }
});

/**
 * creates a base transition with duration and incoming scene
 * @param {Number} t time in seconds
 * @param {cc.Scene} scene
 * @param {cc.TRANSITION_ORIENTATION_LEFT_OVER|cc.TRANSITION_ORIENTATION_RIGHT_OVER|cc.TRANSITION_ORIENTATION_UP_OVER|cc.TRANSITION_ORIENTATION_DOWN_OVER} orientation
 * @return {cc.TransitionSceneOriented}
 * @example
 * // Example
 * var goHorizontal = cc.TransitionSceneOriented.create(0.5, thisScene, cc.TRANSITION_ORIENTATION_LEFT_OVER)
 */
cc.TransitionSceneOriented.create = function (t, scene, orientation) {
    var tempScene = new cc.TransitionSceneOriented();
    tempScene.initWithDuration(t, scene, orientation);

    return tempScene;
};

/**
 *  Rotate and zoom out the outgoing scene, and then rotate and zoom in the incoming
 * @class
 * @extends cc.TransitionScene
 */
cc.TransitionRotoZoom = cc.TransitionScene.extend(/** @lends cc.TransitionRotoZoom# */{
    /**
     * Constructor
     */
    ctor:function () {
    },

    /**
     * Custom On Enter callback
     * @override
     */
    onEnter:function () {
        this._super();

        this._inScene.setScale(0.001);
        this._outScene.setScale(1.0);

        this._inScene.setAnchorPoint(cc.p(0.5, 0.5));
        this._outScene.setAnchorPoint(cc.p(0.5, 0.5));

        var rotozoom = cc.Sequence.create(
            cc.Spawn.create(cc.ScaleBy.create(this._duration / 2, 0.001),
                cc.RotateBy.create(this._duration / 2, 360 * 2)),
            cc.DelayTime.create(this._duration / 2));

        this._outScene.runAction(rotozoom);
        this._inScene.runAction(
            cc.Sequence.create(rotozoom.reverse(),
                cc.CallFunc.create(this.finish, this)));
    }
});

/**
 * Creates a Transtion rotation and zoom
 * @param {Number} t time in seconds
 * @param {cc.Scene} scene the scene to work with
 * @return {cc.TransitionRotoZoom}
 * @example
 * // Example
 * var RotoZoomTrans = cc.TransitionRotoZoom.create(2, nextScene);
 */
cc.TransitionRotoZoom.create = function (t, scene) {
    var tempScene = new cc.TransitionRotoZoom();
    if ((tempScene != null) && (tempScene.initWithDuration(t, scene))) {
        return tempScene;
    }
    return null;
};

/**
 * Zoom out and jump the outgoing scene, and then jump and zoom in the incoming
 * @class
 * @extends cc.TransitionScene
 */
cc.TransitionJumpZoom = cc.TransitionScene.extend(/** @lends cc.TransitionJumpZoom# */{
    /**
     * Custom on enter
     */
    onEnter:function () {
        this._super();

        var s = cc.Director.getInstance().getWinSize();

        this._inScene.setScale(0.5);
        this._inScene.setPosition(cc.p(s.width, 0));
        this._inScene.setAnchorPoint(cc.p(0.5, 0.5));
        this._outScene.setAnchorPoint(cc.p(0.5, 0.5));

        //TODO
        var jump = cc.JumpBy.create(this._duration / 4, cc.p(-s.width, 0), s.width / 4, 2);
        var scaleIn = cc.ScaleTo.create(this._duration / 4, 1.0);
        var scaleOut = cc.ScaleTo.create(this._duration / 4, 0.5);

        var jumpZoomOut = cc.Sequence.create(scaleOut, jump);
        var jumpZoomIn = cc.Sequence.create(jump, scaleIn);

        var delay = cc.DelayTime.create(this._duration / 2);
        this._outScene.runAction(jumpZoomOut);
        this._inScene.runAction(cc.Sequence.create(delay, jumpZoomIn,
            cc.CallFunc.create(this.finish, this)));
    }
});

/**
 * creates a scene transition that zooms then jump across the screen, the same for the incoming scene
 * @param {Number} t time in seconds
 * @param {cc.Scene} scene
 * @return {cc.TransitionJumpZoom}
 */
cc.TransitionJumpZoom.create = function (t, scene) {
    var tempScene = new cc.TransitionJumpZoom();
    if ((tempScene != null) && (tempScene.initWithDuration(t, scene))) {
        return tempScene;
    }
    return null;
};

/**
 * Move in from to the left the incoming scene.
 * @class
 * @extends cc.TransitionScene
 */
cc.TransitionMoveInL = cc.TransitionScene.extend(/** @lends cc.TransitionMoveInL# */{

    /**
     * Custom on enter
     */
    onEnter:function () {
        this._super();
        this.initScenes();

        var a = this.action();

        this._inScene.runAction(
            cc.Sequence.create
                (
                    this.easeActionWithAction(a),
                    cc.CallFunc.create(this.finish, this),
                    null
                )
        );
    },

    /**
     * initializes the scenes
     */
    initScenes:function () {
        this._inScene.setPosition(cc.p(-cc.Director.getInstance().getWinSize().width, 0));
    },

    /**
     * returns the action that will be performed
     */
    action:function () {
        return cc.MoveTo.create(this._duration, cc.p(0, 0));
    },

    /**
     * creates an ease action from action
     * @param {cc.ActionInterval} action
     * @return {cc.EaseOut}
     */
    easeActionWithAction:function (action) {
        //TODO need implement
        return cc.EaseOut.create(action, 2.0);
    }
});

/**
 * creates an action that  Move in from to the left the incoming scene.
 * @param {Number} t time in seconds
 * @param {cc.Scene} scene
 * @return {cc.TransitionMoveInL}
 * @example
 * // Example
 * var MoveInLeft = cc.TransitionMoveInL.create(1, nextScene)
 */
cc.TransitionMoveInL.create = function (t, scene) {
    var tempScene = new cc.TransitionMoveInL();
    if ((tempScene != null) && (tempScene.initWithDuration(t, scene))) {
        return tempScene;
    }
    return null;
};

/**
 * Move in from to the right the incoming scene.
 * @class
 * @extends cc.TransitionMoveInL
 */
cc.TransitionMoveInR = cc.TransitionMoveInL.extend(/** @lends cc.TransitionMoveInR# */{

    /**
     * Init
     */
    initScenes:function () {
        var s = cc.Director.getInstance().getWinSize();
        this._inScene.setPosition(cc.p(s.width, 0));
    }
});

/**
 * create a scene transition that Move in from to the right the incoming scene.
 * @param {Number} t time in seconds
 * @param {cc.Scene} scene
 * @return {cc.TransitionMoveInR}
 * @example
 * // Example
 * var MoveInRight = cc.TransitionMoveInR.create(1, nextScene)
 */
cc.TransitionMoveInR.create = function (t, scene) {
    var tempScene = new cc.TransitionMoveInR();
    if ((tempScene != null) && (tempScene.initWithDuration(t, scene))) {
        return tempScene;
    }
    return null;
};

/**
 * Move in from to the top the incoming scene.
 * @class
 * @extends cc.TransitionMoveInL
 */
cc.TransitionMoveInT = cc.TransitionMoveInL.extend(/** @lends cc.TransitionMoveInT# */{

    /**
     * init
     */
    initScenes:function () {
        var s = cc.Director.getInstance().getWinSize();
        this._inScene.setPosition(cc.p(s.height, 0));
    }
});

/**
 * Move in from to the top the incoming scene.
 * @param {Number} t time in seconds
 * @param {cc.Scene} scene
 * @return {cc.TransitionMoveInT}
 * @example
 * // Example
 * var MoveInTop = cc.TransitionMoveInT.create(1, nextScene)
 */
cc.TransitionMoveInT.create = function (t, scene) {
    var tempScene = new cc.TransitionMoveInT();
    if ((tempScene != null) && (tempScene.initWithDuration(t, scene))) {
        return tempScene;
    }
    return null;
};

/**
 *  Move in from to the bottom the incoming scene.
 * @class
 * @extends cc.TransitionMoveInL
 */
cc.TransitionMoveInB = cc.TransitionMoveInL.extend(/** @lends cc.TransitionMoveInB# */{

    /**
     * init
     */
    initScenes:function () {
        var s = cc.Director.getInstance().getWinSize();
        this._inScene.setPosition(cc.p(0, -s.height));
    }
});

/**
 * create a scene transition that Move in from to the bottom the incoming scene.
 * @param {Number} t time in seconds
 * @param {cc.Scene} scene
 * @return {cc.TransitionMoveInB}
 * @example
 * // Example
 * var MoveinB = cc.TransitionMoveInB.create(1, nextScene)
 */
cc.TransitionMoveInB.create = function (t, scene) {
    var tempScene = new cc.TransitionMoveInB();
    if ((tempScene != null) && (tempScene.initWithDuration(t, scene))) {
        return tempScene;
    }
    return null;
};

/**
 * The adjust factor is needed to prevent issue #442<br/>
 * One solution is to use DONT_RENDER_IN_SUBPIXELS images, but NO<br/>
 * The other issue is that in some transitions (and I don't know why)<br/>
 * the order should be reversed (In in top of Out or vice-versa).
 * @constant
 * @type Number
 */
cc.ADJUST_FACTOR = 0.5;

/**
 * a transition that a new scene is slided from left
 * @class
 * @extends cc.TransitionScene
 */
cc.TransitionSlideInL = cc.TransitionScene.extend(/** @lends cc.TransitionSlideInL# */{
    _sceneOrder:function () {
        this._isInSceneOnTop = false;
    },

    /**
     * Constructor
     */
    ctor:function () {
    },

    /**
     * custom on enter
     */
    onEnter:function () {
        this._super();
        this.initScenes();

        var inA = this.action();
        var outA = this.action();

        var inAction = this.easeActionWithAction(inA);
        var outAction = cc.Sequence.create
            (
                this.easeActionWithAction(outA),
                cc.CallFunc.create(this.finish, this),
                null
            );
        this._inScene.runAction(inAction);
        this._outScene.runAction(outAction);
    },

    /**
     * initializes the scenes
     */
    initScenes:function () {
        var s = cc.Director.getInstance().getWinSize();
        this._inScene.setPosition(cc.p(-(s.width - cc.ADJUST_FACTOR), 0));
    },
    /**
     * returns the action that will be performed by the incomming and outgoing scene
     * @return {cc.MoveBy}
     */
    action:function () {
        var s = cc.Director.getInstance().getWinSize();
        return cc.MoveBy.create(this._duration, cc.p(s.width - cc.ADJUST_FACTOR, 0));
    },

    /**
     * @param {cc.ActionInterval} action
     * @return {*}
     */
    easeActionWithAction:function (action) {
        return cc.EaseOut.create(action, 2.0);
    }
});

/**
 * create a transition that a new scene is slided from left
 * @param {Number} t time in seconds
 * @param {cc.Scene} scene
 * @return {cc.TransitionSlideInL}
 * @example
 * // Example
 * var myTransition = cc.TransitionSlideInL.create(1.5, nextScene)
 */
cc.TransitionSlideInL.create = function (t, scene) {
    var tempScene = new cc.TransitionSlideInL();
    if ((tempScene != null) && (tempScene.initWithDuration(t, scene))) {
        return tempScene;
    }
    return null;
};

/**
 *  Slide in the incoming scene from the right border.
 * @class
 * @extends cc.TransitionSlideInL
 */
cc.TransitionSlideInR = cc.TransitionSlideInL.extend(/** @lends cc.TransitionSlideInR# */{
    _sceneOrder:function () {
        this._isInSceneOnTop = true;
    },
    /**
     * initializes the scenes
     */
    initScenes:function () {
        var s = cc.Director.getInstance().getWinSize();
        this._inScene.setPosition(cc.p(s.width - cc.ADJUST_FACTOR, 0));
    },
    /**
     *  returns the action that will be performed by the incomming and outgoing scene
     * @return {cc.MoveBy}
     */
    action:function () {
        var s = cc.Director.getInstance().getWinSize();
        return cc.MoveBy.create(this._duration, cc.p(-(s.width - cc.ADJUST_FACTOR), 0));
    }
});

/**
 * create Slide in the incoming scene from the right border.
 * @param {Number} t time in seconds
 * @param {cc.Scene} scene
 * @return {cc.TransitionSlideInR}
 * @example
 * // Example
 * var myTransition = cc.TransitionSlideInR.create(1.5, nextScene)
 */
cc.TransitionSlideInR.create = function (t, scene) {
    var tempScene = new cc.TransitionSlideInR();
    if ((tempScene != null) && (tempScene.initWithDuration(t, scene))) {
        return tempScene;
    }
    return null;
};

/**
 * Slide in the incoming scene from the bottom border.
 * @class
 * @extends cc.TransitionSlideInL
 */
cc.TransitionSlideInB = cc.TransitionSlideInL.extend(/** @lends cc.TransitionSlideInB# */{
    _sceneOrder:function () {
        this._isInSceneOnTop = false;
    },

    /**
     * initializes the scenes
     */
    initScenes:function () {
        var s = cc.Director.getInstance().getWinSize();
        this._inScene.setPosition(cc.p(0, s.height - cc.ADJUST_FACTOR));
    },

    /**
     * returns the action that will be performed by the incomming and outgoing scene
     * @return {cc.MoveBy}
     */
    action:function () {
        var s = cc.Director.getInstance().getWinSize();
        return cc.MoveBy.create(this._duration, cc.p(0, -(s.height - cc.ADJUST_FACTOR)));
    }
});

/**
 * create a Slide in the incoming scene from the bottom border.
 * @param {Number} t time in seconds
 * @param {cc.Scene} scene
 * @return {cc.TransitionSlideInB}
 * @example
 * // Example
 * var myTransition = cc.TransitionSlideInB.create(1.5, nextScene)
 */
cc.TransitionSlideInB.create = function (t, scene) {
    var tempScene = new cc.TransitionSlideInB();
    if ((tempScene != null) && (tempScene.initWithDuration(t, scene))) {
        return tempScene;
    }
    return null;
};

/**
 *  Slide in the incoming scene from the top border.
 *  @class
 *  @extends cc.TransitionSlideInL
 */
cc.TransitionSlideInT = cc.TransitionSlideInL.extend(/** @lends cc.TransitionSlideInT# */{
    _sceneOrder:function () {
        this._isInSceneOnTop = true;
    },

    /**
     * initializes the scenes
     */
    initScenes:function () {
        var s = cc.Director.getInstance().getWinSize();
        this._inScene.setPosition(cc.p(0, -(s.height - cc.ADJUST_FACTOR)));
    },

    /**
     * returns the action that will be performed by the incomming and outgoing scene
     * @return {cc.MoveBy}
     */
    action:function () {
        var s = cc.Director.getInstance().getWinSize();
        return cc.MoveBy.create(this._duration, cc.p(0, s.height - cc.ADJUST_FACTOR));
    }
});

/**
 * create a Slide in the incoming scene from the top border.
 * @param {Number} t time in seconds
 * @param {cc.Scene} scene
 * @return {cc.TransitionSlideInT}
 * @example
 * // Example
 * var myTransition = cc.TransitionSlideInT.create(1.5, nextScene)
 */
cc.TransitionSlideInT.create = function (t, scene) {
    var tempScene = new cc.TransitionSlideInT();
    if ((tempScene != null) && (tempScene.initWithDuration(t, scene))) {
        return tempScene;
    }
    return null;
};

/**
 * Shrink the outgoing scene while grow the incoming scene
 * @class
 * @extends cc.TransitionScene
 */
cc.TransitionShrinkGrow = cc.TransitionScene.extend(/** @lends cc.TransitionShrinkGrow# */{

    /**
     * Custom on enter
     */
    onEnter:function () {
        this._super();

        this._inScene.setScale(0.001);
        this._outScene.setScale(1.0);

        this._inScene.setAnchorPoint(cc.p(2 / 3.0, 0.5));
        this._outScene.setAnchorPoint(cc.p(1 / 3.0, 0.5));

        var scaleOut = cc.ScaleTo.create(this._duration, 0.01);
        var scaleIn = cc.ScaleTo.create(this._duration, 1.0);

        this._inScene.runAction(this.easeActionWithAction(scaleIn));
        this._outScene.runAction(
            cc.Sequence.create(
                this.easeActionWithAction(scaleOut),
                cc.CallFunc.create(this.finish, this)
            )
        );
    },

    /**
     * @param action
     * @return {cc.EaseOut}
     */
    easeActionWithAction:function (action) {
        //TODO
        return cc.EaseOut.create(action, 2.0);
    }
});

/**
 * Shrink the outgoing scene while grow the incoming scene
 * @param {Number} t time in seconds
 * @param {cc.Scene} scene
 * @return {cc.TransitionShrinkGrow}
 * @example
 * // Example
 * var myTransition = cc.TransitionShrinkGrow.create(1.5, nextScene)
 */
cc.TransitionShrinkGrow.create = function (t, scene) {
    var tempScene = new cc.TransitionShrinkGrow();
    if ((tempScene != null) && (tempScene.initWithDuration(t, scene))) {
        return tempScene;
    }
    return null;
};

/**
 *  Flips the screen horizontally.<br/>
 * The front face is the outgoing scene and the back face is the incoming scene.
 * @class
 * @extends cc.TransitionSceneOriented
 */
cc.TransitionFlipX = cc.TransitionSceneOriented.extend(/** @lends cc.TransitionFlipX# */{

    /**
     * custom on enter
     */
    onEnter:function () {
        this._super();

        var inA, outA;
        this._inScene.setVisible(false);

        var inDeltaZ, inAngleZ;
        var outDeltaZ, outAngleZ;

        if (this._orientation == cc.TRANSITION_ORIENTATION_RIGHT_OVER) {
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

        inA = cc.Sequence.create
            (
                cc.DelayTime.create(this._duration / 2),
                cc.Show.create(),
                //TODO
                cc.OrbitCamera.create(this._duration / 2, 1, 0, inAngleZ, inDeltaZ, 0, 0),
                cc.CallFunc.create(this.finish, this)
            );

        outA = cc.Sequence.create
            (
                cc.OrbitCamera.create(this._duration / 2, 1, 0, outAngleZ, outDeltaZ, 0, 0),
                cc.Hide.create(),
                cc.DelayTime.create(this._duration / 2)
            );

        this._inScene.runAction(inA);
        this._outScene.runAction(outA);
    }
});

/**
 * Flips the screen horizontally.<br/>
 * The front face is the outgoing scene and the back face is the incoming scene.
 * @param {Number} t time in seconds
 * @param {cc.Scene} scene
 * @param {cc.TRANSITION_ORIENTATION_LEFT_OVER|cc.TRANSITION_ORIENTATION_RIGHT_OVER|cc.TRANSITION_ORIENTATION_UP_OVER|cc.TRANSITION_ORIENTATION_DOWN_OVER} o
 * @return {cc.TransitionFlipX}
 * @example
 * // Example
 * var myTransition = cc.TransitionFlipX.create(1.5, nextScene) //default is cc.TRANSITION_ORIENTATION_RIGHT_OVER
 *
 * //OR
 * var myTransition = cc.TransitionFlipX.create(1.5, nextScene, cc.TRANSITION_ORIENTATION_UP_OVER)
 */
cc.TransitionFlipX.create = function (t, scene, o) {
    if (o == null)
        o = cc.TRANSITION_ORIENTATION_RIGHT_OVER;

    var tempScene = new cc.TransitionFlipX();
    tempScene.initWithDuration(t, scene, o);

    return tempScene;
};

/**
 * Flips the screen vertically.<br/>
 * The front face is the outgoing scene and the back face is the incoming scene.
 * @class
 * @extends cc.TransitionSceneOriented
 */
cc.TransitionFlipY = cc.TransitionSceneOriented.extend(/** @lends cc.TransitionFlipY# */{

    /**
     * custom on enter
     */
    onEnter:function () {
        this._super();

        var inA, outA;
        this._inScene.setVisible(false);

        var inDeltaZ, inAngleZ;
        var outDeltaZ, outAngleZ;

        if (this._orientation == cc.TRANSITION_ORIENTATION_UP_OVER) {
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
        inA = cc.Sequence.create
            (
                cc.DelayTime.create(this._duration / 2),
                cc.Show.create(),
                cc.OrbitCamera.create(this._duration / 2, 1, 0, inAngleZ, inDeltaZ, 90, 0),
                cc.CallFunc.create(this.finish, this)
            );
        outA = cc.Sequence.create
            (
                cc.OrbitCamera.create(this._duration / 2, 1, 0, outAngleZ, outDeltaZ, 90, 0),
                cc.Hide.create(),
                cc.DelayTime.create(this._duration / 2)
            );

        this._inScene.runAction(inA);
        this._outScene.runAction(outA);
    }
});

/**
 * Flips the screen vertically.<br/>
 * The front face is the outgoing scene and the back face is the incoming scene.
 * @param {Number} t time in seconds
 * @param {cc.Scene} scene
 * @param {cc.TRANSITION_ORIENTATION_LEFT_OVER|cc.TRANSITION_ORIENTATION_RIGHT_OVER|cc.TRANSITION_ORIENTATION_UP_OVER|cc.TRANSITION_ORIENTATION_DOWN_OVER} o
 * @return {cc.TransitionFlipY}
 * @example
 * // Example
 * var myTransition = cc.TransitionFlipY.create(1.5, nextScene)//default is cc.TRANSITION_ORIENTATION_UP_OVER
 *
 * //OR
 * var myTransition = cc.TransitionFlipY.create(1.5, nextScene, cc.TRANSITION_ORIENTATION_RIGHT_OVER)
 */
cc.TransitionFlipY.create = function (t, scene, o) {
    if (o == null)
        o = cc.TRANSITION_ORIENTATION_UP_OVER;

    var tempScene = new cc.TransitionFlipY();
    tempScene.initWithDuration(t, scene, o);

    return tempScene;
};

/**
 * Flips the screen half horizontally and half vertically.<br/>
 * The front face is the outgoing scene and the back face is the incoming scene.
 * @class
 * @extends cc.TransitionSceneOriented
 */
cc.TransitionFlipAngular = cc.TransitionSceneOriented.extend(/** @lends cc.TransitionFlipAngular# */{
    /**
     * custom on enter
     */
    onEnter:function () {
        this._super();

        var inA, outA;
        this._inScene.setVisible(false);

        var inDeltaZ, inAngleZ;
        var outDeltaZ, outAngleZ;

        if (this._orientation == cc.TRANSITION_ORIENTATION_RIGHT_OVER) {
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
        inA = cc.Sequence.create
            (
                cc.DelayTime.create(this._duration / 2),
                cc.Show.create(),
                cc.OrbitCamera.create(this._duration / 2, 1, 0, inAngleZ, inDeltaZ, -45, 0),
                cc.CallFunc.create(this.finish, this)
            );
        outA = cc.Sequence.create
            (
                cc.OrbitCamera.create(this._duration / 2, 1, 0, outAngleZ, outDeltaZ, 45, 0),
                cc.Hide.create(),
                cc.DelayTime.create(this._duration / 2)
            );

        this._inScene.runAction(inA);
        this._outScene.runAction(outA);
    }
});

/**
 * Flips the screen half horizontally and half vertically.<br/>
 * The front face is the outgoing scene and the back face is the incoming scene.
 * @param {Number} t time in seconds
 * @param {cc.Scene} scene
 * @param {cc.TRANSITION_ORIENTATION_LEFT_OVER|cc.TRANSITION_ORIENTATION_RIGHT_OVER|cc.TRANSITION_ORIENTATION_UP_OVER|cc.TRANSITION_ORIENTATION_DOWN_OVER} o
 * @return {cc.TransitionFlipAngular}
 * @example
 * // Example
 * var myTransition = cc.TransitionFlipAngular.create(1.5, nextScene)//default is cc.TRANSITION_ORIENTATION_RIGHT_OVER
 *
 * //or
 * var myTransition = cc.TransitionFlipAngular.create(1.5, nextScene, cc.TRANSITION_ORIENTATION_DOWN_OVER)
 */
cc.TransitionFlipAngular.create = function (t, scene, o) {
    if (o == null)
        o = cc.TRANSITION_ORIENTATION_RIGHT_OVER;

    var tempScene = new cc.TransitionFlipAngular();
    tempScene.initWithDuration(t, scene, o);

    return tempScene;
};

/**
 *  Flips the screen horizontally doing a zoom out/in<br/>
 * The front face is the outgoing scene and the back face is the incoming scene.
 * @class
 * @extends cc.TransitionSceneOriented
 */
cc.TransitionZoomFlipX = cc.TransitionSceneOriented.extend(/** @lends cc.TransitionZoomFlipX# */{

    /**
     * custom on enter
     */
    onEnter:function () {
        this._super();

        var inA, outA;
        this._inScene.setVisible(false);

        var inDeltaZ, inAngleZ;
        var outDeltaZ, outAngleZ;

        if (this._orientation == cc.TRANSITION_ORIENTATION_RIGHT_OVER) {
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
        inA = cc.Sequence.create(
            cc.DelayTime.create(this._duration / 2),
            cc.Spawn.create(
                cc.OrbitCamera.create(this._duration / 2, 1, 0, inAngleZ, inDeltaZ, 0, 0),
                cc.ScaleTo.create(this._duration / 2, 1),
                cc.Show.create()),
            cc.CallFunc.create(this.finish, this)
        );
        outA = cc.Sequence.create(
            cc.Spawn.create(
                cc.OrbitCamera.create(this._duration / 2, 1, 0, outAngleZ, outDeltaZ, 0, 0),
                cc.ScaleTo.create(this._duration / 2, 0.5)),
            cc.Hide.create(),
            cc.DelayTime.create(this._duration / 2)
        );

        this._inScene.setScale(0.5);
        this._inScene.runAction(inA);
        this._outScene.runAction(outA);
    }
});

/**
 * Flips the screen horizontally doing a zoom out/in<br/>
 * The front face is the outgoing scene and the back face is the incoming scene.
 * @param {Number} t time in seconds
 * @param {cc.Scene} scene
 * @param {cc.TRANSITION_ORIENTATION_LEFT_OVER|cc.TRANSITION_ORIENTATION_RIGHT_OVER|cc.TRANSITION_ORIENTATION_UP_OVER|cc.TRANSITION_ORIENTATION_DOWN_OVER} o
 * @return {cc.TransitionZoomFlipX}
 * @example
 * // Example
 * var myTransition = cc.TransitionZoomFlipX.create(1.5, nextScene)//default is cc.TRANSITION_ORIENTATION_RIGHT_OVER
 *
 * //OR
 * var myTransition = cc.TransitionZoomFlipX.create(1.5, nextScene, cc.TRANSITION_ORIENTATION_DOWN_OVER)
 */
cc.TransitionZoomFlipX.create = function (t, scene, o) {
    if (o == null)
        o = cc.TRANSITION_ORIENTATION_RIGHT_OVER;

    var tempScene = new cc.TransitionZoomFlipX();
    tempScene.initWithDuration(t, scene, o);

    return tempScene;
};

/**
 * Flips the screen vertically doing a little zooming out/in<br/>
 * The front face is the outgoing scene and the back face is the incoming scene.
 * @class
 * @extends cc.TransitionSceneOriented
 */
cc.TransitionZoomFlipY = cc.TransitionSceneOriented.extend(/** @lends cc.TransitionZoomFlipY# */{

    /**
     * custom on enter
     */
    onEnter:function () {
        this._super();

        var inA, outA;
        this._inScene.setVisible(false);

        var inDeltaZ, inAngleZ;
        var outDeltaZ, outAngleZ;

        if (this._orientation == cc.TRANSITION_ORIENTATION_UP_OVER) {
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
        inA = cc.Sequence.create(
            cc.DelayTime.create(this._duration / 2),
            cc.Spawn.create(
                cc.OrbitCamera.create(this._duration / 2, 1, 0, inAngleZ, inDeltaZ, 90, 0),
                cc.ScaleTo.create(this._duration / 2, 1),
                cc.Show.create()),
            cc.CallFunc.create(this.finish, this));

        outA = cc.Sequence.create(
            cc.Spawn.create(
                cc.OrbitCamera.create(this._duration / 2, 1, 0, outAngleZ, outDeltaZ, 90, 0),
                cc.ScaleTo.create(this._duration / 2, 0.5)),
            cc.Hide.create(),
            cc.DelayTime.create(this._duration / 2));

        this._inScene.setScale(0.5);
        this._inScene.runAction(inA);
        this._outScene.runAction(outA);
    }
});

/**
 * Flips the screen vertically doing a little zooming out/in<br/>
 * The front face is the outgoing scene and the back face is the incoming scene.
 * @param {Number} t time in seconds
 * @param {cc.Scene} scene
 * @param {cc.TRANSITION_ORIENTATION_LEFT_OVER|cc.TRANSITION_ORIENTATION_RIGHT_OVER|cc.TRANSITION_ORIENTATION_UP_OVER|cc.TRANSITION_ORIENTATION_DOWN_OVER} o
 * @return {cc.TransitionZoomFlipY}
 * @example
 * // Example
 * var myTransition = cc.TransitionZoomFlipY.create(1.5, nextScene)//default is cc.TRANSITION_ORIENTATION_UP_OVER
 *
 * //OR
 * var myTransition = cc.TransitionZoomFlipY.create(1.5, nextScene, cc.TRANSITION_ORIENTATION_DOWN_OVER)
 */
cc.TransitionZoomFlipY.create = function (t, scene, o) {
    if (o == null)
        o = cc.TRANSITION_ORIENTATION_UP_OVER;

    var tempScene = new cc.TransitionZoomFlipY();
    tempScene.initWithDuration(t, scene, o);

    return tempScene;
};

/**
 *  Flips the screen half horizontally and half vertically doing a little zooming out/in.<br/>
 * The front face is the outgoing scene and the back face is the incoming scene.
 * @class
 * @extends cc.TransitionSceneOriented
 */
cc.TransitionZoomFlipAngular = cc.TransitionSceneOriented.extend(/** @lends cc.TransitionZoomFlipAngular# */{

    /**
     * custom on enter
     */
    onEnter:function () {
        this._super();

        var inA, outA;
        this._inScene.setVisible(false);

        var inDeltaZ, inAngleZ;
        var outDeltaZ, outAngleZ;

        if (this._orientation == cc.TRANSITION_ORIENTATION_RIGHT_OVER) {
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
        inA = cc.Sequence.create(
            cc.DelayTime.create(this._duration / 2),
            cc.Spawn.create(
                cc.OrbitCamera.create(this._duration / 2, 1, 0, inAngleZ, inDeltaZ, -45, 0),
                cc.ScaleTo.create(this._duration / 2, 1),
                cc.Show.create()),
            cc.Show.create(),
            cc.CallFunc.create(this.finish, this));
        outA = cc.Sequence.create(
            cc.Spawn.create(
                cc.OrbitCamera.create(this._duration / 2, 1, 0, outAngleZ, outDeltaZ, 45, 0),
                cc.ScaleTo.create(this._duration / 2, 0.5)),
            cc.Hide.create(),
            cc.DelayTime.create(this._duration / 2));

        this._inScene.setScale(0.5);
        this._inScene.runAction(inA);
        this._outScene.runAction(outA);
    }
});

/**
 *  Flips the screen half horizontally and half vertically doing a little zooming out/in.<br/>
 * The front face is the outgoing scene and the back face is the incoming scene.
 * @param {Number} t time in seconds
 * @param {cc.Scene} scene
 * @param {cc.TRANSITION_ORIENTATION_LEFT_OVER|cc.TRANSITION_ORIENTATION_RIGHT_OVER|cc.TRANSITION_ORIENTATION_UP_OVER|cc.TRANSITION_ORIENTATION_DOWN_OVER} o
 * @return {cc.TransitionZoomFlipAngular}
 * @example
 * // Example
 * var myTransition = cc.TransitionZoomFlipAngular.create(1.5, nextScene)//default is cc.TRANSITION_ORIENTATION_RIGHT_OVER
 *
 * //OR
 * var myTransition = cc.TransitionZoomFlipAngular.create(1.5, nextScene, cc.TRANSITION_ORIENTATION_DOWN_OVER)
 */
cc.TransitionZoomFlipAngular.create = function (t, scene, o) {
    if (o == null)
        o = cc.TRANSITION_ORIENTATION_RIGHT_OVER;

    var tempScene = new cc.TransitionZoomFlipAngular();
    tempScene.initWithDuration(t, scene, o);

    return tempScene;
};

/**
 * Fade out the outgoing scene and then fade in the incoming scene.
 * @class
 * @extends cc.TransitionScene
 */
cc.TransitionFade = cc.TransitionScene.extend(/** @lends cc.TransitionFade# */{
    _color:new cc.Color3B(),

    /**
     * Constructor
     */
    ctor:function () {
    },

    /**
     * custom on enter
     */
    onEnter:function () {
        this._super();

        var l = cc.LayerColor.create(this._color);
        this._inScene.setVisible(false);

        this.addChild(l, 2, cc.SCENE_FADE);
        var f = this.getChildByTag(cc.SCENE_FADE);

        //TODO
        var a = cc.Sequence.create(
            cc.FadeIn.create(this._duration / 2),
            cc.CallFunc.create(this.hideOutShowIn, this), //CCCallFunc.actionWithTarget:self selector:@selector(hideOutShowIn)],
            cc.FadeOut.create(this._duration / 2),
            cc.CallFunc.create(this.finish, this) //:self selector:@selector(finish)],
        );
        f.runAction(a);
    },

    /**
     * custom on exit
     */
    onExit:function () {
        this._super();
        this.removeChildByTag(cc.SCENE_FADE, false);
    },

    /**
     * initializes the transition with a duration and with an RGB color
     * @param {Number} t time in seconds
     * @param {cc.Scene} scene
     * @param {cc.Color3B} color
     * @return {Boolean}
     */
    initWithDuration:function (t, scene, color) {
        if ((color == 'undefined') || (color == null)) {
            color = cc.black();
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


/**
 * Fade out the outgoing scene and then fade in the incoming scene.
 * @param {Number} t time in seconds
 * @param {cc.Scene} scene
 * @param {cc.Color3B} color
 * @return {cc.TransitionFade}
 * @example
 * // Example
 * var myTransition = cc.TransitionFade.create(1.5, nextScene, cc.c3b(255,0,0))//fade to red
 */
cc.TransitionFade.create = function (t, scene, color) {
    var transition = new cc.TransitionFade();
    transition.initWithDuration(t, scene, color);

    return transition;
};

/**
 * Cross fades two scenes using the cc.RenderTexture object.
 * @class
 * @extends cc.TransitionScene
 */
cc.TransitionCrossFade = cc.TransitionScene.extend(/** @lends cc.TransitionCrossFade# */{

    /**
     * custom on enter
     */
    onEnter:function () {
        this._super();

        // create a transparent color layer
        // in which we are going to add our rendertextures
        var color = new cc.Color4B(0, 0, 0, 0);
        var size = cc.Director.getInstance().getWinSize();
        var layer = cc.LayerColor.create(color);

        // create the first render texture for inScene
        var inTexture = cc.RenderTexture.create(size.width, size.height);

        if (null == inTexture) {
            return;
        }

        inTexture.getSprite().setAnchorPoint(cc.p(0.5, 0.5));
        inTexture.setPosition(cc.p(size.width / 2, size.height / 2));
        inTexture.setAnchorPoint(cc.p(0.5, 0.5));

        // render inScene to its texturebuffer
        inTexture.begin();
        this._inScene.visit();
        inTexture.end();

        // create the second render texture for outScene
        var outTexture = cc.RenderTexture.create(size.width, size.height);
        outTexture.getSprite().setAnchorPoint(cc.p(0.5, 0.5));
        outTexture.setPosition(cc.p(size.width / 2, size.height / 2));
        outTexture.setAnchorPoint(cc.p(0.5, 0.5));

        // render outScene to its texturebuffer
        outTexture.begin();
        this._outScene.visit();
        outTexture.end();

        // inScene will lay on background and will not be used with alpha
        inTexture.getSprite().setBlendFunc(gl.ONE, gl.ONE);
        // we are going to blend outScene via alpha
        outTexture.getSprite().setBlendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        // add render textures to the layer
        layer.addChild(inTexture);
        layer.addChild(outTexture);

        // initial opacity:
        inTexture.getSprite().setOpacity(255);
        outTexture.getSprite().setOpacity(255);

        // create the blend action
        //TODO
        var layerAction = cc.Sequence.create(
            cc.FadeTo.create(this._duration, 0),
            cc.CallFunc.create(this.hideOutShowIn, this),
            cc.CallFunc.create(this.finish, this)
        );

        // run the blend action
        outTexture.getSprite().runAction(layerAction);

        // add the layer (which contains our two rendertextures) to the scene
        this.addChild(layer, 2, cc.SCENE_FADE);
    },

    /**
     * custom on exit
     */
    onExit:function () {
        this.removeChildByTag(cc.SCENE_FADE, false);
        this._super();
    },

    /**
     * overide draw
     */
    draw:function () {
        // override draw since both scenes (textures) are rendered in 1 scene
    }
});

/**
 * Cross fades two scenes using the cc.RenderTexture object.
 * @param {Number} t time in seconds
 * @param {cc.Scene} scene
 * @return {cc.TransitionCrossFade}
 * @example
 * // Example
 * var myTransition = cc.TransitionCrossFade.create(1.5, nextScene)
 */
cc.TransitionCrossFade.create = function (t, scene) {
    var Transition = new cc.TransitionCrossFade();
    Transition.initWithDuration(t, scene);
    return Transition;
};

/**
 *  Turn off the tiles of the outgoing scene in random order
 * @class
 * @extends cc.TransitionScene
 */
cc.TransitionTurnOffTiles = cc.TransitionScene.extend(/** @lends cc.TransitionTurnOffTiles# */{
    _sceneOrder:function () {
        this._isInSceneOnTop = false;
    },

    /**
     * custom on enter
     */
    onEnter:function () {
        this._super();
        var s = cc.Director.getInstance().getWinSize();
        var aspect = s.width / s.height;
        var x = 12 * aspect;
        var y = 12;
        var toff = cc.TurnOffTiles.create(cc.g(x, y), this._duration);
        var action = this.easeActionWithAction(toff);
        //TODO
        this._outScene.runAction(cc.Sequence.create(action, cc.CallFunc.create(this.finish, this), cc.StopGrid.create()));
    },

    /**
     * @param {cc.ActionInterval} action
     * @return {cc.ActionInterval}
     */
    easeActionWithAction:function (action) {
        return action;
    }
});

/**
 *  Turn off the tiles of the outgoing scene in random order
 * @param {Number} t time in seconds
 * @param {cc.Scene} scene
 * @return {cc.TransitionTurnOffTiles}
 * @example
 * // Example
 * var myTransition = cc.TransitionTurnOffTiles.create(1.5, nextScene)
 */
cc.TransitionTurnOffTiles.create = function (t, scene) {
    var tempScene = new cc.TransitionTurnOffTiles();
    if ((tempScene != null) && (tempScene.initWithDuration(t, scene))) {
        return tempScene;
    }
    return null;
};

/**
 *  The odd columns goes upwards while the even columns goes downwards.
 * @class
 * @extends cc.TransitionScene
 */
cc.TransitionSplitCols = cc.TransitionScene.extend(/** @lends cc.TransitionSplitCols# */{

    /**
     * custom on enter
     */
    onEnter:function () {
        this._super();
        this._inScene.setVisible(false);

        var split = this.action();
        //TODO
        var seq = cc.Sequence.create(
            split,
            cc.CallFunc.create(this.hideOutShowIn, this),
            split.reverse());

        this.runAction(
            cc.Sequence.create(
                this.easeActionWithAction(seq),
                cc.CallFunc.create(this.finish, this),
                cc.StopGrid.create()
            ));
    },

    /**
     * @param {cc.ActionInterval} action
     * @return {cc.EaseInOut}
     */
    easeActionWithAction:function (action) {
        return cc.EaseInOut.create(action, 3.0);
    },

    /**
     * @return {*}
     */
    action:function () {
        //TODO
        return cc.SplitCols.create(3, this._duration / 2.0);
    }
});

/**
 * The odd columns goes upwards while the even columns goes downwards.
 * @param {Number} t time in seconds
 * @param {cc.Scene} scene
 * @return {cc.TransitionSplitCols}
 * @example
 * // Example
 * var myTransition = cc.TransitionSplitCols.create(1.5, nextScene)
 */
cc.TransitionSplitCols.create = function (t, scene) {
    var tempScene = new cc.TransitionSplitCols();
    if ((tempScene != null) && (tempScene.initWithDuration(t, scene))) {
        return tempScene;
    }
    return null;
};

/**
 *  The odd rows goes to the left while the even rows goes to the right.
 * @class
 * @extends cc.TransitionSplitCols
 */
cc.TransitionSplitRows = cc.TransitionSplitCols.extend(/** @lends cc.TransitionSplitRows# */{

    /**
     * @return {*}
     */
    action:function () {
        return cc.SplitRows.actionWithRows(3, this._duration / 2.0);
    }
});

/**
 * The odd rows goes to the left while the even rows goes to the right.
 * @param {Number} t time in seconds
 * @param {cc.Scene} scene
 * @return {cc.TransitionSplitRows}
 * @example
 * // Example
 * var myTransition = cc.TransitionSplitRows.create(1.5, nextScene)
 */
cc.TransitionSplitRows.create = function (t, scene) {
    var tempScene = new cc.TransitionSplitRows();
    if ((tempScene != null) && (tempScene.initWithDuration(t, scene))) {
        return tempScene;
    }
    return null;
};

/**
 *  Fade the tiles of the outgoing scene from the left-bottom corner the to top-right corner.
 * @class
 * @extends cc.TransitionScene
 */
cc.TransitionFadeTR = cc.TransitionScene.extend(/** @lends cc.TransitionFadeTR# */{
    _sceneOrder:function () {
        this._isInSceneOnTop = false;
    },

    /**
     * Custom on enter
     */
    onEnter:function () {
        this._super();

        var s = cc.Director.getInstance().getWinSize();
        var aspect = s.width / s.height;
        var x = (12 * aspect);
        var y = 12;

        var action = this.actionWithSize(cc.g(x, y));

        this._outScene.runAction(
            cc.Sequence.create(
                this.easeActionWithAction(action),
                cc.CallFunc.create(this.finish, this),
                cc.StopGrid.create())
        );
    },

    /**
     * @param {cc.ActionInterval} action
     * @return {cc.ActionInterval}
     */
    easeActionWithAction:function (action) {
        return action;
    },

    /**
     * @param {cc.Size} size
     * @return {*}
     */
    actionWithSize:function (size) {
        return cc.FadeOutTRTiles.create(size, this._duration);
    }
});

/**
 *  Fade the tiles of the outgoing scene from the left-bottom corner the to top-right corner.
 * @param {Number} t time in seconds
 * @param {cc.Scene} scene
 * @return {cc.TransitionFadeTR}
 * @example
 * // Example
 * var myTransition = cc.TransitionFadeTR.create(1.5, nextScene)
 */
cc.TransitionFadeTR.create = function (t, scene) {
    var tempScene = new cc.TransitionFadeTR();
    if ((tempScene != null) && (tempScene.initWithDuration(t, scene))) {
        return tempScene;
    }
    return null;
};

/**
 *  Fade the tiles of the outgoing scene from the top-right corner to the bottom-left corner.
 * @class
 * @extends cc.TransitionFadeTR
 */
cc.TransitionFadeBL = cc.TransitionFadeTR.extend(/** @lends cc.TransitionFadeBL# */{

    /**
     * @param {cc.Size} size
     * @return {*}
     */
    actionWithSize:function (size) {
        return cc.FadeOutBLTiles.create(size, this._duration);
    }
});

/**
 * Fade the tiles of the outgoing scene from the top-right corner to the bottom-left corner.
 * @param {Number} t time in seconds
 * @param {cc.Scene} scene
 * @return {cc.TransitionFadeBL}
 * @example
 * // Example
 * var myTransition = cc.TransitionFadeBL.create(1.5, nextScene)
 */
cc.TransitionFadeBL.create = function (t, scene) {
    var tempScene = new cc.TransitionFadeBL();
    if ((tempScene != null) && (tempScene.initWithDuration(t, scene))) {
        return tempScene;
    }
    return null;
};

/**
 * Fade the tiles of the outgoing scene from the top-right corner to the bottom-left corner.
 * @class
 * @extends cc.TransitionFadeTR
 */
cc.TransitionFadeUp = cc.TransitionFadeTR.extend(/** @lends cc.TransitionFadeUp# */{

    /**
     * @param {cc.Size} size
     * @return {*}
     */
    actionWithSize:function (size) {
        return cc.FadeOutUpTiles.create(size, this._duration);
    }
});

/**
 * Fade the tiles of the outgoing scene from the top-right corner to the bottom-left corner.
 * @param {Number} t time in seconds
 * @param {cc.Scene} scene
 * @return {cc.TransitionFadeUp}
 * @example
 * // Example
 * var myTransition = cc.TransitionFadeUp.create(1.5, nextScene)
 */
cc.TransitionFadeUp.create = function (t, scene) {
    var tempScene = new cc.TransitionFadeUp();
    if ((tempScene != null) && (tempScene.initWithDuration(t, scene))) {
        return tempScene;
    }
    return null;
};

/**
 * Fade the tiles of the outgoing scene from the top to the bottom.
 * @class
 * @extends cc.TransitionFadeTR
 */
cc.TransitionFadeDown = cc.TransitionFadeTR.extend(/** @lends cc.TransitionFadeDown# */{

    /**
     * @param {cc.Size} size
     * @return {*}
     */
    actionWithSize:function (size) {
        return cc.FadeOutDownTiles.create(size, this._duration);
    }
});

/**
 * Fade the tiles of the outgoing scene from the top to the bottom.
 * @param {Number} t time in seconds
 * @param {cc.Scene} scene
 * @return {cc.TransitionFadeDown}
 * @example
 * // Example
 * var myTransition = cc.TransitionFadeDown.create(1.5, nextScene)
 */
cc.TransitionFadeDown.create = function (t, scene) {
    var tempScene = new cc.TransitionFadeDown();
    if ((tempScene != null) && (tempScene.initWithDuration(t, scene))) {
        return tempScene;
    }
    return null;
};
