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

// ParticleSystem's canvas render command
cc.ParticleSystem.CanvasRenderCmd = function(renderable){
    cc.Node.CanvasRenderCmd.call(this, renderable);
    this._needDraw = true;
};
cc.ParticleSystem.CanvasRenderCmd.prototype = Object.create(cc.Node.CanvasRenderCmd.prototype);

cc.ParticleSystem.CanvasRenderCmd.prototype.rendering = function (ctx, scaleX, scaleY) {
    var context = ctx || cc._renderContext,
        node = this._node,
        t = node._transformWorld,
        pointRect = node._pointRect;

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

//ParticleSystem's WebGL render command
cc.ParticleSystem.WebGLRenderCmd = function(renderable){
    cc.Node.WebGLRenderCmd.call(this, renderable);
    this._needDraw = true;
};
cc.ParticleSystem.WebGLRenderCmd.prototype = Object.create(cc.Node.WebGLRenderCmd.prototype);

cc.ParticleSystem.WebGLRenderCmd.prototype.rendering = function (ctx) {
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

    gl.bindBuffer(gl.ARRAY_BUFFER, _t._buffersVBO[0]);
    gl.vertexAttribPointer(cc.VERTEX_ATTRIB_POSITION, 3, gl.FLOAT, false, 24, 0);               // vertices
    gl.vertexAttribPointer(cc.VERTEX_ATTRIB_COLOR, 4, gl.UNSIGNED_BYTE, true, 24, 12);          // colors
    gl.vertexAttribPointer(cc.VERTEX_ATTRIB_TEX_COORDS, 2, gl.FLOAT, false, 24, 16);            // tex coords

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, _t._buffersVBO[1]);
    gl.drawElements(gl.TRIANGLES, _t._particleIdx * 6, gl.UNSIGNED_SHORT, 0);
};
