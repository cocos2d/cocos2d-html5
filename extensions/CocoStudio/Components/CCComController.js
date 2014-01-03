/****************************************************************************
 Copyright (c) 2010-2012 cocos2d-x.org

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
 * Base class for ccs.ComController
 * @class
 * @extends ccs.Component
 */
ccs.ComController = ccs.Component.extend(/** @lends ccs.ComController# */{
    ctor: function () {
        cc.Component.prototype.ctor.call(this);
        this._name = "ComController";
    },
    init: function () {
        return true;
    },

    onEnter: function () {

    },

    onExit: function () {
        var director = cc.Director.getInstance();
        if (this._isTouchEnabled)
            cc.unregisterTouchDelegate(this);

        // remove this layer from the delegates who concern Accelerometer Sensor
        if (this._isAccelerometerEnabled && cc.Accelerometer)
            director.getAccelerometer().setDelegate(null);

        // remove this layer from the delegates who concern the kaypad msg
        if (this._isKeyboardEnabled && cc.KeyboardDispatcher)
            director.getKeyboardDispatcher().removeDelegate(this);

        if (this._isMouseEnabled && cc.MouseDispatcher)
            director.getMouseDispatcher().removeMouseDelegate(this);
    },

    update: function (dt) {
    },

    /**
     * Enabled getter
     * @returns {Boolean}
     */
    isEnabled: function () {
        return this._enabled;
    },

    /**
     * Enabled setter
     * @param {Boolean} bool
     */
    setEnabled: function (bool) {
        this._enabled = b;
    },
    /**
     * If isTouchEnabled, this method is called onEnter.
     */
    registerWithTouchDispatcher:function () {
        if (this._touchMode === cc.TOUCH_ALL_AT_ONCE)
            cc.registerStandardDelegate(this,this._touchPriority);
        else
            cc.registerTargetedDelegate(this._touchPriority, true, this);
    },
    /**
     * MouseEnabled getter
     * @returns {Boolean}
     */
    isMouseEnabled:function () {
        return this._isMouseEnabled;
    },

    /**
     * MouseEnabled setter
     * @param {Boolean} enabled
     */
    setMouseEnabled:function (enabled) {
        if(!cc.MouseDispatcher)
            throw "cc.MouseDispatcher is undefined, maybe it has been removed from js loading list.";

        if (this._isMouseEnabled != enabled) {
            this._isMouseEnabled = enabled;
            if (this._running) {
                if (enabled)
                    cc.Director.getInstance().getMouseDispatcher().addMouseDelegate(this, this._mousePriority);
                else
                    cc.Director.getInstance().getMouseDispatcher().removeMouseDelegate(this);
            }
        }
    },

    setMousePriority:function (priority) {
        if(!cc.MouseDispatcher)
            throw "cc.MouseDispatcher is undefined, maybe it has been removed from js loading list.";

        if (this._mousePriority !== priority) {
            this._mousePriority = priority;
            // Update touch priority with handler
            if (this._isMouseEnabled) {
                this.setMouseEnabled(false);
                this.setMouseEnabled(true);
            }
        }
    },

    getMousePriority:function () {
        return this._mousePriority;
    },

    /**
     * whether or not it will receive Touch events.<br/>
     * You can enable / disable touch events with this property.<br/>
     * Only the touches of this node will be affected. This "method" is not propagated to it's children.<br/>
     * @return {Boolean}
     */
    isTouchEnabled:function () {
        return this._isTouchEnabled;
    },

    /**
     * Enable touch events
     * @param {Boolean} enabled
     */
    setTouchEnabled:function (enabled) {
        if (this._isTouchEnabled !== enabled) {
            this._isTouchEnabled = enabled;
            if (enabled) {
                this.registerWithTouchDispatcher();
            } else {
                // have problems?
                cc.unregisterTouchDelegate(this);
            }
        }
    },

    /** returns the priority of the touch event handler
     * @return {Number}
     */
    getTouchPriority:function () {
        return this._touchPriority;
    },

    /** Sets the touch event handler priority. Default is 0.
     * @param {Number} priority
     */
    setTouchPriority:function (priority) {
        if (this._touchPriority !== priority) {
            this._touchPriority = priority;
            // Update touch priority with handler
            if (this._isTouchEnabled) {
                this.setTouchEnabled(false);
                this.setTouchEnabled(true);
            }
        }
    },

    /** returns the touch mode.
     * @return {Number}
     */
    getTouchMode:function () {
        return this._touchMode;
    },

    /** Sets the touch mode.
     * @param {Number} mode
     */
    setTouchMode:function (mode) {
        if (this._touchMode !== mode) {
            this._touchMode = mode;
            // update the mode with handler
            if (this._isTouchEnabled) {
                this.setTouchEnabled(false);
                this.setTouchEnabled(true);
            }
        }
    },

    /**
     * whether or not it will receive Accelerometer events<br/>
     * You can enable / disable accelerometer events with this property.
     * @return {Boolean}
     */
    isAccelerometerEnabled:function () {
        return this._isAccelerometerEnabled;
    },

    /**
     * isAccelerometerEnabled setter
     * @param {Boolean} enabled
     */
    setAccelerometerEnabled:function (enabled) {
        if(!cc.Accelerometer)
            throw "cc.Accelerometer is undefined, maybe it has been removed from js loading list.";
        if (enabled !== this._isAccelerometerEnabled) {
            this._isAccelerometerEnabled = enabled;
            if (this._running) {
                var director = cc.Director.getInstance();
                if (enabled)
                    director.getAccelerometer().setDelegate(this);
                else
                    director.getAccelerometer().setDelegate(null);
            }
        }
    },

    /**
     * accelerometerInterval setter
     * @param {Number} interval
     */
    setAccelerometerInterval:function (interval) {
        if (this._isAccelerometerEnabled && cc.Accelerometer)
            cc.Director.getInstance().getAccelerometer().setAccelerometerInterval(interval);
    },

    onAccelerometer:function (accelerationValue) {
        cc.log("ccs.ComController.onAccelerometer(): should override me.");
    },

    /**
     * whether or not it will receive keyboard events<br/>
     * You can enable / disable accelerometer events with this property.<br/>
     * it's new in cocos2d-x
     * @return {Boolean}
     */
    isKeyboardEnabled:function () {
        return this._isKeyboardEnabled;
    },

    /**
     * Enable Keyboard interaction
     * @param {Boolean} enabled
     */
    setKeyboardEnabled:function (enabled) {
        if(!cc.KeyboardDispatcher)
            throw "cc.KeyboardDispatcher is undefined, maybe it has been removed from js loading list.";

        if (enabled !== this._isKeyboardEnabled) {
            this._isKeyboardEnabled = enabled;
            if (this._running) {
                var director = cc.Director.getInstance();
                if (enabled) {
                    director.getKeyboardDispatcher().addDelegate(this);
                } else {
                    director.getKeyboardDispatcher().removeDelegate(this);
                }
            }
        }
    },

    // ---------------------CCTouchDelegate interface------------------------------

    /**
     * default implements are used to call script callback if exist<br/>
     * you must override these touch functions if you wish to utilize them
     * @param {cc.Touch} touch
     * @param {event} event
     * @return {Boolean}
     */
    onTouchBegan:function (touch, event) {
        return true;
    },

    /**
     * callback when a touch event moved
     * @param {cc.Touch} touch
     * @param {event} event
     */
    onTouchMoved:function (touch, event) {
    },

    /**
     * callback when a touch event finished
     * @param {cc.Touch} touch
     * @param {event} event
     */
    onTouchEnded:function (touch, event) {
    },

    /**
     * @param {cc.Touch} touch
     * @param {event} event
     */
    onTouchCancelled:function (touch, event) {
    },

    /**
     * Touches is the same as Touch, except this one can handle multi-touch
     * @param {cc.Touch} touch
     * @param {event} event
     */
    onTouchesBegan:function (touch, event) {
    },

    /**
     * when a touch moved
     * @param {cc.Touch} touch
     * @param {event} event
     */
    onTouchesMoved:function (touch, event) {
    },

    /**
     * when a touch finished
     * @param {cc.Touch} touch
     * @param {event} event
     */
    onTouchesEnded:function (touch, event) {
    },

    /**
     * @param touch
     * @param event
     */
    onTouchesCancelled:function (touch, event) {
    },

    // ---------------------CCMouseEventDelegate interface------------------------------

    /**
     * <p>called when the "mouseDown" event is received. <br/>
     * Return YES to avoid propagating the event to other delegates.  </p>
     * @param event
     * @return {Boolean}
     */
    onMouseDown:function (event) {
        return false;
    },

    /**
     * <p>called when the "mouseDragged" event is received.         <br/>
     * Return YES to avoid propagating the event to other delegates.</p>
     * @param event
     * @return {Boolean}
     */
    onMouseDragged:function (event) {
        return false;
    },

    /**
     * <p> called when the "mouseMoved" event is received.            <br/>
     * Return YES to avoid propagating the event to other delegates.  </p>
     * @param event
     * @return {Boolean}
     */
    onMouseMoved:function (event) {
        return false;
    },

    /**
     * <p> called when the "mouseUp" event is received.               <br/>
     * Return YES to avoid propagating the event to other delegates.  </p>
     * @param event
     * @return {Boolean}
     */
    onMouseUp:function (event) {
        return false;
    },

    //right
    /**
     * <p> called when the "rightMouseDown" event is received.        <br/>
     * Return YES to avoid propagating the event to other delegates.  </p>
     * @param event
     * @return {Boolean}
     */
    onRightMouseDown:function (event) {
        return false;
    },

    /**
     * <p> called when the "rightMouseDragged" event is received.    <br/>
     * Return YES to avoid propagating the event to other delegates. </p>
     * @param event
     * @return {Boolean}
     */
    onRightMouseDragged:function (event) {
        return false;
    },

    /**
     * <p> called when the "rightMouseUp" event is received.          <br/>
     * Return YES to avoid propagating the event to other delegates.  </p>
     * @param event
     * @return {Boolean}
     */
    onRightMouseUp:function (event) {
        return false;
    },

    //other
    /**
     * <p>called when the "otherMouseDown" event is received.         <br/>
     * Return YES to avoid propagating the event to other delegates.  </p>
     * @param event
     * @return {Boolean}
     */
    onOtherMouseDown:function (event) {
        return false;
    },

    /**
     * <p> called when the "otherMouseDragged" event is received.     <br/>
     * Return YES to avoid propagating the event to other delegates.  </p>
     * @param event
     * @return {Boolean}
     */
    onOtherMouseDragged:function (event) {
        return false;
    },

    /**
     * <p> called when the "otherMouseUp" event is received.          <br/>
     * Return YES to avoid propagating the event to other delegates.  </p>
     * @param event
     * @return {Boolean}
     */
    onOtherMouseUp:function (event) {
        return false;
    },

    //scroll wheel
    /**
     * <p> called when the "scrollWheel" event is received.           <br/>
     * Return YES to avoid propagating the event to other delegates.  </p>
     * @param event
     * @return {Boolean}
     */
    onScrollWheel:function (event) {
        return false;
    },

    // enter / exit
    /**
     *  <p> called when the "mouseEntered" event is received.         <br/>
     *  Return YES to avoid propagating the event to other delegates. </p>
     * @param theEvent
     * @return {Boolean}
     */
    onMouseEntered:function (theEvent) {
        return false;
    },

    /**
     * <p> called when the "mouseExited" event is received.          <br/>
     * Return YES to avoid propagating the event to other delegates. </p>
     * @param theEvent
     * @return {Boolean}
     */
    onMouseExited:function (theEvent) {
        return false;
    },

    // ---------------------CCKeyboardDelegate interface------------------------------

    /**
     * Call back when a key is pressed down
     * @param {Number} keyCode
     * @example
     * // example
     * if(keyCode == cc.KEY.w){}
     */
    onKeyDown:function (keyCode) {
    },

    /**
     * Call back when a key is released
     * @param {Number} keyCode
     * @example
     * // example
     * if(keyCode == cc.KEY.w){}
     */
    onKeyUp:function (keyCode) {
    }
});
/**
 * allocates and initializes a ComController.
 * @constructs
 * @return {ccs.ComController}
 * @example
 * // example
 * var com = ccs.ComController.create();
 */
ccs.ComController.create = function () {
    var com = new ccs.ComController();
    if (com && com.init()) {
        return com;
    }
    return null;
};