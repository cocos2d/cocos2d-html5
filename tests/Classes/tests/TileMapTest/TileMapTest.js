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

var TileMapTests = [
    //"TileMapTest", //not support tga format
     //"TileMapEditTest", //not support tga format
    "TMXOrthoTest",
    "TMXOrthoTest2", //camera bug
    "TMXOrthoTest3",
    "TMXOrthoTest4",
    "TMXReadWriteTest",
    "TMXHexTest",
    "TMXIsoTest",
    "TMXIsoTest1",
    "TMXIsoTest2",
    "TMXUncompressedTest",
    "TMXTilesetTest",
    "TMXOrthoObjectsTest",
    "TMXIsoObjectsTest",
    "TMXResizeTest",
    "TMXIsoZorder",
    "TMXOrthoZorder",
    //"TMXIsoVertexZ", //VertexZ bug
    //"TMXOrthoVertexZ", //VertexZ bug
    "TMXIsoMoveLayer",
    "TMXOrthoMoveLayer",
    "TMXBug987",
    "TMXBug787"
    //"TMXGIDObjectsTest", //zlib bug
];
var s_nTileMapIdx = -1;
function nextTileMapAction() {
    ++s_nTileMapIdx;
    s_nTileMapIdx = s_nTileMapIdx % TileMapTests.length;
    return new window[TileMapTests[s_nTileMapIdx]];
}
function backTileMapAction() {
    --s_nTileMapIdx;
    if (s_nTileMapIdx < 0) {
        s_nTileMapIdx += TileMapTests.length;
    }
    return new window[TileMapTests[s_nTileMapIdx]];
}
function restartTileMapAction() {
    return new window[TileMapTests[s_nTileMapIdx]];
}

// the class inherit from TestScene
// every .Scene each test used must inherit from TestScene,
// make sure the test have the menu item for back to main menu
var TileMapTestScene = TestScene.extend({
    runThisTest:function () {
        s_nTileMapIdx = -1;
        this.addChild(nextTileMapAction());
        cc.Director.sharedDirector().replaceScene(this);
    }
});

//------------------------------------------------------------------
//
// TileDemo
//
//------------------------------------------------------------------
var TileDemo = cc.Layer.extend({
    ctor:function () {
        this.setIsTouchEnabled(true);
    },
    title:function () {
        return "No title";
    },
    subtitle:function () {
        return "drag the screen";
    },
    onEnter:function () {

        //this.m_label.setString(this.title().toString());
        //this.m_subtitle.setString(this.subtitle().toString());

        this._super();
        var s = cc.Director.sharedDirector().getWinSize();
        // add title and subtitle
        var pTitle = this.title();
        var label = cc.LabelTTF.labelWithString(pTitle, "Arial", 28);
        this.addChild(label, 1);
        label.setPosition(cc.PointMake(s.width / 2, s.height - 50));

        var strSubtitle = this.subtitle();
        if (strSubtitle) {
            var l = cc.LabelTTF.labelWithString(strSubtitle, "Thonburi", 16);
            this.addChild(l, 1);
            l.setPosition(cc.PointMake(s.width / 2, s.height - 80));
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
    },

    restartCallback:function (pSender) {
        var s = new TileMapTestScene();
        s.addChild(restartTileMapAction());

        cc.Director.sharedDirector().replaceScene(s);
    },
    nextCallback:function (pSender) {
        var s = new TileMapTestScene();
        s.addChild(nextTileMapAction());
        cc.Director.sharedDirector().replaceScene(s);
    },
    backCallback:function (pSender) {
        var s = new TileMapTestScene();
        s.addChild(backTileMapAction());
        cc.Director.sharedDirector().replaceScene(s);
    },

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
    prevLocation:null,
    ccTouchMoved:function (touch, event) {
        var touchLocation = touch.locationInView(touch.view());

        if (!this.prevLocation) {
            this.prevLocation = cc.ccp(touchLocation.x, touchLocation.y);
            return;
        }
        var node = this.getChildByTag(kTagTileMap);
        var diff = cc.ccpSub(touchLocation, this.prevLocation);
        var currentPos = node.getPosition();

        //diff = cc.ccp(diff.x * node.getScaleX(),diff.y * node.getScaleY());
        var curPos = cc.ccpAdd(currentPos, diff);
        node.setPosition(curPos);
        this.prevLocation = cc.ccp(touchLocation.x, touchLocation.y);
    }
});

var TileMapTest = TileDemo.extend({
    ctor:function () {
        this._super();
        var map = cc.TileMapAtlas.tileMapAtlasWithTileFile(s_TilesPng, s_LevelMapTga, 16, 16);
        map.getTexture().setAntiAliasTexParameters();

        var s = map.getContentSize();

        // If you are not going to use the Map, you can free it now
        // NEW since v0.7
        map.releaseMap();

        this.addChild(map, 0, kTagTileMap);

        map.setAnchorPoint(cc.ccp(0, 0.5));

        var scale = cc.ScaleBy.actionWithDuration(4, 0.8);
        var scaleBack = scale.reverse();

        var seq = cc.Sequence.actions(scale, scaleBack, null);

        map.runAction(cc.RepeatForever.actionWithAction(seq));
    },
    title:function () {
        return "TileMapAtlas";
    }
});

var TileMapEditTest = TileDemo.extend({
    ctor:function () {
        this._super();
        var map = cc.TileMapAtlas.tileMapAtlasWithTileFile(s_TilesPng, s_LevelMapTga, 16, 16);
        // Create an Aliased Atlas
        map.getTexture().setAliasTexParameters();

        var s = map.getContentSize();

        // If you are not going to use the Map, you can free it now
        // [tilemap releaseMap);
        // And if you are going to use, it you can access the data with:

        this.schedule(this.updateMap, 0.2);//:@selector(updateMap:) interval:0.2f);

        this.addChild(map, 0, kTagTileMap);

        map.setAnchorPoint(cc.ccp(0, 0));
        map.setPosition(cc.ccp(-20, -200));

    },
    title:function () {
        return "Editable TileMapAtlas";
    },
    updateMap:function (dt) {
        // IMPORTANT
        //   The only limitation is that you cannot change an empty, or assign an empty tile to a tile
        //   The value 0 not rendered so don't assign or change a tile with value 0

        var tilemap = this.getChildByTag(kTagTileMap);

        // NEW since v0.7
        var c = tilemap.tileAt(cc.ccg(13, 21));
        c.r++;
        c.r %= 50;
        if (c.r == 0)
            c.r = 1;

        // NEW since v0.7
        tilemap.setTile(c, cc.ccg(13, 21));
    }
});

//------------------------------------------------------------------
//
// TMXOrthoTest
//
//------------------------------------------------------------------
var TMXOrthoTest = TileDemo.extend({
    ctor:function () {
        this._super();
        var map = cc.TMXTiledMap.tiledMapWithTMXFile("Resources/TileMaps/orthogonal-test1.tmx");
        this.addChild(map, 0, kTagTileMap);

        var pChildrenArray = map.getChildren();
        for (var i = 0; i < pChildrenArray.length; i++) {
            var child = pChildrenArray[i];
            if (!child)
                break;
            //child.getTexture().setAntiAliasTexParameters();
        }
        map.runAction(cc.ScaleBy.actionWithDuration(2, 0.5));
    },
    title:function () {
        return "TMX Ortho test2";
    }
});

//------------------------------------------------------------------
//
// TMXOrthoTest2
//
//------------------------------------------------------------------
var TMXOrthoTest2 = TileDemo.extend({
    ctor:function () {
        this._super();
        //
        // Test orthogonal with 3d camera and anti-alias textures
        //
        // it should not flicker. No artifacts should appear
        //
        var map = cc.TMXTiledMap.tiledMapWithTMXFile("Resources/TileMaps/orthogonal-test2.tmx");
        this.addChild(map, 0, kTagTileMap);

        var s = map.getContentSize();
        var pChildrenArray = map.getChildren();
        var child = null;
        for (var i = 0, len = pChildrenArray.length; i < len; i++) {
            child = pChildrenArray[i];
            if (!child) break;

            //child.getTexture().setAntiAliasTexParameters();
        }

        var x, y, z;
        map.getCamera().getEyeXYZ(x, y, z);
        map.getCamera().setEyeXYZ(x - 200, y, z + 300);
    },
    title:function () {
        return "TMX Orthogonal test";
    },
    onEnter:function () {
        this._super();
        cc.Director.sharedDirector().setProjection(cc.DirectorProjection3D);
    },
    onExit:function () {
        this._super();
        cc.Director.sharedDirector().setProjection(cc.DirectorProjection2D);
    }
});


//------------------------------------------------------------------
//
// TMXOrthoTest3
//
//------------------------------------------------------------------
var TMXOrthoTest3 = TileDemo.extend({
    ctor:function () {
        this._super();
        var map = cc.TMXTiledMap.tiledMapWithTMXFile("Resources/TileMaps/orthogonal-test3.tmx");
        this.addChild(map, 0, kTagTileMap);

        var s = map.getContentSize();
        var pChildrenArray = map.getChildren();
        var child = null;
        for (var i = 0, len = pChildrenArray.length; i < len; i++) {
            child = pChildrenArray[i];

            if (!child)
                break;

            //child.getTexture().setAntiAliasTexParameters();
        }

        map.setScale(0.2);
        map.setAnchorPoint(cc.ccp(0.5, 0.5));
    },
    title:function () {
        return "TMX anchorPoint test";
    }
});

//------------------------------------------------------------------
//
// TMXOrthoTest4
//
//------------------------------------------------------------------
var TMXOrthoTest4 = TileDemo.extend({
    ctor:function () {
        this._super();
        var map = cc.TMXTiledMap.tiledMapWithTMXFile("Resources/TileMaps/orthogonal-test4.tmx");
        this.addChild(map, 0, kTagTileMap);

        var pChildrenArray = map.getChildren();
        var child = null;
        for (var i = 0, len = pChildrenArray.length; i < len; i++) {
            child = pChildrenArray[i];
            if (!child)
                break;

            //child.getTexture().setAntiAliasTexParameters();
        }

        map.setAnchorPoint(cc.ccp(0, 0));

        var layer = map.layerNamed("Layer 0");
        var s = layer.getLayerSize();

        var sprite;
        sprite = layer.tileAt(cc.ccp(0, 0));
        sprite.setScale(2);

        sprite = layer.tileAt(cc.ccp(s.width - 1, 0));
        sprite.setScale(2);

        sprite = layer.tileAt(cc.ccp(0, s.height - 1));
        sprite.setScale(2);

        sprite = layer.tileAt(cc.ccp(s.width - 1, s.height - 1));
        sprite.setScale(2);

        this.schedule(this.removeSprite, 2);
    },
    removeSprite:function (dt) {
        this.unschedule(this.removeSprite);

        var map = this.getChildByTag(kTagTileMap);

        var layer = map.layerNamed("Layer 0");
        var s = layer.getLayerSize();

        var sprite = layer.tileAt(cc.ccp(s.width - 1, 0));
        layer.removeChild(sprite, true);
    },
    title:function () {
        return "TMX width/height test";
    }
});

//------------------------------------------------------------------
//
// TMXReadWriteTest
//
//------------------------------------------------------------------
var TMXReadWriteTest = TileDemo.extend({
    m_gid:0,
    ctor:function () {
        this._super();

        var map = cc.TMXTiledMap.tiledMapWithTMXFile("Resources/TileMaps/orthogonal-test2.tmx");
        this.addChild(map, 0, kTagTileMap);

        var s = map.getContentSize();


        var layer = map.layerNamed("Layer 0");
        //layer.getTexture().setAntiAliasTexParameters();

        map.setScale(1);

        var tile0 = layer.tileAt(cc.ccp(1, 63));
        var tile1 = layer.tileAt(cc.ccp(2, 63));
        var tile2 = layer.tileAt(cc.ccp(3, 62));//cc.ccp(1,62));
        var tile3 = layer.tileAt(cc.ccp(2, 62));

        tile0.setAnchorPoint(cc.ccp(0.5, 0.5));
        tile1.setAnchorPoint(cc.ccp(0.5, 0.5));
        tile2.setAnchorPoint(cc.ccp(0.5, 0.5));
        tile3.setAnchorPoint(cc.ccp(0.5, 0.5));

        var move = cc.MoveBy.actionWithDuration(0.5, cc.ccp(0, 160));
        var rotate = cc.RotateBy.actionWithDuration(2, 360);
        var scale = cc.ScaleBy.actionWithDuration(2, 5);
        var opacity = cc.FadeOut.actionWithDuration(2);
        var fadein = cc.FadeIn.actionWithDuration(2);
        var scaleback = cc.ScaleTo.actionWithDuration(1, 1);
        var finish = cc.CallFunc.actionWithTarget(this, this.removeSprite);

        var seq0 = cc.Sequence.actions(move, rotate, scale, opacity, fadein, scaleback, finish, null);

        tile0.runAction(seq0);
        tile1.runAction(seq0.copy());
        tile2.runAction(seq0.copy());
        tile3.runAction(seq0.copy());

        this.m_gid = layer.tileGIDAt(cc.ccp(0, 63));

        this.schedule(this.updateCol, 2.0);
        this.schedule(this.repaintWithGID, 2.0);
        this.schedule(this.removeTiles, 1.0);

        this.m_gid2 = 0;
    },
    removeSprite:function (sender) {
        var p = sender.getParent();
        if (p) {
            p.removeChild(sender, true);
        }
    },
    updateCol:function (dt) {
        var map = this.getChildByTag(kTagTileMap);
        var layer = map.getChildByTag(0);

        var s = layer.getLayerSize();

        for (var y = 0; y < s.height; y++) {
            layer.setTileGID(this.m_gid2, cc.ccp(3, y));
        }

        this.m_gid2 = (this.m_gid2 + 1) % 80;
    },
    repaintWithGID:function (dt) {
        //	[self unschedule:_cmd);

        var map = this.getChildByTag(kTagTileMap);
        var layer = map.getChildByTag(0);

        var s = layer.getLayerSize();
        for (var x = 0; x < s.width; x++) {
            var y = s.height - 1;
            var tmpgid = layer.tileGIDAt(cc.ccp(x, y));
            layer.setTileGID(tmpgid + 1, cc.ccp(x, y));
        }
    },
    removeTiles:function (dt) {
        this.unschedule(this.removeTiles);

        var map = this.getChildByTag(kTagTileMap);

        var layer = map.getChildByTag(0);
        var s = layer.getLayerSize();

        for (var y = 0; y < s.height; y++) {
            layer.removeTileAt(cc.ccp(5.0, y));
        }
    },
    title:function () {
        return "TMX Read/Write test";
    }
});

//------------------------------------------------------------------
//
// TMXHexTest
//
//------------------------------------------------------------------
var TMXHexTest = TileDemo.extend({
    ctor:function () {
        this._super();
        var color = cc.LayerColor.layerWithColor(cc.ccc4(64, 64, 64, 255));
        this.addChild(color, -1);

        var map = cc.TMXTiledMap.tiledMapWithTMXFile("Resources/TileMaps/hexa-test.tmx");
        this.addChild(map, 0, kTagTileMap);
    },
    title:function () {
        return "TMX Hex test";
    }
});

//------------------------------------------------------------------
//
// TMXIsoTest
//
//------------------------------------------------------------------
var TMXIsoTest = TileDemo.extend({
    ctor:function () {
        this._super();
        var color = cc.LayerColor.layerWithColor(cc.ccc4(64, 64, 64, 255));
        this.addChild(color, -1);

        var map = cc.TMXTiledMap.tiledMapWithTMXFile("Resources/TileMaps/iso-test.tmx");
        this.addChild(map, 0, kTagTileMap);

        // move map to the center of the screen
        var ms = map.getMapSize();
        var ts = map.getTileSize();
        map.runAction(cc.MoveTo.actionWithDuration(1.0, cc.ccp(-ms.width * ts.width / 2, -ms.height * ts.height / 2)));
    },
    title:function () {
        return "TMX Isometric test 0";
    }
});

//------------------------------------------------------------------
//
// TMXIsoTest1
//
//------------------------------------------------------------------
var TMXIsoTest1 = TileDemo.extend({
    ctor:function () {
        this._super();
        var color = cc.LayerColor.layerWithColor(cc.ccc4(64, 64, 64, 255));
        this.addChild(color, -1);

        var map = cc.TMXTiledMap.tiledMapWithTMXFile("Resources/TileMaps/iso-test1.tmx");
        this.addChild(map, 0, kTagTileMap);

        var s = map.getContentSize();

        map.setAnchorPoint(cc.ccp(0.5, 0.5));
    },
    title:function () {
        return "TMX Isometric test + anchorPoint";
    }
});

//------------------------------------------------------------------
//
// TMXIsoTest2
//
//------------------------------------------------------------------
var TMXIsoTest2 = TileDemo.extend({
    ctor:function () {
        this._super();
        var color = cc.LayerColor.layerWithColor(cc.ccc4(64, 64, 64, 255));
        this.addChild(color, -1);

        var map = cc.TMXTiledMap.tiledMapWithTMXFile("Resources/TileMaps/iso-test2.tmx");
        this.addChild(map, 0, kTagTileMap);

        var s = map.getContentSize();

        // move map to the center of the screen
        var ms = map.getMapSize();
        var ts = map.getTileSize();
        map.runAction(cc.MoveTo.actionWithDuration(1.0, cc.ccp(-ms.width * ts.width / 2, -ms.height * ts.height / 2)));
    },
    title:function () {
        return "TMX Isometric test 2";
    }
});

//------------------------------------------------------------------
//
// TMXUncompressedTest
//
//------------------------------------------------------------------
var TMXUncompressedTest = TileDemo.extend({
    ctor:function () {
        this._super();
        var color = cc.LayerColor.layerWithColor(cc.ccc4(64, 64, 64, 255));
        this.addChild(color, -1);

        var map = cc.TMXTiledMap.tiledMapWithTMXFile("Resources/TileMaps/iso-test2-uncompressed.tmx");
        this.addChild(map, 0, kTagTileMap);

        var s = map.getContentSize();

        // move map to the center of the screen
        var ms = map.getMapSize();
        var ts = map.getTileSize();
        map.runAction(cc.MoveTo.actionWithDuration(1.0, cc.ccp(-ms.width * ts.width / 2, -ms.height * ts.height / 2)));

        // testing release map
        var pChildrenArray = map.getChildren();
        var layer = null;
        for (var i = 0, len = pChildrenArray.length; i < len; i++) {
            layer = pChildrenArray[i];
            if (!layer)
                break;

            layer.releaseMap();
        }
    },
    title:function () {
        return "TMX Uncompressed test";
    }
});

//------------------------------------------------------------------
//
// TMXTilesetTest
//
//------------------------------------------------------------------
var TMXTilesetTest = TileDemo.extend({
    ctor:function () {
        this._super();
        var map = cc.TMXTiledMap.tiledMapWithTMXFile("Resources/TileMaps/orthogonal-test5.tmx");
        this.addChild(map, 0, kTagTileMap);
        var s = map.getContentSize();

        /*var layer;
         layer = map.layerNamed("Layer 0");
         layer.getTexture().setAntiAliasTexParameters();

         layer = map.layerNamed("Layer 1");
         layer.getTexture().setAntiAliasTexParameters();

         layer = map.layerNamed("Layer 2");
         layer.getTexture().setAntiAliasTexParameters();*/
    },
    title:function () {
        return "TMX Tileset test";
    }
});

//------------------------------------------------------------------
//
// TMXOrthoObjectsTest
//
//------------------------------------------------------------------
var TMXOrthoObjectsTest = TileDemo.extend({
    ctor:function () {
        this._super();
        var map = cc.TMXTiledMap.tiledMapWithTMXFile("Resources/TileMaps/ortho-objects.tmx");
        this.addChild(map, -1, kTagTileMap);
        var s = map.getContentSize();

        var group = map.objectGroupNamed("Object Group 1");
        var objects = group.getObjects();

        for (var i = 0 ; i < objects.length; i++) {
            var dict = objects[i];
            if (!dict)
                break;
        }
    },
    draw:function () {
        var map = this.getChildByTag(kTagTileMap);
        var group = map.objectGroupNamed("Object Group 1");
        var objects = group.getObjects();
        for (var i = 0; i < objects.length; i++) {
            var dict = objects[i];
            if (!dict)
                break;

            var x = parseInt(dict["x"]);
            var y = parseInt(dict["y"]);
            var width = parseInt(dict["width"]);
            var height = parseInt(dict["height"]);

            cc.renderContext.lineWidth = 3;
            cc.renderContext.strokeStyle = "#ffffff";

            cc.drawingUtil.drawLine(cc.ccp(x, y), cc.ccp((x + width), y));
            cc.drawingUtil.drawLine(cc.ccp((x + width), y), cc.ccp((x + width), (y + height)));
            cc.drawingUtil.drawLine(cc.ccp((x + width), (y + height)), cc.ccp(x, (y + height)));
            cc.drawingUtil.drawLine(cc.ccp(x, (y + height)), cc.ccp(x, y));

            cc.renderContext.lineWidth = 1;
        }
    },
    title:function () {
        return "TMX Ortho object test";
    },
    subtitle:function () {
        return "You should see a white box around the 3 platforms";
    }
});

//------------------------------------------------------------------
//
// TMXIsoObjectsTest
//
//------------------------------------------------------------------
var TMXIsoObjectsTest = TileDemo.extend({
    ctor:function () {
        this._super();
        var map = cc.TMXTiledMap.tiledMapWithTMXFile("Resources/TileMaps/iso-test-objectgroup.tmx");
        this.addChild(map, -1, kTagTileMap);

        var s = map.getContentSize();

        var group = map.objectGroupNamed("Object Group 1");
        var objects = group.getObjects();

        var dict;
        for (var i = 0, len = objects.length; i < len; i++) {
            dict = objects[i];
            if (!dict)
                break;
        }
    },
    title:function () {
        return "TMX Iso object test";
    },
    draw:function () {
        var map = this.getChildByTag(kTagTileMap);
        var group = map.objectGroupNamed("Object Group 1");
        var objects = group.getObjects();
        var dict;
        for (var i = 0, len = objects.length; i < len; i++) {
            dict = objects[i];
            if (!dict)
                break;

            var x = parseInt(dict["x"]);
            var y = parseInt(dict["y"]);
            var width = parseInt(dict["width"]);
            var height = parseInt(dict["height"]);

            cc.renderContext.lineWidth = 3;
            cc.renderContext.strokeStyle = "#ffffff";

            cc.drawingUtil.drawLine(cc.ccp(x, y), cc.ccp(x + width, y));
            cc.drawingUtil.drawLine(cc.ccp(x + width, y), cc.ccp(x + width, y + height));
            cc.drawingUtil.drawLine(cc.ccp(x + width, y + height), cc.ccp(x, y + height));
            cc.drawingUtil.drawLine(cc.ccp(x, y + height), cc.ccp(x, y));

            cc.renderContext.lineWidth = 1;
        }
    },
    subtitle:function () {
        return "You need to parse them manually. See bug #810";
    }
});

//------------------------------------------------------------------
//
// TMXResizeTest
//
//------------------------------------------------------------------
var TMXResizeTest = TileDemo.extend({
    ctor:function () {
        this._super();
        var map = cc.TMXTiledMap.tiledMapWithTMXFile("Resources/TileMaps/orthogonal-test5.tmx");
        this.addChild(map, 0, kTagTileMap);

        var s = map.getContentSize();

        var layer;
        layer = map.layerNamed("Layer 0");

        var ls = layer.getLayerSize();
        for (var y = 0; y < ls.height; y++) {
            for (var x = 0; x < ls.width; x++) {
                layer.setTileGID(1, cc.ccp(x, y));
            }
        }
    },
    title:function () {
        return "TMX resize test";
    },
    subtitle:function () {
        return "Should not crash. Testing issue #740";
    }
});

//------------------------------------------------------------------
//
// TMXIsoZorder
//
//------------------------------------------------------------------
var TMXIsoZorder = TileDemo.extend({
    m_tamara:null,
    ctor:function () {
        this._super();
        var map = cc.TMXTiledMap.tiledMapWithTMXFile("Resources/TileMaps/iso-test-zorder.tmx");
        this.addChild(map, 0, kTagTileMap);

        var s = map.getContentSize();
        map.setPosition(cc.ccp(-s.width / 2, 0));

        this.m_tamara = cc.Sprite.spriteWithFile(s_pPathSister1);
        map.addChild(this.m_tamara, map.getChildren().length);
        var mapWidth = map.getMapSize().width * map.getTileSize().width;
        this.m_tamara.setPositionInPixels(cc.ccp(mapWidth / 2, 0));
        this.m_tamara.setAnchorPoint(cc.ccp(0.5, 0));


        var move = cc.MoveBy.actionWithDuration(10, cc.ccpMult(cc.ccp(300, 250), 1 / cc.CONTENT_SCALE_FACTOR()));
        var back = move.reverse();
        var seq = cc.Sequence.actions(move, back, null);
        this.m_tamara.runAction(cc.RepeatForever.actionWithAction(seq));

        this.schedule(this.repositionSprite);
    },
    title:function () {
        return "TMX Iso Zorder";
    },
    subtitle:function () {
        return "Sprite should hide behind the trees";
    },
    onExit:function () {
        this.unschedule(this.repositionSprite);
        this._super();
    },
    repositionSprite:function (dt) {
        var p = this.m_tamara.getPositionInPixels();
        var map = this.getChildByTag(kTagTileMap);

        // there are only 4 layers. (grass and 3 trees layers)
        // if tamara < 48, z=4
        // if tamara < 96, z=3
        // if tamara < 144,z=2

        var newZ = 4 - (p.y / 48);
        newZ = Math.max(newZ, 0);

        map.reorderChild(this.m_tamara, newZ);
    }
});

//------------------------------------------------------------------
//
// TMXOrthoZorder
//
//------------------------------------------------------------------
var TMXOrthoZorder = TileDemo.extend({
    m_tamara:null,
    ctor:function () {
        this._super();
        var map = cc.TMXTiledMap.tiledMapWithTMXFile("Resources/TileMaps/orthogonal-test-zorder.tmx");
        this.addChild(map, 0, kTagTileMap);

        var s = map.getContentSize();

        this.m_tamara = cc.Sprite.spriteWithFile(s_pPathSister1);
        map.addChild(this.m_tamara, map.getChildren().length, kTagTileMap);
        this.m_tamara.setAnchorPoint(cc.ccp(0.5, 0));

        var move = cc.MoveBy.actionWithDuration(10, cc.ccpMult(cc.ccp(400, 450), 1 / cc.CONTENT_SCALE_FACTOR()));
        var back = move.reverse();
        var seq = cc.Sequence.actions(move, back, null);
        this.m_tamara.runAction(cc.RepeatForever.actionWithAction(seq));

        this.schedule(this.repositionSprite);
    },
    title:function () {
        return "TMX Ortho Zorder";
    },
    subtitle:function () {
        return "Sprite should hide behind the trees";
    },
    repositionSprite:function (dt) {
        var p = this.m_tamara.getPositionInPixels();
        var map = this.getChildByTag(kTagTileMap);

        // there are only 4 layers. (grass and 3 trees layers)
        // if tamara < 81, z=4
        // if tamara < 162, z=3
        // if tamara < 243,z=2

        // -10: customization for this particular sample
        var newZ = 4 - ((p.y - 10) / 81);
        newZ = Math.max(newZ, 0);

        map.reorderChild(this.m_tamara, newZ);
    }
});

//------------------------------------------------------------------
//
// TMXIsoVertexZ
//
//------------------------------------------------------------------
var TMXIsoVertexZ = TileDemo.extend({
    m_tamara:null,
    m_tamara1:null,
    ctor:function () {
        this._super();
        var map = cc.TMXTiledMap.tiledMapWithTMXFile("Resources/TileMaps/iso-test-vertexz.tmx");
        this.addChild(map, 0, kTagTileMap);

        var s = map.getContentSize();
        map.setPosition(cc.ccp(-s.width / 2, 0));

        // because I'm lazy, I'm reusing a tile as an sprite, but since this method uses vertexZ, you
        // can use any cc.Sprite and it will work OK.
        var layer = map.layerNamed("Trees");
        this.m_tamara = layer.tileAt(cc.ccp(29, 29));

        var move = cc.MoveBy.actionWithDuration(10, cc.ccpMult(cc.ccp(300, 250), 1 / cc.CONTENT_SCALE_FACTOR()));
        var back = move.reverse();
        var seq = cc.Sequence.actions(move, back, null);
        this.m_tamara.runAction(cc.RepeatForever.actionWithAction(seq));

        this.schedule(this.repositionSprite);
    },
    title:function () {
        return "TMX Iso VertexZ";
    },
    subtitle:function () {
        return "Sprite should hide behind the trees";
    },
    onEnter:function () {
        this._super();
        // TIP: 2d projection should be used
        cc.Director.sharedDirector().setProjection(cc.kCCDirectorProjection2D);
    },
    onExit:function () {
// At exit use any other projection.
        //	CCDirector.sharedDirector().setProjection:kCCDirectorProjection3D);
        this._super();
    },
    repositionSprite:function (dt) {
        // tile height is 64x32
        // map size: 30x30
        var p = this.m_tamara.getPositionInPixels();
        this.m_tamara.setVertexZ(-( (p.y + 32) / 16));
    }
});

//------------------------------------------------------------------
//
// TMXOrthoVertexZ
//
//------------------------------------------------------------------
var TMXOrthoVertexZ = TileDemo.extend({
    m_tamara:null,
    ctor:function () {
        this._super();
        var map = cc.TMXTiledMap.tiledMapWithTMXFile("Resources/TileMaps/orthogonal-test-vertexz.tmx");
        this.addChild(map, 0, kTagTileMap);

        var s = map.getContentSize();

        // because I'm lazy, I'm reusing a tile as an sprite, but since this method uses vertexZ, you
        // can use any cc.Sprite and it will work OK.
        var layer = map.layerNamed("trees");
        this.m_tamara = layer.tileAt(cc.ccp(0, 11));
        cc.LOG("vertexZ: " + this.m_tamara.getVertexZ());

        var move = cc.MoveBy.actionWithDuration(10, cc.ccpMult(cc.ccp(400, 450), 1 / cc.CONTENT_SCALE_FACTOR()));
        var back = move.reverse();
        var seq = cc.Sequence.actions(move, back, null);
        this.m_tamara.runAction(cc.RepeatForever.actionWithAction(seq));

        this.schedule(this.repositionSprite);
    },
    title:function () {
        return "TMX Ortho vertexZ";
    },
    subtitle:function () {
        return "Sprite should hide behind the trees";
    },
    onEnter:function () {
        this._super();

        // TIP: 2d projection should be used
        cc.Director.sharedDirector().setProjection(cc.kCCDirectorProjection2D);
    },
    onExit:function () {
        // At exit use any other projection.
        //	CCDirector.sharedDirector().setProjection:kCCDirectorProjection3D);
        this._super();
    },
    repositionSprite:function (dt) {
        // tile height is 64x32
        // map size: 30x30
        var p = this.m_tamara.getPositionInPixels();
        this.m_tamara.setVertexZ(-( (p.y + 32) / 16));
    }
});

//------------------------------------------------------------------
//
// TMXIsoMoveLayer
//
//------------------------------------------------------------------
var TMXIsoMoveLayer = TileDemo.extend({
    ctor:function () {
        this._super();
        var map = cc.TMXTiledMap.tiledMapWithTMXFile("Resources/TileMaps/iso-test-movelayer.tmx");
        this.addChild(map, 0, kTagTileMap);
        map.setPosition(cc.ccp(-700, -50));

        var s = map.getContentSize();
    },
    title:function () {
        return "TMX Iso Move Layer";
    },
    subtitle:function () {
        return "Trees should be horizontally aligned";
    }
});

//------------------------------------------------------------------
//
// TMXOrthoMoveLayer
//
//------------------------------------------------------------------
var TMXOrthoMoveLayer = TileDemo.extend({
    ctor:function () {
        this._super();
        var map = cc.TMXTiledMap.tiledMapWithTMXFile("Resources/TileMaps/orthogonal-test-movelayer.tmx");
        this.addChild(map, 0, kTagTileMap);

        var s = map.getContentSize();
    },
    title:function () {
        return "TMX Ortho Move Layer";
    },
    subtitle:function () {
        return "Trees should be horizontally aligned";
    }
});

//------------------------------------------------------------------
//
// TMXBug987
//
//------------------------------------------------------------------
var TMXBug987 = TileDemo.extend({
    ctor:function () {
        this._super();
        var map = cc.TMXTiledMap.tiledMapWithTMXFile("Resources/TileMaps/orthogonal-test6.tmx");
        this.addChild(map, 0, kTagTileMap);

        var s1 = map.getContentSize();
        cc.LOG("ContentSize:" + s1.width + "," + s1.height);

        var childs = map.getChildren();
        var pNode = null;
        for (var i = 0, len = childs.length; i < len; i++) {
            pNode = childs[i];
            if (!pNode) break;
            //pNode.getTexture().setAntiAliasTexParameters();
        }

        map.setAnchorPoint(cc.ccp(0, 0));
        var layer = map.layerNamed("Tile Layer 1");
        layer.setTileGID(3, cc.ccp(2, 2));
    },
    title:function () {
        return "TMX Bug 987";
    },
    subtitle:function () {
        return "You should see an square";
    }
});

//------------------------------------------------------------------
//
// TMXBug787
//
//------------------------------------------------------------------
var TMXBug787 = TileDemo.extend({
    ctor:function () {
        this._super();
        var map = cc.TMXTiledMap.tiledMapWithTMXFile("Resources/TileMaps/iso-test-bug787.tmx");
        this.addChild(map, 0, kTagTileMap);

        map.setScale(0.25);
    },
    title:function () {
        return "TMX Bug 787";
    },
    subtitle:function () {
        return "You should see a map";
    }
});

var TMXGIDObjectsTest = TileDemo.extend({
    ctor:function () {
        this._super();
        var map = cc.TMXTiledMap.tiledMapWithTMXFile("Resources/TileMaps/test-object-layer.tmx");
        this.addChild(map, -1, kTagTileMap);

        var s = map.getContentSize();
        cc.LOG("ContentSize:" + s.width + "," + s.height);
        cc.LOG("---. Iterating over all the group objets");
    },
    title:function () {
        return "TMX GID objects";
    },
    subtitle:function () {
        return "Tiles are created from an object group";
    },
    draw:function () {
        var map = this.getChildByTag(kTagTileMap);
        var group = map.objectGroupNamed("Object Layer 1");

        var array = group.getObjects();
        var dict;
        for (var i = 0, len = array.length; i < len; i++) {
            dict = array[i];
            if (!dict)
                break;
            var key = "x";
            var x = parseInt(dict[key]);
            key = "y";
            var y = parseInt(dict[key]);
            key = "width";
            var width = parseInt(dict[key]);
            key = "height";
            var height = parseInt(dict[key]);

            cc.renderContext.lineWidth = 3;
            cc.renderContext.strokeStyle = "#ffffff";

            cc.drawingUtil.drawLine(cc.ccp(x, y), cc.ccp((x + width), y));
            cc.drawingUtil.drawLine(cc.ccp((x + width), y), cc.ccp((x + width), (y + height)));
            cc.drawingUtil.drawLine(cc.ccp((x + width), (y + height)), cc.ccp(x, (y + height)));
            cc.drawingUtil.drawLine(cc.ccp(x, (y + height)), cc.ccp(x, y));

            cc.renderContext.lineWidth = 1;
        }
    }
});