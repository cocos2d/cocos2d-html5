/*
 *
 * Copyright (c) 2010-2012 cocos2d-x.org
 *
 * Copyright 2011 Yannick Loriot. All rights reserved.
 * http://yannickloriot.com
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 *
 * converted to Javascript / cocos2d-x by Angus C
 */

cc.SLIDER_MARGIN_H = 24;
cc.SLIDER_MARGIN_V = 8;

cc.ControlSlider = cc.Control.extend({
    _value:0,
    _minimumValue:0,
    _maximumValue:0,
    _minimumAllowedValue:0,
    _maximumAllowedValue:0,

    _thumbSprite:null,
    _progressSprite:null,
    _backgroundSprite:null,

    getValue:function () {
        return this._value;
    },
    setValue:function (value) {
        //clamp between the two bounds
        value = Math.max(value, this._minimumValue);
        value = Math.min(value, this._maximumValue);
        this._value = value;
        this.needsLayout();
        this.sendActionsForControlEvents(cc.CONTROL_EVENT_VALUECHANGED);
    },

    getMinimumValue:function () {
        return this._minimumValue;
    },
    setMinimumValue:function (minimumValue) {
        this._minimumValue = minimumValue;
        this._minimumAllowedValue = minimumValue;
        if (this._minimumValue >= this._maximumValue)
            this._maximumValue = this._minimumValue + 1.0;
        this.setValue(this._value);
    },

    getMaximumValue:function () {
        return this._maximumValue;
    },
    setMaximumValue:function (maximumValue) {
        this._maximumValue = maximumValue;
        this._maximumAllowedValue = maximumValue;
        if (this._maximumValue <= this._minimumValue)
            this._minimumValue = this._maximumValue - 1.0;
        this.setValue(this._value);
    },
    isTouchInside:function (touch) {
        var touchLocation = touch.getLocation();
        touchLocation = this.getParent().convertToNodeSpace(touchLocation);

        var rect = this.getBoundingBox();
        rect.size.width += this._thumbSprite.getContentSize().width;
        rect.origin.x -= this._thumbSprite.getContentSize().width / 2;

        return cc.rectContainsPoint(rect, touchLocation);
    },
    locationFromTouch:function (touch) {
        var touchLocation = touch.getLocation();                      // Get the touch position
        touchLocation = this.convertToNodeSpace(touchLocation);                  // Convert to the node space of this class

        if (touchLocation.x < 0) {
            touchLocation.x = 0;
        } else if (touchLocation.x > this._backgroundSprite.getContentSize().width) {
            touchLocation.x = this._backgroundSprite.getContentSize().width;
        }

        return touchLocation;
    },
    getMinimumAllowedValue:function () {
        return this._minimumAllowedValue;
    },
    setMinimumAllowedValue:function (val) {
        this._minimumAllowedValue = val;
    },

    getMaximumAllowedValue:function () {
        return this._maximumAllowedValue;
    },

    setMaximumAllowedValue:function (val) {
        this._maximumAllowedValue = val;
    },

    getThumbSprite:function () {
        return this._thumbSprite;
    },
    getProgressSprite:function () {
        return this._progressSprite;
    },
    getBackgroundSprite:function () {
        return this._backgroundSprite;
    },

    /**
     * Initializes a slider with a background sprite, a progress bar and a thumb
     * item.
     *
     * @param {cc.Sprite} backgroundSprite  CCSprite, that is used as a background.
     * @param {cc.Sprite} progressSprite    CCSprite, that is used as a progress bar.
     * @param {cc.Sprite} thumbSprite         CCMenuItem, that is used as a thumb.
     */
    initWithSprites:function (backgroundSprite, progressSprite, thumbSprite) {
        if (cc.Control.prototype.init.call(this)) {
            this.ignoreAnchorPointForPosition(false);
            this.setTouchEnabled(true);

            this._backgroundSprite = backgroundSprite;
            this._progressSprite = progressSprite;
            this._thumbSprite = thumbSprite;

            // Defines the content size
            var maxRect = cc.ControlUtils.CCRectUnion(backgroundSprite.getBoundingBox(), thumbSprite.getBoundingBox());
            var size = cc.SizeMake(maxRect.width, maxRect.height);
            this.setContentSize(size);

            // Add the slider background
            this._backgroundSprite.setAnchorPoint(cc.p(0.5, 0.5));
            this._backgroundSprite.setPosition(cc.p(size.width / 2, size.height / 2));
            this.addChild(this._backgroundSprite);

            // Add the progress bar
            this._progressSprite.setAnchorPoint(cc.p(0.0, 0.5));
            this._progressSprite.setPosition(cc.p(0.0, size.height / 2));
            this.addChild(this._progressSprite);

            // Add the slider thumb
            this._thumbSprite.setPosition(cc.p(0, size.height / 2));
            this.addChild(this._thumbSprite);

            // Init default values
            this._minimumValue = 0.0;
            this._maximumValue = 1.0;
            this.setValue(this._minimumValue);
            return true;
        } else
            return false;
    },

    setEnabled:function (enabled) {
        cc.Control.prototype.setEnabled.call(this, enabled);
        if (this._thumbSprite) {
            this._thumbSprite.setOpacity(enabled ? 255 : 128);
        }
    },

    sliderBegan:function (location) {
        this.setSelected(true);
        this.getThumbSprite().setColor(cc.GRAY);
        this.setValue(this.valueForLocation(location));
    },
    sliderMoved:function (location) {
        this.setValue(this.valueForLocation(location));
    },
    sliderEnded:function (location) {
        if (this.isSelected()) {
            this.setValue(this.valueForLocation(this._thumbSprite.getPosition()));
        }
        this._thumbSprite.setColor(cc.WHITE);
        this.setSelected(false);
    },

    getTouchLocationInControl:function (touch) {
        var touchLocation = touch.getLocation();                      // Get the touch position
        touchLocation = this.convertToNodeSpace(touchLocation);         // Convert to the node space of this class

        if (touchLocation.x < 0) {
            touchLocation.x = 0;
        } else if (touchLocation.x > this._backgroundSprite.getContentSize().width + cc.SLIDER_MARGIN_H) {
            touchLocation.x = this._backgroundSprite.getContentSize().width + cc.SLIDER_MARGIN_H;
        }
        return touchLocation;
    },

    onTouchBegan:function (touch, event) {
        if (!this.isTouchInside(touch)|| !this.isEnabled() || !this.isVisible())
            return false;

        var location = this.locationFromTouch(touch);
        this.sliderBegan(location);
        return true;
    },
    onTouchMoved:function (touch, event) {
        var location = this.locationFromTouch(touch);
        this.sliderMoved(location);
    },
    onTouchEnded:function (touch, event) {
        this.sliderEnded(cc.PointZero());
    },
    needsLayout:function(){
        var percent = (this._value - this._minimumValue) / (this._maximumValue - this._minimumValue);
        var pos = this._thumbSprite.getPosition();
        pos.x = percent * this._backgroundSprite.getContentSize().width;
        this._thumbSprite.setPosition(pos);

        // Stretches content proportional to newLevel
        var textureRect = this._progressSprite.getTextureRect();
        textureRect = cc.RectMake(textureRect.x, textureRect.y, pos.x, textureRect.height);
        this._progressSprite.setTextureRect(textureRect, this._progressSprite.isTextureRectRotated(), textureRect.size);
    },
    /** Returns the value for the given location. */
    valueForLocation:function (location) {
        var percent = location.x / this._backgroundSprite.getContentSize().width;
        return Math.max(Math.min(this._minimumValue + percent * (this._maximumValue - this._minimumValue), this._maximumAllowedValue), this._minimumAllowedValue);
    }
});


/**
 * Creates a slider with a given background sprite and a progress bar and a
 * thumb item.
 *
 * @see initWithBackgroundSprite:progressSprite:thumbMenuItem:
 */
cc.ControlSlider.create = function (bgFile, progressFile, thumbFile) {
    if (typeof(bgFile) == "string") {
        // Prepare background for slider
        bgFile = cc.Sprite.create(bgFile);

        // Prepare progress for slider
        progressFile = cc.Sprite.create(progressFile);

        // Prepare thumb (menuItem) for slider
        thumbFile = cc.Sprite.create(thumbFile);
    }

    var pRet = new cc.ControlSlider();
    pRet.initWithSprites(bgFile, progressFile, thumbFile);
    return pRet;

};