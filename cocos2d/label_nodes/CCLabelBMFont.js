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
//
//Hash Element
//
// Equal function for targetSet.
function _KerningHashElement(key,amount,hh){
    this.key = key;	// key for the hash. 16-bit for 1st element, 16-bit for 2nd element
    this.amount = amount;
    this.hh = hh;
}

/**
 @struct cc.BMFontDef
 BMFont definition
 */
function _BMFontDef(charID, rect, xOffset, yOffset, xAdvance) {
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
}

/** @struct cc.BMFontPadding
 BMFont padding
 @since v0.8.2
 */
function _BMFontPadding(left, top, right, bottom) {
    /// padding left
    this.left = left || 0;
    /// padding top
    this.top = top || 0;
    /// padding right
    this.right = right || 0;
    /// padding bottom
    this.bottom = bottom || 0;
}


// how many characters are supported
cc.kCCBMFontMaxChars = 2048; //256,

/** @brief cc.BMFontConfiguration has parsed configuration of the the .fnt file
 @since v0.8
 */
cc.BMFontConfiguration = cc.Class.extend({
    // XXX: Creating a public interface so that the bitmapFontArray[] is acc.esible
    //@public
    //! The characters building up the font
    m_pBitmapFontArray:[],
    //! FNTConfig: Common Height
    m_uCommonHeight:0,
    //! Padding
    m_tPadding:null,
    //! atlas name
    m_sAtlasName:null,
    //! values for kerning
    m_pKerningDictionary:null,

    description:function () {
        var ret = "<cc.BMFontConfiguration | Kernings:"+this.m_pKerningDictionary + " | Image = "+this.m_sAtlasName.toString()+">";
        return ret;
    },
    /** allocates a cc.BMFontConfiguration with a FNT file */

    /** initializes a BitmapFontConfiguration with a FNT file */
    initWithFNTfile:function (FNTfile) {
        cc.Assert(FNTfile != null && FNTfile.length !=0, "");
        this.m_pKerningDictionary = null;
        this.parseConfigFile(FNTfile);
        return true;
    },

    parseConfigFile:function (controlFile) {
        var fullpath = cc.FileUtils.fullPathFromRelativePath(controlFile);

        var data = cc.FileData(fullpath.toString(), "rb");
        var nBufSize = data.getSize();
        var pBuffer = data.getBuffer();

        cc.Assert(pBuffer, "cc.BMFontConfiguration.parseConfigFile | Open file error.");

        if (!pBuffer)
        {
            return;
        }

        // parse spacing / padding
        var line;
        //var strLeft  (pBuffer, nBufSize);
        var strLeft  = pBuffer;
        while (strLeft.length > 0)
        {
            var pos = strLeft.indexOf('\n');

            if (pos)
            {
                // the data is more than a line.get one line
                line = strLeft.substr(0, pos);
                strLeft = strLeft.substr(pos + 1);
            }
        else
            {
                // get the left data
                line = strLeft;
                strLeft = "";
            }

            if(line.substr(0,("info face").length) == "info face")
            {
                // XXX: info parsing is incomplete
                // Not needed for the Hiero editors, but needed for the AngelCode editor
                //			[self parseInfoArguments:line];
                this.parseInfoArguments(line);
            }
            // Check to see if the start of the line is something we are interested in
            else if(line.substr(0,("common lineHeight").length) == "common lineHeight")
            {
                this.parseCommonArguments(line);
            }
            else if(line.substr(0,("page id").length) == "page id")
            {
                this.parseImageFileName(line, controlFile);
            }
            else if(line.substr(0,("chars c").length) == "chars c")
            {
                // Ignore this line
            }
            else if(line.substr(0,("char").length) == "char")
            {
                // Parse the current line and create a new CharDef
                var characterDefinition = new cc.BMFontDef();
                this.parseCharacterDefinition(line, characterDefinition);

                // Add the CharDef returned to the charArray
                this.m_pBitmapFontArray[ characterDefinition.charID ] = characterDefinition;
            }
            else if(line.substr(0,("kernings count").length) == "kernings count")
            {
                this.parseKerningCapacity(line);
            }
            else if(line.substr(0,("kerning first").length) == "kerning first")
            {
                this.parseKerningEntry(line);
            }
        }
    },
    parseCharacterDefinition:function (line, characterDefinition) {
        //////////////////////////////////////////////////////////////////////////
        // line to parse:
        // char id=32   x=0     y=0     width=0     height=0     xoffset=0     yoffset=44    xadvance=14     page=0  chnl=0
        //////////////////////////////////////////////////////////////////////////

        // Character ID
        var index = line.indexOf("id=");
        var index2 = line.indexOf(' ', index);
        var value = line.substr(index, index2-index);
        characterDefinition.charID = "id=" + value.toString();

        cc.Assert(characterDefinition.charID < cc.kCCBMFontMaxChars, "BitmpaFontAtlas: CharID bigger than supported");
        // Character x
        index = line.indexOf("x=");
        index2 = line.indexOf(' ', index);
        value = line.substr(index, index2-index);
        characterDefinition.rect.origin.x =  "x=%f" + value.toString();
        // Character y
        index = line.indexOf("y=");
        index2 = line.indexOf(' ', index);
        value = line.substr(index, index2-index);
        characterDefinition.rect.origin.y = "y=" + value.toString();
        // Character width
        index = line.indexOf("width=");
        index2 = line.indexOf(' ', index);
        value = line.substr(index, index2-index);
        characterDefinition.rect.size.width = "width="+ value.toString();
        // Character height
        index = line.indexOf("height=");
        index2 = line.indexOf(' ', index);
        value = line.substr(index, index2-index);
        characterDefinition.rect.size.height = "height=" + value.toString();
            // Character xoffset
        index = line.indexOf("xoffset=");
        index2 = line.indexOf(' ', index);
        value = line.substr(index, index2-index);
        characterDefinition.xOffset = "xoffset=" + value.toString();
        // Character yoffset
        index = line.indexOf("yoffset=");
        index2 = line.indexOf(' ', index);
        value = line.substr(index, index2-index);
        characterDefinition.yOffset = "yoffset=" + value.toString();
        // Character xadvance
        index = line.indexOf("xadvance=");
        index2 = line.indexOf(' ', index);
        value = line.substr(index, index2-index);
        characterDefinition.xAdvance = "xadvance=" + value.toString();
    },
    parseInfoArguments:function (line) {
        //////////////////////////////////////////////////////////////////////////
        // possible lines to parse:
        // info face="Script" size=32 bold=0 italic=0 charset="" unicode=1 stretchH=100 smooth=1 aa=1 padding=1,4,3,2 spacing=0,0 outline=0
        // info face="Cracked" size=36 bold=0 italic=0 charset="" unicode=0 stretchH=100 smooth=1 aa=1 padding=0,0,0,0 spacing=1,1
        //////////////////////////////////////////////////////////////////////////

        // padding
        var index = line.indexOf("padding=");
        var index2 = line.indexOf(' ', index);
        var value = line.substr(index, index2-index);
        //sscanf(value.toString(), "padding=%d,%d,%d,%d", &this.m_tPadding.top, &this.m_tPadding.right, &this.m_tPadding.bottom, &this.m_tPadding.left);
        cc.LOG("cocos2d: padding: " + this.m_tPadding.left + "," +this.m_tPadding.top + "," +this.m_tPadding.right + "," +this.m_tPadding.bottom);
    },
    parseCommonArguments:function (line) {
        //////////////////////////////////////////////////////////////////////////
        // line to parse:
        // common lineHeight=104 base=26 scaleW=1024 scaleH=512 pages=1 packed=0
        //////////////////////////////////////////////////////////////////////////

        // Height
        var index = line.indexOf("lineHeight=");
        var index2 = line.indexOf(' ', index);
        var value = line.substr(index, index2-index);
        this.m_uCommonHeight = "lineHeight=" + value.toString();
        // scaleW. sanity check
        index = line.indexOf("scaleW=") + ("scaleW=").length;
        index2 = line.indexOf(' ', index);
        value = line.substr(index, index2-index);

        // scaleH. sanity check
        index = line.indexOf("scaleH=") + ("scaleH=").length;
        index2 = line.indexOf(' ', index);
        value = line.substr(index, index2-index);

        // pages. sanity check
        index = line.indexOf("pages=") + ("pages=").length;
        index2 = line.indexOf(' ', index);
        value = line.substr(index, index2-index);
        cc.Assert(atoi(value.toString()) == 1, "cc.BitfontAtlas: only supports 1 page");

        // packed (ignore) What does this mean ??
    },
    parseImageFileName:function (line, fntFile) {
        //////////////////////////////////////////////////////////////////////////
        // line to parse:
        // page id=0 file="bitmapFontTest.png"
        //////////////////////////////////////////////////////////////////////////

        // page ID. Sanity check
        var index = line.indexOf('=')+1;
        var index2 = line.indexOf(' ', index);
        var value = line.substr(index, index2-index);
        cc.Assert(atoi(value.toString()) == 0, "LabelBMFont file could not be found");
        // file
        index = line.indexOf('"')+1;
        index2 = line.indexOf('"', index);
        value = line.substr(index, index2-index);

        this.m_sAtlasName = cc.FileUtils.fullPathFromRelativeFile(value.toString(), fntFile);
    },
    parseKerningCapacity:function (line) {
    },
    parseKerningEntry:function (line) {
        //////////////////////////////////////////////////////////////////////////
        // line to parse:
        // kerning first=121  second=44  amount=-7
        //////////////////////////////////////////////////////////////////////////

        // first
        var first;
        var index = line.indexOf("first=");
        var index2 = line.indexOf(' ', index);
        var value = line.substr(index, index2-index);
        first = "first=" +value.toString();

        // second
        var second;
        index = line.indexOf("second=");
        index2 = line.indexOf(' ', index);
        value = line.substr(index, index2-index);
        second = "second=" + value.toString();

        // amount
        var amount;
        index = line.indexOf("amount=");
        index2 = line.indexOf(' ', index);
        value = line.substr(index, index2-index);
        amount = "amount=" + value.toString();

        var element = new tKerningHashElement();
        element.amount = amount;
        element.key = (first<<16) | (second&0xffff);
        HASH_ADD_INT(this.m_pKerningDictionary,key, element);
    },
    purgeKerningDictionary:function () {
        tKerningHashElement *current;
        while(this.m_pKerningDictionary)
        {
            current = this.m_pKerningDictionary;
            HASH_DEL(this.m_pKerningDictionary,current);
            free(current);
        }
    }
});

cc.BMFontConfiguration.configurationWithFNTFile = function (FNTfile) {
    var pRet = new cc.BMFontConfiguration();
    if (pRet.initWithFNTfile(FNTfile)){
        return pRet;
    }
    return null;
};

/** @brief cc.LabelBMFont is a subclass of cc.SpriteSheet.

 Features:
 - Treats each character like a cc.Sprite. This means that each individual character can be:
 - rotated
 - scaled
 - translated
 - tinted
 - chage the opacity
 - It can be used as part of a menu item.
 - anchorPoint can be used to align the "label"
 - Supports AngelCode text format

 Limitations:
 - All inner characters are using an anchorPoint of (0.5, 0.5) and it is not recommend to change it
 because it might affect the rendering

 cc.LabelBMFont implements the protocol cc.LabelProtocol, like cc.Label and cc.LabelAtlas.
 cc.LabelBMFont has the flexibility of cc.Label, the speed of cc.LabelAtlas and all the features of cc.Sprite.
 If in doubt, use cc.LabelBMFont instead of cc.LabelAtlas / cc.Label.

 Supported editors:
 http://glyphdesigner.71squared.com/ (Commercial, Mac OS X)
 http://www.n4te.com/hiero/hiero.jnlp (Free, Java)
 http://slick.cokeandcode.com/demos/hiero.jnlp (Free, Java)
 http://www.angelcode.com/products/bmfont/ (Free, Windows only)

 @since v0.8
 */

cc.LabelBMFont = cc.SpriteBatchNode.extend({
    m_cOpacity:0,
    m_tColor:null,
    m_bIsOpacityModifyRGB:false,
    // string to render
    m_sString:"",
    m_pConfiguration:null,
    ctor:function(){
        //LabelBMFont - Debug draw
        if (cc.LABELBMFONT_DEBUG_DRAW){
            void cc.LabelBMFont.draw()
        {
            cc.SpriteBatchNode.draw();
            var s = this.getContentSize();
            var vertices =[cc.ccp(0,0),cc.ccp(s.width,0),
            cc.ccp(s.width,s.height),cc.ccp(0,s.height)];
            cc.drawPoly(vertices, 4, true);
        }}

    },
    /** conforms to cc.RGBAProtocol protocol */
    getOpacity:function () {
        return this.m_cOpacity;
    },
    setOpacity:function (Var) {
        this.m_cOpacity = Var;
        if (this._m_pChildren && this._m_pChildren.length != 0)
        {
            for(var i =0,len = this._m_pChildren.length; i < len; i++)
            {
                var pNode =  this._m_pChildren[i];
                if (pNode) {
                    var pRGBAProtocol = pNode instanceof cc.RGBAProtocol;
                    if (pRGBAProtocol)
                    {
                        pRGBAProtocol.setOpacity(this.m_cOpacity);
                    }
                }
            }
        }
    },
    /** conforms to cc.RGBAProtocol protocol */
    getColor:function () {
        return this.m_tColor;
    },
    setColor:function (Var) {
        this.m_tColor = Var;
        if (this._m_pChildren && this._m_pChildren.length != 0)
        {
            for(var i =0,len = this._m_pChildren.length; i < len; i++)
            {
                var pNode = this._m_pChildren[i];
                if (pNode)
                {
                    pNode.setColor(this.m_tColor);
                }
            }
        }
    },
    /** conforms to cc.RGBAProtocol protocol */
    getIsOpacityModifyRGB:function () {
        return this.m_bIsOpacityModifyRGB;
    },
    setIsOpacityModifyRGB:function (Var) {
        this.m_bIsOpacityModifyRGB = Var;
        if (this._m_pChildren && this._m_pChildren.length != 0)
        {
            for(var i =0,len = this._m_pChildren.length; i < len; i++)
            {
                var pNode = this._m_pChildren[i];
                if (pNode)
                {
                    var pRGBAProtocol = pNode instanceof cc.RGBAProtocol;
                    if (pRGBAProtocol)
                    {
                        pRGBAProtocol.setIsOpacityModifyRGB(this.m_bIsOpacityModifyRGB);
                    }
                }
            }
        }
    },


    /** init a bitmap font altas with an initial string and the FNT file */
    initWithString:function (theString, fntFile) {
        cc.Assert(theString != null, "");
        this.m_pConfiguration = cc.FNTConfigLoadFile(fntFile);
        cc.Assert( this.m_pConfiguration, "Error creating config for LabelBMFont");

        if (cc.SpriteBatchNode.initWithFile(this.m_pConfiguration.m_sAtlasName.toString(), theString.length))
        {
            this.m_cOpacity = 255;
            this.m_tColor = cc.WHITE;
            this.m_tContentSize = cc.SizeZero();
            this.m_bIsOpacityModifyRGB = this._m_pobTextureAtlas.getTexture().getHasPremultipliedAlpha();
            this.setAnchorPoint(cc.ccp(0.5, 0.5));
            this.setString(theString);
            return true;
        }
        return false;
    },
    /** updates the font chars based on the string to render */
    createFontChars:function () {
        var nextFontPositionX = 0;
        var nextFontPositionY = 0;
        var prev = -1;
        var kerningAmount = 0;

        var tmpSize = cc.SizeZero();

        var longestLine = 0;
        var totalHeight = 0;

        var quantityOfLines = 1;

        var stringLen = this.m_sString.length;

        if (0 == stringLen)
        {
            return;
        }

        for (var i = 0; i < stringLen - 1; ++i)
        {
            var c = this.m_sString[i];
            if (c == '\n')
            {
                quantityOfLines++;
            }
        }

        totalHeight = this.m_pConfiguration.m_uCommonHeight * quantityOfLines;
        nextFontPositionY = -(this.m_pConfiguration.m_uCommonHeight - this.m_pConfiguration.m_uCommonHeight * quantityOfLines);

        for (var i= 0; i < stringLen; i++)
        {
            var c = this.m_sString[i];
            cc.Assert( c < cc.kCCBMFontMaxChars, "LabelBMFont: character outside bounds");

            if (c == '\n')
            {
                nextFontPositionX = 0;
                nextFontPositionY -= this.m_pConfiguration.m_uCommonHeight;
                continue;
            }

            kerningAmount = this.kerningAmountForFirst(prev, c);

            var fontDef = this.m_pConfiguration.m_pBitmapFontArray[c];

            var rect = fontDef.rect;

            var fontChar =this.getChildByTag(i);
            if( ! fontChar )
            {
                fontChar = new cc.Sprite();
                fontChar.initWithBatchNodeRectInPixels(this, rect);
                this.addChild(fontChar, 0, i);
            }
            else
            {
                // reusing fonts
                fontChar.setTextureRectInPixels(rect, false, rect.size);

                // restore to default in case they were modified
                fontChar.setIsVisible(true);
                fontChar.setOpacity(255);
            }

            var yOffset = this.m_pConfiguration.m_uCommonHeight - fontDef.yOffset;
            fontChar.setPositionInPixels( cc.ccp( nextFontPositionX + fontDef.xOffset + fontDef.rect.size.width / 2.0 + kerningAmount,
            nextFontPositionY + yOffset - rect.size.height/2.0 ) );

            //		NSLog(@"position.y: %f", fontChar.position.y);

            // update kerning
            nextFontPositionX += this.m_pConfiguration.m_pBitmapFontArray[c].xAdvance + kerningAmount;
            prev = c;

            // Apply label properties
            fontChar.setIsOpacityModifyRGB(this.m_bIsOpacityModifyRGB);
            // Color MUST be set before opacity, since opacity might change color if OpacityModifyRGB is on
            fontChar.setColor(this.m_tColor);

            // only apply opacc.ity if it is different than 255 )
            // to prevent modifying the color too (issue #610)
            if( this.m_cOpacity != 255 )
            {
                fontChar.setOpacity(this.m_cOpacity);
            }

            if (longestLine < nextFontPositionX)
            {
                longestLine = nextFontPositionX;
            }
        }

        tmpSize.width  = longestLine;
        tmpSize.height = totalHeight;

        this.setContentSizeInPixels(tmpSize);
    },
    // super method
    setString:function (label) {
        return this.m_sString.toString()
    },
    getString:function () {
        this.m_sString.clear();
        this.m_sString = newString;

        if (this._m_pChildren && this._m_pChildren.length != 0)
        {
            for(var i =0,len = this._m_pChildren.length; i < len; i++)
            {
                var pNode = this._m_pChildren[i];
                if (pNode)
                {
                    pNode.setIsVisible(false);
                }
            }
        }
        this.createFontChars();
    },
    setCString:function (label) {
        this.setString(label);
    },
    setAnchorPoint:function (point) {
        if( ! cc.Point.CCPointEqualToPoint(point, this._m_tAnchorPoint) )
        {
            cc.SpriteBatchNode.setAnchorPoint(point);
            this.createFontChars();
        }
    },

    atlasNameFromFntFile:function (fntFile) {
    },
    kerningAmountForFirst:function (first, second) {
        var ret = 0;
        var key = (first<<16) | (second & 0xffff);

        if( this.m_pConfiguration.m_pKerningDictionary ) {
             var element = new tKerningHashElement();
            //HASH_FIND_INT(this.m_pConfiguration.m_pKerningDictionary, &key, element);
            //todo ?
            if(element)
                ret = element.amount;
        }
        return ret;
    }

});

/** creates a bitmap font altas with an initial string and the FNT file */
cc.LabelBMFont.labelWithString = function (str, fntFile) {
    var pRet = new cc.LabelBMFont();
    if(pRet && pRet.initWithString(str, fntFile))
    {
        return pRet;
    }
    return null;
};

/** Free function that parses a FNT file a place it on the cache
 */
cc.configurations =null;
cc.FNTConfigLoadFile = function (fntFile) {
     var pRet =null;

    if( cc.configurations == null )
    {
        cc.configurations = new Object();
    }
    var key = fntFile;
    pRet = cc.configurations[key];
    if( pRet == null )
    {
        pRet = cc.BMFontConfiguration.configurationWithFNTFile(fntFile);
        cc.configurations[key] = pRet;
    }

    return pRet;
};

/** Purges the cached data.
 Removes from memory the cached cc.configurations and the atlas name dictionary.
 @since v0.99.3
 */
cc.purgeCachedData = function () {
    cc.FNTConfigRemoveCache();
};

/** Purges the FNT config cache
 */
cc.FNTConfigRemoveCache = function () {
    if (cc.configurations)
    {
        cc.configurations = new Object();
    }
};