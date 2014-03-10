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
 * Base class for ccui.TextAtlas
 * @class
 * @extends ccui.Widget
 *
 * @property {String}   string  - Content string of the label
 */
ccui.TextAtlas = ccui.Widget.extend(/** @lends ccui.TextAtlas# */{
    _labelAtlasRenderer: null,
    _stringValue: "",
    _charMapFileName: "",
    _itemWidth: 0,
    _itemHeight: 0,
    _startCharMap: "",
    _className:"TextAtlas",
    ctor: function () {
        ccui.Widget.prototype.ctor.call(this);
        this._labelAtlasRenderer = null;
    },

    initRenderer: function () {
        this._labelAtlasRenderer = new cc.LabelAtlas();
        cc.Node.prototype.addChild.call(this, this._labelAtlasRenderer, ccui.TextAtlas.RENDERER_ZORDER, -1);
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
        renderer.initWithString(stringValue, charMapFile, itemWidth, itemHeight, startCharMap[0]);
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
        if (y === undefined) {
	        ccui.Widget.prototype.setAnchorPoint.call(this, point);
	        this._labelAtlasRenderer.setAnchorPoint(point);
        } else {
	        ccui.Widget.prototype.setAnchorPoint.call(this, point, y);
	        this._labelAtlasRenderer.setAnchorPoint(point, y);
        }
    },
	_setAnchorX: function (value) {
		ccui.Widget.prototype._setAnchorX.call(this, value);
		this._labelAtlasRenderer._setAnchorX(value);
	},
	_setAnchorY: function (value) {
		ccui.Widget.prototype._setAnchorY.call(this, value);
		this._labelAtlasRenderer._setAnchorY(value);
	},

    onSizeChanged: function () {
        ccui.Widget.prototype.onSizeChanged.call(this);
        this.labelAtlasScaleChangedWithSize();
    },

    /**
     * override "getContentSize" method of widget.
     * @returns {cc.Size}
     */
    getContentSize: function () {
        return this._labelAtlasRenderer.getContentSize();
    },
	_getWidth: function () {
		return this._labelAtlasRenderer._getWidth();
	},
	_getHeight: function () {
		return this._labelAtlasRenderer._getHeight();
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

    updateTextureColor: function () {
        this.updateColorToRenderer(this._labelAtlasRenderer);
    },

    updateTextureOpacity: function () {
        this.updateOpacityToRenderer(this._labelAtlasRenderer);
    },

    /**
     * Returns the "class name" of widget.
     * @returns {string}
     */
    getDescription: function () {
        return "LabelAtlas";
    },

    createCloneInstance: function () {
        return ccui.TextAtlas.create();
    },

    copySpecialProperties: function (labelAtlas) {
        this.setProperty(labelAtlas._stringValue, labelAtlas._charMapFileName, labelAtlas._itemWidth, labelAtlas._itemHeight, labelAtlas._startCharMap);
    }
});

window._p = ccui.TextAtlas.prototype;

// Extended properties
/** @expose */
_p.string;
cc.defineGetterSetter(_p, "string", _p.getStringValue, _p.setStringValue);

delete window._p;

/**
 * allocates and initializes a UILabelAtlas.
 * @constructs
 * @return {ccui.TextAtlas}
 * @example
 * // example
 * var uiLabelAtlas = ccui.TextAtlas.create();
 */
ccui.TextAtlas.create = function () {
    var uiLabelAtlas = new ccui.TextAtlas();
    if (uiLabelAtlas && uiLabelAtlas.init()) {
        return uiLabelAtlas;
    }
    return null;
};

// Constants
ccui.TextAtlas.RENDERER_ZORDER = -1;