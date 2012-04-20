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
TRANSITION_DURATION  = 1.2;

var TransitionsTests = [
   /* */"JumpZoomTransition", //ok
    "FadeTransition",//ok
    "FadeWhiteTransition",
    "FlipXLeftOver",
    "FlipXRightOver",
    "FlipYUpOver",
    "FlipYDownOver",//ok
    "FlipAngularLeftOver",
    "FlipAngularRightOver",
    "ZoomFlipXLeftOver",
    "ZoomFlipXRightOver",
    "ZoomFlipYUpOver",
    "ZoomFlipYDownOver",
    "ZoomFlipAngularLeftOver",
    "ZoomFlipAngularRightOver",
    "ShrinkGrowTransition",
    "RotoZoomTransition",
    "MoveInLTransition",
    "MoveInRTransition",
    "MoveInTTransition",
    "MoveInBTransition",
    "SlideInLTransition",
    "SlideInRTransition",
    "SlideInTTransition",
    "SlideInBTransition",

    "CCTransitionCrossFade",
    "CCTransitionRadialCCW",
    "CCTransitionRadialCW",
    "PageTransitionForward",
    "PageTransitionBackward",
    "FadeTRTransition",
    "FadeBLTransition",
    "FadeUpTransition",
    "FadeDownTransition",
    "TurnOffTilesTransition",
    "SplitRowsTransition",
    "SplitColsTransition"
];
var s_nTransitionsIdx = 0;
function nextTransitionAction() {
 ++s_nTransitionsIdx;
 s_nTransitionsIdx = s_nTransitionsIdx % TransitionsTests.length;
 return new window[TransitionsTests[s_nTransitionsIdx]];
 }
 function backTransitionAction() {
 --s_nTransitionsIdx;
 if (s_nTransitionsIdx < 0) {
 s_nTransitionsIdx += TransitionsTests.length;
 }
 return new window[TransitionsTests[s_nTransitionsIdx]];
 }
 function restartTransitionAction() {
 return new window[TransitionsTests[s_nTransitionsIdx]];
 }

var createTransition = function (nIndex, t, s) {
    cc.Director.sharedDirector().setDepthTest(false);
    switch (nIndex) {
        case 0:
            return cc.TransitionJumpZoom.transitionWithDuration(t, s);
        case 1:
            return cc.TransitionFade.transitionWithDuration(t, s);
        case 2:
            return FadeWhiteTransition.transitionWithDuration(t, s);
        case 3:
            return FlipXLeftOver.transitionWithDuration(t, s);
        case 4:
            return FlipXRightOver.transitionWithDuration(t, s);
        case 5:
            return FlipYUpOver.transitionWithDuration(t, s);
        case 6:
            return FlipYDownOver.transitionWithDuration(t, s);
        case 7:
            return FlipAngularLeftOver.transitionWithDuration(t, s);
        case 8:
            return FlipAngularRightOver.transitionWithDuration(t, s);
        case 9:
            return ZoomFlipXLeftOver.transitionWithDuration(t, s);
        case 10:
            return ZoomFlipXRightOver.transitionWithDuration(t, s);
        case 11:
            return ZoomFlipYUpOver.transitionWithDuration(t, s);
        case 12:
            return ZoomFlipYDownOver.transitionWithDuration(t, s);
        case 13:
            return ZoomFlipAngularLeftOver.transitionWithDuration(t, s);
        case 14:
            return ZoomFlipAngularRightOver.transitionWithDuration(t, s);
        case 15:
            return cc.TransitionShrinkGrow.transitionWithDuration(t, s);
        case 16:
            return cc.TransitionRotoZoom.transitionWithDuration(t, s);
        case 17:
            return cc.TransitionMoveInL.transitionWithDuration(t, s);
        case 18:
            return cc.TransitionMoveInR.transitionWithDuration(t, s);
        case 19:
            return cc.TransitionMoveInT.transitionWithDuration(t, s);
        case 20:
            return cc.TransitionMoveInB.transitionWithDuration(t, s);
        case 21:
            return cc.TransitionSlideInL.transitionWithDuration(t, s);
        case 22:
            return cc.TransitionSlideInR.transitionWithDuration(t, s);
        case 23:
            return cc.TransitionSlideInT.transitionWithDuration(t, s);
        case 24:
            return cc.TransitionSlideInB.transitionWithDuration(t, s);
        case 25:
            return cc.TransitionCrossFade.transitionWithDuration(t, s);
        case 26:
            return cc.TransitionRadialCCW.transitionWithDuration(t, s);
        case 27:
            return cc.TransitionRadialCW.transitionWithDuration(t, s);
        case 28:
            return PageTransitionForward.transitionWithDuration(t, s);
        case 29:
            return PageTransitionBackward.transitionWithDuration(t, s);
        case 30:
            return cc.TransitionFadeTR.transitionWithDuration(t, s);
        case 31:
            return cc.TransitionFadeBL.transitionWithDuration(t, s);
        case 32:
            return cc.TransitionFadeUp.transitionWithDuration(t, s);
        case 33:
            return cc.TransitionFadeDown.transitionWithDuration(t, s);
        case 34:
            return cc.TransitionTurnOffTiles.transitionWithDuration(t, s);
        case 35:
            return cc.TransitionSplitRows.transitionWithDuration(t, s);
        case 36:
            return cc.TransitionSplitCols.transitionWithDuration(t, s);
        default:
            break;
    }
    return null;
}

// the class inherit from TestScene
// every .Scene each test used must inherit from TestScene,
// make sure the test have the menu item for back to main menu
var TransitionsTestScene = TestScene.extend({
    runThisTest:function () {
        var pLayer = new TestLayer1();
        this.addChild(pLayer);
        cc.Director.sharedDirector().replaceScene(this);
    }
});


var TestLayer1 = cc.Layer.extend({
    ctor:function () {
        this._super();
        this.init();
        var x, y;
        var size = cc.Director.sharedDirector().getWinSize();
        x = size.width;
        y = size.height;

        var bg1 = cc.Sprite.spriteWithFile(s_back1);
        bg1.setPosition(cc.PointMake(size.width / 2, size.height / 2));
        this.addChild(bg1, -1);

        var title = cc.LabelTTF.labelWithString(TransitionsTests[s_nTransitionsIdx], "Thonburi", 32);
        this.addChild(title);
        title.setColor(cc.ccc3(255, 32, 32));
        title.setPosition(cc.PointMake(x / 2, y - 100));

        var label = cc.LabelTTF.labelWithString("SCENE 1", "Marker Felt", 38);
        label.setColor(cc.ccc3(16, 16, 255));
        label.setPosition(cc.PointMake(x / 2, y / 2));
        this.addChild(label);

        // menu
        var item1 = cc.MenuItemImage.itemFromNormalImage(s_pPathB1, s_pPathB2, this, this.backCallback);
        var item2 = cc.MenuItemImage.itemFromNormalImage(s_pPathR1, s_pPathR2, this, this.restartCallback);
        var item3 = cc.MenuItemImage.itemFromNormalImage(s_pPathF1, s_pPathF2, this, this.nextCallback);

        var menu = cc.Menu.menuWithItems(item1, item2, item3, null);

        menu.setPosition(cc.PointZero());
        item1.setPosition(cc.PointMake(size.width / 2 - 100, 30));
        item2.setPosition(cc.PointMake(size.width / 2, 30));
        item3.setPosition(cc.PointMake(size.width / 2 + 100, 30));

        this.addChild(menu, 1);

        this.schedule(this.step, 1.0);

    },
    restartCallback:function (pSender) {
        var s = new TransitionsTestScene();

        var pLayer = new TestLayer2();
        s.addChild(pLayer);
        var pScene = createTransition(s_nTransitionsIdx, TRANSITION_DURATION, s);
        if (pScene) {
            cc.Director.sharedDirector().replaceScene(pScene);
        }
    },
    nextCallback:function (pSender) {
        s_nTransitionsIdx++;
        s_nTransitionsIdx = s_nTransitionsIdx % TransitionsTests.length;

        var s = new TransitionsTestScene();

        var pLayer = new TestLayer2();
        s.addChild(pLayer);

        var pScene = createTransition(s_nTransitionsIdx, TRANSITION_DURATION, s);
        if (pScene) {
            cc.Director.sharedDirector().replaceScene(pScene);
        }
    },
    backCallback:function (pSender) {
        s_nTransitionsIdx--;
        var total = TransitionsTests.length;
        if (s_nTransitionsIdx < 0)
            s_nTransitionsIdx += total;

        var s = new TransitionsTestScene();

        var pLayer = new TestLayer2();
        s.addChild(pLayer);

        var pScene = createTransition(s_nTransitionsIdx, TRANSITION_DURATION, s);
        if (pScene) {
            cc.Director.sharedDirector().replaceScene(pScene);
        }
    },

    step:function (dt) {

    }
});

var TestLayer2 = cc.Layer.extend({
    ctor:function () {
        this._super();
        this.init();
        var x, y;
        var size = cc.Director.sharedDirector().getWinSize();
        x = size.width;
        y = size.height;

        var bg1 = cc.Sprite.spriteWithFile(s_back2);
        bg1.setPosition(cc.PointMake(size.width / 2, size.height / 2));
        this.addChild(bg1, -1);

        var title = cc.LabelTTF.labelWithString(TransitionsTests[s_nTransitionsIdx], "Thonburi", 32);
        this.addChild(title);
        title.setColor(cc.ccc3(255, 32, 32));
        title.setPosition(cc.PointMake(x / 2, y - 100));

        var label = cc.LabelTTF.labelWithString("SCENE 2", "Marker Felt", 38);
        label.setColor(cc.ccc3(16, 16, 255));
        label.setPosition(cc.PointMake(x / 2, y / 2));
        this.addChild(label);

        // menu
        var item1 = cc.MenuItemImage.itemFromNormalImage(s_pPathB1, s_pPathB2, this, this.backCallback);
        var item2 = cc.MenuItemImage.itemFromNormalImage(s_pPathR1, s_pPathR2, this, this.restartCallback);
        var item3 = cc.MenuItemImage.itemFromNormalImage(s_pPathF1, s_pPathF2, this, this.nextCallback);

        var menu = cc.Menu.menuWithItems(item1, item2, item3, null);

        menu.setPosition(cc.PointZero());
        item1.setPosition(cc.PointMake(x / 2 - 100, 30));
        item2.setPosition(cc.PointMake(x / 2, 30));
        item3.setPosition(cc.PointMake(x / 2 + 100, 30));

        this.addChild(menu, 1);

        this.schedule(this.step, 1.0);
    },
    restartCallback:function (pSender) {
        var s = new TransitionsTestScene();

        var pLayer = new TestLayer1();
        pLayer.init();
        s.addChild(pLayer);

        var pScene = createTransition(s_nTransitionsIdx, TRANSITION_DURATION, s);
        if (pScene) {
            cc.Director.sharedDirector().replaceScene(pScene);
        }
    },
    nextCallback:function (pSender) {
        s_nTransitionsIdx++;
        s_nTransitionsIdx = s_nTransitionsIdx % TransitionsTests.length;

        var s = new TransitionsTestScene();

        var pLayer = new TestLayer1();
        s.addChild(pLayer);

        var pScene = createTransition(s_nTransitionsIdx, TRANSITION_DURATION, s);
        if (pScene) {
            cc.Director.sharedDirector().replaceScene(pScene);
        }
    },
    backCallback:function (pSender) {
        s_nTransitionsIdx--;
        var total = TransitionsTests.length;
        if (s_nTransitionsIdx < 0)
            s_nTransitionsIdx += total;

        var s = new TransitionsTestScene();

        var pLayer = new TestLayer1();
        s.addChild(pLayer);

        var pScene = createTransition(s_nTransitionsIdx, TRANSITION_DURATION, s);
        if (pScene) {
            cc.Director.sharedDirector().replaceScene(pScene);
        }
    },

    step:function (dt) {

    }
});

var FadeWhiteTransition = cc.TransitionFade.extend({});

FadeWhiteTransition.transitionWithDuration = function (t, s) {
    return cc.TransitionFade.transitionWithDuration(t, s, cc.WHITE);
};

var FlipXLeftOver = cc.TransitionFlipX.extend({});

FlipXLeftOver.transitionWithDuration = function (t, s) {
    return cc.TransitionFlipX.transitionWithDuration(t, s, cc.kOrientationLeftOver);
};

var FlipXRightOver = cc.TransitionFlipX.extend({});

FlipXRightOver.transitionWithDuration = function (t, s) {
    return cc.TransitionFlipX.transitionWithDuration(t, s, cc.kOrientationRightOver);
};

var FlipYUpOver = cc.TransitionFlipY.extend({});

FlipYUpOver.transitionWithDuration = function (t, s) {
    return cc.TransitionFlipY.transitionWithDuration(t, s, cc.kOrientationUpOver);
};

var FlipYDownOver = cc.TransitionFlipY.extend({});

FlipYDownOver.transitionWithDuration = function (t, s) {
    return cc.TransitionFlipY.transitionWithDuration(t, s, cc.kOrientationDownOver);
};

var FlipAngularLeftOver = cc.TransitionFlipAngular.extend({});

FlipAngularLeftOver.transitionWithDuration = function (t, s) {
    return cc.TransitionFlipAngular.transitionWithDuration(t, s, cc.kOrientationLeftOver);
};

var FlipAngularRightOver = cc.TransitionFlipAngular.extend({});

FlipAngularRightOver.transitionWithDuration = function (t, s) {
    return cc.TransitionFlipAngular.transitionWithDuration(t, s, cc.kOrientationRightOver);
};

var ZoomFlipXLeftOver = cc.TransitionZoomFlipX.extend({});

ZoomFlipXLeftOver.transitionWithDuration = function (t, s) {
    return cc.TransitionZoomFlipX.transitionWithDuration(t, s, cc.kOrientationLeftOver);
};

var ZoomFlipXRightOver = cc.TransitionZoomFlipX.extend({});

ZoomFlipXRightOver.transitionWithDuration = function (t, s) {
    return cc.TransitionZoomFlipX.transitionWithDuration(t, s, cc.kOrientationRightOver);
};

var ZoomFlipYUpOver = cc.TransitionZoomFlipY.extend({});

ZoomFlipYUpOver.transitionWithDuration = function (t, s) {
    return cc.TransitionZoomFlipY.transitionWithDuration(t, s, cc.kOrientationUpOver);
};

var ZoomFlipYDownOver = cc.TransitionZoomFlipY.extend({});

ZoomFlipYDownOver.transitionWithDuration = function (t, s) {
    return cc.TransitionZoomFlipY.transitionWithDuration(t, s, cc.kOrientationDownOver);
};

var ZoomFlipAngularLeftOver = cc.TransitionZoomFlipAngular.extend({});

ZoomFlipAngularLeftOver.transitionWithDuration = function (t, s) {
    return cc.TransitionZoomFlipAngular.transitionWithDuration(t, s, cc.kOrientationLeftOver);
};

var ZoomFlipAngularRightOver = cc.TransitionZoomFlipAngular.extend({});

ZoomFlipAngularRightOver.transitionWithDuration = function (t, s) {
    return cc.TransitionZoomFlipAngular.transitionWithDuration(t, s, cc.kOrientationRightOver);
};

var PageTransitionForward = cc.TransitionPageTurn.extend({});

PageTransitionForward.transitionWithDuration = function (t, s) {
    cc.Director.sharedDirector().setDepthTest(true);
    return cc.TransitionPageTurn.transitionWithDuration(t, s, false);
};

var PageTransitionBackward = cc.TransitionPageTurn.extend({});

PageTransitionBackward.transitionWithDuration = function (t, s) {
    cc.Director.sharedDirector().setDepthTest(true);
    return cc.TransitionPageTurn.transitionWithDuration(t, s, true);
};