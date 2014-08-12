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
 * Base class for ccui.Margin
 * @class
 * @extends ccui.Class
 */
ccui.Margin = ccui.Class.extend(/** @lends ccui.Margin# */{
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    ctor: function (margin, top, right, bottom) {
        if (margin && top === undefined) {
            this.left = margin.left;
            this.top = margin.top;
            this.right = margin.right;
            this.bottom = margin.bottom;
        }
        if (bottom !== undefined) {
            this.left = margin;
            this.top = top;
            this.right = right;
            this.bottom = bottom;
        }
    },
    /**
     *  set margin
     * @param {Number} l
     * @param {Number} t
     * @param {Number} r
     * @param {Number} b
     */
    setMargin: function (l, t, r, b) {
        this.left = l;
        this.top = t;
        this.right = r;
        this.bottom = b;
    },
    /**
     *  check is equals
     * @param {ccui.Margin} target
     * @returns {boolean}
     */
    equals: function (target) {
        return (this.left == target.left && this.top == target.top && this.right == target.right && this.bottom == target.bottom);
    }
});

ccui.MarginZero = function(){
    return new ccui.Margin(0,0,0,0);
};

/**
 * Layout parameter define
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
        if(typeof margin === 'object'){
            this._margin.left = margin.left;
            this._margin.top = margin.top;
            this._margin.right = margin.right;
            this._margin.bottom = margin.bottom;
        }else{
            this._margin.left = arguments[0];
            this._margin.top = arguments[1];
            this._margin.right = arguments[2];
            this._margin.bottom = arguments[3];
        }
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
        var parameter = this._createCloneInstance();
        parameter._copyProperties(this);
        return parameter;
    },

    /**
     * create clone instance.
     * @returns {ccui.LayoutParameter}
     */
    _createCloneInstance:function(){
        return ccui.LayoutParameter.create();
    },

    /**
     * copy properties
     * @param {ccui.LayoutParameter} model
     */
    _copyProperties:function(model){
        this._margin.bottom = model._margin.bottom;
        this._margin.left = model._margin.left;
        this._margin.right = model._margin.right;
        this._margin.top = model._margin.top;
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
    return new ccui.LayoutParameter();
};

// Constants
//layout parameter type
ccui.LayoutParameter.NONE = 0;
ccui.LayoutParameter.LINEAR = 1;
ccui.LayoutParameter.RELATIVE = 2;

/**
 * Base class for ccui.LinearLayoutParameter
 * @class
 * @extends ccui.LayoutParameter
 */
ccui.LinearLayoutParameter = ccui.LayoutParameter.extend(/** @lends ccui.LinearLayoutParameter# */{
    _linearGravity: null,
    ctor: function () {
        ccui.LayoutParameter.prototype.ctor.call(this);
        this._linearGravity = ccui.LinearLayoutParameter.NONE;
        this._layoutParameterType = ccui.LayoutParameter.LINEAR;
    },

    /**
     * Sets LinearGravity parameter for LayoutParameter.
     * @param {Number} gravity
     */
    setGravity: function (gravity) {
        this._linearGravity = gravity;
    },

    /**
     * Gets LinearGravity parameter for LayoutParameter.
     * @returns {Number}
     */
    getGravity: function () {
        return this._linearGravity;
    },

    /**
     * create clone instance.
     * @returns {ccui.LinearLayoutParameter}
     */
    _createCloneInstance: function () {
        return ccui.LinearLayoutParameter.create();
    },

    /**
     * copy properties
     * @param {ccui.LinearLayoutParameter} model
     */
    _copyProperties: function (model) {
        ccui.LayoutParameter.prototype._copyProperties.call(this, model);
        if (model instanceof ccui.LinearLayoutParameter)
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
    return new ccui.LinearLayoutParameter();
};

// Constants
//Linear layout parameter LinearGravity
ccui.LinearLayoutParameter.NONE = 0;
ccui.LinearLayoutParameter.LEFT = 1;
ccui.LinearLayoutParameter.TOP = 2;
ccui.LinearLayoutParameter.RIGHT = 3;
ccui.LinearLayoutParameter.BOTTOM = 4;
ccui.LinearLayoutParameter.CENTER_VERTICAL = 5;
ccui.LinearLayoutParameter.CENTER_HORIZONTAL = 6;

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
        this._relativeAlign = ccui.RelativeLayoutParameter.NONE;
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
    _createCloneInstance:function(){
        return ccui.RelativeLayoutParameter.create();
    },

    /**
     * copy properties
     * @param {ccui.RelativeLayoutParameter} model
     */
    _copyProperties:function(model){
        ccui.LayoutParameter.prototype._copyProperties.call(this, model);
        if (model instanceof ccui.RelativeLayoutParameter) {
            this.setAlign(model._relativeAlign);
            this.setRelativeToWidgetName(model._relativeWidgetName);
            this.setRelativeName(model._relativeLayoutName);
        }
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
    return new ccui.RelativeLayoutParameter();
};

// Constants
//Relative layout parameter RelativeAlign
ccui.RelativeLayoutParameter.NONE = 0;
ccui.RelativeLayoutParameter.PARENT_TOP_LEFT = 1;
ccui.RelativeLayoutParameter.PARENT_TOP_CENTER_HORIZONTAL = 2;
ccui.RelativeLayoutParameter.PARENT_TOP_RIGHT = 3;
ccui.RelativeLayoutParameter.PARENT_LEFT_CENTER_VERTICAL = 4;

ccui.RelativeLayoutParameter.CENTER_IN_PARENT = 5;

ccui.RelativeLayoutParameter.PARENT_RIGHT_CENTER_VERTICAL = 6;
ccui.RelativeLayoutParameter.PARENT_LEFT_BOTTOM = 7;
ccui.RelativeLayoutParameter.PARENT_BOTTOM_CENTER_HORIZONTAL = 8;
ccui.RelativeLayoutParameter.PARENT_RIGHT_BOTTOM = 9;

ccui.RelativeLayoutParameter.LOCATION_ABOVE_LEFTALIGN = 10;
ccui.RelativeLayoutParameter.LOCATION_ABOVE_CENTER = 11;
ccui.RelativeLayoutParameter.LOCATION_ABOVE_RIGHTALIGN = 12;
ccui.RelativeLayoutParameter.LOCATION_LEFT_OF_TOPALIGN = 13;
ccui.RelativeLayoutParameter.LOCATION_LEFT_OF_CENTER = 14;
ccui.RelativeLayoutParameter.LOCATION_LEFT_OF_BOTTOMALIGN = 15;
ccui.RelativeLayoutParameter.LOCATION_RIGHT_OF_TOPALIGN = 16;
ccui.RelativeLayoutParameter.LOCATION_RIGHT_OF_CENTER = 17;
ccui.RelativeLayoutParameter.LOCATION_RIGHT_OF_BOTTOMALIGN = 18;
ccui.RelativeLayoutParameter.LOCATION_BELOW_LEFTALIGN = 19;
ccui.RelativeLayoutParameter.LOCATION_BELOW_CENTER = 20;
ccui.RelativeLayoutParameter.LOCATION_BELOW_RIGHTALIGN = 21;

/**
 * @ignore
 */
ccui.LINEAR_GRAVITY_NONE = 0;
ccui.LINEAR_GRAVITY_LEFT = 1;
ccui.LINEAR_GRAVITY_TOP = 2;
ccui.LINEAR_GRAVITY_RIGHT = 3;
ccui.LINEAR_GRAVITY_BOTTOM = 4;
ccui.LINEAR_GRAVITY_CENTER_VERTICAL = 5;
ccui.LINEAR_GRAVITY_CENTER_HORIZONTAL = 6;

//RelativeAlign
ccui.RELATIVE_ALIGN_NONE = 0;
ccui.RELATIVE_ALIGN_PARENT_TOP_LEFT = 1;
ccui.RELATIVE_ALIGN_PARENT_TOP_CENTER_HORIZONTAL = 2;
ccui.RELATIVE_ALIGN_PARENT_TOP_RIGHT = 3;
ccui.RELATIVE_ALIGN_PARENT_LEFT_CENTER_VERTICAL = 4;
ccui.RELATIVE_ALIGN_PARENT_CENTER = 5;
ccui.RELATIVE_ALIGN_PARENT_RIGHT_CENTER_VERTICAL = 6;
ccui.RELATIVE_ALIGN_PARENT_LEFT_BOTTOM = 7;
ccui.RELATIVE_ALIGN_PARENT_BOTTOM_CENTER_HORIZONTAL = 8;
ccui.RELATIVE_ALIGN_PARENT_RIGHT_BOTTOM = 9;

ccui.RELATIVE_ALIGN_LOCATION_ABOVE_LEFT = 10;
ccui.RELATIVE_ALIGN_LOCATION_ABOVE_CENTER = 11;
ccui.RELATIVE_ALIGN_LOCATION_ABOVE_RIGHT = 12;

ccui.RELATIVE_ALIGN_LOCATION_LEFT_TOP = 13;
ccui.RELATIVE_ALIGN_LOCATION_LEFT_CENTER = 14;
ccui.RELATIVE_ALIGN_LOCATION_LEFT_BOTTOM = 15;

ccui.RELATIVE_ALIGN_LOCATION_RIGHT_TOP = 16;
ccui.RELATIVE_ALIGN_LOCATION_RIGHT_CENTER = 17;
ccui.RELATIVE_ALIGN_LOCATION_RIGHT_BOTTOM = 18;

ccui.RELATIVE_ALIGN_LOCATION_BELOW_TOP = 19;
ccui.RELATIVE_ALIGN_LOCATION_BELOW_CENTER = 20;
ccui.RELATIVE_ALIGN_LOCATION_BELOW_BOTTOM = 21;