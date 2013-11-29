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

/**
 * PageView event type
 * @type {Object}
 */
ccs.PageViewEventType = {
    turning: 0
};

/**
 * PageView touch direction
 * @type {Object}
 */
ccs.PVTouchDir = {
    touchLeft: 0,
    touchRight: 1
};

/**
 * Base class for ccs.UIPageView
 * @class
 * @extends ccs.UILayout
 */
ccs.UIPageView = ccs.UILayout.extend(/** @lends ccs.UIPageView# */{
    _curPageIdx: 0,
    _pages: null,
    _touchMoveDir: null,
    _touchStartLocation: 0,
    _touchEndLocation: 0,
    _touchMoveStartLocation: 0,
    _movePagePoint: null,
    _leftChild: null,
    _rightChild: null,
    _leftBoundary: 0,
    _rightBoundary: 0,
    _isAutoScrolling: false,
    _autoScrollDistance: 0,
    _autoScrollSpeed: 0,
    _autoScrollDir: 0,
    _childFocusCancelOffset: 0,
    _pageViewEventListener: null,
    _pageViewEventSelector: null,
    ctor: function () {
        ccs.UILayout.prototype.ctor.call(this);
        this._curPageIdx = 0;
        this._pages = [];
        this._touchMoveDir = ccs.PVTouchDir.touchLeft;
        this._touchStartLocation = 0;
        this._touchEndLocation = 0;
        this._touchMoveStartLocation = 0;
        this._movePagePoint = null;
        this._leftChild = null;
        this._rightChild = null;
        this._leftBoundary = 0;
        this._rightBoundary = 0;
        this._isAutoScrolling = false;
        this._autoScrollDistance = 0;
        this._autoScrollSpeed = 0;
        this._autoScrollDir = 0;
        this._childFocusCancelOffset = 5;
        this._pageViewEventListener = null;
        this._pageViewEventSelector = null;
    },

    init: function () {
        if (ccs.UILayout.prototype.init.call(this)) {
            this._pages = [];
            this.setClippingEnabled(true);
            this.setUpdateEnabled(true);
            this.setTouchEnabled(true);
            return true;
        }
        return false;
    },

    /**
     * Add a widget to a page of pageview.
     * @param {ccs.UIWidget} widget
     * @param {number} pageIdx
     * @param {Boolean} forceCreate
     */
    addWidgetToPage: function (widget, pageIdx, forceCreate) {
        if (!widget) {
            return;
        }
        if(pageIdx<0){
            return;
        }
        var pageCount = this._pages.length;
        if (pageIdx >= pageCount) {
            if (forceCreate) {
                if (pageIdx > pageCount) {
                    cc.log("pageIdx is %d, it will be added as page id [%d]", pageIdx, pageCount);
                }
                var newPage = this.createPage();
                newPage.addChild(widget);
                this.addPage(newPage);
            }
        }
        else {
            var page = this._pages[pageIdx];
            if (page) {
                page.addChild(widget);
            }
        }
    },

    /**
     * create page
     * @returns {ccs.UILayout}
     */
    createPage: function () {
        var newPage = ccs.UILayout.create();
        newPage.setSize(this.getSize());
        return newPage;
    },

    /**
     * Push back a page to pageview.
     * @param {ccs.UILayout} page
     */
    addPage: function (page) {
        if (!page) {
            return;
        }
        if (page.getWidgetType() != ccs.WidgetType.container) {
            return;
        }
        if (cc.ArrayContainsObject(this._pages, page)) {
            return;
        }
        var pSize = page.getSize();
        var pvSize = this.getSize();
        if (!(pSize.width==pvSize.width&&pSize.height==pvSize.height)) {
            cc.log("page size does not match pageview size, it will be force sized!");
            page.setSize(pvSize);
        }
        page.setPosition(cc.p(this.getPositionXByIndex(this._pages.length), 0));
        this._pages.push(page);
        this.addChild(page);
        this.updateBoundaryPages();
    },

    /**
     * Inert a page to pageview.
     * @param {ccs.UILayout} page
     * @param {Number} idx
     */
    insertPage: function (page, idx) {
        if (idx < 0) {
            return;
        }
        if (!page) {
            return;
        }
        if (page.getWidgetType() != ccs.WidgetType.container) {
            return;
        }
        if (cc.ArrayContainsObject(this._pages, page)) {
            return;
        }

        var pageCount = this._pages.length;
        if (idx >= pageCount) {
            this.addPage(page);
        }
        else {
            cc.ArrayAppendObjectToIndex(this._pages, page, idx);
            page.setPosition(cc.p(this.getPositionXByIndex(idx), 0));
            this.addChild(page);
            var pSize = page.getSize();
            var pvSize = this.getSize();
            if (!pSize.equals(pvSize)) {
                cc.log("page size does not match pageview size, it will be force sized!");
                page.setSize(pvSize);
            }
            var arrayPages = this._pages;
            var length = arrayPages.length;
            for (var i = (idx + 1); i < length; i++) {
                var behindPage = arrayPages[i];
                var formerPos = behindPage.getPosition();
                behindPage.setPosition(cc.p(formerPos.x + this.getSize().width, 0));
            }
            this.updateBoundaryPages();
        }
    },

    /**
     * Remove a page of pageview.
     * @param {ccs.UILayout} page
     */
    removePage: function (page) {
        if (!page) {
            return;
        }
        this.removeChild(page);
        this.updateChildrenPosition();
        this.updateBoundaryPages();
    },

    /**
     * Remove a page at index of pageview.
     * @param {number} index
     */
    removePageAtIndex: function (index) {
        if (index < 0 || index >= this._pages.length) {
            return;
        }
        var page = this._pages[index];
        if (page) {
            this.removePage(page);
        }
    },

    updateBoundaryPages: function () {
        if (this._pages.length <= 0) {
            this._leftChild = null;
            this._rightChild = null;
            return;
        }
        this._leftChild = this._pages[0];
        this._rightChild = this._pages[this._pages.length-1];
    },

    /**
     * Get x position by index
     * @param {number} idx
     * @returns {number}
     */
    getPositionXByIndex: function (idx) {
        return (this.getSize().width * (idx - this._curPageIdx));
    },

    /**
     * Add widget
     * @param {ccs.UIWidget} widget
     * @returns {boolean}
     */
    addChild: function (widget) {
        return ccs.UILayout.prototype.addChild.call(this, widget);
    },

    /**
     *  remove widget child override
     * @param {ccs.UIWidget} child
     * @returns {boolean}
     */
    removeChild: function (widget) {
        if (cc.ArrayContainsObject(this._pages, widget)) {
            cc.ArrayRemoveObject(this._pages, widget);
            return ccs.UILayout.prototype.removeChild.call(this, widget);
        }
        return false;
    },

    onSizeChanged: function () {
        ccs.UILayout.prototype.onSizeChanged.call(this);
        this._rightBoundary = this.getSize().width;
        this.updateChildrenSize();
        this.updateChildrenPosition();
    },

    updateChildrenSize: function () {
        if (!this._pages.length <= 0) {
            return;
        }

        var selfSize = this.getSize();
        for (var i = 0; i < this._pages.length; i++) {
            var page = this._pages[i];
            page.setSize(selfSize);
        }
    },

    updateChildrenPosition: function () {
        if (!this._pages) {
            return;
        }

        var pageCount = this._pages.length;
        if (pageCount <= 0) {
            this._curPageIdx = 0;
            return;
        }
        if (this._curPageIdx >= pageCount) {
            this._curPageIdx = pageCount - 1;
        }
        var pageWidth = this.getSize().width;
        var arrayPages = this._pages;
        for (var i = 0; i < pageCount; i++) {
            var page = arrayPages[i];
            page.setPosition(cc.p((i - this._curPageIdx) * pageWidth, 0));
        }
    },

    removeAllChildren: function () {
        this._pages = [];
        ccs.UILayout.prototype.removeAllChildren.call(this);
    },

    /**
     * scroll pageview to index.
     * @param {number} idx
     */
    scrollToPage: function (idx) {
        if (idx < 0 || idx >= this._pages.length) {
            return;
        }
        this._curPageIdx = idx;
        var curPage = this._pages[idx];
        this._autoScrollDistance = -(curPage.getPosition().x);
        this._autoScrollSpeed = Math.abs(this._autoScrollDistance) / 0.2;
        this._autoScrollDir = this._autoScrollDistance > 0 ? 1 : 0;
        this._isAutoScrolling = true;
    },

    update: function (dt) {
        if (this._isAutoScrolling) {
            switch (this._autoScrollDir) {
                case 0:
                    var step = this._autoScrollSpeed * dt;
                    if (this._autoScrollDistance + step >= 0.0) {
                        step = -this._autoScrollDistance;
                        this._autoScrollDistance = 0.0;
                        this._isAutoScrolling = false;
                    }
                    else {
                        this._autoScrollDistance += step;
                    }
                    this.scrollPages(-step);
                    if(!this._isAutoScrolling){
                        this.pageTurningEvent();
                    }
                    break;
                    break;
                case 1:
                    var step = this._autoScrollSpeed * dt;
                    if (this._autoScrollDistance - step <= 0.0) {
                        step = this._autoScrollDistance;
                        this._autoScrollDistance = 0.0;
                        this._isAutoScrolling = false;
                    }
                    else {
                        this._autoScrollDistance -= step;
                    }
                    this.scrollPages(step);
                    if(!this._isAutoScrolling){
                        this.pageTurningEvent();
                    }
                    break;
                default:
                    break;
            }
        }
    },

    onTouchBegan: function (touchPoint) {
        var pass = ccs.UILayout.prototype.onTouchBegan.call(this, touchPoint);
        this.handlePressLogic(touchPoint);
        return pass;
    },

    onTouchMoved: function (touchPoint) {
        this._touchMovePos.x = touchPoint.x;
        this._touchMovePos.y = touchPoint.y;
        this.handleMoveLogic(touchPoint);
        if (this._widgetParent) {
            this._widgetParent.checkChildInfo(1, this, touchPoint);
        }
        this.moveEvent();
        if (!this.hitTest(touchPoint)) {
            this.setFocused(false);
            this.onTouchEnded(touchPoint);
        }
    },

    onTouchEnded: function (touchPoint) {
        ccs.UILayout.prototype.onTouchEnded.call(this, touchPoint);
        this.handleReleaseLogic(touchPoint);
    },

    movePages: function (offset) {
        var arrayPages = this._pages;
        var length = arrayPages.length;
        for (var i = 0; i < length; i++) {
            var child = arrayPages[i];
            var pos = child.getPosition();
            child.setPosition(cc.p(pos.x + offset, pos.y));
        }
    },

    scrollPages: function (touchOffset) {
        if (this._pages.length <= 0) {
            return false;
        }

        if (!this._leftChild || !this._rightChild) {
            return false;
        }

        var realOffset = touchOffset;

        switch (this._touchMoveDir) {
            case ccs.PVTouchDir.touchLeft: // left
                if (this._rightChild.getRightInParent() + touchOffset <= this._rightBoundary) {
                    realOffset = this._rightBoundary - this._rightChild.getRightInParent();
                    this.movePages(realOffset);
                    return false;
                }
                break;

            case ccs.PVTouchDir.touchRight: // right
                if (this._leftChild.getLeftInParent() + touchOffset >= this._leftBoundary) {
                    realOffset = this._leftBoundary - this._leftChild.getLeftInParent();
                    this.movePages(realOffset);
                    return false;
                }
                break;
            default:
                break;
        }

        this.movePages(realOffset);
        return true;
    },

    onTouchCancelled: function (touchPoint) {
        ccs.UILayout.prototype.onTouchCancelled.call(this, touchPoint);
    },

    handlePressLogic: function (touchPoint) {
        var nsp = this._renderer.convertToNodeSpace(touchPoint);
        this._touchMoveStartLocation = nsp.x;
        this._touchStartLocation = nsp.x;
    },

    handleMoveLogic: function (touchPoint) {
        var nsp = this._renderer.convertToNodeSpace(touchPoint);
        var offset = 0.0;
        var moveX = nsp.x;
        offset = moveX - this._touchMoveStartLocation;
        this._touchMoveStartLocation = moveX;
        if (offset < 0) {
            this._touchMoveDir = ccs.PVTouchDir.touchLeft;
        }
        else if (offset > 0) {
            this._touchMoveDir = ccs.PVTouchDir.touchRight;
        }
        this.scrollPages(offset);
    },

    handleReleaseLogic: function (touchPoint) {
        if (this._pages.length <= 0) {
            return;
        }
        var curPage = this._pages[this._curPageIdx];
        if (curPage) {
            var curPagePos = curPage.getPosition();
            var pageCount = this._pages.length;
            var curPageLocation = curPagePos.x;
            var pageWidth = this.getSize().width;
            var boundary = pageWidth / 2.0;
            if (curPageLocation <= -boundary) {
                if (this._curPageIdx >= pageCount - 1)
                    this.scrollPages(-curPageLocation);
                else
                    this.scrollToPage(this._curPageIdx + 1);
            }
            else if (curPageLocation >= boundary) {
                if (this._curPageIdx <= 0)
                    this.scrollPages(-curPageLocation);
                else
                    this.scrollToPage(this._curPageIdx - 1);
            }
            else {
                this.scrollToPage(this._curPageIdx);
            }
        }
    },

    checkChildInfo: function (handleState, sender, touchPoint) {
        this.interceptTouchEvent(handleState, sender, touchPoint);
    },

    interceptTouchEvent: function (handleState, sender, touchPoint) {
        switch (handleState) {
            case 0:
                this.handlePressLogic(touchPoint);
                break;
            case 1:
                var offset = 0;
                offset = Math.abs(sender.getTouchStartPos().x - touchPoint.x);
                if (offset > this._childFocusCancelOffset) {
                    sender.setFocused(false);
                    this.handleMoveLogic(touchPoint);
                }
                break;
            case 2:
                this.handleReleaseLogic(touchPoint);
                break;

            case 3:
                break;
        }
    },

    pageTurningEvent: function () {
        if (this._pageViewEventListener && this._pageViewEventSelector) {
            this._pageViewEventSelector.call(this._pageViewEventListener, this, ccs.PageViewEventType.turning);
        }
    },

    /**
     * @param {Function} selector
     * @param {Object} target
     */
    addEventListenerPageView: function (selector, target) {
        this._pageViewEventSelector = selector;
        this._pageViewEventListener = target;
    },

    /**
     * get pages
     * @returns {Array}
     */
    getPages:function(){
        return this._pages;
    },

    /**
     * get cur page index
     * @returns {number}
     */
    getCurPageIndex: function () {
        return this._curPageIdx;
    },

    /**
     * Returns the "class name" of widget.
     * @returns {string}
     */
    getDescription: function () {
        return "PageView";
    },

    createCloneInstance: function () {
        return ccs.UIPageView.create();
    },

    copyClonedWidgetChildren: function (model) {
        var arrayPages = model.getPages();
        for (var i = 0; i < arrayPages.length; i++) {
            var page = arrayPages[i];
            this.addPage(page.clone());
        }
    },

    copySpecialProperties: function (pageView) {
        ccs.UILayout.prototype.copySpecialProperties.call(this, pageView);
    }
});
/**
 * allocates and initializes a UIPageView.
 * @constructs
 * @return {ccs.UIPageView}
 * @example
 * // example
 * var uiPageView = ccs.UIPageView.create();
 */
ccs.UIPageView.create = function () {
    var uiPageView = new ccs.UIPageView();
    if (uiPageView && uiPageView.init()) {
        return uiPageView;
    }
    return null;
};