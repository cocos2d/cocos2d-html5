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
 * @extends cc.Node
 */
cc.AtlasNode = cc.Node.extend(/** @lends cc.AtlasNode# */{
    RGBAProtocol:true,
    //! chars per row
    _itemsPerRow:0,
    //! chars per column
    _itemsPerColumn:0,
    //! width of each char
    _itemWidth:0,
    //! height of each char
    _itemHeight:0,
    _colorUnmodified:cc.c3b(0, 0, 0),
    _textureAtlas:null,
    // protocol variables
    _isOpacityModifyRGB:false,
    _blendFunc: {src:cc.BLEND_SRC, dst:cc.BLEND_DST},
    _opacity:0,
    _color:null,
    _originalTexture:null,
    // quads to draw
    _quadsToDraw:0,
    _uniformColor:0,

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

        this._opacity = 255;
        this._color = cc.white();
        this._colorUnmodified = cc.white();
        this._isOpacityModifyRGB = true;

        this._blendFunc.src = cc.BLEND_SRC;
        this._blendFunc.dst = cc.BLEND_DST;

        var newAtlas = new cc.TextureAtlas();
        newAtlas.initWithFile(tile, itemsToRender);
        this.setTextureAtlas(newAtlas);

        if (cc.renderContextType == cc.CANVAS) {
            this._originalTexture = this._textureAtlas.getTexture();
        }

        if (!this._textureAtlas) {
            cc.log("cocos2d: Could not initialize cc.AtlasNode. Invalid Texture.");
            return false;
        }

        this._updateBlendFunc();
        this._updateOpacityModifyRGB();

        this._calculateMaxItems();

        this._quadsToDraw = itemsToRender;

        //shader stuff
        //this.setShaderProgram(cc.ShaderCache.getInstance().programForKey(kCCShader_PositionTexture_uColor));
        //this._uniformColor = glGetUniformLocation( this.getShaderProgram().getProgram(), "u_color");

        return true;

    },

    /** updates the Atlas (indexed vertex array).
     * Shall be overriden in subclasses
     */
    updateAtlasValues:function () {
        cc.Assert(false, "cc.AtlasNode:Abstract updateAtlasValue not overriden");
    },

    /**
     * @param {CanvasContext} ctx   CanvasContext
     */
    draw:function (ctx) {
        this._super();
        if (cc.renderContextType == cc.CANVAS) {

        } else {
            //TODO for WebGL
            //cc.NODE_DRAW_SETUP();

            //ccGLBlendFunc( this._blendFunc.src, this._blendFunc.dst );

            //var colors = [this._color.r / 255.0, this._color.g / 255.0, this._color.b / 255.0, this._opacity / 255.0];
            //this.getShaderProgram().setUniformLocationWith4fv(this._uniformColor, colors, 1);

            //this._textureAtlas.drawNumberOfQuads(this._quadsToDraw, 0);
        }
    },

    /** cc.AtlasNode - RGBA protocol
     * @return {cc.Color3B}
     */
    getColor:function () {
        if (this._isOpacityModifyRGB) {
            return this._colorUnmodified;
        }
        return this._color;
    },

    /**
     * @param {cc.Color3B} color3
     */
    setColor:function (color3) {
        if ((this._color.r == color3.r) && (this._color.g == color3.g) && (this._color.b == color3.b)) {
            return;
        }
        this._color = this._colorUnmodified = color3;

        if (this.getTexture()) {
            if (cc.renderContextType == cc.CANVAS) {
                var cacheTextureForColor = cc.TextureCache.getInstance().getTextureColors(this._originalTexture);
                if (cacheTextureForColor) {
                    var tx = this._originalTexture;
                    var textureRect = cc.rect(0, 0, tx.width, tx.height);
                    var colorTexture = cc.generateTintImage(tx, cacheTextureForColor, this._color, textureRect);
                    var img = new Image();
                    img.src = colorTexture.toDataURL();
                    this.setTexture(img);
                }
            }
        }

        if (this._isOpacityModifyRGB) {
            this._color.r = color3.r * this._opacity / 255;
            this._color.g = color3.g * this._opacity / 255;
            this._color.b = color3.b * this._opacity / 255;
        }
    },

    /**
     * @return {Number}
     */
    getOpacity:function () {
        return this._opacity;
    },

    /**
     * @param {Number} opacity
     */
    setOpacity:function (opacity) {
        this._opacity = opacity;
        // special opacity for premultiplied textures
        //if (this._isOpacityModifyRGB) {
        //    this.setColor(this._colorUnmodified);
        //}
    },

    /**
     * @param {Boolean} value
     */
    setOpacityModifyRGB:function (value) {
        var oldColor = this._color;
        this._isOpacityModifyRGB = value;
        this._color = oldColor;
    },

    /**
     * @return {Boolean}
     */
    isOpacityModifyRGB:function () {
        return this._isOpacityModifyRGB;
    },

    /** cc.AtlasNode - CocosNodeTexture protocol
     * @return {cc.BlendFunc}
     */
    getBlendFunc:function () {
        return this._blendFunc;
    },

    /**
     * @param {cc.BlendFunc} blendFunc
     */
    setBlendFunc:function (src, dst) {
        if(arguments.length == 1)
            this._blendFunc = src;
        else
            this._blendFunc = {src:src, dst:dst};
    },

    // cc.Texture protocol

    /** returns the used texture
     * @return {cc.Texture2D}
     */
    getTexture:function () {
        return this._textureAtlas.getTexture();
    },

    /** sets a new texture. it will be retained
     * @param {cc.Texture2D} texture
     */
    setTexture:function (texture) {
        this._textureAtlas.setTexture(texture);
        this._updateBlendFunc();
        this._updateOpacityModifyRGB();
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

    _calculateMaxItems:function () {
        var size;
        if (this._textureAtlas.getTexture() instanceof cc.Texture2D) {
            size = this._textureAtlas.getTexture().getContentSize();
        }
        else {
            size = cc.size(this._textureAtlas.getTexture().width, this._textureAtlas.getTexture().height);
        }
        this._itemsPerColumn = parseInt(size.height / this._itemHeight);
        this._itemsPerRow = parseInt(size.width / this._itemWidth);
    },

    _updateBlendFunc:function () {
        /* if (!this._textureAtlas.getTexture().hasPremultipliedAlpha()) {
         this._blendFunc.src = gl.SRC_ALPHA;
         this._blendFunc.dst = gl.ONE_MINUS_SRC_ALPHA;
         }*/
    },

    _updateOpacityModifyRGB:function () {
        //this._isOpacityModifyRGB = this._textureAtlas.getTexture().hasPremultipliedAlpha();
    }

});

/** creates a cc.AtlasNode  with an Atlas file the width and height of each item and the quantity of items to render
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
    if (ret.initWithTileFile(tile, tileWidth, tileHeight, itemsToRender)) {
        return ret;
    }
    return null;
};
