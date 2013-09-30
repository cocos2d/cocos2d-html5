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

cc.LayoutParameterType = {
    NONE: 0,
    LINEAR: 1,
    RELATIVE: 2
};


cc.LayoutParameter = cc.Class.extend({
    _margin: null,
    _layoutParameterType: null,
    ctor: function () {
        this._margin = new cc.UIMargin();
        this._layoutParameterType = cc.LayoutParameterType.NONE;
    },
    setMargin: function (margin) {
        this._margin = margin;
    },

    getMargin: function () {
        return this._margin;
    },

    getLayoutType: function () {
        return this._layoutParameterType;
    }
});


cc.LayoutParameter.create = function () {
    var parameter = new cc.LayoutParameter();
    return parameter;
};

cc.LinearLayoutParameter = cc.LayoutParameter.extend({
    _linearGravity: null,
    ctor: function () {
        cc.LayoutParameter.prototype.ctor.call(this);
        this._linearGravity = cc.UILinearGravity.NONE;
        this._layoutParameterType = cc.LayoutParameterType.LINEAR;
    },
    setGravity: function (gravity) {
        this._linearGravity = gravity;
    },

    getGravity: function () {
        return this._linearGravity;
    }
});

cc.LinearLayoutParameter.create = function () {
    var parameter = new cc.LinearLayoutParameter();
    return parameter;
};

cc.RelativeLayoutParameter = cc.LayoutParameter.extend({
    _relativeAlign: null,
    _relativeWidgetName: "",
    _relativeLayoutName: "",
    ctor: function () {
        cc.LayoutParameter.prototype.ctor.call(this);
        this._relativeAlign = cc.UIRelativeAlign.NONE;
        this._relativeWidgetName = "";
        this._relativeLayoutName = "";
    },
    setAlign: function (align) {
        this._relativeAlign = align;
    },

    getAlign: function () {
        return this._relativeAlign;
    },

    setRelativeToWidgetName: function (name) {
        this._relativeWidgetName = name;
    },

    getRelativeToWidgetName: function () {
        return this._relativeWidgetName;
    },

    setRelativeName: function (name) {
        this._relativeLayoutName = name;
    },

    getRelativeName: function () {
        return this._relativeLayoutName;
    }
});

cc.RelativeLayoutParameter.create = function () {
    var parameter = new cc.RelativeLayoutParameter();
    return parameter;
};