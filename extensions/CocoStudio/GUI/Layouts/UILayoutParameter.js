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
 * layout parameter type
 * @type {Object}
 */
ccs.LayoutParameterType = {
    none: 0,
    linear: 1,
    relative: 2
};

/**
 * Base class for ccs.LayoutParameter
 * @class
 * @extends ccs.Class
 */
ccs.UILayoutParameter = ccs.Class.extend(/** @lends ccs.UILayoutParameter# */{
    _margin: null,
    _layoutParameterType: null,
    ctor: function () {
        this._margin = new ccs.UIMargin();
        this._layoutParameterType = ccs.LayoutParameterType.none;
    },

    /**
     * Sets Margin parameter for LayoutParameter.
     * @param {ccs.UIMargin} margin
     */
    setMargin: function (margin) {
        this._margin = margin;
    },

    /**
     * Gets Margin parameter of LayoutParameter.
     * @returns {ccs.UIMargin}
     */
    getMargin: function () {
        return this._margin;
    },

    /**
     * Gets LayoutParameterType of LayoutParameter.
     * @returns {ccs.UILayoutParameterType}
     */
    getLayoutType: function () {
        return this._layoutParameterType;
    }
});

/**
 * allocates and initializes a UILayoutParameter.
 * @constructs
 * @return {ccs.UILayoutParameter}
 * @example
 * // example
 * var uiLayoutParameter = ccs.UILayoutParameter.create();
 */
ccs.UILayoutParameter.create = function () {
    var parameter = new ccs.UILayoutParameter();
    return parameter;
};

/**
 * Base class for ccs.UILinearLayoutParameter
 * @class
 * @extends ccs.UILayoutParameter
 */
ccs.UILinearLayoutParameter = ccs.UILayoutParameter.extend(/** @lends ccs.UILinearLayoutParameter# */{
    _linearGravity: null,
    ctor: function () {
        ccs.UILayoutParameter.prototype.ctor.call(this);
        this._linearGravity = ccs.UILinearGravity.none;
        this._layoutParameterType = ccs.LayoutParameterType.linear;
    },

    /**
     * Sets UILinearGravity parameter for LayoutParameter.
     * @param {ccs.UILinearGravity} gravity
     */
    setGravity: function (gravity) {
        this._linearGravity = gravity;
    },

    /**
     * Gets UILinearGravity parameter for LayoutParameter.
     * @returns {ccs.UILinearGravity}
     */
    getGravity: function () {
        return this._linearGravity;
    }
});

/**
 * allocates and initializes a UILinearLayoutParameter.
 * @constructs
 * @return {ccs.UILinearLayoutParameter}
 * @example
 * // example
 * var uiLinearLayoutParameter = ccs.UILinearLayoutParameter.create();
 */
ccs.UILinearLayoutParameter.create = function () {
    var parameter = new ccs.UILinearLayoutParameter();
    return parameter;
};

/**
 * Base class for ccs.UIRelativeLayoutParameter
 * @class
 * @extends ccs.UILayoutParameter
 */
ccs.UIRelativeLayoutParameter = ccs.UILayoutParameter.extend(/** @lends ccs.UIRelativeLayoutParameter# */{
    _relativeAlign: null,
    _relativeWidgetName: "",
    _relativeLayoutName: "",
    _put:false,
    ctor: function () {
        ccs.UILayoutParameter.prototype.ctor.call(this);
        this._relativeAlign = ccs.UIRelativeAlign.alignNone;
        this._relativeWidgetName = "";
        this._relativeLayoutName = "";
        this._put = false;
        this._layoutParameterType = ccs.LayoutParameterType.relative;
    },

    /**
     * Sets UIRelativeAlign parameter for LayoutParameter.
     * @param {ccs.UIRelativeAlign} align
     */
    setAlign: function (align) {
        this._relativeAlign = align;
    },

    /**
     * Gets UIRelativeAlign parameter for LayoutParameter.
     * @returns {ccs.UIRelativeAlign}
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

/**
 * allocates and initializes a UIRelativeLayoutParameter.
 * @constructs
 * @return {ccs.UIRelativeLayoutParameter}
 * @example
 * // example
 * var uiRelativeLayoutParameter = ccs.UIRelativeLayoutParameter.create();
 */
ccs.UIRelativeLayoutParameter.create = function () {
    var parameter = new ccs.UIRelativeLayoutParameter();
    return parameter;
};