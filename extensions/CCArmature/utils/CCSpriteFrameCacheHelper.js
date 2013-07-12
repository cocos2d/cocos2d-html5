/**
 * Created with JetBrains WebStorm.
 * User: Administrator
 * Date: 13-6-19
 * Time: 下午2:44
 * To change this template use File | Settings | File Templates.
 */

cc.SpriteFrameCacheHelper = cc.Class.extend({
    _display2ImageMap:[],
    _display2TextureAtlas:null,
    _imagePaths:[],
    _batchNodes:null,
    ctor:function () {
        this._display2ImageMap = [];
        this._display2TextureAtlas = {};
        this._imagePaths=[];
        this._batchNodes = {};
    },
    addSpriteFrameFromFile:function (plistPath, imagePath) {
        var dict = cc.FileUtils.getInstance().dictionaryWithContentsOfFileThreadSafe(plistPath);
        var framesDict = dict["frames"];
        for (var key in framesDict) {
            var spriteFrameName = key.toString();
            this._display2ImageMap[spriteFrameName] = imagePath;
        }
        dict = null;
        cc.SpriteFrameCache.getInstance().addSpriteFrames(plistPath, imagePath);
    },

    getDisplayImagePath:function (_displayName) {
        return this._display2ImageMap[_displayName];
    },
    getTextureAtlas:function (displayName) {
        var textureName = this.getDisplayImagePath(displayName);
        var atlas = this._display2TextureAtlas[textureName];
        if (atlas == null) {
            atlas = cc.TextureAtlas.createWithTexture(cc.TextureCache.getInstance().addImage(textureName), 20);
            this._display2TextureAtlas[textureName] = atlas;
        }
        return atlas;
    },
    getBatchNode:function (displayName) {
        var textureName = this.getDisplayImagePath(displayName);
        var batchNode = this._batchNodes[textureName];
        if (batchNode == null) {
            var batchNode = cc.SpriteBatchNode.create(this._display2ImageMap[displayName],40);
            this._batchNodes[textureName] = batchNode;
        }
        return batchNode;
    }
});
cc.SpriteFrameCacheHelper.getInstance = function () {
    if (!this._instance) {
        this._instance = new cc.SpriteFrameCacheHelper();
    }
    return this._instance;
};
cc.SpriteFrameCacheHelper.purge = function () {
    this._instance = null;
};