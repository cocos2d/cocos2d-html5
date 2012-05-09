/****************************************************************************
 Copyright (c) 2010-2012 cocos2d-x.org
 Copyright (c) 2008-2010 Ricardo Quesada
 Copyright (c) 2011      Zynga Inc.

 http://www.cocos2d-x.org

 Created by JetBrains WebStorm.
 User: wuhao
 Date: 12-3-14

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

cc.kCCMenuStateWaiting = 0;
cc.kCCMenuStateTrackingTouch = 1;
cc.kCCMenuTouchPriority = -128;
cc.kDefaultPadding = 5;

/** @brief A CCMenu
 *
 * Features and Limitation:
 *  - You can add MenuItem objects in runtime using addChild:
 *  - But the only accecpted children are MenuItem objects
 */
cc.Menu = cc.Layer.extend({
    _m_tColor:new cc.Color3B(),
    getColor:function () {
        return this._m_tColor;
    },
    setColor:function (color) {
        this._m_tColor = color;

        if (this._m_pChildren && this._m_pChildren.length > 0) {
            for (var i = 0; i < this._m_pChildren.length; i++) {
                this._m_pChildren[i].setColor(this._m_tColor);
            }
        }
    },
    _m_cOpacity:0,
    getOpacity:function () {
        return this._m_cOpacity;
    },
    setOpacity:function (opa) {
        this._m_cOpacity = opa;
        if (this._m_pChildren && this._m_pChildren.length > 0) {
            for (var i = 0; i < this._m_pChildren.length; i++) {
                this._m_pChildren[i].setOpacity(this._m_cOpacity);
            }
        }
    },
    _m_pSelectedItem:null,
    /** initializes an empty CCMenu */
    init:function () {
        if (this._super()) {
            this._m_bIsTouchEnabled = true;
            var s = cc.Director.sharedDirector().getWinSize();
            this._m_bIsRelativeAnchorPoint = false;
            this.setAnchorPoint(cc.ccp(0.5, 0.5));
            this.setContentSize(s);
            var r = new cc.Rect();
            cc.Application.sharedApplication().statusBarFrame(r);
            var orientation = cc.Director.sharedDirector().getDeviceOrientation();
            if (orientation == cc.DeviceOrientationLandscapeLeft || orientation == cc.DeviceOrientationLandscapeRight) {
                s.height -= r.size.width;
            }
            else {
                s.height -= r.size.height;
            }
            this.setPosition(cc.ccp(s.width / 2, s.height / 2));
            this._m_pSelectedItem = null;
            this._m_eState = cc.kCCMenuStateWaiting;
            return true;
        }
    },
    /** initializes a CCMenu with it's items */
    initWithItems:function (args) {
        if (this.init) {
            var z = 0;
            for (var i = 0; i < args.length; i++) {
                if(args[i]){
                    this.addChild(args[i], z);
                }
            }
            return true;
        }
        return false;
    },
    alignItemsVertically:function () {
        this.alignItemsVerticallyWithPadding(cc.kDefaultPadding);
    },
    alignItemsVerticallyWithPadding:function (padding) {
        var height = -padding;
        if (this._m_pChildren && this._m_pChildren.length > 0) {
            for (var i = 0; i < this._m_pChildren.length; i++) {
                height += this._m_pChildren[i].height * this._m_pChildren[i].getScaleY() + padding;
            }
        }

        var y = height / 2.0;
        if (this._m_pChildren && this._m_pChildren.length > 0) {
            for (i = 0; i < this._m_pChildren.length; i++) {
                this._m_pChildren[i].setPosition(cc.ccp(0, y - this._m_pChildren[i].getContentSize().height * this._m_pChildren[i].getScaleY() / 2));
                y -= this._m_pChildren[i].getContentSize().height * this._m_pChildren[i].getScaleY() + padding;
            }
        }
    },
    alignItemsHorizontally:function () {
        this.alignItemsHorizontallyWithPadding(cc.kDefaultPadding);
    },
    alignItemsHorizontallyWithPadding:function (padding) {
        var width = -padding;
        if (this._m_pChildren && this._m_pChildren.length > 0) {
            for (var i = 0; i < this._m_pChildren.length; i++) {
                width += this._m_pChildren[i].width * this._m_pChildren[i].getScaleX() + padding;
            }
        }

        var x = -width / 2.0;
        if (this._m_pChildren && this._m_pChildren.length > 0) {
            for (i = 0; i < this._m_pChildren.length; i++) {
                this._m_pChildren[i].setPosition(cc.ccp(x, this._m_pChildren[i].getContentSize().width * this._m_pChildren[i].getScaleX() / 2, 0));
                x += this._m_pChildren[i].getContentSize().width * this._m_pChildren[i].getScaleX() + padding;
            }
        }
    },
    alignItemsInColumns:function (/*Multiple Arguments*/) {
        var rows = [];
        for (var i = 0; i < arguments.length; i++) {
            rows.push(arguments[i]);
        }
        var height = -5;
        var row = 0;
        var rowHeight = 0;
        var columnsOccupied = 0;
        var rowColumns;
        if (this._m_pChildren && this._m_pChildren.length > 0) {
            for (i = 0; i < this._m_pChildren.length; i++) {
                cc.Assert(row < rows.length, "");

                rowColumns = rows[row];
                // can not have zero columns on a row
                cc.Assert(rowColumns, "");

                var tmp = this._m_pChildren[i].getContentSize().height;
                rowHeight = ((rowHeight >= tmp || isNaN(tmp)) ? rowHeight : tmp);

                ++columnsOccupied;
                if (columnsOccupied >= rowColumns) {
                    height += rowHeight + 5;

                    columnsOccupied = 0;
                    rowHeight = 0;
                    ++row;
                }
            }
        }
        // check if too many rows/columns for available menu items
        cc.Assert(!columnsOccupied, "");
        var winSize = cc.Director.sharedDirector().getWinSize();

        row = 0;
        rowHeight = 0;
        rowColumns = 0;
        var w = 0.0;
        var x = 0.0;
        var y = (height / 2);

        if (this._m_pChildren && this._m_pChildren.length > 0) {
            for (i = 0; i < this._m_pChildren.length; i++) {
                var pChild = this._m_pChildren[i];
                if (rowColumns == 0) {
                    rowColumns = rows[row];
                    w = winSize.width / (1 + rowColumns);
                    x = w;
                }

                var tmp = pChild.getContentSize().height;
                rowHeight = ((rowHeight >= tmp || isNaN(tmp)) ? rowHeight : tmp);

                pChild.setPosition(cc.ccp(x - winSize.width / 2,
                    y - pChild.getContentSize().height / 2));

                x += w;
                ++columnsOccupied;

                if (columnsOccupied >= rowColumns) {
                    y -= rowHeight + 5;

                    columnsOccupied = 0;
                    rowColumns = 0;
                    rowHeight = 0;
                    ++row;
                }
            }
        }
    },
    alignItemsInRows:function (/*Multiple arguments*/) {
        var columns = [];
        for (var i = 0; i < arguments.length; i++) {
            columns.push(arguments[i]);
        }
        var columnWidths = [];
        var columnHeights = [];

        var width = -10;
        var columnHeight = -5;
        var column = 0;
        var columnWidth = 0;
        var rowsOccupied = 0;
        var columnRows;

        if (this._m_pChildren && this._m_pChildren.length > 0) {
            for (var i = 0; i < this._m_pChildren.length; i++) {
                var pChild = this._m_pChildren[i];
                // check if too many menu items for the amount of rows/columns
                cc.Assert(column < columns.size(), "");

                columnRows = columns[column];
                // can't have zero rows on a column
                cc.Assert(columnRows, "");

                // columnWidth = fmaxf(columnWidth, [item contentSize].width);
                var tmp = pChild.getContentSize().width;
                columnWidth = ((columnWidth >= tmp || isNaN(tmp)) ? columnWidth : tmp);

                columnHeight += (pChild.getContentSize().height + 5);
                ++rowsOccupied;

                if (rowsOccupied >= columnRows) {
                    columnWidths.push(columnWidth);
                    columnHeights.push(columnHeight);
                    width += columnWidth + 10;

                    rowsOccupied = 0;
                    columnWidth = 0;
                    columnHeight = -5;
                    ++column;
                }
            }
        }
        // check if too many rows/columns for available menu items.
        cc.Assert(!rowsOccupied, "");

        var winSize = cc.Director.sharedDirector().getWinSize();

        column = 0;
        columnWidth = 0;
        columnRows = 0;
        var x = -width / 2;
        var y = 0.0;

        if (this._m_pChildren && this._m_pChildren.length > 0) {
            for (var i = 0; i < this._m_pChildren.length; i++) {
                var pChild = this._m_pChildren[i];
                if (columnRows == 0) {
                    columnRows = columns[column];
                    y = columnHeights[column];
                }

                // columnWidth = fmaxf(columnWidth, [item contentSize].width);
                var tmp = pChild.getContentSize().width;
                columnWidth = ((columnWidth >= tmp || isNaN(tmp)) ? columnWidth : tmp);

                pChild.setPosition(cc.ccp(x + columnWidths[column] / 2,
                    y - winSize.height / 2));

                y -= pChild.getContentSize().height + 10;
                ++rowsOccupied;

                if (rowsOccupied >= columnRows) {
                    x += columnWidth + 5;
                    rowsOccupied = 0;
                    columnRows = 0;
                    columnWidth = 0;
                    ++column;
                }
            }
        }
    },
    addChild:function (child, zOrder, tag) {
        this._super(child, zOrder, tag);
    },
    registerWithTouchDispatcher:function () {
        cc.TouchDispatcher.sharedDispatcher().addTargetedDelegate(this, cc.kCCMenuTouchPriority, true);
    },
    ccTouchBegan:function (touch, e) {
        if (this._m_eState != cc.kCCMenuStateWaiting || !this._m_bIsVisible) {
            return false;
        }

        for (var c = this._m_pParent; c != null; c = c.getParent()) {
            if (!c.getIsVisible()) {
                return false;
            }
        }

        this._m_pSelectedItem = this._itemForTouch(touch);
        if (this._m_pSelectedItem) {
            this._m_eState = cc.kCCMenuStateTrackingTouch;
            this._m_pSelectedItem.selected();
            return true;
        }
        return false;
    },
    ccTouchEnded:function (touch, e) {
        cc.Assert(this._m_eState == cc.kCCMenuStateTrackingTouch, "[Menu ccTouchEnded] -- invalid state");
        if (this._m_pSelectedItem) {
            this._m_pSelectedItem.unselected();
            this._m_pSelectedItem.activate();
        }
        this._m_eState = cc.kCCMenuStateWaiting;
    },
    ccTouchCancelled:function (touch, e) {
        cc.Assert(this._m_eState == cc.kCCMenuStateTrackingTouch, "[Menu ccTouchCancelled] -- invalid state");
        if (this._m_pSelectedItem) {
            this._m_pSelectedItem.unselected();
        }
        this._m_eState = cc.kCCMenuStateWaiting;
    },
    ccTouchMoved:function (touch, e) {
        cc.Assert(this._m_eState == cc.kCCMenuStateTrackingTouch, "[Menu ccTouchMoved] -- invalid state");
        var currentItem = this._itemForTouch(touch);
        if (currentItem != this._m_pSelectedItem) {
            if (this._m_pSelectedItem) {
                this._m_pSelectedItem.unselected();
            }
            this._m_pSelectedItem = currentItem;
            if (this._m_pSelectedItem) {
                this._m_pSelectedItem.selected();
            }
        }
    },

    onExit:function () {
        if (this._m_eState == cc.kCCMenuStateTrackingTouch) {
            this._m_pSelectedItem.unselected();
            this._m_eState = cc.kCCMenuStateWaiting;
            this._m_pSelectedItem = null;
        }

        this._super();
    },

    setIsOpacityModifyRGB:function (bValue) {
    },
    getIsOpacityModifyRGB:function () {
    },
    _itemForTouch:function (touch) {
        var touchLocation = touch.locationInView(touch.view());
        touchLocation = cc.Director.sharedDirector().convertToGL(touchLocation);

        if (this._m_pChildren && this._m_pChildren.length > 0) {
            for (var i = 0; i < this._m_pChildren.length; i++) {
                if (this._m_pChildren[i].getIsVisible() && this._m_pChildren[i].getIsEnabled()) {
                    var local = this._m_pChildren[i].convertToNodeSpace(touchLocation);
                    var r = this._m_pChildren[i].rect();
                    r.origin = cc.PointZero();
                    if (cc.Rect.CCRectContainsPoint(r, local)) {
                        return this._m_pChildren[i];
                    }
                }
            }

        }

        return null;
    },
    _m_eState:-1
});
/** creates an empty CCMenu */
cc.Menu.node = function () {
    return cc.Menu.menuWithItems();
};
/** creates a CCMenu with it's items */
cc.Menu.menuWithItems = function (/*Multiple Arguments*/) {
    var pRet = new cc.Menu();
    pRet.initWithItems(arguments);
    return pRet;
};
/** creates a CCMenu with it's item, then use addChild() to add
 * other items. It is used for script, it can't init with undetermined
 * number of variables.
 */
cc.Menu.menuWithItem = function (item) {
    return cc.Menu.menuWithItems(item);
};