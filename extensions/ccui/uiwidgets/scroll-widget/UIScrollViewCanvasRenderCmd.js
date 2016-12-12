(function () {
    if (!ccui.ProtectedNode.CanvasRenderCmd)
        return;
    ccui.ScrollView.CanvasRenderCmd = function (renderable) {
        this._layoutCmdCtor(renderable);
        //this._needDraw = true;
        this._dirty = false;
    };

    var proto = ccui.ScrollView.CanvasRenderCmd.prototype = Object.create(ccui.Layout.CanvasRenderCmd.prototype);
    proto.constructor = ccui.ScrollView.CanvasRenderCmd;

    proto.rendering = function (ctx) {
        var currentID = this._node.__instanceId;
        var i, locCmds = cc.renderer._cacheToCanvasCmds[currentID], len,
            scaleX = cc.view.getScaleX(),
            scaleY = cc.view.getScaleY();
        var context = ctx || cc._renderContext;
        context.computeRealOffsetY();

        this._node.updateChildren();

        for (i = 0, len = locCmds.length; i < len; i++) {
            var checkNode = locCmds[i]._node;
            if (checkNode instanceof ccui.ScrollView)
                continue;
            if (checkNode && checkNode._parent && checkNode._parent._inViewRect === false)
                continue;
            locCmds[i].rendering(context, scaleX, scaleY);
        }
    };
})();
