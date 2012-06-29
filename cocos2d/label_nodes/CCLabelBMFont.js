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

 Use any of these editors to generate BMFonts:
 http://glyphdesigner.71squared.com/ (Commercial, Mac OS X)
 http://www.n4te.com/hiero/hiero.jnlp (Free, Java)
 http://slick.cokeandcode.com/demos/hiero.jnlp (Free, Java)
 http://www.angelcode.com/products/bmfont/ (Free, Windows only)
 ****************************************************************************/
cc.CCLabelAutomaticWidth = -1;

cc._KerningHashElement = function (key, amount) {
    this.key = key;	// key for the hash. 16-bit for 1st element, 16-bit for 2nd element
    this.amount = amount;
};

cc._FontDefHashElement = function (key, fontDef) {
    this.key = key;        // key. Font Unicode value
    this.fontDef = fontDef;    // font definition
};

cc._BMFontDef = function (charID, rect, xOffset, yOffset, xAdvance) {
    //! ID of the character
    this.charID = charID || 0;
    //! origin and size of the font
    this.rect = rect || new cc.RectMake(0, 0, 10, 10);
    //! The X amount the image should be offset when drawing the image (in pixels)
    this.xOffset = xOffset || 0;
    //! The Y amount the image should be offset when drawing the image (in pixels)
    this.yOffset = yOffset || 0;
    //! The amount to move the current position after drawing the character (in pixels)
    this.xAdvance = xAdvance || 0;
};

cc._BMFontPadding = function (left, top, right, bottom) {
    /// padding left
    this.left = left || 0;
    /// padding top
    this.top = top || 0;
    /// padding right
    this.right = right || 0;
    /// padding bottom
    this.bottom = bottom || 0;
};

/**
 * cc.BMFontConfiguration has parsed _configuration of the the .fnt file
 * @class
 * @extends cc.Class
 */
cc.BMFontConfiguration = cc.Class.extend(/** @lends cc.BMFontConfiguration# */{
    // XXX: Creating a public interface so that the bitmapFontArray[] is acc.esible
    //@public
    /**
     *  The characters building up the font
     *  @type object
     */
    bitmapFontArray:{},
    /**
     * FNTConfig: Common Height
     * @type Number
     */
    commonHeight:0,
    /**
     *  Padding
     *  @type cc._BMFontPadding
     */
    padding:new cc._BMFontPadding(),
    /**
     * atlas name
     * @type String
     */
    atlasName:"",
    /**
     * values for kerning
     * @type cc._KerningHashElement
     */
    kerningDictionary:{},
    fontDefDictionary:{},
    /**
     * Description of BMFontConfiguration
     * @return {String}
     */
    description:function () {
        var ret = "<cc.BMFontConfiguration | Kernings:" + this.kerningDictionary + " | Image = " + this.atlasName.toString() + ">";
        return ret;
    },
    /**
     * @return {String}
     */
    getAtlasName:function () {
        return this.atlasName;
    },
    /**
     * @param {String} atlasName
     */
    setAtlasName:function (atlasName) {
        this.atlasName = atlasName;
    },
    /**
     * initializes a BitmapFontConfiguration with a FNT file
     * @param {String} FNTfile
     * @return {Boolean}
     */
    initWithFNTfile:function (FNTfile) {
        cc.Assert(FNTfile != null && FNTfile.length != 0, "");
        this._parseConfigFile(FNTfile);
        return true;
    },

    _parseConfigFile:function (controlFile) {
        var data = cc.SAXParser.shareParser().getList(controlFile);
        cc.Assert(data, "cc.BMFontConfiguration._parseConfigFile | Open file error.");

        // parse spacing / padding
        var line, re;

        re = /padding+[a-z0-9\-= ",]+/gi;
        line = re.exec(data)[0];
        if (line) {
            this._parseInfoArguments(line);
        }

        re = /common lineHeight+[a-z0-9\-= ",]+/gi;
        line = re.exec(data)[0];
        if (line) {
            this._parseCommonArguments(line);
        }

        re = /page id=[a-zA-Z0-9\.\-= ",]+/gi;
        line = re.exec(data)[0];
        if (line) {
            this._parseImageFileName(line, controlFile);
        }

        re = /chars c+[a-z0-9\-= ",]+/gi;
        line = re.exec(data)[0];
        if (line) {
            // Ignore this line
        }

        re = /char id=\w[a-z0-9\-= ]+/gi;
        line = data.match(re);
        if (line) {
            // Parse the current line and create a new CharDef
            for (var i = 0; i < line.length; i++) {
                var characterDefinition = new cc._BMFontDef();
                this._parseCharacterDefinition(line[i], characterDefinition);
                //Add the CharDef returned to the charArray
                this.bitmapFontArray[characterDefinition.charID] = characterDefinition;
            }
        }

        re = /kernings count+[a-z0-9\-= ",]+/gi;
        if (re.test(data)) {
            line = RegExp.$1[0];
        }
        if (line) {
            this._parseKerningCapacity(line);
        }

        re = /first=\w[a-z0-9\-= ]+/gi;
        line = data.match(re);
        if (line) {
            for (var i = 0; i < line.length; i++) {
                this._parseKerningEntry(line[i]);
            }
        }
    },
    _parseCharacterDefinition:function (line, characterDefinition) {
        //////////////////////////////////////////////////////////////////////////
        // line to parse:
        // char id=32   x=0     y=0     width=0     height=0     xoffset=0     yoffset=44    xadvance=14     page=0  chnl=0
        //////////////////////////////////////////////////////////////////////////
        // Character ID
        var value = /id=(\d+)/gi.exec(line)[1];
        characterDefinition.charID = value.toString();

        // Character x
        value = /x=([\-\d]+)/gi.exec(line)[1];
        characterDefinition.rect.origin.x = parseInt(value);

        // Character y
        value = /y=([\-\d]+)/gi.exec(line)[1];
        characterDefinition.rect.origin.y = parseInt(value);

        // Character width
        value = /width=([\-\d]+)/gi.exec(line)[1];
        characterDefinition.rect.size.width = parseInt(value);

        // Character height
        value = /height=([\-\d]+)/gi.exec(line)[1];
        characterDefinition.rect.size.height = parseInt(value);

        // Character xoffset
        value = /xoffset=([\-\d]+)/gi.exec(line)[1];
        characterDefinition.xOffset = parseInt(value);

        // Character yoffset
        value = /yoffset=([\-\d]+)/gi.exec(line)[1];
        characterDefinition.yOffset = parseInt(value);

        // Character xadvance
        value = /xadvance=([\-\d]+)/gi.exec(line)[1];
        characterDefinition.xAdvance = parseInt(value);

    },
    _parseInfoArguments:function (line) {
        //////////////////////////////////////////////////////////////////////////
        // possible lines to parse:
        // info face="Script" size=32 bold=0 italic=0 charset="" unicode=1 stretchH=100 smooth=1 aa=1 padding=1,4,3,2 spacing=0,0 outline=0
        // info face="Cracked" size=36 bold=0 italic=0 charset="" unicode=0 stretchH=100 smooth=1 aa=1 padding=0,0,0,0 spacing=1,1
        //////////////////////////////////////////////////////////////////////////

        // padding
        var tmpPadding = /padding=(\d+)[,](\d+)[,](\d+)[,](\d+)/gi.exec(line);
        this.padding.left = tmpPadding[1];
        this.padding.top = tmpPadding[2]
        this.padding.right = tmpPadding[3];
        this.padding.bottom = tmpPadding[4];
    },
    _parseCommonArguments:function (line) {
        //////////////////////////////////////////////////////////////////////////
        // line to parse:
        // common lineHeight=104 base=26 scaleW=1024 scaleH=512 pages=1 packed=0
        //////////////////////////////////////////////////////////////////////////

        var value;
        // Height
        this.commonHeight = /lineHeight=(\d+)/gi.exec(line)[1];

        // pages. sanity check
        value = /pages=(\d+)/gi.exec(line)[1];
        cc.Assert(parseInt(value) == 1, "cc.BitfontAtlas: only supports 1 page");

        // packed (ignore) What does this mean ??
    },
    _parseImageFileName:function (line, fntFile) {
        //////////////////////////////////////////////////////////////////////////
        // line to parse:
        // page id=0 file="bitmapFontTest.png"
        //////////////////////////////////////////////////////////////////////////
        var value;
        // page ID. Sanity check
        value = /id=(\d+)/gi.exec(line)[1];
        cc.Assert(parseInt(value) == 0, "LabelBMFont file could not be found");

        // file
        value = /file="([a-zA-Z0-9\-\._]+)/gi.exec(line)[1];

        this.atlasName = cc.FileUtils.fullPathFromRelativeFile(value, fntFile);
    },
    _parseKerningCapacity:function (line) {
    },
    _parseKerningEntry:function (line) {
        //////////////////////////////////////////////////////////////////////////
        // line to parse:
        // kerning first=121  second=44  amount=-7
        //////////////////////////////////////////////////////////////////////////
        // first
        var value = /first=([\-\d]+)/gi.exec(line)[1];
        var first = parseInt(value);

        // second
        value = /second=([\-\d]+)/gi.exec(line)[1];
        var second = parseInt(value);

        // amount
        value = /amount=([\-\d]+)/gi.exec(line)[1];
        var amount = parseInt(value);

        var element = new cc._KerningHashElement();
        element.amount = amount;
        element.key = (first << 16) | (second & 0xffff);

        this.kerningDictionary[element.key] = element;

    },
    _purgeKerningDictionary:function () {
        this.kerningDictionary = {};
    },
    _purgeFontDefDictionary:function () {
        this.fontDefDictionary = {};
    }
});

/**
 * Create a cc.BMFontConfiguration
 * @param {String} FNTfile
 * @return {cc.BMFontConfiguration|Null} returns the configuration or null if error
 * @example
 * // Example
 * var conf = cc.BMFontConfiguration.create('myfont.fnt');
 */
cc.BMFontConfiguration.create = function (FNTfile) {
    var ret = new cc.BMFontConfiguration();
    if (ret.initWithFNTfile(FNTfile)) {
        return ret;
    }
    return null;
};

/**
 * <p>cc.LabelBMFont is a subclass of cc.SpriteSheet.</p>

 <p>Features:<br/>
 <ul><li>- Treats each character like a cc.Sprite. This means that each individual character can be:</li>
 <li>- rotated</li>
 <li>- scaled</li>
 <li>- translated</li>
 <li>- tinted</li>
 <li>- chage the opacity</li>
 <li>- It can be used as part of a menu item.</li>
 <li>- anchorPoint can be used to align the "label"</li>
 <li>- Supports AngelCode text format</li></ul></p>

 <p>Limitations:<br/>
 - All inner characters are using an anchorPoint of (0.5, 0.5) and it is not recommend to change it
 because it might affect the rendering</p>

 <p>cc.LabelBMFont implements the protocol cc.LabelProtocol, like cc.Label and cc.LabelAtlas.<br/>
 cc.LabelBMFont has the flexibility of cc.Label, the speed of cc.LabelAtlas and all the features of cc.Sprite.<br/>
 If in doubt, use cc.LabelBMFont instead of cc.LabelAtlas / cc.Label.</p>

 <p>Supported editors:<br/>
 http://glyphdesigner.71squared.com/ (Commercial, Mac OS X)<br/>
 http://www.n4te.com/hiero/hiero.jnlp (Free, Java)<br/>
 http://slick.cokeandcode.com/demos/hiero.jnlp (Free, Java)<br/>
 http://www.angelcode.com/products/bmfont/ (Free, Windows only)</p>
 * @class
 * @extends cc.
 */
cc.LabelBMFont = cc.SpriteBatchNode.extend(/** @lends cc.LabelBMFont# */{
    _opacity:0,
    _color:null,
    _isOpacityModifyRGB:false,
    _string:"",
    _configuration:null,
    // name of fntFile
    _fntFile:"",
    // initial string without line breaks
    _initialString:"",
    // max width until a line break is added
    _width:0,
    _lineBreakWithoutSpaces:false,
    _imageOffset:cc.PointZero(),
    /**
     * Constructor
     */
    ctor:function () {
        this._super();
        //LabelBMFont - Debug draw
        if (cc.LABELBMFONT_DEBUG_DRAW) {
            this.draw();
            var s = this.getContentSize();
            var vertices = [cc.ccp(0, 0), cc.ccp(s.width, 0),
                cc.ccp(s.width, s.height), cc.ccp(0, s.height)];
            cc.drawPoly(vertices, 4, true);
        }

    },

    /**
     * conforms to cc.RGBAProtocol protocol
     * @return {Number}
     */
    getOpacity:function () {
        return this._opacity;
    },

    /**
     * set the opacity of this label
     * @param {Number} Var
     */
    setOpacity:function (Var) {
        this._opacity = Var;
        if (this._children) {
            for (var i = 0, len = this._children.length; i < len; i++) {
                var node = this._children[i];
                if (node) {
                    node.setOpacity(this._opacity);
                }
            }
        }
    },
    /**
     *
     */
    isOpacityModifyRGB:function () {

    },
    /**
     *
     */
    setOpacityModifyRGB:function (isOpacityModifyRGB) {

    },
    /**
     * conforms to cc.RGBAProtocol protocol
     * @return {cc.Color3B}
     */
    getColor:function () {
        return this._color;
    },

    /**
     * tint this label
     * @param {cc.Color3B} Var
     */
    setColor:function (color3) {
        if ((this._color.r == color3.r) && (this._color.g == color3.g) && (this._color.b == color3.b)) {
            return;
        }
        this._color = color3;
        if (this.getTexture()) {
            if (cc.renderContextType == cc.CANVAS) {
                var cacheTextureForColor = cc.TextureCache.sharedTextureCache().getTextureColors(this._originalTexture);
                if (cacheTextureForColor) {
                    //generate color texture cache
                    var tx = this.getTexture();
                    var textureRect = new cc.Rect(0, 0, tx.width, tx.height);
                    var colorTexture = cc.generateTintImage(tx, cacheTextureForColor, this._color, textureRect);
                    var img = new Image();
                    img.src = colorTexture.toDataURL();
                    this.setTexture(img);
                }
            }
        }
    },

    /**
     * conforms to cc.RGBAProtocol protocol
     * @return {Boolean}
     */
    isOpacityModifyRGB:function () {
        return this._isOpacityModifyRGB;
    },

    /**
     *
     * @param {Boolean} Var
     */
    setOpacityModifyRGB:function (Var) {
        this._isOpacityModifyRGB = Var;
        if (this._children && this._children.length != 0) {
            for (var i = 0, len = this._children.length; i < len; i++) {
                var node = this._children[i];
                if (node) {
                    var pRGBAProtocol = node instanceof cc.RGBAProtocol;
                    if (pRGBAProtocol) {
                        pRGBAProtocol.setOpacityModifyRGB(this._isOpacityModifyRGB);
                    }
                }
            }
        }
    },

    init:function () {

    },
    /**
     * init a bitmap font altas with an initial string and the FNT file
     * @param {String} theString
     * @param {String} fntFile
     * @return {Boolean}
     */
    initWithString:function (arg) {
        var theString = arg[0],
            fntFile = arg[1],
            width = arg[2],
            alignment = arg[3],
            imageOffset = arg[4];

        this._configuration = cc.FNTConfigLoadFile(fntFile);
        cc.Assert(this._configuration, "re-init is no longer supported");
        cc.Assert((theString && fntFile) || (theString == null && fntFile == null), "Invalid params for cc.LabelBMFont");

        var texture;
        if (fntFile) {
            var newConf = cc.FNTConfigLoadFile(fntFile);
            cc.Assert(newConf, "cc.LabelBMFont: Impossible to create font. Please check file");
            this._configuration = newConf;
            this._fntFile = fntFile;
            texture = cc.TextureCache.sharedTextureCache().addImage(this._configuration.getAtlasName());
        }
        else {
            texture = new cc.Texture2D();
        }

        if (theString == null) {
            theString = "";
        }

        if (this.initWithTexture(texture, theString.length)) {
            this._alignment = alignment;
            this._imageOffset = imageOffset;
            this._width = width;
            this._opacity = 255;
            this._color = cc.WHITE();
            this._contentSize = cc.SizeZero();
            this.setString(theString);
            this.setAnchorPoint(cc.ccp(0.5, 0.5));
            return true;
        }
        return false;
    },

    /**
     * updates the font chars based on the string to render
     */
    createFontChars:function () {
        var nextFontPositionX = 0;
        var nextFontPositionY = 0;
        var prev = -1;
        var kerningAmount = 0;

        var tmpSize = cc.SizeZero();

        var longestLine = 0;
        var totalHeight = 0;

        var quantityOfLines = 1;

        var stringLen = this._string.length;

        if (stringLen == 0) {
            return;
        }

        for (var i = 0; i < stringLen; i++) {
            var c = this._string.charCodeAt(i);
            if (c == 10) {
                quantityOfLines++;
            }
        }

        totalHeight = this._configuration.commonHeight * quantityOfLines;
        nextFontPositionY = -(this._configuration.commonHeight - this._configuration.commonHeight * quantityOfLines);

        for (var i = 0; i < stringLen; i++) {
            var c = this._string.charCodeAt(i);

            if (c == 10) {
                nextFontPositionX = 0;
                nextFontPositionY -= this._configuration.commonHeight;
                continue;
            }


            //kerningAmount = this._kerningAmountForFirst(prev, c);

            var key = c;
            var element = this._configuration.fontDefDictionary[key];
            cc.Assert(element, "FontDefinition could not be found!");

            var fontDef = element.fontDef;

            //var fontDef = this._configuration.bitmapFontArray[c];

            var rect = fontDef.rect;

            rect = cc.RECT_PIXELS_TO_POINTS(rect);

            rect.origin.x += this._imageOffset.x;
            rect.origin.y += this._imageOffset.y;

            var fontChar = this.getChildByTag(i);
            if (!fontChar) {
                fontChar = new cc.Sprite();
                if (c == 32) {
                    fontChar.init();
                    fontChar.setTextureRect(rect);
                }
                else {
                    fontChar.initWithTexture(this, rect);
                }
                this.addChild(fontChar, 0, i);
            }
            else {
                if (c == 32) {
                    fontChar.init();
                    fontChar.setTextureRect(cc.RectMake(0, 0, 0, 0));
                }
                else {
                    // reusing fonts
                    fontChar.initWithTexture(this, rect);
                    // restore to default in case they were modified
                    fontChar.setVisible(true);
                    fontChar.setOpacity(255);
                }
            }

            /*var yOffset = this._configuration.commonHeight - fontDef.yOffset;
             fontChar.setPositionInPixels(cc.ccp(nextFontPositionX + fontDef.xOffset + fontDef.rect.size.width / 2.0 + kerningAmount,
             nextFontPositionY + yOffset - rect.size.height / 2.0));*/

            var yOffset = this._configuration.commonHeight - fontDef.yOffset;
            var fontPos = cc.ccp(nextFontPositionX + fontDef.xOffset + fontDef.rect.size.width * 0.5 + kerningAmount,
                nextFontPositionY + yOffset - rect.size.height * 0.5 * cc.CONTENT_SCALE_FACTOR());
            fontChar.setPosition(cc.POINT_PIXELS_TO_POINTS(fontPos));

            // update kerning
            nextFontPositionX += this._configuration.bitmapFontArray[c].xAdvance + kerningAmount;
            prev = c;

            // Apply label properties
            fontChar.setOpacityModifyRGB(this._isOpacityModifyRGB);
            // Color MUST be set before opacity, since opacity might change color if OpacityModifyRGB is on
            //fontChar.setColor(this._color);

            // only apply opacity if it is different than 255 )
            // to prevent modifying the color too (issue #610)
            if (this._opacity != 255) {
                fontChar.setOpacity(this._opacity);
            }

            if (longestLine < nextFontPositionX) {
                longestLine = nextFontPositionX;
            }
        }

        tmpSize.width = longestLine;
        tmpSize.height = totalHeight;
        this.setContentSize(cc.SIZE_PIXELS_TO_POINTS(tmpSize));
    },
    updateString:function (fromUpdate) {
        if (this._children) {
            for (var i = 0; i < this._children.length; i++) {
                var node = this._children[i];
                if (node) {
                    node.setVisible(false);
                }
            }
        }
        this.createFontChars();

        if (!fromUpdate) {
            this.updateLabel();
        }
    },
    /**
     * get the text of this label
     * @return {String}
     */
    getString:function () {
        return this._initialString;
    },

    /**
     * set the text
     * @param newString
     */
    setString:function (newString, fromUpdate) {
        fromUpdate = (fromUpdate != null);
        this._initialString = newString;
        this.updateString(fromUpdate);

        /*this._string = newString;

         if (this._children) {
         for (var i = 0; i < this._children.length; i++) {
         var node = this._children[i];
         if (node) {
         node.setIsVisible(false);
         }
         }
         }
         this.createFontChars();*/
    },

    /**
     * @deprecated
     * @param label
     */
    setCString:function (label) {
        this.setString(label);
    },
    updateLabel:function () {
        this.setString(this._initialString, true);

        if (this._width > 0) {
            // Step 1: Make multiline
            var stringLength = this._string.size();
            var multiline_string;
            multiline_string.reserve(stringLength);
            var last_word;
            last_word.reserve(stringLength);

            var line = 1, i = 0;
            var start_line = false, start_word = false;
            var startOfLine = -1, startOfWord = -1;
            var skip = 0;

            for (var j = 0; j < this._children.length; j++) {
                var characterSprite;

                while (!(characterSprite = this.getChildByTag(j + skip)))
                    skip++;
                //todo fixed
                if (!characterSprite.isVisible()) continue;

                if (i >= stringLength)
                    break;

                var character = str_whole[i];

                if (!start_word) {
                    startOfWord = this._getLetterPosXLeft(characterSprite);
                    start_word = true;
                }
                if (!start_line) {
                    startOfLine = startOfWord;
                    start_line = true;
                }

                // Newline.
                if (character == '\n') {
                    last_word.push_back('\n');
                    multiline_string.insert(multiline_string.end(), last_word.begin(), last_word.end());
                    last_word.clear();
                    start_word = false;
                    start_line = false;
                    startOfWord = -1;
                    startOfLine = -1;
                    i++;
                    line++;

                    if (i >= stringLength)
                        break;

                    character = str_whole[i];

                    if (!startOfWord) {
                        startOfWord = this._getLetterPosXLeft(characterSprite);
                        start_word = true;
                    }
                    if (!startOfLine) {
                        startOfLine = startOfWord;
                        start_line = true;
                    }
                }

                // Whitespace.
                if (isspace_unicode(character)) {
                    last_word.push_back(character);
                    multiline_string.insert(multiline_string.end(), last_word.begin(), last_word.end());
                    last_word.clear();
                    start_word = false;
                    startOfWord = -1;
                    i++;
                    continue;
                }

                // Out of bounds.
                if (this._getLetterPosXRight(characterSprite) - startOfLine > this._width) {
                    if (!m_bLineBreakWithoutSpaces) {
                        last_word.push_back(character);

                        var found = cc_utf8_find_last_not_char(multiline_string, ' ');
                        if (found != -1)
                            cc_utf8_trim_ws(multiline_string);
                        else
                            multiline_string.clear();

                        if (multiline_string.size() > 0)
                            multiline_string.push_back('\n');

                        line++;
                        start_line = false;
                        startOfLine = -1;
                        i++;
                    }
                    else {
                        cc_utf8_trim_ws(last_word);

                        last_word.push_back('\n');
                        multiline_string.insert(multiline_string.end(), last_word.begin(), last_word.end());
                        last_word.clear();
                        start_word = false;
                        start_line = false;
                        startOfWord = -1;
                        startOfLine = -1;
                        line++;

                        if (i >= stringLength)
                            break;

                        if (!startOfWord) {
                            startOfWord = this._getLetterPosXLeft(characterSprite);
                            start_word = true;
                        }
                        if (!startOfLine) {
                            startOfLine = startOfWord;
                            start_line = true;
                        }

                        j--;
                    }

                    continue;
                }
                else {
                    // Character is normal.
                    last_word.push_back(character);
                    i++;
                    continue;
                }
            }

            multiline_string.insert(multiline_string.end(), last_word.begin(), last_word.end());

            var size = multiline_string.size();
            var str_new = new [size + 1];

            for (var i = 0; i < size; ++i) {
                str_new[i] = multiline_string[i];
            }

            str_new[size] = 0;

            this._string = str_new;
            this.updateString(true);
        }

        // Step 2: Make alignment
        if (this.alignment != cc.TEXT_ALIGNMENT_LEFT) {
            var i = 0;

            var lineNumber = 0;
            var strlen = cc_wcslen(this._string);
            var last_line;
            for (var ctr = 0; ctr <= strlen; ++ctr) {
                if (this._string[ctr] == '\n' || this._string[ctr] == 0) {
                    var lineWidth = 0.0;
                    var line_length = last_line.size();
                    var index = i + line_length - 1 + lineNumber;
                    if (index < 0) continue;

                    var lastChar = this.getChildByTag(index);
                    if (lastChar == null)
                        continue;

                    lineWidth = lastChar.getPosition().x + lastChar.getContentSize().width / 2;

                    var shift = 0;
                    switch (this._alignment) {
                        case cc.TEXT_ALIGNMENT_CENTER:
                            shift = this.getContentSize().width / 2 - lineWidth / 2;
                            break;
                        case cc.TEXT_ALIGNMENT_RIGHT:
                            shift = this.getContentSize().width - lineWidth;
                            break;
                        default:
                            break;
                    }

                    if (shift != 0) {
                        for (var j = 0; j < line_length; j++) {
                            index = i + j + lineNumber;
                            if (index < 0) continue;

                            var characterSprite = this.getChildByTag(index);
                            characterSprite.setPosition(cc.ccpAdd(characterSprite.getPosition(), cc.ccp(shift, 0.0)));
                        }
                    }

                    i += line_length;
                    lineNumber++;

                    last_line.clear();
                    continue;
                }

                last_line.push_back(this._string[ctr]);
            }
        }
    },
    setAlignment:function (alignment) {
        this._alignment = alignment;
        this.updateLabel();
    },
    setWidth:function (width) {
        this._width = width;
        this.updateLabel();
    },
    setLineBreakWithoutSpace:function (breakWithoutSpace) {
        this.lineBreakWithoutSpaces = breakWithoutSpace;
        this.updateLabel();
    },
    setScale:function (scale) {
        this._super(scale);
        this.updateLabel();
    },
    setScaleX:function (scaleX) {
        this._super(scaleX);
        this.updateLabel();
    },
    setScaleY:function (scaleY) {
        this._super(scaleY);
        this.updateLabel();
    },
    setFntFile:function (fntFile) {
        if (fntFile != null && strcmp(fntFile, m_sFntFile.c_str()) != 0) {
            var newConf = cc.FNTConfigLoadFile(fntFile);

            cc.Assert(newConf, "cc.LabelBMFont: Impossible to create font. Please check file");

            this._fntFile = fntFile;
            this._configuration = newConf;

            this.setTexture(cc.TextureCache.sharedTextureCache().addImage(this._configuration.getAtlasName()));
            this.createFontChars();
        }
    },
    /**
     * @return {String}
     */
    getFntFile:function () {
        return this._fntFile;
    },
    /**
     * set the anchorpoint of the label
     * @param {cc.Point} point
     */
    setAnchorPoint:function (point) {
        if (!cc.Point.CCPointEqualToPoint(point, this._anchorPoint)) {
            this._super(point);
            this.createFontChars();
            //todo
        }
    },

    _atlasNameFromFntFile:function (fntFile) {
    },
    _kerningAmountForFirst:function (first, second) {
        var ret = 0;
        var key = (first << 16) | (second & 0xffff);
        if (this._configuration.kerningDictionary) {
            var element = this._configuration.kerningDictionary[key.toString()];
            if (element) {
                ret = element.amount;
            }
        }
        return ret;
    },
    _getLetterPosXLeft:function (sp) {
        return sp.getPosition().x * this._scaleX + (sp.getContentSize().width * this._scaleX * sp.getAnchorPoint().x);
    },
    _getLetterPosXRight:function (sp) {
        return sp.getPosition().x * this._scaleX - (sp.getContentSize().width * this._scaleX * sp.getAnchorPoint().x);
    }

});

/**
 * creates a bitmap font altas with an initial string and the FNT file
 * @param {String} str
 * @param {String} fntFile
 * @return {cc.LabelBMFont}
 * @example
 * // Example
 * var label = cc.LabelBMFont.create('label text', 'fontfile.fnt')
 */
cc.LabelBMFont.create = function () {
    var ret = new cc.LabelBMFont();
    if (ret && ret.initWithString(arguments)) {
        return ret;
    }
    return null;
};

/**
 * shared instance of configuration
 * @type cc.BMFontConfiguration
 */
cc.configurations = null;

/**
 * Load the .fnt file
 * @param {String} fntFile
 * @return {cc.BMFontConfiguration}
 * Constructor
 */
cc.FNTConfigLoadFile = function (fntFile) {
    if (!cc.configurations) {
        cc.configurations = {};
    }
    var ret = cc.configurations[fntFile];
    if (!ret) {
        ret = cc.BMFontConfiguration.create(fntFile);
    }
    return ret;
};

/**
 * Purges the cached .fnt data
 */
cc.purgeCachedData = function () {
    cc.FNTConfigRemoveCache();
};

/**
 * Purges the FNT config cache
 */
cc.FNTConfigRemoveCache = function () {
    if (cc.configurations) {
        cc.configurations = {};
    }
};