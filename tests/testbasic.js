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

var TestScene = cc.Scene.extend({
    _portrait:false,
    ctor:function (bPortrait) {
        this._super();
        this._portrait = bPortrait;
        if (this._portrait) {
            cc.Director.sharedDirector().setDeviceOrientation(cc.DEVICE_ORIENTATION_LANDSCAPE_RIGHT);
        }
        this.init();
    },
    onEnter:function () {
        this._super();
        var label = cc.LabelTTF.create("MainMenu", "Arial", 20);
        var menuItem = cc.MenuItemLabel.create(label, this, this.MainMenuCallback);

        var menu = cc.Menu.create(menuItem, null);
        var s = cc.Director.sharedDirector().getWinSize();
        menu.setPosition(cc.PointZero());
        menuItem.setPosition(cc.PointMake(s.width - 50, 25));

        this.addChild(menu, 1);
    },
    runThisTest:function () {

    },
    MainMenuCallback:function () {
        var scene = cc.Scene.create();
        var layer = new TestController();
        scene.addChild(layer);
        cc.Director.sharedDirector().replaceScene(scene);
    }
});
//Controller stuff
var LINE_SPACE = 40;
var s_pathClose = null;
var curPos = cc.PointZero();

var TestController = cc.Layer.extend({
    _itemMenu:null,
    _beginPos:cc.PointZero(),
    isMouseDown:false,
    ctor:function () {
        // add close menu
        if (!s_pathClose) {
            s_pathClose = cc.TextureCache.sharedTextureCache().textureForKey("Resources/CloseNormal.png");
        }
        var closeItem = cc.MenuItemImage.create(s_pathClose, s_pathClose, this, this.closeCallback);
        var menu = cc.Menu.create(closeItem, null);//pmenu is just a holder for the close button
        var s = cc.Director.sharedDirector().getWinSize();
        menu.setPosition(cc.PointZero());
        closeItem.setPosition(cc.PointMake(s.width - 30, s.height - 30));

        // add menu items for tests
        this._itemMenu = cc.Menu.create(null);//item menu is where all the label goes, and the one gets scrolled

        for (var i = 0, len = testNames.length; i < len; i++) {
            var label = cc.LabelTTF.create(testNames[i].title, "Arial", 24);
            var menuItem = cc.MenuItemLabel.create(label, this, this.menuCallback);
            this._itemMenu.addChild(menuItem, i + 10000);
            menuItem.setPosition(cc.PointMake(s.width / 2, (s.height - (i + 1) * LINE_SPACE)));
        }

        this._itemMenu.setContentSize(cc.SizeMake(s.width, (testNames.length + 1) * LINE_SPACE));
        this._itemMenu.setPosition(curPos);
        this.setIsTouchEnabled(true);
        this.addChild(this._itemMenu);
        this.addChild(menu, 1);
    },
    menuCallback:function (sender) {
        var idx = sender.getZOrder() - 10000;
        // get the userdata, it's the index of the menu item clicked
        // create the test scene and run it
        var scene = testNames[idx].testScene();
        if (scene) {
            scene.runThisTest();
        }
    },
    closeCallback:function () {
        history.go(-1);
    },
    ccTouchesBegan:function (touches, event) {
        if (!this.isMouseDown) {
            //this._beginPos = cc.ccp(touches[0].locationInView(0).x, touches[0].locationInView(0).y);
            this._beginPos = touches[0].locationInView(0).y;
        }
        this.isMouseDown = true;
    },
    ccTouchesMoved:function (touches, event) {
        if (this.isMouseDown) {
            var touchLocation = touches[0].locationInView(0).y;
            var nMoveY = touchLocation - this._beginPos;
            curPos = cc.ccp(this._itemMenu.getPosition().x, this._itemMenu.getPosition().y);

            var nextPos = cc.ccp(curPos.x, curPos.y + nMoveY);
            var winSize = cc.Director.sharedDirector().getWinSize();
            if (nextPos.y < 0.0) {
                this._itemMenu.setPosition(cc.PointZero());
                return;
            }

            if (nextPos.y > ((testNames.length + 1) * LINE_SPACE - winSize.height)) {
                this._itemMenu.setPosition(cc.ccp(0, ((testNames.length + 1) * LINE_SPACE - winSize.height)));
                return;
            }
            this._itemMenu.setPosition(nextPos);
            this._beginPos = cc.ccp(0, touchLocation).y;
            curPos = nextPos;
        }
    },
    ccTouchesEnded:function () {
        this.isMouseDown = false;
    }
});

var testNames = [
    //"Accelerometer",
    {
        title:"ActionManagerTest",
        testScene:function () {
            return new ActionManagerTestScene();
        }
    },
    {
        title:"ActionsTest",
        testScene:function () {
            return new ActionsTestScene();
        }
    },
    {
        title:"Box2DTest",
        testScene:function () {
            return new Box2DTestScene();
        }
    },
    //"Box2dTestBed",
    //"BugsTest",
    //"ChipmunkTest",
    {
        title:"ClickAndMoveTest",
        testScene:function () {
            return new ClickAndMoveTestScene();
        }
    },
    {
        title:"CocosDenshionTest",
        testScene:function () {
            return new CocosDenshionTestScene();
        }
    },
    {
        title:"CocosNodeTest",
        testScene:function () {
            return new CocosNodeTestScene();
        }
    },
    {
        title:"CurrentLanguageTest",
        testScene:function () {
            return new CurrentLanguageTestScene();
        }
    },
    //"CurlTest",
    {
        title:"DirectorTest",
        testScene:function () {
            return new DirectorTestScene();
        }
    },
    {
        title:"DrawPrimitivesTest",
        testScene:function () {
            return new DrawPrimitivesTestScene();
        }
    },
    {
        title:"EaseActionsTest",
        testScene:function () {
            return new EaseActionsTestScene();
        }
    },
    //"EffectsTest",
    //"EffectAdvancedTest",
    //"ExtensionsTest",
    {
        title:"FontTest",
        testScene:function () {
            return new FontTestScene();
        }
    },
    //"HiResTest",
    {
        title:"IntervalTest",
        testScene:function () {
            return new IntervalTestScene();
        }
    },
    //"KeypadTest",
    {
        title:"LabelTest",
        testScene:function () {
            return new LabelTestScene();
        }
    },
    {
        title:"LayerTest",
        testScene:function () {
            return new LayerTestScene();
        }
    },
    {
        title:"MenuTest",
        testScene:function () {
            return new MenuTestScene();
        }
    },
    //"MotionStreakTest",
    {
        title:"ParallaxTest",
        testScene:function () {
            return new ParallaxTestScene();
        }
    },
    {
        title:"ParticleTest",
        testScene:function () {
            return new ParticleTestScene();
        }
    },
    {
        title:"PerformanceTest",
        testScene:function () {
            return new PerformanceTestScene();
        }
    },
    {
        title:"ProgressActionsTest",
        testScene:function () {
            return new ProgressActionsTestScene();
        }
    },
    //"RenderTextureTest",
    {
        title:"RotateWorldTest",
        testScene:function () {
            return new RotateWorldTestScene();
        }
    },
    {
        title:"SceneTest",
        testScene:function () {
            return new SceneTestScene();
        }
    },
    {
        title:"SchedulerTest",
        testScene:function () {
            return new SchedulerTestScene();
        }
    },
    {
        title:"SpriteTest",
        testScene:function () {
            return new SpriteTestScene();
        }
    },
    {
        title:"TextInputTest",
        testScene:function () {
            return new TextInputTestScene();
        }
    },
    //"Texture2DTest",
    {
        title:"TextureCacheTest",
        testScene:function () {
            return new TextureCacheTestScene();
        }
    },
    {
        title:"TileMapTest",
        testScene:function () {
            return new TileMapTestScene();
        }
    },
    {
        title:"TouchesTest",
        testScene:function () {
            return new TouchesTestScene();
        }
    },
    {
        title:"TransitionsTest",
        testScene:function () {
            return new TransitionsTestScene();
        }
    }
    //"UserDefaultTest",
    //"ZwoptexTest",
];