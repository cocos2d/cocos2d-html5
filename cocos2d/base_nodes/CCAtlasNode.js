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
    //! chars per row
    _itemsPerRow:0,
    //! chars per column
    _itemsPerColumn:0,
    //! width of each char
    _itemWidth:0,
    //! height of each char
    _itemHeight:0,
    _colorUnmodified:new cc.Color3B(0, 0, 0),
    _textureAtlas:null,
    // protocol variables
    _isOpacityModifyRGB:false,
    _blendFunc:new cc.BlendFunc(cc.BLEND_SRC, cc.BLEND_DST),
    _opacity:0,
    _color:null,
    _originalTexture:null,
    // quads to draw
    _quadsToDraw:0,

    /** initializes an cc.AtlasNode  with an Atlas file the width and height of each item and the quantity of items to render
     * @param {String} tile
     * @param {Number} tileWidth
     * @param {Number} tileHeight
     * @param {Number} itemsToRender
     * @return {Boolean}
     */
    initWithTileFile:function (tile, tileWidth, tileHeight, itemsToRender) {
        cc.Assert(tile != null, "title should not be null");
        this._itemWidth = tileWidth * cc.CONTENT_SCALE_FACTOR();
        this._itemHeight = tileHeight * cc.CONTENT_SCALE_FACTOR();

        this._opacity = 255;
        this._color = this._colorUnmodified = cc.WHITE();
        this._isOpacityModifyRGB = true;

        this._blendFunc.src = cc.BLEND_SRC;
        this._blendFunc.dst = cc.BLEND_DST;

        // double retain to avoid the autorelease pool
        // also, using: self.textureAtlas supports re-initialization without leaking
        this._textureAtlas = new cc.TextureAtlas();
        this._textureAtlas.initWithFile(tile, itemsToRender);
        if (cc.renderContextType == cc.CANVAS) {
            this._originalTexture = this._textureAtlas.getTexture();
        }
        if (!this._textureAtlas) {
            cc.Log("cocos2d: Could not initialize cc.AtlasNode. Invalid Texture.");
            return false;
        }

        this._updateBlendFunc();
        this._updateOpacityModifyRGB();

        this._calculateMaxItems();

        this._quadsToDraw = itemsToRender;

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

        }
        else {
            // Default GL states: GL_TEXTURE_2D, GL_VERTEX_ARRAY, GL_COLOR_ARRAY, GL_TEXTURE_COORD_ARRAY
            // Needed states: GL_TEXTURE_2D, GL_VERTEX_ARRAY, GL_TEXTURE_COORD_ARRAY
            // Unneeded states: GL_COLOR_ARRAY
            //TODO, for webgl porting.
            //glDisableClientState(GL_COLOR_ARRAY);

            // glColor4ub isn't implement on some android devices
            // glColor4ub( color.r, color.g, color.b, opacity);
            //glColor4f(((GLfloat)color.r) / 255, ((GLfloat)color.g) / 255, ((GLfloat)color.b) / 255, ((GLfloat)opacity) / 255);
            var newBlend = this._blendFunc.src != cc.BLEND_SRC || this._blendFunc.dst != cc.BLEND_DST;
            if (newBlend) {
                // TODO, need to be fixed
                //glBlendFunc( blendFunc.src, blendFunc.dst );
            }

            this._textureAtlas.drawNumberOfQuads(this._quadsToDraw, 0);

            if (newBlend) {
                //glBlendFunc(cc.BLEND_SRC, cc.BLEND_DST);
            }

            // is this chepear than saving/restoring color state ?
            // XXX: There is no need to restore the color to (255,255,255,255). Objects should use the color
            // XXX: that they need
            //	glColor4ub( 255, 255, 255, 255);

            // restore default GL state
            //TODO, need to be fixed.
            //glEnableClientState(GL_COLOR_ARRAY);
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
        if ((this._color.r == color3.r)&&(this._color.g == color3.g)&&(this._color.b == color3.b)) {
            return;
        }
        this._color = this._colorUnmodified = color3;

        if (this.getTexture()) {
            if (cc.renderContextType == cc.CANVAS) {
                var cacheTextureForColor = cc.TextureCache.sharedTextureCache().getTextureColors(this._originalTexture);
                if (cacheTextureForColor) {
                    //generate color texture cache
                    var tx = this.getTexture();
                    var textureRect = new cc.Rect(0,0,tx.width,tx.height);
                    var colorTexture = cc.generateTintImage(tx, cacheTextureForColor, this._color,textureRect);
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
        return;
        // special opacity for premultiplied textures
        if (this._isOpacityModifyRGB) {
            this.setColor(this._colorUnmodified);
        }
    },

    /**
     * @param {Boolean} value
     */
    setIsOpacityModifyRGB:function (value) {
        var oldColor = this._color;
        this._isOpacityModifyRGB = value;
        this._color = oldColor;
    },

    /**
     * @return {Boolean}
     */
    getIsOpacityModifyRGB:function () {
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
    setBlendFunc:function (blendFunc) {
        this._blendFunc = blendFunc;
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
        var s = this._textureAtlas.getTexture();
        this._itemsPerColumn = parseInt(s.height / this._itemHeight);
        this._itemsPerRow = parseInt(s.width / this._itemWidth);
    },

    _updateBlendFunc:function () {
        /* if (!this._textureAtlas.getTexture().getHasPremultipliedAlpha()) {
         this._blendFunc.src = cc.GL_SRC_ALPHA;
         this._blendFunc.dst = cc.GL_ONE_MINUS_SRC_ALPHA;
         }*/
    },

    _updateOpacityModifyRGB:function () {
        //this._isOpacityModifyRGB = this._textureAtlas.getTexture().getHasPremultipliedAlpha();
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
