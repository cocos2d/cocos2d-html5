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

cc.UIHelper = cc.Class.extend({
    _fileDesignWidth: 0,
    _fileDesignHeight: 0,
//texture
    _textureFiles: [],
    ctor: function () {
        var winSize = cc.Director.getInstance().getWinSize();
        this._fileDesignWidth = winSize.width;
        this._fileDesignHeight = winSize.height;
        this.init();
    },
    init: function () {
        this._textureFiles = [];
    },

    createWidgetFromJsonFile: function (fileName) {
        return cc.CCSGUIReader.getInstance().widgetFromJsonFile(fileName);
    },

    addSpriteFrame: function (fileName) {
        if (!fileName) {
            return;
        }
        var arrayTextures = this._textureFiles;
        var length = arrayTextures.length;
        for (var i = 0; i < length; i++) {
            var file = arrayTextures[i];
            if (file == fileName) {
                return;
            }
        }
        this._textureFiles.push(fileName);
        cc.SpriteFrameCache.getInstance().addSpriteFrames(fileName);
    },

    removeSpriteFrame: function (fileName) {
        if (!fileName) {
            return;
        }
        var arrayTextures = this._textureFiles;
        var length = arrayTextures.length;
        for (var i = 0; i < length; i++) {
            var file = arrayTextures[i];
            if (file == fileName) {
                cc.SpriteFrameCache.getInstance().removeSpriteFrameByName(fileName);
                cc.ArrayRemoveObject(this._textureFiles, file);
                return;
            }
        }
    },

    removeAllSpriteFrame: function () {
        var arrayTextures = this._textureFiles;
        var length = arrayTextures.length;
        for (var i = 0; i < length; i++) {
            var file = arrayTextures[i];
            cc.SpriteFrameCache.getInstance().removeSpriteFrameByName(file);
        }
        this._textureFiles = [];
    },

    seekWidgetByTag: function (root, tag) {
        if (!root) {
            return null;
        }
        if (root.getTag() == tag) {
            return root;
        }
        var arrayRootChildren = root.getChildren();
        var length = arrayRootChildren.length;
        for (var i = 0; i < length; i++) {
            var child = arrayRootChildren[i];
            var res = this.seekWidgetByTag(child, tag);
            if (res != null) {
                return res;
            }
        }
        return null;
    },

    seekWidgetByName: function (root, name) {
        if (!root) {
            return null;
        }
        if (root.getName() == name) {
            return root;
        }
        var arrayRootChildren = root.getChildren();
        var length = arrayRootChildren.length;
        for (var i = 0; i < length; i++) {
            var child = arrayRootChildren[i];
            var res = this.seekWidgetByName(child, name);
            if (res != null) {
                return res;
            }
        }
        return null;
    },

    seekWidgetByRelativeName: function (root, name) {
        if (!root) {
            return null;
        }
        var arrayRootChildren = root.getChildren();
        var length = arrayRootChildren.length;
        for (var i = 0; i < length; i++) {
            var child = arrayRootChildren[i];
            var layoutParameter = child.getLayoutParameter();
            if (layoutParameter && layoutParameter.getRelativeName() == name) {
                return child;
            }
        }
        return null;
    },

    setFileDesignWidth: function (width) {
        this._fileDesignWidth = width;
    },

    getFileDesignWidth: function () {
        return this._fileDesignWidth;
    },

    setFileDesignHeight: function (height) {
        this._fileDesignHeight = height;
    },

    getFileDesignHeight: function () {
        return this._fileDesignHeight;
    },

    /*temp action*/
    seekActionWidgetByActionTag: function (root, tag) {
        if (!root) {
            return null;
        }
        if (root.getActionTag() == tag) {
            return root;
        }
        var arrayRootChildren = root.getChildren();
        var length = arrayRootChildren.length;
        for (var i = 0; i < length; i++) {
            var child = arrayRootChildren[i];
            var res = this.seekActionWidgetByActionTag(child, tag);
            if (res != null) {
                return res;
            }
        }
        return null;
    }
});
cc.UIHelper._instance = null;
cc.UIHelper.getInstance = function () {
    if (!this._instance) {
        this._instance = new cc.UIHelper();
    }
    return this._instance;
};