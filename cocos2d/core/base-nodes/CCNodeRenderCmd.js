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

//The cc.Node's render command for Canvas
cc.NodeCanvasRenderCmd = function(){
    this._needDraw = false;
    this._anchorPointInPoints = new cc.Point(0,0);
    this._transform = {a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0};
    this._transformWorld = {a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0};

};

cc.NodeCanvasRenderCmd.prototype = {
    constructor: cc.NodeCanvasRenderCmd

};

//register to renderer

//The cc.Node's render command for WebGL
cc.NodeWebGLRenderCmd = function(){
    this._needDraw = false;
};

cc.NodeWebGLRenderCmd.prototype = {
    constructor: cc.NodeCanvasRenderCmd

};