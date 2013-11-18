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

ccs.BlendType = {
    normal: 0,
    layer: 1,
    darken: 2,
    multiply: 3,
    lighten: 4,
    screen: 5,
    overlay: 6,
    highlight: 7,
    add: 8,
    subtract: 9,
    difference: 10,
    invert: 11,
    alpha: 12,
    erase: 13
};
ccs.DisplayType = {
    sprite: 0,
    armature: 1,
    particle: 2,
    max: 3
};

ccs.BaseData = cc.Class.extend({
    x:0,
    y:0,
    zOrder:0,
    skewX:0,
    skewY:0,
    scaleX:1,
    scaleY:1,
    tweenRotate:0,
    isUseColorInfo:false,
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

    setColor:function(color){
        this.r = color.r;
        this.g = color.g;
        this.b = color.b;
        this.a = color.a;
    },

    getColor:function(){
        return cc.c4f(this.r, this.g, this.b, this.a);
    },

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

        if (limit){
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
        }

        if (to.tweenRotate) {
            this.skewX += to.tweenRotate;
            this.skewY += to.tweenRotate;
        }
    }
});

ccs.DisplayData = cc.Class.extend({
    displayType:ccs.DisplayType.max,
    ctor:function () {
        this.displayType = ccs.DisplayType.max;
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

ccs.SpriteDisplayData = ccs.DisplayData.extend({
    displayName:"",
    skinData:null,
    ctor:function () {
        this.displayName = "";
        this.skinData = new ccs.BaseData();
        this.displayType = ccs.DisplayType.sprite;
    },
    setParam:function (displayName) {
        this.displayName = displayName;
    },
    copy:function (displayData) {
        this.displayName = displayData.displayName;
        this.displayType = displayData.displayType;
        this.skinData = displayData.skinData;
    }
});

ccs.NodeDisplayData = ccs.DisplayData.extend({
    node:null,
    ctor:function () {
        this.displayName = "";
        this.displayType = CC_DISPLAY_NODE;
        this.node = null;
    },
    copy:function (displayData) {
        this.displayName = displayData.displayName;
        this.displayType = displayData.displayType;
        this.node = displayData.node;
    }
});

ccs.ArmatureDisplayData = ccs.DisplayData.extend({
    displayName:"",
    ctor:function () {
        this.displayName = "";
        this.displayType = ccs.DisplayType.armature;

    },
    setParam:function (displayName) {
        this.displayName = displayName;
    },
    copy:function (displayData) {
        this.displayName = displayData.displayName;
        this.displayType = displayData.displayType;
    }
});

ccs.ParticleDisplayData = ccs.DisplayData.extend({
    plist:"",
    ctor:function () {
        this.plist = "";
        this.displayType = ccs.DisplayType.particle;

    },
    setParam:function (plist) {
        this.plist = plist;
    },
    copy:function (displayData) {
        this.plist = displayData.plist;
        this.displayType = displayData.displayType;
    }
});

ccs.ShaderDisplayData = ccs.DisplayData.extend({
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

ccs.BoneData = ccs.BaseData.extend({
    displayDataList:null,
    name:"",
    parentName:"",
    boneDataTransform:null,
    ctor:function () {
        this.displayDataList = [];
        this.name = "";
        this.parentName = "";
        this.boneDataTransform = null;

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

ccs.ArmatureData = cc.Class.extend({
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
    addBoneData:function (boneData) {
        this.boneDataDic[boneData.name] = boneData;
    },
    getBoneDataDic:function () {
        return this.boneDataDic;
    },
    getBoneData:function (boneName) {
        return this.boneDataDic[boneName];
    }
});

ccs.FrameData = ccs.BaseData.extend({
        duration:0,
        tweenEasing:0,
        displayIndex:-1,
        movement:"",
        event:"",
        sound:"",
        soundEffect:"",
        blendType:0,
        frameID:0,
        isTween:true,
        ctor:function () {
            ccs.BaseData.prototype.ctor.call(this);
            this.duration = 1;
            this.tweenEasing = ccs.TweenType.linear;
            this.displayIndex = 0;
            this.movement = "";
            this.event = "";
            this.sound = "";
            this.soundEffect = "";
            this.blendType = ccs.BlendType.normal;
            this.frameID = 0;
            this.isTween = true;
        },

        copy:function (frameData) {
            ccs.BaseData.prototype.copy.call(this, frameData);
            this.duration = frameData.duration;
            this.tweenEasing = frameData.tweenEasing;
            this.displayIndex = frameData.displayIndex;
            this.movement = frameData.movement;
            this.event = frameData.event;
            this.sound = frameData.sound;
            this.soundEffect = frameData.soundEffect;
            this.blendType = frameData.blendType;
            this.isTween = frameData.isTween;
        }
    }
);

ccs.MovementBoneData = cc.Class.extend({
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
        this.frameList = [];
    },
    addFrameData:function (frameData) {
        this.frameList.push(frameData);
    },
    getFrameData:function (index) {
        return this.frameList[index];
    }
});

ccs.MovementData = cc.Class.extend({
    movBoneDataDic:null,
    duration:0,
    scale:1,
    durationTo:0,
    durationTween:ccs.TweenType.linear,
    loop:true,
    tweenEasing:2,
    name:"",
    ctor:function () {
        this.name = "";
        this.duration = 0;
        this.scale = 1;
        this.durationTo = 0;
        this.durationTween = 0;
        this.loop = true;
        this.tweenEasing = ccs.TweenType.linear;
        this.movBoneDataDic = {};
    },

    addMovementBoneData:function (movBoneData) {
        this.movBoneDataDic[ movBoneData.name] = movBoneData;
    },
    getMovementBoneData:function (boneName) {
        return  this.movBoneDataDic[boneName];
    }
});

ccs.AnimationData = cc.Class.extend({
    moveDataDic:null,
    movementNames:null,
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

ccs.ContourVertex2 = function (x, y) {
    this.x = x || 0;
    this.y = y || 0;
};

ccs.ContourData = cc.Class.extend({
    vertexList:null,
    ctor:function () {
        this.vertexList = [];
    },

    init:function () {
        this.vertexList = [];
        return true;
    },

    /**
     *
     * @param {cc.p} p
     */
    addVertex: function (p) {
       var v = ccs.ContourVertex2(p.x, p.y);
       this.vertexList.push(v);
    }
});

ccs.TextureData = cc.Class.extend({
    height:0,
    width:0,
    pivotX:0,
    pivotY:0,
    name:"",
    contourDataList:null,
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
