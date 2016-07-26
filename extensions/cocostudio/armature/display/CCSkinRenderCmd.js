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

(function(){
    ccs.Skin.RenderCmd = {
        _realWorldTM: null,
        transform: function (parentCmd, recursive) {
            var node = this._node,
                pt = parentCmd ? parentCmd._worldTransform : null,
                t = this._transform,
                wt = this._worldTransform,
                dirty = this._dirtyFlag & cc.Node._dirtyFlags.transformDirty;

            if (dirty || pt) {
                this.originTransform();
                cc.affineTransformConcatIn(t, node.bone.getNodeToArmatureTransform());
                this._dirtyFlag = this._dirtyFlag & cc.Node._dirtyFlags.transformDirty ^ this._dirtyFlag;
            }

            if (pt) {
                wt.a  = t.a  * pt.a + t.b  * pt.c;
                wt.b  = t.a  * pt.b + t.b  * pt.d;
                wt.c  = t.c  * pt.a + t.d  * pt.c;
                wt.d  = t.c  * pt.b + t.d  * pt.d;
                wt.tx = t.tx * pt.a + t.ty * pt.c + pt.tx;
                wt.ty = t.tx * pt.b + t.ty * pt.d + pt.ty;

                var vertices = this._vertices;
                if (vertices) {
                    var lx = node._offsetPosition.x, rx = lx + node._rect.width,
                        by = node._offsetPosition.y, ty = by + node._rect.height;

                    vertices[0].x = lx * wt.a + ty * wt.c + wt.tx; // tl
                    vertices[0].y = lx * wt.b + ty * wt.d + wt.ty;
                    vertices[1].x = lx * wt.a + by * wt.c + wt.tx; // bl
                    vertices[1].y = lx * wt.b + by * wt.d + wt.ty;
                    vertices[2].x = rx * wt.a + ty * wt.c + wt.tx; // tr
                    vertices[2].y = rx * wt.b + ty * wt.d + wt.ty;
                    vertices[3].x = rx * wt.a + by * wt.c + wt.tx; // br
                    vertices[3].y = rx * wt.b + by * wt.d + wt.ty;
                }
            }
            else {
                wt.a  = t.a;
                wt.b  = t.b;
                wt.c  = t.c;
                wt.d  = t.d;
                wt.tx = t.tx;
                wt.ty = t.ty;
            }
            var rwtm = this._realWorldTM;
            if(rwtm) {
                rwtm.a = t.a; rwtm.b = t.b; rwtm.c = t.c; rwtm.d = t.d; rwtm.tx= t.tx; rwtm.ty = t.ty;
                cc.affineTransformConcatIn(rwtm, this._node.bone.getArmature()._renderCmd._worldTransform);
            }
        },

        getNodeToWorldTransform: function () {
            return cc.affineTransformConcat(this._transform, this._node.bone.getArmature().getNodeToWorldTransform());
        },

        getNodeToWorldTransformAR: function () {
            var displayTransform = this._transform, node = this._node;
            this._anchorPointInPoints = cc.pointApplyAffineTransform(this._anchorPointInPoints, displayTransform);
            displayTransform.tx = this._anchorPointInPoints.x;
            displayTransform.ty = this._anchorPointInPoints.y;
            return cc.affineTransformConcat(displayTransform, node.bone.getArmature().getNodeToWorldTransform());
        }
    };

    ccs.Skin.CanvasRenderCmd = function(renderable){
        cc.Sprite.CanvasRenderCmd.call(this, renderable);
        this._realWorldTM = {a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0};
    };

    var proto = ccs.Skin.CanvasRenderCmd.prototype = Object.create(cc.Sprite.CanvasRenderCmd.prototype);
    cc.inject(ccs.Skin.RenderCmd, proto);

    proto.constructor = ccs.Skin.CanvasRenderCmd;

    proto._updateCurrentRegions = function () {
        var temp = this._currentRegion;
        this._currentRegion = this._oldRegion;
        this._oldRegion = temp;
        //hittest will call the transform, and set region flag to DirtyDouble, and the changes need to be considered for rendering
        if (cc.Node.CanvasRenderCmd.RegionStatus.DirtyDouble === this._regionFlag && (!this._currentRegion.isEmpty())) {
            this._oldRegion.union(this._currentRegion);
        }
        this._currentRegion.updateRegion(this.getLocalBB(), this._realWorldTM);
    };

    ccs.Skin.WebGLRenderCmd = function(renderable){
        cc.Sprite.WebGLRenderCmd.call(this, renderable);
    };

    proto = ccs.Skin.WebGLRenderCmd.prototype = Object.create(cc.Sprite.WebGLRenderCmd.prototype);
    cc.inject(ccs.Skin.RenderCmd, proto);
    proto.constructor = ccs.Skin.WebGLRenderCmd;
})();
