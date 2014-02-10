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

cc.UIInterfaceOrientationLandscapeLeft = -90;

cc.UIInterfaceOrientationLandscapeRight = 90;

cc.UIInterfaceOrientationPortraitUpsideDown = 180;

cc.UIInterfaceOrientationPortrait = 0;

/**
 * he device accelerometer reports values for each axis in units of g-force
 */
cc.Acceleration = function (x, y, z, timestamp) {
    this.x = x || 0;
    this.y = y || 0;
    this.z = z || 0;
    this.timestamp = timestamp || 0;
};

/**
 * @class
 * @extends cc.Class
 */
cc.Accelerometer = cc.Class.extend(/** @lends cc.Accelerometer# */{
    setDelegate: function (delegate) {
        cc.AccelerometerDispatcher.getInstance().addDelegate(delegate);
    },
    setAccelerometerInterval: function (interval) {
        cc.AccelerometerDispatcher.getInstance().setAccelerometerInterval(interval);
    }
});

/**
 *
 * The cc.AccelerometerDelegate defines a single method for
 * receiving acceleration-related data from the system.
 * @class
 * @extends cc.Class
 */
cc.AccelerometerDispatcher = cc.Class.extend(/** @lends cc.AccelerometerDispatcher# */{
    _delegate: null,
    _acceleration: null,
    _deviceEvent: null,
    _interval: 1/30,
    _minus: 1,
    _curTime:0,
    init: function () {
        this._acceleration = new cc.Acceleration();
        var w = window;
        this._deviceEvent = w.DeviceMotionEvent || w.DeviceOrientationEvent;

        //TODO fix DeviceMotionEvent bug on QQ Browser version 4.1 and below.
        if (cc.Browser.type == "mqqbrowser") {
            this._deviceEvent = window.DeviceOrientationEvent;
        }

        this._deviceEventType = (this._deviceEvent == w.DeviceMotionEvent) ? "devicemotion" : "deviceorientation";
        var ua = navigator.userAgent;
        if (/Android/.test(ua) || (/Adr/.test(ua) && cc.Browser.type == "ucbrowser")) {
            this._minus = -1;
        }
    },

    getDelegate: function () {
        return this._delegate;
    },

    addDelegate: function (delegate) {
        this._delegate = delegate;
        var acc = this.didAccelerate.bind(this), w = window, scheduler = cc.Director.getInstance().getScheduler();
        if (this._delegate) {
            w.addEventListener(this._deviceEventType, acc, false);
            scheduler.scheduleUpdateForTarget(this);
        } else {
            w.removeEventListener(this._deviceEventType, acc);
            scheduler.unscheduleUpdateForTarget(this);
        }
    },

    setAccelerometerInterval: function (interval) {
        if (this._interval !== interval) {
            this._interval = interval;
        }
    },

    didAccelerate: function (eventData) {
        if (!this._delegate) {
            return;
        }

        var mAcceleration = this._acceleration;
        if (this._deviceEvent == window.DeviceMotionEvent) {
            var eventAcceleration = eventData.accelerationIncludingGravity;
            mAcceleration.x = this._minus * eventAcceleration.x * 0.1;
            mAcceleration.y = this._minus * eventAcceleration.y * 0.1;
            mAcceleration.z = eventAcceleration.z * 0.1;
        }
        else {
            mAcceleration.x = (eventData.gamma / 90) * 0.981;
            mAcceleration.y = -(eventData.beta / 90) * 0.981;
            mAcceleration.z = (eventData.alpha / 90) * 0.981;
        }
        mAcceleration.timestamp = eventData.timeStamp || Date.now();

        var tmpX = mAcceleration.x;
        switch (window.orientation) {
            case cc.UIInterfaceOrientationLandscapeRight://-90
                mAcceleration.x = -mAcceleration.y;
                mAcceleration.y = tmpX;
                break;

            case cc.UIInterfaceOrientationLandscapeLeft://90
                mAcceleration.x = mAcceleration.y;
                mAcceleration.y = -tmpX;
                break;

            case cc.UIInterfaceOrientationPortraitUpsideDown://180
                mAcceleration.x = -mAcceleration.x;
                mAcceleration.y = -mAcceleration.y;
                break;

            case cc.UIInterfaceOrientationPortrait://0
                break;
        }
    },
    update:function(dt){
        if(this._curTime > this._interval){
            this._curTime -= this._interval;
            this._delegate.onAccelerometer(this._acceleration);
        }
        this._curTime += dt;
    }
});

cc.AccelerometerDispatcher.getInstance = function () {
    if (!this._instance) {
        this._instance = new cc.AccelerometerDispatcher();
        this._instance.init();
    }

    return this._instance;
};