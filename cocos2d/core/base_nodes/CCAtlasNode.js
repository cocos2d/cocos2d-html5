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
 * cc.TextureProtocol protocol</p>
 *
 * <p> It knows how to render a TextureAtlas object.  <br/>
 * If you are going to render a TextureAtlas consider subclassing cc.AtlasNode (or a subclass of cc.AtlasNode)</p>
 *
 * <p> All features from cc.Node are valid, plus the following features:  <br/>
 * - opacity and RGB colors </p>
 * @class
 * @extends cc.NodeRGBA
 */
cc.AtlasNode = cc.NodeRGBA.extend(/** @lends cc.AtlasNode# */{
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
        cc.NodeRGBA.prototype.ctor.call(this);
        this._colorUnmodified = cc.white();
        this._blendFunc = {src:cc.BLEND_SRC, dst:cc.BLEND_DST};
        this._ignoreContentScaleFactor = false;
    },

    /** updates the Atlas (indexed vertex array).
     * Shall be overridden in subclasses
     */
    updateAtlasValues:function () {
        cc.log("cc.AtlasNode.updateAtlasValues(): Shall be overridden in subclasses") ;
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
        if (dst === undefined)
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

    _textureForCanvas:null,
    _originalTexture:null,

    _uniformColor:null,
    _colorF32Array:null,

    /** initializes an cc.AtlasNode  with an Atlas file the width and height of each item and the quantity of items to render
     * @param {String} tile
     * @param {Number} tileWidth
     * @param {Number} tileHeight
     * @param {Number} itemsToRender
     * @return {Boolean}
     */
    initWithTileFile:function (tile, tileWidth, tileHeight, itemsToRender) {
        if(!tile)
            throw "cc.AtlasNode.initWithTileFile(): title should not be null";
        var texture = cc.TextureCache.getInstance().addImage(tile);
        return this.initWithTexture(texture, tileWidth, tileHeight, itemsToRender);
    },

    /**
     * initializes an CCAtlasNode  with a texture the width and height of each item measured in points and the quantity of items to render
     * @param {cc.Texture2D} texture
     * @param {Number} tileWidth
     * @param {Number} tileHeight
     * @param {Number} itemsToRender
     * @return {Boolean}
     */
    initWithTexture:null,

    _initWithTextureForCanvas:function(texture, tileWidth, tileHeight, itemsToRender){
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

    _initWithTextureForWebGL:function(texture, tileWidth, tileHeight, itemsToRender){
        this._itemWidth = tileWidth;
        this._itemHeight = tileHeight;
        this._colorUnmodified = cc.white();
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

    draw:null,

    /**
     * @param {WebGLRenderingContext} ctx renderContext
     */
    _drawForWebGL:function (ctx) {
        var context = ctx || cc.renderContext;
        cc.NODE_DRAW_SETUP(this);
        cc.glBlendFunc(this._blendFunc.src, this._blendFunc.dst);
        context.uniform4fv(this._uniformColor, this._colorF32Array);
        this._textureAtlas.drawNumberOfQuads(this._quadsToDraw, 0);
    },

    /**
     * @param {cc.Color3B} color3
     */
    setColor:null,

    _setColorForCanvas:function (color3) {
        var locRealColor = this._realColor;
        if ((locRealColor.r == color3.r) && (locRealColor.g == color3.g) && (locRealColor.b == color3.b))
            return;
        var temp = new cc.Color3B(color3.r,color3.g,color3.b);
        this._colorUnmodified = color3;

        if (this._opacityModifyRGB) {
            var locDisplayedOpacity = this._displayedOpacity;
            temp.r = temp.r * locDisplayedOpacity / 255;
            temp.g = temp.g * locDisplayedOpacity / 255;
            temp.b = temp.b * locDisplayedOpacity / 255;
        }
        cc.NodeRGBA.prototype.setColor.call(this, color3);

        if (this.getTexture()) {
            var element = this._originalTexture.getHtmlElementObj();
            if(!element)
                return;
            var cacheTextureForColor = cc.TextureCache.getInstance().getTextureColors(element);
            if (cacheTextureForColor) {
                var textureRect = cc.rect(0, 0, element.width, element.height);
                element = cc.generateTintImage(element, cacheTextureForColor, this._realColor, textureRect);
                var locTexture = new cc.Texture2D();
                locTexture.initWithElement(element);
                locTexture.handleLoadedTexture();
                this.setTexture(locTexture);
            }
        }
    },

    _setColorForWebGL:function (color3) {
        var temp = cc.Color3B(color3.r,color3.g,color3.b);
        this._colorUnmodified = color3;
        var locDisplayedOpacity = this._displayedOpacity;
        if (this._opacityModifyRGB) {
            temp.r = temp.r * locDisplayedOpacity / 255;
            temp.g = temp.g * locDisplayedOpacity / 255;
            temp.b = temp.b * locDisplayedOpacity / 255;
        }
        cc.NodeRGBA.prototype.setColor.call(this, color3);
        var locDisplayedColor = this._displayedColor;
        this._colorF32Array = new Float32Array([locDisplayedColor.r / 255.0, locDisplayedColor.g / 255.0,
            locDisplayedColor.b / 255.0, locDisplayedOpacity / 255.0]);
    },

    /**
     * @param {Number} opacity
     */
    setOpacity: null,

    _setOpacityForCanvas: function (opacity) {
        cc.NodeRGBA.prototype.setOpacity.call(this, opacity);
        // special opacity for premultiplied textures
        if (this._opacityModifyRGB) {
            this.setColor(this._colorUnmodified);
        }
    },

    _setOpacityForWebGL: function (opacity) {
        cc.NodeRGBA.prototype.setOpacity.call(this, opacity);
        // special opacity for premultiplied textures
        if (this._opacityModifyRGB) {
            this.setColor(this._colorUnmodified);
        } else {
            var locDisplayedColor = this._displayedColor;
            this._colorF32Array = new Float32Array([locDisplayedColor.r / 255.0, locDisplayedColor.g / 255.0,
                locDisplayedColor.b / 255.0, this._displayedOpacity / 255.0]);
        }
    },

    // cc.Texture protocol
    /**
     * returns the used texture
     * @return {cc.Texture2D}
     */
    getTexture: null,

    _getTextureForCanvas: function () {
        return  this._textureForCanvas;
    },

    _getTextureForWebGL: function () {
        return  this._textureAtlas.getTexture();
    },

    /** sets a new texture. it will be retained
     * @param {cc.Texture2D} texture
     */
    setTexture: null,

    _setTextureForCanvas: function (texture) {
        this._textureForCanvas = texture;
    },

    _setTextureForWebGL: function (texture) {
        this._textureAtlas.setTexture(texture);
        this._updateBlendFunc();
        this._updateOpacityModifyRGB();
    },

    _calculateMaxItems:null,

    _calculateMaxItemsForCanvas:function () {
        var selTexture = this.getTexture();
        var size = selTexture.getContentSize();

        this._itemsPerColumn = 0 | (size.height / this._itemHeight);
        this._itemsPerRow = 0 | (size.width / this._itemWidth);
    },

    _calculateMaxItemsForWebGL:function () {
        var selTexture = this.getTexture();
        var size = selTexture.getContentSize();
        if(this._ignoreContentScaleFactor)
            size = selTexture.getContentSizeInPixels();

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

if(cc.Browser.supportWebGL){
    cc.AtlasNode.prototype.initWithTexture = cc.AtlasNode.prototype._initWithTextureForWebGL;
    cc.AtlasNode.prototype.draw = cc.AtlasNode.prototype._drawForWebGL;
    cc.AtlasNode.prototype.setColor = cc.AtlasNode.prototype._setColorForWebGL;
    cc.AtlasNode.prototype.setOpacity = cc.AtlasNode.prototype._setOpacityForWebGL;
    cc.AtlasNode.prototype.getTexture = cc.AtlasNode.prototype._getTextureForWebGL;
    cc.AtlasNode.prototype.setTexture = cc.AtlasNode.prototype._setTextureForWebGL;
    cc.AtlasNode.prototype._calculateMaxItems = cc.AtlasNode.prototype._calculateMaxItemsForWebGL;
} else {
    cc.AtlasNode.prototype.initWithTexture = cc.AtlasNode.prototype._initWithTextureForCanvas;
    cc.AtlasNode.prototype.draw = cc.Node.prototype.draw;
    cc.AtlasNode.prototype.setColor = cc.AtlasNode.prototype._setColorForCanvas;
    cc.AtlasNode.prototype.setOpacity = cc.AtlasNode.prototype._setOpacityForCanvas;
    cc.AtlasNode.prototype.getTexture = cc.AtlasNode.prototype._getTextureForCanvas;
    cc.AtlasNode.prototype.setTexture = cc.AtlasNode.prototype._setTextureForCanvas;
    cc.AtlasNode.prototype._calculateMaxItems = cc.AtlasNode.prototype._calculateMaxItemsForCanvas;
}

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

