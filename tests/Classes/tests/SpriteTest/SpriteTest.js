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
var kTagTileMap = 1;
var kTagSpriteBatchNode = 1;
var kTagNode = 2;
var kTagAnimation1 = 1;
var kTagSpriteLeft = 2;
var kTagSpriteRight = 3;

var kTagSprite1 = 0;
var kTagSprite2 = 1;
var kTagSprite3 = 2;
var kTagSprite4 = 3;
var kTagSprite5 = 4;
var kTagSprite6 = 5;
var kTagSprite7 = 6;
var kTagSprite8 = 7;

var IDC_NEXT = 100;
var IDC_BACK = 101;
var IDC_RESTART = 102;

var sceneIdx = -1;
var MAX_LAYER = 48;

var nextSpriteTestAction = function () {
    sceneIdx++;
    sceneIdx = sceneIdx % MAX_LAYER;

    var pLayer = createSpriteTestLayer(sceneIdx);
    return pLayer;
};
var backSpriteTestAction = function () {
    sceneIdx--;
    if (sceneIdx < 0)
        sceneIdx += MAX_LAYER;

    var pLayer = createSpriteTestLayer(sceneIdx);
    return pLayer;
};
var restartSpriteTestAction = function () {
    var pLayer = createSpriteTestLayer(sceneIdx);
    return pLayer;
};

var createSpriteTestLayer = function (nIndex) {
    switch (nIndex) {
        case 0:
            return new Sprite1();
        case 1:
            return new SpriteBatchNode1();
        case 2:
            return new SpriteFrameTest();
        case 3:
            return new SpriteFrameAliasNameTest();
        case 4:
            return new SpriteAnchorPoint();
        case 5:
            return new SpriteBatchNodeAnchorPoint();
        case 6:
            return new SpriteOffsetAnchorRotation();
        case 7:
            return new SpriteBatchNodeOffsetAnchorRotation();
        case 8:
            return new SpriteOffsetAnchorScale();
        case 9:
            return new SpriteBatchNodeOffsetAnchorScale();
        case 10:
            return new SpriteAnimationSplit();
        case 11:
            return new SpriteColorOpacity();
        case 12:
            return new SpriteBatchNodeColorOpacity();
        case 13:
            return new SpriteZOrder();
        case 14:
            return new SpriteBatchNodeZOrder();
        case 15:
            return new SpriteBatchNodeReorder();
        case 16:
            return new SpriteBatchNodeReorderIssue744();
        case 17:
            return new SpriteBatchNodeReorderIssue766();
        case 18:
            return new SpriteBatchNodeReorderIssue767();
        case 19:
            return new SpriteZVertex();
        case 20:
            return new SpriteBatchNodeZVertex();
        case 21:
            return new Sprite6();
        case 22:
            return new SpriteFlip();
        case 23:
            return new SpriteBatchNodeFlip();
        case 24:
            return new SpriteAliased();
        case 25:
            return new SpriteBatchNodeAliased();
        case 26:
            return new SpriteNewTexture();
        case 27:
            return new SpriteBatchNodeNewTexture();
        case 28:
            return new SpriteHybrid();
        case 29:
            return new SpriteBatchNodeChildren();
        case 30:
            return new SpriteBatchNodeChildren2();
        case 31:
            return new SpriteBatchNodeChildrenZ();
        case 32:
            return new SpriteChildrenVisibility();
        case 33:
            return new SpriteChildrenVisibilityIssue665();
        case 34:
            return new SpriteChildrenAnchorPoint();
        case 35:
            return new SpriteBatchNodeChildrenAnchorPoint();
        case 36:
            return new SpriteBatchNodeChildrenScale();
        case 37:
            return new SpriteChildrenChildren();
        case 38:
            return new SpriteBatchNodeChildrenChildren();
        case 39:
            return new SpriteNilTexture();
        case 40:
            return new SpriteSubclass();
        case 41:
            return new AnimationCache();
        case 42:
            return new SpriteOffsetAnchorSkew();
        case 43:
            return new SpriteBatchNodeOffsetAnchorSkew();
        case 44:
            return new SpriteOffsetAnchorSkewScale();
        case 45:
            return new SpriteBatchNodeOffsetAnchorSkewScale();
        case 46:
            return new SpriteOffsetAnchorFlip();
        case 47:
            return new SpriteBatchNodeOffsetAnchorFlip();
    }
    return null;
};

//------------------------------------------------------------------
//
// SpriteTestDemo
//
//------------------------------------------------------------------
var SpriteTestDemo = cc.Layer.extend({
    _m_strTitle:"",

    ctor:function () {
        this._super();
    },
    title:function () {
        return "No title";
    },
    subtitle:function () {
        return "";
    },
    onEnter:function () {
        this._super();

        var winSize = cc.Director.sharedDirector().getWinSize();

        var label = cc.LabelTTF.labelWithString(this.title(), "Arial", 28);
        this.addChild(label, 1);
        label.setPosition(cc.ccp(winSize.width / 2, winSize.height - 50));

        var strSubtitle = this.subtitle();
        if (strSubtitle != "") {
            var l = cc.LabelTTF.labelWithString(strSubtitle, "Thonburi", 16);
            this.addChild(l, 1);
            l.setPosition(cc.ccp(winSize.width / 2, winSize.height - 80));
        }

        var item1 = cc.MenuItemImage.itemFromNormalImage(s_pPathB1, s_pPathB2, this, this.backCallback);
        var item2 = cc.MenuItemImage.itemFromNormalImage(s_pPathR1, s_pPathR2, this, this.restartCallback);
        var item3 = cc.MenuItemImage.itemFromNormalImage(s_pPathF1, s_pPathF2, this, this.nextCallback);

        var menu = cc.Menu.menuWithItems(item1, item2, item3, null);

        menu.setPosition(cc.PointZero());
        item1.setPosition(cc.ccp(winSize.width / 2 - 100, 30));
        item2.setPosition(cc.ccp(winSize.width / 2, 30));
        item3.setPosition(cc.ccp(winSize.width / 2 + 100, 30));

        this.addChild(menu, 1);
    },

    restartCallback:function (pSender) {
        var s = new SpriteTestScene();
        s.addChild(restartSpriteTestAction());

        cc.Director.sharedDirector().replaceScene(s);
    },
    nextCallback:function (pSender) {
        var s = new SpriteTestScene();
        s.addChild(nextSpriteTestAction());
        cc.Director.sharedDirector().replaceScene(s);
    },
    backCallback:function (pSender) {
        var s = new SpriteTestScene();
        s.addChild(backSpriteTestAction());
        cc.Director.sharedDirector().replaceScene(s);
    }
});

//------------------------------------------------------------------
//
// Sprite1
//
//------------------------------------------------------------------
var Sprite1 = SpriteTestDemo.extend({
    ctor:function () {
        this.setIsTouchEnabled(true);

        var s = cc.Director.sharedDirector().getWinSize();
        this.addNewSpriteWithCoords(cc.ccp(s.width / 2, s.height / 2));
    },
    title:function () {
        return "Sprite (tap screen)";
    },

    addNewSpriteWithCoords:function (p) {
        var idx = 0 | (cc.RANDOM_0_1() * 14);
        var x = (idx % 5) * 85;
        var y = (0 | (idx / 5)) * 121;
        var sprite = cc.Sprite.spriteWithFile(s_grossini_dance_atlas, cc.RectMake(x, y, 85, 121));
        this.addChild(sprite);
        sprite.setPosition(cc.ccp(p.x, p.y));

        var action;
        var random = cc.RANDOM_0_1();
        if (random < 0.20) {
            action = cc.ScaleBy.actionWithDuration(3, 2);
        } else if (random < 0.40) {
            action = cc.RotateBy.actionWithDuration(3, 360);
        } else if (random < 0.60) {
            action = cc.Blink.actionWithDuration(1, 3);
        } else if (random < 0.8) {
            action = cc.TintBy.actionWithDuration(2, 0, -255, -255);
        } else {
            action = cc.FadeOut.actionWithDuration(2);
        }

        var action_back = action.reverse();
        var seq = cc.Sequence.actions(action, action_back, null);

        sprite.runAction(cc.RepeatForever.actionWithAction(seq));
    },
    ccTouchesEnded:function (touches, event) {
        for (var it = 0; it < touches.length; it++) {
            var touch = touches[it];

            if (!touch)
                break;

            var location = touch.locationInView(touch.view());
            //location = cc.Director.sharedDirector().convertToGL(location);
            this.addNewSpriteWithCoords(location);
        }
    }
});

//------------------------------------------------------------------
//
// SpriteBatchNode1
//
//------------------------------------------------------------------
var SpriteBatchNode1 = SpriteTestDemo.extend({
    ctor:function () {
        this.setIsTouchEnabled(true);

        var BatchNode = cc.SpriteBatchNode.batchNodeWithFile(s_grossini_dance_atlas, 50);
        this.addChild(BatchNode, 0, kTagSpriteBatchNode);

        var s = cc.Director.sharedDirector().getWinSize();
        this.addNewSpriteWithCoords(cc.ccp(s.width / 2, s.height / 2));
    },
    title:function () {
        return "SpriteBatchNode (tap screen)";
    },

    addNewSpriteWithCoords:function (p) {
        var BatchNode = this.getChildByTag(kTagSpriteBatchNode);

        var idx = 0 | (cc.RANDOM_0_1() * 14);
        var x = (idx % 5) * 85;
        var y = (0 | (idx / 5)) * 121;

        var sprite = cc.Sprite.spriteWithTexture(BatchNode.getTexture(), cc.RectMake(x, y, 85, 121));
        BatchNode.addChild(sprite);

        sprite.setPosition(cc.ccp(p.x, p.y));

        var action;
        var random = cc.RANDOM_0_1();

        if (random < 0.20)
            action = cc.ScaleBy.actionWithDuration(3, 2);
        else if (random < 0.40)
            action = cc.RotateBy.actionWithDuration(3, 360);
        else if (random < 0.60)
            action = cc.Blink.actionWithDuration(1, 3);
        else if (random < 0.8)
            action = cc.TintBy.actionWithDuration(2, 0, -255, -255);
        else
            action = cc.FadeOut.actionWithDuration(2);

        var action_back = action.reverse();
        var seq = cc.Sequence.actions(action, action_back, null);

        sprite.runAction(cc.RepeatForever.actionWithAction(seq));
    },
    ccTouchesEnded:function (touches, event) {
        for (var it = 0; it < touches.length; it++) {
            var touch = touches[it];

            if (!touch)
                break;

            var location = touch.locationInView(touch.view());
            //location = cc.Director.sharedDirector().convertToGL(location);
            this.addNewSpriteWithCoords(location);
        }
    }
});

//------------------------------------------------------------------
//
// SpriteColorOpacity
//
//------------------------------------------------------------------
var SpriteColorOpacity = SpriteTestDemo.extend({
    ctor:function () {
        var sprite1 = cc.Sprite.spriteWithFile(s_grossini_dance_atlas, cc.RectMake(85 * 0, 121 * 1, 85, 121));
        var sprite2 = cc.Sprite.spriteWithFile(s_grossini_dance_atlas, cc.RectMake(85 * 1, 121 * 1, 85, 121));
        var sprite3 = cc.Sprite.spriteWithFile(s_grossini_dance_atlas, cc.RectMake(85 * 2, 121 * 1, 85, 121));
        var sprite4 = cc.Sprite.spriteWithFile(s_grossini_dance_atlas, cc.RectMake(85 * 3, 121 * 1, 85, 121));

        var sprite5 = cc.Sprite.spriteWithFile(s_grossini_dance_atlas, cc.RectMake(85 * 0, 121 * 1, 85, 121));
        var sprite6 = cc.Sprite.spriteWithFile(s_grossini_dance_atlas, cc.RectMake(85 * 1, 121 * 1, 85, 121));
        var sprite7 = cc.Sprite.spriteWithFile(s_grossini_dance_atlas, cc.RectMake(85 * 2, 121 * 1, 85, 121));
        var sprite8 = cc.Sprite.spriteWithFile(s_grossini_dance_atlas, cc.RectMake(85 * 3, 121 * 1, 85, 121));

        var winSize = cc.Director.sharedDirector().getWinSize();
        sprite1.setPosition(cc.ccp((winSize.width / 5) * 1, (winSize.height / 3) * 1));
        sprite2.setPosition(cc.ccp((winSize.width / 5) * 2, (winSize.height / 3) * 1));
        sprite3.setPosition(cc.ccp((winSize.width / 5) * 3, (winSize.height / 3) * 1));
        sprite4.setPosition(cc.ccp((winSize.width / 5) * 4, (winSize.height / 3) * 1));
        sprite5.setPosition(cc.ccp((winSize.width / 5) * 1, (winSize.height / 3) * 2));
        sprite6.setPosition(cc.ccp((winSize.width / 5) * 2, (winSize.height / 3) * 2));
        sprite7.setPosition(cc.ccp((winSize.width / 5) * 3, (winSize.height / 3) * 2));
        sprite8.setPosition(cc.ccp((winSize.width / 5) * 4, (winSize.height / 3) * 2));

        var action = cc.FadeIn.actionWithDuration(2);
        var action_back = action.reverse();
        var fade = cc.RepeatForever.actionWithAction(cc.Sequence.actions(action, action_back, null));

        var tintred = cc.TintBy.actionWithDuration(2, 0, -255, -255);
        var tintred_back = tintred.reverse();
        var red = cc.RepeatForever.actionWithAction(cc.Sequence.actions(tintred, tintred_back, null));

        var tintgreen = cc.TintBy.actionWithDuration(2, -255, 0, -255);
        var tintgreen_back = tintgreen.reverse();
        var green = cc.RepeatForever.actionWithAction(cc.Sequence.actions(tintgreen, tintgreen_back, null));

        var tintblue = cc.TintBy.actionWithDuration(2, -255, -255, 0);
        var tintblue_back = tintblue.reverse();
        var blue = cc.RepeatForever.actionWithAction(cc.Sequence.actions(tintblue, tintblue_back, null));

        sprite5.runAction(red);
        sprite6.runAction(green);
        sprite7.runAction(blue);
        sprite8.runAction(fade);

        // late add: test dirtyColor and dirtyPosition
        this.addChild(sprite1, 0, kTagSprite1);
        this.addChild(sprite2, 0, kTagSprite2);
        this.addChild(sprite3, 0, kTagSprite3);
        this.addChild(sprite4, 0, kTagSprite4);
        this.addChild(sprite5, 0, kTagSprite5);
        this.addChild(sprite6, 0, kTagSprite6);
        this.addChild(sprite7, 0, kTagSprite7);
        this.addChild(sprite8, 0, kTagSprite8);

        this.schedule(this.removeAndAddSprite, 2);
    },
    // this function test if remove and add works as expected:
//   color array and vertex array should be reindexed
    removeAndAddSprite:function (dt) {
        var sprite = this.getChildByTag(kTagSprite5);

        this.removeChild(sprite, false);
        this.addChild(sprite, 0, kTagSprite5);
    },
    title:function () {
        return "Sprite: Color & Opacity";
    }
});

//------------------------------------------------------------------
//
// SpriteBatchNodeColorOpacity
//
//------------------------------------------------------------------
var SpriteBatchNodeColorOpacity = SpriteTestDemo.extend({
    ctor:function () {
        // small capacity. Testing resizing.
        // Don't use capacity=1 in your real game. It is expensive to resize the capacity
        var batch = cc.SpriteBatchNode.batchNodeWithFile(s_grossini_dance_atlas, 1);
        this.addChild(batch, 0, kTagSpriteBatchNode);

        var sprite1 = cc.Sprite.spriteWithTexture(batch.getTexture(), cc.RectMake(85 * 0, 121 * 1, 85, 121));
        var sprite2 = cc.Sprite.spriteWithTexture(batch.getTexture(), cc.RectMake(85 * 1, 121 * 1, 85, 121));
        var sprite3 = cc.Sprite.spriteWithTexture(batch.getTexture(), cc.RectMake(85 * 2, 121 * 1, 85, 121));
        var sprite4 = cc.Sprite.spriteWithTexture(batch.getTexture(), cc.RectMake(85 * 3, 121 * 1, 85, 121));

        var sprite5 = cc.Sprite.spriteWithTexture(batch.getTexture(), cc.RectMake(85 * 0, 121 * 1, 85, 121));
        var sprite6 = cc.Sprite.spriteWithTexture(batch.getTexture(), cc.RectMake(85 * 1, 121 * 1, 85, 121));
        var sprite7 = cc.Sprite.spriteWithTexture(batch.getTexture(), cc.RectMake(85 * 2, 121 * 1, 85, 121));
        var sprite8 = cc.Sprite.spriteWithTexture(batch.getTexture(), cc.RectMake(85 * 3, 121 * 1, 85, 121));


        var winSize = cc.Director.sharedDirector().getWinSize();
        sprite1.setPosition(cc.ccp((winSize.width / 5) * 1, (winSize.height / 3) * 1));
        sprite2.setPosition(cc.ccp((winSize.width / 5) * 2, (winSize.height / 3) * 1));
        sprite3.setPosition(cc.ccp((winSize.width / 5) * 3, (winSize.height / 3) * 1));
        sprite4.setPosition(cc.ccp((winSize.width / 5) * 4, (winSize.height / 3) * 1));
        sprite5.setPosition(cc.ccp((winSize.width / 5) * 1, (winSize.height / 3) * 2));
        sprite6.setPosition(cc.ccp((winSize.width / 5) * 2, (winSize.height / 3) * 2));
        sprite7.setPosition(cc.ccp((winSize.width / 5) * 3, (winSize.height / 3) * 2));
        sprite8.setPosition(cc.ccp((winSize.width / 5) * 4, (winSize.height / 3) * 2));

        var action = cc.FadeIn.actionWithDuration(2);
        var action_back = action.reverse();
        var fade = cc.RepeatForever.actionWithAction(cc.Sequence.actions(action, action_back, null));

        var tintred = cc.TintBy.actionWithDuration(2, 0, -255, -255);
        var tintred_back = tintred.reverse();
        var red = cc.RepeatForever.actionWithAction(cc.Sequence.actions(tintred, tintred_back, null));

        var tintgreen = cc.TintBy.actionWithDuration(2, -255, 0, -255);
        var tintgreen_back = tintgreen.reverse();
        var green = cc.RepeatForever.actionWithAction(cc.Sequence.actions(tintgreen, tintgreen_back, null));

        var tintblue = cc.TintBy.actionWithDuration(2, -255, -255, 0);
        var tintblue_back = tintblue.reverse();
        var blue = cc.RepeatForever.actionWithAction(cc.Sequence.actions(tintblue, tintblue_back, null));

        sprite5.runAction(red);
        sprite6.runAction(green);
        sprite7.runAction(blue);
        sprite8.runAction(fade);

        // late add: test dirtyColor and dirtyPosition
        batch.addChild(sprite1, 0, kTagSprite1);
        batch.addChild(sprite2, 0, kTagSprite2);
        batch.addChild(sprite3, 0, kTagSprite3);
        batch.addChild(sprite4, 0, kTagSprite4);
        batch.addChild(sprite5, 0, kTagSprite5);
        batch.addChild(sprite6, 0, kTagSprite6);
        batch.addChild(sprite7, 0, kTagSprite7);
        batch.addChild(sprite8, 0, kTagSprite8);

        this.schedule(this.removeAndAddSprite, 2);
    },
    // this function test if remove and add works as expected:
    //   color array and vertex array should be reindexed
    removeAndAddSprite:function (dt) {
        var batch = this.getChildByTag(kTagSpriteBatchNode);
        var sprite = batch.getChildByTag(kTagSprite5);

        batch.removeChild(sprite, false);
        batch.addChild(sprite, 0, kTagSprite5);
    },
    title:function () {
        return "SpriteBatchNode: Color & Opacity";
    }
});

//------------------------------------------------------------------
//
// SpriteZOrder
//
//------------------------------------------------------------------
var SpriteZOrder = SpriteTestDemo.extend({
    _m_dir:0,
    ctor:function () {
        this._m_dir = 1;

        var s = cc.Director.sharedDirector().getWinSize();

        var step = s.width / 11;
        for (var i = 0; i < 5; i++) {
            var sprite = cc.Sprite.spriteWithFile(s_grossini_dance_atlas, cc.RectMake(85 * 0, 121 * 1, 85, 121));
            sprite.setPosition(cc.ccp((i + 1) * step, s.height / 2));
            this.addChild(sprite, i);
        }

        for (i = 5; i < 10; i++) {
            var sprite = cc.Sprite.spriteWithFile(s_grossini_dance_atlas, cc.RectMake(85 * 1, 121 * 0, 85, 121));
            sprite.setPosition(cc.ccp((i + 1) * step, s.height / 2));
            this.addChild(sprite, 14 - i);
        }

        var sprite = cc.Sprite.spriteWithFile(s_grossini_dance_atlas, cc.RectMake(85 * 3, 121 * 0, 85, 121));
        this.addChild(sprite, -1, kTagSprite1);
        sprite.setPosition(cc.ccp(s.width / 2, s.height / 2 - 20));
        sprite.setScaleX(6);
        sprite.setColor(cc.RED());

        this.schedule(this.reorderSprite, 1);
    },
    reorderSprite:function (dt) {
        var sprite = this.getChildByTag(kTagSprite1);

        var z = sprite.getZOrder();

        if (z < -1)
            this._m_dir = 1;
        if (z > 10)
            this._m_dir = -1;

        z += this._m_dir * 3;

        this.reorderChild(sprite, z);
    },
    title:function () {
        return "Sprite: Z order";
    }
});

//------------------------------------------------------------------
//
// SpriteBatchNodeZOrder
//
//------------------------------------------------------------------
var SpriteBatchNodeZOrder = SpriteTestDemo.extend({
    _m_dir:0,
    ctor:function () {
        this._m_dir = 1;

        // small capacity. Testing resizing.
        // Don't use capacity=1 in your real game. It is expensive to resize the capacity
        var batch = cc.SpriteBatchNode.batchNodeWithFile(s_grossini_dance_atlas, 1);
        this.addChild(batch, 0, kTagSpriteBatchNode);

        var s = cc.Director.sharedDirector().getWinSize();

        var step = s.width / 11;
        for (var i = 0; i < 5; i++) {
            var sprite = cc.Sprite.spriteWithTexture(batch.getTexture(), cc.RectMake(85 * 0, 121 * 1, 85, 121));
            sprite.setPosition(cc.ccp((i + 1) * step, s.height / 2));
            batch.addChild(sprite, i);
        }

        for (i = 5; i < 10; i++) {
            var sprite = cc.Sprite.spriteWithTexture(batch.getTexture(), cc.RectMake(85 * 1, 121 * 0, 85, 121));
            sprite.setPosition(cc.ccp((i + 1) * step, s.height / 2));
            batch.addChild(sprite, 14 - i);
        }

        var sprite = cc.Sprite.spriteWithTexture(batch.getTexture(), cc.RectMake(85 * 3, 121 * 0, 85, 121));
        batch.addChild(sprite, -1, kTagSprite1);
        sprite.setPosition(cc.ccp(s.width / 2, s.height / 2 - 20));
        sprite.setScaleX(6);
        sprite.setColor(cc.RED());

        this.schedule(this.reorderSprite, 1);
    },
    reorderSprite:function (dt) {
        var batch = this.getChildByTag(kTagSpriteBatchNode);
        var sprite = batch.getChildByTag(kTagSprite1);

        var z = sprite.getZOrder();

        if (z < -1)
            this._m_dir = 1;
        if (z > 10)
            this._m_dir = -1;

        z += this._m_dir * 3;

        batch.reorderChild(sprite, z);
    },
    title:function () {
        return "SpriteBatchNode: Z order";
    }
});

//------------------------------------------------------------------
//
// SpriteBatchNodeReorder
//
//------------------------------------------------------------------
var SpriteBatchNodeReorder = SpriteTestDemo.extend({
    ctor:function () {
        var a = [];
        var asmtest = cc.SpriteBatchNode.batchNodeWithFile(s_ghosts);

        for (var i = 0; i < 10; i++) {
            var s1 = cc.Sprite.spriteWithBatchNode(asmtest, cc.RectMake(0, 0, 50, 50));
            a.push(s1);
            asmtest.addChild(s1, 10);
        }

        for (i = 0; i < 10; i++) {
            if (i != 5)
                asmtest.reorderChild(a[i], 9);
        }

        var prev = -1;
        var children = asmtest.getChildren();

        for (i = 0; i < children.length; i++) {
            var child = children[i];
            if (!child)
                break;

            //TODO need fixed
            var currentIndex = child.getAtlasIndex();
            //cc.Assert(prev == currentIndex - 1, "Child order failed");
            ////----UXLOG("children %x - atlasIndex:%d", child, currentIndex);
            prev = currentIndex;
        }

        prev = -1;
        var sChildren = asmtest.getDescendants();
        for (i = 0; i < sChildren.length; i++) {
            child = sChildren[i];
            if (!child)
                break;

            var currentIndex = child.getAtlasIndex();
            //cc.Assert(prev == currentIndex - 1, "Child order failed");
            ////----UXLOG("descendant %x - atlasIndex:%d", child, currentIndex);
            prev = currentIndex;
        }
    },
    title:function () {
        return "SpriteBatchNode: reorder #1";
    },
    subtitle:function () {
        return "Should not crash";
    }
});

//------------------------------------------------------------------
//
// SpriteBatchNodeReorderIssue744
//
//------------------------------------------------------------------
var SpriteBatchNodeReorderIssue744 = SpriteTestDemo.extend({
    ctor:function () {
        var s = cc.Director.sharedDirector().getWinSize();

        // Testing issue #744
        // http://code.google.com/p/cocos2d-iphone/issues/detail?id=744
        var batch = cc.SpriteBatchNode.batchNodeWithFile(s_grossini_dance_atlas, 15);
        this.addChild(batch, 0, kTagSpriteBatchNode);

        var sprite = cc.Sprite.spriteWithBatchNode(batch, cc.RectMake(0, 0, 85, 121));
        sprite.setPosition(cc.ccp(s.width / 2, s.height / 2));
        batch.addChild(sprite, 3);
        batch.reorderChild(sprite, 1);
    },
    title:function () {
        return "SpriteBatchNode: reorder issue #744";
    },
    subtitle:function () {
        return "Should not crash";
    }
});

//------------------------------------------------------------------
//
// SpriteBatchNodeReorderIssue766
//
//------------------------------------------------------------------
var SpriteBatchNodeReorderIssue766 = SpriteTestDemo.extend({
    _batchNode:null,
    _sprite1:null,
    _sprite2:null,
    _sprite3:null,
    ctor:function () {
        this._batchNode = cc.SpriteBatchNode.batchNodeWithFile(s_piece, 15);
        this.addChild(this._batchNode, 1, 0);

        this._sprite1 = this.makeSpriteZ(2);
        this._sprite1.setPosition(cc.PointMake(200, 160));

        this._sprite2 = this.makeSpriteZ(3);
        this._sprite2.setPosition(cc.PointMake(264, 160));

        this._sprite3 = this.makeSpriteZ(4);
        this._sprite3.setPosition(cc.PointMake(328, 160));

        this.schedule(this.reorderSprite, 2);
    },
    title:function () {
        return "SpriteBatchNode: reorder issue #766";
    },
    subtitle:function () {
        return "In 2 seconds 1 sprite will be reordered";
    },
    reorderSprite:function (dt) {
        this.unschedule(this.reorderSprite);

        this._batchNode.reorderChild(this._sprite1, 4);
    },
    makeSpriteZ:function (aZ) {
        var sprite = cc.Sprite.spriteWithBatchNode(this._batchNode, cc.RectMake(128, 0, 64, 64));
        this._batchNode.addChild(sprite, aZ + 1, 0);

        //children
        var spriteShadow = cc.Sprite.spriteWithBatchNode(this._batchNode, cc.RectMake(0, 0, 64, 64));
        spriteShadow.setOpacity(128);
        sprite.addChild(spriteShadow, aZ, 3);

        var spriteTop = cc.Sprite.spriteWithBatchNode(this._batchNode, cc.RectMake(64, 0, 64, 64));
        sprite.addChild(spriteTop, aZ + 2, 3);

        return sprite;
    }
});

//------------------------------------------------------------------
//
// SpriteBatchNodeReorderIssue767
//
//------------------------------------------------------------------
var SpriteBatchNodeReorderIssue767 = SpriteTestDemo.extend({
    ctor:function () {
        var winSize = cc.Director.sharedDirector().getWinSize();

        cc.SpriteFrameCache.sharedSpriteFrameCache().addSpriteFramesWithFile(s_ghostsPlist, s_ghosts);
        //
        // SpriteBatchNode: 3 levels of children
        //
        var aParent = cc.SpriteBatchNode.batchNodeWithFile(s_ghosts);
        this.addChild(aParent, 0, kTagSprite1);

        // parent
        var l1 = cc.Sprite.spriteWithSpriteFrameName("father.gif");
        l1.setPosition(cc.ccp(winSize.width / 2, winSize.height / 2));
        aParent.addChild(l1, 0, kTagSprite2);
        var l1Size = l1.getContentSize();

        // child left
        var l2a = cc.Sprite.spriteWithSpriteFrameName("sister1.gif");
        l2a.setPosition(cc.ccp(-25 + l1Size.width / 2, 0 + l1Size.height / 2));
        l1.addChild(l2a, -1, kTagSpriteLeft);
        var l2aSize = l2a.getContentSize();


        // child right
        var l2b = cc.Sprite.spriteWithSpriteFrameName("sister2.gif");
        l2b.setPosition(cc.ccp(+25 + l1Size.width / 2, 0 + l1Size.height / 2));
        l1.addChild(l2b, 1, kTagSpriteRight);
        var l2bSize = l2a.getContentSize();


        // child left bottom
        var l3a1 = cc.Sprite.spriteWithSpriteFrameName("child1.gif");
        l3a1.setScale(0.65);
        l3a1.setPosition(cc.ccp(0 + l2aSize.width / 2, -50 + l2aSize.height / 2));
        l2a.addChild(l3a1, -1);

        // child left top
        var l3a2 = cc.Sprite.spriteWithSpriteFrameName("child1.gif");
        l3a2.setScale(0.65);
        l3a2.setPosition(cc.ccp(0 + l2aSize.width / 2, +50 + l2aSize.height / 2));
        l2a.addChild(l3a2, 1);

        // child right bottom
        var l3b1 = cc.Sprite.spriteWithSpriteFrameName("child1.gif");
        l3b1.setScale(0.65);
        l3b1.setPosition(cc.ccp(0 + l2bSize.width / 2, -50 + l2bSize.height / 2));
        l2b.addChild(l3b1, -1);

        // child right top
        var l3b2 = cc.Sprite.spriteWithSpriteFrameName("child1.gif");
        l3b2.setScale(0.65);
        l3b2.setPosition(cc.ccp(0 + l2bSize.width / 2, +50 + l2bSize.height / 2));
        l2b.addChild(l3b2, 1);

        this.schedule(this.reorderSprites, 1);
    },
    title:function () {
        return "SpriteBatchNode: reorder issue #767";
    },
    subtitle:function () {
        return "Should not crash";
    },
    reorderSprites:function (dt) {
        var spritebatch = this.getChildByTag(kTagSprite1);
        var father = spritebatch.getChildByTag(kTagSprite2);
        var left = father.getChildByTag(kTagSpriteLeft);
        var right = father.getChildByTag(kTagSpriteRight);

        var newZLeft = 1;

        if (left.getZOrder() == 1)
            newZLeft = -1;

        father.reorderChild(left, newZLeft);
        father.reorderChild(right, -newZLeft);
    }
});

//------------------------------------------------------------------
//
// SpriteZVertex
//
//------------------------------------------------------------------
var SpriteZVertex = SpriteTestDemo.extend({
    _m_dir:0,
    _m_time:0,
    ctor:function () {
        //
        // This test tests z-order
        // If you are going to use it is better to use a 3D projection
        //
        // WARNING:
        // The developer is resposible for ordering it's sprites according to it's Z if the sprite has
        // transparent parts.
        //
        this._m_dir = 1;
        this._m_time = 0;

        var s = cc.Director.sharedDirector().getWinSize();
        var step = s.width / 12;

        var node = cc.Node.node();
        // camera uses the center of the image as the pivoting point
        node.setContentSize(cc.SizeMake(s.width, s.height));
        node.setAnchorPoint(cc.ccp(0.5, 0.5));
        node.setPosition(cc.ccp(s.width / 2, s.height / 2));

        this.addChild(node, 0);

        for (var i = 0; i < 5; i++) {
            var sprite = cc.Sprite.spriteWithFile(s_grossini_dance_atlas, cc.RectMake(85 * 0, 121 * 1, 85, 121));
            sprite.setPosition(cc.ccp((i + 1) * step, s.height / 2));
            sprite.setVertexZ(10 + i * 40);
            node.addChild(sprite, 0);
        }

        for (i = 5; i < 11; i++) {
            var sprite = cc.Sprite.spriteWithFile(s_grossini_dance_atlas, cc.RectMake(85 * 1, 121 * 0, 85, 121));
            sprite.setPosition(cc.ccp((i + 1) * step, s.height / 2));
            sprite.setVertexZ(10 + (10 - i) * 40);
            node.addChild(sprite, 0);
        }

        node.runAction(cc.OrbitCamera.actionWithDuration(10, 1, 0, 0, 360, 0, 0));
    },
    title:function () {
        return "Sprite: openGL Z vertex";
    },
    onEnter:function () {
        this._super();

        //TODO
        // TIP: don't forget to enable Alpha test
        //glEnable(GL_ALPHA_TEST);
        //glAlphaFunc(GL_GREATER, 0.0);
        cc.Director.sharedDirector().setProjection(cc.DirectorProjection3D);
    },
    onExit:function () {
        //glDisable(GL_ALPHA_TEST);
        cc.Director.sharedDirector().setProjection(cc.DirectorProjection2D);
        this._super();
    }
});

//------------------------------------------------------------------
//
// SpriteBatchNodeZVertex
//
//------------------------------------------------------------------
var SpriteBatchNodeZVertex = SpriteTestDemo.extend({
    _m_dir:0,
    _m_time:0,
    ctor:function () {
        //
        // This test tests z-order
        // If you are going to use it is better to use a 3D projection
        //
        // WARNING:
        // The developer is resposible for ordering it's sprites according to it's Z if the sprite has
        // transparent parts.
        //
        var s = cc.Director.sharedDirector().getWinSize();
        var step = s.width / 12;

        // small capacity. Testing resizing.
        // Don't use capacity=1 in your real game. It is expensive to resize the capacity
        var batch = cc.SpriteBatchNode.batchNodeWithFile(s_grossini_dance_atlas, 1);
        // camera uses the center of the image as the pivoting point
        batch.setContentSize(cc.SizeMake(s.width, s.height));
        batch.setAnchorPoint(cc.ccp(0.5, 0.5));
        batch.setPosition(cc.ccp(s.width / 2, s.height / 2));

        this.addChild(batch, 0, kTagSpriteBatchNode);

        for (var i = 0; i < 5; i++) {
            var sprite = cc.Sprite.spriteWithTexture(batch.getTexture(), cc.RectMake(85 * 0, 121 * 1, 85, 121));
            sprite.setPosition(cc.ccp((i + 1) * step, s.height / 2));
            sprite.setVertexZ(10 + i * 40);
            batch.addChild(sprite, 0);

        }

        for (i = 5; i < 11; i++) {
            var sprite = cc.Sprite.spriteWithTexture(batch.getTexture(), cc.RectMake(85 * 1, 121 * 0, 85, 121));
            sprite.setPosition(cc.ccp((i + 1) * step, s.height / 2));
            sprite.setVertexZ(10 + (10 - i) * 40);
            batch.addChild(sprite, 0);
        }

        batch.runAction(cc.OrbitCamera.actionWithDuration(10, 1, 0, 0, 360, 0, 0));
    },
    title:function () {
        return "SpriteBatchNode: openGL Z vertex";
    },
    onEnter:function () {
        this._super();

        //TODO
        // TIP: don't forget to enable Alpha test
        //glEnable(GL_ALPHA_TEST);
        //glAlphaFunc(GL_GREATER, 0.0);

        cc.Director.sharedDirector().setProjection(cc.DirectorProjection3D);
    },
    onExit:function () {
        //glDisable(GL_ALPHA_TEST);
        cc.Director.sharedDirector().setProjection(cc.DirectorProjection2D);
        this._super();
    }
});

//------------------------------------------------------------------
//
// SpriteAnchorPoint
//
//------------------------------------------------------------------
var SpriteAnchorPoint = SpriteTestDemo.extend({
    ctor:function () {
        var s = cc.Director.sharedDirector().getWinSize();

        for (var i = 0; i < 3; i++) {
            var rotate = cc.RotateBy.actionWithDuration(10, 360);
            var action = cc.RepeatForever.actionWithAction(rotate);
            var sprite = cc.Sprite.spriteWithFile(s_grossini_dance_atlas, cc.RectMake(85 * i, 121 * 1, 85, 121));
            sprite.setPosition(cc.ccp(s.width / 4 * (i + 1), s.height / 2));

            var point = cc.Sprite.spriteWithFile(s_pPathR1);
            point.setScale(0.25);
            point.setPosition(sprite.getPosition());
            this.addChild(point, 10);

            switch (i) {
                case 0:
                    sprite.setAnchorPoint(cc.PointZero());
                    break;
                case 1:
                    sprite.setAnchorPoint(cc.ccp(0.5, 0.5));
                    break;
                case 2:
                    sprite.setAnchorPoint(cc.ccp(1, 1));
                    break;
            }

            point.setPosition(sprite.getPosition());

            //var copy = action.copy();
            sprite.runAction(action);
            this.addChild(sprite, i);
        }
    },
    title:function () {
        return "Sprite: anchor point";
    }
});

//------------------------------------------------------------------
//
// SpriteBatchNodeAnchorPoint
//
//------------------------------------------------------------------
var SpriteBatchNodeAnchorPoint = SpriteTestDemo.extend({
    ctor:function () {
        // small capacity. Testing resizing.
        // Don't use capacity=1 in your real game. It is expensive to resize the capacity
        var batch = cc.SpriteBatchNode.batchNodeWithFile(s_grossini_dance_atlas, 1);
        this.addChild(batch, 0, kTagSpriteBatchNode);

        var s = cc.Director.sharedDirector().getWinSize();

        for (var i = 0; i < 3; i++) {
            var rotate = cc.RotateBy.actionWithDuration(10, 360);
            var action = cc.RepeatForever.actionWithAction(rotate);
            var sprite = cc.Sprite.spriteWithTexture(batch.getTexture(), cc.RectMake(85 * i, 121 * 1, 85, 121));
            sprite.setPosition(cc.ccp(s.width / 4 * (i + 1), s.height / 2));

            var point = cc.Sprite.spriteWithFile(s_pPathR1);
            point.setScale(0.25);
            point.setPosition(sprite.getPosition());
            this.addChild(point, 1);

            switch (i) {
                case 0:
                    sprite.setAnchorPoint(cc.PointZero());
                    break;
                case 1:
                    sprite.setAnchorPoint(cc.ccp(0.5, 0.5));
                    break;
                case 2:
                    sprite.setAnchorPoint(cc.ccp(1, 1));
                    break;
            }

            point.setPosition(sprite.getPosition());
            sprite.runAction(action);
            batch.addChild(sprite, i);
        }
    },
    title:function () {
        return "SpriteBatchNode: anchor point";
    }
});

//------------------------------------------------------------------
//
// Sprite6
//
//------------------------------------------------------------------
var Sprite6 = SpriteTestDemo.extend({
    ctor:function () {
        // small capacity. Testing resizing
        // Don't use capacity=1 in your real game. It is expensive to resize the capacity
        var batch = cc.SpriteBatchNode.batchNodeWithFile(s_grossini_dance_atlas, 1);
        this.addChild(batch, 0, kTagSpriteBatchNode);
        batch.setIsRelativeAnchorPoint(false);

        var s = cc.Director.sharedDirector().getWinSize();

        batch.setAnchorPoint(cc.ccp(0.5, 0.5));
        batch.setContentSize(cc.SizeMake(s.width, s.height));

        // SpriteBatchNode actions
        var rotate1 = cc.RotateBy.actionWithDuration(5, 360);
        var rotate_back = rotate1.reverse();
        var rotate_seq = cc.Sequence.actions(rotate1, rotate_back, null);
        var rotate_forever = cc.RepeatForever.actionWithAction(rotate_seq);

        var scale = cc.ScaleBy.actionWithDuration(5, 1.5);
        var scale_back = scale.reverse();
        var scale_seq = cc.Sequence.actions(scale, scale_back, null);
        var scale_forever = cc.RepeatForever.actionWithAction(scale_seq);

        var step = s.width / 4;

        for (var i = 0; i < 3; i++) {
            var sprite = cc.Sprite.spriteWithTexture(batch.getTexture(), cc.RectMake(85 * i, 121 * 1, 85, 121));
            sprite.setPosition(cc.ccp((i + 1) * step, s.height / 2));

            var rotate = cc.RotateBy.actionWithDuration(5, 360);
            var action = cc.RepeatForever.actionWithAction(rotate);
            sprite.runAction(action.copy());
            batch.addChild(sprite, i);
        }

        batch.runAction(scale_forever);
        batch.runAction(rotate_forever);
    },
    title:function () {
        return "SpriteBatchNode transformation";
    }
});

var SpriteFlip = SpriteTestDemo.extend({
    ctor:function () {
        var s = cc.Director.sharedDirector().getWinSize();

        var sprite1 = cc.Sprite.spriteWithFile(s_grossini_dance_atlas, cc.RectMake(85 * 1, 121 * 1, 85, 121));
        sprite1.setPosition(cc.ccp(s.width / 2 - 100, s.height / 2));
        this.addChild(sprite1, 0, kTagSprite1);

        var sprite2 = cc.Sprite.spriteWithFile(s_grossini_dance_atlas, cc.RectMake(85 * 1, 121 * 1, 85, 121));
        sprite2.setPosition(cc.ccp(s.width / 2 + 100, s.height / 2));
        this.addChild(sprite2, 0, kTagSprite2);

        this.schedule(this.flipSprites, 1);
    },
    title:function () {
        return "Sprite Flip X & Y";
    },
    flipSprites:function (dt) {
        var sprite1 = this.getChildByTag(kTagSprite1);
        var sprite2 = this.getChildByTag(kTagSprite2);

        cc.LOG("Pre: " + sprite1.getContentSize().height);
        sprite1.setFlipX(!sprite1.isFlipX());
        sprite2.setFlipY(!sprite2.isFlipY());
        cc.LOG("Post: " + sprite1.getContentSize().height);
    }
});

//------------------------------------------------------------------
//
// SpriteBatchNodeFlip
//
//------------------------------------------------------------------
var SpriteBatchNodeFlip = SpriteTestDemo.extend({
    ctor:function () {
        var batch = cc.SpriteBatchNode.batchNodeWithFile(s_grossini_dance_atlas, 10);
        this.addChild(batch, 0, kTagSpriteBatchNode);

        var s = cc.Director.sharedDirector().getWinSize();

        var sprite1 = cc.Sprite.spriteWithTexture(batch.getTexture(), cc.RectMake(85 * 1, 121 * 1, 85, 121));
        sprite1.setPosition(cc.ccp(s.width / 2 - 100, s.height / 2));
        batch.addChild(sprite1, 0, kTagSprite1);

        var sprite2 = cc.Sprite.spriteWithTexture(batch.getTexture(), cc.RectMake(85 * 1, 121 * 1, 85, 121));
        sprite2.setPosition(cc.ccp(s.width / 2 + 100, s.height / 2));
        batch.addChild(sprite2, 0, kTagSprite2);

        this.schedule(this.flipSprites, 1);
    },
    title:function () {
        return "SpriteBatchNode Flip X & Y";
    },
    flipSprites:function (dt) {
        var batch = this.getChildByTag(kTagSpriteBatchNode);
        var sprite1 = batch.getChildByTag(kTagSprite1);
        var sprite2 = batch.getChildByTag(kTagSprite2);

        cc.LOG("Pre: " + sprite1.getContentSize().height);
        sprite1.setFlipX(!sprite1.isFlipX());
        sprite2.setFlipY(!sprite2.isFlipY());
        cc.LOG("Post: " + sprite1.getContentSize().height);
    }
});

//------------------------------------------------------------------
//
// SpriteAliased
//
//------------------------------------------------------------------
var SpriteAliased = SpriteTestDemo.extend({
    ctor:function () {
        var s = cc.Director.sharedDirector().getWinSize();

        var sprite1 = cc.Sprite.spriteWithFile(s_grossini_dance_atlas, cc.RectMake(85 * 1, 121 * 1, 85, 121));
        sprite1.setPosition(cc.ccp(s.width / 2 - 100, s.height / 2));
        this.addChild(sprite1, 0, kTagSprite1);

        var sprite2 = cc.Sprite.spriteWithFile(s_grossini_dance_atlas, cc.RectMake(85 * 1, 121 * 1, 85, 121));
        sprite2.setPosition(cc.ccp(s.width / 2 + 100, s.height / 2));
        this.addChild(sprite2, 0, kTagSprite2);

        var scale = cc.ScaleBy.actionWithDuration(2, 5);
        var scale_back = scale.reverse();
        var seq = cc.Sequence.actions(scale, scale_back, null);
        var repeat = cc.RepeatForever.actionWithAction(seq);

        var scale2 = cc.ScaleBy.actionWithDuration(2, 5);
        var scale_back2 = scale2.reverse();
        var seq2 = cc.Sequence.actions(scale2, scale_back2, null);
        var repeat2 = cc.RepeatForever.actionWithAction(seq2);

        sprite1.runAction(repeat);
        sprite2.runAction(repeat2);
    },
    title:function () {
        return "Sprite Aliased";
    },
    onEnter:function () {
        this._super();
        //
        // IMPORTANT:
        // This change will affect every sprite that uses the same texture
        // So sprite1 and sprite2 will be affected by this change
        //
        var sprite = this.getChildByTag(kTagSprite1);
        //sprite.getTexture().setAliasTexParameters();
    },
    onExit:function () {
        var sprite = this.getChildByTag(kTagSprite1);
        //sprite.getTexture().setAntiAliasTexParameters();
        this._super();
    }
});

//------------------------------------------------------------------
//
// SpriteBatchNodeAliased
//
//------------------------------------------------------------------
var SpriteBatchNodeAliased = SpriteTestDemo.extend({
    ctor:function () {
        var batch = cc.SpriteBatchNode.batchNodeWithFile(s_grossini_dance_atlas, 10);
        this.addChild(batch, 0, kTagSpriteBatchNode);

        var s = cc.Director.sharedDirector().getWinSize();

        var sprite1 = cc.Sprite.spriteWithTexture(batch.getTexture(), cc.RectMake(85 * 1, 121 * 1, 85, 121));
        sprite1.setPosition(cc.ccp(s.width / 2 - 100, s.height / 2));
        batch.addChild(sprite1, 0, kTagSprite1);

        var sprite2 = cc.Sprite.spriteWithTexture(batch.getTexture(), cc.RectMake(85 * 1, 121 * 1, 85, 121));
        sprite2.setPosition(cc.ccp(s.width / 2 + 100, s.height / 2));
        batch.addChild(sprite2, 0, kTagSprite2);

        var scale = cc.ScaleBy.actionWithDuration(2, 5);
        var scale_back = scale.reverse();
        var seq = cc.Sequence.actions(scale, scale_back, null);
        var repeat = cc.RepeatForever.actionWithAction(seq);

        var scale2 = cc.ScaleBy.actionWithDuration(2, 5);
        var scale_back2 = scale2.reverse();
        var seq2 = cc.Sequence.actions(scale2, scale_back2, null);
        var repeat2 = cc.RepeatForever.actionWithAction(seq2);

        sprite1.runAction(repeat);
        sprite2.runAction(repeat2);
    },
    title:function () {
        return "SpriteBatchNode Aliased";
    },
    onEnter:function () {
        this._super();
        var batch = this.getChildByTag(kTagSpriteBatchNode);
        //batch.getTexture().setAliasTexParameters();
    },
    onExit:function () {
        // restore the tex parameter to AntiAliased.
        var batch = this.getChildByTag(kTagSpriteBatchNode);
        //batch.getTexture().setAntiAliasTexParameters();
        this._super();
    }
});

//------------------------------------------------------------------
//
// SpriteNewTexture
//
//------------------------------------------------------------------
var SpriteNewTexture = SpriteTestDemo.extend({
    _m_usingTexture1:false,
    _m_texture1:null,
    _m_texture2:null,
    ctor:function () {
        this.setIsTouchEnabled(true);

        var node = cc.Node.node();
        this.addChild(node, 0, kTagSpriteBatchNode);

        this._m_texture1 = cc.TextureCache.sharedTextureCache().addImage(s_grossini_dance_atlas);
        this._m_texture2 = cc.TextureCache.sharedTextureCache().addImage(s_grossini_dance_atlas_mono);

        this._m_usingTexture1 = true;

        for (var i = 0; i < 30; i++) {
            this.addNewSprite();
        }

    },
    title:function () {
        return "Sprite New texture (tap)";
    },
    addNewSprite:function () {
        var s = cc.Director.sharedDirector().getWinSize();

        var p = cc.ccp(cc.RANDOM_0_1() * s.width, cc.RANDOM_0_1() * s.height);

        var idx = 0 | (cc.RANDOM_0_1() * 14);
        var x = (idx % 5) * 85;
        var y = (0 | (idx / 5)) * 121;


        var node = this.getChildByTag(kTagSpriteBatchNode);
        var sprite = cc.Sprite.spriteWithTexture(this._m_texture1, cc.RectMake(x, y, 85, 121));
        node.addChild(sprite);

        sprite.setPosition(cc.ccp(p.x, p.y));

        var action;
        var random = cc.RANDOM_0_1();

        if (random < 0.20)
            action = cc.ScaleBy.actionWithDuration(3, 2);
        else if (random < 0.40)
            action = cc.RotateBy.actionWithDuration(3, 360);
        else if (random < 0.60)
            action = cc.Blink.actionWithDuration(1, 3);
        // else if (random < 0.8)
        //     action = cc.TintBy.actionWithDuration(2, 0, -255, -255);
        else
            action = cc.FadeOut.actionWithDuration(2);

        var action_back = action.reverse();
        var seq = cc.Sequence.actions(action, action_back, null);

        sprite.runAction(cc.RepeatForever.actionWithAction(seq));
    },
    ccTouchesEnded:function (touches, event) {
        var node = this.getChildByTag(kTagSpriteBatchNode);

        var children = node.getChildren();
        var sprite;

        if (this._m_usingTexture1) {                         //-. win32 : Let's it make just simple sentence
            for (var i = 0; i < children.length; i++) {
                sprite = children[i];
                if (!sprite)
                    break;
                sprite.setTexture(this._m_texture2);
            }
            this._m_usingTexture1 = false;
        } else {
            for (i = 0; i < children.length; i++) {
                sprite = children[i];
                if (!sprite)
                    break;
                sprite.setTexture(this._m_texture1);
            }
            this._m_usingTexture1 = true;
        }
    }
});

//------------------------------------------------------------------
//
// SpriteBatchNodeNewTexture
//
//------------------------------------------------------------------
var SpriteBatchNodeNewTexture = SpriteTestDemo.extend({
    _m_texture1:null,
    _m_texture2:null,
    ctor:function () {
        this.setIsTouchEnabled(true);

        var batch = cc.SpriteBatchNode.batchNodeWithFile(s_grossini_dance_atlas, 50);
        this.addChild(batch, 0, kTagSpriteBatchNode);

        this._m_texture1 = batch.getTexture();
        this._m_texture2 = cc.TextureCache.sharedTextureCache().addImage(s_grossini_dance_atlas_mono);

        for (var i = 0; i < 30; i++) {
            this.addNewSprite();
        }
    },
    title:function () {
        return "SpriteBatchNode new texture (tap)";
    },
    addNewSprite:function () {
        var s = cc.Director.sharedDirector().getWinSize();

        var p = cc.ccp(cc.RANDOM_0_1() * s.width, cc.RANDOM_0_1() * s.height);

        var batch = this.getChildByTag(kTagSpriteBatchNode);

        var idx = 0 | (cc.RANDOM_0_1() * 14);
        var x = (idx % 5) * 85;
        var y = (0 | (idx / 5)) * 121;

        var sprite = cc.Sprite.spriteWithTexture(batch.getTexture(), cc.RectMake(x, y, 85, 121));
        batch.addChild(sprite);

        sprite.setPosition(cc.ccp(p.x, p.y));

        var action;
        var random = cc.RANDOM_0_1();

        if (random < 0.20)
            action = cc.ScaleBy.actionWithDuration(3, 2);
        else if (random < 0.40)
            action = cc.RotateBy.actionWithDuration(3, 360);
        else if (random < 0.60)
            action = cc.Blink.actionWithDuration(1, 3);
        //else if (random < 0.8)
        //    action = cc.TintBy.actionWithDuration(2, 0, -255, -255);
        else
            action = cc.FadeOut.actionWithDuration(2);
        var action_back = action.reverse();
        var seq = cc.Sequence.actions(action, action_back, null);

        sprite.runAction(cc.RepeatForever.actionWithAction(seq));
    },
    ccTouchesEnded:function (touches, event) {
        var batch = this.getChildByTag(kTagSpriteBatchNode);

        if (batch.getTexture() == this._m_texture1)
            batch.setTexture(this._m_texture2);
        else
            batch.setTexture(this._m_texture1);
    }
});

//------------------------------------------------------------------
//
// SpriteFrameTest
//
//------------------------------------------------------------------
var SpriteFrameTest = SpriteTestDemo.extend({
    _m_pSprite1:null,
    _m_pSprite2:null,
    _m_nCounter:0,
    onEnter:function () {
        this._super();
        var s = cc.Director.sharedDirector().getWinSize();

        // IMPORTANT:
        // The sprite frames will be cached AND RETAINED, and they won't be released unless you call
        //     cc.SpriteFrameCache.sharedSpriteFrameCache().removeUnusedSpriteFrames);
        var cache = cc.SpriteFrameCache.sharedSpriteFrameCache();
        cache.addSpriteFramesWithFile(s_grossiniPlist);
        cache.addSpriteFramesWithFile(s_grossini_grayPlist, s_grossini_gray);
        cache.addSpriteFramesWithFile(s_grossini_bluePlist, s_grossini_blue);

        //
        // Animation using Sprite BatchNode
        //
        this._m_pSprite1 = cc.Sprite.spriteWithSpriteFrameName("grossini_dance_01.png");
        this._m_pSprite1.setPosition(cc.ccp(s.width / 2 - 80, s.height / 2));

        var spritebatch = cc.SpriteBatchNode.batchNodeWithFile(s_grossini);
        spritebatch.addChild(this._m_pSprite1);
        this.addChild(spritebatch);

        var animFrames = [];
        var str = "";
        for (var i = 1; i < 15; i++) {
            str = "grossini_dance_" + (i < 10 ? ("0" + i) : i) + ".png";
            var frame = cache.spriteFrameByName(str);
            animFrames.push(frame);
        }

        var animation = cc.Animation.animationWithFrames(animFrames);
        this._m_pSprite1.runAction(cc.RepeatForever.actionWithAction(cc.Animate.actionWithAnimation(animation, false)));

        // to test issue #732, uncomment the following line
        this._m_pSprite1.setFlipX(false);
        this._m_pSprite1.setFlipY(false);
        //
        // Animation using standard Sprite
        //
        this._m_pSprite2 = cc.Sprite.spriteWithSpriteFrameName("grossini_dance_01.png");
        this._m_pSprite2.setPosition(cc.ccp(s.width / 2 + 80, s.height / 2));
        this.addChild(this._m_pSprite2);

        var moreFrames = [];
        for (i = 1; i < 15; i++) {
            str = "grossini_dance_gray_" + (i < 10 ? ("0" + i) : i) + ".png";
            frame = cache.spriteFrameByName(str);
            moreFrames.push(frame);
        }

        for (i = 1; i < 5; i++) {
            str = "grossini_blue_0" + i + ".png";
            frame = cache.spriteFrameByName(str);
            moreFrames.push(frame);
        }

        // append frames from another batch
        moreFrames = moreFrames.concat(animFrames);
        var animMixed = cc.Animation.animationWithFrames(moreFrames);

        this._m_pSprite2.runAction(cc.RepeatForever.actionWithAction(cc.Animate.actionWithAnimation(animMixed, false)));

        // to test issue #732, uncomment the following line
        this._m_pSprite2.setFlipX(false);
        this._m_pSprite2.setFlipY(false);

        this.schedule(this.startIn05Secs, 0.5);
        this._m_nCounter = 0;
    },
    onExit:function () {
        this._super();
        var cache = cc.SpriteFrameCache.sharedSpriteFrameCache();
        cache.removeSpriteFramesFromFile(s_grossiniPlist);
        cache.removeSpriteFramesFromFile(s_grossini_grayPlist);
        cache.removeSpriteFramesFromFile(s_grossini_bluePlist);
    },
    title:function () {
        return "Sprite vs. SpriteBatchNode animation";
    },
    subtitle:function () {
        return "Testing issue #792";
    },
    startIn05Secs:function () {
        this.unschedule(this.startIn05Secs);
        this.schedule(this.flipSprites, 1.0);
    },
    flipSprites:function (dt) {
        this._m_nCounter++;

        var fx = false;
        var fy = false;
        var i = this._m_nCounter % 4;

        switch (i) {
            case 0:
                fx = false;
                fy = false;
                break;
            case 1:
                fx = true;
                fy = false;
                break;
            case 2:
                fx = false;
                fy = true;
                break;
            case 3:
                fx = true;
                fy = true;
                break;
        }

        this._m_pSprite1.setFlipX(fx);
        this._m_pSprite1.setFlipY(fy);
        this._m_pSprite2.setFlipX(fx);
        this._m_pSprite2.setFlipY(fy);
    }
});

//------------------------------------------------------------------
//
// SpriteFrameAliasNameTest
//
//------------------------------------------------------------------
var SpriteFrameAliasNameTest = SpriteTestDemo.extend({
    title:function () {
        return "SpriteFrame Alias Name";
    },
    subtitle:function () {
        return "SpriteFrames are obtained using the alias name";
    },
    onEnter:function () {
        this._super();
        //TODO
        return;
        var s = cc.Director.sharedDirector().getWinSize();

        // IMPORTANT:
        // The sprite frames will be cached AND RETAINED, and they won't be released unless you call
        //     [[cc.SpriteFrameCache sharedSpriteFrameCache] removeUnusedSpriteFrames];
        //
        // cc.SpriteFrameCache is a cache of cc.SpriteFrames
        // cc.SpriteFrames each contain a texture id and a rect (frame).
        var cache = cc.SpriteFrameCache.sharedSpriteFrameCache();
        cache.addSpriteFramesWithFile(s_grossini_aliasesPlist, s_grossini_aliases);

        //
        // Animation using Sprite batch
        //
        // A cc.SpriteBatchNode can reference one and only one texture (one .png file)
        // Sprites that are contained in that texture can be instantiatied as cc.Sprites and then added to the cc.SpriteBatchNode
        // All cc.Sprites added to a cc.SpriteBatchNode are drawn in one OpenGL ES draw call
        // If the cc.Sprites are not added to a cc.SpriteBatchNode then an OpenGL ES draw call will be needed for each one, which is less efficient
        //
        // When you animate a sprite, CCAnimation changes the frame of the sprite using setDisplayFrame: (this is why the animation must be in the same texture)
        // When setDisplayFrame: is used in the CCAnimation it changes the frame to one specified by the cc.SpriteFrames that were added to the animation,
        // but texture id is still the same and so the sprite is still a child of the cc.SpriteBatchNode,
        // and therefore all the animation sprites are also drawn as part of the cc.SpriteBatchNode
        //
        var sprite = cc.Sprite.spriteWithSpriteFrameName("grossini_dance_01.png");
        sprite.setPosition(cc.ccp(s.width * 0.5, s.height * 0.5));

        var spriteBatch = cc.SpriteBatchNode.batchNodeWithFile(s_grossini_aliases);
        spriteBatch.addChild(sprite);
        this.addChild(spriteBatch);

        var animFrames = [];
        var str = "";
        for (var i = 1; i < 15; i++) {
            // Obtain frames by alias name
            str = "dance_" + (i < 10 ? ("0" + i) : i);
            var frame = cache.spriteFrameByName(str);
            animFrames.push(frame);
        }

        var animation = cc.Animation.animationWithFrames(animFrames);
        // 14 frames * 1sec = 14 seconds
        sprite.runAction(cc.RepeatForever.actionWithAction(cc.Animate.actionWithDuration(14.0, animation, false)));
    },
    onExit:function () {
        this._super();
        cc.SpriteFrameCache.sharedSpriteFrameCache().removeSpriteFramesFromFile(s_grossini_aliasesPlist);
    }
});

//------------------------------------------------------------------
//
// SpriteOffsetAnchorRotation
//
//------------------------------------------------------------------
var SpriteOffsetAnchorRotation = SpriteTestDemo.extend({
    ctor:function () {
        var s = cc.Director.sharedDirector().getWinSize();
        var cache = cc.SpriteFrameCache.sharedSpriteFrameCache();
        cache.addSpriteFramesWithFile(s_grossiniPlist);
        cache.addSpriteFramesWithFile(s_grossini_grayPlist, s_grossini_gray);

        for (var i = 0; i < 3; i++) {
            //
            // Animation using Sprite BatchNode
            //
            var sprite = cc.Sprite.spriteWithSpriteFrameName("grossini_dance_01.png");
            sprite.setPosition(cc.ccp(s.width / 4 * (i + 1), s.height / 2));

            var point = cc.Sprite.spriteWithFile(s_pPathR1);
            point.setScale(0.25);
            point.setPosition(sprite.getPosition());
            this.addChild(point, 1);

            switch (i) {
                case 0:
                    sprite.setAnchorPoint(cc.PointZero());
                    break;
                case 1:
                    sprite.setAnchorPoint(cc.ccp(0.5, 0.5));
                    break;
                case 2:
                    sprite.setAnchorPoint(cc.ccp(1, 1));
                    break;
            }

            point.setPosition(sprite.getPosition());

            var animFrames = [];
            var str = "";
            for (var j = 1; j < 15; j++) {
                str = "grossini_dance_" + (j < 10 ? ("0" + j) : j) + ".png";
                var frame = cache.spriteFrameByName(str);
                animFrames.push(frame);
            }

            var animation = cc.Animation.animationWithFrames(animFrames);
            sprite.runAction(cc.RepeatForever.actionWithAction(cc.Animate.actionWithAnimation(animation, false)));
            sprite.runAction(cc.RepeatForever.actionWithAction(cc.RotateBy.actionWithDuration(10, 360)));

            this.addChild(sprite, 0);
        }
    },
    onExit:function () {
        this._super();
        var cache = cc.SpriteFrameCache.sharedSpriteFrameCache();
        cache.removeSpriteFramesFromFile(s_grossiniPlist);
        cache.removeSpriteFramesFromFile(s_grossini_grayPlist);
    },
    title:function () {
        return "Sprite offset + anchor + rot";
    }
});

//------------------------------------------------------------------
//
// SpriteBatchNodeOffsetAnchorRotation
//
//------------------------------------------------------------------
var SpriteBatchNodeOffsetAnchorRotation = SpriteTestDemo.extend({
    ctor:function () {
        var s = cc.Director.sharedDirector().getWinSize();

        for (var i = 0; i < 3; i++) {
            var cache = cc.SpriteFrameCache.sharedSpriteFrameCache();
            cache.addSpriteFramesWithFile(s_grossiniPlist);
            cache.addSpriteFramesWithFile(s_grossini_grayPlist, s_grossini_gray);

            //
            // Animation using Sprite BatchNode
            //
            var sprite = cc.Sprite.spriteWithSpriteFrameName("grossini_dance_01.png");
            sprite.setPosition(cc.ccp(s.width / 4 * (i + 1), s.height / 2));

            var point = cc.Sprite.spriteWithFile(s_pPathR1);
            point.setScale(0.25);
            point.setPosition(sprite.getPosition());
            this.addChild(point, 200);

            switch (i) {
                case 0:
                    sprite.setAnchorPoint(cc.PointZero());
                    break;
                case 1:
                    sprite.setAnchorPoint(cc.ccp(0.5, 0.5));
                    break;
                case 2:
                    sprite.setAnchorPoint(cc.ccp(1, 1));
                    break;
            }

            point.setPosition(sprite.getPosition());

            var spritebatch = cc.SpriteBatchNode.batchNodeWithFile(s_grossini);
            this.addChild(spritebatch);

            var animFrames = [];
            var str = "";
            for (var k = 1; k < 15; k++) {
                str = "grossini_dance_" + (k < 10 ? ("0" + k) : k) + ".png";
                var frame = cache.spriteFrameByName(str);
                animFrames.push(frame);
            }

            var animation = cc.Animation.animationWithFrames(animFrames);
            sprite.runAction(cc.RepeatForever.actionWithAction(cc.Animate.actionWithAnimation(animation, false)));
            sprite.runAction(cc.RepeatForever.actionWithAction(cc.RotateBy.actionWithDuration(10, 360)));

            spritebatch.addChild(sprite, i);
        }
    },
    onExit:function () {
        this._super();
        var cache = cc.SpriteFrameCache.sharedSpriteFrameCache();
        cache.removeSpriteFramesFromFile(s_grossiniPlist);
        cache.removeSpriteFramesFromFile(s_grossini_grayPlist);
    },
    title:function () {
        return "SpriteBatchNode offset + anchor + rot";
    }
});

//------------------------------------------------------------------
//
// SpriteOffsetAnchorScale
//
//------------------------------------------------------------------
var SpriteOffsetAnchorScale = SpriteTestDemo.extend({
    ctor:function () {
        var s = cc.Director.sharedDirector().getWinSize();

        for (var i = 0; i < 3; i++) {
            var cache = cc.SpriteFrameCache.sharedSpriteFrameCache();
            cache.addSpriteFramesWithFile(s_grossiniPlist);
            cache.addSpriteFramesWithFile(s_grossini_grayPlist, s_grossini_gray);

            //
            // Animation using Sprite BatchNode
            //
            var sprite = cc.Sprite.spriteWithSpriteFrameName("grossini_dance_01.png");
            sprite.setPosition(cc.ccp(s.width / 4 * (i + 1), s.height / 2));

            var point = cc.Sprite.spriteWithFile(s_pPathR1);
            point.setScale(0.25);
            point.setPosition(sprite.getPosition());
            this.addChild(point, 1);

            switch (i) {
                case 0:
                    sprite.setAnchorPoint(cc.PointZero());
                    break;
                case 1:
                    sprite.setAnchorPoint(cc.ccp(0.5, 0.5));
                    break;
                case 2:
                    sprite.setAnchorPoint(cc.ccp(1, 1));
                    break;
            }

            point.setPosition(sprite.getPosition());

            var animFrames = [];
            var str = "";
            for (var k = 1; k <= 14; k++) {
                str = "grossini_dance_" + (k < 10 ? ("0" + k) : k) + ".png";
                var frame = cache.spriteFrameByName(str);
                animFrames.push(frame);
            }

            var animation = cc.Animation.animationWithFrames(animFrames);
            sprite.runAction(cc.RepeatForever.actionWithAction(cc.Animate.actionWithAnimation(animation, false)));

            var scale = cc.ScaleBy.actionWithDuration(2, 2);
            var scale_back = scale.reverse();
            var seq_scale = cc.Sequence.actions(scale, scale_back, null);
            sprite.runAction(cc.RepeatForever.actionWithAction(seq_scale));

            this.addChild(sprite, 0);
        }
    },
    onExit:function () {
        this._super();
        var cache = cc.SpriteFrameCache.sharedSpriteFrameCache();
        cache.removeSpriteFramesFromFile(s_grossiniPlist);
        cache.removeSpriteFramesFromFile(s_grossini_grayPlist);
    },
    title:function () {
        return "Sprite offset + anchor + scale";
    }
});


//------------------------------------------------------------------
//
// SpriteBatchNodeOffsetAnchorScale
//
//------------------------------------------------------------------
var SpriteBatchNodeOffsetAnchorScale = SpriteTestDemo.extend({
    ctor:function () {
        var s = cc.Director.sharedDirector().getWinSize();

        for (var i = 0; i < 3; i++) {
            var cache = cc.SpriteFrameCache.sharedSpriteFrameCache();
            cache.addSpriteFramesWithFile(s_grossiniPlist);
            cache.addSpriteFramesWithFile(s_grossini_grayPlist, s_grossini_gray);

            //
            // Animation using Sprite BatchNode
            //
            var sprite = cc.Sprite.spriteWithSpriteFrameName("grossini_dance_01.png");
            sprite.setPosition(cc.ccp(s.width / 4 * (i + 1), s.height / 2));

            var point = cc.Sprite.spriteWithFile(s_pPathR1);
            point.setScale(0.25);
            point.setPosition(sprite.getPosition());
            this.addChild(point, 200);

            switch (i) {
                case 0:
                    sprite.setAnchorPoint(cc.PointZero());
                    break;
                case 1:
                    sprite.setAnchorPoint(cc.ccp(0.5, 0.5));
                    break;
                case 2:
                    sprite.setAnchorPoint(cc.ccp(1, 1));
                    break;
            }

            point.setPosition(sprite.getPosition());

            var spritesheet = cc.SpriteBatchNode.batchNodeWithFile(s_grossini);
            this.addChild(spritesheet);

            var animFrames = [];
            var str = "";
            for (var k = 1; k <= 14; k++) {
                str = "grossini_dance_" + (k < 10 ? ("0" + k) : k) + ".png";
                var frame = cache.spriteFrameByName(str);
                animFrames.push(frame);
            }

            var animation = cc.Animation.animationWithFrames(animFrames);
            sprite.runAction(cc.RepeatForever.actionWithAction(cc.Animate.actionWithAnimation(animation, false)));

            var scale = cc.ScaleBy.actionWithDuration(2, 2);
            var scale_back = scale.reverse();
            var seq_scale = cc.Sequence.actions(scale, scale_back, null);
            sprite.runAction(cc.RepeatForever.actionWithAction(seq_scale));

            spritesheet.addChild(sprite, i);
        }
    },
    onExit:function () {
        this._super();
        var cache = cc.SpriteFrameCache.sharedSpriteFrameCache();
        cache.removeSpriteFramesFromFile(s_grossiniPlist);
        cache.removeSpriteFramesFromFile(s_grossini_grayPlist);
    },
    title:function () {
        return "SpriteBatchNode offset + anchor + scale";
    }
});

//
// SpriteOffsetAnchorSkew
//
var SpriteOffsetAnchorSkew = SpriteTestDemo.extend({
    ctor:function () {
        var s = cc.Director.sharedDirector().getWinSize();

        for (var i = 0; i < 3; i++) {
            var cache = cc.SpriteFrameCache.sharedSpriteFrameCache();
            cache.addSpriteFramesWithFile(s_grossiniPlist);
            cache.addSpriteFramesWithFile(s_grossini_grayPlist, s_grossini_gray);

            //
            // Animation using Sprite batch
            //
            var sprite = cc.Sprite.spriteWithSpriteFrameName("grossini_dance_01.png");
            sprite.setPosition(cc.ccp(s.width / 4 * (i + 1), s.height / 2));

            var point = cc.Sprite.spriteWithFile(s_pPathR1);
            point.setScale(0.25);
            point.setPosition(sprite.getPosition());
            this.addChild(point, 1);

            switch (i) {
                case 0:
                    sprite.setAnchorPoint(cc.PointZero());
                    break;
                case 1:
                    sprite.setAnchorPoint(cc.ccp(0.5, 0.5));
                    break;
                case 2:
                    sprite.setAnchorPoint(cc.ccp(1, 1));
                    break;
            }

            point.setPosition(sprite.getPosition());

            var animFrames = [];
            var tmp = "";
            for (var j = 1; j <= 14; j++) {
                tmp = "grossini_dance_" + (j < 10 ? ("0" + j) : j) + ".png";
                var frame = cache.spriteFrameByName(tmp);
                animFrames.push(frame);
            }

            var animation = cc.Animation.animationWithFrames(animFrames);
            sprite.runAction(cc.RepeatForever.actionWithAction(cc.Animate.actionWithDuration(2.8, animation, false)));

            var skewX = cc.SkewBy.actionWithDuration(2, 45, 0);
            var skewX_back = skewX.reverse();
            var skewY = cc.SkewBy.actionWithDuration(2, 0, 45);
            var skewY_back = skewY.reverse();

            var seq_skew = cc.Sequence.actions(skewX, skewX_back, skewY, skewY_back, null);
            sprite.runAction(cc.RepeatForever.actionWithAction(seq_skew));

            this.addChild(sprite, 0);
        }
    },
    title:function () {
        return "Sprite offset + anchor + scale";
    }
});

//
// SpriteBatchNodeOffsetAnchorSkew
//
var SpriteBatchNodeOffsetAnchorSkew = SpriteTestDemo.extend({
    ctor:function () {
        var s = cc.Director.sharedDirector().getWinSize();

        for (var i = 0; i < 3; i++) {
            var cache = cc.SpriteFrameCache.sharedSpriteFrameCache();
            cache.addSpriteFramesWithFile(s_grossiniPlist);
            cache.addSpriteFramesWithFile(s_grossini_grayPlist, s_grossini_gray);

            //
            // Animation using Sprite batch
            //
            var sprite = cc.Sprite.spriteWithSpriteFrameName("grossini_dance_01.png");
            sprite.setPosition(cc.ccp(s.width / 4 * (i + 1), s.height / 2));

            var point = cc.Sprite.spriteWithFile(s_pPathR1);
            point.setScale(0.25);
            point.setPosition(sprite.getPosition());
            this.addChild(point, 200);

            switch (i) {
                case 0:
                    sprite.setAnchorPoint(cc.PointZero());
                    break;
                case 1:
                    sprite.setAnchorPoint(cc.ccp(0.5, 0.5));
                    break;
                case 2:
                    sprite.setAnchorPoint(cc.ccp(1, 1));
                    break;
            }

            point.setPosition(sprite.getPosition());

            var spritebatch = cc.SpriteBatchNode.batchNodeWithFile(s_grossini);
            this.addChild(spritebatch);

            var animFrames = [];
            var tmp = "";
            for (var j = 1; j <= 14; j++) {
                tmp = "grossini_dance_" + (j < 10 ? ("0" + j) : j) + ".png";
                var frame = cache.spriteFrameByName(tmp);
                animFrames.push(frame);
            }

            var animation = cc.Animation.animationWithFrames(animFrames);
            sprite.runAction(cc.RepeatForever.actionWithAction(cc.Animate.actionWithDuration(2.8, animation, false)));

            animFrames = null;

            var skewX = cc.SkewBy.actionWithDuration(2, 45, 0);
            var skewX_back = skewX.reverse();
            var skewY = cc.SkewBy.actionWithDuration(2, 0, 45);
            var skewY_back = skewY.reverse();

            var seq_skew = cc.Sequence.actions(skewX, skewX_back, skewY, skewY_back);
            sprite.runAction(cc.RepeatForever.actionWithAction(seq_skew));

            spritebatch.addChild(sprite, i);
        }
    },
    title:function () {
        return "SpriteBatchNode offset + anchor + skew";
    }
});

//
// SpriteOffsetAnchorSkewScale
//
var SpriteOffsetAnchorSkewScale = SpriteTestDemo.extend({
    ctor:function () {
        var s = cc.Director.sharedDirector().getWinSize();

        for (var i = 0; i < 3; i++) {
            var cache = cc.SpriteFrameCache.sharedSpriteFrameCache();
            cache.addSpriteFramesWithFile(s_grossiniPlist);
            cache.addSpriteFramesWithFile(s_grossini_grayPlist, s_grossini_gray);

            //
            // Animation using Sprite batch
            //
            var sprite = cc.Sprite.spriteWithSpriteFrameName("grossini_dance_01.png");
            sprite.setPosition(cc.ccp(s.width / 4 * (i + 1), s.height / 2));

            var point = cc.Sprite.spriteWithFile(s_pPathR1);
            point.setScale(0.25);
            point.setPosition(sprite.getPosition());
            this.addChild(point, 1);

            switch (i) {
                case 0:
                    sprite.setAnchorPoint(cc.PointZero());
                    break;
                case 1:
                    sprite.setAnchorPoint(cc.ccp(0.5, 0.5));
                    break;
                case 2:
                    sprite.setAnchorPoint(cc.ccp(1, 1));
                    break;
            }

            point.setPosition(sprite.getPosition());

            var animFrames = [];
            var tmp = "";
            for (var j = 1; j <= 14; j++) {
                tmp = "grossini_dance_" + (j < 10 ? ("0" + j) : j) + ".png";
                var frame = cache.spriteFrameByName(tmp);
                animFrames.push(frame);
            }

            var animation = cc.Animation.animationWithFrames(animFrames);
            sprite.runAction(cc.RepeatForever.actionWithAction(cc.Animate.actionWithDuration(2.8, animation, false)));

            animFrames = null;

            // Skew
            var skewX = cc.SkewBy.actionWithDuration(2, 45, 0);
            var skewX_back = skewX.reverse();
            var skewY = cc.SkewBy.actionWithDuration(2, 0, 45);
            var skewY_back = skewY.reverse();

            var seq_skew = cc.Sequence.actions(skewX, skewX_back, skewY, skewY_back);
            sprite.runAction(cc.RepeatForever.actionWithAction(seq_skew));

            // Scale
            var scale = cc.ScaleBy.actionWithDuration(2, 2);
            var scale_back = scale.reverse();
            var seq_scale = cc.Sequence.actions(scale, scale_back);
            sprite.runAction(cc.RepeatForever.actionWithAction(seq_scale));

            this.addChild(sprite, 0);
        }
    },
    title:function () {
        return "Sprite anchor + skew + scale";
    }
});

//
// SpriteBatchNodeOffsetAnchorSkewScale
//
var SpriteBatchNodeOffsetAnchorSkewScale = SpriteTestDemo.extend({
    ctor:function () {
        var s = cc.Director.sharedDirector().getWinSize();

        for (var i = 0; i < 3; i++) {
            var cache = cc.SpriteFrameCache.sharedSpriteFrameCache();
            cache.addSpriteFramesWithFile(s_grossiniPlist);
            cache.addSpriteFramesWithFile(s_grossini_grayPlist, s_grossini_gray);

            //
            // Animation using Sprite batch
            //
            var sprite = cc.Sprite.spriteWithSpriteFrameName("grossini_dance_01.png");
            sprite.setPosition(cc.ccp(s.width / 4 * (i + 1), s.height / 2));

            var point = cc.Sprite.spriteWithFile(s_pPathR1);
            point.setScale(0.25);
            point.setPosition(sprite.getPosition());
            this.addChild(point, 200);

            switch (i) {
                case 0:
                    sprite.setAnchorPoint(cc.PointZero());
                    break;
                case 1:
                    sprite.setAnchorPoint(cc.ccp(0.5, 0.5));
                    break;
                case 2:
                    sprite.setAnchorPoint(cc.ccp(1, 1));
                    break;
            }

            point.setPosition(sprite.getPosition());

            var spritebatch = cc.SpriteBatchNode.batchNodeWithFile(s_grossini);
            this.addChild(spritebatch);

            var animFrames = [];
            var tmp = "";
            for (var j = 1; j <= 14; j++) {
                tmp = "grossini_dance_" + (j < 10 ? ("0" + j) : j) + ".png";
                var frame = cache.spriteFrameByName(tmp);
                animFrames.push(frame);
            }

            var animation = cc.Animation.animationWithFrames(animFrames);
            sprite.runAction(cc.RepeatForever.actionWithAction(cc.Animate.actionWithDuration(2.8, animation, false)));

            animFrames = null;

            // skew
            var skewX = cc.SkewBy.actionWithDuration(2, 45, 0);
            var skewX_back = skewX.reverse();
            var skewY = cc.SkewBy.actionWithDuration(2, 0, 45);
            var skewY_back = skewY.reverse();

            var seq_skew = cc.Sequence.actions(skewX, skewX_back, skewY, skewY_back);
            sprite.runAction(cc.RepeatForever.actionWithAction(seq_skew));

            // scale
            var scale = cc.ScaleBy.actionWithDuration(2, 2);
            var scale_back = scale.reverse();
            var seq_scale = cc.Sequence.actions(scale, scale_back);
            sprite.runAction(cc.RepeatForever.actionWithAction(seq_scale));

            spritebatch.addChild(sprite, i);
        }
    },
    title:function () {
        return "SpriteBatchNode anchor + skew + scale";
    }
});

//
// SpriteOffsetAnchorFlip
//
var SpriteOffsetAnchorFlip = SpriteTestDemo.extend({
    ctor:function () {
        var s = cc.Director.sharedDirector().getWinSize();

        for (var i = 0; i < 3; i++) {
            var cache = cc.SpriteFrameCache.sharedSpriteFrameCache();
            cache.addSpriteFramesWithFile(s_grossiniPlist);
            cache.addSpriteFramesWithFile(s_grossini_grayPlist, s_grossini_gray);

            //
            // Animation using Sprite batch
            //
            var sprite = cc.Sprite.spriteWithSpriteFrameName("grossini_dance_01.png");
            sprite.setPosition(cc.ccp(s.width / 4 * (i + 1), s.height / 2));

            var point = cc.Sprite.spriteWithFile(s_pPathR1);
            point.setScale(0.25);
            point.setPosition(sprite.getPosition());
            this.addChild(point, 1);

            switch (i) {
                case 0:
                    sprite.setAnchorPoint(cc.PointZero());
                    break;
                case 1:
                    sprite.setAnchorPoint(cc.ccp(0.5, 0.5));
                    break;
                case 2:
                    sprite.setAnchorPoint(cc.ccp(1, 1));
                    break;
            }

            point.setPosition(sprite.getPosition());

            var animFrames = [];
            var tmp = "";
            for (var j = 1; j <= 14; j++) {
                tmp = "grossini_dance_" + (j < 10 ? ("0" + j) : j) + ".png";
                var frame = cache.spriteFrameByName(tmp);
                animFrames.push(frame);
            }

            var animation = cc.Animation.animationWithFrames(animFrames);
            sprite.runAction(cc.RepeatForever.actionWithAction(cc.Animate.actionWithDuration(2.8, animation, false)));

            animFrames = null;

            var flip = cc.FlipY.actionWithFlipY(true);
            var flip_back = cc.FlipY.actionWithFlipY(false);
            var delay = cc.DelayTime.actionWithDuration(1);
            var delay1 = cc.DelayTime.actionWithDuration(1);
            var seq = cc.Sequence.actions(delay, flip, delay1, flip_back);
            sprite.runAction(cc.RepeatForever.actionWithAction(seq));

            this.addChild(sprite, 0);
        }
    },
    title:function () {
        return "Sprite offset + anchor + flip";
    },
    subtitle:function () {
        return "issue #1078";
    }
});

//
// SpriteBatchNodeOffsetAnchorFlip
//
var SpriteBatchNodeOffsetAnchorFlip = SpriteTestDemo.extend({
    ctor:function () {
        var s = cc.Director.sharedDirector().getWinSize();

        for (var i = 0; i < 3; i++) {
            var cache = cc.SpriteFrameCache.sharedSpriteFrameCache();
            cache.addSpriteFramesWithFile(s_grossiniPlist);
            cache.addSpriteFramesWithFile(s_grossini_grayPlist, s_grossini_gray);

            //
            // Animation using Sprite batch
            //
            var sprite = cc.Sprite.spriteWithSpriteFrameName("grossini_dance_01.png");
            sprite.setPosition(cc.ccp(s.width / 4 * (i + 1), s.height / 2));

            var point = cc.Sprite.spriteWithFile(s_pPathR1);
            point.setScale(0.25);
            point.setPosition(sprite.getPosition());
            this.addChild(point, 200);

            switch (i) {
                case 0:
                    sprite.setAnchorPoint(cc.PointZero());
                    break;
                case 1:
                    sprite.setAnchorPoint(cc.ccp(0.5, 0.5));
                    break;
                case 2:
                    sprite.setAnchorPoint(cc.ccp(1, 1));
                    break;
            }

            point.setPosition(sprite.getPosition());

            var spritebatch = cc.SpriteBatchNode.batchNodeWithFile(s_grossini);
            this.addChild(spritebatch);

            var animFrames = [];
            var tmp = "";
            for (var j = 1; j <= 14; j++) {
                tmp = "grossini_dance_" + (j < 10 ? ("0" + j) : j) + ".png";
                var frame = cache.spriteFrameByName(tmp);
                animFrames.push(frame);
            }

            var animation = cc.Animation.animationWithFrames(animFrames);
            sprite.runAction(cc.RepeatForever.actionWithAction(cc.Animate.actionWithDuration(2.8, animation, false)));

            animFrames = null;

            var flip = cc.FlipY.actionWithFlipY(true);
            var flip_back = cc.FlipY.actionWithFlipY(false);
            var delay = cc.DelayTime.actionWithDuration(1);
            var seq = cc.Sequence.actions(delay, flip, delay.copyWithZone(null), flip_back);
            sprite.runAction(cc.RepeatForever.actionWithAction(seq));

            spritebatch.addChild(sprite, i);
        }
    },
    title:function () {
        return "SpriteBatchNode offset + anchor + flip";
    },
    subtitle:function () {
        return "issue #1078";
    }
});

//------------------------------------------------------------------
//
// SpriteAnimationSplit
//
//------------------------------------------------------------------
var SpriteAnimationSplit = SpriteTestDemo.extend({
    ctor:function () {
        var s = cc.Director.sharedDirector().getWinSize();
        var texture = cc.TextureCache.sharedTextureCache().addImage(s_dragon_animation);

        // manually add frames to the frame cache
        var frame0 = cc.SpriteFrame.frameWithTexture(texture, cc.RectMake(132 * 0, 132 * 0, 132, 132));
        var frame1 = cc.SpriteFrame.frameWithTexture(texture, cc.RectMake(132 * 1, 132 * 0, 132, 132));
        var frame2 = cc.SpriteFrame.frameWithTexture(texture, cc.RectMake(132 * 2, 132 * 0, 132, 132));
        var frame3 = cc.SpriteFrame.frameWithTexture(texture, cc.RectMake(132 * 3, 132 * 0, 132, 132));
        var frame4 = cc.SpriteFrame.frameWithTexture(texture, cc.RectMake(132 * 0, 132 * 1, 132, 132));
        var frame5 = cc.SpriteFrame.frameWithTexture(texture, cc.RectMake(132 * 1, 132 * 1, 132, 132));

        //
        // Animation using Sprite BatchNode
        //
        var sprite = cc.Sprite.spriteWithSpriteFrame(frame0);
        sprite.setPosition(cc.ccp(s.width / 2 - 80, s.height / 2));
        this.addChild(sprite);

        var animFrames = [];
        animFrames.push(frame0);
        animFrames.push(frame1);
        animFrames.push(frame2);
        animFrames.push(frame3);
        animFrames.push(frame4);
        animFrames.push(frame5);

        var animation = cc.Animation.animationWithFrames(animFrames, 0.2);
        var animate = cc.Animate.actionWithAnimation(animation, false);
        var seq = cc.Sequence.actions(animate,
            cc.FlipX.actionWithFlipX(true),
            animate.copy(),
            cc.FlipX.actionWithFlipX(false));

        sprite.runAction(cc.RepeatForever.actionWithAction(seq));
    },
    title:function () {
        return "Sprite: Animation + flip";
    },
    onExit:function () {
        this._super();
        cc.SpriteFrameCache.sharedSpriteFrameCache().removeUnusedSpriteFrames();
    }
});

//------------------------------------------------------------------
//
// SpriteHybrid
//
//------------------------------------------------------------------
var SpriteHybrid = SpriteTestDemo.extend({
    _m_usingSpriteBatchNode:false,
    ctor:function () {
        var s = cc.Director.sharedDirector().getWinSize();

        // parents
        var parent1 = cc.Node.node();
        var parent2 = cc.SpriteBatchNode.batchNodeWithFile(s_grossini, 50);

        this.addChild(parent1, 0, kTagNode);
        this.addChild(parent2, 0, kTagSpriteBatchNode);

        // IMPORTANT:
        // The sprite frames will be cached AND RETAINED, and they won't be released unless you call
        //     cc.SpriteFrameCache.sharedSpriteFrameCache().removeUnusedSpriteFrames);
        cc.SpriteFrameCache.sharedSpriteFrameCache().addSpriteFramesWithFile(s_grossiniPlist);

        // create 250 sprites
        // only show 80% of them
        for (var i = 1; i <= 250; i++) {
            var spriteIdx = Math.round(cc.RANDOM_0_1() * 14);
            if (spriteIdx == 0)
                spriteIdx = 1;
            var str = "grossini_dance_" + (spriteIdx < 10 ? ("0" + spriteIdx) : spriteIdx) + ".png";

            var frame = cc.SpriteFrameCache.sharedSpriteFrameCache().spriteFrameByName(str);
            var sprite = cc.Sprite.spriteWithSpriteFrame(frame);
            parent1.addChild(sprite, i, i);

            var x = -1000;
            var y = -1000;
            if (cc.RANDOM_0_1() < 0.2) {
                x = cc.RANDOM_0_1() * s.width;
                y = cc.RANDOM_0_1() * s.height;
            }
            sprite.setPosition(cc.ccp(x, y));

            var action = cc.RotateBy.actionWithDuration(4, 360);
            sprite.runAction(cc.RepeatForever.actionWithAction(action));
        }

        this._m_usingSpriteBatchNode = false;

        this.schedule(this.reparentSprite, 2);
    },
    title:function () {
        return "Hybrcc.Sprite* sprite Test";
    },
    onExit:function () {
        this._super();
        cc.SpriteFrameCache.sharedSpriteFrameCache().removeSpriteFramesFromFile(s_grossiniPlist);
    },
    reparentSprite:function () {
        var p1 = this.getChildByTag(kTagNode);
        var p2 = this.getChildByTag(kTagSpriteBatchNode);

        var retArray = [];

        if (this._m_usingSpriteBatchNode) {
            var tempNode = p2;
            p2 = p1;
            p1 = tempNode;
        }
        ////----UXLOG("New parent is: %x", p2);

        var children = p1.getChildren();
        for (var i = 0; i < children.length; i++) {
            var node = children[i];
            if (!node)
                break;

            retArray.push(node);
        }

        p1.removeAllChildrenWithCleanup(false);
        for (i = 0; i < retArray.length; i++) {
            node = retArray[i];
            if (!node)
                break;

            p2.addChild(node, i, i);
        }

        this._m_usingSpriteBatchNode = !this._m_usingSpriteBatchNode;
    }
});

//------------------------------------------------------------------
//
// SpriteBatchNodeChildren
//
//------------------------------------------------------------------
var SpriteBatchNodeChildren = SpriteTestDemo.extend({
    ctor:function () {
        var s = cc.Director.sharedDirector().getWinSize();

        // parents
        var batch = cc.SpriteBatchNode.batchNodeWithFile(s_grossini, 50);
        this.addChild(batch, 0, kTagSpriteBatchNode);

        cc.SpriteFrameCache.sharedSpriteFrameCache().addSpriteFramesWithFile(s_grossiniPlist);

        var sprite1 = cc.Sprite.spriteWithSpriteFrameName("grossini_dance_01.png");
        sprite1.setPosition(cc.ccp(s.width / 3, s.height / 2));

        var sprite2 = cc.Sprite.spriteWithSpriteFrameName("grossini_dance_02.png");
        sprite2.setPosition(cc.ccp(50, 50));

        var sprite3 = cc.Sprite.spriteWithSpriteFrameName("grossini_dance_03.png");
        sprite3.setPosition(cc.ccp(-50, -50));

        batch.addChild(sprite1);
        sprite1.addChild(sprite2);
        sprite1.addChild(sprite3);

        // BEGIN NEW CODE
        var animFrames = [];
        var str = "";
        for (var i = 1; i < 15; i++) {
            str = "grossini_dance_" + (i < 10 ? ("0" + i) : i) + ".png";
            var frame = cc.SpriteFrameCache.sharedSpriteFrameCache().spriteFrameByName(str);
            animFrames.push(frame);
        }

        var animation = cc.Animation.animationWithFrames(animFrames, 0.2);
        sprite1.runAction(cc.RepeatForever.actionWithAction(cc.Animate.actionWithAnimation(animation, false)));
        // END NEW CODE

        var action = cc.MoveBy.actionWithDuration(2, cc.ccp(200, 0));
        var action_back = action.reverse();
        var action_rot = cc.RotateBy.actionWithDuration(2, 360);
        var action_s = cc.ScaleBy.actionWithDuration(2, 2);
        var action_s_back = action_s.reverse();

        var seq2 = action_rot.reverse();
        sprite2.runAction(cc.RepeatForever.actionWithAction(seq2));

        sprite1.runAction(cc.RepeatForever.actionWithAction(action_rot));
        sprite1.runAction(cc.RepeatForever.actionWithAction(cc.Sequence.actions(action, action_back, null)));
        sprite1.runAction(cc.RepeatForever.actionWithAction(cc.Sequence.actions(action_s, action_s_back, null)));
    },
    title:function () {
        return "SpriteBatchNode Grand Children";
    },
    onExit:function () {
        this._super();
        cc.SpriteFrameCache.sharedSpriteFrameCache().removeUnusedSpriteFrames();
    }
});

//------------------------------------------------------------------
//
// SpriteBatchNodeChildren2
//
//------------------------------------------------------------------
var SpriteBatchNodeChildren2 = SpriteTestDemo.extend({
    ctor:function () {
        var s = cc.Director.sharedDirector().getWinSize();

        // parents
        var batch = cc.SpriteBatchNode.batchNodeWithFile(s_grossini, 50);
        //TODO in WebGL
        //batch.getTexture().generateMipmap();
        this.addChild(batch, 0, kTagSpriteBatchNode);

        cc.SpriteFrameCache.sharedSpriteFrameCache().addSpriteFramesWithFile(s_grossiniPlist);

        var sprite11 = cc.Sprite.spriteWithSpriteFrameName("grossini_dance_01.png");
        sprite11.setPosition(cc.ccp(s.width / 3, s.height / 2));

        var sprite12 = cc.Sprite.spriteWithSpriteFrameName("grossini_dance_02.png");
        sprite12.setPosition(cc.ccp(20, 30));
        sprite12.setScale(0.2);

        var sprite13 = cc.Sprite.spriteWithSpriteFrameName("grossini_dance_03.png");
        sprite13.setPosition(cc.ccp(-20, 30));
        sprite13.setScale(0.2);

        batch.addChild(sprite11);
        sprite11.addChild(sprite12, -2);
        sprite11.addChild(sprite13, 2);

        // don't rotate with it's parent
        sprite12.setHonorParentTransform(sprite12.getHonorParentTransform() & ~cc.HONOR_PARENT_TRANSFORM_ROTATE);

        // don't scale and rotate with it's parent
        sprite13.setHonorParentTransform(sprite13.getHonorParentTransform() & ~(cc.HONOR_PARENT_TRANSFORM_SCALE | cc.HONOR_PARENT_TRANSFORM_ROTATE));

        var action = cc.MoveBy.actionWithDuration(2, cc.ccp(200, 0));
        var action_back = action.reverse();
        var action_rot = cc.RotateBy.actionWithDuration(2, 360);
        var action_s = cc.ScaleBy.actionWithDuration(2, 2);
        var action_s_back = action_s.reverse();

        sprite11.runAction(cc.RepeatForever.actionWithAction(action_rot));
        sprite11.runAction(cc.RepeatForever.actionWithAction(cc.Sequence.actions(action, action_back, null)));
        sprite11.runAction(cc.RepeatForever.actionWithAction(cc.Sequence.actions(action_s, action_s_back, null)));

        //
        // another set of parent / children
        //
        var sprite21 = cc.Sprite.spriteWithSpriteFrameName("grossini_dance_01.png");
        sprite21.setPosition(cc.ccp(2 * s.width / 3, s.height / 2 - 50));

        var sprite22 = cc.Sprite.spriteWithSpriteFrameName("grossini_dance_02.png");
        sprite22.setPosition(cc.ccp(20, 30));
        sprite22.setScale(0.8);

        var sprite23 = cc.Sprite.spriteWithSpriteFrameName("grossini_dance_03.png");
        sprite23.setPosition(cc.ccp(-20, 30));
        sprite23.setScale(0.8);

        batch.addChild(sprite21);
        sprite21.addChild(sprite22, -2);
        sprite21.addChild(sprite23, 2);

        // don't rotate with it's parent
        sprite22.setHonorParentTransform(sprite22.getHonorParentTransform() & ~cc.HONOR_PARENT_TRANSFORM_TRANSLATE);

        // don't scale and rotate with it's parent
        sprite23.setHonorParentTransform(sprite23.getHonorParentTransform() & ~cc.HONOR_PARENT_TRANSFORM_SCALE);

        sprite21.runAction(cc.RepeatForever.actionWithAction(cc.RotateBy.actionWithDuration(1, 360)));
        sprite21.runAction(cc.RepeatForever.actionWithAction(cc.Sequence.actions(
            cc.ScaleTo.actionWithDuration(0.5, 5.0), cc.ScaleTo.actionWithDuration(0.5, 1), null)));
    },
    title:function () {
        return "SpriteBatchNode HonorTransform";
    },
    onExit:function () {
        this._super();
        cc.SpriteFrameCache.sharedSpriteFrameCache().removeUnusedSpriteFrames();
    }
});

//------------------------------------------------------------------
//
// SpriteBatchNodeChildrenZ
//
//------------------------------------------------------------------
var SpriteBatchNodeChildrenZ = SpriteTestDemo.extend({
    ctor:function () {
        var s = cc.Director.sharedDirector().getWinSize();

        // parents
        var batch;
        var sprite1, sprite2, sprite3;
        cc.SpriteFrameCache.sharedSpriteFrameCache().addSpriteFramesWithFile(s_grossiniPlist);

        // test 1
        batch = cc.SpriteBatchNode.batchNodeWithFile(s_grossini, 50);
        this.addChild(batch, 0, kTagSpriteBatchNode);

        sprite1 = cc.Sprite.spriteWithSpriteFrameName("grossini_dance_01.png");
        sprite1.setPosition(cc.ccp(s.width / 3, s.height / 2));

        sprite2 = cc.Sprite.spriteWithSpriteFrameName("grossini_dance_02.png");
        sprite2.setPosition(cc.ccp(20, 30));

        sprite3 = cc.Sprite.spriteWithSpriteFrameName("grossini_dance_03.png");
        sprite3.setPosition(cc.ccp(-20, 30));

        batch.addChild(sprite1);
        sprite1.addChild(sprite2, 2);
        sprite1.addChild(sprite3, -2);

        // test 2
        batch = cc.SpriteBatchNode.batchNodeWithFile(s_grossini, 50);
        this.addChild(batch, 0, kTagSpriteBatchNode);

        sprite1 = cc.Sprite.spriteWithSpriteFrameName("grossini_dance_01.png");
        sprite1.setPosition(cc.ccp(2 * s.width / 3, s.height / 2));

        sprite2 = cc.Sprite.spriteWithSpriteFrameName("grossini_dance_02.png");
        sprite2.setPosition(cc.ccp(20, 30));

        sprite3 = cc.Sprite.spriteWithSpriteFrameName("grossini_dance_03.png");
        sprite3.setPosition(cc.ccp(-20, 30));

        batch.addChild(sprite1);
        sprite1.addChild(sprite2, -2);
        sprite1.addChild(sprite3, 2);

        // test 3
        batch = cc.SpriteBatchNode.batchNodeWithFile(s_grossini, 50);
        this.addChild(batch, 0, kTagSpriteBatchNode);

        sprite1 = cc.Sprite.spriteWithSpriteFrameName("grossini_dance_01.png");
        sprite1.setPosition(cc.ccp(s.width / 2 - 90, s.height / 4));

        sprite2 = cc.Sprite.spriteWithSpriteFrameName("grossini_dance_02.png");
        sprite2.setPosition(cc.ccp(s.width / 2 - 60, s.height / 4));

        sprite3 = cc.Sprite.spriteWithSpriteFrameName("grossini_dance_03.png");
        sprite3.setPosition(cc.ccp(s.width / 2 - 30, s.height / 4));

        batch.addChild(sprite1, 10);
        batch.addChild(sprite2, -10);
        batch.addChild(sprite3, -5);

        // test 4
        batch = cc.SpriteBatchNode.batchNodeWithFile(s_grossini, 50);
        this.addChild(batch, 0, kTagSpriteBatchNode);

        sprite1 = cc.Sprite.spriteWithSpriteFrameName("grossini_dance_01.png");
        sprite1.setPosition(cc.ccp(s.width / 2 + 30, s.height / 4));

        sprite2 = cc.Sprite.spriteWithSpriteFrameName("grossini_dance_02.png");
        sprite2.setPosition(cc.ccp(s.width / 2 + 60, s.height / 4));

        sprite3 = cc.Sprite.spriteWithSpriteFrameName("grossini_dance_03.png");
        sprite3.setPosition(cc.ccp(s.width / 2 + 90, s.height / 4));

        batch.addChild(sprite1, -10);
        batch.addChild(sprite2, -5);
        batch.addChild(sprite3, -2);
    },
    title:function () {
        return "SpriteBatchNode Children Z";
    },
    onExit:function () {
        this._super();
        cc.SpriteFrameCache.sharedSpriteFrameCache().removeUnusedSpriteFrames();
    }
});

//------------------------------------------------------------------
//
// SpriteChildrenVisibility
//
//------------------------------------------------------------------
var SpriteChildrenVisibility = SpriteTestDemo.extend({
    ctor:function () {
        var s = cc.Director.sharedDirector().getWinSize();

        cc.SpriteFrameCache.sharedSpriteFrameCache().addSpriteFramesWithFile(s_grossiniPlist);
        //
        // SpriteBatchNode
        //
        // parents
        var aParent = cc.SpriteBatchNode.batchNodeWithFile(s_grossini, 50);
        aParent.setPosition(cc.ccp(s.width / 3, s.height / 2));
        this.addChild(aParent, 0);

        var sprite1 = cc.Sprite.spriteWithSpriteFrameName("grossini_dance_01.png");
        sprite1.setPosition(cc.ccp(0, 0));

        var sprite2 = cc.Sprite.spriteWithSpriteFrameName("grossini_dance_02.png");
        sprite2.setPosition(cc.ccp(20, 30));

        var sprite3 = cc.Sprite.spriteWithSpriteFrameName("grossini_dance_03.png");
        sprite3.setPosition(cc.ccp(-20, 30));

        aParent.addChild(sprite1);
        sprite1.addChild(sprite2, -2);
        sprite1.addChild(sprite3, 2);

        sprite1.runAction(cc.Blink.actionWithDuration(5, 10));

        //
        // Sprite
        //
        aParent = cc.Node.node();
        aParent.setPosition(cc.ccp(2 * s.width / 3, s.height / 2));
        this.addChild(aParent, 0);

        sprite1 = cc.Sprite.spriteWithSpriteFrameName("grossini_dance_01.png");
        sprite1.setPosition(cc.ccp(0, 0));

        sprite2 = cc.Sprite.spriteWithSpriteFrameName("grossini_dance_02.png");
        sprite2.setPosition(cc.ccp(20, 30));

        sprite3 = cc.Sprite.spriteWithSpriteFrameName("grossini_dance_03.png");
        sprite3.setPosition(cc.ccp(-20, 30));

        aParent.addChild(sprite1);
        sprite1.addChild(sprite2, -2);
        sprite1.addChild(sprite3, 2);

        sprite1.runAction(cc.Blink.actionWithDuration(5, 10));
    },
    title:function () {
        return "Sprite & SpriteBatchNode Visibility";
    },
    onExit:function () {
        this._super();
        cc.SpriteFrameCache.sharedSpriteFrameCache().removeUnusedSpriteFrames();
    }
});

//------------------------------------------------------------------
//
// SpriteChildrenVisibilityIssue665
//
//------------------------------------------------------------------
var SpriteChildrenVisibilityIssue665 = SpriteTestDemo.extend({
    ctor:function () {
        var s = cc.Director.sharedDirector().getWinSize();

        cc.SpriteFrameCache.sharedSpriteFrameCache().addSpriteFramesWithFile(s_grossiniPlist);
        //
        // SpriteBatchNode
        //
        // parents
        var aParent = cc.SpriteBatchNode.batchNodeWithFile(s_grossini, 50);
        aParent.setPosition(cc.ccp(s.width / 3, s.height / 2));
        this.addChild(aParent, 0);

        var sprite1 = cc.Sprite.spriteWithSpriteFrameName("grossini_dance_01.png");
        sprite1.setPosition(cc.ccp(0, 0));

        var sprite2 = cc.Sprite.spriteWithSpriteFrameName("grossini_dance_02.png");
        sprite2.setPosition(cc.ccp(20, 30));

        var sprite3 = cc.Sprite.spriteWithSpriteFrameName("grossini_dance_03.png");
        sprite3.setPosition(cc.ccp(-20, 30));

        // test issue #665
        sprite1.setIsVisible(false);

        aParent.addChild(sprite1);
        sprite1.addChild(sprite2, -2);
        sprite1.addChild(sprite3, 2);

        //
        // Sprite
        //
        aParent = cc.Node.node();
        aParent.setPosition(cc.ccp(2 * s.width / 3, s.height / 2));
        this.addChild(aParent, 0);

        sprite1 = cc.Sprite.spriteWithSpriteFrameName("grossini_dance_01.png");
        sprite1.setPosition(cc.ccp(0, 0));

        sprite2 = cc.Sprite.spriteWithSpriteFrameName("grossini_dance_02.png");
        sprite2.setPosition(cc.ccp(20, 30));

        sprite3 = cc.Sprite.spriteWithSpriteFrameName("grossini_dance_03.png");
        sprite3.setPosition(cc.ccp(-20, 30));

        // test issue #665
        sprite1.setIsVisible(false);

        aParent.addChild(sprite1);
        sprite1.addChild(sprite2, -2);
        sprite1.addChild(sprite3, 2);
    },
    title:function () {
        return "Sprite & SpriteBatchNode Visibility";
    },
    subtitle:function () {
        return "No sprites should be visible";
    }
});

//------------------------------------------------------------------
//
// SpriteChildrenAnchorPoint
//
//------------------------------------------------------------------
var SpriteChildrenAnchorPoint = SpriteTestDemo.extend({
    ctor:function () {
        var s = cc.Director.sharedDirector().getWinSize();
        cc.SpriteFrameCache.sharedSpriteFrameCache().addSpriteFramesWithFile(s_grossiniPlist);

        var aParent = cc.Node.node();
        this.addChild(aParent, 0);

        // anchor (0,0)
        var sprite1 = cc.Sprite.spriteWithSpriteFrameName("grossini_dance_08.png");
        sprite1.setPosition(cc.ccp(s.width / 4, s.height / 2));
        sprite1.setAnchorPoint(cc.ccp(0, 0));

        var sprite2 = cc.Sprite.spriteWithSpriteFrameName("grossini_dance_02.png");
        sprite2.setPosition(cc.ccp(20, 30));

        var sprite3 = cc.Sprite.spriteWithSpriteFrameName("grossini_dance_03.png");
        sprite3.setPosition(cc.ccp(-20, 30));

        var sprite4 = cc.Sprite.spriteWithSpriteFrameName("grossini_dance_04.png");
        sprite4.setPosition(cc.ccp(0, 0));
        sprite4.setScale(0.5);

        aParent.addChild(sprite1);
        sprite1.addChild(sprite2, -2);
        sprite1.addChild(sprite3, -2);
        sprite1.addChild(sprite4, 3);

        var point = cc.Sprite.spriteWithFile(s_pPathR1);
        point.setScale(0.25);
        point.setPosition(sprite1.getPosition());
        this.addChild(point, 10);

        // anchor (0.5, 0.5)
        sprite1 = cc.Sprite.spriteWithSpriteFrameName("grossini_dance_08.png");
        sprite1.setPosition(cc.ccp(s.width / 2, s.height / 2));
        sprite1.setAnchorPoint(cc.ccp(0.5, 0.5));

        sprite2 = cc.Sprite.spriteWithSpriteFrameName("grossini_dance_02.png");
        sprite2.setPosition(cc.ccp(20, 30));

        sprite3 = cc.Sprite.spriteWithSpriteFrameName("grossini_dance_03.png");
        sprite3.setPosition(cc.ccp(-20, 30));

        sprite4 = cc.Sprite.spriteWithSpriteFrameName("grossini_dance_04.png");
        sprite4.setPosition(cc.ccp(0, 0));
        sprite4.setScale(0.5);

        aParent.addChild(sprite1);
        sprite1.addChild(sprite2, -2);
        sprite1.addChild(sprite3, -2);
        sprite1.addChild(sprite4, 3);

        point = cc.Sprite.spriteWithFile(s_pPathR1);
        point.setScale(0.25);
        point.setPosition(sprite1.getPosition());
        this.addChild(point, 10);

        // anchor (1,1)
        sprite1 = cc.Sprite.spriteWithSpriteFrameName("grossini_dance_08.png");
        sprite1.setPosition(cc.ccp(s.width / 2 + s.width / 4, s.height / 2));
        sprite1.setAnchorPoint(cc.ccp(1, 1));

        sprite2 = cc.Sprite.spriteWithSpriteFrameName("grossini_dance_02.png");
        sprite2.setPosition(cc.ccp(20, 30));

        sprite3 = cc.Sprite.spriteWithSpriteFrameName("grossini_dance_03.png");
        sprite3.setPosition(cc.ccp(-20, 30));

        sprite4 = cc.Sprite.spriteWithSpriteFrameName("grossini_dance_04.png");
        sprite4.setPosition(cc.ccp(0, 0));
        sprite4.setScale(0.5);

        aParent.addChild(sprite1);
        sprite1.addChild(sprite2, -2);
        sprite1.addChild(sprite3, -2);
        sprite1.addChild(sprite4, 3);

        point = cc.Sprite.spriteWithFile(s_pPathR1);
        point.setScale(0.25);
        point.setPosition(sprite1.getPosition());
        this.addChild(point, 10);
    },
    title:function () {
        return "Sprite: children + anchor";
    },
    onExit:function () {
        this._super();
        cc.SpriteFrameCache.sharedSpriteFrameCache().removeUnusedSpriteFrames();
    }
});

//------------------------------------------------------------------
//
// SpriteBatchNodeChildrenAnchorPoint
//
//------------------------------------------------------------------
var SpriteBatchNodeChildrenAnchorPoint = SpriteTestDemo.extend({
    ctor:function () {
        var s = cc.Director.sharedDirector().getWinSize();

        cc.SpriteFrameCache.sharedSpriteFrameCache().addSpriteFramesWithFile(s_grossiniPlist);
        //
        // SpriteBatchNode
        //
        // parents
        var aParent = cc.SpriteBatchNode.batchNodeWithFile(s_grossini, 50);
        this.addChild(aParent, 0);

        // anchor (0,0)
        var sprite1 = cc.Sprite.spriteWithSpriteFrameName("grossini_dance_08.png");
        sprite1.setPosition(cc.ccp(s.width / 4, s.height / 2));
        sprite1.setAnchorPoint(cc.ccp(0, 0));

        var sprite2 = cc.Sprite.spriteWithSpriteFrameName("grossini_dance_02.png");
        sprite2.setPosition(cc.ccp(20, 30));

        var sprite3 = cc.Sprite.spriteWithSpriteFrameName("grossini_dance_03.png");
        sprite3.setPosition(cc.ccp(-20, 30));

        var sprite4 = cc.Sprite.spriteWithSpriteFrameName("grossini_dance_04.png");
        sprite4.setPosition(cc.ccp(0, 0));
        sprite4.setScale(0.5);

        aParent.addChild(sprite1);
        sprite1.addChild(sprite2, -2);
        sprite1.addChild(sprite3, -2);
        sprite1.addChild(sprite4, 3);

        var point = cc.Sprite.spriteWithFile(s_pPathR1);
        point.setScale(0.25);
        point.setPosition(sprite1.getPosition());
        this.addChild(point, 10);

        // anchor (0.5, 0.5)
        sprite1 = cc.Sprite.spriteWithSpriteFrameName("grossini_dance_08.png");
        sprite1.setPosition(cc.ccp(s.width / 2, s.height / 2));
        sprite1.setAnchorPoint(cc.ccp(0.5, 0.5));

        sprite2 = cc.Sprite.spriteWithSpriteFrameName("grossini_dance_02.png");
        sprite2.setPosition(cc.ccp(20, 30));

        sprite3 = cc.Sprite.spriteWithSpriteFrameName("grossini_dance_03.png");
        sprite3.setPosition(cc.ccp(-20, 30));

        sprite4 = cc.Sprite.spriteWithSpriteFrameName("grossini_dance_04.png");
        sprite4.setPosition(cc.ccp(0, 0));
        sprite4.setScale(0.5);

        aParent.addChild(sprite1);
        sprite1.addChild(sprite2, -2);
        sprite1.addChild(sprite3, -2);
        sprite1.addChild(sprite4, 3);

        point = cc.Sprite.spriteWithFile(s_pPathR1);
        point.setScale(0.25);
        point.setPosition(sprite1.getPosition());
        this.addChild(point, 10);


        // anchor (1,1)
        sprite1 = cc.Sprite.spriteWithSpriteFrameName("grossini_dance_08.png");
        sprite1.setPosition(cc.ccp(s.width / 2 + s.width / 4, s.height / 2));
        sprite1.setAnchorPoint(cc.ccp(1, 1));

        sprite2 = cc.Sprite.spriteWithSpriteFrameName("grossini_dance_02.png");
        sprite2.setPosition(cc.ccp(20, 30));

        sprite3 = cc.Sprite.spriteWithSpriteFrameName("grossini_dance_03.png");
        sprite3.setPosition(cc.ccp(-20, 30));

        sprite4 = cc.Sprite.spriteWithSpriteFrameName("grossini_dance_04.png");
        sprite4.setPosition(cc.ccp(0, 0));
        sprite4.setScale(0.5);

        aParent.addChild(sprite1);
        sprite1.addChild(sprite2, -2);
        sprite1.addChild(sprite3, -2);
        sprite1.addChild(sprite4, 3);

        point = cc.Sprite.spriteWithFile(s_pPathR1);
        point.setScale(0.25);
        point.setPosition(sprite1.getPosition());
        this.addChild(point, 10);
    },
    title:function () {
        return "SpriteBatchNode: children + anchor";
    },
    onExit:function () {
        this._super();
        cc.SpriteFrameCache.sharedSpriteFrameCache().removeUnusedSpriteFrames();
    }
});

//------------------------------------------------------------------
//
// SpriteBatchNodeChildrenScale
//
//------------------------------------------------------------------
var SpriteBatchNodeChildrenScale = SpriteTestDemo.extend({
    ctor:function () {
        var s = cc.Director.sharedDirector().getWinSize();
        cc.SpriteFrameCache.sharedSpriteFrameCache().addSpriteFramesWithFile(s_grossini_familyPlist);

        var rot = cc.RotateBy.actionWithDuration(10, 360);
        var seq = cc.RepeatForever.actionWithAction(rot);

        //
        // Children + Scale using Sprite
        // Test 1
        //
        var aParent = cc.Node.node();
        var sprite1 = cc.Sprite.spriteWithSpriteFrameName("grossinis_sister1.png");
        sprite1.setPosition(cc.ccp(s.width / 4, s.height / 4));
        sprite1.setScaleX(0.5);
        sprite1.setScaleY(2.0);
        sprite1.runAction(seq);


        var sprite2 = cc.Sprite.spriteWithSpriteFrameName("grossinis_sister2.png");
        sprite2.setPosition(cc.ccp(50, 0));

        this.addChild(aParent);
        aParent.addChild(sprite1);
        sprite1.addChild(sprite2);

        rot = cc.RotateBy.actionWithDuration(10, 360);
        seq = cc.RepeatForever.actionWithAction(rot);
        //
        // Children + Scale using SpriteBatchNode
        // Test 2
        //
        aParent = cc.SpriteBatchNode.batchNodeWithFile(s_grossini_family);
        sprite1 = cc.Sprite.spriteWithSpriteFrameName("grossinis_sister1.png");
        sprite1.setPosition(cc.ccp(3 * s.width / 4, s.height / 4));
        sprite1.setScaleX(0.5);
        sprite1.setScaleY(2.0);
        sprite1.runAction(seq);

        sprite2 = cc.Sprite.spriteWithSpriteFrameName("grossinis_sister2.png");
        sprite2.setPosition(cc.ccp(50, 0));

        this.addChild(aParent);
        aParent.addChild(sprite1);
        sprite1.addChild(sprite2);

        rot = cc.RotateBy.actionWithDuration(10, 360);
        seq = cc.RepeatForever.actionWithAction(rot);
        //
        // Children + Scale using Sprite
        // Test 3
        //
        aParent = cc.Node.node();
        sprite1 = cc.Sprite.spriteWithSpriteFrameName("grossinis_sister1.png");
        sprite1.setPosition(cc.ccp(s.width / 4, 2 * s.height / 3));
        sprite1.setScaleX(1.5);
        sprite1.setScaleY(0.5);
        sprite1.runAction(seq);

        sprite2 = cc.Sprite.spriteWithSpriteFrameName("grossinis_sister2.png");
        sprite2.setPosition(cc.ccp(50, 0));

        this.addChild(aParent);
        aParent.addChild(sprite1);
        sprite1.addChild(sprite2);

        rot = cc.RotateBy.actionWithDuration(10, 360);
        seq = cc.RepeatForever.actionWithAction(rot);
        //
        // Children + Scale using Sprite
        // Test 4
        //
        aParent = cc.SpriteBatchNode.batchNodeWithFile(s_grossini_family);
        sprite1 = cc.Sprite.spriteWithSpriteFrameName("grossinis_sister1.png");
        sprite1.setPosition(cc.ccp(3 * s.width / 4, 2 * s.height / 3));
        sprite1.setScaleX(1.5);
        sprite1.setScaleY(0.5);
        sprite1.runAction(seq);

        sprite2 = cc.Sprite.spriteWithSpriteFrameName("grossinis_sister2.png");
        sprite2.setPosition(cc.ccp(50, 0));

        this.addChild(aParent);
        aParent.addChild(sprite1);
        sprite1.addChild(sprite2);
    },
    title:function () {
        return "Sprite/BatchNode + child + scale + rot";
    }
});

//------------------------------------------------------------------
//
// SpriteChildrenChildren
//
//------------------------------------------------------------------
var SpriteChildrenChildren = SpriteTestDemo.extend({
    ctor:function () {
        var s = cc.Director.sharedDirector().getWinSize();

        cc.SpriteFrameCache.sharedSpriteFrameCache().addSpriteFramesWithFile(s_ghostsPlist);

        var rot = cc.RotateBy.actionWithDuration(10, 360);
        var seq = cc.RepeatForever.actionWithAction(rot);

        var rot_back = rot.reverse();
        var rot_back_fe = cc.RepeatForever.actionWithAction(rot_back);

        //
        // SpriteBatchNode: 3 levels of children
        //
        var aParent = cc.Node.node();
        this.addChild(aParent);

        // parent
        var l1 = cc.Sprite.spriteWithSpriteFrameName("father.gif");
        l1.setPosition(cc.ccp(s.width / 2, s.height / 2));
        l1.runAction(seq.copy());
        aParent.addChild(l1);
        var l1Size = l1.getContentSize();

        // child left
        var l2a = cc.Sprite.spriteWithSpriteFrameName("sister1.gif");
        l2a.setPosition(cc.ccp(-50 + l1Size.width / 2, 0 + l1Size.height / 2));
        l2a.runAction(rot_back_fe.copy());
        l1.addChild(l2a);
        var l2aSize = l2a.getContentSize();


        // child right
        var l2b = cc.Sprite.spriteWithSpriteFrameName("sister2.gif");
        l2b.setPosition(cc.ccp(+50 + l1Size.width / 2, 0 + l1Size.height / 2));
        l2b.runAction(rot_back_fe.copy());
        l1.addChild(l2b);
        var l2bSize = l2a.getContentSize();


        // child left bottom
        var l3a1 = cc.Sprite.spriteWithSpriteFrameName("child1.gif");
        l3a1.setScale(0.45);
        l3a1.setPosition(cc.ccp(0 + l2aSize.width / 2, -100 + l2aSize.height / 2));
        l2a.addChild(l3a1);

        // child left top
        var l3a2 = cc.Sprite.spriteWithSpriteFrameName("child1.gif");
        l3a2.setScale(0.45);
        l3a1.setPosition(cc.ccp(0 + l2aSize.width / 2, +100 + l2aSize.height / 2));
        l2a.addChild(l3a2);

        // child right bottom
        var l3b1 = cc.Sprite.spriteWithSpriteFrameName("child1.gif");
        l3b1.setScale(0.45);
        l3b1.setFlipY(true);
        l3b1.setPosition(cc.ccp(0 + l2bSize.width / 2, -100 + l2bSize.height / 2));
        l2b.addChild(l3b1);

        // child right top
        var l3b2 = cc.Sprite.spriteWithSpriteFrameName("child1.gif");
        l3b2.setScale(0.45);
        l3b2.setFlipY(true);
        l3b1.setPosition(cc.ccp(0 + l2bSize.width / 2, +100 + l2bSize.height / 2));
        l2b.addChild(l3b2);
    },
    title:function () {
        return "Sprite multiple levels of children";
    }
});

//------------------------------------------------------------------
//
// SpriteBatchNodeChildrenChildren
//
//------------------------------------------------------------------
var SpriteBatchNodeChildrenChildren = SpriteTestDemo.extend({
    ctor:function () {
        var s = cc.Director.sharedDirector().getWinSize();

        cc.SpriteFrameCache.sharedSpriteFrameCache().addSpriteFramesWithFile(s_ghostsPlist);

        var rot = cc.RotateBy.actionWithDuration(10, 360);
        var seq = cc.RepeatForever.actionWithAction(rot);

        var rot_back = rot.reverse();
        var rot_back_fe = cc.RepeatForever.actionWithAction(rot_back);

        //
        // SpriteBatchNode: 3 levels of children
        //
        var aParent = cc.SpriteBatchNode.batchNodeWithFile(s_ghosts);
        //TODO for WebGL
        //aParent.getTexture().generateMipmap();
        this.addChild(aParent);

        // parent
        var l1 = cc.Sprite.spriteWithSpriteFrameName("father.gif");
        l1.setPosition(cc.ccp(s.width / 2, s.height / 2));
        l1.runAction(seq.copy());
        aParent.addChild(l1);
        var l1Size = l1.getContentSize();

        // child left
        var l2a = cc.Sprite.spriteWithSpriteFrameName("sister1.gif");
        l2a.setPosition(cc.ccp(-50 + l1Size.width / 2, 0 + l1Size.height / 2));
        l2a.runAction(rot_back_fe.copy());
        l1.addChild(l2a);
        var l2aSize = l2a.getContentSize();


        // child right
        var l2b = cc.Sprite.spriteWithSpriteFrameName("sister2.gif");
        l2b.setPosition(cc.ccp(50 + l1Size.width / 2, 0 + l1Size.height / 2));
        l2b.runAction(rot_back_fe.copy());
        l1.addChild(l2b);
        var l2bSize = l2a.getContentSize();


        // child left bottom
        var l3a1 = cc.Sprite.spriteWithSpriteFrameName("child1.gif");
        l3a1.setScale(0.45);
        l3a1.setPosition(cc.ccp(0 + l2aSize.width / 2, -100 + l2aSize.height / 2));
        l2a.addChild(l3a1);

        // child left top
        var l3a2 = cc.Sprite.spriteWithSpriteFrameName("child1.gif");
        l3a2.setScale(0.45);
        l3a1.setPosition(cc.ccp(0 + l2aSize.width / 2, +100 + l2aSize.height / 2));
        l2a.addChild(l3a2);

        // child right bottom
        var l3b1 = cc.Sprite.spriteWithSpriteFrameName("child1.gif");
        l3b1.setScale(0.45);
        l3b1.setFlipY(true);
        l3b1.setPosition(cc.ccp(0 + l2bSize.width / 2, -100 + l2bSize.height / 2));
        l2b.addChild(l3b1);

        // child right top
        var l3b2 = cc.Sprite.spriteWithSpriteFrameName("child1.gif");
        l3b2.setScale(0.45);
        l3b2.setFlipY(true);
        l3b1.setPosition(cc.ccp(0 + l2bSize.width / 2, +100 + l2bSize.height / 2));
        l2b.addChild(l3b2);
    },
    title:function () {
        return "SpriteBatchNode multiple levels of children";
    }
});

//------------------------------------------------------------------
//
// SpriteNilTexture
//
//------------------------------------------------------------------
var SpriteNilTexture = SpriteTestDemo.extend({
    ctor:function () {
        var s = cc.Director.sharedDirector().getWinSize();

        // TEST: If no texture is given, then Opacity + Color should work.
        var sprite = new cc.Sprite();
        sprite.init();
        sprite.setTextureRect(cc.RectMake(0, 0, 300, 300));
        sprite.setColor(cc.RED());
        sprite.setOpacity(128);
        sprite.setPosition(cc.ccp(3 * s.width / 4, s.height / 2));
        this.addChild(sprite, 100);

        sprite = new cc.Sprite();
        sprite.init();
        sprite.setTextureRect(cc.RectMake(0, 0, 300, 300));
        sprite.setColor(cc.BLUE());
        sprite.setOpacity(128);
        sprite.setPosition(cc.ccp(1 * s.width / 4, s.height / 2));
        this.addChild(sprite, 100);
    },
    title:function () {
        return "Sprite without texture";
    },
    subtitle:function () {
        return "opacity and color should work";
    }
});

var MySprite1 = cc.Sprite.extend({
    _ivar:0,
    ctor:function () {
    }
});
MySprite1.spriteWithSpriteFrameName = function (pszSpriteFrameName) {
    var pFrame = cc.SpriteFrameCache.sharedSpriteFrameCache().spriteFrameByName(pszSpriteFrameName);
    var pobSprite = new MySprite1();
    pobSprite.initWithSpriteFrame(pFrame);

    return pobSprite;
};

var MySprite2 = cc.Sprite.extend({
    _ivar:0,
    ctor:function () {
    }
});
MySprite2.spriteWithFile = function (pszName) {
    var pobSprite = new MySprite2();
    pobSprite.initWithFile(pszName);

    return pobSprite;
}

var SpriteSubclass = SpriteTestDemo.extend({
    ctor:function () {
        var s = cc.Director.sharedDirector().getWinSize();

        cc.SpriteFrameCache.sharedSpriteFrameCache().addSpriteFramesWithFile(s_ghostsPlist);
        var aParent = cc.SpriteBatchNode.batchNodeWithFile(s_ghosts);

        // MySprite1
        var sprite = MySprite1.spriteWithSpriteFrameName("father.gif");
        sprite.setPosition(cc.ccp(s.width / 4 * 1, s.height / 2));
        aParent.addChild(sprite);
        this.addChild(aParent);

        // MySprite2
        var sprite2 = MySprite2.spriteWithFile(s_pPathGrossini);
        this.addChild(sprite2);
        sprite2.setPosition(cc.ccp(s.width / 4 * 3, s.height / 2));
    },
    title:function () {
        return "Sprite subclass";
    },
    subtitle:function () {
        return "Testing initWithTexture:rect method";
    }
});

//------------------------------------------------------------------
//
// AnimationCache
//
//------------------------------------------------------------------
var AnimationCache = SpriteTestDemo.extend({
    ctor:function () {
        cc.SpriteFrameCache.sharedSpriteFrameCache().addSpriteFramesWithFile(s_grossiniPlist);
        cc.SpriteFrameCache.sharedSpriteFrameCache().addSpriteFramesWithFile(s_grossini_grayPlist);
        cc.SpriteFrameCache.sharedSpriteFrameCache().addSpriteFramesWithFile(s_grossini_bluePlist);

        //
        // create animation "dance"
        //
        var animFrames = [];
        var str = "";
        for (var i = 1; i < 15; i++) {
            str = "grossini_dance_" + (i < 10 ? ("0" + i) : i) + ".png";
            var frame = cc.SpriteFrameCache.sharedSpriteFrameCache().spriteFrameByName(str);
            animFrames.push(frame);
        }

        var animation = cc.Animation.animationWithFrames(animFrames, 0.2);

        // Add an animation to the Cache
        cc.AnimationCache.sharedAnimationCache().addAnimation(animation, "dance");

        //
        // create animation "dance gray"
        //
        animFrames = [];

        for (i = 1; i < 15; i++) {
            str = "grossini_dance_gray_" + (i < 10 ? ("0" + i) : i) + ".png";
            var frame = cc.SpriteFrameCache.sharedSpriteFrameCache().spriteFrameByName(str);
            animFrames.push(frame);
        }

        animation = cc.Animation.animationWithFrames(animFrames, 0.2);

        // Add an animation to the Cache
        cc.AnimationCache.sharedAnimationCache().addAnimation(animation, "dance_gray");

        //
        // create animation "dance blue"
        //
        animFrames = [];

        for (i = 1; i < 4; i++) {
            str = "grossini_blue_0" + i + ".png";
            var frame = cc.SpriteFrameCache.sharedSpriteFrameCache().spriteFrameByName(str);
            animFrames.push(frame);
        }

        animation = cc.Animation.animationWithFrames(animFrames, 0.2);

        // Add an animation to the Cache
        cc.AnimationCache.sharedAnimationCache().addAnimation(animation, "dance_blue");

        var animCache = cc.AnimationCache.sharedAnimationCache();

        var normal = animCache.animationByName("dance");
        var dance_grey = animCache.animationByName("dance_gray");
        var dance_blue = animCache.animationByName("dance_blue");

        var animN = cc.Animate.actionWithAnimation(normal);
        var animG = cc.Animate.actionWithAnimation(dance_grey);
        var animB = cc.Animate.actionWithAnimation(dance_blue);

        var seq = cc.Sequence.actions(animN, animG, animB);

        // create an sprite without texture
        var grossini = new cc.Sprite();
        grossini.init();

        var winSize = cc.Director.sharedDirector().getWinSize();
        grossini.setPosition(cc.ccp(winSize.width / 2, winSize.height / 2));
        this.addChild(grossini);

        // run the animation
        grossini.runAction(seq);
    },
    title:function () {
        return "AnimationCache";
    },
    subtitle:function () {
        return "Sprite should be animated";
    }
});

var SpriteTestScene = TestScene.extend({
    runThisTest:function () {
        sceneIdx = -1;
        MAX_LAYER = 48;
        var pLayer = nextSpriteTestAction();
        this.addChild(pLayer);

        cc.Director.sharedDirector().replaceScene(this);
    }
});