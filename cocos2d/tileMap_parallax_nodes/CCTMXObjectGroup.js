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
 * cc.TMXObjectGroup represents the TMX object group.
 * @class
 * @extends cc.Class
 */
cc.TMXObjectGroup = cc.Class.extend(/** @lends cc.TMXObjectGroup# */{
    //name of the group
    _groupName:"",
    _positionOffset:null,
    _properties:null,
    _objects:null,

    /**
     *  Constructor
     */
    ctor:function () {
        this._properties = [];
        this._objects = [];
        this._positionOffset = cc.PointZero();
    },

    /**
     * Offset position of child objects
     * @return {cc.Point}
     */
    getPositionOffset:function () {
        return this._positionOffset;
    },

    /**
     * @param {cc.Point} Var
     */
    setPositionOffset:function (Var) {
        this._positionOffset = Var;
    },

    /**
     * List of properties stored in a dictionary
     * @return {Array}
     */
    getProperties:function () {
        return this._properties;
    },

    /**
     * @param {object} Var
     */
    setProperties:function (Var) {
        this._properties.push(Var);
    },

    /**
     * @return {String}
     */
    getGroupName:function () {
        return this._groupName.toString();
    },

    /**
     * @param {String} groupName
     */
    setGroupName:function (groupName) {
        this._groupName = groupName;
    },

    /**
     * Return the value for the specific property name
     * @param {String} propertyName
     * @return {object}
     */
    propertyNamed:function (propertyName) {
        return this._properties[propertyName];
    },

    /**
     * <p>Return the dictionary for the specific object name. <br />
     * It will return the 1st object found on the array for the given name.</p>
     * @param {String} objectName
     * @return {object|Null}
     */
    objectNamed:function (objectName) {
        if (this._objects && this._objects.length > 0) {
            for (var i = 0, len = this._objects.length; i < len; i++) {
                var name = this._objects[i]["name"];
                if (name && name == objectName)
                    return this._objects[i];
            }
        }
        // object not found
        return null;
    },

    /**
     * @return {Array}
     */
    getObjects:function () {
        return this._objects;
    },

    /**
     * @param {object} objects
     */
    setObjects:function (objects) {
        this._objects.push(objects);
    }
});
