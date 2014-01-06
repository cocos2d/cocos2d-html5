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
 * Horizontal center and vertical center.
 * @constant
 * @type Number
 */
cc.ALIGN_CENTER = 0x33;

/**
 * Horizontal center and vertical top.
 * @constant
 * @type Number
 */
cc.ALIGN_TOP = 0x13;

/**
 * Horizontal right and vertical top.
 * @constant
 * @type Number
 */
cc.ALIGN_TOP_RIGHT = 0x12;

/**
 * Horizontal right and vertical center.
 * @constant
 * @type Number
 */
cc.ALIGN_RIGHT = 0x32;

/**
 * Horizontal right and vertical bottom.
 * @constant
 * @type Number
 */
cc.ALIGN_BOTTOM_RIGHT = 0x22;

/**
 * Horizontal center and vertical bottom.
 * @constant
 * @type Number
 */
cc.ALIGN_BOTTOM = 0x23;

/**
 * Horizontal left and vertical bottom.
 * @constant
 * @type Number
 */
cc.ALIGN_BOTTOM_LEFT = 0x21;

/**
 * Horizontal left and vertical center.
 * @constant
 * @type Number
 */
cc.ALIGN_LEFT = 0x31;

/**
 * Horizontal left and vertical top.
 * @constant
 * @type Number
 */
cc.ALIGN_TOP_LEFT = 0x11;

/**
 * premultiply alpha, or the effect will wrong when want to use other pixel format in CCTexture2D,
 * such as RGB888, RGB5A1
 * @param {Number} vr
 * @param {Number} vg
 * @param {Number} vb
 * @param {Number} va
 * @return {Number}
 * @constructor
 */
cc.RGB_PREMULTIPLY_APLHA = function (vr, vg, vb, va) {
    return ((vr * (va + 1)) >> 8) | ((vg * (va + 1) >> 8) << 8) | ((vb * (va + 1) >> 8) << 16) | ((va) << 24)
}

/**
 * image source
 * @Class
 * @Construct
 * @param {Array||String} data
 * @param {Number} size
 * @param {Number} offset
 */
cc.tImageSource = function (data, size, offset) {
    this.data = data;
    this.size = size || 0;
    this.offset = offset || 0;
};

cc.pngReadCallback = function (png_ptr, data, length) {
    var isource = new cc.tImageSource();
    isource = cc.png_get_io_ptr(png_ptr);

    if (isource.offset + length <= isource.size) {
        cc.memcpy(data, isource.data + isource.offset, length);
        isource.offset += length;
    }
    else {
        cc.png_error(png_ptr, "pngReaderCallback failed");
    }
};

/**
 * Image
 * @class
 * @extends cc.Class
 */
cc.Image = cc.Class.extend(/** @lends cc.Image# */{
    _width: 0,
    _height: 0,
    _bitsPerComponent: 0,
    _data: 0,
    _hasAlpha: false,
    _preMulti: false,

    /**
     * Load the image from the specified path.
     * @param {String} strPath the absolute file path
     * @param {Number} imageType the type of image, now only support tow types.
     * @return {Boolean} true if load correctly
     */
    initWithImageFile: function (strPath, imageType) {
        var data = cc.FileUtils.getInstance().getFileData(strPath, "rb");
        var size = data.length;
        if (data != null && data.length > 0)
            return this.initWithImageData(data, data.length, imageType);
        return false;
    },

    /**
     * The same meaning as initWithImageFile, but it is thread safe. It is casued by loadImage() in cc.TextureCache.
     * @param {String} fullpath full path of the file
     * @param {Number} imageType the type of image, now only support tow types.
     * @return {Boolean} true if load correctly
     */
    initWithImageFileThreadSafe: function (fullpath, imageType) {
        return this.initWithImageFile(fullpath, imageType);
    },

    /**
     * Load image from stream buffer.
     * @warning FMT_RAWDATA only support RGBA8888
     * @param {Array} data stream buffer that hold the image data
     * @param {Number} dataLen the length of data(managed in byte)
     * @param {Number} eFmt
     * @param {Number} width
     * @param {Number} height
     * @param {Number} bitsPerComponent
     * @return {Boolean} true if load correctly
     */
    initWithImageData: function (data, dataLen, eFmt, width, height, bitsPerComponent) {
        bitsPerComponent = bitsPerComponent || 8;
        width = width || 0;
        height = height || 0;
        eFmt = eFmt || cc.FMT_UNKNOWN;

        if (!data || dataLen <= 0)
            return false;

        if (cc.FMT_PNG == eFmt)
            return this._initWithPngData(data, dataLen);
        else if (cc.FMT_JPG == eFmt)
            return this._initWithJpgData(data, dataLen);
        else if (cc.FMT_TIFF == eFmt)
            return this._initWithTiffData(data, dataLen);
        else if (cc.FMT_RAWDATA == eFmt)
            return this._initWithRawData(data, dataLen, width, height, bitsPerComponent);
        else {
            // if it is a png file buffer.
            if (dataLen > 8) {
                if (data[0] == 0x89
                    && data[1] == 0x50
                    && data[2] == 0x4E
                    && data[3] == 0x47
                    && data[4] == 0x0D
                    && data[5] == 0x0A
                    && data[6] == 0x1A
                    && data[7] == 0x0A) {
                    return this._initWithPngData(data, dataLen);
                }
            }

            // if it is a tiff file buffer.
            if (dataLen > 2) {
                if ((data[0] == 0x49 && data[1] == 0x49)
                    || (data[0] == 0x4d && data[1] == 0x4d)) {
                    return this._initWithTiffData(data, dataLen);
                } else if (data[0] == 0xff && data[1] == 0xd8) {
                    return this._initWithTiffData(data, dataLen);
                }
            }
        }
        return false;
    },

    getData: function () {
        return this._data;
    },

    getDataLen: function () {
        return this._width * this._height;
    },

    hasAlpha: function () {
        return this._hasAlpha;
    },

    isPremultipliedAlpha: function () {
        return this._preMulti;
    },

    getWidth: function () {
        return this._width;
    },

    getHeight: function () {
        return this._height;
    },

    getBitsPerComponent: function () {
        return this._bitsPerComponent;
    },

    /**
     * Save the CCImage data to specified file with specified format.
     * @param {String} filePath the file's absolute path, including file subfix
     * @param {Boolean} isToRGB  if the image is saved as RGB format
     * @return {Boolean}
     */
    saveToFile: function (filePath, isToRGB) {
        //
        cc.log("doesn't support saveToFile on Cocos2d-Html5");
        return false;
    },

    /*protected:*/
    _initWithJpgData: function (data, dataLen) {
        return false;
    },

    _initWithPngData: function (data, datalen) {
        return false;
    },

    _initWithTiffData: function (data, dataLen) {
        return false;
    },

    // @warning FMT_RAWDATA only support RGBA8888
    _initWithRawData: function (data, datalen, width, height, bitsPerComponent) {
        return false;
    },

    _saveImageToPNG: function (filePath, isToRGB) {
        return false;
    },

    _saveImageToJPG: function (filePath) {
        return false;
    },

    /**
     * Create image with specified string.
     * @param {String} text the text which the image show, nil cause init fail
     * @param {Number} width the image width, if 0, the width match the text's width
     * @param {Number} height the image height, if 0, the height match the text's height
     * @param {Number} eAlignMask the test Alignment
     * @param {String} fontName the name of the font which use to draw the text. If nil, use the default system font.
     * @param {Number} size the font size, if 0, use the system default size.
     * @return {Boolean}
     */
    initWithString: function (text, width, height, eAlignMask, fontName, size) {
        return false;
    }
});
