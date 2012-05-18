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
cc.kTagLayer = 1;

var LayerTests = [
    "LayerTest1", //ok
    "LayerTest2", //ok
    "LayerTestBlend", //todo fix Inverse color
    "LayerGradient" //todo fix ccMenuItem
];
var s_nLayerTestsIdx = -1;
function nextLayerTestAction() {
    ++s_nLayerTestsIdx;
    s_nLayerTestsIdx = s_nLayerTestsIdx % LayerTests.length;
    return new window[LayerTests[s_nLayerTestsIdx]];
}
function backLayerTestAction() {
    --s_nLayerTestsIdx;
    if (s_nLayerTestsIdx < 0) {
        s_nLayerTestsIdx += LayerTests.length;
    }
    return new window[LayerTests[s_nLayerTestsIdx]];
}
function restartLayerTestAction() {
    return new window[LayerTests[s_nLayerTestsIdx]];
}

var LayerTestScene = TestScene.extend({
    runThisTest:function () {
        s_nLayerTestsIdx = -1;
        this.addChild(nextLayerTestAction());
        cc.Director.sharedDirector().replaceScene(this);
    }
});

//------------------------------------------------------------------
//
// LayerTest
//
//------------------------------------------------------------------
var LayerTest = cc.Layer.extend({
    m_strTitle:null,
    title:function () {
        return "No title";
    },
    subtitle:function () {
        return "";
    },
    onEnter:function () {
        this._super();
        var s = cc.Director.sharedDirector().getWinSize();

        var label = cc.LabelTTF.labelWithString(this.title(), "Arial", 32);
        this.addChild(label, 1);
        label.setPosition(cc.PointMake(s.width / 2, s.height - 50));

        var subtitle_ = this.subtitle();
        if (subtitle_) {
            var l = cc.LabelTTF.labelWithString(subtitle_, "Thonburi", 16);
            this.addChild(l, 1);
            l.setPosition(cc.ccp(s.width / 2, s.height - 80));
        }

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
        var s = new LayerTestScene();
        s.addChild(restartLayerTestAction());

        cc.Director.sharedDirector().replaceScene(s);

    },
    nextCallback:function (pSender) {
        var s = new LayerTestScene();
        s.addChild(nextLayerTestAction());
        cc.Director.sharedDirector().replaceScene(s);

    },
    backCallback:function (pSender) {
        var s = new LayerTestScene();
        s.addChild(backLayerTestAction());
        cc.Director.sharedDirector().replaceScene(s);

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
        this.setIsTouchEnabled(true);

        var s = cc.Director.sharedDirector().getWinSize();
        var layer = cc.LayerColor.layerWithColorWidthHeight(cc.ccc4(255, 0, 0, 128), 200, 200);

        layer.setIsRelativeAnchorPoint(true);
        layer.setPosition(cc.PointMake(s.width / 2, s.height / 2));
        this.addChild(layer, 1, cc.kTagLayer);
    },
    title:function () {
        return "ColorLayer resize (tap & move)";
    },

    registerWithTouchDispatcher:function () {
        cc.TouchDispatcher.sharedDispatcher().addTargetedDelegate(this, cc.kCCMenuTouchPriority + 1, true);
    },
    updateSize:function (touch) {
        var touchLocation = touch.locationInView(touch.view());
        touchLocation = cc.Director.sharedDirector().convertToGL(touchLocation);

        var s = cc.Director.sharedDirector().getWinSize();

        var newSize = cc.SizeMake(Math.abs(touchLocation.x - s.width / 2) * 2, Math.abs(touchLocation.y - s.height / 2) * 2);

        var l = this.getChildByTag(cc.kTagLayer);

        l.setContentSize(newSize);
    },

    ccTouchBegan:function (touch, event) {
        this.updateSize(touch);
        return true;
    },
    ccTouchMoved:function (touch, event) {
        this.updateSize(touch);
    },
    ccTouchEnded:function (touch, event) {
        this.updateSize(touch);
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

        var s = cc.Director.sharedDirector().getWinSize();
        var layer1 = cc.LayerColor.layerWithColorWidthHeight(cc.ccc4(255, 255, 0, 80), 100, 300);
        layer1.setPosition(cc.PointMake(s.width / 3, s.height / 2));
        layer1.setIsRelativeAnchorPoint(true);
        this.addChild(layer1, 1);

        var layer2 = cc.LayerColor.layerWithColorWidthHeight(cc.ccc4(0, 0, 255, 255), 100, 300);
        layer2.setPosition(cc.PointMake((s.width / 3) * 2, s.height / 2));
        layer2.setIsRelativeAnchorPoint(true);
        this.addChild(layer2, 1);

        var actionTint = cc.TintBy.actionWithDuration(2, -255, -127, 0);
        var actionTintBack = actionTint.reverse();
        var seq1 = cc.Sequence.actions(actionTint, actionTintBack, null);
        layer1.runAction(seq1);

        var actionFade = cc.FadeOut.actionWithDuration(2.0);
        var actionFadeBack = actionFade.reverse();
        var seq2 = cc.Sequence.actions(actionFade, actionFadeBack, null);
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
        var s = cc.Director.sharedDirector().getWinSize();
        var layer1 = cc.LayerColor.layerWithColor(cc.ccc4(255, 255, 255, 80));

        var sister1 = cc.Sprite.spriteWithFile(s_pPathSister1);
        var sister2 = cc.Sprite.spriteWithFile(s_pPathSister2);

        this.addChild(sister1);
        this.addChild(sister2);
        this.addChild(layer1, 100, cc.kTagLayer);

        sister1.setPosition(cc.PointMake(160, s.height / 2));
        sister2.setPosition(cc.PointMake(320, s.height / 2));

        this.schedule(this.newBlend, 1.0);
    },
    newBlend:function (dt) {
        var layer = this.getChildByTag(cc.kTagLayer);

        var src;
        var dst;

        if (layer.getBlendFunc().dst == cc.ZERO) {
            src = cc.BLEND_SRC;
            dst = cc.BLEND_DST;
        }
        else {
            src = cc.ONE_MINUS_DST_COLOR;
            dst = cc.ZERO;
        }
        var bf = {"src":src, "dst":dst};
        layer.setBlendFunc(bf);
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
        var layer1 = cc.LayerGradient.layerWithColor(cc.ccc4(255, 0, 0, 255), cc.ccc4(0, 255, 0, 255), cc.ccp(0.9, 0.9));
        this.addChild(layer1, 0, cc.kTagLayer);

        this.setIsTouchEnabled(true);

        /*var label1 = cc.LabelTTF.labelWithString("Compressed Interpolation: Enabled", "Marker Felt", 26);
        var label2 = cc.LabelTTF.labelWithString("Compressed Interpolation: Disabled", "Marker Felt", 26);
        var item1 = cc.MenuItemLabel.itemWithLabel(label1);
        var item2 = cc.MenuItemLabel.itemWithLabel(label2);
        var item = cc.MenuItemToggle.itemWithTarget(this, this.toggleItem, item1, item2, null);

        var menu = cc.Menu.menuWithItems(item, null);
        this.addChild(menu);
        var s = cc.Director.sharedDirector().getWinSize();
        menu.setPosition(cc.ccp(s.width / 2, 100));*/
    },
    prevLocation:null,
    registerWithTouchDispatcher:function () {
        cc.TouchDispatcher.sharedDispatcher().addTargetedDelegate(this, 0, true);
    },
    ccTouchBegan:function (touch, event) {
        return true;
    },
    ccTouchEnded:function (touch, event) {
        this.prevLocation = null;
    },
    ccTouchCancelled:function (touch, event) {
    },
    ccTouchMoved:function (touch, event) {
        var s = cc.Director.sharedDirector().getWinSize();
       var start = touch.locationInView(touch.view());

        var diff = cc.ccpSub(cc.ccp(s.width / 2, s.height / 2), start);
        diff = cc.ccpNormalize(diff);

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
        var gradient = this.getChildByTag(cc.kTagLayer);
        gradient.setIsCompressedInterpolation(!gradient.getIsCompressedInterpolation());
    }
});