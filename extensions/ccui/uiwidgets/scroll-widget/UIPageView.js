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
 * Base class for ccui.PageView
 * @class
 * @extends ccui.Layout
 */
ccui.PageView = ccui.Layout.extend(/** @lends ccui.PageView# */{
    _curPageIdx: 0,
    _pages: null,
    _touchMoveDirection: null,
    _touchStartLocation: 0,
    _touchMoveStartLocation: 0,
    _movePagePoint: null,
    _leftBoundaryChild: null,
    _rightBoundaryChild: null,
    _leftBoundary: 0,
    _rightBoundary: 0,
    _isAutoScrolling: false,
    _autoScrollDistance: 0,
    _autoScrollSpeed: 0,
    _autoScrollDirection: 0,
    _childFocusCancelOffset: 0,
    _pageViewEventListener: null,
    _pageViewEventSelector: null,
    _className:"PageView",
    _eventCallback: null,

    /**
     * allocates and initializes a UIPageView.
     * Constructor of ccui.PageView
     * @example
     * // example
     * var uiPageView = new ccui.PageView();
     */
    ctor: function () {
        ccui.Layout.prototype.ctor.call(this);
        this._curPageIdx = 0;
        this._pages = [];
        this._touchMoveDirection = ccui.PageView.TOUCH_DIR_LEFT;
        this._touchStartLocation = 0;
        this._touchMoveStartLocation = 0;
        this._movePagePoint = null;
        this._leftBoundaryChild = null;
        this._rightBoundaryChild = null;
        this._leftBoundary = 0;
        this._rightBoundary = 0;
        this._isAutoScrolling = false;
        this._autoScrollDistance = 0;
        this._autoScrollSpeed = 0;
        this._autoScrollDirection = 0;
        this._childFocusCancelOffset = 5;
        this._pageViewEventListener = null;
        this._pageViewEventSelector = null;
    },

    init: function () {
        if (ccui.Layout.prototype.init.call(this)) {
            this.setClippingEnabled(true);
            return true;
        }
        return false;
    },

    onEnter:function(){
        ccui.Layout.prototype.onEnter.call(this);
        this.scheduleUpdate(true);
    },

    /**
     * Add a widget to a page of pageview.
     * @param {ccui.Widget} widget
     * @param {number} pageIdx
     * @param {Boolean} forceCreate
     */
    addWidgetToPage: function (widget, pageIdx, forceCreate) {
        if (!widget || pageIdx < 0)
            return;

        var pageCount = this.getPageCount();
        if (pageIdx >= pageCount) {
            if (forceCreate) {
                if (pageIdx > pageCount)
                    cc.log("pageIdx is %d, it will be added as page id [%d]", pageIdx, pageCount)
                var newPage = this.createPage();
                newPage.addChild(widget);
                this.addPage(newPage);
            }
        } else {
            var page = this._pages[pageIdx];
            if (page)
                page.addChild(widget);
        }
    },

    /**
     * create page
     * @returns {ccui.Layout}
     */
    createPage: function () {
        var newPage = ccui.Layout.create();
        newPage.setContentSize(this.getContentSize());
        return newPage;
    },

    /**
     * Push back a page to pageview.
     * @param {ccui.Layout} page
     */
    addPage: function (page) {
        if (!page || this._pages.indexOf(page) != -1)
            return;

        this.addProtectedChild(page);
        this._pages.push(page);
        this._doLayoutDirty = true;
    },

    /**
     * Inert a page to pageview.
     * @param {ccui.Layout} page
     * @param {Number} idx
     */
    insertPage: function (page, idx) {
        if (idx < 0 || !page || this._pages.indexOf(page) != -1)
            return;

        var pageCount = this.getPageCount();
        if (idx >= pageCount)
            this.addPage(page);
        else {
            this._pages[idx] = page;
            this.addProtectedChild(page);
        }
        this._doLayoutDirty = true;
    },

    /**
     * Remove a page of pageview.
     * @param {ccui.Layout} page
     */
    removePage: function (page) {
        if (!page) {
            return;
        }
        this.removeProtectedChild(page);
        var index = this._pages.indexOf(page);
        if(index > -1)
            this._pages.splice(index, 1);
        this._doLayoutDirty = true;
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

    removeAllPages: function(){
        var locPages = this._pages;
        for(var i = 0, len = locPages.length; i < len; i++){
            this.removeProtectedChild(locPages[i]);
        }
        this._pages.length = 0;
    },

    updateBoundaryPages: function () {
        if (this._pages.length <= 0) {
            this._leftBoundaryChild = null;
            this._rightBoundaryChild = null;
            return;
        }
        this._leftBoundaryChild = this._pages[0];
        this._rightBoundaryChild = this._pages[this._pages.length-1];
    },

    getPageCount: function(){
        return this._pages.length;
    },

    /**
     * Get x position by index
     * @param {number} idx
     * @returns {number}
     */
    getPositionXByIndex: function (idx) {
        return (this.getSize().width * (idx - this._curPageIdx));
    },

    onSizeChanged: function () {
        ccui.Layout.prototype.onSizeChanged.call(this);
        this._rightBoundary = this.getContentSize().width;
        this._doLayoutDirty = true;
    },

    updateAllPagesSize: function(){
        var selfSize = this.getContentSize();
        var locPages = this._pages;
        for (var i = 0, len = locPages.length; i < len; i++) {
            locPages[i].setContentSize(selfSize);
        }
    },

    updateAllPagesPosition: function(){
        var pageCount = this.getPageCount();
        if (pageCount <= 0) {
            this._curPageIdx = 0;
            return;
        }

        if (this._curPageIdx >= pageCount)
            this._curPageIdx = pageCount-1;

        var pageWidth = this.getContentSize().width;
        var locPages = this._pages;
        for (var i=0; i< pageCount; i++){
            locPages[i].setPosition(cc.p((i - this._curPageIdx) * pageWidth, 0));
        }
    },

    /**
     * scroll pageview to index.
     * @param {number} idx
     */
    scrollToPage: function (idx) {
        if (idx < 0 || idx >= this._pages.length)
            return;
        this._curPageIdx = idx;
        var curPage = this._pages[idx];
        this._autoScrollDistance = -(curPage.getPosition().x);
        this._autoScrollSpeed = Math.abs(this._autoScrollDistance) / 0.2;
        this._autoScrollDirection = this._autoScrollDistance > 0 ? 1 : 0;
        this._isAutoScrolling = true;
    },

    update: function (dt) {
        if (this._isAutoScrolling) {
            this.autoScroll(dt);
        }
    },

    autoScroll: function(dt){
        var step;
        switch (this._autoScrollDirection) {
            case 0:
                step = this._autoScrollSpeed * dt;
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
                step = this._autoScrollSpeed * dt;
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
    },

    onTouchBegan: function (touch,event) {
        var pass = ccui.Layout.prototype.onTouchBegan.call(this, touch, event);
        if (this._hitted)
            this.handlePressLogic(touch);
        return pass;
    },

    onTouchMoved: function (touch, event) {
        this.handleMoveLogic(touch);
        var widgetParent = this.getWidgetParent();
        if (widgetParent)
            widgetParent.interceptTouchEvent(ccui.Widget.TOUCH_MOVED, this, touch);
        this.moveEvent();
    },

    onTouchEnded: function (touch, event) {
        ccui.Layout.prototype.onTouchEnded.call(this, touch, event);
        this.handleReleaseLogic(touch);
    },

    onTouchCancelled: function (touch, event) {
        ccui.Layout.prototype.onTouchCancelled.call(this, touch, event);
        this.handleReleaseLogic(touch);
    },

    _doLayout: function(){
        if (!this._doLayoutDirty)
            return;

        this.updateAllPagesPosition();
        this.updateAllPagesSize();
        this.updateBoundaryPages();

        this._doLayoutDirty = false;
    },

    movePages: function (offset) {
        var arrayPages = this._pages;
        var length = arrayPages.length;
        for (var i = 0; i < length; i++) {
            var child = arrayPages[i];
            var pos = child.getPosition();
            child.setPosition(pos.x + offset, pos.y);
        }
    },

    scrollPages: function (touchOffset) {
        if (this._pages.length <= 0)
            return false;

        if (!this._leftBoundaryChild || !this._rightBoundaryChild)
            return false;

        var realOffset = touchOffset;
        switch (this._touchMoveDirection) {
            case ccui.PageView.TOUCH_DIR_LEFT: // left
                if (this._rightBoundaryChild.getRightBoundary() + touchOffset <= this._rightBoundary) {
                    realOffset = this._rightBoundary - this._rightBoundaryChild.getRightBoundary();
                    this.movePages(realOffset);
                    return false;
                }
                break;

            case ccui.PageView.TOUCH_DIR_RIGHT: // right
                if (this._leftBoundaryChild.getLeftBoundary() + touchOffset >= this._leftBoundary) {
                    realOffset = this._leftBoundary - this._leftBoundaryChild.getLeftBoundary();
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

    handlePressLogic: function (touchPoint) {
        //np-op
    },

    handleMoveLogic: function (touch) {
        var offset = touch.getLocation().x - touch.getPreviousLocation().x;
        if (offset < 0) {
            this._touchMoveDirection = ccui.PageView.TOUCH_DIR_LEFT;
        } else if (offset > 0) {
            this._touchMoveDirection = ccui.PageView.TOUCH_DIR_RIGHT;
        }
        this.scrollPages(offset);
    },

    handleReleaseLogic: function (touchPoint) {
        if (this._pages.length <= 0)
            return;
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
            } else {
                this.scrollToPage(this._curPageIdx);
            }
        }
    },

    interceptTouchEvent: function (handleState, sender, touchPoint) {
        switch (handleState) {
            case 0:
                this.handlePressLogic(touchPoint);
                break;
            case 1:
                var offset = 0;
                offset = Math.abs(sender.getTouchBeganPosition().x - touchPoint.x);
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
            this._pageViewEventSelector.call(this._pageViewEventListener, this, ccui.PageView.EVENT_TURNING);
        }
        if (this._eventCallback) {
            this._eventCallback(this, ccui.PageView.EVENT_TURNING);
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

    addEventListener: function(callback){
        this._eventCallback = callback;
    },

    /**
     * get cur page index
     * @returns {number}
     */
    getCurPageIndex: function () {
        return this._curPageIdx;
    },

    /**
     * get pages
     * @returns {Array}
     */
    getPages:function(){
        return this._pages;
    },

    getPage: function(index){
        if (index < 0 || index >= this.getPages().size())
            return null;
        return this._pages[index];
    },

    /**
     * Returns the "class name" of widget.
     * @returns {string}
     */
    getDescription: function () {
        return "PageView";
    },

    createCloneInstance: function () {
        return ccui.PageView.create();
    },

    copyClonedWidgetChildren: function (model) {
        var arrayPages = model.getPages();
        for (var i = 0; i < arrayPages.length; i++) {
            var page = arrayPages[i];
            this.addPage(page.clone());
        }
    },

    copySpecialProperties: function (pageView) {
        ccui.Layout.prototype.copySpecialProperties.call(this, pageView);
        this._eventCallback = pageView._eventCallback;
        this._pageViewEventListener = pageView._pageViewEventListener;
        this._pageViewEventSelector = pageView._pageViewEventSelector;
    }



//
//    updateChildrenSize: function () {
//        if(this._pages){
//            if (!this._pages.length <= 0) {
//                return;
//            }
//
//            var selfSize = this.getSize();
//            for (var i = 0; i < this._pages.length; i++) {
//                var page = this._pages[i];
//                page.setSize(selfSize);
//            }
//        }
//    },
//
//    updateChildrenPosition: function () {
//        if (!this._pages) {
//            return;
//        }
//
//        var pageCount = this._pages.length;
//        if (pageCount <= 0) {
//            this._curPageIdx = 0;
//            return;
//        }
//        if (this._curPageIdx >= pageCount) {
//            this._curPageIdx = pageCount - 1;
//        }
//        var pageWidth = this.getSize().width;
//        var arrayPages = this._pages;
//        for (var i = 0; i < pageCount; i++) {
//            var page = arrayPages[i];
//            page.setPosition((i - this._curPageIdx) * pageWidth, 0);
//        }
//    },
//
//    removeAllChildren: function (cleanup) {
//        if(cleanup)
//            this._pages.length = 0;
//        ccui.Layout.prototype.removeAllChildren.call(this, cleanup);
//    },
//
//    checkChildInfo: function (handleState, sender, touchPoint) {
//        if(this._enabled && this._touchEnabled)
//            this.interceptTouchEvent(handleState, sender, touchPoint);
//    },
//
//    _doLayout: function () {
//        if (!this._doLayoutDirty)
//            return;
//        this._doLayoutDirty = false;
//    }
});
/**
 * allocates and initializes a UIPageView.
 * @constructs
 * @return {ccui.PageView}
 * @example
 * // example
 * var uiPageView = ccui.PageView.create();
 */
ccui.PageView.create = function () {
    var  widget = new ccui.PageView();
    if (widget && widget.init())
    {
        return widget;
    }
    return null;
};

// Constants
//PageView event
ccui.PageView.EVENT_TURNING = 0;

//PageView touch direction
ccui.PageView.TOUCH_DIR_LEFT = 0;
ccui.PageView.TOUCH_DIR_RIGHT = 1;