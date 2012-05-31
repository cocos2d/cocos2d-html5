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


cc.AppController = cc.Class.extend({
    didFinishLaunchingWithOptions:function () {
        // Override point for customization after application launch.
        var app = new cc.AppDelegate();
        cc.Application.sharedApplication().run();

        return true;
    },

    applicationWillResignActive:function () {
        /*
         Sent when the application is about to move from active to inactive state. This can occur for certain types of temporary interruptions (such as an incoming phone call or SMS message) or when the user quits the application and it begins the transition to the background state.
         Use this method to pause ongoing tasks, disable timers, and throttle down OpenGL ES frame rates. Games should use this method to pause the game.
         */
        cc.Director.sharedDirector().pause();
    },

    applicationDidBecomeActive:function () {
        /*
         Restart any tasks that were paused (or not yet started) while the application was inactive. If the application was previously in the background, optionally refresh the user interface.
         */
        cc.Director.sharedDirector().resume();
    },

    applicationDidEnterBackground:function () {
        /*
         Use this method to release shared resources, save user data, invalidate timers, and store enough application state information to restore your application to its current state in case it is terminated later.
         If your application supports background execution, called instead of applicationWillTerminate: when the user quits.
         */
        cc.Application.sharedApplication().applicationDidEnterBackground();
    },

    applicationWillEnterForeground:function () {
        /*
         Called as part of  transition from the background to the inactive state: here you can undo many of the changes made on entering the background.
         */
        cc.Application.sharedApplication().applicationWillEnterForeground();
    },

    applicationWillTerminate:function () {
        /*
         Called when the application is about to terminate.
         See also applicationDidEnterBackground:.
         */
    }
});

cc.AppController.shareAppController = function () {
    if (cc.sharedAppController == null) {
        cc.sharedAppController = new cc.AppController();
    }
    cc.Assert(cc.sharedAppController, "shareAppController");
    return cc.sharedAppController;
};
// cocos2d application instance
cc.sharedAppController = null;