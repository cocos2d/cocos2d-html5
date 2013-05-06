/*
 * CCControlButton.m
 *
 * Copyright (c) 2010-2012 cocos2d-x.org
 * Copyright 2011 Yannick Loriot.
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

cc.CONTROL_ZOOM_ACTION_TAG = 0xCCCB0001;

/** @class CCControlButton Button control for Cocos2D. */
cc.ControlButton = cc.Control.extend({
    _adjustBackgroundImage:false,
    _zoomOnTouchDown:false,
    _preferredSize:new cc.Size(0, 0),
    _labelAnchorPoint:new cc.Point(0, 0),
    _currentTitle:"",
    _currentTitleColor:cc.white(),
    _titleLabel:null,
    _backgroundSprite:null,
    _opacity:0,
    _pushed:false,
    _titleDispatchTable:null,
    _titleColorDispatchTable:null,
    _titleLabelDispatchTable:null,
    _backgroundSpriteDispatchTable:null,

    _marginV:0,
    _marginH:0,

    ctor:function () {
        this._super();
        this._preferredSize = new cc.Size(0, 0);
        this._labelAnchorPoint = new cc.Point(0, 0);

        this._currentTitleColor = cc.white();
        this._titleDispatchTable = {};
        this._titleColorDispatchTable = {};
        this._titleLabelDispatchTable = {};
        this._backgroundSpriteDispatchTable = {};
    },

    init:function (isDirectCall) {
        if ((isDirectCall != null) && (isDirectCall == true))
            return this._super();
        return this.initWithLabelAndBackgroundSprite(cc.LabelTTF.create("", "Helvetica", 12), cc.Scale9Sprite.create());
    },

    needsLayout:function () {
        // Hide the background and the label
        this._titleLabel.setVisible(false);
        this._backgroundSprite.setVisible(false);

        // Update anchor of all labels
        this.setLabelAnchorPoint(this.m_labelAnchorPoint);

        // Update the label to match with the current state
        //CC_SAFE_RELEASE(this._currentTitle)

        this._currentTitle = this.getTitleForState(this._state);
        this._currentTitleColor = this.getTitleColorForState(this._state);

        this._titleLabel = this.getTitleLabelForState(this._state);

        var label = this._titleLabel;
        if (label && label.setString)
            label.setString(this._currentTitle);

        if (this._titleLabel && this._titleLabel.RGBAProtocol)
            this._titleLabel.setColor(this._currentTitleColor);
        this._titleLabel.setPosition(cc.p(this.getContentSize().width / 2, this.getContentSize().height / 2));


        // Update the background sprite
        this._backgroundSprite = this.getBackgroundSpriteForState(this._state);
        this._backgroundSprite.setPosition(cc.p(this.getContentSize().width / 2, this.getContentSize().height / 2));

        // Get the title label size
        var titleLabelSize = this._titleLabel.getBoundingBox().size;

        // Adjust the background image if necessary
        if (this._adjustBackgroundImage) {
            // Add the margins
            this._backgroundSprite.setContentSize(cc.SizeMake(titleLabelSize.width + this._marginH * 2, titleLabelSize.height + this._marginV * 2));
        } else {
            //TODO: should this also have margins if one of the preferred sizes is relaxed?
            var preferredSize = this._backgroundSprite.getPreferredSize();
            if (preferredSize.width <= 0) {
                preferredSize.width = titleLabelSize.width;
            }
            if (preferredSize.height <= 0) {
                preferredSize.height = titleLabelSize.height;
            }

            this._backgroundSprite.setContentSize(preferredSize);
        }

        // Set the content size
        var maxRect = cc.ControlUtils.CCRectUnion(this._titleLabel.getBoundingBox(), this._backgroundSprite.getBoundingBox());
        this.setContentSize(cc.SizeMake(maxRect.size.width, maxRect.size.height));

        this._titleLabel.setPosition(cc.p(this.getContentSize().width / 2, this.getContentSize().height / 2));
        this._backgroundSprite.setPosition(cc.p(this.getContentSize().width / 2, this.getContentSize().height / 2));

        // Make visible the background and the label
        this._titleLabel.setVisible(true);
        this._backgroundSprite.setVisible(true);
    },

    initWithLabelAndBackgroundSprite:function (label, backgroundSprite) {
        if (this.init(true)) {
            cc.Assert(label != null, "node must not be nil");
            cc.Assert(label != null || label.RGBAProtocol || backgroundSprite != null, "");

            this.setTouchEnabled(true);
            this._pushed = false;
            this._zoomOnTouchDown = true;
            this._state = cc.CONTROL_STATE_INITIAL;
            this._currentTitle = null;

            // Adjust the background image by default
            this._adjustBackgroundImage = true;

            // Zooming button by default
            this._zoomOnTouchDown = true;

            // Set the default anchor point
            this.ignoreAnchorPointForPosition(false);
            this.setAnchorPoint(cc.p(0.5, 0.5));

            // Set the nodes
            this._titleLabel = label;
            this._backgroundSprite = backgroundSprite;


            // Initialize the button state tables
            this._titleDispatchTable = {};
            this._titleColorDispatchTable = {};
            this._titleLabelDispatchTable = {};
            this._backgroundSpriteDispatchTable = {};

            // Set the default color and opacity
            this.setColor(cc.c3(255, 255, 255));
            this.setOpacity(255);
            this.setOpacityModifyRGB(true);

            // Initialize the dispatch table
            var tempString = label.getString();
            //tempString.autorelease();
            this.setTitleForState(tempString, cc.CONTROL_STATE_NORMAL);
            this.setTitleColorForState(label.getColor(), cc.CONTROL_STATE_NORMAL);
            this.setTitleLabelForState(label, cc.CONTROL_STATE_NORMAL);
            this.setBackgroundSpriteForState(backgroundSprite, cc.CONTROL_STATE_NORMAL);

            this._state = cc.CONTROL_STATE_NORMAL;

            //default margins
            this._marginH = 24;
            this._marginV = 12;

            this.m_labelAnchorPoint = new cc.Point(0.5, 0.5);

            // Layout update
            this.needsLayout();

            return true;
        }//couldn't init the CCControl
        else
            return false;
    },

    initWithTitleAndFontNameAndFontSize:function (title, fontName, fontSize) {
        var label = cc.LabelTTF.create(title, fontName, fontSize);
        return this.initWithLabelAndBackgroundSprite(label, cc.Scale9Sprite.create());
    },

    initWithBackgroundSprite:function (sprite) {
        var label = cc.LabelTTF.create("", "Arial", 30);//
        return this.initWithLabelAndBackgroundSprite(label, sprite);
    },

    /** Adjust the background image. YES by default. If the property is set to NO, the
     background will use the prefered size of the background image. */
    getAdjustBackgroundImage:function () {
        return this._adjustBackgroundImage;
    },
    setAdjustBackgroundImage:function (adjustBackgroundImage) {
        this._adjustBackgroundImage = adjustBackgroundImage;
        this.needsLayout();
    },

    /** Adjust the button zooming on touchdown. Default value is YES. */
    getZoomOnTouchDown:function () {
        return this._zoomOnTouchDown;
    },
    setZoomOnTouchDown:function (zoomOnTouchDown) {
        return this._zoomOnTouchDown = zoomOnTouchDown;
    },

    /** The prefered size of the button, if label is larger it will be expanded. */
    getPreferredSize:function () {
        return this._preferredSize;
    },
    setPreferredSize:function (preferredSize) {
        if (preferredSize.width == 0 && preferredSize.height == 0) {
            this._adjustBackgroundImage = true;
        } else {
            this._adjustBackgroundImage = false;
            for (var itemKey in this._backgroundSpriteDispatchTable) {
                this._backgroundSpriteDispatchTable[itemKey].setPreferredSize(preferredSize);
            }

            this._preferredSize = preferredSize;
        }
        this.needsLayout();
    },

    getLabelAnchorPoint:function () {
        return this._labelAnchorPoint;
    },
    setLabelAnchorPoint:function (labelAnchorPoint) {
        this.m_labelAnchorPoint = labelAnchorPoint;

        this._titleLabel.setAnchorPoint(labelAnchorPoint);
    },

    /** The current title that is displayed on the button. */
    getCurrentTitle:function () {
        return this._currentTitle;
    },

    /** The current color used to display the title. */
    getCurrentTitleColor:function () {
        return this._currentTitleColor;
    },

    /* Override setter to affect a background sprite too */
    getOpacity:function () {
        return this._opacity;
    },

    setOpacity:function (opacity) {
        this._opacity = opacity;

        var controlChildren = this.getChildren();

        for (var i = 0; i < controlChildren.length; i++) {
            if (controlChildren[i] && controlChildren[i].RGBAProtocol) {
                controlChildren[i].setOpacity(opacity);
            }
        }
        for (var itemKey in this._backgroundSpriteDispatchTable) {
            this._backgroundSpriteDispatchTable[itemKey].setOpacity(opacity);
        }
    },

    /** Flag to know if the button is currently pushed.  */
    getIsPushed:function () {
        return this._pushed;
    },

    /* Define the button margin for Top/Bottom edge */
    getVerticalMargin:function () {
        return this._marginV;
    },
    /* Define the button margin for Left/Right edge */
    getHorizontalOrigin:function () {
        return this._marginH;
    },
    //set the margins at once (so we only have to do one call of needsLayout)
    setMargins:function (marginH, marginV) {
        this._marginV = marginV;
        this._marginH = marginH;
        this.needsLayout();
    },

    setEnabled:function (enabled) {
        this._super(enabled);
        this.needsLayout();
    },
    setSelected:function (enabled) {
        this._super(enabled);
        this.needsLayout();
    },
    setHighlighted:function (enabled) {
        this._super(enabled);
        var action = this.getActionByTag(cc.CONTROL_ZOOM_ACTION_TAG);
        if (action) {
            this.stopAction(action);
        }
        this.needsLayout();
        if (this._zoomOnTouchDown) {
            var scaleValue = (this.isHighlighted() && this.isEnabled() && !this.isSelected()) ? 1.1 : 1.0;
            var zoomAction = cc.ScaleTo.create(0.05, scaleValue);
            zoomAction.setTag(cc.CONTROL_ZOOM_ACTION_TAG);
            this.runAction(zoomAction);
        }
    },

    onTouchBegan:function (touch, event) {
        if (!this.isTouchInside(touch) || !this.isEnabled()) {
            return false;
        }

        this._state = cc.CONTROL_STATE_HIGHLIGHTED;
        this._pushed = true;
        this.setHighlighted(true);
        this.sendActionsForControlEvents(cc.CONTROL_EVENT_TOUCH_DOWN);
        return true;
    },

    onTouchMoved:function (touch, event) {
        if (!this._enabled || !this._pushed || this._selected) {
            if (this._highlighted) {
                this.setHighlighted(false);
            }
            return;
        }

        var isTouchMoveInside = this.isTouchInside(touch);
        if (isTouchMoveInside && !this._highlighted) {
            this._state = cc.CONTROL_STATE_HIGHLIGHTED;
            this.setHighlighted(true);
            this.sendActionsForControlEvents(cc.CONTROL_EVENT_TOUCH_DRAG_ENTER);
        } else if (isTouchMoveInside && this._highlighted) {
            this.sendActionsForControlEvents(cc.CONTROL_EVENT_TOUCH_DRAG_INSIDE);
        } else if (!isTouchMoveInside && this._highlighted) {
            this._state = cc.CONTROL_STATE_NORMAL;
            this.setHighlighted(false);
            this.sendActionsForControlEvents(cc.CONTROL_EVENT_TOUCH_DRAG_EXIT);
        } else if (!isTouchMoveInside && !this._highlighted) {
            this.sendActionsForControlEvents(cc.CONTROL_EVENT_TOUCH_DRAG_OUTSIDE);
        }
    },
    onTouchEnded:function (touch, event) {
        this._state = cc.CONTROL_STATE_NORMAL;
        this._pushed = false;
        this.setHighlighted(false);

        if (this.isTouchInside(touch)) {
            this.sendActionsForControlEvents(cc.CONTROL_EVENT_TOUCH_UP_INSIDE);
        } else {
            this.sendActionsForControlEvents(cc.CONTROL_EVENT_TOUCH_UP_OUTSIDE);
        }
    },

    onTouchCancelled:function (touch, event) {
        this._state = cc.CONTROL_STATE_NORMAL;
        this._pushed = false;
        this.setHighlighted(false);
        this.sendActionsForControlEvents(cc.CONTROL_EVENT_TOUCH_CANCEL);
    },

    /**
     * Returns the title used for a state.
     *
     * @param state The state that uses the title. Possible values are described in
     * "CCControlState".
     *
     * @return The title for the specified state.
     */
    getTitleForState:function (state) {
        if (this._titleDispatchTable.hasOwnProperty(state)) {
            if (this._titleDispatchTable[state])
                return this._titleDispatchTable[state];
        }
        return this._titleDispatchTable[cc.CONTROL_STATE_NORMAL];
    },

    /**
     * Sets the title string to use for the specified state.
     * If a property is not specified for a state, the default is to use
     * the CCButtonStateNormal value.
     *
     * @param title The title string to use for the specified state.
     * @param state The state that uses the specified title. The values are described
     * in "CCControlState".
     */
    setTitleForState:function (title, state) {
        if (title) {
            this._titleDispatchTable[state] = title;
        } else {
            this._titleDispatchTable[state] = "";
        }

        // If the current state if equal to the given state we update the layout
        if (this.getState() == state) {
            this.needsLayout();
        }
    },

    /**
     * Returns the title color used for a state.
     *
     * @param state The state that uses the specified color. The values are described
     * in "CCControlState".
     *
     * @return The color of the title for the specified state.
     */
    getTitleColorForState:function (state) {
        if (this._titleColorDispatchTable.hasOwnProperty(state)) {
            if (this._titleColorDispatchTable[state]) {
                return this._titleColorDispatchTable[state];
            }
        }

        return this._titleColorDispatchTable[cc.CONTROL_STATE_NORMAL];
    },

    /**
     * Sets the color of the title to use for the specified state.
     *
     * @param color The color of the title to use for the specified state.
     * @param state The state that uses the specified color. The values are described
     * in "CCControlState".
     */
    setTitleColorForState:function (color, state) {
        //ccColor3B* colorValue=&color;
        this._titleColorDispatchTable[state] = color;

        // If the current state if equal to the given state we update the layout
        if (this.getState() == state) {
            this.needsLayout();
        }
    },

    /**
     * Returns the title label used for a state.
     *
     * @param state The state that uses the title label. Possible values are described
     * in "CCControlState".
     */
    getTitleLabelForState:function (state) {
        if (this._titleLabelDispatchTable.hasOwnProperty(state) && this._titleLabelDispatchTable[state]) {
            return this._titleLabelDispatchTable[state];
        }
        return this._titleLabelDispatchTable[cc.CONTROL_STATE_NORMAL];
    },

    /**
     * Sets the title label to use for the specified state.
     * If a property is not specified for a state, the default is to use
     * the CCButtonStateNormal value.
     *
     * @param title The title label to use for the specified state.
     * @param state The state that uses the specified title. The values are described
     * in "CCControlState".
     */
    setTitleLabelForState:function (titleLabel, state) {
        if (this._titleLabelDispatchTable.hasOwnProperty(state)) {
            var previousLabel = this._titleLabelDispatchTable[state];
            if (previousLabel) {
                this.removeChild(previousLabel, true);
            }
        }

        this._titleLabelDispatchTable[state] = titleLabel;
        titleLabel.setVisible(false);
        titleLabel.setAnchorPoint(cc.p(0.5, 0.5));
        this.addChild(titleLabel, 1);

        // If the current state if equal to the given state we update the layout
        if (this.getState() == state) {
            this.needsLayout();
        }
    },

    setTitleTTFForState:function (fntFile, state) {
        var title = this.getTitleForState(state);
        if (!title)
            title = "";
        this.setTitleLabelForState(cc.LabelTTF.create(title, fntFile, 12), state);
    },

    getTitleTTFForState:function (state) {
        var labelTTF = this.getTitleLabelForState(state);
        if ((labelTTF != null) && (labelTTF instanceof  cc.LabelTTF)) {
            return labelTTF.getFontName();
        } else {
            return "";
        }
    },

    setTitleTTFSizeForState:function (size, state) {
        var labelTTF = this.getTitleLabelForState(state);
        if ((labelTTF != null) && (labelTTF instanceof  cc.LabelTTF)) {
            labelTTF.setFontSize(size);
        }
    },

    getTitleTTFSizeForState:function (state) {
        var labelTTF = this.getTitleLabelForState(state);
        if ((labelTTF != null) && (labelTTF instanceof  cc.LabelTTF)) {
            return labelTTF.getFontSize();
        }
        return 0;
    },

    /**
     * Sets the font of the label, changes the label to a CCLabelBMFont if neccessary.
     * @param fntFile The name of the font to change to
     * @param state The state that uses the specified fntFile. The values are described
     * in "CCControlState".
     */
    setTitleBMFontForState:function (fntFile, state) {
        var title = this.getTitleForState(state);
        if (!title)
            title = "";
        this.setTitleLabelForState(cc.LabelBMFont.create(title, fntFile), state);
    },

    getTitleBMFontForState:function (state) {
        var labelBMFont = this.getTitleLabelForState(state);
        if ((labelBMFont != null) && (labelBMFont instanceof  cc.LabelBMFont)) {
            return labelBMFont.getFntFile();
        }
        return "";
    },

    /**
     * Returns the background sprite used for a state.
     *
     * @param state The state that uses the background sprite. Possible values are
     * described in "CCControlState".
     */
    getBackgroundSpriteForState:function (state) {
        if (this._backgroundSpriteDispatchTable.hasOwnProperty(state) && this._backgroundSpriteDispatchTable[state]) {
            return this._backgroundSpriteDispatchTable[state];
        }
        return this._backgroundSpriteDispatchTable[cc.CONTROL_STATE_NORMAL];
    },

    /**
     * Sets the background sprite to use for the specified button state.
     *
     * @param sprite The background sprite to use for the specified state.
     * @param state The state that uses the specified image. The values are described
     * in "CCControlState".
     */
    setBackgroundSpriteForState:function (sprite, state) {
        if (this._backgroundSpriteDispatchTable.hasOwnProperty(state)) {
            var previousSprite = this._backgroundSpriteDispatchTable[state];
            if (previousSprite) {
                this.removeChild(previousSprite, true);
            }
        }

        this._backgroundSpriteDispatchTable[state] = sprite;
        sprite.setVisible(false);
        sprite.setAnchorPoint(cc.p(0.5, 0.5));
        this.addChild(sprite);

        if (this._preferredSize.width != 0 || this._preferredSize.height != 0) {
            sprite.setPreferredSize(this._preferredSize);
        }

        // If the current state if equal to the given state we update the layout
        if (this.getState() == state) {
            this.needsLayout();
        }
    },

    /**
     * Sets the background spriteFrame to use for the specified button state.
     *
     * @param spriteFrame The background spriteFrame to use for the specified state.
     * @param state The state that uses the specified image. The values are described
     * in "CCControlState".
     */
    setBackgroundSpriteFrameForState:function (spriteFrame, state) {
        var sprite = cc.Scale9Sprite.createWithSpriteFrame(spriteFrame);
        this.setBackgroundSpriteForState(sprite, state);
    }
});

cc.ControlButton.create = function (label, backgroundSprite) {
    var controlButton;
    if (arguments.length == 0) {
        controlButton = new cc.ControlButton();
        if (controlButton && controlButton.init()) {
            return controlButton;
        }
        return null;
    } else if (arguments.length == 1) {
        controlButton = new cc.ControlButton();
        controlButton.initWithBackgroundSprite(arguments[0]);
        return controlButton;
    } else if (arguments.length == 2) {
        controlButton = new cc.ControlButton();
        controlButton.initWithLabelAndBackgroundSprite(label, backgroundSprite);
        return controlButton;
    } else if (arguments.length == 3) {
        controlButton = new cc.ControlButton();
        controlButton.initWithTitleAndFontNameAndFontSize(arguments[0], arguments[1], arguments[2]);
        return controlButton;
    }
};


