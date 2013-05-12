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

/**
 * using image file to print text label on the screen, might be a bit slower than cc.Label, similar to cc.LabelBMFont   (Canvas version)
 * @class
 * @extends cc.AtlasNode
 */
cc.LabelAtlasCanvas = cc.AtlasNode.extend(/** @lends cc.LabelAtlasCanvas# */{
    // ---- common properties start ----
    // string to render
    _string:null,
    // the first char in the charmap
    _mapStartChar:null,

    /**
     * initializes the cc.LabelAtlas with a string, a char map file(the atlas), the width and height of each element and the starting char of the atlas
     *  It accepts two groups of parameters:
     * a) string, fntFile
     * b) label, textureFilename, width, height, startChar
     * @param {String} strText
     * @param {String} charMapFile  charMapFile or fntFile
     * @param {Number} itemWidth
     * @param {Number} itemHeight
     * @param {Number} startCharMap
     * @return {Boolean} returns true on success
     */
    initWithString:function (strText, charMapFile, itemWidth, itemHeight, startCharMap) {
        var label = strText + "", textureFilename, width, height, startChar;
        cc.Assert(label !== null, "Label must be non-nil");
        if (arguments.length === 2) {
            var dict = cc.FileUtils.getInstance().dictionaryWithContentsOfFileThreadSafe(charMapFile);
            cc.Assert(parseInt(dict["version"], 10) == 1, "Unsupported version. Upgrade cocos2d version");

            textureFilename = cc.FileUtils.getInstance().fullPathFromRelativeFile(dict["textureFilename"], charMapFile);
            width = parseInt(dict["itemWidth"], 10) / cc.CONTENT_SCALE_FACTOR();
            height = parseInt(dict["itemHeight"], 10) / cc.CONTENT_SCALE_FACTOR();
            startChar = String.fromCharCode(parseInt(dict["firstChar"], 10));
        } else {
            textureFilename = charMapFile;
            width = itemWidth || 0;
            height = itemHeight || 0;
            startChar = startCharMap || " ";
        }

        if (this.initWithTileFile(textureFilename, width, height, label.length)) {
            this._mapStartChar = startChar;
            this.setString(label);
            return true;
        }
        return false;
    },

    /**
     * @param {cc.Color3B} color3
     */
    setColor:function (color3) {
        this._super(color3);
        this.updateAtlasValues();
    },
    /**
     * return the text of this label
     * @return {String}
     */
    getString:function () {
        return this._string;
    },

    /**
     * draw the label
     */
    draw:function () {
        this._super();
        if (cc.LABELATLAS_DEBUG_DRAW) {
            var s = this.getContentSize();
            var vertices = [cc.p(0, 0), cc.p(s.width, 0),
                cc.p(s.width, s.height), cc.p(0, s.height)];
            cc.drawingUtil.drawPoly(vertices, 4, true);
        }
    },
    // ---- common properties end   ----

    /**
     *  Atlas generation
     */
    updateAtlasValues:function () {
        var texture = this.getTexture();
        for (var i = 0; i < this._string.length; i++) {
            var a = this._string.charCodeAt(i) - this._mapStartChar.charCodeAt(0);
            var row = parseInt(a % this._itemsPerRow, 10) * cc.CONTENT_SCALE_FACTOR();
            var col = parseInt(a / this._itemsPerRow, 10) * cc.CONTENT_SCALE_FACTOR();

            var rect = cc.rect(row * this._itemWidth, col * this._itemHeight, this._itemWidth, this._itemHeight);
            var c = this._string.charCodeAt(i);
            var fontChar = this.getChildByTag(i);
            if (!fontChar) {
                fontChar = new cc.Sprite();
                if (c == 32) {
                    fontChar.init();
                    fontChar.setTextureRect(cc.rect(0, 0, 10, 10), false, cc.SizeZero());
                } else
                    fontChar.initWithTexture(texture, rect);

                this.addChild(fontChar, 0, i);
            } else {
                if (c == 32) {
                    fontChar.init();
                    fontChar.setTextureRect(cc.rect(0, 0, 10, 10), false, cc.SizeZero());
                } else {
                    // reusing fonts
                    fontChar.initWithTexture(texture, rect);
                    // restore to default in case they were modified
                    fontChar.setVisible(true);
                    fontChar.setOpacity(this._opacity);
                }
            }
            fontChar.setPosition(cc.p(i * this._itemWidth + this._itemWidth / 2, this._itemHeight / 2));
        }
    },

    /**
     * set the display string
     * @param {String} label
     */
    setString:function (label) {
        var len = label.length;
        this._string = label;
        this.setContentSize(cc.size(len * this._itemWidth, this._itemHeight));
        if (this._children) {
            for (var i = 0; i < this._children.length; i++) {
                var node = this._children[i];
                if (node)
                    node.setVisible(false);
            }
        }

        this.updateAtlasValues();
        this._quadsToDraw = len;
    },

    setOpacity:function (opacity) {
        if (this._opacity != opacity) {
            this._super(opacity);
            for (var i = 0; i < this._children.length; i++) {
                if (this._children[i])
                    this._children[i].setOpacity(opacity);
            }
        }
    }
});

/**
 *  It accepts two groups of parameters:
 * a) string, fntFile
 * b) label, textureFilename, width, height, startChar
 * @return {cc.LabelAtlas|Null} returns the LabelAtlas object on success
 * @example
 * //Example
 * //creates the cc.LabelAtlas with a string, a char map file(the atlas), the width and height of each element and the starting char of the atlas
 * var myLabel = cc.LabelAtlas.create('Text to display', 'CharMapfile.png', 12, 20, ' ')
 *
 * //creates the cc.LabelAtlas with a string, a fnt file
 * var myLabel = cc.LabelAtlas.create('Text to display', 'CharMapFile.plist‘);
 */
cc.LabelAtlasCanvas.create = function (strText, charMapFile, itemWidth, itemHeight, startCharMap) {
    var ret = new cc.LabelAtlasCanvas();
    if (ret && cc.LabelAtlasCanvas.prototype.initWithString.apply(ret,arguments)) {
        return ret;
    }
    return null;
};

/**
 * using image file to print text label on the screen, might be a bit slower than cc.Label, similar to cc.LabelBMFont   (WebGL version)
 * @class
 * @extends cc.AtlasNode
 */
cc.LabelAtlasWebGL = cc.AtlasNode.extend(/** @lends cc.LabelAtlasWebGL# */{
    // ---- common properties start ----
    // string to render
    _string:null,
    // the first char in the charmap
    _mapStartChar:null,

    /**
     * initializes the cc.LabelAtlas with a string, a char map file(the atlas), the width and height of each element and the starting char of the atlas
     *  It accepts two groups of parameters:
     * a) string, fntFile
     * b) label, textureFilename, width, height, startChar
     * @param {String} strText
     * @param {String} charMapFile  charMapFile or fntFile
     * @param {Number} itemWidth
     * @param {Number} itemHeight
     * @param {Number} startCharMap
     * @return {Boolean} returns true on success
     */
    initWithString:function (strText, charMapFile, itemWidth, itemHeight, startCharMap) {
        var label = strText + "", textureFilename, width, height, startChar;
        cc.Assert(label !== null, "Label must be non-nil");
        if (arguments.length === 2) {
            var dict = cc.FileUtils.getInstance().dictionaryWithContentsOfFileThreadSafe(charMapFile);
            cc.Assert(parseInt(dict["version"], 10) == 1, "Unsupported version. Upgrade cocos2d version");

            textureFilename = cc.FileUtils.getInstance().fullPathFromRelativeFile(dict["textureFilename"], charMapFile);
            width = parseInt(dict["itemWidth"], 10) / cc.CONTENT_SCALE_FACTOR();
            height = parseInt(dict["itemHeight"], 10) / cc.CONTENT_SCALE_FACTOR();
            startChar = String.fromCharCode(parseInt(dict["firstChar"], 10));
        } else {
            textureFilename = charMapFile;
            width = itemWidth || 0;
            height = itemHeight || 0;
            startChar = startCharMap || " ";
        }

        if (this.initWithTileFile(textureFilename, width, height, label.length)) {
            this._mapStartChar = startChar;
            this.setString(label);
            return true;
        }
        return false;
    },

    /**
     * @param {cc.Color3B} color3
     */
    setColor:function (color3) {
        this._super(color3);
        this.updateAtlasValues();
    },
    /**
     * return the text of this label
     * @return {String}
     */
    getString:function () {
        return this._string;
    },

    /**
     * draw the label
     */
    draw:function () {
        this._super();
        if (cc.LABELATLAS_DEBUG_DRAW) {
            var s = this.getContentSize();
            var vertices = [cc.p(0, 0), cc.p(s.width, 0),
                cc.p(s.width, s.height), cc.p(0, s.height)];
            cc.drawingUtil.drawPoly(vertices, 4, true);
        }
    },
    // ---- common properties end   ----

    /**
     *  Atlas generation
     */
    updateAtlasValues:function () {
        var texture = this._textureAtlas.getTexture();
        var textureWide = texture.getPixelsWide();
        var textureHigh = texture.getPixelsHigh();
        var itemWidthInPixels = this._itemWidth * cc.CONTENT_SCALE_FACTOR();
        var itemHeightInPixels = this._itemHeight * cc.CONTENT_SCALE_FACTOR();

        for (var i = 0; i < this._string.length; i++) {
            var a = this._string.charCodeAt(i) - this._mapStartChar.charCodeAt(0);
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
            var quad = new cc.V3F_C4B_T2F_Quad();
            quad.tl.texCoords.u = left;
            quad.tl.texCoords.v = top;
            quad.tr.texCoords.u = right;
            quad.tr.texCoords.v = top;
            quad.bl.texCoords.u = left;
            quad.bl.texCoords.v = bottom;
            quad.br.texCoords.u = right;
            quad.br.texCoords.v = bottom;

            quad.bl.vertices.x = (i * this._itemWidth);
            quad.bl.vertices.y = 0;
            quad.bl.vertices.z = 0.0;
            quad.br.vertices.x = (i * this._itemWidth + this._itemWidth);
            quad.br.vertices.y = 0;
            quad.br.vertices.z = 0.0;
            quad.tl.vertices.x = i * this._itemWidth;
            quad.tl.vertices.y = this._itemHeight;
            quad.tl.vertices.z = 0.0;
            quad.tr.vertices.x = i * this._itemWidth + this._itemWidth;
            quad.tr.vertices.y = this._itemHeight;
            quad.tr.vertices.z = 0.0;
            var c = cc.c4b(this._color.r, this._color.g, this._color.b, this._opacity);
            quad.tl.colors = c;
            quad.tr.colors = c;
            quad.bl.colors = c;
            quad.br.colors = c;
            this._textureAtlas.updateQuad(quad, i);
        }
    },

    /**
     * set the display string
     * @param {String} label
     */
    setString:function (label) {
        var len = label.length;
        if (len > this._textureAtlas.getTotalQuads())
            this._textureAtlas.resizeCapacity(len);

        this._string = label;
        this.setContentSize(cc.size(len * this._itemWidth, this._itemHeight));

        this.updateAtlasValues();
        this._quadsToDraw = len;
    },

    setOpacity:function (opacity) {
        if (this._opacity !== opacity) {
            this._super(opacity);
        }
    }
});

/**
 *  It accepts two groups of parameters:
 * a) string, fntFile
 * b) label, textureFilename, width, height, startChar
 * @param {String} strText
 * @param {String} charMapFile  charMapFile or fntFile
 * @param {Number} itemWidth
 * @param {Number} itemHeight
 * @param {Number} startCharMap
 * @return {cc.LabelAtlas|Null} returns the LabelAtlas object on success
 * @example
 * //Example
 * //creates the cc.LabelAtlas with a string, a char map file(the atlas), the width and height of each element and the starting char of the atlas
 * var myLabel = cc.LabelAtlas.create('Text to display', 'CharMapfile.png', 12, 20, ' ')
 *
 * //creates the cc.LabelAtlas with a string, a fnt file
 * var myLabel = cc.LabelAtlas.create('Text to display', 'CharMapFile.plist‘);
 */
cc.LabelAtlasWebGL.create = function (strText, charMapFile, itemWidth, itemHeight, startCharMap) {
    var ret = new cc.LabelAtlasWebGL();
    if (ret && cc.LabelAtlasWebGL.prototype.initWithString.apply(ret,arguments)) {
        return ret;
    }
    return null;
};

cc.LabelAtlas = cc.Browser.supportWebGL ? cc.LabelAtlasWebGL : cc.LabelAtlasCanvas;

