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
 * @class
 * @extends cc.Class
 */
cc.Set = cc.Class.extend(/** @lends cc.Set# */{
    /**
     * Constructor
     * @param {cc.Set} setObject
     */
    ctor:function (setObject) {
        if (setObject) {
            this._set = Object.create(setObject._set);
        }
        else {
            this._set = new Array();
        }

    },

    /**
     * Return a copy of the cc.Set, it will copy all the elelments.
     * @return {cc.Set}
     */
    copy:function () {
        return new this.Set(this);
    },

    /**
     * It is the same as copy().
     * @return {cc.Set}
     */
    mutableCopy:function () {
        return this.copy();

    },

    /**
     * Return the number of elements the cc.Set contains.
     * @return {Number}
     */
    count:function () {
        return this._set.length;

    },

    /**
     * Add a element into cc.Set, it will retain the element.
     * @param {object} obj
     */
    addObject:function (obj) {
        this._set.push(obj);

    },

    /**
     * Remove the given element, nothing todo if no element equals obj.
     * @param {object} obj
     */
    removeObject:function (obj) {
        /* if(obj in this._set)
         {
         delete this._set[obj]
         } */
        var k = 0;
        for (var i = 0, n = 0; i < this._set.length; i++) {
            if (this._set[i] != obj) {
                this._set[n++] = this._set[i];
                k++;
            }
        }
        array.length = k;

    },

    /**
     * Check if cc.Set contains a element equals obj.
     * @param {object} obj
     * @return {Boolean}
     */
    containsObject:function (obj) {

        if ((obj in this._set) == true) {
            return true;
        }
        else {
            return false;
        }


    },


    /**
     * Return the first element if it contains elements, or null if it doesn't contain any element.
     * @return {object|Null}
     */
    anyObject:function () {
        if (this._set.length > 0) {
            return this._set[0];
        }
        else {
            return null;
        }

    },

    _set:null

});

/**
 * cc.NSMutableSet is the same as cc.Set
 * @class
 * @extends cc.Set
 */
cc.NSMutableSet = cc.Set;
