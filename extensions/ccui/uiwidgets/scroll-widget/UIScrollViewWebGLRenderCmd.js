
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

    proto.transform = function(parentCmd) {
        ccui.Layout.WebGLRenderCmd.prototype.transform.call(this,parentCmd);
        var node = this._node;
        var child;
        var childrenArray = node._innerContainer._children;
        for(var i = 0; i < childrenArray.length; i++) {
            child = childrenArray[i];
            if(child._renderCmd._dirtyFlag & cc.Node._dirtyFlags.transformDirty) {
                child._inViewRect = node._isInContainer(child);
            }
        }
    };
    proto.visit = function(parentCmd) {
        var node = this._node;
        if (!node._visible)
            return;
        var currentID = this._node.__instanceId;

        cc.renderer.pushRenderCommand(this);
        cc.renderer._turnToCacheMode(currentID);

        ccui.Layout.WebGLRenderCmd.prototype.visit.call(this, parentCmd);

        this._dirtyFlag = 0;
        cc.renderer._turnToNormalMode();
    };

    proto.rendering = function(ctx){
        var currentID = this._node.__instanceId;
        var locCmds = cc.renderer._cacheToBufferCmds[currentID],
            i,
            len;
        var context = ctx || cc._renderContext;
        for (i = 0, len = locCmds.length; i < len; i++) {
            var checkNode = locCmds[i]._node;
            if(checkNode instanceof ccui.ScrollView)
                continue;
            if(checkNode && checkNode._parent && checkNode._parent._inViewRect === false)
                continue;
            locCmds[i].rendering(context);
        }
    }
})();