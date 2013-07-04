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
 * @extends cc.NodeRGBA
 */
cc.AtlasNodeCanvas = cc.NodeRGBA.extend(/** @lends cc.AtlasNode# */{
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

    // quads to draw
    _quadsToDraw:0,
    _ignoreContentScaleFactor:false,                               // This variable is only used for CCLabelAtlas FPS display. So plz don't modify its value.

    ctor:function () {
        this._super();
        this._colorUnmodified = cc.white();
        this._blendFunc = {src:cc.BLEND_SRC, dst:cc.BLEND_DST};
        this._ignoreContentScaleFactor = false;
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
        return cc.NodeRGBA.prototype.getColor.call(this);
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

    /** initializes an cc.AtlasNode  with an Atlas file the width and height of each item and the quantity of items to render
     * @param {String} tile
     * @param {Number} tileWidth
     * @param {Number} tileHeight
     * @param {Number} itemsToRender
     * @return {Boolean}
     */
    initWithTileFile:function (tile, tileWidth, tileHeight, itemsToRender) {
        cc.Assert(tile != null, "title should not be null");
        var texture = cc.TextureCache.getInstance().addImage(tile);
        return this.initWithTexture(texture, tileWidth, tileHeight, itemsToRender);
    },

    /**
     * initializes an CCAtlasNode  with a texture the width and height of each item measured in points and the quantity of items to render
     * @param {HTMLImageElement|HTMLCanvasElement} texture
     * @param {Number} tileWidth
     * @param {Number} tileHeight
     * @param {Number} itemsToRender
     * @returen {Boolean}
     */
    initWithTexture:function(texture, tileWidth, tileHeight, itemsToRender){
        this._itemWidth = tileWidth;
        this._itemHeight = tileHeight;

        this._opacityModifyRGB = true;
        this._originalTexture = texture;
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
        if ((this._realColor.r == color3.r) && (this._realColor.g == color3.g) && (this._realColor.b == color3.b))
            return;
        var temp = new cc.Color3B(color3.r,color3.g,color3.b);
        this._colorUnmodified = color3;

        if (this._opacityModifyRGB) {
            temp.r = temp.r * this._displayedOpacity / 255;
            temp.g = temp.g * this._displayedOpacity / 255;
            temp.b = temp.b * this._displayedOpacity / 255;
        }
        cc.NodeRGBA.prototype.setColor.call(this, color3);
        if (this.getTexture()) {
            var cacheTextureForColor = cc.TextureCache.getInstance().getTextureColors(this._originalTexture);
            if (cacheTextureForColor) {
                var tx = this._originalTexture;
                var textureRect = cc.rect(0, 0, tx.width, tx.height);
                var colorTexture = cc.generateTintImage(tx, cacheTextureForColor, this._realColor, textureRect);
                this.setTexture(colorTexture);
            }
        }
    },

    /**
     * @param {Number} opacity
     */
    setOpacity:function (opacity) {
        cc.NodeRGBA.prototype.setOpacity.call(this, opacity);

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
    },

    _setIgnoreContentScaleFactor:function(ignoreContentScaleFactor){
        this._ignoreContentScaleFactor = ignoreContentScaleFactor;
    }
});

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
cc.AtlasNodeWebGL = cc.NodeRGBA.extend({
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

    // quads to draw
    _quadsToDraw:0,
    _ignoreContentScaleFactor:false,                               // This variable is only used for CCLabelAtlas FPS display. So plz don't modify its value.

    ctor:function () {
        this._super();
        this._colorUnmodified = cc.white();
        this._blendFunc = {src:cc.BLEND_SRC, dst:cc.BLEND_DST};
        this._ignoreContentScaleFactor = false;
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
        return cc.NodeRGBA.prototype.getColor.call(this);
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
        var texture = cc.TextureCache.getInstance().addImage(tile);
        return this.initWithTexture(texture, tileWidth, tileHeight, itemsToRender);
    },

    /**
     * initializes an CCAtlasNode  with a texture the width and height of each item measured in points and the quantity of items to render
     * @param {cc.Texture2D} texture
     * @param {Number} tileWidth
     * @param {Number} tileHeight
     * @param {Number} itemsToRender
     * @returen {Boolean}
     */
    initWithTexture:function(texture, tileWidth, tileHeight, itemsToRender){
        this._itemWidth = tileWidth;
        this._itemHeight = tileHeight;
        this._colorUnmodified = cc.WHITE;
        this._opacityModifyRGB = true;

        this._blendFunc.src = cc.BLEND_SRC;
        this._blendFunc.dst = cc.BLEND_DST;

        var locRealColor = this._realColor;
        this._colorF32Array = new Float32Array([locRealColor.r / 255.0, locRealColor.g / 255.0, locRealColor.b / 255.0, this._realOpacity / 255.0]);
        this._textureAtlas = new cc.TextureAtlas();
        this._textureAtlas.initWithTexture(texture, itemsToRender);

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
     * @param {WebGLRenderingContext} ctx renderContext
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
        var temp = cc.Color3B(color3.r,color3.g,color3.b);
        this._colorUnmodified = color3;

        if (this._opacityModifyRGB) {
            temp.r = temp.r * this._displayedOpacity / 255;
            temp.g = temp.g * this._displayedOpacity / 255;
            temp.b = temp.b * this._displayedOpacity / 255;
        }
        cc.NodeRGBA.prototype.setColor.call(this, color3);
        this._colorF32Array = new Float32Array([this._displayedColor.r / 255.0, this._displayedColor.g / 255.0,
            this._displayedColor.b / 255.0, this._displayedOpacity / 255.0]);
    },

    /**
     * @param {Number} opacity
     */
    setOpacity:function (opacity) {
        cc.NodeRGBA.prototype.setOpacity.call(this, opacity);
        // special opacity for premultiplied textures
        if (this._opacityModifyRGB) {
            this.setColor(this._colorUnmodified);
        } else {
            var locDisplayedColor = this._displayedColor;
            this._colorF32Array = new Float32Array([locDisplayedColor.r / 255.0, locDisplayedColor.g / 255.0, locDisplayedColor.b / 255.0, this._displayedOpacity / 255.0]);
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
        if(this._ignoreContentScaleFactor){
            size = selTexture.getContentSizeInPixels();
        }

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
    },

    _setIgnoreContentScaleFactor:function(ignoreContentScaleFactor){
        this._ignoreContentScaleFactor = ignoreContentScaleFactor;
    }
});

cc.AtlasNode = cc.Browser.supportWebGL ? cc.AtlasNodeWebGL : cc.AtlasNodeCanvas;

/** creates a cc.AtlasNode with an Atlas file the width and height of each item and the quantity of items to render
 * @param {String} tile
 * @param {Number} tileWidth
 * @param {Number} tileHeight
 * @param {Number} itemsToRender
 * @return {cc.AtlasNode}
 * @example
 * // example
 * var node = cc.AtlasNode.create("pathOfTile", 16, 16, 1);
 */
cc.AtlasNode.create = function (tile, tileWidth, tileHeight, itemsToRender) {
    var ret = new cc.AtlasNode();
    if (ret.initWithTileFile(tile, tileWidth, tileHeight, itemsToRender))
        return ret;
    return null;
};

