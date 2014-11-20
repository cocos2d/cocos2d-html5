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
 * cc.ProgressTimer's rendering objects of Canvas
 */
(function(){

    cc.ProgressTimer.CanvasRenderCmd = function(renderableObject){
        cc.Node.CanvasRenderCmd.call(this, renderableObject);
        this._needDraw = true;

        this._PI180 = Math.PI / 180;
        this._barRect = cc.rect(0, 0, 0, 0);
        this._origin = cc.p(0, 0);
        this._radius = 0;
        this._startAngle = 270;
        this._endAngle = 270;
        this._counterClockWise = false;
    };

    var proto = cc.ProgressTimer.CanvasRenderCmd.prototype = Object.create(cc.Node.CanvasRenderCmd.prototype);
    proto.constructor = cc.ProgressTimer.CanvasRenderCmd;

    proto.rendering = function (ctx, scaleX, scaleY) {
        var context = ctx || cc._renderContext, node = this._node, locSprite = node._sprite;

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
        if (node._type == cc.ProgressTimer.TYPE_BAR) {
            var locBarRect = this._barRect;
            context.beginPath();
            context.rect(locBarRect.x * scaleX, locBarRect.y * scaleY, locBarRect.width * scaleX, locBarRect.height * scaleY);
            context.clip();
            context.closePath();
        } else if (node._type == cc.ProgressTimer.TYPE_RADIAL) {
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
        if (locSprite._colorized) {
            context.drawImage(image,
                0,
                0,
                locTextureCoord.width,
                locTextureCoord.height,
                flipXOffset, flipYOffset,
                locDrawSizeCanvas.width,
                locDrawSizeCanvas.height
            );
        } else {
            context.drawImage(image,
                locTextureCoord.renderX,
                locTextureCoord.renderY,
                locTextureCoord.width,
                locTextureCoord.height,
                flipXOffset, flipYOffset,
                locDrawSizeCanvas.width,
                locDrawSizeCanvas.height
            );
        }

        context.restore();
        cc.g_NumberOfDraws++;
    };

    proto.setReverseProgress = function(reverse){
        var node = this._node;
        if (node._reverseDirection !== reverse)
            node._reverseDirection = reverse;
    };

    proto.setSprite = function(sprite){
        var node = this._node;
        if (node._sprite != sprite) {
            node._sprite = sprite;
            node.width = node._sprite.width;
            node.height = node._sprite.height;
        }
    };

    proto.setType = function(type){
        var node = this._node;
        if (type !== node._type){
            node._type = type;
            node._renderCmd._type = type;
        }
    };

    proto.setReverseDirection = function(reverse){
        var node = this._node;
        if (node._reverseDirection !== reverse)
            node._reverseDirection = reverse;
    };

    proto.initWithSprite = function(sprite){
        var node = this._node;
        node.percentage = 0;
        node.anchorX = 0.5;
        node.anchorY = 0.5;

        node._type = cc.ProgressTimer.TYPE_RADIAL;
        node._reverseDirection = false;
        node.midPoint = cc.p(0.5, 0.5);
        node.barChangeRate = cc.p(1, 1);
        node.sprite = sprite;

        return true;
    };

    proto.draw = function(){};

    proto._updateProgress = function(){
        var node = this._node;
        var locSprite = node._sprite;
        var sw = locSprite.width, sh = locSprite.height;
        var locMidPoint = node._midPoint;
        var locCmd = this;

        if (node._type == cc.ProgressTimer.TYPE_RADIAL) {
            locCmd._radius = Math.round(Math.sqrt(sw * sw + sh * sh));
            var locStartAngle, locEndAngle, locCounterClockWise = false, locOrigin = locCmd._origin;
            locOrigin.x = sw * locMidPoint.x;
            locOrigin.y = -sh * locMidPoint.y;

            if (node._reverseDirection) {
                locEndAngle = 270;
                locStartAngle = 270 - 3.6 * node._percentage;
            } else {
                locStartAngle = -90;
                locEndAngle = -90 + 3.6 * node._percentage;
            }

            if (locSprite._flippedX) {
                locOrigin.x -= sw * (node._midPoint.x * 2);
                locStartAngle= -locStartAngle;
                locEndAngle= -locEndAngle;
                locStartAngle -= 180;
                locEndAngle -= 180;
                locCounterClockWise = !locCounterClockWise;
            }
            if (locSprite._flippedY) {
                locOrigin.y+=sh*(node._midPoint.y*2);
                locCounterClockWise = !locCounterClockWise;
                locStartAngle= -locStartAngle;
                locEndAngle= -locEndAngle;
            }

            locCmd._startAngle = locStartAngle;
            locCmd._endAngle = locEndAngle;
            locCmd._counterClockWise = locCounterClockWise;
        } else {
            var locBarChangeRate = node._barChangeRate;
            var percentageF = node._percentage / 100;
            var locBarRect = locCmd._barRect;

            var drawedSize = cc.size((sw * (1 - locBarChangeRate.x)), (sh * (1 - locBarChangeRate.y)));
            var drawingSize = cc.size((sw - drawedSize.width) * percentageF, (sh - drawedSize.height) * percentageF);
            var currentDrawSize = cc.size(drawedSize.width + drawingSize.width, drawedSize.height + drawingSize.height);

            var startPoint = cc.p(sw * locMidPoint.x, sh * locMidPoint.y);

            var needToLeft = startPoint.x - currentDrawSize.width / 2;
            if ((locMidPoint.x > 0.5) && (currentDrawSize.width / 2 >= sw - startPoint.x)) {
                needToLeft = sw - currentDrawSize.width;
            }

            var needToTop = startPoint.y - currentDrawSize.height / 2;
            if ((locMidPoint.y > 0.5) && (currentDrawSize.height / 2 >= sh - startPoint.y)) {
                needToTop = sh - currentDrawSize.height;
            }

            //left pos
            locBarRect.x = 0;
            var flipXNeed = 1;
            if (locSprite._flippedX) {
                locBarRect.x -= currentDrawSize.width;
                flipXNeed = -1;
            }

            if (needToLeft > 0)
                locBarRect.x += needToLeft * flipXNeed;

            //right pos
            locBarRect.y = 0;
            var flipYNeed = 1;
            if (locSprite._flippedY) {
                locBarRect.y += currentDrawSize.height;
                flipYNeed = -1;
            }

            if (needToTop > 0)
                locBarRect.y -= needToTop * flipYNeed;

            //clip width and clip height
            locBarRect.width = currentDrawSize.width;
            locBarRect.height = -currentDrawSize.height;
        }
    };
})();


/**
 * cc.ProgressTimer's rendering objects of WebGL
 */
(function(){
    cc.ProgressTimer.WebGLRenderCmd = function(renderableObject){
        cc.Node.WebGLRenderCmd.call(this, renderableObject);
        this._needDraw = true;

        this._PI180 = Math.PI / 180;
        this._type = cc.ProgressTimer.TYPE_RADIAL;
        this._barRect = cc.rect(0, 0, 0, 0);
        this._origin = cc.p(0, 0);
        this._radius = 0;
        this._startAngle = 270;
        this._endAngle = 270;
        this._counterClockWise = false;

        this._vertexWebGLBuffer = cc._renderContext.createBuffer();
        this._vertexDataCount = 0;
        this._vertexData = null;
        this._vertexArrayBuffer = null;
        this._vertexDataDirty = false;
    };

    var proto = cc.ProgressTimer.WebGLRenderCmd.prototype = Object.create(cc.Node.WebGLRenderCmd.prototype);
    proto.constructor = cc.ProgressTimer.WebGLRenderCmd;

    proto.rendering = function (ctx) {
        var _t = this._node;
        var context = ctx || cc._renderContext;
        if (!this._vertexData || !_t._sprite)
            return;

        _t._shaderProgram.use();
        _t._shaderProgram._setUniformForMVPMatrixWithMat4(_t._stackMatrix);

        var blendFunc = _t._sprite.getBlendFunc();
        cc.glBlendFunc(blendFunc.src, blendFunc.dst);
        cc.glEnableVertexAttribs(cc.VERTEX_ATTRIB_FLAG_POS_COLOR_TEX);

        cc.glBindTexture2D(_t._sprite.texture);

        context.bindBuffer(context.ARRAY_BUFFER, this._vertexWebGLBuffer);
        if (this._vertexDataDirty) {
            context.bufferData(context.ARRAY_BUFFER, this._vertexArrayBuffer, context.DYNAMIC_DRAW);
            this._vertexDataDirty = false;
        }
        var locVertexDataLen = cc.V2F_C4B_T2F.BYTES_PER_ELEMENT;
        context.vertexAttribPointer(cc.VERTEX_ATTRIB_POSITION, 2, context.FLOAT, false, locVertexDataLen, 0);
        context.vertexAttribPointer(cc.VERTEX_ATTRIB_COLOR, 4, context.UNSIGNED_BYTE, true, locVertexDataLen, 8);
        context.vertexAttribPointer(cc.VERTEX_ATTRIB_TEX_COORDS, 2, context.FLOAT, false, locVertexDataLen, 12);

        if (this._type === cc.ProgressTimer.TYPE_RADIAL)
            context.drawArrays(context.TRIANGLE_FAN, 0, this._vertexDataCount);
        else if (this._type == cc.ProgressTimer.TYPE_BAR) {
            if (!_t._reverseDirection)
                context.drawArrays(context.TRIANGLE_STRIP, 0, this._vertexDataCount);
            else {
                context.drawArrays(context.TRIANGLE_STRIP, 0, this._vertexDataCount / 2);
                context.drawArrays(context.TRIANGLE_STRIP, 4, this._vertexDataCount / 2);
                // 2 draw calls
                cc.g_NumberOfDraws++;
            }
        }
        cc.g_NumberOfDraws++;
    };

    proto.setReverseProgress = function(reverse){
        var node = this._node;
        if (node._reverseDirection !== reverse) {
            node._reverseDirection = reverse;

            //    release all previous information
            this._vertexData = null;
            this._vertexArrayBuffer = null;
            this._vertexDataCount = 0;
        }
    };

    proto.setSprite = function(sprite){
        var node = this._node;
        if (sprite && node._sprite != sprite) {
            node._sprite = sprite;
            node.width = sprite.width;
            node.height = sprite.height;

            //	Everytime we set a new sprite, we free the current vertex data
            if (this._vertexData) {
                this._vertexData = null;
                this._vertexArrayBuffer = null;
                this._vertexDataCount = 0;
            }
        }
    };

    proto.setType = function(type){
        var node = this._node;
        if (type !== this._type) {
            //	release all previous information
            if (this._vertexData) {
                this._vertexData = null;
                node._vertexArrayBuffer = null;
                this._vertexDataCount = 0;
            }
            node._type = type;
        }
    };

    proto.setReverseDirection = function(reverse){
        var node = this._node;
        if (node._reverseDirection !== reverse) {
            node._reverseDirection = reverse;
            //release all previous information
            this._vertexData = null;
            this._vertexArrayBuffer = null;
            this._vertexDataCount = 0;
        }
    };

    proto.initWithSprite = function(sprite){
        var node = this._node;
        node.percentage = 0;
        this._vertexData = null;
        this._vertexArrayBuffer = null;
        this._vertexDataCount = 0;
        node.anchorX = 0.5;
        node.anchorY = 0.5;

        node._type = cc.ProgressTimer.TYPE_RADIAL;
        node._reverseDirection = false;
        node.midPoint = cc.p(0.5, 0.5);
        node.barChangeRate = cc.p(1, 1);
        node.sprite = sprite;

        //shader program
        node.shaderProgram = cc.shaderCache.programForKey(cc.SHADER_POSITION_TEXTURECOLOR);
        return true;
    };

    proto.draw = function(ctx){
        var node = this._node;
        var context = ctx || cc._renderContext;
        if (!this._vertexData || !node._sprite)
            return;

        cc.nodeDrawSetup(node);

        var blendFunc = node._sprite.getBlendFunc();
        cc.glBlendFunc(blendFunc.src, blendFunc.dst);
        cc.glEnableVertexAttribs(cc.VERTEX_ATTRIB_FLAG_POS_COLOR_TEX);

        cc.glBindTexture2D(node._sprite.texture);

        context.bindBuffer(context.ARRAY_BUFFER, this._vertexWebGLBuffer);
        if(this._vertexDataDirty){
            context.bufferData(context.ARRAY_BUFFER, this._vertexArrayBuffer, context.DYNAMIC_DRAW);
            this._vertexDataDirty = false;
        }
        var locVertexDataLen = cc.V2F_C4B_T2F.BYTES_PER_ELEMENT;
        context.vertexAttribPointer(cc.VERTEX_ATTRIB_POSITION, 2, context.FLOAT, false, locVertexDataLen, 0);
        context.vertexAttribPointer(cc.VERTEX_ATTRIB_COLOR, 4, context.UNSIGNED_BYTE, true, locVertexDataLen, 8);
        context.vertexAttribPointer(cc.VERTEX_ATTRIB_TEX_COORDS, 2, context.FLOAT, false, locVertexDataLen, 12);

        if (node._type === cc.ProgressTimer.TYPE_RADIAL)
            context.drawArrays(context.TRIANGLE_FAN, 0, this._vertexDataCount);
        else if (node._type == cc.ProgressTimer.TYPE_BAR) {
            if (!node._reverseDirection)
                context.drawArrays(context.TRIANGLE_STRIP, 0, this._vertexDataCount);
            else {
                context.drawArrays(context.TRIANGLE_STRIP, 0, this._vertexDataCount / 2);
                context.drawArrays(context.TRIANGLE_STRIP, 4, this._vertexDataCount / 2);
                // 2 draw calls
                cc.g_NumberOfDraws++;
            }
        }
        cc.g_NumberOfDraws++;
    };

    proto._updateProgress = function(){
        var node = this._node;
        var locType = node._type;
        if(locType === cc.ProgressTimer.TYPE_RADIAL)
            node._updateRadial();
        else if(locType === cc.ProgressTimer.TYPE_BAR)
            node._updateBar();
        this._vertexDataDirty = true;
    };

    /**
     * <p>
     *    Update does the work of mapping the texture onto the triangles for the bar                            <br/>
     *    It now doesn't occur the cost of free/alloc data every update cycle.                                  <br/>
     *    It also only changes the percentage point but no other points if they have not been modified.         <br/>
     *                                                                                                          <br/>
     *    It now deals with flipped texture. If you run into this problem, just use the                         <br/>
     *    sprite property and enable the methods flipX, flipY.                                                  <br/>
     * </p>
     * @private
     */
    proto._updateBar = function(){
        var node = this._node;
        if (!node._sprite)
            return;

        var i;
        var alpha = node._percentage / 100.0;
        var locBarChangeRate = node._barChangeRate;
        var alphaOffset = cc.pMult(cc.p((1.0 - locBarChangeRate.x) + alpha * locBarChangeRate.x,
                (1.0 - locBarChangeRate.y) + alpha * locBarChangeRate.y), 0.5);
        var min = cc.pSub(node._midPoint, alphaOffset);
        var max = cc.pAdd(node._midPoint, alphaOffset);

        if (min.x < 0) {
            max.x += -min.x;
            min.x = 0;
        }

        if (max.x > 1) {
            min.x -= max.x - 1;
            max.x = 1;
        }

        if (min.y < 0) {
            max.y += -min.y;
            min.y = 0;
        }

        if (max.y > 1) {
            min.y -= max.y - 1;
            max.y = 1;
        }

        var locVertexData;
        if (!this._reverseDirection) {
            if (!this._vertexData) {
                this._vertexDataCount = 4;
                var vertexDataLen = cc.V2F_C4B_T2F.BYTES_PER_ELEMENT, locCount = 4;
                this._vertexArrayBuffer = new ArrayBuffer(locCount * vertexDataLen);
                this._vertexData = [];
                for (i = 0; i < locCount; i++)
                    this._vertexData[i] = new cc.V2F_C4B_T2F(null, null, null, this._vertexArrayBuffer, i * vertexDataLen);
            }

            locVertexData = this._vertexData;
            //    TOPLEFT
            locVertexData[0].texCoords = node._textureCoordFromAlphaPoint(cc.p(min.x, max.y));
            locVertexData[0].vertices = node._vertexFromAlphaPoint(cc.p(min.x, max.y));

            //    BOTLEFT
            locVertexData[1].texCoords = node._textureCoordFromAlphaPoint(cc.p(min.x, min.y));
            locVertexData[1].vertices = node._vertexFromAlphaPoint(cc.p(min.x, min.y));

            //    TOPRIGHT
            locVertexData[2].texCoords = node._textureCoordFromAlphaPoint(cc.p(max.x, max.y));
            locVertexData[2].vertices = node._vertexFromAlphaPoint(cc.p(max.x, max.y));

            //    BOTRIGHT
            locVertexData[3].texCoords = node._textureCoordFromAlphaPoint(cc.p(max.x, min.y));
            locVertexData[3].vertices = node._vertexFromAlphaPoint(cc.p(max.x, min.y));
        } else {
            if (!this._vertexData) {
                this._vertexDataCount = 8;
                var rVertexDataLen = cc.V2F_C4B_T2F.BYTES_PER_ELEMENT, rLocCount = 8;
                this._vertexArrayBuffer = new ArrayBuffer(rLocCount * rVertexDataLen);
                var rTempData = [];
                for (i = 0; i < rLocCount; i++)
                    rTempData[i] = new cc.V2F_C4B_T2F(null, null, null, this._vertexArrayBuffer, i * rVertexDataLen);
                //    TOPLEFT 1
                rTempData[0].texCoords = node._textureCoordFromAlphaPoint(cc.p(0, 1));
                rTempData[0].vertices = node._vertexFromAlphaPoint(cc.p(0, 1));

                //    BOTLEFT 1
                rTempData[1].texCoords = node._textureCoordFromAlphaPoint(cc.p(0, 0));
                rTempData[1].vertices = node._vertexFromAlphaPoint(cc.p(0, 0));

                //    TOPRIGHT 2
                rTempData[6].texCoords = node._textureCoordFromAlphaPoint(cc.p(1, 1));
                rTempData[6].vertices = node._vertexFromAlphaPoint(cc.p(1, 1));

                //    BOTRIGHT 2
                rTempData[7].texCoords = node._textureCoordFromAlphaPoint(cc.p(1, 0));
                rTempData[7].vertices = node._vertexFromAlphaPoint(cc.p(1, 0));

                this._vertexData = rTempData;
            }

            locVertexData = this._vertexData;
            //    TOPRIGHT 1
            locVertexData[2].texCoords = node._textureCoordFromAlphaPoint(cc.p(min.x, max.y));
            locVertexData[2].vertices = node._vertexFromAlphaPoint(cc.p(min.x, max.y));

            //    BOTRIGHT 1
            locVertexData[3].texCoords = node._textureCoordFromAlphaPoint(cc.p(min.x, min.y));
            locVertexData[3].vertices = node._vertexFromAlphaPoint(cc.p(min.x, min.y));

            //    TOPLEFT 2
            locVertexData[4].texCoords = node._textureCoordFromAlphaPoint(cc.p(max.x, max.y));
            locVertexData[4].vertices = node._vertexFromAlphaPoint(cc.p(max.x, max.y));

            //    BOTLEFT 2
            locVertexData[5].texCoords = node._textureCoordFromAlphaPoint(cc.p(max.x, min.y));
            locVertexData[5].vertices = node._vertexFromAlphaPoint(cc.p(max.x, min.y));
        }
        this._updateColor();
    };

    proto._updateColor = function(){
        var node = this._node;
        if (!node._sprite || !this._vertexData)
            return;

        var sc = node._sprite.quad.tl.colors;
        var locVertexData = this._vertexData;
        for (var i = 0, len = this._vertexDataCount; i < len; ++i)
            locVertexData[i].colors = sc;
        this._vertexDataDirty = true;
    };
})();