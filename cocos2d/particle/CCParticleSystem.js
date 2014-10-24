/****************************************************************************
 Copyright (c) 2008-2010 Ricardo Quesada
 Copyright (c) 2011-2012 cocos2d-x.org
 Copyright (c) 2013-2014 Chukong Technologies Inc.

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


// tCCPositionType
// possible types of particle positions


/**
 * Structure that contains the values of each particle
 * @Class
 * @Construct
 * @param {cc.Point} [pos=cc.p(0,0)] Position of particle
 * @param {cc.Point} [startPos=cc.p(0,0)]
 * @param {cc.Color} [color= cc.color(0, 0, 0, 255)]
 * @param {cc.Color} [deltaColor=cc.color(0, 0, 0, 255)]
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
    this.pos = pos ? pos : cc.p(0,0);
    this.startPos = startPos ? startPos : cc.p(0,0);
    this.color = color ? color : {r:0, g: 0, b:0, a:255};
    this.deltaColor = deltaColor ? deltaColor : {r:0, g: 0, b:0, a:255} ;
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
    this.dir = dir ? dir : cc.p(0,0);
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
 *     - spinning particles (supported when using ParticleSystem)       <br/>
 *     - tangential acceleration (Gravity mode)                               <br/>
 *     - radial acceleration (Gravity mode)                                   <br/>
 *     - radius direction (Radius mode) (Particle Designer supports outwards to inwards direction only) <br/>
 *     It is possible to customize any of the above mentioned properties in runtime. Example:   <br/>
 * </p>
 * @class
 * @extends cc.Node
 *
 * @property {Boolean}              opacityModifyRGB    - Indicate whether the alpha value modify color.
 * @property {cc.SpriteBatchNode}   batchNode           - Weak reference to the sprite batch node.
 * @property {Boolean}              active              - <@readonly> Indicate whether the particle system is activated.
 * @property {Number}               shapeType           - ShapeType of ParticleSystem : cc.ParticleSystem.BALL_SHAPE | cc.ParticleSystem.STAR_SHAPE.
 * @property {Number}               atlasIndex          - Index of system in batch node array.
 * @property {Number}               particleCount       - Current quantity of particles that are being simulated.
 * @property {Number}               duration            - How many seconds the emitter wil run. -1 means 'forever'
 * @property {cc.Point}             sourcePos           - Source position of the emitter.
 * @property {cc.Point}             posVar              - Variation of source position.
 * @property {Number}               life                - Life of each particle setter.
 * @property {Number}               lifeVar             - Variation of life.
 * @property {Number}               angle               - Angle of each particle setter.
 * @property {Number}               angleVar            - Variation of angle of each particle setter.
 * @property {Number}               startSize           - Start size in pixels of each particle.
 * @property {Number}               startSizeVar        - Variation of start size in pixels.
 * @property {Number}               endSize             - End size in pixels of each particle.
 * @property {Number}               endSizeVar          - Variation of end size in pixels.
 * @property {Number}               startSpin           - Start angle of each particle.
 * @property {Number}               startSpinVar        - Variation of start angle.
 * @property {Number}               endSpin             - End angle of each particle.
 * @property {Number}               endSpinVar          - Variation of end angle.
 * @property {cc.Point}             gravity             - Gravity of the emitter.
 * @property {cc.Point}             speed               - Speed of the emitter.
 * @property {cc.Point}             speedVar            - Variation of the speed.
 * @property {Number}               tangentialAccel     - Tangential acceleration of each particle. Only available in 'Gravity' mode.
 * @property {Number}               tangentialAccelVar  - Variation of the tangential acceleration.
 * @property {Number}               tangentialAccel     - Radial acceleration of each particle. Only available in 'Gravity' mode.
 * @property {Number}               tangentialAccelVar  - Variation of the radial acceleration.
 * @property {Boolean}              rotationIsDir       - Indicate whether the rotation of each particle equals to its direction. Only available in 'Gravity' mode.
 * @property {Number}               startRadius         - Starting radius of the particles. Only available in 'Radius' mode.
 * @property {Number}               startRadiusVar      - Variation of the starting radius.
 * @property {Number}               endRadius           - Ending radius of the particles. Only available in 'Radius' mode.
 * @property {Number}               endRadiusVar        - Variation of the ending radius.
 * @property {Number}               rotatePerS          - Number of degress to rotate a particle around the source pos per second. Only available in 'Radius' mode.
 * @property {Number}               rotatePerSVar       - Variation of the degress to rotate a particle around the source pos per second.
 * @property {cc.Color}             startColor          - Start color of each particle.
 * @property {cc.Color}             startColorVar       - Variation of the start color.
 * @property {cc.Color}             endColor            - Ending color of each particle.
 * @property {cc.Color}             endColorVar         - Variation of the end color.
 * @property {Number}               emissionRate        - Emission rate of the particles.
 * @property {Number}               emitterMode         - Emitter modes: CCParticleSystem.MODE_GRAVITY: uses gravity, speed, radial and tangential acceleration; CCParticleSystem.MODE_RADIUS: uses radius movement + rotation.
 * @property {Number}               positionType        - Particles movement type: cc.ParticleSystem.TYPE_FREE | cc.ParticleSystem.TYPE_GROUPED.
 * @property {Number}               totalParticles      - Maximum particles of the system.
 * @property {Boolean}              autoRemoveOnFinish  - Indicate whether the node will be auto-removed when it has no particles left.
 * @property {cc.Texture2D}         texture             - Texture of Particle System.
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
    _className:"ParticleSystem",

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
    atlasIndex: 0,

    //true if scaled or rotated
    _transformSystemDirty: false,
    _allocatedParticles: 0,

    //drawMode
    drawMode: null,

    //shape type
    shapeType: null,
    _isActive: false,
    particleCount: 0,
    duration: 0,
    _sourcePosition: null,
    _posVar: null,
    life: 0,
    lifeVar: 0,
    angle: 0,
    angleVar: 0,
    startSize: 0,
    startSizeVar: 0,
    endSize: 0,
    endSizeVar: 0,
    _startColor: null,
    _startColorVar: null,
    _endColor: null,
    _endColorVar: null,
    startSpin: 0,
    startSpinVar: 0,
    endSpin: 0,
    endSpinVar: 0,
    emissionRate: 0,
    _totalParticles: 0,
    _texture: null,
    _blendFunc: null,
    _opacityModifyRGB: false,
    positionType: null,
    autoRemoveOnFinish: false,
    emitterMode: 0,

    // quads to be rendered
    _quads:null,
    // indices
    _indices:null,

    //_VAOname:0,
    //0: vertex  1: indices
    _buffersVBO:null,
    _pointRect:null,

    _textureLoaded: null,
    _quadsArrayBuffer:null,

    /**
     * <p> return the string found by key in dict. <br/>
     *    This plist files can be create manually or with Particle Designer:<br/>
     *    http://particledesigner.71squared.com/<br/>
     * </p>
     * Constructor of cc.ParticleSystem
     * @param {String|Number} plistFile
     */
    ctor:function (plistFile) {
        cc.Node.prototype.ctor.call(this);
        this.emitterMode = cc.ParticleSystem.MODE_GRAVITY;
        this.modeA = new cc.ParticleSystem.ModeA();
        this.modeB = new cc.ParticleSystem.ModeB();
        this._blendFunc = {src:cc.BLEND_SRC, dst:cc.BLEND_DST};

        this._particles = [];
        this._sourcePosition = cc.p(0, 0);
        this._posVar = cc.p(0, 0);

        this._startColor = cc.color(255, 255, 255, 255);
        this._startColorVar = cc.color(255, 255, 255, 255);
        this._endColor = cc.color(255, 255, 255, 255);
        this._endColorVar = cc.color(255, 255, 255, 255);

        this._plistFile = "";
        this._elapsed = 0;
        this._dontTint = false;
        this._pointZeroForParticle = cc.p(0, 0);
        this._emitCounter = 0;
        this._particleIdx = 0;
        this._batchNode = null;
        this.atlasIndex = 0;

        this._transformSystemDirty = false;
        this._allocatedParticles = 0;
        this.drawMode = cc.ParticleSystem.SHAPE_MODE;
        this.shapeType = cc.ParticleSystem.BALL_SHAPE;
        this._isActive = false;
        this.particleCount = 0;
        this.duration = 0;
        this.life = 0;
        this.lifeVar = 0;
        this.angle = 0;
        this.angleVar = 0;
        this.startSize = 0;
        this.startSizeVar = 0;
        this.endSize = 0;
        this.endSizeVar = 0;

        this.startSpin = 0;
        this.startSpinVar = 0;
        this.endSpin = 0;
        this.endSpinVar = 0;
        this.emissionRate = 0;
        this._totalParticles = 0;
        this._texture = null;
        this._opacityModifyRGB = false;
        this.positionType = cc.ParticleSystem.TYPE_FREE;
        this.autoRemoveOnFinish = false;

        this._buffersVBO = [0, 0];
        this._quads = [];
        this._indices = [];
        this._pointRect = cc.rect(0, 0, 0, 0);
        this._textureLoaded = true;

        if (cc._renderType === cc._RENDER_TYPE_WEBGL) {
            this._quadsArrayBuffer = null;
        }

        if (!plistFile || cc.isNumber(plistFile)) {
            var ton = plistFile || 100;
            this.setDrawMode(cc.ParticleSystem.TEXTURE_MODE);
            this.initWithTotalParticles(ton);
        } else if (plistFile) {
            this.initWithFile(plistFile);
        }
    },

    _initRendererCmd: function(){
        if(cc._renderType === cc._RENDER_TYPE_CANVAS)
            this._rendererCmd = new cc.ParticleRenderCmdCanvas(this);
        else
            this._rendererCmd = new cc.ParticleRenderCmdWebGL(this);
    },

    /**
     * initializes the indices for the vertices
     */
    initIndices:function () {
        var locIndices = this._indices;
        for (var i = 0, len = this._totalParticles; i < len; ++i) {
            var i6 = i * 6;
            var i4 = i * 4;
            locIndices[i6 + 0] = i4 + 0;
            locIndices[i6 + 1] = i4 + 1;
            locIndices[i6 + 2] = i4 + 2;

            locIndices[i6 + 5] = i4 + 1;
            locIndices[i6 + 4] = i4 + 2;
            locIndices[i6 + 3] = i4 + 3;
        }
    },

    /**
     * <p> initializes the texture with a rectangle measured Points<br/>
     * pointRect should be in Texture coordinates, not pixel coordinates
     * </p>
     * @param {cc.Rect} pointRect
     */
    initTexCoordsWithRect:function (pointRect) {
        var scaleFactor = cc.contentScaleFactor();
        // convert to pixels coords
        var rect = cc.rect(
            pointRect.x * scaleFactor,
            pointRect.y * scaleFactor,
            pointRect.width * scaleFactor,
            pointRect.height * scaleFactor);

        var wide = pointRect.width;
        var high = pointRect.height;

        if (this._texture) {
            wide = this._texture.pixelsWidth;
            high = this._texture.pixelsHeight;
        }

        if(cc._renderType === cc._RENDER_TYPE_CANVAS)
            return;

        var left, bottom, right, top;
        if (cc.FIX_ARTIFACTS_BY_STRECHING_TEXEL) {
            left = (rect.x * 2 + 1) / (wide * 2);
            bottom = (rect.y * 2 + 1) / (high * 2);
            right = left + (rect.width * 2 - 2) / (wide * 2);
            top = bottom + (rect.height * 2 - 2) / (high * 2);
        } else {
            left = rect.x / wide;
            bottom = rect.y / high;
            right = left + rect.width / wide;
            top = bottom + rect.height / high;
        }

        // Important. Texture in cocos2d are inverted, so the Y component should be inverted
        var temp = top;
        top = bottom;
        bottom = temp;

        var quads;
        var start = 0, end = 0;
        if (this._batchNode) {
            quads = this._batchNode.textureAtlas.quads;
            start = this.atlasIndex;
            end = this.atlasIndex + this._totalParticles;
        } else {
            quads = this._quads;
            start = 0;
            end = this._totalParticles;
        }

        for (var i = start; i < end; i++) {
            if (!quads[i])
                quads[i] = cc.V3F_C4B_T2F_QuadZero();

            // bottom-left vertex:
            var selQuad = quads[i];
            selQuad.bl.texCoords.u = left;
            selQuad.bl.texCoords.v = bottom;
            // bottom-right vertex:
            selQuad.br.texCoords.u = right;
            selQuad.br.texCoords.v = bottom;
            // top-left vertex:
            selQuad.tl.texCoords.u = left;
            selQuad.tl.texCoords.v = top;
            // top-right vertex:
            selQuad.tr.texCoords.u = right;
            selQuad.tr.texCoords.v = top;
        }
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
            var oldBatch = this._batchNode;

            this._batchNode = batchNode; //weak reference

            if (batchNode) {
                var locParticles = this._particles;
                for (var i = 0; i < this._totalParticles; i++)
                    locParticles[i].atlasIndex = i;
            }

            // NEW: is self render ?
            if (!batchNode) {
                this._allocMemory();
                this.initIndices();
                this.setTexture(oldBatch.getTexture());
                //if (cc.TEXTURE_ATLAS_USE_VAO)
                //    this._setupVBOandVAO();
                //else
                this._setupVBO();
            } else if (!oldBatch) {
                // OLD: was it self render cleanup  ?
                // copy current state to batch
                this._batchNode.textureAtlas._copyQuadsToTextureAtlas(this._quads, this.atlasIndex);

                //delete buffer
                cc._renderContext.deleteBuffer(this._buffersVBO[1]);     //where is re-bindBuffer code?

                //if (cc.TEXTURE_ATLAS_USE_VAO)
                //    glDeleteVertexArrays(1, this._VAOname);
            }
        }
    },

    /**
     * return index of system in batch node array
     * @return {Number}
     */
    getAtlasIndex:function () {
        return this.atlasIndex;
    },

    /**
     * set index of system in batch node array
     * @param {Number} atlasIndex
     */
    setAtlasIndex:function (atlasIndex) {
        this.atlasIndex = atlasIndex;
    },

    /**
     * Return DrawMode of ParticleSystem
     * @return {Number}
     */
    getDrawMode:function () {
        return this.drawMode;
    },

    /**
     * DrawMode of ParticleSystem setter
     * @param {Number} drawMode
     */
    setDrawMode:function (drawMode) {
        this.drawMode = drawMode;
        if(this._rendererCmd)
            this._rendererCmd._drawMode = drawMode;
    },

    /**
     * Return ShapeType of ParticleSystem
     * @return {Number}
     */
    getShapeType:function () {
        return this.shapeType;
    },

    /**
     * ShapeType of ParticleSystem setter
     * @param {Number} shapeType
     */
    setShapeType:function (shapeType) {
        this.shapeType = shapeType;
        if(this._rendererCmd)
            this._rendererCmd._shapeType = shapeType;
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
        return this.particleCount;
    },

    /**
     * Quantity of particles setter
     * @param {Number} particleCount
     */
    setParticleCount:function (particleCount) {
        this.particleCount = particleCount;
    },

    /**
     * How many seconds the emitter wil run. -1 means 'forever'
     * @return {Number}
     */
    getDuration:function () {
        return this.duration;
    },

    /**
     * set run seconds of the emitter
     * @param {Number} duration
     */
    setDuration:function (duration) {
        this.duration = duration;
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
        return this.life;
    },

    /**
     * life of each particle setter
     * @param {Number} life
     */
    setLife:function (life) {
        this.life = life;
    },

    /**
     * Return life variance of each particle
     * @return {Number}
     */
    getLifeVar:function () {
        return this.lifeVar;
    },

    /**
     * life variance of each particle setter
     * @param {Number} lifeVar
     */
    setLifeVar:function (lifeVar) {
        this.lifeVar = lifeVar;
    },

    /**
     * Return angle of each particle
     * @return {Number}
     */
    getAngle:function () {
        return this.angle;
    },

    /**
     * angle of each particle setter
     * @param {Number} angle
     */
    setAngle:function (angle) {
        this.angle = angle;
    },

    /**
     * Return angle variance of each particle
     * @return {Number}
     */
    getAngleVar:function () {
        return this.angleVar;
    },

    /**
     * angle variance of each particle setter
     * @param angleVar
     */
    setAngleVar:function (angleVar) {
        this.angleVar = angleVar;
    },

    // mode A
    /**
     * Return Gravity of emitter
     * @return {cc.Point}
     */
    getGravity:function () {
        if(this.emitterMode !== cc.ParticleSystem.MODE_GRAVITY)
            cc.log("cc.ParticleBatchNode.getGravity() : Particle Mode should be Gravity");
        var locGravity = this.modeA.gravity;
        return cc.p(locGravity.x, locGravity.y);
    },

    /**
     * Gravity of emitter setter
     * @param {cc.Point} gravity
     */
    setGravity:function (gravity) {
        if(this.emitterMode !== cc.ParticleSystem.MODE_GRAVITY)
            cc.log("cc.ParticleBatchNode.setGravity() : Particle Mode should be Gravity");
        this.modeA.gravity = gravity;
    },

    /**
     * Return Speed of each particle
     * @return {Number}
     */
    getSpeed:function () {
        if(this.emitterMode !== cc.ParticleSystem.MODE_GRAVITY)
            cc.log("cc.ParticleBatchNode.getSpeed() : Particle Mode should be Gravity");
        return this.modeA.speed;
    },

    /**
     * Speed of each particle setter
     * @param {Number} speed
     */
    setSpeed:function (speed) {
        if(this.emitterMode !== cc.ParticleSystem.MODE_GRAVITY)
            cc.log("cc.ParticleBatchNode.setSpeed() : Particle Mode should be Gravity");
        this.modeA.speed = speed;
    },

    /**
     * return speed variance of each particle. Only available in 'Gravity' mode.
     * @return {Number}
     */
    getSpeedVar:function () {
        if(this.emitterMode !== cc.ParticleSystem.MODE_GRAVITY)
            cc.log("cc.ParticleBatchNode.getSpeedVar() : Particle Mode should be Gravity");
        return this.modeA.speedVar;
    },

    /**
     * speed variance of each particle setter. Only available in 'Gravity' mode.
     * @param {Number} speedVar
     */
    setSpeedVar:function (speedVar) {
        if(this.emitterMode !== cc.ParticleSystem.MODE_GRAVITY)
            cc.log("cc.ParticleBatchNode.setSpeedVar() : Particle Mode should be Gravity");
        this.modeA.speedVar = speedVar;
    },

    /**
     * Return tangential acceleration of each particle. Only available in 'Gravity' mode.
     * @return {Number}
     */
    getTangentialAccel:function () {
        if(this.emitterMode !== cc.ParticleSystem.MODE_GRAVITY)
            cc.log("cc.ParticleBatchNode.getTangentialAccel() : Particle Mode should be Gravity");
        return this.modeA.tangentialAccel;
    },

    /**
     * Tangential acceleration of each particle setter. Only available in 'Gravity' mode.
     * @param {Number} tangentialAccel
     */
    setTangentialAccel:function (tangentialAccel) {
        if(this.emitterMode !== cc.ParticleSystem.MODE_GRAVITY)
            cc.log("cc.ParticleBatchNode.setTangentialAccel() : Particle Mode should be Gravity");
        this.modeA.tangentialAccel = tangentialAccel;
    },

    /**
     * Return tangential acceleration variance of each particle. Only available in 'Gravity' mode.
     * @return {Number}
     */
    getTangentialAccelVar:function () {
        if(this.emitterMode !== cc.ParticleSystem.MODE_GRAVITY)
            cc.log("cc.ParticleBatchNode.getTangentialAccelVar() : Particle Mode should be Gravity");
        return this.modeA.tangentialAccelVar;
    },

    /**
     * tangential acceleration variance of each particle setter. Only available in 'Gravity' mode.
     * @param {Number} tangentialAccelVar
     */
    setTangentialAccelVar:function (tangentialAccelVar) {
        if(this.emitterMode !== cc.ParticleSystem.MODE_GRAVITY)
            cc.log("cc.ParticleBatchNode.setTangentialAccelVar() : Particle Mode should be Gravity");
        this.modeA.tangentialAccelVar = tangentialAccelVar;
    },

    /**
     * Return radial acceleration of each particle. Only available in 'Gravity' mode.
     * @return {Number}
     */
    getRadialAccel:function () {
        if(this.emitterMode !== cc.ParticleSystem.MODE_GRAVITY)
            cc.log("cc.ParticleBatchNode.getRadialAccel() : Particle Mode should be Gravity");
        return this.modeA.radialAccel;
    },

    /**
     * radial acceleration of each particle setter. Only available in 'Gravity' mode.
     * @param {Number} radialAccel
     */
    setRadialAccel:function (radialAccel) {
        if(this.emitterMode !== cc.ParticleSystem.MODE_GRAVITY)
            cc.log("cc.ParticleBatchNode.setRadialAccel() : Particle Mode should be Gravity");
        this.modeA.radialAccel = radialAccel;
    },

    /**
     * Return radial acceleration variance of each particle. Only available in 'Gravity' mode.
     * @return {Number}
     */
    getRadialAccelVar:function () {
        if(this.emitterMode !== cc.ParticleSystem.MODE_GRAVITY)
            cc.log("cc.ParticleBatchNode.getRadialAccelVar() : Particle Mode should be Gravity");
        return this.modeA.radialAccelVar;
    },

    /**
     * radial acceleration variance of each particle setter. Only available in 'Gravity' mode.
     * @param {Number} radialAccelVar
     */
    setRadialAccelVar:function (radialAccelVar) {
        if(this.emitterMode !== cc.ParticleSystem.MODE_GRAVITY)
            cc.log("cc.ParticleBatchNode.setRadialAccelVar() : Particle Mode should be Gravity");
        this.modeA.radialAccelVar = radialAccelVar;
    },

    /**
     * get the rotation of each particle to its direction Only available in 'Gravity' mode.
     * @returns {boolean}
     */
    getRotationIsDir: function(){
        if(this.emitterMode !== cc.ParticleSystem.MODE_GRAVITY)
            cc.log("cc.ParticleBatchNode.getRotationIsDir() : Particle Mode should be Gravity");
        return this.modeA.rotationIsDir;
    },

    /**
     * set the rotation of each particle to its direction Only available in 'Gravity' mode.
     * @param {boolean} t
     */
    setRotationIsDir: function(t){
        if(this.emitterMode !== cc.ParticleSystem.MODE_GRAVITY)
            cc.log("cc.ParticleBatchNode.setRotationIsDir() : Particle Mode should be Gravity");
        this.modeA.rotationIsDir = t;
    },

    // mode B
    /**
     * Return starting radius of the particles. Only available in 'Radius' mode.
     * @return {Number}
     */
    getStartRadius:function () {
        if(this.emitterMode !== cc.ParticleSystem.MODE_RADIUS)
            cc.log("cc.ParticleBatchNode.getStartRadius() : Particle Mode should be Radius");
        return this.modeB.startRadius;
    },

    /**
     * starting radius of the particles setter. Only available in 'Radius' mode.
     * @param {Number} startRadius
     */
    setStartRadius:function (startRadius) {
        if(this.emitterMode !== cc.ParticleSystem.MODE_RADIUS)
            cc.log("cc.ParticleBatchNode.setStartRadius() : Particle Mode should be Radius");
        this.modeB.startRadius = startRadius;
    },

    /**
     * Return starting radius variance of the particles. Only available in 'Radius' mode.
     * @return {Number}
     */
    getStartRadiusVar:function () {
        if(this.emitterMode !== cc.ParticleSystem.MODE_RADIUS)
            cc.log("cc.ParticleBatchNode.getStartRadiusVar() : Particle Mode should be Radius");
        return this.modeB.startRadiusVar;
    },

    /**
     * starting radius variance of the particles setter. Only available in 'Radius' mode.
     * @param {Number} startRadiusVar
     */
    setStartRadiusVar:function (startRadiusVar) {
        if(this.emitterMode !== cc.ParticleSystem.MODE_RADIUS)
            cc.log("cc.ParticleBatchNode.setStartRadiusVar() : Particle Mode should be Radius");
        this.modeB.startRadiusVar = startRadiusVar;
    },

    /**
     * Return ending radius of the particles. Only available in 'Radius' mode.
     * @return {Number}
     */
    getEndRadius:function () {
        if(this.emitterMode !== cc.ParticleSystem.MODE_RADIUS)
            cc.log("cc.ParticleBatchNode.getEndRadius() : Particle Mode should be Radius");
        return this.modeB.endRadius;
    },

    /**
     * ending radius of the particles setter. Only available in 'Radius' mode.
     * @param {Number} endRadius
     */
    setEndRadius:function (endRadius) {
        if(this.emitterMode !== cc.ParticleSystem.MODE_RADIUS)
            cc.log("cc.ParticleBatchNode.setEndRadius() : Particle Mode should be Radius");
        this.modeB.endRadius = endRadius;
    },

    /**
     * Return ending radius variance of the particles. Only available in 'Radius' mode.
     * @return {Number}
     */
    getEndRadiusVar:function () {
        if(this.emitterMode !== cc.ParticleSystem.MODE_RADIUS)
            cc.log("cc.ParticleBatchNode.getEndRadiusVar() : Particle Mode should be Radius");
        return this.modeB.endRadiusVar;
    },

    /**
     * ending radius variance of the particles setter. Only available in 'Radius' mode.
     * @param endRadiusVar
     */
    setEndRadiusVar:function (endRadiusVar) {
        if(this.emitterMode !== cc.ParticleSystem.MODE_RADIUS)
            cc.log("cc.ParticleBatchNode.setEndRadiusVar() : Particle Mode should be Radius");
        this.modeB.endRadiusVar = endRadiusVar;
    },

    /**
     * get Number of degress to rotate a particle around the source pos per second. Only available in 'Radius' mode.
     * @return {Number}
     */
    getRotatePerSecond:function () {
        if(this.emitterMode !== cc.ParticleSystem.MODE_RADIUS)
            cc.log("cc.ParticleBatchNode.getRotatePerSecond() : Particle Mode should be Radius");
        return this.modeB.rotatePerSecond;
    },

    /**
     * set Number of degress to rotate a particle around the source pos per second. Only available in 'Radius' mode.
     * @param {Number} degrees
     */
    setRotatePerSecond:function (degrees) {
        if(this.emitterMode !== cc.ParticleSystem.MODE_RADIUS)
            cc.log("cc.ParticleBatchNode.setRotatePerSecond() : Particle Mode should be Radius");
        this.modeB.rotatePerSecond = degrees;
    },

    /**
     * Return Variance in degrees for rotatePerSecond. Only available in 'Radius' mode.
     * @return {Number}
     */
    getRotatePerSecondVar:function () {
        if(this.emitterMode !== cc.ParticleSystem.MODE_RADIUS)
            cc.log("cc.ParticleBatchNode.getRotatePerSecondVar() : Particle Mode should be Radius");
        return this.modeB.rotatePerSecondVar;
    },

    /**
     * Variance in degrees for rotatePerSecond setter. Only available in 'Radius' mode.
     * @param degrees
     */
    setRotatePerSecondVar:function (degrees) {
        if(this.emitterMode !== cc.ParticleSystem.MODE_RADIUS)
            cc.log("cc.ParticleBatchNode.setRotatePerSecondVar() : Particle Mode should be Radius");
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
        return this.startSize;
    },

    /**
     * set start size in pixels of each particle
     * @param {Number} startSize
     */
    setStartSize:function (startSize) {
        this.startSize = startSize;
    },

    /**
     * get size variance in pixels of each particle
     * @return {Number}
     */
    getStartSizeVar:function () {
        return this.startSizeVar;
    },

    /**
     * set size variance in pixels of each particle
     * @param {Number} startSizeVar
     */
    setStartSizeVar:function (startSizeVar) {
        this.startSizeVar = startSizeVar;
    },

    /**
     * get end size in pixels of each particle
     * @return {Number}
     */
    getEndSize:function () {
        return this.endSize;
    },

    /**
     * set end size in pixels of each particle
     * @param endSize
     */
    setEndSize:function (endSize) {
        this.endSize = endSize;
    },

    /**
     * get end size variance in pixels of each particle
     * @return {Number}
     */
    getEndSizeVar:function () {
        return this.endSizeVar;
    },

    /**
     * set end size variance in pixels of each particle
     * @param {Number} endSizeVar
     */
    setEndSizeVar:function (endSizeVar) {
        this.endSizeVar = endSizeVar;
    },

    /**
     * set start color of each particle
     * @return {cc.Color}
     */
    getStartColor:function () {
        return cc.color(this._startColor.r, this._startColor.g, this._startColor.b, this._startColor.a);
    },

    /**
     * get start color of each particle
     * @param {cc.Color} startColor
     */
    setStartColor:function (startColor) {
        this._startColor = cc.color(startColor);
    },

    /**
     * get start color variance of each particle
     * @return {cc.Color}
     */
    getStartColorVar:function () {
        return cc.color(this._startColorVar.r, this._startColorVar.g, this._startColorVar.b, this._startColorVar.a);
    },

    /**
     * set start color variance of each particle
     * @param {cc.Color} startColorVar
     */
    setStartColorVar:function (startColorVar) {
        this._startColorVar = cc.color(startColorVar);
    },

    /**
     * get end color and end color variation of each particle
     * @return {cc.Color}
     */
    getEndColor:function () {
        return cc.color(this._endColor.r, this._endColor.g, this._endColor.b, this._endColor.a);
    },

    /**
     * set end color and end color variation of each particle
     * @param {cc.Color} endColor
     */
    setEndColor:function (endColor) {
        this._endColor = cc.color(endColor);
    },

    /**
     * get end color variance of each particle
     * @return {cc.Color}
     */
    getEndColorVar:function () {
        return cc.color(this._endColorVar.r, this._endColorVar.g, this._endColorVar.b, this._endColorVar.a);
    },

    /**
     * set end color variance of each particle
     * @param {cc.Color} endColorVar
     */
    setEndColorVar:function (endColorVar) {
        this._endColorVar = cc.color(endColorVar);
    },

    /**
     * get initial angle of each particle
     * @return {Number}
     */
    getStartSpin:function () {
        return this.startSpin;
    },

    /**
     * set initial angle of each particle
     * @param {Number} startSpin
     */
    setStartSpin:function (startSpin) {
        this.startSpin = startSpin;
    },

    /**
     * get initial angle variance of each particle
     * @return {Number}
     */
    getStartSpinVar:function () {
        return this.startSpinVar;
    },

    /**
     * set initial angle variance of each particle
     * @param {Number} startSpinVar
     */
    setStartSpinVar:function (startSpinVar) {
        this.startSpinVar = startSpinVar;
    },

    /**
     * get end angle of each particle
     * @return {Number}
     */
    getEndSpin:function () {
        return this.endSpin;
    },

    /**
     * set end angle of each particle
     * @param {Number} endSpin
     */
    setEndSpin:function (endSpin) {
        this.endSpin = endSpin;
    },

    /**
     * get end angle variance of each particle
     * @return {Number}
     */
    getEndSpinVar:function () {
        return this.endSpinVar;
    },

    /**
     * set end angle variance of each particle
     * @param {Number} endSpinVar
     */
    setEndSpinVar:function (endSpinVar) {
        this.endSpinVar = endSpinVar;
    },

    /**
     * get emission rate of the particles
     * @return {Number}
     */
    getEmissionRate:function () {
        return this.emissionRate;
    },

    /**
     * set emission rate of the particles
     * @param {Number} emissionRate
     */
    setEmissionRate:function (emissionRate) {
        this.emissionRate = emissionRate;
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
     * @param {Number} tp totalParticles
     */
    setTotalParticles:function (tp) {
        //cc.assert(tp <= this._allocatedParticles, "Particle: resizing particle array only supported for quads");
        if (cc._renderType === cc._RENDER_TYPE_CANVAS){
            this._totalParticles = (tp < 200) ? tp : 200;
            return;
        }

        // If we are setting the total numer of particles to a number higher
        // than what is allocated, we need to allocate new arrays
        if (tp > this._allocatedParticles) {
            var quadSize = cc.V3F_C4B_T2F_Quad.BYTES_PER_ELEMENT;
            // Allocate new memory
            this._indices = new Uint16Array(tp * 6);
            var locQuadsArrayBuffer = new ArrayBuffer(tp * quadSize);
            //TODO need fix
            // Assign pointers
            var locParticles = this._particles;
            locParticles.length = 0;
            var locQuads = this._quads;
            locQuads.length = 0;
            for (var j = 0; j < tp; j++) {
                locParticles[j] = new cc.Particle();
                locQuads[j] = new cc.V3F_C4B_T2F_Quad(null, null, null, null, locQuadsArrayBuffer, j * quadSize);
            }
            this._allocatedParticles = tp;
            this._totalParticles = tp;

            // Init particles
            if (this._batchNode) {
                for (var i = 0; i < tp; i++)
                    locParticles[i].atlasIndex = i;
            }

            this._quadsArrayBuffer = locQuadsArrayBuffer;

            this.initIndices();
            //if (cc.TEXTURE_ATLAS_USE_VAO)
            //    this._setupVBOandVAO();
            //else
            this._setupVBO();

            //set the texture coord
            if(this._texture){
                this.initTexCoordsWithRect(cc.rect(0, 0, this._texture.width, this._texture.height));
            }
        } else
            this._totalParticles = tp;
        this.resetSystem();
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
     * @param {cc.Texture2D } texture
     */
    setTexture:function (texture) {
        if(texture.isLoaded()){
            this.setTextureWithRect(texture, cc.rect(0, 0, texture.width, texture.height));
        } else {
            this._textureLoaded = false;
            texture.addEventListener("load", function(sender){
                this._textureLoaded = true;
                this.setTextureWithRect(sender, cc.rect(0, 0, sender.width, sender.height));
            }, this);
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
        if (dst === undefined) {
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
    isOpacityModifyRGB:function () {
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
        return (( this._blendFunc.src == cc.SRC_ALPHA && this._blendFunc.dst == cc.ONE) || (this._blendFunc.src == cc.ONE && this._blendFunc.dst == cc.ONE));
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
            locBlendFunc.src = cc.SRC_ALPHA;
            locBlendFunc.dst = cc.ONE;
        } else {
            if (cc._renderType === cc._RENDER_TYPE_WEBGL) {
                if (this._texture && !this._texture.hasPremultipliedAlpha()) {
                    locBlendFunc.src = cc.SRC_ALPHA;
                    locBlendFunc.dst = cc.ONE_MINUS_SRC_ALPHA;
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
        return this.positionType;
    },

    /**
     * set particles movement type: Free or Grouped
     * @param {Number} positionType
     */
    setPositionType:function (positionType) {
        this.positionType = positionType;
    },

    /**
     *  <p> return whether or not the node will be auto-removed when it has no particles left.<br/>
     *      By default it is false.<br/>
     *  </p>
     * @return {Boolean}
     */
    isAutoRemoveOnFinish:function () {
        return this.autoRemoveOnFinish;
    },

    /**
     *  <p> set whether or not the node will be auto-removed when it has no particles left.<br/>
     *      By default it is false.<br/>
     *  </p>
     * @param {Boolean} isAutoRemoveOnFinish
     */
    setAutoRemoveOnFinish:function (isAutoRemoveOnFinish) {
        this.autoRemoveOnFinish = isAutoRemoveOnFinish;
    },

    /**
     * return kind of emitter modes
     * @return {Number}
     */
    getEmitterMode:function () {
        return this.emitterMode;
    },

    /**
     * <p>Switch between different kind of emitter modes:<br/>
     *  - CCParticleSystem.MODE_GRAVITY: uses gravity, speed, radial and tangential acceleration<br/>
     *  - CCParticleSystem.MODE_RADIUS: uses radius movement + rotation <br/>
     *  </p>
     * @param {Number} emitterMode
     */
    setEmitterMode:function (emitterMode) {
        this.emitterMode = emitterMode;
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
        var dict = cc.loader.getRes(plistFile);
        if(!dict){
            cc.log("cc.ParticleSystem.initWithFile(): Particles: file not found");
            return false;
        }

        // XXX compute path from a path, should define a function somewhere to do it
        return this.initWithDictionary(dict, "");
    },

    /**
     * return bounding box of particle system in world space
     * @return {cc.Rect}
     */
    getBoundingBoxToWorld:function () {
        return cc.rect(0, 0, cc._canvas.width, cc._canvas.height);
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
            this.angle = parseFloat(locValueForKey("angle", dictionary));
            this.angleVar = parseFloat(locValueForKey("angleVariance", dictionary));

            // duration
            this.duration = parseFloat(locValueForKey("duration", dictionary));

            // blend function
            this._blendFunc.src = parseInt(locValueForKey("blendFuncSource", dictionary));
            this._blendFunc.dst = parseInt(locValueForKey("blendFuncDestination", dictionary));

            // color
            var locStartColor = this._startColor;
            locStartColor.r = parseFloat(locValueForKey("startColorRed", dictionary)) * 255;
            locStartColor.g = parseFloat(locValueForKey("startColorGreen", dictionary)) * 255;
            locStartColor.b = parseFloat(locValueForKey("startColorBlue", dictionary)) * 255;
            locStartColor.a = parseFloat(locValueForKey("startColorAlpha", dictionary)) * 255;

            var locStartColorVar = this._startColorVar;
            locStartColorVar.r = parseFloat(locValueForKey("startColorVarianceRed", dictionary)) * 255;
            locStartColorVar.g = parseFloat(locValueForKey("startColorVarianceGreen", dictionary)) * 255;
            locStartColorVar.b = parseFloat(locValueForKey("startColorVarianceBlue", dictionary)) * 255;
            locStartColorVar.a = parseFloat(locValueForKey("startColorVarianceAlpha", dictionary)) * 255;

            var locEndColor = this._endColor;
            locEndColor.r = parseFloat(locValueForKey("finishColorRed", dictionary)) * 255;
            locEndColor.g = parseFloat(locValueForKey("finishColorGreen", dictionary)) * 255;
            locEndColor.b = parseFloat(locValueForKey("finishColorBlue", dictionary)) * 255;
            locEndColor.a = parseFloat(locValueForKey("finishColorAlpha", dictionary)) * 255;

            var locEndColorVar = this._endColorVar;
            locEndColorVar.r = parseFloat(locValueForKey("finishColorVarianceRed", dictionary)) * 255;
            locEndColorVar.g = parseFloat(locValueForKey("finishColorVarianceGreen", dictionary)) * 255;
            locEndColorVar.b = parseFloat(locValueForKey("finishColorVarianceBlue", dictionary)) * 255;
            locEndColorVar.a = parseFloat(locValueForKey("finishColorVarianceAlpha", dictionary)) * 255;

            // particle size
            this.startSize = parseFloat(locValueForKey("startParticleSize", dictionary));
            this.startSizeVar = parseFloat(locValueForKey("startParticleSizeVariance", dictionary));
            this.endSize = parseFloat(locValueForKey("finishParticleSize", dictionary));
            this.endSizeVar = parseFloat(locValueForKey("finishParticleSizeVariance", dictionary));

            // position
            this.setPosition(parseFloat(locValueForKey("sourcePositionx", dictionary)),
                              parseFloat(locValueForKey("sourcePositiony", dictionary)));
            this._posVar.x = parseFloat(locValueForKey("sourcePositionVariancex", dictionary));
            this._posVar.y = parseFloat(locValueForKey("sourcePositionVariancey", dictionary));

            // Spinning
            this.startSpin = parseFloat(locValueForKey("rotationStart", dictionary));
            this.startSpinVar = parseFloat(locValueForKey("rotationStartVariance", dictionary));
            this.endSpin = parseFloat(locValueForKey("rotationEnd", dictionary));
            this.endSpinVar = parseFloat(locValueForKey("rotationEndVariance", dictionary));

            this.emitterMode = parseInt(locValueForKey("emitterType", dictionary));

            // Mode A: Gravity + tangential accel + radial accel
            if (this.emitterMode == cc.ParticleSystem.MODE_GRAVITY) {
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
            } else if (this.emitterMode == cc.ParticleSystem.MODE_RADIUS) {
                // or Mode B: radius movement
                var locModeB = this.modeB;
                locModeB.startRadius = parseFloat(locValueForKey("maxRadius", dictionary));
                locModeB.startRadiusVar = parseFloat(locValueForKey("maxRadiusVariance", dictionary));
                locModeB.endRadius = parseFloat(locValueForKey("minRadius", dictionary));
                locModeB.endRadiusVar = 0;
                locModeB.rotatePerSecond = parseFloat(locValueForKey("rotatePerSecond", dictionary));
                locModeB.rotatePerSecondVar = parseFloat(locValueForKey("rotatePerSecondVariance", dictionary));
            } else {
                cc.log("cc.ParticleSystem.initWithDictionary(): Invalid emitterType in config file");
                return false;
            }

            // life span
            this.life = parseFloat(locValueForKey("particleLifespan", dictionary));
            this.lifeVar = parseFloat(locValueForKey("particleLifespanVariance", dictionary));

            // emission Rate
            this.emissionRate = this._totalParticles / this.life;

            //don't get the internal texture if a batchNode is used
            if (!this._batchNode) {
                // Set a compatible default for the alpha transfer
                this._opacityModifyRGB = false;

                // texture
                // Try to get the texture from the cache
                var textureName = locValueForKey("textureFileName", dictionary);
                var imgPath = cc.path.changeBasename(this._plistFile, textureName);
                var tex = cc.textureCache.getTextureForKey(imgPath);

                if (tex) {
                    this.setTexture(tex);
                } else {
                    var textureData = locValueForKey("textureImageData", dictionary);

                    if (!textureData || textureData.length === 0) {
                        tex = cc.textureCache.addImage(imgPath);
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

                        var canvasObj = cc.newElement("canvas");
                        if(imageFormat === cc.FMT_PNG){
                            var myPngObj = new cc.PNGReader(buffer);
                            myPngObj.render(canvasObj);
                        } else {
                            var myTIFFObj = cc.tiffReader;
                            myTIFFObj.parseTIFF(buffer,canvasObj);
                        }

                        cc.textureCache.cacheImage(imgPath, canvasObj);

                        var addTexture = cc.textureCache.getTextureForKey(imgPath);
                        if(!addTexture)
                            cc.log("cc.ParticleSystem.initWithDictionary() : error loading the texture");
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

        var i, locParticles = this._particles;
        locParticles.length = 0;
        for(i = 0; i< numberOfParticles; i++){
            locParticles[i] = new cc.Particle();
        }

        if (!locParticles) {
            cc.log("Particle system: not enough memory");
            return false;
        }
        this._allocatedParticles = numberOfParticles;

        if (this._batchNode)
            for (i = 0; i < this._totalParticles; i++)
                locParticles[i].atlasIndex = i;

        // default, active
        this._isActive = true;

        // default blend function
        this._blendFunc.src = cc.BLEND_SRC;
        this._blendFunc.dst = cc.BLEND_DST;

        // default movement type;
        this.positionType = cc.ParticleSystem.TYPE_FREE;

        // by default be in mode A:
        this.emitterMode = cc.ParticleSystem.MODE_GRAVITY;

        // default: modulate
        // XXX: not used
        //  colorModulate = YES;
        this.autoRemoveOnFinish = false;

        //for batchNode
        this._transformSystemDirty = false;

        // udpate after action in run!
        this.scheduleUpdateWithPriority(1);

        if(cc._renderType === cc._RENDER_TYPE_WEBGL){
            // allocating data space
            if (!this._allocMemory())
                return false;

            this.initIndices();
            //if (cc.TEXTURE_ATLAS_USE_VAO)
            //    this._setupVBOandVAO();
            //else
            this._setupVBO();

            this.shaderProgram = cc.shaderCache.programForKey(cc.SHADER_POSITION_TEXTURECOLOR);
        }

        return true;
    },

    /**
     * Unschedules the "update" method.
     * @function
     * @see scheduleUpdate();
     */
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
        if (cc._renderType === cc._RENDER_TYPE_CANVAS) {
            if (this.particleCount < particles.length) {
                particle = particles[this.particleCount];
            } else {
                particle = new cc.Particle();
                particles.push(particle);
            }
        } else {
            particle = particles[this.particleCount];
        }
        this.initParticle(particle);
        ++this.particleCount;
        return true;
    },

    /**
     * Initializes a particle
     * @param {cc.Particle} particle
     */
    initParticle:function (particle) {
        var locRandomMinus11 = cc.randomMinus1To1;
        // timeToLive
        // no negative life. prevent division by 0
        particle.timeToLive = this.life + this.lifeVar * locRandomMinus11();
        particle.timeToLive = Math.max(0, particle.timeToLive);

        // position
        particle.pos.x = this._sourcePosition.x + this._posVar.x * locRandomMinus11();
        particle.pos.y = this._sourcePosition.y + this._posVar.y * locRandomMinus11();

        // Color
        var start, end;
        var locStartColor = this._startColor, locStartColorVar = this._startColorVar;
        var locEndColor = this._endColor, locEndColorVar = this._endColorVar;
        if (cc._renderType === cc._RENDER_TYPE_CANVAS) {
            start = cc.color(
                cc.clampf(locStartColor.r + locStartColorVar.r * locRandomMinus11(), 0, 255),
                cc.clampf(locStartColor.g + locStartColorVar.g * locRandomMinus11(), 0, 255),
                cc.clampf(locStartColor.b + locStartColorVar.b * locRandomMinus11(), 0, 255),
                cc.clampf(locStartColor.a + locStartColorVar.a * locRandomMinus11(), 0, 255)
            );
            end = cc.color(
                cc.clampf(locEndColor.r + locEndColorVar.r * locRandomMinus11(), 0, 255),
                cc.clampf(locEndColor.g + locEndColorVar.g * locRandomMinus11(), 0, 255),
                cc.clampf(locEndColor.b + locEndColorVar.b * locRandomMinus11(), 0, 255),
                cc.clampf(locEndColor.a + locEndColorVar.a * locRandomMinus11(), 0, 255)
            );
        } else {
            start = {
                r: cc.clampf(locStartColor.r + locStartColorVar.r * locRandomMinus11(), 0, 255),
                g: cc.clampf(locStartColor.g + locStartColorVar.g * locRandomMinus11(), 0, 255),
                b: cc.clampf(locStartColor.b + locStartColorVar.b * locRandomMinus11(), 0, 255),
                a: cc.clampf(locStartColor.a + locStartColorVar.a * locRandomMinus11(), 0, 255)
            };
            end = {
                r: cc.clampf(locEndColor.r + locEndColorVar.r * locRandomMinus11(), 0, 255),
                g: cc.clampf(locEndColor.g + locEndColorVar.g * locRandomMinus11(), 0, 255),
                b: cc.clampf(locEndColor.b + locEndColorVar.b * locRandomMinus11(), 0, 255),
                a: cc.clampf(locEndColor.a + locEndColorVar.a * locRandomMinus11(), 0, 255)
            };
        }

        particle.color = start;
        var locParticleDeltaColor = particle.deltaColor, locParticleTimeToLive = particle.timeToLive;
        locParticleDeltaColor.r = (end.r - start.r) / locParticleTimeToLive;
        locParticleDeltaColor.g = (end.g - start.g) / locParticleTimeToLive;
        locParticleDeltaColor.b = (end.b - start.b) / locParticleTimeToLive;
        locParticleDeltaColor.a = (end.a - start.a) / locParticleTimeToLive;

        // size
        var startS = this.startSize + this.startSizeVar * locRandomMinus11();
        startS = Math.max(0, startS); // No negative value

        particle.size = startS;
        if (this.endSize === cc.ParticleSystem.START_SIZE_EQUAL_TO_END_SIZE) {
            particle.deltaSize = 0;
        } else {
            var endS = this.endSize + this.endSizeVar * locRandomMinus11();
            endS = Math.max(0, endS); // No negative values
            particle.deltaSize = (endS - startS) / locParticleTimeToLive;
        }

        // rotation
        var startA = this.startSpin + this.startSpinVar * locRandomMinus11();
        var endA = this.endSpin + this.endSpinVar * locRandomMinus11();
        particle.rotation = startA;
        particle.deltaRotation = (endA - startA) / locParticleTimeToLive;

        // position
        if (this.positionType == cc.ParticleSystem.TYPE_FREE)
            particle.startPos = this.convertToWorldSpace(this._pointZeroForParticle);
        else if (this.positionType == cc.ParticleSystem.TYPE_RELATIVE){
            particle.startPos.x = this._position.x;
            particle.startPos.y = this._position.y;
        }

        // direction
        var a = cc.degreesToRadians(this.angle + this.angleVar * locRandomMinus11());

        // Mode Gravity: A
        if (this.emitterMode === cc.ParticleSystem.MODE_GRAVITY) {
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
                particle.rotation = -cc.radiansToDegrees(cc.pToAngle(locParticleModeA.dir));
        } else {
            // Mode Radius: B
            var locModeB = this.modeB, locParitlceModeB = particle.modeB;

            // Set the default diameter of the particle from the source position
            var startRadius = locModeB.startRadius + locModeB.startRadiusVar * locRandomMinus11();
            var endRadius = locModeB.endRadius + locModeB.endRadiusVar * locRandomMinus11();

            locParitlceModeB.radius = startRadius;
            locParitlceModeB.deltaRadius = (locModeB.endRadius === cc.ParticleSystem.START_RADIUS_EQUAL_TO_END_RADIUS) ? 0 : (endRadius - startRadius) / locParticleTimeToLive;

            locParitlceModeB.angle = a;
            locParitlceModeB.degreesPerSecond = cc.degreesToRadians(locModeB.rotatePerSecond + locModeB.rotatePerSecondVar * locRandomMinus11());
        }
    },

    /**
     * stop emitting particles. Running particles will continue to run until they die
     */
    stopSystem:function () {
        this._isActive = false;
        this._elapsed = this.duration;
        this._emitCounter = 0;
    },

    /**
     * Kill all living particles.
     */
    resetSystem:function () {
        this._isActive = true;
        this._elapsed = 0;
        var locParticles = this._particles;
        for (this._particleIdx = 0; this._particleIdx < this.particleCount; ++this._particleIdx)
            locParticles[this._particleIdx].timeToLive = 0 ;
    },

    /**
     * whether or not the system is full
     * @return {Boolean}
     */
    isFull:function () {
        return (this.particleCount >= this._totalParticles);
    },

    /**
     * should be overridden by subclasses
     * @param {cc.Particle} particle
     * @param {cc.Point} newPosition
     */
    updateQuadWithParticle:function (particle, newPosition) {
        var quad = null;
        if (this._batchNode) {
            var batchQuads = this._batchNode.textureAtlas.quads;
            quad = batchQuads[this.atlasIndex + particle.atlasIndex];
            this._batchNode.textureAtlas.dirty = true;
        } else
            quad = this._quads[this._particleIdx];

        var r, g, b, a;
        if (this._opacityModifyRGB) {
            r = 0 | (particle.color.r * particle.color.a/255);
            g = 0 | (particle.color.g * particle.color.a/255);
            b = 0 | (particle.color.b * particle.color.a/255);
        } else {
            r = 0 | (particle.color.r );
            g = 0 | (particle.color.g );
            b = 0 | (particle.color.b );
        }
        a = 0 | (particle.color.a );

        var locColors = quad.bl.colors;
        locColors.r = r;
        locColors.g = g;
        locColors.b = b;
        locColors.a = a;

        locColors = quad.br.colors;
        locColors.r = r;
        locColors.g = g;
        locColors.b = b;
        locColors.a = a;

        locColors = quad.tl.colors;
        locColors.r = r;
        locColors.g = g;
        locColors.b = b;
        locColors.a = a;

        locColors = quad.tr.colors;
        locColors.r = r;
        locColors.g = g;
        locColors.b = b;
        locColors.a = a;

        // vertices
        var size_2 = particle.size / 2;
        if (particle.rotation) {
            var x1 = -size_2;
            var y1 = -size_2;

            var x2 = size_2;
            var y2 = size_2;
            var x = newPosition.x;
            var y = newPosition.y;

            var rad = -cc.degreesToRadians(particle.rotation);
            var cr = Math.cos(rad);
            var sr = Math.sin(rad);
            var ax = x1 * cr - y1 * sr + x;
            var ay = x1 * sr + y1 * cr + y;
            var bx = x2 * cr - y1 * sr + x;
            var by = x2 * sr + y1 * cr + y;
            var cx = x2 * cr - y2 * sr + x;
            var cy = x2 * sr + y2 * cr + y;
            var dx = x1 * cr - y2 * sr + x;
            var dy = x1 * sr + y2 * cr + y;

            // bottom-left
            quad.bl.vertices.x = ax;
            quad.bl.vertices.y = ay;

            // bottom-right vertex:
            quad.br.vertices.x = bx;
            quad.br.vertices.y = by;

            // top-left vertex:
            quad.tl.vertices.x = dx;
            quad.tl.vertices.y = dy;

            // top-right vertex:
            quad.tr.vertices.x = cx;
            quad.tr.vertices.y = cy;
        } else {
            // bottom-left vertex:
            quad.bl.vertices.x = newPosition.x - size_2;
            quad.bl.vertices.y = newPosition.y - size_2;

            // bottom-right vertex:
            quad.br.vertices.x = newPosition.x + size_2;
            quad.br.vertices.y = newPosition.y - size_2;

            // top-left vertex:
            quad.tl.vertices.x = newPosition.x - size_2;
            quad.tl.vertices.y = newPosition.y + size_2;

            // top-right vertex:
            quad.tr.vertices.x = newPosition.x + size_2;
            quad.tr.vertices.y = newPosition.y + size_2;
        }
    },

    /**
     * should be overridden by subclasses
     */
    postStep:function () {
        if (cc._renderType === cc._RENDER_TYPE_WEBGL) {
            var gl = cc._renderContext;

            gl.bindBuffer(gl.ARRAY_BUFFER, this._buffersVBO[0]);
            gl.bufferData(gl.ARRAY_BUFFER, this._quadsArrayBuffer, gl.DYNAMIC_DRAW);

            // Option 2: Data
            //	glBufferData(GL_ARRAY_BUFFER, sizeof(quads_[0]) * particleCount, quads_, GL_DYNAMIC_DRAW);

            // Option 3: Orphaning + glMapBuffer
            // glBufferData(GL_ARRAY_BUFFER, sizeof(m_pQuads[0])*m_uTotalParticles, NULL, GL_STREAM_DRAW);
            // void *buf = glMapBuffer(GL_ARRAY_BUFFER, GL_WRITE_ONLY);
            // memcpy(buf, m_pQuads, sizeof(m_pQuads[0])*m_uTotalParticles);
            // glUnmapBuffer(GL_ARRAY_BUFFER);

            //cc.checkGLErrorDebug();
        }
    },

    /**
     * update emitter's status
     * @override
     * @param {Number} dt delta time
     */
    update:function (dt) {
        if (this._isActive && this.emissionRate) {
            var rate = 1.0 / this.emissionRate;
            //issue #1201, prevent bursts of particles, due to too high emitCounter
            if (this.particleCount < this._totalParticles)
                this._emitCounter += dt;

            while ((this.particleCount < this._totalParticles) && (this._emitCounter > rate)) {
                this.addParticle();
                this._emitCounter -= rate;
            }

            this._elapsed += dt;
            if (this.duration != -1 && this.duration < this._elapsed)
                this.stopSystem();
        }
        this._particleIdx = 0;

        var currentPosition = cc.Particle.TemporaryPoints[0];
        if (this.positionType == cc.ParticleSystem.TYPE_FREE) {
            cc.pIn(currentPosition, this.convertToWorldSpace(this._pointZeroForParticle));
        } else if (this.positionType == cc.ParticleSystem.TYPE_RELATIVE) {
            currentPosition.x = this._position.x;
            currentPosition.y = this._position.y;
        }

        if (this._visible) {

            // Used to reduce memory allocation / creation within the loop
            var tpa = cc.Particle.TemporaryPoints[1],
                tpb = cc.Particle.TemporaryPoints[2],
                tpc = cc.Particle.TemporaryPoints[3];

            var locParticles = this._particles;
            while (this._particleIdx < this.particleCount) {

                // Reset the working particles
                cc.pZeroIn(tpa);
                cc.pZeroIn(tpb);
                cc.pZeroIn(tpc);

                var selParticle = locParticles[this._particleIdx];

                // life
                selParticle.timeToLive -= dt;

                if (selParticle.timeToLive > 0) {
                    // Mode A: gravity, direction, tangential accel & radial accel
                    if (this.emitterMode == cc.ParticleSystem.MODE_GRAVITY) {

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
                    if (!this._dontTint || cc._renderType === cc._RENDER_TYPE_WEBGL) {
                        selParticle.color.r += selParticle.deltaColor.r * dt;
                        selParticle.color.g += selParticle.deltaColor.g * dt;
                        selParticle.color.b += selParticle.deltaColor.b * dt;
                        selParticle.color.a += selParticle.deltaColor.a * dt;
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
                    if (this.positionType == cc.ParticleSystem.TYPE_FREE || this.positionType == cc.ParticleSystem.TYPE_RELATIVE) {

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

                    if (cc._renderType == cc._RENDER_TYPE_WEBGL) {
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
                    if(this._particleIdx !== this.particleCount -1){
                         var deadParticle = locParticles[this._particleIdx];
                        locParticles[this._particleIdx] = locParticles[this.particleCount -1];
                        locParticles[this.particleCount -1] = deadParticle;
                    }
                    if (this._batchNode) {
                        //disable the switched particle
                        this._batchNode.disableParticle(this.atlasIndex + currentIndex);

                        //switch indexes
                        locParticles[this.particleCount - 1].atlasIndex = currentIndex;
                    }

                    --this.particleCount;
                    if (this.particleCount == 0 && this.autoRemoveOnFinish) {
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
    },

    /**
     * update emitter's status (dt = 0)
     */
    updateWithNoTime:function () {
        this.update(0);
    },

    //
    // return the string found by key in dict.
    // @param {string} key
    // @param {object} dict
    // @return {String} "" if not found; return the string if found.
    // @private
    //
    _valueForKey:function (key, dict) {
        if (dict) {
            var pString = dict[key];
            return pString != null ? pString : "";
        }
        return "";
    },

    _updateBlendFunc:function () {
        if(this._batchNode){
            cc.log("Can't change blending functions when the particle is being batched");
            return;
        }

        var locTexture = this._texture;
        if (locTexture && locTexture instanceof cc.Texture2D) {
            this._opacityModifyRGB = false;
            var locBlendFunc = this._blendFunc;
            if (locBlendFunc.src == cc.BLEND_SRC && locBlendFunc.dst == cc.BLEND_DST) {
                if (locTexture.hasPremultipliedAlpha()) {
                    this._opacityModifyRGB = true;
                } else {
                    locBlendFunc.src = cc.SRC_ALPHA;
                    locBlendFunc.dst = cc.ONE_MINUS_SRC_ALPHA;
                }
            }
        }
    },

    /**
     * to copy object with deep copy.
     * returns a clone of action.
     *
     * @return {cc.ParticleSystem}
     */
    clone:function () {
        var retParticle = new cc.ParticleSystem();

        // self, not super
        if (retParticle.initWithTotalParticles(this.getTotalParticles())) {
            // angle
            retParticle.setAngle(this.getAngle());
            retParticle.setAngleVar(this.getAngleVar());

            // duration
            retParticle.setDuration(this.getDuration());

            // blend function
            var blend = this.getBlendFunc();
            retParticle.setBlendFunc(blend.src,blend.dst);

            // color
            retParticle.setStartColor(this.getStartColor());

            retParticle.setStartColorVar(this.getStartColorVar());

            retParticle.setEndColor(this.getEndColor());

            retParticle.setEndColorVar(this.getEndColorVar());

            // this size
            retParticle.setStartSize(this.getStartSize());
            retParticle.setStartSizeVar(this.getStartSizeVar());
            retParticle.setEndSize(this.getEndSize());
            retParticle.setEndSizeVar(this.getEndSizeVar());

            // position
            retParticle.setPosition(cc.p(this.x, this.y));
            retParticle.setPosVar(cc.p(this.getPosVar().x,this.getPosVar().y));

            // Spinning
            retParticle.setStartSpin(this.getStartSpin()||0);
            retParticle.setStartSpinVar(this.getStartSpinVar()||0);
            retParticle.setEndSpin(this.getEndSpin()||0);
            retParticle.setEndSpinVar(this.getEndSpinVar()||0);

            retParticle.setEmitterMode(this.getEmitterMode());

            // Mode A: Gravity + tangential accel + radial accel
            if (this.getEmitterMode() == cc.ParticleSystem.MODE_GRAVITY) {
                // gravity
                var gra = this.getGravity();
                retParticle.setGravity(cc.p(gra.x,gra.y));

                // speed
                retParticle.setSpeed(this.getSpeed());
                retParticle.setSpeedVar(this.getSpeedVar());

                // radial acceleration
                retParticle.setRadialAccel(this.getRadialAccel());
                retParticle.setRadialAccelVar(this.getRadialAccelVar());

                // tangential acceleration
                retParticle.setTangentialAccel(this.getTangentialAccel());
                retParticle.setTangentialAccelVar(this.getTangentialAccelVar());

            } else if (this.getEmitterMode() == cc.ParticleSystem.MODE_RADIUS) {
                // or Mode B: radius movement
                retParticle.setStartRadius(this.getStartRadius());
                retParticle.setStartRadiusVar(this.getStartRadiusVar());
                retParticle.setEndRadius(this.getEndRadius());
                retParticle.setEndRadiusVar(this.getEndRadiusVar());

                retParticle.setRotatePerSecond(this.getRotatePerSecond());
                retParticle.setRotatePerSecondVar(this.getRotatePerSecondVar());
            }

            // life span
            retParticle.setLife(this.getLife());
            retParticle.setLifeVar(this.getLifeVar());

            // emission Rate
            retParticle.setEmissionRate(this.getEmissionRate());

            //don't get the internal texture if a batchNode is used
            if (!this.getBatchNode()) {
                // Set a compatible default for the alpha transfer
                retParticle.setOpacityModifyRGB(this.isOpacityModifyRGB());
                // texture
                var texture = this.getTexture();
                if(texture){
                    var size = texture.getContentSize();
                    retParticle.setTextureWithRect(texture, cc.rect(0, 0, size.width, size.height));
                }
            }
        }
        return retParticle;
    },

    /**
     * <p> Sets a new CCSpriteFrame as particle.</br>
     * WARNING: this method is experimental. Use setTextureWithRect instead.
     * </p>
     * @param {cc.SpriteFrame} spriteFrame
     */
    setDisplayFrame:function (spriteFrame) {
        var locOffset = spriteFrame.getOffsetInPixels();
        if(locOffset.x != 0 || locOffset.y != 0)
            cc.log("cc.ParticleSystem.setDisplayFrame(): QuadParticle only supports SpriteFrames with no offsets");

        // update texture before updating texture rect
        if (cc._renderType === cc._RENDER_TYPE_WEBGL)
            if (!this._texture || spriteFrame.getTexture()._webTextureObj != this._texture._webTextureObj)
                this.setTexture(spriteFrame.getTexture());
    },

    /**
     *  Sets a new texture with a rect. The rect is in Points.
     * @param {cc.Texture2D} texture
     * @param {cc.Rect} rect
     */
    setTextureWithRect:function (texture, rect) {
        var locTexture = this._texture;
        if (cc._renderType === cc._RENDER_TYPE_WEBGL) {
            // Only update the texture if is different from the current one
            if ((!locTexture || texture._webTextureObj != locTexture._webTextureObj) && (locTexture != texture)) {
                this._texture = texture;
                this._updateBlendFunc();
            }
        } else {
            if ((!locTexture || texture != locTexture) && (locTexture != texture)) {
                this._texture = texture;
                this._updateBlendFunc();
            }
        }

        this._pointRect = rect;
        this.initTexCoordsWithRect(rect);
    },

    /**
     * draw particle
     * @param {CanvasRenderingContext2D} ctx CanvasContext
     * @override
     */
    draw:function (ctx) {
        if(!this._textureLoaded || this._batchNode)     // draw should not be called when added to a particleBatchNode
            return;

        if (cc._renderType === cc._RENDER_TYPE_CANVAS)
            this._drawForCanvas(ctx);
        else
            this._drawForWebGL(ctx);

        cc.g_NumberOfDraws++;
    },

    _drawForCanvas:function (ctx) {
        var context = ctx || cc._renderContext;
        context.save();
        if (this.isBlendAdditive())
            context.globalCompositeOperation = 'lighter';
        else
            context.globalCompositeOperation = 'source-over';

        var element = this._texture.getHtmlElementObj();
        var locScaleX = cc.view.getScaleX(), locScaleY = cc.view.getScaleY();

        for (var i = 0; i < this.particleCount; i++) {
            var particle = this._particles[i];
            var lpx = (0 | (particle.size * 0.5));

            if (this.drawMode == cc.ParticleSystem.TEXTURE_MODE) {
                // Delay drawing until the texture is fully loaded by the browser
                if (!element.width || !element.height)
                    continue;

                context.save();
                context.globalAlpha = particle.color.a / 255;
                context.translate((0 | particle.drawPos.x), -(0 | particle.drawPos.y));

                var size = Math.floor(particle.size / 4) * 4;
                var w = this._pointRect.width;
                var h = this._pointRect.height;

                context.scale(
                    Math.max(size * locScaleX / w, 0.000001),
                    Math.max(size * locScaleY / h, 0.000001)
                );

                if (particle.rotation)
                    context.rotate(cc.degreesToRadians(particle.rotation));
                context.translate(-(0 | (w / 2)), -(0 | (h / 2)));
                var drawElement = particle.isChangeColor ? this._changeTextureColor(element, particle.color, this._pointRect) : element;
                if(drawElement)
                    context.drawImage(drawElement, 0, 0);
                context.restore();
            } else {
                context.save();
                context.globalAlpha = particle.color.a / 255;

                context.translate(0 | particle.drawPos.x, -(0 | particle.drawPos.y));

                if (this.shapeType == cc.ParticleSystem.STAR_SHAPE) {
                    if (particle.rotation)
                        context.rotate(cc.degreesToRadians(particle.rotation));
                    cc._drawingUtil.drawStar(context, lpx, particle.color);
                } else
                    cc._drawingUtil.drawColorBall(context, lpx, particle.color);
                context.restore();
            }
        }
        context.restore();
    },

    _changeTextureColor: function(element, color, rect){
        if (!element.tintCache) {
            element.tintCache = document.createElement('canvas');
            element.tintCache.width = element.width;
            element.tintCache.height = element.height;
        }
        return cc.generateTintImageWithMultiply(element, color, rect, element.tintCache);
    },

    _drawForWebGL:function (ctx) {
        if(!this._texture)
            return;

        var gl = ctx || cc._renderContext;

        this._shaderProgram.use();
        this._shaderProgram.setUniformForModelViewAndProjectionMatrixWithMat4();

        cc.glBindTexture2D(this._texture);
        cc.glBlendFuncForParticle(this._blendFunc.src, this._blendFunc.dst);

        //cc.assert(this._particleIdx == this.particleCount, "Abnormal error in particle quad");

        //
        // Using VBO without VAO
        //
        cc.glEnableVertexAttribs(cc.VERTEX_ATTRIB_FLAG_POS_COLOR_TEX);

        gl.bindBuffer(gl.ARRAY_BUFFER, this._buffersVBO[0]);
        gl.vertexAttribPointer(cc.VERTEX_ATTRIB_POSITION, 3, gl.FLOAT, false, 24, 0);               // vertices
        gl.vertexAttribPointer(cc.VERTEX_ATTRIB_COLOR, 4, gl.UNSIGNED_BYTE, true, 24, 12);          // colors
        gl.vertexAttribPointer(cc.VERTEX_ATTRIB_TEX_COORDS, 2, gl.FLOAT, false, 24, 16);            // tex coords

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._buffersVBO[1]);
        gl.drawElements(gl.TRIANGLES, this._particleIdx * 6, gl.UNSIGNED_SHORT, 0);
    },

    /**
     * listen the event that coming to foreground on Android
     * @param {cc.Class} obj
     */
    listenBackToForeground:function (obj) {
        if (cc.TEXTURE_ATLAS_USE_VAO)
            this._setupVBOandVAO();
        else
            this._setupVBO();
    },

    _setupVBOandVAO:function () {
        //Not support on WebGL
        /*if (cc._renderType == cc._RENDER_TYPE_CANVAS) {
         return;
         }*/

        //NOT SUPPORTED
        /*glGenVertexArrays(1, this._VAOname);
         glBindVertexArray(this._VAOname);

         var kQuadSize = sizeof(m_pQuads[0].bl);

         glGenBuffers(2, this._buffersVBO[0]);

         glBindBuffer(GL_ARRAY_BUFFER, this._buffersVBO[0]);
         glBufferData(GL_ARRAY_BUFFER, sizeof(this._quads[0]) * this._totalParticles, this._quads, GL_DYNAMIC_DRAW);

         // vertices
         glEnableVertexAttribArray(kCCVertexAttrib_Position);
         glVertexAttribPointer(kCCVertexAttrib_Position, 2, GL_FLOAT, GL_FALSE, kQuadSize, offsetof(ccV3F_C4B_T2F, vertices));

         // colors
         glEnableVertexAttribArray(kCCVertexAttrib_Color);
         glVertexAttribPointer(kCCVertexAttrib_Color, 4, GL_UNSIGNED_BYTE, GL_TRUE, kQuadSize, offsetof(ccV3F_C4B_T2F, colors));

         // tex coords
         glEnableVertexAttribArray(kCCVertexAttrib_TexCoords);
         glVertexAttribPointer(kCCVertexAttrib_TexCoords, 2, GL_FLOAT, GL_FALSE, kQuadSize, offsetof(ccV3F_C4B_T2F, texCoords));

         glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, this._buffersVBO[1]);
         glBufferData(GL_ELEMENT_ARRAY_BUFFER, sizeof(m_pIndices[0]) * m_uTotalParticles * 6, m_pIndices, GL_STATIC_DRAW);

         glBindVertexArray(0);
         glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, 0);
         glBindBuffer(GL_ARRAY_BUFFER, 0);

         CHECK_GL_ERROR_DEBUG();*/
    },

    _setupVBO:function () {
        if (cc._renderType == cc._RENDER_TYPE_CANVAS)
            return;

        var gl = cc._renderContext;

        //gl.deleteBuffer(this._buffersVBO[0]);
        this._buffersVBO[0] = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this._buffersVBO[0]);
        gl.bufferData(gl.ARRAY_BUFFER, this._quadsArrayBuffer, gl.DYNAMIC_DRAW);

        this._buffersVBO[1] = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._buffersVBO[1]);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this._indices, gl.STATIC_DRAW);

        //cc.checkGLErrorDebug();
    },

    _allocMemory:function () {
        if (cc._renderType === cc._RENDER_TYPE_CANVAS)
            return true;

        //cc.assert((!this._quads && !this._indices), "Memory already allocated");
        if(this._batchNode){
            cc.log("cc.ParticleSystem._allocMemory(): Memory should not be allocated when not using batchNode");
            return false;
        }

        var quadSize = cc.V3F_C4B_T2F_Quad.BYTES_PER_ELEMENT;
        var totalParticles = this._totalParticles;
        var locQuads = this._quads;
        locQuads.length = 0;
        this._indices = new Uint16Array(totalParticles * 6);
        var locQuadsArrayBuffer = new ArrayBuffer(quadSize * totalParticles);

        for (var i = 0; i < totalParticles; i++)
            locQuads[i] = new cc.V3F_C4B_T2F_Quad(null, null, null, null, locQuadsArrayBuffer, i * quadSize);
        if (!locQuads || !this._indices) {
            cc.log("cocos2d: Particle system: not enough memory");
            return false;
        }
        this._quadsArrayBuffer = locQuadsArrayBuffer;
        return true;
    }
});

var _p = cc.ParticleSystem.prototype;

if(cc._renderType === cc._RENDER_TYPE_CANVAS && !cc.sys._supportCanvasNewBlendModes)
    _p._changeTextureColor = function (element, color, rect) {
        var cacheTextureForColor = cc.textureCache.getTextureColors(element);
        if (cacheTextureForColor) {
            // Create another cache for the tinted version
            // This speeds up things by a fair bit
            if (!cacheTextureForColor.tintCache) {
                cacheTextureForColor.tintCache = document.createElement('canvas');
                cacheTextureForColor.tintCache.width = element.width;
                cacheTextureForColor.tintCache.height = element.height;
            }
            cc.generateTintImage(element, cacheTextureForColor, color, rect, cacheTextureForColor.tintCache);
            return cacheTextureForColor.tintCache;
        }
        return null
    };

// Extended properties
/** @expose */
_p.opacityModifyRGB;
cc.defineGetterSetter(_p, "opacityModifyRGB", _p.isOpacityModifyRGB, _p.setOpacityModifyRGB);
/** @expose */
_p.batchNode;
cc.defineGetterSetter(_p, "batchNode", _p.getBatchNode, _p.setBatchNode);
/** @expose */
_p.active;
cc.defineGetterSetter(_p, "active", _p.isActive);
/** @expose */
_p.sourcePos;
cc.defineGetterSetter(_p, "sourcePos", _p.getSourcePosition, _p.setSourcePosition);
/** @expose */
_p.posVar;
cc.defineGetterSetter(_p, "posVar", _p.getPosVar, _p.setPosVar);
/** @expose */
_p.gravity;
cc.defineGetterSetter(_p, "gravity", _p.getGravity, _p.setGravity);
/** @expose */
_p.speed;
cc.defineGetterSetter(_p, "speed", _p.getSpeed, _p.setSpeed);
/** @expose */
_p.speedVar;
cc.defineGetterSetter(_p, "speedVar", _p.getSpeedVar, _p.setSpeedVar);
/** @expose */
_p.tangentialAccel;
cc.defineGetterSetter(_p, "tangentialAccel", _p.getTangentialAccel, _p.setTangentialAccel);
/** @expose */
_p.tangentialAccelVar;
cc.defineGetterSetter(_p, "tangentialAccelVar", _p.getTangentialAccelVar, _p.setTangentialAccelVar);
/** @expose */
_p.radialAccel;
cc.defineGetterSetter(_p, "radialAccel", _p.getRadialAccel, _p.setRadialAccel);
/** @expose */
_p.radialAccelVar;
cc.defineGetterSetter(_p, "radialAccelVar", _p.getRadialAccelVar, _p.setRadialAccelVar);
/** @expose */
_p.rotationIsDir;
cc.defineGetterSetter(_p, "rotationIsDir", _p.getRotationIsDir, _p.setRotationIsDir);
/** @expose */
_p.startRadius;
cc.defineGetterSetter(_p, "startRadius", _p.getStartRadius, _p.setStartRadius);
/** @expose */
_p.startRadiusVar;
cc.defineGetterSetter(_p, "startRadiusVar", _p.getStartRadiusVar, _p.setStartRadiusVar);
/** @expose */
_p.endRadius;
cc.defineGetterSetter(_p, "endRadius", _p.getEndRadius, _p.setEndRadius);
/** @expose */
_p.endRadiusVar;
cc.defineGetterSetter(_p, "endRadiusVar", _p.getEndRadiusVar, _p.setEndRadiusVar);
/** @expose */
_p.rotatePerS;
cc.defineGetterSetter(_p, "rotatePerS", _p.getRotatePerSecond, _p.setRotatePerSecond);
/** @expose */
_p.rotatePerSVar;
cc.defineGetterSetter(_p, "rotatePerSVar", _p.getRotatePerSecondVar, _p.setRotatePerSecondVar);
/** @expose */
_p.startColor;
cc.defineGetterSetter(_p, "startColor", _p.getStartColor, _p.setStartColor);
/** @expose */
_p.startColorVar;
cc.defineGetterSetter(_p, "startColorVar", _p.getStartColorVar, _p.setStartColorVar);
/** @expose */
_p.endColor;
cc.defineGetterSetter(_p, "endColor", _p.getEndColor, _p.setEndColor);
/** @expose */
_p.endColorVar;
cc.defineGetterSetter(_p, "endColorVar", _p.getEndColorVar, _p.setEndColorVar);
/** @expose */
_p.totalParticles;
cc.defineGetterSetter(_p, "totalParticles", _p.getTotalParticles, _p.setTotalParticles);
/** @expose */
_p.texture;
cc.defineGetterSetter(_p, "texture", _p.getTexture, _p.setTexture);


/**
 * <p> return the string found by key in dict. <br/>
 *    This plist files can be create manually or with Particle Designer:<br/>
 *    http://particledesigner.71squared.com/<br/>
 * </p>
 * @deprecated since v3.0 please use new cc.ParticleSysytem(plistFile) instead.
 * @param {String|Number} plistFile
 * @return {cc.ParticleSystem}
 */
cc.ParticleSystem.create = function (plistFile) {
    return new cc.ParticleSystem(plistFile);
};

/**
 * <p> return the string found by key in dict. <br/>
 *    This plist files can be create manually or with Particle Designer:<br/>
 *    http://particledesigner.71squared.com/<br/>
 * </p>
 * @deprecated since v3.0 please use new cc.ParticleSysytem(plistFile) instead.
 * @function
 * @param {String|Number} plistFile
 * @return {cc.ParticleSystem}
 */
cc.ParticleSystem.createWithTotalParticles = cc.ParticleSystem.create;

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
    this.gravity = gravity ? gravity : cc.p(0,0);
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

/**
 * Shape Mode of Particle Draw
 * @constant
 * @type Number
 */
cc.ParticleSystem.SHAPE_MODE = 0;

/**
 * Texture Mode of Particle Draw
 * @constant
 * @type Number
 */
cc.ParticleSystem.TEXTURE_MODE = 1;

/**
 * Star Shape for ShapeMode of Particle
 * @constant
 * @type Number
 */
cc.ParticleSystem.STAR_SHAPE = 0;

/**
 * Ball Shape for ShapeMode of Particle
 * @constant
 * @type Number
 */
cc.ParticleSystem.BALL_SHAPE = 1;

/**
 * The Particle emitter lives forever
 * @constant
 * @type Number
 */
cc.ParticleSystem.DURATION_INFINITY = -1;

/**
 * The starting size of the particle is equal to the ending size
 * @constant
 * @type Number
 */
cc.ParticleSystem.START_SIZE_EQUAL_TO_END_SIZE = -1;

/**
 * The starting radius of the particle is equal to the ending radius
 * @constant
 * @type Number
 */
cc.ParticleSystem.START_RADIUS_EQUAL_TO_END_RADIUS = -1;

/**
 * Gravity mode (A mode)
 * @constant
 * @type Number
 */
cc.ParticleSystem.MODE_GRAVITY = 0;

/**
 * Radius mode (B mode)
 * @constant
 * @type Number
 */
cc.ParticleSystem.MODE_RADIUS = 1;

/**
 * Living particles are attached to the world and are unaffected by emitter repositioning.
 * @constant
 * @type Number
 */
cc.ParticleSystem.TYPE_FREE = 0;

/**
 * Living particles are attached to the world but will follow the emitter repositioning.<br/>
 * Use case: Attach an emitter to an sprite, and you want that the emitter follows the sprite.
 * @constant
 * @type Number
 */
cc.ParticleSystem.TYPE_RELATIVE = 1;

/**
 * Living particles are attached to the emitter and are translated along with it.
 * @constant
 * @type Number
 */
cc.ParticleSystem.TYPE_GROUPED = 2;
