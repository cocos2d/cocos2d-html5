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
cc.CheckBoxEventType = {
    SELECTED: 0,
    UNSELECTED: 1
};

/**
 * Base class for cc.UICheckBox
 * @class
 * @extends cc.UIWidget
 */
cc.UICheckBox = cc.UIWidget.extend({
    _backGroundBoxRenderer: null,
    _backGroundSelectedBoxRenderer: null,
    _frontCrossRenderer: null,
    _backGroundBoxDisabledRenderer: null,
    _frontCrossDisabledRenderer: null,
    _isSelected: true,
    _selectedStateEventListener: null,
    _selectedStateEventSelector: null,
    _backGroundTexType: null,
    _backGroundSelectedTexType: null,
    _frontCrossTexType: null,
    _backGroundDisabledTexType: null,
    _frontCrossDisabledTexType: null,
    ctor: function () {
        cc.UIWidget.prototype.ctor.call(this);
        this._backGroundBoxRenderer = null;
        this._backGroundSelectedBoxRenderer = null;
        this._frontCrossRenderer = null;
        this._backGroundBoxDisabledRenderer = null;
        this._frontCrossDisabledRenderer = null;
        this._isSelected = true;
        this._selectedStateEventListener = null;
        this._selectedStateEventSelector = null;
        this._backGroundTexType = cc.TextureResType.LOCAL;
        this._backGroundSelectedTexType = cc.TextureResType.LOCAL;
        this._frontCrossTexType = cc.TextureResType.LOCAL;
        this._backGroundDisabledTexType = cc.TextureResType.LOCAL;
        this._frontCrossDisabledTexType = cc.TextureResType.LOCAL;
    },
    init: function () {
        if (cc.UIWidget.prototype.init.call(this)) {
            this.setSelectedState(false);
            return true;
        }
        return false;
    },

    initRenderer: function () {
        cc.UIWidget.prototype.initRenderer.call(this);
        this._backGroundBoxRenderer = cc.Sprite.create();
        this._backGroundSelectedBoxRenderer = cc.Sprite.create();
        this._frontCrossRenderer = cc.Sprite.create();
        this._backGroundBoxDisabledRenderer = cc.Sprite.create();
        this._frontCrossDisabledRenderer = cc.Sprite.create();
        this._renderer.addChild(this._backGroundBoxRenderer);
        this._renderer.addChild(this._backGroundSelectedBoxRenderer);
        this._renderer.addChild(this._frontCrossRenderer);
        this._renderer.addChild(this._backGroundBoxDisabledRenderer);
        this._renderer.addChild(this._frontCrossDisabledRenderer);
    },

    /**
     * Load textures for checkbox.
     * @param {String} backGround
     * @param {String} backGroundSelected
     * @param {String} cross
     * @param {String} backGroundDisabled
     * @param {String} frontCrossDisabled
     * @param {cc.TextureResType} texType
     */
    loadTextures: function (backGround, backGroundSelected, cross, backGroundDisabled, frontCrossDisabled, texType) {
        this.loadTextureBackGround(backGround, texType);
        this.loadTextureBackGroundSelected(backGroundSelected, texType);
        this.loadTextureFrontCross(cross, texType);
        this.loadTextureBackGroundDisabled(backGroundDisabled, texType);
        this.loadTextureFrontCrossDisabled(frontCrossDisabled, texType);
    },

    /**
     * Load backGround texture for checkbox.
     * @param {String} backGround
     * @param {cc.TextureResType} texType
     */
    loadTextureBackGround: function (backGround, texType) {
        if (!backGround) {
            return;
        }
        texType = texType || cc.TextureResType.LOCAL;
        this._backGroundTexType = texType;
        switch (this._backGroundTexType) {
            case cc.TextureResType.LOCAL:
                this._backGroundBoxRenderer.initWithFile(backGround);
                break;
            case cc.TextureResType.PLIST:
                this._backGroundBoxRenderer.initWithSpriteFrameName(backGround);
                break;
            default:
                break;
        }
        this._backGroundBoxRenderer.setColor(this.getColor());
        this._backGroundBoxRenderer.setOpacity(this.getOpacity());
        this.backGroundTextureScaleChangedWithSize();
    },

    /**
     * Load backGroundSelected texture for checkbox.
     * @param {String} backGroundSelected
     * @param {cc.TextureResType} texType
     */
    loadTextureBackGroundSelected: function (backGroundSelected, texType) {
        if (!backGroundSelected) {
            return;
        }
        texType = texType || cc.TextureResType.LOCAL;
        this._backGroundSelectedTexType = texType;
        switch (this._backGroundSelectedTexType) {
            case cc.TextureResType.LOCAL:
                this._backGroundSelectedBoxRenderer.initWithFile(backGroundSelected);
                break;
            case cc.TextureResType.PLIST:
                this._backGroundSelectedBoxRenderer.initWithSpriteFrameName(backGroundSelected);
                break;
            default:
                break;
        }
        this._backGroundSelectedBoxRenderer.setColor(this.getColor());
        this._backGroundSelectedBoxRenderer.setOpacity(this.getOpacity());
        this.backGroundSelectedTextureScaleChangedWithSize();
    },

    /**
     * Load cross texture for checkbox.
     * @param {String} cross
     * @param {cc.TextureResType} texType
     */
    loadTextureFrontCross: function (cross, texType) {
        if (!cross) {
            return;
        }
        texType = texType || cc.TextureResType.LOCAL;
        this._frontCrossTexType = texType;
        switch (this._frontCrossTexType) {
            case cc.TextureResType.LOCAL:
                this._frontCrossRenderer.initWithFile(cross);
                break;
            case cc.TextureResType.PLIST:
                this._frontCrossRenderer.initWithSpriteFrameName(cross);
                break;
            default:
                break;
        }
        this._frontCrossRenderer.setColor(this.getColor());
        this._frontCrossRenderer.setOpacity(this.getOpacity());
        this.frontCrossTextureScaleChangedWithSize();
    },

    /**
     * Load backGroundDisabled texture for checkbox.
     * @param {String} backGroundDisabled
     * @param {cc.TextureResType} texType
     */
    loadTextureBackGroundDisabled: function (backGroundDisabled, texType) {
        if (!backGroundDisabled) {
            return;
        }
        texType = texType || cc.TextureResType.LOCAL;
        this._backGroundDisabledTexType = texType;
        switch (this._backGroundDisabledTexType) {
            case cc.TextureResType.LOCAL:
                this._backGroundBoxDisabledRenderer.initWithFile(backGroundDisabled);
                break;
            case cc.TextureResType.PLIST:
                this._backGroundBoxDisabledRenderer.initWithSpriteFrameName(backGroundDisabled);
                break;
            default:
                break;
        }
        this._backGroundBoxDisabledRenderer.setColor(this.getColor());
        this._backGroundBoxDisabledRenderer.setOpacity(this.getOpacity());
        this.backGroundDisabledTextureScaleChangedWithSize();
    },

    /**
     * Load frontCrossDisabled texture for checkbox.
     * @param {String} frontCrossDisabled
     * @param {cc.TextureResType} texType
     */
    loadTextureFrontCrossDisabled: function (frontCrossDisabled, texType) {
        if (!frontCrossDisabled) {
            return;
        }
        texType = texType || cc.TextureResType.LOCAL;
        this._frontCrossDisabledTexType = texType;
        switch (this._frontCrossDisabledTexType) {
            case cc.TextureResType.LOCAL:
                this._frontCrossDisabledRenderer.initWithFile(frontCrossDisabled);
                break;
            case cc.TextureResType.PLIST:
                this._frontCrossDisabledRenderer.initWithSpriteFrameName(frontCrossDisabled);
                break;
            default:
                break;
        }
        this._frontCrossDisabledRenderer.setColor(this.getColor());
        this._frontCrossRenderer.setOpacity(this.getOpacity());
        this.frontCrossDisabledTextureScaleChangedWithSize();
    },

    onTouchEnded: function (touchPoint) {
        if (this._focus) {
            this.releaseUpEvent();
            if (this._isSelected) {
                this.setSelectedState(false);
                this.unSelectedEvent();
            }
            else {
                this.setSelectedState(true);
                this.selectedEvent();
            }
        }
        this.setFocused(false);
        this._widgetParent.checkChildInfo(2, this, touchPoint);
    },

    onPressStateChangedToNormal: function () {
        this._backGroundBoxRenderer.setVisible(true);
        this._backGroundSelectedBoxRenderer.setVisible(false);
        this._backGroundBoxDisabledRenderer.setVisible(false);
        this._frontCrossDisabledRenderer.setVisible(false);
    },

    onPressStateChangedToPressed: function () {
        this._backGroundBoxRenderer.setVisible(false);
        this._backGroundSelectedBoxRenderer.setVisible(true);
        this._backGroundBoxDisabledRenderer.setVisible(false);
        this._frontCrossDisabledRenderer.setVisible(false);
    },

    onPressStateChangedToDisabled: function () {
        this._backGroundBoxRenderer.setVisible(false);
        this._backGroundSelectedBoxRenderer.setVisible(false);
        this._backGroundBoxDisabledRenderer.setVisible(true);
        this._frontCrossRenderer.setVisible(false);
        if (this._isSelected) {
            this._frontCrossDisabledRenderer.setVisible(true);
        }
    },

    setSelectedState: function (selected) {
        if (selected == this._isSelected) {
            return;
        }
        this._isSelected = selected;
        this._frontCrossRenderer.setVisible(this._isSelected);
    },

    getSelectedState: function () {
        return this._isSelected;
    },

    selectedEvent: function () {
        if (this._selectedStateEventListener && this._selectedStateEventSelector) {
            this._selectedStateEventSelector.call(this._selectedStateEventListener, this, cc.CheckBoxEventType.SELECTED);
        }
    },

    unSelectedEvent: function () {
        if (this._selectedStateEventListener && this._selectedStateEventSelector) {
            this._selectedStateEventSelector.call(this._selectedStateEventListener, this, cc.CheckBoxEventType.UNSELECTED);
        }
    },

    /**
     * add event listener
     * @param {Object} target
     * @param {Function} selector
     */
    addEventListener: function (target, selector) {
        this._selectedStateEventListener = target;
        this._selectedStateEventSelector = selector;
    },

    /**
     * Sets whether the widget should be flipped horizontally or not.
     * @param {Boolean} flipX
     */
    setFlippedX: function (flipX) {
        this._backGroundBoxRenderer.setFlippedX(flipX);
        this._backGroundSelectedBoxRenderer.setFlippedX(flipX);
        this._frontCrossRenderer.setFlippedX(flipX);
        this._backGroundBoxDisabledRenderer.setFlippedX(flipX);
        this._frontCrossDisabledRenderer.setFlippedX(flipX);
    },

    /**
     * override "setFlippedY" of widget.
     * @param {Boolean} flipY
     */
    setFlippedY: function (flipY) {
        this._backGroundBoxRenderer.setFlippedY(flipY);
        this._backGroundSelectedBoxRenderer.setFlippedY(flipY);
        this._frontCrossRenderer.setFlippedY(flipY);
        this._backGroundBoxDisabledRenderer.setFlippedY(flipY);
        this._frontCrossDisabledRenderer.setFlippedY(flipY);
    },

    /**
     * override "isFlippedX" of widget.
     * @returns {Boolean}
     */
    isFlippedX: function () {
        return this._backGroundBoxRenderer.isFlippedX();
    },

    /**
     * override "isFlippedY" of widget.
     * @returns {Boolean}
     */
    isFlippedY: function () {
        return this._backGroundBoxRenderer.isFlippedY();
    },

    /**
     * override "setAnchorPoint" of widget.
     * @param {cc.Point} pt
     */
    setAnchorPoint: function (pt) {
        cc.UIWidget.prototype.setAnchorPoint.call(this, pt);
        this._backGroundBoxRenderer.setAnchorPoint(pt);
        this._backGroundSelectedBoxRenderer.setAnchorPoint(pt);
        this._backGroundBoxDisabledRenderer.setAnchorPoint(pt);
        this._frontCrossRenderer.setAnchorPoint(pt);
        this._frontCrossDisabledRenderer.setAnchorPoint(pt);
    },

    onSizeChanged: function () {
        this.backGroundTextureScaleChangedWithSize();
        this.backGroundSelectedTextureScaleChangedWithSize();
        this.frontCrossTextureScaleChangedWithSize();
        this.backGroundDisabledTextureScaleChangedWithSize();
        this.frontCrossDisabledTextureScaleChangedWithSize();
    },

    /**
     * override "getContentSize" method of widget.
     * @returns {cc.Size}
     */
    getContentSize: function () {
        return this._backGroundBoxRenderer.getContentSize();
    },

    /**
     * override "getVirtualRenderer" method of widget.
     * @returns {cc.Node}
     */
    getVirtualRenderer: function () {
        return this._backGroundBoxRenderer;
    },

    backGroundTextureScaleChangedWithSize: function () {
        if (this._ignoreSize) {
            this._backGroundBoxRenderer.setScale(1.0);
            this._size = this._backGroundBoxRenderer.getContentSize();
        }
        else {
            var textureSize = this._backGroundBoxRenderer.getContentSize();
            if (textureSize.width <= 0.0 || textureSize.height <= 0.0) {
                this._backGroundBoxRenderer.setScale(1.0);
                return;
            }
            var scaleX = this._size.width / textureSize.width;
            var scaleY = this._size.height / textureSize.height;
            this._backGroundBoxRenderer.setScaleX(scaleX);
            this._backGroundBoxRenderer.setScaleY(scaleY);
        }
    },

    backGroundSelectedTextureScaleChangedWithSize: function () {
        if (this._ignoreSize) {
            this._backGroundSelectedBoxRenderer.setScale(1.0);
        }
        else {
            var textureSize = this._backGroundSelectedBoxRenderer.getContentSize();
            if (textureSize.width <= 0.0 || textureSize.height <= 0.0) {
                this._backGroundSelectedBoxRenderer.setScale(1.0);
                return;
            }
            var scaleX = this._size.width / textureSize.width;
            var scaleY = this._size.height / textureSize.height;
            this._backGroundSelectedBoxRenderer.setScaleX(scaleX);
            this._backGroundSelectedBoxRenderer.setScaleY(scaleY);
        }
    },

    frontCrossTextureScaleChangedWithSize: function () {
        if (this._ignoreSize) {
            this._frontCrossRenderer.setScale(1.0);
        }
        else {
            var textureSize = this._frontCrossRenderer.getContentSize();
            if (textureSize.width <= 0.0 || textureSize.height <= 0.0) {
                this._frontCrossRenderer.setScale(1.0);
                return;
            }
            var scaleX = this._size.width / textureSize.width;
            var scaleY = this._size.height / textureSize.height;
            this._frontCrossRenderer.setScaleX(scaleX);
            this._frontCrossRenderer.setScaleY(scaleY);
        }
    },

    backGroundDisabledTextureScaleChangedWithSize: function () {
        if (this._ignoreSize) {
            this._backGroundBoxDisabledRenderer.setScale(1.0);
        }
        else {
            var textureSize = this._backGroundBoxDisabledRenderer.getContentSize();
            if (textureSize.width <= 0.0 || textureSize.height <= 0.0) {
                this._backGroundBoxDisabledRenderer.setScale(1.0);
                return;
            }
            var scaleX = this._size.width / textureSize.width;
            var scaleY = this._size.height / textureSize.height;
            this._backGroundBoxDisabledRenderer.setScaleX(scaleX);
            this._backGroundBoxDisabledRenderer.setScaleY(scaleY);
        }
    },

    frontCrossDisabledTextureScaleChangedWithSize: function () {
        if (this._ignoreSize) {
            this._frontCrossDisabledRenderer.setScale(1.0);
        }
        else {
            var textureSize = this._frontCrossDisabledRenderer.getContentSize();
            if (textureSize.width <= 0.0 || textureSize.height <= 0.0) {
                this._frontCrossDisabledRenderer.setScale(1.0);
                return;
            }
            var scaleX = this._size.width / textureSize.width;
            var scaleY = this._size.height / textureSize.height;
            this._frontCrossDisabledRenderer.setScaleX(scaleX);
            this._frontCrossDisabledRenderer.setScaleY(scaleY);
        }
    },

    getDescription: function () {
        return "CheckBox";
    }
});

cc.UICheckBox.create = function () {
    var uiCheckBox = new cc.UICheckBox();
    if (uiCheckBox && uiCheckBox.init()) {
        return uiCheckBox;
    }
    return null;
};
