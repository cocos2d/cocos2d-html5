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

cc.CONST_VERSION = "version";
cc.CONST_VERSION_2_0 = 2.0;

cc.CONST_SKELETON = "skeleton";
cc.CONST_ARMATURES = "armatures";
cc.CONST_ARMATURE = "armature";
cc.CONST_BONE = "b";
cc.CONST_DISPLAY = "d";

cc.CONST_ANIMATIONS = "animations";
cc.CONST_ANIMATION = "animation";
cc.CONST_MOVEMENT = "mov";
cc.CONST_FRAME = "f";

cc.CONST_TEXTURE_ATLAS = "TextureAtlas";
cc.CONST_SUB_TEXTURE = "SubTexture";

cc.CONST_A_NAME = "name";
cc.CONST_A_DURATION = "dr";
cc.CONST_A_DURATION_TO = "to";
cc.CONST_A_DURATION_TWEEN = "drTW";
cc.CONST_A_LOOP = "lp";
cc.CONST_A_MOVEMENT_SCALE = "sc";
cc.CONST_A_MOVEMENT_DELAY = "dl";
cc.CONST_A_DISPLAY_INDEX = "dI";

cc.CONST_A_VERT = "vert";
cc.CONST_A_FRAG = "frag";
cc.CONST_A_PLIST = "plist";

cc.CONST_A_PARENT = "parent";
cc.CONST_A_SKEW_X = "kX";
cc.CONST_A_SKEW_Y = "kY";
cc.CONST_A_SCALE_X = "cX";
cc.CONST_A_SCALE_Y = "cY";
cc.CONST_A_Z = "z";
cc.CONST_A_EVENT = "evt";
cc.CONST_A_SOUND = "sd";
cc.CONST_A_SOUND_EFFECT = "sdE";
cc.CONST_A_TWEEN_EASING = "twE";
cc.CONST_A_TWEEN_ROTATE = "twR";
cc.CONST_A_IS_ARMATURE = "isArmature";
cc.CONST_A_DISPLAY_TYPE = "displayType";
cc.CONST_A_MOVEMENT = "mov";

cc.CONST_A_X = "x";
cc.CONST_A_Y = "y";

cc.CONST_A_COCOS2DX_X = "cocos2d_x";
cc.CONST_A_COCOS2DX_Y = "cocos2d_y";

cc.CONST_A_WIDTH = "width";
cc.CONST_A_HEIGHT = "height";
cc.CONST_A_PIVOT_X = "pX";
cc.CONST_A_PIVOT_Y = "pY";

cc.CONST_A_COCOS2D_PIVOT_X = "cocos2d_pX";
cc.CONST_A_COCOS2D_PIVOT_Y = "cocos2d_pY";

cc.CONST_A_ALPHA = "a";
cc.CONST_A_RED = "r";
cc.CONST_A_GREEN = "g";
cc.CONST_A_BLUE = "b";
cc.CONST_A_ALPHA_OFFSET = "aM";
cc.CONST_A_RED_OFFSET = "rM";
cc.CONST_A_GREEN_OFFSET = "gM";
cc.CONST_A_BLUE_OFFSET = "bM";
cc.CONST_A_COLOR_TRANSFORM = "colorTransform";
cc.CONST_A_ROTATION = "rotation";
cc.CONST_A_USE_COLOR_INFO = "uci";

cc.CONST_CONTOUR = "con";
cc.CONST_CONTOUR_VERTEX = "con_vt";

cc.CONST_MOVEMENT_EVENT_FRAME = "movementEventFrame";
cc.CONST_SOUND_FRAME = "soundFrame";

cc.CONST_FL_NAN = "NaN";

cc.CONST_FRAME_DATA = "frame_data";
cc.CONST_MOVEMENT_BONE_DATA = "mov_bone_data";
cc.CONST_MOVEMENT_FRAME_DATA = "mov_frame_data";
cc.CONST_MOVEMENT_DATA = "mov_data";
cc.CONST_ANIMATION_DATA = "animation_data";
cc.CONST_DISPLAY_DATA = "display_data";
cc.CONST_BONE_DATA = "bone_data";
cc.CONST_ARMATURE_DATA = "armature_data";
cc.CONST_CONTOUR_DATA = "contour_data";
cc.CONST_TEXTURE_DATA = "texture_data";
cc.CONST_VERTEX_POINT = "vertex";
cc.CONST_COLOR_INFO = "color";


cc.DataReaderHelper = cc.DataReaderHelper || {};
cc.DataReaderHelper._configFileList = [];
cc.DataReaderHelper._flashToolVersion = cc.CONST_VERSION_2_0;
cc.DataReaderHelper._XMLFileList = [];
cc.DataReaderHelper._armarureDatas = {};
cc.DataReaderHelper._animationDatas = {};
cc.DataReaderHelper._textureDatas = {};
cc.DataReaderHelper._json = {};
cc.DataReaderHelper._positionReadScale = 1;

cc.DataReaderHelper.setPositionReadScale = function (scale) {
    this._positionReadScale = scale;
};

cc.DataReaderHelper.getPositionReadScale = function () {
    return this._positionReadScale;
};

cc.DataReaderHelper.clear = function () {
    this._configFileList = [];
};

cc.DataReaderHelper.addDataFromFile = function (filePath) {
    if (cc.ArrayAppendObject(this._configFileList, filePath)) {
        return;
    }
    this._configFileList.push(filePath);

    var startPos = filePath.lastIndexOf(".");
    var str = filePath.substring(startPos, filePath.length);

    if (str == ".xml") {
        this.addDataFromXML(filePath);
    }
    else if (str == ".json" || str == ".ExportJson") {
        this.addDataFromJson(filePath);
    }
};
cc.DataReaderHelper.addDataFromXML = function (xml) {
    /*
     *  Need to get the full path of the xml file, or the Tiny XML can't find the xml at IOS
     */
    var skeletonXML = cc.SAXParser.getInstance().tmxParse(xml);
    var skeleton = skeletonXML.documentElement;
    if (skeleton) {
        this.addDataFromCache(skeleton);
    }
};

cc.DataReaderHelper.addDataFromCache = function (skeleton) {
    if (!skeleton) {
        cc.log("XML error  or  XML is empty.");
        return;
    }
    this._flashToolVersion = parseFloat(skeleton.getAttribute(cc.CONST_VERSION));
    var _armaturesXML = skeleton.querySelectorAll(cc.CONST_SKELETON + " > " + cc.CONST_ARMATURES + " >  " + cc.CONST_ARMATURE + "");
    var armatureDataManager = cc.ArmatureDataManager.getInstance();
    for (var i = 0; i < _armaturesXML.length; i++) {
        var armatureData = this.decodeArmature(_armaturesXML[i]);
        armatureDataManager.addArmatureData(armatureData.name, armatureData);
    }

    var _animationsXML = skeleton.querySelectorAll(cc.CONST_SKELETON + " > " + cc.CONST_ANIMATIONS + " >  " + cc.CONST_ANIMATION + "");
    for (var i = 0; i < _animationsXML.length; i++) {
        var animationData = this.decodeAnimation(_animationsXML[i]);
        armatureDataManager.addAnimationData(animationData.name, animationData);
    }

    var _texturesXML = skeleton.querySelectorAll(cc.CONST_SKELETON + " > " + cc.CONST_TEXTURE_ATLAS + " >  " + cc.CONST_SUB_TEXTURE + "");
    for (var i = 0; i < _texturesXML.length; i++) {
        var textureData = this.decodeTexture(_texturesXML[i]);
        armatureDataManager.addTextureData(textureData.name, textureData);
    }
    skeleton = null;
};

cc.DataReaderHelper.decodeArmature = function (armatureXML) {
    var name = armatureXML.getAttribute(cc.CONST_A_NAME);
    var armatureData = new cc.ArmatureData();
    armatureData.name = name;

    var bonesXML = armatureXML.querySelectorAll(cc.CONST_ARMATURE + " > " + cc.CONST_BONE);

    for (var i = 0; i < bonesXML.length; i++) {
        var boneXML = bonesXML[i];
        var parentName = boneXML.getAttribute(cc.CONST_A_PARENT);
        var parentXML = null;
        if (parentName) {
            //parentXML = armatureXML.querySelectorAll(cc.CONST_ARMATURE+" > "+cc.CONST_BONE);
            for (var j = 0; j < bonesXML.length; j++) {
                parentXML = bonesXML[j];
                if (parentName == bonesXML[j].getAttribute(cc.CONST_A_NAME)) {
                    //todo
                    break;
                }
            }
        }
        var boneData = this.decodeBone(boneXML, parentXML);
        armatureData.addBoneData(boneData);
    }
    return armatureData;
};

cc.DataReaderHelper.decodeBone = function (_boneXML, parentXML) {

    var _name = _boneXML.getAttribute(cc.CONST_A_NAME);
    if (_name == "") {
        return;
    }
    var boneData = new cc.BoneData();

    boneData.name = _name;

    boneData.parentName = _boneXML.getAttribute(cc.CONST_A_PARENT) || "";

    var _displaysXML = _boneXML.querySelectorAll(cc.CONST_BONE + " > " + cc.CONST_DISPLAY);

    var _displayXML
    for (var i = 0; i < _displaysXML.length; i++) {
        _displayXML = _displaysXML[i];
        var displayData = this.decodeBoneDisplay(_displayXML, boneData);
        boneData.addDisplayData(displayData);

    }
    return boneData;
};

cc.DataReaderHelper.decodeBoneDisplay = function (_displayXML) {
    var _isArmature = parseFloat(_displayXML.getAttribute(cc.CONST_A_IS_ARMATURE)) || 0;

    var _displayData = null;

    if (_isArmature == 1) {
        _displayData = new cc.ArmatureDisplayData();
        _displayData.displayType = CC_DISPLAY_ARMATURE;
    }
    else {
        _displayData = new cc.SpriteDisplayData();
        _displayData.displayType = CC_DISPLAY_SPRITE;
    }
    var displayName = _displayXML.getAttribute(cc.CONST_A_NAME) || "";
    if (displayName) {
        _displayData.displayName = displayName;
    }
    return _displayData;
};


cc.DataReaderHelper.decodeAnimation = function (_animationXML) {
    var name = _animationXML.getAttribute(cc.CONST_A_NAME);
    var aniData = this._animationDatas[name];
    if (aniData) {
        return;
    }
    aniData = new cc.AnimationData();
    var _armatureData = cc.ArmatureDataManager.getInstance().getArmatureData(name);
    aniData.name = name;

    var movementsXML = _animationXML.querySelectorAll(cc.CONST_ANIMATION + " > " + cc.CONST_MOVEMENT);
    var movementXML = null;
    for (var i = 0; i < movementsXML.length; i++) {
        movementXML = movementsXML[i];
        var movementData = this.decodeMovement(movementXML, _armatureData);
        aniData.addMovement(movementData);
    }
    return aniData;
};

cc.DataReaderHelper.decodeMovement = function (movementXML, _armatureData) {
    var movName = movementXML.getAttribute(cc.CONST_A_NAME);
    var movementData = new cc.MovementData();
    movementData.name = movName;
    var duration, durationTo, durationTween, loop = 0, tweenEasing = 0;

    duration = parseFloat(movementXML.getAttribute(cc.CONST_A_DURATION)) || 0;
    movementData.duration = duration;

    durationTo = parseFloat(movementXML.getAttribute(cc.CONST_A_DURATION_TO)) || 0;
    movementData.durationTo = durationTo;

    durationTween = parseFloat(movementXML.getAttribute(cc.CONST_A_DURATION_TWEEN)) || 0;
    movementData.durationTween = durationTween;

    loop = parseFloat(movementXML.getAttribute(cc.CONST_A_LOOP)) || 0;
    movementData.loop = Boolean(loop);

    var easing = movementXML.getAttribute(cc.CONST_A_TWEEN_EASING);
    if (easing) {
        if (easing != cc.CONST_FL_NAN) {
            tweenEasing = parseFloat(movementXML.getAttribute(cc.CONST_A_TWEEN_EASING)) || 0;
            movementData.tweenEasing = tweenEasing;
        } else {
            movementData.tweenEasing = cc.TWEEN_EASING_MAX;
        }
    }

    var movBonesXml = movementXML.querySelectorAll(cc.CONST_MOVEMENT + " > " + cc.CONST_BONE);
    var movBoneXml = null;
    for (var i = 0; i < movBonesXml.length; i++) {
        movBoneXml = movBonesXml[i];
        var boneName = movBoneXml.getAttribute(cc.CONST_A_NAME);

        if (movementData.getMovementBoneData(boneName)) {
            continue;
        }

        // var _armatureData = this._armarureDatas[_aniData.getName()];
        var boneData = _armatureData.getBoneData(boneName);
        var parentName = boneData.parentName;

        var parentXML = null;
        if (parentName != "") {
            for (var j = 0; j < movBonesXml.length; j++) {
                parentXML = movBonesXml[j];
                if (parentName == parentXML.getAttribute(cc.CONST_A_NAME)) {
                    break;
                }
            }
        }
        var moveBoneData = this.decodeMovementBone(movBoneXml, parentXML, boneData);
        movementData.addMovementBoneData(moveBoneData);
    }
    return movementData;
};

cc.DataReaderHelper.decodeMovementBone = function (movBoneXml, parentXml, boneData) {
    var movBoneData = new cc.MovementBoneData();
    var scale, delay;

    if (movBoneXml) {
        scale = parseFloat(movBoneXml.getAttribute(cc.CONST_A_MOVEMENT_SCALE)) || 0;
        movBoneData.scale = scale;

        delay = parseFloat(movBoneXml.getAttribute(cc.CONST_A_MOVEMENT_DELAY)) || 0;
        if (delay > 0) {
            delay -= 1;
        }
        movBoneData.delay = delay;
    }

    var length = 0;
    var parentTotalDuration = 0;
    var currentDuration = 0;
    var parentFrameXML = null;
    var parentXMLList = [];

    //*  get the parent frame xml list, we need get the origin data
    if (parentXml != null) {
        var parentFramesXML = parentXml.querySelectorAll(cc.CONST_BONE + " > " + cc.CONST_FRAME);
        for (var i = 0; i < parentFramesXML.length; i++) {
            parentXMLList.push(parentFramesXML[i]);
        }
        length = parentXMLList.length;
    }


    var totalDuration = 0;

    var name = movBoneXml.getAttribute(cc.CONST_A_NAME);
    movBoneData.name = name;
    var framesXML = movBoneXml.querySelectorAll(cc.CONST_BONE + " > " + cc.CONST_FRAME);
    var j = 0;
    for (var ii = 0; ii < framesXML.length; ii++) {
        var frameXML = framesXML[ii];
        if (parentXml) {
            //*  in this loop we get the corresponding parent frame xml
            while (j < length && (parentFrameXML ? (totalDuration < parentTotalDuration || totalDuration >= parentTotalDuration + currentDuration) : true)) {
                parentFrameXML = parentXMLList[j];
                parentTotalDuration += currentDuration;
                currentDuration = parseFloat(parentFrameXML.getAttribute(cc.CONST_A_DURATION));
                j++;
            }
        }
        var frameData = this.decodeFrame(frameXML, parentFrameXML, boneData, movBoneData);
        movBoneData.addFrameData(frameData);
        totalDuration += frameData.duration;
    }

    return movBoneData;
};

cc.DataReaderHelper.decodeFrame = function (frameXML, parentFrameXml, boneData, movBoneData) {
    var frameData = new cc.FrameData();
    frameData.movement = frameXML.getAttribute(cc.CONST_A_MOVEMENT) || "";
    frameData.event = frameXML.getAttribute(cc.CONST_A_EVENT) || "";
    frameData.sound = frameXML.getAttribute(cc.CONST_A_SOUND) || "";
    frameData.soundEffect = frameXML.getAttribute(cc.CONST_A_SOUND_EFFECT) || "";

    if (this._flashToolVersion >= cc.CONST_VERSION_2_0) {
        frameData.x = parseFloat(frameXML.getAttribute(cc.CONST_A_COCOS2DX_X)) || 0;
        frameData.y = -parseFloat(frameXML.getAttribute(cc.CONST_A_COCOS2DX_Y)) || 0;
    }
    else {
        frameData.x = parseFloat(frameXML.getAttribute(cc.CONST_A_X)) || 0;
        frameData.y = -parseFloat(frameXML.getAttribute(cc.CONST_A_Y)) || 0;
    }
    frameData.x *= this._positionReadScale;
    frameData.y *= this._positionReadScale;
    frameData.scaleX = parseFloat(frameXML.getAttribute(cc.CONST_A_SCALE_X)) || 0;
    frameData.scaleY = parseFloat(frameXML.getAttribute(cc.CONST_A_SCALE_Y)) || 0;
    frameData.skewX = cc.DEGREES_TO_RADIANS(parseFloat(frameXML.getAttribute(cc.CONST_A_SKEW_X)) || 0);
    frameData.skewY = cc.DEGREES_TO_RADIANS(-parseFloat(frameXML.getAttribute(cc.CONST_A_SKEW_Y)) || 0);
    frameData.duration = parseFloat(frameXML.getAttribute(cc.CONST_A_DURATION)) || 0;
    frameData.displayIndex = parseFloat(frameXML.getAttribute(cc.CONST_A_DISPLAY_INDEX)) || 0;
    frameData.zOrder = parseFloat(frameXML.getAttribute(cc.CONST_A_Z)) || 0;

    var colorTransformXMLList = frameXML.querySelectorAll(cc.CONST_FRAME + " > " + cc.CONST_A_COLOR_TRANSFORM);
    if (colorTransformXMLList.length > 0) {
        var colorTransformXML = colorTransformXMLList[0];
        var alpha, red, green, blue = 100;
        var alphaOffset, redOffset, greenOffset, blueOffset = 0;

        alpha = parseFloat(colorTransformXML.getAttribute(cc.CONST_A_ALPHA)) || alpha;
        red = parseFloat(colorTransformXML.getAttribute(cc.CONST_A_RED)) || red;
        green = parseFloat(colorTransformXML.getAttribute(cc.CONST_A_GREEN)) || green;
        blue = parseFloat(colorTransformXML.getAttribute(cc.CONST_A_BLUE)) || blue;

        alphaOffset = parseFloat(colorTransformXML.getAttribute(cc.CONST_A_ALPHA_OFFSET)) || alphaOffset;
        redOffset = parseFloat(colorTransformXML.getAttribute(cc.CONST_A_RED_OFFSET)) || redOffset;
        greenOffset = parseFloat(colorTransformXML.getAttribute(cc.CONST_A_GREEN_OFFSET)) || greenOffset;
        blueOffset = parseFloat(colorTransformXML.getAttribute(cc.CONST_A_BLUE_OFFSET)) || blueOffset;

        frameData.a = 2.55 * alphaOffset + alpha;
        frameData.r = 2.55 * redOffset + red;
        frameData.g = 2.55 * greenOffset + green;
        frameData.b = 2.55 * blueOffset + blue;

        frameData.isUseColorInfo = true;
    }

    var easing = frameXML.getAttribute(cc.CONST_A_TWEEN_EASING);
    if (easing) {
        if (easing != cc.CONST_FL_NAN) {
            frameData.tweenEasing = parseFloat(frameXML.getAttribute(cc.CONST_A_TWEEN_EASING)) || 0;
        } else {
            frameData.tweenEasing = cc.TWEEN_EASING_MAX;
        }
    }

    if (parentFrameXml) {
        //*  recalculate frame data from parent frame data, use for translate matrix
        var helpNode = new cc.BaseData();
        if (this._flashToolVersion >= cc.CONST_VERSION_2_0) {
            helpNode.x = parseFloat(parentFrameXml.getAttribute(cc.CONST_A_COCOS2DX_X)) || 0;
            helpNode.y = parseFloat(parentFrameXml.getAttribute(cc.CONST_A_COCOS2DX_Y)) || 0;
        }
        else {
            helpNode.x = parseFloat(parentFrameXml.getAttribute(cc.CONST_A_X)) || 0;
            helpNode.y = parseFloat(parentFrameXml.getAttribute(cc.CONST_A_Y)) || 0;
        }
        helpNode.skewX = parseFloat(parentFrameXml.getAttribute(cc.CONST_A_SKEW_X)) || 0;
        helpNode.skewY = parseFloat(parentFrameXml.getAttribute(cc.CONST_A_SKEW_Y)) || 0;

        helpNode.y = -helpNode.y;
        helpNode.skewX = cc.DEGREES_TO_RADIANS(helpNode.skewX);
        helpNode.skewY = cc.DEGREES_TO_RADIANS(-helpNode.skewY);
        cc.TransformHelp.transformFromParent(frameData, helpNode);
    }
    return frameData;
};

cc.DataReaderHelper.decodeTexture = function (textureXML) {
    var textureData = new cc.TextureData();
    if (textureXML.getAttribute(cc.CONST_A_NAME)) {
        textureData.name = textureXML.getAttribute(cc.CONST_A_NAME);
    }
    var px, py, width, height = 0;
    if (this._flashToolVersion >= cc.CONST_VERSION_2_0) {
        px = parseFloat(textureXML.getAttribute(cc.CONST_A_COCOS2D_PIVOT_X)) || 0;
        py = parseFloat(textureXML.getAttribute(cc.CONST_A_COCOS2D_PIVOT_Y)) || 0;
    }
    else {
        px = parseFloat(textureXML.getAttribute(cc.CONST_A_PIVOT_X)) || 0;
        py = parseFloat(textureXML.getAttribute(cc.CONST_A_PIVOT_Y)) || 0;
    }
    width = parseFloat(textureXML.getAttribute(cc.CONST_A_WIDTH)) || 0;
    height = parseFloat(textureXML.getAttribute(cc.CONST_A_HEIGHT)) || 0;

    var anchorPointX = px / width;
    var anchorPointY = (height - py) / height;

    textureData.pivotX = anchorPointX;
    textureData.pivotY = anchorPointY;

    var contoursXML = textureXML.querySelectorAll(cc.CONST_SUB_TEXTURE + " > " + cc.CONST_CONTOUR);
    for (var i = 0; i < contoursXML.length; i++) {
        this.decodeContour(contoursXML[i], textureData);
    }
    return textureData;
};

cc.DataReaderHelper.decodeContour = function (contourXML) {
    var contourData = new cc.ContourData();
    var vertexDatasXML = contourXML.querySelectorAll(cc.CONST_CONTOUR + " > " + cc.CONST_CONTOUR_VERTEX);
    var vertexDataXML;
    for (var i = 0; i < vertexDatasXML.length; i++) {
        vertexDataXML = vertexDatasXML[i];
        var vertex = cc.p(0, 0);
        vertex.x = parseFloat(vertexDataXML.getAttribute(cc.CONST_A_X)) || 0;
        vertex.y = parseFloat(vertexDataXML.getAttribute(cc.CONST_A_Y)) || 0;
        //vertex.y = - vertex.y;//todo
        contourData.vertexList.push(vertex);
    }
    return contourData;

};

cc.DataReaderHelper.addDataFromJson = function (filePath) {
    var fileContent = cc.FileUtils.getInstance().getTextFileData(filePath);
    this.addDataFromJsonCache(fileContent);
};
cc.DataReaderHelper.addDataFromJsonCache = function (content) {
    var dic = JSON.parse(content);
    var armatureData = dic[cc.CONST_ARMATURE_DATA] || [];
    for (var i = 0; i < armatureData.length; i++) {
        var armatureDic = armatureData[i];
        var armatureData = this.decodeArmatureFromJSON(armatureDic);
        cc.ArmatureDataManager.getInstance().addArmatureData(armatureData.name, armatureData);
    }

    var animationData = dic[cc.CONST_ANIMATION_DATA] || [];
    for (var i = 0; i < animationData.length; i++) {
        var animationDic = animationData[i];
        var animationData = this.decodeAnimationFromJson(animationDic);
        cc.ArmatureDataManager.getInstance().addAnimationData(animationData.name, animationData);
    }

    var textData = dic[cc.CONST_TEXTURE_DATA] || [];
    for (var i = 0; i < textData.length; i++) {
        var textureDic = textData[i];
        var textureData = this.decodeTextureFromJson(textureDic);
        cc.ArmatureDataManager.getInstance().addTextureData(textureData.name, textureData);
    }

    armatureData = null;
    animationData = null;
    textData = null;
};

cc.DataReaderHelper.decodeArmatureFromJSON = function (json) {
    var armatureData = new cc.ArmatureData();

    var name = json[cc.CONST_A_NAME];
    if (name) {
        armatureData.name = name;
    }

    var boneDataList = json[cc.CONST_BONE_DATA];
    for (var i = 0; i < boneDataList.length; i++) {
        armatureData.addBoneData(this.decodeBoneFromJson(boneDataList[i]));
    }
    return armatureData;
};

cc.DataReaderHelper.decodeBoneFromJson = function (json) {
    var boneData = new cc.BoneData();
    this.decodeNodeFromJson(boneData, json);
    boneData.name = json[cc.CONST_A_NAME] || "";
    boneData.parentName = json[cc.CONST_A_PARENT] || "";
    var displayDataList = json[cc.CONST_DISPLAY_DATA] || [];
    for (var i = 0; i < displayDataList.length; i++) {
        boneData.addDisplayData(this.decodeBoneDisplayFromJson(displayDataList[i]));
    }
    return boneData;
};

cc.DataReaderHelper.decodeBoneDisplayFromJson = function (json) {
    var displayType = json[cc.CONST_A_DISPLAY_TYPE] || CC_DISPLAY_SPRITE;
    var displayData = null;
    switch (displayType) {
        case CC_DISPLAY_SPRITE:
            displayData = new cc.SpriteDisplayData();
            displayData.displayName = json[cc.CONST_A_NAME] || "";
            break;
        case CC_DISPLAY_ARMATURE:
            displayData = new cc.ArmatureDisplayData();
            displayData.displayName = json[cc.CONST_A_NAME] || "";
            break;
        case CC_DISPLAY_PARTICLE:
        {
            displayData = new cc.ParticleDisplayData();
            displayData.plist = json[cc.CONST_A_PLIST] || "";
        }
            break;
        case CC_DISPLAY_SHADER:
            displayData = new cc.ShaderDisplayData();
            displayData.vert = json[cc.CONST_A_VERT] || "";
            displayData.frag = json[cc.CONST_A_FRAG] || "";
            break;
        default:
            displayData = new cc.SpriteDisplayData();
            break;
    }

    displayData.displayType = displayType;

    return displayData;
};

cc.DataReaderHelper.decodeAnimationFromJson = function (json) {
    var aniData = new cc.AnimationData();
    aniData.name = json[cc.CONST_A_NAME] || "";
    var movementDataList = json[cc.CONST_MOVEMENT_DATA] || [];
    for (var i = 0; i < movementDataList.length; i++) {
        aniData.addMovement(this.decodeMovementFromJson(movementDataList[i]));
    }
    return aniData;
};

cc.DataReaderHelper.decodeMovementFromJson = function (json) {
    var movementData = new cc.MovementData();

    movementData.loop = json[cc.CONST_A_LOOP] || true;
    movementData.durationTween = json[cc.CONST_A_DURATION_TWEEN] || 0;
    movementData.durationTo = json[cc.CONST_A_DURATION_TO] || 0;
    movementData.duration = json[cc.CONST_A_DURATION] || 0;
    movementData.tweenEasing = json[cc.CONST_A_TWEEN_EASING] || cc.TweenType.Linear;
    movementData.name = json[cc.CONST_A_NAME] || "";

    var movementBoneList = json[cc.CONST_MOVEMENT_BONE_DATA] || [];
    for (var i = 0; i < movementBoneList.length; i++) {
        movementData.addMovementBoneData(this.decodeMovementBoneFromJson(movementBoneList[i]));
    }
    return movementData;
};

cc.DataReaderHelper.decodeMovementBoneFromJson = function (json) {
    var movementBoneData = new cc.MovementBoneData();
    movementBoneData.delay = json[cc.CONST_A_MOVEMENT_DELAY] || 0;
    movementBoneData.scale = json[cc.CONST_A_MOVEMENT_SCALE] || 1;

    movementBoneData.name = json[cc.CONST_A_NAME] || "";
    var frameDataList = json[cc.CONST_FRAME_DATA] || [];
    for (var i = 0; i < frameDataList.length; i++) {
        movementBoneData.addFrameData(this.decodeFrameFromJson(frameDataList[i]));
    }
    return movementBoneData;
};

cc.DataReaderHelper.decodeFrameFromJson = function (json) {
    var frameData = new cc.FrameData();
    this.decodeNodeFromJson(frameData, json);
    frameData.duration = json[cc.CONST_A_DURATION] || 1;
    frameData.tweenEasing = json[cc.CONST_A_TWEEN_EASING] || cc.TweenType.Linear;
    frameData.displayIndex = json[cc.CONST_A_DISPLAY_INDEX] || 0;

    return frameData;
};

cc.DataReaderHelper.decodeTextureFromJson = function (json) {
    var textureData = new cc.TextureData();
    textureData.name = json[cc.CONST_A_NAME] || "";
    textureData.width = json[cc.CONST_A_WIDTH] || 0;
    textureData.height = json[cc.CONST_A_HEIGHT] || 0;
    textureData.pivotX = json[cc.CONST_A_PIVOT_X] || 0;
    textureData.pivotY = json[cc.CONST_A_PIVOT_Y] || 0;

    var contourDataList = json[cc.CONST_CONTOUR_DATA] || [];
    for (var i = 0; i < contourDataList.length; i++) {
        textureData.contourDataList.push(this.decodeContourFromJson(contourDataList[i]));
    }
    return textureData;
};

cc.DataReaderHelper.decodeContourFromJson = function (json) {
    var contourData = new cc.ContourData();
    var vertexPointList = json[cc.CONST_VERTEX_POINT] || [];
    for (var i = 0; i < vertexPointList.length; i++) {
        var dic = vertexPointList[i];
        var vertex = cc.p(0, 0);
        vertex.x = dic[cc.CONST_A_X] || 0;
        vertex.y = dic[cc.CONST_A_Y] || 0;
        contourData.vertexList.push(vertex);
    }
    return contourData;
};

cc.DataReaderHelper.decodeNodeFromJson = function (node, json) {
    node.x = (json[cc.CONST_A_X] || 0) * this._positionReadScale;
    node.y = (json[cc.CONST_A_Y] || 0) * this._positionReadScale;
    node.zOrder = json[cc.CONST_A_Z] || 0;

    node.skewX = json[cc.CONST_A_SKEW_X] || 0;
    node.skewY = json[cc.CONST_A_SKEW_Y] || 0;
    node.scaleX = json[cc.CONST_A_SCALE_X] || 1;
    node.scaleY = json[cc.CONST_A_SCALE_Y] || 1;

    var colorDic = json[cc.CONST_COLOR_INFO] || null;
    if (colorDic) {
        node.a = colorDic[cc.CONST_A_ALPHA] || 255;
        node.r = colorDic[cc.CONST_A_RED] || 255;
        node.g = colorDic[cc.CONST_A_GREEN] || 255;
        node.b = colorDic[cc.CONST_A_BLUE] || 255;
        node.isUseColorInfo = true;
        delete colorDic;
    }
};