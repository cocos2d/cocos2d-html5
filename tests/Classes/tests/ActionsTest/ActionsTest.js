/****************************************************************************
 Copyright (c) 2010-2012 cocos2d-x.org
 Copyright (c) 2008-2010 Ricardo Quesada
 Copyright (c) 2011      Zynga Inc.

 http://www.cocos2d-x.org

 Created by JetBrains WebStorm.
 User: wuhao
 Date: 12-4-10

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


var actionTests = [
    "ActionManual", //ok
    "ActionMove", //OK
    "ActionScale", //OK
    "ActionRotate", //OK
    "ActionSkew", //OK, Not in cocos2d-js
    "ActionSkewRotateScale", //ok
    "ActionJump", //OK
    "ActionBezier", //Buggy?
    "ActionBlink", //OK
    "ActionFade", //OK
    "ActionTint", //ok
    "ActionSequence", //OK
    "ActionSequence2", //OK
    "ActionSpawn", //OK
    "ActionReverse",
    "ActionDelayTime", //OK
    "ActionRepeat", //OK
    "ActionRepeatForever", //OK
    "ActionRotateToRepeat", //ok
    "ActionRotateJerk", //ok
    "ActionCallFunc", //OK
    "ActionCallFuncND", //OK (cocos2d-X c+ bug/incomplete)
    "ActionReverseSequence", //OK
    "ActionReverseSequence2", //OK, Bug in Cocos2d-X implementation of FiniteTimeAction.reverse()
    //"ActionOrbit",//Not possible in canvas, requires sprite camera
    //"ActionFollow",//Buggy
    "ActionAnimate"//Require Texture2d Implementation
];
var s_nActionIdx = -1;
function NextAction() {
    ++s_nActionIdx;
    s_nActionIdx = s_nActionIdx % actionTests.length;
    console.log(actionTests[s_nActionIdx]);
    return new window[actionTests[s_nActionIdx]];
}
function BackAction() {
    --s_nActionIdx;
    if (s_nActionIdx < 0) {
        s_nActionIdx += actionTests.length;
    }
    return new window[actionTests[s_nActionIdx]];
}
function RestartAction() {
    return new window[actionTests[s_nActionIdx]];
}

// the class inherit from TestScene
// every Scene each test used must inherit from TestScene,
// make sure the test have the menu item for back to main menu
var ActionsTestScene = TestScene.extend({
    runThisTest:function () {
        s_nActionIdx = -1;
        this.addChild(NextAction());
        cc.Director.sharedDirector().replaceScene(this);
    }
});


var ActionsDemo = cc.Layer.extend({
    _m_grossini:null,
    _m_tamara:null,
    m_kathia:null,
    centerSprites:function (numberOfSprites) {
        var s = cc.Director.sharedDirector().getWinSize();

        if (numberOfSprites == 1) {
            this._m_tamara.setIsVisible(false);
            this._m_kathia.setIsVisible(false);
            this._m_grossini.setPosition(cc.PointMake(s.width / 2, s.height / 2));
        }
        else if (numberOfSprites == 2) {
            this._m_kathia.setPosition(cc.PointMake(s.width / 3, s.height / 2));
            this._m_tamara.setPosition(cc.PointMake(2 * s.width / 3, s.height / 2));
            this._m_grossini.setIsVisible(false);
        }
        else if (numberOfSprites == 3) {
            this._m_grossini.setPosition(cc.PointMake(s.width / 2, s.height / 2));
            this._m_tamara.setPosition(cc.PointMake(s.width / 4, s.height / 2));
            this._m_kathia.setPosition(cc.PointMake(3 * s.width / 4, s.height / 2));
        }
    },
    alignSpritesLeft:function (numberOfSprites) {
        var s = cc.Director.sharedDirector().getWinSize();

        if (numberOfSprites == 1) {
            this._m_tamara.setIsVisible(false);
            this._m_kathia.setIsVisible(false);
            this._m_grossini.setPosition(cc.PointMake(60, s.height / 2));
        }
        else if (numberOfSprites == 2) {
            this._m_kathia.setPosition(cc.PointMake(60, s.height / 3));
            this._m_tamara.setPosition(cc.PointMake(60, 2 * s.height / 3));
            this._m_grossini.setIsVisible(false);
        }
        else if (numberOfSprites == 3) {
            this._m_grossini.setPosition(cc.PointMake(60, s.height / 2));
            this._m_tamara.setPosition(cc.PointMake(60, 2 * s.height / 3));
            this._m_kathia.setPosition(cc.PointMake(60, s.height / 3));
        }
    },
    title:function () {
        return "ActionsTest";
    },
    subtitle:function () {
        return "";
    },
    restartCallback:function (pSender) {
        var s = new ActionsTestScene();
        s.addChild(RestartAction());
        cc.Director.sharedDirector().replaceScene(s);
    },
    nextCallback:function (pSender) {
        var s = new ActionsTestScene();
        s.addChild(NextAction());
        cc.Director.sharedDirector().replaceScene(s);
    },
    backCallback:function (pSender) {
        var s = new ActionsTestScene();
        s.addChild(BackAction());
        cc.Director.sharedDirector().replaceScene(s);
    },
    onEnter:function () {
        this._super();
        this._m_grossini = cc.Sprite.spriteWithFile(s_pPathGrossini);
        this._m_tamara = cc.Sprite.spriteWithFile(s_pPathSister1);
        this._m_kathia = cc.Sprite.spriteWithFile(s_pPathSister2);
        this.addChild(this._m_grossini, 1);
        this.addChild(this._m_tamara, 2);
        this.addChild(this._m_kathia, 3);
        var s = cc.Director.sharedDirector().getWinSize();
        this._m_grossini.setPosition(cc.PointMake(s.width / 2, s.height / 3));
        this._m_tamara.setPosition(cc.PointMake(s.width / 2, 2 * s.height / 3));
        this._m_kathia.setPosition(cc.PointMake(s.width / 2, s.height / 2));

        // add title and subtitle
        var pTitle = this.title();
        var label = cc.LabelTTF.labelWithString(pTitle, "Arial", 18);
        this.addChild(label, 1);
        label.setPosition(cc.PointMake(s.width / 2, s.height - 30));

        var strSubtitle = this.subtitle();
        if (strSubtitle) {
            var l = cc.LabelTTF.labelWithString(strSubtitle, "Thonburi", 22);
            this.addChild(l, 1);
            l.setPosition(cc.PointMake(s.width / 2, s.height - 60));
        }

        // add menu
        var item1 = cc.MenuItemImage.itemFromNormalImage(s_pPathB1, s_pPathB2, this, this.backCallback);
        var item2 = cc.MenuItemImage.itemFromNormalImage(s_pPathR1, s_pPathR2, this, this.restartCallback);
        var item3 = cc.MenuItemImage.itemFromNormalImage(s_pPathF1, s_pPathF2, this, this.nextCallback);

        var menu = cc.Menu.menuWithItems(item1, item2, item3, null);

        menu.setPosition(cc.PointZero());
        item1.setPosition(cc.PointMake(s.width / 2 - 100, 30));
        item2.setPosition(cc.PointMake(s.width / 2, 30));
        item3.setPosition(cc.PointMake(s.width / 2 + 100, 30));

        this.addChild(menu, 1);
    }
});

//------------------------------------------------------------------
//
// ActionManual
//
//------------------------------------------------------------------
var ActionManual = ActionsDemo.extend({
    onEnter:function () {
        this._super();

        var s = cc.Director.sharedDirector().getWinSize();

        this._m_tamara.setScaleX(2.5);
        //window.tam = this._m_tamara;
        this._m_tamara.setScaleY(-1.0);
        this._m_tamara.setPosition(cc.PointMake(100, 70));
        this._m_tamara.setOpacity(128);

        this._m_grossini.setRotation(120);
        this._m_grossini.setPosition(cc.PointMake(s.width / 2, s.height / 2));
        this._m_grossini.setColor(cc.ccc3(255, 0, 0));

        this._m_kathia.setPosition(cc.PointMake(s.width - 100, s.height / 2));
        this._m_kathia.setColor(cc.BLUE());
    },
    subtitle:function () {
        return "Manual Transformation";
    }
});


//------------------------------------------------------------------
//
//	ActionMove
//
//------------------------------------------------------------------
var ActionMove = ActionsDemo.extend({
    onEnter:function () {
        this._super();

        this.centerSprites(3);
        var s = cc.Director.sharedDirector().getWinSize();

        var actionTo = cc.MoveTo.actionWithDuration(2, cc.PointMake(s.width - 40, s.height - 40));

        var actionBy = cc.MoveBy.actionWithDuration(2, cc.PointMake(80, 80));
        var actionByBack = actionBy.reverse();

        this._m_tamara.runAction(actionTo);
        this._m_grossini.runAction(cc.Sequence.actions(actionBy, actionByBack));
        this._m_kathia.runAction(cc.MoveTo.actionWithDuration(1, cc.PointMake(40, 40)));
    },
    subtitle:function () {
        return "MoveTo / MoveBy";
    }
});

//------------------------------------------------------------------
//
// ActionScale
//
//------------------------------------------------------------------
var ActionScale = ActionsDemo.extend({
    onEnter:function () {
        this._super();

        this.centerSprites(3);

        var actionTo = cc.ScaleTo.actionWithDuration(2, 0.5);
        var actionBy = cc.ScaleBy.actionWithDuration(2, 2);
        var actionBy2 = cc.ScaleBy.actionWithDuration(2, 0.25, 4.5);
        var actionByBack = actionBy.reverse();
        var actionBy2Back = actionBy2.reverse();

        this._m_tamara.runAction(actionTo);
        this._m_kathia.runAction(cc.Sequence.actions(actionBy2, actionBy2Back));
        this._m_grossini.runAction(cc.Sequence.actions(actionBy, actionByBack, null));

    },
    subtitle:function () {
        return "ScaleTo / ScaleBy";
    }
});

//------------------------------------------------------------------
//
//	ActionSkew
//
//------------------------------------------------------------------
var ActionSkew = ActionsDemo.extend({
    onEnter:function () {
        this._super();
        this.centerSprites(3);
        var actionTo = cc.SkewTo.actionWithDuration(2, 37.2, -37.2);
        var actionToBack = cc.SkewTo.actionWithDuration(2, 0, 0);
        var actionBy = cc.SkewBy.actionWithDuration(2, 0, -90);
        var actionBy2 = cc.SkewBy.actionWithDuration(2, 45.0, 45.0);
        var actionByBack = actionBy.reverse();
        var actionBy2Back = actionBy2.reverse();


        this._m_tamara.runAction(cc.Sequence.actions(actionTo, actionToBack, null));
        this._m_grossini.runAction(cc.Sequence.actions(actionBy, actionByBack, null));

        this._m_kathia.runAction(cc.Sequence.actions(actionBy2, actionBy2Back, null));


    },
    subtitle:function () {
        return "SkewTo / SkewBy";
    }
});

var ActionSkewRotateScale = ActionsDemo.extend({
    onEnter:function () {
        this._super();
        this._m_tamara.removeFromParentAndCleanup(true);
        this._m_grossini.removeFromParentAndCleanup(true);
        this._m_kathia.removeFromParentAndCleanup(true);

        var winSize = cc.Director.sharedDirector().getWinSize();

        var boxSize = cc.SizeMake(100.0, 100.0);
        var box = cc.LayerColor.layerWithColor(cc.ccc4(255, 255, 0, 255));
        box.setAnchorPoint(cc.ccp(0, 0));
        box.setPosition(new cc.Point((winSize.width - boxSize.width) /2, (winSize.height - boxSize.height) /2));
        box.setContentSize(boxSize);

        var markrside = 10.0;
        var uL = cc.LayerColor.layerWithColor(cc.ccc4(255, 0, 0, 255));
        box.addChild(uL);
        uL.setContentSize(cc.SizeMake(markrside, markrside));
        uL.setPosition(cc.ccp(0, boxSize.height - markrside));
        uL.setAnchorPoint(cc.ccp(0, 0));

        var uR = cc.LayerColor.layerWithColor(cc.ccc4(0, 0, 255, 255));
        box.addChild(uR);
        uR.setContentSize(cc.SizeMake(markrside, markrside));
        uR.setPosition(cc.ccp(boxSize.width - markrside, boxSize.height - markrside));
        uR.setAnchorPoint(cc.ccp(0, 0));


        this.addChild(box);
        var actionTo = cc.SkewTo.actionWithDuration(2, 0., 2.);
        var rotateTo = cc.RotateTo.actionWithDuration(2, 61.0);
        var actionScaleTo = cc.ScaleTo.actionWithDuration(2, -0.44, 0.47);

        var actionScaleToBack = cc.ScaleTo.actionWithDuration(2, 1.0, 1.0);
        var rotateToBack = cc.RotateTo.actionWithDuration(2, 0);
        var actionToBack = cc.SkewTo.actionWithDuration(2, 0, 0);

        box.runAction(cc.Sequence.actions(actionTo, actionToBack, null));
        box.runAction(cc.Sequence.actions(rotateTo, rotateToBack, null));
        box.runAction(cc.Sequence.actions(actionScaleTo, actionScaleToBack, null));
    },
    subtitle:function () {
        return "Skew + Rotate + Scale";
    }
});

//------------------------------------------------------------------
//
//	ActionRotate
//
//------------------------------------------------------------------
var ActionRotate = ActionsDemo.extend({
    onEnter:function () {
        this._super();
        this.centerSprites(3);
        var actionTo = cc.RotateTo.actionWithDuration(2, 45);
        var actionTo2 = cc.RotateTo.actionWithDuration(2, -45);
        var actionTo0 = cc.RotateTo.actionWithDuration(2, 0);
        this._m_tamara.runAction(cc.Sequence.actions(actionTo, actionTo0, null));

        var actionBy = cc.RotateBy.actionWithDuration(2, 360);
        var actionByBack = actionBy.reverse();
        this._m_grossini.runAction(cc.Sequence.actions(actionBy, actionByBack, null));

        this._m_kathia.runAction(cc.Sequence.actions(actionTo2, actionTo0.copy(), null));

    },
    subtitle:function () {
        return "RotateTo / RotateBy";
    }
});


//------------------------------------------------------------------
//
// ActionJump
//
//------------------------------------------------------------------
var ActionJump = ActionsDemo.extend({
    onEnter:function () {
        this._super();
        this.centerSprites(3);

        var actionTo = cc.JumpTo.actionWithDuration(2, cc.PointMake(300, 300), 50, 4);
        var actionBy = cc.JumpBy.actionWithDuration(2, cc.PointMake(300, 0), 50, 4);
        var actionUp = cc.JumpBy.actionWithDuration(2, cc.PointMake(0, 0), 80, 4);
        var actionByBack = actionBy.reverse();

        this._m_tamara.runAction(actionTo);
        this._m_grossini.runAction(cc.Sequence.actions(actionBy, actionByBack, null));
        this._m_kathia.runAction(cc.RepeatForever.actionWithAction(actionUp));

    },
    subtitle:function () {
        return "JumpTo / JumpBy";
    }
});
//------------------------------------------------------------------
//
// ActionBezier
//
//------------------------------------------------------------------
var ActionBezier = ActionsDemo.extend({
    onEnter:function () {
        this._super();
        var s = cc.Director.sharedDirector().getWinSize();

        //
        // startPosition can be any coordinate, but since the movement
        // is relative to the Bezier curve, make it (0,0)
        //

        this.centerSprites(3);

        // sprite 1
        var bezier = new cc.BezierConfig();
        bezier.controlPoint_1 = cc.PointMake(0, s.height / 2);
        bezier.controlPoint_2 = cc.PointMake(300, -s.height / 2);
        bezier.endPosition = cc.PointMake(300, 100);

        var bezierForward = cc.BezierBy.actionWithDuration(3, bezier);
        var bezierBack = bezierForward.reverse();
        var rep = cc.RepeatForever.actionWithAction(cc.Sequence.actions(bezierForward, bezierBack, null));


        // sprite 2
        this._m_tamara.setPosition(cc.PointMake(80, 160));
        var bezier2 = new cc.BezierConfig();
        bezier2.controlPoint_1 = cc.PointMake(100, s.height / 2);
        bezier2.controlPoint_2 = cc.PointMake(200, -s.height / 2);
        bezier2.endPosition = cc.PointMake(240, 160);

        var bezierTo1 = cc.BezierTo.actionWithDuration(2, bezier2);

        // sprite 3
        this._m_kathia.setPosition(cc.PointMake(400, 160));
        var bezierTo2 = cc.BezierTo.actionWithDuration(2, bezier2);

        this._m_grossini.id = "gro";
        this._m_tamara.id = "tam";
        this._m_kathia.id = "kat";

        this._m_grossini.runAction(rep);
        this._m_tamara.runAction(bezierTo1);
        this._m_kathia.runAction(bezierTo2);

    },
    subtitle:function () {
        return "BezierBy / BezierTo";
    }
});
//------------------------------------------------------------------
//
// ActionBlink
//
//------------------------------------------------------------------
var ActionBlink = ActionsDemo.extend({
    onEnter:function () {
        this._super();
        this.centerSprites(2);

        var action1 = cc.Blink.actionWithDuration(2, 10);
        var action2 = cc.Blink.actionWithDuration(2, 5);

        this._m_tamara.runAction(action1);
        this._m_kathia.runAction(action2);

    },
    subtitle:function () {
        return "Blink";
    }
});
//------------------------------------------------------------------
//
// ActionFade
//
//------------------------------------------------------------------
var ActionFade = ActionsDemo.extend({
    onEnter:function () {
        this._super();
        this.centerSprites(2);
        this._m_tamara.setOpacity(0);
        var action1 = cc.FadeIn.actionWithDuration(1.0);
        var action1Back = action1.reverse();

        var action2 = cc.FadeOut.actionWithDuration(1.0);
        var action2Back = action2.reverse();

        this._m_tamara.runAction(cc.Sequence.actions(action1, action1Back, null));
        this._m_kathia.runAction(cc.Sequence.actions(action2, action2Back, null));


    },
    subtitle:function () {
        return "FadeIn / FadeOut";
    }
});
//------------------------------------------------------------------
//
// ActionTint
//
//------------------------------------------------------------------
var ActionTint = ActionsDemo.extend({
    onEnter:function () {
        this._super();
        this.centerSprites(2);

        var action1 = cc.TintTo.actionWithDuration(2, 255, 0, 255);
        var action2 = cc.TintBy.actionWithDuration(2, -127, -255, -127);
        var action2Back = action2.reverse();

        this._m_tamara.runAction(action1);
        this._m_kathia.runAction(cc.Sequence.actions(action2, action2Back));

    },
    subtitle:function () {
        return "TintTo / TintBy";
    }
});

//------------------------------------------------------------------
//
// ActionAnimate
//
//------------------------------------------------------------------
var ActionAnimate = ActionsDemo.extend({
    onEnter:function () {
        this._super();
        this.centerSprites(1);

        var animation = cc.Animation.animation();
        var frameName = "";
        var format;
        for (var i = 1; i < 15; i++) {
            format = (i < 10) ? "0" + i : "" + i;
            frameName = "Resources/Images/grossini_dance_" + format + ".png";
            animation.addFrameWithFileName(frameName);
        }

        var action = cc.Animate.actionWithDuration(3, animation, false);
        var action_back = action.reverse();

        this._m_grossini.runAction(cc.Sequence.actions(action, action_back, null));

    },
    subtitle:function () {
        return "Animation";
    }
});
//------------------------------------------------------------------
//
//	ActionSequence
//
//------------------------------------------------------------------
var ActionSequence = ActionsDemo.extend({
    onEnter:function () {
        this._super();
        this.alignSpritesLeft(1);

        var action = cc.Sequence.actions(
            cc.MoveBy.actionWithDuration(2, cc.PointMake(240, 0)),
            cc.RotateBy.actionWithDuration(2, 540),
            null);

        this._m_grossini.runAction(action);

    },
    subtitle:function () {
        return "Sequence: Move + Rotate";
    }
});
//------------------------------------------------------------------
//
//	ActionSequence2
//
//------------------------------------------------------------------
var ActionSequence2 = ActionsDemo.extend({
    onEnter:function () {
        this._super();
        this.centerSprites(1);
        this._m_grossini.setIsVisible(false);
        var action = cc.Sequence.actions(
            cc.Place.actionWithPosition(cc.PointMake(200, 200)),
            cc.Show.action(),
            cc.MoveBy.actionWithDuration(1, cc.PointMake(100, 0)),
            cc.CallFunc.actionWithTarget(this, this.callback1),
            cc.CallFunc.actionWithTarget(this, this.callback2),
            cc.CallFunc.actionWithTarget(this, this.callback3),
            null);
        this._m_grossini.runAction(action);

    },
    callback1:function () {
        var s = cc.Director.sharedDirector().getWinSize();
        var label = cc.LabelTTF.labelWithString("callback 1 called", "Marker Felt", 16);
        label.setPosition(cc.PointMake(s.width / 4 * 1, s.height / 2));

        this.addChild(label);
    },
    callback2:function () {
        var s = cc.Director.sharedDirector().getWinSize();
        var label = cc.LabelTTF.labelWithString("callback 2 called", "Marker Felt", 16);
        label.setPosition(cc.PointMake(s.width / 4 * 2, s.height / 2));

        this.addChild(label);
    },
    callback3:function () {
        var s = cc.Director.sharedDirector().getWinSize();
        var label = cc.LabelTTF.labelWithString("callback 3 called", "Marker Felt", 16);
        label.setPosition(cc.PointMake(s.width / 4 * 3, s.height / 2));

        this.addChild(label);
    },
    subtitle:function () {
        return "Sequence of InstantActions";
    }
});
//------------------------------------------------------------------
//
//	ActionCallFunc
//
//------------------------------------------------------------------
var ActionCallFunc = ActionsDemo.extend({
    onEnter:function () {
        this._super();
        this.centerSprites(3);

        var action = cc.Sequence.actions(
            cc.MoveBy.actionWithDuration(2, cc.PointMake(200, 0)),
            cc.CallFunc.actionWithTarget(this, this.callback1)
        );

        var action2 = cc.Sequence.actions(
            cc.ScaleBy.actionWithDuration(2, 2),
            cc.FadeOut.actionWithDuration(2),
            cc.CallFunc.actionWithTarget(this, this.callback2)
        );

        var action3 = cc.Sequence.actions(
            cc.RotateBy.actionWithDuration(3, 360),
            cc.FadeOut.actionWithDuration(2),
            cc.CallFunc.actionWithTarget(this, this.callback3, 0xbebabeba)
        );

        this._m_grossini.runAction(action);
        this._m_tamara.runAction(action2);
        this._m_kathia.runAction(action3);

    },
    callback1:function () {
        var s = cc.Director.sharedDirector().getWinSize();
        var label = cc.LabelTTF.labelWithString("callback 1 called", "Marker Felt", 16);
        label.setPosition(cc.PointMake(s.width / 4 * 1, s.height / 2));
        this.addChild(label);
    },
    callback2:function () {
        var s = cc.Director.sharedDirector().getWinSize();
        var label = cc.LabelTTF.labelWithString("callback 2 called", "Marker Felt", 16);
        label.setPosition(cc.PointMake(s.width / 4 * 2, s.height / 2));

        this.addChild(label);
    },
    callback3:function () {
        var s = cc.Director.sharedDirector().getWinSize();
        var label = cc.LabelTTF.labelWithString("callback 3 called", "Marker Felt", 16);
        label.setPosition(cc.PointMake(s.width / 4 * 3, s.height / 2));
        this.addChild(label);
    },
    subtitle:function () {
        return "Callbacks: CallFunc and friends";
    }
});
//------------------------------------------------------------------
//
// ActionCallFuncND
//
//------------------------------------------------------------------
var ActionCallFuncND = ActionsDemo.extend({
    onEnter:function () {
        this._super();
        this.centerSprites(1);

        var action = cc.Sequence.actions(cc.MoveBy.actionWithDuration(2.0, cc.ccp(200, 0)),
            cc.CallFunc.actionWithTarget(this._m_grossini, this.removeFromParentAndCleanup, true),
            null);

        this._m_grossini.runAction(action);

    },
    title:function () {
        return "CallFuncND + auto remove";
    },
    subtitle:function () {
        return "CallFuncND + removeFromParentAndCleanup. Grossini dissapears in 2s";
    }
});
//------------------------------------------------------------------
//
// ActionSpawn
//
//------------------------------------------------------------------
var ActionSpawn = ActionsDemo.extend({
    onEnter:function () {
        this._super();
        this.alignSpritesLeft(1);

        var action = cc.Spawn.actions(
            cc.JumpBy.actionWithDuration(2, cc.PointMake(300, 0), 50, 4),
            cc.RotateBy.actionWithDuration(2, 720),
            null);

        this._m_grossini.runAction(action);

    },
    subtitle:function () {
        return "Spawn: Jump + Rotate";
    }
});
//------------------------------------------------------------------
//
// ActionRepeatForever
//
//------------------------------------------------------------------
var ActionRepeatForever = ActionsDemo.extend({
    onEnter:function () {
        this._super();
        this.centerSprites(1);
        var action = cc.Sequence.actions(
            cc.DelayTime.actionWithDuration(1),
            cc.CallFunc.actionWithTarget(this, this.repeatForever),
            null);

        this._m_grossini.runAction(action);


    },
    repeatForever:function (pSender) {
        var repeat = cc.RepeatForever.actionWithAction(cc.RotateBy.actionWithDuration(1.0, 360));
        pSender.runAction(repeat)
    },
    subtitle:function () {
        return "CallFuncN + RepeatForever";
    }
});
//------------------------------------------------------------------
//
// ActionRotateToRepeat
//
//------------------------------------------------------------------
var ActionRotateToRepeat = ActionsDemo.extend({
    onEnter:function () {
        this._super();
        this.centerSprites(2);

        var act1 = cc.RotateTo.actionWithDuration(1, 90);
        var act2 = cc.RotateTo.actionWithDuration(1, 0);
        var seq = cc.Sequence.actions(act1, act2, null);
        var rep1 = cc.RepeatForever.actionWithAction(seq);
        var rep2 = cc.Repeat.actionWithAction((seq.copy()), 10);

        this._m_tamara.runAction(rep1);
        this._m_kathia.runAction(rep2);

    },
    subtitle:function () {
        return "Repeat/RepeatForever + RotateTo";
    }
});
//------------------------------------------------------------------
//
// ActionRotateJerk
//
//------------------------------------------------------------------
var ActionRotateJerk = ActionsDemo.extend({
    onEnter:function () {
        this._super();
        this.centerSprites(2);
        var seq = cc.Sequence.actions(
            cc.RotateTo.actionWithDuration(0.5, -20),
            cc.RotateTo.actionWithDuration(0.5, 20),
            null);

        var rep1 = cc.Repeat.actionWithAction(seq, 10);
        var rep2 = cc.RepeatForever.actionWithAction((seq.copy()));

        this._m_tamara.runAction(rep1);
        this._m_kathia.runAction(rep2);
    },
    subtitle:function () {
        return "RepeatForever / Repeat + Rotate";
    }
});
//------------------------------------------------------------------
//
// ActionReverse
//
//------------------------------------------------------------------
var ActionReverse = ActionsDemo.extend({
    onEnter:function () {
        this._super();
        this.alignSpritesLeft(1);

        var jump = cc.JumpBy.actionWithDuration(2, cc.PointMake(300, 0), 50, 4);
        var action = cc.Sequence.actions(jump, jump.reverse(), null);

        this._m_grossini.runAction(action);
    },
    subtitle:function () {
        return "Reverse an action";
    }
});
//------------------------------------------------------------------
//
// ActionDelayTime
//
//------------------------------------------------------------------
var ActionDelayTime = ActionsDemo.extend({
    onEnter:function () {
        this._super();
        this.alignSpritesLeft(1);

        var move = cc.MoveBy.actionWithDuration(1, cc.PointMake(150, 0));
        var action = cc.Sequence.actions(move, cc.DelayTime.actionWithDuration(2), move, null);

        this._m_grossini.runAction(action);
    },
    subtitle:function () {
        return "DelayTime: m + delay + m";
    }
});
//------------------------------------------------------------------
//
// ActionReverseSequence
//
//------------------------------------------------------------------
var ActionReverseSequence = ActionsDemo.extend({
    onEnter:function () {
        this._super();
        this.alignSpritesLeft(1);

        var move1 = cc.MoveBy.actionWithDuration(1, cc.PointMake(250, 0));
        var move2 = cc.MoveBy.actionWithDuration(1, cc.PointMake(0, 50));
        var seq = cc.Sequence.actions(move1, move2, move1.reverse(), null);
        var action = cc.Sequence.actions(seq, seq.reverse(), null);

        this._m_grossini.runAction(action);

    },
    subtitle:function () {
        return "Reverse a sequence";
    }
});
//------------------------------------------------------------------
//
// ActionReverseSequence2
//
//------------------------------------------------------------------
var ActionReverseSequence2 = ActionsDemo.extend({
    onEnter:function () {
        this._super();
        this.alignSpritesLeft(2);


        // Test:
        //   Sequence should work both with IntervalAction and InstantActions
        var move1 = cc.MoveBy.actionWithDuration(3, cc.PointMake(250, 0));
        var move2 = cc.MoveBy.actionWithDuration(3, cc.PointMake(0, 50));
        var tog1 = new cc.ToggleVisibility();
        var tog2 = new cc.ToggleVisibility();
        var seq = cc.Sequence.actions(move1, tog1, move2, tog2, move1.reverse(), null);
        var action = cc.Repeat.actionWithAction(
            cc.Sequence.actions(
                seq,
                seq.reverse(),
                null
            ),
            3
        );


        // Test:
        //   Also test that the reverse of Hide is Show, and vice-versa
        this._m_kathia.runAction(action);

        var move_tamara = cc.MoveBy.actionWithDuration(1, cc.PointMake(100, 0));
        var move_tamara2 = cc.MoveBy.actionWithDuration(1, cc.PointMake(50, 0));
        var hide = new cc.Hide();
        var seq_tamara = cc.Sequence.actions(move_tamara, hide, move_tamara2, null);
        var seq_back = seq_tamara.reverse();
        this._m_tamara.runAction(cc.Sequence.actions(seq_tamara, seq_back, null));
    },
    subtitle:function () {
        return "Reverse sequence 2";
    }
});
//------------------------------------------------------------------
//
// ActionRepeat
//
//------------------------------------------------------------------
var ActionRepeat = ActionsDemo.extend({
    onEnter:function () {
        this._super();
        this.alignSpritesLeft(2);


        var a1 = cc.MoveBy.actionWithDuration(1, cc.PointMake(150, 0));
        var action1 = cc.Repeat.actionWithAction(
            cc.Sequence.actions(cc.Place.actionWithPosition(cc.PointMake(60, 60)), a1, null),
            3);
        var action2 = cc.RepeatForever.actionWithAction(
            (cc.Sequence.actions((a1.copy()), a1.reverse(), null))
        );

        this._m_kathia.runAction(action1);
        this._m_tamara.runAction(action2);
    },
    subtitle:function () {
        return "Repeat / RepeatForever actions";
    }
});
//------------------------------------------------------------------
//
// ActionOrbit
//
//------------------------------------------------------------------
var ActionOrbit = ActionsDemo.extend({
    onEnter:function () {
        this._super();
        this.centerSprites(3);

        var orbit1 = cc.OrbitCamera.actionWithDuration(2, 1, 0, 0, 180, 0, 0);
        var action1 = cc.Sequence.actions(
            orbit1,
            orbit1.reverse(),
            null);

        var orbit2 = cc.OrbitCamera.actionWithDuration(2, 1, 0, 0, 180, -45, 0);
        var action2 = cc.Sequence.actions(
            orbit2,
            orbit2.reverse(),
            null);

        var orbit3 = cc.OrbitCamera.actionWithDuration(2, 1, 0, 0, 180, 90, 0);
        var action3 = cc.Sequence.actions(
            orbit3,
            orbit3.reverse(),
            null);

        this._m_kathia.runAction(cc.RepeatForever.actionWithAction(action1));
        this._m_tamara.runAction(cc.RepeatForever.actionWithAction(action2));
        this._m_grossini.runAction(cc.RepeatForever.actionWithAction(action3));

        var move = cc.MoveBy.actionWithDuration(3, cc.PointMake(100, -100));
        var move_back = move.reverse();
        var seq = cc.Sequence.actions(move, move_back, null);
        var rfe = cc.RepeatForever.actionWithAction(seq);
        this._m_kathia.runAction(rfe);
        this._m_tamara.runAction((rfe.copy()));
        this._m_grossini.runAction((rfe.copy()));

    },
    subtitle:function () {
        return "OrbitCamera action";
    }
});
//------------------------------------------------------------------
//
// ActionFollow
//
//------------------------------------------------------------------
var ActionFollow = ActionsDemo.extend({
    onEnter:function () {
        this._super();
        this.centerSprites(1);
        var s = cc.Director.sharedDirector().getWinSize();

        this._m_grossini.setPosition(cc.PointMake(-200, s.height / 2));
        var move = cc.MoveBy.actionWithDuration(2, cc.PointMake(s.width * 3, 0));
        var move_back = move.reverse();
        var seq = cc.Sequence.actions(move, move_back, null);
        var rep = cc.RepeatForever.actionWithAction(seq);

        this._m_grossini.runAction(rep);

        this.runAction(cc.Follow.actionWithTarget(this._m_grossini, cc.RectMake(0, 0, s.width * 2 - 100, s.height)));


    },
    subtitle:function () {
        return "Follow action";
    }
});