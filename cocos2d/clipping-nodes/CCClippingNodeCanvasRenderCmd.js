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

//-------------------------- ClippingNode's canvas render cmd --------------------------------
(function () {
    cc.ClippingNode.CanvasRenderCmd = function (renderable) {
        this._rootCtor(renderable);
        this._needDraw = false;

        this._godhelpme = false;
        this._clipElemType = false;

        this._rendererSaveCmd = new cc.CustomRenderCmd(this, this._saveCmdCallback);
        this._rendererClipCmd = new cc.CustomRenderCmd(this, this._clipCmdCallback);
        this._rendererRestoreCmd = new cc.CustomRenderCmd(this, this._restoreCmdCallback);
    };
    var proto = cc.ClippingNode.CanvasRenderCmd.prototype = Object.create(cc.Node.CanvasRenderCmd.prototype);
    proto.constructor = cc.ClippingNode.CanvasRenderCmd;

    proto.resetProgramByStencil = function () {
        
    };

    proto.initStencilBits = function () {
    };

    proto.setStencil = function (stencil) {
        if (stencil == null)
            return;

        this._node._stencil = stencil;

        // For shape stencil, rewrite the draw of stencil ,only init the clip path and draw nothing.
        //else
        if (stencil instanceof cc.DrawNode) {
            if (stencil._buffer) {
                for (var i = 0; i < stencil._buffer.length; i++) {
                    stencil._buffer[i].isFill = false;
                    stencil._buffer[i].isStroke = false;
                }
            }

            stencil._renderCmd.rendering = function (ctx, scaleX, scaleY) {
                //make it do nothing and draw it in clipp render command
                return;
            };

            stencil._renderCmd._canUseDirtyRegion = true;
            this._rendererSaveCmd._canUseDirtyRegion = true;
            this._rendererClipCmd._canUseDirtyRegion = true;
            this._rendererRestoreCmd._canUseDirtyRegion = true;

        } else {
            stencil._parent = this._node;
        }
    };

    proto._saveCmdCallback = function (ctx, scaleX, scaleY) {
        var wrapper = ctx || cc._renderContext, context = wrapper.getContext();

        if (this._clipElemType) {
            var locCache = cc.ClippingNode.CanvasRenderCmd._getSharedCache();
            var canvas = context.canvas;
            locCache.width = canvas.width;
            locCache.height = canvas.height;                     //note: on some browser, it can't clear the canvas, e.g. baidu
            var locCacheCtx = locCache.getContext("2d");
            locCacheCtx.drawImage(canvas, 0, 0);                //save the result to shareCache canvas
        } else {
            wrapper.save();
            //Because drawNode's content size is zero
            wrapper.setTransform(this._worldTransform, scaleX, scaleY);

            if (this._node.inverted) {
                context.beginPath();                                                         //save for clip
                context.rect(0, 0, context.canvas.width, -context.canvas.height);
                context.clip();
            }
        }
    };

    proto._setStencilCompositionOperation = function (stencil) {
        if (!stencil)
            return;
        var node = this._node;
        if (stencil._renderCmd && stencil._renderCmd._blendFuncStr)          //it is a hack way.
            stencil._renderCmd._blendFuncStr = (node.inverted ? "destination-out" : "destination-in");

        if (!stencil._children)
            return;
        var children = stencil._children;
        for (var i = 0, len = children.length; i < len; i++) {
            this._setStencilCompositionOperation(children[i]);
        }
    };

    proto._clipCmdCallback = function (ctx) {
        var node = this._node;
        var wrapper = ctx || cc._renderContext, context = wrapper.getContext();

        if (this._clipElemType) {
            //hack
            this._setStencilCompositionOperation(node._stencil);
        } else {
            var stencil = this._node._stencil;
            if (stencil instanceof cc.DrawNode) {
                context.beginPath();
                var t = stencil._renderCmd._transform;
                context.transform(t.a, t.b, t.c, t.d, t.tx, -t.ty);
                for (var i = 0; i < stencil._buffer.length; i++) {
                    var vertices = stencil._buffer[i].verts;
                    //TODO: need support circle etc
                    //cc.assert(cc.vertexListIsClockwise(vertices),
                    //    "Only clockwise polygons should be used as stencil");

                    var firstPoint = vertices[0];
                    context.moveTo(firstPoint.x, -firstPoint.y);
                    for (var j = vertices.length - 1; j > 0; j--)
                        context.lineTo(vertices[j].x, -vertices[j].y);
                }
            }
            context.clip();
        }
    };

    proto._restoreCmdCallback = function (ctx) {
        var locCache = cc.ClippingNode.CanvasRenderCmd._getSharedCache();
        var wrapper = ctx || cc._renderContext, context = wrapper.getContext();
        if (this._clipElemType) {
            // Redraw the cached canvas, so that the clipped area shows the background etc.
            context.save();
            context.setTransform(1, 0, 0, 1, 0, 0);
            context.globalCompositeOperation = "destination-over";
            context.drawImage(locCache, 0, 0);
            context.restore();
            this._dirtyFlag = 0;
        } else {
            wrapper.restore();                             //use for restore clip operation
        }
    };

    proto.transform = function (parentCmd, recursive) {
        this.originTransform(parentCmd, recursive);
        var node = this._node;
        if (node._stencil && node._stencil._renderCmd) {
            node._stencil._renderCmd.transform(this, true);
            node._stencil._dirtyFlag &= ~cc.Node._dirtyFlags.transformDirty;
        }
    };

    proto._cangodhelpme = function (godhelpme) {
        if (godhelpme === true || godhelpme === false)
            cc.ClippingNode.CanvasRenderCmd.prototype._godhelpme = godhelpme;
        return cc.ClippingNode.CanvasRenderCmd.prototype._godhelpme;
    };

    proto.clippingVisit = function (parentCmd) {
        var node = this._node;
        parentCmd = parentCmd || this.getParentRenderCmd();
        this.visit(parentCmd);

        // Composition mode, costy but support texture stencil
        this._clipElemType = !(!this._cangodhelpme() && node._stencil instanceof cc.DrawNode);
        if (!node._stencil || !node._stencil.visible) {
            if (this.inverted)
                node._visitChildren();   // draw everything
            return;
        }

        cc.renderer.pushRenderCommand(this._rendererSaveCmd);
        if (this._clipElemType) {
            // Draw everything first using node visit function
            node._visitChildren();
        } else {
            node._stencil.visit(node);
        }
        cc.renderer.pushRenderCommand(this._rendererClipCmd);

        if (this._clipElemType) {
            node._stencil.visit(node);
        } else {
            // Clip mode doesn't support recursive stencil, so once we used a clip stencil,
            // so if it has ClippingNode as a child, the child must uses composition stencil.
            this._cangodhelpme(true);
            var children = node._children;
            var i, len = children.length;
            if (len > 0) {
                node.sortAllChildren();
                for (i = 0; i < len; i++)
                    children[i].visit(node);
            }
            this._cangodhelpme(false);
        }

        cc.renderer.pushRenderCommand(this._rendererRestoreCmd);
        this._dirtyFlag = 0;
    };

    cc.ClippingNode.CanvasRenderCmd._sharedCache = null;
    cc.ClippingNode.CanvasRenderCmd._getSharedCache = function () {
        return (cc.ClippingNode.CanvasRenderCmd._sharedCache) || (cc.ClippingNode.CanvasRenderCmd._sharedCache = document.createElement("canvas"));
    };
})();
