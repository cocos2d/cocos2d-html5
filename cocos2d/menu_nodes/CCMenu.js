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
 * @constant
 * @type Number
 */
cc.MENU_STATE_WAITING = 0;
/**
 * @constant
 * @type Number
 */
cc.MENU_STATE_TRACKING_TOUCH = 1;
/**
 * @constant
 * @type Number
 */
cc.MENU_HANDLER_PRIORITY = -128;
/**
 * @constant
 * @type Number
 */
cc.DEFAULT_PADDING = 5;

/**
 * <p> Features and Limitation:<br/>
 *  - You can add MenuItem objects in runtime using addChild:<br/>
 *  - But the only accecpted children are MenuItem objects</p>
 * @class
 * @extends cc.Layer
 */
cc.Menu = cc.Layer.extend(/** @lends cc.Menu# */{
    RGBAProtocol:true,
    _color:new cc.Color3B(),

    /**
     * @return {cc.Color3B}
     */
    getColor:function () {
        return this._color;
    },

    /**
     * @param {cc.Color3B} color
     */
    setColor:function (color) {
        this._color = color;

        if (this._children && this._children.length > 0) {
            for (var i = 0; i < this._children.length; i++) {
                this._children[i].setColor(this._color);
            }
        }
    },

    _opacity:0,

    /**
     * @return {Number}
     */
    getOpacity:function () {
        return this._opacity;
    },

    /**
     * @param {Number} opa
     */
    setOpacity:function (opa) {
        this._opacity = opa;
        if (this._children && this._children.length > 0) {
            for (var i = 0; i < this._children.length; i++) {
                this._children[i].setOpacity(this._opacity);
            }
        }
    },

    _enabled:false,

    /**
     * return whether or not the menu will receive events
     * @return {Boolean}
     */
    isEnabled:function () {
        return this._enabled;
    },

    /**
     * set whether or not the menu will receive events
     * @param {Boolean} enabled
     */
    setEnabled:function (enabled) {
        this._enabled = enabled;
    },

    _selectedItem:null,

    /**
     * initializes a cc.Menu with it's items
     * @param {Array} args
     * @return {Boolean}
     */
    initWithItems:function (args) {
        var pArray = [];
        if (args) {
            for (var i = 0; i < args.length; i++) {
                if (args[i]) {
                    pArray.push(args[i]);
                }
            }
        }

        return this.initWithArray(pArray);
    },

    /**
     * initializes a cc.Menu with a Array of cc.MenuItem objects
     */
    initWithArray:function (arrayOfItems) {
        if(this.init()){
            this.setTouchEnabled(true);
            this._enabled = true;

            // menu in the center of the screen
            var winSize = cc.Director.getInstance().getWinSize();
            this.ignoreAnchorPointForPosition(true);
            this.setAnchorPoint(cc.p(0.5, 0.5));
            this.setContentSize(winSize);

            this.setPosition(cc.p(winSize.width / 2, winSize.height / 2));

            if(arrayOfItems){
                for(var i = 0; i< arrayOfItems.length; i++){
                    this.addChild(arrayOfItems[i],i);
                }
            }

            this._selectedItem = null;
            this._state = cc.MENU_STATE_WAITING;
            return true;
        }
        return false;
    },

    /**
     * @param {cc.Node} child
     * @param {Number|Null} zOrder
     * @param {Number|Null} tag
     */
    addChild:function (child, zOrder, tag) {
        cc.Assert((child instanceof cc.MenuItem), "Menu only supports MenuItem objects as children");
        this._super(child, zOrder, tag);
    },

    /**
     * align items vertically with default padding
     */
    alignItemsVertically:function () {
        this.alignItemsVerticallyWithPadding(cc.DEFAULT_PADDING);
    },

    /**
     * align items vertically with specified padding
     * @param {Number} padding
     */
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
                this._children[i].setPosition(cc.p(0, y - this._children[i].getContentSize().height * this._children[i].getScaleY() / 2));
                y -= this._children[i].getContentSize().height * this._children[i].getScaleY() + padding;
            }
        }
    },

    /**
     * align items horizontally with default padding
     */
    alignItemsHorizontally:function () {
        this.alignItemsHorizontallyWithPadding(cc.DEFAULT_PADDING);
    },

    /**
     * align items horizontally with specified padding
     * @param {Number} padding
     */
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
                this._children[i].setPosition(cc.p(x + this._children[i].getContentSize().width * this._children[i].getScaleX() / 2, 0));
                x += this._children[i].getContentSize().width * this._children[i].getScaleX() + padding;
            }
        }
    },

    /**
     * align items in columns
     * @example
     * // Example
     * menu.alignItemsInColumns(3,2,3)// this will create 3 columns, with 3 items for first column, 2 items for second and 3 for third
     *
     * menu.alignItemsInColumns(3,3)//this creates 2 columns, each have 3 items
     */
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
        var winSize = cc.Director.getInstance().getWinSize();

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

                child.setPosition(cc.p(x - winSize.width / 2,
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
    /**
     * align menu items in rows
     * @example
     * // Example
     * menu.alignItemsInRows(5,3)//this will align items to 2 rows, first row with 5 items, second row with 3
     *
     * menu.alignItemsInRows(4,4,4,4)//this creates 4 rows each have 4 items
     */
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
                cc.Assert(column < columns.length, "");

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

        var winSize = cc.Director.getInstance().getWinSize();

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

                child.setPosition(cc.p(x + columnWidths[column] / 2,
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

    /**
     * make the menu clickable
     */
    registerWithTouchDispatcher:function () {
        cc.Director.getInstance().getTouchDispatcher().addTargetedDelegate(this, cc.MENU_HANDLER_PRIORITY, true);
    },

    /**
     * @param {cc.Touch} touch
     * @return {Boolean}
     */
    onTouchBegan:function (touch, e) {
        if (this._state != cc.MENU_STATE_WAITING || !this._visible || !this._enabled) {
            return false;
        }

        for (var c = this._parent; c != null; c = c.getParent()) {
            if (!c.isVisible()) {
                return false;
            }
        }

        this._selectedItem = this._itemForTouch(touch);
        if (this._selectedItem) {
            this._state = cc.MENU_STATE_TRACKING_TOUCH;
            this._selectedItem.selected();
            return true;
        }
        return false;
    },

    /**
     * when a touch ended
     */
    onTouchEnded:function (touch, e) {
        cc.Assert(this._state == cc.MENU_STATE_TRACKING_TOUCH, "[Menu onTouchEnded] -- invalid state");
        if (this._selectedItem) {
            this._selectedItem.unselected();
            this._selectedItem.activate();
        }
        this._state = cc.MENU_STATE_WAITING;
    },

    /**
     * touch cancelled
     */
    onTouchCancelled:function (touch, e) {
        cc.Assert(this._state == cc.MENU_STATE_TRACKING_TOUCH, "[Menu onTouchCancelled] -- invalid state");
        if (this._selectedItem) {
            this._selectedItem.unselected();
        }
        this._state = cc.MENU_STATE_WAITING;
    },

    /**
     * touch moved
     * @param {cc.Touch} touch
     */
    onTouchMoved:function (touch, e) {
        cc.Assert(this._state == cc.MENU_STATE_TRACKING_TOUCH, "[Menu onTouchMoved] -- invalid state");
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

    /**
     * custom on exit
     */
    onExit:function () {
        if (this._state == cc.MENU_STATE_TRACKING_TOUCH) {
            this._selectedItem.unselected();
            this._state = cc.MENU_STATE_WAITING;
            this._selectedItem = null;
        }

        this._super();
    },

    setOpacityModifyRGB:function (value) {
    },

    isOpacityModifyRGB:function () {
        return false;
    },

    _itemForTouch:function (touch) {
        var touchLocation = touch.getLocation();

        if (this._children && this._children.length > 0) {
            for (var i = 0; i < this._children.length; i++) {
                if (this._children[i].isVisible() && this._children[i].isEnabled()) {
                    var local = this._children[i].convertToNodeSpace(touchLocation);
                    var r = this._children[i].rect();
                    r.origin = cc.p(0,0);
                    if (cc.Rect.CCRectContainsPoint(r, local)) {
                        return this._children[i];
                    }
                }
            }
        }

        return null;
    },
    _state:-1,

    /**
     * set event handler priority. By default it is: kCCMenuTouchPriority
     * @param {Number} newPriority
     */
    setHandlerPriority:function (newPriority) {
        cc.Director.getInstance().getTouchDispatcher().setPriority(newPriority, this);
    }
});

/**
 * create a new menu
 * @return {cc.Menu}
 * @example
 * // Example
 * //there is no limit on how many menu item you can pass in
 * var myMenu = cc.Menu.create(menuitem1, menuitem2, menuitem3);
 */
cc.Menu.create = function (/*Multiple Arguments*/) {
    var ret = new cc.Menu();

    if (arguments.length == 0) {
        ret.initWithItems(null, null);
    } else if (arguments.length == 1) {
        if (arguments[0] instanceof Array) {
            ret.initWithArray(arguments[0]);
            return ret;
        }
    }
    ret.initWithItems(arguments);
    return ret;
};
