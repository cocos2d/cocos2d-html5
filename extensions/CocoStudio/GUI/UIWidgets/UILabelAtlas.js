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
 * Base class for cc.UICCLabelAtlas
 * @class
 * @extends cc.LabelAtlas
 */
cc.UICCLabelAtlas = cc.LabelAtlas.extend({

    setProperty: function (string, charMapFile, itemWidth, itemHeight, startCharMap) {
        this.initWithString(string, charMapFile, itemWidth, itemHeight, startCharMap);
    },

    setProperty: function (string, texture, itemWidth, itemHeight, startCharMap) {
        this.initWithString(string, texture, itemWidth, itemHeight, startCharMap);
    },

    draw: function () {
        if (!this._textureAtlas) {
            return;
        }

        cc.AtlasNode.prototype.draw.call(this);
    },
    updateDisplayedOpacity: function (opacity) {
        cc.AtlasNode.prototype.setOpacity.call(this, opacity);
    }
});

cc.UICCLabelAtlas.create = function () {
    var uiCCLabelAtlas = new cc.UICCLabelAtlas();
    if (uiCCLabelAtlas && uiCCLabelAtlas.init()) {
        return uiCCLabelAtlas;
    }
    return null;
};

/**
 * Base class for cc.UILabelAtlas
 * @class
 * @extends cc.UIWidget
 */
cc.UILabelAtlas = cc.UIWidget.extend({
    _labelAtlasRenderer: null,
    ctor: function () {
        cc.UIWidget.prototype.ctor.call(this);
        this._labelAtlasRenderer = null;
    },

    initRenderer: function () {
        cc.UIWidget.prototype.initRenderer.call(this);
        this._labelAtlasRenderer = cc.UICCLabelAtlas.create();
        this._renderer.addChild(this._labelAtlasRenderer);
    },

    /**
     * initializes the UILabelAtlas with a string, a char map file(the atlas), the width and height of each element and the starting char of the atlas
     * @param {String} stringValue
     * @param {String} charMapFile
     * @param {number} itemWidth
     * @param {number} itemHeight
     * @param {String} startCharMap
     * @param {Boolean} useSpriteFrame
     */
    setProperty: function (stringValue, charMapFile, itemWidth, itemHeight, startCharMap, useSpriteFrame) {
        this._labelAtlasRenderer.setProperty(stringValue, charMapFile, itemWidth, itemHeight, startCharMap[0]);
        this.updateAnchorPoint();
        this.labelAtlasScaleChangedWithSize();
    },

    /**
     * set string value for labelatlas.
     * @param {String} value
     */
    setStringValue: function (value) {
        this._labelAtlasRenderer.setString(value);
        this.labelAtlasScaleChangedWithSize();
    },

    /**
     * get string value for labelatlas.
     * @returns {String}
     */
    getStringValue: function () {
        return this._labelAtlasRenderer.getString();
    },

    /**
     * override "setAnchorPoint" of widget.
     * @param {cc.Point} pt
     */
    setAnchorPoint: function (pt) {
        cc.UIWidget.prototype.setAnchorPoint.call(this, pt);
        this._labelAtlasRenderer.setAnchorPoint(cc.p(pt.x, pt.y));
    },

    onSizeChanged: function () {
        this.labelAtlasScaleChangedWithSize();
    },

    /**
     * override "getContentSize" method of widget.
     * @returns {cc.Size}
     */
    getContentSize: function () {
        return this._labelAtlasRenderer.getContentSize();
    },

    /**
     * override "getVirtualRenderer" method of widget.
     * @returns {cc.Node}
     */
    getVirtualRenderer: function () {
        return this._labelAtlasRenderer;
    },

    labelAtlasScaleChangedWithSize: function () {
        if (this._ignoreSize) {
            this._labelAtlasRenderer.setScale(1.0);
            this._size = this._labelAtlasRenderer.getContentSize();
        }
        else {
            var textureSize = this._labelAtlasRenderer.getContentSize();
            if (textureSize.width <= 0.0 || textureSize.height <= 0.0) {
                this._labelAtlasRenderer.setScale(1.0);
                return;
            }
            var scaleX = this._size.width / textureSize.width;
            var scaleY = this._size.height / textureSize.height;
            this._labelAtlasRenderer.setScaleX(scaleX);
            this._labelAtlasRenderer.setScaleY(scaleY);
        }
    },

    getDescription: function () {
        return "LabelAtlase";
    }
});

cc.UILabelAtlas.create = function () {
    var uiLabelAtlas = new cc.UILabelAtlas();
    if (uiLabelAtlas && uiLabelAtlas.init()) {
        return uiLabelAtlas;
    }
    return null;
};