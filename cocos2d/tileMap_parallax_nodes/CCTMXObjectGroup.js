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
var cc = cc = cc || {};

/** @brief CCTMXObjectGroup represents the TMX object group.
 @since v0.99.0
 */
cc.TMXObjectGroup = cc.Class.extend({
    /** name of the group */
    _groupName:"",
    _positionOffset:cc.PointZero(),
    _properties:null,
    _objects:null,
    ctor:function(){
        this._properties = [];
        this._objects = [];
    },
    /** offset position of child objects */
    getPositionOffset:function () {
        return this._positionOffset;
    },
    setPositionOffset:function (Var) {
        this._positionOffset = Var;
    },
    /** list of properties stored in a dictionary */
    getProperties:function () {
        return this._properties;
    },
    setProperties:function (properties) {
        this._properties.push(properties);
    },
    getGroupName:function () {
        return this._groupName.toString();
    },
    setGroupName:function (groupName) {
        this._groupName = groupName;
    },
    /** return the value for the specific property name */
    propertyNamed:function (propertyName) {
        return this._properties[propertyName];
    },
    /** return the dictionary for the specific object name.
     It will return the 1st object found on the array for the given name.
     */
    objectNamed:function (objectName) {
        if (this._objects && this._objects.length > 0) {
            for (var i = 0, len = this._objects.length; i < len; i++) {
                var name = this._objects[i]["name"];
                if (name && name == objectName) {
                    return this._objects[i];
                }
            }
        }
        // object not found
        return null;
    },
    getObjects:function () {
        return this._objects;
    },
    setObjects:function (objects) {
        this._objects.push(objects);
    }
});