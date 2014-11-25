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

cc.MotionStreak.WebGLRenderCmd = function(renderableObject){
    cc.Node.WebGLRenderCmd.call(this, renderableObject);
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

cc.MotionStreak.WebGLRenderCmd.prototype = Object.create(cc.Node.WebGLRenderCmd.prototype);
cc.MotionStreak.WebGLRenderCmd.prototype.constructor = cc.Sprite.WebGLRenderCmd;

cc.MotionStreak.WebGLRenderCmd.prototype.rendering = function(ctx){
    var _t = this._node;
    if (_t._nuPoints <= 1)
        return;

    if (_t.texture && _t.texture.isLoaded()) {
        ctx = ctx || cc._renderContext;
        _t._shaderProgram.use();
        _t._shaderProgram._setUniformForMVPMatrixWithMat4(_t._stackMatrix);
        cc.glEnableVertexAttribs(cc.VERTEX_ATTRIB_FLAG_POS_COLOR_TEX);
        cc.glBlendFunc(_t._blendFunc.src, _t._blendFunc.dst);

        cc.glBindTexture2D(_t.texture);

        //position
        ctx.bindBuffer(ctx.ARRAY_BUFFER, _t._verticesBuffer);
        ctx.bufferData(ctx.ARRAY_BUFFER, _t._vertices, ctx.DYNAMIC_DRAW);
        ctx.vertexAttribPointer(cc.VERTEX_ATTRIB_POSITION, 2, ctx.FLOAT, false, 0, 0);

        //texcoords
        ctx.bindBuffer(ctx.ARRAY_BUFFER, _t._texCoordsBuffer);
        ctx.bufferData(ctx.ARRAY_BUFFER, _t._texCoords, ctx.DYNAMIC_DRAW);
        ctx.vertexAttribPointer(cc.VERTEX_ATTRIB_TEX_COORDS, 2, ctx.FLOAT, false, 0, 0);

        //colors
        ctx.bindBuffer(ctx.ARRAY_BUFFER, _t._colorPointerBuffer);
        ctx.bufferData(ctx.ARRAY_BUFFER, _t._colorPointer, ctx.DYNAMIC_DRAW);
        ctx.vertexAttribPointer(cc.VERTEX_ATTRIB_COLOR, 4, ctx.UNSIGNED_BYTE, true, 0, 0);

        ctx.drawArrays(ctx.TRIANGLE_STRIP, 0, _t._nuPoints * 2);
        cc.g_NumberOfDraws++;
    }
};