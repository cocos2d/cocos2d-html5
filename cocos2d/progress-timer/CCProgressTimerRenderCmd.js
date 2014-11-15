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

cc.ProgressTimer.CanvasRenderCmd = function(renderableObject){
    cc.Node.CanvasRenderCmd.call(this, renderableObject);
    this._needDraw = true;

    this._PI180 = Math.PI / 180;
    this._sprite = null;
    this._type = cc.ProgressTimer.TYPE_RADIAL;
    this._barRect = cc.rect(0, 0, 0, 0);
    this._origin = cc.p(0, 0);
    this._radius = 0;
    this._startAngle = 270;
    this._endAngle = 270;
    this._counterClockWise = false;
};

cc.ProgressTimer.CanvasRenderCmd.prototype = Object.create(cc.Node.CanvasRenderCmd.prototype);
cc.ProgressTimer.CanvasRenderCmd.prototype.constructor = cc.ProgressTimer.CanvasRenderCmd;

cc.ProgressTimer.CanvasRenderCmd.prototype.rendering = function (ctx, scaleX, scaleY) {
    var context = ctx || cc._renderContext, node = this._node, locSprite = this._sprite;

    var locTextureCoord = locSprite._renderCmd._textureCoord, alpha = locSprite._displayedOpacity / 255;

    if (locTextureCoord.width === 0 || locTextureCoord.height === 0)
        return;
    if (!locSprite._texture || !locTextureCoord.validRect || alpha === 0)
        return;

    var t = node._transformWorld;
    context.save();
    context.transform(t.a, t.c, t.b, t.d, t.tx * scaleX, -t.ty * scaleY);

    if (locSprite._blendFuncStr != "source-over")
        context.globalCompositeOperation = locSprite._blendFuncStr;
    context.globalAlpha = alpha;

    var locRect = locSprite._rect, locOffsetPosition = locSprite._offsetPosition, locDrawSizeCanvas = locSprite._drawSize_Canvas;
    var flipXOffset = 0 | (locOffsetPosition.x), flipYOffset = -locOffsetPosition.y - locRect.height;
    locDrawSizeCanvas.width = locRect.width * scaleX;
    locDrawSizeCanvas.height = locRect.height * scaleY;

    if (locSprite._flippedX) {
        flipXOffset = -locOffsetPosition.x - locRect.width;
        context.scale(-1, 1);
    }
    if (locSprite._flippedY) {
        flipYOffset = locOffsetPosition.y;
        context.scale(1, -1);
    }

    flipXOffset *= scaleX;
    flipYOffset *= scaleY;

    //clip
    if (this._type == cc.ProgressTimer.TYPE_BAR) {
        var locBarRect = this._barRect;
        context.beginPath();
        context.rect(locBarRect.x * scaleX, locBarRect.y * scaleY, locBarRect.width * scaleX, locBarRect.height * scaleY);
        context.clip();
        context.closePath();
    } else if (this._type == cc.ProgressTimer.TYPE_RADIAL) {
        var locOriginX = this._origin.x * scaleX;
        var locOriginY = this._origin.y * scaleY;
        context.beginPath();
        context.arc(locOriginX, locOriginY, this._radius * scaleY, this._PI180 * this._startAngle, this._PI180 * this._endAngle, this._counterClockWise);
        context.lineTo(locOriginX, locOriginY);
        context.clip();
        context.closePath();
    }

    //draw sprite
    var image = locSprite._texture.getHtmlElementObj();
    context.drawImage(image,
        locTextureCoord.renderX,
        locTextureCoord.renderY,
        locTextureCoord.width,
        locTextureCoord.height,
        flipXOffset, flipYOffset,
        locDrawSizeCanvas.width,
        locDrawSizeCanvas.height
    );

    context.restore();
    cc.g_NumberOfDraws++;
};


cc.ProgressTimer.WebGLRenderCmd = function(renderableObject){
    cc.Node.WebGLRenderCmd.call(this, renderableObject);
};

cc.ProgressTimer.WebGLRenderCmd.prototype = Object.create(cc.Node.WebGLRenderCmd.prototype);
cc.ProgressTimer.WebGLRenderCmd.prototype.constructor = cc.ProgressTimer.WebGLRenderCmd;

cc.ProgressTimer.WebGLRenderCmd.prototype.rendering = function (ctx) {
    var _t = this._node;
    var context = ctx || cc._renderContext;
    if (!_t._vertexData || !_t._sprite)
        return;

    _t._shaderProgram.use();
    _t._shaderProgram._setUniformForMVPMatrixWithMat4(_t._stackMatrix);

    var blendFunc = _t._sprite.getBlendFunc();
    cc.glBlendFunc(blendFunc.src, blendFunc.dst);
    cc.glEnableVertexAttribs(cc.VERTEX_ATTRIB_FLAG_POS_COLOR_TEX);

    cc.glBindTexture2D(_t._sprite.texture);

    context.bindBuffer(context.ARRAY_BUFFER, _t._vertexWebGLBuffer);
    if (_t._vertexDataDirty) {
        context.bufferData(context.ARRAY_BUFFER, _t._vertexArrayBuffer, context.DYNAMIC_DRAW);
        _t._vertexDataDirty = false;
    }
    var locVertexDataLen = cc.V2F_C4B_T2F.BYTES_PER_ELEMENT;
    context.vertexAttribPointer(cc.VERTEX_ATTRIB_POSITION, 2, context.FLOAT, false, locVertexDataLen, 0);
    context.vertexAttribPointer(cc.VERTEX_ATTRIB_COLOR, 4, context.UNSIGNED_BYTE, true, locVertexDataLen, 8);
    context.vertexAttribPointer(cc.VERTEX_ATTRIB_TEX_COORDS, 2, context.FLOAT, false, locVertexDataLen, 12);

    if (_t._type === cc.ProgressTimer.TYPE_RADIAL)
        context.drawArrays(context.TRIANGLE_FAN, 0, _t._vertexDataCount);
    else if (_t._type == cc.ProgressTimer.TYPE_BAR) {
        if (!_t._reverseDirection)
            context.drawArrays(context.TRIANGLE_STRIP, 0, _t._vertexDataCount);
        else {
            context.drawArrays(context.TRIANGLE_STRIP, 0, _t._vertexDataCount / 2);
            context.drawArrays(context.TRIANGLE_STRIP, 4, _t._vertexDataCount / 2);
            // 2 draw calls
            cc.g_NumberOfDraws++;
        }
    }
    cc.g_NumberOfDraws++;
};