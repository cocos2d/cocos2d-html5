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


cc.ControlColourPicker = cc.Control.extend({
    _colorValue:null,
    _hsv:null,
    _colourPicker:null,
    _huePicker:null,

    _background:null,

    hueSliderValueChanged:function(sender, controlEvent){
        this._hsv.h      = sender.getHue();

        // Update the value
        var rgb    = cc.ControlUtils.RGBfromHSV(this._hsv);
        this._colorValue= cc.c3( 0|(rgb.r * 255), 0|(rgb.g * 255), 0|(rgb.b * 255));

        // Send CCControl callback
        this.sendActionsForControlEvents(cc.CONTROL_EVENT_VALUECHANGED);
        this._updateControlPicker();
    },

    colourSliderValueChanged:function(sender,controlEvent){
        this._hsv.s= sender.getSaturation();
        this._hsv.v= sender.getBrightness();


        // Update the value
        var rgb    = cc.ControlUtils.RGBfromHSV(this._hsv);
        this._colorValue=cc.c3(0|(rgb.r * 255), 0|(rgb.g * 255), 0|(rgb.b * 255));

        // Send CCControl callback
        this.sendActionsForControlEvents(cc.CONTROL_EVENT_VALUECHANGED);
    },

    getColorValue:function(){return this._colorValue;},

    setColorValue:function(colorValue){
        this._colorValue      = colorValue;

        var rgba = new cc.RGBA();
        rgba.r      = colorValue.r / 255.0;
        rgba.g      = colorValue.g / 255.0;
        rgba.b      = colorValue.b / 255.0;
        rgba.a      = 1.0;

        this._hsv=cc.ControlUtils.HSVfromRGB(rgba);
        this._updateHueAndControlPicker();
    },

    getBackground:function(){return this._background;},

    init:function(){
        if (this._super()) {
            this.setTouchEnabled(true);
            // Cache the sprites
            cc.SpriteFrameCache.getInstance().addSpriteFrames("extensions/CCControlColourPickerSpriteSheet.plist");

            // Create the sprite batch node
            var spriteSheet  = cc.SpriteBatchNode.create("extensions/CCControlColourPickerSpriteSheet.png");
            this.addChild(spriteSheet);

            // MIPMAP
            //TODO WebGL code
            var params  = [GL_LINEAR_MIPMAP_LINEAR, GL_LINEAR, GL_REPEAT, GL_REPEAT];
            spriteSheet.getTexture().setAliasTexParameters();
            spriteSheet.getTexture().setTexParameters(params);
            spriteSheet.getTexture().generateMipmap();

            // Init default color
            this._hsv.h = 0;
            this._hsv.s = 0;
            this._hsv.v = 0;

            // Add image
            this._background=cc.ControlUtils.addSpriteToTargetWithPosAndAnchor("menuColourPanelBackground.png", spriteSheet, cc.PointZero, cc.p(0.5, 0.5));

            var backgroundPointZero = cc.pSub(this._background.getPosition(),
                cc.p(this._background.getContentSize().width / 2, this._background.getContentSize().height / 2));

            // Setup panels . currently hard-coded...
            var hueShift                = 8;
            var colourShift             = 28;

            this._huePicker=cc.ControlHuePicker.create(spriteSheet, cc.p(backgroundPointZero.x + hueShift, backgroundPointZero.y + hueShift));
            this._colourPicker=cc.ControlSaturationBrightnessPicker.create(spriteSheet, cc.p(backgroundPointZero.x + colourShift, backgroundPointZero.y + colourShift));

            // Setup events
            this._huePicker.addTargetWithActionForControlEvents(this, this.hueSliderValueChanged, cc.CONTROL_EVENT_VALUECHANGED);
            this._colourPicker.addTargetWithActionForControlEvents(this, this.colourSliderValueChanged, cc.CONTROL_EVENT_VALUECHANGED);

            // Set defaults
            this._updateHueAndControlPicker();
            this.addChild(this._huePicker);
            this.addChild(this._colourPicker);

            // Set content size
            this.setContentSize(this._background.getContentSize());
            return true;
        }
        else
            return false;
    },

    _updateControlPicker:function(){
        this._huePicker.setHue(this._hsv.h);
        this._colourPicker.updateWithHSV(this._hsv);
    },

    _updateHueAndControlPicker:function(){
        this._huePicker.setHue(this._hsv.h);
        this._colourPicker.updateWithHSV(this._hsv);
        this._colourPicker.updateDraggerWithHSV(this._hsv);
    },

    onTouchBegan:function(){
        //ignore all touches, handled by children
        return false;
    }
});

cc.ControlColourPicker.create = function(){
    var pRet = new cc.ControlColourPicker();
    pRet.init();
    return pRet;
};