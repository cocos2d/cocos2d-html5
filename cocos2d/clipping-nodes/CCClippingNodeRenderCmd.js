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
(function(){
    cc.ClippingNode.CanvasRenderCmd = function(renderable){
        cc.Node.CanvasRenderCmd.call(this, renderable);
        this._needDraw = true;
        this._godhelpme = false;
        this._clipElemType = null;

        this._rendererSaveCmd = new cc.CustomRenderCmd(this, this._saveCmdCallback);
        this._rendererClipCmd = new cc.CustomRenderCmd(this, this._clipCmdCallback);
        this._rendererRestoreCmd = new cc.CustomRenderCmd(this, this._restoreCmdCallback);
    };
    var proto = cc.ClippingNode.CanvasRenderCmd.prototype = Object.create(cc.Node.CanvasRenderCmd.prototype);
    proto.constructor = cc.ClippingNode.CanvasRenderCmd;

    proto.initStencilBits = function(){};

    proto.setStencil = function(stencil){
        if(stencil == null)
            return;

        this._node._stencil = stencil;
        // For texture stencil, use the sprite itself
        //if (stencil instanceof cc.Sprite) {
        //    return;
        //}
        // For shape stencil, rewrite the draw of stencil ,only init the clip path and draw nothing.
        //else
        if (stencil instanceof cc.DrawNode) {
            if(stencil._buffer){
                for(var i=0; i<stencil._buffer.length; i++){
                    stencil._buffer[i].isFill = false;
                    stencil._buffer[i].isStroke = false;
                }
            }

            stencil._renderCmd.rendering = function (ctx, scaleX, scaleY) {
                scaleX = scaleX || cc.view.getScaleX();
                scaleY = scaleY ||cc.view.getScaleY();
                var context = ctx || cc._renderContext;
                var t = this._worldTransform;
                context.save();
                context.transform(t.a, t.b, t.c, t.d, t.tx * scaleX, -t.ty * scaleY);

                context.beginPath();
                for (var i = 0; i < stencil._buffer.length; i++) {
                    var vertices = stencil._buffer[i].verts;
                    //cc.assert(cc.vertexListIsClockwise(vertices),
                    //    "Only clockwise polygons should be used as stencil");

                    var firstPoint = vertices[0];
                    context.moveTo(firstPoint.x * scaleX, -firstPoint.y * scaleY);
                    for (var j = 1, len = vertices.length; j < len; j++)
                        context.lineTo(vertices[j].x * scaleX, -vertices[j].y * scaleY);
                }
                context.restore();
            };
        }
    };

    proto._saveCmdCallback  = function(ctx, scaleX, scaleY) {
        var context = ctx || cc._renderContext;

        if (this._clipElemType) {
            var locCache = cc.ClippingNode._getSharedCache();
            var canvas = context.canvas;
            locCache.width = canvas.width;
            locCache.height = canvas.height;
            var locCacheCtx = locCache.getContext("2d");
            locCacheCtx.drawImage(canvas, 0, 0);
            context.save();
        } else {
            this._syncStatus(this.getParentRenderCmd());
            var t = this._worldTransform;
            context.save();
            context.save();
            context.transform(t.a, t.c, t.b, t.d, t.tx * scaleX, -t.ty * scaleY);
        }
    };

    proto._clipCmdCallback = function(ctx, scaleX, scaleY) {
        var node = this._node;
        var context = ctx || cc._renderContext;

        if (this._clipElemType) {
            context.globalCompositeOperation = node.inverted ? "destination-out" : "destination-in";
            var t = this._worldTransform;
            context.transform(t.a, t.c, t.b, t.d, t.tx * scaleX, -t.ty * scaleY);
        } else {
            context.restore();
            if (node.inverted) {
                var canvas = context.canvas;
                context.save();

                context.setTransform(1, 0, 0, 1, 0, 0);

                context.moveTo(0, 0);
                context.lineTo(0, canvas.height);
                context.lineTo(canvas.width, canvas.height);
                context.lineTo(canvas.width, 0);
                context.lineTo(0, 0);

                context.restore();
            }
            context.clip();
        }
    };

    proto._restoreCmdCallback = function (ctx) {
        var locCache = cc.ClippingNode.CanvasRenderCmd._getSharedCache();
        var context = ctx || cc._renderContext;
        if (this._clipElemType) {
            context.restore();

            // Redraw the cached canvas, so that the cliped area shows the background etc.
            context.save();
            context.setTransform(1, 0, 0, 1, 0, 0);
            context.globalCompositeOperation = "destination-over";
            context.drawImage(locCache, 0, 0);
            context.restore();
        } else {
            context.restore();
        }
    };

    proto.transform = function(parentCmd, recursive){
        cc.Node.CanvasRenderCmd.prototype.transform.call(this, parentCmd, recursive);
        if(this._stencil)
            this._stencil._renderCmd.transform(parentCmd, recursive);
    };

    proto._cangodhelpme = function (godhelpme) {
        if (godhelpme === true || godhelpme === false)
            cc.ClippingNode.CanvasRenderCmd.prototype._godhelpme = godhelpme;
        return cc.ClippingNode.CanvasRenderCmd.prototype._godhelpme;
    };

    proto.visit = function(parentCmd){
        var node = this._node;
        // quick return if not visible
        if (!node._visible)
            return;

        parentCmd = parentCmd || this.getParentRenderCmd();
        if( parentCmd)
            this._curLevel = parentCmd._curLevel + 1;

        // Composition mode, costy but support texture stencil
        this._clipElemType = (this._cangodhelpme() || this._stencil instanceof cc.Sprite);

        var i, children = node._children;
        if (!this._stencil || !this._stencil.visible) {
            if (this.inverted)
                cc.Node.CanvasRenderCmd.prototype.visit.call(this, parentCmd);   // draw everything
            return;
        }

        cc.renderer.pushRenderCommand(this._rendererSaveCmd);
        if(this._clipElemType){
            // Draw everything first using node visit function
            cc.Node.CanvasRenderCmd.prototype.visit.call(this, parentCmd);
        }else{
            this._stencil.visit(this);
        }

        cc.renderer.pushRenderCommand(this._rendererClipCmd);

        this._syncStatus(parentCmd);

        if(this._clipElemType){
            this._stencil.visit(this);
        }else{
            // Clip mode doesn't support recusive stencil, so once we used a clip stencil,
            // so if it has ClippingNode as a child, the child must uses composition stencil.
            this._cangodhelpme(true);
            var len = children.length;
            if (len > 0) {
                this.sortAllChildren();
                for (i = 0; i < len; i++)
                    children[i]._renderCmd.visit(this);
            }
            this._cangodhelpme(false);
        }

        cc.renderer.pushRenderCommand(this._rendererRestoreCmd);
    };

    cc.ClippingNode.CanvasRenderCmd._sharedCache = null;
    cc.ClippingNode.CanvasRenderCmd._getSharedCache = function () {
        return (cc.ClippingNode.CanvasRenderCmd._sharedCache) || (cc.ClippingNode.CanvasRenderCmd._sharedCache = document.createElement("canvas"));
    };
})();

// ------------------------------- ClippingNode's WebGL render cmd ------------------------------
(function(){
    cc.ClippingNode.WebGLRenderCmd = function(renderable){
        cc.Node.WebGLRenderCmd.call(this, renderable);
        this._needDraw = false;

        this._beforeVisitCmd = new cc.CustomRenderCmd(this, this._onBeforeVisit);
        this._afterDrawStencilCmd = new cc.CustomRenderCmd(this, this._onAfterDrawStencil);
        this._afterVisitCmd = new cc.CustomRenderCmd(this, this._onAfterVisit);

        this._currentStencilFunc = null;
        this._currentStencilRef = null;
        this._currentStencilValueMask = null;
        this._currentStencilFail = null;
        this._currentStencilPassDepthFail = null;
        this._currentStencilPassDepthPass = null;
        this._currentStencilWriteMask = null;
        this._currentStencilEnabled = null;
        this._currentDepthWriteMask = null;
        this._mask_layer_le = null;
    };

    var proto = cc.ClippingNode.WebGLRenderCmd.prototype = Object.create(cc.Node.CanvasRenderCmd.prototype);
    proto.constructor = cc.ClippingNode.WebGLRenderCmd;

    cc.ClippingNode.WebGLRenderCmd._init_once = null;
    cc.ClippingNode.WebGLRenderCmd._visit_once = null;
    cc.ClippingNode.WebGLRenderCmd._layer = -1;

    proto.initStencilBits = function(){
        // get (only once) the number of bits of the stencil buffer
        cc.ClippingNode.WebGLRenderCmd._init_once = true;
        if (cc.ClippingNode.WebGLRenderCmd._init_once) {
            cc.stencilBits = cc._renderContext.getParameter(cc._renderContext.STENCIL_BITS);
            if (cc.stencilBits <= 0)
                cc.log("Stencil buffer is not enabled.");
            cc.ClippingNode.WebGLRenderCmd._init_once = false;
        }
    };

    proto.transform = function(parentCmd, recursive){
        cc.Node.WebGLRenderCmd.prototype.transform.call(this, parentCmd, recursive);
        if(this._stencil)
            this._stencil._renderCmd.transform(parentCmd, recursive);
    };

    proto.visit = function(parentCmd){
        var _t = this, node = this._node;
        // quick return if not visible
        if (!_t._visible)
            return;

        if( node._parent && node._parent._renderCmd)
            this._curLevel = node._parent._renderCmd._curLevel + 1;

        // if stencil buffer disabled
        if (cc.stencilBits < 1) {
            // draw everything, as if there where no stencil
            cc.Node.WebGLRenderCmd.prototype.visit.call(this, parentCmd);
            return;
        }

        if (!this._stencil || !this._stencil.visible) {
            if (this.inverted)
                cc.Node.WebGLRenderCmd.prototype.visit.call(this, parentCmd);   // draw everything
            return;
        }

        if (cc.ClippingNode.WebGLRenderCmd._layer + 1 == cc.stencilBits) {
            cc.ClippingNode.WebGLRenderCmd._visit_once = true;
            if (cc.ClippingNode.WebGLRenderCmd._visit_once) {
                cc.log("Nesting more than " + cc.stencilBits + "stencils is not supported. Everything will be drawn without stencil for this node and its children.");
                cc.ClippingNode.WebGLRenderCmd._visit_once = false;
            }
            // draw everything, as if there where no stencil
            cc.Node.WebGLRenderCmd.prototype.visit.call(this, parentCmd);
            return;
        }

        cc.renderer.pushRenderCommand(this._beforeVisitCmd);

        //optimize performance for javascript
        var currentStack = cc.current_stack;
        currentStack.stack.push(currentStack.top);
        cc.kmMat4Assign(this._stackMatrix, currentStack.top);
        currentStack.top = this._stackMatrix;

        this._syncStatus(parentCmd);
        //this._stencil._stackMatrix = this._stackMatrix;
        this._stencil.visit(parentCmd);

        cc.renderer.pushRenderCommand(this._afterDrawStencilCmd);

        // draw (according to the stencil test func) this node and its children
        var locChildren = this._children;
        if (locChildren && locChildren.length > 0) {
            var childLen = locChildren.length;
            this.sortAllChildren();
            // draw children zOrder < 0
            for (var i = 0; i < childLen; i++) {
                if (locChildren[i] && locChildren[i]._localZOrder < 0)
                    locChildren[i].visit();
                else
                    break;
            }
            if(this._renderCmd)
                cc.renderer.pushRenderCommand(this._renderCmd);
            // draw children zOrder >= 0
            for (; i < childLen; i++) {
                if (locChildren[i]) {
                    locChildren[i].visit();
                }
            }
        } else{
            if(this._renderCmd)
                cc.renderer.pushRenderCommand(this._renderCmd);
        }

        cc.renderer.pushRenderCommand(this._afterVisitCmd);

        //optimize performance for javascript
        currentStack.top = currentStack.stack.pop();
    };

    proto.setStencil = function(stencil){
        var node = this._node;
        if(node._stencil)
            node._stencil._parent = null;
        node._stencil = stencil;
        if(node._stencil)
            node._stencil._parent = this;
    };

    proto._drawFullScreenQuadClearStencil = function () {
        // draw a fullscreen solid rectangle to clear the stencil buffer
        cc.kmGLMatrixMode(cc.KM_GL_PROJECTION);
        cc.kmGLPushMatrix();
        cc.kmGLLoadIdentity();
        cc.kmGLMatrixMode(cc.KM_GL_MODELVIEW);
        cc.kmGLPushMatrix();
        cc.kmGLLoadIdentity();
        cc._drawingUtil.drawSolidRect(cc.p(-1, -1), cc.p(1, 1), cc.color(255, 255, 255, 255));
        cc.kmGLMatrixMode(cc.KM_GL_PROJECTION);
        cc.kmGLPopMatrix();
        cc.kmGLMatrixMode(cc.KM_GL_MODELVIEW);
        cc.kmGLPopMatrix();
    };

    proto._onBeforeVisit = function(ctx){
        var gl = ctx || cc._renderContext;
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
        this._currentStencilWriteMask = gl.getParameter(gl.STENCIL_WRITEMASK);
        this._currentStencilFunc = gl.getParameter(gl.STENCIL_FUNC);
        this._currentStencilRef = gl.getParameter(gl.STENCIL_REF);
        this._currentStencilValueMask = gl.getParameter(gl.STENCIL_VALUE_MASK);
        this._currentStencilFail = gl.getParameter(gl.STENCIL_FAIL);
        this._currentStencilPassDepthFail = gl.getParameter(gl.STENCIL_PASS_DEPTH_FAIL);
        this._currentStencilPassDepthPass = gl.getParameter(gl.STENCIL_PASS_DEPTH_PASS);

        // enable stencil use
        gl.enable(gl.STENCIL_TEST);
        gl.stencilMask(mask_layer);
        this._currentDepthWriteMask = gl.getParameter(gl.DEPTH_WRITEMASK);

        gl.depthMask(false);

        gl.stencilFunc(gl.NEVER, mask_layer, mask_layer);
        gl.stencilOp(!this.inverted ? gl.ZERO : gl.REPLACE, gl.KEEP, gl.KEEP);

        this._drawFullScreenQuadClearStencil();

        gl.stencilFunc(gl.NEVER, mask_layer, mask_layer);
        gl.stencilOp(!this.inverted ? gl.REPLACE : gl.ZERO, gl.KEEP, gl.KEEP);

        if (this.alphaThreshold < 1) {            //TODO desktop
            var program = cc.shaderCache.programForKey(cc.SHADER_POSITION_TEXTURECOLORALPHATEST);
            var alphaValueLocation = gl.getUniformLocation(program.getProgram(), cc.UNIFORM_ALPHA_TEST_VALUE_S);
            // set our alphaThreshold
            cc.glUseProgram(program.getProgram());
            program.setUniformLocationWith1f(alphaValueLocation, this.alphaThreshold);
            cc.setProgram(this._stencil, program);
        }
    };

    proto._onAfterDrawStencil = function(ctx){
        var gl = ctx || cc._renderContext;
        gl.depthMask(this._currentDepthWriteMask);

        gl.stencilFunc(gl.EQUAL, this._mask_layer_le, this._mask_layer_le);
        gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);
    };

    proto._onAfterVisit = function(ctx){
        var gl = ctx || cc._renderContext;

        gl.stencilFunc(this._currentStencilFunc, this._currentStencilRef, this._currentStencilValueMask);
        gl.stencilOp(this._currentStencilFail, this._currentStencilPassDepthFail, this._currentStencilPassDepthPass);
        gl.stencilMask(this._currentStencilWriteMask);
        if (!this._currentStencilEnabled)
            gl.disable(gl.STENCIL_TEST);

        // we are done using this layer, decrement
        cc.ClippingNode.WebGLRenderCmd._layer--;
    }
})();
