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

cc._tmp.WebGLCCNode = function () {

    /**
     * CCNode
     * @type {Object|Function|cc.Node|*}
     * @private
     */
    var _p = cc.Node.prototype;

    _p.setNodeDirty = function () {
        var _t = this;
        if(_t._transformDirty === false){
            _t._setNodeDirtyForCache();
            _t._renderCmdDiry = _t._transformDirty = _t._inverseDirty = true;
            cc.renderer.pushDirtyNode(this);
        }
    };

    _p._transformForRenderer = function (pMatrix) {
        var t4x4 = this._transform4x4, stackMatrix = this._stackMatrix,
            parentMatrix = pMatrix || (this._parent ? this._parent._stackMatrix : cc.current_stack.top);

        // Convert 3x3 into 4x4 matrix
        var trans = this.getNodeToParentTransform();
        var t4x4Mat = t4x4.mat;
        t4x4Mat[0] = trans.a;
        t4x4Mat[4] = trans.c;
        t4x4Mat[12] = trans.tx;
        t4x4Mat[1] = trans.b;
        t4x4Mat[5] = trans.d;
        t4x4Mat[13] = trans.ty;

        // Update Z vertex manually
        t4x4Mat[14] = this._vertexZ;

        //optimize performance for Javascript
        cc.kmMat4Multiply(stackMatrix, parentMatrix, t4x4);

        // XXX: Expensive calls. Camera should be integrated into the cached affine matrix
        if (this._camera != null && !(this.grid != null && this.grid.isActive())) {
            var apx = this._anchorPointInPoints.x, apy = this._anchorPointInPoints.y;
            var translate = (apx !== 0.0 || apy !== 0.0);
            if (translate){
                if(!cc.SPRITEBATCHNODE_RENDER_SUBPIXEL) {
                    apx = 0 | apx;
                    apy = 0 | apy;
                }
                //cc.kmGLTranslatef(apx, apy, 0);
                var translation = new cc.kmMat4();
                cc.kmMat4Translation(translation, apx, apy, 0);
                cc.kmMat4Multiply(stackMatrix, stackMatrix, translation);

                this._camera._locateForRenderer(stackMatrix);

                //cc.kmGLTranslatef(-apx, -apy, 0);
                cc.kmMat4Translation(translation, -apx, -apy, 0);
                cc.kmMat4Multiply(stackMatrix, stackMatrix, translation);
            } else {
                this._camera._locateForRenderer(stackMatrix);
            }
        }

        this._renderCmdDiry = false;
        if(!this._children || this._children.length === 0)
            return;
        var i, len, locChildren = this._children;
        for(i = 0, len = locChildren.length; i< len; i++){
            locChildren[i]._transformForRenderer(stackMatrix);
        }
    };

    _p.transform = function () {
        var _t = this;
        //optimize performance for javascript
        var t4x4 = _t._transform4x4, topMat4 = cc.current_stack.top;

        // Convert 3x3 into 4x4 matrix
        var trans = _t.getNodeToParentTransform();
        var t4x4Mat = t4x4.mat;
        t4x4Mat[0] = trans.a;
        t4x4Mat[4] = trans.c;
        t4x4Mat[12] = trans.tx;
        t4x4Mat[1] = trans.b;
        t4x4Mat[5] = trans.d;
        t4x4Mat[13] = trans.ty;

        // Update Z vertex manually
        t4x4Mat[14] = _t._vertexZ;

        //optimize performance for Javascript
        cc.kmMat4Multiply(topMat4, topMat4, t4x4);

        // XXX: Expensive calls. Camera should be integrated into the cached affine matrix
        if (_t._camera != null && !(_t.grid != null && _t.grid.isActive())) {
            var apx = _t._anchorPointInPoints.x, apy = _t._anchorPointInPoints.y;
            var translate = (apx !== 0.0 || apy !== 0.0);
            if (translate){
                if(!cc.SPRITEBATCHNODE_RENDER_SUBPIXEL) {
                    apx = 0 | apx;
                    apy = 0 | apy;
                }
                cc.kmGLTranslatef(apx, apy, 0);
                _t._camera.locate();
                cc.kmGLTranslatef(-apx, -apy, 0);
            } else {
                _t._camera.locate();
            }
        }
    };
};
