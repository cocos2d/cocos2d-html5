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
 * Base class for ccui.LayoutParameter
 * @class
 * @extends ccui.Class
 */
ccui.LayoutParameter = ccui.Class.extend(/** @lends ccui.LayoutParameter# */{
    _margin: null,
    _layoutParameterType: null,
    ctor: function () {
        this._margin = new ccui.Margin();
        this._layoutParameterType = ccui.LayoutParameter.NONE;
    },

    /**
     * Sets Margin parameter for LayoutParameter.
     * @param {ccui.Margin} margin
     */
    setMargin: function (margin) {
        this._margin.left = margin.left;
        this._margin.top = margin.top;
        this._margin.right = margin.right;
        this._margin.bottom = margin.bottom;
    },

    /**
     * Gets Margin parameter of LayoutParameter.
     * @returns {ccui.Margin}
     */
    getMargin: function () {
        return this._margin;
    },

    /**
     * Gets LayoutParameterType of LayoutParameter.
     * @returns {ccui.UILayoutParameterType}
     */
    getLayoutType: function () {
        return this._layoutParameterType;
    },

    clone:function(){
        var parameter = this.createCloneInstance();
        parameter.copyProperties(this);
        return parameter;
    },

    /**
     * create clone instance.
     * @returns {ccui.LayoutParameter}
     */
    createCloneInstance:function(){
        return ccui.LayoutParameter.create();
    },

    /**
     * copy properties
     * @param {ccui.LayoutParameter} model
     */
    copyProperties:function(model){
        this._margin.left = model._margin.left;
        this._margin.top = model._margin.top;
        this._margin.right = model._margin.right;
        this._margin.bottom = model._margin.bottom;
    }
});

/**
 * allocates and initializes a LayoutParameter.
 * @constructs
 * @return {ccui.LayoutParameter}
 * @example
 * // example
 * var uiLayoutParameter = ccui.LayoutParameter.create();
 */
ccui.LayoutParameter.create = function () {
    var parameter = new ccui.LayoutParameter();
    return parameter;
};

/**
 * Base class for ccui.LinearLayoutParameter
 * @class
 * @extends ccui.LayoutParameter
 */
ccui.LinearLayoutParameter = ccui.LayoutParameter.extend(/** @lends ccui.LinearLayoutParameter# */{
    _linearGravity: null,
    ctor: function () {
        ccui.LayoutParameter.prototype.ctor.call(this);
        this._linearGravity = ccui.LINEAR_GRAVITY_NONE;
        this._layoutParameterType = ccui.LayoutParameter.LINEAR;
    },

    /**
     * Sets LinearGravity parameter for LayoutParameter.
     * @param {ccui.LINEAR_GRAVITY_NONE|ccui.LINEAR_GRAVITY_TOP|ccui.LINEAR_GRAVITY_RIGHT|ccui.LINEAR_GRAVITY_BOTTOM|ccui.LINEAR_GRAVITY_CENTER_VERTICAL|ccui.LINEAR_GRAVITY_CENTER_HORIZONTAL} gravity
     */
    setGravity: function (gravity) {
        this._linearGravity = gravity;
    },

    /**
     * Gets LinearGravity parameter for LayoutParameter.
     * @returns {ccui.LINEAR_GRAVITY_NONE|ccui.LINEAR_GRAVITY_TOP|ccui.LINEAR_GRAVITY_RIGHT|ccui.LINEAR_GRAVITY_BOTTOM|ccui.LINEAR_GRAVITY_CENTER_VERTICAL|ccui.LINEAR_GRAVITY_CENTER_HORIZONTAL}
     */
    getGravity: function () {
        return this._linearGravity;
    },

    /**
     * create clone instance.
     * @returns {ccui.LinearLayoutParameter}
     */
    createCloneInstance: function () {
        return ccui.LinearLayoutParameter.create();
    },

    /**
     * copy properties
     * @param {ccui.LinearLayoutParameter} model
     */
    copyProperties: function (model) {
        ccui.LayoutParameter.prototype.copyProperties.call(this, model);
        this.setGravity(model._linearGravity);
    }
});

/**
 * allocates and initializes a LinearLayoutParameter.
 * @constructs
 * @return {ccui.LinearLayoutParameter}
 * @example
 * // example
 * var uiLinearLayoutParameter = ccui.LinearLayoutParameter.create();
 */
ccui.LinearLayoutParameter.create = function () {
    var parameter = new ccui.LinearLayoutParameter();
    return parameter;
};

/**
 * Base class for ccui.RelativeLayoutParameter
 * @class
 * @extends ccui.LayoutParameter
 */
ccui.RelativeLayoutParameter = ccui.LayoutParameter.extend(/** @lends ccui.RelativeLayoutParameter# */{
    _relativeAlign: null,
    _relativeWidgetName: "",
    _relativeLayoutName: "",
    _put:false,
    ctor: function () {
        ccui.LayoutParameter.prototype.ctor.call(this);
        this._relativeAlign = ccui.RELATIVE_ALIGN_NONE;
        this._relativeWidgetName = "";
        this._relativeLayoutName = "";
        this._put = false;
        this._layoutParameterType = ccui.LayoutParameter.RELATIVE;
    },

    /**
     * Sets RelativeAlign parameter for LayoutParameter.
     * @param {ccui.RELATIVE_ALIGN_*} align
     */
    setAlign: function (align) {
        this._relativeAlign = align;
    },

    /**
     * Gets RelativeAlign parameter for LayoutParameter.
     * @returns {ccui.RELATIVE_ALIGN_*}
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
    },

    /**
     * create clone instance.
     * @returns {ccui.RelativeLayoutParameter}
     */
    createCloneInstance:function(){
        return ccui.LinearLayoutParameter.create();
    },

    /**
     * copy properties
     * @param {ccui.RelativeLayoutParameter} model
     */
    copyProperties:function(model){
        ccui.LayoutParameter.prototype.copyProperties.call(this, model);
        this.setAlign(model._relativeAlign);
        this.setRelativeToWidgetName(model._relativeWidgetName);
        this.setRelativeName(model._relativeLayoutName);
    }
});

/**
 * allocates and initializes a RelativeLayoutParameter.
 * @constructs
 * @return {ccui.RelativeLayoutParameter}
 * @example
 * // example
 * var uiRelativeLayoutParameter = ccui.RelativeLayoutParameter.create();
 */
ccui.RelativeLayoutParameter.create = function () {
    var parameter = new ccui.RelativeLayoutParameter();
    return parameter;
};


// Constants
//layout parameter type
ccui.LayoutParameter.NONE = 0;
ccui.LayoutParameter.LINEAR = 1;
ccui.LayoutParameter.RELATIVE = 2;