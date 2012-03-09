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
CC.kOrientationPortrait = 0,
/// Device oriented vertically, home button on the top
CC.kOrientationPortraitUpsideDown = 1,
/// Device oriented horizontally, home button on the right
CC.kOrientationLandscapeLeft = 2,
/// Device oriented horizontally, home button on the left
CC.kOrientationLandscapeRight = 3,

CC.sm_pSharedApplication = null;

CC.CCApplication = CC.Class.extend(
{
    ctor:function(){
        this._m_nAnimationInterval = 0;
        CC.CCAssert(!CC.sm_pSharedApplication);
        CC.sm_pSharedApplication = this;
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
        /* var pView = CC.CCDirector.sharedDirector().getOpenGLView();
        if (pView)
        {
            return pView.setDeviceOrientation(orientation);
        }
        return CC.CCDirector.sharedDirector().getDeviceOrientation(); */

    },

    /**
     @brief	Get status bar rectangle in EGLView window.
     */
    statusBarFrame:function(rect){
        if (rect)
        {
            // Windows doesn't have status bar.
            rect = CC.CCRectMake(0, 0, 0, 0);
        }

    },

    /**
     @brief	Run the message loop.
     */
    run:function(){
        // Initialize instance and cocos2d.
        if (! CC.AppDelegate.initInstance() || ! CC.AppDelegate.applicationDidFinishLaunching())
        {
            return 0;
        }
        // TODO, need to be fixed.
         setInterval(CC.CCDirector.sharedDirector().mainLoop(), this._m_nAnimationInterval * 1000);

    },
    _m_nAnimationInterval:null

});

/**
 @brief	Get current applicaiton instance.
 @return Current application instance pointer.
 */
CC.CCApplication.sharedApplication =  function(){
    CC.CCAssert(CC.sm_pSharedApplication);
    return CC.sm_pSharedApplication;
};

/**
 @brief Get current language config
 @return Current language config
 */
CC.CCApplication.getCurrentLanguage = function(){
    var ret = CC.kLanguageEnglish;

    // TODO, need to be fixed.
    /*
    var localeID = CC.GetUserDefaultLCID();
    var primaryLanguageID = localeID & 0xFF;

    switch (primaryLanguageID)
    {
        case LANG_CHINESE:
            ret = CC.kLanguageChinese;
            break;
        case LANG_FRENCH:
            ret = CC.kLanguageFrench;
            break;
        case LANG_ITALIAN:
            ret = CC.kLanguageItalian;
            break;
        case LANG_GERMAN:
            ret = CC.kLanguageGerman;
            break;
        case LANG_SPANISH:
            ret = CC.kLanguageSpanish;
            break;
        case LANG_RUSSIAN:
            ret = CC.kLanguageRussian;
            break;
    }
    */

    return ret;
};
