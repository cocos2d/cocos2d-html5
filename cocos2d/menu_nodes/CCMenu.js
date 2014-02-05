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
 *  - But the only accepted children are MenuItem objects</p>
 * @class
 * @extends cc.LayerRGBA
 */
cc.Menu = cc.LayerRGBA.extend(/** @lends cc.Menu# */{
    _color:null,
    _enabled:false,
    _opacity:0,
    _selectedItem:null,
    _state:-1,

    ctor:function(){
        cc.LayerRGBA.prototype.ctor.call(this);
        this._color = cc.white();
        this._enabled = false;
        this._opacity = 255;
        this._selectedItem = null;
        this._state = -1;
    },

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
        var locChildren = this._children;
        if (locChildren && locChildren.length > 0) {
            for (var i = 0; i < locChildren.length; i++)
                locChildren[i].setColor(color);
        }
    },

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
        var locChildren = this._children;
        if (locChildren && locChildren.length > 0) {
            for (var i = 0; i < locChildren.length; i++)
                locChildren[i].setOpacity(opa);
        }
    },

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

    /**
     * initializes a cc.Menu with it's items
     * @param {Array} args
     * @return {Boolean}
     */
    initWithItems:function (args) {
        var pArray = [];
        if (args) {
            for (var i = 0; i < args.length; i++) {
                if (args[i])
                    pArray.push(args[i]);
            }
        }

        return this.initWithArray(pArray);
    },

    /**
     * initializes a cc.Menu with a Array of cc.MenuItem objects
     * @param {Array} arrayOfItems
     * @return {Boolean}
     */
    initWithArray:function (arrayOfItems) {
        if (this.init()) {
            this.setTouchPriority(cc.MENU_HANDLER_PRIORITY);
            this.setTouchMode(cc.TOUCH_ONE_BY_ONE);
            this.setTouchEnabled(true);
            this._enabled = true;

            // menu in the center of the screen
            var winSize = cc.Director.getInstance().getWinSize();
            this.ignoreAnchorPointForPosition(true);
            this.setAnchorPoint(0.5, 0.5);
            this.setContentSize(winSize);
            this.setPosition(winSize.width / 2, winSize.height / 2);

            if (arrayOfItems) {
                for (var i = 0; i < arrayOfItems.length; i++)
                    this.addChild(arrayOfItems[i],i);
            }

            this._selectedItem = null;
            this._state = cc.MENU_STATE_WAITING;

            // enable cascade color and opacity on menus
            this.setCascadeColorEnabled(true);
            this.setCascadeOpacityEnabled(true);
            return true;
        }
        return false;
    },

    /**
     * @param {cc.Node} child
     * @param {Number|Null} [zOrder=]
     * @param {Number|Null} [tag=]
     */
    addChild:function (child, zOrder, tag) {
        if(!(child instanceof cc.MenuItem))
            throw "cc.Menu.addChild() : Menu only supports MenuItem objects as children";
        cc.Layer.prototype.addChild.call(this, child, zOrder, tag);
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
        var height = -padding, locChildren = this._children, len, i, locScaleY, locHeight, locChild;
        if (locChildren && locChildren.length > 0) {
            for (i = 0, len = locChildren.length; i < len; i++)
                height += locChildren[i].getContentSize().height * locChildren[i].getScaleY() + padding;

            var y = height / 2.0;

            for (i = 0, len = locChildren.length; i < len; i++) {
                locChild = locChildren[i];
                locHeight = locChild.getContentSize().height;
                locScaleY = locChild.getScaleY();
                locChild.setPosition(0, y - locHeight * locScaleY / 2);
                y -= locHeight * locScaleY + padding;
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
        var width = -padding, locChildren = this._children, i, len, locScaleX, locWidth, locChild;
        if (locChildren && locChildren.length > 0) {
            for (i = 0, len = locChildren.length; i < len; i++)
                width += locChildren[i].getContentSize().width * locChildren[i].getScaleX() + padding;

            var x = -width / 2.0;

            for (i = 0, len = locChildren.length; i < len; i++) {
                locChild = locChildren[i];
                locScaleX = locChild.getScaleX();
                locWidth =  locChildren[i].getContentSize().width;
                locChild.setPosition(x + locWidth * locScaleX / 2, 0);
                x += locWidth * locScaleX + padding;
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
        if((arguments.length > 0) && (arguments[arguments.length-1] == null))
            cc.log("parameters should not be ending with null in Javascript");

        var rows = [];
        for (var i = 0; i < arguments.length; i++) {
            rows.push(arguments[i]);
        }
        var height = -5;
        var row = 0;
        var rowHeight = 0;
        var columnsOccupied = 0;
        var rowColumns, tmp, len;
        var locChildren = this._children;
        if (locChildren && locChildren.length > 0) {
            for (i = 0, len = locChildren.length; i < len; i++) {
                if(row >= rows.length)
                    continue;

                rowColumns = rows[row];
                // can not have zero columns on a row
                if(!rowColumns)
                    continue;

                tmp = locChildren[i].getContentSize().height;
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
        //cc.Assert(!columnsOccupied, "");    //?
        var winSize = cc.Director.getInstance().getWinSize();

        row = 0;
        rowHeight = 0;
        rowColumns = 0;
        var w = 0.0;
        var x = 0.0;
        var y = (height / 2);

        if (locChildren && locChildren.length > 0) {
            for (i = 0, len = locChildren.length; i < len; i++) {
                var child = locChildren[i];
                if (rowColumns == 0) {
                    rowColumns = rows[row];
                    w = winSize.width / (1 + rowColumns);
                    x = w;
                }

                tmp = child.getContentSize().height;
                rowHeight = ((rowHeight >= tmp || isNaN(tmp)) ? rowHeight : tmp);
                child.setPosition(x - winSize.width / 2, y - tmp / 2);

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
        if((arguments.length > 0) && (arguments[arguments.length-1] == null))
            cc.log("parameters should not be ending with null in Javascript");
        var columns = [], i;
        for (i = 0; i < arguments.length; i++) {
            columns.push(arguments[i]);
        }
        var columnWidths = [];
        var columnHeights = [];

        var width = -10;
        var columnHeight = -5;
        var column = 0;
        var columnWidth = 0;
        var rowsOccupied = 0;
        var columnRows, child, len, tmp, locContentSize;

        var locChildren = this._children;
        if (locChildren && locChildren.length > 0) {
            for (i = 0, len = locChildren.length; i < len; i++) {
                child = locChildren[i];
                // check if too many menu items for the amount of rows/columns
                if(column >= columns.length)
                    continue;

                columnRows = columns[column];
                // can't have zero rows on a column
                if(!columnRows)
                    continue;

                // columnWidth = fmaxf(columnWidth, [item contentSize].width);
                locContentSize = child.getContentSize();
                tmp = locContentSize.width;
                columnWidth = ((columnWidth >= tmp || isNaN(tmp)) ? columnWidth : tmp);

                columnHeight += (locContentSize.height + 5);
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
        //cc.Assert(!rowsOccupied, "");
        var winSize = cc.Director.getInstance().getWinSize();

        column = 0;
        columnWidth = 0;
        columnRows = 0;
        var x = -width / 2;
        var y = 0.0;

        if (locChildren && locChildren.length > 0) {
            for (i = 0, len = locChildren.length; i < len; i++) {
                child = locChildren[i];
                if (columnRows == 0) {
                    columnRows = columns[column];
                    y = columnHeights[column];
                }

                // columnWidth = fmaxf(columnWidth, [item contentSize].width);
                locContentSize = child.getContentSize();
                tmp = locContentSize.width;
                columnWidth = ((columnWidth >= tmp || isNaN(tmp)) ? columnWidth : tmp);

                child.setPosition(x + columnWidths[column] / 2, y - winSize.height / 2);

                y -= locContentSize.height + 10;
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
        cc.registerTargetedDelegate(this.getTouchPriority(), true, this);
    },

    /**
     * @param {cc.Node} child
     * @param {boolean} cleanup
     */
    removeChild:function(child, cleanup){
        if(child == null)
            return;
        if(!(child instanceof cc.MenuItem)){
            cc.log("cc.Menu.removeChild():Menu only supports MenuItem objects as children");
            return;
        }

        if (this._selectedItem == child)
            this._selectedItem = null;
        cc.Node.prototype.removeChild.call(this, child, cleanup);
    },

    /**
     * @param {cc.Touch} touch
     * @param {Object} e
     * @return {Boolean}
     */
    onTouchBegan:function (touch, e) {
        if (this._state != cc.MENU_STATE_WAITING || !this._visible || !this._enabled)
            return false;

        for (var c = this._parent; c != null; c = c.getParent()) {
            if (!c.isVisible())
                return false;
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
        if(this._state !== cc.MENU_STATE_TRACKING_TOUCH){
            cc.log("cc.Menu.onTouchEnded(): invalid state");
            return;
        }
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
        if(this._state !== cc.MENU_STATE_TRACKING_TOUCH){
            cc.log("cc.Menu.onTouchCancelled(): invalid state");
            return;
        }
        if (this._selectedItem)
            this._selectedItem.unselected();
        this._state = cc.MENU_STATE_WAITING;
    },

    /**
     * touch moved
     * @param {cc.Touch} touch
     * @param {Object} e
     */
    onTouchMoved:function (touch, e) {
        if(this._state !== cc.MENU_STATE_TRACKING_TOUCH){
            cc.log("cc.Menu.onTouchMoved(): invalid state");
            return;
        }
        var currentItem = this._itemForTouch(touch);
        if (currentItem != this._selectedItem) {
            if (this._selectedItem)
                this._selectedItem.unselected();
            this._selectedItem = currentItem;
            if (this._selectedItem)
                this._selectedItem.selected();
        }
    },

    /**
     * custom on exit
     */
    onExit:function () {
        if (this._state == cc.MENU_STATE_TRACKING_TOUCH) {
            if(this._selectedItem){
                this._selectedItem.unselected();
                this._selectedItem = null;
            }
            this._state = cc.MENU_STATE_WAITING;
        }
        cc.Layer.prototype.onExit.call(this);
    },

    setOpacityModifyRGB:function (value) {
    },

    isOpacityModifyRGB:function () {
        return false;
    },

    _itemForTouch:function (touch) {
        var touchLocation = touch.getLocation();
        var itemChildren = this._children, locItemChild;
        if (itemChildren && itemChildren.length > 0) {
            for (var i = 0; i < itemChildren.length; i++) {
                locItemChild = itemChildren[i];
                if (locItemChild.isVisible() && locItemChild.isEnabled()) {
                    var local = locItemChild.convertToNodeSpace(touchLocation);
                    var r = locItemChild.rect();
                    r.x = 0;
                    r.y = 0;
                    if (cc.rectContainsPoint(r, local))
                        return locItemChild;
                }
            }
        }
        return null;
    },

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
 * @param {...cc.MenuItem|null} menuItems
 * @return {cc.Menu}
 * @example
 * // Example
 * //there is no limit on how many menu item you can pass in
 * var myMenu = cc.Menu.create(menuitem1, menuitem2, menuitem3);
 */
cc.Menu.create = function (menuItems) {
    if((arguments.length > 0) && (arguments[arguments.length-1] == null))
        cc.log("parameters should not be ending with null in Javascript");

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
