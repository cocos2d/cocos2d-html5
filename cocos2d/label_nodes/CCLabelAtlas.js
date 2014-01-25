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
    // string to render
    _string:null,
    // the first char in the charmap
    _mapStartChar:null,

    _textureLoaded:false,
    _loadedEventListeners: null,

    ctor:function(){
        cc.AtlasNode.prototype.ctor.call(this);
    },

    /**
     * return  texture is loaded
     * @returns {boolean}
     */
    textureLoaded:function(){
        return this._textureLoaded;
    },

    /**
     * add texture loaded event listener
     * @param {Function} callback
     * @param {Object} target
     */
    addLoadedEventListener:function(callback, target){
        if(!this._loadedEventListeners)
            this._loadedEventListeners = [];
        this._loadedEventListeners.push({eventCallback:callback, eventTarget:target});
    },

    _callLoadedEventCallbacks:function(){
        if(!this._loadedEventListeners)
            return;
        this._textureLoaded = true;
        var locListeners = this._loadedEventListeners;
        for(var i = 0, len = locListeners.length;  i < len; i++){
            var selCallback = locListeners[i];
            selCallback.eventCallback.call(selCallback.eventTarget, this);
        }
        locListeners.length = 0;
    },
    /**
     * <p>
     * initializes the cc.LabelAtlas with a string, a char map file(the atlas),                     <br/>
     * the width and height of each element and the starting char of the atlas                      <br/>
     *  It accepts two groups of parameters:                                                        <br/>
     * a) string, fntFile                                                                           <br/>
     * b) label, textureFilename, width, height, startChar                                          <br/>
     * </p>
     * @param {String} strText
     * @param {String|cc.Texture2D} charMapFile  charMapFile or fntFile or texture file
     * @param {Number} [itemWidth=0]
     * @param {Number} [itemHeight=0]
     * @param {Number} [startCharMap=""]
     * @return {Boolean} returns true on success
     */
    initWithString:function (strText, charMapFile, itemWidth, itemHeight, startCharMap) {
        var label = strText + "", textureFilename, width, height, startChar;
        if (arguments.length === 2) {
            var fileUtils = cc.FileUtils.getInstance();
            var pathStr = fileUtils.fullPathForFilename(charMapFile);
            var relPathStr = pathStr.substr(0, pathStr.lastIndexOf('/')) + '/';

            var dict = fileUtils.dictionaryWithContentsOfFileThreadSafe(pathStr);
            if(parseInt(dict["version"], 10) !== 1) {
                cc.log("cc.LabelAtlas.initWithString(): Unsupported version. Upgrade cocos2d version");
                return false;
            }

            textureFilename = relPathStr + dict["textureFilename"];
            var locScaleFactor = cc.CONTENT_SCALE_FACTOR();
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
        if(textureFilename instanceof cc.Texture2D)
            texture = textureFilename;
        else
            texture = cc.TextureCache.getInstance().addImage(textureFilename);
        var locLoaded = texture.isLoaded();
        this._textureLoaded = locLoaded;
        if(!locLoaded){
            texture.addLoadedEventListener(function(sender){
                this.initWithTexture(texture, width, height, label.length);
                this.setString(label);
                this._callLoadedEventCallbacks();
            },this);
        }
        if (this.initWithTexture(texture, width, height, label.length)) {
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
        cc.AtlasNode.prototype.setColor.call(this, color3);
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
    draw:function (ctx) {
        cc.AtlasNode.prototype.draw.call(this,ctx);
        if (cc.LABELATLAS_DEBUG_DRAW) {
            var s = this.getContentSize();
            var vertices = [cc.p(0, 0), cc.p(s.width, 0),
                cc.p(s.width, s.height), cc.p(0, s.height)];
            cc.drawingUtil.drawPoly(vertices, 4, true);
        }
    },

    /**
     *  Atlas generation
     */
    updateAtlasValues: null,

    _updateAtlasValuesForCanvas: function () {
        var locString = this._string;
        var n = locString.length;
        var texture = this.getTexture();
        var locItemWidth = this._itemWidth , locItemHeight = this._itemHeight ;     //needn't multiply cc.CONTENT_SCALE_FACTOR(), because sprite's draw will do this

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
                    fontChar.setOpacity(this._displayedOpacity);
                }
            }
            fontChar.setPosition(i * locItemWidth + locItemWidth / 2, locItemHeight / 2);
        }
    },

    _updateAtlasValuesForWebGL: function () {
        var locString = this._string;
        var n = locString.length;
        var locTextureAtlas = this._textureAtlas;

        var texture = locTextureAtlas.getTexture();
        var textureWide = texture.getPixelsWide();
        var textureHigh = texture.getPixelsHigh();
        var itemWidthInPixels = this._itemWidth;
        var itemHeightInPixels = this._itemHeight;
        if (!this._ignoreContentScaleFactor) {
            itemWidthInPixels = this._itemWidth * cc.CONTENT_SCALE_FACTOR();
            itemHeightInPixels = this._itemHeight * cc.CONTENT_SCALE_FACTOR();
        }
        if(n > locTextureAtlas.getCapacity())
            cc.log("cc.LabelAtlas._updateAtlasValues(): Invalid String length");
        var quads = locTextureAtlas.getQuads();
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
            locTextureAtlas.setDirty(true);
            var totalQuads = locTextureAtlas.getTotalQuads();
            if (n > totalQuads)
                locTextureAtlas.increaseTotalQuadsWith(n - totalQuads);
        }
    },

    /**
     * set the display string
     * @param {String} label
     */
    setString: null,

    _setStringForCanvas: function (label) {
        label = String(label);
        var len = label.length;
        this._string = label;
        this.setContentSize(len * this._itemWidth, this._itemHeight);
        if (this._children) {
            var locChildren = this._children;
            len = locChildren.length;
            for (var i = 0; i < len; i++) {
                var node = locChildren[i];
                if (node)
                    node.setVisible(false);
            }
        }

        this.updateAtlasValues();
        this._quadsToDraw = len;
    },

    _setStringForWebGL: function (label) {
        label = String(label);
        var len = label.length;
        if (len > this._textureAtlas.getTotalQuads())
            this._textureAtlas.resizeCapacity(len);

        this._string = label;
        this.setContentSize(len * this._itemWidth, this._itemHeight);

        this.updateAtlasValues();
        this._quadsToDraw = len;
    },

    setOpacity: null,

    _setOpacityForCanvas: function (opacity) {
        if (this._displayedOpacity !== opacity) {
            cc.AtlasNode.prototype.setOpacity.call(this, opacity);
            var locChildren = this._children;
            for (var i = 0, len = locChildren.length; i < len; i++) {
                if (locChildren[i])
                    locChildren[i].setOpacity(opacity);
            }
        }
    },

    _setOpacityForWebGL: function (opacity) {
        if (this._opacity !== opacity)
            cc.AtlasNode.prototype.setOpacity.call(this, opacity);
    }
});

if(cc.Browser.supportWebGL){
    cc.LabelAtlas.prototype.updateAtlasValues =  cc.LabelAtlas.prototype._updateAtlasValuesForWebGL;
    cc.LabelAtlas.prototype.setString =  cc.LabelAtlas.prototype._setStringForWebGL;
    cc.LabelAtlas.prototype.setOpacity =  cc.LabelAtlas.prototype._setOpacityForWebGL;
} else {
    cc.LabelAtlas.prototype.updateAtlasValues =  cc.LabelAtlas.prototype._updateAtlasValuesForCanvas;
    cc.LabelAtlas.prototype.setString =  cc.LabelAtlas.prototype._setStringForCanvas;
    cc.LabelAtlas.prototype.setOpacity =  cc.LabelAtlas.prototype._setOpacityForCanvas;
}

/**
 * <p>
 *  It accepts two groups of parameters:                                                            <br/>
 * a) string, fntFile                                                                               <br/>
 * b) label, textureFilename, width, height, startChar                                              <br/>
 * </p>
 * @param {String} strText
 * @param {String} charMapFile  charMapFile or fntFile
 * @param {Number} [itemWidth=0]
 * @param {Number} [itemHeight=0]
 * @param {Number} [startCharMap=""]
 * @return {cc.LabelAtlas|Null} returns the LabelAtlas object on success
 * @example
 * //Example
 * //creates the cc.LabelAtlas with a string, a char map file(the atlas), the width and height of each element and the starting char of the atlas
 * var myLabel = cc.LabelAtlas.create('Text to display', 'CharMapfile.png', 12, 20, ' ')
 *
 * //creates the cc.LabelAtlas with a string, a fnt file
 * var myLabel = cc.LabelAtlas.create('Text to display', 'CharMapFile.plist‘);
 */
cc.LabelAtlas.create = function (strText, charMapFile, itemWidth, itemHeight, startCharMap) {
    var ret = new cc.LabelAtlas();
    if (ret && cc.LabelAtlas.prototype.initWithString.apply(ret,arguments)) {
        return ret;
    }
    return null;
};

