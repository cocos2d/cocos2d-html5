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
 * Detault projection is 3D projection
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
    _isContentScaleSupported:false,
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

    _winSizeInPixels:null,
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

    _watcherFun:null,
    _watcherSender:null,

    _isBlur:false,

    /**
     * Constructor
     */
    ctor:function () {
        this._lastUpdate = Date.now();
        if(!cc.isAddedHiddenEvent){
            var selfPointer = this;
            window.addEventListener("focus",function(){
                selfPointer._lastUpdate = Date.now();
            }, false);
        }
    },

    _resetLastUpdate:function(){
        this._lastUpdate = Date.now();
    },

    /**
     * initializes cc.Director
     * @return {Boolean}
     */
    init:function () {
        // scenes
        //TODO these are already set to null, so maybe we can remove them in the init?
        this._runningScene = null;
        this._nextScene = null;
        this._notificationNode = null;

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
        this._winSizeInPixels = this._winSizeInPoints = cc.size(cc.canvas.width, cc.canvas.height);

        this._openGLView = null;
        this._contentScaleFactor = 1.0;
        this._isContentScaleSupported = false;

        this._watcherFun = null;
        this._watcherSender = null;

        //scheduler
        this._scheduler = new cc.Scheduler();
        //action manager
        this._actionManager = new cc.ActionManager();
        this._scheduler.scheduleUpdateForTarget(this._actionManager, cc.PRIORITY_SYSTEM, false);
        //touchDispatcher
        this._touchDispatcher = new cc.TouchDispatcher();
        this._touchDispatcher.init();

        //KeyboardDispatcher
        this._keyboardDispatcher = cc.KeyboardDispatcher.getInstance();

        //accelerometer
        this._accelerometer = new cc.Accelerometer();

        //MouseDispatcher
        this._mouseDispatcher = new cc.MouseDispatcher();
        this._mouseDispatcher.init();

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
            this._deltaTime = (now-this._lastUpdate) / 1000;
        }

        if (cc.DEBUG) {
            if (this._deltaTime > 0.2) {
                this._deltaTime = 1 / 60.0;
            }
        }
        this._lastUpdate = now;
    },

    /**
     * <p>
     *     converts a UIKit coordinate to an OpenGL coordinate<br/>
     *     Useful to convert (multi) touches coordinates to the current layout (portrait or landscape)
     * </p>
     * @param {cc.Point} point
     * @return {cc.Point}
     */
    convertToGL:function (point) {
        var newY = this._winSizeInPoints.height - point.y;
        return cc.p(point.x, newY);
    },

    /**
     * <p>converts an OpenGL coordinate to a UIKit coordinate<br/>
     * Useful to convert node points to window points for calls such as glScissor</p>
     * @param {cc.Point} point
     * @return {cc.Point}
     */
    convertToUI:function (point) {
        var oppositeY = this._winSizeInPoints.height - point.y;
        return cc.p(point.x, oppositeY);
    },

    //_fullRect:null,
    /**
     *  Draw the scene. This method is called every frame. Don't call it manually.
     */
    drawScene:function () {
        // calculate "global" dt
        this.calculateDeltaTime();

        //tick before glClear: issue #533
        if (!this._paused) {
            this._scheduler.update(this._deltaTime);
        }
        //this._fullRect = cc.rect(0, 0, cc.canvas.width, cc.canvas.height);
        //cc.renderContext.clearRect(this._fullRect.origin.x, this._fullRect.origin.y, this._fullRect.size.width, -this._fullRect.size.height);
        cc.renderContext.clearRect(0, 0, cc.canvas.width, -cc.canvas.height);

        /*
         var isSaveContext = false;
         //glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

         if (this._dirtyRegion) {
         //cc.renderContext.clearRect(0, 0, cc.canvas.width, -cc.canvas.height);

         var fullRect = cc.rect(0, 0, cc.canvas.width, cc.canvas.height);
         this._dirtyRegion = cc.Rect.CCRectIntersection(this._dirtyRegion, fullRect);

         if(cc.Rect.CCRectEqualToRect(cc.RectZero(), this._dirtyRegion)){
         this._dirtyRegion = null;
         }else{
         cc.renderContext.clearRect(0 | this._dirtyRegion.origin.x, -(0 | this._dirtyRegion.origin.y),
         0 | this._dirtyRegion.size.width, -(0 | this._dirtyRegion.size.height));

         if(!cc.Rect.CCRectEqualToRect(fullRect, this._dirtyRegion)){
         isSaveContext = true;
         cc.renderContext.save();
         cc.renderContext.beginPath();
         cc.renderContext.rect(0 | this._dirtyRegion.origin.x - 1, -(0 | this._dirtyRegion.origin.y - 1),
         0 | this._dirtyRegion.size.width + 2, -(0 | this._dirtyRegion.size.height + 2));
         cc.renderContext.clip();
         cc.renderContext.closePath();
         }
         }
         }
         */

        /* to avoid flickr, nextScene MUST be here: after tick and before draw.
         XXX: Which bug is this one. It seems that it can't be reproduced with v0.9 */
        if (this._nextScene) {
            this.setNextScene();
        }

        //kmGLPushMatrix();

        // draw the scene
        if (this._runningScene) {
            //if (this._dirtyRegion) {
            this._runningScene.visit();
            //}
        }

        /*
         if (this._dirtyRegion) {
         this._dirtyRegion = null;
         if(isSaveContext){
         cc.renderContext.restore();
         }
         }
         */

        // draw the notifications node
        if (this._notificationNode) {
            this._notificationNode.visit();
        }

        if (this._displayStats) {
            this._showStats();
        }

        if (this._watcherFun && this._watcherSender) {
            this._watcherFun.call(this._watcherSender);
        }

        //TODO OpenGL
        //kmGLPopMatrix();

        this._totalFrames++;

        // swap buffers
        if (this._openGLView) {
            this._openGLView.swapBuffers();
        }

        if (this._displayStats) {
            this._calculateMPF();
        }
    },

    addRegionToDirtyRegion:function (rect) {
        if (!rect)
            return;

        if (!this._dirtyRegion) {
            this._dirtyRegion = cc.rect(rect.origin.x, rect.origin.y, rect.size.width, rect.size.height);
            return;
        }
        this._dirtyRegion = cc.Rect.CCRectUnion(this._dirtyRegion,
            cc.rect(rect.origin.x, rect.origin.y, rect.size.width, rect.size.height));
    },

    rectIsInDirtyRegion:function (rect) {
        if (!rect || !this._fullRect)
            return false;

        return cc.Rect.CCRectIntersectsRect(this._fullRect, rect);
    },

    /**
     * <p>
     *   Will enable Retina Display on devices that supports it. <br/>
     *   It will enable Retina Display on iPhone4 and iPod Touch 4.<br/>
     *   It will return YES, if it could enabled it, otherwise it will return NO.<br/>
     *   <br/>
     *   This is the recommened way to enable Retina Display.
     * </p>
     * @param {Boolean} enabled
     * @return {Boolean}
     */
    enableRetinaDisplay:function (enabled) {
        // Already enabled?
        if (enabled && this._contentScaleFactor == 2) {
            return true;
        }

        // Already diabled?
        if (!enabled && this._contentScaleFactor == 1) {
            return false;
        }

        // setContentScaleFactor is not supported
        if (!this._openGLView.canSetContentScaleFactor()) {
            return false;
        }

        // SD device
        if (this._openGLView.getMainScreenScale() == 1.0) {
            return false;
        }

        var newScale = (enabled) ? 2 : 1;
        this.setContentScaleFactor(newScale);

        this._createStatsLabel();
        return true;
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
        return this._winSizeInPixels;
    },

    getZEye:function () {
        return (this._winSizeInPixels.height / 1.1566 / cc.CONTENT_SCALE_FACTOR());
    },

    /**
     * pause director
     */
    pause:function () {
        if (this._paused) {
            return;
        }

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
        cc.Assert(this._runningScene != null, "running scene should not null");

        //this.addRegionToDirtyRegion(cc.rect(0, 0, cc.canvas.width, cc.canvas.height));

        this._scenesStack.pop();
        var c = this._scenesStack.length;

        if (c == 0) {
            this.end();
        }
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
        // don't release the event handlers
        // They are needed in case the director is run again
        this._touchDispatcher.removeAllDelegates();

        if (this._runningScene) {
            this._runningScene.onExit();
            this._runningScene.cleanup();
        }

        this._runningScene = null;
        this._nextScene = null;

        // remove all objects, but don't release it.
        // runWithScene might be executed after 'end'.
        this._scenesStack = [];

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

        //CHECK_GL_ERROR_DEBUG();

        // OpenGL view
        this._openGLView.end();
        this._openGLView = null;
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
        cc.Assert(scene, "the scene should not null");

        //this.addRegionToDirtyRegion(cc.rect(0, 0, cc.canvas.width, cc.canvas.height));

        this._sendCleanupToScene = false;

        this._scenesStack.push(scene);
        this._nextScene = scene;
    },

    /**
     * Replaces the running scene with a new one. The running scene is terminated. ONLY call it if there is a running scene.
     * @param {cc.Scene} scene
     */
    replaceScene:function (scene) {
        cc.Assert(scene != null, "the scene should not be null");

        //this.addRegionToDirtyRegion(cc.rect(0, 0, cc.canvas.width, cc.canvas.height));
        var i = this._scenesStack.length;

        this._sendCleanupToScene = true;
        this._scenesStack[i - 1] = scene;
        this._nextScene = scene;
    },

    /**
     * changes the projection size
     * @param {cc.Size} newWindowSize
     */
    reshapeProjection:function (newWindowSize) {
        if (this._openGLView) {
            this._winSizeInPoints = this._openGLView.getSize();
            this._winSizeInPixels = cc.size(this._winSizeInPoints.width * this._contentScaleFactor,
                this._winSizeInPoints.height * this._contentScaleFactor);

            this.setProjection(this._projection);
        }
    },

    /**
     * resume director
     */
    resume:function () {
        if (!this._paused) {
            return;
        }
        //this.addRegionToDirtyRegion(cc.rect(0, 0, cc.canvas.width, cc.canvas.height));

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
        cc.Assert(scene != null, "running scene should not be null");
        cc.Assert(this._runningScene == null, "_runningScene should be null");

        //this.addRegionToDirtyRegion(cc.rect(0, 0, cc.canvas.width, cc.canvas.height));

        this.pushScene(scene);
        this.startAnimation();
    },

    /**
     * enables/disables OpenGL alpha blending
     * @param {Boolean} on
     */
    setAlphaBlending:function (on) {
        if (on) {
            //TODO OpenGL
            //ccGLEnable(CC_GL_BLEND);
            //ccGLBlendFunc(CC_BLEND_SRC, CC_BLEND_DST);
        }
        else {
            //glDisable(GL_BLEND);
        }
        //CHECK_GL_ERROR_DEBUG();
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
            this._winSizeInPixels = cc.size(this._winSizeInPoints.width * scaleFactor, this._winSizeInPoints.height * scaleFactor);

            if (this._openGLView) {
                this.updateContentScaleFactor();
            }

            // update projection
            this.setProjection(this._projection);
        }
    },

    /**
     * enables/disables OpenGL depth test
     * @param {Boolean} on
     */
    setDepthTest:function (on) {
        if (on) {
            /*TODO OpenGL Stuff
             ccglClearDepth(1.0f);
             glEnable(GL_DEPTH_TEST);
             glDepthFunc(GL_LEQUAL);
             //        glHint(GL_PERSPECTIVE_CORRECTION_HINT, GL_NICEST);
             }
             else
             {
             glDisable(GL_DEPTH_TEST);*/
        }
        //CHECK_GL_ERROR_DEBUG();
    },

    /**
     * sets the OpenGL default values
     */
    setGLDefaultValues:function () {
        // This method SHOULD be called only after openGLView_ was initialized
        cc.Assert(this._openGLView, "opengl view should not be null");

        this.setAlphaBlending(true);
        this.setDepthTest(true);
        this.setProjection(this._projection);

        // set other opengl default values
        //TODO OpenGl
        //glClearColor(0.0f, 0.0f, 0.0f, 1.0f);
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
        var runningIsTransition = this._runningScene ? this._runningScene instanceof cc.TransitionScene : false;

        var newIsTransition = this._nextScene ? this._nextScene instanceof cc.TransitionScene : false;

        // If it is not a transition, call onExit/cleanup
        if (!newIsTransition) {
            if (this._runningScene) {
                this._runningScene.onExit();
            }

            // issue #709. the root node (scene) should receive the cleanup message too
            // otherwise it might be leaked.
            if (this._sendCleanupToScene && this._runningScene) {
                this._runningScene.cleanup();
            }
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
     * Set the CCEGLView, where everything is rendered
     * @param {*} openGLView
     */
    setOpenGLView:function (openGLView) {
        cc.Assert(openGLView, "opengl view should not be null");

        if (this._openGLView != openGLView) {
            // because EAGLView is not kind of CCObject
            delete this._openGLView; // [openGLView_ release]
            this._openGLView = openGLView;

            // set size
            this._winSizeInPoints = this._openGLView.getSize();
            this._winSizeInPixels = cc.size(this._winSizeInPoints.width * this._contentScaleFactor, this._winSizeInPoints.height * this._contentScaleFactor);

            this._createStatsLabel();

            if (this._openGLView) {
                this.setGLDefaultValues();
            }

            //CHECK_GL_ERROR_DEBUG();

            if (this._contentScaleFactor != 1) {
                this.updateContentScaleFactor();
            }

            this._openGLView.setTouchDelegate(this._touchDispatcher);
            this._touchDispatcher.setDispatchEvents(true);
        }
    },

    /**
     * Sets an OpenGL projection
     * @param {Number} projection
     */
    setProjection:function (projection) {
        var size = this._winSizeInPixels;
        var sizePoint = this._winSizeInPoints;

        if (this._openGLView) {
            this._openGLView.setViewPortInPoints(0, 0, sizePoint.width, sizePoint.height);
        }

        switch (projection) {
            case cc.DIRECTOR_PROJECTION_2D:
                //TODO OpenGL
                /* kmGLMatrixMode(KM_GL_PROJECTION);
                 kmGLLoadIdentity();
                 kmMat4 orthoMatrix;
                 kmMat4OrthographicProjection(&orthoMatrix, 0, size.width / CC_CONTENT_SCALE_FACTOR(), 0, size.height / CC_CONTENT_SCALE_FACTOR(), -1024, 1024 );
                 kmGLMultMatrix(&orthoMatrix);
                 kmGLMatrixMode(KM_GL_MODELVIEW);
                 kmGLLoadIdentity();*/
                break;
            case cc.DIRECTOR_PROJECTION_3D:
                //TODO OpenGl
                /* float zeye = this->getZEye();

                 kmMat4 matrixPerspective, matrixLookup;

                 kmGLMatrixMode(KM_GL_PROJECTION);
                 kmGLLoadIdentity();

                 // issue #1334
                 kmMat4PerspectiveProjection( &matrixPerspective, 60, (GLfloat)size.width/size.height, 0.1f, zeye*2);
                 // kmMat4PerspectiveProjection( &matrixPerspective, 60, (GLfloat)size.width/size.height, 0.1f, 1500);

                 kmGLMultMatrix(&matrixPerspective);

                 kmGLMatrixMode(KM_GL_MODELVIEW);
                 kmGLLoadIdentity();
                 kmVec3 eye, center, up;
                 kmVec3Fill( &eye, sizePoint.width/2, sizePoint.height/2, zeye );
                 kmVec3Fill( &center, sizePoint.width/2, sizePoint.height/2, 0.0f );
                 kmVec3Fill( &up, 0.0f, 1.0f, 0.0f);
                 kmMat4LookAt(&matrixLookup, &eye, &center, &up);
                 kmGLMultMatrix(&matrixLookup);*/
                break;
            case cc.DIRECTOR_PROJECTION_CUSTOM:
                if (this._projectionDelegate) {
                    this._projectionDelegate.updateProjection();
                }
                break;

            default:
                cc.log("cocos2d: Director: unrecognized projection");
                break;
        }

        this._projection = projection;
        //ccSetProjectionMatrixDirty();
    },

    /**
     * shows the FPS in the screen
     */
    _showStats:function () {
        this._frames++;
        this._accumDt += this._deltaTime;
        if (this._displayStats) {
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
            } else {
                this._createStatsLabel();
            }
        }
        cc.g_NumberOfDraws = 0;
    },

    /**
     * update content scale factor
     */
    updateContentScaleFactor:function () {
        // [openGLView responseToSelector:@selector(setContentScaleFactor)]
        if (this._openGLView.canSetContentScaleFactor()) {
            this._openGLView.setContentScaleFactor(this._contentScaleFactor);
            this._isContentScaleSupported = true;
        }
        else {
            cc.log("cocos2d: setContentScaleFactor:'is not supported on this device");
        }
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
     * @param displayFPS
     */
    setDisplayStats:function (displayStats) {
        this._displayStats = displayStats;
    },

    /**
     * seconds per frame
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
     *     The running scene will be deleted. If there are no more scenes in the stack the execution is terminated. <br/>
     *     ONLY call it if there is a running scene.
     * </p>
     */
    popToRootScene:function () {
        cc.Assert(this._runningScene != null, "A running Scene is needed");
        var c = this._scenesStack.length;

        if (c == 1) {
            this._scenesStack.pop();
            this.end();
        } else {
            while (c > 1) {
                var current = this._scenesStack.pop();
                if (current.isRunning()) {
                    current.onExit();
                }
                current.cleanup();
                c--;
            }
            this._nextScene = this._scenesStack[this._scenesStack.length - 1];
            this._sendCleanupToScene = false;
        }
    },

    setWatcherCallbackFun:function (pSender, func) {
        this._watcherFun = func;
        this._watcherSender = pSender;
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
        return this._keyboardDispatcher;
    },
    setKeyboardDispatcher:function (keyboardDispatcher) {
        this._keyboardDispatcher = keyboardDispatcher;
    },

    getAccelerometer:function () {
        return this._accelerometer;
    },
    setAccelerometer:function (accelerometer) {
        if (this._accelerometer != accelerometer) {
            this._accelerometer = accelerometer;
        }
    },

    getMouseDispatcher:function(){
       return this._mouseDispatcher;
    },

    setMouseDispatcher:function( mouseDispatcher){
        if(this._mouseDispatcher != mouseDispatcher)
            this._mouseDispatcher = mouseDispatcher;
    },

    _createStatsLabel:function () {
        this._FPSLabel = cc.LabelTTF.create("00.0", "Arial", 18, cc.size(60, 16), cc.TEXT_ALIGNMENT_RIGHT);
        this._SPFLabel = cc.LabelTTF.create("0.000", "Arial", 18, cc.size(60, 16), cc.TEXT_ALIGNMENT_RIGHT);
        this._drawsLabel = cc.LabelTTF.create("000", "Arial", 18, cc.size(60, 16), cc.TEXT_ALIGNMENT_RIGHT);

        this._drawsLabel.setPosition(cc.pAdd(cc.p(20, 48), cc.DIRECTOR_STATS_POSITION));
        this._SPFLabel.setPosition(cc.pAdd(cc.p(20, 30), cc.DIRECTOR_STATS_POSITION));
        this._FPSLabel.setPosition(cc.pAdd(cc.p(20, 10), cc.DIRECTOR_STATS_POSITION));
    },

    _calculateMPF:function () {
        var now = Date.now();
        this._secondsPerFrame = (now-this._lastUpdate)/1000;
    }
});


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
        cc.Application.sharedApplication().setAnimationInterval(this._animationInterval);
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
    }
    return cc.s_SharedDirector;
};

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

