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

        this._realAnchorPointInPoints = new cc.Point(0,0);
    };

    var proto = ccs.Armature.WebGLRenderCmd.prototype = Object.create(cc.Node.WebGLRenderCmd.prototype);
    cc.inject(ccs.Armature.RenderCmd, proto);
    proto.constructor = ccs.Armature.WebGLRenderCmd;

    proto.rendering = function (ctx) {
        var node = this._node;

        cc.kmGLMatrixMode(cc.KM_GL_MODELVIEW);
        cc.kmGLPushMatrix();
        cc.kmGLLoadMatrix(this._stackMatrix);

        //TODO REMOVE THIS FUNCTION
        if (node._parentBone == null && node._batchNode == null) {
            //        CC_NODE_DRAW_SETUP();
        }

        var locChildren = node._children;
        var alphaPremultiplied = cc.BlendFunc.ALPHA_PREMULTIPLIED, alphaNonPremultipled = cc.BlendFunc.ALPHA_NON_PREMULTIPLIED;
        for (var i = 0, len = locChildren.length; i < len; i++) {
            var selBone = locChildren[i];
            if (selBone && selBone.getDisplayRenderNode) {
                var selNode = selBone.getDisplayRenderNode();

                if (null == selNode)
                    continue;

                selNode.setShaderProgram(this._shaderProgram);

                switch (selBone.getDisplayRenderNodeType()) {
                    case ccs.DISPLAY_TYPE_SPRITE:
                        if (selNode instanceof ccs.Skin) {
                            selNode.updateTransform();

                            var func = selBone.getBlendFunc();
                            if (func.src != alphaPremultiplied.src || func.dst != alphaPremultiplied.dst)
                                selNode.setBlendFunc(selBone.getBlendFunc());
                            else {
                                if ((node._blendFunc.src == alphaPremultiplied.src && node._blendFunc.dst == alphaPremultiplied.dst)
                                    && !selNode.getTexture().hasPremultipliedAlpha())
                                    selNode.setBlendFunc(alphaNonPremultipled);
                                else
                                    selNode.setBlendFunc(node._blendFunc);
                            }
                            selNode.draw(ctx);
                        }
                        break;
                    case ccs.DISPLAY_TYPE_ARMATURE:
                        selNode.draw(ctx);
                        break;
                    default:
                        selNode.visit(ctx);                           //TODO need fix soon
                        break;
                }
            } else if (selBone instanceof cc.Node) {
                selBone.setShaderProgram(this._shaderProgram);       //TODO need fix soon
                selBone.visit(ctx);
                //            CC_NODE_DRAW_SETUP();
            }
        }

        cc.kmGLPopMatrix();
    };

    proto.initShaderCache = function(){
        this._shaderProgram = cc.shaderCache.programForKey(cc.SHADER_POSITION_TEXTURECOLOR);
    };

    proto.setShaderProgram = function(child){
        child.setShaderProgram(this._shaderProgram);
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

    proto.visit = function(parentCmd){
        var node = this._node;
        // quick return if not visible. children won't be drawn.
        if (!node._visible)
            return;

        var currentStack = cc.current_stack;

        currentStack.stack.push(currentStack.top);
        this._syncStatus(parentCmd);
        currentStack.top = this._stackMatrix;

        node.sortAllChildren();
        //this.draw(context);
        cc.renderer.pushRenderCommand(this);

        currentStack.top = currentStack.stack.pop();
    };
})();