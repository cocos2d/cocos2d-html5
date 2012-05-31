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

var cc = cc = cc || {};

//! @brief A fire particle system
cc.ParticleFire = cc.ARCH_OPTIMAL_PARTICLE_SYSTEM.extend({
    init:function () {
        return this.initWithTotalParticles(150);
        //return this.initWithTotalParticles(250);
    },
    initWithTotalParticles:function (numberOfParticles) {
        if (this._super(numberOfParticles)) {
            // duration
            this._duration = cc.CCPARTICLE_DURATION_INFINITY;

            // Gravity Mode
            this._emitterMode = cc.CCPARTICLE_MODE_GRAVITY;

            // Gravity Mode: gravity
            this.modeA.gravity = cc.ccp(0, 0);

            // Gravity Mode: radial acceleration
            this.modeA.radialAccel = 0;
            this.modeA.radialAccelVar = 0;

            // Gravity Mode: speed of particles
            this.modeA.speed = 60;
            this.modeA.speedVar = 20;

            // starting angle
            this._angle = 90;
            this._angleVar = 10;

            // emitter position
            var winSize = cc.Director.sharedDirector().getWinSize();
            this.setPosition(cc.ccp(winSize.width / 2, 60));
            this._posVar = cc.ccp(40, 20);

            // life of particles
            this._life = 3;
            this._lifeVar = 0.25;


            // size, in pixels
            this._startSize = 54.0;
            this._startSizeVar = 10.0;
            this._endSize = cc.CCPARTICLE_START_SIZE_EQUAL_TO_END_SIZE;

            // emits per frame
            this._emissionRate = this._totalParticles / this._life;

            // color of particles
            this._startColor.r = 0.76;
            this._startColor.g = 0.25;
            this._startColor.b = 0.12;
            this._startColor.a = 1.0;
            this._startColorVar.r = 0.0;
            this._startColorVar.g = 0.0;
            this._startColorVar.b = 0.0;
            this._startColorVar.a = 0.0;
            this._endColor.r = 0.0;
            this._endColor.g = 0.0;
            this._endColor.b = 0.0;
            this._endColor.a = 1.0;
            this._endColorVar.r = 0.0;
            this._endColorVar.g = 0.0;
            this._endColorVar.b = 0.0;
            this._endColorVar.a = 0.0;

            // additive
            this.setIsBlendAdditive(true);
            return true;
        }
        return false;
    }
});
cc.ParticleFire.node = function () {
    var ret = new cc.ParticleFire();
    if (ret.init()) {
        return ret;
    }
    return null;
};

//! @brief A fireworks particle system
cc.ParticleFireworks = cc.ARCH_OPTIMAL_PARTICLE_SYSTEM.extend({
    init:function () {
        //return this.initWithTotalParticles(1500);
        return this.initWithTotalParticles(150);
    },
    initWithTotalParticles:function (numberOfParticles) {
        if (this._super(numberOfParticles)) {
            // duration
            this._duration = cc.CCPARTICLE_DURATION_INFINITY;

            // Gravity Mode
            this._emitterMode = cc.CCPARTICLE_MODE_GRAVITY;

            // Gravity Mode: gravity
            this.modeA.gravity = cc.ccp(0, -90);

            // Gravity Mode:  radial
            this.modeA.radialAccel = 0;
            this.modeA.radialAccelVar = 0;

            //  Gravity Mode: speed of particles
            this.modeA.speed = 180;
            this.modeA.speedVar = 50;

            // emitter position
            var winSize = cc.Director.sharedDirector().getWinSize();
            this.setPosition(cc.ccp(winSize.width / 2, winSize.height / 2));

            // angle
            this._angle = 90;
            this._angleVar = 20;

            // life of particles
            this._life = 3.5;
            this._lifeVar = 1;

            // emits per frame
            this._emissionRate = this._totalParticles / this._life;

            // color of particles
            this._startColor.r = 0.5;
            this._startColor.g = 0.5;
            this._startColor.b = 0.5;
            this._startColor.a = 1.0;
            this._startColorVar.r = 0.5;
            this._startColorVar.g = 0.5;
            this._startColorVar.b = 0.5;
            this._startColorVar.a = 0.1;
            this._endColor.r = 0.1;
            this._endColor.g = 0.1;
            this._endColor.b = 0.1;
            this._endColor.a = 0.2;
            this._endColorVar.r = 0.1;
            this._endColorVar.g = 0.1;
            this._endColorVar.b = 0.1;
            this._endColorVar.a = 0.2;

            // size, in pixels
            this._startSize = 8.0;
            this._startSizeVar = 2.0;
            this._endSize = cc.CCPARTICLE_START_SIZE_EQUAL_TO_END_SIZE;

            // additive
            this.setIsBlendAdditive(false);
            return true;
        }
        return false;
    }
});
cc.ParticleFireworks.node = function () {
    var ret = new cc.ParticleFireworks();
    if (ret.init()) {
        return ret;
    }
    return null;
};

//! @brief A sun particle system
cc.ParticleSun = cc.ARCH_OPTIMAL_PARTICLE_SYSTEM.extend({
    init:function () {
        //return this.initWithTotalParticles(350);
        return this.initWithTotalParticles(150);
    },
    //
    // ParticleSun
    //
    initWithTotalParticles:function (numberOfParticles) {
        if (this._super(numberOfParticles)) {
            // additive
            this.setIsBlendAdditive(true);

            // duration
            this._duration = cc.CCPARTICLE_DURATION_INFINITY;

            // Gravity Mode
            this._emitterMode = cc.CCPARTICLE_MODE_GRAVITY;

            // Gravity Mode: gravity
            this.modeA.gravity = cc.ccp(0, 0);

            // Gravity mode: radial acceleration
            this.modeA.radialAccel = 0;
            this.modeA.radialAccelVar = 0;

            // Gravity mode: speed of particles
            this.modeA.speed = 20;
            this.modeA.speedVar = 5;


            // angle
            this._angle = 90;
            this._angleVar = 360;

            // emitter position
            var winSize = cc.Director.sharedDirector().getWinSize();
            this.setPosition(cc.ccp(winSize.width / 2, winSize.height / 2));
            this._posVar = cc.PointZero();

            // life of particles
            this._life = 1;
            this._lifeVar = 0.5;

            // size, in pixels
            this._startSize = 30.0;
            this._startSizeVar = 10.0;
            this._endSize = cc.CCPARTICLE_START_SIZE_EQUAL_TO_END_SIZE;

            // emits per seconds
            this._emissionRate = this._totalParticles / this._life;

            // color of particles
            this._startColor.r = 0.76;
            this._startColor.g = 0.25;
            this._startColor.b = 0.12;
            this._startColor.a = 1.0;
            this._startColorVar.r = 0.0;
            this._startColorVar.g = 0.0;
            this._startColorVar.b = 0.0;
            this._startColorVar.a = 0.0;
            this._endColor.r = 0.0;
            this._endColor.g = 0.0;
            this._endColor.b = 0.0;
            this._endColor.a = 1.0;
            this._endColorVar.r = 0.0;
            this._endColorVar.g = 0.0;
            this._endColorVar.b = 0.0;
            this._endColorVar.a = 0.0;

            return true;
        }
        return false;
    }
});
cc.ParticleSun.node = function () {
    var ret = new cc.ParticleSun();
    if (ret.init()) {
        return ret;
    }
    return null;
};

//! @brief A galaxy particle system
cc.ParticleGalaxy = cc.ARCH_OPTIMAL_PARTICLE_SYSTEM.extend({
    init:function () {
        //return this.initWithTotalParticles(200);
        return this.initWithTotalParticles(100);
    },
    //
    // ParticleGalaxy
    //
    initWithTotalParticles:function (numberOfParticles) {
        if (this._super(numberOfParticles)) {
            // duration
            this._duration = cc.CCPARTICLE_DURATION_INFINITY;

            // Gravity Mode
            this._emitterMode = cc.CCPARTICLE_MODE_GRAVITY;

            // Gravity Mode: gravity
            this.modeA.gravity = cc.ccp(0, 0);

            // Gravity Mode: speed of particles
            this.modeA.speed = 60;
            this.modeA.speedVar = 10;

            // Gravity Mode: radial
            this.modeA.radialAccel = -80;
            this.modeA.radialAccelVar = 0;

            // Gravity Mode: tagential
            this.modeA.tangentialAccel = 80;
            this.modeA.tangentialAccelVar = 0;

            // angle
            this._angle = 90;
            this._angleVar = 360;

            // emitter position
            var winSize = cc.Director.sharedDirector().getWinSize();
            this.setPosition(cc.ccp(winSize.width / 2, winSize.height / 2));
            this._posVar = cc.PointZero();

            // life of particles
            this._life = 4;
            this._lifeVar = 1;

            // size, in pixels
            this._startSize = 37.0;
            this._startSizeVar = 10.0;
            this._endSize = cc.CCPARTICLE_START_SIZE_EQUAL_TO_END_SIZE;

            // emits per second
            this._emissionRate = this._totalParticles / this._life;

            // color of particles
            this._startColor.r = 0.12;
            this._startColor.g = 0.25;
            this._startColor.b = 0.76;
            this._startColor.a = 1.0;
            this._startColorVar.r = 0.0;
            this._startColorVar.g = 0.0;
            this._startColorVar.b = 0.0;
            this._startColorVar.a = 0.0;
            this._endColor.r = 0.0;
            this._endColor.g = 0.0;
            this._endColor.b = 0.0;
            this._endColor.a = 1.0;
            this._endColorVar.r = 0.0;
            this._endColorVar.g = 0.0;
            this._endColorVar.b = 0.0;
            this._endColorVar.a = 0.0;

            // additive
            this.setIsBlendAdditive(true);
            return true;
        }
        return false;
    }
});
cc.ParticleGalaxy.node = function () {
    var ret = new cc.ParticleGalaxy();
    if (ret.init()) {
        return ret;
    }
    return null;
};

//! @brief A flower particle system
cc.ParticleFlower = cc.ARCH_OPTIMAL_PARTICLE_SYSTEM.extend({
    init:function () {
        //return this.initWithTotalParticles(250);
        return this.initWithTotalParticles(100);
    },
    //
    // ParticleFlower
    //
    initWithTotalParticles:function (numberOfParticles) {
        if (this._super(numberOfParticles)) {
            // duration
            this._duration = cc.CCPARTICLE_DURATION_INFINITY;

            // Gravity Mode
            this._emitterMode = cc.CCPARTICLE_MODE_GRAVITY;

            // Gravity Mode: gravity
            this.modeA.gravity = cc.ccp(0, 0);

            // Gravity Mode: speed of particles
            this.modeA.speed = 80;
            this.modeA.speedVar = 10;

            // Gravity Mode: radial
            this.modeA.radialAccel = -60;
            this.modeA.radialAccelVar = 0;

            // Gravity Mode: tagential
            this.modeA.tangentialAccel = 15;
            this.modeA.tangentialAccelVar = 0;

            // angle
            this._angle = 90;
            this._angleVar = 360;

            // emitter position
            var winSize = cc.Director.sharedDirector().getWinSize();
            this.setPosition(cc.ccp(winSize.width / 2, winSize.height / 2));
            this._posVar = cc.PointZero();

            // life of particles
            this._life = 4;
            this._lifeVar = 1;

            // size, in pixels
            this._startSize = 30.0;
            this._startSizeVar = 10.0;
            this._endSize = cc.CCPARTICLE_START_SIZE_EQUAL_TO_END_SIZE;

            // emits per second
            this._emissionRate = this._totalParticles / this._life;

            // color of particles
            this._startColor.r = 0.50;
            this._startColor.g = 0.50;
            this._startColor.b = 0.50;
            this._startColor.a = 1.0;
            this._startColorVar.r = 0.5;
            this._startColorVar.g = 0.5;
            this._startColorVar.b = 0.5;
            this._startColorVar.a = 0.5;
            this._endColor.r = 0.0;
            this._endColor.g = 0.0;
            this._endColor.b = 0.0;
            this._endColor.a = 1.0;
            this._endColorVar.r = 0.0;
            this._endColorVar.g = 0.0;
            this._endColorVar.b = 0.0;
            this._endColorVar.a = 0.0;

            // additive
            this.setIsBlendAdditive(true);
            return true;
        }
        return false;
    }
});
cc.ParticleFlower.node = function () {
    var ret = new cc.ParticleFlower();
    if (ret.init()) {
        return ret;
    }
    return null;
};

//! @brief A meteor particle system
cc.ParticleMeteor = cc.ARCH_OPTIMAL_PARTICLE_SYSTEM.extend({
    init:function () {
        //return this.initWithTotalParticles(150);
        return this.initWithTotalParticles(100);
    },
    //
    // ParticleMeteor
    //
    initWithTotalParticles:function (numberOfParticles) {
        if (this._super(numberOfParticles)) {
            // duration
            this._duration = cc.CCPARTICLE_DURATION_INFINITY;

            // Gravity Mode
            this._emitterMode = cc.CCPARTICLE_MODE_GRAVITY;

            // Gravity Mode: gravity
            this.modeA.gravity = cc.ccp(-200, 200);

            // Gravity Mode: speed of particles
            this.modeA.speed = 15;
            this.modeA.speedVar = 5;

            // Gravity Mode: radial
            this.modeA.radialAccel = 0;
            this.modeA.radialAccelVar = 0;

            // Gravity Mode: tagential
            this.modeA.tangentialAccel = 0;
            this.modeA.tangentialAccelVar = 0;

            // angle
            this._angle = 90;
            this._angleVar = 360;

            // emitter position
            var winSize = cc.Director.sharedDirector().getWinSize();
            this.setPosition(cc.ccp(winSize.width / 2, winSize.height / 2));
            this._posVar = cc.PointZero();

            // life of particles
            this._life = 2;
            this._lifeVar = 1;

            // size, in pixels
            this._startSize = 60.0;
            this._startSizeVar = 10.0;
            this._endSize = cc.CCPARTICLE_START_SIZE_EQUAL_TO_END_SIZE;

            // emits per second
            this._emissionRate = this._totalParticles / this._life;

            // color of particles
            this._startColor.r = 0.2;
            this._startColor.g = 0.4;
            this._startColor.b = 0.7;
            this._startColor.a = 1.0;
            this._startColorVar.r = 0.0;
            this._startColorVar.g = 0.0;
            this._startColorVar.b = 0.2;
            this._startColorVar.a = 0.1;
            this._endColor.r = 0.0;
            this._endColor.g = 0.0;
            this._endColor.b = 0.0;
            this._endColor.a = 1.0;
            this._endColorVar.r = 0.0;
            this._endColorVar.g = 0.0;
            this._endColorVar.b = 0.0;
            this._endColorVar.a = 0.0;

            // additive
            this.setIsBlendAdditive(true);
            return true;
        }
        return false;
    }
});
cc.ParticleMeteor.node = function () {
    var ret = new cc.ParticleMeteor();
    if (ret.init()) {
        return ret;
    }
    return null;
};

//! @brief An spiral particle system
cc.ParticleSpiral = cc.ARCH_OPTIMAL_PARTICLE_SYSTEM.extend({
    init:function () {
        //return this.initWithTotalParticles(500);
        return this.initWithTotalParticles(100);
    },
    //
    // ParticleSpiral
    //
    initWithTotalParticles:function (numberOfParticles) {
        if (this._super(numberOfParticles)) {
            // duration
            this._duration = cc.CCPARTICLE_DURATION_INFINITY;

            // Gravity Mode
            this._emitterMode = cc.CCPARTICLE_MODE_GRAVITY;

            // Gravity Mode: gravity
            this.modeA.gravity = cc.ccp(0, 0);

            // Gravity Mode: speed of particles
            this.modeA.speed = 150;
            this.modeA.speedVar = 0;

            // Gravity Mode: radial
            this.modeA.radialAccel = -380;
            this.modeA.radialAccelVar = 0;

            // Gravity Mode: tagential
            this.modeA.tangentialAccel = 45;
            this.modeA.tangentialAccelVar = 0;

            // angle
            this._angle = 90;
            this._angleVar = 0;

            // emitter position
            var winSize = cc.Director.sharedDirector().getWinSize();
            this.setPosition(cc.ccp(winSize.width / 2, winSize.height / 2));
            this._posVar = cc.PointZero();

            // life of particles
            this._life = 12;
            this._lifeVar = 0;

            // size, in pixels
            this._startSize = 20.0;
            this._startSizeVar = 0.0;
            this._endSize = cc.CCPARTICLE_START_SIZE_EQUAL_TO_END_SIZE;

            // emits per second
            this._emissionRate = this._totalParticles / this._life;

            // color of particles
            this._startColor.r = 0.5;
            this._startColor.g = 0.5;
            this._startColor.b = 0.5;
            this._startColor.a = 1.0;
            this._startColorVar.r = 0.5;
            this._startColorVar.g = 0.5;
            this._startColorVar.b = 0.5;
            this._startColorVar.a = 0.0;
            this._endColor.r = 0.5;
            this._endColor.g = 0.5;
            this._endColor.b = 0.5;
            this._endColor.a = 1.0;
            this._endColorVar.r = 0.5;
            this._endColorVar.g = 0.5;
            this._endColorVar.b = 0.5;
            this._endColorVar.a = 0.0;

            // additive
            this.setIsBlendAdditive(false);
            return true;
        }
        return false;
    }
});
cc.ParticleSpiral.node = function () {
    var ret = new cc.ParticleSpiral();
    if (ret.init()) {
        return ret;
    }
    return null;
};

//! @brief An explosion particle system
cc.ParticleExplosion = cc.ARCH_OPTIMAL_PARTICLE_SYSTEM.extend({
    init:function () {
        //return this.initWithTotalParticles(700);
        return this.initWithTotalParticles(300);
    },
    //
    // ParticleExplosion
    //
    initWithTotalParticles:function (numberOfParticles) {
        if (this._super(numberOfParticles)) {
            // duration
            this._duration = 0.1;

            this._emitterMode = cc.CCPARTICLE_MODE_GRAVITY;

            // Gravity Mode: gravity
            this.modeA.gravity = cc.ccp(0, 0);

            // Gravity Mode: speed of particles
            this.modeA.speed = 70;
            this.modeA.speedVar = 40;

            // Gravity Mode: radial
            this.modeA.radialAccel = 0;
            this.modeA.radialAccelVar = 0;

            // Gravity Mode: tagential
            this.modeA.tangentialAccel = 0;
            this.modeA.tangentialAccelVar = 0;

            // angle
            this._angle = 90;
            this._angleVar = 360;

            // emitter position
            var winSize = cc.Director.sharedDirector().getWinSize();
            this.setPosition(cc.ccp(winSize.width / 2, winSize.height / 2));
            this._posVar = cc.PointZero();

            // life of particles
            this._life = 5.0;
            this._lifeVar = 2;

            // size, in pixels
            this._startSize = 15.0;
            this._startSizeVar = 10.0;
            this._endSize = cc.CCPARTICLE_START_SIZE_EQUAL_TO_END_SIZE;

            // emits per second
            this._emissionRate = this._totalParticles / this._duration;

            // color of particles
            this._startColor.r = 0.7;
            this._startColor.g = 0.1;
            this._startColor.b = 0.2;
            this._startColor.a = 1.0;
            this._startColorVar.r = 0.5;
            this._startColorVar.g = 0.5;
            this._startColorVar.b = 0.5;
            this._startColorVar.a = 0.0;
            this._endColor.r = 0.5;
            this._endColor.g = 0.5;
            this._endColor.b = 0.5;
            this._endColor.a = 0.0;
            this._endColorVar.r = 0.5;
            this._endColorVar.g = 0.5;
            this._endColorVar.b = 0.5;
            this._endColorVar.a = 0.0;

            // additive
            this.setIsBlendAdditive(false);
            return true;
        }
        return false;
    }
});
cc.ParticleExplosion.node = function () {
    var ret = new cc.ParticleExplosion();
    if (ret.init()) {
        return ret;
    }
    return null;
};

//! @brief An smoke particle system
cc.ParticleSmoke = cc.ARCH_OPTIMAL_PARTICLE_SYSTEM.extend({
    init:function () {
        //return this.initWithTotalParticles(200);
        return this.initWithTotalParticles(100);
    },
    //
    // ParticleSmoke
    //
    initWithTotalParticles:function (numberOfParticles) {
        if (this._super(numberOfParticles)) {
            // duration
            this._duration = cc.CCPARTICLE_DURATION_INFINITY;

            // Emitter mode: Gravity Mode
            this._emitterMode = cc.CCPARTICLE_MODE_GRAVITY;

            // Gravity Mode: gravity
            this.modeA.gravity = cc.ccp(0, 0);

            // Gravity Mode: radial acceleration
            this.modeA.radialAccel = 0;
            this.modeA.radialAccelVar = 0;

            // Gravity Mode: speed of particles
            this.modeA.speed = 25;
            this.modeA.speedVar = 10;

            // angle
            this._angle = 90;
            this._angleVar = 5;

            // emitter position
            var winSize = cc.Director.sharedDirector().getWinSize();
            this.setPosition(cc.ccp(winSize.width / 2, 0));
            this._posVar = cc.ccp(20, 0);

            // life of particles
            this._life = 4;
            this._lifeVar = 1;

            // size, in pixels
            this._startSize = 60.0;
            this._startSizeVar = 10.0;
            this._endSize = cc.CCPARTICLE_START_SIZE_EQUAL_TO_END_SIZE;

            // emits per frame
            this._emissionRate = this._totalParticles / this._life;

            // color of particles
            this._startColor.r = 0.8;
            this._startColor.g = 0.8;
            this._startColor.b = 0.8;
            this._startColor.a = 1.0;
            this._startColorVar.r = 0.02;
            this._startColorVar.g = 0.02;
            this._startColorVar.b = 0.02;
            this._startColorVar.a = 0.0;
            this._endColor.r = 0.0;
            this._endColor.g = 0.0;
            this._endColor.b = 0.0;
            this._endColor.a = 1.0;
            this._endColorVar.r = 0.0;
            this._endColorVar.g = 0.0;
            this._endColorVar.b = 0.0;
            this._endColorVar.a = 0.0;

            // additive
            this.setIsBlendAdditive(false);
            return true;
        }
        return false;
    }
});
cc.ParticleSmoke.node = function () {
    var ret = new cc.ParticleSmoke();
    if (ret.init()) {
        return ret;
    }
    return null;
};

//! @brief An snow particle system
cc.ParticleSnow = cc.ARCH_OPTIMAL_PARTICLE_SYSTEM.extend({
    init:function () {
        return this.initWithTotalParticles(250);
        //return this.initWithTotalParticles(700);
    },
    //
    // CCParticleSnow
    //
    initWithTotalParticles:function (numberOfParticles) {
        if (this._super(numberOfParticles)) {
            // duration
            this._duration = cc.CCPARTICLE_DURATION_INFINITY;

            // set gravity mode.
            this._emitterMode = cc.CCPARTICLE_MODE_GRAVITY;

            // Gravity Mode: gravity
            this.modeA.gravity = cc.ccp(0, -1);

            // Gravity Mode: speed of particles
            this.modeA.speed = 5;
            this.modeA.speedVar = 1;

            // Gravity Mode: radial
            this.modeA.radialAccel = 0;
            this.modeA.radialAccelVar = 1;

            // Gravity mode: tagential
            this.modeA.tangentialAccel = 0;
            this.modeA.tangentialAccelVar = 1;

            // emitter position
            var winSize = cc.Director.sharedDirector().getWinSize();
            this.setPosition(cc.ccp(winSize.width / 2, winSize.height + 10));
            this._posVar = cc.ccp(winSize.width / 2, 0);

            // angle
            this._angle = -90;
            this._angleVar = 5;

            // life of particles
            this._life = 45;
            this._lifeVar = 15;

            // size, in pixels
            this._startSize = 10.0;
            this._startSizeVar = 5.0;
            this._endSize = cc.CCPARTICLE_START_SIZE_EQUAL_TO_END_SIZE;

            // emits per second
            this._emissionRate = 10;

            // color of particles
            this._startColor.r = 1.0;
            this._startColor.g = 1.0;
            this._startColor.b = 1.0;
            this._startColor.a = 1.0;
            this._startColorVar.r = 0.0;
            this._startColorVar.g = 0.0;
            this._startColorVar.b = 0.0;
            this._startColorVar.a = 0.0;
            this._endColor.r = 1.0;
            this._endColor.g = 1.0;
            this._endColor.b = 1.0;
            this._endColor.a = 0.0;
            this._endColorVar.r = 0.0;
            this._endColorVar.g = 0.0;
            this._endColorVar.b = 0.0;
            this._endColorVar.a = 0.0;

            // additive
            this.setIsBlendAdditive(false);
            return true;
        }
        return false;
    }
});
cc.ParticleSnow.node = function () {
    var ret = new cc.ParticleSnow();
    if (ret.init()) {
        return ret;
    }
    return null;
};

//! @brief A rain particle system
cc.ParticleRain = cc.ARCH_OPTIMAL_PARTICLE_SYSTEM.extend({
    init:function () {
        return this.initWithTotalParticles(300);
        //return this.initWithTotalParticles(1000);
    },
    //
    // CCParticleRain
    //
    initWithTotalParticles:function (numberOfParticles) {
        if (this._super(numberOfParticles)) {
            // duration
            this._duration = cc.CCPARTICLE_DURATION_INFINITY;

            this._emitterMode = cc.CCPARTICLE_MODE_GRAVITY;

            // Gravity Mode: gravity
            this.modeA.gravity = cc.ccp(10, -10);

            // Gravity Mode: radial
            this.modeA.radialAccel = 0;
            this.modeA.radialAccelVar = 1;

            // Gravity Mode: tagential
            this.modeA.tangentialAccel = 0;
            this.modeA.tangentialAccelVar = 1;

            // Gravity Mode: speed of particles
            this.modeA.speed = 130;
            this.modeA.speedVar = 30;

            // angle
            this._angle = -90;
            this._angleVar = 5;


            // emitter position
            var winSize = cc.Director.sharedDirector().getWinSize();
            this.setPosition(cc.ccp(winSize.width / 2, winSize.height));
            this._posVar = cc.ccp(winSize.width / 2, 0);

            // life of particles
            this._life = 4.5;
            this._lifeVar = 0;

            // size, in pixels
            this._startSize = 4.0;
            this._startSizeVar = 2.0;
            this._endSize = cc.CCPARTICLE_START_SIZE_EQUAL_TO_END_SIZE;

            // emits per second
            this._emissionRate = 20;

            // color of particles
            this._startColor.r = 0.7;
            this._startColor.g = 0.8;
            this._startColor.b = 1.0;
            this._startColor.a = 1.0;
            this._startColorVar.r = 0.0;
            this._startColorVar.g = 0.0;
            this._startColorVar.b = 0.0;
            this._startColorVar.a = 0.0;
            this._endColor.r = 0.7;
            this._endColor.g = 0.8;
            this._endColor.b = 1.0;
            this._endColor.a = 0.5;
            this._endColorVar.r = 0.0;
            this._endColorVar.g = 0.0;
            this._endColorVar.b = 0.0;
            this._endColorVar.a = 0.0;

            // additive
            this.setIsBlendAdditive(false);
            return true;
        }
        return false;
    }
});
cc.ParticleRain.node = function () {
    var ret = new cc.ParticleRain();
    if (ret.init()) {
        return ret;
    }
    return null;
};