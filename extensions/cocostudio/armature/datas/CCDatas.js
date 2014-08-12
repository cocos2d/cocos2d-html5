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

//BlendType
/**
 * The value of the blend type of normal
 * @constant
 * @type Number
 */
ccs.BLEND_TYPE_NORMAL = 0;

/**
 * The value of the blend type of layer
 * @constant
 * @type Number
 */
ccs.BLEND_TYPE_LAYER = 1;

/**
 * The value of the blend type of darken
 * @constant
 * @type Number
 */
ccs.BLEND_TYPE_DARKEN = 2;

/**
 * The value of the blend type of multiply
 * @constant
 * @type Number
 */
ccs.BLEND_TYPE_MULTIPLY = 3;

/**
 * The value of the blend type of lighten
 * @constant
 * @type Number
 */
ccs.BLEND_TYPE_LIGHTEN = 4;

/**
 * The value of the blend type of screen
 * @constant
 * @type Number
 */
ccs.BLEND_TYPE_SCREEN = 5;

/**
 * The value of the blend type of overlay
 * @constant
 * @type Number
 */
ccs.BLEND_TYPE_OVERLAY = 6;

/**
 * The value of the blend type of highlight
 * @constant
 * @type Number
 */
ccs.BLEND_TYPE_HIGHLIGHT = 7;

/**
 * The value of the blend type of add
 * @constant
 * @type Number
 */
ccs.BLEND_TYPE_ADD = 8;

/**
 * The value of the blend type of subtract
 * @constant
 * @type Number
 */
ccs.BLEND_TYPE_SUBTRACT = 9;

/**
 * The value of the blend type of difference
 * @constant
 * @type Number
 */
ccs.BLEND_TYPE_DIFFERENCE = 10;

/**
 * The value of the blend type of invert
 * @constant
 * @type Number
 */
ccs.BLEND_TYPE_INVERT = 11;

/**
 * The value of the blend type of alpha
 * @constant
 * @type Number
 */
ccs.BLEND_TYPE_ALPHA = 12;

/**
 * The value of the blend type of erase
 * @constant
 * @type Number
 */
ccs.BLEND_TYPE_ERASE = 13;


//DisplayType
ccs.DISPLAY_TYPE_SPRITE = 0;
ccs.DISPLAY_TYPE_ARMATURE = 1;
ccs.DISPLAY_TYPE_PARTICLE = 2;
ccs.DISPLAY_TYPE_MAX = 3;

/**
 * Base class for ccs.BaseData objects.
 * @class
 * @extends ccs.Class
 */
ccs.BaseData = ccs.Class.extend(/** @lends ccs.BaseData# */{
    x:0,
    y:0,
    zOrder:0,
    /**
     * x y skewX skewY scaleX scaleY used to calculate transform matrix
     * skewX, skewY can have rotation effect
     * To get more matrix information, you can have a look at this pape : http://www.senocular.com/flash/tutorials/transformmatrix/
     */
    skewX:0,
    skewY:0,
    scaleX:1,
    scaleY:1,
    tweenRotate:0,                               //! SkewX, SkewY, and TweenRotate effect the rotation
    isUseColorInfo:false,                       //! Whether or not this frame have the color changed Info
    r:255,
    g:255,
    b:255,
    a:255,

    ctor:function () {
        this.x = 0;
        this.y = 0;
        this.zOrder = 0;
        this.skewX = 0;
        this.skewY = 0;
        this.scaleX = 1;
        this.scaleY = 1;
        this.tweenRotate = 0;
        this.isUseColorInfo = false;
        this.r = 255;
        this.g = 255;
        this.b = 255;
        this.a = 255;
    },

    /**
     * Copy data from node
     * @function
     * @param {ccs.BaseData} node
     */
    copy:function (node) {
        this.x = node.x;
        this.y = node.y;
        this.zOrder = node.zOrder;

        this.scaleX = node.scaleX;
        this.scaleY = node.scaleY;
        this.skewX = node.skewX;
        this.skewY = node.skewY;

        this.tweenRotate = node.tweenRotate;

        this.isUseColorInfo = node.isUseColorInfo;
        this.r = node.r;
        this.g = node.g;
        this.b = node.b;
        this.a = node.a;
    },

    /**
     * color setter
     * @function
     * @param {cc.Color} color
     */
    setColor:function(color){
        this.r = color.r;
        this.g = color.g;
        this.b = color.b;
        this.a = color.a;
    },

    /**
     * color getter
     * @function
     * @returns {cc.Color}
     */
    getColor:function(){
        return cc.color(this.r, this.g, this.b, this.a);
    },

    /**
     * Calculate two baseData's between value(to - from) and set to self
     * @function
     * @param {ccs.BaseData} from
     * @param {ccs.BaseData} to
     * @param {Boolean} limit
     */
    subtract:function (from, to, limit) {
        this.x = to.x - from.x;
        this.y = to.y - from.y;
        this.scaleX = to.scaleX - from.scaleX;
        this.scaleY = to.scaleY - from.scaleY;
        this.skewX = to.skewX - from.skewX;
        this.skewY = to.skewY - from.skewY;

        if (this.isUseColorInfo || from.isUseColorInfo || to.isUseColorInfo) {
            this.a = to.a - from.a;
            this.r = to.r - from.r;
            this.g = to.g - from.g;
            this.b = to.b - from.b;
            this.isUseColorInfo = true;
        } else {
            this.a = this.r = this.g = this.b = 0;
            this.isUseColorInfo = false;
        }

        if (limit) {
            if (this.skewX > ccs.M_PI)
                this.skewX -= ccs.DOUBLE_PI;
            if (this.skewX < -ccs.M_PI)
                this.skewX += ccs.DOUBLE_PI;
            if (this.skewY > ccs.M_PI)
                this.skewY -= ccs.DOUBLE_PI;
            if (this.skewY < -ccs.M_PI)
                this.skewY += ccs.DOUBLE_PI;
        }

        if (to.tweenRotate) {
            this.skewX += to.tweenRotate * ccs.PI * 2;
            this.skewY -= to.tweenRotate * ccs.PI * 2;
        }
    }
});

/**
 * Base class for ccs.DisplayData objects.
 * @class
 * @extends ccs.Class
 */
ccs.DisplayData = ccs.Class.extend(/** @lends ccs.DisplayData# */{
    displayType: ccs.DISPLAY_TYPE_MAX,
    displayName: "",
    ctor: function () {
        this.displayType = ccs.DISPLAY_TYPE_MAX;
    },
    /**
     * change display name to texture type
     * @function
     * @param {String} displayName
     * @returns {String}
     */
    changeDisplayToTexture:function (displayName) {
        // remove .xxx
        var textureName = displayName;
        var startPos = textureName.lastIndexOf(".");

        if (startPos != -1)
            textureName = textureName.substring(0, startPos);
        return textureName;
    },
    /**
     * copy data
     * @function
     * @param {ccs.DisplayData} displayData
     */
    copy:function (displayData) {
        this.displayName = displayData.displayName;
        this.displayType = displayData.displayType;
    }
});

/**
 * Base class for ccs.SpriteDisplayData objects.
 * @class
 * @extends ccs.DisplayData
 */
ccs.SpriteDisplayData = ccs.DisplayData.extend(/** @lends ccs.SpriteDisplayData# */{
    skinData:null,
    ctor:function () {
        this.skinData = new ccs.BaseData();
        this.displayType = ccs.DISPLAY_TYPE_SPRITE;
    },
    /**
     * copy data
     * @function
     * @param {ccs.SpriteDisplayData} displayData
     */
    copy:function (displayData) {
        ccs.DisplayData.prototype.copy.call(this,displayData);
        this.skinData = displayData.skinData;
    },
    SpriteDisplayData: function(){
        this.displayType = ccs.DISPLAY_TYPE_SPRITE;
    }
});

/**
 * Base class for ccs.ArmatureDisplayData objects.
 * @class ccs.ArmatureDisplayData
 * @extends ccs.DisplayData
 */
ccs.ArmatureDisplayData = ccs.DisplayData.extend(/** @lends ccs.ArmatureDisplayData# */{
    displayName:"",
    ctor:function () {
        this.displayName = "";
        this.displayType = ccs.DISPLAY_TYPE_ARMATURE;
    }
});

/**
 * Base class for ccs.ParticleDisplayData objects.
 * @class ccs.ParticleDisplayData
 * @extends ccs.DisplayData
 */
ccs.ParticleDisplayData = ccs.DisplayData.extend(/** @lends ccs.ParticleDisplayData# */{
    ctor:function () {
        this.displayType = ccs.DISPLAY_TYPE_PARTICLE;
    }
});

/**
 * <p>
 *      BoneData used to init a Bone.                                                               <br/>
 *      BoneData keeps a DisplayData list, a Bone can have many display to change.                  <br/>
 *      The display information saved in the DisplayData                                            <br/>
 * </p>
 * @class ccs.BoneData
 * @extends ccs.BaseData
 */
ccs.BoneData = ccs.BaseData.extend(/** @lends ccs.BoneData# */{
    displayDataList: null,
    name: "",
    parentName: "",
    boneDataTransform: null,

    ctor: function () {
        this.displayDataList = [];
        this.name = "";
        this.parentName = "";
        this.boneDataTransform = null;

    },

    init: function () {
        this.displayDataList.length = 0;
        return true;
    },
    /**
     * add display data
     * @function
     * @param {ccs.DisplayData} displayData
     */
    addDisplayData:function (displayData) {
        this.displayDataList.push(displayData);
    },

    /**
     * get display data
     * @function
     * @param {Number} index
     * @returns {ccs.DisplayData}
     */
    getDisplayData:function (index) {
        return this.displayDataList[index];
    }
});

/**
 * <p>
 * ArmatureData saved the Armature name and BoneData needed for the CCBones in this Armature      <br/>
 * When we create a Armature, we need to get each Bone's BoneData as it's init information.       <br/>
 * So we can get a BoneData from the Dictionary saved in the ArmatureData.                        <br/>
 * </p>
 * @class ccs.ArmatureData
 * @extends ccs.Class
 */
ccs.ArmatureData = ccs.Class.extend(/** @lends ccs.ArmatureData# */{
    boneDataDic:null,
    name:"",
    dataVersion:0.1,
    ctor:function () {
        this.boneDataDic = {};
        this.name = "";
        this.dataVersion = 0.1;
    },
    init:function () {
        return true;
    },
    /**
     * adds bone data to dictionary
     * @param {ccs.BoneData} boneData
     */
    addBoneData:function (boneData) {
        this.boneDataDic[boneData.name] = boneData;
    },
    /**
     * gets bone data dictionary
     * @returns {Object}
     */
    getBoneDataDic:function () {
        return this.boneDataDic;
    },
    /**
     * get bone data by bone name
     * @function
     * @param {String} boneName
     * @returns {ccs.BoneData}
     */
    getBoneData:function (boneName) {
        return this.boneDataDic[boneName];
    }
});

/**
 * Base class for ccs.FrameData objects.
 * @class ccs.FrameData
 * @extends ccs.BaseData
 */
ccs.FrameData = ccs.BaseData.extend(/** @lends ccs.FrameData# */{
        duration:0,
        tweenEasing:0,
        easingParamNumber: 0,
        easingParams: null,
        displayIndex:-1,
        movement:"",
        event:"",
        sound:"",
        soundEffect:"",
        blendFunc:0,
        frameID:0,
        isTween:true,

        ctor:function () {
            ccs.BaseData.prototype.ctor.call(this);
            this.duration = 1;
            this.tweenEasing = ccs.TweenType.linear;
            this.easingParamNumber = 0;
            this.easingParams = [];
            this.displayIndex = 0;
            this.movement = "";
            this.event = "";
            this.sound = "";
            this.soundEffect = "";
            this.blendFunc = new cc.BlendFunc(cc.BLEND_SRC, cc.BLEND_DST);
            this.frameID = 0;
            this.isTween = true;
        },

        /**
         * copy data
         * @function
         * @param frameData
         */
        copy:function (frameData) {
            ccs.BaseData.prototype.copy.call(this, frameData);
            this.duration = frameData.duration;
            this.displayIndex = frameData.displayIndex;

            this.tweenEasing = frameData.tweenEasing;
            this.easingParamNumber = frameData.easingParamNumber;

//            this.movement = frameData.movement;
//            this.event = frameData.event;
//            this.sound = frameData.sound;
//            this.soundEffect = frameData.soundEffect;
//            this.easingParams.length = 0;
            if (this.easingParamNumber != 0){
                for (var i = 0; i<this.easingParamNumber; i++){
                    this.easingParams[i] = frameData.easingParams[i];
                }
            }
            this.blendFunc = frameData.blendFunc;
            this.isTween = frameData.isTween;

        }
    }
);

/**
 * Base class for ccs.MovementBoneData objects.
 * @class ccs.MovementBoneData
 * @extends ccs.Class
 */
ccs.MovementBoneData = ccs.Class.extend(/** @lends ccs.MovementBoneData# */{
    delay:0,
    scale:1,
    duration:0,
    frameList:null,
    name:"",
    ctor:function () {
        this.delay = 0;
        this.scale = 1;
        this.duration = 0;
        this.frameList = [];
        this.name = "";
    },

    init:function () {
        return true;
    },
    /**
     * add frame data
     * @function
     * @param {ccs.FrameData} frameData
     */
    addFrameData:function (frameData) {
        this.frameList.push(frameData);
    },
    /**
     * get frame data
     * @function
     * @param {Number} index
     * @returns {ccs.FrameData}
     */
    getFrameData:function (index) {
        return this.frameList[index];
    }
});

/**
 * The movement data information of Cocos Armature.
 * @class ccs.MovementData
 * @constructor
 */
ccs.MovementData = function(){
    this.name = "";
    this.duration = 0;
    this.scale = 1;
    /**
     * Change to this movement will last durationTo frames. Use this effect can avoid too suddenly changing.
     *
     * Example : current movement is "stand", we want to change to "run", then we fill durationTo frames before
     * change to "run" instead of changing to "run" directly.
     */
    this.durationTo = 0;
    /**
     * This is different from duration, durationTween contain tween effect.
     * duration is the raw time that the animation will last, it's the same with the time you edit in the Action Editor.
     * durationTween is the actual time you want this animation last.
     * Example : If we edit 10 frames in the flash, then duration is 10. When we set durationTween to 50, the movement will last 50 frames, the extra 40 frames will auto filled with tween effect
     */
    this.durationTween = 0;
    this.loop = true;                            //! whether the movement was looped
    /**
     * Which tween easing effect the movement use
     * TWEEN_EASING_MAX : use the value from MovementData get from flash design panel
     */
    this.tweenEasing = ccs.TweenType.linear;
    this.movBoneDataDic = {};
};

/**
 * add a movement bone data to dictionary
 * @param {ccs.MovementBoneData} movBoneData
 */
ccs.MovementData.prototype.addMovementBoneData = function(movBoneData){
    this.movBoneDataDic[ movBoneData.name] = movBoneData;
};

/**
 * add a movement bone data from dictionary by name
 * @param boneName
 * @returns {ccs.MovementBoneData}
 */
ccs.MovementData.prototype.getMovementBoneData = function(boneName){
    return  this.movBoneDataDic[boneName];
};

/**
 * <p>
 * The animation data information of Cocos Armature. It include all movement information for the Armature.         <br/>
 * The struct is AnimationData -> MovementData -> MovementBoneData -> FrameData                                    <br/>
 *                                              -> MovementFrameData                                               <br/>
 * </p>
 * @class ccs.AnimationData
 * @extends ccs.Class
 */
ccs.AnimationData = function(){
    this.movementDataDic = {};
    this.movementNames = [];
    this.name = "";
};

/**
 * adds movement data to the movement data dictionary
 * @param {ccs.MovementData} moveData
 */
ccs.AnimationData.prototype.addMovement = function(moveData){
    this.movementDataDic[moveData.name] = moveData;
    this.movementNames.push(moveData.name);
};

/**
 * gets movement data from movement data dictionary
 * @param {String} moveName
 * @returns {ccs.MovementData}
 */
ccs.AnimationData.prototype.getMovement = function(moveName){
    return this.movementDataDic[moveName];
};

/**
 * gets the count of movement data dictionary
 * @returns {Number}
 */
ccs.AnimationData.prototype.getMovementCount = function(){
    return Object.keys(this.movementDataDic).length;
};

/**
 * contour vertex
 * @class ccs.ContourVertex2
 * @param {Number} x
 * @param {Number} y
 * @constructor
 */
ccs.ContourVertex2 = function (x, y) {
    this.x = x || 0;
    this.y = y || 0;
};

/**
 * The Contour data information of Cocos Armature.
 * @class ccs.ContourData
 * @constructor
 */
ccs.ContourData = function(){
    this.vertexList = [];
};

ccs.ContourData.prototype.init = function(){
    this.vertexList.length = 0;
    return true;
};

/**
 * add a vertex object to vertex list
 * @param {cc.Point} p
 */
ccs.ContourData.prototype.addVertex = function(p){
    //var v = new ccs.ContourVertex2(p.x, p.y);              //ccs.ContourVertex2 is same as cc.Point, so we needn't create a ccs.ContourVertex2 object
    this.vertexList.push(p);
};

/**
 * The texture data information of Cocos Armature
 * @class ccs.TextureData
 */
ccs.TextureData = function(){
    this.height = 0;
    this.width = 0;
    this.pivotX = 0.5;
    this.pivotY = 0.5;
    this.name = "";
    this.contourDataList = [];
};

ccs.TextureData.prototype.init = function(){
    this.contourDataList.length = 0;
};

/**
 * adds a contourData to contourDataList
 * @param {ccs.ContourData} contourData
 */
ccs.TextureData.prototype.addContourData = function(contourData){
    this.contourDataList.push(contourData);
};

/**
 * gets a contourData from contourDataList by index
 * @param {Number} index
 * @returns {ccs.ContourData}
 */
ccs.TextureData.prototype.getContourData = function(index){
    return this.contourDataList[index];
};
