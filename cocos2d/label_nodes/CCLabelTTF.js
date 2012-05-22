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

/**
 * @brief CCLabelTTF is a subclass of CCTextureNode that knows how to render text labels
 *
 * All features from CCTextureNode are valid in CCLabelTTF
 *
 * CCLabelTTF objects are slow. Consider using CCLabelAtlas or CCLabelBMFont instead.
 */
cc.LabelTTF = cc.Sprite.extend({
    _m_tDimensions:null,
    _m_eAlignment:cc.TextAlignmentCenter,
    _m_pFontName:"Arial",
    _m_fFontSize:0.0,
    _m_pString:null,
    ctor:function () {
        this._super();
        this._m_pString = "";
        this._m_sColor = cc.WHITE();
        this._m_bOpacityModifyRGB = false;
    },
    description:function () {
        return "<CCLabelTTF | FontName =" + this._m_pFontName + " FontSize = " + this._m_fFontSize.toFixed(1) + ">";
    },

    /** initializes the CCLabelTTF with a font name, alignment, dimension and font size */
    initWithString:function (label, dimensions, alignment, fontName, fontSize) {
        cc.Assert(label != null, "cc.LabelTTF.initWithString() label is null");
        if (arguments.length > 3) {
            if (this.init()) {
                this._m_tDimensions = cc.SizeMake(dimensions.width * cc.CONTENT_SCALE_FACTOR(), dimensions.height * cc.CONTENT_SCALE_FACTOR());
                this._m_eAlignment = alignment;
                this._m_pFontName = fontName;
                this._m_fFontSize = fontSize * cc.CONTENT_SCALE_FACTOR();
                this.setString(label);
                return true;
            }
            return false;
        } else {
            fontName = arguments[1];
            fontSize = arguments[2];

            if (this.init()) {
                this._m_tDimensions = cc.SizeZero();
                this._m_pFontName = fontName;
                this._m_fFontSize = fontSize * cc.CONTENT_SCALE_FACTOR();
                this.setString(label);
                return true;
            }
            return false;
        }
    },

    /** changes the string to render
     * @warning Changing the string is as expensive as creating a new CCLabelTTF. To obtain better performance use CCLabelAtlas
     */
    setString:function (label) {
        this._m_pString = label;
        cc.renderContext.save();
        cc.renderContext.font = this._m_fFontSize + "px '" + this._m_pFontName + "'";
        var dim = cc.renderContext.measureText(this._m_pString);
        this.setContentSize(new cc.Size(dim.width, this._m_fFontSize));
        cc.renderContext.restore();
        this.setNodeDirty();
        return;

        var texture = new cc.Texture2D();
        if (cc.Size.CCSizeEqualToSize(this._m_tDimensions, cc.SizeZero())) {
            texture.initWithString(label, this._m_pFontName, this._m_fFontSize);
        } else {
            texture = new cc.Texture2D();
            texture.initWithString(label, this._m_tDimensions, this._m_eAlignment, this._m_pFontName, this._m_fFontSize);
        }
        this.setTexture(texture);

        var rect = cc.RectZero();
        rect.size = this._m_pobTexture.getContentSize();
        this.setTextureRect(rect);
    },

    //temp method
    draw:function (ctx) {
        if (cc.renderContextType == cc.kCanvas) {
            var context = ctx || cc.renderContext;
            if (this._m_bFlipX) {
                context.scale(-1, 1);
            }
            if (this._m_bFlipY) {
                context.scale(1, -1);
            }
            //this is fillText for canvas
            var color = this.getColor();
            context.fillStyle = "rgba(" + color.r + "," + color.g + "," + color.b + ", " + this.getOpacity() / 255 + ")";
            context.font = this._m_fFontSize + "px '" + this._m_pFontName + "'";

            var offset = 0;
            switch (this._m_eAlignment) {
                case cc.TextAlignmentLeft:
                    offset = -(this._m_tDimensions.width - this._m_tContentSize.width) / 2;
                    break;
                case cc.TextAlignmentRight:
                    offset = (this._m_tDimensions.width - this._m_tContentSize.width) / 2;
                    break;
                default:
                    break;
            }

            if (this._m_tContentSize.width > this._m_tDimensions.width && this._m_tDimensions.width !== 0) {
                this._wrapText(context, this._m_pString,
                    -this._m_tDimensions.width * this._m_tAnchorPoint.x,
                    this._m_tDimensions.height * this._m_tAnchorPoint.y,
                    this._m_tDimensions.width,
                    this._m_fFontSize,
                    this._m_eAlignment);
            }
            else {
                context.fillText(this._m_pString,
                    -this._m_tContentSize.width * this._m_tAnchorPoint.x + offset,
                    this._m_tContentSize.height * this._m_tAnchorPoint.y);
            }
        }
    },
    _wrapText:function (context, text, x, y, maxWidth, lineHeight, texAlign) {
        var words = text.split(" ");
        var line = "";

        for (var n = 0; n < words.length; n++) {
            var testLine = line + words[n] + " ";
            var testWidth = context.measureText(testLine).width;
            if (testWidth >= maxWidth) {
                var temWidth = testWidth - context.measureText(words[n]).width - 2 * context.measureText(" ").width;
                //console.log(testWidth)
                var offset;
                switch (texAlign) {
                    case cc.TextAlignmentLeft:
                        offset = 0
                        break;
                    case cc.TextAlignmentRight:
                        offset = maxWidth - temWidth;
                        break;
                    default:
                        offset = (maxWidth - temWidth) / 2;
                        break;
                }
                context.fillText(line, x + offset, y - lineHeight * (words.length / 2 - 2));

                line = words[n] + " ";
                y += lineHeight;
            }
            else {
                line = testLine;
            }
        }
    },
    getString:function () {
        return this._m_pString;
    },

    convertToLabelProtocol:function () {
        return this;
    }
});

/** creates a CCLabelTTF from a fontname, alignment, dimension and font size */
cc.LabelTTF.labelWithString = function (label, dimensions, alignment, fontName, fontSize) {
    var pRet = new cc.LabelTTF();
    if (arguments.length > 3) {
        if ((pRet != null) && (pRet.initWithString(label, dimensions, alignment, fontName, fontSize))) {
            return pRet;
        }
        return null;
    } else {
        fontName = arguments[1];
        fontSize = arguments[2];
        if ((pRet != null) && (pRet.initWithString(label, fontName, fontSize))) {
            return pRet;
        }

        return null;
    }
}