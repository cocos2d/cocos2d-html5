/****************************************************************************
 Copyright (c) 2010-2012 cocos2d-x.org
 Copyright (c) 2008-2010 Ricardo Quesada
 Copyright (c) 2011      Zynga Inc.

 http://www.cocos2d-x.org

 Created by JetBrains WebStorm.
 User: wuhao
 Date: 12-4-5

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
    ctor: function(bPortrait){
        this._portrait = bPortrait;
        if (this._portrait)
        {
            cc.Director.sharedDirector().setDeviceOrientation(cc.DeviceOrientationLandscapeRight);
        }
        this.init();
    },
    onEnter: function(){
        this._super();
        var label = cc.LabelTTF.labelWithString("MainMenu", "Arial", 20);
        var pMenuItem = cc.MenuItemLabel.itemWithLabel(label, this, this.MainMenuCallback);

        var pMenu =cc.Menu.menuWithItems(pMenuItem, null);
        var s = cc.Director.sharedDirector().getWinSize();
        pMenu.setPosition( cc.PointZero());
        pMenuItem.setPosition( cc.PointMake( s.width - 50, 25) );

        this.addChild(pMenu, 1);
    },
    runThisTest: function(){

    },
    MainMenuCallback: function(){
        var pScene = cc.Scene.node();
        var pLayer = new TestController();
        pScene.addChild(pLayer);
        cc.Director.sharedDirector().replaceScene(pScene);
    }
});
//Controller stuff
var LINE_SPACE = 40;
var s_tCurPos = cc.PointZero();
var s_pPathClose = null;

function CreateTestScene(nIdx)
{
    //cc.Director.sharedDirector().purgeCachedData();
    var pScene;
    switch(nIdx)
    {
        case TEST.ACTIONS:
            pScene = new ActionsTestScene(); break;
        case TEST.TRANSITIONS:
            pScene = new TransitionsTestScene(); break;
        case TEST.PROGRESS_ACTIONS:
            pScene = new ProgressActionsTestScene(); break;
        case TEST.EFFECTS:
            pScene = new EffectTestScene(); break;
        case TEST.CLICK_AND_MOVE:
            pScene = new ClickAndMoveTestScene(); break;
        case TEST.ROTATE_WORLD:
            pScene = new RotateWorldTestScene(); break;
        case TEST.PARTICLE:
            pScene = new ParticleTestScene(); break;
        case TEST.EASE_ACTIONS:
            pScene = new EaseActionsTestScene(); break;
        case TEST.MOTION_STREAK:
            pScene = new MotionStreakTestScene(); break;
        case TEST.DRAW_PRIMITIVES:
            pScene = new DrawPrimitivesTestScene(); break;
        case TEST.COCOSNODE:
            pScene = new CocosNodeTestScene(); break;
        case TEST.TOUCHES:
            pScene = new PongScene(); break;
        case TEST.MENU:
            pScene = new MenuTestScene(); break;
        case TEST.ACTION_MANAGER:
            pScene = new ActionManagerTestScene(); break;
        case TEST.LAYER:
            pScene = new LayerTestScene(); break;
        case TEST.SCENE:
            pScene = new SceneTestScene(); break;
        case TEST.PARALLAX:
            pScene = new ParallaxTestScene(); break;
        case TEST.TILE_MAP:
            pScene = new TileMapTestScene(); break;
        case TEST.INTERVAL:
            pScene = new IntervalTestScene(); break;
        case TEST.LABEL:
            pScene = new AtlasTestScene(); break;
        case TEST.TEXT_INPUT:
            pScene = new TextInputTestScene(); break;
        case TEST.SPRITE:
            pScene = new SpriteTestScene(); break;
        case TEST.SCHEDULER:
            pScene = new SchedulerTestScene(); break;
        case TEST.RENDERTEXTURE:
            pScene = new RenderTextureScene(); break;
        case TEST.TEXTURE2D:
            pScene = new TextureTestScene(); break;
        case TEST.BOX2D:
            pScene = new Box2DTestScene(); break;
        case TEST.BOX2DBED:
            pScene = new Box2dTestBedScene(); break;
        case TEST.EFFECT_ADVANCE:
            pScene = new EffectAdvanceScene(); break;
        case TEST.HIRES:
            pScene = new HiResTestScene(); break;
        case TEST.ACCELEROMRTER:
            pScene = new AccelerometerTestScene(); break;
        case TEST.KEYPAD:
            pScene = new KeypadTestScene(); break;
        case TEST.COCOSDENSHION:
            pScene = new CocosDenshionTestScene(); break;
        case TEST.PERFORMANCE:
            pScene = new PerformanceTestScene(); break;
        case TEST.ZWOPTEX:
            pScene = new ZwoptexTestScene(); break;
        case TEST.CURL:
            pScene = new CurlTestScene(); break;
        case TEST.USERDEFAULT:
            pScene = new UserDefaultTestScene(); break;
        case TEST.DIRECTOR:
            pScene = new DirectorTestScene(); break;
        case TEST.BUGS:
            pScene = new BugsTestScene(); break;
        case TEST.FONTS:
            pScene = new FontTestScene(); break;
        case TEST.CURRENT_LANGUAGE:
            pScene = new CurrentLanguageTestScene(); break;
        case TEST.TEXTURECACHE:
            pScene = new TextureCacheTestScene(); break;
        case TEST.EXTENSIONS:
            pScene = new ExtensionsTestScene();
            break;
    }
    return pScene;
}

var TestController = cc.Layer.extend({
    _m_pItemMenu:null,
    _m_tBeginPos:cc.PointZero(),
    bIsMouseDown:false,
    ctor:function(){
        // add close menu
        if(!s_pPathClose)
        {
            s_pPathClose = cc.Loader.shareLoader().getImage("Resources/CloseNormal.png");
        }
        var pCloseItem = cc.MenuItemImage.itemFromNormalImage(s_pPathClose, s_pPathClose, this, this.closeCallback);
        var pMenu = cc.Menu.menuWithItems(pCloseItem, null);//pmenu is just a holder for the close button
        var s = cc.Director.sharedDirector().getWinSize();
        pMenu.setPosition(cc.PointZero());
        pCloseItem.setPosition(cc.PointMake(s.width - 30, s.height -30));

        // add menu items for tests
        this._m_pItemMenu = cc.Menu.menuWithItems(null);//item menu is where all the label goes, and the one gets scrolled
        for(var i=0; i < g_aTestNames.length; i++)
        {
            var label = cc.LabelTTF.labelWithString(g_aTestNames[i], "Arial", 24);
            var pMenuItem = cc.MenuItemLabel.itemWithLabel(label, this, this.menuCallback);
            this._m_pItemMenu.addChild(pMenuItem, i+10000);
            pMenuItem.setPosition(s.width/2, (s.height - (i+1)*LINE_SPACE));
        }
        //this._m_pItemMenu.setContentSize(cc.SizeMake(s.width, (g_aTestNames.length + 1) * LINE_SPACE));
        //this._m_pItemMenu.setPosition(s_tCurPos);
        this.setIsTouchEnabled(true);
        this.addChild(this._m_pItemMenu);
        this.addChild(pMenu, 1);
    },
    menuCallback: function(pSender){
        // get the userdata, it's the index of the menu item clicked
        //var pMenuItem = pSender;
        var nIdx = pSender.target.style.zIndex - 10000;

        // create the test scene and run it
        var pScene = CreateTestScene(nIdx);
        if (pScene)
        {
            pScene.runThisTest();
        }
    },
    closeCallback: function(){
        cc.Director.sharedDirector().end();
    },
    ccTouchesBegan: function(pTouches, pEvent){
        if(!this.bIsMouseDown)
        {
            //this._m_tBeginPos = cc.ccp(pTouches[0].locationInView(0).x, pTouches[0].locationInView(0).y);
            this._m_tBeginPos = pTouches[0].locationInView(0).y;
        }
        this.bIsMouseDown = true;

    },
    ccTouchesMoved: function(pTouches, pEvent){
        if(this.bIsMouseDown){
        var touchLocation = pTouches[0].locationInView(0).y;
        var nMoveY = touchLocation - this._m_tBeginPos;
        var curPos  = cc.ccp(this._m_pItemMenu.getPosition().x,this._m_pItemMenu.getPosition().y);

        var nextPos = cc.ccp(curPos.x, curPos.y + nMoveY);
        var winSize = cc.Director.sharedDirector().getWinSize();
        if (nextPos.y < 0.0)
        {
            this._m_pItemMenu.setPosition(cc.PointZero());
            return;
        }

        if (nextPos.y > ((g_aTestNames.length + 1)* LINE_SPACE - winSize.height))
        {
            this._m_pItemMenu.setPosition(cc.ccp(0, ((g_aTestNames.length + 1)* LINE_SPACE - winSize.height)));
            return;
        }
        this._m_pItemMenu.setPosition(nextPos);
        this._m_tBeginPos = cc.ccp(0, touchLocation).y;

        //s_tCurPos   = nextPos;
        }
    },
    ccTouchesEnded: function()
    {
        this.bIsMouseDown = false;
    }
});
var g_aTestNames = [
    "ActionsTest",
    "TransitionsTest",
    "ProgressActionsTest",
    "EffectsTest",
    "ClickAndMoveTest",
    "RotateWorldTest",
    "ParticleTest",
    "EaseActionsTest",
    "MotionStreakTest",
    "DrawPrimitivesTest",
    "CocosNodeTest",
    "TouchesTest",
    "MenuTest",
    "ActionManagerTest",
    "LayerTest",
    "SceneTest",
    "ParallaxTest",
    "TileMapTest",
    "IntervalTest",
    "ChipmunkTest",
    "LabelTest",
    "TextInputTest",
    "SpriteTest",
    "SchdulerTest",
    "RenderTextureTest",
    "Texture2DTest",
    "Box2dTest",
    "Box2dTestBed",
    "EffectAdvancedTest",
    "HiResTest",
    "Accelerometer",
    "KeypadTest",
    "CocosDenshionTest",
    "PerformanceTest",
    "ZwoptexTest",
    "CurlTest",
    "UserDefaultTest",
    "DirectorTest",
    "BugsTest",
    "FontTest",
    "CurrentLanguageTest",
    "TextureCacheTest",
    "ExtensionsTest"
];
var TEST = {
    ACTIONS:0,
    TRANSITIONS:1,
    PROGRESS_ACTIONS:2,
    EFFECTS:3,
    CLICK_AND_MOVE:4,
    ROTATE_WORLD:5,
    PARTICLE:6,
    EASE_ACTIONS:7,
    MOTION_STREAK:8,
    DRAW_PRIMITIVES:9,
    COCOSNODE:10,
    TOUCHES:11,
    MENU:12,
    ACTION_MANAGER:13,
    LAYER:14,
    SCENE:15,
    PARALLAX:16,
    TILE_MAP:17,
    INTERVAL:18,
    CHIPMUNK:19,
    LABEL:20,
    TEXT_INPUT:21,
    SPRITE:22,
    SCHEDULER:23,
    RENDERTEXTURE:24,
    TEXTURE2D:25,
    BOX2D:26,
    BOX2DBED:27,
    EFFECT_ADVANCE:28,
    HIRES:29,
    ACCELEROMRTER:30,
    KEYPAD:31,
    COCOSDENSHION:32,
    PERFORMANCE:33,
    ZWOPTEX:34,
    CURL:35,
    USERDEFAULT:36,
    DIRECTOR:37,
    BUGS:38,
    FONTS:39,
    CURRENT_LANGUAGE:40,
    TEXTURECACHE:41,
    EXTENSIONS:42
};