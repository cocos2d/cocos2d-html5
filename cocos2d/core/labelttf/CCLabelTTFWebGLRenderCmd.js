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

// ----------------------------------- LabelTTF WebGL render cmd ----------------------------

cc.LabelTTF.WebGLRenderCmd = function(renderable){
    cc.Sprite.WebGLRenderCmd.call(this, renderable);
    cc.LabelTTF.RenderCmd.call(this);
};

cc.LabelTTF.WebGLRenderCmd.prototype = Object.create(cc.Sprite.WebGLRenderCmd.prototype);
cc.inject(cc.LabelTTF.RenderCmd.prototype, cc.LabelTTF.WebGLRenderCmd.prototype);     //multi-inherit
cc.LabelTTF.WebGLRenderCmd.prototype.constructor = cc.LabelTTF.WebGLRenderCmd;

cc.LabelTTF.WebGLRenderCmd.prototype._setColorsString = function(){
    this.setDirtyFlag(cc.Node._dirtyFlags.textDirty);
    var node = this._node;
    var locStrokeColor = node._strokeColor, locFontFillColor = node._textFillColor;
    this._shadowColorStr = "rgba(128,128,128," + this._shadowOpacity + ")";
    this._fillColorStr = "rgba(" + (0 | locFontFillColor.r) + "," + (0 | locFontFillColor.g) + "," + (0 | locFontFillColor.b) + ", 1)";
    this._strokeColorStr = "rgba(" + (0 | locStrokeColor.r) + "," + (0 | locStrokeColor.g) + "," + (0 | locStrokeColor.b) + ", 1)";
};