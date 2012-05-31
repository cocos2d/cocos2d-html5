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
var TAG_LABEL_ATLAS = 1;

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

var createParticleLayer = function (index) {
    switch (index) {
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
    _emitter:null,
    _background:null,
    _shapeModeButton:null,
    _textureModeButton:null,

    ctor:function () {
        this._super();
        this.initWithColor(cc.ccc4(127, 127, 127, 255));

        this._emitter = null;

        this.setIsTouchEnabled(true);

        var s = cc.Director.sharedDirector().getWinSize();
        var label = cc.LabelTTF.labelWithString(this.title(), "Arial", 28);
        this.addChild(label, 100, 1000);
        label.setPosition(cc.PointMake(s.width / 2, s.height - 50));

        var tapScreen = cc.LabelTTF.labelWithString("(Tap the Screen)", "Arial", 20);
        tapScreen.setPosition(cc.PointMake(s.width / 2, s.height - 80));
        this.addChild(tapScreen, 100);
        var selfPoint = this;
        var item1 = cc.MenuItemImage.itemFromNormalImage(s_pathB1, s_pathB2, this, this.backCallback);
        var item2 = cc.MenuItemImage.itemFromNormalImage(s_pathR1, s_pathR2, this, function(){selfPoint._emitter.resetSystem();}
            /*function () {
                if (selfPoint._emitter.getPositionType() == cc.CCPARTICLE_TYPE_GROUPED)
                    selfPoint._emitter.setPositionType(cc.CCPARTICLE_TYPE_FREE);
                else if (selfPoint._emitter.getPositionType() == cc.CCPARTICLE_TYPE_FREE)
                    selfPoint._emitter.setPositionType(cc.CCPARTICLE_TYPE_RELATIVE);
                else if (selfPoint._emitter.getPositionType() == cc.CCPARTICLE_TYPE_RELATIVE)
                    selfPoint._emitter.setPositionType(cc.CCPARTICLE_TYPE_GROUPED);
            }*/
        );
        var item3 = cc.MenuItemImage.itemFromNormalImage(s_pathF1, s_pathF2, this, this.nextCallback);

        //var item4 = cc.MenuItemToggle.itemWithTarget(	this,
        //    this.toggleCallback,
        //    cc.MenuItemFont.itemFromString("Free Movement"),
        //    cc.MenuItemFont.itemFromString("Relative Movement"),
        //    cc.MenuItemFont.itemFromString("Grouped Movement"),
        //    null);

        var spriteNormal = cc.Sprite.spriteWithFile(s_shapeModeMenuItem, cc.RectMake(0, 23 * 2, 115, 23));
        var spriteSelected = cc.Sprite.spriteWithFile(s_shapeModeMenuItem, cc.RectMake(0, 23, 115, 23));
        var spriteDisabled = cc.Sprite.spriteWithFile(s_shapeModeMenuItem, cc.RectMake(0, 0, 115, 23));

        this._shapeModeButton = cc.MenuItemSprite.itemFromNormalSprite(spriteNormal, spriteSelected, spriteDisabled, this,
            function(){
                selfPoint._emitter.setDrawMode(cc.PARTICLE_TEXTURE_MODE);
                selfPoint._textureModeButton.setIsVisible(true);
                selfPoint._shapeModeButton.setIsVisible(false);
            });
        this._shapeModeButton.setPosition( new cc.Point(10,100));
        this._shapeModeButton.setAnchorPoint( cc.PointMake(0,0) );

        var spriteNormal_t = cc.Sprite.spriteWithFile(s_textureModeMenuItem, cc.RectMake(0, 23 * 2, 115, 23));
        var spriteSelected_t = cc.Sprite.spriteWithFile(s_textureModeMenuItem, cc.RectMake(0, 23, 115, 23));
        var spriteDisabled_t = cc.Sprite.spriteWithFile(s_textureModeMenuItem, cc.RectMake(0, 0, 115, 23));

        this._textureModeButton = cc.MenuItemSprite.itemFromNormalSprite(spriteNormal_t, spriteSelected_t, spriteDisabled_t, this,
            function(){
                selfPoint._emitter.setDrawMode(cc.PARTICLE_SHAPE_MODE);
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
        this.addChild(labelAtlas, 100, TAG_LABEL_ATLAS);
        labelAtlas.setPosition(cc.PointMake(s.width - 66, 50));

        // moving background
        this._background = cc.Sprite.spriteWithFile(s_back3);
        this.addChild(this._background, 5);
        this._background.setPosition(cc.PointMake(s.width / 2, s.height - 180));

        var move = cc.MoveBy.actionWithDuration(4, cc.PointMake(300, 0));
        var move_back = move.reverse();
        var seq = cc.Sequence.actions(move, move_back, null);
        this._background.runAction(cc.RepeatForever.actionWithAction(seq));

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

    restartCallback:function (sender) {
        this._emitter.resetSystem();
    },
    nextCallback:function (sender) {
        var s = new ParticleTestScene();
        s.addChild(nextParticleAction());
        cc.Director.sharedDirector().replaceScene(s);
    },
    backCallback:function (sender) {
        var s = new ParticleTestScene();
        s.addChild(backParticleAction());
        cc.Director.sharedDirector().replaceScene(s);
    },
    toggleCallback:function (sender) {
        if (this._emitter.getPositionType() == cc.CCPARTICLE_TYPE_GROUPED)
            this._emitter.setPositionType(cc.CCPARTICLE_TYPE_FREE);
        else if (this._emitter.getPositionType() == cc.CCPARTICLE_TYPE_FREE)
            this._emitter.setPositionType(cc.CCPARTICLE_TYPE_RELATIVE);
        else if (this._emitter.getPositionType() == cc.CCPARTICLE_TYPE_RELATIVE)
            this._emitter.setPositionType(cc.CCPARTICLE_TYPE_GROUPED);
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
        if (this._background) {
            pos = this._background.convertToWorldSpace(cc.PointZero());
        }
        this._emitter.setPosition(cc.ccpSub(location, pos));
    },

    step:function (dt) {
        if (this._emitter) {
            var atlas = this.getChildByTag(TAG_LABEL_ATLAS);
            atlas.setString(this._emitter.getParticleCount().toFixed(0));
        }
    },
    setEmitterPosition:function () {
        var s = cc.Director.sharedDirector().getWinSize();
        this._emitter.setPosition(cc.PointMake(s.width / 2, s.height / 2));
    }
});

var DemoFirework = ParticleDemo.extend({
    onEnter:function () {
        this._super();

        this._emitter = cc.ParticleFireworks.node();
        this._background.addChild(this._emitter, 10);
        var myTexture = cc.TextureCache.sharedTextureCache().addImage(s_stars1);
        this._emitter.setTexture(myTexture);
        this._emitter.setShapeType(cc.PARTICLE_STAR_SHAPE);
        this.setEmitterPosition();
    },
    title:function () {
        return "ParticleFireworks";
    }
});

var DemoFire = ParticleDemo.extend({
    onEnter:function () {
        this._super();

        this._emitter = cc.ParticleFire.node();
        this._background.addChild(this._emitter, 10);

        this._emitter.setTexture(cc.TextureCache.sharedTextureCache().addImage(s_fire));//.pvr"];
        this._emitter.setShapeType(cc.PARTICLE_BALL_SHAPE);
        var p = this._emitter.getPosition();
        this._emitter.setPosition(cc.PointMake(p.x, 100));

        this.setEmitterPosition();
    },
    title:function () {
        return "ParticleFire";
    }
});

var DemoSun = ParticleDemo.extend({
    onEnter:function () {
        this._super();

        this._emitter = cc.ParticleSun.node();
        this._background.addChild(this._emitter, 10);
        var myTexture = cc.TextureCache.sharedTextureCache().addImage(s_fire);
        this._emitter.setTexture(myTexture);
        this._emitter.setShapeType(cc.PARTICLE_BALL_SHAPE);
        this.setEmitterPosition();
    },
    title:function () {
        return "ParticleSun";
    }
});

var DemoGalaxy = ParticleDemo.extend({
    onEnter:function () {
        this._super();

        this._emitter = cc.ParticleGalaxy.node();
        this._background.addChild(this._emitter, 10);
        var myTexture = cc.TextureCache.sharedTextureCache().addImage(s_fire);
        this._emitter.setTexture(myTexture);
        this._emitter.setShapeType(cc.PARTICLE_BALL_SHAPE);
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

        this._emitter = cc.ParticleFlower.node();
        this._background.addChild(this._emitter, 10);

        var myTexture = cc.TextureCache.sharedTextureCache().addImage(s_stars1);
        this._emitter.setTexture(myTexture);
        this._emitter.setShapeType(cc.PARTICLE_STAR_SHAPE);
        this.setEmitterPosition();
    },
    title:function () {
        return "ParticleFlower";
    }
});

var DemoBigFlower = ParticleDemo.extend({
    onEnter:function () {
        this._super();

        this._emitter = new cc.ParticleSystemQuad();
        this._emitter.initWithTotalParticles(50);
        //this._emitter.autorelease();

        this._background.addChild(this._emitter, 10);
        this._emitter.setTexture(cc.TextureCache.sharedTextureCache().addImage(s_stars1));
        this._emitter.setShapeType(cc.PARTICLE_STAR_SHAPE);
        this._emitter.setDuration(-1);

        // gravity
        this._emitter.setGravity(cc.PointZero());

        // angle
        this._emitter.setAngle(90);
        this._emitter.setAngleVar(360);

        // speed of particles
        this._emitter.setSpeed(160);
        this._emitter.setSpeedVar(20);

        // radial
        this._emitter.setRadialAccel(-120);
        this._emitter.setRadialAccelVar(0);

        // tagential
        this._emitter.setTangentialAccel(30);
        this._emitter.setTangentialAccelVar(0);

        // emitter position
        this._emitter.setPosition(cc.PointMake(160, 240));
        this._emitter.setPosVar(cc.PointZero());

        // life of particles
        this._emitter.setLife(4);
        this._emitter.setLifeVar(1);

        // spin of particles
        this._emitter.setStartSpin(0);
        this._emitter.setStartSizeVar(0);
        this._emitter.setEndSpin(0);
        this._emitter.setEndSpinVar(0);

        // color of particles
        var startColor = new cc.Color4F(0.5, 0.5, 0.5, 1.0);
        this._emitter.setStartColor(startColor);

        var startColorVar = new cc.Color4F(0.5, 0.5, 0.5, 1.0);
        this._emitter.setStartColorVar(startColorVar);

        var endColor = new cc.Color4F(0.1, 0.1, 0.1, 0.2);
        this._emitter.setEndColor(endColor);

        var endColorVar = new cc.Color4F(0.1, 0.1, 0.1, 0.2);
        this._emitter.setEndColorVar(endColorVar);

        // size, in pixels
        this._emitter.setStartSize(80.0);
        this._emitter.setStartSizeVar(40.0);
        this._emitter.setEndSize(cc.PARTICLE_START_SIZE_EQUAL_TO_END_SIZE);

        // emits per second
        this._emitter.setEmissionRate(this._emitter.getTotalParticles() / this._emitter.getLife());

        // additive
        this._emitter.setIsBlendAdditive(true);

        this.setEmitterPosition();
    },
    title:function () {
        return "ParticleBigFlower";
    }
});

var DemoRotFlower = ParticleDemo.extend({
    onEnter:function () {
        this._super();

        this._emitter = new cc.ParticleSystemQuad();
        //this._emitter.initWithTotalParticles(300);
        this._emitter.initWithTotalParticles(150);

        this._background.addChild(this._emitter, 10);
        this._emitter.setTexture(cc.TextureCache.sharedTextureCache().addImage(s_stars2));
        this._emitter.setShapeType(cc.PARTICLE_STAR_SHAPE);
        // duration
        this._emitter.setDuration(-1);

        // gravity
        this._emitter.setGravity(cc.PointZero());

        // angle
        this._emitter.setAngle(90);
        this._emitter.setAngleVar(360);

        // speed of particles
        this._emitter.setSpeed(160);
        this._emitter.setSpeedVar(20);

        // radial
        this._emitter.setRadialAccel(-120);
        this._emitter.setRadialAccelVar(0);

        // tagential
        this._emitter.setTangentialAccel(30);
        this._emitter.setTangentialAccelVar(0);

        // emitter position
        this._emitter.setPosition(cc.PointMake(160, 240));
        this._emitter.setPosVar(cc.PointZero());

        // life of particles
        this._emitter.setLife(3);
        this._emitter.setLifeVar(1);

        // spin of particles
        this._emitter.setStartSpin(0);
        this._emitter.setStartSpinVar(0);
        this._emitter.setEndSpin(0);
        this._emitter.setEndSpinVar(2000);

        var startColor = new cc.Color4F(0.5, 0.5, 0.5, 1.0);
        this._emitter.setStartColor(startColor);

        var startColorVar = new cc.Color4F(0.5, 0.5, 0.5, 1.0);
        this._emitter.setStartColorVar(startColorVar);

        var endColor = new cc.Color4F(0.1, 0.1, 0.1, 0.2);
        this._emitter.setEndColor(endColor);

        var endColorVar = new cc.Color4F(0.1, 0.1, 0.1, 0.2);
        this._emitter.setEndColorVar(endColorVar);

        // size, in pixels
        this._emitter.setStartSize(30.0);
        this._emitter.setStartSizeVar(0);
        this._emitter.setEndSize(cc.PARTICLE_START_SIZE_EQUAL_TO_END_SIZE);

        // emits per second
        this._emitter.setEmissionRate(this._emitter.getTotalParticles() / this._emitter.getLife());

        // additive
        this._emitter.setIsBlendAdditive(false);

        this.setEmitterPosition();
    },
    title:function () {
        return "ParticleRotFlower";
    }
});

var DemoMeteor = ParticleDemo.extend({
    onEnter:function () {
        this._super();

        this._emitter = cc.ParticleMeteor.node();
        this._background.addChild(this._emitter, 10);

        this._emitter.setTexture(cc.TextureCache.sharedTextureCache().addImage(s_fire));
        this._emitter.setShapeType(cc.PARTICLE_BALL_SHAPE);
        this.setEmitterPosition();
    },
    title:function () {
        return "ParticleMeteor";
    }
});

var DemoSpiral = ParticleDemo.extend({
    onEnter:function () {
        this._super();

        this._emitter = cc.ParticleSpiral.node();
        this._background.addChild(this._emitter, 10);

        this._emitter.setTexture(cc.TextureCache.sharedTextureCache().addImage(s_fire));
        this._emitter.setShapeType(cc.PARTICLE_BALL_SHAPE);
        this.setEmitterPosition();
    },
    title:function () {
        return "ParticleSpiral";
    }
});

var DemoExplosion = ParticleDemo.extend({
    onEnter:function () {
        this._super();

        this._emitter = cc.ParticleExplosion.node();
        this._background.addChild(this._emitter, 10);

        this._emitter.setTexture(cc.TextureCache.sharedTextureCache().addImage(s_stars1));
        this._emitter.setShapeType(cc.PARTICLE_STAR_SHAPE);
        this._emitter.setIsAutoRemoveOnFinish(true);

        this.setEmitterPosition();
    },
    title:function () {
        return "ParticleExplosion";
    }
});

var DemoSmoke = ParticleDemo.extend({
    onEnter:function () {
        this._super();

        this._emitter = cc.ParticleSmoke.node();
        this._background.addChild(this._emitter, 10);
        this._emitter.setTexture(cc.TextureCache.sharedTextureCache().addImage(s_fire));

        var p = this._emitter.getPosition();
        this._emitter.setPosition(cc.PointMake(p.x, 100));

        this.setEmitterPosition();
    },
    title:function () {
        return "ParticleSmoke";
    }
});

var DemoSnow = ParticleDemo.extend({
    onEnter:function () {
        this._super();

        this._emitter = cc.ParticleSnow.node();
        this._background.addChild(this._emitter, 10);

        var p = this._emitter.getPosition();
        this._emitter.setPosition(cc.PointMake(p.x, p.y - 110));
        this._emitter.setLife(3);
        this._emitter.setLifeVar(1);

        // gravity
        this._emitter.setGravity(cc.PointMake(0, -10));

        // speed of particles
        this._emitter.setSpeed(130);
        this._emitter.setSpeedVar(30);


        var startColor = this._emitter.getStartColor();
        startColor.r = 0.9;
        startColor.g = 0.9;
        startColor.b = 0.9;
        this._emitter.setStartColor(startColor);

        var startColorVar = this._emitter.getStartColorVar();
        startColorVar.b = 0.1;
        this._emitter.setStartColorVar(startColorVar);

        this._emitter.setEmissionRate(this._emitter.getTotalParticles() / this._emitter.getLife());

        this._emitter.setTexture(cc.TextureCache.sharedTextureCache().addImage(s_snow));
        this._emitter.setShapeType(cc.PARTICLE_STAR_SHAPE);

        this.setEmitterPosition();
    },
    title:function () {
        return "ParticleSnow";
    }
});

var DemoRain = ParticleDemo.extend({
    onEnter:function () {
        this._super();

        this._emitter = cc.ParticleRain.node();
        this._background.addChild(this._emitter, 10);

        var p = this._emitter.getPosition();
        this._emitter.setPosition(cc.PointMake(p.x, p.y - 100));
        this._emitter.setLife(4);

        this._emitter.setTexture(cc.TextureCache.sharedTextureCache().addImage(s_fire));
        this._emitter.setShapeType(cc.PARTICLE_BALL_SHAPE);
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
        //  Crash place: CCParticleSystemPoint.cpp Line 149, function: glDrawArrays(GL_POINTS, 0, this._particleIdx);
        //  this._emitter = new CCParticleSystemPoint();
        this._emitter = new cc.ParticleSystemQuad();
        //this._emitter.initWithTotalParticles(1000);
        this._emitter.initWithTotalParticles(200);
        //this._emitter.autorelease();

        this._background.addChild(this._emitter, 10);
        ////this._emitter.release();

        var s = cc.Director.sharedDirector().getWinSize();

        // duration
        this._emitter.setDuration(-1);

        // gravity
        this._emitter.setGravity(cc.PointMake(0, 0));

        // angle
        this._emitter.setAngle(0);
        this._emitter.setAngleVar(360);

        // radial
        this._emitter.setRadialAccel(70);
        this._emitter.setRadialAccelVar(10);

        // tagential
        this._emitter.setTangentialAccel(80);
        this._emitter.setTangentialAccelVar(0);

        // speed of particles
        this._emitter.setSpeed(50);
        this._emitter.setSpeedVar(10);

        // emitter position
        this._emitter.setPosition(cc.PointMake(s.width / 2, s.height / 2));
        this._emitter.setPosVar(cc.PointZero());

        // life of particles
        this._emitter.setLife(2.0);
        this._emitter.setLifeVar(0.3);

        // emits per frame
        this._emitter.setEmissionRate(this._emitter.getTotalParticles() / this._emitter.getLife());

        // color of particles
        var startColor = new cc.Color4F(0.5, 0.5, 0.5, 1.0);
        this._emitter.setStartColor(startColor);

        var startColorVar = new cc.Color4F(0.5, 0.5, 0.5, 1.0);
        this._emitter.setStartColorVar(startColorVar);

        var endColor = new cc.Color4F(0.1, 0.1, 0.1, 0.2);
        this._emitter.setEndColor(endColor);

        var endColorVar = new cc.Color4F(0.1, 0.1, 0.1, 0.2);
        this._emitter.setEndColorVar(endColorVar);

        // size, in pixels
        this._emitter.setStartSize(1.0);
        this._emitter.setStartSizeVar(1.0);
        this._emitter.setEndSize(32.0);
        this._emitter.setEndSizeVar(8.0);

        // texture
        this._emitter.setTexture(cc.TextureCache.sharedTextureCache().addImage(s_fire));
        this._emitter.setShapeType(cc.PARTICLE_BALL_SHAPE);
        // additive
        this._emitter.setIsBlendAdditive(false);

        this.setEmitterPosition();
    },
    title:function () {
        return "Varying size";
    }
});

var DemoRing = ParticleDemo.extend({
    onEnter:function () {
        this._super();

        this._emitter = cc.ParticleFlower.node();

        this._background.addChild(this._emitter, 10);

        this._emitter.setTexture(cc.TextureCache.sharedTextureCache().addImage(s_stars1));
        this._emitter.setShapeType(cc.PARTICLE_STAR_SHAPE);

        this._emitter.setLifeVar(0);
        this._emitter.setLife(10);
        this._emitter.setSpeed(100);
        this._emitter.setSpeedVar(0);
        this._emitter.setEmissionRate(10000);

        this.setEmitterPosition();
    },
    title:function () {
        return "Ring Demo";
    }
});

var ParallaxParticle = ParticleDemo.extend({
    onEnter:function () {
        this._super();

        this._background.getParent().removeChild(this._background, true);
        this._background = null;

        //TODO
        var p = cc.ParallaxNode.node();
        this.addChild(p, 5);

        var p1 = cc.Sprite.spriteWithFile(s_back3);
        var p2 = cc.Sprite.spriteWithFile(s_back3);

        p.addChild(p1, 1, cc.PointMake(0.5, 1), cc.PointMake(0, 250));
        p.addChild(p2, 2, cc.PointMake(1.5, 1), cc.PointMake(0, 50));

        this._emitter = cc.ParticleFlower.node();
        this._emitter.setTexture(cc.TextureCache.sharedTextureCache().addImage(s_fire));

        p1.addChild(this._emitter, 10);
        this._emitter.setPosition(cc.PointMake(250, 200));

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
    title:"",
    ctor:function (filename) {
        this._super();
        this.title = filename;
    },
    onEnter:function () {
        this._super();

        this.setColor(cc.BLACK());
        this.removeChild(this._background, true);
        this._background = null;

        this._emitter = new cc.ParticleSystemQuad();
        var filename = "Resources/Images/" + this.title + ".plist";
        this._emitter.initWithFile(filename);
        this.addChild(this._emitter, 10);

        this.setEmitterPosition();
    },
    title:function () {
        return this.title;
    }
});

var RadiusMode1 = ParticleDemo.extend({
    onEnter:function () {
        this._super();

        this.setColor(cc.BLACK());
        this.removeChild(this._background, true);
        this._background = null;

        this._emitter = new cc.ParticleSystemQuad();
        //this._emitter.initWithTotalParticles(200);
        this._emitter.initWithTotalParticles(150);
        this.addChild(this._emitter, 10);
        this._emitter.setTexture(cc.TextureCache.sharedTextureCache().addImage(s_starsGrayscale));

        // duration
        this._emitter.setDuration(cc.CCPARTICLE_DURATION_INFINITY);

        // radius mode
        this._emitter.setEmitterMode(cc.CCPARTICLE_MODE_RADIUS);

        // radius mode: start and end radius in pixels
        this._emitter.setStartRadius(0);
        this._emitter.setStartRadiusVar(0);
        this._emitter.setEndRadius(160);
        this._emitter.setEndRadiusVar(0);

        // radius mode: degrees per second
        this._emitter.setRotatePerSecond(180);
        this._emitter.setRotatePerSecondVar(0);


        // angle
        this._emitter.setAngle(90);
        this._emitter.setAngleVar(0);

        // emitter position
        var size = cc.Director.sharedDirector().getWinSize();
        this._emitter.setPosition(cc.ccp(size.width / 2, size.height / 2));
        this._emitter.setPosVar(cc.PointZero());

        // life of particles
        this._emitter.setLife(5);
        this._emitter.setLifeVar(0);

        // spin of particles
        this._emitter.setStartSpin(0);
        this._emitter.setStartSpinVar(0);
        this._emitter.setEndSpin(0);
        this._emitter.setEndSpinVar(0);

        // color of particles
        var startColor = new cc.Color4F(0.5, 0.5, 0.5, 1.0);
        this._emitter.setStartColor(startColor);

        var startColorVar = new cc.Color4F(0.5, 0.5, 0.5, 1.0);
        this._emitter.setStartColorVar(startColorVar);

        var endColor = new cc.Color4F(0.1, 0.1, 0.1, 0.2);
        this._emitter.setEndColor(endColor);

        var endColorVar = new cc.Color4F(0.1, 0.1, 0.1, 0.2);
        this._emitter.setEndColorVar(endColorVar);

        // size, in pixels
        this._emitter.setStartSize(32);
        this._emitter.setStartSizeVar(0);
        this._emitter.setEndSize(cc.CCPARTICLE_START_SIZE_EQUAL_TO_END_SIZE);

        // emits per second
        this._emitter.setEmissionRate(this._emitter.getTotalParticles() / this._emitter.getLife());

        // additive
        this._emitter.setIsBlendAdditive(false);
    },
    title:function () {
        return "Radius Mode: Spiral";
    }
});

var RadiusMode2 = ParticleDemo.extend({
    onEnter:function () {
        this._super();

        this.setColor(cc.BLACK());
        this.removeChild(this._background, true);
        this._background = null;

        this._emitter = new cc.ParticleSystemQuad();
        this._emitter.initWithTotalParticles(200);
        this.addChild(this._emitter, 10);
        this._emitter.setTexture(cc.TextureCache.sharedTextureCache().addImage(s_starsGrayscale));

        // duration
        this._emitter.setDuration(cc.CCPARTICLE_DURATION_INFINITY);

        // radius mode
        this._emitter.setEmitterMode(cc.CCPARTICLE_MODE_RADIUS);

        // radius mode: start and end radius in pixels
        this._emitter.setStartRadius(100);
        this._emitter.setStartRadiusVar(0);
        this._emitter.setEndRadius(cc.CCPARTICLE_START_RADIUS_EQUAL_TO_END_RADIUS);
        this._emitter.setEndRadiusVar(0);

        // radius mode: degrees per second
        this._emitter.setRotatePerSecond(45);
        this._emitter.setRotatePerSecondVar(0);


        // angle
        this._emitter.setAngle(90);
        this._emitter.setAngleVar(0);

        // emitter position
        var size = cc.Director.sharedDirector().getWinSize();
        this._emitter.setPosition(cc.ccp(size.width / 2, size.height / 2));
        this._emitter.setPosVar(cc.PointZero());

        // life of particles
        this._emitter.setLife(4);
        this._emitter.setLifeVar(0);

        // spin of particles
        this._emitter.setStartSpin(0);
        this._emitter.setStartSpinVar(0);
        this._emitter.setEndSpin(0);
        this._emitter.setEndSpinVar(0);

        // color of particles
        var startColor = new cc.Color4F(0.5, 0.5, 0.5, 1.0);
        this._emitter.setStartColor(startColor);

        var startColorVar = new cc.Color4F(0.5, 0.5, 0.5, 1.0);
        this._emitter.setStartColorVar(startColorVar);

        var endColor = new cc.Color4F(0.1, 0.1, 0.1, 0.2);
        this._emitter.setEndColor(endColor);

        var endColorVar = new cc.Color4F(0.1, 0.1, 0.1, 0.2);
        this._emitter.setEndColorVar(endColorVar);

        // size, in pixels
        this._emitter.setStartSize(32);
        this._emitter.setStartSizeVar(0);
        this._emitter.setEndSize(cc.CCPARTICLE_START_SIZE_EQUAL_TO_END_SIZE);

        // emits per second
        this._emitter.setEmissionRate(this._emitter.getTotalParticles() / this._emitter.getLife());

        // additive
        this._emitter.setIsBlendAdditive(false);
    },
    title:function () {
        return "Radius Mode: Semi Circle";
    }
});

var Issue704 = ParticleDemo.extend({
    onEnter:function () {
        this._super();

        this.setColor(cc.BLACK());
        this.removeChild(this._background, true);
        this._background = null;

        this._emitter = new cc.ParticleSystemQuad();
        this._emitter.initWithTotalParticles(100);
        this.addChild(this._emitter, 10);
        this._emitter.setTexture(cc.TextureCache.sharedTextureCache().addImage(s_fire));
        this._emitter.setShapeType(cc.PARTICLE_BALL_SHAPE);
        // duration
        this._emitter.setDuration(cc.CCPARTICLE_DURATION_INFINITY);

        // radius mode
        //this._emitter.setEmitterMode(cc.CCPARTICLE_MODE_RADIUS);

        // radius mode: start and end radius in pixels
        this._emitter.setStartRadius(50);
        this._emitter.setStartRadiusVar(0);
        this._emitter.setEndRadius(cc.CCPARTICLE_START_RADIUS_EQUAL_TO_END_RADIUS);
        this._emitter.setEndRadiusVar(0);

        // radius mode: degrees per second
        this._emitter.setRotatePerSecond(0);
        this._emitter.setRotatePerSecondVar(0);


        // angle
        this._emitter.setAngle(90);
        this._emitter.setAngleVar(0);

        // emitter position
        var size = cc.Director.sharedDirector().getWinSize();
        this._emitter.setPosition(cc.ccp(size.width / 2, size.height / 2));
        this._emitter.setPosVar(cc.PointZero());

        // life of particles
        this._emitter.setLife(5);
        this._emitter.setLifeVar(0);

        // spin of particles
        this._emitter.setStartSpin(0);
        this._emitter.setStartSpinVar(0);
        this._emitter.setEndSpin(0);
        this._emitter.setEndSpinVar(0);

        // color of particles
        var startColor = new cc.Color4F(0.5, 0.5, 0.5, 1.0);
        this._emitter.setStartColor(startColor);

        var startColorVar = new cc.Color4F(0.5, 0.5, 0.5, 1.0);
        this._emitter.setStartColorVar(startColorVar);

        var endColor = new cc.Color4F(0.1, 0.1, 0.1, 0.2);
        this._emitter.setEndColor(endColor);

        var endColorVar = new cc.Color4F(0.1, 0.1, 0.1, 0.2);
        this._emitter.setEndColorVar(endColorVar);

        // size, in pixels
        this._emitter.setStartSize(16);
        this._emitter.setStartSizeVar(0);
        this._emitter.setEndSize(cc.CCPARTICLE_START_SIZE_EQUAL_TO_END_SIZE);

        // emits per second
        this._emitter.setEmissionRate(this._emitter.getTotalParticles() / this._emitter.getLife());

        // additive
        this._emitter.setIsBlendAdditive(false);

        var rot = cc.RotateBy.actionWithDuration(16, 360);
        this._emitter.runAction(cc.RepeatForever.actionWithAction(rot));
    },
    title:function () {
        return "Issue 704. Free + Rot";
    },
    subtitle:function () {
        return "Emitted particles should not rotate";
    }
});

var Issue870 = ParticleDemo.extend({
    _index:0,
    onEnter:function () {
        this._super();

        this.setColor(cc.BLACK());
        this.removeChild(this._background, true);
        this._background = null;

        var system = new cc.ParticleSystemQuad();
        system.initWithFile("Images/SpinningPeas.plist");
        system.setTextureWithRect(cc.TextureCache.sharedTextureCache().addImage("Images/particles.png"), cc.RectMake(0, 0, 32, 32));
        this.addChild(system, 10);
        this._emitter = system;

        this._index = 0;
        this.schedule(this.updateQuads, 2.0);
    },
    title:function () {
        return "Issue 870. SubRect";
    },
    subtitle:function () {
        return "Every 2 seconds the particle should change";
    },
    updateQuads:function (dt) {
        this._index = (this._index + 1) % 4;
        var rect = cc.RectMake(this._index * 32, 0, 32, 32);
        this._emitter.setTextureWithRect(this._emitter.getTexture(), rect);
    }
});