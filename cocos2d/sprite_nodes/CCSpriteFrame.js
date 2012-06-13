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
 * <p>
 *    A cc.SpriteFrame has:<br/>
 *      - texture: A cc.Texture2D that will be used by the cc.Sprite<br/>
 *      - rectangle: A rectangle of the texture<br/>
 *    <br/>
 *    You can modify the frame of a cc.Sprite by doing:<br/>
 * </p>
 * @class
 * @extends cc.Class
 *
 * @example
 * var texture = cc.TextureCache.sharedTextureCache().addImage(s_dragon_animation);
 * var frame0 = cc.SpriteFrame.create(texture, cc.RectMake(132 * 0, 132 * 0, 132, 132));
 */
cc.SpriteFrame = cc.Class.extend(/** @lends cc.SpriteFrame# */{
    _rectInPixels:new cc.Rect(),
    _rotated:null,
    _rect:new cc.Rect(),
    _offsetInPixels:new cc.Point(),
    _originalSizeInPixels:new cc.Size(),
    _texture:null,

    // attributes
    /**
     * @return {cc.Rect}
     */
    getRectInPixels:function () {
        return this._rectInPixels;
    },

    /**
     * @param {cc.Rect} rectInPixels
     */
    setRectInPixels:function (rectInPixels) {
        this._rectInPixels = rectInPixels;
        this._rect = cc.RECT_PIXELS_TO_POINTS(rectInPixels);
    },

    /**
     * <p>
     *     return is rotated of SpriteFrame. <br/>
     * </p>
     * @return {Boolean}
     */
    isRotated:function () {
        return this._rotated;
    },

    /**
     * set SpriteFrame is rotated
     * @param {Boolean} bRotated
     */
    setRotated:function (bRotated) {
        this._rotated = bRotated;
    },

    /**
     * get rect of the frame
     * @return {cc.Rect}
     */
    getRect:function () {
        return this._rect;
    },

    /**
     * set rect of the frame
     * @param {cc.Rect} rect
     */
    setRect:function (rect) {
        this._rect = rect;
        this._rectInPixels = cc.RECT_POINTS_TO_PIXELS(this._rect);
    },

    /**
     * get offset of the frame
     * @return {cc.Point}
     */
    getOffsetInPixels:function () {
        return this._offsetInPixels;
    },

    /**
     * set offset of the frame
     * @param {cc.Point} offsetInPixels
     */
    setOffsetInPixels:function (offsetInPixels) {
        this._offsetInPixels = offsetInPixels;
    },

    /**
     * get original size of the trimmed image
     * @return {cc.Size}
     */
    getOriginalSizeInPixels:function () {
        return this._originalSizeInPixels;
    },

    /**
     * set original size of the trimmed image
     * @param {cc.Size} sizeInPixels
     */
    setOriginalSizeInPixels:function (sizeInPixels) {
        this._originalSizeInPixels = sizeInPixels;
    },

    /**
     * get texture of the frame
     * @return {cc.Texture2D|HTMLImageElement}
     */
    getTexture:function () {
        return this._texture;
    },

    /**
     * set texture of the frame, the texture is retained
     * @param {cc.Texture2D|HTMLImageElement} texture
     */
    setTexture:function (texture) {
        this._texture = texture;
    },

    /**
     * copy a new SpriteFrame
     * @return {cc.SpriteFrame}
     */
    copyWithZone:function () {
        var copy = new cc.SpriteFrame();
        copy.initWithTexture(this._texture, this._rectInPixels, this._rotated, this._offsetInPixels, this._originalSizeInPixels);
        return copy;
    },

    /**
     * Initializes SpriteFrame with Texture, rect, rotated, offset and originalSize in pixels.
     * @param {cc.Texture2D|HTMLImageElement} texture
     * @param {cc.Rect} rect
     * @param {Boolean} rotated
     * @param {cc.Point} offset
     * @param {cc.Size} originalSize
     * @return {Boolean}
     */
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

/**
 * Create a cc.SpriteFrame with a texture, rect, rotated, offset and originalSize in pixels.
 * @param {cc.Texture2D|HTMLImageElement} texture
 * @param {cc.Rect} rect
 * @param {Boolean} rotated
 * @param {cc.Point} offset
 * @param {cc.Size} originalSize
 * @return {cc.SpriteFrame}
 * @example
 * //Create a cc.SpriteFrame with a texture, rect in texture.
 * var frame1 = cc.SpriteFrame.create("grossini_dance.png",new cc.Rect(0,0,90,128));
 *
 * //Create a cc.SpriteFrame with a texture, rect, rotated, offset and originalSize in pixels.
 * var frame2 = cc.SpriteFrame.create(texture, frameRect, rotated, offset, sourceSize);
 */
cc.SpriteFrame.create = function (texture, rect, rotated, offset, originalSize) {
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

cc.SpriteFrame._frameWithTextureForCanvas = function (texture, rect, rotated, offset, originalSize) {
    var spriteFrame = new cc.SpriteFrame();
    spriteFrame._texture = texture;
    spriteFrame._rectInPixels = rect;
    spriteFrame._rect = cc.RECT_PIXELS_TO_POINTS(rect);
    spriteFrame._rotated = rotated;
    spriteFrame._offsetInPixels = offset;
    spriteFrame._originalSizeInPixels = originalSize;
    return spriteFrame;
};