/****************************************************************************
 Copyright (c) 2010-2012 cocos2d-x.org

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

cc.Bone = cc.NodeRGBA.extend({
    _boneData:null,
    _armature:null,
    _childArmature:null,
    _displayManager:null,
    _ignoreMovementBoneData:false,
    _tween:null,
    _tweenData:null,
    _name:"",
    _childrenBone:[],
    _parentBone:null,
    _selfTransformDirty:false,
    _worldTransform:cc.AffineTransformMake(1, 0, 0, 1, 0, 0),
    ctor:function () {
        cc.NodeRGBA.prototype.ctor.call(this);
        this._boneData = null;
        this._armature = null;
        this._childArmature = null;
        this._displayManager = null;
        this._ignoreMovementBoneData = false;
        this._tween = null;
        this._tweenData = null;
        this._name = "";
        this._childrenBone = [];
        this._parentBone = null;
        this._selfTransformDirty = true;
        this._worldTransform = cc.AffineTransformMake(1, 0, 0, 1, 0, 0);
    },
    release:function () {
        CC_SAFE_RELEASE(this._tweenData);
        for (var i = 0; i < this._childrenBone.length; i++) {
            CC_SAFE_RELEASE(this._childrenBone[i]);
        }
        this._childrenBone = [];
        CC_SAFE_RELEASE(this._tween);
        CC_SAFE_RELEASE(this._displayManager);
        CC_SAFE_RELEASE(this._boneData);
        CC_SAFE_RELEASE(this._childArmature);
    },
    init:function (name) {
        cc.NodeRGBA.prototype.init.call(this);
        if (name) {
            this._name = name;
        }
        this._tweenData = new cc.FrameData();
        this._tween = new cc.Tween();
        this._tween.init(this);
        this._displayManager = new cc.DisplayManager();
        this._displayManager.init(this);
        return true;
    },
    setBoneData:function (boneData) {
        if (!boneData) {
            cc.log("boneData must not be null");
            return;
        }
        this._boneData = boneData;
        this._name = this._boneData.name;
        this._zOrder = this._boneData.zOrder;
        this._displayManager.initDisplayList(boneData);
    },
    getBoneData:function () {
        return this._boneData;
    },
    setArmature:function (armature) {
        this._armature = armature;
        this._tween.setAnimation(this._armature.getAnimation());
    },
    getArmature:function () {
        return this._armature;
    },
    update:function (dt) {
        if (this._parentBone) {
            this._selfTransformDirty = this._selfTransformDirty || this._parentBone.isTransformDirty();
        }
        if (this._selfTransformDirty) {
            var cosX = Math.cos(this._tweenData.skewX);
            var sinX = Math.sin(this._tweenData.skewX);
            var cosY = Math.cos(this._tweenData.skewY);
            var sinY = Math.sin(this._tweenData.skewY);

            this._worldTransform.a = this._tweenData.scaleX * cosY;
            this._worldTransform.b = this._tweenData.scaleX * sinY;
            this._worldTransform.c = this._tweenData.scaleY * sinX;
            this._worldTransform.d = this._tweenData.scaleY * cosX;
            this._worldTransform.tx = this._tweenData.x;
            this._worldTransform.ty = this._tweenData.y;

            this._worldTransform = cc.AffineTransformConcat(this.nodeToParentTransform(), this._worldTransform);

            if (this._parentBone) {
                this._worldTransform = cc.AffineTransformConcat(this._worldTransform, this._parentBone._worldTransform);
            }
        }
        cc.DisplayFactory.updateDisplay(this, this._displayManager.getCurrentDecorativeDisplay(), dt, this._selfTransformDirty);
        for (var i = 0; i < this._childrenBone.length; i++) {
            this._childrenBone[i].update(dt);
        }

        this._selfTransformDirty = false;
    },
    old_NumberOfDraws:0,
    visit:function () {
        this.old_NumberOfDraws = cc.g_NumberOfDraws++;
        var node = this.getDisplayManager().getDisplayRenderNode();
        if (node) {
            node.visit(ctx);
        }
        cc.g_NumberOfDraws = this.old_NumberOfDraws;
    },
    updateDisplayedColor:function (parentColor) {
        cc.NodeRGBA.prototype.updateDisplayedColor.call(this, parentColor);
        this.updateColor();
    },
    updateDisplayedOpacity:function (parentOpacity) {
        cc.NodeRGBA.prototype.updateDisplayedOpacity.call(this, parentOpacity);
        this.updateColor();
    },
    updateColor:function () {
        var display = this._displayManager.getDisplayRenderNode();
        if (display) {
            display.setColor(cc.c3b(this._displayedColor.r * this._tweenData.r / 255, this._displayedColor.g * this._tweenData.g / 255, this._displayedColor.b * this._tweenData.b / 255));
            display.setOpacity(this._displayedOpacity * this._tweenData.a / 255);
        }
    },
    addChildBone:function (child) {
        if (!child) {
            cc.log("Argument must be non-nil");
            return;
        }
        if (child._parentBone) {
            cc.log("child already added. It can't be added again");
            return;
        }
        if (!this._childrenBone) {
            this.childrenAlloc();
        }
        if (cc.ArrayGetIndexOfObject(this._childrenBone, child) < 0) {
            this._childrenBone.push(child);
            child.setParentBone(this);
        }
    },

    removeChildBone:function (bone, recursion) {
        for (var i = 0; i < this._childrenBone.length; i++) {
            if (this._childrenBone[i] == bone) {
                if (recursion) {
                    var ccbones = bone._childrenBone;
                    for (var j = 0; j < ccbones.length; j++) {
                        bone.removeChildBone(ccbones[j], recursion);
                    }
                }
                bone.setParentBone(null);
                bone.getDisplayManager().setCurrentDecorativeDisplay(null);
                cc.ArrayRemoveObject(this._childrenBone, bone);
            }
        }
    },
    removeFromParent:function (recursion) {
        if (this._parentBone) {
            this._parentBone.removeChildBone(this, recursion);
        }
    },
    setParentBone:function (parent) {
        this._parentBone = parent;
    },
    getParentBone:function () {
        return this._parentBone;
    },
    childrenAlloc:function () {
        this._childrenBone = [];
    },
    setChildArmature:function (armature) {
        if (this._childArmature != armature) {
            this._childArmature = armature;
        }
    },
    getChildArmature:function () {
        return this._childArmature;
    },

    getChildrenBone:function () {
        return this._childrenBone;
    },

    getTween:function () {
        return this._tween;
    },

    setZOrder:function (zOrder) {
        if (this._zOrder != zOrder)
            cc.Node.prototype.setZOrder.call(this, zOrder);
    },

    setTransformDirty:function (dirty) {
        this._selfTransformDirty = dirty;
    },

    isTransformDirty:function () {
        return this._selfTransformDirty;
    },

    nodeToArmatureTransform:function () {
        return this._worldTransform;
    },

    addDisplay:function (displayData, index) {
        this._displayManager.addDisplay(displayData, index);
    },

    changeDisplayByIndex:function (index, force) {
        this._displayManager.changeDisplayByIndex(index, force);
    },
    setDisplayManager:function (displayManager) {
        this._displayManager = displayManager;
    },
    getDisplayManager:function () {
        return this._displayManager;
    },
    setIgnoreMovementBoneData:function (bool) {
        this._ignoreMovementBoneData = bool;
    },
    getIgnoreMovementBoneData:function () {
        return this._ignoreMovementBoneData;
    },
    getTweenData:function () {
        return this._tweenData;
    },
    setName:function (name) {
        this._name = name;
    },
    getName:function () {
        return this._name;
    }
});
cc.Bone.create = function (name) {
    var bone = new cc.Bone();
    if (bone && bone.init(name)) {
        return bone;
    }
    return null;
};