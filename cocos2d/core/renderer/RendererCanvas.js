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

if (cc._renderType === cc._RENDER_TYPE_CANVAS) {
    cc.rendererCanvas = {
        childrenOrderDirty: true,
        _transformNodePool: [],                              //save nodes transform dirty
        _renderCmds: [],                                     //save renderer commands

        _isCacheToCanvasOn: false,                          //a switch that whether cache the rendererCmd to cacheToCanvasCmds
        _cacheToCanvasCmds: [],                              // an array saves the renderer commands need for cache to other canvas

        /**
         * drawing all renderer command to context (default is cc._renderContext)
         * @param {CanvasRenderingContext2D} [ctx=cc._renderContext]
         */
        rendering: function (ctx) {
            var locCmds = this._renderCmds,
                i,
                len,
                scaleX = cc.view.getScaleX(),
                scaleY = cc.view.getScaleY();
            var context = ctx || cc._renderContext;
            for (i = 0, len = locCmds.length; i < len; i++) {
                locCmds[i].rendering(context, scaleX, scaleY);
            }
        },

        /**
         * drawing all renderer command to cache canvas' context
         * @param {CanvasRenderingContext2D} ctx
         */
        _renderingToCacheCanvas: function (ctx) {
            var locCmds = this._cacheToCanvasCmds, i, len;
            if (!ctx)
                cc.log("The context of RenderTexture is invalid.");
            for (i = 0, len = locCmds.length; i < len; i++) {
                locCmds[i].rendering(ctx, 1, 1);
            }

            locCmds.length = 0;
            this._isCacheToCanvasOn = false;
        },

        resetFlag: function () {
            this.childrenOrderDirty = false;
            this._transformNodePool.length = 0;
        },

        transform: function () {
            var locPool = this._transformNodePool;
            //sort the pool
            locPool.sort(this._sortNodeByLevelAsc);

            //transform node
            for (var i = 0, len = locPool.length; i < len; i++) {
                if (locPool[i]._renderCmdDiry)        //TODO need modify name for LabelTTF
                    locPool[i]._transformForRenderer();
            }
            locPool.length = 0;
        },

        transformDirty: function () {
            return this._transformNodePool.length > 0;
        },

        _sortNodeByLevelAsc: function (n1, n2) {
            return n1._curLevel - n2._curLevel;
        },

        pushDirtyNode: function (node) {
            //if (this._transformNodePool.indexOf(node) === -1)
            this._transformNodePool.push(node);
        },

        clearRenderCommands: function () {
            this._renderCmds.length = 0;
        },

        pushRenderCommand: function (cmd) {
            if (this._isCacheToCanvasOn) {
                if (this._cacheToCanvasCmds.indexOf(cmd) === -1)
                    this._cacheToCanvasCmds.push(cmd);
            } else {
                if (this._renderCmds.indexOf(cmd) === -1)
                    this._renderCmds.push(cmd);
            }
        }
    };
    cc.renderer = cc.rendererCanvas;

    cc.TextureRenderCmdCanvas = function (node) {
        this._node = node;

        this._transform = node._transformWorld;         //reference of node's transformWorld
        this._texture = null;
        this._isLighterMode = false;
        this._opacity = 1;
        this._textureCoord = {
            renderX: 0,                             //the x of texture coordinate for render, when texture tinted, its value doesn't equal x.
            renderY: 0,                             //the y of texture coordinate for render, when texture tinted, its value doesn't equal y.
            x: 0,                                   //the x of texture coordinate for node.
            y: 0,                                   //the y of texture coordinate for node.
            width: 0,
            height: 0,
            validRect: false                       //
        };
        this._drawingRect = cc.rect(0, 0, 0, 0);
    };

    cc.TextureRenderCmdCanvas.prototype.rendering = function (ctx, scaleX, scaleY) {
        var _t = this;
        var _node = _t._node;
        var context = ctx || cc._renderContext,
            locTextureCoord = _t._textureCoord;
        if (!locTextureCoord.validRect || !_node._visible)
            return;  //draw nothing

        var t = this._transform, locDrawingRect = _t._drawingRect, image, curColor;
        if (t.a !== 1 || t.b !== 0 || t.c !== 0 || t.d !== 1 || _node._flippedX || _node._flippedY) {
            context.save();
            //transform
            context.transform(t.a, t.c, t.b, t.d, t.tx * scaleX, -t.ty * scaleY);

            if (_t._isLighterMode)
                context.globalCompositeOperation = 'lighter';

            if (_node._flippedX)
                context.scale(-1, 1);
            if (_node._flippedY)
                context.scale(1, -1);

            if (_t._texture && locTextureCoord.validRect) {
                if (_t._texture._isLoaded) {
                    context.globalAlpha = _t._opacity;
                    image = _t._texture._htmlElementObj;

                    context.drawImage(image,
                        locTextureCoord.renderX,
                        locTextureCoord.renderY,
                        locTextureCoord.width,
                        locTextureCoord.height,
                        locDrawingRect.x,
                        locDrawingRect.y,
                        locDrawingRect.width,
                        locDrawingRect.height
                    );

                }

            } else if (!_t._texture && locTextureCoord.validRect) {
                curColor = _t._color;
                context.fillStyle = "rgba(" + curColor.r + "," + curColor.g + "," + curColor.b + "," + _t._opacity + ")";
                context.fillRect(locDrawingRect.x, locDrawingRect.y, locDrawingRect.width, locDrawingRect.height);
            }
            context.restore();
        } else {
            if (_t._isLighterMode) {
                context.save();
                context.globalCompositeOperation = 'lighter';
            }

            if (_t._texture && locTextureCoord.validRect) {
                if (_t._texture._isLoaded) {
                    context.globalAlpha = _t._opacity;
                    image = _t._texture._htmlElementObj;
                    context.drawImage(
                        image,
                        locTextureCoord.renderX,
                        locTextureCoord.renderY,
                        locTextureCoord.width,
                        locTextureCoord.height,
                            t.tx * scaleX + locDrawingRect.x,
                            -t.ty * scaleY + locDrawingRect.y,
                        locDrawingRect.width,
                        locDrawingRect.height
                    );
                }
            } else if (!_t._texture && locTextureCoord.validRect && _node._displayedColor) {
                curColor = _node._displayedColor;
                context.fillStyle = "rgba(" + curColor.r + "," + curColor.g + "," + curColor.b + "," + _t._opacity + ")";
                context.fillRect(t.tx * scaleX + locDrawingRect.x, -t.ty * scaleY + locDrawingRect.y, locDrawingRect.width, locDrawingRect.height);
            }
            if (_t._isLighterMode)
                context.restore();
        }
        cc.g_NumberOfDraws++;
    };

    cc.RectRenderCmdCanvas = function (node) {
        this._node = node;

        this._transform = node._transformWorld; //{a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0};
        this._isLighterMode = false;
        this._drawingRect = cc.rect(0, 0, 0, 0);
        this._color = cc.color(255, 255, 255, 255);
    };

    cc.RectRenderCmdCanvas.prototype.rendering = function (ctx, scaleX, scaleY) {
        var context = ctx || cc._renderContext, t = this._transform, curColor = this._color, locRect = this._drawingRect;
        context.save();
        if (this._isLighterMode)
            context.globalCompositeOperation = 'lighter';
        //transform
        context.transform(t.a, t.c, t.b, t.d, t.tx * scaleX, -t.ty * scaleY);
        context.fillStyle = "rgba(" + (0 | curColor.r) + "," + (0 | curColor.g) + ","
            + (0 | curColor.b) + "," + curColor.a + ")";
        context.fillRect(locRect.x, locRect.y, locRect.width, -locRect.height);

        context.restore();
        cc.g_NumberOfDraws++;
    };

    cc.GradientRectRenderCmdCanvas = function (node) {
        this._node = node;

        this._transform = node._transformWorld; // {a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0};
        this._isLighterMode = false;
        this._opacity = 1;
        this._drawingRect = cc.rect(0, 0, 0, 0);
        this._startColor = cc.color(255, 255, 255, 255);
        this._endColor = cc.color(255, 255, 255, 255);
        this._startPoint = cc.p(0, 0);
        this._endPoint = cc.p(0, 0);
    };

    cc.GradientRectRenderCmdCanvas.prototype.rendering = function (ctx, scaleX, scaleY) {
        var context = ctx || cc._renderContext, _t = this, t = this._transform;
        context.save();
        if (_t._isLighterMode)
            context.globalCompositeOperation = 'lighter';
        //transform
        context.transform(t.a, t.c, t.b, t.d, t.tx * scaleX, -t.ty * scaleY);

        var opacity = _t._opacity, locRect = this._drawingRect;
        //TODO need cache gradient object
        var gradient = context.createLinearGradient(_t._startPoint.x, _t._startPoint.y, _t._endPoint.x, _t._endPoint.y);
        var locStartColor = _t._startColor, locEndColor = _t._endColor;
        gradient.addColorStop(0, "rgba(" + Math.round(locStartColor.r) + "," + Math.round(locStartColor.g) + ","
            + Math.round(locStartColor.b) + "," + (opacity * (locStartColor.a / 255)).toFixed(4) + ")");
        gradient.addColorStop(1, "rgba(" + Math.round(locEndColor.r) + "," + Math.round(locEndColor.g) + ","
            + Math.round(locEndColor.b) + "," + (opacity * (locEndColor.a / 255)).toFixed(4) + ")");
        context.fillStyle = gradient;
        context.fillRect(locRect.x, locRect.y, locRect.width, -locRect.height);

        context.restore();
        cc.g_NumberOfDraws++;
    };

    cc.ParticleRenderCmdCanvas = function (node) {
        this._node = node;

        this._transform = node._transformWorld;     //{a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0};
        this._isBlendAdditive = false;
        this._drawMode = cc.ParticleSystem.SHAPE_MODE;
        this._shapeType = cc.ParticleSystem.BALL_SHAPE;
        this._texture = null;
        this._pointRect = {x: 0, y: 0, width: 0, height: 0};
    };

    cc.ParticleRenderCmdCanvas.prototype.rendering = function (ctx, scaleX, scaleY) {
        var context = ctx || cc._renderContext, t = this._transform;
        context.save();
        //transform
        context.transform(t.a, t.c, t.b, t.d, t.tx * scaleX, -t.ty * scaleY);
        if (this._isBlendAdditive)
            context.globalCompositeOperation = 'lighter';
        else
            context.globalCompositeOperation = 'source-over';

        var i, particle, lpx;
        var particleCount = this._node.particleCount, particles = this._node._particles;
        if (this._drawMode == cc.ParticleSystem.TEXTURE_MODE) {
            // Delay drawing until the texture is fully loaded by the browser
            if (!this._texture || !this._texture._isLoaded) {
                context.restore();
                return;
            }
            var element = this._texture.getHtmlElementObj();
            if (!element.width || !element.height) {
                context.restore();
                return;
            }

            var textureCache = cc.textureCache, drawElement = element;
            for (i = 0; i < particleCount; i++) {
                particle = particles[i];
                lpx = (0 | (particle.size * 0.5));

                context.globalAlpha = particle.color.a / 255;

                context.save();
                context.translate((0 | particle.drawPos.x), -(0 | particle.drawPos.y));

                var size = Math.floor(particle.size / 4) * 4;
                var w = this._pointRect.width;
                var h = this._pointRect.height;

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
                        cc.generateTintImage(element, cacheTextureForColor, particle.color, this._pointRect, cacheTextureForColor.tintCache);
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
                context.globalAlpha = particle.color.a / 255;

                context.save();
                context.translate(0 | particle.drawPos.x, -(0 | particle.drawPos.y));
                if (this._shapeType == cc.ParticleSystem.STAR_SHAPE) {
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

// the canvas implement of renderCommand for cc.ProgressTimer
    cc.ProgressRenderCmdCanvas = function (node) {
        this._PI180 = Math.PI / 180;

        this._node = node;
        this._transform = node._transformWorld;
        this._sprite = null;
        this._type = cc.ProgressTimer.TYPE_RADIAL;
        this._barRect = cc.rect(0, 0, 0, 0);
        this._origin = cc.p(0, 0);
        this._radius = 0;
        this._startAngle = 270;
        this._endAngle = 270;
        this._counterClockWise = false;
    };

    cc.ProgressRenderCmdCanvas.prototype.rendering = function (ctx, scaleX, scaleY) {
        var context = ctx || cc._renderContext, locSprite = this._sprite;

        var locTextureCoord = locSprite._rendererCmd._textureCoord;
        if (!locSprite._texture || !locTextureCoord.validRect)
            return;

        var t = this._transform;
        context.save();
        context.transform(t.a, t.c, t.b, t.d, t.tx * scaleX, -t.ty * scaleY);

        if (locSprite._isLighterMode)
            context.globalCompositeOperation = 'lighter';

        context.globalAlpha = locSprite._displayedOpacity / 255;

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

// the canvas implement of renderCommand for cc.RenderTexture
    cc.RenderTextureRenderCmdCanvas = function (node) {
        this._node = node;

        this._transform = node._transformWorld;
        this._clearFlags = node.clearFlags;
        this.autoDraw = node.autoDraw;

        this._cacheCanvas = null;
        this._cacheContext = null;

        this._sprite = null;
    };

    cc.RenderTextureRenderCmdCanvas.prototype.rendering = function (ctx, scaleX, scaleY) {
        // auto draw flag
        var context = ctx || cc._renderContext;
        var locNode = this._node, cacheCanvas = this._cacheCanvas, cacheCtx = this._cacheContext;
        if (this.autoDraw) {
            locNode.begin();

            if (this._clearFlags) {
                cacheCtx.save();
                cacheCtx.fillStyle = this._clearColorStr;
                cacheCtx.clearRect(0, 0, cacheCanvas.width, -cacheCanvas.height);
                cacheCtx.fillRect(0, 0, cacheCanvas.width, -cacheCanvas.height);
                cacheCtx.restore();
            }

            //! make sure all children are drawn
            locNode.sortAllChildren();
            var locChildren = locNode._children;
            var childrenLen = locChildren.length;
            var selfSprite = this.sprite;
            for (var i = 0; i < childrenLen; i++) {
                var getChild = locChildren[i];
                if (getChild != selfSprite)
                    getChild.visit();
            }
            locNode.end();
        }
        cc.g_NumberOfDraws++;
    };

    cc.DrawNodeRenderCmdCanvas = function (node) {
        this._node = node;
        this._buffer = null;
        this._drawColor = null;
        this._blendFunc = null;
    };

    cc.DrawNodeRenderCmdCanvas.prototype.rendering = function (ctx, scaleX, scaleY) {
        var context = ctx || cc._renderContext, _t = this;
        if ((_t._blendFunc && (_t._blendFunc.src == cc.SRC_ALPHA) && (_t._blendFunc.dst == cc.ONE)))
            context.globalCompositeOperation = 'lighter';

        for (var i = 0; i < _t._buffer.length; i++) {
            var element = _t._buffer[i];
            switch (element.type) {
                case cc.DrawNode.TYPE_DOT:
                    _t._drawDot(context, element, scaleX, scaleY);
                    break;
                case cc.DrawNode.TYPE_SEGMENT:
                    _t._drawSegment(context, element, scaleX, scaleY);
                    break;
                case cc.DrawNode.TYPE_POLY:
                    _t._drawPoly(context, element, scaleX, scaleY);
                    break;
            }
        }
    };

    cc.DrawNodeRenderCmdCanvas.prototype._drawDot = function (ctx, element, scaleX, scaleY) {
        var locColor = element.fillColor, locPos = element.verts[0], locRadius = element.lineWidth;

        ctx.fillStyle = "rgba(" + (0 | locColor.r) + "," + (0 | locColor.g) + "," + (0 | locColor.b) + "," + locColor.a / 255 + ")";
        ctx.beginPath();
        ctx.arc(locPos.x * scaleX, -locPos.y * scaleY, locRadius * scaleX, 0, Math.PI * 2, false);
        ctx.closePath();
        ctx.fill();
    };

    cc.DrawNodeRenderCmdCanvas.prototype._drawSegment = function (ctx, element, scaleX, scaleY) {
        var locColor = element.lineColor;
        var locFrom = element.verts[0];
        var locTo = element.verts[1];
        var locLineWidth = element.lineWidth;
        var locLineCap = element.lineCap;

        ctx.strokeStyle = "rgba(" + (0 | locColor.r) + "," + (0 | locColor.g) + "," + (0 | locColor.b) + "," + locColor.a / 255 + ")";
        ctx.lineWidth = locLineWidth * scaleX;
        ctx.beginPath();
        ctx.lineCap = locLineCap;
        ctx.moveTo(locFrom.x * scaleX, -locFrom.y * scaleY);
        ctx.lineTo(locTo.x * scaleX, -locTo.y * scaleY);
        ctx.stroke();
    };

    cc.DrawNodeRenderCmdCanvas.prototype._drawPoly = function (ctx, element, scaleX, scaleY) {
        var _node = this._node;
        var locVertices = element.verts;
        var locLineCap = element.lineCap;
        var locFillColor = element.fillColor;
        var locLineWidth = element.lineWidth;
        var locLineColor = element.lineColor;
        var locIsClosePolygon = element.isClosePolygon;
        var locIsFill = element.isFill;
        var locIsStroke = element.isStroke;
        if (locVertices == null)
            return;

        var firstPoint = locVertices[0];

        ctx.lineCap = locLineCap;

        if (locFillColor) {
            ctx.fillStyle = "rgba(" + (0 | locFillColor.r) + "," + (0 | locFillColor.g) + ","
                + (0 | locFillColor.b) + "," + locFillColor.a / 255 + ")";
        }

        if (locLineWidth) {
            ctx.lineWidth = locLineWidth * scaleX;
        }
        if (locLineColor) {
            ctx.strokeStyle = "rgba(" + (0 | locLineColor.r) + "," + (0 | locLineColor.g) + ","
                + (0 | locLineColor.b) + "," + locLineColor.a / 255 + ")";
        }
        var t = _node._transformWorld;

        ctx.save();
        ctx.transform(t.a, t.c, t.b, t.d, t.tx * scaleX, -t.ty * scaleY);

        ctx.beginPath();
        ctx.moveTo(firstPoint.x * scaleX, -firstPoint.y * scaleY);
        for (var i = 1, len = locVertices.length; i < len; i++)
            ctx.lineTo(locVertices[i].x * scaleX, -locVertices[i].y * scaleY);

        if (locIsClosePolygon)
            ctx.closePath();

        if (locIsFill)
            ctx.fill();
        if (locIsStroke)
            ctx.stroke();
        ctx.restore();
    };

    cc.ClippingNodeSaveRenderCmdCanvas = function (node) {
        this._node = node;
    };

    cc.ClippingNodeSaveRenderCmdCanvas.prototype.rendering = function (ctx, scaleX, scaleY) {
        var node = this._node;
        var context = ctx || cc._renderContext;

        if (node._clipElemType) {
            var locCache = cc.ClippingNode._getSharedCache();
            var canvas = context.canvas;
            locCache.width = canvas.width;
            locCache.height = canvas.height;
            var locCacheCtx = locCache.getContext("2d");
            locCacheCtx.drawImage(canvas, 0, 0);
            context.save();
        } else {
            node.transform();
            var t = node._transformWorld;
            context.save();
            context.save();
            context.transform(t.a, t.c, t.b, t.d, t.tx * scaleX, -t.ty * scaleY);
        }
    };

    cc.ClippingNodeClipRenderCmdCanvas = function (node) {
        this._node = node;
    };

    cc.ClippingNodeClipRenderCmdCanvas.prototype.rendering = function (ctx, scaleX, scaleY) {
        var node = this._node;
        var context = ctx || cc._renderContext;

        if (node._clipElemType) {
            context.globalCompositeOperation = node.inverted ? "destination-out" : "destination-in";
            var t = node._transformWorld;
            context.transform(t.a, t.c, t.b, t.d, t.tx * scaleX, -t.ty * scaleY);
        } else {
            context.restore();
            if (node.inverted) {
                var canvas = context.canvas;
                context.save();

                context.setTransform(1, 0, 0, 1, 0, 0);

                context.moveTo(0, 0);
                context.lineTo(0, canvas.height);
                context.lineTo(canvas.width, canvas.height);
                context.lineTo(canvas.width, 0);
                context.lineTo(0, 0);

                context.restore();
            }
            context.clip();
        }
    };

    cc.ClippingNodeRestoreRenderCmdCanvas = function (node) {
        this._node = node;
    };

    cc.ClippingNodeRestoreRenderCmdCanvas.prototype.rendering = function (ctx, scaleX, scaleY) {

        var node = this._node;
        var i, children = node._children, locChild;
        var locCache = cc.ClippingNode._getSharedCache();
        var context = ctx || cc._renderContext;
        if (node._clipElemType) {
            context.restore();

            // Redraw the cached canvas, so that the cliped area shows the background etc.
            context.save();
            context.setTransform(1, 0, 0, 1, 0, 0);
            context.globalCompositeOperation = "destination-over";
            context.drawImage(locCache, 0, 0);
            context.restore();
        } else {
            // so if it has ClippingNode as a child, the child must uses composition stencil.
            node._cangodhelpme(true);
            var len = children.length;
            if (len > 0) {
                node.sortAllChildren();
                // draw children zOrder < 0
                for (i = 0; i < len; i++) {
                    locChild = children[i];
                    if (locChild._localZOrder < 0)
                        locChild.visit(context);
                    else
                        break;
                }
                node.draw(context);
                for (; i < len; i++) {
                    children[i].visit(context);
                }
            } else
                node.draw(context);
            node._cangodhelpme(false);
            context.restore();
        }
    };


//CHIPMUNK
    cc.PhysicsDebugNodeRenderCmdCanvas = function (node) {
        this._node = node;
        this._buffer = node._buffer;
    };

    cc.PhysicsDebugNodeRenderCmdCanvas.prototype.rendering = function (ctx, scaleX, scaleY) {
        var _node = this._node;

        if (!_node._space)
            return;

        _node._space.eachShape(cc.DrawShape.bind(_node));
        _node._space.eachConstraint(cc.DrawConstraint.bind(_node));
        cc.DrawNodeRenderCmdCanvas.prototype.rendering.call(this, ctx, scaleX, scaleY);
        _node.clear();
    };

    cc.PhysicsDebugNodeRenderCmdCanvas.prototype._drawDot = cc.DrawNodeRenderCmdCanvas.prototype._drawDot;
    cc.PhysicsDebugNodeRenderCmdCanvas.prototype._drawSegment = cc.DrawNodeRenderCmdCanvas.prototype._drawSegment;
    cc.PhysicsDebugNodeRenderCmdCanvas.prototype._drawPoly = cc.DrawNodeRenderCmdCanvas.prototype._drawPoly;

    cc.PhysicsDebugNodeRenderCmdCanvas.prototype._drawPoly = cc.DrawNodeRenderCmdCanvas.prototype._drawPoly;

    cc.PhysicsSpriteTransformCmdCanvas = function (node) {
        this._node = node;
    };

    cc.PhysicsSpriteTransformCmdCanvas.prototype.rendering = function () {
        if (this._node.transform) {
            this._node.transform();
        }
    };

//--- TMXLayer's render command ---
    cc.TMXLayerRenderCmdCanvas = function (tmxLayer) {
        this._node = tmxLayer;

        this._transform = tmxLayer._transformWorld;
        this._childrenRenderCmds = [];
    };

    cc.TMXLayerRenderCmdCanvas.prototype._copyRendererCmds = function (rendererCmds) {
        if (!rendererCmds)
            return;

        var locCacheCmds = this._childrenRenderCmds;
        locCacheCmds.length = 0;
        for (var i = 0, len = rendererCmds.length; i < len; i++) {
            locCacheCmds[i] = rendererCmds[i];
        }
    };

    cc.TMXLayerRenderCmdCanvas.prototype._renderingChildToCache = function (scaleX, scaleY) {
        //TODO
        var locNode = this._node;
        if (locNode._cacheDirty) {
            var locCacheCmds = this._childrenRenderCmds, locCacheContext = locNode._cacheContext, locCanvas = locNode._cacheCanvas;

            locCacheContext.save();
            locCacheContext.clearRect(0, 0, locCanvas.width, -locCanvas.height);
            //reset the cache context
            var t = cc.affineTransformInvert(this._transform);
            locCacheContext.transform(t.a, t.c, t.b, t.d, t.tx * scaleX, -t.ty * scaleY);

            for (var i = 0, len = locCacheCmds.length; i < len; i++) {
                locCacheCmds[i].rendering(locCacheContext, scaleX, scaleY);
                if (locCacheCmds[i]._node)
                    locCacheCmds[i]._node._cacheDirty = false;
            }
            locCacheContext.restore();
            locNode._cacheDirty = false;
        }
    };

    cc.TMXLayerRenderCmdCanvas.prototype.rendering = function (ctx, scaleX, scaleY) {
        this._renderingChildToCache(scaleX, scaleY);

        var context = ctx || cc._renderContext;
        var node = this._node;
        //context.globalAlpha = this._opacity / 255;
        var posX = 0 | ( -node._anchorPointInPoints.x), posY = 0 | ( -node._anchorPointInPoints.y);
        var locCacheCanvas = node._cacheCanvas, t = this._transform;
        //direct draw image by canvas drawImage
        if (locCacheCanvas) {
            context.save();
            //transform
            context.transform(t.a, t.c, t.b, t.d, t.tx * scaleX, -t.ty * scaleY);

            var locCanvasHeight = locCacheCanvas.height * scaleY;
            context.drawImage(locCacheCanvas, 0, 0, locCacheCanvas.width, locCacheCanvas.height,
                posX, -(posY + locCanvasHeight), locCacheCanvas.width * scaleX, locCanvasHeight);

            context.restore();
        }
        cc.g_NumberOfDraws++;
    };
}
