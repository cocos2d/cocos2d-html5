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
// ------------------------------ The cc.Node's render command for WebGL ----------------------------------
(function() {
    cc.Node.WebGLRenderCmd = function (renderable) {
        cc.Node.RenderCmd.call(this, renderable);

        var mat4 = new cc.math.Matrix4(), mat = mat4.mat;
        mat[2] = mat[3] = mat[6] = mat[7] = mat[8] = mat[9] = mat[11] = mat[14] = 0.0;
        mat[10] = mat[15] = 1.0;
        this._transform4x4 = mat4;
        this._stackMatrix = new cc.math.Matrix4();
        this._shaderProgram = null;

        this._camera = null;
    };

    var proto = cc.Node.WebGLRenderCmd.prototype = Object.create(cc.Node.RenderCmd.prototype);
    proto.constructor = cc.Node.WebGLRenderCmd;

    proto._updateColor = function(){};

    proto.visit = function (parentCmd) {
        var node = this._node;
        // quick return if not visible
        if (!node._visible)
            return;

        parentCmd = parentCmd || this.getParentRenderCmd();
        if (node._parent && node._parent._renderCmd)
            this._curLevel = node._parent._renderCmd._curLevel + 1;

        var currentStack = cc.current_stack;

        //optimize performance for javascript
        currentStack.stack.push(currentStack.top);
        this._syncStatus(parentCmd);
        currentStack.top = this._stackMatrix;
        this.visitChildren();
        //optimize performance for javascript
        currentStack.top = currentStack.stack.pop();
    };

    proto.transform = function (parentCmd, recursive) {
        var t4x4 = this._transform4x4, stackMatrix = this._stackMatrix, node = this._node;
        parentCmd = parentCmd || this.getParentRenderCmd();
        var parentMatrix = (parentCmd ? parentCmd._stackMatrix : cc.current_stack.top);

        // Convert 3x3 into 4x4 matrix
        var trans = this.getNodeToParentTransform();

        this._dirtyFlag = this._dirtyFlag & cc.Node._dirtyFlags.transformDirty ^ this._dirtyFlag;

        var t4x4Mat = t4x4.mat;
        t4x4Mat[0] = trans.a;
        t4x4Mat[4] = trans.c;
        t4x4Mat[12] = trans.tx;
        t4x4Mat[1] = trans.b;
        t4x4Mat[5] = trans.d;
        t4x4Mat[13] = trans.ty;

        //optimize performance for Javascript
        cc.kmMat4Multiply(stackMatrix, parentMatrix, t4x4);
        
        this.setRenderZ(parentCmd, stackMatrix);

        if(!recursive || !node._children)
            return;
        var i, len, locChildren = node._children;
        for(i = 0, len = locChildren.length; i< len; i++){
            locChildren[i]._renderCmd.transform(this, recursive);
        }
    };

    proto.setShaderProgram = function (shaderProgram) {
        this._shaderProgram = shaderProgram;
    };

    proto.getShaderProgram = function () {
        return this._shaderProgram;
    };
})();
