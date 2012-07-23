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
 * cc.LabelTTF is a subclass of cc.TextureNode that knows how to render text labels<br/>
 * All features from cc.TextureNode are valid in cc.LabelTTF<br/>
 * cc.LabelTTF objects are slow for js-binding on mobile devices.<br/>
 * Consider using cc.LabelAtlas or cc.LabelBMFont instead.<br/>
 * @class
 * @extends cc.Sprite
 */
cc.LabelTTF = cc.Sprite.extend(/** @lends cc.LabelTTF# */{
    _dimensions:cc.SizeZero(),
    _hAlignment:cc.TEXT_ALIGNMENT_CENTER,
    _vAlignment:cc.VERTICAL_TEXT_ALIGNMENT_TOP,
    _fontName:"Arial",
    _fontSize:0.0,
    _string:"",
    _fontStyleStr:null,
    /**
     * Constructor
     */
    ctor:function () {
        this._super();
        this._color = cc.WHITE();
        this._opacityModifyRGB = false;
        this._fontStyleStr = "";
    },
    init:function (callsuper) {
        if (callsuper) {
            return this._super();
        }
        this.initWithString([" ", this._fontName, this._fontSize]);
    },
    /**
     * Prints out a description of this class
     * @return {String}
     */
    description:function () {
        return "<cc.LabelTTF | FontName =" + this._fontName + " FontSize = " + this._fontSize.toFixed(1) + ">";
    },

    /**
     * changes the string to render
     * @warning Changing the string is as expensive as creating a new cc.LabelTTF. To obtain better performance use cc.LabelAtlas
     * @param {String} string text for the label
     */
    setString:function (string) {
        if (this._string != string) {
            this._string = string;

            // Force update
            if (this._string.length > 0) {
                this._updateTTF();
            }
        }
    },

    /**
     * returns the text of the label
     * @return {String}
     */
    getString:function () {
        return this._string;
    },

    getHorizontalAlignment:function () {
        return this._hAlignment;
    },

    setHorizontalAlignment:function (alignment) {
        if (alignment != this._hAlignment) {
            this._hAlignment = alignment;

            // Force update
            if (this._string.length > 0) {
                this._updateTTF();
            }
        }
    },

    getVerticalAlignment:function () {
        return this._vAlignment;
    },

    setVerticalAlignment:function (verticalAlignment) {
        if (verticalAlignment != this._vAlignment) {
            this._vAlignment = verticalAlignment;

            // Force update
            if (this._string.length > 0) {
                this._updateTTF();
            }
        }
    },

    getDimensions:function () {
        return this._dimensions;
    },

    setDimensions:function (dim) {
        if (dim.width != this._dimensions.width || dim.height != this._dimensions.height) {
            this._dimensions = dim;

            // Force udpate
            if (this._string.length > 0) {
                this._updateTTF();
            }
        }
    },

    getFontSize:function () {
        return this._fontSize;
    },

    setFontSize:function (fontSize) {
        if (this._fontSize != fontSize) {
            this._fontSize = fontSize;

            // Force update
            if (this._string.length > 0) {
                this._updateTTF();
            }
        }
    },

    getFontName:function () {
        return this._fontName;
    },

    setFontName:function (fontName) {
        if (this._fontName != fontName) {
            this._fontName = new String(fontName);
            // Force update
            if (this._string.length > 0) {
                this._updateTTF();
            }
        }
    },

    /**
     * initializes the cc.LabelTTF with a font name, alignment, dimension and font size
     * @param {String} string
     * @param {cc.Size} dimensions
     * @param {cc.TEXT_ALIGNMENT_LEFT|cc.TEXT_ALIGNMENT_CENTER|cc.TEXT_ALIGNMENT_RIGHT} alignment
     * @param {String} fontName
     * @param {Number} fontSize
     * @return {Boolean} return false on error
     */
    initWithString:function (arg) {
        var string = arg[0], dimensions, hAlignment, vAlignment, fontName, fontSize;
        cc.Assert(string != null, "cc.LabelTTF.initWithString() label is null");
        if (arg.length == 6) {
            dimensions = arg[1];
            hAlignment = arg[2];
            vAlignment = arg[3];
            fontName = arg[4];
            fontSize = arg[5];
        }
        else if (arg.length == 5) {
            dimensions = arg[1];
            hAlignment = arg[2];
            vAlignment = cc.VERTICAL_TEXT_ALIGNMENT_TOP;
            fontName = arg[3];
            fontSize = arg[4];
        }
        else {
            dimensions = cc.SizeMake(0, arg[2]);
            hAlignment = cc.TEXT_ALIGNMENT_LEFT;
            vAlignment = cc.VERTICAL_TEXT_ALIGNMENT_BOTTOM;
            fontName = arg[1];
            fontSize = arg[2];
        }
        if (this.init(true)) {
            this._dimensions = cc.SizeMake(dimensions.width, dimensions.height);
            this._fontName = fontName;
            this._hAlignment = hAlignment;
            this._vAlignment = vAlignment;
            this._fontSize = fontSize * cc.CONTENT_SCALE_FACTOR();
            this.setString(string);
            this._fontStyleStr = this._fontSize + "px '" + this._fontName + "'";
            return true;
        }
        return false;
    },
    /**
     * renders the label
     * @param {CanvasContext|Null} ctx
     */
    draw:function (ctx) {
        if (cc.renderContextType == cc.CANVAS) {
            var context = ctx || cc.renderContext;
            if (this._flipX) {
                context.scale(-1, 1);
            }
            if (this._flipY) {
                context.scale(1, -1);
            }
            //this is fillText for canvas
            context.fillStyle = "rgba(" + this._color.r + "," + this._color.g + "," + this._color.b + ", " + this._opacity / 255 + ")";

            if (context.font != this._fontStyleStr)
                context.font = this._fontStyleStr;
            context.textBaseline = "bottom";

            var xOffset = 0, yOffset = 0;
            switch (this._hAlignment) {
                case cc.TEXT_ALIGNMENT_LEFT:
                    context.textAlign = "left";
                    xOffset = 0;
                    break;
                case cc.TEXT_ALIGNMENT_RIGHT:
                    context.textAlign = "right";
                    xOffset = this._dimensions.width;
                    break;
                case cc.TEXT_ALIGNMENT_CENTER:
                    context.textAlign = "center";
                    xOffset = this._dimensions.width / 2;
                    break;
                default:
                    break;
            }

            switch (this._vAlignment) {
                case cc.VERTICAL_TEXT_ALIGNMENT_TOP:
                    context.textBaseline = "top";
                    yOffset = -this._dimensions.height;
                    break;
                case cc.VERTICAL_TEXT_ALIGNMENT_CENTER:
                    context.textBaseline = "middle";
                    yOffset = -this._dimensions.height / 2;
                    break;
                case cc.VERTICAL_TEXT_ALIGNMENT_BOTTOM:
                    context.textBaseline = "bottom";
                    yOffset = 0;
                    break;
                default:
                    break;
            }

            if (((this._contentSize.width > this._dimensions.width) || this._string.indexOf("\n")) && this._dimensions.width !== 0) {
                this._wrapText(context, this._string,
                    -this._dimensions.width * this._anchorPoint.x,
                    this._dimensions.height * this._anchorPoint.y,
                    this._dimensions.width,
                    this._dimensions.height,
                    this._fontSize * 1.2);
            }
            else if (this._dimensions.width == 0) {
                context.fillText(this._string, -this._contentSize.width * this._anchorPoint.x, this._contentSize.height * this._anchorPoint.y);
            }
            else {
                context.fillText(this._string,
                    -this._dimensions.width * this._anchorPoint.x + xOffset,
                    this._dimensions.height * this._anchorPoint.y + yOffset);
            }
            cc.INCREMENT_GL_DRAWS(1);
        }
    },
    _wrapText:function (context, text, x, y, maxWidth, maxHeight, lineHeight) {
        var num = this._lineCount() - 1;
        var xOffset, yOffset;
        switch (this._hAlignment) {
            case cc.TEXT_ALIGNMENT_LEFT:
                context.textAlign = "left";
                xOffset = 0;
                break;
            case cc.TEXT_ALIGNMENT_RIGHT:
                context.textAlign = "right";
                xOffset = maxWidth;
                break;
            default:
                context.textAlign = "center";
                xOffset = maxWidth / 2;
                break;
        }

        switch (this._vAlignment) {
            case cc.VERTICAL_TEXT_ALIGNMENT_TOP:
                context.textBaseline = "top";
                yOffset = -maxHeight;
                break;
            case cc.VERTICAL_TEXT_ALIGNMENT_BOTTOM:
                context.textBaseline = "bottom";
                yOffset = -lineHeight * num;
                break;
            default:
                context.textBaseline = "middle";
                yOffset = -maxHeight / 2 - (lineHeight * num / 2);
                break;
        }

        var tmpWords = text.split("\n");
        for (var j = 0; j < tmpWords.length; j++) {
            var jOffset = j * lineHeight;
            var words = tmpWords[j].split(" ");
            var line = "";

            for (var n = 0; n < words.length; n++) {
                var testLine = line + words[n] + " ";
                var testWidth = context.measureText(testLine).width - context.measureText(" ").width;
                if (testWidth >= maxWidth) {
                    context.fillText(line, x + xOffset, y + yOffset + jOffset);
                    y += lineHeight;
                    line = words[n] + " ";
                }
                else {
                    line = testLine;
                }
                if (n == words.length - 1) {
                    context.fillText(line, x + xOffset, y + yOffset + jOffset);
                }
            }
            //context.fillText(tmpWords[j], x + xOffset, y + yOffset + j * lineHeight);
        }
    },
    _lineCount:function () {
        if (this._dimensions.width == 0) {
            return 1;
        }
        var context = cc.renderContext;
        var words = this._string.split(" ");
        var line = "", num = 0;
        cc.renderContext.save();
        for (var n = 0; n < words.length; n++) {
            var tmpLine = line + words[n] + " ";
            var tmpWidth = context.measureText(tmpLine).width - context.measureText(" ").width;
            if (tmpWidth >= this._dimensions.width) {
                num++;
                line = words[n] + " ";
            }
            else {
                line = tmpLine;
            }
            if (n == words.length - 1) {
                num++;
            }
        }
        cc.renderContext.restore();
        return num;
    },
    _updateTTF:function () {
        cc.renderContext.save();
        this._fontStyleStr = this._fontSize + "px '" + this._fontName + "'";
        cc.renderContext.font = this._fontStyleStr;
        var dim = cc.renderContext.measureText(this._string);
        this.setContentSize(new cc.Size(dim.width, this._fontSize));
        cc.renderContext.restore();
        this.setNodeDirty();
    }
});

/**
 * creates a cc.LabelTTF from a fontname, alignment, dimension and font size
 * @param {String} label
 * @param {cc.Size} dimensions
 * @param {cc.TEXT_ALIGNMENT_LEFT|cc.TEXT_ALIGNMENT_CENTER|cc.TEXT_ALIGNMENT_RIGHT} alignment
 * @param {String} fontName
 * @param {Number} fontSize
 * @return {cc.LabelTTF|Null}
 * @example
 * // Example
 * var myLabel = cc.LabelTTF.create('label text', cc.SizeMake(32,16), cc.TEXT_ALIGNMENT_LEFT, 'Times New Roman', 32);
 */
cc.LabelTTF.create = function (/* Multi arguments */) {
    var ret = new cc.LabelTTF();
    if (ret.initWithString(arguments)) {
        return ret;
    }
    return null;
};

cc.LabelTTF.node = function () {
    return cc.LabelTTF.create();
};

cc.LabelNode = function (pos, text, align) {
    this.pos = pos;
    this.text = text;
    this.align = align;
};
