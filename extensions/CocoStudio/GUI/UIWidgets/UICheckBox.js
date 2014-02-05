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
 * checkBoxEvent type
 * @type {Object}
 */
ccs.CheckBoxEventType = {
    selected: 0,
    unselected: 1
};

ccs.BACKGROUNDBOXRENDERERZ = -1;
ccs.BACKGROUNDBOXSELECTEDRENDERERZ = -1;
ccs.FRONTCROSSRENDERERZ = -1;
ccs.BACKGROUNDBOXDISABLEDRENDERER = -1;
ccs.FRONTCROSSDISABLEDRENDERER = -1;
/**
 * Base class for ccs.CheckBox
 * @class
 * @extends ccs.Widget
 */
ccs.CheckBox = ccs.Widget.extend(/** @lends ccs.CheckBox# */{
    _backGroundBoxRenderer: null,
    _backGroundSelectedBoxRenderer: null,
    _frontCrossRenderer: null,
    _backGroundBoxDisabledRenderer: null,
    _frontCrossDisabledRenderer: null,
    _isSelected: true,
    _checkBoxEventListener: null,
    _checkBoxEventSelector: null,
    _backGroundTexType: null,
    _backGroundSelectedTexType: null,
    _frontCrossTexType: null,
    _backGroundDisabledTexType: null,
    _frontCrossDisabledTexType: null,
    _backGroundFileName: "",
    _backGroundSelectedFileName: "",
    _frontCrossFileName: "",
    _backGroundDisabledFileName: "",
    _frontCrossDisabledFileName: "",
    ctor: function () {
        ccs.Widget.prototype.ctor.call(this);
        this._backGroundBoxRenderer = null;
        this._backGroundSelectedBoxRenderer = null;
        this._frontCrossRenderer = null;
        this._backGroundBoxDisabledRenderer = null;
        this._frontCrossDisabledRenderer = null;
        this._isSelected = true;
        this._checkBoxEventListener = null;
        this._checkBoxEventSelector = null;
        this._backGroundTexType = ccs.TextureResType.local;
        this._backGroundSelectedTexType = ccs.TextureResType.local;
        this._frontCrossTexType = ccs.TextureResType.local;
        this._backGroundDisabledTexType = ccs.TextureResType.local;
        this._frontCrossDisabledTexType = ccs.TextureResType.local;
        this._backGroundFileName = "";
        this._backGroundSelectedFileName = "";
        this._frontCrossFileName = "";
        this._backGroundDisabledFileName = "";
        this._frontCrossDisabledFileName = "";
    },
    init: function () {
        if (ccs.Widget.prototype.init.call(this)) {
            this.setSelectedState(false);
            return true;
        }
        return false;
    },

    initRenderer: function () {
        this._backGroundBoxRenderer = cc.Sprite.create();
        this._backGroundSelectedBoxRenderer = cc.Sprite.create();
        this._frontCrossRenderer = cc.Sprite.create();
        this._backGroundBoxDisabledRenderer = cc.Sprite.create();
        this._frontCrossDisabledRenderer = cc.Sprite.create();
        cc.NodeRGBA.prototype.addChild.call(this, this._backGroundBoxRenderer, ccs.BACKGROUNDBOXRENDERERZ, -1);
        cc.NodeRGBA.prototype.addChild.call(this, this._backGroundSelectedBoxRenderer, ccs.BACKGROUNDBOXSELECTEDRENDERERZ, -1);
        cc.NodeRGBA.prototype.addChild.call(this, this._frontCrossRenderer, ccs.FRONTCROSSRENDERERZ, -1);
        cc.NodeRGBA.prototype.addChild.call(this, this._backGroundBoxDisabledRenderer, ccs.BACKGROUNDBOXDISABLEDRENDERER, -1);
        cc.NodeRGBA.prototype.addChild.call(this, this._frontCrossDisabledRenderer, ccs.FRONTCROSSDISABLEDRENDERER, -1);
    },

    /**
     * Load textures for checkbox.
     * @param {String} backGround
     * @param {String} backGroundSelected
     * @param {String} cross
     * @param {String} backGroundDisabled
     * @param {String} frontCrossDisabled
     * @param {ccs.TextureResType} texType
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
     * @param {ccs.TextureResType} texType
     */
    loadTextureBackGround: function (backGround, texType) {
        if (!backGround) {
            return;
        }
        texType = texType || ccs.TextureResType.local;
        this._backGroundFileName = backGround;
        this._backGroundTexType = texType;
        var bgBoxRenderer = this._backGroundBoxRenderer;
        switch (this._backGroundTexType) {
            case ccs.TextureResType.local:
                bgBoxRenderer.initWithFile(backGround);
                break;
            case ccs.TextureResType.plist:
                bgBoxRenderer.initWithSpriteFrameName(backGround);
                break;
            default:
                break;
        }

        this._updateDisplay();

        if(!bgBoxRenderer.textureLoaded()){
            this._backGroundBoxRenderer.setContentSize(this._customSize);
            bgBoxRenderer.addLoadedEventListener(function(){
                this.backGroundTextureScaleChangedWithSize();
            },this);
        }
        this.backGroundTextureScaleChangedWithSize();
    },
    /**
     * Load backGroundSelected texture for checkbox.
     * @param {String} backGroundSelected
     * @param {ccs.TextureResType} texType
     */
    loadTextureBackGroundSelected: function (backGroundSelected, texType) {
        if (!backGroundSelected) {
            return;
        }
        texType = texType || ccs.TextureResType.local;
        this._backGroundSelectedFileName = backGroundSelected;
        this._backGroundSelectedTexType = texType;
        switch (this._backGroundSelectedTexType) {
            case ccs.TextureResType.local:
                this._backGroundSelectedBoxRenderer.initWithFile(backGroundSelected);
                break;
            case ccs.TextureResType.plist:
                this._backGroundSelectedBoxRenderer.initWithSpriteFrameName(backGroundSelected);
                break;
            default:
                break;
        }
        this._updateDisplay();
        this.backGroundSelectedTextureScaleChangedWithSize();
    },

    /**
     * Load cross texture for checkbox.
     * @param {String} cross
     * @param {ccs.TextureResType} texType
     */
    loadTextureFrontCross: function (cross, texType) {
        if (!cross) {
            return;
        }
        texType = texType || ccs.TextureResType.local;
        this._frontCrossFileName = cross;
        this._frontCrossTexType = texType;
        switch (this._frontCrossTexType) {
            case ccs.TextureResType.local:
                this._frontCrossRenderer.initWithFile(cross);
                break;
            case ccs.TextureResType.plist:
                this._frontCrossRenderer.initWithSpriteFrameName(cross);
                break;
            default:
                break;
        }
        this._updateDisplay();
        this.frontCrossTextureScaleChangedWithSize();
    },

    /**
     * Load backGroundDisabled texture for checkbox.
     * @param {String} backGroundDisabled
     * @param {ccs.TextureResType} texType
     */
    loadTextureBackGroundDisabled: function (backGroundDisabled, texType) {
        if (!backGroundDisabled) {
            return;
        }
        texType = texType || ccs.TextureResType.local;
        this._backGroundDisabledFileName = backGroundDisabled;
        this._backGroundDisabledTexType = texType;
        switch (this._backGroundDisabledTexType) {
            case ccs.TextureResType.local:
                this._backGroundBoxDisabledRenderer.initWithFile(backGroundDisabled);
                break;
            case ccs.TextureResType.plist:
                this._backGroundBoxDisabledRenderer.initWithSpriteFrameName(backGroundDisabled);
                break;
            default:
                break;
        }
        this._updateDisplay();
        this.backGroundDisabledTextureScaleChangedWithSize();
    },

    /**
     * Load frontCrossDisabled texture for checkbox.
     * @param {String} frontCrossDisabled
     * @param {ccs.TextureResType} texType
     */
    loadTextureFrontCrossDisabled: function (frontCrossDisabled, texType) {
        if (!frontCrossDisabled) {
            return;
        }
        texType = texType || ccs.TextureResType.local;
        this._frontCrossDisabledFileName = frontCrossDisabled;
        this._frontCrossDisabledTexType = texType;
        switch (this._frontCrossDisabledTexType) {
            case ccs.TextureResType.local:
                this._frontCrossDisabledRenderer.initWithFile(frontCrossDisabled);
                break;
            case ccs.TextureResType.plist:
                this._frontCrossDisabledRenderer.initWithSpriteFrameName(frontCrossDisabled);
                break;
            default:
                break;
        }
        this._updateDisplay();
        this.frontCrossDisabledTextureScaleChangedWithSize();
    },

    _updateDisplay:function(){
        this.updateDisplayedColor(this.getColor());
        this.updateDisplayedOpacity(this.getOpacity());
        this.updateAnchorPoint();
    },

    onTouchEnded: function (touch , event) {
        var touchPoint = touch.getLocation();
        this._touchEndPos.x = touchPoint.x;
        this._touchEndPos.y = touchPoint.y;
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
        var widgetParent = this.getWidgetParent();
        if(widgetParent){
            widgetParent.checkChildInfo(2, this, touchPoint);
        }
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
        if (this._checkBoxEventListener && this._checkBoxEventSelector) {
            this._checkBoxEventSelector.call(this._checkBoxEventListener, this, ccs.CheckBoxEventType.selected);
        }
    },

    unSelectedEvent: function () {
        if (this._checkBoxEventListener && this._checkBoxEventSelector) {
            this._checkBoxEventSelector.call(this._checkBoxEventListener, this, ccs.CheckBoxEventType.unselected);
        }
    },

    /**
     * add event listener
     * @param {Function} selector
     * @param {Object} target
     */
    addEventListenerCheckBox: function (selector, target) {
        this._checkBoxEventSelector = selector;
        this._checkBoxEventListener = target;
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
     * @param {cc.Point|Number} point The anchor point of UICheckBox or The anchor point.x of UICheckBox.
     * @param {Number} [y] The anchor point.y of UICheckBox.
     */
    setAnchorPoint: function (point, y) {
        if(arguments.length === 2){
            ccs.Widget.prototype.setAnchorPoint.call(this, point, y);
            this._backGroundBoxRenderer.setAnchorPoint(point, y);
            this._backGroundSelectedBoxRenderer.setAnchorPoint(point, y);
            this._backGroundBoxDisabledRenderer.setAnchorPoint(point, y);
            this._frontCrossRenderer.setAnchorPoint(point, y);
            this._frontCrossDisabledRenderer.setAnchorPoint(point, y);
        }else{
            ccs.Widget.prototype.setAnchorPoint.call(this, point);
            this._backGroundBoxRenderer.setAnchorPoint(point);
            this._backGroundSelectedBoxRenderer.setAnchorPoint(point);
            this._backGroundBoxDisabledRenderer.setAnchorPoint(point);
            this._frontCrossRenderer.setAnchorPoint(point);
            this._frontCrossDisabledRenderer.setAnchorPoint(point);
        }
    },

    onSizeChanged: function () {
        ccs.Widget.prototype.onSizeChanged.call(this);
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
            var locBackSize = this._backGroundBoxRenderer.getContentSize();
            this._size.width = locBackSize.width;
            this._size.height = locBackSize.height;
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

    /**
     * Returns the "class name" of widget.
     * @returns {string}
     */
    getDescription: function () {
        return "CheckBox";
    },

    createCloneInstance: function () {
        return ccs.CheckBox.create();
    },

    copySpecialProperties: function (uiCheckBox) {
        this.loadTextureBackGround(uiCheckBox._backGroundFileName, uiCheckBox._backGroundTexType);
        this.loadTextureBackGroundSelected(uiCheckBox._backGroundSelectedFileName, uiCheckBox._backGroundSelectedTexType);
        this.loadTextureFrontCross(uiCheckBox._frontCrossFileName, uiCheckBox._frontCrossTexType);
        this.loadTextureBackGroundDisabled(uiCheckBox._backGroundDisabledFileName, uiCheckBox._backGroundDisabledTexType);
        this.loadTextureFrontCrossDisabled(uiCheckBox._frontCrossDisabledFileName, uiCheckBox._frontCrossDisabledTexType);
        this.setSelectedState(uiCheckBox._isSelected);
    }
});
/**
 * allocates and initializes a UICheckBox.
 * @constructs
 * @return {ccs.CheckBox}
 * @example
 * // example
 * var uiCheckBox = ccs.CheckBox.create();
 */
ccs.CheckBox.create = function () {
    var uiCheckBox = new ccs.CheckBox();
    if (uiCheckBox && uiCheckBox.init()) {
        return uiCheckBox;
    }
    return null;
};
