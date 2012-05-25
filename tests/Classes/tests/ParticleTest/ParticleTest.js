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
var kTagLabelAtlas = 1;

var sceneIdx = -1;
var MAX_LAYER = 33;

var ParticleTestScene = TestScene.extend({
    runThisTest:function () {
        sceneIdx = -1;
        MAX_LAYER = 15;

        this.addChild(nextParticleAction());
        cc.Director.sharedDirector().replaceScene(this);
    }
});

var IDC_NEXT = 100;
var IDC_BACK = 101;
var IDC_RESTART = 102;
var IDC_TOGGLE = 103;

var createParticleLayer = function (nIndex) {
    switch (nIndex) {
        case 0:
            return new DemoFlower();
        case 1:
            return new DemoGalaxy();
        case 2:
            return new DemoFirework();
        case 3:
            return new DemoSpiral();
        case 4:
            return new DemoSun();
        case 5:
            return new DemoMeteor();
        case 6:
            return new DemoFire();
        case 7:
            //return new DemoSmoke();
            return new Issue704();
        case 8:
            return new DemoExplosion();
        case 9:
            return new DemoSnow();
        case 10:
            return new DemoRain();
        case 11:
            return new DemoBigFlower();
        case 12:
            return new DemoRotFlower();
        case 13:
            return new DemoModernArt();
        case 14:
            return new DemoRing();
        case 15:
            return new ParallaxParticle();
        case 16:
            return new DemoParticleFromFile("BoilingFoam");
        case 17:
            return new DemoParticleFromFile("BurstPipe");
        case 18:
            return new DemoParticleFromFile("Comet");
        case 19:
            return new DemoParticleFromFile("debian");
        case 20:
            return new DemoParticleFromFile("ExplodingRing");
        case 21:
            return new DemoParticleFromFile("LavaFlow");
        case 22:
            return new DemoParticleFromFile("SpinningPeas");
        case 23:
            return new DemoParticleFromFile("SpookyPeas");
        case 24:
            return new DemoParticleFromFile("Upsidedown");
        case 25:
            return new DemoParticleFromFile("Flower");
        case 26:
            return new DemoParticleFromFile("Spiral");
        case 27:
            return new DemoParticleFromFile("Galaxy");
        case 28:
            return new RadiusMode1();
        case 29:
            return new RadiusMode2();
        case 30:
            return new Issue704();
        case 31:
            return new Issue870();
        case 32:
            return new DemoParticleFromFile("Phoenix");
    }
    return null;
};

var nextParticleAction = function () {
    sceneIdx++;
    sceneIdx = sceneIdx % MAX_LAYER;

    return createParticleLayer(sceneIdx);
};

var backParticleAction = function () {
    sceneIdx--;
    var total = MAX_LAYER;
    if (sceneIdx < 0)
        sceneIdx += total;

    return createParticleLayer(sceneIdx);
};

var restartParticleAction = function () {
    return createParticleLayer(sceneIdx);
};

var ParticleDemo = cc.LayerColor.extend({
    _m_emitter:null,
    _m_background:null,
    _shapeModeButton:null,
    _textureModeButton:null,

    ctor:function () {
        this._super();
        this.initWithColor(cc.ccc4(127, 127, 127, 255));

        this._m_emitter = null;

        this.setIsTouchEnabled(true);

        var s = cc.Director.sharedDirector().getWinSize();
        var label = cc.LabelTTF.labelWithString(this.title(), "Arial", 28);
        this.addChild(label, 100, 1000);
        label.setPosition(cc.PointMake(s.width / 2, s.height - 50));

        var tapScreen = cc.LabelTTF.labelWithString("(Tap the Screen)", "Arial", 20);
        tapScreen.setPosition(cc.PointMake(s.width / 2, s.height - 80));
        this.addChild(tapScreen, 100);
        var selfPoint = this;
        var item1 = cc.MenuItemImage.itemFromNormalImage(s_pPathB1, s_pPathB2, this, this.backCallback);
        var item2 = cc.MenuItemImage.itemFromNormalImage(s_pPathR1, s_pPathR2, this, function(){selfPoint._m_emitter.resetSystem();}
            /*function () {
                if (selfPoint._m_emitter.getPositionType() == cc.kCCPositionTypeGrouped)
                    selfPoint._m_emitter.setPositionType(cc.kCCPositionTypeFree);
                else if (selfPoint._m_emitter.getPositionType() == cc.kCCPositionTypeFree)
                    selfPoint._m_emitter.setPositionType(cc.kCCPositionTypeRelative);
                else if (selfPoint._m_emitter.getPositionType() == cc.kCCPositionTypeRelative)
                    selfPoint._m_emitter.setPositionType(cc.kCCPositionTypeGrouped);
            }*/
        );
        var item3 = cc.MenuItemImage.itemFromNormalImage(s_pPathF1, s_pPathF2, this, this.nextCallback);

        //var item4 = cc.MenuItemToggle.itemWithTarget(	this,
        //    this.toggleCallback,
        //    cc.MenuItemFont.itemFromString("Free Movement"),
        //    cc.MenuItemFont.itemFromString("Relative Movement"),
        //    cc.MenuItemFont.itemFromString("Grouped Movement"),
        //    null);

        var spriteNormal = cc.Sprite.spriteWithFile(s_ShapeModeMenuItem, cc.RectMake(0, 23 * 2, 115, 23));
        var spriteSelected = cc.Sprite.spriteWithFile(s_ShapeModeMenuItem, cc.RectMake(0, 23, 115, 23));
        var spriteDisabled = cc.Sprite.spriteWithFile(s_ShapeModeMenuItem, cc.RectMake(0, 0, 115, 23));

        this._shapeModeButton = cc.MenuItemSprite.itemFromNormalSprite(spriteNormal, spriteSelected, spriteDisabled, this,
            function(){
                selfPoint._m_emitter.setDrawMode(cc.kParticleTextureMode);
                selfPoint._textureModeButton.setIsVisible(true);
                selfPoint._shapeModeButton.setIsVisible(false);
            });
        this._shapeModeButton.setPosition( new cc.Point(10,100));
        this._shapeModeButton.setAnchorPoint( cc.PointMake(0,0) );

        var spriteNormal_t = cc.Sprite.spriteWithFile(s_TextureModeMenuItem, cc.RectMake(0, 23 * 2, 115, 23));
        var spriteSelected_t = cc.Sprite.spriteWithFile(s_TextureModeMenuItem, cc.RectMake(0, 23, 115, 23));
        var spriteDisabled_t = cc.Sprite.spriteWithFile(s_TextureModeMenuItem, cc.RectMake(0, 0, 115, 23));

        this._textureModeButton = cc.MenuItemSprite.itemFromNormalSprite(spriteNormal_t, spriteSelected_t, spriteDisabled_t, this,
            function(){
                selfPoint._m_emitter.setDrawMode(cc.kParticleShapeMode);
                selfPoint._textureModeButton.setIsVisible(false);
                selfPoint._shapeModeButton.setIsVisible(true);
            });
        this._textureModeButton.setIsVisible(false);
        this._textureModeButton.setPosition( new cc.Point(10,100));
        this._textureModeButton.setAnchorPoint( cc.PointMake(0,0) );

        var menu = cc.Menu.menuWithItems(item1, item2, item3,this._shapeModeButton, this._textureModeButton);

        menu.setPosition(cc.PointZero());
        item1.setPosition(cc.PointMake(s.width / 2 - 100, 30));
        item2.setPosition(cc.PointMake(s.width / 2, 30));
        item3.setPosition(cc.PointMake(s.width / 2 + 100, 30));
        //item4.setPosition( cc.PointMake( 10, 100) );
        //item4.setAnchorPoint( cc.PointMake(0,0) );

        this.addChild(menu, 100);
        //TODO
        var labelAtlas = cc.LabelTTF.labelWithString("0000", "Arial", 24);
        this.addChild(labelAtlas, 100, kTagLabelAtlas);
        labelAtlas.setPosition(cc.PointMake(s.width - 66, 50));

        // moving background
        this._m_background = cc.Sprite.spriteWithFile(s_back3);
        this.addChild(this._m_background, 5);
        this._m_background.setPosition(cc.PointMake(s.width / 2, s.height - 180));

        var move = cc.MoveBy.actionWithDuration(4, cc.PointMake(300, 0));
        var move_back = move.reverse();
        var seq = cc.Sequence.actions(move, move_back, null);
        this._m_background.runAction(cc.RepeatForever.actionWithAction(seq));

        this.schedule(this.step);
    },

    onEnter:function () {
        this._super();

        var pLabel = this.getChildByTag(1000);
        pLabel.setString(this.title());
    },
    title:function () {
        return "No title";
    },

    restartCallback:function (pSender) {
        this._m_emitter.resetSystem();
    },
    nextCallback:function (pSender) {
        var s = new ParticleTestScene();
        s.addChild(nextParticleAction());
        cc.Director.sharedDirector().replaceScene(s);
    },
    backCallback:function (pSender) {
        var s = new ParticleTestScene();
        s.addChild(backParticleAction());
        cc.Director.sharedDirector().replaceScene(s);
    },
    toggleCallback:function (pSender) {
        if (this._m_emitter.getPositionType() == cc.kCCPositionTypeGrouped)
            this._m_emitter.setPositionType(cc.kCCPositionTypeFree);
        else if (this._m_emitter.getPositionType() == cc.kCCPositionTypeFree)
            this._m_emitter.setPositionType(cc.kCCPositionTypeRelative);
        else if (this._m_emitter.getPositionType() == cc.kCCPositionTypeRelative)
            this._m_emitter.setPositionType(cc.kCCPositionTypeGrouped);
    },

    registerWithTouchDispatcher:function () {
        cc.TouchDispatcher.sharedDispatcher().addTargetedDelegate(this, 0, false);
    },
    ccTouchBegan:function (touch, event) {
        return true;
    },
    ccTouchMoved:function (touch, event) {
        return this.ccTouchEnded(touch, event);
    },
    ccTouchEnded:function (touch, event) {
        var location = touch.locationInView(touch.view());
        //CCPoint convertedLocation = CCDirector::sharedDirector().convertToGL(location);

        var pos = cc.PointZero();
        if (this._m_background) {
            pos = this._m_background.convertToWorldSpace(cc.PointZero());
        }
        this._m_emitter.setPosition(cc.ccpSub(location, pos));
    },

    step:function (dt) {
        if (this._m_emitter) {
            var atlas = this.getChildByTag(kTagLabelAtlas);
            atlas.setString(this._m_emitter.getParticleCount().toFixed(0));
        }
    },
    setEmitterPosition:function () {
        var s = cc.Director.sharedDirector().getWinSize();
        this._m_emitter.setPosition(cc.PointMake(s.width / 2, s.height / 2));
    }
});

var DemoFirework = ParticleDemo.extend({
    onEnter:function () {
        this._super();

        this._m_emitter = cc.ParticleFireworks.node();
        this._m_background.addChild(this._m_emitter, 10);
        var myTexture = cc.TextureCache.sharedTextureCache().addImage(s_stars1);
        this._m_emitter.setTexture(myTexture);
        this._m_emitter.setShapeType(cc.kParticleStarShape);
        this.setEmitterPosition();
    },
    title:function () {
        return "ParticleFireworks";
    }
});

var DemoFire = ParticleDemo.extend({
    onEnter:function () {
        this._super();

        this._m_emitter = cc.ParticleFire.node();
        this._m_background.addChild(this._m_emitter, 10);

        this._m_emitter.setTexture(cc.TextureCache.sharedTextureCache().addImage(s_fire));//.pvr"];
        this._m_emitter.setShapeType(cc.kParticleBallShape);
        var p = this._m_emitter.getPosition();
        this._m_emitter.setPosition(cc.PointMake(p.x, 100));

        this.setEmitterPosition();
    },
    title:function () {
        return "ParticleFire";
    }
});

var DemoSun = ParticleDemo.extend({
    onEnter:function () {
        this._super();

        this._m_emitter = cc.ParticleSun.node();
        this._m_background.addChild(this._m_emitter, 10);
        var myTexture = cc.TextureCache.sharedTextureCache().addImage(s_fire);
        this._m_emitter.setTexture(myTexture);
        this._m_emitter.setShapeType(cc.kParticleBallShape);
        this.setEmitterPosition();
    },
    title:function () {
        return "ParticleSun";
    }
});

var DemoGalaxy = ParticleDemo.extend({
    onEnter:function () {
        this._super();

        this._m_emitter = cc.ParticleGalaxy.node();
        this._m_background.addChild(this._m_emitter, 10);
        var myTexture = cc.TextureCache.sharedTextureCache().addImage(s_fire);
        this._m_emitter.setTexture(myTexture);
        this._m_emitter.setShapeType(cc.kParticleBallShape);
        this.setEmitterPosition();
    },
    title:function () {
        return "ParticleGalaxy";
    }
});

var DemoFlower = ParticleDemo.extend({
    ctor:function () {
        this._super();
    },
    onEnter:function () {
        this._super();

        this._m_emitter = cc.ParticleFlower.node();
        this._m_background.addChild(this._m_emitter, 10);

        var myTexture = cc.TextureCache.sharedTextureCache().addImage(s_stars1);
        this._m_emitter.setTexture(myTexture);
        this._m_emitter.setShapeType(cc.kParticleStarShape);
        this.setEmitterPosition();
    },
    title:function () {
        return "ParticleFlower";
    }
});

var DemoBigFlower = ParticleDemo.extend({
    onEnter:function () {
        this._super();

        this._m_emitter = new cc.ParticleSystemQuad();
        this._m_emitter.initWithTotalParticles(50);
        //this._m_emitter.autorelease();

        this._m_background.addChild(this._m_emitter, 10);
        this._m_emitter.setTexture(cc.TextureCache.sharedTextureCache().addImage(s_stars1));
        this._m_emitter.setShapeType(cc.kParticleStarShape);
        this._m_emitter.setDuration(-1);

        // gravity
        this._m_emitter.setGravity(cc.PointZero());

        // angle
        this._m_emitter.setAngle(90);
        this._m_emitter.setAngleVar(360);

        // speed of particles
        this._m_emitter.setSpeed(160);
        this._m_emitter.setSpeedVar(20);

        // radial
        this._m_emitter.setRadialAccel(-120);
        this._m_emitter.setRadialAccelVar(0);

        // tagential
        this._m_emitter.setTangentialAccel(30);
        this._m_emitter.setTangentialAccelVar(0);

        // emitter position
        this._m_emitter.setPosition(cc.PointMake(160, 240));
        this._m_emitter.setPosVar(cc.PointZero());

        // life of particles
        this._m_emitter.setLife(4);
        this._m_emitter.setLifeVar(1);

        // spin of particles
        this._m_emitter.setStartSpin(0);
        this._m_emitter.setStartSizeVar(0);
        this._m_emitter.setEndSpin(0);
        this._m_emitter.setEndSpinVar(0);

        // color of particles
        var startColor = new cc.Color4F(0.5, 0.5, 0.5, 1.0);
        this._m_emitter.setStartColor(startColor);

        var startColorVar = new cc.Color4F(0.5, 0.5, 0.5, 1.0);
        this._m_emitter.setStartColorVar(startColorVar);

        var endColor = new cc.Color4F(0.1, 0.1, 0.1, 0.2);
        this._m_emitter.setEndColor(endColor);

        var endColorVar = new cc.Color4F(0.1, 0.1, 0.1, 0.2);
        this._m_emitter.setEndColorVar(endColorVar);

        // size, in pixels
        this._m_emitter.setStartSize(80.0);
        this._m_emitter.setStartSizeVar(40.0);
        this._m_emitter.setEndSize(cc.kParticleStartSizeEqualToEndSize);

        // emits per second
        this._m_emitter.setEmissionRate(this._m_emitter.getTotalParticles() / this._m_emitter.getLife());

        // additive
        this._m_emitter.setIsBlendAdditive(true);

        this.setEmitterPosition();
    },
    title:function () {
        return "ParticleBigFlower";
    }
});

var DemoRotFlower = ParticleDemo.extend({
    onEnter:function () {
        this._super();

        this._m_emitter = new cc.ParticleSystemQuad();
        //this._m_emitter.initWithTotalParticles(300);
        this._m_emitter.initWithTotalParticles(150);

        this._m_background.addChild(this._m_emitter, 10);
        this._m_emitter.setTexture(cc.TextureCache.sharedTextureCache().addImage(s_stars2));
        this._m_emitter.setShapeType(cc.kParticleStarShape);
        // duration
        this._m_emitter.setDuration(-1);

        // gravity
        this._m_emitter.setGravity(cc.PointZero());

        // angle
        this._m_emitter.setAngle(90);
        this._m_emitter.setAngleVar(360);

        // speed of particles
        this._m_emitter.setSpeed(160);
        this._m_emitter.setSpeedVar(20);

        // radial
        this._m_emitter.setRadialAccel(-120);
        this._m_emitter.setRadialAccelVar(0);

        // tagential
        this._m_emitter.setTangentialAccel(30);
        this._m_emitter.setTangentialAccelVar(0);

        // emitter position
        this._m_emitter.setPosition(cc.PointMake(160, 240));
        this._m_emitter.setPosVar(cc.PointZero());

        // life of particles
        this._m_emitter.setLife(3);
        this._m_emitter.setLifeVar(1);

        // spin of particles
        this._m_emitter.setStartSpin(0);
        this._m_emitter.setStartSpinVar(0);
        this._m_emitter.setEndSpin(0);
        this._m_emitter.setEndSpinVar(2000);

        var startColor = new cc.Color4F(0.5, 0.5, 0.5, 1.0);
        this._m_emitter.setStartColor(startColor);

        var startColorVar = new cc.Color4F(0.5, 0.5, 0.5, 1.0);
        this._m_emitter.setStartColorVar(startColorVar);

        var endColor = new cc.Color4F(0.1, 0.1, 0.1, 0.2);
        this._m_emitter.setEndColor(endColor);

        var endColorVar = new cc.Color4F(0.1, 0.1, 0.1, 0.2);
        this._m_emitter.setEndColorVar(endColorVar);

        // size, in pixels
        this._m_emitter.setStartSize(30.0);
        this._m_emitter.setStartSizeVar(0);
        this._m_emitter.setEndSize(cc.kParticleStartSizeEqualToEndSize);

        // emits per second
        this._m_emitter.setEmissionRate(this._m_emitter.getTotalParticles() / this._m_emitter.getLife());

        // additive
        this._m_emitter.setIsBlendAdditive(false);

        this.setEmitterPosition();
    },
    title:function () {
        return "ParticleRotFlower";
    }
});

var DemoMeteor = ParticleDemo.extend({
    onEnter:function () {
        this._super();

        this._m_emitter = cc.ParticleMeteor.node();
        this._m_background.addChild(this._m_emitter, 10);

        this._m_emitter.setTexture(cc.TextureCache.sharedTextureCache().addImage(s_fire));
        this._m_emitter.setShapeType(cc.kParticleBallShape);
        this.setEmitterPosition();
    },
    title:function () {
        return "ParticleMeteor";
    }
});

var DemoSpiral = ParticleDemo.extend({
    onEnter:function () {
        this._super();

        this._m_emitter = cc.ParticleSpiral.node();
        this._m_background.addChild(this._m_emitter, 10);

        this._m_emitter.setTexture(cc.TextureCache.sharedTextureCache().addImage(s_fire));
        this._m_emitter.setShapeType(cc.kParticleBallShape);
        this.setEmitterPosition();
    },
    title:function () {
        return "ParticleSpiral";
    }
});

var DemoExplosion = ParticleDemo.extend({
    onEnter:function () {
        this._super();

        this._m_emitter = cc.ParticleExplosion.node();
        this._m_background.addChild(this._m_emitter, 10);

        this._m_emitter.setTexture(cc.TextureCache.sharedTextureCache().addImage(s_stars1));
        this._m_emitter.setShapeType(cc.kParticleStarShape);
        this._m_emitter.setIsAutoRemoveOnFinish(true);

        this.setEmitterPosition();
    },
    title:function () {
        return "ParticleExplosion";
    }
});

var DemoSmoke = ParticleDemo.extend({
    onEnter:function () {
        this._super();

        this._m_emitter = cc.ParticleSmoke.node();
        this._m_background.addChild(this._m_emitter, 10);
        this._m_emitter.setTexture(cc.TextureCache.sharedTextureCache().addImage(s_fire));

        var p = this._m_emitter.getPosition();
        this._m_emitter.setPosition(cc.PointMake(p.x, 100));

        this.setEmitterPosition();
    },
    title:function () {
        return "ParticleSmoke";
    }
});

var DemoSnow = ParticleDemo.extend({
    onEnter:function () {
        this._super();

        this._m_emitter = cc.ParticleSnow.node();
        this._m_background.addChild(this._m_emitter, 10);

        var p = this._m_emitter.getPosition();
        this._m_emitter.setPosition(cc.PointMake(p.x, p.y - 110));
        this._m_emitter.setLife(3);
        this._m_emitter.setLifeVar(1);

        // gravity
        this._m_emitter.setGravity(cc.PointMake(0, -10));

        // speed of particles
        this._m_emitter.setSpeed(130);
        this._m_emitter.setSpeedVar(30);


        var startColor = this._m_emitter.getStartColor();
        startColor.r = 0.9;
        startColor.g = 0.9;
        startColor.b = 0.9;
        this._m_emitter.setStartColor(startColor);

        var startColorVar = this._m_emitter.getStartColorVar();
        startColorVar.b = 0.1;
        this._m_emitter.setStartColorVar(startColorVar);

        this._m_emitter.setEmissionRate(this._m_emitter.getTotalParticles() / this._m_emitter.getLife());

        this._m_emitter.setTexture(cc.TextureCache.sharedTextureCache().addImage(s_snow));
        this._m_emitter.setShapeType(cc.kParticleStarShape);

        this.setEmitterPosition();
    },
    title:function () {
        return "ParticleSnow";
    }
});

var DemoRain = ParticleDemo.extend({
    onEnter:function () {
        this._super();

        this._m_emitter = cc.ParticleRain.node();
        this._m_background.addChild(this._m_emitter, 10);

        var p = this._m_emitter.getPosition();
        this._m_emitter.setPosition(cc.PointMake(p.x, p.y - 100));
        this._m_emitter.setLife(4);

        this._m_emitter.setTexture(cc.TextureCache.sharedTextureCache().addImage(s_fire));
        this._m_emitter.setShapeType(cc.kParticleBallShape);
        this.setEmitterPosition();
    },
    title:function () {
        return "ParticleRain";
    }
});

var DemoModernArt = ParticleDemo.extend({
    onEnter:function () {
        this._super();

        //FIXME: If use CCParticleSystemPoint, bada 1.0 device will crash.
        //  Crash place: CCParticleSystemPoint.cpp Line 149, function: glDrawArrays(GL_POINTS, 0, this._m_uParticleIdx);
        //  this._m_emitter = new CCParticleSystemPoint();
        this._m_emitter = new cc.ParticleSystemQuad();
        //this._m_emitter.initWithTotalParticles(1000);
        this._m_emitter.initWithTotalParticles(200);
        //this._m_emitter.autorelease();

        this._m_background.addChild(this._m_emitter, 10);
        ////this._m_emitter.release();

        var s = cc.Director.sharedDirector().getWinSize();

        // duration
        this._m_emitter.setDuration(-1);

        // gravity
        this._m_emitter.setGravity(cc.PointMake(0, 0));

        // angle
        this._m_emitter.setAngle(0);
        this._m_emitter.setAngleVar(360);

        // radial
        this._m_emitter.setRadialAccel(70);
        this._m_emitter.setRadialAccelVar(10);

        // tagential
        this._m_emitter.setTangentialAccel(80);
        this._m_emitter.setTangentialAccelVar(0);

        // speed of particles
        this._m_emitter.setSpeed(50);
        this._m_emitter.setSpeedVar(10);

        // emitter position
        this._m_emitter.setPosition(cc.PointMake(s.width / 2, s.height / 2));
        this._m_emitter.setPosVar(cc.PointZero());

        // life of particles
        this._m_emitter.setLife(2.0);
        this._m_emitter.setLifeVar(0.3);

        // emits per frame
        this._m_emitter.setEmissionRate(this._m_emitter.getTotalParticles() / this._m_emitter.getLife());

        // color of particles
        var startColor = new cc.Color4F(0.5, 0.5, 0.5, 1.0);
        this._m_emitter.setStartColor(startColor);

        var startColorVar = new cc.Color4F(0.5, 0.5, 0.5, 1.0);
        this._m_emitter.setStartColorVar(startColorVar);

        var endColor = new cc.Color4F(0.1, 0.1, 0.1, 0.2);
        this._m_emitter.setEndColor(endColor);

        var endColorVar = new cc.Color4F(0.1, 0.1, 0.1, 0.2);
        this._m_emitter.setEndColorVar(endColorVar);

        // size, in pixels
        this._m_emitter.setStartSize(1.0);
        this._m_emitter.setStartSizeVar(1.0);
        this._m_emitter.setEndSize(32.0);
        this._m_emitter.setEndSizeVar(8.0);

        // texture
        this._m_emitter.setTexture(cc.TextureCache.sharedTextureCache().addImage(s_fire));
        this._m_emitter.setShapeType(cc.kParticleBallShape);
        // additive
        this._m_emitter.setIsBlendAdditive(false);

        this.setEmitterPosition();
    },
    title:function () {
        return "Varying size";
    }
});

var DemoRing = ParticleDemo.extend({
    onEnter:function () {
        this._super();

        this._m_emitter = cc.ParticleFlower.node();

        this._m_background.addChild(this._m_emitter, 10);

        this._m_emitter.setTexture(cc.TextureCache.sharedTextureCache().addImage(s_stars1));
        this._m_emitter.setShapeType(cc.kParticleStarShape);

        this._m_emitter.setLifeVar(0);
        this._m_emitter.setLife(10);
        this._m_emitter.setSpeed(100);
        this._m_emitter.setSpeedVar(0);
        this._m_emitter.setEmissionRate(10000);

        this.setEmitterPosition();
    },
    title:function () {
        return "Ring Demo";
    }
});

var ParallaxParticle = ParticleDemo.extend({
    onEnter:function () {
        this._super();

        this._m_background.getParent().removeChild(this._m_background, true);
        this._m_background = null;

        //TODO
        var p = cc.ParallaxNode.node();
        this.addChild(p, 5);

        var p1 = cc.Sprite.spriteWithFile(s_back3);
        var p2 = cc.Sprite.spriteWithFile(s_back3);

        p.addChild(p1, 1, cc.PointMake(0.5, 1), cc.PointMake(0, 250));
        p.addChild(p2, 2, cc.PointMake(1.5, 1), cc.PointMake(0, 50));

        this._m_emitter = cc.ParticleFlower.node();
        this._m_emitter.setTexture(cc.TextureCache.sharedTextureCache().addImage(s_fire));

        p1.addChild(this._m_emitter, 10);
        this._m_emitter.setPosition(cc.PointMake(250, 200));

        var par = cc.ParticleSun.node();
        p2.addChild(par, 10);
        par.setTexture(cc.TextureCache.sharedTextureCache().addImage(s_fire));

        var move = cc.MoveBy.actionWithDuration(4, cc.PointMake(300, 0));
        var move_back = move.reverse();
        var seq = cc.Sequence.actions(move, move_back, null);
        p.runAction(cc.RepeatForever.actionWithAction(seq));
    },
    title:function () {
        return "Parallax + Particles";
    }
});

var DemoParticleFromFile = ParticleDemo.extend({
    m_title:"",
    ctor:function (filename) {
        this._super();
        this.m_title = filename;
    },
    onEnter:function () {
        this._super();

        this.setColor(cc.BLACK());
        this.removeChild(this._m_background, true);
        this._m_background = null;

        this._m_emitter = new cc.ParticleSystemQuad();
        var filename = "Resources/Images/" + this.m_title + ".plist";
        this._m_emitter.initWithFile(filename);
        this.addChild(this._m_emitter, 10);

        this.setEmitterPosition();
    },
    title:function () {
        return this.m_title;
    }
});

var RadiusMode1 = ParticleDemo.extend({
    onEnter:function () {
        this._super();

        this.setColor(cc.BLACK());
        this.removeChild(this._m_background, true);
        this._m_background = null;

        this._m_emitter = new cc.ParticleSystemQuad();
        //this._m_emitter.initWithTotalParticles(200);
        this._m_emitter.initWithTotalParticles(150);
        this.addChild(this._m_emitter, 10);
        this._m_emitter.setTexture(cc.TextureCache.sharedTextureCache().addImage(s_starsGrayscale));

        // duration
        this._m_emitter.setDuration(cc.kCCParticleDurationInfinity);

        // radius mode
        this._m_emitter.setEmitterMode(cc.kCCParticleModeRadius);

        // radius mode: start and end radius in pixels
        this._m_emitter.setStartRadius(0);
        this._m_emitter.setStartRadiusVar(0);
        this._m_emitter.setEndRadius(160);
        this._m_emitter.setEndRadiusVar(0);

        // radius mode: degrees per second
        this._m_emitter.setRotatePerSecond(180);
        this._m_emitter.setRotatePerSecondVar(0);


        // angle
        this._m_emitter.setAngle(90);
        this._m_emitter.setAngleVar(0);

        // emitter position
        var size = cc.Director.sharedDirector().getWinSize();
        this._m_emitter.setPosition(cc.ccp(size.width / 2, size.height / 2));
        this._m_emitter.setPosVar(cc.PointZero());

        // life of particles
        this._m_emitter.setLife(5);
        this._m_emitter.setLifeVar(0);

        // spin of particles
        this._m_emitter.setStartSpin(0);
        this._m_emitter.setStartSpinVar(0);
        this._m_emitter.setEndSpin(0);
        this._m_emitter.setEndSpinVar(0);

        // color of particles
        var startColor = new cc.Color4F(0.5, 0.5, 0.5, 1.0);
        this._m_emitter.setStartColor(startColor);

        var startColorVar = new cc.Color4F(0.5, 0.5, 0.5, 1.0);
        this._m_emitter.setStartColorVar(startColorVar);

        var endColor = new cc.Color4F(0.1, 0.1, 0.1, 0.2);
        this._m_emitter.setEndColor(endColor);

        var endColorVar = new cc.Color4F(0.1, 0.1, 0.1, 0.2);
        this._m_emitter.setEndColorVar(endColorVar);

        // size, in pixels
        this._m_emitter.setStartSize(32);
        this._m_emitter.setStartSizeVar(0);
        this._m_emitter.setEndSize(cc.kCCParticleStartSizeEqualToEndSize);

        // emits per second
        this._m_emitter.setEmissionRate(this._m_emitter.getTotalParticles() / this._m_emitter.getLife());

        // additive
        this._m_emitter.setIsBlendAdditive(false);
    },
    title:function () {
        return "Radius Mode: Spiral";
    }
});

var RadiusMode2 = ParticleDemo.extend({
    onEnter:function () {
        this._super();

        this.setColor(cc.BLACK());
        this.removeChild(this._m_background, true);
        this._m_background = null;

        this._m_emitter = new cc.ParticleSystemQuad();
        this._m_emitter.initWithTotalParticles(200);
        this.addChild(this._m_emitter, 10);
        this._m_emitter.setTexture(cc.TextureCache.sharedTextureCache().addImage(s_starsGrayscale));

        // duration
        this._m_emitter.setDuration(cc.kCCParticleDurationInfinity);

        // radius mode
        this._m_emitter.setEmitterMode(cc.kCCParticleModeRadius);

        // radius mode: start and end radius in pixels
        this._m_emitter.setStartRadius(100);
        this._m_emitter.setStartRadiusVar(0);
        this._m_emitter.setEndRadius(cc.kCCParticleStartRadiusEqualToEndRadius);
        this._m_emitter.setEndRadiusVar(0);

        // radius mode: degrees per second
        this._m_emitter.setRotatePerSecond(45);
        this._m_emitter.setRotatePerSecondVar(0);


        // angle
        this._m_emitter.setAngle(90);
        this._m_emitter.setAngleVar(0);

        // emitter position
        var size = cc.Director.sharedDirector().getWinSize();
        this._m_emitter.setPosition(cc.ccp(size.width / 2, size.height / 2));
        this._m_emitter.setPosVar(cc.PointZero());

        // life of particles
        this._m_emitter.setLife(4);
        this._m_emitter.setLifeVar(0);

        // spin of particles
        this._m_emitter.setStartSpin(0);
        this._m_emitter.setStartSpinVar(0);
        this._m_emitter.setEndSpin(0);
        this._m_emitter.setEndSpinVar(0);

        // color of particles
        var startColor = new cc.Color4F(0.5, 0.5, 0.5, 1.0);
        this._m_emitter.setStartColor(startColor);

        var startColorVar = new cc.Color4F(0.5, 0.5, 0.5, 1.0);
        this._m_emitter.setStartColorVar(startColorVar);

        var endColor = new cc.Color4F(0.1, 0.1, 0.1, 0.2);
        this._m_emitter.setEndColor(endColor);

        var endColorVar = new cc.Color4F(0.1, 0.1, 0.1, 0.2);
        this._m_emitter.setEndColorVar(endColorVar);

        // size, in pixels
        this._m_emitter.setStartSize(32);
        this._m_emitter.setStartSizeVar(0);
        this._m_emitter.setEndSize(cc.kCCParticleStartSizeEqualToEndSize);

        // emits per second
        this._m_emitter.setEmissionRate(this._m_emitter.getTotalParticles() / this._m_emitter.getLife());

        // additive
        this._m_emitter.setIsBlendAdditive(false);
    },
    title:function () {
        return "Radius Mode: Semi Circle";
    }
});

var Issue704 = ParticleDemo.extend({
    onEnter:function () {
        this._super();

        this.setColor(cc.BLACK());
        this.removeChild(this._m_background, true);
        this._m_background = null;

        this._m_emitter = new cc.ParticleSystemQuad();
        this._m_emitter.initWithTotalParticles(100);
        this.addChild(this._m_emitter, 10);
        this._m_emitter.setTexture(cc.TextureCache.sharedTextureCache().addImage(s_fire));
        this._m_emitter.setShapeType(cc.kParticleBallShape);
        // duration
        this._m_emitter.setDuration(cc.kCCParticleDurationInfinity);

        // radius mode
        //this._m_emitter.setEmitterMode(cc.kCCParticleModeRadius);

        // radius mode: start and end radius in pixels
        this._m_emitter.setStartRadius(50);
        this._m_emitter.setStartRadiusVar(0);
        this._m_emitter.setEndRadius(cc.kCCParticleStartRadiusEqualToEndRadius);
        this._m_emitter.setEndRadiusVar(0);

        // radius mode: degrees per second
        this._m_emitter.setRotatePerSecond(0);
        this._m_emitter.setRotatePerSecondVar(0);


        // angle
        this._m_emitter.setAngle(90);
        this._m_emitter.setAngleVar(0);

        // emitter position
        var size = cc.Director.sharedDirector().getWinSize();
        this._m_emitter.setPosition(cc.ccp(size.width / 2, size.height / 2));
        this._m_emitter.setPosVar(cc.PointZero());

        // life of particles
        this._m_emitter.setLife(5);
        this._m_emitter.setLifeVar(0);

        // spin of particles
        this._m_emitter.setStartSpin(0);
        this._m_emitter.setStartSpinVar(0);
        this._m_emitter.setEndSpin(0);
        this._m_emitter.setEndSpinVar(0);

        // color of particles
        var startColor = new cc.Color4F(0.5, 0.5, 0.5, 1.0);
        this._m_emitter.setStartColor(startColor);

        var startColorVar = new cc.Color4F(0.5, 0.5, 0.5, 1.0);
        this._m_emitter.setStartColorVar(startColorVar);

        var endColor = new cc.Color4F(0.1, 0.1, 0.1, 0.2);
        this._m_emitter.setEndColor(endColor);

        var endColorVar = new cc.Color4F(0.1, 0.1, 0.1, 0.2);
        this._m_emitter.setEndColorVar(endColorVar);

        // size, in pixels
        this._m_emitter.setStartSize(16);
        this._m_emitter.setStartSizeVar(0);
        this._m_emitter.setEndSize(cc.kCCParticleStartSizeEqualToEndSize);

        // emits per second
        this._m_emitter.setEmissionRate(this._m_emitter.getTotalParticles() / this._m_emitter.getLife());

        // additive
        this._m_emitter.setIsBlendAdditive(false);

        var rot = cc.RotateBy.actionWithDuration(16, 360);
        this._m_emitter.runAction(cc.RepeatForever.actionWithAction(rot));
    },
    title:function () {
        return "Issue 704. Free + Rot";
    },
    subtitle:function () {
        return "Emitted particles should not rotate";
    }
});

var Issue870 = ParticleDemo.extend({
    _m_nIndex:0,
    onEnter:function () {
        this._super();

        this.setColor(cc.BLACK());
        this.removeChild(this._m_background, true);
        this._m_background = null;

        var system = new cc.ParticleSystemQuad();
        system.initWithFile("Images/SpinningPeas.plist");
        system.setTextureWithRect(cc.TextureCache.sharedTextureCache().addImage("Images/particles.png"), cc.RectMake(0, 0, 32, 32));
        this.addChild(system, 10);
        this._m_emitter = system;

        this._m_nIndex = 0;
        this.schedule(this.updateQuads, 2.0);
    },
    title:function () {
        return "Issue 870. SubRect";
    },
    subtitle:function () {
        return "Every 2 seconds the particle should change";
    },
    updateQuads:function (dt) {
        this._m_nIndex = (this._m_nIndex + 1) % 4;
        var rect = cc.RectMake(this._m_nIndex * 32, 0, 32, 32);
        this._m_emitter.setTextureWithRect(this._m_emitter.getTexture(), rect);
    }
});