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
if (cc.ENABLE_PROFILERS) {
    //TODO include support/CCProfiling
}

/** @typedef ccDirectorProjection
 Possible OpenGL projections used by director
 */
cc.CCDIRECTOR_PROJECTION_2D = 0;//sets a 2D projection (orthogonal projection)
cc.CCDIRECTOR_PROJECTION_3D = 1;//sets a 3D projection with a fovy=60, znear=0.5f and zfar=1500.
cc.CCDIRECTOR_PROJECTION_CUSTOM = 3;//it calls "updateProjection" on the projection delegate.
cc.CCDIRECTOR_PROJECTION_DEFAULT = cc.CCDIRECTOR_PROJECTION_3D;// Detault projection is 3D projection
// backward compatibility stuff
cc.DIRECTOR_PROJECTION_2D = cc.CCDIRECTOR_PROJECTION_2D;
cc.DIRECTOR_PROJECTION_3D = cc.CCDIRECTOR_PROJECTION_3D;
cc.DIRECTOR_PROJECTION_CUSTOM = cc.CCDIRECTOR_PROJECTION_CUSTOM;

/** @typedef ccDirectorType
 Possible Director Types.
 @since v0.8.2
 */
/** Will use a Director that triggers the main loop from an NSTimer object
 *
 * Features and Limitations:
 * - Integrates OK with UIKit objects
 * - It the slowest director
 * - The interval update is customizable from 1 to 60
 */
cc.CCDIRECTOR_TYPE_NS_TIMER = 0;
/** will use a Director that triggers the main loop from a custom main loop.
 *
 * Features and Limitations:
 * - Faster than NSTimer Director
 * - It doesn't integrate well with UIKit objects
 * - The interval update can't be customizable
 */
cc.CCDIRECTOR_TYPE_MAIN_LOOP = 1;
/** Will use a Director that triggers the main loop from a thread, but the main loop will be executed on the main thread.
 *
 * Features and Limitations:
 * - Faster than NSTimer Director
 * - It doesn't integrate well with UIKit objects
 * - The interval update can't be customizable
 */
cc.CCDIRECTOR_TYPE_THREAD_MAIN_LOOP = 2;
/** Will use a Director that synchronizes timers with the refresh rate of the display.
 *
 * Features and Limitations:
 * - Faster than NSTimer Director
 * - Only available on 3.1+
 * - Scheduled timers & drawing are synchronizes with the refresh rate of the display
 * - Integrates OK with UIKit objects
 * - The interval update can be 1/60, 1/30, 1/15
 */
cc.CCDIRECTOR_TYPE_DISPLAY_LINK = 3;
/** Default director is the NSTimer directory */
cc.CCDIRECTOR_TYPE_DEFAULT = cc.CCDIRECTOR_TYPE_NS_TIMER;
// backward compatibility stuff
cc.DIRECTOR_TYPE_NS_TIMER = cc.CCDIRECTOR_TYPE_NS_TIMER;
cc.DIRECTOR_TYPE_MAIN_LOOP = cc.CCDIRECTOR_TYPE_MAIN_LOOP;
cc.DIRECTOR_TYPE_THREAD_MAIN_LOOP = cc.CCDIRECTOR_TYPE_THREAD_MAIN_LOOP;
cc.DIRECTOR_TYPE_DISPLAY_LINK = cc.CCDIRECTOR_TYPE_DISPLAY_LINK;
cc.DIRECTOR_TYPE_DEFAULT = cc.CCDIRECTOR_TYPE_DEFAULT;

/** @typedef ccDeviceOrientation
 Possible device orientations
 */

/// Device oriented vertically, home button on the bottom
cc.CCDEVICE_ORIENTATION_PORTRAIT = 0; // UIDeviceOrientationPortrait,
/// Device oriented horizontally, home button on the right
cc.CCDEVICE_ORIENTATION_LANDSCAPE_LEFT = 1; // UIDeviceOrientationLandscapeLeft,
/// Device oriented vertically, home button on the top
cc.CCDEVICE_ORIENTATION_PORTRAIT_UPSIDE_DOWN = 2; // UIDeviceOrientationPortraitUpsideDown,
/// Device oriented horizontally, home button on the left
cc.CCDEVICE_ORIENTATION_LANDSCAPE_RIGHT = 3; // UIDeviceOrientationLandscapeRight,

/// In browsers, we only support 2 orientations by change window size.
cc.DEVICE_MAX_ORIENTATIONS = 2;

// Backward compatibility stuff
cc.DEVICE_ORIENTATION_PORTRAIT = cc.CCDEVICE_ORIENTATION_PORTRAIT;
cc.DEVICE_ORIENTATION_PORTRAIT_UPSIDE_DOWN = cc.CCDEVICE_ORIENTATION_PORTRAIT_UPSIDE_DOWN;
cc.DEVICE_ORIENTATION_LANDSCAPE_LEFT = cc.CCDEVICE_ORIENTATION_LANDSCAPE_LEFT;
cc.DEVICE_ORIENTATION_LANDSCAPE_RIGHT = cc.CCDEVICE_ORIENTATION_LANDSCAPE_RIGHT;

/**
 @brief Class that creates and handle the main Window and manages how
 and when to execute the Scenes.

 The CCDirector is also responsible for:
 - initializing the OpenGL context
 - setting the OpenGL pixel format (default on is RGB565)
 - setting the OpenGL buffer depth (default one is 0-bit)
 - setting the projection (default one is 3D)
 - setting the orientation (default one is Protrait)

 Since the CCDirector is a singleton, the standard way to use it is by calling:
 _ CCDirector::sharedDirector()->methodName();

 The CCDirector also sets the default OpenGL context:
 - GL_TEXTURE_2D is enabled
 - GL_VERTEX_ARRAY is enabled
 - GL_COLOR_ARRAY is enabled
 - GL_TEXTURE_COORD_ARRAY is enabled
 */
cc.Director = cc.Class.extend({
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

    init:function () {
        //cc.LOG("cocos2d: "+ cc.cocos2dVersion());
        if (!this._FPSLabel) {
            this._FPSLabel = cc.LabelTTF.labelWithString("00.0", "Arial", 24);
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
    calculateDeltaTime:function () {
        var now = new cc.timeval();
        now = cc.Time.gettimeofdayCocos2d();
        if (!now) {
            cc.LOG("error in gettimeofday");
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
    // Draw the SCene
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
                this._FPSLabel = cc.LabelTTF.labelWithString("00.0", "Arial", 24);
                this._FPSLabel.setPosition(cc.ccp(0, 0));
                this._FPSLabel.setAnchorPoint(cc.ccp(0, 0));
            }
        }

        this._retinaDisplay = !!(this._contentScaleFactor == 2);

        return true;
    },
    end:function () {
        this._purgeDirecotorInNextLoop = true;
    },
    getContentScaleFactor:function () {
        return this._contentScaleFactor;
    },
    getDeviceOrientation:function () {
        return this._deviceOrientation;
    },
    getDisplaySizeInPixels:function () {
        return this._winSizeInPixels;
    },
    getNotificationNode:function () {
        return this._notificationNode;
    },
    getWinSize:function () {
        var tmp = this._winSizeInPoints;
        if (this._deviceOrientation == cc.DEVICE_ORIENTATION_LANDSCAPE_LEFT || this._deviceOrientation == cc.DEVICE_ORIENTATION_LANDSCAPE_RIGHT) {
            // swap x,y in landspace mode
            var s = new cc.SizeZero();
            s.width = tmp.height;
            s.height = tmp.width;
            return s;
        }

        return tmp;
    },
    getWinSizeInPixels:function () {
        var s = this.getWinSize();

        s.width *= cc.CONTENT_SCALE_FACTOR();
        s.height *= cc.CONTENT_SCALE_FACTOR();

        return s;
    },
    getZEye:function () {
        return (this._winSizeInPixels.height / 1.1566);
    },
    pause:function () {
        if (this._paused) {
            return;
        }

        this._oldAnimationInterval = this._animationInterval;

        // when paused, don't consume CPU
        this.setAnimationInterval(1 / 4.0);
        this._paused = true;
    },
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
    purgeCachedData:function () {
        cc.LabelBMFont.purgeCachedData();
        cc.TextureCache.sharedTextureCache().removeUnusedTextures();
    },
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
    pushScene:function (scene) {
        cc.Assert(scene, "the scene should not null");

        //this.addRegionToDirtyRegion(new cc.Rect(0, 0, cc.canvas.width, cc.canvas.height));

        this._sendCleanupToScene = false;

        this._scenesStack.push(scene);
        this._nextScene = scene;
    },
    replaceScene:function (scene) {
        cc.Assert(scene != null, "the scene should not be null");

        //this.addRegionToDirtyRegion(new cc.Rect(0, 0, cc.canvas.width, cc.canvas.height));

        var i = this._scenesStack.length;

        this._sendCleanupToScene = true;
        this._scenesStack[i - 1] = scene;

        this._nextScene = scene;
    },
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
    reshapeProjection:function (newWindowSize) {
        cc.UNUSED_PARAM(newWindowSize);
        this._winSizeInPoints = this._openGLView.getSize();
        this._winSizeInPixels = cc.SizeMake(this._winSizeInPoints.width * this._contentScaleFactor,
            this._winSizeInPoints.height * this._contentScaleFactor);

        this.setProjection(this._projection);
    },
    resume:function () {
        if (!this._paused) {
            return;
        }
        //this.addRegionToDirtyRegion(new cc.Rect(0, 0, cc.canvas.width, cc.canvas.height));

        this.setAnimationInterval(this._oldAnimationInterval);
        this._lastUpdate = cc.Time.gettimeofdayCocos2d();
        if (!this._lastUpdate) {
            cc.LOG("cocos2d: Director: Error in gettimeofday");
        }

        this._paused = false;
        this._deltaTime = 0;
    },
    runWithScene:function (scene) {
        cc.Assert(scene != null, "running scene should not be null");
        cc.Assert(this._runningScene == null, "_runningScene should be null");

        //this.addRegionToDirtyRegion(new cc.Rect(0, 0, cc.canvas.width, cc.canvas.height));

        this.pushScene(scene);
        this.startAnimation();
    },
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
    setDeviceOrientation:function (deviceOrientation) {
        var eNewOrientation = cc.Application.sharedApplication().setOrientation(deviceOrientation);

        if ((this._deviceOrientation % cc.DEVICE_MAX_ORIENTATIONS) != (eNewOrientation % cc.DEVICE_MAX_ORIENTATIONS)) {
            this._deviceOrientation = eNewOrientation;
            if (cc.renderContextType == cc.CANVAS) {
                var height = cc.canvas.height;
                cc.canvas.height = cc.canvas.width;
                cc.canvas.width = height;
                cc.renderContext.translate(0, cc.canvas.height);
                if(cc.domNode){
                    var cont = cc.$("#Cocos2dGameContainer");
                    if(cont){
                        cont.style.width = cc.canvas.width+"px";
                        cont.style.height = cc.canvas.height+"px";
                    }
                }
            }
        }
        else {
            // this logic is only run on win32 now
            // On win32,the return value of CCApplication::setDeviceOrientation is always CCDEVICE_ORIENTATION_PORTRAIT
            // So,we should calculate the Projection and window size again.
            //this._winSizeInPoints = this._openGLView.getSize();
            //this._winSizeInPixels = cc.SizeMake(this._winSizeInPoints.width * this._contentScaleFactor, this._winSizeInPoints.height * this._contentScaleFactor);
            //this.setProjection(this._projection);
        }

    },
    setDirectorType:function (obDirectorType) {
        // we only support CCDisplayLinkDirector
        cc.Director.sharedDirector();

        return true;
    },
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
                this._FPSLabel = cc.LabelTTF.labelWithString("00.0", "Arial", 24);
                this._FPSLabel.setPosition(cc.ccp(0, 0));
                this._FPSLabel.setAnchorPoint(cc.ccp(0, 0));
                //this._FPSLabel.retain();
            }
        }
    },
    setNextDeltaTimeZero:function (nextDeltaTimeZero) {
        this._nextDeltaTimeZero = nextDeltaTimeZero;
    },
    setNextScene:function () {
        if (this._runningScene) {
            var runningIsTransition = this._runningScene instanceof cc.TransitionScene;
        }
        else {
            var runningIsTransition = false;
        }
        if (this._nextScene) {
            var newIsTransition = this._nextScene instanceof cc.TransitionScene;
        }
        else {
            var newIsTransition = false;
        }

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

        if (this._runningScene) {
            //this._runningScene.release();
        }
        this._runningScene = this._nextScene;
        //this._nextScene.retain();
        this._nextScene = null;
        if ((!runningIsTransition) && (this._runningScene != null)) {
            this._runningScene.onEnter();
            this._runningScene.onEnterTransitionDidFinish();
        }
    },
    setNotificationNode:function (node) {
        this._notificationNode = node;
    },
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
                cc.LOG("cocos2d: Director: unrecognized projecgtion");
                break;
        }

        this._projection = projection;
    },
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
    showProfilers:function () {
        if (cc.ENABLE_PROFILERS) {
            this._accumDtForProfiler += this._deltaTime;
            if (this._accumDtForProfiler > 1.0) {
                this._accumDtForProfiler = 0;
                cc.Profiler.sharedProfiler().displayTimers();
            }
        }
    },
    updateContentScaleFactor:function () {
        // [openGLView responseToSelector:@selector(setContentScaleFactor)]
        if (this._openGLView.canSetContentScaleFactor()) {
            this._openGLView.setContentScaleFactor(this._contentScaleFactor);
            this._isContentScaleSupported = true;
        }
        else {
            cc.LOG("cocos2d: setContentScaleFactor:'is not supported on this device");
        }
    },
    isRetinaDisplay:function () {
        return this._retinaDisplay;
    },
    isSendCleanupToScene:function () {
        return this._sendCleanupToScene;
    },
    /** Get current running Scene. Director can only run one Scene at the time */
    getRunningScene:function () {
        return this._runningScene;
    },
    /** Get the FPS value */
    getAnimationInterval:function () {
        return this._animationInterval;
    },
    /** Whether or not to display the FPS on the bottom-left corner */
    isDisplayFPS:function () {
        return this._displayFPS;
    },
    /** Display the FPS on the bottom-left corner */
    setDisplayFPS:function (displayFPS) {
        this._displayFPS = displayFPS;
    },
    /** Get the CCEGLView, where everything is rendered */
    getOpenGLView:function () {
        return this._openGLView;
    },

    isNextDeltaTimeZero:function () {
        return this._nextDeltaTimeZero;
    },

    /** Whether or not the Director is paused */
    isPaused:function () {
        return this._paused;
    },

    /** How many frames were called since the director started */
    getFrames:function () {
        return this._frames;
    },
    /** Sets an OpenGL projection*/
    getProjection:function () {
        return this._projection;
    }
});
cc.Director.sharedDirector = function () {
    if (cc.firstRun) {
        cc.sharedDirector.init();
        cc.firstRun = false;
    }
    return cc.sharedDirector;
};

/***************************************************
 * implementation of DisplayLinkDirector
 **************************************************/

// should we afford 4 types of director ??
// I think DisplayLinkDirector is enough
// so we now only support DisplayLinkDirector
/**
 @brief DisplayLinkDirector is a Director that synchronizes timers with the refresh rate of the display.

 Features and Limitations:
 - Scheduled timers & drawing are synchronizes with the refresh rate of the display
 - Only supports animation intervals of 1/60 1/30 & 1/15

 @since v0.8.2
 */
cc.DisplayLinkDirector = cc.Director.extend({
    invalid:false,
    startAnimation:function () {
        this._lastUpdate = cc.Time.gettimeofdayCocos2d();
        this.invalid = false;
        cc.Application.sharedApplication().setAnimationInterval(this._animationInterval);
    },
    mainLoop:function () {
        if (this._purgeDirecotorInNextLoop) {
            this.purgeDirector();
            this._purgeDirecotorInNextLoop = false;
        }
        else if (!this.invalid) {
            this.drawScene();
        }
    },
    stopAnimation:function () {
        this.invalid = true;
    },
    setAnimationInterval:function (value) {
        this._animationInterval = value;
        if (!this.invalid) {
            this.stopAnimation();
            this.startAnimation();
        }
    }
});
cc.sharedDirector = new cc.DisplayLinkDirector();
cc.firstRun = true;
cc.defaultFPS = 60;//set default fps to 60

/*
 window.onfocus = function () {
 if (!cc.firstRun) {
 cc.Director.sharedDirector().addRegionToDirtyRegion(new cc.Rect(0, 0, cc.canvas.width, cc.canvas.height));
 }
 };
 */

