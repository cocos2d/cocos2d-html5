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
    _textureAtlasDic:null,
    _imagePaths:[],
    ctor:function () {
        this._textureAtlasDic = {};
        this._imagePaths = [];
    },
    addSpriteFrameFromFile:function (plistPath, imagePath) {
        cc.SpriteFrameCache.getInstance().addSpriteFrames(plistPath, imagePath);
    },

    getTexureAtlasWithTexture:function (texture) {
        //todo
        return null;
        var textureName = texture.getName();
        var atlas = this._textureAtlasDic[textureName];
        if (atlas == null) {
            atlas = cc.TextureAtlas.createWithTexture(texture, 20);
            this._textureAtlasDic[textureName] = atlas;
        }
        return atlas;
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