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
cc.LABEL_AUTOMATIC_WIDTH = -1;

cc.KerningHashElement = function (key, amount) {
    this.key = key || 0;   //key for the hash. 16-bit for 1st element, 16-bit for 2nd element
    this.amount = amount || 0;
};

cc.FontDefHashElement = function (key, fontDef) {
    this.key = key || 0;        // key. Font Unicode value
    this.fontDef = fontDef || new cc.BMFontDef();    // font definition
};

cc.BMFontDef = function (charID, rect, xOffset, yOffset, xAdvance) {
    //! ID of the character
    this.charID = charID || 0;
    //! origin and size of the font
    this.rect = rect || cc.rect(0, 0, 0.1, 0.1);
    //! The X amount the image should be offset when drawing the image (in pixels)
    this.xOffset = xOffset || 0;
    //! The Y amount the image should be offset when drawing the image (in pixels)
    this.yOffset = yOffset || 0;
    //! The amount to move the current position after drawing the character (in pixels)
    this.xAdvance = xAdvance || 0;
};

cc.BMFontPadding = function (left, top, right, bottom) {
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
     * FNTConfig: Common Height
     * @type Number
     */
    commonHeight:0,

    /**
     *  Padding
     *  @type cc.BMFontPadding
     */
    padding:null,

    /**
     * atlas name
     * @type String
     */
    atlasName:null,

    /**
     * values for kerning
     * @type cc.KerningHashElement
     */
    kerningDictionary:null,

    /**
     * values for FontDef
     * @type cc.FontDefHashElement
     */
    fontDefDictionary:null,

    /**
     * Character Set defines the letters that actually exist in the font
     * @type Array
     */
    characterSet:null,

    /**
     * Constructor
     */
    ctor:function () {
        this.padding = new cc.BMFontPadding();
        this.atlasName = "";
        this.kerningDictionary = new cc.KerningHashElement();
        this.fontDefDictionary = {};
        this.characterSet = [];
    },

    /**
     * Description of BMFontConfiguration
     * @return {String}
     */
    description:function () {
        return "<cc.BMFontConfiguration | Kernings:" + this.kerningDictionary.amount + " | Image = " + this.atlasName.toString() + ">";
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
     * @return {Object}
     */
    getCharacterSet:function () {
        return this.characterSet;
    },

    /**
     * initializes a BitmapFontConfiguration with a FNT file
     * @param {String} FNTfile file path
     * @return {Boolean}
     */
    initWithFNTfile:function (FNTfile) {
        if(!FNTfile || FNTfile.length == 0)
            throw "cc.BMFontConfiguration.initWithFNTfile(): FNTfile must be non-null and must not be a empty string";
        this.characterSet = this._parseConfigFile(FNTfile);
        return this.characterSet != null;
    },

    _parseConfigFile:function (controlFile) {
        var fullpath = cc.FileUtils.getInstance().fullPathForFilename(controlFile);
        var data = cc.SAXParser.getInstance().getList(fullpath);

        if (!data) {
            cc.log("cc.BMFontConfiguration._parseConfigFile)(: Error parsing FNTfile " + controlFile);
            return null;
        }

        var validCharsString = [];

        // parse spacing / padding
        var line, re, i;

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

        //re = /page id=[a-zA-Z0-9\.\-= ",]+/gi;
        re = /page id=[0-9]+ file="[\w\-\.]+/gi;
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
            for (i = 0; i < line.length; i++) {
                var element = new cc.FontDefHashElement();
                this._parseCharacterDefinition(line[i], element.fontDef);
                element.key = element.fontDef.charID;
                this.fontDefDictionary[element.key] = element;
                validCharsString.push(element.fontDef.charID);
            }
        }

        /*
         re = /kernings count+[a-z0-9\-= ",]+/gi;
         if (re.test(data)) {
         line = RegExp.$1[0];
         if (line)
         this._parseKerningCapacity(line);
         }*/

        re = /kerning first=\w[a-z0-9\-= ]+/gi;
        line = data.match(re);
        if (line) {
            for (i = 0; i < line.length; i++)
                this._parseKerningEntry(line[i]);
        }

        return validCharsString;
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
        characterDefinition.rect.x = parseInt(value);

        // Character y
        value = /y=([\-\d]+)/gi.exec(line)[1];
        characterDefinition.rect.y = parseInt(value);

        // Character width
        value = /width=([\-\d]+)/gi.exec(line)[1];
        characterDefinition.rect.width = parseInt(value);

        // Character height
        value = /height=([\-\d]+)/gi.exec(line)[1];
        characterDefinition.rect.height = parseInt(value);

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
        this.padding.top = tmpPadding[2];
        this.padding.right = tmpPadding[3];
        this.padding.bottom = tmpPadding[4];
        cc.log("cocos2d: padding: " + this.padding.left + "," + this.padding.top + "," + this.padding.right + "," + this.padding.bottom);
    },

    _parseCommonArguments:function (line) {
        //////////////////////////////////////////////////////////////////////////
        // line to parse:
        // common lineHeight=104 base=26 scaleW=1024 scaleH=512 pages=1 packed=0
        //////////////////////////////////////////////////////////////////////////

        var value;
        // Height
        this.commonHeight = parseInt(/lineHeight=(\d+)/gi.exec(line)[1]);

        if (cc.renderContextType === cc.WEBGL) {
            var scaleW = parseInt(/scaleW=(\d+)/gi.exec(line)[1]);
            if(scaleW > cc.Configuration.getInstance().getMaxTextureSize())
                cc.log("cc.LabelBMFont._parseCommonArguments(): page can't be larger than supported");

            var scaleH = parseInt(/scaleH=(\d+)/gi.exec(line)[1]);
            if(scaleH > cc.Configuration.getInstance().getMaxTextureSize())
                cc.log("cc.LabelBMFont._parseCommonArguments(): page can't be larger than supported");
        }

        // pages. sanity check
        value = /pages=(\d+)/gi.exec(line)[1];
        if(parseInt(value) !== 1)
            cc.log("cc.LabelBMFont._parseCommonArguments(): only supports 1 page");

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
        if(parseInt(value) !== 0)
            cc.log("cc.LabelBMFont._parseImageFileName() : file could not be found");

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

        var element = new cc.KerningHashElement();
        element.amount = amount;
        element.key = (first << 16) | (second & 0xffff);

        this.kerningDictionary[element.key] = element;
    },

    _purgeKerningDictionary:function () {
        this.kerningDictionary = null;
    },

    _purgeFontDefDictionary:function () {
        this.fontDefDictionary = null;
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
 */
cc.LabelBMFont = cc.SpriteBatchNode.extend(/** @lends cc.LabelBMFont# */{
    RGBAProtocol:true,

    _opacityModifyRGB:false,

    _string:null,
    _configuration:null,

    // name of fntFile
    _fntFile:null,

    // initial string without line breaks
    _initialString : "",

    // alignment of all lines
    _alignment:null,

    // max width until a line break is added
    _width:0,
    _lineBreakWithoutSpaces:false,
    _imageOffset:null,

    _reusedChar:null,

    //texture RGBA
    _displayedOpacity:255,
    _realOpacity:255,
    _displayedColor:null,
    _realColor:null,
    _cascadeColorEnabled:false,
    _cascadeOpacityEnabled:false,

    _textureLoaded: false,
    _loadedEventListeners: null,

    _setString:function(newString, needUpdateLabel){
        if(!needUpdateLabel){
            this._string = newString;
        } else {
            this._initialString = newString;
        }
        var locChildren = this._children;
        if(locChildren){
            for(var i = 0; i< locChildren.length;i++){
                var selNode = locChildren[i];
                if(selNode)
                    selNode.setVisible(false);
            }
        }
        if(this._textureLoaded){
            this.createFontChars();

            if(needUpdateLabel)
                this.updateLabel();
        }
    },
    /**
     * Constructor
     */
    ctor:function () {
        cc.SpriteBatchNode.prototype.ctor.call(this);
        this._imageOffset = cc.PointZero();
        this._string = "";
        this._initialString = "";
        this._alignment = cc.TEXT_ALIGNMENT_CENTER;
        this._width = -1;
        this._configuration = null;
        this._lineBreakWithoutSpaces = false;

        this._displayedOpacity = 255;
        this._realOpacity = 255;
        this._displayedColor = cc.white();
        this._realColor = cc.white();
        this._cascadeColorEnabled = true;
        this._cascadeOpacityEnabled = true;
        this._opacityModifyRGB = false;

        this._fntFile = "";
        this._reusedChar = [];
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
        var locListeners = this._loadedEventListeners;
        for(var i = 0, len = locListeners.length;  i < len; i++){
            var selCallback = locListeners[i];
            selCallback.eventCallback.call(selCallback.eventTarget, this);
        }
        locListeners.length = 0;
    },

    /**
     * @param {CanvasRenderingContext2D} ctx
     */
    draw:function (ctx) {
        cc.SpriteBatchNode.prototype.draw.call(this, ctx);

        //LabelBMFont - Debug draw
        if (cc.LABELBMFONT_DEBUG_DRAW) {
            var size = this.getContentSize();
            var pos = cc.p(0 | ( -this._anchorPointInPoints._x), 0 | ( -this._anchorPointInPoints._y));
            var vertices = [cc.p(pos.x, pos.y), cc.p(pos.x + size.width, pos.y), cc.p(pos.x + size.width, pos.y + size.height), cc.p(pos.x, pos.y + size.height)];
            cc.drawingUtil.setDrawColor4B(0,255,0,255);
            cc.drawingUtil.drawPoly(vertices, 4, true);
        }
    },

    //TODO
    /**
     * tint this label
     * @param {cc.Color3B} color3
     */
    setColor:function (color3) {
        if (((this._realColor.r == color3.r) && (this._realColor.g == color3.g) && (this._realColor.b == color3.b)))
            return;
        this._displayedColor = {r:color3.r, g:color3.g, b:color3.b};
        this._realColor = {r:color3.r, g:color3.g, b:color3.b};

        if(this._textureLoaded){
            if(this._cascadeColorEnabled){
                var parentColor = cc.white();
                var locParent = this._parent;
                if(locParent && locParent.RGBAProtocol && locParent.isCascadeColorEnabled())
                    parentColor = locParent.getDisplayedColor();
                this.updateDisplayedColor(parentColor);
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
     * @param {Boolean} opacityModifyRGB
     */
    setOpacityModifyRGB:function (opacityModifyRGB) {
        this._opacityModifyRGB = opacityModifyRGB;
        var locChildren = this._children;
        if (locChildren) {
            for (var i = 0; i < locChildren.length; i++) {
                var node = locChildren[i];
                if (node && node.RGBAProtocol)
                    node.setOpacityModifyRGB(this._opacityModifyRGB);
            }
        }
    },

    getOpacity:function(){
        return this._realOpacity;
    },

    getDisplayedOpacity:function(){
        return this._displayedOpacity;
    },

    /**
     * Override synthesized setOpacity to recurse items
     * @param {Number} opacity
     */
    setOpacity:function(opacity){
        this._displayedOpacity = this._realOpacity = opacity;
        if(this._cascadeOpacityEnabled){
            var parentOpacity = 255;
            var locParent = this._parent;
            if(locParent && locParent.RGBAProtocol && locParent.isCascadeOpacityEnabled())
               parentOpacity = locParent.getDisplayedOpacity();
            this.updateDisplayedOpacity(parentOpacity);
        }
    },

    updateDisplayedOpacity:function(parentOpacity){
        this._displayedOpacity = this._realOpacity * parentOpacity/255.0;
        var locChildren = this._children;
        for(var i = 0; i< locChildren.length; i++){
            var locChild = locChildren[i];
            if(cc.Browser.supportWebGL){
                locChild.updateDisplayedOpacity(this._displayedOpacity);
            }else{
                cc.NodeRGBA.prototype.updateDisplayedOpacity.call(locChild, this._displayedOpacity);
                locChild.setNodeDirty();
            }
        }
        this._changeTextureColor();
    },

    isCascadeOpacityEnabled:function(){
        return false;
    },

    setCascadeOpacityEnabled:function(cascadeOpacityEnabled){
        this._cascadeOpacityEnabled = cascadeOpacityEnabled;
    },

    getColor:function(){
        return this._realColor;
    },

    getDisplayedColor:function(){
        return this._displayedColor;
    },

    updateDisplayedColor:function(parentColor){
        var locDispColor = this._displayedColor;
        var locRealColor = this._realColor;
        locDispColor.r = locRealColor.r * parentColor.r/255.0;
        locDispColor.g = locRealColor.g * parentColor.g/255.0;
        locDispColor.b = locRealColor.b * parentColor.b/255.0;

        var locChildren = this._children;
        for(var i = 0;i < locChildren.length;i++){
            var locChild = locChildren[i];
            if(cc.Browser.supportWebGL){
                locChild.updateDisplayedColor(this._displayedColor);
            }else{
                cc.NodeRGBA.prototype.updateDisplayedColor.call(locChild, this._displayedColor);
                locChild.setNodeDirty();
            }
        }
        this._changeTextureColor();
    },

    _changeTextureColor:function(){
        if(cc.Browser.supportWebGL){
            return;
        }
        var locElement, locTexture = this.getTexture();
        if (locTexture && locTexture.getContentSize().width>0) {
            locElement = locTexture.getHtmlElementObj();
            if (!locElement)
                return;
            var cacheTextureForColor = cc.TextureCache.getInstance().getTextureColors(this._originalTexture.getHtmlElementObj());
            if (cacheTextureForColor) {
                if (locElement instanceof HTMLCanvasElement && !this._rectRotated)
                    cc.generateTintImage(locElement, cacheTextureForColor, this._displayedColor, null, locElement);
                else{
                    locElement = cc.generateTintImage(locElement, cacheTextureForColor, this._displayedColor);
                    locTexture = new cc.Texture2D();
                    locTexture.initWithElement(locElement);
                    locTexture.handleLoadedTexture();
                    this.setTexture(locTexture);
                }
            }
        }
    },

    isCascadeColorEnabled:function(){
        return false;
    },

    setCascadeColorEnabled:function(cascadeColorEnabled){
        this._cascadeColorEnabled = cascadeColorEnabled;
    },

    /**
     *  init LabelBMFont
     */
    init:function () {
        return this.initWithString(null, null, null, null, null);
    },

    /**
     * init a bitmap font altas with an initial string and the FNT file
     * @param {String} str
     * @param {String} fntFile
     * @param {Number} width
     * @param {Number} alignment
     * @param {cc.Point} imageOffset
     * @return {Boolean}
     */
    initWithString:function (str, fntFile, width, alignment, imageOffset) {
        var theString = str || "";

        if(this._configuration)
            cc.log("cc.LabelBMFont.initWithString(): re-init is no longer supported");

        var texture;
        if (fntFile) {
            var newConf = cc.FNTConfigLoadFile(fntFile);
            if(!newConf){
                cc.log("cc.LabelBMFont.initWithString(): Impossible to create font. Please check file");
                return false;
            }

            this._configuration = newConf;
            this._fntFile = fntFile;
            texture = cc.TextureCache.getInstance().addImage(this._configuration.getAtlasName());
            var locIsLoaded = texture.isLoaded();
            this._textureLoaded = locIsLoaded;
            if(!locIsLoaded){
                texture.addLoadedEventListener(function(sender){
                    this._textureLoaded = true;
                    //reset the LabelBMFont
                    this.initWithTexture(sender, this._initialString.length);
                    this.setString(this._initialString,true);
                    this._callLoadedEventCallbacks();
                }, this);
            }
        } else{
            texture = new cc.Texture2D();
            var image = new Image();
            texture.initWithElement(image);
            this._textureLoaded = false;
        }

        if (this.initWithTexture(texture, theString.length)) {
            this._alignment = alignment || cc.TEXT_ALIGNMENT_LEFT;
            this._imageOffset = imageOffset || cc.PointZero();
            this._width = (width == null) ? -1 : width;

            this._displayedOpacity = this._realOpacity = 255;
            this._displayedColor = cc.white();
            this._realColor = cc.white();
            this._cascadeOpacityEnabled = true;
            this._cascadeColorEnabled = true;

            this._contentSize._width = 0;
            this._contentSize._height = 0;

            this.setAnchorPoint(0.5, 0.5);

            if (cc.renderContextType === cc.WEBGL) {
                var locTexture = this._textureAtlas.getTexture();
                this._opacityModifyRGB = locTexture.hasPremultipliedAlpha();

                this._reusedChar = new cc.Sprite();
                this._reusedChar.initWithTexture(locTexture, cc.rect(0, 0, 0, 0), false);
                this._reusedChar.setBatchNode(this);
            }
            this.setString(theString,true);
            return true;
        }
        return false;
    },

    /**
     * updates the font chars based on the string to render
     */
    createFontChars:function () {
        var locContextType = cc.renderContextType;
        var locTexture = (locContextType === cc.CANVAS) ? this.getTexture() : this._textureAtlas.getTexture();

        var nextFontPositionX = 0;
        var prev = -1;
        var kerningAmount = 0;

        var tmpSize = cc.SizeZero();

        var longestLine = 0;

        var quantityOfLines = 1;

        var stringLen = this._string ? this._string.length : 0;

        if (stringLen === 0)
            return;

        var i, charSet = this._configuration.getCharacterSet();
        for (i = 0; i < stringLen - 1; i++) {
            if (this._string.charCodeAt(i) == 10)
                quantityOfLines++;
        }

        var totalHeight = this._configuration.commonHeight * quantityOfLines;
        var nextFontPositionY = -(this._configuration.commonHeight - this._configuration.commonHeight * quantityOfLines);

        for (i = 0; i < stringLen; i++) {
            var key = this._string.charCodeAt(i);

            if (key === 10) {
                //new line
                nextFontPositionX = 0;
                nextFontPositionY -= this._configuration.commonHeight;
                continue;
            }

            if (charSet[key] === null) {
                cc.log("cc.LabelBMFont: Attempted to use character not defined in this bitmap: " + this._string[i]);
                continue;
            }

            kerningAmount = this._kerningAmountForFirst(prev,key);
            var element = this._configuration.fontDefDictionary[key];
            if (!element) {
                if(key !== 0 && key !== 10)
                    cc.log("cocos2d: LabelBMFont: character not found " + this._string[i]);
                continue;
            }

            var fontDef = element.fontDef;

            var rect = cc.rect(fontDef.rect.x, fontDef.rect.y, fontDef.rect.width, fontDef.rect.height);
            rect = cc.RECT_PIXELS_TO_POINTS(rect);
            rect.x += this._imageOffset.x;
            rect.y += this._imageOffset.y;

            var fontChar = this.getChildByTag(i);
            //var hasSprite = true;
            if (!fontChar) {
                fontChar = new cc.Sprite();
                if ((key === 32) && (locContextType === cc.CANVAS)) {
                    fontChar.initWithTexture(locTexture, cc.RectZero(), false);
                } else
                    fontChar.initWithTexture(locTexture, rect, false);
                fontChar._newTextureWhenChangeColor = true;
                this.addChild(fontChar, 0, i);
            } else {
                if ((key === 32) && (locContextType === cc.CANVAS)) {
                    fontChar.setTextureRect(rect, false, cc.SizeZero());
                } else {
                    // updating previous sprite
                    fontChar.setTextureRect(rect, false, rect._size);
                    // restore to default in case they were modified
                    fontChar.setVisible(true);
                }
            }
            // Apply label properties
            fontChar.setOpacityModifyRGB(this._opacityModifyRGB);
            // Color MUST be set before opacity, since opacity might change color if OpacityModifyRGB is on
            if (cc.Browser.supportWebGL) {
                fontChar.updateDisplayedColor(this._displayedColor);
                fontChar.updateDisplayedOpacity(this._displayedOpacity);
            } else {
                cc.NodeRGBA.prototype.updateDisplayedColor.call(fontChar, this._displayedColor);
                cc.NodeRGBA.prototype.updateDisplayedOpacity.call(fontChar, this._displayedOpacity);
                fontChar.setNodeDirty();
            }

            var yOffset = this._configuration.commonHeight - fontDef.yOffset;
            var fontPos = cc.p(nextFontPositionX + fontDef.xOffset + fontDef.rect.width * 0.5 + kerningAmount,
                nextFontPositionY + yOffset - rect.height * 0.5 * cc.CONTENT_SCALE_FACTOR());
            fontChar.setPosition(cc.POINT_PIXELS_TO_POINTS(fontPos));

            // update kerning
            nextFontPositionX += fontDef.xAdvance + kerningAmount;
            prev = key;

            if (longestLine < nextFontPositionX)
                longestLine = nextFontPositionX;
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
        var locChildren = this._children;
        if (locChildren) {
            for (var i = 0; i < locChildren.length; i++) {
                var node = locChildren[i];
                if (node)
                    node.setVisible(false);
            }
        }
        if (this._configuration)
            this.createFontChars();

        if (!fromUpdate)
            this.updateLabel();
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
     * @param {String} newString
     * @param {Boolean|null} needUpdateLabel
     */
    setString: function (newString, needUpdateLabel) {
        newString = String(newString);
        if(needUpdateLabel == null)
            needUpdateLabel = true;
        if (newString == null || typeof(newString) != "string")
            newString = newString + "";

        this._initialString = newString;
        this._setString(newString, needUpdateLabel);
    },

    /**
     * @deprecated
     * @param label
     */
    setCString:function (label) {
        this.setString(label,true);
    },

    /**
     *  update Label
     */
    updateLabel:function () {
        this.setString(this._initialString, false);

        // Step 1: Make multiline
        if (this._width > 0) {
            var stringLength = this._string.length;
            var multiline_string = [];
            var last_word = [];

            var line = 1, i = 0, start_line = false, start_word = false, startOfLine = -1, startOfWord = -1, skip = 0, j;

            var characterSprite;
            for (j = 0; j < this._children.length; j++) {
                var justSkipped = 0;
                while (!(characterSprite = this.getChildByTag(j + skip + justSkipped)))
                    justSkipped++;
                skip += justSkipped;

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
                    i+= justSkipped;
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
                            startOfWord = this._getLetterPosXLeft(characterSprite);
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
            this._setString(str_new, false)
        }

        // Step 2: Make alignment
        if (this._alignment != cc.TEXT_ALIGNMENT_LEFT) {
            i = 0;

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
                    lineWidth = lastChar.getPositionX() + lastChar.getContentSize().width / 2;

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
                        for (j = 0; j < line_length; j++) {
                            index = i + j + lineNumber;
                            if (index < 0) continue;
                            characterSprite = this.getChildByTag(index);
                            if (characterSprite)
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
     * @param {Number} [scaleY=null]
     */
    setScale:function (scale, scaleY) {
        cc.Node.prototype.setScale.call(this, scale, scaleY);
        this.updateLabel();
    },

    /**
     * @param {Number} scaleX
     */
    setScaleX:function (scaleX) {
        cc.Node.prototype.setScaleX.call(this,scaleX);
        this.updateLabel();
    },

    /**
     * @param {Number} scaleY
     */
    setScaleY:function (scaleY) {
        cc.Node.prototype.setScaleY.call(this,scaleY);
        this.updateLabel();
    },

    //TODO
    /**
     * set fnt file path
     * @param {String} fntFile
     */
    setFntFile:function (fntFile) {
        if (fntFile != null && fntFile != this._fntFile) {
            var newConf = cc.FNTConfigLoadFile(fntFile);

            if(!newConf){
                cc.log("cc.LabelBMFont.setFntFile() : Impossible to create font. Please check file");
                return;
            }

            this._fntFile = fntFile;
            this._configuration = newConf;

            var texture = cc.TextureCache.getInstance().addImage(this._configuration.getAtlasName());
            var locIsLoaded = texture.isLoaded();
            this._textureLoaded = locIsLoaded;
            this.setTexture(texture);
            if (cc.renderContextType === cc.CANVAS)
                this._originalTexture = this.getTexture();
            if(!locIsLoaded){
                texture.addLoadedEventListener(function(sender){
                    this._textureLoaded = true;
                    this.setTexture(sender);
                    this.createFontChars();
                    this._changeTextureColor();
                    this.updateLabel();
                    this._callLoadedEventCallbacks();
                }, this);
            } else {
                this.createFontChars();
            }
        }
    },

    /**
     * @return {String}
     */
    getFntFile:function () {
        return this._fntFile;
    },

    /**
     * set the AnchorPoint of the labelBMFont
     * @override
     * @param {cc.Point|Number} point The anchor point of labelBMFont or The anchor point.x of labelBMFont.
     * @param {Number} [y] The anchor point.y of labelBMFont.
     */
    setAnchorPoint:function (point, y) {
	    cc.Node.prototype.setAnchorPoint.call(this, point, y);
        this.updateLabel();
    },

    _atlasNameFromFntFile:function (fntFile) {
    },

    _kerningAmountForFirst:function (first, second) {
        var ret = 0;
        var key = (first << 16) | (second & 0xffff);
        if (this._configuration.kerningDictionary) {
            var element = this._configuration.kerningDictionary[key.toString()];
            if (element)
                ret = element.amount;
        }
        return ret;
    },

    _getLetterPosXLeft:function (sp) {
        return sp.getPositionX() * this._scaleX + (sp.getContentSize().width * this._scaleX * sp.getAnchorPoint().x);
    },

    _getLetterPosXRight:function (sp) {
        return sp.getPositionX() * this._scaleX - (sp.getContentSize().width * this._scaleX * sp.getAnchorPoint().x);
    }
});

/**
 * creates a bitmap font atlas with an initial string and the FNT file
 * @param {String} str
 * @param {String} fntFile
 * @param {Number} width
 * @param {Number} alignment
 * @param {cc.Point} imageOffset
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
    if (str === undefined) {
        if (ret && ret.init())
            return ret;
        return null;
    }

    if (ret && ret.initWithString(str, fntFile, width, alignment, imageOffset)) {
        return ret;
    }
    return null;
};

/**
 * shared instance of configuration
 * @type cc.BMFontConfiguration
 */
cc.LabelBMFont._configurations = null;

/**
 * Load the .fnt file
 * @param {String} fntFile
 * @return {cc.BMFontConfiguration}
 * Constructor
 */
cc.FNTConfigLoadFile = function (fntFile) {
    if (!cc.LabelBMFont._configurations) {
        cc.LabelBMFont._configurations = {};
    }
    var ret = cc.LabelBMFont._configurations[fntFile];
    if (!ret) {
        ret = cc.BMFontConfiguration.create(fntFile);
        cc.LabelBMFont._configurations[fntFile] = ret;
    }
    return ret;
};

/**
 * Purges the cached .fnt data
 */
cc.LabelBMFont.purgeCachedData = function () {
    cc.FNTConfigRemoveCache();
};

/**
 * Purges the FNT config cache
 */
cc.FNTConfigRemoveCache = function () {
    if (cc.LabelBMFont._configurations) {
        cc.LabelBMFont._configurations = null;
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
