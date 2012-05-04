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

var MAX_LAYER = 1;
var sceneIdx = -1;
var s_currentOrientation = cc.DeviceOrientationPortrait;

function createTestCaseLayer(index) {
    switch (index) {
        case 0:
        {
            var pRet = new Director1();
            pRet.init();
            return pRet;
        }
        default:
            return null;
    }
}

function nextDirectorTestCase() {
    sceneIdx++;
    sceneIdx = sceneIdx % MAX_LAYER;

    return createTestCaseLayer(sceneIdx);
}

function backDirectorTestCase() {
    sceneIdx--;
    if (sceneIdx < 0)
        sceneIdx += MAX_LAYER;

    return createTestCaseLayer(sceneIdx);
}

function restartDirectorTestCase() {
    return createTestCaseLayer(sceneIdx);
}
///---------------------------------------
//
// DirectorTest
//
///---------------------------------------
DirectorTest = cc.Layer.extend({

    init:function () {
        var bRet = false;
        do
        {
            if (!this._super()) {
                break;
            }
            var s = cc.Director.sharedDirector().getWinSize();

            var label = cc.LabelTTF.labelWithString(this.title(), "Arial", 26);
            this.addChild(label, 1);
            label.setPosition(cc.ccp(s.width / 2, s.height - 50));

            var sSubtitle = this.subtitle();
            if (sSubtitle.length) {
                var l = cc.LabelTTF.labelWithString(sSubtitle, "Thonburi", 16);
                this.addChild(l, 1);
                l.setPosition(cc.ccp(s.width / 2, s.height - 80));
            }

            var item1 = cc.MenuItemImage.itemFromNormalImage(s_pPathB1, s_pPathB2, this, this.backCallback);
            var item2 = cc.MenuItemImage.itemFromNormalImage(s_pPathR1, s_pPathR2, this, this.restartCallback);
            var item3 = cc.MenuItemImage.itemFromNormalImage(s_pPathF1, s_pPathF2, this, this.nextCallback);

            var menu = cc.Menu.menuWithItems(item1, item2, item3, null);
            menu.setPosition(cc.PointZero);
            item1.setPosition(cc.ccp(s.width / 2 - 100, 30));
            item2.setPosition(cc.ccp(s.width / 2, 30));
            item3.setPosition(cc.ccp(s.width / 2 + 100, 30));

            bRet = true;
        } while (0);

        return bRet;

    },

    restartCallback:function (pSender) {
        var s = new DirectorTestScene();
        s.addChild(restartDirectorTestCase());
        cc.Director.sharedDirector().replaceScene(s);
    },
    nextCallback:function (pSender) {
        var s = new DirectorTestScene();
        s.addChild(nextDirectorTestCase());
        cc.Director.sharedDirector().replaceScene(s);
    },
    backCallback:function (pSender) {
        var s = new DirectorTestScene();
        s.addChild(backDirectorTestCase());
        cc.Director.sharedDirector().replaceScene(s);
    },

    title:function () {
        return "No title";
    },
    subtitle:function () {
        return "";
    }
});

Director1 = DirectorTest.extend({

    init:function () {
        var bRet = false;

        do
        {
            if (!this._super()) {
                break;
            }

            this.setIsTouchEnabled(true);
            var s = cc.Director.sharedDirector().getWinSize();
            var that = this;
            var item = cc.MenuItemFont.itemFromString("Rotate Device", this, function () {
                that.rotateDevice()
            });
            var menu = cc.Menu.menuWithItems(item, null);
            menu.setPosition(cc.ccp(s.width / 2, s.height / 2));
            this.addChild(menu);

            bRet = true;
        } while (0);

        return bRet;

    },

    newOrientation:function () {
        switch (s_currentOrientation) {
            case cc.DeviceOrientationLandscapeLeft:
                s_currentOrientation = cc.DeviceOrientationPortrait;
                break;
            case cc.DeviceOrientationPortrait:
                s_currentOrientation = cc.DeviceOrientationLandscapeRight;
                break;
            case cc.DeviceOrientationLandscapeRight:
                s_currentOrientation = cc.DeviceOrientationPortraitUpsideDown;
                break;
            case cc.DeviceOrientationPortraitUpsideDown:
                s_currentOrientation = cc.DeviceOrientationLandscapeLeft;
                break;
        }
        cc.Director.sharedDirector().setDeviceOrientation(s_currentOrientation);

    },
    rotateDevice:function (pSender) {
        //console.log(this);
        this.newOrientation();
        this.restartCallback(null);
    },
    ccTouchesEnded:function (touches, event) {

        var touch;

        if (touches.length <= 0)
            return;

        for (var i = 0; i < touches.length; i++) {
            touch = touches[i];

            if (!touch){
                break;
            }
            var a = touch.locationInView(touch.view());
            var director = cc.Director.sharedDirector();
            var b = director.convertToUI(director.convertToGL(a));
            cc.Log("(" + a.x + "," + a.y + ") ==( " + b.x + "," + b.y + ")");
        }

    },

    title:function () {
        return "Testing conversion";
    },
    subtitle:function () {
        return "Tap screen and see the debug console";
    }


});

DirectorTestScene = TestScene.extend({

    runThisTest:function () {
        s_currentOrientation = cc.DeviceOrientationPortrait;
        var pLayer = nextDirectorTestCase();
        this.addChild(pLayer);

        cc.Director.sharedDirector().replaceScene(this);

    },

    MainMenuCallback:function (pSender) {
        cc.Director.sharedDirector().setDeviceOrientation(cc.DeviceOrientationPortrait);
        this._super(pSender);
    }
});

