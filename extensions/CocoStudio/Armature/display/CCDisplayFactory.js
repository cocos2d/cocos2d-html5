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

ccs.DisplayFactory = ccs.DisplayFactory || ccs.Class.extend({});
ccs.DisplayFactory.addDisplay = function (bone, decoDisplay, displayData) {
    switch (displayData.displayType) {
        case ccs.DisplayType.sprite:
            this.addSpriteDisplay(bone, decoDisplay, displayData);
            break;
        case  ccs.DisplayType.particle:
            this.addParticleDisplay(bone, decoDisplay, displayData);
            break;
        case  ccs.DisplayType.armature:
            this.addArmatureDisplay(bone, decoDisplay, displayData);
            break;
        default:
            break;
    }
};
ccs.DisplayFactory.createDisplay = function (bone, decoDisplay) {
    switch (decoDisplay.getDisplayData().displayType) {
        case ccs.DisplayType.sprite:
            this.createSpriteDisplay(bone, decoDisplay);
            break;
        case ccs.DisplayType.particle:
            this.createParticleDisplay(bone, decoDisplay);
            break;
        case ccs.DisplayType.armature:
            this.createArmatureDisplay(bone, decoDisplay);
            break;
        default:
            break;
    }
};
ccs.DisplayFactory._helpTransform =  {a:1, b:0, c:0, d:1, tx:0, ty:0};
ccs.DisplayFactory.updateDisplay = function (bone,dt, dirty) {
    var display = bone.getDisplayRenderNode();
    if(!display)
        return;

    switch (bone.getDisplayRenderNodeType()) {
        case ccs.DisplayType.sprite:
            if (dirty){
                display.updateArmatureTransform();
            }
            break;
        case ccs.DisplayType.particle:
            this.updateParticleDisplay(bone, display, dt);
            break;
        case ccs.DisplayType.armature:
            this.updateArmatureDisplay(bone, display, dt);
            break;
        default:
            display.setAdditionalTransform(bone.nodeToArmatureTransform());
            break;
    }

    if (ccs.ENABLE_PHYSICS_CHIPMUNK_DETECT || ccs.ENABLE_PHYSICS_SAVE_CALCULATED_VERTEX) {
        if (dirty) {
            var decoDisplay = bone.getDisplayManager().getCurrentDecorativeDisplay();
            var detector = decoDisplay.getColliderDetector();
            if (detector) {
                var node = decoDisplay.getDisplay();
                var displayTransform = node.nodeToParentTransform();
                var helpTransform = this._helpTransform;
                helpTransform.a = displayTransform.a;
                helpTransform.b = displayTransform.b;
                helpTransform.c = displayTransform.c;
                helpTransform.d = displayTransform.d;
                helpTransform.tx = displayTransform.tx;
                helpTransform.ty = displayTransform.ty;
                var anchorPoint =  node.getAnchorPointInPoints();
                anchorPoint = cc.PointApplyAffineTransform(anchorPoint, helpTransform);
                helpTransform.tx = anchorPoint.x;
                helpTransform.ty = anchorPoint.y;
                var t = cc.AffineTransformConcat(helpTransform, bone.getArmature().nodeToParentTransform());
                detector.updateTransform(t);
            }
        }
    }

};
ccs.DisplayFactory.addSpriteDisplay = function (bone, decoDisplay, displayData) {
    var sdp = new ccs.SpriteDisplayData();
    sdp.copy(displayData);
    decoDisplay.setDisplayData(sdp);
    this.createSpriteDisplay(bone, decoDisplay);
};

ccs.DisplayFactory.createSpriteDisplay = function (bone, decoDisplay) {
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
        skin = ccs.Skin.create();
    }
    else {
        skin = ccs.Skin.createWithSpriteFrameName(textureName + ".png");
    }
    decoDisplay.setDisplay(skin);
    skin.setBone(bone);
    this.initSpriteDisplay(bone, decoDisplay, displayData.displayName, skin);
    var armature = bone.getArmature();
    if (armature) {
        if (armature.getArmatureData().dataVersion >= ccs.CONST_VERSION_COMBINED)
            skin.setSkinData(displayData.skinData);
        else
            skin.setSkinData(bone.getBoneData());
    }


};

ccs.DisplayFactory.initSpriteDisplay = function(bone, decoDisplay, displayName, skin){
    var textureName = displayName;
    var startPos = textureName.lastIndexOf(".");
    if (startPos != -1) {
        textureName = textureName.substring(0, startPos);
    }
    var textureData = ccs.ArmatureDataManager.getInstance().getTextureData(textureName);
    if (textureData) {
        //! Init display anchorPoint, every Texture have a anchor point
        skin.setAnchorPoint(textureData.pivotX, textureData.pivotY);
    }
    if (ccs.ENABLE_PHYSICS_CHIPMUNK_DETECT || ccs.ENABLE_PHYSICS_SAVE_CALCULATED_VERTEX) {
        if (textureData && textureData.contourDataList.length > 0)        {
            var colliderDetector = ccs.ColliderDetector.create(bone);
            colliderDetector.addContourDataList(textureData.contourDataList);
            decoDisplay.setColliderDetector(colliderDetector);
        }
    }
};

ccs.DisplayFactory.addArmatureDisplay = function (bone, decoDisplay, displayData) {
    var adp = new ccs.ArmatureDisplayData();
    adp.copy(displayData);
    decoDisplay.setDisplayData(adp);

    this.createArmatureDisplay(bone, decoDisplay);
};
ccs.DisplayFactory.createArmatureDisplay = function (bone, decoDisplay) {
    var displayData = decoDisplay.getDisplayData();
    var armature = ccs.Armature.create(displayData.displayName, bone);
    decoDisplay.setDisplay(armature);
};
ccs.DisplayFactory.updateArmatureDisplay = function (bone, armature, dt) {
    if (armature) {
        armature.sortAllChildren();
        armature.update(dt);
    }
};

ccs.DisplayFactory.addParticleDisplay = function (bone, decoDisplay, displayData) {
    var adp = new ccs.ParticleDisplayData();
    adp.copy(displayData);
    decoDisplay.setDisplayData(adp);
    this.createParticleDisplay(bone, decoDisplay);
};
ccs.DisplayFactory.createParticleDisplay = function (bone, decoDisplay) {
    var displayData = decoDisplay.getDisplayData();
    var system = cc.ParticleSystem.create(displayData.displayName);
    var armature = bone.getArmature();
    if (armature)    {
        system.setParent(bone.getArmature());
    }
    decoDisplay.setDisplay(system);
};
ccs.DisplayFactory.updateParticleDisplay = function (bone, particleSystem, dt) {
    var node = new ccs.BaseData();
    ccs.TransformHelp.matrixToNode(bone.nodeToArmatureTransform(), node);
    particleSystem.setPosition(node.x, node.y);
    particleSystem.setScaleX(node.scaleX);
    particleSystem.setScaleY(node.scaleY);
    particleSystem.update(dt);
};
