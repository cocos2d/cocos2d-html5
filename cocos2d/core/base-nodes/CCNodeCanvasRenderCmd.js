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
};
cc.CustomRenderCmd.prototype.rendering = function (ctx, scaleX, scaleY) {
    if (!this._callback)
        return;
    this._callback.call(this._target, ctx, scaleX, scaleY);
};
cc.CustomRenderCmd.prototype.needDraw = function () {
    return this._needDraw;
};

var dirtyFlags = cc.Node._dirtyFlags = {
    transformDirty: 1 << 0, visibleDirty: 1 << 1, colorDirty: 1 << 2, opacityDirty: 1 << 3, cacheDirty: 1 << 4,
    orderDirty: 1 << 5, textDirty: 1 << 6, gradientDirty: 1 << 7, textureDirty: 1 << 8,
    contentDirty: 1 << 9,
    COUNT: 10,
    all: (1 << 10) - 1
};

var ONE_DEGREE = Math.PI / 180;

function transformChildTree(root) {
    var index = 1;
    var children, child, curr, parentCmd, i, len;
    var stack = cc.Node._performStacks[cc.Node._performing];
    if (!stack) {
        stack = [];
        cc.Node._performStacks.push(stack);
    }
    stack.length = 0;
    cc.Node._performing++;
    stack[0] = root;
    while (index) {
        index--;
        curr = stack[index];
        // Avoid memory leak
        stack[index] = null;
        if (!curr) continue;
        children = curr._children;
        if (children && children.length > 0) {
            parentCmd = curr._renderCmd;
            for (i = 0, len = children.length; i < len; ++i) {
                child = children[i];
                stack[index] = child;
                index++;
                child._renderCmd.transform(parentCmd);
            }
        }
        var pChildren = curr._protectedChildren;
        if (pChildren && pChildren.length > 0) {
            parentCmd = curr._renderCmd;
            for (i = 0, len = pChildren.length; i < len; ++i) {
                child = pChildren[i];
                stack[index] = child;
                index++;
                child._renderCmd.transform(parentCmd);
            }
        }
    }
    cc.Node._performing--;
}

//-------------------------Base -------------------------
cc.Node.RenderCmd = function (renderable) {
    this._node = renderable;
    this._anchorPointInPoints = {x: 0, y: 0};
    this._displayedColor = cc.color(255, 255, 255, 255);
};

cc.Node.RenderCmd.prototype = {
    constructor: cc.Node.RenderCmd,

    _needDraw: false,
    _dirtyFlag: 1,
    _curLevel: -1,

    _displayedOpacity: 255,
    _cascadeColorEnabledDirty: false,
    _cascadeOpacityEnabledDirty: false,

    _transform: null,
    _worldTransform: null,
    _inverse: null,

    needDraw: function () {
        return this._needDraw;
    },

    getAnchorPointInPoints: function () {
        return cc.p(this._anchorPointInPoints);
    },

    getDisplayedColor: function () {
        var tmpColor = this._displayedColor;
        return cc.color(tmpColor.r, tmpColor.g, tmpColor.b, tmpColor.a);
    },

    getDisplayedOpacity: function () {
        return this._displayedOpacity;
    },

    setCascadeColorEnabledDirty: function () {
        this._cascadeColorEnabledDirty = true;
        this.setDirtyFlag(cc.Node._dirtyFlags.colorDirty);
    },

    setCascadeOpacityEnabledDirty: function () {
        this._cascadeOpacityEnabledDirty = true;
        this.setDirtyFlag(cc.Node._dirtyFlags.opacityDirty);
    },

    getParentToNodeTransform: function () {
        if (!this._inverse) {
            this._inverse = {a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0};
        }
        if (this._dirtyFlag & cc.Node._dirtyFlags.transformDirty) {
            cc.affineTransformInvertOut(this.getNodeToParentTransform(), this._inverse);
        }
        return this._inverse;
    },

    detachFromParent: function () {
    },

    _updateAnchorPointInPoint: function () {
        var locAPP = this._anchorPointInPoints, locSize = this._node._contentSize, locAnchorPoint = this._node._anchorPoint;
        locAPP.x = locSize.width * locAnchorPoint.x;
        locAPP.y = locSize.height * locAnchorPoint.y;
        this.setDirtyFlag(cc.Node._dirtyFlags.transformDirty);
    },

    setDirtyFlag: function (dirtyFlag) {
        if (this._dirtyFlag === 0 && dirtyFlag !== 0)
            cc.renderer.pushDirtyNode(this);
        this._dirtyFlag |= dirtyFlag;
    },

    getParentRenderCmd: function () {
        if (this._node && this._node._parent && this._node._parent._renderCmd)
            return this._node._parent._renderCmd;
        return null;
    },

    transform: function (parentCmd, recursive) {
        if (!this._transform) {
            this._transform = {a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0};
            this._worldTransform = {a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0};
        }

        var node = this._node,
            pt = parentCmd ? parentCmd._worldTransform : null,
            t = this._transform,
            wt = this._worldTransform;         //get the world transform

        if (node._usingNormalizedPosition && node._parent) {
            var conSize = node._parent._contentSize;
            node._position.x = node._normalizedPosition.x * conSize.width;
            node._position.y = node._normalizedPosition.y * conSize.height;
            node._normalizedPositionDirty = false;
        }

        var hasRotation = node._rotationX || node._rotationY;
        var hasSkew = node._skewX || node._skewY;
        var sx = node._scaleX, sy = node._scaleY;
        var appX = this._anchorPointInPoints.x, appY = this._anchorPointInPoints.y;
        var a = 1, b = 0, c = 0, d = 1;
        if (hasRotation || hasSkew) {
            // position 
            t.tx = node._position.x;
            t.ty = node._position.y;

            // rotation
            if (hasRotation) {
                var rotationRadiansX = node._rotationX * ONE_DEGREE;
                c = Math.sin(rotationRadiansX);
                d = Math.cos(rotationRadiansX);
                if (node._rotationY === node._rotationX) {
                    a = d;
                    b = -c;
                }
                else {
                    var rotationRadiansY = node._rotationY * ONE_DEGREE;
                    a = Math.cos(rotationRadiansY);
                    b = -Math.sin(rotationRadiansY);
                }
            }

            // scale
            t.a = a *= sx;
            t.b = b *= sx;
            t.c = c *= sy;
            t.d = d *= sy;

            // skew
            if (hasSkew) {
                var skx = Math.tan(node._skewX * ONE_DEGREE);
                var sky = Math.tan(node._skewY * ONE_DEGREE);
                if (skx === Infinity)
                    skx = 99999999;
                if (sky === Infinity)
                    sky = 99999999;
                t.a = a + c * sky;
                t.b = b + d * sky;
                t.c = c + a * skx;
                t.d = d + b * skx;
            }

            if (appX || appY) {
                t.tx -= t.a * appX + t.c * appY;
                t.ty -= t.b * appX + t.d * appY;
                // adjust anchorPoint
                if (node._ignoreAnchorPointForPosition) {
                    t.tx += appX;
                    t.ty += appY;
                }
            }

            if (node._additionalTransformDirty) {
                cc.affineTransformConcatIn(t, node._additionalTransform);
            }

            if (pt) {
                // cc.AffineTransformConcat is incorrect at get world transform
                wt.a = t.a * pt.a + t.b * pt.c;                               //a
                wt.b = t.a * pt.b + t.b * pt.d;                               //b
                wt.c = t.c * pt.a + t.d * pt.c;                               //c
                wt.d = t.c * pt.b + t.d * pt.d;                               //d
                wt.tx = pt.a * t.tx + pt.c * t.ty + pt.tx;
                wt.ty = pt.d * t.ty + pt.ty + pt.b * t.tx;
            } else {
                wt.a = t.a;
                wt.b = t.b;
                wt.c = t.c;
                wt.d = t.d;
                wt.tx = t.tx;
                wt.ty = t.ty;
            }
        }
        else {
            t.a = sx;
            t.b = 0;
            t.c = 0;
            t.d = sy;
            t.tx = node._position.x;
            t.ty = node._position.y;

            if (appX || appY) {
                t.tx -= t.a * appX;
                t.ty -= t.d * appY;
                // adjust anchorPoint
                if (node._ignoreAnchorPointForPosition) {
                    t.tx += appX;
                    t.ty += appY;
                }
            }

            if (node._additionalTransformDirty) {
                cc.affineTransformConcatIn(t, node._additionalTransform);
            }

            if (pt) {
                wt.a = t.a * pt.a + t.b * pt.c;
                wt.b = t.a * pt.b + t.b * pt.d;
                wt.c = t.c * pt.a + t.d * pt.c;
                wt.d = t.c * pt.b + t.d * pt.d;
                wt.tx = t.tx * pt.a + t.ty * pt.c + pt.tx;
                wt.ty = t.tx * pt.b + t.ty * pt.d + pt.ty;
            } else {
                wt.a = t.a;
                wt.b = t.b;
                wt.c = t.c;
                wt.d = t.d;
                wt.tx = t.tx;
                wt.ty = t.ty;
            }
        }

        if (this._updateCurrentRegions) {
            this._updateCurrentRegions();
            this._notifyRegionStatus && this._notifyRegionStatus(cc.Node.CanvasRenderCmd.RegionStatus.DirtyDouble);
        }

        if (recursive) {
            transformChildTree(node);
        }

        this._cacheDirty = true;
    },

    getNodeToParentTransform: function () {
        if (!this._transform || this._dirtyFlag & cc.Node._dirtyFlags.transformDirty) {
            this.transform();
        }
        return this._transform;
    },

    visit: function (parentCmd) {
        var node = this._node, renderer = cc.renderer;

        parentCmd = parentCmd || this.getParentRenderCmd();
        if (parentCmd)
            this._curLevel = parentCmd._curLevel + 1;

        if (isNaN(node._customZ)) {
            node._vertexZ = renderer.assignedZ;
            renderer.assignedZ += renderer.assignedZStep;
        }

        this._syncStatus(parentCmd);
    },

    _updateDisplayColor: function (parentColor) {
        var node = this._node;
        var locDispColor = this._displayedColor, locRealColor = node._realColor;
        var i, len, selChildren, item;
        this._notifyRegionStatus && this._notifyRegionStatus(cc.Node.CanvasRenderCmd.RegionStatus.Dirty);
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
            this._cascadeColorEnabledDirty = false;
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
                    if (item && item._renderCmd) {
                        item._renderCmd._updateDisplayColor(locDispColor);
                        item._renderCmd._updateColor();
                    }
                }
            }
        }
        this._dirtyFlag &= ~dirtyFlags.colorDirty;
    },

    _updateDisplayOpacity: function (parentOpacity) {
        var node = this._node;
        var i, len, selChildren, item;
        this._notifyRegionStatus && this._notifyRegionStatus(cc.Node.CanvasRenderCmd.RegionStatus.Dirty);
        if (this._cascadeOpacityEnabledDirty && !node._cascadeOpacityEnabled) {
            this._displayedOpacity = node._realOpacity;
            selChildren = node._children;
            for (i = 0, len = selChildren.length; i < len; i++) {
                item = selChildren[i];
                if (item && item._renderCmd)
                    item._renderCmd._updateDisplayOpacity(255);
            }
            this._cascadeOpacityEnabledDirty = false;
        } else {
            if (parentOpacity === undefined) {
                var locParent = node._parent;
                parentOpacity = 255;
                if (locParent && locParent._cascadeOpacityEnabled)
                    parentOpacity = locParent.getDisplayedOpacity();
            }
            this._displayedOpacity = node._realOpacity * parentOpacity / 255.0;
            if (node._cascadeOpacityEnabled) {
                selChildren = node._children;
                for (i = 0, len = selChildren.length; i < len; i++) {
                    item = selChildren[i];
                    if (item && item._renderCmd) {
                        item._renderCmd._updateDisplayOpacity(this._displayedOpacity);
                        item._renderCmd._updateColor();
                    }
                }
            }
        }
        this._dirtyFlag &= ~dirtyFlags.opacityDirty;
    },

    _syncDisplayColor: function (parentColor) {
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
    },

    _syncDisplayOpacity: function (parentOpacity) {
        var node = this._node;
        if (parentOpacity === undefined) {
            var locParent = node._parent;
            parentOpacity = 255;
            if (locParent && locParent._cascadeOpacityEnabled)
                parentOpacity = locParent.getDisplayedOpacity();
        }
        this._displayedOpacity = node._realOpacity * parentOpacity / 255.0;
    },

    _updateColor: function () {
    },

    _propagateFlagsDown: function (parentCmd) {
        var locFlag = this._dirtyFlag;
        var parentNode = parentCmd ? parentCmd._node : null;

        if(parentNode && parentNode._cascadeColorEnabled && (parentCmd._dirtyFlag & dirtyFlags.colorDirty))
            locFlag |= dirtyFlags.colorDirty;

        if(parentNode && parentNode._cascadeOpacityEnabled && (parentCmd._dirtyFlag & dirtyFlags.opacityDirty))
            locFlag |= dirtyFlags.opacityDirty;

        if(parentCmd && (parentCmd._dirtyFlag & dirtyFlags.transformDirty))
            locFlag |= dirtyFlags.transformDirty;

        this._dirtyFlag = locFlag;
    },

    updateStatus: function () {
        var locFlag = this._dirtyFlag;
        var colorDirty = locFlag & dirtyFlags.colorDirty,
            opacityDirty = locFlag & dirtyFlags.opacityDirty;

        if (locFlag & dirtyFlags.contentDirty) {
            this._notifyRegionStatus && this._notifyRegionStatus(cc.Node.CanvasRenderCmd.RegionStatus.Dirty);
            this._dirtyFlag &= ~dirtyFlags.contentDirty;
        }

        if (colorDirty)
            this._updateDisplayColor();

        if (opacityDirty)
            this._updateDisplayOpacity();

        if (colorDirty || opacityDirty)
            this._updateColor();

        if (locFlag & dirtyFlags.transformDirty) {
            //update the transform
            this.transform(this.getParentRenderCmd(), true);
            this._dirtyFlag &= ~dirtyFlags.transformDirty;
        }

        if (locFlag & dirtyFlags.orderDirty)
            this._dirtyFlag &= ~dirtyFlags.orderDirty;
    },

    _syncStatus: function (parentCmd) {
        //  In the visit logic does not restore the _dirtyFlag
        //  Because child elements need parent's _dirtyFlag to change himself
        var locFlag = this._dirtyFlag, parentNode = parentCmd ? parentCmd._node : null;

        //  There is a possibility:
        //    The parent element changed color, child element not change
        //    This will cause the parent element changed color
        //    But while the child element does not enter the circulation
        //    Here will be reset state in last
        //    In order the child elements get the parent state
        if (parentNode && parentNode._cascadeColorEnabled && (parentCmd._dirtyFlag & dirtyFlags.colorDirty))
            locFlag |= dirtyFlags.colorDirty;

        if (parentNode && parentNode._cascadeOpacityEnabled && (parentCmd._dirtyFlag & dirtyFlags.opacityDirty))
            locFlag |= dirtyFlags.opacityDirty;

        if (parentCmd && (parentCmd._dirtyFlag & dirtyFlags.transformDirty))
            locFlag |= dirtyFlags.transformDirty;

        this._dirtyFlag = locFlag;

        var colorDirty = locFlag & dirtyFlags.colorDirty,
            opacityDirty = locFlag & dirtyFlags.opacityDirty;

        if (colorDirty)
            //update the color
            this._syncDisplayColor();

        if (opacityDirty)
            //update the opacity
            this._syncDisplayOpacity();

        if (colorDirty || opacityDirty)
            this._updateColor();

        if (locFlag & dirtyFlags.transformDirty)
            //update the transform
            this.transform(parentCmd);

        if (locFlag & dirtyFlags.orderDirty)
            this._dirtyFlag &= ~dirtyFlags.orderDirty;
    },

    setShaderProgram: function (shaderProgram) {
        //do nothing.
    },

    getShaderProgram: function () {
        return null;
    },

    getGLProgramState: function () {
        return null;
    },

    setGLProgramState: function (glProgramState) {
        // do nothing
    },
};

cc.Node.RenderCmd.prototype.originTransform = cc.Node.RenderCmd.prototype.transform;
cc.Node.RenderCmd.prototype.originUpdateStatus = cc.Node.RenderCmd.prototype.updateStatus;
cc.Node.RenderCmd.prototype._originSyncStatus = cc.Node.RenderCmd.prototype._syncStatus;

//-----------------------Canvas ---------------------------

(function () {
//The cc.Node's render command for Canvas
    cc.Node.CanvasRenderCmd = function (renderable) {
        this._node = renderable;
        this._anchorPointInPoints = {x: 0, y: 0};
        this._displayedColor = cc.color(255, 255, 255, 255);
        this._cachedParent = null;
        this._cacheDirty = false;
        this._currentRegion = new cc.Region();
        this._oldRegion = new cc.Region();
        this._regionFlag = 0;
        this._canUseDirtyRegion = false;
    };

    cc.Node.CanvasRenderCmd.RegionStatus = {
        NotDirty: 0,    //the region is not dirty
        Dirty: 1,       //the region is dirty, because of color, opacity or context
        DirtyDouble: 2  //the region is moved, the old and the new one need considered when rendering
    };

    var proto = cc.Node.CanvasRenderCmd.prototype = Object.create(cc.Node.RenderCmd.prototype);
    proto.constructor = cc.Node.CanvasRenderCmd;
    proto._rootCtor = cc.Node.CanvasRenderCmd;

    proto._notifyRegionStatus = function (status) {
        if (this._needDraw && this._regionFlag < status) {
            this._regionFlag = status;
        }
    };

    var localBB = new cc.Rect();
    proto.getLocalBB = function () {
        var node = this._node;
        localBB.x = localBB.y = 0;
        localBB.width = node._contentSize.width;
        localBB.height = node._contentSize.height;
        return localBB;
    };

    proto._updateCurrentRegions = function () {
        var temp = this._currentRegion;
        this._currentRegion = this._oldRegion;
        this._oldRegion = temp;
        //hittest will call the transform, and set region flag to DirtyDouble, and the changes need to be considered for rendering
        if (cc.Node.CanvasRenderCmd.RegionStatus.DirtyDouble === this._regionFlag && (!this._currentRegion.isEmpty())) {
            this._oldRegion.union(this._currentRegion);
        }
        this._currentRegion.updateRegion(this.getLocalBB(), this._worldTransform);
    };

    proto.setDirtyFlag = function (dirtyFlag, child) {
        cc.Node.RenderCmd.prototype.setDirtyFlag.call(this, dirtyFlag, child);
        this._setCacheDirty(child);                  //TODO it should remove from here.
        if (this._cachedParent)
            this._cachedParent.setDirtyFlag(dirtyFlag, true);
    };

    proto._setCacheDirty = function () {
        if (this._cacheDirty === false) {
            this._cacheDirty = true;
            var cachedP = this._cachedParent;
            cachedP && cachedP !== this && cachedP._setNodeDirtyForCache && cachedP._setNodeDirtyForCache();
        }
    };

    proto._setCachedParent = function (cachedParent) {
        if (this._cachedParent === cachedParent)
            return;

        this._cachedParent = cachedParent;
        var children = this._node._children;
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

    //util functions
    cc.Node.CanvasRenderCmd._getCompositeOperationByBlendFunc = function (blendFunc) {
        if (!blendFunc)
            return "source-over";
        else {
            if (( blendFunc.src === cc.SRC_ALPHA && blendFunc.dst === cc.ONE) || (blendFunc.src === cc.ONE && blendFunc.dst === cc.ONE))
                return "lighter";
            else if (blendFunc.src === cc.ZERO && blendFunc.dst === cc.SRC_ALPHA)
                return "destination-in";
            else if (blendFunc.src === cc.ZERO && blendFunc.dst === cc.ONE_MINUS_SRC_ALPHA)
                return "destination-out";
            else
                return "source-over";
        }
    };
})();
