/****************************************************************************
 Copyright (c) 2010-2012 cocos2d-x.org
 Copyright (c) 2008-2010 Ricardo Quesada
 Copyright (c) 2011      Zynga Inc.
 Copyright (c) 2012 Scott Lembcke and Howling Moon Software

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

/*
 IMPORTANT - READ ME!

 This file sets pokes around in the private API a lot to provide efficient
 debug rendering given nothing more than reference to a Chipmunk space.
 It is not recommended to write rendering code like this in your own games
 as the private API may change with little or no warning.
 */

// Helper. Converts an array of numbers into an array of vectors(x,y)
cc.__convertVerts = function (verts) {
    var ret = [];
    for (var i = 0; i < verts.length / 2; i++) {
        ret[i] = {x:verts[i * 2], y:verts[i * 2 + 1]};
    }
    return ret;
};

cc.ColorForBody = function (body) {
    if (body.isRogue() || body.isSleeping()) {
        return cc.c4f(0.5, 0.5, 0.5, 0.5);
    } else if (body.nodeIdleTime > body.space.sleepTimeThreshold) {
        return cc.c4f(0.33, 0.33, 0.33, 0.5);
    } else {
        return cc.c4f(1, 0, 0, 0.5);
    }
};

cc.DrawShape = function (shape, renderer) {
    var body = shape.body;
    var color = cc.ColorForBody(body);
    switch (shape.collisionCode) {
        case cp.CircleShape.prototype.collisionCode:
            this.drawDot(shape.tc, Math.max(shape.r, 1.0), color);
            this.drawSegment(shape.tc, cp.v.add(shape.tc, cp.v.mult(body.rot, shape.r)), 1.0, color);
            break;
        case cp.SegmentShape.prototype.collisionCode:
            this.drawSegment(shape.ta, shape.tb, Math.max(shape.r, 2.0), color);
            break;
        case cp.PolyShape.prototype.collisionCode:
            var line = cc.c4f(color.r, color.g, color.b, cc.lerp(color.a, 1.0, 0.5));
            this.drawPoly(cc.__convertVerts(shape.tVerts), color, 1.0, line);
            break;
        default:
            cc.log("cc.DrawShape(): Bad assertion in DrawShape()");
            break;
    }
};

cc.DrawConstraint = function (constraint, renderer) {
    var body_a = constraint.a;
    var body_b = constraint.b;
    var a, b;

    if (constraint instanceof cp.PinJoint) {
        a = body_a.local2World(constraint.anchr1);
        b = body_b.local2World(constraint.anchr2);
        this.drawDot(a, 3.0, cc.CONSTRAINT_COLOR);
        this.drawDot(b, 3.0, cc.CONSTRAINT_COLOR);
        this.drawSegment(a, b, 1.0, cc.CONSTRAINT_COLOR);
    } else if (constraint instanceof cp.SlideJoint) {
        a = body_a.local2World(constraint.anchr1);
        b = body_b.local2World(constraint.anchr2);

        this.drawDot(a, 3.0, cc.CONSTRAINT_COLOR);
        this.drawDot(b, 3.0, cc.CONSTRAINT_COLOR);
        this.drawSegment(a, b, 1.0, cc.CONSTRAINT_COLOR);
    } else if (constraint instanceof cp.PivotJoint) {
        a = body_a.local2World(constraint.anchr1);
        b = body_b.local2World(constraint.anchr2);
        this.drawDot(a, 3.0, cc.CONSTRAINT_COLOR);
        this.drawDot(b, 3.0, cc.CONSTRAINT_COLOR);
    } else if (constraint instanceof cp.GrooveJoint) {
        a = body_a.local2World(constraint.grv_a);
        b = body_a.local2World(constraint.grv_b);
        var c = body_b.local2World(constraint.anchr2);

        this.drawDot(c, 3.0, cc.CONSTRAINT_COLOR);
        this.drawSegment(a, b, 1.0, cc.CONSTRAINT_COLOR);
    } else if (constraint instanceof cp.DampedSpring) {
        // TODO
    } else {
        //printf("Cannot draw constraint\n");
    }
};

cc.CONSTRAINT_COLOR = cc.c4f(0, 1, 0, 0.5);

/**
 A Node that draws the components of a physics engine.
 Supported physics engines:
 - Chipmunk
 - Objective-Chipmunk
 */
cc.PhysicsDebugNode = cc.DrawNode.extend({
    _spaceObj:null,
    _spacePtr:null,

    getSpace:function () {
        return this._spacePtr;
    },

    setSpace:function (space) {
        this._spacePtr = space;
    },

    draw:function (context) {
        if (!this._spacePtr)
            return;

        this._spacePtr.eachShape(cc.DrawShape.bind(this));
        this._spacePtr.eachConstraint(cc.DrawConstraint.bind(this));
        cc.DrawNode.prototype.draw.call(this);
        this.clear();
    }
});

/** Create a debug node for an Objective-Chipmunk space. */
cc.PhysicsDebugNode.debugNodeForChipmunkSpace = function (space) {
    var node = new cc.PhysicsDebugNode();
    if (node.init()) {
        node._spaceObj = space;
        node._spacePtr = space.space;
        return node;
    }
    return null;
};

/** Create a debug node for a regular Chipmunk space. */
cc.PhysicsDebugNode.debugNodeForCPSpace = function (space) {
    var node = new cc.PhysicsDebugNode();
    if (node.init()) {
        node._spacePtr = space;
        return node;
    }
    return null;
};

cc.PhysicsDebugNode.create = cc.PhysicsDebugNode.debugNodeForCPSpace;

