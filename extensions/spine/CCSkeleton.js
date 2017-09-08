/****************************************************************************
 Copyright (c) 2011-2012 cocos2d-x.org
 Copyright (c) 2013-2014 Chukong Technologies Inc.
 Copyright (c) 2014 Shengxiang Chen (Nero Chan)

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
 * The main namespace of Spine, all classes, functions, properties and constants of Spine are defined in this namespace
 * @namespace
 * @name sp
 */
var sp = sp || {};

/**
 * The vertex index of spine.
 * @constant
 * @type {{X1: number, Y1: number, X2: number, Y2: number, X3: number, Y3: number, X4: number, Y4: number}}
 */
sp.VERTEX_INDEX = {
    X1: 0,
    Y1: 1,
    X2: 2,
    Y2: 3,
    X3: 4,
    Y3: 5,
    X4: 6,
    Y4: 7
};

/**
 * The attachment type of spine.  It contains three type: REGION(0), BOUNDING_BOX(1), MESH(2) and SKINNED_MESH.
 * @constant
 * @type {{REGION: number, BOUNDING_BOX: number, REGION_SEQUENCE: number, MESH: number}}
 */
sp.ATTACHMENT_TYPE = {
    REGION: 0,
    BOUNDING_BOX: 1,
    MESH: 2,
    SKINNED_MESH:3
};

var spine = sp.spine;

/**
 * <p>
 *     The skeleton of Spine.                                                                          <br/>
 *     Skeleton has a reference to a SkeletonData and stores the state for skeleton instance,
 *     which consists of the current pose's bone SRT, slot colors, and which slot attachments are visible.           <br/>
 *     Multiple skeletons can use the same SkeletonData (which includes all animations, skins, and attachments).     <br/>
 * </p>
 * @class
 * @extends cc.Node
 */
sp.Skeleton = cc.Node.extend(/** @lends sp.Skeleton# */{
    _skeleton: null,
    _rootBone: null,
    _timeScale: 1,
    _debugSlots: false,
    _debugBones: false,
    _premultipliedAlpha: false,
    _ownsSkeletonData: null,
    _atlas: null,

    /**
     * The constructor of sp.Skeleton. override it to extend the construction behavior, remember to call "this._super()" in the extended "ctor" function.
     */
    ctor:function(skeletonDataFile, atlasFile, scale){
        cc.Node.prototype.ctor.call(this);

        if(arguments.length === 0)
            this.init();
        else
            this.initWithArgs(skeletonDataFile, atlasFile, scale);
    },

    _createRenderCmd:function () {
        if(cc._renderType === cc.game.RENDER_TYPE_CANVAS)
            return new sp.Skeleton.CanvasRenderCmd(this);
        else
            return new sp.Skeleton.WebGLRenderCmd(this);
    },

    /**
     * Initializes a sp.Skeleton. please do not call this function by yourself, you should pass the parameters to constructor to initialize it.
     */
    init: function () {
        cc.Node.prototype.init.call(this);
        this._premultipliedAlpha = (cc._renderType === cc.game.RENDER_TYPE_WEBGL && cc.OPTIMIZE_BLEND_FUNC_FOR_PREMULTIPLIED_ALPHA);
    },

    onEnter: function () {
        cc.Node.prototype.onEnter.call(this);
        this.scheduleUpdate();
    },

    onExit: function () {
        this.unscheduleUpdate();
        cc.Node.prototype.onExit.call(this);
    },

    /**
     * Sets whether open debug slots.
     * @param {boolean} enable true to open, false to close.
     */
    setDebugSolots:function(enable){
        this._debugSlots = enable;
    },

    /**
     * Sets whether open debug bones.
     * @param {boolean} enable
     */
    setDebugBones:function(enable){
        this._debugBones = enable;
    },

    /**
     * Sets whether open debug slots.
     * @param {boolean} enabled true to open, false to close.
     */
    setDebugSlotsEnabled: function(enabled) {
        this._debugSlots = enabled;
    },

    /**
     * Gets whether open debug slots.
     * @returns {boolean} true to open, false to close.
     */
    getDebugSlotsEnabled: function() {
        return this._debugSlots;
    },

    /**
     * Sets whether open debug bones.
     * @param {boolean} enabled
     */
    setDebugBonesEnabled: function(enabled) {
        this._debugBones = enabled;
    },

    /**
     * Gets whether open debug bones.
     * @returns {boolean} true to open, false to close.
     */
    getDebugBonesEnabled: function() {
        return this._debugBones;
    },

    /**
     * Sets the time scale of sp.Skeleton.
     * @param {Number} scale
     */
    setTimeScale:function(scale){
        this._timeScale = scale;
    },

    getTimeScale: function(){
        return this._timeScale;
    },

    /**
     * Initializes sp.Skeleton with Data.
     * @param {sp.spine.SkeletonData|String} skeletonDataFile
     * @param {String|spine.Atlas|spine.SkeletonData} atlasFile atlas filename or atlas data or owns SkeletonData
     * @param {Number} [scale] scale can be specified on the JSON or binary loader which will scale the bone positions, image sizes, and animation translations.
     */
    initWithArgs: function (skeletonDataFile, atlasFile, scale) {
        var argSkeletonFile = skeletonDataFile, argAtlasFile = atlasFile,
            skeletonData, atlas, ownsSkeletonData;

        if (cc.isString(argSkeletonFile)) {
            if (cc.isString(argAtlasFile)) {
                var data = cc.loader.getRes(argAtlasFile);
                sp._atlasLoader.setAtlasFile(argAtlasFile);
                atlas = new spine.TextureAtlas(data, sp._atlasLoader.load.bind(sp._atlasLoader));
            } else {
                atlas = atlasFile;
            }
            scale = scale || 1 / cc.director.getContentScaleFactor();

            var attachmentLoader = new spine.AtlasAttachmentLoader(atlas);
            var skeletonJsonReader = new spine.SkeletonJson(attachmentLoader);
            skeletonJsonReader.scale = scale;

            var skeletonJson = cc.loader.getRes(argSkeletonFile);
            skeletonData = skeletonJsonReader.readSkeletonData(skeletonJson);
            atlas.dispose(skeletonJsonReader);
            ownsSkeletonData = true;
        } else {
            skeletonData = skeletonDataFile;
            ownsSkeletonData = atlasFile;
        }
        this.setSkeletonData(skeletonData, ownsSkeletonData);
        this.init();
    },

    /**
     * Returns the bounding box of sp.Skeleton.
     * @returns {cc.Rect}
     */
    getBoundingBox: function () {
        var minX = cc.FLT_MAX, minY = cc.FLT_MAX, maxX = cc.FLT_MIN, maxY = cc.FLT_MIN;
        var scaleX = this.getScaleX(), scaleY = this.getScaleY(), vertices,
            slots = this._skeleton.slots, VERTEX = spine.RegionAttachment;

        for (var i = 0, slotCount = slots.length; i < slotCount; ++i) {
            var slot = slots[i];
            var attachment = slot.attachment;
            if (!attachment || !(attachment instanceof spine.RegionAttachment))
                continue;
            vertices = attachment.updateWorldVertices(slot, false);
            minX = Math.min(minX, vertices[VERTEX.X1] * scaleX, vertices[VERTEX.X4] * scaleX, vertices[VERTEX.X2] * scaleX, vertices[VERTEX.X3] * scaleX);
            minY = Math.min(minY, vertices[VERTEX.Y1] * scaleY, vertices[VERTEX.Y4] * scaleY, vertices[VERTEX.Y2] * scaleY, vertices[VERTEX.Y3] * scaleY);
            maxX = Math.max(maxX, vertices[VERTEX.X1] * scaleX, vertices[VERTEX.X4] * scaleX, vertices[VERTEX.X2] * scaleX, vertices[VERTEX.X3] * scaleX);
            maxY = Math.max(maxY, vertices[VERTEX.Y1] * scaleY, vertices[VERTEX.Y4] * scaleY, vertices[VERTEX.Y2] * scaleY, vertices[VERTEX.Y3] * scaleY);
        }
        var position = this.getPosition();
        return cc.rect(position.x + minX, position.y + minY, maxX - minX, maxY - minY);
    },

    /**
     * Computes the world SRT from the local SRT for each bone.
     */
    updateWorldTransform: function () {
        this._skeleton.updateWorldTransform();
    },

    /**
     * Sets the bones and slots to the setup pose.
     */
    setToSetupPose: function () {
        this._skeleton.setToSetupPose();
    },

    /**
     * Sets the bones to the setup pose, using the values from the `BoneData` list in the `SkeletonData`.
     */
    setBonesToSetupPose: function () {
        this._skeleton.setBonesToSetupPose();
    },

    /**
     * Sets the slots to the setup pose, using the values from the `SlotData` list in the `SkeletonData`.
     */
    setSlotsToSetupPose: function () {
        this._skeleton.setSlotsToSetupPose();
    },

    /**
     * Finds a bone by name. This does a string comparison for every bone.
     * @param {String} boneName
     * @returns {sp.spine.Bone}
     */
    findBone: function (boneName) {
        return this._skeleton.findBone(boneName);
    },

    /**
     * Finds a slot by name. This does a string comparison for every slot.
     * @param {String} slotName
     * @returns {sp.spine.Slot}
     */
    findSlot: function (slotName) {
        return this._skeleton.findSlot(slotName);
    },

    /**
     * Finds a skin by name and makes it the active skin. This does a string comparison for every skin. Note that setting the skin does not change which attachments are visible.
     * @param {string} skinName
     * @returns {sp.spine.Skin}
     */
    setSkin: function (skinName) {
        return this._skeleton.setSkinByName(skinName);
    },

    /**
     * Returns the attachment for the slot and attachment name. The skeleton looks first in its skin, then in the skeleton data’s default skin.
     * @param {String} slotName
     * @param {String} attachmentName
     * @returns {sp.spine.Attachment}
     */
    getAttachment: function (slotName, attachmentName) {
        return this._skeleton.getAttachmentByName(slotName, attachmentName);
    },

    /**
     * Sets the attachment for the slot and attachment name. The skeleton looks first in its skin, then in the skeleton data’s default skin.
     * @param {String} slotName
     * @param {String} attachmentName
     */
    setAttachment: function (slotName, attachmentName) {
        this._skeleton.setAttachment(slotName, attachmentName);
    },

    /**
     * Sets the premultiplied alpha value to sp.Skeleton.
     * @param {Number} alpha
     */
    setPremultipliedAlpha: function (premultiplied) {
        this._premultipliedAlpha = premultiplied;
    },

    /**
     * Returns whether to enable premultiplied alpha.
     * @returns {boolean}
     */
    isPremultipliedAlpha: function () {
        return this._premultipliedAlpha;
    },

    /**
     * Sets skeleton data to sp.Skeleton.
     * @param {sp.spine.SkeletonData} skeletonData
     * @param {sp.spine.SkeletonData} ownsSkeletonData
     */
    setSkeletonData: function (skeletonData, ownsSkeletonData) {
        if(skeletonData.width != null && skeletonData.height != null)
            this.setContentSize(skeletonData.width / cc.director.getContentScaleFactor(), skeletonData.height / cc.director.getContentScaleFactor());

        this._skeleton = new spine.Skeleton(skeletonData);
        this._skeleton.updateWorldTransform();
        this._rootBone = this._skeleton.getRootBone();
        this._ownsSkeletonData = ownsSkeletonData;

        this._renderCmd._createChildFormSkeletonData();
    },

    /**
     * Return the renderer of attachment.
     * @param {sp.spine.RegionAttachment|sp.spine.BoundingBoxAttachment} regionAttachment
     * @returns {sp.spine.TextureAtlasRegion}
     */
    getTextureAtlas: function (regionAttachment) {
        return regionAttachment.region;
    },

    /**
     * Returns the blendFunc of sp.Skeleton.
     * @returns {cc.BlendFunc}
     */
    getBlendFunc: function () {
        var slot = this._skeleton.drawOrder[0];
        if (slot) {
            var blend = this._renderCmd._getBlendFunc(slot.data.blendMode, this._premultipliedAlpha);
            return blend;
        }
        else {
            return {};
        }
    },

    /**
     * Sets the blendFunc of sp.Skeleton, it won't have any effect for skeleton, skeleton is using slot's data to determine the blend function.
     * @param {cc.BlendFunc|Number} src
     * @param {Number} [dst]
     */
    setBlendFunc: function (src, dst) {
        return;
    },

    /**
     * Update will be called automatically every frame if "scheduleUpdate" is called when the node is "live".
     * @param {Number} dt Delta time since last update
     */
    update: function (dt) {
        this._skeleton.update(dt);
    }
});

cc.defineGetterSetter(sp.Skeleton.prototype, "opacityModifyRGB", sp.Skeleton.prototype.isOpacityModifyRGB);

// For renderer webgl to identify skeleton's default texture and blend function
cc.defineGetterSetter(sp.Skeleton.prototype, "_blendFunc", sp.Skeleton.prototype.getBlendFunc);
cc.defineGetterSetter(sp.Skeleton.prototype, '_texture', function () {
    return this._renderCmd._currTexture;
});

/**
 * Creates a skeleton object.
 * @deprecated since v3.0, please use new sp.Skeleton(skeletonDataFile, atlasFile, scale) instead.
 * @param {spine.SkeletonData|String} skeletonDataFile
 * @param {String|spine.Atlas|spine.SkeletonData} atlasFile atlas filename or atlas data or owns SkeletonData
 * @param {Number} [scale] scale can be specified on the JSON or binary loader which will scale the bone positions, image sizes, and animation translations.
 * @returns {sp.Skeleton}
 */
sp.Skeleton.create = function (skeletonDataFile, atlasFile/* or atlas*/, scale) {
    return new sp.Skeleton(skeletonDataFile, atlasFile, scale);
};
