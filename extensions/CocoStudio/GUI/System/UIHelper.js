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
 * Base class for cc.UIHelper
 * @class
 * @extends cc.Class
 */
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

    /**
     * Load a widget with json file.
     * @param {String} fileName
     * @returns {String}
     */
    createWidgetFromJsonFile: function (fileName) {
        return cc.CCSGUIReader.getInstance().widgetFromJsonFile(fileName);
    },

    /**
     * add a plist file for loading widget's texture.
     * @param {String} fileName
     */
    addSpriteFrame: function (fileName) {
        if (!fileName) {
            return;
        }
        for (var i = 0; i < this._textureFiles.length; i++) {
            var file = this._textureFiles[i];
            if (file == fileName) {
                return;
            }
        }
        this._textureFiles.push(fileName);
        cc.SpriteFrameCache.getInstance().addSpriteFrames(fileName);
    },

    /**
     * remove a plist file for loading widget's texture.
     * @param fileName
     */
    removeSpriteFrame: function (fileName) {
        if (!fileName) {
            return;
        }
        for (var i = 0; i < this._textureFiles.length; i++) {
            var file = this._textureFiles[i];
            if (file == fileName) {
                cc.SpriteFrameCache.getInstance().removeSpriteFrameByName(fileName);
                cc.ArrayRemoveObject(this._textureFiles, file);
                return;
            }
        }
    },

    /**
     * remove all plist files for loading widget's texture.
     */
    removeAllSpriteFrame: function () {
        for (var i = 0; i < this._textureFiles.length; i++) {
            var file = this._textureFiles[i];
            cc.SpriteFrameCache.getInstance().removeSpriteFrameByName(file);
        }
        this._textureFiles = [];
    },

    /**
     * Finds a widget whose tag equals to param tag from root widget.
     * @param {cc.UIWidget} root
     * @param {number} tag
     * @returns {cc.UIWidget}
     */
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

    /**
     * Finds a widget whose name equals to param name from root widget.
     * @param {cc.UIWidget} root
     * @param {String} name
     * @returns {cc.UIWidget}
     */
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

    /**
     * Finds a widget whose name equals to param name from root widget.
     * RelativeLayout will call this method to find the widget witch is needed.
     * @param {cc.UIWidget} root
     * @param {String} name
     * @returns {cc.UIWidget}
     */
    seekWidgetByRelativeName: function (root, name) {
        if (!root) {
            return null;
        }
        var arrayRootChildren = root.getChildren();
        var length = arrayRootChildren.length;
        for (var i = 0; i < length; i++) {
            var child = arrayRootChildren[i];
            var layoutParameter = child.getLayoutParameter(cc.LayoutParameterType.RELATIVE);
            if (layoutParameter && layoutParameter.getRelativeName() == name) {
                return child;
            }
        }
        return null;
    },

    /**
     * Set file design width
     * @param {number} width
     */
    setFileDesignWidth: function (width) {
        this._fileDesignWidth = width;
    },

    /**
     * Get file design width
     * @returns {number}
     */
    getFileDesignWidth: function () {
        return this._fileDesignWidth;
    },

    /**
     * Set file design height
     * @param {number} height
     */
    setFileDesignHeight: function (height) {
        this._fileDesignHeight = height;
    },

    /**
     * Get file design height
     * @returns {number}
     */
    getFileDesignHeight: function () {
        return this._fileDesignHeight;
    }
});
cc.UIHelper._instance = null;
cc.UIHelper.getInstance = function () {
    if (!this._instance) {
        this._instance = new cc.UIHelper();
    }
    return this._instance;
};
cc.UIHelper.purge = function(){
    this._instance=null;
};