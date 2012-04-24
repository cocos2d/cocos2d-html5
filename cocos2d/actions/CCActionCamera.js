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
    m_fCenterXOrig:0,
    m_fCenterYOrig:0,
    m_fCenterZOrig:0,
    m_fEyeXOrig:0,
    m_fEyeYOrig:0,
    m_fEyeZOrig:0,
    m_fUpXOrig:0,
    m_fUpYOrig:0,
    m_fUpZOrig:0,
    // super methods
    startWithTarget:function (pTarget) {
        this._super(pTarget);

        var camera = pTarget.getCamera();
        camera.getCenterXYZ(this.m_fCenterXOrig, this.m_fCenterYOrig, this.m_fCenterZOrig);
        camera.getEyeXYZ(this.m_fEyeXOrig, this.m_fEyeYOrig, this.m_fEyeZOrig);
        camera.getUpXYZ(this.m_fUpXOrig, this.m_fUpYOrig, this.m_fUpZOrig);
    },
    reverse:function () {
        return cc.ReverseTime.actionWithAction(this);
    }
});

/**
 @brief cc.OrbitCamera action
 Orbits the camera around the center of the screen using spherical coordinates
 */
cc.OrbitCamera = cc.ActionCamera.extend({
    m_fRadius:0.0,
    m_fDeltaRadius:0.0,
    m_fAngleZ:0.0,
    m_fDeltaAngleZ:0.0,
    m_fAngleX:0.0,
    m_fDeltaAngleX:0.0,
    m_fRadZ:0.0,
    m_fRadDeltaZ:0.0,
    m_fRadX:0.0,
    m_fRadDeltaX:0.0,

    /** initializes a cc.OrbitCamera action with radius, delta-radius,  z, deltaZ, x, deltaX */
    initWithDuration:function (t, radius, deltaRadius, angleZ, deltaAngleZ, angleX, deltaAngleX) {
        if (this._super(t)) {
            this.m_fRadius = radius;
            this.m_fDeltaRadius = deltaRadius;
            this.m_fAngleZ = angleZ;
            this.m_fDeltaAngleZ = deltaAngleZ;
            this.m_fAngleX = angleX;
            this.m_fDeltaAngleX = deltaAngleX;

            this.m_fRadDeltaZ = cc.DEGREES_TO_RADIANS(deltaAngleZ);
            this.m_fRadDeltaX = cc.DEGREES_TO_RADIANS(deltaAngleX);
            return true;
        }
        return false;
    },
    /** positions the camera according to spherical coordinates */
    sphericalRadius:function (newRadius, zenith, azimuth) {
        var ex, ey, ez, cx, cy, cz, x, y, z;
        var r; // radius
        var s;

        var pCamera = this._m_pTarget.getCamera();
        pCamera.getEyeXYZ(ex, ey, ez);
        pCamera.getCenterXYZ(cx, cy, cz);

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
    copyWithZone:function (pZone) {
        var pNewZone = null;
        var pRet = null;
        if (pZone && pZone.m_pCopyObject) //in case of being called at sub class
            pRet = pZone.m_pCopyObject;
        else {
            pRet = new cc.OrbitCamera();
            pZone = pNewZone = new cc.Zone(pRet);
        }

        cc.ActionInterval.copyWithZone(pZone);

        pRet.initWithDuration(this._m_fDuration, this.m_fRadius, this.m_fDeltaRadius, this.m_fAngleZ, this.m_fDeltaAngleZ, this.m_fAngleX, this.m_fDeltaAngleX);

        return pRet;
    },
    startWithTarget:function (pTarget) {
        this._super(pTarget);
        var r, zenith, azimuth;
        this.sphericalRadius(r, zenith, azimuth);
        if (isNaN(this.m_fRadius)) {
            this.m_fRadius = r;
        }
        if (isNaN(this.m_fAngleZ)) {
            this.m_fAngleZ = cc.RADIANS_TO_DEGREES(zenith);
        }
        if (isNaN(this.m_fAngleX)) {
            this.m_fAngleX = cc.RADIANS_TO_DEGREES(azimuth);
        }

        this.m_fRadZ = cc.DEGREES_TO_RADIANS(this.m_fAngleZ);
        this.m_fRadX = cc.DEGREES_TO_RADIANS(this.m_fAngleX);
    },
    update:function (dt) {
        var r = (this.m_fRadius + this.m_fDeltaRadius * dt) * cc.Camera.getZEye();
        var za = this.m_fRadZ + this.m_fRadDeltaZ * dt;
        var xa = this.m_fRadX + this.m_fRadDeltaX * dt;

        var i = Math.sin(za) * Math.cos(xa) * r + this.m_fCenterXOrig;
        var j = Math.sin(za) * Math.sin(xa) * r + this.m_fCenterYOrig;
        var k = Math.cos(za) * r + this.m_fCenterZOrig;

        this._m_pTarget.getCamera().setEyeXYZ(i, j, k);
    }
});

/** creates a cc.OrbitCamera action with radius, delta-radius,  z, deltaZ, x, deltaX */
cc.OrbitCamera.actionWithDuration = function (t, radius, deltaRadius, angleZ, deltaAngleZ, angleX, deltaAngleX) {
    var pRet = new cc.OrbitCamera();
    if (pRet.initWithDuration(t, radius, deltaRadius, angleZ, deltaAngleZ, angleX, deltaAngleX)) {
        return pRet;
    }
    return null;
};