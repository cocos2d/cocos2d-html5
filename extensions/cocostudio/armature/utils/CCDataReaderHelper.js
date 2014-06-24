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
 * @ignore
 */
ccs.CONST_VERSION = "version";
ccs.CONST_VERSION_2_0 = 2.0;
ccs.CONST_VERSION_COMBINED = 0.3;

ccs.CONST_SKELETON = "skeleton";
ccs.CONST_ARMATURES = "armatures";
ccs.CONST_ARMATURE = "armature";
ccs.CONST_BONE = "b";
ccs.CONST_DISPLAY = "d";

ccs.CONST_ANIMATIONS = "animations";
ccs.CONST_ANIMATION = "animation";
ccs.CONST_MOVEMENT = "mov";
ccs.CONST_FRAME = "f";

ccs.CONST_TEXTURE_ATLAS = "TextureAtlas";
ccs.CONST_SUB_TEXTURE = "SubTexture";

ccs.CONST_A_NAME = "name";
ccs.CONST_A_DURATION = "dr";
ccs.CONST_A_FRAME_INDEX = "fi";
ccs.CONST_A_DURATION_TO = "to";
ccs.CONST_A_DURATION_TWEEN = "drTW";
ccs.CONST_A_LOOP = "lp";
ccs.CONST_A_MOVEMENT_SCALE = "sc";
ccs.CONST_A_MOVEMENT_DELAY = "dl";
ccs.CONST_A_DISPLAY_INDEX = "dI";

ccs.CONST_A_VERT = "vert";
ccs.CONST_A_FRAG = "frag";
ccs.CONST_A_PLIST = "plist";

ccs.CONST_A_PARENT = "parent";
ccs.CONST_A_SKEW_X = "kX";
ccs.CONST_A_SKEW_Y = "kY";
ccs.CONST_A_SCALE_X = "cX";
ccs.CONST_A_SCALE_Y = "cY";
ccs.CONST_A_Z = "z";
ccs.CONST_A_EVENT = "evt";
ccs.CONST_A_SOUND = "sd";
ccs.CONST_A_SOUND_EFFECT = "sdE";
ccs.CONST_A_TWEEN_EASING = "twE";
ccs.CONST_A_TWEEN_ROTATION = "twR";
ccs.CONST_A_EASING_PARAM = "twEP";
ccs.CONST_A_IS_ARMATURE = "isArmature";
ccs.CONST_A_DISPLAY_TYPE = "displayType";
ccs.CONST_A_MOVEMENT = "mov";
ccs.CONST_A_BLEND_TYPE = "bd";
ccs.CONST_A_BLEND_SRC = "bd_src";
ccs.CONST_A_BLEND_DST = "bd_dst";

ccs.CONST_A_X = "x";
ccs.CONST_A_Y = "y";

ccs.CONST_A_COCOS2DX_X = "cocos2d_x";
ccs.CONST_A_COCOS2DX_Y = "cocos2d_y";

ccs.CONST_A_WIDTH = "width";
ccs.CONST_A_HEIGHT = "height";
ccs.CONST_A_PIVOT_X = "pX";
ccs.CONST_A_PIVOT_Y = "pY";

ccs.CONST_A_COCOS2D_PIVOT_X = "cocos2d_pX";
ccs.CONST_A_COCOS2D_PIVOT_Y = "cocos2d_pY";

ccs.CONST_A_ALPHA = "a";
ccs.CONST_A_RED = "r";
ccs.CONST_A_GREEN = "g";
ccs.CONST_A_BLUE = "b";
ccs.CONST_A_ALPHA_OFFSET = "aM";
ccs.CONST_A_RED_OFFSET = "rM";
ccs.CONST_A_GREEN_OFFSET = "gM";
ccs.CONST_A_BLUE_OFFSET = "bM";
ccs.CONST_A_COLOR_TRANSFORM = "colorTransform";
ccs.CONST_A_TWEEN_FRAME = "tweenFrame";
ccs.CONST_A_ROTATION = "rotation";
ccs.CONST_A_USE_COLOR_INFO = "uci";

ccs.CONST_CONTOUR = "con";
ccs.CONST_CONTOUR_VERTEX = "con_vt";

ccs.CONST_MOVEMENT_EVENT_FRAME = "movementEventFrame";
ccs.CONST_SOUND_FRAME = "soundFrame";

ccs.CONST_FL_NAN = "NaN";

ccs.CONST_FRAME_DATA = "frame_data";
ccs.CONST_MOVEMENT_BONE_DATA = "mov_bone_data";
ccs.CONST_MOVEMENT_FRAME_DATA = "mov_frame_data";
ccs.CONST_MOVEMENT_DATA = "mov_data";
ccs.CONST_ANIMATION_DATA = "animation_data";
ccs.CONST_DISPLAY_DATA = "display_data";
ccs.CONST_SKIN_DATA = "skin_data";
ccs.CONST_BONE_DATA = "bone_data";
ccs.CONST_ARMATURE_DATA = "armature_data";
ccs.CONST_CONTOUR_DATA = "contour_data";
ccs.CONST_TEXTURE_DATA = "texture_data";
ccs.CONST_VERTEX_POINT = "vertex";
ccs.CONST_COLOR_INFO = "color";

ccs.CONST_CONFIG_FILE_PATH = "config_file_path";
ccs.CONST_CONTENT_SCALE = "content_scale";

/**
 * @ignore
 * @constructor
 */
ccs.DataInfo = function () {
    this.asyncStruct = null;
    this.configFileQueue = [];
    this.contentScale = 1;
    this.filename = "";
    this.baseFilePath = "";
    this.flashToolVersion = 0;
    this.cocoStudioVersion = 0
};

/**
 * @namespace CocoStudio data reader helper
 */
ccs.dataReaderHelper = /** @lends ccs.dataReaderHelper# */{
    _configFileList: [],
    _flashToolVersion: ccs.CONST_VERSION_2_0,
    _cocoStudioVersion: ccs.CONST_VERSION_COMBINED,
    _positionReadScale: 1,
    _asyncRefCount: 0,
    _asyncRefTotalCount: 0,

    setPositionReadScale: function (scale) {
        this._positionReadScale = scale;
    },

    getPositionReadScale: function () {
        return this._positionReadScale;
    },

    clear: function () {
        this._configFileList = [];
        this._asyncRefCount = 0;
        this._asyncRefTotalCount = 0;
    },

    addDataFromFile: function (filePath/*, isLoadSpriteFrame*/) {
        /*
         * Check if file is already added to ArmatureDataManager, if then return.
         */
        for(var i = 0; i < this._configFileList.length; i++)
        {
            if (this._configFileList[i] == filePath)
            {
                return;
            }
        }
        this._configFileList.push(filePath);

        //! find the base file path
        var basefilePath = filePath;
        var pos = basefilePath.lastIndexOf("/");

        if (pos != -1)
        {
            basefilePath = basefilePath.substr(0, pos + 1);
        }
        else
        {
            basefilePath = "";
        }


        var filePathStr =  filePath;
        var str = cc.path.extname(filePathStr);

        // Read content from file
        var fullPath = cc.path.join(filePath);

        var dataInfo = new ccs.DataInfo();
        dataInfo.filename = filePathStr;
        dataInfo.asyncStruct = null;
        dataInfo.baseFilePath = basefilePath;
        if (str == ".xml")
        {
            //addDataFromCache...
            this.addDataFromXML(fullPath, dataInfo);
        }
        else if(str == ".json" || str == ".ExportJson")
        {
            //addDataFromJsonCache...
            this.addDataFromJson(fullPath, dataInfo);
        }

    },

    addDataFromFileAsync: function (filePath, target, selector, isLoadSpriteFrame) {
        if (this._configFileList.indexOf(filePath) != -1) {
            if (target && selector) {
                if (this._asyncRefTotalCount == 0 && this._asyncRefCount == 0)
                    this._asyncCallBack(target, selector, 1);
                else
                    this._asyncCallBack(target, selector, (this._asyncRefTotalCount - this._asyncRefCount) / this._asyncRefTotalCount);
            }
            return;
        }
        this._asyncRefTotalCount++;
        this._asyncRefCount++;
        var self = this;
        var fun = function () {
            self.addDataFromFile(filePath, isLoadSpriteFrame);
            self._asyncRefCount--;
            self._asyncCallBack(target, selector, (self._asyncRefTotalCount - self._asyncRefCount) / self._asyncRefTotalCount);
        };
        cc.director.getScheduler().scheduleCallbackForTarget(this, fun, 0.1, false);
    },

    _asyncCallBack: function (target, selector, percent) {
        if (target && (typeof(selector) == "string")) {
            target[selector](percent);
        } else if (target && (typeof(selector) == "function")) {
            selector.call(target, percent);
        }
    },
    /**
     * find the base file path
     * @param filePath
     * @returns {String}
     * @private
     */
    _initBaseFilePath: function (filePath) {
        var path = filePath;
        var pos = path.lastIndexOf("/");
        if (pos > -1)
            path = path.substr(0, pos + 1);
        else
            path = "";
        return path;
    },

    addDataFromXML: function (xml, dataInfo) {
        /*
         *  Need to get the full path of the xml file, or the Tiny XML can't find the xml at IOS
         */
        var xmlStr = cc.loader.getRes(xml);
        if (!xmlStr) throw "Please load the resource first : " + xml;
        var skeletonXML = cc.saxParser.parse(xmlStr);
        var skeleton = skeletonXML.documentElement;
        if (skeleton) {
            this.addDataFromCache(skeleton, dataInfo);
        }
    },

    addDataFromCache: function (skeleton, dataInfo) {
        if (!skeleton) {
            cc.log("XML error  or  XML is empty.");
            return;
        }
        dataInfo.flashToolVersion = parseFloat(skeleton.getAttribute(ccs.CONST_VERSION));
        var armaturesXML = skeleton.querySelectorAll(ccs.CONST_SKELETON + " > " + ccs.CONST_ARMATURES + " >  " + ccs.CONST_ARMATURE + "");
        var armatureDataManager = ccs.armatureDataManager;
        for (var i = 0; i < armaturesXML.length; i++) {
            var armatureData = this.decodeArmature(armaturesXML[i], dataInfo);
            armatureDataManager.addArmatureData(armatureData.name, armatureData, dataInfo.filename);
        }

        var animationsXML = skeleton.querySelectorAll(ccs.CONST_SKELETON + " > " + ccs.CONST_ANIMATIONS + " >  " + ccs.CONST_ANIMATION + "");
        for (var i = 0; i < animationsXML.length; i++) {
            var animationData = this.decodeAnimation(animationsXML[i], dataInfo);
            armatureDataManager.addAnimationData(animationData.name, animationData, dataInfo.filename);
        }

        var texturesXML = skeleton.querySelectorAll(ccs.CONST_SKELETON + " > " + ccs.CONST_TEXTURE_ATLAS + " >  " + ccs.CONST_SUB_TEXTURE + "");
        for (var i = 0; i < texturesXML.length; i++) {
            var textureData = this.decodeTexture(texturesXML[i], dataInfo);
            armatureDataManager.addTextureData(textureData.name, textureData, dataInfo.filename);
        }
        skeleton = null;
    },

    decodeArmature: function (json, dataInfo) {
        var armatureData = new ccs.ArmatureData();
        armatureData.init();

        var name = json[ccs.CONST_A_NAME];
        if(name != null)
        {
            armatureData.name = name;
        }

        dataInfo.cocoStudioVersion = armatureData.dataVersion = json[ccs.CONST_VERSION] ?
            json[ccs.CONST_VERSION][1] : '';

        var length = json[ccs.CONST_BONE_DATA] ?
            json[ccs.CONST_BONE_DATA].length :
            0;
        for (var i = 0; i < length; i++)
        {
            var dic = json[ccs.CONST_BONE_DATA][i]; //json[BONE_DATA][i];
            var boneData = this.decodeBone(dic, dataInfo);
            armatureData.addBoneData(boneData);

        }

        return armatureData;
    },

    decodeBone: function (boneXML, parentXML, dataInfo) {

        var name = boneXML[ccs.CONST_A_NAME];
        if (name == "") {
            return;
        }
        var boneData = new ccs.BoneData();
        boneData.name = name;
        boneData.parentName = boneXML[ccs.CONST_A_PARENT] || "";
        boneData.zOrder = parseInt(boneXML[ccs.CONST_A_Z]) || 0;

        var displaysXML = boneXML[ccs.CONST_DISPLAY_DATA] || [];

        var displayXML;
        for (var i = 0; i < displaysXML.length; i++) {
            displayXML = displaysXML[i];
            var displayData = this.decodeBoneDisplay(displayXML, dataInfo);
            boneData.addDisplayData(displayData);
        }
        return boneData;
    },
    decodeBoneDisplay: function (displayXML, dataInfo) {
        var isArmature = parseFloat(displayXML[ccs.CONST_A_IS_ARMATURE]) || 0;
        var displayData = null;

        if (isArmature == 1) {
            displayData = new ccs.ArmatureDisplayData();
            displayData.displayType = ccs.DISPLAY_TYPE_ARMATURE;
        }
        else {
            displayData = new ccs.SpriteDisplayData();
            displayData.displayType = ccs.DISPLAY_TYPE_SPRITE;
        }
        var displayName = displayXML[ccs.CONST_A_NAME] || "";
        if (displayName) {
            displayData.displayName = displayName;
        }
        return displayData;
    },


    decodeAnimation: function (json, dataInfo) {

        var aniData =  new ccs.AnimationData();

        var name = json[ccs.CONST_A_NAME];

        var armatureData = ccs.armatureDataManager.getArmatureData(name);

        aniData.name = name;

        var movementXML = json[ccs.CONST_MOVEMENT_DATA];

        if(movementXML){
            for (var i = 0; i < movementXML.length; i++)
            {
                var movementData = this.decodeMovement(movementXML[i], armatureData, dataInfo);
                aniData.addMovement(movementData);

            }
        }

        return aniData;

    },

    decodeMovement: function (movementXML, armatureData, dataInfo) {

        var movementData = new ccs.MovementData();

        var movName = movementXML[ccs.CONST_A_NAME];
        movementData.name = movName;


        var tweenEasing = 0;

        if( movementXML[ccs.CONST_A_DURATION])
        {
            movementData.duration  = movementXML[ccs.CONST_A_DURATION];
        }
        if( movementXML[ccs.CONST_A_DURATION_TO])
        {
            movementData.durationTo = movementXML[ccs.CONST_A_DURATION_TO];
        }
        if( movementXML[ccs.CONST_A_DURATION_TWEEN])
        {
            movementData.durationTween = movementXML[ccs.CONST_A_DURATION_TWEEN];
        }
        if( movementXML[ccs.CONST_A_LOOP])
        {
            movementData.loop = movementXML[ccs.CONST_A_LOOP] != 0;
        }

        var _easing = movementXML[ccs.CONST_A_TWEEN_EASING];
        if(_easing != null)
        {
            var str = _easing;
            if(str != ccs.CONST_FL_NAN)
            {
                if( movementXML[ccs.CONST_A_TWEEN_EASING])
                {
                    movementData.tweenEasing = tweenEasing == 2 ?
                        //cocos2d.tweenfunc.Sine_EaseInOut :
                        3 :
                        movementXML[ccs.CONST_A_TWEEN_EASING];
                }
            }
            else
            {
                movementData.tweenEasing  = 0//cocos2d.tweenfunc.Linear;
            }
        }

        //var movBoneXml = movementXML[ccs.CONST_BONE];

        var movBoneXml = movementXML[ccs.CONST_MOVEMENT_BONE_DATA];
        for (var i = 0; i < movBoneXml.length; i++)
        {
            var parentXml = null;
            var dic = movBoneXml[i];
            var movementBoneData = this.decodeMovementBone(movementXML, parentXml, dic, dataInfo);
            movementData.addMovementBoneData(movementBoneData);
        }

        return movementData;


    },

    decodeMovementBone: function (movBoneXml, parentXml, boneData, dataInfo) {
        var movBoneData = new ccs.MovementBoneData();
        movBoneData.init();

        var scale, delay;

        if (movBoneXml) {
            scale = parseFloat(movBoneXml[ccs.CONST_A_MOVEMENT_SCALE]) || 0;
            movBoneData.scale = scale;

            delay = parseFloat(movBoneXml[ccs.CONST_A_MOVEMENT_DELAY]) || 0;
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
            var parentFramesXML = parentXml.querySelectorAll(ccs.CONST_BONE + " > " + ccs.CONST_FRAME);
            for (var i = 0; i < parentFramesXML.length; i++) {
                parentXMLList.push(parentFramesXML[i]);
            }
            length = parentXMLList.length;
        }


        var totalDuration = 0;

        var name = movBoneXml[ccs.CONST_A_NAME];
        movBoneData.name = name;
        var framesXML = movBoneXml.querySelectorAll(ccs.CONST_BONE + " > " + ccs.CONST_FRAME);
        var j = 0;
        for (var ii = 0; ii < framesXML.length; ii++) {
            var frameXML = framesXML[ii];
            if (parentXml) {
                //*  in this loop we get the corresponding parent frame xml
                while (j < length && (parentFrameXML ? (totalDuration < parentTotalDuration || totalDuration >= parentTotalDuration + currentDuration) : true)) {
                    parentFrameXML = parentXMLList[j];
                    parentTotalDuration += currentDuration;
                    currentDuration = parseFloat(parentFrameXML[ccs.CONST_A_DURATION]);
                    j++;
                }
            }
            var frameData = this.decodeFrame(frameXML, parentFrameXML, boneData, dataInfo);
            movBoneData.addFrameData(frameData);
            frameData.frameID = totalDuration;
            totalDuration += frameData.duration;
            movBoneData.duration = totalDuration;
        }

        //Change rotation range from (-180 -- 180) to (-infinity -- infinity)
        var frames = movBoneData.frameList;
        var pi = Math.PI;
        for (var i = frames.length - 1; i >= 0; i--) {
            if (i > 0) {
                var difSkewX = frames[i].skewX - frames[i - 1].skewX;
                var difSkewY = frames[i].skewY - frames[i - 1].skewY;

                if (difSkewX < -pi || difSkewX > pi) {
                    frames[i - 1].skewX = difSkewX < 0 ? frames[i - 1].skewX - 2 * pi : frames[i - 1].skewX + 2 * pi;
                }

                if (difSkewY < -pi || difSkewY > pi) {
                    frames[i - 1].skewY = difSkewY < 0 ? frames[i - 1].skewY - 2 * pi : frames[i - 1].skewY + 2 * pi;
                }
            }
        }

        if (movBoneData.frameList.length > 0) {
            var frameData = new ccs.FrameData();
            frameData.copy(movBoneData.frameList[movBoneData.frameList.length - 1]);
            frameData.frameID = movBoneData.duration;
            movBoneData.addFrameData(frameData);
        }
        return movBoneData;
    },
    decodeFrame: function (frameXML, parentFrameXml, boneData, dataInfo) {
        var frameData = new ccs.FrameData();
        frameData.movement = frameXML.getAttribute(ccs.CONST_A_MOVEMENT) || "";
        frameData.event = frameXML.getAttribute(ccs.CONST_A_EVENT) || "";
        frameData.blendType = parseInt(frameXML.getAttribute(ccs.CONST_A_BLEND_TYPE)) || ccs.BLEND_TYPE_NORMAL;

        var blendFunc = frameData.blendFunc;
        switch (frameData.blendType) {
            case ccs.BLEND_TYPE_NORMAL:
                blendFunc.src = cc.BLEND_SRC;
                blendFunc.dst = cc.BLEND_DST;
                break;
            case ccs.BLEND_TYPE_ADD:
                blendFunc.src = cc.SRC_ALPHA;
                blendFunc.dst = cc.ONE;
                break;
            case ccs.BLEND_TYPE_MULTIPLY:
                blendFunc.src = cc.ONE_MINUS_SRC_ALPHA;
                blendFunc.dst = cc.ONE_MINUS_DST_COLOR;
                break;
            case ccs.BLEND_TYPE_SCREEN:
                blendFunc.src = cc.ONE;
                blendFunc.dst = cc.ONE_MINUS_DST_COLOR;
                break;
            default:
                break;
        }

        frameData.sound = frameXML.getAttribute(ccs.CONST_A_SOUND) || "";
        frameData.soundEffect = frameXML.getAttribute(ccs.CONST_A_SOUND_EFFECT) || "";

        var isTween = frameXML.getAttribute(ccs.CONST_A_TWEEN_FRAME);
        if(isTween == null)
            isTween = true;
        frameData.isTween = Boolean(isTween);

        if (dataInfo.flashToolVersion >= ccs.CONST_VERSION_2_0) {
            frameData.x = parseFloat(frameXML.getAttribute(ccs.CONST_A_COCOS2DX_X)) || 0;
            frameData.y = -parseFloat(frameXML.getAttribute(ccs.CONST_A_COCOS2DX_Y)) || 0;
        }
        else {
            frameData.x = parseFloat(frameXML.getAttribute(ccs.CONST_A_X)) || 0;
            frameData.y = -parseFloat(frameXML.getAttribute(ccs.CONST_A_Y)) || 0;
        }
        frameData.x *= this._positionReadScale;
        frameData.y *= this._positionReadScale;
        frameData.scaleX = parseFloat(frameXML.getAttribute(ccs.CONST_A_SCALE_X)) || 0;
        frameData.scaleY = parseFloat(frameXML.getAttribute(ccs.CONST_A_SCALE_Y)) || 0;
        frameData.skewX = cc.degreesToRadians(parseFloat(frameXML.getAttribute(ccs.CONST_A_SKEW_X)) || 0);
        frameData.skewY = cc.degreesToRadians(-parseFloat(frameXML.getAttribute(ccs.CONST_A_SKEW_Y)) || 0);
        frameData.duration = parseFloat(frameXML.getAttribute(ccs.CONST_A_DURATION)) || 0;
        frameData.displayIndex = parseFloat(frameXML.getAttribute(ccs.CONST_A_DISPLAY_INDEX)) || 0;
        frameData.zOrder = parseFloat(frameXML.getAttribute(ccs.CONST_A_Z)) || 0;
        frameData.tweenRotate = parseFloat(frameXML.getAttribute(ccs.CONST_A_TWEEN_ROTATION)) || 0;

        var colorTransformXMLList = frameXML.querySelectorAll(ccs.CONST_FRAME + " > " + ccs.CONST_A_COLOR_TRANSFORM);
        if (colorTransformXMLList.length > 0) {
            var colorTransformXML = colorTransformXMLList[0];
            var alpha = 0, red = 0, green = 0, blue = 0;
            var alphaOffset = 0, redOffset = 0, greenOffset = 0, blueOffset = 100;

            alpha = parseFloat(colorTransformXML.getAttribute(ccs.CONST_A_ALPHA)) || alpha;
            red = parseFloat(colorTransformXML.getAttribute(ccs.CONST_A_RED)) || red;
            green = parseFloat(colorTransformXML.getAttribute(ccs.CONST_A_GREEN)) || green;
            blue = parseFloat(colorTransformXML.getAttribute(ccs.CONST_A_BLUE)) || blue;

            var str_alphaOffset = colorTransformXML.getAttribute(ccs.CONST_A_ALPHA_OFFSET);
            if (str_alphaOffset) {
                alphaOffset = parseFloat(str_alphaOffset);
            }
            var str_redOffset = colorTransformXML.getAttribute(ccs.CONST_A_RED_OFFSET);
            if (str_redOffset) {
                redOffset = parseFloat(str_redOffset);
            }
            var str_greenOffset = colorTransformXML.getAttribute(ccs.CONST_A_GREEN_OFFSET);
            if (str_redOffset) {
                greenOffset = parseFloat(str_greenOffset);
            }
            var str_blueOffset = colorTransformXML.getAttribute(ccs.CONST_A_BLUE_OFFSET);
            if (str_blueOffset) {
                blueOffset = parseFloat(str_blueOffset);
            }

            frameData.a = 2.55 * alphaOffset + alpha;
            frameData.r = 2.55 * redOffset + red;
            frameData.g = 2.55 * greenOffset + green;
            frameData.b = 2.55 * blueOffset + blue;

            frameData.isUseColorInfo = true;
        }
        if (frameData.displayIndex == -1) {
            frameData.a = 0;
        }

        var tweenEasing = frameXML.getAttribute(ccs.CONST_A_TWEEN_EASING);
        if (tweenEasing) {
            if (tweenEasing != ccs.CONST_FL_NAN) {
                frameData.tweenEasing = tweenEasing == 2 ? ccs.TweenType.sineEaseInOut : tweenEasing;
            } else {
                frameData.tweenEasing = ccs.TweenType.linear;
            }
        }

        if (parentFrameXml) {
            //*  recalculate frame data from parent frame data, use for translate matrix
            var helpNode = new ccs.BaseData();
            if (dataInfo.flashToolVersion >= ccs.CONST_VERSION_2_0) {
                helpNode.x = parseFloat(parentFrameXml.getAttribute(ccs.CONST_A_COCOS2DX_X)) || 0;
                helpNode.y = parseFloat(parentFrameXml.getAttribute(ccs.CONST_A_COCOS2DX_Y)) || 0;
            }
            else {
                helpNode.x = parseFloat(parentFrameXml.getAttribute(ccs.CONST_A_X)) || 0;
                helpNode.y = parseFloat(parentFrameXml.getAttribute(ccs.CONST_A_Y)) || 0;
            }
            helpNode.skewX = parseFloat(parentFrameXml.getAttribute(ccs.CONST_A_SKEW_X)) || 0;
            helpNode.skewY = parseFloat(parentFrameXml.getAttribute(ccs.CONST_A_SKEW_Y)) || 0;

            helpNode.y = -helpNode.y;
            helpNode.skewX = cc.degreesToRadians(helpNode.skewX);
            helpNode.skewY = cc.degreesToRadians(-helpNode.skewY);
            ccs.TransformHelp.transformFromParent(frameData, helpNode);
        }
        return frameData;
    },

    decodeTexture: function (json, dataInfo) {
        if(!dataInfo){
            debugger;
        }

        var textureData = new ccs.TextureData();
        textureData.init();

        if( json[ccs.CONST_A_NAME] != null)
        {
            textureData.name = json[ccs.CONST_A_NAME];
        }

        if(dataInfo.flashToolVersion >= ccs.CONST_VERSION_2_0)
        {
            textureData.pivotX = json[ccs.CONST_A_COCOS2D_PIVOT_X];
            textureData.pivotY = json[ccs.CONST_A_COCOS2D_PIVOT_Y];
        }
        else
        {
            textureData.pivotX = json[ccs.CONST_A_PIVOT_X];
            textureData.pivotY = json[ccs.CONST_A_PIVOT_Y];
        }

        textureData.width = json[ccs.CONST_A_WIDTH];
        textureData.height = json[ccs.CONST_A_HEIGHT];

        var anchorPointX = textureData.pivotX / textureData.width;
        var anchorPointY = (textureData.height - textureData.pivotY) / textureData.height;

        textureData.pivotX = anchorPointX;
        textureData.pivotY = anchorPointY;

        var contour = json[ccs.CONST_CONTOUR_DATA];
        if(contour){
            for (var i=0; i < contour.length; i++)
            {
                var dic = contour[i];
                var contourData = this.decodeContour(dic);
                textureData.contourDataList.push(contourData);
            }
        }

        return textureData;
    },

    decodeContour: function (contourXML, dataInfo) {
        var contourData = new ccs.ContourData();
        var vertexDatasXML = contourXML['vertex'];
        var vertexDataXML;
        for (var i = 0; i < vertexDatasXML.length; i++) {
            vertexDataXML = vertexDatasXML[i];
            var vertex = cc.p(0, 0);
            vertex.x = parseFloat(vertexDataXML[ccs.CONST_A_X]) || 0;
            vertex.y = parseFloat(vertexDataXML[ccs.CONST_A_Y]) || 0;
            //vertex.y = - vertex.y;//todo
            contourData.vertexList.push(vertex);
        }
        return contourData;

    },

    addDataFromJson: function (filePath, dataInfo) {
        var fileContent = cc.loader.getRes(filePath);
        this.addDataFromJsonCache(fileContent, dataInfo, filePath);
    },
    addDataFromJsonCache: function (json, dataInfo, filePath) {
        // Decode armatures
        var length = json[ccs.CONST_ARMATURE_DATA].length;
        for(var i=0; i<length; i++){
            var armatureDic = json[ccs.CONST_ARMATURE_DATA][i];
            var armatureData = this.decodeArmature(armatureDic, dataInfo);

            ccs.armatureDataManager.addArmatureData(armatureData['name'], armatureData, filePath);
        }

        // Decode animations
        length = json[ccs.CONST_ANIMATION_DATA].length; //json[ANIMATION_DATA].IsNull() ? 0 : json[ANIMATION_DATA].Size();
        for (var i = 0; i < length; i++)
        {
            var animationDic = json[ccs.CONST_ANIMATION_DATA][i];
            var animationData = this.decodeAnimation(animationDic, dataInfo);

            ccs.armatureDataManager.addAnimationData(animationData.name, animationData, filePath);
        }

        // Decode textures
        length = json[ccs.CONST_TEXTURE_DATA].length;
        for (var i = 0; i < length; i++)
        {
            var textureDic =  json[ccs.CONST_TEXTURE_DATA][i];
            var textureData = this.decodeTexture(textureDic, dataInfo);

            ccs.armatureDataManager.addTextureData(textureData.name, textureData, filePath);
        }

        // Auto load sprite file
        var autoLoad = ( dataInfo.asyncStruct == null ) ?
            ccs.armatureDataManager.isAutoLoadSpriteFile() :
            dataInfo['asyncStruct']['autoLoadSpriteFile'];
        if (autoLoad)
        {
            length =  json[ccs.CONST_CONFIG_FILE_PATH].length; // json[CONFIG_FILE_PATH].IsNull() ? 0 : json[CONFIG_FILE_PATH].Size();
            for (var i = 0; i < length; i++)
            {
                var path = json[ccs.CONST_CONFIG_FILE_PATH][i]; // json[CONFIG_FILE_PATH][i].IsNull() ? NULL : json[CONFIG_FILE_PATH][i].GetString();
                if (path == null)
                {
                    cc.log("load CONFIG_FILE_PATH error.");
                    return;
                }

                path = path.substr(0, path.lastIndexOf("."));

                if (dataInfo.asyncStruct)
                {
                    dataInfo.configFileQueue.push(filePath);
                }
                else
                {
                    var plistPath = dataInfo.baseFilePath + path + ".plist";
                    var pngPath =  dataInfo.baseFilePath + path + ".png";

                    ccs.armatureDataManager.addSpriteFrameFromFile(plistPath, pngPath, filePath);
                }
            }
        }
    },
    decodeArmatureFromJSON: function (json, dataInfo) {
        var armatureData = new ccs.ArmatureData();

        var name = json[ccs.CONST_A_NAME];
        if (name) {
            armatureData.name = name;
        }

        dataInfo.cocoStudioVersion = armatureData.dataVersion = json[ccs.CONST_VERSION] || 0.1;

        var boneDataList = json[ccs.CONST_BONE_DATA];
        for (var i = 0; i < boneDataList.length; i++) {
            armatureData.addBoneData(this.decodeBoneFromJson(boneDataList[i], dataInfo));
        }
        return armatureData;
    },

    decodeBoneFromJson: function (json, dataInfo) {
        var boneData = new ccs.BoneData();
        this.decodeNodeFromJson(boneData, json, dataInfo);
        boneData.name = json[ccs.CONST_A_NAME] || "";
        boneData.parentName = json[ccs.CONST_A_PARENT] || "";
        var displayDataList = json[ccs.CONST_DISPLAY_DATA] || [];
        for (var i = 0; i < displayDataList.length; i++) {
            var locDisplayData = this.decodeBoneDisplayFromJson(displayDataList[i], dataInfo);
            boneData.addDisplayData(locDisplayData);
        }
        return boneData;
    },

    decodeBoneDisplayFromJson: function (json, dataInfo) {
        var displayType = json[ccs.CONST_A_DISPLAY_TYPE] || ccs.DISPLAY_TYPE_SPRITE;
        var displayData = null;
        switch (displayType) {
            case ccs.DISPLAY_TYPE_SPRITE:
                displayData = new ccs.SpriteDisplayData();
                displayData.displayName = json[ccs.CONST_A_NAME] || "";

                var dicArray = json[ccs.CONST_SKIN_DATA] || [];
                var dic = dicArray[0];
                if (dic) {
                    var skinData = displayData.skinData;
                    skinData.x = (dic[ccs.CONST_A_X] || 0) * this._positionReadScale;
                    skinData.y = (dic[ccs.CONST_A_Y] || 0) * this._positionReadScale;
                    if (dic[ccs.CONST_A_SCALE_X] !== undefined) {
                        skinData.scaleX = dic[ccs.CONST_A_SCALE_X];
                    }
                    if (dic[ccs.CONST_A_SCALE_Y] !== undefined) {
                        skinData.scaleY = dic[ccs.CONST_A_SCALE_Y];
                    }
                    skinData.skewX = dic[ccs.CONST_A_SKEW_X] || 0;
                    skinData.skewY = dic[ccs.CONST_A_SKEW_Y] || 0;

                    skinData.x *= dataInfo.contentScale;
                    skinData.y *= dataInfo.contentScale;
                    dic = null;
                }
                break;
            case ccs.DISPLAY_TYPE_ARMATURE:
                displayData = new ccs.ArmatureDisplayData();
                displayData.displayName = json[ccs.CONST_A_NAME] || "";
                break;
            case ccs.DISPLAY_TYPE_PARTICLE:
                displayData = new ccs.ParticleDisplayData();
                displayData.displayName = dataInfo.baseFilePath + json[ccs.CONST_A_PLIST] || "";
                break;
            default:
                displayData = new ccs.SpriteDisplayData();
                break;
        }

        displayData.displayType = displayType;

        return displayData;
    },

    decodeAnimationFromJson: function (json, dataInfo) {
        var aniData = new ccs.AnimationData();
        aniData.name = json[ccs.CONST_A_NAME] || "";
        var movementDataList = json[ccs.CONST_MOVEMENT_DATA] || [];
        for (var i = 0; i < movementDataList.length; i++) {
            var locMovementData = this.decodeMovementFromJson(movementDataList[i], dataInfo);
            aniData.addMovement(locMovementData);
        }
        return aniData;
    },

    decodeMovementFromJson: function (json, dataInfo) {
        var movementData = new ccs.MovementData();

        movementData.loop = json[ccs.CONST_A_LOOP] || false;
        movementData.durationTween = json[ccs.CONST_A_DURATION_TWEEN] || 0;
        movementData.durationTo = json[ccs.CONST_A_DURATION_TO] || 0;
        movementData.duration = json[ccs.CONST_A_DURATION] || 0;
        if (json[ccs.CONST_A_MOVEMENT_SCALE] !== undefined) {
            movementData.scale = json[ccs.CONST_A_MOVEMENT_SCALE]
        }
        movementData.tweenEasing = json[ccs.CONST_A_TWEEN_EASING] || ccs.TweenType.linear;
        movementData.name = json[ccs.CONST_A_NAME] || "";

        var movementBoneList = json[ccs.CONST_MOVEMENT_BONE_DATA] || [];
        for (var i = 0; i < movementBoneList.length; i++) {
            var locMovementBoneData = this.decodeMovementBoneFromJson(movementBoneList[i], dataInfo);
            movementData.addMovementBoneData(locMovementBoneData);
        }
        return movementData;
    },

    decodeMovementBoneFromJson: function (json, dataInfo) {
        var movementBoneData = new ccs.MovementBoneData();
        movementBoneData.delay = json[ccs.CONST_A_MOVEMENT_DELAY] || 0;
        if (json[ccs.CONST_A_MOVEMENT_SCALE] !== undefined) {
            movementBoneData.scale = json[ccs.CONST_A_MOVEMENT_SCALE];
        }

        movementBoneData.name = json[ccs.CONST_A_NAME] || "";
        var frameDataList = json[ccs.CONST_FRAME_DATA] || [];
        for (var i = 0; i < frameDataList.length; i++) {
            var frameData = this.decodeFrameFromJson(frameDataList[i], dataInfo);
            movementBoneData.addFrameData(frameData);
            if (dataInfo.cocoStudioVersion < ccs.CONST_VERSION_COMBINED) {
                frameData.frameID = movementBoneData.duration;
                movementBoneData.duration += frameData.duration;
            }
        }

        if (dataInfo.cocoStudioVersion < ccs.VERSION_CHANGE_ROTATION_RANGE) {
            //! Change rotation range from (-180 -- 180) to (-infinity -- infinity)
            var frames = movementBoneData.frameList;
            var pi = Math.PI;
            for (var i = frames.length - 1; i >= 0; i--) {
                if (i > 0) {
                    var difSkewX = frames[i].skewX - frames[i - 1].skewX;
                    var difSkewY = frames[i].skewY - frames[i - 1].skewY;

                    if (difSkewX < -pi || difSkewX > pi) {
                        frames[i - 1].skewX = difSkewX < 0 ? frames[i - 1].skewX - 2 * pi : frames[i - 1].skewX + 2 * pi;
                    }

                    if (difSkewY < -pi || difSkewY > pi) {
                        frames[i - 1].skewY = difSkewY < 0 ? frames[i - 1].skewY - 2 * pi : frames[i - 1].skewY + 2 * pi;
                    }
                }
            }
        }

        if (dataInfo.cocoStudioVersion < ccs.CONST_VERSION_COMBINED) {
            if (movementBoneData.frameList.length > 0) {
                var frameData = new ccs.FrameData();
                frameData.copy(movementBoneData.frameList[movementBoneData.frameList.length - 1]);
                movementBoneData.addFrameData(frameData);
                frameData.frameID = movementBoneData.duration;
            }
        }
        return movementBoneData;
    },

    decodeFrameFromJson: function (json, dataInfo) {
        var frameData = new ccs.FrameData();
        this.decodeNodeFromJson(frameData, json, dataInfo);
        frameData.duration = json[ccs.CONST_A_DURATION] || 0;
        frameData.tweenEasing = json[ccs.CONST_A_TWEEN_EASING] || ccs.TweenType.linear;
        frameData.displayIndex = json[ccs.CONST_A_DISPLAY_INDEX] || 0;

        var bd_src = json[ccs.CONST_A_BLEND_SRC] || cc.BLEND_SRC;
        var bd_dst = json[ccs.CONST_A_BLEND_DST] || cc.BLEND_DST;
        frameData.blendFunc.src = bd_src;
        frameData.blendFunc.dst = bd_dst;

        frameData.event = json[ccs.CONST_A_EVENT] || null;
        if (json[ccs.CONST_A_TWEEN_FRAME] !== undefined) {
            frameData.isTween = json[ccs.CONST_A_TWEEN_FRAME]
        }
        if (dataInfo.cocoStudioVersion < ccs.CONST_VERSION_COMBINED)
            frameData.duration = json[ccs.CONST_A_DURATION] || 0;
        else
            frameData.frameID = json[ccs.CONST_A_FRAME_INDEX] || 0;

        var twEPs = json[ccs.CONST_A_EASING_PARAM] || [];
        for (var i = 0; i < twEPs.length; i++) {
            var twEP = twEPs[i];
            frameData.easingParams[i] = twEP;
        }

        return frameData;
    },

    decodeTextureFromJson: function (json) {
        var textureData = new ccs.TextureData();
        textureData.name = json[ccs.CONST_A_NAME] || "";
        textureData.width = json[ccs.CONST_A_WIDTH] || 0;
        textureData.height = json[ccs.CONST_A_HEIGHT] || 0;
        textureData.pivotX = json[ccs.CONST_A_PIVOT_X] || 0;
        textureData.pivotY = json[ccs.CONST_A_PIVOT_Y] || 0;

        var contourDataList = json[ccs.CONST_CONTOUR_DATA] || [];
        for (var i = 0; i < contourDataList.length; i++) {
            var locContourData = this.decodeContourFromJson(contourDataList[i]);
            textureData.contourDataList.push(locContourData);
        }
        return textureData;
    },

    decodeContourFromJson: function (json) {
        var contourData = new ccs.ContourData();
        var vertexPointList = json[ccs.CONST_VERTEX_POINT] || [];
        for (var i = 0; i < vertexPointList.length; i++) {
            var dic = vertexPointList[i];
            var vertex = cc.p(0, 0);
            vertex.x = dic[ccs.CONST_A_X] || 0;
            vertex.y = dic[ccs.CONST_A_Y] || 0;
            contourData.vertexList.push(vertex);
        }
        return contourData;
    },

    decodeNodeFromJson: function (node, json, dataInfo) {
        node.x = json[ccs.CONST_A_X] || 0;
        node.y = json[ccs.CONST_A_Y] || 0;

        node.x *= dataInfo.contentScale;
        node.y *= dataInfo.contentScale;

        node.zOrder = json[ccs.CONST_A_Z] || 0;

        node.skewX = json[ccs.CONST_A_SKEW_X] || 0;
        node.skewY = json[ccs.CONST_A_SKEW_Y] || 0;
        if (json[ccs.CONST_A_SCALE_X] !== undefined) {
            node.scaleX = json[ccs.CONST_A_SCALE_X];
        }
        if (json[ccs.CONST_A_SCALE_Y] !== undefined) {
            node.scaleY = json[ccs.CONST_A_SCALE_Y];
        }

        var colorDic = json[ccs.CONST_COLOR_INFO] || null;
        if (colorDic) {
            //compatible old version
            if (dataInfo.cocoStudioVersion < ccs.VERSION_COLOR_READING) {
                colorDic = colorDic[0];
            }
            node.a = colorDic[ccs.CONST_A_ALPHA];
            node.r = colorDic[ccs.CONST_A_RED];
            node.g = colorDic[ccs.CONST_A_GREEN];
            node.b = colorDic[ccs.CONST_A_BLUE];
            node.isUseColorInfo = true;
            delete colorDic;
        }
    },

    removeConfigFile: function (configFile) {
        cc.arrayRemoveObject(this._configFileList, configFile);
    }
};