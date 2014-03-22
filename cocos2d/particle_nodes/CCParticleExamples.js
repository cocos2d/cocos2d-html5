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
 * @extends cc.ParticleSystem
 *
 * @example
 * var emitter = cc.ParticleFire.create();
 */
cc.ParticleFire = cc.ParticleSystem.extend(/** @lends cc.ParticleFire# */{
    /**
     * initialize a fire particle system
     * @return {Boolean}
     */
    init:function () {
        return this.initWithTotalParticles((cc.renderContextType === cc.WEBGL) ? 300 : 150);
    },

    /**
     * initialize a fire particle system with number Of Particles
     * @param {Number} numberOfParticles
     * @return {Boolean}
     */
    initWithTotalParticles:function (numberOfParticles) {
        if (cc.ParticleSystem.prototype.initWithTotalParticles.call(this, numberOfParticles)) {
            // duration
            this.setDuration(cc.PARTICLE_DURATION_INFINITY);

            // Gravity Mode
            this.setEmitterMode(cc.PARTICLE_MODE_GRAVITY);


            // Gravity Mode: gravity
            this.setGravity(cc.p(0, 0));

            // Gravity Mode: radial acceleration
            this.setRadialAccel(0);
            this.setRadialAccelVar(0);

            // Gravity Mode: speed of particles
            this.setSpeed(60);
            this.setSpeedVar(20);

            // starting angle
            this.setAngle(90);
            this.setAngleVar(10);

            // emitter position
            var winSize = cc.Director.getInstance().getWinSize();
            this.setPosition(winSize.width / 2, 60);
            this.setPosVar(cc.p(40, 20));

            // life of particles
            this.setLife(3);
            this.setLifeVar(0.25);


            // size, in pixels
            this.setStartSize(54.0);
            this.setStartSizeVar(10.0);
            this.setEndSize(cc.PARTICLE_START_SIZE_EQUAL_TO_END_SIZE);

            // emits per frame
            this.setEmissionRate(this.getTotalParticles() / this.getLife());

            // color of particles
            this.setStartColor(cc.c4f(0.76,0.25,0.12,1.0));
            this.setStartColorVar(cc.c4f(0,0,0,0));
            this.setEndColor(cc.c4f(0,0,0,1));
            this.setEndColorVar(cc.c4f(0,0,0,0));

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
 * @extends cc.ParticleSystem
 *
 * @example
 * var emitter = cc.ParticleFireworks.create();
 */
cc.ParticleFireworks = cc.ParticleSystem.extend(/** @lends cc.ParticleFireworks# */{
    /**
     * initialize a fireworks particle system
     * @return {Boolean}
     */
    init:function () {
        return this.initWithTotalParticles((cc.renderContextType === cc.WEBGL) ? 1500 : 150);
    },

    /**
     * initialize a fireworks particle system with number Of Particles
     * @param {Number} numberOfParticles
     * @return {Boolean}
     */
    initWithTotalParticles:function (numberOfParticles) {
        if (cc.ParticleSystem.prototype.initWithTotalParticles.call(this, numberOfParticles)) {
            // duration
            this.setDuration(cc.PARTICLE_DURATION_INFINITY);

            // Gravity Mode
            this.setEmitterMode(cc.PARTICLE_MODE_GRAVITY);

            // Gravity Mode: gravity
            this.setGravity(cc.p(0, -90));

            // Gravity Mode:  radial
            this.setRadialAccel(0);
            this.setRadialAccelVar(0);

            //  Gravity Mode: speed of particles
            this.setSpeed(180);
            this.setSpeedVar(50);

            // emitter position
            var winSize = cc.Director.getInstance().getWinSize();
            this.setPosition(winSize.width / 2, winSize.height / 2);

            // angle
            this.setAngle(90);
            this.setAngleVar(20);

            // life of particles
            this.setLife(3.5);
            this.setLifeVar(1);

            // emits per frame
            this.setEmissionRate(this.getTotalParticles() / this.getLife());

            // color of particles
            this.setStartColor(cc.c4f(0.5,0.5,0.5,1.0));
            this.setStartColorVar(cc.c4f(0.5,0.5,0.5,1.0));
            this.setEndColor(cc.c4f(0.1,0.1,0.1,0.2));
            this.setEndColorVar(cc.c4f(0.1,0.1,0.1,0.2));

            // size, in pixels
            this.setStartSize(8.0);
            this.setStartSizeVar(2.0);
            this.setEndSize(cc.PARTICLE_START_SIZE_EQUAL_TO_END_SIZE);

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
 * @extends cc.ParticleSystem
 *
 * @example
 * var emitter = cc.ParticleSun.create();
 */
cc.ParticleSun = cc.ParticleSystem.extend(/** @lends cc.ParticleSun# */{
    /**
     * initialize a sun particle system
     * @return {Boolean}
     */
    init:function () {
        return this.initWithTotalParticles((cc.renderContextType === cc.WEBGL) ? 350 : 150);
    },

    /**
     * initialize a sun particle system with number Of Particles
     * @param {Number} numberOfParticles
     * @return {Boolean}
     */
    initWithTotalParticles:function (numberOfParticles) {
        if (cc.ParticleSystem.prototype.initWithTotalParticles.call(this, numberOfParticles)) {
            // additive
            this.setBlendAdditive(true);

            // duration
            this.setDuration(cc.PARTICLE_DURATION_INFINITY);

            // Gravity Mode
            this.setEmitterMode(cc.PARTICLE_MODE_GRAVITY);

            // Gravity Mode: gravity
            this.setGravity(cc.p(0, 0));

            // Gravity mode: radial acceleration
            this.setRadialAccel(0);
            this.setRadialAccelVar(0);

            // Gravity mode: speed of particles
            this.setSpeed(20);
            this.setSpeedVar(5);

            // angle
            this.setAngle(90);
            this.setAngleVar(360);

            // emitter position
            var winSize = cc.Director.getInstance().getWinSize();
            this.setPosition(winSize.width / 2, winSize.height / 2);
            this.setPosVar(cc.PointZero());

            // life of particles
            this.setLife(1);
            this.setLifeVar(0.5);

            // size, in pixels
            this.setStartSize(30.0);
            this.setStartSizeVar(10.0);
            this.setEndSize(cc.PARTICLE_START_SIZE_EQUAL_TO_END_SIZE);

            // emits per seconds
            this.setEmissionRate(this.getTotalParticles() / this.getLife());

            // color of particles
            this.setStartColor(cc.c4f(0.76,0.25,0.12,1));
            this.setStartColorVar(cc.c4f(0,0,0,0));
            this.setEndColor(cc.c4f(0,0,0,1));
            this.setEndColorVar(cc.c4f(0,0,0,0));

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
 * @extends cc.ParticleSystem
 *
 * @example
 * var emitter = cc.ParticleGalaxy.create();
 */
cc.ParticleGalaxy = cc.ParticleSystem.extend(/** @lends cc.ParticleGalaxy# */{
    /**
     * initialize a galaxy particle system
     * @return {Boolean}
     */
    init:function () {
        //return this.initWithTotalParticles(200);
        return this.initWithTotalParticles((cc.renderContextType === cc.WEBGL) ? 200 : 100);
    },

    /**
     * initialize a galaxy particle system with number Of Particles
     * @param {Number} numberOfParticles
     * @return {Boolean}
     */
    initWithTotalParticles:function (numberOfParticles) {
        if (cc.ParticleSystem.prototype.initWithTotalParticles.call(this, numberOfParticles)) {
            // duration
            this.setDuration(cc.PARTICLE_DURATION_INFINITY);

            // Gravity Mode
            this.setEmitterMode(cc.PARTICLE_MODE_GRAVITY);

            // Gravity Mode: gravity
            this.setGravity(cc.p(0, 0));

            // Gravity Mode: speed of particles
            this.setSpeed(60);
            this.setSpeedVar(10);

            // Gravity Mode: radial
            this.setRadialAccel(-80);
            this.setRadialAccelVar(0);

            // Gravity Mode: tangential
            this.setTangentialAccel(80);
            this.setTangentialAccelVar(0);

            // angle
            this.setAngle(90);
            this.setAngleVar(360);

            // emitter position
            var winSize = cc.Director.getInstance().getWinSize();
            this.setPosition(winSize.width / 2, winSize.height / 2);
            this.setPosVar(cc.PointZero());

            // life of particles
            this.setLife(4);
            this.setLifeVar(1);

            // size, in pixels
            this.setStartSize(37.0);
            this.setStartSizeVar(10.0);
            this.setEndSize(cc.PARTICLE_START_SIZE_EQUAL_TO_END_SIZE);

            // emits per second
            this.setEmissionRate(this.getTotalParticles() / this.getLife());

            // color of particles
            this.setStartColor(cc.c4f(0.12,0.25,0.76,1));
            this.setStartColorVar(cc.c4f(0,0,0,0));
            this.setEndColor(cc.c4f(0,0,0,1));
            this.setEndColorVar(cc.c4f(0,0,0,0));

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
 * @extends cc.ParticleSystem
 *
 * @example
 * var emitter = cc.ParticleFlower.create();
 */
cc.ParticleFlower = cc.ParticleSystem.extend(/** @lends cc.ParticleFlower# */{
    /**
     * initialize a flower particle system
     * @return {Boolean}
     */
    init:function () {
        return this.initWithTotalParticles((cc.renderContextType === cc.WEBGL) ? 250 : 100);
    },

    /**
     * initialize a flower particle system with number Of Particles
     * @param {Number} numberOfParticles
     * @return {Boolean}
     */
    initWithTotalParticles:function (numberOfParticles) {
        if (cc.ParticleSystem.prototype.initWithTotalParticles.call(this, numberOfParticles)) {
            // duration
            this.setDuration(cc.PARTICLE_DURATION_INFINITY);

            // Gravity Mode
            this.setEmitterMode(cc.PARTICLE_MODE_GRAVITY);

            // Gravity Mode: gravity
            this.setGravity(cc.p(0, 0));

            // Gravity Mode: speed of particles
            this.setSpeed(80);
            this.setSpeedVar(10);

            // Gravity Mode: radial
            this.setRadialAccel(-60);
            this.setRadialAccelVar(0);

            // Gravity Mode: tangential
            this.setTangentialAccel(15);
            this.setTangentialAccelVar(0);

            // angle
            this.setAngle(90);
            this.setAngleVar(360);

            // emitter position
            var winSize = cc.Director.getInstance().getWinSize();
            this.setPosition(winSize.width / 2, winSize.height / 2);
            this.setPosVar(cc.PointZero());

            // life of particles
            this.setLife(4);
            this.setLifeVar(1);

            // size, in pixels
            this.setStartSize(30.0);
            this.setStartSizeVar(10.0);
            this.setEndSize(cc.PARTICLE_START_SIZE_EQUAL_TO_END_SIZE);

            // emits per second
            this.setEmissionRate(this.getTotalParticles() / this.getLife());

            // color of particles
            this.setStartColor(cc.c4f(0.5,0.5,0.5,1));
            this.setStartColorVar(cc.c4f(0.5,0.5,0.5,0.5));
            this.setEndColor(cc.c4f(0,0,0,1));
            this.setEndColorVar(cc.c4f(0,0,0,0));

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
 * @extends cc.ParticleSystem
 *
 * @example
 * var emitter = cc.ParticleMeteor.create();
 */
cc.ParticleMeteor = cc.ParticleSystem.extend(/** @lends cc.ParticleMeteor# */{
    /**
     * initialize a meteor particle system
     * @return {Boolean}
     */
    init:function () {
        return this.initWithTotalParticles((cc.renderContextType === cc.WEBGL) ? 150 : 100);
    },

    /**
     * initialize a meteor particle system with number Of Particles
     * @param {Number} numberOfParticles
     * @return {Boolean}
     */
    initWithTotalParticles:function (numberOfParticles) {
        if (cc.ParticleSystem.prototype.initWithTotalParticles.call(this, numberOfParticles)) {
            // duration
            this.setDuration(cc.PARTICLE_DURATION_INFINITY);

            // Gravity Mode
            this.setEmitterMode(cc.PARTICLE_MODE_GRAVITY);

            // Gravity Mode: gravity
            this.setGravity(cc.p(-200, 200));

            // Gravity Mode: speed of particles
            this.setSpeed(15);
            this.setSpeedVar(5);

            // Gravity Mode: radial
            this.setRadialAccel(0);
            this.setRadialAccelVar(0);

            // Gravity Mode: tangential
            this.setTangentialAccel(0);
            this.setTangentialAccelVar(0);

            // angle
            this.setAngle(90);
            this.setAngleVar(360);

            // emitter position
            var winSize = cc.Director.getInstance().getWinSize();
            this.setPosition(winSize.width / 2, winSize.height / 2);
            this.setPosVar(cc.PointZero());

            // life of particles
            this.setLife(2);
            this.setLifeVar(1);

            // size, in pixels
            this.setStartSize(60.0);
            this.setStartSizeVar(10.0);
            this.setEndSize(cc.PARTICLE_START_SIZE_EQUAL_TO_END_SIZE);

            // emits per second
            this.setEmissionRate(this.getTotalParticles() / this.getLife());

            // color of particles
            this.setStartColor(cc.c4f(0.2,0.4,0.7,1));
            this.setStartColorVar(cc.c4f(0,0,0.2,0.1));
            this.setEndColor(cc.c4f(0,0,0,1));
            this.setEndColorVar(cc.c4f(0,0,0,0));

            // additive
            this.setBlendAdditive(true);
            return true;
        }
        return false;
    }
});

/**
 * Create a meteor particle system
 * @return {cc.ParticleMeteor}
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
 * @extends cc.ParticleSystem
 *
 * @example
 * var emitter = cc.ParticleSpiral.create();
 */
cc.ParticleSpiral = cc.ParticleSystem.extend(/** @lends cc.ParticleSpiral# */{
    /**
     * initialize a spiral particle system
     * @return {Boolean}
     */
    init:function () {
        return this.initWithTotalParticles((cc.renderContextType === cc.WEBGL) ? 500 : 100);
    },

    /**
     * initialize a spiral particle system with number Of Particles
     * @param {Number} numberOfParticles
     * @return {Boolean}
     */
    initWithTotalParticles:function (numberOfParticles) {
        if (cc.ParticleSystem.prototype.initWithTotalParticles.call(this, numberOfParticles)) {
            // duration
            this.setDuration(cc.PARTICLE_DURATION_INFINITY);

            // Gravity Mode
            this.setEmitterMode(cc.PARTICLE_MODE_GRAVITY);

            // Gravity Mode: gravity
            this.setGravity(cc.p(0, 0));

            // Gravity Mode: speed of particles
            this.setSpeed(150);
            this.setSpeedVar(0);

            // Gravity Mode: radial
            this.setRadialAccel(-380);
            this.setRadialAccelVar(0);

            // Gravity Mode: tangential
            this.setTangentialAccel(45);
            this.setTangentialAccelVar(0);

            // angle
            this.setAngle(90);
            this.setAngleVar(0);

            // emitter position
            var winSize = cc.Director.getInstance().getWinSize();
            this.setPosition(winSize.width / 2, winSize.height / 2);
            this.setPosVar(cc.PointZero());

            // life of particles
            this.setLife(12);
            this.setLifeVar(0);

            // size, in pixels
            this.setStartSize(20.0);
            this.setStartSizeVar(0.0);
            this.setEndSize(cc.PARTICLE_START_SIZE_EQUAL_TO_END_SIZE);

            // emits per second
            this.setEmissionRate(this.getTotalParticles() / this.getLife());

            // color of particles
            this.setStartColor(cc.c4f(0.5,0.5,0.5,1));
            this.setStartColorVar(cc.c4f(0.5,0.5,0.5,0));
            this.setEndColor(cc.c4f(0.5,0.5,0.5,1));
            this.setEndColorVar(cc.c4f(0.5,0.5,0.5,0));

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
 * @extends cc.ParticleSystem
 *
 * @example
 * var emitter = cc.ParticleExplosion.create();
 */
cc.ParticleExplosion = cc.ParticleSystem.extend(/** @lends cc.ParticleExplosion# */{
    /**
     * initialize an explosion particle system
     * @return {Boolean}
     */
    init:function () {
        //return this.initWithTotalParticles(700);
        return this.initWithTotalParticles((cc.renderContextType === cc.WEBGL) ? 700 : 300);
    },

    /**
     * initialize an explosion particle system with number Of Particles
     * @param {Number} numberOfParticles
     * @return {Boolean}
     */
    initWithTotalParticles:function (numberOfParticles) {
        if (cc.ParticleSystem.prototype.initWithTotalParticles.call(this, numberOfParticles)) {
            // duration
            this.setDuration(0.1);

            this.setEmitterMode(cc.PARTICLE_MODE_GRAVITY);

            // Gravity Mode: gravity
            this.setGravity(cc.p(0, 0));

            // Gravity Mode: speed of particles
            this.setSpeed(70);
            this.setSpeedVar(40);

            // Gravity Mode: radial
            this.setRadialAccel(0);
            this.setRadialAccelVar(0);

            // Gravity Mode: tangential
            this.setTangentialAccel(0);
            this.setTangentialAccelVar(0);

            // angle
            this.setAngle(90);
            this.setAngleVar(360);

            // emitter position
            var winSize = cc.Director.getInstance().getWinSize();
            this.setPosition(winSize.width / 2, winSize.height / 2);
            this.setPosVar(cc.PointZero());

            // life of particles
            this.setLife(5.0);
            this.setLifeVar(2);

            // size, in pixels
            this.setStartSize(15.0);
            this.setStartSizeVar(10.0);
            this.setEndSize(cc.PARTICLE_START_SIZE_EQUAL_TO_END_SIZE);

            // emits per second
            this.setEmissionRate(this.getTotalParticles() / this.getDuration());

            // color of particles
            this.setStartColor(cc.c4f(0.7,0.1,0.2,1));
            this.setStartColorVar(cc.c4f(0.5,0.5,0.5,0));
            this.setEndColor(cc.c4f(0.5,0.5,0.5,0));
            this.setEndColorVar(cc.c4f(0.5,0.5,0.5,0));

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
 * @extends cc.ParticleSystem
 *
 * @example
 * var emitter = cc.ParticleSmoke.create();
 */
cc.ParticleSmoke = cc.ParticleSystem.extend(/** @lends cc.ParticleSmoke# */{
    /**
     * initialize a smoke particle system
     * @return {Boolean}
     */
    init:function () {
        //return this.initWithTotalParticles(200);
        return this.initWithTotalParticles((cc.renderContextType === cc.WEBGL) ? 200 : 100);
    },

    /**
     * initialize a smoke particle system with number Of Particles
     * @param {Number} numberOfParticles
     * @return {Boolean}
     */
    initWithTotalParticles:function (numberOfParticles) {
        if (cc.ParticleSystem.prototype.initWithTotalParticles.call(this, numberOfParticles)) {
            // duration
            this.setDuration(cc.PARTICLE_DURATION_INFINITY);

            // Emitter mode: Gravity Mode
            this.setEmitterMode(cc.PARTICLE_MODE_GRAVITY);

            // Gravity Mode: gravity
            this.setGravity(cc.p(0, 0));

            // Gravity Mode: radial acceleration
            this.setRadialAccel(0);
            this.setRadialAccelVar(0);

            // Gravity Mode: speed of particles
            this.setSpeed(25);
            this.setSpeedVar(10);

            // angle
            this.setAngle(90);
            this.setAngleVar(5);

            // emitter position
            var winSize = cc.Director.getInstance().getWinSize();
            this.setPosition(winSize.width / 2, 0);
            this.setPosVar(cc.p(20, 0));

            // life of particles
            this.setLife(4);
            this.setLifeVar(1);

            // size, in pixels
            this.setStartSize(60.0);
            this.setStartSizeVar(10.0);
            this.setEndSize(cc.PARTICLE_START_SIZE_EQUAL_TO_END_SIZE);

            // emits per frame
            this.setEmissionRate(this.getTotalParticles() / this.getLife());

            // color of particles
            this.setStartColor(cc.c4f(0.8,0.8,0.8,1));
            this.setStartColorVar(cc.c4f(0.02,0.02,0.02,0));
            this.setEndColor(cc.c4f(0,0,0,1));
            this.setEndColorVar(cc.c4f(0,0,0,0));

            // additive
            this.setBlendAdditive(false);
            return true;
        }
        return false;
    }
});

/**
 * Create a smoke particle system
 * @return {cc.ParticleSmoke}
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
 * @extends cc.ParticleSystem
 *
 * @example
 * var emitter = cc.ParticleSnow.create();
 */
cc.ParticleSnow = cc.ParticleSystem.extend(/** @lends cc.ParticleSnow# */{
    /**
     * initialize a snow particle system
     * @return {Boolean}
     */
    init:function () {
        return this.initWithTotalParticles((cc.renderContextType === cc.WEBGL) ? 700 : 250);
    },

    /**
     * initialize a snow particle system with number Of Particles
     * @param {Number} numberOfParticles
     * @return {Boolean}
     */
    initWithTotalParticles:function (numberOfParticles) {
        if (cc.ParticleSystem.prototype.initWithTotalParticles.call(this, numberOfParticles)) {
            // duration
            this.setDuration(cc.PARTICLE_DURATION_INFINITY);

            // set gravity mode.
            this.setEmitterMode(cc.PARTICLE_MODE_GRAVITY);

            // Gravity Mode: gravity
            this.setGravity(cc.p(0, -1));

            // Gravity Mode: speed of particles
            this.setSpeed(5);
            this.setSpeedVar(1);

            // Gravity Mode: radial
            this.setRadialAccel(0);
            this.setRadialAccelVar(1);

            // Gravity mode: tangential
            this.setTangentialAccel(0);
            this.setTangentialAccelVar(1);

            // emitter position
            var winSize = cc.Director.getInstance().getWinSize();
            this.setPosition(winSize.width / 2, winSize.height + 10);
            this.setPosVar(cc.p(winSize.width / 2, 0));

            // angle
            this.setAngle(-90);
            this.setAngleVar(5);

            // life of particles
            this.setLife(45);
            this.setLifeVar(15);

            // size, in pixels
            this.setStartSize(10.0);
            this.setStartSizeVar(5.0);
            this.setEndSize(cc.PARTICLE_START_SIZE_EQUAL_TO_END_SIZE);

            // emits per second
            this.setEmissionRate(10);

            // color of particles
            this.setStartColor(cc.c4f(1,1,1,1));
            this.setStartColorVar(cc.c4f(0,0,0,0));
            this.setEndColor(cc.c4f(1,1,1,0));
            this.setEndColorVar(cc.c4f(0,0,0,0));

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
 * @extends cc.ParticleSystem
 *
 * @example
 * var emitter = cc.ParticleRain.create();
 */
cc.ParticleRain = cc.ParticleSystem.extend(/** @lends cc.ParticleRain# */{
    /**
     * initialize a rain particle system
     * @return {Boolean}
     */
    init:function () {
        return this.initWithTotalParticles((cc.renderContextType === cc.WEBGL) ? 1000 : 300);
    },

    /**
     * initialize a rain particle system with number Of Particles
     * @param {Number} numberOfParticles
     * @return {Boolean}
     */
    initWithTotalParticles:function (numberOfParticles) {
        if (cc.ParticleSystem.prototype.initWithTotalParticles.call(this, numberOfParticles)) {
            // duration
            this.setDuration(cc.PARTICLE_DURATION_INFINITY);

            this.setEmitterMode(cc.PARTICLE_MODE_GRAVITY);

            // Gravity Mode: gravity
            this.setGravity(cc.p(10, -10));

            // Gravity Mode: radial
            this.setRadialAccel(0);
            this.setRadialAccelVar(1);

            // Gravity Mode: tangential
            this.setTangentialAccel(0);
            this.setTangentialAccelVar(1);

            // Gravity Mode: speed of particles
            this.setSpeed(130);
            this.setSpeedVar(30);

            // angle
            this.setAngle(-90);
            this.setAngleVar(5);


            // emitter position
            var winSize = cc.Director.getInstance().getWinSize();
            this.setPosition(winSize.width / 2, winSize.height);
            this.setPosVar(cc.p(winSize.width / 2, 0));

            // life of particles
            this.setLife(4.5);
            this.setLifeVar(0);

            // size, in pixels
            this.setStartSize(4.0);
            this.setStartSizeVar(2.0);
            this.setEndSize(cc.PARTICLE_START_SIZE_EQUAL_TO_END_SIZE);

            // emits per second
            this.setEmissionRate(20);

            // color of particles
            this.setStartColor(cc.c4f(0.7,0.8,1,1));
            this.setStartColorVar(cc.c4f(0,0,0,0));
            this.setEndColor(cc.c4f(0.7,0.8,1,0.5));
            this.setEndColorVar(cc.c4f(0,0,0,0));

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
