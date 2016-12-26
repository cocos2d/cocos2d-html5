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

(function () {
    if (!ccui.ProtectedNode.WebGLRenderCmd)
        return;
    ccui.Layout.WebGLRenderCmd = function (renderable) {
        this._pNodeCmdCtor(renderable);
        this._needDraw = false;

        this._currentStencilEnabled = 0;
        this._scissorOldState = false;
        this._clippingOldRect = null;

        this._mask_layer_le = 0;

        this._beforeVisitCmdStencil = null;
        this._afterDrawStencilCmd = null;
        this._afterVisitCmdStencil = null;
        this._beforeVisitCmdScissor = null;
        this._afterVisitCmdScissor = null;
    };

    var proto = ccui.Layout.WebGLRenderCmd.prototype = Object.create(ccui.ProtectedNode.WebGLRenderCmd.prototype);
    proto.constructor = ccui.Layout.WebGLRenderCmd;
    proto._layoutCmdCtor = ccui.Layout.CanvasRenderCmd;

    proto._syncStatus = function (parentCmd) {
        this._originSyncStatus(parentCmd);

        if (parentCmd && (parentCmd._dirtyFlag & cc.Node._dirtyFlags.transformDirty))
            this._node._clippingRectDirty = true;
    };
    
    proto._onBeforeVisitStencil = function (ctx) {
        var gl = ctx || cc._renderContext;

        ccui.Layout.WebGLRenderCmd._layer++;

        var mask_layer = 0x1 << ccui.Layout.WebGLRenderCmd._layer;
        var mask_layer_l = mask_layer - 1;
        this._mask_layer_le = mask_layer | mask_layer_l;

        // manually save the stencil state
        this._currentStencilEnabled = gl.isEnabled(gl.STENCIL_TEST);

        gl.clear(gl.DEPTH_BUFFER_BIT);

        gl.enable(gl.STENCIL_TEST);

        gl.depthMask(false);

        gl.stencilFunc(gl.NEVER, mask_layer, mask_layer);
        gl.stencilOp(gl.REPLACE, gl.KEEP, gl.KEEP);

        gl.stencilMask(mask_layer);
        gl.clear(gl.STENCIL_BUFFER_BIT);
    };

    proto._onAfterDrawStencil = function (ctx) {
        var gl = ctx || cc._renderContext;
        gl.depthMask(true);
        gl.stencilFunc(gl.EQUAL, this._mask_layer_le, this._mask_layer_le);
        gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);
    };

    proto._onAfterVisitStencil = function (ctx) {
        var gl = ctx || cc._renderContext;

        ccui.Layout.WebGLRenderCmd._layer--;

        if (this._currentStencilEnabled) {
            var mask_layer = 0x1 << ccui.Layout.WebGLRenderCmd._layer;
            var mask_layer_l = mask_layer - 1;
            var mask_layer_le = mask_layer | mask_layer_l;

            gl.stencilMask(mask_layer);
            gl.stencilFunc(gl.EQUAL, mask_layer_le, mask_layer_le);
        }
        else {
            gl.disable(gl.STENCIL_TEST);
        }
    };

    proto._onBeforeVisitScissor = function (ctx) {
        this._node._clippingRectDirty = true;
        var clippingRect = this._node._getClippingRect();
        var gl = ctx || cc._renderContext;

        this._scissorOldState = gl.isEnabled(gl.SCISSOR_TEST);

        if (!this._scissorOldState) {
            gl.enable(gl.SCISSOR_TEST);
            cc.view.setScissorInPoints(clippingRect.x, clippingRect.y, clippingRect.width, clippingRect.height);
        }
        else {
            this._clippingOldRect = cc.view.getScissorRect();
            if (!cc.rectEqualToRect(this._clippingOldRect, clippingRect))
                cc.view.setScissorInPoints(clippingRect.x, clippingRect.y, clippingRect.width, clippingRect.height);
        }
    };

    proto._onAfterVisitScissor = function (ctx) {
        var gl = ctx || cc._renderContext;
        if (this._scissorOldState) {
            if (!cc.rectEqualToRect(this._clippingOldRect, this._node._clippingRect)) {
                cc.view.setScissorInPoints(this._clippingOldRect.x,
                    this._clippingOldRect.y,
                    this._clippingOldRect.width,
                    this._clippingOldRect.height);
            }
        }
        else {
            gl.disable(gl.SCISSOR_TEST);
        }
    };

    proto.rebindStencilRendering = function (stencil) {
    };

    proto.transform = function (parentCmd, recursive) {
        var node = this._node;
        this.pNodeTransform(parentCmd, recursive);
        if (node._clippingStencil)
            node._clippingStencil._renderCmd.transform(this, recursive);
    };

    proto.stencilClippingVisit = function (parentCmd) {
        var node = this._node;
        if (!node._clippingStencil || !node._clippingStencil.isVisible())
            return;

        // all the _stencilBits are in use?
        if (ccui.Layout.WebGLRenderCmd._layer + 1 === cc.stencilBits) {
            // warn once
            ccui.Layout.WebGLRenderCmd._visit_once = true;
            if (ccui.Layout.WebGLRenderCmd._visit_once) {
                cc.log("Nesting more than " + cc.stencilBits + "stencils is not supported. Everything will be drawn without stencil for this node and its childs.");
                ccui.Layout.WebGLRenderCmd._visit_once = false;
            }
            // draw everything, as if there where no stencil
            return;
        }

        if (!this._beforeVisitCmdStencil) {
            this._beforeVisitCmdStencil = new cc.CustomRenderCmd(this, this._onBeforeVisitStencil);
            this._afterDrawStencilCmd = new cc.CustomRenderCmd(this, this._onAfterDrawStencil);
            this._afterVisitCmdStencil = new cc.CustomRenderCmd(this, this._onAfterVisitStencil);
        }

        cc.renderer.pushRenderCommand(this._beforeVisitCmdStencil);

        //optimize performance for javascript
        var currentStack = cc.current_stack;
        currentStack.stack.push(currentStack.top);
        currentStack.top = this._stackMatrix;

        node._clippingStencil.visit(this);

        cc.renderer.pushRenderCommand(this._afterDrawStencilCmd);
    };

    proto.postStencilVisit = function () {
        renderer.pushRenderCommand(cmd._afterVisitCmdStencil);
        cc.current_stack.top = cc.current_stack.stack.pop();
    };

    proto.scissorClippingVisit = function (parentCmd) {
        if (!this._beforeVisitCmdScissor) {
            this._beforeVisitCmdScissor = new cc.CustomRenderCmd(this, this._onBeforeVisitScissor);
            this._afterVisitCmdScissor = new cc.CustomRenderCmd(this, this._onAfterVisitScissor);
        }
        cc.renderer.pushRenderCommand(this._beforeVisitCmdScissor);
    };

    proto.postScissorVisit = function () {
        cc.renderer.pushRenderCommand(this._afterVisitCmdScissor);
    };

    ccui.Layout.WebGLRenderCmd._layer = -1;
    ccui.Layout.WebGLRenderCmd._visit_once = null;
})();
