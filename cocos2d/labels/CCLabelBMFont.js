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

 Use any of these editors to generate BMFonts:
 http://glyphdesigner.71squared.com/ (Commercial, Mac OS X)
 http://www.n4te.com/hiero/hiero.jnlp (Free, Java)
 http://slick.cokeandcode.com/demos/hiero.jnlp (Free, Java)
 http://www.angelcode.com/products/bmfont/ (Free, Windows only)
 ****************************************************************************/
/**
 * @constant
 * @type Number
 */
cc.LABEL_AUTOMATIC_WIDTH = -1;

/**
 * <p>cc.LabelBMFont is a subclass of cc.SpriteBatchNode.</p>
 *
 * <p>Features:<br/>
 * <ul><li>- Treats each character like a cc.Sprite. This means that each individual character can be:</li>
 * <li>- rotated</li>
 * <li>- scaled</li>
 * <li>- translated</li>
 * <li>- tinted</li>
 * <li>- chage the opacity</li>
 * <li>- It can be used as part of a menu item.</li>
 * <li>- anchorPoint can be used to align the "label"</li>
 * <li>- Supports AngelCode text format</li></ul></p>
 *
 * <p>Limitations:<br/>
 * - All inner characters are using an anchorPoint of (0.5, 0.5) and it is not recommend to change it
 * because it might affect the rendering</p>
 *
 * <p>cc.LabelBMFont implements the protocol cc.LabelProtocol, like cc.Label and cc.LabelAtlas.<br/>
 * cc.LabelBMFont has the flexibility of cc.Label, the speed of cc.LabelAtlas and all the features of cc.Sprite.<br/>
 * If in doubt, use cc.LabelBMFont instead of cc.LabelAtlas / cc.Label.</p>
 *
 * <p>Supported editors:<br/>
 * http://glyphdesigner.71squared.com/ (Commercial, Mac OS X)<br/>
 * http://www.n4te.com/hiero/hiero.jnlp (Free, Java)<br/>
 * http://slick.cokeandcode.com/demos/hiero.jnlp (Free, Java)<br/>
 * http://www.angelcode.com/products/bmfont/ (Free, Windows only)</p>
 * @class
 * @extends cc.SpriteBatchNode
 *
 * @property {String}   string          - Content string of label
 * @property {enum}     textAlign       - Horizontal Alignment of label, cc.TEXT_ALIGNMENT_LEFT|cc.TEXT_ALIGNMENT_CENTER|cc.TEXT_ALIGNMENT_RIGHT
 * @property {Number}   boundingWidth   - Width of the bounding box of label, the real content width is limited by boundingWidth
 */
cc.LabelBMFont = cc.SpriteBatchNode.extend(/** @lends cc.LabelBMFont# */{
    RGBAProtocol: true,

    _opacityModifyRGB: false,

    _string: "",
    _config: null,

    // name of fntFile
    _fntFile: "",

    // initial string without line breaks
    _initialString: "",

    // alignment of all lines
    _alignment: cc.TEXT_ALIGNMENT_CENTER,

    // max width until a line break is added
    _width: -1,
    _lineBreakWithoutSpaces: false,
    _imageOffset: null,

    _reusedChar: null,

    //texture RGBA
    _displayedOpacity: 255,
    _realOpacity: 255,
    _displayedColor: null,
    _realColor: null,
    _cascadeColorEnabled: true,
    _cascadeOpacityEnabled: true,

    _textureLoaded: false,
    _loadedEventListeners: null,
    _className: "LabelBMFont",

    _setString: function (newString, needUpdateLabel) {
        if (!needUpdateLabel) {
            this._string = newString;
        } else {
            this._initialString = newString;
        }
        var locChildren = this._children;
        if (locChildren) {
            for (var i = 0; i < locChildren.length; i++) {
                var selNode = locChildren[i];
                if (selNode)
                    selNode.setVisible(false);
            }
        }
        if (this._textureLoaded) {
            this.createFontChars();

            if (needUpdateLabel)
                this.updateLabel();
        }
    },

    /**
     * creates a bitmap font atlas with an initial string and the FNT file
     * Constructor of cc.LabelBMFont
     * @param {String} str
     * @param {String} fntFile
     * @param {Number} [width=-1]
     * @param {Number} [alignment=cc.TEXT_ALIGNMENT_LEFT]
     * @param {cc.Point} [imageOffset=cc.p(0,0)]
     * @example
     * // Example 01
     * var label1 = new cc.LabelBMFont("Test case", "test.fnt");
     *
     * // Example 02
     * var label2 = new cc.LabelBMFont("test case", "test.fnt", 200, cc.TEXT_ALIGNMENT_LEFT);
     *
     * // Example 03
     * var label3 = new cc.LabelBMFont("This is a \n test case", "test.fnt", 200, cc.TEXT_ALIGNMENT_LEFT, cc.p(0,0));
     */
    ctor: function (str, fntFile, width, alignment, imageOffset) {
        var self = this;
        cc.SpriteBatchNode.prototype.ctor.call(self);
        self._imageOffset = cc.p(0, 0);
        self._displayedColor = cc.color(255, 255, 255, 255);
        self._realColor = cc.color(255, 255, 255, 255);
        self._reusedChar = [];

        this.initWithString(str, fntFile, width, alignment, imageOffset);
    },
    /**
     * return  texture is loaded
     * @returns {boolean}
     */
    textureLoaded: function () {
        return this._textureLoaded;
    },

    /**
     * add texture loaded event listener
     * @param {Function} callback
     * @param {Object} target
     */
    addLoadedEventListener: function (callback, target) {
        if (!this._loadedEventListeners)
            this._loadedEventListeners = [];
        this._loadedEventListeners.push({eventCallback: callback, eventTarget: target});
    },

    _callLoadedEventCallbacks: function () {
        if (!this._loadedEventListeners)
            return;
        var locListeners = this._loadedEventListeners;
        for (var i = 0, len = locListeners.length; i < len; i++) {
            var selCallback = locListeners[i];
            selCallback.eventCallback.call(selCallback.eventTarget, this);
        }
        locListeners.length = 0;
    },

    /**
     * @param {CanvasRenderingContext2D} ctx
     */
    draw: function (ctx) {
        cc.SpriteBatchNode.prototype.draw.call(this, ctx);

        //LabelBMFont - Debug draw
        if (cc.LABELBMFONT_DEBUG_DRAW) {
            var size = this.getContentSize();
            var pos = cc.p(0 | ( -this._anchorPointInPoints.x), 0 | ( -this._anchorPointInPoints.y));
            var vertices = [cc.p(pos.x, pos.y), cc.p(pos.x + size.width, pos.y), cc.p(pos.x + size.width, pos.y + size.height), cc.p(pos.x, pos.y + size.height)];
            cc._drawingUtil.setDrawColor(0, 255, 0, 255);
            cc._drawingUtil.drawPoly(vertices, 4, true);
        }
    },

    //TODO
    /**
     * tint this label
     * @param {cc.Color} color
     */
    setColor: function (color) {
        var locDisplayed = this._displayedColor, locRealColor = this._realColor;
        if ((locRealColor.r == color.r) && (locRealColor.g == color.g) && (locRealColor.b == color.b) && (locRealColor.a == color.a))
            return;
        locDisplayed.r = locRealColor.r = color.r;
        locDisplayed.g = locRealColor.g = color.g;
        locDisplayed.b = locRealColor.b = color.b;

        if (this._textureLoaded) {
            if (this._cascadeColorEnabled) {
                var parentColor = cc.color.WHITE;
                var locParent = this._parent;
                if (locParent && locParent.RGBAProtocol && locParent.cascadeColor)
                    parentColor = locParent.getDisplayedColor();
                this.updateDisplayedColor(parentColor);
            }
        }

        if (color.a !== undefined && !color.a_undefined) {
            this.setOpacity(color.a);
        }
    },

    /**
     * conforms to cc.RGBAProtocol protocol
     * @return {Boolean}
     */
    isOpacityModifyRGB: function () {
        return this._opacityModifyRGB;
    },

    /**
     * @param {Boolean} opacityModifyRGB
     */
    setOpacityModifyRGB: function (opacityModifyRGB) {
        this._opacityModifyRGB = opacityModifyRGB;
        var locChildren = this._children;
        if (locChildren) {
            for (var i = 0; i < locChildren.length; i++) {
                var node = locChildren[i];
                if (node && node.RGBAProtocol)
                    node.opacityModifyRGB = this._opacityModifyRGB;
            }
        }
    },

    getOpacity: function () {
        return this._realOpacity;
    },

    getDisplayedOpacity: function () {
        return this._displayedOpacity;
    },

    /**
     * Override synthesized setOpacity to recurse items
     * @param {Number} opacity
     */
    setOpacity: function (opacity) {
        this._displayedOpacity = this._realOpacity = opacity;
        if (this._cascadeOpacityEnabled) {
            var parentOpacity = 255;
            var locParent = this._parent;
            if (locParent && locParent.RGBAProtocol && locParent.cascadeOpacity)
                parentOpacity = locParent.getDisplayedOpacity();
            this.updateDisplayedOpacity(parentOpacity);
        }

        this._displayedColor.a = this._realColor.a = opacity;
    },

    updateDisplayedOpacity: function (parentOpacity) {
        this._displayedOpacity = this._realOpacity * parentOpacity / 255.0;
        var locChildren = this._children;
        for (var i = 0; i < locChildren.length; i++) {
            var locChild = locChildren[i];
            if (cc._renderType == cc._RENDER_TYPE_WEBGL) {
                locChild.updateDisplayedOpacity(this._displayedOpacity);
            } else {
                cc.NodeRGBA.prototype.updateDisplayedOpacity.call(locChild, this._displayedOpacity);
                locChild.setNodeDirty();
            }
        }
        this._changeTextureColor();
    },

    isCascadeOpacityEnabled: function () {
        return false;
    },

    setCascadeOpacityEnabled: function (cascadeOpacityEnabled) {
        this._cascadeOpacityEnabled = cascadeOpacityEnabled;
    },

    getColor: function () {
        var locRealColor = this._realColor;
        return cc.color(locRealColor.r, locRealColor.g, locRealColor.b, locRealColor.a);
    },

    getDisplayedColor: function () {
        return this._displayedColor;
    },

    updateDisplayedColor: function (parentColor) {
        var locDispColor = this._displayedColor;
        var locRealColor = this._realColor;
        locDispColor.r = locRealColor.r * parentColor.r / 255.0;
        locDispColor.g = locRealColor.g * parentColor.g / 255.0;
        locDispColor.b = locRealColor.b * parentColor.b / 255.0;

        var locChildren = this._children;
        for (var i = 0; i < locChildren.length; i++) {
            var locChild = locChildren[i];
            if (cc._renderType == cc._RENDER_TYPE_WEBGL) {
                locChild.updateDisplayedColor(this._displayedColor);
            } else {
                cc.NodeRGBA.prototype.updateDisplayedColor.call(locChild, this._displayedColor);
                locChild.setNodeDirty();
            }
        }
        this._changeTextureColor();
    },

    _changeTextureColor: function () {
        if (cc._renderType == cc._RENDER_TYPE_WEBGL) {
            return;
        }
        var locElement, locTexture = this.texture;
        if (locTexture && locTexture.width > 0) {
            locElement = locTexture.getHtmlElementObj();
            if (!locElement)
                return;
            var cacheTextureForColor = cc.textureCache.getTextureColors(this._originalTexture.getHtmlElementObj());
            if (cacheTextureForColor) {
                if (locElement instanceof HTMLCanvasElement && !this._rectRotated)
                    cc.generateTintImage(locElement, cacheTextureForColor, this._displayedColor, null, locElement);
                else {
                    locElement = cc.generateTintImage(locElement, cacheTextureForColor, this._displayedColor);
                    locTexture = new cc.Texture2D();
                    locTexture.initWithElement(locElement);
                    locTexture.handleLoadedTexture();
                    this.texture = locTexture;
                }
            }
        }
    },

    isCascadeColorEnabled: function () {
        return false;
    },

    setCascadeColorEnabled: function (cascadeColorEnabled) {
        this._cascadeColorEnabled = cascadeColorEnabled;
    },

    /**
     *  init LabelBMFont
     */
    init: function () {
        return this.initWithString(null, null, null, null, null);
    },

    /**
     * init a bitmap font altas with an initial string and the FNT file
     * @param {String} str
     * @param {String} fntFile
     * @param {Number} [width=-1]
     * @param {Number} [alignment=cc.TEXT_ALIGNMENT_LEFT]
     * @param {cc.Point} [imageOffset=cc.p(0,0)]
     * @return {Boolean}
     */
    initWithString: function (str, fntFile, width, alignment, imageOffset) {
        var self = this, theString = str || "";

        if (self._config)
            cc.log("cc.LabelBMFont.initWithString(): re-init is no longer supported");


        var texture;
        if (fntFile) {
            var newConf = cc.loader.getRes(fntFile);
            if (!newConf) {
                cc.log("cc.LabelBMFont.initWithString(): Impossible to create font. Please check file");
                return false;
            }

            self._config = newConf;
            self._fntFile = fntFile;
            texture = cc.textureCache.addImage(newConf.atlasName);
            var locIsLoaded = texture.isLoaded();
            self._textureLoaded = locIsLoaded;
            if (!locIsLoaded) {
                texture.addLoadedEventListener(function (sender) {
                    var self1 = this;
                    self1._textureLoaded = true;
                    //reset the LabelBMFont
                    self1.initWithTexture(sender, self1._initialString.length);
                    self1.setString(self1._initialString, true);
                    self1._callLoadedEventCallbacks();
                }, self);
            }
        } else {
            texture = new cc.Texture2D();
            var image = new Image();
            texture.initWithElement(image);
            self._textureLoaded = false;
        }

        if (self.initWithTexture(texture, theString.length)) {
            self._alignment = alignment || cc.TEXT_ALIGNMENT_LEFT;
            self._imageOffset = imageOffset || cc.p(0, 0);
            self._width = (width == null) ? -1 : width;

            self._displayedOpacity = self._realOpacity = 255;
            self._displayedColor = cc.color(255, 255, 255, 255);
            self._realColor = cc.color(255, 255, 255, 255);
            self._cascadeOpacityEnabled = true;
            self._cascadeColorEnabled = true;

            self._contentSize.width = 0;
            self._contentSize.height = 0;

            self.setAnchorPoint(0.5, 0.5);

            if (cc._renderType === cc._RENDER_TYPE_WEBGL) {
                var locTexture = self.textureAtlas.texture;
                self._opacityModifyRGB = locTexture.hasPremultipliedAlpha();

                var reusedChar = self._reusedChar = new cc.Sprite();
                reusedChar.initWithTexture(locTexture, cc.rect(0, 0, 0, 0), false);
                reusedChar.batchNode = self;
            }
            self.setString(theString, true);
            return true;
        }
        return false;
    },

    /**
     * updates the font chars based on the string to render
     */
    createFontChars: function () {
        var self = this;
        var locContextType = cc._renderType;
        var locTexture = (locContextType === cc._RENDER_TYPE_CANVAS) ? self.texture : self.textureAtlas.texture;

        var nextFontPositionX = 0;

        var tmpSize = cc.size(0, 0);

        var longestLine = 0;

        var quantityOfLines = 1;

        var locStr = self._string;
        var stringLen = locStr ? locStr.length : 0;

        if (stringLen === 0)
            return;

        var i, locCfg = self._config, locKerningDict = locCfg.kerningDict,
            locCommonH = locCfg.commonHeight, locFontDict = locCfg.fontDefDictionary;
        for (i = 0; i < stringLen - 1; i++) {
            if (locStr.charCodeAt(i) == 10) quantityOfLines++;
        }

        var totalHeight = locCommonH * quantityOfLines;
        var nextFontPositionY = -(locCommonH - locCommonH * quantityOfLines);

        var prev = -1;
        for (i = 0; i < stringLen; i++) {
            var key = locStr.charCodeAt(i);
            if (key == 0) continue;

            if (key === 10) {
                //new line
                nextFontPositionX = 0;
                nextFontPositionY -= locCfg.commonHeight;
                continue;
            }

            var kerningAmount = locKerningDict[(prev << 16) | (key & 0xffff)] || 0;
            var fontDef = locFontDict[key];
            if (!fontDef) {
                cc.log("cocos2d: LabelBMFont: character not found " + locStr[i]);
                continue;
            }

            var rect = cc.rect(fontDef.rect.x, fontDef.rect.y, fontDef.rect.width, fontDef.rect.height);
            rect = cc.rectPixelsToPoints(rect);
            rect.x += self._imageOffset.x;
            rect.y += self._imageOffset.y;

            var fontChar = self.getChildByTag(i);
            //var hasSprite = true;
            if (!fontChar) {
                fontChar = new cc.Sprite();
                if ((key === 32) && (locContextType === cc._RENDER_TYPE_CANVAS)) rect = cc.rect(0, 0, 0, 0);
                fontChar.initWithTexture(locTexture, rect, false);
                fontChar._newTextureWhenChangeColor = true;
                self.addChild(fontChar, 0, i);
            } else {
                if ((key === 32) && (locContextType === cc._RENDER_TYPE_CANVAS)) {
                    fontChar.setTextureRect(rect, false, cc.size(0, 0));
                } else {
                    // updating previous sprite
                    fontChar.setTextureRect(rect, false);
                    // restore to default in case they were modified
                    fontChar.visible = true;
                }
            }
            // Apply label properties
            fontChar.opacityModifyRGB = self._opacityModifyRGB;
            // Color MUST be set before opacity, since opacity might change color if OpacityModifyRGB is on
            if (cc._renderType == cc._RENDER_TYPE_WEBGL) {
                fontChar.updateDisplayedColor(self._displayedColor);
                fontChar.updateDisplayedOpacity(self._displayedOpacity);
            } else {
                cc.NodeRGBA.prototype.updateDisplayedColor.call(fontChar, self._displayedColor);
                cc.NodeRGBA.prototype.updateDisplayedOpacity.call(fontChar, self._displayedOpacity);
                fontChar.setNodeDirty();
            }

            var yOffset = locCfg.commonHeight - fontDef.yOffset;
            var fontPos = cc.p(nextFontPositionX + fontDef.xOffset + fontDef.rect.width * 0.5 + kerningAmount,
                nextFontPositionY + yOffset - rect.height * 0.5 * cc.contentScaleFactor());
            fontChar.setPosition(cc.pointPixelsToPoints(fontPos));

            // update kerning
            nextFontPositionX += fontDef.xAdvance + kerningAmount;
            prev = key;

            if (longestLine < nextFontPositionX)
                longestLine = nextFontPositionX;
        }

        tmpSize.width = longestLine;
        tmpSize.height = totalHeight;
        self.setContentSize(cc.sizePixelsToPoints(tmpSize));
    },

    /**
     * update String
     * @param {Boolean} fromUpdate
     */
    updateString: function (fromUpdate) {
        var self = this;
        var locChildren = self._children;
        if (locChildren) {
            for (var i = 0, li = locChildren.length; i < li; i++) {
                var node = locChildren[i];
                if (node) node.visible = false;
            }
        }
        if (self._config)
            self.createFontChars();

        if (!fromUpdate)
            self.updateLabel();
    },

    /**
     * get the text of this label
     * @return {String}
     */
    getString: function () {
        return this._initialString;
    },

    /**
     * set the text
     * @param {String} newString
     * @param {Boolean|null} needUpdateLabel
     */
    setString: function (newString, needUpdateLabel) {
        newString = String(newString);
        if (needUpdateLabel == null)
            needUpdateLabel = true;
        if (newString == null || typeof(newString) != "string")
            newString = newString + "";

        this._initialString = newString;
        this._setString(newString, needUpdateLabel);
    },

    _setStringForSetter: function (newString) {
        this.setString(newString, false);
    },

    /**
     * @deprecated
     * @param label
     */
    setCString: function (label) {
        this.setString(label, true);
    },

    /**
     *  update Label
     */
    updateLabel: function () {
        var self = this;
        self.string = self._initialString;

        // Step 1: Make multiline
        if (self._width > 0) {
            var stringLength = self._string.length;
            var multiline_string = [];
            var last_word = [];

            var line = 1, i = 0, start_line = false, start_word = false, startOfLine = -1, startOfWord = -1, skip = 0;

            var characterSprite;
            for (var j = 0, lj = self._children.length; j < lj; j++) {
                var justSkipped = 0;
                while (!(characterSprite = self.getChildByTag(j + skip + justSkipped)))
                    justSkipped++;
                skip += justSkipped;

                if (i >= stringLength)
                    break;

                var character = self._string[i];
                if (!start_word) {
                    startOfWord = self._getLetterPosXLeft(characterSprite);
                    start_word = true;
                }
                if (!start_line) {
                    startOfLine = startOfWord;
                    start_line = true;
                }

                // Newline.
                if (character.charCodeAt(0) == 10) {
                    last_word.push('\n');
                    multiline_string = multiline_string.concat(last_word);
                    last_word.length = 0;
                    start_word = false;
                    start_line = false;
                    startOfWord = -1;
                    startOfLine = -1;
                    //i+= justSkipped;
                    j--;
                    skip -= justSkipped;
                    line++;

                    if (i >= stringLength)
                        break;

                    character = self._string[i];
                    if (!startOfWord) {
                        startOfWord = self._getLetterPosXLeft(characterSprite);
                        start_word = true;
                    }
                    if (!startOfLine) {
                        startOfLine = startOfWord;
                        start_line = true;
                    }
                    i++;
                    continue;
                }

                // Whitespace.
                if (cc.isspace_unicode(character)) {
                    last_word.push(character);
                    multiline_string = multiline_string.concat(last_word);
                    last_word.length = 0;
                    start_word = false;
                    startOfWord = -1;
                    i++;
                    continue;
                }

                // Out of bounds.
                if (self._getLetterPosXRight(characterSprite) - startOfLine > self._width) {
                    if (!self._lineBreakWithoutSpaces) {
                        last_word.push(character);

                        var found = multiline_string.lastIndexOf(" ");
                        if (found != -1)
                            cc.utf8_trim_ws(multiline_string);
                        else
                            multiline_string = [];

                        if (multiline_string.length > 0)
                            multiline_string.push('\n');

                        line++;
                        start_line = false;
                        startOfLine = -1;
                        i++;
                    } else {
                        cc.utf8_trim_ws(last_word);

                        last_word.push('\n');
                        multiline_string = multiline_string.concat(last_word);
                        last_word.length = 0;
                        start_word = false;
                        start_line = false;
                        startOfWord = -1;
                        startOfLine = -1;
                        line++;

                        if (i >= stringLength)
                            break;

                        if (!startOfWord) {
                            startOfWord = self._getLetterPosXLeft(characterSprite);
                            start_word = true;
                        }
                        if (!startOfLine) {
                            startOfLine = startOfWord;
                            start_line = true;
                        }
                        j--;
                    }
                } else {
                    // Character is normal.
                    last_word.push(character);
                    i++;
                }
            }

            multiline_string = multiline_string.concat(last_word);
            var len = multiline_string.length;
            var str_new = "";

            for (i = 0; i < len; ++i)
                str_new += multiline_string[i];

            str_new = str_new + String.fromCharCode(0);
            //this.updateString(true);
            self._setString(str_new, false)
        }

        // Step 2: Make alignment
        if (self._alignment != cc.TEXT_ALIGNMENT_LEFT) {
            i = 0;

            var lineNumber = 0;
            var strlen = self._string.length;
            var last_line = [];

            for (var ctr = 0; ctr < strlen; ctr++) {
                if (self._string[ctr].charCodeAt(0) == 10 || self._string[ctr].charCodeAt(0) == 0) {
                    var lineWidth = 0;
                    var line_length = last_line.length;
                    // if last line is empty we must just increase lineNumber and work with next line
                    if (line_length == 0) {
                        lineNumber++;
                        continue;
                    }
                    var index = i + line_length - 1 + lineNumber;
                    if (index < 0) continue;

                    var lastChar = self.getChildByTag(index);
                    if (lastChar == null)
                        continue;
                    lineWidth = lastChar.getPositionX() + lastChar._getWidth() / 2;

                    var shift = 0;
                    switch (self._alignment) {
                        case cc.TEXT_ALIGNMENT_CENTER:
                            shift = self.width / 2 - lineWidth / 2;
                            break;
                        case cc.TEXT_ALIGNMENT_RIGHT:
                            shift = self.width - lineWidth;
                            break;
                        default:
                            break;
                    }

                    if (shift != 0) {
                        for (j = 0; j < line_length; j++) {
                            index = i + j + lineNumber;
                            if (index < 0) continue;
                            characterSprite = self.getChildByTag(index);
                            if (characterSprite)
                                characterSprite.x += shift;
                        }
                    }

                    i += line_length;
                    lineNumber++;

                    last_line.length = 0;
                    continue;
                }
                last_line.push(self._string[i]);
            }
        }
    },

    /**
     * Set text alignment
     * @param {Number} alignment
     */
    setAlignment: function (alignment) {
        this._alignment = alignment;
        this.updateLabel();
    },

    _getAlignment: function () {
        return this._alignment;
    },

    /**
     * @param {Number} width
     */
    setBoundingWidth: function (width) {
        this._width = width;
        this.updateLabel();
    },

    _getBoundingWidth: function () {
        return this._width;
    },

    /**
     * @param {Boolean}  breakWithoutSpace
     */
    setLineBreakWithoutSpace: function (breakWithoutSpace) {
        this._lineBreakWithoutSpaces = breakWithoutSpace;
        this.updateLabel();
    },

    /**
     * @param {Number} scale
     * @param {Number} [scaleY=null]
     */
    setScale: function (scale, scaleY) {
        cc.Node.prototype.setScale.call(this, scale, scaleY);
        this.updateLabel();
    },

    /**
     * @param {Number} scaleX
     */
    setScaleX: function (scaleX) {
        cc.Node.prototype.setScaleX.call(this, scaleX);
        this.updateLabel();
    },

    /**
     * @param {Number} scaleY
     */
    setScaleY: function (scaleY) {
        cc.Node.prototype.setScaleY.call(this, scaleY);
        this.updateLabel();
    },

    //TODO
    /**
     * set fnt file path
     * @param {String} fntFile
     */
    setFntFile: function (fntFile) {
        var self = this;
        if (fntFile != null && fntFile != self._fntFile) {
            var newConf = cc.loader.getRes(fntFile);

            if (!newConf) {
                cc.log("cc.LabelBMFont.setFntFile() : Impossible to create font. Please check file");
                return;
            }

            self._fntFile = fntFile;
            self._config = newConf;

            var texture = cc.textureCache.addImage(newConf.atlasName);
            var locIsLoaded = texture.isLoaded();
            self._textureLoaded = locIsLoaded;
            self.texture = texture;
            if (cc._renderType === cc._RENDER_TYPE_CANVAS)
                self._originalTexture = self.texture;
            if (!locIsLoaded) {
                texture.addLoadedEventListener(function (sender) {
                    var self1 = this;
                    self1._textureLoaded = true;
                    self1.texture = sender;
                    self1.createFontChars();
                    self1._changeTextureColor();
                    self1.updateLabel();
                    self1._callLoadedEventCallbacks();
                }, self);
            } else {
                self.createFontChars();
            }
        }
    },

    /**
     * @return {String}
     */
    getFntFile: function () {
        return this._fntFile;
    },

    /**
     * set the AnchorPoint of the labelBMFont
     * @override
     * @param {cc.Point|Number} point The anchor point of labelBMFont or The anchor point.x of labelBMFont.
     * @param {Number} [y] The anchor point.y of labelBMFont.
     */
    setAnchorPoint: function (point, y) {
        cc.Node.prototype.setAnchorPoint.call(this, point, y);
        this.updateLabel();
    },

    _setAnchor: function (p) {
        cc.Node.prototype._setAnchor.call(this, p);
        this.updateLabel();
    },
    _setAnchorX: function (x) {
        cc.Node.prototype._setAnchorX.call(this, x);
        this.updateLabel();
    },
    _setAnchorY: function (y) {
        cc.Node.prototype._setAnchorY.call(this, y);
        this.updateLabel();
    },

    _atlasNameFromFntFile: function (fntFile) {
    },

    _kerningAmountForFirst: function (first, second) {
        var ret = 0;
        var key = (first << 16) | (second & 0xffff);
        if (this._configuration.kerningDictionary) {
            var element = this._configuration.kerningDictionary[key.toString()];
            if (element)
                ret = element.amount;
        }
        return ret;
    },

    _getLetterPosXLeft: function (sp) {
        return sp.getPositionX() * this._scaleX - (sp._getWidth() * this._scaleX * sp._getAnchorX());
    },

    _getLetterPosXRight: function (sp) {
        return sp.getPositionX() * this._scaleX + (sp._getWidth() * this._scaleX * sp._getAnchorX());
    }
});

var _p = cc.LabelBMFont.prototype;

// Extended properties
/** @expose */
_p.opacityModifyRGB;
cc.defineGetterSetter(_p, "opacityModifyRGB", _p.isOpacityModifyRGB, _p.setOpacityModifyRGB);
/** @expose */
_p.opacity;
cc.defineGetterSetter(_p, "opacity", _p.getOpacity, _p.setOpacity);
/** @expose */
_p.cascadeOpacity;
cc.defineGetterSetter(_p, "cascadeOpacity", _p.isCascadeOpacityEnabled, _p.setCascadeOpacityEnabled);
/** @expose */
_p.color;
cc.defineGetterSetter(_p, "color", _p.getColor, _p.setColor);
/** @expose */
_p.cascadeColor;
cc.defineGetterSetter(_p, "cascadeColor", _p.isCascadeColorEnabled, _p.setCascadeColorEnabled);
/** @expose */
_p.string;
cc.defineGetterSetter(_p, "string", _p.getString, _p._setStringForSetter);
/** @expose */
_p.boundingWidth;
cc.defineGetterSetter(_p, "boundingWidth", _p._getBoundingWidth, _p.setBoundingWidth);
/** @expose */
_p.textAlign;
cc.defineGetterSetter(_p, "textAlign", _p._getAlignment, _p.setAlignment);

/**
 * creates a bitmap font atlas with an initial string and the FNT file
 * @param {String} str
 * @param {String} fntFile
 * @param {Number} [width=-1]
 * @param {Number} [alignment=cc.TEXT_ALIGNMENT_LEFT]
 * @param {cc.Point} [imageOffset=cc.p(0,0)]
 * @return {cc.LabelBMFont|Null}
 * @example
 * // Example 01
 * var label1 = cc.LabelBMFont.create("Test case", "test.fnt");
 *
 * // Example 02
 * var label2 = cc.LabelBMFont.create("test case", "test.fnt", 200, cc.TEXT_ALIGNMENT_LEFT);
 *
 * // Example 03
 * var label3 = cc.LabelBMFont.create("This is a \n test case", "test.fnt", 200, cc.TEXT_ALIGNMENT_LEFT, cc.p(0,0));
 */
cc.LabelBMFont.create = function (str, fntFile, width, alignment, imageOffset) {
    return new cc.LabelBMFont(str, fntFile, width, alignment, imageOffset);
};

/**
 * @param {String} ch
 * @return {Boolean}  weather the character is a whitespace character.
 */
cc.isspace_unicode = function (ch) {
    ch = ch.charCodeAt(0);
    return  ((ch >= 9 && ch <= 13) || ch == 32 || ch == 133 || ch == 160 || ch == 5760
        || (ch >= 8192 && ch <= 8202) || ch == 8232 || ch == 8233 || ch == 8239
        || ch == 8287 || ch == 12288)
};

/**
 * @param {Array} str
 */
cc.utf8_trim_ws = function (str) {
    var len = str.length;

    if (len <= 0)
        return;

    var last_index = len - 1;

    // Only start trimming if the last character is whitespace..
    if (cc.isspace_unicode(str[last_index])) {
        for (var i = last_index - 1; i >= 0; --i) {
            if (cc.isspace_unicode(str[i])) {
                last_index = i;
            }
            else {
                break;
            }
        }
        cc.utf8_trim_from(str, last_index);
    }
};

/**
 * Trims str st str=[0, index) after the operation.
 * Return value: the trimmed string.
 * @param {Array} str  he string to trim
 * @param {Number} index  the index to start trimming from.
 */
cc.utf8_trim_from = function (str, index) {
    var len = str.length;
    if (index >= len || index < 0)
        return;
    str.splice(index, len);
};


cc._fntLoader = {
    INFO_EXP: /info [^\n]*(\n|$)/gi,
    COMMON_EXP: /common [^\n]*(\n|$)/gi,
    PAGE_EXP: /page [^\n]*(\n|$)/gi,
    CHAR_EXP: /char [^\n]*(\n|$)/gi,
    KERNING_EXP: /kerning [^\n]*(\n|$)/gi,
    ITEM_EXP: /\w+=[^ \r\n]+/gi,
    INT_EXP: /^[\-]?\d+$/,

    _parseStrToObj: function (str) {
        var arr = str.match(this.ITEM_EXP);
        var obj = {};
        if (arr) {
            for (var i = 0, li = arr.length; i < li; i++) {
                var tempStr = arr[i];
                var index = tempStr.indexOf("=");
                var key = tempStr.substring(0, index);
                var value = tempStr.substring(index + 1);
                if (value.match(this.INT_EXP)) value = parseInt(value);
                else if (value[0] == '"') value = value.substring(1, value.length - 1);
                obj[key] = value;
            }
        }
        return obj;
    },
    parseFnt: function (fntStr, url) {
        var self = this, fnt = {};
        //padding
        var infoObj = self._parseStrToObj(fntStr.match(self.INFO_EXP)[0]);
        var paddingArr = infoObj["padding"].split(",");
        var padding = {
            left: parseInt(paddingArr[0]),
            top: parseInt(paddingArr[1]),
            right: parseInt(paddingArr[2]),
            bottom: parseInt(paddingArr[3])
        }

        //common
        var commonObj = self._parseStrToObj(fntStr.match(self.COMMON_EXP)[0]);
        fnt.commonHeight = commonObj["lineHeight"];
        if (cc._renderType === cc._RENDER_TYPE_WEBGL) {
            var texSize = cc.configuration.getMaxTextureSize();
            if (commonObj["scaleW"] > texSize.width || commonObj["scaleH"] > texSize.height)
                cc.log("cc.LabelBMFont._parseCommonArguments(): page can't be larger than supported");
        }
        if (commonObj["pages"] !== 1) cc.log("cc.LabelBMFont._parseCommonArguments(): only supports 1 page");

        //page
        var pageObj = self._parseStrToObj(fntStr.match(self.PAGE_EXP)[0]);
        if (pageObj["id"] !== 0) cc.log("cc.LabelBMFont._parseImageFileName() : file could not be found");
        fnt.atlasName = cc.path.changeBasename(url, pageObj["file"]);

        //char
        var charLines = fntStr.match(self.CHAR_EXP);
        var fontDefDictionary = fnt.fontDefDictionary = {};
        for (var i = 0, li = charLines.length; i < li; i++) {
            var charObj = self._parseStrToObj(charLines[i]);
            var charId = charObj["id"];
            fontDefDictionary[charId] = {
                rect: {x: charObj["x"], y: charObj["y"], width: charObj["width"], height: charObj["height"]},
                xOffset: charObj["xoffset"],
                yOffset: charObj["yoffset"],
                xAdvance: charObj["xadvance"]
            };
        }

        //kerning
        var kerningDict = fnt.kerningDict = {};
        var kerningLines = fntStr.match(self.KERNING_EXP);
        if (kerningLines) {
            for (var i = 0, li = kerningLines.length; i < li; i++) {
                var kerningObj = self._parseStrToObj(kerningLines[i]);
                kerningDict[(kerningObj["first"] << 16) | (kerningObj["second"] & 0xffff)] = kerningObj["amount"];
            }
        }
        return fnt;
    },

    load: function (realUrl, url, res, cb) {
        var self = this;
        cc.loader.loadTxt(realUrl, function (err, txt) {
            if (err) return cb(err);
            cb(null, self.parseFnt(txt, url));
        });
    }
};
cc.loader.register(["fnt"], cc._fntLoader);
