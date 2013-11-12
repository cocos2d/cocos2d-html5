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

cc._globalFontSize = cc.ITEM_SIZE;
cc._globalFontName = "Arial";
cc._globalFontNameRelease = false;

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
 * @extends cc.NodeRGBA
 */
cc.MenuItem = cc.NodeRGBA.extend(/** @lends cc.MenuItem# */{
    _target:null,
    _callback:null,
    _isSelected:false,
    _isEnabled:false,

    ctor:function(){
        cc.NodeRGBA.prototype.ctor.call(this);
        this._target = null;
        this._callback = null;
        this._isSelected = false;
        this._isEnabled = false;
    },

    /**
     * MenuItem is selected
     * @return {Boolean}
     */
    isSelected:function () {
        return this._isSelected;
    },

    setOpacityModifyRGB:function (value) {
    },

    isOpacityModifyRGB:function () {
        return false;
    },

    /**
     * set the target/selector of the menu item
     * @param {function|String} selector
     * @param {cc.Node} rec
     * @deprecated
     */
    setTarget:function (selector, rec) {
        this._target = rec;
        this._callback = selector;
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
     * @param {function|String} callback
     * @param {cc.Node} target
     * @return {Boolean}
     */
    initWithCallback:function (callback, target) {
        this.setAnchorPoint(cc.p(0.5, 0.5));
        this._target = target;
        this._callback = callback;
        this._isEnabled = true;
        this._isSelected = false;
        return true;
    },

    /**
     * return rect value of cc.MenuItem
     * @return {cc.Rect}
     */
    rect:function () {
        var locPosition = this._position, locContentSize = this._contentSize, locAnchorPoint = this._anchorPoint;
        return cc.rect(locPosition.x - locContentSize.width * locAnchorPoint.x,
            locPosition.y - locContentSize.height * locAnchorPoint.y,
            locContentSize.width, locContentSize.height);
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
     * set the callback to the menu item
     * @param {function|String} callback
     * @param {cc.Node} target
     */
    setCallback:function (callback, target) {
        this._target = target;
        this._callback = callback;
    },

    /**
     * call the selector with target
     */
    activate:function () {
        if (this._isEnabled) {
            var locTarget = this._target, locCallback = this._callback;
            if(!locCallback)
                return ;
            if (locTarget && (typeof(locCallback) == "string")) {
                locTarget[locCallback](this);
            } else if (locTarget && (typeof(locCallback) == "function")) {
                locCallback.call(locTarget, this);
            } else
                locCallback(this);
        }
    }
});

/**
 * creates an empty menu item with target and callback<br/>
 * Not recommended to use the base class, should use more defined menu item classes
 * @param {function|String} callback callback
 * @param {cc.Node} target
 * @return {cc.MenuItem}
 */
cc.MenuItem.create = function (callback, target) {
    var ret = new cc.MenuItem();
    ret.initWithCallback(callback,target);
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
    _disabledColor: null,
    _label: null,
    _orginalScale: 0,
    _colorBackup: null,

    ctor: function () {
        cc.MenuItem.prototype.ctor.call(this);
        this._disabledColor = null;
        this._label = null;
        this._orginalScale = 0;
        this._colorBackup = null;
    },

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

    /**
     * @param {Boolean} enabled
     */
    setEnabled:function (enabled) {
        if (this._isEnabled != enabled) {
            var locLabel = this._label;
            if (!enabled) {
                this._colorBackup = locLabel.getColor();
                locLabel.setColor(this._disabledColor);
            } else {
                locLabel.setColor(this._colorBackup);
            }
        }
        cc.MenuItem.prototype.setEnabled.call(this, enabled);
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

        this.setCascadeColorEnabled(true);
        this.setCascadeOpacityEnabled(true);

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
            cc.MenuItem.prototype.activate.call(this);
        }
    },

    /**
     * menu item is selected (runs callback)
     */
    selected:function () {
        if (this._isEnabled) {
            cc.MenuItem.prototype.selected.call(this);

            var action = this.getActionByTag(cc.ZOOM_ACTION_TAG);
            if (action)
                this.stopAction(action);
             else
                this._originalScale = this.getScale();

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
            cc.MenuItem.prototype.unselected.call(this);
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
     * @param {function|String|Null} callback
     * @param {cc.Node|Null} target
     * @return {Boolean}
     */
    initWithString:function (value, charMapFile, itemWidth, itemHeight, startCharMap, callback, target) {
        if(!value || value.length == 0)
            throw "cc.MenuItemAtlasFont.initWithString(): value should be non-null and its length should be greater than 0";

        var label = new cc.LabelAtlas();
        label.initWithString(value, charMapFile, itemWidth, itemHeight, startCharMap);
        if (this.initWithLabel(label,  callback, target)) {
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
 * @param {function|String|Null} [callback=null]
 * @param {cc.Node|Null} [target=]
 * @return {cc.MenuItemAtlasFont}
 * @example
 * // Example
 * var item = cc.MenuItemAtlasFont.create('text to display', 'font.fnt', 12, 32, ' ')
 *
 * //OR
 * var item = cc.MenuItemAtlasFont.create('text to display', 'font.fnt', 12, 32, ' ',  game.run, game)
 */
cc.MenuItemAtlasFont.create = function (value, charMapFile, itemWidth, itemHeight, startCharMap, callback, target) {
    var ret = new cc.MenuItemAtlasFont();
    ret.initWithString(value, charMapFile, itemWidth, itemHeight, startCharMap, callback, target);
    return ret;
};

/**
 * Helper class that creates a CCMenuItemLabel class with a Label
 * @class
 * @extends cc.MenuItemLabel
 */
cc.MenuItemFont = cc.MenuItemLabel.extend(/** @lends cc.MenuItemFont# */{
    _fontSize:null,
    _fontName:null,

    ctor:function(){
        cc.MenuItemLabel.prototype.ctor.call(this);
        this._fontSize = 0;
        this._fontName = "";
    },

    /**
     * @param {String} value text for the menu item
     * @param {function|String} callback
     * @param {cc.Node} target
     * @return {Boolean}
     */
    initWithString:function (value, callback, target) {
        if(!value || value.length == 0)
            throw "Value should be non-null and its length should be greater than 0";

        this._fontName = cc._globalFontName;
        this._fontSize = cc._globalFontSize;

        var label = cc.LabelTTF.create(value, this._fontName, this._fontSize);
        if (this.initWithLabel(label, callback, target)) {
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
    }
});

/**
 * a shared function to set the fontSize for menuitem font
 * @param {Number} fontSize
 */
cc.MenuItemFont.setFontSize = function (fontSize) {
    cc._globalFontSize = fontSize;
};

/**
 * a shared function to get the font size for menuitem font
 * @return {Number}
 */
cc.MenuItemFont.fontSize = function () {
    return cc._globalFontSize;
};

/**
 * a shared function to set the fontsize for menuitem font
 * @param name
 */
cc.MenuItemFont.setFontName = function (name) {
    if (cc._globalFontNameRelease) {
        cc._globalFontName = '';
    }
    cc._globalFontName = name;
    cc._globalFontNameRelease = true;
};

/**
 * a shared function to get the font name for menuitem font
 * @return {String}
 */
cc.MenuItemFont.fontName = function () {
    return cc._globalFontName;
};

/**
 * create a menu item from string
 * @param {String} value the text to display
 * @param {String|function|Null} callback the callback to run, either in function name or pass in the actual function
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
cc.MenuItemFont.create = function (value, callback, target) {
    var ret = new cc.MenuItemFont();
    ret.initWithString(value, callback, target);
    return ret;
};


/**
 * CCMenuItemSprite accepts CCNode<CCRGBAProtocol> objects as items.<br/>
 * The images has 3 different states:<br/>
 *   - unselected image<br/>
 *   - selected image<br/>
 *   - disabled image<br/>
 * @class
 * @extends cc.MenuItem
 */
cc.MenuItemSprite = cc.MenuItem.extend(/** @lends cc.MenuItemSprite# */{
    _normalImage:null,
    _selectedImage:null,
    _disabledImage:null,

    ctor: function(){
        cc.MenuItem.prototype.ctor.call(this);
        this._normalImage = null;
        this._selectedImage = null;
        this._disabledImage = null;
    },

    /**
     * @return {cc.Sprite}
     */
    getNormalImage:function () {
        return this._normalImage;
    },

    /**
     * @param {cc.Sprite} normalImage
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
        if(normalImage.textureLoaded()){
            this.setContentSize(this._normalImage.getContentSize());
            this._updateImagesVisibility();
        } else {
            normalImage.addLoadedEventListener(function(sender){
                this.setContentSize(sender.getContentSize());
                this._updateImagesVisibility();
            }, this);
        }
    },

    /**
     * @return {cc.Sprite}
     */
    getSelectedImage:function () {
        return this._selectedImage;
    },

    /**
     * @param {cc.Sprite} selectedImage
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
        if(selectedImage.textureLoaded()){
            this._updateImagesVisibility();
        } else {
            selectedImage.addLoadedEventListener(function(sender){
                this._updateImagesVisibility();
            }, this);
        }
    },

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

        if (this._disabledImage)
            this.removeChild(this._disabledImage, true);

        this._disabledImage = disabledImage;
        if(disabledImage.textureLoaded()){
            this._updateImagesVisibility();
        } else {
            disabledImage.addLoadedEventListener(function(sender){
                this._updateImagesVisibility();
            }, this);
        }
    },

    /**
     * @param {cc.Node} normalSprite
     * @param {cc.Node} selectedSprite
     * @param {cc.Node} disabledSprite
     * @param {function|String} callback
     * @param {cc.Node} target
     * @return {Boolean}
     */
    initWithNormalSprite:function (normalSprite, selectedSprite, disabledSprite, callback, target) {
        this.initWithCallback(callback, target);
        this.setNormalImage(normalSprite);
        this.setSelectedImage(selectedSprite);
        this.setDisabledImage(disabledSprite);
        var locNormalImage = this._normalImage;
        if (locNormalImage){
            if(locNormalImage.textureLoaded()){
                this.setContentSize(locNormalImage.getContentSize());
                this.setCascadeColorEnabled(true);
                this.setCascadeOpacityEnabled(true);
            } else{
                locNormalImage.addLoadedEventListener(function(sender){
                    this.setContentSize(sender.getContentSize());
                    this.setCascadeColorEnabled(true);
                    this.setCascadeOpacityEnabled(true);
                }, this);
            }
        }


        return true;
    },

    /**
     * @param {cc.Color3B} color
     */
    setColor:function (color) {
        this._normalImage.setColor(color);

        if (this._selectedImage)
            this._selectedImage.setColor(color);

        if (this._disabledImage)
            this._disabledImage.setColor(color);
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

        if (this._selectedImage)
            this._selectedImage.setOpacity(opacity);

        if (this._disabledImage)
            this._disabledImage.setOpacity(opacity);
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
        cc.MenuItem.prototype.selected.call(this);
        if (this._normalImage) {
            if (this._disabledImage)
                this._disabledImage.setVisible(false);

            if (this._selectedImage) {
                this._normalImage.setVisible(false);
                this._selectedImage.setVisible(true);
            } else
                this._normalImage.setVisible(true);
        }
    },

    /**
     * menu item goes back to unselected state
     */
    unselected:function () {
        cc.MenuItem.prototype.unselected.call(this);
        if (this._normalImage) {
            this._normalImage.setVisible(true);

            if (this._selectedImage)
                this._selectedImage.setVisible(false);

            if (this._disabledImage)
                this._disabledImage.setVisible(false);
        }
    },

    /**
     * @param {Boolean} bEnabled
     */
    setEnabled:function (bEnabled) {
        if (this._isEnabled != bEnabled) {
            cc.MenuItem.prototype.setEnabled.call(this, bEnabled);
            this._updateImagesVisibility();
        }
    },

    _updateImagesVisibility:function () {
        var locNormalImage = this._normalImage, locSelImage = this._selectedImage, locDisImage = this._disabledImage;
        if (this._isEnabled) {
            if (locNormalImage)
                locNormalImage.setVisible(true);
            if (locSelImage)
                locSelImage.setVisible(false);
            if (locDisImage)
                locDisImage.setVisible(false);
        } else {
            if (locDisImage) {
                if (locNormalImage)
                    locNormalImage.setVisible(false);
                if (locSelImage)
                    locSelImage.setVisible(false);
                if (locDisImage)
                    locDisImage.setVisible(true);
            } else {
                if (locNormalImage)
                    locNormalImage.setVisible(true);
                if (locSelImage)
                    locSelImage.setVisible(false);
            }
        }
    }
});

/**
 * create a menu item from sprite
 * @param {Image} normalSprite normal state image
 * @param {Image|Null} selectedSprite selected state image
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
    normalSprite = arguments[0];
    selectedSprite = arguments[1];
    var disabledImage, target, callback;
    var ret = new cc.MenuItemSprite();
    //when you send 4 arguments, five is undefined
    if (len == 5) {
        disabledImage = arguments[2];
        callback = arguments[3];
        target = arguments[4];
    } else if (len == 4 && typeof arguments[3] === "function") {
        disabledImage = arguments[2];
        callback = arguments[3];
    } else if (len == 4 && typeof arguments[2] === "function") {
        target = arguments[3];
        callback = arguments[2];
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
     * @param {string|null} normalImage
     * @param {string|null} selectedImage
     * @param {string|null} disabledImage
     * @param {function|string|null} callback
     * @param {cc.Node|null} target
     * @returns {boolean}
     */
    initWithNormalImage:function (normalImage, selectedImage, disabledImage, callback, target) {
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
        return this.initWithNormalSprite(normalSprite, selectedSprite, disabledSprite, callback, target);
    }
});

/**
 * creates a new menu item image
 * @param {String} normalImage file name for normal state
 * @param {String} selectedImage image for selected state
 * @param {String|cc.Node} three Disabled image OR allback function
 * @param {String|function|Null} four callback function, either name in string or pass the whole function OR the target
 * @param {cc.Node|String|function|Null} five cc.Node target to run callback when clicked
 * @return {cc.MenuItemImage}
 * @example
 * // Example
 * //create a dom menu item with normal and selected state, when clicked it will run the run function from gameScene object
 * var item = cc.MenuItemImage.create('normal.png', 'selected.png', 'run', gameScene)
 *
 * //same as above, but pass in the actual function and disabled image
 * var item = cc.MenuItemImage.create('normal.png', 'selected.png', 'disabled.png', gameScene.run, gameScene)
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
    if (ret.initWithNormalImage(normalImage, selectedImage, three, four, five))
        return ret;
    return null;
};


/**
 * A simple container class that "toggles" it's inner items<br/>
 * The inner items can be any MenuItem
 * @class
 * @extends cc.MenuItem
 */
cc.MenuItemToggle = cc.MenuItem.extend(/** @lends cc.MenuItemToggle# */{
    _selectedIndex:0,
    _subItems:null,
    _opacity:null,
    _color:null,

    ctor: function(){
        cc.MenuItem.prototype.ctor.call(this);
        this._selectedIndex = 0;
        this._subItems = [];
        this._opacity = 0;
        this._color = cc.white();
    },

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
            if (currItem)
                currItem.removeFromParent(false);

            var item = this._subItems[this._selectedIndex];
            this.addChild(item, 0, cc.CURRENT_ITEM);
            var s = item.getContentSize();
            this.setContentSize(s);
            item.setPosition(s.width / 2, s.height / 2);
        }
    },

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
            if (args[i])
                this._subItems.push(args[i]);
        }
        this._selectedIndex = cc.UINT_MAX;
        this.setSelectedIndex(0);

        this.setCascadeColorEnabled(true);
        this.setCascadeOpacityEnabled(true);

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
        cc.MenuItem.prototype.activate.call(this);
    },

    /**
     * menu item is selected (runs callback)
     */
    selected:function () {
        cc.MenuItem.prototype.selected.call(this);
        this._subItems[this._selectedIndex].selected();
    },

    /**
     * menu item goes back to unselected state
     */
    unselected:function () {
        cc.MenuItem.prototype.unselected.call(this);
        this._subItems[this._selectedIndex].unselected();
    },

    /**
     * @param {Boolean} enabled
     */
    setEnabled:function (enabled) {
        if (this._isEnabled != enabled) {
            cc.MenuItem.prototype.setEnabled.call(this, enabled);
            var locItems = this._subItems;
            if (locItems && locItems.length > 0) {
                for (var it = 0; it < locItems.length; it++)
                    locItems[it].setEnabled(enabled);
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

    onEnter:function () {
        cc.Node.prototype.onEnter.call(this);
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
 * var toggler = cc.MenuItemToggle.create( cc.MenuItemFont.create("On"), cc.MenuItemFont.create("Off"), this.callback, this)
 * //Note: the first param is the target, the second is the callback function, afterwards, you can pass in any number of menuitems
 *
 * //if you pass only 1 variable, then it must be a cc.MenuItem
 * var notYetToggler = cc.MenuItemToggle.create(cc.MenuItemFont.create("On"));//it is useless right now, until you add more stuff to it
 * notYetToggler.addSubItem(cc.MenuItemFont.create("Off"));
 * //this is useful for constructing a toggler without a callback function (you wish to control the behavior from somewhere else)
 */
cc.MenuItemToggle.create = function (/*Multiple arguments follow*/) {
    if((arguments.length > 0) && (arguments[arguments.length-1] == null))
        cc.log("parameters should not be ending with null in Javascript");
    var ret = new cc.MenuItemToggle();
    ret.initWithItems(arguments);
    return ret;
};
