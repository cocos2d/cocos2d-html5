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

        this._rendererSaveCmd = new cc.CustomRenderCmd(this, this._onRenderSaveCmd);
        this._rendererClipCmd = new cc.CustomRenderCmd(this, this._onRenderClipCmd);
        this._rendererRestoreCmd = new cc.CustomRenderCmd(this, this._onRenderRestoreCmd);
        this._rendererSaveCmd._canUseDirtyRegion = true;
        this._rendererClipCmd._canUseDirtyRegion = true;
        this._rendererRestoreCmd._canUseDirtyRegion = true;
    };

    var proto = ccui.Layout.CanvasRenderCmd.prototype = Object.create(ccui.ProtectedNode.CanvasRenderCmd.prototype);
    proto.constructor = ccui.Layout.CanvasRenderCmd;

    cc.game.addEventListener(cc.game.EVENT_RENDERER_INITED, function () {
        if (ccui.Widget.CanvasRenderCmd) {
            ccui.Layout.CanvasRenderCmd.prototype.widgetVisit = ccui.Widget.CanvasRenderCmd.prototype.widgetVisit;
        }
    });

    proto.visit = function(parentCmd){
        var node = this._node;
        if (!node._visible)
            return;
        node._adaptRenderers();
        node._doLayout();

        if (node._clippingEnabled) {
            switch (node._clippingType) {
                case ccui.Layout.CLIPPING_STENCIL:
                    this.stencilClippingVisit(parentCmd);
                    break;
                case ccui.Layout.CLIPPING_SCISSOR:
                    this.scissorClippingVisit(parentCmd);
                    break;
                default:
                    break;
            }
        } else {
            this.widgetVisit(parentCmd);
        }
    };

    proto.layoutVisit = proto.visit;

    proto._onRenderSaveCmd = function(ctx, scaleX, scaleY){
        var wrapper = ctx || cc._renderContext, context = wrapper.getContext();
        wrapper.save();
        wrapper.save();
        wrapper.setTransform(this._worldTransform, scaleX, scaleY);
        var buffer = this._node._clippingStencil._renderCmd._buffer;

        for (var i = 0, bufLen = buffer.length; i < bufLen; i++) {
            var element = buffer[i], vertices = element.verts;
            var firstPoint = vertices[0];
            context.beginPath();
            context.moveTo(firstPoint.x, -firstPoint.y );
            for (var j = 1, len = vertices.length; j < len; j++)
                context.lineTo(vertices[j].x , -vertices[j].y );
            context.closePath();
        }
    };

    proto._onRenderClipCmd = function(ctx){
        var wrapper = ctx || cc._renderContext, context = wrapper.getContext();
        wrapper.restore();
        context.clip();
    };

    proto._onRenderRestoreCmd = function(ctx){
        var wrapper = ctx || cc._renderContext, context = wrapper.getContext();

        wrapper.restore();
    };

    proto.rebindStencilRendering = function(stencil){
        stencil._renderCmd.rendering = this.__stencilDraw;
        stencil._renderCmd._canUseDirtyRegion = true;
    };

    proto.__stencilDraw = function(ctx,scaleX, scaleY){          //Only for Canvas
        //do nothing, rendering in layout
    };

    proto.stencilClippingVisit = proto.scissorClippingVisit = function (parentCmd) {
        var node = this._node;
        if (!node._clippingStencil || !node._clippingStencil.isVisible())
            return;

        this._syncStatus(parentCmd);

        cc.renderer.pushRenderCommand(this._rendererSaveCmd);
        node._clippingStencil.visit(this);

        cc.renderer.pushRenderCommand(this._rendererClipCmd);
            node.sortAllChildren();
            node.sortAllProtectedChildren();

            var children = node._children;
            var j=0, locProtectChildren = node._protectedChildren, i = 0, locChild;
            var iLen = children.length, jLen = locProtectChildren.length;

            for( ; i < iLen; i++ ){
                locChild = children[i];
                if ( locChild && locChild.getLocalZOrder() < 0 )
                    locChild.visit(this);
                else
                    break;
            }
            for( ; j < jLen; j++ ) {
                locChild = locProtectChildren[j];
                if ( locChild && locChild.getLocalZOrder() < 0 )
                    locChild.visit(this);
                else
                    break;
            }
            for (; i < iLen; i++)
                children[i].visit(this);
            for (; j < jLen; j++)
                locProtectChildren[j].visit(this);
            cc.renderer.pushRenderCommand(this._rendererRestoreCmd);
        this._dirtyFlag = 0;
    };

    ccui.Layout.CanvasRenderCmd._getSharedCache = function () {
        return (cc.ClippingNode._sharedCache) || (cc.ClippingNode._sharedCache = document.createElement("canvas"));
    };
})();