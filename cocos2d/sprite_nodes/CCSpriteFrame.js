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

/** @brief A cc.SpriteFrame has:
 - texture: A cc.Texture2D that will be used by the cc.Sprite
 - rectangle: A rectangle of the texture

 You can modify the frame of a cc.Sprite by doing:

 var frame = cc.SpriteFrame.frameWithTexture(texture, rect, offset);
 sprite.setDisplayFrame(frame);
 */
cc.SpriteFrame = cc.Class.extend({
    _rectInPixels:new cc.Rect(),
    _rotated:null,
    _rect:new cc.Rect(),
    _offsetInPixels:new cc.Point(),
    _originalSizeInPixels:new cc.Size(),
    _texture:null,
    // attributes
    getRectInPixels:function () {
        return this._rectInPixels;
    },
    setRectInPixels:function (rectInPixels) {
        this._rectInPixels = rectInPixels;
        this._rect = cc.RECT_PIXELS_TO_POINTS(rectInPixels);
    },
    isRotated:function () {
        return this._rotated;
    },
    setRotated:function (bRotated) {
        this._rotated = bRotated;
    },
    /** get rect of the frame */
    getRect:function () {
        return this._rect;
    },
    /** set rect of the frame */
    setRect:function (rect) {
        this._rect = rect;
        this._rectInPixels = cc.RECT_POINTS_TO_PIXELS(this._rect);
    },
    /** get offset of the frame */
    getOffsetInPixels:function () {
        return this._offsetInPixels;
    },
    /** set offset of the frame */
    setOffsetInPixels:function (offsetInPixels) {
        this._offsetInPixels = offsetInPixels;
    },
    /** get original size of the trimmed image */
    getOriginalSizeInPixels:function () {
        return this._originalSizeInPixels;
    },
    /** set original size of the trimmed image */
    setOriginalSizeInPixels:function (sizeInPixels) {
        this._originalSizeInPixels = sizeInPixels;
    },
    /** get texture of the frame */
    getTexture:function () {
        return this._texture;
    },
    /** set texture of the frame, the texture is retained */
    setTexture:function (texture) {
        this._texture = texture;
    },
    copyWithZone:function () {
        var copy = new cc.SpriteFrame();
        copy.initWithTexture(this._texture, this._rectInPixels, this._rotated, this._offsetInPixels, this._originalSizeInPixels);
        return copy;
    },
    initWithTexture:function (texture, rect, rotated, offset, originalSize) {
        var argnum = arguments.length;
        switch (argnum) {
        /** Initializes a cc.SpriteFrame with a texture, rect in points.
         It is assumed that the frame was not trimmed.
         */
            case 2:
                var rectInPixels = cc.RECT_POINTS_TO_PIXELS(rect);
                return this.initWithTexture(texture, rectInPixels, false, cc.PointZero(), rectInPixels.size);
                break;

        /** Initializes a cc.SpriteFrame with a texture, rect, rotated, offset and originalSize in pixels.
         The originalSize is the size in points of the frame before being trimmed.
         */
            case 5:
                this._texture = texture;
                this._rectInPixels = rect;

                this._rect = cc.RECT_PIXELS_TO_POINTS(rect);
                this._rotated = rotated;
                this._offsetInPixels = offset;
                this._originalSizeInPixels = originalSize;
                return true;
                break;

            default:
                throw "Argument must be non-nil ";
                break;
        }
    }
});

cc.SpriteFrame.frameWithTexture = function (texture, rect, rotated, offset, originalSize) {
    var argnum = arguments.length;
    var spriteFrame = new cc.SpriteFrame();
    switch (argnum) {
    /** Create a cc.SpriteFrame with a texture, rect in points.
     It is assumed that the frame was not trimmed.
     */
        case 2:
            spriteFrame.initWithTexture(texture, rect);
            break;
    /** Create a cc.SpriteFrame with a texture, rect, rotated, offset and originalSize in pixels.
     The originalSize is the size in points of the frame before being trimmed.
     */
        case 5:
            spriteFrame.initWithTexture(texture, rect, rotated, offset, originalSize);
            break;
        default:
            throw "Argument must be non-nil ";
            break;
    }
    return spriteFrame;
};

cc.SpriteFrame.frameWithTextureForCanvas = function (texture, rect, rotated, offset, originalSize) {
    var spriteFrame = new cc.SpriteFrame();
    spriteFrame._texture = texture;
    spriteFrame._rectInPixels = rect;
    spriteFrame._rect = cc.RECT_PIXELS_TO_POINTS(rect);
    spriteFrame._rotated = rotated;
    spriteFrame._offsetInPixels = offset;
    spriteFrame._originalSizeInPixels = originalSize;
    return spriteFrame;
};