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

/**
 * Base class for cc.Bone objects.
 * @class
 * @extends cc.NodeRGBA
 */
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

    /**
     * release objects
     */
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

    /**
     * Initializes a CCBone with the specified name
     * @param {String} name
     * @return {Boolean}
     */
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

    /**
     * set the boneData
     * @param {cc.BoneData} boneData
     */
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

    /**
     * boneData getter
     * @return {cc.BoneData}
     */
    getBoneData:function () {
        return this._boneData;
    },

    /**
     * set the armature
     * @param {cc.Armature} armature
     */
    setArmature:function (armature) {
        this._armature = armature;
        this._tween.setAnimation(this._armature.getAnimation());
    },

    /**
     * armature getter
     * @return {cc.Armature}
     */
    getArmature:function () {
        return this._armature;
    },

    /**
     * update worldTransform
     * @param dt
     */
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
    /**
     * Rewrite visit ,when node draw, g_NumberOfDraws is changeless
     */
    visit:function () {
        this.old_NumberOfDraws = cc.g_NumberOfDraws++;
        var node = this.getDisplayManager().getDisplayRenderNode();
        if (node) {
            node.visit(ctx);
        }
        cc.g_NumberOfDraws = this.old_NumberOfDraws;
    },

    /**
     * update display color
     * @param {cc.c3b} color
     */
    updateDisplayedColor:function (color) {
        cc.NodeRGBA.prototype.updateDisplayedColor.call(this, color);
        this.updateColor();
    },

    /**
     * update display opacity
     * @param {Number} opacity
     */
    updateDisplayedOpacity:function (opacity) {
        cc.NodeRGBA.prototype.updateDisplayedOpacity.call(this, opacity);
        this.updateColor();
    },

    /**
     * update display color
     */
    updateColor:function () {
        var display = this._displayManager.getDisplayRenderNode();
        if (display) {
            display.setColor(cc.c3b(this._displayedColor.r * this._tweenData.r / 255, this._displayedColor.g * this._tweenData.g / 255, this._displayedColor.b * this._tweenData.b / 255));
            display.setOpacity(this._displayedOpacity * this._tweenData.a / 255);
        }
    },

    /**
     * Add a child to this bone, and it will let this child call setParent(cc.Bone) function to set self to it's parent
     * @param {cc.Bone} child
     */
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

    /**
     * Removes a child bone
     * @param {cc.Bone} bone
     * @param {Boolean} recursion
     */
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

    /**
     * Remove itself from its parent CCBone.
     * @param {Boolean} recursion
     */
    removeFromParent:function (recursion) {
        if (this._parentBone) {
            this._parentBone.removeChildBone(this, recursion);
        }
    },

    /**
     * Set parent bone.
     * If _parent is NUll, then also remove this bone from armature.
     * It will not set the CCArmature, if you want to add the bone to a CCArmature, you should use cc.Armature.addBone(bone, parentName).
     * @param {cc.Bone}  parent  the parent bone.
     */
    setParentBone:function (parent) {
        this._parentBone = parent;
    },

    /**
     * parent bone getter
     * @return {cc.Bone}
     */
    getParentBone:function () {
        return this._parentBone;
    },

    childrenAlloc:function () {
        this._childrenBone = [];
    },

    /**
     * child armature setter
     * @param {cc.Armature} armature
     */
    setChildArmature:function (armature) {
        if (this._childArmature != armature) {
            this._childArmature = armature;
        }
    },

    /**
     * child armature getter
     * @return {cc.Armature}
     */
    getChildArmature:function () {
        return this._childArmature;
    },

    /**
     * child bone getter
     * @return {Array}
     */
    getChildrenBone:function () {
        return this._childrenBone;
    },

    /**
     * tween getter
     * @return {cc.Tween}
     */
    getTween:function () {
        return this._tween;
    },

    /**
     * zOrder setter
     * @param {Number}
        */
    setZOrder:function (zOrder) {
        if (this._zOrder != zOrder)
            cc.Node.prototype.setZOrder.call(this, zOrder);
    },

    /**
     * transform dirty setter
     * @param {Boolean}
        */
    setTransformDirty:function (dirty) {
        this._selfTransformDirty = dirty;
    },

    /**
     * transform dirty getter
     * @return {Boolean}
     */
    isTransformDirty:function () {
        return this._selfTransformDirty;
    },

    /**
     * return world transform
     * @return {{a:0.b:0,c:0,d:0,tx:0,ty:0}}
     */
    nodeToArmatureTransform:function () {
        return this._worldTransform;
    },

    /**
     * Add display and use  _displayData init the display.
     * If index already have a display, then replace it.
     * If index is current display index, then also change display to _index
     * @param {cc.Display} displayData it include the display information, like DisplayType.
     *          If you want to create a sprite display, then create a CCSpriteDisplayData param
     *@param {Number}    index the index of the display you want to replace or add to
     *          -1 : append display from back
     */
    addDisplay:function (displayData, index) {
        this._displayManager.addDisplay(displayData, index);
    },

    /**
     * change display by index
     * @param {Number} index
     * @param {Boolean} force
     */
    changeDisplayByIndex:function (index, force) {
        this._displayManager.changeDisplayByIndex(index, force);
    },

    /**
     * displayManager setter
     * @param {cc.DisplayManager}
        */
    setDisplayManager:function (displayManager) {
        this._displayManager = displayManager;
    },

    /**
     * displayManager dirty getter
     * @return {cc.DisplayManager}
     */
    getDisplayManager:function () {
        return this._displayManager;
    },

    /**
     *    When CCArmature play a animation, if there is not a CCMovementBoneData of this bone in this CCMovementData, this bone will hide.
     *    Set IgnoreMovementBoneData to true, then this bone will also show.
     * @param {Boolean} bool
     */
    setIgnoreMovementBoneData:function (bool) {
        this._ignoreMovementBoneData = bool;
    },

    /**
     * ignoreMovementBoneData  getter
     * @return {Boolean}
     */
    getIgnoreMovementBoneData:function () {
        return this._ignoreMovementBoneData;
    },

    /**
     * tweenData  getter
     * @return {cc.FrameData}
     */
    getTweenData:function () {
        return this._tweenData;
    },

    /**
     * name  setter
     * @param {String} name
     */
    setName:function (name) {
        this._name = name;
    },

    /**
     * name  getter
     * @return {String}
     */
    getName:function () {
        return this._name;
    }
});

/**
 * allocates and initializes a bone.
 * @constructs
 * @return {cc.Bone}
 * @example
 * // example
 * var bone = cc.Bone.create();
 */
cc.Bone.create = function (name) {
    var bone = new cc.Bone();
    if (bone && bone.init(name)) {
        return bone;
    }
    return null;
};