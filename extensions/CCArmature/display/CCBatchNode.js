/**
 * Created with JetBrains WebStorm.
 * User: Administrator
 * Date: 13-6-20
 * Time: 下午2:09
 * To change this template use File | Settings | File Templates.
 */
cc.BatchNode = cc.Node.extend({
    _atlas:null,
    ctor:function () {
        this._atlas = null;
    },
    init:function () {
        var ret = cc.Node.prototype.init.call(this);
        this.setShaderProgram(cc.ShaderCache.getInstance().programForKey(cc.SHADER_POSITION_TEXTURE_UCOLOR));
        return ret;
    },

    addChild:function (child, zOrder, tag) {
        cc.Node.prototype.addChild.call(this, child, zOrder, tag);
        if (child instanceof cc.Armature) {
            child.setBatchNode(this);
        }
    },

    visit:function () {
        // quick return if not visible. children won't be drawn.
        if (!this._visible) {
            return;
        }
        this.kmGLPushMatrix();
        if (this._grid && this._grid.isActive()) {
            this._grid.beforeDraw();
        }
        this.transform();
        this.sortAllChildren();
        this.draw();
        // reset for next frame
        this._orderOfArrival = 0;
        if (this._grid && this._grid.isActive()) {
            this._grid.afterDraw(this);
        }
        this.kmGLPopMatrix();
    },

    draw:function (ctx) {
        cc.NODE_DRAW_SETUP(this);
        var child = null;
        for (var i = 0; i < this._children.length; i++) {
            child = this._children[i];
            child.visit();
            if (child instanceof cc.Armature) {
                this._atlas = child.getTextureAtlas();
            }
        }
        if (this._atlas) {
            this._atlas.drawQuads();
            this._atlas.removeAllQuads();
        }
    }
});
cc.BatchNode.create = function () {
    var batchNode = new cc.BatchNode();
    if (batchNode && batchNode.init()) {
        return batchNode;
    }
    return null;
};