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
var TAG_LABEL = 1;
var TAG_LABEL_SPRITE_MANAGER = 1;
var TAG_ANIMATION1 = 1;
var TAG_BITMAP_ATLAS1 = 1;
var TAG_BITMAP_ATLAS2 = 2;
var TAG_BITMAP_ATLAS3 = 3;

var TAG_LABEL_SPRITE1 = 660;
var TAG_LABEL_SPRITE12 = 661;
var TAG_LABEL_SPRITE13 = 662;
var TAG_LABEL_SPRITE14 = 663;
var TAG_LABEL_SPRITE15 = 664;
var TAG_LABEL_SPRITE16 = 665;
var TAG_LABEL_SPRITE17 = 666;
var TAG_LABEL_SPRITE18 = 667;

var AtlasTests = [
    //function(){ return new Atlas1();},
    function () {
        return new LabelTTFTest();
    }, //ok
    function () {
        return new LabelTTFMultiline();
    }, //ok
    function () {
        return new LabelTTFChinese();
    }, //ok
    function () {
        return new LabelAtlasTest();
    }, //ok
    function () {
        return new LabelAtlasColorTest();
    }, //ok
    function () {
        return new Atlas3();
    },
    function () {
        return new Atlas4();
    },
    function () {
        return new Atlas5();
    },
    function () {
        return new Atlas6();
    },
    function () {
        return new AtlasBitmapColor();
    },
    function () {
        return new AtlasFastBitmap();
    },
    function () {
        return new BitmapFontMultiLine();
    },
    function () {
        return new LabelsEmpty();
    },
    function () {
        return new LabelBMFontHD();
    },
    function () {
        return new LabelAtlasHD();
    }, //ok
    function () {
        return new LabelGlyphDesigner();
    },

    function () {
        return new LabelBMFontChinese();
    }
];

var atlasIdx = -1;
function nextAtlasAction() {
    ++atlasIdx;
    atlasIdx = atlasIdx % AtlasTests.length;
    return AtlasTests[atlasIdx]();
}
function backAtlasAction() {
    --atlasIdx;
    if (atlasIdx < 0) {
        atlasIdx += AtlasTests.length;
    }
    return AtlasTests[atlasIdx]();
}
function restartAtlasAction() {
    return AtlasTests[atlasIdx]();
}

var LabelTestScene = TestScene.extend({
    runThisTest:function () {
        atlasIdx = -1;
        this.addChild(nextAtlasAction());
        cc.Director.sharedDirector().replaceScene(this);
    }
});

var AtlasDemo = cc.Layer.extend({
    title:function () {
        return "No title";
    },
    subtitle:function () {
        return "";
    },
    onEnter:function () {
        this._super();

        var s = cc.Director.sharedDirector().getWinSize();

        var label = cc.LabelTTF.create(this.title(), "Arial", 28);
        this.addChild(label, 1);
        label.setPosition(cc.ccp(s.width / 2, s.height - 50));

        var strSubtitle = this.subtitle();
        if (strSubtitle) {
            var l = cc.LabelTTF.create(strSubtitle.toString(), "Thonburi", 16);
            this.addChild(l, 1);
            l.setPosition(cc.ccp(s.width / 2, s.height - 80));
        }

        var item1 = cc.MenuItemImage.create(s_pathB1, s_pathB2, this, this.backCallback);
        var item2 = cc.MenuItemImage.create(s_pathR1, s_pathR2, this, this.restartCallback);
        var item3 = cc.MenuItemImage.create(s_pathF1, s_pathF2, this, this.nextCallback);

        var menu = cc.Menu.create(item1, item2, item3, null);

        menu.setPosition(cc.PointZero());
        item1.setPosition(cc.ccp(s.width / 2 - 100, 30));
        item2.setPosition(cc.ccp(s.width / 2, 30));
        item3.setPosition(cc.ccp(s.width / 2 + 100, 30));

        this.addChild(menu, 1);
    },
    restartCallback:function (sender) {
        var s = new LabelTestScene();
        s.addChild(restartAtlasAction());

        cc.Director.sharedDirector().replaceScene(s);

    },
    nextCallback:function (sender) {
        var s = new LabelTestScene();
        s.addChild(nextAtlasAction());
        cc.Director.sharedDirector().replaceScene(s);

    },
    backCallback:function (sender) {
        var s = new LabelTestScene();
        s.addChild(backAtlasAction());
        cc.Director.sharedDirector().replaceScene(s);

    }
});

//------------------------------------------------------------------
//
// Atlas1
//
//------------------------------------------------------------------
var Atlas1 = AtlasDemo.extend({
    textureAtlas:null,
    ctor:function () {
        this.textureAtlas = cc.TextureAtlas.create(s_atlasTest, 3);

        var s = cc.Director.sharedDirector().getWinSize();

        //
        // Notice: u,v tex coordinates are inverted
        //
        var quads = [
            new cc.V3F_C4B_T2F_Quad(
                new cc.V3F_C4B_T2F(new cc.Vertex3F(0, 0, 0), cc.ccc4(0, 0, 255, 255), new cc.Tex2F(0.0, 1.0)), // bottom left
                new cc.V3F_C4B_T2F(new cc.Vertex3F(s.width, 0, 0), cc.ccc4(0, 0, 255, 0), new cc.Tex2F(1.0, 1.0)), // bottom right
                new cc.V3F_C4B_T2F(new cc.Vertex3F(0, s.height, 0), cc.ccc4(0, 0, 255, 0), new cc.Tex2F(0.0, 0.0)), // top left
                new cc.V3F_C4B_T2F(new cc.Vertex3F(s.width, s.height, 0), cc.ccc4(0, 0, 255, 255), new cc.Tex2F(1.0, 0.0))    // top right
            ),

            new cc.V3F_C4B_T2F_Quad(
                new cc.V3F_C4B_T2F(new cc.Vertex3F(40, 40, 0), cc.ccc4(255, 255, 255, 255), new cc.Tex2F(0.0, 0.2)), // bottom left
                new cc.V3F_C4B_T2F(new cc.Vertex3F(120, 80, 0), cc.ccc4(255, 0, 0, 255), new cc.Tex2F(0.5, 0.2)), // bottom right
                new cc.V3F_C4B_T2F(new cc.Vertex3F(40, 160, 0), cc.ccc4(255, 255, 255, 255), new cc.Tex2F(0.0, 0.0)), // top left
                new cc.V3F_C4B_T2F(new cc.Vertex3F(160, 160, 0), cc.ccc4(0, 255, 0, 255), new cc.Tex2F(0.5, 0.0))            // top right
            ),

            new cc.V3F_C4B_T2F_Quad(
                new cc.V3F_C4B_T2F(new cc.Vertex3F(s.width / 2, 40, 0), cc.ccc4(255, 0, 0, 255), new cc.Tex2F(0.0, 1.0)), // bottom left
                new cc.V3F_C4B_T2F(new cc.Vertex3F(s.width, 40, 0), cc.ccc4(0, 255, 0, 255), new cc.Tex2F(1.0, 1.0)), // bottom right
                new cc.V3F_C4B_T2F(new cc.Vertex3F(s.width / 2 - 50, 200, 0), cc.ccc4(0, 0, 255, 255), new cc.Tex2F(0.0, 0.0)), // top left
                new cc.V3F_C4B_T2F(new cc.Vertex3F(s.width, 100, 0), cc.ccc4(255, 255, 0, 255), new cc.Tex2F(1.0, 0.0))        // top right
            )

        ];


        for (var i = 0; i < 3; i++) {
            this.textureAtlas.updateQuad(quads[i], i);
        }
    },
    title:function () {
        return "cc.TextureAtlas";
    },
    subtitle:function () {
        return "Manual creation of cc.TextureAtlas";
    },
    draw:function () {
        this._super();
        this.textureAtlas.drawQuads();
    }
});

//------------------------------------------------------------------
//
// LabelAtlasTest
//
//------------------------------------------------------------------
var LabelAtlasTest = AtlasDemo.extend({
    time:null,
    ctor:function () {
        this.time = 0;

        var label1 = cc.LabelAtlas.create("123 Test", "Resources/fonts/tuffy_bold_italic-charmap.plist");
        this.addChild(label1, 0, TAG_LABEL_SPRITE1);
        label1.setPosition(cc.ccp(10, 100));
        label1.setOpacity(200);

        var label2 = cc.LabelAtlas.create("0123456789", "Resources/fonts/tuffy_bold_italic-charmap.plist");
        this.addChild(label2, 0, TAG_LABEL_SPRITE12);
        label2.setPosition(cc.ccp(10, 200));
        label2.setOpacity(32);

        this.schedule(this.step);
    },
    step:function (dt) {
        this.time += dt;

        var label1 = this.getChildByTag(TAG_LABEL_SPRITE1);
        var string1 = this.time.toFixed(2) + " Test";
        label1.setString(string1);

        var label2 = this.getChildByTag(TAG_LABEL_SPRITE12);
        var string2 = parseInt(this.time).toString();
        label2.setString(string2);
    },
    title:function () {
        return "LabelAtlas";
    },
    subtitle:function () {
        return "Updating label should be fast";
    }
});

//------------------------------------------------------------------
//
// LabelAtlasColorTest
//
//------------------------------------------------------------------
var LabelAtlasColorTest = AtlasDemo.extend({
    time:null,
    ctor:function () {
        var label1 = cc.LabelAtlas.create("123 Test", "Resources/fonts/tuffy_bold_italic-charmap.png", 48, 64, ' ');
        this.addChild(label1, 0, TAG_LABEL_SPRITE1);
        label1.setPosition(cc.ccp(10, 100));
        label1.setOpacity(200);

        var label2 = cc.LabelAtlas.create("0123456789", "Resources/fonts/tuffy_bold_italic-charmap.png", 48, 64, ' ');
        this.addChild(label2, 0, TAG_LABEL_SPRITE12);
        label2.setPosition(cc.ccp(10, 200));
        label2.setColor(cc.RED());

        var fade = cc.FadeOut.create(1.0);
        var fade_in = fade.reverse();
        var seq = cc.Sequence.create(fade, fade_in, null);
        var repeat = cc.RepeatForever.create(seq);
        label2.runAction(repeat);

        this.time = 0;

        this.schedule(this.step);
    },
    step:function (dt) {
        this.time += dt;
        var string1 = this.time.toFixed(2) + " Test";
        var label1 = this.getChildByTag(TAG_LABEL_SPRITE1);
        label1.setString(string1);

        var label2 = this.getChildByTag(TAG_LABEL_SPRITE12);
        var string2 = parseInt(this.time).toString();
        label2.setString(string2);
    },
    title:function () {
        return "cc.LabelAtlas";
    },
    subtitle:function () {
        return "Opacity + Color should work at the same time";
    }
});

//------------------------------------------------------------------
//
// Atlas3
//
// Use any of these editors to generate BMFonts:
//
//------------------------------------------------------------------
var Atlas3 = AtlasDemo.extend({
    time:0,
    ctor:function () {
        var col = cc.LayerColor.create(cc.ccc4(128, 128, 128, 255));
        this.addChild(col, -10);

        var label1 = cc.LabelBMFont.create("Test", "Resources/fonts/bitmapFontTest2.fnt");

        // testing anchors
        label1.setAnchorPoint(cc.ccp(0, 0));
        this.addChild(label1, 0, TAG_BITMAP_ATLAS1);
        var fade = cc.FadeOut.create(1.0);
        var fade_in = fade.reverse();
        var seq = cc.Sequence.create(fade, fade_in, null);
        var repeat = cc.RepeatForever.create(seq);
        label1.runAction(repeat);

        // VERY IMPORTANT
        // color and opacity work OK because bitmapFontAltas2 loads a BMP image (not a PNG image)
        // If you want to use both opacity and color, it is recommended to use NON premultiplied images like BMP images
        // Of course, you can also tell XCode not to compress PNG images, but I think it doesn't work as expected
        var label2 = cc.LabelBMFont.create("Test", "Resources/fonts/bitmapFontTest2.fnt");
        // testing anchors
        label2.setAnchorPoint(cc.ccp(0.5, 0.5));
        label2.setColor(cc.RED());
        this.addChild(label2, 0, TAG_BITMAP_ATLAS2);
        label2.runAction(repeat.copy());

        var label3 = cc.LabelBMFont.create("Test", "Resources/fonts/bitmapFontTest2.fnt");
        // testing anchors
        label3.setAnchorPoint(cc.ccp(1, 1));
        this.addChild(label3, 0, TAG_BITMAP_ATLAS3);

        var s = cc.Director.sharedDirector().getWinSize();
        label1.setPosition(cc.ccp(0, 0));
        label2.setPosition(cc.ccp(s.width / 2, s.height / 2));
        label3.setPosition(cc.ccp(s.width, s.height));

        this.schedule(this.step);
    },
    step:function (dt) {
        this.time += dt;
        //var string;
        var string = this.time.toFixed(2) + "Test j";

        var label1 = this.getChildByTag(TAG_BITMAP_ATLAS1);
        label1.setString(string);

        var label2 = this.getChildByTag(TAG_BITMAP_ATLAS2);
        label2.setString(string);

        var label3 = this.getChildByTag(TAG_BITMAP_ATLAS3);
        label3.setString(string);
    },

    title:function () {
        return "cc.LabelBMFont";
    },
    subtitle:function () {
        return "Testing alignment. Testing opacity + tint";
    }
});

//------------------------------------------------------------------
//
// Atlas4
//
// Use any of these editors to generate BMFonts:
//
//------------------------------------------------------------------
var Atlas4 = AtlasDemo.extend({
    time:null,
    ctor:function () {
        this.time = 0;

        // Upper Label
        var label = cc.LabelBMFont.create("Bitmap Font Atlas", "Resources/fonts/bitmapFontTest.fnt");
        this.addChild(label);

        var s = cc.Director.sharedDirector().getWinSize();

        label.setPosition(cc.ccp(s.width / 2, s.height / 2));
        label.setAnchorPoint(cc.ccp(0.5, 0.5));

        var BChar = label.getChildByTag(0);
        var FChar = label.getChildByTag(7);
        var AChar = label.getChildByTag(12);

        var rotate = cc.RotateBy.create(2, 360);
        var rot_4ever = cc.RepeatForever.create(rotate);

        var scale = cc.ScaleBy.create(2, 1.5);
        var scale_back = scale.reverse();
        var scale_seq = cc.Sequence.create(scale, scale_back, null);
        var scale_4ever = cc.RepeatForever.create(scale_seq);

        var jump = cc.JumpBy.create(0.5, cc.PointZero(), 60, 1);
        var jump_4ever = cc.RepeatForever.create(jump);

        var fade_out = cc.FadeOut.create(1);
        var fade_in = cc.FadeIn.create(1);
        var seq = cc.Sequence.create(fade_out, fade_in, null);
        var fade_4ever = cc.RepeatForever.create(seq);

        BChar.runAction(rot_4ever);
        BChar.runAction(scale_4ever);
        FChar.runAction(jump_4ever);
        AChar.runAction(fade_4ever);

        // Bottom Label
        var label2 = cc.LabelBMFont.create("00.0", "Resources/fonts/bitmapFontTest.fnt");
        this.addChild(label2, 0, TAG_BITMAP_ATLAS2);
        label2.setPosition(cc.ccp(s.width / 2.0, 80));

        var lastChar = label2.getChildByTag(3);
        lastChar.runAction(rot_4ever.copy());

        this.schedule(this.step, 0.1);
    },
    step:function (dt) {
        this.time += dt;
        var string = this.time.toFixed(1);
        string = (string < 10) ? "0" + string : string;
        var label1 = this.getChildByTag(TAG_BITMAP_ATLAS2);
        label1.setString(string);
    },
    draw:function () {
        var s = cc.Director.sharedDirector().getWinSize();
        var c = cc.RED();
        cc.renderContext.strokeStyle = "rgba(" + c.r + "," + c.g + "," + c.b + ",1)";
        cc.drawingUtil.drawLine(cc.ccp(0, s.height / 2), cc.ccp(s.width, s.height / 2));
        cc.drawingUtil.drawLine(cc.ccp(s.width / 2, 0), cc.ccp(s.width / 2, s.height));
    },
    title:function () {
        return "cc.LabelBMFont";
    },
    subtitle:function () {
        return "Using fonts as cc.Sprite objects. Some characters should rotate.";
    }
});

//------------------------------------------------------------------
//
// Atlas5
//
// Use any of these editors to generate BMFonts:
//
//
//------------------------------------------------------------------
var Atlas5 = AtlasDemo.extend({
    ctor:function () {
        var label = cc.LabelBMFont.create("abcdefg", "Resources/fonts/bitmapFontTest4.fnt");
        this.addChild(label);

        var s = cc.Director.sharedDirector().getWinSize();

        label.setPosition(cc.ccp(s.width / 2, s.height / 2));
        label.setAnchorPoint(cc.ccp(0.5, 0.5));
    },
    title:function () {
        return "cc.LabelBMFont";
    },
    subtitle:function () {
        return "Testing padding";
    }
});

//------------------------------------------------------------------
//
// Atlas6
//
// Use any of these editors to generate BMFonts:
//
//------------------------------------------------------------------
var Atlas6 = AtlasDemo.extend({
    ctor:function () {
        var s = cc.Director.sharedDirector().getWinSize();

        var label = null;
        label = cc.LabelBMFont.create("FaFeFiFoFu", "Resources/fonts/bitmapFontTest5.fnt");
        this.addChild(label);
        label.setPosition(cc.ccp(s.width / 2, s.height / 2 + 50));
        label.setAnchorPoint(cc.ccp(0.5, 0.5));

        label = cc.LabelBMFont.create("fafefifofu", "Resources/fonts/bitmapFontTest5.fnt");
        this.addChild(label);
        label.setPosition(cc.ccp(s.width / 2, s.height / 2));
        label.setAnchorPoint(cc.ccp(0.5, 0.5));

        label = cc.LabelBMFont.create("aeiou", "Resources/fonts/bitmapFontTest5.fnt");
        this.addChild(label);
        label.setPosition(cc.ccp(s.width / 2, s.height / 2 - 50));
        label.setAnchorPoint(cc.ccp(0.5, 0.5));
    },
    title:function () {
        return "cc.LabelBMFont";
    },
    subtitle:function () {
        return "Rendering should be OK. Testing offset";
    }
});

//------------------------------------------------------------------
//
// AtlasBitmapColor
//
// Use any of these editors to generate BMFonts:
//
//------------------------------------------------------------------
var AtlasBitmapColor = AtlasDemo.extend({
    ctor:function () {
        var s = cc.Director.sharedDirector().getWinSize();

        var label = null;
        label = cc.LabelBMFont.create("Blue", "Resources/fonts/bitmapFontTest5.fnt");
        label.setColor(cc.BLUE());
        this.addChild(label);
        label.setPosition(cc.ccp(s.width / 2, s.height / 4));
        label.setAnchorPoint(cc.ccp(0.5, 0.5));

        label = cc.LabelBMFont.create("Red", "Resources/fonts/bitmapFontTest5.fnt");
        this.addChild(label);
        label.setPosition(cc.ccp(s.width / 2, 2 * s.height / 4));
        label.setAnchorPoint(cc.ccp(0.5, 0.5));
        label.setColor(cc.RED());

        label = cc.LabelBMFont.create("G", "Resources/fonts/bitmapFontTest5.fnt");
        this.addChild(label);
        label.setPosition(cc.ccp(s.width / 2, 3 * s.height / 4));
        label.setAnchorPoint(cc.ccp(0.5, 0.5));
        label.setColor(cc.GREEN());
        label.setString("Green");
    },
    title:function () {
        return "cc.LabelBMFont";
    },
    subtitle:function () {
        return "Testing color";
    }
});

//------------------------------------------------------------------
//
// AtlasFastBitmap
//
// Use any of these editors to generate BMFonts:
//
//------------------------------------------------------------------
var AtlasFastBitmap = AtlasDemo.extend({
    ctor:function () {
        // Upper Label
        for (var i = 0; i < 100; i++) {
            var str = "-" + i + "-";
            var label = cc.LabelBMFont.create(str, "Resources/fonts/bitmapFontTest.fnt");
            this.addChild(label);

            var s = cc.Director.sharedDirector().getWinSize();

            var p = cc.ccp(cc.RANDOM_0_1() * s.width, cc.RANDOM_0_1() * s.height);
            label.setPosition(p);
            label.setAnchorPoint(cc.ccp(0.5, 0.5));
        }
    },
    title:function () {
        return "cc.LabelBMFont";
    },
    subtitle:function () {
        return "Creating several cc.LabelBMFont with the same .fnt file should be fast";
    }
});
//------------------------------------------------------------------
//
// BitmapFontMultiLine
//
// Use any of these editors to generate BMFonts:
//
//------------------------------------------------------------------
var BitmapFontMultiLine = AtlasDemo.extend({
    ctor:function () {
        var s;

        // Left
        var label1 = cc.LabelBMFont.create("Multi line\nLeft", "Resources/fonts/bitmapFontTest3.fnt");
        label1.setAnchorPoint(cc.ccp(0, 0));
        this.addChild(label1, 0, TAG_BITMAP_ATLAS1);

        s = label1.getContentSize();
        cc.Log("content size:" + s.width + "," + s.height);


        // Center
        var label2 = cc.LabelBMFont.create("Multi line\nCenter", "Resources/fonts/bitmapFontTest3.fnt");
        label2.setAnchorPoint(cc.ccp(0.5, 0.5));
        this.addChild(label2, 0, TAG_BITMAP_ATLAS2);

        s = label2.getContentSize();
        cc.Log("content size:" + s.width + "," + s.height);

        // right
        var label3 = cc.LabelBMFont.create("Multi line\nRight\nThree lines Three", "Resources/fonts/bitmapFontTest3.fnt");
        label3.setAnchorPoint(cc.ccp(1, 1));
        this.addChild(label3, 0, TAG_BITMAP_ATLAS3);

        s = label3.getContentSize();
        cc.Log("content size:" + s.width + "," + s.height);

        s = cc.Director.sharedDirector().getWinSize();
        label1.setPosition(cc.ccp(0, 0));
        label2.setPosition(cc.ccp(s.width / 2, s.height / 2));
        label3.setPosition(cc.ccp(s.width, s.height));
    },
    title:function () {
        return "cc.LabelBMFont";
    },
    subtitle:function () {
        return "Multiline + anchor point";
    }
});

//------------------------------------------------------------------
//
// LabelsEmpty
//
//------------------------------------------------------------------
var LabelsEmpty = AtlasDemo.extend({
    setEmpty:null,
    ctor:function () {
        var s = cc.Director.sharedDirector().getWinSize();

        // cc.LabelBMFont
        var label1 = cc.LabelBMFont.create("", "Resources/fonts/bitmapFontTest3.fnt");
        this.addChild(label1, 0, TAG_BITMAP_ATLAS1);
        label1.setPosition(cc.ccp(s.width / 2, s.height - 100));

        // cc.LabelTTF
        var label2 = cc.LabelTTF.create("", "Arial", 24);
        this.addChild(label2, 0, TAG_BITMAP_ATLAS2);
        label2.setPosition(cc.ccp(s.width / 2, s.height / 2));

        // cc.LabelAtlas
        var label3 = cc.LabelAtlas.create("", "Resources/fonts/tuffy_bold_italic-charmap.png", 48, 64, ' ');
        this.addChild(label3, 0, TAG_BITMAP_ATLAS3);
        label3.setPosition(cc.ccp(s.width / 2, 0 + 100));

        this.schedule(this.updateStrings, 1.0);

        this.setEmpty = false;
    },
    updateStrings:function (dt) {
        var label1 = this.getChildByTag(TAG_BITMAP_ATLAS1);
        var label2 = this.getChildByTag(TAG_BITMAP_ATLAS2);
        var label3 = this.getChildByTag(TAG_BITMAP_ATLAS3);

        if (!this.setEmpty) {
            label1.setString("not empty");
            label2.setString("not empty");
            label3.setString("hi");

            this.setEmpty = true;
        }
        else {
            label1.setString("");
            label2.setString("");
            label3.setString("");

            this.setEmpty = false;
        }
    },
    title:function () {
        return "Testing empty labels";
    },
    subtitle:function () {
        return "3 empty labels: LabelAtlas, LabelTTF and LabelBMFont";
    }
});

//------------------------------------------------------------------
//
// LabelBMFontHD
//
//------------------------------------------------------------------
var LabelBMFontHD = AtlasDemo.extend({
    ctor:function () {
        var s = cc.Director.sharedDirector().getWinSize();

        // cc.LabelBMFont
        var label1 = cc.LabelBMFont.create("TESTING RETINA DISPLAY", "Resources/fonts/konqa32.fnt");
        this.addChild(label1);
        label1.setPosition(cc.ccp(s.width / 2, s.height / 2));
    },
    title:function () {
        return "Testing Retina Display BMFont";
    },
    subtitle:function () {
        return "loading arista16 or arista16-hd";
    }
});

//------------------------------------------------------------------
//
// LabelAtlasHD
//
//------------------------------------------------------------------
var LabelAtlasHD = AtlasDemo.extend({
    ctor:function () {
        var s = cc.Director.sharedDirector().getWinSize();

        // cc.LabelBMFont
        var label1 = cc.LabelAtlas.create("TESTING RETINA DISPLAY", "Resources/fonts/larabie-16.plist");
        label1.setAnchorPoint(cc.ccp(0.5, 0.5));

        this.addChild(label1);
        label1.setPosition(cc.ccp(s.width / 2, s.height / 2));
    },
    title:function () {
        return "LabelAtlas with Retina Display";
    },
    subtitle:function () {
        return "loading larabie-16 / larabie-16-hd";
    }
});

//------------------------------------------------------------------
//
// LabelGlyphDesigner
//
//------------------------------------------------------------------
var LabelGlyphDesigner = AtlasDemo.extend({
    ctor:function () {
        var s = cc.Director.sharedDirector().getWinSize();

        var layer = cc.LayerColor.create(cc.ccc4(128, 128, 128, 255));
        this.addChild(layer, -10);

        // cc.LabelBMFont
        var label1 = cc.LabelBMFont.create("Testing Glyph Designer", "Resources/fonts/futura-48.fnt");
        this.addChild(label1);
        label1.setPosition(cc.ccp(s.width / 2, s.height / 2));
    },
    title:function () {
        return "Testing Glyph Designer";
    },
    subtitle:function () {
        return "You should see a font with shawdows and outline";
    }
});

//------------------------------------------------------------------
//
// LabelTTFTest
//
//------------------------------------------------------------------
var LabelTTFTest = AtlasDemo.extend({
    _label:null,
    _horizAlign:null,
    _vertAlign:null,
    ctor:function () {
        var blockSize = cc.SizeMake(200, 160);
        var s = cc.Director.sharedDirector().getWinSize();

        var colorLayer = cc.LayerColor.create(cc.ccc4(100, 100, 100, 255), blockSize.width, blockSize.height);
        colorLayer.setAnchorPoint(cc.ccp(0, 0));
        colorLayer.setPosition(cc.ccp((s.width - blockSize.width) / 2, (s.height - blockSize.height) / 2));

        this.addChild(colorLayer);

        cc.MenuItemFont.setFontSize(30);
        var menu = cc.Menu.create(
            cc.MenuItemFont.create("Left", this, this.setAlignmentLeft),
            cc.MenuItemFont.create("Center", this, this.setAlignmentCenter),
            cc.MenuItemFont.create("Right", this, this.setAlignmentRight));
        menu.alignItemsVerticallyWithPadding(4);
        menu.setPosition(cc.ccp(50, s.height / 2 - 20));
        this.addChild(menu);

        menu = cc.Menu.create(
            cc.MenuItemFont.create("Top", this, this.setAlignmentTop),
            cc.MenuItemFont.create("Middle", this, this.setAlignmentMiddle),
            cc.MenuItemFont.create("Bottom", this, this.setAlignmentBottom));
        menu.alignItemsVerticallyWithPadding(4);
        menu.setPosition(cc.ccp(s.width - 50, s.height / 2 - 20));
        this.addChild(menu);

        this._label = null;
        this._horizAlign = cc.TEXT_ALIGNMENT_LEFT;
        this._vertAlign = cc.VERTICAL_TEXT_ALIGNMENT_TOP;

        this.updateAlignment();
    },
    updateAlignment:function () {
        var blockSize = cc.SizeMake(200, 160);
        var s = cc.Director.sharedDirector().getWinSize();

        if (this._label) {
            this._label.removeFromParentAndCleanup(true);
        }

        this._label = cc.LabelTTF.create(this.getCurrentAlignment(), blockSize, this._horizAlign, this._vertAlign, "Arial", 22);

        this._label.setAnchorPoint(cc.ccp(0, 0));
        this._label.setPosition(cc.ccp((s.width - blockSize.width) / 2, (s.height - blockSize.height) / 2));

        this.addChild(this._label);
    },
    setAlignmentLeft:function (sender) {
        this._horizAlign = cc.TEXT_ALIGNMENT_LEFT;
        this.updateAlignment();
    },
    setAlignmentCenter:function (sender) {
        this._horizAlign = cc.TEXT_ALIGNMENT_CENTER;
        this.updateAlignment();
    },
    setAlignmentRight:function (sender) {
        this._horizAlign = cc.TEXT_ALIGNMENT_RIGHT;
        this.updateAlignment();
    },
    setAlignmentTop:function (sender) {
        this._vertAlign = cc.VERTICAL_TEXT_ALIGNMENT_TOP;
        this.updateAlignment();
    },
    setAlignmentMiddle:function (sender) {
        this._vertAlign = cc.VERTICAL_TEXT_ALIGNMENT_CENTER;
        this.updateAlignment();
    },
    setAlignmentBottom:function (sender) {
        this._vertAlign = cc.VERTICAL_TEXT_ALIGNMENT_BOTTOM;
        this.updateAlignment();
    },
    getCurrentAlignment:function () {
        var vertical = null;
        var horizontal = null;
        switch (this._vertAlign) {
            case cc.VERTICAL_TEXT_ALIGNMENT_TOP:
                vertical = "Top";
                break;
            case cc.VERTICAL_TEXT_ALIGNMENT_CENTER:
                vertical = "Middle";
                break;
            case cc.VERTICAL_TEXT_ALIGNMENT_BOTTOM:
                vertical = "Bottom";
                break;
        }
        switch (this._horizAlign) {
            case cc.TEXT_ALIGNMENT_LEFT:
                horizontal = "Left";
                break;
            case cc.TEXT_ALIGNMENT_CENTER:
                horizontal = "Center";
                break;
            case cc.TEXT_ALIGNMENT_RIGHT:
                horizontal = "Right";
                break;
        }

        return "Alignment hello world angela baby" + vertical + " " + horizontal;
    },
    title:function () {
        return "Testing cc.LabelTTF";
    },
    subtitle:function () {
        return "Select the buttons on the sides to change alignment";
    }
});

var LabelTTFMultiline = AtlasDemo.extend({
    ctor:function () {
        var s = cc.Director.sharedDirector().getWinSize();

        // cc.LabelBMFont
        var center = cc.LabelTTF.create("word wrap \"testing\" (bla0) bla1 'bla2' [bla3] (bla4) {bla5} {bla6} [bla7] (bla8) [bla9] 'bla0' \"bla1\"",
            cc.SizeMake(s.width / 2, 200), cc.TEXT_ALIGNMENT_CENTER, "Marker Felt", 32);
        center.setPosition(cc.ccp(s.width / 2, 150));

        this.addChild(center);
    },
    title:function () {
        return "Testing cc.LabelTTF Word Wrap";
    },
    subtitle:function () {
        return "Word wrap using cc.LabelTTF";
    }
});

var LabelTTFChinese = AtlasDemo.extend({
    ctor:function () {
        var size = cc.Director.sharedDirector().getWinSize();
        var lable = cc.LabelTTF.create("中国", "Microsoft Yahei", 30);
        lable.setPosition(cc.ccp(size.width / 2, size.height / 2));
        this.addChild(lable);
    },
    title:function () {
        return "Testing cc.LabelTTF with Chinese character";
    }
});

var LabelBMFontChinese = AtlasDemo.extend({
    ctor:function () {
        var size = cc.Director.sharedDirector().getWinSize();
        var lable = cc.LabelBMFont.create("中国", "Resources/fonts/bitmapFontChinese.fnt");
        lable.setPosition(cc.ccp(size.width / 2, size.height / 2));
        this.addChild(lable);
    },
    title:function () {
        return "Testing cc.LabelBMFont with Chinese character";
    }
});