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
 * @constant
 * @type Number
 */
cc.INVALID_INDEX = -1;

/**
 * PI is the ratio of a circle's circumference to its diameter.
 * @constant
 * @type Number
 */
cc.PI = Math.PI;

/**
 * @constant
 * @type Number
 */
cc.FLT_MAX = parseFloat('3.402823466e+38F');

/**
 * @constant
 * @type Number
 */
cc.RAD = cc.PI / 180;

/**
 * @constant
 * @type Number
 */
cc.DEG = 180 / cc.PI;

/**
 * maximum unsigned int value
 * @constant
 * @type Number
 */
cc.UINT_MAX = 0xffffffff;

/**
 * <p>
 * simple macro that swaps 2 variables<br/>
 *  modified from c++ macro, you need to pass in the x and y variables names in string, <br/>
 *  and then a reference to the whole object as third variable
 * </p>
 * @param x
 * @param y
 * @param ref
 * @function
 * @deprecated
 */
cc.SWAP = function (x, y, ref) {
    if ((typeof ref) == 'object' && (typeof ref.x) != 'undefined' && (typeof ref.y) != 'undefined') {
        var tmp = ref[x];
        ref[x] = ref[y];
        ref[y] = tmp;
    } else
        cc.log("cc.SWAP is being modified from original macro, please check usage");
};

/**
 * <p>
 *     Linear interpolation between 2 numbers, the ratio sets how much it is biased to each end
 * </p>
 * @param {Number} a number A
 * @param {Number} b number B
 * @param {Number} r ratio between 0 and 1
 * @function
 * @example
 * cc.lerp(2,10,0.5)//returns 6<br/>
 * cc.lerp(2,10,0.2)//returns 3.6
 */
cc.lerp = function (a, b, r) {
    return a + (b - a) * r;
};

/**
 * returns a random float between -1 and 1
 * @return {Number}
 * @function
 */
cc.RANDOM_MINUS1_1 = function () {
    return (Math.random() - 0.5) * 2;
};

/**
 * returns a random float between 0 and 1
 * @return {Number}
 * @function
 */
cc.RANDOM_0_1 = function () {
    return Math.random();
};

/**
 * converts degrees to radians
 * @param {Number} angle
 * @return {Number}
 * @function
 */
cc.DEGREES_TO_RADIANS = function (angle) {
    return angle * cc.RAD;
};

/**
 * converts radians to degrees
 * @param {Number} angle
 * @return {Number}
 * @function
 */
cc.RADIANS_TO_DEGREES = function (angle) {
    return angle * cc.DEG;
};

/**
 * @constant
 * @type Number
 */
cc.REPEAT_FOREVER = Number.MAX_VALUE - 1;

/**
 * default gl blend src function. Compatible with premultiplied alpha images.
 * @constant
 * @type Number
 */
cc.BLEND_SRC = cc.OPTIMIZE_BLEND_FUNC_FOR_PREMULTIPLIED_ALPHA ? 1 : 0x0302;

/**
 * default gl blend dst function. Compatible with premultiplied alpha images.
 * @constant
 * @type Number
 */
cc.BLEND_DST = 0x0303;

/**
 * Helpful macro that setups the GL server state, the correct GL program and sets the Model View Projection matrix
 * @param {cc.Node} node setup node
 * @function
 */
cc.NODE_DRAW_SETUP = function (node) {
    //cc.glEnable(node._glServerState);
    if (node._shaderProgram) {
        //cc.renderContext.useProgram(node._shaderProgram._programObj);
        node._shaderProgram.use();
        node._shaderProgram.setUniformForModelViewAndProjectionMatrixWithMat4();
    }
};

/**
 * <p>
 *     GL states that are enabled:<br/>
 *       - GL_TEXTURE_2D<br/>
 *       - GL_VERTEX_ARRAY<br/>
 *       - GL_TEXTURE_COORD_ARRAY<br/>
 *       - GL_COLOR_ARRAY<br/>
 * </p>
 * @function
 */
cc.ENABLE_DEFAULT_GL_STATES = function () {
    //TODO OPENGL STUFF
    /*
     glEnableClientState(GL_VERTEX_ARRAY);
     glEnableClientState(GL_COLOR_ARRAY);
     glEnableClientState(GL_TEXTURE_COORD_ARRAY);
     glEnable(GL_TEXTURE_2D);*/
};

/**
 * <p>
 *   Disable default GL states:<br/>
 *     - GL_TEXTURE_2D<br/>
 *     - GL_TEXTURE_COORD_ARRAY<br/>
 *     - GL_COLOR_ARRAY<br/>
 * </p>
 * @function
 */
cc.DISABLE_DEFAULT_GL_STATES = function () {
    //TODO OPENGL
    /*
     glDisable(GL_TEXTURE_2D);
     glDisableClientState(GL_COLOR_ARRAY);
     glDisableClientState(GL_TEXTURE_COORD_ARRAY);
     glDisableClientState(GL_VERTEX_ARRAY);
     */
};

/**
 * <p>
 *  Increments the GL Draws counts by one.<br/>
 *  The number of calls per frame are displayed on the screen when the CCDirector's stats are enabled.<br/>
 * </p>
 * @param {Number} addNumber
 * @function
 */
cc.INCREMENT_GL_DRAWS = function (addNumber) {
    cc.g_NumberOfDraws += addNumber;
};

/**
 * @constant
 * @type Number
 */
cc.FLT_EPSILON = 0.0000001192092896;

/**
 * <p>
 *     On Mac it returns 1;<br/>
 *     On iPhone it returns 2 if RetinaDisplay is On. Otherwise it returns 1
 * </p>
 * @function
 */
cc.CONTENT_SCALE_FACTOR = cc.IS_RETINA_DISPLAY_SUPPORTED ? function () {
    return cc.Director.getInstance().getContentScaleFactor();
} : function () {
    return 1;
};

/**
 * Converts a Point in points to pixels
 * @param {cc.Point} points
 * @return {cc.Point}
 * @function
 */
cc.POINT_POINTS_TO_PIXELS = function (points) {
    var scale = cc.CONTENT_SCALE_FACTOR();
    return cc.p(points.x * scale, points.y * scale);
};

cc._POINT_POINTS_TO_PIXELS_OUT = function (points, outPixels) {
    var scale = cc.CONTENT_SCALE_FACTOR();
    outPixels._x = points.x * scale;
    outPixels._y = points.y * scale;
};

/**
 * Converts a Size in points to pixels
 * @param {cc.Size} sizeInPoints
 * @return {cc.Size}
 * @function
 */
cc.SIZE_POINTS_TO_PIXELS = function (sizeInPoints) {
    var scale = cc.CONTENT_SCALE_FACTOR();
    return cc.size(sizeInPoints.width * scale, sizeInPoints.height * scale);
};

/**
 * Converts a size in pixels to points
 * @param {cc.Size} sizeInPixels
 * @return {cc.Size}
 * @function
 */
cc.SIZE_PIXELS_TO_POINTS = function (sizeInPixels) {
    var scale = cc.CONTENT_SCALE_FACTOR();
    return cc.size(sizeInPixels.width / scale, sizeInPixels.height / scale);
};

cc._SIZE_PIXELS_TO_POINTS_OUT = function (sizeInPixels, outSize) {
    var scale = cc.CONTENT_SCALE_FACTOR();
    outSize._width = sizeInPixels.width / scale;
    outSize._height = sizeInPixels.height / scale;
};

/**
 * Converts a Point in pixels to points
 * @param {Point} pixels
 * @function
 */
cc.POINT_PIXELS_TO_POINTS = function (pixels) {
    var scale = cc.CONTENT_SCALE_FACTOR();
    return cc.p(pixels.x / scale, pixels.y / scale);
};

cc._POINT_PIXELS_TO_POINTS_OUT = function(pixels, outPoint){
    var scale = cc.CONTENT_SCALE_FACTOR();
    outPoint._x = pixels.x / scale;
    outPoint._y = pixels.y / scale;
};

/**
 * Converts a rect in pixels to points
 * @param {cc.Rect} pixel
 * @function
 */
cc.RECT_PIXELS_TO_POINTS = cc.IS_RETINA_DISPLAY_SUPPORTED ? function (pixel) {
    var scale = cc.CONTENT_SCALE_FACTOR();
    return cc.rect(pixel.x / scale, pixel.y / scale,
        pixel.width / scale, pixel.height / scale);
} : function (p) {
    return p;
};

/**
 * Converts a rect in points to pixels
 * @param {cc.Rect} point
 * @function
 */
cc.RECT_POINTS_TO_PIXELS = cc.IS_RETINA_DISPLAY_SUPPORTED ? function (point) {
   var scale = cc.CONTENT_SCALE_FACTOR();
    return cc.rect(point.x * scale, point.y * scale,
        point.width * scale, point.height * scale);
} : function (p) {
    return p;
};

if (!cc.Browser.supportWebGL) {
    /**
     * WebGL constants
     * @type {object}
     */
    var gl = gl || {};

    /**
     * @constant
     * @type Number
     */
    gl.ONE = 1;

    /**
     * @constant
     * @type Number
     */
    gl.ZERO = 0;

    /**
     * @constant
     * @type Number
     */
    gl.SRC_ALPHA = 0x0302;

    /**
     * @constant
     * @type Number
     */
    gl.ONE_MINUS_SRC_ALPHA = 0x0303;

    /**
     * @constant
     * @type Number
     */
    gl.ONE_MINUS_DST_COLOR = 0x0307;
}

cc.CHECK_GL_ERROR_DEBUG = function () {
    if (cc.renderMode == cc.WEBGL) {
        var _error = cc.renderContext.getError();
        if (_error) {
            cc.log("WebGL error " + _error);
        }
    }
};
