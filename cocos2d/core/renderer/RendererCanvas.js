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
        _cacheToCanvasCmds: {},                              // an array saves the renderer commands need for cache to other canvas
        //contextSession: { globalAlpha:1 },
        _cacheInstanceIds:[],
        _currentID: 0,

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
         * @param {Number} [instanceID]
         * @param {Number} [scaleX]
         * @param {Number} [scaleY]
         */
        _renderingToCacheCanvas: function (ctx, instanceID, scaleX, scaleY) {
            if (!ctx)
                cc.log("The context of RenderTexture is invalid.");

            scaleX = cc.isUndefined(scaleX) ? 1 : scaleX;
            scaleY = cc.isUndefined(scaleY) ? 1 : scaleY;
            instanceID = instanceID || this._currentID;
            var locCmds = this._cacheToCanvasCmds[instanceID], i, len;
            for (i = 0, len = locCmds.length; i < len; i++) {
                locCmds[i].rendering(ctx, scaleX, scaleY);
            }
            locCmds.length = 0;
            var locIDs = this._cacheInstanceIds;
            delete this._cacheToCanvasCmds[instanceID];
            cc.arrayRemoveObject(locIDs, instanceID);

            if (locIDs.length === 0)
                this._isCacheToCanvasOn = false;
            else
                this._currentID = locIDs[locIDs.length - 1];
        },

        _turnToCacheMode: function(renderTextureID){
            this._isCacheToCanvasOn = true;
            renderTextureID = renderTextureID || 0;
            this._cacheToCanvasCmds[renderTextureID] = [];
            this._cacheInstanceIds.push(renderTextureID);
            this._currentID = renderTextureID;
        },

        _turnToNormalMode: function(){
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
                var currentId = this._currentID, locCmdBuffer = this._cacheToCanvasCmds;
                var cmdList = locCmdBuffer[currentId];
                if (cmdList.indexOf(cmd) === -1)
                    cmdList.push(cmd);
            } else {
                if (this._renderCmds.indexOf(cmd) === -1)
                    this._renderCmds.push(cmd);
            }
        }
    };
    cc.renderer = cc.rendererCanvas;

    cc.TextureRenderCmdCanvas = function (node) {
        this._node = node;
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

    cc.TextureRenderCmdCanvas.prototype.rendering = function (ctx, scaleX, scaleY) {
        var self = this,
            node = self._node;

        var context = ctx || cc._renderContext,
            locTextureCoord = self._textureCoord;

        if(node._texture && (locTextureCoord.width === 0 || locTextureCoord.height === 0))
            return;
        if (!locTextureCoord.validRect && node._displayedOpacity === 0)
            return;  //draw nothing

        if(node._texture && !node._texture._isLoaded)  //set texture but the texture isn't loaded.
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

            if (node._flippedX){
                locX = -locX - locWidth;
                context.scale(-1, 1);
            }
            if (node._flippedY){
                locY = node._offsetPosition.y;
                context.scale(1, -1);
            }

            if (node._texture) {
                image = node._texture._htmlElementObj;

                if(node._texture._pattern != ""){
                    context.save();
                    context.fillStyle = context.createPattern(image, node._texture._pattern);
                    context.fillRect(locX * scaleX, locY * scaleY, locWidth * scaleX, locHeight * scaleY);
                    context.restore();
                } else {
                    //TODO should move '* scaleX/scaleY' to transforming
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
                if(locTextureCoord.validRect) {
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
                if(node._texture._pattern != ""){
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
                if(locTextureCoord.validRect) {
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

    cc.RectRenderCmdCanvas = function (node) {
        this._node = node;
    };

    cc.RectRenderCmdCanvas.prototype.rendering = function (ctx, scaleX, scaleY) {
        var context = ctx || cc._renderContext,
            node = this._node,
            t = node._transformWorld,
            curColor = node._displayedColor,
            opacity = node._displayedOpacity / 255,
            locWidth = node._contentSize.width,
            locHeight = node._contentSize.height;

        if (opacity === 0)
            return;

        var needTransform = (t.a !== 1 || t.b !== 0 || t.c !== 0 || t.d !== 1);         //TODO
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

    cc.GradientRectRenderCmdCanvas = function (node) {
        this._node = node;
        this._startPoint = cc.p(0, 0);
        this._endPoint = cc.p(0, 0);
        this._startStopStr = null;
        this._endStopStr = null;
    };

    cc.GradientRectRenderCmdCanvas.prototype.rendering = function (ctx, scaleX, scaleY) {
        var context = ctx || cc._renderContext,
            self = this,
            node = self._node,
            opacity = node._displayedOpacity / 255,
            t = node._transformWorld;

        if(opacity === 0)
            return;

        var needTransform = (t.a !== 1 || t.b !== 0 || t.c !== 0 || t.d !== 1);
        var needRestore = (node._blendFuncStr !== "source-over") || needTransform;
        if(needRestore){
            context.save();
            context.globalCompositeOperation = node._blendFuncStr;
        }
        context.globalAlpha = opacity;
        var locWidth = node._contentSize.width, locHeight = node._contentSize.height;

        var gradient = context.createLinearGradient(self._startPoint.x, self._startPoint.y, self._endPoint.x, self._endPoint.y);
        gradient.addColorStop(0, this._startStopStr);
        gradient.addColorStop(1, this._endStopStr);
        context.fillStyle = gradient;

        if(needTransform){
            context.transform(t.a, t.c, t.b, t.d, t.tx * scaleX, -t.ty * scaleY);
            context.fillRect(0, 0, locWidth * scaleX, -locHeight * scaleY);
        } else
            context.fillRect(t.tx * scaleX, -t.ty * scaleY, locWidth * scaleX, -locHeight * scaleY);

        if(needRestore)
            context.restore();
        cc.g_NumberOfDraws++;
    };

    cc.ParticleRenderCmdCanvas = function (node) {
        this._node = node;
    };

    cc.ParticleRenderCmdCanvas.prototype.rendering = function (ctx, scaleX, scaleY) {
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

                alpha =  particle.color.a / 255;
                if(alpha === 0) continue;
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
                alpha =  particle.color.a / 255;
                if(alpha === 0) continue;
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

    // the canvas implement of renderCommand for cc.ProgressTimer
    cc.ProgressRenderCmdCanvas = function (node) {
        this._PI180 = Math.PI / 180;

        this._node = node;
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
        var context = ctx || cc._renderContext, node = this._node, locSprite = this._sprite;

        var locTextureCoord = locSprite._rendererCmd._textureCoord, alpha = locSprite._displayedOpacity / 255;

        if(locTextureCoord.width === 0 || locTextureCoord.height === 0)
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

    cc.DrawNodeRenderCmdCanvas = function (node) {
        this._node = node;
        this._buffer = null;
        this._drawColor = null;
        this._blendFunc = null;
    };

    cc.DrawNodeRenderCmdCanvas.prototype.rendering = function (ctx, scaleX, scaleY) {
        var context = ctx || cc._renderContext, _t = this, node = _t._node;
        var alpha = node._displayedOpacity/255;
        if(alpha === 0)
            return;
        context.globalAlpha = alpha;

        var t = node._transformWorld;
        context.save();
        ctx.transform(t.a, t.c, t.b, t.d, t.tx * scaleX, -t.ty * scaleY);
        if ((_t._blendFunc && (_t._blendFunc.src == cc.SRC_ALPHA) && (_t._blendFunc.dst == cc.ONE)))
            context.globalCompositeOperation = 'lighter';
        var locBuffer = _t._buffer;
        for (var i = 0, len = locBuffer.length; i < len; i++) {
            var element = locBuffer[i];
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
        context.restore();
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
        var locFrom = element.verts[0], locTo = element.verts[1];
        var locLineWidth = element.lineWidth, locLineCap = element.lineCap;

        ctx.strokeStyle = "rgba(" + (0 | locColor.r) + "," + (0 | locColor.g) + "," + (0 | locColor.b) + "," + locColor.a / 255 + ")";
        ctx.lineWidth = locLineWidth * scaleX;
        ctx.beginPath();
        ctx.lineCap = locLineCap;
        ctx.moveTo(locFrom.x * scaleX, -locFrom.y * scaleY);
        ctx.lineTo(locTo.x * scaleX, -locTo.y * scaleY);
        ctx.stroke();
    };

    cc.DrawNodeRenderCmdCanvas.prototype._drawPoly = function (ctx, element, scaleX, scaleY) {
        var locVertices = element.verts, locLineCap = element.lineCap;
        var locFillColor = element.fillColor, locLineWidth = element.lineWidth;
        var locLineColor = element.lineColor, locIsClosePolygon = element.isClosePolygon;
        var locIsFill = element.isFill, locIsStroke = element.isStroke;
        if (locVertices == null)
            return;

        var firstPoint = locVertices[0];
        ctx.lineCap = locLineCap;
        if (locFillColor)
            ctx.fillStyle = "rgba(" + (0 | locFillColor.r) + "," + (0 | locFillColor.g) + ","
                + (0 | locFillColor.b) + "," + locFillColor.a / 255 + ")";
        if (locLineWidth)
            ctx.lineWidth = locLineWidth * scaleX;
        if (locLineColor)
            ctx.strokeStyle = "rgba(" + (0 | locLineColor.r) + "," + (0 | locLineColor.g) + ","
                + (0 | locLineColor.b) + "," + locLineColor.a / 255 + ")";

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

    //--- TMXLayer's render command ---
    cc.TMXLayerRenderCmdCanvas = function (tmxLayer) {
        this._node = tmxLayer;
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
        var locNode = this._node;
        if (locNode._cacheDirty) {
            var locCacheCmds = this._childrenRenderCmds, locCacheContext = locNode._cacheContext, locCanvas = locNode._cacheCanvas;

            locCacheContext.save();
            locCacheContext.clearRect(0, 0, locCanvas.width, -locCanvas.height);
            //reset the cache context
            var t = cc.affineTransformInvert(locNode._transformWorld);
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
        var node = this._node;
        var alpha = node._displayedOpacity/255;
        if(alpha <= 0)
            return;

        this._renderingChildToCache(scaleX, scaleY);
        var context = ctx || cc._renderContext;
        context.globalAlpha = alpha;
        var posX = 0 | ( -node._anchorPointInPoints.x), posY = 0 | ( -node._anchorPointInPoints.y);
        var locCacheCanvas = node._cacheCanvas, t = node._transformWorld;
        //direct draw image by canvas drawImage
        if (locCacheCanvas && locCacheCanvas.width !== 0 && locCacheCanvas.height !== 0) {
            context.save();
            //transform
            context.transform(t.a, t.c, t.b, t.d, t.tx * scaleX, -t.ty * scaleY);

            var locCanvasHeight = locCacheCanvas.height * scaleY;

            if(node.layerOrientation === cc.TMX_ORIENTATION_HEX){
                var halfTileSize = node._mapTileSize.height * 0.5 * scaleY;
                context.drawImage(locCacheCanvas, 0, 0, locCacheCanvas.width, locCacheCanvas.height,
                    posX, -(posY + locCanvasHeight) + halfTileSize, locCacheCanvas.width * scaleX, locCanvasHeight);
            } else {
                context.drawImage(locCacheCanvas, 0, 0, locCacheCanvas.width, locCacheCanvas.height,
                    posX, -(posY + locCanvasHeight), locCacheCanvas.width * scaleX, locCanvasHeight);
            }
            context.restore();
        }
        cc.g_NumberOfDraws++;
    };

    cc.CustomRenderCmdCanvas = function(node, func){
        this._node = node;
        this._callback = func;
    };

    cc.CustomRenderCmdCanvas.prototype.rendering = function(ctx, scaleX, scaleY){
        if(!this._callback)
            return;
        this._callback.call(this._node, ctx, scaleX, scaleY);
    };

    cc.SkeletonRenderCmdCanvas = function(node){
        this._node = node;
    };

    cc.SkeletonRenderCmdCanvas.prototype.rendering = function(ctx, scaleX, scaleY){
        var node = this._node;
        ctx = ctx || cc._renderContext;

        if(!node._debugSlots && !node._debugBones){
            return;
        }
        var t = node._transformWorld;
        ctx.save();
        ctx.transform(t.a, t.c, t.b, t.d, t.tx * scaleX, -t.ty * scaleY);
        var locSkeleton = node._skeleton;
        var attachment,slot, i, n, drawingUtil = cc._drawingUtil;
        if (node._debugSlots) {
            // Slots.
            drawingUtil.setDrawColor(0, 0, 255, 255);
            drawingUtil.setLineWidth(1);

            var points = [];
            for (i = 0, n = locSkeleton.slots.length; i < n; i++) {
                slot = locSkeleton.drawOrder[i];
                if (!slot.attachment || slot.attachment.type != sp.ATTACHMENT_TYPE.REGION)
                    continue;
                attachment = slot.attachment;
                sp._regionAttachment_updateSlotForCanvas(attachment, slot, points);
                drawingUtil.drawPoly(points, 4, true);
            }
        }

        if (node._debugBones) {
            // Bone lengths.
            var bone;
            drawingUtil.setLineWidth(2);
            drawingUtil.setDrawColor(255, 0, 0, 255);

            for (i = 0, n = locSkeleton.bones.length; i < n; i++) {
                bone = locSkeleton.bones[i];
                var x = bone.data.length * bone.m00 + bone.worldX;
                var y = bone.data.length * bone.m10 + bone.worldY;
                drawingUtil.drawLine(
                    {x:bone.worldX, y:bone.worldY},
                    {x:x, y:y});
            }

            // Bone origins.
            drawingUtil.setPointSize(4);
            drawingUtil.setDrawColor(0, 0, 255, 255); // Root bone is blue.

            for (i = 0, n = locSkeleton.bones.length; i < n; i++) {
                bone = locSkeleton.bones[i];
                drawingUtil.drawPoint({x:bone.worldX, y:bone.worldY});
                if (i === 0)
                    drawingUtil.setDrawColor(0, 255, 0, 255);
            }
        }
        ctx.restore();
    };
}
