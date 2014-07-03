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
    _className: "TextAtlas",
    _labelAtlasRendererAdaptDirty: null,

    /**
     * allocates and initializes a UILabelAtlas.
     * Constructor of ccui.TextAtlas
     * @example
     * // example
     * var uiLabelAtlas = new ccui.TextAtlas();
     */
    ctor: function () {
        ccui.Widget.prototype.ctor.call(this);
    },

    initRenderer: function () {
        this._labelAtlasRenderer = new cc.LabelAtlas();
        //cc.Node.prototype.addChild.call(this, this._labelAtlasRenderer, ccui.TextAtlas.RENDERER_ZORDER, -1);
        this._labelAtlasRenderer.setAnchorPoint(cc.p(0.5, 0.5));
        this.addProtectedChild(this._labelAtlasRenderer, ccui.TextAtlas.RENDERER_ZORDER, -1);
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
//        var renderer = this._labelAtlasRenderer;
//        renderer.initWithString(stringValue, charMapFile, itemWidth, itemHeight, startCharMap[0]);
//        this.updateAnchorPoint();
//        this.labelAtlasScaleChangedWithSize();
//
//        if (!renderer.textureLoaded()) {
//            renderer.addLoadedEventListener(function () {
//                this.labelAtlasScaleChangedWithSize();
//            }, this);
//        }
        this._labelAtlasRenderer.initWithString(stringValue, this._charMapFileName, this._itemWidth, this._itemHeight, this._startCharMap[0]);

        this._updateContentSizeWithTextureSize(this._labelAtlasRenderer.getContentSize());
        this._labelAtlasRendererAdaptDirty = true;

    },

    /**
     * set string value for ui text atlas.
     * @param {String} value
     */
    setString: function (value) {
        this._stringValue = value;
        this._labelAtlasRenderer.setString(value);
//        this.labelAtlasScaleChangedWithSize();
        this._updateContentSizeWithTextureSize(this._labelAtlasRenderer.getContentSize());
        this._labelAtlasRendererAdaptDirty = true;
    },

    /**
     * set string value for labelatlas.
     * @deprecated
     * @param {String} value
     */
    setStringValue: function (value) {
        cc.log("Please use the setString");
        this.setString(value);
    },

    /**
     * get string value for labelatlas.
     * @deprecated
     * @returns {String}
     */
    getStringValue: function () {
        cc.log("Please use the getString");
        return this.getString();
    },

    /**
     * get string value for ui text atlas.
     * @returns {String}
     */
    getString: function () {
        return this._labelAtlasRenderer.getString();
    },

    getStringLength: function(){
        return this._labelAtlasRenderer.getStringLength();
    },

    onSizeChanged: function () {
        ccui.Widget.prototype.onSizeChanged.call(this);
//        this.labelAtlasScaleChangedWithSize();
        this._labelAtlasRendererAdaptDirty = true;
    },

    adaptRenderers: function(){
        if (this._labelAtlasRendererAdaptDirty)
        {
            this.labelAtlasScaleChangedWithSize();
            this._labelAtlasRendererAdaptDirty = false;
        }

    },

    getVirtualRendererSize: function(){
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
//            var atlasRenderSize = this._labelAtlasRenderer.getContentSize();
//            this._size.width = atlasRenderSize.width;
//            this._size.height = atlasRenderSize.height;
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
        this._labelAtlasRenderer.setPosition(this._contentSize.width / 2.0, this._contentSize.height / 2.0);
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
        if (labelAtlas){
            this.setProperty(labelAtlas._stringValue, labelAtlas._charMapFileName, labelAtlas._itemWidth, labelAtlas._itemHeight, labelAtlas._startCharMap);
        }
    }


//    /**
//     * override "setAnchorPoint" of widget.
//     * @param {cc.Point|Number} point The anchor point of UILabelAtlas or The anchor point.x of UILabelAtlas.
//     * @param {Number} [y] The anchor point.y of UILabelAtlas.
//     */
//    setAnchorPoint: function (point, y) {
//        if (y === undefined) {
//            ccui.Widget.prototype.setAnchorPoint.call(this, point);
//            this._labelAtlasRenderer.setAnchorPoint(point);
//        } else {
//            ccui.Widget.prototype.setAnchorPoint.call(this, point, y);
//            this._labelAtlasRenderer.setAnchorPoint(point, y);
//        }
//    },
//    _setAnchorX: function (value) {
//        ccui.Widget.prototype._setAnchorX.call(this, value);
//        this._labelAtlasRenderer._setAnchorX(value);
//    },
//    _setAnchorY: function (value) {
//        ccui.Widget.prototype._setAnchorY.call(this, value);
//        this._labelAtlasRenderer._setAnchorY(value);
//    },
//
//    /**
//     * override "getContentSize" method of widget.
//     * @returns {cc.Size}
//     */
//    getContentSize: function () {
//        return this._labelAtlasRenderer.getContentSize();
//    },
//    _getWidth: function () {
//        return this._labelAtlasRenderer._getWidth();
//    },
//    _getHeight: function () {
//        return this._labelAtlasRenderer._getHeight();
//    },
//
//    updateTextureColor: function () {
//        this.updateColorToRenderer(this._labelAtlasRenderer);
//    },
//
//    updateTextureOpacity: function () {
//        this.updateOpacityToRenderer(this._labelAtlasRenderer);
//    }
});

var _p = ccui.TextAtlas.prototype;

// Extended properties
/** @expose */
_p.string;
cc.defineGetterSetter(_p, "string", _p.getString, _p.setString);

_p = null;

/**
 * allocates and initializes a UILabelAtlas.
 * @constructs
 * @return {ccui.TextAtlas}
 * @example
 * // example
 * var uiLabelAtlas = ccui.TextAtlas.create();
 */
ccui.TextAtlas.create = function (stringValue, charMapFile, itemWidth, itemHeight, startCharMap) {
    var widget = new ccui.TextAtlas();
    if(widget && widget.init()){
        if(arguments.length > 0){
            widget.setProperty(stringValue, charMapFile, itemWidth, itemHeight, startCharMap);
        }
        return widget;
    }
    return null;
};

// Constants
ccui.TextAtlas.RENDERER_ZORDER = -1;