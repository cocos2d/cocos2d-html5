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
var s_pPathClose = null;

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
        var i = 0;
        for(var text in g_aTestNames)
        {
            var label = cc.LabelTTF.labelWithString(text, "Arial", 24);
            var pMenuItem = cc.MenuItemLabel.itemWithLabel(label, this, this.menuCallback);
            pMenuItem.id(text);
            this._m_pItemMenu.addChild(pMenuItem);
            pMenuItem.setPosition(s.width/2, (s.height - (i+1)*LINE_SPACE));
            i++;
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
        var nIdx = pSender.target.id;

        // create the test scene and run it
        var pScene = new window[g_aTestNames[nIdx]]();
        if (pScene)
        {
            pScene.runThisTest();
        }
    },
    closeCallback: function(){
        history.go(-1);
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

var g_aTestNames = {
    /*
    "ActionsTest":"ActionsTestScene",
    "TransitionsTest":"TransitionsTestScene",
    "ProgressActionsTest":"ProgressActionsTestScene",
    "EffectsTest":"EffectTestScene",
    "ClickAndMoveTest":"ClickAndMoveTestScene",
    "RotateWorldTest":"RotateWorldTestScene",
    "ParticleTest":"ParticleTestScene",
    "EaseActionsTest":"EaseActionsTestScene",
    "MotionStreakTest":"MotionStreakTestScene",
    "DrawPrimitivesTest":"DrawPrimitivesTestScene",
    "CocosNodeTest":"CocosNodeTestScene",
     */
    "TouchesTest":"PongScene",
    /*
    "MenuTest":"MenuTestScene",
    "ActionManagerTest":"ActionManagerTestScene",
    "LayerTest":"LayerTestScene",
    "SceneTest":"SceneTestScene",
    "ParallaxTest":"ParallaxTestScene",
    "TileMapTest":"TileMapTestScene",
    "IntervalTest":"IntervalTestScene",
    "ChipmunkTest":"ChipmunkTestScene",
    "LabelTest":"AtlasTestScene",
    "TextInputTest":"TextInputTestScene",
    "SpriteTest":"SpriteTestScene",
    */
    "SchdulerTest":"SchedulerTestScene",
    "RenderTextureTest":"RenderTextureScene",
    "Texture2DTest":"TextureTestScene",
    "Box2dTest":"Box2DTestScene",
    "Box2dTestBed":"Box2dTestBedScene",
    "EffectAdvancedTest":"EffectAdvanceScene",
    "HiResTest":"HiResTestScene",
    "Accelerometer":"AccelerometerTestScene",
    "KeypadTest":"KeypadTestScene",
    "CocosDenshionTest":"CocosDenshionTestScene",
    "PerformanceTest":"PerformanceTestScene",
    "ZwoptexTest":"ZwoptexTestScene",
    "CurlTest":"CurlTestScene",
    "UserDefaultTest":"UserDefaultTestScene",
    "DirectorTest":"DirectorTestScene",
    "BugsTest":"BugsTestScene",
    "FontTest":"FontTestScene",
    "CurrentLanguageTest":"CurrentLanguageTestScene",
    "TextureCacheTest":"TextureCacheTestScene",
    "ExtensionsTest":"ExtensionsTestScene"
};