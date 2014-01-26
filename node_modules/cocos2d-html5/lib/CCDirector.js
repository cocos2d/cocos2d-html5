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

cc.g_NumberOfDraws = 0;

//Possible OpenGL projections used by director
/**
 * sets a 2D projection (orthogonal projection)
 * @constant
 * @type Number
 */
cc.DIRECTOR_PROJECTION_2D = 0;

/**
 * sets a 3D projection with a fovy=60, znear=0.5f and zfar=1500.
 * @constant
 * @type Number
 */
cc.DIRECTOR_PROJECTION_3D = 1;

/**
 * it calls "updateProjection" on the projection delegate.
 * @constant
 * @type Number
 */
cc.DIRECTOR_PROJECTION_CUSTOM = 3;

/**
 * Default projection is 3D projection
 * @constant
 * @type Number
 */
cc.DIRECTOR_PROJECTION_DEFAULT = cc.DIRECTOR_PROJECTION_3D;

//----------------------------------------------------------------------------------------------------------------------
//Possible device orientations
/**
 * Device oriented vertically, home button on the bottom (UIDeviceOrientationPortrait)
 * @constant
 * @type Number
 */
cc.DEVICE_ORIENTATION_PORTRAIT = 0;

/**
 * Device oriented horizontally, home button on the right (UIDeviceOrientationLandscapeLeft)
 * @constant
 * @type Number
 */
cc.DEVICE_ORIENTATION_LANDSCAPE_LEFT = 1;

/**
 * Device oriented vertically, home button on the top (UIDeviceOrientationPortraitUpsideDown)
 * @constant
 * @type Number
 */
cc.DEVICE_ORIENTATION_PORTRAIT_UPSIDE_DOWN = 2;

/**
 * Device oriented horizontally, home button on the left (UIDeviceOrientationLandscapeRight)
 * @constant
 * @type Number
 */
cc.DEVICE_ORIENTATION_LANDSCAPE_RIGHT = 3;

/**
 * In browsers, we only support 2 orientations by change window size.
 * @constant
 * @type Number
 */
cc.DEVICE_MAX_ORIENTATIONS = 2;

/**
 * OpenGL projection protocol
 * @class
 * @extends cc.Class
 */
cc.DirectorDelegate = cc.Class.extend(/** @lends cc.DirectorDelegate# */{
    /**
     * Called by CCDirector when the projection is updated, and "custom" projection is used
     */
    updateProjection:function () {
    }
});

cc.GLToClipTransform = function (transformOut) {
    var projection = new cc.kmMat4();
    cc.kmGLGetMatrix(cc.KM_GL_PROJECTION, projection);

    var modelview = new cc.kmMat4();
    cc.kmGLGetMatrix(cc.KM_GL_MODELVIEW, modelview);

    cc.kmMat4Multiply(transformOut, projection, modelview);
};
//----------------------------------------------------------------------------------------------------------------------

/**
 * <p>
 *    Class that creates and handle the main Window and manages how<br/>
 *    and when to execute the Scenes.<br/>
 *    <br/>
 *    The cc.Director is also responsible for:<br/>
 *      - initializing the OpenGL context<br/>
 *      - setting the OpenGL pixel format (default on is RGB565)<br/>
 *      - setting the OpenGL pixel format (default on is RGB565)<br/>
 *      - setting the OpenGL buffer depth (default one is 0-bit)<br/>
 *      - setting the projection (default one is 3D)<br/>
 *      - setting the orientation (default one is Protrait)<br/>
 *      <br/>
 *    Since the cc.Director is a singleton, the standard way to use it is by calling:<br/>
 *      - cc.Director.getInstance().methodName(); <br/>
 *    <br/>
 *    The CCDirector also sets the default OpenGL context:<br/>
 *      - GL_TEXTURE_2D is enabled<br/>
 *      - GL_VERTEX_ARRAY is enabled<br/>
 *      - GL_COLOR_ARRAY is enabled<br/>
 *      - GL_TEXTURE_COORD_ARRAY is enabled<br/>
 * </p>
 * @class
 * @extends cc.Class
 */
cc.Director = cc.Class.extend(/** @lends cc.Director# */{
    //Variables
    _landscape:false,
    _nextDeltaTimeZero:false,
    _paused:false,
    _purgeDirecotorInNextLoop:false,
    _sendCleanupToScene:false,
    _animationInterval:0.0,
    _oldAnimationInterval:0.0,
    _projection:0,
    _accumDt:0.0,
    _contentScaleFactor:1.0,

    _displayStats:false,
    _deltaTime:0.0,
    _frameRate:0.0,

    _FPSLabel:null,
    _SPFLabel:null,
    _drawsLabel:null,

    _winSizeInPoints:null,

    _lastUpdate:null,
    _nextScene:null,
    _notificationNode:null,
    _openGLView:null,
    _scenesStack:null,
    _projectionDelegate:null,
    _runningScene:null,

    _frames:0,
    _totalFrames:0,
    _secondsPerFrame:0,

    _dirtyRegion:null,

    _scheduler:null,
    _actionManager:null,
    _touchDispatcher:null,
    _keyboardDispatcher:null,
    _accelerometer:null,
    _mouseDispatcher:null,

    _isBlur:false,

    /**
     * Constructor
     */
    ctor:function () {
        this._lastUpdate = Date.now();
        if (!cc.isAddedHiddenEvent) {
            var selfPointer = this;
            window.addEventListener("focus", function () {
                selfPointer._lastUpdate = Date.now();
            }, false);
        }
    },

    _resetLastUpdate:function () {
        this._lastUpdate = Date.now();
    },

    /**
     * initializes cc.Director
     * @return {Boolean}
     */
    init:function () {
        // scenes
        this._oldAnimationInterval = this._animationInterval = 1.0 / cc.defaultFPS;
        this._scenesStack = [];
        // Set default projection (3D)
        this._projection = cc.DIRECTOR_PROJECTION_DEFAULT;
        // projection delegate if "Custom" projection is used
        this._projectionDelegate = null;

        //FPS
        this._accumDt = 0;
        this._frameRate = 0;
        this._displayStats = false;//can remove
        this._totalFrames = this._frames = 0;
        this._lastUpdate = Date.now();

        //Paused?
        this._paused = false;

        //purge?
        this._purgeDirecotorInNextLoop = false;

        this._winSizeInPoints = cc._sizeConst(0, 0);

        this._openGLView = null;
        this._contentScaleFactor = 1.0;

        //scheduler
        this._scheduler = new cc.Scheduler();
        //action manager
        this._actionManager = new cc.ActionManager();
        this._scheduler.scheduleUpdateForTarget(this._actionManager, cc.PRIORITY_SYSTEM, false);
        //touchDispatcher
        if(cc.TouchDispatcher){
            this._touchDispatcher = new cc.TouchDispatcher();
            this._touchDispatcher.init();
        }

        //KeyboardDispatcher
        if(cc.KeyboardDispatcher)
            this._keyboardDispatcher = cc.KeyboardDispatcher.getInstance();

        //accelerometer
        if(cc.Accelerometer)
            this._accelerometer = new cc.Accelerometer();

        //MouseDispatcher
        if(cc.MouseDispatcher){
            this._mouseDispatcher = new cc.MouseDispatcher();
            this._mouseDispatcher.init();
        }

        return true;
    },

    /**
     * calculates delta time since last time it was called
     */
    calculateDeltaTime:function () {
        var now = Date.now();

        // new delta time.
        if (this._nextDeltaTimeZero) {
            this._deltaTime = 0;
            this._nextDeltaTimeZero = false;
        } else {
            this._deltaTime = (now - this._lastUpdate) / 1000;
        }

        if ((cc.COCOS2D_DEBUG > 0) && (this._deltaTime > 0.2))
            this._deltaTime = 1 / 60.0;

        this._lastUpdate = now;
    },

    /**
     * <p>
     *     converts a UIKit coordinate to an OpenGL coordinate<br/>
     *     Useful to convert (multi) touches coordinates to the current layout (portrait or landscape)
     * </p>
     * @param {cc.Point} uiPoint
     * @return {cc.Point}
     */
    convertToGL:function (uiPoint) {
        var transform = new cc.kmMat4();
        cc.GLToClipTransform(transform);

        var transformInv = new cc.kmMat4();
        cc.kmMat4Inverse(transformInv, transform);

        // Calculate z=0 using -> transform*[0, 0, 0, 1]/w
        var zClip = transform.mat[14] / transform.mat[15];

        var glSize = this._openGLView.getDesignResolutionSize();
        var clipCoord = new cc.kmVec3(2.0 * uiPoint.x / glSize.width - 1.0, 1.0 - 2.0 * uiPoint.y / glSize.height, zClip);

        var glCoord = new cc.kmVec3();
        cc.kmVec3TransformCoord(glCoord, clipCoord, transformInv);

        return cc.p(glCoord.x, glCoord.y);
    },

    /**
     * <p>converts an OpenGL coordinate to a UIKit coordinate<br/>
     * Useful to convert node points to window points for calls such as glScissor</p>
     * @param {cc.Point} glPoint
     * @return {cc.Point}
     */
    convertToUI:function (glPoint) {
        var transform = new cc.kmMat4();
        cc.GLToClipTransform(transform);

        var clipCoord = new cc.kmVec3();
        // Need to calculate the zero depth from the transform.
        var glCoord = new cc.kmVec3(glPoint.x, glPoint.y, 0.0);
        cc.kmVec3TransformCoord(clipCoord, glCoord, transform);

        var glSize = this._openGLView.getDesignResolutionSize();
        return cc.p(glSize.width * (clipCoord.x * 0.5 + 0.5), glSize.height * (-clipCoord.y * 0.5 + 0.5));
    },

    /**
     *  Draw the scene. This method is called every frame. Don't call it manually.
     */
    drawScene: function() {
        // calculate "global" dt
        this.calculateDeltaTime();

        //tick before glClear: issue #533
        if (!this._paused)
            this._scheduler.update(this._deltaTime);

        this._clear();

        /* to avoid flickr, nextScene MUST be here: after tick and before draw.
         XXX: Which bug is this one. It seems that it can't be reproduced with v0.9 */
        if (this._nextScene) {
            this.setNextScene();
        }

        if (this._beforeVisitScene) this._beforeVisitScene();

        // draw the scene
        if (this._runningScene)
            this._runningScene.visit();

        // draw the notifications node
        if (this._notificationNode)
            this._notificationNode.visit();

        if (this._displayStats)
            this._showStats();

        if (this._afterVisitScene) this._afterVisitScene();

        this._totalFrames++;

        if (this._displayStats)
            this._calculateMPF();
    },

    _clearCanvas: function() {
        var viewport = this._openGLView.getViewPortRect();
        cc.renderContext.clearRect(-viewport.x, viewport.y, viewport.width, -viewport.height);
    },

    _clearWebGL: function() {
        var gl = cc.renderContext;
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    },

    _beforeVisitScene: null,
    _afterVisitScene: null,

    _beforeVisitSceneWebGL: function() {
        cc.kmGLPushMatrix();
    },

    _afterVisitSceneWebGL: function() {
        cc.kmGLPopMatrix();
    },

    /**
     * end director
     */
    end:function () {
        this._purgeDirecotorInNextLoop = true;
    },

    /**
     * <p>get the size in pixels of the surface. It could be different than the screen size.<br/>
     *   High-res devices might have a higher surface size than the screen size.<br/>
     *   Only available when compiled using SDK >= 4.0.
     * </p>
     * @return {Number}
     */
    getContentScaleFactor:function () {
        return this._contentScaleFactor;
    },

    /**
     * <p>
     *    This object will be visited after the main scene is visited.<br/>
     *    This object MUST implement the "visit" selector.<br/>
     *    Useful to hook a notification object, like CCNotifications (http://github.com/manucorporat/CCNotifications)
     * </p>
     * @return {cc.Node}
     */
    getNotificationNode:function () {
        return this._notificationNode;
    },

    /**
     * <p>
     *     returns the size of the OpenGL view in points.<br/>
     *     It takes into account any possible rotation (device orientation) of the window
     * </p>
     * @return {cc.Size}
     */
    getWinSize:function () {
        return this._winSizeInPoints;
    },

    /**
     * <p>
     *   returns the size of the OpenGL view in pixels.<br/>
     *   It takes into account any possible rotation (device orientation) of the window.<br/>
     *   On Mac winSize and winSizeInPixels return the same value.
     * </p>
     * @return {cc.Size}
     */
    getWinSizeInPixels:function () {
        return cc.size(this._winSizeInPoints.width * this._contentScaleFactor, this._winSizeInPoints.height * this._contentScaleFactor);
    },

    getVisibleSize:function () {
        if (this._openGLView) {
            return this._openGLView.getVisibleSize();
        } else {
            return this.getWinSize();
        }
    },

    getVisibleOrigin:function () {
        if (this._openGLView) {
            return this._openGLView.getVisibleOrigin();
        } else {
            return cc.POINT_ZERO;
        }
    },

    getZEye:function () {
        return (this._winSizeInPoints.height / 1.1566 );
    },

    /**
     * pause director
     */
    pause:function () {
        if (this._paused)
            return;

        this._oldAnimationInterval = this._animationInterval;
        // when paused, don't consume CPU
        this.setAnimationInterval(1 / 4.0);
        this._paused = true;
    },

    /**
     * <p>
     *     Pops out a scene from the queue.<br/>
     *     This scene will replace the running one.<br/>
     *     The running scene will be deleted. If there are no more scenes in the stack the execution is terminated.<br/>
     *     ONLY call it if there is a running scene.
     * </p>
     */
    popScene:function () {
        if(!this._runningScene)
            throw "running scene should not null";

        //this.addRegionToDirtyRegion(cc.rect(0, 0, cc.canvas.width, cc.canvas.height));

        this._scenesStack.pop();
        var c = this._scenesStack.length;

        if (c == 0)
            this.end();
        else {
            this._sendCleanupToScene = true;
            this._nextScene = this._scenesStack[c - 1];
        }
    },

    /**
     * Removes cached all cocos2d cached data. It will purge the CCTextureCache, CCSpriteFrameCache, CCLabelBMFont cache
     */
    purgeCachedData:function () {
        cc.LabelBMFont.purgeCachedData();
        //cc.TextureCache.getInstance().removeUnusedTextures();
    },

    /**
     * purge Director
     */
    purgeDirector:function () {
        //cleanup scheduler
        this.getScheduler().unscheduleAllCallbacks();

        // don't release the event handlers
        // They are needed in case the director is run again
        if(this._touchDispatcher)this._touchDispatcher.removeAllDelegates();

        if (this._runningScene) {
            this._runningScene.onExitTransitionDidStart();
            this._runningScene.onExit();
            this._runningScene.cleanup();
        }

        this._runningScene = null;
        this._nextScene = null;

        // remove all objects, but don't release it.
        // runWithScene might be executed after 'end'.
        this._scenesStack.length = 0;

        this.stopAnimation();

        // purge bitmap cache
        cc.LabelBMFont.purgeCachedData();

        // purge all managers
        cc.AnimationCache.purgeSharedAnimationCache();
        cc.SpriteFrameCache.purgeSharedSpriteFrameCache();
        cc.TextureCache.purgeSharedTextureCache();

        //CCShaderCache::purgeSharedShaderCache();
        //CCFileUtils::purgeFileUtils();
        //CCConfiguration::purgeConfiguration();
        //extension::CCNotificationCenter::purgeNotificationCenter();
        //extension::CCTextureWatcher::purgeTextureWatcher();
        //extension::CCNodeLoaderLibrary::purgeSharedCCNodeLoaderLibrary();
        //cc.UserDefault.purgeSharedUserDefault();
        //ccGLInvalidateStateCache();

        cc.CHECK_GL_ERROR_DEBUG();

        // OpenGL view
        //this._openGLView.end();
        //this._openGLView = null;
    },

    /**
     * <p>
     *    Suspends the execution of the running scene, pushing it on the stack of suspended scenes.<br/>
     *    The new scene will be executed.<br/>
     *    Try to avoid big stacks of pushed scenes to reduce memory allocation.<br/>
     *    ONLY call it if there is a running scene.
     * </p>
     * @param {cc.Scene} scene
     */
    pushScene:function (scene) {
        if(!scene)
            throw "the scene should not null";

        this._sendCleanupToScene = false;

        this._scenesStack.push(scene);
        this._nextScene = scene;
    },

    /**
     * Replaces the running scene with a new one. The running scene is terminated. ONLY call it if there is a running scene.
     * @param {cc.Scene} scene
     */
    replaceScene:function (scene) {
        if(!this._runningScene)
            throw "Use runWithScene: instead to start the director";
        if(!scene)
            throw "the scene should not be null";

        var i = this._scenesStack.length;
        if(i === 0){
            this._sendCleanupToScene = true;
            this._scenesStack[i] = scene;
            this._nextScene = scene;
        } else {
            this._sendCleanupToScene = true;
            this._scenesStack[i - 1] = scene;
            this._nextScene = scene;
        }
    },

    /**
     * resume director
     */
    resume:function () {
        if (!this._paused) {
            return;
        }

        this.setAnimationInterval(this._oldAnimationInterval);
        this._lastUpdate = Date.now();
        if (!this._lastUpdate) {
            cc.log("cocos2d: Director: Error in gettimeofday");
        }

        this._paused = false;
        this._deltaTime = 0;
    },

    /**
     * <p>
     *    Enters the Director's main loop with the given Scene.<br/>
     *    Call it to run only your FIRST scene.<br/>
     *    Don't call it if there is already a running scene.
     * </p>
     * @param {cc.Scene} scene
     */
    runWithScene:function (scene) {
        if(!scene)
            throw "This command can only be used to start the CCDirector. There is already a scene present.";
        if(this._runningScene)
            throw "_runningScene should be null";

        this.pushScene(scene);
        this.startAnimation();
    },

    /**
     * enables/disables OpenGL alpha blending
     * @param {Boolean} on
     */
    setAlphaBlending:function (on) {
        if (on)
            cc.glBlendFunc(cc.BLEND_SRC, cc.BLEND_DST);
        else
            cc.glBlendFunc(cc.renderContext.ONE, cc.renderContext.ZERO);
        //cc.CHECK_GL_ERROR_DEBUG();
    },

    /**
     * <p>
     *   The size in pixels of the surface. It could be different than the screen size.<br/>
     *   High-res devices might have a higher surface size than the screen size.<br/>
     *   Only available when compiled using SDK >= 4.0.
     * </p>
     * @param {Number} scaleFactor
     */
    setContentScaleFactor:function (scaleFactor) {
        if (scaleFactor != this._contentScaleFactor) {
            this._contentScaleFactor = scaleFactor;
            this._createStatsLabel();
        }
    },

    /**
     * enables/disables OpenGL depth test
     * @param {Boolean} on
     */
    setDepthTest:function (on) {
        if(cc.renderContextType === cc.CANVAS)
            return;

        var loc_gl= cc.renderContext;
        if (on) {
            loc_gl.clearDepth(1.0);
            loc_gl.enable(loc_gl.DEPTH_TEST);
            loc_gl.depthFunc(loc_gl.LEQUAL);
            //cc.renderContext.hint(cc.renderContext.PERSPECTIVE_CORRECTION_HINT, cc.renderContext.NICEST);
        } else {
            loc_gl.disable(loc_gl.DEPTH_TEST);
        }
        //cc.CHECK_GL_ERROR_DEBUG();
    },

    /**
     * sets the default values based on the CCConfiguration info
     */
    setDefaultValues:function(){

    },

    /**
     * sets the OpenGL default values
     */
    setGLDefaultValues:function () {
        this.setAlphaBlending(true);
        // XXX: Fix me, should enable/disable depth test according the depth format as cocos2d-iphone did
        // [self setDepthTest: view_.depthFormat];
        this.setDepthTest(false);
        this.setProjection(this._projection);

        // set other opengl default values
        cc.renderContext.clearColor(0.0, 0.0, 0.0, 1.0);
    },

    /**
     * set next delta time is zero
     * @param {Boolean} nextDeltaTimeZero
     */
    setNextDeltaTimeZero:function (nextDeltaTimeZero) {
        this._nextDeltaTimeZero = nextDeltaTimeZero;
    },

    /**
     * set next scene
     */
    setNextScene:function () {
        var runningIsTransition = false, newIsTransition = false;
        if(cc.TransitionScene){
            runningIsTransition = this._runningScene ? this._runningScene instanceof cc.TransitionScene : false;
            newIsTransition = this._nextScene ? this._nextScene instanceof cc.TransitionScene : false;
        }

        // If it is not a transition, call onExit/cleanup
        if (!newIsTransition) {
            var locRunningScene = this._runningScene;
            if (locRunningScene) {
                locRunningScene.onExitTransitionDidStart();
                locRunningScene.onExit();
            }

            // issue #709. the root node (scene) should receive the cleanup message too
            // otherwise it might be leaked.
            if (this._sendCleanupToScene && locRunningScene)
                locRunningScene.cleanup();
        }

        this._runningScene = this._nextScene;

        this._nextScene = null;
        if ((!runningIsTransition) && (this._runningScene != null)) {
            this._runningScene.onEnter();
            this._runningScene.onEnterTransitionDidFinish();
        }
    },

    /**
     * set Notification Node
     * @param {cc.Node} node
     */
    setNotificationNode:function (node) {
        this._notificationNode = node;
    },

    /**
     *  CCDirector delegate. It shall implemente the CCDirectorDelegate protocol
     *  @return {cc.DirectorDelegate}
     */
    getDelegate:function () {
        return this._projectionDelegate;
    },

    setDelegate:function (delegate) {
        this._projectionDelegate = delegate;
    },

    /**
     * Set the CCEGLView, where everything is rendered
     * @param {*} openGLView
     */
    setOpenGLView:function (openGLView) {
        // set size
        this._winSizeInPoints.setWidth(cc.canvas.width);      //this._openGLView.getDesignResolutionSize();
        this._winSizeInPoints.setHeight(cc.canvas.height);
        this._openGLView = openGLView || cc.EGLView.getInstance();

        if (cc.renderContextType === cc.CANVAS)
            return;

        // Configuration. Gather GPU info
        var conf = cc.Configuration.getInstance();
        conf.gatherGPUInfo();
        conf.dumpInfo();

        // set size
        //this._winSizeInPoints = this._openGLView.getDesignResolutionSize();
        //this._winSizeInPixels = cc.size(this._winSizeInPoints.width * this._contentScaleFactor, this._winSizeInPoints.height * this._contentScaleFactor);

        //if (this._openGLView != openGLView) {
        // because EAGLView is not kind of CCObject

        this._createStatsLabel();

        //if (this._openGLView)
        this.setGLDefaultValues();

        /* if (this._contentScaleFactor != 1) {
         this.updateContentScaleFactor();
         }*/

        if(this._touchDispatcher)this._touchDispatcher.setDispatchEvents(true);
        //}
    },

    /**
     * Sets the glViewport
     */
    setViewport:function(){
        if(this._openGLView) {
            var locWinSizeInPoints = this._winSizeInPoints;
            this._openGLView.setViewPortInPoints(0,0, locWinSizeInPoints.width, locWinSizeInPoints.height);
        }
    },

    /**
     * Sets an OpenGL projection
     * @param {Number} projection
     */
    setProjection:function (projection) {
        var size = this._winSizeInPoints;

        if(cc.renderContextType === cc.WEBGL){
            this.setViewport();

            switch (projection) {
                case cc.DIRECTOR_PROJECTION_2D:
                    cc.kmGLMatrixMode(cc.KM_GL_PROJECTION);
                    cc.kmGLLoadIdentity();
                    var orthoMatrix = new cc.kmMat4();
                    cc.kmMat4OrthographicProjection(orthoMatrix, 0, size.width, 0, size.height, -1024, 1024);
                    cc.kmGLMultMatrix(orthoMatrix);
                    cc.kmGLMatrixMode(cc.KM_GL_MODELVIEW);
                    cc.kmGLLoadIdentity();
                    break;
                case cc.DIRECTOR_PROJECTION_3D:
                    var zeye = this.getZEye();
                    var matrixPerspective = new cc.kmMat4(), matrixLookup = new cc.kmMat4();
                    cc.kmGLMatrixMode(cc.KM_GL_PROJECTION);
                    cc.kmGLLoadIdentity();

                    // issue #1334
                    cc.kmMat4PerspectiveProjection(matrixPerspective, 60, size.width / size.height, 0.1, zeye * 2);
                    // kmMat4PerspectiveProjection( &matrixPerspective, 60, (GLfloat)size.width/size.height, 0.1f, 1500);

                    cc.kmGLMultMatrix(matrixPerspective);

                    cc.kmGLMatrixMode(cc.KM_GL_MODELVIEW);
                    cc.kmGLLoadIdentity();
                    var eye = cc.kmVec3Fill(null, size.width / 2, size.height / 2, zeye);
                    var center = cc.kmVec3Fill(null, size.width / 2, size.height / 2, 0.0);
                    var up = cc.kmVec3Fill(null, 0.0, 1.0, 0.0);
                    cc.kmMat4LookAt(matrixLookup, eye, center, up);
                    cc.kmGLMultMatrix(matrixLookup);
                    break;
                case cc.DIRECTOR_PROJECTION_CUSTOM:
                    if (this._projectionDelegate)
                        this._projectionDelegate.updateProjection();
                    break;
                default:
                    cc.log("cocos2d: Director: unrecognized projection");
                    break;
            }
            this._projection = projection;
            cc.setProjectionMatrixDirty();
            return;
        }
        this._projection = projection;
    },

    /**
     * shows the FPS in the screen
     */
    _showStats: function () {
        this._frames++;
        this._accumDt += this._deltaTime;
        if (this._FPSLabel && this._SPFLabel && this._drawsLabel) {
            if (this._accumDt > cc.DIRECTOR_FPS_INTERVAL) {
                this._SPFLabel.setString(this._secondsPerFrame.toFixed(3));

                this._frameRate = this._frames / this._accumDt;
                this._frames = 0;
                this._accumDt = 0;

                this._FPSLabel.setString(this._frameRate.toFixed(1));
                this._drawsLabel.setString((0 | cc.g_NumberOfDraws).toString());
            }
            this._FPSLabel.visit();
            this._SPFLabel.visit();
            this._drawsLabel.visit();
        } else
            this._createStatsLabel();
        cc.g_NumberOfDraws = 0;
    },

    /**
     * <p>
     *    Whether or not the replaced scene will receive the cleanup message.<br>
     *    If the new scene is pushed, then the old scene won't receive the "cleanup" message.<br/>
     *    If the new scene replaces the old one, the it will receive the "cleanup" message.
     * </p>
     * @return {Boolean}
     */
    isSendCleanupToScene:function () {
        return this._sendCleanupToScene;
    },

    /**
     * Get current running Scene. Director can only run one Scene at the time
     * @return {cc.Scene}
     */
    getRunningScene:function () {
        return this._runningScene;
    },

    /**
     * Get the FPS value
     * @return {Number}
     */
    getAnimationInterval:function () {
        return this._animationInterval;
    },

    /**
     * Whether or not to display the FPS on the bottom-left corner
     * @return {Boolean}
     */
    isDisplayStats:function () {
        return this._displayStats;
    },

    /**
     * Display the FPS on the bottom-left corner
     * @param {Boolean} displayStats
     */
    setDisplayStats:function (displayStats) {
        this._displayStats = displayStats;
    },

    /**
     * seconds per frame
     * @return {Number}
     */
    getSecondsPerFrame:function () {
        return this._secondsPerFrame;
    },

    /**
     *  Get the CCEGLView, where everything is rendered
     * @return {*}
     */
    getOpenGLView:function () {
        return this._openGLView;
    },

    /**
     * is next delta time zero
     * @return {Boolean}
     */
    isNextDeltaTimeZero:function () {
        return this._nextDeltaTimeZero;
    },

    /**
     * Whether or not the Director is paused
     * @return {Boolean}
     */
    isPaused:function () {
        return this._paused;
    },

    /**
     * How many frames were called since the director started
     * @return {Number}
     */
    getTotalFrames:function () {
        return this._totalFrames;
    },

    /**
     * Sets an OpenGL projection
     * @return {Number}
     */
    getProjection:function () {
        return this._projection;
    },

    /**
     * <p>
     *     Pops out all scenes from the queue until the root scene in the queue. <br/>
     *     This scene will replace the running one.  <br/>
     *     Internally it will call `popToSceneStackLevel(1)`
     * </p>
     */
    popToRootScene:function () {
        this.popToSceneStackLevel(1);
    },

    /**
     * <p>
     *     Pops out all scenes from the queue until it reaches `level`.                             <br/>
     *     If level is 0, it will end the director.                                                 <br/>
     *     If level is 1, it will pop all scenes until it reaches to root scene.                    <br/>
     *     If level is <= than the current stack level, it won't do anything.
     * </p>
     * @param {Number} level
     */
    popToSceneStackLevel: function (level) {
        if(!this._runningScene)
            throw "A running Scene is needed";

        var locScenesStack = this._scenesStack;
        var c = locScenesStack.length;

        if (c == 0) {
            this.end();
            return;
        }
        // current level or lower -> nothing
        if (level > c)
            return;

        // pop stack until reaching desired level
        while (c > level) {
            var current = locScenesStack.pop();
            if (current.isRunning()) {
                current.onExitTransitionDidStart();
                current.onExit();
            }
            current.cleanup();
            c--;
        }
        this._nextScene = locScenesStack[locScenesStack.length - 1];
        this._sendCleanupToScene = false;
    },

    /**
     * (cc.Scheduler associated with this director)
     */
    getScheduler:function () {
        return this._scheduler;
    },

    setScheduler:function (scheduler) {
        if (this._scheduler != scheduler) {
            this._scheduler = scheduler;
        }
    },

    getActionManager:function () {
        return this._actionManager;
    },
    setActionManager:function (actionManager) {
        if (this._actionManager != actionManager) {
            this._actionManager = actionManager;
        }
    },

    getTouchDispatcher:function () {
        return this._touchDispatcher;
    },
    setTouchDispatcher:function (touchDispatcher) {
        if (this._touchDispatcher != touchDispatcher) {
            this._touchDispatcher = touchDispatcher;
        }
    },

    getKeyboardDispatcher:function () {
        if(!cc.KeyboardDispatcher)
            throw "cc.KeyboardDispatcher is undefined, maybe it has been removed from js loading list.";
        return this._keyboardDispatcher;
    },
    setKeyboardDispatcher:function (keyboardDispatcher) {
        if(!cc.KeyboardDispatcher)
            throw "cc.KeyboardDispatcher is undefined, maybe it has been removed from js loading list.";
        this._keyboardDispatcher = keyboardDispatcher;
    },

    getAccelerometer:function () {
        if(!cc.Accelerometer)
            throw "cc.Accelerometer is undefined, maybe it has been removed from js loading list.";
        return this._accelerometer;
    },
    setAccelerometer:function (accelerometer) {
        if(!cc.Accelerometer)
            throw "cc.Accelerometer is undefined, maybe it has been removed from js loading list.";
        if (this._accelerometer != accelerometer)
            this._accelerometer = accelerometer;
    },

    getDeltaTime:function(){
        return this._deltaTime;
    },

    getMouseDispatcher:function () {
        if(!cc.MouseDispatcher)
            throw "cc.MouseDispatcher is undefined, maybe it has been removed from js loading list.";
        return this._mouseDispatcher;
    },

    setMouseDispatcher:function (mouseDispatcher) {
        if(!cc.MouseDispatcher)
            throw "cc.MouseDispatcher is undefined, maybe it has been removed from js loading list.";
        if (this._mouseDispatcher != mouseDispatcher)
            this._mouseDispatcher = mouseDispatcher;
    },

    _createStatsLabel: null,

    _createStatsLabelForWebGL:function(){
        if(!cc.LabelAtlas)
            return this._createStatsLabelForCanvas();

        if((cc.Director._fpsImageLoaded == null) || (cc.Director._fpsImageLoaded == false))
            return;

        var texture = new cc.Texture2D();
        texture.initWithElement(cc.Director._fpsImage);
        texture.handleLoadedTexture();

        /*
         We want to use an image which is stored in the file named ccFPSImage.c
         for any design resolutions and all resource resolutions.

         To achieve this,

         Firstly, we need to ignore 'contentScaleFactor' in 'CCAtlasNode' and 'CCLabelAtlas'.
         So I added a new method called 'setIgnoreContentScaleFactor' for 'CCAtlasNode',
         this is not exposed to game developers, it's only used for displaying FPS now.

         Secondly, the size of this image is 480*320, to display the FPS label with correct size,
         a factor of design resolution ratio of 480x320 is also needed.
         */
        var factor = cc.EGLView.getInstance().getDesignResolutionSize().height / 320.0;
        if(factor === 0)
            factor = this._winSizeInPoints.height / 320.0;

        var tmpLabel = new cc.LabelAtlas();
        tmpLabel._setIgnoreContentScaleFactor(true);
        tmpLabel.initWithString("00.0", texture, 12, 32 , '.');
        tmpLabel.setScale(factor);
        this._FPSLabel = tmpLabel;

        tmpLabel = new cc.LabelAtlas();
        tmpLabel._setIgnoreContentScaleFactor(true);
        tmpLabel.initWithString("0.000", texture, 12, 32, '.');
        tmpLabel.setScale(factor);
        this._SPFLabel = tmpLabel;

        tmpLabel = new cc.LabelAtlas();
        tmpLabel._setIgnoreContentScaleFactor(true);
        tmpLabel.initWithString("000", texture, 12, 32, '.');
        tmpLabel.setScale(factor);
        this._drawsLabel = tmpLabel;

        var locStatsPosition = cc.DIRECTOR_STATS_POSITION;
        this._drawsLabel.setPosition(cc.pAdd(cc.p(0, 34 * factor), locStatsPosition));
        this._SPFLabel.setPosition(cc.pAdd(cc.p(0, 17 * factor), locStatsPosition));
        this._FPSLabel.setPosition(locStatsPosition);
    },

    _createStatsLabelForCanvas:function(){
        var fontSize = 0;
        if (this._winSizeInPoints.width > this._winSizeInPoints.height)
            fontSize = 0 | (this._winSizeInPoints.height / 320 * 24);
        else
            fontSize = 0 | (this._winSizeInPoints.width / 320 * 24);

        this._FPSLabel = cc.LabelTTF.create("000.0", "Arial", fontSize);
        this._SPFLabel = cc.LabelTTF.create("0.000", "Arial", fontSize);
        this._drawsLabel = cc.LabelTTF.create("0000", "Arial", fontSize);

        var locStatsPosition = cc.DIRECTOR_STATS_POSITION;
        var contentSize = this._drawsLabel.getContentSize();
        this._drawsLabel.setPosition(cc.pAdd(cc.p(contentSize.width / 2, contentSize.height * 5 / 2), locStatsPosition));
        contentSize = this._SPFLabel.getContentSize();
        this._SPFLabel.setPosition(cc.pAdd(cc.p(contentSize.width / 2, contentSize.height * 3 / 2), locStatsPosition));
        contentSize = this._FPSLabel.getContentSize();
        this._FPSLabel.setPosition(cc.pAdd(cc.p(contentSize.width / 2, contentSize.height / 2), locStatsPosition));
    },

    _calculateMPF: function () {
        var now = Date.now();
        this._secondsPerFrame = (now - this._lastUpdate) / 1000;
    }
});

if (cc.Browser.supportWebGL) {
    cc.Director.prototype._clear = cc.Director.prototype._clearWebGL;
    cc.Director.prototype._beforeVisitScene = cc.Director.prototype._beforeVisitSceneWebGL;
    cc.Director.prototype._afterVisitScene = cc.Director.prototype._afterVisitSceneWebGL;
    cc.Director.prototype._createStatsLabel = cc.Director.prototype._createStatsLabelForWebGL;
} else {
    cc.Director.prototype._clear = cc.Director.prototype._clearCanvas;
    cc.Director.prototype._createStatsLabel = cc.Director.prototype._createStatsLabelForCanvas;
}

/***************************************************
 * implementation of DisplayLinkDirector
 **************************************************/
// should we afford 4 types of director ??
// I think DisplayLinkDirector is enough
// so we now only support DisplayLinkDirector
/**
 * <p>
 *   DisplayLinkDirector is a Director that synchronizes timers with the refresh rate of the display.<br/>
 *   Features and Limitations:<br/>
 *      - Scheduled timers & drawing are synchronizes with the refresh rate of the display<br/>
 *      - Only supports animation intervals of 1/60 1/30 & 1/15<br/>
 * </p>
 * @class
 * @extends cc.Director
 */
cc.DisplayLinkDirector = cc.Director.extend(/** @lends cc.DisplayLinkDirector# */{
    invalid:false,

    /**
     * start Animation
     */
    startAnimation:function () {
        this._nextDeltaTimeZero = true;
        this.invalid = false;
        cc.Application.getInstance().setAnimationInterval(this._animationInterval);
    },

    /**
     * main loop of director
     */
    mainLoop:function () {
        if (this._purgeDirecotorInNextLoop) {
            this._purgeDirecotorInNextLoop = false;
            this.purgeDirector();
        }
        else if (!this.invalid) {
            this.drawScene();
        }
    },

    /**
     * stop animation
     */
    stopAnimation:function () {
        this.invalid = true;
    },

    /**
     * set Animation Interval
     * @param {Number} value
     */
    setAnimationInterval:function (value) {
        this._animationInterval = value;
        if (!this.invalid) {
            this.stopAnimation();
            this.startAnimation();
        }
    }
});

cc.s_SharedDirector = null;

cc.firstUseDirector = true;

/**
 * returns a shared instance of the director
 * @function
 * @return {cc.Director}
 */
cc.Director.getInstance = function () {
    if (cc.firstUseDirector) {
        cc.firstUseDirector = false;
        cc.s_SharedDirector = new cc.DisplayLinkDirector();
        cc.s_SharedDirector.init();
        cc.s_SharedDirector.setOpenGLView(cc.EGLView.getInstance());
    }
    return cc.s_SharedDirector;
};

Object.defineProperties(cc, {
    windowSize: {
        get: function () {
            return  cc.director.getWinSize();
        },
        enumerable: true
    }
});

/**
 * is director first run
 * @type Boolean
 */
cc.firstRun = true;

/**
 * set default fps to 60
 * @type Number
 */
cc.defaultFPS = 60;

/*
 window.onfocus = function () {
 if (!cc.firstRun) {
 cc.Director.getInstance().addRegionToDirtyRegion(cc.rect(0, 0, cc.canvas.width, cc.canvas.height));
 }
 };
 */
cc.Director._fpsImage = new Image();
cc.Director._fpsImage.addEventListener("load", function () {
    cc.Director._fpsImageLoaded = true;
});
cc.Director._fpsImage.src = "data:image/png;base64,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";


