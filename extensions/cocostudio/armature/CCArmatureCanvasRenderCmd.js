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
    ccs.Armature.RenderCmd = {
        _updateAnchorPointInPoint: function(){
            var node = this._node;
            var contentSize = node._contentSize, anchorPoint = node._anchorPoint, offsetPoint = node._offsetPoint;
            this._anchorPointInPoints.x = contentSize.width * anchorPoint.x - offsetPoint.x;
            this._anchorPointInPoints.y = contentSize.height * anchorPoint.y - offsetPoint.y;

            this._realAnchorPointInPoints.x = contentSize.width * anchorPoint.x;
            this._realAnchorPointInPoints.y = contentSize.height * anchorPoint.y;
            this.setDirtyFlag(cc.Node._dirtyFlags.transformDirty);
        },

        getAnchorPointInPoints: function(){
            return cc.p(this._realAnchorPointInPoints);
        }
    };
})();

(function(){
    ccs.Armature.CanvasRenderCmd = function(renderableObject){
        cc.Node.CanvasRenderCmd.call(this, renderableObject);
        this._needDraw = true;

        this._realAnchorPointInPoints = new cc.Point(0,0);
        this._startRenderCmd = new cc.CustomRenderCmd(this, this._startCmdCallback);
        this._RestoreRenderCmd = new cc.CustomRenderCmd(this, this._RestoreCmdCallback);
    };

    var proto = ccs.Armature.CanvasRenderCmd.prototype = Object.create(cc.Node.CanvasRenderCmd.prototype);
    cc.inject(ccs.Armature.RenderCmd, proto);
    proto.constructor = ccs.Armature.CanvasRenderCmd;

    proto._startCmdCallback = function(ctx, scaleX, scaleY){
        var context = ctx || cc._renderContext;
        var node = this._node;
        context.save();
        var parent = node._parent;
        node.transform(parent ? parent._renderCmd : null);
        var t = this._worldTransform;
        ctx.transform(t.a, t.b, t.c, t.d, t.tx * scaleX, -t.ty * scaleY);

        var locChildren = node._children;
        for (var i = 0, len = locChildren.length; i< len; i++) {
            var selBone = locChildren[i];
            if (selBone && selBone.getDisplayRenderNode) {
                var rn = selBone.getDisplayRenderNode();

                if (null == rn)
                    continue;

                rn._renderCmd.transform();
            }
        }
    };

    proto.transform = function(parentCmd, recursive){
        ccs.Node.CanvasRenderCmd.prototype.transform.call(this, parentCmd, recursive);

        var node = this._node;
        var locChildren = node._children;
        for (var i = 0, len = locChildren.length; i< len; i++) {
            var selBone = locChildren[i];
            if (selBone && selBone.getDisplayRenderNode) {
                var selNode = selBone.getDisplayRenderNode();
                if (selNode)
                    selNode.transform();
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

    proto.rendering = function(ctx, scaleX, scaleY){
        var node = this._node;
        var locChildren = node._children;
        var alphaPremultiplied = cc.BlendFunc.ALPHA_PREMULTIPLIED, alphaNonPremultipled = cc.BlendFunc.ALPHA_NON_PREMULTIPLIED;
        for (var i = 0, len = locChildren.length; i< len; i++) {
            var selBone = locChildren[i];
            if (selBone && selBone.getDisplayRenderNode) {
                var selNode = selBone.getDisplayRenderNode();

                if (null == selNode)
                    continue;

                switch (selBone.getDisplayRenderNodeType()) {
                    case ccs.DISPLAY_TYPE_SPRITE:
                        if(selNode instanceof ccs.Skin)
                            this.updateChildPosition(ctx, selNode, selBone, alphaPremultiplied, alphaNonPremultipled);
                        break;
                    case ccs.DISPLAY_TYPE_ARMATURE:
                        selNode._renderCmd.rendering(ctx);
                        break;
                    default:
                        selNode.visit(ctx);
                        break;
                }
            } else if(selBone instanceof cc.Node) {
                selBone.visit(ctx);
            }
        }
    };

    proto.visit = function(parentCmd){
        var node = this._node;
        var context = cc._renderContext;
        // quick return if not visible. children won't be drawn.
        if (!node._visible)
            return;

        context.save();
        this.transform(parentCmd);

        node.sortAllChildren();

        cc.renderer.pushRenderCommand(this._startRenderCmd);
        this.rendering();
        cc.renderer.pushRenderCommand(this._RestoreRenderCmd);

        this._cacheDirty = false;

        context.restore();
    };
})();