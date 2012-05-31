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

cc.Set = cc.Class.extend({

    ctor:function (setObject) {
        if (setObject) {
            this._set = Object.create(setObject._set);
        }
        else {
            this._set = new Array();
        }

    },

    /**
     *@brief Return a copy of the CCSet, it will copy all the elelments.
     */
    copy:function () {
        return new this.Set(this);
    },

    /**
     *@brief It is the same as copy().
     */
    mutableCopy:function () {
        return this.copy();

    },

    /**
     *@brief Return the number of elements the CCSet contains.
     */
    count:function () {
        return this._set.length;

    },

    /**
     *@brief Add a element into CCSet, it will retain the element.
     */
    addObject:function (obj) {
        this._set.push(obj);

    },

    /**
     *@brief Remove the given element, nothing todo if no element equals obj.
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
     *@brief Check if CCSet contains a element equals obj.
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
     *@brief Return the iterator that points to the first element.
     */
    /* begin:function()
     {
     if(this._set.length > 0){
     return 0;        // We only return the index of first element.
     }
     else{
     return null;
     }

     },*/

    /**
     *@brief Return the iterator that points to the poisition after the last element.
     */
    /* end:function()
     {
     if(this._set.length >= 0){
     return this._set.length;
     }

     },*/

    /**
     *@brief Return the first element if it contains elements, or null if it doesn't contain any element.
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

cc.NSMutableSet = cc.Set;
