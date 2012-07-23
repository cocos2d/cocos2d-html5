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
/**
 * @constant
 * @type Number
 */
cc.LabelAutomaticWidth = -1;

cc._KerningHashElement = function (key, amount) {
    this.key = key;   //key for the hash. 16-bit for 1st element, 16-bit for 2nd element
    this.amount = amount;
};

cc._FontDefHashElement = function (key, fontDef) {
    this.key = key || 0;        // key. Font Unicode value
    this.fontDef = fontDef || new cc._BMFontDef();    // font definition
};

cc._BMFontDef = function (charID, rect, xOffset, yOffset, xAdvance) {
    //! ID of the character
    this.charID = charID || 0;
    //! origin and size of the font
    this.rect = rect || cc.RectMake(0, 0, 10, 10);
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

    /**
     * values for FontDef
     * @type cc._FontDefHashElement
     */
    fontDefDictionary:{
        "0":{
            "key":"0",
            "fontDef":{
                "charID":"0",
                "rect":{
                    "origin":{
                        "x":0,
                        "y":0
                    },
                    "size":{
                        "width":1,
                        "height":1
                    }
                },
                "xOffset":0,
                "yOffset":0,
                "xAdvance":0}
        }
    },

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
                var element = new cc._FontDefHashElement();
                this._parseCharacterDefinition(line[i], element.fontDef);
                element.key = element.fontDef.charID;
                this.fontDefDictionary[element.key] = element;
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
        this.commonHeight = parseInt(/lineHeight=(\d+)/gi.exec(line)[1]);

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

        this.atlasName = cc.FileUtils.getInstance().fullPathFromRelativeFile(value, fntFile);
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
        this.fontDefDictionary = {
            "0":{
                "key":"0",
                "fontDef":{
                    "charID":"0",
                    "rect":{
                        "origin":{
                            "x":0,
                            "y":0
                        },
                        "size":{
                            "width":1,
                            "height":1
                        }
                    },
                    "xOffset":0,
                    "yOffset":0,
                    "xAdvance":0}
            }
        };
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
 * @extends cc.
 */
cc.LabelBMFont = cc.SpriteBatchNode.extend(/** @lends cc.LabelBMFont# */{
    _opacity:0,
    _color:null,
    _opacityModifyRGB:false,
    _string:"",
    _configuration:null,
    // name of fntFile
    _fntFile:"",
    // initial string without line breaks
    _initialString:"",
    // alignment of all lines
    _alignment:null,
    // max width until a line break is added
    _width:0,
    _lineBreakWithoutSpaces:false,
    _imageOffset:cc.PointZero(),
    /**
     * Constructor
     */
/*    ctor:function () {
        this._super();
    },*/
    /**
     * @param {CanvasContext} ctx
     */
    draw:function (ctx) {
        this._super();
        var context = ctx || cc.renderContext;
        //LabelBMFont - Debug draw
        if (cc.LABELBMFONT_DEBUG_DRAW) {
            var s = this.getContentSize();
            var pos = cc.p(0 | ( -this._anchorPointInPoints.x), 0 | ( -this._anchorPointInPoints.y));
            var vertices = [cc.p(pos.x, pos.y), cc.p(pos.x + s.width, pos.y), cc.p(pos.x + s.width, pos.y + s.height), cc.p(pos.x, pos.y + s.height)];
            context.strokeStyle = "rgba(0,255,0,1)";
            cc.drawingUtil.drawPoly(vertices, 4, true);
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
                var cacheTextureForColor = cc.TextureCache.getInstance().getTextureColors(this._originalTexture);
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
        return this._opacityModifyRGB;
    },

    /**
     * @param {Boolean} Var
     */
    setOpacityModifyRGB:function (Var) {
        this._opacityModifyRGB = Var;
        if (this._children && this._children.length != 0) {
            for (var i = 0, len = this._children.length; i < len; i++) {
                var node = this._children[i];
                if (node) {
                    if (node.RGBAProtocol) {
                        node.setOpacity(255);
                    }
                }
            }
        }
    },

    /**
     *  init LabelBMFont
     */
    init:function () {
        this.initWithString(null, null, null, null, null);
    },

    /**
     * init a bitmap font altas with an initial string and the FNT file
     * @param {String} str
     * @param {String} fntFile
     * @param {String} width
     * @param {Number} alignment
     * @param {Number} imageOffset
     * @return {Boolean}
     */
    initWithString:function (str, fntFile, width, alignment, imageOffset) {
        var theString = str;

        cc.Assert(!this._configuration, "re-init is no longer supported");

        var texture;
        if (fntFile) {
            var newConf = cc.FNTConfigLoadFile(fntFile);
            cc.Assert(newConf, "cc.LabelBMFont: Impossible to create font. Please check file");
            this._configuration = newConf;
            this._fntFile = fntFile;
            texture = cc.TextureCache.getInstance().addImage(this._configuration.getAtlasName());
        }
        else {
            texture = new Image();
        }

        if (theString == null) {
            theString = "";
        }

        if (this.initWithTexture(texture, theString.length)) {
            this._alignment = alignment || cc.TEXT_ALIGNMENT_LEFT;
            this._imageOffset = imageOffset || cc.PointZero();
            this._width = width || cc.LabelAutomaticWidth;
            this._opacity = 255;
            this._color = cc.WHITE();
            this._contentSize = cc.SizeZero();
            this.setString(theString);
            this.setAnchorPoint(cc.p(0.5, 0.5));
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

            var key = c;

            var element = this._configuration.fontDefDictionary[key];
            cc.Assert(element, "FontDefinition could not be found!");

            var fontDef = element.fontDef;

            var rect = cc.RectMake(fontDef.rect.origin.x, fontDef.rect.origin.y, fontDef.rect.size.width, fontDef.rect.size.height);
            rect = cc.RECT_PIXELS_TO_POINTS(rect);
            rect.origin.x += this._imageOffset.x;
            rect.origin.y += this._imageOffset.y;

            var fontChar = this.getChildByTag(i);
            if (!fontChar) {
                fontChar = new cc.Sprite();
                if (c == 32) {
                    fontChar.init();
                    fontChar.setTextureRect(cc.RectZero(), false, cc.SizeZero());
                }
                else {
                    fontChar.initWithTexture(this._textureAtlas.getTexture(), rect, false);
                }
                this.addChild(fontChar, 0, i);
            }
            else {
                if (c == 32) {
                    fontChar.init();
                    fontChar.setTextureRect(cc.RectZero(), false, cc.SizeZero());
                }
                else {
                    // reusing fonts
                    fontChar.initWithTexture(this._textureAtlas.getTexture(), rect, false);
                    // restore to default in case they were modified
                    fontChar.setVisible(true);
                    fontChar.setOpacity(255);
                }
            }

            var yOffset = this._configuration.commonHeight - fontDef.yOffset;
            var fontPos = cc.p(nextFontPositionX + fontDef.xOffset + fontDef.rect.size.width * 0.5 + kerningAmount,
                nextFontPositionY + yOffset - rect.size.height * 0.5 * cc.CONTENT_SCALE_FACTOR());
            fontChar.setPosition(cc.POINT_PIXELS_TO_POINTS(fontPos));

            // update kerning
            nextFontPositionX += fontDef.xAdvance + kerningAmount;
            prev = c;

            // Apply label properties
            fontChar.setOpacityModifyRGB(this._opacityModifyRGB);

            // only apply opacity if it is different than 255 )
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

    /**
     * update String
     * @param {Boolean} fromUpdate
     */
    updateString:function (fromUpdate) {
        if (this._children) {
            for (var i = 0; i < this._children.length; i++) {
                var node = this._children[i];
                if (node) {
                    node.setVisible(false);
                }
            }
        }
        if (this._configuration) {
            this.createFontChars();
        }
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
        if (this._string != newString) {
            this._string = newString + String.fromCharCode(0);
            //  if(this._initialString == ""){
            this._initialString = newString + String.fromCharCode(0);
            //}
            this.updateString(fromUpdate);
        }
    },

    /**
     * @deprecated
     * @param label
     */
    setCString:function (label) {
        this.setString(label);
    },

    /**
     *  update Label
     */
    updateLabel:function () {
        if (this._width > 0) {
            this.setString(this._initialString, true);

            // Step 1: Make multiline
            var stringLength = this._string.length;
            var multiline_string = [];
            var last_word = [];

            var line = 1, i = 0, start_line = false, start_word = false, startOfLine = -1, startOfWord = -1, skip = 0;

            var characterSprite;
            for (var j = 0; j < this._children.length; j++) {
                while (!(characterSprite = this.getChildByTag(j + skip)))
                    skip++;

                if (!characterSprite.isVisible()) continue;
                if (i >= stringLength)
                    break;

                var character = this._string[i];

                if (!start_word) {
                    startOfWord = this._getLetterPosXLeft(characterSprite);
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
                    i++;
                    line++;

                    if (i >= stringLength)
                        break;

                    character = this._string[i];

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
                if (character.charCodeAt(0) == 32) {
                    last_word.push(character);
                    multiline_string = multiline_string.concat(last_word);
                    last_word.length = 0;
                    start_word = false;
                    startOfWord = -1;
                    i++;
                    continue;
                }

                // Out of bounds.
                if (this._getLetterPosXRight(characterSprite) - startOfLine > this._width) {
                    if (!this._lineBreakWithoutSpaces) {
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
                    }
                    else {
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
                    last_word.push(character);
                    i++;
                    continue;
                }
            }

            multiline_string = multiline_string.concat(last_word);
            var len = multiline_string.length;
            var str_new = "";

            for (var i = 0; i < len; ++i) {
                str_new += multiline_string[i];
            }

            this._string = str_new + String.fromCharCode(0);
            console.log(this._string)
            this.updateString(true);
        }

        // Step 2: Make alignment
        if (this._alignment != cc.TEXT_ALIGNMENT_LEFT) {
            var i = 0;

            var lineNumber = 0;
            var strlen = this._string.length;
            var last_line = [];

            for (var ctr = 0; ctr < strlen; ctr++) {
                if (this._string[ctr].charCodeAt(0) == 10 || this._string[ctr].charCodeAt(0) == 0) {
                    var lineWidth = 0;
                    var line_length = last_line.length;
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
                            characterSprite.setPosition(cc.pAdd(characterSprite.getPosition(), cc.p(shift, 0)));
                        }
                    }

                    i += line_length;
                    lineNumber++;

                    last_line.length = 0;
                    continue;
                }

                last_line.push(this._string[i]);
            }
        }
    },

    /**
     * Set text vertical alignment
     * @param {Number} alignment
     */
    setAlignment:function (alignment) {
        this._alignment = alignment;
        this.updateLabel();
    },

    /**
     * @param {Number} width
     */
    setWidth:function (width) {
        this._width = width;
        this.updateLabel();
    },

    /**
     * @param {Boolean}  breakWithoutSpace
     */
    setLineBreakWithoutSpace:function (breakWithoutSpace) {
        this._lineBreakWithoutSpaces = breakWithoutSpace;
        this.updateLabel();
    },

    /**
     * @param {Number} scale
     */
    setScale:function (scale,scaleY) {
        this._super(scale,scaleY);
        this.updateLabel();
    },

    /**
     * @param {Number} scaleX
     */
    setScaleX:function (scaleX) {
        this._super(scaleX);
        this.updateLabel();
    },

    /**
     * @param {Number} scaleY
     */
    setScaleY:function (scaleY) {
        this._super(scaleY);
        this.updateLabel();
    },
    /**
     * set fnt file path
     * @param {String} fntFile
     */
    setFntFile:function (fntFile) {
        if (fntFile != null && fntFile != this._fntFile) {
            var newConf = cc.FNTConfigLoadFile(fntFile);

            cc.Assert(newConf, "cc.LabelBMFont: Impossible to create font. Please check file");

            this._fntFile = fntFile;
            this._configuration = newConf;

            this.setTexture(cc.TextureCache.getInstance().addImage(this._configuration.getAtlasName()));
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
            this.updateLabel();
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
 * @param {String} width
 * @param {Number} alignment
 * @param {Number} imageOffset
 * @return {cc.LabelBMFont|Null}
 * @example
 * // Example 01
 * var label1 = cc.LabelBMFont.create("Test case", "test.fnt");
 *
 * // Example 02
 * var label2 = cc.LabelBMFont.create("test case", "test.fnt", 200, cc.TEXT_ALIGNMENT_LEFT);
 *
 * // Example 03
 * var label3 = cc.LabelBMFont.create("This is a \n test case", "test.fnt", 200, cc.TEXT_ALIGNMENT_LEFT, cc.PointZero());
 */
cc.LabelBMFont.create = function (str, fntFile, width, alignment, imageOffset) {
    var ret = new cc.LabelBMFont();
    if (ret && ret.initWithString(str, fntFile, width, alignment, imageOffset)) {
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

/**
 * @param {String} ch
 * @return {Boolean}  weather the character is a whitespace character.
 */
cc.isspace_unicode = function (ch) {
    ch = ch.charCodeAt(0);
    return  ((ch >= 9 && ch <= 13) || ch == 32 || ch == 133 || ch == 160 || ch == 5760
        || (ch >= 8192 && ch <= 8202) || ch == 8232 || ch == 8233 || ch == 8239
        || ch == 8287 || ch == 12288)
}

/**
 * @param {String} str
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
}

/**
 * Trims str st str=[0, index) after the operation.
 * Return value: the trimmed string.
 * @param {String} str  he string to trim
 * @param {Number} index  the index to start trimming from.
 */
cc.utf8_trim_from = function (str, index) {
    var len = str.length;
    if (index >= len || index < 0)
        return;
    str.splice(index, len);
}
