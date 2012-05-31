/****************************************************************************
 Copyright (c) 2010-2012 cocos2d-x.org
 Copyright (c) 2009      Jason Booth
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

cc.CCIMAGE_FORMAT_JPG = 0;
cc.CCIMAGE_FORMAT_PNG = 1;
cc.CCIMAGE_FORMAT_RAWDATA = 2;

cc.NextPOT = function (x) {
    x = x - 1;
    x = x | (x >> 1);
    x = x | (x >> 2);
    x = x | (x >> 4);
    x = x | (x >> 8);
    x = x | (x >> 16);
    return x + 1;
}

/**
 @brief CCRenderTexture is a generic rendering target. To render things into it,
 simply construct a render target, call begin on it, call visit on any cocos
 scenes or objects to render them, and call end. For convienience, render texture
 adds a sprite as it's display child with the results, so you can simply add
 the render texture to your scene and treat it like any other CocosNode.
 There are also functions for saving the render texture to disk in PNG or JPG format.

 @since v0.8.1
 */
cc.RenderTexture = cc.Node.extend({
    canvas:null,
    context:null,
    _fBO:0,
    _oldFBO:0,
    _texture:null,
    _uITextureImage:null,
    _pixelFormat:cc.CCTEXTURE_2D_PIXEL_FORMAT_RGBA8888,
    _sprite:null,
    ctor:function () {
        this.canvas = document.createElement('canvas');
        this.context = this.canvas.getContext('2d');
        this.setAnchorPoint(new cc.Point(0,0));
    },

    /** The CCSprite being used.
     The sprite, by default, will use the following blending function: GL_ONE, GL_ONE_MINUS_SRC_ALPHA.
     The blending function can be changed in runtime by calling:
     - [[renderTexture sprite] setBlendFunc:(ccBlendFunc){GL_ONE, GL_ONE_MINUS_SRC_ALPHA}];
     */
    getSprite:function () {
        return this._sprite;
    },
    setSprite:function (sprite) {
        this._sprite = sprite;
    },

    getCanvas:function(){
        return this.canvas;
    },

    setContentSize:function(size){
        if(!size){
            return ;
        }

        //if (!cc.Size.CCSizeEqualToSize(size, this._contentSize)) {
            this._super(size);
            this.canvas.width = size.width * 1.5;
            this.canvas.height = size.height * 1.5;

            this.context.translate(0,this.canvas.height);
        //}
    },

    /** initializes a RenderTexture object with width and height in Points and a pixel format, only RGB and RGBA formats are valid */
    initWithWidthAndHeight:function (width, height, format) {
        if(cc.renderContextType == cc.CANVAS){
            this.canvas.width = width||10;
            this.canvas.height = height||10;

            this.context.translate(0,this.canvas.height);
            return true;
        }
        //TODO
        // If the gles version is lower than GLES_VER_1_0,
        // some extended gles functions can't be implemented, so return false directly.
        if (cc.Configuration.sharedConfiguration().getGlesVersion() <= GLES_VER_1_0) {
            return false;
        }

        var ret = false;
        do
        {
            width *= cc.CONTENT_SCALE_FACTOR();
            height *= cc.CONTENT_SCALE_FACTOR();

            glGetIntegerv(cc.GL_FRAMEBUFFER_BINDING, this._oldFBO);

            // textures must be power of two squared
            var powW = cc.NextPOT(width);
            var powH = cc.NextPOT(height);

            //void *data = malloc(powW * powH * 4);
            var data = [];
            cc.BREAK_IF(!data);

            //memset(data, 0, (int)(powW * powH * 4));
            for (var i = 0; i < powW * powH * 4; i++) {
                data[i] = 0;
            }

            this._pixelFormat = format;

            this._texture = new cc.Texture2D();
            cc.BREAK_IF(!this._texture);

            this._texture.initWithData(data, this._pixelFormat, powW, powH, cc.SizeMake(width, height));
            //free( data );

            // generate FBO
            ccglGenFramebuffers(1, this._fBO);
            ccglBindFramebuffer(cc.GL_FRAMEBUFFER, this._fBO);

            // associate texture with FBO
            ccglFramebufferTexture2D(cc.GL_FRAMEBUFFER, cc.GL_COLOR_ATTACHMENT0, GL_TEXTURE_2D, texture.getName(), 0);

            // check if it worked (probably worth doing :) )
            var status = ccglCheckFramebufferStatus(cc.GL_FRAMEBUFFER);
            if (status != cc.GL_FRAMEBUFFER_COMPLETE) {
                cc.Assert(0, "Render Texture : Could not attach texture to framebuffer");
                break;
            }

            this._texture.setAliasTexParameters();

            this._sprite = cc.Sprite.spriteWithTexture(this._texture);

            this._sprite.setScaleY(-1);
            this.addChild(this._sprite);

            var tBlendFunc = new cc.BlendFunc(GL_ONE, GL_ONE_MINUS_SRC_ALPHA);
            this._sprite.setBlendFunc(tBlendFunc);

            ccglBindFramebuffer(cc.GL_FRAMEBUFFER, this._oldFBO);
            ret = true;
        } while (0);
        return ret;
    },

    /** starts grabbing */
    begin:function () {
        //TODO
        // Save the current matrix
        glPushMatrix();

        var texSize = this._texture.getContentSizeInPixels();

        // Calculate the adjustment ratios based on the old and new projections
        var size = cc.Director.sharedDirector().getDisplaySizeInPixels();
        var widthRatio = size.width / texSize.width;
        var heightRatio = size.height / texSize.height;

        // Adjust the orthographic propjection and viewport
        ccglOrtho(-1.0 / widthRatio, 1.0 / widthRatio, -1.0 / heightRatio, 1.0 / heightRatio, -1, 1);
        glViewport(0, 0, texSize.width, texSize.height);
//     CCDirector::sharedDirector()->getOpenGLView()->setViewPortInPoints(0, 0, texSize.width, texSize.height);

        glGetIntegerv(cc.GL_FRAMEBUFFER_BINDING, this._oldFBO);
        ccglBindFramebuffer(cc.GL_FRAMEBUFFER, this._fBO);//Will direct drawing to the frame buffer created above

        // Issue #1145
        // There is no need to enable the default GL states here
        // but since CCRenderTexture is mostly used outside the "render" loop
        // these states needs to be enabled.
        // Since this bug was discovered in API-freeze (very close of 1.0 release)
        // This bug won't be fixed to prevent incompatibilities with code.
        //
        // If you understand the above mentioned message, then you can comment the following line
        // and enable the gl states manually, in case you need them.

        cc.ENABLE_DEFAULT_GL_STATES();
    },

    /** starts rendering to the texture while clearing the texture first.
     This is more efficient then calling -clear first and then -begin */
    beginWithClear:function (r, g, b, a) {
        //TODO
        this.begin();

        // save clear color
        var clearColor = [0, 0, 0, 0];
        glGetFloatv(GL_COLOR_CLEAR_VALUE, clearColor);

        glClearColor(r, g, b, a);
        glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

        // restore clear color
        glClearColor(clearColor[0], clearColor[1], clearColor[2], clearColor[3]);
    },

    /** ends grabbing*/
    // para isTOCacheTexture       the parameter is only used for android to cache the texture
    end:function (isTOCacheTexture) {
        if (isTOCacheTexture)
            isTOCacheTexture = true;

        ccglBindFramebuffer(cc.GL_FRAMEBUFFER, this._oldFBO);
        // Restore the original matrix and viewport
        glPopMatrix();
        var size = cc.Director.sharedDirector().getDisplaySizeInPixels();
        //	glViewport(0, 0, (GLsizei)size.width, (GLsizei)size.height);
        cc.Director.sharedDirector().getOpenGLView().setViewPortInPoints(0, 0, size.width, size.height);

        if (cc.ENABLE_CACHE_TEXTTURE_DATA) {
            if (isTOCacheTexture) {
                // to get the rendered texture data
                var s = this._texture.getContentSizeInPixels();
                var tx = s.width;
                var ty = s.height;
                this._uITextureImage = new cc.Image();
                if (true == this.getUIImageFromBuffer(this._uITextureImage, 0, 0, tx, ty)) {
                    cc.VolatileTexture.addDataTexture(this._texture, this._uITextureImage.getData(), cc.TEXTURE_2D_PIXEL_FORMAT_RGBA8888, s);
                } else {
                    cc.Log("Cache rendertexture failed!");
                }
            }
        }
    },

    /** clears the texture with a color */
    clear:function (r, g, b, a) {
        if(cc.renderContextType == cc.CANVAS){
            var rect = r;
            if (rect) {
                this.context.clearRect(rect.origin.x, rect.origin.y, rect.size.width, rect.size.height);
            } else {
                this.context.clearRect(0, 0, this.canvas.width, -this.canvas.height);
            }
        }else {
            this.beginWithClear(r, g, b, a);
            this.end();
        }
    },

    /** saves the texture into a file */
    // para szFilePath      the absolute path to save
    // para x,y         the lower left corner coordinates of the buffer to save
    // pare width,height    the size of the buffer to save
    //                        when width = 0 and height = 0, the image size to save equals to buffer texture size
    saveBuffer:function (format, filePath, x, y, width, height) {
        if (typeof(format) == "number") {
            x = x || 0;
            y = y || 0;
            width = width || 0;
            height = height || 0;

            var ret = false;
            cc.Assert(format == cc.CCIMAGE_FORMAT_JPG || format == cc.CCIMAGE_FORMAT_PNG,
                "the image can only be saved as JPG or PNG format");

            var image = new cc.Image();
            if (image != null && this.getUIImageFromBuffer(image, x, y, width, height)) {
                var fullpath = cc.FileUtils.getWriteablePath() + filePath;

                ret = image.saveToFile(fullpath);
            }

            return ret;
        } else if (typeof(format) == "string") {
            height = width || 0;
            width = y || 0;
            y = x || 0;
            x = filePath || 0;

            filePath = format;

            var ret = false;

            var image = new cc.Image();
            if (image != null && this.getUIImageFromBuffer(image, x, y, width, height)) {
                ret = image.saveToFile(filePath);
            }
            return ret;
        }
    },

    /* get buffer as UIImage, can only save a render buffer which has a RGBA8888 pixel format */
    getUIImageAsDataFromBuffer:function (format) {
        var pData = null;
        //@ todo CCRenderTexture::getUIImageAsDataFromBuffer

        // #include "Availability.h"
        // #include "UIKit.h"

        //     GLubyte * pBuffer   = NULL;
        //     GLubyte * pPixels   = NULL;
        //     do
        //     {
        //         CC_BREAK_IF(! texture);
        //
        //         CCAssert(pixelFormat == CCTEXTURE_2D_PIXEL_FORMAT_RGBA8888, "only RGBA8888 can be saved as image");
        //
        //         const CCSize& s = texture->getContentSizeInPixels();
        //         int tx = s.width;
        //         int ty = s.height;
        //
        //         int bitsPerComponent = 8;
        //         int bitsPerPixel = 32;
        //
        //         int bytesPerRow = (bitsPerPixel / 8) * tx;
        //         int myDataLength = bytesPerRow * ty;
        //
        //         CC_BREAK_IF(! (pBuffer = new GLubyte[tx * ty * 4]));
        //         CC_BREAK_IF(! (pPixels = new GLubyte[tx * ty * 4]));
        //
        //         this->begin();
        //         glReadPixels(0,0,tx,ty,GL_RGBA,GL_UNSIGNED_BYTE, pBuffer);
        //         this->end();
        //
        //         int x,y;
        //
        //         for(y = 0; y <ty; y++) {
        //             for(x = 0; x <tx * 4; x++) {
        //                 pPixels[((ty - 1 - y) * tx * 4 + x)] = pBuffer[(y * 4 * tx + x)];
        //             }
        //         }
        //
        //         if (format == CCIMAGE_FORMAT_RAWDATA)
        //         {
        //             pData = CCData::dataWithBytesNoCopy(pPixels, myDataLength);
        //             break;
        //         }

        //@ todo impliment save to jpg or png
        /*
         CGImageCreate(size_t width, size_t height,
         size_t bitsPerComponent, size_t bitsPerPixel, size_t bytesPerRow,
         CGColorSpaceRef space, CGBitmapInfo bitmapInfo, CGDataProviderRef provider,
         const CGFloat decode[], bool shouldInterpolate,
         CGColorRenderingIntent intent)
         */
        // make data provider with data.
        //         CGBitmapInfo bitmapInfo = kCGImageAlphaPremultipliedLast | kCGBitmapByteOrderDefault;
        //         CGDataProviderRef provider		= CGDataProviderCreateWithData(NULL, pixels, myDataLength, NULL);
        //         CGColorSpaceRef colorSpaceRef	= CGColorSpaceCreateDeviceRGB();
        //         CGImageRef iref					= CGImageCreate(tx, ty,
        //             bitsPerComponent, bitsPerPixel, bytesPerRow,
        //             colorSpaceRef, bitmapInfo, provider,
        //             NULL, false,
        //             kCGRenderingIntentDefault);
        //
        //         UIImage* image					= [[UIImage alloc] initWithCGImage:iref];
        //
        //         CGImageRelease(iref);
        //         CGColorSpaceRelease(colorSpaceRef);
        //         CGDataProviderRelease(provider);
        //
        //
        //
        //         if (format == CCIMAGE_FORMAT_PNG)
        //             data = UIImagePNGRepresentation(image);
        //         else
        //             data = UIImageJPEGRepresentation(image, 1.0f);
        //
        //         [image release];
        //     } while (0);
        //
        //     CC_SAFE_DELETE_ARRAY(pBuffer);
        //     CC_SAFE_DELETE_ARRAY(pPixels);
        return pData;
    },

    /** save the buffer data to a CCImage */
    // para image      the CCImage to save
    // para x,y         the lower left corner coordinates of the buffer to save
    // pare width,height    the size of the buffer to save
    //                        when width = 0 and height = 0, the image size to save equals to buffer texture size
    getUIImageFromBuffer:function (image, x, y, width, height) {
        //TODO
        if (null == image || null == this._texture) {
            return false;
        }

        var s = this._texture.getContentSizeInPixels();
        var tx = s.width;
        var ty = s.height;

        if (x < 0 || x >= tx || y < 0 || y >= ty) {
            return false;
        }

        if (width < 0
            || height < 0
            || (0 == width && 0 != height)
            || (0 == height && 0 != width)) {
            return false;
        }

        // to get the image size to save
        //		if the saving image domain exeeds the buffer texture domain,
        //		it should be cut
        var savedBufferWidth = width;
        var savedBufferHeight = height;
        if (0 == width) {
            savedBufferWidth = tx;
        }
        if (0 == height) {
            savedBufferHeight = ty;
        }
        savedBufferWidth = x + savedBufferWidth > tx ? (tx - x) : savedBufferWidth;
        savedBufferHeight = y + savedBufferHeight > ty ? (ty - y) : savedBufferHeight;

        var buffer = null;
        var tempData = null;
        var ret = false;

        do {
            cc.Assert(this._pixelFormat == cc.CCTEXTURE_2D_PIXEL_FORMAT_RGBA8888, "only RGBA8888 can be saved as image");

            buffer = [];
            for (var i = 0; i < savedBufferWidth * savedBufferHeight * 4; i++) {
                buffer[i] = 0;
            }
            cc.BREAK_IF(!buffer);

            // On some machines, like Samsung i9000, Motorola Defy,
            // the dimension need to be a power of 2
            var readBufferWidth = 0;
            var readBufferHeight = 0;
            var maxTextureSize = 0;
            glGetIntegerv(GL_MAX_TEXTURE_SIZE, maxTextureSize);

            readBufferWidth = cc.NextPOT(tx);
            readBufferHeight = cc.NextPOT(ty);

            cc.BREAK_IF(0 == readBufferWidth || 0 == readBufferHeight);
            cc.BREAK_IF(readBufferWidth > maxTextureSize || readBufferHeight > maxTextureSize);

            for (i = 0; i < readBufferWidth * readBufferHeight * 4; i++) {
                tempData[i] = 0;
            }
            cc.BREAK_IF(!tempData);

            this.begin();
            glPixelStorei(GL_PACK_ALIGNMENT, 1);
            glReadPixels(0, 0, readBufferWidth, readBufferHeight, GL_RGBA, GL_UNSIGNED_BYTE, tempData);
            this.end(false);

            // to get the actual texture data
            // #640 the image read from rendertexture is upseted
            for (i = 0; i < savedBufferHeight; ++i) {
                this._memcpy(buffer, i * savedBufferWidth * 4,
                    tempData, (y + savedBufferHeight - i - 1) * readBufferWidth * 4 + x * 4,
                    savedBufferWidth * 4);
            }

            ret = image.initWithImageData(buffer, savedBufferWidth * savedBufferHeight * 4, cc.FMT_RAWDATA, savedBufferWidth, savedBufferHeight, 8);
        } while (0);

        return ret;
    },
    _memcpy:function (destArr, destIndex, srcArr, srcIndex, size) {
        for (var i = 0; i < size; i++) {
            destArr[destIndex + i] = srcArr[srcIndex + i];
        }
    }
});

/** creates a RenderTexture object with width and height in Points and a pixel format, only RGB and RGBA formats are valid */
cc.RenderTexture.renderTextureWithWidthAndHeight = function (width, height, format) {
    if (!format) {
        format = cc.CCTEXTURE_2D_PIXEL_FORMAT_RGBA8888;
    }

    var ret = new cc.RenderTexture();
    if (ret && ret.initWithWidthAndHeight(width, height, format)) {
        return ret;
    }
    return null;
};
