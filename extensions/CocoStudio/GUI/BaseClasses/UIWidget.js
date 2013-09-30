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
    _layoutParameter: null,
    _ignoreSize: false,
    _children: [],
    _affectByClipping: false,

    _scheduler: null,

    _sizeType: null,
    _sizePercent: null,
    _positionType: null,
    _positionPercent: null,
    _isRunning: false,

    /*Compatible*/
    _pushListener: null,
    _pushSelector: null,
    _moveListener: null,
    _moveSelector: null,
    _releaseListener: null,
    _releaseSelector: null,
    _cancelListener: null,
    _cancelSelector: null,
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
        this._layoutParameter = null;
        this._ignoreSize = false;
        this._children = [];
        this._affectByClipping = false;

        this._scheduler = null;

        this._sizeType = cc.SizeType.ABSOLUTE;
        this._sizePercent = cc.PointZero();
        this._positionType = cc.PositionType.ABSOLUTE;
        this._positionPercent = cc.PointZero();
        this._isRunning = false;

        /*Compatible*/
        this._pushListener = null;
        this._pushSelector = null;
        this._moveListener = null;
        this._moveSelector = null;
        this._releaseListener = null;
        this._releaseSelector = null;
        this._cancelListener = null;
        this._cancelSelector = null;
    },

    init: function () {
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
        this._children.release();
        this._renderer.removeAllChildrenWithCleanup(true);
        this._renderer.removeFromParentAndCleanup(true);
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
                        this._children.addObject(child);
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
    removeFromParent: function () {
        if (this._widgetParent) {
            this._widgetParent.removeChild(this);
        }
    },

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

    getChildByName: function (name) {
        return cc.UIHelper.getInstance().seekWidgetByName(this, name);
    },

    getChildByTag: function (tag) {
        return cc.UIHelper.getInstance().seekWidgetByTag(this, tag);
    },

    getChildren: function () {
        return this._children;
    },

    initRenderer: function () {
        this._renderer = cc.GUIRenderer.create();
    },
    setSize: function (size) {
        this._customSize = size;
        if (this._ignoreSize) {
            this._size = this.getContentSize();
        }
        else {
            this._size = size;
        }
        if (this._isRunning) {
            this._sizePercent = (this._widgetParent == null) ? cc.PointZero() : cc.p(this._customSize.width / this._widgetParent.getSize().width, this._customSize.height / this._widgetParent.getSize().height);
        }
        this.onSizeChanged();
    },

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
            this._size = size;
        }
        this._customSize = size;
        this.onSizeChanged();
    },

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
            {
                var cSize = (this._widgetParent == null) ? cc.SizeZero() : cc.size(this._widgetParent.getSize().width * this._sizePercent.x, this._widgetParent.getSize().height * this._sizePercent.y);
                if (this._ignoreSize) {
                    this._size = this.getContentSize();
                }
                else {
                    this._size = cSize;
                }
                this._customSize = cSize;
            }
                break;
            default:
                break;
        }
        this.onSizeChanged();
        var absPos = this.getPosition();
        switch (this._positionType) {
            case cc.PositionType.ABSOLUTE:
                this._positionPercent = (this._widgetParent == NULL) ? CCPointZero : ccp(absPos.x / this._widgetParent.getSize().width, absPos.y / this._widgetParent.getSize().height);
                break;
            case cc.PositionType.PERCENT:
            {
                var parentSize = this._widgetParent.getSize();
                absPos = cc.p(parentSize.width * this._positionPercent.x, parentSize.height * this._positionPercent.y);
            }
                break;
            default:
                break;
        }
        this._renderer.setPosition(absPos);
    },

    setSizeType: function (type) {
        this._sizeType = type;
    },

    getSizeType: function () {
        return this._sizeType;
    },

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

    isIgnoreContentAdaptWithSize: function () {
        return this._ignoreSize;
    },

    getSize: function () {
        return this._size;
    },

    getSizePercent: function () {
        return this._sizePercent;
    },

    getWorldPosition: function () {
        return this._renderer.convertToWorldSpace(cc.PointZero());
    },

    convertToWorldSpace: function (pt) {
        return this._renderer.convertToWorldSpace(pt);
    },

    getVirtualRenderer: function () {
        return this._renderer;
    },

    onSizeChanged: function () {

    },

    getContentSize: function () {
        return this._size;
    },

    setZOrder: function (z) {
        this._widgetZOrder = z;
        this._renderer.setZOrder(z);
        if (this._widgetParent) {
            this._widgetParent.reorderChild(this);
        }
    },

    getZOrder: function () {
        return this._widgetZOrder;
    },

    setTouchEnabled: function (enable) {
        this._touchEnabled = enable;
    },

    isTouchEnabled: function () {
        return this._touchEnabled;
    },

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

    isUpdateEnabled: function () {
        return this._updateEnabled;
    },

    isFocused: function () {
        return this._focus;
    },

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

    setBright: function (bright) {
        this._bright = bright;
        if (this._bright) {
            this._brightStyle = cc.BrightStyle.NONE;
            this.setBrightStyle(cc.BrightStyle.NORMAL);
        }
        else {
            this.onPressStateChangedToDisabled();
        }
    },
    setBrightStyle: function (style) {
        if (this._brightStyle == style) {
            return;
        }
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

    onPressStateChangedToNormal: function () {

    },

    onPressStateChangedToPressed: function () {

    },

    onPressStateChangedToDisabled: function () {

    },

    didNotSelectSelf: function () {

    },

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

    onTouchMoved: function (touchPoint) {
        this._touchMovePos.x = touchPoint.x;
        this._touchMovePos.y = touchPoint.y;
        this.setFocused(this.hitTest(touchPoint));
        if (this._widgetParent) {
            this._widgetParent.checkChildInfo(1, this, touchPoint);
        }
        this.moveEvent();
    },

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

    onTouchCancelled: function (touchPoint) {
        this.setFocused(false);
        this.cancelUpEvent();
    },

    onTouchLongClicked: function (touchPoint) {
        this.longClickEvent();
    },

    pushDownEvent: function () {
        /*compatible*/
        if (this._pushListener && this._pushSelector) {
            if (this._pushSelector) {
                this._pushSelector.call(this._pushListener, this);
            }
        }
        /************/

        if (this._touchEventListener && this._touchEventSelector) {
            if (this._touchEventSelector) {
                this._touchEventSelector.call(this._touchEventListener, this, cc.TouchEventType.BEGAN);
            }
        }
    },

    moveEvent: function () {
        /*compatible*/
        if (this._moveListener && this._moveSelector) {
            if (this._moveSelector) {
                this._moveSelector.call(this._moveListener, this);
            }
        }
        /************/

        if (this._touchEventListener && this._touchEventSelector) {
            if (this._touchEventSelector) {
                this._touchEventSelector.call(this._touchEventListener, this, cc.TouchEventType.MOVED);
            }
        }
    },

    releaseUpEvent: function () {
        /*compatible*/
        if (this._releaseListener && this._releaseSelector) {
            if (this._releaseSelector) {
                this._releaseSelector.call(this._releaseListener, this);
            }
        }
        /************/

        if (this._touchEventListener && this._touchEventSelector) {
            if (this._touchEventSelector) {
                this._touchEventSelector.call(this._touchEventListener, this, cc.TouchEventType.ENDED);
            }
        }
    },

    cancelUpEvent: function () {
        /*compatible*/
        if (this._cancelListener && this._cancelSelector) {
            if (this._cancelSelector) {
                this._cancelSelector.call(this._cancelListener, this);
            }
        }
        /************/
        if (this._touchEventSelector) {
            this._touchEventSelector.call(this._touchEventListener, this, cc.TouchEventType.CANCELED);
        }
    },

    longClickEvent: function () {

    },

    addTouchEventListener: function (target, selector) {
        this._touchEventListener = target;
        this._touchEventSelector = selector;
    },

    getRenderer: function () {
        return this._renderer;
    },

    addRenderer: function (renderer, zOrder) {
        this._renderer.addChild(renderer, zOrder);
    },

    removeRenderer: function (renderer, cleanup) {
        this._renderer.removeChild(renderer, cleanup);
    },

    hitTest: function (pt) {
        var nsp = this._renderer.convertToNodeSpace(pt);
        var bb = cc.rect(-this._size.width * this._anchorPoint.x, -this._size.height * this._anchorPoint.y, this._size.width, this._size.height);
        if (nsp.x >= bb.x && nsp.x <= bb.x + bb.width && nsp.y >= bb.y && nsp.y <= bb.y + bb.height) {
            return true;
        }
        return false;
    },

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

    checkChildInfo: function (handleState, sender, touchPoint) {
        if (this._widgetParent) {
            this._widgetParent.checkChildInfo(handleState, sender, touchPoint);
        }
    },

    setPosition: function (pos) {
        if (this._isRunning) {
            this._positionPercent = (this._widgetParent == null) ? cc.PointZero() : cc.p(pos.x / this._widgetParent.getSize().width, pos.y / this._widgetParent.getSize().height);
        }
        this._renderer.setPosition(pos);
    },

    setPositionPercent: function (percent) {
        this._positionPercent = percent;
        if (this._isRunning) {
            var parentSize = this._widgetParent.getSize();
            var absPos = cc.p(parentSize.width * this._positionPercent.x, parentSize.height * this._positionPercent.y);
            this._renderer.setPosition(absPos);
        }
    },

    setAnchorPoint: function (pt) {
        this._anchorPoint = pt;
        this._renderer.setAnchorPoint(pt);
    },

    updateAnchorPoint: function () {
        this.setAnchorPoint(this._anchorPoint);
    },

    getPosition: function () {
        return this._renderer.getPosition();
    },

    getPositionPercent: function () {
        return this._positionPercent;
    },

    setPositionType: function (type) {
        this._positionType = type;
    },

    getPositionType: function () {
        return this._positionType;
    },

    getAnchorPoint: function () {
        return this._anchorPoint;
    },

    setScale: function (scale) {
        this._renderer.setScale(scale);
    },

    getScale: function () {
        return this._renderer.getScale();
    },

    setScaleX: function (scaleX) {
        this._renderer.setScaleX(scaleX);
    },

    getScaleX: function () {
        return this._renderer.getScaleX();
    },
    setScaleY: function (scaleY) {
        this._renderer.setScaleY(scaleY);
    },

    getScaleY: function () {
        return this._renderer.getScaleY();
    },

    setRotation: function (rotation) {
        this._renderer.setRotation(rotation);
    },

    getRotation: function () {
        return this._renderer.getRotation();
    },

    setRotationX: function (rotationX) {
        this._renderer.setRotationX(rotationX);
    },

    getRotationX: function () {
        return this._renderer.getRotationX();
    },

    setRotationY: function (rotationY) {
        this._renderer.setRotationY(rotationY);
    },

    getRotationY: function () {
        return this._renderer.getRotationY();
    },

    setVisible: function (visible) {
        this._visible = visible;
        this._renderer.setVisible(visible);
    },

    isVisible: function () {
        return this._visible;
    },

    isBright: function () {
        return this._bright;
    },

    isEnabled: function () {
        return this._enabled;
    },

    getLeftInParent: function () {
        var leftPos = 0.0;
        switch (this._widgetType) {
            case cc.WidgetType.Widget:
                leftPos = this.getPosition().x - this.getAnchorPoint().x * this._size.width;
                break;
            case cc.WidgetType.Container:
                leftPos = this.getPosition().x;
                break;
            default:
                break;
        }
        return leftPos;
    },

    getBottomInParent: function () {
        var bottomPos = 0.0;
        switch (this._widgetType) {
            case cc.WidgetType.Widget:
                bottomPos = this.getPosition().y - this.getAnchorPoint().y * this._size.height;
                break;
            case cc.WidgetType.Container:
                bottomPos = this.getPosition().y;
                break;
            default:
                break;
        }
        return bottomPos;
    },

    getRightInParent: function () {
        return this.getLeftInParent() + this._size.width;
    },

    getTopInParent: function () {
        return this.getBottomInParent() + this._size.height;
    },

    getParent: function () {
        return this._widgetParent;
    },

    setParent: function (parent) {
        this._widgetParent = parent;
    },

    runAction: function (action) {
        return this._renderer.runAction(action);
    },

    setActionManager: function (actionManager) {
        this._renderer.setActionManager(actionManager);
    },

    getActionManager: function () {
        return this._renderer.getActionManager();
    },

    stopAllActions: function () {
        this._renderer.stopAllActions();
    },

    stopAction: function (action) {
        this._renderer.stopAction(action);
    },

    stopActionByTag: function (tag) {
        this._renderer.stopActionByTag(tag);
    },

    getActionByTag: function (tag) {
        return this._renderer.getActionByTag(tag);
    },

    setColor: function (color) {
        if (this._renderer.RGBAProtocol) {
            this._renderer.setColor(color);
        }
    },

    getColor: function () {
        if (this._renderer.RGBAProtocol) {
            return this._renderer.getColor();
        }
        return cc.WHITE;
    },

    setOpacity: function (opacity) {
        if (this._renderer.RGBAProtocol) {
            this._renderer.setOpacity(opacity);
        }
    },

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
        this._layoutParameter = parameter;
    },

    getLayoutParameter: function () {
        return this._layoutParameter;
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