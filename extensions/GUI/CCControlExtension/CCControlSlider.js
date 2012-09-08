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
    _snappingInterval:0,

    _thumbItem:null,
    _progressSprite:null,
    _backgroundSprite:null,

    getValue:function () {
        return this._value;
    },
    setValue:function (value) {
        //clamp between the two bounds
        value = Math.max(value, this._minimumValue);
        value = Math.min(value, this._maximumValue);

        //if we're snapping
        if (this._snappingInterval >= 0) {
            //int nTotal=(int)(ceil(this._maximumValue-this._minimumValue)/this._snappingInterval);
            //floor (n + 0.5f) == round(n)
            value = Math.floor(0.5 + value / this._snappingInterval) * this._snappingInterval;
        }
        this._value = value;

        // Update thumb position for new value
        var percent = (this._value - this._minimumValue) / (this._maximumValue - this._minimumValue);
        var pos = this._thumbItem.getPosition();
        pos.x = percent * this._backgroundSprite.getContentSize().width + cc.SLIDER_MARGIN_H;
        this._thumbItem.setPosition(pos);

        // Stretches content proportional to newLevel
        var textureRect = this._progressSprite.getTextureRect();
        textureRect = cc.RectMake(textureRect.origin.x, textureRect.origin.y, percent * this._backgroundSprite.getContentSize().width, textureRect.size.height);
        this._progressSprite.setTextureRect(textureRect, this._progressSprite.isTextureRectRotated(), textureRect.size);
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

    getSnappingInterval:function () {
        return this._snappingInterval;
    },
    setSnappingInterval:function (val) {
        this._snappingInterval = val;
    },

    getThumbItem:function () {
        return this._thumbItem;
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
     * @param backgroundSprite  CCSprite, that is used as a background.
     * @param progressSprite    CCSprite, that is used as a progress bar.
     * @param thumbItem         CCMenuItem, that is used as a thumb.
     */
    initWithSprites:function (backgroundSprite, progressSprite, thumbItem) {
        if (this.init()) {
            this.ignoreAnchorPointForPosition(false);
            this.setTouchEnabled(true);

            this._backgroundSprite = backgroundSprite;
            this._progressSprite = progressSprite;
            this._thumbItem = thumbItem;

            // Defines the content size
            var maxRect = cc.ControlUtils.CCRectUnion(backgroundSprite.getBoundingBox(), thumbItem.getBoundingBox());
            var size = cc.SizeMake(maxRect.size.width + 2 * cc.SLIDER_MARGIN_H, maxRect.size.height + 2 * cc.SLIDER_MARGIN_V);
            this.setContentSize(size);
            //setContentSize(CCSizeMake(backgroundSprite.getContentSize().width, thumbItem.getContentSize().height));
            // Add the slider background
            this._backgroundSprite.setAnchorPoint(cc.p(0.5, 0.5));
            this._backgroundSprite.setPosition(cc.p(size.width / 2, size.height / 2));
            this.addChild(this._backgroundSprite);

            // Add the progress bar
            this._progressSprite.setAnchorPoint(cc.p(0.0, 0.5));
            this._progressSprite.setPosition(cc.p(0.0 + cc.SLIDER_MARGIN_H, size.height / 2));
            this.addChild(this._progressSprite);

            // Add the slider thumb
            this._thumbItem.setPosition(cc.p(0 + cc.SLIDER_MARGIN_H, size.height / 2));
            this.addChild(this._thumbItem);

            // Init default values
            this._minimumValue = 0.0;
            this._maximumValue = 1.0;
            this._snappingInterval = -1.0;
            this.setValue(this._minimumValue);
            return true;
        } else
            return false;
    },

    sliderBegan:function (location) {
        this._thumbItem.selected();
        this.setValue(this.valueForLocation(location));
    },
    sliderMoved:function (location) {
        this.setValue(this.valueForLocation(location));
    },
    sliderEnded:function (location) {
        if (this._thumbItem.isSelected()) {
            this._thumbItem.unselected();
            this.setValue(this.valueForLocation(this._thumbItem.getPosition()));
        }
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
        if (!this.isTouchInside(touch))
            return false;

        var location = this.getTouchLocationInControl(touch);
        this.sliderBegan(location);
        return true;
    },
    onTouchMoved:function (touch, event) {
        var location = this.getTouchLocationInControl(touch);
        this.sliderMoved(location);
    },
    onTouchEnded:function (touch, event) {
        //var location = this.getTouchLocationInControl(touch);
        this.sliderEnded(cc.PointZero());
    },

    /** Returns the value for the given location. */
    valueForLocation:function (location) {
        var percent = (location.x - cc.SLIDER_MARGIN_H) / this._backgroundSprite.getContentSize().width;
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
        var thumbNormal = cc.Sprite.create(thumbFile);
        var thumbSelected = cc.Sprite.create(thumbFile);
        thumbSelected.setColor(cc.gray());

        thumbFile = cc.MenuItemSprite.create(thumbNormal, thumbSelected);
    }

    var pRet = new cc.ControlSlider();
    pRet.initWithSprites(bgFile, progressFile, thumbFile);
    return pRet;

};