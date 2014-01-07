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
 * Base class for ccs.Armature objects.
 * @class
 * @extends ccs.NodeRGBA
 */
ccs.Armature = ccs.NodeRGBA.extend(/** @lends ccs.Armature# */{
    _animation:null,
    _armatureData:null,
    _batchNode:null,
    _name:"",
    _textureAtlas:null,
    _parentBone:null,
    _boneDic:null,
    _topBoneList:null,
    _armatureIndexDic:null,
    _offsetPoint:null,
    _version:0,
    _armatureTransformDirty:true,
    _body:null,
    _textureAtlasDic:null,
    _blendFunc:null,
    ctor:function () {
        cc.NodeRGBA.prototype.ctor.call(this);
        this._animation = null;
        this._armatureData = null;
        this._batchNode = null;
        this._name = "";
        this._textureAtlas = null;
        this._parentBone = null;
        this._boneDic = null;
        this._topBoneList = null;
        this._armatureIndexDic = {};
        this._offsetPoint = cc.p(0, 0);
        this._version = 0;
        this._armatureTransformDirty = true;
        this._body = null;
        this._textureAtlasDic = null;
        this._blendFunc = null;
    },

    /**
     * Initializes a CCArmature with the specified name and CCBone
     * @param {String} name
     * @param {ccs.Bone} parentBone
     * @return {Boolean}
     */
    init:function (name, parentBone) {
        cc.NodeRGBA.prototype.init.call(this);
        if (parentBone) {
            this._parentBone = parentBone;
        }
        this.removeAllChildren();
        this._animation = new ccs.ArmatureAnimation();
        this._animation.init(this);
        this._boneDic = {};
        this._topBoneList = [];
        this._textureAtlasDic = {};
        this._blendFunc = {src: cc.BLEND_SRC, dst: cc.BLEND_DST};
        this._name = (!name) ? "" : name;
        var armatureDataManager = ccs.ArmatureDataManager.getInstance();
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
                    bone.changeDisplayWithIndex(frameData.displayIndex, false);
                } while (0);
            }
            this.update(0);
            this.updateOffsetPoint();
        } else {
            this._name = "new_armature";
            this._armatureData = new ccs.ArmatureData();
            this._armatureData.name = this._name;

            var animationData = new ccs.AnimationData();
            animationData.name = this._name;

            armatureDataManager.addArmatureData(this._name, this._armatureData);
            armatureDataManager.addAnimationData(this._name, animationData);

            this._animation.setAnimationData(animationData);
        }
        if (cc.renderContextType === cc.WEBGL) {
            this.setShaderProgram(cc.ShaderCache.getInstance().programForKey(cc.SHADER_POSITION_TEXTURE_UCOLOR));
        }

        this.setCascadeOpacityEnabled(true);
        this.setCascadeColorEnabled(true);
        return true;
    },
    onEnter:function(){
        cc.NodeRGBA.prototype.onEnter.call(this);
        this.scheduleUpdate();
    },
    onExit:function(){
        cc.NodeRGBA.prototype.onExit.call(this);
        this.unscheduleUpdate();
    },
    /**
     * create a bone
     * @param {String} boneName
     * @return {ccs.Bone}
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
            bone = ccs.Bone.create(boneName);
            this.addBone(bone, parentName);
        } else {
            bone = ccs.Bone.create(boneName);
            this.addBone(bone, "");
        }

        bone.setBoneData(boneData);
        bone.getDisplayManager().changeDisplayWithIndex(-1, false);
        return bone;
    },

    /**
     * add a bone
     * @param {ccs.Bone} bone
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
                this._topBoneList.push(bone);
            }
        }
        else {
            this._topBoneList.push(bone);
        }
        bone.setArmature(this);
        this._boneDic[bone.getName()] = bone;
        this.addChild(bone);
    },

    /**
     * remove a bone
     * @param {ccs.Bone} bone
     * @param {Boolean} recursion
     */
    removeBone:function (bone, recursion) {
        if (!bone) {
            cc.log("bone must be added to the bone dictionary!");
            return;
        }

        bone.setArmature(null);
        bone.removeFromParent(recursion);
        cc.ArrayRemoveObject(this._topBoneList, bone);
        delete  this._boneDic[bone.getName()];
        this.removeChild(bone, true);
    },

    /**
     * get a bone by name
     * @param {String} name
     * @return {ccs.Bone}
     */
    getBone:function (name) {
        return this._boneDic[name];
    },

    /**
     * Change a bone's parent with the specified parent name.
     * @param {ccs.Bone} bone
     * @param {String} parentName
     */
    changeBoneParent:function (bone, parentName) {
        if (!bone) {
            cc.log("bone must be added to the bone dictionary!");
            return;
        }
        var parentBone = bone.getParentBone();
        if(parentBone){
            cc.ArrayRemoveObject(parentBone.getChildrenBone(), bone);
            bone.setParentBone(null);
        }

        if (parentName) {
            var boneParent = this._boneDic[parentName];
            if (boneParent) {
                boneParent.addChildBone(bone);
                cc.ArrayRemoveObject(this._topBoneList,bone);
            }else{
                this._topBoneList.push(bone);
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
        this.setContentSize(rect._size);
        var locOffsetPoint = this._offsetPoint;
        locOffsetPoint.x = -rect.x;
        locOffsetPoint.y = -rect.y;
        if (rect.width != 0 && rect.height != 0) {
            this.setAnchorPoint(locOffsetPoint.x / rect.width, locOffsetPoint.y / rect.height);
        }
    },

    update:function (dt) {
        this._animation.update(dt);
        var locTopBoneList = this._topBoneList;
        for (var i = 0; i < locTopBoneList.length; i++) {
            locTopBoneList[i].update(dt);
        }
        this._armatureTransformDirty = false;
    },


    nodeToParentTransform: null,

    _nodeToParentTransformForWebGL:function () {
        if (this._transformDirty) {
            this._armatureTransformDirty = true;
            // Translate values
            var x = this._position._x;
            var y = this._position._y;
            var apx = this._anchorPointInPoints._x, napx = -apx;
            var apy = this._anchorPointInPoints._y, napy = -apy;
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

    _nodeToParentTransformForCanvas:function () {
        if (!this._transform)
            this._transform = {a:1, b:0, c:0, d:1, tx:0, ty:0};
        if (this._transformDirty) {
            this._armatureTransformDirty = true;
            var t = this._transform;// quick reference
            // base position
            t.tx = this._position._x;
            t.ty = this._position._y;

            // rotation Cos and Sin
            var Cos = 1, Sin = 0;
            if (this._rotationX) {
                Cos = Math.cos(-this._rotationRadiansX);
                Sin = Math.sin(-this._rotationRadiansX);
            }

            // base abcd
            t.a = t.d = Cos;
            t.c = -Sin;
            t.b = Sin;

            var lScaleX = this._scaleX, lScaleY = this._scaleY;
            var appX = this._anchorPointInPoints._x, appY = this._anchorPointInPoints._y;

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
            t.tx += Cos * -appX * sx + -Sin * -appY * sy;
            t.ty += Sin * -appX * sx + Cos * -appY * sy;

            // if ignore anchorPoint
            if (this._ignoreAnchorPointForPosition) {
                t.tx += appX
                t.ty += appY;
            }

            if (this._additionalTransformDirty) {
                this._transform = cc.AffineTransformConcat(this._transform, this._additionalTransform);
                this._additionalTransformDirty = false;
            }

            t.tx = t.tx | 0;
            t.ty = t.ty | 0;
            this._transformDirty = false;
        }
        return this._transform;
    },

    draw:function () {
        //cc.g_NumberOfDraws++;
    },

    /**
     * conforms to cc.TextureProtocol protocol
     * @param {cc.BlendFunc} blendFunc
     */
    setBlendFunc: function (blendFunc) {
        this._blendFunc = blendFunc;
    },

    /**
     * blendFunc getter
     * @returns {cc.BlendFunc}
     */
    getBlendFunc: function () {
        return this._blendFunc;
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
            if (bone instanceof ccs.Bone) {
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
        }
        return cc.RectApplyAffineTransform(boundingBox, this.nodeToParentTransform());
    },

    /**
     * when bone  contain the point ,then return it.
     * @param {Number} x
     * @param {Number} y
     * @returns {ccs.Bone}
     */
    getBoneAtPoint: function (x, y) {
        for (var i = this._children.length - 1; i >= 0; i--) {
            var child = this._children[i];
            if (child instanceof ccs.Bone) {
                if (child.getDisplayManager().containPoint(x, y)) {
                    return child;
                }
            }
        }
        return null;
    },

    getTexureAtlasWithTexture:function(){
        return null;
    },

    /**
     * parent bone setter
     * @param {ccs.Bone} parentBone
     */
    setParentBone: function (parentBone) {
        this._parentBone = parentBone;
        for (var key in this._boneDic) {
            var bone = this._boneDic[key];
            bone.setArmature(this);
        }
    },

    /**
     * set collider filter
     * @param {ccs.ColliderFilter} filter
     */
    setColliderFilter: function (filter) {
        for (var key in this._boneDic) {
            var bone = this._boneDic[key];
            bone.setColliderFilter(filter);
        }
    },

    /**
     * draw contour
     */
    drawContour: function () {
        cc.drawingUtil.setDrawColor4B(255, 255, 255, 255);
        cc.drawingUtil.setLineWidth(1);
        for (var key in this._boneDic) {
            var bone = this._boneDic[key];
            var bodyList = bone.getColliderBodyList();
            for (var i = 0; i < bodyList.length; i++) {
                var body = bodyList[i];
                var vertexList = body.getCalculatedVertexList();
                cc.drawingUtil.drawPoly(vertexList, vertexList.length, true);
            }
        }
    },

    /**
     * return parent bone
     * @returns {ccs.Bone}
     */
    getParentBone:function(){
        return this._parentBone;
    },

    /**
     * armatureAnimation getter
     * @return {ccs.ArmatureAnimation}
     */
    getAnimation:function () {
        return this._animation;
    },

    /**
     * armatureAnimation setter
     * @param {ccs.ArmatureAnimation} animation
     */
    setAnimation:function (animation) {
        this._animation = animation;
    },

    /**
     * armatureData getter
     * @return {ccs.ArmatureData}
     */
    getArmatureData:function () {
        return this._armatureData;
    },

    /**
     * armatureData setter
     * @param {ccs.ArmatureData} armatureData
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

    /**
     * version getter
     * @returns {Number}
     */
    getVersion:function () {
        return this._version;
    },

    /**
     * version setter
     * @param {Number} version
     */
    setVersion:function (version) {
        this._version = version;
    },

    /**
     * armatureTransformDirty getter
     * @returns {Boolean}
     */
    getArmatureTransformDirty:function () {
        return this._armatureTransformDirty;
    },
    getBody:function(){
        return this._body;
    },

    setBody:function(body){
        if (this._body == body)
            return;

        this._body = body;
        this._body.data = this;
        var child,displayObject;
        for (var i = 0; i < this._children.length; i++) {
            child = this._children[i];
            if (child instanceof ccs.Bone) {
                var displayList = child.getDisplayManager().getDecorativeDisplayList();
                for (var j = 0; j < displayList.length; j++) {
                    displayObject = displayList[j];
                    var detector = displayObject.getColliderDetector();
                    if (detector)
                        detector.setBody(this._body);
                }
            }
        }
    },
    getShapeList:function(){
        if(this._body)
            return this._body.shapeList;
        return [];
    }

});


if(cc.Browser.supportWebGL){
    //WebGL
    ccs.Armature.prototype.nodeToParentTransform = ccs.Armature.prototype._nodeToParentTransformForWebGL;
}else{
    //Canvas
    ccs.Armature.prototype.nodeToParentTransform = ccs.Armature.prototype._nodeToParentTransformForCanvas;
}

/**
 * allocates and initializes a armature.
 * @constructs
 * @return {ccs.Armature}
 * @example
 * // example
 * var armature = ccs.Armature.create();
 */
ccs.Armature.create = function (name, parentBone) {
    var armature = new ccs.Armature();
    if (armature && armature.init(name, parentBone)) {
        return armature;
    }
    return null;
};
