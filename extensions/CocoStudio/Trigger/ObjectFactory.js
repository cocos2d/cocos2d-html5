/****************************************************************************
 Copyright (c) 2013 cocos2d-x.org

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

ccs.ObjectFactory = ccs.Class.extend({
    _typeMap: null,
    ctor: function () {
        this._typeMap = {};
    },
    destroyInstance: function () {
        this._instance = null;
    },

    createObject: function (className) {
        var o = null;
        var t = this._typeMap[className];
        if (t) {
            o = new t._fun();
        }
        return o;
    },

    registerType: function (t) {
        this._typeMap[t._className] = t;
    }
});

ccs.ObjectFactory._instance = null;

ccs.ObjectFactory.getInstance = function () {
    if (!this._instance) {
        this._instance = new ccs.ObjectFactory();
    }
    return this._instance;
};

ccs.TInfo = ccs.Class.extend({
    _className: "",
    _fun: null,
    /**
     *
     * @param {String|ccs.TInfo}c
     * @param {Function}f
     */
    ctor: function (c, f) {
        if (f) {
            this._className = c;
            this._fun = f;
        } else {
            this._className = c._className;
            this._fun = c._fun;
        }
        ccs.ObjectFactory.getInstance().registerType(this);
    }
});
