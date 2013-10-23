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

/**
 * Base class for cc.LayoutParameter
 * @class
 * @extends cc.Class
 */
cc.LayoutParameter = cc.Class.extend({
    _margin: null,
    _layoutParameterType: null,
    ctor: function () {
        this._margin = new cc.UIMargin();
        this._layoutParameterType = cc.LayoutParameterType.NONE;
    },

    /**
     * Sets Margin parameter for LayoutParameter.
     * @param {cc.UIMargin} margin
     */
    setMargin: function (margin) {
        this._margin = margin;
    },

    /**
     * Gets Margin parameter of LayoutParameter.
     * @returns {cc.UIMargin}
     */
    getMargin: function () {
        return this._margin;
    },

    /**
     * Gets LayoutParameterType of LayoutParameter.
     * @returns {cc.LayoutParameterType}
     */
    getLayoutType: function () {
        return this._layoutParameterType;
    }
});


cc.LayoutParameter.create = function () {
    var parameter = new cc.LayoutParameter();
    return parameter;
};

/**
 * Base class for cc.LinearLayoutParameter
 * @class
 * @extends cc.LayoutParameter
 */
cc.LinearLayoutParameter = cc.LayoutParameter.extend({
    _linearGravity: null,
    ctor: function () {
        cc.LayoutParameter.prototype.ctor.call(this);
        this._linearGravity = cc.UILinearGravity.NONE;
        this._layoutParameterType = cc.LayoutParameterType.LINEAR;
    },

    /**
     * Sets UILinearGravity parameter for LayoutParameter.
     * @param {cc.UILinearGravity} gravity
     */
    setGravity: function (gravity) {
        this._linearGravity = gravity;
    },

    /**
     * Gets UILinearGravity parameter for LayoutParameter.
     * @returns {cc.UILinearGravity}
     */
    getGravity: function () {
        return this._linearGravity;
    }
});

cc.LinearLayoutParameter.create = function () {
    var parameter = new cc.LinearLayoutParameter();
    return parameter;
};

/**
 * Base class for cc.RelativeLayoutParameter
 * @class
 * @extends cc.LayoutParameter
 */
cc.RelativeLayoutParameter = cc.LayoutParameter.extend({
    _relativeAlign: null,
    _relativeWidgetName: "",
    _relativeLayoutName: "",
    _put:false,
    ctor: function () {
        cc.LayoutParameter.prototype.ctor.call(this);
        this._relativeAlign = cc.UIRelativeAlign.ALIGN_NONE;
        this._relativeWidgetName = "";
        this._relativeLayoutName = "";
        this._put = false;
    },

    /**
     * Sets UIRelativeAlign parameter for LayoutParameter.
     * @param {cc.UIRelativeAlign} align
     */
    setAlign: function (align) {
        this._relativeAlign = align;
    },

    /**
     * Gets UIRelativeAlign parameter for LayoutParameter.
     * @returns {cc.UIRelativeAlign}
     */
    getAlign: function () {
        return this._relativeAlign;
    },

    /**
     * Sets a key for LayoutParameter. Witch widget named this is relative to.
     * @param {String} name
     */
    setRelativeToWidgetName: function (name) {
        this._relativeWidgetName = name;
    },

    /**
     * Gets the key of LayoutParameter. Witch widget named this is relative to.
     * @returns {string}
     */
    getRelativeToWidgetName: function () {
        return this._relativeWidgetName;
    },

    /**
     * Sets a name in Relative Layout for LayoutParameter.
     * @param {String} name
     */
    setRelativeName: function (name) {
        this._relativeLayoutName = name;
    },

    /**
     * Gets a name in Relative Layout of LayoutParameter.
     * @returns {string}
     */
    getRelativeName: function () {
        return this._relativeLayoutName;
    }
});

cc.RelativeLayoutParameter.create = function () {
    var parameter = new cc.RelativeLayoutParameter();
    return parameter;
};