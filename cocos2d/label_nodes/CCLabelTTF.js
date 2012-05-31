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
    _dimensions:null,
    _alignment:cc.TextAlignmentCenter,
    _fontName:"Arial",
    _fontSize:0.0,
    _string:null,
    ctor:function () {
        this._super();
        this._string = "";
        this._color = cc.WHITE();
        this._opacityModifyRGB = false;
    },
    description:function () {
        return "<CCLabelTTF | FontName =" + this._fontName + " FontSize = " + this._fontSize.toFixed(1) + ">";
    },

    /** initializes the CCLabelTTF with a font name, alignment, dimension and font size */
    initWithString:function (label, dimensions, alignment, fontName, fontSize) {
        cc.Assert(label != null, "cc.LabelTTF.initWithString() label is null");
        if (arguments.length > 3) {
            if (this.init()) {
                this._dimensions = cc.SizeMake(dimensions.width * cc.CONTENT_SCALE_FACTOR(), dimensions.height * cc.CONTENT_SCALE_FACTOR());
                this._alignment = alignment;
                this._fontName = fontName;
                this._fontSize = fontSize * cc.CONTENT_SCALE_FACTOR();
                this.setString(label);
                return true;
            }
            return false;
        } else {
            fontName = arguments[1];
            fontSize = arguments[2];

            if (this.init()) {
                this._dimensions = cc.SizeZero();
                this._fontName = fontName;
                this._fontSize = fontSize * cc.CONTENT_SCALE_FACTOR();
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
        this._string = label;
        cc.renderContext.save();
        cc.renderContext.font = this._fontSize + "px '" + this._fontName + "'";
        var dim = cc.renderContext.measureText(this._string);
        this.setContentSize(new cc.Size(dim.width, this._fontSize));
        cc.renderContext.restore();
        this.setNodeDirty();
        return;

        var texture = new cc.Texture2D();
        if (cc.Size.CCSizeEqualToSize(this._dimensions, cc.SizeZero())) {
            texture.initWithString(label, this._fontName, this._fontSize);
        } else {
            texture = new cc.Texture2D();
            texture.initWithString(label, this._dimensions, this._alignment, this._fontName, this._fontSize);
        }
        this.setTexture(texture);

        var rect = cc.RectZero();
        rect.size = this._texture.getContentSize();
        this.setTextureRect(rect);
    },

    //temp method
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
            var color = this.getColor();
            context.fillStyle = "rgba(" + color.r + "," + color.g + "," + color.b + ", " + this.getOpacity() / 255 + ")";
            context.font = this._fontSize + "px '" + this._fontName + "'";

            var offset = 0;
            switch (this._alignment) {
                case cc.TextAlignmentLeft:
                    offset = -(this._dimensions.width - this._contentSize.width) / 2;
                    break;
                case cc.TextAlignmentRight:
                    offset = (this._dimensions.width - this._contentSize.width) / 2;
                    break;
                default:
                    break;
            }

            if (this._contentSize.width > this._dimensions.width && this._dimensions.width !== 0) {
                this._wrapText(context, this._string,
                    -this._dimensions.width * this._anchorPoint.x,
                    -this._dimensions.height * this._anchorPoint.y,
                    this._dimensions.width,
                    this._fontSize * 1.2,
                    this._alignment);
            }
            else {
                context.fillText(this._string,
                    -this._contentSize.width * this._anchorPoint.x + offset,
                    this._contentSize.height * this._anchorPoint.y);
            }
        }
    },
    _wrapText:function (context, text, x, y, maxWidth, lineHeight, texAlign) {
        var words = text.split(" ");
        var line = "";
        for (var n = 0; n < words.length; n++) {
            var testLine = line + words[n] + " ";
            var testWidth = context.measureText(testLine).width - context.measureText(" ").width;
            if (testWidth >= maxWidth) {
                var temWidth = testWidth - context.measureText(words[n]).width - 2 * context.measureText(" ").width;
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
                context.fillText(line, x + offset, y );
                y+=lineHeight;
                line = words[n] + " ";
            }
            else {
                line = testLine;
                if(n == words.length-1){
                context.fillText(line, x + offset, y );
                }
            }

        }
    },
    getString:function () {
        return this._string;
    },

    convertToLabelProtocol:function () {
        return this;
    }
});

/** creates a CCLabelTTF from a fontname, alignment, dimension and font size */
cc.LabelTTF.labelWithString = function (label, dimensions, alignment, fontName, fontSize) {
    var ret = new cc.LabelTTF();
    if (arguments.length > 3) {
        if ((ret != null) && (ret.initWithString(label, dimensions, alignment, fontName, fontSize))) {
            return ret;
        }
        return null;
    } else {
        fontName = arguments[1];
        fontSize = arguments[2];
        if ((ret != null) && (ret.initWithString(label, fontName, fontSize))) {
            return ret;
        }

        return null;
    }
}