/**
 * Created by Huabin LING on 1/6/14.
 */

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
 * Image Format:TIFF
 * @constant
 * @type Number
 */
cc.FMT_TIFF = 2;

/**
 * Image Format:RAWDATA
 * @constant
 * @type Number
 */
cc.FMT_RAWDATA = 3;

/**
 * Image Format:WEBP
 * @constant
 * @type Number
 */
cc.FMT_WEBP = 4;

/**
 * Image Format:UNKNOWN
 * @constant
 * @type Number
 */
cc.FMT_UNKNOWN = 5;

cc.getImageFormatByData = function (imgData) {
    // if it is a png file buffer.
    if (imgData.length > 8) {
        if (imgData[0] == 0x89
            && imgData[1] == 0x50
            && imgData[2] == 0x4E
            && imgData[3] == 0x47
            && imgData[4] == 0x0D
            && imgData[5] == 0x0A
            && imgData[6] == 0x1A
            && imgData[7] == 0x0A) {
            return cc.FMT_PNG;
        }
    }

    // if it is a tiff file buffer.
    if (imgData.length > 2) {
        if ((imgData[0] == 0x49 && imgData[1] == 0x49)
            || (imgData[0] == 0x4d && imgData[1] == 0x4d)
            || (imgData[0] == 0xff && imgData[1] == 0xd8)) {
            return cc.FMT_TIFF;
        }
    }

    return cc.FMT_UNKNOWN;
};