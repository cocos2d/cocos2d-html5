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

CC_DISPLAY_SPRITE = 0;
CC_DISPLAY_ARMATURE = 1;
CC_DISPLAY_PARTICLE = 2;
CC_DISPLAY_SHADER = 3;
CC_DISPLAY_MAX = 1000;

cc.BaseData = cc.Class.extend({
    x:0,
    y:0,
    zOrder:0,
    skewX:0,
    skewY:0,
    scaleX:1,
    scaleY:1,
    tweenRotate:0,
    isUseColorInfo:false,
    r:0,
    g:0,
    b:0,
    a:0,

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
        this.color = cc.c4f(1, 1, 1, 1);
    },


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

    subtract:function (from, to) {
        this.x = to.x - from.x;
        this.y = to.y - from.y;
        this.scaleX = to.scaleX - from.scaleX;
        this.scaleY = to.scaleY - from.scaleY;
        this.skewX = to.skewX - from.skewX;
        this.skewY = to.skewY - from.skewY;

        if (from.isUseColorInfo || to.isUseColorInfo) {
            this.a = to.a - from.a;
            this.r = to.r - from.r;
            this.g = to.g - from.g;
            this.b = to.b - from.b;
            this._useColorInfo = true;
        }

        if (this.skewX > cc.PI) {
            this.skewX -= 2 * cc.PI;
        }
        if (this.skewX < -cc.PI) {
            this.skewX += 2 * cc.PI;
        }
        if (this.skewY > cc.PI) {
            this.skewY -= 2 * cc.PI;
        }
        if (this.skewY < -cc.PI) {
            this.skewY += 2 * cc.PI;
        }

        if (to.tweenRotate) {
            this.skewX += to.tweenRotate;
            this.skewY += to.tweenRotate;
        }
    }
});

cc.DisplayData = cc.Class.extend({
    displayType:CC_DISPLAY_SPRITE,
    ctor:function () {
        this.displayType = CC_DISPLAY_SPRITE;
    },
    changeDisplayToTexture:function (displayName) {
        // remove .xxx
        var textureName = displayName;
        var startPos = textureName.lastIndexOf(".");

        if (startPos != -1) {
            textureName = textureName.substring(0, startPos);
        }
        return textureName;
    }
});

cc.SpriteDisplayData = cc.DisplayData.extend({
    displayName:"",
    ctor:function () {
        this.displayName = "";
        this.displayType = CC_DISPLAY_SPRITE;
    },
    setParam:function (displayName) {
        this.displayName = displayName;
    },
    copy:function (displayData) {
        this.displayName = displayData.displayName;
        this.displayType = displayData.displayType;
    }
});

cc.ArmatureDisplayData = cc.DisplayData.extend({
    displayName:"",
    ctor:function () {
        this.displayName = "";
        this.displayType = CC_DISPLAY_ARMATURE;

    },
    setParam:function (displayName) {
        this.displayName = displayName;
    },
    copy:function (displayData) {
        this.displayName = displayData.displayName;
        this.displayType = displayData.displayType;
    }
});

cc.ParticleDisplayData = cc.DisplayData.extend({
    plist:"",
    ctor:function () {
        this.plist = "";
        this.displayType = CC_DISPLAY_PARTICLE;

    },
    setParam:function (plist) {
        this.plist = plist;
    },
    copy:function (displayData) {
        this.plist = displayData.plist;
        this.displayType = displayData.displayType;
    }
});

cc.ShaderDisplayData = cc.DisplayData.extend({
    vert:"",
    frag:"",
    ctor:function () {
        this.vert = "";
        this.frag = "";
        this.displayType = CC_DISPLAY_SHADER;

    },
    setParam:function (vert, frag) {
        this.vert = vert;
        this.frag = frag;
    },
    copy:function (displayData) {
        this.vert = displayData.vert;
        this.frag = displayData.frag;
        this.displayType = displayData.displayType;
    }
});

cc.BoneData = cc.BaseData.extend({
    displayDataList:[],
    name:"",
    parentName:"",
    ctor:function () {
        this.displayDataList = [];
        this.name = "";
        this.parentName = "";

    },
    init:function () {

    },
    addDisplayData:function (displayData) {
        this.displayDataList.push(displayData);
    },

    getDisplayData:function (index) {
        return this.displayDataList[index];
    }
});

cc.ArmatureData = cc.Class.extend({
    boneDataDic:{},
    boneList:[],
    name:"",
    ctor:function () {
        this.boneDataDic = {};
        this.boneList = [];
        this.name = "";
    },
    init:function () {

    },
    addBoneData:function (boneData) {
        this.boneDataDic[boneData.name] = boneData;
        this.boneList.push(boneData);
    },
    getBoneDataDic:function () {
        return this.boneDataDic;
    },
    getBoneData:function (boneName) {
        return this.boneDataDic[boneName];
    }
});

cc.FrameData = cc.BaseData.extend({
        duration:1,
        tweenEasing:0,
        displayIndex:0,
        movement:"",
        event:"",
        sound:"",
        soundEffect:"",

        ctor:function () {
            cc.BaseData.prototype.ctor.call(this);
            this.duration = 1;
            this.tweenEasing = cc.TweenType.Linear;
            this.displayIndex = 0;
            this.movement = "";
            this.event = "";
            this.sound = "";
            this.soundEffect = "";
        },

        copy:function (frameData) {
            cc.BaseData.prototype.copy.call(this, frameData);
            this.duration = frameData.duration;
            this.tweenEasing = frameData.tweenEasing;
            this.displayIndex = frameData.displayIndex;
        }
    }
);

cc.MovementBoneData = cc.Class.extend({
    delay:0,
    scale:1,
    duration:0,
    frameList:[],
    name:"",
    ctor:function () {
        this.delay = 0;
        this.scale = 1;
        this.duration = 0;
        this.frameList = [];
        this.name = "";
    },
    init:function () {
        this.frameList = [];
    },
    addFrameData:function (frameData) {
        this.frameList.push(frameData);
        this.duration += frameData.duration;
    },
    getFrameData:function (index) {
        return this.frameList[index];
    }
});

cc.MovementData = cc.Class.extend({
    movBoneDataDic:{},
    duration:0,
    durationTo:0,
    durationTween:cc.TweenType.Linear,
    loop:true,
    tweenEasing:2,
    name:"",
    ctor:function () {
        this.name = "";
        this.duration = 0;
        this.durationTo = 0;
        this.durationTween = 0;
        this.loop = true;
        this.tweenEasing = cc.TweenType.Linear;
        this.movBoneDataDic = {};
    },

    addMovementBoneData:function (movBoneData) {
        this.movBoneDataDic[ movBoneData.name] = movBoneData;
    },
    getMovementBoneData:function (boneName) {
        return  this.movBoneDataDic[boneName];
    }
});

cc.AnimationData = cc.Class.extend({
    moveDataDic:{},
    movementNames:[],
    name:"",
    ctor:function () {
        this.moveDataDic = {};
        this.movementNames = [];
    },
    addMovement:function (moveData) {
        this.moveDataDic[moveData.name] = moveData;
        this.movementNames.push(moveData.name);
    },
    getMovement:function (moveName) {
        return this.moveDataDic[moveName];
    },
    getMovementCount:function () {
        return Object.keys(this.moveDataDic).length;
    }
});

cc.ContourVertex2 = function (x, y) {
    this.x = x || 0;
    this.y = y || 0;
};

cc.ContourData = cc.Class.extend({
    vertexList:[],
    ctor:function () {
        this.vertexList = [];
    },

    init:function () {
        this.vertexList = [];
    }
});

cc.TextureData = cc.Class.extend({
    height:0,
    width:0,
    pivotX:0,
    pivotY:0,
    name:"",
    contourDataList:[],
    ctor:function () {
        this.height = 0;
        this.width = 0;
        this.pivotX = 0.5;
        this.pivotY = 0.5;
        this.name = "";
        this.contourDataList = [];
    },

    init:function () {
        this.contourDataList = [];
    },

    addContourData:function (contourData) {
        this.contourDataList.push(contourData);
    },
    getContourData:function (index) {
        return this.contourDataList[index];
    }
});
