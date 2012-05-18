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
var kMaxSprites = 1000;
var kSpritesIncrease = 50;

var kTagInfoLayer = 1;
var kTagMainLayer = 2;
var kTagSpriteMenuLayer = (kMaxSprites + 1000);

var s_nSpriteCurCase = 0;

////////////////////////////////////////////////////////
//
// SubTest
//
////////////////////////////////////////////////////////
var SubTest = cc.Class.extend({
    _subtestNumber:null,
    _batchNode:null,
    _parent:null,
    removeByTag:function (tag) {
        switch (this._subtestNumber) {
            case 1:
            case 4:
            case 7:
                this._parent.removeChildByTag(tag + 100, true);
                break;
            case 2:
            case 3:
            case 5:
            case 6:
            case 8:
            case 9:
                this._batchNode.removeChildAtIndex(tag, true);
                break;
            default:
                break;
        }
    },
    createSpriteWithTag:function (tag) {
// create
        cc.Texture2D.setDefaultAlphaPixelFormat(cc.kCCTexture2DPixelFormat_RGBA8888);

        var sprite = null;
        switch (this._subtestNumber) {
            case 1:
            {
                sprite = cc.Sprite.spriteWithFile("Resources/Images/grossinis_sister1.png");
                this._parent.addChild(sprite, 0, tag + 100);
                break;
            }
            case 2:
            case 3:
            {
                sprite = cc.Sprite.spriteWithBatchNode(this._batchNode, cc.RectMake(0, 0, 52, 139));
                this._batchNode.addChild(sprite, 0, tag + 100);
                break;
            }
            case 4:
            {
                var idx = parseInt(cc.RANDOM_0_1() * 1400 / 100) + 1;
                idx = idx < 10 ? "0" + idx : idx.toString();
                var str = "Resources/Images/grossini_dance_" + idx + ".png";
                sprite = cc.Sprite.spriteWithFile(str);
                this._parent.addChild(sprite, 0, tag + 100);
                break;
            }
            case 5:
            case 6:
            {
                var y, x;
                var r = (cc.RANDOM_0_1() * 1400 / 100);

                y = r / 5;
                x = r % 5;

                x *= 85;
                y *= 121;
                sprite = cc.Sprite.spriteWithBatchNode(this._batchNode, cc.RectMake(x, y, 85, 121));
                this._batchNode.addChild(sprite, 0, tag + 100);
                break;
            }

            case 7:
            {
                var y, x;
                var r = (cc.RANDOM_0_1() * 6400 / 100);

                y = parseInt(r / 8);
                x = parseInt(r % 8);

                var str = "Resources/Images/sprites_test/sprite-" + x + "-" + y + ".png";
                sprite = cc.Sprite.spriteWithFile(str);
                this._parent.addChild(sprite, 0, tag + 100);
                break;
            }

            case 8:
            case 9:
            {
                var y, x;
                var r = (cc.RANDOM_0_1() * 6400 / 100);

                y = r / 8;
                x = r % 8;

                x *= 32;
                y *= 32;
                sprite = cc.Sprite.spriteWithBatchNode(this._batchNode, cc.RectMake(x, y, 32, 32));
                this._batchNode.addChild(sprite, 0, tag + 100);
                break;
            }

            default:
                break;
        }

        cc.Texture2D.setDefaultAlphaPixelFormat(cc.kCCTexture2DPixelFormat_Default);

        return sprite;
    },
    initWithSubTest:function (nSubTest, p) {
        this._subtestNumber = nSubTest;
        this._parent = p;
        this._batchNode = null;
        /*
         * Tests:
         * 1: 1 (32-bit) PNG sprite of 52 x 139
         * 2: 1 (32-bit) PNG Batch Node using 1 sprite of 52 x 139
         * 3: 1 (16-bit) PNG Batch Node using 1 sprite of 52 x 139
         * 4: 1 (4-bit) PVRTC Batch Node using 1 sprite of 52 x 139

         * 5: 14 (32-bit) PNG sprites of 85 x 121 each
         * 6: 14 (32-bit) PNG Batch Node of 85 x 121 each
         * 7: 14 (16-bit) PNG Batch Node of 85 x 121 each
         * 8: 14 (4-bit) PVRTC Batch Node of 85 x 121 each

         * 9: 64 (32-bit) sprites of 32 x 32 each
         *10: 64 (32-bit) PNG Batch Node of 32 x 32 each
         *11: 64 (16-bit) PNG Batch Node of 32 x 32 each
         *12: 64 (4-bit) PVRTC Batch Node of 32 x 32 each
         */

        // purge textures
        var mgr = cc.TextureCache.sharedTextureCache();
        //		[mgr removeAllTextures];
        mgr.removeTexture(mgr.addImage("Resources/Images/grossinis_sister1.png"));
        mgr.removeTexture(mgr.addImage("Resources/Images/grossini_dance_atlas.png"));
        mgr.removeTexture(mgr.addImage("Resources/Images/spritesheet1.png"));

        switch (this._subtestNumber) {
            case 1:
            case 4:
            case 7:
                break;
            ///
            case 2:
                cc.Texture2D.setDefaultAlphaPixelFormat(cc.kCCTexture2DPixelFormat_RGBA8888);
                this._batchNode = cc.SpriteBatchNode.batchNodeWithFile("Resources/Images/grossinis_sister1.png", 100);
                p.addChild(this._batchNode, 0);
                break;
            case 3:
                cc.Texture2D.setDefaultAlphaPixelFormat(cc.kCCTexture2DPixelFormat_RGBA4444);
                this._batchNode = cc.SpriteBatchNode.batchNodeWithFile("Resources/Images/grossinis_sister1.png", 100);
                p.addChild(this._batchNode, 0);
                break;

            ///
            case 5:
                cc.Texture2D.setDefaultAlphaPixelFormat(cc.kCCTexture2DPixelFormat_RGBA8888);
                this._batchNode = cc.SpriteBatchNode.batchNodeWithFile("Resources/Images/grossini_dance_atlas.png", 100);
                p.addChild(this._batchNode, 0);
                break;
            case 6:
                cc.Texture2D.setDefaultAlphaPixelFormat(cc.kCCTexture2DPixelFormat_RGBA4444);
                this._batchNode = cc.SpriteBatchNode.batchNodeWithFile("Resources/Images/grossini_dance_atlas.png", 100);
                p.addChild(this._batchNode, 0);
                break;

            ///
            case 8:
                cc.Texture2D.setDefaultAlphaPixelFormat(cc.kCCTexture2DPixelFormat_RGBA8888);
                this._batchNode = cc.SpriteBatchNode.batchNodeWithFile("Resources/Images/spritesheet1.png", 100);
                p.addChild(this._batchNode, 0);
                break;
            case 9:
                cc.Texture2D.setDefaultAlphaPixelFormat(cc.kCCTexture2DPixelFormat_RGBA4444);
                this._batchNode = cc.SpriteBatchNode.batchNodeWithFile("Resources/Images/spritesheet1.png", 100);
                p.addChild(this._batchNode, 0);
                break;

            default:
                break;
        }

        cc.Texture2D.setDefaultAlphaPixelFormat(cc.kCCTexture2DPixelFormat_Default);
    }
});

////////////////////////////////////////////////////////
//
// SpriteMenuLayer
//
////////////////////////////////////////////////////////
var SpriteMenuLayer = PerformBasicLayer.extend({
    _m_nMaxCases:7,
    showCurrentTest:function () {
        var pScene = null;
        var pPreScene = this.getParent();
        var nSubTest = pPreScene.getSubTestNum();
        var nNodes = pPreScene.getNodesNum();

        switch (this._m_nCurCase) {
            case 0:
                pScene = new SpritePerformTest1();
                break;
            case 1:
                pScene = new SpritePerformTest2();
                break;
            case 2:
                pScene = new SpritePerformTest3();
                break;
            case 3:
                pScene = new SpritePerformTest4();
                break;
            case 4:
                pScene = new SpritePerformTest5();
                break;
            case 5:
                pScene = new SpritePerformTest6();
                break;
            case 6:
                pScene = new SpritePerformTest7();
                break;
        }
        s_nSpriteCurCase = this._m_nCurCase;

        if (pScene) {
            pScene.initWithSubTest(nSubTest, nNodes);
            cc.Director.sharedDirector().replaceScene(pScene);
        }
    }
});

////////////////////////////////////////////////////////
//
// SpriteMainScene
//
////////////////////////////////////////////////////////
var SpriteMainScene = cc.Scene.extend({
    _lastRenderedCount:null,
    _quantityNodes:null,
    _m_pSubTest:null,
    _subtestNumber:1,
    title:function () {
        return "No title";
    },
    initWithSubTest:function (asubtest, nNodes) {
        this._subtestNumber = asubtest;
        this._m_pSubTest = new SubTest();
        this._m_pSubTest.initWithSubTest(asubtest, this);

        var s = cc.Director.sharedDirector().getWinSize();

        this._lastRenderedCount = 0;
        this._quantityNodes = 0;

        // add title label
        var label = cc.LabelTTF.labelWithString(this.title(), "Arial", 40);
        this.addChild(label, 1);
        label.setPosition(cc.ccp(s.width / 2, s.height - 32));
        label.setColor(cc.ccc3(255, 255, 40));

        cc.MenuItemFont.setFontSize(65);
        var decrease = cc.MenuItemFont.itemFromString(" - ", this, this.onDecrease);
        decrease.setColor(cc.ccc3(0, 200, 20));
        var increase = cc.MenuItemFont.itemFromString(" + ", this, this.onIncrease);
        increase.setColor(cc.ccc3(0, 200, 20));

        var menu = cc.Menu.menuWithItems(decrease, increase, null);
        menu.alignItemsHorizontally();

        menu.setPosition(cc.ccp(s.width / 2, s.height - 65));
        this.addChild(menu, 1);

        var infoLabel = cc.LabelTTF.labelWithString("0 nodes", "Marker Felt", 30);
        infoLabel.setColor(cc.ccc3(0, 200, 20));
        infoLabel.setPosition(cc.ccp(s.width / 2, s.height - 90));
        this.addChild(infoLabel, 1, kTagInfoLayer);

        // add menu
        var pMenu = new SpriteMenuLayer(true, 7, s_nSpriteCurCase);
        this.addChild(pMenu, 1, kTagSpriteMenuLayer);

        // Sub Tests
        cc.MenuItemFont.setFontSize(32);
        var pSubMenu = cc.Menu.menuWithItems(null);
        for (var i = 1; i <= 9; ++i) {
            var text = i.toString();
            var itemFont = cc.MenuItemFont.itemFromString(text, this, this.testNCallback);
            itemFont.setTag(i);
            pSubMenu.addChild(itemFont, 10);

            if (i <= 3)
                itemFont.setColor(cc.ccc3(200, 20, 20));
            else if (i <= 6)
                itemFont.setColor(cc.ccc3(0, 200, 20));
            else
                itemFont.setColor(cc.ccc3(0, 20, 200));
        }

        pSubMenu.alignItemsHorizontally();
        pSubMenu.setPosition(cc.ccp(s.width / 2, 80));
        this.addChild(pSubMenu, 2);

        while (this._quantityNodes < nNodes) {
            this.onIncrease(this);
        }
    },
    updateNodes:function () {
        if (this._quantityNodes != this._lastRenderedCount) {
            var infoLabel = this.getChildByTag(kTagInfoLayer);
            var str = this._quantityNodes + " nodes";
            infoLabel.setString(str);

            this._lastRenderedCount = this._quantityNodes;
        }
    },
    testNCallback:function (pSender) {
        this._subtestNumber = pSender.getTag();
        var pMenu = this.getChildByTag(kTagSpriteMenuLayer);
        pMenu.restartCallback(pSender);
    },
    onIncrease:function (pSender) {
        if (this._quantityNodes >= kMaxSprites)
            return;

        for (var i = 0; i < kSpritesIncrease; i++) {
            var sprite = this._m_pSubTest.createSpriteWithTag(this._quantityNodes);
            this.doTest(sprite);
            this._quantityNodes++;
        }

        this.updateNodes();
    },
    onDecrease:function (pSender) {
        if (this._quantityNodes <= 0)
            return;

        for (var i = 0; i < kSpritesIncrease; i++) {
            this._quantityNodes--;
            this._m_pSubTest.removeByTag(this._quantityNodes);
        }

        this.updateNodes();
    },

    doTest:function (sprite) {

    },

    getSubTestNum:function () {
        return this._subtestNumber
    },
    getNodesNum:function () {
        return this._quantityNodes
    }
});


////////////////////////////////////////////////////////
//
// For test functions
//
////////////////////////////////////////////////////////
function performanceActions(pSprite) {
    var size = cc.Director.sharedDirector().getWinSize();
    pSprite.setPosition(cc.ccp(parseInt(Math.random() * size.width), parseInt(Math.random() * size.height)));

    var period = 0.5 + (Math.random() * 1000) / 500.0;
    var rot = cc.RotateBy.actionWithDuration(period, 360.0 * cc.RANDOM_0_1());
    var rot_back = rot.reverse();
    var permanentRotation = cc.RepeatForever.actionWithAction(cc.Sequence.actions(rot, rot_back, null));
    pSprite.runAction(permanentRotation);

    var growDuration = 0.5 + (Math.random() * 1000) / 500.0;
    var grow = cc.ScaleBy.actionWithDuration(growDuration, 0.5, 0.5);
    var permanentScaleLoop = cc.RepeatForever.actionWithAction(cc.Sequence.actionOneTwo(grow, grow.reverse()));
    pSprite.runAction(permanentScaleLoop);
}

function performanceActions20(pSprite) {
    var size = cc.Director.sharedDirector().getWinSize();
    if (cc.RANDOM_0_1() < 0.2)
        pSprite.setPosition(cc.ccp(parseInt(Math.random() * size.width), parseInt(Math.random() * size.height)));
    else
        pSprite.setPosition(cc.ccp(-1000, -1000));

    var period = 0.5 + (Math.random() * 1000) / 500.0;
    var rot = cc.RotateBy.actionWithDuration(period, 360.0 * cc.RANDOM_0_1());
    var rot_back = rot.reverse();
    var permanentRotation = cc.RepeatForever.actionWithAction(cc.Sequence.actions(rot, rot_back, null));
    pSprite.runAction(permanentRotation);

    var growDuration = 0.5 + (Math.random() * 1000) / 500.0;
    var grow = cc.ScaleBy.actionWithDuration(growDuration, 0.5, 0.5);
    var permanentScaleLoop = cc.RepeatForever.actionWithAction(cc.Sequence.actionOneTwo(grow, grow.reverse()));
    pSprite.runAction(permanentScaleLoop);
}

function performanceRotationScale(pSprite) {
    var size = cc.Director.sharedDirector().getWinSize();
    pSprite.setPosition(cc.ccp(parseInt(Math.random() * size.width), parseInt(Math.random() * size.height)));
    pSprite.setRotation(cc.RANDOM_0_1() * 360);
    pSprite.setScale(cc.RANDOM_0_1() * 2);
}

function performancePosition(pSprite) {
    var size = cc.Director.sharedDirector().getWinSize();
    pSprite.setPosition(cc.ccp(parseInt(Math.random() * size.width), parseInt(Math.random() * size.height)));
}

function performanceout20(pSprite) {
    var size = cc.Director.sharedDirector().getWinSize();

    if (cc.RANDOM_0_1() < 0.2)
        pSprite.setPosition(cc.ccp(parseInt(Math.random() * size.width), parseInt(Math.random() * size.height)));
    else
        pSprite.setPosition(cc.ccp(-1000, -1000));
}

function performanceOut100(pSprite) {
    pSprite.setPosition(cc.ccp(-1000, -1000));
}

function performanceScale(pSprite) {
    var size = cc.Director.sharedDirector().getWinSize();
    pSprite.setPosition(cc.ccp(parseInt(Math.random() * size.width), parseInt(Math.random() * size.height)));
    pSprite.setScale(cc.RANDOM_0_1() * 100 / 50);
}


////////////////////////////////////////////////////////
//
// SpritePerformTest1
//
////////////////////////////////////////////////////////
var SpritePerformTest1 = SpriteMainScene.extend({
    doTest:function (sprite) {
        performancePosition(sprite);
    },
    title:function () {
        return "A (" + this._subtestNumber + ") position";
    }
});

////////////////////////////////////////////////////////
//
// SpritePerformTest2
//
////////////////////////////////////////////////////////
var SpritePerformTest2 = SpriteMainScene.extend({
    doTest:function (sprite) {
        performanceScale(sprite);
    },
    title:function () {
        return "B (" + this._subtestNumber + ") scale";
    }
});

////////////////////////////////////////////////////////
//
// SpritePerformTest3
//
////////////////////////////////////////////////////////
var SpritePerformTest3 = SpriteMainScene.extend({
    doTest:function (sprite) {
        performanceRotationScale(sprite);
    },
    title:function () {
        return "C (" + this._subtestNumber + ") scale + rot";
    }
});

////////////////////////////////////////////////////////
//
// SpritePerformTest4
//
////////////////////////////////////////////////////////
var SpritePerformTest4 = SpriteMainScene.extend({
    doTest:function (sprite) {
        performanceOut100(sprite);
    },
    title:function () {
        return "D (" + this._subtestNumber + ") 100% out";
    }
});

////////////////////////////////////////////////////////
//
// SpritePerformTest5
//
////////////////////////////////////////////////////////
var SpritePerformTest5 = SpriteMainScene.extend({
    doTest:function (sprite) {
        performanceout20(sprite);
    },
    title:function () {
        return "E (" + this._subtestNumber + ") 80% out";
    }
});

////////////////////////////////////////////////////////
//
// SpritePerformTest6
//
////////////////////////////////////////////////////////
var SpritePerformTest6 = SpriteMainScene.extend({
    doTest:function (sprite) {
        performanceActions(sprite);
    },
    title:function () {
        return "F (" + this._subtestNumber + ") actions";
    }
});

////////////////////////////////////////////////////////
//
// SpritePerformTest7
//
////////////////////////////////////////////////////////
var SpritePerformTest7 = SpriteMainScene.extend({
    doTest:function (sprite) {
        performanceActions20(sprite);
    },
    title:function () {
        return "G (" + this._subtestNumber + ") actions 80% out";
    }
});

function runSpriteTest() {
    var pScene = new SpritePerformTest1;
    pScene.initWithSubTest(1, 50);
    cc.Director.sharedDirector().replaceScene(pScene);
}