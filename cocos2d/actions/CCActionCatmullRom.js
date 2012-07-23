/****************************************************************************
 Copyright (c) 2010-2012 cocos2d-x.org
 Copyright (c) 2008-2010 Ricardo Quesada
 Copyright (c) 2011      Zynga Inc.
 Copyright (c) 2008 Radu Gruian
 Copyright (c) 2011 Vit Valentin

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

 Orignal code by Radu Gruian: http://www.codeproject.com/Articles/30838/Overhauser-Catmull-Rom-Splines-for-Camera-Animatio.So

 Adapted to cocos2d-x by Vit Valentin

 Adapted from cocos2d-x to cocos2d-iphone by Ricardo Quesada
 ****************************************************************************/

/**
 * <p>Returns the Cardinal Spline position for a given set of control points, tension and time CatmullRom Spline formula: <br/>
 *   s(-ttt + 2tt - t)P1 + s(-ttt + tt)P2 + (2ttt - 3tt + 1)P2 + s(ttt - 2tt + t)P3 + (-2ttt + 3tt)P3 + s(ttt - tt)P4
 * </p>
 * @function
 * @param {cc.Point} p0
 * @param {cc.Point} p1
 * @param {cc.Point} p2
 * @param {cc.Point} p3
 * @param {Number} tension
 * @param {Number} t
 * @return {cc.Point}
 */
 cc.CardinalSplineAt = function (p0, p1, p2, p3, tension, t) {
    var t2 = t * t;
    var t3 = t2 * t;

    /*
     * Formula: s(-ttt + 2tt - t)P1 + s(-ttt + tt)P2 + (2ttt - 3tt + 1)P2 + s(ttt - 2tt + t)P3 + (-2ttt + 3tt)P3 + s(ttt - tt)P4
     */
    var s = (1 - tension) / 2;

    var b1 = s * ((-t3 + (2 * t2)) - t);                      // s(-t3 + 2 t2 - t)P1
    var b2 = s * (-t3 + t2) + (2 * t3 - 3 * t2 + 1);          // s(-t3 + t2)P2 + (2 t3 - 3 t2 + 1)P2
    var b3 = s * (t3 - 2 * t2 + t) + (-2 * t3 + 3 * t2);      // s(t3 - 2 t2 + t)P3 + (-2 t3 + 3 t2)P3
    var b4 = s * (t3 - t2);                                   // s(t3 - t2)P4

    var x = (p0.x * b1 + p1.x * b2 + p2.x * b3 + p3.x * b4);
    var y = (p0.y * b1 + p1.y * b2 + p2.y * b3 + p3.y * b4);
    return cc.p(x, y);
};

/**
 * An Array that contain control points. Used by cc.CardinalSplineTo and (By) and cc.CatmullRomTo (and By) actions.
 * @class
 * @extends cc.Node
 *
 * @example
 * //create a PointArray
 *  var array = cc.PointArray.create();
 *
 *  //add some points to this PointArray
 *  array.addControlPoint(cc.p(0, 0));
 *  array.addControlPoint(cc.p(winSize.width / 2 - 30, 0));
 *  array.addControlPoint(cc.p(winSize.width / 2 - 30, winSize.height - 80));
 *  array.addControlPoint(cc.p(0, winSize.height - 80));
 *  array.addControlPoint(cc.p(0, 0));
 */
cc.PointArray = cc.Node.extend(/** @lends cc.PointArray# */{
    /** Array that contains the control points */
    _controlPoints:null,

    /**
     * Constructor
     */
    ctor:function () {
        this._controlPoints = [];
    },

    /**
     * appends a control point
     * @param {cc.Point} controlPoint
     */
    addControlPoint:function (controlPoint) {
        // should create a new object of cc.Point
        // because developer always use this function like this
        // addControlPoint(ccp(x, y))
        // passing controlPoint is a temple object
        var temp = cc.p(controlPoint.x, controlPoint.y);
        this._controlPoints.push(temp);
    },

    /**
     * inserts a controlPoint at index
     * @param {cc.Point} controlPoint
     * @param {Number} index
     */
    insertControlPoint:function (controlPoint, index) {
        // should create a new object of cc.Point
        // because developer always use this function like this
        // insertControlPoint(ccp(x, y))
        // passing controlPoint is a temple object
        var temp = cc.p(controlPoint.x, controlPoint.y);
        this._controlPoints = cc.ArrayAppendObjectToIndex(this._controlPoints, temp, index);
    },

    /**
     * replaces an existing controlPoint at index
     * @param {cc.Point} controlPoint
     * @param {Number} index
     */
    replaceControlPoint:function (controlPoint, index) {
        // should create a new object of cc.Point
        // because developer always use this function like this
        // replaceControlPoint(ccp(x, y))
        // passing controlPoint is a temple object
        this._controlPoints[index] = cc.p(controlPoint.x, controlPoint.y);
    },

    /**
     * get the value of a controlPoint at a given index
     * @param {Number} index
     * @return {cc.Point}
     */
    getControlPointAtIndex:function (index) {
        if (!this._controlPoints) {
            return null;
        }
        index = index < 0 ? 0 : index;
        index = index > this._controlPoints.length - 1 ? this._controlPoints.length - 1 : index;
        return this._controlPoints[index];
    },

    /**
     * deletes a control point at a given index
     * @param {Number} index
     */
    removeControlPointAtIndex:function (index) {
        cc.ArrayRemoveObjectAtIndex(this._controlPoints, index);
    },

    /**
     * returns the number of objects of the control point array
     * @return {Number}
     */
    count:function () {
        return this._controlPoints.length;
    },

    /**
     * returns a new copy of the array reversed. User is responsible for releasing this copy
     * @return {cc.PointArray}
     */
    reverse:function () {
        var newArray = [];
        for (var i = this._controlPoints.length - 1; i >= 0; i--) {
            newArray.push(cc.p(this._controlPoints[i].x, this._controlPoints[i].y));
        }
        var config = new cc.PointArray();
        config.setControlPoints(newArray);
        return config;
    },

    /**
     * reverse the current control point array inline, without generating a new one
     */
    reverseInline:function () {
        var len = this._controlPoints.length;
        var mid = 0 | (len / 2);
        for (var i = 0; i < mid; ++i) {
            var temp = this._controlPoints[i];
            this._controlPoints[i] = this._controlPoints[len - i - 1];
            this._controlPoints[len - i - 1] = temp;
        }
    },

    /**
     * copy a new PointArray
     * @return {cc.PointArray}
     */
    copyWithZone:function () {
        var newArray = [];
        var newPoints = new cc.PointArray();
        for (var i = 0; i < this._controlPoints.length; i++) {
            newArray.push(cc.p(this._controlPoints[i].x, this._controlPoints[i].y));
        }
        newPoints.setControlPoints(newArray);
        return newPoints;
    },

    /**
     * get control points
     * @return {Array}
     */
    getControlPoints:function () {
        return this._controlPoints;
    },

    /**
     * set control points
     * @param {Array} controlPoints
     */
    setControlPoints:function (controlPoints) {
        this._controlPoints = controlPoints;
    }
});

/**
 * creates and initializes a Points array with capacity
 * @function
 * @return {cc.PointArray}
 */
cc.PointArray.create = function () {
    return new cc.PointArray();
};

/**
 * Cardinal Spline path. http://en.wikipedia.org/wiki/Cubic_Hermite_spline#Cardinal_spline
 * @class
 * @extends cc.ActionInterval
 *
 * @example
 * //create a cc.CardinalSplineTo
 * var action1 = cc.CardinalSplineTo.create(3, array, 0);
 */
cc.CardinalSplineTo = cc.ActionInterval.extend(/** @lends cc.CardinalSplineTo# */{
    /** Array of control points */
    _points:null,
    _deltaT:0,
    _tension:0,

    /**
     * Constructor
     */
    ctor:function () {
        this._points = new cc.PointArray();
    },

    /**
     * initializes the action with a duration and an array of points
     * @param {Number} duration
     * @param {cc.PointArray} points
     * @param {Number} tension
     * @return {Boolean}
     */
    initWithDuration:function (duration, points, tension) {
        cc.Assert(points.count() > 0, "Invalid configuration. It must at least have one control point");
        if (this._super(duration)) {
            this.setPoints(points);
            this._tension = tension;
            return true;
        }
        return false;
    },

    /**
     * @param {cc.Node} target
     */
    startWithTarget:function (target) {
        this._super(target);
        this._deltaT = 1 / this._points.count();
    },

    /**
     * @param {Number} time
     */
    update:function (time) {
        var p, lt;

        // border
        if (time == 1) {
            p = this._points.count() - 1;
            lt = 1;
        } else {
            p = 0 | (time / this._deltaT);
            lt = (time - this._deltaT * p) / this._deltaT;
        }

        var newPos = cc.CardinalSplineAt(this._points.getControlPointAtIndex(p - 1), this._points.getControlPointAtIndex(p + 0),
            this._points.getControlPointAtIndex(p + 1), this._points.getControlPointAtIndex(p + 2), this._tension, lt);
        this.updatePosition(newPos);
    },

    /**
     * reverse a new cc.CardinalSplineTo
     * @return {cc.CardinalSplineTo}
     */
    reverse:function () {
        var reversePoints = this._points.reverse();
        return cc.CardinalSplineTo.create(this._duration, reversePoints, this._tension);
    },

    /**
     * update position of target
     * @param {cc.Point} newPos
     */
    updatePosition:function (newPos) {
        this._target.setPosition(newPos);
    },

    /**
     * Points getter
     * @return {cc.PointArray}
     */
    getPoints:function () {
        return this._points;
    },

    /**
     * Points setter
     * @param {cc.PointArray} points
     */
    setPoints:function (points) {
        this._points = points;
    }
});

/**
 * creates an action with a Cardinal Spline array of points and tension
 * @function
 * @param {Number} duration
 * @param {cc.PointArray} points
 * @param {Number} tension
 * @return {cc.CardinalSplineTo}
 *
 * @example
 * //create a cc.CardinalSplineTo
 * var action1 = cc.CardinalSplineTo.create(3, array, 0);
 */
cc.CardinalSplineTo.create = function (duration, points, tension) {
    var ret = new cc.CardinalSplineTo();
    if (ret.initWithDuration(duration, points, tension)) {
        return ret;
    }
    return null;
};

/**
 * Cardinal Spline path.  http://en.wikipedia.org/wiki/Cubic_Hermite_spline#Cardinal_spline
 * @class
 * @extends cc.CardinalSplineTo
 *
 * @example
 * //create a cc.CardinalSplineBy
 * var action1 = cc.CardinalSplineBy.create(3, array, 0);
 */
cc.CardinalSplineBy = cc.CardinalSplineTo.extend(/** @lends cc.CardinalSplineBy# */{
    _startPosition:null,

    /**
     * Constructor
     */
    ctor:function () {
        this._startPosition = cc.p(0, 0);
    },

    /**
     * @param {cc.Node} target
     */
    startWithTarget:function (target) {
        this._super(target);
        this._startPosition = target.getPosition();
    },

    /**
     * reverse a new cc.CardinalSplineBy
     * @return {cc.CardinalSplineBy}
     */
    reverse:function () {
        var copyConfig = this._points.copyWithZone(null);
        var current;
        //
        // convert "absolutes" to "diffs"
        //
        var p = copyConfig.getControlPointAtIndex(0);
        for (var i = 1; i < copyConfig.count(); ++i) {
            current = copyConfig.getControlPointAtIndex(i);
            var diff = cc.pSub(current, p);
            copyConfig.replaceControlPoint(diff, i);
            p = current;
        }

        // convert to "diffs" to "reverse absolute"
        var reverseArray = copyConfig.reverse();

        // 1st element (which should be 0,0) should be here too
        p = reverseArray.getControlPointAtIndex(reverseArray.count() - 1);
        reverseArray.removeControlPointAtIndex(reverseArray.count() - 1);

        p = cc.pNeg(p);
        reverseArray.insertControlPoint(p, 0);
        for (i = 1; i < reverseArray.count(); ++i) {
            current = reverseArray.getControlPointAtIndex(i);
            current = cc.pNeg(current);
            var abs = cc.pAdd(current, p);
            reverseArray.replaceControlPoint(abs, i);
            p = abs;
        }
        return cc.CardinalSplineBy.create(this._duration, reverseArray, this._tension);
    },

    /**
     * update position of target
     * @param {cc.Point} newPos
     */
    updatePosition:function (newPos) {
        this._target.setPosition(cc.pAdd(newPos, this._startPosition));
    }
});

/**
 * creates an action with a Cardinal Spline array of points and tension
 * @function
 * @param {Number} duration
 * @param {cc.PointArray} points
 * @param {Number} tension
 * @return {cc.CardinalSplineBy}
 */
cc.CardinalSplineBy.create = function (duration, points, tension) {
    var ret = new cc.CardinalSplineBy();
    if (ret.initWithDuration(duration, points, tension))
        return ret;
    return null;
};

/**
 * <p>
 *   An action that moves the target with a CatmullRom curve to a destination point.<br/>
 *   A Catmull Rom is a Cardinal Spline with a tension of 0.5.  <br/>
 *   http://en.wikipedia.org/wiki/Cubic_Hermite_spline#Catmull.E2.80.93Rom_spline
 * </p>
 * @class
 * @extends cc.CardinalSplineTo
 *
 * @example
 * var action1 = cc.CatmullRomTo.create(3, array);
 */
cc.CatmullRomTo = cc.CardinalSplineTo.extend(/** @lends cc.CatmullRomTo# */{
    /**
     *  initializes the action with a duration and an array of points
     */
    initWithDuration:function (dt, points) {
        return this._super(dt, points, 0.5);
    }
});

/**
 * creates an action with a Cardinal Spline array of points and tension
 * @param {Number} dt
 * @param {cc.PointArray} points
 * @return {cc.CatmullRomTo}
 *
 * @example
 * var action1 = cc.CatmullRomTo.create(3, array);
 */
cc.CatmullRomTo.create = function (dt, points) {
    var ret = new cc.CatmullRomTo();
    if (ret.initWithDuration(dt, points))
        return ret;
    return null;
};

/**
 * <p>
 *   An action that moves the target with a CatmullRom curve by a certain distance.  <br/>
 *   A Catmull Rom is a Cardinal Spline with a tension of 0.5.<br/>
 *   http://en.wikipedia.org/wiki/Cubic_Hermite_spline#Catmull.E2.80.93Rom_spline
 * </p>
 * @class
 * @extends cc.CardinalSplineBy
 *
 * @example
 * var action1 = cc.CatmullRomBy.create(3, array);
 */
cc.CatmullRomBy = cc.CardinalSplineBy.extend({
    /** initializes the action with a duration and an array of points */
    initWithDuration:function (dt, points) {
        return this._super(dt, points, 0.5);
    }
});

/**
 * creates an action with a Cardinal Spline array of points and tension
 *
 * @example
 * var action1 = cc.CatmullRomBy.create(3, array);
 */
cc.CatmullRomBy.create = function (dt, points) {
    var ret = new cc.CatmullRomBy();
    if (ret.initWithDuration(dt, points))
        return ret;
    return null;
};
