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

(function(){

    cc.ProtectedNode.WebGLRenderCmd = function (renderable) {
        cc.Node.WebGLRenderCmd.call(this, renderable);
        this._cachedParent = null;
        this._cacheDirty = false;
    };

    var proto = cc.ProtectedNode.WebGLRenderCmd.prototype = Object.create(cc.Node.WebGLRenderCmd.prototype);
    proto.constructor = cc.ProtectedNode.WebGLRenderCmd;

    proto.visit = function(){
        var node = this._node;
        // quick return if not visible
        if (!node._visible)
            return;
        var context = cc._renderContext, i, currentStack = cc.current_stack, j;

        //optimize performance for javascript
        currentStack.stack.push(currentStack.top);
        cc.kmMat4Assign(this._stackMatrix, currentStack.top);
        currentStack.top = this._stackMatrix;

        var locGrid = node.grid;
        if (locGrid && locGrid._active)
            locGrid.beforeDraw();

        node.transform(node._parent && node._parent._renderCmd);

        var locChildren = node._children, locProtectedChildren = node._protectedChildren;
        var childLen = locChildren.length, pLen = locProtectedChildren.length;
        node.sortAllChildren();
        node.sortAllProtectedChildren();

        // draw children zOrder < 0
        for (i = 0; i < childLen; i++) {
            if (locChildren[i] && locChildren[i]._localZOrder < 0)
                locChildren[i].visit();
            else
                break;
        }
        for(j = 0; j < pLen; j++){
            if (locProtectedChildren[j] && locProtectedChildren[j]._localZOrder < 0)
                locProtectedChildren[j].visit();
            else
                break;
        }

        cc.renderer.pushRenderCommand(this);

        // draw children zOrder >= 0
        for (; i < childLen; i++) {
            locChildren[i] && locChildren[i].visit();
        }
        for (; j < pLen; j++) {
            locProtectedChildren[j] && locProtectedChildren[j].visit();
        }

        if (locGrid && locGrid._active)
            locGrid.afterDraw(node);

        //optimize performance for javascript
        currentStack.top = currentStack.stack.pop();
    };

    proto.transform = function(parentCmd){
        var node = this._node;
        var t4x4 = this._transform4x4, stackMatrix = this._stackMatrix,
            parentMatrix = parentCmd ? parentCmd._stackMatrix : cc.current_stack.top;

        // Convert 3x3 into 4x4 matrix
        var trans = node.getNodeToParentTransform();
        var t4x4Mat = t4x4.mat;
        t4x4Mat[0] = trans.a;
        t4x4Mat[4] = trans.c;
        t4x4Mat[12] = trans.tx;
        t4x4Mat[1] = trans.b;
        t4x4Mat[5] = trans.d;
        t4x4Mat[13] = trans.ty;

        // Update Z vertex manually
        t4x4Mat[14] = this._vertexZ;

        //optimize performance for Javascript
        cc.kmMat4Multiply(stackMatrix, parentMatrix, t4x4);

        var i, len, locChildren = node._children;
        for(i = 0, len = locChildren.length; i< len; i++){
            locChildren[i]._renderCmd.transform(this);
        }
        locChildren = node._protectedChildren;
        for( i = 0, len = locChildren.length; i< len; i++)
            locChildren[i]._renderCmd.transform(this);
    };
})();