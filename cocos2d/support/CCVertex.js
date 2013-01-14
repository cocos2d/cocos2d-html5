/****************************************************************************
 Copyright (c) 2010-2012 cocos2d-x.org
 Copyright (c) 2009      Valentin Milea

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

/** converts a line to a polygon */
cc.vertexLineToPolygon = function (points, stroke, vertices, offset, nuPoints) {
    nuPoints += offset;
    if (nuPoints <= 1) return;

    stroke *= 0.5;

    var idx;
    var nuPointsMinus = nuPoints - 1;

    for (var i = offset; i < nuPoints; i++) {
        idx = i * 2;
        var perpVector;

        if (i == 0)
            perpVector = cc.pPerp(cc.pNormalize(cc.pSub(points[i], points[i + 1])));
        else if (i == nuPointsMinus)
            perpVector = cc.pPerp(cc.pNormalize(cc.pSub(points[i - 1], points[i])));
        else {
            var p0 = points[i - 1];

            var p2p1 = cc.pNormalize(cc.pSub(points[i + 1], points[i]));
            var p0p1 = cc.pNormalize(cc.pSub(p0, points[i]));

            // Calculate angle between vectors
            var angle = Math.acos(cc.pDot(p2p1, p0p1));

            if (angle < cc.DEGREES_TO_RADIANS(70))
                perpVector = cc.pPerp(cc.pNormalize(cc.pMidpoint(p2p1, p0p1)));
            else if (angle < cc.DEGREES_TO_RADIANS(170))
                perpVector = cc.pNormalize(cc.pMidpoint(p2p1, p0p1));
            else
                perpVector = cc.pPerp(cc.pNormalize(cc.pSub(points[i + 1], p0)));
        }
        perpVector = cc.pMult(perpVector, stroke);

        vertices[idx] = new cc.Vertex2F(points[i].x + perpVector.x, points[i].y + perpVector.y);
        vertices[idx + 1] = new cc.Vertex2F(points[i].x - perpVector.x, points[i].y - perpVector.y);
    }

    // Validate vertexes
    offset = (offset == 0) ? 0 : offset - 1;
    for (i = offset; i < nuPointsMinus; i++) {
        idx = i * 2;
        var idx1 = idx + 2;

        var p2 = vertices[idx + 1];
        var p3 = vertices[idx1];
        var p4 = vertices[idx1 + 1];

        //BOOL fixVertex = !ccpLineIntersect(ccp(p1.x, p1.y), ccp(p4.x, p4.y), ccp(p2.x, p2.y), ccp(p3.x, p3.y), &s, &t);
        var fixVertexResult = !cc.vertexLineIntersect(vertices[idx].x, vertices[idx].y, p4.x, p4.y, p2.x, p2.y, p3.x, p3.y);
        if (!fixVertexResult.isSuccess)
            if (fixVertexResult.value < 0.0 || fixVertexResult.value > 1.0)
                fixVertexResult.isSuccess = true;

        if (fixVertexResult.isSuccess) {
            vertices[idx1] = p4;
            vertices[idx1 + 1] = p3;
        }
    }
};

/** returns wheter or not the line intersects */
cc.vertexLineIntersect = function (Ax, Ay, Bx, By, Cx, Cy, Dx, Dy) {
    var distAB, theCos, theSin, newX;

    // FAIL: Line undefined
    if ((Ax == Bx && Ay == By) || (Cx == Dx && Cy == Dy))
        return {isSuccess:false, value:0};

    //  Translate system to make A the origin
    Bx -= Ax;
    By -= Ay;
    Cx -= Ax;
    Cy -= Ay;
    Dx -= Ax;
    Dy -= Ay;

    // Length of segment AB
    distAB = Math.sqrt(Bx * Bx + By * By);

    // Rotate the system so that point B is on the positive X axis.
    theCos = Bx / distAB;
    theSin = By / distAB;
    newX = Cx * theCos + Cy * theSin;
    Cy = Cy * theCos - Cx * theSin;
    Cx = newX;
    newX = Dx * theCos + Dy * theSin;
    Dy = Dy * theCos - Dx * theSin;
    Dx = newX;

    // FAIL: Lines are parallel.
    if (Cy == Dy) return {isSuccess:false, value:0};

    // Discover the relative position of the intersection in the line AB
    var t = (Dx + (Cx - Dx) * Dy / (Dy - Cy)) / distAB;

    // Success.
    return {isSuccess:false, value:t};
};