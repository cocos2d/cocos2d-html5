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
 * using image file to print text label on the screen, might be a bit slower than cc.Label, similar to cc.LabelBMFont
 * @class
 * @extends cc.AtlasNode
 */
cc.LabelAtlas = cc.AtlasNode.extend(/** @lends cc.LabelAtlas# */{
    /**
     * initializes the cc.LabelAtlas with a string, a char map file(the atlas), the width and height of each element and the starting char of the atlas
     * @param {String} label
     * @param {String} charMapFile
     * @param {Number} itemWidth
     * @param {Number} itemHeight
     * @param {String} startCharMap
     * @return {Boolean} returns true on success
     */
    initWithString:function (label, charMapFile, itemWidth, itemHeight, startCharMap) {
        cc.Assert(label != null, "");
        if (this.initWithTileFile(charMapFile, itemWidth, itemHeight, label.length)) {
            this._mapStartChar = startCharMap;
            this.setString(label);
            return true;
        }
        return false;
    },

    /**
     *  Atlas generation
     */
    updateAtlasValues:function () {
        var n = this._string.length;

        var s = this._string;
        var texture = this._textureAtlas.getTexture();

        var textureWide = texture.width;
        var textureHigh = texture.height;

        for (var i = 0; i < n; i++) {
            var a = s.charCodeAt(i) - this._mapStartChar.charCodeAt(0);
            var row = parseInt(a % this._itemsPerRow);
            var col = parseInt(a / this._itemsPerRow);

            var left = row * this._itemWidth / textureWide;
            var right = left + this._itemWidth / textureWide;
            var top = col * this._itemHeight / textureHigh;
            var bottom = top + this._itemHeight / textureHigh;

            var quad = new cc.V2F_C4B_T2F_QuadZero();
            quad.tl.texCoords.u = left;
            quad.tl.texCoords.v = top;
            quad.tr.texCoords.u = right;
            quad.tr.texCoords.v = top;
            quad.bl.texCoords.u = left;
            quad.bl.texCoords.v = bottom;
            quad.br.texCoords.u = right;
            quad.br.texCoords.v = bottom;

            quad.bl.vertices.x = i * this._itemWidth;
            quad.bl.vertices.y = 0;
            quad.bl.vertices.z = 0.0;
            quad.br.vertices.x = i * this._itemWidth + this._itemWidth;
            quad.br.vertices.y = 0;
            quad.br.vertices.z = 0.0;
            quad.tl.vertices.x = i * this._itemWidth;
            quad.tl.vertices.y = this._itemHeight;
            quad.tl.vertices.z = 0.0;
            quad.tr.vertices.x = i * this._itemWidth + this._itemWidth;
            quad.tr.vertices.y = this._itemHeight;
            quad.tr.vertices.z = 0.0;

            this._textureAtlas.updateQuad(quad, i);
        }
    },

    /**
     * set the display string
     * @param {String} label
     */
    setString:function (label) {
        var len = label.length;
        this._textureAtlas.resizeCapacity(len);

        this._string = label;
        this.updateAtlasValues();

        var s = new cc.Size();
        s.width = len * this._itemWidth;
        s.height = this._itemHeight;
        this.setContentSizeInPixels(s);

        this._quadsToDraw = len;
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
            var vertices = [cc.ccp(0, 0), cc.ccp(s.width, 0),
                cc.ccp(s.width, s.height), cc.ccp(0, s.height)];
            cc.drawingUtil.drawPoly(vertices, 4, true);
        }
    },

    convertToLabelProtocol:function () {
        return this;
    },

    // string to render
    _string:null,
    // the first char in the charmap
    _mapStartChar:null
});

/**
 * creates the cc.LabelAtlas with a string, a char map file(the atlas), the width and height of each element and the
 * starting char of the atlas
 * @param {String} label Text to display
 * @param {String} charMapFile the character map file
 * @param {Number} itemWidth the width of individual letter
 * @param {Number} itemHeight the height of individual letter
 * @param {String} startCharMap starting character on the character map file
 * @return {cc.LabelAtlas|null} returns the LabelAtlas object on success
 * @example
 * //Example
 * var myLabel = cc.LabelAtlas.create('Text to display', 'CharMapfile.png', 12, 20, ' ')
 */
cc.LabelAtlas.create = function (label, charMapFile, itemWidth, itemHeight, startCharMap) {
    var ret = new cc.LabelAtlas();
    if (ret && ret.initWithString(label, charMapFile, itemWidth, itemHeight, startCharMap)) {
        return ret;
    }
    return null;
};