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

// ideas taken from:
//   . The ocean spray in your face [Jeff Lander]
//      http://www.double.co.nz/dust/col0798.pdf
//   . Building an Advanced Particle System [John van der Burg]
//      http://www.gamasutra.com/features/20000623/vanderburg_01.htm
//   . LOVE game engine
//      http://love2d.org/
//
//
// Radius mode support, from 71 squared
//      http://particledesigner.71squared.com/
//
// IMPORTANT: Particle Designer is supported by cocos2d, but
// 'Radius Mode' in Particle Designer uses a fixed emit rate of 30 hz. Since that can't be guarateed in cocos2d,
//  cocos2d uses a another approach, but the results are almost identical.
//

/**
 * Shape Mode of Particle Draw
 * @constant
 * @type Number
 */
cc.PARTICLE_SHAPE_MODE = 0;
/**
 * Texture Mode of Particle Draw
 * @constant
 * @type Number
 */
cc.PARTICLE_TEXTURE_MODE = 1;

/**
 * Star Shape for ShapeMode of Particle
 * @constant
 * @type Number
 */
cc.PARTICLE_STAR_SHAPE = 0;
/**
 * Ball Shape for ShapeMode of Particle
 * @constant
 * @type Number
 */
cc.PARTICLE_BALL_SHAPE = 1;

/**
 * The Particle emitter lives forever
 * @constant
 * @type Number
 */
cc.PARTICLE_DURATION_INFINITY = -1;

/**
 * The starting size of the particle is equal to the ending size
 * @constant
 * @type Number
 */
cc.PARTICLE_START_SIZE_EQUAL_TO_END_SIZE = -1;

/**
 * The starting radius of the particle is equal to the ending radius
 * @constant
 * @type Number
 */
cc.PARTICLE_START_RADIUS_EQUAL_TO_END_RADIUS = -1;

/**
 * Gravity mode (A mode)
 * @constant
 * @type Number
 */
cc.PARTICLE_MODE_GRAVITY = 0;

/**
 * Radius mode (B mode)
 * @constant
 * @type Number
 */
cc.PARTICLE_MODE_RADIUS = 1;

// tCCPositionType
// possible types of particle positions

/**
 * Living particles are attached to the world and are unaffected by emitter repositioning.
 * @constant
 * @type Number
 */
cc.PARTICLE_TYPE_FREE = 0;

/**
 * Living particles are attached to the world but will follow the emitter repositioning.<br/>
 * Use case: Attach an emitter to an sprite, and you want that the emitter follows the sprite.
 * @constant
 * @type Number
 */
cc.PARTICLE_TYPE_RELATIVE = 1;

/**
 * Living particles are attached to the emitter and are translated along with it.
 * @constant
 * @type Number
 */
cc.PARTICLE_TYPE_GROUPED = 2;

// backward compatible
cc.PARTICLE_TYPE_FREE = cc.PARTICLE_TYPE_FREE;
cc.PARTICLE_TYPE_GROUPED = cc.PARTICLE_TYPE_GROUPED;

/**
 * Structure that contains the values of each particle
 * @Class
 * @Construct
 * @param {cc.Point} pos Position of particle
 * @param {cc.Point} startPos
 * @param {cc.Color4F} color
 * @param {cc.Color4F} deltaColor
 * @param {cc.Size} size
 * @param {cc.Size} deltaSize
 * @param {Number} rotation
 * @param {Number} deltaRotation
 * @param {Number} timeToLive
 * @param {cc.Particle.ModeA} modeA
 * @param {cc.Particle.ModeA} modeB
 */
cc.Particle = function (pos, startPos, color, deltaColor, size, deltaSize, rotation, deltaRotation, timeToLive, atlasIndex, modeA, modeB) {
    this.pos = pos ? pos : cc.PointZero();
    this.startPos = startPos ? startPos : cc.PointZero();
    this.color = color ? color : new cc.Color4F(0, 0, 0, 1);
    this.deltaColor = deltaColor ? deltaColor : new cc.Color4F(0, 0, 0, 1);
    this.size = size || 0;
    this.deltaSize = deltaSize || 0;
    this.rotation = rotation || 0;
    this.deltaRotation = deltaRotation || 0;
    this.timeToLive = timeToLive || 0;
    this.atlasIndex = atlasIndex || 0;
    this.modeA = modeA ? modeA : new cc.Particle.ModeA();
    this.modeB = modeB ? modeB : new cc.Particle.ModeB();
    this.isChangeColor = false;
    this.drawPos = cc.p(0, 0);
};

/**
 * Mode A: gravity, direction, radial accel, tangential accel
 * @Class
 * @Construct
 * @param {cc.Point} dir direction of particle
 * @param {Number} radialAccel
 * @param {Number} tangentialAccel
 */
cc.Particle.ModeA = function (dir, radialAccel, tangentialAccel) {
    this.dir = dir ? dir : cc.PointZero();
    this.radialAccel = radialAccel || 0;
    this.tangentialAccel = tangentialAccel || 0;
};

/**
 * Mode B: radius mode
 * @Class
 * @Construct
 * @param {Number} angle
 * @param {Number} degreesPerSecond
 * @param {Number} radius
 * @param {Number} deltaRadius
 */
cc.Particle.ModeB = function (angle, degreesPerSecond, radius, deltaRadius) {
    this.angle = angle || 0;
    this.degreesPerSecond = degreesPerSecond || 0;
    this.radius = radius || 0;
    this.deltaRadius = deltaRadius || 0;
};

/**
  * Array of Point instances used to optimize particle updates
  */
cc.Particle.TemporaryPoints = [
    cc.p(),
    cc.p(),
    cc.p(),
    cc.p()
];

/**
 * <p>
 *     Particle System base class. <br/>
 *     Attributes of a Particle System:<br/>
 *     - emmision rate of the particles<br/>
 *     - Gravity Mode (Mode A): <br/>
 *     - gravity <br/>
 *     - direction <br/>
 *     - speed +-  variance <br/>
 *     - tangential acceleration +- variance<br/>
 *     - radial acceleration +- variance<br/>
 *     - Radius Mode (Mode B):      <br/>
 *     - startRadius +- variance    <br/>
 *     - endRadius +- variance      <br/>
 *     - rotate +- variance         <br/>
 *     - Properties common to all modes: <br/>
 *     - life +- life variance      <br/>
 *     - start spin +- variance     <br/>
 *     - end spin +- variance       <br/>
 *     - start size +- variance     <br/>
 *     - end size +- variance       <br/>
 *     - start color +- variance    <br/>
 *     - end color +- variance      <br/>
 *     - life +- variance           <br/>
 *     - blending function          <br/>
 *     - texture                    <br/>
 *                                  <br/>
 *     cocos2d also supports particles generated by Particle Designer (http://particledesigner.71squared.com/).<br/>
 *     'Radius Mode' in Particle Designer uses a fixed emit rate of 30 hz. Since that can't be guarateed in cocos2d,  <br/>
 *     cocos2d uses a another approach, but the results are almost identical.<br/>
 *     cocos2d supports all the variables used by Particle Designer plus a bit more:  <br/>
 *     - spinning particles (supported when using CCParticleSystemQuad)       <br/>
 *     - tangential acceleration (Gravity mode)                               <br/>
 *     - radial acceleration (Gravity mode)                                   <br/>
 *     - radius direction (Radius mode) (Particle Designer supports outwards to inwards direction only) <br/>
 *     It is possible to customize any of the above mentioned properties in runtime. Example:   <br/>
 * </p>
 * @class
 * @extends cc.Node
 *
 * @example
 *  emitter.radialAccel = 15;
 *  emitter.startSpin = 0;
 */
cc.ParticleSystem = cc.Node.extend(/** @lends cc.ParticleSystem# */{
    //***********variables*************
    _plistFile:"",
    //! time elapsed since the start of the system (in seconds)
    _elapsed:0,

    _dontTint:false,

    // Different modes
    //! Mode A:Gravity + Tangential Accel + Radial Accel
    modeA:null,
    //! Mode B: circular movement (gravity, radial accel and tangential accel don't are not used in this mode)
    modeB:null,

    //private POINTZERO for ParticleSystem
    _pointZeroForParticle:cc.p(0, 0),

    //! Array of particles
    _particles:null,

    // color modulate
    //  BOOL colorModulate;

    //! How many particles can be emitted per second
    _emitCounter:0,
    //!  particle idx
    _particleIdx:0,

    _batchNode:null,
    /**
     * return weak reference to the cc.SpriteBatchNode that renders the cc.Sprite
     * @return {cc.ParticleBatchNode}
     */
    getBatchNode:function () {
        return this._batchNode;
    },

    /**
     *  set weak reference to the cc.SpriteBatchNode that renders the cc.Sprite
     * @param {cc.ParticleBatchNode} batchNode
     */
    setBatchNode:function (batchNode) {
        if (this._batchNode != batchNode) {
            this._batchNode = batchNode; //weak reference

            if (batchNode) {
                for (var i = 0; i < this._totalParticles; i++) {
                    this._particles[i].atlasIndex = i;
                }
            }
        }
    },

    _atlasIndex:0,
    /**
     * return index of system in batch node array
     * @return {Number}
     */
    getAtlasIndex:function () {
        return this._atlasIndex;
    },

    /**
     * set index of system in batch node array
     * @param {Number} atlasIndex
     */
    setAtlasIndex:function (atlasIndex) {
        this._atlasIndex = atlasIndex;
    },

    //true if scaled or rotated
    _transformSystemDirty:false,

    _allocatedParticles:0,

    //drawMode
    _drawMode:cc.PARTICLE_SHAPE_MODE,

    /**
     * Return DrawMode of ParticleSystem
     * @return {Number}
     */
    getDrawMode:function () {
        return this._drawMode;
    },

    /**
     * DrawMode of ParticleSystem setter
     * @param {Number} drawMode
     */
    setDrawMode:function (drawMode) {
        this._drawMode = drawMode;
    },

    //shape type
    _shapeType:cc.PARTICLE_BALL_SHAPE,

    /**
     * Return ShapeType of ParticleSystem
     * @return {Number}
     */
    getShapeType:function () {
        return this._shapeType;
    },

    /**
     * ShapeType of ParticleSystem setter
     * @param {Number} shapeType
     */
    setShapeType:function (shapeType) {
        this._shapeType = shapeType;
    },

    _isActive:false,
    /**
     * Return ParticleSystem is active
     * @return {Boolean}
     */
    isActive:function () {
        return this._isActive;
    },

    _particleCount:0,

    /**
     * Quantity of particles that are being simulated at the moment
     * @return {Number}
     */
    getParticleCount:function () {
        return this._particleCount;
    },

    /**
     * Quantity of particles setter
     * @param {Number} particleCount
     */
    setParticleCount:function (particleCount) {
        this._particleCount = particleCount;
    },

    _duration:0,
    /**
     * How many seconds the emitter wil run. -1 means 'forever'
     * @return {Number}
     */
    getDuration:function () {
        return this._duration;
    },

    /**
     * set run seconds of the emitter
     * @param {Number} duration
     */
    setDuration:function (duration) {
        this._duration = duration;
    },

    _sourcePosition:cc.PointZero(),
    /**
     * Return sourcePosition of the emitter
     * @return {cc.Point}
     */
    getSourcePosition:function () {
        return this._sourcePosition;
    },

    /**
     * sourcePosition of the emitter setter
     * @param sourcePosition
     */
    setSourcePosition:function (sourcePosition) {
        this._sourcePosition = sourcePosition;
    },

    _posVar:cc.PointZero(),
    /**
     * Return Position variance of the emitter
     * @return {cc.Point}
     */
    getPosVar:function () {
        return this._posVar;
    },

    /**
     * Position variance of the emitter setter
     * @param {cc.Point} posVar
     */
    setPosVar:function (posVar) {
        this._posVar = posVar;
    },

    _life:0,
    /**
     * Return life of each particle
     * @return {Number}
     */
    getLife:function () {
        return this._life;
    },

    /**
     * life of each particle setter
     * @param {Number} life
     */
    setLife:function (life) {
        this._life = life;
    },

    _lifeVar:0,
    /**
     * Return life variance of each particle
     * @return {Number}
     */
    getLifeVar:function () {
        return this._lifeVar;
    },

    /**
     * life variance of each particle setter
     * @param {Number} lifeVar
     */
    setLifeVar:function (lifeVar) {
        this._lifeVar = lifeVar;
    },

    _angle:0,
    /**
     * Return angle of each particle
     * @return {Number}
     */
    getAngle:function () {
        return this._angle;
    },

    /**
     * angle of each particle setter
     * @param {Number} angle
     */
    setAngle:function (angle) {
        this._angle = angle;
    },

    _angleVar:0,
    /**
     * Return angle variance of each particle
     * @return {Number}
     */
    getAngleVar:function () {
        return this._angleVar;
    },

    /**
     * angle variance of each particle setter
     * @param angleVar
     */
    setAngleVar:function (angleVar) {
        this._angleVar = angleVar;
    },

    // mode A
    /**
     * Return Gravity of emitter
     * @return {cc.Point}
     */
    getGravity:function () {
        cc.Assert(this._emitterMode == cc.PARTICLE_MODE_GRAVITY, "Particle Mode should be Gravity");
        return this.modeA.gravity;
    },

    /**
     * Gravity of emitter setter
     * @param {cc.Point} gravity
     */
    setGravity:function (gravity) {
        cc.Assert(this._emitterMode == cc.PARTICLE_MODE_GRAVITY, "Particle Mode should be Gravity");
        this.modeA.gravity = gravity;
    },

    /**
     * Return Speed of each particle
     * @return {Number}
     */
    getSpeed:function () {
        cc.Assert(this._emitterMode == cc.PARTICLE_MODE_GRAVITY, "Particle Mode should be Gravity");
        return this.modeA.speed;
    },

    /**
     * Speed of each particle setter
     * @param {Number} speed
     */
    setSpeed:function (speed) {
        cc.Assert(this._emitterMode == cc.PARTICLE_MODE_GRAVITY, "Particle Mode should be Gravity");
        this.modeA.speed = speed;
    },

    /**
     * return speed variance of each particle. Only available in 'Gravity' mode.
     * @return {Number}
     */
    getSpeedVar:function () {
        cc.Assert(this._emitterMode == cc.PARTICLE_MODE_GRAVITY, "Particle Mode should be Gravity");
        return this.modeA.speedVar;
    },

    /**
     * speed variance of each particle setter. Only available in 'Gravity' mode.
     * @param {Number} speedVar
     */
    setSpeedVar:function (speedVar) {
        cc.Assert(this._emitterMode == cc.PARTICLE_MODE_GRAVITY, "Particle Mode should be Gravity");
        this.modeA.speedVar = speedVar;
    },

    /**
     * Return tangential acceleration of each particle. Only available in 'Gravity' mode.
     * @return {Number}
     */
    getTangentialAccel:function () {
        cc.Assert(this._emitterMode == cc.PARTICLE_MODE_GRAVITY, "Particle Mode should be Gravity");
        return this.modeA.tangentialAccel;
    },

    /**
     * Tangential acceleration of each particle setter. Only available in 'Gravity' mode.
     * @param {Number} tangentialAccel
     */
    setTangentialAccel:function (tangentialAccel) {
        cc.Assert(this._emitterMode == cc.PARTICLE_MODE_GRAVITY, "Particle Mode should be Gravity");
        this.modeA.tangentialAccel = tangentialAccel;
    },

    /**
     * Return tangential acceleration variance of each particle. Only available in 'Gravity' mode.
     * @return {Number}
     */
    getTangentialAccelVar:function () {
        cc.Assert(this._emitterMode == cc.PARTICLE_MODE_GRAVITY, "Particle Mode should be Gravity");
        return this.modeA.tangentialAccelVar;
    },

    /**
     * tangential acceleration variance of each particle setter. Only available in 'Gravity' mode.
     * @param {Number} tangentialAccelVar
     */
    setTangentialAccelVar:function (tangentialAccelVar) {
        cc.Assert(this._emitterMode == cc.PARTICLE_MODE_GRAVITY, "Particle Mode should be Gravity");
        this.modeA.tangentialAccelVar = tangentialAccelVar;
    },

    /**
     * Return radial acceleration of each particle. Only available in 'Gravity' mode.
     * @return {Number}
     */
    getRadialAccel:function () {
        cc.Assert(this._emitterMode == cc.PARTICLE_MODE_GRAVITY, "Particle Mode should be Gravity");
        return this.modeA.radialAccel;
    },

    /**
     * radial acceleration of each particle setter. Only available in 'Gravity' mode.
     * @param {Number} radialAccel
     */
    setRadialAccel:function (radialAccel) {
        cc.Assert(this._emitterMode == cc.PARTICLE_MODE_GRAVITY, "Particle Mode should be Gravity");
        this.modeA.radialAccel = radialAccel;
    },

    /**
     * Return radial acceleration variance of each particle. Only available in 'Gravity' mode.
     * @return {Number}
     */
    getRadialAccelVar:function () {
        cc.Assert(this._emitterMode == cc.PARTICLE_MODE_GRAVITY, "Particle Mode should be Gravity");
        return this.modeA.radialAccelVar;
    },

    /**
     * radial acceleration variance of each particle setter. Only available in 'Gravity' mode.
     * @param radialAccelVar
     */
    setRadialAccelVar:function (radialAccelVar) {
        cc.Assert(this._emitterMode == cc.PARTICLE_MODE_GRAVITY, "Particle Mode should be Gravity");
        this.modeA.radialAccelVar = radialAccelVar;
    },

    // mode B
    /**
     * Return starting radius of the particles. Only available in 'Radius' mode.
     * @return {Number}
     */
    getStartRadius:function () {
        cc.Assert(this._emitterMode == cc.PARTICLE_MODE_RADIUS, "Particle Mode should be Radius");
        return this.modeB.startRadius;
    },

    /**
     * starting radius of the particles setter. Only available in 'Radius' mode.
     * @param {Number} startRadius
     */
    setStartRadius:function (startRadius) {
        cc.Assert(this._emitterMode == cc.PARTICLE_MODE_RADIUS, "Particle Mode should be Radius");
        this.modeB.startRadius = startRadius;
    },

    /**
     * Return starting radius variance of the particles. Only available in 'Radius' mode.
     * @return {Number}
     */
    getStartRadiusVar:function () {
        cc.Assert(this._emitterMode == cc.PARTICLE_MODE_RADIUS, "Particle Mode should be Radius");
        return this.modeB.startRadiusVar;
    },

    /**
     * starting radius variance of the particles setter. Only available in 'Radius' mode.
     * @param {Number} startRadiusVar
     */
    setStartRadiusVar:function (startRadiusVar) {
        cc.Assert(this._emitterMode == cc.PARTICLE_MODE_RADIUS, "Particle Mode should be Radius");
        this.modeB.startRadiusVar = startRadiusVar;
    },

    /**
     * Return ending radius of the particles. Only available in 'Radius' mode.
     * @return {Number}
     */
    getEndRadius:function () {
        cc.Assert(this._emitterMode == cc.PARTICLE_MODE_RADIUS, "Particle Mode should be Radius");
        return this.modeB.endRadius;
    },

    /**
     * ending radius of the particles setter. Only available in 'Radius' mode.
     * @param {Number} endRadius
     */
    setEndRadius:function (endRadius) {
        cc.Assert(this._emitterMode == cc.PARTICLE_MODE_RADIUS, "Particle Mode should be Radius");
        this.modeB.endRadius = endRadius;
    },

    /**
     * Return ending radius variance of the particles. Only available in 'Radius' mode.
     * @return {Number}
     */
    getEndRadiusVar:function () {
        cc.Assert(this._emitterMode == cc.PARTICLE_MODE_RADIUS, "Particle Mode should be Radius");
        return this.modeB.endRadiusVar;
    },

    /**
     * ending radius variance of the particles setter. Only available in 'Radius' mode.
     * @param endRadiusVar
     */
    setEndRadiusVar:function (endRadiusVar) {
        cc.Assert(this._emitterMode == cc.PARTICLE_MODE_RADIUS, "Particle Mode should be Radius");
        this.modeB.endRadiusVar = endRadiusVar;
    },

    /**
     * get Number of degress to rotate a particle around the source pos per second. Only available in 'Radius' mode.
     * @return {Number}
     */
    getRotatePerSecond:function () {
        cc.Assert(this._emitterMode == cc.PARTICLE_MODE_RADIUS, "Particle Mode should be Radius");
        return this.modeB.rotatePerSecond;
    },

    /**
     * set Number of degress to rotate a particle around the source pos per second. Only available in 'Radius' mode.
     * @param {Number} degrees
     */
    setRotatePerSecond:function (degrees) {
        cc.Assert(this._emitterMode == cc.PARTICLE_MODE_RADIUS, "Particle Mode should be Radius");
        this.modeB.rotatePerSecond = degrees;
    },

    /**
     * Return Variance in degrees for rotatePerSecond. Only available in 'Radius' mode.
     * @return {Number}
     */
    getRotatePerSecondVar:function () {
        cc.Assert(this._emitterMode == cc.PARTICLE_MODE_RADIUS, "Particle Mode should be Radius");
        return this.modeB.rotatePerSecondVar;
    },

    /**
     * Variance in degrees for rotatePerSecond setter. Only available in 'Radius' mode.
     * @param degrees
     */
    setRotatePerSecondVar:function (degrees) {
        cc.Assert(this._emitterMode == cc.PARTICLE_MODE_RADIUS, "Particle Mode should be Radius");
        this.modeB.rotatePerSecondVar = degrees;
    },
    //////////////////////////////////////////////////////////////////////////

    //don't use a transform matrix, this is faster
    setScale:function (scale, scaleY) {
        this._transformSystemDirty = true;
        cc.Node.prototype.setScale.call(this, scale, scaleY);
    },

    setRotation:function (newRotation) {
        this._transformSystemDirty = true;
        cc.Node.prototype.setRotation.call(this, newRotation);
    },

    setScaleX:function (newScaleX) {
        this._transformSystemDirty = true;
        cc.Node.prototype.setScaleX.call(this, newScaleX);
    },

    setScaleY:function (newScaleY) {
        this._transformSystemDirty = true;
        cc.Node.prototype.setScaleY.call(this, newScaleY);
    },


    _startSize:0,
    /**
     * get start size in pixels of each particle
     * @return {Number}
     */
    getStartSize:function () {
        return this._startSize;
    },

    /**
     * set start size in pixels of each particle
     * @param {Number} startSize
     */
    setStartSize:function (startSize) {
        this._startSize = startSize;
    },


    _startSizeVar:0,
    /**
     * get size variance in pixels of each particle
     * @return {Number}
     */
    getStartSizeVar:function () {
        return this._startSizeVar;
    },

    /**
     * set size variance in pixels of each particle
     * @param {Number} startSizeVar
     */
    setStartSizeVar:function (startSizeVar) {
        this._startSizeVar = startSizeVar;
    },


    _endSize:0,
    /**
     * get end size in pixels of each particle
     * @return {Number}
     */
    getEndSize:function () {
        return this._endSize;
    },

    /**
     * set end size in pixels of each particle
     * @param endSize
     */
    setEndSize:function (endSize) {
        this._endSize = endSize;
    },

    _endSizeVar:0,
    /**
     * get end size variance in pixels of each particle
     * @return {Number}
     */
    getEndSizeVar:function () {
        return this._endSizeVar;
    },

    /**
     * set end size variance in pixels of each particle
     * @param {Number} endSizeVar
     */
    setEndSizeVar:function (endSizeVar) {
        this._endSizeVar = endSizeVar;
    },


    _startColor:new cc.Color4F(0, 0, 0, 1),
    /**
     * set start color of each particle
     * @return {cc.Color4F}
     */
    getStartColor:function () {
        return this._startColor;
    },

    /**
     * get start color of each particle
     * @param {cc.Color4F} startColor
     */
    setStartColor:function (startColor) {
        if (startColor instanceof cc.Color3B)
            startColor = cc.c4FFromccc3B(startColor);
        this._startColor = startColor;
    },

    _startColorVar:new cc.Color4F(0, 0, 0, 1),
    /**
     * get start color variance of each particle
     * @return {cc.Color4F}
     */
    getStartColorVar:function () {
        return this._startColorVar;
    },

    /**
     * set start color variance of each particle
     * @param {cc.Color4F} startColorVar
     */
    setStartColorVar:function (startColorVar) {
        if (startColorVar instanceof cc.Color3B)
            startColorVar = cc.c4FFromccc3B(startColorVar);
        this._startColorVar = startColorVar;
    },


    _endColor:new cc.Color4F(0, 0, 0, 1),
    /**
     * get end color and end color variation of each particle
     * @return {cc.Color4F}
     */
    getEndColor:function () {
        return this._endColor;
    },

    /**
     * set end color and end color variation of each particle
     * @param {cc.Color4F} endColor
     */
    setEndColor:function (endColor) {
        if (endColor instanceof cc.Color3B)
            endColor = cc.c4FFromccc3B(endColor);
        this._endColor = endColor;
    },

    _endColorVar:new cc.Color4F(0, 0, 0, 1),
    /**
     * get end color variance of each particle
     * @return {cc.Color4F}
     */
    getEndColorVar:function () {
        return this._endColorVar;
    },

    /**
     * set end color variance of each particle
     * @param {cc.Color4F} endColorVar
     */
    setEndColorVar:function (endColorVar) {
        if (endColorVar instanceof cc.Color3B)
            endColorVar = cc.c4FFromccc3B(endColorVar);
        this._endColorVar = endColorVar;
    },

    _startSpin:0,
    /**
     * get initial angle of each particle
     * @return {Number}
     */
    getStartSpin:function () {
        return this._startSpin;
    },

    /**
     * set initial angle of each particle
     * @param {Number} startSpin
     */
    setStartSpin:function (startSpin) {
        this._startSpin = startSpin;
    },

    _startSpinVar:0,
    /**
     * get initial angle variance of each particle
     * @return {Number}
     */
    getStartSpinVar:function () {
        return this._startSpinVar;
    },

    /**
     * set initial angle variance of each particle
     * @param {Number} startSpinVar
     */
    setStartSpinVar:function (startSpinVar) {
        this._startSpinVar = startSpinVar;
    },

    _endSpin:0,
    /**
     * get end angle of each particle
     * @return {Number}
     */
    getEndSpin:function () {
        return this._endSpin;
    },

    /**
     * set end angle of each particle
     * @param {Number} endSpin
     */
    setEndSpin:function (endSpin) {
        this._endSpin = endSpin;
    },

    _endSpinVar:0,
    /**
     * get end angle variance of each particle
     * @return {Number}
     */
    getEndSpinVar:function () {
        return this._endSpinVar;
    },

    /**
     * set end angle variance of each particle
     * @param {Number} endSpinVar
     */
    setEndSpinVar:function (endSpinVar) {
        this._endSpinVar = endSpinVar;
    },

    _emissionRate:0,
    /**
     * get emission rate of the particles
     * @return {Number}
     */
    getEmissionRate:function () {
        return this._emissionRate;
    },

    /**
     * set emission rate of the particles
     * @param {Number} emissionRate
     */
    setEmissionRate:function (emissionRate) {
        this._emissionRate = emissionRate;
    },

    _totalParticles:0,
    /**
     * get maximum particles of the system
     * @return {Number}
     */
    getTotalParticles:function () {
        return this._totalParticles;
    },

    /**
     * set maximum particles of the system
     * @param {Number} totalParticles
     */
    setTotalParticles:function (totalParticles) {
        cc.Assert(totalParticles <= this._allocatedParticles, "Particle: resizing particle array only supported for quads");
        this._totalParticles = totalParticles;
    },

    _texture:null,
    /**
     * get Texture of Particle System
     * @return {cc.Texture2D}
     */
    getTexture:function () {
        return this._texture;
    },

    /**
     * set Texture of Particle System
     * @param {cc.Texture2D | HTMLImageElement | HTMLCanvasElement} texture
     */
    setTexture:function (texture) {
        if (this._texture != texture) {
            this._texture = texture;
            this._updateBlendFunc();
        }
    },

    /** conforms to CocosNodeTexture protocol */
    _blendFunc: null,
    /**
     * get BlendFunc of Particle System
     * @return {cc.BlendFunc}
     */
    getBlendFunc:function () {
        return this._blendFunc;
    },

    /**
     * set BlendFunc of Particle System
     * @param {Number} src
     * @param {Number} dst
     */
    setBlendFunc:function (src, dst) {
        if (arguments.length == 1) {
            if (this._blendFunc != src) {
                this._blendFunc = src;
                this._updateBlendFunc();
            }
        } else {
            if (this._blendFunc.src != src || this._blendFunc.dst != dst) {
                this._blendFunc = {src:src, dst:dst};
                this._updateBlendFunc();
            }
        }

    },

    _opacityModifyRGB:false,
    /**
     * does the alpha value modify color getter
     * @return {Boolean}
     */
    getOpacityModifyRGB:function () {
        return this._opacityModifyRGB;
    },

    /**
     * does the alpha value modify color setter
     * @param newValue
     */
    setOpacityModifyRGB:function (newValue) {
        this._opacityModifyRGB = newValue;
    },

    /**
     * <p>whether or not the particles are using blend additive.<br/>
     *     If enabled, the following blending function will be used.<br/>
     * </p>
     * @return {Boolean}
     * @example
     *    source blend function = GL_SRC_ALPHA;
     *    dest blend function = GL_ONE;
     */
    isBlendAdditive:function () {
        return (( this._blendFunc.src == gl.SRC_ALPHA && this._blendFunc.dst == gl.ONE) || (this._blendFunc.src == gl.ONE && this._blendFunc.dst == gl.ONE));
    },

    /**
     * <p>whether or not the particles are using blend additive.<br/>
     *     If enabled, the following blending function will be used.<br/>
     * </p>
     * @param {Boolean} isBlendAdditive
     */
    setBlendAdditive:function (isBlendAdditive) {
        if (isBlendAdditive) {
            this._blendFunc.src = gl.SRC_ALPHA;
            this._blendFunc.dst = gl.ONE;
        } else {
            if (cc.renderContextType === cc.WEBGL) {
                if (this._texture && !this._texture.hasPremultipliedAlpha()) {
                    this._blendFunc.src = gl.SRC_ALPHA;
                    this._blendFunc.dst = gl.ONE_MINUS_SRC_ALPHA;
                } else {
                    this._blendFunc.src = cc.BLEND_SRC;
                    this._blendFunc.dst = cc.BLEND_DST;
                }
            } else {
                this._blendFunc.src = cc.BLEND_SRC;
                this._blendFunc.dst = cc.BLEND_DST;
            }
        }
    },

    _positionType:cc.PARTICLE_TYPE_FREE,
    /**
     * get particles movement type: Free or Grouped
     * @return {Number}
     */
    getPositionType:function () {
        return this._positionType;
    },

    /**
     * set particles movement type: Free or Grouped
     * @param {Number} positionType
     */
    setPositionType:function (positionType) {
        this._positionType = positionType;
    },

    _isAutoRemoveOnFinish:false,
    /**
     *  <p> return whether or not the node will be auto-removed when it has no particles left.<br/>
     *      By default it is false.<br/>
     *  </p>
     * @return {Boolean}
     */
    isAutoRemoveOnFinish:function () {
        return this._isAutoRemoveOnFinish;
    },

    /**
     *  <p> set whether or not the node will be auto-removed when it has no particles left.<br/>
     *      By default it is false.<br/>
     *  </p>
     * @param {Boolean} isAutoRemoveOnFinish
     */
    setAutoRemoveOnFinish:function (isAutoRemoveOnFinish) {
        this._isAutoRemoveOnFinish = isAutoRemoveOnFinish;
    },

    _emitterMode:0,
    /**
     * return kind of emitter modes
     * @return {Number}
     */
    getEmitterMode:function () {
        return this._emitterMode;
    },

    /**
     * <p>Switch between different kind of emitter modes:<br/>
     *  - CCPARTICLE_MODE_GRAVITY: uses gravity, speed, radial and tangential acceleration<br/>
     *  - CCPARTICLE_MODE_RADIUS: uses radius movement + rotation <br/>
     *  </p>
     * @param {Number} emitterMode
     */
    setEmitterMode:function (emitterMode) {
        this._emitterMode = emitterMode;
    },

    /**
     * Constructor
     * @override
     */
    ctor:function () {
        cc.Node.prototype.ctor.call(this);
        this._emitterMode = cc.PARTICLE_MODE_GRAVITY;
        this.modeA = new cc.ParticleSystem.ModeA();
        this.modeB = new cc.ParticleSystem.ModeB();
        this._blendFunc = {src:cc.BLEND_SRC, dst:cc.BLEND_DST};

        this._particles = [];
        this._sourcePosition = new cc.Point(0, 0);
        this._posVar = new cc.Point(0, 0);

        this._startColor = new cc.Color4F(1, 1, 1, 1);
        this._startColorVar = new cc.Color4F(1, 1, 1, 1);
        this._endColor = new cc.Color4F(1, 1, 1, 1);
        this._endColorVar = new cc.Color4F(1, 1, 1, 1);
    },

    /**
     * initializes a cc.ParticleSystem
     */
    init:function () {
        return this.initWithTotalParticles(150);
    },

    /**
     * <p>
     *     initializes a CCParticleSystem from a plist file. <br/>
     *      This plist files can be creted manually or with Particle Designer:<br/>
     *      http://particledesigner.71squared.com/
     * </p>
     * @param {String} plistFile
     * @return {cc.ParticleSystem}
     */
    initWithFile:function (plistFile) {
        this._plistFile = plistFile;
        var dict = cc.FileUtils.getInstance().dictionaryWithContentsOfFileThreadSafe(this._plistFile);

        cc.Assert(dict != null, "Particles: file not found");

        // XXX compute path from a path, should define a function somewhere to do it
        return this.initWithDictionary(dict, "");
    },

    /**
     * return bounding box of particle system in world space
     * @return {cc.Rect}
     */
    getBoundingBoxToWorld:function () {
        return cc.rect(0, 0, cc.canvas.width, cc.canvas.height);
    },

    /**
     * initializes a particle system from a NSDictionary and the path from where to load the png
     * @param {object} dictionary
     * @param {String} dirname
     * @return {Boolean}
     */
    initWithDictionary:function (dictionary, dirname) {
        var ret = false;
        var buffer = null;
        var image = null;

        var maxParticles = parseInt(this._valueForKey("maxParticles", dictionary));
        // self, not super
        if (this.initWithTotalParticles(maxParticles)) {
            // angle
            this._angle = parseFloat(this._valueForKey("angle", dictionary));
            this._angleVar = parseFloat(this._valueForKey("angleVariance", dictionary));

            // duration
            this._duration = parseFloat(this._valueForKey("duration", dictionary));

            // blend function
            this._blendFunc.src = parseInt(this._valueForKey("blendFuncSource", dictionary));
            this._blendFunc.dst = parseInt(this._valueForKey("blendFuncDestination", dictionary));

            // color
            this._startColor.r = parseFloat(this._valueForKey("startColorRed", dictionary));
            this._startColor.g = parseFloat(this._valueForKey("startColorGreen", dictionary));
            this._startColor.b = parseFloat(this._valueForKey("startColorBlue", dictionary));
            this._startColor.a = parseFloat(this._valueForKey("startColorAlpha", dictionary));

            this._startColorVar.r = parseFloat(this._valueForKey("startColorVarianceRed", dictionary));
            this._startColorVar.g = parseFloat(this._valueForKey("startColorVarianceGreen", dictionary));
            this._startColorVar.b = parseFloat(this._valueForKey("startColorVarianceBlue", dictionary));
            this._startColorVar.a = parseFloat(this._valueForKey("startColorVarianceAlpha", dictionary));

            this._endColor.r = parseFloat(this._valueForKey("finishColorRed", dictionary));
            this._endColor.g = parseFloat(this._valueForKey("finishColorGreen", dictionary));
            this._endColor.b = parseFloat(this._valueForKey("finishColorBlue", dictionary));
            this._endColor.a = parseFloat(this._valueForKey("finishColorAlpha", dictionary));

            this._endColorVar.r = parseFloat(this._valueForKey("finishColorVarianceRed", dictionary));
            this._endColorVar.g = parseFloat(this._valueForKey("finishColorVarianceGreen", dictionary));
            this._endColorVar.b = parseFloat(this._valueForKey("finishColorVarianceBlue", dictionary));
            this._endColorVar.a = parseFloat(this._valueForKey("finishColorVarianceAlpha", dictionary));

            // particle size
            this._startSize = parseFloat(this._valueForKey("startParticleSize", dictionary));
            this._startSizeVar = parseFloat(this._valueForKey("startParticleSizeVariance", dictionary));
            this._endSize = parseFloat(this._valueForKey("finishParticleSize", dictionary));
            this._endSizeVar = parseFloat(this._valueForKey("finishParticleSizeVariance", dictionary));

            // position
            var x = parseFloat(this._valueForKey("sourcePositionx", dictionary));
            var y = parseFloat(this._valueForKey("sourcePositiony", dictionary));
            this.setPosition(cc.p(x, y));
            this._posVar.x = parseFloat(this._valueForKey("sourcePositionVariancex", dictionary));
            this._posVar.y = parseFloat(this._valueForKey("sourcePositionVariancey", dictionary));

            // Spinning
            this._startSpin = parseFloat(this._valueForKey("rotationStart", dictionary));
            this._startSpinVar = parseFloat(this._valueForKey("rotationStartVariance", dictionary));
            this._endSpin = parseFloat(this._valueForKey("rotationEnd", dictionary));
            this._endSpinVar = parseFloat(this._valueForKey("rotationEndVariance", dictionary));

            this._emitterMode = parseInt(this._valueForKey("emitterType", dictionary));

            // Mode A: Gravity + tangential accel + radial accel
            if (this._emitterMode == cc.PARTICLE_MODE_GRAVITY) {
                // gravity
                this.modeA.gravity.x = parseFloat(this._valueForKey("gravityx", dictionary));
                this.modeA.gravity.y = parseFloat(this._valueForKey("gravityy", dictionary));

                // speed
                this.modeA.speed = parseFloat(this._valueForKey("speed", dictionary));
                this.modeA.speedVar = parseFloat(this._valueForKey("speedVariance", dictionary));

                // radial acceleration
                var pszTmp = this._valueForKey("radialAcceleration", dictionary);
                this.modeA.radialAccel = (pszTmp) ? parseFloat(pszTmp) : 0;

                pszTmp = this._valueForKey("radialAccelVariance", dictionary);
                this.modeA.radialAccelVar = (pszTmp) ? parseFloat(pszTmp) : 0;

                // tangential acceleration
                pszTmp = this._valueForKey("tangentialAcceleration", dictionary);
                this.modeA.tangentialAccel = (pszTmp) ? parseFloat(pszTmp) : 0;

                pszTmp = this._valueForKey("tangentialAccelVariance", dictionary);
                this.modeA.tangentialAccelVar = (pszTmp) ? parseFloat(pszTmp) : 0;

            } else if (this._emitterMode == cc.PARTICLE_MODE_RADIUS) {
                // or Mode B: radius movement
                this.modeB.startRadius = parseFloat(this._valueForKey("maxRadius", dictionary));
                this.modeB.startRadiusVar = parseFloat(this._valueForKey("maxRadiusVariance", dictionary));
                this.modeB.endRadius = parseFloat(this._valueForKey("minRadius", dictionary));
                this.modeB.endRadiusVar = 0;
                this.modeB.rotatePerSecond = parseFloat(this._valueForKey("rotatePerSecond", dictionary));
                this.modeB.rotatePerSecondVar = parseFloat(this._valueForKey("rotatePerSecondVariance", dictionary));
            } else {
                cc.Assert(false, "Invalid emitterType in config file");
                return false;
            }

            // life span
            this._life = parseFloat(this._valueForKey("particleLifespan", dictionary));
            this._lifeVar = parseFloat(this._valueForKey("particleLifespanVariance", dictionary));

            // emission Rate
            this._emissionRate = this._totalParticles / this._life;

            //don't get the internal texture if a batchNode is used
            if (!this._batchNode) {
                // Set a compatible default for the alpha transfer
                this._opacityModifyRGB = false;

                // texture
                // Try to get the texture from the cache
                var textureName = this._valueForKey("textureFileName", dictionary);
                var fullpath = cc.FileUtils.getInstance().fullPathFromRelativeFile(textureName, this._plistFile);

                var tex = cc.TextureCache.getInstance().textureForKey(fullpath);

                if (tex) {
                    this.setTexture(tex);
                } else {
                    var textureData = this._valueForKey("textureImageData", dictionary);

                    if (textureData && textureData.length == 0) {
                        cc.Assert(textureData, "cc.ParticleSystem.initWithDictory:textureImageData is null");
                        tex = cc.TextureCache.getInstance().addImage(fullpath);
                        if (!tex)
                            return false;
                        this.setTexture(tex);
                    } else {
                        buffer = cc.unzipBase64AsArray(textureData, 1);
                        if (!buffer) {
                            cc.log("cc.ParticleSystem: error decoding or ungzipping textureImageData");
                            return false;
                        }

                        var imageFormat = cc.getImageFormatByData(buffer);

                        if(imageFormat !== cc.FMT_TIFF && imageFormat !== cc.FMT_PNG){
                            cc.log("cc.ParticleSystem: unknown image format with Data");
                            return false;
                        }

                        var canvasObj = document.createElement("canvas");
                        if(imageFormat === cc.FMT_PNG){
                            var myPngObj = new cc.PNGReader(buffer);
                            myPngObj.render(canvasObj);

                        } else {
                            var myTIFFObj = cc.TIFFReader.getInstance();
                            myTIFFObj.parseTIFF(buffer,canvasObj);
                        }

                        cc.TextureCache.getInstance().cacheImage(fullpath, canvasObj);

                        var addTexture = cc.TextureCache.getInstance().textureForKey(fullpath);

                        cc.Assert(addTexture != null, "cc.ParticleSystem: error loading the texture");

                        if (cc.renderContextType === cc.CANVAS)
                            this.setTexture(canvasObj);
                        else
                            this.setTexture(addTexture);
                    }
                }

            }
            ret = true;
        }
        return ret;
    },

    /**
     * Initializes a system with a fixed number of particles
     * @param {Number} numberOfParticles
     * @return {Boolean}
     */
    initWithTotalParticles:function (numberOfParticles) {
        this._totalParticles = numberOfParticles;

        var i;
        this._particles = [];
        for(i = 0; i< numberOfParticles; i++){
            this._particles[i] = new cc.Particle();
        }

        if (!this._particles) {
            cc.log("Particle system: not enough memory");
            return false;
        }
        this._allocatedParticles = numberOfParticles;

        if (this._batchNode)
            for (i = 0; i < this._totalParticles; i++)
                this._particles[i].atlasIndex = i;

        // default, active
        this._isActive = true;

        // default blend function
        this._blendFunc.src = cc.BLEND_SRC;
        this._blendFunc.dst = cc.BLEND_DST;

        // default movement type;
        this._positionType = cc.PARTICLE_TYPE_FREE;

        // by default be in mode A:
        this._emitterMode = cc.PARTICLE_MODE_GRAVITY;

        // default: modulate
        // XXX: not used
        //  colorModulate = YES;
        this._isAutoRemoveOnFinish = false;

        // Optimization: compile udpateParticle method
        //updateParticleSel = @selector(updateQuadWithParticle:newPosition:);
        //updateParticleImp = (CC_UPDATE_PARTICLE_IMP) [self methodForSelector:updateParticleSel];

        //for batchNode
        this._transformSystemDirty = false;

        // udpate after action in run!
        this.scheduleUpdateWithPriority(1);

        return true;
    },

    destroyParticleSystem:function () {
        this.unscheduleUpdate();
    },

    /**
     * Add a particle to the emitter
     * @return {Boolean}
     */
    addParticle: function () {
        if (this.isFull())
            return false;
        var particle, particles = this._particles;
        if (cc.renderContextType === cc.CANVAS) {
            if (this._particleCount < particles.length) {
                particle = particles[this._particleCount];
            } else {
                particle = new cc.Particle();
                particles.push(particle);
            }
        } else {
            particle = particles[this._particleCount];
        }
        this.initParticle(particle);
        ++this._particleCount;
        return true;
    },

    /**
     * Initializes a particle
     * @param {cc.Particle} particle
     */
    initParticle:function (particle) {
        // timeToLive
        // no negative life. prevent division by 0
        particle.timeToLive = this._life + this._lifeVar * cc.RANDOM_MINUS1_1();
        particle.timeToLive = Math.max(0, particle.timeToLive);

        // position
        particle.pos.x = this._sourcePosition.x + this._posVar.x * cc.RANDOM_MINUS1_1();
        particle.pos.y = this._sourcePosition.y + this._posVar.y * cc.RANDOM_MINUS1_1();

        // Color
        var start, end;
        if (cc.renderContextType === cc.CANVAS) {
            start = new cc.Color4F(
                cc.clampf(this._startColor.r + this._startColorVar.r * cc.RANDOM_MINUS1_1(), 0, 1),
                cc.clampf(this._startColor.g + this._startColorVar.g * cc.RANDOM_MINUS1_1(), 0, 1),
                cc.clampf(this._startColor.b + this._startColorVar.b * cc.RANDOM_MINUS1_1(), 0, 1),
                cc.clampf(this._startColor.a + this._startColorVar.a * cc.RANDOM_MINUS1_1(), 0, 1)
            );
            end = new cc.Color4F(
                cc.clampf(this._endColor.r + this._endColorVar.r * cc.RANDOM_MINUS1_1(), 0, 1),
                cc.clampf(this._endColor.g + this._endColorVar.g * cc.RANDOM_MINUS1_1(), 0, 1),
                cc.clampf(this._endColor.b + this._endColorVar.b * cc.RANDOM_MINUS1_1(), 0, 1),
                cc.clampf(this._endColor.a + this._endColorVar.a * cc.RANDOM_MINUS1_1(), 0, 1)
            );
        } else {
            start = {
                r: cc.clampf(this._startColor.r + this._startColorVar.r * cc.RANDOM_MINUS1_1(), 0, 1),
                g: cc.clampf(this._startColor.g + this._startColorVar.g * cc.RANDOM_MINUS1_1(), 0, 1),
                b: cc.clampf(this._startColor.b + this._startColorVar.b * cc.RANDOM_MINUS1_1(), 0, 1),
                a: cc.clampf(this._startColor.a + this._startColorVar.a * cc.RANDOM_MINUS1_1(), 0, 1)
            };
            end = {
                r: cc.clampf(this._endColor.r + this._endColorVar.r * cc.RANDOM_MINUS1_1(), 0, 1),
                g: cc.clampf(this._endColor.g + this._endColorVar.g * cc.RANDOM_MINUS1_1(), 0, 1),
                b: cc.clampf(this._endColor.b + this._endColorVar.b * cc.RANDOM_MINUS1_1(), 0, 1),
                a: cc.clampf(this._endColor.a + this._endColorVar.a * cc.RANDOM_MINUS1_1(), 0, 1)
            };
        }

        particle.color = start;
        particle.deltaColor.r = (end.r - start.r) / particle.timeToLive;
        particle.deltaColor.g = (end.g - start.g) / particle.timeToLive;
        particle.deltaColor.b = (end.b - start.b) / particle.timeToLive;
        particle.deltaColor.a = (end.a - start.a) / particle.timeToLive;

        // size
        var startS = this._startSize + this._startSizeVar * cc.RANDOM_MINUS1_1();
        startS = Math.max(0, startS); // No negative value

        particle.size = startS;
        if (this._endSize === cc.PARTICLE_START_SIZE_EQUAL_TO_END_SIZE) {
            particle.deltaSize = 0;
        } else {
            var endS = this._endSize + this._endSizeVar * cc.RANDOM_MINUS1_1();
            endS = Math.max(0, endS); // No negative values
            particle.deltaSize = (endS - startS) / particle.timeToLive;
        }

        // rotation
        var startA = this._startSpin + this._startSpinVar * cc.RANDOM_MINUS1_1();
        var endA = this._endSpin + this._endSpinVar * cc.RANDOM_MINUS1_1();
        particle.rotation = startA;
        particle.deltaRotation = (endA - startA) / particle.timeToLive;

        // position
        if (this._positionType == cc.PARTICLE_TYPE_FREE)
            particle.startPos = this.convertToWorldSpace(this._pointZeroForParticle);
        else if (this._positionType == cc.PARTICLE_TYPE_RELATIVE)
            particle.startPos = this._position;

        // direction
        var a = cc.DEGREES_TO_RADIANS(this._angle + this._angleVar * cc.RANDOM_MINUS1_1());

        // Mode Gravity: A
        if (this._emitterMode === cc.PARTICLE_MODE_GRAVITY) {
            var s = this.modeA.speed + this.modeA.speedVar * cc.RANDOM_MINUS1_1();

            // direction
            particle.modeA.dir.x = Math.cos(a);
            particle.modeA.dir.y = Math.sin(a);
            cc.pMultIn(particle.modeA.dir, s);

            // radial accel
            particle.modeA.radialAccel = this.modeA.radialAccel + this.modeA.radialAccelVar * cc.RANDOM_MINUS1_1();

            // tangential accel
            particle.modeA.tangentialAccel = this.modeA.tangentialAccel + this.modeA.tangentialAccelVar * cc.RANDOM_MINUS1_1();
        } else {
            // Mode Radius: B

            // Set the default diameter of the particle from the source position
            var startRadius = this.modeB.startRadius + this.modeB.startRadiusVar * cc.RANDOM_MINUS1_1();
            var endRadius = this.modeB.endRadius + this.modeB.endRadiusVar * cc.RANDOM_MINUS1_1();

            particle.modeB.radius = startRadius;
            if (this.modeB.endRadius === cc.PARTICLE_START_RADIUS_EQUAL_TO_END_RADIUS) {
                particle.modeB.deltaRadius = 0;
            } else {
                particle.modeB.deltaRadius = (endRadius - startRadius) / particle.timeToLive;
            }

            particle.modeB.angle = a;
            particle.modeB.degreesPerSecond = cc.DEGREES_TO_RADIANS(this.modeB.rotatePerSecond + this.modeB.rotatePerSecondVar * cc.RANDOM_MINUS1_1());
        }
    },

    /**
     * stop emitting particles. Running particles will continue to run until they die
     */
    stopSystem:function () {
        this._isActive = false;
        this._elapsed = this._duration;
        this._emitCounter = 0;
    },

    /**
     * Kill all living particles.
     */
    resetSystem:function () {
        this._isActive = true;
        this._elapsed = 0;
        for (this._particleIdx = 0; this._particleIdx < this._particleCount; ++this._particleIdx)
            this._particles[this._particleIdx].timeToLive = 0 ;
    },

    /**
     * whether or not the system is full
     * @return {Boolean}
     */
    isFull:function () {
        return (this._particleCount >= this._totalParticles);
    },

    /**
     * should be overridden by subclasses
     * @param {cc.Particle} particle
     * @param {cc.Point} newPosition
     */
    updateQuadWithParticle:function (particle, newPosition) {
        // should be overriden
    },

    /**
     * should be overridden by subclasses
     */
    postStep:function () {
        // should be overriden
    },

    /**
     * update emitter's status
     * @override
     * @param {Number} dt delta time
     */
    update:function (dt) {
        if (this._isActive && this._emissionRate) {
            var rate = 1.0 / this._emissionRate;
            //issue #1201, prevent bursts of particles, due to too high emitCounter
            if (this._particleCount < this._totalParticles)
                this._emitCounter += dt;

            while ((this._particleCount < this._totalParticles) && (this._emitCounter > rate)) {
                this.addParticle();
                this._emitCounter -= rate;
            }

            this._elapsed += dt;
            if (this._duration != -1 && this._duration < this._elapsed)
                this.stopSystem();
        }
        this._particleIdx = 0;

        var currentPosition = cc.Particle.TemporaryPoints[0];
        if (this._positionType == cc.PARTICLE_TYPE_FREE) {
            cc.pIn(currentPosition, this.convertToWorldSpace(this._pointZeroForParticle));

        } else if (this._positionType == cc.PARTICLE_TYPE_RELATIVE) {
            currentPosition.x = this._position.x;
            currentPosition.y = this._position.y;
        }

        if (this._visible) {

            // Used to reduce memory allocation / creation within the loop
            var tpa = cc.Particle.TemporaryPoints[1],
                tpb = cc.Particle.TemporaryPoints[2],
                tpc = cc.Particle.TemporaryPoints[3];

            while (this._particleIdx < this._particleCount) {

                // Reset the working particles
                cc.pZeroIn(tpa);
                cc.pZeroIn(tpb);
                cc.pZeroIn(tpc);

                var selParticle = this._particles[this._particleIdx];

                // life
                selParticle.timeToLive -= dt;

                if (selParticle.timeToLive > 0) {
                    // Mode A: gravity, direction, tangential accel & radial accel
                    if (this._emitterMode == cc.PARTICLE_MODE_GRAVITY) {

                        var tmp = tpc, radial = tpa, tangential = tpb;

                        // radial acceleration
                        if (selParticle.pos.x || selParticle.pos.y) {
                            cc.pIn(radial, selParticle.pos);
                            cc.pNormalizeIn(radial);

                        } else {
                            cc.pZeroIn(radial);
                        }

                        cc.pIn(tangential, radial);
                        cc.pMultIn(radial, selParticle.modeA.radialAccel);

                        // tangential acceleration
                        var newy = tangential.x;
                        tangential.x = -tangential.y;
                        tangential.y = newy;

                        cc.pMultIn(tangential, selParticle.modeA.tangentialAccel);

                        cc.pIn(tmp, radial);
                        cc.pAddIn(tmp, tangential);
                        cc.pAddIn(tmp, this.modeA.gravity);
                        cc.pMultIn(tmp, dt);
                        cc.pAddIn(selParticle.modeA.dir, tmp);


                        cc.pIn(tmp, selParticle.modeA.dir);
                        cc.pMultIn(tmp, dt);
                        cc.pAddIn(selParticle.pos, tmp);

                    } else {
                        // Mode B: radius movement
                        var selModeB = selParticle.modeB;
                        // Update the angle and radius of the particle.
                        selModeB.angle += selModeB.degreesPerSecond * dt;
                        selModeB.radius += selModeB.deltaRadius * dt;

                        selParticle.pos.x = -Math.cos(selModeB.angle) * selModeB.radius;
                        selParticle.pos.y = -Math.sin(selModeB.angle) * selModeB.radius;
                    }

                    // color
                    if (!this._dontTint) {
                        selParticle.color.r += (selParticle.deltaColor.r * dt);
                        selParticle.color.g += (selParticle.deltaColor.g * dt);
                        selParticle.color.b += (selParticle.deltaColor.b * dt);
                        selParticle.color.a += (selParticle.deltaColor.a * dt);
                        selParticle.isChangeColor = true;
                    }

                    // size
                    selParticle.size += (selParticle.deltaSize * dt);
                    selParticle.size = Math.max(0, selParticle.size);

                    // angle
                    selParticle.rotation += (selParticle.deltaRotation * dt);

                    //
                    // update values in quad
                    //
                    var newPos = tpa;
                    if (this._positionType == cc.PARTICLE_TYPE_FREE || this._positionType == cc.PARTICLE_TYPE_RELATIVE) {

                        var diff = tpb;
                        cc.pIn(diff, currentPosition);
                        cc.pSubIn(diff, selParticle.startPos);

                        cc.pIn(newPos, selParticle.pos);
                        cc.pSubIn(newPos, diff);

                    } else {
                        cc.pIn(newPos, selParticle.pos);
                    }

                    // translate newPos to correct position, since matrix transform isn't performed in batchnode
                    // don't update the particle with the new position information, it will interfere with the radius and tangential calculations
                    if (this._batchNode) {
                        newPos.x += this._position.x;
                        newPos.y += this._position.y;
                    }

                    if (cc.renderContextType == cc.WEBGL) {
                        // IMPORTANT: newPos may not be used as a reference here! (as it is just the temporary tpa point)
                        // the implementation of updateQuadWithParticle must use
                        // the x and y values directly
                        this.updateQuadWithParticle(selParticle, newPos);
                    } else {
                        cc.pIn(selParticle.drawPos, newPos);
                    }
                    //updateParticleImp(self, updateParticleSel, p, newPos);

                    // update particle counter
                    ++this._particleIdx;
                } else {
                    // life < 0
                    var currentIndex = selParticle.atlasIndex;
                    if(this._particleIdx !== this._particleCount -1){
                         var deadParticle = this._particles[this._particleIdx];
                        this._particles[this._particleIdx] = this._particles[this._particleCount -1];
                        this._particles[this._particleCount -1] = deadParticle;
                    }
                    if (this._batchNode) {
                        //disable the switched particle
                        this._batchNode.disableParticle(this._atlasIndex + currentIndex);

                        //switch indexes
                        this._particles[this._particleCount - 1].atlasIndex = currentIndex;
                    }

                    --this._particleCount;

                    if (this._particleCount == 0 && this._isAutoRemoveOnFinish) {
                        this.unscheduleUpdate();
                        this._parent.removeChild(this, true);
                        return;
                    }
                }
            }
            this._transformSystemDirty = false;
        }

        if (!this._batchNode)
            this.postStep();

        //cc.PROFILER_STOP_CATEGORY(kCCProfilerCategoryParticles , "cc.ParticleSystem - update");
    },

    updateWithNoTime:function () {
        this.update(0);
    },

    /**
     * return the string found by key in dict.
     * @param {string} key
     * @param {object} dict
     * @return {String} "" if not found; return the string if found.
     * @private
     */
    _valueForKey:function (key, dict) {
        if (dict) {
            var pString = dict[key];
            return pString != null ? pString : "";
        }
        return "";
    },

    _updateBlendFunc:function () {
        cc.Assert(!this._batchNode, "Can't change blending functions when the particle is being batched");

        if (this._texture) {
            if ((this._texture instanceof HTMLImageElement) || (this._texture instanceof HTMLCanvasElement)) {

            } else {
                var premultiplied = this._texture.hasPremultipliedAlpha();
                this._opacityModifyRGB = false;

                if (this._texture && ( this._blendFunc.src == cc.BLEND_SRC && this._blendFunc.dst == cc.BLEND_DST )) {
                    if (premultiplied) {
                        this._opacityModifyRGB = true;
                    } else {
                        this._blendFunc.src = gl.SRC_ALPHA;
                        this._blendFunc.dst = gl.ONE_MINUS_SRC_ALPHA;
                    }
                }
            }
        }
    }
});

/**
 * <p> return the string found by key in dict. <br/>
 *    This plist files can be creted manually or with Particle Designer:<br/>
 *    http://particledesigner.71squared.com/<br/>
 * </p>
 * @param {String} plistFile
 * @return {cc.ParticleSystem}
 */
cc.ParticleSystem.create = function (plistFile) {
    return cc.ParticleSystemQuad.create(plistFile);
    /*var particle = new cc.ParticleSystem();
    if (particle && particle.initWithFile(plistFile))
        return particle;
    return null;*/
};

/**
 * create a system with a fixed number of particles
 * @param {Number} number_of_particles
 * @return {cc.ParticleSystem}
 */
cc.ParticleSystem.createWithTotalParticles = function (number_of_particles) {
    return cc.ParticleSystemQuad.create(number_of_particles);
    /*//emitter.initWithTotalParticles(number_of_particles);
    var particle = new cc.ParticleSystem();
    if (particle && particle.initWithTotalParticles(number_of_particles))
        return particle;
    return null;*/
};

// Different modes
/**
 * Mode A:Gravity + Tangential Accel + Radial Accel
 * @Class
 * @Construct
 * @param {cc.Point} gravity Gravity value.
 * @param {Number} speed speed of each particle.
 * @param {Number} speedVar speed variance of each particle.
 * @param {Number} tangentialAccel tangential acceleration of each particle.
 * @param {Number} tangentialAccelVar tangential acceleration variance of each particle.
 * @param {Number} radialAccel radial acceleration of each particle.
 * @param {Number} radialAccelVar radial acceleration variance of each particle.
 */
cc.ParticleSystem.ModeA = function (gravity, speed, speedVar, tangentialAccel, tangentialAccelVar, radialAccel, radialAccelVar) {
    /** Gravity value. Only available in 'Gravity' mode. */
    this.gravity = gravity ? gravity : cc.PointZero();
    /** speed of each particle. Only available in 'Gravity' mode.  */
    this.speed = speed || 0;
    /** speed variance of each particle. Only available in 'Gravity' mode. */
    this.speedVar = speedVar || 0;
    /** tangential acceleration of each particle. Only available in 'Gravity' mode. */
    this.tangentialAccel = tangentialAccel || 0;
    /** tangential acceleration variance of each particle. Only available in 'Gravity' mode. */
    this.tangentialAccelVar = tangentialAccelVar || 0;
    /** radial acceleration of each particle. Only available in 'Gravity' mode. */
    this.radialAccel = radialAccel || 0;
    /** radial acceleration variance of each particle. Only available in 'Gravity' mode. */
    this.radialAccelVar = radialAccelVar || 0;
};

/**
 * Mode B: circular movement (gravity, radial accel and tangential accel don't are not used in this mode)
 * @Class
 * @Construct
 * @param {Number} startRadius The starting radius of the particles.
 * @param {Number} startRadiusVar The starting radius variance of the particles.
 * @param {Number} endRadius The ending radius of the particles.
 * @param {Number} endRadiusVar The ending radius variance of the particles.
 * @param {Number} rotatePerSecond Number of degress to rotate a particle around the source pos per second.
 * @param {Number} rotatePerSecondVar Variance in degrees for rotatePerSecond.
 */
cc.ParticleSystem.ModeB = function (startRadius, startRadiusVar, endRadius, endRadiusVar, rotatePerSecond, rotatePerSecondVar) {
    /** The starting radius of the particles. Only available in 'Radius' mode. */
    this.startRadius = startRadius || 0;
    /** The starting radius variance of the particles. Only available in 'Radius' mode. */
    this.startRadiusVar = startRadiusVar || 0;
    /** The ending radius of the particles. Only available in 'Radius' mode. */
    this.endRadius = endRadius || 0;
    /** The ending radius variance of the particles. Only available in 'Radius' mode. */
    this.endRadiusVar = endRadiusVar || 0;
    /** Number of degress to rotate a particle around the source pos per second. Only available in 'Radius' mode. */
    this.rotatePerSecond = rotatePerSecond || 0;
    /** Variance in degrees for rotatePerSecond. Only available in 'Radius' mode. */
    this.rotatePerSecondVar = rotatePerSecondVar || 0;
};
