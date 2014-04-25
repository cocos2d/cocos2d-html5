/****************************************************************************
 Copyright (c) 2011-2012 cocos2d-x.org
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

cc.BatchNode = cc.Node.extend({
    _atlas:null,
    _className:"BatchNode",
    ctor:function () {
        this._atlas = null;
    },
    init:function () {
        var ret = cc.Node.prototype.init.call(this);
        this.setShaderProgram(cc.shaderCache.programForKey(cc.SHADER_POSITION_TEXTURE_UCOLOR));
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
        if (this.grid && this.grid.isActive()) {
            this.grid.beforeDraw();
        }
        this.transform();
        this.sortAllChildren();
        this.draw();
        // reset for next frame
        this.arrivalOrder = 0;
        if (this.grid && this.grid.isActive()) {
            this.grid.afterDraw(this);
        }
        this.kmGLPopMatrix();
    },

    draw:function (ctx) {
        cc.nodeDrawSetup(this);
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