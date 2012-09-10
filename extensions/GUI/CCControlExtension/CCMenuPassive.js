/****************************************************************************
 Copyright (c) 2010-2012 cocos2d-x.org

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

cc.Spacer = cc.Layer.extend({});

cc.Spacer.verticalSpacer = function (space) {
    var pRet = new cc.Spacer();
    pRet.init();
    pRet.setContentSize(cc.SizeMake(0, space));
    return pRet;
};

cc.Spacer.horizontalSpacer = function (space) {
    var pRet = new cc.Spacer();
    pRet.init();
    pRet.setContentSize(cc.SizeMake(space, 0));
    return pRet;
};

cc.MenuPassive = cc.Layer.extend({
    RGBAProtocol:true,

    _color:null,
    _opacity:0,

    ctor:function () {
    },

    /** Color: conforms with CCRGBAProtocol protocol */
    getColor:function () {
        return this._color;
    },
    setColor:function (color) {
        this._color = color;

        if (this._children && this._children.length > 0) {
            for (var i = 0; i < this._children.length; i++) {
                if (this._children[i] && this._children[i].RGBAProtocol) {
                    this._children[i].setColor(color);
                }
            }
        }
    },

    /** Opacity: conforms with CCRGBAProtocol protocol */
    getOpacity:function () {
        return this._opacity;
    },

    setOpacity:function (opacity) {
        this._opacity = opacity;

        if (this._children && this._children.length > 0) {
            for (var i = 0; i < this._children.length; i++) {
                if (this._children[i] && this._children[i].RGBAProtocol) {
                    this._children[i].setOpacity(opacity);
                }
            }
        }
    },

    /** initializes a CCMenu with it's items */
    initWithItems:function (item, args) {
        if (this.init()) {
            //this.m_bIsTouchEnabled = false;

            // menu in the center of the screen
            var winSize = cc.Director.getInstance().getWinSize();

            // Set the default anchor point
            this.ignoreAnchorPointForPosition(true);
            this.setAnchorPoint(cc.p(0.5, 0.5));
            this.setContentSize(winSize);

            this.setPosition(cc.p(winSize.width / 2, winSize.height / 2));
            var z = 0;

            if (item) {
                this.addChild(item, z);
                for (var i = 0; i < args.length; i++) {
                    if (args[i]) {
                        z++;
                        this.addChild(args[i], z);
                    }
                }
            }
            return true;
        }
        return false;
    },

    /** align items vertically */
    alignItemsVertically:function () {
        this.alignItemsVerticallyWithPadding(cc.DEFAULT_PADDING);
    },

    /** align items vertically with padding
     @since v0.7.2
     */
    alignItemsVerticallyWithPadding:function (padding) {
        var height = -padding;

        var i;
        if (this._children && this._children.length > 0) {
            for (i = 0; i < this._children.length; i++) {
                if (this._children[i]) {
                    height += this._children[i].getContentSize().height * this._children[i].getScaleY() + padding;
                }
            }
        }

        var width = 0;
        var y = height / 2.0;
        if (this._children && this._children.length > 0) {
            for (i = 0; i < this._children.length; i++) {
                if (this._children[i]) {
                    width = Math.max(width, this._children[i].getContentSize().width);
                    this._children[i].setPosition(cc.p(0, y - this._children[i].getContentSize().height * this._children[i].getScaleY() / 2.0));
                    y -= this._children[i].getContentSize().height * this._children[i].getScaleY() + padding;
                }
            }
        }
        this.setContentSize(cc.SizeMake(width, height));
    },

    /** align items horizontally */
    alignItemsHorizontally:function () {
        this.alignItemsHorizontallyWithPadding(cc.DEFAULT_PADDING);
    },

    /** align items horizontally with padding
     @since v0.7.2
     */
    alignItemsHorizontallyWithPadding:function (padding) {
        var width = -padding;
        var i;
        if (this._children && this._children.length > 0) {
            for (i = 0; i < this._children.length; i++) {
                if (this._children[i]) {
                    width += this._children[i].getContentSize().width * this._children[i].getScaleX() + padding;
                }
            }
        }

        var height = 0;
        var x = -width / 2.0;
        if (this._children && this._children.length > 0) {
            for (i = 0; i < this._children.length; i++) {
                if (this._children[i]) {
                    height = Math.max(height, this._children[i].getContentSize().height);
                    this._children[i].setPosition(cc.p(x + this._children[i].getContentSize().width * this._children[i].getScaleX() / 2.0, 0));
                    x += this._children[i].getContentSize().width * this._children[i].getScaleX() + padding;
                }
            }
        }
        this.setContentSize(cc.SizeMake(width, height));
    },

    /** align items in rows of columns */
    alignItemsInColumns:function (columns) {
        var rows = [];
        var i;
        for (i = 1; i < arguments.length; i++) {
            rows.push(arguments[i]);
        }

        var height = -5;
        var row = 0;
        var rowHeight = 0;
        var columnsOccupied = 0;
        var rowColumns;

        var tmp;
        if (this._children && this._children.length > 0) {
            for (i = 0; i < this._children.length; i++) {
                if (this._children[i]) {
                    cc.Assert(row < rows.size(), "");

                    rowColumns = rows[row];
                    // can not have zero columns on a row
                    cc.Assert(rowColumns, "");

                    tmp = this._children[i].getContentSize().height;
                    rowHeight = 0 | ((rowHeight >= tmp || (tmp == null)) ? rowHeight : tmp);

                    ++columnsOccupied;
                    if (columnsOccupied >= rowColumns) {
                        height += rowHeight + 5;

                        columnsOccupied = 0;
                        rowHeight = 0;
                        ++row;
                    }
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
                if (this._children[i]) {
                    if (rowColumns == 0) {
                        rowColumns = rows[row];
                        w = winSize.width / (1 + rowColumns);
                        x = w;
                    }

                    tmp = this._children[i].getContentSize().height;
                    rowHeight = 0 | ((rowHeight >= tmp || (tmp == null)) ? rowHeight : tmp);

                    this._children[i].setPosition(cc.p(x - winSize.width / 2,
                        y - this._children[i].getContentSize().height / 2));

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
        }
    },

    /** align items in columns of rows */
    alignItemsInRows:function (rows) {
        var columns = [];
        var i;
        for (i = 1; i < arguments.length; i++) {
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

        var tmp;
        if (this._children && this._children.length > 0) {
            for (i = 0; i < this._children.length; i++) {
                if (this._children[i]) {
                    // check if too many menu items for the amount of rows/columns
                    cc.Assert(column < columns.size(), "");

                    columnRows = columns[column];
                    // can't have zero rows on a column
                    cc.Assert(columnRows, "");

                    // columnWidth = fmaxf(columnWidth, [item contentSize].width);
                    tmp = this._children[i].getContentSize().width;
                    columnWidth = 0 | ((columnWidth >= tmp || (tmp == null)) ? columnWidth : tmp);

                    columnHeight += 0 | (this._children[i].getContentSize().height + 5);
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
        }

        // check if too many rows/columns for available menu items.
        cc.Assert(!rowsOccupied, "");

        var winSize = cc.Director.getInstance().getWinSize();

        column = 0;
        columnWidth = 0;
        columnRows = null;
        var x = (-width / 2);
        var y = 0.0;
        if (this._children && this._children.length > 0) {
            for (i = 0; i < this._children.length; i++) {
                if (this._children[i]) {
                    if (columnRows == null) {
                        columnRows = columns[column];
                        y = columnHeights[column];
                    }

                    // columnWidth = fmaxf(columnWidth, [item contentSize].width);
                    tmp = this._children[i].getContentSize().width;
                    columnWidth = 0 | ((columnWidth >= tmp || (tmp == null)) ? columnWidth : tmp);

                    this._children[i].setPosition(cc.p(x + columnWidths[column] / 2, y - winSize.height / 2));

                    y -= this._children[i].getContentSize().height + 10;
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
        }
    },

    //RGBA protocol
    setOpacityModifyRGB:function (bValue) {
    },
    isOpacityModifyRGB:function () {
        return false;
    }
});

/** creates an empty CCMenu */
cc.MenuPassive.create = function (item) {
    if (arguments.length == 0) {
        item = null;
    }

    var argArr = [];
    for (var i = 1; i < arguments.length; i++) {
        argArr.push(arguments[i]);
    }

    var pRet = new cc.MenuPassive();
    if (pRet && pRet.initWithItems(item, argArr)) {
        return pRet;
    }
    return null;
};

/** creates a CCMenu with it's item, then use addChild() to add
 * other items. It is used for script, it can't init with undetermined
 * number of variables.
 */
cc.MenuPassive.createWithItem = function (item) {
    return cc.MenuPassive.create(item, null);
};