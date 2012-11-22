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
 * <p>
 *     CCParticleSystemQuad is a subclass of CCParticleSystem<br/>
 *     <br/>
 *     It includes all the features of ParticleSystem.<br/>
 *     <br/>
 *     Special features and Limitations:<br/>
 *      - Particle size can be any float number. <br/>
 *      - The system can be scaled <br/>
 *      - The particles can be rotated     <br/>
 *      - It supports subrects   <br/>
 *      - It supports batched rendering since 1.1<br/>
 * </p>
 * @class
 * @extends cc.ParticleSystem
 * @example
 * //create a particle system
 *   this._emitter = new cc.ParticleSystemQuad();
 *   this._emitter.initWithTotalParticles(150);
 */
cc.ParticleSystemQuad = cc.ParticleSystem.extend(/** @lends cc.ParticleSystemQuad# */{
    // quads to be rendered
    _quads:null,
    // indices
    _indices:null,

    _VAOname:0,
    //0: vertex  1: indices
    _buffersVBO:[],

    _pointRect:null,
    /**
     * Constructor
     * @override
     */
    ctor:function () {
        this._super();
        this._buffersVBO = [0, 0];
        this._quads = [];
        this._indices = [];
        this._pointRect = cc.RectZero();
    },

    /**
     * initialices the indices for the vertices
     */
    setupIndices:function () {
        for (var i = 0; i < this._totalParticles; ++i) {
            var i6 = i * 6;
            var i4 = i * 4;
            this._indices[i6 + 0] = i4 + 0;
            this._indices[i6 + 1] = i4 + 1;
            this._indices[i6 + 2] = i4 + 2;

            this._indices[i6 + 5] = i4 + 1;
            this._indices[i6 + 4] = i4 + 2;
            this._indices[i6 + 3] = i4 + 3;
        }
    },

    /**
     * <p> initilizes the texture with a rectangle measured Points<br/>
     * pointRect should be in Texture coordinates, not pixel coordinates
     * </p>
     * @param {cc.Rect} pointRect
     */
    initTexCoordsWithRect:function (pointRect) {
        // convert to pixels coords
        var rect = cc.rect(
            pointRect.origin.x * cc.CONTENT_SCALE_FACTOR(),
            pointRect.origin.y * cc.CONTENT_SCALE_FACTOR(),
            pointRect.size.width * cc.CONTENT_SCALE_FACTOR(),
            pointRect.size.height * cc.CONTENT_SCALE_FACTOR());

        var wide = pointRect.size.width;
        var high = pointRect.size.height;

        if (this._texture) {
            if ((this._texture instanceof HTMLImageElement) || (this._texture instanceof HTMLCanvasElement)) {
                wide = this._texture.width;
                high = this._texture.height;
            } else {
                wide = this._texture.getPixelsWide();
                high = this._texture.getPixelsHigh();
            }
        }

        var left, bottom, right, top;
        if (cc.FIX_ARTIFACTS_BY_STRECHING_TEXEL) {
            left = (rect.origin.x * 2 + 1) / (wide * 2);
            bottom = (rect.origin.y * 2 + 1) / (high * 2);
            right = left + (rect.size.width * 2 - 2) / (wide * 2);
            top = bottom + (rect.size.height * 2 - 2) / (high * 2);
        } else {
            left = rect.origin.x / wide;
            bottom = rect.origin.y / high;
            right = left + rect.size.width / wide;
            top = bottom + rect.size.height / high;
        }

        // Important. Texture in cocos2d are inverted, so the Y component should be inverted
        var temp = top;
        top = bottom;
        bottom = temp;

        var quads = null;
        var start = 0, end = 0;
        if (this._batchNode) {
            quads = this._batchNode.getTextureAtlas().getQuads();
            start = this._atlasIndex;
            end = this._atlasIndex + this._totalParticles;
        } else {
            quads = this._quads;
            start = 0;
            end = this._totalParticles;
        }

        for (var i = start; i < this.end; i++) {
            if (!quads[i]) {
                quads[i] = cc.V3F_C4B_T2F_QuadZero();
            }

            // bottom-left vertex:
            quads[i].bl.texCoords.u = left;
            quads[i].bl.texCoords.v = bottom;
            // bottom-right vertex:
            quads[i].br.texCoords.u = right;
            quads[i].br.texCoords.v = bottom;
            // top-left vertex:
            quads[i].tl.texCoords.u = left;
            quads[i].tl.texCoords.v = top;
            // top-right vertex:
            quads[i].tr.texCoords.u = right;
            quads[i].tr.texCoords.v = top;
        }
    },

    clone:function () {
        var retParticle = new cc.ParticleSystemQuad();

        // self, not super
        if (retParticle.initWithTotalParticles(this._totalParticles)) {
            // angle
            retParticle._angle = this._angle;
            retParticle._angleVar = this._angleVar;

            // duration
            retParticle._duration = this._duration;

            // blend function
            retParticle._blendFunc.src = this._blendFunc.src;
            retParticle._blendFunc.dst = this._blendFunc.dst;

            // color
            retParticle._startColor.r = this._startColor.r;
            retParticle._startColor.g = this._startColor.g;
            retParticle._startColor.b = this._startColor.b;
            retParticle._startColor.a = this._startColor.a;

            retParticle._startColorVar.r = this._startColorVar.r;
            retParticle._startColorVar.g = this._startColorVar.g;
            retParticle._startColorVar.b = this._startColorVar.b;
            retParticle._startColorVar.a = this._startColorVar.a;

            retParticle._endColor.r = this._endColor.r;
            retParticle._endColor.g = this._endColor.g;
            retParticle._endColor.b = this._endColor.b;
            retParticle._endColor.a = this._endColor.a;

            retParticle._endColorVar.r = this._endColorVar.r;
            retParticle._endColorVar.g = this._endColorVar.g;
            retParticle._endColorVar.b = this._endColorVar.b;
            retParticle._endColorVar.a = this._endColorVar.a;

            // particle size
            retParticle._startSize = this._startSize;
            retParticle._startSizeVar = this._startSizeVar;
            retParticle._endSize = this._endSize;
            retParticle._endSizeVar = this._endSizeVar;

            // position
            retParticle.setPosition(new cc.Point(this._position.x, this._position.y));
            retParticle._posVar.x = this._posVar.x;
            retParticle._posVar.y = this._posVar.y;

            // Spinning
            retParticle._startSpin = this._startSpin;
            retParticle._startSpinVar = this._startSpinVar;
            retParticle._endSpin = this._endSpin;
            retParticle._endSpinVar = this._endSpinVar;

            retParticle._emitterMode = this._emitterMode;

            // Mode A: Gravity + tangential accel + radial accel
            if (this._emitterMode == cc.PARTICLE_MODE_GRAVITY) {
                // gravity
                retParticle.modeA.gravity.x = this.modeA.gravity.x;
                retParticle.modeA.gravity.y = this.modeA.gravity.y;

                // speed
                retParticle.modeA.speed = this.modeA.speed;
                retParticle.modeA.speedVar = this.modeA.speedVar;

                // radial acceleration
                retParticle.modeA.radialAccel = this.modeA.radialAccel;

                retParticle.modeA.radialAccelVar = this.modeA.radialAccelVar;

                // tangential acceleration
                retParticle.modeA.tangentialAccel = this.modeA.tangentialAccel;

                retParticle.modeA.tangentialAccelVar = this.modeA.tangentialAccelVar;
            } else if (this._emitterMode == cc.PARTICLE_MODE_RADIUS) {
                // or Mode B: radius movement
                retParticle.modeB.startRadius = this.modeB.startRadius;
                retParticle.modeB.startRadiusVar = this.modeB.startRadiusVar;
                retParticle.modeB.endRadius = this.modeB.endRadius;
                retParticle.modeB.endRadiusVar = this.modeB.endRadiusVar;
                retParticle.modeB.rotatePerSecond = this.modeB.rotatePerSecond;
                retParticle.modeB.rotatePerSecondVar = this.modeB.rotatePerSecondVar;
            }

            // life span
            retParticle._life = this._life;
            retParticle._lifeVar = this._lifeVar;

            // emission Rate
            retParticle._emissionRate = this._emissionRate;

            //don't get the internal texture if a batchNode is used
            if (!this._batchNode) {
                // Set a compatible default for the alpha transfer
                retParticle._opacityModifyRGB = this._opacityModifyRGB;

                // texture
                if (this._texture instanceof cc.Texture2D) {
                    retParticle._texture = this._texture;
                } else {
                    retParticle._texture = this._texture;
                }
            }
        }
        return retParticle;
    },

    /**
     * <p> Sets a new CCSpriteFrame as particle.</br>
     * WARNING: this method is experimental. Use setTexture:withRect instead.
     * </p>
     * @param {cc.SpriteFrame} spriteFrame
     */
    setDisplayFrame:function (spriteFrame) {
        cc.Assert(cc.Point.CCPointEqualToPoint(spriteFrame.getOffsetInPixels(), cc.PointZero()), "QuadParticle only supports SpriteFrames with no offsets");

        // update texture before updating texture rect
        if (!this._texture || spriteFrame.getTexture().getName() != this._texture.getName()) {
            this.setTexture(spriteFrame.getTexture());
        }
    },

    /**
     *  Sets a new texture with a rect. The rect is in Points.
     * @param {cc.Texture2D} texture
     * @param {cc.Rect} rect
     */
    setTextureWithRect:function (texture, rect) {
        if (texture instanceof  cc.Texture2D) {
            // Only update the texture if is different from the current one
            if (!this._texture || texture.getName() != this._texture.getName()) {
                this.setTexture(texture, true);
            }
            this._pointRect = rect;
            this.initTexCoordsWithRect(rect);
        }
        if (texture  instanceof HTMLImageElement) {
            if (!this._texture || texture != this._texture) {
                this.setTexture(texture, true);
            }
            this._pointRect = rect;
            this.initTexCoordsWithRect(rect);
        }
    },

    // super methods
    // overriding the init method
    /**
     * Initializes a system with a fixed number of particles
     * @override
     * @param {Number} numberOfParticles
     * @return {Boolean}
     */
    initWithTotalParticles:function (numberOfParticles) {
        // base initialization
        if (this._super(numberOfParticles)) {
            // allocating data space
            if (!this._allocMemory()) {
                return false;
            }
            this.setupIndices();
            if (cc.TEXTURE_ATLAS_USE_VAO) {
                this._setupVBOandVAO();
            } else {
                this._setupVBO();
            }

            //this.setShaderProgram(cc.ShaderCache.getInstance().programForKey(kCCShader_PositionTextureColor));

            // Need to listen the event only when not use batchnode, because it will use VBO
            //extension.CCNotificationCenter.sharedNotificationCenter().addObserver(this,
            //    callfuncO_selector(cc.ParticleSystemQuad.listenBackToForeground),
            //    EVNET_COME_TO_FOREGROUND,
            //    null);

            return true;
        }
        return false;
    },

    /**
     * set Texture of Particle System
     * @override
     * @param {HTMLImageElement|HTMLCanvasElement|cc.Texture2D} texture
     * @param {Boolean} isCallSuper is direct call super method
     */
    setTexture:function (texture, isCallSuper) {
        if (isCallSuper) {
            if (isCallSuper == true) {
                this._super(texture);
                return;
            }
        }
        var size = null;
        if ((texture instanceof HTMLImageElement) || (texture instanceof HTMLCanvasElement)) {
            size = cc.size(texture.width, texture.height);
        } else {
            size = texture.getContentSize();
        }

        this.setTextureWithRect(texture, cc.rect(0, 0, size.width, size.height));
    },

    /**
     * update particle's quad
     * @override
     * @param {cc.Particle} particle
     * @param {cc.Point} newPosition
     */
    updateQuadWithParticle:function (particle, newPosition) {
        // colors
        var quad = null;
        if (this._batchNode) {
            var batchQuads = this._batchNode.getTextureAtlas().getQuads();
            quad = batchQuads[this._atlasIndex + particle.atlasIndex]
        } else {
            quad = this._quads[this._particleIdx];
        }

        var color = (this._opacityModifyRGB) ?
            new cc.Color4B(0 | (particle.color.r * particle.color.a * 255), 0 | (particle.color.g * particle.color.a * 255),
                0 | (particle.color.b * particle.color.a * 255), 0 | (particle.color.a * 255)) :
            new cc.Color4B(0 | (particle.color.r * 255), 0 | (particle.color.g * 255), 0 | (particle.color.b * 255), 0 | (particle.color.a * 255));

        quad.bl.colors = color;
        quad.br.colors = color;
        quad.tl.colors = color;
        quad.tr.colors = color;

        // vertices
        var size_2 = particle.size / 2;
        if (particle.rotation) {
            var x1 = -size_2;
            var y1 = -size_2;

            var x2 = size_2;
            var y2 = size_2;
            var x = newPosition.x;
            var y = newPosition.y;

            var r = -cc.DEGREES_TO_RADIANS(particle.rotation);
            var cr = Math.cos(r);
            var sr = Math.sin(r);
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
     * override cc.ParticleSystem
     * @override
     */
    postStep:function () {
        if (cc.renderContextType == cc.CANVAS) {

        } else {
            //TODO
            glBindBuffer(GL_ARRAY_BUFFER, this._buffersVBO[0]);
            glBufferSubData(GL_ARRAY_BUFFER, 0, sizeof(this._quads[0]) * particleCount, this._quads);
            glBindBuffer(GL_ARRAY_BUFFER, 0);

            CHECK_GL_ERROR_DEBUG();
        }
    },

    /**
     * draw particle
     * @param {CanvasContext} ctx CanvasContext
     * @override
     */
    draw:function (ctx) {
        cc.Assert(!this._batchNode, "draw should not be called when added to a particleBatchNode");
        //this._super();
        var context = ctx || cc.renderContext;
        context.save();
        if (this.isBlendAdditive())
            context.globalCompositeOperation = 'lighter';
        else
            context.globalCompositeOperation = 'source-over';

        for (var i = 0; i < this._particleCount; i++) {
            var particle = this._particles[i];
            var lpx = (0 | (particle.size * 0.5));

            //TODO these are temporary code, need modifier
            if (this._drawMode == cc.PARTICLE_TEXTURE_MODE) {
                var drawTexture = this.getTexture();
                if (particle.isChangeColor) {
                    var cacheTextureForColor = cc.TextureCache.getInstance().getTextureColors(this.getTexture());
                    if (cacheTextureForColor)
                        drawTexture = cc.generateTintImage(this.getTexture(), cacheTextureForColor, particle.color, this._pointRect);
                }
                context.save();
                context.globalAlpha = particle.color.a;
                context.translate(0 | particle.drawPos.x, -(0 | particle.drawPos.y));
                if (particle.rotation)
                    context.rotate(cc.DEGREES_TO_RADIANS(particle.rotation));
                context.drawImage(drawTexture, -lpx, -lpx,
                    particle.size, particle.size);
                context.restore();
            } else {
                context.save();
                context.globalAlpha = particle.color.a;
                context.translate(0 | particle.drawPos.x, -(0 | particle.drawPos.y));

                if (this._shapeType == cc.PARTICLE_STAR_SHAPE) {
                    if (particle.rotation)
                        context.rotate(cc.DEGREES_TO_RADIANS(particle.rotation));
                    cc.drawingUtil.drawStar(context, lpx, particle.color);
                } else
                    cc.drawingUtil.drawColorBall(context, lpx, particle.color);
                context.restore();
            }
        }
        context.restore();

        cc.INCREMENT_GL_DRAWS(1);
    },

    _drawForWebGL:function (ctx) {
        cc.NODE_DRAW_SETUP();

        ccGLBindTexture2D(this._texture.getName());
        ccGLBlendFunc(m_tBlendFunc.src, m_tBlendFunc.dst);

        cc.Assert(this._particleIdx == this._particleCount, "Abnormal error in particle quad");

        if (cc.TEXTURE_ATLAS_USE_VAO) {
            //
            // Using VBO and VAO
            //
            glBindVertexArray(this._VAOname);

            if (cc.REBIND_INDICES_BUFFER)
                glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, this._buffersVBO[1]);

            glDrawElements(GL_TRIANGLES, this._particleIdx * 6, GL_UNSIGNED_SHORT, 0);

            if (cc.REBIND_INDICES_BUFFER)
                glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, 0);

            glBindVertexArray(0);
        } else {
            //
            // Using VBO without VAO
            //
            var kQuadSize = sizeof(m_pQuads[0].bl);

            ccGLEnableVertexAttribs(kCCVertexAttribFlag_PosColorTex);

            glBindBuffer(GL_ARRAY_BUFFER, this._buffersVBO[0]);
            // vertices
            glVertexAttribPointer(kCCVertexAttrib_Position, 3, GL_FLOAT, GL_FALSE, kQuadSize, offsetof(ccV3F_C4B_T2F, vertices));
            // colors
            glVertexAttribPointer(kCCVertexAttrib_Color, 4, GL_UNSIGNED_BYTE, GL_TRUE, kQuadSize, offsetof(ccV3F_C4B_T2F, colors));
            // tex coords
            glVertexAttribPointer(kCCVertexAttrib_TexCoords, 2, GL_FLOAT, GL_FALSE, kQuadSize, offsetof(ccV3F_C4B_T2F, texCoords));

            glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, this._buffersVBO[1]);

            glDrawElements(GL_TRIANGLES, this._particleIdx * 6, GL_UNSIGNED_SHORT, 0);

            glBindBuffer(GL_ARRAY_BUFFER, 0);
            glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, 0);
        }
        CHECK_GL_ERROR_DEBUG();

        cc.INCREMENT_GL_DRAWS(1);
    },

    setBatchNode:function (batchNode) {
        if (this._batchNode != batchNode) {
            var oldBatch = this._batchNode;

            this._super(batchNode);

            // NEW: is self render ?
            if (!batchNode) {
                this._allocMemory();
                this.setupIndices();
                this.setTexture(oldBatch.getTexture());
                if (cc.TEXTURE_ATLAS_USE_VAO)
                    this._setupVBOandVAO();
                else
                    this._setupVBO();
            }
            // OLD: was it self render ? cleanup
            else if (!oldBatch) {
                // copy current state to batch
                var batchQuads = this._batchNode.getTextureAtlas().getQuads();
                var quad = batchQuads[this._atlasIndex];
                //memcpy( quad, m_pQuads, m_uTotalParticles * sizeof(m_pQuads[0]) );

                glDeleteBuffers(2, this._buffersVBO[0]);
                if (cc.TEXTURE_ATLAS_USE_VAO)
                    glDeleteVertexArrays(1, this._VAOname);
            }
        }
    },

    setTotalParticles:function (tp) {
        //TODO
        if(tp < 200)
            this._totalParticles = tp;
        else
            this._totalParticles = 200;

        return;

        // If we are setting the total numer of particles to a number higher
        // than what is allocated, we need to allocate new arrays
        if (tp > m_uAllocatedParticles) {
            // Allocate new memory
            var particlesSize = tp * sizeof(tCCParticle);
            var quadsSize = sizeof(this._quads[0]) * tp * 1;
            var indicesSize = sizeof(m_pIndices[0]) * tp * 6 * 1;

            //var particlesNew = (tCCParticle*)realloc(m_pParticles, particlesSize);
            //ccV3F_C4B_T2F_Quad* quadsNew = (ccV3F_C4B_T2F_Quad*)realloc(m_pQuads, quadsSize);
            //GLushort* indicesNew = (GLushort*)realloc(m_pIndices, indicesSize);

            if (particlesNew && quadsNew && indicesNew) {
                // Assign pointers
                m_pParticles = particlesNew;
                m_pQuads = quadsNew;
                m_pIndices = indicesNew;

                // Clear the memory
                memset(m_pParticles, 0, particlesSize);
                memset(m_pQuads, 0, quadsSize);
                memset(m_pIndices, 0, indicesSize);

                m_uAllocatedParticles = tp;
            } else {
                // Out of memory, failed to resize some array
                if (particlesNew) m_pParticles = particlesNew;
                if (quadsNew) m_pQuads = quadsNew;
                if (indicesNew) m_pIndices = indicesNew;

                cc.log("Particle system: out of memory");
                return;
            }

            m_uTotalParticles = tp;

            // Init particles
            if (this._batchNode) {
                for (var i = 0; i < m_uTotalParticles; i++) {
                    this._particles[i].atlasIndex = i;
                }
            }

            this.setupIndices();
            if (cc.TEXTURE_ATLAS_USE_VAO)
                this._setupVBOandVAO();
            else
                this._setupVBO();

        }
        else {
            m_uTotalParticles = tp;
        }
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
        if (cc.renderContextType == cc.CANVAS) {
            return;
        }

        glGenVertexArrays(1, this._VAOname);
        glBindVertexArray(this._VAOname);

        var kQuadSize = sizeof(m_pQuads[0].bl)

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

        CHECK_GL_ERROR_DEBUG();
    },

    _setupVBO:function () {
        if (cc.renderContextType == cc.CANVAS) {
            return;
        }

        glGenBuffers(2, this._buffersVBO[0]);

        glBindBuffer(GL_ARRAY_BUFFER, this._buffersVBO[0]);
        glBufferData(GL_ARRAY_BUFFER, sizeof(m_pQuads[0]) * m_uTotalParticles, m_pQuads, GL_DYNAMIC_DRAW);
        glBindBuffer(GL_ARRAY_BUFFER, 0);

        glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, this._buffersVBO[1]);
        glBufferData(GL_ELEMENT_ARRAY_BUFFER, sizeof(m_pIndices[0]) * m_uTotalParticles * 6, m_pIndices, GL_STATIC_DRAW);
        glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, 0);

        CHECK_GL_ERROR_DEBUG();
    },

    _allocMemory:function () {
        //cc.Assert(( !this._quads && !this._indices), "Memory already alloced");
        cc.Assert(!this._batchNode, "Memory should not be alloced when not using batchNode");
        this._quads = [];
        this._indices = [];
        for (var i = 0; i < this._totalParticles; i++) {
            this._quads[i] = new cc.V3F_C4B_T2F_Quad();
            this._indices[i * 6] = 0;
            this._indices[(i * 6) + 1] = 0;
            this._indices[(i * 6) + 2] = 0;
            this._indices[(i * 6) + 3] = 0;
            this._indices[(i * 6) + 4] = 0;
            this._indices[(i * 6) + 5] = 0;
        }

        if (!this._quads || !this._indices) {
            cc.log("cocos2d: Particle system: not enough memory");
            return false;
        }

        return true;
    }
});

/**
 * <p>
 *   creates an initializes a CCParticleSystemQuad from a plist file.<br/>
 *   This plist files can be creted manually or with Particle Designer:<br/>
 *   http://particledesigner.71squared.com/<br/>
 * </p>
 * @param {String} pListFile
 * @return {cc.ParticleSystem}
 * @example
 *  //creates an initializes a CCParticleSystemQuad from a plist file.
 *  var system = cc.ParticleSystemQuad.create("Images/SpinningPeas.plist");
 */
cc.ParticleSystemQuad.create = function (pListFile) {
    var ret = new cc.ParticleSystemQuad();
    if (!pListFile || typeof(pListFile) === "number") {
        var ton = pListFile || 100;
        ret.setDrawMode(cc.PARTICLE_TEXTURE_MODE);
        ret.initWithTotalParticles(ton);
        return ret;
    }

    if (ret && ret.initWithFile(pListFile)) {
        return ret;
    }
    return null;
};

cc.ARCH_OPTIMAL_PARTICLE_SYSTEM = cc.ParticleSystemQuad;
