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
 * The list view control of Cocos UI.
 * @class
 * @extends ccui.ScrollView
 * @example
 * var listView = new ccui.ListView();
 * // set list view ex direction
 * listView.setDirection(ccui.ScrollView.DIR_VERTICAL);
 * listView.setTouchEnabled(true);
 * listView.setBounceEnabled(true);
 * listView.setBackGroundImage("res/cocosui/green_edit.png");
 * listView.setBackGroundImageScale9Enabled(true);
 * listView.setContentSize(cc.size(240, 130));
 * this.addChild(listView);
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

    _magneticAllowedOutOfBoundary: true,
    _magneticType: 0,
    _className:"ListView",

    /**
     * allocates and initializes a UIListView.
     * Constructor of ccui.ListView, override it to extend the construction behavior, remember to call "this._super()" in the extended "ctor" function.
     * @example
     * // example
     * var aListView = new ccui.ListView();
     */
    ctor: function () {
        this._items = [];
        ccui.ScrollView.prototype.ctor.call(this);
        this._gravity = ccui.ListView.GRAVITY_CENTER_VERTICAL;
        this.setTouchEnabled(true);
        this.setDirection(ccui.ScrollView.DIR_VERTICAL);
    },

    /**
     * Sets a item model for ListView. A model will be cloned for adding default item.
     * @param {ccui.Widget} model
     */
    setItemModel: function (model) {
        if (!model){
            cc.log("Can't set a null to item model!");
            return;
        }

        this._model = model;
    },

    _handleReleaseLogic: function(touch)
    {
        ccui.ScrollView.prototype._handleReleaseLogic.call(this, touch);

        if(!this._autoScrolling)
        {
            this._startMagneticScroll();
        }
    },

    _onItemListChanged: function()
    {
        this._outOfBoundaryAmountDirty = true;
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
        cc.assert(null != item, "ListView Item can't be nil!");

        var linearLayoutParameter = item.getLayoutParameter();
        var isLayoutParameterExists = true;
        if (!linearLayoutParameter) {
            linearLayoutParameter = new ccui.LinearLayoutParameter();
            isLayoutParameterExists = false;
        }
        var itemIndex = this.getIndex(item);
        switch (this.direction) {
            case ccui.ScrollView.DIR_VERTICAL:
                this._remedyVerticalLayoutParameter(linearLayoutParameter, itemIndex);
                break;
            case ccui.ScrollView.DIR_HORIZONTAL:
                this._remedyHorizontalLayoutParameter(linearLayoutParameter, itemIndex);
                break;
            default:
                break;
        }
        if (!isLayoutParameterExists)
            item.setLayoutParameter(linearLayoutParameter);
    },

    //@since v3.3
    _remedyVerticalLayoutParameter: function (layoutParameter, itemIndex) {
        cc.assert(null != layoutParameter, "Layout parameter can't be nil!");

        switch (this._gravity) {
            case ccui.ListView.GRAVITY_LEFT:
                layoutParameter.setGravity(ccui.LinearLayoutParameter.LEFT);
                break;
            case ccui.ListView.GRAVITY_RIGHT:
                layoutParameter.setGravity(ccui.LinearLayoutParameter.RIGHT);
                break;
            case ccui.ListView.GRAVITY_CENTER_HORIZONTAL:
                layoutParameter.setGravity(ccui.LinearLayoutParameter.CENTER_HORIZONTAL);
                break;
            default:
                break;
        }
        if (0 === itemIndex)
            layoutParameter.setMargin(ccui.MarginZero());
        else
            layoutParameter.setMargin(new ccui.Margin(0.0, this._itemsMargin, 0.0, 0.0));
    },

    //@since v3.3
    _remedyHorizontalLayoutParameter: function (layoutParameter, itemIndex) {
        cc.assert(null != layoutParameter, "Layout parameter can't be nil!");

        switch (this._gravity) {
            case ccui.ListView.GRAVITY_TOP:
                layoutParameter.setGravity(ccui.LinearLayoutParameter.TOP);
                break;
            case ccui.ListView.GRAVITY_BOTTOM:
                layoutParameter.setGravity(ccui.LinearLayoutParameter.BOTTOM);
                break;
            case ccui.ListView.GRAVITY_CENTER_VERTICAL:
                layoutParameter.setGravity(ccui.LinearLayoutParameter.CENTER_VERTICAL);
                break;
            default:
                break;
        }
        if (0 === itemIndex)
            layoutParameter.setMargin(ccui.MarginZero());
        else
            layoutParameter.setMargin(new ccui.Margin(this._itemsMargin, 0.0, 0.0, 0.0));
    },

    /**
     * Push back a default item(create by a cloned model) into ListView.
     */
    pushBackDefaultItem: function () {
        if (this._model == null)
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
        if (this._model == null)
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
     * @override
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
            {
                this._items.push(widget);
                this._onItemListChanged();
            }
        }
    },

    /**
     * remove child from ListView
     * @override
     * @param {cc.Node} widget
     * @param {Boolean} [cleanup=true]
     */
    removeChild: function(widget, cleanup){
        if (widget) {
            var index = this._items.indexOf(widget);
            if(index > -1)
                this._items.splice(index, 1);

            this._onItemListChanged();

            ccui.ScrollView.prototype.removeChild.call(this, widget, cleanup);
        }
    },

    /**
     * Removes all children from ccui.ListView.
     */
    removeAllChildren: function(){
        this.removeAllChildrenWithCleanup(true);
    },

    /**
     * Removes all children from ccui.ListView and do a cleanup all running actions depending on the cleanup parameter.
     * @param {Boolean} cleanup
     */
    removeAllChildrenWithCleanup: function(cleanup){
        ccui.ScrollView.prototype.removeAllChildrenWithCleanup.call(this, cleanup);
        this._items = [];

        this._onItemListChanged();
    },

    /**
     * Push back custom item into ccui.ListView.
     * @param {ccui.Widget} item
     * @param {Number} index
     */
    insertCustomItem: function (item, index) {
        this._items.splice(index, 0, item);

        this._onItemListChanged();
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
        if (item == null)
            return;
        this.removeChild(item, true);
        this._refreshViewDirty = true;
    },

    /**
     * Removes the last item of ccui.ListView.
     */
    removeLastItem: function () {
        this.removeItem(this._items.length - 1);
    },

    /**
     * Removes all items from ccui.ListView.
     */
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
        if(item == null)
            return -1;
        return this._items.indexOf(item);
    },

    /**
     * Changes the gravity of ListView.
     * @param {ccui.ListView.GRAVITY_LEFT|ccui.ListView.GRAVITY_RIGHT|ccui.ListView.GRAVITY_CENTER_HORIZONTAL|ccui.ListView.GRAVITY_BOTTOM|ccui.ListView.GRAVITY_CENTER_VERTICAL} gravity
     */
    setGravity: function (gravity) {
        if (this._gravity === gravity)
            return;
        this._gravity = gravity;
        this._refreshViewDirty = true;
    },

    /**
     * Set magnetic type of ListView.
     * @param {ccui.ListView.MAGNETIC_NONE|ccui.ListView.MAGNETIC_CENTER,ccui.ListView.MAGNETIC_BOTH_END|ccui.ListView.MAGNETIC_LEFT|ccui.ListView.MAGNETIC_RIGHT|ccui.ListView.MAGNETIC_TOP|ccui.ListView.MAGNETIC_BOTTOM} magneticType
     */
    setMagneticType: function(magneticType)
    {
        this._magneticType = magneticType;
        this._onItemListChanged();
        this._startMagneticScroll();
    },

    /**
     * Get magnetic type of ListView.
     * @returns {number}
     */
    getMagneticType: function()
    {
        return this._magneticType;
    },

    /**
     * Set magnetic allowed out of boundary.
     * @param {boolean} magneticAllowedOutOfBoundary
     */
    setMagneticAllowedOutOfBoundary: function(magneticAllowedOutOfBoundary)
    {
        this._magneticAllowedOutOfBoundary = magneticAllowedOutOfBoundary;
    },

    /**
     * Query whether the magnetic out of boundary is allowed.
     * @returns {boolean}
     */
    getMagneticAllowedOutOfBoundary: function()
    {
        return this._magneticAllowedOutOfBoundary;
    },

    /**
     * Changes the margin between each item.
     * @param {Number} margin
     */
    setItemsMargin: function (margin) {
        if (this._itemsMargin === margin)
            return;
        this._itemsMargin = margin;
        this._refreshViewDirty = true;
    },

    /**
     * Returns the margin between each item.
     * @returns {Number}
     */
    getItemsMargin:function(){
        return this._itemsMargin;
    },

    /**
     * Changes scroll direction of ccui.ListView.
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

    _getHowMuchOutOfBoundary: function(addition)
    {
        if(addition === undefined)
            addition = cc.p(0, 0);

        if(!this._magneticAllowedOutOfBoundary || this._items.length === 0)
        {
            return ccui.ScrollView.prototype._getHowMuchOutOfBoundary.call(this, addition);
        }
        else if(this._magneticType === ccui.ListView.MAGNETIC_NONE || this._magneticType === ccui.ListView.MAGNETIC_BOTH_END)
        {
            return ccui.ScrollView.prototype._getHowMuchOutOfBoundary.call(this, addition);
        }
        else if(addition.x === 0 && addition.y === 0 && !this._outOfBoundaryAmountDirty)
        {
            return this._outOfBoundaryAmount;
        }

        // If it is allowed to be out of boundary by magnetic, adjust the boundaries according to the magnetic type.
        var leftBoundary = this._leftBoundary;
        var rightBoundary = this._rightBoundary;
        var topBoundary = this._topBoundary;
        var bottomBoundary = this._bottomBoundary;

        var lastItemIndex = this._items.length - 1;
        var contentSize = this.getContentSize();
        var firstItemAdjustment = cc.p(0, 0);
        var lastItemAdjustment = cc.p(0, 0);

        switch (this._magneticType)
        {
            case  ccui.ListView.MAGNETIC_CENTER:
                firstItemAdjustment.x = (contentSize.width - this._items[0].width) / 2;
                firstItemAdjustment.y = (contentSize.height - this._items[0].height) / 2;

                lastItemAdjustment.x = (contentSize.width - this._items[lastItemIndex].width) / 2;
                lastItemAdjustment.y = (contentSize.height - this._items[lastItemIndex].height) / 2;

                break;
            case ccui.ListView.MAGNETIC_LEFT:
            case ccui.ListView.MAGNETIC_TOP:
                lastItemAdjustment.x = contentSize.width - this._items[lastItemIndex].width;
                lastItemAdjustment.y = contentSize.height - this._items[lastItemIndex].height;
                break;
            case ccui.ListView.MAGNETIC_RIGHT:
            case ccui.ListView.MAGNETIC_BOTTOM:
                firstItemAdjustment.x = contentSize.width - this._items[0].width;
                firstItemAdjustment.y = contentSize.height - this._items[0].height;
                break;
        }

        leftBoundary += firstItemAdjustment.x;
        rightBoundary -= lastItemAdjustment.x;
        topBoundary -= firstItemAdjustment.y;
        bottomBoundary += lastItemAdjustment.y;


        // Calculate the actual amount
        var outOfBoundaryAmount = cc.p(0, 0);

        if(this._innerContainer.getLeftBoundary() + addition.x > leftBoundary)
        {
            outOfBoundaryAmount.x = leftBoundary - (this._innerContainer.getLeftBoundary() + addition.x);
        }
        else if(this._innerContainer.getRightBoundary() + addition.x < rightBoundary)
        {
            outOfBoundaryAmount.x = rightBoundary - (this._innerContainer.getRightBoundary() + addition.x);
        }

        if(this._innerContainer.getTopBoundary() + addition.y < topBoundary)
        {
            outOfBoundaryAmount.y = topBoundary - (this._innerContainer.getTopBoundary() + addition.y);
        }
        else if(this._innerContainer.getBottomBoundary() + addition.y > bottomBoundary)
        {
            outOfBoundaryAmount.y = bottomBoundary - (this._innerContainer.getBottomBoundary() + addition.y);
        }

        if(addition.x === 0 && addition.y === 0)
        {
            this._outOfBoundaryAmount = outOfBoundaryAmount;
            this._outOfBoundaryAmountDirty = false;
        }
        return outOfBoundaryAmount;
    },

    _calculateItemPositionWithAnchor: function(item, itemAnchorPoint)
    {
        var origin = cc.p(item.getLeftBoundary(), item.getBottomBoundary());
        var size = item.getContentSize();

        return cc.p(origin. x + size.width * itemAnchorPoint.x, origin.y + size.height * itemAnchorPoint.y);
    },

    _findClosestItem: function(targetPosition, items, itemAnchorPoint, firstIndex, distanceFromFirst, lastIndex, distanceFromLast)
    {
        cc.assert(firstIndex >= 0 && lastIndex < items.length && firstIndex <= lastIndex, "");
        if (firstIndex === lastIndex)
        {
            return items[firstIndex];
        }
        if (lastIndex - firstIndex === 1)
        {
            if (distanceFromFirst <= distanceFromLast)
            {
                return items[firstIndex];
            }
            else
            {
                return items[lastIndex];
            }
        }

        // Binary search
        var midIndex = Math.floor((firstIndex + lastIndex) / 2);
        var itemPosition = this._calculateItemPositionWithAnchor(items[midIndex], itemAnchorPoint);
        var distanceFromMid = cc.pLength(cc.pSub(targetPosition, itemPosition));

        if (distanceFromFirst <= distanceFromLast)
        {
            // Left half
            return this._findClosestItem(targetPosition, items, itemAnchorPoint, firstIndex, distanceFromFirst, midIndex, distanceFromMid);
        }
        else
        {
            // Right half
            return this._findClosestItem(targetPosition, items, itemAnchorPoint, midIndex, distanceFromMid, lastIndex, distanceFromLast);
        }
    },

    /**
     * Query the closest item to a specific position in inner container.
     *
     * @param {cc.Point} targetPosition Specifies the target position in inner container's coordinates.
     * @param {cc.Point} itemAnchorPoint Specifies an anchor point of each item for position to calculate distance.
     * @returns {?ccui.Widget} A item instance if list view is not empty. Otherwise, returns null.
     */
    getClosestItemToPosition: function(targetPosition, itemAnchorPoint)
    {
        if (this._items.length === 0)
        {
            return null;
        }

        // Find the closest item through binary search
        var firstIndex = 0;
        var firstPosition = this._calculateItemPositionWithAnchor(this._items[firstIndex], itemAnchorPoint);
        var distanceFromFirst = cc.pLength(cc.pSub(targetPosition, firstPosition));

        var lastIndex = this._items.length - 1;
        var lastPosition = this._calculateItemPositionWithAnchor(this._items[lastIndex], itemAnchorPoint);
        var distanceFromLast = cc.pLength(cc.pSub(targetPosition, lastPosition));

        return this._findClosestItem(targetPosition, this._items, itemAnchorPoint, firstIndex, distanceFromFirst, lastIndex, distanceFromLast);
    },

    /**
     * Query the closest item to a specific position in current view.<br/>
     * For instance, to find the item in the center of view, call 'getClosestItemToPositionInCurrentView(cc.p(0.5, 0.5), cc.p(0.5, 0.5))'.
     *
     * @param {cc.Point} positionRatioInView Specifies the target position with ratio in list view's content size.
     * @param {cc.Point} itemAnchorPoint Specifies an anchor point of each item for position to calculate distance.
     * @returns {?ccui.Widget} A item instance if list view is not empty. Otherwise, returns null.
     */

    getClosestItemToPositionInCurrentView: function(positionRatioInView, itemAnchorPoint)
    {
        // Calculate the target position
        var contentSize = this.getContentSize();
        var targetPosition = cc.pMult(this._innerContainer.getPosition(), -1);
        targetPosition.x += contentSize.width * positionRatioInView.x;
        targetPosition.y += contentSize.height * positionRatioInView.y;

        return this.getClosestItemToPosition(targetPosition, itemAnchorPoint);
    },

    /**
     * Query the center item
     * @returns {?ccui.Widget} A item instance.
     */
    getCenterItemInCurrentView: function()
    {
        return this.getClosestItemToPositionInCurrentView(cc.p(0.5, 0.5), cc.p(0.5, 0.5));
    },

    /**
     * Query the leftmost item in horizontal list
     * @returns {?ccui.Widget} A item instance.
     */
    getLeftmostItemInCurrentView: function()
    {
        if(this._direction === ccui.ScrollView.DIR_HORIZONTAL)
        {
            return this.getClosestItemToPositionInCurrentView(cc.p(0, 0.5), cc.p(0.5, 0.5));
        }

        return null;
    },

    /**
     * Query the rightmost item in horizontal list
     * @returns {?ccui.Widget} A item instance.
     */
    getRightmostItemInCurrentView: function()
    {
        if(this._direction === ccui.ScrollView.DIR_HORIZONTAL)
        {
            return this.getClosestItemToPositionInCurrentView(cc.p(1, 0.5), cc.p(0.5, 0.5));
        }

        return null;
    },

    /**
     * Query the topmost item in horizontal list
     * @returns {?ccui.Widget} A item instance.
     */
    getTopmostItemInCurrentView: function()
    {
        if(this._direction === ccui.ScrollView.DIR_VERTICAL)
        {
            return this.getClosestItemToPositionInCurrentView(cc.p(0.5, 1), cc.p(0.5, 0.5));
        }

        return null;
    },

    /**
     * Query the topmost item in horizontal list
     * @returns {?ccui.Widget} A item instance.
     */
    getBottommostItemInCurrentView: function()
    {
        if(this._direction === ccui.ScrollView.DIR_VERTICAL)
        {
            return this.getClosestItemToPositionInCurrentView(cc.p(0.5, 0), cc.p(0.5, 0.5));
        }

        return null;
    },

    _calculateItemDestination: function(positionRatioInView, item, itemAnchorPoint)
    {
        var contentSize = this.getContentSize();
        var positionInView = cc.p(0, 0);
        positionInView.x += contentSize.width * positionRatioInView.x;
        positionInView.y += contentSize.height * positionRatioInView.y;

        var itemPosition = this._calculateItemPositionWithAnchor(item, itemAnchorPoint);
        return cc.pMult(cc.pSub(itemPosition, positionInView), -1);
    },

    jumpToBottom: function()
    {
        this.doLayout();
        ccui.ScrollView.prototype.jumpToBottom.call(this);
    },

    jumpToTop: function()
    {
        this.doLayout();
        ccui.ScrollView.prototype.jumpToTop.call(this);
    },

    jumpToLeft: function()
    {
        this.doLayout();
        ccui.ScrollView.prototype.jumpToLeft.call(this);
    },

    jumpToRight: function()
    {
        this.doLayout();
        ccui.ScrollView.prototype.jumpToRight.call(this);
    },

    jumpToTopLeft: function()
    {
        this.doLayout();
        ccui.ScrollView.prototype.jumpToTopLeft.call(this);
    },

    jumpToTopRight: function()
    {
        this.doLayout();
        ccui.ScrollView.prototype.jumpToTopRight.call(this);
    },

    jumpToBottomLeft: function()
    {
        this.doLayout();
        ccui.ScrollView.prototype.jumpToBottomLeft.call(this);
    },

    jumpToBottomRight: function()
    {
        this.doLayout();
        ccui.ScrollView.prototype.jumpToBottomRight.call(this);
    },

    jumpToPercentVertical: function(percent)
    {
        this.doLayout();
        ccui.ScrollView.prototype.jumpToPercentVertical.call(this, percent);
    },

    jumpToPercentHorizontal: function(percent)
    {
        this.doLayout();
        ccui.ScrollView.prototype.jumpToPercentHorizontal.call(this, percent);
    },

    jumpToPercentBothDirection: function(percent)
    {
        this.doLayout();
        ccui.ScrollView.prototype.jumpToPercentBothDirection.call(this, percent);
    },

    /**
     * Jump to specific item
     * @param {number} itemIndex Specifies the item's index
     * @param {cc.Point} positionRatioInView Specifies the position with ratio in list view's content size.
     * @param {cc.Point} itemAnchorPoint Specifies an anchor point of each item for position to calculate distance.
     */
    jumpToItem: function(itemIndex, positionRatioInView, itemAnchorPoint)
    {
        var item = this.getItem(itemIndex);

        if(!item)
            return;

        this.doLayout();

        var destination = this._calculateItemDestination(positionRatioInView, item, itemAnchorPoint);

        if(!this.bounceEnabled)
        {
            var delta = cc.pSub(destination, this._innerContainer.getPosition());
            var outOfBoundary = this._getHowMuchOutOfBoundary(delta);
            destination.x += outOfBoundary.x;
            destination.y += outOfBoundary.y;
        }

        this._jumpToDestination(destination);
    },

    /**
     * Scroll to specific item
     * @param {number} itemIndex Specifies the item's index
     * @param {cc.Point} positionRatioInView Specifies the position with ratio in list view's content size.
     * @param {cc.Point} itemAnchorPoint Specifies an anchor point of each item for position to calculate distance.
     * @param {number} [timeInSec = 1.0] Scroll time
     */
    scrollToItem: function(itemIndex, positionRatioInView, itemAnchorPoint, timeInSec)
    {
        if(timeInSec === undefined)
            timeInSec = 1;

        var item = this.getItem(itemIndex);

        if(!item)
            return;

        var destination = this._calculateItemDestination(positionRatioInView, item, itemAnchorPoint);
        this._startAutoScrollToDestination(destination, timeInSec, true);
    },

    /**
     * Requests refresh list view.
     * @deprecated Use method requestDoLayout() instead
     */
    requestRefreshView: function () {
        this._refreshViewDirty = true;
    },

    /**
     * Refreshes list view.
     * @deprecated Use method forceDoLayout() instead
     */
    refreshView: function () {
        this.forceDoLayout()
    },

    /**
     * provides a public _doLayout function for Editor. it calls _doLayout.
     */
    doLayout: function(){
        this._doLayout();
    },

    requestDoLayout: function()
    {
        this._refreshViewDirty = true;
    },

    _doLayout: function(){
        //ccui.Layout.prototype._doLayout.call(this);
        if (this._refreshViewDirty) {
            var locItems = this._items;
            for (var i = 0; i < locItems.length; i++) {
                var item = locItems[i];
                item.setLocalZOrder(i);
                this._remedyLayoutParameter(item);
            }
            this._updateInnerContainerSize();
            this._innerContainer.forceDoLayout();
            this._refreshViewDirty = false;
        }
    },

    /**
     * Adds event listener to ccui.ListView.
     * @param {Function} selector
     * @param {Object} [target=]
     * @deprecated since v3.0, please use addEventListener instead.
     */
    addEventListenerListView: function (selector, target) {
        this._listViewEventListener = target;
        this._listViewEventSelector = selector;
    },

    _selectedItemEvent: function (event) {
        var eventEnum = (event === ccui.Widget.TOUCH_BEGAN) ? ccui.ListView.ON_SELECTED_ITEM_START : ccui.ListView.ON_SELECTED_ITEM_END;
        if(this._listViewEventSelector){
            if (this._listViewEventListener)
                this._listViewEventSelector.call(this._listViewEventListener, this, eventEnum);
            else
                this._listViewEventSelector(this, eventEnum);
        }
        if(this._ccEventCallback)
            this._ccEventCallback(this, eventEnum);
    },

    /**
     * Intercept touch event, handle its child's touch event.
     * @param {Number} eventType
     * @param {ccui.Widget} sender
     * @param {cc.Touch} touch
     */
    interceptTouchEvent: function (eventType, sender, touch) {
        ccui.ScrollView.prototype.interceptTouchEvent.call(this, eventType, sender, touch);
        if(!this._touchEnabled)
        {
            return;
        }
        if (eventType !== ccui.Widget.TOUCH_MOVED) {
            var parent = sender;
            while (parent) {
                if (parent && parent.getParent() === this._innerContainer) {
                    this._curSelectedIndex = this.getIndex(parent);
                    break;
                }
                parent = parent.getParent();
            }
            if (sender.isHighlighted())
                this._selectedItemEvent(eventType);
        }
    },

    /**
     * Returns current selected index
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
     * Returns the "class name" of ccui.ListView.
     * @returns {string}
     */
    getDescription: function () {
        return "ListView";
    },

    _createCloneInstance: function () {
        return new ccui.ListView();
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
        }
    },

    _startAttenuatingAutoScroll: function(deltaMove, initialVelocity)
    {
        var adjustedDeltaMove = deltaMove;

        if(this._items.length !== 0 && this._magneticType !== ccui.ListView.MAGNETIC_NONE)
        {
            adjustedDeltaMove = this._flattenVectorByDirection(adjustedDeltaMove);

            var howMuchOutOfBoundary = this._getHowMuchOutOfBoundary(adjustedDeltaMove);
            // If the destination is out of boundary, do nothing here. Because it will be handled by bouncing back.
            if(howMuchOutOfBoundary.x === 0 && howMuchOutOfBoundary.y === 0 )
            {
                var magType = this._magneticType;
                if(magType === ccui.ListView.MAGNETIC_BOTH_END)
                {
                    if(this._direction === ccui.ScrollView.DIR_HORIZONTAL)
                    {
                        magType = (adjustedDeltaMove.x > 0 ? ccui.ListView.MAGNETIC_LEFT : ccui.ListView.MAGNETIC_RIGHT);
                    }
                    else if(this._direction === ccui.ScrollView.DIR_VERTICAL)
                    {
                        magType = (adjustedDeltaMove.y > 0 ? ccui.ListView.MAGNETIC_BOTTOM : ccui.ListView.MAGNETIC_TOP);
                    }
                }

                // Adjust the delta move amount according to the magnetic type
                var magneticAnchorPoint = this._getAnchorPointByMagneticType(magType);
                var magneticPosition = cc.pMult(this._innerContainer.getPosition(), -1);
                magneticPosition.x += this.width * magneticAnchorPoint.x;
                magneticPosition.y += this.height * magneticAnchorPoint.y;

                var pTargetItem = this.getClosestItemToPosition(cc.pSub(magneticPosition, adjustedDeltaMove), magneticAnchorPoint);
                var itemPosition = this._calculateItemPositionWithAnchor(pTargetItem, magneticAnchorPoint);
                adjustedDeltaMove = cc.pSub(magneticPosition, itemPosition);
            }
        }
        ccui.ScrollView.prototype._startAttenuatingAutoScroll.call(this,adjustedDeltaMove, initialVelocity);
    },

    _getAnchorPointByMagneticType: function(magneticType)
    {
        switch(magneticType)
        {
            case ccui.ListView.MAGNETIC_NONE: return cc.p(0, 0);
            case ccui.ListView.MAGNETIC_BOTH_END: return cc.p(0, 1);
            case ccui.ListView.MAGNETIC_CENTER: return cc.p(0.5, 0.5);
            case ccui.ListView.MAGNETIC_LEFT: return cc.p(0, 0.5);
            case ccui.ListView.MAGNETIC_RIGHT: return cc.p(1, 0.5);
            case ccui.ListView.MAGNETIC_TOP: return cc.p(0.5, 1);
            case ccui.ListView.MAGNETIC_BOTTOM: return cc.p(0.5, 0);
        }

        return cc.p(0, 0);
    },

    _startMagneticScroll: function()
    {
        if(this._items.length === 0 || this._magneticType === ccui.ListView.MAGNETIC_NONE)
        {
            return;
        }

        // Find the closest item
        var magneticAnchorPoint =this._getAnchorPointByMagneticType(this._magneticType);
        var magneticPosition = cc.pMult(this._innerContainer.getPosition(), -1);
        magneticPosition.x += this.width * magneticAnchorPoint.x;
        magneticPosition.y += this.height * magneticAnchorPoint.y;

        var pTargetItem = this.getClosestItemToPosition(magneticPosition, magneticAnchorPoint);
        this.scrollToItem(this.getIndex(pTargetItem), magneticAnchorPoint, magneticAnchorPoint);
    }
});

/**
 * allocates and initializes a UIListView.
 * @deprecated since v3.0, please use new ccui.ListView() instead.
 */
ccui.ListView.create = function () {
    return new ccui.ListView();
};

// Constants
//listView event type
/**
 * The flag selected item of ccui.ListView's event.
 * @constant
 * @type {number}
 */
ccui.ListView.EVENT_SELECTED_ITEM = 0;

/**
 * The flag selected item start of ccui.ListView's event.
 * @constant
 * @type {number}
 */
ccui.ListView.ON_SELECTED_ITEM_START = 0;
/**
 * The flag selected item end of ccui.ListView's event.
 * @constant
 * @type {number}
 */
ccui.ListView.ON_SELECTED_ITEM_END = 1;

//listView gravity
/**
 * The left flag of ccui.ListView's gravity.
 * @constant
 * @type {number}
 */
ccui.ListView.GRAVITY_LEFT = 0;
/**
 * The right flag of ccui.ListView's gravity.
 * @constant
 * @type {number}
 */
ccui.ListView.GRAVITY_RIGHT = 1;
/**
 * The center horizontal flag of ccui.ListView's gravity.
 * @constant
 * @type {number}
 */
ccui.ListView.GRAVITY_CENTER_HORIZONTAL = 2;
/**
 * The top flag of ccui.ListView's gravity.
 * @constant
 * @type {number}
 */
ccui.ListView.GRAVITY_TOP = 3;
/**
 * The bottom flag of ccui.ListView's gravity.
 * @constant
 * @type {number}
 */
ccui.ListView.GRAVITY_BOTTOM = 4;
/**
 * The center vertical flag of ccui.ListView's gravity.
 * @constant
 * @type {number}
 */
ccui.ListView.GRAVITY_CENTER_VERTICAL = 5;

/**
 * The flag of ccui.ListView's magnetic none type.
 * @constant
 * @type {number}
 */
ccui.ListView.MAGNETIC_NONE = 0;
/**
 * The flag of ccui.ListView's magnetic center type.<br/>
 * ListView tries to align its items in center of current view.
 * @constant
 * @type {number}
 */
ccui.ListView.MAGNETIC_CENTER = 1;
/**
 * The flag of ccui.ListView's magnetic both end type.<br/>
 * ListView tries to align its items in left or right end if it is horizontal, top or bottom in vertical. <br/>
 * The aligning side (left or right, top or bottom) is determined by user's scroll direction.
 * @constant
 * @type {number}
 */
ccui.ListView.MAGNETIC_BOTH_END = 2;
/**
 * The flag of ccui.ListView's magnetic left type.
 * @constant
 * @type {number}
 */
ccui.ListView.MAGNETIC_LEFT = 3;
/**
 * The flag of ccui.ListView's magnetic right type.
 * @constant
 * @type {number}
 */
ccui.ListView.MAGNETIC_RIGHT = 4;
/**
 * The flag of ccui.ListView's magnetic top type.
 * @constant
 * @type {number}
 */
ccui.ListView.MAGNETIC_TOP = 5;
/**
 * The flag of ccui.ListView's magnetic bottom type.
 * @constant
 * @type {number}
 */
ccui.ListView.MAGNETIC_BOTTOM = 6;