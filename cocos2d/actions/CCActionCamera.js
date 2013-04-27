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
 * Base class for cc.Camera actions
 * @class
 * @extends cc.ActionInterval
 */
cc.ActionCamera = cc.ActionInterval.extend(/** @lends cc.ActionCamera# */{
    _centerXOrig:0,
    _centerYOrig:0,
    _centerZOrig:0,
    _eyeXOrig:0,
    _eyeYOrig:0,
    _eyeZOrig:0,
    _upXOrig:0,
    _upYOrig:0,
    _upZOrig:0,

    startWithTarget:function (target) {
        cc.ActionInterval.prototype.startWithTarget.call(this, target);

        var camera = target.getCamera();
        var centerXYZ = camera.getCenter();
        this._centerXOrig = centerXYZ.x;
        this._centerYOrig = centerXYZ.y;
        this._centerZOrig = centerXYZ.z;

        var eyeXYZ = camera.getEye();
        this._eyeXOrig = eyeXYZ.x;
        this._eyeYOrig = eyeXYZ.y;
        this._eyeZOrig = eyeXYZ.z;

        var upXYZ = camera.getUp();
        this._upXOrig = upXYZ.x;
        this._upYOrig = upXYZ.y;
        this._upZOrig = upXYZ.z;
    },

    reverse:function () {
        return cc.ReverseTime.create(this);
    }
});

/**
 * Orbits the camera around the center of the screen using spherical coordinates
 * @class
 * @extends cc.ActionCamera
 */
cc.OrbitCamera = cc.ActionCamera.extend(/** @lends cc.OrbitCamera# */{
    _radius:0.0,
    _deltaRadius:0.0,
    _angleZ:0.0,
    _deltaAngleZ:0.0,
    _angleX:0.0,
    _deltaAngleX:0.0,
    _radZ:0.0,
    _radDeltaZ:0.0,
    _radX:0.0,
    _radDeltaX:0.0,

    /**
     * initializes a cc.OrbitCamera action with radius, delta-radius,  z, deltaZ, x, deltaX
     * @param {Number} t time
     * @param {Number} radius
     * @param {Number} deltaRadius
     * @param {Number} angleZ
     * @param {Number} deltaAngleZ
     * @param {Number} angleX
     * @param {Number} deltaAngleX
     * @return {Boolean}
     */
    initWithDuration:function (t, radius, deltaRadius, angleZ, deltaAngleZ, angleX, deltaAngleX) {
        if (cc.ActionInterval.prototype.initWithDuration.call(this, t)) {
            this._radius = radius;
            this._deltaRadius = deltaRadius;
            this._angleZ = angleZ;
            this._deltaAngleZ = deltaAngleZ;
            this._angleX = angleX;
            this._deltaAngleX = deltaAngleX;

            this._radDeltaZ = cc.DEGREES_TO_RADIANS(deltaAngleZ);
            this._radDeltaX = cc.DEGREES_TO_RADIANS(deltaAngleX);
            return true;
        }
        return false;
    },

    /**
     * positions the camera according to spherical coordinates
     * @return {Object}
     */
    sphericalRadius:function () {
        var newRadius, zenith, azimuth;
        var camera = this._target.getCamera();
        var eyeXYZ = camera.getEye();
        var centerXYZ = camera.getCenter();

        var x = eyeXYZ.x - centerXYZ.x;
        var y = eyeXYZ.y - centerXYZ.y;
        var z = eyeXYZ.z - centerXYZ.z;

        var r = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2) + Math.pow(z, 2));
        var s = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
        if (s === 0.0)
            s = cc.FLT_EPSILON;
        if (r === 0.0)
            r = cc.FLT_EPSILON;

        zenith = Math.acos(z / r);
        if (x < 0)
            azimuth = Math.PI - Math.asin(y / s);
        else
            azimuth = Math.asin(y / s);
        newRadius = r / cc.Camera.getZEye();
        return {newRadius:newRadius, zenith:zenith, azimuth:azimuth};
    },

    startWithTarget:function (target) {
        cc.ActionInterval.prototype.startWithTarget.call(this, target);
        var retValue = this.sphericalRadius();
        if (isNaN(this._radius))
            this._radius = retValue.newRadius;

        if (isNaN(this._angleZ))
            this._angleZ = cc.RADIANS_TO_DEGREES(retValue.zenith);

        if (isNaN(this._angleX))
            this._angleX = cc.RADIANS_TO_DEGREES(retValue.azimuth);

        this._radZ = cc.DEGREES_TO_RADIANS(this._angleZ);
        this._radX = cc.DEGREES_TO_RADIANS(this._angleX);
    },

    update:function (dt) {
        var r = (this._radius + this._deltaRadius * dt) * cc.Camera.getZEye();
        var za = this._radZ + this._radDeltaZ * dt;
        var xa = this._radX + this._radDeltaX * dt;

        var i = Math.sin(za) * Math.cos(xa) * r + this._centerXOrig;
        var j = Math.sin(za) * Math.sin(xa) * r + this._centerYOrig;
        var k = Math.cos(za) * r + this._centerZOrig;

        this._target.getCamera().setEye(i, j, k);
    }
});

/**
 * creates a cc.OrbitCamera action with radius, delta-radius,  z, deltaZ, x, deltaX
 * @param {Number} t time
 * @param {Number} radius
 * @param {Number} deltaRadius
 * @param {Number} angleZ
 * @param {Number} deltaAngleZ
 * @param {Number} angleX
 * @param {Number} deltaAngleX
 * @return {cc.OrbitCamera}
 */
cc.OrbitCamera.create = function (t, radius, deltaRadius, angleZ, deltaAngleZ, angleX, deltaAngleX) {
    var ret = new cc.OrbitCamera();
    if (ret.initWithDuration(t, radius, deltaRadius, angleZ, deltaAngleZ, angleX, deltaAngleX))
        return ret;
    return null;
};
