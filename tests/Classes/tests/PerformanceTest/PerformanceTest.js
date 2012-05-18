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
var kItemTagBasic = 1000;
var nCurCase = 0;

var PerformanceTests = [
    "PerformanceNodeChildrenTest",
    "PerformanceParticleTest",
    "PerformanceSpriteTest",
    "PerformanceTextureTest",
    "PerformanceTouchesTest"
];
////////////////////////////////////////////////////////
//
// PerformanceMainLayer
//
////////////////////////////////////////////////////////
var PerformanceMainLayer = cc.Layer.extend({
    onEnter:function () {
        this._super();

        var s = cc.Director.sharedDirector().getWinSize();

        var pMenu = cc.Menu.menuWithItems(null);
        pMenu.setPosition(cc.PointZero());
        cc.MenuItemFont.setFontName("Arial");
        cc.MenuItemFont.setFontSize(24);

        for (var i = 0; i < PerformanceTests.length; i++) {
            var pItem = cc.MenuItemFont.itemFromString(PerformanceTests[i], this, this.menuCallback);
            pItem.setPosition(cc.ccp(s.width / 2, s.height - (i + 1) * LINE_SPACE));
            pMenu.addChild(pItem, kItemTagBasic + i);
        }

        this.addChild(pMenu);
    },
    menuCallback:function (pSender) {
        var nIndex = pSender.getZOrder() - kItemTagBasic;
        // create the test scene and run it
        switch (nIndex) {
            case 0:
                runNodeChildrenTest();
                break;
            case 1:
                runParticleTest();
                break;
            case 2:
                runSpriteTest();
                break;
            case 3:
                runTextureTest();
                break;
            case 4:
                runTouchesTest();
                break;
            default:
                break;
        }
    }
});

////////////////////////////////////////////////////////
//
// PerformBasicLayer
//
////////////////////////////////////////////////////////
var PerformBasicLayer = cc.Layer.extend({
    _m_bControlMenuVisible:true,
    _m_nMaxCases:1,
    _m_nCurCase:0,
    ctor:function () {
        this._m_nCurCase = nCurCase;
    },
    onEnter:function () {
        this._super();

        var s = cc.Director.sharedDirector().getWinSize();

        cc.MenuItemFont.setFontName("Arial");
        cc.MenuItemFont.setFontSize(24);
        var pMainItem = cc.MenuItemFont.itemFromString("Back", this, this.toMainLayer);
        pMainItem.setPosition(cc.ccp(s.width - 50, 25));
        var pMenu = cc.Menu.menuWithItems(pMainItem, null);
        pMenu.setPosition(cc.PointZero());

        if (this._m_bControlMenuVisible) {
            var item1 = cc.MenuItemImage.itemFromNormalImage(s_pPathB1, s_pPathB2, this, this.backCallback);
            var item2 = cc.MenuItemImage.itemFromNormalImage(s_pPathR1, s_pPathR2, this, this.restartCallback);
            var item3 = cc.MenuItemImage.itemFromNormalImage(s_pPathF1, s_pPathF2, this, this.nextCallback);
            item1.setPosition(cc.ccp(s.width / 2 - 100, 30));
            item2.setPosition(cc.ccp(s.width / 2, 30));
            item3.setPosition(cc.ccp(s.width / 2 + 100, 30));

            pMenu.addChild(item1, kItemTagBasic);
            pMenu.addChild(item2, kItemTagBasic);
            pMenu.addChild(item3, kItemTagBasic);
        }
        this.addChild(pMenu);
    },
    restartCallback:function (pSender) {
        this.showCurrentTest();
    },
    nextCallback:function (pSender) {
        this._m_nCurCase++;
        this._m_nCurCase = this._m_nCurCase % this._m_nMaxCases;
        nCurCase = this._m_nCurCase;
        this.showCurrentTest();
    },
    backCallback:function (pSender) {
        this._m_nCurCase--;
        if (this._m_nCurCase < 0) {
            this._m_nCurCase += this._m_nMaxCases;
        }
        nCurCase = this._m_nCurCase;
        this.showCurrentTest();
    },
    showCurrentTest:function (pSender) {
    },
    toMainLayer:function (pSender) {
        var pScene = new PerformanceTestScene();
        pScene.runThisTest();
    }
});

////////////////////////////////////////////////////////
//
// PerformanceTestScene
//
////////////////////////////////////////////////////////
var PerformanceTestScene = TestScene.extend({
    runThisTest:function () {
        var pLayer = new PerformanceMainLayer();
        this.addChild(pLayer);
        cc.Director.sharedDirector().replaceScene(this);
    }
});

