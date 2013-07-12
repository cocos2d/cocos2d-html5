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

/**
 * format and manage armature configuration and armature animation
 * @class
 * @extends cc.Class
 */
cc.ArmatureDataManager = cc.Class.extend({
    _animationDatas:null,
    _armarureDatas:null,
    _textureDatas:null,
    ctor:function () {
        this._animationDatas = {};
        this._armarureDatas = {};
        this._textureDatas = {};
    },
    init:function () {

    },

    /**
     * Add armature data
     * @param {string} id The id of the armature data
     * @param {cc.ArmatureData} armatureData
     */
    addArmatureData:function (id, armatureData) {
        if (this._armarureDatas) {
            this._armarureDatas[id] = armatureData;
        }
    },

    /**
     * get armatureData by id
     * @param {String} id
     * @return {cc.ArmatureData}
     */
    getArmatureData:function (id) {
        var armatureData = null;
        if (this._armarureDatas) {
            armatureData = this._armarureDatas[id];
        }
        return armatureData;
    },

    /**
     * add animation data
     * @param {String} id
     * @param {cc.AnimationData} animationData
     */
    addAnimationData:function (id, animationData) {
        if (this._animationDatas) {
            this._animationDatas[id] = animationData;
        }
    },

    /**
     * get animationData by id
     * @param {String} id
     * @return {cc.AnimationData}
     */
    getAnimationData:function (id) {
        var animationData = null;
        if (this._animationDatas[id]) {
            animationData = this._animationDatas[id];
        }
        return animationData;
    },

    /**
     * add texture data
     * @param {String} id
     * @param {cc.TextureData} textureData
     */
    addTextureData:function (id, textureData) {
        if (this._textureDatas) {
            this._textureDatas[id] = textureData;
        }
    },

    /**
     * get animationData by id
     * @param {String} id
     * @return {cc.TextureData}
     */
    getTextureData:function (id) {
        var textureData = null;
        if (this._textureDatas) {
            textureData = this._textureDatas[id];
        }
        return textureData;
    },

    /**
     * Add ArmatureFileInfo, it is managed by CCArmatureDataManager.
     * @param {String} imagePath
     * @param {String} plistPath
     * @param {String} configFilePath
     */
    addArmatureFileInfo:function (imagePath, plistPath, configFilePath) {
        cc.DataReaderHelper.addDataFromFile(configFilePath);
        this.addSpriteFrameFromFile(plistPath, imagePath);
    },

    /**
     * Add sprite frame to CCSpriteFrameCache, it will save display name and it's relative image name
     * @param {String} plistPath
     * @param {String} imagePath
     */
    addSpriteFrameFromFile:function (plistPath, imagePath) {
        cc.SpriteFrameCacheHelper.getInstance().addSpriteFrameFromFile(plistPath, imagePath);
    },

    removeAll:function () {
        this._animationDatas = null;
        this._armarureDatas = null;
        this._textureDatas = null;
        cc.DataReaderHelper.clear();
    }
});

cc.ArmatureDataManager._instance = null;
cc.ArmatureDataManager.getInstance = function () {
    if (!this._instance) {
        this._instance = new cc.ArmatureDataManager();
        this._instance.init();
    }
    return this._instance;
};
cc.ArmatureDataManager.purge = function () {
    cc.SpriteFrameCacheHelper.purge();
    cc.PhysicsWorld.purge();
    this._instance = null;
};