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

    ctor: function () {
        cc.Sprite.prototype.ctor.call(this);
        this._skinData = null;
        this.bone = null;
        this._displayName = "";
        this._skinTransform = cc.affineTransformIdentity();
        this._armature = null;
    },

    initWithSpriteFrameName: function (spriteFrameName) {
        if(spriteFrameName == "")
            return false;
        var pFrame = cc.spriteFrameCache.getSpriteFrame(spriteFrameName);

        var ret = true;
        if(pFrame){
            this.initWithSpriteFrame(pFrame);
        }else{
            cc.log("Cann't find CCSpriteFrame with %s. Please check your .plist file", spriteFrameName);
            ret = false;
        }

        this._displayName = spriteFrameName;

        return ret;
    },

    initWithFile: function (fileName) {
        var ret = cc.Sprite.prototype.initWithFile.call(this, fileName);
        this._displayName = fileName;
        return ret;
    },

    setSkinData: function (skinData) {
        this._skinData = skinData;

        this.setScaleX(skinData.scaleX);
        this.setScaleY(skinData.scaleY);
        this.setRotationX(cc.radiansToDegrees(skinData.skewX));
        this.setRotationY(cc.radiansToDegrees(-skinData.skewY));
        this.setPosition(skinData.x, skinData.y);

        this._skinTransform = this.getNodeToParentTransform ?
            this.getNodeToParentTransform() :
            this.nodeToParentTransform();

        this.updateArmatureTransform();
    },

    getSkinData: function () {
        return this._skinData;
    },

    updateArmatureTransform: function () {
        //TODO cc.TransformConcat
        this._transform = cc.affineTransformConcat(
            this.bone.getNodeToArmatureTransform(),
            this._skinTransform
        );
    },

    updateTransform: function(){
        // If it is not visible, or one of its ancestors is not visible, then do nothing:
        if( !this._visible)
        {
            this._quad.br.vertices = this._quad.tl.vertices = this._quad.tr.vertices = this._quad.bl.vertices = cc.p(0, 0);
        }
        else
        {
            //
            // calculate the Quad based on the Affine Matrix
            //
            var transform = this.getNodeToParentTransform ?
                this.getNodeToParentTransform() :
                this.nodeToParentTransform();

            var size = this._rect;

            var x1 = this._offsetPosition.x;
            var y1 = this._offsetPosition.y;

            var x2 = x1 + size.width;
            var y2 = y1 + size.height;

            var x = transform.tx;
            var y = transform.ty;

            var cr = transform.a;
            var sr = transform.b;
            var cr2 = transform.c;
            var sr2 = -transform.d;
            var ax = x1 * cr - y1 * sr2 + x;
            var ay = x1 * sr + y1 * cr2 + y;

            var bx = x2 * cr - y1 * sr2 + x;
            var by = x2 * sr + y1 * cr2 + y;

            var cx = x2 * cr - y2 * sr2 + x;
            var cy = x2 * sr + y2 * cr2 + y;

            var dx = x1 * cr - y2 * sr2 + x;
            var dy = x1 * sr + y2 * cr2 + y;

            //TODO _positionZ
            this.SET_VERTEX3F(
                this._quad.bl.vertices,
                this.RENDER_IN_SUBPIXEL(ax),
                this.RENDER_IN_SUBPIXEL(ay),
                this._localZOrder
            );
            this.SET_VERTEX3F(
                this._quad.br.vertices,
                this.RENDER_IN_SUBPIXEL(bx),
                this.RENDER_IN_SUBPIXEL(by),
                this._localZOrder
            );
            this.SET_VERTEX3F(
                this._quad.tl.vertices,
                this.RENDER_IN_SUBPIXEL(dx),
                this.RENDER_IN_SUBPIXEL(dy),
                this._localZOrder
            );
            this.SET_VERTEX3F(
                this._quad.tr.vertices,
                this.RENDER_IN_SUBPIXEL(cx),
                this.RENDER_IN_SUBPIXEL(cy),
                this._localZOrder
            );
        }

        // MARMALADE CHANGE: ADDED CHECK FOR nullptr, TO PERMIT SPRITES WITH NO BATCH NODE / TEXTURE ATLAS
        if (this._textureAtlas)
        {
            this._textureAtlas.updateQuad(this._quad, this._textureAtlas.getTotalQuads());
        }
    },

    SET_VERTEX3F: function(_v_, _x_, _y_, _z_){
        (_v_).x = (_x_);
        (_v_).y = (_y_);
        (_v_).z = (_z_);
    },

    RENDER_IN_SUBPIXEL: function(__ARGS__){
        return Math.ceil(__ARGS__);
    },

    getNodeToWorldTransform: function(){
        //TODO cc.TransformConcat
        return cc.affineTransformConcat(
            this._bone.getArmature().getNodeToWorldTransform(),
            this._transform
        );
    },

    getNodeToWorldTransformAR: function(){
        var displayTransform = this._transform;

        //TODO cc.PointApplyTransform
        this._anchorPointInPoints = cc.pointApplyAffineTransform(this._anchorPointInPoints, displayTransform);
        displayTransform.tx = this._anchorPointInPoints.x;
        displayTransform.ty = this._anchorPointInPoints.y;

        //TODO cc.TransformConcat
        return cc.affineTransformConcat(
            displayTransform,
            this.bone.getArmature().nodeToWorldTransform()
        );
    },

//    draw: function(renderer, transform, flags){
////        var mv = Director::getInstance()->getMatrix(MATRIX_STACK_TYPE::MATRIX_STACK_MODELVIEW);
//
//        //TODO implement z order
//        this._quadCommand.init(
//            this._globalZOrder,
//            this._texture.getName(),
//            this.getGLProgramState(),
//            this._blendFunc,
//            this._quad, 1, mv);
//        renderer.addCommand(this._quadCommand);
//    },

    setBone: function (bone) {
        this.bone = bone;
        var armature = this.bone.getArmature();
        if(armature)
        {
            this._armature = armature;
        }
    },

    getBone: function () {
        return this.bone;
    },

    /**
     * display name getter
     * @returns {String}
     */
    getDisplayName: function () {
        return this._displayName;
    },

//    /** returns a "local" axis aligned bounding box of the node. <br/>
//     * The returned box is relative only to its parent.
//     * @return {cc.Rect}
//     */
//    getBoundingBox: function () {
//        var rect = cc.rect(0, 0, this._contentSize.width, this._contentSize.height);
//        var transForm = this.nodeToParentTransform();
//        if (cc._renderType === cc._RENDER_TYPE_CANVAS) {
//            transForm.b *= -1;
//            transForm.c *= -1;
//            transForm.b = [transForm.c, transForm.c = transForm.b][0];
//        }
//        return cc.rectApplyAffineTransform(rect, transForm);
//    },

    /**
     * @deprecated
     * @returns {cc.AffineTransform}
     */
    nodeToWorldTransform: function () {
        return this.getNodeToWorldTransform();
    },

    /**
     * @deprecated
     * @returns {cc.AffineTransform}
     */
    nodeToWorldTransformAR: function () {
        return this.getNodeToWorldTransformAR();
    }
});
ccs.Skin.prototype.nodeToParentTransform = cc.Node.prototype._nodeToParentTransformForWebGL;

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
 * @example
 * // example
 * var skin = ccs.Skin.create("res/test.png",cc.rect(0,0,50,50));
 * var skin = ccs.Skin.create("#test.png");             //=> ccs.Skin.createWithSpriteFrameName("test.png");
 */
ccs.Skin.create = function (fileName, rect) {
    var argnum = arguments.length;
    var skin = new ccs.Skin();
    if (argnum === 0 || fileName == null || fileName == "") {
        if (skin.init())
            return skin;
    } else {
        if(fileName[0] == "#"){
            if (skin && skin.initWithSpriteFrameName(fileName))
                return skin;
        }else{
            if (skin && skin.initWithFile(fileName, rect))
                return skin;
        }
    }
    return null;
};

/**
 * allocates and initializes a skin.
 * @param {String} spriteFrameName
 * @returns {ccs.Skin}
 * @example
 * // example
 * var skin = ccs.Skin.createWithSpriteFrameName("test.png");
 */
ccs.Skin.createWithSpriteFrameName = function (spriteFrameName) {
    var skin = new ccs.Skin();
    if (skin && skin.initWithSpriteFrameName(spriteFrameName))
        return skin;
    return null;
};
