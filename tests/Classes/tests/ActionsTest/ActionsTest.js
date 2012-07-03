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

var actionTests = [
    function () {
        return new ActionManual()
    }, //ok
    function () {
        return new ActionMove()
    }, //OK
    function () {
        return new ActionScale()
    }, //OK
    function () {
        return new ActionRotate()
    }, //OK
    function () {
        return new ActionSkew()
    }, //OK, Not in cocos2d-js
    function () {
        return new ActionSkewRotateScale()
    }, //ok
    function () {
        return new ActionJump()
    }, //OK
    function () {
        return new ActionBezier()
    }, //Buggy?

    function () {
        return new ActionCardinalSpline()
    }, //ok
    function () {
        return new ActionCatmullRom()
    }, //ok

    function () {
        return new ActionBlink()
    }, //OK
    function () {
        return new ActionFade()
    }, //OK
    function () {
        return new ActionTint()
    }, //ok
    function () {
        return new ActionSequence()
    }, //OK
    function () {
        return new ActionSequence2()
    }, //OK
    function () {
        return new ActionSpawn()
    }, //OK
    function () {
        return new ActionReverse()
    },
    function () {
        return new ActionDelayTime()
    }, //OK
    function () {
        return new ActionRepeat()
    }, //OK
    function () {
        return new ActionRepeatForever()
    }, //OK
    function () {
        return new ActionRotateToRepeat()
    }, //ok
    function () {
        return new ActionRotateJerk()
    }, //ok
    function () {
        return new ActionCallFunc()
    }, //OK
    function () {
        return new ActionCallFuncND()
    }, //OK (cocos2d-X c+ bug/incomplete)
    function () {
        return new ActionReverseSequence()
    }, //OK
    function () {
        return new ActionReverseSequence2()
    }, //OK, Bug in Cocos2d-X implementation of FiniteTimeAction.reverse()
    //"ActionOrbit",//Not possible in canvas, requires sprite camera
    //"ActionFollow",//Buggy
    function () {
        return new ActionAnimate()
    }//Require Texture2d Implementation
];
var actionIdx = -1;
function NextAction() {
    ++actionIdx;
    actionIdx = actionIdx % actionTests.length;
    return actionTests[actionIdx]();
}
function BackAction() {
    --actionIdx;
    if (actionIdx < 0) {
        actionIdx += actionTests.length;
    }
    return actionTests[actionIdx]();
}
function RestartAction() {
    return actionTests[actionIdx]();
}

// the class inherit from TestScene
// every Scene each test used must inherit from TestScene,
// make sure the test have the menu item for back to main menu
var ActionsTestScene = TestScene.extend({
    runThisTest:function () {
        actionIdx = -1;
        this.addChild(NextAction());
        cc.Director.sharedDirector().replaceScene(this);
    }
});


var ActionsDemo = function() {
	goog.base(this);
}
goog.inherits( ActionsDemo, cc.Layer );

ActionsDemo.prototype._grossini = null;
ActionsDemo.prototype._tamara = null;
ActionsDemo.prototype._kathia = null;

ActionsDemo.prototype.centerSprites = function (numberOfSprites) {
    var s = cc.Director.sharedDirector().getWinSize();

    if (numberOfSprites == 1) {
        this._tamara.setVisible(false);
        this._kathia.setVisible(false);
        this._grossini.setPosition(cc.PointMake(s.width / 2, s.height / 2));
    }
    else if (numberOfSprites == 2) {
        this._kathia.setPosition(cc.PointMake(s.width / 3, s.height / 2));
        this._tamara.setPosition(cc.PointMake(2 * s.width / 3, s.height / 2));
        this._grossini.setVisible(false);
    }
    else if (numberOfSprites == 3) {
        this._grossini.setPosition(cc.PointMake(s.width / 2, s.height / 2));
        this._tamara.setPosition(cc.PointMake(s.width / 4, s.height / 2));
        this._kathia.setPosition(cc.PointMake(3 * s.width / 4, s.height / 2));
    }
}

ActionsDemo.prototype.alignSpritesLeft = function (numberOfSprites) {
    var s = cc.Director.sharedDirector().getWinSize();

    if (numberOfSprites == 1) {
        this._tamara.setVisible(false);
        this._kathia.setVisible(false);
        this._grossini.setPosition(cc.PointMake(60, s.height / 2));
    }
    else if (numberOfSprites == 2) {
        this._kathia.setPosition(cc.PointMake(60, s.height / 3));
        this._tamara.setPosition(cc.PointMake(60, 2 * s.height / 3));
        this._grossini.setVisible(false);
    }
    else if (numberOfSprites == 3) {
        this._grossini.setPosition(cc.PointMake(60, s.height / 2));
        this._tamara.setPosition(cc.PointMake(60, 2 * s.height / 3));
        this._kathia.setPosition(cc.PointMake(60, s.height / 3));
    }
}

ActionsDemo.prototype.title = function () {
    return "ActionsTest";
}

ActionsDemo.subtitle = function () {
    return "";
}

ActionsDemo.prototype.restartCallback = function (sender) {
    var s = new ActionsTestScene();
    s.addChild(RestartAction());
    cc.Director.sharedDirector().replaceScene(s);
}

ActionsDemo.prototype.nextCallback = function (sender) {
    var s = new ActionsTestScene();
    s.addChild(NextAction());
    cc.Director.sharedDirector().replaceScene(s);
}

ActionsDemo.prototype.backCallback = function (sender) {
    var s = new ActionsTestScene();
    s.addChild(BackAction());
    cc.Director.sharedDirector().replaceScene(s);
}

ActionsDemo.prototype.onEnter = function () {
    goog.base(this, 'onEnter');
    this._grossini = cc.Sprite.create(s_pathGrossini);
    this._tamara = cc.Sprite.create(s_pathSister1);
    this._kathia = cc.Sprite.create(s_pathSister2);
    this.addChild(this._grossini, 1);
    this.addChild(this._tamara, 2);
    this.addChild(this._kathia, 3);
    var s = cc.Director.sharedDirector().getWinSize();
    this._grossini.setPosition(cc.PointMake(s.width / 2, s.height / 3));
    this._tamara.setPosition(cc.PointMake(s.width / 2, 2 * s.height / 3));
    this._kathia.setPosition(cc.PointMake(s.width / 2, s.height / 2));

    // add title and subtitle
    var title = this.title();
    var label = cc.LabelTTF.create(title, "Arial", 18);
    this.addChild(label, 1);
    label.setPosition(cc.PointMake(s.width / 2, s.height - 30));

    var strSubtitle = this.subtitle();
    if (strSubtitle) {
        var l = cc.LabelTTF.create(strSubtitle, "Thonburi", 22);
        this.addChild(l, 1);
        l.setPosition(cc.PointMake(s.width / 2, s.height - 60));
    }

    // add menu
    var item1 = cc.MenuItemImage.create(s_pathB1, s_pathB2, this, this.backCallback);
    var item2 = cc.MenuItemImage.create(s_pathR1, s_pathR2, this, this.restartCallback);
    var item3 = cc.MenuItemImage.create(s_pathF1, s_pathF2, this, this.nextCallback);

    var menu = cc.Menu.create(item1, item2, item3, null);

    menu.setPosition(cc.PointZero());
    item1.setPosition(cc.PointMake(s.width / 2 - 100, 30));
    item2.setPosition(cc.PointMake(s.width / 2, 30));
    item3.setPosition(cc.PointMake(s.width / 2 + 100, 30));

    this.addChild(menu, 1);
}

//------------------------------------------------------------------
//
// ActionManual
//
//------------------------------------------------------------------
var ActionManual = function() {
	goog.base(this);

    this.onEnter = function () {
        goog.base(this, 'onEnter');
        

        var s = cc.Director.sharedDirector().getWinSize();

        this._tamara.setScaleX(2.5);
        //window.tam = this._tamara;
        this._tamara.setScaleY(-1.0);
        this._tamara.setPosition(cc.PointMake(100, 70));
        this._tamara.setOpacity(128);

        this._grossini.setRotation(120);
        this._grossini.setPosition(cc.PointMake(s.width / 2, s.height / 2));
        this._grossini.setColor(cc.ccc3(255, 0, 0));

        this._kathia.setPosition(cc.PointMake(s.width - 100, s.height / 2));
        this._kathia.setColor(cc.BLUE());
    }

    this.subtitle = function () {
        return "Manual Transformation!";
    }
}
goog.inherits( ActionManual, ActionsDemo );



//------------------------------------------------------------------
//
//	ActionMove
//
//------------------------------------------------------------------
var ActionMove = function() {

	goog.base(this);

    this.onEnter = function () {
        goog.base(this, 'onEnter');

        this.centerSprites(3);
        var s = cc.Director.sharedDirector().getWinSize();

        var actionTo = cc.MoveTo.create(2, cc.PointMake(s.width - 40, s.height - 40));

        var actionBy = cc.MoveBy.create(2, cc.PointMake(80, 80));
        var actionByBack = actionBy.reverse();

        this._tamara.runAction(actionTo);
        this._grossini.runAction(cc.Sequence.create(actionBy, actionByBack));
        this._kathia.runAction(cc.MoveTo.create(1, cc.PointMake(40, 40)));
    }

    this.subtitle = function () {
        return "MoveTo / MoveBy";
    }
}
goog.inherits( ActionMove, ActionsDemo );

//------------------------------------------------------------------
//
// ActionScale
//
//------------------------------------------------------------------
var ActionScale = function() {

	goog.base(this);

    this.onEnter = function () {
        goog.base(this, 'onEnter');

        this.centerSprites(3);

        var actionTo = cc.ScaleTo.create(2, 0.5);
        var actionBy = cc.ScaleBy.create(2, 2);
        var actionBy2 = cc.ScaleBy.create(2, 0.25, 4.5);
        var actionByBack = actionBy.reverse();
        var actionBy2Back = actionBy2.reverse();

        this._tamara.runAction(actionTo);
        this._kathia.runAction(cc.Sequence.create(actionBy2, actionBy2Back));
        this._grossini.runAction(cc.Sequence.create(actionBy, actionByBack, null));

    }
    this.subtitle = function () {
        return "ScaleTo / ScaleBy";
    }
}
goog.inherits( ActionScale, ActionsDemo );

//------------------------------------------------------------------
//
//	ActionSkew
//
//------------------------------------------------------------------
var ActionSkew = function() {

	goog.base(this);

    this.onEnter = function () {
        goog.base(this, 'onEnter');

        this.centerSprites(3);
        var actionTo = cc.SkewTo.create(2, 37.2, -37.2);
        var actionToBack = cc.SkewTo.create(2, 0, 0);
        var actionBy = cc.SkewBy.create(2, 0, -90);
        var actionBy2 = cc.SkewBy.create(2, 45.0, 45.0);
        var actionByBack = actionBy.reverse();
        var actionBy2Back = actionBy2.reverse();


        this._tamara.runAction(cc.Sequence.create(actionTo, actionToBack, null));
        this._grossini.runAction(cc.Sequence.create(actionBy, actionByBack, null));

        this._kathia.runAction(cc.Sequence.create(actionBy2, actionBy2Back, null));


    }

    this.subtitle = function () {
        return "SkewTo / SkewBy";
    }
}
goog.inherits( ActionSkew, ActionsDemo );

var ActionSkewRotateScale = function() {

	goog.base(this);

    this.onEnter = function () {
        goog.base(this, 'onEnter');
        this._tamara.removeFromParentAndCleanup(true);
        this._grossini.removeFromParentAndCleanup(true);
        this._kathia.removeFromParentAndCleanup(true);

        var winSize = cc.Director.sharedDirector().getWinSize();

        var boxSize = cc.SizeMake(100.0, 100.0);
        var box = cc.LayerColor.create(cc.ccc4(255, 255, 0, 255));
        box.setAnchorPoint(cc.ccp(0, 0));
        box.setPosition(new cc.Point((winSize.width - boxSize.width) / 2, (winSize.height - boxSize.height) / 2));
        box.setContentSize(boxSize);

        var markrside = 10.0;
        var uL = cc.LayerColor.create(cc.ccc4(255, 0, 0, 255));
        box.addChild(uL);
        uL.setContentSize(cc.SizeMake(markrside, markrside));
        uL.setPosition(cc.ccp(0, boxSize.height - markrside));
        uL.setAnchorPoint(cc.ccp(0, 0));

        var uR = cc.LayerColor.create(cc.ccc4(0, 0, 255, 255));
        box.addChild(uR);
        uR.setContentSize(cc.SizeMake(markrside, markrside));
        uR.setPosition(cc.ccp(boxSize.width - markrside, boxSize.height - markrside));
        uR.setAnchorPoint(cc.ccp(0, 0));


        this.addChild(box);
        var actionTo = cc.SkewTo.create(2, 0., 2.);
        var rotateTo = cc.RotateTo.create(2, 61.0);
        var actionScaleTo = cc.ScaleTo.create(2, -0.44, 0.47);

        var actionScaleToBack = cc.ScaleTo.create(2, 1.0, 1.0);
        var rotateToBack = cc.RotateTo.create(2, 0);
        var actionToBack = cc.SkewTo.create(2, 0, 0);

        box.runAction(cc.Sequence.create(actionTo, actionToBack, null));
        box.runAction(cc.Sequence.create(rotateTo, rotateToBack, null));
        box.runAction(cc.Sequence.create(actionScaleTo, actionScaleToBack, null));
    }

    this.subtitle = function () {
        return "Skew + Rotate + Scale";
    }
}
goog.inherits( ActionSkewRotateScale, ActionsDemo );

//------------------------------------------------------------------
//
//	ActionRotate
//
//------------------------------------------------------------------
var ActionRotate = function() {

	goog.base(this);

    this.onEnter = function () {
        goog.base(this, 'onEnter');
        this.centerSprites(3);
        var actionTo = cc.RotateTo.create(2, 45);
        var actionTo2 = cc.RotateTo.create(2, -45);
        var actionTo0 = cc.RotateTo.create(2, 0);
        this._tamara.runAction(cc.Sequence.create(actionTo, actionTo0, null));

        var actionBy = cc.RotateBy.create(2, 360);
        var actionByBack = actionBy.reverse();
        this._grossini.runAction(cc.Sequence.create(actionBy, actionByBack, null));

        this._kathia.runAction(cc.Sequence.create(actionTo2, actionTo0.copy(), null));

    }
    this.subtitle = function () {
        return "RotateTo / RotateBy";
    }
}
goog.inherits( ActionRotate, ActionsDemo );


//------------------------------------------------------------------
//
// ActionJump
//
//------------------------------------------------------------------
var ActionJump = function() {

	goog.base(this);

    this.onEnter = function () {
        goog.base(this, 'onEnter');
        this.centerSprites(3);

        var actionTo = cc.JumpTo.create(2, cc.PointMake(300, 300), 50, 4);
        var actionBy = cc.JumpBy.create(2, cc.PointMake(300, 0), 50, 4);
        var actionUp = cc.JumpBy.create(2, cc.PointMake(0, 0), 80, 4);
        var actionByBack = actionBy.reverse();

        this._tamara.runAction(actionTo);
        this._grossini.runAction(cc.Sequence.create(actionBy, actionByBack, null));
        this._kathia.runAction(cc.RepeatForever.create(actionUp));

    }

    this.subtitle = function () {
        return "JumpTo / JumpBy";
    }
}
goog.inherits( ActionJump, ActionsDemo );

//------------------------------------------------------------------
//
// ActionBezier
//
//------------------------------------------------------------------
var ActionBezier = function() {
	goog.base(this);

    this.onEnter = function () {
        goog.base(this, 'onEnter');
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

        var bezierForward = cc.BezierBy.create(3, bezier);
        var bezierBack = bezierForward.reverse();
        var rep = cc.RepeatForever.create(cc.Sequence.create(bezierForward, bezierBack, null));


        // sprite 2
        this._tamara.setPosition(cc.PointMake(80, 160));
        var bezier2 = new cc.BezierConfig();
        bezier2.controlPoint_1 = cc.PointMake(100, s.height / 2);
        bezier2.controlPoint_2 = cc.PointMake(200, -s.height / 2);
        bezier2.endPosition = cc.PointMake(240, 160);

        var bezierTo1 = cc.BezierTo.create(2, bezier2);

        // sprite 3
        this._kathia.setPosition(cc.PointMake(400, 160));
        var bezierTo2 = cc.BezierTo.create(2, bezier2);

        this._grossini.id = "gro";
        this._tamara.id = "tam";
        this._kathia.id = "kat";

        this._grossini.runAction(rep);
        this._tamara.runAction(bezierTo1);
        this._kathia.runAction(bezierTo2);

    }

    this.subtitle = function () {
        return "BezierBy / BezierTo";
    }
}
goog.inherits( ActionBezier, ActionsDemo );

//------------------------------------------------------------------
//
// ActionBlink
//
//------------------------------------------------------------------
var ActionBlink = function() {

	goog.base(this);

    this.onEnter = function () {
        goog.base(this, 'onEnter');
        this.centerSprites(2);

        var action1 = cc.Blink.create(2, 10);
        var action2 = cc.Blink.create(2, 5);

        this._tamara.runAction(action1);
        this._kathia.runAction(action2);

    }

    this.subtitle = function () {
        return "Blink";
    }
}
goog.inherits( ActionBlink, ActionsDemo );

//------------------------------------------------------------------
//
// ActionFade
//
//------------------------------------------------------------------
var ActionFade = function() {

	goog.base(this);

    this.onEnter = function () {
        goog.base(this, 'onEnter');
        this.centerSprites(2);
        this._tamara.setOpacity(0);
        var action1 = cc.FadeIn.create(1.0);
        var action1Back = action1.reverse();

        var action2 = cc.FadeOut.create(1.0);
        var action2Back = action2.reverse();

        this._tamara.runAction(cc.Sequence.create(action1, action1Back, null));
        this._kathia.runAction(cc.Sequence.create(action2, action2Back, null));


    }

    this.subtitle = function () {
        return "FadeIn / FadeOut";
    }
}
goog.inherits( ActionFade, ActionsDemo );

//------------------------------------------------------------------
//
// ActionTint
//
//------------------------------------------------------------------
var ActionTint = function() {

	goog.base(this);

    this.onEnter = function () {
        goog.base(this, 'onEnter');
        this.centerSprites(2);

        var action1 = cc.TintTo.create(2, 255, 0, 255);
        var action2 = cc.TintBy.create(2, -127, -255, -127);
        var action2Back = action2.reverse();

        this._tamara.runAction(action1);
        this._kathia.runAction(cc.Sequence.create(action2, action2Back));

    }

    this.subtitle = function () {
        return "TintTo / TintBy";
    }
}
goog.inherits( ActionTint, ActionsDemo );

//------------------------------------------------------------------
//
// ActionAnimate
//
//------------------------------------------------------------------
var ActionAnimate = function() {

	goog.base(this);

    this.onEnter = function () {
        goog.base(this, 'onEnter');
        this.centerSprites(1);

        var animation = cc.Animation.create();
        for (var i = 1; i < 15; i++) {
            var frameName = "Resources/Images/grossini_dance_" + ((i < 10) ? ("0" + i) : i) + ".png";
            animation.addSpriteFrameWithFileName(frameName);
        }

        var action = cc.Animate.create(3, animation, false);
        var action_back = action.reverse();

        this._grossini.runAction(cc.Sequence.create(action, action_back, null));
    }

    this.subtitle = function () {
        return "Animation";
    }
}
goog.inherits( ActionAnimate, ActionsDemo );

//------------------------------------------------------------------
//
//	ActionSequence
//
//------------------------------------------------------------------
var ActionSequence = function() {

	goog.base(this);

    this.onEnter = function () {
        goog.base(this, 'onEnter');
        this.alignSpritesLeft(1);

        var action = cc.Sequence.create(
            cc.MoveBy.create(2, cc.PointMake(240, 0)),
            cc.RotateBy.create(2, 540),
            null);

        this._grossini.runAction(action);

    }

    this.subtitle = function () {
        return "Sequence: Move + Rotate";
    }
}
goog.inherits( ActionSequence, ActionsDemo );

//------------------------------------------------------------------
//
//	ActionSequence2
//
//------------------------------------------------------------------
var ActionSequence2 = function() {

	goog.base(this);

    this.onEnter = function () {
        goog.base(this, 'onEnter');
        this.centerSprites(1);
        this._grossini.setVisible(false);
        var action = cc.Sequence.create(
            cc.Place.create(cc.PointMake(200, 200)),
            cc.Show.create(),
            cc.MoveBy.create(1, cc.PointMake(100, 0)),
            cc.CallFunc.create(this, this.callback1),
            cc.CallFunc.create(this, this.callback2),
            cc.CallFunc.create(this, this.callback3),
            null);
        this._grossini.runAction(action);

    }

    this.callback1 = function () {
        var s = cc.Director.sharedDirector().getWinSize();
        var label = cc.LabelTTF.create("callback 1 called", "Marker Felt", 16);
        label.setPosition(cc.PointMake(s.width / 4 * 1, s.height / 2));

        this.addChild(label);
    }

    this.callback2 = function () {
        var s = cc.Director.sharedDirector().getWinSize();
        var label = cc.LabelTTF.create("callback 2 called", "Marker Felt", 16);
        label.setPosition(cc.PointMake(s.width / 4 * 2, s.height / 2));

        this.addChild(label);
    }

    this.callback3 = function () {
        var s = cc.Director.sharedDirector().getWinSize();
        var label = cc.LabelTTF.create("callback 3 called", "Marker Felt", 16);
        label.setPosition(cc.PointMake(s.width / 4 * 3, s.height / 2));

        this.addChild(label);
    }

    this.subtitle = function () {
        return "Sequence of InstantActions";
    }
}
goog.inherits( ActionSequence2, ActionsDemo );

//------------------------------------------------------------------
//
//	ActionCallFunc
//
//------------------------------------------------------------------
var ActionCallFunc = function() {

	goog.base(this);

    this.onEnter = function () {
        goog.base(this, 'onEnter');
        this.centerSprites(3);

        var action = cc.Sequence.create(
            cc.MoveBy.create(2, cc.PointMake(200, 0)),
            cc.CallFunc.create(this, this.callback1)
        );

        var action2 = cc.Sequence.create(
            cc.ScaleBy.create(2, 2),
            cc.FadeOut.create(2),
            cc.CallFunc.create(this, this.callback2)
        );

        var action3 = cc.Sequence.create(
            cc.RotateBy.create(3, 360),
            cc.FadeOut.create(2),
            cc.CallFunc.create(this, this.callback3, 0xbebabeba)
        );

        this._grossini.runAction(action);
        this._tamara.runAction(action2);
        this._kathia.runAction(action3);

    }

    this.callback1 = function () {
        var s = cc.Director.sharedDirector().getWinSize();
        var label = cc.LabelTTF.create("callback 1 called", "Marker Felt", 16);
        label.setPosition(cc.PointMake(s.width / 4 * 1, s.height / 2));
        this.addChild(label);
    }

    this.callback2 = function () {
        var s = cc.Director.sharedDirector().getWinSize();
        var label = cc.LabelTTF.create("callback 2 called", "Marker Felt", 16);
        label.setPosition(cc.PointMake(s.width / 4 * 2, s.height / 2));

        this.addChild(label);
    }

    this.callback3 = function () {
        var s = cc.Director.sharedDirector().getWinSize();
        var label = cc.LabelTTF.create("callback 3 called", "Marker Felt", 16);
        label.setPosition(cc.PointMake(s.width / 4 * 3, s.height / 2));
        this.addChild(label);
    }
    
    this.subtitle = function () {
        return "Callbacks: CallFunc and friends";
    }
}
goog.inherits( ActionCallFunc, ActionsDemo );

//------------------------------------------------------------------
//
// ActionCallFuncND
//
//------------------------------------------------------------------
var ActionCallFuncND = function(){
    this.onEnter = function () {
        goog.base(this, 'onEnter');
        this.centerSprites(1);

        var action = cc.Sequence.create(cc.MoveBy.create(2.0, cc.ccp(200, 0)),
            cc.CallFunc.create(this._grossini, this.removeFromParentAndCleanup, true),
            null);

        this._grossini.runAction(action);

    }
    this.title = function () {
        return "CallFuncND + auto remove";
    }

    this.subtitle = function () {
        return "CallFuncND + removeFromParentAndCleanup. Grossini dissapears in 2s";
    }
}
goog.inherits( ActionCallFuncND, ActionsDemo );

//------------------------------------------------------------------
//
// ActionSpawn
//
//------------------------------------------------------------------
var ActionSpawn = function(){
    this.onEnter = function () {
        goog.base(this, 'onEnter');
        this.alignSpritesLeft(1);

        var action = cc.Spawn.create(
            cc.JumpBy.create(2, cc.PointMake(300, 0), 50, 4),
            cc.RotateBy.create(2, 720),
            null);

        this._grossini.runAction(action);

    }
    this.subtitle = function () {
        return "Spawn: Jump + Rotate";
    }
}
goog.inherits( ActionSpawn, ActionsDemo );

//------------------------------------------------------------------
//
// ActionRepeatForever
//
//------------------------------------------------------------------
var ActionRepeatForever = function(){
    goog.base(this);
    this.onEnter = function () {
        goog.base(this, 'onEnter');
        this.centerSprites(1);
        var action = cc.Sequence.create(
            cc.DelayTime.create(1),
            cc.CallFunc.create(this, this.repeatForever),
            null);

        this._grossini.runAction(action);


    }
    this.repeatForever = function (sender) {
        var repeat = cc.RepeatForever.create(cc.RotateBy.create(1.0, 360));
        sender.runAction(repeat)
    }

    this.subtitle = function () {
        return "CallFuncN + RepeatForever";
    }
}
goog.inherits( ActionRepeatForever, ActionsDemo );

//------------------------------------------------------------------
//
// ActionRotateToRepeat
//
//------------------------------------------------------------------
var ActionRotateToRepeat = function(){
    goog.base(this);
    this.onEnter = function () {
        goog.base(this, 'onEnter');
        this.centerSprites(2);

        var act1 = cc.RotateTo.create(1, 90);
        var act2 = cc.RotateTo.create(1, 0);
        var seq = cc.Sequence.create(act1, act2, null);
        var rep1 = cc.RepeatForever.create(seq);
        var rep2 = cc.Repeat.create((seq.copy()), 10);

        this._tamara.runAction(rep1);
        this._kathia.runAction(rep2);

    }

    this.subtitle = function () {
        return "Repeat/RepeatForever + RotateTo";
    }
}
goog.inherits( ActionRotateToRepeat, ActionsDemo );

//------------------------------------------------------------------
//
// ActionRotateJerk
//
//------------------------------------------------------------------
var ActionRotateJerk = function(){
    goog.base(this);
    this.onEnter = function () {
        goog.base(this, 'onEnter');
        this.centerSprites(2);
        var seq = cc.Sequence.create(
            cc.RotateTo.create(0.5, -20),
            cc.RotateTo.create(0.5, 20),
            null);

        var rep1 = cc.Repeat.create(seq, 10);
        var rep2 = cc.RepeatForever.create((seq.copy()));

        this._tamara.runAction(rep1);
        this._kathia.runAction(rep2);
    }

    this.subtitle = function () {
        return "RepeatForever / Repeat + Rotate";
    }
}
goog.inherits( ActionRotateJerk, ActionsDemo );

//------------------------------------------------------------------
//
// ActionReverse
//
//------------------------------------------------------------------
var ActionReverse = function(){
    this.onEnter = function () {
        goog.base(this, 'onEnter');
        this.alignSpritesLeft(1);

        var jump = cc.JumpBy.create(2, cc.PointMake(300, 0), 50, 4);
        var action = cc.Sequence.create(jump, jump.reverse(), null);

        this._grossini.runAction(action);
    }

    this.subtitle = function () {
        return "Reverse an action";
    }
}
goog.inherits( ActionReverse, ActionsDemo );

//------------------------------------------------------------------
//
// ActionDelayTime
//
//------------------------------------------------------------------
var ActionDelayTime = function(){
    this.onEnter = function () {
        goog.base(this, 'onEnter');
        this.alignSpritesLeft(1);

        var move = cc.MoveBy.create(1, cc.PointMake(150, 0));
        var action = cc.Sequence.create(move, cc.DelayTime.create(2), move, null);

        this._grossini.runAction(action);
    }

    this.subtitle = function () {
        return "DelayTime: m + delay + m";
    }
}
goog.inherits( ActionDelayTime, ActionsDemo );

//------------------------------------------------------------------
//
// ActionReverseSequence
//
//------------------------------------------------------------------
var ActionReverseSequence = function(){
    this.onEnter = function () {
        goog.base(this, 'onEnter');
        this.alignSpritesLeft(1);

        var move1 = cc.MoveBy.create(1, cc.PointMake(250, 0));
        var move2 = cc.MoveBy.create(1, cc.PointMake(0, 50));
        var seq = cc.Sequence.create(move1, move2, move1.reverse(), null);
        var action = cc.Sequence.create(seq, seq.reverse(), null);

        this._grossini.runAction(action);

    }

    this.subtitle = function () {
        return "Reverse a sequence";
    }
}
goog.inherits( ActionReverseSequence, ActionsDemo );

//------------------------------------------------------------------
//
// ActionReverseSequence2
//
//------------------------------------------------------------------
var ActionReverseSequence2 = function(){
    this.onEnter = function () {
        goog.base(this, 'onEnter');
        this.alignSpritesLeft(2);


        // Test:
        //   Sequence should work both with IntervalAction and InstantActions
        var move1 = cc.MoveBy.create(3, cc.PointMake(250, 0));
        var move2 = cc.MoveBy.create(3, cc.PointMake(0, 50));
        var tog1 = new cc.ToggleVisibility();
        var tog2 = new cc.ToggleVisibility();
        var seq = cc.Sequence.create(move1, tog1, move2, tog2, move1.reverse(), null);
        var action = cc.Repeat.create(
            cc.Sequence.create(
                seq,
                seq.reverse(),
                null
            ),
            3
        );


        // Test:
        //   Also test that the reverse of Hide is Show, and vice-versa
        this._kathia.runAction(action);

        var move_tamara = cc.MoveBy.create(1, cc.PointMake(100, 0));
        var move_tamara2 = cc.MoveBy.create(1, cc.PointMake(50, 0));
        var hide = new cc.Hide();
        var seq_tamara = cc.Sequence.create(move_tamara, hide, move_tamara2, null);
        var seq_back = seq_tamara.reverse();
        this._tamara.runAction(cc.Sequence.create(seq_tamara, seq_back, null));
    }

    this.subtitle = function () {
        return "Reverse sequence 2";
    }
}
goog.inherits( ActionReverseSequence2, ActionsDemo );

//------------------------------------------------------------------
//
// ActionRepeat
//
//------------------------------------------------------------------
var ActionRepeat = function(){
    this.onEnter = function () {
        goog.base(this, 'onEnter');
        this.alignSpritesLeft(2);


        var a1 = cc.MoveBy.create(1, cc.PointMake(150, 0));
        var action1 = cc.Repeat.create(
            cc.Sequence.create(cc.Place.create(cc.PointMake(60, 60)), a1, null),
            3);
        var action2 = cc.RepeatForever.create(
            (cc.Sequence.create((a1.copy()), a1.reverse(), null))
        );

        this._kathia.runAction(action1);
        this._tamara.runAction(action2);
    }

    this.subtitle = function () {
        return "Repeat / RepeatForever actions";
    }
}
goog.inherits( ActionRepeat, ActionsDemo );

//------------------------------------------------------------------
//
// ActionOrbit
//
//------------------------------------------------------------------
var ActionOrbit = function(){
    this.onEnter = function () {
        goog.base(this, 'onEnter');
        this.centerSprites(3);

        var orbit1 = cc.OrbitCamera.create(2, 1, 0, 0, 180, 0, 0);
        var action1 = cc.Sequence.create(
            orbit1,
            orbit1.reverse(),
            null);

        var orbit2 = cc.OrbitCamera.create(2, 1, 0, 0, 180, -45, 0);
        var action2 = cc.Sequence.create(
            orbit2,
            orbit2.reverse(),
            null);

        var orbit3 = cc.OrbitCamera.create(2, 1, 0, 0, 180, 90, 0);
        var action3 = cc.Sequence.create(
            orbit3,
            orbit3.reverse(),
            null);

        this._kathia.runAction(cc.RepeatForever.create(action1));
        this._tamara.runAction(cc.RepeatForever.create(action2));
        this._grossini.runAction(cc.RepeatForever.create(action3));

        var move = cc.MoveBy.create(3, cc.PointMake(100, -100));
        var move_back = move.reverse();
        var seq = cc.Sequence.create(move, move_back, null);
        var rfe = cc.RepeatForever.create(seq);
        this._kathia.runAction(rfe);
        this._tamara.runAction((rfe.copy()));
        this._grossini.runAction((rfe.copy()));

    }

    this.subtitle = function () {
        return "OrbitCamera action";
    }
}
goog.inherits( ActionOrbit, ActionsDemo );

//------------------------------------------------------------------
//
// ActionFollow
//
//------------------------------------------------------------------
var ActionFollow = function(){
    this.onEnter = function () {
        goog.base(this, 'onEnter');
        this.centerSprites(1);
        var s = cc.Director.sharedDirector().getWinSize();

        this._grossini.setPosition(cc.PointMake(-200, s.height / 2));
        var move = cc.MoveBy.create(2, cc.PointMake(s.width * 3, 0));
        var move_back = move.reverse();
        var seq = cc.Sequence.create(move, move_back, null);
        var rep = cc.RepeatForever.create(seq);

        this._grossini.runAction(rep);

        this.runAction(cc.Follow.create(this._grossini, cc.RectMake(0, 0, s.width * 2 - 100, s.height)));
    }

    this.subtitle = function () {
        return "Follow action";
    }
}
goog.inherits( ActionFollow, ActionsDemo );

//------------------------------------------------------------------
//
// ActionCardinalSpline
//
//------------------------------------------------------------------
var ActionCardinalSpline = function(){
    goog.base(this);

    this._array = new cc.PointArray();

    this.onEnter = function () {
        goog.base(this, 'onEnter');

        this.centerSprites(2);

        var winSize = cc.Director.sharedDirector().getWinSize();

        var array = cc.PointArray.create();

        array.addControlPoint(new cc.Point(0, 0));
        array.addControlPoint(new cc.Point(winSize.width / 2 - 30, 0));
        array.addControlPoint(new cc.Point(winSize.width / 2 - 30, winSize.height - 80));
        array.addControlPoint(new cc.Point(0, winSize.height - 80));
        array.addControlPoint(new cc.Point(0, 0));

        //
        // sprite 1 (By)
        //
        // Spline with no tension (tension==0)
        //
        var action1 = cc.CardinalSplineBy.create(3, array, 0);
        var reverse1 = action1.reverse();
        var seq = cc.Sequence.create(action1, reverse1);

        this._tamara.setPosition(new cc.Point(50, 50));
        this._tamara.runAction(seq);

        //
        // sprite 2 (By)
        //
        // Spline with high tension (tension==1)
        //
        var action2 = cc.CardinalSplineBy.create(3, array, 1);
        var reverse2 = action2.reverse();
        var seq2 = cc.Sequence.create(action2, reverse2);

        this._kathia.setPosition(new cc.Point(winSize.width / 2, 50));
        this._kathia.runAction(seq2);

        this._array = array;
    }

    this.draw = function (ctx) {
        goog.base(this, 'draw', ctx);

        var context = ctx || cc.renderContext;
        // move to 50,50 since the "by" path will start at 50,50
        context.save();
        context.translate(50, -50);
        cc.drawingUtil.drawCardinalSpline(this._array, 0, 100);
        context.restore();

        var s = cc.Director.sharedDirector().getWinSize();

        context.save();
        context.translate(s.width / 2, -50);
        cc.drawingUtil.drawCardinalSpline(this._array, 1, 100);
        context.restore();
    }

    this.subtitle = function () {
        return "Cardinal Spline paths. Testing different tensions for one array";
    }

    this.title = function () {
        return "CardinalSplineBy / CardinalSplineAt";
    }
}
goog.inherits( ActionCardinalSpline, ActionsDemo );

//------------------------------------------------------------------
//
// ActionCatmullRom
//
//------------------------------------------------------------------
var ActionCatmullRom = function() {
    goog.base(this);

    this._array1 = new cc.PointArray();
    this._array2 = new cc.PointArray();

    this.onEnter = function () {
        goog.base(this, 'onEnter');

        this.centerSprites(2);
        var winSize = cc.Director.sharedDirector().getWinSize();

        //
        // sprite 1 (By)
        //
        // startPosition can be any coordinate, but since the movement
        // is relative to the Catmull Rom curve, it is better to start with (0,0).
        //
        this._tamara.setPosition(new cc.Point(50, 50));

        var array = cc.PointArray.create();
        array.addControlPoint(new cc.Point(0, 0));
        array.addControlPoint(new cc.Point(80, 80));
        array.addControlPoint(new cc.Point(winSize.width - 80, 80));
        array.addControlPoint(new cc.Point(winSize.width - 80, winSize.height - 80));
        array.addControlPoint(new cc.Point(80, winSize.height - 80));
        array.addControlPoint(new cc.Point(80, 80));
        array.addControlPoint(new cc.Point(winSize.width / 2, winSize.height / 2));

        var action1 = cc.CatmullRomBy.create(3, array);
        var reverse1 = action1.reverse();
        var seq1 = cc.Sequence.create(action1, reverse1);

        this._tamara.runAction(seq1);

        //
        // sprite 2 (To)
        //
        // The startPosition is not important here, because it uses a "To" action.
        // The initial position will be the 1st point of the Catmull Rom path
        //
        var array2 = cc.PointArray.create();

        array2.addControlPoint(new cc.Point(winSize.width / 2, 30));
        array2.addControlPoint(new cc.Point(winSize.width - 80, 30));
        array2.addControlPoint(new cc.Point(winSize.width - 80, winSize.height - 80));
        array2.addControlPoint(new cc.Point(winSize.width / 2, winSize.height - 80));
        array2.addControlPoint(new cc.Point(winSize.width / 2, 30));

        var action2 = cc.CatmullRomTo.create(3, array2);
        var reverse2 = action2.reverse();

        var seq2 = cc.Sequence.create(action2, reverse2);

        this._kathia.runAction(seq2);

        this._array1 = array;
        this._array2 = array2;
    }

    this.draw = function (ctx) {
        goog.base(this, 'draw', ctx);
        var context = ctx || cc.renderContext;

        // move to 50,50 since the "by" path will start at 50,50
        context.save();
        context.translate(50, -50);
        cc.drawingUtil.drawCatmullRom(this._array1, 50);
        context.restore();

        cc.drawingUtil.drawCatmullRom(this._array2, 50);
    }

    this.subtitle = function () {
        return "Catmull Rom spline paths. Testing reverse too";
    }

    this.title = function () {
        return "CatmullRomBy / CatmullRomTo tito";
    }
}
goog.inherits( ActionCatmullRom, ActionsDemo );

