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
var s_nTouchCurCase = 0;

var TouchesMainScene = PerformBasicLayer.extend({
    _m_nMaxCases:2,
    _m_plabel:null,
    _numberOfTouchesB:0,
    _numberOfTouchesM:0,
    _numberOfTouchesE:0,
    _numberOfTouchesC:0,
    _elapsedTime:null,
    showCurrentTest:function () {
        var pLayer = null;
        switch (this._m_nCurCase) {
            case 0:
                pLayer = new TouchesPerformTest1(true, 2, this._m_nCurCase);
                break;
            case 1:
                pLayer = new TouchesPerformTest2(true, 2, this._m_nCurCase);
                break;
        }
        s_nTouchCurCase = this._m_nCurCase;

        if (pLayer) {
            var pScene = cc.Scene.node();
            pScene.addChild(pLayer);

            cc.Director.sharedDirector().replaceScene(pScene);
        }
    },
    onEnter:function () {
        this._super();

        var s = cc.Director.sharedDirector().getWinSize();

        // add title
        var label = cc.LabelTTF.labelWithString(this.title(), "Arial", 32);
        this.addChild(label, 1);
        label.setPosition(cc.ccp(s.width / 2, s.height - 50));

        this.scheduleUpdate();

        this._m_plabel = cc.LabelTTF.labelWithString("00.0", "Arial", 16);
        this._m_plabel.setPosition(cc.ccp(s.width / 2, s.height / 2));
        this.addChild(this._m_plabel);

        this._elapsedTime = 0;
        this._numberOfTouchesB = this._numberOfTouchesM = this._numberOfTouchesE = this._numberOfTouchesC = 0;
    },
    title:function () {
        return "No title";
    },
    update:function (dt) {
        this._elapsedTime += dt;

        if (this._elapsedTime > 1.0) {
            var frameRateB = (this._numberOfTouchesB / this._elapsedTime).toFixed(1);
            var frameRateM = (this._numberOfTouchesM / this._elapsedTime).toFixed(1);
            var frameRateE = (this._numberOfTouchesE / this._elapsedTime).toFixed(1);
            var frameRateC = (this._numberOfTouchesC / this._elapsedTime).toFixed(1);
            this._elapsedTime = 0;
            this._numberOfTouchesB = this._numberOfTouchesM = this._numberOfTouchesE = this._numberOfTouchesC = 0;

            var str = frameRateB + " " + frameRateM + " " + frameRateE + " " + frameRateC;
            this._m_plabel.setString(str);
        }
    }
});

////////////////////////////////////////////////////////
//
// TouchesPerformTest1
//
////////////////////////////////////////////////////////
var TouchesPerformTest1 = TouchesMainScene.extend({
    onEnter:function () {
        this._super();
        this.setIsTouchEnabled(true);
    },
    title:function () {
        return "Targeted touches";
    },
    registerWithTouchDispatcher:function () {
        cc.TouchDispatcher.sharedDispatcher().addTargetedDelegate(this, 0, true);
    },
    ccTouchBegan:function (touch, event) {
        this._numberOfTouchesB++;
        return true;
    },
    ccTouchMoved:function (touch, event) {
        this._numberOfTouchesM++;
    },
    ccTouchEnded:function (touch, event) {
        this._numberOfTouchesE++;
    },
    ccTouchCancelled:function (touch, event) {
        this._numberOfTouchesC++;
    }
});

////////////////////////////////////////////////////////
//
// TouchesPerformTest2
//
////////////////////////////////////////////////////////
var TouchesPerformTest2 = TouchesMainScene.extend({
    onEnter:function () {
        this._super();
        this.setIsTouchEnabled(true);
    },
    title:function () {
        return "Standard touches";
    },
    registerWithTouchDispatcher:function () {
        cc.TouchDispatcher.sharedDispatcher().addStandardDelegate(this, 0);
    },

    ccTouchesBegan:function (touches, event) {
        this._numberOfTouchesB += touches.length;
    },
    ccTouchesMoved:function (touches, event) {
        this._numberOfTouchesM += touches.length;
    },
    ccTouchesEnded:function (touches, event) {
        this._numberOfTouchesE += touches.length;
    },
    ccTouchesCancelled:function (touches, event) {
        this._numberOfTouchesC += touches.length;
    }
});

function runTouchesTest() {
    s_nTouchCurCase = 0;
    var pScene = cc.Scene.node();
    var pLayer = new TouchesPerformTest1(true, 2, s_nTouchCurCase);
    pScene.addChild(pLayer);
    cc.Director.sharedDirector().replaceScene(pScene);
}