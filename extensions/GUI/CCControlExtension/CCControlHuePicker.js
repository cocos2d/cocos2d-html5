/*
 *
 * Copyright (c) 2010-2012 cocos2d-x.org
 *
 * Copyright 2012 Stewart Hamilton-Arrandale.
 * http://creativewax.co.uk
 *
 * Modified by Yannick Loriot.
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

cc.ControlHuePicker = cc.Control.extend({
    _hue:0,
    _huePercentage:0,
    _background:null,
    _slider:null,
    _startPos:null,

    //maunally put in the setters
    getHue:function () {
        return this._hue;
    },
    setHue:function (hueValue) {
        m_hue = hueValue;
        this.setHuePercentage(m_hue / 360.0);
    },

    getHuePercentage:function () {
        return this._huePercentage;
    },
    setHuePercentage:function (hueValueInPercent) {
        this._huePercentage = hueValueInPercent;
        this._hue = this._huePercentage * 360.0;

        // Clamp the position of the icon within the circle
        var backgroundBox = this._background.getBoundingBox();

        // Get the center point of the background image
        var centerX = this._startPos.x + backgroundBox.size.width * 0.5;
        var centerY = this._startPos.y + backgroundBox.size.height * 0.5;

        // Work out the limit to the distance of the picker when moving around the hue bar
        var limit = backgroundBox.size.width * 0.5 - 15.0;

        // Update angle
        var angleDeg = this._huePercentage * 360.0 - 180.0;
        var angle = cc.DEGREES_TO_RADIANS(angleDeg);

        // Set new position of the slider
        var x = centerX + limit * Math.cos(angle);
        var y = centerY + limit * Math.sin(angle);
        this._slider.setPosition(cc.p(x, y));
    },

    getBackground:function () {
        return this._background;
    },
    getSlider:function () {
        return this._slider;
    },
    getStartPos:function () {
        return this._startPos;
    },

    initWithTargetAndPos:function (target, pos) {
        if (this.init()) {
            this.setTouchEnabled(true);
            // Add background and slider sprites
            this._background = cc.ControlUtils.addSpriteToTargetWithPosAndAnchor("huePickerBackground.png", target, pos, cc.p(0.0, 0.0));
            this._slider = cc.ControlUtils.addSpriteToTargetWithPosAndAnchor("colourPicker.png", target, pos, cc.p(0.5, 0.5));

            this._slider.setPosition(cc.p(pos.x, pos.y + this._background.getBoundingBox().size.height * 0.5));
            this._startPos = pos;

            // Sets the default value
            this._hue = 0.0;
            this._huePercentage = 0.0;
            return true;
        } else
            return false;
    },

    _updateSliderPosition:function (location) {
        // Clamp the position of the icon within the circle
        var backgroundBox = this._background.getBoundingBox();

        // Get the center point of the background image
        var centerX = this._startPos.x + backgroundBox.size.width * 0.5;
        var centerY = this._startPos.y + backgroundBox.size.height * 0.5;

        // Work out the distance difference between the location and center
        var dx = location.x - centerX;
        var dy = location.y - centerY;

        // Update angle by using the direction of the location
        var angle = Math.atan2(dy, dx);
        var angleDeg = cc.RADIANS_TO_DEGREES(angle) + 180.0;

        // use the position / slider width to determin the percentage the dragger is at
        this.setHue(angleDeg);

        // send CCControl callback
        this.sendActionsForControlEvents(cc.CONTROL_EVENT_VALUECHANGED);
    },
    _checkSliderPosition:function (location) {
        // check that the touch location is within the bounding rectangle before sending updates
        if (cc.Rect.CCRectContainsPoint(this._background.getBoundingBox(), location)) {
            this._updateSliderPosition(location);
            return true;
        }
        return false;
    },

    onTouchBegan:function (touch, event) {
        var touchLocation = this.getTouchLocation(touch);

        // Check the touch position on the slider
        return this._checkSliderPosition(touchLocation);
    },
    onTouchMoved:function (touch, event) {
        // Get the touch location
        var touchLocation = this.getTouchLocation(touch);

        //small modification: this allows changing of the colour, even if the touch leaves the bounding area
        this._updateSliderPosition(touchLocation);
        this.sendActionsForControlEvents(cc.CONTROL_EVENT_VALUECHANGED);
        // Check the touch position on the slider
        //checkSliderPosition(touchLocation);
    }
});

cc.ControlHuePicker.create = function (target, pos) {
    var pRet = new cc.ControlHuePicker();
    pRet.initWithTargetAndPos(target, pos);
    return pRet;
};