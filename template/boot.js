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

var cocos2dApp = cc.Class.extend({
    ctor:function (scene) {
        cc.initConfig();
        cc.dumpConfig();

        // initialize director
        var director = cc.Director.getInstance();

        var screenSize = cc.EGLView.getInstance().getFrameSize();
        var resourceSize = cc.size(800, 450);
        var designSize = cc.size(800, 450);

        var searchPaths = [];
        var resDirOrders = [];

        searchPaths.push("res");
        cc.FileUtils.getInstance().setSearchPaths(searchPaths);

        var platform = cc.Application.getInstance().getTargetPlatform();
        if (platform == cc.TARGET_PLATFORM.MOBILE_BROWSER) {
            if (screenSize.height > 450) {
                resDirOrders.push("HD");
            }
            else {
                resourceSize = cc.size(400, 225);
                designSize = cc.size(400, 225);
                resDirOrders.push("Normal");
            }
        }
        else if (platform == cc.TARGET_PLATFORM.PC_BROWSER) {
            resDirOrders.push("HD");
        }
        else if (platform == cc.TARGET_PLATFORM.IPHONE) {
            resDirOrders.push("Normal");
        }
        else if (platform == cc.TARGET_PLATFORM.IPAD) {
            resDirOrders.push("HD");
        }

        cc.FileUtils.getInstance().setSearchResolutionsOrder(resDirOrders);

        director.setContentScaleFactor(resourceSize.width / designSize.width);

        cc.EGLView.getInstance().setDesignResolutionSize(designSize.width, designSize.height, cc.RESOLUTION_POLICY.SHOW_ALL);

        // turn on display FPS
        director.setDisplayStats(ccConfig['showFPS']);

        // set FPS. the default value is 1.0/60 if you don't call this
        director.setAnimationInterval(1.0 / ccConfig['frameRate']);

        //load resources
        cc.LoaderScene.preload(g_ressources, function () {
            var sc = new scene;
            if (director.getRunningScene()) {
                director.replaceScene(sc);
            } else {
                director.runWithScene(sc);
            }
        }, this);
    }
});

var myApp = new cocos2dApp(MyScene);
