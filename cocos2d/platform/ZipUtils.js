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
 * Unpack a gzipped byte array
 *
 * @param {Integer[]} input Byte array
 * @returns {String} Unpacked byte string
 */
cc.unzip = function (input) {
    return (new cc.UnzipUtil(input)).unzip()[0][0];
};

/**
 * Unpack a gzipped byte string encoded as base64
 *
 * @param {String} input Byte string encoded as base64
 * @returns {String} Unpacked byte string
 */
cc.unzipBase64 = function (input) {
    return (new cc.UnzipUtil(cc.Base64decodeAsArray(input))).unzip()[0][0];
};

/**
 * Unpack a gzipped byte string encoded as base64
 *
 * @param {String} input Byte string encoded as base64
 * @param {Integer} bytes Bytes per array item
 * @returns {Integer[]} Unpacked byte array
 */
cc.unzipBase64AsArray = function (input, bytes) {
    bytes = bytes || 1;

    var dec = this.unzipBase64(input),
        ar = [], i, j, len;
    for (i = 0, len = dec.length / bytes; i < len; i++) {
        ar[i] = 0;
        for (j = bytes - 1; j >= 0; --j) {
            ar[i] += dec.charCodeAt((i * bytes) + j) << (j * 8);
        }
    }
    return ar;
};

/**
 * Unpack a gzipped byte array
 *
 * @param {Integer[]} input Byte array
 * @param {Integer} bytes Bytes per array item
 * @returns {Integer[]} Unpacked byte array
 */
cc.unzipAsArray = function (input, bytes) {
    bytes = bytes || 1;

    var dec = this.unzip(input),
        ar = [], i, j, len;
    for (i = 0, len = dec.length / bytes; i < len; i++) {
        ar[i] = 0;
        for (j = bytes - 1; j >= 0; --j) {
            ar[i] += dec.charCodeAt((i * bytes) + j) << (j * 8);
        }
    }
    return ar;
};