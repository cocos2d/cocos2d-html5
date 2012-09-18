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
 * Image Format:JPG
 * @constant
 * @type Number
 */
cc.FMT_JPG = 0;

/**
 * Image Format:PNG
 * @constant
 * @type Number
 */
cc.FMT_PNG = 1;

/**
 * Image Format:RAWDATA
 * @constant
 * @type Number
 */
cc.FMT_RAWDATA = 2;

/**
 * Image Format:UNKNOWN
 * @constant
 * @type Number
 */
cc.FMT_UNKNOWN = 3;

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

function cc.RGB_PREMULTIPLY_APLHA(vr, vg, vb, va) {
    return ((vr * (va + 1)) >> 8) | ((vg * (va + 1) >> 8) << 8) | ((vb * (va + 1) >> 8) << 16) | ((va) << 24)
}

/**
 * image source
 * @Class
 * @Construct
 * @param {String} data
 * @param {Number} size
 * @param {Number} offset
 */
function tImageSource(data, size, offset) {
    this.data = data;
    this.size = size;
    this.offset = offset;
}

cc.pngReadCallback = function (png_ptr, data, length) {
    var isource = new tImageSource();
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
    _width:0,
    _height:0,
    _bitsPerComponent:0,
    _data:0,
    _hasAlpha:false,
    _preMulti:false,

    /**
     * Load the image from the specified path.
     * @param {String} strPath the absolute file path
     * @param {Number} eImgFmt the type of image, now only support tow types.
     * @return {Boolean} true if load correctly
     */
    initWithImageFile:function (strPath, eImgFmt) {
        var data = new cc.FileData(cc.FileUtils.getInstance().fullPathFromRelativePath(strPath), "rb");
        return this.initWithImageData(data.getBuffer(), data.getSize(), eImgFmt);
    },

    /**
     * The same meaning as initWithImageFile, but it is thread safe. It is casued by loadImage() in cc.TextureCache.
     * @param {String} fullpath full path of the file
     * @param {Number} imageType the type of image, now only support tow types.
     * @return {Boolean} true if load correctly
     */
    initWithImageFileThreadSafe:function (fullpath, imageType) {
        var data = new cc.FileData(fullpath, "rb");
        return this.initWithImageData(data.getBuffer(), data.getSize(), imageType);
    },

    /**
     * Load image from stream buffer.
     * @warning FMT_RAWDATA only support RGBA8888
     * @param {Array} pData stream buffer that hold the image data
     * @param {Number} nDataLen the length of data(managed in byte)
     * @param {Number} eFmt
     * @param {Number} width
     * @param {Number} height
     * @param {Number} nBitsPerComponent
     * @return {Boolean} true if load correctly
     */
    initWithImageData:function (pData, nDataLen, eFmt, width, height, nBitsPerComponent) {
        var ret = false;
        do
        {
            if (!pData || nDataLen <= 0) break;

            if (cc.FMT_PNG == eFmt) {
                ret = this._initWithPngData(pData, nDataLen);
                break;
            }
            else if (cc.FMT_JPG == eFmt) {
                ret = this._initWithJpgData(pData, nDataLen);
                break;
            }
            else if (cc.FMT_RAWDATA == eFmt) {
                ret = this._initWithRawData(pData, nDataLen, width, height, nBitsPerComponent);
                break;
            }
        } while (0);
        return ret;
    },
    getData:function () {
        return this._data;
    },
    getDataLen:function () {
        return this._width * this._height;
    },
    hasAlpha:function () {
        return this._hasAlpha;
    },
    isPremultipliedAlpha:function () {
        return this._preMulti;
    },
    getWidth:function () {
        return this._width;
    },
    getHeight:function () {
        return this._height;
    },
    getBitsPerComponent:function () {
        return this._bitsPerComponent;
    },

    /**
     * Save the CCImage data to specified file with specified format.
     * @param {String} filePath the file's absolute path, including file subfix
     * @param {Boolean} isToRGB  if the image is saved as RGB format
     * @return {Boolean}
     */
    saveToFile:function (filePath, isToRGB) {
        var ret = false;
        do
        {
            if (null == filePath) break;

            var strFilePath = filePath;
            if (strFilePath.size() <= 4) break;
            var strLowerCasePath = strFilePath;
            for (var i = 0; i < strLowerCasePath.length; ++i) {
                strLowerCasePath[i] = cc.tolower(strFilePath[i]);
            }

            if (std.string.npos != strLowerCasePath.find(".png")) {
                if (!this._saveImageToPNG(filePath, isToRGB)) break;
            }
            else if (std.string.npos != strLowerCasePath.find(".jpg")) {
                if (!this._saveImageToJPG(filePath)) break;
            }
            else {
                break;
            }

            ret = true;
        } while (0);

        return ret;
    },

    /*protected:*/
    _initWithJpgData:function (data, size) {
        /* these are standard libjpeg structures for reading(decompression) */
        var cinfo = new cc.jpeg_decompress_struct();
        var jerr = new cc.jpeg_error_mgr();
        /* libjpeg data structure for storing one row, that is, scanline of an image */
        var row_pointer = [0];
        var location = 0;
        var i = 0;

        var ret = false;
        do
        {
            /* here we set up the standard libjpeg error handler */
            cinfo.err = cc.jpeg_std_error(jerr);

            /* setup decompression process and source, then read JPEG header */
            cc.jpeg_create_decompress(cinfo);

            cc.jpeg_mem_src(cinfo, data, size);

            /* reading the image header which contains image information */
            cc.jpeg_read_header(cinfo, true);

            // we only support RGB or grayscale
            if (cinfo.jpeg_color_space != cc.JCS_RGB) {
                if (cinfo.jpeg_color_space == cc.JCS_GRAYSCALE || cinfo.jpeg_color_space == cc.JCS_YCbCr) {
                    cinfo.out_color_space = cc.JCS_RGB;
                }
            }
            else {
                break;
            }

            /* Start decompression jpeg here */
            cc.jpeg_start_decompress(cinfo);

            /* init image info */
            this._width = cinfo.image_width;
            this._height = cinfo.image_height;
            this._hasAlpha = false;
            this._preMulti = false;
            this._bitsPerComponent = 8;
            row_pointer[0] = new [cinfo.output_width * cinfo.output_components];
            if (!row_pointer[0]) break;
            this._data = new [cinfo.output_width * cinfo.output_height * cinfo.output_components];
            if (!this._data) break;

            /* now actually read the jpeg into the raw buffer */
            /* read one scan line at a time */
            while (cinfo.output_scanline < cinfo.image_height) {
                cc.jpeg_read_scanlines(cinfo, row_pointer, 1);
                for (i = 0; i < cinfo.image_width * cinfo.num_components; i++)
                    this._data[location++] = row_pointer[0][i];
            }

            cc.jpeg_finish_decompress(cinfo);
            cc.jpeg_destroy_decompress(cinfo);
            /* wrap up decompression, destroy objects, free pointers and close open files */
            ret = true;
        } while (0);

        return ret;
    },

    _initWithPngData:function (pData, nDatalen) {
        var ret = false, header = [0], png_ptr = 0, info_ptr = 0, imateData = 0;

        do
        {
            // png header len is 8 bytes
            if (nDatalen < 8) break;
            // check the data is png or not
            cc.memcpy(header, pData, 8);
            if (cc.png_sig_cmp(header, 0, 8)) break;

            // init png_struct
            png_ptr = cc.png_create_read_struct(cc.PNG_LIBPNG_VER_STRING, 0, 0, 0);
            if (!png_ptr) break;
            // init png_info
            info_ptr = cc.png_create_info_struct(png_ptr);
            if (!info_ptr) break;

            // set the read call back function
            var imageSource = new tImageSource();
            imageSource.data = pData;
            imageSource.size = nDatalen;
            imageSource.offset = 0;
            cc.png_set_read_fn(png_ptr, imageSource, cc.pngReadCallback);

            // read png
            // PNG_TRANSFORM_EXPAND: perform set_expand()
            // PNG_TRANSFORM_PACKING: expand 1, 2 and 4-bit samples to bytes
            // PNG_TRANSFORM_STRIP_16: strip 16-bit samples to 8 bits
            // PNG_TRANSFORM_GRAY_TO_RGB: expand grayscale samples to RGB (or GA to RGBA)
            cc.png_read_png(png_ptr, info_ptr, cc.PNG_TRANSFORM_EXPAND | cc.PNG_TRANSFORM_PACKING
                | cc.PNG_TRANSFORM_STRIP_16 | cc.PNG_TRANSFORM_GRAY_TO_RGB, 0);

            var color_type = 0;
            var width = 0;
            var height = 0;
            var nBitsPerComponent = 0;
            cc.png_get_IHDR(png_ptr, info_ptr, width, height, nBitsPerComponent, color_type, 0, 0, 0);

            // init image info
            this._preMulti = true;
            this._hasAlpha = ( info_ptr.color_type & cc.PNG_COLOR_MASK_ALPHA ) ? true : false;

            // allocate memory and read data
            var bytesPerComponent = 3;
            if (this._hasAlpha) {
                bytesPerComponent = 4;
            }
            imateData = new [height * width * bytesPerComponent];
            if (!imateData) break;
            var rowPointers = new cc.png_bytep();
            rowPointers = cc.png_get_rows(png_ptr, info_ptr);

            // copy data to image info
            var bytesPerRow = width * bytesPerComponent;
            if (this._hasAlpha) {
                var tmp = imateData;
                for (var i = 0; i < height; i++) {
                    for (var j = 0; j < bytesPerRow; j += 4) {
                        tmp++;
                        tmp = cc.RGB_PREMULTIPLY_APLHA(rowPointers[i][j], rowPointers[i][j + 1],
                            rowPointers[i][j + 2], rowPointers[i][j + 3]);
                    }
                }
            }
            else {
                for (var j = 0; j < height; ++j) {
                    cc.memcpy(imateData + j * bytesPerRow, rowPointers[j], bytesPerRow);
                }
            }

            this._bitsPerComponent = nBitsPerComponent;
            this._height = height;
            this._width = width;
            this._data = imateData;
            imateData = 0;
            ret = true;
        } while (0);

        if (png_ptr) {
            cc.png_destroy_read_struct(png_ptr, info_ptr ? info_ptr : 0, 0);
        }
        return ret;
    },

    // @warning FMT_RAWDATA only support RGBA8888
    _initWithRawData:function (data, datalen, width, height, bitsPerComponent) {
        var ret = false;
        do
        {
            if (0 == width || 0 == height) break;

            this._bitsPerComponent = bitsPerComponent;
            this._height = height;
            this._width = width;
            this._hasAlpha = true;

            // only RGBA8888 surported
            var nBytesPerComponent = 4;
            var nSize = height * width * nBytesPerComponent;
            this._data = new [nSize];
            if (!this._data) break;
            cc.memcpy(this._data, data, nSize);

            ret = true;
        } while (0);
        return ret;
    },

    _saveImageToPNG:function (filePath, isToRGB) {
        var ret = false;
        do
        {
            if (null == filePath) break;

            var fp = new cc.FILE(), png_ptr = new cc.png_structp(), info_ptr = new cc.png_infop(), palette = new cc.png_colorp(), row_pointers = new cc.png_bytep();

            fp = cc.fopen(filePath, "wb");
            if (null == fp) break;

            png_ptr = cc.png_create_write_struct(cc.PNG_LIBPNG_VER_STRING, null, null, null);

            if (null == png_ptr) {
                cc.fclose(fp);
                break;
            }

            info_ptr = cc.png_create_info_struct(png_ptr);
            if (null == info_ptr) {
                cc.fclose(fp);
                cc.png_destroy_write_struct(png_ptr, null);
                break;
            }
            if (cc.TARGET_PLATFORM != cc.PLATFORM_BADA) {
                if (cc.setjmp(cc.png_jmpbuf(png_ptr))) {
                    cc.fclose(fp);
                    cc.png_destroy_write_struct(png_ptr, info_ptr);
                    break;
                }
            }
            cc.png_init_io(png_ptr, fp);

            if (!isToRGB && this._hasAlpha) {
                cc.png_set_IHDR(png_ptr, info_ptr, this._width, this._height, 8, cc.PNG_COLOR_TYPE_RGB_ALPHA,
                    cc.PNG_INTERLACE_NONE, cc.PNG_COMPRESSION_TYPE_BASE, cc.PNG_FILTER_TYPE_BASE);
            }
            else {
                cc.png_set_IHDR(png_ptr, info_ptr, this._width, this._height, 8, cc.PNG_COLOR_TYPE_RGB,
                    cc.PNG_INTERLACE_NONE, cc.PNG_COMPRESSION_TYPE_BASE, cc.PNG_FILTER_TYPE_BASE);
            }

            palette = cc.png_malloc(png_ptr, cc.PNG_MAX_PALETTE_LENGTH * sizeof(cc.png_color));
            cc.png_set_PLTE(png_ptr, info_ptr, palette, cc.PNG_MAX_PALETTE_LENGTH);

            cc.png_write_info(png_ptr, info_ptr);

            cc.png_set_packing(png_ptr);

            row_pointers = cc.malloc(this._height * sizeof(cc.png_bytep));
            if (row_pointers == null) {
                cc.fclose(fp);
                cc.png_destroy_write_struct(png_ptr, info_ptr);
                break;
            }

            if (!this._hasAlpha) {
                for (var i = 0; i < this._height; i++) {
                    row_pointers[i] = this._data + i * this._width * 3;
                }

                cc.png_write_image(png_ptr, row_pointers);

                cc.free(row_pointers);
                row_pointers = null;
            }
            else {
                if (isToRGB) {
                    var tempData = new [this._width * this._height * 3];
                    if (null == tempData) {
                        cc.fclose(fp);
                        cc.png_destroy_write_struct(png_ptr, info_ptr);
                        break;
                    }

                    for (var i = 0; i < this._height; ++i) {
                        for (var j = 0; j < this._width; ++j) {
                            tempData[(i * this._width + j) * 3] = this._data[(i * __width + j) * 4];
                            tempData[(i * this._width + j) * 3 + 1] = this._data[(i * __width + j) * 4 + 1];
                            tempData[(i * this._width + j) * 3 + 2] = this._data[(i * __width + j) * 4 + 2];
                        }
                    }

                    for (var i = 0; i < this._height; i++) {
                        row_pointers[i] = tempData + i * this._width * 3;
                    }

                    cc.png_write_image(png_ptr, row_pointers);

                    cc.free(row_pointers);
                    row_pointers = null;

                }
                else {
                    for (var i = 0; i < this._height; i++) {
                        row_pointers[i] = this._data + i * this._width * 4;
                    }

                    cc.png_write_image(png_ptr, row_pointers);

                    cc, free(row_pointers);
                    row_pointers = null;
                }
            }

            cc.png_write_end(png_ptr, info_ptr);

            cc.png_free(png_ptr, palette);
            palette = null;

            cc.png_destroy_write_struct(png_ptr, info_ptr);

            cc.fclose(fp);

            ret = true;
        } while (0);
        return ret;
    },

    _saveImageToJPG:function (pszFilePath) {
        var ret = false;
        do
        {
            if (null == pszFilePath) break;
            var cinfo = new cc.jpeg_compress_struct(),
                jerr = new cc.jpeg_error_mgr(),
                outfile = new cc.FILE(), /* target file */
                row_pointer = [], /* pointer to JSAMPLE row[s] */
                row_stride;
            /* physical row width in image buffer */

            cinfo.err = jpeg_std_error(jerr);
            /* Now we can initialize the JPEG compression object. */
            cc.jpeg_create_compress(cinfo);

            if ((outfile = fopen(pszFilePath, "wb")) == null) break;

            cc.jpeg_stdio_dest(cinfo, outfile);

            cinfo.image_width = this._width;
            /* image width and height, in pixels */
            cinfo.image_height = this._height;
            cinfo.input_components = 3;
            /* # of color components per pixel */
            cinfo.in_color_space = cc.JCS_RGB;
            /* colorspace of input image */

            cc.jpeg_set_defaults(cinfo);

            cc.jpeg_start_compress(cinfo, true);

            row_stride = this._width * 3;
            /* JSAMPLEs per row in image_buffer */

            if (this._hasAlpha) {
                var tempData = new [this._width * this._height * 3];
                if (null == tempData) {
                    cc.jpeg_finish_compress(cinfo);
                    cc.jpeg_destroy_compress(cinfo);
                    cc.fclose(outfile);
                    break;
                }

                for (var i = 0; i < this._height; ++i) {
                    for (var j = 0; j < this._width; ++j) {
                        tempData[(i * this._width + j) * 3] = this._data[(i * this._width + j) * 4];
                        tempData[(i * this._width + j) * 3 + 1] = this._data[(i * this._width + j) * 4 + 1];
                        tempData[(i * this._width + j) * 3 + 2] = this._data[(i * this._width + j) * 4 + 2];
                    }
                }

                while (cinfo.next_scanline < cinfo.image_height) {
                    row_pointer[0] = tempData[cinfo.next_scanline * row_stride];
                    cc.jpeg_write_scanlines(cinfo, row_pointer, 1);
                }

            }
            else {
                while (cinfo.next_scanline < cinfo.image_height) {
                    row_pointer[0] = this._data[cinfo.next_scanline * row_stride];
                    cc.jpeg_write_scanlines(cinfo, row_pointer, 1);
                }
            }

            cc.jpeg_finish_compress(cinfo);
            cc.fclose(outfile);
            cc.jpeg_destroy_compress(cinfo);

            ret = true;
        } while (0);
        return ret;
    },

    /**
     * Create image with specified string.
     * @param {cc.Texture2D} text the text which the image show, nil cause init fail
     * @param {Number} width the image width, if 0, the width match the text's width
     * @param {Number} height the image height, if 0, the height match the text's height
     * @param {Number} eAlignMask the test Alignment
     * @param {String} pFontName the name of the font which use to draw the text. If nil, use the default system font.
     * @param {Number} nSize the font size, if 0, use the system default size.
     */
    initWithString:function (text, width, height, eAlignMask, pFontName, nSize) {
    }
});
