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

// ------------------------------- ClippingNode's WebGL render cmd ------------------------------
(function () {
    cc.ClippingNode.WebGLRenderCmd = function (renderable) {
        this._rootCtor(renderable);
        this._needDraw = false;

        this._beforeVisitCmd = new cc.CustomRenderCmd(this, this._onBeforeVisit);
        this._afterDrawStencilCmd = new cc.CustomRenderCmd(this, this._onAfterDrawStencil);
        this._afterVisitCmd = new cc.CustomRenderCmd(this, this._onAfterVisit);

        this._currentStencilEnabled = null;
        this._mask_layer_le = null;
    };

    var proto = cc.ClippingNode.WebGLRenderCmd.prototype = Object.create(cc.Node.WebGLRenderCmd.prototype);
    proto.constructor = cc.ClippingNode.WebGLRenderCmd;

    cc.ClippingNode.WebGLRenderCmd._init_once = null;
    cc.ClippingNode.WebGLRenderCmd._visit_once = null;
    cc.ClippingNode.WebGLRenderCmd._layer = -1;

    proto.initStencilBits = function () {
        // get (only once) the number of bits of the stencil buffer
        cc.ClippingNode.WebGLRenderCmd._init_once = true;
        if (cc.ClippingNode.WebGLRenderCmd._init_once) {
            cc.stencilBits = cc._renderContext.getParameter(cc._renderContext.STENCIL_BITS);
            if (cc.stencilBits <= 0)
                cc.log("Stencil buffer is not enabled.");
            cc.ClippingNode.WebGLRenderCmd._init_once = false;
        }
    };

    proto.transform = function (parentCmd, recursive) {
        var node = this._node;
        this.originTransform(parentCmd, recursive);
        if (node._stencil) {
            node._stencil._renderCmd.transform(this, true);
            node._stencil._dirtyFlag &= ~cc.Node._dirtyFlags.transformDirty;
        }
    };

    proto.clippingVisit = function (parentCmd) {
        var node = this._node;
        parentCmd = parentCmd || this.getParentRenderCmd();
        this.visit(parentCmd);

        // if stencil buffer disabled
        if (cc.stencilBits < 1) {
            // draw everything, as if there were no stencil
            node._visitChildren();
            return;
        }

        if (!node._stencil || !node._stencil.visible) {
            if (node.inverted)
                node._visitChildren();   // draw everything
            return;
        }

        if (cc.ClippingNode.WebGLRenderCmd._layer + 1 === cc.stencilBits) {
            cc.ClippingNode.WebGLRenderCmd._visit_once = true;
            if (cc.ClippingNode.WebGLRenderCmd._visit_once) {
                cc.log("Nesting more than " + cc.stencilBits + "stencils is not supported. Everything will be drawn without stencil for this node and its children.");
                cc.ClippingNode.WebGLRenderCmd._visit_once = false;
            }
            // draw everything, as if there were no stencil
            node._visitChildren();
            return;
        }

        cc.renderer.pushRenderCommand(this._beforeVisitCmd);

        // node._stencil._stackMatrix = node._stackMatrix;
        node._stencil.visit(node);

        cc.renderer.pushRenderCommand(this._afterDrawStencilCmd);

        // draw (according to the stencil test func) this node and its children
        var locChildren = node._children;
        if (locChildren && locChildren.length > 0) {
            var childLen = locChildren.length;
            node.sortAllChildren();
            // draw children zOrder < 0
            for (var i = 0; i < childLen; i++) {
                locChildren[i].visit(node);
            }
        }

        cc.renderer.pushRenderCommand(this._afterVisitCmd);

        this._dirtyFlag = 0;
    };

    proto.setStencil = function (stencil) {
        var node = this._node;
        if (node._stencil)
            node._stencil._parent = null;
        node._stencil = stencil;
        if (node._stencil)
            node._stencil._parent = node;
    };

    proto.resetProgramByStencil = function () {
        var node = this._node;
        if (node._stencil) {
            var program = node._originStencilProgram;
            cc.setProgram(node._stencil, program);
        }
    };

    proto._onBeforeVisit = function (ctx) {
        var gl = ctx || cc._renderContext, node = this._node;
        cc.ClippingNode.WebGLRenderCmd._layer++;

        // mask of the current layer (ie: for layer 3: 00000100)
        var mask_layer = 0x1 << cc.ClippingNode.WebGLRenderCmd._layer;
        // mask of all layers less than the current (ie: for layer 3: 00000011)
        var mask_layer_l = mask_layer - 1;
        // mask of all layers less than or equal to the current (ie: for layer 3: 00000111)
        //var mask_layer_le = mask_layer | mask_layer_l;
        this._mask_layer_le = mask_layer | mask_layer_l;
        // manually save the stencil state
        this._currentStencilEnabled = gl.isEnabled(gl.STENCIL_TEST);

        gl.clear(gl.DEPTH_BUFFER_BIT);
        // enable stencil use
        gl.enable(gl.STENCIL_TEST);

        gl.depthMask(false);

        gl.stencilFunc(gl.NEVER, mask_layer, mask_layer);
        gl.stencilOp(gl.REPLACE, gl.KEEP, gl.KEEP);

        gl.stencilMask(mask_layer);
        gl.clear(gl.STENCIL_BUFFER_BIT);

        if (node.alphaThreshold < 1) {            //TODO desktop
            var program = cc.shaderCache.programForKey(cc.SHADER_POSITION_TEXTURECOLORALPHATEST);
            // set our alphaThreshold
            cc.glUseProgram(program.getProgram());
            program.setUniformLocationWith1f(cc.UNIFORM_ALPHA_TEST_VALUE_S, node.alphaThreshold);
            program.setUniformLocationWithMatrix4fv(cc.UNIFORM_MVMATRIX_S, cc.renderer.mat4Identity.mat);
            cc.setProgram(node._stencil, program);
        }
    };

    proto._onAfterDrawStencil = function (ctx) {
        var gl = ctx || cc._renderContext;
        gl.depthMask(true);
        gl.stencilFunc(!this._node.inverted ? gl.EQUAL : gl.NOTEQUAL, this._mask_layer_le, this._mask_layer_le);
        gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);
    };

    proto._onAfterVisit = function (ctx) {
        var gl = ctx || cc._renderContext;

        cc.ClippingNode.WebGLRenderCmd._layer--;

        if (this._currentStencilEnabled) {
            var mask_layer = 0x1 << cc.ClippingNode.WebGLRenderCmd._layer;
            var mask_layer_l = mask_layer - 1;
            var mask_layer_le = mask_layer | mask_layer_l;

            gl.stencilMask(mask_layer);
            gl.stencilFunc(gl.EQUAL, mask_layer_le, mask_layer_le);
        }
        else {
            gl.disable(gl.STENCIL_TEST);

        }
    };
})();
