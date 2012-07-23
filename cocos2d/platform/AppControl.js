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
 * Controller of Game Application
 * @class
 * @extends cc.Class
 */
cc.AppController = cc.Class.extend(/** @lends cc.AppController# */{
    /**
     * did something when Finish Launching
     * @return {Boolean}
     */
    didFinishLaunchingWithOptions:function () {
        // Override point for customization after application launch.
        //var app = new cc.AppDelegate();
        cc.Application.sharedApplication().run();

        return true;
    },

    /**
     * <p>
     *  Sent when the application is about to move from active to inactive state. <br/>
     *  This can occur for certain types of temporary interruptions (such as an incoming phone call or SMS message) <br/>
     *  or when the user quits the application and it begins the transition to the background state.     <br/>
     *  Use this method to pause ongoing tasks, disable timers, and throttle down OpenGL ES frame rates. <br/>
     *  Games should use this method to pause the game.
     * </p>
     */
    applicationWillResignActive:function () {
        cc.Director.getInstance().pause();
    },

    /**
     * <p>
     * Restart any tasks that were paused (or not yet started) while the application was inactive. <br/>
     * If the application was previously in the background, optionally refresh the user interface.
     * </p>
     */
    applicationDidBecomeActive:function () {
        cc.Director.getInstance().resume();
    },

    /**
     * <p>
     *   Use this method to release shared resources, save user data, invalidate timers, and store enough application state information <br/>
     *   to restore your application to its current state in case it is terminated later.<br/>
     *   If your application supports background execution, called instead of applicationWillTerminate: when the user quits.
     * </p>
     */
    applicationDidEnterBackground:function () {
        cc.Application.sharedApplication().applicationDidEnterBackground();
    },

    /**
     * <p>
     *     Called as part of  transition from the background to the inactive state: <br/>
     *      here you can undo many of the changes made on entering the background.
     * </p>
     */
    applicationWillEnterForeground:function () {
        cc.Application.sharedApplication().applicationWillEnterForeground();
    },

    /**
     * Called when the application is about to terminate. See also applicationDidEnterBackground.
     */
    applicationWillTerminate:function () {
    }
});

/**
 * Return Controller of Game Application
 * @return {cc.AppController}
 */
cc.AppController.shareAppController = function () {
    if (cc.sharedAppController == null) {
        cc.sharedAppController = new cc.AppController();
    }
    cc.Assert(cc.sharedAppController, "shareAppController");
    return cc.sharedAppController;
};

/**
 * cocos2d application instance
 * @type cc.AppController
 */
cc.sharedAppController = null;
