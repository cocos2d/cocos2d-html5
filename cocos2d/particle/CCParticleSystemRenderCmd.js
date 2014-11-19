/****************************************************************************
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

/**
 * ParticleSystem's canvas render command
 */
(function(){
    cc.ParticleSystem.CanvasRenderCmd = function(renderable){
        cc.Node.CanvasRenderCmd.call(this, renderable);
        this._needDraw = true;

        this._buffersVBO = [0, 0];
        this._quads = [];
        this._indices = [];
        this._pointRect = cc.rect(0, 0, 0, 0);
    };
    var proto = cc.ParticleSystem.CanvasRenderCmd.prototype = Object.create(cc.Node.CanvasRenderCmd.prototype);
    proto.constructor = cc.ParticleSystem.CanvasRenderCmd;

    proto.rendering = function (ctx, scaleX, scaleY) {
        var context = ctx || cc._renderContext,
            node = this._node,
            t = node._transformWorld,
            pointRect = this._pointRect;

        context.save();
        //transform
        context.transform(t.a, t.c, t.b, t.d, t.tx * scaleX, -t.ty * scaleY);
        if (node.isBlendAdditive())
            context.globalCompositeOperation = 'lighter';
        else
            context.globalCompositeOperation = 'source-over';

        var i, particle, lpx, alpha;
        var particleCount = this._node.particleCount, particles = this._node._particles;
        if (node.drawMode == cc.ParticleSystem.TEXTURE_MODE) {
            // Delay drawing until the texture is fully loaded by the browser
            if (!node._texture || !node._texture._isLoaded) {
                context.restore();
                return;
            }
            var element = node._texture.getHtmlElementObj();
            if (!element.width || !element.height) {
                context.restore();
                return;
            }

            var textureCache = cc.textureCache, drawElement = element;
            for (i = 0; i < particleCount; i++) {
                particle = particles[i];
                lpx = (0 | (particle.size * 0.5));

                alpha = particle.color.a / 255;
                if (alpha === 0) continue;
                context.globalAlpha = alpha;

                context.save();
                context.translate((0 | particle.drawPos.x), -(0 | particle.drawPos.y));

                var size = Math.floor(particle.size / 4) * 4;
                var w = pointRect.width;
                var h = pointRect.height;

                context.scale(Math.max((1 / w) * size, 0.000001), Math.max((1 / h) * size, 0.000001));

                if (particle.rotation)
                    context.rotate(cc.degreesToRadians(particle.rotation));

                if (particle.isChangeColor) {
                    var cacheTextureForColor = textureCache.getTextureColors(element);
                    if (cacheTextureForColor) {
                        // Create another cache for the tinted version
                        // This speeds up things by a fair bit
                        if (!cacheTextureForColor.tintCache) {
                            cacheTextureForColor.tintCache = cc.newElement('canvas');
                            cacheTextureForColor.tintCache.width = element.width;
                            cacheTextureForColor.tintCache.height = element.height;
                        }
                        cc.Sprite.CanvasRenderCmd._generateTintImage(element, cacheTextureForColor, particle.color, this._pointRect, cacheTextureForColor.tintCache);
                        drawElement = cacheTextureForColor.tintCache;
                    }
                }
                context.drawImage(drawElement, -(0 | (w / 2)), -(0 | (h / 2)));
                context.restore();
            }
        } else {
            var drawTool = cc._drawingUtil;
            for (i = 0; i < particleCount; i++) {
                particle = particles[i];
                lpx = (0 | (particle.size * 0.5));
                alpha = particle.color.a / 255;
                if (alpha === 0) continue;
                context.globalAlpha = alpha;

                context.save();
                context.translate(0 | particle.drawPos.x, -(0 | particle.drawPos.y));
                if (node.shapeType == cc.ParticleSystem.STAR_SHAPE) {
                    if (particle.rotation)
                        context.rotate(cc.degreesToRadians(particle.rotation));
                    drawTool.drawStar(context, lpx, particle.color);
                } else
                    drawTool.drawColorBall(context, lpx, particle.color);
                context.restore();
            }
        }
        context.restore();
        cc.g_NumberOfDraws++;
    };

    if(!cc.sys._supportCanvasNewBlendModes){
        proto._changeTextureColor = function(element, color, rect){
            var cacheTextureForColor = cc.textureCache.getTextureColors(element);
            if (cacheTextureForColor) {
                // Create another cache for the tinted version
                // This speeds up things by a fair bit
                if (!cacheTextureForColor.tintCache) {
                    cacheTextureForColor.tintCache = document.createElement('canvas');
                    cacheTextureForColor.tintCache.width = element.width;
                    cacheTextureForColor.tintCache.height = element.height;
                }
                cc.Sprite.CanvasRenderCmd._generateTintImage(element, cacheTextureForColor, color, rect, cacheTextureForColor.tintCache);
                return cacheTextureForColor.tintCache;
            }
            return null
        }
    }else{
        proto._changeTextureColor = function(element, color, rect){
            if (!element.tintCache) {
                element.tintCache = document.createElement('canvas');
                element.tintCache.width = element.width;
                element.tintCache.height = element.height;
            }
            return cc.Sprite.CanvasRenderCmd._generateTintImageWithMultiply(element, color, rect, element.tintCache);
        }
    }

    proto.initTexCoordsWithRect = function(){};

    proto.setTotalParticles = function(){
        //cc.assert(tp <= this._allocatedParticles, "Particle: resizing particle array only supported for quads");
        this._node._totalParticles = (tp < 200) ? tp : 200;
    };

    proto.addParticle = function(){
        var node = this._node,
            particles = node._particles,
            particle;
        if (node.particleCount < particles.length) {
            particle = particles[node.particleCount];
        } else {
            particle = new cc.Particle();
            particles.push(particle);
        }
        return particle;
    };

    proto.initParticle = function(){
        var node = this._node;
        var locRandomMinus11 = cc.randomMinus1To1;
        // Color
        var start, end;
        var locStartColor = node._startColor, locStartColorVar = node._startColorVar;
        var locEndColor = node._endColor, locEndColorVar = node._endColorVar;
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
        return {start: start, end: end};
    };

    proto.draw = function(ctx){
        var node =  this;
        var context = ctx || cc._renderContext;
        context.save();
        if (node.isBlendAdditive())
            context.globalCompositeOperation = 'lighter';
        else
            context.globalCompositeOperation = 'source-over';

        var element = node._texture.getHtmlElementObj();
        var locScaleX = cc.view.getScaleX(), locScaleY = cc.view.getScaleY();

        for (var i = 0; i < node.particleCount; i++) {
            var particle = node._particles[i];
            var lpx = (0 | (particle.size * 0.5));

            if (node.drawMode == cc.ParticleSystem.TEXTURE_MODE) {
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
                var drawElement = particle.isChangeColor ? node._changeTextureColor(element, particle.color, this._pointRect) : element;
                if(drawElement)
                    context.drawImage(drawElement, 0, 0);
                context.restore();
            } else {
                context.save();
                context.globalAlpha = particle.color.a / 255;

                context.translate(0 | particle.drawPos.x, -(0 | particle.drawPos.y));

                if (node.shapeType == cc.ParticleSystem.STAR_SHAPE) {
                    if (particle.rotation)
                        context.rotate(cc.degreesToRadians(particle.rotation));
                    cc._drawingUtil.drawStar(context, lpx, particle.color);
                } else
                    cc._drawingUtil.drawColorBall(context, lpx, particle.color);
                context.restore();
            }
        }
        context.restore();
    };

    proto._setupVBO = function(){};
    proto._allocMemory = function(){
        return true;
    };

    proto._setBlendAdditive = function(){
        var locBlendFunc = this._node._blendFunc;
        locBlendFunc.src = cc.BLEND_SRC;
        locBlendFunc.dst = cc.BLEND_DST;
    };

    proto._initWithTotalParticles =
    proto._updateDeltaColor = function(){};
})();

/**
 * ParticleSystem's WebGL render command
 */
(function(){

    cc.ParticleSystem.WebGLRenderCmd = function(renderable){
        cc.Node.WebGLRenderCmd.call(this, renderable);
        this._needDraw = true;

        this._buffersVBO = [0, 0];
        this._quads = [];
        this._indices = [];
        this._pointRect = cc.rect(0, 0, 0, 0);
        this._quadsArrayBuffer = null;
    };
    var proto = cc.ParticleSystem.WebGLRenderCmd.prototype = Object.create(cc.Node.WebGLRenderCmd.prototype);
    proto.constructor = cc.ParticleSystem.CanvasRenderCmd;

    proto.rendering = function (ctx) {
        var _t = this._node;
        if (!_t._texture)
            return;

        var gl = ctx || cc._renderContext;

        _t._shaderProgram.use();
        _t._shaderProgram._setUniformForMVPMatrixWithMat4(_t._stackMatrix);//setUniformForModelViewAndProjectionMatrixWithMat4();

        cc.glBindTexture2D(_t._texture);
        cc.glBlendFuncForParticle(_t._blendFunc.src, _t._blendFunc.dst);

        //
        // Using VBO without VAO
        //
        cc.glEnableVertexAttribs(cc.VERTEX_ATTRIB_FLAG_POS_COLOR_TEX);

        gl.bindBuffer(gl.ARRAY_BUFFER, this._buffersVBO[0]);
        gl.vertexAttribPointer(cc.VERTEX_ATTRIB_POSITION, 3, gl.FLOAT, false, 24, 0);               // vertices
        gl.vertexAttribPointer(cc.VERTEX_ATTRIB_COLOR, 4, gl.UNSIGNED_BYTE, true, 24, 12);          // colors
        gl.vertexAttribPointer(cc.VERTEX_ATTRIB_TEX_COORDS, 2, gl.FLOAT, false, 24, 16);            // tex coords

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._buffersVBO[1]);
        gl.drawElements(gl.TRIANGLES, _t._particleIdx * 6, gl.UNSIGNED_SHORT, 0);
    };

    proto._changeTextureColor = function(element, color, rect){
        if (!element.tintCache) {
            element.tintCache = document.createElement('canvas');
            element.tintCache.width = element.width;
            element.tintCache.height = element.height;
        }
        return cc.Sprite.CanvasRenderCmd._generateTintImageWithMultiply(element, color, rect, element.tintCache);
    };

    proto.initTexCoordsWithRect = function(pointRect){
        var node = this;
        var texture = node.texture;
        var scaleFactor = cc.contentScaleFactor();
        // convert to pixels coords
        var rect = cc.rect(
                pointRect.x * scaleFactor,
                pointRect.y * scaleFactor,
                pointRect.width * scaleFactor,
                pointRect.height * scaleFactor);

        var wide = pointRect.width;
        var high = pointRect.height;

        if (texture) {
            wide = texture.pixelsWidth;
            high = texture.pixelsHeight;
        }

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
        if (node._batchNode) {
            quads = node._batchNode.textureAtlas.quads;
            start = node.atlasIndex;
            end = node.atlasIndex + node._totalParticles;
        } else {
            quads = this._quads;
            start = 0;
            end = node._totalParticles;
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
    };

    proto.setTotalParticles = function(){
        var node = this._node;
        // If we are setting the total numer of particles to a number higher
        // than what is allocated, we need to allocate new arrays
        if (tp > node._allocatedParticles) {
            var quadSize = cc.V3F_C4B_T2F_Quad.BYTES_PER_ELEMENT;
            // Allocate new memory
            this._indices = new Uint16Array(tp * 6);
            var locQuadsArrayBuffer = new ArrayBuffer(tp * quadSize);
            //TODO need fix
            // Assign pointers
            var locParticles = node._particles;
            locParticles.length = 0;
            var locQuads = this._quads;
            locQuads.length = 0;
            for (var j = 0; j < tp; j++) {
                locParticles[j] = new cc.Particle();
                locQuads[j] = new cc.V3F_C4B_T2F_Quad(null, null, null, null, locQuadsArrayBuffer, j * quadSize);
            }
            node._allocatedParticles = tp;
            node._totalParticles = tp;

            // Init particles
            if (node._batchNode) {
                for (var i = 0; i < tp; i++)
                    locParticles[i].atlasIndex = i;
            }

            this._quadsArrayBuffer = locQuadsArrayBuffer;

            node.initIndices();
            //if (cc.TEXTURE_ATLAS_USE_VAO)
            //    node._setupVBOandVAO();
            //else
            this._setupVBO();

            //set the texture coord
            if(node._texture){
                node.initTexCoordsWithRect(cc.rect(0, 0, node._texture.width, node._texture.height));
            }
        } else
            node._totalParticles = tp;
        node.resetSystem();
    };

    proto.addParticle = function(){
        var node = this._node,
            particles = node._particles;
        return particles[node.particleCount];
    };

    proto.initParticle = function(){
        var node = this._node;
        var locRandomMinus11 = cc.randomMinus1To1;
        // Color
        var start, end;
        var locStartColor = node._startColor, locStartColorVar = node._startColorVar;
        var locEndColor = node._endColor, locEndColorVar = node._endColorVar;
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
        return {start: start, end: end};
    };

    proto.draw = function(ctx){
        if(!this._texture)
            return;
        var node = this._node;
        var gl = ctx || cc._renderContext;
        node._shaderProgram.use();
        node._shaderProgram.setUniformForModelViewAndProjectionMatrixWithMat4();

        cc.glBindTexture2D(node._texture);
        cc.glBlendFuncForParticle(node._blendFunc.src, node._blendFunc.dst);

        //cc.assert(node._particleIdx == node.particleCount, "Abnormal error in particle quad");

        //
        // Using VBO without VAO
        //
        cc.glEnableVertexAttribs(cc.VERTEX_ATTRIB_FLAG_POS_COLOR_TEX);

        gl.bindBuffer(gl.ARRAY_BUFFER, node._buffersVBO[0]);
        gl.vertexAttribPointer(cc.VERTEX_ATTRIB_POSITION, 3, gl.FLOAT, false, 24, 0);               // vertices
        gl.vertexAttribPointer(cc.VERTEX_ATTRIB_COLOR, 4, gl.UNSIGNED_BYTE, true, 24, 12);          // colors
        gl.vertexAttribPointer(cc.VERTEX_ATTRIB_TEX_COORDS, 2, gl.FLOAT, false, 24, 16);            // tex coords

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, node._buffersVBO[1]);
        gl.drawElements(gl.TRIANGLES, node._particleIdx * 6, gl.UNSIGNED_SHORT, 0);
    };

    proto._setupVBO = function(){
        var node = this;
        var gl = cc._renderContext;

        //gl.deleteBuffer(this._buffersVBO[0]);
        this._buffersVBO[0] = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, node._buffersVBO[0]);
        gl.bufferData(gl.ARRAY_BUFFER, this._quadsArrayBuffer, gl.DYNAMIC_DRAW);

        this._buffersVBO[1] = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, node._buffersVBO[1]);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this._indices, gl.STATIC_DRAW);

        //cc.checkGLErrorDebug();
    };

    proto._allocMemory = function(){
        var node  = this;
        //cc.assert((!this._quads && !this._indices), "Memory already allocated");
        if(node._batchNode){
            cc.log("cc.ParticleSystem._allocMemory(): Memory should not be allocated when not using batchNode");
            return false;
        }

        var quadSize = cc.V3F_C4B_T2F_Quad.BYTES_PER_ELEMENT;
        var totalParticles = node._totalParticles;
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
    };

    proto._setBlendAdditive = function(){
        var locBlendFunc = this._node._blendFunc;
        if (this._texture && !this._texture.hasPremultipliedAlpha()) {
            locBlendFunc.src = cc.SRC_ALPHA;
            locBlendFunc.dst = cc.ONE_MINUS_SRC_ALPHA;
        } else {
            locBlendFunc.src = cc.BLEND_SRC;
            locBlendFunc.dst = cc.BLEND_DST;
        }
    };

    proto._initWithTotalParticles = function(){
        var node = this;
        // allocating data space
        if (!node._allocMemory())
            return false;

        node.initIndices();
        //if (cc.TEXTURE_ATLAS_USE_VAO)
        //    this._setupVBOandVAO();
        //else
        node._setupVBO();

        node.shaderProgram = cc.shaderCache.programForKey(cc.SHADER_POSITION_TEXTURECOLOR);
    };

    proto._updateDeltaColor = function(selParticle, dt){
        if (!this._node._dontTint) {
            selParticle.color.r += selParticle.deltaColor.r * dt;
            selParticle.color.g += selParticle.deltaColor.g * dt;
            selParticle.color.b += selParticle.deltaColor.b * dt;
            selParticle.color.a += selParticle.deltaColor.a * dt;
            selParticle.isChangeColor = true;
        }
    };

})();