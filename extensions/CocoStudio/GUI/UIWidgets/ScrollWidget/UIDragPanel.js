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
ccs.DragPanelMoveType = {
    none: 0,
    autoMove: 1,
    bounce: 2
};

/**
 *  dragpanel berth direction
 */
ccs.DragPanelBerthDir = {
    none: 0,
    leftBottom: 1,
    leftTop: 2,
    rightBottom: 3,
    rightTop: 4,
    left: 5,
    top: 6,
    right: 7,
    bottom: 8
};

/**
 *  dragpanel bounce direction
 */
ccs.DragPanelBounceDir = {
    none: 0,
    leftBottom: 1,
    leftTop: 2,
    rightBottom: 3,
    rightTop: 4,
    left: 5,
    top: 6,
    right: 7,
    bottom: 8
};

ccs.DragPanelEventType = {
    berthLeftBottom: 0,
    berthLeftTop: 1,
    berthRightBottom: 2,
    berthRightTop: 3,
    berthLeft: 4,
    berthTop: 5,
    berthRight: 6,
    berthBottom: 7,
    bounceLeftBottom: 8,
    bounceLeftTop: 9,
    bounceRightBottom: 10,
    bounceRightTop: 11,
    bounceLeft: 12,
    bounceTop: 13,
    bounceRight: 14,
    bounceBottom: 15
};

/**
 * Base class for ccs.UIDragPanel
 * @class
 * @extends ccs.UILayout
 */
ccs.UIDragPanel = ccs.UILayout.extend({
    _innerContainer: null,
    _touchPressed: false,
    _touchMoved: false,
    _touchReleased: false,
    _touchCanceld: false,
    _touchStartNodeSpace: null,
    _touchStartWorldSpace: null,
    _touchEndWorldSpace: null,
    _slidTime: 0,
    _moveType: null,
    _autoMoveDuration: 0,
    _autoMoveEaseRate: 0,
    _berthDirection: null,
    _bounceEnable: 0,
    _bounceDirection: null,
    _bounceDuration: 0,
    _bounceEaseRate: 0,
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

    ctor: function () {
        ccs.UILayout.prototype.ctor.call(this);
        this._innerContainer = null;
        this._touchPressed = false;
        this._touchMoved = false;
        this._touchReleased = false;
        this._touchCanceld = false; // check touch out of drag panel boundary
        this._touchStartNodeSpace = cc.p(0, 0);
        this._touchStartWorldSpace = cc.p(0, 0);
        this._touchEndWorldSpace = cc.p(0, 0);
        this._slidTime = 0;
        this._moveType = ccs.DragPanelMoveType.autoMove;
        this._autoMoveDuration = 0.5;
        this._autoMoveEaseRate = 2.0;
        this._berthDirection = ccs.DragPanelBerthDir.none;
        this._bounceEnable = 0;
        this._bounceDirection = ccs.DragPanelBounceDir.none;
        this._bounceDuration = 0.5;
        this._bounceEaseRate = 2.0;
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
    },

    init: function () {
        if (ccs.UILayout.prototype.init.call(this)) {
            this.setUpdateEnabled(true);
            this.setTouchEnabled(true);
            this.setClippingEnabled(true);
            return true;
        }
        return false;
    },

    initRenderer: function () {
        ccs.UILayout.prototype.initRenderer.call(this);
        this._innerContainer = ccs.UILayout.create();
        ccs.UILayout.prototype.addChild.call(this, this._innerContainer);

    },

    releaseResoures: function () {
        this.setUpdateEnabled(false);
        this.removeAllChildren();
        this._renderer.removeAllChildren(true);
        this._renderer.removeFromParent(true);
        ccs.UILayout.prototype.removeChild.call(this, this._innerContainer);
        this._children = [];
    },

    onTouchBegan: function (touchPoint) {
        var pass = ccs.UILayout.prototype.onTouchBegan.call(this, touchPoint);
        this.handlePressLogic(touchPoint);
        return pass;
    },

    onTouchMoved: function (touchPoint) {
        ccs.UILayout.prototype.onTouchMoved.call(this,touchPoint);
        this.handleMoveLogic(touchPoint);
    },

    onTouchEnded: function (touchPoint) {
        ccs.UILayout.prototype.onTouchEnded.call(this,touchPoint);
        this.handleReleaseLogic(touchPoint);
    },

    onTouchCancelled: function (touchPoint) {
        ccs.UILayout.prototype.onTouchCancelled.call(this,touchPoint);
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

    /**
     * add widget child override
     * @param {ccs.UIWidget} widget
     * @returns {boolean}
     */
    addChild: function (widget) {
        this._innerContainer.addChild(widget);
        return true;
    },

    /**
     * remove widget child override
     * @param {ccs.UIWidget} child
     * @returns {boolean}
     */
    removeChild: function (child) {
        var value = false;
        if (this._innerContainer.removeChild(child)) {
            value = true;
        }

        return value;
    },

    /**
     * remove all widget children override
     */
    removeAllChildren: function () {
        this._innerContainer.removeAllChildren();
    },

    /**
     * get widget children of inner container
     * @returns {Array}
     */
    getChildren: function () {
        return this._innerContainer.getChildren();
    },

    onSizeChanged: function () {
        ccs.UILayout.prototype.onSizeChanged.call(this);
        var innerSize = this._innerContainer.getSize();
        var orginInnerSizeWidth = innerSize.width;
        var orginInnerSizeHeight = innerSize.height;
        var innerSizeWidth = Math.max(orginInnerSizeWidth, this._size.width);
        var innerSizeHeight = Math.max(orginInnerSizeHeight, this._size.height);
        this._innerContainer.setSize(cc.size(innerSizeWidth, innerSizeHeight));
    },

    /**
     * get and set inner container size
     * @returns {cc.Size}
     */
    getInnerContainerSize: function () {
        return this._innerContainer.getContentSize();
    },

    /**
     * set inner container size
     * @returns {cc.Size}
     */
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

    /**
     * Set inner container offset
     * @param {cc.Point} offset
     * @param {Boolean} animated
     */
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
            var delta = offset;

            if (this.checkToBoundaryWithDeltaPosition(delta)) {
                delta = this.calculateToBoundaryDeltaPosition(delta);
            }
            this.moveWithDelta(delta);
            if (this.checkBerth()) {
                this.berthEvent();
            }
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
                case ccs.DragPanelMoveType.autoMove:
                    this.stopAutoMove();
                    this.actionStop();
                    break;

                case ccs.DragPanelMoveType.bounce:
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
            this._berthDirection = ccs.DragPanelBerthDir.none;
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

    /**
     *
     * @param {number} handleState
     * @param {ccs.UIWidget} sender
     * @param {cc.Point} touchPoint
     */
    checkChildInfo: function (handleState, sender, touchPoint) {
        this.interceptTouchEvent(handleState, sender, touchPoint);
    },

    /**
     *
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

    /**
     * check if dragpanel rect contain inner rect
     * @returns {boolean}
     */
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

    /**
     * move
     * @param delta
     */
    moveWithDelta: function (delta) {
        var newPos = cc.pAdd(this._innerContainer.getPosition(), delta);
        this._innerContainer.setPosition(newPos);
    },

    /**
     * auto move
     */
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
            this._berthDirection = ccs.DragPanelBerthDir.none;
        }
    },

    startAutoMove: function () {
        this._moveType = ccs.DragPanelMoveType.autoMove;

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
        this._moveType = ccs.DragPanelMoveType.none;
    },

    /**
     * Set auto move duration
     * @param {Number} duration
     */
    setAutoMoveDuration: function (duration) {
        this._autoMoveDuration = duration;
    },

    /**
     * Set auto move ease rate
     * @param {Number} rate
     */
    setAutoMoveEaseRate: function (rate) {
        this._autoMoveEaseRate = rate;
    },

    /**
     * check if move to boundary with update
     * @param {number} delta
     * @returns {boolean}
     */
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

    /**
     * calculate to boundary delta
     * @param {cc.Point} paramDelta
     * @returns {cc.Point}
     */
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

    /**
     * get berth or not
     * @returns {boolean}
     */
    isBerth: function () {
        return this._berthDirection != ccs.DragPanelBerthDir.none;
    },

    /**
     * Check berth
     * @returns {boolean}
     */
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
            this._berthDirection = ccs.DragPanelBerthDir.leftBottom;
        }
        // left top
        else if (innerLeft == left && innerTop == top) {
            this._berthDirection = ccs.DragPanelBerthDir.leftTop;
        }
        // right bottom
        else if (innerRight == right && innerBottom == bottom) {
            this._berthDirection = ccs.DragPanelBerthDir.rightBottom;
        }
        // right top
        else if (innerRight == right && innerTop == top) {
            this._berthDirection = ccs.DragPanelBerthDir.rightTop;
        }
        // left
        else if (innerLeft == left) {
            this._berthDirection = ccs.DragPanelBerthDir.left;
        }
        // right
        else if (innerRight == right) {
            this._berthDirection = ccs.DragPanelBerthDir.right;
        }
        // top
        else if (innerTop == top) {
            this._berthDirection = ccs.DragPanelBerthDir.top;
        }
        // bottom
        else if (innerBottom == bottom) {
            this._berthDirection = ccs.DragPanelBerthDir.bottom;
        }

        if (this._berthDirection != ccs.DragPanelBerthDir.none) {
            return true;
        }

        return false;
    },

    /**
     * Berth event
     */
    berthEvent: function () {
        switch (this._berthDirection) {
            case ccs.DragPanelBerthDir.leftBottom:
                this.berthToLeftBottomEvent();
                break;

            case ccs.DragPanelBerthDir.leftTop:
                this.berthToLeftTopEvent();
                break;

            case ccs.DragPanelBerthDir.rightBottom:
                this.berthToRightBottomEvent();
                break;

            case ccs.DragPanelBerthDir.rightTop:
                this.berthToRightTopEvent();
                break;

            case ccs.DragPanelBerthDir.left:
                this.berthToLeftEvent();
                break;

            case ccs.DragPanelBerthDir.top:
                this.berthToTopEvent();
                break;

            case ccs.DragPanelBerthDir.right:
                this.berthToRightEvent();
                break;

            case ccs.DragPanelBerthDir.bottom:
                this.berthToBottomEvent();
                break;

            default:
                break;
        }
    },

    berthToLeftBottomEvent: function () {
        if (this._eventLister && this._eventSelector) {
            this._eventSelector.call(this._eventLister, this, ccs.DragPanelEventType.berthLeftBottom);
        }
    },

    berthToLeftTopEvent: function () {
        if (this._eventLister && this._eventSelector) {
            this._eventSelector.call(this._eventLister, this, ccs.DragPanelEventType.berthLeftTop);
        }
    },

    berthToRightBottomEvent: function () {
        if (this._eventLister && this._eventSelector) {
            this._eventSelector.call(this._eventLister, this, ccs.DragPanelEventType.berthRightBottom);
        }
    },

    berthToRightTopEvent: function () {
        if (this._eventLister && this._eventSelector) {
            this._eventSelector.call(this._eventLister, this, ccs.DragPanelEventType.berthRightTop);
        }
    },

    berthToLeftEvent: function () {
        if (this._eventLister && this._eventSelector) {
            this._eventSelector.call(this._eventLister, this, ccs.DragPanelEventType.berthLeft);
        }
    },

    berthToTopEvent: function () {
        if (this._eventLister && this._eventSelector) {
            this._eventSelector.call(this._eventLister, this, ccs.DragPanelEventType.berthTop);
        }
    },

    berthToRightEvent: function () {
        if (this._eventLister && this._eventSelector) {
            this._eventSelector.call(this._eventLister, this, ccs.DragPanelEventType.berthRight);
        }
    },

    berthToBottomEvent: function () {
        if (this._eventLister && this._eventSelector) {
            this._eventSelector.call(this._eventLister, this, ccs.DragPanelEventType.berthBottom)
        }
    },

    /**
     * @param {Function} selector
     * @param {Object} target
     */
    addEventListener: function (selector, target) {
        this._eventSelector = selector;
        this._eventLister = target;
    },

    /**
     * Get and set bounce enable
     * @returns {number}
     */
    isBounceEnabled: function () {
        return this._bounceEnable;
    },

    /**
     * Set and set bounce enable
     * @param {Boolean} bounce
     */
    setBounceEnabled: function (bounce) {
        this._bounceEnable = bounce;
    },

    /**
     * Check is need bounce
     * @returns {boolean}
     */
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
        if (this._moveType == ccs.DragPanelMoveType.bounce) {
            return;
        }

        this.actionStop();
        this._moveType = ccs.DragPanelMoveType.bounce;
        this.bounceToCorner();
    },

    stopBounce: function () {
        this._moveType = ccs.DragPanelMoveType.none;
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

            this._bounceDirection = ccs.DragPanelBounceDir.leftBottom;
        }
        // left top
        else if (innerLeft > left && innerTop < top) {
            from_x = innerLeft;
            from_y = innerTop;
            to_x = left;
            to_y = top;

            this._bounceDirection = ccs.DragPanelBounceDir.leftTop;
        }
        // right bottom
        else if (innerRight < right && innerBottom > bottom) {
            from_x = innerRight;
            from_y = innerBottom;
            to_x = right;
            to_y = bottom;

            this._bounceDirection = ccs.DragPanelBounceDir.rightBottom;
        }
        // right top
        else if (innerRight < right && innerTop < top) {
            from_x = innerRight;
            from_y = innerTop;
            to_x = right;
            to_y = top;

            this._bounceDirection = ccs.DragPanelBounceDir.rightTop;
        }
        // left
        else if (innerLeft > left) {
            from_x = innerLeft;
            from_y = innerBottom;
            to_x = left;
            to_y = from_y;

            this._bounceDirection = ccs.DragPanelBounceDir.left;
        }
        // top
        else if (innerTop < top) {
            from_x = innerLeft;
            from_y = innerTop;
            to_x = from_x;
            to_y = top;

            this._bounceDirection = ccs.DragPanelBounceDir.top;
        }
        // right
        else if (innerRight < right) {
            from_x = innerRight;
            from_y = innerBottom;
            to_x = right;
            to_y = from_y;

            this._bounceDirection = ccs.DragPanelBounceDir.right;
        }
        // bottom
        else if (innerBottom > bottom) {
            from_x = innerLeft;
            from_y = innerBottom;
            to_x = from_x;
            to_y = bottom;

            this._bounceDirection = ccs.DragPanelBounceDir.bottom;
        }
        delta = cc.pSub(cc.p(to_x, to_y), cc.p(from_x, from_y));

        this.actionStartWithWidget(this._innerContainer);
        this.moveByWithDuration(this._bounceDuration, delta);
    },

    bounceOver: function () {
        this.stopBounce();

        switch (this._bounceDirection) {
            case ccs.DragPanelBounceDir.leftBottom:
                this.bounceToLeftBottomEvent();
                break;

            case ccs.DragPanelBounceDir.leftTop:
                this.bounceToLeftTopEvent();
                break;

            case ccs.DragPanelBounceDir.rightBottom:
                this.bounceToRightBottomEvent();
                break;

            case ccs.DragPanelBounceDir.rightTop:
                this.bounceToRightTopEvent();
                break;

            case ccs.DragPanelBounceDir.left:
                this.bounceToLeftEvent();
                break;

            case ccs.DragPanelBounceDir.top:
                this.bounceToTopEvent();
                break;

            case ccs.DragPanelBounceDir.right:
                this.bounceToRightEvent();
                break;

            case ccs.DragPanelBounceDir.bottom:
                this.bounceToBottomEvent();
                break;

            default:
                break;
        }

        this._bounceDirection = ccs.DragPanelBounceDir.none;
    },

    bounceToLeftBottomEvent: function () {
        if (this._eventLister && this._eventSelector) {
            this._eventSelector.call(this._eventLister, this, ccs.DragPanelEventType.bounceLeftBottom);
        }

    },

    bounceToLeftTopEvent: function () {
        if (this._eventLister && this._eventSelector) {
            this._eventSelector.call(this._eventLister, this, ccs.DragPanelEventType.bounceLeftTop);
        }
    },

    bounceToRightBottomEvent: function () {
        if (this._eventLister && this._eventSelector) {
            this._eventSelector.call(this._eventLister, this, ccs.DragPanelEventType.bounceRightBottom);
        }
    },

    bounceToRightTopEvent: function () {
        if (this._eventLister && this._eventSelector) {
            this._eventSelector.call(this._eventLister, this, ccs.DragPanelEventType.bounceRightTop);
        }
    },

    bounceToLeftEvent: function () {
        if (this._eventLister && this._eventSelector) {
            this._eventSelector.call(this._eventLister, this, ccs.DragPanelEventType.bounceLeft);
        }
    },

    bounceToTopEvent: function () {
        if (this._eventLister && this._eventSelector) {
            this._eventSelector.call(this._eventLister, this, ccs.DragPanelEventType.bounceTop);
        }

    },

    bounceToRightEvent: function () {
        if (this._eventLister && this._eventSelector) {
            this._eventSelector.call(this._eventLister, this, ccs.DragPanelEventType.bounceRight);
        }

    },

    bounceToBottomEvent: function () {
        if (this._eventLister && this._eventSelector) {
            this._eventSelector.call(this._eventLister, this, ccs.DragPanelEventType.bounceBottom);
        }
    },

    /**
     * Set duration
     * @param {number} duration
     */
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
            case ccs.DragPanelMoveType.autoMove:
                this.autoMoveOver();
                break;

            case ccs.DragPanelMoveType.bounce:
                this.bounceOver();
                break;

            default:
                break;
        }
    },

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
            case ccs.DragPanelMoveType.autoMove:
                easeRate = this._autoMoveEaseRate;
                break;

            case ccs.DragPanelMoveType.bounce:
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
            case ccs.DragPanelMoveType.autoMove:
                this.autoMove();
                break;

            default:
                break;
        }
    },

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
ccs.UIDragPanel.create = function () {
    var uiDragPanel = new ccs.UIDragPanel();
    if (uiDragPanel && uiDragPanel.init()) {
        return uiDragPanel;
    }
    return null;
};