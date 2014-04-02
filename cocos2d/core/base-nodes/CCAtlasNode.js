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
 *
 * @property {cc.Texture2D}     texture         - Current used texture
 * @property {cc.TextureAtlas}  textureAtlas    - Texture atlas for cc.AtlasNode
 * @property {Number}           quadsToDraw     - Number of quads to draw
 *
 */
cc.AtlasNode = cc.NodeRGBA.extend(/** @lends cc.AtlasNode# */{
	textureAtlas:null,
	quadsToDraw:0,

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

    // protocol variables
    _opacityModifyRGB:false,
    _blendFunc:null,

    _ignoreContentScaleFactor:false,                               // This variable is only used for CCLabelAtlas FPS display. So plz don't modify its value.
    _className:"AtlasNode",

    ctor:function () {
        cc.NodeRGBA.prototype.ctor.call(this);
        this._colorUnmodified = cc.color.WHITE;
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
     * @return {cc.Color}
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
        var oldColor = this.color;
        this._opacityModifyRGB = value;
        this.color = oldColor;
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
        this.textureAtlas = value;
    },

    /**
     * @return {cc.TextureAtlas}
     */
    getTextureAtlas:function () {
        return this.textureAtlas;
    },

    /**
     * @return {Number}
     */
    getQuadsToDraw:function () {
        return this.quadsToDraw;
    },

    /**
     * @param {Number} quadsToDraw
     */
    setQuadsToDraw:function (quadsToDraw) {
        this.quadsToDraw = quadsToDraw;
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
    initWithTexture:null,

    draw:null,

    /**
     * @function
     * @param {cc.Color} color3
     */
    setColor: null,

    /**
     * @function
     * @param {Number} opacity
     */
    setOpacity: function (opacity) {},

    // cc.Texture protocol
    texture:null,
    /**
     * returns the used texture
     * @function
     * @return {cc.Texture2D}
     */
    getTexture: null,

    /**
     * sets a new texture. it will be retained
     * @function
     * @param {cc.Texture2D} texture
     */
    setTexture: null,

    _calculateMaxItems:null,

    _updateBlendFunc:function () {
        if (!this.textureAtlas.texture.hasPremultipliedAlpha()) {
            this._blendFunc.src = cc.SRC_ALPHA;
            this._blendFunc.dst = cc.ONE_MINUS_SRC_ALPHA;
        }
    },

    _updateOpacityModifyRGB:function () {
        this._opacityModifyRGB = this.textureAtlas.texture.hasPremultipliedAlpha();
    },

    _setIgnoreContentScaleFactor:function(ignoreContentScaleFactor){
        this._ignoreContentScaleFactor = ignoreContentScaleFactor;
    }
});

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

