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
 * ScrollView direction
 * @type {Object}
 */
ccs.ScrollViewDir = {
    none: 0,
    vertical: 1,
    horizontal: 2,
    both: 3
};

/**
 * Scrollview event type
 * @type {Object}
 */
ccs.ScrollViewEventType = {
    scrollToTop: 0,
    scrollToBottom: 1,
    scrollToLeft: 2,
    scrollToRight: 3,
    scrolling: 4,
    bounceTop: 5,
    bounceBottom: 6,
    bounceLeft: 7,
    bounceRight: 8
};
ccs.AUTOSCROLLMAXSPEED = 1000;
ccs.SCROLLDIR_UP = cc.p(0, 1);
ccs.SCROLLDIR_DOWN = cc.p(0, -1);
ccs.SCROLLDIR_LEFT = cc.p(-1, 0);
ccs.SCROLLDIR_RIGHT = cc.p(1, 0);
/**
 * Base class for ccs.ScrollView
 * @class
 * @extends ccs.Layout
 */
ccs.ScrollView = ccs.Layout.extend(/** @lends ccs.ScrollView# */{
    _innerContainer: null,
    _direction: null,
    _touchBeganPoint: null,
    _touchMovedPoint: null,
    _touchEndedPoint: null,
    _touchMovingPoint: null,
    _autoScrollDir: null,
    _topBoundary: 0,//test
    _bottomBoundary: 0,//test
    _leftBoundary: 0,
    _rightBoundary: 0,
    _bounceTopBoundary: 0,
    _bounceBottomBoundary: 0,
    _bounceLeftBoundary: 0,
    _bounceRightBoundary: 0,
    _autoScroll: false,
    _autoScrollAddUpTime: 0,
    _autoScrollOriginalSpeed: 0,
    _autoScrollAcceleration: 0,
    _isAutoScrollSpeedAttenuated: false,
    _needCheckAutoScrollDestination: false,
    _autoScrollDestination: null,
    _bePressed: false,
    _slidTime: 0,
    _moveChildPoint: null,
    _childFocusCancelOffset: 0,
    _leftBounceNeeded: false,
    _topBounceNeeded: false,
    _rightBounceNeeded: false,
    _bottomBounceNeeded: false,
    _bounceEnabled: false,
    _bouncing: false,
    _bounceDir: null,
    _bounceOriginalSpeed: 0,
    _inertiaScrollEnabled: false,
    _scrollViewEventListener: null,
    _scrollViewEventSelector: null,
    ctor: function () {
        ccs.Layout.prototype.ctor.call(this);
        this._innerContainer = null;
        this._direction = ccs.ScrollViewDir.none;
        this._touchBeganPoint = cc.p(0, 0);
        this._touchMovedPoint = cc.p(0, 0);
        this._touchEndedPoint = cc.p(0, 0);
        this._touchMovingPoint = cc.p(0, 0);
        this._autoScrollDir = cc.p(0, 0);
        this._topBoundary = 0;//test
        this._bottomBoundary = 0;//test
        this._leftBoundary = 0;
        this._rightBoundary = 0;
        this._bounceTopBoundary = 0;
        this._bounceBottomBoundary = 0;
        this._bounceLeftBoundary = 0;
        this._bounceRightBoundary = 0;
        this._autoScroll = false;
        this._autoScrollAddUpTime = 0;
        this._autoScrollOriginalSpeed = 0;
        this._autoScrollAcceleration = -1000;
        this._isAutoScrollSpeedAttenuated = false;
        this._needCheckAutoScrollDestination = false;
        this._autoScrollDestination = cc.p(0, 0);
        this._bePressed = false;
        this._slidTime = 0;
        this._moveChildPoint = cc.p(0, 0);
        this._childFocusCancelOffset = 5;
        this._leftBounceNeeded = false;
        this._topBounceNeeded = false;
        this._rightBounceNeeded = false;
        this._bottomBounceNeeded = false;
        this._bounceEnabled = false;
        this._bouncing = false;
        this._bounceDir = cc.p(0, 0);
        this._bounceOriginalSpeed = 0;
        this._inertiaScrollEnabled = true;
        this._scrollViewEventListener = null;
        this._scrollViewEventSelector = null;
    },

    init: function () {
        if (ccs.Layout.prototype.init.call(this)) {
            this.setUpdateEnabled(true);
            this.setTouchEnabled(true);
            this.setClippingEnabled(true);
            this._innerContainer.setTouchEnabled(false);
            return true;
        }
        return false;
    },

    initRenderer: function () {
        ccs.Layout.prototype.initRenderer.call(this);
        this._innerContainer = ccs.Layout.create();
        ccs.Layout.prototype.addChild.call(this, this._innerContainer);
    },

    onSizeChanged: function () {
        ccs.Layout.prototype.onSizeChanged.call(this);
        var locSize = this._size;
        this._topBoundary = locSize.height;
        this._rightBoundary = locSize.width;
        var bounceBoundaryParameterX = locSize.width / 3;
        var bounceBoundaryParameterY = locSize.height / 3;
        this._bounceTopBoundary = locSize.height - bounceBoundaryParameterY;
        this._bounceBottomBoundary = bounceBoundaryParameterY;
        this._bounceLeftBoundary = bounceBoundaryParameterX;
        this._bounceRightBoundary = this._size.width - bounceBoundaryParameterX;
        var innerSize = this._innerContainer.getSize();
        var orginInnerSizeWidth = innerSize.width;
        var orginInnerSizeHeight = innerSize.height;
        var innerSizeWidth = Math.max(orginInnerSizeWidth, locSize.width);
        var innerSizeHeight = Math.max(orginInnerSizeHeight, locSize.height);
        this._innerContainer.setSize(cc.size(innerSizeWidth, innerSizeHeight));
        this._innerContainer.setPosition(cc.p(0, locSize.height - this._innerContainer.getSize().height));
    },

    setInnerContainerSize: function (size) {
        var locSize = this._size;
        var innerSizeWidth = locSize.width;
        var innerSizeHeight = locSize.height;
        var originalInnerSize = this._innerContainer.getSize();
        if (size.width < locSize.width) {
            cc.log("Inner width <= scrollview width, it will be force sized!");
        }
        else {
            innerSizeWidth = size.width;
        }
        if (size.height < locSize.height) {
            cc.log("Inner height <= scrollview height, it will be force sized!");
        }
        else {
            innerSizeHeight = size.height;
        }
        this._innerContainer.setSize(cc.size(innerSizeWidth, innerSizeHeight));
        switch (this._direction) {
            case ccs.ScrollViewDir.vertical:
                var newInnerSize = this._innerContainer.getSize();
                var offset = originalInnerSize.height - newInnerSize.height;
                this.scrollChildren(0, offset);
                break;
            case ccs.ScrollViewDir.horizontal:
                if (this._innerContainer.getRightInParent() <= locSize.width) {
                    var newInnerSize = this._innerContainer.getSize();
                    var offset = originalInnerSize.width - newInnerSize.width;
                    this.scrollChildren(offset, 0);
                }
                break;
            case ccs.ScrollViewDir.both:
                var newInnerSize = this._innerContainer.getSize();
                var offsetY = originalInnerSize.height - newInnerSize.height;
                var offsetX = 0;
                if (this._innerContainer.getRightInParent() <= locSize.width) {
                    offsetX = originalInnerSize.width - newInnerSize.width;
                }
                this.scrollChildren(offsetX, offsetY);
                break;
            default:
                break;
        }
        var innerContainer = this._innerContainer;
        var innerSize = innerContainer.getSize();
        var innerPos = innerContainer.getPosition();
        var innerAP = innerContainer.getAnchorPoint();
        if (innerContainer.getLeftInParent() > 0.0) {
            innerContainer.setPosition(cc.p(innerAP.x * innerSize.width, innerPos.y));
        }
        if (innerContainer.getRightInParent() < locSize.width) {
            innerContainer.setPosition(cc.p(locSize.width - ((1.0 - innerAP.x) * innerSize.width), innerPos.y));
        }
        if (innerPos.y > 0.0) {
            innerContainer.setPosition(cc.p(innerPos.x, innerAP.y * innerSize.height));
        }
        if (innerContainer.getTopInParent() < locSize.height) {
            innerContainer.setPosition(cc.p(innerPos.x, locSize.height - (1.0 - innerAP.y) * innerSize.height));
        }
    },

    getInnerContainerSize: function () {
        return this._innerContainer.getSize();
    },

    /**
     * Add widget
     * @param {ccs.Widget} widget
     * @param {Number} zOrder
     * @param {Number} tag
     * @returns {boolean}
     */
    addChild: function (widget, zOrder, tag) {
        return this._innerContainer.addChild(widget, zOrder, tag);
    },

    removeAllChildren: function () {
        this._innerContainer.removeAllChildren();
    },

    /**
     *  remove widget child override
     * @param {ccs.Widget} child
     * @returns {boolean}
     */
    removeChild: function (child) {
        return this._innerContainer.removeChild(child);
    },

    /**
     * get inner children
     * @returns {Array}
     */
    getChildren: function () {
        return this._innerContainer.getChildren();
    },

    /**
     * get the count of inner children
     * @returns {Number}
     */
    getChildrenCount: function () {
        return this._innerContainer.getChildrenCount();
    },

    /**
     * Gets a child from the container given its tag
     * @param {Number} tag
     * @returns {ccs.Widget}
     */
    getChildByTag: function (tag) {
        return this._innerContainer.getChildByTag(tag);
    },

    /**
     * Gets a child from the container given its name
     * @param {String} name
     * @returns {ccs.Widget}
     */
    getChildByName: function (name) {
        return this._innerContainer.getChildByName(name);
    },

    moveChildren: function (offsetX, offsetY) {
        var pos = this._innerContainer.getPosition();
        this._moveChildPoint.x = pos.x + offsetX;
        this._moveChildPoint.y = pos.y + offsetY;
        this._innerContainer.setPosition(this._moveChildPoint);
    },

    autoScrollChildren: function (dt) {
        var lastTime = this._autoScrollAddUpTime;
        this._autoScrollAddUpTime += dt;
        if (this._isAutoScrollSpeedAttenuated) {
            var nowSpeed = this._autoScrollOriginalSpeed + this._autoScrollAcceleration * this._autoScrollAddUpTime;
            if (nowSpeed <= 0) {
                this.stopAutoScrollChildren();
                this.checkNeedBounce();
            } else {
                var timeParam = lastTime * 2 + dt;
                var offset = (this._autoScrollOriginalSpeed + this._autoScrollAcceleration * timeParam * 0.5) * dt;
                var offsetX = offset * this._autoScrollDir.x;
                var offsetY = offset * this._autoScrollDir.y;
                if (!this.scrollChildren(offsetX, offsetY)) {
                    this.stopAutoScrollChildren();
                    this.checkNeedBounce();
                }
            }
        }
        else {
            if (this._needCheckAutoScrollDestination) {
                var xOffset = this._autoScrollDir.x * dt * this._autoScrollOriginalSpeed;
                var yOffset = this._autoScrollDir.y * dt * this._autoScrollOriginalSpeed;
                var notDone = this.checkCustomScrollDestination(xOffset, yOffset);
                var scrollCheck = this.scrollChildren(xOffset, yOffset);
                if (!notDone || !scrollCheck) {
                    this.stopAutoScrollChildren();
                    this.checkNeedBounce();
                }
            }
            else {
                if (!this.scrollChildren(this._autoScrollDir.x * dt * this._autoScrollOriginalSpeed, this._autoScrollDir.y * dt * this._autoScrollOriginalSpeed)) {
                    this.stopAutoScrollChildren();
                    this.checkNeedBounce();
                }
            }
        }
    },

    bounceChildren: function (dt) {
        var locSpeed = this._bounceOriginalSpeed;
        var locBounceDir = this._bounceDir;
        if (locSpeed <= 0.0) {
            this.stopBounceChildren();
        }
        if (!this.bounceScrollChildren(locBounceDir.x * dt * locSpeed, locBounceDir.y * dt * locSpeed)) {
            this.stopBounceChildren();
        }
    },

    checkNeedBounce: function () {
        if (!this._bounceEnabled) {
            return false;
        }
        this.checkBounceBoundary();
        if (this._topBounceNeeded || this._bottomBounceNeeded || this._leftBounceNeeded || this._rightBounceNeeded) {
            if (this._topBounceNeeded && this._leftBounceNeeded) {
                var scrollVector = cc.pSub(cc.p(0.0, this._size.height), cc.p(this._innerContainer.getLeftInParent(), this._innerContainer.getTopInParent()));
                var orSpeed = cc.pLength(scrollVector) / 0.2;
                this._bounceDir = cc.pNormalize(scrollVector);
                this.startBounceChildren(orSpeed);
            }
            else if (this._topBounceNeeded && this._rightBounceNeeded) {
                var scrollVector = cc.pSub(cc.p(this._size.width, this._size.height), cc.p(this._innerContainer.getRightInParent(), this._innerContainer.getTopInParent()));
                var orSpeed = cc.pLength(scrollVector) / 0.2;
                this._bounceDir = cc.pNormalize(scrollVector);
                this.startBounceChildren(orSpeed);
            }
            else if (this._bottomBounceNeeded && this._leftBounceNeeded) {
                var scrollVector = cc.pSub(cc.p(0, 0), cc.p(this._innerContainer.getLeftInParent(), this._innerContainer.getBottomInParent()));
                var orSpeed = cc.pLength(scrollVector) / 0.2;
                this._bounceDir = cc.pNormalize(scrollVector);
                this.startBounceChildren(orSpeed);
            }
            else if (this._bottomBounceNeeded && this._rightBounceNeeded) {
                var scrollVector = cc.pSub(cc.p(this._size.width, 0.0), cc.p(this._innerContainer.getRightInParent(), this._innerContainer.getBottomInParent()));
                var orSpeed = cc.pLength(scrollVector) / 0.2;
                this._bounceDir = cc.pNormalize(scrollVector);
                this.startBounceChildren(orSpeed);
            }
            else if (this._topBounceNeeded) {
                var scrollVector = cc.pSub(cc.p(0, this._size.height), cc.p(0.0, this._innerContainer.getTopInParent()));
                var orSpeed = cc.pLength(scrollVector) / 0.2;
                this._bounceDir = cc.pNormalize(scrollVector);
                this.startBounceChildren(orSpeed);
            }
            else if (this._bottomBounceNeeded) {
                var scrollVector = cc.pSub(cc.p(0, 0), cc.p(0.0, this._innerContainer.getBottomInParent()));
                var orSpeed = cc.pLength(scrollVector) / 0.2;
                this._bounceDir = cc.pNormalize(scrollVector);
                this.startBounceChildren(orSpeed);
            }
            else if (this._leftBounceNeeded) {
                var scrollVector = cc.pSub(cc.p(0, 0), cc.p(this._innerContainer.getLeftInParent(), 0.0));
                var orSpeed = cc.pLength(scrollVector) / 0.2;
                this._bounceDir = cc.pNormalize(scrollVector);
                this.startBounceChildren(orSpeed);
            }
            else if (this._rightBounceNeeded) {
                var scrollVector = cc.pSub(cc.p(this._size.width, 0), cc.p(this._innerContainer.getRightInParent(), 0.0));
                var orSpeed = cc.pLength(scrollVector) / 0.2;
                this._bounceDir = cc.pNormalize(scrollVector);
                this.startBounceChildren(orSpeed);
            }
            return true;
        }
        return false;
    },

    checkBounceBoundary: function () {
        var icBottomPos = this._innerContainer.getBottomInParent();
        if (icBottomPos > this._bottomBoundary) {
            this.scrollToBottomEvent();
            this._bottomBounceNeeded = true;
        }
        else {
            this._bottomBounceNeeded = false;
        }
        var icTopPos = this._innerContainer.getTopInParent();
        if (icTopPos < this._topBoundary) {
            this.scrollToTopEvent();
            this._topBounceNeeded = true;
        }
        else {
            this._topBounceNeeded = false;
        }
        var icRightPos = this._innerContainer.getRightInParent();
        if (icRightPos < this._rightBoundary) {
            this.scrollToRightEvent();
            this._rightBounceNeeded = true;
        }
        else {
            this._rightBounceNeeded = false;
        }
        var icLeftPos = this._innerContainer.getLeftInParent();
        if (icLeftPos > this._leftBoundary) {
            this.scrollToLeftEvent();
            this._leftBounceNeeded = true;
        }
        else {
            this._leftBounceNeeded = false;
        }
    },

    startBounceChildren: function (v) {
        this._bounceOriginalSpeed = v;
        this._bouncing = true;
    },

    stopBounceChildren: function () {
        this._bouncing = false;
        this._bounceOriginalSpeed = 0.0;
        this._leftBounceNeeded = false;
        this._rightBounceNeeded = false;
        this._topBounceNeeded = false;
        this._bottomBounceNeeded = false;
    },

    startAutoScrollChildrenWithOriginalSpeed: function (dir, v, attenuated, acceleration) {
        this.stopAutoScrollChildren();
        this._autoScrollDir = dir;
        this._isAutoScrollSpeedAttenuated = attenuated;
        this._autoScrollOriginalSpeed = v;
        this._autoScroll = true;
        this._autoScrollAcceleration = acceleration;
    },

    startAutoScrollChildrenWithDestination: function (des, time, attenuated) {
        this._needCheckAutoScrollDestination = false;
        this._autoScrollDestination = des;
        var dis = cc.pSub(des, this._innerContainer.getPosition());
        var dir = cc.pNormalize(dis);
        var orSpeed = 0.0;
        var acceleration = -1000.0;
        var disLength = cc.pLength(dis);
        if (attenuated) {
            acceleration = -(2 * disLength) / (time * time);
            orSpeed = 2 * disLength / time;
        }
        else {
            this._needCheckAutoScrollDestination = true;
            orSpeed = disLength / time;
        }
        this.startAutoScrollChildrenWithOriginalSpeed(dir, orSpeed, attenuated, acceleration);
    },

    jumpToDestination: function (des) {
        var finalOffsetX = des.x;
        var finalOffsetY = des.y;
        switch (this._direction) {
            case ccs.ScrollViewDir.vertical:
                if (des.y <= 0) {
                    finalOffsetY = Math.max(des.y, this._size.height - this._innerContainer.getSize().height);
                }
                break;
            case ccs.ScrollViewDir.horizontal:
                if (des.x <= 0) {
                    finalOffsetX = Math.max(des.x, this._size.width - this._innerContainer.getSize().width);
                }
                break;
            case ccs.ScrollViewDir.both:
                if (des.y <= 0) {
                    finalOffsetY = Math.max(des.y, this._size.height - this._innerContainer.getSize().height);
                }
                if (des.x <= 0) {
                    finalOffsetX = Math.max(des.x, this._size.width - this._innerContainer.getSize().width);
                }
                break;
            default:
                break;
        }
        this._innerContainer.setPosition(cc.p(finalOffsetX, finalOffsetY));
    },


    stopAutoScrollChildren: function () {
        this._autoScroll = false;
        this._autoScrollOriginalSpeed = 0;
        this._autoScrollAddUpTime = 0;
    },

    bounceScrollChildren: function (touchOffsetX, touchOffsetY) {
        var scrollEnabled = true;
        if (touchOffsetX > 0.0 && touchOffsetY > 0.0) //first quadrant //bounce to top-right
        {
            var realOffsetX = touchOffsetX;
            var realOffsetY = touchOffsetY;
            var icRightPos = this._innerContainer.getRightInParent();
            if (icRightPos + realOffsetX >= this._rightBoundary) {
                realOffsetX = this._rightBoundary - icRightPos;
                this.bounceRightEvent();
                scrollEnabled = false;
            }
            var icTopPos = this._innerContainer.getTopInParent();
            if (icTopPos + touchOffsetY >= this._topBoundary) {
                realOffsetY = this._topBoundary - icTopPos;
                this.bounceTopEvent();
                scrollEnabled = false;
            }
            this.moveChildren(realOffsetX, realOffsetY);
        }
        else if (touchOffsetX < 0.0 && touchOffsetY > 0.0) //second quadrant //bounce to top-left
        {
            var realOffsetX = touchOffsetX;
            var realOffsetY = touchOffsetY;
            var icLefrPos = this._innerContainer.getLeftInParent();
            if (icLefrPos + realOffsetX <= this._leftBoundary) {
                realOffsetX = this._leftBoundary - icLefrPos;
                this.bounceLeftEvent();
                scrollEnabled = false;
            }
            var icTopPos = this._innerContainer.getTopInParent();
            if (icTopPos + touchOffsetY >= this._topBoundary) {
                realOffsetY = this._topBoundary - icTopPos;
                this.bounceTopEvent();
                scrollEnabled = false;
            }
            this.moveChildren(realOffsetX, realOffsetY);
        }
        else if (touchOffsetX < 0.0 && touchOffsetY < 0.0) //third quadrant //bounce to bottom-left
        {
            var realOffsetX = touchOffsetX;
            var realOffsetY = touchOffsetY;
            var icLefrPos = this._innerContainer.getLeftInParent();
            if (icLefrPos + realOffsetX <= this._leftBoundary) {
                realOffsetX = this._leftBoundary - icLefrPos;
                this.bounceLeftEvent();
                scrollEnabled = false;
            }
            var icBottomPos = this._innerContainer.getBottomInParent();
            if (icBottomPos + touchOffsetY <= this._bottomBoundary) {
                realOffsetY = this._bottomBoundary - icBottomPos;
                this.bounceBottomEvent();
                scrollEnabled = false;
            }
            this.moveChildren(realOffsetX, realOffsetY);
        }
        else if (touchOffsetX > 0.0 && touchOffsetY < 0.0) //forth quadrant //bounce to bottom-right
        {
            var realOffsetX = touchOffsetX;
            var realOffsetY = touchOffsetY;
            var icRightPos = this._innerContainer.getRightInParent();
            if (icRightPos + realOffsetX >= this._rightBoundary) {
                realOffsetX = this._rightBoundary - icRightPos;
                this.bounceRightEvent();
                scrollEnabled = false;
            }
            var icBottomPos = this._innerContainer.getBottomInParent();
            if (icBottomPos + touchOffsetY <= this._bottomBoundary) {
                realOffsetY = this._bottomBoundary - icBottomPos;
                this.bounceBottomEvent();
                scrollEnabled = false;
            }
            this.moveChildren(realOffsetX, realOffsetY);
        }
        else if (touchOffsetX == 0.0 && touchOffsetY > 0.0) // bounce to top
        {
            var realOffsetY = touchOffsetY;
            var icTopPos = this._innerContainer.getTopInParent();
            if (icTopPos + touchOffsetY >= this._topBoundary) {
                realOffsetY = this._topBoundary - icTopPos;
                this.bounceTopEvent();
                scrollEnabled = false;
            }
            this.moveChildren(0.0, realOffsetY);
        }
        else if (touchOffsetX == 0.0 && touchOffsetY < 0.0) //bounce to bottom
        {
            var realOffsetY = touchOffsetY;
            var icBottomPos = this._innerContainer.getBottomInParent();
            if (icBottomPos + touchOffsetY <= this._bottomBoundary) {
                realOffsetY = this._bottomBoundary - icBottomPos;
                this.bounceBottomEvent();
                scrollEnabled = false;
            }
            this.moveChildren(0.0, realOffsetY);
        }
        else if (touchOffsetX > 0.0 && touchOffsetY == 0.0) //bounce to right
        {
            var realOffsetX = touchOffsetX;
            var icRightPos = this._innerContainer.getRightInParent();
            if (icRightPos + realOffsetX >= this._rightBoundary) {
                realOffsetX = this._rightBoundary - icRightPos;
                this.bounceRightEvent();
                scrollEnabled = false;
            }
            this.moveChildren(realOffsetX, 0.0);
        }
        else if (touchOffsetX < 0.0 && touchOffsetY == 0.0) //bounce to left
        {
            var realOffsetX = touchOffsetX;
            var icLeftPos = this._innerContainer.getLeftInParent();
            if (icLeftPos + realOffsetX <= this._leftBoundary) {
                realOffsetX = this._leftBoundary - icLeftPos;
                this.bounceLeftEvent();
                scrollEnabled = false;
            }
            this.moveChildren(realOffsetX, 0.0);
        }
        return scrollEnabled;
    },

    checkCustomScrollDestination: function (touchOffsetX, touchOffsetY) {
        var scrollEnabled = true;
        switch (this._direction) {
            case ccs.ScrollViewDir.vertical: // vertical
                if (this._autoScrollDir.y > 0) {
                    var icBottomPos = this._innerContainer.getBottomInParent();
                    if (icBottomPos + touchOffsetY >= this._autoScrollDestination.y) {
                        touchOffsetY = this._autoScrollDestination.y - icBottomPos;
                        scrollEnabled = false;
                    }
                }
                else {
                    var icBottomPos = this._innerContainer.getBottomInParent();
                    if (icBottomPos + touchOffsetY <= this._autoScrollDestination.y) {
                        touchOffsetY = this._autoScrollDestination.y - icBottomPos;
                        scrollEnabled = false;
                    }
                }
                break;
            case ccs.ScrollViewDir.horizontal: // horizontal
                if (this._autoScrollDir.x > 0) {
                    var icLeftPos = this._innerContainer.getLeftInParent();
                    if (icLeftPos + touchOffsetX >= this._autoScrollDestination.x) {
                        touchOffsetX = this._autoScrollDestination.x - icLeftPos;
                        scrollEnabled = false;
                    }
                }
                else {
                    var icLeftPos = this._innerContainer.getLeftInParent();
                    if (icLeftPos + touchOffsetX <= this._autoScrollDestination.x) {
                        touchOffsetX = this._autoScrollDestination.x - icLeftPos;
                        scrollEnabled = false;
                    }
                }
                break;
            case ccs.ScrollViewDir.both:
                if (touchOffsetX > 0.0 && touchOffsetY > 0.0) // up right
                {
                    var icLeftPos = this._innerContainer.getLeftInParent();
                    if (icLeftPos + touchOffsetX >= this._autoScrollDestination.x) {
                        touchOffsetX = this._autoScrollDestination.x - icLeftPos;
                        scrollEnabled = false;
                    }
                    var icBottomPos = this._innerContainer.getBottomInParent();
                    if (icBottomPos + touchOffsetY >= this._autoScrollDestination.y) {
                        touchOffsetY = this._autoScrollDestination.y - icBottomPos;
                        scrollEnabled = false;
                    }
                }
                else if (touchOffsetX < 0.0 && touchOffsetY > 0.0) // up left
                {
                    var icRightPos = this._innerContainer.getRightInParent();
                    if (icRightPos + touchOffsetX <= this._autoScrollDestination.x) {
                        touchOffsetX = this._autoScrollDestination.x - icRightPos;
                        scrollEnabled = false;
                    }
                    var icBottomPos = this._innerContainer.getBottomInParent();
                    if (icBottomPos + touchOffsetY >= this._autoScrollDestination.y) {
                        touchOffsetY = this._autoScrollDestination.y - icBottomPos;
                        scrollEnabled = false;
                    }
                }
                else if (touchOffsetX < 0.0 && touchOffsetY < 0.0) // down left
                {
                    var icRightPos = this._innerContainer.getRightInParent();
                    if (icRightPos + touchOffsetX <= this._autoScrollDestination.x) {
                        touchOffsetX = this._autoScrollDestination.x - icRightPos;
                        scrollEnabled = false;
                    }
                    var icTopPos = this._innerContainer.getTopInParent();
                    if (icTopPos + touchOffsetY <= this._autoScrollDestination.y) {
                        touchOffsetY = this._autoScrollDestination.y - icTopPos;
                        scrollEnabled = false;
                    }
                }
                else if (touchOffsetX > 0.0 && touchOffsetY < 0.0) // down right
                {
                    var icLeftPos = this._innerContainer.getLeftInParent();
                    if (icLeftPos + touchOffsetX >= this._autoScrollDestination.x) {
                        touchOffsetX = this._autoScrollDestination.x - icLeftPos;
                        scrollEnabled = false;
                    }
                    var icTopPos = this._innerContainer.getTopInParent();
                    if (icTopPos + touchOffsetY <= this._autoScrollDestination.y) {
                        touchOffsetY = this._autoScrollDestination.y - icTopPos;
                        scrollEnabled = false;
                    }
                }
                else if (touchOffsetX == 0.0 && touchOffsetY > 0.0) // up
                {
                    var icBottomPos = this._innerContainer.getBottomInParent();
                    if (icBottomPos + touchOffsetY >= this._autoScrollDestination.y) {
                        touchOffsetY = this._autoScrollDestination.y - icBottomPos;
                        scrollEnabled = false;
                    }
                }
                else if (touchOffsetX < 0.0 && touchOffsetY == 0.0) // left
                {
                    var icRightPos = this._innerContainer.getRightInParent();
                    if (icRightPos + touchOffsetX <= this._autoScrollDestination.x) {
                        touchOffsetX = this._autoScrollDestination.x - icRightPos;
                        scrollEnabled = false;
                    }
                }
                else if (touchOffsetX == 0.0 && touchOffsetY < 0.0) // down
                {
                    var icTopPos = this._innerContainer.getTopInParent();
                    if (icTopPos + touchOffsetY <= this._autoScrollDestination.y) {
                        touchOffsetY = this._autoScrollDestination.y - icTopPos;
                        scrollEnabled = false;
                    }
                }
                else if (touchOffsetX > 0.0 && touchOffsetY == 0.0) // right
                {
                    var icLeftPos = this._innerContainer.getLeftInParent();
                    if (icLeftPos + touchOffsetX >= this._autoScrollDestination.x) {
                        touchOffsetX = this._autoScrollDestination.x - icLeftPos;
                        scrollEnabled = false;
                    }
                }
                break;
            default:
                break;
        }
        return scrollEnabled;
    },


    getCurAutoScrollDistance: function (dt) {
        this._autoScrollOriginalSpeed -= this._autoScrollAcceleration * dt;
        return this._autoScrollOriginalSpeed * dt;
    },

    scrollChildren: function (touchOffsetX, touchOffsetY) {
        var scrollEnabled = true;
        this.scrollingEvent();
        switch (this._direction) {
            case ccs.ScrollViewDir.vertical: // vertical
                var realOffset = touchOffsetY;
                if (this._bounceEnabled) {
                    var icBottomPos = this._innerContainer.getBottomInParent();
                    if (icBottomPos + touchOffsetY >= this._bounceBottomBoundary) {
                        realOffset = this._bounceBottomBoundary - icBottomPos;
                        this.scrollToBottomEvent();
                        scrollEnabled = false;
                    }
                    var icTopPos = this._innerContainer.getTopInParent();
                    if (icTopPos + touchOffsetY <= this._bounceTopBoundary) {
                        realOffset = this._bounceTopBoundary - icTopPos;
                        this.scrollToTopEvent();
                        scrollEnabled = false;
                    }
                }
                else {
                    var icBottomPos = this._innerContainer.getBottomInParent();
                    if (icBottomPos + touchOffsetY >= this._bottomBoundary) {
                        realOffset = this._bottomBoundary - icBottomPos;
                        this.scrollToBottomEvent();
                        scrollEnabled = false;
                    }
                    var icTopPos = this._innerContainer.getTopInParent();
                    if (icTopPos + touchOffsetY <= this._topBoundary) {
                        realOffset = this._topBoundary - icTopPos;
                        this.scrollToTopEvent();
                        scrollEnabled = false;
                    }
                }
                this.moveChildren(0.0, realOffset);
                break;
            case ccs.ScrollViewDir.horizontal: // horizontal
                var realOffset = touchOffsetX;
                if (this._bounceEnabled) {
                    var icRightPos = this._innerContainer.getRightInParent();
                    if (icRightPos + touchOffsetX <= this._bounceRightBoundary) {
                        realOffset = this._bounceRightBoundary - icRightPos;
                        this.scrollToRightEvent();
                        scrollEnabled = false;
                    }
                    var icLeftPos = this._innerContainer.getLeftInParent();
                    if (icLeftPos + touchOffsetX >= this._bounceLeftBoundary) {
                        realOffset = this._bounceLeftBoundary - icLeftPos;
                        this.scrollToLeftEvent();
                        scrollEnabled = false;
                    }
                }
                else {
                    var icRightPos = this._innerContainer.getRightInParent();
                    if (icRightPos + touchOffsetX <= this._rightBoundary) {
                        realOffset = this._rightBoundary - icRightPos;
                        this.scrollToRightEvent();
                        scrollEnabled = false;
                    }
                    var icLeftPos = this._innerContainer.getLeftInParent();
                    if (icLeftPos + touchOffsetX >= this._leftBoundary) {
                        realOffset = this._leftBoundary - icLeftPos;
                        this.scrollToLeftEvent();
                        scrollEnabled = false;
                    }
                }
                this.moveChildren(realOffset, 0.0);
                break;
            case ccs.ScrollViewDir.both:
                var realOffsetX = touchOffsetX;
                var realOffsetY = touchOffsetY;
                if (this._bounceEnabled) {
                    if (touchOffsetX > 0.0 && touchOffsetY > 0.0) // up right
                    {
                        var icLeftPos = this._innerContainer.getLeftInParent();
                        if (icLeftPos + touchOffsetX >= this._bounceLeftBoundary) {
                            realOffsetX = this._bounceLeftBoundary - icLeftPos;
                            this.scrollToLeftEvent();
                            scrollEnabled = false;
                        }
                        var icBottomPos = this._innerContainer.getBottomInParent();
                        if (icBottomPos + touchOffsetY >= this._bounceBottomBoundary) {
                            realOffsetY = this._bounceBottomBoundary - icBottomPos;
                            this.scrollToBottomEvent();
                            scrollEnabled = false;
                        }
                    }
                    else if (touchOffsetX < 0.0 && touchOffsetY > 0.0) // up left
                    {
                        var icRightPos = this._innerContainer.getRightInParent();
                        if (icRightPos + touchOffsetX <= this._bounceRightBoundary) {
                            realOffsetX = this._bounceRightBoundary - icRightPos;
                            this.scrollToRightEvent();
                            scrollEnabled = false;
                        }
                        var icBottomPos = this._innerContainer.getBottomInParent();
                        if (icBottomPos + touchOffsetY >= this._bounceBottomBoundary) {
                            realOffsetY = this._bounceBottomBoundary - icBottomPos;
                            this.scrollToBottomEvent();
                            scrollEnabled = false;
                        }
                    }
                    else if (touchOffsetX < 0.0 && touchOffsetY < 0.0) // down left
                    {
                        var icRightPos = this._innerContainer.getRightInParent();
                        if (icRightPos + touchOffsetX <= this._bounceRightBoundary) {
                            realOffsetX = this._bounceRightBoundary - icRightPos;
                            this.scrollToRightEvent();
                            scrollEnabled = false;
                        }
                        var icTopPos = this._innerContainer.getTopInParent();
                        if (icTopPos + touchOffsetY <= this._bounceTopBoundary) {
                            realOffsetY = this._bounceTopBoundary - icTopPos;
                            this.scrollToTopEvent();
                            scrollEnabled = false;
                        }
                    }
                    else if (touchOffsetX > 0.0 && touchOffsetY < 0.0) // down right
                    {
                        var icLeftPos = this._innerContainer.getLeftInParent();
                        if (icLeftPos + touchOffsetX >= this._bounceLeftBoundary) {
                            realOffsetX = this._bounceLeftBoundary - icLeftPos;
                            this.scrollToLeftEvent();
                            scrollEnabled = false;
                        }
                        var icTopPos = this._innerContainer.getTopInParent();
                        if (icTopPos + touchOffsetY <= this._bounceTopBoundary) {
                            realOffsetY = this._bounceTopBoundary - icTopPos;
                            this.scrollToTopEvent();
                            scrollEnabled = false;
                        }
                    }
                    else if (touchOffsetX == 0.0 && touchOffsetY > 0.0) // up
                    {
                        var icBottomPos = this._innerContainer.getBottomInParent();
                        if (icBottomPos + touchOffsetY >= this._bounceBottomBoundary) {
                            realOffsetY = this._bounceBottomBoundary - icBottomPos;
                            this.scrollToBottomEvent();
                            scrollEnabled = false;
                        }
                    }
                    else if (touchOffsetX < 0.0 && touchOffsetY == 0.0) // left
                    {
                        var icRightPos = this._innerContainer.getRightInParent();
                        if (icRightPos + touchOffsetX <= this._bounceRightBoundary) {
                            realOffsetX = this._bounceRightBoundary - icRightPos;
                            this.scrollToRightEvent();
                            scrollEnabled = false;
                        }
                    }
                    else if (touchOffsetX == 0.0 && touchOffsetY < 0.0) // down
                    {
                        var icTopPos = this._innerContainer.getTopInParent();
                        if (icTopPos + touchOffsetY <= this._bounceTopBoundary) {
                            realOffsetY = this._bounceTopBoundary - icTopPos;
                            this.scrollToTopEvent();
                            scrollEnabled = false;
                        }
                    }
                    else if (touchOffsetX > 0.0 && touchOffsetY == 0.0) // right
                    {
                        var icLeftPos = this._innerContainer.getLeftInParent();
                        if (icLeftPos + touchOffsetX >= this._bounceLeftBoundary) {
                            realOffsetX = this._bounceLeftBoundary - icLeftPos;
                            this.scrollToLeftEvent();
                            scrollEnabled = false;
                        }
                    }
                }
                else {
                    if (touchOffsetX > 0.0 && touchOffsetY > 0.0) // up right
                    {
                        var icLeftPos = this._innerContainer.getLeftInParent();
                        if (icLeftPos + touchOffsetX >= this._leftBoundary) {
                            realOffsetX = this._leftBoundary - icLeftPos;
                            this.scrollToLeftEvent();
                            scrollEnabled = false;
                        }
                        var icBottomPos = this._innerContainer.getBottomInParent();
                        if (icBottomPos + touchOffsetY >= this._bottomBoundary) {
                            realOffsetY = this._bottomBoundary - icBottomPos;
                            this.scrollToBottomEvent();
                            scrollEnabled = false;
                        }
                    }
                    else if (touchOffsetX < 0.0 && touchOffsetY > 0.0) // up left
                    {
                        var icRightPos = this._innerContainer.getRightInParent();
                        if (icRightPos + touchOffsetX <= this._rightBoundary) {
                            realOffsetX = this._rightBoundary - icRightPos;
                            this.scrollToRightEvent();
                            scrollEnabled = false;
                        }
                        var icBottomPos = this._innerContainer.getBottomInParent();
                        if (icBottomPos + touchOffsetY >= this._bottomBoundary) {
                            realOffsetY = this._bottomBoundary - icBottomPos;
                            this.scrollToBottomEvent();
                            scrollEnabled = false;
                        }
                    }
                    else if (touchOffsetX < 0 && touchOffsetY < 0) // down left
                    {
                        var icRightPos = this._innerContainer.getRightInParent();
                        if (icRightPos + touchOffsetX <= this._rightBoundary) {
                            realOffsetX = this._rightBoundary - icRightPos;
                            this.scrollToRightEvent();
                            scrollEnabled = false;
                        }
                        var icTopPos = this._innerContainer.getTopInParent();
                        if (icTopPos + touchOffsetY <= this._topBoundary) {
                            realOffsetY = this._topBoundary - icTopPos;
                            this.scrollToTopEvent();
                            scrollEnabled = false;
                        }
                    }
                    else if (touchOffsetX > 0 && touchOffsetY < 0) // down right
                    {
                        var icLeftPos = this._innerContainer.getLeftInParent();
                        if (icLeftPos + touchOffsetX >= this._leftBoundary) {
                            realOffsetX = this._leftBoundary - icLeftPos;
                            this.scrollToLeftEvent();
                            scrollEnabled = false;
                        }
                        var icTopPos = this._innerContainer.getTopInParent();
                        if (icTopPos + touchOffsetY <= this._topBoundary) {
                            realOffsetY = this._topBoundary - icTopPos;
                            this.scrollToTopEvent();
                            scrollEnabled = false;
                        }
                    }
                    else if (touchOffsetX == 0.0 && touchOffsetY > 0.0) // up
                    {
                        var icBottomPos = this._innerContainer.getBottomInParent();
                        if (icBottomPos + touchOffsetY >= this._bottomBoundary) {
                            realOffsetY = this._bottomBoundary - icBottomPos;
                            this.scrollToBottomEvent();
                            scrollEnabled = false;
                        }
                    }
                    else if (touchOffsetX < 0.0 && touchOffsetY == 0.0) // left
                    {
                        var icRightPos = this._innerContainer.getRightInParent();
                        if (icRightPos + touchOffsetX <= this._rightBoundary) {
                            realOffsetX = this._rightBoundary - icRightPos;
                            this.scrollToRightEvent();
                            scrollEnabled = false;
                        }
                    }
                    else if (touchOffsetX == 0.0 && touchOffsetY < 0) // down
                    {
                        var icTopPos = this._innerContainer.getTopInParent();
                        if (icTopPos + touchOffsetY <= this._topBoundary) {
                            realOffsetY = this._topBoundary - icTopPos;
                            this.scrollToTopEvent();
                            scrollEnabled = false;
                        }
                    }
                    else if (touchOffsetX > 0 && touchOffsetY == 0) // right
                    {
                        var icLeftPos = this._innerContainer.getLeftInParent();
                        if (icLeftPos + touchOffsetX >= this._leftBoundary) {
                            realOffsetX = this._leftBoundary - icLeftPos;
                            this.scrollToLeftEvent();
                            scrollEnabled = false;
                        }
                    }
                }
                this.moveChildren(realOffsetX, realOffsetY);
                break;
            default:
                break;
        }
        return scrollEnabled;
    },

    scrollToBottom: function (time, attenuated) {
        this.startAutoScrollChildrenWithDestination(cc.p(this._innerContainer.getPosition().x, 0), time, attenuated);
    },

    scrollToTop: function (time, attenuated) {
        this.startAutoScrollChildrenWithDestination(cc.p(this._innerContainer.getPosition().x, this._size.height - this._innerContainer.getSize().height), time, attenuated);
    },

    scrollToLeft: function (time, attenuated) {
        this.startAutoScrollChildrenWithDestination(cc.p(0, this._innerContainer.getPosition().y), time, attenuated);
    },

    scrollToRight: function (time, attenuated) {
        this.startAutoScrollChildrenWithDestination(cc.p(this._size.width - this._innerContainer.getSize().width, this._innerContainer.getPosition().y), time, attenuated);
    },

    scrollToTopLeft: function (time, attenuated) {
        if (this._direction != ccs.ScrollViewDir.both) {
            cc.log("Scroll diretion is not both!");
            return;
        }
        this.startAutoScrollChildrenWithDestination(cc.p(0, this._size.height - this._innerContainer.getSize().height), time, attenuated);
    },

    scrollToTopRight: function (time, attenuated) {
        if (this._direction != ccs.ScrollViewDir.both) {
            cc.log("Scroll diretion is not both!");
            return;
        }
        this.startAutoScrollChildrenWithDestination(cc.p(this._size.width - this._innerContainer.getSize().width, this._size.height - this._innerContainer.getSize().height), time, attenuated);
    },

    scrollToBottomLeft: function (time, attenuated) {
        if (this._direction != ccs.ScrollViewDir.both) {
            cc.log("Scroll diretion is not both!");
            return;
        }
        this.startAutoScrollChildrenWithDestination(cc.p(0, 0), time, attenuated);
    },

    scrollToBottomRight: function (time, attenuated) {
        if (this._direction != ccs.ScrollViewDir.both) {
            cc.log("Scroll diretion is not both!");
            return;
        }
        this.startAutoScrollChildrenWithDestination(cc.p(this._size.width - this._innerContainer.getSize().width, 0), time, attenuated);
    },

    scrollToPercentVertical: function (percent, time, attenuated) {
        var minY = this._size.height - this._innerContainer.getSize().height;
        var h = -minY;
        this.startAutoScrollChildrenWithDestination(cc.p(this._innerContainer.getPosition().x, minY + percent * h / 100), time, attenuated);
    },

    scrollToPercentHorizontal: function (percent, time, attenuated) {
        var w = this._innerContainer.getSize().width - this._size.width;
        this.startAutoScrollChildrenWithDestination(cc.p(-(percent * w / 100), this._innerContainer.getPosition().y), time, attenuated);
    },

    scrollToPercentBothDirection: function (percent, time, attenuated) {
        if (this._direction != ccs.ScrollViewDir.both) {
            return;
        }
        var minY = this._size.height - this._innerContainer.getSize().height;
        var h = -minY;
        var w = this._innerContainer.getSize().width - this._size.width;
        this.startAutoScrollChildrenWithDestination(cc.p(-(percent.x * w / 100), minY + percent.y * h / 100), time, attenuated);
    },

    jumpToBottom: function () {
        this.jumpToDestination(cc.p(this._innerContainer.getPosition().x, 0));
    },

    jumpToTop: function () {
        this.jumpToDestination(cc.p(this._innerContainer.getPosition().x, this._size.height - this._innerContainer.getSize().height));
    },

    jumpToLeft: function () {
        this.jumpToDestination(cc.p(0, this._innerContainer.getPosition().y));
    },

    jumpToRight: function () {
        this.jumpToDestination(cc.p(this._size.width - this._innerContainer.getSize().width, this._innerContainer.getPosition().y));
    },

    jumpToTopLeft: function () {
        if (this._direction != ccs.ScrollViewDir.both) {
            cc.log("Scroll diretion is not both!");
            return;
        }
        this.jumpToDestination(cc.p(0, this._size.height - this._innerContainer.getSize().height));
    },

    jumpToTopRight: function () {
        if (this._direction != ccs.ScrollViewDir.both) {
            cc.log("Scroll diretion is not both!");
            return;
        }
        this.jumpToDestination(cc.p(this._size.width - this._innerContainer.getSize().width, this._size.height - this._innerContainer.getSize().height));
    },

    jumpToBottomLeft: function () {
        if (this._direction != ccs.ScrollViewDir.both) {
            cc.log("Scroll diretion is not both!");
            return;
        }
        this.jumpToDestination(cc.p(0, 0));
    },

    jumpToBottomRight: function () {
        if (this._direction != ccs.ScrollViewDir.both) {
            cc.log("Scroll diretion is not both!");
            return;
        }
        this.jumpToDestination(cc.p(this._size.width - this._innerContainer.getSize().width, 0));
    },

    jumpToPercentVertical: function (percent) {
        var minY = this._size.height - this._innerContainer.getSize().height;
        var h = -minY;
        this.jumpToDestination(cc.p(this._innerContainer.getPosition().x, minY + percent * h / 100));
    },

    jumpToPercentHorizontal: function (percent) {
        var w = this._innerContainer.getSize().width - this._size.width;
        this.jumpToDestination(cc.p(-(percent * w / 100), this._innerContainer.getPosition().y));
    },

    jumpToPercentBothDirection: function (percent) {
        if (this._direction != ccs.ScrollViewDir.both) {
            return;
        }
        var minY = this._size.height - this._innerContainer.getSize().height;
        var h = -minY;
        var w = this._innerContainer.getSize().width - this._size.width;
        this.jumpToDestination(cc.p(-(percent.x * w / 100), minY + percent.y * h / 100));
    },

    startRecordSlidAction: function () {
        if (this._autoScroll) {
            this.stopAutoScrollChildren();
        }
        if (this._bouncing) {
            this.stopBounceChildren();
        }
        this._slidTime = 0.0;
    },

    endRecordSlidAction: function () {
        if (!this.checkNeedBounce() && this._inertiaScrollEnabled) {
            if (this._slidTime <= 0.016) {
                return;
            }
            var totalDis = 0;
            var dir;
            switch (this._direction) {
                case ccs.ScrollViewDir.vertical :
                    totalDis = this._touchEndedPoint.y - this._touchBeganPoint.y;
                    if (totalDis < 0) {
                        dir = ccs.SCROLLDIR_DOWN;
                    }
                    else {
                        dir = ccs.SCROLLDIR_UP;
                    }
                    break;
                case ccs.ScrollViewDir.horizontal:
                    totalDis = this._touchEndedPoint.x - this._touchBeganPoint.x;
                    if (totalDis < 0) {
                        dir = ccs.SCROLLDIR_LEFT;
                    }
                    else {
                        dir = ccs.SCROLLDIR_RIGHT;
                    }
                    break;
                case ccs.ScrollViewDir.both :
                    var subVector = cc.pSub(this._touchEndedPoint, this._touchBeganPoint);
                    totalDis = cc.pLength(subVector);
                    dir = cc.pNormalize(subVector);
                    break;
                default:
                    break;
            }
            var orSpeed = Math.min(Math.abs(totalDis) / (this._slidTime), ccs.AUTOSCROLLMAXSPEED);
            this.startAutoScrollChildrenWithOriginalSpeed(dir, orSpeed, true, -1000);
            this._slidTime = 0;
        }
    },

    handlePressLogic: function (touchPoint) {
        this._touchBeganPoint = this.convertToNodeSpace(touchPoint);
        this._touchMovingPoint = this._touchBeganPoint;
        this.startRecordSlidAction();
        this._bePressed = true;
    },

    handleMoveLogic: function (touchPoint) {
        this._touchMovedPoint = this.convertToNodeSpace(touchPoint);
        var delta = cc.pSub(this._touchMovedPoint, this._touchMovingPoint);
        this._touchMovingPoint = this._touchMovedPoint;
        switch (this._direction) {
            case ccs.ScrollViewDir.vertical: // vertical
                this.scrollChildren(0.0, delta.y);
                break;
            case ccs.ScrollViewDir.horizontal: // horizontal
                this.scrollChildren(delta.x, 0);
                break;
            case ccs.ScrollViewDir.both: // both
                this.scrollChildren(delta.x, delta.y);
                break;
            default:
                break;
        }
    },

    handleReleaseLogic: function (touchPoint) {
        this._touchEndedPoint = this.convertToNodeSpace(touchPoint);
        this.endRecordSlidAction();
        this._bePressed = false;
    },

    onTouchBegan: function (touch , event) {
        var pass = ccs.Layout.prototype.onTouchBegan.call(this, touch , event);
        if (this._hitted)        {
            this.handlePressLogic(this._touchStartPos);
        }
        return pass;
    },

    onTouchMoved: function (touch , event) {
        ccs.Layout.prototype.onTouchMoved.call(this, touch , event);
        this.handleMoveLogic(this._touchMovePos);
    },

    onTouchEnded: function (touch , event) {
        ccs.Layout.prototype.onTouchEnded.call(this, touch , event);
        this.handleReleaseLogic(this._touchEndPos);
    },

    onTouchCancelled: function (touch , event) {
        ccs.Layout.prototype.onTouchCancelled.call(this, touch , event);
    },

    onTouchLongClicked: function (touchPoint) {

    },

    update: function (dt) {
        if (this._autoScroll) {
            this.autoScrollChildren(dt);
        }
        if (this._bouncing) {
            this.bounceChildren(dt);
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
     * @param {ccs.Widget} sender
     * @param {cc.Point} touchPoint
     */
    interceptTouchEvent: function (handleState, sender, touchPoint) {
        switch (handleState) {
            case 0:
                this.handlePressLogic(touchPoint);
                break;
            case 1:
                var offset = cc.pSub(sender.getTouchStartPos(), touchPoint);
                if (cc.pLength(offset) > this._childFocusCancelOffset) {
                    sender.setFocused(false);
                    this.handleMoveLogic(touchPoint);
                }
                break;
            case 2:
                this.handleReleaseLogic(touchPoint);
                break;
            case 3:
                this.handleReleaseLogic(touchPoint);
                break;
        }
    },

    /**
     *
     * @param {number} handleState
     * @param {ccs.Widget} sender
     * @param {cc.Point} touchPoint
     */
    checkChildInfo: function (handleState, sender, touchPoint) {
        if(this._enabled && this._touchEnabled)
            this.interceptTouchEvent(handleState, sender, touchPoint);
    },

    scrollToTopEvent: function () {
        if (this._scrollViewEventListener && this._scrollViewEventSelector) {
            this._scrollViewEventSelector.call(this._scrollViewEventListener, this, ccs.ScrollViewEventType.scrollToTop);
        }
    },

    scrollToBottomEvent: function () {
        if (this._scrollViewEventListener && this._scrollViewEventSelector) {
            this._scrollViewEventSelector.call(this._scrollViewEventListener, this, ccs.ScrollViewEventType.scrollToBottom);
        }
    },

    scrollToLeftEvent: function () {
        if (this._scrollViewEventListener && this._scrollViewEventSelector) {
            this._scrollViewEventSelector.call(this._scrollViewEventListener, this, ccs.ScrollViewEventType.scrollToLeft);
        }
    },

    scrollToRightEvent: function () {
        if (this._scrollViewEventListener && this._scrollViewEventSelector) {
            this._scrollViewEventSelector.call(this._scrollViewEventListener, this, ccs.ScrollViewEventType.scrollToRight);
        }
    },

    scrollingEvent: function () {
        if (this._scrollViewEventListener && this._scrollViewEventSelector) {
            this._scrollViewEventSelector.call(this._scrollViewEventListener, this, ccs.ScrollViewEventType.scrolling);
        }
    },

    bounceTopEvent: function () {
        if (this._scrollViewEventListener && this._scrollViewEventSelector) {
            this._scrollViewEventSelector.call(this._scrollViewEventListener, this, ccs.ScrollViewEventType.bounceTop);
        }
    },

    bounceBottomEvent: function () {
        if (this._scrollViewEventListener && this._scrollViewEventSelector) {
            this._scrollViewEventSelector.call(this._scrollViewEventListener, this, ccs.ScrollViewEventType.bounceBottom);
        }
    },

    bounceLeftEvent: function () {
        if (this._scrollViewEventListener && this._scrollViewEventSelector) {
            this._scrollViewEventSelector.call(this._scrollViewEventListener, this, ccs.ScrollViewEventType.bounceLeft);
        }
    },

    bounceRightEvent: function () {
        if (this._scrollViewEventListener && this._scrollViewEventSelector) {
            this._scrollViewEventSelector.call(this._scrollViewEventListener, this, ccs.ScrollViewEventType.bounceRight);
        }
    },

    /**
     * @param {Function} selector
     * @param {Object} target
     */
    addEventListenerScrollView: function (selector, target) {
        this._scrollViewEventSelector = selector;
        this._scrollViewEventListener = target;
    },

    /**
     * set direction
     * @param {ccs.ScrollViewDir} dir
     */
    setDirection: function (dir) {
        this._direction = dir;
    },

    /**
     * get direction
     * @returns {ccs.ScrollViewDir}
     */
    getDirection: function () {
        return this._direction;
    },

    /**
     * set bounce enabled
     * @param {Boolean} enabled
     */
    setBounceEnabled: function (enabled) {
        this._bounceEnabled = enabled;
    },

    /**
     * get whether bounce id enabled
     * @returns {boolean}
     */
    isBounceEnabled: function () {
        return this._bounceEnabled;
    },

    /**
     * set inertiaScroll enabled
     * @param {boolean} enabled
     */
    setInertiaScrollEnabled: function (enabled) {
        this._inertiaScrollEnabled = enabled;
    },

    /**
     * get whether inertiaScroll id enabled
     * @returns {boolean}
     */
    isInertiaScrollEnabled: function () {
        return this._inertiaScrollEnabled;
    },

    /**
     * get inner container
     * @returns {ccs.Layout}
     */
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
        if (!this._doLayoutDirty)
            return;
        this._doLayoutDirty = false;
    },

    /**
     * Returns the "class name" of widget.
     * @returns {string}
     */
    getDescription: function () {
        return "ScrollView";
    },

    copyClonedWidgetChildren: function (model) {
        ccs.Layout.prototype.copyClonedWidgetChildren.call(this, model);
    },

    copySpecialProperties: function (scrollView) {
        ccs.Layout.prototype.copySpecialProperties.call(this, scrollView);
        this.setInnerContainerSize(scrollView.getInnerContainerSize());
        this.setDirection(scrollView._direction);
        this.setBounceEnabled(scrollView._bounceEnabled);
        this.setInertiaScrollEnabled(scrollView._inertiaScrollEnabled);
    }
});
/**
 * allocates and initializes a UIScrollView.
 * @constructs
 * @return {ccs.ScrollView}
 * @example
 * // example
 * var uiScrollView = ccs.ScrollView.create();
 */
ccs.ScrollView.create = function () {
    var uiScrollView = new ccs.ScrollView();
    if (uiScrollView && uiScrollView.init()) {
        return uiScrollView;
    }
    return null;
};