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
 * @extends cc.LabelBMFont
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
cc.LabelAtlas = cc.LabelBMFont.extend(/** @lends cc.LabelBMFont# */{
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
        cc.SpriteBatchNode.prototype.ctor.call(this);
        this._imageOffset = cc.p(0, 0);
        this._cascadeColorEnabled = true;
        this._cascadeOpacityEnabled = true;

        charMapFile && cc.LabelAtlas.prototype.initWithString.call(this, strText, charMapFile, itemWidth, itemHeight, startCharMap);
    },

    _createRenderCmd: function () {
        if (cc._renderType === cc.game.RENDER_TYPE_WEBGL)
            return new cc.LabelBMFont.WebGLRenderCmd(this);
        else
            return new cc.LabelBMFont.CanvasRenderCmd(this);
    },

    _createFntConfig: function (texture, itemWidth, itemHeight, startCharMap) {
        var fnt = {};
        fnt.commonHeight = itemHeight;

        var fontDefDictionary = fnt.fontDefDictionary = {};

        var textureWidth = texture.pixelsWidth;
        var textureHeight = texture.pixelsHeight;

        var startCharCode = startCharMap.charCodeAt(0);
        var i = 0;
        for (var col = itemHeight; col <= textureHeight; col += itemHeight) {
            for (var row = 0; row < textureWidth; row += itemWidth) {
                fontDefDictionary[startCharCode+i] = {
                    rect: {x: row, y: col - itemHeight, width:itemWidth, height: itemHeight },
                    xOffset: 0,
                    yOffset: 0,
                    xAdvance: itemWidth
                };
                ++i;
            }
        }

        fnt.kerningDict = {};

        return fnt;
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
        var self = this, theString = label || "";
        this._initialString = theString;
        self._string = theString;

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

        var texture;
        if (charMapFile) {
            self._fntFile = "dummy_fnt_file:" + textureFilename;
            var spriteFrameBaseName = textureFilename;
            var spriteFrame = cc.spriteFrameCache.getSpriteFrame(spriteFrameBaseName) || cc.spriteFrameCache.getSpriteFrame(cc.path.basename(spriteFrameBaseName));
            if(spriteFrame) {
                texture = spriteFrame.getTexture();
                this._spriteFrame = spriteFrame;
            } else {
                texture = cc.textureCache.addImage(textureFilename);
            }

            var newConf = this._createFntConfig(texture, width, height, startChar);
            newConf.atlasName = textureFilename;
            self._config = newConf;

            var locIsLoaded = texture.isLoaded();
            self._textureLoaded = locIsLoaded;
            if (!locIsLoaded) {
                texture.addEventListener("load", function (sender) {
                    var self1 = this;
                    self1._textureLoaded = true;
                    //reset the LabelBMFont
                    self1.initWithTexture(sender, self1._initialString.length);
                    self1.setString(self1._initialString, true);
                    self1.dispatchEvent("load");
                }, self);
            }
        } else {
            texture = new cc.Texture2D();
            var image = new Image();
            texture.initWithElement(image);
            self._textureLoaded = false;
        }

        if (self.initWithTexture(texture, theString.length)) {
            self._alignment = cc.TEXT_ALIGNMENT_LEFT;
            self._imageOffset = cc.p(0, 0);
            self._width = -1;

            self._realOpacity = 255;
            self._realColor = cc.color(255, 255, 255, 255);

            self._contentSize.width = 0;
            self._contentSize.height = 0;

            self.setString(theString, true);
            return true;
        }
        return false;
    },

    setFntFile: function () {
        cc.warn("setFntFile doesn't support with LabelAtlas.");
    }

});

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

