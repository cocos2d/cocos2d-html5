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

    _curSelectedIndex: 0,
    _refreshViewDirty: true,

    _listViewEventListener: null,
    _listViewEventSelector: null,
    _eventCallback: null,
    /**
     * allocates and initializes a UIListView.
     * Constructor of ccui.ListView
     * @example
     * // example
     * var uiPageView = new ccui.ListView();
     */
    ctor: function () {
        ccui.ScrollView.prototype.ctor.call(this);
        this._items = [];
        this._gravity = ccui.ListView.GRAVITY_CENTER_HORIZONTAL;
        this.setTouchEnabled(true);

        this.init();
    },

    init: function () {
        if (ccui.ScrollView.prototype.init.call(this)) {
            this.setLayoutType(ccui.Layout.LINEAR_VERTICAL);
            return true;
        }
        return false;
    },

    /**
     * Sets a item model for ListView. A model will be cloned for adding default item.
     * @param {ccui.Widget} model
     */
    setItemModel: function (model) {
        if (!model)
            return;
        this._model = model;
    },

    _updateInnerContainerSize: function () {
        var locItems = this._items, length, i;
        switch (this.direction) {
            case ccui.ScrollView.DIR_VERTICAL:
                length = locItems.length;
                var totalHeight = (length - 1) * this._itemsMargin;
                for (i = 0; i < length; i++) {
                    totalHeight += locItems[i].getContentSize().height;
                }
                this.setInnerContainerSize(cc.size(this._contentSize.width, totalHeight));
                break;
            case ccui.ScrollView.DIR_HORIZONTAL:
                length = locItems.length;
                var totalWidth = (length - 1) * this._itemsMargin;
                for (i = 0; i < length; i++) {
                    totalWidth += locItems[i].getContentSize().width;
                }
                this.setInnerContainerSize(cc.size(totalWidth, this._contentSize.height));
                break;
            default:
                break;
        }
    },

    _remedyLayoutParameter: function (item) {
        if (!item)
            return;
        var llp;
        switch (this.direction) {
            case ccui.ScrollView.DIR_VERTICAL:
                llp = item.getLayoutParameter();
                if (!llp) {
                    var defaultLp = ccui.LinearLayoutParameter.create();
                    switch (this._gravity) {
                        case ccui.ListView.GRAVITY_LEFT:
                            defaultLp.setGravity(ccui.LinearLayoutParameter.LEFT);
                            break;
                        case ccui.ListView.GRAVITY_RIGHT:
                            defaultLp.setGravity(ccui.LinearLayoutParameter.RIGHT);
                            break;
                        case ccui.ListView.GRAVITY_CENTER_HORIZONTAL:
                            defaultLp.setGravity(ccui.LinearLayoutParameter.CENTER_HORIZONTAL);
                            break;
                        default:
                            break;
                    }
                    if (this.getIndex(item) == 0)
                        defaultLp.setMargin(ccui.MarginZero());
                    else
                        defaultLp.setMargin(new ccui.Margin(0.0, this._itemsMargin, 0.0, 0.0));
                    item.setLayoutParameter(defaultLp);
                } else {
                    if (this.getIndex(item) == 0)
                        llp.setMargin(ccui.MarginZero());
                    else
                        llp.setMargin(new ccui.Margin(0, this._itemsMargin, 0, 0));
                    switch (this._gravity) {
                        case ccui.ListView.GRAVITY_LEFT:
                            llp.setGravity(ccui.LinearLayoutParameter.LEFT);
                            break;
                        case ccui.ListView.GRAVITY_RIGHT:
                            llp.setGravity(ccui.LinearLayoutParameter.RIGHT);
                            break;
                        case ccui.ListView.GRAVITY_CENTER_HORIZONTAL:
                            llp.setGravity(ccui.LinearLayoutParameter.CENTER_HORIZONTAL);
                            break;
                        default:
                            break;
                    }
                }
                break;
            case ccui.ScrollView.DIR_HORIZONTAL:
                llp = item.getLayoutParameter();
                if (!llp) {
                    var defaultLp = ccui.LinearLayoutParameter.create();
                    switch (this._gravity) {
                        case ccui.ListView.GRAVITY_TOP:
                            defaultLp.setGravity(ccui.LinearLayoutParameter.TOP);
                            break;
                        case ccui.ListView.GRAVITY_BOTTOM:
                            defaultLp.setGravity(ccui.LinearLayoutParameter.BOTTOM );
                            break;
                        case ccui.ListView.GRAVITY_CENTER_VERTICAL:
                            defaultLp.setGravity(ccui.LinearLayoutParameter.CENTER_VERTICAL);
                            break;
                        default:
                            break;
                    }
                    if (this.getIndex(item) == 0)
                        defaultLp.setMargin(ccui.MarginZero());
                    else
                        defaultLp.setMargin(new ccui.Margin(this._itemsMargin, 0.0, 0.0, 0.0));
                    item.setLayoutParameter(defaultLp);
                } else {
                    if (this.getIndex(item) == 0)
                        llp.setMargin(ccui.MarginZero());
                    else
                        llp.setMargin(new ccui.Margin(this._itemsMargin, 0.0, 0.0, 0.0));
                    switch (this._gravity) {
                        case ccui.ListView.GRAVITY_TOP:
                            llp.setGravity(ccui.LinearLayoutParameter.TOP);
                            break;
                        case ccui.ListView.GRAVITY_BOTTOM:
                            llp.setGravity(ccui.LinearLayoutParameter.BOTTOM);
                            break;
                        case ccui.ListView.GRAVITY_CENTER_VERTICAL:
                            llp.setGravity(ccui.LinearLayoutParameter.CENTER_VERTICAL);
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
     * Push back a default item(create by a cloned model) into ListView.
     */
    pushBackDefaultItem: function () {
        if (!this._model)
            return;
        var newItem = this._model.clone();
        this._remedyLayoutParameter(newItem);
        this.addChild(newItem);
        this._refreshViewDirty = true;
    },

    /**
     * Insert a default item(create by a cloned model) into ListView.
     * @param {Number} index
     */
    insertDefaultItem: function (index) {
        if (!this._model)
            return;
        var newItem = this._model.clone();
        this._items.splice(index, 0, newItem);
        ccui.ScrollView.prototype.addChild.call(this, newItem);
        this._remedyLayoutParameter(newItem);

        this._refreshViewDirty = true;
    },

    /**
     * Push back custom item into ListView.
     * @param {ccui.Widget} item
     */
    pushBackCustomItem: function (item) {
        this._remedyLayoutParameter(item);
        this.addChild(item);
        this._refreshViewDirty = true;
    },

    /**
     * add child to ListView
     * @param {cc.Node} widget
     * @param {Number} [zOrder]
     * @param {Number|String} [tag]  tag or name
     */
    addChild: function (widget, zOrder, tag) {
        if (widget) {
            zOrder = zOrder || widget.getLocalZOrder();
            tag = tag || widget.getName();
            ccui.ScrollView.prototype.addChild.call(this, widget, zOrder, tag);
            if(widget instanceof ccui.Widget)
                this._items.push(widget);
        }
    },

    /**
     * remove child from ListView
     * @param {cc.Node} widget
     * @param {Boolean} [cleanup=true]
     */
    removeChild: function(widget, cleanup){
        if (widget) {
            var index = this._items.indexOf(widget);
            if(index > -1)
                this._items.splice(index, 1);
            ccui.ScrollView.prototype.removeChild.call(this, widget, cleanup);
        }
    },

    removeAllChildren: function(){
        this.removeAllChildrenWithCleanup(true);
    },

    removeAllChildrenWithCleanup: function(cleanup){
        ccui.ScrollView.prototype.removeAllChildrenWithCleanup.call(this, cleanup);
        this._items = [];
    },

    /**
     * Push back custom item into ListView.
     * @param {ccui.Widget} item
     * @param {Number} index
     */
    insertCustomItem: function (item, index) {
        this._items.splice(index, 0, item);
        ccui.ScrollView.prototype.addChild.call(this, item);
        this._remedyLayoutParameter(item);
        this._refreshViewDirty = true;
    },

    /**
     * Removes a item whose index is same as the parameter.
     * @param {Number} index
     */
    removeItem: function (index) {
        var item = this.getItem(index);
        if (!item)
            return;
        this.removeChild(item, true);
        this._refreshViewDirty = true;
    },

    /**
     * Removes the last item of ListView.
     */
    removeLastItem: function () {
        this.removeItem(this._items.length - 1);
    },

    removeAllItems: function(){
        this.removeAllChildren();
    },

    /**
     * Returns a item whose index is same as the parameter.
     * @param {Number} index
     * @returns {ccui.Widget}
     */
    getItem: function (index) {
        if (index < 0 || index >= this._items.length)
            return null;
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
     * @param {ccui.Widget} item the item which need to be checked.
     * @returns {Number} the index of item.
     */
    getIndex: function (item) {
        return this._items.indexOf(item);
    },

    /**
     * Changes the gravity of ListView.
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
     * request refresh view
     */
    requestRefreshView: function () {
        this._refreshViewDirty = true;
    },

    refreshView: function () {
        var locItems = this._items;
        for (var i = 0; i < locItems.length; i++) {
            var item = locItems[i];
            item.setLocalZOrder(i);
            this._remedyLayoutParameter(item);
        }
        this._updateInnerContainerSize();
    },

    /**
     * public the _doLayout for Editor
     */
    doLayout: function(){
        this._doLayout();
    },

    _doLayout: function(){
        ccui.Layout.prototype._doLayout.call(this);
        if (this._refreshViewDirty) {
            this.refreshView();
            this._refreshViewDirty = false;
        }
    },

    /**
     *  add event listener
     * @param {Function} selector
     * @param {Object} target
     * @deprecated
     */
    addEventListenerListView: function (selector, target) {
        this._listViewEventListener = target;
        this._listViewEventSelector = selector;
    },

    addEventListener: function(callback){
        this._eventCallback = callback;
    },

    _selectedItemEvent: function (event) {
        var eventEnum = (event == ccui.Widget.TOUCH_BEGAN) ? ccui.ListView.ON_SELECTED_ITEM_START : ccui.ListView.ON_SELECTED_ITEM_END;
        if (this._listViewEventListener && this._listViewEventSelector)
            this._listViewEventSelector.call(this._listViewEventListener, this, eventEnum);
        if(this._eventCallback)
            this._eventCallback(this, eventEnum);
    },

    interceptTouchEvent: function (handleState, sender, touch) {
        ccui.ScrollView.prototype.interceptTouchEvent.call(this, handleState, sender, touch);
        if (handleState != ccui.Widget.TOUCH_MOVED) {
            var parent = sender;
            while (parent) {
                if (parent && parent.getParent() == this._innerContainer) {
                    this._curSelectedIndex = this.getIndex(parent);
                    break;
                }
                parent = parent.getParent();
            }
            if (sender.isHighlighted())
                this._selectedItemEvent(handleState);
        }
    },

    /**
     * get current selected index
     * @returns {number}
     */
    getCurSelectedIndex: function () {
        return this._curSelectedIndex;
    },

    _onSizeChanged: function () {
        ccui.ScrollView.prototype._onSizeChanged.call(this);
        this._refreshViewDirty = true;
    },

    /**
     * Returns the "class name" of widget.
     * @returns {string}
     */
    getDescription: function () {
        return "ListView";
    },

    _createCloneInstance: function () {
        return ccui.ListView.create();
    },

    _copyClonedWidgetChildren: function (model) {
        var arrayItems = model.getItems();
        for (var i = 0; i < arrayItems.length; i++) {
            var item = arrayItems[i];
            this.pushBackCustomItem(item.clone());
        }
    },

    _copySpecialProperties: function (listView) {
        if(listView instanceof ccui.ListView){
            ccui.ScrollView.prototype._copySpecialProperties.call(this, listView);
            this.setItemModel(listView._model);
            this.setItemsMargin(listView._itemsMargin);
            this.setGravity(listView._gravity);

            this._listViewEventListener = listView._listViewEventListener;
            this._listViewEventSelector = listView._listViewEventSelector;
            this._eventCallback = listView._eventCallback;
        }
    }
});

/**
 * allocates and initializes a UIListView.
 * @deprecated
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

ccui.ListView.ON_SELECTED_ITEM_START = 0;
ccui.ListView.ON_SELECTED_ITEM_END = 1;

//listView gravity
ccui.ListView.GRAVITY_LEFT = 0;
ccui.ListView.GRAVITY_RIGHT = 1;
ccui.ListView.GRAVITY_CENTER_HORIZONTAL = 2;
ccui.ListView.GRAVITY_TOP = 3;
ccui.ListView.GRAVITY_BOTTOM = 4;
ccui.ListView.GRAVITY_CENTER_VERTICAL = 5;