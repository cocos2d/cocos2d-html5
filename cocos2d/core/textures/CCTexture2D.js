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

//CONSTANTS:

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
//----------------------Possible texture pixel formats----------------------------


// By default PVR images are treated as if they don't have the alpha channel premultiplied
cc.PVRHaveAlphaPremultiplied_ = false;

//cc.Texture2DWebGL move to TextureWebGL.js

cc.game.addEventListener(cc.game.EVENT_RENDERER_INITED, function () {

    if (cc._renderType === cc.game.RENDER_TYPE_WEBGL) {
        cc.assert(cc.isFunction(cc._tmp.WebGLTexture2D), cc._LogInfos.MissingFile, "TexturesWebGL.js");
        cc._tmp.WebGLTexture2D();
        delete cc._tmp.WebGLTexture2D;

        cc.EventHelper.prototype.apply(cc.Texture2D.prototype);

        cc.assert(cc.isFunction(cc._tmp.PrototypeTexture2D), cc._LogInfos.MissingFile, "TexturesPropertyDefine.js");
        cc._tmp.PrototypeTexture2D();
        delete cc._tmp.PrototypeTexture2D;
    }
});
