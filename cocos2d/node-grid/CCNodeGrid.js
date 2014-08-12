/****************************************************************************
 Copyright (c) 2008-2010 Ricardo Quesada
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

/**
 * <p>NodeGrid class is a class serves as a decorator of cc.Node,<br/>
 * Grid node can run grid actions over all its children</p>
 * @type {Class}
 *
 * @property {cc.GridBase}  grid    - Grid object that is used when applying effects
 * @property {cc.Node}      target  - <@writeonly>Target
 */
cc.NodeGrid = cc.Node.extend({
    grid: null,
    _target: null,

    getGrid: function () {
        return this.grid;
    },

    setGrid: function (grid) {
        this.grid = grid;
    },

    setTarget: function (target) {
        //var self = this;
        //self._target && self.removeChild(self._target);
        this._target = target;
        //self.addChild(self._target);
    },

    addChild: function (child, zOrder, tag) {
        cc.Node.prototype.addChild.call(this, child, zOrder, tag);

        if (child && !this._target)
            this._target = child;
    },

    visit: function () {
        var self = this;
        // quick return if not visible
        if (!self._visible)
            return;

        var isWebGL = cc._renderType == cc._RENDER_TYPE_WEBGL;
        var locGrid = self.grid;
        if (isWebGL && locGrid && locGrid._active)
            locGrid.beforeDraw();

        self.transform();

        var locChildren = this._children;
        if (locChildren && locChildren.length > 0) {
            var childLen = locChildren.length;
            this.sortAllChildren();
            // draw children
            for (i = 0; i < childLen; i++) {
                var child = locChildren[i];
                child && child.visit();
            }
        }

        if (isWebGL && locGrid && locGrid._active)
            locGrid.afterDraw(self._target);
    },

    _transformForWebGL: function () {
        //optimize performance for javascript
        var t4x4 = this._transform4x4, topMat4 = cc.current_stack.top;

        // Convert 3x3 into 4x4 matrix
        //cc.CGAffineToGL(this.nodeToParentTransform(), this._transform4x4.mat);
        var trans = this.nodeToParentTransform();
        var t4x4Mat = t4x4.mat;
        t4x4Mat[0] = trans.a;
        t4x4Mat[4] = trans.c;
        t4x4Mat[12] = trans.tx;
        t4x4Mat[1] = trans.b;
        t4x4Mat[5] = trans.d;
        t4x4Mat[13] = trans.ty;

        // Update Z vertex manually
        //this._transform4x4.mat[14] = this._vertexZ;
        t4x4Mat[14] = this._vertexZ;

        //optimize performance for Javascript
        cc.kmMat4Multiply(topMat4, topMat4, t4x4); // = cc.kmGLMultMatrix(this._transform4x4);

        // XXX: Expensive calls. Camera should be integrated into the cached affine matrix
        if (this._camera != null && !(this.grid && this.grid.isActive())) {
            var apx = this._anchorPointInPoints.x, apy = this._anchorPointInPoints.y;
            var translate = (apx !== 0.0 || apy !== 0.0);
            if (translate) {
                if(!cc.SPRITEBATCHNODE_RENDER_SUBPIXEL) {
                    apx = 0 | apx;
                    apy = 0 | apy;
                }
                cc.kmGLTranslatef(apx, apy, 0);
                this._camera.locate();
                cc.kmGLTranslatef(-apx, -apy, 0);
            } else {
                this._camera.locate();
            }
        }
    }
});

var _p = cc.NodeGrid.prototype;
if (cc._renderType === cc._RENDER_TYPE_WEBGL) {
    _p.transform = _p._transformForWebGL;
    //The parent class method directly from canvas model
}
// Extended property
/** @expose */
_p.grid;
/** @expose */
_p.target;
cc.defineGetterSetter(_p, "target", null, _p.setTarget);


/**
 * Creates a NodeGrid
 * Implementation cc.NodeGrid
 * @deprecated
 * @return {cc.NodeGrid|null}
 */
cc.NodeGrid.create = function () {
    return new cc.NodeGrid();
};