/****************************************************************************
 Copyright (c) 2010-2012 cocos2d-x.org
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
 * The data of touch event
 * @class
 * @extends cc.Class
 */
cc.Touch = cc.Class.extend(/** @lends cc.Touch# */{
    _point:null,
    _prevPoint:null,
    _id:0,
    _startPointCaptured: false,
    _startPoint:null,

    /**
     * Constructor
     */
    ctor:function (x, y, id) {
        this._point = cc.p(x || 0, y || 0);
        this._id = id || 0;
    },

    /**
     * returns the current touch location in OpenGL coordinates
     * @return {cc.Point}
     */
    getLocation:function () {
        //TODO
        //return cc.director.convertToGL(this._point);
        return this._point;
    },

	/**
	 * gets location X axis data
	 * @returns {number}
	 */
	getLocationX: function () {
		return this._point.x;
	},

	/**
	 * gets location Y axis data
	 * @returns {number}
	 */
	getLocationY: function () {
		return this._point.y;
	},

    /**
     * returns the previous touch location in OpenGL coordinates
     * @return {cc.Point}
     */
    getPreviousLocation:function () {
        //TODO
        //return cc.director.convertToGL(this._prevPoint);
        return this._prevPoint;
    },

    /**
     * returns the start touch location in OpenGL coordinates
     * @returns {cc.Point}
     */
    getStartLocation: function() {
        //TODO
        //return cc.director.convertToGL(this._startPoint);
        return this._startPoint;
    },

    /**
     * returns the delta of 2 current touches locations in screen coordinates
     * @return {cc.Point}
     */
    getDelta:function () {
        return cc.pSub(this._point, this._prevPoint);
    },

    /**
     * returns the current touch location in screen coordinates
     * @return {cc.Point}
     */
    getLocationInView: function() {
        return this._point;
    },

    /**
     * returns the previous touch location in screen coordinates
     * @return {cc.Point}
     */
    getPreviousLocationInView: function(){
        return this._prevPoint;
    },

    /**
     * returns the start touch location in screen coordinates
     * @return {cc.Point}
     */
    getStartLocationInView: function(){
        return this._startPoint;
    },

    /**
     * @return {Number}
     */
    getID:function () {
        return this._id;
    },

    /**
     * @return {Number}
     */
    getId:function () {
        return this._id;
    },

    /**
     * set information to touch
     * @param {Number} id
     * @param  {Number} x
     * @param  {Number} y
     */
    setTouchInfo:function (id, x, y) {
        this._prevPoint = this._point;
        this._point = cc.p(x || 0, y || 0);
        this._id = id;
        if(!this._startPointCaptured){
            this._startPoint = cc.p(this._point);
            this._startPointCaptured = true;
        }
    },

    _setPoint: function(x, y){
        if(y === undefined){
            this._point.x = x.x;
            this._point.y = x.y;
        }else{
            this._point.x = x;
            this._point.y = y;
        }
    },

    _setPrevPoint:function (x, y) {
        if(y === undefined)
            this._prevPoint = cc.p(x.x, x.y);
        else
            this._prevPoint = cc.p(x || 0, y || 0);
    }
});