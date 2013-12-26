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
ccs.LayoutParameter = ccs.Class.extend(/** @lends ccs.LayoutParameter# */{
    _margin: null,
    _layoutParameterType: null,
    ctor: function () {
        this._margin = new ccs.Margin();
        this._layoutParameterType = ccs.LayoutParameterType.none;
    },

    /**
     * Sets Margin parameter for LayoutParameter.
     * @param {ccs.Margin} margin
     */
    setMargin: function (margin) {
        this._margin = margin;
    },

    /**
     * Gets Margin parameter of LayoutParameter.
     * @returns {ccs.Margin}
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
 * allocates and initializes a LayoutParameter.
 * @constructs
 * @return {ccs.LayoutParameter}
 * @example
 * // example
 * var uiLayoutParameter = ccs.LayoutParameter.create();
 */
ccs.LayoutParameter.create = function () {
    var parameter = new ccs.LayoutParameter();
    return parameter;
};

/**
 * Base class for ccs.LinearLayoutParameter
 * @class
 * @extends ccs.LayoutParameter
 */
ccs.LinearLayoutParameter = ccs.LayoutParameter.extend(/** @lends ccs.LinearLayoutParameter# */{
    _linearGravity: null,
    ctor: function () {
        ccs.LayoutParameter.prototype.ctor.call(this);
        this._linearGravity = ccs.LinearGravity.none;
        this._layoutParameterType = ccs.LayoutParameterType.linear;
    },

    /**
     * Sets LinearGravity parameter for LayoutParameter.
     * @param {ccs.LinearGravity} gravity
     */
    setGravity: function (gravity) {
        this._linearGravity = gravity;
    },

    /**
     * Gets LinearGravity parameter for LayoutParameter.
     * @returns {ccs.LinearGravity}
     */
    getGravity: function () {
        return this._linearGravity;
    }
});

/**
 * allocates and initializes a LinearLayoutParameter.
 * @constructs
 * @return {ccs.LinearLayoutParameter}
 * @example
 * // example
 * var uiLinearLayoutParameter = ccs.LinearLayoutParameter.create();
 */
ccs.LinearLayoutParameter.create = function () {
    var parameter = new ccs.LinearLayoutParameter();
    return parameter;
};

/**
 * Base class for ccs.RelativeLayoutParameter
 * @class
 * @extends ccs.LayoutParameter
 */
ccs.RelativeLayoutParameter = ccs.LayoutParameter.extend(/** @lends ccs.RelativeLayoutParameter# */{
    _relativeAlign: null,
    _relativeWidgetName: "",
    _relativeLayoutName: "",
    _put:false,
    ctor: function () {
        ccs.LayoutParameter.prototype.ctor.call(this);
        this._relativeAlign = ccs.RelativeAlign.alignNone;
        this._relativeWidgetName = "";
        this._relativeLayoutName = "";
        this._put = false;
        this._layoutParameterType = ccs.LayoutParameterType.relative;
    },

    /**
     * Sets RelativeAlign parameter for LayoutParameter.
     * @param {ccs.RelativeAlign} align
     */
    setAlign: function (align) {
        this._relativeAlign = align;
    },

    /**
     * Gets RelativeAlign parameter for LayoutParameter.
     * @returns {ccs.RelativeAlign}
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
 * allocates and initializes a RelativeLayoutParameter.
 * @constructs
 * @return {ccs.RelativeLayoutParameter}
 * @example
 * // example
 * var uiRelativeLayoutParameter = ccs.RelativeLayoutParameter.create();
 */
ccs.RelativeLayoutParameter.create = function () {
    var parameter = new ccs.RelativeLayoutParameter();
    return parameter;
};