/****************************************************************************
 Copyright (c) 2015-2016 Chukong Technologies Inc.

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
 * BoneNode
 * base class
 * @class
 */
ccs.BoneNode = (function () {

    var Node = cc.Node;
    var SkinNode = ccs.SkinNode;
    var BlendFunc = cc.BlendFunc;
    var type = {
        p: cc.p,
        size: cc.size,
        rect: cc.rect
    };
    var debug = {
        log: cc.log,
        assert: cc.assert
    };

    var BoneNode = Node.extend(/** @lends ccs.BoneNode# */{
        _customCommand: null,
        _blendFunc: null,

        _rackColor: null,

        _rackLength: null,
        _rackWidth: null,

        _childBones: null,
        _boneSkins: null,
        _rootSkeleton: null,

        _squareVertices: null,
        _squareColors: null,
        _noMVPVertices: null,

        ctor: function (length) {
            // null
            // length
            Node.prototype.ctor.call(this);
            // _isRackShow -> _renderCmd._debug
            if (this._squareVertices === null)
                this._squareVertices = [
                    {x: 0, y: 0}, {x: 0, y: 0}, {x: 0, y: 0}, {x: 0, y: 0}
                ];

            this._rackColor = cc.color.WHITE;
            this._rootSkeleton = null;
            this._blendFunc = BlendFunc.ALPHA_NON_PREMULTIPLIED;

            this._childBones = [];
            this._boneSkins = [];

            this._rackLength = length === undefined ? 50 : length;
            this._rackWidth = 20;
            this._updateVertices();
        },

        addSkin: function (skin, display, hideOthers/*false*/) {
            // skin, display
            // skin, display, hideOthers
            var boneSkins = this._boneSkins;
            debug.assert(skin != null, "Argument must be non-nil");
            if (hideOthers) {
                for (var i = 0; i < boneSkins.length; i++) {
                    boneSkins[i].setVisible(false);
                }
            }
            Node.prototype.addChild.call(this, skin);
            skin.setVisible(display);
        },

        getChildBones: function () {
            return this._childBones;
        },

        getSkins: function () {
            return this._boneSkins;
        },

        displaySkin: function (skin, hideOthers) {
            var boneSkins = this._boneSkins;
            var boneSkin, i;
            if (typeof skin === "string") {
                for (i = 0; i < boneSkins.length; i++) {
                    boneSkin = boneSkins[i];
                    if (boneSkin == boneSkin.getName()) {
                        boneSkin.setVisible(true);
                    } else if (hideOthers) {
                        boneSkin.setVisible(false);
                    }
                }
            } else {
                for (i = 0; i < boneSkins.length; i++) {
                    boneSkin = boneSkins[i];
                    if (boneSkin == skin) {
                        boneSkin.setVisible(true);
                    } else if (hideOthers) {
                        boneSkin.setVisible(false);
                    }
                }
            }
        },

        displaySkins: function (skinName, hideOthers) {
        },

        getVisibleSkins: function () {
            var displayingSkins = [];
            var boneSkins = this._boneSkins;
            for (var boneSkin, i = 0; i < boneSkins.length; i++) {
                boneSkin = boneSkins[i];
                if (boneSkin.isVisible()) {
                    displayingSkins.push(boneSkin);
                }
            }
            return displayingSkins;
        },

        getRootSkeletonNode: function () {
            return this._rootSkeleton;
        },

        getAllSubBones: function () {
            var allBones = [];
            var boneStack = []; // for avoid recursive
            var childBones = this._childBones;
            for (var i = 0; i < childBones.length; i++) {
                boneStack.push(childBones[i]);
            }

            while (boneStack.length > 0) {
                var top = boneStack.pop();
                allBones.push(top);
                var topChildren = top.getChildBones();
                if (topChildren.length > 0) {
                    for (var j = 0; j < topChildren; j++) {
                        boneStack.push(topChildren[j]);
                    }
                }
            }
            return allBones;
        },

        getAllSubSkins: function () {
            var allBones = this.getAllSubBones();
            var allSkins = [];
            for (var i = 0; i < allBones.length; i++) {
                var skins = allBones[i].getSkins();
                for (var j = 0; j < skins.length; j++) {
                    allSkins.push(skins[i]);
                }
            }
            return allSkins;
        },

        addChild: function (child, localZOrder, tag) {
            //child, localZOrder, tag
            //child, localZOrder, name
            Node.prototype.addChild.call(this, child, localZOrder, tag);
            this._addToChildrenListHelper(child);
        },

        removeChild: function (child, cleanup) {
            Node.prototype.removeChild.call(this, child, cleanup);
            this._removeFromChildrenListHelper(child);
        },

        setBlendFunc: function (blendFunc) {
            this._blendFunc = blendFunc;
        },

        getBlendFunc: function () {
            return this._blendFunc;
        },

        setDebugDrawLength: function (length) {
            this._rackLength = length;
            this._updateVertices();
        },

        getDebugDrawLength: function () {
            return this._rackLength;
        },

        setDebugDrawWidth: function (width) {
            this._rackWidth = width;
            this._updateVertices();
        },

        getDebugDrawWidth: function () {
            return this._rackWidth;
        },

        setDebugDrawEnabled: function (isDebugDraw) {
            var renderCmd = this._renderCmd;
            if (renderCmd._debug === isDebugDraw)
                return;

            renderCmd._debug = isDebugDraw;
            cc.renderer.childrenOrderDirty = true;
            var children = this._children;
            for (var child, i = 0; i < children.length; i++) {
                child = children[i];
                if (child && child.setDebugDrawEnabled)
                    child.setDebugDrawEnabled(isDebugDraw);
            }
        },

        isDebugDrawEnabled: function () {
            return this._renderCmd._debug;
        },

        setDebugDrawColor: function (color) {
            this._rackColor = color;
        },

        getDebugDrawColor: function () {
            return this._rackColor;
        },

        getVisibleSkinsRect: function () {
            var minx, miny, maxx, maxy = 0;
            minx = miny = maxx = maxy;
            var first = true;

            var displayRect = type.rect(0, 0, 0, 0);
            if (this._renderCmd._debug && this._rootSkeleton != null && this._rootSkeleton._renderCmd._debug) {
                maxx = this._rackWidth;
                maxy = this._rackLength;
                first = false;
            }

            var boneSkins = this._boneSkins;
            for (var skin, i = 0; i < boneSkins.length; i++) {
                skin = boneSkins[i];
                var r = skin.getBoundingBox();
                if (!skin.isVisible() || (r.x === 0 && r.y === 0 && r.width === 0 && r.height === 0))
                    continue;

                if (first) {
                    minx = cc.rectGetMinX(r);
                    miny = cc.rectGetMinY(r);
                    maxx = cc.rectGetMaxX(r);
                    maxy = cc.rectGetMaxY(r);

                    first = false;
                } else {
                    minx = Math.min(cc.rectGetMinX(r), minx);
                    miny = Math.min(cc.rectGetMinY(r), miny);
                    maxx = Math.max(cc.rectGetMaxX(r), maxx);
                    maxy = Math.max(cc.rectGetMaxY(r), maxy);
                }
                displayRect.setRect(minx, miny, maxx - minx, maxy - miny);
            }
            return displayRect;
        },

        getBoundingBox: function () {
            var boundingBox = this.getVisibleSkinsRect();
            return cc.rectApplyAffineTransform(boundingBox, this.getNodeToParentAffineTransform());
        },

        getBoneToSkeletonTransform: function () {
            var retMat;
            if (this._rootSkeleton == null) {
                retMat = {a: 1, b: 0, c: 0, d: 1, x: 0, y: 0};
                debug.log("can not transform before added to Skeleton");
                return retMat;
            }

            retMat = this.getNodeToParentTransform();
            //todo check here p exists
            for (var p = this._parent; p && p != this._rootSkeleton; p = p.getParent()) {
                //todo check here
                retMat = cc.affineTransformConcat(p.getNodeToParentTransform(), retMat);
            }
            return retMat;
        },

        getBoneToSkeletonAffineTransform: function () {
            var retTrans;
            if (this._rootSkeleton == null) {
                retTrans = {a: 1, b: 0, c: 0, d: 1, x: 0, y: 0};
                debug.log("can not transform before added to Skeleton");
                return retTrans;
            }
            retTrans = this.getNodeToParentTransform();
            for (var p = this._parent; p && p != this._rootSkeleton; p = p.getParent())
                retTrans = cc.affineTransformConcat(retTrans, p.getNodeToParentTransform());
            return retTrans;
        },

        batchBoneDrawToSkeleton: function (bone) {},

        setLocalZOrder: function (localZOrder) {
            Node.prototype.setLocalZOrder.call(this, localZOrder);
            if (this._rootSkeleton != null)
                this._rootSkeleton._sortedAllBonesDirty = true;
        },

        setName: function (name) {
            var rootSkeleton = this._rootSkeleton;
            var oldName = this.getName();
            Node.prototype.setName.call(this, name);
            if (rootSkeleton != null) {
                var oIter = rootSkeleton._subBonesMap[oldName];
                var nIter = rootSkeleton._subBonesMap[name];
                if (oIter && !nIter) {
                    delete rootSkeleton._subBonesMap[oIter];
                    rootSkeleton._subBonesMap[name] = oIter;
                }
            }
        },

        setContentSize: function(contentSize){
            Node.prototype.setContentSize.call(this, contentSize);
            this._updateVertices();
        },

        setAnchorPoint: function(anchorPoint){
            Node.prototype.setAnchorPoint.call(this, anchorPoint);
            this._updateVertices();
        },

        setVisible: function (visible) {
            if (this._visible == visible)
                return;

            Node.prototype.setVisible.call(this, visible);
            //todo change dirty
            //if(this._isRackShow){
            //    this._rootSkeleton._subDrawBonesDirty = true;
            //    this._rootSkeleton._subDrawBonesOrderDirty = true;
            //}
        },

        _addToChildrenListHelper: function (child) {
            if (child instanceof BoneNode) {
                this._addToBoneList(child);
            } else {
                if (child instanceof SkinNode) {
                    this._addToSkinList(skin);
                }
            }
        },

        _removeFromChildrenListHelper: function (child) {
            if (child instanceof BoneNode) {
                this._removeFromBoneList(child);
                if (child._renderCmd._debug){
                    this._rootSkeleton._subDrawBonesDirty = true;
                    this._rootSkeleton._subDrawBonesOrderDirty = true;
                }
            } else {
                if (child instanceof SkinNode) {
                    this._removeFromSkinList(skin);
                }
            }
        },

        _removeFromBoneList: function (bone) {
            cc.arrayRemoveObject(this._childBones, bone);
            bone._rootSkeleton = null;
            var subBones = bone.getAllSubBones();
            subBones.push(bone);
            for (var subBone, i = 0; i < subBones.length; i++) {
                subBone = subBones[i];
                subBone._rootSkeleton = null;
                cc.arrayRemoveObject(this._rootSkeleton._subBonesMap, subBone.getName());
                //if(bone._isRackShow && bone._visible){
                //    this._rootSkeleton._subDrawBonesDirty = true;
                //    this._rootSkeleton._subDrawBonesOrderDirty = true;
                //}
            }
        },

        _addToBoneList: function (bone) {
            this._childBones.push(bone);
            if (bone._rootSkeleton == null && this._rootSkeleton != null) {
                var subBones = bone.getAllSubBones();
                subBones.push(bone);
                for (var subBone, i = 0; i < subBones.length; i++) {
                    subBone = subBones[i];
                    subBone._rootSkeleton = this._rootSkeleton;
                    var boneName = subBone.getName();
                    if (this._rootSkeleton._subBonesMap[boneName]) {
                        this._rootSkeleton._subBonesMap[subBone.getName()] = subBone;
                        //todo change dirty
                        //if(bone._isRackShow && bone._visible){
                        //    this._rootSkeleton._subDrawBonesDirty = true;
                        //    this._rootSkeleton._subDrawBonesOrderDirty = true;
                        //}
                    }
                    else
                        debug.log("already has a bone named %s in skeleton %s", boneName, this._rootSkeleton.getName());
                }
                if(bone._renderCmd._debug && bone._visible){
                    this._rootSkeleton._subDrawBonesDirty = true;
                    this._rootSkeleton._subDrawBonesOrderDirty = true;
                }
            }
        },

        _addToSkinList: function (skin) {
            this._boneSkins.push(skin);
        },

        _removeFromSkinList: function (skin) {
            cc.arrayRemoveObject(this._boneSkins, skin);
        },

        sortAllChildren: function () {
            Node.prototype.sortAllChildren.call(this);
            this._sortArray(this._childBones);
            this._sortArray(this._boneSkins);
        },

        _sortArray: function (array) {
            if (!array)
                return;
            var len = array.length, i, j, tmp;
            for (i = 1; i < len; i++) {
                tmp = array[i];
                j = i - 1;
                while (j >= 0) {
                    if (tmp._localZOrder < array[j]._localZOrder) {
                        array[j + 1] = array[j];
                    } else if (tmp._localZOrder === array[j]._localZOrder && tmp.arrivalOrder < array[j].arrivalOrder) {
                        array[j + 1] = array[j];
                    } else {
                        break;
                    }
                    j--;
                }
                array[j + 1] = tmp;
            }
        },

        _updateVertices: function () {
            var squareVertices = this._squareVertices,
                  anchorPointInPoints = this._renderCmd._anchorPointInPoints;
            if (this._rackLength != squareVertices[2].x - anchorPointInPoints.x ||
                squareVertices[3].y != this._rackWidth / 2  - anchorPointInPoints.y) {

                squareVertices[0].x = squareVertices[2].x = this._rackLength * .1;
                squareVertices[2].y =  this._rackWidth * .5;
                squareVertices[0].y = -squareVertices[2].y;
                squareVertices[3].x = this._rackLength;

                for(var i=0; i<squareVertices.length; i++){
                    squareVertices[i].x += anchorPointInPoints.x;
                    squareVertices[i].y += anchorPointInPoints.y;
                }

                this._renderCmd.updateDebugPoint(squareVertices);
            }
        },

        _createRenderCmd: function () {
            if (cc._renderType === cc._RENDER_TYPE_CANVAS)
                return new BoneNodeCanvasCmd(this);
            else
                return new BoneNodeWebGLCmd(this);
        }
    });

    BoneNode.create = function (length, color) {
        // null
        // length
        // length, color
        return new ccui.BoneNode(length, color);
    };

    var BoneNodeCanvasCmd = (function () {

        var BoneNodeCanvasCmd = function (node) {
            Node.CanvasRenderCmd.call(this, node);
            this._debug = false;
            this._color = cc.color.WHITE;
            this._drawNode = new cc.DrawNode();
        };

        var proto = BoneNodeCanvasCmd.prototype = Object.create(Node.CanvasRenderCmd.prototype);
        proto.constructor = BoneNodeCanvasCmd;

        proto.visit = function (parentCmd) {
            Node.CanvasRenderCmd.prototype.visit.call(this, parentCmd);
            if (this._node._visible && this._debug) {
                cc.renderer.pushRenderCommand(this._drawNode._renderCmd);
            }

        };
        proto.updateDebugPoint = function (points) {
            this._drawNode.clear();
            this._drawNode.drawPoly(points, this._color, 0, this._color);
        };

        proto.transform = function (parentCmd, recursive) {
            Node.CanvasRenderCmd.prototype.transform.call(this, parentCmd, recursive);
            if (this._debug) {
                this._drawNode._renderCmd.transform(this);
            }
        };

        return BoneNodeCanvasCmd;

    })();

    var BoneNodeWebGLCmd = (function () {

        var BoneNodeWebGLCmd = function (node) {
            Node.WebGLRenderCmd.call(this, node);
            this._debug = false;
            this._color = cc.color.WHITE;
            this._drawNode = new cc.DrawNode();
        };

        var proto = BoneNodeWebGLCmd.prototype = Object.create(Node.WebGLRenderCmd.prototype);
        proto.constructor = BoneNodeWebGLCmd;

        proto.visit = function (parentCmd) {
            Node.WebGLRenderCmd.prototype.visit.call(this, parentCmd);
            if (this._debug) {
                cc.renderer.pushRenderCommand(this._drawNode._renderCmd);
            }

        };
        proto.updateDebugPoint = function (points) {
            this._drawNode.clear();
            this._drawNode.drawPoly(points, this._color, 0, this._color);
        };

        proto.transform = function (parentCmd, recursive) {
            Node.WebGLRenderCmd.prototype.transform.call(this, parentCmd, recursive);
            if (this._debug) {
                this._drawNode._renderCmd.transform(this);
            }
        };

        return BoneNodeWebGLCmd;

    })();

    return BoneNode;

})();