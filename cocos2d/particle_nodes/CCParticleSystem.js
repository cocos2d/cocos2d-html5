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

/**
 * Structure that contains the values of each particle
 * @Class
 * @Construct
 * @param {cc.Point} [pos=cc.PointZero()] Position of particle
 * @param {cc.Point} [startPos=cc.PointZero()]
 * @param {cc.Color4F} [color= cc.Color4F(0, 0, 0, 1)]
 * @param {cc.Color4F} [deltaColor=cc.Color4F(0, 0, 0, 1)]
 * @param {cc.Size} [size=0]
 * @param {cc.Size} [deltaSize=0]
 * @param {Number} [rotation=0]
 * @param {Number} [deltaRotation=0]
 * @param {Number} [timeToLive=0]
 * @param {Number} [atlasIndex=0]
 * @param {cc.Particle.ModeA} [modeA=]
 * @param {cc.Particle.ModeA} [modeB=]
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
    _plistFile: "",
    //! time elapsed since the start of the system (in seconds)
    _elapsed: 0,

    _dontTint: false,

    // Different modes
    //! Mode A:Gravity + Tangential Accel + Radial Accel
    modeA: null,
    //! Mode B: circular movement (gravity, radial accel and tangential accel don't are not used in this mode)
    modeB: null,

    //private POINTZERO for ParticleSystem
    _pointZeroForParticle: cc.p(0, 0),

    //! Array of particles
    _particles: null,

    // color modulate
    //  BOOL colorModulate;

    //! How many particles can be emitted per second
    _emitCounter: 0,
    //!  particle idx
    _particleIdx: 0,

    _batchNode: null,
    _atlasIndex: 0,

    //true if scaled or rotated
    _transformSystemDirty: false,
    _allocatedParticles: 0,

    //drawMode
    _drawMode: cc.PARTICLE_SHAPE_MODE,

    //shape type
    _shapeType: cc.PARTICLE_BALL_SHAPE,
    _isActive: false,
    _particleCount: 0,
    _duration: 0,
    _sourcePosition: cc.PointZero(),
    _posVar: cc.PointZero(),
    _life: 0,
    _lifeVar: 0,
    _angle: 0,
    _angleVar: 0,
    _startSize: 0,
    _startSizeVar: 0,
    _endSize: 0,
    _endSizeVar: 0,
    _startColor: new cc.Color4F(0, 0, 0, 1),
    _startColorVar: new cc.Color4F(0, 0, 0, 1),
    _endColor: new cc.Color4F(0, 0, 0, 1),
    _endColorVar: new cc.Color4F(0, 0, 0, 1),
    _startSpin: 0,
    _startSpinVar: 0,
    _endSpin: 0,
    _endSpinVar: 0,
    _emissionRate: 0,
    _totalParticles: 0,
    _texture: null,
    _blendFunc: null,
    _opacityModifyRGB: false,
    _positionType: cc.PARTICLE_TYPE_FREE,
    _isAutoRemoveOnFinish: false,
    _emitterMode: 0,

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

        this._plistFile = "";
        this._elapsed = 0;
        this._dontTint = false;
        this._pointZeroForParticle = cc.p(0, 0);
        this._emitCounter = 0;
        this._particleIdx = 0;
        this._batchNode = null;
        this._atlasIndex = 0;

        this._transformSystemDirty = false;
        this._allocatedParticles = 0;
        this._drawMode = cc.PARTICLE_SHAPE_MODE;
        this._shapeType = cc.PARTICLE_BALL_SHAPE;
        this._isActive = false;
        this._particleCount = 0;
        this._duration = 0;
        this._life = 0;
        this._lifeVar = 0;
        this._angle = 0;
        this._angleVar = 0;
        this._startSize = 0;
        this._startSizeVar = 0;
        this._endSize = 0;
        this._endSizeVar = 0;

        this._startSpin = 0;
        this._startSpinVar = 0;
        this._endSpin = 0;
        this._endSpinVar = 0;
        this._emissionRate = 0;
        this._totalParticles = 0;
        this._texture = null;
        this._opacityModifyRGB = false;
        this._positionType = cc.PARTICLE_TYPE_FREE;
        this._isAutoRemoveOnFinish = false;
    },

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
                for (var i = 0; i < this._totalParticles; i++)
                    this._particles[i].atlasIndex = i;
            }
        }
    },

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

    /**
     * Return ParticleSystem is active
     * @return {Boolean}
     */
    isActive:function () {
        return this._isActive;
    },

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

    /**
     * Return sourcePosition of the emitter
     * @return {cc.Point | Object}
     */
    getSourcePosition:function () {
        return {x:this._sourcePosition.x, y:this._sourcePosition.y};
    },

    /**
     * sourcePosition of the emitter setter
     * @param sourcePosition
     */
    setSourcePosition:function (sourcePosition) {
        this._sourcePosition = sourcePosition;
    },

    /**
     * Return Position variance of the emitter
     * @return {cc.Point | Object}
     */
    getPosVar:function () {
        return {x: this._posVar.x, y: this._posVar.y};
    },

    /**
     * Position variance of the emitter setter
     * @param {cc.Point} posVar
     */
    setPosVar:function (posVar) {
        this._posVar = posVar;
    },

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
     * @param {Number} radialAccelVar
     */
    setRadialAccelVar:function (radialAccelVar) {
        cc.Assert(this._emitterMode == cc.PARTICLE_MODE_GRAVITY, "Particle Mode should be Gravity");
        this.modeA.radialAccelVar = radialAccelVar;
    },

    /**
     * get the rotation of each particle to its direction Only available in 'Gravity' mode.
     * @returns {boolean}
     */
    getRotationIsDir: function(){
        cc.Assert( this._emitterMode === cc.PARTICLE_MODE_GRAVITY, "Particle Mode should be Gravity");
        return this.modeA.rotationIsDir;
    },

    /**
     * set the rotation of each particle to its direction Only available in 'Gravity' mode.
     * @param {boolean} t
     */
    setRotationIsDir: function(t){
        cc.Assert( this._emitterMode === cc.PARTICLE_MODE_GRAVITY, "Particle Mode should be Gravity");
        this.modeA.rotationIsDir = t;
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
        var locBlendFunc = this._blendFunc;
        if (isBlendAdditive) {
            locBlendFunc.src = gl.SRC_ALPHA;
            locBlendFunc.dst = gl.ONE;
        } else {
            if (cc.renderContextType === cc.WEBGL) {
                if (this._texture && !this._texture.hasPremultipliedAlpha()) {
                    locBlendFunc.src = gl.SRC_ALPHA;
                    locBlendFunc.dst = gl.ONE_MINUS_SRC_ALPHA;
                } else {
                    locBlendFunc.src = cc.BLEND_SRC;
                    locBlendFunc.dst = cc.BLEND_DST;
                }
            } else {
                locBlendFunc.src = cc.BLEND_SRC;
                locBlendFunc.dst = cc.BLEND_DST;
            }
        }
    },

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
     * @return {boolean}
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
        var locValueForKey = this._valueForKey;

        var maxParticles = parseInt(locValueForKey("maxParticles", dictionary));
        // self, not super
        if (this.initWithTotalParticles(maxParticles)) {
            // angle
            this._angle = parseFloat(locValueForKey("angle", dictionary));
            this._angleVar = parseFloat(locValueForKey("angleVariance", dictionary));

            // duration
            this._duration = parseFloat(locValueForKey("duration", dictionary));

            // blend function
            this._blendFunc.src = parseInt(locValueForKey("blendFuncSource", dictionary));
            this._blendFunc.dst = parseInt(locValueForKey("blendFuncDestination", dictionary));

            // color
            var locStartColor = this._startColor;
            locStartColor.r = parseFloat(locValueForKey("startColorRed", dictionary));
            locStartColor.g = parseFloat(locValueForKey("startColorGreen", dictionary));
            locStartColor.b = parseFloat(locValueForKey("startColorBlue", dictionary));
            locStartColor.a = parseFloat(locValueForKey("startColorAlpha", dictionary));

            var locStartColorVar = this._startColorVar;
            locStartColorVar.r = parseFloat(locValueForKey("startColorVarianceRed", dictionary));
            locStartColorVar.g = parseFloat(locValueForKey("startColorVarianceGreen", dictionary));
            locStartColorVar.b = parseFloat(locValueForKey("startColorVarianceBlue", dictionary));
            locStartColorVar.a = parseFloat(locValueForKey("startColorVarianceAlpha", dictionary));

            var locEndColor = this._endColor;
            locEndColor.r = parseFloat(locValueForKey("finishColorRed", dictionary));
            locEndColor.g = parseFloat(locValueForKey("finishColorGreen", dictionary));
            locEndColor.b = parseFloat(locValueForKey("finishColorBlue", dictionary));
            locEndColor.a = parseFloat(locValueForKey("finishColorAlpha", dictionary));

            var locEndColorVar = this._endColorVar;
            locEndColorVar.r = parseFloat(locValueForKey("finishColorVarianceRed", dictionary));
            locEndColorVar.g = parseFloat(locValueForKey("finishColorVarianceGreen", dictionary));
            locEndColorVar.b = parseFloat(locValueForKey("finishColorVarianceBlue", dictionary));
            locEndColorVar.a = parseFloat(locValueForKey("finishColorVarianceAlpha", dictionary));

            // particle size
            this._startSize = parseFloat(locValueForKey("startParticleSize", dictionary));
            this._startSizeVar = parseFloat(locValueForKey("startParticleSizeVariance", dictionary));
            this._endSize = parseFloat(locValueForKey("finishParticleSize", dictionary));
            this._endSizeVar = parseFloat(locValueForKey("finishParticleSizeVariance", dictionary));

            // position
            var x = parseFloat(locValueForKey("sourcePositionx", dictionary));
            var y = parseFloat(locValueForKey("sourcePositiony", dictionary));
            this.setPosition(cc.p(x, y));
            this._posVar.x = parseFloat(locValueForKey("sourcePositionVariancex", dictionary));
            this._posVar.y = parseFloat(locValueForKey("sourcePositionVariancey", dictionary));

            // Spinning
            this._startSpin = parseFloat(locValueForKey("rotationStart", dictionary));
            this._startSpinVar = parseFloat(locValueForKey("rotationStartVariance", dictionary));
            this._endSpin = parseFloat(locValueForKey("rotationEnd", dictionary));
            this._endSpinVar = parseFloat(locValueForKey("rotationEndVariance", dictionary));

            this._emitterMode = parseInt(locValueForKey("emitterType", dictionary));

            // Mode A: Gravity + tangential accel + radial accel
            if (this._emitterMode == cc.PARTICLE_MODE_GRAVITY) {
                var locModeA = this.modeA;
                // gravity
                locModeA.gravity.x = parseFloat(locValueForKey("gravityx", dictionary));
                locModeA.gravity.y = parseFloat(locValueForKey("gravityy", dictionary));

                // speed
                locModeA.speed = parseFloat(locValueForKey("speed", dictionary));
                locModeA.speedVar = parseFloat(locValueForKey("speedVariance", dictionary));

                // radial acceleration
                var pszTmp = locValueForKey("radialAcceleration", dictionary);
                locModeA.radialAccel = (pszTmp) ? parseFloat(pszTmp) : 0;

                pszTmp = locValueForKey("radialAccelVariance", dictionary);
                locModeA.radialAccelVar = (pszTmp) ? parseFloat(pszTmp) : 0;

                // tangential acceleration
                pszTmp = locValueForKey("tangentialAcceleration", dictionary);
                locModeA.tangentialAccel = (pszTmp) ? parseFloat(pszTmp) : 0;

                pszTmp = locValueForKey("tangentialAccelVariance", dictionary);
                locModeA.tangentialAccelVar = (pszTmp) ? parseFloat(pszTmp) : 0;

                // rotation is dir
                var locRotationIsDir = locValueForKey("rotationIsDir", dictionary).toLowerCase();
                locModeA.rotationIsDir = (locRotationIsDir != null && (locRotationIsDir === "true" || locRotationIsDir === "1"));
            } else if (this._emitterMode == cc.PARTICLE_MODE_RADIUS) {
                // or Mode B: radius movement
                var locModeB = this.modeB;
                locModeB.startRadius = parseFloat(locValueForKey("maxRadius", dictionary));
                locModeB.startRadiusVar = parseFloat(locValueForKey("maxRadiusVariance", dictionary));
                locModeB.endRadius = parseFloat(locValueForKey("minRadius", dictionary));
                locModeB.endRadiusVar = 0;
                locModeB.rotatePerSecond = parseFloat(locValueForKey("rotatePerSecond", dictionary));
                locModeB.rotatePerSecondVar = parseFloat(locValueForKey("rotatePerSecondVariance", dictionary));
            } else {
                cc.Assert(false, "Invalid emitterType in config file");
                return false;
            }

            // life span
            this._life = parseFloat(locValueForKey("particleLifespan", dictionary));
            this._lifeVar = parseFloat(locValueForKey("particleLifespanVariance", dictionary));

            // emission Rate
            this._emissionRate = this._totalParticles / this._life;

            //don't get the internal texture if a batchNode is used
            if (!this._batchNode) {
                // Set a compatible default for the alpha transfer
                this._opacityModifyRGB = false;

                // texture
                // Try to get the texture from the cache
                var textureName = locValueForKey("textureFileName", dictionary);
                var fullpath = cc.FileUtils.getInstance().fullPathFromRelativeFile(textureName, this._plistFile);

                var tex = cc.TextureCache.getInstance().textureForKey(fullpath);

                if (tex) {
                    this.setTexture(tex);
                } else {
                    var textureData = locValueForKey("textureImageData", dictionary);

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
        var locRandomMinus11 = cc.RANDOM_MINUS1_1;
        // timeToLive
        // no negative life. prevent division by 0
        particle.timeToLive = this._life + this._lifeVar * locRandomMinus11();
        particle.timeToLive = Math.max(0, particle.timeToLive);

        // position
        particle.pos.x = this._sourcePosition.x + this._posVar.x * locRandomMinus11();
        particle.pos.y = this._sourcePosition.y + this._posVar.y * locRandomMinus11();

        // Color
        var start, end;
        var locStartColor = this._startColor, locStartColorVar = this._startColorVar;
        var locEndColor = this._endColor, locEndColorVar = this._endColorVar;
        if (cc.renderContextType === cc.CANVAS) {
            start = new cc.Color4F(
                cc.clampf(locStartColor.r + locStartColorVar.r * locRandomMinus11(), 0, 1),
                cc.clampf(locStartColor.g + locStartColorVar.g * locRandomMinus11(), 0, 1),
                cc.clampf(locStartColor.b + locStartColorVar.b * locRandomMinus11(), 0, 1),
                cc.clampf(locStartColor.a + locStartColorVar.a * locRandomMinus11(), 0, 1)
            );
            end = new cc.Color4F(
                cc.clampf(locEndColor.r + locEndColorVar.r * locRandomMinus11(), 0, 1),
                cc.clampf(locEndColor.g + locEndColorVar.g * locRandomMinus11(), 0, 1),
                cc.clampf(locEndColor.b + locEndColorVar.b * locRandomMinus11(), 0, 1),
                cc.clampf(locEndColor.a + locEndColorVar.a * locRandomMinus11(), 0, 1)
            );
        } else {
            start = {
                r: cc.clampf(locStartColor.r + locStartColorVar.r * locRandomMinus11(), 0, 1),
                g: cc.clampf(locStartColor.g + locStartColorVar.g * locRandomMinus11(), 0, 1),
                b: cc.clampf(locStartColor.b + locStartColorVar.b * locRandomMinus11(), 0, 1),
                a: cc.clampf(locStartColor.a + locStartColorVar.a * locRandomMinus11(), 0, 1)
            };
            end = {
                r: cc.clampf(locEndColor.r + locEndColorVar.r * locRandomMinus11(), 0, 1),
                g: cc.clampf(locEndColor.g + locEndColorVar.g * locRandomMinus11(), 0, 1),
                b: cc.clampf(locEndColor.b + locEndColorVar.b * locRandomMinus11(), 0, 1),
                a: cc.clampf(locEndColor.a + locEndColorVar.a * locRandomMinus11(), 0, 1)
            };
        }

        particle.color = start;
        var locParticleDeltaColor = particle.deltaColor, locParticleTimeToLive = particle.timeToLive;
        locParticleDeltaColor.r = (end.r - start.r) / locParticleTimeToLive;
        locParticleDeltaColor.g = (end.g - start.g) / locParticleTimeToLive;
        locParticleDeltaColor.b = (end.b - start.b) / locParticleTimeToLive;
        locParticleDeltaColor.a = (end.a - start.a) / locParticleTimeToLive;

        // size
        var startS = this._startSize + this._startSizeVar * locRandomMinus11();
        startS = Math.max(0, startS); // No negative value

        particle.size = startS;
        if (this._endSize === cc.PARTICLE_START_SIZE_EQUAL_TO_END_SIZE) {
            particle.deltaSize = 0;
        } else {
            var endS = this._endSize + this._endSizeVar * locRandomMinus11();
            endS = Math.max(0, endS); // No negative values
            particle.deltaSize = (endS - startS) / locParticleTimeToLive;
        }

        // rotation
        var startA = this._startSpin + this._startSpinVar * locRandomMinus11();
        var endA = this._endSpin + this._endSpinVar * locRandomMinus11();
        particle.rotation = startA;
        particle.deltaRotation = (endA - startA) / locParticleTimeToLive;

        // position
        if (this._positionType == cc.PARTICLE_TYPE_FREE)
            particle.startPos = this.convertToWorldSpace(this._pointZeroForParticle);
        else if (this._positionType == cc.PARTICLE_TYPE_RELATIVE)
            particle.startPos = this._position;

        // direction
        var a = cc.DEGREES_TO_RADIANS(this._angle + this._angleVar * locRandomMinus11());

        // Mode Gravity: A
        if (this._emitterMode === cc.PARTICLE_MODE_GRAVITY) {
            var locModeA = this.modeA, locParticleModeA = particle.modeA;
            var s = locModeA.speed + locModeA.speedVar * locRandomMinus11();

            // direction
            locParticleModeA.dir.x = Math.cos(a);
            locParticleModeA.dir.y = Math.sin(a);
            cc.pMultIn(locParticleModeA.dir, s);

            // radial accel
            locParticleModeA.radialAccel = locModeA.radialAccel + locModeA.radialAccelVar * locRandomMinus11();

            // tangential accel
            locParticleModeA.tangentialAccel = locModeA.tangentialAccel + locModeA.tangentialAccelVar * locRandomMinus11();

            // rotation is dir
            if(locModeA.rotationIsDir)
                particle.rotation = -cc.RADIANS_TO_DEGREES(cc.pToAngle(locParticleModeA.dir));
        } else {
            // Mode Radius: B
            var locModeB = this.modeB, locParitlceModeB = particle.modeB;

            // Set the default diameter of the particle from the source position
            var startRadius = locModeB.startRadius + locModeB.startRadiusVar * locRandomMinus11();
            var endRadius = locModeB.endRadius + locModeB.endRadiusVar * locRandomMinus11();

            locParitlceModeB.radius = startRadius;
            locParitlceModeB.deltaRadius = (locModeB.endRadius === cc.PARTICLE_START_RADIUS_EQUAL_TO_END_RADIUS) ? 0 : (endRadius - startRadius) / locParticleTimeToLive;

            locParitlceModeB.angle = a;
            locParitlceModeB.degreesPerSecond = cc.DEGREES_TO_RADIANS(locModeB.rotatePerSecond + locModeB.rotatePerSecondVar * locRandomMinus11());
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
            if (this._texture instanceof cc.Texture2D) {
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
 * @param {cc.Point} [gravity=] Gravity value.
 * @param {Number} [speed=0] speed of each particle.
 * @param {Number} [speedVar=0] speed variance of each particle.
 * @param {Number} [tangentialAccel=0] tangential acceleration of each particle.
 * @param {Number} [tangentialAccelVar=0] tangential acceleration variance of each particle.
 * @param {Number} [radialAccel=0] radial acceleration of each particle.
 * @param {Number} [radialAccelVar=0] radial acceleration variance of each particle.
 * @param {boolean} [rotationIsDir=false]
 */
cc.ParticleSystem.ModeA = function (gravity, speed, speedVar, tangentialAccel, tangentialAccelVar, radialAccel, radialAccelVar, rotationIsDir) {
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
    /** set the rotation of each particle to its direction Only available in 'Gravity' mode. */
    this.rotationIsDir = rotationIsDir || false;
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
