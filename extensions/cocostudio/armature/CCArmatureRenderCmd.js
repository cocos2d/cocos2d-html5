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

ccs.Armature.CanvasRenderCmd = function(renderableObject){
    cc.Node.CanvasRenderCmd.call(this, renderableObject);
    this._needDraw = true;
};

ccs.Armature.CanvasRenderCmd.prototype = Object.create(cc.Node.CanvasRenderCmd.prototype);
ccs.Armature.CanvasRenderCmd.prototype.constructor = ccs.Armature.CanvasRenderCmd;

ccs.Armature.CanvasRenderCmd.prototype.rendering = function(ctx, scaleX, scaleY){
    var context = ctx || cc._renderContext;
    context.save();
    this.transform(context);
    var t = this._transformWorld;
    ctx.transform(t.a, t.b, t.c, t.d, t.tx * scaleX, -t.ty * scaleY);

    var locChildren = this._children;
    for (var i = 0, len = locChildren.length; i< len; i++) {
        var selBone = locChildren[i];
        if (selBone && selBone.getDisplayRenderNode) {
            var node = selBone.getDisplayRenderNode();

            if (null == node)
                continue;

            node._transformForRenderer();
        }
    }
};

ccs.Armature.CanvasRestoreRenderCmd = function(renderableObject){
    cc.Node.CanvasRenderCmd.call(this, renderableObject);
    this._needDraw = true;
};

ccs.Armature.CanvasRestoreRenderCmd.prototype = Object.create(cc.Node.CanvasRenderCmd.prototype);
ccs.Armature.CanvasRestoreRenderCmd.prototype.constructor = ccs.Armature.CanvasRestoreRenderCmd;

ccs.Armature.CanvasRestoreRenderCmd.prototype.rendering = function(ctx, scaleX, scaleY){
    var context = ctx || cc._renderContext;
    this._cacheDirty = false;
    context.restore();
};

ccs.Armature.WebGLRenderCmd = function(renderableObject){
    cc.Node.WebGLRenderCmd.call(this, renderableObject);
    this._needDraw = true;
};

ccs.Armature.WebGLRenderCmd.prototype = Object.create(cc.Node.WebGLRenderCmd.prototype);
ccs.Armature.WebGLRenderCmd.prototype.constructor = ccs.Armature.WebGLRenderCmd;

ccs.Armature.WebGLRenderCmd.prototype.rendering = function (ctx) {
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