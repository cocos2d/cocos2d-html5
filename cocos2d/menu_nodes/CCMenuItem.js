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


var cc = cc = cc || {};
cc.CCITEM_SIZE = cc._fontSize = 32;
cc._fontName = "Marker Felt";
cc._fontNameRelease = false;
cc.CURRENT_ITEM = 0xc0c05001;
cc.ZOOM_ACTION_TAG = 0xc0c05002;
cc.NORMAL_TAG = 8801;
cc.SELECTED_TAG = 8802;
cc.DISABLE_TAG = 8803;

/** @brief CCMenuItem base class
 *
 *  Subclass CCMenuItem (or any subclass) to create your custom CCMenuItem objects.
 */
cc.MenuItem = cc.Node.extend({
    _listener:null,
    _selector:null,
    _isSelected:false,
    getIsSelected:function () {
        return this._isSelected;
    },
    _isEnabled:false,
    getIsEnabled:function () {
        return this._isEnabled;
    },
    setIsEnabled:function (enable) {
        this._isEnabled = enable;
    },
    initWithTarget:function (rec, selector) {
        this.setAnchorPoint(cc.ccp(0.5, 0.5));
        this._listener = rec;
        this._selector = selector;
        this._isEnabled = true;
        this._isSelected = false;
        return true;
    },
    rect:function () {
        return cc.RectMake(this._position.x - this._contentSize.width * this._anchorPoint.x,
            this._position.y - this._contentSize.height * this._anchorPoint.y,
            this._contentSize.width, this._contentSize.height);
    },
    selected:function () {
        this._isSelected = true;
    },
    unselected:function () {
        this._isSelected = false;
    },
    setTarget:function (rec, selector) {
        this._listener = rec;
        this._selector = selector;
    },
    activate:function () {
        if (this._isEnabled) {
            if (this._listener && (typeof(this._selector) == "string")) {
                this._listener[this._selector](this);
            } else if (this._listener && (typeof(this._selector) == "function")) {
                this._selector.call(this._listener,this);
            }
        }
    }
});
cc.MenuItem.itemWithTarget = function (rec, selector) {
    var ret = new cc.MenuItem();
    ret.initWithTarget(rec, selector);
    return ret;
};


/** @brief An abstract class for "label" CCMenuItemLabel items
 Any CCNode that supports the CCLabelProtocol protocol can be added.
 Supported nodes:
 - CCBitmapFontAtlas
 - CCLabelAtlas
 - CCLabelTTF
 */
cc.MenuItemLabel = cc.MenuItem.extend({
    RGBAProtocol:true,
    _disabledColor:new cc.Color3B(),
    getDisabledColor:function () {
        return this._disabledColor;
    },
    setDisabledColor:function (color) {
        this._disabledColor = color;
    },
    _label:null,
    getLabel:function () {
        return this._label;
    },
    setLabel:function (label) {
        if (label) {
            this.addChild(label);
            label.setAnchorPoint(cc.ccp(0, 0));
            this.setContentSize(label.getContentSize());
        }

        if (this._label) {
            this.removeChild(this._label, true);
        }

        this._label = label;
    },
    _orginalScale:0,
    setIsEnabled:function (enabled) {
        if (this._isEnabled != enabled) {
            if (!enabled) {
                this._colorBackup = this._label.getColor();
                this._label.setColor(this._disabledColor);
            }
            else {
                this._label.setColor(this._colorBackup);
            }
        }
        this._super(enabled);
    },
    setOpacity:function (opacity) {
        this._label.setOpacity(opacity);
    },
    getOpacity:function () {
    },
    setColor:function (color) {
        this._label.setColor(color);
    },
    getColor:function () {
        return this._label.getColor
    },
    setIsOpacityModifyRGB:function (value) {
    },
    getIsOpacityModifyRGB:function () {
    },
    initWithLabel:function (label, target, selector) {
        this.initWithTarget(target, selector);
        this._originalScale = 1.0;
        this._colorBackup = cc.WHITE();
        this._disabledColor = cc.ccc3(126, 126, 126);
        this.setLabel(label);
        return true;
    },
    activate:function () {
        if (this._isEnabled) {
            this.stopAllActions();
            this.setScale(this._originalScale);
            this._super();
        }
    },
    selected:function () {
        if (this._isEnabled) {
            this._super();

            var action = this.getActionByTag(cc.ZOOM_ACTION_TAG);
            if (action) {
                this.stopAction(action);
            }
            else {
                this._originalScale = this.getScale();
            }

            var zoomAction = cc.ScaleTo.actionWithDuration(0.1, this._originalScale * 1.2);
            zoomAction.setTag(cc.ZOOM_ACTION_TAG);
            this.runAction(zoomAction);
        }
    },
    unselected:function () {
        if (this._isEnabled) {
            this._super();
            this.stopActionByTag(cc.ZOOM_ACTION_TAG);
            var zoomAction = cc.ScaleTo.actionWithDuration(0.1, this._originalScale);
            zoomAction.setTag(cc.ZOOM_ACTION_TAG);
            this.runAction(zoomAction);
        }
    }
});
cc.MenuItemLabel.itemWithLabel = function (label, target, selector) {
    var ret = new cc.MenuItemLabel();
    if (arguments.length == 3) {
        ret.initWithLabel(label, target, selector);
    } else {
        ret.initWithLabel(label);
    }
    return ret;
};

/** @brief A CCMenuItemAtlasFont
 Helper class that creates a MenuItemLabel class with a LabelAtlas
 */
cc.MenuItemAtlasFont = cc.MenuItemLabel.extend({
    initFromString:function (value, charMapFile, itemWidth, itemHeight, starCharMap, target, selector) {
        cc.Assert(value != null && value.length != 0, "value length must be greater than 0");
        var label = new cc.LabelAtlas();
        label.initWithString(value, charMapFile, itemWidth, itemHeight, starCharMap);
        if (cc.MenuItemLabel.initWithLabel(label, target, selector)) {
            // do something ?
        }
        return true;
    }
});
cc.MenuItemAtlasFont.itemFromString = function (value, charMapFile, itemWidth, itemHeight, startCharMap, target, selector) {
    var ret = new cc.MenuItemAtlasFont();
    ret.initFromString(value, charMapFile, itemWidth, itemHeight, startCharMap, target, selector);
    return ret;
};


/** @brief A CCMenuItemFont
 Helper class that creates a CCMenuItemLabel class with a Label
 */
cc.MenuItemFont = cc.MenuItemLabel.extend({
    initFromString:function (value, target, selector) {
        cc.Assert(value != null && value.length != 0, "Value length must be greater than 0");

        this._fontName = cc._fontName;
        this._fontSize = cc._fontSize;

        var label = cc.LabelTTF.labelWithString(value, this._fontName, this._fontSize);
        if (this.initWithLabel(label, target, selector)) {
            // do something ?
        }
        return true;
    },
    setFontSizeObj:function (s) {
        this._fontSize = s;
        this._recreateLabel();
    },
    fontSizeObj:function () {
        return this._fontSize;
    },
    setFontNameObj:function (name) {
        this._fontName = name;
        this._recreateLabel();
    },
    fontNameObj:function () {
        return this._fontName;
    },
    _recreateLabel:function () {
        var label = cc.LabelTTF.labelWithString(this._label.getString(),
            this._fontName, this._fontSize);
        this.setLabel(label);
    },
    _fontSize:0,
    _fontName:''
});
cc.MenuItemFont.setFontSize = function (s) {
    cc._fontSize = s;
};
cc.MenuItemFont.fontSize = function () {
    return cc._fontSize;
};
cc.MenuItemFont.setFontName = function (name) {
    if (cc._fontNameRelease) {
        cc._fontName = '';
    }
    cc._fontName = name;
    cc._fontNameRelease = true;
};
cc.MenuItemFont.fontName = function () {
    return cc._fontName
};
cc.MenuItemFont.itemFromString = function (value, target, selector) {
    var ret = new cc.MenuItemFont();
    ret.initFromString(value, target, selector);
    return ret;
};


/** @brief CCMenuItemSprite accepts CCNode<CCRGBAProtocol> objects as items.
 The images has 3 different states:
 - unselected image
 - selected image
 - disabled image

 @since v0.8.0
 */
cc.MenuItemSprite = cc.MenuItem.extend({
    RGBAProtocol:true,
    _normalImage:null,
    getNormalImage:function () {
        return this._normalImage;
    },
    setNormalImage:function (NormalImage) {
        if (NormalImage) {
            this.addChild(NormalImage, 0, cc.NORMAL_TAG);
            NormalImage.setAnchorPoint(cc.ccp(0, 0));
            NormalImage.setIsVisible(true);
        }
        if (this._normalImage) {
            this.removeChild(this._normalImage, true);
        }

        this._normalImage = NormalImage;
    },
    _selectedImage:null,
    getSelectedImage:function () {
        return this._selectedImage;
    },
    setSelectedImage:function (SelectedImage) {
        if (SelectedImage) {
            this.addChild(SelectedImage, 0, cc.SELECTED_TAG);
            SelectedImage.setAnchorPoint(cc.ccp(0, 0));
            SelectedImage.setIsVisible(false);
        }

        if (this._selectedImage) {
            this.removeChild(this._selectedImage, true);
        }

        this._selectedImage = SelectedImage;
    },
    _disabledImage:null,
    getDisabledImage:function () {
        return this._disabledImage;
    },
    setDisabledImage:function (DisabledImage) {
        if (DisabledImage) {
            this.addChild(DisabledImage, 0, cc.DISABLE_TAG);
            DisabledImage.setAnchorPoint(cc.ccp(0, 0));
            DisabledImage.setIsVisible(false);
        }

        if (this._disabledImage) {
            this.removeChild(this._disabledImage, true);
        }

        this._disabledImage = DisabledImage;
    },

    initFromNormalSprite:function (normalSprite, selectedSprite, disabledSprite, target, selector) {
        cc.Assert(normalSprite != null, "");
        this.initWithTarget(target, selector);
        this.setNormalImage(normalSprite);
        this.setSelectedImage(selectedSprite);
        this.setDisabledImage(disabledSprite);

        this.setContentSize(this._normalImage.getContentSize());
        return true;
    },
    setColor:function (color) {
        this._normalImage.setColor(color);

        if (this._selectedImage) {
            this._selectedImage.setColor(color);
        }

        if (this._disabledImage) {
            this._disabledImage.setColor(color);
        }
    },
    getColor:function () {
        this._normalImage.getColor();
    },
    setOpacity:function (opacity) {
        this._normalImage.setOpacity(opacity);

        if (this._selectedImage) {
            this._selectedImage.setOpacity(opacity);
        }

        if (this._disabledImage) {
            this._disabledImage.setOpacity(opacity);
        }
    },
    getOpacity:function () {
        this._normalImage.getOpacity();
    },
    selected:function () {
        this._super();
        if (this._disabledImage) {
            this._disabledImage.setIsVisible(false);
        }

        if (this._selectedImage) {
            this._normalImage.setIsVisible(false);
            this._selectedImage.setIsVisible(true);
        }
        else {
            this._normalImage.setIsVisible(true);
        }
    },
    unselected:function () {
        this._super();

        this._normalImage.setIsVisible(true);

        if (this._selectedImage) {
            this._selectedImage.setIsVisible(false);
        }

        if (this._disabledImage) {
            this._disabledImage.setIsVisible(false);
        }
    },
    setIsEnabled:function (bEnabled) {
        this._super(bEnabled);

        if (this._selectedImage) {
            this._selectedImage.setIsVisible(false);
        }

        if (bEnabled) {
            this._normalImage.setIsVisible(true);

            if (this._disabledImage) {
                this._disabledImage.setIsVisible(false);
            }
        }
        else {
            if (this._disabledImage) {
                this._disabledImage.setIsVisible(true);
                this._normalImage.setIsVisible(false);
            }
            else {
                this._normalImage.setIsVisible(true);
            }
        }
    }
});
cc.MenuItemSprite.itemFromNormalSprite = function (normalSprite, selectedSprite, three, four, five)//overloaded function
{
    var a,b,c,e,d;
    var ret = new cc.MenuItemSprite();
    //when you send 4 arguments, five is undefined
    if (five) {
        ret.initFromNormalSprite(normalSprite, selectedSprite, three, four, five);
    }
    else if (four) {
        return cc.MenuItemSprite.itemFromNormalSprite(normalSprite, selectedSprite, null, three, four);
    }
    else {
        return cc.MenuItemSprite.itemFromNormalSprite(normalSprite, selectedSprite, three, null, null);
    }
    return ret;
};


/** @brief CCMenuItemImage accepts images as items.
 The images has 3 different states:
 - unselected image
 - selected image
 - disabled image

 For best results try that all images are of the same size
 */
cc.MenuItemImage = cc.MenuItemSprite.extend({
    initFromNormalImage:function (normalImage, selectedImage, disabledImage, target, selector) {
        var normalSprite = cc.Sprite.spriteWithFile(normalImage);
        var selectedSprite = null;
        var disabledSprite = null;

        if (selectedImage) {
            selectedSprite = cc.Sprite.spriteWithFile(selectedImage);
        }

        if (disabledImage) {
            disabledSprite = cc.Sprite.spriteWithFile(disabledImage);
        }
        return this.initFromNormalSprite(normalSprite, selectedSprite, disabledSprite, target, selector);
    }
});
cc.MenuItemImage.itemFromNormalImage = function (normalImage, selectedImage, three, four, five) {
    var ret = new cc.MenuItemImage();
    if (arguments.length == 4) {
        return cc.MenuItemImage.itemFromNormalImage(normalImage, selectedImage, null, three, four);
    }
    if (ret.initFromNormalImage(normalImage, selectedImage, three, four, five)) {
        return ret;
    }
    return null;
};


/** @brief A CCMenuItemToggle
 A simple container class that "toggles" it's inner items
 The inner itmes can be any MenuItem
 */
cc.MenuItemToggle = cc.MenuItem.extend({
    RGBAProtocol:true,
    _opacity:0,
    getOpacity:function () {
        return this._opacity;
    },
    setOpacity:function (Opacity) {
        this._opacity = Opacity;
        if (this._subItems && this._subItems.length > 0) {
            for (var it = 0; it < this._subItems.length; it++) {
                this._subItems[it].setOpacity(Opacity);
            }
        }
    },
    _color:new cc.Color3B(),
    getColor:function () {
        return this._color;
    },
    setColor:function (Color) {
        this._color = Color;
        if (this._subItems && this._subItems.length > 0) {
            for (var it = 0; it < this._subItems.length; it++) {
                this._subItems[it].setColor(Color);
            }
        }
    },
    _selectedIndex:0,
    getSelectedIndex:function () {
        return this._selectedIndex;
    },
    setSelectedIndex:function (SelectedIndex) {
        if (SelectedIndex != this._selectedIndex) {
            this._selectedIndex = SelectedIndex;
            this.removeChildByTag(cc.CURRENT_ITEM, false);
            var item = this._subItems[this._selectedIndex];
            this.addChild(item, 0, cc.CURRENT_ITEM);
            var s = item.getContentSize();
            this.setContentSize(s);
            item.setPosition(cc.ccp(s.width / 2, s.height / 2));
        }
    },
    _subItems:[],
    getSubItems:function () {
        return this._subItems;
    },
    setSubItems:function (SubItems) {
        this._subItems = SubItems;
    },
    initWithTarget:function (args) {
        var target = args[0],  selector = args[1];
        this._super(target, selector);
        if(args.length == 2){
            return;
        }
        this._subItems = [];
        for (var i = 2; i < args.length; i++) {
            if(args[i]){
                this._subItems.push(args[i]);
            }
        }
        this._selectedIndex = 0xffffffff;
        this.setSelectedIndex(0);
        return true;
    },
    initWithItem:function (item) {
        this.initWithTarget(null, null);
        this._subItems = [];
        this._subItems.push(item);
        this._selectedIndex = 0xffffffff;
        this.setSelectedIndex(0);
        return true;
    },
    addSubItem:function (item) {
        this._subItems.push(item);
    },
    activate:function () {
        // update index
        if (this._isEnabled) {
            var newIndex = (this._selectedIndex + 1) % this._subItems.length;
            this.setSelectedIndex(newIndex);
        }
        this._super();
    },
    selected:function () {
        this._super();
        this._subItems[this._selectedIndex].selected();
    },
    unselected:function () {
        this._super();
        this._subItems[this._selectedIndex].unselected();
    },
    setIsEnabled:function (enabled) {
        this._super(enabled);

        if (this._subItems && this._subItems.length > 0) {
            for (var it = 0; it < this._subItems.length; it++) {
                this._subItems[it].setIsEnabled(enabled);
            }
        }
    },
    selectedItem:function () {
        return this._subItems[this._selectedIndex];
    },
    setIsOpacityModifyRGB:function (value) {
    },
    getIsOpacityModifyRGB:function () {
    }
});
cc.MenuItemToggle.itemWithTarget = function (/*Multiple arguments follow*/) {
    var ret = new cc.MenuItemToggle();
    ret.initWithTarget(arguments);
    return ret;
};
cc.MenuItemToggle.itemWithItem = function (item) {
    var ret = new cc.MenuItemToggle();
    ret.initWithItem(item);
    return ret;
};