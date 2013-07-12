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
 * Base class for cc.Armature objects.
 * @class
 * @extends cc.NodeRGBA
 */
cc.Armature = cc.NodeRGBA.extend({
    _animation:null,
    _armatureData:null,
    _batchNode:null,
    _name:"",
    _textureAtlas:null,
    _parentBone:null,
    _boneDic:null,
    _topBoneList:[],
    _armatureIndexDic:{},
    _offsetPoint:cc.p(0, 0),
    ctor:function () {
        cc.NodeRGBA.prototype.ctor.call(this);
        this._animation = null;
        this._armatureData = null;
        this._batchNode = null;
        this._name = "";
        this._textureAtlas = null;
        this._parentBone = null;
        this._boneDic = null;
        this._topBoneList = [];
        this._armatureIndexDic = {};
        this._offsetPoint = cc.p(0, 0);
    },

    /**
     * Initializes a CCArmature with the specified name and CCBone
     * @param {String} name
     * @param {cc.Bone} parentBone
     * @return {Boolean}
     */
    init:function (name, parentBone) {
        cc.NodeRGBA.prototype.init.call(this);
        if (parentBone) {
            this._parentBone = parentBone;
        }
        this.removeAllChildren();
        this._animation = new cc.ArmatureAnimation();
        this._animation.init(this);
        this._boneDic = {};
        this._boneList = [];

        this._name = (!name) ? "" : name;
        var armatureDataManager = cc.ArmatureDataManager.getInstance();
        if (name != "") {
            //animationData
            var animationData = armatureDataManager.getAnimationData(name);
            if (!animationData) {
                cc.log("AnimationData not exist! ");
                return false;
            }
            this._animation.setAnimationData(animationData);

            //armatureData
            var armatureData = armatureDataManager.getArmatureData(name);
            this._armatureData = armatureData;

            //boneDataDic
            var boneDataDic = armatureData.getBoneDataDic();
            for (var key in boneDataDic) {
                var bone = this.createBone(String(key));
                //! init bone's  Tween to 1st movement's 1st frame
                do {
                    var movData = animationData.getMovement(animationData.movementNames[0]);
                    if (!movData) {
                        break;
                    }
                    var _movBoneData = movData.getMovementBoneData(bone.getName());
                    if (!_movBoneData || _movBoneData.frameList.length <= 0) {
                        break;
                    }
                    var frameData = _movBoneData.getFrameData(0);
                    if (!frameData) {
                        break;
                    }
                    bone.getTweenData().copy(frameData);
                    bone.changeDisplayByIndex(frameData.displayIndex, false);
                } while (0);
            }
            this.update(0);
            this.updateOffsetPoint();
        } else {
            this._name = "new_armature";
            this._armatureData = new cc.ArmatureData();
            this._armatureData.name = this._name;

            var animationData = new cc.AnimationData();
            animationData.name = this._name;

            armatureDataManager.addArmatureData(this._name, this._armatureData);
            armatureDataManager.addAnimationData(this._name, animationData);

            this._animation.setAnimationData(animationData);
        }
        if (cc.renderContextType === cc.WEBGL) {
            this.setShaderProgram(cc.ShaderCache.getInstance().programForKey(cc.SHADER_POSITION_TEXTURE_UCOLOR));
        }

        this.unscheduleUpdate();
        this.scheduleUpdate();

        this.setCascadeOpacityEnabled(true);
        this.setCascadeColorEnabled(true);
        return true;
    },

    /**
     * create a bone
     * @param {String} boneName
     * @return {cc.Bone}
     */
    createBone:function (boneName) {
        var existedBone = this.getBone(boneName);
        if (existedBone) {
            return existedBone;
        }
        var boneData = this._armatureData.getBoneData(boneName);
        var parentName = boneData.parentName;
        var bone = null;
        if (parentName != "") {
            this.createBone(parentName);
            bone = cc.Bone.create(boneName);
            this.addBone(bone, parentName);
        } else {
            bone = cc.Bone.create(boneName);
            this.addBone(bone, "");
        }

        bone.setBoneData(boneData);
        bone.getDisplayManager().changeDisplayByIndex(-1, false);
        return bone;
    },

    /**
     * add a bone
     * @param {cc.Bone} bone
     * @param {String} parentName
     */
    addBone:function (bone, parentName) {
        if (!bone) {
            cc.log("Argument must be non-nil");
            return;
        }
        if (this._boneDic[bone.getName()]) {
            cc.log("bone already added. It can't be added again");
            return;
        }

        if (parentName) {
            var boneParent = this._boneDic[parentName];
            if (boneParent) {
                boneParent.addChildBone(bone);
            }
            else {
                if (this._parentBone)
                    this._parentBone.addChildBone(bone);
                else
                    this._topBoneList.push(bone);
            }
        }
        else {
            if (this._parentBone)
                this._parentBone.addChildBone(bone);
            else
                this._topBoneList.push(bone);
        }
        bone.setArmature(this);
        this._boneDic[bone.getName()] = bone;
        this.addChild(bone);
    },

    /**
     * remove a bone
     * @param {cc.Bone} bone
     * @param {Boolean} recursion
     */
    removeBone:function (bone, recursion) {
        if (!bone) {
            cc.log("bone must be added to the bone dictionary!");
            return;
        }

        bone.setArmature(null);
        bone.removeFromParent(recursion);
        cc.ArrayRemoveObject(this._boneList, bone);
        delete  this._boneDic[bone.getName()];
        this.removeChild(bone, true);
    },

    /**
     * get a bone by name
     * @param {String} name
     * @return {cc.Bone}
     */
    getBone:function (name) {
        return this._boneDic[name];
    },

    /**
     * Change a bone's parent with the specified parent name.
     * @param {cc.Bone} bone
     * @param {String} parentName
     */
    changeBoneParent:function (bone, parentName) {
        if (!bone) {
            cc.log("bone must be added to the bone dictionary!");
        }
        cc.ArrayRemoveObject(bone.getParentBone().getChildrenBone(), bone);
        bone.removeFromParent(false);
        if (parentName) {
            var boneParent = this._boneDic[parentName];
            if (boneParent) {
                boneParent.addChildBone(bone);
            }
        }
    },

    /**
     * Get CCArmature's bone dictionary
     * @return {Object}
     */
    getBoneDic:function () {
        return this._boneDic;
    },

    /**
     * Set contentSize and Calculate anchor point.
     */
    updateOffsetPoint:function () {
        // Set contentsize and Calculate anchor point.
        var rect = this.boundingBox();
        this.setContentSize(rect.size);
        this._offsetPoint = cc.p(-rect.origin.x, -rect.origin.y);
        this.setAnchorPoint(cc.p(this._offsetPoint.x / rect.size.width, this._offsetPoint.y / rect.size.height));
    },

    update:function (dt) {
        this._animation.update(dt);
        for (var i = 0; i < this._topBoneList.length; i++) {
            this._topBoneList[i].update(dt);
        }
    },

    nodeToParentTransform:function () {
        return cc.Browser.supportWebGL ? this.nodeToParentTransformWEBGL() : this.nodeToParentTransformCanvas();
    },

    nodeToParentTransformWEBGL:function () {
        if (this._transformDirty) {
            // Translate values
            var x = this._position.x;
            var y = this._position.y;
            var apx = this._anchorPointInPoints.x, napx = -apx;
            var apy = this._anchorPointInPoints.y, napy = -apy;
            var scx = this._scaleX, scy = this._scaleY;

            if (this._ignoreAnchorPointForPosition) {
                x += apx;
                y += apy;
            }

            // Rotation values
            // Change rotation code to handle X and Y
            // If we skew with the exact same value for both x and y then we're simply just rotating
            var cx = 1, sx = 0, cy = 1, sy = 0;
            if (this._rotationX !== 0 || this._rotationY !== 0) {
                cx = Math.cos(-this._rotationRadiansX);
                sx = Math.sin(-this._rotationRadiansX);
                cy = Math.cos(-this._rotationRadiansY);
                sy = Math.sin(-this._rotationRadiansY);
            }

            // Add offset point
            x += cy * this._offsetPoint.x * this._scaleX + -sx * this._offsetPoint.y * this._scaleY;
            y += sy * this._offsetPoint.x * this._scaleX + cx * this._offsetPoint.y * this._scaleY;

            var needsSkewMatrix = ( this._skewX || this._skewY );

            // optimization:
            // inline anchor point calculation if skew is not needed
            // Adjusted transform calculation for rotational skew
            if (!needsSkewMatrix && (apx !== 0 || apy !== 0)) {
                x += cy * napx * scx + -sx * napy * scy;
                y += sy * napx * scx + cx * napy * scy;
            }

            // Build Transform Matrix
            // Adjusted transform calculation for rotational skew
            var t = {a:cy * scx, b:sy * scx, c:-sx * scy, d:cx * scy, tx:x, ty:y};

            // XXX: Try to inline skew
            // If skew is needed, apply skew and then anchor point
            if (needsSkewMatrix) {
                t = cc.AffineTransformConcat({a:1.0, b:Math.tan(cc.DEGREES_TO_RADIANS(this._skewY)),
                    c:Math.tan(cc.DEGREES_TO_RADIANS(this._skewX)), d:1.0, tx:0.0, ty:0.0}, t);

                // adjust anchor point
                if (apx !== 0 || apy !== 0)
                    t = cc.AffineTransformTranslate(t, napx, napy);
            }

            if (this._additionalTransformDirty) {
                t = cc.AffineTransformConcat(t, this._additionalTransform);
                this._additionalTransformDirty = false;
            }
            this._transform = t;
            this._transformDirty = false;
        }
        return this._transform;
    },

    nodeToParentTransformCanvas:function () {
        if (!this._transform)
            this._transform = {a:1, b:0, c:0, d:1, tx:0, ty:0};
        if (this._transformDirty) {
            var t = this._transform;// quick reference
            // base position
            t.tx = this._position.x;
            t.ty = this._position.y;

            // rotation Cos and Sin
            var Cos = 1, Sin = 0;
            if (this._rotationX) {
                Cos = Math.cos(this._rotationRadiansX);
                Sin = Math.sin(this._rotationRadiansX);
            }

            // base abcd
            t.a = t.d = Cos;
            t.c = -Sin;
            t.b = Sin;

            var lScaleX = this._scaleX, lScaleY = this._scaleY;
            var appX = this._anchorPointInPoints.x, appY = this._anchorPointInPoints.y;

            // Firefox on Vista and XP crashes
            // GPU thread in case of scale(0.0, 0.0)
            var sx = (lScaleX < 0.000001 && lScaleX > -0.000001) ? 0.000001 : lScaleX,
                sy = (lScaleY < 0.000001 && lScaleY > -0.000001) ? 0.000001 : lScaleY;


            // Add offset point
            t.tx += Cos * this._offsetPoint.x * lScaleX + -Sin * this._offsetPoint.y * lScaleY;
            t.ty += Sin * this._offsetPoint.x * lScaleX + Cos * this._offsetPoint.y * lScaleY;


            // skew
            if (this._skewX || this._skewY) {
                // offset the anchorpoint
                var skx = Math.tan(-this._skewX * Math.PI / 180);
                var sky = Math.tan(-this._skewY * Math.PI / 180);
                var xx = appY * skx * sx;
                var yy = appX * sky * sy;
                t.a = Cos + -Sin * sky;
                t.c = Cos * skx + -Sin;
                t.b = Sin + Cos * sky;
                t.d = Sin * skx + Cos;
                t.tx += Cos * xx + -Sin * yy;
                t.ty += Sin * xx + Cos * yy;
            }

            // scale
            if (lScaleX !== 1 || lScaleY !== 1) {
                t.a *= sx;
                t.b *= sx;
                t.c *= sy;
                t.d *= sy;
            }

            // adjust anchorPoint
            t.tx += Cos * -appX * sx + -Sin * appY * sy;
            t.ty -= Sin * -appX * sx + Cos * appY * sy;

            // if ignore anchorPoint
            if (this._ignoreAnchorPointForPosition) {
                t.tx += appX
                t.ty += appY;
            }

            if (this._additionalTransformDirty) {
                this._transform = cc.AffineTransformConcat(this._transform, this._additionalTransform);
                //Because the cartesian coordination is inverted in html5 canvas, these needs to be inverted as well
                this._transform.b *= -1;
                this._transform.c *= -1;

                this._additionalTransformDirty = false;
            }

            t.tx = t.tx | 0;
            t.ty = t.ty | 0;
            this._transformDirty = false;
        }
        return this._transform;
    },

    draw:function () {
        cc.g_NumberOfDraws++;
    },

    /**
     * This boundingBox will calculate all bones' boundingBox every time
     * @return {cc.rect}
     */
    boundingBox:function () {
        var minx, miny, maxx, maxy = 0;
        var first = true;
        var boundingBox = cc.rect(0, 0, 0, 0);
        for (var i = 0; i < this._children.length; i++) {
            var bone = this._children[i];
            var r = bone.getDisplayManager().getBoundingBox();
            if (first) {
                minx = cc.rectGetMinX(r);
                miny = cc.rectGetMinY(r);
                maxx = cc.rectGetMaxX(r);
                maxy = cc.rectGetMaxY(r);

                first = false;
            }
            else {
                minx = cc.rectGetMinX(r) < cc.rectGetMinX(boundingBox) ? cc.rectGetMinX(r) : cc.rectGetMinX(boundingBox);
                miny = cc.rectGetMinY(r) < cc.rectGetMinY(boundingBox) ? cc.rectGetMinY(r) : cc.rectGetMinY(boundingBox);
                maxx = cc.rectGetMaxX(r) > cc.rectGetMaxX(boundingBox) ? cc.rectGetMaxX(r) : cc.rectGetMaxX(boundingBox);
                maxy = cc.rectGetMaxY(r) > cc.rectGetMaxY(boundingBox) ? cc.rectGetMaxY(r) : cc.rectGetMaxY(boundingBox);
            }
            boundingBox = cc.rect(minx, miny, maxx - minx, maxy - miny);
        }
        return boundingBox;
    },

    /**
     * armatureAnimation getter
     * @return {cc.ArmatureAnimation}
     */
    getAnimation:function () {
        return this._animation;
    },

    /**
     * armatureAnimation setter
     * @param {cc.ArmatureAnimation} animation
     */
    setAnimation:function (animation) {
        this._animation = animation;
    },

    /**
     * armatureData getter
     * @return {cc.ArmatureData}
     */
    getArmatureData:function () {
        return this._armatureData;
    },

    /**
     * armatureData setter
     * @param {cc.ArmatureData} armatureData
     */
    setArmatureData:function (armatureData) {
        this._armatureData = armatureData;
    },
    getName:function () {
        return this._name;
    },
    setName:function (name) {
        this._name = name;
    },
    getBatchNode:function () {
        return this._batchNode;
    },
    setBatchNode:function (batchNode) {
        this._batchNode = batchNode;
    },
    getParentBone:function () {
        return this._parentBone;
    },
    setParentBone:function (parentBone) {
        this._parentBone = parentBone;
    }
});

/**
 * allocates and initializes a armature.
 * @constructs
 * @return {cc.Armature}
 * @example
 * // example
 * var armature = cc.Armature.create();
 */
cc.Armature.create = function (name, parentBone) {
    var armature = new cc.Armature();
    if (armature && armature.init(name, parentBone)) {
        return armature;
    }
    return null;
};