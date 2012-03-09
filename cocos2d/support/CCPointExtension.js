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

var CC = CC = CC || {};
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

CC.kCCPointEpsilon = parseFloat('1.192092896e-07F');

/** Helper macro that creates a CCPoint
 @return CCPoint
 @since v0.7.2
 */
CC.ccp = function(x,y){
    return CC.CCPointMake(x,y);
};

/** Returns opposite of point.
 @return CCPoint
 @since v0.7.2
 */
CC.ccpNeg = function(vPoint){
    return CC.ccp(-vPoint.x,-vPoint.y);
};

/** Calculates sum of two points.
 @return CCPoint
 @since v0.7.2
 */
CC.ccpAdd = function(v1,v2){
    return CC.ccp(v1.x + v2.x,v1.y + v2.y);
};

/** Calculates difference of two points.
 @return CCPoint
 @since v0.7.2
 */
CC.ccpSub = function(v1,v2){
    return CC.ccp(v1.x - v2.x,v1.y -v2.y);
};

/** Returns point multiplied by given factor.
 @return CCPoint
 @since v0.7.2
 */
CC.ccpMult = function(vPoint,sFloat){
    return CC.ccp(vPoint.x * sFloat,vPoint.y * sFloat);
};

/** Calculates midpoint between two points.
 @return CCPoint
 @since v0.7.2
 */
CC.ccpMidpoint = function(v1,v2){
    return CC.ccpMult(CC.ccpAdd(v1,v2),0.5);
};

/** Calculates dot product of two points.
 @return CGFloat
 @since v0.7.2
 */
CC.ccpDot = function(v1,v2){
    return v1.x * v2.x + v1.y * v2.y;
};

/** Calculates cross product of two points.
 @return CGFloat
 @since v0.7.2
 */
CC.ccpCross = function(v1,v2){
    return v1.x * v2.y - v1.y * v2.x;
};

/** Calculates perpendicular of v, rotated 90 degrees counter-clockwise -- cross(v, perp(v)) >= 0
 @return CCPoint
 @since v0.7.2
 */
CC.ccpPerp = function(vPoint){
    return CC.ccp(-vPoint.y,vPoint.x);
};

/** Calculates perpendicular of v, rotated 90 degrees clockwise -- cross(v, rperp(v)) <= 0
 @return CCPoint
 @since v0.7.2
 */
CC.ccpRPerp = function(vPoint){
    return CC.ccp(vPoint.y,-vPoint.x);
};

/** Calculates the projection of v1 over v2.
 @return CCPoint
 @since v0.7.2
 */
CC.ccpProject = function(v1,v2){
    return CC.ccpMult(v2,CC.ccpDot(v1,v2)/CC.ccpDot(v2,v2));
};

/** Rotates two points.
 @return CCPoint
 @since v0.7.2
 */
CC.ccpRotate = function(v1,v2){
    return CC.ccp(v1.x*v2.x - v1.y*v2.y, v1.x*v2.y + v1.y*v2.x);
};

/** Unrotates two points.
 @return CCPoint
 @since v0.7.2
 */
CC.ccpUnrotate = function(v1,v2){
    return CC.ccp(v1.x*v2.x + v1.y*v2.y, v1.y*v2.x - v1.x*v2.y);
};

/** Calculates the square length of a CCPoint (not calling sqrt() )
 @return CGFloat
 @since v0.7.2
 */
CC.ccpLengthSQ = function(v){
    return CC.ccpDot(v, v);
};

/** Calculates distance between point an origin
 @return CGFloat
 @since v0.7.2
 */
CC.ccpLength = function(v){
    return Math.sqrt(CC.ccpLengthSQ(v));
};

/** Calculates the distance between two points
 @return CGFloat
 @since v0.7.2
 */
CC.ccpDistance = function(v1,v2){
    return CC.ccpLength(CC.ccpSub(v1, v2));
};

/** Returns point multiplied to a length of 1.
 @return CCPoint
 @since v0.7.2
 */
CC.ccpNormalize = function(v){
    return CC.ccpMult(v, 1.0/CC.ccpLength(v));
};

/** Converts radians to a normalized vector.
 @return CCPoint
 @since v0.7.2
 */
CC.ccpForAngle = function(a){
    return CC.ccp(Math.cos(a), Math.sin(a));
};

/** Converts a vector to radians.
 @return CGFloat
 @since v0.7.2
 */
CC.ccpToAngle = function(v){
    return Math.atan2(v.y, v.x);
};

/** Clamp a value between from and to.
 @since v0.99.1
 */
CC.clampf = function(value,min_inclusive,max_inclusive){
    if (min_inclusive > max_inclusive) {
        //CC.CC_SWAP(min_inclusive, max_inclusive,ref);
        var temp = min_inclusive;
        min_inclusive = max_inclusive;
        max_inclusive = temp;
    }
    return value < min_inclusive ? min_inclusive : value < max_inclusive? value : max_inclusive;
};

/** Clamp a point between from and to.
 @since v0.99.1
 */
CC.ccpClamp = function(p,min_inclusive,max_inclusive){
    return CC.ccp(CC.clampf(p.x,min_inclusive.x,max_inclusive.x), CC.clampf(p.y, min_inclusive.y, max_inclusive.y));
};

/** Quickly convert CCSize to a CCPoint
 @since v0.99.1
 */
CC.ccpFromSize = function(s){
    return CC.ccp(s.width, s.height);
};

/** Run a math operation function on each point component
 * absf, fllorf, ceilf, roundf
 * any function that has the signature: float func(float);
 * For example: let's try to take the floor of x,y
 * ccpCompOp(p,floorf);
 @since v0.99.1
 */
CC.ccpCompOp = function(p,opFunc){
    return CC.ccp(opFunc(p.x), opFunc(p.y));
};

/** Linear Interpolation between two points a and b
 @returns
     alpha == 0 ? a
 alpha == 1 ? b
 otherwise a value between a..b
 @since v0.99.1
 */
CC.ccpLerp = function(a,b,alpha){
    return CC.ccpAdd(CC.ccpMult(a, 1 - alpha), CC.ccpMult(b, alpha));
};

/** @returns if points have fuzzy equality which means equal with some degree of variance.
 @since v0.99.1
 */
CC.ccpFuzzyEqual = function(a,b,variance){
    if(a.x - variance <= b.x && b.x <= a.x + variance){
        if(a.y - variance <= b.y && b.y <= a.y + variance){
            return true;
        }
    }
    return false;
};

/** Multiplies a nd b components, a.x*b.x, a.y*b.y
 @returns a component-wise multiplication
 @since v0.99.1
 */
CC.ccpCompMult = function(a,b){
    return CC.ccp(a.x * b.x, a.y * b.y);
};

/** @returns the signed angle in radians between two vector directions
 @since v0.99.1
 */
CC.ccpAngleSigned = function(a,b){
    var a2 = CC.ccpNormalize(a);
    var b2 = CC.ccpNormalize(b);
    var angle = Math.atan2(a2.x * b2.y - a2.y * b2.x, CC.ccpDot(a2, b2));
    if( Math.abs(angle) < CC.kCCPointEpsilon ){
        return 0.0;
    }
    return angle;
};

/** @returns the angle in radians between two vector directions
 @since v0.99.1
 */
CC.ccpAngle = function(a,b){
    var angle = Math.acos(CC.ccpDot(CC.ccpNormalize(a), CC.ccpNormalize(b)));
    if( Math.abs(angle) < CC.kCCPointEpsilon ) return 0.0;
    return angle;
};

/** Rotates a point counter clockwise by the angle around a pivot
 @param v is the point to rotate
 @param pivot is the pivot, naturally
 @param angle is the angle of rotation cw in radians
 @returns the rotated point
 @since v0.99.1
 */
CC.ccpRotateByAngle = function(v,pivot,angle){
    var r = CC.ccpSub(v, pivot);
    var cosa = Math.cos(angle), sina = Math.sin(angle);
    var t = r.x;
    r.x = t*cosa - r.y*sina + pivot.x;
    r.y = t*sina + r.y*cosa + pivot.y;
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
 the hit point is		p3 + t * (p4 - p3);
 the hit point also is	p1 + s * (p2 - p1);
 @since v0.99.1
 */
CC.ccpLineIntersect = function(A,B,C,D,retP){
// FAIL: Line undefined
    if ( (A.x==B.x && A.y==B.y) || (C.x==D.x && C.y==D.y) ) {
        return false;
    }
    var BAx = B.x - A.x;
    var BAy = B.y - A.y;
    var DCx = D.x - C.x;
    var DCy = D.y - C.y;
    var ACx = A.x - C.x;
    var ACy = A.y - C.y;

    var denom = DCy*BAx - DCx*BAy;

    retP.x = DCx*ACy - DCy*ACx;
    retP.y = BAx*ACy - BAy*ACx;

    if (denom == 0){
        if (retP.x == 0 || retP.y == 0){
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
CC.ccpSegmentIntersect = function(A,B,C,D){
    var retP = new CC.CCPoint();

    if(CC.ccpLineIntersect(A, B, C, D, retP ))
        if(retP.x >= 0.0 && retP.x <= 1.0 && retP.y >= 0.0&& retP.y <= 1.0)
            return true;

    return false;
};

/*
 ccpIntersectPoint returns the intersection point of line A-B, C-D
 @since v1.0.0
 */
CC.ccpIntersectPoint = function(A,B,C,D){
    var retP = new CC.CCPoint();

    if( CC.ccpLineIntersect(A, B, C, D, retP) ){
        // Point of intersection
        var P = new CC.CCPoint();
        P.x = A.x + retP.x * (B.x - A.x);
        P.y = A.y + retP.x * (B.y - A.y);
        return P;
    }

    return CC.CCPointZero;
};