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
 *  drag panel move type
 */
cc.DRAGPANEL_MOVE_TYPE = {
    NONE: 0,
    AUTOMOVE: 1,
    BOUNCE: 2
};

/**
 *  dragpanel berth direction
 */
cc.DRAGPANEL_BERTH_DIR = {
    NONE: 0,
    LEFTBOTTOM: 1,
    LFETTOP: 2,
    RIGHTBOTTOM: 3,
    RIGHTTOP: 4,
    LEFT: 5,
    TOP: 6,
    RIGHT: 7,
    BOTTOM: 8
};

/**
 *  dragpanel bounce direction
 */
cc.DRAGPANEL_BOUNCE_DIR = {
    NONE: 0,
    LEFTBOTTOM: 1,
    LEFTTOP: 2,
    RIGHTBOTTOM: 3,
    RIGHTTOP: 4,
    LEFT: 5,
    TOP: 6,
    RIGHT: 7,
    BOTTOM: 8
};

cc.DragPanelEventType = {
    BERTH_LEFTBOTTOM: 0,
    BERTH_LFETTOP: 1,
    BERTH_RIGHTBOTTOM: 2,
    BERTH_RIGHTTOP: 3,
    BERTH_LEFT: 4,
    BERTH_TOP: 5,
    BERTH_RIGHT: 6,
    BERTH_BOTTOM: 7,
    BOUNCE_LEFTBOTTOM: 8,
    BOUNCE_LEFTTOP: 9,
    BOUNCE_RIGHTBOTTOM: 10,
    BOUNCE_RIGHTTOP: 11,
    BOUNCE_LEFT: 12,
    BOUNCE_TOP: 13,
    BOUNCE_RIGHT: 14,
    BOUNCE_BOTTOM: 15
};

cc.UIDragPanel = cc.Layout.extend({
    _innerContainer: null,
    _touchPressed: false,
    _touchMoved: false,
    _touchReleased: false,
    _touchCanceld: false, // check touch out of drag panel boundary
    _touchStartNodeSpace: null,
    _touchStartWorldSpace: null,
    _touchEndWorldSpace: null,
    _slidTime: 0,
// move type
    _moveType: null,
// auto move
    _autoMoveDuration: 0,
    _autoMoveEaseRate: 0,
// berth
    _berthDirection: null,
// bounce
    _bounceEnable: 0,
    _bounceDirection: null,
    _bounceDuration: 0,
    _bounceEaseRate: 0,
// event
    _eventLister: null,
    _eventSelector: null,

    _runningAction: 0,
    _actionType: null,
    _actionWidget: null,
    _duration: 0,
    _elapsed: 0,
    _firstTick: false,
    _positionDelta: null,
    _startPosition: null,
    _previousPosition: null,
    _endPosition: null,
    /*compatible*/
// berth event
    _berthToLeftListener: null,
    _berthToLeftSelector: null,
    _berthToRightListener: null,
    _berthToRightSelector: null,
    _berthToTopListener: null,
    _berthToTopSelector: null,
    _berthToBottomListener: null,
    _berthToBottomSelector: null,
    _berthToLeftBottomListener: null,
    _berthToLeftBottomSelector: null,
    _berthToLeftTopListener: null,
    _berthToLeftTopSelector: null,
    _berthToRightBottomListener: null,
    _berthToRightBottomSelector: null,
    _berthToRightTopListener: null,
    _berthToRightTopSelector: null,
    /********/
    /*compatible*/
// bounce event
    _bounceOverListener: null,
    _bounceOverSelector: null,
    _bounceToLeftBottomListener: null,
    _bounceToLeftBottomSelector: null,
    _bounceToLeftTopListener: null,
    _bounceToLeftTopSelector: null,
    _bounceToRightBottomListener: null,
    _bounceToRightBottomSelector: null,
    _bounceToRightTopListener: null,
    _bounceToRightTopSelector: null,
    _bounceToLeftListener: null,
    _bounceToLeftSelector: null,
    _bounceToTopListener: null,
    _bounceToTopSelector: null,
    _bounceToRightListener: null,
    _bounceToRightSelector: null,
    _bounceToBottomListener: null,
    _bounceToBottomSelector: null,
    ctor: function () {
        cc.Layout.prototype.ctor.call(this);
        this._innerContainer = null;
        this._touchPressed = false;
        this._touchMoved = false;
        this._touchReleased = false;
        this._touchCanceld = false; // check touch out of drag panel boundary
        this._touchStartNodeSpace = cc.p(0, 0);
        this._touchStartWorldSpace = cc.p(0, 0);
        this._touchEndWorldSpace = cc.p(0, 0);
        this._slidTime = 0;
// move type
        this._moveType = cc.DRAGPANEL_MOVE_TYPE.AUTOMOVE;
// auto move
        this._autoMoveDuration = 0.5;
        this._autoMoveEaseRate = 2.0;
// berth
        this._berthDirection = cc.DRAGPANEL_BERTH_DIR.NONE;
// bounce
        this._bounceEnable = 0;
        this._bounceDirection = cc.DRAGPANEL_BOUNCE_DIR.NONE;
        this._bounceDuration = 0;
        this._bounceEaseRate = 0;
        // event
        this._eventLister = null;
        this._eventSelector = null;
        this._runningAction = 0;
        this._actionType = null;
        this._actionWidget = null;
        this._duration = 0;
        this._elapsed = 0;
        this._firstTick = false;
        this._positionDelta = cc.p(0, 0);
        this._startPosition = cc.p(0, 0);
        this._previousPosition = cc.p(0, 0);
        this._endPosition = cc.p(0, 0);
        /*compatible*/
        this._berthToLeftListener = null;
        this._berthToLeftSelector = null;
        this._berthToRightListener = null;
        this._berthToRightSelector = null;
        this._berthToTopListener = null;
        this._berthToTopSelector = null;
        this._berthToBottomListener = null;
        this._berthToBottomSelector = null;
        this._berthToLeftBottomListener = null;
        this._berthToLeftBottomSelector = null;
        this._berthToLeftTopListener = null;
        this._berthToLeftTopSelector = null;
        this._berthToRightBottomListener = null;
        this._berthToRightBottomSelector = null;
        this._berthToRightTopListener = null;
        this._berthToRightTopSelector = null;
        this._bounceOverListener = null;
        this._bounceOverSelector = null;
        this._bounceToLeftBottomListener = null;
        this._bounceToLeftBottomSelector = null;
        this._bounceToLeftTopListener = null;
        this._bounceToLeftTopSelector = null;
        this._bounceToRightBottomListener = null;
        this._bounceToRightBottomSelector = null;
        this._bounceToRightTopListener = null;
        this._bounceToRightTopSelector = null;
        this._bounceToLeftListener = null;
        this._bounceToLeftSelector = null;
        this._bounceToTopListener = null;
        this._bounceToTopSelector = null;
        this._bounceToRightListener = null;
        this._bounceToRightSelector = null;
        this._bounceToBottomListener = null;
        this._bounceToBottomSelector = null;
    },

    init: function () {
        if (cc.Layout.prototype.init.call(this)) {
            this.setUpdateEnabled(true);
            this.setTouchEnabled(true);
            this.setClippingEnabled(true);
            return true;
        }
        return false;
    },

    initRenderer: function () {
        cc.Layout.prototype.initRenderer.call(this);

        this._innerContainer = cc.Layout.create();
        cc.Layout.prototype.addChild.call(this, this._innerContainer);

    },

    releaseResoures: function () {
        this._pushListener = null;
        this._pushSelector = null;
        this._moveListener = null;
        this._moveSelector = null;
        this._releaseListener = null;
        this._releaseSelector = null;
        this._cancelListener = null;
        this._cancelSelector = null;
        this.setUpdateEnabled(false);
        this.removeAllChildren();
        this._renderer.removeAllChildren(true);
        this._renderer.removeFromParent(true);

        cc.Layout.prototype.removeChild.call(this, this._innerContainer);

        this._children = [];
    },

    onTouchBegan: function (touchPoint) {
        var pass = cc.Layout.prototype.onTouchBegan.call(this, touchPoint);
        this.handlePressLogic(touchPoint);
        return pass;
    },

    onTouchMoved: function (touchPoint) {
        cc.Layout.prototype.onTouchMoved(touchPoint);
        this.handleMoveLogic(touchPoint);
    },

    onTouchEnded: function (touchPoint) {
        cc.Layout.prototype.onTouchEnded(touchPoint);
        this.handleReleaseLogic(touchPoint);
    },

    onTouchCancelled: function (touchPoint) {
        cc.Layout.prototype.onTouchCancelled(touchPoint);
    },

    onTouchLongClicked: function (touchPoint) {

    },

    update: function (dt) {
        // widget action
        if (this._runningAction) {
            if (this.actionIsDone()) {
                this.actionDone();
                this.actionStop();
            }
            else {
                this.actionStep(dt);
            }
        }

        this.recordSlidTime(dt);
    },

    addChild: function (widget) {
        this._innerContainer.addChild(widget);
        return true;
    },

    removeChild: function (child) {
        var value = false;
        if (this._innerContainer.removeChild(child)) {
            value = true;
        }

        return value;
    },

    removeAllChildren: function () {
        this._innerContainer.removeAllChildren();
    },

    getChildren: function () {
        return this._innerContainer.getChildren();
    },

    onSizeChanged: function () {
        cc.Layout.prototype.onSizeChanged.call(this);
        var innerSize = this._innerContainer.getSize();
        var orginInnerSizeWidth = innerSize.width;
        var orginInnerSizeHeight = innerSize.height;
        var innerSizeWidth = Math.max(orginInnerSizeWidth, this._size.width);
        var innerSizeHeight = Math.max(orginInnerSizeHeight, this._size.height);
        this._innerContainer.setSize(cc.size(innerSizeWidth, innerSizeHeight));
    },

    getInnerContainerSize: function () {
        return this._innerContainer.getContentSize();
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

    getInnerContainerPosition: function () {
        return this._innerContainer.getPosition();
    },

    setInnerContainerPosition: function (point, animated) {
        var delta = cc.pSub(point, this._innerContainer.getPosition());
        this.setInnerContainerOffset(delta, animated);
    },

    setInnerContainerOffset: function (offset, animated) {
        if (animated) {
            var delta = offset;

            if (this.checkToBoundaryWithDeltaPosition(delta)) {
                delta = this.calculateToBoundaryDeltaPosition(delta);
            }
            this.actionStartWithWidget(this._innerContainer);
            this.moveByWithDuration(this._autoMoveDuration, delta);
        }
        else {
            this.setInnerContainerOffset(offset);
        }
    },

    setInnerContainerOffset: function (offset) {
        var delta = offset;

        if (this.checkToBoundaryWithDeltaPosition(delta)) {
            delta = this.calculateToBoundaryDeltaPosition(delta);
        }
        this.moveWithDelta(delta);
        if (this.checkBerth()) {
            this.berthEvent();
        }
    },


    handlePressLogic: function (touchPoint) {
        // check inner rect < drag panel rect
        if (this.checkContainInnerRect()) {
            this._touchPressed = false;
            return;
        }

        this._touchPressed = true;
        this._touchMoved = false;
        this._touchReleased = false;
        this._touchCanceld = false;

        if (this._runningAction) {
            switch (this._moveType) {
                case cc.DRAGPANEL_MOVE_TYPE.AUTOMOVE:
                    this.stopAutoMove();
                    this.actionStop();
                    break;

                case cc.DRAGPANEL_MOVE_TYPE.BOUNCE:
                    this._touchPressed = false;
                    break;

                default:
                    break;
            }
        }

        var nsp = this._renderer.convertToNodeSpace(touchPoint);
        this._touchStartNodeSpace = nsp;

        this._touchStartWorldSpace = touchPoint;
    },

    handleMoveLogic: function (touchPoint) {
        if (!this._touchPressed) {
            return;
        }

        // check touch out of drag panel boundary
        if (this._touchCanceld) {
            return;
        }

        this._touchMoved = true;

        var nsp = this._renderer.convertToNodeSpace(touchPoint);
        var delta = cc.pSub(nsp, this._touchStartNodeSpace);
        this._touchStartNodeSpace = nsp;

        // reset berth dir to none
        if (!this._bounceEnable) {
            this._berthDirection = cc.DRAGPANEL_BERTH_DIR.NONE;
        }

        // check will berth (bounce disable)
        if (!this._bounceEnable) {
            if (this.checkToBoundaryWithDeltaPosition(delta)) {
                delta = this.calculateToBoundaryDeltaPosition(delta);
            }
        }
        // move
        this.moveWithDelta(delta);
        // check bounce or berth
        if (this._bounceEnable) {
            // bounce
            if (!this.hitTest(touchPoint)) {
                this._touchMoved = false;

                if (this.checkNeedBounce()) {
                    this._touchCanceld = true;
                    this.startBounce();
                }
            }
        }
        else {
            // berth
            if (this.checkBerth()) {
                this.berthEvent();
            }
        }
    },

    handleReleaseLogic: function (touchPoint) {
        if (!this._touchPressed) {
            return;
        }

        this._touchPressed = false;
        this._touchMoved = false;
        this._touchReleased = true;
        this._touchCanceld = false;

        // check touch out of drag panel boundary
        if (this._touchCanceld) {
            return;
        }

        if (this.hitTest(touchPoint)) {
            this._touchEndWorldSpace = touchPoint;
            this.startAutoMove();
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
                var offset = cc.pDistance(sender.getTouchStartPos(), touchPoint);
                if (offset > 5.0) {
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

    recordSlidTime: function (dt) {
        if (this._touchPressed) {
            this._slidTime += dt;
        }
    },

// check if dragpanel rect contain inner rect
    checkContainInnerRect: function () {
        var width = this._size.width;
        var height = this._size.height;
        var innerWidth = this._innerContainer.getSize().width;
        var innerHeight = this._innerContainer.getSize().height;

        if (innerWidth <= width && innerHeight <= height) {
            return true;
        }
        return false;
    },

// move
    moveWithDelta: function (delta) {
        var newPos = cc.pAdd(this._innerContainer.getPosition(), delta);
        this._innerContainer.setPosition(newPos);
    },

// auto move
    autoMove: function () {
        if (this._bounceEnable) {
            if (this.checkNeedBounce()) {
                this.stopAutoMove();
                this.startBounce();
            }
        }
    },

    autoMoveOver: function () {
        this.stopAutoMove();

        if (this.checkBerth()) {
            this.berthEvent();
            this._berthDirection = cc.DRAGPANEL_BERTH_DIR.NONE;
        }
    },

    startAutoMove: function () {
        this._moveType = cc.DRAGPANEL_MOVE_TYPE.AUTOMOVE;

        this.actionStop();

        var delta = cc.pSub(this._touchEndWorldSpace, this._touchStartWorldSpace);
        delta.x /= this._slidTime * 60;
        delta.y /= this._slidTime * 60;
        this._slidTime = 0.0;

        // bounceEnable is disable
        if (!this._bounceEnable) {
            if (this.checkToBoundaryWithDeltaPosition(delta)) {
                delta = this.calculateToBoundaryDeltaPosition(delta);
            }
        }
        this.actionStartWithWidget(this._innerContainer);
        this.moveByWithDuration(this._autoMoveDuration, delta);
    },

    stopAutoMove: function () {
        this._moveType = cc.DRAGPANEL_MOVE_TYPE.NONE;
    },

    setAutoMoveDuration: function (duration) {
        this._autoMoveDuration = duration;
    },

    setAutoMoveEaseRate: function (rate) {
        this._autoMoveEaseRate = rate;
    },

// berth

// check if move to boundary

    checkToBoundaryWithDeltaPosition: function (delta) {
        var innerLeft = this._innerContainer.getLeftInParent();
        var innerTop = this._innerContainer.getTopInParent();
        var innerRight = this._innerContainer.getRightInParent();
        var innerBottom = this._innerContainer.getBottomInParent();

        var left = 0;
        var top = this._size.height;
        var right = this._size.width;
        var bottom = 0;

        var toLeftBottom = false;
        var toLeftTop = false;
        var toRightBottom = false;
        var toRightTop = false;
        var toLeft = false;
        var toRight = false;
        var toTop = false;
        var toBottom = false;

        // left bottom
        if (innerLeft + delta.x > left && innerBottom + delta.y > bottom) {
            toLeftBottom = true;
        }
        // left top
        else if (innerLeft + delta.x > left && innerTop + delta.y < top) {
            toLeftTop = true;
        }
        // right bottom
        else if (innerRight + delta.x < right && innerBottom + delta.y > bottom) {
            toRightBottom = true;
        }
        // right top
        else if (innerRight + delta.x < right && innerTop + delta.y < top) {
            toRightTop = true;
        }
        // left
        else if (innerLeft + delta.x > left) {
            toLeft = true;
        }
        // right
        else if (innerRight + delta.x < right) {
            toRight = true;
        }
        // top
        else if (innerTop + delta.y < top) {
            toTop = true;
        }
        // bottom
        else if (innerBottom + delta.y > bottom) {
            toBottom = true;
        }

        if (toLeft || toTop || toRight || toBottom
            || toLeftBottom || toLeftTop || toRightBottom || toRightTop) {
            return true;
        }

        return false;
    },

    calculateToBoundaryDeltaPosition: function (paramDelta) {
        var innerLeft = this._innerContainer.getLeftInParent();
        var innerTop = this._innerContainer.getTopInParent();
        var innerRight = this._innerContainer.getRightInParent();
        var innerBottom = this._innerContainer.getBottomInParent();

        var left = 0;
        var top = this._size.height;
        var right = this._size.width;
        var bottom = 0;

        var delta = paramDelta;

        // left bottom
        if (innerLeft + delta.x > left && innerBottom + delta.y > bottom) {
            delta.x = left - innerLeft;
            delta.y = bottom - innerBottom;
        }
        // left top
        else if (innerLeft + delta.x > left && innerTop + delta.y < top) {
            delta.x = left - innerLeft;
            delta.y = top - innerTop;
        }
        // right bottom
        else if (innerRight + delta.x < right && innerBottom + delta.y > bottom) {
            delta.x = right - innerRight;
            delta.y = bottom - innerBottom;
        }
        // right bottom
        else if (innerRight + delta.x < right && innerTop + delta.y < top) {
            delta.x = right - innerRight;
            delta.y = top - innerTop;
        }
        // left
        else if (innerLeft + delta.x > left) {
            delta.x = left - innerLeft;
        }
        // right
        else if (innerRight + delta.x < right) {
            delta.x = right - innerRight;
        }
        // top
        else if (innerTop + delta.y < top) {
            delta.y = top - innerTop;
        }
        // bottom
        else if (innerBottom + delta.y > bottom) {
            delta.y = bottom - innerBottom;
        }

        return delta;
    },

    isBerth: function () {
        return this._berthDirection != cc.DRAGPANEL_BERTH_DIR.NONE;
    },

// check berth
    checkBerth: function () {
        var innerLeft = this._innerContainer.getLeftInParent();
        var innerTop = this._innerContainer.getTopInParent();
        var innerRight = this._innerContainer.getRightInParent();
        var innerBottom = this._innerContainer.getBottomInParent();

        var left = 0;
        var top = this._size.height;
        var right = this._size.width;
        var bottom = 0;

        // left bottom
        if (innerLeft == left && innerBottom == bottom) {
            this._berthDirection = cc.DRAGPANEL_BERTH_DIR.LEFTBOTTOM;
        }
        // left top
        else if (innerLeft == left && innerTop == top) {
            this._berthDirection = cc.DRAGPANEL_BERTH_DIR.LFETTOP;
        }
        // right bottom
        else if (innerRight == right && innerBottom == bottom) {
            this._berthDirection = cc.DRAGPANEL_BERTH_DIR.RIGHTBOTTOM;
        }
        // right top
        else if (innerRight == right && innerTop == top) {
            this._berthDirection = cc.DRAGPANEL_BERTH_DIR.RIGHTTOP;
        }
        // left
        else if (innerLeft == left) {
            this._berthDirection = cc.DRAGPANEL_BERTH_DIR.LEFT;
        }
        // right
        else if (innerRight == right) {
            this._berthDirection = cc.DRAGPANEL_BERTH_DIR.RIGHT;
        }
        // top
        else if (innerTop == top) {
            this._berthDirection = cc.DRAGPANEL_BERTH_DIR.TOP;
        }
        // bottom
        else if (innerBottom == bottom) {
            this._berthDirection = cc.DRAGPANEL_BERTH_DIR.BOTTOM;
        }

        if (this._berthDirection != cc.DRAGPANEL_BERTH_DIR.NONE) {
            return true;
        }

        return false;
    },

    berthEvent: function () {
        switch (this._berthDirection) {
            case cc.DRAGPANEL_BERTH_DIR.LEFTBOTTOM:
                this.berthToLeftBottomEvent();
                break;

            case cc.DRAGPANEL_BERTH_DIR.LFETTOP:
                this.berthToLeftTopEvent();
                break;

            case cc.DRAGPANEL_BERTH_DIR.RIGHTBOTTOM:
                this.berthToRightBottomEvent();
                break;

            case cc.DRAGPANEL_BERTH_DIR.RIGHTTOP:
                this.berthToRightTopEvent();
                break;

            case cc.DRAGPANEL_BERTH_DIR.LEFT:
                this.berthToLeftEvent();
                break;

            case cc.DRAGPANEL_BERTH_DIR.TOP:
                this.berthToTopEvent();
                break;

            case cc.DRAGPANEL_BERTH_DIR.RIGHT:
                this.berthToRightEvent();
                break;

            case cc.DRAGPANEL_BERTH_DIR.BOTTOM:
                this.berthToBottomEvent();
                break;

            default:
                break;
        }
    },

    berthToLeftBottomEvent: function () {
        /*Compatible*/
        if (this._berthToLeftBottomListener && this._berthToLeftBottomSelector) {
            this._berthToLeftBottomSelector.call(this._berthToLeftBottomListener, this);
        }
        /************/
        if (this._eventLister && this._eventSelector) {
            this._eventSelector.call(this._eventLister, this, cc.DragPanelEventType.BERTH_LEFTBOTTOM);
        }
    },

    berthToLeftTopEvent: function () {
        /*Compatible*/
        if (this._berthToLeftTopListener && this._berthToLeftTopSelector) {
            this._berthToLeftTopSelector.call(this._berthToLeftTopListener, this);
        }

        if (this._eventLister && this._eventSelector) {
            this._eventSelector.call(this._eventLister, this, cc.DragPanelEventType.BERTH_LFETTOP);
        }
    },

    berthToRightBottomEvent: function () {
        /*Compatible*/
        if (this._berthToRightBottomListener && this._berthToRightBottomSelector) {
            this._berthToRightBottomSelector.call(this._berthToRightBottomListener, this);
        }

        if (this._eventLister && this._eventSelector) {
            this._eventSelector.call(this._eventLister, this, cc.DragPanelEventType.BERTH_RIGHTBOTTOM);
        }
    },

    berthToRightTopEvent: function () {
        /*Compatible*/
        if (this._berthToRightTopListener && this._berthToRightTopSelector) {
            this._berthToRightTopSelector.call(this._berthToRightTopListener, this);
        }

        if (this._eventLister && this._eventSelector) {
            this._eventSelector.call(this._eventLister, this, cc.DragPanelEventType.BERTH_RIGHTTOP);
        }
    },

    berthToLeftEvent: function () {
        /*Compatible*/
        if (this._berthToLeftListener && this._berthToLeftSelector) {
            this._berthToLeftSelector.call(this._berthToLeftListener, this);
        }

        if (this._eventLister && this._eventSelector) {
            this._eventSelector.call(this._eventLister, this, cc.DragPanelEventType.BERTH_LEFT);
        }
    },

    berthToTopEvent: function () {
        /*Compatible*/
        if (this._berthToTopListener && this._berthToTopSelector) {
            this._berthToTopSelector.call(this._berthToTopListener, this);
        }

        if (this._eventLister && this._eventSelector) {
            this._eventSelector.call(this._eventLister, this, cc.DragPanelEventType.BERTH_TOP);
        }
    },

    berthToRightEvent: function () {
        /*Compatible*/
        if (this._berthToRightListener && this._berthToRightSelector) {
            this._berthToRightSelector.call(this._berthToRightListener, this);
        }

        if (this._eventLister && this._eventSelector) {
            this._eventSelector.call(this._eventLister, this, cc.DragPanelEventType.BERTH_RIGHT);
        }
    },

    berthToBottomEvent: function () {
        /*Compatible*/
        if (this._berthToBottomListener && this._berthToBottomSelector) {
            this._berthToBottomSelector.call(this._berthToBottomListener, this);
        }

        if (this._eventLister && this._eventSelector) {
            this._eventSelector.call(this._eventLister, this, cc.DragPanelEventType.BERTH_BOTTOM)
        }
    },

    addEventListener: function (target, selector) {
        this._eventLister = target;
        this._eventSelector = selector;
    },

    /*******Compatible*******/
    addBerthToLeftBottomEvent: function (target, selector) {
        this._berthToLeftBottomListener = target;
        this._berthToLeftBottomSelector = selector;
    },

    addBerthToLeftTopEvent: function (target, selector) {
        this._berthToLeftTopListener = target;
        this._berthToLeftTopSelector = selector;
    },

    addBerthToRightBottomEvent: function (target, selector) {
        this._berthToRightBottomListener = target;
        this._berthToRightBottomSelector = selector;
    },

    addBerthToRightTopEvent: function (target, selector) {
        this._berthToRightTopListener = target;
        this._berthToRightTopSelector = selector;
    },

    addBerthToLeftEvent: function (target, selector) {
        this._berthToLeftListener = target;
        this._berthToLeftSelector = selector;
    },

    addBerthToTopEvent: function (target, selector) {
        this._berthToTopListener = target;
        this._berthToTopSelector = selector;
    },

    addBerthToRightEvent: function (target, selector) {
        this._berthToRightListener = target;
        this._berthToRightSelector = selector;
    },

    addBerthToBottomEvent: function (target, selector) {
        this._berthToBottomListener = target;
        this._berthToBottomSelector = selector;
    },
    /**************/

// bounce
    isBounceEnabled: function () {
        return this._bounceEnable;
    },

    setBounceEnabled: function (bounce) {
        this._bounceEnable = bounce;
    },

    checkNeedBounce: function () {
        var innerLeft = this._innerContainer.getLeftInParent();
        var innerTop = this._innerContainer.getTopInParent();
        var innerRight = this._innerContainer.getRightInParent();
        var innerBottom = this._innerContainer.getBottomInParent();

        var left = 0;
        var top = this._size.height;
        var right = this._size.width;
        var bottom = 0;

        var need = ((innerLeft > left && innerBottom > bottom)
            || (innerLeft > left && innerTop < top)
            || (innerRight < right && innerBottom > bottom)
            || (innerRight < right && innerTop < top)
            || (innerLeft > left)
            || (innerTop < top)
            || (innerRight < right)
            || (innerBottom > bottom));
        return need;
    },

    startBounce: function () {
        if (this._moveType == cc.DRAGPANEL_MOVE_TYPE.BOUNCE) {
            return;
        }

        this.actionStop();
        this._moveType = cc.DRAGPANEL_MOVE_TYPE.BOUNCE;
        this.bounceToCorner();
    },

    stopBounce: function () {
        this._moveType = cc.DRAGPANEL_MOVE_TYPE.NONE;
    },

    bounceToCorner: function () {
        var innerLeft = this._innerContainer.getLeftInParent();
        var innerTop = this._innerContainer.getTopInParent();
        var innerRight = this._innerContainer.getRightInParent();
        var innerBottom = this._innerContainer.getBottomInParent();

        var width = this._size.width;
        var height = this._size.height;
        var left = 0;
        var top = height;
        var right = width;
        var bottom = 0;

        var from_x = 0;
        var from_y = 0;
        var to_x = 0;
        var to_y = 0;
        var delta = cc.p(0, 0);

        // left bottom
        if (innerLeft > left && innerBottom > bottom) {
            from_x = innerLeft;
            from_y = innerBottom;
            to_x = left;
            to_y = bottom;

            this._bounceDirection = cc.DRAGPANEL_BOUNCE_DIR.LEFTBOTTOM;
        }
        // left top
        else if (innerLeft > left && innerTop < top) {
            from_x = innerLeft;
            from_y = innerTop;
            to_x = left;
            to_y = top;

            this._bounceDirection = cc.DRAGPANEL_BOUNCE_DIR.LEFTTOP;
        }
        // right bottom
        else if (innerRight < right && innerBottom > bottom) {
            from_x = innerRight;
            from_y = innerBottom;
            to_x = right;
            to_y = bottom;

            this._bounceDirection = cc.DRAGPANEL_BOUNCE_DIR.RIGHTBOTTOM;
        }
        // right top
        else if (innerRight < right && innerTop < top) {
            from_x = innerRight;
            from_y = innerTop;
            to_x = right;
            to_y = top;

            this._bounceDirection = cc.DRAGPANEL_BOUNCE_DIR.RIGHTTOP;
        }
        // left
        else if (innerLeft > left) {
            from_x = innerLeft;
            from_y = innerBottom;
            to_x = left;
            to_y = from_y;

            this._bounceDirection = cc.DRAGPANEL_BOUNCE_DIR.LEFT;
        }
        // top
        else if (innerTop < top) {
            from_x = innerLeft;
            from_y = innerTop;
            to_x = from_x;
            to_y = top;

            this._bounceDirection = cc.DRAGPANEL_BOUNCE_DIR.TOP;
        }
        // right
        else if (innerRight < right) {
            from_x = innerRight;
            from_y = innerBottom;
            to_x = right;
            to_y = from_y;

            this._bounceDirection = cc.DRAGPANEL_BOUNCE_DIR.RIGHT;
        }
        // bottom
        else if (innerBottom > bottom) {
            from_x = innerLeft;
            from_y = innerBottom;
            to_x = from_x;
            to_y = bottom;

            this._bounceDirection = cc.DRAGPANEL_BOUNCE_DIR.BOTTOM;
        }
        delta = cc.pSub(cc.p(to_x, to_y), cc.p(from_x, from_y));

        this.actionStartWithWidget(this._innerContainer);
        this.moveByWithDuration(m_fBounceDuration, delta);
    },

    bounceOver: function () {
        this.stopBounce();

        switch (this._bounceDirection) {
            case cc.DRAGPANEL_BOUNCE_DIR.LEFTBOTTOM:
                this.bounceToLeftBottomEvent();
                break;

            case cc.DRAGPANEL_BOUNCE_DIR.LEFTTOP:
                this.bounceToLeftTopEvent();
                break;

            case cc.DRAGPANEL_BOUNCE_DIR.RIGHTBOTTOM:
                this.bounceToRightBottomEvent();
                break;

            case cc.DRAGPANEL_BOUNCE_DIR.RIGHTTOP:
                this.bounceToRightTopEvent();
                break;

            case cc.DRAGPANEL_BOUNCE_DIR.LEFT:
                this.bounceToLeftEvent();
                break;

            case cc.DRAGPANEL_BOUNCE_DIR.TOP:
                this.bounceToTopEvent();
                break;

            case cc.DRAGPANEL_BOUNCE_DIR.RIGHT:
                this.bounceToRightEvent();
                break;

            case cc.DRAGPANEL_BOUNCE_DIR.BOTTOM:
                this.bounceToBottomEvent();
                break;

            default:
                break;
        }

        this._bounceDirection = cc.DRAGPANEL_BOUNCE_DIR.NONE;
    },

    bounceToLeftBottomEvent: function () {
        /*Compatible*/
        if (this._bounceToLeftBottomListener && this._bounceToLeftBottomSelector) {
            this._bounceToLeftBottomSelector.call(this._bounceToLeftBottomListener, this);
        }

        if (this._eventLister && this._eventSelector) {
            this._eventSelector.call(this._eventLister, this, cc.DragPanelEventType.BOUNCE_LEFTBOTTOM);
        }

    },

    bounceToLeftTopEvent: function () {
        /*Compatible*/
        if (this._bounceToLeftTopListener && this._bounceToLeftTopSelector) {
            this._bounceToLeftTopSelector.call(this._bounceToLeftTopListener, this);
        }

        if (this._eventLister && this._eventSelector) {
            this._eventSelector.call(this._eventLister, this, cc.DragPanelEventType.BOUNCE_LEFTTOP);
        }
    },

    bounceToRightBottomEvent: function () {
        /*Compatible*/
        if (this._bounceToRightBottomListener && this._bounceToRightBottomSelector) {
            this._bounceToRightBottomSelector.call(this._bounceToRightBottomListener, this);
        }

        if (this._eventLister && this._eventSelector) {
            this._eventSelector.call(this._eventLister, this, cc.DragPanelEventType.BOUNCE_RIGHTBOTTOM);
        }
    },

    bounceToRightTopEvent: function () {
        /*Compatible*/
        if (this._bounceToRightTopListener && this._bounceToRightTopSelector) {
            this._bounceToRightTopSelector.call(this._bounceToRightTopListener, this);
        }

        if (this._eventLister && this._eventSelector) {
            this._eventSelector.call(this._eventLister, this, cc.DragPanelEventType.BOUNCE_RIGHTTOP);
        }
    },

    bounceToLeftEvent: function () {
        /*Compatible*/
        if (this._bounceToLeftListener && this._bounceToLeftSelector) {
            this._bounceToLeftSelector.call(this._bounceToLeftListener, this);
        }

        if (this._eventLister && this._eventSelector) {
            this._eventSelector.call(this._eventLister, this, cc.DragPanelEventType.BOUNCE_LEFT);
        }
    },

    bounceToTopEvent: function () {
        /*Compatible*/
        if (this._bounceToTopListener && this._bounceToTopSelector) {
            this._bounceToTopSelector.call(this._bounceToTopListener, this);
        }

        if (this._eventLister && this._eventSelector) {
            this._eventSelector.call(this._eventLister, this, cc.DragPanelEventType.BOUNCE_TOP);
        }

    },

    bounceToRightEvent: function () {
        /*Compatible*/
        if (this._bounceToRightListener && this._bounceToRightSelector) {
            this._bounceToRightSelector.call(this._bounceToRightListener, this);
        }

        if (this._eventLister && this._eventSelector) {
            this._eventSelector.call(this._eventLister, this, cc.DragPanelEventType.BOUNCE_RIGHT);
        }

    },

    bounceToBottomEvent: function () {
        /*Compatible*/
        if (this._bounceToBottomListener && this._bounceToBottomSelector) {
            this._bounceToBottomSelector.call(this._bounceToBottomListener, this);
        }

        if (this._eventLister && this._eventSelector) {
            this._eventSelector.call(this._eventLister, this, cc.DragPanelEventType.BOUNCE_BOTTOM);
        }
    },

    /*******Compatible*******/
    addBounceToLeftBottomEvent: function (target, selector) {
        this._bounceToLeftBottomListener = target;
        this._bounceToLeftBottomSelector = selector;
    },

    addBounceToLeftTopEvent: function (target, selector) {
        this._bounceToLeftTopListener = target;
        this._bounceToLeftTopSelector = selector;
    },

    addBounceToRightBottomEvent: function (target, selector) {
        this._bounceToRightBottomListener = target;
        this._bounceToRightBottomSelector = selector;
    },

    addBounceToRightTopEvent: function (target, selector) {
        this._bounceToRightTopListener = target;
        this._bounceToRightTopSelector = selector;
    },

    addBounceToLeftEvent: function (target, selector) {
        this._bounceToLeftListener = target;
        this._bounceToLeftSelector = selector;
    },

    addBounceToTopEvent: function (target, selector) {
        this._bounceToTopListener = target;
        this._bounceToTopSelector = selector;
    },

    addBounceToRightEvent: function (target, selector) {
        this._bounceToRightListener = target;
        this._bounceToRightSelector = selector;
    },

    addBounceToBottomEvent: function (target, selector) {
        this._bounceToBottomListener = target;
        this._bounceToBottomSelector = selector;
    },
    /**************/

// widget action
    actionWithDuration: function (duration) {
        this._duration = duration;

        if (this._duration == 0) {
            this._duration = 0.0000001192092896;
        }

        this._elapsed = 0;
        this._firstTick = true;
    },

    actionIsDone: function () {
        var value = (this._elapsed >= this._duration);
        return value;
    },

    actionStartWithWidget: function (widget) {
        this._runningAction = true;
        this._actionWidget = widget;
    },

    actionStep: function (dt) {
        if (this._firstTick) {
            this._firstTick = false;
            this._elapsed = 0;
        }
        else {
            this._elapsed += dt;
        }

        this.actionUpdate(Math.max(0, Math.min(1, this._elapsed / Math.max(this._duration, 0.0000001192092896))));
    },

    actionUpdate: function (dt) {
        switch (this._actionType) {
            case 1: // move by
                this.moveByUpdate(dt);
                break;

            case 2: // move to
                this.moveToUpdate(dt);
                break;

            default:
                break;
        }
    },

    actionStop: function () {
        this._runningAction = false;
    },

    actionDone: function () {
        switch (this._moveType) {
            case cc.DRAGPANEL_MOVE_TYPE.AUTOMOVE:
                this.autoMoveOver();
                break;

            case cc.DRAGPANEL_MOVE_TYPE.BOUNCE:
                this.bounceOver();
                break;

            default:
                break;
        }
    },

// move by
    moveByWithDuration: function (duration, deltaPosition) {
        this.actionWithDuration(duration);
        this._positionDelta = deltaPosition;
        this.moveByInit();
        this._actionType = 1;
    },

    moveByInit: function () {
        this._previousPosition = this._startPosition = this._actionWidget.getPosition();
    },

    moveByUpdate: function (t) {
        var easeRate = 0.0;
        switch (this._moveType) {
            case cc.DRAGPANEL_MOVE_TYPE.AUTOMOVE:
                easeRate = this._autoMoveEaseRate;
                break;

            case cc.DRAGPANEL_MOVE_TYPE.BOUNCE:
                easeRate = this._bounceEaseRate;
                break;

            default:
                break;
        }
        t = Math.pow(t, 1 / easeRate);

        var currentPos = this._actionWidget.getPosition();
        var diff = cc.pSub(currentPos, this._previousPosition);
        this._startPosition = cc.pAdd(this._startPosition, diff);

        var newPos = cc.pAdd(this._startPosition, cc.pMult(this._positionDelta, t));
        this._actionWidget.setPosition(newPos);
        this._previousPosition = newPos;

        switch (this._moveType) {
            case cc.DRAGPANEL_MOVE_TYPE.AUTOMOVE:
                this.autoMove();
                break;

            default:
                break;
        }
    },

// move to
    moveToWithDuration: function (duration, position) {
        this.actionWithDuration(duration);
        this._endPosition = position;
        this.moveToInit();
        this._actionType = 2;
    },

    moveToInit: function () {
        this.moveByInit();
        this._positionDelta = cc.pSub(this._endPosition, this._actionWidget.getPosition());
    },

    moveToUpdate: function (t) {
        this.moveByUpdate(t);
    },

    getInnerContainer: function () {
        return this._innerContainer;
    },

    setLayoutType: function (type) {
        this._innerContainer.setLayoutType(type);
    },

    getLayoutType: function () {
        return this._innerContainer.getLayoutType();
    },

    doLayout: function () {
        this._innerContainer.doLayout();
    },

    getDescription: function () {
        return "DragPanel";
    }
});
cc.UIDragPanel.create = function () {
    var uiDragPanel = new cc.UIDragPanel();
    if (uiDragPanel && uiDragPanel.init()) {
        return uiDragPanel;
    }
    return null;
};