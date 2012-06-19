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

cc._KerningHashElement = function(key, amount) {
    this.key = key;	// key for the hash. 16-bit for 1st element, 16-bit for 2nd element
    this.amount = amount;
};


cc._BMFontDef = function(charID, rect, xOffset, yOffset, xAdvance) {
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

cc._BMFontPadding = function(left, top, right, bottom) {
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
     * Description of BMFontConfiguration
     * @return {String}
     */
    description:function () {
        var ret = "<cc.BMFontConfiguration | Kernings:" + this.kerningDictionary + " | Image = " + this.atlasName.toString() + ">";
        return ret;
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
        if(re.test(data)){
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
        if ((this._color.r == color3.r)&&(this._color.g == color3.g)&&(this._color.b == color3.b)) {
            return;
        }
        this._color = color3;
        if (this.getTexture()) {
            if (cc.renderContextType == cc.CANVAS) {
                var cacheTextureForColor = cc.TextureCache.sharedTextureCache().getTextureColors(this._originalTexture);
                if (cacheTextureForColor) {
                    //generate color texture cache
                    var tx = this.getTexture();
                    var textureRect = new cc.Rect(0,0,tx.width,tx.height);
                    var colorTexture = cc.generateTintImage(tx, cacheTextureForColor, this._color,textureRect);
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
    getIsOpacityModifyRGB:function () {
        return this._isOpacityModifyRGB;
    },

    /**
     *
     * @param {Boolean} Var
     */
    setIsOpacityModifyRGB:function (Var) {
        this._isOpacityModifyRGB = Var;
        if (this._children && this._children.length != 0) {
            for (var i = 0, len = this._children.length; i < len; i++) {
                var node = this._children[i];
                if (node) {
                    var pRGBAProtocol = node instanceof cc.RGBAProtocol;
                    if (pRGBAProtocol) {
                        pRGBAProtocol.setIsOpacityModifyRGB(this._isOpacityModifyRGB);
                    }
                }
            }
        }
    },


    /**
     * init a bitmap font altas with an initial string and the FNT file
      * @param {String} theString
     * @param {String} fntFile
     * @return {Boolean}
     */
    initWithString:function (theString, fntFile) {
        cc.Assert(theString != null, "");
        this._configuration = cc.FNTConfigLoadFile(fntFile);

        cc.Assert(this._configuration, "Error creating config for LabelBMFont");
        if (this.initWithFile(this._configuration.atlasName, theString.length)) {
            this._opacity = 255;
            this._color = cc.WHITE();
            this._contentSize = cc.SizeZero();
            this.setAnchorPoint(cc.ccp(0.5, 0.5));
            this.setString(theString);
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

            kerningAmount = this._kerningAmountForFirst(prev, c);

            var fontDef = this._configuration.bitmapFontArray[c];

            var rect = fontDef.rect;

            var fontChar = this.getChildByTag(i);
            if (!fontChar) {
                fontChar = new cc.Sprite();
                if (c == 32) {
                    fontChar.init();
                    fontChar.setTextureRect(rect);
                }
                else {
                    fontChar.initWithBatchNodeRectInPixels(this, rect);
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
                    fontChar.initWithBatchNodeRectInPixels(this, rect);
                    // restore to default in case they were modified
                    fontChar.setIsVisible(true);
                    fontChar.setOpacity(255);
                }
            }

            var yOffset = this._configuration.commonHeight - fontDef.yOffset;
            fontChar.setPositionInPixels(cc.ccp(nextFontPositionX + fontDef.xOffset + fontDef.rect.size.width / 2.0 + kerningAmount,
                nextFontPositionY + yOffset - rect.size.height / 2.0));

            // update kerning
            nextFontPositionX += this._configuration.bitmapFontArray[c].xAdvance + kerningAmount;
            prev = c;

            // Apply label properties
            fontChar.setIsOpacityModifyRGB(this._isOpacityModifyRGB);
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
        this.setContentSizeInPixels(tmpSize);
    },

    /**
     * get the text of this label
     * @return {String}
     */
    getString:function () {
        return this._string;
    },

    /**
     * set the text
     * @param newString
     */
    setString:function (newString) {
        this._string = newString;

        if (this._children) {
            for (var i = 0; i < this._children.length; i++) {
                var node = this._children[i];
                if (node) {
                    node.setIsVisible(false);
                }
            }
        }
        this.createFontChars();
    },

    /**
     * @deprecated
     * @param label
     */
    setCString:function (label) {
        this.setString(label);
    },

    /**
     * set the anchorpoint of the label
     * @param {cc.Point} point
     */
    setAnchorPoint:function (point) {
        if (!cc.Point.CCPointEqualToPoint(point, this._anchorPoint)) {
            this._super(point);
            this.createFontChars();
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
cc.LabelBMFont.create = function (str, fntFile) {
    var ret = new cc.LabelBMFont();
    if (ret && ret.initWithString(str, fntFile)) {
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