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
TRANSITION_DURATION = 1.2;

var TransitionsTests = [
    "JumpZoomTransition", //ok
    "FadeTransition", //ok
    "FadeWhiteTransition",//ok

    /*"FlipXLeftOver",
    "FlipXRightOver",
    "FlipYUpOver",
    "FlipYDownOver",
    "FlipAngularLeftOver",
    "FlipAngularRightOver",
    "ZoomFlipXLeftOver",
    "ZoomFlipXRightOver",
    "ZoomFlipYUpOver",
    "ZoomFlipYDownOver",
    "ZoomFlipAngularLeftOver",
    "ZoomFlipAngularRightOver",*/

    "ShrinkGrowTransition",//ok
    "RotoZoomTransition",//ok
    "MoveInLTransition",//ok
    "MoveInRTransition",//ok
    "MoveInTTransition",//ok
    "MoveInBTransition",//ok
    "SlideInLTransition",//ok
    "SlideInRTransition",//ok
    "SlideInTTransition",//ok
    "SlideInBTransition"//ok

   /* "CCTransitionCrossFade",
    "CCTransitionRadialCCW",
    "CCTransitionRadialCW",*/

    /*"PageTransitionForward",
    "PageTransitionBackward",
    "FadeTRTransition",
    "FadeBLTransition",
    "FadeUpTransition",
    "FadeDownTransition",
    "TurnOffTilesTransition",
    "SplitRowsTransition",
    "SplitColsTransition"*/
];
var s_nTransitionsIdx = 0;
function nextTransitionAction(t,s) {
    ++s_nTransitionsIdx;
    s_nTransitionsIdx = s_nTransitionsIdx % TransitionsTests.length;
    return new window[TransitionsTests[s_nTransitionsIdx]](t,s);
}
function backTransitionAction(t,s) {
    --s_nTransitionsIdx;
    if (s_nTransitionsIdx < 0) {
        s_nTransitionsIdx += TransitionsTests.length;
    }
    return new window[TransitionsTests[s_nTransitionsIdx]](t,s);
}
function restartTransitionAction(t,s) {
    return new window[TransitionsTests[s_nTransitionsIdx]](t,s);
}

// the class inherit from TestScene
// every .Scene each test used must inherit from TestScene,
// make sure the test have the menu item for back to main menu
var TransitionsTestScene = TestScene.extend({
    runThisTest:function () {
        var pLayer = new TestLayer1();
        this.addChild(pLayer);
        cc.Director.sharedDirector().replaceScene(this);

        /*s_nTransitionsIdx = -1;
        this.addChild(nextTransitionAction());
        cc.Director.sharedDirector().replaceScene(this);*/
    }
});


var TestLayer1 = cc.Layer.extend({
    ctor:function () {
        this._super();
        //this.init();
        var x, y;
        var size = cc.Director.sharedDirector().getWinSize();
        x = size.width;
        y = size.height;

        var bg1 = cc.Sprite.spriteWithFile(s_back1);
        bg1.setPosition(cc.PointMake(size.width / 2, size.height / 2));
        bg1.setScale(1.7);
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
        var pScene = restartTransitionAction(TRANSITION_DURATION,s)

        if (pScene) {
            cc.Director.sharedDirector().replaceScene(pScene);
        }
    },
    nextCallback:function (pSender) {
        var s = new TransitionsTestScene();

        var pLayer = new TestLayer2();
        s.addChild(pLayer);

        var pScene = nextTransitionAction(TRANSITION_DURATION,s)
        if (pScene) {
            cc.Director.sharedDirector().replaceScene(pScene);
        }
    },
    backCallback:function (pSender) {
        var s = new TransitionsTestScene();

        var pLayer = new TestLayer2();
        s.addChild(pLayer);

        var pScene = backTransitionAction(TRANSITION_DURATION,s)
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
        //this.init();
        var x, y;
        var size = cc.Director.sharedDirector().getWinSize();
        x = size.width;
        y = size.height;

        var bg1 = cc.Sprite.spriteWithFile(s_back2);
        bg1.setPosition(cc.PointMake(size.width / 2, size.height / 2));
        bg1.setScale(1.7);
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
        s.addChild(pLayer);

        var pScene = restartTransitionAction(TRANSITION_DURATION,s)
        if (pScene) {
            cc.Director.sharedDirector().replaceScene(pScene);
        }
    },
    nextCallback:function (pSender) {
        var s = new TransitionsTestScene();

        var pLayer = new TestLayer1();
        s.addChild(pLayer);

        var pScene = nextTransitionAction(TRANSITION_DURATION,s)
        if (pScene) {
            cc.Director.sharedDirector().replaceScene(pScene);
        }
    },
    backCallback:function (pSender) {
        var s = new TransitionsTestScene();

        var pLayer = new TestLayer1();
        s.addChild(pLayer);

        var pScene = nextTransitionAction(TRANSITION_DURATION,s)
        if (pScene) {
            cc.Director.sharedDirector().replaceScene(pScene);
        }
    },

    step:function (dt) {

    }
});

var JumpZoomTransition = function (t, s) {
    return cc.TransitionJumpZoom.transitionWithDuration(t, s);
}
var FadeTransition = function(t,s){
    return cc.TransitionFade.transitionWithDuration(t, s);
}

var FadeWhiteTransition = function (t, s) {
    return cc.TransitionFade.transitionWithDuration(t, s, cc.WHITE());
};

var FlipXLeftOver = function (t, s) {
    return cc.TransitionFlipX.transitionWithDuration(t, s, cc.kOrientationLeftOver);
};

var FlipXRightOver = function (t, s) {
    return cc.TransitionFlipX.transitionWithDuration(t, s, cc.kOrientationRightOver);
};

var FlipYUpOver = function (t, s) {
    return cc.TransitionFlipY.transitionWithDuration(t, s, cc.kOrientationUpOver);
};

var FlipYDownOver = function (t, s) {
    return cc.TransitionFlipY.transitionWithDuration(t, s, cc.kOrientationDownOver);
};

var FlipAngularLeftOver = function (t, s) {
    return cc.TransitionFlipAngular.transitionWithDuration(t, s, cc.kOrientationLeftOver);
};

var FlipAngularRightOver = function (t, s) {
    return cc.TransitionFlipAngular.transitionWithDuration(t, s, cc.kOrientationRightOver);
};

var ZoomFlipXLeftOver = function (t, s) {
    return cc.TransitionZoomFlipX.transitionWithDuration(t, s, cc.kOrientationLeftOver);
};

var ZoomFlipXRightOver = function (t, s) {
    return cc.TransitionZoomFlipX.transitionWithDuration(t, s, cc.kOrientationRightOver);
};

var ZoomFlipYUpOver = function (t, s) {
    return cc.TransitionZoomFlipY.transitionWithDuration(t, s, cc.kOrientationUpOver);
};

var ZoomFlipYDownOver = function (t, s) {
    return cc.TransitionZoomFlipY.transitionWithDuration(t, s, cc.kOrientationDownOver);
};

var ZoomFlipAngularLeftOver = function (t, s) {
    return cc.TransitionZoomFlipAngular.transitionWithDuration(t, s, cc.kOrientationLeftOver);
};

var ZoomFlipAngularRightOver = function (t, s) {
    return cc.TransitionZoomFlipAngular.transitionWithDuration(t, s, cc.kOrientationRightOver);
};

var ShrinkGrowTransition = function (t, s) {
    return cc.TransitionShrinkGrow.transitionWithDuration(t, s);
};

var RotoZoomTransition = function (t, s) {
    return cc.TransitionRotoZoom.transitionWithDuration(t, s);
};

var MoveInLTransition = function (t, s) {
    return cc.TransitionMoveInL.transitionWithDuration(t, s);
};

var MoveInRTransition = function (t, s) {
    return cc.TransitionMoveInR.transitionWithDuration(t, s);
};

var MoveInTTransition = function (t, s) {
    return cc.TransitionMoveInT.transitionWithDuration(t, s);
};

var MoveInBTransition = function (t, s) {
    return cc.TransitionMoveInB.transitionWithDuration(t, s);
};

var SlideInLTransition = function (t, s) {
    return cc.TransitionSlideInL.transitionWithDuration(t, s);
};

var SlideInRTransition = function (t, s) {
    return cc.TransitionSlideInR.transitionWithDuration(t, s);
};

var SlideInTTransition = function (t, s) {
    return cc.TransitionSlideInT.transitionWithDuration(t, s);
};

var SlideInBTransition = function (t, s) {
    return cc.TransitionSlideInB.transitionWithDuration(t, s);
};

var CCTransitionCrossFade = function (t, s) {
    return cc.TransitionCrossFade.transitionWithDuration(t, s);
};

var CCTransitionRadialCCW = function (t, s) {
    return cc.TransitionRadialCCW.transitionWithDuration(t, s);
};

var CCTransitionRadialCW = function (t, s) {
    return cc.TransitionRadialCW.transitionWithDuration(t, s);
};

var PageTransitionForward = function (t, s) {
    cc.Director.sharedDirector().setDepthTest(true);
    return cc.TransitionPageTurn.transitionWithDuration(t, s, false);
};

var PageTransitionBackward = function (t, s) {
    cc.Director.sharedDirector().setDepthTest(true);
    return cc.TransitionPageTurn.transitionWithDuration(t, s, true);
};

var FadeTRTransition = function (t, s) {
    return cc.TransitionFadeTR.transitionWithDuration(t, s);
};

var FadeBLTransition = function (t, s) {
    return cc.TransitionFadeBL.transitionWithDuration(t, s);
};

var FadeUpTransition = function (t, s) {
    return cc.TransitionFadeUp.transitionWithDuration(t, s);
};

var FadeDownTransition = function (t, s) {
    return cc.TransitionFadeDown.transitionWithDuration(t, s);
};

var TurnOffTilesTransition = function (t, s) {
    return cc.TransitionTurnOffTiles.transitionWithDuration(t, s);
};

var SplitRowsTransition = function (t, s) {
    return cc.TransitionSplitRows.transitionWithDuration(t, s);
};

var SplitColsTransition = function (t, s) {
    return cc.TransitionSplitCols.transitionWithDuration(t, s);
};