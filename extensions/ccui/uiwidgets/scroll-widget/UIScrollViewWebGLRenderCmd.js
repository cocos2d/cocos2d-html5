
(function(){
    if(!ccui.ProtectedNode.WebGLRenderCmd)
        return;
    ccui.ScrollView.WebGLRenderCmd = function(renderable){
        ccui.Layout.WebGLRenderCmd.call(this, renderable);
        this._needDraw = true;
        this._dirty = false;
    };

    var proto = ccui.ScrollView.WebGLRenderCmd.prototype = Object.create(ccui.Layout.WebGLRenderCmd.prototype);
    proto.constructor = ccui.ScrollView.WebGLRenderCmd;

    proto.visit = function(parentCmd) {
        var node = this._node;
        if (!node._visible)
            return;
        var currentID = this._node.__instanceId;

        cc.renderer.pushRenderCommand(this);
        cc.renderer._turnToCacheMode(currentID);

        this.layoutVisit(parentCmd);
        // Need to update children after do layout
        node.updateChildren();

        this._dirtyFlag = 0;
        cc.renderer._turnToNormalMode();
    };

    proto.rendering = function(ctx){
        var currentID = this._node.__instanceId,
            locCmds = cc.renderer._cacheToBufferCmds[currentID],
            i, len, checkNode, cmd,
            context = ctx || cc._renderContext;
        if (!locCmds) {
            return;
        }

        this._node.updateChildren();

        // Reset buffer for rendering
        context.bindBuffer(gl.ARRAY_BUFFER, null);

        for (i = 0, len = locCmds.length; i < len; i++) {
            cmd = locCmds[i];
            checkNode = cmd._node;
            if(checkNode instanceof ccui.ScrollView)
                continue;
            if(checkNode && checkNode._parent && checkNode._parent._inViewRect === false)
                continue;

            if (cmd.uploadData) {
                cc.renderer._uploadBufferData(cmd);
            }
            else {
                if (cmd._batchingSize > 0) {
                    cc.renderer._batchRendering();
                }
                cmd.rendering(context);
            }
            cc.renderer._batchRendering();
        }
    };
})();
