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

cc.Sprite.CanvasRenderCmd = function(renderableObject){
    cc.Node.CanvasRenderCmd.call(this, renderableObject);
    this._needDraw = true;
    this._textureCoord = {
        renderX: 0,                             //the x of texture coordinate for render, when texture tinted, its value doesn't equal x.
        renderY: 0,                             //the y of texture coordinate for render, when texture tinted, its value doesn't equal y.
        x: 0,                                   //the x of texture coordinate for node.
        y: 0,                                   //the y of texture coordinate for node.
        width: 0,
        height: 0,
        validRect: false
    };
};

cc.Sprite.CanvasRenderCmd.prototype = Object.create(cc.Node.CanvasRenderCmd.prototype);
cc.Sprite.CanvasRenderCmd.prototype.constructor = cc.Sprite.CanvasRenderCmd;

cc.Sprite.CanvasRenderCmd.prototype.rendering = function (ctx, scaleX, scaleY) {
    var self = this,
        node = self._node;

    var context = ctx || cc._renderContext,
        locTextureCoord = self._textureCoord;

    if (node._texture && (locTextureCoord.width === 0 || locTextureCoord.height === 0))
        return;
    if (!locTextureCoord.validRect && node._displayedOpacity === 0)
        return;  //draw nothing

    if (node._texture && !node._texture._isLoaded)  //set texture but the texture isn't loaded.
        return;

    var t = node._transformWorld,
        locX = node._offsetPosition.x,
        locY = -node._offsetPosition.y - node._rect.height,
        locWidth = node._rect.width,
        locHeight = node._rect.height,
        image, curColor, contentSize;

    var blendChange = (node._blendFuncStr !== "source-over"), alpha = (node._displayedOpacity / 255);

    if (t.a !== 1 || t.b !== 0 || t.c !== 0 || t.d !== 1 || node._flippedX || node._flippedY) {
        context.save();

        context.globalAlpha = alpha;
        //transform
        context.transform(t.a, t.c, t.b, t.d, t.tx * scaleX, -t.ty * scaleY);
        if (blendChange)
            context.globalCompositeOperation = node._blendFuncStr;

        if (node._flippedX) {
            locX = -locX - locWidth;
            context.scale(-1, 1);
        }
        if (node._flippedY) {
            locY = node._offsetPosition.y;
            context.scale(1, -1);
        }

        if (node._texture) {
            image = node._texture._htmlElementObj;

            if (node._texture._pattern != "") {
                context.save();
                context.fillStyle = context.createPattern(image, node._texture._pattern);
                context.fillRect(locX * scaleX, locY * scaleY, locWidth * scaleX, locHeight * scaleY);
                context.restore();
            } else {
                if (node._colorized) {
                    context.drawImage(image,
                        0,
                        0,
                        locTextureCoord.width,
                        locTextureCoord.height,
                            locX * scaleX,
                            locY * scaleY,
                            locWidth * scaleX,
                            locHeight * scaleY
                    );
                } else {
                    context.drawImage(image,
                        locTextureCoord.renderX,
                        locTextureCoord.renderY,
                        locTextureCoord.width,
                        locTextureCoord.height,
                            locX * scaleX,
                            locY * scaleY,
                            locWidth * scaleX,
                            locHeight * scaleY
                    );
                }
            }
        } else {
            contentSize = node._contentSize;
            if (locTextureCoord.validRect) {
                curColor = node._displayedColor;
                context.fillStyle = "rgba(" + curColor.r + "," + curColor.g + "," + curColor.b + ",1)";
                context.fillRect(locX * scaleX, locY * scaleY, contentSize.width * scaleX, contentSize.height * scaleY);
            }
        }
        context.restore();
    } else {
        if (blendChange) {
            context.save();
            context.globalCompositeOperation = node._blendFuncStr;
        }

        context.globalAlpha = alpha;
        if (node._texture) {
            image = node._texture.getHtmlElementObj();
            if (node._texture._pattern != "") {
                context.save();
                context.transform(t.a, t.c, t.b, t.d, t.tx * scaleX, -t.ty * scaleY);
                context.fillStyle = context.createPattern(image, node._texture._pattern);
                context.fillRect(locX * scaleX, locY * scaleY, locWidth * scaleX, locHeight * scaleY);
                context.restore();
            } else {
                if (node._colorized) {
                    context.drawImage(image,
                        0,
                        0,
                        locTextureCoord.width,
                        locTextureCoord.height,
                            (t.tx + locX) * scaleX,
                            (-t.ty + locY) * scaleY,
                            locWidth * scaleX,
                            locHeight * scaleY);
                } else {
                    context.drawImage(
                        image,
                        locTextureCoord.renderX,
                        locTextureCoord.renderY,
                        locTextureCoord.width,
                        locTextureCoord.height,
                            (t.tx + locX) * scaleX,
                            (-t.ty + locY) * scaleY,
                            locWidth * scaleX,
                            locHeight * scaleY);
                }
            }
        } else {
            contentSize = node._contentSize;
            if (locTextureCoord.validRect) {
                curColor = node._displayedColor;
                context.fillStyle = "rgba(" + curColor.r + "," + curColor.g + "," + curColor.b + ",1)";
                context.fillRect((t.tx + locX) * scaleX, (-t.ty + locY) * scaleY, contentSize.width * scaleX, contentSize.height * scaleY);
            }
        }
        if (blendChange)
            context.restore();
    }
    cc.g_NumberOfDraws++;
};

//Sprite's WebGL render command
cc.Sprite.WebGLRenderCmd = function(renderableObject){
    cc.Node.WebGLRenderCmd.call(this, renderableObject);
    this._needDraw = true;
};

cc.Sprite.WebGLRenderCmd.prototype = Object.create(cc.Node.WebGLRenderCmd);

cc.Sprite.WebGLRenderCmd.prototype.rendering = function (ctx) {
    var _t = this._node;
    if (!_t._textureLoaded || _t._displayedOpacity === 0)
        return;

    var gl = ctx || cc._renderContext, locTexture = _t._texture;
    //cc.assert(!_t._batchNode, "If cc.Sprite is being rendered by cc.SpriteBatchNode, cc.Sprite#draw SHOULD NOT be called");

    if (locTexture) {
        if (locTexture._isLoaded) {
            _t._shaderProgram.use();
            _t._shaderProgram._setUniformForMVPMatrixWithMat4(_t._stackMatrix);

            cc.glBlendFunc(_t._blendFunc.src, _t._blendFunc.dst);
            //optimize performance for javascript
            cc.glBindTexture2DN(0, locTexture);                   // = cc.glBindTexture2D(locTexture);
            cc.glEnableVertexAttribs(cc.VERTEX_ATTRIB_FLAG_POS_COLOR_TEX);

            gl.bindBuffer(gl.ARRAY_BUFFER, _t._quadWebBuffer);
            if (_t._quadDirty) {
                gl.bufferData(gl.ARRAY_BUFFER, _t._quad.arrayBuffer, gl.DYNAMIC_DRAW);
                _t._quadDirty = false;
            }
            gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 24, 0);                   //cc.VERTEX_ATTRIB_POSITION
            gl.vertexAttribPointer(1, 4, gl.UNSIGNED_BYTE, true, 24, 12);           //cc.VERTEX_ATTRIB_COLOR
            gl.vertexAttribPointer(2, 2, gl.FLOAT, false, 24, 16);                  //cc.VERTEX_ATTRIB_TEX_COORDS

            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        }
    } else {
        _t._shaderProgram.use();
        _t._shaderProgram._setUniformForMVPMatrixWithMat4(_t._stackMatrix);

        cc.glBlendFunc(_t._blendFunc.src, _t._blendFunc.dst);
        cc.glBindTexture2D(null);

        cc.glEnableVertexAttribs(cc.VERTEX_ATTRIB_FLAG_POSITION | cc.VERTEX_ATTRIB_FLAG_COLOR);

        gl.bindBuffer(gl.ARRAY_BUFFER, _t._quadWebBuffer);
        if (_t._quadDirty) {
            gl.bufferData(gl.ARRAY_BUFFER, _t._quad.arrayBuffer, gl.STATIC_DRAW);
            _t._quadDirty = false;
        }
        gl.vertexAttribPointer(cc.VERTEX_ATTRIB_POSITION, 3, gl.FLOAT, false, 24, 0);
        gl.vertexAttribPointer(cc.VERTEX_ATTRIB_COLOR, 4, gl.UNSIGNED_BYTE, true, 24, 12);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
    cc.g_NumberOfDraws++;
};