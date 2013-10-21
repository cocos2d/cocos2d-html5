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
 * Base class for cc.UILayer
 * @class
 * @extends cc.Layer
 */
cc.UILayer = cc.Layer.extend({
    _rootWidget: null,
    _inputManager: null,
    init: function () {
        if (cc.Layer.prototype.init.call(this)) {
            this._rootWidget = cc.UIRootWidget.create();
            this._rootWidget.onEnter();
            this.addChild(this._rootWidget.getRenderer());
            this._inputManager = new cc.UIInputManager();
            this._inputManager.setRootWidget(this._rootWidget);
            return true;
        }
        return false;
    },

    onEnter: function () {
        this.setTouchMode(cc.TOUCH_ONE_BY_ONE);
        this.setTouchEnabled(true);
        cc.Layer.prototype.onEnter.call(this);

    },

    onExit: function () {
        this.setTouchEnabled(false);
        cc.Layer.prototype.onExit.call(this);
    },

    onEnterTransitionDidFinish: function () {
        cc.Layer.prototype.onEnterTransitionDidFinish.call(this);
    },

    addWidget: function (widget) {
        this._rootWidget.addChild(widget);
    },

    removeWidget: function (widget) {
        this._rootWidget.removeChild(widget);
    },

    setVisible: function (visible) {
        cc.Layer.prototype.setVisible.call(this,visible);
        this._rootWidget.setVisible(visible);
    },

    getWidgetByTag: function (tag) {
        if (!this._rootWidget) {
            return null;
        }
        return cc.UIHelper.getInstance().seekWidgetByTag(this._rootWidget, tag);
    },

    getWidgetByName: function (name) {
        if (!this._rootWidget) {
            return null;
        }
        return cc.UIHelper.getInstance().seekWidgetByName(this._rootWidget, name);
    },

    getRootWidget: function () {
        return this._rootWidget;
    },

    getInputManager: function () {
        return this._inputManager;
    },

    clear: function () {
        this._rootWidget.removeAllChildren();
    },

    onTouchBegan: function (touch, event) {
        if (this._inputManager && this._inputManager.onTouchBegan(touch)) {
            return true;
        }
        return false;
    },

    onTouchMoved: function (touch, event) {
        this._inputManager.onTouchMoved(touch);
    },

    onTouchEnded: function (touch, event) {
        this._inputManager.onTouchEnded(touch);
    },

    onTouchCancelled: function (touch, event) {
        this._inputManager.onTouchCancelled(touch);
    },

    dispose: function () {
        this.removeFromParent(true);
    },

    removeWidgetAndCleanUp: function (widget, cleanup) {
        this.removeWidget(widget);
    }
});
cc.UILayer.create = function () {
    var uiLayer = new cc.UILayer();
    if (uiLayer && uiLayer.init()) {
        return uiLayer;
    }
    return null;
};