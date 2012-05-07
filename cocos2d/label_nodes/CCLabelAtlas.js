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

var cc = cc = cc || {};

/** @brief CCLabelAtlas is a subclass of CCAtlasNode.

 It can be as a replacement of CCLabel since it is MUCH faster.

 CCLabelAtlas versus CCLabel:
 - CCLabelAtlas is MUCH faster than CCLabel
 - CCLabelAtlas "characters" have a fixed height and width
 - CCLabelAtlas "characters" can be anything you want since they are taken from an image file

 A more flexible class is CCLabelBMFont. It supports variable width characters and it also has a nice editor.
 */
cc.LabelAtlas = cc.AtlasNode.extend({

    /** initializes the CCLabelAtlas with a string, a char map file(the atlas), the width and height of each element and the starting char of the atlas */
    initWithString:function (label, charMapFile, itemWidth, itemHeight, startCharMap) {
        cc.Assert(label != null, "");
        if (this.initWithTileFile(charMapFile, itemWidth, itemHeight, label.length)) {
            this._m_cMapStartChar = startCharMap;
            this.setString(label);
            return true;
        }
        return false;
    },

    // super methods
    updateAtlasValues:function () {
        var n = this._m_sString.length;

        var quad;

        var s = this._m_sString;

        var texture = this._m_pTextureAtlas.getTexture();
        var textureWide = texture.getPixelsWide();
        var textureHigh = texture.getPixelsHigh();

        for (var i = 0; i < n; i++) {
            var a = s[i] - this._m_cMapStartChar;
            var row = a % this._m_uItemsPerRow;
            var col = a / this._m_uItemsPerRow;


            var left = row * this._m_uItemWidth / textureWide;
            var right = left + this._m_uItemWidth / textureWide;
            var top = col * this._m_uItemHeight / textureHigh;
            var bottom = top + this._m_uItemHeight / textureHigh;


            quad.tl.texCoords.u = left;
            quad.tl.texCoords.v = top;
            quad.tr.texCoords.u = right;
            quad.tr.texCoords.v = top;
            quad.bl.texCoords.u = left;
            quad.bl.texCoords.v = bottom;
            quad.br.texCoords.u = right;
            quad.br.texCoords.v = bottom;

            quad.bl.vertices.x = i * this._m_uItemWidth;
            quad.bl.vertices.y = 0;
            quad.bl.vertices.z = 0.0;
            quad.br.vertices.x = i * this._m_uItemWidth + this._m_uItemWidth;
            quad.br.vertices.y = 0;
            quad.br.vertices.z = 0.0;
            quad.tl.vertices.x = i * this._m_uItemWidth;
            quad.tl.vertices.y = this._m_uItemHeight;
            quad.tl.vertices.z = 0.0;
            quad.tr.vertices.x = i * this._m_uItemWidth + this._m_uItemWidth;
            quad.tr.vertices.y = this._m_uItemHeight;
            quad.tr.vertices.z = 0.0;

            this._m_pTextureAtlas.updateQuad(quad, i);
        }

    },
    setString:function (label) {
        var len = label.length;
        if (len > this._m_pTextureAtlas.getTotalQuads()) {
            this._m_pTextureAtlas.resizeCapacity(len);
        }
        this._m_sString.clear();
        this._m_sString = label;
        this.updateAtlasValues();

        var s;
        s.width = len * this._m_uItemWidth;
        s.height = this._m_uItemHeight;
        this.setContentSizeInPixels(s);

        this._m_uQuadsToDraw = len;
    },
    getString:function () {
        return this._m_sString;
    },

    draw:function () {
        this._super();

        var s = this.getContentSize();
        var vertices = [cc.ccp(0, 0), cc.ccp(s.width, 0),
            cc.ccp(s.width, s.height), cc.ccp(0, s.height)];
        //cc.ccDrawPoly(vertices, 4, true);
    },

    convertToLabelProtocol:function () {
        return this;
    },

    // string to render
    _m_sString:null,
    // the first char in the charmap
    _m_cMapStartChar:null
});

/** creates the CCLabelAtlas with a string, a char map file(the atlas), the width and height of each element and the starting char of the atlas */
cc.LabelAtlas.labelWithString = function (label, charMapFile, itemWidth, itemHeight, startCharMap) {
    var pRet = new cc.LabelAtlas();
    if (pRet && pRet.initWithString(label, charMapFile, itemWidth, itemHeight, startCharMap)) {

        return pRet;
    }

    return null;
};