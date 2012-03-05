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
if(CC.ENABLE_PROFILERS){
    //TODO include support/CCProfiling
}


/** @typedef ccDirectorProjection
 Possible OpenGL projections used by director
 */
CC.kCCDirectorProjection2D      = 0;//sets a 2D projection (orthogonal projection)
CC.kCCDirectorProjection3D      = 1;//sets a 3D projection with a fovy=60, znear=0.5f and zfar=1500.
CC.kCCDirectorProjectionCustom  = 3;//it calls "updateProjection" on the projection delegate.
CC.kCCDirectorProjectionDefault = CC.kCCDirectorProjection3D;// Detault projection is 3D projection
// backward compatibility stuff
CC.CCDirectorProjection2D       = CC.kCCDirectorProjection2D;
CC.CCDirectorProjection3D       = CC.kCCDirectorProjection3D;
CC.CCDirectorProjectionCustom   = CC.kCCDirectorProjectionCustom;

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
CC.kCCDirectorTypeNSTimer = 0;
/** will use a Director that triggers the main loop from a custom main loop.
 *
 * Features and Limitations:
 * - Faster than NSTimer Director
 * - It doesn't integrate well with UIKit objects
 * - The interval update can't be customizable
 */
CC.kCCDirectorTypeMainLoop = 1;
/** Will use a Director that triggers the main loop from a thread, but the main loop will be executed on the main thread.
 *
 * Features and Limitations:
 * - Faster than NSTimer Director
 * - It doesn't integrate well with UIKit objects
 * - The interval update can't be customizable
 */
CC.kCCDirectorTypeThreadMainLoop= 2;
/** Will use a Director that synchronizes timers with the refresh rate of the display.
 *
 * Features and Limitations:
 * - Faster than NSTimer Director
 * - Only available on 3.1+
 * - Scheduled timers & drawing are synchronizes with the refresh rate of the display
 * - Integrates OK with UIKit objects
 * - The interval update can be 1/60, 1/30, 1/15
 */
CC.kCCDirectorTypeDisplayLink = 3;
/** Default director is the NSTimer directory */
CC.kCCDirectorTypeDefault = CC.kCCDirectorTypeNSTimer;
// backward compatibility stuff
CC.CCDirectorTypeNSTimer = CC.kCCDirectorTypeNSTimer;
CC.CCDirectorTypeMainLoop = CC.kCCDirectorTypeMainLoop;
CC.CCDirectorTypeThreadMainLoop = CC.kCCDirectorTypeThreadMainLoop;
CC.CCDirectorTypeDisplayLink = CC.kCCDirectorTypeDisplayLink;
CC.CCDirectorTypeDefault =CC.kCCDirectorTypeDefault;


/** @typedef ccDeviceOrientation
 Possible device orientations
 */

/// Device oriented vertically, home button on the bottom
CC.kCCDeviceOrientationPortrait = 0; // UIDeviceOrientationPortrait,
/// Device oriented vertically, home button on the top
CC.kCCDeviceOrientationPortraitUpsideDown = 1; // UIDeviceOrientationPortraitUpsideDown,
/// Device oriented horizontally, home button on the right
CC.kCCDeviceOrientationLandscapeLeft = 2; // UIDeviceOrientationLandscapeLeft,
/// Device oriented horizontally, home button on the left
CC.kCCDeviceOrientationLandscapeRight = 3; // UIDeviceOrientationLandscapeRight,

// Backward compatibility stuff
CC.CCDeviceOrientationPortrait = CC.kCCDeviceOrientationPortrait;
CC.CCDeviceOrientationPortraitUpsideDown = CC.kCCDeviceOrientationPortraitUpsideDown;
CC.CCDeviceOrientationLandscapeLeft = CC.kCCDeviceOrientationLandscapeLeft;
CC.CCDeviceOrientationLandscapeRight = CC.kCCDeviceOrientationLandscapeRight;


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
CC.CCDirector = CC.Class.extend({
    //Variables
    m_bDisplayFPS : false,
    _m_bIsContentScaleSupported : false,
    m_bLandscape : false,
    _m_bNextDeltaTimeZero : false,
    _m_bPaused : false,
    _m_bPurgeDirecotorInNextLoop : false,
    _m_bRetinaDisplay : false,
    _m_bSendCleanupToScene : false,
    m_dAnimationInterval : 0.0,
    m_dOldAnimationInterval : 0.0,
    _m_eDeviceOrientation : 0,
    _m_eProjection : 0,
    _m_fAccumDt : 0.0,
    _m_fAccumDtForProfiler: 0.0,
    _m_fContentScaleFactor: 1.0,
    _m_fDeltaTime : 0.0,
    _m_fFrameRate : 0.0,
    _m_obWinSizeInPixels : null,
    _m_obWinSizeInPoints : null,
    _m_pFPSLabel: null,
    _m_pLastUpdate : null,
    _m_pNextScene : null,
    _m_pNotificationNode: null,
    _m_pobOpenGLView: null,
    _m_pobScenesStack: null,
    _m_pProjectionDelegate: null,
    _m_pRunningScene: null,
    _m_pszFPS: '',
    _m_uFrames: 0,
    _m_uTotalFrames: 0,
    init : function()
    {
        CC.CCLOG("cocos2d: "+ cocos2dVersion());

        // scenes
        //TODO these are already set to null, so maybe we can remove them in the init?
        this._m_pRunningScene = null;
        this._m_pNextScene = null;
        this._m_pNotificationNode = null;


        this.m_dOldAnimationInterval = this.m_dAnimationInterval = 1.0 / CC.kDefaultFPS;
        this._m_pobScenesStack = [];
        // Set default projection (3D)
        this._m_eProjection = CC.kCCDirectorProjectionDefault;
        // projection delegate if "Custom" projection is used
        this._m_pProjectionDelegate = null;

        //FPS
        this.m_bDisplayFPS = false;//can remove
        this._m_uTotalFrames = this._m_uFrames = 0;
        this._m_pszFPS = "";
        this._m_pLastUpdate = new cc_timeval();

        //Paused?
        this._m_bPaused = false;

        //purge?
        this._m_bPurgeDirecotorInNextLoop = false;
        this._m_obWinSizeInPixels = this._m_obWinSizeInPoints = CC.CCSizeZero;

        //portrait mode default
        this._m_eDeviceOrientation = CC.CCDeviceOrientationPortrait;
        this._m_pobOpenGLView = null;
        this._m_bRetinaDisplay = false;
        this._m_fContentScaleFactor = 1.0;
        this._m_bIsContentScaleSupported = false;
        return true;
    },
    applyOrientation : function()
    {
        var s = new CCSize();
        s = this._m_obWinSizeInPixels;
        var w = s.width /2;
        var h = s.height / 2;
        // XXX it's using hardcoded values.
        // What if the the screen size changes in the future?
        switch (this._m_eDeviceOrientation)
        {
            case CC.CCDeviceOrientationPortrait:
                // nothing
                break;
            case CC.CCDeviceOrientationPortraitUpsideDown:
                // upside down
                //TODO OpenGL stuff
                /*glTranslatef(w,h,0);
                glRotatef(180,0,0,1);
                glTranslatef(-w,-h,0);*/
                break;
            case CC.CCDeviceOrientationLandscapeRight:
                /*glTranslatef(w,h,0);
                glRotatef(90,0,0,1);
                glTranslatef(-h,-w,0);*/
                break;
            case CC.CCDeviceOrientationLandscapeLeft:
                /*glTranslatef(w,h,0);
                glRotatef(-90,0,0,1);
                glTranslatef(-h,-w,0);*/
                break;
        }
    },
    calculateDeltaTime : function()
    {
        var now = new cc_timeval();
        if(CCTime.gettimeofdayCocos2d(now, null) != 0)
        {
            CC.CCLOG("error in gettimeofday");
            this._m_fDeltaTime = 0;
            return;
        }

        //new delta time
        if(this._m_bNextDeltaTimeZero)
        {
            this._m_fDeltaTime = 0;
            this._m_bNextDeltaTimeZero = false;
        }
        else
        {
            this._m_fDeltaTime = (now.tv_sec - this._m_pLastUpdate.tv_sec) + (now.tv_usec - this._m_pLastUpdate.tv_usec) / 1000000.0;
            this._m_fDeltaTime = Math.max(0, this._m_fDeltaTime);
        }

        if(CC.DEBUG)
        {
            if(this._m_fDeltaTime > 0.2)
            {
                this._m_fDeltaTime = 1 / 60.0;
            }
        }
        this._m_pLastUpdate = now;
    },
    convertToGL : function(obPoint)
    {
        var s = new CCSize();
        s = this._m_obWinSizeInPoints;
        var newY = s.height - obPoint.y;
        var newX = s.width - obPoint.x;

        var ret = new CCPoint();
        ret = CC.CCPointZero;
        switch (this._m_eDeviceOrientation)
        {
            case CC.CCDeviceOrientationPortrait:
                ret = CC.ccp(obPoint.x, newY);
                break;
            case CC.CCDeviceOrientationPortraitUpsideDown:
                ret = CC.ccp(newX, obPoint.y);
                break;
            case CC.CCDeviceOrientationLandscapeLeft:
                ret.x = obPoint.y;
                ret.y = obPoint.x;
                break;
            case CC.CCDeviceOrientationLandscapeRight:
                ret.x = newY;
                ret.y = newX;
                break;
        }
        return ret;
    },
    convertToUI: function(obPoint)
    {
        var winSize = new CCSize();
        winSize = this._m_obWinSizeInPoints;
        var oppositeX = winSize.width - obPoint.x;
        var oppositeY = winSize.height - obPoint.y;
        var uiPoint = new CCPoint();
        uiPoint = CC.CCPointZero;

        switch(this._m_eDeviceOrientation)
        {
            case CC.CCDeviceOrientationPortrait:
                uiPoint = CC.ccp(obPoint.x, oppositeY);
                break;
            case CC.CCDeviceOrientationPortraitUpsideDown:
                uiPoint = CC.ccp(oppositeX, obPoint.y);
                break;
            case CC.CCDeviceOrientationLandscapeLeft:
                uiPoint = CC.ccp(obPoint.y, obPoint.x);
                break;
            case CC.CCDeviceOrientationLandscapeRight:
                // Can't use oppositeX/Y because x/y are flipped
                uiPoint = CC.ccp(winSize.width - obPoint.y, winSize.height - obPoint.x);
                break;
        }
        return uiPoint;

    },
    // Draw the SCene
    drawScene: function()
    {
        // calculate "global" dt
        this.calculateDeltaTime();

        //tick before glClear: issue #533
        if (! this._m_bPaused)
        {
            CCScheduler.sharedScheduler().tick(this._m_fDeltaTime);//TODO this statement might not be correct
        }
        //TODO openGL stuff
        //glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

        /* to avoid flickr, nextScene MUST be here: after tick and before draw.
         XXX: Which bug is this one. It seems that it can't be reproduced with v0.9 */
        if (this._m_pNextScene)
        {
            this._setNextScene();
        }
        //TODO openGL
        //glPushMatrix();

        this.applyOrientation();

        // By default enable VertexArray, ColorArray, TextureCoordArray and Texture2D
        CC.CC_ENABLE_DEFAULT_GL_STATES();

        // draw the scene
        if (this._m_pRunningScene)
        {
            this._m_pRunningScene.visit();
        }

        // draw the notifications node
        if (this._m_pNotificationNode)
        {
            this._m_pNotificationNode.visit();
        }

        if (this.m_bDisplayFPS)
        {
            this._showFPS();
        }

        if (CC.CC_ENABLE_PROFILERS)
        {
            this.showProfilers();
        }

        CC.CC_DISABLE_DEFAULT_GL_STATES();
        //TODO OpenGL
        //glPopMatrix();

        this._m_uTotalFrames++;

        // swap buffers
        if (this._m_pobOpenGLView)
        {
            this._m_pobOpenGLView.swapBuffers();
        }
    },
    enableRetinaDisplay: function(enabled)
    {
        // Already enabled?
        if (enabled && this._m_fContentScaleFactor == 2)
        {
            return true;
        }

        // Already diabled?
        if (!enabled && this._m_fContentScaleFactor == 1)
        {
            return false;
        }

        // setContentScaleFactor is not supported
        if (! this._m_pobOpenGLView.canSetContentScaleFactor())
        {
            return false;
        }

        var newScale = (enabled)? 2 : 1;
        this.setContentScaleFactor(newScale);

        // release cached texture
        CC.CCTextureCache.purgeSharedTextureCache();

        if (CC.CC_DIRECTOR_FAST_FPS)
        {
            if (this._m_pFPSLabel)
            {
                CC.CC_SAFE_RELEASE_NULL(this._m_pFPSLabel);
                this._m_pFPSLabel = CCLabelTTF.labelWithString("00.0", "Arial", 24);
                this._m_pFPSLabel.retain();
            }
        }

        this._m_bRetinaDisplay = !!(this._m_fContentScaleFactor == 2);


        return true;
    },
    end: function()
    {
        this._m_bPurgeDirecotorInNextLoop = true;
    },
    getContentScaleFactor: function()
    {
        return this._m_fContentScaleFactor;
    },
    getDeviceOrientation: function()
    {
        return this._m_eDeviceOrientation;
    },
    getDisplaySizeInPixels: function()
    {
        return this._m_obWinSizeInPixels;
    },
    getNotificationNode: function()
    {
        return this._m_pNotificationNode;
    },
    getWinSize: function()
    {
        var S = (this._m_obWinSizeInPoints);

        if (this._m_eDeviceOrientation == CC.CCDeviceOrientationLandscapeLeft || this._m_eDeviceOrientation == CC.CCDeviceOrientationLandscapeRight)
        {
            // swap x,y in landspace mode
            var tmp = S;
            S.width = tmp.height;
            S.height = tmp.width;
        }
        return S;
    },
    getWinSizeInPixels: function()
    {
        var s = this.getWinSize();

        s.width *= CC.CC_CONTENT_SCALE_FACTOR();
        s.height *= CC.CC_CONTENT_SCALE_FACTOR();

        return s;
    },
    getZEye: function()
    {
        return (this._m_obWinSizeInPixels.height / 1.1566);
    },
    pause: function()
    {
        if (this._m_bPaused)
        {
            return;
        }

        this.m_dOldAnimationInterval = this.m_dAnimationInterval;

        // when paused, don't consume CPU
        this.setAnimationInterval(1 / 4.0);
        this._m_bPaused = true;
    },
    popScene: function()
    {
        CC.CCAssert(this._m_pRunningScene != null, "running scene should not null");

        this._m_pobScenesStack.removeLastObject();
        var c = this._m_pobScenesStack.count();

        if (c == 0)
        {
            this.end();
        }
        else
        {
            this._m_bSendCleanupToScene = true;
            this._m_pNextScene = this._m_pobScenesStack.getObjectAtIndex(c - 1);
        }
    },
    purgeCachedData: function()
    {
        CC.CCLabelBMFont.purgeCachedData();
        CC.CCTextureCache.sharedTextureCache().removeUnusedTextures();
    },
     _purgeDirector: function()
    {
        // don't release the event handlers
        // They are needed in case the director is run again
        CC.CCTouchDispatcher.sharedDispatcher().removeAllDelegates();

        if (this._m_pRunningScene)
        {
            this._m_pRunningScene.onExit();
            this._m_pRunningScene.cleanup();
            this._m_pRunningScene.release();
        }

        this._m_pRunningScene = null;
        this._m_pNextScene = null;

        // remove all objects, but don't release it.
        // runWithScene might be executed after 'end'.
        this._m_pobScenesStack.removeAllObjects();

        this.stopAnimation();

        if (CC.CC_DIRECTOR_FAST_FPS)
        {
            CC.CC_SAFE_RELEASE_NULL(this._m_pFPSLabel);
        }

        CC.CC_SAFE_RELEASE_NULL(this._m_pProjectionDelegate);

        // purge bitmap cache
        CC.CCLabelBMFont.purgeCachedData();

        // purge all managers
        CC.CCAnimationCache.purgeSharedAnimationCache();
        CC.CCSpriteFrameCache.purgeSharedSpriteFrameCache();
        CC.CCActionManager.sharedManager().purgeSharedManager();
        CC.CCScheduler.purgeSharedScheduler();
        CC.CCTextureCache.purgeSharedTextureCache();

        if (CC.CC_TARGET_PLATFORM != CC.CC_PLATFORM_MARMALADE)
        {
            CC.CCUserDefault.purgeSharedUserDefault();
        }
        // OpenGL view
        this._m_pobOpenGLView.release();
        this._m_pobOpenGLView = null;
    },
    pushScene: function(pScene)
    {
        CC.CCAssert(pScene, "the scene should not null");

        this._m_bSendCleanupToScene = false;

        this._m_pobScenesStack.addObject(pScene);
        this._m_pNextScene = pScene;
    },
    replaceScene: function(pScene)
    {
        CC.CCAssert(pScene != null, "the scene should not be null");

        var i = this._m_pobScenesStack.count();

        this._m_bSendCleanupToScene = true;
        this._m_pobScenesStack.replaceObjectAtIndex(i - 1, pScene);

        this._m_pNextScene = pScene;
    },
    resetDirector: function()
    {
        // don't release the event handlers
        // They are needed in case the director is run again
        CC.CCTouchDispatcher.sharedDispatcher().removeAllDelegates();

        if (this._m_pRunningScene)
        {
            this._m_pRunningScene.onExit();
            this._m_pRunningScene.cleanup();
            this._m_pRunningScene.release();
        }

        this._m_pRunningScene = null;
        this._m_pNextScene = null;

        // remove all objects, but don't release it.
        // runWithScene might be executed after 'end'.
        this._m_pobScenesStack.removeAllObjects();

        this.stopAnimation();

        CC.CC_SAFE_RELEASE_NULL(this._m_pProjectionDelegate);

        // purge bitmap cache
        CC.CCLabelBMFont.purgeCachedData();

        // purge all managers
        CC.CCAnimationCache.purgeSharedAnimationCache();
        CC.CCSpriteFrameCache.purgeSharedSpriteFrameCache();
        CC.CCActionManager.sharedManager().purgeSharedManager();
        CC.CCScheduler.purgeSharedScheduler();
        CC.CCTextureCache.purgeSharedTextureCache();
    },
    reshapeProjection: function(newWindowSize)
    {
        CC.CC_UNUSED_PARAM(newWindowSize);
        this._m_obWinSizeInPoints = this._m_pobOpenGLView.getSize();
        this._m_obWinSizeInPixels = CC.CCSizeMake(this._m_obWinSizeInPoints.width * this._m_fContentScaleFactor,
            this._m_obWinSizeInPoints.height * this._m_fContentScaleFactor);

        this.setProjection(this._m_eProjection);
    },
    resume: function()
    {
        if (! this._m_bPaused)
        {
            return;
        }

        this.setAnimationInterval(this.m_dOldAnimationInterval);

        if (CCTime.gettimeofdayCocos2d(this._m_pLastUpdate, null) != 0)
        {
            CC.CCLOG("cocos2d: Director: Error in gettimeofday");
        }

        this._m_bPaused = false;
        this._m_fDeltaTime = 0;
    },
    runWithScene: function(pScene)
    {
        CC.CCAssert(pScene != null, "running scene should not be null");
        CC.CCAssert(this._m_pRunningScene == null, "_m_pRunningScene should be null");

        this.pushScene(pScene);
        this.startAnimation();
    },
    setAlphaBlending: function(bOn)
    {
        if (bOn)
        {
            //TODO OpenGL
            //glEnable(GL_BLEND);
            //glBlendFunc(CC_BLEND_SRC, CC_BLEND_DST);
        }
        else
        {
            //glDisable(GL_BLEND);
        }
    },
    setContentScaleFactor: function(scaleFactor)
    {
        if (scaleFactor != this._m_fContentScaleFactor)
        {
            this._m_fContentScaleFactor = scaleFactor;
            this._m_obWinSizeInPixels = CC.CCSizeMake(this._m_obWinSizeInPoints.width * scaleFactor, this._m_obWinSizeInPoints.height * scaleFactor);

            if (this._m_pobOpenGLView)
            {
                this._updateContentScaleFactor();
            }

            // update projection
            this.setProjection(this._m_eProjection);
        }
    },
    setDepthTest: function(bOn)
    {
        if (bOn)
        {
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
    setDeviceOrientation: function(kDeviceOrientation)
    {
        var eNewOrientation;

        eNewOrientation = CCApplication.sharedApplication().setOrientation(kDeviceOrientation);

        if (this._m_eDeviceOrientation != eNewOrientation)
        {
            this._m_eDeviceOrientation = eNewOrientation;
        }
        else
        {
            // this logic is only run on win32 now
            // On win32,the return value of CCApplication::setDeviceOrientation is always kCCDeviceOrientationPortrait
            // So,we should calculate the Projection and window size again.
            this._m_obWinSizeInPoints = this._m_pobOpenGLView.getSize();
            this._m_obWinSizeInPixels = CC.CCSizeMake(this._m_obWinSizeInPoints.width * this._m_fContentScaleFactor, this._m_obWinSizeInPoints.height * this._m_fContentScaleFactor);
            this.setProjection(this._m_eProjection);
        }
    },
    setDirectorType: function(obDirectorType)
    {
        CC.CC_UNUSED_PARAM(obDirectorType);
        // we only support CCDisplayLinkDirector
        CC.CCDirector.sharedDirector();

        return true;
    },
    setGLDefaultValues: function()
    {
        // This method SHOULD be called only after openGLView_ was initialized
        CC.CCAssert(this._m_pobOpenGLView, "opengl view should not be null");

        this.setAlphaBlending(true);
        this.setDepthTest(true);
        this.setProjection(this._m_eProjection);

        // set other opengl default values
        //TODO OpenGl
        //glClearColor(0.0f, 0.0f, 0.0f, 1.0f);

        if (CC.CC_DIRECTOR_FAST_FPS)
        {
            if (! this._m_pFPSLabel)
            {
                this._m_pFPSLabel = CCLabelTTF.labelWithString("00.0", "Arial", 24);
                this._m_pFPSLabel.retain();
            }
        }
    },
    setNextDeltaTimeZero: function(bNextDeltaTimeZero)
    {
        this._m_bNextDeltaTimeZero = bNextDeltaTimeZero;
    },
    _setNextScene: function()
    {
        var runningIsTransition = (typeof(this._m_pRunningScene) != undefined);
        var newIsTransition = this._m_pNextScene instanceof CCTransitionScene;

        // If it is not a transition, call onExit/cleanup
        if (! newIsTransition)
        {
            if (this._m_pRunningScene)
            {
                this._m_pRunningScene.onExit();
            }

            // issue #709. the root node (scene) should receive the cleanup message too
            // otherwise it might be leaked.
            if (this._m_bSendCleanupToScene && this._m_pRunningScene)
            {
                this._m_pRunningScene.cleanup();
            }
        }

        if (this._m_pRunningScene)
        {
            this._m_pRunningScene.release();
        }
        this._m_pRunningScene = this._m_pNextScene;
        this._m_pNextScene.retain();
        this._m_pNextScene = null;

        if ((! runningIsTransition) && this._m_pRunningScene)
        {
            this._m_pRunningScene.onEnter();
            this._m_pRunningScene.onEnterTransitionDidFinish();
        }
    },
    setNotificationNode: function(node)
    {
        CC.CC_SAFE_RELEASE(this._m_pNotificationNode);
        this._m_pNotificationNode = node;
        CC.CC_SAFE_RETAIN(this._m_pNotificationNode);
    },
    setOpenGLView: function(pobOpenGLView)
    {
        CC.CCAssert(pobOpenGLView, "opengl view should not be null");

        if (this._m_pobOpenGLView != pobOpenGLView)
        {
            // because EAGLView is not kind of CCObject
            delete this._m_pobOpenGLView; // [openGLView_ release]
            this._m_pobOpenGLView = pobOpenGLView;

            // set size
            this._m_obWinSizeInPoints = this._m_pobOpenGLView.getSize();
            this._m_obWinSizeInPixels = CC.CCSizeMake(this._m_obWinSizeInPoints.width * this._m_fContentScaleFactor, this._m_obWinSizeInPoints.height * this._m_fContentScaleFactor);
            this.setGLDefaultValues();

            if (this._m_fContentScaleFactor != 1)
            {
                this._updateContentScaleFactor();
            }

            var pTouchDispatcher = CCTouchDispatcher.sharedDispatcher();
            this._m_pobOpenGLView.setTouchDelegate(pTouchDispatcher);
            pTouchDispatcher.setDispatchEvents(true);
        }
    },
    setProjection:function(kProjection)
    {
        var size = this._m_obWinSizeInPixels;
        var zeye = this.getZEye();
        switch (kProjection)
        {
            case CC.kCCDirectorProjection2D:
                if (this._m_pobOpenGLView)
                {
                    this._m_pobOpenGLView.setViewPortInPoints(0, 0, size.width, size.height);
                }
                //TODO OpenGL
                //glMatrixMode(GL_PROJECTION);
                //glLoadIdentity();
                //ccglOrtho(0, size.width, 0, size.height, -1024 * CC_CONTENT_SCALE_FACTOR(),1024 * CC_CONTENT_SCALE_FACTOR());
                //glMatrixMode(GL_MODELVIEW);
                //glLoadIdentity();
                break;

            case CC.kCCDirectorProjection3D:
                if (this._m_pobOpenGLView)
                {
                    this._m_pobOpenGLView.setViewPortInPoints(0, 0, size.width, size.height);
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

            case CC.kCCDirectorProjectionCustom:
                if (this._m_pProjectionDelegate)
                {
                    this._m_pProjectionDelegate.updateProjection();
                }
                break;

            default:
                CCLOG("cocos2d: Director: unrecognized projecgtion");
                break;
        }

        this._m_eProjection = kProjection;
    },
    _showFPS: function()
    {
        this._m_uFrames++;
        this._m_fAccumDt += this._m_fDeltaTime;

        if (this._m_fAccumDt > CC.CC_DIRECTOR_FPS_INTERVAL)
        {
            this._m_fFrameRate = this._m_uFrames / this._m_fAccumDt;
            this._m_uFrames = 0;
            this._m_fAccumDt = 0;

            this._m_pszFPS =  ('' + this._m_fFrameRate);
            this._m_pFPSLabel.setString(this._m_pszFPS);
        }

        this._m_pFPSLabel.draw();
    },
    showProfilers: function()
    {
        if(CC.CC_ENABLE_PROFILERS)
        {
            this._m_fAccumDtForProfiler += this._m_fDeltaTime;
            if (this._m_fAccumDtForProfiler > 1.0)
            {
                this._m_fAccumDtForProfiler = 0;
                CC.CCProfiler.sharedProfiler().displayTimers();
            }
        }
    },
    _updateContentScaleFactor:function()
    {
        // [openGLView responseToSelector:@selector(setContentScaleFactor)]
        if (this._m_pobOpenGLView.canSetContentScaleFactor())
        {
            this._m_pobOpenGLView.setContentScaleFactor(this._m_fContentScaleFactor);
            this._m_bIsContentScaleSupported = true;
        }
        else
        {
            CCLOG("cocos2d: setContentScaleFactor:'is not supported on this device");
        }
    },
    isRetinaDisplay: function() { return this._m_bRetinaDisplay; },
    isSendCleanupToScene: function() { return this._m_bSendCleanupToScene; },
    /** Get current running Scene. Director can only run one Scene at the time */
    getRunningScene : function(){ return this._m_pRunningScene; },
    /** Get the FPS value */
    getAnimationInterval : function(){ return this.m_dAnimationInterval; },
    /** Whether or not to display the FPS on the bottom-left corner */
    isDisplayFPS : function(){ return this.m_bDisplayFPS; },
    /** Display the FPS on the bottom-left corner */
    setDisplayFPS: function(bDisplayFPS){ this.m_bDisplayFPS = bDisplayFPS; },
    /** Get the CCEGLView, where everything is rendered */
    getOpenGLView: function(){ return this._m_pobOpenGLView; },

    isNextDeltaTimeZero: function(){ return this._m_bNextDeltaTimeZero; },

    /** Whether or not the Director is paused */
    isPaused: function() { return this._m_bPaused; },

    /** How many frames were called since the director started */
    getFrames: function() { return this._m_uFrames; },
    /** Sets an OpenGL projection*/
    getProjection: function(){ return this._m_eProjection;}
});
CC.CCDirector.sharedDirector = function(){
    if(CC.s_bFirstRun)
    {
        CC.s_sharedDirector.init();
        CC.s_bFirstRun = false;
    }
    return CC.s_sharedDirector;
}

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
CC.CCDisplayLinkDirector = CC.CCDirector.extend({
    _m_bInvalid: false,
    startAnimation: function()
    {
        if (CC.CCTime.gettimeofdayCocos2d(this._m_pLastUpdate, null) != 0)
        {
            CCLOG("cocos2d: DisplayLinkDirector: Error on gettimeofday");
        }

        this._m_bInvalid = false;
        CC.CCApplication.sharedApplication().setAnimationInterval(this.m_dAnimationInterval);
    },
    mainLoop: function()
    {
        if (this._m_bPurgeDirecotorInNextLoop)
        {
            this. _purgeDirector();
            this._m_bPurgeDirecotorInNextLoop = false;
        }
        else if (! this._m_bInvalid)
        {
            this.drawScene();

            // release the objects
            //CCPoolManager::getInstance()->pop();
        }
    },
    stopAnimation: function()
    {
        this._m_bInvalid = true;
    },
    setAnimationInterval: function(dValue)
    {
        this.m_dAnimationInterval = dValue;
        if (! this._m_bInvalid)
        {
            this.stopAnimation();
            this.startAnimation();
        }
    }
});
CC.s_sharedDirector = new CC.CCDisplayLinkDirector();
CC.s_bFirstRun = true;
CC.kDefaultFPS = 60;//set default fps to 60