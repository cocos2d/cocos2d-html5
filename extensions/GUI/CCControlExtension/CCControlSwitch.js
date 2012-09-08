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
 */

/** @class CCControlSwitch Switch control for Cocos2D. */
cc.ControlSwitch = cc.Control.extend({
    /** Sprite which represents the view. */
    _switchSprite:null,
    _initialTouchXPosition:0,

    _moved:false,
    /** A Boolean value that determines the off/on state of the switch. */
    _on:false,

    ctor:function(){},

    /** Creates a switch with a mask sprite, on/off sprites for on/off states, a thumb sprite and an on/off labels. */
    initWithMaskSprite:function(maskSprite,onSprite,offSprite,thumbSprite,onLabel,offLabel){
        if (this.init()) {
            cc.Assert(maskSprite,    "Mask must not be nil.");
            cc.Assert(onSprite,      "onSprite must not be nil.");
            cc.Assert(offSprite,     "offSprite must not be nil.");
            cc.Assert(thumbSprite,   "thumbSprite must not be nil.");

            this.setTouchEnabled(true);
            this._on = true;

            this._switchSprite = new cc.ControlSwitchSprite();
            this._switchSprite.initWithMaskSprite(maskSprite, onSprite,  offSprite, thumbSprite, onLabel, offLabel);
            this._switchSprite.setPosition(cc.p (this._switchSprite.getContentSize().width / 2, this._switchSprite.getContentSize().height / 2));
            this.addChild(this._switchSprite);

            this.ignoreAnchorPointForPosition(false);
            this.setAnchorPoint(cc.p (0.5, 0.5));
            this.setContentSize(this._switchSprite.getContentSize());
            return true;
        }
        return false;
    },

    setOn:function(isOn,animated){
        animated = animated || false;
        this._on     = isOn;

        this._switchSprite.runAction(cc.ActionTween.create( 0.2,"sliderXPosition", this._switchSprite.getSliderXPosition(),
            (this._on) ? this._switchSprite.getOnPosition() : this._switchSprite.getOffPosition()));

        this.sendActionsForControlEvents(cc.CONTROL_EVENT_VALUECHANGED);
    },

    isOn:function(){return this._on;},

    hasMoved:function(){return this._moved;},

    setEnabled:function(enabled){
        this._enabled = enabled;

        this._switchSprite.setOpacity((enabled) ? 255 : 128);
    },

    locationFromTouch:function(touch){
        var touchLocation   = touch.getLocation();                      // Get the touch position
        touchLocation = this.convertToNodeSpace(touchLocation);                  // Convert to the node space of this class

        return touchLocation;
    },

    onTouchBegan:function(touch,event){
        if (!this.isTouchInside(touch)
            || !this.isEnabled())
        {
            return false;
        }

        this._moved = false;

        var location = this.locationFromTouch(touch);

        this._initialTouchXPosition = location.x - this._switchSprite.getSliderXPosition();

        this._switchSprite.getThumbSprite().setColor(cc.gray());
        this._switchSprite.needsLayout();

        return true;
    },

    onTouchMoved:function(touch,event){
        var location    = this.locationFromTouch(touch);
        location            = cc.p (location.x - this._initialTouchXPosition, 0);

        this._moved              = true;

        this._switchSprite.setSliderXPosition(location.x);
    },

    onTouchEnded:function(touch,event){
        var location   = this.locationFromTouch(touch);

        this._switchSprite.getThumbSprite().setColor(cc.white());

        if (this.hasMoved()) {
            this.setOn(!(location.x < this._switchSprite.getContentSize().width / 2), true);
        } else {
            this.setOn(!this._on, true);
        }
    },

    onTouchCancelled:function(touch,event){
        var location   = this.locationFromTouch(touch);

        this._switchSprite.getThumbSprite().setColor(cc.white());

        if (this.hasMoved()) {
            this.setOn(!(location.x < this._switchSprite.getContentSize().width / 2), true);
        } else {
            this.setOn(!this._on, true);
        }
    }
});

/** Creates a switch with a mask sprite, on/off sprites for on/off states and a thumb sprite. */
cc.ControlSwitch.create = function(maskSprite,onSprite,offSprite,thumbSprite,onLabel,offLabel){
    var pRet = new cc.ControlSwitch();
    if (pRet && pRet.initWithMaskSprite(maskSprite, onSprite, offSprite, thumbSprite, onLabel, offLabel)) {
        return pRet;
    }
    return null;
};

cc.ControlSwitchSprite = cc.Sprite.extend({
    _sliderXPosition:0,
    _onPosition:0,
    _offPosition:0,

    _maskTexture:null,
    _textureLocation:0,
    _maskLocation:0,

    _onSprite:null,
    _offSprite:null,
    _thumbSprite:null,
    _onLabel:null,
    _offLabel:null,

    ctor:function(){},

    initWithMaskSprite:function(maskSprite,onSprite,offSprite,thumbSprite,onLabel,offLabel){
        if (this.initWithTexture(maskSprite.getTexture())) {
            // Sets the default values
            this._onPosition             = 0;
            this._offPosition            = -onSprite.getContentSize().width + thumbSprite.getContentSize().width / 2;
            this._sliderXPosition        = this._onPosition;

            this.setOnSprite(onSprite);
            this.setOffSprite(offSprite);
            this.setThumbSprite(thumbSprite);
            this.setOnLabel(onLabel);
            this.setOffLabel(offLabel);

            this.addChild(this._thumbSprite);

            // Set up the mask with the Mask shader
            this.setMaskTexture(maskSprite.getTexture());
            //TODO WebGL code

            /*
            var pProgram = new cc.GLProgram();
            pProgram.initWithVertexShaderByteArray(ccPositionTextureColor_vert, ccExSwitchMask_frag);
            this.setShaderProgram(pProgram);

            cc.CHECK_GL_ERROR_DEBUG();

            this.getShaderProgram().addAttribute(kCCAttributeNamePosition, kCCVertexAttrib_Position);
            this.getShaderProgram().addAttribute(kCCAttributeNameColor, kCCVertexAttrib_Color);
            this.getShaderProgram().addAttribute(kCCAttributeNameTexCoord, kCCVertexAttrib_TexCoords);
            cc.CHECK_GL_ERROR_DEBUG();

            this.getShaderProgram().link();
            cc.CHECK_GL_ERROR_DEBUG();

            this.getShaderProgram().updateUniforms();
            cc.CHECK_GL_ERROR_DEBUG();

            this._textureLocation    = glGetUniformLocation( getShaderProgram().getProgram(), "u_texture");
            this._maskLocation       = glGetUniformLocation( getShaderProgram().getProgram(), "u_mask");
            cc.CHECK_GL_ERROR_DEBUG();
            */

            this.setContentSize(this._maskTexture.getContentSize());

            this.needsLayout();
            return true;
        }
        return false;
    },

    draw:function(){
        //TODO WebGL code
        cc.NODE_DRAW_SETUP();

        /*ccGLEnableVertexAttribs(kCCVertexAttribFlag_PosColorTex);
        ccGLBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
        this.getShaderProgram().setUniformForModelViewProjectionMatrix();

        glActiveTexture(GL_TEXTURE0);
        glBindTexture( GL_TEXTURE_2D, getTexture().getName());
        glUniform1i(this._textureLocation, 0);

        glActiveTexture(GL_TEXTURE1);
        glBindTexture( GL_TEXTURE_2D, this._maskTexture.getName() );
        glUniform1i(this._maskLocation, 1);

        var kQuadSize = 9;
        var offset = this._quad;

        // vertex
        var diff = offsetof( cc.V3F_C4B_T2F, vertices);
        glVertexAttribPointer(kCCVertexAttrib_Position, 3, GL_FLOAT, GL_FALSE, kQuadSize, (void*) (offset + diff));

        // texCoods
        diff = offsetof( ccV3F_C4B_T2F, texCoords);
        glVertexAttribPointer(kCCVertexAttrib_TexCoords, 2, GL_FLOAT, GL_FALSE, kQuadSize, (void*)(offset + diff));

        // color
        diff = offsetof( ccV3F_C4B_T2F, colors);
        glVertexAttribPointer(kCCVertexAttrib_Color, 4, GL_UNSIGNED_BYTE, GL_TRUE, kQuadSize, (void*)(offset + diff));

        glDrawArrays(GL_TRIANGLE_STRIP, 0, 4);
        glActiveTexture(GL_TEXTURE0);*/
    },

    needsLayout:function(){
        this._onSprite.setPosition(cc.p(this._onSprite.getContentSize().width / 2 + this._sliderXPosition,
            this._onSprite.getContentSize().height / 2));
        this._offSprite.setPosition(cc.p(this._onSprite.getContentSize().width + this._offSprite.getContentSize().width / 2 + this._sliderXPosition,
            this._offSprite.getContentSize().height / 2));
        this._thumbSprite.setPosition(cc.p(this._onSprite.getContentSize().width + this._sliderXPosition,
            this._maskTexture.getContentSize().height / 2));

        if (this._onLabel) {
            this._onLabel.setPosition(cc.p(this._onSprite.getPosition().x - this._thumbSprite.getContentSize().width / 6,
                this._onSprite.getContentSize().height / 2));
        }
        if (this._offLabel) {
            this._offLabel.setPosition(cc.p(this._offSprite.getPosition().x + this._thumbSprite.getContentSize().width / 6,
                this._offSprite.getContentSize().height / 2));
        }

        var rt = cc.RenderTexture.create(this._maskTexture.getContentSize().width, this._maskTexture.getContentSize().height);

        rt.begin();
        this._onSprite.visit();
        this._offSprite.visit();

        if (this._onLabel)
            this._onLabel.visit();
        if (this._offLabel)
            this._offLabel.visit();

        rt.end();

        this.setTexture(rt.getSprite().getTexture());
        this.setFlipY(true);
    },

    setSliderXPosition:function(sliderXPosition){
        if (sliderXPosition <= this._offPosition) {
            // Off
            sliderXPosition = this._offPosition;
        } else if (sliderXPosition >= this._onPosition) {
            // On
            sliderXPosition = this._onPosition;
        }

        this._sliderXPosition    = sliderXPosition;

        this.needsLayout();
    },
    getSliderXPosition:function(){return this._sliderXPosition;},

    onSideWidth:function(){
        return this._onSprite.getContentSize().width;
    },

    offSideWidth:function(){
        return this._offSprite.getContentSize().height;
    },

    updateTweenAction:function(value,key){
        cc.log("key = "+key+", value = " + value);
        this.setSliderXPosition(value);
    },

    setOnPosition:function(onPosition){this._onPosition = onPosition;},
    getOnPosition:function(){return this._onPosition;},

    setOffPosition:function(offPosition){this._offPosition = offPosition;},
    getOffPosition:function(){return this._offPosition;},

    setMaskTexture:function(maskTexture){this._maskTexture = maskTexture;},
    getMaskTexture:function(){return this._maskTexture;},

    setTextureLocation:function(textureLocation){this._textureLocation = textureLocation;},
    getTextureLocation:function(){return this._textureLocation;},

    setMaskLocation:function(maskLocation){this._maskLocation = maskLocation;},
    getMaskLocation:function(){return this._maskLocation;},

    setOnSprite:function(onSprite){this._onSprite = onSprite;},
    getOnSprite:function(){return this._onSprite;},

    setOffSprite:function(offSprite){this._offSprite = offSprite;},
    getOffSprite:function(){return this._offSprite;},

    setThumbSprite:function(thumbSprite){this._thumbSprite = thumbSprite;},
    getThumbSprite:function(){return this._thumbSprite;},

    setOnLabel:function(onLabel){this._onLabel = onLabel;},
    getOnLabel:function(){return this._onLabel;},

    setOffLabel:function(offLabel){this._offLabel = offLabel;},
    getOffLabel:function(){return this._offLabel;}
});