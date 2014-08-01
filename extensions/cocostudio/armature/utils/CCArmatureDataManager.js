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
 * RelativeData
 * @constructor
 */
ccs.RelativeData = function(){
    this.plistFiles=[];
    this.armatures=[];
    this.animations=[];
    this.textures=[];
};

/**
 * Format and manage armature configuration and armature animation
 * @namespace
 * @name ccs.armatureDataManager
 */
ccs.armatureDataManager = /** @lends ccs.armatureDataManager# */{
    _animationDatas: {},
    _armarureDatas: {},
    _textureDatas: {},
    _autoLoadSpriteFile: false,
    _relativeDatas: {},

    s_sharedArmatureDataManager: null,

    /**
     * remove armature cache data by configFilePath
     * @param {String} configFilePath
     */
    removeArmatureFileInfo:function(configFilePath){
        var data = this.getRelativeData(configFilePath);
        if(data){
            for (var i = 0; i < data.armatures.length; i++) {
                var obj = data.armatures[i];
                this.removeArmatureData(obj);
            }
            for (var i = 0; i < data.animations.length; i++) {
                var obj = data.animations[i];
                this.removeAnimationData(obj);
            }
            for (var i = 0; i < data.textures.length; i++) {
                var obj = data.textures[i];
                this.removeTextureData(obj);
            }
            for (var i = 0; i < data.plistFiles.length; i++) {
                var obj = data.plistFiles[i];
                cc.spriteFrameCache.removeSpriteFramesFromFile(obj);
            }
            delete this._relativeDatas[configFilePath];
            ccs.dataReaderHelper.removeConfigFile(configFilePath);
        }
    },

    /**
     * Add armature data
     * @param {string} id The id of the armature data
     * @param {ccs.ArmatureData} armatureData
     */
    addArmatureData:function (id, armatureData, configFilePath) {
//        if (this._armarureDatas) {
//            var data = this.getRelativeData(configFilePath);
//            data.armatures.push(id);
//            this._armarureDatas[id] = armatureData;
//        }
        var data = this.getRelativeData(configFilePath);
        if (data)
        {
            data.armatures.push(id);
        }
        this._armarureDatas[id] = armatureData;
    },

    /**
     * get armatureData by id
     * @param {String} id
     * @return {ccs.ArmatureData}
     */
    getArmatureData:function (id) {
        var armatureData = null;
        if (this._armarureDatas) {
            armatureData = this._armarureDatas[id];
        }
        return armatureData;
    },

    /**
     * remove armature data
     * @param {string} id
     */
    removeArmatureData:function(id){
        if (this._armarureDatas[id])
            delete this._armarureDatas[id];
    },

    /**
     * add animation data
     * @param {String} id
     * @param {ccs.AnimationData} animationData
     */
    addAnimationData:function (id, animationData, configFilePath) {
//        if (this._animationDatas) {
//            var data = this.getRelativeData(configFilePath);
//            data.animations.push(id);
//            this._animationDatas[id] = animationData;
//        }
        var data = this.getRelativeData(configFilePath);
        if(data){
            data.animations.push(id);
        }
        this._animationDatas[id] = animationData;
    },

    /**
     * get animationData by id
     * @param {String} id
     * @return {ccs.AnimationData}
     */
    getAnimationData:function (id) {
        var animationData = null;
        if (this._animationDatas[id]) {
            animationData = this._animationDatas[id];
        }
        return animationData;
    },

    /**
     * remove animation data
     * @param {string} id
     */
    removeAnimationData:function(id){
        if (this._animationDatas[id])
            delete this._animationDatas[id];
    },

    /**
     * add texture data
     * @param {String} id
     * @param {ccs.TextureData} textureData
     */
    addTextureData:function (id, textureData, configFilePath) {
//        if (this._textureDatas) {
//            var data = this.getRelativeData(configFilePath);
//            data.textures.push(id);
//            this._textureDatas[id] = textureData;
//        }
        var data = this.getRelativeData(configFilePath);
        if (data)
        {
            data.textures.push(id);
        }

        this._textureDatas[id] = textureData;
    },

    /**
     * get textureData by id
     * @param {String} id
     * @return {ccs.TextureData}
     */
    getTextureData:function (id) {
        var textureData = null;
        if (this._textureDatas) {
            textureData = this._textureDatas[id];
        }
        return textureData;
    },

    /**
     * remove texture data
     * @param {string} id
     */
    removeTextureData:function(id){
        if (this._textureDatas[id])
            delete this._textureDatas[id];
    },

    /**
     * Add ArmatureFileInfo, it is managed by CCArmatureDataManager.
     * @param {String} imagePath
     * @param {String} plistPath
     * @param {String} configFilePath
     * @example
     * //example1
     * ccs.armatureDataManager.addArmatureFileInfo("res/test.json");
     * //example2
     * ccs.armatureDataManager.addArmatureFileInfo("res/test.png","res/test.plist","res/test.json");
     */
    addArmatureFileInfo:function (/*imagePath, plistPath, configFilePath*/) {
//        var imagePath, plistPath, configFilePath;
//        var isLoadSpriteFrame = false;
//        if (arguments.length == 1) {
//            configFilePath = arguments[0];
//            isLoadSpriteFrame = true;
//            this.addRelativeData(configFilePath);
//        } else if (arguments.length == 3){
//            imagePath = arguments[0];
//            plistPath = arguments[1];
//            configFilePath = arguments[2];
//            this.addRelativeData(configFilePath);
//            this.addSpriteFrameFromFile(plistPath, imagePath, configFilePath);
//        }
//        ccs.dataReaderHelper.addDataFromFile(configFilePath,isLoadSpriteFrame);
        var imagePath, plistPath, configFilePath;
        switch(arguments.length){
            case 1:
                configFilePath = arguments[0];

                this.addRelativeData(configFilePath);

                this._autoLoadSpriteFile = true;
                ccs.dataReaderHelper.addDataFromFile(configFilePath);
                break;
            case 3:
                imagePath = arguments[0];
                plistPath = arguments[1];
                configFilePath = arguments[2];

                this.addRelativeData(configFilePath);

                this._autoLoadSpriteFile = false;
                ccs.dataReaderHelper.addDataFromFile(configFilePath);
                this.addSpriteFrameFromFile(plistPath, imagePath);
        }
    },

    /**
     * Add ArmatureFileInfo, it is managed by CCArmatureDataManager.
     * @param {String} imagePath
     * @param {String} plistPath
     * @param {String} configFilePath
     * @param {Function} selector
     * @param {Object} target
     */
    addArmatureFileInfoAsync:function (/*imagePath, plistPath, configFilePath, selector, target*/) {
        var imagePath, plistPath, configFilePath, target, selector;
        switch(arguments.length){
            case 3:
                configFilePath = arguments[0];
                target = arguments[2];
                selector = arguments[1];
                this.addRelativeData(configFilePath);
                this._autoLoadSpriteFile = true;
                ccs.dataReaderHelper.addDataFromFileAsync("", "", configFilePath, selector,target);
                break;
            case 5:
                imagePath = arguments[0];
                plistPath = arguments[1];
                configFilePath = arguments[2];
                target = arguments[4];
                selector = arguments[3];
                this.addRelativeData(configFilePath);

                this._autoLoadSpriteFile = false;
                ccs.dataReaderHelper.addDataFromFileAsync(imagePath, plistPath, configFilePath, selector, target);
                this.addSpriteFrameFromFile(plistPath, imagePath);
        }
    },

    /**
     * Add sprite frame to CCSpriteFrameCache, it will save display name and it's relative image name
     * @param {String} plistPath
     * @param {String} imagePath
     * @param {String} configFilePath
     */
    addSpriteFrameFromFile:function (plistPath, imagePath, configFilePath) {
        var data = this.getRelativeData(configFilePath);
        if(data)
            data.plistFiles.push(plistPath);
        ccs.spriteFrameCacheHelper.addSpriteFrameFromFile(plistPath, imagePath);
    },

    isAutoLoadSpriteFile:function(){
        return this._autoLoadSpriteFile;
    },

    /**
     * get armatureDatas
     * @return {Object}
     */
    getArmatureDatas:function () {
        return this._armarureDatas;
    },

    /**
     * get animationDatas
     * @return {Object}
     */
    getAnimationDatas:function () {
        return this._animationDatas;
    },

    /**
     * get textureDatas
     * @return {Object}
     */
    getTextureDatas:function () {
        return this._textureDatas;
    },

    /**
     * add RelativeData
     * @param {String} configFilePath
     */
    addRelativeData: function (configFilePath) {
        if (!this._relativeDatas[configFilePath])
            this._relativeDatas[configFilePath] = new ccs.RelativeData();
    },

    /**
     * get RelativeData
     * @param {String} configFilePath
     * @returns {ccs.RelativeData}
     */
    getRelativeData: function (configFilePath) {
        return this._relativeDatas[configFilePath];
    },

    /**
     * Clear data
     */
    clear: function() {
        this._animationDatas = {};
        this._armarureDatas = {};
        this._textureDatas = {};
        ccs.spriteFrameCacheHelper.clear();
        ccs.dataReaderHelper.clear();
    }
};