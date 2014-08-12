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

var sp = sp || {};

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

sp.ATTACHMENT_TYPE = {
    REGION: 0,
    BOUNDING_BOX: 1,
    REGION_SEQUENCE: 2
};

sp.Skeleton = cc.Node.extend({
    _skeleton: null,
    _rootBone: null,
    _timeScale: 1,
    _debugSlots: false,
    _debugBones: false,
    _premultipliedAlpha: false,
    _ownsSkeletonData: null,
    _atlas: null,
    _blendFunc: null,
    ctor:function(){
        cc.Node.prototype.ctor.call(this);
        this._blendFunc = {src: cc.BLEND_SRC, dst: cc.BLEND_DST};
    },
    init: function () {
        cc.Node.prototype.init.call(this);
        this.setOpacityModifyRGB(true);
        this._blendFunc.src = cc.ONE;
        this._blendFunc.dst = cc.ONE_MINUS_SRC_ALPHA;
        if (cc._renderType === cc._RENDER_TYPE_WEBGL)
            this.setShaderProgram(cc.shaderCache.programForKey(cc.SHADER_POSITION_TEXTURECOLOR));
        this.scheduleUpdate();
    },
    setDebugSolots:function(v){
        this._debugSlots = v;
    },

    setDebugBones:function(v){
        this._debugBones = v;
    },

    setTimeScale:function(v){
        this._timeScale = v;
    },

    initWithArgs: function (/*multi arguments*/) {
        var argSkeletonFile = arguments[0], argAtlasFile = arguments[1],
            skeletonData, atlas, scale, ownsSkeletonData;

        if (typeof argSkeletonFile == 'string') {
            if (typeof argAtlasFile == 'string') {
                var data = cc.loader.getRes(argAtlasFile);
                sp._atlasLoader.setAtlasFile(argAtlasFile);
                atlas = new spine.Atlas(data, sp._atlasLoader);
            } else {
                atlas = arguments[1];
            }
            scale = arguments[2] || 1 / cc.director.getContentScaleFactor();

            var attachmentLoader = new spine.AtlasAttachmentLoader(atlas);
            var skeletonJsonReader = new spine.SkeletonJson(attachmentLoader);
            skeletonJsonReader.scale = scale;

            var skeletonJson = cc.loader.getRes(argSkeletonFile);
            skeletonData = skeletonJsonReader.readSkeletonData(skeletonJson);
            atlas.dispose(skeletonJsonReader);
            ownsSkeletonData = true;
        } else {
            skeletonData = arguments[0];
            ownsSkeletonData = arguments[1];
        }
        this.setSkeletonData(skeletonData, ownsSkeletonData);
        this.init();
    },

    boundingBox: function () {
        var minX = cc.FLT_MAX, minY = cc.FLT_MAX, maxX = cc.FLT_MIN, maxY = cc.FLT_MIN;
        var scaleX = this.getScaleX(), scaleY = this.getScaleY(), vertices = [],
            slots = this._skeleton.slots, VERTEX = sp.VERTEX_INDEX;

        for (var i = 0, slotCount = slots.length; i < slotCount; ++i) {
            var slot = slots[i];
            if (!slot.attachment || slot.attachment.type != sp.ATTACHMENT_TYPE.REGION)
                continue;
            var attachment = slot.attachment;
            sp.regionAttachment_computeWorldVertices(attachment, slot.skeleton.x, slot.skeleton.y, slot.bone, vertices);
            minX = Math.min(minX, vertices[VERTEX.X1] * scaleX, vertices[VERTEX.X4] * scaleX, vertices[VERTEX.X2] * scaleX, vertices[VERTEX.X3] * scaleX);
            minY = Math.min(minY, vertices[VERTEX.Y1] * scaleY, vertices[VERTEX.Y4] * scaleY, vertices[VERTEX.Y2] * scaleY, vertices[VERTEX.Y3] * scaleY);
            maxX = Math.max(maxX, vertices[VERTEX.X1] * scaleX, vertices[VERTEX.X4] * scaleX, vertices[VERTEX.X2] * scaleX, vertices[VERTEX.X3] * scaleX);
            maxY = Math.max(maxY, vertices[VERTEX.Y1] * scaleY, vertices[VERTEX.Y4] * scaleY, vertices[VERTEX.Y2] * scaleY, vertices[VERTEX.Y3] * scaleY);
        }
        var position = this.getPosition();
        return cc.rect(position.x + minX, position.y + minY, maxX - minX, maxY - minY);
    },
    updateWorldTransform: function () {
        this._skeleton.updateWorldTransform();
    },
    setToSetupPose: function () {
        this._skeleton.setToSetupPose();
    },
    setBonesToSetupPose: function () {
        this._skeleton.setBonesToSetupPose();
    },
    setSlotsToSetupPose: function () {
        this._skeleton.setSlotsToSetupPose();
    },
    findBone: function (boneName) {
        return this._skeleton.findBone(boneName);
    },
    findSlot: function (slotName) {
        return this._skeleton.findSlot(slotName);
    },
    setSkin: function (skinName) {
        return this._skeleton.setSkinByName(skinName);
    },
    getAttachment: function (slotName, attachmentName) {
        return this._skeleton.getAttachmentBySlotName(slotName, attachmentName);
    },
    setAttachment: function (slotName, attachmentName) {
        return this._skeleton.setAttachment(slotName, attachmentName);
    },
    setOpacityModifyRGB: function (v) {
        this._premultipliedAlpha = v;
    },
    isOpacityModifyRGB: function () {
        return this._premultipliedAlpha;
    },
    setSkeletonData: function (skeletonData, ownsSkeletonData) {
        this._skeleton = new spine.Skeleton(skeletonData);
        this._rootBone = this._skeleton.getRootBone();
        this._ownsSkeletonData = ownsSkeletonData;

        if (cc._renderType === cc._RENDER_TYPE_CANVAS) {
            var locSkeleton = this._skeleton, rendererObject, rect;
            for (var i = 0, n = locSkeleton.drawOrder.length; i < n; i++) {
                var slot = locSkeleton.drawOrder[i];
                var attachment = slot.attachment;
                if (!(attachment instanceof spine.RegionAttachment)) {
                    continue;
                }
                rendererObject = attachment.rendererObject;
                rect = cc.rect(rendererObject.x, rendererObject.y, rendererObject.width,rendererObject.height);
                var sprite = cc.Sprite.create(rendererObject.page._texture, rect, rendererObject.rotate);
                this.addChild(sprite,-1);
                slot.currentSprite = sprite;
            }
        }
    },

    getTextureAtlas: function (regionAttachment) {
        return regionAttachment.rendererObject.page.rendererObject;
    },
    getBlendFunc: function () {
        return this._blendFunc;
    },
    setBlendFunc: function (_blendFunc) {
        this._blendFunc = _blendFunc;
    },

    update: function (dt) {
        this._skeleton.update(dt);

        if (cc._renderType === cc._RENDER_TYPE_CANVAS) {
            var color = this.getColor(), locSkeleton = this._skeleton;
            locSkeleton.updateWorldTransform();
            var drawOrder = this._skeleton.drawOrder;
            for (var i = 0, n = drawOrder.length; i < n; i++) {
                var slot = drawOrder[i];
                var attachment = slot.attachment, selSprite = slot.currentSprite;
                if (!(attachment instanceof spine.RegionAttachment)) {
                    if(selSprite)
                        selSprite.setVisible(false);
                    continue;
                }
                if(!selSprite){
                    var rendererObject = attachment.rendererObject;
                    var rect = cc.rect(rendererObject.x, rendererObject.y, rendererObject.width,rendererObject.height);
                    var sprite = cc.Sprite.create(rendererObject.page._texture, rect, rendererObject.rotate);
                    this.addChild(sprite,-1);
                    slot.currentSprite = sprite;
                }
                selSprite.setVisible(true);
                //update color and blendFunc
                selSprite.setBlendFunc(cc.BLEND_SRC, slot.data.additiveBlending ? cc.ONE : cc.BLEND_DST);

                var bone = slot.bone;
                selSprite.setPosition(bone.worldX + attachment.x * bone.m00 + attachment.y * bone.m01,
                    bone.worldY + attachment.x * bone.m10 + attachment.y * bone.m11);
                selSprite.setScale(bone.worldScaleX, bone.worldScaleY);
                selSprite.setRotation(- (slot.bone.worldRotation + attachment.rotation));
            }
        }
    },

    draw: null,

    _drawForWebGL: function () {
        cc.nodeDrawSetup(this);
//        cc.glBlendFunc(this._blendFunc.src, this._blendFunc.dst);
        var color = this.getColor(), locSkeleton = this._skeleton;
        locSkeleton.r = color.r / 255;
        locSkeleton.g = color.g / 255;
        locSkeleton.b = color.b / 255;
        locSkeleton.a = this.getOpacity() / 255;
        if (this._premultipliedAlpha) {
            locSkeleton.r *= locSkeleton.a;
            locSkeleton.g *= locSkeleton.a;
            locSkeleton.b *= locSkeleton.a;
        }

        var additive,textureAtlas,attachment,slot, i, n,
            quad = new cc.V3F_C4B_T2F_Quad();
        var locBlendFunc = this._blendFunc;

        for (i = 0, n = locSkeleton.slots.length; i < n; i++) {
            slot = locSkeleton.drawOrder[i];
            if (!slot.attachment || slot.attachment.type != sp.ATTACHMENT_TYPE.REGION)
                continue;
            attachment = slot.attachment;
            var regionTextureAtlas = this.getTextureAtlas(attachment);

            if (slot.data.additiveBlending != additive) {
                if (textureAtlas) {
                    textureAtlas.drawQuads();
                    textureAtlas.removeAllQuads();
                }
                additive = !additive;
                cc.glBlendFunc(locBlendFunc.src, additive ? cc.ONE : locBlendFunc.dst);
            } else if (regionTextureAtlas != textureAtlas && textureAtlas) {
                textureAtlas.drawQuads();
                textureAtlas.removeAllQuads();
            }
            textureAtlas = regionTextureAtlas;

            var quadCount = textureAtlas.getTotalQuads();
            if (textureAtlas.getCapacity() == quadCount) {
                textureAtlas.drawQuads();
                textureAtlas.removeAllQuads();
                if (!textureAtlas.resizeCapacity(textureAtlas.getCapacity() * 2))
                    return;
            }

            sp._regionAttachment_updateQuad(attachment, slot, quad, this._premultipliedAlpha);
            textureAtlas.updateQuad(quad, quadCount);
        }

        if (textureAtlas) {
            textureAtlas.drawQuads();
            textureAtlas.removeAllQuads();
        }

        var drawingUtil = cc._drawingUtil;
        if (this._debugSlots) {
            // Slots.
            drawingUtil.setDrawColor(0, 0, 255, 255);
            drawingUtil.setLineWidth(1);

            for (i = 0, n = locSkeleton.slots.length; i < n; i++) {
                slot = locSkeleton.drawOrder[i];
                if (!slot.attachment || slot.attachment.type != sp.ATTACHMENT_TYPE.REGION)
                    continue;
                attachment = slot.attachment;
                quad = new cc.V3F_C4B_T2F_Quad();
                sp._regionAttachment_updateQuad(attachment, slot, quad);

                var points = [];
                points.push(cc.p(quad.bl.vertices.x, quad.bl.vertices.y));
                points.push(cc.p(quad.br.vertices.x, quad.br.vertices.y));
                points.push(cc.p(quad.tr.vertices.x, quad.tr.vertices.y));
                points.push(cc.p(quad.tl.vertices.x, quad.tl.vertices.y));
                drawingUtil.drawPoly(points, 4, true);
            }
        }

        if (this._debugBones) {
            // Bone lengths.
            var bone;
            drawingUtil.setLineWidth(2);
            drawingUtil.setDrawColor(255, 0, 0, 255);

            for (i = 0, n = locSkeleton.bones.length; i < n; i++) {
                bone = locSkeleton.bones[i];
                var x = bone.data.length * bone.m00 + bone.worldX;
                var y = bone.data.length * bone.m10 + bone.worldY;
                drawingUtil.drawLine(cc.p(bone.worldX, bone.worldY), cc.p(x, y));
            }

            // Bone origins.
            drawingUtil.setPointSize(4);
            drawingUtil.setDrawColor(0, 0, 255, 255); // Root bone is blue.

            for (i = 0, n = locSkeleton.bones.length; i < n; i++) {
                bone = locSkeleton.bones[i];
                drawingUtil.drawPoint(cc.p(bone.worldX, bone.worldY));
                if (i == 0) {
                    drawingUtil.setDrawColor(0, 255, 0, 255);
                }
            }
        }
    },

    _drawForCanvas: function () {
        if(!this._debugSlots && !this._debugBones){
            return;
        }
        var locSkeleton = this._skeleton;
        var attachment,slot, i, n, drawingUtil = cc._drawingUtil;
        if (this._debugSlots) {
            // Slots.
            drawingUtil.setDrawColor(0, 0, 255, 255);
            drawingUtil.setLineWidth(1);

            var points = [];
            for (i = 0, n = locSkeleton.slots.length; i < n; i++) {
                slot = locSkeleton.drawOrder[i];
                if (!slot.attachment || slot.attachment.type != sp.ATTACHMENT_TYPE.REGION)
                    continue;
                attachment = slot.attachment;
                sp._regionAttachment_updateSlotForCanvas(attachment, slot, points);
                drawingUtil.drawPoly(points, 4, true);
            }
        }

        if (this._debugBones) {
            // Bone lengths.
            var bone;
            drawingUtil.setLineWidth(2);
            drawingUtil.setDrawColor(255, 0, 0, 255);

            for (i = 0, n = locSkeleton.bones.length; i < n; i++) {
                bone = locSkeleton.bones[i];
                var x = bone.data.length * bone.m00 + bone.worldX;
                var y = bone.data.length * bone.m10 + bone.worldY;
                drawingUtil.drawLine(cc.p(bone.worldX, bone.worldY), cc.p(x, y));
            }

            // Bone origins.
            drawingUtil.setPointSize(4);
            drawingUtil.setDrawColor(0, 0, 255, 255); // Root bone is blue.

            for (i = 0, n = locSkeleton.bones.length; i < n; i++) {
                bone = locSkeleton.bones[i];
                drawingUtil.drawPoint(cc.p(bone.worldX, bone.worldY));
                if (i === 0)
                    drawingUtil.setDrawColor(0, 255, 0, 255);
            }
        }
    }
});

if (cc._renderType === cc._RENDER_TYPE_WEBGL) {
    sp.Skeleton.prototype.draw = sp.Skeleton.prototype._drawForWebGL;
}else{
    sp.Skeleton.prototype.draw = sp.Skeleton.prototype._drawForCanvas;
}

sp.Skeleton.createWithData = function (skeletonData, ownsSkeletonData) {
    var c = new sp.Skeleton();
    c.initWithArgs.apply(c, arguments);
    return c;
};

sp.Skeleton.create = function (skeletonDataFile, atlasFile/* or atlas*/, scale) {
    var c = new sp.Skeleton();
    c.initWithArgs.apply(c, arguments);
    return c;
};