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

    ccs.Armature.CanvasRenderCmd = function(renderableObject){
        cc.Node.CanvasRenderCmd.call(this, renderableObject);
        this._needDraw = false;

        this._startRenderCmd = new cc.CustomRenderCmd(this, this._startCmdCallback);
        this._RestoreRenderCmd = new cc.CustomRenderCmd(this, this._RestoreCmdCallback);
    };

    var proto = ccs.Armature.CanvasRenderCmd.prototype = Object.create(cc.Node.CanvasRenderCmd.prototype);
    proto.constructor = ccs.Armature.CanvasRenderCmd;

    proto.rendering = function(ctx, scaleX, scaleY){
    };

    proto._startCmdCallback = function(ctx, scaleX, scaleY){
        var context = ctx || cc._renderContext;
        var node = this._node;
        context.save();
        node.transform();
        var t = this._worldTransform;
        ctx.transform(t.a, t.b, t.c, t.d, t.tx * scaleX, -t.ty * scaleY);

        var locChildren = node._children;
        for (var i = 0, len = locChildren.length; i< len; i++) {
            var selBone = locChildren[i];
            if (selBone && selBone.getDisplayRenderNode) {
                var rn = selBone.getDisplayRenderNode();

                if (null == rn)
                    continue;

//                rn._renderCmd.setDirtyFlag(cc.Node._dirtyFlags.transformDirty);
            }
        }
    };

    proto._RestoreCmdCallback = function(ctx, scaleX, scaleY){
        this._cacheDirty = false;
        ctx.restore();
    };

    proto.initShaderCache = function(){};
    proto.setShaderProgram = function(){};
    proto.updateChildPosition = function(ctx, dis){
        dis.visit(ctx);
    };

    proto.visit = function(){
        var node = this._node;
        var context = cc._renderContext;
        // quick return if not visible. children won't be drawn.
        if (!node._visible)
            return;

        context.save();
//        this.transform();

        node.sortAllChildren();

        cc.renderer.pushRenderCommand(this);
        cc.renderer.pushRenderCommand(this._startRenderCmd);
        node.draw(ctx);
        cc.renderer.pushRenderCommand(this._RestoreRenderCmd);

        this._cacheDirty = false;

        context.restore();
    };
})();