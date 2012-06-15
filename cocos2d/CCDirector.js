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

if (cc.ENABLE_PROFILERS) {
    //TODO include support/CCProfiling
}

//Possible OpenGL projections used by director
/**
 * sets a 2D projection (orthogonal projection)
 * @constant
 * @type Number
 */
cc.CCDIRECTOR_PROJECTION_2D = 0;

/**
 * sets a 3D projection with a fovy=60, znear=0.5f and zfar=1500.
 * @constant
 * @type Number
 */
cc.CCDIRECTOR_PROJECTION_3D = 1;

/**
 * it calls "updateProjection" on the projection delegate.
 * @constant
 * @type Number
 */
cc.CCDIRECTOR_PROJECTION_CUSTOM = 3;

/**
 * Detault projection is 3D projection
 * @constant
 * @type Number
 */
cc.CCDIRECTOR_PROJECTION_DEFAULT = cc.CCDIRECTOR_PROJECTION_3D;


// backward compatibility stuff
/**
 * @constant
 * @type Number
 */
cc.DIRECTOR_PROJECTION_2D = cc.CCDIRECTOR_PROJECTION_2D;

/**
 * @constant
 * @type Number
 */
cc.DIRECTOR_PROJECTION_3D = cc.CCDIRECTOR_PROJECTION_3D;

/**
 * @constant
 * @type Number
 */
cc.DIRECTOR_PROJECTION_CUSTOM = cc.CCDIRECTOR_PROJECTION_CUSTOM;

//Possible Director Types.
/**
 * <p>Will use a Director that triggers the main loop from an NSTimer object <br/>
 * <br/>
 * Features and Limitations:  <br/>
 * - Integrates OK with UIKit objects   <br/>
 * - It the slowest director    <br/>
 * - The interval update is customizable from 1 to 60
 * </p>
 * @constant
 * @type Number
 */
cc.CCDIRECTOR_TYPE_NS_TIMER = 0;

/**
 * <p>will use a Director that triggers the main loop from a custom main loop.<br/>
 * <br/>
 * Features and Limitations:<br/>
 * - Faster than NSTimer Director<br/>
 * - It doesn't integrate well with UIKit objects<br/>
 * - The interval update can't be customizable  </p>
 * @constant
 * @type Number
 */
cc.CCDIRECTOR_TYPE_MAIN_LOOP = 1;

/**
 * <p>Will use a Director that triggers the main loop from a thread, but the main loop will be executed on the main thread.<br/>
 * <br/>
 * Features and Limitations:<br/>
 * - Faster than NSTimer Director<br/>
 * - It doesn't integrate well with UIKit objects<br/>
 * - The interval update can't be customizable </p>
 * @constant
 * @type Number
 */
cc.CCDIRECTOR_TYPE_THREAD_MAIN_LOOP = 2;

/**
 * <p>Will use a Director that synchronizes timers with the refresh rate of the display. <br/>
 * <br/>
 * Features and Limitations:  <br/>
 * - Faster than NSTimer Director <br/>
 * - Only available on 3.1+   <br/>
 * - Scheduled timers & drawing are synchronizes with the refresh rate of the display <br/>
 * - Integrates OK with UIKit objects <br/>
 * - The interval update can be 1/60, 1/30, 1/15  </p>
 * @constant
 * @type Number
 */
cc.CCDIRECTOR_TYPE_DISPLAY_LINK = 3;

/**
 * Default director is the NSTimer directory
 * @constant
 * @type Number
 */
cc.CCDIRECTOR_TYPE_DEFAULT = cc.CCDIRECTOR_TYPE_NS_TIMER;

// backward compatibility stuff
/**
 * @constant
 * @type Number
 */
cc.DIRECTOR_TYPE_NS_TIMER = cc.CCDIRECTOR_TYPE_NS_TIMER;

/**
 * @constant
 * @type Number
 */
cc.DIRECTOR_TYPE_MAIN_LOOP = cc.CCDIRECTOR_TYPE_MAIN_LOOP;

/**
 * @constant
 * @type Number
 */
cc.DIRECTOR_TYPE_THREAD_MAIN_LOOP = cc.CCDIRECTOR_TYPE_THREAD_MAIN_LOOP;

/**
 * @constant
 * @type Number
 */
cc.DIRECTOR_TYPE_DISPLAY_LINK = cc.CCDIRECTOR_TYPE_DISPLAY_LINK;

/**
 * @constant
 * @type Number
 */
cc.DIRECTOR_TYPE_DEFAULT = cc.CCDIRECTOR_TYPE_DEFAULT;


//Possible device orientations
/**
 * Device oriented vertically, home button on the bottom (UIDeviceOrientationPortrait)
 * @constant
 * @type Number
 */
cc.CCDEVICE_ORIENTATION_PORTRAIT = 0;

/**
 * Device oriented horizontally, home button on the right (UIDeviceOrientationLandscapeLeft)
 * @constant
 * @type Number
 */
cc.CCDEVICE_ORIENTATION_LANDSCAPE_LEFT = 1;

/**
 * Device oriented vertically, home button on the top (UIDeviceOrientationPortraitUpsideDown)
 * @constant
 * @type Number
 */
cc.CCDEVICE_ORIENTATION_PORTRAIT_UPSIDE_DOWN = 2;

/**
 * Device oriented horizontally, home button on the left (UIDeviceOrientationLandscapeRight)
 * @constant
 * @type Number
 */
cc.CCDEVICE_ORIENTATION_LANDSCAPE_RIGHT = 3;

/**
 * In browsers, we only support 2 orientations by change window size.
 * @constant
 * @type Number
 */
cc.DEVICE_MAX_ORIENTATIONS = 2;

// Backward compatibility stuff
/**
 * @constant
 * @type Number
 */
cc.DEVICE_ORIENTATION_PORTRAIT = cc.CCDEVICE_ORIENTATION_PORTRAIT;

/**
 * @constant
 * @type Number
 */
cc.DEVICE_ORIENTATION_PORTRAIT_UPSIDE_DOWN = cc.CCDEVICE_ORIENTATION_PORTRAIT_UPSIDE_DOWN;

/**
 * @constant
 * @type Number
 */
cc.DEVICE_ORIENTATION_LANDSCAPE_LEFT = cc.CCDEVICE_ORIENTATION_LANDSCAPE_LEFT;

/**
 * @constant
 * @type Number
 */
cc.DEVICE_ORIENTATION_LANDSCAPE_RIGHT = cc.CCDEVICE_ORIENTATION_LANDSCAPE_RIGHT;

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
 *      - cc.Director.sharedDirector().methodName(); <br/>
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
    _displayFPS:false,
    _isContentScaleSupported:false,
    _landscape:false,
    _nextDeltaTimeZero:false,
    _paused:false,
    _purgeDirecotorInNextLoop:false,
    _retinaDisplay:false,
    _sendCleanupToScene:false,
    _animationInterval:0.0,
    _oldAnimationInterval:0.0,
    _deviceOrientation:0,
    _projection:0,
    _accumDt:0.0,
    _accumDtForProfiler:0.0,
    _contentScaleFactor:1.0,
    _deltaTime:0.0,
    _frameRate:0.0,
    _winSizeInPixels:null,
    _winSizeInPoints:null,
    _FPSLabel:null,
    _lastUpdate:null,
    _nextScene:null,
    _notificationNode:null,
    _openGLView:null,
    _scenesStack:null,
    _projectionDelegate:null,
    _runningScene:null,
    _szFPS:'',
    _frames:0,
    _totalFrames:0,

    _dirtyRegion:null,

    /**
     * initializes cc.Director
     * @return {Boolean}
     */
    init:function () {
        if (!this._FPSLabel) {
            this._FPSLabel = cc.LabelTTF.create("00.0", "Arial", 24);
        }
        this._FPSLabel.setPosition(cc.ccp(0, 0));
        this._FPSLabel.setAnchorPoint(cc.ccp(0, 0));
        // scenes
        //TODO these are already set to null, so maybe we can remove them in the init?
        this._runningScene = null;
        this._nextScene = null;
        this._notificationNode = null;


        this._oldAnimationInterval = this._animationInterval = 1.0 / cc.defaultFPS;
        this._scenesStack = [];
        // Set default projection (3D)
        this._projection = cc.CCDIRECTOR_PROJECTION_DEFAULT;
        // projection delegate if "Custom" projection is used
        this._projectionDelegate = null;

        //FPS
        this._displayFPS = false;//can remove
        this._totalFrames = this._frames = 0;
        this._szFPS = "";
        this._lastUpdate = new cc.timeval();

        //Paused?
        this._paused = false;

        //purge?
        this._purgeDirecotorInNextLoop = false;
        this._winSizeInPixels = this._winSizeInPoints = cc.SizeMake(cc.canvas.width, cc.canvas.height);

        //portrait mode default
        this._deviceOrientation = cc.DEVICE_ORIENTATION_PORTRAIT;
        this._openGLView = null;
        this._retinaDisplay = false;
        this._contentScaleFactor = 1.0;
        this._isContentScaleSupported = false;
        return true;
    },

    /**
     * rotates the screen if an orientation different than Portrait is used
     */
    applyOrientation:function () {
        var s = this._winSizeInPixels;
        var w = s.width / 2;
        var h = s.height / 2;
        // XXX it's using hardcoded values.
        // What if the the screen size changes in the future?
        switch (this._deviceOrientation) {
            case cc.DEVICE_ORIENTATION_PORTRAIT:
                // nothing
                break;
            case cc.DEVICE_ORIENTATION_PORTRAIT_UPSIDE_DOWN:
                // upside down
                //TODO OpenGL stuff
                /*glTranslatef(w,h,0);
                 glRotatef(180,0,0,1);
                 glTranslatef(-w,-h,0);*/
                break;
            case cc.DEVICE_ORIENTATION_LANDSCAPE_RIGHT:
                /*glTranslatef(w,h,0);
                 glRotatef(90,0,0,1);
                 glTranslatef(-h,-w,0);*/
                break;
            case cc.DEVICE_ORIENTATION_LANDSCAPE_LEFT:
                /*glTranslatef(w,h,0);
                 glRotatef(-90,0,0,1);
                 glTranslatef(-h,-w,0);*/
                break;
        }
    },

    /**
     * calculates delta time since last time it was called
     */
    calculateDeltaTime:function () {
        var now = new cc.timeval();
        now = cc.Time.gettimeofdayCocos2d();
        if (!now) {
            cc.Log("error in gettimeofday");
            this._deltaTime = 0;
            return;
        }

        //new delta time
        if (this._nextDeltaTimeZero) {
            this._deltaTime = 0;
            this._nextDeltaTimeZero = false;
        }
        else {
            this._deltaTime = (now.tv_sec - this._lastUpdate.tv_sec) + (now.tv_usec - this._lastUpdate.tv_usec) / 1000000.0;
            this._deltaTime = Math.max(0, this._deltaTime);
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
        var s = this._winSizeInPoints;
        var newY = s.height - point.y;
        var newX = s.width - point.x;

        var ret = cc.PointZero();
        switch (this._deviceOrientation) {
            case cc.DEVICE_ORIENTATION_PORTRAIT:
                ret = cc.ccp(point.x, newY);
                break;
            case cc.DEVICE_ORIENTATION_PORTRAIT_UPSIDE_DOWN:
                ret = cc.ccp(newX, point.y);
                break;
            case cc.DEVICE_ORIENTATION_LANDSCAPE_LEFT:
                ret.x = point.y;
                ret.y = point.x;
                break;
            case cc.DEVICE_ORIENTATION_LANDSCAPE_RIGHT:
                ret.x = newY;
                ret.y = newX;
                break;
        }
        return ret;
    },

    /**
     * <p>converts an OpenGL coordinate to a UIKit coordinate<br/>
     * Useful to convert node points to window points for calls such as glScissor</p>
     * @param {cc.Point} point
     * @return {cc.Point}
     */
    convertToUI:function (point) {
        var winSize = this._winSizeInPoints;
        var oppositeX = winSize.width - point.x;
        var oppositeY = winSize.height - point.y;
        var uiPoint = cc.PointZero();

        switch (this._deviceOrientation) {
            case cc.DEVICE_ORIENTATION_PORTRAIT:
                uiPoint = cc.ccp(point.x, oppositeY);
                break;
            case cc.DEVICE_ORIENTATION_PORTRAIT_UPSIDE_DOWN:
                uiPoint = cc.ccp(oppositeX, point.y);
                break;
            case cc.DEVICE_ORIENTATION_LANDSCAPE_LEFT:
                uiPoint = cc.ccp(point.y, point.x);
                break;
            case cc.DEVICE_ORIENTATION_LANDSCAPE_RIGHT:
                // Can't use oppositeX/Y because x/y are flipped
                uiPoint = cc.ccp(winSize.width - point.y, winSize.height - point.x);
                break;
        }
        return uiPoint;

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
            cc.Scheduler.sharedScheduler().tick(this._deltaTime);
        }
        //this._fullRect = new cc.Rect(0, 0, cc.canvas.width, cc.canvas.height);
        //cc.renderContext.clearRect(this._fullRect.origin.x, this._fullRect.origin.y, this._fullRect.size.width, -this._fullRect.size.height);
        cc.renderContext.clearRect(0, 0, cc.canvas.width, -cc.canvas.height);

        /*
         var isSaveContext = false;
         //glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
         if (this._dirtyRegion) {
         //cc.renderContext.clearRect(0, 0, cc.canvas.width, -cc.canvas.height);

         var fullRect = new cc.Rect(0, 0, cc.canvas.width, cc.canvas.height);
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

        //glPushMatrix();
        this.applyOrientation();

        // By default enable VertexArray, ColorArray, TextureCoordArray and Texture2D
        cc.ENABLE_DEFAULT_GL_STATES();

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

        if (this._displayFPS) {
            this.showFPS();
        }

        if (cc.ENABLE_PROFILERS) {
            this.showProfilers();
        }

        cc.DISABLE_DEFAULT_GL_STATES();
        //TODO OpenGL
        //glPopMatrix();

        this._totalFrames++;

        // swap buffers
        if (this._openGLView) {
            this._openGLView.swapBuffers();
        }
    },

    addRegionToDirtyRegion:function (rect) {
        if (!rect)
            return;

        if (!this._dirtyRegion) {
            this._dirtyRegion = new cc.Rect(rect.origin.x, rect.origin.y, rect.size.width, rect.size.height);
            return;
        }
        this._dirtyRegion = cc.Rect.CCRectUnion(this._dirtyRegion,
            new cc.Rect(rect.origin.x, rect.origin.y, rect.size.width, rect.size.height));
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

        var newScale = (enabled) ? 2 : 1;
        this.setContentScaleFactor(newScale);

        // release cached texture
        cc.TextureCache.purgeSharedTextureCache();

        if (cc.DIRECTOR_FAST_FPS) {
            if (!this._FPSLabel) {
                this._FPSLabel = cc.LabelTTF.create("00.0", "Arial", 24);
                this._FPSLabel.setPosition(cc.ccp(0, 0));
                this._FPSLabel.setAnchorPoint(cc.ccp(0, 0));
            }
        }

        this._retinaDisplay = !!(this._contentScaleFactor == 2);

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
     * get orientation of device
     * @return {Number}
     */
    getDeviceOrientation:function () {
        return this._deviceOrientation;
    },

    /**
     * returns the display size of the OpenGL view in pixels. It doesn't take into account any possible rotation of the window.
     * @return {cc.Size}
     */
    getDisplaySizeInPixels:function () {
        return this._winSizeInPixels;
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
        var tmp = this._winSizeInPoints;
        if (this._deviceOrientation == cc.DEVICE_ORIENTATION_LANDSCAPE_LEFT || this._deviceOrientation == cc.DEVICE_ORIENTATION_LANDSCAPE_RIGHT) {
            // swap x,y in landspace mode
            var size = new cc.SizeZero();
            size.width = tmp.height;
            size.height = tmp.width;
            return size;
        }
        return tmp;
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
        var size = this.getWinSize();

        size.width *= cc.CONTENT_SCALE_FACTOR();
        size.height *= cc.CONTENT_SCALE_FACTOR();

        return size;
    },

    getZEye:function () {
        return (this._winSizeInPixels.height / 1.1566);
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

        //this.addRegionToDirtyRegion(new cc.Rect(0, 0, cc.canvas.width, cc.canvas.height));

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
        cc.TextureCache.sharedTextureCache().removeUnusedTextures();
    },

    /**
     * purge Director
     */
    purgeDirector:function () {
        // don't release the event handlers
        // They are needed in case the director is run again
        cc.TouchDispatcher.sharedDispatcher().removeAllDelegates();

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
        //cc.LabelBMFont.purgeCachedData();

        // purge all managers
        cc.AnimationCache.purgeSharedAnimationCache();
        cc.SpriteFrameCache.purgeSharedSpriteFrameCache();
        cc.ActionManager.sharedManager().purgeSharedManager();
        cc.Scheduler.purgeSharedScheduler();
        cc.TextureCache.purgeSharedTextureCache();

        if (cc.TARGET_PLATFORM != cc.PLATFORM_MARMALADE) {
            cc.UserDefault.purgeSharedUserDefault();
        }
        // OpenGL view
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

        //this.addRegionToDirtyRegion(new cc.Rect(0, 0, cc.canvas.width, cc.canvas.height));

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

        //this.addRegionToDirtyRegion(new cc.Rect(0, 0, cc.canvas.width, cc.canvas.height));
        var i = this._scenesStack.length;

        this._sendCleanupToScene = true;
        this._scenesStack[i - 1] = scene;
        this._nextScene = scene;
    },

    /**
     * reset director
     */
    resetDirector:function () {
        // don't release the event handlers
        // They are needed in case the director is run again
        cc.TouchDispatcher.sharedDispatcher().removeAllDelegates();

        //this.addRegionToDirtyRegion(new cc.Rect(0, 0, cc.canvas.width, cc.canvas.height));

        if (this._runningScene) {
            this._runningScene.onExit();
            this._runningScene.cleanup();
            this._runningScene.release();
        }

        this._runningScene = null;
        this._nextScene = null;

        // remove all objects, but don't release it.
        // runWithScene might be executed after 'end'.
        this._scenesStack.removeAllObjects();

        this.stopAnimation();

        // purge bitmap cache
        cc.LabelBMFont.purgeCachedData();

        // purge all managers
        cc.AnimationCache.purgeSharedAnimationCache();
        cc.SpriteFrameCache.purgeSharedSpriteFrameCache();
        cc.ActionManager.sharedManager().purgeSharedManager();
        cc.Scheduler.purgeSharedScheduler();
        cc.TextureCache.purgeSharedTextureCache();
    },

    /**
     * changes the projection size
     * @param {cc.Size} newWindowSize
     */
    reshapeProjection:function (newWindowSize) {
        cc.UNUSED_PARAM(newWindowSize);
        this._winSizeInPoints = this._openGLView.getSize();
        this._winSizeInPixels = cc.SizeMake(this._winSizeInPoints.width * this._contentScaleFactor,
            this._winSizeInPoints.height * this._contentScaleFactor);

        this.setProjection(this._projection);
    },

    /**
     * resume director
     */
    resume:function () {
        if (!this._paused) {
            return;
        }
        //this.addRegionToDirtyRegion(new cc.Rect(0, 0, cc.canvas.width, cc.canvas.height));

        this.setAnimationInterval(this._oldAnimationInterval);
        this._lastUpdate = cc.Time.gettimeofdayCocos2d();
        if (!this._lastUpdate) {
            cc.Log("cocos2d: Director: Error in gettimeofday");
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

        //this.addRegionToDirtyRegion(new cc.Rect(0, 0, cc.canvas.width, cc.canvas.height));

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
            //glEnable(GL_BLEND);
            //glBlendFunc(cc.BLEND_SRC, cc.BLEND_DST);
        }
        else {
            //glDisable(GL_BLEND);
        }
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
            this._winSizeInPixels = cc.SizeMake(this._winSizeInPoints.width * scaleFactor, this._winSizeInPoints.height * scaleFactor);

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
    },

    /**
     * set Orientation of device
     * @param {Number} deviceOrientation
     */
    setDeviceOrientation:function (deviceOrientation) {
        var eNewOrientation = cc.Application.sharedApplication().setOrientation(deviceOrientation);

        if ((this._deviceOrientation % cc.DEVICE_MAX_ORIENTATIONS) != (eNewOrientation % cc.DEVICE_MAX_ORIENTATIONS)) {
            this._deviceOrientation = eNewOrientation;
            if (cc.renderContextType == cc.CANVAS) {
                var height = cc.canvas.height;
                cc.canvas.height = cc.canvas.width;
                cc.canvas.width = height;
                cc.renderContext.translate(0, cc.canvas.height);
                if (cc.domNode) {
                    var cont = cc.$("#Cocos2dGameContainer");
                    if (cont) {
                        cont.style.width = cc.canvas.width + "px";
                        cont.style.height = cc.canvas.height + "px";
                    }
                }
            }
        } else {
            // this logic is only run on win32 now
            // On win32,the return value of CCApplication::setDeviceOrientation is always CCDEVICE_ORIENTATION_PORTRAIT
            // So,we should calculate the Projection and window size again.
            //this._winSizeInPoints = this._openGLView.getSize();
            //this._winSizeInPixels = cc.SizeMake(this._winSizeInPoints.width * this._contentScaleFactor, this._winSizeInPoints.height * this._contentScaleFactor);
            //this.setProjection(this._projection);
        }
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

        if (cc.DIRECTOR_FAST_FPS) {
            if (!this._FPSLabel) {
                this._FPSLabel = cc.LabelTTF.create("00.0", "Arial", 24);
                this._FPSLabel.setPosition(cc.ccp(0, 0));
                this._FPSLabel.setAnchorPoint(cc.ccp(0, 0));
                //this._FPSLabel.retain();
            }
        }
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
        var runningIsTransition = this._runningScene? this._runningScene instanceof cc.TransitionScene:false;

        var newIsTransition = this._nextScene? this._nextScene instanceof cc.TransitionScene:false;

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
            this._winSizeInPixels = cc.SizeMake(this._winSizeInPoints.width * this._contentScaleFactor, this._winSizeInPoints.height * this._contentScaleFactor);
            this.setGLDefaultValues();

            if (this._contentScaleFactor != 1) {
                this.updateContentScaleFactor();
            }

            var touchDispatcher = cc.TouchDispatcher.sharedDispatcher();
            this._openGLView.setTouchDelegate(touchDispatcher);
            touchDispatcher.setDispatchEvents(true);
        }
    },

    /**
     * Sets an OpenGL projection
     * @param {Number} projection
     */
    setProjection:function (projection) {
        var size = this._winSizeInPixels;
        var zeye = this.getZEye();
        switch (projection) {
            case cc.CCDIRECTOR_PROJECTION_2D:
                if (this._openGLView) {
                    this._openGLView.setViewPortInPoints(0, 0, size.width, size.height);
                }
                //TODO OpenGL
                //glMatrixMode(GL_PROJECTION);
                //glLoadIdentity();
                //ccglOrtho(0, size.width, 0, size.height, -1024 * cc.CONTENT_SCALE_FACTOR(),1024 * cc.CONTENT_SCALE_FACTOR());
                //glMatrixMode(GL_MODELVIEW);
                //glLoadIdentity();
                break;

            case cc.CCDIRECTOR_PROJECTION_3D:
                if (this._openGLView) {
                    this._openGLView.setViewPortInPoints(0, 0, size.width, size.height);
                }
                //TODO OpenGl
                /*
                 glMatrixMode(GL_PROJECTION);
                 glLoadIdentity();
                 gluPerspective(60, (GLfloat)size.width/size.height, 0.5f, 1500.0f);

                 glMatrixMode(GL_MODELVIEW);
                 glLoadIdentity();
                 gluLookAt( size.width/2, size.height/2, zeye,
                 size.width/2, size.height/2, 0,
                 0.0f, 1.0f, 0.0f);*/
                break;

            case cc.CCDIRECTOR_PROJECTION_CUSTOM:
                if (this._projectionDelegate) {
                    this._projectionDelegate.updateProjection();
                }
                break;

            default:
                cc.Log("cocos2d: Director: unrecognized projecgtion");
                break;
        }

        this._projection = projection;
    },

    /**
     * shows the FPS in the screen
     */
    showFPS:function () {
        this._frames++;
        this._accumDt += this._deltaTime;

        if (this._accumDt > cc.DIRECTOR_FPS_INTERVAL) {
            this._frameRate = this._frames / this._accumDt;
            this._frames = 0;
            this._accumDt = 0;

            this._szFPS = ('' + this._frameRate.toFixed(1));
            this._FPSLabel.setString(this._szFPS);
        }
        this._FPSLabel.draw();
    },

    /**
     * show profiler
     */
    showProfilers:function () {
        if (cc.ENABLE_PROFILERS) {
            this._accumDtForProfiler += this._deltaTime;
            if (this._accumDtForProfiler > 1.0) {
                this._accumDtForProfiler = 0;
                cc.Profiler.sharedProfiler().displayTimers();
            }
        }
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
            cc.Log("cocos2d: setContentScaleFactor:'is not supported on this device");
        }
    },

    /**
     * is support retina display
     * @return {Boolean}
     */
    isRetinaDisplay:function () {
        return this._retinaDisplay;
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
    isDisplayFPS:function () {
        return this._displayFPS;
    },

    /**
     * Display the FPS on the bottom-left corner
     * @param displayFPS
     */
    setDisplayFPS:function (displayFPS) {
        this._displayFPS = displayFPS;
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
    getFrames:function () {
        return this._frames;
    },

    /**
     * Sets an OpenGL projection
     * @return {Number}
     */
    getProjection:function () {
        return this._projection;
    }
});

/**
 * returns a shared instance of the director
 * @function
 * @return {cc.Director}
 */
cc.Director.sharedDirector = function () {
    if (cc.firstRun) {
        cc.sharedDirector.init();
        cc.firstRun = false;
    }
    return cc.sharedDirector;
};

/**
 * <p>
 *     There are 4 types of Director.<br/>
 *       - kCCDirectorTypeNSTimer (default)<br/>
 *       - kCCDirectorTypeMainLoop<br/>
 *       - kCCDirectorTypeThreadMainLoop<br/>
 *       - kCCDirectorTypeDisplayLink<br/>
 *      <br/>
 *      Each Director has it's own benefits, limitations.<br/>
 *      Now we only support DisplayLink director, so it has not effect.<br/>
 *      <br/>
 *      This method should be called before any other call to the director.
 * </p>
 * @function
 * @param obDirectorType
 * @return {Boolean}
 */
cc.Director.setDirectorType = function (obDirectorType) {
    // we only support CCDisplayLinkDirector
    cc.Director.sharedDirector();
    return true;
};

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
        this._lastUpdate = cc.Time.gettimeofdayCocos2d();
        this.invalid = false;
        cc.Application.sharedApplication().setAnimationInterval(this._animationInterval);
    },

    /**
     * main loop of director
     */
    mainLoop:function () {
        if (this._purgeDirecotorInNextLoop) {
            this.purgeDirector();
            this._purgeDirecotorInNextLoop = false;
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

cc.sharedDirector = new cc.DisplayLinkDirector();

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
 cc.Director.sharedDirector().addRegionToDirtyRegion(new cc.Rect(0, 0, cc.canvas.width, cc.canvas.height));
 }
 };
 */

