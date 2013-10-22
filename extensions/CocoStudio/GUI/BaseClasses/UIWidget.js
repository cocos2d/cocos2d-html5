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

cc.BrightStyle = {
    NONE: -1,
    NORMAL: 0,
    HIGHLIGHT: 1
};

cc.WidgetType = {
    Widget: 0, //control
    Container: 1 //container
};

cc.TextureResType = {
    LOCAL: 0,
    PLIST: 1
};

cc.TouchEventType = {
    BEGAN: 0,
    MOVED: 1,
    ENDED: 2,
    CANCELED: 3
};

cc.SizeType = {
    ABSOLUTE: 0,
    PERCENT: 1
};

cc.PositionType = {
    ABSOLUTE: 0,
    PERCENT: 1
};

/**
 * Base class for cc.UIWidget
 * @class
 * @extends cc.Class
 */
cc.UIWidget = cc.Class.extend({
    _enabled: true,            ///< Highest control of widget
    _visible: true,            ///< is this widget visible
    _bright: true,             ///< is this widget bright
    _touchEnabled: false,       ///< is this widget touch endabled
    _touchPassedEnabled: false, ///< is the touch event should be passed
    _focus: false,              ///< is the widget on focus
    _widgetZOrder: 0,        ///< z-order value that affects the draw order and touch order
    _anchorPoint: null,      ///< anchor point normalized
    _widgetParent: null,  ///< parent of widget
    _brightStyle: null, ///< bright style
    _updateEnabled: false,      ///< is "update" method scheduled
    _renderer: null,        ///< base renderer
    _touchStartPos: null,    ///< touch began point
    _touchMovePos: null,     ///< touch moved point
    _touchEndPos: null,      ///< touch ended point

    _touchEventListener: null,
    _touchEventSelector: null,


    _widgetTag: -1,
    _name: "default",
    _widgetType: null,
    _actionTag: 0,
    _size: null,
    _customSize: null,
    _layoutParameterDictionary: null,
    _ignoreSize: false,
    _children: null,
    _affectByClipping: false,

    _scheduler: null,

    _sizeType: null,
    _sizePercent: null,
    _positionType: null,
    _positionPercent: null,
    _isRunning: false,

    ctor: function () {
        this._enabled = true;
        this._visible = true;
        this._bright = true;
        this._touchEnabled = false;
        this._touchPassedEnabled = false;
        this._focus = false;
        this._widgetZOrder = 0;
        this._anchorPoint = cc.p(0.5, 0.5);
        this._widgetParent = null;
        this._brightStyle = cc.BrightStyle.NONE;
        this._updateEnabled = false;
        this._renderer = null;
        this._touchStartPos = cc.PointZero();
        this._touchMovePos = cc.PointZero();
        this._touchEndPos = cc.PointZero();
        this._touchEventListener = null;
        this._touchEventSelector = null;
        this._widgetTag = -1;
        this._name = "default";
        this._widgetType = cc.WidgetType.Widget;
        this._actionTag = 0;
        this._size = cc.SizeZero();
        this._customSize = cc.SizeZero();
        this._layoutParameterDictionary = {};
        this._ignoreSize = false;
        this._children = [];
        this._affectByClipping = false;
        this._scheduler = null;
        this._sizeType = cc.SizeType.ABSOLUTE;
        this._sizePercent = cc.PointZero();
        this._positionType = cc.PositionType.ABSOLUTE;
        this._positionPercent = cc.PointZero();
        this._isRunning = false;
    },

    /**
     * initializes state of widget.
     * @returns {boolean}
     */
    init: function () {
        this._layoutParameterDictionary = {};
        this._children = [];
        this.initRenderer();
        this._renderer.setZOrder(this._widgetZOrder);
        if (this._renderer.RGBAProtocol) {
            this._renderer.setCascadeColorEnabled(true);
            this._renderer.setCascadeOpacityEnabled(true);
        }
        this.setBright(true);
        this.ignoreContentAdaptWithSize(true);
        this._scheduler = cc.Director.getInstance().getScheduler();
        return true;
    },
    /**
     * Release texture resoures of widget.
     * Release renderer.
     * If you override releaseResoures, you shall call its parent's one, e.g. UIWidget::releaseResoures().
     */
    releaseResoures: function () {
        this.setUpdateEnabled(false);
        this.removeAllChildren();
        this._children.release();
        this._renderer.removeAllChildren(true);
        this._renderer.removeFromParent(true);
        this._renderer.release();
    },

    onEnter: function () {
        var locChild;
        for (var i = 0; i < this._children.length; i++) {
            locChild = this._children[i];
            if (locChild instanceof cc.UIWidget)
                locChild.onEnter();
        }
        this._isRunning = true;
        this.updateSizeAndPosition();
    },

    onExit: function () {
        this._isRunning = false;
        var locChild;
        for (var i = 0; i < this._children.length; i++) {
            locChild = this._children[i];
            if (locChild instanceof cc.UIWidget)
                locChild.onExit();
        }
    },

    /**
     * Adds a child to the container.
     * @param {cc.UIWidget}child
     * @returns {boolean}
     */
    addChild: function (child) {
        if (!child) {
            return false;
        }
        if (cc.ArrayContainsObject(this._children, child)) {
            return false;
        }
        child.setParent(this);
        var childrenCount = this._children.length;
        if (childrenCount <= 0) {
            this._children.push(child);
        }
        else {
            var seekSucceed = false;
            for (var i = childrenCount - 1; i >= 0; --i) {
                var widget = this._children[i];
                if (child.getZOrder() >= widget.getZOrder()) {
                    if (i == childrenCount - 1) {
                        this._children.push(child);
                        seekSucceed = true;
                        break;
                    }
                    else {
                        cc.ArrayAppendObjectToIndex(this._children, child, i + 1);
                        seekSucceed = true;
                        break;
                    }
                }
            }
            if (!seekSucceed) {
                cc.ArrayAppendObjectToIndex(this._children, child, 0);
            }
        }
        child.getRenderer().setZOrder(child.getZOrder());
        this._renderer.addChild(child.getRenderer());
        if (this._isRunning) {
            child.onEnter();
        }
        return true;
    },

    /**
     * Adds a child to the container.
     * @param {cc.UIWidget} child
     * @returns {boolean}
     */
    removeChild: function (child) {
        if (!child) {
            return false;
        }
        if (cc.ArrayContainsObject(this._children, child)) {
            if (this._isRunning) {
                child.onExit();
            }
            child.disableUpdate();
            child.setParent(null);
            this._renderer.removeChild(child.getRenderer());
            cc.ArrayRemoveObject(this._children, child);
            return true;
        }
        return false;
    },

    /**
     * Removes this widget itself from its parent widget.
     * If the widget orphan, then it will destroy itself.
     */
    removeFromParent: function () {
        if (this._widgetParent) {
            this._widgetParent.removeChild(this);
        }
    },

    /**
     * Removes all children from the container, and do a cleanup to all running actions depending on the cleanup parameter.
     */
    removeAllChildren: function () {
        if (this._children.length <= 0) {
            return;
        }
        var locChild;
        for (var i = 0; i < this._children.length; ++i) {
            locChild = this._children[i];
            this.removeChild(this._children[i]);
        }
    },

    /**
     * Reorders a child according to a new z value.
     * @param {cc.UIWidget} child
     */
    reorderChild: function (child) {
        cc.ArrayRemoveObject(this._children, child);
        var childrenCount = this._children.length;
        if (childrenCount <= 0) {
            this._children.push(child);
        }
        else {
            var seekSucceed = false;
            var arrayChildren = this._children;
            for (var i = childrenCount - 1; i >= 0; --i) {
                var widget = arrayChildren[i];
                if (child.getZOrder() >= widget.getZOrder()) {
                    if (i == childrenCount - 1) {
                        this._children.push(child);
                        seekSucceed = true;
                        break;
                    }
                    else {
                        cc.ArrayAppendObjectToIndex(this._children, child, i + 1);
                        seekSucceed = true;
                        break;
                    }
                }
            }
            if (!seekSucceed) {
                cc.ArrayAppendObjectToIndex(this._children, child, 0);
            }
        }
    },

    /**
     * Unschedules the "update" method.
     */
    disableUpdate: function () {
        if (this._scheduler) {
            this._scheduler.unscheduleUpdateForTarget(this);
        }
        var childrenCount = this._children.length;
        var arrayChildren = this._children;
        for (var i = 0; i < childrenCount; i++) {
            var child = arrayChildren[i];
            child.disableUpdate();
        }
    },

    /**
     * Set enabled renderer
     * @param {Boolean} enabled
     */
    setEnabled: function (enabled) {
        this._enabled = enabled;
        this._renderer.setEnabled(enabled);
        var arrayChildren = this._children;
        var childrenCount = arrayChildren.length;
        for (var i = 0; i < childrenCount; i++) {
            var child = arrayChildren[i];
            child.setEnabled(enabled);
        }
    },

    /**
     * Gets a child from the container with its name
     * @param {string} name
     * @returns {cc.UIWidget}
     */
    getChildByName: function (name) {
        return cc.UIHelper.getInstance().seekWidgetByName(this, name);
    },

    /**
     * Gets a child from the container with its tag
     * @param {number} tag
     * @returns {cc.UIWidget}
     */
    getChildByTag: function (tag) {
        return cc.UIHelper.getInstance().seekWidgetByTag(this, tag);
    },

    /**
     * Return an array of children
     * @returns {Array}
     */
    getChildren: function () {
        return this._children;
    },

    /**
     * initializes renderer of widget.
     */
    initRenderer: function () {
        this._renderer = cc.GUIRenderer.create();
    },

    /**
     * Changes the size that is widget's size
     * @param {cc.Size} size
     */
    setSize: function (size) {
        this._customSize = size;
        if (this._ignoreSize) {
            this._size = this.getContentSize();
        }
        else {
            this._size.width = size.width;
            this._size.height = size.height;
        }
        if (this._isRunning) {
            this._sizePercent = (this._widgetParent == null) ? cc.PointZero() : cc.p(this._customSize.width / this._widgetParent.getSize().width, this._customSize.height / this._widgetParent.getSize().height);
        }
        this.onSizeChanged();
    },

    /**
     * Changes the percent that is widget's percent size
     * @param {cc.Point} percent
     */
    setSizePercent: function (percent) {
        this._sizePercent = percent;
        if (!this._isRunning) {
            return;
        }
        var size = (this._widgetParent == null) ? cc.SizeZero() : cc.size(this._widgetParent.getSize().width * percent.x, this._widgetParent.getSize().height * percent.y);
        if (this._ignoreSize) {
            this._size = this.getContentSize();
        }
        else {
            this._size.width = size.width;
            this._size.height = size.height;
        }
        this._customSize = size;
        this.onSizeChanged();
    },

    /**
     * update size and position
     */
    updateSizeAndPosition: function () {
        switch (this._sizeType) {
            case cc.SizeType.ABSOLUTE:
                if (this._ignoreSize) {
                    this._size = this.getContentSize();
                }
                else {
                    this._size = this._customSize;
                }
                this._sizePercent = (this._widgetParent == null) ? cc.PointZero() : cc.p(this._customSize.width / this._widgetParent.getSize().width, this._customSize.height / this._widgetParent.getSize().height);
                break;
            case cc.SizeType.PERCENT:
                var cSize = (this._widgetParent == null) ? cc.SizeZero() : cc.size(this._widgetParent.getSize().width * this._sizePercent.x, this._widgetParent.getSize().height * this._sizePercent.y);
                if (this._ignoreSize) {
                    this._size = this.getContentSize();
                }
                else {
                    this._size = cSize;
                }
                this._customSize = cSize;
                break;
            default:
                break;
        }
        this.onSizeChanged();
        var absPos = this.getPosition();
        switch (this._positionType) {
            case cc.PositionType.ABSOLUTE:
                this._positionPercent = (this._widgetParent == null) ? cc.PointZero() : cc.p(absPos.x / this._widgetParent.getSize().width, absPos.y / this._widgetParent.getSize().height);
                break;
            case cc.PositionType.PERCENT:
                var parentSize = this._widgetParent.getSize();
                absPos = cc.p(parentSize.width * this._positionPercent.x, parentSize.height * this._positionPercent.y);
                break;
            default:
                break;
        }
        this._renderer.setPosition(absPos);
    },

    /**
     * Changes the size type of widget.
     * @param {cc.SizeType} type
     */
    setSizeType: function (type) {
        this._sizeType = type;
    },

    /**
     * Gets the size type of widget.
     * @returns {cc.SizeType}
     */
    getSizeType: function () {
        return this._sizeType;
    },

    /**
     * Ignore the widget size
     * @param {Boolean} ignore
     */
    ignoreContentAdaptWithSize: function (ignore) {
        this._ignoreSize = ignore;
        if (this._ignoreSize) {
            var s = this.getContentSize();
            this._size = s;
        }
        else {
            this._size = this._customSize;
        }
        this.onSizeChanged();
    },

    /**
     * Gets the widget if is ignore it's size.
     * @returns {boolean}
     */
    isIgnoreContentAdaptWithSize: function () {
        return this._ignoreSize;
    },

    /**
     * Returns size of widget
     * @returns {cc.Size}
     */
    getSize: function () {
        return this._size;
    },

    /**
     * Returns size percent of widget
     * @returns {cc.Point}
     */
    getSizePercent: function () {
        return this._sizePercent;
    },

    /**
     *  Gets world position of widget.
     * @returns {cc.Point}
     */
    getWorldPosition: function () {
        return this._renderer.convertToWorldSpace(cc.PointZero());
    },

    /**
     * Converts a Point to world space coordinates. The result is in Points.
     * @param {cc.Point} pt
     * @returns {cc.Point}
     */
    convertToWorldSpace: function (pt) {
        return this._renderer.convertToWorldSpace(pt);
    },

    /**
     * Gets the Virtual Renderer of widget.
     * @returns {cc.Node}
     */
    getVirtualRenderer: function () {
        return this._renderer;
    },

    /**
     * call back function called when size changed.
     */
    onSizeChanged: function () {

    },

    /**
     * Gets the content size of widget.
     * @returns {cc.Size}
     */
    getContentSize: function () {
        return this._size;
    },

    /**
     * set zOrder of widget
     * @param {number} z
     */
    setZOrder: function (z) {
        this._widgetZOrder = z;
        this._renderer.setZOrder(z);
        if (this._widgetParent) {
            this._widgetParent.reorderChild(this);
        }
    },

    /**
     * get zOrder of widget
     * @returns {number}
     */
    getZOrder: function () {
        return this._widgetZOrder;
    },

    /**
     * Sets whether the widget is touch enabled
     * @param enable
     */
    setTouchEnabled: function (enable) {
        this._touchEnabled = enable;
    },

    /**
     * To set the bright style of widget.
     * @returns {boolean}
     */
    isTouchEnabled: function () {
        return this._touchEnabled;
    },

    /**
     * Schedules the "update" method.
     * @param enable
     */
    setUpdateEnabled: function (enable) {
        this._updateEnabled = enable;
        if (enable) {
            if (this._scheduler) {
                this._scheduler.scheduleUpdateForTarget(this, 0, false);
            }
        }
        else {
            if (this._scheduler) {
                this._scheduler.unscheduleUpdateForTarget(this);
            }
        }
    },

    /**
     * is the "update" method scheduled.
     * @returns {boolean}
     */
    isUpdateEnabled: function () {
        return this._updateEnabled;
    },

    /**
     * Determines if the widget is on focused
     * @returns {boolean}
     */
    isFocused: function () {
        return this._focus;
    },

    /**
     * Sets whether the widget is on focused
     * The default value is false, a widget is default to not on focused
     * @param {boolean} fucos
     */
    setFocused: function (fucos) {
        if (fucos == this._focus) {
            return;
        }
        this._focus = fucos;
        if (this._bright) {
            if (this._focus) {
                this.setBrightStyle(cc.BrightStyle.HIGHLIGHT);
            }
            else {
                this.setBrightStyle(cc.BrightStyle.NORMAL);
            }
        }
        else {
            this.onPressStateChangedToDisabled();
        }
    },

    /**
     * To set the bright style of widget.
     * @param {cc.BrightStyle} style
     */
    setBrightStyle: function (style) {
        if (this._brightStyle == style) {
            return;
        }
        style = style|| cc.BrightStyle.NORMAL;
        this._brightStyle = style;
        switch (this._brightStyle) {
            case cc.BrightStyle.NORMAL:
                this.onPressStateChangedToNormal();
                break;
            case cc.BrightStyle.HIGHLIGHT:
                this.onPressStateChangedToPressed();
                break;
            default:
                break;
        }
    },

    /**
     * call back function called widget's state changed to normal.
     */
    onPressStateChangedToNormal: function () {

    },

    /**
     * call back function called widget's state changed to selected.
     */
    onPressStateChangedToPressed: function () {

    },

    /**
     * call back function called widget's state changed to dark.
     */
    onPressStateChangedToDisabled: function () {

    },

    /**
     * A call back function when widget lost of focus.
     */
    didNotSelectSelf: function () {

    },

    /**
     * A call back function called when widget is selected, and on touch began.
     * @param {cc.Ponit} touchPoint
     * @returns {boolean}
     */
    onTouchBegan: function (touchPoint) {
        this.setFocused(true);
        this._touchStartPos.x = touchPoint.x;
        this._touchStartPos.y = touchPoint.y;
        if (this._widgetParent) {
            this._widgetParent.checkChildInfo(0, this, touchPoint);
        }
        this.pushDownEvent();
        return this._touchPassedEnabled;
    },

    /**
     * A call back function called when widget is selected, and on touch moved.
     * @param {cc.Point} touchPoint
     */
    onTouchMoved: function (touchPoint) {
        this._touchMovePos.x = touchPoint.x;
        this._touchMovePos.y = touchPoint.y;
        this.setFocused(this.hitTest(touchPoint));
        if (this._widgetParent) {
            this._widgetParent.checkChildInfo(1, this, touchPoint);
        }
        this.moveEvent();
    },

    /**
     * A call back function called when widget is selected, and on touch ended.
     * @param {cc.Point} touchPoint
     */
    onTouchEnded: function (touchPoint) {
        this._touchEndPos.x = touchPoint.x;
        this._touchEndPos.y = touchPoint.y;
        var focus = this._focus;
        this.setFocused(false);
        if (this._widgetParent) {
            this._widgetParent.checkChildInfo(2, this, touchPoint);
        }
        if (focus) {
            this.releaseUpEvent();
        }
        else {
            this.cancelUpEvent();
        }
    },

    /**
     * A call back function called when widget is selected, and on touch canceled.
     * @param {cc.Point} touchPoint
     */
    onTouchCancelled: function (touchPoint) {
        this.setFocused(false);
        this.cancelUpEvent();
    },

    /**
     * A call back function called when widget is selected, and on touch long clicked.
     * @param {cc.Point} touchPoint
     */
    onTouchLongClicked: function (touchPoint) {
        this.longClickEvent();
    },

    //call back function called widget's state changed to dark.

    pushDownEvent: function () {
        if (this._touchEventListener && this._touchEventSelector) {
            if (this._touchEventSelector) {
                this._touchEventSelector.call(this._touchEventListener, this, cc.TouchEventType.BEGAN);
            }
        }
    },

    moveEvent: function () {
        if (this._touchEventListener && this._touchEventSelector) {
            if (this._touchEventSelector) {
                this._touchEventSelector.call(this._touchEventListener, this, cc.TouchEventType.MOVED);
            }
        }
    },

    releaseUpEvent: function () {
        if (this._touchEventListener && this._touchEventSelector) {
            if (this._touchEventSelector) {
                this._touchEventSelector.call(this._touchEventListener, this, cc.TouchEventType.ENDED);
            }
        }
    },

    cancelUpEvent: function () {
        if (this._touchEventSelector) {
            this._touchEventSelector.call(this._touchEventListener, this, cc.TouchEventType.CANCELED);
        }
    },

    longClickEvent: function () {

    },

    /**
     * Sets the touch event target/selector of the menu item
     * @param {Object} target
     * @param {Function} selector
     */
    addTouchEventListener: function (target, selector) {
        this._touchEventListener = target;
        this._touchEventSelector = selector;
    },

    /**
     * Gets the renderer of widget
     * @returns {cc.Node}
     */
    getRenderer: function () {
        return this._renderer;
    },

    /**
     * Add a CCNode for rendering.
     * renderer is a CCNode, it's for drawing
     * @param {cc.Node} renderer
     * @param {number} zOrder
     */
    addRenderer: function (renderer, zOrder) {
        this._renderer.addChild(renderer, zOrder);
    },

    /**
     * Remove a CCNode from widget.
     * @param {cc.Node} renderer
     * @param {Boolean} cleanup
     */
    removeRenderer: function (renderer, cleanup) {
        this._renderer.removeChild(renderer, cleanup);
    },

    /**
     * Checks a point if is in widget's space
     * @param {cc.Point} pt
     * @returns {boolean}
     */
    hitTest: function (pt) {
        var nsp = this._renderer.convertToNodeSpace(pt);
        var bb = cc.rect(-this._size.width * this._anchorPoint.x, -this._size.height * this._anchorPoint.y, this._size.width, this._size.height);
        if (nsp.x >= bb.x && nsp.x <= bb.x + bb.width && nsp.y >= bb.y && nsp.y <= bb.y + bb.height) {
            return true;
        }
        return false;
    },

    /**
     * Checks a point if in parent's area.
     * @param {cc.Point} pt
     * @returns {Boolean}
     */
    clippingParentAreaContainPoint: function (pt) {
        this._affectByClipping = false;
        var parent = this.getParent();
        var clippingParent = null;
        while (parent) {
            if (parent instanceof cc.Layout) {
                if (parent.isClippingEnabled()) {
                    this._affectByClipping = true;
                    clippingParent = parent;
                    break;
                }
            }
            parent = parent.getParent();
        }

        if (!this._affectByClipping) {
            return true;
        }


        if (clippingParent) {
            var bRet = false;
            if (clippingParent.hitTest(pt)) {
                bRet = true;
            }
            if (bRet) {
                return clippingParent.clippingParentAreaContainPoint(pt);
            }
            return false;
        }
        return true;
    },

    /**
     * Sends the touch event to widget's parent
     * @param {number} handleState
     * @param {cc.UIWidget} sender
     * @param {cc.Point} touchPoint
     */
    checkChildInfo: function (handleState, sender, touchPoint) {
        if (this._widgetParent) {
            this._widgetParent.checkChildInfo(handleState, sender, touchPoint);
        }
    },

    /**
     * Changes the position (x,y) of the widget .
     * @param {cc.Point} pos
     */
    setPosition: function (pos) {
        if (this._isRunning) {
            this._positionPercent = (this._widgetParent == null) ? cc.PointZero() : cc.p(pos.x / this._widgetParent.getSize().width, pos.y / this._widgetParent.getSize().height);
        }
        this._renderer.setPosition(pos);
    },

    /**
     * Changes the position (x,y) of the widget
     * @param {cc.Point} percent
     */
    setPositionPercent: function (percent) {
        this._positionPercent = percent;
        if (this._isRunning) {
            var parentSize = this._widgetParent.getSize();
            var absPos = cc.p(parentSize.width * this._positionPercent.x, parentSize.height * this._positionPercent.y);
            this._renderer.setPosition(absPos);
        }
    },

    /**
     * Sets the anchor point in percent.
     * @param {cc.Point} pt
     */
    setAnchorPoint: function (pt) {
        this._anchorPoint = pt;
        this._renderer.setAnchorPoint(pt);
    },

    updateAnchorPoint: function () {
        this.setAnchorPoint(this._anchorPoint);
    },

    /**
     * Gets the position (x,y) of the widget
     * @returns {cc.Point}
     */
    getPosition: function () {
        return this._renderer.getPosition();
    },

    /**
     * Gets the percent (x,y) of the widget
     * @returns {cc.Point}
     */
    getPositionPercent: function () {
        return this._positionPercent;
    },

    /**
     * Changes the position type of the widget
     * @param {cc.PositionType} type
     */
    setPositionType: function (type) {
        this._positionType = type;
    },

    /**
     * Gets the position type of the widget
     * @returns {cc.pPositionType}
     */
    getPositionType: function () {
        return this._positionType;
    },

    /**
     * Returns the anchor point in percent.
     * @returns {cc.Point}
     */
    getAnchorPoint: function () {
        return this._anchorPoint;
    },

    /**
     * Changes both X and Y scale factor of the widget.
     * 1.0 is the default scale factor. It modifies the X and Y scale at the same time.
     * @param {number} scale
     */
    setScale: function (scale) {
        this._renderer.setScale(scale);
    },

    /**
     * Gets the scale factor of the widget,  when X and Y have the same scale factor.
     * @returns {number}
     */
    getScale: function () {
        return this._renderer.getScale();
    },

    /**
     * Changes the scale factor on X axis of this widget
     * @param {number} scaleX
     */
    setScaleX: function (scaleX) {
        this._renderer.setScaleX(scaleX);
    },

    /**
     * Returns the scale factor on X axis of this widget
     * @returns {number}
     */
    getScaleX: function () {
        return this._renderer.getScaleX();
    },

    /**
     * Changes the scale factor on Y axis of this widget
     * @param {number} scaleY
     */
    setScaleY: function (scaleY) {
        this._renderer.setScaleY(scaleY);
    },

    /**
     * Returns the scale factor on Y axis of this widget
     * @returns {number}
     */
    getScaleY: function () {
        return this._renderer.getScaleY();
    },

    /**
     * Sets the rotation (angle) of the widget in degrees.
     * @param {number} rotation
     */
    setRotation: function (rotation) {
        this._renderer.setRotation(rotation);
    },

    /**
     * Returns the rotation of the widget in degrees.
     * @returns {number}
     */
    getRotation: function () {
        return this._renderer.getRotation();
    },

    /**
     * Sets the X rotation (angle) of the widget in degrees which performs a horizontal rotational skew.
     * @param {number} rotationX
     */
    setRotationX: function (rotationX) {
        this._renderer.setRotationX(rotationX);
    },

    /**
     * Gets the X rotation (angle) of the widget in degrees which performs a horizontal rotation skew.
     * @returns {number}
     */
    getRotationX: function () {
        return this._renderer.getRotationX();
    },

    /**
     * Sets the Y rotation (angle) of the widget in degrees which performs a vertical rotational skew.
     * @param {number} rotationY
     */
    setRotationY: function (rotationY) {
        this._renderer.setRotationY(rotationY);
    },

    /**
     * Gets the Y rotation (angle) of the widget in degrees which performs a vertical rotational skew.
     * @returns {number}
     */
    getRotationY: function () {
        return this._renderer.getRotationY();
    },

    /**
     * Sets whether the widget is visible
     * The default value is true, a widget is default to visible
     * @param {Boolean} visible
     */
    setVisible: function (visible) {
        this._visible = visible;
        this._renderer.setVisible(visible);
    },

    /**
     * Sets whether the widget should be flipped horizontally or not.
     * @param {Boolean} flipX
     */
    setFlippedX:function(flipX){

    },

    /**
     * Returns the flag which indicates whether the widget is flipped horizontally or not.
     * It only flips the texture of the widget, and not the texture of the widget's children.
     * Also, flipping the texture doesn't alter the anchorPoint.
     * If you want to flip the anchorPoint too, and/or to flip the children too use:
     * widget.setScaleX(sprite.getScaleX() * -1);
     * @return {Boolean} true if the widget is flipped horizaontally, false otherwise.
     */
    isFlippedX:function(){
        false;
    },

    /**
     * Sets whether the widget should be flipped vertically or not.
     * @param {Boolean} flipY
     */
    setFlippedY:function(flipY){

    },

    /**
     * Return the flag which indicates whether the widget is flipped vertically or not.
     * It only flips the texture of the widget, and not the texture of the widget's children.
     * Also, flipping the texture doesn't alter the anchorPoint.
     * If you want to flip the anchorPoint too, and/or to flip the children too use:
     * widget.setScaleY(widget.getScaleY() * -1);
     * @return {Boolean} true if the widget is flipped vertically, flase otherwise.
     */
    isFlippedY:function(){
        false;
    },

    /**
     * Determines if the widget is visible
     * @returns {boolean}
     */
    isVisible: function () {
        return this._visible;
    },

    /**
     * Determines if the widget is bright
     * @returns {boolean}
     */
    isBright: function () {
        return this._bright;
    },

    /**
     * Determines if the widget is enabled
     * @returns {boolean}
     */
    isEnabled: function () {
        return this._enabled;
    },

    /**
     * Gets the left boundary position of this widget.
     * @returns {number}
     */
    getLeftInParent: function () {
        return this.getPosition().x - this.getAnchorPoint().x * this._size.width;
    },

    /**
     * Gets the bottom boundary position of this widget.
     * @returns {number}
     */
    getBottomInParent: function () {
        return this.getPosition().y - this.getAnchorPoint().y * this._size.height;;
    },

    /**
     * Gets the right boundary position of this widget.
     * @returns {number}
     */
    getRightInParent: function () {
        return this.getLeftInParent() + this._size.width;
    },

    /**
     * Gets the top boundary position of this widget.
     * @returns {number}
     */
    getTopInParent: function () {
        return this.getBottomInParent() + this._size.height;
    },

    /**
     * Returns a pointer to the parent widget
     * @returns {cc.UIWidget}
     */
    getParent: function () {
        return this._widgetParent;
    },

    /**
     * Sets the parent widget
     * @param {cc.UIWidget} parent
     */
    setParent: function (parent) {
        this._widgetParent = parent;
    },

    /**
     * run action
     * @param {cc.Action} action
     * @returns {*}
     */
    runAction: function (action) {
        this._renderer.runAction(action);
    },

    /**
     * Sets the CCActionManager object that is used by all actions.
     * @param {cc.ActionManager} actionManager
     */
    setActionManager: function (actionManager) {
        this._renderer.setActionManager(actionManager);
    },

    /**
     * Gets the CCActionManager object that is used by all actions.
     * @returns {cc.ActionManager}
     */
    getActionManager: function () {
        return this._renderer.getActionManager();
    },

    /**
     * Stops and removes all actions from the running action list .
     */
    stopAllActions: function () {
        this._renderer.stopAllActions();
    },

    /**
     * Stops and removes an action from the running action list.
     * @param {cc.Action} action
     */
    stopAction: function (action) {
        this._renderer.stopAction(action);
    },

    /**
     * Removes an action from the running action list by its tag.
     * @param {number} tag
     */
    stopActionByTag: function (tag) {
        this._renderer.stopActionByTag(tag);
    },

    /**
     * Removes an action from the running action list by its tag.
     * @param {number} tag
     * @returns {cc.Action}
     */
    getActionByTag: function (tag) {
        return this._renderer.getActionByTag(tag);
    },

    /**
     * Sets color to widget
     * @param {cc.c3b} color
     */
    setColor: function (color) {
        if (this._renderer.RGBAProtocol) {
            this._renderer.setColor(color);
        }
    },

    /**
     * Gets color of widget
     * @returns {cc.c3b}
     */
    getColor: function () {
        if (this._renderer.RGBAProtocol) {
            return this._renderer.getColor();
        }
        return cc.WHITE;
    },

    /**
     * Sets opacity to widget
     * @param {number} opacity
     */
    setOpacity: function (opacity) {
        if (this._renderer.RGBAProtocol) {
            this._renderer.setOpacity(opacity);
        }
    },

    /**
     * Gets opacity of widget
     * @returns {number}
     */
    getOpacity: function () {
        if (this._renderer.RGBAProtocol) {
            return this._renderer.getOpacity();
        }
        return 255;
    },

    isCascadeOpacityEnabled: function () {
        if (this._renderer.RGBAProtocol) {
            return this._renderer.isCascadeOpacityEnabled();
        }
        return false;
    },

    setCascadeOpacityEnabled: function (cascadeOpacityEnabled) {
        if (this._renderer.RGBAProtocol) {
            this._renderer.setCascadeOpacityEnabled(cascadeOpacityEnabled);
        }
    },

    isCascadeColorEnabled: function () {
        if (this._renderer.RGBAProtocol) {
            return this._renderer.isCascadeColorEnabled();
        }
        return false;
    },

    setCascadeColorEnabled: function (cascadeColorEnabled) {
        if (this._renderer.RGBAProtocol) {
            this._renderer.setCascadeColorEnabled(cascadeColorEnabled);
        }
    },

    setBlendFunc: function (blendFunc) {
        if (this._renderer.setBlendFunc) {
            this._renderer.setBlendFunc(blendFunc);
        }
    },

    getTouchStartPos: function () {
        return this._touchStartPos;
    },

    getTouchMovePos: function () {
        return this._touchMovePos;
    },

    getTouchEndPos: function () {
        return this._touchEndPos;
    },

    setTag: function (tag) {
        this._widgetTag = tag;
    },

    getTag: function () {
        return this._widgetTag;
    },

    setName: function (name) {
        this._name = name;
    },

    getName: function () {
        return this._name;
    },

    getWidgetType: function () {
        return this._widgetType;
    },

    setLayoutParameter: function (parameter) {
        this._layoutParameterDictionary[parameter.getLayoutType()] = parameter;
    },

    getLayoutParameter: function (type) {
        return this._layoutParameterDictionary[type];
    },

    getDescription: function () {
        return "Widget";
    },

    /*temp action*/
    setActionTag: function (tag) {
        this._actionTag = tag;
    },

    getActionTag: function () {
        return this._actionTag;
    },
    setTouchEnable: function (enabled, containChildren) {
        containChildren = containChildren || false;
        this.setTouchEnabled(enabled);
        if (containChildren) {
            var childrenArray = this.getChildren();
            var length = childrenArray.length;
            var child;
            for (var i = 0; i < length; ++i) {
                child = childrenArray[i];
                child.setTouchEnable(enabled, true);
            }
        }
    },
    disable: function (containChildren) {
        containChildren = containChildren || false;
        this.setBright(false, containChildren);
        this.setTouchEnable(false, containChildren);
    },
    active: function (containChildren) {
        containChildren = containChildren || false;
        this.setBright(true, containChildren);
        this.setTouchEnable(true, containChildren);
    },
    isActive: function () {
        return this.isBright();
    },
    setBright: function (bright, containChild) {
        this._bright = bright;
        if (this._bright) {
            this._brightStyle = cc.BrightStyle.NONE;
            this.setBrightStyle(cc.BrightStyle.NORMAL);
        }
        else {
            this.onPressStateChangedToDisabled();
        }

        if (containChild) {
            var childrenArray = this.getChildren();
            var length = childrenArray.length;
            var child;
            for (var i = 0; i < length; ++i) {
                child = childrenArray[i];
                child.setBright(bright, containChild);
            }
        }
    },

    getRect: function () {
        var wPos = this.getWorldPosition();
        var width = this._size.width;
        var height = this._size.height;
        var offset_width = this._anchorPoint.x * width;
        var offset_height = this._anchorPoint.y * height;
        return cc.rect(wPos.x - offset_width, wPos.y - offset_height, width, height);
    },
    getValidNode: function () {
        return this.getVirtualRenderer();
    },
    setWidgetZOrder: function (z) {
        this.setZOrder(z);
    },
    getWidgetZOrder: function () {
        return this.getZOrder();
    },
    getRelativeLeftPos: function () {
        return this.getLeftInParent();
    },
    getRelativeBottomPos: function () {
        return this.getBottomInParent();
    },
    getRelativeRightPos: function () {
        return this.getRightInParent();
    },
    getRelativeTopPos: function () {
        return this.getTopInParent();
    },
    getContainerNode: function () {
        return this.getRenderer();
    },
    setWidgetParent: function (parent) {
        this.setParent(parent);
    },
    getWidgetParent: function () {
        return this.getParent();
    },
    setWidgetTag: function (tag) {
        this.setTag(tag);
    },
    getWidgetTag: function () {
        return this.getTag();
    },
    addCCNode: function (node) {
        this.addRenderer(node, 0);
    },
    removeCCNode: function (cleanup) {
        this.removeCCNode(cleanup);
    }
});

cc.UIWidget.create = function () {
    var widget = new cc.UIWidget();
    if (widget && widget.init()) {
        return widget;
    }
    return null;
};

cc.GUIRenderer = cc.NodeRGBA.extend({
    _enabled: true,
    setEnabled: function (enabled) {
        this._enabled = enabled;
    },

    isEnabled: function () {
        return this._enabled;
    },

    visit: function (ctx) {
        if (!this._enabled) {
            return;
        }
        cc.NodeRGBA.prototype.visit.call(this, ctx);
    }
});

cc.GUIRenderer.create = function () {
    var widget = new cc.GUIRenderer();
    if (widget && widget.init()) {
        return widget;
    }
    return null;
};