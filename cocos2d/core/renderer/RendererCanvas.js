/****************************************************************************
 Copyright (c) 2008-2010 Ricardo Quesada
 Copyright (c) 2011-2012 cocos2d-x.org
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

cc.rendererCanvas = {
    childrenOrderDirty: true,
    _transformNodePool: [],                              //save nodes transform dirty
    _renderCmds: [],                                     //save renderer commands

    _isRenderTextureOn: false,
    _renderTextureCmds: [],

    rendering: function (ctx) {
        var locCmds = this._renderCmds, i, len, scaleX = cc.view.getScaleX(), scaleY = cc.view.getScaleY();
        var context = ctx || cc._renderContext;
        for (i = 0, len = locCmds.length; i < len; i++) {
            locCmds[i].rendering(context, scaleX, scaleY);
        }
    },

    _renderingForRenderTexture: function (ctx) {
        var locCmds = this._renderTextureCmds, i, len;
        if (!ctx)
            cc.log("The context of RenderTexture is invalid.");
        for (i = 0, len = locCmds.length; i < len; i++) {
            locCmds[i].rendering(ctx, 1, 1);
        }
        //clear the _renderTextureCmds
        locCmds.length = 0;
        this._isRenderTextureOn = false;
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
        if (this._isRenderTextureOn) {
            if (this._renderTextureCmds.indexOf(cmd) === -1)
                this._renderTextureCmds.push(cmd);
        } else {
            if (this._renderCmds.indexOf(cmd) === -1)
                this._renderCmds.push(cmd);
        }
    }
};
cc.renderer = cc.rendererCanvas;

cc.TextureRenderCmdCanvas = function (node) {
    this._node = node;

    this._transform = node._transformWorld; //{a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0};
    this._texture = null;
    this._isLighterMode = false;
    this._opacity = 1;
    this._flippedX = false;
    this._flippedY = false;
    this._textureCoord = node._textureRect_Canvas;
    this._drawingRect = cc.rect(0, 0, 0, 0);
    this._color = node._displayedColor;
};

cc.TextureRenderCmdCanvas.prototype.rendering = function (ctx, scaleX, scaleY) {
    var _t = this;
    var context = ctx || cc._renderContext, locTextureCoord = _t._textureCoord;
    if (!locTextureCoord.validRect)
        return;  //draw nothing

    var t = this._transform, locDrawingRect = _t._drawingRect;

    context.save();
    //transform
    context.transform(t.a, t.c, t.b, t.d, t.tx * scaleX, -t.ty * scaleY);

    if (_t._isLighterMode)
        context.globalCompositeOperation = 'lighter';

    if (_t._flippedX)
        context.scale(-1, 1);
    if (_t._flippedY)
        context.scale(1, -1);

    if (_t._texture && locTextureCoord.validRect) {
        if (_t._texture._isLoaded) {
            context.globalAlpha = _t._opacity;
            var image = _t._texture.getHtmlElementObj();
            context.drawImage(image,
                locTextureCoord.x, locTextureCoord.y, locTextureCoord.width, locTextureCoord.height,
                    //t.tx * scaleX + locDrawingRect.x, -t.ty * scaleY + locDrawingRect.y, locDrawingRect.width , locDrawingRect.height);
                locDrawingRect.x, locDrawingRect.y, locDrawingRect.width, locDrawingRect.height);
        }
    } else if (!_t._texture && locTextureCoord.validRect) {
        var curColor = _t._color;
        context.fillStyle = "rgba(" + curColor.r + "," + curColor.g + "," + curColor.b + "," + _t._opacity + ")";
        context.fillRect(locDrawingRect.x, locDrawingRect.y, locDrawingRect.width, locDrawingRect.height);
    }

    context.restore();
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
    this._transform = node._transformWorld; //{a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0};
    this._sprite = node._sprite;
    this._type = node.getType();
    this._barRect = node._barRect;
    this._origin = node._origin;
    this._radius = 0;
    this._startAngle = 0;
    this._endAngle = 0;
    this._counterClockWise = false;
};

cc.ProgressRenderCmdCanvas.prototype.rendering = function (ctx, scaleX, scaleY) {
    var context = ctx || cc._renderContext, locSprite = this._sprite;

    var locTextureCoord = locSprite._textureRect_Canvas;
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
    if (locSprite._colorized) {
        context.drawImage(image,
            0, 0, locTextureCoord.width, locTextureCoord.height,
            flipXOffset, flipYOffset, locDrawSizeCanvas.width, locDrawSizeCanvas.height);
    } else {
        context.drawImage(image,
            locTextureCoord.x, locTextureCoord.y, locTextureCoord.width, locTextureCoord.height,
            flipXOffset, flipYOffset, locDrawSizeCanvas.width, locDrawSizeCanvas.height);
    }

    context.restore();
    cc.g_NumberOfDraws++;
};

// the canvas implement of renderCommand for cc.RenderTexture
cc.RenderTextureRenderCmdCanvas = function(node){
    this._node = node;

    this._transform = node._transformWorld;
    this._clearFlags = node.clearFlags;
    this.autoDraw = node.autoDraw;

    this._cacheCanvas = node._cacheCanvas;
    this._cacheContext = node._cacheContext;

    this._sprite = node.sprite;
};

cc.RenderTextureRenderCmdCanvas.prototype.rendering = function(ctx, scaleX, scaleY){
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
