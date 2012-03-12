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
var CC = CC = CC || {};

CC.kSceneFade = parseInt("0xFADEFADE");

/** @brief CCTransitionEaseScene can ease the actions of the scene protocol.
 @since v0.8.2
 */
CC.CCTransitionEaseScene = CC.Class.extend({
    /** returns the Ease action that will be performed on a linear action.
     @since v0.8.2
     */
    easeActionWithAction:function(){}
});

/**
 * Orientation Type used by some transitions
 */
/// An horizontal orientation where the Left is nearer
CC.kOrientationLeftOver = 0;
/// An horizontal orientation where the Right is nearer
CC.kOrientationRightOver = 1;
/// A vertical orientation where the Up is nearer
CC.kOrientationUpOver = 0;
/// A vertical orientation where the Bottom is nearer
CC.kOrientationDownOver = 1;

CC.CCTransitionScene = CC.CCScene.extend({
    _m_pInScene:null,
    _m_pOutScene:null,
    _m_fDuration:null,
    _m_bIsInSceneOnTop:false,
    _m_bIsSendCleanupToScene:false,

    //private
    _setNewScene:function(dt){
        //TODO
        //CC.CC_UNUSED_PARAM(dt);
        // [self unschedule:_cmd];
        // "_cmd" is a local variable automatically defined in a method
        // that contains the selector for the method

        //TODO
        //this.unschedule(schedule_selector(CCTransitionScene::setNewScene));
        var director = CC.CCDirector.sharedDirector();
        // Before replacing, save the "send cleanup to scene"
        this._m_bIsSendCleanupToScene = director.isSendCleanupToScene();
        director.replaceScene(m_pInScene);

        // enable events while transitions
        CC.CCTouchDispatcher.sharedDispatcher().setDispatchEvents(true);
        // issue #267
        this._m_pOutScene.setIsVisible(true);
    },

    //protected
    _sceneOrder:function(){this._m_bIsInSceneOnTop = true;},

    draw:function(){
        this._super();

        if( this._m_bIsInSceneOnTop ) {
            this._m_pOutScene.visit();
            this._m_pInScene.visit();
        } else {
            this._m_pInScene.visit();
            this._m_pOutScene.visit();
        }
    },

    // custom onEnter
    onEnter:function(){
        this._super();
        this._m_pInScene.onEnter();
    },
    // custom onExit
    onExit:function(){
        this._super();
        this._m_pOutScene.onExit();

        // inScene should not receive the onExit callback
        // only the onEnterTransitionDidFinish
        this._m_pInScene.onEnterTransitionDidFinish();
    },
    // custom cleanup
    cleanup:function(){
        this._super();

        if( this._m_bIsSendCleanupToScene )
            this._m_pOutScene.cleanup();
    },

    /** initializes a transition with duration and incoming scene */
    initWithDuration:function(t,scene){
        CC.CCAssert( scene != null, "CCTransitionScene.initWithDuration() Argument scene must be non-nil");

        if (this.init()) {
            this._m_fDuration = t;

            // retain
            this._m_pInScene = scene;
            this._m_pOutScene = CC.CCDirector.sharedDirector().getRunningScene();

            CC.CCAssert( this._m_pInScene != this._m_pOutScene, "CCTransitionScene.initWithDuration() Incoming scene must be different from the outgoing scene" );

            // disable events while transitions
            CC.CCTouchDispatcher.sharedDispatcher().setDispatchEvents(false);
            this._sceneOrder();

            return true;
        } else {
            return false;
        }
    },

    /** called after the transition finishes */
    finish:function(){
        // clean up
        this._m_pInScene.setIsVisible(true);
        this._m_pInScene.setPosition(ccp(0,0));
        this._m_pInScene.setScale(1.0);
        this._m_pInScene.setRotation(0.0);
        this._m_pInScene.getCamera().restore();

        this._m_pOutScene.setIsVisible(false);
        this._m_pOutScene.setPosition(ccp(0,0));
        this._m_pOutScene.setScale(1.0);
        this._m_pOutScene.setRotation(0.0);
        this._m_pOutScene.getCamera().restore();

        //[self schedule:@selector(setNewScene:) interval:0];
        //TODO
        this.schedule(schschedule_selector(this._setNewScene), 0);
    },

    hideOutShowIn:function(){
        this._m_pInScene.setIsVisible(true);
        this._m_pOutScene.setIsVisible(false);
    }
});
/** creates a base transition with duration and incoming scene */
CC.CCTransitionScene.transitionWithDuration = function(t,scene){
    var pScene = new CC.CCTransitionScene();
    if((pScene != null)&&(pScene.initWithDuration(t,scene))){
        return pScene;
    }
    return null;
};

/** @brief A CCTransition that supports orientation like.
 * Possible orientation: LeftOver, RightOver, UpOver, DownOver
 */
CC.CCTransitionSceneOriented = CC.CCTransitionScene.extend({
    _m_eOrientation:0,

    initWithDuration:function(t,scene,orientation){
        if(this._super(t,scene)){
            this._m_eOrientation = orientation;
        }
        return true;
    }
});
/** creates a base transition with duration and incoming scene */
CC.CCTransitionSceneOriented.transitionWithDuration = function(t,scene,orientation){
    var pScene = new CC.CCTransitionSceneOriented();
    pScene.initWithDuration(t,scene,orientation);

    return pScene;
};

/** @brief CCTransitionRotoZoom:
 Rotate and zoom out the outgoing scene, and then rotate and zoom in the incoming
 */
CC.CCTransitionRotoZoom = CC.CCTransitionScene.extend({
    ctor:function(){},
    onEnter:function(){
        this._super();

        this._m_pInScene.setScale(0.001);
        this._m_pOutScene.setScale(1.0);

        this._m_pInScene.setAnchorPoint(ccp(0.5, 0.5));
        this._m_pOutScene.setAnchorPoint(ccp(0.5, 0.5));

        //TODO
        var rotozoom = CC.CCSequence.actions(
            CC.CCSpawn.actions(CC.CCScaleBy.actionWithDuration(this._m_fDuration/2, 0.001),
                CC.CCRotateBy.actionWithDuration(this._m_fDuration/2, 360 * 2), null ),
            CC.CCDelayTime.actionWithDuration(this._m_fDuration/2),null);

        this._m_pOutScene.runAction(rotozoom);
        this._m_pInScene.runAction(
            CC.CCSequence.actions( rotozoom.reverse(),
                CC.CCCallFunc.actionWithTarget(this, CC.callfunc_selector(this.finish)), null));
    }
});

CC.CCTransitionRotoZoom.transitionWithDuration = function(t,scene){
    var pScene = new CC.CCTransitionRotoZoom();
    if((pScene != null)&&(pScene.initWithDuration(t,scene))){
        return pScene;
    }
    return null;
};

/** @brief CCTransitionJumpZoom:
 Zoom out and jump the outgoing scene, and then jump and zoom in the incoming
 */
CC.CCTransitionJumpZoom = CC.CCTransitionScene.extend({
    onEnter:function(){
        this._super();

        var s = CC.CCDirector.sharedDirector().getWinSize();

        this._m_pInScene.setScale(0.5);
        this._m_pInScene.setPosition(ccp(s.width, 0));
        this._m_pInScene.setAnchorPoint(ccp(0.5, 0.5));
        this._m_pOutScene.setAnchorPoint(ccp(0.5, 0.5));
        //TODO
        var jump = CC.CCJumpBy.actionWithDuration(this._m_fDuration/4, ccp(-s.width,0), s.width/4, 2);
        var scaleIn = CC.CCScaleTo.actionWithDuration(this._m_fDuration/4, 1.0);
        var scaleOut = CC.CCScaleTo.actionWithDuration(this._m_fDuration/4, 0.5);

        var jumpZoomOut = CC.CCSequence.actions(scaleOut, jump, null);
        var jumpZoomIn = CC.CCSequence.actions(jump, scaleIn, null);

        var delay = CC.CCDelayTime.actionWithDuration(this._m_fDuration/2);

        this._m_pOutScene.runAction(jumpZoomOut);
        this._m_pInScene.runAction(CC.CCSequence.actions(delay,jumpZoomIn,
            CC.CCCallFunc.actionWithTarget(this, callfunc_selector(this.finish)),
            null));
    }
});

CC.CCTransitionJumpZoom.transitionWithDuration = function(t,scene){
    var pScene = new CC.CCTransitionJumpZoom();
    if((pScene != null)&&(pScene.initWithDuration(t,scene))){
        return pScene;
    }
    return null;
};

/** @brief CCTransitionMoveInL:
 Move in from to the left the incoming scene.
 */
CC.CCTransitionMoveInL = CC.CCTransitionScene.extend({
    onEnter:function(){
        this._super();
        this.initScenes();

        var a = this.action();

        //TODO
        this._m_pInScene.runAction(
            CC.CCSequence.actions
                (
                    this.easeActionWithAction(a),
                    CC.CCCallFunc.actionWithTarget(this, callfunc_selector(this.finish)),
                    null
                )
        );
    },
    /** initializes the scenes */
    initScenes:function(){
        var s = CC.CCDirector.sharedDirector().getWinSize();
        this._m_pInScene.setPosition( CC.ccp(-s.width,0) );
    },
    /** returns the action that will be performed */
    action:function(){return CC.CCMoveTo.actionWithDuration(this._m_fDuration, CC.ccp(0,0));},
    easeActionWithAction:function(action){return CC.CCEaseOut.actionWithAction(action, 2.0);}
});
CC.CCTransitionMoveInL.transitionWithDuration = function(t,scene){
    var pScene = new CC.CCTransitionMoveInL();
    if((pScene != null)&&(pScene.initWithDuration(t,scene))){
        return pScene;
    }
    return null;
};

/** @brief CCTransitionMoveInR:
 Move in from to the right the incoming scene.
 */
CC.CCTransitionMoveInR = CC.CCTransitionMoveInL.extend({
    initScenes:function(){
        var s = CC.CCDirector.sharedDirector().getWinSize();
        this._m_pInScene.setPosition( CC.ccp(s.width,0) );
    }
});
CC.CCTransitionMoveInR.transitionWithDuration = function(t,scene){
    var pScene = new CC.CCTransitionMoveInR();
    if((pScene != null)&&(pScene.initWithDuration(t,scene))){
        return pScene;
    }
    return null;
};

/** @brief CCTransitionMoveInT:
 Move in from to the top the incoming scene.
 */
CC.CCTransitionMoveInT = CC.CCTransitionMoveInL.extend({
    initScenes:function(){
        var s = CC.CCDirector.sharedDirector().getWinSize();
        this._m_pInScene.setPosition( CC.ccp(s.height,0) );
    }
});
CC.CCTransitionMoveInT.transitionWithDuration = function(t,scene){
    var pScene = new CC.CCTransitionMoveInT();
    if((pScene != null)&&(pScene.initWithDuration(t,scene))){
        return pScene;
    }
    return null;
};

/** @brief CCTransitionMoveInB:
 Move in from to the bottom the incoming scene.
 */
CC.CCTransitionMoveInB = CC.CCTransitionMoveInL.extend({
    initScenes:function(){
        var s = CC.CCDirector.sharedDirector().getWinSize();
        this._m_pInScene.setPosition( CC.ccp(0,-s.height) );
    }
});
CC.CCTransitionMoveInB.transitionWithDuration = function(t,scene){
    var pScene = new CC.CCTransitionMoveInB();
    if((pScene != null)&&(pScene.initWithDuration(t,scene))){
        return pScene;
    }
    return null;
};

CC.ADJUST_FACTOR = 0.5;
/** @brief CCTransitionSlideInL:
 Slide in the incoming scene from the left border.
 */
// The adjust factor is needed to prevent issue #442
// One solution is to use DONT_RENDER_IN_SUBPIXELS images, but NO
// The other issue is that in some transitions (and I don't know why)
// the order should be reversed (In in top of Out or vice-versa).
CC.CCTransitionSlideInL = CC.CCTransitionScene.extend({
    _sceneOrder:function(){this._m_bIsInSceneOnTop = false;},
    ctor:function(){},
    onEnter:function(){
        this._super();
        this.initScenes();

        var inA = this.action();
        var outA = this.action();

        var inAction = this.easeActionWithAction(inA);
        var outAction = CC.CCSequence.actions
            (
                this.easeActionWithAction(outA),
                CC.CCCallFunc.actionWithTarget(this, callfunc_selector(this.finish)),
                null
            );
        this._m_pInScene.runAction(inAction);
        this._m_pOutScene.runAction(outAction);
    },
    /** initializes the scenes */
    initScenes:function(){
        var s = CC.CCDirector.sharedDirector().getWinSize();
        this._m_pInScene.setPosition( CC.ccp(-(s.width-CC.ADJUST_FACTOR),0) );
    },
    /** returns the action that will be performed by the incomming and outgoing scene */
    action:function(){
        var s = CC.CCDirector.sharedDirector().getWinSize();
        return CC.CCMoveBy.actionWithDuration(this._m_fDuration, CC.ccp(s.width-CC.ADJUST_FACTOR,0));
    },
    easeActionWithAction:function(action){return CC.CCEaseOut.actionWithAction(action, 2.0);}
});
CC.CCTransitionSlideInL.transitionWithDuration = function(t,scene){
    var pScene = new CC.CCTransitionSlideInL();
    if((pScene != null)&&(pScene.initWithDuration(t,scene))){
        return pScene;
    }
    return null;
};

/** @brief CCTransitionSlideInR:
 Slide in the incoming scene from the right border.
 */
CC.CCTransitionSlideInR = CC.CCTransitionSlideInL.extend({
    _sceneOrder:function(){this._m_bIsInSceneOnTop = true;},
    /** initializes the scenes */
    initScenes:function(){
        var s = CC.CCDirector.sharedDirector().getWinSize();
        this._m_pInScene.setPosition( CC.ccp(s.width-CC.ADJUST_FACTOR,0) );
    },
    /** returns the action that will be performed by the incomming and outgoing scene */
    action:function(){
        var s = CC.CCDirector.sharedDirector().getWinSize();
        return CC.CCMoveBy.actionWithDuration(this._m_fDuration, CC.ccp(-(s.width-CC.ADJUST_FACTOR),0));
    }
});
CC.CCTransitionSlideInR.transitionWithDuration = function(t,scene){
    var pScene = new CC.CCTransitionSlideInR();
    if((pScene != null)&&(pScene.initWithDuration(t,scene))){
        return pScene;
    }
    return null;
};

/** @brief CCTransitionSlideInB:
 Slide in the incoming scene from the bottom border.
 */
CC.CCTransitionSlideInB = CC.CCTransitionSlideInL.extend({
    _sceneOrder:function(){this._m_bIsInSceneOnTop = false;},
    /** initializes the scenes */
    initScenes:function(){
        var s = CC.CCDirector.sharedDirector().getWinSize();
        this._m_pInScene.setPosition( CC.ccp(0,s.height-CC.ADJUST_FACTOR) );
    },
    /** returns the action that will be performed by the incomming and outgoing scene */
    action:function(){
        var s = CC.CCDirector.sharedDirector().getWinSize();
        return CC.CCMoveBy.actionWithDuration(this._m_fDuration, CC.ccp(0,-(s.height-CC.ADJUST_FACTOR)));
    }
});
CC.CCTransitionSlideInB.transitionWithDuration = function(t,scene){
    var pScene = new CC.CCTransitionSlideInB();
    if((pScene != null)&&(pScene.initWithDuration(t,scene))){
        return pScene;
    }
    return null;
};

/** @brief CCTransitionSlideInT:
 Slide in the incoming scene from the top border.
 */
CC.CCTransitionSlideInT = CC.CCTransitionSlideInL.extend({
    _sceneOrder:function(){this._m_bIsInSceneOnTop = true;},
    /** initializes the scenes */
    initScenes:function(){
        var s = CC.CCDirector.sharedDirector().getWinSize();
        this._m_pInScene.setPosition( CC.ccp(0,-(s.height-CC.ADJUST_FACTOR)) );
    },
    /** returns the action that will be performed by the incomming and outgoing scene */
    action:function(){
        var s = CC.CCDirector.sharedDirector().getWinSize();
        return CC.CCMoveBy.actionWithDuration(this._m_fDuration, CC.ccp(0,s.height-CC.ADJUST_FACTOR));
    }
});
CC.CCTransitionSlideInT.transitionWithDuration = function(t,scene){
    var pScene = new CC.CCTransitionSlideInT();
    if((pScene != null)&&(pScene.initWithDuration(t,scene))){
        return pScene;
    }
    return null;
};

/**
 @brief Shrink the outgoing scene while grow the incoming scene
 */
CC.CCTransitionShrinkGrow = CC.CCTransitionScene.extend({
    onEnter:function(){
        this._super();

        this._m_pInScene.setScale(0.001);
        this._m_pOutScene.setScale(1.0);

        this._m_pInScene.setAnchorPoint(ccp(2/3.0,0.5));
        this._m_pOutScene.setAnchorPoint(ccp(1/3.0,0.5));

        var scaleOut = CC.CCScaleTo.actionWithDuration(this._m_fDuration, 0.01);
        var scaleIn = CC.CCScaleTo.actionWithDuration(this._m_fDuration, 1.0);

        //TODO
        this._m_pInScene.runAction(this.easeActionWithAction(scaleIn));
        this._m_pOutScene.runAction
            (
                CC.CCSequence.actions
                    (
                        this.easeActionWithAction(scaleOut),
                        CC.CCCallFunc.actionWithTarget(this, callfunc_selector(this.finish)),
                        null
                    )
            );
    },
    easeActionWithAction:function(action){return CC.CCEaseOut.actionWithAction(action, 2.0);}
});
CC.CCTransitionShrinkGrow.transitionWithDuration = function(t,scene){
    var pScene = new CC.CCTransitionShrinkGrow();
    if((pScene != null)&&(pScene.initWithDuration(t,scene))){
        return pScene;
    }
    return null;
};

/** @brief CCTransitionFlipX:
 Flips the screen horizontally.
 The front face is the outgoing scene and the back face is the incoming scene.
 */
CC.CCTransitionFlipX = CC.CCTransitionSceneOriented.extend({
    onEnter:function(){
        this._super();

        var inA, outA;
        this._m_pInScene.setIsVisible(false);

        var inDeltaZ, inAngleZ;
        var outDeltaZ, outAngleZ;

        if( this._m_eOrientation == CC.kOrientationRightOver ){
            inDeltaZ = 90;
            inAngleZ = 270;
            outDeltaZ = 90;
            outAngleZ = 0;
        }else{
            inDeltaZ = -90;
            inAngleZ = 90;
            outDeltaZ = -90;
            outAngleZ = 0;
        }

        //TODO
        inA = CC.CCSequence.actions
            (
                CC.CCDelayTime.actionWithDuration(this._m_fDuration/2),
                CC.CCShow.action(),
                CC.CCOrbitCamera.actionWithDuration(this._m_fDuration/2, 1, 0, inAngleZ, inDeltaZ, 0, 0),
                CC.CCCallFunc.actionWithTarget(this, callfunc_selector(this.finish)),
                null
            );

        outA = CC.CCSequence.actions
            (
                CC.CCOrbitCamera.actionWithDuration(this._m_fDuration/2, 1, 0, outAngleZ, outDeltaZ, 0, 0),
                CC.CCHide.action(),
                CC.CCDelayTime.actionWithDuration(this._m_fDuration/2),
                null
            );

        this._m_pInScene.runAction(inA);
        this._m_pOutScene.runAction(outA);
    }
});
CC.CCTransitionFlipX.transitionWithDuration = function(t,scene,o){
    if(o == null)
        o = CC.kOrientationRightOver;

    var pScene = new CC.CCTransitionFlipX();
    pScene.initWithDuration(t, scene, o);

    return pScene;
};

/** @brief CCTransitionFlipY:
 Flips the screen vertically.
 The front face is the outgoing scene and the back face is the incoming scene.
 */
CC.CCTransitionFlipY = CC.CCTransitionSceneOriented.extend({
    onEnter:function(){
        this._super();

        var inA, outA;
        this._m_pInScene.setIsVisible(false);

        var inDeltaZ, inAngleZ;
        var outDeltaZ, outAngleZ;

        if( this._m_eOrientation == CC.kOrientationUpOver ){
            inDeltaZ = 90;
            inAngleZ = 270;
            outDeltaZ = 90;
            outAngleZ = 0;
        }else{
            inDeltaZ = -90;
            inAngleZ = 90;
            outDeltaZ = -90;
            outAngleZ = 0;
        }

        //TODO
        inA = CC.CCSequence.actions
            (
                CC.CCDelayTime.actionWithDuration(this._m_fDuration/2),
                CC.CCShow.action(),
                CC.CCOrbitCamera.actionWithDuration(this._m_fDuration/2, 1, 0, inAngleZ, inDeltaZ, 90, 0),
                CC.CCCallFunc.actionWithTarget(this, callfunc_selector(this.finish)),
                null
            );
        outA = CC.CCSequence.actions
            (
                CC.CCOrbitCamera.actionWithDuration(this._m_fDuration/2, 1, 0, outAngleZ, outDeltaZ, 90, 0),
                CC.CCHide.action(),
                CC.CCDelayTime.actionWithDuration(this._m_fDuration/2),
                null
            );

        this._m_pInScene.runAction(inA);
        this._m_pOutScene.runAction(outA);
    }
});
CC.CCTransitionFlipY.transitionWithDuration = function(t,scene,o){
    if(o == null)
        o = CC.kOrientationUpOver;

    var pScene = new CC.CCTransitionFlipY();
    pScene.initWithDuration(t, scene, o);

    return pScene;
};

/** @brief CCTransitionFlipAngular:
 Flips the screen half horizontally and half vertically.
 The front face is the outgoing scene and the back face is the incoming scene.
 */
CC.CCTransitionFlipAngular = CC.CCTransitionSceneOriented.extend({
    onEnter:function(){
        this._super();

        var inA, outA;
        this._m_pInScene.setIsVisible(false);

        var inDeltaZ, inAngleZ;
        var outDeltaZ, outAngleZ;

        if( this._m_eOrientation == CC.kOrientationRightOver ){
            inDeltaZ = 90;
            inAngleZ = 270;
            outDeltaZ = 90;
            outAngleZ = 0;
        }else{
            inDeltaZ = -90;
            inAngleZ = 90;
            outDeltaZ = -90;
            outAngleZ = 0;
        }

        //TODO
        inA = CC.CCSequence.actions
            (
                CC.CCDelayTime.actionWithDuration(this._m_fDuration/2),
                CC.CCShow.action(),
                CC.CCOrbitCamera.actionWithDuration(this._m_fDuration/2, 1, 0, inAngleZ, inDeltaZ, -45, 0),
                CC.CCCallFunc.actionWithTarget(this, callfunc_selector(this.finish)),
                null
            );
        outA = CC.CCSequence.actions
            (
                CC.CCOrbitCamera.actionWithDuration(this._m_fDuration/2, 1, 0, outAngleZ, outDeltaZ, 45, 0),
                CC.CCHide.action(),
                CC.CCDelayTime.actionWithDuration(this._m_fDuration/2),
                null
            );

        this._m_pInScene.runAction(inA);
        this._m_pOutScene.runAction(outA);
    }
});
CC.CCTransitionFlipAngular.transitionWithDuration = function(t,scene,o){
    if(o == null)
        o = CC.kOrientationRightOver;

    var pScene = new CC.CCTransitionFlipAngular();
    pScene.initWithDuration(t, scene, o);

    return pScene;
};

/** @brief CCTransitionZoomFlipX:
 Flips the screen horizontally doing a zoom out/in
 The front face is the outgoing scene and the back face is the incoming scene.
 */
CC.CCTransitionZoomFlipX = CC.CCTransitionSceneOriented.extend({
    onEnter:function(){
        this._super();

        var inA, outA;
        this._m_pInScene.setIsVisible(false);

        var inDeltaZ, inAngleZ;
        var outDeltaZ, outAngleZ;

        if( this._m_eOrientation == CC.kOrientationRightOver ) {
            inDeltaZ = 90;
            inAngleZ = 270;
            outDeltaZ = 90;
            outAngleZ = 0;
        }else{
            inDeltaZ = -90;
            inAngleZ = 90;
            outDeltaZ = -90;
            outAngleZ = 0;
        }
        //TODO
        inA = CC.CCSequence.actions
            (
                CC.CCDelayTime.actionWithDuration(this._m_fDuration/2),
                CC.CCSpawn.actions
                    (
                        CC.CCOrbitCamera.actionWithDuration(this._m_fDuration/2, 1, 0, inAngleZ, inDeltaZ, 0, 0),
                        CC.CCScaleTo.actionWithDuration(this._m_fDuration/2, 1),
                        CC.CCShow.action(),
                        null
                    ),
                CC.CCCallFunc.actionWithTarget(this, callfunc_selector(this.finish)),
                null
            );
        outA = CC.CCSequence.actions
            (
                CC.CCSpawn.actions
                    (
                        CC.CCOrbitCamera.actionWithDuration(this._m_fDuration/2, 1, 0, outAngleZ, outDeltaZ, 0, 0),
                        CC.CCScaleTo.actionWithDuration(this._m_fDuration/2, 0.5),
                        null
                    ),
                CC.CCHide.action(),
                CC.CCDelayTime.actionWithDuration(this._m_fDuration/2),
                null
            );

        this._m_pInScene.setScale(0.5);
        this._m_pInScene.runAction(inA);
        this._m_pOutScene.runAction(outA);
    }
});
CC.CCTransitionZoomFlipX.transitionWithDuration = function(t,scene,o){
    if(o == null)
        o = CC.kOrientationRightOver;

    var pScene = new CC.CCTransitionZoomFlipX();
    pScene.initWithDuration(t, scene, o);

    return pScene;
};

/** @brief CCTransitionZoomFlipY:
 Flips the screen vertically doing a little zooming out/in
 The front face is the outgoing scene and the back face is the incoming scene.
 */
CC.CCTransitionZoomFlipY = CC.CCTransitionSceneOriented.extend({
    onEnter:function(){
        this._super();

        var inA, outA;
        this._m_pInScene.setIsVisible(false);

        var inDeltaZ, inAngleZ;
        var outDeltaZ, outAngleZ;

        if( this._m_eOrientation== CC.kOrientationUpOver ) {
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
        inA = CC.CCSequence.actions
            (
                CC.CCDelayTime.actionWithDuration(this._m_fDuration/2),
                CC.CCSpawn.actions
                    (
                        CC.CCOrbitCamera.actionWithDuration(this._m_fDuration/2, 1, 0, inAngleZ, inDeltaZ, 90, 0),
                        CC.CCScaleTo.actionWithDuration(this._m_fDuration/2, 1),
                        CC.CCShow.action(),
                        null
                    ),
                CC.CCCallFunc.actionWithTarget(this, callfunc_selector(this.finish)),
                null
            );

        outA = CC.CCSequence.actions
            (
                CC.CCSpawn.actions
                    (
                        CC.CCOrbitCamera.actionWithDuration(this._m_fDuration/2, 1, 0, outAngleZ, outDeltaZ, 90, 0),
                        CC.CCScaleTo.actionWithDuration(this._m_fDuration/2, 0.5),
                        null
                    ),
                CC.CCHide.action(),
                CC.CCDelayTime.actionWithDuration(this._m_fDuration/2),
                null
            );

        this._m_pInScene.setScale(0.5);
        this._m_pInScene.runAction(inA);
        this._m_pOutScene.runAction(outA);
    }
});
CC.CCTransitionZoomFlipY.transitionWithDuration = function(t,scene,o){
    if(o == null)
        o = CC.kOrientationUpOver;

    var pScene = new CC.CCTransitionZoomFlipY();
    pScene.initWithDuration(t, scene, o);

    return pScene;
};

/** @brief CCTransitionZoomFlipAngular:
 Flips the screen half horizontally and half vertically doing a little zooming out/in.
 The front face is the outgoing scene and the back face is the incoming scene.
 */
CC.CCTransitionZoomFlipAngular = CC.CCTransitionSceneOriented.extend({
    onEnter:function(){
        this._super();

        var inA, outA;
        this._m_pInScene.setIsVisible(false);

        var inDeltaZ, inAngleZ;
        var outDeltaZ, outAngleZ;

        if(this._m_eOrientation == CC.kOrientationRightOver ) {
            inDeltaZ = 90;
            inAngleZ = 270;
            outDeltaZ = 90;
            outAngleZ = 0;
        }else{
            inDeltaZ = -90;
            inAngleZ = 90;
            outDeltaZ = -90;
            outAngleZ = 0;
        }

        //TODO
        inA = CC.CCSequence.actions
            (
                CC.CCDelayTime.actionWithDuration(this._m_fDuration/2),
                CC.CCSpawn.actions
                    (
                        CC.CCOrbitCamera.actionWithDuration(this._m_fDuration/2, 1, 0, inAngleZ, inDeltaZ, -45, 0),
                        CC.CCScaleTo.actionWithDuration(this._m_fDuration/2, 1),
                        CC.CCShow.action(),
                        null
                    ),
                CC.CCShow.action(),
                CC.CCCallFunc.actionWithTarget(this, callfunc_selector(this.finish)),
                null
            );
        outA = CC.CCSequence.actions
            (
                CC.CCSpawn.actions
                    (
                        CC.CCOrbitCamera.actionWithDuration(this._m_fDuration/2, 1, 0 , outAngleZ, outDeltaZ, 45, 0),
                        CC.CCScaleTo.actionWithDuration(this._m_fDuration/2, 0.5),
                        null
                    ),
                CC.CCHide.action(),
                CC.CCDelayTime.actionWithDuration(this._m_fDuration/2),
                null
            );

        this._m_pInScene.setScale(0.5);
        this._m_pInScene.runAction(inA);
        this._m_pOutScene.runAction(outA);
    }
});
CC.CCTransitionZoomFlipAngular.transitionWithDuration = function(t,scene,o){
    if(o == null)
        o = CC.kOrientationRightOver;

    var pScene = new CC.CCTransitionZoomFlipAngular();
    pScene.initWithDuration(t, scene, o);

    return pScene;
};

/** @brief CCTransitionFade:
 Fade out the outgoing scene and then fade in the incoming scene.'''
 */
CC.CCTransitionFade = CC.CCTransitionScene.extend({
    _m_tColor:null,

    ctor:function(){},
    onEnter:function(){
        this._super();

        var l = CC.CCLayerColor.layerWithColor(this._m_tColor);
        this._m_pInScene.setIsVisible(false);

        this.addChild(l, 2, CC.kSceneFade);
        var f = getChildByTag(CC.kSceneFade);

        //TODO
        var a = CC.CCSequence.actions
            (
                CC.CCFadeIn.actionWithDuration(this._m_fDuration/2),
                CC.CCCallFunc.actionWithTarget(this, callfunc_selector(this.hideOutShowIn)),//CCCallFunc.actionWithTarget:self selector:@selector(hideOutShowIn)],
                CC.CCFadeOut.actionWithDuration(this._m_fDuration/2),
                CC.CCCallFunc.actionWithTarget(this, callfunc_selector(this.finish)), //:self selector:@selector(finish)],
                null
            );
        f.runAction(a);
    },
    onExit:function(){
        this._super();
        this.removeChildByTag(CC.kSceneFade, false);
    },
    /** initializes the transition with a duration and with an RGB color */
    initWithDuration:function(t,scene,color){
        if((color == 'undefined')||(color == null)){
            color = CC.ccBLACK;
        }

        if (this._super(t, scene)){
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
CC.CCTransitionFade.transitionWithDuration = function(t,scene,color){
    var pTransition = new CC.CCTransitionFade();
    pTransition.initWithDuration(t, scene, color);

    return pTransition;
};

/**
 @brief CCTransitionCrossFade:
 Cross fades two scenes using the CCRenderTexture object.
 */
CC.CCTransitionCrossFade = CC.CCTransitionScene.extend({
    onEnter:function(){
        this._super();

        // create a transparent color layer
        // in which we are going to add our rendertextures
        var color = new CC.ccColor4B(0,0,0,0);
        var size = CC.CCDirector.sharedDirector().getWinSize();
        var layer = CC.CCLayerColor.layerWithColor(color);

        // create the first render texture for inScene
        var inTexture = CC.CCRenderTexture.renderTextureWithWidthAndHeight(size.width, size.height);

        if (null == inTexture) {
            return;
        }

        inTexture.getSprite().setAnchorPoint(CC.ccp(0.5,0.5));
        inTexture.setPosition(CC.ccp(size.width/2, size.height/2));
        inTexture.setAnchorPoint(CC.ccp(0.5,0.5));

        // render inScene to its texturebuffer
        inTexture.begin();
        this._m_pInScene.visit();
        inTexture.end();

        // create the second render texture for outScene
        var outTexture = CCRenderTexture.renderTextureWithWidthAndHeight(size.width, size.height);
        outTexture.getSprite().setAnchorPoint( CC.ccp(0.5,0.5) );
        outTexture.setPosition( CC.ccp(size.width/2, size.height/2) );
        outTexture.setAnchorPoint( CC.ccp(0.5,0.5) );

        // render outScene to its texturebuffer
        outTexture.begin();
        this._m_pOutScene.visit();
        outTexture.end();

        // create blend functions

        var blend1 = new CC.ccBlendFunc(CC.GL_ONE,CC.GL_ONE); // inScene will lay on background and will not be used with alpha
        var blend2 = CC.ccBlendFunc(CC.GL_SRC_ALPHA, CC.GL_ONE_MINUS_SRC_ALPHA); // we are going to blend outScene via alpha

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
        var layerAction = CC.CCSequence.actions
            (
                CC.CCFadeTo.actionWithDuration(this._m_fDuration, 0),
                CC.CCCallFunc.actionWithTarget(this, callfunc_selector(this.hideOutShowIn)),
                CC.CCCallFunc.actionWithTarget(this, callfunc_selector(this.finish)),
                null
            );

        // run the blend action
        outTexture.getSprite().runAction( layerAction );

        // add the layer (which contains our two rendertextures) to the scene
        this.addChild(layer, 2, CC.kSceneFade);
    },
    onExit:function(){
        this.removeChildByTag(CC.kSceneFade, false);
        this._super();
    },
    draw:function(){
        // override draw since both scenes (textures) are rendered in 1 scene
    }
});
CC.CCTransitionCrossFade.transitionWithDuration = function(t,scene){
    var Transition = new CCTransitionCrossFade();
    Transition.initWithDuration(d, s);
    return Transition;
};

/** @brief CCTransitionTurnOffTiles:
 Turn off the tiles of the outgoing scene in random order
 */
CC.CCTransitionTurnOffTiles = CC.CCTransitionScene.extend({
    _sceneOrder:function(){this._m_bIsInSceneOnTop = false;},
    onEnter:function(){
        this._super();
        var s = CC.CCDirector.sharedDirector().getWinSize();
        var aspect = s.width / s.height;
        var x = (12 * aspect);
        var y = 12;

        var toff = CC.CCTurnOffTiles.actionWithSize( CC.ccg(x,y), this._m_fDuration);
        var action = this.easeActionWithAction(toff);
        //TODO
        this._m_pOutScene.runAction
            (
                CC.CCSequence.actions
                    (
                        action,
                        CCCallFunc.actionWithTarget(this, callfunc_selector(this.finish)),
                        CC.CCStopGrid.action(),
                        null
                    )
            );
    },
    easeActionWithAction:function(action){return action;}
});
CC.CCTransitionTurnOffTiles.transitionWithDuration = function(t,scene){
    var pScene = new CC.CCTransitionTurnOffTiles();
    if((pScene != null)&&(pScene.initWithDuration(t,scene))){
        return pScene;
    }
    return null;
};

/** @brief CCTransitionSplitCols:
 The odd columns goes upwards while the even columns goes downwards.
 */
CC.CCTransitionSplitCols = CC.CCTransitionScene.extend({
    onEnter:function(){
        this._super();
        this._m_pInScene.setIsVisible(false);

        var split = this.action();
        //TODO
        var seq = CC.CCSequence.actions
            (
                split,
                CC.CCCallFunc.actionWithTarget(this, callfunc_selector(this.hideOutShowIn)),
                split.reverse(),
                null
            );

        this.runAction
            (
                CC.CCSequence.actions
                    (
                        this.easeActionWithAction(seq),
                        CC.CCCallFunc.actionWithTarget(this, callfunc_selector(this.finish)),
                        CC.CCStopGrid.action(),
                        null
                    )
            );
    },
    easeActionWithAction:function(action){
        return CC.CCEaseInOut.actionWithAction(action, 3.0);
    },
    action:function(){
        return CC.CCSplitCols.actionWithCols(3, this._m_fDuration/2.0);
    }
});
CC.CCTransitionSplitCols.transitionWithDuration = function(t,scene){
    var pScene = new CC.CCTransitionSplitCols();
    if((pScene != null)&&(pScene.initWithDuration(t,scene))){
        return pScene;
    }
    return null;
};

/** @brief CCTransitionSplitRows:
 The odd rows goes to the left while the even rows goes to the right.
 */
CC.CCTransitionSplitRows = CC.CCTransitionSplitCols.extend({
    action:function(){return CC.CCSplitRows.actionWithRows(3, this._m_fDuration/2.0);}
});
CC.CCTransitionSplitRows.transitionWithDuration = function(t,scene){
    var pScene = new CC.CCTransitionSplitRows();
    if((pScene != null)&&(pScene.initWithDuration(t,scene))){
        return pScene;
    }
    return null;
};

/** @brief CCTransitionFadeTR:
 Fade the tiles of the outgoing scene from the left-bottom corner the to top-right corner.
 */
CC.CCTransitionFadeTR = CC.CCTransitionScene.extend({
    _sceneOrder:function(){this._m_bIsInSceneOnTop = false;},

    onEnter:function(){
        this._super();

        var s = CC.CCDirector.sharedDirector().getWinSize();
        var aspect = s.width / s.height;
        var x = (12 * aspect);
        var y = 12;

        var action  = this.actionWithSize(CC.ccg(x,y));

        this._m_pOutScene.runAction
            (
                CC.CCSequence.actions
                    (
                        this.easeActionWithAction(action),
                        CC.CCCallFunc.actionWithTarget(this, callfunc_selector(this.finish)),
                        CC.CCStopGrid.action(),
                        null
                    )
            );
    },
    easeActionWithAction:function(action){return action;},
    actionWithSize:function(size){return CC.CCFadeOutTRTiles.actionWithSize(size, this._m_fDuration);}
});
CC.CCTransitionFadeTR.transitionWithDuration = function(t,scene){
    var pScene = new CC.CCTransitionFadeTR();
    if((pScene != null)&&(pScene.initWithDuration(t,scene))){
        return pScene;
    }
    return null;
};

/** @brief CCTransitionFadeBL:
 Fade the tiles of the outgoing scene from the top-right corner to the bottom-left corner.
 */
CC.CCTransitionFadeBL = CC.CCTransitionFadeTR.extend({
    actionWithSize:function(size){return CC.CCFadeOutBLTiles.actionWithSize(size, this._m_fDuration);}
});
CC.CCTransitionFadeBL.transitionWithDuration = function(t,scene){
    var pScene = new CC.CCTransitionFadeBL();
    if((pScene != null)&&(pScene.initWithDuration(t,scene))){
        return pScene;
    }
    return null;
};

/** @brief CCTransitionFadeUp:
 * Fade the tiles of the outgoing scene from the bottom to the top.
 */
CC.CCTransitionFadeUp = CC.CCTransitionFadeTR.extend({
    actionWithSize:function(size){return CC.CCFadeOutUpTiles.actionWithSize(size, this._m_fDuration);}
});
CC.CCTransitionFadeUp.transitionWithDuration = function(t,scene){
    var pScene = new CC.CCTransitionFadeUp();
    if((pScene != null)&&(pScene.initWithDuration(t,scene))){
        return pScene;
    }
    return null;
};

/** @brief CCTransitionFadeDown:
 * Fade the tiles of the outgoing scene from the top to the bottom.
 */
CC.CCTransitionFadeDown = CC.CCTransitionFadeTR.extend({
    actionWithSize:function(size){return CC.CCFadeOutDownTiles.actionWithSize(size, this._m_fDuration);}
});
CC.CCTransitionFadeDown.transitionWithDuration = function(t,scene){
    var pScene = new CC.CCTransitionFadeDown();
    if((pScene != null)&&(pScene.initWithDuration(t,scene))){
        return pScene;
    }
    return null;
};




