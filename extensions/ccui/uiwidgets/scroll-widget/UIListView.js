/****************************************************************************
 Copyright (c) 2011-2012 cocos2d-x.org
 Copyright (c) 2013-2014 Chukong Technologies Inc.

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
 * Base class for ccui.ListView
 * @class
 * @extends ccui.ScrollView
 */
ccui.ListView = ccui.ScrollView.extend(/** @lends ccui.ListView# */{
    _model: null,
    _items: null,
    _gravity: null,
    _itemsMargin: 0,
    _listViewEventListener: null,
    _listViewEventSelector: null,
    _curSelectedIndex: 0,
    _refreshViewDirty: true,
    _className:"ListView",
    /**
     * allocates and initializes a UIListView.
     * Constructor of ccui.ListView
     * @example
     * // example
     * var uiPageView = new ccui.ListView();
     */
    ctor: function () {
        ccui.ScrollView.prototype.ctor.call(this);
        this._model = null;
        this._items = [];
        this._gravity = ccui.ListView.GRAVITY_CENTER_HORIZONTAL;
        this._itemsMargin = 0;
        this._listViewEventListener = null;
        this._listViewEventSelector = null;
        this._curSelectedIndex = 0;
        this._refreshViewDirty = true;

        this.init();
    },

    init: function () {
        if (ccui.ScrollView.prototype.init.call(this)) {
            this._items = [];
            this.setLayoutType(ccui.Layout.LINEAR_VERTICAL);
            return true;
        }
        return false;
    },

    /**
     * Sets a item model for listview. A model will be cloned for adding default item.
     * @param {ccui.Widget} model
     */
    setItemModel: function (model) {
        if (!model) {
            return;
        }
        this._model = model;
    },

    updateInnerContainerSize: function () {
        switch (this.direction) {
            case ccui.ScrollView.DIR_VERTICAL:
                var length = this._items.length;
                var totalHeight = (length - 1) * this._itemsMargin;
                for (var i = 0; i < length; i++) {
                    var item = this._items[i];
                    totalHeight += item.getSize().height;
                }
                var finalWidth = this._size.width;
                var finalHeight = totalHeight;
                this.setInnerContainerSize(cc.size(finalWidth, finalHeight));
                break;
            case ccui.ScrollView.DIR_HORIZONTAL:
                var length = this._items.length;
                var totalWidth = (length - 1) * this._itemsMargin;
                for (var i = 0; i < length; i++) {
                    var item = this._items[i];
                    totalWidth += item.getSize().width;
                }
                var finalWidth = totalWidth;
                var finalHeight = this._size.height;
                this.setInnerContainerSize(cc.size(finalWidth, finalHeight));
                break;
            default:
                break;
        }
    },

    remedyLayoutParameter: function (item) {
        if (!item) {
            return;
        }
        switch (this.direction) {
            case ccui.ScrollView.DIR_VERTICAL:
                var llp = item.getLayoutParameter(ccui.LayoutParameter.LINEAR);
                if (!llp) {
                    var defaultLp = ccui.LinearLayoutParameter.create();
                    switch (this._gravity) {
                        case ccui.ListView.GRAVITY_LEFT:
                            defaultLp.setGravity(ccui.LINEAR_GRAVITY_LEFT);
                            break;
                        case ccui.ListView.GRAVITY_RIGHT:
                            defaultLp.setGravity(ccui.LINEAR_GRAVITY_RIGHT);
                            break;
                        case ccui.ListView.GRAVITY_CENTER_HORIZONTAL:
                            defaultLp.setGravity(ccui.LINEAR_GRAVITY_CENTER_HORIZONTAL);
                            break;
                        default:
                            break;
                    }
                    if (this.getIndex(item) == 0) {
                        defaultLp.setMargin(ccui.MarginZero());
                    }
                    else {
                        defaultLp.setMargin(new ccui.Margin(0.0, this._itemsMargin, 0.0, 0.0));
                    }
                    item.setLayoutParameter(defaultLp);
                }
                else {
                    if (this.getIndex(item) == 0) {
                        llp.setMargin(ccui.MarginZero());
                    }
                    else {
                        llp.setMargin(new ccui.Margin(0, this._itemsMargin, 0, 0));
                    }
                    switch (this._gravity) {
                        case ccui.ListView.GRAVITY_LEFT:
                            llp.setGravity(ccui.LINEAR_GRAVITY_LEFT);
                            break;
                        case ccui.ListView.GRAVITY_RIGHT:
                            llp.setGravity(ccui.LINEAR_GRAVITY_RIGHT);
                            break;
                        case ccui.ListView.GRAVITY_CENTER_HORIZONTAL:
                            llp.setGravity(ccui.LINEAR_GRAVITY_CENTER_HORIZONTAL);
                            break;
                        default:
                            break;
                    }
                }
                break;
            case ccui.ScrollView.DIR_HORIZONTAL:
                var llp = item.getLayoutParameter(ccui.LayoutParameter.LINEAR);
                if (!llp) {
                    var defaultLp = ccui.LinearLayoutParameter.create();
                    switch (this._gravity) {
                        case ccui.ListView.GRAVITY_TOP:
                            defaultLp.setGravity(ccui.LINEAR_GRAVITY_TOP);
                            break;
                        case ccui.ListView.GRAVITY_BOTTOM:
                            defaultLp.setGravity(ccui.LINEAR_GRAVITY_BOTTOM);
                            break;
                        case ccui.ListView.GRAVITY_CENTER_VERTICAL:
                            defaultLp.setGravity(ccui.LINEAR_GRAVITY_CENTER_VERTICAL);
                            break;
                        default:
                            break;
                    }
                    if (this.getIndex(item) == 0) {
                        defaultLp.setMargin(ccui.MarginZero());
                    }
                    else {
                        defaultLp.setMargin(new ccui.Margin(this._itemsMargin, 0.0, 0.0, 0.0));
                    }
                    item.setLayoutParameter(defaultLp);
                }
                else {
                    if (this.getIndex(item) == 0) {
                        llp.setMargin(ccui.MarginZero());
                    }
                    else {
                        llp.setMargin(new ccui.Margin(this._itemsMargin, 0.0, 0.0, 0.0));
                    }
                    switch (this._gravity) {
                        case ccui.ListView.GRAVITY_TOP:
                            llp.setGravity(ccui.LINEAR_GRAVITY_TOP);
                            break;
                        case ccui.ListView.GRAVITY_BOTTOM:
                            llp.setGravity(ccui.LINEAR_GRAVITY_BOTTOM);
                            break;
                        case ccui.ListView.GRAVITY_CENTER_VERTICAL:
                            llp.setGravity(ccui.LINEAR_GRAVITY_CENTER_VERTICAL);
                            break;
                        default:
                            break;
                    }
                }
                break;
            default:
                break;
        }
    },

    /**
     * Push back a default item(create by a cloned model) into listview.
     */
    pushBackDefaultItem: function () {
        if (!this._model) {
            return;
        }
        var newItem = this._model.clone();
        this._items.push(newItem);
        this.remedyLayoutParameter(newItem);
        this.addChild(newItem);
        this._refreshViewDirty = true;
    },

    /**
     * Insert a default item(create by a cloned model) into listview.
     * @param {Number} index
     */
    insertDefaultItem: function (index) {
        if (!this._model) {
            return;
        }
        var newItem = this._model.clone();
        this._items.splice(index, 0, newItem);
        this.remedyLayoutParameter(newItem);
        this.addChild(newItem);
        this._refreshViewDirty = true;
    },

    /**
     * Push back custom item into listview.
     * @param {ccui.Widget} item
     */
    pushBackCustomItem: function (item) {
        this._items.push(item);
        this.remedyLayoutParameter(item);
        this.addChild(item);
        this._refreshViewDirty = true;
    },

    /**
     * Push back custom item into listview.
     * @param {ccui.Widget} item
     * @param {Number} index
     */
    insertCustomItem: function (item, index) {
        this._items.splice(index, 0, item);
        this.remedyLayoutParameter(item);
        this.addChild(item);
        this._refreshViewDirty = true;
    },

    /**
     * Removes a item whose index is same as the parameter.
     * @param {Number} index
     */
    removeItem: function (index) {
        var item = this.getItem(index);
        if (!item) {
            return;
        }
        cc.arrayRemoveObject(this._items, item);
        this.removeChild(item);
        this._refreshViewDirty = true;
    },

    /**
     * Removes the last item of listview.
     */
    removeLastItem: function () {
        this.removeItem(this._items.length - 1);
    },

    /**
     * Returns a item whose index is same as the parameter.
     * @param {Number} index
     * @returns {cc.Widget}
     */
    getItem: function (index) {
        if (index < 0 || index >= this._items.length) {
            return null;
        }
        return this._items[index];
    },

    /**
     * Returns the item container.
     * @returns {Array}
     */
    getItems: function () {
        return this._items;
    },

    /**
     * Returns the index of item.
     * @param {ccui.Widget} item
     * @returns {Number}
     */
    getIndex: function (item) {
        return this._items.indexOf(item);
    },

    /**
     * Changes the gravity of listview.
     * @param {ccui.ListView.GRAVITY_LEFT|ccui.ListView.GRAVITY_RIGHT|ccui.ListView.GRAVITY_CENTER_HORIZONTAL|ccui.ListView.GRAVITY_BOTTOM|ccui.ListView.GRAVITY_CENTER_VERTICAL} gravity
     */
    setGravity: function (gravity) {
        if (this._gravity == gravity) {
            return;
        }
        this._gravity = gravity;
        this._refreshViewDirty = true;
    },

    /**
     * Changes the margin between each item.
     * @param {Number} margin
     */
    setItemsMargin: function (margin) {
        if (this._itemsMargin == margin) {
            return;
        }
        this._itemsMargin = margin;
        this._refreshViewDirty = true;
    },

    /**
     * Get the margin between each item.
     * @returns {Number}
     */
    getItemsMargin:function(){
        return this._itemsMargin;
    },

    /**
     * Changes scroll direction of scrollview.
     * @param {ccui.ScrollView.DIR_NONE | ccui.ScrollView.DIR_VERTICAL | ccui.ScrollView.DIR_HORIZONTAL | ccui.ScrollView.DIR_BOTH} dir
     */
    setDirection: function (dir) {
        switch (dir) {
            case ccui.ScrollView.DIR_VERTICAL:
                this.setLayoutType(ccui.Layout.LINEAR_VERTICAL);
                break;
            case ccui.ScrollView.DIR_HORIZONTAL:
                this.setLayoutType(ccui.Layout.LINEAR_HORIZONTAL);
                break;
            case ccui.ScrollView.DIR_BOTH:
                return;
            default:
                return;
                break;
        }
        ccui.ScrollView.prototype.setDirection.call(this, dir);

    },

    /**
     *  add event listener
     * @param {Function} selector
     * @param {Object} target
     */
    addEventListenerListView: function (selector, target) {
        this._listViewEventListener = target;
        this._listViewEventSelector = selector;
    },

    selectedItemEvent: function () {
        if(this._listViewEventSelector&&this._listViewEventListener){
            this._listViewEventSelector.call(this._listViewEventListener, this, ccui.ListView.EVENT_SELECTED_ITEM);
        }
    },

    interceptTouchEvent: function (handleState, sender, touchPoint) {
        ccui.ScrollView.prototype.interceptTouchEvent.call(this, handleState, sender, touchPoint);
        if (handleState != 1) {
            var parent = sender;
            while (parent) {
                if (parent && parent.getParent() == this._innerContainer) {
                    this._curSelectedIndex = this.getIndex(parent);
                    break;
                }
                parent = parent.getParent();
            }
            this.selectedItemEvent();
        }
    },

    /**
     * get current selected index
     * @returns {number}
     */
    getCurSelectedIndex: function () {
        return this._curSelectedIndex;
    },

    /**
     * request refresh view
     */
    requestRefreshView: function () {
        this._refreshViewDirty = true;
    },

    refreshView: function () {
        for (var i = 0; i < this._items.length; i++) {
            var item = this._items[i];
            item.setLocalZOrder(i);
            this.remedyLayoutParameter(item);
        }
        this.updateInnerContainerSize();
    },

    sortAllChildren: function () {
        ccui.ScrollView.prototype.sortAllChildren.call(this);
        if (this._refreshViewDirty) {
            this.refreshView();
            this._refreshViewDirty = false;
        }
    },

    onSizeChanged: function () {
        ccui.ScrollView.prototype.onSizeChanged.call(this);
        this._refreshViewDirty = true;
    },

    /**
     * Returns the "class name" of widget.
     * @returns {string}
     */
    getDescription: function () {
        return "ListView";
    },

    createCloneInstance: function () {
        return ccui.ListView.create();
    },

    copyClonedWidgetChildren: function (model) {
        var arrayItems = model.getItems();
        for (var i = 0; i < arrayItems.length; i++) {
            var item = arrayItems[i];
            this.pushBackCustomItem(item.clone());
        }
    },

    copySpecialProperties: function (listView) {
        ccui.ScrollView.prototype.copySpecialProperties.call(this, listView);
        this.setItemModel(listView._model);
        this.setItemsMargin(listView._itemsMargin);
        this.setGravity(listView._gravity);
    }
});

/**
 * allocates and initializes a UIListView.
 * @constructs
 * @example
 * // example
 * var uiPageView = ccui.ListView.create();
 */
ccui.ListView.create = function () {
     return new ccui.ListView();
};

// Constants
//listView event type
ccui.ListView.EVENT_SELECTED_ITEM = 0;

//listView gravity
ccui.ListView.GRAVITY_LEFT = 0;
ccui.ListView.GRAVITY_RIGHT = 1;
ccui.ListView.GRAVITY_CENTER_HORIZONTAL = 2;
ccui.ListView.GRAVITY_TOP = 3;
ccui.ListView.GRAVITY_BOTTOM = 4;
ccui.ListView.GRAVITY_CENTER_VERTICAL = 5;