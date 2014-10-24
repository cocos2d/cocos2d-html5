/****************************************************************************
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

/**
 * ccs.Bone uses ccs.Skin to displays on screen.
 * @class
 * @extends ccs.Sprite
 *
 * @param {String} [fileName]
 * @param {cc.Rect} [rect]
 *
 * @property {Object}   skinData    - The data of the skin
 * @property {ccs.Bone} bone        - The bone of the skin
 * @property {String}   displayName - <@readonly> The displayed name of skin
 *
 */
ccs.Skin = ccs.Sprite.extend(/** @lends ccs.Skin# */{
    _skinData: null,
    bone: null,
    _skinTransform: null,
    _displayName: "",
    _armature: null,
    _className: "Skin",

    ctor: function (fileName, rect) {
        cc.Sprite.prototype.ctor.call(this);
        this._skinData = null;
        this.bone = null;
        this._displayName = "";
        this._skinTransform = cc.affineTransformIdentity();
        this._armature = null;

        if (fileName == null || fileName == "") {
            ccs.Skin.prototype.init.call(this);
        } else {
            if(fileName[0] == "#"){
                ccs.Skin.prototype.initWithSpriteFrameName.call(this, fileName.substr(1));
            } else {
                ccs.Skin.prototype.initWithFile.call(this, fileName, rect);
            }
        }
    },

    /**
     * Initializes with sprite frame name
     * @param {String} spriteFrameName
     * @returns {Boolean}
     */
    initWithSpriteFrameName: function (spriteFrameName) {
        if(spriteFrameName == "")
            return false;
        var pFrame = cc.spriteFrameCache.getSpriteFrame(spriteFrameName);
        var ret = true;
        if(pFrame)
            this.initWithSpriteFrame(pFrame);
        else{
            cc.log("Can't find CCSpriteFrame with %s. Please check your .plist file", spriteFrameName);
            ret = false;
        }
        this._displayName = spriteFrameName;
        return ret;
    },

    /**
     * Initializes with texture file name.
     * @param {String} fileName
     * @param {cc.Rect} rect
     * @returns {Boolean}
     */
    initWithFile: function (fileName, rect) {
        var ret = rect ? cc.Sprite.prototype.initWithFile.call(this, fileName, rect)
                       : cc.Sprite.prototype.initWithFile.call(this, fileName);
        this._displayName = fileName;
        return ret;
    },

    /**
     * Sets skin data to ccs.Skin.
     * @param {ccs.BaseData} skinData
     */
    setSkinData: function (skinData) {
        this._skinData = skinData;
        this.setScaleX(skinData.scaleX);
        this.setScaleY(skinData.scaleY);
        this.setRotationX(cc.radiansToDegrees(skinData.skewX));
        this.setRotationY(cc.radiansToDegrees(-skinData.skewY));
        this.setPosition(skinData.x, skinData.y);

        var localTransform = this.getNodeToParentTransform ? this.getNodeToParentTransform() : this.nodeToParentTransform();
        var skinTransform = this._skinTransform;
        skinTransform.a = localTransform.a;
        skinTransform.b = localTransform.b;
        skinTransform.c = localTransform.c;
        skinTransform.d = localTransform.d;
        skinTransform.tx = localTransform.tx;
        skinTransform.ty = localTransform.ty;
        this.updateArmatureTransform();
    },

    /**
     * Returns skin date of ccs.Skin.
     * @returns {ccs.BaseData}
     */
    getSkinData: function () {
        return this._skinData;
    },

    /**
     * Updates armature skin's transform with skin transform and bone's transform.
     */
    updateArmatureTransform: function () {
        this._transform = cc.affineTransformConcat(
            this._skinTransform,
            this.bone.getNodeToArmatureTransform()
        );
    },

    _updateTransformForWebGL: function(){
        var locQuad = this._quad;
        // If it is not visible, or one of its ancestors is not visible, then do nothing:
        if( !this._visible)
            locQuad.br.vertices = locQuad.tl.vertices = locQuad.tr.vertices = locQuad.bl.vertices = {x: 0, y:0, z:0};
        else {
            //
            // calculate the Quad based on the Affine Matrix
            //
            var transform = this.getNodeToParentTransform ? this.getNodeToParentTransform() : this.nodeToParentTransform();
            var size = this._rect;

            var x1 = this._offsetPosition.x, y1 = this._offsetPosition.y;

            var x2 = x1 + size.width, y2 = y1 + size.height;
            var x = transform.tx, y = transform.ty;

            var cr = transform.a, sr = transform.b;
            var cr2 = transform.d, sr2 = -transform.c;
            var ax = x1 * cr - y1 * sr2 + x;
            var ay = x1 * sr + y1 * cr2 + y;

            var bx = x2 * cr - y1 * sr2 + x;
            var by = x2 * sr + y1 * cr2 + y;

            var cx = x2 * cr - y2 * sr2 + x;
            var cy = x2 * sr + y2 * cr2 + y;

            var dx = x1 * cr - y2 * sr2 + x;
            var dy = x1 * sr + y2 * cr2 + y;

            var locVertexZ = this._vertexZ;
            if(!cc.SPRITEBATCHNODE_RENDER_SUBPIXEL) {
                ax = 0 | ax;
                ay = 0 | ay;
                bx = 0 | bx;
                by = 0 | by;
                cx = 0 | cx;
                cy = 0 | cy;
                dx = 0 | dx;
                dy = 0 | dy;
            }
            this.SET_VERTEX3F(locQuad.bl.vertices,ax, ay,locVertexZ);
            this.SET_VERTEX3F(locQuad.br.vertices,bx, by,locVertexZ);
            this.SET_VERTEX3F(locQuad.tl.vertices,dx, dy,locVertexZ);
            this.SET_VERTEX3F(locQuad.tr.vertices,cx, cy,locVertexZ);
        }

        // MARMALADE CHANGE: ADDED CHECK FOR nullptr, TO PERMIT SPRITES WITH NO BATCH NODE / TEXTURE ATLAS
        if (this._textureAtlas)
            this._textureAtlas.updateQuad(locQuad, this._textureAtlas.getTotalQuads());
        this._quadDirty = true;
    },

    SET_VERTEX3F: function(_v_, _x_, _y_, _z_){
        (_v_).x = (_x_);
        (_v_).y = (_y_);
        (_v_).z = (_z_);
    },

    RENDER_IN_SUBPIXEL: function(__ARGS__){
        if(!cc.SPRITEBATCHNODE_RENDER_SUBPIXEL)
            return Math.ceil(__ARGS__);
        else
            return __ARGS__;
    },

    /**
     * Returns skin's world transform.
     * @returns {cc.AffineTransform}
     */
    getNodeToWorldTransform: function(){
        return cc.affineTransformConcat(this._transform,this.bone.getArmature().getNodeToWorldTransform());
    },

    getNodeToWorldTransformAR: function(){
        var displayTransform = this._transform;
        this._anchorPointInPoints = cc.pointApplyAffineTransform(this._anchorPointInPoints, displayTransform);
        displayTransform.tx = this._anchorPointInPoints.x;
        displayTransform.ty = this._anchorPointInPoints.y;
        return cc.affineTransformConcat( displayTransform,this.bone.getArmature().nodeToWorldTransform());
    },

    /**
     * Sets the bone reference to ccs.Skin.
     * @param bone
     */
    setBone: function (bone) {
        this.bone = bone;
        var armature = this.bone.getArmature();
        if(armature)
            this._armature = armature;
    },

    /**
     * Returns the bone reference of ccs.Skin.
     * @returns {null}
     */
    getBone: function () {
        return this.bone;
    },

    /**
     * display name getter
     * @returns {String}
     */
    getDisplayName: function () {
        return this._displayName;
    }
});
if (cc._renderType == cc._RENDER_TYPE_WEBGL) {
    ccs.Skin.prototype.updateTransform = ccs.Skin.prototype._updateTransformForWebGL;
}else{
    //ccs.Skin.prototype.getNodeToParentTransform = cc.Node.prototype._getNodeToParentTransformForWebGL;
}
//ccs.Skin.prototype.nodeToParentTransform = cc.Node.prototype._getNodeToParentTransformForWebGL;


var _p = ccs.Skin.prototype;

// Extended properties
/** @expose */
_p.skinData;
cc.defineGetterSetter(_p, "skinData", _p.getSkinData, _p.setSkinData);
/** @expose */
_p.displayName;
cc.defineGetterSetter(_p, "displayName", _p.getDisplayName);

_p = null;

/**
 * allocates and initializes a skin.
 * @param {String} [fileName] fileName or sprite frame name
 * @param {cc.Rect} [rect]
 * @returns {ccs.Skin}
 * @deprecated since v3.1, please use new construction instead
 */
ccs.Skin.create = function (fileName, rect) {
    return new ccs.Skin(fileName, rect);
};

/**
 * allocates and initializes a skin.
 * @param {String} spriteFrameName
 * @returns {ccs.Skin}
 * @deprecated since v3.1, please use new construction instead
 */
ccs.Skin.createWithSpriteFrameName = function (spriteFrameName) {
    return new ccs.Skin("#" + spriteFrameName);
};
