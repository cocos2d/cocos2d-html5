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

ccs.ListViewEventType = {
    listViewOnselectedItem: 0
};

ccs.ListViewGravity = {
    left: 0,
    right: 1,
    centerHorizontal: 2,
    top: 3,
    bottom: 4,
    centerVertical: 5
};

ccs.UIListView = ccs.UIScrollView.extend({
    _model: null,
    _items: null,
    _gravity: null,
    _itemsMargin: 0,
    _listViewEventListener: null,
    _listViewEventSelector: null,
    _curSelectedIndex: 0,
    ctor: function () {
        ccs.UIScrollView.prototype.ctor.call(this);
        this._model = null;
        this._items = [];
        this._gravity = ccs.ListViewGravity.centerHorizontal;
        this._itemsMargin = 0;
        this._listViewEventListener = null;
        this._listViewEventSelector = null;
        this._curSelectedIndex = 0;
    },

    init: function () {
        if (ccs.UIScrollView.prototype.init.call(this)) {
            this._items = [];
            this.setLayoutType(ccs.LayoutType.linearVertical);
            return true;
        }
        return false;
    },

    setItemModel: function (model) {
        if (!model) {
            return;
        }
        this._model = model;

    },

    updateInnerContainerSize: function () {
        if (!this._model) {
            return;
        }
        switch (this._direction) {
            case ccs.ScrollViewDir.vertical:
                var childrenCount = this._items.length;
                var totalHeight = this._model.getSize().height * childrenCount + (childrenCount - 1) * this._itemsMargin;
                var finalWidth = this._size.width;
                var finalHeight = totalHeight;
                this.setInnerContainerSize(cc.size(finalWidth, finalHeight));
                break;
            case ccs.ScrollViewDir.horizontal:
                var childrenCount = this._items.length;
                var totalWidth = this._model.getSize().width * childrenCount + (childrenCount - 1) * this._itemsMargin;
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
                    var defaultLp = ccs.UILinearLayoutParameter.create();
                    switch (this._gravity) {
                        case ccs.ListViewGravity.left:
                            defaultLp.setGravity(ccs.UILinearGravity.left);
                            break;
                        case ccs.ListViewGravity.right:
                            defaultLp.setGravity(ccs.UILinearGravity.right);
                            break;
                        case ccs.ListViewGravity.centerHorizontal:
                            defaultLp.setGravity(ccs.UILinearGravity.centerHorizontal);
                            break;
                        default:
                            break;
                    }
                    if (this.getIndex(item) == 0) {
                        defaultLp.setMargin(ccs.UIMarginZero());
                    }
                    else {
                        defaultLp.setMargin(new ccs.UIMargin(0.0, this._itemsMargin, 0.0, 0.0));
                    }
                    item.setLayoutParameter(defaultLp);
                }
                else {
                    if (this.getIndex(item) == 0) {
                        llp.setMargin(ccs.UIMarginZero);
                    }
                    else {
                        llp.setMargin(new ccs.UIMargin(0.0, this._itemsMargin, 0.0, 0.0));
                    }
                    switch (this._gravity) {
                        case ccs.ListViewGravity.left:
                            llp.setGravity(ccs.UILinearGravity.left);
                            break;
                        case ccs.ListViewGravity.right:
                            llp.setGravity(ccs.UILinearGravity.right);
                            break;
                        case ccs.ListViewGravity.centerHorizontal:
                            llp.setGravity(ccs.UILinearGravity.centerHorizontal);
                            break;
                        default:
                            break;
                    }
                }
                break;
            case ccs.ScrollViewDir.horizontal:
                var llp = item.getLayoutParameter(ccs.LayoutParameterType.linear);
                if (!llp) {
                    var defaultLp = ccs.UILinearLayoutParameter.create();
                    switch (this._gravity) {
                        case ccs.ListViewGravity.top:
                            defaultLp.setGravity(ccs.UILinearGravity.top);
                            break;
                        case ccs.ListViewGravity.bottom:
                            defaultLp.setGravity(ccs.UILinearGravity.bottom);
                            break;
                        case ccs.ListViewGravity.centerVertical:
                            defaultLp.setGravity(ccs.UILinearGravity.centerVertical);
                            break;
                        default:
                            break;
                    }
                    if (getIndex(item) == 0) {
                        defaultLp.setMargin(ccs.UIMarginZero());
                    }
                    else {
                        defaultLp.setMargin(new ccs.UIMargin(this._itemsMargin, 0.0, 0.0, 0.0));
                    }
                    item.setLayoutParameter(defaultLp);
                }
                else {
                    if (this.getIndex(item) == 0) {
                        llp.setMargin(ccs.UIMarginZero());
                    }
                    else {
                        llp.setMargin(new ccs.UIMargin(this._itemsMargin, 0.0, 0.0, 0.0));
                    }
                    switch (this._gravity) {
                        case ccs.ListViewGravity.top:
                            llp.setGravity(ccs.UILinearGravity.top);
                            break;
                        case ccs.ListViewGravity.bottom:
                            llp.setGravity(ccs.UILinearGravity.bottom);
                            break;
                        case ccs.ListViewGravity.centerVertical:
                            llp.setGravity(ccs.UILinearGravity.centerVertical);
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

    pushBackDefaultItem: function () {
        if (!this._model) {
            return;
        }
        var newItem = this._model.clone();
        this._items.push(newItem);
        this.remedyLayoutParameter(newItem);
        this.addChild(newItem);
    },

    insertDefaultItem: function (index) {
        if (!this._model) {
            return;
        }
        var newItem = this._model.clone();
        this._items[index] = newItem;
        this.remedyLayoutParameter(newItem);
        this.addChild(newItem);
    },

    pushBackCustomItem: function (item) {
        this._items.push(item);
        this.remedyLayoutParameter(item);
        this.addChild(item);
    },

    insertCustomItem: function (item, index) {
        this._items[index] = item;
        this.remedyLayoutParameter(item);
        this.addChild(item);
    },

    removeItem: function (index) {
        var item = this.getItem(index);
        if (!item) {
            return;
        }
        cc.ArrayRemoveObject(this._items, item);
        this.removeChild(item);
    },

    removeLastItem: function () {
        this.removeItem(this._items.length - 1);
    },

    getItem: function (index) {
        if (index < 0 || index >= this._items.length) {
            return null;
        }
        return this._items[index];
    },

    getItems: function () {
        return this._items;
    },

    getIndex: function (item) {
        return cc.ArrayGetIndexOfObject(this._items, item);
    },

    setGravity: function (gravity) {
        if (this._gravity == gravity) {
            return;
        }
        this._gravity = gravity;
        this.refreshView();
    },

    setItemsMargin: function (margin) {
        if (this._itemsMargin == margin) {
            return;
        }
        this._itemsMargin = margin;
        this.refreshView();
    },

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
        ccs.UIScrollView.prototype.setDirection.call(this, dir);

    },

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
        ccs.UIScrollView.prototype.interceptTouchEvent.call(this, handleState, sender, touchPoint);
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

    getCurSelectedIndex: function () {
        return this._curSelectedIndex;
    },


    refreshView: function () {
        for (var i = 0; i < this._items.length; i++) {
            var item = this._items[i];
            item.setZOrder(i);
            this.remedyLayoutParameter(item);
        }
        this.updateInnerContainerSize();
    },

    onSizeChanged: function () {
        ccs.UIScrollView.prototype.onSizeChanged.call(this);
        this.refreshView();
    },
    getDescription: function () {
        return "ListViewEx";
    },

    createCloneInstance: function () {
        return ccs.UIListView.create();
    },

    copyClonedWidgetChildren: function (model) {
        var arrayItems = model.getItems();
        for (var i = 0; i < arrayItems.length; i++) {
            var item = arrayItems[i];
            this.pushBackCustomItem(item.clone());
        }
    },

    copySpecialProperties: function (listView) {
        ccs.UIScrollView.prototype.copySpecialProperties(listView);
        this.setItemModel(listView._model);
        this.setItemsMargin(listView._itemsMargin);
        this.setGravity(listView._gravity);
    }
});

ccs.UIListView.create = function () {
    var uiListView = new ccs.UIListView();
    if (uiListView && uiListView.init()) {
        return uiListView;
    }
    return null;
};