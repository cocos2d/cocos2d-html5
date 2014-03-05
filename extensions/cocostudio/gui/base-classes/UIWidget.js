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
 * this.addChild(uiWidget);
 * @class
 * @extends ccs.NodeRGBA
 *
 * @property {Number}           xPercent        - Position x in percentage of width
 * @property {Number}           yPercent        - Position y in percentage of height
 * @property {Number}           widthPercent    - Width in percentage of parent width
 * @property {Number}           heightPercent   - Height in percentage of parent height
 * @property {ccs.Widget}       widgetParent    - <@readonly> The direct parent when it's a widget also, otherwise equals null
 * @property {Boolean}          enabled         - Indicate whether the widget is enabled
 * @property {Boolean}          focused         - Indicate whether the widget is focused
 * @property {ccs.SizeType}     sizeType        - The size type of the widget
 * @property {ccs.WidgetType}   widgetType      - <@readonly> The type of the widget
 * @property {Boolean}          touchEnabled    - Indicate whether touch events are enabled
 * @property {Boolean}          updateEnabled   - Indicate whether the update function is scheduled
 * @property {Boolean}          bright          - Indicate whether the widget is bright
 * @property {String}           name            - The name of the widget
 * @property {Number}           actionTag       - The action tag of the widget
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
    positionType: null,
    _positionPercent: null,
    _reorderWidgetChildDirty: false,
    _hitted: false,
    _nodes: null,
    _touchListener : null,
    ctor: function () {
        cc.NodeRGBA.prototype.ctor.call(this);
        this._enabled = true;
        this._bright = true;
        this._touchEnabled = false;
        this._touchPassedEnabled = false;
        this._focus = false;
        this._brightStyle = ccs.BrightStyle.none;
        this._updateEnabled = false;
        this._touchStartPos = cc.p(0,0);
        this._touchMovePos = cc.p(0,0);
        this._touchEndPos = cc.p(0,0);
        this._touchEventListener = null;
        this._touchEventSelector = null;
        this._name = "default";
        this._widgetType = ccs.WidgetType.widget;
        this._actionTag = 0;
        this._size = cc.size(0, 0);
        this._customSize = cc.size(0, 0);
        this._layoutParameterDictionary = {};
        this._ignoreSize = false;
        this._widgetChildren = [];
        this._affectByClipping = false;
        this._sizeType = ccs.SizeType.absolute;
        this._sizePercent = cc.p(0,0);
        this.positionType = ccs.PositionType.absolute;
        this._positionPercent = cc.p(0,0);
        this._reorderWidgetChildDirty = false;
        this._hitted = false;
        this._nodes = [];
        this._touchListener = null;
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
     * @param {ccs.Widget} widget
     * @param {Number} zOrder
     * @param {Number} tag
     */
    addChild: function (widget, zOrder, tag) {
        if(widget instanceof ccs.Widget){
            cc.NodeRGBA.prototype.addChild.call(this, widget, zOrder, tag);
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
     * @returns {ccs.Widget}
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
        if(widget instanceof ccs.Widget){
            return widget;
        }
        return null;
    },

    /**
     * remove  child
     * @param {ccs.Widget} widget
     * @param {Boolean} cleanup
     */
    removeChild: function (widget, cleanup) {
        if(!(widget instanceof ccs.Widget)){
            cc.log("child must a type of ccs.Widget");
            return;
        }
        cc.NodeRGBA.prototype.removeChild.call(this, widget, cleanup);
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
            cc.NodeRGBA.prototype.removeChild.call(this, widget, cleanup);
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
            cc.log("Please use addChild to add a Widget.");
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
        cc.NodeRGBA.prototype.removeChild.call(this, node);
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
            cc.NodeRGBA.prototype.removeChild.call(this, node);
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
        this._sizePercent = percent;
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
        switch (this.positionType) {
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

        cc.NodeRGBA.prototype.setPosition.apply(this, arguments);
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

		cc.NodeRGBA.prototype.setPositionX.call(this, x);
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

		cc.NodeRGBA.prototype.setPositionY.call(this, y);
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
     * @param {ccs.PositionType} type
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
        this.setCascadeOpacityEnabled(widget.isCascadeOpacityEnabled());
        this.setCascadeColorEnabled(widget.isCascadeColorEnabled());
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
    }
});

window._proto = ccs.Widget.prototype;

// Extended properties
cc.defineGetterSetter(_proto, "xPercent", _proto._getXPercent, _proto._setXPercent);
cc.defineGetterSetter(_proto, "yPercent", _proto._getYPercent, _proto._setYPercent);
cc.defineGetterSetter(_proto, "widthPercent", _proto._getWidthPercent, _proto._setWidthPercent);
cc.defineGetterSetter(_proto, "heightPercent", _proto._getHeightPercent, _proto._setHeightPercent);
cc.defineGetterSetter(_proto, "widgetParent", _proto.getWidgetParent);
cc.defineGetterSetter(_proto, "enabled", _proto.isEnabled, _proto.setEnabled);
cc.defineGetterSetter(_proto, "focused", _proto.isFocused, _proto.setFocused);
cc.defineGetterSetter(_proto, "sizeType", _proto.getSizeType, _proto.setSizeType);
cc.defineGetterSetter(_proto, "widgetType", _proto.getWidgetType);
cc.defineGetterSetter(_proto, "touchEnabled", _proto.isTouchEnabled, _proto.setTouchEnabled);
cc.defineGetterSetter(_proto, "updateEnabled", _proto.isUpdateEnabled, _proto.setUpdateEnabled);
cc.defineGetterSetter(_proto, "bright", _proto.isBright, _proto.setBright);
cc.defineGetterSetter(_proto, "name", _proto.getName, _proto.setName);
cc.defineGetterSetter(_proto, "actionTag", _proto.getActionTag, _proto.setActionTag);

delete window._proto;

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
