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
        return this.initWithTotalParticles(250);
    },
    initWithTotalParticles:function (numberOfParticles) {
        if (this._super(numberOfParticles)) {
            // duration
            this._m_fDuration = cc.kCCParticleDurationInfinity;

            // Gravity Mode
            this._m_nEmitterMode = cc.kCCParticleModeGravity;

            // Gravity Mode: gravity
            this.modeA.gravity = cc.ccp(0, 0);

            // Gravity Mode: radial acceleration
            this.modeA.radialAccel = 0;
            this.modeA.radialAccelVar = 0;

            // Gravity Mode: speed of particles
            this.modeA.speed = 60;
            this.modeA.speedVar = 20;

            // starting angle
            this._m_fAngle = 90;
            this._m_fAngleVar = 10;

            // emitter position
            var winSize = cc.Director.sharedDirector().getWinSize();
            this.setPosition(cc.ccp(winSize.width / 2, 60));
            this._m_tPosVar = cc.ccp(40, 20);

            // life of particles
            this._m_fLife = 3;
            this._m_fLifeVar = 0.25;


            // size, in pixels
            this._m_fStartSize = 54.0;
            this._m_fStartSizeVar = 10.0;
            this._m_fEndSize = cc.kCCParticleStartSizeEqualToEndSize;

            // emits per frame
            this._m_fEmissionRate = this._m_uTotalParticles / this._m_fLife;

            // color of particles
            this._m_tStartColor.r = 0.76;
            this._m_tStartColor.g = 0.25;
            this._m_tStartColor.b = 0.12;
            this._m_tStartColor.a = 1.0;
            this._m_tStartColorVar.r = 0.0;
            this._m_tStartColorVar.g = 0.0;
            this._m_tStartColorVar.b = 0.0;
            this._m_tStartColorVar.a = 0.0;
            this._m_tEndColor.r = 0.0;
            this._m_tEndColor.g = 0.0;
            this._m_tEndColor.b = 0.0;
            this._m_tEndColor.a = 1.0;
            this._m_tEndColorVar.r = 0.0;
            this._m_tEndColorVar.g = 0.0;
            this._m_tEndColorVar.b = 0.0;
            this._m_tEndColorVar.a = 0.0;

            // additive
            this.setIsBlendAdditive(true);
            return true;
        }
        return false;
    }
});
cc.ParticleFire.node = function () {
    var pRet = new cc.ParticleFire();
    if (pRet.init()) {
        return pRet;
    }
    return null;
};

//! @brief A fireworks particle system
cc.ParticleFireworks = cc.ARCH_OPTIMAL_PARTICLE_SYSTEM.extend({
    init:function () {
        return this.initWithTotalParticles(1500);
    },
    initWithTotalParticles:function (numberOfParticles) {
        if (this._super(numberOfParticles)) {
            // duration
            this._m_fDuration = cc.kCCParticleDurationInfinity;

            // Gravity Mode
            this._m_nEmitterMode = cc.kCCParticleModeGravity;

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
            this._m_fAngle = 90;
            this._m_fAngleVar = 20;

            // life of particles
            this._m_fLife = 3.5;
            this._m_fLifeVar = 1;

            // emits per frame
            this._m_fEmissionRate = this._m_uTotalParticles / this._m_fLife;

            // color of particles
            this._m_tStartColor.r = 0.5;
            this._m_tStartColor.g = 0.5;
            this._m_tStartColor.b = 0.5;
            this._m_tStartColor.a = 1.0;
            this._m_tStartColorVar.r = 0.5;
            this._m_tStartColorVar.g = 0.5;
            this._m_tStartColorVar.b = 0.5;
            this._m_tStartColorVar.a = 0.1;
            this._m_tEndColor.r = 0.1;
            this._m_tEndColor.g = 0.1;
            this._m_tEndColor.b = 0.1;
            this._m_tEndColor.a = 0.2;
            this._m_tEndColorVar.r = 0.1;
            this._m_tEndColorVar.g = 0.1;
            this._m_tEndColorVar.b = 0.1;
            this._m_tEndColorVar.a = 0.2;

            // size, in pixels
            this._m_fStartSize = 8.0;
            this._m_fStartSizeVar = 2.0;
            this._m_fEndSize = cc.kCCParticleStartSizeEqualToEndSize;

            // additive
            this.setIsBlendAdditive(false);
            return true;
        }
        return false;
    }
});
cc.ParticleFireworks.node = function () {
    var pRet = new cc.ParticleFireworks();
    if (pRet.init()) {
        return pRet;
    }
    return null;
};

//! @brief A sun particle system
cc.ParticleSun = cc.ARCH_OPTIMAL_PARTICLE_SYSTEM.extend({
    init:function () {
        return this.initWithTotalParticles(350);
    },
    //
    // ParticleSun
    //
    initWithTotalParticles:function (numberOfParticles) {
        if (this._super(numberOfParticles)) {
            // additive
            this.setIsBlendAdditive(true);

            // duration
            this._m_fDuration = cc.kCCParticleDurationInfinity;

            // Gravity Mode
            this._m_nEmitterMode = cc.kCCParticleModeGravity;

            // Gravity Mode: gravity
            this.modeA.gravity = cc.ccp(0, 0);

            // Gravity mode: radial acceleration
            this.modeA.radialAccel = 0;
            this.modeA.radialAccelVar = 0;

            // Gravity mode: speed of particles
            this.modeA.speed = 20;
            this.modeA.speedVar = 5;


            // angle
            this._m_fAngle = 90;
            this._m_fAngleVar = 360;

            // emitter position
            var winSize = cc.Director.sharedDirector().getWinSize();
            this.setPosition(cc.ccp(winSize.width / 2, winSize.height / 2));
            this._m_tPosVar = cc.PointZero();

            // life of particles
            this._m_fLife = 1;
            this._m_fLifeVar = 0.5;

            // size, in pixels
            this._m_fStartSize = 30.0;
            this._m_fStartSizeVar = 10.0;
            this._m_fEndSize = cc.kCCParticleStartSizeEqualToEndSize;

            // emits per seconds
            this._m_fEmissionRate = this._m_uTotalParticles / this._m_fLife;

            // color of particles
            this._m_tStartColor.r = 0.76;
            this._m_tStartColor.g = 0.25;
            this._m_tStartColor.b = 0.12;
            this._m_tStartColor.a = 1.0;
            this._m_tStartColorVar.r = 0.0;
            this._m_tStartColorVar.g = 0.0;
            this._m_tStartColorVar.b = 0.0;
            this._m_tStartColorVar.a = 0.0;
            this._m_tEndColor.r = 0.0;
            this._m_tEndColor.g = 0.0;
            this._m_tEndColor.b = 0.0;
            this._m_tEndColor.a = 1.0;
            this._m_tEndColorVar.r = 0.0;
            this._m_tEndColorVar.g = 0.0;
            this._m_tEndColorVar.b = 0.0;
            this._m_tEndColorVar.a = 0.0;

            return true;
        }
        return false;
    }
});
cc.ParticleSun.node = function () {
    var pRet = new cc.ParticleSun();
    if (pRet.init()) {
        return pRet;
    }
    return null;
};

//! @brief A galaxy particle system
cc.ParticleGalaxy = cc.ARCH_OPTIMAL_PARTICLE_SYSTEM.extend({
    init:function () {
        return this.initWithTotalParticles(200);
    },
    //
    // ParticleGalaxy
    //
    initWithTotalParticles:function (numberOfParticles) {
        if (this._super(numberOfParticles)) {
            // duration
            this._m_fDuration = cc.kCCParticleDurationInfinity;

            // Gravity Mode
            this._m_nEmitterMode = cc.kCCParticleModeGravity;

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
            this._m_fAngle = 90;
            this._m_fAngleVar = 360;

            // emitter position
            var winSize = cc.Director.sharedDirector().getWinSize();
            this.setPosition(cc.ccp(winSize.width / 2, winSize.height / 2));
            this._m_tPosVar = cc.PointZero();

            // life of particles
            this._m_fLife = 4;
            this._m_fLifeVar = 1;

            // size, in pixels
            this._m_fStartSize = 37.0;
            this._m_fStartSizeVar = 10.0;
            this._m_fEndSize = cc.kCCParticleStartSizeEqualToEndSize;

            // emits per second
            this._m_fEmissionRate = this._m_uTotalParticles / this._m_fLife;

            // color of particles
            this._m_tStartColor.r = 0.12;
            this._m_tStartColor.g = 0.25;
            this._m_tStartColor.b = 0.76;
            this._m_tStartColor.a = 1.0;
            this._m_tStartColorVar.r = 0.0;
            this._m_tStartColorVar.g = 0.0;
            this._m_tStartColorVar.b = 0.0;
            this._m_tStartColorVar.a = 0.0;
            this._m_tEndColor.r = 0.0;
            this._m_tEndColor.g = 0.0;
            this._m_tEndColor.b = 0.0;
            this._m_tEndColor.a = 1.0;
            this._m_tEndColorVar.r = 0.0;
            this._m_tEndColorVar.g = 0.0;
            this._m_tEndColorVar.b = 0.0;
            this._m_tEndColorVar.a = 0.0;

            // additive
            this.setIsBlendAdditive(true);
            return true;
        }
        return false;
    }
});
cc.ParticleGalaxy.node = function () {
    var pRet = new cc.ParticleGalaxy();
    if (pRet.init()) {
        return pRet;
    }
    return null;
};

//! @brief A flower particle system
cc.ParticleFlower = cc.ARCH_OPTIMAL_PARTICLE_SYSTEM.extend({
    init:function () {
        return this.initWithTotalParticles(250);
    },
    //
    // ParticleFlower
    //
    initWithTotalParticles:function (numberOfParticles) {
        if (this._super(numberOfParticles)) {
            // duration
            this._m_fDuration = cc.kCCParticleDurationInfinity;

            // Gravity Mode
            this._m_nEmitterMode = cc.kCCParticleModeGravity;

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
            this._m_fAngle = 90;
            this._m_fAngleVar = 360;

            // emitter position
            var winSize = cc.Director.sharedDirector().getWinSize();
            this.setPosition(cc.ccp(winSize.width / 2, winSize.height / 2));
            this._m_tPosVar = cc.PointZero();

            // life of particles
            this._m_fLife = 4;
            this._m_fLifeVar = 1;

            // size, in pixels
            this._m_fStartSize = 30.0;
            this._m_fStartSizeVar = 10.0;
            this._m_fEndSize = cc.kCCParticleStartSizeEqualToEndSize;

            // emits per second
            this._m_fEmissionRate = this._m_uTotalParticles / this._m_fLife;

            // color of particles
            this._m_tStartColor.r = 0.50;
            this._m_tStartColor.g = 0.50;
            this._m_tStartColor.b = 0.50;
            this._m_tStartColor.a = 1.0;
            this._m_tStartColorVar.r = 0.5;
            this._m_tStartColorVar.g = 0.5;
            this._m_tStartColorVar.b = 0.5;
            this._m_tStartColorVar.a = 0.5;
            this._m_tEndColor.r = 0.0;
            this._m_tEndColor.g = 0.0;
            this._m_tEndColor.b = 0.0;
            this._m_tEndColor.a = 1.0;
            this._m_tEndColorVar.r = 0.0;
            this._m_tEndColorVar.g = 0.0;
            this._m_tEndColorVar.b = 0.0;
            this._m_tEndColorVar.a = 0.0;

            // additive
            this.setIsBlendAdditive(true);
            return true;
        }
        return false;
    }
});
cc.ParticleFlower.node = function () {
    var pRet = new cc.ParticleFlower();
    if (pRet.init()) {
        return pRet;
    }
    return null;
};

//! @brief A meteor particle system
cc.ParticleMeteor = cc.ARCH_OPTIMAL_PARTICLE_SYSTEM.extend({
    init:function () {
        return this.initWithTotalParticles(150);
    },
    //
    // ParticleMeteor
    //
    initWithTotalParticles:function (numberOfParticles) {
        if (this._super(numberOfParticles)) {
            // duration
            this._m_fDuration = cc.kCCParticleDurationInfinity;

            // Gravity Mode
            this._m_nEmitterMode = cc.kCCParticleModeGravity;

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
            this._m_fAngle = 90;
            this._m_fAngleVar = 360;

            // emitter position
            var winSize = cc.Director.sharedDirector().getWinSize();
            this.setPosition(cc.ccp(winSize.width / 2, winSize.height / 2));
            this._m_tPosVar = cc.PointZero();

            // life of particles
            this._m_fLife = 2;
            this._m_fLifeVar = 1;

            // size, in pixels
            this._m_fStartSize = 60.0;
            this._m_fStartSizeVar = 10.0;
            this._m_fEndSize = cc.kCCParticleStartSizeEqualToEndSize;

            // emits per second
            this._m_fEmissionRate = this._m_uTotalParticles / this._m_fLife;

            // color of particles
            this._m_tStartColor.r = 0.2;
            this._m_tStartColor.g = 0.4;
            this._m_tStartColor.b = 0.7;
            this._m_tStartColor.a = 1.0;
            this._m_tStartColorVar.r = 0.0;
            this._m_tStartColorVar.g = 0.0;
            this._m_tStartColorVar.b = 0.2;
            this._m_tStartColorVar.a = 0.1;
            this._m_tEndColor.r = 0.0;
            this._m_tEndColor.g = 0.0;
            this._m_tEndColor.b = 0.0;
            this._m_tEndColor.a = 1.0;
            this._m_tEndColorVar.r = 0.0;
            this._m_tEndColorVar.g = 0.0;
            this._m_tEndColorVar.b = 0.0;
            this._m_tEndColorVar.a = 0.0;

            // additive
            this.setIsBlendAdditive(true);
            return true;
        }
        return false;
    }
});
cc.ParticleMeteor.node = function () {
    var pRet = new cc.ParticleMeteor();
    if (pRet.init()) {
        return pRet;
    }
    return null;
};

//! @brief An spiral particle system
cc.ParticleSpiral = cc.ARCH_OPTIMAL_PARTICLE_SYSTEM.extend({
    init:function () {
        return this.initWithTotalParticles(500);
    },
    //
    // ParticleSpiral
    //
    initWithTotalParticles:function (numberOfParticles) {
        if (this._super(numberOfParticles)) {
            // duration
            this._m_fDuration = cc.kCCParticleDurationInfinity;

            // Gravity Mode
            this._m_nEmitterMode = cc.kCCParticleModeGravity;

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
            this._m_fAngle = 90;
            this._m_fAngleVar = 0;

            // emitter position
            var winSize = cc.Director.sharedDirector().getWinSize();
            this.setPosition(cc.ccp(winSize.width / 2, winSize.height / 2));
            this._m_tPosVar = cc.PointZero();

            // life of particles
            this._m_fLife = 12;
            this._m_fLifeVar = 0;

            // size, in pixels
            this._m_fStartSize = 20.0;
            this._m_fStartSizeVar = 0.0;
            this._m_fEndSize = cc.kCCParticleStartSizeEqualToEndSize;

            // emits per second
            this._m_fEmissionRate = this._m_uTotalParticles / this._m_fLife;

            // color of particles
            this._m_tStartColor.r = 0.5;
            this._m_tStartColor.g = 0.5;
            this._m_tStartColor.b = 0.5;
            this._m_tStartColor.a = 1.0;
            this._m_tStartColorVar.r = 0.5;
            this._m_tStartColorVar.g = 0.5;
            this._m_tStartColorVar.b = 0.5;
            this._m_tStartColorVar.a = 0.0;
            this._m_tEndColor.r = 0.5;
            this._m_tEndColor.g = 0.5;
            this._m_tEndColor.b = 0.5;
            this._m_tEndColor.a = 1.0;
            this._m_tEndColorVar.r = 0.5;
            this._m_tEndColorVar.g = 0.5;
            this._m_tEndColorVar.b = 0.5;
            this._m_tEndColorVar.a = 0.0;

            // additive
            this.setIsBlendAdditive(false);
            return true;
        }
        return false;
    }
});
cc.ParticleSpiral.node = function () {
    var pRet = new cc.ParticleSpiral();
    if (pRet.init()) {
        return pRet;
    }
    return null;
};

//! @brief An explosion particle system
cc.ParticleExplosion = cc.ARCH_OPTIMAL_PARTICLE_SYSTEM.extend({
    init:function () {
        return this.initWithTotalParticles(700);
    },
    //
    // ParticleExplosion
    //
    initWithTotalParticles:function (numberOfParticles) {
        if (this._super(numberOfParticles)) {
            // duration
            this._m_fDuration = 0.1;

            this._m_nEmitterMode = cc.kCCParticleModeGravity;

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
            this._m_fAngle = 90;
            this._m_fAngleVar = 360;

            // emitter position
            var winSize = cc.Director.sharedDirector().getWinSize();
            this.setPosition(cc.ccp(winSize.width / 2, winSize.height / 2));
            this._m_tPosVar = cc.PointZero();

            // life of particles
            this._m_fLife = 5.0;
            this._m_fLifeVar = 2;

            // size, in pixels
            this._m_fStartSize = 15.0;
            this._m_fStartSizeVar = 10.0;
            this._m_fEndSize = cc.kCCParticleStartSizeEqualToEndSize;

            // emits per second
            this._m_fEmissionRate = this._m_uTotalParticles / this._m_fDuration;

            // color of particles
            this._m_tStartColor.r = 0.7;
            this._m_tStartColor.g = 0.1;
            this._m_tStartColor.b = 0.2;
            this._m_tStartColor.a = 1.0;
            this._m_tStartColorVar.r = 0.5;
            this._m_tStartColorVar.g = 0.5;
            this._m_tStartColorVar.b = 0.5;
            this._m_tStartColorVar.a = 0.0;
            this._m_tEndColor.r = 0.5;
            this._m_tEndColor.g = 0.5;
            this._m_tEndColor.b = 0.5;
            this._m_tEndColor.a = 0.0;
            this._m_tEndColorVar.r = 0.5;
            this._m_tEndColorVar.g = 0.5;
            this._m_tEndColorVar.b = 0.5;
            this._m_tEndColorVar.a = 0.0;

            // additive
            this.setIsBlendAdditive(false);
            return true;
        }
        return false;
    }
});
cc.ParticleExplosion.node = function () {
    var pRet = new cc.ParticleExplosion();
    if (pRet.init()) {
        return pRet;
    }
    return null;
};

//! @brief An smoke particle system
cc.ParticleSmoke = cc.ARCH_OPTIMAL_PARTICLE_SYSTEM.extend({
    init:function () {
        return this.initWithTotalParticles(200);
    },
    //
    // ParticleSmoke
    //
    initWithTotalParticles:function (numberOfParticles) {
        if (this._super(numberOfParticles)) {
            // duration
            this._m_fDuration = cc.kCCParticleDurationInfinity;

            // Emitter mode: Gravity Mode
            this._m_nEmitterMode = cc.kCCParticleModeGravity;

            // Gravity Mode: gravity
            this.modeA.gravity = cc.ccp(0, 0);

            // Gravity Mode: radial acceleration
            this.modeA.radialAccel = 0;
            this.modeA.radialAccelVar = 0;

            // Gravity Mode: speed of particles
            this.modeA.speed = 25;
            this.modeA.speedVar = 10;

            // angle
            this._m_fAngle = 90;
            this._m_fAngleVar = 5;

            // emitter position
            var winSize = cc.Director.sharedDirector().getWinSize();
            this.setPosition(cc.ccp(winSize.width / 2, 0));
            this._m_tPosVar = cc.ccp(20, 0);

            // life of particles
            this._m_fLife = 4;
            this._m_fLifeVar = 1;

            // size, in pixels
            this._m_fStartSize = 60.0;
            this._m_fStartSizeVar = 10.0;
            this._m_fEndSize = cc.kCCParticleStartSizeEqualToEndSize;

            // emits per frame
            this._m_fEmissionRate = this._m_uTotalParticles / this._m_fLife;

            // color of particles
            this._m_tStartColor.r = 0.8;
            this._m_tStartColor.g = 0.8;
            this._m_tStartColor.b = 0.8;
            this._m_tStartColor.a = 1.0;
            this._m_tStartColorVar.r = 0.02;
            this._m_tStartColorVar.g = 0.02;
            this._m_tStartColorVar.b = 0.02;
            this._m_tStartColorVar.a = 0.0;
            this._m_tEndColor.r = 0.0;
            this._m_tEndColor.g = 0.0;
            this._m_tEndColor.b = 0.0;
            this._m_tEndColor.a = 1.0;
            this._m_tEndColorVar.r = 0.0;
            this._m_tEndColorVar.g = 0.0;
            this._m_tEndColorVar.b = 0.0;
            this._m_tEndColorVar.a = 0.0;

            // additive
            this.setIsBlendAdditive(false);
            return true;
        }
        return false;
    }
});
cc.ParticleSmoke.node = function () {
    var pRet = new cc.ParticleSmoke();
    if (pRet.init()) {
        return pRet;
    }
    return null;
};

//! @brief An snow particle system
cc.ParticleSnow = cc.ARCH_OPTIMAL_PARTICLE_SYSTEM.extend({
    init:function () {
        return this.initWithTotalParticles(700);
    },
    //
    // CCParticleSnow
    //
    initWithTotalParticles:function (numberOfParticles) {
        if (this._super(numberOfParticles)) {
            // duration
            this._m_fDuration = cc.kCCParticleDurationInfinity;

            // set gravity mode.
            this._m_nEmitterMode = cc.kCCParticleModeGravity;

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
            this._m_tPosVar = cc.ccp(winSize.width / 2, 0);

            // angle
            this._m_fAngle = -90;
            this._m_fAngleVar = 5;

            // life of particles
            this._m_fLife = 45;
            this._m_fLifeVar = 15;

            // size, in pixels
            this._m_fStartSize = 10.0;
            this._m_fStartSizeVar = 5.0;
            this._m_fEndSize = cc.kCCParticleStartSizeEqualToEndSize;

            // emits per second
            this._m_fEmissionRate = 10;

            // color of particles
            this._m_tStartColor.r = 1.0;
            this._m_tStartColor.g = 1.0;
            this._m_tStartColor.b = 1.0;
            this._m_tStartColor.a = 1.0;
            this._m_tStartColorVar.r = 0.0;
            this._m_tStartColorVar.g = 0.0;
            this._m_tStartColorVar.b = 0.0;
            this._m_tStartColorVar.a = 0.0;
            this._m_tEndColor.r = 1.0;
            this._m_tEndColor.g = 1.0;
            this._m_tEndColor.b = 1.0;
            this._m_tEndColor.a = 0.0;
            this._m_tEndColorVar.r = 0.0;
            this._m_tEndColorVar.g = 0.0;
            this._m_tEndColorVar.b = 0.0;
            this._m_tEndColorVar.a = 0.0;

            // additive
            this.setIsBlendAdditive(false);
            return true;
        }
        return false;
    }
});
cc.ParticleSnow.node = function () {
    var pRet = new cc.ParticleSnow();
    if (pRet.init()) {
        return pRet;
    }
    return null;
};

//! @brief A rain particle system
cc.ParticleRain = cc.ARCH_OPTIMAL_PARTICLE_SYSTEM.extend({
    init:function () {
        return this.initWithTotalParticles(1000);
    },
    //
    // CCParticleRain
    //
    initWithTotalParticles:function (numberOfParticles) {
        if (this._super(numberOfParticles)) {
            // duration
            this._m_fDuration = cc.kCCParticleDurationInfinity;

            this._m_nEmitterMode = cc.kCCParticleModeGravity;

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
            this._m_fAngle = -90;
            this._m_fAngleVar = 5;


            // emitter position
            var winSize = cc.Director.sharedDirector().getWinSize();
            this.setPosition(cc.ccp(winSize.width / 2, winSize.height));
            this._m_tPosVar = cc.ccp(winSize.width / 2, 0);

            // life of particles
            this._m_fLife = 4.5;
            this._m_fLifeVar = 0;

            // size, in pixels
            this._m_fStartSize = 4.0;
            this._m_fStartSizeVar = 2.0;
            this._m_fEndSize = cc.kCCParticleStartSizeEqualToEndSize;

            // emits per second
            this._m_fEmissionRate = 20;

            // color of particles
            this._m_tStartColor.r = 0.7;
            this._m_tStartColor.g = 0.8;
            this._m_tStartColor.b = 1.0;
            this._m_tStartColor.a = 1.0;
            this._m_tStartColorVar.r = 0.0;
            this._m_tStartColorVar.g = 0.0;
            this._m_tStartColorVar.b = 0.0;
            this._m_tStartColorVar.a = 0.0;
            this._m_tEndColor.r = 0.7;
            this._m_tEndColor.g = 0.8;
            this._m_tEndColor.b = 1.0;
            this._m_tEndColor.a = 0.5;
            this._m_tEndColorVar.r = 0.0;
            this._m_tEndColorVar.g = 0.0;
            this._m_tEndColorVar.b = 0.0;
            this._m_tEndColorVar.a = 0.0;

            // additive
            this.setIsBlendAdditive(false);
            return true;
        }
        return false;
    }
});
cc.ParticleRain.node = function () {
    var pRet = new cc.ParticleRain();
    if (pRet.init()) {
        return pRet;
    }
    return null;
};