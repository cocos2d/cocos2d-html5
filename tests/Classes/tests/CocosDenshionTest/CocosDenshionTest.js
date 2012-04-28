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
    "play background music",
    "stop background music",
    "pause background music",
    "resume background music",
    "rewind background music",
    "is background music playing",
    "play effect",
    "play effect repeatly",
    "stop effect",
    "unload effect",
    "add background music volume",
    "sub background music volume",
    "add effects volume",
    "sub effects volume",
    "pause effect",
    "resume effect",
    "pause all effects",
    "resume all effects",
    "stop all effects"
];

CocosDenshionTest = cc.Layer.extend({
    _m_pItmeMenu:null,
    _m_tBeginPos:cc.PointZero(),
    _m_nTestCount:null,
    _m_nSoundId:0,
    ctor:function(){
        // add menu items for tests
        this._m_pItmeMenu = cc.Menu.menuWithItems(null);
        var s = cc.Director.sharedDirector().getWinSize();
        this._m_nTestCount = DenshionTests.length;

        for (var i = 0; i < this._m_nTestCount; ++i){
            var label = cc.LabelTTF.labelWithString(DenshionTests[i], "Arial", 24);
            var pMenuItem = cc.MenuItemLabel.itemWithLabel(label, this, this.menuCallback);

            this._m_pItmeMenu.addChild(pMenuItem, i + 10000);
            pMenuItem.setPosition( cc.PointMake( s.width / 2, (s.height - (i + 1) * LINE_SPACE) ));
        }

        this._m_pItmeMenu.setContentSize(cc.SizeMake(s.width, (this._m_nTestCount + 1) * LINE_SPACE));
        this._m_pItmeMenu.setPosition(cc.PointZero);
        this.addChild(this._m_pItmeMenu);

        this.setIsTouchEnabled(true);

        // preload background music and effect
        cc.AudioManager.sharedEngine().preloadBackgroundMusic( cc.FileUtils.fullPathFromRelativePath(MUSIC_FILE) );
        cc.AudioManager.sharedEngine().preloadEffect( cc.FileUtils.fullPathFromRelativePath(EFFECT_FILE) );

        // set default volume
        cc.AudioManager.sharedEngine().setEffectsVolume(0.5);
        cc.AudioManager.sharedEngine().setBackgroundMusicVolume(0.5);
    },
    menuCallback:function (pSender) {
    },
    ccTouchesMoved:function (pTouches, pEvent) {
        var touch = pTouches.begin()[0];

        var touchLocation = touch.locationInView(touch.view() );
        touchLocation = cc.Director.sharedDirector().convertToGL( touchLocation );
        var nMoveY = touchLocation.y - this._m_tBeginPos.y;

        var curPos  = this._m_pItmeMenu.getPosition();
        var nextPos = cc.ccp(curPos.x, curPos.y + nMoveY);
        var winSize = cc.Director.sharedDirector().getWinSize();
        if (nextPos.y < 0.0)
        {
            this._m_pItmeMenu.setPosition(cc.PointZero);
            return;
        }

        if (nextPos.y > ((this._m_nTestCount + 1)* LINE_SPACE - winSize.height))
        {
            this._m_pItmeMenu.setPosition(cc.ccp(0, ((this._m_nTestCount + 1)* LINE_SPACE - winSize.height)));
            return;
        }

        this._m_pItmeMenu.setPosition(nextPos);
        this._m_tBeginPos = touchLocation;
    },
    ccTouchesBegan:function (pTouches, pEvent) {
        var touch = pTouches.begin()[0];

        this._m_tBeginPos = touch.locationInView( touch.view() );
        this._m_tBeginPos = cc.Director.sharedDirector().convertToGL( this._m_tBeginPos );
    },
    onExit:function () {
        cc.Layer.onExit();

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

// play background music
var playBackgroundMusic = function(){
cc.AudioManager.sharedEngine().playBackgroundMusic(MUSIC_FILE, false);
};

// stop background music
var stopBackgroundMusic = function(){
cc.AudioManager.sharedEngine().stopBackgroundMusic();
}

// pause background music
cc.AudioManager.sharedEngine().pauseBackgroundMusic();

// resume background music
cc.AudioManager.sharedEngine().resumeBackgroundMusic();

// rewind background music
cc.AudioManager.sharedEngine().rewindBackgroundMusic();

// is background music playing
if (cc.AudioManager.sharedEngine().isBackgroundMusicPlaying()) {
    cc.LOG("background music is playing");
}
else {
    cc.LOG("background music is not playing");
}

// play effect
m_nSoundId = cc.AudioManager.sharedEngine().playEffect(EFFECT_FILE);

// play effect
m_nSoundId = cc.AudioManager.sharedEngine().playEffect(EFFECT_FILE, true);

// stop effect
cc.AudioManager.sharedEngine().stopEffect(m_nSoundId);

// unload effect

cc.AudioManager.sharedEngine().unloadEffect(EFFECT_FILE);

// add bakcground music volume
cc.AudioManager.sharedEngine().setBackgroundMusicVolume(cc.AudioManager.sharedEngine().getBackgroundMusicVolume() + 0.1);

// sub backgroud music volume
cc.AudioManager.sharedEngine().setBackgroundMusicVolume(cc.AudioManager.sharedEngine().getBackgroundMusicVolume() - 0.1);

// add effects volume
cc.AudioManager.sharedEngine().setEffectsVolume(cc.AudioManager.sharedEngine().getEffectsVolume() + 0.1);

// sub effects volume
cc.AudioManager.sharedEngine().setEffectsVolume(cc.AudioManager.sharedEngine().getEffectsVolume() - 0.1);

cc.AudioManager.sharedEngine().pauseEffect(m_nSoundId);

cc.AudioManager.sharedEngine().resumeEffect(m_nSoundId);

cc.AudioManager.sharedEngine().pauseAllEffects();

cc.AudioManager.sharedEngine().resumeAllEffects();

cc.AudioManager.sharedEngine().stopAllEffects();