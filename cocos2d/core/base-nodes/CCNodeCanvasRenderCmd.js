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
    };
    this.needDraw = function () {
        return this._needDraw;
    };
};

cc.Node._dirtyFlags = {
    transformDirty: 1 << 0, visibleDirty: 1 << 1, colorDirty: 1 << 2, opacityDirty: 1 << 3, cacheDirty: 1 << 4,
    orderDirty: 1 << 5, textDirty: 1 << 6, gradientDirty: 1 << 7, textureDirty: 1 << 8,
    contentDirty: 1 << 9,
    COUNT: 10,
    all: (1 << 10) - 1
};

//-------------------------Base -------------------------
cc.Node.RenderCmd = function (renderable) {
    this._dirtyFlag = 1;                           //need update the transform at first.
    this._savedDirtyFlag = true;

    this._node = renderable;
    this._needDraw = false;
    this._anchorPointInPoints = new cc.Point(0, 0);

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
        if (this._dirtyFlag & cc.Node._dirtyFlags.transformDirty)
            this._inverse = cc.affineTransformInvert(this.getNodeToParentTransform());
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
                var rotationRadiansX = node._rotationX * 0.017453292519943295;  //0.017453292519943295 = (Math.PI / 180);   for performance
                c = Math.sin(rotationRadiansX);
                d = Math.cos(rotationRadiansX);
                if (node._rotationY === node._rotationX) {
                    a = d;
                    b = -c;
                }
                else {
                    var rotationRadiansY = node._rotationY * 0.017453292519943295;  //0.017453292519943295 = (Math.PI / 180);   for performance
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
                var skx = Math.tan(node._skewX * Math.PI / 180);
                var sky = Math.tan(node._skewY * Math.PI / 180);
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
                this._transform = t = cc.affineTransformConcat(t, node._additionalTransform); // seems like 'this._transform' can be removed
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
                this._transform = t = cc.affineTransformConcat(t, node._additionalTransform);
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

        this._updateCurrentRegions && this._updateCurrentRegions();
        this._notifyRegionStatus && this._notifyRegionStatus(cc.Node.CanvasRenderCmd.RegionStatus.DirtyDouble);

        if (recursive) {
            var locChildren = this._node._children;
            if (!locChildren || locChildren.length === 0)
                return;
            var i, len;
            for (i = 0, len = locChildren.length; i < len; i++) {
                locChildren[i]._renderCmd.transform(this, recursive);
            }
        }

        this._cacheDirty = true;
    },

    getNodeToParentTransform: function () {
        if (this._dirtyFlag & cc.Node._dirtyFlags.transformDirty) {
            this.transform();
        }
        return this._transform;
    },

    visit: function (parentCmd) {
        var node = this._node, renderer = cc.renderer;
        // quick return if not visible
        if (!node._visible)
            return;

        parentCmd = parentCmd || this.getParentRenderCmd();
        if (parentCmd)
            this._curLevel = parentCmd._curLevel + 1;

        if (isNaN(node._customZ)) {
            node._vertexZ = renderer.assignedZ;
            renderer.assignedZ += renderer.assignedZStep;
        }

        this._syncStatus(parentCmd);
        this.visitChildren();
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
        this._dirtyFlag = this._dirtyFlag & cc.Node._dirtyFlags.colorDirty ^ this._dirtyFlag;
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
        this._dirtyFlag = this._dirtyFlag & cc.Node._dirtyFlags.opacityDirty ^ this._dirtyFlag;
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

    updateStatus: function () {
        var flags = cc.Node._dirtyFlags, locFlag = this._dirtyFlag;
        var colorDirty = locFlag & flags.colorDirty,
            opacityDirty = locFlag & flags.opacityDirty;
        this._savedDirtyFlag = this._savedDirtyFlag || locFlag;

        if (colorDirty)
            this._updateDisplayColor();

        if (opacityDirty)
            this._updateDisplayOpacity();

        if (colorDirty || opacityDirty)
            this._updateColor();

        if (locFlag & flags.transformDirty) {
            //update the transform
            this.transform(this.getParentRenderCmd(), true);
            this._dirtyFlag = this._dirtyFlag & flags.transformDirty ^ this._dirtyFlag;
        }

        if (locFlag & flags.orderDirty)
            this._dirtyFlag = this._dirtyFlag & flags.orderDirty ^ this._dirtyFlag;
    },

    _syncStatus: function (parentCmd) {
        //  In the visit logic does not restore the _dirtyFlag
        //  Because child elements need parent's _dirtyFlag to change himself
        var flags = cc.Node._dirtyFlags, locFlag = this._dirtyFlag, parentNode = null;
        if (parentCmd) {
            parentNode = parentCmd._node;
            this._savedDirtyFlag = this._savedDirtyFlag || parentCmd._savedDirtyFlag || locFlag;
        }
        else {
            this._savedDirtyFlag = this._savedDirtyFlag || locFlag;
        }

        //  There is a possibility:
        //    The parent element changed color, child element not change
        //    This will cause the parent element changed color
        //    But while the child element does not enter the circulation
        //    Here will be reset state in last
        //    In order the child elements get the parent state
        if (parentNode && parentNode._cascadeColorEnabled && (parentCmd._dirtyFlag & flags.colorDirty))
            locFlag |= flags.colorDirty;

        if (parentNode && parentNode._cascadeOpacityEnabled && (parentCmd._dirtyFlag & flags.opacityDirty))
            locFlag |= flags.opacityDirty;

        if (parentCmd && (parentCmd._dirtyFlag & flags.transformDirty))
            locFlag |= flags.transformDirty;

        var colorDirty = locFlag & flags.colorDirty,
            opacityDirty = locFlag & flags.opacityDirty;

        this._dirtyFlag = locFlag;

        if (colorDirty)
        //update the color
            this._syncDisplayColor();

        if (opacityDirty)
        //update the opacity
            this._syncDisplayOpacity();

        if (colorDirty || opacityDirty)
            this._updateColor();

        if (locFlag & flags.transformDirty)
            //update the transform
            this.transform(parentCmd);

        if (locFlag & flags.orderDirty)
            this._dirtyFlag = this._dirtyFlag & flags.orderDirty ^ this._dirtyFlag;
    },

    visitChildren: function () {
        var renderer = cc.renderer;
        var node = this._node;
        var i, children = node._children, child;
        var len = children.length;
        if (len > 0) {
            node.sortAllChildren();
            // draw children zOrder < 0
            for (i = 0; i < len; i++) {
                child = children[i];
                if (child._localZOrder < 0) {
                    child._renderCmd.visit(this);
                }
                else {
                    break;
                }
            }

            renderer.pushRenderCommand(this);
            for (; i < len; i++) {
                children[i]._renderCmd.visit(this);
            }
        } else {
            renderer.pushRenderCommand(this);
        }
        this._dirtyFlag = 0;
    }
};

cc.Node.RenderCmd.prototype.originVisit = cc.Node.RenderCmd.prototype.visit;
cc.Node.RenderCmd.prototype.originTransform = cc.Node.RenderCmd.prototype.transform;

//-----------------------Canvas ---------------------------

(function () {
//The cc.Node's render command for Canvas
    cc.Node.CanvasRenderCmd = function (renderable) {
        cc.Node.RenderCmd.call(this, renderable);
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