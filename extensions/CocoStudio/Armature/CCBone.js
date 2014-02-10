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
 * Base class for ccs.Bone objects.
 * @class
 * @extends ccs.NodeRGBA
 */
ccs.Bone = ccs.NodeRGBA.extend(/** @lends ccs.Bone# */{
    _boneData:null,
    _armature:null,
    _childArmature:null,
    _displayManager:null,
    _ignoreMovementBoneData:false,
    _tween:null,
    _tweenData:null,
    _name:"",
    _childrenBone:null,
    _parentBone:null,
    _boneTransformDirty:false,
    _worldTransform:null,
    _blendFunc:0,
    _blendDirty:false,
    _worldInfo:null,
    _armatureParentBone:null,
    _dataVersion:0,
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
        this._boneTransformDirty = true;
        this._worldTransform = cc.AffineTransformMake(1, 0, 0, 1, 0, 0);
        this._blendFunc = new cc.BlendFunc(cc.BLEND_SRC, cc.BLEND_DST);
        this._blendDirty = false;
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
        this._tweenData = new ccs.FrameData();
        this._tween = new ccs.Tween();
        this._tween.init(this);
        this._displayManager = new ccs.DisplayManager();
        this._displayManager.init(this);
        this._worldInfo = new ccs.BaseData();
        this._boneData = new ccs.BaseData();
        return true;
    },

    /**
     * set the boneData
     * @param {ccs.BoneData} boneData
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
     * @return {ccs.BoneData}
     */
    getBoneData:function () {
        return this._boneData;
    },

    /**
     * set the armature
     * @param {ccs.Armature} armature
     */
    setArmature:function (armature) {
        this._armature = armature;
        if(armature){
            this._tween.setAnimation(this._armature.getAnimation());
            this._dataVersion = this._armature.getArmatureData().dataVersion;
            this._armatureParentBone = this._armature.getParentBone();
        }else{
            this._armatureParentBone = null;
        }
    },

    /**
     * armature getter
     * @return {ccs.Armature}
     */
    getArmature:function () {
        return this._armature;
    },

    /**
     * update worldTransform
     * @param dt
     */
    update:function (dt) {
        var locParentBone = this._parentBone;
        var locArmature = this._armature;
        var locTweenData = this._tweenData;
        var locWorldTransform = this._worldTransform;
        var locWorldInfo = this._worldInfo;
        var locArmatureParentBone = this._armatureParentBone;

        if (locParentBone) {
            this._boneTransformDirty = this._boneTransformDirty || locParentBone.isTransformDirty();
        }
        if (locArmatureParentBone && !this._boneTransformDirty){
            this._boneTransformDirty = locArmatureParentBone.isTransformDirty();
        }
        if (this._boneTransformDirty) {
            if (this._dataVersion >= ccs.CONST_VERSION_COMBINED) {
                var locBoneData = this._boneData;
                locTweenData.x += locBoneData.x;
                locTweenData.y += locBoneData.y;
                locTweenData.skewX += locBoneData.skewX;
                locTweenData.skewY += locBoneData.skewY;
                locTweenData.scaleX += locBoneData.scaleX;
                locTweenData.scaleY += locBoneData.scaleY;

                locTweenData.scaleX -= 1;
                locTweenData.scaleY -= 1;
            }

            locWorldInfo.x = locTweenData.x + this._position._x;
            locWorldInfo.y = locTweenData.y + this._position._y;
            locWorldInfo.scaleX = locTweenData.scaleX * this._scaleX;
            locWorldInfo.scaleY = locTweenData.scaleY * this._scaleY;
            locWorldInfo.skewX = locTweenData.skewX + this._skewX + this._rotationX;
            locWorldInfo.skewY = locTweenData.skewY + this._skewY - this._rotationY;

            if (this._parentBone) {
                this.applyParentTransform(this._parentBone);
            }
            else {
                if (locArmatureParentBone) {
                    this.applyParentTransform(locArmatureParentBone);
                }
            }

            ccs.TransformHelp.nodeToMatrix(locWorldInfo, locWorldTransform);

            if (locArmatureParentBone) {
                this._worldTransform = cc.AffineTransformConcat(locWorldTransform, locArmature.nodeToParentTransform());
            }
        }
        ccs.DisplayFactory.updateDisplay(this, dt, this._boneTransformDirty || locArmature.getArmatureTransformDirty());

        var locChildrenBone = this._childrenBone;
        for (var i = 0; i < locChildrenBone.length; i++) {
            locChildrenBone[i].update(dt);
        }
        this._boneTransformDirty = false;
    },

    applyParentTransform: function (parent) {
        var locWorldInfo = this._worldInfo;
        var locParentWorldTransform = parent._worldTransform;
        var locParentWorldInfo = parent._worldInfo;
        var x = locWorldInfo.x;
        var y = locWorldInfo.y;
        locWorldInfo.x = x * locParentWorldTransform.a + y * locParentWorldTransform.c + locParentWorldInfo.x;
        locWorldInfo.y = x * locParentWorldTransform.b + y * locParentWorldTransform.d + locParentWorldInfo.y;
        locWorldInfo.scaleX = locWorldInfo.scaleX * locParentWorldInfo.scaleX;
        locWorldInfo.scaleY = locWorldInfo.scaleY * locParentWorldInfo.scaleY;
        locWorldInfo.skewX = locWorldInfo.skewX + locParentWorldInfo.skewX;
        locWorldInfo.skewY = locWorldInfo.skewY + locParentWorldInfo.skewY;
    },

    /**
     * Rewrite visit ,when node draw, g_NumberOfDraws is changeless
     */
    visit:function (ctx) {
        var node = this.getDisplayManager().getDisplayRenderNode();
        if (node) {
            node.visit(ctx);
        }
    },

    /**
     * update display color
     * @param {cc.c3b} color
     */
    updateDisplayedColor:function (color) {
        this._realColor = cc.c3b(255,255,255);
        cc.NodeRGBA.prototype.updateDisplayedColor.call(this, color);
        this.updateColor();
    },

    /**
     * update display opacity
     * @param {Number} opacity
     */
    updateDisplayedOpacity:function (opacity) {
        this._realOpacity = 255;
        cc.NodeRGBA.prototype.updateDisplayedOpacity.call(this, opacity);
        this.updateColor();
    },

    /**
     * set display color
     * @param {cc.c3b} color
     */
    setColor: function (color) {
        cc.NodeRGBA.prototype.setColor.call(this, color);
        this.updateColor();
    },

    /**
     * set display opacity
     * @param {Number} opacity  0-255
     */
    setOpacity: function (opacity) {
        cc.NodeRGBA.prototype.setOpacity.call(this, opacity);
        this.updateColor();
    },

    /**
     * update display color
     */
    updateColor:function () {
        var display = this._displayManager.getDisplayRenderNode();
        if (display && display.RGBAProtocol) {
            var locDisplayedColor = this._displayedColor;
            var locTweenData = this._tweenData;
            var locOpacity = this._displayedOpacity * locTweenData.a / 255;
            var locColor = cc.c3b(locDisplayedColor.r * locTweenData.r / 255, locDisplayedColor.g * locTweenData.g / 255, locDisplayedColor.b * locTweenData.b / 255);
            display.setOpacity(locOpacity);
            display.setColor(locColor);
        }
    },

    /**
     * update display zOrder
     */
    updateZOrder: function () {
        if (this._armature.getArmatureData().dataVersion >= ccs.CONST_VERSION_COMBINED) {
            var zorder = this._tweenData.zOrder + this._boneData.zOrder;
            this.setZOrder(zorder);
        }
        else {
            this.setZOrder(this._tweenData.zOrder);
        }
    },

    /**
     * Add a child to this bone, and it will let this child call setParent(ccs.Bone) function to set self to it's parent
     * @param {ccs.Bone} child
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
        if (cc.ArrayGetIndexOfObject(this._childrenBone, child) < 0) {
            this._childrenBone.push(child);
            child.setParentBone(this);
        }
    },

    /**
     * Removes a child bone
     * @param {ccs.Bone} bone
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
     * It will not set the CCArmature, if you want to add the bone to a CCArmature, you should use ccs.Armature.addBone(bone, parentName).
     * @param {ccs.Bone}  parent  the parent bone.
     */
    setParentBone:function (parent) {
        this._parentBone = parent;
    },

    /**
     * parent bone getter
     * @return {ccs.Bone}
     */
    getParentBone:function () {
        return this._parentBone;
    },

    /**
     * child armature setter
     * @param {ccs.Armature} armature
     */
    setChildArmature:function (armature) {
        if (this._childArmature != armature) {
            if (armature == null && this._childArmature)            {
                this._childArmature.setParentBone(null);
            }
            this._childArmature = armature;
        }
    },

    /**
     * child armature getter
     * @return {ccs.Armature}
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
     * @return {ccs.Tween}
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
        this._boneTransformDirty = dirty;
    },

    /**
     * transform dirty getter
     * @return {Boolean}
     */
    isTransformDirty:function () {
        return this._boneTransformDirty;
    },

    /**
     * return world transform
     * @return {{a:0.b:0,c:0,d:0,tx:0,ty:0}}
     */
    nodeToArmatureTransform:function () {
        return this._worldTransform;
    },

    /**
     * Returns the world affine transform matrix. The matrix is in Pixels.
     * @returns {cc.AffineTransform}
     */
    nodeToWorldTransform: function () {
        return cc.AffineTransformConcat(this._worldTransform, this._armature.nodeToWorldTransform());
    },

    /**
     * get render node
     * @returns {cc.Node}
     */
    getDisplayRenderNode: function () {
        return this._displayManager.getDisplayRenderNode();
    },

    /**
     * get render node type
     * @returns {Number}
     */
    getDisplayRenderNodeType: function () {
        return this._displayManager.getDisplayRenderNodeType();
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
        index = index || 0;
        return this._displayManager.addDisplay(displayData, index);
    },

    /**
     * remove display
     * @param {Number} index
     */
    removeDisplay: function (index) {
        this._displayManager.removeDisplay(index);
    },

    addSkin:function (skin, index) {
        index = index||0;
        return this._displayManager.addSkin(skin, index);
    },

    /**
     * change display by index
     * @param {Number} index
     * @param {Boolean} force
     */
    changeDisplayByIndex:function (index, force) {
        cc.log("changeDisplayByIndex is deprecated. Use changeDisplayWithIndex instead.");
        this.changeDisplayWithIndex(index, force);
    },

    /**
     * change display with index
     * @param {Number} index
     * @param {Boolean} force
     */
    changeDisplayWithIndex:function (index, force) {
        this._displayManager.changeDisplayWithIndex(index, force);
    },

    /**
     * change display with name
     * @param {String} name
     * @param {Boolean} force
     */
    changeDisplayWithName:function (name, force) {
        this._displayManager.changeDisplayWithName(name, force);
    },

    /**
     * get the collider body list in this bone.
     * @returns {*}
     */
    getColliderBodyList: function () {
        var decoDisplay = this._displayManager.getCurrentDecorativeDisplay()
        if (decoDisplay) {
            var detector = decoDisplay.getColliderDetector()
            if (detector) {
                return detector.getColliderBodyList();
            }
        }
        return [];
    },

    /**
     * collider filter setter
     * @param {cc.ColliderFilter} filter
     */
    setColliderFilter: function (filter) {
        var displayList = this._displayManager.getDecorativeDisplayList();
        for (var i = 0; i < displayList.length; i++) {
            var locDecoDisplay = displayList[i];
            var locDetector = locDecoDisplay.getColliderDetector();
            if (locDetector) {
                locDetector.setColliderFilter(filter);
            }
        }

    },

    /**
     * collider filter getter
     * @returns {cc.ColliderFilter}
     */
    getColliderFilter: function () {
        var decoDisplay = this._displayManager.getCurrentDecorativeDisplay();
        if (decoDisplay) {
            var detector = decoDisplay.getColliderDetector();
            if (detector) {
                return detector.getColliderFilter();
            }
        }
        return null;
    },

    /**
     * displayManager setter
     * @param {ccs.DisplayManager}
        */
    setDisplayManager:function (displayManager) {
        this._displayManager = displayManager;
    },

    /**
     * displayManager dirty getter
     * @return {ccs.DisplayManager}
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
     * @return {ccs.FrameData}
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
    },

    /**
     * BlendFunc  setter
     * @param {cc.BlendFunc} blendFunc
     */
    setBlendFunc:function (blendFunc) {
        if (this._blendFunc.src != blendFunc.src || this._blendFunc.dst != blendFunc.dst)        {
            this._blendFunc = blendFunc;
            this._blendDirty = true;
        }
    },

    /**
     * blendType  getter
     * @return {cc.BlendFunc}
     */
    getBlendFunc:function () {
        return this._blendFunc;
    },

    setBlendDirty:function(dirty){
        this._blendDirty = dirty;
    },

    isBlendDirty:function(){
        return this._blendDirty;
    }
});

/**
 * allocates and initializes a bone.
 * @constructs
 * @return {ccs.Bone}
 * @example
 * // example
 * var bone = ccs.Bone.create();
 */
ccs.Bone.create = function (name) {
    var bone = new ccs.Bone();
    if (bone && bone.init(name)) {
        return bone;
    }
    return null;
};