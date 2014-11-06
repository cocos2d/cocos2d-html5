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

//Layer's canvas render command
cc.Layer.CanvasRenderCmd = function(renderable){
    cc.Node.CanvasRenderCmd.call(this, renderable);
};

cc.Layer.CanvasRenderCmd.prototype = Object.create(cc.Node.CanvasRenderCmd.prototype);

cc.Layer.CanvasBakeRenderCmd = function(renderable){
    cc.Node.CanvasRenderCmd.call(this, renderable);
    this._needDraw = true;
};

cc.Layer.CanvasBakeRenderCmd.prototype = Object.create(cc.Node.CanvasRenderCmd.prototype);

cc.Layer.CanvasBakeRenderCmd.prototype.rendering = function(){
    if(this._cacheDirty){
        var _t = this;
        var children = _t._children, locBakeSprite = this._bakeSprite;
        //compute the bounding box of the bake layer.
        this._transformForRenderer();
        var boundingBox = this._getBoundingBoxForBake();
        boundingBox.width = 0|(boundingBox.width+0.5);
        boundingBox.height = 0|(boundingBox.height+0.5);
        var bakeContext = locBakeSprite.getCacheContext();
        locBakeSprite.resetCanvasSize(boundingBox.width, boundingBox.height);
        bakeContext.translate(0 - boundingBox.x, boundingBox.height + boundingBox.y);
        //  invert
        var t = cc.affineTransformInvert(this._transformWorld);
        bakeContext.transform(t.a, t.c, t.b, t.d, t.tx , -t.ty );

        //reset the bake sprite's position
        var anchor = locBakeSprite.getAnchorPointInPoints();
        locBakeSprite.setPosition(anchor.x + boundingBox.x, anchor.y + boundingBox.y);

        //visit for canvas
        _t.sortAllChildren();
        cc.renderer._turnToCacheMode(this.__instanceId);
        for (var i = 0, len = children.length; i < len; i++) {
            children[i].visit(bakeContext);
        }
        cc.renderer._renderingToCacheCanvas(bakeContext, this.__instanceId);
        locBakeSprite.transform();                   //because bake sprite's position was changed at rendering.
        this._cacheDirty = false;
    }
};

//Layer's WebGL render command
cc.Layer.WebGLRenderCmd = function(renderable){
    cc.Node.WebGLRenderCmd.call(this, renderable);
};

cc.Layer.WebGLRenderCmd.prototype = Object.create(cc.Node.WebGLRenderCmd.prototype);

//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

//LayerColor's canvas render command
cc.LayerColor.CanvasRenderCmd = function(renderable){
    cc.Layer.CanvasRenderCmd.call(this, renderable);
    this._needDraw = true;
};
cc.LayerColor.CanvasRenderCmd.prototype = Object.create(cc.Layer.CanvasRenderCmd.prototype);

cc.LayerColor.CanvasRenderCmd.prototype.rendering = function (ctx, scaleX, scaleY) {
    var context = ctx || cc._renderContext,
        node = this._node,
        t = node._transformWorld,
        curColor = node._displayedColor,
        opacity = node._displayedOpacity / 255,
        locWidth = node._contentSize.width,
        locHeight = node._contentSize.height;

    if (opacity === 0)
        return;

    var needTransform = (t.a !== 1 || t.b !== 0 || t.c !== 0 || t.d !== 1);
    var needRestore = (node._blendFuncStr !== "source-over") || needTransform;

    if (needRestore) {
        context.save();
        context.globalCompositeOperation = node._blendFuncStr;
    }
    context.globalAlpha = opacity;
    context.fillStyle = "rgba(" + (0 | curColor.r) + "," + (0 | curColor.g) + ","
        + (0 | curColor.b) + ", 1)";
    if (needTransform) {
        context.transform(t.a, t.c, t.b, t.d, t.tx * scaleX, -t.ty * scaleY);
        context.fillRect(0, 0, locWidth * scaleX, -locHeight * scaleY);
    } else {
        context.fillRect(t.tx * scaleX, -t.ty * scaleY, locWidth * scaleX, -locHeight * scaleY);
    }
    if (needRestore)
        context.restore();
    cc.g_NumberOfDraws++;
};

//LayerColor's WebGL render command
cc.LayerColor.WebGLRenderCmd = function(renderable){
    cc.Layer.WebGLRenderCmd.call(this, renderable);
    this._needDraw = true;
};
cc.LayerColor.WebGLRenderCmd.prototype = Object.create(cc.Layer.WebGLRenderCmd.prototype);

cc.LayerColor.WebGLRenderCmd.prototype.rendering = function (ctx) {
    var context = ctx || cc._renderContext;
    var node = this._node;

    node._shaderProgram.use();
    node._shaderProgram._setUniformForMVPMatrixWithMat4(node._stackMatrix);
    cc.glEnableVertexAttribs(cc.VERTEX_ATTRIB_FLAG_POSITION | cc.VERTEX_ATTRIB_FLAG_COLOR);

    //
    // Attributes
    //
    context.bindBuffer(context.ARRAY_BUFFER, node._verticesFloat32Buffer);
    context.vertexAttribPointer(cc.VERTEX_ATTRIB_POSITION, 2, context.FLOAT, false, 0, 0);

    context.bindBuffer(context.ARRAY_BUFFER, node._colorsUint8Buffer);
    context.vertexAttribPointer(cc.VERTEX_ATTRIB_COLOR, 4, context.UNSIGNED_BYTE, true, 0, 0);

    cc.glBlendFunc(node._blendFunc.src, node._blendFunc.dst);
    context.drawArrays(context.TRIANGLE_STRIP, 0, 4);
};

//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//LayerGradient's Canvas render command
cc.LayerGradient.CanvasRenderCmd = function(renderable){
    cc.LayerColor.CanvasRenderCmd.call(this, renderable);
    this._needDraw = true;
    this._startPoint = cc.p(0, 0);
    this._endPoint = cc.p(0, 0);
    this._startStopStr = null;
    this._endStopStr = null;
};
cc.LayerGradient.CanvasRenderCmd.prototype = Object.create(cc.LayerColor.CanvasRenderCmd.prototype);

cc.LayerGradient.CanvasRenderCmd.prototype.rendering = function (ctx, scaleX, scaleY) {
    var context = ctx || cc._renderContext,
        self = this,
        node = self._node,
        opacity = node._displayedOpacity / 255,
        t = node._transformWorld;

    if (opacity === 0)
        return;

    var needTransform = (t.a !== 1 || t.b !== 0 || t.c !== 0 || t.d !== 1);
    var needRestore = (node._blendFuncStr !== "source-over") || needTransform;
    if (needRestore) {
        context.save();
        context.globalCompositeOperation = node._blendFuncStr;
    }
    context.globalAlpha = opacity;
    var locWidth = node._contentSize.width, locHeight = node._contentSize.height;

    var gradient = context.createLinearGradient(self._startPoint.x, self._startPoint.y, self._endPoint.x, self._endPoint.y);
    gradient.addColorStop(0, this._startStopStr);
    gradient.addColorStop(1, this._endStopStr);
    context.fillStyle = gradient;

    if (needTransform) {
        context.transform(t.a, t.c, t.b, t.d, t.tx * scaleX, -t.ty * scaleY);
        context.fillRect(0, 0, locWidth * scaleX, -locHeight * scaleY);
    } else
        context.fillRect(t.tx * scaleX, -t.ty * scaleY, locWidth * scaleX, -locHeight * scaleY);

    if (needRestore)
        context.restore();
    cc.g_NumberOfDraws++;
};

//LayerColor's WebGL render command
cc.LayerGradient.WebGLRenderCmd = function(renderable){
    cc.LayerColor.WebGLRenderCmd.call(this, renderable);
    this._needDraw = true;
};
cc.LayerGradient.WebGLRenderCmd.prototype = Object.create(cc.LayerColor.WebGLRenderCmd.prototype);



