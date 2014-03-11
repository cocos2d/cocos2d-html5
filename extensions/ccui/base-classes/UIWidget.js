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
 * Base class for ccui.Widget
 * @sample
 * var uiWidget = ccui.Widget.create();
 * this.addChild(uiWidget);
 * @class
 * @extends ccui.Node
 *
 * @property {Number}           xPercent        - Position x in percentage of width
 * @property {Number}           yPercent        - Position y in percentage of height
 * @property {Number}           widthPercent    - Width in percentage of parent width
 * @property {Number}           heightPercent   - Height in percentage of parent height
 * @property {ccui.Widget}       widgetParent    - <@readonly> The direct parent when it's a widget also, otherwise equals null
 * @property {Boolean}          enabled         - Indicate whether the widget is enabled
 * @property {Boolean}          focused         - Indicate whether the widget is focused
 * @property {ccui.Widget.SIZE_ABSOLUTE|ccui.Widget.SIZE_PERCENT}     sizeType        - The size type of the widget
 * @property {ccui.Widget.TYPE_WIDGET|ccui.Widget.TYPE_CONTAINER}   widgetType      - <@readonly> The type of the widget
 * @property {Boolean}          touchEnabled    - Indicate whether touch events are enabled
 * @property {Boolean}          updateEnabled   - Indicate whether the update function is scheduled
 * @property {Boolean}          bright          - Indicate whether the widget is bright
 * @property {String}           name            - The name of the widget
 * @property {Number}           actionTag       - The action tag of the widget
 */
ccui.Widget = ccui.Node.extend(/** @lends ccui.Widget# */{
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
    positionType: null,
    _positionPercent: null,
    _reorderWidgetChildDirty: false,
    _hitted: false,
    _nodes: null,
    _touchListener : null,
    _color:null,
    _className:"Widget",
    _flippedX: false,
    _flippedY: false,
    ctor: function () {
        cc.Node.prototype.ctor.call(this);
        this._enabled = true;
        this._bright = true;
        this._touchEnabled = false;
        this._touchPassedEnabled = false;
        this._focus = false;
        this._brightStyle = ccui.Widget.BRIGHT_STYLE_NONE;
        this._updateEnabled = false;
        this._touchStartPos = cc.p(0,0);
        this._touchMovePos = cc.p(0,0);
        this._touchEndPos = cc.p(0,0);
        this._touchEventListener = null;
        this._touchEventSelector = null;
        this._name = "default";
        this._widgetType = ccui.Widget.TYPE_WIDGET;
        this._actionTag = 0;
        this._size = cc.size(0, 0);
        this._customSize = cc.size(0, 0);
        this._layoutParameterDictionary = {};
        this._ignoreSize = false;
        this._widgetChildren = [];
        this._affectByClipping = false;
        this._sizeType = ccui.Widget.SIZE_ABSOLUTE;
        this._sizePercent = cc.p(0,0);
        this.positionType = ccui.Widget.POSITION_ABSOLUTE;
        this._positionPercent = cc.p(0,0);
        this._reorderWidgetChildDirty = false;
        this._hitted = false;
        this._nodes = [];
        this._color = cc.color(255,255,255,255);
        this._touchListener = null;
        this._flippedX = false;
        this._flippedY = false;
    },

    /**
     * initializes state of widget.
     * @returns {boolean}
     */
    init: function () {
        if (cc.Node.prototype.init.call(this)){
            this._layoutParameterDictionary = {};
            this._widgetChildren = [];
            this.initRenderer();
            this.setBright(true);
            this.ignoreContentAdaptWithSize(true);
            this.setAnchorPoint(cc.p(0.5, 0.5));
        }
        return true;
    },

    onEnter: function () {
        this.updateSizeAndPosition();
        cc.Node.prototype.onEnter.call(this);
    },

    visit: function (ctx) {
        if (this._enabled) {
            cc.Node.prototype.visit.call(this,ctx);
        }
    },

    sortAllChildren: function () {
        this._reorderWidgetChildDirty = this._reorderChildDirty;
        cc.Node.prototype.sortAllChildren.call(this);
        if (this._reorderWidgetChildDirty) {
            var _children = this._widgetChildren;
            var i, j, length = _children.length, tempChild;

            // insertion sort
            for (i = 0; i < length; i++) {
                var tempItem = _children[i];
                j = i - 1;
                tempChild = _children[j];

                //continue moving element downwards while zOrder is smaller or when zOrder is the same but mutatedIndex is smaller
                while (j >= 0 && ( tempItem._localZOrder < tempChild._localZOrder ||
                    ( tempItem._localZOrder == tempChild._localZOrder && tempItem.arrivalOrder < tempChild.arrivalOrder ))) {
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
     * Adds a child to the container.
     * @param {ccui.Widget} widget
     * @param {Number} zOrder
     * @param {Number} tag
     */
    addChild: function (widget, zOrder, tag) {
        if(widget instanceof ccui.Widget){
            cc.Node.prototype.addChild.call(this, widget, zOrder, tag);
            this._widgetChildren.push(widget);
            return;
        }
        if(widget instanceof cc.Node){
            cc.log("Please use addNode to add a CCNode.");
            return;
        }
    },

    /**
     *
     * @param tag
     * @returns {ccui.Widget}
     */
    getChildByTag:function(tag){
        var __children = this._widgetChildren;
        if (__children != null) {
            for (var i = 0; i < __children.length; i++) {
                var node = __children[i];
                if (node && node._tag == tag)
                    return node;
            }
        }
        return null;
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
        return this._widgetChildren.length;
    },

    getWidgetParent: function () {
        var widget = this.getParent();
        if(widget instanceof ccui.Widget){
            return widget;
        }
        return null;
    },

    /**
     * remove  child
     * @param {ccui.Widget} widget
     * @param {Boolean} cleanup
     */
    removeChild: function (widget, cleanup) {
        if(!(widget instanceof ccui.Widget)){
            cc.log("child must a type of ccui.Widget");
            return;
        }
        cc.Node.prototype.removeChild.call(this, widget, cleanup);
        cc.arrayRemoveObject(this._widgetChildren, widget);
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
        for (var i = 0; i < this._widgetChildren.length; i++) {
            var widget = this._widgetChildren[i];
            cc.Node.prototype.removeChild.call(this, widget, cleanup);
        }
        this._widgetChildren.length = 0;
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
     * @returns {ccui.Widget}
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
        if (node instanceof ccui.Widget) {
            cc.log("Please use addChild to add a Widget.");
            return;
        }
        cc.Node.prototype.addChild.call(this, node, zOrder, tag);
        this._nodes.push(node);
    },

    /**
     * get node by tag
     * @param {Number} tag
     * @returns {cc.Node}
     */
    getNodeByTag: function (tag) {
        var _nodes = this._nodes;
        for (var i = 0; i < _nodes.length; i++) {
            var node = _nodes[i];
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
     * @param {Boolean} cleanup
     */
    removeNode: function (node, cleanup) {
        cc.Node.prototype.removeChild.call(this, node);
        cc.arrayRemoveObject(this._nodes, node);
    },

    /**
     *  remove node by tag
     * @param {Number} tag
     * @param {Boolean} cleanup
     */
    removeNodeByTag: function (tag, cleanup) {
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
            cc.Node.prototype.removeChild.call(this, node);
        }
        this._nodes.length = 0;
    },

    /**
     * Changes the size that is widget's size
     * @param {cc.Size} size
     */
    setSize: function (size) {
        var locW = this._customSize.width = size.width;
        var locH = this._customSize.height = size.height;
        if (this._ignoreSize) {
	        locW = this.width;
	        locH = this.height;
        }
	    this._size.width = locW;
	    this._size.height = locH;

        if(this._running){
            var  widgetParent = this.getWidgetParent();
            if(widgetParent){
                locW = widgetParent.width;
	            locH = widgetParent.height;
            }else{
	            locW = this._parent.width;
	            locH = this._parent.height;
            }
	        this._sizePercent.x = locW > 0 ? this._customSize.width / locW : 0;
	        this._sizePercent.y = locH > 0 ? this._customSize.height / locH : 0;
        }
        this.onSizeChanged();
    },
	_setWidth: function (w) {
		var locW = this._customSize.width = w;
		this._ignoreSize && (locW = this.width);
		this._size.width = locW;

		if(this._running){
			var  widgetParent = this.getWidgetParent();
			locW = widgetParent ? widgetParent.width : this._parent.width;
			this._sizePercent.x = locW > 0 ? this._customSize.width / locW : 0;
		}
		this.onSizeChanged();
	},
	_setHeight: function (h) {
		var locH = this._customSize.height = h;
		this._ignoreSize && (locH = this.height);
		this._size.height = locH;

		if(this._running){
			var  widgetParent = this.getWidgetParent();
			locH = widgetParent ? widgetParent.height : this._parent.height;
			this._sizePercent.y = locH > 0 ? this._customSize.height / locH : 0;
		}
		this.onSizeChanged();
	},

    /**
     * Changes the percent that is widget's percent size
     * @param {cc.Point} percent
     */
    setSizePercent: function (percent) {
        this._sizePercent.x = percent.x;
        this._sizePercent.y = percent.y;
        var width = this._customSize.width, height = this._customSize.height;
        if (this._running) {
            var widgetParent = this.getWidgetParent();
            if (widgetParent) {
                width = widgetParent.width * percent.x;
                height = widgetParent.height * percent.y;
            }
            else {
                width = this._parent.width * percent.x;
                height = this._parent.height * percent.y;
            }
        }
        if (!this._ignoreSize) {
	        this._size.width = width;
	        this._size.height = height;
        }
        this._customSize.width = width;
        this._customSize.height = height;
        this.onSizeChanged();
    },
	_setWidthPercent: function (percent) {
		this._sizePercent.x = percent;
		var width = this._customSize.width;
		if (this._running) {
			var widgetParent = this.getWidgetParent();
			width = (widgetParent ? widgetParent.width : this._parent.width) * percent;
		}
		this._ignoreSize || (this._size.width = width);
		this._customSize.width = width;
		this.onSizeChanged();
	},
	_setHeightPercent: function (percent) {
		this._sizePercent.y = percent;
		var height = this._customSize.height;
		if (this._running) {
			var widgetParent = this.getWidgetParent();
			height = (widgetParent ? widgetParent.height : this._parent.height) * percent;
		}
		this._ignoreSize || (this._size.height = height);
		this._customSize.height = height;
		this.onSizeChanged();
	},

    /**
     * update size and position
     */
    updateSizeAndPosition: function () {
        switch (this._sizeType) {
            case ccui.Widget.SIZE_ABSOLUTE:
                var locSize;
                if (this._ignoreSize) {
                    locSize = this.getContentSize();
                }
                else {
                    locSize = this._customSize;
                }
                this._size.width = locSize.width;
                this._size.height = locSize.height;

                var pSize, spx = 0, spy = 0;
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
            case ccui.Widget.SIZE_PERCENT:
                var widgetParent = this.getWidgetParent();
                var cSize = cc.size(0,0);
                if (widgetParent){
                    cSize.width = widgetParent.getSize().width * this._sizePercent.x;
                    cSize.height = widgetParent.getSize().height * this._sizePercent.y;
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
        switch (this.positionType) {
            case ccui.Widget.POSITION_ABSOLUTE:
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
            case ccui.Widget.POSITION_PERCENT:
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

    /**TEXTURE_RES_TYPE
     * Changes the size type of widget.
     * @param {ccui.Widget.SIZE_ABSOLUTE|ccui.Widget.SIZE_PERCENT} type
     */
    setSizeType: function (type) {
        this._sizeType = type;
    },

    /**
     * Gets the size type of widget.
     * @returns {ccui.Widget.SIZE_ABSOLUTE|ccui.Widget.SIZE_PERCENT}
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
     * Get custom size
     * @returns {cc.Size}
     */
    getCustomSize:function(){
        return this._customSize
    },

    /**
     * Returns size percent of widget
     * @returns {cc.Point}
     */
    getSizePercent: function () {
        return this._sizePercent;
    },
	_getWidthPercent: function () {
		return this._sizePercent.x;
	},
	_getHeightPercent: function () {
		return this._sizePercent.y;
	},

    /**
     *  Gets world position of widget.
     * @returns {cc.Point}
     */
    getWorldPosition: function () {
        return this.convertToWorldSpace(cc.p(0,0));
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
	_getWidth: function () {
		return this._size.width;
	},
	_getHeight: function () {
		return this._size.height;
	},

    /**
     * Sets whether the widget is touch enabled
     * @param enable
     */
    setTouchEnabled: function (enable) {
        if (this._touchEnabled === enable) {
            return;
        }
        this._touchEnabled = enable;
        if(this._touchEnabled){
            this._touchListener = cc.EventListener.create({
                event: cc.EventListener.TOUCH_ONE_BY_ONE,
                swallowTouches: true,
                onTouchBegan: this.onTouchBegan.bind(this),
                onTouchMoved: this.onTouchMoved.bind(this),
                onTouchEnded: this.onTouchEnded.bind(this)
            });
            cc.eventManager.addListener(this._touchListener, this);
        }else{
            cc.eventManager.removeListener(this._touchListener);
        }
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
                this.setBrightStyle(ccui.Widget.BRIGHT_STYLE_HIGH_LIGHT);
            }
            else {
                this.setBrightStyle(ccui.Widget.BRIGHT_STYLE_NORMAL);
            }
        }
        else {
            this.onPressStateChangedToDisabled();
        }
    },

    setBright: function (bright, containChild) {
        this._bright = bright;
        if (this._bright) {
            this._brightStyle = ccui.Widget.BRIGHT_STYLE_NONE;
            this.setBrightStyle(ccui.Widget.BRIGHT_STYLE_NORMAL);
        }
        else {
            this.onPressStateChangedToDisabled();
        }
    },

    /**
     * To set the bright style of widget.
     * @param {ccui.Widget.BRIGHT_STYLE_NONE|ccui.Widget.BRIGHT_STYLE_NORMAL|ccui.Widget.BRIGHT_STYLE_HIGH_LIGHT} style
     */
    setBrightStyle: function (style) {
        if (this._brightStyle == style) {
            return;
        }
        style = style|| ccui.Widget.BRIGHT_STYLE_NORMAL;
        this._brightStyle = style;
        switch (this._brightStyle) {
            case ccui.Widget.BRIGHT_STYLE_NORMAL:
                this.onPressStateChangedToNormal();
                break;
            case ccui.Widget.BRIGHT_STYLE_HIGH_LIGHT:
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
                this._touchEventSelector.call(this._touchEventListener, this, ccui.Widget.TOUCH_BAGAN);
            }
        }
    },

    moveEvent: function () {
        if (this._touchEventListener && this._touchEventSelector) {
            if (this._touchEventSelector) {
                this._touchEventSelector.call(this._touchEventListener, this, ccui.Widget.TOUCH_MOVED);
            }
        }
    },

    releaseUpEvent: function () {
        if (this._touchEventListener && this._touchEventSelector) {
            if (this._touchEventSelector) {
                this._touchEventSelector.call(this._touchEventListener, this, ccui.Widget.TOUCH_ENDED);
            }
        }
    },

    cancelUpEvent: function () {
        if (this._touchEventSelector) {
            this._touchEventSelector.call(this._touchEventListener, this, ccui.Widget.TOUCH_CANCELED);
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
            if (parent instanceof ccui.Layout) {
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
     * @param {ccui.Widget} sender
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

        cc.Node.prototype.setPosition.apply(this, arguments);
    },

	setPositionX: function (x) {
		if (this._running) {
			var widgetParent = this.getWidgetParent();
			if (widgetParent) {
				var pw = widgetParent.width;
				if (pw <= 0)
					this._positionPercent.x = 0;
				else
					this._positionPercent.x = x / pw;
			}
		}

		cc.Node.prototype.setPositionX.call(this, x);
	},
	setPositionY: function (y) {
		if (this._running) {
			var widgetParent = this.getWidgetParent();
			if (widgetParent) {
				var ph = widgetParent.height;
				if (ph <= 0)
					this._positionPercent.y = 0;
				else
					this._positionPercent.y = y / ph;
			}
		}

		cc.Node.prototype.setPositionY.call(this, y);
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
                this.setPosition(parentSize.width * this._positionPercent.x, parentSize.height * this._positionPercent.y);
            }
        }
    },
	_setXPercent: function (percent) {
		this._positionPercent.x = percent;
		if (this._running) {
			var widgetParent = this.getWidgetParent();
			if(widgetParent){
				var absX = widgetParent.width * percent;
				this.setPositionX(absX);
			}
		}
	},
	_setYPercent: function (percent) {
		this._positionPercent.y = percent;
		if (this._running) {
			var widgetParent = this.getWidgetParent();
			if(widgetParent){
				var absY = widgetParent.height * percent;
				this.setPositionY(absY);
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
	_getXPercent: function () {
		return this._positionPercent.x;
	},
	_getYPercent: function () {
		return this._positionPercent.y;
	},

    /**
     * Changes the position type of the widget
     * @param {ccui.Widget.POSITION_ABSOLUTE|ccui.Widget.POSITION_PERCENT} type
     */
    setPositionType: function (type) {
        this.positionType = type;
    },

    /**
     * Gets the position type of the widget
     * @returns {cc.pPositionType}
     */
    getPositionType: function () {
        return this.positionType;
    },

    /**
     * Set flipped x
     * @param {Boolean} flipX
     */
    setFlippedX: function (flipX) {
        this._flippedX = flipX;
        this.updateFlippedX();
    },

    /**
     * Get flipped x
     * @returns {Boolean}
     */
    isFlippedX: function () {
        return this._flippedX;
    },

    /**
     * Set flipped y
     * @param {Boolean} flipY
     */
    setFlippedY: function (flipY) {
        this._flippedY = flipY;
        this.updateFlippedY();
    },

    /**
     * Get flipped y
     * @returns {Boolean}
     */
    isFlippedY: function () {
        return this._flippedY;
    },

    updateFlippedX:function(){

    },

    updateFlippedY:function(){

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
        return this.getPositionX() - this._getAnchorX() * this._size.width;
    },

    /**
     * Gets the bottom boundary position of this widget.
     * @returns {number}
     */
    getBottomInParent: function () {
        return this.getPositionY() - this._getAnchorY() * this._size.height;
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
     * @returns {ccui.Widget.TYPE_WIDGET|ccui.Widget.TYPE_CONTAINER}
     */
    getWidgetType: function () {
        return this._widgetType;
    },

    /**
     * Sets layout parameter
     * @param {ccui.LayoutParameter} parameter
     */
    setLayoutParameter: function (parameter) {
        this._layoutParameterDictionary[parameter.getLayoutType()] = parameter;
    },

    /**
     * Gets layout parameter
     * @param {ccui.LayoutParameter.NONE|ccui.LayoutParameter.LINEAR|ccui.LayoutParameter.RELATIVE} type
     * @returns {ccui.LayoutParameter}
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
        return ccui.Widget.create();
    },

    copyClonedWidgetChildren: function (model) {
        var widgetChildren = model.getChildren();
        for (var i = 0; i < widgetChildren.length; i++) {
            var locChild = widgetChildren[i];
            if(locChild instanceof ccui.Widget){
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
        this.setLocalZOrder(widget.getLocalZOrder());
        this.setUpdateEnabled(widget.isUpdateEnabled());
        this.setTag(widget.getTag());
        this.setName(widget.getName());
        this.setActionTag(widget.getActionTag());
        this._ignoreSize = widget._ignoreSize;
        this._size = cc.size(widget._size.width, widget._size.height);
        this._customSize = cc.size(widget._customSize.width, widget._customSize.height);
        this.copySpecialProperties(widget);
        this._sizeType = widget.getSizeType();
        this._sizePercent = cc.p(widget._sizePercent.x, widget._sizePercent.y);
        this.positionType = widget.positionType;
        this._positionPercent = cc.p(widget._positionPercent.x, widget._positionPercent.y);
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
        for (var key in widget._layoutParameterDictionary) {
            var parameter = widget._layoutParameterDictionary[key];
            if (parameter)
                this.setLayoutParameter(parameter.clone());
        }
        this.onSizeChanged();
    },
    
    /*temp action*/
    setActionTag: function (tag) {
        this._actionTag = tag;
    },

    getActionTag: function () {
        return this._actionTag;
    },
    /**
     * Set color
     * @param {cc.Color} color
     */
    setColor: function (color) {
        this._color.r = color.r;
        this._color.g = color.g;
        this._color.b = color.b;
        this.updateTextureColor();
        if (color.a !== undefined && !color.a_undefined) {
            this.setOpacity(color.a);
        }
    },

    /**
     * Get color
     * @returns {cc.Color}
     */
    getColor:function(){
        return cc.color(this._color.r,this._color.g,this._color.b,this._color.a) ;
    },

    /**
     * Set opacity
     * @param {Number} opacity
     */
    setOpacity: function (opacity) {
        this._color.a = opacity;
        this.updateTextureOpacity();
    },

    /**
     * Get opacity
     * @returns {Number}
     */
    getOpacity: function () {
        return this._color.a;
    },

    updateTextureColor: function () {

    },

    updateTextureOpacity: function () {

    },


    updateColorToRenderer: function (renderer) {
        if (renderer.RGBAProtocol) {
            renderer.setColor(this._color);
        }
    },

    updateOpacityToRenderer: function (renderer) {
        if (renderer.RGBAProtocol) {
            renderer.setOpacity(this._color.a);
        }
    }
});

window._p = ccui.Widget.prototype;

// Extended properties
/** @expose */
_p.xPercent;
cc.defineGetterSetter(_p, "xPercent", _p._getXPercent, _p._setXPercent);
/** @expose */
_p.yPercent;
cc.defineGetterSetter(_p, "yPercent", _p._getYPercent, _p._setYPercent);
/** @expose */
_p.widthPercent;
cc.defineGetterSetter(_p, "widthPercent", _p._getWidthPercent, _p._setWidthPercent);
/** @expose */
_p.heightPercent;
cc.defineGetterSetter(_p, "heightPercent", _p._getHeightPercent, _p._setHeightPercent);
/** @expose */
_p.widgetParent;
cc.defineGetterSetter(_p, "widgetParent", _p.getWidgetParent);
/** @expose */
_p.enabled;
cc.defineGetterSetter(_p, "enabled", _p.isEnabled, _p.setEnabled);
/** @expose */
_p.focused;
cc.defineGetterSetter(_p, "focused", _p.isFocused, _p.setFocused);
/** @expose */
_p.sizeType;
cc.defineGetterSetter(_p, "sizeType", _p.getSizeType, _p.setSizeType);
/** @expose */
_p.widgetType;
cc.defineGetterSetter(_p, "widgetType", _p.getWidgetType);
/** @expose */
_p.touchEnabled;
cc.defineGetterSetter(_p, "touchEnabled", _p.isTouchEnabled, _p.setTouchEnabled);
/** @expose */
_p.updateEnabled;
cc.defineGetterSetter(_p, "updateEnabled", _p.isUpdateEnabled, _p.setUpdateEnabled);
/** @expose */
_p.bright;
cc.defineGetterSetter(_p, "bright", _p.isBright, _p.setBright);
/** @expose */
_p.name;
cc.defineGetterSetter(_p, "name", _p.getName, _p.setName);
/** @expose */
_p.actionTag;
cc.defineGetterSetter(_p, "actionTag", _p.getActionTag, _p.setActionTag);

delete window._p;

/**
 * allocates and initializes a UIWidget.
 * @constructs
 * @return {ccui.Widget}
 * @example
 * // example
 * var uiWidget = ccui.Widget.create();
 */
ccui.Widget.create = function () {
    var widget = new ccui.Widget();
    if (widget && widget.init()) {
        return widget;
    }
    return null;
};


// Constants
//bright style
ccui.Widget.BRIGHT_STYLE_NONE = -1;
ccui.Widget.BRIGHT_STYLE_NORMAL = 0;
ccui.Widget.BRIGHT_STYLE_HIGH_LIGHT = 1;

//widget type
ccui.Widget.TYPE_WIDGET = 0;
ccui.Widget.TYPE_CONTAINER = 1;

//texture resource type
ccui.Widget.LOCAL_TEXTURE = 0;
ccui.Widget.PLIST_TEXTURE = 1;

//touch event type
ccui.Widget.TOUCH_BAGAN = 0;
ccui.Widget.TOUCH_MOVED = 1;
ccui.Widget.TOUCH_ENDED = 2;
ccui.Widget.TOUCH_CANCELED = 3;

//size type
ccui.Widget.SIZE_ABSOLUTE = 0;
ccui.Widget.SIZE_PERCENT = 1;

//position type
ccui.Widget.POSITION_ABSOLUTE = 0;
ccui.Widget.POSITION_PERCENT = 1;