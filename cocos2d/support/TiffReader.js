/****************************************************************************
 Copyright (c) 2010-2013 cocos2d-x.org

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

cc.TiffReader = cc.Class.extend({
    getFieldTagName: function (fieldTag) {
        // See: http://www.digitizationguidelines.gov/guidelines/TIFF_Metadata_Final.pdf
        // See: http://www.digitalpreservation.gov/formats/content/tiff_tags.shtml
        var fieldTagNames = {
            // TIFF Baseline
            0x013B: 'Artist',
            0x0102: 'BitsPerSample',
            0x0109: 'CellLength',
            0x0108: 'CellWidth',
            0x0140: 'ColorMap',
            0x0103: 'Compression',
            0x8298: 'Copyright',
            0x0132: 'DateTime',
            0x0152: 'ExtraSamples',
            0x010A: 'FillOrder',
            0x0121: 'FreeByteCounts',
            0x0120: 'FreeOffsets',
            0x0123: 'GrayResponseCurve',
            0x0122: 'GrayResponseUnit',
            0x013C: 'HostComputer',
            0x010E: 'ImageDescription',
            0x0101: 'ImageLength',
            0x0100: 'ImageWidth',
            0x010F: 'Make',
            0x0119: 'MaxSampleValue',
            0x0118: 'MinSampleValue',
            0x0110: 'Model',
            0x00FE: 'NewSubfileType',
            0x0112: 'Orientation',
            0x0106: 'PhotometricInterpretation',
            0x011C: 'PlanarConfiguration',
            0x0128: 'ResolutionUnit',
            0x0116: 'RowsPerStrip',
            0x0115: 'SamplesPerPixel',
            0x0131: 'Software',
            0x0117: 'StripByteCounts',
            0x0111: 'StripOffsets',
            0x00FF: 'SubfileType',
            0x0107: 'Threshholding',
            0x011A: 'XResolution',
            0x011B: 'YResolution',

            // TIFF Extended
            0x0146: 'BadFaxLines',
            0x0147: 'CleanFaxData',
            0x0157: 'ClipPath',
            0x0148: 'ConsecutiveBadFaxLines',
            0x01B1: 'Decode',
            0x01B2: 'DefaultImageColor',
            0x010D: 'DocumentName',
            0x0150: 'DotRange',
            0x0141: 'HalftoneHints',
            0x015A: 'Indexed',
            0x015B: 'JPEGTables',
            0x011D: 'PageName',
            0x0129: 'PageNumber',
            0x013D: 'Predictor',
            0x013F: 'PrimaryChromaticities',
            0x0214: 'ReferenceBlackWhite',
            0x0153: 'SampleFormat',
            0x022F: 'StripRowCounts',
            0x014A: 'SubIFDs',
            0x0124: 'T4Options',
            0x0125: 'T6Options',
            0x0145: 'TileByteCounts',
            0x0143: 'TileLength',
            0x0144: 'TileOffsets',
            0x0142: 'TileWidth',
            0x012D: 'TransferFunction',
            0x013E: 'WhitePoint',
            0x0158: 'XClipPathUnits',
            0x011E: 'XPosition',
            0x0211: 'YCbCrCoefficients',
            0x0213: 'YCbCrPositioning',
            0x0212: 'YCbCrSubSampling',
            0x0159: 'YClipPathUnits',
            0x011F: 'YPosition',

            // EXIF
            0x9202: 'ApertureValue',
            0xA001: 'ColorSpace',
            0x9004: 'DateTimeDigitized',
            0x9003: 'DateTimeOriginal',
            0x8769: 'Exif IFD',
            0x9000: 'ExifVersion',
            0x829A: 'ExposureTime',
            0xA300: 'FileSource',
            0x9209: 'Flash',
            0xA000: 'FlashpixVersion',
            0x829D: 'FNumber',
            0xA420: 'ImageUniqueID',
            0x9208: 'LightSource',
            0x927C: 'MakerNote',
            0x9201: 'ShutterSpeedValue',
            0x9286: 'UserComment',

            // IPTC
            0x83BB: 'IPTC',

            // ICC
            0x8773: 'ICC Profile',

            // XMP
            0x02BC: 'XMP',

            // GDAL
            0xA480: 'GDAL_METADATA',
            0xA481: 'GDAL_NODATA',

            // Photoshop
            0x8649: 'Photoshop'
        };

        var fieldTagName;

        if (fieldTag in fieldTagNames) {
            fieldTagName = fieldTagNames[fieldTag];
        } else {
            console.log( "Unknown Field Tag:", fieldTag);
            fieldTagName = "Tag" + fieldTag;
        }

        return fieldTagName;
    }
});
