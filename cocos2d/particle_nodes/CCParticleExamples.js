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

/**
 * A fire particle system
 * @class
 * @extends cc.ParticleSystemQuad
 *
 * @example
 * var emitter = cc.ParticleFire.create();
 */
cc.ParticleFire = cc.ParticleSystemQuad.extend(/** @lends cc.ParticleFire# */{
    /**
     * initialize a fire particle system
     * @return {Boolean}
     */
    init:function () {
        return this.initWithTotalParticles(150);
        //return this.initWithTotalParticles(250);
    },

    /**
     * initialize a fire particle system with number Of Particles
     * @param {Number} numberOfParticles
     * @return {Boolean}
     */
    initWithTotalParticles:function (numberOfParticles) {
        if (this._super(numberOfParticles)) {
            // duration
            this._duration = cc.PARTICLE_DURATION_INFINITY;

            // Gravity Mode
            this._emitterMode = cc.PARTICLE_MODE_GRAVITY;

            // Gravity Mode: gravity
            this.modeA.gravity = cc.p(0, 0);

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
            var winSize = cc.Director.getInstance().getWinSize();
            this.setPosition(cc.p(winSize.width / 2, 60));
            this._posVar = cc.p(40, 20);

            // life of particles
            this._life = 3;
            this._lifeVar = 0.25;


            // size, in pixels
            this._startSize = 54.0;
            this._startSizeVar = 10.0;
            this._endSize = cc.PARTICLE_START_SIZE_EQUAL_TO_END_SIZE;

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
            this.setBlendAdditive(true);
            return true;
        }
        return false;
    }
});

/**
 * Create a fire particle system
 * @return {cc.ParticleFire}
 *
 * @example
 * var emitter = cc.ParticleFire.create();
 */
cc.ParticleFire.create = function () {
    var ret = new cc.ParticleFire();
    if (ret.init()) {
        return ret;
    }
    return null;
};

/**
 * A fireworks particle system
 * @class
 * @extends cc.ParticleSystemQuad
 *
 * @example
 * var emitter = cc.ParticleFireworks.create();
 */
cc.ParticleFireworks = cc.ParticleSystemQuad.extend(/** @lends cc.ParticleFireworks# */{
    /**
     * initialize a fireworks particle system
     * @return {Boolean}
     */
    init:function () {
        //return this.initWithTotalParticles(1500);
        return this.initWithTotalParticles(150);
    },

    /**
     * initialize a fireworks particle system with number Of Particles
     * @param {Number} numberOfParticles
     * @return {Boolean}
     */
    initWithTotalParticles:function (numberOfParticles) {
        if (this._super(numberOfParticles)) {
            // duration
            this._duration = cc.PARTICLE_DURATION_INFINITY;

            // Gravity Mode
            this._emitterMode = cc.PARTICLE_MODE_GRAVITY;

            // Gravity Mode: gravity
            this.modeA.gravity = cc.p(0, -90);

            // Gravity Mode:  radial
            this.modeA.radialAccel = 0;
            this.modeA.radialAccelVar = 0;

            //  Gravity Mode: speed of particles
            this.modeA.speed = 180;
            this.modeA.speedVar = 50;

            // emitter position
            var winSize = cc.Director.getInstance().getWinSize();
            this.setPosition(cc.p(winSize.width / 2, winSize.height / 2));

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
            this._endSize = cc.PARTICLE_START_SIZE_EQUAL_TO_END_SIZE;

            // additive
            this.setBlendAdditive(false);
            return true;
        }
        return false;
    }
});

/**
 * Create a fireworks particle system
 * @return {cc.ParticleFireworks}
 *
 * @example
 * var emitter = cc.ParticleFireworks.create();
 */
cc.ParticleFireworks.create = function () {
    var ret = new cc.ParticleFireworks();
    if (ret.init()) {
        return ret;
    }
    return null;
};

/**
 * A sun particle system
 * @class
 * @extends cc.ParticleSystemQuad
 *
 * @example
 * var emitter = cc.ParticleSun.create();
 */
cc.ParticleSun = cc.ParticleSystemQuad.extend(/** @lends cc.ParticleSun# */{
    /**
     * initialize a sun particle system
     * @return {Boolean}
     */
    init:function () {
        //return this.initWithTotalParticles(350);
        return this.initWithTotalParticles(150);
    },

    /**
     * initialize a sun particle system with number Of Particles
     * @param {Number} numberOfParticles
     * @return {Boolean}
     */
    initWithTotalParticles:function (numberOfParticles) {
        if (this._super(numberOfParticles)) {
            // additive
            this.setBlendAdditive(true);

            // duration
            this._duration = cc.PARTICLE_DURATION_INFINITY;

            // Gravity Mode
            this._emitterMode = cc.PARTICLE_MODE_GRAVITY;

            // Gravity Mode: gravity
            this.modeA.gravity = cc.p(0, 0);

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
            var winSize = cc.Director.getInstance().getWinSize();
            this.setPosition(cc.p(winSize.width / 2, winSize.height / 2));
            this._posVar = cc.PointZero();

            // life of particles
            this._life = 1;
            this._lifeVar = 0.5;

            // size, in pixels
            this._startSize = 30.0;
            this._startSizeVar = 10.0;
            this._endSize = cc.PARTICLE_START_SIZE_EQUAL_TO_END_SIZE;

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

/**
 * Create a sun particle system
 * @return {cc.ParticleSun}
 *
 * @example
 * var emitter = cc.ParticleSun.create();
 */
cc.ParticleSun.create = function () {
    var ret = new cc.ParticleSun();
    if (ret.init()) {
        return ret;
    }
    return null;
};

//! @brief A  particle system
/**
 * A galaxy particle system
 * @class
 * @extends cc.ParticleSystemQuad
 *
 * @example
 * var emitter = cc.ParticleGalaxy.create();
 */
cc.ParticleGalaxy = cc.ParticleSystemQuad.extend(/** @lends cc.ParticleGalaxy# */{
    /**
     * initialize a galaxy particle system
     * @return {Boolean}
     */
    init:function () {
        //return this.initWithTotalParticles(200);
        return this.initWithTotalParticles(100);
    },

    /**
     * initialize a galaxy particle system with number Of Particles
     * @param {Number} numberOfParticles
     * @return {Boolean}
     */
    initWithTotalParticles:function (numberOfParticles) {
        if (this._super(numberOfParticles)) {
            // duration
            this._duration = cc.PARTICLE_DURATION_INFINITY;

            // Gravity Mode
            this._emitterMode = cc.PARTICLE_MODE_GRAVITY;

            // Gravity Mode: gravity
            this.modeA.gravity = cc.p(0, 0);

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
            var winSize = cc.Director.getInstance().getWinSize();
            this.setPosition(cc.p(winSize.width / 2, winSize.height / 2));
            this._posVar = cc.PointZero();

            // life of particles
            this._life = 4;
            this._lifeVar = 1;

            // size, in pixels
            this._startSize = 37.0;
            this._startSizeVar = 10.0;
            this._endSize = cc.PARTICLE_START_SIZE_EQUAL_TO_END_SIZE;

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
            this.setBlendAdditive(true);
            return true;
        }
        return false;
    }
});
/**
 * Create a galaxy particle system
 * @return {cc.ParticleGalaxy}
 *
 * @example
 * var emitter = cc.ParticleGalaxy.create();
 */
cc.ParticleGalaxy.create = function () {
    var ret = new cc.ParticleGalaxy();
    if (ret.init()) {
        return ret;
    }
    return null;
};

/**
 * A flower particle system
 * @class
 * @extends cc.ParticleSystemQuad
 *
 * @example
 * var emitter = cc.ParticleFlower.create();
 */
cc.ParticleFlower = cc.ParticleSystemQuad.extend(/** @lends cc.ParticleFlower# */{
    /**
     * initialize a flower particle system
     * @return {Boolean}
     */
    init:function () {
        //return this.initWithTotalParticles(250);
        return this.initWithTotalParticles(100);
    },

    /**
     * initialize a flower particle system with number Of Particles
     * @param {Number} numberOfParticles
     * @return {Boolean}
     */
    initWithTotalParticles:function (numberOfParticles) {
        if (this._super(numberOfParticles)) {
            // duration
            this._duration = cc.PARTICLE_DURATION_INFINITY;

            // Gravity Mode
            this._emitterMode = cc.PARTICLE_MODE_GRAVITY;

            // Gravity Mode: gravity
            this.modeA.gravity = cc.p(0, 0);

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
            var winSize = cc.Director.getInstance().getWinSize();
            this.setPosition(cc.p(winSize.width / 2, winSize.height / 2));
            this._posVar = cc.PointZero();

            // life of particles
            this._life = 4;
            this._lifeVar = 1;

            // size, in pixels
            this._startSize = 30.0;
            this._startSizeVar = 10.0;
            this._endSize = cc.PARTICLE_START_SIZE_EQUAL_TO_END_SIZE;

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
            this.setBlendAdditive(true);
            return true;
        }
        return false;
    }
});

/**
 * Create a flower particle system
 * @return {cc.ParticleFlower}
 *
 * @example
 * var emitter = cc.ParticleFlower.create();
 */
cc.ParticleFlower.create = function () {
    var ret = new cc.ParticleFlower();
    if (ret.init()) {
        return ret;
    }
    return null;
};

//! @brief A meteor particle system
/**
 * A meteor particle system
 * @class
 * @extends cc.ParticleSystemQuad
 *
 * @example
 * var emitter = cc.ParticleMeteor.create();
 */
cc.ParticleMeteor = cc.ParticleSystemQuad.extend(/** @lends cc.ParticleMeteor# */{
    /**
     * initialize a meteor particle system
     * @return {Boolean}
     */
    init:function () {
        //return this.initWithTotalParticles(150);
        return this.initWithTotalParticles(100);
    },

    /**
     * initialize a meteor particle system with number Of Particles
     * @param {Number} numberOfParticles
     * @return {Boolean}
     */
    initWithTotalParticles:function (numberOfParticles) {
        if (this._super(numberOfParticles)) {
            // duration
            this._duration = cc.PARTICLE_DURATION_INFINITY;

            // Gravity Mode
            this._emitterMode = cc.PARTICLE_MODE_GRAVITY;

            // Gravity Mode: gravity
            this.modeA.gravity = cc.p(-200, 200);

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
            var winSize = cc.Director.getInstance().getWinSize();
            this.setPosition(cc.p(winSize.width / 2, winSize.height / 2));
            this._posVar = cc.PointZero();

            // life of particles
            this._life = 2;
            this._lifeVar = 1;

            // size, in pixels
            this._startSize = 60.0;
            this._startSizeVar = 10.0;
            this._endSize = cc.PARTICLE_START_SIZE_EQUAL_TO_END_SIZE;

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
            this.setBlendAdditive(true);
            return true;
        }
        return false;
    }
});

/**
 * Create a meteor particle system
 * @return {cc.ParticleFireworks}
 *
 * @example
 * var emitter = cc.ParticleMeteor.create();
 */
cc.ParticleMeteor.create = function () {
    var ret = new cc.ParticleMeteor();
    if (ret.init()) {
        return ret;
    }
    return null;
};

/**
 * A spiral particle system
 * @class
 * @extends cc.ParticleSystemQuad
 *
 * @example
 * var emitter = cc.ParticleSpiral.create();
 */
cc.ParticleSpiral = cc.ParticleSystemQuad.extend(/** @lends cc.ParticleSpiral# */{
    /**
     * initialize a spiral particle system
     * @return {Boolean}
     */
    init:function () {
        //return this.initWithTotalParticles(500);
        return this.initWithTotalParticles(100);
    },

    /**
     * initialize a spiral particle system with number Of Particles
     * @param {Number} numberOfParticles
     * @return {Boolean}
     */
    initWithTotalParticles:function (numberOfParticles) {
        if (this._super(numberOfParticles)) {
            // duration
            this._duration = cc.PARTICLE_DURATION_INFINITY;

            // Gravity Mode
            this._emitterMode = cc.PARTICLE_MODE_GRAVITY;

            // Gravity Mode: gravity
            this.modeA.gravity = cc.p(0, 0);

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
            var winSize = cc.Director.getInstance().getWinSize();
            this.setPosition(cc.p(winSize.width / 2, winSize.height / 2));
            this._posVar = cc.PointZero();

            // life of particles
            this._life = 12;
            this._lifeVar = 0;

            // size, in pixels
            this._startSize = 20.0;
            this._startSizeVar = 0.0;
            this._endSize = cc.PARTICLE_START_SIZE_EQUAL_TO_END_SIZE;

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
            this.setBlendAdditive(false);
            return true;
        }
        return false;
    }
});

/**
 * Create a spiral particle system
 * @return {cc.ParticleSpiral}
 *
 * @example
 * var emitter = cc.ParticleSpiral.create();
 */
cc.ParticleSpiral.create = function () {
    var ret = new cc.ParticleSpiral();
    if (ret.init()) {
        return ret;
    }
    return null;
};

/**
 * An explosion particle system
 * @class
 * @extends cc.ParticleSystemQuad
 *
 * @example
 * var emitter = cc.ParticleExplosion.create();
 */
cc.ParticleExplosion = cc.ParticleSystemQuad.extend(/** @lends cc.ParticleExplosion# */{
    /**
     * initialize an explosion particle system
     * @return {Boolean}
     */
    init:function () {
        //return this.initWithTotalParticles(700);
        return this.initWithTotalParticles(300);
    },

    /**
     * initialize an explosion particle system with number Of Particles
     * @param {Number} numberOfParticles
     * @return {Boolean}
     */
    initWithTotalParticles:function (numberOfParticles) {
        if (this._super(numberOfParticles)) {
            // duration
            this._duration = 0.1;

            this._emitterMode = cc.PARTICLE_MODE_GRAVITY;

            // Gravity Mode: gravity
            this.modeA.gravity = cc.p(0, 0);

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
            var winSize = cc.Director.getInstance().getWinSize();
            this.setPosition(cc.p(winSize.width / 2, winSize.height / 2));
            this._posVar = cc.PointZero();

            // life of particles
            this._life = 5.0;
            this._lifeVar = 2;

            // size, in pixels
            this._startSize = 15.0;
            this._startSizeVar = 10.0;
            this._endSize = cc.PARTICLE_START_SIZE_EQUAL_TO_END_SIZE;

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
            this.setBlendAdditive(false);
            return true;
        }
        return false;
    }
});

/**
 * Create an explosion particle system
 * @return {cc.ParticleExplosion}
 *
 * @example
 * var emitter = cc.ParticleExplosion.create();
 */
cc.ParticleExplosion.create = function () {
    var ret = new cc.ParticleExplosion();
    if (ret.init()) {
        return ret;
    }
    return null;
};

/**
 * A smoke particle system
 * @class
 * @extends cc.ParticleSystemQuad
 *
 * @example
 * var emitter = cc.ParticleSmoke.create();
 */
cc.ParticleSmoke = cc.ParticleSystemQuad.extend(/** @lends cc.ParticleSmoke# */{
    /**
     * initialize a smoke particle system
     * @return {Boolean}
     */
    init:function () {
        //return this.initWithTotalParticles(200);
        return this.initWithTotalParticles(100);
    },

    /**
     * initialize a smoke particle system with number Of Particles
     * @param {Number} numberOfParticles
     * @return {Boolean}
     */
    initWithTotalParticles:function (numberOfParticles) {
        if (this._super(numberOfParticles)) {
            // duration
            this._duration = cc.PARTICLE_DURATION_INFINITY;

            // Emitter mode: Gravity Mode
            this._emitterMode = cc.PARTICLE_MODE_GRAVITY;

            // Gravity Mode: gravity
            this.modeA.gravity = cc.p(0, 0);

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
            var winSize = cc.Director.getInstance().getWinSize();
            this.setPosition(cc.p(winSize.width / 2, 0));
            this._posVar = cc.p(20, 0);

            // life of particles
            this._life = 4;
            this._lifeVar = 1;

            // size, in pixels
            this._startSize = 60.0;
            this._startSizeVar = 10.0;
            this._endSize = cc.PARTICLE_START_SIZE_EQUAL_TO_END_SIZE;

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
            this.setBlendAdditive(false);
            return true;
        }
        return false;
    }
});

/**
 * Create a smoke particle system
 * @return {cc.ParticleFireworks}
 *
 * @example
 * var emitter = cc.ParticleFireworks.create();
 */
cc.ParticleSmoke.create = function () {
    var ret = new cc.ParticleSmoke();
    if (ret.init()) {
        return ret;
    }
    return null;
};

/**
 * A snow particle system
 * @class
 * @extends cc.ParticleSystemQuad
 *
 * @example
 * var emitter = cc.ParticleSnow.create();
 */
cc.ParticleSnow = cc.ParticleSystemQuad.extend(/** @lends cc.ParticleSnow# */{
    /**
     * initialize a snow particle system
     * @return {Boolean}
     */
    init:function () {
        return this.initWithTotalParticles(250);
        //return this.initWithTotalParticles(700);
    },

    /**
     * initialize a snow particle system with number Of Particles
     * @param {Number} numberOfParticles
     * @return {Boolean}
     */
    initWithTotalParticles:function (numberOfParticles) {
        if (this._super(numberOfParticles)) {
            // duration
            this._duration = cc.PARTICLE_DURATION_INFINITY;

            // set gravity mode.
            this._emitterMode = cc.PARTICLE_MODE_GRAVITY;

            // Gravity Mode: gravity
            this.modeA.gravity = cc.p(0, -1);

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
            var winSize = cc.Director.getInstance().getWinSize();
            this.setPosition(cc.p(winSize.width / 2, winSize.height + 10));
            this._posVar = cc.p(winSize.width / 2, 0);

            // angle
            this._angle = -90;
            this._angleVar = 5;

            // life of particles
            this._life = 45;
            this._lifeVar = 15;

            // size, in pixels
            this._startSize = 10.0;
            this._startSizeVar = 5.0;
            this._endSize = cc.PARTICLE_START_SIZE_EQUAL_TO_END_SIZE;

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
            this.setBlendAdditive(false);
            return true;
        }
        return false;
    }
});

/**
 * Create a snow particle system
 * @return {cc.ParticleSnow}
 *
 * @example
 * var emitter = cc.ParticleSnow.create();
 */
cc.ParticleSnow.create = function () {
    var ret = new cc.ParticleSnow();
    if (ret.init()) {
        return ret;
    }
    return null;
};

//! @brief A rain particle system
/**
 * A rain particle system
 * @class
 * @extends cc.ParticleSystemQuad
 *
 * @example
 * var emitter = cc.ParticleRain.create();
 */
cc.ParticleRain = cc.ParticleSystemQuad.extend(/** @lends cc.ParticleRain# */{
    /**
     * initialize a rain particle system
     * @return {Boolean}
     */
    init:function () {
        return this.initWithTotalParticles(300);
        //return this.initWithTotalParticles(1000);
    },

    /**
     * initialize a rain particle system with number Of Particles
     * @param {Number} numberOfParticles
     * @return {Boolean}
     */
    initWithTotalParticles:function (numberOfParticles) {
        if (this._super(numberOfParticles)) {
            // duration
            this._duration = cc.PARTICLE_DURATION_INFINITY;

            this._emitterMode = cc.PARTICLE_MODE_GRAVITY;

            // Gravity Mode: gravity
            this.modeA.gravity = cc.p(10, -10);

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
            var winSize = cc.Director.getInstance().getWinSize();
            this.setPosition(cc.p(winSize.width / 2, winSize.height));
            this._posVar = cc.p(winSize.width / 2, 0);

            // life of particles
            this._life = 4.5;
            this._lifeVar = 0;

            // size, in pixels
            this._startSize = 4.0;
            this._startSizeVar = 2.0;
            this._endSize = cc.PARTICLE_START_SIZE_EQUAL_TO_END_SIZE;

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
            this.setBlendAdditive(false);
            return true;
        }
        return false;
    }
});

/**
 * Create a rain particle system
 * @return {cc.ParticleRain}
 *
 * @example
 * var emitter = cc.ParticleRain.create();
 */
cc.ParticleRain.create = function () {
    var ret = new cc.ParticleRain();
    if (ret.init()) {
        return ret;
    }
    return null;
};
