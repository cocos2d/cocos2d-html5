/****************************************************************************
 Copyright (c) 2010-2012 cocos2d-x.org
 Copyright (c) 2008-2010 Ricardo Quesada
 Copyright (c) 2011      Zynga Inc.

 http://www.cocos2d-x.org

 Created by JetBrains WebStorm.
 User: wuhao
 Date: 12-3-15

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
cc.kCCItemSize = cc._fontSize = 32;
cc._fontName = "Marker Felt";
cc._fontNameRelease = false;
cc.kCurrentItem = 0xc0c05001;
cc.kZoomActionTag = 0xc0c05002;
cc.kNormalTag = 0x1;
cc.kSelectedTag = 0x2;
cc.kDisableTag = 0x3;
/** @brief CCMenuItem base class
 *
 *  Subclass CCMenuItem (or any subclass) to create your custom CCMenuItem objects.
 */
cc.MenuItem = cc.Node.extend({
    _m_pListener:null,
    _m_pfnSelector:null,
    _m_nScriptHandler:0,
    _m_bIsSelected:false,
    getIsSelected:function () {
        return this._m_bIsSelected;
    },
    _m_bIsEnabled:false,
    getIsEnabled:function () {
        return this._m_bIsEnabled;
    },
    setIsEnabled:function (enable) {
        this._m_bIsEnabled = enable;
    },
    initWithTarget:function (rec, selector) {
        this.setAnchorPoint(cc.ccp(0.5, 0.5));
        this._m_pListener = rec;
        this._m_pfnSelector = selector;
        this._m_bIsEnabled = true;
        this._m_bIsSelected = false;
        return true;
    },
    rect:function () {
        return cc.RectMake(this._m_tPosition.x - this._m_tContentSize.width * this._m_tAnchorPoint.x,
            this._m_tPosition.y - this._m_tContentSize.height * this._m_tAnchorPoint.y,
            this._m_tContentSize.width, this._m_tContentSize.height);
    },
    selected:function () {
        this._m_bIsSelected = true;
    },
    unselected:function () {
        this._m_bIsSelected = false;
    },
    setTarget:function (rec, selector) {
        this._m_pListener = rec;
        this._m_pfnSelector = selector;
    },
    activate:function () {
        if (this._m_bIsEnabled) {
            if (this._m_pListener && (typeof(this._m_pfnSelector) == "string")) {
                this._m_pListener[this._m_pfnSelector](this._m_pLabel);
            } else if (this._m_pListener && (typeof(this._m_pfnSelector) == "function")) {
                this._m_pfnSelector.call(this._m_pListener,this._m_pLabel);
            }
        }
    }
});
cc.MenuItem.itemWithTarget = function (rec, selector) {
    var pRet = new cc.MenuItem();
    pRet.initWithTarget(rec, selector);
    return pRet;
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
    _m_tDisabledColor:new cc.Color3B(),
    getDisabledColor:function () {
        return this._m_tDisabledColor;
    },
    setDisabledColor:function (color) {
        this._m_tDisabledColor = color;
    },
    _m_pLabel:null,
    getLabel:function () {
        return this._m_pLabel;
    },
    setLabel:function (label) {
        if (label) {
            this.addChild(label);
            label.setAnchorPoint(cc.ccp(0, 0));
            this.setContentSize(label.getContentSize());
        }

        if (this._m_pLabel) {
            this.removeChild(this._m_pLabel, true);
        }

        this._m_pLabel = label;
    },
    _m_fOrginalScale:0,
    setIsEnabled:function (enabled) {
        if (this._m_bIsEnabled != enabled) {
            if (!enabled) {
                this._m_tColorBackup = this._m_pLabel.getColor();
                this._m_pLabel.setColor(this._m_tDisabledColor);
            }
            else {
                this._m_pLabel.setColor(this._m_tColorBackup);
            }
        }
        cc.MenuItem.setIsEnabled(enabled);
    },
    setOpacity:function (opacity) {
        this._m_pLabel.setOpacity(opacity);
    },
    getOpacity:function () {
    },
    setColor:function (color) {
        this._m_pLabel.setColor(color);
    },
    getColor:function () {
        return this._m_pLabel.getColor
    },
    setIsOpacityModifyRGB:function (bValue) {
    },
    getIsOpacityModifyRGB:function () {
    },
    initWithLabel:function (label, target, selector) {
        this.initWithTarget(target, selector);
        this._m_fOriginalScale = 1.0;
        this._m_tColorBackup = cc.WHITE();
        this._m_tDisabledColor = cc.ccc3(126, 126, 126);
        this.setLabel(label);
        return true;
    },
    activate:function () {
        if (this._m_bIsEnabled) {
            this.stopAllActions();
            this.setScale(this._m_fOriginalScale);
            this._super();
        }
    },
    selected:function () {
        if (this._m_bIsEnabled) {
            this._super();

            var action = this.getActionByTag(cc.kZoomActionTag);
            if (action) {
                this.stopAction(action);
            }
            else {
                this._m_fOriginalScale = this.getScale();
            }

            var zoomAction = cc.ScaleTo.actionWithDuration(0.1, this._m_fOriginalScale * 1.2);
            zoomAction.setTag(cc.kZoomActionTag);
            this.runAction(zoomAction);
        }
    },
    unselected:function () {
        if (this._m_bIsEnabled) {
            this._super();
            this.stopActionByTag(cc.kZoomActionTag);
            var zoomAction = cc.ScaleTo.actionWithDuration(0.1, this._m_fOriginalScale);
            zoomAction.setTag(cc.kZoomActionTag);
            this.runAction(zoomAction);
        }
    }
});
cc.MenuItemLabel.itemWithLabel = function (label, target, selector) {
    var pRet = new cc.MenuItemLabel();
    if (arguments.length == 3) {
        pRet.initWithLabel(label, target, selector);
    } else {
        pRet.initWithLabel(label);
    }
    return pRet;
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
    var pRet = new cc.MenuItemAtlasFont();
    pRet.initFromString(value, charMapFile, itemWidth, itemHeight, startCharMap, target, selector);
    return pRet;
};


/** @brief A CCMenuItemFont
 Helper class that creates a CCMenuItemLabel class with a Label
 */
cc.MenuItemFont = cc.MenuItemLabel.extend({
    initFromString:function (value, target, selector) {
        cc.Assert(value != null && value.length != 0, "Value length must be greater than 0");

        this._m_strFontName = cc._fontName;
        this._m_uFontSize = cc._fontSize;

        var label = cc.LabelTTF.labelWithString(value, this._m_strFontName, this._m_uFontSize);
        if (this.initWithLabel(label, target, selector)) {
            // do something ?
        }
        return true;
    },
    setFontSizeObj:function (s) {
        this._m_uFontSize = s;
        this._recreateLabel();
    },
    fontSizeObj:function () {
        return this._m_uFontSize;
    },
    setFontNameObj:function (name) {
        this._m_strFontName = name;
        this._recreateLabel();
    },
    fontNameObj:function () {
        return this._m_strFontName;
    },
    _recreateLabel:function () {
        var label = cc.LabelTTF.labelWithString(this._m_pLabel.getString(),
            this._m_strFontName, this._m_uFontSize);
        this.setLabel(label);
    },
    _m_uFontSize:0,
    _m_strFontName:''
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
    var pRet = new cc.MenuItemFont();
    pRet.initFromString(value, target, selector);
    return pRet;
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
    _m_pNormalImage:null,
    getNormalImage:function () {
        return this._m_pNormalImage;
    },
    setNormalImage:function (NormalImage) {
        if (NormalImage) {
            this.addChild(NormalImage, 0, cc.kNormalTag);
            NormalImage.setAnchorPoint(cc.ccp(0, 0));
            NormalImage.setIsVisible(true);
        }

        if (this._m_pNormalImage) {
            this.removeChild(this._m_pNormalImage, true);
        }

        this._m_pNormalImage = NormalImage;
    },
    _m_pSelectedImage:null,
    getSelectedImage:function () {
        return this._m_pSelectedImage;
    },
    setSelectedImage:function (SelectedImage) {
        if (SelectedImage) {
            this.addChild(SelectedImage, 0, cc.kSelectedTag);
            SelectedImage.setAnchorPoint(cc.ccp(0, 0));
            SelectedImage.setIsVisible(false);
        }

        if (this._m_pSelectedImage) {
            this.removeChild(this._m_pSelectedImage, true);
        }

        this._m_pSelectedImage = SelectedImage;
    },
    _m_pDisabledImage:null,
    getDisabledImage:function () {
        return this._m_pDisabledImage;
    },
    setDisabledImage:function (DisabledImage) {
        if (DisabledImage) {
            this.addChild(DisabledImage, 0, cc.kDisableTag);
            DisabledImage.setAnchorPoint(cc.ccp(0, 0));
            DisabledImage.setIsVisible(false);
        }

        if (this._m_pDisabledImage) {
            this.removeChild(this._m_pDisabledImage, true);
        }

        this._m_pDisabledImage = DisabledImage;
    },

    initFromNormalSprite:function (normalSprite, selectedSprite, disabledSprite, target, selector) {
        cc.Assert(normalSprite != null, "");
        this.initWithTarget(target, selector);
        this.setNormalImage(normalSprite);
        this.setSelectedImage(selectedSprite);
        this.setDisabledImage(disabledSprite);

        this.setContentSize(this._m_pNormalImage.getContentSize());
        return true;
    },
    setColor:function (color) {
        this._m_pNormalImage.setColor(color);

        if (this._m_pSelectedImage) {
            this._m_pSelectedImage.setColor(color);
        }

        if (this._m_pDisabledImage) {
            this._m_pDisabledImage.setColor(color);
        }
    },
    getColor:function () {
        this._m_pNormalImage.getColor();
    },
    setOpacity:function (opacity) {
        this._m_pNormalImage.setOpacity(opacity);

        if (this._m_pSelectedImage) {
            this._m_pSelectedImage.setOpacity(opacity);
        }

        if (this._m_pDisabledImage) {
            this._m_pDisabledImage.setOpacity(opacity);
        }
    },
    getOpacity:function () {
        this._m_pNormalImage.getOpacity();
    },
    selected:function () {
        this._super();
        if (this._m_pDisabledImage) {
            this._m_pDisabledImage.setIsVisible(false);
        }

        if (this._m_pSelectedImage) {
            this._m_pNormalImage.setIsVisible(false);
            this._m_pSelectedImage.setIsVisible(true);
        }
        else {
            this._m_pNormalImage.setIsVisible(true);
        }
    },
    unselected:function () {
        this._super();

        this._m_pNormalImage.setIsVisible(true);

        if (this._m_pSelectedImage) {
            this._m_pSelectedImage.setIsVisible(false);
        }

        if (this._m_pDisabledImage) {
            this._m_pDisabledImage.setIsVisible(false);
        }
    },
    setIsEnabled:function (bEnabled) {
        this._super(bEnabled);

        if (this._m_pSelectedImage) {
            this._m_pSelectedImage.setIsVisible(false);
        }

        if (bEnabled) {
            this._m_pNormalImage.setIsVisible(true);

            if (this._m_pDisabledImage) {
                this._m_pDisabledImage.setIsVisible(false);
            }
        }
        else {
            if (this._m_pDisabledImage) {
                this._m_pDisabledImage.setIsVisible(true);
                this._m_pNormalImage.setIsVisible(false);
            }
            else {
                this._m_pNormalImage.setIsVisible(true);
            }
        }
    }
});
cc.MenuItemSprite.itemFromNormalSprite = function (normalSprite, selectedSprite, three, four, five)//overloaded function
{
    var pRet = new cc.MenuItemSprite();
    //when you send 4 arguments, five is undefined
    if (five) {
        pRet.initFromNormalSprite(normalSprite, selectedSprite, three, four, five);
    }
    else if (four) {
        return cc.MenuItemSprite.itemFromNormalSprite(normalSprite, selectedSprite, null, three, four);
    }
    else {
        return cc.MenuItemSprite.itemFromNormalSprite(normalSprite, selectedSprite, three, null, null);
    }
    return pRet;
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
    pRet = new cc.MenuItemImage();
    if (arguments.length == 4) {
        return cc.MenuItemImage.itemFromNormalImage(normalImage, selectedImage, null, three, four);
    }
    if (pRet.initFromNormalImage(normalImage, selectedImage, three, four, five)) {
        return pRet;
    }
    return null;
};


/** @brief A CCMenuItemToggle
 A simple container class that "toggles" it's inner items
 The inner itmes can be any MenuItem
 */
cc.MenuItemToggle = cc.MenuItem.extend({
    RGBAProtocol:true,
    _m_cOpacity:0,
    getOpacity:function () {
        return this._m_cOpacity;
    },
    setOpacity:function (Opacity) {
        this._m_cOpacity = Opacity;
        if (this._m_pSubItems && this._m_pSubItems.length > 0) {
            for (var it = 0; it < this._m_pSubItems.length; it++) {
                this._m_pSubItems[it].setOpacity(Opacity);
            }
        }
    },
    _m_tColor:new cc.Color3B(),
    getColor:function () {
        return this._m_tColor;
    },
    setColor:function (Color) {
        this._m_tColor = Color;
        if (this._m_pSubItems && this._m_pSubItems.length > 0) {
            for (var it = 0; it < this._m_pSubItems.length; it++) {
                this._m_pSubItems[it].setColor(Color);
            }
        }
    },
    _m_uSelectedIndex:0,
    getSelectedIndex:function () {
        return this._m_uSelectedIndex;
    },
    setSelectedIndex:function (SelectedIndex) {
        if (SelectedIndex != this._m_uSelectedIndex) {
            this._m_uSelectedIndex = SelectedIndex;
            this.removeChildByTag(cc.kCurrentItem, false);
            var item = this._m_pSubItems[this._m_uSelectedIndex];
            this.addChild(item, 0, cc.kCurrentItem);
            var s = item.getContentSize();
            this.setContentSize(s);
            item.setPosition(cc.ccp(s.width / 2, s.height / 2));
        }
    },
    _m_pSubItems:[],
    getSubItems:function () {
        return this._m_pSubItems;
    },
    setSubItems:function (SubItems) {
        this._m_pSubItems = SubItems;
    },
    initWithTarget:function (args/*Multiple arguments follow*/) {
        this._super();
        this._m_pSubItems = [];
        var z = 0;
        for (var pos = 2; pos < args.length; pos++) {
            z++;
            this._m_pSubItems.push(args[pos]);
        }
        this._m_uSelectedIndex = 0xffffffff;
        this.setSelectedIndex(0);
        return true;
    },
    initWithItem:function (item) {
        cc.MenuItem.initWithTarget(null, null);
        this._m_pSubItems = [];
        this._m_pSubItems.push(item);
        this._m_uSelectedIndex = 0xffffffff;
        this.setSelectedIndex(0);
        return true;
    },
    addSubItem:function (item) {
        this._m_pSubItems.push(item);
    },
    activate:function () {
        // update index
        if (this._m_bIsEnabled) {
            var newIndex = (this._m_uSelectedIndex + 1) % this._m_pSubItems.length;
            this.setSelectedIndex(newIndex);
        }
        this._super();
    },
    selected:function () {
        this._super();
        this._m_pSubItems[this._m_uSelectedIndex].selected();
    },
    unselected:function () {
        this._super();
        this._m_pSubItems[this._m_uSelectedIndex].unselected();
    },
    setIsEnabled:function (enabled) {
        this._super(enabled);

        if (this._m_pSubItems && this._m_pSubItems.length > 0) {
            for (var it = 0; it < this._m_pSubItems.length; it++) {
                this._m_pSubItems[it].setIsEnabled(enabled);
            }
        }
    },
    selectedItem:function () {
        return this._m_pSubItems[this._m_uSelectedIndex];
    },
    setIsOpacityModifyRGB:function (bValue) {
    },
    getIsOpacityModifyRGB:function () {
    }
});
cc.MenuItemToggle.itemWithTarget = function (/*Multiple arguments follow*/) {
    var pRet = new cc.MenuItemToggle();
    pRet.initWithTarget(arguments);
    return pRet;
};
cc.MenuItemToggle.itemWithItem = function (item) {
    var pRet = new cc.MenuItemToggle();
    pRet.initWithItem(item);
    return pRet;
};