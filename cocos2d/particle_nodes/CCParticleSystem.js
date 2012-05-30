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
//	 . The ocean spray in your face [Jeff Lander]
//		http://www.double.co.nz/dust/col0798.pdf
//	 . Building an Advanced Particle System [John van der Burg]
//		http://www.gamasutra.com/features/20000623/vanderburg_01.htm
//   . LOVE game engine
//		http://love2d.org/
//
//
// Radius mode support, from 71 squared
//		http://particledesigner.71squared.com/
//
// IMPORTANT: Particle Designer is supported by cocos2d, but
// 'Radius Mode' in Particle Designer uses a fixed emit rate of 30 hz. Since that can't be guarateed in cocos2d,
//  cocos2d uses a another approach, but the results are almost identical.
//
var cc = cc = cc || {};

//Particle Draw Mode
cc.kParticleShapeMode = 0;
cc.kParticleTextureMode = 1;

//Particle Shape Type for ShapeMode
cc.kParticleStarShape = 0;
cc.kParticleBallShape = 1;

/** The Particle emitter lives forever */
cc.kCCParticleDurationInfinity = -1;
/** The starting size of the particle is equal to the ending size */
cc.kCCParticleStartSizeEqualToEndSize = -1;
/** The starting radius of the particle is equal to the ending radius */
cc.kCCParticleStartRadiusEqualToEndRadius = -1;
// backward compatible
cc.kParticleStartSizeEqualToEndSize = cc.kCCParticleStartSizeEqualToEndSize;
cc.kParticleDurationInfinity = cc.kCCParticleDurationInfinity;


/** Gravity mode (A mode) */
cc.kCCParticleModeGravity = 0;
/** Radius mode (B mode) */
cc.kCCParticleModeRadius = 1;


/** @typedef tCCPositionType
 possible types of particle positions
 */
/** Living particles are attached to the world and are unaffected by emitter repositioning. */
cc.kCCPositionTypeFree = 0;
/** Living particles are attached to the world but will follow the emitter repositioning.
 Use case: Attach an emitter to an sprite, and you want that the emitter follows the sprite.
 */
cc.kCCPositionTypeRelative = 1;
/** Living particles are attached to the emitter and are translated along with it. */
cc.kCCPositionTypeGrouped = 2;

// backward compatible
cc.kPositionTypeFree = cc.kCCPositionTypeFree;
cc.kPositionTypeGrouped = cc.kCCPositionTypeGrouped;

/**
 Structure that contains the values of each particle
 */
cc.tCCParticle = function (pos, startPos, color, deltaColor, size, deltaSize, rotation, deltaRotation, timeToLive, modeA, modeB) {
    this.pos = pos ? pos : cc.PointZero();
    this.startPos = startPos ? startPos : cc.PointZero();
    this.color = color ? color : new cc.Color4F(0, 0, 0, 1);
    this.deltaColor = deltaColor ? deltaColor : new cc.Color4F(0, 0, 0, 1);
    this.size = size || 0;
    this.deltaSize = deltaSize || 0;
    this.rotation = rotation || 0;
    this.deltaRotation = deltaRotation || 0;
    this.timeToLive = timeToLive || 0;
    this.modeA = modeA ? modeA : new cc.tCCParticle.tModeA();
    this.modeB = modeB ? modeB : new cc.tCCParticle.tModeB();
    this.isChangeColor = false;
    this.drawPos = new cc.Point(0,0);
};

//! Mode A: gravity, direction, radial accel, tangential accel
cc.tCCParticle.tModeA = function (dir, radialAccel, tangentialAccel) {
    this.dir = dir ? dir : cc.PointZero();
    this.radialAccel = radialAccel || 0;
    this.tangentialAccel = tangentialAccel || 0;
};
//! Mode B: radius mode
cc.tCCParticle.tModeB = function (angle, degreesPerSecond, radius, deltaRadius) {
    this.angle = angle || 0;
    this.degreesPerSecond = degreesPerSecond || 0;
    this.radius = radius || 0;
    this.deltaRadius = deltaRadius || 0;
};


/** @brief Particle System base class.
 Attributes of a Particle System:
 - emmision rate of the particles
 - Gravity Mode (Mode A):
 - gravity
 - direction
 - speed +-  variance
 - tangential acceleration +- variance
 - radial acceleration +- variance
 - Radius Mode (Mode B):
 - startRadius +- variance
 - endRadius +- variance
 - rotate +- variance
 - Properties common to all modes:
 - life +- life variance
 - start spin +- variance
 - end spin +- variance
 - start size +- variance
 - end size +- variance
 - start color +- variance
 - end color +- variance
 - life +- variance
 - blending function
 - texture

 cocos2d also supports particles generated by Particle Designer (http://particledesigner.71squared.com/).
 'Radius Mode' in Particle Designer uses a fixed emit rate of 30 hz. Since that can't be guarateed in cocos2d,
 cocos2d uses a another approach, but the results are almost identical.

 cocos2d supports all the variables used by Particle Designer plus a bit more:
 - spinning particles (supported when using CCParticleSystemQuad)
 - tangential acceleration (Gravity mode)
 - radial acceleration (Gravity mode)
 - radius direction (Radius mode) (Particle Designer supports outwards to inwards direction only)

 It is possible to customize any of the above mentioned properties in runtime. Example:

 @code
 emitter.radialAccel = 15;
 emitter.startSpin = 0;
 @endcode

 */
cc.ParticleSystem = cc.Node.extend({
    _m_sPlistFile:"",
    //! time elapsed since the start of the system (in seconds)
    _m_fElapsed:0,

    // Different modes
    //! Mode A:Gravity + Tangential Accel + Radial Accel
    modeA:null,
    //! Mode B: circular movement (gravity, radial accel and tangential accel don't are not used in this mode)
    modeB:null,

    //! Array of particles
    _m_pParticles:null,

    // color modulate
    //	BOOL colorModulate;

    //! How many particles can be emitted per second
    _m_fEmitCounter:0,
    //!  particle idx
    _m_uParticleIdx:0,

    // profiling
    _m_pProfilingTimer:null,

    //drawMode
    _drawMode:cc.kParticleShapeMode,
    getDrawMode:function () {
        return this._drawMode;
    },
    setDrawMode:function (drawMode) {
        this._drawMode = drawMode;
    },

    //shape type
    _shapeType:cc.kParticleBallShape,
    getShapeType:function () {
        return this._shapeType;
    },
    setShapeType:function (shapeType) {
        this._shapeType = shapeType;
    },

    /** Is the emitter active */
    _m_bIsActive:false,
    getIsActive:function () {
        return this._m_bIsActive;
    },
    setIsActive:function (isActive) {
        this._m_bIsActive = isActive;
    },

    /** Quantity of particles that are being simulated at the moment */
    _m_uParticleCount:0,
    getParticleCount:function () {
        return this._m_uParticleCount;
    },
    setParticleCount:function (particleCount) {
        this._m_uParticleCount = particleCount;
    },

    /** How many seconds the emitter wil run. -1 means 'forever' */
    _m_fDuration:0,
    getDuration:function () {
        return this._m_fDuration;
    },
    setDuration:function (duration) {
        this._m_fDuration = duration;
    },

    /** sourcePosition of the emitter */
    _m_tSourcePosition:cc.PointZero(),
    getSourcePosition:function () {
        return this._m_tSourcePosition;
    },
    setSourcePosition:function (sourcePosition) {
        this._m_tSourcePosition = sourcePosition;
    },

    /** Position variance of the emitter */
    _m_tPosVar:cc.PointZero(),
    getPosVar:function () {
        return this._m_tPosVar;
    },
    setPosVar:function (posVar) {
        this._m_tPosVar = posVar;
    },

    /** life, and life variation of each particle */
    _m_fLife:0,
    getLife:function () {
        return this._m_fLife;
    },
    setLife:function (life) {
        this._m_fLife = life;
    },

    /** life variance of each particle */
    _m_fLifeVar:0,
    getLifeVar:function () {
        return this._m_fLifeVar;
    },
    setLifeVar:function (lifeVar) {
        this._m_fLifeVar = lifeVar;
    },

    /** angle and angle variation of each particle */
    _m_fAngle:0,
    getAngle:function () {
        return this._m_fAngle;
    },
    setAngle:function (angle) {
        this._m_fAngle = angle;
    },

    /** angle variance of each particle */
    _m_fAngleVar:0,
    getAngleVar:function () {
        return this._m_fAngleVar;
    },
    setAngleVar:function (angleVar) {
        this._m_fAngleVar = angleVar;
    },

    // mode A
    getGravity:function () {
        cc.Assert(this._m_nEmitterMode == cc.kCCParticleModeGravity, "Particle Mode should be Gravity");
        return this.modeA.gravity;
    },
    setGravity:function (gravity) {
        cc.Assert(this._m_nEmitterMode == cc.kCCParticleModeGravity, "Particle Mode should be Gravity");
        this.modeA.gravity = gravity;
    },
    getSpeed:function () {
        cc.Assert(this._m_nEmitterMode == cc.kCCParticleModeGravity, "Particle Mode should be Gravity");
        return this.modeA.speed;
    },
    setSpeed:function (speed) {
        cc.Assert(this._m_nEmitterMode == cc.kCCParticleModeGravity, "Particle Mode should be Gravity");
        this.modeA.speed = speed;
    },
    getSpeedVar:function () {
        cc.Assert(this._m_nEmitterMode == cc.kCCParticleModeGravity, "Particle Mode should be Gravity");
        return this.modeA.speedVar;
    },
    setSpeedVar:function (speedVar) {
        cc.Assert(this._m_nEmitterMode == cc.kCCParticleModeGravity, "Particle Mode should be Gravity");
        this.modeA.speedVar = speedVar;
    },
    getTangentialAccel:function () {
        cc.Assert(this._m_nEmitterMode == cc.kCCParticleModeGravity, "Particle Mode should be Gravity");
        return this.modeA.tangentialAccel;
    },
    setTangentialAccel:function (tangentialAccel) {
        cc.Assert(this._m_nEmitterMode == cc.kCCParticleModeGravity, "Particle Mode should be Gravity");
        this.modeA.tangentialAccel = tangentialAccel;
    },
    getTangentialAccelVar:function () {
        cc.Assert(this._m_nEmitterMode == cc.kCCParticleModeGravity, "Particle Mode should be Gravity");
        return this.modeA.tangentialAccelVar;
    },
    setTangentialAccelVar:function (tangentialAccelVar) {
        cc.Assert(this._m_nEmitterMode == cc.kCCParticleModeGravity, "Particle Mode should be Gravity");
        this.modeA.tangentialAccelVar = tangentialAccelVar;
    },
    getRadialAccel:function () {
        cc.Assert(this._m_nEmitterMode == cc.kCCParticleModeGravity, "Particle Mode should be Gravity");
        return this.modeA.radialAccel;
    },
    setRadialAccel:function (radialAccel) {
        cc.Assert(this._m_nEmitterMode == cc.kCCParticleModeGravity, "Particle Mode should be Gravity");
        this.modeA.radialAccel = radialAccel;
    },
    getRadialAccelVar:function () {
        cc.Assert(this._m_nEmitterMode == cc.kCCParticleModeGravity, "Particle Mode should be Gravity");
        return this.modeA.radialAccelVar;
    },
    setRadialAccelVar:function (radialAccelVar) {
        cc.Assert(this._m_nEmitterMode == cc.kCCParticleModeGravity, "Particle Mode should be Gravity");
        this.modeA.radialAccelVar = radialAccelVar;
    },

    // mode B
    getStartRadius:function () {
        cc.Assert(this._m_nEmitterMode == cc.kCCParticleModeGravity, "Particle Mode should be Gravity");
        return this.modeB.startRadius;
    },
    setStartRadius:function (startRadius) {
        cc.Assert(this._m_nEmitterMode == cc.kCCParticleModeGravity, "Particle Mode should be Gravity");
        this.modeB.startRadius = startRadius;
    },
    getStartRadiusVar:function () {
        cc.Assert(this._m_nEmitterMode == cc.kCCParticleModeGravity, "Particle Mode should be Gravity");
        return this.modeB.startRadiusVar;
    },
    setStartRadiusVar:function (startRadiusVar) {
        cc.Assert(this._m_nEmitterMode == cc.kCCParticleModeGravity, "Particle Mode should be Gravity");
        this.modeB.startRadiusVar = startRadiusVar;
    },
    getEndRadius:function () {
        cc.Assert(this._m_nEmitterMode == cc.kCCParticleModeGravity, "Particle Mode should be Gravity");
        return this.modeB.endRadius;
    },
    setEndRadius:function (endRadius) {
        cc.Assert(this._m_nEmitterMode == cc.kCCParticleModeGravity, "Particle Mode should be Gravity");
        this.modeB.endRadius = endRadius;
    },
    getEndRadiusVar:function () {
        cc.Assert(this._m_nEmitterMode == cc.kCCParticleModeGravity, "Particle Mode should be Gravity");
        return this.modeB.endRadiusVar;
    },
    setEndRadiusVar:function (endRadiusVar) {
        cc.Assert(this._m_nEmitterMode == cc.kCCParticleModeGravity, "Particle Mode should be Gravity");
        this.modeB.endRadiusVar = endRadiusVar;
    },
    getRotatePerSecond:function () {
        cc.Assert(this._m_nEmitterMode == cc.kCCParticleModeGravity, "Particle Mode should be Gravity");
        return this.modeB.rotatePerSecond;
    },
    setRotatePerSecond:function (degrees) {
        cc.Assert(this._m_nEmitterMode == cc.kCCParticleModeGravity, "Particle Mode should be Gravity");
        this.modeB.rotatePerSecond = degrees;
    },
    getRotatePerSecondVar:function () {
        cc.Assert(this._m_nEmitterMode == cc.kCCParticleModeGravity, "Particle Mode should be Gravity");
        return this.modeB.rotatePerSecondVar;
    },
    setRotatePerSecondVar:function (degrees) {
        cc.Assert(this._m_nEmitterMode == cc.kCCParticleModeGravity, "Particle Mode should be Gravity");
        this.modeB.rotatePerSecondVar = degrees;
    },
    //////////////////////////////////////////////////////////////////////////

    /** start size in pixels of each particle */
    _m_fStartSize:0,
    getStartSize:function () {
        return this._m_fStartSize;
    },
    setStartSize:function (startSize) {
        this._m_fStartSize = startSize;
    },

    /** size variance in pixels of each particle */
    _m_fStartSizeVar:0,
    getStartSizeVar:function () {
        return this._m_fStartSizeVar;
    },
    setStartSizeVar:function (startSizeVar) {
        this._m_fStartSizeVar = startSizeVar;
    },

    /** end size in pixels of each particle */
    _m_fEndSize:0,
    getEndSize:function () {
        return this._m_fEndSize;
    },
    setEndSize:function (endSize) {
        this._m_fEndSize = endSize;
    },

    /** end size variance in pixels of each particle */
    _m_fEndSizeVar:0,
    getEndSizeVar:function () {
        return this._m_fEndSizeVar;
    },
    setEndSizeVar:function (endSizeVar) {
        this._m_fEndSizeVar = endSizeVar;
    },

    /** start color of each particle */
    _m_tStartColor:new cc.Color4F(0, 0, 0, 1),
    getStartColor:function () {
        return this._m_tStartColor;
    },
    setStartColor:function (startColor) {
        this._m_tStartColor = startColor;
    },

    /** start color variance of each particle */
    _m_tStartColorVar:new cc.Color4F(0, 0, 0, 1),
    getStartColorVar:function () {
        return this._m_tStartColorVar;
    },
    setStartColorVar:function (startColorVar) {
        this._m_tStartColorVar = startColorVar;
    },

    /** end color and end color variation of each particle */
    _m_tEndColor:new cc.Color4F(0, 0, 0, 1),
    getEndColor:function () {
        return this._m_tEndColor;
    },
    setEndColor:function (endColor) {
        this._m_tEndColor = endColor;
    },

    /** end color variance of each particle */
    _m_tEndColorVar:new cc.Color4F(0, 0, 0, 1),
    getEndColorVar:function () {
        return this._m_tEndColorVar;
    },
    setEndColorVar:function (endColorVar) {
        this._m_tEndColorVar = endColorVar;
    },

    //* initial angle of each particle
    _m_fStartSpin:0,
    getStartSpin:function () {
        return this._m_fStartSpin;
    },
    setStartSpin:function (startSpin) {
        this._m_fStartSpin = startSpin;
    },

    //* initial angle of each particle
    _m_fStartSpinVar:0,
    getStartSpinVar:function () {
        return this._m_fStartSpinVar;
    },
    setStartSpinVar:function (startSpinVar) {
        this._m_fStartSpinVar = startSpinVar;
    },

    //* initial angle of each particle
    _m_fEndSpin:0,
    getEndSpin:function () {
        return this._m_fEndSpin;
    },
    setEndSpin:function (endSpin) {
        this._m_fEndSpin = endSpin;
    },

    //* initial angle of each particle
    _m_fEndSpinVar:0,
    getEndSpinVar:function () {
        return this._m_fEndSpinVar;
    },
    setEndSpinVar:function (endSpinVar) {
        this._m_fEndSpinVar = endSpinVar;
    },

    /** emission rate of the particles */
    _m_fEmissionRate:0,
    getEmissionRate:function () {
        return this._m_fEmissionRate;
    },
    setEmissionRate:function (emissionRate) {
        this._m_fEmissionRate = emissionRate;
    },

    /** maximum particles of the system */
    _m_uTotalParticles:0,
    getTotalParticles:function () {
        return this._m_uTotalParticles;
    },
    setTotalParticles:function (totalParticles) {
        this._m_uTotalParticles = totalParticles;
    },

    /** conforms to CocosNodeTexture protocol */
    _m_pTexture:null,
    getTexture:function () {
        return this._m_pTexture;
    },
    setTexture:function (texture) {
        //TODO
        this._m_pTexture = texture;

        if ((texture instanceof HTMLImageElement) || (texture instanceof HTMLCanvasElement)) {

        } else {
            // If the new texture has No premultiplied alpha, AND the blendFunc hasn't been changed, then update it
            if (this._m_pTexture && !this._m_pTexture.getHasPremultipliedAlpha() &&
                ( this._m_tBlendFunc.src == cc.BLEND_SRC && this._m_tBlendFunc.dst == cc.BLEND_DST )) {
                this._m_tBlendFunc.src = GL_SRC_ALPHA;
                this._m_tBlendFunc.dst = GL_ONE_MINUS_SRC_ALPHA;
            }
        }

    },

    /** conforms to CocosNodeTexture protocol */
    _m_tBlendFunc:new cc.BlendFunc(0, 0),
    getBlendFunc:function () {
        return this._m_tBlendFunc;
    },
    setBlendFunc:function (blendFunc) {
        this._m_tBlendFunc = blendFunc;
    },

    /** whether or not the particles are using blend additive.
     If enabled, the following blending function will be used.
     @code
     source blend function = GL_SRC_ALPHA;
     dest blend function = GL_ONE;
     @endcode
     */
    _m_bIsBlendAdditive:false,
    getIsBlendAdditive:function () {
        return this._m_bIsBlendAdditive;
        //return( this._m_tBlendFunc.src == GL_SRC_ALPHA && this._m_tBlendFunc.dst == GL_ONE);
    },
    setIsBlendAdditive:function (isBlendAdditive) {
        //TODO
        this._m_bIsBlendAdditive = isBlendAdditive;
        return;
        if (isBlendAdditive) {
            //this._m_tBlendFunc.src = GL_SRC_ALPHA;
            //this._m_tBlendFunc.dst = GL_ONE;
        } else {
            if (this._m_pTexture && !this._m_pTexture.getHasPremultipliedAlpha()) {
                //this._m_tBlendFunc.src = GL_SRC_ALPHA;
                //this._m_tBlendFunc.dst = GL_ONE_MINUS_SRC_ALPHA;
            } else {
                this._m_tBlendFunc.src = cc.BLEND_SRC;
                this._m_tBlendFunc.dst = cc.BLEND_DST;
            }
        }
    },

    /** particles movement type: Free or Grouped
     @since v0.8
     */
    _m_ePositionType:cc.kCCPositionTypeFree,
    getPositionType:function () {
        return this._m_ePositionType;
    },
    setPositionType:function (positionType) {
        this._m_ePositionType = positionType;
    },

    /** whether or not the node will be auto-removed when it has no particles left.
     By default it is false.
     @since v0.8
     */
    _m_bIsAutoRemoveOnFinish:false,
    getIsAutoRemoveOnFinish:function () {
        return this._m_bIsAutoRemoveOnFinish;
    },
    setIsAutoRemoveOnFinish:function (isAutoRemoveOnFinish) {
        this._m_bIsAutoRemoveOnFinish = isAutoRemoveOnFinish;
    },

    /** Switch between different kind of emitter modes:
     - kCCParticleModeGravity: uses gravity, speed, radial and tangential acceleration
     - kCCParticleModeRadius: uses radius movement + rotation
     */
    _m_nEmitterMode:0,
    getEmitterMode:function () {
        return this._m_nEmitterMode;
    },
    setEmitterMode:function (emitterMode) {
        this._m_nEmitterMode = emitterMode;
    },

    ctor:function () {
        this._super();
        this._m_tSourcePosition = new cc.Point(0, 0);
        this._m_tPosVar = new cc.Point(0, 0);
        this._m_nEmitterMode = cc.kCCParticleModeGravity;
        this.modeA = new cc.ParticleSystem.tModeA();
        this.modeA.gravity = new cc.Point(0, 0);
        this.modeB = new cc.ParticleSystem.tModeB();
        this._m_tBlendFunc = new cc.BlendFunc(cc.BLEND_SRC, cc.BLEND_DST);
    },

    /** initializes a CCParticleSystem from a plist file.
     This plist files can be creted manually or with Particle Designer:
     http://particledesigner.71squared.com/
     @since v0.99.3
     */
    initWithFile:function (plistFile) {
        //TODO
        this._m_sPlistFile = plistFile;
        var dict = cc.FileUtils.dictionaryWithContentsOfFileThreadSafe(this._m_sPlistFile);

        cc.Assert(dict != null, "Particles: file not found");
        return this.initWithDictionary(dict);
    },


    boundingBoxToWorld:function () {
        return new cc.Rect(0, 0, cc.canvas.width, cc.canvas.height);
    },

    /** initializes a CCQuadParticleSystem from a CCDictionary.
     @since v0.99.3
     */
    initWithDictionary:function (dictionary) {
        var bRet = false;
        var buffer = null;
        var deflated = null;
        var image = null;

        var maxParticles = parseInt(this._valueForKey("maxParticles", dictionary));
        // self, not super
        if (this.initWithTotalParticles(maxParticles)) {
            // angle
            this._m_fAngle = parseFloat(this._valueForKey("angle", dictionary));
            this._m_fAngleVar = parseFloat(this._valueForKey("angleVariance", dictionary));

            // duration
            this._m_fDuration = parseFloat(this._valueForKey("duration", dictionary));

            // blend function
            this._m_tBlendFunc.src = parseInt(this._valueForKey("blendFuncSource", dictionary));
            this._m_tBlendFunc.dst = parseInt(this._valueForKey("blendFuncDestination", dictionary));

            // color
            this._m_tStartColor.r = parseFloat(this._valueForKey("startColorRed", dictionary));
            this._m_tStartColor.g = parseFloat(this._valueForKey("startColorGreen", dictionary));
            this._m_tStartColor.b = parseFloat(this._valueForKey("startColorBlue", dictionary));
            this._m_tStartColor.a = parseFloat(this._valueForKey("startColorAlpha", dictionary));

            this._m_tStartColorVar.r = parseFloat(this._valueForKey("startColorVarianceRed", dictionary));
            this._m_tStartColorVar.g = parseFloat(this._valueForKey("startColorVarianceGreen", dictionary));
            this._m_tStartColorVar.b = parseFloat(this._valueForKey("startColorVarianceBlue", dictionary));
            this._m_tStartColorVar.a = parseFloat(this._valueForKey("startColorVarianceAlpha", dictionary));

            this._m_tEndColor.r = parseFloat(this._valueForKey("finishColorRed", dictionary));
            this._m_tEndColor.g = parseFloat(this._valueForKey("finishColorGreen", dictionary));
            this._m_tEndColor.b = parseFloat(this._valueForKey("finishColorBlue", dictionary));
            this._m_tEndColor.a = parseFloat(this._valueForKey("finishColorAlpha", dictionary));

            this._m_tEndColorVar.r = parseFloat(this._valueForKey("finishColorVarianceRed", dictionary));
            this._m_tEndColorVar.g = parseFloat(this._valueForKey("finishColorVarianceGreen", dictionary));
            this._m_tEndColorVar.b = parseFloat(this._valueForKey("finishColorVarianceBlue", dictionary));
            this._m_tEndColorVar.a = parseFloat(this._valueForKey("finishColorVarianceAlpha", dictionary));

            // particle size
            this._m_fStartSize = parseFloat(this._valueForKey("startParticleSize", dictionary));
            this._m_fStartSizeVar = parseFloat(this._valueForKey("startParticleSizeVariance", dictionary));
            this._m_fEndSize = parseFloat(this._valueForKey("finishParticleSize", dictionary));
            this._m_fEndSizeVar = parseFloat(this._valueForKey("finishParticleSizeVariance", dictionary));

            // position
            var x = parseFloat(this._valueForKey("sourcePositionx", dictionary));
            var y = parseFloat(this._valueForKey("sourcePositiony", dictionary));
            this.setPosition(cc.ccp(x, y));
            this._m_tPosVar.x = parseFloat(this._valueForKey("sourcePositionVariancex", dictionary));
            this._m_tPosVar.y = parseFloat(this._valueForKey("sourcePositionVariancey", dictionary));

            // Spinning
            this._m_fStartSpin = parseFloat(this._valueForKey("rotationStart", dictionary));
            this._m_fStartSpinVar = parseFloat(this._valueForKey("rotationStartVariance", dictionary));
            this._m_fEndSpin = parseFloat(this._valueForKey("rotationEnd", dictionary));
            this._m_fEndSpinVar = parseFloat(this._valueForKey("rotationEndVariance", dictionary));

            this._m_nEmitterMode = parseInt(this._valueForKey("emitterType", dictionary));

            // Mode A: Gravity + tangential accel + radial accel
            if (this._m_nEmitterMode == cc.kCCParticleModeGravity) {
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
            } else if (this._m_nEmitterMode == cc.kCCParticleModeRadius) {
                // or Mode B: radius movement
                this.modeB.startRadius = parseFloat(this._valueForKey("maxRadius", dictionary));
                this.modeB.startRadiusVar = parseFloat(this._valueForKey("maxRadiusVariance", dictionary));
                this.modeB.endRadius = parseFloat(this._valueForKey("minRadius", dictionary));
                this.modeB.endRadiusVar = 0;
                this.modeB.rotatePerSecond = parseFloat(this._valueForKey("rotatePerSecond", dictionary));
                this.modeB.rotatePerSecondVar = parseFloat(this._valueForKey("rotatePerSecondVariance", dictionary));
            } else {
                cc.Assert(false, "Invalid emitterType in config file");
                cc.BREAK_IF(true);
            }

            // life span
            this._m_fLife = parseFloat(this._valueForKey("particleLifespan", dictionary));
            this._m_fLifeVar = parseFloat(this._valueForKey("particleLifespanVariance", dictionary));

            // emission Rate
            this._m_fEmissionRate = this._m_uTotalParticles / this._m_fLife;

            // texture
            // Try to get the texture from the cache
            var textureName = this._valueForKey("textureFileName", dictionary);
            var fullpath = cc.FileUtils.fullPathFromRelativeFile(textureName, this._m_sPlistFile);

            var tex = null;

            if (textureName.length > 0) {
                // set not pop-up message box when load image failed
                var bNotify = cc.FileUtils.getIsPopupNotify();
                cc.FileUtils.setIsPopupNotify(false);
                tex = cc.TextureCache.sharedTextureCache().addImage(fullpath);

                // reset the value of UIImage notify
                cc.FileUtils.setIsPopupNotify(bNotify);
            }

            if (tex) {
                this._m_pTexture = tex;
            } else {
                var textureData = this._valueForKey("textureImageData", dictionary);
                cc.Assert(textureData, "cc.ParticleSystem.initWithDictory:textureImageData is null");

                if (textureData.length != 0) {
                    //TODO base64Decode
                    // if it fails, try to get it from the base64-gzipped data
                    var decodeLen = cc.base64Decode(textureData, textureData.length, buffer);
                    cc.Assert(buffer != null, "CCParticleSystem: error decoding textureImageData");
                    if (!buffer)
                        return false

                    var deflatedLen = cc.ZipUtils.ccInflateMemory(buffer, decodeLen, deflated);
                    cc.Assert(deflated != null, "CCParticleSystem: error ungzipping textureImageData");
                    if (!deflated)
                        return false

                    image = new cc.Image();
                    var isOK = image.initWithImageData(deflated, deflatedLen);
                    cc.Assert(isOK, "CCParticleSystem: error init image with Data");
                    if (!isOK)
                        return false

                    this._m_pTexture = cc.TextureCache.sharedTextureCache().addUIImage(image, fullpath);
                }
            }
            cc.Assert(this._m_pTexture != null, "CCParticleSystem: error loading the texture");

            if (!this._m_pTexture)
                return false
            bRet = true;
        }

        return bRet;
    },

    //! Initializes a system with a fixed number of particles
    initWithTotalParticles:function (numberOfParticles) {
        this._m_uTotalParticles = numberOfParticles;

        this._m_pParticles = [];

        if (!this._m_pParticles) {
            cc.Log("Particle system: not enough memory");
            return false;
        }

        // default, active
        this._m_bIsActive = true;

        // default blend function
        this._m_tBlendFunc.src = cc.BLEND_SRC;
        this._m_tBlendFunc.dst = cc.BLEND_DST;

        // default movement type;
        this._m_ePositionType = cc.kCCPositionTypeFree;

        // by default be in mode A:
        this._m_nEmitterMode = cc.kCCParticleModeGravity;

        // default: modulate
        // XXX: not used
        //	colorModulate = YES;
        this._m_bIsAutoRemoveOnFinish = false;

        // profiling
        /// @todo _profilingTimer = [[CCProfiler timerWithName:@"particle system" andInstance:self] retain];


        // Optimization: compile udpateParticle method
        //updateParticleSel = @selector(updateQuadWithParticle:newPosition:);
        //updateParticleImp = (CC_UPDATE_PARTICLE_IMP) [self methodForSelector:updateParticleSel];

        // udpate after action in run!
        this.scheduleUpdateWithPriority(1);
        return true;
    },

    //! Add a particle to the emitter
    addParticle:function () {
        if (this.isFull()) {
            return false;
        }

        var particle = new cc.tCCParticle();
        this.initParticle(particle);
        this._m_pParticles.push(particle);
        ++this._m_uParticleCount;

        return true;
    },

    //! Initializes a particle
    initParticle:function (particle) {
        // timeToLive
        // no negative life. prevent division by 0
        particle.timeToLive = this._m_fLife + this._m_fLifeVar * cc.RANDOM_MINUS1_1();
        particle.timeToLive = Math.max(0, particle.timeToLive);

        // position
        particle.pos.x = this._m_tSourcePosition.x + this._m_tPosVar.x * cc.RANDOM_MINUS1_1();
        particle.pos.x *= cc.CONTENT_SCALE_FACTOR();
        particle.pos.y = this._m_tSourcePosition.y + this._m_tPosVar.y * cc.RANDOM_MINUS1_1();
        particle.pos.y *= cc.CONTENT_SCALE_FACTOR();

        // Color
        var start = new cc.Color4F(
            cc.clampf(this._m_tStartColor.r + this._m_tStartColorVar.r * cc.RANDOM_MINUS1_1(), 0, 1),
            cc.clampf(this._m_tStartColor.g + this._m_tStartColorVar.g * cc.RANDOM_MINUS1_1(), 0, 1),
            cc.clampf(this._m_tStartColor.b + this._m_tStartColorVar.b * cc.RANDOM_MINUS1_1(), 0, 1),
            cc.clampf(this._m_tStartColor.a + this._m_tStartColorVar.a * cc.RANDOM_MINUS1_1(), 0, 1)
        );

        var end = new cc.Color4F(
            cc.clampf(this._m_tEndColor.r + this._m_tEndColorVar.r * cc.RANDOM_MINUS1_1(), 0, 1),
            cc.clampf(this._m_tEndColor.g + this._m_tEndColorVar.g * cc.RANDOM_MINUS1_1(), 0, 1),
            cc.clampf(this._m_tEndColor.b + this._m_tEndColorVar.b * cc.RANDOM_MINUS1_1(), 0, 1),
            cc.clampf(this._m_tEndColor.a + this._m_tEndColorVar.a * cc.RANDOM_MINUS1_1(), 0, 1)
        );

        particle.color = start;
        particle.deltaColor.r = (end.r - start.r) / particle.timeToLive;
        particle.deltaColor.g = (end.g - start.g) / particle.timeToLive;
        particle.deltaColor.b = (end.b - start.b) / particle.timeToLive;
        particle.deltaColor.a = (end.a - start.a) / particle.timeToLive;

        // size
        var startS = this._m_fStartSize + this._m_fStartSizeVar * cc.RANDOM_MINUS1_1();
        startS = Math.max(0, startS); // No negative value
        startS *= cc.CONTENT_SCALE_FACTOR();

        particle.size = startS;

        if (this._m_fEndSize == cc.kCCParticleStartSizeEqualToEndSize) {
            particle.deltaSize = 0;
        } else {
            var endS = this._m_fEndSize + this._m_fEndSizeVar * cc.RANDOM_MINUS1_1();
            endS = Math.max(0, endS); // No negative values
            endS *= cc.CONTENT_SCALE_FACTOR();
            particle.deltaSize = (endS - startS) / particle.timeToLive;
        }

        // rotation
        var startA = this._m_fStartSpin + this._m_fStartSpinVar * cc.RANDOM_MINUS1_1();
        var endA = this._m_fEndSpin + this._m_fEndSpinVar * cc.RANDOM_MINUS1_1();
        particle.rotation = startA;
        particle.deltaRotation = (endA - startA) / particle.timeToLive;

        // position
        if (this._m_ePositionType == cc.kCCPositionTypeFree) {
            var p = this.convertToWorldSpace(cc.PointZero());
            particle.startPos = cc.ccpMult(p, cc.CONTENT_SCALE_FACTOR());
        } else if (this._m_ePositionType == cc.kCCPositionTypeRelative) {
            particle.startPos = cc.ccpMult(this._m_tPosition, cc.CONTENT_SCALE_FACTOR());
        }

        // direction
        var a = cc.DEGREES_TO_RADIANS(this._m_fAngle + this._m_fAngleVar * cc.RANDOM_MINUS1_1());

        // Mode Gravity: A
        if (this._m_nEmitterMode == cc.kCCParticleModeGravity) {
            var v = new cc.Point(Math.cos(a), Math.sin(a));
            var s = this.modeA.speed + this.modeA.speedVar * cc.RANDOM_MINUS1_1();
            s *= cc.CONTENT_SCALE_FACTOR();

            // direction
            particle.modeA.dir = cc.ccpMult(v, s);

            // radial accel
            particle.modeA.radialAccel = this.modeA.radialAccel + this.modeA.radialAccelVar * cc.RANDOM_MINUS1_1();
            particle.modeA.radialAccel *= cc.CONTENT_SCALE_FACTOR();

            // tangential accel
            particle.modeA.tangentialAccel = this.modeA.tangentialAccel + this.modeA.tangentialAccelVar * cc.RANDOM_MINUS1_1();
            particle.modeA.tangentialAccel *= cc.CONTENT_SCALE_FACTOR();
        } else {
            // Mode Radius: B

            // Set the default diameter of the particle from the source position
            var startRadius = this.modeB.startRadius + this.modeB.startRadiusVar * cc.RANDOM_MINUS1_1();
            var endRadius = this.modeB.endRadius + this.modeB.endRadiusVar * cc.RANDOM_MINUS1_1();
            startRadius *= cc.CONTENT_SCALE_FACTOR();
            endRadius *= cc.CONTENT_SCALE_FACTOR();

            particle.modeB.radius = startRadius;

            if (this.modeB.endRadius == cc.kCCParticleStartRadiusEqualToEndRadius)
                particle.modeB.deltaRadius = 0;
            else
                particle.modeB.deltaRadius = (endRadius - startRadius) / particle.timeToLive;

            particle.modeB.angle = a;
            particle.modeB.degreesPerSecond = cc.DEGREES_TO_RADIANS(this.modeB.rotatePerSecond + this.modeB.rotatePerSecondVar * cc.RANDOM_MINUS1_1());
        }
    },

    //! stop emitting particles. Running particles will continue to run until they die
    stopSystem:function () {
        this._m_bIsActive = false;
        this._m_fElapsed = this._m_fDuration;
        this._m_fEmitCounter = 0;
    },

    //! Kill all living particles.
    resetSystem:function () {
        this._m_bIsActive = true;
        this._m_fElapsed = 0;
        for (this._m_uParticleIdx = 0; this._m_uParticleIdx < this._m_uParticleCount; ++this._m_uParticleIdx) {
            var p = this._m_pParticles[this._m_uParticleIdx];
            p.timeToLive = 0;
        }
    },

    //! whether or not the system is full
    isFull:function () {
        return (this._m_uParticleCount >= this._m_uTotalParticles);
    },

    //! should be overriden by subclasses
    updateQuadWithParticle:function (particle, newPosition) {
        // should be overriden
    },

    //! should be overriden by subclasses
    postStep:function () {
        // should be overriden
    },

    update:function (dt) {
        if (this._m_bIsActive && this._m_fEmissionRate) {
            var rate = 1.0 / this._m_fEmissionRate;
            this._m_fEmitCounter += dt;
            while ((this._m_uParticleCount < this._m_uTotalParticles) && (this._m_fEmitCounter > rate)) {
                this.addParticle();
                this._m_fEmitCounter -= rate;
            }

            this._m_fElapsed += dt;
            if (this._m_fDuration != -1 && this._m_fDuration < this._m_fElapsed) {
                this.stopSystem();
            }
        }
        this._m_uParticleIdx = 0;

        /// @todo CCProfilingBeginTimingBlock(_profilingTimer);

        var currentPosition = null;
        if (this._m_ePositionType == cc.kCCPositionTypeFree) {
            currentPosition = this.convertToWorldSpace(new cc.Point(0, 0));
            currentPosition.x *= cc.CONTENT_SCALE_FACTOR();
            currentPosition.y *= cc.CONTENT_SCALE_FACTOR();
        } else if (this._m_ePositionType == cc.kCCPositionTypeRelative) {
            currentPosition = new cc.Point(this._m_tPosition.x, this._m_tPosition.y);
            currentPosition.x *= cc.CONTENT_SCALE_FACTOR();
            currentPosition.y *= cc.CONTENT_SCALE_FACTOR();
        }

        while (this._m_uParticleIdx < this._m_uParticleCount) {
            var selParticle = this._m_pParticles[this._m_uParticleIdx];

            // life
            selParticle.timeToLive -= dt;

            if (selParticle.timeToLive > 0) {
                // Mode A: gravity, direction, tangential accel & radial accel
                if (this._m_nEmitterMode == cc.kCCParticleModeGravity) {
                    var tmp, radial, tangential;

                    radial = new cc.Point(0, 0);
                    // radial acceleration
                    if (selParticle.pos.x || selParticle.pos.y)
                        radial = cc.ccpNormalize(selParticle.pos);
                    tangential = new cc.Point(radial.x, radial.y);
                    radial = cc.ccpMult(radial, selParticle.modeA.radialAccel);

                    // tangential acceleration
                    var newy = tangential.x;
                    tangential.x = -tangential.y;
                    tangential.y = newy;
                    tangential = cc.ccpMult(tangential, selParticle.modeA.tangentialAccel);

                    // (gravity + radial + tangential) * dt
                    tmp = cc.ccpAdd(cc.ccpAdd(radial, tangential), this.modeA.gravity);
                    tmp = cc.ccpMult(tmp, dt);
                    selParticle.modeA.dir = cc.ccpAdd(selParticle.modeA.dir, tmp);
                    tmp = cc.ccpMult(selParticle.modeA.dir, dt);
                    selParticle.pos = cc.ccpAdd(selParticle.pos, tmp);
                } else {
                    // Mode B: radius movement

                    // Update the angle and radius of the particle.
                    selParticle.modeB.angle += selParticle.modeB.degreesPerSecond * dt;
                    selParticle.modeB.radius += selParticle.modeB.deltaRadius * dt;

                    selParticle.pos.x = -Math.cos(selParticle.modeB.angle) * selParticle.modeB.radius;
                    selParticle.pos.y = -Math.sin(selParticle.modeB.angle) * selParticle.modeB.radius;
                }

                // color
                selParticle.color.r += (selParticle.deltaColor.r * dt);
                selParticle.color.g += (selParticle.deltaColor.g * dt);
                selParticle.color.b += (selParticle.deltaColor.b * dt);
                selParticle.color.a += (selParticle.deltaColor.a * dt);
                selParticle.isChangeColor = true;

                // size
                selParticle.size += (selParticle.deltaSize * dt);
                selParticle.size = Math.max(0, selParticle.size);

                // angle
                selParticle.rotation += (selParticle.deltaRotation * dt);

                //
                // update values in quad
                //
                var newPos;
                if (this._m_ePositionType == cc.kCCPositionTypeFree || this._m_ePositionType == cc.kCCPositionTypeRelative) {
                    var diff = cc.ccpSub(currentPosition, selParticle.startPos);
                    newPos = cc.ccpSub(selParticle.pos, diff);
                } else {
                    newPos = selParticle.pos;
                }

                if(cc.renderContextType == cc.kWebGL){
                    this.updateQuadWithParticle(selParticle, newPos);
                }else{
                    selParticle.drawPos = newPos;
                }
                //updateParticleImp(self, updateParticleSel, p, newPos);

                // update particle counter
                ++this._m_uParticleIdx;
            } else {
                // life < 0
                cc.ArrayRemoveObject(this._m_pParticles, selParticle);

                --this._m_uParticleCount;

                if (this._m_uParticleCount == 0 && this._m_bIsAutoRemoveOnFinish) {
                    this.unscheduleUpdate();
                    this._m_pParent.removeChild(this, true);
                    return;
                }
            }
        }

        /// @todo CCProfilingEndTimingBlock(_profilingTimer);

        if (cc.USES_VBO)
            this.postStep();
    },

    /** Private method, return the string found by key in dict.
     @return "" if not found; return the string if found.
     */
    _valueForKey:function (key, dict) {
        if (dict) {
            var pString = dict[key];
            return pString ? pString : "";
        }
        return "";
    }
});

/** creates an initializes a CCParticleSystem from a plist file.
 This plist files can be creted manually or with Particle Designer:
 http://particledesigner.71squared.com/
 @since v0.99.3
 */
cc.ParticleSystem.particleWithFile = function (plistFile) {
    var pRet = new cc.ParticleSystem();
    if (pRet && pRet.initWithFile(plistFile)) {
        return pRet;
    }
    return null;
};

// Different modes
//! Mode A:Gravity + Tangential Accel + Radial Accel
cc.ParticleSystem.tModeA = function (gravity, speed, speedVar, tangentialAccel, tangentialAccelVar, radialAccel, radialAccelVar) {
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

//! Mode B: circular movement (gravity, radial accel and tangential accel don't are not used in this mode)
cc.ParticleSystem.tModeB = function (startRadius, startRadiusVar, endRadius, endRadiusVar, rotatePerSecond, rotatePerSecondVar) {
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