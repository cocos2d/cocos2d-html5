/****************************************************************************
 Copyright (c) 2010-2011 cocos2d-x.org
 Copyright (c) 2010      Lam Pham

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
 * Radial Counter-Clockwise
 * @type Number
 * @constant
 */
cc.PROGRESS_TIMER_TYPE_RADIAL = 0;
/**
 * Bar
 * @type Number
 * @constant
 */
cc.PROGRESS_TIMER_TYPE_BAR = 1;

/**
 * @constant
 * @type Number
 */
cc.PROGRESS_TEXTURE_COORDS_COUNT = 4;

/**
 * @constant
 * @type Number
 */
cc.PROGRESS_TEXTURE_COORDS = 0x4b;

/**
 * cc.Progresstimer is a subclass of cc.Node.   (Canvas implement)<br/>
 * It renders the inner sprite according to the percentage.<br/>
 * The progress can be Radial, Horizontal or vertical.
 * @class
 * @extends cc.NodeRGBA
 */
cc.ProgressTimerCanvas = cc.NodeRGBA.extend(/** @lends cc.ProgressTimerCanvas# */{
    /// ---- common properties start ----
    _type:null,
    _percentage:0.0,
    _sprite:null,

    _midPoint:null,
    _barChangeRate:null,
    _reverseDirection:false,

    /**
     *    Midpoint is used to modify the progress start position.
     *    If you're using radials type then the midpoint changes the center point
     *    If you're using bar type the the midpoint changes the bar growth
     *        it expands from the center but clamps to the sprites edge so:
     *        you want a left to right then set the midpoint all the way to cc.p(0,y)
     *        you want a right to left then set the midpoint all the way to cc.p(1,y)
     *        you want a bottom to top then set the midpoint all the way to cc.p(x,0)
     *        you want a top to bottom then set the midpoint all the way to cc.p(x,1)
     *  @return {cc.Point}
     */
    getMidpoint:function () {
        return this._midPoint;
    },

    /**
     * Midpoint setter
     * @param {cc.Point} mpoint
     */
    setMidpoint:function (mpoint) {
        this._midPoint = cc.pClamp(mpoint, cc.p(0, 0), cc.p(1, 1));
    },

    /**
     *    This allows the bar type to move the component at a specific rate
     *    Set the component to 0 to make sure it stays at 100%.
     *    For example you want a left to right bar but not have the height stay 100%
     *    Set the rate to be cc.p(0,1); and set the midpoint to = cc.p(0,.5f);
     *  @return {cc.Point}
     */
    getBarChangeRate:function () {
        return this._barChangeRate;
    },

    /**
     * @param {cc.Point} barChangeRate
     */
    setBarChangeRate:function (barChangeRate) {
        this._barChangeRate = cc.pClamp(barChangeRate, cc.p(0, 0), cc.p(1, 1));
    },

    /**
     *  Change the percentage to change progress
     * @return {cc.PROGRESS_TIMER_TYPE_RADIAL|cc.PROGRESS_TIMER_TYPE_BAR}
     */
    getType:function () {
        return this._type;
    },

    /**
     * Percentages are from 0 to 100
     * @return {Number}
     */
    getPercentage:function () {
        return this._percentage;
    },

    /**
     * The image to show the progress percentage, retain
     * @return {cc.Sprite}
     */
    getSprite:function () {
        return this._sprite;
    },

    /**
     * from 0-100
     * @param {Number} percentage
     */
    setPercentage:function (percentage) {
        if (this._percentage != percentage) {
            this._percentage = cc.clampf(percentage, 0, 100);
            this._updateProgress();
        }
    },

    setOpacityModifyRGB:function (bValue) {
    },

    isOpacityModifyRGB:function () {
        return false;
    },

    isReverseDirection:function () {
        return this._reverseDirection;
    },

    _boundaryTexCoord:function (index) {
        if (index < cc.PROGRESS_TEXTURE_COORDS_COUNT) {
            var locProTextCoords = cc.PROGRESS_TEXTURE_COORDS;
            if (this._reverseDirection)
                return cc.p((locProTextCoords >> (7 - (index << 1))) & 1, (locProTextCoords >> (7 - ((index << 1) + 1))) & 1);
            else
                return cc.p((locProTextCoords >> ((index << 1) + 1)) & 1, (locProTextCoords >> (index << 1)) & 1);
        }
        return cc.PointZero();
    },

    /// ---- common properties end   ----
    _origin:cc.PointZero(),
    _originSize:cc.SizeZero(),
    _drawSize:cc.SizeZero(),
    _drawPosition:cc.PointZero(),
    _startAngle:270,
    _endAngle:270,
    _radius:0,

    ctor:function () {
        cc.NodeRGBA.prototype.ctor.call(this);

        this._type = cc.PROGRESS_TIMER_TYPE_RADIAL;
        this._percentage = 0.0;
        this._midPoint = cc.p(0, 0);
        this._barChangeRate = cc.p(0, 0);
        this._reverseDirection = false;

        this._sprite = null;

        this._origin = cc.PointZero();
        this._originSize = cc.SizeZero();
        this._drawSize = cc.SizeZero();
        this._drawPosition = cc.PointZero();
        this._startAngle = 270;
        this._endAngle = 270;
        this._radius = 0;
    },

    /**
     * @param {Boolean} reverse
     */
    setReverseProgress:function (reverse) {
        if (this._reverseDirection !== reverse) {
            this._reverseDirection = reverse;
        }
    },

    /**
     * @param {cc.Sprite} sprite
     */
    setSprite:function (sprite) {
        if (this._sprite != sprite) {
            this._sprite = sprite;
            this.setContentSize(this._sprite.getContentSize());
        }
    },

    /**
     * set Progress type of cc.ProgressTimer
     * @param {cc.PROGRESS_TIMER_TYPE_RADIAL|cc.PROGRESS_TIMER_TYPE_BAR} type
     */
    setType:function (type) {
        if (type !== this._type) {
            this._type = type;
        }
    },

    /**
     * set color of sprite
     * @param {cc.Color3B} color
     */
    setColor:function (color) {
        this._sprite.setColor(color);
    },

    /**
     * Opacity
     * @param {Number} opacity
     */
    setOpacity:function (opacity) {
        this._sprite.setOpacity(opacity);
    },

    /**
     * return color of sprite
     * @return {cc.Color3B}
     */
    getColor:function () {
        return this._sprite.getColor();
    },

    /**
     * return Opacity of sprite
     * @return {Number}
     */
    getOpacity:function () {
        return this._sprite.getOpacity();
    },

    /**
     * Reverse Progress setter
     * @param {Boolean} reverse
     */
    setReverseDirection:function (reverse) {
        if (this._reverseDirection !== reverse) {
            this._reverseDirection = reverse;
        }
    },

    /**
     * Initializes a progress timer with the sprite as the shape the timer goes through
     * @param {cc.Sprite} sprite
     * @return {Boolean}
     */
    initWithSprite:function (sprite) {
        this.setPercentage(0);
        this.setAnchorPoint(cc.p(0.5, 0.5));

        this._type = cc.PROGRESS_TIMER_TYPE_RADIAL;
        this._reverseDirection = false;
        this.setMidpoint(cc.p(0.5, 0.5));
        this.setBarChangeRate(cc.p(1, 1));
        this.setSprite(sprite);

        return true;
    },

    /**
     * stuff gets drawn here
     * @param {CanvasRenderingContext2D} ctx
     */
    draw:function (ctx) {
        var context = ctx || cc.renderContext;
        var locSprite = this._sprite;
        context.globalAlpha = locSprite._opacity / 255;
        var centerPoint, mpX = 0, mpY = 0;
        var spriteContentSize = locSprite._contentSize;
        var spriteAnchorPoint = locSprite._anchorPointInPoints;
        if (locSprite._flipX) {
            centerPoint = cc.p(spriteContentSize.width * 0.5, spriteContentSize.height * 0.5);
            mpX = 0 | (centerPoint.x - spriteAnchorPoint.x);
            context.translate(mpX, 0);
            context.scale(-1, 1);
        }

        if (locSprite._flipY) {
            centerPoint = cc.p(spriteContentSize.width * 0.5, spriteContentSize.height * 0.5);
            mpY = -(0 | (centerPoint.y - spriteAnchorPoint.y));
            context.translate(0, mpY);
            context.scale(1, -1);
        }
        context.translate(spriteAnchorPoint.x, -spriteAnchorPoint.y);

        var pos;
        var offsetPixels = locSprite._offsetPosition, locSpriteTexture = locSprite._texture, locSpriteRect = locSprite._rect;
        var locOrigin = this._origin;
        if (this._type == cc.PROGRESS_TIMER_TYPE_BAR) {
            pos = cc.p(( -spriteAnchorPoint.x + offsetPixels.x + this._drawPosition.x),
                ( -spriteAnchorPoint.y + offsetPixels.y + this._drawPosition.y));
            var locOriginSize = this._originSize;
            if (locSpriteTexture instanceof HTMLImageElement) {
                if ((locOriginSize.width != 0) && (locOriginSize.height != 0)) {
                    context.drawImage(locSpriteTexture,
                        locSpriteRect.x + locOrigin.x, locSpriteRect.y + locOrigin.y,
                        locOriginSize.width, locOriginSize.height,
                        pos.x, -(pos.y + this._drawSize.height),
                        locOriginSize.width, locOriginSize.height);
                }
            } else if (locSpriteTexture instanceof  HTMLCanvasElement) {
                if ((locOriginSize.width != 0) && (locOriginSize.height != 0)) {
                    context.drawImage(locSpriteTexture,
                        locOrigin.x, locOrigin.y,
                        locOriginSize.width, locOriginSize.height,
                        pos.x, -(pos.y + this._drawSize.height),
                        locOriginSize.width, locOriginSize.height);
                }
            }
        } else {
            context.beginPath();
            context.arc(locOrigin.x, locOrigin.y, this._radius, (Math.PI / 180) * this._startAngle, (Math.PI / 180) * this._endAngle, false);
            context.lineTo(locOrigin.x, locOrigin.y);
            context.clip();
            context.closePath();

            pos = cc.p(0 | ( -spriteAnchorPoint.x + offsetPixels.x),
                0 | ( -spriteAnchorPoint.y + offsetPixels.y));

            if (locSpriteTexture instanceof HTMLImageElement) {
                context.drawImage(locSpriteTexture,
                    locSpriteRect.x, locSpriteRect.y,
                    locSpriteRect.width, locSpriteRect.height,
                    pos.x, -(pos.y + locSpriteRect.height),
                    locSpriteRect.width, locSpriteRect.height);
            } else if (locSpriteTexture instanceof  HTMLCanvasElement) {
                context.drawImage(locSpriteTexture,
                    0, 0,
                    locSpriteRect.width, locSpriteRect.height,
                    pos.x, -(pos.y + locSpriteRect.height),
                    locSpriteRect.width, locSpriteRect.height);
            }
        }
        cc.INCREMENT_GL_DRAWS(1);
    },

    _updateProgress:function () {
        var size = this._sprite.getContentSize();
        var textureSize = this._sprite.getTextureRect().size;
        var locMidPoint = this._midPoint;
        if (this._type == cc.PROGRESS_TIMER_TYPE_RADIAL) {

            this._origin = cc.p(-(size.width * (0.5 - locMidPoint.x)), -(size.height * (0.5 - locMidPoint.y)));
            this._radius = Math.round(Math.sqrt(size.width * size.width + size.height * size.height));
            if (this._reverseDirection) {
                this._startAngle = 270 - 3.6 * this._percentage;
            } else {
                this._endAngle = 270 + 3.6 * this._percentage;
            }
        } else {
            this._origin = cc.p(0, 0);
            this._drawPosition = cc.p(0, 0);
            var locBarChangeRate = this._barChangeRate;

            var percentageF = this._percentage / 100;
            var startPoint = cc.p(size.width * locMidPoint.x, size.height * locMidPoint.y);
            var startPointTx = cc.p(textureSize.width * locMidPoint.x, textureSize.height * locMidPoint.y);

            var drawedSize = cc.size((size.width * (1 - locBarChangeRate.x)), (size.height * (1 - locBarChangeRate.y)));
            var drawingSize = cc.size((size.width - drawedSize.width) * percentageF, (size.height - drawedSize.height) * percentageF);
            this._drawSize = cc.size(drawedSize.width + drawingSize.width, drawedSize.height + drawingSize.height);

            var txDrawedSize = cc.size((textureSize.width * (1 - locBarChangeRate.x)), (textureSize.height * (1 - locBarChangeRate.y)));
            var txDrawingSize = cc.size((textureSize.width - txDrawedSize.width) * percentageF, (textureSize.height - txDrawedSize.height) * percentageF);
            this._originSize = cc.size(txDrawedSize.width + txDrawingSize.width, txDrawedSize.height + txDrawingSize.height);

            var needToLeft = startPoint.x * percentageF;
            var needToLeftTx = startPointTx.x * percentageF;

            if (size.width == this._drawSize.width) {
                this._origin.x = 0;
                this._drawPosition.x = 0;
            } else {
                this._origin.x = (startPointTx.x - needToLeftTx);
                this._drawPosition.x = (startPoint.x - needToLeft);
            }

            var needToTop = (textureSize.height - startPointTx.y) * percentageF;

            if (size.height == this._drawSize.height) {
                this._origin.y = 0;
                this._drawPosition.y = 0;
            } else {
                this._origin.y = (textureSize.height - startPointTx.y - needToTop);
                this._drawPosition.y = (startPoint.y - (startPoint.y * percentageF));
            }
        }
    }
});

/**
 * create a progress timer object with image file name that renders the inner sprite according to the percentage
 * @param {cc.Sprite} sprite
 * @return {cc.ProgressTimer}
 * @example
 * // Example
 * var progress = cc.ProgressTimer.create('progress.png')
 */
cc.ProgressTimerCanvas.create = function (sprite) {
    var progressTimer = new cc.ProgressTimerCanvas();
    if (progressTimer.initWithSprite(sprite))
        return progressTimer;
    return null;
};

/**
 * cc.Progresstimer is a subclass of cc.Node.   (Canvas implement)<br/>
 * It renders the inner sprite according to the percentage.<br/>
 * The progress can be Radial, Horizontal or vertical.
 * @class
 * @extends cc.NodeRGBA
 */
cc.ProgressTimerWebGL = cc.NodeRGBA.extend(/** @lends cc.ProgressTimerWebGL# */{
    /// ---- common properties start ----
    _type:null,
    _percentage:0.0,
    _sprite:null,

    _midPoint:null,
    _barChangeRate:null,
    _reverseDirection:false,

    /**
     *    Midpoint is used to modify the progress start position.
     *    If you're using radials type then the midpoint changes the center point
     *    If you're using bar type the the midpoint changes the bar growth
     *        it expands from the center but clamps to the sprites edge so:
     *        you want a left to right then set the midpoint all the way to cc.p(0,y)
     *        you want a right to left then set the midpoint all the way to cc.p(1,y)
     *        you want a bottom to top then set the midpoint all the way to cc.p(x,0)
     *        you want a top to bottom then set the midpoint all the way to cc.p(x,1)
     *  @return {cc.Point}
     */
    getMidpoint:function () {
        return this._midPoint;
    },

    /**
     * Midpoint setter
     * @param {cc.Point} mpoint
     */
    setMidpoint:function (mpoint) {
        this._midPoint = cc.pClamp(mpoint, cc.p(0, 0), cc.p(1, 1));
    },

    /**
     *    This allows the bar type to move the component at a specific rate
     *    Set the component to 0 to make sure it stays at 100%.
     *    For example you want a left to right bar but not have the height stay 100%
     *    Set the rate to be cc.p(0,1); and set the midpoint to = cc.p(0,.5f);
     *  @return {cc.Point}
     */
    getBarChangeRate:function () {
        return this._barChangeRate;
    },

    /**
     * @param {cc.Point} barChangeRate
     */
    setBarChangeRate:function (barChangeRate) {
        this._barChangeRate = cc.pClamp(barChangeRate, cc.p(0, 0), cc.p(1, 1));
    },

    /**
     *  Change the percentage to change progress
     * @return {cc.PROGRESS_TIMER_TYPE_RADIAL|cc.PROGRESS_TIMER_TYPE_BAR}
     */
    getType:function () {
        return this._type;
    },

    /**
     * Percentages are from 0 to 100
     * @return {Number}
     */
    getPercentage:function () {
        return this._percentage;
    },

    /**
     * The image to show the progress percentage, retain
     * @return {cc.Sprite}
     */
    getSprite:function () {
        return this._sprite;
    },

    /**
     * from 0-100
     * @param {Number} percentage
     */
    setPercentage:function (percentage) {
        if (this._percentage != percentage) {
            this._percentage = cc.clampf(percentage, 0, 100);
            this._updateProgress();
        }
    },

    setOpacityModifyRGB:function (bValue) {
    },

    isOpacityModifyRGB:function () {
        return false;
    },

    isReverseDirection:function () {
        return this._reverseDirection;
    },

    _boundaryTexCoord:function (index) {
        if (index < cc.PROGRESS_TEXTURE_COORDS_COUNT) {
            if (this._reverseDirection)
                return cc.p((cc.PROGRESS_TEXTURE_COORDS >> (7 - (index << 1))) & 1, (cc.PROGRESS_TEXTURE_COORDS >> (7 - ((index << 1) + 1))) & 1);
            else
                return cc.p((cc.PROGRESS_TEXTURE_COORDS >> ((index << 1) + 1)) & 1, (cc.PROGRESS_TEXTURE_COORDS >> (index << 1)) & 1);
        }
        return cc.PointZero();
    },
    /// ---- common properties end   ----

    _vertexDataCount:0,
    _vertexData:null,
    _vertexArrayBuffer:null,
    _vertexWebGLBuffer:null,
    _vertexDataDirty:false,

    ctor:function () {
        cc.NodeRGBA.prototype.ctor.call(this);
        this._type = cc.PROGRESS_TIMER_TYPE_RADIAL;
        this._percentage = 0.0;
        this._midPoint = cc.p(0, 0);
        this._barChangeRate = cc.p(0, 0);
        this._reverseDirection = false;

        this._sprite = null;

        this._vertexWebGLBuffer = cc.renderContext.createBuffer();
        this._vertexDataCount = 0;
        this._vertexData = null;
        this._vertexArrayBuffer = null;
        this._vertexDataDirty = false;
    },

    /**
     * set color of sprite
     * @param {cc.Color3B} color
     */
    setColor:function (color) {
        this._sprite.setColor(color);
    },

    /**
     * Opacity
     * @param {Number} opacity
     */
    setOpacity:function (opacity) {
        this._sprite.setOpacity(opacity);
    },

    /**
     * return color of sprite
     * @return {cc.Color3B}
     */
    getColor:function () {
        return this._sprite.getColor();
    },

    /**
     * return Opacity of sprite
     * @return {Number}
     */
    getOpacity:function () {
        return this._sprite.getOpacity();
    },

    /**
     * @param {Boolean} reverse
     */
    setReverseProgress:function (reverse) {
        if (this._reverseDirection !== reverse) {
            this._reverseDirection = reverse;

            //    release all previous information
            this._vertexData = null;
            this._vertexArrayBuffer = null;
            this._vertexDataCount = 0;
        }
    },

    /**
     * @param {cc.Sprite} sprite
     */
    setSprite:function (sprite) {
        if (this._sprite != sprite) {
            this._sprite = sprite;
            this.setContentSize(this._sprite.getContentSize());

            //	Everytime we set a new sprite, we free the current vertex data
            if (this._vertexData) {
                this._vertexData = null;
                this._vertexArrayBuffer = null;
                this._vertexDataCount = 0;
            }
        }
    },

    /**
     * set Progress type of cc.ProgressTimer
     * @param {cc.PROGRESS_TIMER_TYPE_RADIAL|cc.PROGRESS_TIMER_TYPE_BAR} type
     */
    setType:function (type) {
        if (type !== this._type) {
            //	release all previous information
            if (this._vertexData) {
                this._vertexData = null;
                this._vertexArrayBuffer = null;
                this._vertexDataCount = 0;
            }

            this._type = type;
        }
    },

    /**
     * Reverse Progress setter
     * @param {Boolean} reverse
     */
    setReverseDirection:function (reverse) {
        if (this._reverseDirection !== reverse) {
            this._reverseDirection = reverse;
            //release all previous information
            this._vertexData = null;
            this._vertexArrayBuffer = null;
            this._vertexDataCount = 0;
        }
    },

    /**
     * @param {cc.Point} alpha
     * @return {cc.Vertex2F | Object} the vertex position from the texture coordinate
     * @private
     */
    _textureCoordFromAlphaPoint:function (alpha) {
        var locSprite = this._sprite;
        if (!locSprite) {
            return {u:0, v:0}; //new cc.Tex2F(0, 0);
        }
        var quad = locSprite.getQuad();
        var min = cc.p(quad.bl.texCoords.u, quad.bl.texCoords.v);
        var max = cc.p(quad.tr.texCoords.u, quad.tr.texCoords.v);

        //  Fix bug #1303 so that progress timer handles sprite frame texture rotation
        if (locSprite.isTextureRectRotated()) {
            var temp = alpha.x;
            alpha.x = alpha.y;
            alpha.y = temp;
        }
        return {u: min.x * (1 - alpha.x) + max.x * alpha.x, v: min.y * (1 - alpha.y) + max.y * alpha.y};
    },

    _vertexFromAlphaPoint:function (alpha) {
        if (!this._sprite) {
            return {x: 0, y: 0};
        }
        var quad = this._sprite.getQuad();
        var min = cc.p(quad.bl.vertices.x, quad.bl.vertices.y);
        var max = cc.p(quad.tr.vertices.x, quad.tr.vertices.y);
        return {x: min.x * (1 - alpha.x) + max.x * alpha.x, y: min.y * (1 - alpha.y) + max.y * alpha.y};
    },
    /**
     * Initializes a progress timer with the sprite as the shape the timer goes through
     * @param {cc.Sprite} sprite
     * @return {Boolean}
     */
    initWithSprite:function (sprite) {
        this.setPercentage(0);
        this._vertexData = null;
        this._vertexArrayBuffer = null;
        this._vertexDataCount = 0;
        this.setAnchorPoint(cc.p(0.5, 0.5));

        this._type = cc.PROGRESS_TIMER_TYPE_RADIAL;
        this._reverseDirection = false;
        this.setMidpoint(cc.p(0.5, 0.5));
        this.setBarChangeRate(cc.p(1, 1));
        this.setSprite(sprite);

        //shader program
        this.setShaderProgram(cc.ShaderCache.getInstance().programForKey(cc.SHADER_POSITION_TEXTURECOLOR));
        return true;
    },

    /**
     * stuff gets drawn here
     * @param {WebGLRenderingContext } ctx
     */
    draw:function (ctx) {
        var context = ctx || cc.renderContext;
        if (!this._vertexData || !this._sprite)
            return;

        cc.NODE_DRAW_SETUP(this);

        var blendFunc = this._sprite.getBlendFunc();
        cc.glBlendFunc(blendFunc.src, blendFunc.dst);
        cc.glEnableVertexAttribs(cc.VERTEX_ATTRIB_FLAG_POSCOLORTEX);

        if (this._sprite.getTexture())
            cc.glBindTexture2D(this._sprite.getTexture());
        else
            cc.glBindTexture2D(null);

        context.bindBuffer(context.ARRAY_BUFFER, this._vertexWebGLBuffer);
        if(this._vertexDataDirty){
            context.bufferData(context.ARRAY_BUFFER, this._vertexArrayBuffer, context.DYNAMIC_DRAW);
            this._vertexDataDirty = false;
        }
        var locVertexDataLen = cc.V2F_C4B_T2F.BYTES_PER_ELEMENT;
        context.vertexAttribPointer(cc.VERTEX_ATTRIB_POSITION, 2, context.FLOAT, false, locVertexDataLen, 0);
        context.vertexAttribPointer(cc.VERTEX_ATTRIB_COLOR, 4, context.UNSIGNED_BYTE, true, locVertexDataLen, 8);
        context.vertexAttribPointer(cc.VERTEX_ATTRIB_TEX_COORDS, 2, context.FLOAT, false, locVertexDataLen, 12);

        if (this._type === cc.PROGRESS_TIMER_TYPE_RADIAL)
            context.drawArrays(context.TRIANGLE_FAN, 0, this._vertexDataCount);
        else if (this._type == cc.PROGRESS_TIMER_TYPE_BAR) {
            if (!this._reverseDirection)
                context.drawArrays(context.TRIANGLE_STRIP, 0, this._vertexDataCount);
            else {
                context.drawArrays(context.TRIANGLE_STRIP, 0, this._vertexDataCount / 2);
                context.drawArrays(context.TRIANGLE_STRIP, 4, this._vertexDataCount / 2);
                // 2 draw calls
                cc.g_NumberOfDraws++;
            }
        }
        cc.g_NumberOfDraws++;
    },

    /**
     * <p>
     *    Update does the work of mapping the texture onto the triangles            <br/>
     *    It now doesn't occur the cost of free/alloc data every update cycle.      <br/>
     *    It also only changes the percentage point but no other points if they have not been modified.       <br/>
     *                                                                              <br/>
     *    It now deals with flipped texture. If you run into this problem, just use the                       <br/>
     *    sprite property and enable the methods flipX, flipY.                      <br/>
     * </p>
     * @private
     */
    _updateRadial:function () {
        if (!this._sprite)
            return;

        var i, locMidPoint = this._midPoint;
        var alpha = this._percentage / 100;
        var angle = 2 * (cc.PI) * ( this._reverseDirection ? alpha : 1.0 - alpha);

        //    We find the vector to do a hit detection based on the percentage
        //    We know the first vector is the one @ 12 o'clock (top,mid) so we rotate
        //    from that by the progress angle around the m_tMidpoint pivot
        var topMid = cc.p(locMidPoint.x, 1);
        var percentagePt = cc.pRotateByAngle(topMid, locMidPoint, angle);

        var index = 0;
        var hit;

        if (alpha == 0) {
            //    More efficient since we don't always need to check intersection
            //    If the alpha is zero then the hit point is top mid and the index is 0.
            hit = topMid;
            index = 0;
        } else if (alpha == 1) {
            //    More efficient since we don't always need to check intersection
            //    If the alpha is one then the hit point is top mid and the index is 4.
            hit = topMid;
            index = 4;
        } else {
            //    We run a for loop checking the edges of the texture to find the
            //    intersection point
            //    We loop through five points since the top is split in half

            var min_t = cc.FLT_MAX;
            var locProTextCoordsCount = cc.PROGRESS_TEXTURE_COORDS_COUNT;
            for (i = 0; i <= locProTextCoordsCount; ++i) {
                var pIndex = (i + (locProTextCoordsCount - 1)) % locProTextCoordsCount;

                var edgePtA = this._boundaryTexCoord(i % locProTextCoordsCount);
                var edgePtB = this._boundaryTexCoord(pIndex);

                //    Remember that the top edge is split in half for the 12 o'clock position
                //    Let's deal with that here by finding the correct endpoints
                if (i == 0)
                    edgePtB = cc.pLerp(edgePtA, edgePtB, 1 - locMidPoint.x);
                else if (i == 4)
                    edgePtA = cc.pLerp(edgePtA, edgePtB, 1 - locMidPoint.x);

                // retPoint are returned by ccpLineIntersect
                var retPoint = cc.p(0, 0);
                if (cc.pLineIntersect(edgePtA, edgePtB, locMidPoint, percentagePt, retPoint)) {
                    //    Since our hit test is on rays we have to deal with the top edge
                    //    being in split in half so we have to test as a segment
                    if ((i == 0 || i == 4)) {
                        //    s represents the point between edgePtA--edgePtB
                        if (!(0 <= retPoint.x && retPoint.x <= 1))
                            continue;
                    }
                    //    As long as our t isn't negative we are at least finding a
                    //    correct hitpoint from m_tMidpoint to percentagePt.
                    if (retPoint.y >= 0) {
                        //    Because the percentage line and all the texture edges are
                        //    rays we should only account for the shortest intersection
                        if (retPoint.y < min_t) {
                            min_t = retPoint.y;
                            index = i;
                        }
                    }
                }
            }

            //    Now that we have the minimum magnitude we can use that to find our intersection
            hit = cc.pAdd(locMidPoint, cc.pMult(cc.pSub(percentagePt, locMidPoint), min_t));
        }

        //    The size of the vertex data is the index from the hitpoint
        //    the 3 is for the m_tMidpoint, 12 o'clock point and hitpoint position.
        var sameIndexCount = true;
        if (this._vertexDataCount != index + 3) {
            sameIndexCount = false;
            this._vertexData = null;
            this._vertexArrayBuffer = null;
            this._vertexDataCount = 0;
        }

        if (!this._vertexData) {
            this._vertexDataCount = index + 3;
            var locCount = this._vertexDataCount, vertexDataLen = cc.V2F_C4B_T2F.BYTES_PER_ELEMENT;
            this._vertexArrayBuffer = new ArrayBuffer(locCount * vertexDataLen);
            var locData = [];
            for (i = 0; i < locCount; i++)
                locData[i] = new cc.V2F_C4B_T2F(null, null, null, this._vertexArrayBuffer, i * vertexDataLen);

            this._vertexData = locData;
            cc.Assert(this._vertexData, "cc.ProgressTimer. Not enough memory");
        }

        var locVertexData = this._vertexData;
        if (!sameIndexCount) {
            //    First we populate the array with the m_tMidpoint, then all
            //    vertices/texcoords/colors of the 12 'o clock start and edges and the hitpoint
            locVertexData[0].texCoords = this._textureCoordFromAlphaPoint(locMidPoint);
            locVertexData[0].vertices = this._vertexFromAlphaPoint(locMidPoint);

            locVertexData[1].texCoords = this._textureCoordFromAlphaPoint(topMid);
            locVertexData[1].vertices = this._vertexFromAlphaPoint(topMid);

            for (i = 0; i < index; i++) {
                var alphaPoint = this._boundaryTexCoord(i);
                locVertexData[i + 2].texCoords = this._textureCoordFromAlphaPoint(alphaPoint);
                locVertexData[i + 2].vertices = this._vertexFromAlphaPoint(alphaPoint);
            }
        }

        //    hitpoint will go last
        locVertexData[this._vertexDataCount - 1].texCoords = this._textureCoordFromAlphaPoint(hit);
        locVertexData[this._vertexDataCount - 1].vertices = this._vertexFromAlphaPoint(hit);
    },

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
    _updateBar:function () {
        if (!this._sprite)
            return;

        var i;
        var alpha = this._percentage / 100.0;
        var locBarChangeRate = this._barChangeRate;
        var alphaOffset = cc.pMult(cc.p((1.0 - locBarChangeRate.x) + alpha * locBarChangeRate.x,
            (1.0 - locBarChangeRate.y) + alpha * locBarChangeRate.y), 0.5);
        var min = cc.pSub(this._midPoint, alphaOffset);
        var max = cc.pAdd(this._midPoint, alphaOffset);

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
                for (i = 0; i < locCount; i++) {
                    this._vertexData[i] = new cc.V2F_C4B_T2F(null, null, null, this._vertexArrayBuffer, i * vertexDataLen);
                }
                cc.Assert(this._vertexData, "cc.ProgressTimer. Not enough memory");
            }

            locVertexData = this._vertexData;
            //    TOPLEFT
            locVertexData[0].texCoords = this._textureCoordFromAlphaPoint(cc.p(min.x, max.y));
            locVertexData[0].vertices = this._vertexFromAlphaPoint(cc.p(min.x, max.y));

            //    BOTLEFT
            locVertexData[1].texCoords = this._textureCoordFromAlphaPoint(cc.p(min.x, min.y));
            locVertexData[1].vertices = this._vertexFromAlphaPoint(cc.p(min.x, min.y));

            //    TOPRIGHT
            locVertexData[2].texCoords = this._textureCoordFromAlphaPoint(cc.p(max.x, max.y));
            locVertexData[2].vertices = this._vertexFromAlphaPoint(cc.p(max.x, max.y));

            //    BOTRIGHT
            locVertexData[3].texCoords = this._textureCoordFromAlphaPoint(cc.p(max.x, min.y));
            locVertexData[3].vertices = this._vertexFromAlphaPoint(cc.p(max.x, min.y));
        } else {
            if (!this._vertexData) {
                this._vertexDataCount = 8;
                var rVertexDataLen = cc.V2F_C4B_T2F.BYTES_PER_ELEMENT, rLocCount = 8;
                this._vertexArrayBuffer = new ArrayBuffer(rLocCount * rVertexDataLen);
                var rTempData = [];
                for (i = 0; i < rLocCount; i++)
                    rTempData[i] = new cc.V2F_C4B_T2F(null, null, null, this._vertexArrayBuffer, i * rVertexDataLen);

                cc.Assert(rTempData, "cc.ProgressTimer. Not enough memory");
                //    TOPLEFT 1
                rTempData[0].texCoords = this._textureCoordFromAlphaPoint(cc.p(0, 1));
                rTempData[0].vertices = this._vertexFromAlphaPoint(cc.p(0, 1));

                //    BOTLEFT 1
                rTempData[1].texCoords = this._textureCoordFromAlphaPoint(cc.p(0, 0));
                rTempData[1].vertices = this._vertexFromAlphaPoint(cc.p(0, 0));

                //    TOPRIGHT 2
                rTempData[6].texCoords = this._textureCoordFromAlphaPoint(cc.p(1, 1));
                rTempData[6].vertices = this._vertexFromAlphaPoint(cc.p(1, 1));

                //    BOTRIGHT 2
                rTempData[7].texCoords = this._textureCoordFromAlphaPoint(cc.p(1, 0));
                rTempData[7].vertices = this._vertexFromAlphaPoint(cc.p(1, 0));

                this._vertexData = rTempData;
            }

            locVertexData = this._vertexData;
            //    TOPRIGHT 1
            locVertexData[2].texCoords = this._textureCoordFromAlphaPoint(cc.p(min.x, max.y));
            locVertexData[2].vertices = this._vertexFromAlphaPoint(cc.p(min.x, max.y));

            //    BOTRIGHT 1
            locVertexData[3].texCoords = this._textureCoordFromAlphaPoint(cc.p(min.x, min.y));
            locVertexData[3].vertices = this._vertexFromAlphaPoint(cc.p(min.x, min.y));

            //    TOPLEFT 2
            locVertexData[4].texCoords = this._textureCoordFromAlphaPoint(cc.p(max.x, max.y));
            locVertexData[4].vertices = this._vertexFromAlphaPoint(cc.p(max.x, max.y));

            //    BOTLEFT 2
            locVertexData[5].texCoords = this._textureCoordFromAlphaPoint(cc.p(max.x, min.y));
            locVertexData[5].vertices = this._vertexFromAlphaPoint(cc.p(max.x, min.y));
        }
    },

    _updateColor:function () {
        if (!this._sprite || !this._vertexData)
            return;

        var sc = this._sprite.getQuad().tl.colors;
        var locVertexData = this._vertexData;
        for (var i = 0, len = this._vertexDataCount; i < len; ++i)
            locVertexData[i].colors = sc;
        this._vertexDataDirty = true;
    },

    _updateProgress:function () {
        var locType = this._type;
        if(locType === cc.PROGRESS_TIMER_TYPE_RADIAL)
            this._updateRadial();
        else if(locType === cc.PROGRESS_TIMER_TYPE_BAR)
            this._updateBar();
        this._updateColor();
        this._vertexDataDirty = true;
    }
});

/**
 * create a progress timer object with image file name that renders the inner sprite according to the percentage
 * @param {cc.Sprite} sprite
 * @return {cc.ProgressTimer}
 * @example
 * // Example
 * var progress = cc.ProgressTimer.create('progress.png')
 */
cc.ProgressTimerWebGL.create = function (sprite) {
    var progressTimer = new cc.ProgressTimerWebGL();
    if (progressTimer.initWithSprite(sprite))
        return progressTimer;
    return null;
};

cc.ProgressTimer = (cc.Browser.supportWebGL) ? cc.ProgressTimerWebGL : cc.ProgressTimerCanvas;


