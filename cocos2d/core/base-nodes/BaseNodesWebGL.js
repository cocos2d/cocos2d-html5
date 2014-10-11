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

    _p._transform4x4 = null;
    _p._stackMatrix = null;
    _p._glServerState = null;
    _p._camera = null;

    _p.ctor = function () {
        var _t = this;
        _t._initNode();

        //WebGL
        var mat4 = new cc.kmMat4();
        mat4.mat[2] = mat4.mat[3] = mat4.mat[6] = mat4.mat[7] = mat4.mat[8] = mat4.mat[9] = mat4.mat[11] = mat4.mat[14] = 0.0;
        mat4.mat[10] = mat4.mat[15] = 1.0;
        _t._transform4x4 = mat4;
        _t._glServerState = 0;
        _t._stackMatrix = new cc.kmMat4();
        this._initRendererCmd();
    };

    _p.setNodeDirty = function () {
        var _t = this;
        if(_t._transformDirty === false){
            _t._setNodeDirtyForCache();
            _t._renderCmdDiry = _t._transformDirty = _t._inverseDirty = true;
            cc.renderer.pushDirtyNode(this);
        }
    };

    _p.visit = function () {
        var _t = this;
        // quick return if not visible
        if (!_t._visible)
            return;

        if( _t._parent)
            _t._curLevel = _t._parent._curLevel + 1;

        var context = cc._renderContext, i, currentStack = cc.current_stack;

        //optimize performance for javascript
        currentStack.stack.push(currentStack.top);
        cc.kmMat4Assign(_t._stackMatrix, currentStack.top);
        currentStack.top = _t._stackMatrix;

        //_t.toRenderer();
        _t.transform();

        var locChildren = _t._children;
        if (locChildren && locChildren.length > 0) {
            var childLen = locChildren.length;
            _t.sortAllChildren();
            // draw children zOrder < 0
            for (i = 0; i < childLen; i++) {
                if (locChildren[i] && locChildren[i]._localZOrder < 0)
                    locChildren[i].visit();
                else
                    break;
            }
            if(this._rendererCmd)
                cc.renderer.pushRenderCommand(this._rendererCmd);
            // draw children zOrder >= 0
            for (; i < childLen; i++) {
                if (locChildren[i]) {
                    locChildren[i].visit();
                }
            }
        } else{
            if(this._rendererCmd)
                cc.renderer.pushRenderCommand(this._rendererCmd);
        }

        //optimize performance for javascript
        currentStack.top = currentStack.stack.pop();
    };

    _p._transformForRenderer = function (pMatrix) {
        var t4x4 = this._transform4x4, stackMatrix = this._stackMatrix,
            parentMatrix = pMatrix || (this._parent ? this._parent._stackMatrix : cc.current_stack.top);

        // Convert 3x3 into 4x4 matrix
        var trans = this.nodeToParentTransform();
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
            //locChildren[i]._transformForRenderer();
        }
    };

    _p.transform = function () {
        var _t = this;
        //optimize performance for javascript
        var t4x4 = _t._transform4x4, topMat4 = cc.current_stack.top;

        // Convert 3x3 into 4x4 matrix
        var trans = _t.nodeToParentTransform();
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

    _p.getNodeToParentTransform = _p._getNodeToParentTransformForWebGL;
};
