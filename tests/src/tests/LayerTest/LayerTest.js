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
cc.TAG_LAYER = 1;

var LayerTests = [
    function () {
        return new LayerTest1();
    }, //ok
    function () {
        return new LayerTest2();
    }, //ok
    function () {
        return new LayerTestBlend();
    }, //todo fix Inverse color
    function () {
        return new LayerGradient();
    }, //todo fix ccMenuItem
    function () {
        return new IgnoreAnchorpointTest1();
    },
    function () {
        return new IgnoreAnchorpointTest2();
    },
    function () {
        return new IgnoreAnchorpointTest3();
    },
    function () {
        return new IgnoreAnchorpointTest4();
    }
];
var s_nLayerTestsIdx = -1;
function nextLayerTestAction() {
    ++s_nLayerTestsIdx;
    s_nLayerTestsIdx = s_nLayerTestsIdx % LayerTests.length;
    return LayerTests[s_nLayerTestsIdx]();
}
function backLayerTestAction() {
    --s_nLayerTestsIdx;
    if (s_nLayerTestsIdx < 0) {
        s_nLayerTestsIdx += LayerTests.length;
    }
    return LayerTests[s_nLayerTestsIdx]();
}
function restartLayerTestAction() {
    return LayerTests[s_nLayerTestsIdx]();
}

var LayerTestScene = TestScene.extend({
    runThisTest:function () {
        s_nLayerTestsIdx = -1;
        this.addChild(nextLayerTestAction());
        cc.Director.getInstance().replaceScene(this);
    }
});

//------------------------------------------------------------------
//
// LayerTest
//
//------------------------------------------------------------------
var LayerTest = cc.Layer.extend({
    _title:null,
    title:function () {
        return "No title";
    },
    subtitle:function () {
        return "";
    },
    onEnter:function () {
        this._super();
        var s = cc.Director.getInstance().getWinSize();

        var label = cc.LabelTTF.create(this.title(), "Arial", 32);
        this.addChild(label, 1);
        label.setPosition(cc.p(s.width / 2, s.height - 50));

        var subtitle_ = this.subtitle();
        if (subtitle_) {
            var l = cc.LabelTTF.create(subtitle_, "Thonburi", 16, cc.size(400, 16), cc.TEXT_ALIGNMENT_CENTER);
            this.addChild(l, 1);
            l.setPosition(cc.p(s.width / 2, s.height - 80));
        }

        var item1 = cc.MenuItemImage.create(s_pathB1, s_pathB2, this, this.backCallback);
        var item2 = cc.MenuItemImage.create(s_pathR1, s_pathR2, this, this.restartCallback);
        var item3 = cc.MenuItemImage.create(s_pathF1, s_pathF2, this, this.nextCallback);

        var menu = cc.Menu.create(item1, item2, item3, null);

        menu.setPosition(cc.PointZero());
        item1.setPosition(cc.p(s.width / 2 - 100, 30));
        item2.setPosition(cc.p(s.width / 2, 30));
        item3.setPosition(cc.p(s.width / 2 + 100, 30));

        this.addChild(menu, 1);
    },

    restartCallback:function (sender) {
        var s = new LayerTestScene();
        s.addChild(restartLayerTestAction());

        cc.Director.getInstance().replaceScene(s);

    },
    nextCallback:function (sender) {
        var s = new LayerTestScene();
        s.addChild(nextLayerTestAction());
        cc.Director.getInstance().replaceScene(s);

    },
    backCallback:function (sender) {
        var s = new LayerTestScene();
        s.addChild(backLayerTestAction());
        cc.Director.getInstance().replaceScene(s);

    }
});

//------------------------------------------------------------------
//
// LayerTest1
//
//------------------------------------------------------------------
var LayerTest1 = LayerTest.extend({
    onEnter:function () {
        this._super();
        this.setTouchEnabled(true);

        var s = cc.Director.getInstance().getWinSize();
        var layer = cc.LayerColor.create(cc.c4b(255, 0, 0, 128), 200, 200);

        layer.ignoreAnchorPointForPosition(false);
        layer.setPosition(cc.p(s.width / 2, s.height / 2));
        this.addChild(layer, 1, cc.TAG_LAYER);
    },
    title:function () {
        return "ColorLayer resize (tap & move)";
    },

    registerWithTouchDispatcher:function () {
        cc.Director.getInstance().getTouchDispatcher().addTargetedDelegate(this, cc.MENU_HANDLER_PRIORITY + 1, true);
    },
    updateSize:function (touch) {
        var touchLocation = touch.getLocation();
        touchLocation = cc.Director.getInstance().convertToGL(touchLocation);

        var s = cc.Director.getInstance().getWinSize();

        var newSize = cc.size(Math.abs(touchLocation.x - s.width / 2) * 2, Math.abs(touchLocation.y - s.height / 2) * 2);

        var l = this.getChildByTag(cc.TAG_LAYER);

        l.setContentSize(newSize);
    },

    onTouchBegan:function (touch, event) {
        this.updateSize(touch);
        return true;
    },
    onTouchMoved:function (touch, event) {
        this.updateSize(touch);
    },
    onTouchEnded:function (touch, event) {
        this.updateSize(touch);
    }
});

var IgnoreAnchorpointTest1 = LayerTest.extend({
    onEnter:function () {
        this._super();
        //create layer
        var ws = cc.Director.getInstance().getWinSize();
        var layer1 = cc.LayerColor.create(cc.c4b(255, 100, 100, 128), ws.width / 2, ws.height / 2);
        layer1.ignoreAnchorPointForPosition(true);
        var layer2 = cc.LayerColor.create(cc.c4b(100, 255, 100, 128), ws.width / 4, ws.height / 4);
        layer2.ignoreAnchorPointForPosition(true);
        layer1.addChild(layer2);
        layer1.setPosition(ws.width / 2, ws.height / 2);
        this.addChild(layer1);
    },
    title:function () {
        return "ignore Anchorpoint Test";
    },
    subtitle:function () {
        return "red:true  green:true";
    }
});
var IgnoreAnchorpointTest2 = LayerTest.extend({
    onEnter:function () {
        this._super();
        //create layer
        var ws = cc.Director.getInstance().getWinSize();
        var layer1 = cc.LayerColor.create(cc.c4b(255, 100, 100, 128), ws.width / 2, ws.height / 2);
        layer1.ignoreAnchorPointForPosition(true);
        var layer2 = cc.LayerColor.create(cc.c4b(100, 255, 100, 128), ws.width / 4, ws.height / 4);
        layer2.ignoreAnchorPointForPosition(false);
        layer1.addChild(layer2);
        layer1.setPosition(ws.width / 2, ws.height / 2);
        this.addChild(layer1);
    },
    title:function () {
        return "ignore Anchorpoint Test";
    },
    subtitle:function () {
        return "red:true  green:false";
    }
});
var IgnoreAnchorpointTest3 = LayerTest.extend({
    onEnter:function () {
        this._super();
        //create layer
        var ws = cc.Director.getInstance().getWinSize();
        var layer1 = cc.LayerColor.create(cc.c4b(255, 100, 100, 128), ws.width / 2, ws.height / 2);
        layer1.ignoreAnchorPointForPosition(false);
        var layer2 = cc.LayerColor.create(cc.c4b(100, 255, 100, 128), ws.width / 4, ws.height / 4);
        layer2.ignoreAnchorPointForPosition(false);
        layer1.addChild(layer2);
        layer1.setPosition(ws.width / 2, ws.height / 2);
        this.addChild(layer1);
    },
    title:function () {
        return "ignore Anchorpoint Test";
    },
    subtitle:function () {
        return "red:false  green:false";
    }
});
var IgnoreAnchorpointTest4 = LayerTest.extend({
    onEnter:function () {
        this._super();
        //create layer
        var ws = cc.Director.getInstance().getWinSize();
        var layer1 = cc.LayerColor.create(cc.c4b(255, 100, 100, 128), ws.width / 2, ws.height / 2);
        layer1.ignoreAnchorPointForPosition(false);
        var layer2 = cc.LayerColor.create(cc.c4b(100, 255, 100, 128), ws.width / 4, ws.height / 4);
        layer2.ignoreAnchorPointForPosition(true);
        layer1.addChild(layer2);
        layer1.setPosition(ws.width / 2, ws.height / 2);
        this.addChild(layer1);
    },
    title:function () {
        return "ignore Anchorpoint Test";
    },
    subtitle:function () {
        return "red:false  green:true";
    }
});

//------------------------------------------------------------------
//
// LayerTest2
//
//------------------------------------------------------------------
var LayerTest2 = LayerTest.extend({
    onEnter:function () {
        this._super();

        var s = cc.Director.getInstance().getWinSize();
        var layer1 = cc.LayerColor.create(cc.c4b(255, 255, 0, 80), 100, 300);
        layer1.setPosition(cc.p(s.width / 3, s.height / 2));
        layer1.ignoreAnchorPointForPosition(false);
        this.addChild(layer1, 1);

        var layer2 = cc.LayerColor.create(cc.c4b(0, 0, 255, 255), 100, 300);
        layer2.setPosition(cc.p((s.width / 3) * 2, s.height / 2));
        layer2.ignoreAnchorPointForPosition(false);
        this.addChild(layer2, 1);

        var actionTint = cc.TintBy.create(2, -255, -127, 0);
        var actionTintBack = actionTint.reverse();
        var seq1 = cc.Sequence.create(actionTint, actionTintBack, null);
        layer1.runAction(seq1);

        var actionFade = cc.FadeOut.create(2.0);
        var actionFadeBack = actionFade.reverse();
        var seq2 = cc.Sequence.create(actionFade, actionFadeBack, null);
        layer2.runAction(seq2);
    },
    title:function () {
        return "ColorLayer: fade and tint";
    }
});

//------------------------------------------------------------------
//
// LayerTestBlend
//
//------------------------------------------------------------------
var LayerTestBlend = LayerTest.extend({
    ctor:function () {
        var s = cc.Director.getInstance().getWinSize();
        var layer1 = cc.LayerColor.create(cc.c4b(255, 255, 255, 80));

        var sister1 = cc.Sprite.create(s_pathSister1);
        var sister2 = cc.Sprite.create(s_pathSister2);

        this.addChild(sister1);
        this.addChild(sister2);
        this.addChild(layer1, 100, cc.TAG_LAYER);

        sister1.setPosition(cc.p(160, s.height / 2));
        sister2.setPosition(cc.p(320, s.height / 2));

        this.schedule(this.newBlend, 1.0);
    },
    newBlend:function (dt) {
        var layer = this.getChildByTag(cc.TAG_LAYER);

        var src;
        var dst;

        if (layer.getBlendFunc().dst == gl.ZERO) {
            src = gl.BLEND_SRC;
            dst = gl.BLEND_DST;
        }
        else {
            src = gl.ONE_MINUS_DST_COLOR;
            dst = gl.ZERO;
        }
        layer.setBlendFunc( src, dst );
    },
    title:function () {
        return "ColorLayer: blend";
    }
});

//------------------------------------------------------------------
//
// LayerGradient
//
//------------------------------------------------------------------
var LayerGradient = LayerTest.extend({
    ctor:function () {
        var layer1 = cc.LayerGradient.create(cc.c4b(255, 0, 0, 255), cc.c4b(0, 255, 0, 255), cc.p(0.9, 0.9));
        this.addChild(layer1, 0, cc.TAG_LAYER);

        this.setTouchEnabled(true);

        /*var label1 = cc.LabelTTF.create("Compressed Interpolation: Enabled", "Marker Felt", 26);
         var label2 = cc.LabelTTF.create("Compressed Interpolation: Disabled", "Marker Felt", 26);
         var item1 = cc.MenuItemLabel.create(label1);
         var item2 = cc.MenuItemLabel.create(label2);
         var item = cc.MenuItemToggle.create(this, this.toggleItem, item1, item2, null);

         var menu = cc.Menu.create(item, null);
         this.addChild(menu);
         var s = cc.Director.getInstance().getWinSize();
         menu.setPosition(cc.p(s.width / 2, 100));*/
    },
    prevLocation:null,
    registerWithTouchDispatcher:function () {
        cc.Director.getInstance().getTouchDispatcher().addTargetedDelegate(this, 0, true);
    },
    onTouchBegan:function (touch, event) {
        return true;
    },
    onTouchEnded:function (touch, event) {
        this.prevLocation = null;
    },
    onTouchCancelled:function (touch, event) {
    },
    onTouchMoved:function (touch, event) {
        var s = cc.Director.getInstance().getWinSize();
        var start = touch.getLocation();

        var diff = cc.pSub(cc.p(s.width / 2, s.height / 2), start);
        diff = cc.pNormalize(diff);

        var gradient = this.getChildByTag(1);
        gradient.setVector(diff);
    },
    title:function () {
        return "LayerGradient";
    },
    subtitle:function () {
        return "Touch the screen and move your finger";
    },
    toggleItem:function (sender) {
        var gradient = this.getChildByTag(cc.TAG_LAYER);
        gradient.setCompressedInterpolation(!gradient.isCompressedInterpolation());
    }
});
