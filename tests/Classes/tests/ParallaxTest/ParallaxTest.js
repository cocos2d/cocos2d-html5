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
var kTagNode = 9960;
var kTagGrossini = 9961;

var sceneIdx = -1;

var MAX_LAYER = 2;


function createParallaxTestLayer(nIndex) {
    switch (nIndex) {
        case 0:
            return new Parallax1();
        case 1:
            return new Parallax2();
    }

    return null;
}

function nextParallaxAction() {
    sceneIdx++;
    sceneIdx = sceneIdx % MAX_LAYER;

    var pLayer = createParallaxTestLayer(sceneIdx);
    return pLayer;
}

function backParallaxAction() {
    sceneIdx--;
    var total = MAX_LAYER;
    if (sceneIdx < 0)
        sceneIdx += total;

    var pLayer = createParallaxTestLayer(sceneIdx);
    return pLayer;
}

function restartParallaxAction() {
    var pLayer = createParallaxTestLayer(sceneIdx);
    return pLayer;
}
ParallaxDemo = cc.Layer.extend({

    _m_atlas:null,

    ctor:function () {
    },

    title:function () {
        return "No title";
    },

    onEnter:function () {
        this._super();

        var s = cc.Director.sharedDirector().getWinSize();

        var label = cc.LabelTTF.labelWithString(this.title(), "Arial", 28);
        this.addChild(label, 1);
        label.setPosition(cc.ccp(s.width / 2, s.height - 50));

        var item1 = cc.MenuItemImage.itemFromNormalImage(s_pPathB1, s_pPathB2, this, this.backCallback);
        var item2 = cc.MenuItemImage.itemFromNormalImage(s_pPathR1, s_pPathR2, this, this.restartCallback);
        var item3 = cc.MenuItemImage.itemFromNormalImage(s_pPathF1, s_pPathF2, this, this.nextCallback);

        var menu = cc.Menu.menuWithItems(item1, item2, item3, null);

        menu.setPosition(cc.PointZero());
        item1.setPosition(cc.ccp(s.width / 2 - 100, 30));
        item2.setPosition(cc.ccp(s.width / 2, 30));
        item3.setPosition(cc.ccp(s.width / 2 + 100, 30));

        this.addChild(menu, 1);

    },

    restartCallback:function (pSender) {
        var s = new ParallaxTestScene();
        s.addChild(restartParallaxAction());

        cc.Director.sharedDirector().replaceScene(s);
    },

    nextCallback:function (pSender) {
        var s = new ParallaxTestScene();
        s.addChild(nextParallaxAction());
        cc.Director.sharedDirector().replaceScene(s);

    },

    backCallback:function (pSender) {
        var s = new ParallaxTestScene();
        s.addChild(backParallaxAction());
        cc.Director.sharedDirector().replaceScene(s);
    }
});

Parallax1 = ParallaxDemo.extend({

    _m_root:null,
    _m_target:null,
    _m_streak:null,


    ctor:function () {
        // Top Layer, a simple image
        var cocosImage = cc.Sprite.spriteWithFile(s_Power);
        // scale the image (optional)
        cocosImage.setScale(0.5);
        // change the transform anchor point to 0,0 (optional)
        cocosImage.setAnchorPoint(cc.ccp(0, 0));


        // Middle layer: a Tile map atlas
        //var tilemap = cc.TileMapAtlas.tileMapAtlasWithTileFile(s_TilesPng, s_LevelMapTga, 16, 16);
        var tilemap = cc.TMXTiledMap.tiledMapWithTMXFile("Resources/TileMaps/orthogonal-test2.tmx");


        // change the transform anchor to 0,0 (optional)
        tilemap.setAnchorPoint(cc.ccp(0, 0));

        // Anti Aliased images
        //tilemap.getTexture().setAntiAliasTexParameters();


        // background layer: another image
        var background = cc.Sprite.spriteWithFile(s_back);
        // scale the image (optional)
        //background.setScale(1.5);
        // change the transform anchor point (optional)
        background.setAnchorPoint(cc.ccp(0, 0));


        // create a void node, a parent node
        var voidNode = cc.ParallaxNode.node();

        // NOW add the 3 layers to the 'void' node

        // background image is moved at a ratio of 0.4x, 0.5y
        voidNode.addChild(background, -1, cc.ccp(0.4, 0.5), cc.PointZero());

        // tiles are moved at a ratio of 2.2x, 1.0y
        voidNode.addChild(tilemap, 1, cc.ccp(2.2, 1.0), cc.ccp(0, 0));

        // top image is moved at a ratio of 3.0x, 2.5y
        voidNode.addChild(cocosImage, 2, cc.ccp(3.0, 2.5), cc.ccp(0, 0));


        // now create some actions that will move the 'void' node
        // and the children of the 'void' node will move at different
        // speed, thus, simulation the 3D environment
        var goUp = cc.MoveBy.actionWithDuration(4, cc.ccp(0, 100));
        var goDown = goUp.reverse();
        var go = cc.MoveBy.actionWithDuration(8, cc.ccp(200, 0));
        var goBack = go.reverse();
        var seq = cc.Sequence.actions(goUp, go, goDown, goBack, null);
        voidNode.runAction((cc.RepeatForever.actionWithAction(seq) ));

        this.addChild(voidNode);
    },

    title:function () {
        return "Parallax: parent and 3 children";
    }
});

Parallax2 = ParallaxDemo.extend({

    _m_root:null,
    _m_target:null,
    _m_streak:null,


    ctor:function () {
        this.setIsTouchEnabled(true);

        // Top Layer, a simple image
        var cocosImage = cc.Sprite.spriteWithFile(s_Power);
        // scale the image (optional)
        cocosImage.setScale(0.5);
        // change the transform anchor point to 0,0 (optional)
        cocosImage.setAnchorPoint(cc.ccp(0, 0));


        // Middle layer: a Tile map atlas
        //var tilemap = cc.TileMapAtlas.tileMapAtlasWithTileFile(s_TilesPng, s_LevelMapTga, 16, 16);
        var tilemap = cc.TMXTiledMap.tiledMapWithTMXFile("Resources/TileMaps/orthogonal-test2.tmx");

        // change the transform anchor to 0,0 (optional)
        tilemap.setAnchorPoint(cc.ccp(0, 0));

        // Anti Aliased images
        //tilemap.getTexture().setAntiAliasTexParameters();


        // background layer: another image
        var background = cc.Sprite.spriteWithFile(s_back);
        // scale the image (optional)
        //background.setScale(1.5);
        // change the transform anchor point (optional)
        background.setAnchorPoint(cc.ccp(0, 0));


        // create a void node, a parent node
        var voidNode = cc.ParallaxNode.node();

        // NOW add the 3 layers to the 'void' node

        // background image is moved at a ratio of 0.4x, 0.5y
        voidNode.addChild(background, -1, cc.ccp(0.4, 0.5), cc.PointZero());

        // tiles are moved at a ratio of 1.0, 1.0y
        voidNode.addChild(tilemap, 1, cc.ccp(1.0, 1.0), cc.ccp(0, 0));

        // top image is moved at a ratio of 3.0x, 2.5y
        voidNode.addChild(cocosImage, 2, cc.ccp(3.0, 2.5), cc.ccp(0, 0));
        this.addChild(voidNode, 0, kTagNode);

    },

    registerWithTouchDispatcher:function () {
        cc.TouchDispatcher.sharedDispatcher().addTargetedDelegate(this, 0, true);
    },
    ccTouchBegan:function (touch, event) {
        return true;
    },
    ccTouchEnded:function (touch, event) {
        this._prevLocation = null;
    },
    ccTouchCancelled:function (touch, event) {

    },

    _prevLocation:null,

    ccTouchMoved:function (touch, event) {

        if (this._prevLocation == null) {
            this._prevLocation = touch.locationInView(touch.view());
            return;
        }

        var touchLocation = touch.locationInView(touch.view());
        //var prevLocation = touch.previousLocationInView(touch.view());

        //touchLocation = cc.Director.sharedDirector().convertToGL(touchLocation);
        //prevLocation = cc.PointZero()//cc.Director.sharedDirector().convertToGL(prevLocation);

        var diff = cc.ccpSub(touchLocation, this._prevLocation);

        this._prevLocation = cc.ccp(touchLocation.x, touchLocation.y);


        var node = this.getChildByTag(kTagNode);
        var currentPos = node.getPosition();
        node.setPosition(cc.ccpAdd(currentPos, diff));
    },

    title:function () {
        return "Parallax: drag screen";
    }
});

ParallaxTestScene = TestScene.extend({

    runThisTest:function () {
        sceneIdx = -1;
        MAX_LAYER = 2;
        var pLayer = nextParallaxAction();

        this.addChild(pLayer);
        cc.Director.sharedDirector().replaceScene(this);
    }
});
