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
var kTagParticleSystem = 3;
var kTagLabelAtlas = 4;
var kMaxParticles = 1000;
var kParticleNodesIncrease = 50;
var s_nParCurIdx = 0;
var kTagParticleMenuLayer = 1000;

////////////////////////////////////////////////////////
//
// ParticleMenuLayer
//
////////////////////////////////////////////////////////
var ParticleMenuLayer = PerformBasicLayer.extend({
    _m_nMaxCases:4,
    showCurrentTest:function () {
        var pScene = this.getParent();
        var subTest = pScene.getSubTestNum();
        var parNum = pScene.getParticlesNum();

        var pNewScene = null;

        switch (this._m_nCurCase) {
            case 0:
                pNewScene = new ParticlePerformTest1;
                break;
            case 1:
                pNewScene = new ParticlePerformTest2;
                break;
            case 2:
                pNewScene = new ParticlePerformTest3;
                break;
            case 3:
                pNewScene = new ParticlePerformTest4;
                break;
        }

        s_nParCurIdx = this._m_nCurCase;
        if (pNewScene) {
            pNewScene.initWithSubTest(subTest, parNum);
            cc.Director.sharedDirector().replaceScene(pNewScene);
        }
    }
});

////////////////////////////////////////////////////////
//
// ParticleMainScene
//
////////////////////////////////////////////////////////
var ParticleMainScene = cc.Scene.extend({
    _lastRenderedCount:null,
    _quantityParticles:null,
    _subtestNumber:null,
    initWithSubTest:function (asubtest, particles) {
        //srandom(0);

        this._subtestNumber = asubtest;
        var s = cc.Director.sharedDirector().getWinSize();

        this._lastRenderedCount = 0;
        this._quantityParticles = particles;

        cc.MenuItemFont.setFontSize(65);
        var decrease = cc.MenuItemFont.itemFromString(" - ", this, this.onDecrease);
        decrease.setColor(cc.ccc3(0, 200, 20));
        var increase = cc.MenuItemFont.itemFromString(" + ", this, this.onIncrease);
        increase.setColor(cc.ccc3(0, 200, 20));

        var menu = cc.Menu.menuWithItems(decrease, increase, null);
        menu.alignItemsHorizontally();
        menu.setPosition(cc.ccp(s.width / 2, s.height / 2 + 15));
        this.addChild(menu, 1);

        var infoLabel = cc.LabelTTF.labelWithString("0 nodes", "Marker Felt", 30);
        infoLabel.setColor(cc.ccc3(0, 200, 20));
        infoLabel.setPosition(cc.ccp(s.width / 2, s.height - 90));
        this.addChild(infoLabel, 1, kTagInfoLayer);

        // particles on stage
        //var labelAtlas = cc.LabelAtlas.labelWithString("0000", "Resources/Images/fps_images.png", 16, 24, '.');
        var labelAtlas = cc.LabelTTF.labelWithString("0000", "Marker Felt", 30);
        this.addChild(labelAtlas, 0, kTagLabelAtlas);
        labelAtlas.setPosition(cc.ccp(s.width - 66, 50));

        // Next Prev Test
        var pMenu = new ParticleMenuLayer(true, 4, s_nParCurIdx);
        this.addChild(pMenu, 1, kTagParticleMenuLayer);

        // Sub Tests
        cc.MenuItemFont.setFontSize(40);
        var pSubMenu = cc.Menu.menuWithItems(null);
        for (var i = 1; i <= 3; ++i) {
            var str = i.toString();
            var itemFont = cc.MenuItemFont.itemFromString(str, this, this.testNCallback);
            itemFont.setTag(i);
            pSubMenu.addChild(itemFont, 10);

            if (i <= 1) {
                itemFont.setColor(cc.ccc3(200, 20, 20));
            }
            else {
                itemFont.setColor(cc.ccc3(0, 200, 20));
            }
        }
        pSubMenu.alignItemsHorizontally();
        pSubMenu.setPosition(cc.ccp(s.width / 2, 80));
        this.addChild(pSubMenu, 2);

        var label = cc.LabelTTF.labelWithString(this.title(), "Arial", 40);
        this.addChild(label, 1);
        label.setPosition(cc.ccp(s.width / 2, s.height - 32));
        label.setColor(cc.ccc3(255, 255, 40));

        this.updateQuantityLabel();
        this.createParticleSystem();

        this.schedule(this.step);
    },
    title:function () {
        return "No title";
    },

    step:function (dt) {
        var atlas = this.getChildByTag(kTagLabelAtlas);
        var emitter = this.getChildByTag(kTagParticleSystem);

        var str = emitter.getParticleCount();
        atlas.setString(str);
    },
    createParticleSystem:function () {
        var particleSystem = null;

        /*
         * Tests:
         * 1 Quad Particle System using 32-bit textures (PNG)
         * 2: Quad Particle System using 16-bit textures (PNG)
         * 3: Quad Particle System using 8-bit textures (PNG)
         * 4: Quad Particle System using 4-bit textures (PVRTC)
         */

        this.removeChildByTag(kTagParticleSystem, true);

        //todo
        // remove the "fire.png" from the TextureCache cache.
        var texture = cc.TextureCache.sharedTextureCache().addImage("Resources/Images/fire.png");
        cc.TextureCache.sharedTextureCache().removeTexture(texture);

        particleSystem = new cc.ParticleSystemQuad();

        switch (this._subtestNumber) {
            case 1:
                cc.Texture2D.setDefaultAlphaPixelFormat(cc.kCCTexture2DPixelFormat_RGBA8888);
                particleSystem.initWithTotalParticles(this._quantityParticles);
                particleSystem.setTexture(cc.TextureCache.sharedTextureCache().addImage("Resources/Images/fire.png"));
                break;
            case 2:
                cc.Texture2D.setDefaultAlphaPixelFormat(cc.kCCTexture2DPixelFormat_RGBA4444);
                particleSystem.initWithTotalParticles(this._quantityParticles);
                particleSystem.setTexture(cc.TextureCache.sharedTextureCache().addImage("Resources/Images/fire.png"));
                break;
            case 3:
                cc.Texture2D.setDefaultAlphaPixelFormat(cc.kCCTexture2DPixelFormat_A8);
                particleSystem.initWithTotalParticles(this._quantityParticles);
                particleSystem.setTexture(cc.TextureCache.sharedTextureCache().addImage("Resources/Images/fire.png"));
                break;
            default:
                particleSystem = null;
                cc.LOG("Shall not happen!");
                break;
        }
        this.addChild(particleSystem, 0, kTagParticleSystem);

        this.doTest();

        // restore the default pixel format
        cc.Texture2D.setDefaultAlphaPixelFormat(cc.kCCTexture2DPixelFormat_RGBA8888);
    },
    onDecrease:function (pSender) {
        this._quantityParticles -= kParticleNodesIncrease;
        if (this._quantityParticles < 0)
            this._quantityParticles = 0;

        this.updateQuantityLabel();
        this.createParticleSystem();
    },
    onIncrease:function (pSender) {
        this._quantityParticles += kParticleNodesIncrease;
        if (this._quantityParticles > kMaxParticles){
            this._quantityParticles = kMaxParticles;
        }
        this.updateQuantityLabel();
        this.createParticleSystem();
    },
    testNCallback:function (pSender) {
        this._subtestNumber = pSender.getTag();
        var pMenu = this.getChildByTag(kTagParticleMenuLayer);
        pMenu.restartCallback(pSender);
    },
    updateQuantityLabel:function () {
        if (this._quantityParticles != this._lastRenderedCount) {
            var infoLabel = this.getChildByTag(kTagInfoLayer);
            var str = this._quantityParticles + " particles";
            infoLabel.setString(str);

            this._lastRenderedCount = this._quantityParticles;
        }
    },
    getSubTestNum:function () {
        return this._subtestNumber;
    },
    getParticlesNum:function () {
        return this._quantityParticles;
    },
    doTest:function () {
    }
});

////////////////////////////////////////////////////////
//
// ParticlePerformTest1
//
////////////////////////////////////////////////////////
var ParticlePerformTest1 = ParticleMainScene.extend({

    title:function () {
        return "A " + this._subtestNumber + " size=4";
    },
    doTest:function () {
        var s = cc.Director.sharedDirector().getWinSize();
        var particleSystem = this.getChildByTag(kTagParticleSystem);

        // duration
        particleSystem.setDuration(-1);

        // gravity
        particleSystem.setGravity(cc.ccp(0, -90));

        // angle
        particleSystem.setAngle(90);
        particleSystem.setAngleVar(0);

        // radial
        particleSystem.setRadialAccel(0);
        particleSystem.setRadialAccelVar(0);

        // speed of particles
        particleSystem.setSpeed(180);
        particleSystem.setSpeedVar(50);

        // emitter position
        particleSystem.setPosition(cc.ccp(s.width / 2, 100));
        particleSystem.setPosVar(cc.ccp(s.width / 2, 0));

        // life of particles
        particleSystem.setLife(2.0);
        particleSystem.setLifeVar(1);

        // emits per frame
        particleSystem.setEmissionRate(particleSystem.getTotalParticles() / particleSystem.getLife());

        // color of particles
        var startColor = new cc.Color4F(0.5, 0.5, 0.5, 1.0);
        particleSystem.setStartColor(startColor);

        var startColorVar = new cc.Color4F(0.5, 0.5, 0.5, 1.0);
        particleSystem.setStartColorVar(startColorVar);

        var endColor = new cc.Color4F(0.1, 0.1, 0.1, 0.2);
        particleSystem.setEndColor(endColor);

        var endColorVar = new cc.Color4F(0.1, 0.1, 0.1, 0.2);
        particleSystem.setEndColorVar(endColorVar);

        // size, in pixels
        particleSystem.setEndSize(4.0);
        particleSystem.setStartSize(4.0);
        particleSystem.setEndSizeVar(0);
        particleSystem.setStartSizeVar(0);

        // additive
        particleSystem.setIsBlendAdditive(false);
    }
});

////////////////////////////////////////////////////////
//
// ParticlePerformTest2
//
////////////////////////////////////////////////////////
var ParticlePerformTest2 = ParticleMainScene.extend({

    title:function () {
        return "B " + this._subtestNumber + " size=8";
    },
    doTest:function () {
        var s = cc.Director.sharedDirector().getWinSize();
        var particleSystem = this.getChildByTag(kTagParticleSystem);

        // duration
        particleSystem.setDuration(-1);

        // gravity
        particleSystem.setGravity(cc.ccp(0, -90));

        // angle
        particleSystem.setAngle(90);
        particleSystem.setAngleVar(0);

        // radial
        particleSystem.setRadialAccel(0);
        particleSystem.setRadialAccelVar(0);

        // speed of particles
        particleSystem.setSpeed(180);
        particleSystem.setSpeedVar(50);

        // emitter position
        particleSystem.setPosition(cc.ccp(s.width / 2, 100));
        particleSystem.setPosVar(cc.ccp(s.width / 2, 0));

        // life of particles
        particleSystem.setLife(2.0);
        particleSystem.setLifeVar(1);

        // emits per frame
        particleSystem.setEmissionRate(particleSystem.getTotalParticles() / particleSystem.getLife());

        // color of particles
        var startColor = new cc.Color4F(0.5, 0.5, 0.5, 1.0);
        particleSystem.setStartColor(startColor);

        var startColorVar = new cc.Color4F(0.5, 0.5, 0.5, 1.0);
        particleSystem.setStartColorVar(startColorVar);

        var endColor = new cc.Color4F(0.1, 0.1, 0.1, 0.2);
        particleSystem.setEndColor(endColor);

        var endColorVar = new cc.Color4F(0.1, 0.1, 0.1, 0.2);
        particleSystem.setEndColorVar(endColorVar);

        // size, in pixels
        particleSystem.setEndSize(8.0);
        particleSystem.setStartSize(8.0);
        particleSystem.setEndSizeVar(0);
        particleSystem.setStartSizeVar(0);

        // additive
        particleSystem.setIsBlendAdditive(false);
    }
});

////////////////////////////////////////////////////////
//
// ParticlePerformTest3
//
////////////////////////////////////////////////////////
var ParticlePerformTest3 = ParticleMainScene.extend({

    title:function () {
        return "C " + this._subtestNumber + " size=32";
    },
    doTest:function () {
        var s = cc.Director.sharedDirector().getWinSize();
        var particleSystem = this.getChildByTag(kTagParticleSystem);

        // duration
        particleSystem.setDuration(-1);

        // gravity
        particleSystem.setGravity(cc.ccp(0, -90));

        // angle
        particleSystem.setAngle(90);
        particleSystem.setAngleVar(0);

        // radial
        particleSystem.setRadialAccel(0);
        particleSystem.setRadialAccelVar(0);

        // speed of particles
        particleSystem.setSpeed(180);
        particleSystem.setSpeedVar(50);

        // emitter position
        particleSystem.setPosition(cc.ccp(s.width / 2, 100));
        particleSystem.setPosVar(cc.ccp(s.width / 2, 0));

        // life of particles
        particleSystem.setLife(2.0);
        particleSystem.setLifeVar(1);

        // emits per frame
        particleSystem.setEmissionRate(particleSystem.getTotalParticles() / particleSystem.getLife());

        // color of particles
        var startColor = new cc.Color4F(0.5, 0.5, 0.5, 1.0);
        particleSystem.setStartColor(startColor);

        var startColorVar = new cc.Color4F(0.5, 0.5, 0.5, 1.0);
        particleSystem.setStartColorVar(startColorVar);

        var endColor = new cc.Color4F(0.1, 0.1, 0.1, 0.2);
        particleSystem.setEndColor(endColor);

        var endColorVar = new cc.Color4F(0.1, 0.1, 0.1, 0.2);
        particleSystem.setEndColorVar(endColorVar);

        // size, in pixels
        particleSystem.setEndSize(32.0);
        particleSystem.setStartSize(32.0);
        particleSystem.setEndSizeVar(0);
        particleSystem.setStartSizeVar(0);

        // additive
        particleSystem.setIsBlendAdditive(false);
    }
});

////////////////////////////////////////////////////////
//
// ParticlePerformTest4
//
////////////////////////////////////////////////////////
var ParticlePerformTest4 = ParticleMainScene.extend({

    title:function () {
        return "D " + this._subtestNumber + " size=64";
    },
    doTest:function () {
        var s = cc.Director.sharedDirector().getWinSize();
        var particleSystem = this.getChildByTag(kTagParticleSystem);

        // duration
        particleSystem.setDuration(-1);

        // gravity
        particleSystem.setGravity(cc.ccp(0, -90));

        // angle
        particleSystem.setAngle(90);
        particleSystem.setAngleVar(0);

        // radial
        particleSystem.setRadialAccel(0);
        particleSystem.setRadialAccelVar(0);

        // speed of particles
        particleSystem.setSpeed(180);
        particleSystem.setSpeedVar(50);

        // emitter position
        particleSystem.setPosition(cc.ccp(s.width / 2, 100));
        particleSystem.setPosVar(cc.ccp(s.width / 2, 0));

        // life of particles
        particleSystem.setLife(2.0);
        particleSystem.setLifeVar(1);

        // emits per frame
        particleSystem.setEmissionRate(particleSystem.getTotalParticles() / particleSystem.getLife());

        // color of particles
        var startColor = new cc.Color4F(0.5, 0.5, 0.5, 1.0);
        particleSystem.setStartColor(startColor);

        var startColorVar = new cc.Color4F(0.5, 0.5, 0.5, 1.0);
        particleSystem.setStartColorVar(startColorVar);

        var endColor = new cc.Color4F(0.1, 0.1, 0.1, 0.2);
        particleSystem.setEndColor(endColor);

        var endColorVar = new cc.Color4F(0.1, 0.1, 0.1, 0.2);
        particleSystem.setEndColorVar(endColorVar);

        // size, in pixels
        particleSystem.setEndSize(64.0);
        particleSystem.setStartSize(64.0);
        particleSystem.setEndSizeVar(0);
        particleSystem.setStartSizeVar(0);

        // additive
        particleSystem.setIsBlendAdditive(false);
    }
});

function runParticleTest() {
    var pScene = new ParticlePerformTest1;
    pScene.initWithSubTest(1, kParticleNodesIncrease);
    cc.Director.sharedDirector().replaceScene(pScene);
}