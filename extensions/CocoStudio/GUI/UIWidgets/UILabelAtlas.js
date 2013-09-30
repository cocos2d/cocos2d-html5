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

cc.UILabelAtlas = cc.UIWidget.extend({
    _labelAtlasRenderer: null,
    ctor: function () {
        cc.UIWidget.prototype.ctor.call(this);
        this._labelAtlasRenderer = null;
    },

    initRenderer: function () {
        cc.UIWidget.prototype.initRenderer.call(this);
        this._laberAtlasRenderer = cc.UICCLabelAtlas.create();
        this._renderer.addChild(this._laberAtlasRenderer);
    },

    setProperty: function (stringValue, charMapFile, itemWidth, itemHeight, startCharMap, useSpriteFrame) {
        this._laberAtlasRenderer.setProperty(stringValue, charMapFile, itemWidth, itemHeight, startCharMap[0]);
        this.updateAnchorPoint();
        this.labelAtlasScaleChangedWithSize();
    },

    setStringValue: function (value) {
        this._laberAtlasRenderer.setString(value);
        this.labelAtlasScaleChangedWithSize();
    },

    getStringValue: function () {
        return this._laberAtlasRenderer.getString();
    },

    setAnchorPoint: function (pt) {
        cc.UIWidget.prototype.setAnchorPoint.call(this, pt);
        this._laberAtlasRenderer.setAnchorPoint(cc.p(pt.x, pt.y));
    },

    onSizeChanged: function () {
        this.labelAtlasScaleChangedWithSize();
    },

    getContentSize: function () {
        return this._laberAtlasRenderer.getContentSize();
    },

    getVirtualRenderer: function () {
        return this._laberAtlasRenderer;
    },

    labelAtlasScaleChangedWithSize: function () {
        if (this._ignoreSize) {
            this._laberAtlasRenderer.setScale(1.0);
            this._size = this._laberAtlasRenderer.getContentSize();
        }
        else {
            var textureSize = this._laberAtlasRenderer.getContentSize();
            if (textureSize.width <= 0.0 || textureSize.height <= 0.0) {
                this._laberAtlasRenderer.setScale(1.0);
                return;
            }
            var scaleX = this._size.width / textureSize.width;
            var scaleY = this._size.height / textureSize.height;
            this._laberAtlasRenderer.setScaleX(scaleX);
            this._laberAtlasRenderer.setScaleY(scaleY);
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