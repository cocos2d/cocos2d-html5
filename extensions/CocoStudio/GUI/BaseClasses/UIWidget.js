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
 * Base class for ccs.Widget
 * @sample
 * var uiWidget = ccs.Widget.create();
 * var uiLayer = ccs.UILayer.create();
 * uiLayer.addWidget(uiWidget);
 * @class
 * @extends ccs.Class
 */
ccs.Widget = ccs.NodeRGBA.extend(/** @lends ccs.Widget# */{
    _enabled: true,            ///< Highest control of widget
    _bright: true,             ///< is this widget bright
    _touchEnabled: false,       ///< is this widget touch endabled
    _touchPassedEnabled: false, ///< is the touch event should be passed
    _focus: false,              ///< is the widget on focus
    _brightStyle: null, ///< bright style
    _updateEnabled: false,      ///< is "update" method scheduled
    _touchStartPos: null,    ///< touch began point
    _touchMovePos: null,     ///< touch moved point
    _touchEndPos: null,      ///< touch ended point

    _touchEventListener: null,
    _touchEventSelector: null,

    _name: "default",
    _widgetType: null,
    _actionTag: 0,
    _size: null,
    _customSize: null,
    _layoutParameterDictionary: null,
    _ignoreSize: false,
    _widgetChildren: null,
    _affectByClipping: false,

    _sizeType: null,
    _sizePercent: null,
    _positionType: null,
    _positionPercent: null,
    _reorderWidgetChildDirty: false,
    _hitted: false,
    _nodes: null,
    ctor: function () {
        cc.NodeRGBA.prototype.ctor.call(this);
        this._enabled = true;
        this._bright = true;
        this._touchEnabled = false;
        this._touchPassedEnabled = false;
        this._focus = false;
        this._brightStyle = ccs.BrightStyle.none;
        this._updateEnabled = false;
        this._touchStartPos = cc.PointZero();
        this._touchMovePos = cc.PointZero();
        this._touchEndPos = cc.PointZero();
        this._touchEventListener = null;
        this._touchEventSelector = null;
        this._name = "default";
        this._widgetType = ccs.WidgetType.widget;
        this._actionTag = 0;
        this._size = cc.SizeZero();
        this._customSize = cc.SizeZero();
        this._layoutParameterDictionary = {};
        this._ignoreSize = false;
        this._widgetChildren = [];
        this._affectByClipping = false;
        this._sizeType = ccs.SizeType.absolute;
        this._sizePercent = cc.PointZero();
        this._positionType = ccs.PositionType.absolute;
        this._positionPercent = cc.PointZero();
        this._reorderWidgetChildDirty = false;
        this._hitted = false;
        this._nodes = [];
    },

    /**
     * initializes state of widget.
     * @returns {boolean}
     */
    init: function () {
        if (cc.NodeRGBA.prototype.init.call(this)){
            this._layoutParameterDictionary = {};
            this._widgetChildren = [];
            this.initRenderer();
            this.setCascadeColorEnabled(true);
            this.setCascadeOpacityEnabled(true);
            this.setBright(true);
            this.ignoreContentAdaptWithSize(true);
            this.setAnchorPoint(cc.p(0.5, 0.5));
        }
        return true;
    },

    onEnter: function () {
        this.updateSizeAndPosition();
        cc.NodeRGBA.prototype.onEnter.call(this);
    },

    visit: function (ctx) {
        if (this._enabled) {
            cc.NodeRGBA.prototype.visit.call(this,ctx);
        }
    },

    /**
     * Adds a child to the container.
     * @param {ccs.Widget} child
     */
    addChild: function (child, zOrder, tag) {
        if(!(child instanceof ccs.Widget)){
            cc.log("Widget only supports Widgets as children");
            return;
        }
        cc.NodeRGBA.prototype.addChild.call(this, child, zOrder, tag);
        this._widgetChildren.push(child);
    },

    sortAllChildren: function () {
        this._reorderWidgetChildDirty = this._reorderChildDirty;
        cc.NodeRGBA.prototype.sortAllChildren.call(this);
        if (this._reorderWidgetChildDirty) {
            var _children = this._widgetChildren;
            var i, j, length = _children.length, tempChild;

            // insertion sort
            for (i = 0; i < length; i++) {
                var tempItem = _children[i];
                j = i - 1;
                tempChild = _children[j];

                //continue moving element downwards while zOrder is smaller or when zOrder is the same but mutatedIndex is smaller
                while (j >= 0 && ( tempItem._zOrder < tempChild._zOrder ||
                    ( tempItem._zOrder == tempChild._zOrder && tempItem._orderOfArrival < tempChild._orderOfArrival ))) {
                    _children[j + 1] = tempChild;
                    j = j - 1;
                    tempChild = _children[j];
                }
                _children[j + 1] = tempItem;
            }

            //don't need to check children recursively, that's done in visit of each child

            this._reorderWidgetChildDirty = false;
        }
    },

    /**
     * Return an array of children
     * @returns {Array}
     */
    getChildren: function () {
        return this._widgetChildren;
    },

    /**
     * get the count of children
     * @returns {Number}
     */
    getChildrenCount: function () {
        return this._widgetChildren ? this._widgetChildren.length : 0;
    },

    getWidgetParent: function () {
        var widget = this.getParent();
        if(widget instanceof ccs.Widget){
            return widget;
        }
        return null;
    },

    removeFromParent: function (cleanup) {
        cc.NodeRGBA.prototype.removeFromParent.call(this, cleanup);
    },

    removeFromParentAndCleanup: function (cleanup) {
        cc.NodeRGBA.prototype.removeFromParent.call(this, cleanup);
    },

    /**
     * remove  child
     * @param {ccs.Widget} child
     * @param {Boolean} cleanup
     */
    removeChild: function (child, cleanup) {
        cc.NodeRGBA.prototype.removeChild.call(this, child, cleanup);
        cc.ArrayRemoveObject(this._widgetChildren, child);
    },

    removeChildByTag: function (tag, cleanup) {
        var child = this.getChildByTag(tag);

        if (child == null) {
            cc.log("cocos2d: removeChildByTag(tag = " + tag + "): child not found!");
        }
        else {
            this.removeChild(child, cleanup);
        }
    },

    /**
     * Removes all children from the container, and do a cleanup to all running actions depending on the cleanup parameter.
     */
    removeAllChildren: function (cleanup) {
        var childrenLength = this._widgetChildren.length;
        if (childrenLength <= 0) {
            return
        }
        cc.NodeRGBA.prototype.removeAllChildren.call(this, cleanup);
        this._widgetChildren = [];
    },

    /**
     * Set enabled renderer
     * @param {Boolean} enabled
     */
    setEnabled: function (enabled) {
        this._enabled = enabled;
        var arrayChildren = this._widgetChildren;
        var childrenCount = arrayChildren.length;
        for (var i = 0; i < childrenCount; i++) {
            var child = arrayChildren[i];
            child.setEnabled(enabled);
        }
    },

    /**
     * Gets a child from the container with its name
     * @param {string} name
     * @returns {ccs.Widget}
     */
    getChildByName: function (name) {
        var arrayChildren = this._widgetChildren;
        var childrenCount = arrayChildren.length;
        for (var i = 0; i < childrenCount; i++) {
            var child = arrayChildren[i];
            if (child.getName() == name) {
                return child;
            }
        }
    },

    /**
     * initializes renderer of widget.
     */
    initRenderer: function () {
    },

    /**
     * add node for widget
     * @param {cc.Node} node
     * @param {Number} zOrder
     * @param {Number} tag
     */
    addNode: function (node, zOrder, tag) {
        if (node instanceof ccs.Widget) {
            cc.log("Widget only supports Nodes as renderer");
            return;
        }
        cc.NodeRGBA.prototype.addChild.call(this, node, zOrder, tag);
        this._nodes.push(node);
    },

    /**
     * get node by tag
     * @param {Number} tag
     * @returns {cc.Node}
     */
    getNodeByTag: function (tag) {
        for (var i = 0; i < this._nodes.length; i++) {
            var node = this._nodes[i];
            if (node && node.getTag() == tag) {
                return node;
            }
        }
        return null;
    },

    /**
     * get all node
     * @returns {Array}
     */
    getNodes: function () {
        return this._nodes;
    },

    /**
     * remove node
     * @param {cc.Node} node
     */
    removeNode: function (node) {
        cc.NodeRGBA.prototype.removeChild.call(this, node);
        cc.ArrayRemoveObject(this._nodes, node);
    },

    /**
     *  remove node by tag
     * @param tag
     */
    removeNodeByTag: function (tag) {
        var node = this.getNodeByTag(tag);
        if (!node) {
            cc.log("cocos2d: removeNodeByTag(tag = %d): child not found!", tag);
        }
        else {
            this.removeNode(node);
        }
    },

    /**
     * remove all node
     */
    removeAllNodes: function () {
        for (var i = 0; i < this._nodes.length; i++) {
            var node = this._nodes[i];
            cc.NodeRGBA.prototype.removeChild.call(this, node);
        }
        this._nodes = [];
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

        if(this._running){
            var  widgetParent = this.getWidgetParent();
            if(widgetParent){
                locSize = widgetParent.getSize();
            }else{
                locSize = this._parent.getContentSize();
            }
            this._sizePercent.x = 0;
            this._sizePercent.y = 0;
            if(locSize.width>0){
                this._sizePercent.x = this._customSize.width / locSize.width;
            }
            if(locSize.height>0){
                this._sizePercent.y = this._customSize.height / locSize.height;
            }
        }
        this.onSizeChanged();
    },

    /**
     * Changes the percent that is widget's percent size
     * @param {cc.Point} percent
     */
    setSizePercent: function (percent) {
        this._sizePercent = percent;
        var size = cc.size(this._customSize.width, this._customSize.height);
        if (this._running) {
            var widgetParent = this.getWidgetParent();
            if (widgetParent) {
                size.width = widgetParent.getSize().width * percent.x;
                size.height = widgetParent.getSize().height * percent.y;
            }
            else {
                size.width = this._parent.getContentSize().width * percent.x;
                size.height = this._parent.getContentSize().height * percent.y;
            }
        }
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

                var pSize,spx=spy=0;
                var widgetParent = this.getWidgetParent();
                if (widgetParent){
                    pSize = widgetParent.getSize();
                }else{
                    pSize = this._parent.getContentSize();
                }
                if (pSize.width > 0) {
                    spx = this._customSize.width / pSize.width;
                }
                if (pSize.height > 0) {
                    spy = this._customSize.height / pSize.height;
                }
                this._sizePercent.x = spx;
                this._sizePercent.y = spy;
                break;
            case ccs.SizeType.percent:
                var widgetParent = this.getWidgetParent();
                var cSize = cc.size(0,0);
                if (widgetParent){
                    cSize.width = widgetParent.getSize().width * this._sizePercent.x;
                    cSize.height = widgetParent.getSize().height * this._sizePercent.x;
                }else{
                    cSize.width = this._parent.getContentSize().width * this._sizePercent.x;
                    cSize.height = this._parent.getContentSize().height * this._sizePercent.y;
                }
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
                var widgetParent = this.getWidgetParent();
                var pSize;
                if(widgetParent){
                    pSize = widgetParent.getSize();
                }else{
                    pSize = this._parent.getContentSize();
                }
                if(pSize.width<=0||pSize.height<=0){
                    this._positionPercent.x = 0;
                    this._positionPercent.y = 0;
                }else{
                    this._positionPercent.x = absPos.x / pSize.width;
                    this._positionPercent.y = absPos.y / pSize.height;
                }
                break;
            case ccs.PositionType.percent:
                var widgetParent = this.getWidgetParent();
                var pSize;
                if(widgetParent){
                    pSize = widgetParent.getSize();
                }else{
                    pSize = this._parent.getContentSize();
                }
                absPos = cc.p(pSize.width * this._positionPercent.x, pSize.height * this._positionPercent.y);
                break;
            default:
                break;
        }
        this.setPosition(absPos);
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
        return this.convertToWorldSpace(cc.PointZero());
    },

    /**
     * Gets the Virtual Renderer of widget.
     * @returns {cc.Node}
     */
    getVirtualRenderer: function () {
        return this;
    },

    /**
     * call back function called when size changed.
     */
    onSizeChanged: function () {
        for (var i = 0; i < this._widgetChildren.length; i++) {
            var child = this._widgetChildren[i];
            child.updateSizeAndPosition();
        }
    },

    /**
     * Gets the content size of widget.
     * @returns {cc.Size}
     */
    getContentSize: function () {
        return this._size;
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
        if (this._updateEnabled == enable) {
            return;
        }
        this._updateEnabled = enable;
        if (enable) {
            this.scheduleUpdate();
        }
        else {
            this.unscheduleUpdate();
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

    setBright: function (bright, containChild) {
        this._bright = bright;
        if (this._bright) {
            this._brightStyle = ccs.BrightStyle.none;
            this.setBrightStyle(ccs.BrightStyle.normal);
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

    onTouchBegan: function (touch,event) {
        var touchPoint = touch.getLocation();
        this._touchStartPos.x = touchPoint.x;
        this._touchStartPos.y = touchPoint.y;
        this._hitted = this.isEnabled() && this.isTouchEnabled()&& this.hitTest(touchPoint)&& this.clippingParentAreaContainPoint(touchPoint);
        if(!this._hitted){
            return false;
        }
        this.setFocused(true);
        var widgetParent = this.getWidgetParent();
        if (widgetParent) {
            widgetParent.checkChildInfo(0, this, touchPoint);
        }
        this.pushDownEvent();
        return !this._touchPassedEnabled;
    },

    onTouchMoved: function (touch,event) {
        var touchPoint = touch.getLocation();
        this._touchMovePos.x = touchPoint.x;
        this._touchMovePos.y = touchPoint.y;
        this.setFocused(this.hitTest(touchPoint));
        var widgetParent = this.getWidgetParent();
        if (widgetParent) {
            widgetParent.checkChildInfo(1, this, touchPoint);
        }
        this.moveEvent();
    },


    onTouchEnded: function (touch,event) {
        var touchPoint = touch.getLocation();
        this._touchEndPos.x = touchPoint.x;
        this._touchEndPos.y = touchPoint.y;
        var focus = this._focus;
        this.setFocused(false);
        var widgetParent = this.getWidgetParent();
        if (widgetParent) {
            widgetParent.checkChildInfo(2, this, touchPoint);
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
     * Checks a point if is in widget's space
     * @param {cc.Point} pt
     * @returns {boolean}
     */
    hitTest: function (pt) {
        var nsp = this.convertToNodeSpace(pt);
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
            if (parent instanceof ccs.Layout) {
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
     * @param {ccs.Widget} sender
     * @param {cc.Point} touchPoint
     */
    checkChildInfo: function (handleState, sender, touchPoint) {
        var widgetParent = this.getWidgetParent();
        if (widgetParent) {
            widgetParent.checkChildInfo(handleState, sender, touchPoint);
        }
    },

    /**
     * Changes the position (x,y) of the widget .
     * @param {cc.Point||Number} pos
     * @param {Number} posY
     */
    setPosition: function (pos, posY) {
        if (this._running) {
            var widgetParent = this.getWidgetParent();
            if (widgetParent) {
                var pSize = widgetParent.getSize();
                if (pSize.width <= 0 || pSize.height <= 0) {
                    this._positionPercent.x = 0;
                    this._positionPercent.y = 0;
                }
                else {
                    if(posY){
                        this._positionPercent.x = pos / pSize.width;
                        this._positionPercent.y = posY / pSize.height;
                    }else{
                        this._positionPercent.x = pos.x / pSize.width;
                        this._positionPercent.y = pos.y / pSize.height;
                    }
                }
            }
        }

        cc.NodeRGBA.prototype.setPosition.apply(this,arguments);
    },

    /**
     * Changes the position (x,y) of the widget
     * @param {cc.Point} percent
     */
    setPositionPercent: function (percent) {
        this._positionPercent = percent;
        if (this._running) {
            var widgetParent = this.getWidgetParent();
            if(widgetParent){
                var parentSize = widgetParent.getSize();
                var absPos = cc.p(parentSize.width * this._positionPercent.x, parentSize.height * this._positionPercent.y);
                this.setPosition(absPos);
            }
        }
    },

    updateAnchorPoint:function(){
        this.setAnchorPoint(this.getAnchorPoint());
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

    setFlippedX: function (flipX) {
    },

    isFlippedX: function () {
        return false;
    },

    setFlippedY: function (flipY) {
    },
    isFlippedY: function () {
        return false;
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
        return this.getPosition().y - this.getAnchorPoint().y * this._size.height;
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
     * @param {ccs.LayoutParameter} parameter
     */
    setLayoutParameter: function (parameter) {
        this._layoutParameterDictionary[parameter.getLayoutType()] = parameter;
    },

    /**
     * Gets layout parameter
     * @param {ccs.LayoutParameterType} type
     * @returns {ccs.LayoutParameter}
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
        return ccs.Widget.create();
    },

    copyClonedWidgetChildren: function (model) {
        var widgetChildren = model.getChildren();
        for (var i = 0; i < widgetChildren.length; i++) {
            var locChild = widgetChildren[i];
            if(locChild instanceof ccs.Widget){
                this.addChild(locChild.clone());
            }
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
    }
});
/**
 * allocates and initializes a UIWidget.
 * @constructs
 * @return {ccs.Widget}
 * @example
 * // example
 * var uiWidget = ccs.Widget.create();
 */
ccs.Widget.create = function () {
    var widget = new ccs.Widget();
    if (widget && widget.init()) {
        return widget;
    }
    return null;
};
