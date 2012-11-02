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
     *  It accepts two groups of parameters:
     * a) string, fntFile
     * b) label, textureFilename, width, height, startChar
     * @return {Boolean} returns true on success
     */
    initWithString:function (arg) {
        var label, textureFilename, width, height, startChar;
        if (arg.length == 2) {
            var dict = cc.FileUtils.getInstance().dictionaryWithContentsOfFileThreadSafe(arg[1]);
            cc.Assert(parseInt(dict["version"],10) == 1, "Unsupported version. Upgrade cocos2d version");

            label = arg[0].toString();
            textureFilename = cc.FileUtils.getInstance().fullPathFromRelativeFile(dict["textureFilename"], arg[1]);
            width = parseInt(dict["itemWidth"],10) / cc.CONTENT_SCALE_FACTOR();
            height = parseInt(dict["itemHeight"],10) / cc.CONTENT_SCALE_FACTOR();
            startChar = String.fromCharCode(parseInt(dict["firstChar"],10));
        }
        else {
            label = arg[0].toString();
            textureFilename = arg[1];
            width = arg[2];
            height = arg[3];
            //startChar = String.fromCharCode(arg[4]);
            startChar = arg[4];
            cc.Assert(label !== null, "Label must be non-nil");
        }

        if (this.initWithTileFile(textureFilename, width, height, label.length)) {
            this._mapStartChar = startChar;
            this.setString(label);
            return true;
        }
        return false;
    },

    /**
     *  Atlas generation
     */
    updateAtlasValues:function () {
        var texture = this.getTexture();

        for (var i = 0; i < this._string.length; i++) {
            var a = this._string.charCodeAt(i) - this._mapStartChar.charCodeAt(0);
            var row = parseInt(a % this._itemsPerRow,10) * cc.CONTENT_SCALE_FACTOR();
            var col = parseInt(a / this._itemsPerRow,10) * cc.CONTENT_SCALE_FACTOR();

            var rect = cc.rect(row * this._itemWidth, col * this._itemHeight, this._itemWidth, this._itemHeight);
            var c = this._string.charCodeAt(i);
            var fontChar = this.getChildByTag(i);
            if (!fontChar) {
                fontChar = new cc.Sprite();
                if (c == 32) {
                    fontChar.init();
                    fontChar.setTextureRect(cc.rect(0, 0, 10, 10), false, cc.SizeZero());
                }
                else {
                    fontChar.initWithTexture(texture, rect);
                }
                this.addChild(fontChar, 0, i);
            } else {
                if (c == 32) {
                    fontChar.init();
                    fontChar.setTextureRect(cc.rect(0, 0, 10, 10), false, cc.SizeZero());
                }
                else {
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
        this._string = label;
        var len = label.length;
        this._textureAtlas.resizeCapacity(len);

        this.setContentSize(new cc.size(len * this._itemWidth, this._itemHeight));

        if (this._children) {
            for (var i = 0; i < this._children.length; i++) {
                var node = this._children[i];
                if (node) {
                    node.setVisible(false);
                }
            }
        }
        this.updateAtlasValues();
    },

    setOpacity:function(opacity){
        if(this._opacity != opacity){
            this._opacity = opacity;

            for (var i = 0; i < this._children.length; i++) {
                if (this._children[i]) {
                    this._children[i].setOpacity(opacity);
                }
            }
        }
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

    // string to render
    _string:null,
    // the first char in the charmap
    _mapStartChar:null
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
cc.LabelAtlas.create = function (/* Multi arguments */) {
    var ret = new cc.LabelAtlas();
    if (ret && ret.initWithString(arguments)) {
        return ret;
    }
    return null;
};
