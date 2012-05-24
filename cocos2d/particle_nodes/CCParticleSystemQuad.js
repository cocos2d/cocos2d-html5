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

/** @brief CCParticleSystemQuad is a subclass of CCParticleSystem

 It includes all the features of ParticleSystem.

 Special features and Limitations:
 - Particle size can be any float number.
 - The system can be scaled
 - The particles can be rotated
 - On 1st and 2nd gen iPhones: It is only a bit slower that CCParticleSystemPoint
 - On 3rd gen iPhone and iPads: It is MUCH faster than CCParticleSystemPoint
 - It consumes more RAM and more GPU memory than CCParticleSystemPoint
 - It supports subrects
 @since v0.8
 */
cc.ParticleSystemQuad = cc.ParticleSystem.extend({
    // quads to be rendered
    _m_pQuads:null,
    // indices
    _m_pIndices:null,
    // VBO id
    _m_uQuadsID:0,

    ctor:function () {
        this._super();
    },

    /** initialices the indices for the vertices*/
    initIndices:function () {
        for (var i = 0; i < this._m_uTotalParticles; ++i) {
            var i6 = i * 6;
            var i4 = i * 4;
            this._m_pIndices[i6 + 0] = i4 + 0;
            this._m_pIndices[i6 + 1] = i4 + 1;
            this._m_pIndices[i6 + 2] = i4 + 2;

            this._m_pIndices[i6 + 5] = i4 + 1;
            this._m_pIndices[i6 + 4] = i4 + 2;
            this._m_pIndices[i6 + 3] = i4 + 3;
        }
    },

    /**
     * initilizes the texture with a rectangle measured Points
     * pointRect should be in Texture coordinates, not pixel coordinates
     * */
    initTexCoordsWithRect:function (pointRect) {
        // convert to pixels coords
        var rect = cc.RectMake(
            pointRect.origin.x * cc.CONTENT_SCALE_FACTOR(),
            pointRect.origin.y * cc.CONTENT_SCALE_FACTOR(),
            pointRect.size.width * cc.CONTENT_SCALE_FACTOR(),
            pointRect.size.height * cc.CONTENT_SCALE_FACTOR());

        var wide = pointRect.size.width;
        var high = pointRect.size.height;

        if (this._m_pTexture) {
            if ((this._m_pTexture instanceof HTMLImageElement) || (this._m_pTexture instanceof HTMLCanvasElement)) {
                wide = this._m_pTexture.width;
                high = this._m_pTexture.height;
            } else {
                wide = this._m_pTexture.getPixelsWide();
                high = this._m_pTexture.getPixelsHigh();
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

        this._m_pQuads = [];
        for (var i = 0; i < this._m_uTotalParticles; i++) {
            this._m_pQuads[i] = cc.V3F_C4B_T2F_QuadZero();
        }

        for (var i = 0; i < this._m_uTotalParticles; i++) {
            // bottom-left vertex:
            this._m_pQuads[i].bl.texCoords.u = left;
            this._m_pQuads[i].bl.texCoords.v = bottom;
            // bottom-right vertex:
            this._m_pQuads[i].br.texCoords.u = right;
            this._m_pQuads[i].br.texCoords.v = bottom;
            // top-left vertex:
            this._m_pQuads[i].tl.texCoords.u = left;
            this._m_pQuads[i].tl.texCoords.v = top;
            // top-right vertex:
            this._m_pQuads[i].tr.texCoords.u = right;
            this._m_pQuads[i].tr.texCoords.v = top;
        }
    },

    /** Sets a new CCSpriteFrame as particle.
     WARNING: this method is experimental. Use setTexture:withRect instead.
     @since v0.99.4
     */
    setDisplayFrame:function (spriteFrame) {
        cc.Assert(cc.Point.CCPointEqualToPoint(spriteFrame.getOffsetInPixels(), cc.PointZero()), "QuadParticle only supports SpriteFrames with no offsets");

        // update texture before updating texture rect
        if (!this._m_pTexture || spriteFrame.getTexture().getName() != this._m_pTexture.getName()) {
            this.setTexture(spriteFrame.getTexture());
        }
    },

    /** Sets a new texture with a rect. The rect is in Points.
     @since v0.99.4
     */
    setTextureWithRect:function (texture, rect) {
        // Only update the texture if is different from the current one
        if (!this._m_pTexture || texture.getName() != this._m_pTexture.getName()) {
            this.setTexture(texture, true);
        }

        this.initTexCoordsWithRect(rect);
    },

    // super methods
    // overriding the init method
    initWithTotalParticles:function (numberOfParticles) {
        // base initialization
        if (this._super(numberOfParticles)) {
            // allocating data space
            this._m_pQuads = [];
            for (var i = 0; i < this._m_uTotalParticles; i++) {
                this._m_pQuads[i] = cc.V3F_C4B_T2F_QuadZero();
            }
            this._m_pIndices = [];
            for (i = 0; i < this._m_uTotalParticles * 6; i++) {
                this._m_pIndices[i] = 0;
            }

            if (!this._m_pQuads || !this._m_pIndices) {
                cc.Log("cocos2d: Particle system: not enough memory");
                if (this._m_pQuads)
                    this._m_pQuads = null;
                if (this._m_pIndices)
                    this._m_pIndices = null;

                return null;
            }

            // initialize only once the texCoords and the indices
            if (this._m_pTexture) {
                this.initTexCoordsWithRect(cc.RectMake(0, 0, this._m_pTexture.getPixelsWide(), this._m_pTexture.getPixelsHigh()));
            } else {
                this.initTexCoordsWithRect(cc.RectMake(0, 0, 1, 1));
            }

            this.initIndices();

            if (cc.USES_VBO) {
                //TODO
                //glEnable(GL_VERTEX_ARRAY);

                // create the VBO buffer
                //glGenBuffers(1, m_uQuadsID);


                // initial binding
                //glBindBuffer(GL_ARRAY_BUFFER, m_uQuadsID);
                //glBufferData(GL_ARRAY_BUFFER, sizeof(m_pQuads[0])*m_uTotalParticles, m_pQuads, GL_DYNAMIC_DRAW);
                //glBindBuffer(GL_ARRAY_BUFFER, 0);
            }

            return true;
        }
        return false;
    },

    setTexture:function (texture, isCallSuper) {
        if (isCallSuper) {
            if (isCallSuper == true) {
                this._super(texture);
                return;
            }
        }
        var s = null;
        if ((texture instanceof HTMLImageElement) || (texture instanceof HTMLCanvasElement)) {
            s = cc.SizeMake(texture.width, texture.height);
        } else {
            s = texture.getContentSize();
        }

        this.setTextureWithRect(texture, cc.RectMake(0, 0, s.width, s.height));
    },

    updateQuadWithParticle:function (particle, newPosition) {
        // colors
        var quad = this._m_pQuads[this._m_uParticleIdx];

        var color = new cc.Color4B((particle.color.r * 255), (particle.color.g * 255), (particle.color.b * 255),
            (particle.color.a * 255));
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

    postStep:function () {
        if (cc.renderContextType == cc.kCanvas) {

        } else {
            if (cc.USES_VBO) {
                //TODO
                glBindBuffer(GL_ARRAY_BUFFER, m_uQuadsID);
                glBufferSubData(GL_ARRAY_BUFFER, 0, sizeof(m_pQuads[0]) * m_uParticleCount, m_pQuads);
                glBindBuffer(GL_ARRAY_BUFFER, 0);
            }
        }
    },

    draw:function (ctx) {
        this._super();
        if (cc.renderContextType == cc.kCanvas) {
            var context = ctx || cc.renderContext;
            context.save();
            if (this._m_bIsBlendAdditive) {
                context.globalCompositeOperation = 'lighter';
            } else {
                context.globalCompositeOperation = 'source-over';
            }

            for (var i = 0; i < this._m_uParticleCount; i++) {
                var particle = this._m_pParticles[i];
                var lpx = (0 | (particle.size * 0.5));

                //TODO these are temporary code, need modifier
                if (this._drawMode == cc.kParticleTextureMode) {
                    var drawTexture = this.getTexture();
                    if (particle.isChangeColor) {
                        var cacheTextureForColor = cc.TextureCache.sharedTextureCache().getTextureColors(this.getTexture());
                        if (cacheTextureForColor) {
                            drawTexture = cc.generateTintImage(this.getTexture(), cacheTextureForColor, particle.color);
                        }
                    }

                    context.save();
                    context.globalAlpha = particle.color.a;
                    context.translate(0 | particle.pos.x, -(0 | particle.pos.y));
                    context.drawImage(drawTexture,
                        lpx, -(lpx + particle.size),
                        particle.size, particle.size);
                    context.restore();
                } else {
                    context.save();
                    context.globalAlpha = particle.color.a;
                    context.translate(0 | particle.pos.x, -(0 | particle.pos.y));
                    if(this._shapeType == cc.kParticleStarShape){
                        cc.drawingUtil.drawStar(context, new cc.Point(0, 0), lpx, particle.color);
                    }else{
                        cc.drawingUtil.drawColorBall(context, new cc.Point(0, 0), lpx, particle.color);
                    }
                    context.restore()
                }
            }
            context.restore();
        } else {
            //TODO need fixed for webGL
            // Default GL states: GL_TEXTURE_2D, GL_VERTEX_ARRAY, GL_COLOR_ARRAY, GL_TEXTURE_COORD_ARRAY
            // Needed states: GL_TEXTURE_2D, GL_VERTEX_ARRAY, GL_COLOR_ARRAY, GL_TEXTURE_COORD_ARRAY
            // Unneeded states: -
            glBindTexture(GL_TEXTURE_2D, this._m_pTexture.getName());

            var kQuadSize = sizeof(this._m_pQuads[0].bl);

            if (cc.USES_VBO) {
                glBindBuffer(GL_ARRAY_BUFFER, this._m_uQuadsID);

                if (cc.ENABLE_CACHE_TEXTTURE_DATA) {
                    glBufferData(GL_ARRAY_BUFFER, sizeof(this._m_pQuads[0]) * this._m_uTotalParticles, this._m_pQuads, GL_DYNAMIC_DRAW);
                }

                glVertexPointer(2, GL_FLOAT, kQuadSize, 0);

                glColorPointer(4, GL_UNSIGNED_BYTE, kQuadSize, offsetof(ccV2F_C4B_T2F, colors));

                glTexCoordPointer(2, GL_FLOAT, kQuadSize, offsetof(ccV2F_C4B_T2F, texCoords));
            } else {
                var offset = this._m_pQuads;

                // vertex
                var diff = offsetof(cc.V2F_C4B_T2F, vertices);
                glVertexPointer(2, GL_FLOAT, kQuadSize, (offset + diff));

                // color
                diff = offsetof(cc.V2F_C4B_T2F, colors);
                glColorPointer(4, GL_UNSIGNED_BYTE, kQuadSize, (offset + diff));

                // tex coords
                diff = offsetof(cc.V2F_C4B_T2F, texCoords);
                glTexCoordPointer(2, GL_FLOAT, kQuadSize, (offset + diff));
            }


            var newBlend = (this._m_tBlendFunc.src != cc.BLEND_SRC || this._m_tBlendFunc.dst != cc.BLEND_DST) ? true : false;
            if (newBlend) {
                glBlendFunc(this._m_tBlendFunc.src, this._m_tBlendFunc.dst);
            }

            cc.Assert(this._m_uParticleIdx == this._m_uParticleCount, "Abnormal error in particle quad");

            glDrawElements(GL_TRIANGLES, (this._m_uParticleIdx * 6), GL_UNSIGNED_SHORT, this._m_pIndices);

            // restore blend state
            if (newBlend)
                glBlendFunc(cc.BLEND_SRC, cc.BLEND_DST);

            if (cc.USES_VBO)
                glBindBuffer(GL_ARRAY_BUFFER, 0);
        }
    }
});

/** creates an initializes a CCParticleSystemQuad from a plist file.
 This plist files can be creted manually or with Particle Designer:
 */
cc.ParticleSystemQuad.particleWithFile = function (pListFile) {
    var pRet = new cc.ParticleSystemQuad();
    if (pRet && pRet.initWithFile(pListFile)) {
        return pRet;
    }
    return null;
};

cc.ARCH_OPTIMAL_PARTICLE_SYSTEM = cc.ParticleSystemQuad;