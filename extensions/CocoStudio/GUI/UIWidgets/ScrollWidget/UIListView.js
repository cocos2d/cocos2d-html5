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
 *  list view direction
 */
cc.ListViewDirection = {
    NONE: 0,
    VERTICAL: 1,
    HORIZONTAL: 2
};

/**
 *  list view scroll direction
 */
cc.ListViewMoveDirection = {
    NONE: 0,
    UP: 1,
    DOWN: 2,
    LEFT: 3,
    RIGHT: 4
};

cc.ListViewEventType = {
    INIT_CHILD: 0,
    UPDATE_CHILD: 1
};

/**
 * Base class for cc.UIListView
 * @class
 * @extends cc.Layout
 */
cc.UIListView = cc.Layout.extend({
    _direction: null,
    _moveDirection: null,
    _touchStartLocation: 0,
    _touchEndLocation: 0,
    _touchMoveStartLocation: 0,
    _topBoundary: 0,//test
    _bottomBoundary: 0,//test
    _leftBoundary: 0,
    _rightBoundary: 0,
    _autoScroll: false,
    _autoScrollOriginalSpeed: 0,
    _autoScrollAcceleration: 0,
    _bePressed: false,
    _slidTime: 0,
    _moveChildPoint: null,
    _childFocusCancelOffset: 0,
    _childPool: null,
    _updatePool: null,
    _dataLength: 0,
    _begin: 0,
    _end: 0,
    _updateChild: null,
    _updateDataIndex: 0,
    _updateSuccess: false,
    _overTopArray: null,
    _overBottomArray: null,
    _overLeftArray: null,
    _overRightArray: null,
    _disBoundaryToChild_0: 0,
    _disBetweenChild: 0,

    _eventListener: null,
    _eventSelector: null,
    ctor: function () {
        cc.Layout.prototype.ctor.call(this);

        this._direction = cc.ListViewDirection.VERTICAL;
        this._moveDirection = cc.ListViewMoveDirection.NONE;
        this._touchStartLocation = 0;
        this._touchEndLocation = 0;
        this._touchMoveStartLocation = 0;
        this._topBoundary = 0;//test
        this._bottomBoundary = 0;//test
        this._leftBoundary = 0;
        this._rightBoundary = 0;
        this._autoScroll = false;
        this._autoScrollOriginalSpeed = 0;
        this._autoScrollAcceleration = 600;
        this._bePressed = false;
        this._slidTime = 0;
        this._moveChildPoint = null;
        this._childFocusCancelOffset = 50;
        this._childPool = [];
        this._updatePool = [];
        this._dataLength = 0;
        this._begin = 0;
        this._end = 0;
        this._updateChild = null;
        this._updateDataIndex = -1;
        this._updateSuccess = false;
        this._overTopArray = [];
        this._overBottomArray = [];
        this._overLeftArray = [];
        this._overRightArray = [];
        this._disBoundaryToChild_0 = 0;
        this._disBetweenChild = 0;
        this._eventListener = null;
        this._eventSelector = null;
    },
    init: function () {
        if (cc.Layout.prototype.init.call(this)) {
            this.setUpdateEnabled(true);
            this.setTouchEnabled(true);
            this.setClippingEnabled(true);
            this._childPool = [];
            this._updatePool = [];
            this._overTopArray = [];
            this._overBottomArray = [];
            this._overLeftArray = [];
            this._overRightArray = [];
            return true;
        }
        return false;
    },

    onSizeChanged: function () {
        cc.Layout.prototype.onSizeChanged.call(this);
        this._topBoundary = this._size.height;
        this._rightBoundary = this._size.width;
    },

    /**
     * Add widget child override
     * @param {cc.UIWidget} widget
     * @returns {boolean}
     */
    addChild: function (widget) {
        cc.Layout.prototype.addChild.call(this,widget);
        this.resetProperty();
        return true;
    },

    /**
     * remove all widget children override
     */
    removeAllChildren: function () {
        this._updatePool = [];
        this._childPool = [];
        cc.Layout.prototype.removeAllChildren.call(this);
    },

    /**
     *  remove widget child override
     * @param {cc.UIWidget} child
     * @returns {boolean}
     */
    removeChild: function (child) {
        var value = false;

        if (cc.Layout.prototype.removeChild.call(this,child)) {
            value = true;
            this.resetProperty();
        }

        return value;
    },

    onTouchBegan: function (touchPoint) {
        var pass = cc.Layout.prototype.onTouchBegan.call(this,touchPoint);
        this.handlePressLogic(touchPoint);
        return pass;
    },

    onTouchMoved: function (touchPoint) {
        cc.Layout.prototype.onTouchMoved.call(this,touchPoint);
        this.handleMoveLogic(touchPoint);
    },

    onTouchEnded: function (touchPoint) {
        cc.Layout.prototype.onTouchEnded.call(this,touchPoint);
        this.handleReleaseLogic(touchPoint);
    },

    onTouchCancelled: function (touchPoint) {
        cc.Layout.prototype.onTouchCancelled.call(this,touchPoint);
    },

    onTouchLongClicked: function (touchPoint) {

    },

    update: function (dt) {
        if (this._autoScroll) {
            this.autoScrollChildren(dt);
        }
        this.recordSlidTime(dt);
    },

    /**
     * direction setter
     * @param {cc.ListViewDirection} dir
     */
    setDirection: function (dir) {
        this._direction = dir;
    },

    /**
     * direction getter
     * @param {cc.ListViewDirection} dir
     */
    getDirection: function () {
        return this._direction;
    },

    resetProperty: function () {
        var arrayChildren = this._children;

        if (arrayChildren.length <= 0) {
            return;
        }

        switch (this._direction) {
            case cc.ListViewDirection.VERTICAL: // vertical
                if (this._topBoundary == 0) {
                    return;
                }
                break;

            case cc.ListViewDirection.HORIZONTAL: // horizontal
                if (this._rightBoundary == 0) {
                    return;
                }
                break;

            default:
                break;
        }

        var scroll_top = this._topBoundary;
        var scroll_left = this._leftBoundary;

        switch (this._children.length) {
            case 1:
            {
                var child_0 = arrayChildren[0];

                switch (this._direction) {
                    case cc.ListViewDirection.VERTICAL: // vertical
                    {
                        var child_0_top = child_0.getTopInParent();
                        this._disBoundaryToChild_0 = scroll_top - child_0_top;
                    }
                        break;

                    case cc.ListViewDirection.HORIZONTAL: // horizontal
                    {
                        var child_0_left = child_0.getLeftInParent();
                        this._disBoundaryToChild_0 = child_0_left - scroll_left;
                    }
                        break;

                    default:
                        break;
                }
            }
                break;

            default:
            {
                var child_0 = arrayChildren[0];
                var child_1 = arrayChildren[1];

                switch (this._direction) {
                    case cc.ListViewDirection.VERTICAL: // vertical
                    {
                        var child_0_top = child_0.getTopInParent();
                        this._disBoundaryToChild_0 = scroll_top - child_0_top;
                        this._disBetweenChild = child_0.getPosition().y - child_1.getPosition().y;
                    }
                        break;

                    case cc.ListViewDirection.HORIZONTAL: // horizontal
                    {
                        var child_0_left = child_0.getLeftInParent();
                        this._disBoundaryToChild_0 = child_0_left - scroll_left;
                        this._disBetweenChild = child_1.getPosition().x - child_0.getPosition().x;
                    }
                        break;

                    default:
                        break;
                }
            }
                break;
        }
    },

    handlePressLogic: function (touchPoint) {
        var nsp = this._renderer.convertToNodeSpace(touchPoint);

        switch (this._direction) {
            case cc.ListViewDirection.VERTICAL: // vertical
                this._touchMoveStartLocation = nsp.y;
                this._touchStartLocation = nsp.y;
                break;

            case cc.ListViewDirection.HORIZONTAL: // horizontal
                this._touchMoveStartLocation = nsp.x;
                this._touchStartLocation = nsp.x;
                break;

            default:
                break;
        }
        this.startRecordSlidAction();
        this.clearCollectOverArray();
    },

    handleMoveLogic: function (touchPoint) {
        var nsp = this._renderer.convertToNodeSpace(touchPoint);
        var offset = 0;

        switch (this._direction) {
            case cc.ListViewDirection.VERTICAL: // vertical
            {
                var moveY = nsp.y;
                offset = moveY - this._touchMoveStartLocation;
                this._touchMoveStartLocation = moveY;

                if (offset < 0) {
                    this._moveDirection = cc.ListViewMoveDirection.DOWN; // down
                }
                else if (offset > 0) {
                    this._moveDirection = cc.ListViewMoveDirection.UP; // up
                }
            }
                break;

            case cc.ListViewDirection.HORIZONTAL: // horizontal
            {
                var moveX = nsp.x;
                offset = moveX - this._touchMoveStartLocation;
                this._touchMoveStartLocation = moveX;

                if (offset < 0) {
                    this._moveDirection = cc.ListViewMoveDirection.LEFT; // left
                }
                else if (offset > 0) {
                    this._moveDirection = cc.ListViewMoveDirection.RIGHT; // right
                }
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
            case cc.ListViewDirection.VERTICAL: // vertical
                this._touchEndLocation = nsp.y;
                break;

            case cc.ListViewDirection.HORIZONTAL: // horizontal
                this._touchEndLocation = nsp.x;
                break;

            default:
                break;
        }
        this.endRecordSlidAction();
    },

    /**
     * Intercept touch event
     * @param {number} handleState
     * @param {cc.UIWidget} sender
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
                    case cc.ListViewDirection.VERTICAL: // vertical
                        offset = Math.abs(sender.getTouchStartPos().y - touchPoint.y);
                        break;
                    case cc.ListViewDirection.HORIZONTAL: // horizontal
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
     * @param {cc.UIWidget} sender
     * @param {cc.Point} touchPoint
     */
    checkChildInfo: function (handleState, sender, touchPoint) {
        this.interceptTouchEvent(handleState, sender, touchPoint);
    },

    moveChildren: function (offset) {
        switch (this._direction) {
            case cc.ListViewDirection.VERTICAL: // vertical
                var arrayChildren = this._children;
                for (var i = 0; i < arrayChildren.length; i++) {
                    var child = arrayChildren[i];
                    var pos = child.getPosition();
                    child.setPosition(cc.p(pos.x, pos.y + offset));
                }
                break;
            case cc.ListViewDirection.HORIZONTAL: // horizontal
                var arrayChildren = this._children;
                for (var i = 0; i < arrayChildren.length; i++) {
                    var child = arrayChildren[i];
                    var pos = child.getPosition();
                    child.setPosition(cc.p(pos.x + offset, pos.y));
                }
                break;
            default:
                break;
        }
    },

    scroll_VERTICAL_UP:function(realOffset){
        realOffset = Math.min(realOffset, this._disBetweenChild);

        var child_last = this._childPool[this._childPool.length - 1];
        var child_last_bottom = child_last.getBottomInParent();
        var scroll_bottom = this._bottomBoundary;

        if (this._end == this._dataLength - 1) {
            if (realOffset > scroll_bottom + this._disBoundaryToChild_0 - child_last_bottom) {
                realOffset = scroll_bottom + this._disBoundaryToChild_0 - child_last_bottom;
            }
            this.moveChildren(realOffset);
            return false;
        }
        this.moveChildren(realOffset);

        if (this._end < this._dataLength - 1) {
            this.collectOverTopChild();
            var count = this._overTopArray.length;
            if (count > 0) {
                this.updateChild();
                this.setLoopPosition();
                this._overTopArray = [];
            }
        }
    },
    scroll_VERTICAL_DOWN:function(realOffset){
        realOffset = Math.max(realOffset, -this._disBetweenChild);

        var child_0 = this._childPool[0];
        var child_0_top = child_0.getTopInParent();
        var scroll_top = this._topBoundary;

        if (this._begin == 0) {
            if (realOffset < scroll_top - this._disBoundaryToChild_0 - child_0_top) {
                realOffset = scroll_top - this._disBoundaryToChild_0 - child_0_top;
            }
            this.moveChildren(realOffset);
            return false;
        }
        this.moveChildren(realOffset);

        if (this._begin > 0) {
            this.collectOverBottomChild();
            var count = this._overBottomArray.length;
            if (count > 0) {
                this.updateChild();
                this.setLoopPosition();
                this._overBottomArray = [];
            }
        }
    },
    scroll_HORIZONTAL_LEFT:function(realOffset){
        realOffset = Math.max(realOffset, -this._disBetweenChild);

        var child_last = this._childPool[this._childPool.length - 1];
        var child_last_right = child_last.getRightInParent();
        var scroll_right = this._rightBoundary;

        if (this._end == this._dataLength - 1) {
            if (realOffset < scroll_right - this._disBoundaryToChild_0 - child_last_right) {
                realOffset = scroll_right - this._disBoundaryToChild_0 - child_last_right;
            }
            this.moveChildren(realOffset);
            return false;
        }
        this.moveChildren(realOffset);

        if (this._end < this._dataLength - 1) {
            this.collectOverLeftChild();
            var count = this._overLeftArray.length;
            if (count > 0) {
                this.updateChild();
                this.setLoopPosition();
                this._overLeftArray = [];
            }
        }
    },
    scroll_HORIZONTAL_RIGHT:function(realOffset){
        realOffset = Math.min(realOffset, this._disBetweenChild);

        var child_0 = this._childPool[0];
        var child_0_left = child_0.getLeftInParent();
        var scroll_left = this._leftBoundary;

        if (this._begin == 0) {
            if (realOffset > scroll_left + this._disBoundaryToChild_0 - child_0_left) {
                realOffset = scroll_left + this._disBoundaryToChild_0 - child_0_left;
            }
            this.moveChildren(realOffset);
            return false;
        }
        this.moveChildren(realOffset);

        this.collectOverRightChild();
        var count = this._overRightArray.length;
        if (count > 0) {
            this.updateChild();
            this.setLoopPosition();
            this._overRightArray = [];
        }
    },
    scrollChildren: function (touchOffset) {
        var realOffset = touchOffset;

        switch (this._direction) {
            case cc.ListViewDirection.VERTICAL: // vertical
                switch (this._moveDirection) {
                    case cc.ListViewMoveDirection.UP: // up
                        this.scroll_VERTICAL_UP(realOffset);
                        break;
                    case cc.ListViewMoveDirection.DOWN: // down
                        this.scroll_VERTICAL_DOWN(realOffset);
                        break;
                    default:
                        break;
                }
                return true;
                break;

            case cc.ListViewDirection.HORIZONTAL: // horizontal
                switch (this._moveDirection) {
                    case cc.ListViewMoveDirection.LEFT: // left
                        this.scroll_HORIZONTAL_LEFT(realOffset);
                        break;
                    case cc.ListViewMoveDirection.RIGHT: // right
                        this.scroll_HORIZONTAL_RIGHT(realOffset);
                        break;
                    default:
                        break;
                }
                return true;
                break;
            default:
                break;
        }
        return false;
    },

    autoScrollChildren: function (dt) {
        switch (this._direction) {
            case cc.ListViewDirection.VERTICAL: // vertical
                switch (this._moveDirection) {
                    case cc.ListViewMoveDirection.UP: // up
                        var curDis = this.getCurAutoScrollDistance(dt);
                        if (curDis <= 0) {
                            curDis = 0;
                            this.stopAutoScrollChildren();
                        }
                        if (!this.scrollChildren(curDis)) {
                            this.stopAutoScrollChildren();
                        }
                        break;

                    case cc.ListViewMoveDirection.DOWN: // down
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

            case cc.ListViewDirection.HORIZONTAL: // horizontal
                switch (this._moveDirection) {
                    case cc.ListViewMoveDirection.LEFT: // left
                        var curDis = this.getCurAutoScrollDistance(dt);
                        if (curDis <= 0) {
                            curDis = 0;
                            this.stopAutoScrollChildren();
                        }
                        if (!this.scrollChildren(-curDis)) {
                            this.stopAutoScrollChildren();
                        }
                        break;

                    case cc.ListViewMoveDirection.RIGHT: // right
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

    getCurAutoScrollDistance: function (dt) {
        this._autoScrollOriginalSpeed -= this._autoScrollAcceleration * dt;
        return this._autoScrollOriginalSpeed * dt;
    },

    startAutoScrollChildren: function (v) {
        this._autoScrollOriginalSpeed = v;
        this._autoScroll = true;
    },

    stopAutoScrollChildren: function () {
        this._autoScroll = false;
        this._autoScrollOriginalSpeed = 0;
    },

    recordSlidTime: function (dt) {
        if (this._bePressed) {
            this._slidTime += dt;
        }
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
        this.startAutoScrollChildren(orSpeed / 4);

        this._bePressed = false;
        this._slidTime = 0.0;
    },

    getCheckPositionChild: function () {
        var child = null;

        switch (this._direction) {
            case cc.ListViewDirection.VERTICAL: // vertical
                switch (this._moveDirection) {
                    case cc.ListViewMoveDirection.UP: // up
                        child = this._childPool[this._childPool.length];
                        break;

                    case cc.ListViewMoveDirection.DOWN: // down
                        child = this._childPool[0];
                        break;

                    default:
                        break;
                }
                break;

            case cc.ListViewDirection.HORIZONTAL: // horizontal
                switch (this._moveDirection) {
                    case cc.ListViewMoveDirection.LEFT: // left
                        child = this._childPool[this._childPool.length];
                        break;

                    case cc.ListViewMoveDirection.RIGHT: // right
                        child = this._childPool[0];
                        break;

                    default:
                        break;
                }
                break;

            default:
                break;
        }

        return child;
    },

    initChildWithDataLength: function (length) {
        this._dataLength = length;
        this._begin = 0;
        this._end = 0;

        // init child pool
        var arrayChildren = this._children;
        for (var i = 0; i < arrayChildren.length; ++i) {
            var child = arrayChildren[i];
            this.setUpdateChild(child);
            this.setUpdateDataIndex(i);
            this.initChildEvent();
            this._childPool.push(child);
            this._end = i;
        }
    },

    getChildFromUpdatePool: function () {
        var child = this._updatePool.pop();
        return child;
    },

    pushChildToPool: function () {
        switch (this._direction) {
            case cc.ListViewDirection.VERTICAL: // vertical
                switch (this._moveDirection) {
                    case cc.ListViewMoveDirection.UP: // up
                        var child = this._childPool.shift();
                        cc.ArrayAppendObjectToIndex(this._updatePool,child,0);
                        break;
                    case cc.ListViewMoveDirection.DOWN: // down
                        var child = this._childPool.pop();
                        cc.ArrayAppendObjectToIndex(this._updatePool,child,0);
                        break;
                    default:
                        break;
                }
                break;

            case cc.ListViewDirection.HORIZONTAL: // horizontal
                switch (this._moveDirection) {
                    case cc.ListViewMoveDirection.LEFT: // left
                        var child = this._childPool.shift();
                        cc.ArrayAppendObjectToIndex(this._updatePool,child,0);
                        break;

                    case cc.ListViewMoveDirection.RIGHT: // right
                        var child = this._childPool.pop();
                        cc.ArrayAppendObjectToIndex(this._updatePool,child,0);
                        break;

                    default:
                        break;
                }
                break;

            default:
                break;
        }
    },

    getAndCallback: function () {
        var child = this.getChildFromUpdatePool();

        if (child == null) {
            return;
        }

        switch (this._direction) {
            case cc.ListViewDirection.VERTICAL: // vertical
                switch (this._moveDirection) {
                    case cc.ListViewMoveDirection.UP: // up
                        ++this._end;
                        this.setUpdateChild(child);
                        this.setUpdateDataIndex(this._end);
                        this.updateChildEvent();

                        if (this._updateSuccess == false) {
                            --this._end;
                            cc.ArrayAppendObjectToIndex(this._childPool, child, 0);
                            return;
                        }
                        ++this._begin;
                        break;

                    case cc.ListViewMoveDirection.DOWN: // down
                        --this._begin;
                        this.setUpdateChild(child);
                        this.setUpdateDataIndex(this._begin);
                        this.updateChildEvent();

                        if (this._updateSuccess == false) {
                            ++this._begin;
                            this._childPool.push(child);
                            return;
                        }
                        --this._end;
                        break;

                    default:
                        break;
                }
                break;

            case cc.ListViewDirection.HORIZONTAL: // horizontal
                switch (this._moveDirection) {
                    case cc.ListViewMoveDirection.LEFT: // left
                        ++this._end;
                        this.setUpdateChild(child);
                        this.setUpdateDataIndex(this._end);
                        this.updateChildEvent();

                        if (this._updateSuccess == false) {
                            --this._end;
                            cc.ArrayAppendObjectToIndex(this._childPool, child, 0);
                            return;
                        }
                        ++this._begin;
                        break;

                    case cc.ListViewMoveDirection.RIGHT: // right
                        --this._begin;
                        this.setUpdateChild(child);
                        this.setUpdateDataIndex(this._begin);
                        this.updateChildEvent();

                        if (this._updateSuccess == false) {
                            ++this._begin;
                            this._childPool.push(child);
                            return;
                        }
                        --this._end;
                        break;

                    default:
                        break;
                }
                break;

            default:
                break;
        }

        switch (this._direction) {
            case cc.ListViewDirection.VERTICAL: // vertical
                switch (this._moveDirection) {
                    case cc.ListViewMoveDirection.UP: // up
                        this._childPool.push(child);
                        break;

                    case cc.ListViewMoveDirection.DOWN: // down
                        cc.ArrayAppendObjectToIndex(this._childPool, child, 0);
                        break;

                    default:
                        break;
                }
                break;

            case cc.ListViewDirection.HORIZONTAL: // horizontal
                switch (this._moveDirection) {
                    case cc.ListViewMoveDirection.LEFT: // left
                        this._childPool.push(child);
                        break;
                    case cc.ListViewMoveDirection.RIGHT: // right
                        cc.ArrayAppendObjectToIndex(this._childPool, child, 0);
                        break;

                    default:
                        break;
                }
                break;

            default:
                break;
        }
    },

    getDataLength: function () {
        return this._dataLength;
    },

    getUpdateChild: function () {
        return this._updateChild;
    },

    setUpdateChild: function (child) {
        this._updateChild = child;
    },

    getUpdateDataIndex: function () {
        return this._updateDataIndex;
    },

    setUpdateDataIndex: function (index) {
        this._updateDataIndex = index;
    },

    getUpdateSuccess: function () {
        return this._updateSuccess;
    },

    setUpdateSuccess: function (sucess) {
        this._updateSuccess = sucess;
    },

    clearCollectOverArray: function () {
        switch (this._direction) {
            case cc.ListViewDirection.VERTICAL:
                this._overTopArray = [];
                this._overBottomArray = [];
                break;

            case cc.ListViewDirection.HORIZONTAL:
                this._overLeftArray = [];
                this._overRightArray = [];
                break;

            default:
                break;
        }
    },

    collectOverTopChild: function () {
        var scroll_top = this._topBoundary;

        var arrayChildren = this._children;
        for (var i = 0; i < arrayChildren.length; ++i) {
            var child = arrayChildren[i];
            var child_bottom = child.getBottomInParent();

            if (child_bottom >= scroll_top)
                this._overTopArray.push(child);
        }
    },

    collectOverBottomChild: function () {
        var scroll_bottom = this._bottomBoundary;

        var arrayChildren = this._children;
        for (var i = 0; i < arrayChildren.length; ++i) {
            var child = arrayChildren[i];
            var child_top = child.getTopInParent();

            if (child_top <= scroll_bottom)
                this._overBottomArray.push(child);
        }
    },

    collectOverLeftChild: function () {
        var scroll_left = this._leftBoundary;

        var arrayChildren = this._children;
        for (var i = 0; i < arrayChildren.length; ++i) {
            var child = arrayChildren[i];
            var child_right = child.getRightInParent();
            if (child_right <= scroll_left)
                this._overLeftArray.push(child);
        }
    },

    collectOverRightChild: function () {
        var scroll_right = this._rightBoundary;

        var arrayChildren = this._children;
        for (var i = 0; i < arrayChildren.length; ++i) {
            var child = arrayChildren[i];
            var child_left = child.getLeftInParent();
            if (child_left >= scroll_right)
                this._overRightArray.push(child);
        }
    },

    setLoopPosition: function () {
        switch (this._direction) {
            case cc.ListViewDirection.VERTICAL: // vertical
                switch (this._moveDirection) {
                    case cc.ListViewMoveDirection.UP: // up
                        var arrayChildren = this._children;
                        if (this._overTopArray.length == arrayChildren.length) {
                            var count = arrayChildren.length;
                            for (var i = 0; i < count; ++i) {
                                var child = this._overTopArray[i];

                                if (i == 0) {
                                    var height = child.getSize().height;
                                    var offset = (child.getWidgetType() == cc.WidgetType.Widget) ? height / 2 : height;
                                    var y = this._topBoundary - this._disBoundaryToChild_0 - offset;
                                    child.setPosition(cc.p(child.getPosition().x, y));
                                }
                                else {
                                    var prev_child = this._overTopArray[i - 1];
                                    child.setPosition(cc.p(child.getPosition().x, prev_child.getPosition().y - this._disBetweenChild));
                                }
                            }
                        }
                        else {
                            var scroll_top = this._topBoundary;

                            var arrayChildren = this._children;
                            for (var i = 0; i < arrayChildren.length; ++i) {
                                var child = arrayChildren[i];
                                var child_bottom = child.getBottomInParent();

                                if (child_bottom >= scroll_top) {
                                    var index = (i == 0) ? (arrayChildren.length - 1) : (i - 1);
                                    var prev_child = arrayChildren[index];
                                    child.setPosition(cc.p(child.getPosition().x, prev_child.getPosition().y - this._disBetweenChild));
                                }
                            }
                        }
                        break;

                    case cc.ListViewMoveDirection.DOWN: // down
                        var arrayChildren = this._children;
                        var childrenCount = arrayChildren.length;
                        if (this._overBottomArray.length == childrenCount) {
                            var count = childrenCount;
                            for (var i = 0; i < count; ++i) {
                                var child = this._overBottomArray[i];

                                if (i == 0) {
                                    var y = this._bottomBoundary + this._disBoundaryToChild_0 - this._disBetweenChild;
                                    child.setPosition(cc.p(child.getPosition().x, y));
                                }
                                else {
                                    var prev_child = this._overBottomArray[i - 1];
                                    child.setPosition(cc.p(child.getPosition().x, prev_child.getPosition().y + this._disBetweenChild));
                                }
                            }
                        }
                        else {
                            var scroll_bottom = this._bottomBoundary;

                            var arrayChildren = this._children;
                            var count = arrayChildren.length;
                            for (var i = count - 1; i >= 0; --i) {
                                var child = arrayChildren[i];
                                var child_top = child.getTopInParent();

                                if (child_top <= scroll_bottom) {
                                    var index = (i == count - 1) ? 0 : (i + 1);
                                    var next_child = arrayChildren[index];
                                    child.setPosition(cc.p(child.getPosition().x, next_child.getPosition().y + this._disBetweenChild));
                                }
                            }
                        }
                        break;

                    default:
                        break;
                }
                break;

            case cc.ListViewDirection.HORIZONTAL: // horizontal
                switch (this._moveDirection) {
                    case cc.ListViewMoveDirection.LEFT: // left
                        var arrayChildren = this._children;
                        var childrenCount = arrayChildren.length;

                        if (this._overLeftArray.length == childrenCount) {
                            var count = childrenCount;
                            for (var i = 0; i < count; ++i) {
                                var child = this._overLeftArray[i];

                                if (i == 0) {
                                    var width = child.getSize().width;
                                    var offset = (child.getWidgetType() == cc.WidgetType.Widget) ? (width / 2) : 0;
                                    var x = this._leftBoundary + this._disBoundaryToChild_0 + width + offset;
                                    child.setPosition(cc.p(x, child.getPosition().y));
                                }
                                else {
                                    var prev_child = this._overLeftArray[i - 1];
                                    child.setPosition(cc.p(prev_child.getPosition().x + this._disBetweenChild, child.getPosition().y));
                                }
                            }
                        }
                        else {
                            var scroll_left = this._leftBoundary;

                            var arrayChildren = this._children;
                            var count = arrayChildren.length;
                            for (var i = 0; i < count; ++i) {
                                var child = arrayChildren[i];
                                var child_right = child.getRightInParent();

                                if (child_right <= scroll_left) {
                                    var index = (i == 0) ? (count - 1) : (i - 1);
                                    var prev_child = arrayChildren[index];
                                    child.setPosition(cc.p(prev_child.getPosition().x + this._disBetweenChild, child.getPosition().y));
                                }
                            }
                        }
                        break;

                    case cc.ListViewMoveDirection.RIGHT: // right
                        var arrayChildren = this._children;
                        var childrenCount = arrayChildren.length;

                        if (this._overRightArray.length == childrenCount) {
                            var count = childrenCount;
                            for (var i = 0; i < count; ++i) {
                                var child = this._overRightArray[i];

                                if (i == 0) {
                                    var x = this._rightBoundary - this._disBoundaryToChild_0 + this._disBetweenChild;
                                    child.setPosition(cc.p(x, child.getPosition().y));
                                }
                                else {
                                    var prev_child = this._overRightArray[i - 1];
                                    child.setPosition(cc.p(prev_child.getPosition().x - this._disBetweenChild, child.getPosition().y));
                                }
                            }
                        }
                        else {
                            var scroll_right = this._rightBoundary;

                            var arrayChildren = this._children;
                            var count = arrayChildren.length;
                            for (var i = count - 1; i >= 0; --i) {
                                var child = arrayChildren[i];
                                var child_left = child.getLeftInParent();

                                if (child_left >= scroll_right) {
                                    var index = (i == count - 1) ? 0 : (i + 1);
                                    var next_child = arrayChildren[index];
                                    child.setPosition(cc.p(next_child.getPosition().x - this._disBetweenChild, child.getPosition().y));
                                }
                            }
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

    updateChild: function () {
        switch (this._direction) {
            case cc.ListViewDirection.VERTICAL: // vertical
                switch (this._moveDirection) {
                    case cc.ListViewMoveDirection.UP: // up
                        var count = this._overTopArray.length;
                        for (var i = 0; i < count; ++i) {
                            this.pushChildToPool();
                            this.getAndCallback();
                        }
                        break;

                    case cc.ListViewMoveDirection.DOWN: // down
                        var count = this._overBottomArray.length;
                        for (var i = 0; i < count; ++i) {
                            this.pushChildToPool();
                            this.getAndCallback();
                        }
                        break;
                    default:
                        break;
                }
                break;

            case cc.ListViewDirection.HORIZONTAL: // horizontal
                switch (this._moveDirection) {
                    case cc.ListViewMoveDirection.LEFT: // left
                        var count = this._overLeftArray.length;
                        for (var i = 0; i < count; ++i) {
                            this.pushChildToPool();
                            this.getAndCallback();
                        }
                        break;
                    case cc.ListViewMoveDirection.RIGHT: // right
                        var count = this._overRightArray.length;
                        for (var i = 0; i < count; ++i) {
                            this.pushChildToPool();
                            this.getAndCallback();
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

    initChildEvent: function () {
        if (this._eventListener && this._eventSelector) {
            this._eventSelector.call(this._eventListener, this, cc.ListViewEventType.INIT_CHILD);
        }
    },

    updateChildEvent: function () {
        if (this._eventListener && this._eventSelector) {
            this._eventSelector.call(this._eventListener, this, cc.ListViewEventType.UPDATE_CHILD);
        }
    },

    addEventListenter: function (target, selector) {
        this._eventListener = target;
        this._eventSelector = selector;
    },

    getDescription: function () {
        return "ListView";
    }
});

cc.UIListView.create = function () {
    var uiListView = new cc.UIListView();
    if (uiListView && uiListView.init()) {
        return uiListView;
    }
    return null;
};