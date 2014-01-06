/****************************************************************************
 Copyright (c) 2013 cocos2d-x.org

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
 * listView event type
 * @type {Object}
 */
ccs.ListViewEventType = {
    listViewOnselectedItem: 0
};

/**
 * listView gravity
 * @type {Object}
 */
ccs.ListViewGravity = {
    left: 0,
    right: 1,
    centerHorizontal: 2,
    top: 3,
    bottom: 4,
    centerVertical: 5
};

/**
 * Base class for ccs.ListView
 * @class
 * @extends ccs.ScrollView
 */
ccs.ListView = ccs.ScrollView.extend({
    _model: null,
    _items: null,
    _gravity: null,
    _itemsMargin: 0,
    _listViewEventListener: null,
    _listViewEventSelector: null,
    _curSelectedIndex: 0,
    _refreshViewDirty: true,
    ctor: function () {
        ccs.ScrollView.prototype.ctor.call(this);
        this._model = null;
        this._items = [];
        this._gravity = ccs.ListViewGravity.centerHorizontal;
        this._itemsMargin = 0;
        this._listViewEventListener = null;
        this._listViewEventSelector = null;
        this._curSelectedIndex = 0;
        this._refreshViewDirty = true;
    },

    init: function () {
        if (ccs.ScrollView.prototype.init.call(this)) {
            this._items = [];
            this.setLayoutType(ccs.LayoutType.linearVertical);
            return true;
        }
        return false;
    },

    /**
     * Sets a item model for listview. A model will be cloned for adding default item.
     * @param {ccs.Widget} model
     */
    setItemModel: function (model) {
        if (!model) {
            return;
        }
        this._model = model;
    },

    updateInnerContainerSize: function () {
        switch (this._direction) {
            case ccs.ScrollViewDir.vertical:
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
            case ccs.ScrollViewDir.horizontal:
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
        switch (this._direction) {
            case ccs.ScrollViewDir.vertical:
                var llp = item.getLayoutParameter(ccs.LayoutParameterType.linear);
                if (!llp) {
                    var defaultLp = ccs.LinearLayoutParameter.create();
                    switch (this._gravity) {
                        case ccs.ListViewGravity.left:
                            defaultLp.setGravity(ccs.LinearGravity.left);
                            break;
                        case ccs.ListViewGravity.right:
                            defaultLp.setGravity(ccs.LinearGravity.right);
                            break;
                        case ccs.ListViewGravity.centerHorizontal:
                            defaultLp.setGravity(ccs.LinearGravity.centerHorizontal);
                            break;
                        default:
                            break;
                    }
                    if (this.getIndex(item) == 0) {
                        defaultLp.setMargin(ccs.MarginZero());
                    }
                    else {
                        defaultLp.setMargin(new ccs.Margin(0.0, this._itemsMargin, 0.0, 0.0));
                    }
                    item.setLayoutParameter(defaultLp);
                }
                else {
                    if (this.getIndex(item) == 0) {
                        llp.setMargin(ccs.MarginZero());
                    }
                    else {
                        llp.setMargin(new ccs.Margin(0, this._itemsMargin, 0, 0));
                    }
                    switch (this._gravity) {
                        case ccs.ListViewGravity.left:
                            llp.setGravity(ccs.LinearGravity.left);
                            break;
                        case ccs.ListViewGravity.right:
                            llp.setGravity(ccs.LinearGravity.right);
                            break;
                        case ccs.ListViewGravity.centerHorizontal:
                            llp.setGravity(ccs.LinearGravity.centerHorizontal);
                            break;
                        default:
                            break;
                    }
                }
                break;
            case ccs.ScrollViewDir.horizontal:
                var llp = item.getLayoutParameter(ccs.LayoutParameterType.linear);
                if (!llp) {
                    var defaultLp = ccs.LinearLayoutParameter.create();
                    switch (this._gravity) {
                        case ccs.ListViewGravity.top:
                            defaultLp.setGravity(ccs.LinearGravity.top);
                            break;
                        case ccs.ListViewGravity.bottom:
                            defaultLp.setGravity(ccs.LinearGravity.bottom);
                            break;
                        case ccs.ListViewGravity.centerVertical:
                            defaultLp.setGravity(ccs.LinearGravity.centerVertical);
                            break;
                        default:
                            break;
                    }
                    if (this.getIndex(item) == 0) {
                        defaultLp.setMargin(ccs.MarginZero());
                    }
                    else {
                        defaultLp.setMargin(new ccs.Margin(this._itemsMargin, 0.0, 0.0, 0.0));
                    }
                    item.setLayoutParameter(defaultLp);
                }
                else {
                    if (this.getIndex(item) == 0) {
                        llp.setMargin(ccs.MarginZero());
                    }
                    else {
                        llp.setMargin(new ccs.Margin(this._itemsMargin, 0.0, 0.0, 0.0));
                    }
                    switch (this._gravity) {
                        case ccs.ListViewGravity.top:
                            llp.setGravity(ccs.LinearGravity.top);
                            break;
                        case ccs.ListViewGravity.bottom:
                            llp.setGravity(ccs.LinearGravity.bottom);
                            break;
                        case ccs.ListViewGravity.centerVertical:
                            llp.setGravity(ccs.LinearGravity.centerVertical);
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
        cc.ArrayAppendObjectToIndex(this._items, newItem, index);
        this.remedyLayoutParameter(newItem);
        this.addChild(newItem);
        this._refreshViewDirty = true;
    },

    /**
     * Push back custom item into listview.
     * @param {ccs.Widget} item
     */
    pushBackCustomItem: function (item) {
        this._items.push(item);
        this.remedyLayoutParameter(item);
        this.addChild(item);
        this._refreshViewDirty = true;
    },

    /**
     * Push back custom item into listview.
     * @param {ccs.Widget} item
     * @param {Number} index
     */
    insertCustomItem: function (item, index) {
        cc.ArrayAppendObjectToIndex(this._items, item, index);
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
        cc.ArrayRemoveObject(this._items, item);
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
     * @param {ccs.Widget} item
     * @returns {Number}
     */
    getIndex: function (item) {
        return cc.ArrayGetIndexOfObject(this._items, item);
    },

    /**
     * Changes the gravity of listview.
     * @param {ccs.ListViewGravity} gravity
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
     * Changes scroll direction of scrollview.
     * @param {ccs.ScrollViewDir } dir
     */
    setDirection: function (dir) {
        switch (dir) {
            case ccs.ScrollViewDir.vertical:
                this.setLayoutType(ccs.LayoutType.linearVertical);
                break;
            case ccs.ScrollViewDir.horizontal:
                this.setLayoutType(ccs.LayoutType.linearHorizontal);
                break;
            case ccs.ScrollViewDir.both:
                return;
            default:
                return;
                break;
        }
        ccs.ScrollView.prototype.setDirection.call(this, dir);

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
            this._listViewEventSelector.call(this._listViewEventListener, this, ccs.ListViewEventType.listViewOnselectedItem);
        }
    },

    interceptTouchEvent: function (handleState, sender, touchPoint) {
        ccs.ScrollView.prototype.interceptTouchEvent.call(this, handleState, sender, touchPoint);
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
            item.setZOrder(i);
            this.remedyLayoutParameter(item);
        }
        this.updateInnerContainerSize();
    },

    sortAllChildren: function () {
        ccs.ScrollView.prototype.sortAllChildren.call(this);
        if (this._refreshViewDirty) {
            this.refreshView();
            this._refreshViewDirty = false;
        }
    },

    onSizeChanged: function () {
        ccs.ScrollView.prototype.onSizeChanged.call(this);
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
        return ccs.ListView.create();
    },

    copyClonedWidgetChildren: function (model) {
        var arrayItems = model.getItems();
        for (var i = 0; i < arrayItems.length; i++) {
            var item = arrayItems[i];
            this.pushBackCustomItem(item.clone());
        }
    },

    copySpecialProperties: function (listView) {
        ccs.ScrollView.prototype.copySpecialProperties.call(this, listView);
        this.setItemModel(listView._model);
        this.setItemsMargin(listView._itemsMargin);
        this.setGravity(listView._gravity);
    }
});

ccs.ListView.create = function () {
    var uiListView = new ccs.ListView();
    if (uiListView && uiListView.init()) {
        return uiListView;
    }
    return null;
};