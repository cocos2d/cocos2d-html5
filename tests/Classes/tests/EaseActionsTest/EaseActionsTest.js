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

kTagAction1 = 1;
kTagAction2 = 2;
kTagSlider = 1;

var EaseActionsTests = [
    "SpriteEase",
    "SpriteEaseInOut",
    "SpriteEaseExponential",
    "SpriteEaseExponentialInOut",
    "SpriteEaseSine",
    "SpriteEaseSineInOut",
    "SpriteEaseElastic",
    "SpriteEaseElasticInOut",//reverse bug
    "SpriteEaseBounce",
    "SpriteEaseBounceInOut",
    "SpriteEaseBack",
    "SpriteEaseBackInOut",
    "SpeedTest",
    "SchedulerTest"
];

var s_nEaseActionIdx = -1;
function nextEaseAction() {
    ++s_nEaseActionIdx;
    s_nEaseActionIdx = s_nEaseActionIdx % EaseActionsTests.length;
    return new window[EaseActionsTests[s_nEaseActionIdx]];
}
function backEaseAction() {
    --s_nEaseActionIdx;
    if (s_nEaseActionIdx < 0) {
        s_nEaseActionIdx += EaseActionsTests.length;
    }
    return new window[EaseActionsTests[s_nEaseActionIdx]];
}
function restartEaseAction() {
    return new window[EaseActionsTests[s_nEaseActionIdx]];
}

// the class inherit from TestScene
// every .Scene each test used must inherit from TestScene,
// make sure the test have the menu item for back to main menu
var EaseActionsTestScene = TestScene.extend({
    runThisTest:function () {
        s_nEaseActionIdx = -1;
        this.addChild(nextEaseAction());
        cc.Director.sharedDirector().replaceScene(this);
    }
});


var EaseSpriteDemo = cc.Layer.extend({
    _m_grossini:null,
    _m_tamara:null,
    _m_kathia:null,
    _m_strTitle:null,
    title:function () {
        return "No title";
    },
    onEnter:function () {
        this._super();

        // Or you can create an sprite using a filename. PNG and BMP files are supported. Probably TIFF too
        this._m_grossini = cc.Sprite.spriteWithFile(s_pPathGrossini);
        this._m_tamara = cc.Sprite.spriteWithFile(s_pPathSister1);
        this._m_kathia = cc.Sprite.spriteWithFile(s_pPathSister2);

        this.addChild(this._m_grossini, 3);
        this.addChild(this._m_kathia, 2);
        this.addChild(this._m_tamara, 1);

        var s = cc.Director.sharedDirector().getWinSize();

        this._m_grossini.setPosition(cc.PointMake(60, 50));
        this._m_kathia.setPosition(cc.PointMake(60, 150));
        this._m_tamara.setPosition(cc.PointMake(60, 250));

        var label = cc.LabelTTF.labelWithString(this.title(), "Arial", 32);
        this.addChild(label);
        label.setPosition(cc.PointMake(s.width / 2, s.height - 50));

        var item1 = cc.MenuItemImage.itemFromNormalImage(s_pPathB1, s_pPathB2, this, this.backCallback);
        var item2 = cc.MenuItemImage.itemFromNormalImage(s_pPathR1, s_pPathR2, this, this.restartCallback);
        var item3 = cc.MenuItemImage.itemFromNormalImage(s_pPathF1, s_pPathF2, this, this.nextCallback);

        var menu = cc.Menu.menuWithItems(item1, item2, item3, null);

        menu.setPosition(cc.PointZero());
        item1.setPosition(cc.PointMake(s.width / 2 - 100, 30));
        item2.setPosition(cc.PointMake(s.width / 2, 30));
        item3.setPosition(cc.PointMake(s.width / 2 + 100, 30));

        this.addChild(menu, 1);
    },

    restartCallback:function (pSender) {
        var s = new EaseActionsTestScene();//cc.Scene.node();
        s.addChild(restartEaseAction());
        cc.Director.sharedDirector().replaceScene(s);
    },
    nextCallback:function (pSender) {
        var s = new EaseActionsTestScene();//cc.Scene.node();
        s.addChild(nextEaseAction());
        cc.Director.sharedDirector().replaceScene(s);
    },
    backCallback:function (pSender) {
        var s = new EaseActionsTestScene();//cc.Scene.node();
        s.addChild(backEaseAction());
        cc.Director.sharedDirector().replaceScene(s);
    },
    positionForTwo:function () {
        this._m_grossini.setPosition(cc.PointMake(60, 120));
        this._m_tamara.setPosition(cc.PointMake(60, 220));
        this._m_kathia.setIsVisible(false);
    }
});

//------------------------------------------------------------------
//
// SpriteEase
//
//------------------------------------------------------------------
var SpriteEase = EaseSpriteDemo.extend({

    onEnter:function () {
        this._super();

        var move = cc.MoveBy.actionWithDuration(3, cc.PointMake(350, 0));
        var move_back = move.reverse();

        var move_ease_in = cc.EaseIn.actionWithAction(move.copy(), 3.0);
        var move_ease_in_back = move_ease_in.reverse();

        var move_ease_out = cc.EaseOut.actionWithAction(move.copy(), 3.0);
        var move_ease_out_back = move_ease_out.reverse();


        var seq1 = cc.Sequence.actions(move, move_back, null);
        var seq2 = cc.Sequence.actions(move_ease_in, move_ease_in_back, null);
        var seq3 = cc.Sequence.actions(move_ease_out, move_ease_out_back, null);


        var a2 = this._m_grossini.runAction(cc.RepeatForever.actionWithAction(seq1));
        a2.setTag(1);

        var a1 = this._m_tamara.runAction(cc.RepeatForever.actionWithAction(seq2));
        a1.setTag(1);

        var a = this._m_kathia.runAction(cc.RepeatForever.actionWithAction(seq3));
        a.setTag(1);

        this.schedule(this.testStopAction, 6);
    },
    title:function () {
        return "EaseIn - EaseOut - Stop";
    },

    testStopAction:function (dt) {
        this.unschedule(this.testStopAction);
        this._m_tamara.stopActionByTag(1);
        this._m_kathia.stopActionByTag(1);
        this._m_grossini.stopActionByTag(1);
    }
});

//------------------------------------------------------------------
//
// SpriteEaseInOut
//
//------------------------------------------------------------------
var SpriteEaseInOut = EaseSpriteDemo.extend({

    onEnter:function () {
        this._super();

        var move = cc.MoveBy.actionWithDuration(3, cc.PointMake(350, 0));
        //	id move_back = move.reverse();

        var move_ease_inout1 = cc.EaseInOut.actionWithAction(move.copy(), 2.0);
        var move_ease_inout_back1 = move_ease_inout1.reverse();

        var move_ease_inout2 = cc.EaseInOut.actionWithAction(move.copy(), 3.0);
        var move_ease_inout_back2 = move_ease_inout2.reverse();

        var move_ease_inout3 = cc.EaseInOut.actionWithAction(move.copy(), 4.0);
        var move_ease_inout_back3 = move_ease_inout3.reverse();


        var seq1 = cc.Sequence.actions(move_ease_inout1, move_ease_inout_back1, null);
        var seq2 = cc.Sequence.actions(move_ease_inout2, move_ease_inout_back2, null);
        var seq3 = cc.Sequence.actions(move_ease_inout3, move_ease_inout_back3, null);

        this._m_tamara.runAction(cc.RepeatForever.actionWithAction(seq1));
        this._m_kathia.runAction(cc.RepeatForever.actionWithAction(seq2));
        this._m_grossini.runAction(cc.RepeatForever.actionWithAction(seq3));
    },
    title:function () {
        return "EaseInOut and rates";
    }
});

//------------------------------------------------------------------
//
// SpriteEaseExponential
//
//------------------------------------------------------------------
var SpriteEaseExponential = EaseSpriteDemo.extend({

    onEnter:function () {
        this._super();

        var move = cc.MoveBy.actionWithDuration(3, cc.PointMake(350, 0));
        var move_back = move.reverse();

        var move_ease_in = cc.EaseExponentialIn.actionWithAction(move.copy());
        var move_ease_in_back = move_ease_in.reverse();

        var move_ease_out = cc.EaseExponentialOut.actionWithAction(move.copy());
        var move_ease_out_back = move_ease_out.reverse();


        var seq1 = cc.Sequence.actions(move, move_back, null);
        var seq2 = cc.Sequence.actions(move_ease_in, move_ease_in_back, null);
        var seq3 = cc.Sequence.actions(move_ease_out, move_ease_out_back, null);


        this._m_grossini.runAction(cc.RepeatForever.actionWithAction(seq1));
        this._m_tamara.runAction(cc.RepeatForever.actionWithAction(seq2));
        this._m_kathia.runAction(cc.RepeatForever.actionWithAction(seq3));
    },
    title:function () {
        return "ExpIn - ExpOut actions";
    }
});

//------------------------------------------------------------------
//
// SpriteEaseExponentialInOut
//
//------------------------------------------------------------------
var SpriteEaseExponentialInOut = EaseSpriteDemo.extend({

    onEnter:function () {
        this._super();

        var move = cc.MoveBy.actionWithDuration(3, cc.PointMake(350, 0));
        var move_back = move.reverse();

        var move_ease = cc.EaseExponentialInOut.actionWithAction(move.copy());
        var move_ease_back = move_ease.reverse();	//-. reverse()

        var seq1 = cc.Sequence.actions(move, move_back, null);
        var seq2 = cc.Sequence.actions(move_ease, move_ease_back, null);

        this.positionForTwo();

        this._m_grossini.runAction(cc.RepeatForever.actionWithAction(seq1));
        this._m_tamara.runAction(cc.RepeatForever.actionWithAction(seq2));
    },
    title:function () {
        return "EaseExponentialInOut action";
    }
});

//------------------------------------------------------------------
//
// SpriteEaseSine
//
//------------------------------------------------------------------
var SpriteEaseSine = EaseSpriteDemo.extend({
    onEnter:function () {
        this._super();

        var move = cc.MoveBy.actionWithDuration(3, cc.PointMake(350, 0));
        var move_back = move.reverse();

        var move_ease_in = cc.EaseSineIn.actionWithAction(move.copy());
        var move_ease_in_back = move_ease_in.reverse();

        var move_ease_out = cc.EaseSineOut.actionWithAction(move.copy());
        var move_ease_out_back = move_ease_out.reverse();


        var seq1 = cc.Sequence.actions(move, move_back, null);
        var seq2 = cc.Sequence.actions(move_ease_in, move_ease_in_back, null);
        var seq3 = cc.Sequence.actions(move_ease_out, move_ease_out_back, null);


        this._m_grossini.runAction(cc.RepeatForever.actionWithAction(seq1));
        this._m_tamara.runAction(cc.RepeatForever.actionWithAction(seq2));
        this._m_kathia.runAction(cc.RepeatForever.actionWithAction(seq3));

    },
    title:function () {
        return "EaseSineIn - EaseSineOut";
    }
});

//------------------------------------------------------------------
//
// SpriteEaseSineInOut
//
//------------------------------------------------------------------
var SpriteEaseSineInOut = EaseSpriteDemo.extend({
    onEnter:function () {
        this._super();

        var move = cc.MoveBy.actionWithDuration(3, cc.PointMake(350, 0));
        var move_back = move.reverse();

        var move_ease = cc.EaseSineInOut.actionWithAction(move.copy());
        var move_ease_back = move_ease.reverse();

        var seq1 = cc.Sequence.actions(move, move_back, null);
        var seq2 = cc.Sequence.actions(move_ease, move_ease_back, null);

        this.positionForTwo();

        this._m_grossini.runAction(cc.RepeatForever.actionWithAction(seq1));
        this._m_tamara.runAction(cc.RepeatForever.actionWithAction(seq2));
    },
    title:function () {
        return "EaseSineInOut action";
    }
});

//------------------------------------------------------------------
//
// SpriteEaseElastic
//
//------------------------------------------------------------------
var SpriteEaseElastic = EaseSpriteDemo.extend({
    onEnter:function () {
        this._super();

        var move = cc.MoveBy.actionWithDuration(3, cc.PointMake(350, 0));
        var move_back = move.reverse();

        var move_ease_in = cc.EaseElasticIn.actionWithAction(move.copy());
        var move_ease_in_back = move_ease_in.reverse();

        var move_ease_out = cc.EaseElasticOut.actionWithAction(move.copy());
        var move_ease_out_back = move_ease_out.reverse();

        var seq1 = cc.Sequence.actions(move, move_back, null);
        var seq2 = cc.Sequence.actions(move_ease_in, move_ease_in_back, null);
        var seq3 = cc.Sequence.actions(move_ease_out, move_ease_out_back, null);

        this._m_grossini.runAction(cc.RepeatForever.actionWithAction(seq1));
        this._m_tamara.runAction(cc.RepeatForever.actionWithAction(seq2));
        this._m_kathia.runAction(cc.RepeatForever.actionWithAction(seq3));
    },
    title:function () {
        return "Elastic In - Out actions";
    }
});

//------------------------------------------------------------------
//
// SpriteEaseElasticInOut
//
//------------------------------------------------------------------
var SpriteEaseElasticInOut = EaseSpriteDemo.extend({
    onEnter:function () {
        this._super();

        var move = cc.MoveBy.actionWithDuration(3, cc.PointMake(350, 0));

         var move_ease_inout1 = cc.EaseElasticInOut.actionWithAction(move.copy(), 0.3);
        var move_ease_inout_back1 = move_ease_inout1.reverse();

        var move_ease_inout2 = cc.EaseElasticInOut.actionWithAction(move.copy(), 0.45);
        var move_ease_inout_back2 = move_ease_inout2.reverse();

        var move_ease_inout3 = cc.EaseElasticInOut.actionWithAction(move.copy(), 0.6);
        var move_ease_inout_back3 = move_ease_inout3.reverse();


        var seq1 = cc.Sequence.actions(move_ease_inout1, move_ease_inout_back1, null);
        var seq2 = cc.Sequence.actions(move_ease_inout2, move_ease_inout_back2, null);
        var seq3 = cc.Sequence.actions(move_ease_inout3, move_ease_inout_back3, null);

        this._m_tamara.runAction(cc.RepeatForever.actionWithAction(seq1));
        this._m_kathia.runAction(cc.RepeatForever.actionWithAction(seq2));
        this._m_grossini.runAction(cc.RepeatForever.actionWithAction(seq3));
    },
    title:function () {
        return "EaseElasticInOut action";
    }
});

//------------------------------------------------------------------
//
// SpriteEaseBounce
//
//------------------------------------------------------------------
var SpriteEaseBounce = EaseSpriteDemo.extend({
    onEnter:function () {
        this._super();

        var move = cc.MoveBy.actionWithDuration(3, cc.PointMake(350, 0));
        var move_back = move.reverse();

        var move_ease_in = cc.EaseBounceIn.actionWithAction(move.copy());
        var move_ease_in_back = move_ease_in.reverse();

        var move_ease_out = cc.EaseBounceOut.actionWithAction(move.copy());
        var move_ease_out_back = move_ease_out.reverse();

        var seq1 = cc.Sequence.actions(move, move_back, null);
        var seq2 = cc.Sequence.actions(move_ease_in, move_ease_in_back, null);
        var seq3 = cc.Sequence.actions(move_ease_out, move_ease_out_back, null);

        this._m_grossini.runAction(cc.RepeatForever.actionWithAction(seq1));
        this._m_tamara.runAction(cc.RepeatForever.actionWithAction(seq2));
        this._m_kathia.runAction(cc.RepeatForever.actionWithAction(seq3));
    },
    title:function () {
        return "Bounce In - Out actions";
    }
});

//------------------------------------------------------------------
//
// SpriteEaseBounceInOut
//
//------------------------------------------------------------------
var SpriteEaseBounceInOut = EaseSpriteDemo.extend({
    onEnter:function () {
        this._super();

        var move = cc.MoveBy.actionWithDuration(3, cc.PointMake(350, 0));
        var move_back = move.reverse();

        var move_ease = cc.EaseBounceInOut.actionWithAction(move.copy());
        var move_ease_back = move_ease.reverse();

        var seq1 = cc.Sequence.actions(move, move_back, null);
        var seq2 = cc.Sequence.actions(move_ease, move_ease_back, null);

        this.positionForTwo();

        this._m_grossini.runAction(cc.RepeatForever.actionWithAction(seq1));
        this._m_tamara.runAction(cc.RepeatForever.actionWithAction(seq2));
    },
    title:function () {
        return "EaseBounceInOut action";
    }
});

//------------------------------------------------------------------
//
// SpriteEaseBack
//
//------------------------------------------------------------------
var SpriteEaseBack = EaseSpriteDemo.extend({
    onEnter:function () {
        this._super();

        var move = cc.MoveBy.actionWithDuration(3, cc.PointMake(350, 0));
        var move_back = move.reverse();

        var move_ease_in = cc.EaseBackIn.actionWithAction(move.copy());
        var move_ease_in_back = move_ease_in.reverse();

        var move_ease_out = cc.EaseBackOut.actionWithAction(move.copy());
        var move_ease_out_back = move_ease_out.reverse();

        var seq1 = cc.Sequence.actions(move, move_back, null);
        var seq2 = cc.Sequence.actions(move_ease_in, move_ease_in_back, null);
        var seq3 = cc.Sequence.actions(move_ease_out, move_ease_out_back, null);

        this._m_grossini.runAction(cc.RepeatForever.actionWithAction(seq1));
        this._m_tamara.runAction(cc.RepeatForever.actionWithAction(seq2));
        this._m_kathia.runAction(cc.RepeatForever.actionWithAction(seq3));
    },
    title:function () {
        return "Back In - Out actions";
    }
});

//------------------------------------------------------------------
//
// SpriteEaseBackInOut
//
//------------------------------------------------------------------
var SpriteEaseBackInOut = EaseSpriteDemo.extend({
    onEnter:function () {
        this._super();

        var move = cc.MoveBy.actionWithDuration(3, cc.PointMake(350, 0));
        var move_back = move.reverse();

        var move_ease = cc.EaseBackInOut.actionWithAction(move.copy());
        var move_ease_back = move_ease.reverse();

        var seq1 = cc.Sequence.actions(move, move_back, null);
        var seq2 = cc.Sequence.actions(move_ease, move_ease_back, null);

        this.positionForTwo();

        this._m_grossini.runAction(cc.RepeatForever.actionWithAction(seq1));
        this._m_tamara.runAction(cc.RepeatForever.actionWithAction(seq2));
    },
    title:function () {
        return "EaseBackInOut action";
    }
});

var SpeedTest = EaseSpriteDemo.extend({
    onEnter:function () {
        this._super();

        // rotate and jump
        var jump1 = cc.JumpBy.actionWithDuration(4, cc.PointMake(-400, 0), 100, 4);
        var jump2 = jump1.reverse();
        var rot1 = cc.RotateBy.actionWithDuration(4, 360 * 2);
        var rot2 = rot1.reverse();

        var seq3_1 = cc.Sequence.actions(jump2, jump1, null);
        var seq3_2 = cc.Sequence.actions(rot1, rot2, null);
        var spawn = cc.Spawn.actions(seq3_1, seq3_2, null);
        var action = cc.Speed.actionWithAction(cc.RepeatForever.actionWithAction(spawn), 1.0);
        action.setTag(kTagAction1);

        var action2 = action.copy();
        var action3 = action.copy();

        action2.setTag(kTagAction1);
        action3.setTag(kTagAction1);

        this._m_grossini.runAction(action2);
        this._m_tamara.runAction(action3);
        this._m_kathia.runAction(action);

        this.schedule(this.altertime, 1.0);//:@selector(altertime:) interval:1.0];
    },
    title:function () {
        return "Speed action";
    },

    altertime:function (dt) {
        var action1 = this._m_grossini.getActionByTag(kTagAction1);
        var action2 = this._m_tamara.getActionByTag(kTagAction1);
        var action3 = this._m_kathia.getActionByTag(kTagAction1);

        action1.setSpeed(cc.RANDOM_0_1() * 2);
        action2.setSpeed(cc.RANDOM_0_1() * 2);
        action3.setSpeed(cc.RANDOM_0_1() * 2);
    }
});

//------------------------------------------------------------------
//
// SchedulerTest
//
//------------------------------------------------------------------
var SchedulerTest = EaseSpriteDemo.extend({
    onEnter:function () {
        this._super();

        // rotate and jump
        var jump1 = cc.JumpBy.actionWithDuration(4, cc.PointMake(-400, 0), 100, 4);
        var jump2 = jump1.reverse();
        var rot1 = cc.RotateBy.actionWithDuration(4, 360 * 2);
        var rot2 = rot1.reverse();

        var seq3_1 = cc.Sequence.actions(jump2, jump1, null);
        var seq3_2 = cc.Sequence.actions(rot1, rot2, null);
        var spawn = cc.Spawn.actions(seq3_1, seq3_2, null);
        var action = cc.RepeatForever.actionWithAction(spawn);

        var action2 = action.copy();
        var action3 = action.copy();

        this._m_grossini.runAction(cc.Speed.actionWithAction(action, 0.5));
        this._m_tamara.runAction(cc.Speed.actionWithAction(action2, 1.5));
        this._m_kathia.runAction(cc.Speed.actionWithAction(action3, 1.0));

        var emitter = new cc.ParticleFireworks();
        emitter.initWithTotalParticles(250);
        emitter.setTexture(cc.TextureCache.sharedTextureCache().addImage("Resources/Images/fire.png"));
        this.addChild(emitter);
    },
    title:function () {
        return "Scheduler scaleTime Test";
    }
});