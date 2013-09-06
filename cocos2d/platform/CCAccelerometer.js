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
    setDelegate:function (delegate) {
        cc.AccelerometerDispatcher.getInstance().addDelegate(delegate);
    },
    setAccelerometerInterval:function (interval) {
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
    _delegate:null,
    _acceleration:null,
    _deviceEvent:null,
    //_orientation:0,
    _interval:0.1,
    _minus:1,
    init:function () {
        this._acceleration = new cc.Acceleration();
        this._deviceEvent = window.DeviceMotionEvent || window.DeviceOrientationEvent;
        var ua = navigator.userAgent;
        if(/Android/.test(ua)){
            this._minus = -1;
        }
        //TODO fix DeviceMotionEvent bug on QQ Browser version 4.1 and below.
        /*if(ua.indexOf("qqbrowser")){
            this._deviceEvent = window.DeviceOrientationEvent;
        }*/
        return true;
    },

    getDelegate:function () {
        return this._delegate;
    },

    addDelegate:function (delegate) {
        this._delegate = delegate;
        var acc = this.didAccelerate.bind(this);

        if (this._delegate) {
            if (this._deviceEvent == window.DeviceMotionEvent) {
                window.addEventListener('devicemotion', acc, false);
            }
            else {
                window.addEventListener('deviceorientation', acc, false);
            }
        }
        else {
            if (this._deviceEvent == window.DeviceMotionEvent) {
                window.removeEventListener('devicemotion', acc);
            }
            else {
                window.removeEventListener('deviceorientation', acc);
            }
        }
    },

    setAccelerometerInterval:function (interval) {
        //not available on browser
        if (this._interval !== interval) {
            this._interval = interval;
        }
    },

    didAccelerate:function (eventData) {
        if (!this._delegate) {
            return;
        }

        if (this._deviceEvent == window.DeviceMotionEvent) {
            var acceleration = eventData.accelerationIncludingGravity;
            this._acceleration.x = this._minus * acceleration.x * 0.1;
            this._acceleration.y = this._minus * acceleration.y * 0.1;
            this._acceleration.z = acceleration.z * 0.1;
        }
        else {
            this._acceleration.x = (eventData.gamma / 90) * 0.981;
            this._acceleration.y = -(eventData.beta / 90) * 0.981;
            this._acceleration.z = (eventData.alpha / 90) * 0.981;
        }

        this._acceleration.timestamp = Date.now();

        var tmp = this._acceleration.x;
        switch (window.orientation) {
            case cc.UIInterfaceOrientationLandscapeRight://-90
                this._acceleration.x = -this._acceleration.y;
                this._acceleration.y = tmp;
                break;

            case cc.UIInterfaceOrientationLandscapeLeft://90
                this._acceleration.x = this._acceleration.y;
                this._acceleration.y = -tmp;
                break;

            case cc.UIInterfaceOrientationPortraitUpsideDown://180
                this._acceleration.x = -this._acceleration.x
                this._acceleration.y = -this._acceleration.y;
                break;

            case cc.UIInterfaceOrientationPortrait://0
                break;
        }

        this._delegate.onAccelerometer(this._acceleration);
    }
});


cc.AccelerometerDispatcher.getInstance = function () {
    if (!this._instance) {
        this._instance = new cc.AccelerometerDispatcher();
        this._instance.init();
    }

    return this._instance;
};