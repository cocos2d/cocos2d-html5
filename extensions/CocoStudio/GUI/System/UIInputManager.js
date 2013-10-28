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
 * Base class for cc.UIHelper
 * @class
 * @extends cc.Class
 */
cc.UIInputManager = cc.Class.extend({
    _manageredWidget: null,
    _selectedWidgets: null,
    _touchBeganedPoint: null,
    _touchMovedPoint: null,
    _touchEndedPoint: null,
    _touchCanceledPoint: null,
    _widgetBeSorted: false,
    _touchDown: false,
    _longClickTime: 0,
    _longClickRecordTime: 0,
    _checkedDoubleClickWidget: null,
    _rootWidget: null,
    ctor: function () {
        this._manageredWidget = null;
        this._selectedWidgets = [];
        this._touchBeganedPoint = cc.p(0, 0);
        this._touchMovedPoint = cc.p(0, 0);
        this._touchEndedPoint = cc.p(0, 0);
        this._touchCanceledPoint = cc.p(0, 0);
        this._widgetBeSorted = false;
        this._touchDown = false;
        this._longClickTime = 0;
        this._longClickRecordTime = 0;
        this._checkedDoubleClickWidget = [];
        this._rootWidget = null;
    },

    /**
     * Regist a widget to input manager.
     * @param {cc.UIWidget} widget
     */
    registWidget: function (widget) {
        if (!widget) {
            return;
        }
        if (cc.ArrayContainsObject(this._manageredWidget, widget)) {
            return;
        }
        this._manageredWidget.push(widget);
    },

    /**
     * A call back function called when widget tree struct has changed.
     * If widget tree struct has changed, uiinputmanager will resort registed widgets.
     */
    uiSceneHasChanged: function () {
        this._widgetBeSorted = false;
    },

    /**
     * Check touch event
     * @param {cc.UIWidget} root
     * @param {cc.Point} touchPoint
     * @returns {boolean}
     */
    checkTouchEvent: function (root, touchPoint) {
        var arrayRootChildren = root.getChildren();
        var length = arrayRootChildren.length;
        for (var i = length - 1; i >= 0; i--) {
            var widget = arrayRootChildren[i];
            if (this.checkTouchEvent(widget, touchPoint)) {
                return true;
            }
        }
        if (root.isEnabled() && root.isTouchEnabled() && root.hitTest(touchPoint) && root.clippingParentAreaContainPoint(touchPoint)) {
            this._selectedWidgets.push(root);
            root.onTouchBegan(touchPoint);
            return true;
        }
        return false;
    },

    /**
     * Remove a registed widget from input manager.
     * @param {cc.UIWidget} widget
     */
    removeManageredWidget: function (widget) {
        if (!widget) {
            return;
        }
        if (!cc.ArrayContainsObject(this._manageredWidget, widget)) {
            return;
        }
        cc.ArrayRemoveObject(this._manageredWidget, widget);
    },

    /**
     * Finds a widget which is selected and call it's "onTouchBegan" method.
     * @param {cc.Point} touchPoint
     * @returns {boolean}
     */
    checkEventWidget: function (touchPoint) {
        this.checkTouchEvent(this._rootWidget, touchPoint);
        return (this._selectedWidgets.length > 0);
    },

    /**
     * Add doubleClick widget
     * @param {UIWidget} widget
     */
    addCheckedDoubleClickWidget: function (widget) {
        if (cc.ArrayContainsObject(this._checkedDoubleClickWidget, widget)) {
            return;
        }
        this._checkedDoubleClickWidget.push(widget);
    },

    update: function (dt) {
        if (this._touchDown) {
            this._longClickRecordTime += dt;
            if (this._longClickRecordTime >= this._longClickTime) {
                this._longClickRecordTime = 0;
                this._touchDown = false;
            }
        }
        var arrayWidget = this._checkedDoubleClickWidget;
        for (var i = 0; i < arrayWidget.length; i++) {
            var widget = arrayWidget[i];
            if (!widget.isVisible()) {
                continue;
            }
        }
    },

    onTouchBegan: function (touch) {
        this._touchBeganedPoint.x = touch.getLocation().x;
        this._touchBeganedPoint.y = touch.getLocation().y;
        this._touchDown = true;
        return this.checkEventWidget(this._touchBeganedPoint);
    },

    onTouchMoved: function (touch) {
        this._touchMovedPoint.x = touch.getLocation().x;
        this._touchMovedPoint.y = touch.getLocation().y;
        var selectedWidgetArray = this._selectedWidgets;
        for (var i = 0; i < selectedWidgetArray.length; ++i) {
            var hitWidget = selectedWidgetArray[i];
            hitWidget.onTouchMoved(this._touchMovedPoint);
        }
        if (this._touchDown) {
            this._longClickRecordTime = 0;
            this._touchDown = false;
        }
    },

    onTouchEnded: function (touch) {
        this._touchDown = false;
        this._touchEndedPoint.x = touch.getLocation().x;
        this._touchEndedPoint.y = touch.getLocation().y;
        var selectedWidgetArray = this._selectedWidgets;
        for (var i = 0; i < selectedWidgetArray.length; ++i) {
            var hitWidget = selectedWidgetArray[i];
            hitWidget.onTouchEnded(this._touchEndedPoint);
        }
        this._selectedWidgets = [];
    },

    onTouchCancelled: function (touch) {
        this._touchDown = false;
        this._touchEndedPoint.x = touch.getLocation().x;
        this._touchEndedPoint.y = touch.getLocation().y;
        var selectedWidgetArray = this._selectedWidgets;
        for (var i = 0; i < selectedWidgetArray.length; ++i) {
            var hitWidget = selectedWidgetArray[i];
            hitWidget.onTouchCancelled(this._touchEndedPoint);
        }
        this._selectedWidgets = [];
    },

    setRootWidget: function (root) {
        this._rootWidget = root;
    },

    getRootWidget: function () {
        return this._rootWidget;
    }
});