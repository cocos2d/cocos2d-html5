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

ccs.LABELATLASRENDERERZ = -1;
/**
 * Base class for ccs.UICCLabelAtlas
 * @class
 * @extends cc.LabelAtlas
 */
ccs.UICCLabelAtlas = cc.LabelAtlas.extend({

    setProperty: function (string, charMapFile, itemWidth, itemHeight, startCharMap) {
        this.initWithString(string, charMapFile, itemWidth, itemHeight, startCharMap);
    },

    draw: function () {
        if (!this._textureAtlas) {
            return;
        }

        cc.AtlasNode.prototype.draw.call(this);
    },
    updateDisplayedOpacity: function (opacity) {
        cc.AtlasNode.prototype.updateDisplayedOpacity.call(this, opacity);
    }
});

ccs.UICCLabelAtlas.create = function () {
    var uiCCLabelAtlas = new ccs.UICCLabelAtlas();
    if (uiCCLabelAtlas && uiCCLabelAtlas.init()) {
        return uiCCLabelAtlas;
    }
    return null;
};

/**
 * Base class for ccs.LabelAtlas
 * @class
 * @extends ccs.Widget
 */
ccs.LabelAtlas = ccs.Widget.extend(/** @lends ccs.LabelAtlas# */{
    _labelAtlasRenderer: null,
    _stringValue: "",
    _charMapFileName: "",
    _itemWidth: 0,
    _itemHeight: 0,
    _startCharMap: "",
    ctor: function () {
        ccs.Widget.prototype.ctor.call(this);
        this._labelAtlasRenderer = null;
    },

    initRenderer: function () {
        this._labelAtlasRenderer = ccs.UICCLabelAtlas.create();
        cc.NodeRGBA.prototype.addChild.call(this, this._labelAtlasRenderer, ccs.LABELATLASRENDERERZ, -1);
    },

    /**
     * initializes the UILabelAtlas with a string, a char map file(the atlas), the width and height of each element and the starting char of the atlas
     * @param {String} stringValue
     * @param {String} charMapFile
     * @param {number} itemWidth
     * @param {number} itemHeight
     * @param {String} startCharMap
     */
    setProperty: function (stringValue, charMapFile, itemWidth, itemHeight, startCharMap) {
        this._stringValue = stringValue;
        this._charMapFileName = charMapFile;
        this._itemWidth = itemWidth;
        this._itemHeight = itemHeight;
        this._startCharMap = startCharMap;
        var renderer = this._labelAtlasRenderer;
        renderer.setProperty(stringValue, charMapFile, itemWidth, itemHeight, startCharMap[0]);
        this.updateAnchorPoint();
        this.labelAtlasScaleChangedWithSize();

        if (!renderer.textureLoaded()) {
            renderer.addLoadedEventListener(function () {
                this.labelAtlasScaleChangedWithSize();
            }, this);
        }
    },

    /**
     * set string value for labelatlas.
     * @param {String} value
     */
    setStringValue: function (value) {
        this._stringValue = value;
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
     * @param {cc.Point|Number} point The anchor point of UILabelAtlas or The anchor point.x of UILabelAtlas.
     * @param {Number} [y] The anchor point.y of UILabelAtlas.
     */
    setAnchorPoint: function (point, y) {
        if(arguments.length === 2){
            ccs.Widget.prototype.setAnchorPoint.call(this, point, y);
            this._labelAtlasRenderer.setAnchorPoint(point, y);
        } else {
            ccs.Widget.prototype.setAnchorPoint.call(this, point);
            this._labelAtlasRenderer.setAnchorPoint(point);
        }
    },

    onSizeChanged: function () {
        ccs.Widget.prototype.onSizeChanged.call(this);
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
            var atlasRenderSize = this._labelAtlasRenderer.getContentSize();
            this._size.width = atlasRenderSize.width;
            this._size.height = atlasRenderSize.height;
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

    /**
     * Returns the "class name" of widget.
     * @returns {string}
     */
    getDescription: function () {
        return "LabelAtlase";
    },

    createCloneInstance: function () {
        return ccs.LabelAtlas.create();
    },

    copySpecialProperties: function (labelAtlas) {
        this.setProperty(labelAtlas._stringValue, labelAtlas._charMapFileName, labelAtlas._itemWidth, labelAtlas._itemHeight, labelAtlas._startCharMap);
    }
});
/**
 * allocates and initializes a UILabelAtlas.
 * @constructs
 * @return {ccs.LabelAtlas}
 * @example
 * // example
 * var uiLabelAtlas = ccs.LabelAtlas.create();
 */
ccs.LabelAtlas.create = function () {
    var uiLabelAtlas = new ccs.LabelAtlas();
    if (uiLabelAtlas && uiLabelAtlas.init()) {
        return uiLabelAtlas;
    }
    return null;
};