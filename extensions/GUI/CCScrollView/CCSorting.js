/****************************************************************************
 Copyright (c) 2012 cocos2d-x.org
 Copyright (c) 2010 Sangwoo Im

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

cc.SortableObject = cc.Class.extend({
    setObjectID:function (objectId) {
    },
    getObjectID:function () {
        return 0;
    }
});

cc.SortedObject = cc.SortableObject.extend({
    _objectID:0,

    ctor:function () {
        this._objectID = 0;
    },

    setObjectID:function (objectID) {
        this._objectID = objectID;
    },

    getObjectID:function () {
        return this._objectID;
    }
});

var _compareObject = function (val1, val2) {
    return (val1.getObjectID() - val2.getObjectID());
};

cc.ArrayForObjectSorting = cc.Class.extend({
    _saveObjectArr:[],

    ctor:function () {
        this._saveObjectArr = [];
    },
    /*!
     * Inserts a given object into array.
     *
     * Inserts a given object into array with key and value that are used in
     * sorting. "value" must respond to message, compare:, which returns
     * (NSComparisonResult). If it does not respond to the message, it is appended.
     * If the compare message does not result NSComparisonResult, sorting behavior
     * is not defined. It ignores duplicate entries and inserts next to it.
     *
     * @param object to insert
     */
    insertSortedObject:function (addObject) {
        cc.Assert(addObject instanceof cc.Class, "Invalid parameter.");
        var idx = this.indexOfSortedObject(addObject);
        this.insertObject(addObject, idx);
    },

    /*!
     * Removes an object in array.
     *
     * Removes an object with given key and value. If no object is found in array
     * with the key and value, no action is taken.
     *
     * @param value to remove
     */
    removeSortedObject:function (delObject) {
        if (this.count() == 0) {
            return;
        }

        var idx = this.indexOfSortedObject(delObject);
        if (idx < this.count() && idx != cc.INVALID_INDEX) {
            var foundObj = this.objectAtIndex(idx);
            if (foundObj.getObjectID() == delObject.getObjectID()) {
                this.removeObjectAtIndex(idx);
            }
        }
    },

    /*!
     * Sets a new value of the key for the given object.
     *
     * In case where sorting value must be changed, this message must be sent to
     * keep consistency of being sorted. If it is changed externally, it must be
     * sorted completely again.
     *
     * @param value to set
     * @param object the object which has the value
     */
    setObjectID_ofSortedObject:function (tag, setObject) {
        var idx = this.indexOfSortedObject(setObject);
        if (idx < this.count() && idx != cc.INVALID_INDEX) {
            var foundObj = this.objectAtIndex(idx);
            if (foundObj.getObjectID() == setObject.getObjectID()) {
                this.removeObjectAtIndex(idx);
                foundObj.setObjectID(tag);
                this.insertSortedObject(foundObj);
            }
        }
    },

    objectWithObjectID:function (tag) {
        if (this.count() == 0) {
            return null;
        }
        var foundObj = new cc.SortedObject();
        foundObj.setObjectID(tag);

        var idx = this.indexOfSortedObject(foundObj);
        if (idx < this.count() && idx != cc.INVALID_INDEX) {
            foundObj = this.objectAtIndex(idx);
            if (foundObj.getObjectID() != tag) {
                foundObj = null;
            }
        }
        return foundObj;
    },

    /*!
     * Returns an object with given key and value.
     *
     * Returns an object with given key and value. If no object is found,
     * it returns nil.
     *
     * @param value to locate object
     * @return object found or nil.
     */
    getObjectWithObjectID:function (tag) {
        return null;
    },

    /*!
     * Returns an index of the object with given key and value.
     *
     * Returns the index of an object with given key and value.
     * If no object is found, it returns an index at which the given object value
     * would have been located. If object must be located at the end of array,
     * it returns the length of the array, which is out of bound.
     *
     * @param value to locate object
     * @return index of an object found
     */
    indexOfSortedObject:function (idxObj) {
        var idx = 0;
        if (idxObj) {
            //       CCObject* pObj = (CCObject*)bsearch((CCObject*)&object, data.arr, data.num, sizeof(CCObject*), _compareObject);
            // FIXME: need to use binary search to improve performance
            var uPrevObjectID = 0;
            var uOfSortObjectID = idxObj.getObjectID();

            for (var i = 0; i < this._saveObjectArr.length; i++) {
                var pSortableObj = this._saveObjectArr[i];
                var curObjectID = pSortableObj.getObjectID();
                if ((uOfSortObjectID == curObjectID) ||
                    (uOfSortObjectID >= uPrevObjectID && uOfSortObjectID < curObjectID)) {
                    break;
                }
                uPrevObjectID = curObjectID;
                idx++;
            }
        } else {
            idx = cc.INVALID_INDEX;
        }
        return idx;
    },

    //implement array method
    count:function () {
        return this._saveObjectArr.length;
    },

    lastObject:function () {
        if (this._saveObjectArr.length == 0)
            return null;
        return this._saveObjectArr[this._saveObjectArr.length - 1];
    },

    objectAtIndex:function (idx) {
        return this._saveObjectArr[idx];
    },

    addObject:function (addObj) {
        this._saveObjectArr.push(addObj);
        this._saveObjectArr.sort(_compareObject);
    },

    removeObjectAtIndex:function (idx) {
        cc.ArrayRemoveObjectAtIndex(this._saveObjectArr, idx);
        this._saveObjectArr.sort(_compareObject);
    },

    insertObject:function (addObj, idx) {
        this._saveObjectArr = cc.ArrayAppendObjectToIndex(this._saveObjectArr, addObj, idx);
        this._saveObjectArr.sort(_compareObject);
    }
});
