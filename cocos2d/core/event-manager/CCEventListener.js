/****************************************************************************
 Copyright (c) 2010-2014 cocos2d-x.org

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
 * <p>
 *     The base class of event listener.                                                                        <br/>
 *     If you need custom listener which with different callback, you need to inherit this class.               <br/>
 *     For instance, you could refer to EventListenerAcceleration, EventListenerKeyboard,                       <br/>
 *      EventListenerTouchOneByOne, EventListenerCustom.
 * </p>
 * @class
 * @extends cc.Class
 */
cc.EventListener = cc.Class.extend(/** @lends cc.EventListener# */{
    _onEvent: null,                          // Event callback function
    _type: 0,                                 // Event listener type
    _listenerID: null,                       // Event listener ID
    _registered: false,                     // Whether the listener has been added to dispatcher.

    _fixedPriority: 0,                      // The higher the number, the higher the priority, 0 is for scene graph base priority.
    _node: null,                           // scene graph based priority
    _paused: false,                        // Whether the listener is paused

    /**
     * Initializes event with type and callback function
     * @param {number} type
     * @param {string} listenerID
     * @param {function} callback
     * @constructor
     */
    ctor: function (type, listenerID, callback) {
        this._onEvent = callback;
        this._type = type || 0;
        this._listenerID = listenerID || "";
    },

    _setPaused: function (paused) {
        this._paused = paused;
    },

    _isPaused: function () {
        return this._paused;
    },

    _setRegistered: function (registered) {
        this._registered = registered;
    },

    _isRegistered: function () {
        return this._registered;
    },

    _getType: function () {
        return this._type;
    },

    _getListenerID: function () {
        return this._listenerID;
    },

    _setFixedPriority: function (fixedPriority) {
        this._fixedPriority = fixedPriority;
    },

    _getFixedPriority: function () {
        return this._fixedPriority;
    },

    _setSceneGraphPriority: function (node) {
        this._node = node;
    },

    _getSceneGraphPriority: function () {
        return this._node;
    },

    /**
     * Checks whether the listener is available.
     * @returns {boolean}
     */
    checkAvailable: function () {
        return this._onEvent != null;
    },

    /**
     * Clones the listener, its subclasses have to override this method.
     * @returns {cc.EventListener}
     */
    clone: function () {
        return null;
    },

    /**
     * Currently JavaScript Bindings (JSB), in some cases, needs to use retain and release. This is a bug in JSB,
     * and the ugly workaround is to use retain/release. So, these 2 methods were added to be compatible with JSB.
     * This is a hack, and should be removed once JSB fixes the retain/release bug
     */
    retain:function () {
    },
    release:function () {
    }
});

// event listener type
cc.EventListener.UNKNOWN = 0;
cc.EventListener.TOUCH_ONE_BY_ONE = 1;
cc.EventListener.TOUCH_ALL_AT_ONCE = 2;
cc.EventListener.KEYBOARD = 3;
cc.EventListener.MOUSE = 4;
cc.EventListener.ACCELERATION = 5;
cc.EventListener.CUSTOM = 6;

/**
 * The custom event listener
 * @class
 * @extends cc.EventListener
 *
 */
cc.EventListenerCustom = cc.EventListener.extend(/** @lends cc.EventListenerCustom# */{
    _onCustomEvent: null,
    ctor: function (listenerId, callback) {
        this._onCustomEvent = callback;
        var selfPointer = this;
        var listener = function (event) {
            if (selfPointer._onCustomEvent != null)
                selfPointer._onCustomEvent(event);
        };

        cc.EventListener.prototype.ctor.call(this, cc.EventListener.CUSTOM, listenerId, listener);
    },

    checkAvailable: function () {
        return (cc.EventListener.prototype.checkAvailable.call(this) && this._onCustomEvent != null);
    },

    clone: function () {
        return new cc.EventListenerCustom(this._listenerID, this._onCustomEvent);
    }
});

/**
 * Creates an event listener with type and callback.
 * @param {string} eventName
 * @param {function} callback
 */
cc.EventListenerCustom.create = function (eventName, callback) {
    return new cc.EventListenerCustom(eventName, callback);
};

cc.EventListenerAcceleration = cc.EventListener.extend({
    _onAccelerationEvent: null,
    ctor: function (callback) {
        this._onAccelerationEvent = callback;
        var selfPointer = this;
        var listener = function (event) {
            selfPointer._onAccelerationEvent(event._acc, event);
        };
        cc.EventListener.prototype.ctor.call(this, cc.EventListener.ACCELERATION, cc.EventListenerAcceleration.LISTENER_ID, listener);
    },

    checkAvailable: function () {
        if (!this._onAccelerationEvent)
            throw "cc.EventListenerAcceleration.checkAvailable(): _onAccelerationEvent must be non-nil";
        return true;
    },

    clone: function () {
        return new cc.EventListenerAcceleration(this._onAccelerationEvent);
    }
});

cc.EventListenerAcceleration.LISTENER_ID = "__cc_acceleration";

cc.EventListenerAcceleration.create = function (callback) {
    return new cc.EventListenerAcceleration(callback);
};

cc.EventListenerKeyboard = cc.EventListener.extend({
    onKeyPressed: null,
    onKeyReleased: null,

    ctor: function () {
        var selfPointer = this;
        var listener = function (event) {
            if (event._isPressed) {
                if (selfPointer.onKeyPressed)
                    selfPointer.onKeyPressed(event._keyCode, event);
            } else {
                if (selfPointer.onKeyReleased)
                    selfPointer.onKeyReleased(event._keyCode, event);
            }
        };
        cc.EventListener.prototype.ctor.call(this, cc.EventListener.KEYBOARD, cc.EventListenerKeyboard.LISTENER_ID, listener);
    },

    clone: function () {
        var eventListener = new cc.EventListenerKeyboard();
        eventListener.onKeyPressed = this.onKeyPressed;
        eventListener.onKeyReleased = this.onKeyReleased;
    },

    checkAvailable: function () {
        if (this.onKeyPressed == null && this.onKeyReleased == null) {
            cc.log("cc.EventListenerKeyboard.checkAvailable(): Invalid EventListenerKeyboard!");
            return false;
        }
        return true;
    }
});

cc.EventListenerKeyboard.LISTENER_ID = "__cc_keyboard";

cc.EventListenerKeyboard.create = function () {
    return new cc.EventListenerKeyboard();
};

cc.EventListenerMouse = cc.EventListener.extend({
    onMouseDown: null,
    onMouseUp: null,
    onMouseMove: null,
    onMouseScroll: null,

    ctor: function () {
        var selfPointer = this;
        var listener = function (event) {
            var eventType = cc.EventMouse;
            switch (event._eventType) {
                case eventType.DOWN:
                    if (selfPointer.onMouseDown)
                        selfPointer.onMouseDown(event);
                    break;
                case eventType.UP:
                    if (selfPointer.onMouseUp)
                        selfPointer.onMouseUp(event);
                    break;
                case eventType.MOVE:
                    if (selfPointer.onMouseMove)
                        selfPointer.onMouseMove(event);
                    break;
                case eventType.SCROLL:
                    if (selfPointer.onMouseScroll)
                        selfPointer.onMouseScroll(event);
                    break;
                default:
                    break;
            }
        };
        cc.EventListener.prototype.ctor.call(this, cc.EventListener.MOUSE, cc.EventListenerMouse.LISTENER_ID, listener);
    },

    clone: function () {
        var eventListener = new cc.EventListenerMouse();
        eventListener.onMouseDown = this.onMouseDown;
        eventListener.onMouseUp = this.onMouseUp;
        eventListener.onMouseMove = this.onMouseMove;
        eventListener.onMouseScroll = this.onMouseScroll;
        return eventListener;
    },

    checkAvailable: function () {
        return true;
    }
});

cc.EventListenerMouse.LISTENER_ID = "__cc_mouse";

cc.EventListenerMouse.create = function () {
    return new cc.EventListenerMouse();
};

cc.EventListenerTouchOneByOne = cc.EventListener.extend({
    _claimedTouches: null,
    swallowTouches: false,
    onTouchBegan: null,
    onTouchMoved: null,
    onTouchEnded: null,
    onTouchCancelled: null,

    ctor: function () {
        cc.EventListener.prototype.ctor.call(this, cc.EventListener.TOUCH_ONE_BY_ONE, cc.EventListenerTouchOneByOne.LISTENER_ID, null);
        this._claimedTouches = [];
    },

    setSwallowTouches: function (needSwallow) {
        this.swallowTouches = needSwallow;
    },

    clone: function () {
        var eventListener = new cc.EventListenerTouchOneByOne();
        eventListener.onTouchBegan = this.onTouchBegan;
        eventListener.onTouchMoved = this.onTouchMoved;
        eventListener.onTouchEnded = this.onTouchEnded;
        eventListener.onTouchCancelled = this.onTouchCancelled;
        eventListener.swallowTouches = this.swallowTouches;
        return eventListener;
    },

    checkAvailable: function () {
        if(!this.onTouchBegan){
            cc.log("cc.EventListenerTouchOneByOne.checkAvailable(): Invalid EventListenerTouchOneByOne!");
            return false;
        }
        return true;
    }
});

cc.EventListenerTouchOneByOne.LISTENER_ID = "__cc_touch_one_by_one";

cc.EventListenerTouchOneByOne.create = function () {
    return new cc.EventListenerTouchOneByOne();
};

cc.EventListenerTouchAllAtOnce = cc.EventListener.extend({
    onTouchesBegan: null,
    onTouchesMoved: null,
    onTouchesEnded: null,
    onTouchesCancelled: null,

    ctor: function(){
       cc.EventListener.prototype.ctor.call(this, cc.EventListener.TOUCH_ALL_AT_ONCE, cc.EventListenerTouchAllAtOnce.LISTENER_ID, null);
    },

    clone: function(){
        var eventListener = new cc.EventListenerTouchAllAtOnce();
        eventListener.onTouchesBegan = this.onTouchesBegan;
        eventListener.onTouchesMoved = this.onTouchesMoved;
        eventListener.onTouchesEnded = this.onTouchesEnded;
        eventListener.onTouchesCancelled = this.onTouchesCancelled;
        return eventListener;
    },

    checkAvailable: function(){
        if (this.onTouchesBegan == null && this.onTouchesMoved == null
            && this.onTouchesEnded == null && this.onTouchesCancelled == null) {
            cc.log("cc.EventListenerTouchAllAtOnce.checkAvailable(): Invalid EventListenerTouchAllAtOnce!");
            return false;
        }
        return true;
    }
});

cc.EventListenerTouchAllAtOnce.LISTENER_ID = "__cc_touch_all_at_once";

cc.EventListenerTouchAllAtOnce.create = function(){
     return new cc.EventListenerTouchAllAtOnce();
};

cc.EventListener.create = function(argObj){
    if(!argObj || !argObj.event){
        throw "Invalid parameter.";
    }
    var listenerType = argObj.event;
    delete argObj.event;

    var listener = null;
    if(listenerType === cc.EventListener.TOUCH_ONE_BY_ONE)
        listener = new cc.EventListenerTouchOneByOne();
    else if(listenerType === cc.EventListener.TOUCH_ALL_AT_ONCE)
        listener = new cc.EventListenerTouchAllAtOnce();
    else if(listenerType === cc.EventListener.MOUSE)
        listener = new cc.EventListenerMouse();
    else if(listenerType === cc.EventListener.CUSTOM){
        listener = new cc.EventListenerCustom(argObj.eventName, argObj.callback);
        delete argObj.eventName;
        delete argObj.callback;
    } else if(listenerType === cc.EventListener.KEYBOARD)
        listener = new cc.EventListenerKeyboard();
    else if(listenerType === cc.EventListener.ACCELERATION){
        listener = new cc.EventListenerAcceleration(argObj.callback);
        delete argObj.callback;
    }

    for(var key in argObj) {
        listener[key] = argObj[key];
    }

    return listener;
};