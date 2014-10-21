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

/**
 * using image file to print text label on the screen, might be a bit slower than cc.Label, similar to cc.LabelBMFont
 * @class
 * @extends cc.AtlasNode
 *
 * @property {String}   string  - Content string of label
 *
 * @param {String} strText
 * @param {String} charMapFile  charMapFile or fntFile
 * @param {Number} [itemWidth=0]
 * @param {Number} [itemHeight=0]
 * @param {Number} [startCharMap=""]
 * @example
 * //creates the cc.LabelAtlas with a string, a char map file(the atlas), the width and height of each element and the starting char of the atlas
 * var myLabel = new cc.LabelAtlas('Text to display', 'CharMapfile.png', 12, 20, ' ')
 *
 * //creates the cc.LabelAtlas with a string, a fnt file
 * var myLabel = new cc.LabelAtlas('Text to display', 'CharMapFile.plist‘);
 */
cc.LabelAtlas = cc.AtlasNode.extend(/** @lends cc.LabelAtlas# */{

    //property String is Getter and Setter

    // string to render
    _string: null,
    // the first char in the charmap
    _mapStartChar: null,

    _textureLoaded: false,
    _className: "LabelAtlas",

    /**
     * <p>
     *  Constructor function, override it to extend the construction behavior, remember to call "this._super()" in the extended "ctor" function. <br />
     *  Create a label atlas. <br />
     *  It accepts two groups of parameters: <br/>
     * a) string, fntFile <br/>
     * b) label, textureFilename, width, height, startChar <br/>
     * </p>
     * @param {String} strText
     * @param {String} charMapFile  charMapFile or fntFile
     * @param {Number} [itemWidth=0]
     * @param {Number} [itemHeight=0]
     * @param {Number} [startCharMap=""]
     */
    ctor: function (strText, charMapFile, itemWidth, itemHeight, startCharMap) {
        cc.AtlasNode.prototype.ctor.call(this);

        this._cascadeOpacityEnabled = true;
        this._cascadeColorEnabled = true;

        charMapFile && cc.LabelAtlas.prototype.initWithString.call(this, strText, charMapFile, itemWidth, itemHeight, startCharMap);
    },

    /**
     * Return  texture is loaded.
     * @returns {boolean}
     */
    textureLoaded: function () {
        return this._textureLoaded;
    },

    /**
     * Add texture loaded event listener.
     * @param {Function} callback
     * @param {cc.Node} target
     * @deprecated since 3.1, please use addEventListener instead
     */
    addLoadedEventListener: function (callback, target) {
        this.addEventListener("load", callback, target);
    },

    /**
     * <p>
     *  initializes the cc.LabelAtlas with a string, a char map file(the atlas), <br/>
     *  the width and height of each element and the starting char of the atlas <br/>
     *  It accepts two groups of parameters: <br/>
     * a) string, fntFile <br/>
     * b) label, textureFilename, width, height, startChar <br/>
     * </p>
     * @param {String} strText
     * @param {String|cc.Texture2D} charMapFile  charMapFile or fntFile or texture file
     * @param {Number} [itemWidth=0]
     * @param {Number} [itemHeight=0]
     * @param {Number} [startCharMap=""]
     * @return {Boolean} returns true on success
     */
    initWithString: function (strText, charMapFile, itemWidth, itemHeight, startCharMap) {
        var label = strText + "", textureFilename, width, height, startChar;
        if (itemWidth === undefined) {
            var dict = cc.loader.getRes(charMapFile);
            if (parseInt(dict["version"], 10) !== 1) {
                cc.log("cc.LabelAtlas.initWithString(): Unsupported version. Upgrade cocos2d version");
                return false;
            }

            textureFilename = cc.path.changeBasename(charMapFile, dict["textureFilename"]);
            var locScaleFactor = cc.contentScaleFactor();
            width = parseInt(dict["itemWidth"], 10) / locScaleFactor;
            height = parseInt(dict["itemHeight"], 10) / locScaleFactor;
            startChar = String.fromCharCode(parseInt(dict["firstChar"], 10));
        } else {
            textureFilename = charMapFile;
            width = itemWidth || 0;
            height = itemHeight || 0;
            startChar = startCharMap || " ";
        }

        var texture = null;
        if (textureFilename instanceof cc.Texture2D)
            texture = textureFilename;
        else
            texture = cc.textureCache.addImage(textureFilename);
        var locLoaded = texture.isLoaded();
        this._textureLoaded = locLoaded;
        if (!locLoaded) {
            texture.addEventListener("load", function (sender) {
                this.initWithTexture(texture, width, height, label.length);
                this.string = label;
                this.dispatchEvent("load");
            }, this);
        }
        if (this.initWithTexture(texture, width, height, label.length)) {
            this._mapStartChar = startChar;
            this.string = label;
            return true;
        }
        return false;
    },

    /**
     * Set the color.
     * @param {cc.Color} color3
     */
    setColor: function (color3) {
        cc.AtlasNode.prototype.setColor.call(this, color3);
        this.updateAtlasValues();
    },

    /**
     * return the text of this label
     * @return {String}
     */
    getString: function () {
        return this._string;
    },

    /**
     * draw the label
     */
    draw: function (ctx) {
        cc.AtlasNode.prototype.draw.call(this, ctx);
        if (cc.LABELATLAS_DEBUG_DRAW) {
            var s = this.size;
            var vertices = [cc.p(0, 0), cc.p(s.width, 0),
                cc.p(s.width, s.height), cc.p(0, s.height)];
            cc._drawingUtil.drawPoly(vertices, 4, true);
        }
    },

    _addChildForCanvas: function(child, zOrder, tag){
        child._lateChild = true;
        cc.Node.prototype.addChild.call(this, child, zOrder, tag);
    },

    /**
     * Atlas generation
     * @function
     */
    updateAtlasValues: null,

    _updateAtlasValuesForCanvas: function () {
        var locString = this._string || "";
        var n = locString.length;
        var texture = this.texture;
        var locItemWidth = this._itemWidth , locItemHeight = this._itemHeight;     //needn't multiply cc.contentScaleFactor(), because sprite's draw will do this

        for (var i = 0; i < n; i++) {
            var a = locString.charCodeAt(i) - this._mapStartChar.charCodeAt(0);
            var row = parseInt(a % this._itemsPerRow, 10);
            var col = parseInt(a / this._itemsPerRow, 10);

            var rect = cc.rect(row * locItemWidth, col * locItemHeight, locItemWidth, locItemHeight);
            var c = locString.charCodeAt(i);
            var fontChar = this.getChildByTag(i);
            if (!fontChar) {
                fontChar = new cc.Sprite();
                if (c == 32) {
                    fontChar.init();
                    fontChar.setTextureRect(cc.rect(0, 0, 10, 10), false, cc.size(0, 0));
                } else
                    fontChar.initWithTexture(texture, rect);

                cc.Node.prototype.addChild.call(this, fontChar, 0, i);
            } else {
                if (c == 32) {
                    fontChar.init();
                    fontChar.setTextureRect(cc.rect(0, 0, 10, 10), false, cc.size(0, 0));
                } else {
                    // reusing fonts
                    fontChar.initWithTexture(texture, rect);
                    // restore to default in case they were modified
                    fontChar.visible = true;
                }
            }
            fontChar.setPosition(i * locItemWidth + locItemWidth / 2, locItemHeight / 2);
        }
    },

    _updateAtlasValuesForWebGL: function () {
        var locString = this._string;
        var n = locString.length;
        var locTextureAtlas = this.textureAtlas;

        var texture = locTextureAtlas.texture;
        var textureWide = texture.pixelsWidth;
        var textureHigh = texture.pixelsHeight;
        var itemWidthInPixels = this._itemWidth;
        var itemHeightInPixels = this._itemHeight;
        if (!this._ignoreContentScaleFactor) {
            itemWidthInPixels = this._itemWidth * cc.contentScaleFactor();
            itemHeightInPixels = this._itemHeight * cc.contentScaleFactor();
        }
        if (n > locTextureAtlas.getCapacity())
            cc.log("cc.LabelAtlas._updateAtlasValues(): Invalid String length");
        var quads = locTextureAtlas.quads;
        var locDisplayedColor = this._displayedColor;
        var curColor = {r: locDisplayedColor.r, g: locDisplayedColor.g, b: locDisplayedColor.b, a: this._displayedOpacity};
        var locItemWidth = this._itemWidth;
        for (var i = 0; i < n; i++) {
            var a = locString.charCodeAt(i) - this._mapStartChar.charCodeAt(0);
            var row = a % this._itemsPerRow;
            var col = 0 | (a / this._itemsPerRow);

            var left, right, top, bottom;
            if (cc.FIX_ARTIFACTS_BY_STRECHING_TEXEL) {
                // Issue #938. Don't use texStepX & texStepY
                left = (2 * row * itemWidthInPixels + 1) / (2 * textureWide);
                right = left + (itemWidthInPixels * 2 - 2) / (2 * textureWide);
                top = (2 * col * itemHeightInPixels + 1) / (2 * textureHigh);
                bottom = top + (itemHeightInPixels * 2 - 2) / (2 * textureHigh);
            } else {
                left = row * itemWidthInPixels / textureWide;
                right = left + itemWidthInPixels / textureWide;
                top = col * itemHeightInPixels / textureHigh;
                bottom = top + itemHeightInPixels / textureHigh;
            }
            var quad = quads[i];
            var locQuadTL = quad.tl, locQuadTR = quad.tr, locQuadBL = quad.bl, locQuadBR = quad.br;
            locQuadTL.texCoords.u = left;
            locQuadTL.texCoords.v = top;
            locQuadTR.texCoords.u = right;
            locQuadTR.texCoords.v = top;
            locQuadBL.texCoords.u = left;
            locQuadBL.texCoords.v = bottom;
            locQuadBR.texCoords.u = right;
            locQuadBR.texCoords.v = bottom;

            locQuadBL.vertices.x = (i * locItemWidth);
            locQuadBL.vertices.y = 0;
            locQuadBL.vertices.z = 0.0;
            locQuadBR.vertices.x = (i * locItemWidth + locItemWidth);
            locQuadBR.vertices.y = 0;
            locQuadBR.vertices.z = 0.0;
            locQuadTL.vertices.x = i * locItemWidth;
            locQuadTL.vertices.y = this._itemHeight;
            locQuadTL.vertices.z = 0.0;
            locQuadTR.vertices.x = i * locItemWidth + locItemWidth;
            locQuadTR.vertices.y = this._itemHeight;
            locQuadTR.vertices.z = 0.0;
            locQuadTL.colors = curColor;
            locQuadTR.colors = curColor;
            locQuadBL.colors = curColor;
            locQuadBR.colors = curColor;
        }
        if (n > 0) {
            locTextureAtlas.dirty = true;
            var totalQuads = locTextureAtlas.totalQuads;
            if (n > totalQuads)
                locTextureAtlas.increaseTotalQuadsWith(n - totalQuads);
        }
    },

    /**
     * set the display string
     * @function
     * @param {String} label
     */
    setString: null,

    _setStringForCanvas: function (label) {
        label = String(label);
        var len = label.length;
        this._string = label;
        this.width = len * this._itemWidth;
        this.height = this._itemHeight;
        if (this._children) {
            var locChildren = this._children;
            len = locChildren.length;
            for (var i = 0; i < len; i++) {
                var node = locChildren[i];
                if (node && !node._lateChild)
                    node.visible = false;
            }
        }

        this.updateAtlasValues();
        this.quadsToDraw = len;
    },

    _setStringForWebGL: function (label) {
        label = String(label);
        var len = label.length;
        if (len > this.textureAtlas.totalQuads)
            this.textureAtlas.resizeCapacity(len);

        this._string = label;
        this.width = len * this._itemWidth;
        this.height = this._itemHeight;

        this.updateAtlasValues();
        this.quadsToDraw = len;
    },

    /**
     * set the opacity
     * @function
     * @param {Number} opacity
     */
    setOpacity: null,

    _setOpacityForWebGL: function (opacity) {
        if (this._opacity !== opacity)
            cc.AtlasNode.prototype.setOpacity.call(this, opacity);
    }
});

var _p = cc.LabelAtlas.prototype;
cc.EventHelper.prototype.apply(_p);
if (cc._renderType === cc._RENDER_TYPE_WEBGL) {
    _p.updateAtlasValues = _p._updateAtlasValuesForWebGL;
    _p.setString = _p._setStringForWebGL;
    _p.setOpacity = _p._setOpacityForWebGL;
} else {
    _p.updateAtlasValues = _p._updateAtlasValuesForCanvas;
    _p.setString = _p._setStringForCanvas;
    _p.setOpacity = _p._setOpacityForCanvas;
    _p.addChild = _p._addChildForCanvas;
}

// Override properties
cc.defineGetterSetter(_p, "opacity", _p.getOpacity, _p.setOpacity);
cc.defineGetterSetter(_p, "color", _p.getColor, _p.setColor);

// Extended properties
/** @expose */
_p.string;
cc.defineGetterSetter(_p, "string", _p.getString, _p.setString);

/**
 * <p>
 *     Please use new cc.LabelAtlas instead. <br />
 *     Create a label atlas. <br />
 *     It accepts two groups of parameters:                                                            <br/>
 *         a) string, fntFile                                                                               <br/>
 *         b) label, textureFilename, width, height, startChar                                              <br/>
 * </p>
 * @deprecated since v3.0 please use new cc.LabelAtlas
 * @param {String} strText
 * @param {String} charMapFile  charMapFile or fntFile
 * @param {Number} [itemWidth=0]
 * @param {Number} [itemHeight=0]
 * @param {Number} [startCharMap=""]
 * @return {cc.LabelAtlas} returns the LabelAtlas object on success
 */
cc.LabelAtlas.create = function (strText, charMapFile, itemWidth, itemHeight, startCharMap) {
    return new cc.LabelAtlas(strText, charMapFile, itemWidth, itemHeight, startCharMap);
};

