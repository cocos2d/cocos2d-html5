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

var kTagBase = 2000;
var kMaxNodes = 1500;
var kNodesIncrease = 50;
var s_nCurCase = 0;

////////////////////////////////////////////////////////
//
// NodeChildrenMenuLayer
//
////////////////////////////////////////////////////////
var NodeChildrenMenuLayer = PerformBasicLayer.extend({
    _m_nMaxCases:4,
    showCurrentTest:function () {
        var nNodes = (this.getParent()).getQuantityOfNodes();
        var pScene = null;
        switch (this._m_nCurCase) {
            case 0:
                pScene = new IterateSpriteSheetCArray();
                break;
            case 1:
                pScene = new AddSpriteSheet();
                break;
            case 2:
                pScene = new RemoveSpriteSheet();
                break;
            case 3:
                pScene = new ReorderSpriteSheet();
                break;
        }
        s_nCurCase = this._m_nCurCase;

        if (pScene) {
            pScene.initWithQuantityOfNodes(nNodes);
            cc.Director.sharedDirector().replaceScene(pScene);
        }
    }
});

////////////////////////////////////////////////////////
//
// NodeChildrenMainScene
//
////////////////////////////////////////////////////////
var NodeChildrenMainScene = cc.Scene.extend({
    _lastRenderedCount:null,
    _quantityOfNodes:null,
    _currentQuantityOfNodes:null,
    initWithQuantityOfNodes:function (nNodes) {
        //srand(time());
        var s = cc.Director.sharedDirector().getWinSize();

        // Title
        var label = cc.LabelTTF.labelWithString(this.title(), "Arial", 40);
        this.addChild(label, 1);
        label.setPosition(cc.ccp(s.width / 2, s.height - 32));
        label.setColor(cc.ccc3(255, 255, 40));

        // Subtitle
        var strSubTitle = this.subtitle();
        if (strSubTitle.length) {
            var l = cc.LabelTTF.labelWithString(strSubTitle, "Thonburi", 16);
            this.addChild(l, 1);
            l.setPosition(cc.ccp(s.width / 2, s.height - 80));
        }

        this._lastRenderedCount = 0;
        this._currentQuantityOfNodes = 0;
        this._quantityOfNodes = nNodes;

        cc.MenuItemFont.setFontSize(65);
        var that =this;
        var decrease = cc.MenuItemFont.itemFromString(" - ", this, this.onDecrease);
        decrease.setColor(cc.ccc3(0, 200, 20));
        var increase = cc.MenuItemFont.itemFromString(" + ", this, this.onIncrease);
        increase.setColor(cc.ccc3(0, 200, 20));

        var menu = cc.Menu.menuWithItems(decrease, increase, null);
        menu.alignItemsHorizontally();
        menu.setPosition(cc.ccp(s.width / 2, s.height / 2 + 15));
        this.addChild(menu, 1);

        var infoLabel = cc.LabelTTF.labelWithString("0 nodes", "Marker Felt", 30);
        infoLabel.setColor(cc.ccc3(0, 200, 20));
        infoLabel.setPosition(cc.ccp(s.width / 2, s.height / 2 - 15));
        this.addChild(infoLabel, 1, kTagInfoLayer);

        var pMenu = new NodeChildrenMenuLayer(true, 4, s_nCurCase);
        this.addChild(pMenu);

        this.updateQuantityLabel();
        this.updateQuantityOfNodes();
    },
    title:function () {
        return "No title";
    },
    subtitle:function () {
        return "";
    },
    updateQuantityOfNodes:function () {

    },
    onDecrease:function (pSender) {
        this._quantityOfNodes -= kNodesIncrease;
        if (this._quantityOfNodes < 0) {
            this._quantityOfNodes = 0;
        }

        this.updateQuantityLabel();
        this.updateQuantityOfNodes();
    },
    onIncrease:function (pSender) {
        this._quantityOfNodes += kNodesIncrease;
        if (this._quantityOfNodes > kMaxNodes) {
            this._quantityOfNodes = kMaxNodes
        }

        this.updateQuantityLabel();
        this.updateQuantityOfNodes();
    },
    updateQuantityLabel:function () {
        if (this._quantityOfNodes != this._lastRenderedCount) {
            var infoLabel = this.getChildByTag(kTagInfoLayer);
            var str = this._quantityOfNodes + " nodes";
            infoLabel.setString(str);

            this._lastRenderedCount = this._quantityOfNodes;
        }
    },
    getQuantityOfNodes:function () {
        return this._quantityOfNodes;
    }
});

////////////////////////////////////////////////////////
//
// IterateSpriteSheet
//
////////////////////////////////////////////////////////
var IterateSpriteSheet = NodeChildrenMainScene.extend({
    _batchNode:null,
    _profilingTimer:null,
    ctor:function () {
        if (cc.ENABLE_PROFILERS) {
            this._profilingTimer = new cc.ProfilingTimer();
        }
    },
    updateQuantityOfNodes:function () {
        var s = cc.Director.sharedDirector().getWinSize();

        // increase nodes
        if (this._currentQuantityOfNodes < this._quantityOfNodes) {
            for (var i = 0; i < (this._quantityOfNodes - this._currentQuantityOfNodes); i++) {
                var sprite = cc.Sprite.spriteWithTexture(this._batchNode.getTexture(), cc.RectMake(0, 0, 32, 32));
                this._batchNode.addChild(sprite);
                sprite.setPosition(cc.ccp(cc.RANDOM_0_1() * s.width, cc.RANDOM_0_1() * s.height));
            }
        }

        // decrease nodes
        else if (this._currentQuantityOfNodes > this._quantityOfNodes) {
            for (var i = 0; i < (this._currentQuantityOfNodes - this._quantityOfNodes); i++) {
                var index = this._currentQuantityOfNodes - i - 1;
                this._batchNode.removeChildAtIndex(index, true);
            }
        }

        this._currentQuantityOfNodes = this._quantityOfNodes;
    },
    initWithQuantityOfNodes:function (nNodes) {
        this._batchNode = cc.SpriteBatchNode.batchNodeWithFile("Resources/Images/spritesheet1.png");
        this.addChild(this._batchNode);

        this._super(nNodes);

        if (cc.ENABLE_PROFILERS) {
            this._profilingTimer = cc.Profiler.timerWithName(this.profilerName(), this);
        }
        this.scheduleUpdate();
    },
    update:function (dt) {
    },
    profilerName:function () {
        return "none";
    }
});

////////////////////////////////////////////////////////
//
// IterateSpriteSheetFastEnum
//
////////////////////////////////////////////////////////
var IterateSpriteSheetFastEnum = IterateSpriteSheet.extend({
    update:function (dt) {
        // iterate using fast enumeration protocol
        var pChildren = this._batchNode.getChildren();

        if (cc.ENABLE_PROFILERS) {
            cc.ProfilingBeginTimingBlock(this._profilingTimer);
        }

        for (var i = 0; i < pChildren.length; i++) {
            var pSprite = pChildren[i];
            pSprite.setIsVisible(false);
        }

        if (cc.ENABLE_PROFILERS) {
            cc.ProfilingEndTimingBlock(this._profilingTimer);
        }
    },

    title:function () {
        return "A - Iterate SpriteSheet";
    },
    subtitle:function () {
        return "Iterate children using Fast Enum API. See console";
    },
    profilerName:function () {
        return "iter fast enum";
    }
});

////////////////////////////////////////////////////////
//
// IterateSpriteSheetCArray
//
////////////////////////////////////////////////////////
var IterateSpriteSheetCArray = IterateSpriteSheet.extend({
    update:function (dt) {
        // iterate using fast enumeration protocol
        var pChildren = this._batchNode.getChildren();

        if (cc.ENABLE_PROFILERS) {
            cc.ProfilingBeginTimingBlock(this._profilingTimer);
        }
        for (var i = 0; i < pChildren.length; i++) {
            var pSprite = pChildren[i];
            pSprite.setIsVisible(false);
        }

        if (cc.ENABLE_PROFILERS) {
            cc.ProfilingEndTimingBlock(this._profilingTimer);
        }
    },

    title:function () {
        return "B - Iterate SpriteSheet";
    },
    subtitle:function () {
        return "Iterate children using Array API. See console";
    },
    profilerName:function () {
        return "iter c-array";
    }
});

////////////////////////////////////////////////////////
//
// AddRemoveSpriteSheet
//
////////////////////////////////////////////////////////
var AddRemoveSpriteSheet = NodeChildrenMainScene.extend({
    _batchNode:null,
    ctor:function () {
        if (cc.ENABLE_PROFILERS) {
            this._profilingTimer = new cc.ProfilingTimer();
        }
    },
    updateQuantityOfNodes:function () {
        var s = cc.Director.sharedDirector().getWinSize();

        // increase nodes
        if (this._currentQuantityOfNodes < this._quantityOfNodes) {
            for (var i = 0; i < (this._quantityOfNodes - this._currentQuantityOfNodes); i++) {
                var sprite = cc.Sprite.spriteWithTexture(this._batchNode.getTexture(), cc.RectMake(0, 0, 32, 32));
                this._batchNode.addChild(sprite);
                sprite.setPosition(cc.ccp(cc.RANDOM_0_1() * s.width, cc.RANDOM_0_1() * s.height));
                sprite.setIsVisible(false);
            }
        }
        // decrease nodes
        else if (this._currentQuantityOfNodes > this._quantityOfNodes) {
            for (var i = 0; i < (this._currentQuantityOfNodes - this._quantityOfNodes); i++) {
                var index = this._currentQuantityOfNodes - i - 1;
                this._batchNode.removeChildAtIndex(index, true);
            }
        }

        this._currentQuantityOfNodes = this._quantityOfNodes;
    },
    initWithQuantityOfNodes:function (nNodes) {
        this._batchNode = cc.SpriteBatchNode.batchNodeWithFile("Resources/Images/spritesheet1.png");
        this.addChild(this._batchNode);

        this._super(nNodes);

        if (cc.ENABLE_PROFILERS) {
            this._profilingTimer = cc.Profiler.timerWithName(this.profilerName(), this);
        }

        this.scheduleUpdate();
    },
    update:function (dt) {
    },
    profilerName:function () {
        return "none";
    }
});

////////////////////////////////////////////////////////
//
// AddSpriteSheet
//
////////////////////////////////////////////////////////
var AddSpriteSheet = AddRemoveSpriteSheet.extend({
    update:function (dt) {
        // reset seed
        //srandom(0);

        // 15 percent
        var totalToAdd = this._currentQuantityOfNodes * 0.15;

        if (totalToAdd > 0) {
            var sprites = [];
            var zs = [];

            // Don't include the sprite creation time and random as part of the profiling
            for (var i = 0; i < totalToAdd; i++) {
                var pSprite = cc.Sprite.spriteWithTexture(this._batchNode.getTexture(), cc.RectMake(0, 0, 32, 32));
                sprites.push(pSprite);
                zs[i] = cc.RANDOM_MINUS1_1() * 50;
            }

            // add them with random Z (very important!)
            if (cc.ENABLE_PROFILERS)
                cc.ProfilingBeginTimingBlock(this._profilingTimer);
        }

        for (var i = 0; i < totalToAdd; i++) {
            this._batchNode.addChild(sprites[i], zs[i], kTagBase + i);
        }

        if (cc.ENABLE_PROFILERS) {
            cc.ProfilingEndTimingBlock(this._profilingTimer);
        }

        // remove them
        for (var i = 0; i < totalToAdd; i++) {
            this._batchNode.removeChildByTag(kTagBase + i, true);
        }

        delete zs;

    },
    title:function () {
        return "C - Add to spritesheet";
    },
    subtitle:function () {
        return "Adds %10 of total sprites with random z. See console";
    },
    profilerName:function () {
        return "add sprites";
    }
})
    ;

////////////////////////////////////////////////////////
//
// RemoveSpriteSheet
//
////////////////////////////////////////////////////////
var RemoveSpriteSheet = AddRemoveSpriteSheet.extend({
    update:function (dt) {
        //srandom(0);

        // 15 percent
        var totalToAdd = this._currentQuantityOfNodes * 0.15;

        if (totalToAdd > 0) {
            var sprites = [];

            // Don't include the sprite creation time as part of the profiling
            for (var i = 0; i < totalToAdd; i++) {
                var pSprite = cc.Sprite.spriteWithTexture(this._batchNode.getTexture(), cc.RectMake(0, 0, 32, 32));
                sprites.push(pSprite);
            }

            // add them with random Z (very important!)
            for (var i = 0; i < totalToAdd; i++) {
                this._batchNode.addChild(sprites[i], cc.RANDOM_MINUS1_1() * 50, kTagBase + i);
            }

            // remove them
            if (cc.ENABLE_PROFILERS) {
                cc.ProfilingBeginTimingBlock(this._profilingTimer);
            }

            for (var i = 0; i < totalToAdd; i++) {
                this._batchNode.removeChildByTag(kTagBase + i, true);
            }

            if (cc.ENABLE_PROFILERS) {
                cc.ProfilingEndTimingBlock(this._profilingTimer);
            }
        }
    },
    title:function () {
        return "D - Del from spritesheet";
    },
    subtitle:function () {
        return "Remove %10 of total sprites placed randomly. See console";
    },
    profilerName:function () {
        return "remove sprites";
    }
});

////////////////////////////////////////////////////////
//
// ReorderSpriteSheet
//
////////////////////////////////////////////////////////
var ReorderSpriteSheet = AddRemoveSpriteSheet.extend({

    update:function (dt) {
        //srandom(0);

        // 15 percent
        var totalToAdd = this._currentQuantityOfNodes * 0.15;

        if (totalToAdd > 0) {
            var sprites = [];

            // Don't include the sprite creation time as part of the profiling
            for (var i = 0; i < totalToAdd; i++) {
                var pSprite = cc.Sprite.spriteWithTexture(this._batchNode.getTexture(), cc.RectMake(0, 0, 32, 32));
                sprites.push(pSprite);
            }

            // add them with random Z (very important!)
            for (var i = 0; i < totalToAdd; i++) {
                this._batchNode.addChild(sprites[i], cc.RANDOM_MINUS1_1() * 50, kTagBase + i);
            }

            //		[this._batchNode sortAllChildren];

            // reorder them
            if (cc.ENABLE_PROFILERS) {
                cc.ProfilingBeginTimingBlock(this._profilingTimer);
            }

            for (var i = 0; i < totalToAdd; i++) {
                var pNode = this._batchNode.getChildren()[i];;
                this._batchNode.reorderChild(pNode, cc.RANDOM_MINUS1_1() * 50);
            }
            if (cc.ENABLE_PROFILERS) {
                cc.ProfilingEndTimingBlock(this._profilingTimer);
            }
        }


        // remove them
        for (var i = 0; i < totalToAdd; i++) {
            this._batchNode.removeChildByTag(kTagBase + i, true);
        }

    },

    title:function () {
        return "E - Reorder from spritesheet";
    },
    subtitle:function () {
        return "Reorder %10 of total sprites placed randomly. See console";
    },
    profilerName:function () {
        return "reorder sprites";
    }
});

function runNodeChildrenTest() {
    var pScene = new IterateSpriteSheetCArray();
    pScene.initWithQuantityOfNodes(kNodesIncrease);
    cc.Director.sharedDirector().replaceScene(pScene);
}