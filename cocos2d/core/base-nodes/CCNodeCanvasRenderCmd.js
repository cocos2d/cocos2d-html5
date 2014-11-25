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

//---------------------- Customer render cmd --------------------
cc.CustomRenderCmd = function (target, func) {
    this._needDraw = true;
    this._target = target;
    this._callback = func;

    this.rendering = function (ctx, scaleX, scaleY) {
        if (!this._callback)
            return;
        this._callback.call(this._target, ctx, scaleX, scaleY);
    }
};


cc.Node._dirtyFlags = {transformDirty: 1, visibleDirty: 2, colorDirty: 4, opacityDirty: 8, cacheDirty:16, orderDirty:32, textDirty:64};

//-------------------------Base -------------------------
cc.Node.RenderCmd = function(renderable){
    this._dirtyFlag = 0;

    this._node = renderable;
    this._needDraw = false;
    this._anchorPointInPoints = new cc.Point(0,0);

    this._transform = {a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0};
    this._worldTransform = {a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0};
    this._inverse = {a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0};

    this._displayedOpacity = 255;
    this._displayedColor = cc.color(255, 255, 255, 255);
    this._cascadeColorEnabledDirty = false;
    this._cascadeOpacityEnabledDirty = false;

    this._curLevel = -1;
};

cc.Node.RenderCmd.prototype = {
    constructor: cc.Node.RenderCmd,

    getAnchorPointInPoints: function(){
        return cc.p(this._anchorPointInPoints);
    },

    getDisplayedColor: function(){
        var tmpColor = this._displayedColor;
        return cc.color(tmpColor.r, tmpColor.g, tmpColor.b, tmpColor.a);
    },

    getDisplayedOpacity: function(){
        return this._displayedOpacity;
    },

    setCascadeColorEnabledDirty: function(){
        this._cascadeColorEnabledDirty = true;
        this.setDirtyFlag(cc.Node._dirtyFlags.colorDirty);
    },

    setCascadeOpacityEnabledDirty:function(){
        this._cascadeOpacityEnabledDirty = true;
        this.setDirtyFlag(cc.Node._dirtyFlags.opacityDirty);
    },

    getParentToNodeTransform: function(){
        if(this._dirtyFlag & cc.Node._dirtyFlags.transformDirty)
            this._inverse = cc.affineTransformInvert(this.getNodeToParentTransform());
        return this._inverse;
    },

    detachFromParent: function(){
    },

    _updateAnchorPointInPoint: function() {
        var locAPP = this._anchorPointInPoints, locSize = this._node._contentSize, locAnchorPoint = this._node._anchorPoint;
        locAPP.x = locSize.width * locAnchorPoint.x;
        locAPP.y = locSize.height * locAnchorPoint.y;
        this.setDirtyFlag(cc.Node._dirtyFlags.transformDirty);
    },

    setDirtyFlag: function(dirtyFlag){
        if (this._dirtyFlag === 0 && dirtyFlag !== 0)
            cc.renderer.pushDirtyNode(this);
        this._dirtyFlag = this._dirtyFlag | dirtyFlag;
    },

    getParentRenderCmd: function(){
        if(this._node && this._node._parent && this._node._parent._renderCmd)
            return this._node._parent._renderCmd;
        return null;
    },

    _syncDisplayColor : function (parentColor) {
        var node = this._node, locDispColor = this._displayedColor, locRealColor = node._realColor;
        if (parentColor === undefined) {
            var locParent = node._parent;
            if (locParent && locParent._cascadeColorEnabled)
                parentColor = locParent.getDisplayedColor();
            else
                parentColor = cc.color.WHITE;
        }
        locDispColor.r = 0 | (locRealColor.r * parentColor.r / 255.0);
        locDispColor.g = 0 | (locRealColor.g * parentColor.g / 255.0);
        locDispColor.b = 0 | (locRealColor.b * parentColor.b / 255.0);
        this._dirtyFlag ^= cc.Node._dirtyFlags.colorDirty;
    },

    _syncDisplayOpacity : function (parentOpacity) {
        var node = this._node;
        if (parentOpacity === undefined) {
            var locParent = node._parent;
            parentOpacity = 255;
            if (locParent && locParent._cascadeOpacityEnabled)
                parentOpacity = locParent.getDisplayedOpacity();
        }
        this._displayedOpacity = node._realOpacity * parentOpacity / 255.0;
        this._dirtyFlag ^= cc.Node._dirtyFlags.opacityDirty;
    }
};

//-----------------------Canvas ---------------------------

(function() {
//The cc.Node's render command for Canvas
    cc.Node.CanvasRenderCmd = function (renderable) {
        cc.Node.RenderCmd.call(this, renderable);
        this._cachedParent = null;
        this._cacheDirty = false;
    };

    var proto = cc.Node.CanvasRenderCmd.prototype = Object.create(cc.Node.RenderCmd.prototype);
    proto.constructor = cc.Node.CanvasRenderCmd;

    proto.transform = function (parentCmd, recursive) {
        // transform for canvas
        var t = this.getNodeToParentTransform(),
            worldT = this._worldTransform;         //get the world transform

        if (parentCmd) {
            var pt = parentCmd._worldTransform;
            // cc.AffineTransformConcat is incorrect at get world transform
            worldT.a = t.a * pt.a + t.b * pt.c;                               //a
            worldT.b = t.a * pt.b + t.b * pt.d;                               //b
            worldT.c = t.c * pt.a + t.d * pt.c;                               //c
            worldT.d = t.c * pt.b + t.d * pt.d;                               //d

            var plt = parentCmd._transform;
            var xOffset = -(plt.b + plt.c) * t.ty;
            var yOffset = -(plt.b + plt.c) * t.tx;
            worldT.tx = (t.tx * pt.a + t.ty * pt.c + pt.tx + xOffset);        //tx
            worldT.ty = (t.tx * pt.b + t.ty * pt.d + pt.ty + yOffset);		  //ty
        } else {
            worldT.a = t.a;
            worldT.b = t.b;
            worldT.c = t.c;
            worldT.d = t.d;
            worldT.tx = t.tx;
            worldT.ty = t.ty;
        }
        this._renderCmdDiry = false;
        if (recursive) {
            var locChildren = this._node._children;
            if (!locChildren || locChildren.length === 0)
                return;
            var i, len;
            for (i = 0, len = locChildren.length; i < len; i++) {
                locChildren[i]._renderCmd.transform(this, recursive);
            }
        }
    };

    proto.getNodeToParentTransform = function () {
        var node = this._node, normalizeDirty = false;
        if (node._usingNormalizedPosition && node._parent) {        //TODO need refactor
            var conSize = node._parent._contentSize;
            node._position.x = node._normalizedPosition.x * conSize.width;
            node._position.y = node._normalizedPosition.y * conSize.height;
            node._normalizedPositionDirty = false;
            normalizeDirty = true;
        }
        if (normalizeDirty || (this._dirtyFlag & cc.Node._dirtyFlags.transformDirty)) {
            var t = this._transform;// quick reference

            // base position
            t.tx = node._position.x;
            t.ty = node._position.y;

            // rotation Cos and Sin
            var Cos = 1, Sin = 0;
            if (node._rotationX) {
                var rotationRadiansX = node._rotationX * 0.017453292519943295;  //0.017453292519943295 = (Math.PI / 180);   for performance
                Cos = Math.cos(rotationRadiansX);
                Sin = Math.sin(rotationRadiansX);
            }

            // base abcd
            t.a = t.d = Cos;
            t.b = -Sin;
            t.c = Sin;

            var lScaleX = node._scaleX, lScaleY = node._scaleY;
            var appX = this._anchorPointInPoints.x, appY = this._anchorPointInPoints.y;

            // Firefox on Vista and XP crashes
            // GPU thread in case of scale(0.0, 0.0)
            var sx = (lScaleX < 0.000001 && lScaleX > -0.000001) ? 0.000001 : lScaleX,
                sy = (lScaleY < 0.000001 && lScaleY > -0.000001) ? 0.000001 : lScaleY;

            // skew
            if (node._skewX || node._skewY) {
                // offset the anchorpoint
                var skx = Math.tan(-node._skewX * Math.PI / 180);                            //TODO
                var sky = Math.tan(-node._skewY * Math.PI / 180);
                if (skx === Infinity)
                    skx = 99999999;
                if (sky === Infinity)
                    sky = 99999999;
                var xx = appY * skx * sx;
                var yy = appX * sky * sy;
                t.a = Cos + -Sin * sky;
                t.b = Cos * skx + -Sin;
                t.c = Sin + Cos * sky;
                t.d = Sin * skx + Cos;
                t.tx += Cos * xx + -Sin * yy;
                t.ty += Sin * xx + Cos * yy;
            }

            // scale
            if (lScaleX !== 1 || lScaleY !== 1) {
                t.a *= sx;
                t.c *= sx;
                t.b *= sy;
                t.d *= sy;
            }

            // adjust anchorPoint
            t.tx += Cos * -appX * sx + -Sin * appY * sy;
            t.ty -= Sin * -appX * sx + Cos * appY * sy;

            // if ignore anchorPoint
            if (node._ignoreAnchorPointForPosition) {
                t.tx += appX;
                t.ty += appY;
            }

            if (node._additionalTransformDirty) {
                this._transform = cc.affineTransformConcat(t, node._additionalTransform);
                node._additionalTransformDirty = false;
            }
            this._dirtyFlag = this._dirtyFlag ^ cc.Node._dirtyFlags.transformDirty;
        }
        return this._transform;
    };

    proto.visit = function (parentCmd) {
        var _t = this, node = this._node;
        // quick return if not visible
        if (!node._visible)
            return;

        parentCmd = parentCmd || this.getParentRenderCmd();
        if (parentCmd)
            this._curLevel = parentCmd._curLevel + 1;

        //visit for canvas
        var i, children = node._children, child;
        _t._syncStatus(parentCmd);
        var len = children.length;
        if (len > 0) {
            node.sortAllChildren();
            // draw children zOrder < 0
            for (i = 0; i < len; i++) {
                child = children[i];
                if (child._localZOrder < 0)
                    child._renderCmd.visit(this);
                else
                    break;
            }
            cc.renderer.pushRenderCommand(this);
            for (; i < len; i++)
                children[i]._renderCmd.visit(this);
        } else {
            cc.renderer.pushRenderCommand(this);
        }
    };

    proto.updateStatus = function () {
        var flags = cc.Node._dirtyFlags, locFlag = this._dirtyFlag;
        if (locFlag & flags.colorDirty) {
            //update the color
            this._updateDisplayColor()
        }

        if (locFlag & flags.opacityDirty) {
            //update the opacity
            this._updateDisplayOpacity();
        }

        if (locFlag & flags.transformDirty) {
            //update the transform
            this.transform(this.getParentRenderCmd(), true);
        }
    };

    proto._syncStatus = function (parentCmd) {
        var flags = cc.Node._dirtyFlags, locFlag = this._dirtyFlag;
        if (locFlag & flags.colorDirty) {
            //update the color
            this._syncDisplayColor()
        }

        if (locFlag & flags.opacityDirty) {
            //update the opacity
            this._syncDisplayOpacity();
        }

        if (locFlag & flags.transformDirty) {
            //update the transform
            this.transform(parentCmd);
        }
    };

    proto._syncDisplayColor = function (parentColor) {
        var node = this._node, locDispColor = this._displayedColor, locRealColor = node._realColor;
        if (parentColor === undefined) {
            var locParent = node._parent;
            if (locParent && locParent._cascadeColorEnabled)
                parentColor = locParent.getDisplayedColor();
            else
                parentColor = cc.color.WHITE;
        }
        locDispColor.r = 0 | (locRealColor.r * parentColor.r / 255.0);
        locDispColor.g = 0 | (locRealColor.g * parentColor.g / 255.0);
        locDispColor.b = 0 | (locRealColor.b * parentColor.b / 255.0);
        this._dirtyFlag ^= cc.Node._dirtyFlags.colorDirty;
    };

    proto._syncDisplayOpacity = function (parentOpacity) {
        var node = this._node;
        if (parentOpacity === undefined) {
            var locParent = node._parent;
            parentOpacity = 255;
            if (locParent && locParent._cascadeOpacityEnabled)
                parentOpacity = locParent.getDisplayedOpacity();
        }
        this._displayedOpacity = node._realOpacity * parentOpacity / 255.0;
        this._dirtyFlag ^= cc.Node._dirtyFlags.opacityDirty;
    };

    proto._updateDisplayColor = function (parentColor) {
        var node = this._node;
        var locDispColor = this._displayedColor, locRealColor = node._realColor;
        var i, len, selChildren, item;
        if (this._cascadeColorEnabledDirty && !node._cascadeColorEnabled) {
            locDispColor.r = locRealColor.r;
            locDispColor.g = locRealColor.g;
            locDispColor.b = locRealColor.b;
            var whiteColor = new cc.Color(255, 255, 255, 255);
            selChildren = node._children;
            for (i = 0, len = selChildren.length; i < len; i++) {
                item = selChildren[i];
                if (item && item._renderCmd)
                    item._renderCmd._updateDisplayColor(whiteColor);
            }
        } else {
            if (parentColor === undefined) {
                var locParent = node._parent;
                if (locParent && locParent._cascadeColorEnabled)
                    parentColor = locParent.getDisplayedColor();
                else
                    parentColor = cc.color.WHITE;
            }
            locDispColor.r = 0 | (locRealColor.r * parentColor.r / 255.0);
            locDispColor.g = 0 | (locRealColor.g * parentColor.g / 255.0);
            locDispColor.b = 0 | (locRealColor.b * parentColor.b / 255.0);
            if (node._cascadeColorEnabled) {
                selChildren = node._children;
                for (i = 0, len = selChildren.length; i < len; i++) {
                    item = selChildren[i];
                    if (item && item._renderCmd)
                        item._renderCmd._updateDisplayColor(locDispColor);
                }
            }
        }
        this._cascadeColorEnabledDirty = false;
        this._dirtyFlag ^= cc.Node._dirtyFlags.colorDirty;
    };

    proto._updateDisplayOpacity = function (parentOpacity) {
        var node = this._node;
        var i, len, selChildren, item;
        if (this._cascadeOpacityEnabledDirty && !node._cascadeOpacityEnabled) {
            this._displayedOpacity = node._realOpacity;
            selChildren = this._children;
            for (i = 0, len = selChildren.length; i < len; i++) {
                item = selChildren[i];
                if (item && item._renderCmd)
                    item._renderCmd._updateDisplayOpacity(255);
            }
        } else {
            if (parentOpacity === undefined) {
                var locParent = node._parent;
                parentOpacity = 255;
                if (locParent && locParent._cascadeOpacityEnabled)
                    parentOpacity = locParent.getDisplayedOpacity();
            }
            this._displayedOpacity = node._realOpacity * parentOpacity / 255.0;
            if (this._cascadeOpacityEnabled) {
                selChildren = this._children;
                for (i = 0, len = selChildren.length; i < len; i++) {
                    item = selChildren[i];
                    if (item && item._renderCmd)
                        item._renderCmd._updateDisplayOpacity(this._displayedOpacity);
                }
            }
        }
        this._cascadeOpacityEnabledDirty = false;
        this._dirtyFlag ^= cc.Node._dirtyFlags.opacityDirty;
    };

    proto.setDirtyFlag = function (dirtyFlag) {
        cc.Node.RenderCmd.prototype.setDirtyFlag.call(this, dirtyFlag);
        this._setCacheDirty();
    };

    proto._setCacheDirty = function () {
        if (this._cacheDirty === false) {
            this._cacheDirty = true;
            var cachedP = this._cachedParent;
            cachedP && cachedP != this && cachedP._setNodeDirtyForCache();
        }
    };

    proto._setCachedParent = function (cachedParent) {
        if (this._cachedParent == cachedParent)
            return;

        this._cachedParent = cachedParent;
        var children = this._children;
        for (var i = 0, len = children.length; i < len; i++)
            children[i]._renderCmd._setCachedParent(cachedParent);
    };

    proto.detachFromParent = function () {
        this._cachedParent = null;
        var selChildren = this._node._children, item;
        for (var i = 0, len = selChildren.length; i < len; i++) {
            item = selChildren[i];
            if (item && item._renderCmd)
                item._renderCmd.detachFromParent();
        }
    };

    proto.setShaderProgram = function (shaderProgram) {
        //do nothing.
    };

    proto.getShaderProgram = function () {
        return null;
    };

//util functions
    cc.Node.CanvasRenderCmd._getCompositeOperationByBlendFunc = function (blendFunc) {
        if (!blendFunc)
            return "source-over";
        else {
            if (( blendFunc.src == cc.SRC_ALPHA && blendFunc.dst == cc.ONE) || (blendFunc.src == cc.ONE && blendFunc.dst == cc.ONE))
                return "lighter";
            else if (blendFunc.src == cc.ZERO && blendFunc.dst == cc.SRC_ALPHA)
                return "destination-in";
            else if (blendFunc.src == cc.ZERO && blendFunc.dst == cc.ONE_MINUS_SRC_ALPHA)
                return "destination-out";
            else
                return "source-over";
        }
    };
})();

// ------------------------------ The cc.Node's render command for WebGL ----------------------------------
(function() {
    cc.Node.WebGLRenderCmd = function (renderable) {
        cc.Node.RenderCmd.call(this, renderable);

        var mat4 = new cc.kmMat4();
        mat4.mat[2] = mat4.mat[3] = mat4.mat[6] = mat4.mat[7] = mat4.mat[8] = mat4.mat[9] = mat4.mat[11] = mat4.mat[14] = 0.0;
        mat4.mat[10] = mat4.mat[15] = 1.0;
        this._transform4x4 = mat4;
        this._stackMatrix = new cc.kmMat4();
        this._shaderProgram = null;

        this._camera = null;
    };

    var proto = cc.Node.WebGLRenderCmd.prototype = Object.create(cc.Node.RenderCmd.prototype);
    proto.constructor = cc.Node.WebGLRenderCmd;

    proto.getNodeToParentTransform = function () {
        var node = this._node;
        if (node._usingNormalizedPosition && node._parent) {        //TODO need refactor
            var conSize = node._parent._contentSize;
            node._position.x = node._normalizedPosition.x * conSize.width;
            node._position.y = node._normalizedPosition.y * conSize.height;
            node._normalizedPositionDirty = false;
        }
        if (this._dirtyFlag & cc.Node._dirtyFlags.transformDirty) {
            this._dirtyFlag ^= cc.Node._dirtyFlags.transformDirty;
            // Translate values
            var x = node._position.x, y = node._position.y;
            var apx = this._anchorPointInPoints.x, napx = -apx;
            var apy = this._anchorPointInPoints.y, napy = -apy;
            var scx = node._scaleX, scy = node._scaleY;
            var rotationRadiansX = node._rotationX * 0.017453292519943295;  //0.017453292519943295 = (Math.PI / 180);   for performance
            var rotationRadiansY = node._rotationY * 0.017453292519943295;

            if (node._ignoreAnchorPointForPosition) {
                x += apx;
                y += apy;
            }

            // Rotation values
            // Change rotation code to handle X and Y
            // If we skew with the exact same value for both x and y then we're simply just rotating
            var cx = 1, sx = 0, cy = 1, sy = 0;
            if (node._rotationX !== 0 || node._rotationY !== 0) {
                cx = Math.cos(-rotationRadiansX);
                sx = Math.sin(-rotationRadiansX);
                cy = Math.cos(-rotationRadiansY);
                sy = Math.sin(-rotationRadiansY);
            }
            var needsSkewMatrix = ( node._skewX || node._skewY );

            // optimization:
            // inline anchor point calculation if skew is not needed
            // Adjusted transform calculation for rotational skew
            if (!needsSkewMatrix && (apx !== 0 || apy !== 0)) {
                x += cy * napx * scx + -sx * napy * scy;
                y += sy * napx * scx + cx * napy * scy;
            }

            // Build Transform Matrix
            // Adjusted transform calculation for rotational skew
            var t = this._transform;
            t.a = cy * scx;
            t.b = sy * scx;
            t.c = -sx * scy;
            t.d = cx * scy;
            t.tx = x;
            t.ty = y;

            // XXX: Try to inline skew
            // If skew is needed, apply skew and then anchor point
            if (needsSkewMatrix) {
                t = cc.affineTransformConcat({a: 1.0, b: Math.tan(cc.degreesToRadians(node._skewY)),
                    c: Math.tan(cc.degreesToRadians(node._skewX)), d: 1.0, tx: 0.0, ty: 0.0}, t);

                // adjust anchor point
                if (apx !== 0 || apy !== 0)
                    t = cc.affineTransformTranslate(t, napx, napy);
            }

            if (node._additionalTransformDirty) {
                t = cc.affineTransformConcat(t, this._additionalTransform);
                node._additionalTransformDirty = false;
            }
            this._transform = t;
        }
        return this._transform;
    };

    proto.updateStatus = function () {
        var flags = cc.Node._dirtyFlags, locFlag = this._dirtyFlag;
        if (locFlag & flags.colorDirty) {
            //update the color
            this._updateDisplayColor()
        }

        if (locFlag & flags.opacityDirty) {
            //update the opacity
            this._updateDisplayOpacity();
        }

        if (locFlag & flags.transformDirty) {
            //update the transform
            this.transform(this.getParentRenderCmd(), true);
        }
    };

    proto._syncStatus = function (parentCmd) {
        var flags = cc.Node._dirtyFlags, locFlag = this._dirtyFlag;
        if (locFlag & flags.colorDirty) {
            //update the color
            this._syncDisplayColor()
        }

        if (locFlag & flags.opacityDirty) {
            //update the opacity
            this._syncDisplayOpacity();
        }

        if (locFlag & flags.transformDirty) {
            //update the transform
            this.transform(parentCmd);
        }
    };

    proto.visit = function (parentCmd) {
        var _t = this, node = this._node;
        // quick return if not visible
        if (!node._visible)
            return;

        if (node._parent && node._parent._renderCmd)
            this._curLevel = node._parent._renderCmd._curLevel + 1;

        var i, currentStack = cc.current_stack;

        //optimize performance for javascript
        currentStack.stack.push(currentStack.top);
        cc.kmMat4Assign(_t._stackMatrix, currentStack.top);
        currentStack.top = _t._stackMatrix;

        _t._syncStatus(parentCmd);
        var locChildren = node._children;
        if (locChildren && locChildren.length > 0) {
            var childLen = locChildren.length;
            node.sortAllChildren();
            // draw children zOrder < 0
            for (i = 0; i < childLen; i++) {
                if (locChildren[i] && locChildren[i]._localZOrder < 0)
                    locChildren[i]._renderCmd.visit(this);
                else
                    break;
            }

            cc.renderer.pushRenderCommand(this);
            // draw children zOrder >= 0
            for (; i < childLen; i++) {
                if (locChildren[i])
                    locChildren[i]._renderCmd.visit(this);
            }
        } else
            cc.renderer.pushRenderCommand(this);

        //optimize performance for javascript
        currentStack.top = currentStack.stack.pop();
    };

    proto.transform = function (parentCmd, recursive) {
        var t4x4 = this._transform4x4, stackMatrix = this._stackMatrix, node = this._node;
        parentCmd = parentCmd || this.getParentRenderCmd();
        var parentMatrix = (parentCmd ? parentCmd._stackMatrix : cc.current_stack.top);

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
        t4x4Mat[14] = node._vertexZ;

        //optimize performance for Javascript
        cc.kmMat4Multiply(stackMatrix, parentMatrix, t4x4);

        // XXX: Expensive calls. Camera should be integrated into the cached affine matrix
        if (node._camera != null && !(node.grid != null && node.grid.isActive())) {
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

                node._camera._locateForRenderer(stackMatrix);

                //cc.kmGLTranslatef(-apx, -apy, 0);
                cc.kmMat4Translation(translation, -apx, -apy, 0);
                cc.kmMat4Multiply(stackMatrix, stackMatrix, translation);
            } else {
                node._camera._locateForRenderer(stackMatrix);
            }
        }
        this._renderCmdDiry = false;
        if(!recursive || !node._children || node._children.length === 0)
            return;
        var i, len, locChildren = node._children;
        for(i = 0, len = locChildren.length; i< len; i++){
            locChildren[i]._renderCmd.transform(this, recursive);
        }
    };

    proto.setShaderProgram = function (shaderProgram) {
        this._shaderProgram = shaderProgram;
    };

    proto.getShaderProgram = function () {
        return this._shaderProgram;
    };
})();
