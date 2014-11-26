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
    cc.ProtectedNode.CanvasRenderCmd = function (renderable) {
        cc.Node.CanvasRenderCmd.call(this, renderable);
        this._cachedParent = null;
        this._cacheDirty = false;
    };

    var proto = cc.ProtectedNode.CanvasRenderCmd.prototype = Object.create(cc.Node.CanvasRenderCmd.prototype);
    proto.constructor = cc.ProtectedNode.CanvasRenderCmd;

    proto.visit = function(){
        this._node.visit();
    };

    proto._visit = function(){
        var node = this._node;
        // quick return if not visible
        if (!node._visible)
            return;

        //visit for canvas
        var context = ctx || cc._renderContext, i, j;
        var children = node._children, child;
        var locChildren = node._children, locProtectedChildren = node._protectedChildren;
        var childLen = locChildren.length, pLen = locProtectedChildren.length;

        node.transform(node._parent && node._parent._renderCmd);

        node.sortAllChildren();
        node.sortAllProtectedChildren();

        // draw children zOrder < 0
        for (i = 0; i < childLen; i++) {
            child = children[i];
            if (child._localZOrder < 0)
                child._renderCmd.visit(this);
            else
                break;
        }
        for (j = 0; j < pLen; j++) {
            child = locProtectedChildren[j];
            if (child._localZOrder < 0)
                child._renderCmd.visit(this);
            else
                break;
        }

        cc.renderer.pushRenderCommand(this);

        for (; i < childLen; i++)
            children[i] && children[i]._renderCmd.visit(this);
        for (; j < pLen; j++)
            locProtectedChildren[j] && locProtectedChildren[j]._renderCmd.visit(this);

        this._cacheDirty = false;
    };

    proto.transform = function(parentCmd, recursive){
        var node = this._node;
        var t = node.getNodeToParentTransform(), worldT = this._worldTransform;
        if(parentCmd){
            var pt = parentCmd._worldTransform;
            worldT.a = t.a * pt.a + t.b * pt.c;                               //a
            worldT.b = t.a * pt.b + t.b * pt.d;                               //b
            worldT.c = t.c * pt.a + t.d * pt.c;                               //c
            worldT.d = t.c * pt.b + t.d * pt.d;                               //d
            if(node._skewX || node._skewY){
                var plt = parentCmd._transform;
                var xOffset = -(plt.b + plt.c) * t.ty ;
                var yOffset = -(plt.b + plt.c) * t.tx;
                worldT.tx = (t.tx * pt.a + t.ty * pt.c + pt.tx + xOffset);        //tx
                worldT.ty = (t.tx * pt.b + t.ty * pt.d + pt.ty + yOffset);		  //ty
            }else{
                worldT.tx = (t.tx * pt.a + t.ty * pt.c + pt.tx);          //tx
                worldT.ty = (t.tx * pt.b + t.ty * pt.d + pt.ty);		  //ty
            }
        } else {
            worldT.a = t.a;
            worldT.b = t.b;
            worldT.c = t.c;
            worldT.d = t.d;
            worldT.tx = t.tx;
            worldT.ty = t.ty;
        }
        var i, len, locChildren = node._children;
        for(i = 0, len = locChildren.length; i< len; i++){
            locChildren[i]._renderCmd.transform(this);
        }
        locChildren = node._protectedChildren;
        for( i = 0, len = locChildren.length; i< len; i++)
            locChildren[i]._renderCmd.transform(this);
    }

})();