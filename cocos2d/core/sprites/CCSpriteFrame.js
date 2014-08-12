/****************************************************************************
 Copyright (c) 2008-2010 Ricardo Quesada
 Copyright (c) 2011-2012 cocos2d-x.org
 Copyright (c) 2013-2014 Chukong Technologies Inc.

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
 * var texture = cc.textureCache.addImage(s_dragon_animation);
 * var frame0 = cc.SpriteFrame.create(texture, cc.rect(132 * 0, 132 * 0, 132, 132));
 */
cc.SpriteFrame = cc.Class.extend(/** @lends cc.SpriteFrame# */{
    _offset:null,
    _originalSize:null,
    _rectInPixels:null,
    _rotated:false,
    _rect:null,
    _offsetInPixels:null,
    _originalSizeInPixels:null,
    _texture:null,
    _textureFilename:"",
    _textureLoaded:false,
    _eventListeners:null,

    /**
     * <p>
     *    Create a cc.SpriteFrame with a texture filename, rect, rotated, offset and originalSize in pixels.<br/>
     *    The originalSize is the size in pixels of the frame before being trimmed.                         <br/>
     *    Constructor of cc.SpriteFrame
     * </p>
     *
     * @param {String|cc.Texture2D} filename
     * @param {cc.Rect} rect if parameters' length equal 2, rect in points, else rect in pixels
     * @param {Boolean} rotated
     * @param {cc.Point} offset
     * @param {cc.Size} originalSize
     * @example
     * // 1.Create a cc.SpriteFrame with image path
     * var frame1 = new cc.SpriteFrame("res/grossini_dance.png",cc.rect(0,0,90,128));
     * var frame2 = new cc.SpriteFrame("res/grossini_dance.png",cc.rect(0,0,90,128),false,0,cc.size(90,128));
     *
     * // 2.Create a cc.SpriteFrame with a texture, rect, rotated, offset and originalSize in pixels.
     * var texture = cc.textureCache.addImage("res/grossini_dance.png");
     * var frame1 = new cc.SpriteFrame(texture, cc.rect(0,0,90,128));
     * var frame2 = new cc.SpriteFrame(texture, cc.rect(0,0,90,128),false,0,cc.size(90,128));
     */
    ctor:function (filename, rect, rotated, offset, originalSize) {
        this._offset = cc.p(0, 0);
        this._offsetInPixels = cc.p(0, 0);
        this._originalSize = cc.size(0, 0);
        this._rotated = false;
        this._originalSizeInPixels = cc.size(0, 0);
        this._textureFilename = "";
        this._texture = null;
        this._textureLoaded = false;

        if(filename !== undefined && rect !== undefined ){
            if(rotated === undefined || offset === undefined || originalSize === undefined){
                this.initWithTexture(filename, rect);
            }
            else{
                this.initWithTexture(filename, rect, rotated, offset, originalSize)
            }
        }
    },

    // attributes
    textureLoaded:function(){
        return this._textureLoaded;
    },

    addLoadedEventListener:function(callback, target){
        if (this._eventListeners == null){
           this._eventListeners = [];
        }
        this._eventListeners.push({eventCallback:callback, eventTarget:target});
    },

    _callLoadedEventCallbacks:function(){
        var locListeners = this._eventListeners;
        if (!locListeners) return;
        for(var i = 0, len = locListeners.length;  i < len; i++){
            var selCallback = locListeners[i];
            selCallback.eventCallback.call(selCallback.eventTarget, this);
        }
        locListeners.length = 0;
    },

    /**
     * @return {cc.Rect}
     */
    getRectInPixels:function () {
        var locRectInPixels = this._rectInPixels;
        return cc.rect(locRectInPixels.x, locRectInPixels.y, locRectInPixels.width, locRectInPixels.height);
    },

    /**
     * @param {cc.Rect} rectInPixels
     */
    setRectInPixels:function (rectInPixels) {
        if (!this._rectInPixels){
            this._rectInPixels = cc.rect(0,0,0,0);
        }
        this._rectInPixels.x = rectInPixels.x;
        this._rectInPixels.y = rectInPixels.y;
        this._rectInPixels.width = rectInPixels.width;
        this._rectInPixels.height = rectInPixels.height;
        this._rect = cc.rectPixelsToPoints(rectInPixels);
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
        var locRect = this._rect;
        return cc.rect(locRect.x, locRect.y, locRect.width, locRect.height);
    },

    /**
     * set rect of the frame
     * @param {cc.Rect} rect
     */
    setRect:function (rect) {
        if (!this._rect){
            this._rect = cc.rect(0,0,0,0);
        }
        this._rect.x = rect.x;
        this._rect.y = rect.y;
        this._rect.width = rect.width;
        this._rect.height = rect.height;
        this._rectInPixels = cc.rectPointsToPixels(this._rect);
    },

    /**
     * get offset of the frame
     * @return {cc.Point}
     */
    getOffsetInPixels:function () {
        return cc.p(this._offsetInPixels);
    },

    /**
     * set offset of the frame
     * @param {cc.Point} offsetInPixels
     */
    setOffsetInPixels:function (offsetInPixels) {
        this._offsetInPixels.x = offsetInPixels.x;
        this._offsetInPixels.y = offsetInPixels.y;
        cc._pointPixelsToPointsOut(this._offsetInPixels, this._offset);
    },

    /**
     * get original size of the trimmed image
     * @const
     * @return {cc.Size}
     */
    getOriginalSizeInPixels:function () {
        return cc.size(this._originalSizeInPixels);
    },

    /**
     * set original size of the trimmed image
     * @param {cc.Size} sizeInPixels
     */
    setOriginalSizeInPixels:function (sizeInPixels) {
        this._originalSizeInPixels.width = sizeInPixels.width;
        this._originalSizeInPixels.height = sizeInPixels.height;
    },

    /**
     * get original size of the trimmed image
     * @const
     * @return {cc.Size}
     */
    getOriginalSize:function () {
        return cc.size(this._originalSize);
    },

    /**
     * set original size of the trimmed image
     * @param {cc.Size} sizeInPixels
     */
    setOriginalSize:function (sizeInPixels) {
        this._originalSize.width = sizeInPixels.width;
        this._originalSize.height = sizeInPixels.height;
    },

    /**
     * get texture of the frame
     * @return {cc.Texture2D}
     */
    getTexture:function () {
        if (this._texture)
            return this._texture;
        if (this._textureFilename !== "") {
            var locTexture = cc.textureCache.addImage(this._textureFilename);
            if (locTexture)
                this._textureLoaded = locTexture.isLoaded();
            return locTexture;
        }
        return null;
    },

    /**
     * set texture of the frame, the texture is retained
     * @param {cc.Texture2D} texture
     */
    setTexture:function (texture) {
        if (this._texture != texture) {
            var locLoaded = texture.isLoaded();
            this._textureLoaded = locLoaded;
            this._texture = texture;
            if(!locLoaded){
                texture.addLoadedEventListener(function(sender){
                    this._textureLoaded = true;
                    if(this._rotated && cc._renderType === cc._RENDER_TYPE_CANVAS){
                        var tempElement = sender.getHtmlElementObj();
                        tempElement = cc.cutRotateImageToCanvas(tempElement, this.getRect());
                        var tempTexture = new cc.Texture2D();
                        tempTexture.initWithElement(tempElement);
                        tempTexture.handleLoadedTexture();
                        this.setTexture(tempTexture);

                        var rect = this.getRect();
                        this.setRect(cc.rect(0, 0, rect.width, rect.height));
                    }
                    var locRect = this._rect;
                    if(locRect.width === 0 && locRect.height === 0){
                        var w = sender.width, h = sender.height;
                        this._rect.width = w;
                        this._rect.height = h;
                        this._rectInPixels = cc.rectPointsToPixels(this._rect);
                        this._originalSizeInPixels.width = this._rectInPixels.width;
                        this._originalSizeInPixels.height = this._rectInPixels.height;
                        this._originalSize.width =  w;
                        this._originalSize.height =  h;
                    }
                    this._callLoadedEventCallbacks();
                }, this);
            }
        }
    },

    /**
     * Offset getter
     * @const
     * @return {cc.Point}
     */
    getOffset:function () {
        return cc.p(this._offset);
    },

    /**
     * offset setter
     * @param {cc.Point} offsets
     */
    setOffset:function (offsets) {
        this._offset.x = offsets.x;
        this._offset.y = offsets.y;
    },

    clone: function(){
        var frame = new cc.SpriteFrame();
        frame.initWithTexture(this._textureFilename, this._rectInPixels, this._rotated, this._offsetInPixels, this._originalSizeInPixels);
        frame.setTexture(this._texture);
        return frame;
    },

    /**
     * copy a new SpriteFrame
     * @return {cc.SpriteFrame}
     */
    copyWithZone:function () {
        var copy = new cc.SpriteFrame();
        copy.initWithTexture(this._textureFilename, this._rectInPixels, this._rotated, this._offsetInPixels, this._originalSizeInPixels);
        copy.setTexture(this._texture);
        return copy;
    },

    copy:function () {
        return this.copyWithZone();
    },

    /**
     * Initializes SpriteFrame with Texture, rect, rotated, offset and originalSize in pixels.
     * @param {String|cc.Texture2D} texture
     * @param {cc.Rect} rect if parameters' length equal 2, rect in points, else rect in pixels
     * @param {Boolean} [rotated=false]
     * @param {cc.Point} [offset=cc.p(0,0)]
     * @param {cc.Size} [originalSize=rect.size]
     * @return {Boolean}
     */
    initWithTexture:function (texture, rect, rotated, offset, originalSize) {
        if(arguments.length === 2)
            rect = cc.rectPointsToPixels(rect);

        offset = offset || cc.p(0, 0);
        originalSize = originalSize || rect;
        rotated = rotated || false;

        if (typeof(texture) == "string"){
            this._texture = null;
            this._textureFilename = texture;
        } else if (texture instanceof cc.Texture2D){
            this.setTexture(texture);
        }

        texture = this.getTexture();
        if(texture && texture.url) {
            var _x, _y;
            if(rotated){
                _x = rect.x + rect.height;
                _y = rect.y + rect.width;
            }else{
                _x = rect.x + rect.width;
                _y = rect.y + rect.height;
            }
            if(_x > texture.width){
                cc.error(cc._LogInfos.RectWidth, texture.url);
            }
            if(_y > texture.height){
                cc.error(cc._LogInfos.RectHeight, texture.url);
            }
        }

        this._rectInPixels = rect;
        this._rect = cc.rectPixelsToPoints(rect);
        this._offsetInPixels.x = offset.x;
        this._offsetInPixels.y = offset.y;
        cc._pointPixelsToPointsOut(offset, this._offset);
        this._originalSizeInPixels.width = originalSize.width;
        this._originalSizeInPixels.height = originalSize.height;
        cc._sizePixelsToPointsOut(originalSize, this._originalSize);
        this._rotated = rotated;
        return true;
    }
});

/**
 * <p>
 *    Create a cc.SpriteFrame with a texture filename, rect, rotated, offset and originalSize in pixels.<br/>
 *    The originalSize is the size in pixels of the frame before being trimmed.
 * </p>
 * @deprecated
 * @param {String|cc.Texture2D} filename
 * @param {cc.Rect} rect if parameters' length equal 2, rect in points, else rect in pixels
 * @param {Boolean} rotated
 * @param {cc.Point} offset
 * @param {cc.Size} originalSize
 * @return {cc.SpriteFrame}
 * @example
 * 1.
 * //Create a cc.SpriteFrame with image path
 * var frame1 = cc.SpriteFrame.create("res/grossini_dance.png",cc.rect(0,0,90,128));
 * var frame2 = cc.SpriteFrame.create("res/grossini_dance.png",cc.rect(0,0,90,128),false,0,cc.size(90,128));
 *
 * 2.
 * //Create a cc.SpriteFrame with a texture, rect, rotated, offset and originalSize in pixels.
 * var texture = cc.textureCache.addImage("res/grossini_dance.png");
 * var frame1 = cc.SpriteFrame.create(texture, cc.rect(0,0,90,128));
 * var frame2 = cc.SpriteFrame.create(texture, cc.rect(0,0,90,128),false,0,cc.size(90,128));
 */
cc.SpriteFrame.create = function (filename, rect, rotated, offset, originalSize) {
    return new cc.SpriteFrame(filename,rect,rotated,offset,originalSize);
};

/**
 * @deprecated
 * @type {Function}
 */
cc.SpriteFrame.createWithTexture = cc.SpriteFrame.create;

cc.SpriteFrame._frameWithTextureForCanvas = function (texture, rect, rotated, offset, originalSize) {
    var spriteFrame = new cc.SpriteFrame();
    spriteFrame._texture = texture;
    spriteFrame._rectInPixels = rect;
    spriteFrame._rect = cc.rectPixelsToPoints(rect);
    spriteFrame._offsetInPixels.x = offset.x;
    spriteFrame._offsetInPixels.y = offset.y;
    cc._pointPixelsToPointsOut(spriteFrame._offsetInPixels, spriteFrame._offset);
    spriteFrame._originalSizeInPixels.width = originalSize.width;
    spriteFrame._originalSizeInPixels.height = originalSize.height;
    cc._sizePixelsToPointsOut(spriteFrame._originalSizeInPixels, spriteFrame._originalSize);
    spriteFrame._rotated = rotated;
    return spriteFrame;
};
