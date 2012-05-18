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

var kTagNode = 5560;
var kTagGrossini = 5561;
var kTagSequence = 5562;

var sceneIdx = -1;
var MAX_LAYER = 5;

var nextActionManagerAction = function () {
    sceneIdx++;
    sceneIdx = sceneIdx % MAX_LAYER;

    return createActionManagerLayer(sceneIdx);
};
var backActionManagerAction = function () {
    sceneIdx--;
    if (sceneIdx < 0)
        sceneIdx += MAX_LAYER;

    return createActionManagerLayer(sceneIdx);
};
var restartActionManagerAction = function () {
    return createActionManagerLayer(sceneIdx);
};

var createActionManagerLayer = function (nIndex) {
    switch (nIndex) {
        case 0:
            return new CrashTest();
        case 1:
            return new LogicTest();
        case 2:
            return new PauseTest();
        case 3:
            return new RemoveTest();
        case 4:
            return new ResumeTest();
    }

    return null;
};

//------------------------------------------------------------------
//
// ActionManagerTest
//
//------------------------------------------------------------------
var ActionManagerTest = cc.Layer.extend({
    _m_atlas:null,
    _m_strTitle:"",

    ctor:function () {
        this._super();
    },
    title:function () {
        return "No title";
    },
    onEnter:function () {
        this._super();

        var s = cc.Director.sharedDirector().getWinSize();

        var label = cc.LabelTTF.labelWithString(this.title(), "Arial", 32);
        this.addChild(label, 1);
        label.setPosition(cc.PointMake(s.width / 2, s.height - 50));

        var item1 = cc.MenuItemImage.itemFromNormalImage(s_pPathB1, s_pPathB2, this, this.backCallback);
        var item2 = cc.MenuItemImage.itemFromNormalImage(s_pPathR1, s_pPathR2, this, this.restartCallback);
        var item3 = cc.MenuItemImage.itemFromNormalImage(s_pPathF1, s_pPathF2, this, this.nextCallback);

        var menu = cc.Menu.menuWithItems(item1, item2, item3);

        menu.setPosition(cc.PointZero());
        item1.setPosition(cc.PointMake(s.width / 2 - 100, 30));
        item2.setPosition(cc.PointMake(s.width / 2, 30));
        item3.setPosition(cc.PointMake(s.width / 2 + 100, 30));

        this.addChild(menu, 1);
    },

    restartCallback:function (pSender) {
        var s = new ActionManagerTestScene();
        s.addChild(restartActionManagerAction());
        cc.Director.sharedDirector().replaceScene(s);
    },
    nextCallback:function (pSender) {
        var s = new ActionManagerTestScene();
        s.addChild(nextActionManagerAction());
        cc.Director.sharedDirector().replaceScene(s);
    },
    backCallback:function (pSender) {
        var s = new ActionManagerTestScene();
        s.addChild(backActionManagerAction());
        cc.Director.sharedDirector().replaceScene(s);
    }
});

//------------------------------------------------------------------
//
// Test1
//
//------------------------------------------------------------------
var CrashTest = ActionManagerTest.extend({
    title:function () {
        return "Test 1. Should not crash";
    },
    onEnter:function () {
        this._super();

        var child = cc.Sprite.spriteWithFile(s_pPathGrossini);
        child.setPosition(cc.PointMake(200, 200));
        this.addChild(child, 1);

        //Sum of all action's duration is 1.5 second.
        child.runAction(cc.RotateBy.actionWithDuration(1.5, 90));
        child.runAction(cc.Sequence.actions(
            cc.DelayTime.actionWithDuration(1.4),
            cc.FadeOut.actionWithDuration(1.1))
        );

        //After 1.5 second, self will be removed.
        this.runAction(cc.Sequence.actions(
            cc.DelayTime.actionWithDuration(1.4),
            cc.CallFunc.actionWithTarget(this, this.removeThis))
        );
    },
    removeThis:function () {
        this._m_pParent.removeChild(this, true);
        this.nextCallback(this);
    }
});

//------------------------------------------------------------------
//
// Test2
//
//------------------------------------------------------------------
var LogicTest = ActionManagerTest.extend({
    title:function () {
        return "Logic test";
    },
    onEnter:function () {
        this._super();

        var grossini = cc.Sprite.spriteWithFile(s_pPathGrossini);
        this.addChild(grossini, 0, 2);
        grossini.setPosition(cc.PointMake(200, 200));

        grossini.runAction(cc.Sequence.actions(
            cc.MoveBy.actionWithDuration(1, cc.PointMake(150, 0)),
            cc.CallFunc.actionWithTarget(this, this.bugMe))
        );
    },
    bugMe:function (node) {
        node.stopAllActions(); //After this stop next action not working, if remove this stop everything is working
        node.runAction(cc.ScaleTo.actionWithDuration(2, 2));
    }
});

//------------------------------------------------------------------
//
// PauseTest
//
//------------------------------------------------------------------
var PauseTest = ActionManagerTest.extend({
    title:function () {
        return "Pause Test";
    },
    onEnter:function () {
        //
        // This test MUST be done in 'onEnter' and not on 'init'
        // otherwise the paused action will be resumed at 'onEnter' time
        //
        this._super();

        var s = cc.Director.sharedDirector().getWinSize();
        var l = cc.LabelTTF.labelWithString("After 5 seconds grossini should move", "Thonburi", 16);
        this.addChild(l);
        l.setPosition(cc.PointMake(s.width / 2, 245));

        //
        // Also, this test MUST be done, after [super onEnter]
        //
        var grossini = cc.Sprite.spriteWithFile(s_pPathGrossini);
        this.addChild(grossini, 0, kTagGrossini);
        grossini.setPosition(cc.PointMake(200, 200));

        var action = cc.MoveBy.actionWithDuration(1, cc.PointMake(150, 0));

        cc.ActionManager.sharedManager().addAction(action, grossini, true);

        this.schedule(this.unpause, 3);
    },
    unpause:function (dt) {
        this.unschedule(this.unpause);
        var node = this.getChildByTag(kTagGrossini);
        cc.ActionManager.sharedManager().resumeTarget(node);
    }
});

//------------------------------------------------------------------
//
// RemoveTest
//
//------------------------------------------------------------------
var RemoveTest = ActionManagerTest.extend({
    title:function () {
        return "Remove Test";
    },
    onEnter:function () {
        this._super();

        var s = cc.Director.sharedDirector().getWinSize();
        var l = cc.LabelTTF.labelWithString("Should not crash", "Thonburi", 16);
        this.addChild(l);
        l.setPosition(cc.PointMake(s.width / 2, 245));

        var pMove = cc.MoveBy.actionWithDuration(2, cc.PointMake(200, 0));
        var pCallback = cc.CallFunc.actionWithTarget(this, this.stopAction);
        var pSequence = cc.Sequence.actions(pMove, pCallback);
        pSequence.setTag(kTagSequence);

        var pChild = cc.Sprite.spriteWithFile(s_pPathGrossini);
        pChild.setPosition(cc.PointMake(200, 200));

        this.addChild(pChild, 1, kTagGrossini);
        pChild.runAction(pSequence);
    },
    stopAction:function () {
        var pSprite = this.getChildByTag(kTagGrossini);
        pSprite.stopActionByTag(kTagSequence);
    }
});

//------------------------------------------------------------------
//
// ResumeTest
//
//------------------------------------------------------------------
var ResumeTest = ActionManagerTest.extend({
    title:function () {
        return "Resume Test";
    },
    onEnter:function () {
        this._super();

        var s = cc.Director.sharedDirector().getWinSize();
        var l = cc.LabelTTF.labelWithString("Grossini only rotate/scale in 3 seconds", "Thonburi", 16);
        this.addChild(l);
        l.setPosition(cc.PointMake(s.width / 2, 245));

        var pGrossini = cc.Sprite.spriteWithFile(s_pPathGrossini);
        this.addChild(pGrossini, 0, kTagGrossini);
        pGrossini.setPosition(cc.PointMake(s.width / 2, s.height / 2));

        pGrossini.runAction(cc.ScaleBy.actionWithDuration(2, 2));

        cc.ActionManager.sharedManager().pauseTarget(pGrossini);
        pGrossini.runAction(cc.RotateBy.actionWithDuration(2, 360));

        this.schedule(this.resumeGrossini, 3.0);
    },
    resumeGrossini:function (time) {
        this.unschedule(this.resumeGrossini);

        var pGrossini = this.getChildByTag(kTagGrossini);
        cc.ActionManager.sharedManager().resumeTarget(pGrossini);
    }
});

var ActionManagerTestScene = TestScene.extend({
    runThisTest:function () {
        sceneIdx = -1;
        MAX_LAYER = 5;
        var pLayer = nextActionManagerAction();
        this.addChild(pLayer);
        cc.Director.sharedDirector().replaceScene(this);
    }
});


