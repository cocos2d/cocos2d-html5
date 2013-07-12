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

cc.DisplayFactory = cc.DisplayFactory || {};
cc.DisplayFactory.addDisplay = function (bone, decoDisplay, displayData) {
    switch (displayData.displayType) {
        case CC_DISPLAY_SPRITE:
            this.addSpriteDisplay(bone, decoDisplay, displayData);
            break;
        case  CC_DISPLAY_PARTICLE:
            this.addParticleDisplay(bone, decoDisplay, displayData);
            break;
        case  CC_DISPLAY_ARMATURE:
            this.addArmatureDisplay(bone, decoDisplay, displayData);
            break;
        default:
            break;
    }
};
cc.DisplayFactory.createDisplay = function (bone, decoDisplay) {
    switch (decoDisplay.getDisplayData().displayType) {
        case CC_DISPLAY_SPRITE:
            this.createSpriteDisplay(bone, decoDisplay);
            break;
        case CC_DISPLAY_PARTICLE:
            this.createParticleDisplay(bone, decoDisplay);
            break;
        case CC_DISPLAY_ARMATURE:
            this.createArmatureDisplay(bone, decoDisplay);
            break;
        default:
            break;
    }
};

cc.DisplayFactory.updateDisplay = function (bone, decoDisplay, dt, dirty) {
    if (!decoDisplay) {
        return;
    }

    if (ENABLE_PHYSICS_DETECT) {
        if (dirty) {
            var detector = decoDisplay.getColliderDetector();
            if (detector) {
                var t = cc.AffineTransformConcat(bone.nodeToArmatureTransform(), bone.getArmature().nodeToWorldTransform());
                detector.updateTransform(t);
            }
        }
    }

    switch (decoDisplay.getDisplayData().displayType) {
        case CC_DISPLAY_SPRITE:
            this.updateSpriteDisplay(bone, decoDisplay, dt, dirty);
            break;
        case CC_DISPLAY_PARTICLE:
            this.updateParticleDisplay(bone, decoDisplay, dt, dirty);
            break;
        case CC_DISPLAY_ARMATURE:
            this.updateArmatureDisplay(bone, decoDisplay, dt, dirty);
            break;
        default:
            break;
    }
};
cc.DisplayFactory.addSpriteDisplay = function (bone, decoDisplay, displayData) {
    var sdp = new cc.SpriteDisplayData();
    sdp.copy(displayData);
    decoDisplay.setDisplayData(sdp);
    this.createSpriteDisplay(bone, decoDisplay);
};

cc.DisplayFactory.createSpriteDisplay = function (bone, decoDisplay) {
    var skin = null;
    var displayData = decoDisplay.getDisplayData();
    //! remove .xxx
    var textureName = displayData.displayName;
    var startPos = textureName.lastIndexOf(".");
    if (startPos != -1) {
        textureName = textureName.substring(0, startPos);
    }
    //! create display
    if (textureName == "") {
        skin = cc.Skin.create();
    }
    else {
        skin = cc.Skin.createWithSpriteFrameName(textureName + ".png");
    }
    /*var atlas = cc.SpriteFrameCacheHelper.getInstance().getTextureAtlas(textureName + ".png");
     skin.setTextureAtlas(atlas);*/
    //todo
    /*var batchNode = cc.SpriteFrameCacheHelper.getInstance().getBatchNode(textureName + ".png");

    skin.setBatchNode(batchNode);
    skin.setTextureAtlas(batchNode.getTextureAtlas());*/

    var textureData = cc.ArmatureDataManager.getInstance().getTextureData(textureName);
    if (textureData) {
        //! Init display anchorPoint, every Texture have a anchor point
        skin.setAnchorPoint(cc.p(textureData.pivotX, textureData.pivotY));
    }
    skin.setBone(bone);
    skin.setSkinData(bone.getBoneData());
    decoDisplay.setDisplay(skin);

    if (ENABLE_PHYSICS_DETECT) {
        if (textureData && textureData.contourDataList.count() > 0) {

            //! create ContourSprite
            var colliderDetector = cc.ColliderDetector.create(bone);
            colliderDetector.addContourDataList(textureData.contourDataList);
            decoDisplay.setColliderDetector(colliderDetector);
        }
    }
};

cc.DisplayFactory.updateSpriteDisplay = function (bone, decoDisplay, dt, dirty) {
    var skin = decoDisplay.getDisplay();
    skin.updateSelfTransform();
};


cc.DisplayFactory.addArmatureDisplay = function (bone, decoDisplay, displayData) {
    var adp = new cc.ArmatureDisplayData();
    adp.copy(displayData);
    decoDisplay.setDisplayData(adp);

    this.createArmatureDisplay(bone, decoDisplay);
};
cc.DisplayFactory.createArmatureDisplay = function (bone, decoDisplay) {
    var displayData = decoDisplay.getDisplayData();
    var armature = cc.Armature.create(displayData.displayName, bone);
    /*
     *  because this bone have called this name, so armature should change it's name, or it can't add to
     *  CCArmature's bone children.
     */
    armature.setName(bone.getName() + "_armatureChild");
    decoDisplay.setDisplay(armature);
};
cc.DisplayFactory.updateArmatureDisplay = function (bone, decoDisplay, dt, dirty) {
    if (!dirty) {
        return;
    }
    var armature = bone.getChildArmature();
    if (armature) {
        armature.sortAllChildren();
        armature.update(dt);
    }
};

cc.DisplayFactory.addParticleDisplay = function (bone, decoDisplay, displayData) {
    var adp = new cc.ParticleDisplayData();
    adp.copy(displayData);
    decoDisplay.setDisplayData(adp);
    this.createParticleDisplay(bone, decoDisplay);
};
cc.DisplayFactory.createParticleDisplay = function (bone, decoDisplay) {
    var displayData = decoDisplay.getDisplayData();
    var system = cc.ParticleSystemQuad.create(displayData.plist);
    decoDisplay.setDisplay(system);
};
cc.DisplayFactory.updateParticleDisplay = function (bone, decoDisplay, dt, dirty) {
    var system = decoDisplay.getDisplay();
    var node = new cc.BaseData();
    cc.TransformHelp.matrixToNode(bone.nodeToArmatureTransform(), node);
    system.setPosition(cc.p(node.x, node.y));
    system.setScaleX(node.scaleX);
    system.setScaleY(node.scaleY);
    system.update(dt);
};

cc.DisplayFactory.addShaderDisplay = function (bone, decoDisplay, displayData) {
    var sdp = new cc.ShaderDisplayData();
    sdp.copy(displayData);
    decoDisplay.setDisplayData(sdp);
    this.createShaderDisplay(bone, decoDisplay);
};
cc.DisplayFactory.createShaderDisplay = function (bone, decoDisplay) {
    var displayData = decoDisplay.getDisplayData();
    var sn = cc.ShaderNode.shaderNodeWithVertex(displayData.vert, displayData.frag);
    decoDisplay.setDisplay(sn);
};
