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


/// Device oriented vertically, home button on the bottom
cc.kOrientationPortrait = 0;
/// Device oriented vertically, home button on the top
cc.kOrientationPortraitUpsideDown = 1;
/// Device oriented horizontally, home button on the right
cc.kOrientationLandscapeLeft = 2;
/// Device oriented horizontally, home button on the left
cc.kOrientationLandscapeRight = 3;


cc.Application = cc.Class.extend(
{
    ctor:function(){
        this._m_nAnimationInterval = 0;
        cc.Assert(!cc.sm_pSharedApplication,"CCApplication ctor");
    },


    /**
     @brief	Callback by CCDirector for limit FPS.
     @interval       The time, which expressed in second in second, between current frame and next.
     */
    setAnimationInterval:function(interval){
        this._m_nAnimationInterval = interval;
    },



    /**
     @brief	Callback by CCDirector for change device orientation.
     @orientation    The defination of orientation which CCDirector want change to.
     @return         The actual orientation of the application.
     */
     setOrientation:function(orientation){
        // swap width and height
        // TODO, need to be fixed.
        /* var pView = cc.Director.sharedDirector().getOpenGLView();
        if (pView)
        {
            return pView.setDeviceOrientation(orientation);
        }
        return cc.Director.sharedDirector().getDeviceOrientation(); */

    },

    /**
     @brief	Get status bar rectangle in EGLView window.
     */
    statusBarFrame:function(rect){
        if (rect)
        {
            // Windows doesn't have status bar.
            rect = cc.RectMake(0, 0, 0, 0);
        }

    },

    /**
     @brief	Run the message loop.
     */
    run:function(){
        // Initialize instance and cocos2d.
        var newAppDelegate = new cc.AppDelegate();
        if(! newAppDelegate.initInstance() || ! newAppDelegate.applicationDidFinishLaunching())
        {
            return 0;
        }
        // TODO, need to be fixed.
        console.log(this._m_nAnimationInterval * 1000);
        var callback = function(){cc.Director.sharedDirector().mainLoop();};
        setInterval(callback, this._m_nAnimationInterval * 1000);
    },
    _m_nAnimationInterval:null

});

/**
 @brief	Get current applicaiton instance.
 @return Current application instance pointer.
 */
cc.Application.sharedApplication =  function(){

    if(cc.sm_pSharedApplication == null){
        cc.sm_pSharedApplication = new cc.Application();
    }

    cc.Assert(cc.sm_pSharedApplication,"sharedApplication");
    return cc.sm_pSharedApplication;
};

/**
 @brief Get current language config
 @return Current language config
 */
cc.Application.getCurrentLanguage = function(){
    var ret = cc.kLanguageEnglish;

    // TODO, need to be fixed.
    /*
    var localeID = cc.GetUserDefaultLCID();
    var primaryLanguageID = localeID & 0xFF;

    switch (primaryLanguageID)
    {
        case LANG_CHINESE:
            ret = cc.kLanguageChinese;
            break;
        case LANG_FRENCH:
            ret = cc.kLanguageFrench;
            break;
        case LANG_ITALIAN:
            ret = cc.kLanguageItalian;
            break;
        case LANG_GERMAN:
            ret = cc.kLanguageGerman;
            break;
        case LANG_SPANISH:
            ret = cc.kLanguageSpanish;
            break;
        case LANG_RUSSIAN:
            ret = cc.kLanguageRussian;
            break;
    }
    */

    return ret;
};

cc.sm_pSharedApplication = null;