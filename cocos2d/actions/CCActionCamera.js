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
 @brief Base class for cc.Camera actions
 */
cc.ActionCamera = cc.ActionInterval.extend({
    centerXOrig:0,
    centerYOrig:0,
    centerZOrig:0,
    eyeXOrig:0,
    eyeYOrig:0,
    eyeZOrig:0,
    upXOrig:0,
    upYOrig:0,
    upZOrig:0,
    // super methods
    startWithTarget:function (target) {
        this._super(target);

        var camera = target.getCamera();
        camera.getCenterXYZ(this.centerXOrig, this.centerYOrig, this.centerZOrig);
        camera.getEyeXYZ(this.eyeXOrig, this.eyeYOrig, this.eyeZOrig);
        camera.getUpXYZ(this.upXOrig, this.upYOrig, this.upZOrig);
    },
    reverse:function () {
        return cc.ReverseTime.create(this);
    }
});

/**
 @brief cc.OrbitCamera action
 Orbits the camera around the center of the screen using spherical coordinates
 */
cc.OrbitCamera = cc.ActionCamera.extend({
    radius:0.0,
    deltaRadius:0.0,
    angleZ:0.0,
    deltaAngleZ:0.0,
    angleX:0.0,
    deltaAngleX:0.0,
    radZ:0.0,
    radDeltaZ:0.0,
    radX:0.0,
    radDeltaX:0.0,

    /** initializes a cc.OrbitCamera action with radius, delta-radius,  z, deltaZ, x, deltaX */
    initWithDuration:function (t, radius, deltaRadius, angleZ, deltaAngleZ, angleX, deltaAngleX) {
        if (this._super(t)) {
            this.radius = radius;
            this.deltaRadius = deltaRadius;
            this.angleZ = angleZ;
            this.deltaAngleZ = deltaAngleZ;
            this.angleX = angleX;
            this.deltaAngleX = deltaAngleX;

            this.radDeltaZ = cc.DEGREES_TO_RADIANS(deltaAngleZ);
            this.radDeltaX = cc.DEGREES_TO_RADIANS(deltaAngleX);
            return true;
        }
        return false;
    },
    /** positions the camera according to spherical coordinates */
    sphericalRadius:function (newRadius, zenith, azimuth) {
        var ex, ey, ez, cx, cy, cz, x, y, z;
        var r; // radius
        var s;

        var camera = this._target.getCamera();
        camera.getEyeXYZ(ex, ey, ez);
        camera.getCenterXYZ(cx, cy, cz);

        x = ex - cx;
        y = ey - cy;
        z = ez - cz;

        r = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2) + Math.pow(z, 2));
        s = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
        if (s == 0.0)
            s = cc.FLT_EPSILON;
        if (r == 0.0)
            r = cc.FLT_EPSILON;

        zenith = Math.acos(z / r);
        if (x < 0)
            azimuth = Math.PI - Math.asin(y / s);
        else
            azimuth = Math.asin(y / s);

        newRadius = r / cc.Camera.getZEye();
    },
    // super methods
    copyWithZone:function (zone) {
        var newZone = null;
        var ret = null;
        if (zone && zone.copyObject) //in case of being called at sub class
            ret = zone.copyObject;
        else {
            ret = new cc.OrbitCamera();
            zone = newZone = new cc.Zone(ret);
        }

        cc.ActionInterval.copyWithZone(zone);

        ret.initWithDuration(this._duration, this.radius, this.deltaRadius, this.angleZ, this.deltaAngleZ, this.angleX, this.deltaAngleX);

        return ret;
    },
    startWithTarget:function (target) {
        this._super(target);
        var r, zenith, azimuth;
        this.sphericalRadius(r, zenith, azimuth);
        if (isNaN(this.radius)) {
            this.radius = r;
        }
        if (isNaN(this.angleZ)) {
            this.angleZ = cc.RADIANS_TO_DEGREES(zenith);
        }
        if (isNaN(this.angleX)) {
            this.angleX = cc.RADIANS_TO_DEGREES(azimuth);
        }

        this.radZ = cc.DEGREES_TO_RADIANS(this.angleZ);
        this.radX = cc.DEGREES_TO_RADIANS(this.angleX);
    },
    update:function (dt) {
        var r = (this.radius + this.deltaRadius * dt) * cc.Camera.getZEye();
        var za = this.radZ + this.radDeltaZ * dt;
        var xa = this.radX + this.radDeltaX * dt;

        var i = Math.sin(za) * Math.cos(xa) * r + this.centerXOrig;
        var j = Math.sin(za) * Math.sin(xa) * r + this.centerYOrig;
        var k = Math.cos(za) * r + this.centerZOrig;

        this._target.getCamera().setEyeXYZ(i, j, k);
    }
});

/** creates a cc.OrbitCamera action with radius, delta-radius,  z, deltaZ, x, deltaX */
cc.OrbitCamera.create = function (t, radius, deltaRadius, angleZ, deltaAngleZ, angleX, deltaAngleX) {
    var ret = new cc.OrbitCamera();
    if (ret.initWithDuration(t, radius, deltaRadius, angleZ, deltaAngleZ, angleX, deltaAngleX)) {
        return ret;
    }
    return null;
};
