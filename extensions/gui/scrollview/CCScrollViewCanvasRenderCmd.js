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
    cc.ScrollView.CanvasRenderCmd = function(renderable){
        cc.Layer.CanvasRenderCmd.call(this, renderable);
        this._needDraw = false;

        this.startCmd = new cc.CustomRenderCmd(this, this._startCmd);
        this.endCmd = new cc.CustomRenderCmd(this, this._endCmd);
    };

    var proto = cc.ScrollView.CanvasRenderCmd.prototype = Object.create(cc.Layer.CanvasRenderCmd.prototype);
    proto.constructor = cc.ScrollView.CanvasRenderCmd;

    proto._startCmd = function(ctx, scaleX, scaleY){
        var node = this._node;
        ctx = ctx || cc._renderContext;
        ctx.save();
        ctx.save();
        this.transform();
        var t = this._worldTransform;
        ctx.transform(t.a, t.b, t.c, t.d, t.tx * scaleX, -t.ty * scaleY);


        if (this._node._clippingToBounds) {
            this._scissorRestored = false;

            var locScaleX = node.getScaleX();
            var locScaleY = node.getScaleY();

            ctx = ctx || cc._renderContext;

            var getWidth = (node._viewSize.width * locScaleX) * scaleX;
            var getHeight = (node._viewSize.height * locScaleY) * scaleY;
            var startX = 0;
            var startY = 0;

            ctx.beginPath();
            ctx.rect(startX, startY, getWidth, -getHeight);
            ctx.restore();
            ctx.clip();
            ctx.closePath();

        }
    };

    proto._endCmd = function(ctx){
        ctx = ctx || cc._renderContext;
        ctx.restore();
    };

    proto.visit = function(parentCmd){
        var node = this._node;
        var i, locChildren = node._children, selChild, childrenLen;

        this.transform(parentCmd);

        cc.renderer.pushRenderCommand(this.startCmd);

        if (locChildren && locChildren.length > 0) {
            childrenLen = locChildren.length;
            node.sortAllChildren();
            // draw children zOrder < 0
            for (i = 0; i < childrenLen; i++) {
                selChild = locChildren[i];
                if (selChild && selChild._localZOrder < 0)
                    selChild._renderCmd.visit();
                else
                    break;
            }

            // draw children zOrder >= 0
            for (; i < childrenLen; i++)
                locChildren[i]._renderCmd.visit();
        }

        cc.renderer.pushRenderCommand(this.endCmd);

    };

})();