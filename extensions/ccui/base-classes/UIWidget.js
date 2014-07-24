/****************************************************************************
 Copyright (c) 2011-2012 cocos2d-x.org
 Copyright (c) 2013-2014 Chukong Technologies Inc.

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
 * @extends ccui.ProtectedNode
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
ccui.Widget = ccui.ProtectedNode.extend(/** @lends ccui.Widget# */{
    _enabled: true,            ///< Highest control of widget
    _bright: true,             ///< is this widget bright
    _touchEnabled: false,       ///< is this widget touch endabled

    _brightStyle: null, ///< bright style
    _updateEnabled: false,      ///< is "update" method scheduled

    _touchBeganPosition: null,    ///< touch began point
    _touchMovePosition: null,     ///< touch moved point
    _touchEndPosition: null,      ///< touch ended point

    _touchEventListener: null,
    _touchEventSelector: null,

    _name: "default",
    _widgetType: null,
    _actionTag: 0,
    _size: cc.size(0,0),
    _customSize: null,
    _layoutParameterDictionary: null,
    _layoutParameterType:0,

    _focused: false,
    _focusEnabled: true,

    _ignoreSize: false,
    _affectByClipping: false,

    _sizeType: null,
    _sizePercent: null,
    positionType: null,
    _positionPercent: null,
    _reorderWidgetChildDirty: false,
    _hitted: false,                          //TODO typo
    _nodes: null,
    _touchListener: null,
    _color: null,
    _className: "Widget",
    _flippedX: false,
    _flippedY: false,
    _opacity: 255,
    _highlight: false,

    _touchEventCallback: null,

    ctor: function () {
        cc.ProtectedNode.prototype.ctor.call(this);
        this._brightStyle = ccui.Widget.BRIGHT_STYLE_NONE;
        this._touchBeganPosition = cc.p(0, 0);
        this._touchMovePosition = cc.p(0, 0);
        this._touchEndPosition = cc.p(0, 0);
        this._widgetType = ccui.Widget.TYPE_WIDGET;
        this._size = cc.size(0, 0);
        this._customSize = cc.size(0, 0);
        this._layoutParameterDictionary = {};
        this._sizeType = ccui.Widget.SIZE_ABSOLUTE;
        this._sizePercent = cc.p(0, 0);
        this.positionType = ccui.Widget.POSITION_ABSOLUTE;
        this._positionPercent = cc.p(0, 0);
        this._nodes = [];
        this._color = cc.color(255, 255, 255, 255);
        this._layoutParameterType = ccui.LayoutParameter.NONE;
        this.init();                        //TODO
    },

    /**
     * initializes state of widget.
     * @returns {boolean}
     */
    init: function () {
        if (cc.ProtectedNode.prototype.init.call(this)) {
            this._layoutParameterDictionary = {};
            this.initRenderer();
            this.setBright(true);

            this.onFocusChanged = this.onFocusChange.bind(this);
            this.onNextFocusedWidget = null;
            this.setAnchorPoint(cc.p(0.5, 0.5));

            this.ignoreContentAdaptWithSize(true);

//            this.setTouchEnabled(true);
            this.setCascadeColorEnabled(true);
            this.setCascadeOpacityEnabled(true);

            return true;
        }
        return false;
    },

    onEnter: function () {
        this.updateSizeAndPosition();
        cc.ProtectedNode.prototype.onEnter.call(this);
    },

    onExit: function(){
        this.unscheduleUpdate();
        cc.ProtectedNode.prototype.onExit.call(this);
    },

    visit: function (ctx) {
        if (this._visible) {
            this.adaptRenderers();
            cc.ProtectedNode.prototype.visit.call(this, ctx);
        }
    },

    getWidgetParent: function () {
        var widget = this.getParent();
        if (widget instanceof ccui.Widget) {
            return widget;
        }
        return null;
    },

    _updateContentSizeWithTextureSize: function(size){
        var locSize = this._size;
        if (this._ignoreSize) {
            locSize.width = size.width;
            locSize.height = size.height;
        } else {
            locSize.width = this._customSize.width;
            locSize.height = this._customSize.height;
        }
        this.onSizeChanged();
    },

    _isAncestorsEnabled: function(){
        var parentWidget = this._getAncensterWidget(this);
        if (parentWidget == null)
            return true;
        if (parentWidget && !parentWidget.isEnabled())
            return false;

        return parentWidget._isAncestorsEnabled();
    },

    _getAncensterWidget: function(node){
        if (null == node)
            return null;

        var parent = node.getParent();
        if (null == parent)
            return null;

        if (parent instanceof ccui.Widget)
            return parent;
        else
            return this._getAncensterWidget(parent.getParent());
    },

    _isAncestorsVisible: function(node){
        if (null == node)
            return true;

        var parent = node.getParent();

        if (parent && !parent.isVisible())
            return false;
        return this._isAncestorsVisible(parent);
    },

    _cleanupWidget: function(){
        //clean up _touchListener
        this._eventDispatcher.removeEventListener(this._touchListener);

        //cleanup focused widget and focus navigation controller
        if (this._focusedWidget == this){
            //delete
            this._focusedWidget = null;
        }
    },

    /**
     * <p>
     *     Sets whether the widget is enabled                                                                                    <br/>
     *     true if the widget is enabled, widget may be touched , false if the widget is disabled, widget cannot be touched.     <br/>
     *     The default value is true, a widget is default to enabled
     * </p>
     * @param {Boolean} enabled
     */
    setEnabled: function (enabled) {
        this._enabled = enabled;
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
     * @param {cc.Size} size  that is widget's size
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

        if (this._running) {
            var widgetParent = this.getWidgetParent();
            if (widgetParent) {
                locW = widgetParent.width;
                locH = widgetParent.height;
            } else {
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

        if (this._running) {
            var widgetParent = this.getWidgetParent();
            locW = widgetParent ? widgetParent.width : this._parent.width;
            this._sizePercent.x = locW > 0 ? this._customSize.width / locW : 0;
        }
        this.onSizeChanged();
    },
    _setHeight: function (h) {
        var locH = this._customSize.height = h;
        this._ignoreSize && (locH = this.height);
        this._size.height = locH;

        if (this._running) {
            var widgetParent = this.getWidgetParent();
            locH = widgetParent ? widgetParent.height : this._parent.height;
            this._sizePercent.y = locH > 0 ? this._customSize.height / locH : 0;
        }
        this.onSizeChanged();
    },

    /**
     * Changes the percent that is widget's percent size
     * @param {cc.Point} percent that is widget's percent size
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
     * @param {cc.Size} [parentSize] parent size
     */
    updateSizeAndPosition: function (parentSize) {
        if(!parentSize){
            var widgetParent = this.getWidgetParent();
            if(widgetParent)
                parentSize = widgetParent.getLayoutSize();
            else
                parentSize = this._parent.getContentSize();
        }

        var locSize;
        switch (this._sizeType) {
            case ccui.Widget.SIZE_ABSOLUTE:
                locSize = this._ignoreSize? this.getContentSize():this._customSize;
                this._size.width = locSize.width;
                this._size.height = locSize.height;

                var spx = 0, spy = 0;
                if (parentSize.width > 0) {
                    spx = this._customSize.width / parentSize.width;
                }
                if (parentSize.height > 0) {
                    spy = this._customSize.height / parentSize.height;
                }
                this._sizePercent.x = spx;
                this._sizePercent.y = spy;
                break;
            case ccui.Widget.SIZE_PERCENT:
                var cSize = cc.size(parentSize.width * this._sizePercent.x , parentSize.height * this._sizePercent.y);
                locSize = this._ignoreSize? this.getVirtualRendererSize(): cSize;
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
                if (parentSize.width <= 0 || parentSize.height <= 0) {
                    this._positionPercent.x = 0;
                    this._positionPercent.y = 0;
                } else {
                    this._positionPercent.x = absPos.x / parentSize.width;
                    this._positionPercent.y = absPos.y / parentSize.height;
                }
                break;
            case ccui.Widget.POSITION_PERCENT:
                absPos = cc.p(parentSize.width * this._positionPercent.x, parentSize.height * this._positionPercent.y);
                break;
            default:
                break;
        }
        this.setPosition(absPos);
    },

    /**TEXTURE_RES_TYPE
     * Changes the size type of widget.
     * @param {ccui.Widget.SIZE_ABSOLUTE|ccui.Widget.SIZE_PERCENT} type that is widget's size type
     */
    setSizeType: function (type) {
        this._sizeType = type;
    },

    /**
     * Gets the size type of widget.
     * @returns {ccui.Widget.SIZE_ABSOLUTE|ccui.Widget.SIZE_PERCENT} that is widget's size type
     */
    getSizeType: function () {
        return this._sizeType;
    },

    /**
     * Ignore the widget size
     * @param {Boolean} ignore true that widget will ignore it's size, use texture size, false otherwise. Default value is true.
     */
    ignoreContentAdaptWithSize: function (ignore) {
        if(this._ignoreSize == ignore)
            return;

        this._ignoreSize = ignore;
        var locSize = this._ignoreSize ? this.getContentSize(): this._customSize;
        this._size.width = locSize.width;
        this._size.height = locSize.height;
        this.onSizeChanged();
    },

    /**
     * Gets the widget if is ignore it's size.
     * @returns {boolean}  true that widget will ignore it's size, use texture size, false otherwise.
     */
    isIgnoreContentAdaptWithSize: function () {
        return this._ignoreSize;
    },

    /**
     * Returns size of widget
     * @returns {cc.Size}
     */
    getSize: function () {
        return cc.size(this._size);
    },

    /**
     * Get custom size of widget
     * @returns {cc.Size}
     */
    getCustomSize: function () {
        return cc.size(this._customSize);
    },

    getLayoutSize: function(){
        return cc.size(this._size);
    },

    /**
     * Returns size percent of widget
     * @returns {cc.Point}
     */
    getSizePercent: function () {
        return cc.p(this._sizePercent);
    },
    _getWidthPercent: function () {
        return this._sizePercent.x;
    },
    _getHeightPercent: function () {
        return this._sizePercent.y;
    },

    /**
     *  Gets world position of widget.
     * @returns {cc.Point} world position of widget.
     */
    getWorldPosition: function () {
        return this.convertToWorldSpace(cc.p(this._anchorPoint.x * this._contentSize.width, this._anchorPoint.y * this._contentSize.height));
    },

    /**
     * Gets the Virtual Renderer of widget.
     * @returns {ccui.Widget}
     */
    getVirtualRenderer: function () {
        return this;
    },

    /**
     * Gets the content size of widget.  Content size is widget's texture size.
     */
    getVirtualRendererSize:function(){
        return cc.size(this._contentSize);
    },

    /**
     * call back function called when size changed.
     */
    onSizeChanged: function () {
        var locChildren =  this.getChildren();
        for (var i = 0, len = locChildren.length; i < len; i++) {
            var child = locChildren[i];
            if(child instanceof ccui.Widget)
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
     * Sets whether the widget is touch enabled. The default value is false, a widget is default to touch disabled
     * @param {Boolean} enable  true if the widget is touch enabled, false if the widget is touch disabled.
     */
    setTouchEnabled: function (enable) {
        if (this._touchEnabled === enable)
            return;

        this._touchEnabled = enable;
        if (this._touchEnabled) {
            this._touchListener = cc.EventListener.create({
                event: cc.EventListener.TOUCH_ONE_BY_ONE,
                swallowTouches: true,
                onTouchBegan: this.onTouchBegan.bind(this),
                onTouchMoved: this.onTouchMoved.bind(this),
                onTouchEnded: this.onTouchEnded.bind(this)
            });
            cc.eventManager.addListener(this._touchListener, this);
        } else {
            cc.eventManager.removeListener(this._touchListener);
        }
    },

    /**
     * To set the bright style of widget.
     * @returns {boolean} true if the widget is touch enabled, false if the widget is touch disabled.
     */
    isTouchEnabled: function () {
        return this._touchEnabled;
    },

    /**
     * Determines if the widget is highlighted
     * @returns {boolean} true if the widget is highlighted, false if the widget is not highlighted .
     */
    isHighlighted: function(){
        return this._highlight;
    },

    /**
     * Sets whether the widget is highlighted. The default value is false, a widget is default to not highlighted
     * @param highlight true if the widget is highlighted, false if the widget is not highlighted.
     */
    setHighlighted:function(highlight){
        if (highlight == this._highlight)
            return;
        this._highlight = highlight;
        if (this._bright) {
            if (this._highlight)
                this.setBrightStyle(ccui.Widget.BRIGHT_STYLE_HIGH_LIGHT);
            else
                this.setBrightStyle(ccui.Widget.BRIGHT_STYLE_NORMAL);
        } else
            this.onPressStateChangedToDisabled();
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
     * @returns {boolean} whether the widget is focused or not
     */
    isFocused: function () {
        return this._focused;
    },

    /**
     * Sets whether the widget is on focused
     * The default value is false, a widget is default to not on focused
     * @param {boolean} focus  pass true to let the widget get focus or pass false to let the widget lose focus
     */
    setFocused: function (focus) {
        this._focused = focus;
        //make sure there is only one focusedWidget
        if (focus) {
            this._focusedWidget = this;
        }
    },

    /**
     * returns whether the widget could accept focus.
     * @returns {boolean} true represent the widget could accept focus, false represent the widget couldn't accept focus
     */
    isFocusEnabled: function(){
        return this._focusEnabled;
    },

    /**
     * sets whether the widget could accept focus.
     * @param {Boolean} enable true represent the widget could accept focus, false represent the widget couldn't accept focus
     */
    setFocusEnabled: function(enable){
        this._focused = enable;
    },

    /**
     * <p>
     *     When a widget is in a layout, you could call this method to get the next focused widget within a specified direction. <br/>
     *     If the widget is not in a layout, it will return itself
     * </p>
     * @param direction the direction to look for the next focused widget in a layout
     * @param current  the current focused widget
     * @return  the next focused widget in a layout
     */
    findNextFocusedWidget: function( direction, current){
        if (null == this.onNextFocusedWidget || null == this.onNextFocusedWidget(direction) ) {
            var isLayout = current instanceof ccui.Layout;
            if (this.isFocused() || isLayout) {
                var layout = this.getParent();
                if (null == layout){
                    //the outer layout's default behaviour is : loop focus
                    if (isLayout)
                        return current.findNextFocusedWidget(direction, current);
                    return current;
                } else {
                    return layout.findNextFocusedWidget(direction, current);
                }
            } else
                return current;
        } else {
            var getFocusWidget = this.onNextFocusedWidget(direction);
            this.dispatchFocusEvent(this, getFocusWidget);
            return getFocusWidget;
        }
    },

    /**
     * when a widget calls this method, it will get focus immediately.
     */
    requestFocus: function(){
        if (this == this._focusedWidget)
            return;
        this.dispatchFocusEvent(this._focusedWidget, this);
    },

    /**
     * no matter what widget object you call this method on , it will return you the exact one focused widget
     */
    getCurrentFocusedWidget: function(){
        return this._focusedWidget;
    },

    /**
     * call this method with parameter true to enable the Android Dpad focus navigation feature
     * @note it doesn't implemented on Web
     * @param {Boolean} enable set true to enable dpad focus navigation, otherwise disable dpad focus navigation
     */
    enableDpadNavigation: function(enable){
        //
        /*if (enable) {
            if (nullptr == _focusNavigationController)
            {
                _focusNavigationController = new FocusNavigationController;
                if (_focusedWidget) {
                    _focusNavigationController.setFirstFocsuedWidget(_focusedWidget);
                }
            }
        }
        else
        {
            CC_SAFE_DELETE(_focusNavigationController);
        }
        _focusNavigationController.enableFocusNavigation(enable);*/
    },

    /**
     * <p>
     *    When a widget lose/get focus, this method will be called. Be Caution when you provide your own version,       <br/>
     *    you must call widget.setFocused(true/false) to change the focus state of the current focused widget;
     * </p>
     */
    onFocusChanged: null,

    /**
     * use this function to manually specify the next focused widget regards to each direction
     */
    onNextFocusedWidget: null,

    /**
     * Sends the touch event to widget's parent
     * @param {Number}  eventType
     * @param {ccui.Widget} sender
     * @param {cc.Touch} touch
     */
    interceptTouchEvent: function(eventType, sender, touch){
        var widgetParent = this.getWidgetParent();
        if (widgetParent)
            widgetParent.interceptTouchEvent(eventType,sender,touch);
    },

    /**
     * This method is called when a focus change event happens
     * @param {ccui.Widget} widgetLostFocus
     * @param {ccui.Widget} widgetGetFocus
     */
    onFocusChange: function(widgetLostFocus, widgetGetFocus){
        //only change focus when there is indeed a get&lose happens
        if (widgetLostFocus)
            widgetLostFocus.setFocused(false);

        if (widgetGetFocus)
            widgetGetFocus.setFocused(true);
    },

    /**
     * Dispatch a EventFocus through a EventDispatcher
     * @param {ccui.Widget} widgetLostFocus
     * @param {ccui.Widget} widgetGetFocus
     */
    dispatchFocusEvent: function(widgetLostFocus, widgetGetFocus){
        //if the widgetLoseFocus doesn't get focus, it will use the previous focused widget instead
        if (widgetLostFocus && !widgetLostFocus.isFocused())
            widgetLostFocus = this._focusedWidget;

        if (widgetGetFocus != widgetLostFocus){
            if (widgetGetFocus && widgetGetFocus.onFocusChanged)
                widgetGetFocus.onFocusChanged(widgetLostFocus, widgetGetFocus);

            if (widgetLostFocus && widgetGetFocus.onFocusChanged)
                widgetLostFocus.onFocusChanged(widgetLostFocus, widgetGetFocus);

            cc.eventManager.dispatchEvent(new cc.EventFocus(widgetLostFocus, widgetGetFocus));
        }
    },

    /**
     *  Sets whether the widget is bright. The default value is true, a widget is default to bright
     * @param {Boolean} bright true if the widget is bright, false if the widget is dark.
     */
    setBright: function (bright) {
        this._bright = bright;
        if (this._bright) {
            this._brightStyle = ccui.Widget.BRIGHT_STYLE_NONE;
            this.setBrightStyle(ccui.Widget.BRIGHT_STYLE_NORMAL);
        } else {
            this.onPressStateChangedToDisabled();
        }
    },

    /**
     * To set the bright style of widget.
     * @param {Number} style BRIGHT_NORMAL the widget is normal state, BRIGHT_HIGHLIGHT the widget is height light state.
     */
    setBrightStyle: function (style) {
        if (this._brightStyle == style) {
            return;
        }
        style = style || ccui.Widget.BRIGHT_STYLE_NORMAL;
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

    onTouchBegan: function (touch, event) {
        this._hitted = false;
        if (this.isVisible() && this.isEnabled() && this._isAncestorsEnabled() && this._isAncestorsVisible(this) ){
            var touchPoint = touch.getLocation();
            this._touchBeganPosition.x = touchPoint.x;
            this._touchBeganPosition.y = touchPoint.y;
            if(this.hitTest(this._touchBeganPosition) && this.isClippingParentContainsPoint(this._touchBeganPosition))
                this._hitted = true;
        }
        if (!this._hitted) {
            return false;
        }
        this.setHighlighted(true);
        var widgetParent = this.getWidgetParent();
        if (widgetParent) {
            widgetParent.interceptTouchEvent(ccui.Widget.TOUCH_BAGAN, this, touch);
        }
        this.pushDownEvent();
        return true;
    },

    onTouchMoved: function (touch, event) {
        var touchPoint = touch.getLocation();
        this._touchMovePosition.x = touchPoint.x;
        this._touchMovePosition.y = touchPoint.y;
        this.setHighlighted(this.hitTest(touchPoint));
        var widgetParent = this.getWidgetParent();
        if (widgetParent)
            widgetParent.interceptTouchEvent(ccui.Widget.TOUCH_MOVED, this, touch);
        this.moveEvent();
    },

    onTouchEnded: function (touch, event) {
        var touchPoint = touch.getLocation();
        this._touchEndPosition.x = touchPoint.x;
        this._touchEndPosition.y = touchPoint.y;
        var widgetParent = this.getWidgetParent();
        if (widgetParent)
            widgetParent.interceptTouchEvent(ccui.Widget.TOUCH_ENDED, this, touch);
        var highlight = this._highlight;
        this.setHighlighted(false);
        if (highlight)
            this.releaseUpEvent();
        else
            this.cancelUpEvent();
    },

    /**
     * A call back function called when widget is selected, and on touch canceled.
     * @param {cc.Point} touchPoint
     */
    onTouchCancelled: function (touchPoint) {
        this.setHighlighted(false);
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
        if (this._touchEventCallback)
            this._touchEventCallback(this, ccui.Widget.TOUCH_BAGAN);

        if (this._touchEventListener && this._touchEventSelector) {
            this._touchEventSelector.call(this._touchEventListener, this, ccui.Widget.TOUCH_BEGAN);
        }
    },

    moveEvent: function () {
        if (this._touchEventCallback)
            this._touchEventCallback(this, ccui.Widget.TOUCH_MOVED);

        if (this._touchEventListener && this._touchEventSelector) {
            this._touchEventSelector.call(this._touchEventListener, this, ccui.Widget.TOUCH_MOVED);
        }
    },

    releaseUpEvent: function () {
        if (this._touchEventCallback)
            this._touchEventCallback(this, ccui.Widget.TOUCH_ENDED);

        if (this._touchEventListener && this._touchEventSelector) {
            this._touchEventSelector.call(this._touchEventListener, this, ccui.Widget.TOUCH_ENDED);
        }
    },

    cancelUpEvent: function () {
        if (this._touchEventCallback)
            this._touchEventCallback(this, ccui.Widget.TOUCH_CANCELED);

        if (this._touchEventListener && this._touchEventSelector) {
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
        if(target === undefined)
            this._touchEventCallback = selector;
        else {
            this._touchEventSelector = selector;
            this._touchEventListener = target;
        }
    },

    /**
     * Checks a point if is in widget's space
     * @param {cc.Point} pt
     * @returns {boolean} true if the point is in widget's space, false otherwise.
     */
    hitTest: function (pt) {
        //TODO need test
/*        var bb = cc.rect(-this._size.width * this._anchorPoint.x, -this._size.height * this._anchorPoint.y, this._size.width, this._size.height);
        return (nsp.x >= bb.x && nsp.x <= bb.x + bb.width && nsp.y >= bb.y && nsp.y <= bb.y + bb.height);*/
        var bb = cc.rect(0,0, this._contentSize.width, this._contentSize.height);
        return cc.rectContainsPoint(bb, this.convertToNodeSpace(pt));
    },

    isClippingParentContainsPoint: function(pt){
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

        if (!this._affectByClipping)
            return true;

        if (clippingParent) {
            if (clippingParent.hitTest(pt))
                return clippingParent.isClippingParentContainsPoint(pt);
            return false;
        }
        return true;
    },

    /**
     * Checks a point if in parent's area.
     * @deprecated
     * @param {cc.Point} pt
     * @returns {Boolean}
     */
    clippingParentAreaContainPoint: function (pt) {
        cc.log("clippingParentAreaContainPoint is deprecated. Please use isClippingParentContainsPoint instead.");
        this.isClippingParentContainsPoint(pt);
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
     * The original point (0,0) is at the left-bottom corner of screen.
     * @param {cc.Point||Number} pos
     * @param {Number} [posY]
     */
    setPosition: function (pos, posY) {
        if (this._running) {
            var widgetParent = this.getWidgetParent();
            if (widgetParent) {
                var pSize = widgetParent.getSize();
                if (pSize.width <= 0 || pSize.height <= 0) {
                    this._positionPercent.x = 0;
                    this._positionPercent.y = 0;
                } else {
                    if (posY) {
                        this._positionPercent.x = pos / pSize.width;
                        this._positionPercent.y = posY / pSize.height;
                    } else {
                        this._positionPercent.x = pos.x / pSize.width;
                        this._positionPercent.y = pos.y / pSize.height;
                    }
                }
            }
        }

        cc.Node.prototype.setPosition.call(this, pos, posY);
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
            if (widgetParent) {
                var parentSize = widgetParent.getSize();
                this.setPosition(parentSize.width * this._positionPercent.x, parentSize.height * this._positionPercent.y);
            }
        }
    },
    _setXPercent: function (percent) {
        this._positionPercent.x = percent;
        if (this._running) {
            var widgetParent = this.getWidgetParent();
            if (widgetParent)
                this.setPositionX(widgetParent.width * percent);
        }
    },
    _setYPercent: function (percent) {
        this._positionPercent.y = percent;
        if (this._running) {
            var widgetParent = this.getWidgetParent();
            if (widgetParent)
                this.setPositionY(widgetParent.height * percent);
        }
    },

    updateAnchorPoint: function () {
        this.setAnchorPoint(this.getAnchorPoint());
    },

    /**
     * Gets the percent (x,y) of the widget
     * @returns {cc.Point} The percent (x,y) of the widget in OpenGL coordinates
     */
    getPositionPercent: function () {
        return cc.p(this._positionPercent);
    },

    _getXPercent: function () {
        return this._positionPercent.x;
    },
    _getYPercent: function () {
        return this._positionPercent.y;
    },

    /**
     * Changes the position type of the widget
     * @param {Number} type  the position type of widget
     */
    setPositionType: function (type) {
        this.positionType = type;
    },

    /**
     * Gets the position type of the widget
     * @returns {Number} the position type of widget
     */
    getPositionType: function () {
        return this.positionType;
    },

    /**
     * Sets whether the widget should be flipped horizontally or not.
     * @param {Boolean} flipX true if the widget should be flipped horizontally, false otherwise.
     */
    setFlippedX: function (flipX) {
        this._flippedX = flipX;
        this.updateFlippedX();
    },

    /**
     * <p>
     *   Returns the flag which indicates whether the widget is flipped horizontally or not.             <br/>
     *   It only flips the texture of the widget, and not the texture of the widget's children.          <br/>
     *   Also, flipping the texture doesn't alter the anchorPoint.                                       <br/>
     *   If you want to flip the anchorPoint too, and/or to flip the children too use:                   <br/>
     *   widget.setScaleX(sprite.getScaleX() * -1);
     * </p>
     * @returns {Boolean} true if the widget is flipped horizontally, false otherwise.
     */
    isFlippedX: function () {
        return this._flippedX;
    },

    /**
     * Sets whether the widget should be flipped vertically or not.
     * @param {Boolean} flipY  true if the widget should be flipped vertically, false otherwise.
     */
    setFlippedY: function (flipY) {
        this._flippedY = flipY;
        this.updateFlippedY();
    },

    /**
     * <p>
     *     Return the flag which indicates whether the widget is flipped vertically or not.                <br/>
     *     It only flips the texture of the widget, and not the texture of the widget's children.          <br/>
     *     Also, flipping the texture doesn't alter the anchorPoint.                                       <br/>
     *     If you want to flip the anchorPoint too, and/or to flip the children too use:                   <br/>
     *     widget.setScaleY(widget.getScaleY() * -1);
     * </p>
     * @returns {Boolean} true if the widget is flipped vertically, false otherwise.
     */
    isFlippedY: function () {
        return this._flippedY;
    },

    updateFlippedX: function () {

    },

    updateFlippedY: function () {

    },

    adaptRenderers: function(){

    },

    /**
     * Determines if the widget is bright
     * @returns {boolean} true if the widget is bright, false if the widget is dark.
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
    getLeftBoundary: function () {
        return this.getPositionX() - this._getAnchorX() * this._size.width;
    },

    /**
     * Gets the bottom boundary position of this widget.
     * @returns {number}
     */
    getBottomBoundary: function () {
        return this.getPositionY() - this._getAnchorY() * this._size.height;
    },

    /**
     * Gets the right boundary position of this widget.
     * @returns {number}
     */
    getRightBoundary: function () {
        return this.getLeftBoundary() + this._size.width;
    },

    /**
     * Gets the top boundary position of this widget.
     * @returns {number}
     */
    getTopBoundary: function () {
        return this.getBottomBoundary() + this._size.height;
    },

    /**
     * Gets the touch began point of widget when widget is selected.
     * @returns {cc.Point} the touch began point.
     */
    getTouchStartPos: function () {
        cc.log("getTouchStartPos is deprecated. Please use getTouchBeganPosition instead.");
        return this.getTouchBeganPosition();
    },

    getTouchBeganPosition: function(){
         return cc.p(this._touchBeganPosition);
    },

    /**
     *Gets the touch move point of widget when widget is selected.
     * @returns {cc.Point} the touch move point.
     */
    getTouchMovePos: function () {
        cc.log("getTouchMovePos is deprecated. Please use getTouchMovePosition instead.");
        return this.getTouchMovePosition();
    },

    getTouchMovePosition: function(){
        return cc.p(this._touchMovePosition);
    },

    /**
     * Gets the touch end point of widget when widget is selected.
     * @returns {cc.Point} the touch end point.
     */
    getTouchEndPos: function () {
        cc.log("getTouchEndPos is deprecated. Please use getTouchEndPosition instead.");
        return this.getTouchEndPosition();
    },

    getTouchEndPosition:function(){
        return cc.p(this._touchEndPosition);
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
     * Gets LayoutParameter of widget.
     * @param {ccui.LayoutParameter} parameter
     */
    setLayoutParameter: function (parameter) {
        if(!parameter)
            return;
        this._layoutParameterDictionary[parameter.getLayoutType()] = parameter;
        this._layoutParameterType = parameter.getLayoutType();
    },

    /**
     * Gets layout parameter
     * @param {ccui.LayoutParameter.NONE|ccui.LayoutParameter.LINEAR|ccui.LayoutParameter.RELATIVE} type
     * @returns {ccui.LayoutParameter}
     */
    getLayoutParameter: function (type) {
        type = type || this._layoutParameterType;
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
            if (locChild instanceof ccui.Widget) {
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
        this.setLocalZOrder(widget.getLocalZOrder());
        this.setUpdateEnabled(widget.isUpdateEnabled());
        this.setTag(widget.getTag());
        this.setName(widget.getName());
        this.setActionTag(widget.getActionTag());

        this._ignoreSize.width = widget._ignoreSize.width;
        this._ignoreSize.height = widget._ignoreSize.height;
        this._size.width = widget._size.width;
        this._size.height = widget._size.height;
        this._customSize.width = widget._customSize.width;
        this._customSize.height = widget._customSize.height;

        this.copySpecialProperties(widget);
        this._sizeType = widget.getSizeType();
        this._sizePercent.x = widget._sizePercent.x;
        this._sizePercent.y = widget._sizePercent.y;

        this.positionType = widget.positionType;
        this._positionPercent.x = widget._positionPercent.x;
        this._positionPercent.y = widget._positionPercent.y;

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

        this._touchEventCallback = widget._touchEventCallback;
        this._touchEventListener = widget._touchEventListener;
        this._touchEventSelector = widget._touchEventSelector;
        this._focused = widget._focused;
        this._focusEnabled = widget._focusEnabled;

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
     * Get color
     * @returns {cc.Color}
     */
    getColor: function () {
        return cc.color(this._color.r, this._color.g, this._color.b, this._color.a);
    },

    /**
     * Set opacity
     * @param {Number} opacity
     */
    setOpacity: function (opacity) {
        if(opacity === this._color.a) return;
        this._color.a = opacity;
        this.updateTextureOpacity(opacity);
    },

    /**
     * Get opacity
     * @returns {Number}
     */
    getOpacity: function () {
        //return this._color.a;   //TODO
        return this._displayedOpacity;
    },

    updateTextureOpacity: function (opacity) {
        for(var p in this._children){
            var item = this._children[p];
            if(item)
                item.setOpacity(opacity);
        }
    },


    updateColorToRenderer: function (renderer) {
        renderer.setColor(this._color);
    },

    updateOpacityToRenderer: function (renderer) {
        renderer.setOpacity(this._color.a);
    },

    updateRGBAToRenderer: function(renderer){
        renderer.setColor(this._color);
        renderer.setOpacity(this._opacity);
    }
});

var _p = ccui.Widget.prototype;

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
/** @expose */
_p.opacity;
cc.defineGetterSetter(_p, "opacity", _p.getOpacity, _p.setOpacity);

_p = null;

/**
 * allocates and initializes a UIWidget.
 * @constructs
 * @return {ccui.Widget}
 * @example
 * // example
 * var uiWidget = ccui.Widget.create();
 */
ccui.Widget.create = function () {
    return new ccui.Widget();
};


// Constants
//bright style
ccui.Widget.BRIGHT_STYLE_NONE = -1;
ccui.Widget.BRIGHT_STYLE_NORMAL = 0;
ccui.Widget.BRIGHT_STYLE_HIGH_LIGHT = 1;

//widget type
ccui.Widget.TYPE_WIDGET = 0;
ccui.Widget.TYPE_CONTAINER = 1;

//Focus Direction
ccui.Widget.LEFT = 0;
ccui.Widget.RIGHT = 1;
ccui.Widget.UP = 0;
ccui.Widget.DOWN = 1;

//texture resource type
ccui.Widget.LOCAL_TEXTURE = 0;
ccui.Widget.PLIST_TEXTURE = 1;

//touch event type            //TODO why don't use a common define ?
ccui.Widget.TOUCH_BEGAN = 0;
ccui.Widget.TOUCH_MOVED = 1;
ccui.Widget.TOUCH_ENDED = 2;
ccui.Widget.TOUCH_CANCELED = 3;

//size type
ccui.Widget.SIZE_ABSOLUTE = 0;
ccui.Widget.SIZE_PERCENT = 1;

//position type
ccui.Widget.POSITION_ABSOLUTE = 0;
ccui.Widget.POSITION_PERCENT = 1;

cc.EventFocus = cc.Event.extend({
    _widgetGetFocus: null,
    _widgetLoseFocus: null,
    ctor: function(widgetLoseFocus, widgetGetFocus){
        this._widgetGetFocus = widgetGetFocus;
        this._widgetLoseFocus = widgetLoseFocus;
    }
});