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
    _m_pFontName:null,
    _m_fFontSize:0.0,
    _m_pString:null,

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
    draw:function () {
        //this is fillText for canvas
        var color = this.getColor();
        cc.renderContext.fillStyle = "rgba(" + color.r + "," + color.g + "," + color.b + ", " + this.getOpacity()/255 + ")";
        cc.renderContext.font = this._m_fFontSize + "px '" + this._m_pFontName + "'";
        var dim = cc.renderContext.measureText(this._m_pString);
        cc.drawingUtil.fillText(this._m_pString,0 - (dim.width * this.getAnchorPoint().x),
            0 - (this._m_fFontSize * this.getAnchorPoint().y));
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
};