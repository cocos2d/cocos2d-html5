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

if (cc._renderType === cc._RENDER_TYPE_CANVAS) {

    var _p = cc.LabelTTF.prototype;

    _p.setColor = function (color3) {
        cc.NodeRGBA.prototype.setColor.call(this, color3);

        this._setColorsString();
    };

    _p._setColorsString = function () {
        this._needUpdateTexture = true;

        var locDisplayColor = this._displayedColor, locDisplayedOpacity = this._displayedOpacity;
        var locStrokeColor = this._strokeColor, locFontFillColor = this._textFillColor;

        this._shadowColorStr = "rgba(" + (0 | (locDisplayColor.r * 0.5)) + "," + (0 | (locDisplayColor.g * 0.5)) + "," + (0 | (locDisplayColor.b * 0.5)) + "," + this._shadowOpacity + ")";
        this._fillColorStr = "rgba(" + (0 | (locDisplayColor.r /255 * locFontFillColor.r)) + "," + (0 | (locDisplayColor.g / 255 * locFontFillColor.g)) + ","
            + (0 | (locDisplayColor.b / 255 * locFontFillColor.b)) + ", " + locDisplayedOpacity / 255 + ")";
        this._strokeColorStr = "rgba(" + (0 | (locDisplayColor.r / 255 * locStrokeColor.r)) + "," + (0 | (locDisplayColor.g / 255 * locStrokeColor.g)) + ","
            + (0 | (locDisplayColor.b / 255 * locStrokeColor.b)) + ", " + locDisplayedOpacity / 255 + ")";
    };

    _p.updateDisplayedColor = function(parentColor){
        cc.NodeRGBA.prototype.updateDisplayedColor.call(this,parentColor);
        this._setColorsString();
    };

    _p.setOpacity = function (opacity) {
        if (this._opacity === opacity)
            return;
        cc.Sprite.prototype.setOpacity.call(this, opacity);
        this._setColorsString();
        this._needUpdateTexture = true;
    };

    //TODO: _p._updateDisplayedOpacityForCanvas
    _p.updateDisplayedOpacity = cc.Sprite.prototype.updateDisplayedOpacity;

    _p.initWithStringAndTextDefinition = function(text, textDefinition){
        if(!cc.Sprite.prototype.init.call(this))
            return false;

        // prepare everything needed to render the label
        this._updateWithTextDefinition(textDefinition, false);

        // set the string
        this.string = text;

        return true;
    };

    _p.setFontFillColor = function (tintColor) {
        var locTextFillColor = this._textFillColor;
        if (locTextFillColor.r != tintColor.r || locTextFillColor.g != tintColor.g || locTextFillColor.b != tintColor.b) {
            locTextFillColor.r = tintColor.r;
            locTextFillColor.g = tintColor.g;
            locTextFillColor.b = tintColor.b;

            this._setColorsString();
            this._needUpdateTexture = true;
        }
    };

    _p.draw = cc.Sprite.prototype.draw;

    _p.setTextureRect = function (rect, rotated, untrimmedSize) {
        this._rectRotated = rotated || false;
        untrimmedSize = untrimmedSize || rect;

        this.setContentSize(untrimmedSize);
        this.setVertexRect(rect);

        var locTextureCoordRect = this._textureRect_Canvas;
        locTextureCoordRect.x = rect.x;
        locTextureCoordRect.y = rect.y;
        locTextureCoordRect.width = rect.width;
        locTextureCoordRect.height = rect.height;
        locTextureCoordRect.validRect = !(locTextureCoordRect.width === 0 || locTextureCoordRect.height === 0
            || locTextureCoordRect.x < 0 || locTextureCoordRect.y < 0);

        var relativeOffset = this._unflippedOffsetPositionFromCenter;
        if (this._flippedX)
            relativeOffset.x = -relativeOffset.x;
        if (this._flippedY)
            relativeOffset.y = -relativeOffset.y;
        this._offsetPosition.x = relativeOffset.x + (this._contentSize.width - this._rect.width) / 2;
        this._offsetPosition.y = relativeOffset.y + (this._contentSize.height - this._rect.height) / 2;

        // rendering using batch node
        if (this._batchNode) {
            this.dirty = true;
        }
    };

}
