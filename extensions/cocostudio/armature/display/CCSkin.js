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
 * Base class for ccs.Skin
 * @class
 * @extends ccs.Sprite
 *
 * @property {Object}   skinData    - The data of the skin
 * @property {ccs.Bone} bone        - The bone of the skin
 * @property {String}   displayName - <@readonly> The displayed name of skin
 *
 */
ccs.Skin = ccs.Sprite.extend(/** @lends ccs.Skin# */{
    _skinData:null,
    bone:null,
    _skinTransform:null,
    _displayName:"",
    _armature:null,
    _className:"Skin",
    ctor:function () {
        cc.Sprite.prototype.ctor.call(this);
        this._skinData = null;
        this.bone = null;
        this._displayName = "";
        this._skinTransform = cc.AffineTransformIdentity();
        this._armature = null;
    },
    initWithSpriteFrameName:function(spriteFrameName){
        var ret = cc.Sprite.prototype.initWithSpriteFrameName.call(this,spriteFrameName);
        this._displayName = spriteFrameName;
        return ret;
    },
    initWithFile:function(fileName){
        var ret = cc.Sprite.prototype.initWithFile.call(this,fileName);
        this._displayName = fileName;
        return ret;
    },
    setSkinData:function (skinData) {
        this._skinData = skinData;

        this.setScaleX(skinData.scaleX);
        this.setScaleY(skinData.scaleY);
        this.setRotationX(cc.RADIANS_TO_DEGREES(skinData.skewX));
        this.setRotationY(cc.RADIANS_TO_DEGREES(-skinData.skewY));
        this.setPosition(skinData.x, skinData.y);

        var localTransform = this.nodeToParentTransform();
        var skinTransform = this._skinTransform;
        skinTransform.a = localTransform.a;
        skinTransform.b = localTransform.b;
        skinTransform.c = localTransform.c;
        skinTransform.d = localTransform.d;
        skinTransform.tx = localTransform.tx;
        skinTransform.ty = localTransform.ty;
        this.updateArmatureTransform();
    },

    getSkinData:function () {
        return this._skinData;
    },

    setBone:function (bone) {
        this.bone = bone;
    },

    getBone:function () {
        return this.bone;
    },

    updateArmatureTransform:function () {
        this._transform = cc.AffineTransformConcat(this._skinTransform, this.bone.nodeToArmatureTransform());
        var locTransform = this._transform;
        var locArmature = this._armature;
        if (locArmature && locArmature.getBatchNode()) {
            this._transform = cc.AffineTransformConcat(locTransform, locArmature.nodeToParentTransform());
        }
        if (cc._renderType === cc._RENDER_TYPE_CANVAS) {
            locTransform = this._transform
            locTransform.b *= -1;
            locTransform.c *= -1;
            var tempB = locTransform.b;
            locTransform.b = locTransform.c;
            locTransform.c = tempB;
        }
    },
    /** returns a "local" axis aligned bounding box of the node. <br/>
     * The returned box is relative only to its parent.
     * @return {cc.Rect}
     */
    getBoundingBox:function () {
        var rect = cc.rect(0, 0, this._contentSize.width, this._contentSize.height);
        var transForm = this.nodeToParentTransform();
        return cc.RectApplyAffineTransform(rect, transForm);
    },

    /**
     * display name getter
     * @returns {String}
     */
    getDisplayName:function(){
        return this._displayName;
    },

    nodeToWorldTransform: function () {
        return cc.AffineTransformConcat(this._transform, this.bone.getArmature().nodeToWorldTransform());
    },


    nodeToWorldTransformAR: function () {
        var displayTransform = this._transform;
        var anchorPoint = this._anchorPointInPoints;

        anchorPoint = cc.PointApplyAffineTransform(anchorPoint, displayTransform);
        displayTransform.tx = anchorPoint.x;
        displayTransform.ty = anchorPoint.y;

        return cc.AffineTransformConcat(displayTransform, this.bone.getArmature().nodeToWorldTransform());
    }
});
ccs.Skin.prototype.nodeToParentTransform = cc.Node.prototype._nodeToParentTransformForWebGL;

window._p = ccs.Skin.prototype;

// Extended properties
/** @expose */
_p.skinData;
cc.defineGetterSetter(_p, "skinData", _p.getSkinData, _p.setSkinData);
/** @expose */
_p.displayName;
cc.defineGetterSetter(_p, "displayName", _p.getDisplayName);

delete window._p;

/**
 * allocates and initializes a skin.
 * @param {String} fileName
 * @param {cc.Rect} rect
 * @returns {ccs.Skin}
 * @example
 * // example
 * var skin = ccs.Skin.create("res/test.png",cc.rect(0,0,50,50));
 */
ccs.Skin.create = function (fileName, rect) {
    var argnum = arguments.length;
    var sprite = new ccs.Skin();
    if (argnum === 0) {
        if (sprite.init())
            return sprite;
    } else {
        if (sprite && sprite.initWithFile(fileName, rect))
            return sprite;
    }
    return null;
};

/**
 * allocates and initializes a skin.
 * @param {String} pszSpriteFrameName
 * @returns {ccs.Skin}
 * @example
 * // example
 * var skin = ccs.Skin.createWithSpriteFrameName("test.png");
 */
ccs.Skin.createWithSpriteFrameName = function (pszSpriteFrameName) {
    var skin = new ccs.Skin();
    if (skin && skin.initWithSpriteFrameName(pszSpriteFrameName)) {
        return skin;
    }
    return null;
};
