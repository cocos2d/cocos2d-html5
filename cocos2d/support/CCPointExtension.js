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
/**
 @file
 CCPoint extensions based on Chipmunk's cpVect file.
 These extensions work both with CCPoint and cpVect.

 The "ccp" prefix means: "CoCos2d Point"

 Examples:
 - ccpAdd( ccp(1,1), ccp(2,2) ); // preferred cocos2d way
 - ccpAdd( CCPointMake(1,1), CCPointMake(2,2) ); // also ok but more verbose

 - cpvadd( cpv(1,1), cpv(2,2) ); // way of the chipmunk
 - ccpAdd( cpv(1,1), cpv(2,2) ); // mixing chipmunk and cocos2d (avoid)
 - cpvadd( CCPointMake(1,1), CCPointMake(2,2) ); // mixing chipmunk and CG (avoid)
 */

cc.CCPOINT_EPSILON = parseFloat('1.192092896e-07F');

/** Helper macro that creates a CCPoint
 @return CCPoint
 @since v0.7.2
 */
cc.ccp = function (x, y) {
    return new cc.Point(x, y);
};

/** Returns opposite of point.
 @return CCPoint
 @since v0.7.2
 */
cc.ccpNeg = function (point) {
    return new cc.Point(-point.x, -point.y);
};

/** Calculates sum of two points.
 @return CCPoint
 @since v0.7.2
 */
cc.ccpAdd = function (v1, v2) {
    return new cc.Point(v1.x + v2.x, v1.y + v2.y);
};

/** Calculates difference of two points.
 @return CCPoint
 @since v0.7.2
 */
cc.ccpSub = function (v1, v2) {
    return new cc.Point(v1.x - v2.x, v1.y - v2.y);
};

/** Returns point multiplied by given factor.
 @return CCPoint
 @since v0.7.2
 */
cc.ccpMult = function (point, float) {
    return new cc.Point(point.x * float, point.y * float);
};

/** Calculates midpoint between two points.
 @return CCPoint
 @since v0.7.2
 */
cc.ccpMidpoint = function (v1, v2) {
    return cc.ccpMult(cc.ccpAdd(v1, v2), 0.5);
};

/** Calculates dot product of two points.
 @return CGFloat
 @since v0.7.2
 */
cc.ccpDot = function (v1, v2) {
    return v1.x * v2.x + v1.y * v2.y;
};

/** Calculates cross product of two points.
 @return CGFloat
 @since v0.7.2
 */
cc.ccpCross = function (v1, v2) {
    return v1.x * v2.y - v1.y * v2.x;
};

/** Calculates perpendicular of v, rotated 90 degrees counter-clockwise -- cross(v, perp(v)) >= 0
 @return CCPoint
 @since v0.7.2
 */
cc.ccpPerp = function (point) {
    return new cc.Point(-point.y, point.x);
};

/** Calculates perpendicular of v, rotated 90 degrees clockwise -- cross(v, rperp(v)) <= 0
 @return CCPoint
 @since v0.7.2
 */
cc.ccpRPerp = function (point) {
    return new cc.Point(point.y, -point.x);
};

/** Calculates the projection of v1 over v2.
 @return CCPoint
 @since v0.7.2
 */
cc.ccpProject = function (v1, v2) {
    return cc.ccpMult(v2, cc.ccpDot(v1, v2) / cc.ccpDot(v2, v2));
};

/** Rotates two points.
 @return CCPoint
 @since v0.7.2
 */
cc.ccpRotate = function (v1, v2) {
    return new cc.Point(v1.x * v2.x - v1.y * v2.y, v1.x * v2.y + v1.y * v2.x);
};

/** Unrotates two points.
 @return CCPoint
 @since v0.7.2
 */
cc.ccpUnrotate = function (v1, v2) {
    return new cc.Point(v1.x * v2.x + v1.y * v2.y, v1.y * v2.x - v1.x * v2.y);
};

/** Calculates the square length of a CCPoint (not calling sqrt() )
 @return CGFloat
 @since v0.7.2
 */
cc.ccpLengthSQ = function (v) {
    return cc.ccpDot(v, v);
};

/** Calculates distance between point an origin
 @return CGFloat
 @since v0.7.2
 */
cc.ccpLength = function (v) {
    return Math.sqrt(cc.ccpLengthSQ(v));
};

/** Calculates the distance between two points
 @return CGFloat
 @since v0.7.2
 */
cc.ccpDistance = function (v1, v2) {
    return cc.ccpLength(cc.ccpSub(v1, v2));
};

/** Returns point multiplied to a length of 1.
 @return CCPoint
 @since v0.7.2
 */
cc.ccpNormalize = function (v) {
    return cc.ccpMult(v, 1.0 / cc.ccpLength(v));
};

/** Converts radians to a normalized vector.
 @return CCPoint
 @since v0.7.2
 */
cc.ccpForAngle = function (a) {
    return new cc.Point(Math.cos(a), Math.sin(a));
};

/** Converts a vector to radians.
 @return CGFloat
 @since v0.7.2
 */
cc.ccpToAngle = function (v) {
    return Math.atan2(v.y, v.x);
};

/** Clamp a value between from and to.
 @since v0.99.1
 */
cc.clampf = function (value, min_inclusive, max_inclusive) {
    if (min_inclusive > max_inclusive) {
        //cc.SWAP(min_inclusive, max_inclusive,ref);
        var temp = min_inclusive;
        min_inclusive = max_inclusive;
        max_inclusive = temp;
    }
    return value < min_inclusive ? min_inclusive : value < max_inclusive ? value : max_inclusive;
};

/** Clamp a point between from and to.
 @since v0.99.1
 */
cc.ccpClamp = function (p, min_inclusive, max_inclusive) {
    return new cc.Point(cc.clampf(p.x, min_inclusive.x, max_inclusive.x), cc.clampf(p.y, min_inclusive.y, max_inclusive.y));
};

/** Quickly convert CCSize to a CCPoint
 @since v0.99.1
 */
cc.ccpFromSize = function (s) {
    return new cc.Point(s.width, s.height);
};

/** Run a math operation function on each point component
 * absf, fllorf, ceilf, roundf
 * any function that has the signature: float func(float);
 * For example: let's try to take the floor of x,y
 * ccpCompOp(p,floorf);
 @since v0.99.1
 */
cc.ccpCompOp = function (p, opFunc) {
    return new cc.Point(opFunc(p.x), opFunc(p.y));
};

/** Linear Interpolation between two points a and b
 @returns
     alpha == 0 ? a
 alpha == 1 ? b
 otherwise a value between a..b
 @since v0.99.1
 */
cc.ccpLerp = function (a, b, alpha) {
    return cc.ccpAdd(cc.ccpMult(a, 1 - alpha), cc.ccpMult(b, alpha));
};

/** @returns if points have fuzzy equality which means equal with some degree of variance.
 @since v0.99.1
 */
cc.ccpFuzzyEqual = function (a, b, variance) {
    if (a.x - variance <= b.x && b.x <= a.x + variance) {
        if (a.y - variance <= b.y && b.y <= a.y + variance) {
            return true;
        }
    }
    return false;
};

/** Multiplies a nd b components, a.x*b.x, a.y*b.y
 @returns a component-wise multiplication
 @since v0.99.1
 */
cc.ccpCompMult = function (a, b) {
    return new cc.Point(a.x * b.x, a.y * b.y);
};

/** @returns the signed angle in radians between two vector directions
 @since v0.99.1
 */
cc.ccpAngleSigned = function (a, b) {
    var a2 = cc.ccpNormalize(a);
    var b2 = cc.ccpNormalize(b);
    var angle = Math.atan2(a2.x * b2.y - a2.y * b2.x, cc.ccpDot(a2, b2));
    if (Math.abs(angle) < cc.CCPOINT_EPSILON) {
        return 0.0;
    }
    return angle;
};

/** @returns the angle in radians between two vector directions
 @since v0.99.1
 */
cc.ccpAngle = function (a, b) {
    var angle = Math.acos(cc.ccpDot(cc.ccpNormalize(a), cc.ccpNormalize(b)));
    if (Math.abs(angle) < cc.CCPOINT_EPSILON) return 0.0;
    return angle;
};

/** Rotates a point counter clockwise by the angle around a pivot
 @param v is the point to rotate
 @param pivot is the pivot, naturally
 @param angle is the angle of rotation cw in radians
 @returns the rotated point
 @since v0.99.1
 */
cc.ccpRotateByAngle = function (v, pivot, angle) {
    var r = cc.ccpSub(v, pivot);
    var cosa = Math.cos(angle), sina = Math.sin(angle);
    var t = r.x;
    r.x = t * cosa - r.y * sina + pivot.x;
    r.y = t * sina + r.y * cosa + pivot.y;
    return r;
};

/** A general line-line intersection test
 @param A
 is the startpoint for the first line P1 = (p1 - p2)
 @param B
 is the endpoint for the first line P1 = (p1 - p2)
 @param C
 is the startpoint for the second line P2 = (p3 - p4)
 @param D
 is the endpoint for the second line P2 = (p3 - p4)
 @param retP
 retP.x is the range for a hitpoint in P1 (pa = p1 + s*(p2 - p1))
 retP.y is the range for a hitpoint in P3 (pa = p2 + t*(p4 - p3))
 @return bool
 indicating successful intersection of a line
 note that to truly test intersection for segments we have to make
 sure that s & t lie within [0..1] and for rays, make sure s & t > 0
 the hit point is        p3 + t * (p4 - p3);
 the hit point also is    p1 + s * (p2 - p1);
 @since v0.99.1
 */
cc.ccpLineIntersect = function (A, B, C, D, retP) {
// FAIL: Line undefined
    if ((A.x == B.x && A.y == B.y) || (C.x == D.x && C.y == D.y)) {
        return false;
    }
    var BAx = B.x - A.x;
    var BAy = B.y - A.y;
    var DCx = D.x - C.x;
    var DCy = D.y - C.y;
    var ACx = A.x - C.x;
    var ACy = A.y - C.y;

    var denom = DCy * BAx - DCx * BAy;

    retP.x = DCx * ACy - DCy * ACx;
    retP.y = BAx * ACy - BAy * ACx;

    if (denom == 0) {
        if (retP.x == 0 || retP.y == 0) {
            // Lines incident
            return true;
        }
        // Lines parallel and not incident
        return false;
    }

    retP.x = retP.x / denom;
    retP.y = retP.y / denom;

    // Point of intersection
    // CGPoint P;
    // P.x = A.x + *S * (B.x - A.x);
    // P.y = A.y + *S * (B.y - A.y);

    return true;
};

/*
 ccpSegmentIntersect returns YES if Segment A-B intersects with segment C-D
 @since v1.0.0
 */
cc.ccpSegmentIntersect = function (A, B, C, D) {
    var retP = new cc.Point();

    if (cc.ccpLineIntersect(A, B, C, D, retP))
        if (retP.x >= 0.0 && retP.x <= 1.0 && retP.y >= 0.0 && retP.y <= 1.0)
            return true;

    return false;
};

/*
 ccpIntersectPoint returns the intersection point of line A-B, C-D
 @since v1.0.0
 */
cc.ccpIntersectPoint = function (A, B, C, D) {
    var retP = new cc.Point();

    if (cc.ccpLineIntersect(A, B, C, D, retP)) {
        // Point of intersection
        var P = new cc.Point();
        P.x = A.x + retP.x * (B.x - A.x);
        P.y = A.y + retP.x * (B.y - A.y);
        return P;
    }

    return cc.PointZero();
};
/** check to see if both points are equal
 @param A ccp a
 @param B ccp b to be compared
 @returns the true if both ccp are same
 */
cc.ccpSameAs = function(A,B){
    if(A.x && B.x){
        return (A.x == B.x && A.y == B.y);
    }
    return false;
};