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

cc.SpriteFrameCacheHelper = cc.Class.extend({
    _display2ImageMap:[],
    _display2TextureAtlas:null,
    _imagePaths:[],
    _batchNodes:null,
    ctor:function () {
        this._display2ImageMap = [];
        this._display2TextureAtlas = {};
        this._imagePaths = [];
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
            var batchNode = cc.SpriteBatchNode.create(this._display2ImageMap[displayName], 40);
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