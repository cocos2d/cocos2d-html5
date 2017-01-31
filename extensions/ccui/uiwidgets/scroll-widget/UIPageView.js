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
 * The PageView control of Cocos UI.
 * @class
 * @extends ccui.ListView
 * @example
 * var pageView = new ccui.PageView();
 * pageView.setTouchEnabled(true);
 * pageView.addPage(new ccui.Layout());
 * this.addChild(pageView);
 */
ccui.PageView = ccui.ListView.extend(/** @lends ccui.PageView# */{
    _curPageIdx: 0,
    _childFocusCancelOffset: 0,
    _pageViewEventListener: null,
    _pageViewEventSelector: null,
    _className: "PageView",

    _indicator: null,
    _indicatorPositionAsAnchorPoint: null,
    /**
     * Allocates and initializes a UIPageView.
     * Constructor of ccui.PageView. please do not call this function by yourself, you should pass the parameters to constructor to initialize it .
     * @example
     * // example
     * var uiPageView = new ccui.PageView();
     */
    ctor: function () {
        ccui.ListView.prototype.ctor.call(this);

        this._childFocusCancelOffset = 5;
        this._indicatorPositionAsAnchorPoint = cc.p(0.5, 0.1);
        this._pageViewEventListener = null;
        this._pageViewEventSelector = null;

        this.setDirection(ccui.ScrollView.DIR_HORIZONTAL);
        this.setMagneticType(ccui.ListView.MAGNETIC_CENTER);
        this.setScrollBarEnabled(false);
    },

    /**
     * Add a widget to a page of PageView.
     * @deprecated since v3.9, please use 'insertPage(Widget* page, int idx)' instead.
     * @param {ccui.Widget} widget widget to be added to PageView.
     * @param {number} pageIdx index of page.
     * @param {Boolean} forceCreate if force create and there is no page exist, PageView would create a default page for adding widget.
     */
    addWidgetToPage: function (widget, pageIdx, forceCreate) {
        this.insertCustomItem(widget, pageIdx);
    },

    /**
     * Insert a page into the end of PageView.
     * @param {ccui.Widget} page Page to be inserted.
     */
    addPage: function (page) {
        this.pushBackCustomItem(page);
    },

    /**
     * Insert a page into PageView at a given index.
     * @param {ccui.Widget} page Page to be inserted.
     * @param {number} idx A given index.
     */
    insertPage: function (page, idx) {
        this.insertCustomItem(page, idx);
    },

    /**
     * Removes a page from PageView.
     * @param {ccui.Widget} page Page to be removed.
     */
    removePage: function (page) {
        this.removeItem(this.getIndex(page));
    },

    /**
     * Removes a page at index of PageView.
     * @param {number} index A given index.
     */
    removePageAtIndex: function (index) {
        this.removeItem(index);
    },

    /**
     * Removes all pages from PageView
     */
    removeAllPages: function () {
        this.removeAllItems();
    },

    /**
     * scroll PageView to index.
     * @param {number} idx A given index in the PageView. Index start from 0 to pageCount -1.
     */
    scrollToItem: function (idx) {
        ccui.ListView.prototype.scrollToItem.call(this, idx, cc.p(0.5, 0.5), cc.p(0.5, 0.5));
    },

    /**
     * scroll PageView to index.
     * @param {number} idx A given index in the PageView. Index start from 0 to pageCount -1.
     */
    scrollToPage: function (idx) {
        this.scrollToItem(idx);
    },


    _doLayout: function () {
        if (!this._refreshViewDirty)
            return;

        ccui.ListView.prototype._doLayout.call(this);

        if (this._indicator) {
            var index = this.getIndex(this.getCenterItemInCurrentView());
            this._indicator.indicate(index);
        }

        this._refreshViewDirty = false;
    },

    /**
     * Changes scroll direction of ccui.PageView.
     * @param {ccui.ScrollView.DIR_NONE | ccui.ScrollView.DIR_VERTICAL | ccui.ScrollView.DIR_HORIZONTAL | ccui.ScrollView.DIR_BOTH} direction
     */
    setDirection: function (direction) {
        ccui.ListView.prototype.setDirection.call(this, direction);
        if (direction === ccui.ScrollView.DIR_HORIZONTAL) {
            this._indicatorPositionAsAnchorPoint = cc.p(0.5, 0.1);
        }
        else if (direction === ccui.ScrollView.DIR_VERTICAL) {
            this._indicatorPositionAsAnchorPoint = cc.p(0.1, 0.5);
        }

        if (this._indicator) {
            this._indicator.setDirection(direction);
            this._refreshIndicatorPosition();
        }
    },

    /**
     * Set custom scroll threshold to page view. If you don't specify the value, the pageView will scroll when half page view width reached.
     * @since v3.2
     * @param threshold
     * @deprecated Since v3.9, this method has no effect.
     */
    setCustomScrollThreshold: function (threshold) {

    },

    /**
     * Returns user defined scroll page threshold.
     * @since v3.2
     * @deprecated Since v3.9, this method always returns 0.
     */
    getCustomScrollThreshold: function () {
        return 0;
    },

    /**
     * Set using user defined scroll page threshold or not. If you set it to false, then the default scroll threshold is pageView.width / 2.
     * @since v3.2
     * @deprecated Since v3.9, this method has no effect.
     */
    setUsingCustomScrollThreshold: function (flag) {
    },

    /**
     * Queries whether we are using user defined scroll page threshold or not
     * @deprecated Since v3.9, this method always returns false.
     */
    isUsingCustomScrollThreshold: function () {
        return false;
    },

    _moveInnerContainer: function (deltaMove, canStartBounceBack) {
        ccui.ListView.prototype._moveInnerContainer.call(this, deltaMove, canStartBounceBack);
        this._curPageIdx = this.getIndex(this.getCenterItemInCurrentView());
        if (this._indicator) {
            this._indicator.indicate(this._curPageIdx);
        }
    },

    _onItemListChanged: function () {
        ccui.ListView.prototype._onItemListChanged.call(this);
        if (this._indicator) {
            this._indicator.reset(this._items.length);
        }
    },

    _onSizeChanged: function () {
        ccui.ListView.prototype._onSizeChanged.call(this);
        this._refreshIndicatorPosition();
    },

    _remedyLayoutParameter: function (item) {
        item.setContentSize(this.getContentSize());
        ccui.ListView.prototype._remedyLayoutParameter.call(this, item);
    },

    _refreshIndicatorPosition: function () {
        if (this._indicator) {
            var contentSize = this.getContentSize();
            var posX = contentSize.width * this._indicatorPositionAsAnchorPoint.x;
            var posY = contentSize.height * this._indicatorPositionAsAnchorPoint.y;
            this._indicator.setPosition(cc.p(posX, posY));
        }
    },

    _handleReleaseLogic: function (touchPoint) {

        ccui.ScrollView.prototype._handleReleaseLogic.call(this, touchPoint);

        if (this._items.length <= 0)
            return;

        var touchMoveVelocity = this._flattenVectorByDirection(this._calculateTouchMoveVelocity());

        var INERTIA_THRESHOLD = 500;
        if (cc.pLength(touchMoveVelocity) < INERTIA_THRESHOLD) {
            this._startMagneticScroll();
        }
        else {
            // Handle paging by inertia force.
            var currentPage = this.getItem(this._curPageIdx);
            var destination = this._calculateItemDestination(cc.p(0.5, 0.5), currentPage, cc.p(0.5, 0.5));
            var deltaToCurrentPage = cc.pSub(destination, this.getInnerContainerPosition());
            deltaToCurrentPage = this._flattenVectorByDirection(deltaToCurrentPage);

            // If the direction of displacement to current page and the direction of touch are same, just start magnetic scroll to the current page.
            // Otherwise, move to the next page of touch direction.
            if (touchMoveVelocity.x * deltaToCurrentPage.x > 0 || touchMoveVelocity.y * deltaToCurrentPage.y > 0) {
                this._startMagneticScroll();
            }
            else {
                if (touchMoveVelocity.x < 0 || touchMoveVelocity.y > 0) {
                    ++this._curPageIdx;
                }
                else {
                    --this._curPageIdx;
                }
                this._curPageIdx = Math.min(this._curPageIdx, this._items.length);
                this._curPageIdx = Math.max(this._curPageIdx, 0);
                this.scrollToItem(this._curPageIdx);
            }
        }

    },

    _getAutoScrollStopEpsilon: function () {
        return 0.001;
    },

    _pageTurningEvent: function () {
        if (this._pageViewEventSelector) {
            if (this._pageViewEventListener)
                this._pageViewEventSelector.call(this._pageViewEventListener, this, ccui.PageView.EVENT_TURNING);
            else
                this._pageViewEventSelector(this, ccui.PageView.EVENT_TURNING);
        }
        if (this._ccEventCallback)
            this._ccEventCallback(this, ccui.PageView.EVENT_TURNING);
    },

    /**
     * Adds event listener to ccui.PageView.
     * @param {Function} selector
     * @param {Object} [target=]
     * @deprecated since v3.0, please use addEventListener instead.
     */
    addEventListenerPageView: function (selector, target) {
        this._pageViewEventSelector = selector;
        this._pageViewEventListener = target;
    },

    addEventListener: function (selector) {
        this._ccEventCallback = function (ref, eventType) {
            if (eventType == ccui.ScrollView.EVENT_AUTOSCROLL_ENDED)
                selector(this, eventType)
        };
    },

    /**
     * Jump to a page with a given index without scrolling.
     * This is the different between scrollToPage.
     * @param {number} index A given index in PageView. Index start from 0 to pageCount -1.
     */
    setCurrentPageIndex: function (index) {
        this.jumpToItem(index, cc.p(0.5, 0.5), cc.p(0.5, 0.5));
    },

    /**
     * Jump to a page with a given index without scrolling.
     * This is the different between scrollToPage.
     * @param {number} index A given index in PageView. Index start from 0 to pageCount -1.
     * @deprecated since v3.9, this is deprecated. Use `setCurrentPageIndex()` instead.
     */
    setCurPageIndex: function (index) {
        this.setCurrentPageIndex(index);
    },

    /**
     * Returns current page index
     * @returns {number}
     */
    getCurrentPageIndex: function () {
        return this._curPageIdx;
    },

    /**
     * Returns current page index
     * @deprecated since v3.9, this is deprecated. Use `getCurrentPageIndex()` instead.
     * @returns {number}
     */
    getCurPageIndex: function () {
        var widget = this.getCenterItemInCurrentView();
        return this.getIndex(widget);
    },

    /**
     * Returns all pages of PageView
     * @returns {Array}
     */
    getPages: function () {
        return this.getItems();
    },

    /**
     * Returns a page from PageView by index
     * @param {Number} index
     * @returns {ccui.Layout}
     */
    getPage: function (index) {
        return this.getItem(index);
    },

    /**
     * Returns the "class name" of ccui.PageView.
     * @returns {string}
     */
    getDescription: function () {
        return "PageView";
    },

    _createCloneInstance: function () {
        return new ccui.PageView();
    },

    _copyClonedWidgetChildren: function (model) {
        var arrayPages = model.getPages();
        for (var i = 0; i < arrayPages.length; i++) {
            var page = arrayPages[i];
            this.addPage(page.clone());
        }
    },

    _copySpecialProperties: function (pageView) {
        ccui.ListView.prototype._copySpecialProperties.call(this, pageView);
        this._ccEventCallback = pageView._ccEventCallback;
        this._pageViewEventListener = pageView._pageViewEventListener;
        this._pageViewEventSelector = pageView._pageViewEventSelector;
        this._customScrollThreshold = pageView._customScrollThreshold;
    },


    /**
     * Toggle page indicator enabled.
     * @param {boolean} enabled True if enable page indicator, false otherwise.
     */
    setIndicatorEnabled: function (enabled) {
        if (enabled == (this._indicator !== null)) {
            return;
        }

        if (!enabled) {
            this.removeProtectedChild(this._indicator);
            this._indicator = null;
        }
        else {
            this._indicator = new ccui.PageViewIndicator();
            this._indicator.setDirection(this.getDirection());
            this.addProtectedChild(this._indicator, 10000);
            this.setIndicatorSelectedIndexColor(cc.color(100, 100, 255));
            this._refreshIndicatorPosition();
        }
    },

    /**
     * Query page indicator state.
     * @returns {boolean} True if page indicator is enabled, false otherwise.
     */
    getIndicatorEnabled: function () {
        return this._indicator !== null;
    },

    /**
     * Set the page indicator's position using anchor point.
     * @param {cc.Point} positionAsAnchorPoint The position as anchor point.
     */
    setIndicatorPositionAsAnchorPoint: function (positionAsAnchorPoint) {
        this._indicatorPositionAsAnchorPoint = positionAsAnchorPoint;
        this._refreshIndicatorPosition();
    },

    /**
     * Get the page indicator's position as anchor point.
     * @returns {cc.Point}
     */
    getIndicatorPositionAsAnchorPoint: function () {
        return this._indicatorPositionAsAnchorPoint;
    },

    /**
     * Set the page indicator's position in page view.
     * @param {cc.Point} position The position in page view
     */
    setIndicatorPosition: function (position) {
        if (this._indicator) {
            var contentSize = this.getContentSize();
            this._indicatorPositionAsAnchorPoint.x = position.x / contentSize.width;
            this._indicatorPositionAsAnchorPoint.y = position.y / contentSize.height;
            this._indicator.setPosition(position);
        }
    },

    /**
     * Get the page indicator's position.
     * @returns {cc.Point}
     */
    getIndicatorPosition: function () {
        cc.assert(this._indicator !== null, "");
        return this._indicator.getPosition();
    },

    /**
     * Set space between page indicator's index nodes.
     * @param {number} spaceBetweenIndexNodes Space between nodes in pixel.
     */
    setIndicatorSpaceBetweenIndexNodes: function (spaceBetweenIndexNodes) {
        if (this._indicator) {
            this._indicator.setSpaceBetweenIndexNodes(spaceBetweenIndexNodes);
        }
    },

    /**
     * Get the space between page indicator's index nodes.
     * @returns {number}
     */
    getIndicatorSpaceBetweenIndexNodes: function () {
        cc.assert(this._indicator !== null, "");
        return this._indicator.getSpaceBetweenIndexNodes();
    },

    /**
     * Set color of page indicator's selected index.
     * @param {cc.Color} color Color for indicator
     */
    setIndicatorSelectedIndexColor: function (color) {
        if (this._indicator) {
            this._indicator.setSelectedIndexColor(color);
        }
    },

    /**
     * Get the color of page indicator's selected index.
     * @returns {cc.Color}
     */
    getIndicatorSelectedIndexColor: function () {
        cc.assert(this._indicator !== null, "");
        return this._indicator.getSelectedIndexColor();
    },

    /**
     * Set color of page indicator's index nodes.
     * @param {cc.Color} color Color for indicator
     */
    setIndicatorIndexNodesColor: function (color) {
        if (this._indicator) {
            this._indicator.setIndexNodesColor(color);
        }
    },

    /**
     * Get the color of page indicator's index nodes.
     * @returns {cc.Color}
     */
    getIndicatorIndexNodesColor: function () {
        cc.assert(this._indicator !== null, "");
        return this._indicator.getIndexNodesColor();
    },

    /**
     * Set scale of page indicator's index nodes.
     * @param {Number} scale Scale for indicator
     */
    setIndicatorIndexNodesScale: function (indexNodesScale) {
        if (this._indicator) {
            this._indicator.setIndexNodesScale(indexNodesScale);
            this._indicator.indicate(this._curPageIdx);
        }
    },

    /**
     * Get the scale of page indicator's index nodes.
     * @returns {Number}
     */
    getIndicatorIndexNodesScale: function () {
        cc.assert(this._indicator !== null, "");
        return this._indicator.getIndexNodesScale();
    },

    /**
     * Sets texture of indicator index nodes
     * @param {String} texName
     * @param {ccui.Widget.LOCAL_TEXTURE | ccui.Widget.PLIST_TEXTURE} [texType = ccui.Widget.LOCAL_TEXTURE]
     */
    setIndicatorIndexNodesTexture: function (texName, texType) {
        if (this._indicator) {
            this._indicator.setIndexNodesTexture(texName, texType);
            this._indicator.indicate(this._curPageIdx);
        }
    }
});
/**
 * allocates and initializes a UIPageView.
 * @deprecated since v3.0, please use new ccui.PageView() instead.
 * @return {ccui.PageView}
 */
ccui.PageView.create = function () {
    return new ccui.PageView();
};

// Constants
//PageView event
/**
 * The turning flag of ccui.PageView's event.
 * @constant
 * @type {number}
 */
ccui.PageView.EVENT_TURNING = 0;

//PageView touch direction
/**
 * The left flag of ccui.PageView's touch direction.
 * @constant
 * @type {number}
 */
ccui.PageView.TOUCH_DIR_LEFT = 0;
/**
 * The right flag of ccui.PageView's touch direction.
 * @constant
 * @type {number}
 */
ccui.PageView.TOUCH_DIR_RIGHT = 1;

//PageView auto scroll direction
/**
 * The right flag of ccui.PageView's auto scroll direction.
 * @constant
 * @type {number}
 */
ccui.PageView.DIRECTION_LEFT = 0;
/**
 * The right flag of ccui.PageView's auto scroll direction.
 * @constant
 * @type {number}
 */
ccui.PageView.DIRECTION_RIGHT = 1;
