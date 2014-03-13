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
 *
 * @property {Boolean}  enabled     - Indicate whether item is enabled
 */
cc.MenuItem = cc.NodeRGBA.extend(/** @lends cc.MenuItem# */{
	_enabled:false,
    _target:null,
    _callback:null,
    _isSelected:false,
    _className:"MenuItem",

	/**
	 * Constructor
	 * @constructor
	 * @param {function|String} callback
	 * @param {cc.Node} target
	 */
    ctor:function(callback, target){
	    var nodeP = cc.NodeRGBA.prototype;
        nodeP.ctor.call(this);
        this._target = null;
        this._callback = null;
        this._isSelected = false;
        this._enabled = false;

	    nodeP.setAnchorPoint.call(this, 0.5, 0.5);
	    this._target = target || null;
	    this._callback = callback || null;
	    if(this._callback) {
		    this._enabled = true;
	    }
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
        return this._enabled;
    },

    /**
     * set enable value of MenuItem
     * @param {Boolean} enable
     */
    setEnabled:function (enable) {
        this._enabled = enable;
    },

    /**
     * @param {function|String} callback
     * @param {cc.Node} target
     * @return {Boolean}
     */
    initWithCallback:function (callback, target) {
        this.anchorX = 0.5;
	    this.anchorY = 0.5;
        this._target = target;
        this._callback = callback;
        this._enabled = true;
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
        if (this._enabled) {
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

window._p = cc.MenuItem.prototype;

// Extended properties
/** @expose */
_p.enabled;
cc.defineGetterSetter(_p, "enabled", _p.isEnabled, _p.setEnabled);
delete window._p;

/**
 * creates an empty menu item with target and callback<br/>
 * Not recommended to use the base class, should use more defined menu item classes
 * @param {function|String} callback callback
 * @param {cc.Node} target
 * @return {cc.MenuItem}
 */
cc.MenuItem.create = function (callback, target) {
    return new cc.MenuItem(callback,target);
};

/**
 *  Any cc.Node that supports the cc.LabelProtocol protocol can be added.<br/>
 * Supported nodes:<br/>
 * - cc.BitmapFontAtlas<br/>
 * - cc.LabelAtlas<br/>
 * - cc.LabelTTF<br/>
 * @class
 * @extends cc.MenuItem
 *
 * @property {String}   string          - Content string of label item
 * @property {cc.Node}  label           - Label of label item
 * @property {cc.Color} disabledColor   - Color of label when it's diabled
 */
cc.MenuItemLabel = cc.MenuItem.extend(/** @lends cc.MenuItemLabel# */{
    _disabledColor: null,
    _label: null,
    _orginalScale: 0,
    _colorBackup: null,

	/**
	 * @constructor
	 * @param {cc.Node} label
	 * @param {function|String} selector
	 * @param {cc.Node} target
	 */
    ctor: function (label, selector, target) {
        cc.MenuItem.prototype.ctor.call(this, selector, target);
        this._disabledColor = null;
        this._label = null;
        this._orginalScale = 0;
        this._colorBackup = null;

	    if (label) {
		    this._originalScale = 1.0;
		    this._colorBackup = cc.color.WHITE;
		    this._disabledColor = cc.color(126, 126, 126);
		    this.setLabel(label);

		    this.cascadeColor = true;
		    this.cascadeOpacity = true;
	    }
    },

    /**
     * @return {cc.Color}
     */
    getDisabledColor:function () {
        return this._disabledColor;
    },

    /**
     * @param {cc.Color} color
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
            label.anchorX = 0;
	        label.anchorY = 0;
	        this.width = label.width;
	        this.height = label.height;
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
        if (this._enabled != enabled) {
            var locLabel = this._label;
            if (!enabled) {
                this._colorBackup = locLabel.color;
                locLabel.color = this._disabledColor;
            } else {
                locLabel.color = this._colorBackup;
            }
        }
        cc.MenuItem.prototype.setEnabled.call(this, enabled);
    },

    /**
     * @param {Number} opacity from 0-255
     */
    setOpacity:function (opacity) {
        this._label.opacity = opacity;
    },

    /**
     * @return {Number}
     */
    getOpacity:function () {
        return this._label.opacity;
    },

    /**
     * @param {cc.Color} color
     */
    setColor:function (color) {
        this._label.color = color;
    },

    /**
     * @return {cc.Color}
     */
    getColor:function () {
        return this._label.color;
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
        this._colorBackup = cc.color.WHITE;
        this._disabledColor = cc.color(126, 126, 126);
        this.setLabel(label);

	    this.cascadeColor = true;
	    this.cascadeOpacity = true;

        return true;
    },

    /**
     * @param {String} label
     */
    setString:function (label) {
        this._label.string = label;
	    this.width = this._label.width;
        this.height = this._label.height;
    },

	getString: function () {
		return this._label.string;
	},

    /**
     * activate the menu item
     */
    activate:function () {
        if (this._enabled) {
            this.stopAllActions();
            this.scale = this._originalScale;
            cc.MenuItem.prototype.activate.call(this);
        }
    },

    /**
     * menu item is selected (runs callback)
     */
    selected:function () {
        if (this._enabled) {
            cc.MenuItem.prototype.selected.call(this);

            var action = this.getActionByTag(cc.ZOOM_ACTION_TAG);
            if (action)
                this.stopAction(action);
             else
                this._originalScale = this.scale;

            var zoomAction = cc.ScaleTo.create(0.1, this._originalScale * 1.2);
            zoomAction.setTag(cc.ZOOM_ACTION_TAG);
            this.runAction(zoomAction);
        }
    },

    /**
     * menu item goes back to unselected state
     */
    unselected:function () {
        if (this._enabled) {
            cc.MenuItem.prototype.unselected.call(this);
            this.stopActionByTag(cc.ZOOM_ACTION_TAG);
            var zoomAction = cc.ScaleTo.create(0.1, this._originalScale);
            zoomAction.setTag(cc.ZOOM_ACTION_TAG);
            this.runAction(zoomAction);
        }
    }
});

window._p = cc.MenuItemLabel.prototype;

// Extended properties
/** @expose */
_p.string;
cc.defineGetterSetter(_p, "string", _p.getString, _p.setString);
/** @expose */
_p.disabledColor;
cc.defineGetterSetter(_p, "disabledColor", _p.getDisabledColor, _p.setDisabledColor);
/** @expose */
_p.label;
cc.defineGetterSetter(_p, "label", _p.getLabel, _p.setLabel);

delete window._p;

/**
 * @param {cc.Node} label
 * @param {function|String|Null} [selector=]
 * @param {cc.Node|Null} [target=]
 * @return {cc.MenuItemLabel}
 */
cc.MenuItemLabel.create = function (label, selector, target) {
    return new cc.MenuItemLabel(label, selector, target);
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
	 */
	ctor: function (value, charMapFile, itemWidth, itemHeight, startCharMap, callback, target) {
		var label;
		if(value && value.length > 0) {
			label = cc.LabelAtlas.create(value, charMapFile, itemWidth, itemHeight, startCharMap);
		}

		cc.MenuItemLabel.prototype.ctor.call(this, label, callback, target);
	},

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
    return new cc.MenuItemAtlasFont(value, charMapFile, itemWidth, itemHeight, startCharMap, callback, target);
};

/**
 * Helper class that creates a CCMenuItemLabel class with a Label
 * @class
 * @extends cc.MenuItemLabel
 *
 * @property {Number}   fontSize    - Font size of font item
 * @property {String}   fontName    - Font name of font item
 */
cc.MenuItemFont = cc.MenuItemLabel.extend(/** @lends cc.MenuItemFont# */{
    _fontSize:null,
    _fontName:null,

	/**
	 * @constructor
	 * @param {String} value text for the menu item
	 * @param {function|String} callback
	 * @param {cc.Node} target
	 */
    ctor:function(value, callback, target){
	    var label;
	    if(value && value.length > 0) {
		    this._fontName = cc._globalFontName;
		    this._fontSize = cc._globalFontSize;
		    label = cc.LabelTTF.create(value, this._fontName, this._fontSize);
	    }
	    else {
		    this._fontSize = 0;
		    this._fontName = "";
	    }

        cc.MenuItemLabel.prototype.ctor.call(this, label, callback, target);
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
    getFontSize:function () {
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
    getFontName:function () {
        return this._fontName;
    },

    _recreateLabel:function () {
        var label = cc.LabelTTF.create(this._label.string, this._fontName, this._fontSize);
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

window._p = cc.MenuItemFont.prototype;

// Extended properties
/** @expose */
_p.fontSize;
cc.defineGetterSetter(_p, "fontSize", _p.getFontSize, _p.setFontSize);
/** @expose */
_p.fontName;
cc.defineGetterSetter(_p, "fontName", _p.getFontName, _p.setFontName);

delete window._p;

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
    return new cc.MenuItemFont(value, callback, target);
};


/**
 * CCMenuItemSprite accepts CCNode<CCRGBAProtocol> objects as items.<br/>
 * The images has 3 different states:<br/>
 *   - unselected image<br/>
 *   - selected image<br/>
 *   - disabled image<br/>
 * @class
 * @extends cc.MenuItem
 *
 * @property {cc.Sprite}    normalImage     - Sprite in normal state
 * @property {cc.Sprite}    selectedImage     - Sprite in selected state
 * @property {cc.Sprite}    disabledImage     - Sprite in disabled state
 */
cc.MenuItemSprite = cc.MenuItem.extend(/** @lends cc.MenuItemSprite# */{
    _normalImage:null,
    _selectedImage:null,
    _disabledImage:null,

	/**
	 * @constructor
	 * @param {Image|Null} normalSprite normal state image
	 * @param {Image|Null} selectedSprite selected state image
	 * @param {Image|cc.Node|Null} three disabled state image OR target node
	 * @param {String|function|cc.Node|Null} four callback function name in string or actual function, OR target Node
	 * @param {String|function|Null} five callback function name in string or actual function
	 *
	 * @example
	 * // Example
	 * var item = new cc.MenuItemSprite(normalImage)//create a menu item from a sprite with no functionality
	 * var item = new cc.MenuItemSprite(normalImage, selectedImage)//create a menu Item, nothing will happen when clicked
	 * var item = new cc.MenuItemSprite(normalImage, SelectedImage, disabledImage)//same above, but with disabled state image
	 * var item = new cc.MenuItemSprite(normalImage, SelectedImage, 'callback', targetNode)//create a menu item, when clicked runs targetNode.callback()
	 * var item = new cc.MenuItemSprite(normalImage, SelectedImage, disabledImage, targetNode.callback, targetNode)
	 * //same as above, but with disabled image, and passing in callback function
	 */
    ctor: function(normalSprite, selectedSprite, three, four, five){
        cc.MenuItem.prototype.ctor.call(this);
        this._normalImage = null;
        this._selectedImage = null;
        this._disabledImage = null;

	    var argc = arguments.length;
		if (argc > 1) {
		    normalSprite = arguments[0];
		    selectedSprite = arguments[1];
		    var disabledImage, target, callback;
		    //when you send 4 arguments, five is undefined
		    if (argc == 5) {
			    disabledImage = arguments[2];
			    callback = arguments[3];
			    target = arguments[4];
		    } else if (argc == 4 && typeof arguments[3] === "function") {
			    disabledImage = arguments[2];
			    callback = arguments[3];
		    } else if (argc == 4 && typeof arguments[2] === "function") {
			    target = arguments[3];
			    callback = arguments[2];
		    } else if (argc <= 2) {
			    disabledImage = arguments[2];
		    }
		    this.initWithNormalSprite(normalSprite, selectedSprite, disabledImage,  callback, target);
		}
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
            normalImage.anchorX = 0;
	        normalImage.anchorY = 0;
        }
        if (this._normalImage) {
            this.removeChild(this._normalImage, true);
        }

        this._normalImage = normalImage;
        this.width = this._normalImage.width;
	    this.height = this._normalImage.height;
        this._updateImagesVisibility();

        if (normalImage.textureLoaded && !normalImage.textureLoaded()) {
            normalImage.addLoadedEventListener(function (sender) {
                this.width = sender.width;
	            this.height = sender.height;
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
            selectedImage.anchorX = 0;
	        selectedImage.anchorY = 0;
        }

        if (this._selectedImage) {
            this.removeChild(this._selectedImage, true);
        }

        this._selectedImage = selectedImage;
        this._updateImagesVisibility();
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
            disabledImage.anchorX = 0;
	        disabledImage.anchorY = 0;
        }

        if (this._disabledImage)
            this.removeChild(this._disabledImage, true);

        this._disabledImage = disabledImage;
        this._updateImagesVisibility();
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
        if (locNormalImage) {
	        this.width = locNormalImage.width;
	        this.height = locNormalImage.height;

            if (locNormalImage.textureLoaded && !locNormalImage.textureLoaded()) {
                locNormalImage.addLoadedEventListener(function (sender) {
                    this.width = sender.width;
	                this.height = sender.height;
	                this.cascadeColor = true;
	                this.cascadeOpacity = true;
                }, this);
            }
        }
	    this.cascadeColor = true;
	    this.cascadeOpacity = true;
        return true;
    },

    /**
     * @param {cc.Color} color
     */
    setColor:function (color) {
        this._normalImage.color = color;

        if (this._selectedImage)
            this._selectedImage.color = color;

        if (this._disabledImage)
            this._disabledImage.color = color;
    },

    /**
     * @return {cc.Color}
     */
    getColor:function () {
        return this._normalImage.color;
    },

    /**
     * @param {Number} opacity 0 - 255
     */
    setOpacity:function (opacity) {
        this._normalImage.opacity = opacity;

        if (this._selectedImage)
            this._selectedImage.opacity = opacity;

        if (this._disabledImage)
            this._disabledImage.opacity = opacity;
    },

    /**
     * @return {Number} opacity from 0 - 255
     */
    getOpacity:function () {
        return this._normalImage.opacity;
    },

    /**
     * menu item is selected (runs callback)
     */
    selected:function () {
        cc.MenuItem.prototype.selected.call(this);
        if (this._normalImage) {
            if (this._disabledImage)
                this._disabledImage.visible = false;

            if (this._selectedImage) {
                this._normalImage.visible = false;
                this._selectedImage.visible = true;
            } else
                this._normalImage.visible = true;
        }
    },

    /**
     * menu item goes back to unselected state
     */
    unselected:function () {
        cc.MenuItem.prototype.unselected.call(this);
        if (this._normalImage) {
            this._normalImage.visible = true;

            if (this._selectedImage)
                this._selectedImage.visible = false;

            if (this._disabledImage)
                this._disabledImage.visible = false;
        }
    },

    /**
     * @param {Boolean} bEnabled
     */
    setEnabled:function (bEnabled) {
        if (this._enabled != bEnabled) {
            cc.MenuItem.prototype.setEnabled.call(this, bEnabled);
            this._updateImagesVisibility();
        }
    },

    _updateImagesVisibility:function () {
        var locNormalImage = this._normalImage, locSelImage = this._selectedImage, locDisImage = this._disabledImage;
        if (this._enabled) {
            if (locNormalImage)
                locNormalImage.visible = true;
            if (locSelImage)
                locSelImage.visible = false;
            if (locDisImage)
                locDisImage.visible = false;
        } else {
            if (locDisImage) {
                if (locNormalImage)
                    locNormalImage.visible = false;
                if (locSelImage)
                    locSelImage.visible = false;
                if (locDisImage)
                    locDisImage.visible = true;
            } else {
                if (locNormalImage)
                    locNormalImage.visible = true;
                if (locSelImage)
                    locSelImage.visible = false;
            }
        }
    }
});

window._p = cc.MenuItemSprite.prototype;

// Extended properties
/** @expose */
_p.normalImage;
cc.defineGetterSetter(_p, "normalImage", _p.getNormalImage, _p.setNormalImage);
/** @expose */
_p.selectedImage;
cc.defineGetterSetter(_p, "selectedImage", _p.getSelectedImage, _p.setSelectedImage);
/** @expose */
_p.disabledImage;
cc.defineGetterSetter(_p, "disabledImage", _p.getDisabledImage, _p.setDisabledImage);
delete window._p;

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
	return new cc.MenuItemSprite(normalSprite, selectedSprite, three, four, five);
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
	 * @constructor
	 * @param {string|null} normalImage
	 * @param {string|null} selectedImage
	 * @param {string|null} disabledImage
	 * @param {function|string|null} callback
	 * @param {cc.Node|null} target
	 */
	ctor: function(normalImage, selectedImage, three, four, five) {
		var normalSprite = null,
			selectedSprite = null,
			disabledSprite = null,
			callback = null,
			target = null;

		if (normalImage === undefined) {
			cc.MenuItemSprite.prototype.ctor.call(this);
		}
		else {
			normalSprite = cc.Sprite.create(normalImage);
			selectedImage &&
			(selectedSprite = cc.Sprite.create(selectedImage));
			if (four === undefined)  {
				callback = three;
			}
			else if (five === undefined) {
				callback = three;
				target = four;
			}
			else if (five) {
				disabledSprite = cc.Sprite.create(three);
				callback = four;
				target = five;
			}
			cc.MenuItemSprite.prototype.ctor.call(this, normalSprite, selectedSprite, disabledSprite, callback, target);
		}
	},

    /**
     * sets the sprite frame for the normal image
     * @param {cc.SpriteFrame} frame
     */
    setNormalSpriteFrame:function (frame) {
        this.setNormalImage(cc.Sprite.create(frame));
    },

    /**
     * sets the sprite frame for the selected image
     * @param {cc.SpriteFrame} frame
     */
    setSelectedSpriteFrame:function (frame) {
        this.setSelectedImage(cc.Sprite.create(frame));
    },

    /**
     * sets the sprite frame for the disabled image
     * @param {cc.SpriteFrame} frame
     */
    setDisabledSpriteFrame:function (frame) {
        this.setDisabledImage(cc.Sprite.create(frame));
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
 * @param {String|cc.Node} three Disabled image OR callback function
 * @param {String|function|Null} [four] callback function, either name in string or pass the whole function OR the target
 * @param {cc.Node|String|function|Null} [five] cc.Node target to run callback when clicked
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
    return new cc.MenuItemImage(normalImage, selectedImage, three, four, five);
};


/**
 * A simple container class that "toggles" it's inner items<br/>
 * The inner items can be any MenuItem
 * @class
 * @extends cc.MenuItem
 *
 * @property {Array}    subItems        - Sub items
 * @property {Number}   selectedIndex   - Index of selected sub item
 */
cc.MenuItemToggle = cc.MenuItem.extend(/** @lends cc.MenuItemToggle# */{
	subItems:null,

    _selectedIndex:0,
    _opacity:null,
    _color:null,

	/**
	 * @constructor
	 * @example
	 * // Example
	 * //create a toggle item with 2 menu items (which you can then toggle between them later)
	 * var toggler = new cc.MenuItemToggle( cc.MenuItemFont.create("On"), cc.MenuItemFont.create("Off"), this.callback, this)
	 * //Note: the first param is the target, the second is the callback function, afterwards, you can pass in any number of menuitems
	 *
	 * //if you pass only 1 variable, then it must be a cc.MenuItem
	 * var notYetToggler = new cc.MenuItemToggle(cc.MenuItemFont.create("On"));//it is useless right now, until you add more stuff to it
	 * notYetToggler.addSubItem(cc.MenuItemFont.create("Off"));
	 * //this is useful for constructing a toggler without a callback function (you wish to control the behavior from somewhere else)
	 */
    ctor: function(/*Multiple arguments follow*/){
	    var argc =  arguments.length, callback, target;
	    // passing callback.
	    if (typeof arguments[argc-2] === 'function') {
		    callback = arguments[argc-2];
		    target = arguments[argc-1];
		    argc = argc - 2;
	    } else if(typeof arguments[argc-1] === 'function'){
		    callback = arguments[argc-1];
		    argc = argc-1;
	    }

        cc.MenuItem.prototype.ctor.call(this, callback, target);
        this._selectedIndex = 0;
        this.subItems = [];
        this._opacity = 0;
        this._color = cc.color.WHITE;

		if(argc > 0) {
		    var locSubItems = this.subItems;
		    locSubItems.length = 0;
		    for (var i = 0; i < argc; i++) {
			    if (arguments[i])
				    locSubItems.push(arguments[i]);
		    }
		    this._selectedIndex = cc.UINT_MAX;
		    this.setSelectedIndex(0);
			this.setCascadeColorEnabled(true);
			this.setCascadeOpacityEnabled(true);
		}
    },

    /**
     * @return {Number}
     */
    getOpacity:function () {
        return this._opacity;
    },

    /**
     * @param {Number} opacity
     */
    setOpacity:function (opacity) {
        this._opacity = opacity;
        if (this.subItems && this.subItems.length > 0) {
            for (var it = 0; it < this.subItems.length; it++) {
                this.subItems[it].opacity = opacity;
            }
        }
        this._color.a = opacity;
    },

    /**
     * @return {cc.Color}
     */
    getColor:function () {
        var locColor = this._color;
        return cc.color(locColor.r, locColor.g, locColor.b, locColor.a);
    },

    /**
     * @param {cc.Color} Color
     */
    setColor:function (color) {
        var locColor = this._color;
        locColor.r = color.r;
        locColor.g = color.g;
        locColor.b = color.b;

        if (this.subItems && this.subItems.length > 0) {
            for (var it = 0; it < this.subItems.length; it++) {
                this.subItems[it].setColor(color);
            }
        }

        if (color.a !== undefined && !color.a_undefined) {
            this.setOpacity(color.a);
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

            var item = this.subItems[this._selectedIndex];
            this.addChild(item, 0, cc.CURRENT_ITEM);
            var w = item.width, h = item.height;
            this.width = w;
	        this.height = h;
            item.setPosition(w / 2, h / 2);
        }
    },

    /**
     * similar to get children
     * @return {Array}
     */
    getSubItems:function () {
        return this.subItems;
    },

    /**
     * @param {cc.MenuItem} subItems
     */
    setSubItems:function (subItems) {
        this.subItems = subItems;
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

        var locSubItems = this.subItems;
        locSubItems.length = 0;
        for (var i = 0; i < l; i++) {
            if (args[i])
                locSubItems.push(args[i]);
        }
        this._selectedIndex = cc.UINT_MAX;
        this.setSelectedIndex(0);

        this.cascadeColor = true;
        this.cascadeOpacity = true;

        return true;
    },

    /**
     * @param {cc.MenuItem} item
     */
    addSubItem:function (item) {
        this.subItems.push(item);
    },

    /**
     * activate the menu item
     */
    activate:function () {
        // update index
        if (this._enabled) {
            var newIndex = (this._selectedIndex + 1) % this.subItems.length;
            this.setSelectedIndex(newIndex);
        }
        cc.MenuItem.prototype.activate.call(this);
    },

    /**
     * menu item is selected (runs callback)
     */
    selected:function () {
        cc.MenuItem.prototype.selected.call(this);
        this.subItems[this._selectedIndex].selected();
    },

    /**
     * menu item goes back to unselected state
     */
    unselected:function () {
        cc.MenuItem.prototype.unselected.call(this);
        this.subItems[this._selectedIndex].unselected();
    },

    /**
     * @param {Boolean} enabled
     */
    setEnabled:function (enabled) {
        if (this._enabled != enabled) {
            cc.MenuItem.prototype.setEnabled.call(this, enabled);
            var locItems = this.subItems;
            if (locItems && locItems.length > 0) {
                for (var it = 0; it < locItems.length; it++)
                    locItems[it].enabled = enabled;
            }
        }
    },

    /**
     * returns the selected item
     * @return {cc.MenuItem}
     */
    selectedItem:function () {
        return this.subItems[this._selectedIndex];
    },

    onEnter:function () {
        cc.Node.prototype.onEnter.call(this);
        this.setSelectedIndex(this._selectedIndex);
    }
});

window._p = cc.MenuItemToggle.prototype;

// Extended properties
/** @expose */
_p.selectedIndex;
cc.defineGetterSetter(_p, "selectedIndex", _p.getSelectedIndex, _p.setSelectedIndex);
delete window._p;

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
