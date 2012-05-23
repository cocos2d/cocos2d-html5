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
var kTagLabel = 1;
var kTagLabelSpriteManager = 1;
var kTagAnimation1 = 1;
var kTagBitmapAtlas1 = 1;
var kTagBitmapAtlas2 = 2;
var kTagBitmapAtlas3 = 3;

var kTagLabelSprite1 = 660;
var kTagLabelSprite2 = 661;
var kTagLabelSprite3 = 662;
var kTagLabelSprite4 = 663;
var kTagLabelSprite5 = 664;
var kTagLabelSprite6 = 665;
var kTagLabelSprite7 = 666;
var kTagLabelSprite8 = 667;


var AtlasTests = [
    "LabelAtlasTest", //ok
    "LabelAtlasColorTest", //ok
   /* "Atlas3",
    "Atlas4",
    "Atlas5",
    "Atlas6",
    "AtlasBitmapColor",
    "AtlasFastBitmap",
    "BitmapFontMultiLine",
    "LabelsEmpty",
    "LabelBMFontHD",*/
    "LabelAtlasHD",//ok
    //"LabelGlyphDesigner",
    //"Atlas1",
    "LabelTTFTest",//ok
    "LabelTTFMultiline",//ok
    "LabelTTFChinese"//ok
];

var s_nAtlasIdx = -1;
function nextAtlasAction() {
    ++s_nAtlasIdx;
    s_nAtlasIdx = s_nAtlasIdx % AtlasTests.length;
    return new window[AtlasTests[s_nAtlasIdx]];
}
function backAtlasAction() {
    --s_nAtlasIdx;
    if (s_nAtlasIdx < 0) {
        s_nAtlasIdx += AtlasTests.length;
    }
    return new window[AtlasTests[s_nAtlasIdx]];
}
function restartAtlasAction() {
    return new window[AtlasTests[s_nAtlasIdx]];
}

var LabelTestScene = TestScene.extend({
    runThisTest:function () {
        s_nAtlasIdx = -1;
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

        var label = cc.LabelTTF.labelWithString(this.title(), "Arial", 28);
        this.addChild(label, 1);
        label.setPosition(cc.ccp(s.width / 2, s.height - 50));

        var strSubtitle = this.subtitle();
        if (strSubtitle) {
            var l = cc.LabelTTF.labelWithString(strSubtitle.toString(), "Thonburi", 16);
            this.addChild(l, 1);
            l.setPosition(cc.ccp(s.width / 2, s.height - 80));
        }

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
        var s = new LabelTestScene();
        s.addChild(restartAtlasAction());

        cc.Director.sharedDirector().replaceScene(s);

    },
    nextCallback:function (pSender) {
        var s = new LabelTestScene();
        s.addChild(nextAtlasAction());
        cc.Director.sharedDirector().replaceScene(s);

    },
    backCallback:function (pSender) {
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
    m_textureAtlas:null,
    ctor:function () {
        this.m_textureAtlas = cc.TextureAtlas.textureAtlasWithFile(s_AtlasTest, 3);

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
            this.m_textureAtlas.updateQuad(quads[i], i);
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
        this.m_textureAtlas.drawQuads();
    }
});

//------------------------------------------------------------------
//
// LabelAtlasTest
//
//------------------------------------------------------------------
var LabelAtlasTest = AtlasDemo.extend({
    m_time:null,
    ctor:function () {
        this.m_time = 0;

        var label1 = cc.LabelAtlas.labelWithString("123 Test", "Resources/fonts/tuffy_bold_italic-charmap.png", 48, 64, ' ');
        this.addChild(label1, 0, kTagLabelSprite1);
        label1.setPosition(cc.ccp(10, 100));
        label1.setOpacity(200);

        var label2 = cc.LabelAtlas.labelWithString("0123456789", "Resources/fonts/tuffy_bold_italic-charmap.png", 48, 64, ' ');
        this.addChild(label2, 0, kTagLabelSprite2);
        label2.setPosition(cc.ccp(10, 200));
        label2.setOpacity(32);

        this.schedule(this.step);
    },
    step:function (dt) {
        this.m_time += dt;

        var label1 = this.getChildByTag(kTagLabelSprite1);
        var string1 = this.m_time.toFixed(2) + " Test";
        label1.setString(string1);

        var label2 = this.getChildByTag(kTagLabelSprite2);
        var string2 = parseInt(this.m_time).toString();
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
    m_time:null,
    ctor:function () {
        var label1 = cc.LabelAtlas.labelWithString("123 Test", "Resources/fonts/tuffy_bold_italic-charmap.png", 48, 64, ' ');
        this.addChild(label1, 0, kTagLabelSprite1);
        label1.setPosition(cc.ccp(10, 100));
        label1.setOpacity(200);

        var label2 = cc.LabelAtlas.labelWithString("0123456789", "Resources/fonts/tuffy_bold_italic-charmap.png", 48, 64, ' ');
        this.addChild(label2, 0, kTagLabelSprite2);
        label2.setPosition(cc.ccp(10, 200));
        label2.setColor(cc.RED());

        var fade = cc.FadeOut.actionWithDuration(1.0);
        var fade_in = fade.reverse();
        var seq = cc.Sequence.actions(fade, fade_in, null);
        var repeat = cc.RepeatForever.actionWithAction(seq);
        label2.runAction(repeat);

        this.m_time = 0;

        this.schedule(this.step);
    },
    step:function (dt) {
        this.m_time += dt;
        var string1 = this.m_time.toFixed(2) + " Test";
        var label1 = this.getChildByTag(kTagLabelSprite1);
        label1.setString(string1);

        var label2 = this.getChildByTag(kTagLabelSprite2);
        var string2 = parseInt(this.m_time).toString();
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
    m_time:null,
    ctor:function () {
        this.m_time = 0;

        var col = cc.LayerColor.layerWithColor(cc.ccc4(128, 128, 128, 255));
        this.addChild(col, -10);

        var label1 = cc.LabelBMFont.labelWithString("Test", "Resources/fonts/bitmapFontTest2.fnt");

        // testing anchors
        label1.setAnchorPoint(cc.ccp(0, 0));
        this.addChild(label1, 0, kTagBitmapAtlas1);
        var fade = cc.FadeOut.actionWithDuration(1.0);
        var fade_in = fade.reverse();
        var seq = cc.Sequence.actions(fade, fade_in, null);
        var repeat = cc.RepeatForever.actionWithAction(seq);
        label1.runAction(repeat);


        // VERY IMPORTANT
        // color and opacity work OK because bitmapFontAltas2 loads a BMP image (not a PNG image)
        // If you want to use both opacity and color, it is recommended to use NON premultiplied images like BMP images
        // Of course, you can also tell XCode not to compress PNG images, but I think it doesn't work as expected
        var label2 = cc.LabelBMFont.labelWithString("Test", "Resources/fonts/bitmapFontTest2.fnt");
        // testing anchors
        label2.setAnchorPoint(cc.ccp(0.5, 0.5));
        label2.setColor(cc.RED());
        this.addChild(label2, 0, kTagBitmapAtlas2);
        label2.runAction(repeat.copy());

        var label3 = cc.LabelBMFont.labelWithString("Test", "Resources/fonts/bitmapFontTest2.fnt");
        // testing anchors
        label3.setAnchorPoint(cc.ccp(1, 1));
        this.addChild(label3, 0, kTagBitmapAtlas3);


        var s = cc.Director.sharedDirector().getWinSize();
        label1.setPosition(cc.ccp(0, 0));
        label2.setPosition(cc.ccp(s.width / 2, s.height / 2));
        label3.setPosition(cc.ccp(s.width, s.height));

        this.schedule(this.step);
    },
    step:function (dt) {
        this.m_time += dt;
        //var string;
        var string = this.m_time + "Test j";

        var label1 = this.getChildByTag(kTagBitmapAtlas1);
        label1.setString(string);

        var label2 = this.getChildByTag(kTagBitmapAtlas2);
        label2.setString(string);

        var label3 = this.getChildByTag(kTagBitmapAtlas3);
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
    m_time:null,
    ctor:function () {
        this.m_time = 0;

        // Upper Label
        var label = cc.LabelBMFont.labelWithString("Bitmap Font Atlas", "Resources/fonts/bitmapFontTest.fnt");
        this.addChild(label);

        var s = cc.Director.sharedDirector().getWinSize();

        label.setPosition(cc.ccp(s.width / 2, s.height / 2));
        label.setAnchorPoint(cc.ccp(0.5, 0.5));

        var BChar = label.getChildByTag(0);
        var FChar = label.getChildByTag(7);
        var AChar = label.getChildByTag(12);

        var rotate = cc.RotateBy.actionWithDuration(2, 360);
        var rot_4ever = cc.RepeatForever.actionWithAction(rotate);

        var scale = cc.ScaleBy.actionWithDuration(2, 1.5);
        var scale_back = scale.reverse();
        var scale_seq = cc.Sequence.actions(scale, scale_back, null);
        var scale_4ever = cc.RepeatForever.actionWithAction(scale_seq);

        var jump = cc.JumpBy.actionWithDuration(0.5, cc.PointZero(), 60, 1);
        var jump_4ever = cc.RepeatForever.actionWithAction(jump);

        var fade_out = cc.FadeOut.actionWithDuration(1);
        var fade_in = cc.FadeIn.actionWithDuration(1);
        var seq = cc.Sequence.actions(fade_out, fade_in, null);
        var fade_4ever = cc.RepeatForever.actionWithAction(seq);

        BChar.runAction(rot_4ever);
        BChar.runAction(scale_4ever);
        FChar.runAction(jump_4ever);
        AChar.runAction(fade_4ever);

        // Bottom Label
        var label2 = cc.LabelBMFont.labelWithString("00.0", "Resources/fonts/bitmapFontTest.fnt");
        this.addChild(label2, 0, kTagBitmapAtlas2);
        label2.setPosition(cc.ccp(s.width / 2.0, 80));

        var lastChar = label2.getChildByTag(3);
        lastChar.runAction(rot_4ever.copy());

        this.schedule(this.step, 0.1);
    },
    step:function (dt) {
        this.m_time += dt;
        var string = this.m_time;

        var label1 = this.getChildByTag(kTagBitmapAtlas2);
        label1.setString(string);
    },
    draw:function () {
        var s = cc.Director.sharedDirector().getWinSize();
        cc.drawLine(cc.ccp(0, s.height / 2), cc.ccp(s.width, s.height / 2));
        cc.drawLine(cc.ccp(s.width / 2, 0), cc.ccp(s.width / 2, s.height));
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
    cotr:function () {
        var label = cc.LabelBMFont.labelWithString("abcdefg", "Resources/fonts/bitmapFontTest4.fnt");
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
        label = cc.LabelBMFont.labelWithString("FaFeFiFoFu", "Resources/fonts/bitmapFontTest5.fnt");
        this.addChild(label);
        label.setPosition(cc.ccp(s.width / 2, s.height / 2 + 50));
        label.setAnchorPoint(cc.ccp(0.5, 0.5));

        label = cc.LabelBMFont.labelWithString("fafefifofu", "Resources/fonts/bitmapFontTest5.fnt");
        this.addChild(label);
        label.setPosition(cc.ccp(s.width / 2, s.height / 2));
        label.setAnchorPoint(cc.ccp(0.5, 0.5));

        label = cc.LabelBMFont.labelWithString("aeiou", "Resources/fonts/bitmapFontTest5.fnt");
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
        label = cc.LabelBMFont.labelWithString("Blue", "Resources/fonts/bitmapFontTest5.fnt");
        label.setColor(cc.BLUE());
        this.addChild(label);
        label.setPosition(cc.ccp(s.width / 2, s.height / 4));
        label.setAnchorPoint(cc.ccp(0.5, 0.5));

        label = cc.LabelBMFont.labelWithString("Red", "Resources/fonts/bitmapFontTest5.fnt");
        this.addChild(label);
        label.setPosition(cc.ccp(s.width / 2, 2 * s.height / 4));
        label.setAnchorPoint(cc.ccp(0.5, 0.5));
        label.setColor(cc.RED());

        label = cc.LabelBMFont.labelWithString("G", "Resources/fonts/bitmapFontTest5.fnt");
        this.addChild(label);
        label.setPosition(cc.ccp(s.width / 2, 3 * s.height / 4));
        label.setAnchorPoint(cc.ccp(0.5, 0.5));
        label.setColor(ccGREEN);
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
            var label = cc.LabelBMFont.labelWithString(str, "Resources/fonts/bitmapFontTest.fnt");
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
        var label1 = cc.LabelBMFont.labelWithString("Multi line\nLeft", "Resources/fonts/bitmapFontTest3.fnt");
        label1.setAnchorPoint(cc.ccp(0, 0));
        this.addChild(label1, 0, kTagBitmapAtlas1);

        s = label1.getContentSize();
        cc.LOG("content size: %.2x%.2", s.width, s.height);


        // Center
        var label2 = cc.LabelBMFont.labelWithString("Multi line\nCenter", "Resources/fonts/bitmapFontTest3.fnt");
        label2.setAnchorPoint(cc.ccp(0.5, 0.5));
        this.addChild(label2, 0, kTagBitmapAtlas2);

        s = label2.getContentSize();
        cc.LOG("content size: %.2x%.2", s.width, s.height);

        // right
        var label3 = cc.LabelBMFont.labelWithString("Multi line\nRight\nThree lines Three", "Resources/fonts/bitmapFontTest3.fnt");
        label3.setAnchorPoint(cc.ccp(1, 1));
        this.addChild(label3, 0, kTagBitmapAtlas3);

        s = label3.getContentSize();
        cc.LOG("content size: %.2x%.2", s.width, s.height);

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
        var label1 = cc.LabelBMFont.labelWithString("", "Resources/fonts/bitmapFontTest3.fnt");
        this.addChild(label1, 0, kTagBitmapAtlas1);
        label1.setPosition(cc.ccp(s.width / 2, s.height - 100));

        // cc.LabelTTF
        var label2 = cc.LabelTTF.labelWithString("", "Arial", 24);
        this.addChild(label2, 0, kTagBitmapAtlas2);
        label2.setPosition(cc.ccp(s.width / 2, s.height / 2));

        // cc.LabelAtlas
        var label3 = cc.LabelAtlas.labelWithString("", "Resources/fonts/tuffy_bold_italic-charmap.png", 48, 64, ' ');
        this.addChild(label3, 0, kTagBitmapAtlas3);
        label3.setPosition(cc.ccp(s.width / 2, 0 + 100));

        this.schedule(this.updateStrings, 1.0);

        this.setEmpty = false;
    },
    updateStrings:function (dt) {
        var label1 = this.getChildByTag(kTagBitmapAtlas1);
        var label2 = this.getChildByTag(kTagBitmapAtlas2);
        var label3 = this.getChildByTag(kTagBitmapAtlas3);

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
        var label1 = cc.LabelBMFont.labelWithString("TESTING RETINA DISPLAY", "Resources/fonts/konqa32.fnt");
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
        var label1 = cc.LabelAtlas.labelWithString("TESTING RETINA DISPLAY", "Resources/fonts/larabie-16.png", 10, 20, 'A');
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

        var layer = cc.LayerColor.layerWithColor(cc.ccc4(128, 128, 128, 255));
        this.addChild(layer, -10);

        // cc.LabelBMFont
        var label1 = cc.LabelBMFont.labelWithString("Testing Glyph Designer", "Resources/fonts/futura-48.fnt");
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
    ctor:function () {
        var s = cc.Director.sharedDirector().getWinSize();

        // cc.LabelBMFont
        var left = cc.LabelTTF.labelWithString("align left", cc.SizeMake(s.width, 50), cc.TextAlignmentLeft, "Marker Felt", 32);
        var center = cc.LabelTTF.labelWithString("align center", cc.SizeMake(s.width, 50), cc.TextAlignmentCenter, "Marker Felt", 32);
        var right = cc.LabelTTF.labelWithString("align right", cc.SizeMake(s.width, 50), cc.TextAlignmentRight, "Marker Felt", 32);

        left.setPosition(cc.ccp(s.width / 2, 200));
        center.setPosition(cc.ccp(s.width / 2, 150));
        right.setPosition(cc.ccp(s.width / 2, 100));

        this.addChild(left);
        this.addChild(center);
        this.addChild(right);
    },
    title:function () {
        return "Testing cc.LabelTTF";
    },
    subtitle:function () {
        return "You should see 3 labels aligned left, center and right";
    }
});

var LabelTTFMultiline = AtlasDemo.extend({
    ctor:function () {
        var s = cc.Director.sharedDirector().getWinSize();

        // cc.LabelBMFont
        var center = cc.LabelTTF.labelWithString("word wrap \"testing\" (bla0) bla1 'bla2' [bla3] (bla4) {bla5} {bla6} [bla7] (bla8) [bla9] 'bla0' \"bla1\"",
            cc.SizeMake(s.width / 2, 200), cc.TextAlignmentCenter, "Marker Felt", 32);
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
        var pLable = cc.LabelTTF.labelWithString("中国", "Marker Felt", 30);
        pLable.setPosition(cc.ccp(size.width / 2, size.height / 2));
        this.addChild(pLable);
    },
    title:function () {
        return "Testing cc.LabelTTF with Chinese character";
    }
});