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
        var label = cc.LabelTTF.labelWithString("MainMenu", "Arial", 20);
        var menuItem = cc.MenuItemLabel.itemWithLabel(label, this, this.MainMenuCallback);

        var menu = cc.Menu.menuWithItems(menuItem, null);
        var s = cc.Director.sharedDirector().getWinSize();
        menu.setPosition(cc.PointZero());
        menuItem.setPosition(cc.PointMake(s.width - 50, 25));

        this.addChild(menu, 1);
    },
    runThisTest:function () {

    },
    MainMenuCallback:function () {
        var scene = cc.Scene.node();
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
        var closeItem = cc.MenuItemImage.itemFromNormalImage(s_pathClose, s_pathClose, this, this.closeCallback);
        var menu = cc.Menu.menuWithItems(closeItem, null);//pmenu is just a holder for the close button
        var s = cc.Director.sharedDirector().getWinSize();
        menu.setPosition(cc.PointZero());
        closeItem.setPosition(cc.PointMake(s.width - 30, s.height - 30));

        // add menu items for tests
        this._itemMenu = cc.Menu.menuWithItems(null);//item menu is where all the label goes, and the one gets scrolled

        for (var i =0,len = testNames.length;i < len;i++) {
            var label = cc.LabelTTF.labelWithString(testNames[i], "Arial", 24);
            var menuItem = cc.MenuItemLabel.itemWithLabel(label, this, this.menuCallback);
            this._itemMenu.addChild(menuItem,i  + 10000);
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
        var scene = new window[testNames[idx]+"Scene"]();
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
            var curPos = cc.ccp(this._itemMenu.getPosition().x, this._itemMenu.getPosition().y);

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

            curPos   = nextPos;
        }
    },
    ccTouchesEnded:function () {
        this.isMouseDown = false;
    }
});

var testNames = [
    //"Accelerometer",
    "ActionManagerTest",
    "ActionsTest",
    "Box2DTest",
    //"Box2dTestBed",
    //"BugsTest",
    //"ChipmunkTest",
    "ClickAndMoveTest",
    "CocosDenshionTest",
    "CocosNodeTest",
    //"CurlTest",
    "CurrentLanguageTest",
    "DirectorTest",
    "DrawPrimitivesTest",
    "EaseActionsTest",
    //"EffectsTest",
    //"EffectAdvancedTest",
    //"ExtensionsTest",
    "FontTest",
    //"HiResTest",
    "IntervalTest",
    //"KeypadTest",
    "LabelTest",
    "LayerTest",
    "MenuTest",
    //"MotionStreakTest",
    "ParallaxTest",
    "ParticleTest",
    "PerformanceTest",
    "ProgressActionsTest",
    //"RenderTextureTest",
    "RotateWorldTest",
    "SceneTest",
    "SchedulerTest",
    "SpriteTest",
    "TextInputTest",
    //"Texture2DTest",
    "TextureCacheTest",
    "TileMapTest",
    "TouchesTest",
    "TransitionsTest"
    //"UserDefaultTest",
    //"ZwoptexTest",

];