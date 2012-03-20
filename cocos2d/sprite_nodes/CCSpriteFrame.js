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
    _m_obRectInPixels:new cc.Rect(),
    _m_bRotated:null,
    _m_obRect:new cc.Rect(),
    _m_obOffsetInPixels:new  cc.Point(),
    _m_obOriginalSizeInPixels:new cc.Size(),
    _m_pobTexture:new cc.Texture2D(),
    // attributes
    getRectInPixels:function () {
        return this._m_obRectInPixels;
    },
    setRectInPixels:function (rectInPixels) {
        this._m_obRectInPixels = rectInPixels;
        this._m_obRect = cc.RECT_PIXELS_TO_POINTS(rectInPixels);
    },
    isRotated:function () {
        return this._m_bRotated;
    },
    setRotated:function (bRotated) {
        this._m_bRotated = bRotated;
    },
    /** get rect of the frame */
    getRect:function () {
        return this._m_obRect;
    },
    /** set rect of the frame */
    setRect:function (rect) {
        this._m_obRect = rect;
        this._m_obRectInPixels = cc.RECT_POINTS_TO_PIXELS(this._m_obRect);
    },
    /** get offset of the frame */
    getOffsetInPixels:function () {
        return this._m_obOffsetInPixels;
    },
    /** set offset of the frame */
    setOffsetInPixels:function (offsetInPixels) {
        this._m_obOffsetInPixels = offsetInPixels;
    },
    /** get original size of the trimmed image */
    getOriginalSizeInPixels:function () {
        return this._m_obOriginalSizeInPixels;
    },
    /** set original size of the trimmed image */
    setOriginalSizeInPixels:function (sizeInPixels) {
        this._m_obOriginalSizeInPixels = sizeInPixels;
    },
    /** get texture of the frame */
    getTexture:function () {
        return this._m_pobTexture;
    },
    /** set texture of the frame, the texture is retained */
    setTexture:function (pobTexture) {
        this._m_pobTexture = pobTexture;
    },
    copyWithZone:function () {
        var pCopy = new cc.SpriteFrame();
        pCopy.initWithTexture(this._m_pobTexture, this._m_obRectInPixels, this._m_bRotated, this._m_obOffsetInPixels, this._m_obOriginalSizeInPixels);
        return pCopy;
    },
    initWithTexture:function (pobTexture, rect, rotated, offset, originalSize) {
        var argnum = arguments.length;
        switch (argnum) {
        /** Initializes a cc.SpriteFrame with a texture, rect in points.
         It is assumed that the frame was not trimmed.
         */
            case 2:
                var rectInPixels = new cc.Rect();
                rectInPixels = cc.RECT_POINTS_TO_PIXELS(rect);
                return this.initWithTexture(pobTexture, rectInPixels, false, cc.PointZero, rectInPixels.size);
                break;

        /** Initializes a cc.SpriteFrame with a texture, rect, rotated, offset and originalSize in pixels.
         The originalSize is the size in points of the frame before being trimmed.
         */
            case 5:
                this._m_pobTexture = pobTexture;
                this._m_obRectInPixels = rect;
                this._m_obRect = cc.RECT_PIXELS_TO_POINTS(rect);
                this._m_bRotated = rotated;
                this._m_obOffsetInPixels = offset;
                this._m_obOriginalSizeInPixels = originalSize;
                return true;
                break;

            default:
                throw "Argument must be non-nil ";
                break;
        }
    }
});

cc.SpriteFrame.frameWithTexture = function (pobTexture, rect, rotated, offset, originalSize) {
    var argnum = arguments.length;
    var pSpriteFrame = new cc.SpriteFrame();
    switch (argnum) {
    /** Create a cc.SpriteFrame with a texture, rect in points.
     It is assumed that the frame was not trimmed.
     */
        case 2:
            pSpriteFrame.initWithTexture(pobTexture, rect);
            break;
    /** Create a cc.SpriteFrame with a texture, rect, rotated, offset and originalSize in pixels.
     The originalSize is the size in points of the frame before being trimmed.
     */
        case 5:
            pSpriteFrame.initWithTexture(pobTexture, rect, rotated, offset, originalSize);
            break;
        default:
            throw "Argument must be non-nil ";
            break;
    }
    return pSpriteFrame;
};