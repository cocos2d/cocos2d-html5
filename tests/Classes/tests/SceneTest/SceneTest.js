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

var MID_PUSHSCENE = 100;
var MID_PUSHSCENETRAN = 101;
var MID_QUIT = 102;
var MID_REPLACESCENE = 103;
var MID_REPLACESCENETRAN = 104;
var MID_GOBACK = 105;

SceneTestLayer1 = cc.Layer.extend({

    ctor:function () {

        var s = cc.Director.sharedDirector().getWinSize();

        var item1 = cc.MenuItemLabel.itemWithLabel(cc.LabelTTF.labelWithString("Test pushScene", "Arial", 24), this, this.onPushScene);
        var item2 = cc.MenuItemLabel.itemWithLabel(cc.LabelTTF.labelWithString("Test pushScene w/transition", "Arial", 24), this, this.onPushSceneTran);
        var item3 = cc.MenuItemLabel.itemWithLabel(cc.LabelTTF.labelWithString("Quit", "Arial", 24), this, this.onQuit);

        var menu = cc.Menu.menuWithItems(item1, item2, item3, null);
        item1.setPosition(s.width / 2, (s.height / 2 + 40));
        item2.setPosition(s.width / 2, (s.height / 2));
        item3.setPosition(s.width / 2, (s.height / 2 - 40));
        //menu.alignItemsVertically();
        this.addChild(menu);

        var sprite = cc.Sprite.spriteWithFile(s_pPathGrossini);
        this.addChild(sprite);
        sprite.setPosition(cc.PointMake(s.width - 40, s.height / 2));
        var rotate = cc.RotateBy.actionWithDuration(2, 360);
        var repeat = cc.RepeatForever.actionWithAction(rotate);
        sprite.runAction(repeat);

        //cc.schedule(this.testDealloc);
    },


    onEnter:function () {
        cc.LOG("SceneTestLayer1#onEnter");
        this._super();
    },

    onEnterTransitionDidFinish:function () {
        cc.LOG("SceneTestLayer1#onEnterTransitionDidFinish");
        this._super();
    },

    testDealloc:function (dt) {
        //cc.LOG("SceneTestLayer1:testDealloc");
    },

    onPushScene:function (pSender) {
        var scene = new SceneTestScene();
        var pLayer = new SceneTestLayer2();
        scene.addChild(pLayer, 0);
        cc.Director.sharedDirector().pushScene(scene);
    },

    onPushSceneTran:function (pSender) {
        var scene = new SceneTestScene();
        var pLayer = new SceneTestLayer2();
        scene.addChild(pLayer, 0);

        cc.Director.sharedDirector().pushScene(cc.TransitionSlideInT.transitionWithDuration(1, scene));
    },
    onQuit:function (pSender) {

    }

    //CREATE_NODE(SceneTestLayer1);
});

SceneTestLayer2 = cc.Layer.extend({

    m_timeCounter:0,

    ctor:function () {
        this.m_timeCounter = 0;

        var s = cc.Director.sharedDirector().getWinSize();

        var item1 = cc.MenuItemLabel.itemWithLabel(cc.LabelTTF.labelWithString("replaceScene", "Arial", 24), this, this.onReplaceScene);
        var item2 = cc.MenuItemLabel.itemWithLabel(cc.LabelTTF.labelWithString("replaceScene w/transition", "Arial", 24), this, this.onReplaceSceneTran);
        var item3 = cc.MenuItemLabel.itemWithLabel(cc.LabelTTF.labelWithString("Go Back", "Arial", 24), this, this.onGoBack);

        var menu = cc.Menu.menuWithItems(item1, item2, item3, null);
        //menu.alignItemsVertically();
        item1.setPosition(s.width / 2, (s.height / 2 + 40));
        item2.setPosition(s.width / 2, (s.height / 2));
        item3.setPosition(s.width / 2, (s.height / 2 - 40));
        this.addChild(menu);

        var sprite = cc.Sprite.spriteWithFile(s_pPathGrossini);
        this.addChild(sprite);

        sprite.setPosition(cc.PointMake(s.width - 40, s.height / 2));
        var rotate = cc.RotateBy.actionWithDuration(2, 360);
        var repeat = cc.RepeatForever.actionWithAction(rotate);
        sprite.runAction(repeat);

        //cc.schedule(this.testDealloc);


    },

    testDealloc:function (dt) {

    },

    onGoBack:function (pSender) {
        cc.Director.sharedDirector().popScene();
    },

    onReplaceScene:function (pSender) {
        var pScene = new SceneTestScene();
        var pLayer = new SceneTestLayer3();
        pScene.addChild(pLayer, 0);
        cc.Director.sharedDirector().replaceScene(pScene);

    },

    onReplaceSceneTran:function (pSender) {
        var pScene = new SceneTestScene();
        var pLayer = new SceneTestLayer3();
        pScene.addChild(pLayer, 0);
        cc.Director.sharedDirector().replaceScene(cc.TransitionSlideInT.transitionWithDuration(2, pScene));

    }

    //CREATE_NODE(SceneTestLayer2);
});

SceneTestLayer3 = cc.LayerColor.extend({


    ctor:function () {
        this.setIsTouchEnabled(true);
        var label = cc.LabelTTF.labelWithString("Touch to popScene", "Arial", 28);
        this.addChild(label);
        var s = cc.Director.sharedDirector().getWinSize();
        label.setPosition(cc.PointMake(s.width / 2, s.height / 2));

        var sprite = cc.Sprite.spriteWithFile(s_pPathGrossini);
        this.addChild(sprite);

        sprite.setPosition(cc.PointMake(s.width - 40, s.height / 2));
        var rotate = cc.RotateBy.actionWithDuration(2, 360);
        var repeat = cc.RepeatForever.actionWithAction(rotate);
        sprite.runAction(repeat);


    },

    testDealloc:function (dt) {

    },

    ccTouchesEnded:function (touches, event) {
        cc.Director.sharedDirector().popScene();
    }

    //CREATE_NODE(SceneTestLayer3);
});

SceneTestScene = TestScene.extend({

    runThisTest:function () {
        var pLayer = new SceneTestLayer1();
        this.addChild(pLayer);

        cc.Director.sharedDirector().replaceScene(this);

    }
});
