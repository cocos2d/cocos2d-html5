/****************************************************************************
 Copyright (c) 2010-2012 cocos2d-x.org
 Copyright (c) 2008-2010 Ricardo Quesada
 Copyright (c) 2011      Zynga Inc.

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
 * default size for font size
 * @constant
 * @type Number
 */
cc.ITEM_SIZE = 32;

cc._fontSize = cc.ITEM_SIZE;
cc._fontName = "Arial";
cc._fontNameRelease = false;

/**
 * default tag for current item
 * @constant
 * @type Number
 */
cc.CURRENT_ITEM = 0xc0c05001;
/**
 * default tag for zoom action tag
 * @constant
 * @type Number
 */
cc.ZOOM_ACTION_TAG = 0xc0c05002;
/**
 * default tag for normal
 * @constant
 * @type Number
 */
cc.NORMAL_TAG = 8801;

/**
 * default selected tag
 * @constant
 * @type Number
 */
cc.SELECTED_TAG = 8802;

/**
 * default disabled tag
 * @constant
 * @type Number
 */
cc.DISABLE_TAG = 8803;

/**
 * Subclass cc.MenuItem (or any subclass) to create your custom cc.MenuItem objects.
 * @class
 * @extends cc.Node
 */
cc.MenuItem = cc.Node.extend(/** @lends cc.MenuItem# */{
    _listener:null,
    _selector:null,
    _isSelected:false,
    _isEnabled:false,

    /**
     * MenuItem is selected
     * @return {Boolean}
     */
    isSelected:function () {
        return this._isSelected;
    },

    /**
     * set the target/selector of the menu item
     * @param {function|String} selector
     * @param {cc.Node} rec
     */
    setTarget:function (selector, rec) {
        this._listener = rec;
        this._selector = selector;
    },

    /**
     * MenuItem is Enabled
     * @return {Boolean}
     */
    isEnabled:function () {
        return this._isEnabled;
    },

    /**
     * set enable value of MenuItem
     * @param {Boolean} enable
     */
    setEnabled:function (enable) {
        this._isEnabled = enable;
    },

    /**
     * @param {function|String} selector
     * @param {cc.Node} rec
     * @return {Boolean}
     */
    initWithCallback:function (selector, rec) {
        this.setAnchorPoint(cc.p(0.5, 0.5));
        this._listener = rec;
        this._selector = selector;
        this._isEnabled = true;
        this._isSelected = false;
        return true;
    },

    /**
     * return rect value of cc.MenuItem
     * @return {cc.Rect}
     */
    rect:function () {
        return cc.rect(this._position.x - this._contentSize.width * this._anchorPoint.x,
            this._position.y - this._contentSize.height * this._anchorPoint.y,
            this._contentSize.width, this._contentSize.height);
    },

    /**
     * same as setIsSelected(true)
     */
    selected:function () {
        this._isSelected = true;
    },

    /**
     * same as setIsSelected(false)
     */
    unselected:function () {
        this._isSelected = false;
    },

    /**
     * @param {function|String} selector
     * @param {cc.Node} rec
     */
    setCallback:function (selector, rec) {
        this._listener = rec;
        this._selector = selector;
    },

    /**
     * call the selector with target
     */
    activate:function () {
        if (this._isEnabled) {
            if (this._listener && (typeof(this._selector) == "string")) {
                this._listener[this._selector](this);
            } else if (this._listener && (typeof(this._selector) == "function")) {
                this._selector.call(this._listener, this);
            } else {
                this._selector(this);
            }
        }
    }
});

/**
 * creates an empty menu item with target and callback<br/>
 * Not recommended to use the base class, should use more defined menu item classes
 * @param {function|String} selector callback
 * @param {cc.Node} rec target
 * @return {cc.MenuItem}
 */
cc.MenuItem.create = function (selector, rec) {
    var ret = new cc.MenuItem();
    ret.initWithCallback(rec, selector);
    return ret;
};


/**
 *  Any cc.Node that supports the cc.LabelProtocol protocol can be added.<br/>
 * Supported nodes:<br/>
 * - cc.BitmapFontAtlas<br/>
 * - cc.LabelAtlas<br/>
 * - cc.LabelTTF<br/>
 * @class
 * @extends cc.MenuItem
 */
cc.MenuItemLabel = cc.MenuItem.extend(/** @lends cc.MenuItemLabel# */{

    /**
     * this identifies that this object have implemented RGBAProtocol
     * @type Boolean
     */
    RGBAProtocol:true,

    _disabledColor:new cc.Color3B(),

    /**
     * @return {cc.Color3B}
     */
    getDisabledColor:function () {
        return this._disabledColor;
    },

    /**
     * @param {cc.Color3B} color
     */
    setDisabledColor:function (color) {
        this._disabledColor = color;
    },
    _label:null,

    /**
     * return label of MenuItemLabel
     * @return {cc.Node}
     */
    getLabel:function () {
        return this._label;
    },

    /**
     * @param {cc.Node} label
     */
    setLabel:function (label) {
        if (label) {
            this.addChild(label);
            label.setAnchorPoint(cc.p(0, 0));
            this.setContentSize(label.getContentSize());
        }

        if (this._label) {
            this.removeChild(this._label, true);
        }

        this._label = label;
    },
    _orginalScale:0,

    /**
     * @param {Boolean} enabled
     */
    setEnabled:function (enabled) {
        if (this._isEnabled != enabled) {
            if (!enabled) {
                this._colorBackup = this._label.getColor();
                this._label.setColor(this._disabledColor);
            } else {
                this._label.setColor(this._colorBackup);
            }
        }
        this._super(enabled);
    },

    /**
     * @param {Number} opacity from 0-255
     */
    setOpacity:function (opacity) {
        this._label.setOpacity(opacity);
    },

    /**
     * @return {Number}
     */
    getOpacity:function () {
        return this._label.getOpacity();
    },

    /**
     * @param {cc.Color3B} color
     */
    setColor:function (color) {
        this._label.setColor(color);
    },

    /**
     * @return {cc.Color3B}
     */
    getColor:function () {
        return this._label.getColor();
    },

    setOpacityModifyRGB:function (value) {
    },

    isOpacityModifyRGB:function () {
    },

    /**
     * @param {cc.Node} label
     * @param {function|String} selector
     * @param {cc.Node} target
     * @return {Boolean}
     */
    initWithLabel:function (label, selector, target) {
        this.initWithCallback(selector, target);
        this._originalScale = 1.0;
        this._colorBackup = cc.white();
        this._disabledColor = cc.c3b(126, 126, 126);
        this.setLabel(label);
        return true;
    },

    /**
     * @param {String} label
     */
    setString:function (label) {
        this._label.setString(label);
        this.setContentSize(this._label.getContentSize());
    },

    /**
     * activate the menu item
     */
    activate:function () {
        if (this._isEnabled) {
            this.stopAllActions();
            this.setScale(this._originalScale);
            this._super();
        }
    },

    /**
     * menu item is selected (runs callback)
     */
    selected:function () {
        if (this._isEnabled) {
            this._super();

            var action = this.getActionByTag(cc.ZOOM_ACTION_TAG);
            if (action) {
                this.stopAction(action);
            } else {
                this._originalScale = this.getScale();
            }

            var zoomAction = cc.ScaleTo.create(0.1, this._originalScale * 1.2);
            zoomAction.setTag(cc.ZOOM_ACTION_TAG);
            this.runAction(zoomAction);
        }
    },

    /**
     * menu item goes back to unselected state
     */
    unselected:function () {
        if (this._isEnabled) {
            this._super();
            this.stopActionByTag(cc.ZOOM_ACTION_TAG);
            var zoomAction = cc.ScaleTo.create(0.1, this._originalScale);
            zoomAction.setTag(cc.ZOOM_ACTION_TAG);
            this.runAction(zoomAction);
        }
    }
});

/**
 * @param {cc.Node} label
 * @param {function|String|Null} selector
 * @param {cc.Node|Null} target
 * @return {cc.MenuItemLabel}
 */
cc.MenuItemLabel.create = function (label, selector, target) {
    var ret = new cc.MenuItemLabel();
    ret.initWithLabel(label, selector, target);
    return ret;
};

/**
 * Helper class that creates a MenuItemLabel class with a LabelAtlas
 * @class
 * @extends cc.MenuItemLabel
 */
cc.MenuItemAtlasFont = cc.MenuItemLabel.extend(/** @lends cc.MenuItemAtlasFont# */{

    /**
     * @param {String} value
     * @param {String} charMapFile
     * @param {Number} itemWidth
     * @param {Number} itemHeight
     * @param {String} startCharMap a single character
     * @param {function|String|Null} selector
     * @param {cc.Node|Null} target
     * @return {Boolean}
     */
    initWithString:function (value, charMapFile, itemWidth, itemHeight, startCharMap, selector, target) {
        cc.Assert(value != null && value.length != 0, "value length must be greater than 0");
        var label = new cc.LabelAtlas();
        label.initWithString(value, charMapFile, itemWidth, itemHeight, startCharMap);
        if (this.initWithLabel(label,  selector, target)) {
            // do something ?
        }
        return true;
    }
});

/**
 * create menu item from string with font
 * @param {String} value the text to display
 * @param {String} charMapFile the character map file
 * @param {Number} itemWidth
 * @param {Number} itemHeight
 * @param {String} startCharMap a single character
 * @param {cc.Node|Null} target
 * @param {function|String|Null} selector
 * @return {cc.MenuItemAtlasFont}
 * @example
 * // Example
 * var item = cc.MenuItemAtlasFont.create('text to display', 'font.fnt', 12, 32, ' ')
 *
 * //OR
 * var item = cc.MenuItemAtlasFont.create('text to display', 'font.fnt', 12, 32, ' ', game, game.run)
 */
cc.MenuItemAtlasFont.create = function (value, charMapFile, itemWidth, itemHeight, startCharMap, target, selector) {
    var ret = new cc.MenuItemAtlasFont();
    ret.initWithString(value, charMapFile, itemWidth, itemHeight, startCharMap, target, selector);
    return ret;
};


/**
 * Helper class that creates a CCMenuItemLabel class with a Label
 * @class
 * @extends cc.MenuItemLabel
 */
cc.MenuItemFont = cc.MenuItemLabel.extend(/** @lends cc.MenuItemFont# */{

    /**
     * @param {String} value text for the menu item
     * @param {function|String} selector
     * @param {cc.Node} target
     * @return {Boolean}
     */
    initWithString:function (value, selector, target) {
        cc.Assert(value != null && value.length != 0, "Value length must be greater than 0");

        this._fontName = cc._fontName;
        this._fontSize = cc._fontSize;

        var label = cc.LabelTTF.create(value, this._fontName, this._fontSize);
        if (this.initWithLabel(label, selector, target)) {
            // do something ?
        }
        return true;
    },

    /**
     * @param {Number} s
     */
    setFontSize:function (s) {
        this._fontSize = s;
        this._recreateLabel();
    },

    /**
     *
     * @return {Number}
     */
    fontSize:function () {
        return this._fontSize;
    },

    /**
     * @param {String} name
     */
    setFontName:function (name) {
        this._fontName = name;
        this._recreateLabel();
    },

    /**
     * @return {String}
     */
    fontName:function () {
        return this._fontName;
    },
    _recreateLabel:function () {
        var label = cc.LabelTTF.create(this._label.getString(),
            this._fontName, this._fontSize);
        this.setLabel(label);
    },
    _fontSize:0,
    _fontName:''
});

/**
 * a shared function to set the fontSize for menuitem font
 * @param {Number} fontSize
 */
cc.MenuItemFont.setFontSize = function (fontSize) {
    cc._fontSize = fontSize;
};

/**
 * a shared function to get the font size for menuitem font
 * @return {Number}
 */
cc.MenuItemFont.fontSize = function () {
    return cc._fontSize;
};

/**
 * a shared function to set the fontsize for menuitem font
 * @param name
 */
cc.MenuItemFont.setFontName = function (name) {
    if (cc._fontNameRelease) {
        cc._fontName = '';
    }
    cc._fontName = name;
    cc._fontNameRelease = true;
};

/**
 * a shared function to get the font name for menuitem font
 * @return {String}
 */
cc.MenuItemFont.fontName = function () {
    return cc._fontName
};

/**
 * create a menu item from string
 * @param {String} value the text to display
 * @param {String|function|Null} selector the callback to run, either in function name or pass in the actual function
 * @param {cc.Node|Null} target the target to run callback
 * @return {cc.MenuItemFont}
 * @example
 * // Example
 * var item = cc.MenuItemFont.create("Game start", 'start', Game)
 * //creates a menu item from string "Game start", and when clicked, it will run Game.start()
 *
 * var item = cc.MenuItemFont.create("Game start", game.start, Game)//same as above
 *
 * var item = cc.MenuItemFont.create("i do nothing")//create a text menu item that does nothing
 *
 * //you can set font size and name before or after
 * cc.MenuItemFont.setFontName('my Fancy Font');
 * cc.MenuItemFont.setFontSize(62);
 */
cc.MenuItemFont.create = function (value, selector, target) {
    var ret = new cc.MenuItemFont();
    ret.initWithString(value, selector, target);
    return ret;
};


/**
 * CCMenuItemSprite accepts CCNode<CCRGBAProtocol> objects as items.<br/>
 The images has 3 different states:<br/>
 - unselected image<br/>
 - selected image<br/>
 - disabled image<br/>
 * @class
 * @extends cc.MenuItem
 */
cc.MenuItemSprite = cc.MenuItem.extend(/** @lends cc.MenuItemSprite# */{
    /**
     * identifies that this class implements RGBAProtocol methods
     */
    RGBAProtocol:true,
    _normalImage:null,

    /**
     * @return {cc.Node}
     */
    getNormalImage:function () {
        return this._normalImage;
    },

    /**
     * @param {cc.Node} normalImage
     */
    setNormalImage:function (normalImage) {
        if (this._normalImage == normalImage) {
            return;
        }
        if (normalImage) {
            this.addChild(normalImage, 0, cc.NORMAL_TAG);
            normalImage.setAnchorPoint(cc.p(0, 0));
        }
        if (this._normalImage) {
            this.removeChild(this._normalImage, true);
        }

        this._normalImage = normalImage;
        this.setContentSize(this._normalImage.getContentSize());
        this._updateImagesVisibility();
    },
    _selectedImage:null,

    /**
     * @return {cc.Node}
     */
    getSelectedImage:function () {
        return this._selectedImage;
    },

    /**
     * @param {cc.Node} selectedImage
     */
    setSelectedImage:function (selectedImage) {
        if (this._selectedImage == selectedImage)
            return;

        if (selectedImage) {
            this.addChild(selectedImage, 0, cc.SELECTED_TAG);
            selectedImage.setAnchorPoint(cc.p(0, 0));
        }

        if (this._selectedImage) {
            this.removeChild(this._selectedImage, true);
        }

        this._selectedImage = selectedImage;
        this._updateImagesVisibility();
    },
    _disabledImage:null,

    /**
     * @return {cc.Sprite}
     */
    getDisabledImage:function () {
        return this._disabledImage;
    },

    /**
     * @param {cc.Sprite} disabledImage
     */
    setDisabledImage:function (disabledImage) {
        if (this._disabledImage == disabledImage)
            return;

        if (disabledImage) {
            this.addChild(disabledImage, 0, cc.DISABLE_TAG);
            disabledImage.setAnchorPoint(cc.p(0, 0));
        }

        if (this._disabledImage) {
            this.removeChild(this._disabledImage, true);
        }

        this._disabledImage = disabledImage;
        this._updateImagesVisibility();
    },

    /**
     * @param {cc.Sprite} normalSprite
     * @param {cc.Sprite} selectedSprite
     * @param {cc.Sprite} disabledSprite
     * @param {function|String} selector
     * @param {cc.Node} target
     * @return {Boolean}
     */
    initWithNormalSprite:function (normalSprite, selectedSprite, disabledSprite, selector, target) {
        this.initWithCallback(selector, target);
        this.setNormalImage(normalSprite);
        this.setSelectedImage(selectedSprite);
        this.setDisabledImage(disabledSprite);
        if (this._normalImage) {
            this.setContentSize(this._normalImage.getContentSize());
        }
        return true;
    },

    /**
     * @param {cc.Color3B} color
     */
    setColor:function (color) {
        this._normalImage.setColor(color);

        if (this._selectedImage) {
            this._selectedImage.setColor(color);
        }

        if (this._disabledImage) {
            this._disabledImage.setColor(color);
        }
    },

    /**
     * @return {cc.Color3B}
     */
    getColor:function () {
        return this._normalImage.getColor();
    },

    /**
     * @param {Number} opacity 0 - 255
     */
    setOpacity:function (opacity) {
        this._normalImage.setOpacity(opacity);

        if (this._selectedImage) {
            this._selectedImage.setOpacity(opacity);
        }

        if (this._disabledImage) {
            this._disabledImage.setOpacity(opacity);
        }
    },

    /**
     * @return {Number} opacity from 0 - 255
     */
    getOpacity:function () {
        return this._normalImage.getOpacity();
    },

    /**
     * menu item is selected (runs callback)
     */
    selected:function () {
        this._super();
        if (this._normalImage) {
            if (this._disabledImage) {
                this._disabledImage.setVisible(false);
            }

            if (this._selectedImage) {
                this._normalImage.setVisible(false);
                this._selectedImage.setVisible(true);
            }
            else {
                this._normalImage.setVisible(true);
            }
        }
    },

    /**
     * menu item goes back to unselected state
     */
    unselected:function () {
        this._super();

        if (this._normalImage) {
            this._normalImage.setVisible(true);

            if (this._selectedImage) {
                this._selectedImage.setVisible(false);
            }

            if (this._disabledImage) {
                this._disabledImage.setVisible(false);
            }
        }
    },

    /**
     * @param {Boolean} bEnabled
     */
    setEnabled:function (bEnabled) {
        if (this._isEnabled != bEnabled) {
            this._super(bEnabled);
            this._updateImagesVisibility();
        }
    },

    setOpacityModifyRGB:function (value) {
    },

    isOpacityModifyRGB:function () {
        return false;
    },

    _updateImagesVisibility:function () {
        if (this._isEnabled) {
            if (this._normalImage)
                this._normalImage.setVisible(true);
            if (this._selectedImage)
                this._selectedImage.setVisible(false);
            if (this._disabledImage)
                this._disabledImage.setVisible(false);
        } else {
            if (this._disabledImage) {
                if (this._normalImage)
                    this._normalImage.setVisible(false);
                if (this._selectedImage)
                    this._selectedImage.setVisible(false);
                if (this._disabledImage)
                    this._disabledImage.setVisible(true);
            } else {
                if (this._normalImage)
                    this._normalImage.setVisible(true);
                if (this._selectedImage)
                    this._selectedImage.setVisible(false);
                if (this._disabledImage)
                    this._disabledImage.setVisible(false);
            }
        }
    }
});

/**
 * create a menu item from sprite
 * @param {Image} normal normal state image
 * @param {Image|Null} selected selected state image
 * @param {Image|cc.Node|Null} three disabled state image OR target node
 * @param {String|function|cc.Node|Null} four callback function name in string or actual function, OR target Node
 * @param {String|function|Null} five callback function name in string or actual function
 * @return {cc.MenuItemSprite}
 * @example
 * // Example
 * var item = cc.MenuItemSprite.create(normalImage)//create a menu item from a sprite with no functionality
 *
 * var item = cc.MenuItemSprite.create(normalImage, selectedImage)//create a menu Item, nothing will happen when clicked
 *
 * var item = cc.MenuItemSprite.create(normalImage, SelectedImage, disabledImage)//same above, but with disabled state image
 *
 * var item = cc.MenuItemSprite.create(normalImage, SelectedImage, 'callback', targetNode)//create a menu item, when clicked runs targetNode.callback()
 *
 * var item = cc.MenuItemSprite.create(normalImage, SelectedImage, disabledImage, targetNode.callback, targetNode)
 * //same as above, but with disabled image, and passing in callback function
 */
cc.MenuItemSprite.create = function (normalSprite, selectedSprite, three, four, five) {
    var len = arguments.length;
    var normalSprite = arguments[0], selectedSprite = arguments[1], disabledImage, target, callback;
    var ret = new cc.MenuItemSprite();
    //when you send 4 arguments, five is undefined
    if (len == 5) {
        disabledImage = arguments[2], callback = arguments[3], target = arguments[4];
    } else if (len == 4 && typeof arguments[3] === "function") {
        disabledImage = arguments[2], callback = arguments[3];
    } else if (len == 4 && typeof arguments[2] === "function") {
        target = arguments[3], callback = arguments[2];
    } else if (len <= 2) {
        disabledImage = arguments[2];
    }
    ret.initWithNormalSprite(normalSprite, selectedSprite, disabledImage,  callback, target);
    return ret;
};


/**
 * cc.MenuItemImage accepts images as items.<br/>
 * The images has 3 different states:<br/>
 * - unselected image<br/>
 * - selected image<br/>
 * - disabled image<br/>
 * <br/>
 * For best results try that all images are of the same size<br/>
 * @class
 * @extends cc.MenuItemSprite
 */
cc.MenuItemImage = cc.MenuItemSprite.extend(/** @lends cc.MenuItemImage# */{
    /**
     * sets the sprite frame for the normal image
     * @param {cc.SpriteFrame} frame
     */
    setNormalSpriteFrame:function (frame) {
        this.setNormalImage(cc.Sprite.createWithSpriteFrame(frame));
    },

    /**
     * sets the sprite frame for the selected image
     * @param {cc.SpriteFrame} frame
     */
    setSelectedSpriteFrame:function (frame) {
        this.setSelectedImage(cc.Sprite.createWithSpriteFrame(frame));
    },

    /**
     * sets the sprite frame for the disabled image
     * @param {cc.SpriteFrame} frame
     */
    setDisabledSpriteFrame:function (frame) {
        this.setDisabledImage(cc.Sprite.createWithSpriteFrame(frame));
    },

    /**
     * @return {Boolean}
     */
    initWithNormalImage:function (normalImage, selectedImage, disabledImage,  selector, target) {
        var normalSprite = null;
        var selectedSprite = null;
        var disabledSprite = null;

        if (normalImage) {
            normalSprite = cc.Sprite.create(normalImage);
        }
        if (selectedImage) {
            selectedSprite = cc.Sprite.create(selectedImage);
        }
        if (disabledImage) {
            disabledSprite = cc.Sprite.create(disabledImage);
        }
        return this.initWithNormalSprite(normalSprite, selectedSprite, disabledSprite, selector, target);
    }
});

/**
 * creates a new menu item image
 * @param {String} normalImage file name for normal state
 * @param {String} selectedImage image for selected state
 * @param {String|cc.Node} three Disabled image OR target
 * @param {String|function|Null} five callback function, either name in string, or pass the whole function
 * * @param {cc.Node|String|function|Null} four cc.Node target to run callback when clicked OR the callback
 * @return {cc.MenuItemImage}
 * @example
 * // Example
 * var item = cc.MenuItemImage.create('normal.png', 'selected.png', gameScene, 'run')
 * //create a dom menu item with normal and selected state, when clicked it will run the run function from gameScene object
 *
 * var item = cc.MenuItemImage.create('normal.png', 'selected.png', 'disabled.png',  gameScene, gameScene.run)
 * //same as above, but pass in the actual function and disabled image
 */
cc.MenuItemImage.create = function (normalImage, selectedImage, three, four, five) {
    if (arguments.length == 0) {
        return cc.MenuItemImage.create(null, null, null, null, null);
    }
    if (arguments.length == 3)  {
        return cc.MenuItemImage.create(normalImage, selectedImage, null, three, null);
    }
    if (arguments.length == 4) {
        return cc.MenuItemImage.create(normalImage, selectedImage, null, three, four);
    }
    var ret = new cc.MenuItemImage();
    if (ret.initWithNormalImage(normalImage, selectedImage, three, four, five)) {
        return ret;
    }
    return null;
};


/**
 * A simple container class that "toggles" it's inner items<br/>
 * The inner items can be any MenuItem
 * @class
 * @extends cc.MenuItem
 */
cc.MenuItemToggle = cc.MenuItem.extend(/** @lends cc.MenuItemToggle# */{

    /**
     * this identifies this class implements RGBAProtocol methods
     */
    RGBAProtocol:true,
    _opacity:0,

    /**
     * @return {Number}
     */
    getOpacity:function () {
        return this._opacity;
    },

    /**
     * @param {Number} Opacity
     */
    setOpacity:function (Opacity) {
        this._opacity = Opacity;
        if (this._subItems && this._subItems.length > 0) {
            for (var it = 0; it < this._subItems.length; it++) {
                this._subItems[it].setOpacity(Opacity);
            }
        }
    },
    _color:new cc.Color3B(),

    /**
     * @return {cc.Color3B}
     */
    getColor:function () {
        return this._color;
    },

    /**
     * @param {cc.Color3B} Color
     */
    setColor:function (Color) {
        this._color = Color;
        if (this._subItems && this._subItems.length > 0) {
            for (var it = 0; it < this._subItems.length; it++) {
                this._subItems[it].setColor(Color);
            }
        }
    },
    _selectedIndex:0,

    /**
     * @return {Number}
     */
    getSelectedIndex:function () {
        return this._selectedIndex;
    },

    /**
     * @param {Number} SelectedIndex
     */
    setSelectedIndex:function (SelectedIndex) {
        if (SelectedIndex != this._selectedIndex) {
            this._selectedIndex = SelectedIndex;
            var currItem = this.getChildByTag(cc.CURRENT_ITEM);
            if (currItem) {
                currItem.removeFromParent(false);
            }

            var item = this._subItems[this._selectedIndex];
            this.addChild(item, 0, cc.CURRENT_ITEM);
            var s = item.getContentSize();
            this.setContentSize(s);
            item.setPosition(cc.p(s.width / 2, s.height / 2));
        }
    },
    _subItems:[],

    /**
     * similar to get children
     * @return {cc.MenuItem}
     */
    getSubItems:function () {
        return this._subItems;
    },

    /**
     * @param {cc.MenuItem} SubItems
     */
    setSubItems:function (SubItems) {
        this._subItems = SubItems;
    },

    /**
     * @param {cc.MenuItem} args[0...last-2] the rest in the array are cc.MenuItems
     * @param {function|String} args[last-1] the second item in the args array is the callback
     * @param {cc.Node} args[last] the first item in the args array is a target
     * @return {Boolean}
     */
    initWithItems:function (args) {
        var l =  args.length;
        // passing callback.
        if (typeof args[args.length-2] === 'function') {
            this.initWithCallback( args[args.length-2], args[args.length-1] );
            l = l-2;
        } else if(typeof args[args.length-1] === 'function'){
            this.initWithCallback( args[args.length-1], null );
            l = l-1;
        } else {
            this.initWithCallback(null, null);
        }

        this._subItems = [];
        for (var i = 0; i < l; i++) {
            if (args[i]) {
                this._subItems.push(args[i]);
            }
        }
        this._selectedIndex = cc.UINT_MAX;
        this.setSelectedIndex(0);
        return true;
    },

    /**
     * @param {cc.MenuItem} item
     */
    addSubItem:function (item) {
        this._subItems.push(item);
    },

    /**
     * activate the menu item
     */
    activate:function () {
        // update index
        if (this._isEnabled) {
            var newIndex = (this._selectedIndex + 1) % this._subItems.length;
            this.setSelectedIndex(newIndex);
        }
        this._super();
    },

    /**
     * menu item is selected (runs callback)
     */
    selected:function () {
        this._super();
        this._subItems[this._selectedIndex].selected();
    },

    /**
     * menu item goes back to unselected state
     */
    unselected:function () {
        this._super();
        this._subItems[this._selectedIndex].unselected();
    },

    /**
     * @param {Boolean} enabled
     */
    setEnabled:function (enabled) {
        if (this._isEnabled == enabled) {
            this._super(enabled);

            if (this._subItems && this._subItems.length > 0) {
                for (var it = 0; it < this._subItems.length; it++) {
                    this._subItems[it].setEnabled(enabled);
                }
            }
        }
    },

    /**
     * returns the selected item
     * @return {cc.MenuItem}
     */
    selectedItem:function () {
        return this._subItems[this._selectedIndex];
    },

    setOpacityModifyRGB:function (value) {
    },

    isOpacityModifyRGB:function () {
        return false;
    },
    onEnter:function () {
        this._super();
        this.setSelectedIndex(this._selectedIndex);
    }
});

/**
 * create a simple container class that "toggles" it's inner items<br/>
 * The inner items can be any MenuItem
 * @return {cc.MenuItemToggle}
 * @example
 * // Example
 *
 * //create a toggle item with 2 menu items (which you can then toggle between them later)
 * var toggler = cc.MenuItemToggle.create(this, this.callback, cc.MenuItemFont.create("On"), cc.MenuItemFont.create("Off"))
 * //Note: the first param is the target, the second is the callback function, afterwards, you can pass in any number of menuitems
 *
 * //if you pass only 1 variable, then it must be a cc.MenuItem
 * var notYetToggler = cc.MenuItemToggle.create(cc.MenuItemFont.create("On"));//it is useless right now, until you add more stuff to it
 * notYetToggler.addSubItem(cc.MenuItemFont.create("Off"));
 * //this is useful for constructing a toggler without a callback function (you wish to control the behavior from somewhere else)
 */
cc.MenuItemToggle.create = function (/*Multiple arguments follow*/) {
    var ret = new cc.MenuItemToggle();
    ret.initWithItems(arguments);
    return ret;
};
