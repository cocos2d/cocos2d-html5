/****************************************************************************
 Copyright (c) 2010-2012 cocos2d-x.org
 Copyright (c) 2008-2010 Ricardo Quesada
 Copyright (c) 2011      Zynga Inc.

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
 * <p>cc.UserDefault acts as a tiny localStorage. You can save and get base type values by it. <br/>
 * For example, setBoolForKey("played", true) will add a bool value true into the localStorage. <br/>
 * Its key is "played". You can get the value of the key by getBoolForKey("played").</p>
 *
 * <p>It supports the following base types: <br/>
 * bool, int, float, double, string</p>
 *
 * @class
 * @extends cc.Class
 */

cc.UserDefault = cc.Class.extend(/** @lends cc.UserDefault# */{
    _db:null,
    /*
     * init user default
     * */
    init:function () {
        this._db = this._getLocalStorage();
        return true;
    },

    _getLocalStorage:function () {
        try {
            if (!!sys.localStorage) {
                return sys.localStorage;
            }
        } catch (e) {
            return undefined;
        }
    },

    _getWebSqlDatabase:function () {

    },

    /**
     * Get bool value by key, if the key doesn't exist, a default value will return. <br/>
     * You can set the default value, or it is false.
     *
     * @param {String} key
     * @param {Boolean} defaultValue
     * @return {Boolean}
     */
    getBoolForKey:function (key, defaultValue) {
        var value = this._getValueForKey(key);
        var ret = defaultValue || false;
        if (value == "true") {
            return true;
        }
        else if (value == "false") {
            return false;
        }
        else if (value) {
            return Boolean(value);
        }

        return ret;
    },

    /**
     * Get integer value by key, if the key doesn't exist, a default value will return.<br/>
     * You can set the default value, or it is 0.
     *
     * @param {String} key
     * @param {Number} defaultValue
     * @return {Number}
     */
    getIntegerForKey:function (key, defaultValue) {
        var value = this._getValueForKey(key);
        var ret = defaultValue || 0;

        if (value) {
            return parseInt(value);
        }

        return ret;
    },

    /**
     * Get float value by key, if the key doesn't exist, a default value will return.<br/>
     * You can set the default value, or it is 0.0f.
     *
     * @param {String} key
     * @param {Number} defaultValue
     * @return {Number}
     */
    getFloatForKey:function (key, defaultValue) {
        var value = this._getValueForKey(key);
        var ret = defaultValue || 0;

        if (value) {
            return parseFloat(value);
        }

        return ret;
    },

    /**
     * Get double value by key, if the key doesn't exist, a default value will return.<br/>
     * You can set the default value, or it is 0.0.
     *
     * @param {String} key
     * @param {Number} defaultValue
     * @return {Number}
     */
    getDoubleForKey:function (key, defaultValue) {
        return this.getFloatForKey(key, defaultValue);
    },

    /**
     * Get string value by key, if the key doesn't exist, a default value will return.<br/>
     * You can set the default value, or it is "".
     *
     * @param {String} key
     * @param {String} defaultValue
     * @return {String}
     */
    getStringForKey:function (key, defaultValue) {
        var value = this._getValueForKey(key);
        var ret = defaultValue || "";

        if (value) {
            return  String(value);
        }

        return ret;
    },

    _getValueForKey:function (key) {
        var ret;
        if (this._db) {
            ret = this._db.getItem(key);
        }

        return ret;
    },

    /**
     * Set bool value by key.
     *
     * @param {String} key
     * @param {Boolean} value
     */
    setBoolForKey:function (key, value) {
        // save bool value as sring
        this.setStringForKey(key, String(value));
    },

    /**
     * Set integer value by key.
     *
     * @param {String} key
     * @param {Number} value
     */
    setIntegerForKey:function (key, value) {
        // check key
        if (!key) {
            return;
        }

        this._setValueForKey(key, parseInt(value));
    },

    /**
     * Set float value by key.
     *
     * @param {String} key
     * @param {Number} value
     */
    setFloatForKey:function (key, value) {
        // check key
        if (!key) {
            return;
        }

        this._setValueForKey(key, parseFloat(value));
    },

    /**
     * Set double value by key.
     *
     * @param {String} key
     * @param {Number} value
     */
    setDoubleForKey:function (key, value) {
        return this.setFloatForKey(key, value);
    },

    /**
     * Set string value by key.
     *
     * @param {String} key
     * @param {String} value
     */
    setStringForKey:function (key, value) {
        // check key
        if (!key) {
            return;
        }

        this._setValueForKey(key, String(value));
    },

    _setValueForKey:function (key, value) {
        if (this._db) {
            this._db.setItem(key, value);
        }
    }
});

/**
 * returns a shared instance of the UserDefault
 * @function
 * @return {cc.UserDefault|}
 */
cc.UserDefault.getInstance = function () {
    if (!this._sUserDefault) {
        this._sUserDefault = new cc.UserDefault();
        this._sUserDefault.init();
    }

    return this._sUserDefault;
};

/**
 * purge a shared instance of the UserDefault
 * @function
 * @return {cc.UserDefault|}
 */
cc.UserDefault.purgeInstanceUserDefault = function () {
    if (cc.hasOwnProperty("Browser")) { //TODO: clear() is not implemented in JSB
        if (this._db) {
            this._db.clear();
        }
    }
};

cc.UserDefault._sUserDefault = null;
cc.UserDefault._isFilePathInitialized = false;