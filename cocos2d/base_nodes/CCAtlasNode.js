/****************************************************************************
 Copyright (c) 2010-2012 cocos2d-x.org
 Copyright (c) 2008-2010 Ricardo Quesada
 Copyright (c) 2011      Zynga Inc.

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

/** <p> cc.AtlasNode is a subclass of cc.Node that implements the cc.RGBAProtocol and<br/>
 * cc.TextureProtocol protocol (Canvas implement)</p>
 *
 * <p> It knows how to render a TextureAtlas object.  <br/>
 * If you are going to render a TextureAtlas consider subclassing cc.AtlasNode (or a subclass of cc.AtlasNode)</p>
 *
 * <p> All features from cc.Node are valid, plus the following features:  <br/>
 * - opacity and RGB colors </p>
 * @class
 * @extends cc.Node
 */
cc.AtlasNodeCanvas = cc.Node.extend(/** @lends cc.AtlasNode# */{
    /// ----    common properties start    ----
    RGBAProtocol:true,
    //! chars per row
    _itemsPerRow:0,
    //! chars per column
    _itemsPerColumn:0,
    //! width of each char
    _itemWidth:0,
    //! height of each char
    _itemHeight:0,

    _colorUnmodified:null,
    _textureAtlas:null,

    // protocol variables
    _opacityModifyRGB:false,
    _blendFunc:null,

    _opacity:0,
    _color:null,

    // quads to draw
    _quadsToDraw:0,

    ctor:function () {
        this._super();
        this._colorUnmodified = cc.WHITE;
        this._color = cc.white();
        this._blendFunc = {src:cc.BLEND_SRC, dst:cc.BLEND_DST};
        this._opacity = 255;
    },

    /** updates the Atlas (indexed vertex array).
     * Shall be overridden in subclasses
     */
    updateAtlasValues:function () {
        cc.Assert(false, "cc.AtlasNode:Abstract updateAtlasValue not overridden");
    },

    /** cc.AtlasNode - RGBA protocol
     * @return {cc.Color3B}
     */
    getColor:function () {
        if (this._opacityModifyRGB)
            return this._colorUnmodified;
        return this._color;
    },

    /**
     * @return {Number}
     */
    getOpacity:function () {
        return this._opacity;
    },

    /**
     * @param {Boolean} value
     */
    setOpacityModifyRGB:function (value) {
        var oldColor = this.getColor();
        this._opacityModifyRGB = value;
        this.setColor(oldColor);
    },

    /**
     * @return {Boolean}
     */
    isOpacityModifyRGB:function () {
        return this._opacityModifyRGB;
    },

    /** cc.AtlasNode - CocosNodeTexture protocol
     * @return {cc.BlendFunc}
     */
    getBlendFunc:function () {
        return this._blendFunc;
    },

    /**
     * BlendFunc setter
     * @param {Number | cc.BlendFunc} src
     * @param {Number} dst
     */
    setBlendFunc:function (src, dst) {
        if (arguments.length == 1)
            this._blendFunc = src;
        else
            this._blendFunc = {src:src, dst:dst};
    },

    /**
     * @param {cc.TextureAtlas} value
     */
    setTextureAtlas:function (value) {
        this._textureAtlas = value;
    },

    /**
     * @return {cc.TextureAtlas}
     */
    getTextureAtlas:function () {
        return this._textureAtlas;
    },

    /**
     * @return {Number}
     */
    getQuadsToDraw:function () {
        return this._quadsToDraw;
    },

    /**
     * @param {Number} quadsToDraw
     */
    setQuadsToDraw:function (quadsToDraw) {
        this._quadsToDraw = quadsToDraw;
    },
    /// ----    common properties end      ----

    _textureForCanvas:null,
    _originalTexture:null,
    _colorF32Array:null,

    /** initializes an cc.AtlasNode  with an Atlas file the width and height of each item and the quantity of items to render
     * @param {String} tile
     * @param {Number} tileWidth
     * @param {Number} tileHeight
     * @param {Number} itemsToRender
     * @return {Boolean}
     */
    initWithTileFile:function (tile, tileWidth, tileHeight, itemsToRender) {
        cc.Assert(tile != null, "title should not be null");
        this._itemWidth = tileWidth;
        this._itemHeight = tileHeight;

        this._opacityModifyRGB = true;
        this._originalTexture = cc.TextureCache.getInstance().addImage(tile);
        if (!this._originalTexture) {
            cc.log("cocos2d: Could not initialize cc.AtlasNode. Invalid Texture.");
            return false;
        }
        this._textureForCanvas = this._originalTexture;
        this._calculateMaxItems();

        this._quadsToDraw = itemsToRender;
        return true;
    },

    /**
     * @param {cc.Color3B} color3
     */
    setColor:function (color3) {
        if ((this._color.r == color3.r) && (this._color.g == color3.g) && (this._color.b == color3.b))
            return;
        this._color = this._colorUnmodified = color3;
        if (this.getTexture()) {
            var cacheTextureForColor = cc.TextureCache.getInstance().getTextureColors(this._originalTexture);
            if (cacheTextureForColor) {
                var tx = this._originalTexture;
                var textureRect = cc.rect(0, 0, tx.width, tx.height);
                var colorTexture = cc.generateTintImage(tx, cacheTextureForColor, this._color, textureRect);
                this.setTexture(colorTexture);
            }
        }

        if (this._opacityModifyRGB) {
            this._color.r = color3.r * this._opacity / 255;
            this._color.g = color3.g * this._opacity / 255;
            this._color.b = color3.b * this._opacity / 255;
        }
    },

    /**
     * @param {Number} opacity
     */
    setOpacity:function (opacity) {
        this._opacity = opacity;
        // special opacity for premultiplied textures
        if (this._opacityModifyRGB) {
            this.setColor(this._colorUnmodified);
        }
    },

    // cc.Texture protocol
    /**
     * returns the used texture
     * @return {cc.Texture2D}
     */
    getTexture:function () {
        return  this._textureForCanvas;
    },

    /** sets a new texture. it will be retained
     * @param {HTMLCanvasElement|HTMLImageElement} texture
     */
    setTexture:function (texture) {
        this._textureForCanvas = texture;
    },

    _calculateMaxItems:function () {
        var selTexture = this.getTexture();
        var size = cc.size(selTexture.width, selTexture.height);

        this._itemsPerColumn = 0 | (size.height / this._itemHeight);
        this._itemsPerRow = 0 | (size.width / this._itemWidth);
    }
});

/** creates a cc.AtlasNodeCanvas  with an Atlas file the width and height of each item and the quantity of items to render
 * @param {String} tile
 * @param {Number} tileWidth
 * @param {Number} tileHeight
 * @param {Number} itemsToRender
 * @return {cc.AtlasNode}
 * @example
 * // example
 * var node = cc.AtlasNode.create("pathOfTile", 16, 16, 1);
 */
cc.AtlasNodeCanvas.create = function (tile, tileWidth, tileHeight, itemsToRender) {
    var ret = new cc.AtlasNodeCanvas();
    if (ret.initWithTileFile(tile, tileWidth, tileHeight, itemsToRender))
        return ret;
    return null;
};

/** <p> cc.AtlasNode is a subclass of cc.Node that implements the cc.RGBAProtocol and<br/>
 * cc.TextureProtocol protocol (WebGL implement)</p>
 *
 * <p> It knows how to render a TextureAtlas object.  <br/>
 * If you are going to render a TextureAtlas consider subclassing cc.AtlasNode (or a subclass of cc.AtlasNode)</p>
 *
 * <p> All features from cc.Node are valid, plus the following features:  <br/>
 * - opacity and RGB colors </p>
 * @class
 * @extends cc.Node
 */
cc.AtlasNodeWebGL = cc.Node.extend({
    /// ----    common properties start    ----
    RGBAProtocol:true,
    //! chars per row
    _itemsPerRow:0,
    //! chars per column
    _itemsPerColumn:0,
    //! width of each char
    _itemWidth:0,
    //! height of each char
    _itemHeight:0,

    _colorUnmodified:null,
    _textureAtlas:null,

    // protocol variables
    _opacityModifyRGB:false,
    _blendFunc:null,

    _opacity:0,
    _color:null,

    // quads to draw
    _quadsToDraw:0,

    ctor:function () {
        this._super();
        this._colorUnmodified = cc.WHITE;
        this._color = cc.white();
        this._blendFunc = {src:cc.BLEND_SRC, dst:cc.BLEND_DST};
        this._opacity = 255;
    },

    /** updates the Atlas (indexed vertex array).
     * Shall be overridden in subclasses
     */
    updateAtlasValues:function () {
        cc.Assert(false, "cc.AtlasNode:Abstract updateAtlasValue not overridden");
    },

    /** cc.AtlasNode - RGBA protocol
     * @return {cc.Color3B}
     */
    getColor:function () {
        if (this._opacityModifyRGB)
            return this._colorUnmodified;
        return this._color;
    },

    /**
     * @return {Number}
     */
    getOpacity:function () {
        return this._opacity;
    },

    /**
     * @param {Boolean} value
     */
    setOpacityModifyRGB:function (value) {
        var oldColor = this.getColor();
        this._opacityModifyRGB = value;
        this.setColor(oldColor);
    },

    /**
     * @return {Boolean}
     */
    isOpacityModifyRGB:function () {
        return this._opacityModifyRGB;
    },

    /** cc.AtlasNode - CocosNodeTexture protocol
     * @return {cc.BlendFunc}
     */
    getBlendFunc:function () {
        return this._blendFunc;
    },

    /**
     * BlendFunc setter
     * @param {Number | cc.BlendFunc} src
     * @param {Number} dst
     */
    setBlendFunc:function (src, dst) {
        if (arguments.length == 1)
            this._blendFunc = src;
        else
            this._blendFunc = {src:src, dst:dst};
    },

    /**
     * @param {cc.TextureAtlas} value
     */
    setTextureAtlas:function (value) {
        this._textureAtlas = value;
    },

    /**
     * @return {cc.TextureAtlas}
     */
    getTextureAtlas:function () {
        return this._textureAtlas;
    },

    /**
     * @return {Number}
     */
    getQuadsToDraw:function () {
        return this._quadsToDraw;
    },

    /**
     * @param {Number} quadsToDraw
     */
    setQuadsToDraw:function (quadsToDraw) {
        this._quadsToDraw = quadsToDraw;
    },
    /// ----    common properties end      ----

    _uniformColor:null,

    /** initializes an cc.AtlasNode  with an Atlas file the width and height of each item and the quantity of items to render
     * @param {String} tile
     * @param {Number} tileWidth
     * @param {Number} tileHeight
     * @param {Number} itemsToRender
     * @return {Boolean}
     */
    initWithTileFile:function (tile, tileWidth, tileHeight, itemsToRender) {
        cc.Assert(tile != null, "title should not be null");
        this._itemWidth = tileWidth;
        this._itemHeight = tileHeight;
        this._opacityModifyRGB = true;

        this._colorF32Array = new Float32Array([this._color.r / 255.0, this._color.g / 255.0, this._color.b / 255.0, this._opacity / 255.0]);
        var newAtlas = new cc.TextureAtlas();
        newAtlas.initWithFile(tile, itemsToRender);
        this.setTextureAtlas(newAtlas);
        if (!this._textureAtlas) {
            cc.log("cocos2d: Could not initialize cc.AtlasNode. Invalid Texture.");
            return false;
        }

        this._updateBlendFunc();
        this._updateOpacityModifyRGB();
        this._calculateMaxItems();
        this._quadsToDraw = itemsToRender;

        //shader stuff
        this.setShaderProgram(cc.ShaderCache.getInstance().programForKey(cc.SHADER_POSITION_TEXTURE_UCOLOR));
        this._uniformColor = cc.renderContext.getUniformLocation(this.getShaderProgram().getProgram(), "u_color");
        return true;
    },

    /**
     * @param {WebGLRenderingContext} ctx CanvasContext
     */
    draw:function (ctx) {
        var context = ctx || cc.renderContext;
        cc.NODE_DRAW_SETUP(this);
        cc.glBlendFunc(this._blendFunc.src, this._blendFunc.dst);
        context.uniform4fv(this._uniformColor, this._colorF32Array);
        this._textureAtlas.drawNumberOfQuads(this._quadsToDraw, 0);
    },

    /**
     * @param {cc.Color3B} color3
     */
    setColor:function (color3) {
        if ((this._color.r == color3.r) && (this._color.g == color3.g) && (this._color.b == color3.b))
            return;
        this._color = this._colorUnmodified = color3;

        if (this._opacityModifyRGB) {
            this._color.r = color3.r * this._opacity / 255;
            this._color.g = color3.g * this._opacity / 255;
            this._color.b = color3.b * this._opacity / 255;
        }
        this._colorF32Array = new Float32Array([this._color.r / 255.0, this._color.g / 255.0, this._color.b / 255.0, this._opacity / 255.0]);
    },

    /**
     * @param {Number} opacity
     */
    setOpacity:function (opacity) {
        this._opacity = opacity;
        // special opacity for premultiplied textures
        if (this._opacityModifyRGB) {
            this.setColor(this._colorUnmodified);
        } else {
            this._colorF32Array = new Float32Array([this._color.r / 255.0, this._color.g / 255.0, this._color.b / 255.0, this._opacity / 255.0]);
        }
    },

    // cc.Texture protocol
    /**
     * returns the used texture
     * @return {cc.Texture2D}
     */
    getTexture:function () {
        return  this._textureAtlas.getTexture();
    },

    /** sets a new texture. it will be retained
     * @param {cc.Texture2D} texture
     */
    setTexture:function (texture) {
        this._textureAtlas.setTexture(texture);
        this._updateBlendFunc();
        this._updateOpacityModifyRGB();
    },

    _calculateMaxItems:function () {
        var selTexture = this.getTexture();
        var size = selTexture.getContentSize();

        this._itemsPerColumn = 0 | (size.height / this._itemHeight);
        this._itemsPerRow = 0 | (size.width / this._itemWidth);
    },

    _updateBlendFunc:function () {
        if (!this._textureAtlas.getTexture().hasPremultipliedAlpha()) {
            this._blendFunc.src = gl.SRC_ALPHA;
            this._blendFunc.dst = gl.ONE_MINUS_SRC_ALPHA;
        }
    },

    _updateOpacityModifyRGB:function () {
        this._opacityModifyRGB = this._textureAtlas.getTexture().hasPremultipliedAlpha();
    }
});

/** creates a cc.AtlasNodeWebGL  with an Atlas file the width and height of each item and the quantity of items to render
 * @param {String} tile
 * @param {Number} tileWidth
 * @param {Number} tileHeight
 * @param {Number} itemsToRender
 * @return {cc.AtlasNode}
 * @example
 * // example
 * var node = cc.AtlasNode.create("pathOfTile", 16, 16, 1);
 */
cc.AtlasNodeWebGL.create = function (tile, tileWidth, tileHeight, itemsToRender) {
    var ret = new cc.AtlasNodeWebGL();
    if (ret.initWithTileFile(tile, tileWidth, tileHeight, itemsToRender))
        return ret;
    return null;
};

cc.AtlasNode = cc.Browser.supportWebGL ? cc.AtlasNodeWebGL : cc.AtlasNodeCanvas;


