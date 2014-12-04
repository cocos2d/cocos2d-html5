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

(function() {
    cc.Scale9Sprite.WebGLRenderCmd = function (renderable) {
        cc.Node.WebGLRenderCmd.call(this, renderable);
        this._cachedParent = null;
        this._cacheDirty = false;
    };

    var proto = cc.Scale9Sprite.WebGLRenderCmd.prototype = Object.create(cc.Node.WebGLRenderCmd.prototype);
    proto.constructor = cc.Scale9Sprite.WebGLRenderCmd;

    proto.addBatchNodeToChildren = function(batchNode){
        this._node.addChild(batchNode);
    };

    proto._computeSpriteScale = function (sizableWidth, sizableHeight, centerWidth, centerHeight) {
        var horizontalScale = sizableWidth / centerWidth, verticalScale = sizableHeight / centerHeight;
        var rescaledWidth = centerWidth * horizontalScale, rescaledHeight = centerHeight * verticalScale;

        var roundedRescaledWidth = Math.round(rescaledWidth);
        if (rescaledWidth !== roundedRescaledWidth) {
            rescaledWidth = roundedRescaledWidth;
            horizontalScale = rescaledWidth / centerWidth;
        }
        var roundedRescaledHeight = Math.round(rescaledHeight);
        if (rescaledHeight !== roundedRescaledHeight) {
            rescaledHeight = roundedRescaledHeight;
            verticalScale = rescaledHeight / centerHeight;
        }

        return {horizontalScale: horizontalScale, verticalScale: verticalScale,
            rescaledWidth: rescaledWidth, rescaledHeight: rescaledHeight}
    };

    proto.visit = function(parentCmd){
        var node = this._node;
        if(!node._visible){
            return;
        }

        if (node._positionsAreDirty) {
            node._updatePositions();
            node._positionsAreDirty = false;
            node._scale9Dirty = true;
        }
        cc.Node.WebGLRenderCmd.prototype.visit.call(this, parentCmd);
    };
})();