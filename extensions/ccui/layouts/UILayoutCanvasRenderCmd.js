/****************************************************************************
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

(function(){
    ccui.Layout.CanvasRenderCmd = function(renderable){
        ccui.ProtectedNode.CanvasRenderCmd.call(this, renderable);
        this._needDraw = false;

        this._locCache = null;

        this._rendererSaveCmd = new cc.CustomRenderCmd(this, this._onRenderSaveCmd);
        this._rendererSaveCmdSprite = new cc.CustomRenderCmd(this, this._onRenderSaveSpriteCmd);
        this._rendererClipCmd = new cc.CustomRenderCmd(this, this._onRenderClipCmd);
        this._rendererRestoreCmd = new cc.CustomRenderCmd(this, this._onRenderRestoreCmd);
    };

    var proto = ccui.Layout.CanvasRenderCmd.prototype = Object.create(ccui.ProtectedNode.CanvasRenderCmd.prototype);
    proto.constructor = ccui.Layout.CanvasRenderCmd;

    proto._onRenderSaveCmd = function(ctx, scaleX, scaleY){
        var context = ctx || cc._renderContext;

        var node = this._node;
        if (node._clipElemType) {
            var canvas = context.canvas;
            this._locCache = ccui.Layout.CanvasRenderCmd._getSharedCache();
            this._locCache.width = canvas.width;
            this._locCache.height = canvas.height;
            var locCacheCtx = this._locCache.getContext("2d");
            locCacheCtx.drawImage(canvas, 0, 0);
            context.save();
        }else{
            var parentCmd = node._parent ? node._parent._renderCmd : null;
            this.transform(parentCmd);
            var t = this._worldTransform;
            context.save();
            context.save();
            context.transform(t.a, t.c, t.b, t.d, t.tx * scaleX, -t.ty * scaleY);
        }
    };

    proto._onRenderSaveSpriteCmd = function(ctx){
        var context = ctx || cc._renderContext;

        var node = this._node;
        if (node._clipElemType) {
            context.globalCompositeOperation = "destination-in";

            var parentCmd = node._parent ? node._parent._renderCmd : null;
            this.transform(parentCmd);
        }else{
        }
    };

    proto._onRenderClipCmd = function(ctx){
        var context = ctx || cc._renderContext;

        if (this._node._clipElemType) {
        }else{
            context.restore();
            context.clip();
        }
    };

    proto._onRenderRestoreCmd = function(ctx){
        var context = ctx || cc._renderContext;

        var node = this._node;
        if (node._clipElemType) {
            context.restore();

            // Redraw the cached canvas, so that the cliped area shows the background etc.
            context.save();
            context.setTransform(1, 0, 0, 1, 0, 0);
            context.globalCompositeOperation = "destination-over";
            context.drawImage(this._locCache, 0, 0);
            context.restore();
        }else{
            context.restore();
        }
    };

    proto.rebindStencilRendering = function(stencil){
        stencil._renderCmd.rendering = this.__stencilDraw;
    };

    proto.__stencilDraw = function(ctx,scaleX, scaleY){          //Only for Canvas
        var locContext = ctx || cc._renderContext;
        var buffer = this._buffer;
        for (var i = 0, bufLen = buffer.length; i < bufLen; i++) {
            var element = buffer[i], vertices = element.verts;
            var firstPoint = vertices[0];
            locContext.beginPath();
            locContext.moveTo(firstPoint.x * scaleX, -firstPoint.y * scaleY);
            for (var j = 1, len = vertices.length; j < len; j++)
                locContext.lineTo(vertices[j].x * scaleX, -vertices[j].y * scaleY);
        }
    };

    proto.stencilClippingVisit = proto.scissorClippingVisit = function(parentCmd){
        var node = this._node;
        if (!node._clippingStencil || !node._clippingStencil.isVisible())
            return;

        var i, locChild;
        node._clipElemType = node._stencil instanceof cc.Sprite;

        this._syncStatus(parentCmd);
        this._dirtyFlag = 0;

        cc.renderer.pushRenderCommand(this._rendererSaveCmd);

        if (node._clipElemType) {
            cc.ProtectedNode.prototype.visit.call(node, parentCmd);
            cc.renderer.pushRenderCommand(this._rendererSaveCmdSprite);
        }
        node._clippingStencil.visit(this);

        cc.renderer.pushRenderCommand(this._rendererClipCmd);

        if (!node._clipElemType) {
            node.sortAllChildren();
            node.sortAllProtectedChildren();

            var children = node._children;
            var j, locProtectChildren = node._protectedChildren;
            var iLen = children.length, jLen = locProtectChildren.length;

            // draw children zOrder < 0
            for (i = 0; i < iLen; i++) {
                locChild = children[i];
                if (locChild && locChild._localZOrder < 0)
                    locChild.visit(this);
                else
                    break;
            }
            for (j = 0; j < jLen; j++) {
                locChild = locProtectChildren[j];
                if (locChild && locChild._localZOrder < 0)
                    locChild.visit(this);
                else
                    break;
            }
            //this.draw(context);
            for (; i < iLen; i++)
                children[i].visit(this);
            for (; j < jLen; j++)
                locProtectChildren[j].visit(this);

            cc.renderer.pushRenderCommand(this._rendererRestoreCmd);
        }
    };

    ccui.Layout.CanvasRenderCmd._getSharedCache = function () {
        return (cc.ClippingNode._sharedCache) || (cc.ClippingNode._sharedCache = cc.newElement("canvas"));
    };
})();