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
 * bright style
 * @type {Object}
 */
ccs.BrightStyle = {
    none: -1,
    normal: 0,
    highlight: 1
};

/**
 * widget type
 * @type {Object}
 */
ccs.WidgetType = {
    widget: 0, //control
    container: 1 //container
};

/**
 * texture resource type
 * @type {Object}
 */
ccs.TextureResType = {
    local: 0,
    plist: 1
};

/**
 * touch event type
 * @type {Object}
 */
ccs.TouchEventType = {
    began: 0,
    moved: 1,
    ended: 2,
    canceled: 3
};

/**
 * size type
 * @type {Object}
 */
ccs.SizeType = {
    absolute: 0,
    percent: 1
};

/**
 * position type
 * @type {Object}
 */
ccs.PositionType = {
    absolute: 0,
    percent: 1
};

/**
 * Base class for ccs.UIWidget
 * @sample
 * var uiWidget = ccs.UIWidget.create();
 * var uiLayer = ccs.UILayer.create();
 * uiLayer.addWidget(uiWidget);
 * @class
 * @extends ccs.Class
 */
ccs.UIWidget = ccs.Class.extend(/** @lends ccs.UIWidget# */{
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
    _userObject: null,
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
        this._brightStyle = ccs.BrightStyle.none;
        this._updateEnabled = false;
        this._renderer = null;
        this._touchStartPos = cc.PointZero();
        this._touchMovePos = cc.PointZero();
        this._touchEndPos = cc.PointZero();
        this._touchEventListener = null;
        this._touchEventSelector = null;
        this._widgetTag = -1;
        this._name = "default";
        this._widgetType = ccs.WidgetType.widget;
        this._actionTag = 0;
        this._size = cc.SizeZero();
        this._customSize = cc.SizeZero();
        this._layoutParameterDictionary = {};
        this._ignoreSize = false;
        this._children = [];
        this._affectByClipping = false;
        this._scheduler = null;
        this._sizeType = ccs.SizeType.absolute;
        this._sizePercent = cc.PointZero();
        this._positionType = ccs.PositionType.absolute;
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
        this._children=[];
        this._renderer.removeAllChildren(true);
        this._renderer.removeFromParent(true);
        this._renderer.release();
    },

    onEnter: function () {
        var locChild;
        for (var i = 0; i < this._children.length; i++) {
            locChild = this._children[i];
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
            locChild.onExit();
        }
    },

    /**
     * Adds a child to the container.
     * @param {ccs.UIWidget}child
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
     * @param {ccs.UIWidget} child
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
            child.setUpdateEnabled(false);
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
        var childrenLength = this._children.length;
        if (childrenLength <= 0) {
            return
        }
        for (var i = 0; i < childrenLength; ++i) {
            this.removeChild(this._children[0]);
        }
    },

    /**
     * Reorders a child according to a new z value.
     * @param {ccs.UIWidget} child
     */
    reorderChild: function (child) {
        var childrenCount = this._children.length;
        if (childrenCount <= 0) {
            return;
        }
        else {
            cc.ArrayRemoveObject(this._children, child);
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
     * @returns {ccs.UIWidget}
     */
    getChildByName: function (name) {
        return ccs.UIHelper.seekWidgetByName(this, name);
    },

    /**
     * Gets a child from the container with its tag
     * @param {number} tag
     * @returns {ccs.UIWidget}
     */
    getChildByTag: function (tag) {
        return ccs.UIHelper.seekWidgetByTag(this, tag);
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
        this._renderer = ccs.GUIRenderer.create();
    },

    /**
     * Changes the size that is widget's size
     * @param {cc.Size} size
     */
    setSize: function (size) {
        this._customSize.width = size.width;
        this._customSize.height = size.height;
        var locSize;
        if (this._ignoreSize) {
             locSize = this.getContentSize();
        }
        else {
            locSize = size;
        }
        this._size.width = locSize.width;
        this._size.height = locSize.height;

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
        var locSize;
        if (this._ignoreSize) {
            locSize = this.getContentSize();
        }
        else {
            locSize = size;
        }
        this._size.width = locSize.width;
        this._size.height = locSize.height;
        this._customSize.width = size.width;
        this._customSize.height = size.height;
        this.onSizeChanged();
    },

    /**
     * update size and position
     */
    updateSizeAndPosition: function () {
        switch (this._sizeType) {
            case ccs.SizeType.absolute:
                var locSize;
                if (this._ignoreSize) {
                    locSize = this.getContentSize();
                }
                else {
                    locSize = this._customSize;
                }
                this._size.width = locSize.width;
                this._size.height = locSize.height;
                this._sizePercent = (this._widgetParent == null) ? cc.PointZero() : cc.p(this._customSize.width / this._widgetParent.getSize().width, this._customSize.height / this._widgetParent.getSize().height);
                break;
            case ccs.SizeType.percent:
                var cSize = (this._widgetParent == null) ? cc.SizeZero() : cc.size(this._widgetParent.getSize().width * this._sizePercent.x, this._widgetParent.getSize().height * this._sizePercent.y);
                var locSize;
                if (this._ignoreSize) {
                    locSize = this.getContentSize();
                }
                else {
                    locSize = cSize;
                }
                this._size.width = locSize.width;
                this._size.height = locSize.height;
                this._customSize.width = cSize.width;
                this._customSize.height = cSize.height;
                break;
            default:
                break;
        }
        this.onSizeChanged();
        var absPos = this.getPosition();
        switch (this._positionType) {
            case ccs.PositionType.absolute:
                this._positionPercent = (this._widgetParent == null) ? cc.PointZero() : cc.p(absPos.x / this._widgetParent.getSize().width, absPos.y / this._widgetParent.getSize().height);
                break;
            case ccs.PositionType.percent:
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
     * @param {ccs.SizeType} type
     */
    setSizeType: function (type) {
        this._sizeType = type;
    },

    /**
     * Gets the size type of widget.
     * @returns {ccs.SizeType}
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
        var locSize;
        if (this._ignoreSize) {
            locSize = this.getContentSize();
        }
        else {
            locSize = this._customSize;
        }
        this._size.width = locSize.width;
        this._size.height = locSize.height;
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
        if(this._updateEnabled == enable){
            return;
        }
        this._updateEnabled = enable;
        if (enable) {
            this._scheduler.scheduleUpdateForTarget(this, 0, false);
        }
        else {
            this._scheduler.unscheduleUpdateForTarget(this);
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
                this.setBrightStyle(ccs.BrightStyle.highlight);
            }
            else {
                this.setBrightStyle(ccs.BrightStyle.normal);
            }
        }
        else {
            this.onPressStateChangedToDisabled();
        }
    },

    /**
     * To set the bright style of widget.
     * @param {ccs.BrightStyle} style
     */
    setBrightStyle: function (style) {
        if (this._brightStyle == style) {
            return;
        }
        style = style|| ccs.BrightStyle.normal;
        this._brightStyle = style;
        switch (this._brightStyle) {
            case ccs.BrightStyle.normal:
                this.onPressStateChangedToNormal();
                break;
            case ccs.BrightStyle.highlight:
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
                this._touchEventSelector.call(this._touchEventListener, this, ccs.TouchEventType.began);
            }
        }
    },

    moveEvent: function () {
        if (this._touchEventListener && this._touchEventSelector) {
            if (this._touchEventSelector) {
                this._touchEventSelector.call(this._touchEventListener, this, ccs.TouchEventType.moved);
            }
        }
    },

    releaseUpEvent: function () {
        if (this._touchEventListener && this._touchEventSelector) {
            if (this._touchEventSelector) {
                this._touchEventSelector.call(this._touchEventListener, this, ccs.TouchEventType.ended);
            }
        }
    },

    cancelUpEvent: function () {
        if (this._touchEventSelector) {
            this._touchEventSelector.call(this._touchEventListener, this, ccs.TouchEventType.canceled);
        }
    },

    longClickEvent: function () {

    },

    /**
     * Sets the touch event target/selector of the menu item
     * @param {Function} selector
     * @param {Object} target
     */
    addTouchEventListener: function (selector, target) {
        this._touchEventSelector = selector;
        this._touchEventListener = target;
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
            if (parent instanceof ccs.UILayout) {
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
     * @param {ccs.UIWidget} sender
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
     * @param {cc.Point|Number} point The anchor point of UIWidget or The anchor point.x of UIWidget.
     * @param {Number} [y] The anchor point.y of UIWidget.
     */
    setAnchorPoint: function (point, y) {
        if (arguments.length === 2) {
            this._anchorPoint.x = point;
            this._anchorPoint.y = y;
            this._renderer.setAnchorPoint(point, y);
        } else {
            this._anchorPoint.x = point.x;
            this._anchorPoint.y = point.y;
            this._renderer.setAnchorPoint(point);
        }
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
     * @param {ccs.PositionType} type
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
     * @returns {ccs.UIWidget}
     */
    getParent: function () {
        return this._widgetParent;
    },

    /**
     * Sets the parent widget
     * @param {ccs.UIWidget} parent
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

    /**
     * Gets whether  cascadeOpacity is enabled
     * @returns {Boolean}
     */
    isCascadeOpacityEnabled: function () {
        if (this._renderer.RGBAProtocol) {
            return this._renderer.isCascadeOpacityEnabled();
        }
        return false;
    },

    /**
     * Sets cascade opacity enabled
     * @param {Boolean} cascadeOpacityEnabled
     */
    setCascadeOpacityEnabled: function (cascadeOpacityEnabled) {
        if (this._renderer.RGBAProtocol) {
            this._renderer.setCascadeOpacityEnabled(cascadeOpacityEnabled);
        }
    },

    /**
     * Gets whether cascadeColor is enabled
     * @returns {Boolean}
     */
    isCascadeColorEnabled: function () {
        if (this._renderer.RGBAProtocol) {
            return this._renderer.isCascadeColorEnabled();
        }
        return false;
    },

    /**
     *  Sets cascade color enabled
     * @param {Boolean} cascadeColorEnabled
     */
    setCascadeColorEnabled: function (cascadeColorEnabled) {
        if (this._renderer.RGBAProtocol) {
            this._renderer.setCascadeColorEnabled(cascadeColorEnabled);
        }
    },

    /**
     * Sets blendFunc
     * @param {cc.BlendFunc} blendFunc
     */
    setBlendFunc: function (blendFunc) {
        if (this._renderer.setBlendFunc) {
            this._renderer.setBlendFunc(blendFunc);
        }
    },

    /**
     * Gets touch start position
     * @returns {cc.Point}
     */
    getTouchStartPos: function () {
        return this._touchStartPos;
    },

    /**
     * Gets touch move position
     * @returns {cc.Point}
     */
    getTouchMovePos: function () {
        return this._touchMovePos;
    },

    /**
     * Gets touch end position
     * @returns {cc.Point}
     */
    getTouchEndPos: function () {
        return this._touchEndPos;
    },

    /**
     * Sets widget tag
     * @param {Number} tag
     */
    setTag: function (tag) {
        this._widgetTag = tag;
    },

    /**
     * Gets widget tag
     * @returns {Number}
     */
    getTag: function () {
        return this._widgetTag;
    },

    /**
     * Sets the name of widget
     * @param {String} name
     */
    setName: function (name) {
        this._name = name;
    },

    /**
     * Gets the name of widget
     * @returns {string}
     */
    getName: function () {
        return this._name;
    },

    /**
     * get widget type
     * @returns {ccs.WidgetType}
     */
    getWidgetType: function () {
        return this._widgetType;
    },

    /**
     * Sets layout parameter
     * @param {ccs.UILayoutParameter} parameter
     */
    setLayoutParameter: function (parameter) {
        this._layoutParameterDictionary[parameter.getLayoutType()] = parameter;
    },

    /**
     * Gets layout parameter
     * @param {ccs.LayoutParameterType} type
     * @returns {ccs.UILayoutParameter}
     */
    getLayoutParameter: function (type) {
        return this._layoutParameterDictionary[type];
    },

    /**
     * Returns the "class name" of widget.
     * @returns {string}
     */
    getDescription: function () {
        return "Widget";
    },

    clone: function () {
        var clonedWidget = this.createCloneInstance();
        clonedWidget.copyProperties(this);
        clonedWidget.copyClonedWidgetChildren(this);
        return clonedWidget;
    },

    createCloneInstance: function () {
        return ccs.UIWidget.create();
    },

    copyClonedWidgetChildren: function (model) {
        var widgetChildren = model.getChildren();
        for (var i = 0; i < widgetChildren.length; i++) {
            var locChild = widgetChildren[i];
            this.addChild(locChild.clone());
        }
    },

    copySpecialProperties: function (model) {

    },

    copyProperties: function (widget) {
        this.setEnabled(widget.isEnabled());
        this.setVisible(widget.isVisible());
        this.setBright(widget.isBright());
        this.setTouchEnabled(widget.isTouchEnabled());
        this._touchPassedEnabled = false;
        this.setZOrder(widget.getZOrder());
        this.setUpdateEnabled(widget.isUpdateEnabled());
        this.setTag(widget.getTag());
        this.setName(widget.getName());
        this.setActionTag(widget.getActionTag());
        this._ignoreSize = widget._ignoreSize;
        this._size = widget._size;
        this._customSize = widget._customSize;
        this.copySpecialProperties(widget);
        this._sizeType = widget.getSizeType();
        this._sizePercent = widget._sizePercent;
        this._positionType = widget._positionType;
        this._positionPercent = widget._positionPercent;
        this.setPosition(widget.getPosition());
        this.setAnchorPoint(widget.getAnchorPoint());
        this.setScaleX(widget.getScaleX());
        this.setScaleY(widget.getScaleY());
        this.setRotation(widget.getRotation());
        this.setRotationX(widget.getRotationX());
        this.setRotationY(widget.getRotationY());
        this.setFlippedX(widget.isFlippedX());
        this.setFlippedY(widget.isFlippedY());
        this.setColor(widget.getColor());
        this.setOpacity(widget.getOpacity());
        this.setCascadeOpacityEnabled(widget.isCascadeOpacityEnabled());
        this.setCascadeColorEnabled(widget.isCascadeColorEnabled());
        this.onSizeChanged();
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
            this._brightStyle = ccs.BrightStyle.none;
            this.setBrightStyle(ccs.BrightStyle.normal);
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
        this.removeRenderer(cleanup);
    },
    setUserObject:function(userObject){
        this._userObject = userObject;
    },
    getUserObject:function(){
        return this._userObject;
    }
});
/**
 * allocates and initializes a UIWidget.
 * @constructs
 * @return {ccs.UIWidget}
 * @example
 * // example
 * var uiWidget = ccs.UIWidget.create();
 */
ccs.UIWidget.create = function () {
    var widget = new ccs.UIWidget();
    if (widget && widget.init()) {
        return widget;
    }
    return null;
};

/**
 * Base class for ccs.GUIRenderer
 * @class
 * @extends ccs.NodeRGBA
 */
ccs.GUIRenderer = ccs.NodeRGBA.extend({
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
/**
 * allocates and initializes a GUIRenderer.
 * @constructs
 * @return {ccs.GUIRenderer}
 * @example
 * // example
 * var guiRenderer = ccs.GUIRenderer.create();
 */
ccs.GUIRenderer.create = function () {
    var widget = new ccs.GUIRenderer();
    if (widget && widget.init()) {
        return widget;
    }
    return null;
};