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

    ccs.Armature.WebGLRenderCmd = function(renderableObject){
        cc.Node.WebGLRenderCmd.call(this, renderableObject);
        this._needDraw = true;
    };

    var proto = ccs.Armature.WebGLRenderCmd.prototype = Object.create(cc.Node.WebGLRenderCmd.prototype);
    proto.constructor = ccs.Armature.WebGLRenderCmd;

    proto.rendering = function (ctx) {
        var _t = this._node;

        cc.kmGLMatrixMode(cc.KM_GL_MODELVIEW);
        cc.kmGLPushMatrix();
        cc.kmGLLoadMatrix(_t._stackMatrix);

        //TODO REMOVE THIS FUNCTION
        if (_t._parentBone == null && _t._batchNode == null) {
            //        CC_NODE_DRAW_SETUP();
        }

        var locChildren = _t._children;
        var alphaPremultiplied = cc.BlendFunc.ALPHA_PREMULTIPLIED, alphaNonPremultipled = cc.BlendFunc.ALPHA_NON_PREMULTIPLIED;
        for (var i = 0, len = locChildren.length; i < len; i++) {
            var selBone = locChildren[i];
            if (selBone && selBone.getDisplayRenderNode) {
                var node = selBone.getDisplayRenderNode();

                if (null == node)
                    continue;

                node.setShaderProgram(_t._shaderProgram);

                switch (selBone.getDisplayRenderNodeType()) {
                    case ccs.DISPLAY_TYPE_SPRITE:
                        if (node instanceof ccs.Skin) {
                            node.updateTransform();

                            var func = selBone.getBlendFunc();
                            if (func.src != alphaPremultiplied.src || func.dst != alphaPremultiplied.dst)
                                node.setBlendFunc(selBone.getBlendFunc());
                            else {
                                if ((_t._blendFunc.src == alphaPremultiplied.src && _t._blendFunc.dst == alphaPremultiplied.dst)
                                    && !node.getTexture().hasPremultipliedAlpha())
                                    node.setBlendFunc(alphaNonPremultipled);
                                else
                                    node.setBlendFunc(_t._blendFunc);
                            }
                            node.draw(ctx);
                        }
                        break;
                    case ccs.DISPLAY_TYPE_ARMATURE:
                        node.draw(ctx);
                        break;
                    default:
                        node.visit(ctx);                           //TODO need fix soon
                        break;
                }
            } else if (selBone instanceof cc.Node) {
                selBone.setShaderProgram(_t._shaderProgram);       //TODO need fix soon
                selBone.visit(ctx);
                //            CC_NODE_DRAW_SETUP();
            }
        }

        cc.kmGLPopMatrix();
    };

    proto.initShaderCache = function(){
        var node = this._node;
        node.setShaderProgram(cc.shaderCache.programForKey(cc.SHADER_POSITION_TEXTURECOLOR));
    };

    proto.setShaderProgram = function(child){
        var node = this._node;
        child.setShaderProgram(node._shaderProgram);
    };

    proto.updateChildPosition = function(ctx, dis, selBone, alphaPremultiplied, alphaNonPremultipled){
        var node = this._node;
        dis.updateTransform();

        var func = selBone.getBlendFunc();
        if (func.src != alphaPremultiplied.src || func.dst != alphaPremultiplied.dst)
            dis.setBlendFunc(selBone.getBlendFunc());
        else {
            if ((node._blendFunc.src == alphaPremultiplied.src && node_blendFunc.dst == alphaPremultiplied.dst)
                && !dis.getTexture().hasPremultipliedAlpha())
                dis.setBlendFunc(alphaNonPremultipled);
            else
                dis.setBlendFunc(node._blendFunc);
        }
        dis.draw(ctx);
    };

    proto.visit = function(){
        var node = this._node;
        // quick return if not visible. children won't be drawn.
        if (!node._visible)
            return;

        var /*context = cc._renderContext, */currentStack = cc.current_stack;

        currentStack.stack.push(currentStack.top);
        cc.kmMat4Assign(node._stackMatrix, currentStack.top);
        currentStack.top = node._stackMatrix;

        node.transform();

        node.sortAllChildren();
        //this.draw(context);
        cc.renderer.pushRenderCommand(this);

        currentStack.top = currentStack.stack.pop();
    };
})();