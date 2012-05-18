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
var MUSIC_FILE = "Resources/background";
var EFFECT_FILE = "Resources/effect2";

var DenshionTests = [
    "playBackgroundMusic",
    "stopBackgroundMusic",
    "pauseBackgroundMusic",
    "resumeBackgroundMusic",
    "rewindBackgroundMusic",
    "isBackgroundMusicPlaying",
    "playEffect",
    "playEffectRepeatly",
    "stopEffect",
    "unloadEffect",
    "addBackgroundMusicVolume",
    "subBackgroundMusicVolume",
    "addEffectsVolume",
    "subEffectsVolume",
    "pauseEffect",
    "resumeEffect",
    "pauseAllEffects",
    "resumeAllEffects",
    "stopAllEffects"
];

CocosDenshionTest = cc.Layer.extend({
    _m_pItmeMenu:null,
    _m_tBeginPos:cc.PointZero(),
    bIsMouseDown:false,
    _m_nTestCount:0,
    ctor:function () {
        // add menu items for tests
        this._m_pItmeMenu = cc.Menu.menuWithItems(null);
        var s = cc.Director.sharedDirector().getWinSize();
        for (var i = 0;i < DenshionTests.length;i++) {
            var label = cc.LabelTTF.labelWithString(DenshionTests[i], "Arial", 24);
            var pMenuItem = cc.MenuItemLabel.itemWithLabel(label, this, this.menuCallback);
            this._m_pItmeMenu.addChild(pMenuItem, i + 10000);
            pMenuItem.setPosition(cc.PointMake(s.width / 2, (s.height - (i + 1) * LINE_SPACE)));
        }
        this._m_nTestCount = i;
        this._m_pItmeMenu.setContentSize(cc.SizeMake(s.width, (this._m_nTestCount + 1) * LINE_SPACE));
        this._m_pItmeMenu.setPosition(cc.PointZero());
        this.addChild(this._m_pItmeMenu);

        this.setIsTouchEnabled(true);

        // set default volume
        cc.AudioManager.sharedEngine().setEffectsVolume(0.5);
        cc.AudioManager.sharedEngine().setBackgroundMusicVolume(0.5);
    },
    menuCallback:function (pSender) {
        var nIdx = pSender.getZOrder() - 10000;
        // create the test scene and run it
        var pScene = new window[DenshionTests[nIdx]]();
    },
    ccTouchesMoved:function (pTouches, pEvent) {
        if (this.bIsMouseDown) {
            var touchLocation = pTouches[0].locationInView(0);
            var nMoveY = touchLocation.y - this._m_tBeginPos.y;
            var curPos = this._m_pItmeMenu.getPosition();

            var nextPos = cc.ccp(curPos.x, curPos.y + nMoveY);
            var winSize = cc.Director.sharedDirector().getWinSize();
            if (nextPos.y < 0.0) {
                this._m_pItmeMenu.setPosition(cc.PointZero());
                return;
            }

            if (nextPos.y > ((this._m_nTestCount + 1) * LINE_SPACE - winSize.height)) {
                this._m_pItmeMenu.setPosition(cc.ccp(0, ((this._m_nTestCount + 1) * LINE_SPACE - winSize.height)));
                return;
            }

            this._m_pItmeMenu.setPosition(nextPos);

            this._m_tBeginPos = cc.ccp(0, touchLocation.y);
        }
    },
    ccTouchesBegan:function (pTouches, pEvent) {
        if (!this.bIsMouseDown) {
            this._m_tBeginPos = pTouches[0].locationInView(0);
        }
        this.bIsMouseDown = true;
    },
    ccTouchesEnded:function () {
        this.bIsMouseDown = false;
    },
    onExit:function () {
        this._super();
        cc.AudioManager.sharedEngine().end();
    }
});

CocosDenshionTestScene = TestScene.extend({
    runThisTest:function () {
        var pLayer = new CocosDenshionTest();
        this.addChild(pLayer);
        cc.Director.sharedDirector().replaceScene(this);
    }
});

var m_nSoundId = null;

var playBackgroundMusic = function () {
    cc.LOG("play background music");
    cc.AudioManager.sharedEngine().playBackgroundMusic(MUSIC_FILE, false);
};

var stopBackgroundMusic = function () {
    cc.LOG("stop background music");
    cc.AudioManager.sharedEngine().stopBackgroundMusic();
};

var pauseBackgroundMusic = function () {
    cc.LOG("pause background music");
    cc.AudioManager.sharedEngine().pauseBackgroundMusic();
};

var resumeBackgroundMusic = function () {
    cc.LOG("resume background music");
    cc.AudioManager.sharedEngine().resumeBackgroundMusic();
};

var rewindBackgroundMusic = function () {
    cc.LOG("rewind background music");
    cc.AudioManager.sharedEngine().rewindBackgroundMusic();
};

// is background music playing
var isBackgroundMusicPlaying = function () {
    if (cc.AudioManager.sharedEngine().isBackgroundMusicPlaying()) {
        cc.LOG("background music is playing");
    }
    else {
        cc.LOG("background music is not playing");
    }
};

var playEffect = function () {
    cc.LOG("play effect");
    m_nSoundId = cc.AudioManager.sharedEngine().playEffect(EFFECT_FILE);
};

var playEffectRepeatly = function () {
    cc.LOG("play effect repeatly");
    m_nSoundId = cc.AudioManager.sharedEngine().playEffect(EFFECT_FILE, true);
};

var stopEffect = function () {
    cc.LOG("stop effect");
    cc.AudioManager.sharedEngine().stopEffect(m_nSoundId);
};

var unloadEffect = function () {
    cc.LOG("unload effect");
    cc.AudioManager.sharedEngine().unloadEffect(EFFECT_FILE);
};

var addBackgroundMusicVolume = function () {
    cc.LOG("add bakcground music volume");
    cc.AudioManager.sharedEngine().setBackgroundMusicVolume(cc.AudioManager.sharedEngine().getBackgroundMusicVolume() + 0.1);
};

var subBackgroundMusicVolume = function () {
    cc.LOG("sub backgroud music volume");
    cc.AudioManager.sharedEngine().setBackgroundMusicVolume(cc.AudioManager.sharedEngine().getBackgroundMusicVolume() - 0.1);
};

var addEffectsVolume = function () {
    cc.LOG("add effects volume");
    cc.AudioManager.sharedEngine().setEffectsVolume(cc.AudioManager.sharedEngine().getEffectsVolume() + 0.1);
};

var subEffectsVolume = function () {
    cc.LOG("sub effects volume");
    cc.AudioManager.sharedEngine().setEffectsVolume(cc.AudioManager.sharedEngine().getEffectsVolume() - 0.1);
};

var pauseEffect = function () {
    cc.LOG("pause effect");
    cc.AudioManager.sharedEngine().pauseEffect(m_nSoundId);
};

var resumeEffect = function () {
    cc.LOG("resume effect");
    cc.AudioManager.sharedEngine().resumeEffect(m_nSoundId);
};

var pauseAllEffects = function () {
    cc.LOG("pause all effects");
    cc.AudioManager.sharedEngine().pauseAllEffects();
};
var resumeAllEffects = function () {
    cc.LOG("resume all effects");
    cc.AudioManager.sharedEngine().resumeAllEffects();
};
var stopAllEffects = function () {
    cc.LOG("stop all effects");
    cc.AudioManager.sharedEngine().stopAllEffects();
};