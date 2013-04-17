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

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

function TIFFParser() {
    this.tiffDataView = undefined;
    this.littleEndian = undefined;
    this.fileDirectories = [];
};

TIFFParser.prototype = {
    //USED
    isLittleEndian: function () {
        // Get byte order mark.
        var BOM = this.getBytes(2, 0);

        // Find out the endianness.
        if (BOM === 0x4949) {
            this.littleEndian = true;
        } else if (BOM === 0x4D4D) {
            this.littleEndian = false;
        } else {
            console.log( BOM );
            throw TypeError("Invalid byte order value.");
        }

        return this.littleEndian;
    },

    hasTowel: function () {
        // Check for towel.
        if (this.getBytes(2, 2) !== 42) {
            throw RangeError("You forgot your towel!");
            return false;
        }

        return true;
    },

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
    },

    getFieldTypeName: function (fieldType) {
        var fieldTypeNames = {
            0x0001: 'BYTE',
            0x0002: 'ASCII',
            0x0003: 'SHORT',
            0x0004: 'LONG',
            0x0005: 'RATIONAL',
            0x0006: 'SBYTE',
            0x0007: 'UNDEFINED',
            0x0008: 'SSHORT',
            0x0009: 'SLONG',
            0x000A: 'SRATIONAL',
            0x000B: 'FLOAT',
            0x000C: 'DOUBLE'
        };

        var fieldTypeName;

        if (fieldType in fieldTypeNames) {
            fieldTypeName = fieldTypeNames[fieldType];
        }

        return fieldTypeName;
    },

    getFieldTypeLength: function (fieldTypeName) {
        var fieldTypeLength;

        if (['BYTE', 'ASCII', 'SBYTE', 'UNDEFINED'].indexOf(fieldTypeName) !== -1) {
            fieldTypeLength = 1;
        } else if (['SHORT', 'SSHORT'].indexOf(fieldTypeName) !== -1) {
            fieldTypeLength = 2;
        } else if (['LONG', 'SLONG', 'FLOAT'].indexOf(fieldTypeName) !== -1) {
            fieldTypeLength = 4;
        } else if (['RATIONAL', 'SRATIONAL', 'DOUBLE'].indexOf(fieldTypeName) !== -1) {
            fieldTypeLength = 8;
        }

        return fieldTypeLength;
    },

    getBits: function (numBits, byteOffset, bitOffset) {
        bitOffset = bitOffset || 0;
        var extraBytes = Math.floor(bitOffset / 8);
        var newByteOffset = byteOffset + extraBytes;
        var totalBits = bitOffset + numBits;
        var shiftRight = 32 - numBits;

        if (totalBits <= 0) {
            console.log( numBits, byteOffset, bitOffset );
            throw RangeError("No bits requested");
        } else if (totalBits <= 8) {
            var shiftLeft = 24 + bitOffset;
            var rawBits = this.tiffDataView.getUint8(newByteOffset, this.littleEndian);
        } else if (totalBits <= 16) {
            var shiftLeft = 16 + bitOffset;
            var rawBits = this.tiffDataView.getUint16(newByteOffset, this.littleEndian);
        } else if (totalBits <= 32) {
            var shiftLeft = bitOffset;
            var rawBits = this.tiffDataView.getUint32(newByteOffset, this.littleEndian);
        } else {
            console.log( numBits, byteOffset, bitOffset );
            throw RangeError("Too many bits requested");
        }

        var chunkInfo = {
            'bits': ((rawBits << shiftLeft) >>> shiftRight),
            'byteOffset': newByteOffset + Math.floor(totalBits / 8),
            'bitOffset': totalBits % 8
        };

        return chunkInfo;
    },

    getBytes: function (numBytes, offset) {
        if (numBytes <= 0) {
            console.log( numBytes, offset );
            throw RangeError("No bytes requested");
        } else if (numBytes <= 1) {
            return this.tiffDataView.getUint8(offset, this.littleEndian);
        } else if (numBytes <= 2) {
            return this.tiffDataView.getUint16(offset, this.littleEndian);
        } else if (numBytes <= 3) {
            return this.tiffDataView.getUint32(offset, this.littleEndian) >>> 8;
        } else if (numBytes <= 4) {
            return this.tiffDataView.getUint32(offset, this.littleEndian);
        } else {
            console.log( numBytes, offset );
            throw RangeError("Too many bytes requested");
        }
    },

    getFieldValues: function (fieldTagName, fieldTypeName, typeCount, valueOffset) {
        var fieldValues = [];

        var fieldTypeLength = this.getFieldTypeLength(fieldTypeName);
        var fieldValueSize = fieldTypeLength * typeCount;

        if (fieldValueSize <= 4) {
            // The value is stored at the big end of the valueOffset.
            if (this.littleEndian === false) {
                var value = valueOffset >>> ((4 - fieldTypeLength) * 8);
            } else {
                var value = valueOffset;
            }

            fieldValues.push(value);
        } else {
            for (var i = 0; i < typeCount; i++) {
                var indexOffset = fieldTypeLength * i;

                if (fieldTypeLength >= 8) {
                    if (['RATIONAL', 'SRATIONAL'].indexOf(fieldTypeName) !== -1) {
                        // Numerator
                        fieldValues.push(this.getBytes(4, valueOffset + indexOffset));
                        // Denominator
                        fieldValues.push(this.getBytes(4, valueOffset + indexOffset + 4));
//					} else if (['DOUBLE'].indexOf(fieldTypeName) !== -1) {
//						fieldValues.push(this.getBytes(4, valueOffset + indexOffset) + this.getBytes(4, valueOffset + indexOffset + 4));
                    } else {
                        console.log( fieldTypeName, typeCount, fieldValueSize );
                        throw TypeError("Can't handle this field type or size");
                    }
                } else {
                    fieldValues.push(this.getBytes(fieldTypeLength, valueOffset + indexOffset));
                }
            }
        }

        if (fieldTypeName === 'ASCII') {
            fieldValues.forEach(function(e, i, a) { a[i] = String.fromCharCode(e); });
        }

        return fieldValues;
    },

    clampColorSample: function(colorSample, bitsPerSample) {
        var multiplier = Math.pow(2, 8 - bitsPerSample);

        return Math.floor((colorSample * multiplier) + (multiplier - 1));
    },

    makeRGBAFillValue: function(r, g, b, a) {
        if(typeof a === 'undefined') {
            a = 1.0;
        }
        return "rgba(" + r + ", " + g + ", " + b + ", " + a + ")";
    },

    //used
    parseFileDirectory: function (byteOffset) {
        var numDirEntries = this.getBytes(2, byteOffset);

        var tiffFields = [];

        for (var i = byteOffset + 2, entryCount = 0; entryCount < numDirEntries; i += 12, entryCount++) {
            var fieldTag = this.getBytes(2, i);
            var fieldType = this.getBytes(2, i + 2);
            var typeCount = this.getBytes(4, i + 4);
            var valueOffset = this.getBytes(4, i + 8);

            var fieldTagName = this.getFieldTagName( fieldTag );
            var fieldTypeName = this.getFieldTypeName( fieldType );

            var fieldValues = this.getFieldValues(fieldTagName, fieldTypeName, typeCount, valueOffset);

            tiffFields[fieldTagName] = { 'type': fieldTypeName, 'values': fieldValues };
        }

        this.fileDirectories.push( tiffFields );

        var nextIFDByteOffset = this.getBytes(4, i);

        if (nextIFDByteOffset === 0x00000000) {
            return this.fileDirectories;
        } else {
            return this.parseFileDirectory(nextIFDByteOffset);
        }
    },

    parseTIFF: function (tiffArrayBuffer, canvas) {
        canvas = canvas || document.createElement('canvas');
        if(!(tiffArrayBuffer instanceof ArrayBuffer)){
            var arrBuffer = new ArrayBuffer(tiffArrayBuffer.length);
            var uint8 = new Uint8Array(arrBuffer);
            uint8.set(tiffArrayBuffer);
            tiffArrayBuffer = arrBuffer;
        }
        this.tiffDataView = new DataView(tiffArrayBuffer);
        this.canvas = canvas;

        this.littleEndian = this.isLittleEndian(this.tiffDataView);

        if (!this.hasTowel(this.tiffDataView, this.littleEndian)) {
            return;
        }

        var firstIFDByteOffset = this.getBytes(4, 4);

        this.fileDirectories = this.parseFileDirectory(firstIFDByteOffset);

        var fileDirectory = this.fileDirectories[0];

        console.log( fileDirectory );

        var imageWidth = fileDirectory.ImageWidth.values[0];
        var imageLength = fileDirectory.ImageLength.values[0];

        this.canvas.width = imageWidth;
        this.canvas.height = imageLength;

        var strips = [];

        var compression = (fileDirectory.Compression) ? fileDirectory.Compression.values[0] : 1;

        var samplesPerPixel = fileDirectory.SamplesPerPixel.values[0];

        var sampleProperties = [];

        var bitsPerPixel = 0;
        var hasBytesPerPixel = false;

        fileDirectory.BitsPerSample.values.forEach(function(bitsPerSample, i, bitsPerSampleValues) {
            sampleProperties[i] = {
                'bitsPerSample': bitsPerSample,
                'hasBytesPerSample': false,
                'bytesPerSample': undefined
            };

            if ((bitsPerSample % 8) === 0) {
                sampleProperties[i].hasBytesPerSample = true;
                sampleProperties[i].bytesPerSample = bitsPerSample / 8;
            }

            bitsPerPixel += bitsPerSample;
        }, this);

        if ((bitsPerPixel % 8) === 0) {
            hasBytesPerPixel = true;
            var bytesPerPixel = bitsPerPixel / 8;
        }

        var stripOffsetValues = fileDirectory.StripOffsets.values;
        var numStripOffsetValues = stripOffsetValues.length;

        // StripByteCounts is supposed to be required, but see if we can recover anyway.
        if (fileDirectory.StripByteCounts) {
            var stripByteCountValues = fileDirectory.StripByteCounts.values;
        } else {
            console.log("Missing StripByteCounts!");

            // Infer StripByteCounts, if possible.
            if (numStripOffsetValues === 1) {
                var stripByteCountValues = [Math.ceil((imageWidth * imageLength * bitsPerPixel) / 8)];
            } else {
                throw Error("Cannot recover from missing StripByteCounts");
            }
        }

        // Loop through strips and decompress as necessary.
        for (var i = 0; i < numStripOffsetValues; i++) {
            var stripOffset = stripOffsetValues[i];
            strips[i] = [];

            var stripByteCount = stripByteCountValues[i];

            // Loop through pixels.
            for (var byteOffset = 0, bitOffset = 0, jIncrement = 1, getHeader = true, pixel = [], numBytes = 0, sample = 0, currentSample = 0; byteOffset < stripByteCount; byteOffset += jIncrement) {
                // Decompress strip.
                switch (compression) {
                    // Uncompressed
                    case 1:
                        // Loop through samples (sub-pixels).
                        for (var m = 0, pixel = []; m < samplesPerPixel; m++) {
                            if (sampleProperties[m].hasBytesPerSample) {
                                // XXX: This is wrong!
                                var sampleOffset = sampleProperties[m].bytesPerSample * m;

                                pixel.push(this.getBytes(sampleProperties[m].bytesPerSample, stripOffset + byteOffset + sampleOffset));
                            } else {
                                var sampleInfo = this.getBits(sampleProperties[m].bitsPerSample, stripOffset + byteOffset, bitOffset);

                                pixel.push(sampleInfo.bits);

                                byteOffset = sampleInfo.byteOffset - stripOffset;
                                bitOffset = sampleInfo.bitOffset;

                                throw RangeError("Cannot handle sub-byte bits per sample");
                            }
                        }

                        strips[i].push(pixel);

                        if (hasBytesPerPixel) {
                            jIncrement = bytesPerPixel;
                        } else {
                            jIncrement = 0;

                            throw RangeError("Cannot handle sub-byte bits per pixel");
                        }
                        break;

                    // CITT Group 3 1-Dimensional Modified Huffman run-length encoding
                    case 2:
                        // XXX: Use PDF.js code?
                        break;

                    // Group 3 Fax
                    case 3:
                        // XXX: Use PDF.js code?
                        break;

                    // Group 4 Fax
                    case 4:
                        // XXX: Use PDF.js code?
                        break;

                    // LZW
                    case 5:
                        // XXX: Use PDF.js code?
                        break;

                    // Old-style JPEG (TIFF 6.0)
                    case 6:
                        // XXX: Use PDF.js code?
                        break;

                    // New-style JPEG (TIFF Specification Supplement 2)
                    case 7:
                        // XXX: Use PDF.js code?
                        break;

                    // PackBits
                    case 32773:
                        // Are we ready for a new block?
                        if (getHeader) {
                            getHeader = false;

                            var blockLength = 1;
                            var iterations = 1;

                            // The header byte is signed.
                            var header = this.tiffDataView.getInt8(stripOffset + byteOffset, this.littleEndian);

                            if ((header >= 0) && (header <= 127)) { // Normal pixels.
                                blockLength = header + 1;
                            } else if ((header >= -127) && (header <= -1)) { // Collapsed pixels.
                                iterations = -header + 1;
                            } else /*if (header === -128)*/ { // Placeholder byte?
                                getHeader = true;
                            }
                        } else {
                            var currentByte = this.getBytes(1, stripOffset + byteOffset);

                            // Duplicate bytes, if necessary.
                            for (var m = 0; m < iterations; m++) {
                                if (sampleProperties[sample].hasBytesPerSample) {
                                    // We're reading one byte at a time, so we need to handle multi-byte samples.
                                    currentSample = (currentSample << (8 * numBytes)) | currentByte;
                                    numBytes++;

                                    // Is our sample complete?
                                    if (numBytes === sampleProperties[sample].bytesPerSample) {
                                        pixel.push(currentSample);
                                        currentSample = numBytes = 0;
                                        sample++;
                                    }
                                } else {
                                    throw RangeError("Cannot handle sub-byte bits per sample");
                                }

                                // Is our pixel complete?
                                if (sample === samplesPerPixel)
                                {
                                    strips[i].push(pixel);

                                    pixel = [];
                                    sample = 0;
                                }
                            }

                            blockLength--;

                            // Is our block complete?
                            if (blockLength === 0) {
                                getHeader = true;
                            }
                        }

                        jIncrement = 1;
                        break;

                    // Unknown compression algorithm
                    default:
                        // Do not attempt to parse the image data.
                        break;
                }
            }

//			console.log( strips[i] );
        }

//		console.log( strips );

        if (canvas.getContext) {
            var ctx = this.canvas.getContext("2d");

            // Set a default fill style.
            ctx.fillStyle = this.makeRGBAFillValue(255, 255, 255, 0);

            // If RowsPerStrip is missing, the whole image is in one strip.
            if (fileDirectory.RowsPerStrip) {
                var rowsPerStrip = fileDirectory.RowsPerStrip.values[0];
            } else {
                var rowsPerStrip = imageLength;
            }

            var numStrips = strips.length;

            var imageLengthModRowsPerStrip = imageLength % rowsPerStrip;
            var rowsInLastStrip = (imageLengthModRowsPerStrip === 0) ? rowsPerStrip : imageLengthModRowsPerStrip;

            var numRowsInStrip = rowsPerStrip;
            var numRowsInPreviousStrip = 0;

            var photometricInterpretation = fileDirectory.PhotometricInterpretation.values[0];

            var extraSamplesValues = [];
            var numExtraSamples = 0;

            if (fileDirectory.ExtraSamples) {
                extraSamplesValues = fileDirectory.ExtraSamples.values;
                numExtraSamples = extraSamplesValues.length;
            }

            if (fileDirectory.ColorMap) {
                var colorMapValues = fileDirectory.ColorMap.values;
                var colorMapSampleSize = Math.pow(2, sampleProperties[0].bitsPerSample);
            }

            // Loop through the strips in the image.
            for (var i = 0; i < numStrips; i++) {
                // The last strip may be short.
                if ((i + 1) === numStrips) {
                    numRowsInStrip = rowsInLastStrip;
                }

                var numPixels = strips[i].length;
                var yPadding = numRowsInPreviousStrip * i;

                // Loop through the rows in the strip.
                for (var y = 0, j = 0; y < numRowsInStrip, j < numPixels; y++) {
                    // Loop through the pixels in the row.
                    for (var x = 0; x < imageWidth; x++, j++) {
                        var pixelSamples = strips[i][j];

                        var red = 0;
                        var green = 0;
                        var blue = 0;
                        var opacity = 1.0;

                        if (numExtraSamples > 0) {
                            for (var k = 0; k < numExtraSamples; k++) {
                                if (extraSamplesValues[k] === 1 || extraSamplesValues[k] === 2) {
                                    // Clamp opacity to the range [0,1].
                                    opacity = pixelSamples[3 + k] / 256;

                                    break;
                                }
                            }
                        }

                        switch (photometricInterpretation) {
                            // Bilevel or Grayscale
                            // WhiteIsZero
                            case 0:
                                if (sampleProperties[0].hasBytesPerSample) {
                                    var invertValue = Math.pow(0x10, sampleProperties[0].bytesPerSample * 2);
                                }

                                // Invert samples.
                                pixelSamples.forEach(function(sample, index, samples) { samples[index] = invertValue - sample; });

                            // Bilevel or Grayscale
                            // BlackIsZero
                            case 1:
                                red = green = blue = this.clampColorSample(pixelSamples[0], sampleProperties[0].bitsPerSample);
                                break;

                            // RGB Full Color
                            case 2:
                                red = this.clampColorSample(pixelSamples[0], sampleProperties[0].bitsPerSample);
                                green = this.clampColorSample(pixelSamples[1], sampleProperties[1].bitsPerSample);
                                blue = this.clampColorSample(pixelSamples[2], sampleProperties[2].bitsPerSample);
                                break;

                            // RGB Color Palette
                            case 3:
                                if (colorMapValues === undefined) {
                                    throw Error("Palette image missing color map");
                                }

                                var colorMapIndex = pixelSamples[0];

                                red = this.clampColorSample(colorMapValues[colorMapIndex], 16);
                                green = this.clampColorSample(colorMapValues[colorMapSampleSize + colorMapIndex], 16);
                                blue = this.clampColorSample(colorMapValues[(2 * colorMapSampleSize) + colorMapIndex], 16);
                                break;

                            // Transparency mask
                            case 4:
                                throw RangeError( 'Not Yet Implemented: Transparency mask' );
                                break;

                            // CMYK
                            case 5:
                                throw RangeError( 'Not Yet Implemented: CMYK' );
                                break;

                            // YCbCr
                            case 6:
                                throw RangeError( 'Not Yet Implemented: YCbCr' );
                                break;

                            // CIELab
                            case 8:
                                throw RangeError( 'Not Yet Implemented: CIELab' );
                                break;

                            // Unknown Photometric Interpretation
                            default:
                                throw RangeError( 'Unknown Photometric Interpretation:', photometricInterpretation );
                                break;
                        }

                        ctx.fillStyle = this.makeRGBAFillValue(red, green, blue, opacity);
                        ctx.fillRect(x, yPadding + y, 1, 1);
                    }
                }

                numRowsInPreviousStrip = numRowsInStrip;
            }
        }

        /*		for (var i = 0, numFileDirectories = this.fileDirectories.length; i < numFileDirectories; i++) {
         // Stuff
         }*/

        return this.canvas;
    }
};
