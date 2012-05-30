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

var TextureCacheTest = cc.Layer.extend({
    _m_pLabelLoading:null,
    _m_pLabelPercent:null,
    _m_nNumberOfSprites:20,
    _m_nNumberOfLoadedSprites:0,
    ctor:function () {
        var size = cc.Director.sharedDirector().getWinSize();

        this._m_pLabelLoading = cc.LabelTTF.labelWithString("loading...", "Arial", 15);
        this._m_pLabelPercent = cc.LabelTTF.labelWithString("%0", "Arial", 15);

        this._m_pLabelLoading.setPosition(cc.PointMake(size.width / 2, size.height / 2 - 20));
        this._m_pLabelPercent.setPosition(cc.PointMake(size.width / 2, size.height / 2 + 20));

        this.addChild(this._m_pLabelLoading);
        this.addChild(this._m_pLabelPercent);

        // load textrues
        cc.TextureCache.sharedTextureCache().addImageAsync("Resources/Images/HelloWorld.png", this, this.loadingCallBack);
        cc.TextureCache.sharedTextureCache().addImageAsync("Resources/Images/grossini.png", this, this.loadingCallBack);
        cc.TextureCache.sharedTextureCache().addImageAsync("Resources/Images/grossini_dance_01.png", this, this.loadingCallBack);
        cc.TextureCache.sharedTextureCache().addImageAsync("Resources/Images/grossini_dance_02.png", this, this.loadingCallBack);
        cc.TextureCache.sharedTextureCache().addImageAsync("Resources/Images/grossini_dance_03.png", this, this.loadingCallBack);
        cc.TextureCache.sharedTextureCache().addImageAsync("Resources/Images/grossini_dance_04.png", this, this.loadingCallBack);
        cc.TextureCache.sharedTextureCache().addImageAsync("Resources/Images/grossini_dance_05.png", this, this.loadingCallBack);
        cc.TextureCache.sharedTextureCache().addImageAsync("Resources/Images/grossini_dance_06.png", this, this.loadingCallBack);
        cc.TextureCache.sharedTextureCache().addImageAsync("Resources/Images/grossini_dance_07.png", this, this.loadingCallBack);
        cc.TextureCache.sharedTextureCache().addImageAsync("Resources/Images/grossini_dance_08.png", this, this.loadingCallBack);
        cc.TextureCache.sharedTextureCache().addImageAsync("Resources/Images/grossini_dance_09.png", this, this.loadingCallBack);
        cc.TextureCache.sharedTextureCache().addImageAsync("Resources/Images/grossini_dance_10.png", this, this.loadingCallBack);
        cc.TextureCache.sharedTextureCache().addImageAsync("Resources/Images/grossini_dance_11.png", this, this.loadingCallBack);
        cc.TextureCache.sharedTextureCache().addImageAsync("Resources/Images/grossini_dance_12.png", this, this.loadingCallBack);
        cc.TextureCache.sharedTextureCache().addImageAsync("Resources/Images/grossini_dance_13.png", this, this.loadingCallBack);
        cc.TextureCache.sharedTextureCache().addImageAsync("Resources/Images/grossini_dance_14.png", this, this.loadingCallBack);
        cc.TextureCache.sharedTextureCache().addImageAsync("Resources/Images/background1.png", this, this.loadingCallBack);
        cc.TextureCache.sharedTextureCache().addImageAsync("Resources/Images/background2.png", this, this.loadingCallBack);
        cc.TextureCache.sharedTextureCache().addImageAsync("Resources/Images/background3.png", this, this.loadingCallBack);
        cc.TextureCache.sharedTextureCache().addImageAsync("Resources/Images/blocks.png", this, this.loadingCallBack);
    },
    addSprite:function () {
        var size = cc.Director.sharedDirector().getWinSize();

        // create sprites
        var bg = cc.Sprite.spriteWithFile("Resources/Images/HelloWorld.png");
        bg.setPosition(cc.PointMake(size.width / 2, size.height / 2));
        //bg.setScale(1.7);

        var s1 = cc.Sprite.spriteWithFile("Resources/Images/grossini.png");
        var s2 = cc.Sprite.spriteWithFile("Resources/Images/grossini_dance_01.png");
        var s3 = cc.Sprite.spriteWithFile("Resources/Images/grossini_dance_02.png");
        var s4 = cc.Sprite.spriteWithFile("Resources/Images/grossini_dance_03.png");
        var s5 = cc.Sprite.spriteWithFile("Resources/Images/grossini_dance_04.png");
        var s6 = cc.Sprite.spriteWithFile("Resources/Images/grossini_dance_05.png");
        var s7 = cc.Sprite.spriteWithFile("Resources/Images/grossini_dance_06.png");
        var s8 = cc.Sprite.spriteWithFile("Resources/Images/grossini_dance_07.png");
        var s9 = cc.Sprite.spriteWithFile("Resources/Images/grossini_dance_08.png");
        var s10 = cc.Sprite.spriteWithFile("Resources/Images/grossini_dance_09.png");
        var s11 = cc.Sprite.spriteWithFile("Resources/Images/grossini_dance_10.png");
        var s12 = cc.Sprite.spriteWithFile("Resources/Images/grossini_dance_11.png");
        var s13 = cc.Sprite.spriteWithFile("Resources/Images/grossini_dance_12.png");
        var s14 = cc.Sprite.spriteWithFile("Resources/Images/grossini_dance_13.png");
        var s15 = cc.Sprite.spriteWithFile("Resources/Images/grossini_dance_14.png");

        // just loading textures to slow down
        var s16 = cc.Sprite.spriteWithFile("Resources/Images/background1.png");
        var s17 = cc.Sprite.spriteWithFile("Resources/Images/background2.png");
        var s18 = cc.Sprite.spriteWithFile("Resources/Images/background3.png");
        var s19 = cc.Sprite.spriteWithFile("Resources/Images/blocks.png");

        s1.setPosition(cc.PointMake(50, 50));
        s2.setPosition(cc.PointMake(60, 50));
        s3.setPosition(cc.PointMake(70, 50));
        s4.setPosition(cc.PointMake(80, 50));
        s5.setPosition(cc.PointMake(90, 50));
        s6.setPosition(cc.PointMake(100, 50));

        s7.setPosition(cc.PointMake(50, 180));
        s8.setPosition(cc.PointMake(60, 180));
        s9.setPosition(cc.PointMake(70, 180));
        s10.setPosition(cc.PointMake(80, 180));
        s11.setPosition(cc.PointMake(90, 180));
        s12.setPosition(cc.PointMake(100, 180));

        s13.setPosition(cc.PointMake(50, 270));
        s14.setPosition(cc.PointMake(60, 270));
        s15.setPosition(cc.PointMake(70, 270));

        this.addChild(bg);

        this.addChild(s1);
        this.addChild(s2);
        this.addChild(s3);
        this.addChild(s4);
        this.addChild(s5);
        this.addChild(s6);
        this.addChild(s7);
        this.addChild(s8);
        this.addChild(s9);
        this.addChild(s10);
        this.addChild(s11);
        this.addChild(s12);
        this.addChild(s13);
        this.addChild(s14);
        this.addChild(s15);
    },
    loadingCallBack:function (obj) {
        ++this._m_nNumberOfLoadedSprites;
        this._m_pLabelPercent = (this._m_nNumberOfLoadedSprites / this._m_nNumberOfSprites) * 100;
        if (this._m_nNumberOfLoadedSprites == this._m_nNumberOfSprites) {
            this.removeChild(this._m_pLabelLoading, true);
            this.removeChild(this._m_pLabelPercent, true);
            this.addSprite();
        }
    }
});

var TextureCacheTestScene = TestScene.extend({
    runThisTest:function () {
        var pLayer = new TextureCacheTest();
        this.addChild(pLayer);
        cc.Director.sharedDirector().replaceScene(this);
    }
});