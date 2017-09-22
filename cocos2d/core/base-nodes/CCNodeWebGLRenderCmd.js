/****************************************************************************
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
// ------------------------------ The cc.Node's render command for WebGL ----------------------------------
(function () {
    cc.Node.WebGLRenderCmd = function (renderable) {
        this._node = renderable;
        this._anchorPointInPoints = {x: 0, y: 0};
        this._displayedColor = cc.color(255, 255, 255, 255);
        this._glProgramState = null;
    };

    var proto = cc.Node.WebGLRenderCmd.prototype = Object.create(cc.Node.RenderCmd.prototype);
    proto.constructor = cc.Node.WebGLRenderCmd;
    proto._rootCtor = cc.Node.WebGLRenderCmd;

    proto._updateColor = function () {
    };

    proto.setShaderProgram = function (shaderProgram) {
        this._glProgramState = cc.GLProgramState.getOrCreateWithGLProgram(shaderProgram);
    };

    proto.getShaderProgram = function () {
        return this._glProgramState ? this._glProgramState.getGLProgram() : null;
    };

    proto.getGLProgramState = function () {
        return this._glProgramState;
    };

    proto.setGLProgramState = function (glProgramState) {
        this._glProgramState = glProgramState;
    };

    // Use a property getter/setter for backwards compatability, and
    // to ease the transition from using glPrograms directly, to 
    // using glProgramStates. 
    Object.defineProperty(proto, '_shaderProgram', {
        set: function (value) { this.setShaderProgram(value); },
        get: function () { return this.getShaderProgram(); }
    });
    /** @expose */
    proto._shaderProgram;
})();
