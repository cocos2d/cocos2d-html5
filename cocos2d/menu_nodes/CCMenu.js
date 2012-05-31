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

cc.CCMENU_STATE_WAITING = 0;
cc.CCMENU_STATE_TRACKING_TOUCH = 1;
cc.CCMENU_TOUCH_PRIORITY = -128;
cc.DEFAULT_PADDING = 5;

/** @brief A CCMenu
 *
 * Features and Limitation:
 *  - You can add MenuItem objects in runtime using addChild:
 *  - But the only accecpted children are MenuItem objects
 */
cc.Menu = cc.Layer.extend({
    _color:new cc.Color3B(),
    getColor:function () {
        return this._color;
    },
    setColor:function (color) {
        this._color = color;

        if (this._children && this._children.length > 0) {
            for (var i = 0; i < this._children.length; i++) {
                this._children[i].setColor(this._color);
            }
        }
    },
    _opacity:0,
    getOpacity:function () {
        return this._opacity;
    },
    setOpacity:function (opa) {
        this._opacity = opa;
        if (this._children && this._children.length > 0) {
            for (var i = 0; i < this._children.length; i++) {
                this._children[i].setOpacity(this._opacity);
            }
        }
    },
    _selectedItem:null,
    /** initializes an empty CCMenu */
    init:function () {
        if (this._super()) {
            this.setIsTouchEnabled(true);
            var s = cc.Director.sharedDirector().getWinSize();
            this._isRelativeAnchorPoint = false;
            this.setAnchorPoint(cc.ccp(0.5, 0.5));
            this.setContentSize(s);
            var r = new cc.Rect();
            cc.Application.sharedApplication().statusBarFrame(r);
            var orientation = cc.Director.sharedDirector().getDeviceOrientation();
            if (orientation == cc.DEVICE_ORIENTATION_LANDSCAPE_LEFT || orientation == cc.DEVICE_ORIENTATION_LANDSCAPE_RIGHT) {
                s.height -= r.size.width;
            }
            else {
                s.height -= r.size.height;
            }
            this.setPosition(cc.ccp(s.width/2, s.height/2));
            this._selectedItem = null;
            this._state = cc.CCMENU_STATE_WAITING;
            return true;
        }
        return false;
    },
    /** initializes a CCMenu with it's items */
    initWithItems:function (args) {
        if (this.init()) {
            if(args.length > 0){
                for (var i = 0; i < args.length; i++) {
                    if(args[i]){
                        this.addChild(args[i], i);
                    }
                }
            }
            return true;
        }
        return false;
    },
    addChild:function (child, zOrder, tag) {
        tag = tag || child._tag;
        this._super(child, zOrder, tag);
    },
    alignItemsVertically:function () {
        this.alignItemsVerticallyWithPadding(cc.DEFAULT_PADDING);
    },
    alignItemsVerticallyWithPadding:function (padding) {
        var height = -padding;
        if (this._children && this._children.length > 0) {
            for (var i = 0; i < this._children.length; i++) {
                height += this._children[i].getContentSize().height * this._children[i].getScaleY() + padding;
            }
        }

        var y = height / 2.0;
        if (this._children && this._children.length > 0) {
            for (i = 0; i < this._children.length; i++) {
                this._children[i].setPosition(cc.ccp(0, y - this._children[i].getContentSize().height * this._children[i].getScaleY() / 2));
                y -= this._children[i].getContentSize().height * this._children[i].getScaleY() + padding;
            }
        }
    },
    alignItemsHorizontally:function () {
        this.alignItemsHorizontallyWithPadding(cc.DEFAULT_PADDING);
    },
    alignItemsHorizontallyWithPadding:function (padding) {
        var width = -padding;
        if (this._children && this._children.length > 0) {
            for (var i = 0; i < this._children.length; i++) {
                width += this._children[i].getContentSize().width * this._children[i].getScaleX() + padding;
            }
        }

        var x = -width / 2.0;
        if (this._children && this._children.length > 0) {
            for (i = 0; i < this._children.length; i++) {
                this._children[i].setPosition(cc.ccp(x +  this._children[i].getContentSize().width * this._children[i].getScaleX() / 2, 0));
                x += this._children[i].getContentSize().width * this._children[i].getScaleX() + padding;
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
        if (this._children && this._children.length > 0) {
            for (i = 0; i < this._children.length; i++) {
                cc.Assert(row < rows.length, "");

                rowColumns = rows[row];
                // can not have zero columns on a row
                cc.Assert(rowColumns, "");

                var tmp = this._children[i].getContentSize().height;
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

        if (this._children && this._children.length > 0) {
            for (i = 0; i < this._children.length; i++) {
                var child = this._children[i];
                if (rowColumns == 0) {
                    rowColumns = rows[row];
                    w = winSize.width / (1 + rowColumns);
                    x = w;
                }

                var tmp = child.getContentSize().height;
                rowHeight = ((rowHeight >= tmp || isNaN(tmp)) ? rowHeight : tmp);

                child.setPosition(cc.ccp(x - winSize.width / 2,
                    y - child.getContentSize().height / 2));

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

        if (this._children && this._children.length > 0) {
            for (var i = 0; i < this._children.length; i++) {
                var child = this._children[i];
                // check if too many menu items for the amount of rows/columns
                cc.Assert(column < columns.size(), "");

                columnRows = columns[column];
                // can't have zero rows on a column
                cc.Assert(columnRows, "");

                // columnWidth = fmaxf(columnWidth, [item contentSize].width);
                var tmp = child.getContentSize().width;
                columnWidth = ((columnWidth >= tmp || isNaN(tmp)) ? columnWidth : tmp);

                columnHeight += (child.getContentSize().height + 5);
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

        if (this._children && this._children.length > 0) {
            for (var i = 0; i < this._children.length; i++) {
                var child = this._children[i];
                if (columnRows == 0) {
                    columnRows = columns[column];
                    y = columnHeights[column];
                }

                // columnWidth = fmaxf(columnWidth, [item contentSize].width);
                var tmp = child.getContentSize().width;
                columnWidth = ((columnWidth >= tmp || isNaN(tmp)) ? columnWidth : tmp);

                child.setPosition(cc.ccp(x + columnWidths[column] / 2,
                    y - winSize.height / 2));

                y -= child.getContentSize().height + 10;
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
    registerWithTouchDispatcher:function () {
        cc.TouchDispatcher.sharedDispatcher().addTargetedDelegate(this, cc.CCMENU_TOUCH_PRIORITY, true);
    },
    ccTouchBegan:function (touch, e) {
        if (this._state != cc.CCMENU_STATE_WAITING || !this._isVisible) {
            return false;
        }

        for (var c = this._parent; c != null; c = c.getParent()) {
            if (!c.getIsVisible()) {
                return false;
            }
        }

        this._selectedItem = this._itemForTouch(touch);
        if (this._selectedItem) {
            this._state = cc.CCMENU_STATE_TRACKING_TOUCH;
            this._selectedItem.selected();
            return true;
        }
        return false;
    },
    ccTouchEnded:function (touch, e) {
        cc.Assert(this._state == cc.CCMENU_STATE_TRACKING_TOUCH, "[Menu ccTouchEnded] -- invalid state");
        if (this._selectedItem) {
            this._selectedItem.unselected();
            this._selectedItem.activate();
        }
        this._state = cc.CCMENU_STATE_WAITING;
    },
    ccTouchCancelled:function (touch, e) {
        cc.Assert(this._state == cc.CCMENU_STATE_TRACKING_TOUCH, "[Menu ccTouchCancelled] -- invalid state");
        if (this._selectedItem) {
            this._selectedItem.unselected();
        }
        this._state = cc.CCMENU_STATE_WAITING;
    },
    ccTouchMoved:function (touch, e) {
        cc.Assert(this._state == cc.CCMENU_STATE_TRACKING_TOUCH, "[Menu ccTouchMoved] -- invalid state");
        var currentItem = this._itemForTouch(touch);
        if (currentItem != this._selectedItem) {
            if (this._selectedItem) {
                this._selectedItem.unselected();
            }
            this._selectedItem = currentItem;
            if (this._selectedItem) {
                this._selectedItem.selected();
            }
        }
    },

    onExit:function () {
        if (this._state == cc.CCMENU_STATE_TRACKING_TOUCH) {
            this._selectedItem.unselected();
            this._state = cc.CCMENU_STATE_WAITING;
            this._selectedItem = null;
        }

        this._super();
    },

    setIsOpacityModifyRGB:function (value) {
    },
    getIsOpacityModifyRGB:function () {
    },
    _itemForTouch:function (touch) {
        var touchLocation = touch.locationInView(touch.view());
        //console.log("touchLocation",touchLocation)
        if (this._children && this._children.length > 0) {
            for (var i = 0; i < this._children.length; i++) {
                if (this._children[i].getIsVisible() && this._children[i].getIsEnabled()) {
                    var local = this._children[i].convertToNodeSpace(touchLocation);
                    var r = this._children[i].rect();
                    r.origin = cc.PointZero();
                    if (cc.Rect.CCRectContainsPoint(r, local)) {
                        return this._children[i];
                    }
                }
            }

        }

        return null;
    },
    _state:-1
});
/** creates an empty CCMenu */
cc.Menu.node = function () {
    return cc.Menu.menuWithItems();
};
/** creates a CCMenu with it's items */
cc.Menu.menuWithItems = function (/*Multiple Arguments*/) {
    var ret = new cc.Menu();
    ret.initWithItems(arguments);
    return ret;
};
/** creates a CCMenu with it's item, then use addChild() to add
 * other items. It is used for script, it can't init with undetermined
 * number of variables.
 */
cc.Menu.menuWithItem = function (item) {
    return cc.Menu.menuWithItems(item);
};