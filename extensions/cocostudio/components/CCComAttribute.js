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
 * Base class for ccs.ComAttribute
 * @class
 * @extends ccs.Component
 */
ccs.ComAttribute = ccs.Component.extend(/** @lends ccs.ComAttribute# */{
    _jsonDict: null,
    _filePath: "",
    ctor: function () {
        cc.Component.prototype.ctor.call(this);
        this._jsonDict = {};
        this._filePath = "";
        this._name = "CCComAttribute";
    },
    init: function () {
        this._jsonDict = {};
        return true;
    },

    /**
     * Set int attribute
     * @param {String} key
     * @param {number} value
     */
    setInt: function (key, value) {
        if (!key) {
            cc.log("Argument must be non-nil");
            return;
        }
        this._jsonDict[key] = value;
    },

    /**
     * Set double attribute
     * @param {String} key
     * @param {number} value
     */
    setDouble: function (key, value) {
        if (!key) {
            cc.log("Argument must be non-nil");
            return;
        }
        this._jsonDict[key] = value;
    },

    /**
     * Set float attribute
     * @param {String} key
     * @param {number} value
     */
    setFloat: function (key, value) {
        if (!key) {
            cc.log("Argument must be non-nil");
            return;
        }
        this._jsonDict[key] = value;
    },

    /**
     * Set boolean attribute
     * @param {String} key
     * @param {Boolean} value
     */
    setBool: function (key, value) {
        if (!key) {
            cc.log("Argument must be non-nil");
            return;
        }
        this._jsonDict[key] = value;
    },

    /**
     * Set string attribute
     * @param {String} key
     * @param {Boolean} value
     */
    setString: function (key, value) {
        if (!key) {
            cc.log("Argument must be non-nil");
            return;
        }
        this._jsonDict[key] = value;
    },

    /**
     * Set object attribute
     * @param {String} key
     * @param {Object} value
     */
    setObject: function (key, value) {
        if (!key) {
            cc.log("Argument must be non-nil");
            return;
        }
        this._jsonDict[key] = value;
    },

    /**
     * Get int value from attribute
     * @param {String} key
     * @returns {Number}
     */
    getInt: function (key) {
        var ret = this._jsonDict[key];
        return parseInt(ret || 0);
    },

    /**
     * Get double value from attribute
     * @param {String} key
     * @returns {Number}
     */
    getDouble: function (key) {
        var ret = this._jsonDict[key];
        return parseFloat(ret || 0.0);
    },

    /**
     * Get float value from attribute
     * @param {String} key
     * @returns {Number}
     */
    getFloat: function (key) {
        var ret = this._jsonDict[key];
        return parseFloat(ret || 0.0);
    },

    /**
     * Get boolean value from attribute
     * @param {String} key
     * @returns {Boolean}
     */
    getBool: function (key) {
        var ret = this._jsonDict[key];
        return Boolean(ret || false);
    },

    /**
     * Get string value from attribute
     * @param {String} key
     * @returns {String}
     */
    getString: function (key) {
        var ret = this._jsonDict[key];
        return ret || "";
    },

    /**
     * Get object value from attribute
     * @param {String} key
     * @returns {Object}
     */
    getObject: function (key) {
        return this._jsonDict[key];
    },

    /**
     *
     * @param path
     */
    parse:function(path){
        this._jsonDict = cc.loader.getRes(path);
    }
});
/**
 * allocates and initializes a ComAttribute.
 * @constructs
 * @return {ccs.ComAttribute}
 * @example
 * // example
 * var com = ccs.ComAttribute.create();
 */
ccs.ComAttribute.create = function () {
    var com = new ccs.ComAttribute();
    if (com && com.init()) {
        return com;
    }
    return null;
};