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
if (window.DeviceMotionEvent) {
    window.addEventListener('devicemotion', deviceMotionHandler, false);
}
var SHAKE_THRESHOLD = 800;
var lastUpdate = 0;
var x, y, z, last_x, last_y, last_z;
function deviceMotionHandler(eventData) {
    // Grab the acceleration including gravity from the results
    var acceleration = eventData.accelerationIncludingGravity;
    var curTime = new Date().getTime();
    if ((curTime - lastUpdate) > 100) {
        var diffTime = (curTime - lastUpdate);
        lastUpdate = curTime;
        x = acceleration.x;
        y = acceleration.y;
        z = acceleration.z;
        var speed = Math.abs(x + y + z - last_x - last_y - last_z) / diffTime * 10000;
        document.getElementById("container").innerHTML = document.getElementById("container").innerHTML + "<br />" + speed;
        if (speed > SHAKE_THRESHOLD) {
            alert("shaked!");
        }
        last_x = x;
        last_y = y;
        last_z = z;
    }
}
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

    init:function () {
        this._acceleration = new cc.Acceleration();
        this._deviceEvent = window.DeviceMotionEvent || window.DeviceOrientationEvent;
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
    },

    didAccelerate:function (eventData) {
        if (!this._delegate) {
            return;
        }
        if (this._deviceEvent == window.DeviceMotionEvent) {
            var acceleration = eventData.accelerationIncludingGravity;
            var dt = eventData.interval / 1000;
            this._acceleration.x = -acceleration.x * dt;
            this._acceleration.y = -acceleration.y * dt;
            this._acceleration.z = acceleration.z * dt;
            this._acceleration.timestamp = new Date().getTime();
        }

        /*this._acceleration.x = acceleration.gamma;
         this._acceleration.y = acceleration.alpha;
         this._acceleration.z = acceleration.beta;
         this._acceleration.timestamp = acceleration.timestamp;*/

        /*var tmp = this.acceleration.x;

         switch (cc.UIAccelerometer.getInstance().statusBarOrientation()) {
         case UIInterfaceOrientationLandscapeRight:
         this.acceleration.x = -this.acceleration.y;
         this.acceleration.y = tmp;
         break;

         case UIInterfaceOrientationLandscapeLeft:
         this.acceleration.x = this.acceleration.y;
         this.acceleration.y = -tmp;
         break;

         case UIInterfaceOrientationPortraitUpsideDown:
         this.acceleration.x = -this.acceleration.y;
         this.acceleration.y = -tmp;
         break;

         case UIInterfaceOrientationPortrait:
         break;
         }*/

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