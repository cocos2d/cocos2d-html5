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
var kTagLabel1 = 550;
var kTagLabel2 = 551;
var kTagLabel3 = 552;
var kTagLabel4 = 553;

var fontIdx = 0;

var fontList = [
    "Verdana",
    "Lucida Sans Unicode",
    "Bookman Old Style",
    "Symbol",
    "Georgia",
    "Trebuchet MS",
    "Comic Sans MS",
    "Arial Black",
    "Tahoma",
    "Impact"
];


function nextFontTestAction() {
    fontIdx++;
    fontIdx = fontIdx % fontList.length;
    return fontList[fontIdx]
}

function backFontTestAction() {
    fontIdx--;
    if (fontIdx < 0) {
        fontIdx += fontList.length;
    }

    return fontList[fontIdx];
}

function restartFontTestAction() {
    return fontList[fontIdx];
}
FontTestScene = TestScene.extend({

    runThisTest:function () {
        var pLayer = FontTest.node();
        this.addChild(pLayer);

        cc.Director.sharedDirector().replaceScene(this);
    }
});

FontTest = cc.Layer.extend({
    ctor:function () {
        var size = cc.Director.sharedDirector().getWinSize();
        var item1 = cc.MenuItemImage.itemFromNormalImage(s_pPathB1, s_pPathB2, this, this.backCallback);
        var item2 = cc.MenuItemImage.itemFromNormalImage(s_pPathR1, s_pPathR2, this, this.restartCallback);
        var item3 = cc.MenuItemImage.itemFromNormalImage(s_pPathF1, s_pPathF2, this, this.nextCallback);

        var menu = cc.Menu.menuWithItems(item1, item2, item3, null);
        menu.setPosition(cc.PointZero());
        item1.setPosition(cc.ccp(size.width / 2 - 100, 30));
        item2.setPosition(cc.ccp(size.width / 2, 30));
        item3.setPosition(cc.ccp(size.width / 2 + 100, 30));
        this.addChild(menu, 1);

        this.showFont(restartFontTestAction());

    },
    showFont:function (pFont) {
        this.removeChildByTag(kTagLabel1, true);
        this.removeChildByTag(kTagLabel2, true);
        this.removeChildByTag(kTagLabel3, true);
        this.removeChildByTag(kTagLabel4, true);

        var s = cc.Director.sharedDirector().getWinSize();

        var top = cc.LabelTTF.labelWithString(pFont, pFont, 24);
        var left = cc.LabelTTF.labelWithString("alignment left", cc.SizeMake(s.width, 50), cc.TextAlignmentLeft, pFont, 32);
        var center = cc.LabelTTF.labelWithString("alignment center", cc.SizeMake(s.width, 50), cc.TextAlignmentCenter, pFont, 32);
        var right = cc.LabelTTF.labelWithString("alignment right", cc.SizeMake(s.width, 50), cc.TextAlignmentRight, pFont, 32);

        top.setPosition(cc.ccp(s.width / 2, s.height *3 /4));
        left.setPosition(cc.ccp(s.width / 2, s.height/2));
        center.setPosition(cc.ccp(s.width / 2, s.height *3 /8));
        right.setPosition(cc.ccp(s.width / 2, s.height/4));

        this.addChild(left, 0, kTagLabel1);
        this.addChild(right, 0, kTagLabel2);
        this.addChild(center, 0, kTagLabel3);
        this.addChild(top, 0, kTagLabel4);

    },

    restartCallback:function (pSender) {
        this.showFont(restartFontTestAction());
    },
    nextCallback:function (pSender) {
        this.showFont(nextFontTestAction());
    },
    backCallback:function (pSender) {
        this.showFont(backFontTestAction());
    },
    title:function () {
        return "Font test";
    }


});

FontTest.node = function () {
    var pRet = new FontTest();
    pRet.init();
    return pRet;
};