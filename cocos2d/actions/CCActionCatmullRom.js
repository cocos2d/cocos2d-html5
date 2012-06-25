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

/** Returns the Cardinal Spline position for a given set of control points, tension and time
 * CatmullRom Spline formula:
 * */
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

    return new cc.Point(x, y);
};

/** An Array that contain control points.
 Used by CCCardinalSplineTo and (By) and CCCatmullRomTo (and By) actions.
 @ingroup Actions
 */
cc.PointArray = cc.Node.extend({
    /** Array that contains the control points */
    _controlPoints:null,

    ctor:function () {
        this._controlPoints = [];
    },

    /** appends a control point */
    addControlPoint:function (controlPoint) {
        // should create a new object of cc.Point
        // because developer always use this function like this
        // addControlPoint(ccp(x, y))
        // passing controlPoint is a temple object
        var temp = new cc.Point(controlPoint.x, controlPoint.y);
        this._controlPoints.push(temp);
    },

    /** inserts a controlPoint at index */
    insertControlPoint:function (controlPoint, index) {
        // should create a new object of cc.Point
        // because developer always use this function like this
        // insertControlPoint(ccp(x, y))
        // passing controlPoint is a temple object
        var temp = new cc.Point(controlPoint.x, controlPoint.y);
        this._controlPoints = cc.ArrayAppendObjectToIndex(this._controlPoints, temp, index);
    },

    /** replaces an existing controlPoint at index */
    replaceControlPoint:function (controlPoint, index) {
        // should create a new object of cc.Point
        // because developer always use this function like this
        // replaceControlPoint(ccp(x, y))
        // passing controlPoint is a temple object
        this._controlPoints[index] = new cc.Point(controlPoint.x, controlPoint.y);
    },

    /** get the value of a controlPoint at a given index */
    getControlPointAtIndex:function (index) {
        if (!this._controlPoints) {
            return null;
        }
        index = index <0?0:index;
        index = index > this._controlPoints.length-1?this._controlPoints.length-1:index;
        return this._controlPoints[index];
    },

    /** deletes a control point at a given index */
    removeControlPointAtIndex:function (index) {
        cc.ArrayRemoveObjectAtIndex(this._controlPoints, index);
    },

    /** returns the number of objects of the control point array */
    count:function () {
        return this._controlPoints.length;
    },

    /** returns a new copy of the array reversed. User is responsible for releasing this copy */
    reverse:function () {
        var newArray = [];
        for (var i = this._controlPoints.length - 1; i >= 0; i--) {
            newArray.push(new cc.Point(this._controlPoints[i].x, this._controlPoints[i].y));
        }
        var config = new cc.PointArray();
        config.setControlPoints(newArray);
        return config;
    },

    /** reverse the current control point array inline, without generating a new one */
    reverseInline:function () {
        var len = this._controlPoints.length;
        var mid = 0 | (len / 2);
        for (var i = 0; i < mid; ++i) {
            var temp = this._controlPoints[i];
            this._controlPoints[i] = this._controlPoints[len - i - 1];
            this._controlPoints[len - i - 1] = temp;
        }
    },

    copyWithZone:function (zone) {
        var newArray = [];
        var newPoints = new cc.PointArray();
        for (var i = 0; i < this._controlPoints.length; i++) {
            newArray.push(new cc.Point(this._controlPoints[i].x, this._controlPoints[i].y));
        }
        newPoints.setControlPoints(newArray);
        return newPoints;
    },

    getControlPoints:function () {
        return this._controlPoints;
    },

    setControlPoints:function (controlPoints) {
        this._controlPoints = controlPoints;
    }
});

/** creates and initializes a Points array with capacity */
cc.PointArray.create = function (capacity) {
    return new cc.PointArray();
};


/** Cardinal Spline path.
 http://en.wikipedia.org/wiki/Cubic_Hermite_spline#Cardinal_spline
 @ingroup Actions
 */
cc.CardinalSplineTo = cc.ActionInterval.extend({
    /** Array of control points */
    _points:null,
    _deltaT:0,
    _tension:0,

    ctor:function () {
        this._points = new cc.PointArray();
    },

    /** initializes the action with a duration and an array of points */
    initWithDuration:function (duration, points, tension) {
        cc.Assert(points.count() > 0, "Invalid configuration. It must at least have one control point");
        if (this._super(duration)) {
            this.setPoints(points);
            this._tension = tension;
            return true;
        }
        return false;
    },

    startWithTarget:function (target) {
        this._super(target);
        this._deltaT = 1 / this._points.count();
    },

    update:function (time) {
        var p,lt;

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

    reverse:function () {
        var reversePoints = this._points.reverse();
        return cc.CardinalSplineTo.create(this._duration, reversePoints, this._tension);
    },

    updatePosition:function (newPos) {
        this._target.setPosition(newPos);
    },

    getPoints:function () {
        return this._points;
    },

    setPoints:function (points) {
        this._points = points;
    }
});

/** creates an action with a Cardinal Spline array of points and tension */
cc.CardinalSplineTo.create = function (duration, points, tension) {
    var ret = new cc.CardinalSplineTo();
    if (ret.initWithDuration(duration, points, tension)) {
        return ret;
    }
    return null;
};

/** Cardinal Spline path.
 http://en.wikipedia.org/wiki/Cubic_Hermite_spline#Cardinal_spline
 @ingroup Actions
 */
cc.CardinalSplineBy = cc.CardinalSplineTo.extend({
    _startPosition:null,

    ctor:function () {
        this._startPosition = new cc.Point(0, 0);
    },

    startWithTarget:function (target) {
        this._super(target);
        this._startPosition = target.getPosition();
    },

    reverse:function () {
        var copyConfig = this._points.copyWithZone(null);
        var current;
        //
        // convert "absolutes" to "diffs"
        //
        var p = copyConfig.getControlPointAtIndex(0);
        for (var i = 1; i < copyConfig.count(); ++i) {
            current = copyConfig.getControlPointAtIndex(i);
            var diff = cc.ccpSub(current, p);
            copyConfig.replaceControlPoint(diff, i);
            p = current;
        }

        // convert to "diffs" to "reverse absolute"
        var reverseArray = copyConfig.reverse();

        // 1st element (which should be 0,0) should be here too
        p = reverseArray.getControlPointAtIndex(reverseArray.count()-1);
        reverseArray.removeControlPointAtIndex(reverseArray.count()-1);

        p = cc.ccpNeg(p);
        reverseArray.insertControlPoint(p, 0);
        for (i = 1; i < reverseArray.count(); ++i) {
            current = reverseArray.getControlPointAtIndex(i);
            current = cc.ccpNeg(current);
            var abs = cc.ccpAdd(current, p);
            reverseArray.replaceControlPoint(abs, i);
            p = abs;
        }
        return cc.CardinalSplineBy.create(this._duration, reverseArray, this._tension);
    },

    updatePosition:function (newPos) {
        this._target.setPosition(cc.ccpAdd(newPos, this._startPosition));
    }
});

/** creates an action with a Cardinal Spline array of points and tension */
cc.CardinalSplineBy.create = function (duration, points, tension) {
   var ret = new cc.CardinalSplineBy();
    if(ret.initWithDuration(duration,points,tension))
        return ret;
    return null;
};

/** An action that moves the target with a CatmullRom curve to a destination point.
 A Catmull Rom is a Cardinal Spline with a tension of 0.5.
 http://en.wikipedia.org/wiki/Cubic_Hermite_spline#Catmull.E2.80.93Rom_spline
 @ingroup Actions
 */
cc.CatmullRomTo = cc.CardinalSplineTo.extend({
    /** initializes the action with a duration and an array of points */
    initWithDuration:function (dt, points) {
       return this._super(dt,points,0.5);
    }
});

/** creates an action with a Cardinal Spline array of points and tension */
cc.CatmullRomTo.create = function (dt, points) {
   var ret = new cc.CatmullRomTo();
    if(ret.initWithDuration(dt,points))
        return ret;
    return null;
};

/** An action that moves the target with a CatmullRom curve by a certain distance.
 A Catmull Rom is a Cardinal Spline with a tension of 0.5.
 http://en.wikipedia.org/wiki/Cubic_Hermite_spline#Catmull.E2.80.93Rom_spline
 @ingroup Actions
 */
cc.CatmullRomBy = cc.CardinalSplineBy.extend({
    /** initializes the action with a duration and an array of points */
    initWithDuration:function (dt, points) {
        return this._super(dt,points,0.5);
    }
});

/** creates an action with a Cardinal Spline array of points and tension */
cc.CatmullRomBy.create = function (dt, points) {
    var ret = new cc.CatmullRomBy();
    if(ret.initWithDuration(dt,points))
        return ret;
    return null;
};