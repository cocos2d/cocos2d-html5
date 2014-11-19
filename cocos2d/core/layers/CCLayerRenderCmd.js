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

//-----------------------//
//  1. cc.Layer          //
//  2. cc.LayerColor     //
//  3. cc.LayerGradient  //
//-----------------------//

/**
 * cc.Layer's rendering objects of Canvas
 */
(function(){

    //Layer's canvas render command
    cc.Layer.CanvasRenderCmd = function(renderable){
        cc.Node.CanvasRenderCmd.call(this, renderable);
        this._isBaked = false;
        this._bakeSprite = null;
    };

    var proto = cc.Layer.CanvasRenderCmd.prototype = Object.create(cc.Node.CanvasRenderCmd.prototype);
    proto.constructor = cc.Layer.CanvasRenderCmd;

    proto.bake = function(){
        if (!this._isBaked) {
            this._needDraw = true;
            cc.renderer.childrenOrderDirty = true;
            //limit: 1. its children's blendfunc are invalid.
            this._isBaked = this._cacheDirty = true;

            this._cachedParent = this;
            var children = this._children;
            for(var i = 0, len = children.length; i < len; i++)
                children[i]._setCachedParent(this);

            if (!this._bakeSprite){
                this._bakeSprite = new cc.BakeSprite();
                this._bakeSprite._parent = this;
            }
        }
    };

    proto.unbake = function(){
        if (this._isBaked) {
            cc.renderer.childrenOrderDirty = true;
            this._isBaked = false;
            this._cacheDirty = true;

            this._cachedParent = null;
            var children = this._children;
            for(var i = 0, len = children.length; i < len; i++)
                children[i]._setCachedParent(null);
        }
    };

    proto.isBaked = function(){
        return this._isBaked;
    };

    proto.rendering = function(){
        if(this._cacheDirty){
            var _t = this;
            var children = _t._children, locBakeSprite = this._bakeSprite;
            //compute the bounding box of the bake layer.
            this._transformForRenderer();
            var boundingBox = this._renderCmd._getBoundingBoxForBake();
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

    proto.visit = function(parentCmd){
        if(!this._isBaked){
            cc.Node.CanvasRenderCmd.prototype.visit.call(this, parentCmd);
            return;
        }

        var context = ctx || cc._renderContext;
        var _t = this;
        var children = _t._children;
        var len = children.length;
        // quick return if not visible
        if (!_t._visible || len === 0)
            return;

        _t.transform(context);

        if(_t._needDraw)
            cc.renderer.pushRenderCommand(this);

        //the bakeSprite is drawing
        this._bakeSprite.visit(context);
    };

    proto._bakeForAddChild = function(child){
        if(child._parent == this && this._isBaked)
            child._setCachedParent(this);
    };

    proto._getBoundingBoxForBake = function(){
        var rect = null;

        //query child's BoundingBox
        if (!this._children || this._children.length === 0)
            return cc.rect(0, 0, 10, 10);

        var locChildren = this._children;
        for (var i = 0; i < locChildren.length; i++) {
            var child = locChildren[i];
            if (child && child._visible) {
                if(rect){
                    var childRect = child._getBoundingBoxToCurrentNode();
                    if (childRect)
                        rect = cc.rectUnion(rect, childRect);
                }else{
                    rect = child._getBoundingBoxToCurrentNode();
                }
            }
        }
        return rect;
    };

})();

/**
 * cc.LayerColor's rendering objects of Canvas
 */
(function(){

    //LayerColor's canvas render command
    cc.LayerColor.CanvasRenderCmd = function(renderable){
        cc.Layer.CanvasRenderCmd.call(this, renderable);
        this._needDraw = true;
    };
    var proto = cc.LayerColor.CanvasRenderCmd.prototype = Object.create(cc.Layer.CanvasRenderCmd.prototype);
    proto.constructor = cc.LayerColor.CanvasRenderCmd;

    proto.rendering = function (ctx, scaleX, scaleY) {
        var context = ctx || cc._renderContext,
            node = this._node,
            t = this._worldTransform,
            curColor = this._displayedColor,
            opacity = this._displayedOpacity / 255,
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

    proto._updataSquareVertices =
    proto._updateSquareVerticesWidth =
    proto._updateSquareVerticesHeight = function(){};

    proto._updateColor = function(){
        var locCmd = this._renderCmd;
        if(!locCmd || !locCmd._color)
            return;
        var locColor = this._displayedColor;
        locCmd._color.r = locColor.r;
        locCmd._color.g = locColor.g;
        locCmd._color.b = locColor.b;
        locCmd._color.a = this._displayedOpacity / 255;
    };

    proto._bakeRendering = function(){
        if(this._cacheDirty){
            var _t = this;
            var locBakeSprite = _t._bakeSprite, children = this._children;
            var len = children.length, i;

            //compute the bounding box of the bake layer.
            var boundingBox = this._renderCmd._getBoundingBoxForBake();
            boundingBox.width = 0 | boundingBox.width;
            boundingBox.height = 0 | boundingBox.height;
            var bakeContext = locBakeSprite.getCacheContext();
            locBakeSprite.resetCanvasSize(boundingBox.width, boundingBox.height);
            var anchor = locBakeSprite.getAnchorPointInPoints(), locPos = this._position;
            if(this._ignoreAnchorPointForPosition){
                bakeContext.translate(0 - boundingBox.x + locPos.x, boundingBox.height + boundingBox.y - locPos.y);
                //reset the bake sprite's position
                locBakeSprite.setPosition(anchor.x + boundingBox.x - locPos.x, anchor.y + boundingBox.y - locPos.y);
            } else {
                var selfAnchor = this.getAnchorPointInPoints();
                var selfPos = {x: locPos.x - selfAnchor.x, y: locPos.y - selfAnchor.y};
                bakeContext.translate(0 - boundingBox.x + selfPos.x, boundingBox.height + boundingBox.y - selfPos.y);
                locBakeSprite.setPosition(anchor.x + boundingBox.x - selfPos.x, anchor.y + boundingBox.y - selfPos.y);
            }
            //  invert
            var t = cc.affineTransformInvert(this._transformWorld);
            bakeContext.transform(t.a, t.c, t.b, t.d, t.tx, -t.ty);

            var child;
            cc.renderer._turnToCacheMode(this.__instanceId);
            //visit for canvas
            if (len > 0) {
                _t.sortAllChildren();
                // draw children zOrder < 0
                for (i = 0; i < len; i++) {
                    child = children[i];
                    if (child._localZOrder < 0)
                        child.visit(bakeContext);
                    else
                        break;
                }
                if(_t._renderCmd)
                    cc.renderer.pushRenderCommand(_t._renderCmd);
                for (; i < len; i++) {
                    children[i].visit(bakeContext);
                }
            } else
            if(_t._renderCmd)
                cc.renderer.pushRenderCommand(_t._renderCmd);
            cc.renderer._renderingToCacheCanvas(bakeContext, this.__instanceId);
            locBakeSprite.transform();
            this._cacheDirty = false;
        }
    };

    proto.visit = function(ctx){
        var context = ctx || cc._renderContext;
        if(!this._isBaked){
            cc.Node.CanvasRenderCmd.prototype.visit.call(this);
            return;
        }

        var _t = this;
        // quick return if not visible
        if (!_t._visible)
            return;

        _t.transform(context);

        if(_t._bakeRenderCmd)
            cc.renderer.pushRenderCommand(_t._bakeRenderCmd);

        //the bakeSprite is drawing
        this._bakeSprite.visit(context);
    };

    proto._getBoundingBoxForBake = function(){
        //default size
        var rect = cc.rect(0, 0, this._contentSize.width, this._contentSize.height);
        var trans = this.getNodeToWorldTransform();
        rect = cc.rectApplyAffineTransform(rect, this.getNodeToWorldTransform());

        //query child's BoundingBox
        if (!this._children || this._children.length === 0)
            return rect;

        var locChildren = this._children;
        for (var i = 0; i < locChildren.length; i++) {
            var child = locChildren[i];
            if (child && child._visible) {
                var childRect = child._getBoundingBoxToCurrentNode(trans);
                rect = cc.rectUnion(rect, childRect);
            }
        }
        return rect;
    };

    proto.draw = function(){};

})();

/**
 * cc.LayerGradient's rendering objects of Canvas
 */
(function(){

    cc.LayerGradient.CanvasRenderCmd = function(renderable){
        cc.LayerColor.CanvasRenderCmd.call(this, renderable);
        this._needDraw = true;
        this._startPoint = cc.p(0, 0);
        this._endPoint = cc.p(0, 0);
        this._startStopStr = null;
        this._endStopStr = null;
    };
    var proto = cc.LayerGradient.CanvasRenderCmd.prototype = Object.create(cc.LayerColor.CanvasRenderCmd.prototype);
    proto.constructor = cc.LayerGradient.CanvasRenderCmd;

    proto.rendering = function (ctx, scaleX, scaleY) {
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

    proto._updateColor = function(){
        var _t = this;
        var locAlongVector = _t._alongVector, tWidth = _t.width * 0.5, tHeight = _t.height * 0.5;

        var locCmd = this._renderCmd;
        locCmd._startPoint.x = tWidth * (-locAlongVector.x) + tWidth;
        locCmd._startPoint.y = tHeight * locAlongVector.y - tHeight;
        locCmd._endPoint.x = tWidth * locAlongVector.x + tWidth;
        locCmd._endPoint.y = tHeight * (-locAlongVector.y) - tHeight;

        var locStartColor = this._displayedColor, locEndColor = this._endColor, opacity = this._displayedOpacity / 255;
        var startOpacity = this._startOpacity, endOpacity = this._endOpacity;
        locCmd._startStopStr = "rgba(" + Math.round(locStartColor.r) + "," + Math.round(locStartColor.g) + ","
            + Math.round(locStartColor.b) + "," + startOpacity.toFixed(4) + ")";
        locCmd._endStopStr = "rgba(" + Math.round(locEndColor.r) + "," + Math.round(locEndColor.g) + ","
            + Math.round(locEndColor.b) + "," + endOpacity.toFixed(4) + ")";
    };

})();


/**
 * cc.Layer's rendering objects of WebGL
 */
(function(){
    cc.Layer.WebGLRenderCmd = function(renderable){
        cc.Node.WebGLRenderCmd.call(this, renderable);
    };

    var proto = cc.Layer.WebGLRenderCmd.prototype = Object.create(cc.Node.WebGLRenderCmd.prototype);
    proto.constructor = cc.Layer.WebGLRenderCmd;

    proto.bake = function(){};

    proto.unbake = function(){};

    proto.unbake = function(){
        return false;
    };

    proto.visit = cc.Node.prototype.visit;

    proto._bakeForAddChild = function(){};
})();

/**
 * cc.LayerColor's rendering objects of WebGL
 */
(function(){

    cc.LayerColor.WebGLRenderCmd = function(renderable){
        cc.Layer.WebGLRenderCmd.call(this, renderable);
        this._needDraw = true;

        //
        var _t = this;
        _t._squareVerticesAB = new ArrayBuffer(32);
        _t._squareColorsAB = new ArrayBuffer(16);

        var locSquareVerticesAB = _t._squareVerticesAB, locSquareColorsAB = _t._squareColorsAB;
        var locVertex2FLen = cc.Vertex2F.BYTES_PER_ELEMENT, locColorLen = cc.Color.BYTES_PER_ELEMENT;
        _t._squareVertices = [new cc.Vertex2F(0, 0, locSquareVerticesAB, 0),
            new cc.Vertex2F(0, 0, locSquareVerticesAB, locVertex2FLen),
            new cc.Vertex2F(0, 0, locSquareVerticesAB, locVertex2FLen * 2),
            new cc.Vertex2F(0, 0, locSquareVerticesAB, locVertex2FLen * 3)];
        _t._squareColors = [cc.color(0, 0, 0, 255, locSquareColorsAB, 0),
            cc.color(0, 0, 0, 255, locSquareColorsAB, locColorLen),
            cc.color(0, 0, 0, 255, locSquareColorsAB, locColorLen * 2),
            cc.color(0, 0, 0, 255, locSquareColorsAB, locColorLen * 3)];
        _t._verticesFloat32Buffer = cc._renderContext.createBuffer();
        _t._colorsUint8Buffer = cc._renderContext.createBuffer();
    };
    var proto = cc.LayerColor.WebGLRenderCmd.prototype = Object.create(cc.Layer.WebGLRenderCmd.prototype);
    proto.constructor = cc.LayerColor.WebGLRenderCmd;

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

    proto._updataSquareVertices = function(size, height){
        var locSquareVertices = this._squareVertices;
        if (height === undefined) {
            locSquareVertices[1].x = size.width;
            locSquareVertices[2].y = size.height;
            locSquareVertices[3].x = size.width;
            locSquareVertices[3].y = size.height;
        } else {
            locSquareVertices[1].x = size;
            locSquareVertices[2].y = height;
            locSquareVertices[3].x = size;
            locSquareVertices[3].y = height;
        }
        this._bindLayerVerticesBufferData();
    };

    proto._updateSquareVerticesWidth = function(width){
        var locSquareVertices = this._squareVertices;
        locSquareVertices[1].x = width;
        locSquareVertices[3].x = width;
        this._bindLayerVerticesBufferData();
    };

    proto._updateSquareVerticesHeight = function(height){
        var locSquareVertices = this._squareVertices;
        locSquareVertices[2].y = height;
        locSquareVertices[3].y = height;
        this._bindLayerVerticesBufferData();
    };

    proto._updateColor = function(){
        var locDisplayedColor = this._displayedColor;
        var locDisplayedOpacity = this._displayedOpacity, locSquareColors = this._squareColors;
        for (var i = 0; i < 4; i++) {
            locSquareColors[i].r = locDisplayedColor.r;
            locSquareColors[i].g = locDisplayedColor.g;
            locSquareColors[i].b = locDisplayedColor.b;
            locSquareColors[i].a = locDisplayedOpacity;
        }
        this._bindLayerColorsBufferData();
        this.setDirtyFlag(cc.Node._dirtyFlags.colorDirty);
    };

    proto.draw = function(){
        var context = ctx || cc._renderContext;

        cc.nodeDrawSetup(this);
        cc.glEnableVertexAttribs(cc.VERTEX_ATTRIB_FLAG_POSITION | cc.VERTEX_ATTRIB_FLAG_COLOR);

        //
        // Attributes
        //
        context.bindBuffer(context.ARRAY_BUFFER, this._verticesFloat32Buffer);
        context.vertexAttribPointer(cc.VERTEX_ATTRIB_POSITION, 2, context.FLOAT, false, 0, 0);

        context.bindBuffer(context.ARRAY_BUFFER, this._colorsUint8Buffer);
        context.vertexAttribPointer(cc.VERTEX_ATTRIB_COLOR, 4, context.UNSIGNED_BYTE, true, 0, 0);

        cc.glBlendFunc(this._blendFunc.src, this._blendFunc.dst);
        context.drawArrays(context.TRIANGLE_STRIP, 0, 4);
    };

    proto._bindLayerVerticesBufferData = function(){
        var glContext = cc._renderContext;
        glContext.bindBuffer(glContext.ARRAY_BUFFER, this._verticesFloat32Buffer);
        glContext.bufferData(glContext.ARRAY_BUFFER, this._squareVerticesAB, glContext.STATIC_DRAW);
    };

    proto._bindLayerColorsBufferData = function(){
        var glContext = cc._renderContext;
        glContext.bindBuffer(glContext.ARRAY_BUFFER, this._colorsUint8Buffer);
        glContext.bufferData(glContext.ARRAY_BUFFER, this._squareColorsAB, glContext.STATIC_DRAW);
    };

})();

/**
 * cc.LayerGradient's rendering objects of WebGL
 */
(function(){
    cc.LayerGradient.WebGLRenderCmd = function(renderable){
        cc.LayerColor.WebGLRenderCmd.call(this, renderable);
        this._needDraw = true;
    };
    var proto = cc.LayerGradient.WebGLRenderCmd.prototype = Object.create(cc.LayerColor.WebGLRenderCmd.prototype);
    proto.constructor = cc.LayerGradient.WebGLRenderCmd;

    proto._updateColor = function(){
        var _t = this;
        var locAlongVector = _t._alongVector;
        var h = cc.pLength(locAlongVector);
        if (h === 0)
            return;

        var c = Math.sqrt(2.0), u = cc.p(locAlongVector.x / h, locAlongVector.y / h);

        // Compressed Interpolation mode
        if (_t._compressedInterpolation) {
            var h2 = 1 / ( Math.abs(u.x) + Math.abs(u.y) );
            u = cc.pMult(u, h2 * c);
        }

        var opacityf = _t._displayedOpacity / 255.0;
        var locDisplayedColor = _t._displayedColor, locEndColor = _t._endColor;
        var S = { r: locDisplayedColor.r, g: locDisplayedColor.g, b: locDisplayedColor.b, a: _t._startOpacity * opacityf};
        var E = {r: locEndColor.r, g: locEndColor.g, b: locEndColor.b, a: _t._endOpacity * opacityf};

        // (-1, -1)
        var locSquareColors = _t._squareColors;
        var locSquareColor0 = locSquareColors[0], locSquareColor1 = locSquareColors[1], locSquareColor2 = locSquareColors[2], locSquareColor3 = locSquareColors[3];
        locSquareColor0.r = ((E.r + (S.r - E.r) * ((c + u.x + u.y) / (2.0 * c))));
        locSquareColor0.g = ((E.g + (S.g - E.g) * ((c + u.x + u.y) / (2.0 * c))));
        locSquareColor0.b = ((E.b + (S.b - E.b) * ((c + u.x + u.y) / (2.0 * c))));
        locSquareColor0.a = ((E.a + (S.a - E.a) * ((c + u.x + u.y) / (2.0 * c))));
        // (1, -1)
        locSquareColor1.r = ((E.r + (S.r - E.r) * ((c - u.x + u.y) / (2.0 * c))));
        locSquareColor1.g = ((E.g + (S.g - E.g) * ((c - u.x + u.y) / (2.0 * c))));
        locSquareColor1.b = ((E.b + (S.b - E.b) * ((c - u.x + u.y) / (2.0 * c))));
        locSquareColor1.a = ((E.a + (S.a - E.a) * ((c - u.x + u.y) / (2.0 * c))));
        // (-1, 1)
        locSquareColor2.r = ((E.r + (S.r - E.r) * ((c + u.x - u.y) / (2.0 * c))));
        locSquareColor2.g = ((E.g + (S.g - E.g) * ((c + u.x - u.y) / (2.0 * c))));
        locSquareColor2.b = ((E.b + (S.b - E.b) * ((c + u.x - u.y) / (2.0 * c))));
        locSquareColor2.a = ((E.a + (S.a - E.a) * ((c + u.x - u.y) / (2.0 * c))));
        // (1, 1)
        locSquareColor3.r = ((E.r + (S.r - E.r) * ((c - u.x - u.y) / (2.0 * c))));
        locSquareColor3.g = ((E.g + (S.g - E.g) * ((c - u.x - u.y) / (2.0 * c))));
        locSquareColor3.b = ((E.b + (S.b - E.b) * ((c - u.x - u.y) / (2.0 * c))));
        locSquareColor3.a = ((E.a + (S.a - E.a) * ((c - u.x - u.y) / (2.0 * c))));

        _t._bindLayerColorsBufferData();
    };
})();