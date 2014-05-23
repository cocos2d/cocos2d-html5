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
 *
 * @property {cc.Texture2D}     texture         - Current used texture
 * @property {cc.TextureAtlas}  textureAtlas    - Texture atlas for cc.AtlasNode
 * @property {Number}           quadsToDraw     - Number of quads to draw
 *
 */
cc.AtlasNode = cc.NodeRGBA.extend(/** @lends cc.AtlasNode# */{
    textureAtlas: null,
    quadsToDraw: 0,

    RGBAProtocol: true,
    //! chars per row
    _itemsPerRow: 0,
    //! chars per column
    _itemsPerColumn: 0,
    //! width of each char
    _itemWidth: 0,
    //! height of each char
    _itemHeight: 0,

    _colorUnmodified: null,

    // protocol variables
    _opacityModifyRGB: false,
    _blendFunc: null,

    _ignoreContentScaleFactor: false,                               // This variable is only used for CCLabelAtlas FPS display. So plz don't modify its value.
    _className: "AtlasNode",

    /**
     * Creates a cc.AtlasNode with an Atlas file the width and height of each item and the quantity of items to render
     * Constructor of cc.AtlasNode
     * @param {String} tile
     * @param {Number} tileWidth
     * @param {Number} tileHeight
     * @param {Number} itemsToRender
     * @example
     * var node = new cc.AtlasNode("pathOfTile", 16, 16, 1);
     */
    ctor: function (tile, tileWidth, tileHeight, itemsToRender) {
        cc.NodeRGBA.prototype.ctor.call(this);
        this._colorUnmodified = cc.color.WHITE;
        this._blendFunc = {src: cc.BLEND_SRC, dst: cc.BLEND_DST};
        this._ignoreContentScaleFactor = false;

        itemsToRender !== undefined && this.initWithTileFile(tile, tileWidth, tileHeight, itemsToRender);
    },

    /** updates the Atlas (indexed vertex array).
     * Shall be overridden in subclasses
     */
    updateAtlasValues: function () {
        cc.log(cc._LogInfos.AtlasNode_updateAtlasValues);
    },

    /** cc.AtlasNode - RGBA protocol
     * @return {cc.Color}
     */
    getColor: function () {
        if (this._opacityModifyRGB)
            return this._colorUnmodified;
        return cc.NodeRGBA.prototype.getColor.call(this);
    },

    /**
     * @param {Boolean} value
     */
    setOpacityModifyRGB: function (value) {
        var oldColor = this.color;
        this._opacityModifyRGB = value;
        this.color = oldColor;
    },

    /**
     * @return {Boolean}
     */
    isOpacityModifyRGB: function () {
        return this._opacityModifyRGB;
    },

    /** cc.AtlasNode - CocosNodeTexture protocol
     * @return {cc.BlendFunc}
     */
    getBlendFunc: function () {
        return this._blendFunc;
    },

    /**
     * BlendFunc setter
     * @param {Number | cc.BlendFunc} src
     * @param {Number} dst
     */
    setBlendFunc: function (src, dst) {
        if (dst === undefined)
            this._blendFunc = src;
        else
            this._blendFunc = {src: src, dst: dst};
    },

    /**
     * @param {cc.TextureAtlas} value
     */
    setTextureAtlas: function (value) {
        this.textureAtlas = value;
    },

    /**
     * @return {cc.TextureAtlas}
     */
    getTextureAtlas: function () {
        return this.textureAtlas;
    },

    /**
     * @return {Number}
     */
    getQuadsToDraw: function () {
        return this.quadsToDraw;
    },

    /**
     * @param {Number} quadsToDraw
     */
    setQuadsToDraw: function (quadsToDraw) {
        this.quadsToDraw = quadsToDraw;
    },

    _textureForCanvas: null,
    _originalTexture: null,

    _uniformColor: null,
    _colorF32Array: null,

    /** initializes an cc.AtlasNode  with an Atlas file the width and height of each item and the quantity of items to render
     * @param {String} tile
     * @param {Number} tileWidth
     * @param {Number} tileHeight
     * @param {Number} itemsToRender
     * @return {Boolean}
     */
    initWithTileFile: function (tile, tileWidth, tileHeight, itemsToRender) {
        if (!tile)
            throw "cc.AtlasNode.initWithTileFile(): title should not be null";
        var texture = cc.textureCache.addImage(tile);
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
    initWithTexture: null,

    _initWithTextureForCanvas: function (texture, tileWidth, tileHeight, itemsToRender) {
        this._itemWidth = tileWidth;
        this._itemHeight = tileHeight;

        this._opacityModifyRGB = true;
        this._originalTexture = texture;
        if (!this._originalTexture) {
            cc.log(cc._LogInfos.AtlasNode__initWithTexture);
            return false;
        }
        this._textureForCanvas = this._originalTexture;
        this._calculateMaxItems();

        this.quadsToDraw = itemsToRender;
        return true;
    },

    _initWithTextureForWebGL: function (texture, tileWidth, tileHeight, itemsToRender) {
        this._itemWidth = tileWidth;
        this._itemHeight = tileHeight;
        this._colorUnmodified = cc.color.WHITE;
        this._opacityModifyRGB = true;

        this._blendFunc.src = cc.BLEND_SRC;
        this._blendFunc.dst = cc.BLEND_DST;

        var locRealColor = this._realColor;
        this._colorF32Array = new Float32Array([locRealColor.r / 255.0, locRealColor.g / 255.0, locRealColor.b / 255.0, this._realOpacity / 255.0]);
        this.textureAtlas = new cc.TextureAtlas();
        this.textureAtlas.initWithTexture(texture, itemsToRender);

        if (!this.textureAtlas) {
            cc.log(cc._LogInfos.AtlasNode__initWithTexture);
            return false;
        }

        this._updateBlendFunc();
        this._updateOpacityModifyRGB();
        this._calculateMaxItems();
        this.quadsToDraw = itemsToRender;

        //shader stuff
        this.shaderProgram = cc.shaderCache.programForKey(cc.SHADER_POSITION_TEXTURE_UCOLOR);
        this._uniformColor = cc._renderContext.getUniformLocation(this.shaderProgram.getProgram(), "u_color");
        return true;
    },

    draw: null,

    /**
     * @param {WebGLRenderingContext} ctx renderContext
     */
    _drawForWebGL: function (ctx) {
        var context = ctx || cc._renderContext;
        cc.nodeDrawSetup(this);
        cc.glBlendFunc(this._blendFunc.src, this._blendFunc.dst);
        context.uniform4fv(this._uniformColor, this._colorF32Array);
        this.textureAtlas.drawNumberOfQuads(this.quadsToDraw, 0);
    },

    /**
     * @function
     * @param {cc.Color} color3
     */
    setColor: null,

    _setColorForCanvas: function (color3) {
        var locRealColor = this._realColor;
        if ((locRealColor.r == color3.r) && (locRealColor.g == color3.g) && (locRealColor.b == color3.b))
            return;
        var temp = cc.color(color3.r, color3.g, color3.b);
        this._colorUnmodified = color3;

        if (this._opacityModifyRGB) {
            var locDisplayedOpacity = this._displayedOpacity;
            temp.r = temp.r * locDisplayedOpacity / 255;
            temp.g = temp.g * locDisplayedOpacity / 255;
            temp.b = temp.b * locDisplayedOpacity / 255;
        }
        cc.NodeRGBA.prototype.setColor.call(this, color3);

        if (this.texture) {
            var element = this._originalTexture.getHtmlElementObj();
            if (!element)
                return;
            var cacheTextureForColor = cc.textureCache.getTextureColors(element);
            if (cacheTextureForColor) {
                var textureRect = cc.rect(0, 0, element.width, element.height);
                element = cc.generateTintImage(element, cacheTextureForColor, this._realColor, textureRect);
                var locTexture = new cc.Texture2D();
                locTexture.initWithElement(element);
                locTexture.handleLoadedTexture();
                this.texture = locTexture;
            }
        }
    },

    _setColorForWebGL: function (color3) {
        var temp = cc.color(color3.r, color3.g, color3.b);
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
     * @function
     * @param {Number} opacity
     */
    setOpacity: function (opacity) {
    },

    _setOpacityForCanvas: function (opacity) {
        cc.NodeRGBA.prototype.setOpacity.call(this, opacity);
        // special opacity for premultiplied textures
        if (this._opacityModifyRGB) {
            this.color = this._colorUnmodified;
        }
    },

    _setOpacityForWebGL: function (opacity) {
        cc.NodeRGBA.prototype.setOpacity.call(this, opacity);
        // special opacity for premultiplied textures
        if (this._opacityModifyRGB) {
            this.color = this._colorUnmodified;
        } else {
            var locDisplayedColor = this._displayedColor;
            this._colorF32Array = new Float32Array([locDisplayedColor.r / 255.0, locDisplayedColor.g / 255.0,
                locDisplayedColor.b / 255.0, this._displayedOpacity / 255.0]);
        }
    },

    // cc.Texture protocol
    /**
     * returns the used texture
     * @function
     * @return {cc.Texture2D}
     */
    getTexture: null,

    _getTextureForCanvas: function () {
        return  this._textureForCanvas;
    },

    _getTextureForWebGL: function () {
        return  this.textureAtlas.texture;
    },

    /**
     * sets a new texture. it will be retained
     * @function
     * @param {cc.Texture2D} texture
     */
    setTexture: null,

    _setTextureForCanvas: function (texture) {
        this._textureForCanvas = texture;
    },

    _setTextureForWebGL: function (texture) {
        this.textureAtlas.texture = texture;
        this._updateBlendFunc();
        this._updateOpacityModifyRGB();
    },

    _calculateMaxItems: null,

    _calculateMaxItemsForCanvas: function () {
        var selTexture = this.texture;
        var size = selTexture.getContentSize();

        this._itemsPerColumn = 0 | (size.height / this._itemHeight);
        this._itemsPerRow = 0 | (size.width / this._itemWidth);
    },

    _calculateMaxItemsForWebGL: function () {
        var selTexture = this.texture;
        var size = selTexture.getContentSize();
        if (this._ignoreContentScaleFactor)
            size = selTexture.getContentSizeInPixels();

        this._itemsPerColumn = 0 | (size.height / this._itemHeight);
        this._itemsPerRow = 0 | (size.width / this._itemWidth);
    },

    _updateBlendFunc: function () {
        if (!this.textureAtlas.texture.hasPremultipliedAlpha()) {
            this._blendFunc.src = cc.SRC_ALPHA;
            this._blendFunc.dst = cc.ONE_MINUS_SRC_ALPHA;
        }
    },

    _updateOpacityModifyRGB: function () {
        this._opacityModifyRGB = this.textureAtlas.texture.hasPremultipliedAlpha();
    },

    _setIgnoreContentScaleFactor: function (ignoreContentScaleFactor) {
        this._ignoreContentScaleFactor = ignoreContentScaleFactor;
    }
});

var _p = cc.AtlasNode.prototype;
if (cc._renderType === cc._RENDER_TYPE_WEBGL) {
    _p.initWithTexture = _p._initWithTextureForWebGL;
    _p.draw = _p._drawForWebGL;
    _p.setColor = _p._setColorForWebGL;
    _p.setOpacity = _p._setOpacityForWebGL;
    _p.getTexture = _p._getTextureForWebGL;
    _p.setTexture = _p._setTextureForWebGL;
    _p._calculateMaxItems = _p._calculateMaxItemsForWebGL;
} else {
    _p.initWithTexture = _p._initWithTextureForCanvas;
    _p.draw = cc.Node.prototype.draw;
    _p.setColor = _p._setColorForCanvas;
    _p.setOpacity = _p._setOpacityForCanvas;
    _p.getTexture = _p._getTextureForCanvas;
    _p.setTexture = _p._setTextureForCanvas;
    _p._calculateMaxItems = _p._calculateMaxItemsForCanvas;
}

// Override properties
cc.defineGetterSetter(_p, "opacity", _p.getOpacity, _p.setOpacity);
cc.defineGetterSetter(_p, "color", _p.getColor, _p.setColor);

// Extended properties
/** @expose */
_p.texture;
cc.defineGetterSetter(_p, "texture", _p.getTexture, _p.setTexture);
/** @expose */
_p.textureAtlas;
/** @expose */
_p.quadsToDraw;


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
    return new cc.AtlasNode(tile, tileWidth, tileHeight, itemsToRender);
};

