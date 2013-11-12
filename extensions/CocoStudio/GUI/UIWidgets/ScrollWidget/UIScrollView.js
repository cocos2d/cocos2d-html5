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

ccs.SCROLLVIEW_DIR = {
    none: 0,
    vertical: 1,
    horizontal: 2
};

ccs.SCROLLVIEW_MOVE_DIR = {
    none: 0,
    up: 1,
    down: 2,
    left: 3,
    right: 4
};

ccs.ScrollviewEventType = {
    top: 0,
    bottom: 1,
    left: 2,
    right: 3
};

/**
 * Base class for ccs.UIScrollView
 * @class
 * @extends ccs.UILayout
 */
ccs.UIScrollView = ccs.UILayout.extend({
    _innerContainer: null,
    _direction: null,
    _moveDirection: null,
    _touchStartLocation: 0,
    _touchEndLocation: 0,
    _touchMoveStartLocation: 0,
    _topBoundary: 0,//test
    _bottomBoundary: 0,//test
    _leftBoundary: 0,
    _rightBoundary: 0,
    _topEnd: false,
    _bottomEnd: false,
    _leftEnd: false,
    _rightEnd: false,
    _autoScroll: false,
    _autoScrollOriginalSpeed: 0,
    _autoScrollAcceleration: 0,
    _bePressed: false,
    _slidTime: 0,
    _moveChildPoint: null,
    _childFocusCancelOffset: 0,
    _eventListener: null,
    _eventSelector: null,
    ctor: function () {
        ccs.UILayout.prototype.ctor.call(this);
        this._innerContainer = null;
        this._direction = ccs.SCROLLVIEW_DIR.none;
        this._moveDirection = ccs.SCROLLVIEW_MOVE_DIR.none;
        this._touchStartLocation = 0;
        this._touchEndLocation = 0;
        this._touchMoveStartLocation = 0;
        this._topBoundary = 0;//test
        this._bottomBoundary = 0;//test
        this._leftBoundary = 0;
        this._rightBoundary = 0;
        this._topEnd = false;
        this._bottomEnd = false;
        this._leftEnd = false;
        this._rightEnd = false;
        this._autoScroll = false;
        this._autoScrollOriginalSpeed = 0;
        this._autoScrollAcceleration = 600;
        this._bePressed = false;
        this._slidTime = 0;
        this._moveChildPoint = cc.p(0, 0);
        this._childFocusCancelOffset = 5;
        this._eventListener = null;
        this._eventSelector = null;
    },
    releaseResoures: function () {
        this.setUpdateEnabled(false);
        this.removeAllChildren();
        this._renderer.removeAllChildren(true);
        this._renderer.removeFromParent(true);

        ccs.UILayout.prototype.removeChild.call(this, this._innerContainer);

        this._children = [];
    },

    init: function () {
        if (ccs.UILayout.prototype.init.call(this)) {
            this.setUpdateEnabled(true);
            this.setTouchEnabled(true);
            this.setClippingEnabled(true);
            this._innerContainer.setTouchEnabled(false);
            return true;
        }
        return false;
    },

    initRenderer: function () {
        ccs.UILayout.prototype.initRenderer.call(this);
        this._innerContainer = ccs.UILayout.create();
        ccs.UILayout.prototype.addChild.call(this, this._innerContainer);
    },

    onSizeChanged: function () {
        ccs.UILayout.prototype.onSizeChanged.call(this);
        this._topBoundary = this._size.height;
        this._rightBoundary = this._size.width;
        var innerSize = this._innerContainer.getSize();
        var orginInnerSizeWidth = innerSize.width;
        var orginInnerSizeHeight = innerSize.height;
        var innerSizeWidth = Math.max(orginInnerSizeWidth, this._size.width);
        var innerSizeHeight = Math.max(orginInnerSizeHeight, this._size.height);
        this._innerContainer.setSize(cc.size(innerSizeWidth, innerSizeHeight));
        this._innerContainer.setPosition(cc.p(0, this._size.height - this._innerContainer.getSize().height));
    },

    setInnerContainerSize: function (size) {
        var innerSizeWidth = this._size.width;
        var innerSizeHeight = this._size.height;
        if (size.width < this._size.width) {
            cc.log("Inner width <= scrollview width, it will be force sized!");
        }
        else {
            innerSizeWidth = size.width;
        }
        if (size.height < this._size.height) {
            cc.log("Inner height <= scrollview height, it will be force sized!");
        }
        else {
            innerSizeHeight = size.height;
        }
        this._innerContainer.setSize(cc.size(innerSizeWidth, innerSizeHeight));
        this._innerContainer.setPosition(cc.p(0, this._size.height - this._innerContainer.getSize().height));
    },

    getInnerContainerSize: function () {
        return this._innerContainer.getSize();
    },

    /**
     * Add widget
     * @param {ccs.UIWidget} widget
     * @returns {boolean}
     */
    addChild: function (widget) {
        return this._innerContainer.addChild(widget);
    },

    removeAllChildren: function () {
        this._innerContainer.removeAllChildren();
    },

    /**
     *  remove widget child override
     * @param {ccs.UIWidget} child
     * @returns {boolean}
     */
    removeChild: function (child) {
        return this._innerContainer.removeChild(child);
    },

    getChildren: function () {
        return this._innerContainer.getChildren();
    },

    moveChildren: function (offset) {
        switch (this._direction) {
            case ccs.SCROLLVIEW_DIR.vertical: // vertical
                var pos = this._innerContainer.getPosition();
                this._innerContainer.setPosition(cc.p(pos.x, pos.y + offset));
                break;
            case ccs.SCROLLVIEW_DIR.horizontal: // horizontal
                var pos = this._innerContainer.getPosition();
                this._innerContainer.setPosition(cc.p(pos.x + offset, pos.y));
                break;
            default:
                break;
        }
    },

    autoScrollChildren: function (dt) {
        switch (this._direction) {
            case ccs.SCROLLVIEW_DIR.vertical: // vertical
                switch (this._moveDirection) {
                    case ccs.SCROLLVIEW_MOVE_DIR.up: // up
                        var curDis = this.getCurAutoScrollDistance(dt);
                        if (curDis <= 0) {
                            curDis = 0;
                            this.stopAutoScrollChildren();
                        }
                        if (!this.scrollChildren(curDis)) {
                            this.stopAutoScrollChildren();
                        }
                        break;
                    case ccs.SCROLLVIEW_MOVE_DIR.down: // down
                        var curDis = this.getCurAutoScrollDistance(dt);
                        if (curDis <= 0) {
                            curDis = 0;
                            this.stopAutoScrollChildren();
                        }
                        if (!this.scrollChildren(-curDis)) {
                            this.stopAutoScrollChildren();
                        }
                        break;
                    default:
                        break;
                }
                break;

            case ccs.SCROLLVIEW_DIR.horizontal: // horizontal
                switch (this._moveDirection) {
                    case ccs.SCROLLVIEW_MOVE_DIR.left: // left
                        var curDis = this.getCurAutoScrollDistance(dt);
                        if (curDis <= 0) {
                            curDis = 0;
                            this.stopAutoScrollChildren();
                        }
                        if (!this.scrollChildren(-curDis)) {
                            this.stopAutoScrollChildren();
                        }
                        break;

                    case ccs.SCROLLVIEW_MOVE_DIR.right: // right
                        var curDis = this.getCurAutoScrollDistance(dt);
                        if (curDis <= 0) {
                            curDis = 0;
                            this.stopAutoScrollChildren();
                        }
                        if (!this.scrollChildren(curDis)) {
                            this.stopAutoScrollChildren();
                        }
                        break;

                    default:
                        break;
                }
                break;

            default:
                break;
        }
    },

    startAutoScrollChildren: function (v) {
        this._autoScrollOriginalSpeed = v;
        this._autoScroll = true;
    },

    stopAutoScrollChildren: function () {
        this._autoScroll = false;
        this._autoScrollOriginalSpeed = 0.0;
    },

    getCurAutoScrollDistance: function (dt) {
        this._autoScrollOriginalSpeed -= this._autoScrollAcceleration * dt;
        return this._autoScrollOriginalSpeed * dt;
    },

    scrollChildren: function (touchOffset) {
        var realOffset = touchOffset;

        switch (this._direction) {
            case ccs.SCROLLVIEW_DIR.vertical: // vertical
                switch (this._moveDirection) {
                    case ccs.SCROLLVIEW_MOVE_DIR.up: // up
                        var icBottomPos = this._innerContainer.getBottomInParent();
                        if (icBottomPos + touchOffset >= this._bottomBoundary) {
                            realOffset = this._bottomBoundary - icBottomPos;
                            this.moveChildren(realOffset);
                            this._bottomEnd = true;
                            this.scrollToBottomEvent();
                            return false;
                        }
                        break;
                    case ccs.SCROLLVIEW_MOVE_DIR.down: // down
                        var icTopPos = this._innerContainer.getTopInParent();
                        if (icTopPos + touchOffset <= this._topBoundary) {
                            realOffset = this._topBoundary - icTopPos;
                            this.moveChildren(realOffset);
                            this._topEnd = true;
                            this.scrollToTopEvent();
                            return false;
                        }
                        break;
                    default:
                        break;
                }
                this.moveChildren(realOffset);
                this._topEnd = false;
                this._bottomEnd = false;
                return true;
                break;
            case ccs.SCROLLVIEW_DIR.horizontal: // horizontal
                switch (this._moveDirection) {
                    case ccs.SCROLLVIEW_MOVE_DIR.left: // left
                        var icRightPos = this._innerContainer.getRightInParent();
                        if (icRightPos + touchOffset <= this._rightBoundary) {
                            realOffset = this._rightBoundary - icRightPos;
                            this.moveChildren(realOffset);
                            this._rightEnd = true;
                            this.scrollToRightEvent();
                            return false;
                        }
                        break;
                    case ccs.SCROLLVIEW_MOVE_DIR.right: // right
                        var icLeftPos = this._innerContainer.getLeftInParent();
                        if (icLeftPos + touchOffset >= this._leftBoundary) {
                            realOffset = this._leftBoundary - icLeftPos;
                            this.moveChildren(realOffset);
                            this._leftEnd = true;
                            this.scrollToLeftEvent();
                            return false;
                        }
                        break;
                    default:
                        break;
                }
                this.moveChildren(realOffset);
                this._leftEnd = false;
                this._rightEnd = false;
                return true;
                break;

            default:
                break;
        }

        return false;
    },

    scrollToBottom: function () {
        this._moveDirection = ccs.SCROLLVIEW_MOVE_DIR.up; // up
        this.scrollChildren(this._innerContainer.getSize().height);
    },

    scrollToTop: function () {
        this._moveDirection = ccs.SCROLLVIEW_MOVE_DIR.down; // down
        this.scrollChildren(-this._innerContainer.getSize().height);
    },

    startRecordSlidAction: function () {
        if (this._children.length <= 0) {
            return;
        }
        if (this._autoScroll) {
            this.stopAutoScrollChildren();
        }
        this._bePressed = true;
        this._slidTime = 0.0;
    },

    endRecordSlidAction: function () {
        if (this._children.length <= 0) {
            return;
        }
        if (this._slidTime <= 0.016) {
            return;
        }
        var totalDis = 0;
        totalDis = this._touchEndLocation - this._touchStartLocation;
        var orSpeed = Math.abs(totalDis) / (this._slidTime);
        this.startAutoScrollChildren(orSpeed);

        this._bePressed = false;
        this._slidTime = 0.0;
    },

    handlePressLogic: function (touchPoint) {
        var nsp = this._renderer.convertToNodeSpace(touchPoint);
        switch (this._direction) {
            case ccs.SCROLLVIEW_DIR.vertical: // vertical
                this._touchMoveStartLocation = nsp.y;
                this._touchStartLocation = nsp.y;
                break;
            case ccs.SCROLLVIEW_DIR.horizontal: // horizontal
                this._touchMoveStartLocation = nsp.x;
                this._touchStartLocation = nsp.x;
                break;
            default:
                break;
        }
        this.startRecordSlidAction();
    },

    handleMoveLogic: function (touchPoint) {
        var nsp = this._renderer.convertToNodeSpace(touchPoint);
        var offset = 0.0;

        switch (this._direction) {
            case ccs.SCROLLVIEW_DIR.vertical: // vertical
                var moveY = nsp.y;
                offset = moveY - this._touchMoveStartLocation;
                this._touchMoveStartLocation = moveY;

                if (offset < 0.0) {
                    this._moveDirection = ccs.SCROLLVIEW_MOVE_DIR.down; // down
                }
                else if (offset > 0.0) {
                    this._moveDirection = ccs.SCROLLVIEW_MOVE_DIR.up; // up
                }
                break;

            case ccs.SCROLLVIEW_DIR.horizontal: // horizontal
                var moveX = nsp.x;
                offset = moveX - this._touchMoveStartLocation;
                this._touchMoveStartLocation = moveX;

                if (offset < 0) {
                    this._moveDirection = ccs.SCROLLVIEW_MOVE_DIR.left; // left
                }
                else if (offset > 0) {
                    this._moveDirection = ccs.SCROLLVIEW_MOVE_DIR.right; // right
                }
                break;

            default:
                break;
        }
        this.scrollChildren(offset);
    },

    handleReleaseLogic: function (touchPoint) {
        var nsp = this._renderer.convertToNodeSpace(touchPoint);
        switch (this._direction) {
            case ccs.SCROLLVIEW_DIR.vertical: // vertical
                this._touchEndLocation = nsp.y;
                break;

            case ccs.SCROLLVIEW_DIR.horizontal: // horizontal
                this._touchEndLocation = nsp.x;
                break;

            default:
                break;
        }
        this.endRecordSlidAction();
    },

    onTouchBegan: function (touchPoint) {
        var pass = ccs.UILayout.prototype.onTouchBegan.call(this, touchPoint);
        this.handlePressLogic(touchPoint);
        return pass;
    },

    onTouchMoved: function (touchPoint) {
        ccs.UILayout.prototype.onTouchMoved.call(this, touchPoint);
        this.handleMoveLogic(touchPoint);
    },

    onTouchEnded: function (touchPoint) {
        ccs.UILayout.prototype.onTouchEnded.call(this, touchPoint);
        this.handleReleaseLogic(touchPoint);
    },

    onTouchCancelled: function (touchPoint) {
        ccs.UILayout.prototype.onTouchCancelled.call(this, touchPoint);
    },

    onTouchLongClicked: function (touchPoint) {

    },

    update: function (dt) {
        if (this._autoScroll) {
            this.autoScrollChildren(dt);
        }
        this.recordSlidTime(dt);
    },

    recordSlidTime: function (dt) {
        if (this._bePressed) {
            this._slidTime += dt;
        }
    },

    /**
     * Intercept touch event
     * @param {number} handleState
     * @param {ccs.UIWidget} sender
     * @param {cc.Point} touchPoint
     */
    interceptTouchEvent: function (handleState, sender, touchPoint) {
        switch (handleState) {
            case 0:
                this.handlePressLogic(touchPoint);
                break;
            case 1:
                var offset = 0;
                switch (this._direction) {
                    case ccs.SCROLLVIEW_DIR.vertical: // vertical
                        offset = Math.abs(sender.getTouchStartPos().y - touchPoint.y);
                        break;

                    case ccs.SCROLLVIEW_DIR.horizontal: // horizontal
                        offset = Math.abs(sender.getTouchStartPos().x - touchPoint.x);
                        break;

                    default:
                        break;
                }
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

    /**
     *
     * @param {number} handleState
     * @param {ccs.UIWidget} sender
     * @param {cc.Point} touchPoint
     */
    checkChildInfo: function (handleState, sender, touchPoint) {
        this.interceptTouchEvent(handleState, sender, touchPoint);
    },

    scrollToTopEvent: function () {
        if (this._eventListener && this._eventSelector) {
            this._eventSelector.call(this._eventListener, this, ccs.ScrollviewEventType.top);
        }
    },

    scrollToBottomEvent: function () {
        if (this._eventListener && this._eventSelector) {
            this._eventSelector.call(this._eventListener, this, ccs.ScrollviewEventType.bottom);
        }
    },

    scrollToLeftEvent: function () {
        if (this._eventListener && this._eventSelector) {
            this._eventSelector.call(this._eventListener, this, ccs.ScrollviewEventType.left);
        }
    },

    scrollToRightEvent: function () {
        if (this._eventListener && this._eventSelector) {
            this._eventSelector.call(this._eventListener, this, ccs.ScrollviewEventType.right);
        }
    },

    /**
     * @param {Function} selector
     * @param {Object} target
     */
    addEventListener: function (selector , target) {
        this._eventSelector = selector;
        this._eventListener = target;
    },

    setDirection: function (dir) {
        this._direction = dir;
    },

    getDirection: function () {
        return this._direction;
    },

    setMoveDirection: function (dir) {
        this._moveDirection = dir;
    },

    getMoveDirection: function () {
        return this._moveDirection;
    },

    getInnerContainer: function () {
        return this._innerContainer;
    },

    /**
     * Sets LayoutType.
     * @param {ccs.LayoutType} type
     */
    setLayoutType: function (type) {
        this._innerContainer.setLayoutType(type);
    },

    /**
     * Gets LayoutType.
     * @returns {ccs.LayoutType}
     */
    getLayoutType: function () {
        return this._innerContainer.getLayoutType();
    },

    doLayout: function () {
        this._innerContainer.doLayout();
    },

    getDescription: function () {
        return "ScrollView";
    }
});
ccs.UIScrollView.create = function () {
    var uiScrollView = new ccs.UIScrollView();
    if (uiScrollView && uiScrollView.init()) {
        return uiScrollView;
    }
    return null;
};