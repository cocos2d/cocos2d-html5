/****************************************************************************
 Copyright (c) 2010-2012 cocos2d-x.org
 Copyright (c) 2013-2014 Chukong Technologies Inc.

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
 * ignore
 */
cc.UIInterfaceOrientationLandscapeLeft = -90;

cc.UIInterfaceOrientationLandscapeRight = 90;

cc.UIInterfaceOrientationPortraitUpsideDown = 180;

cc.UIInterfaceOrientationPortrait = 0;

/**
 * <p>
 *  This class manages all events of input. include: touch, mouse, accelerometer, keyboard                                       <br/>
 * </p>
 * @namespace
 */
cc.inputManager = /** @lends cc.inputManager# */{
    _mousePressed: false,

    _isRegisterEvent: false,

    _preTouchPoint: cc.p(0,0),
    _prevMousePoint: cc.p(0,0),

    _preTouchPool: [],
    _preTouchPoolPointer: 0,

    _touches: [],
    _touchesIntegerDict:{},

    _indexBitsUsed: 0,
    _maxTouches: 5,

    _accelEnabled: false,
    _accelInterval: 1/30,
    _accelMinus: 1,
    _accelCurTime: 0,
    _acceleration: null,
    _accelDeviceEvent: null,

    /**
     * whether enable accelerometer event
     * @param {Boolean} isEnable
     */
    setAccelerometerEnabled: function(isEnable){
        if(this._accelEnabled === isEnable)
            return;

        this._accelEnabled = isEnable;
        var scheduler = cc.director.getScheduler();
        if(this._accelEnabled){
            this._accelCurTime = 0;
            scheduler.scheduleUpdateForTarget(this);
        } else {
            this._accelCurTime = 0;
            scheduler.unscheduleUpdateForTarget(this);
        }
    },

    /**
     * set accelerometer interval value
     * @param {Number} interval
     */
    setAccelerometerInterval: function(interval){
        if (this._accelInterval !== interval) {
            this._accelInterval = interval;
        }
    },

    _getUnUsedIndex: function () {
        var temp = this._indexBitsUsed;

        for (var i = 0; i < this._maxTouches; i++) {
            if (!(temp & 0x00000001)) {
                this._indexBitsUsed |= (1 << i);
                return i;
            }
            temp >>= 1;
        }

        // all bits are used
        return -1;
    },

    _removeUsedIndexBit: function (index) {
        if (index < 0 || index >= this._maxTouches)
            return;

        var temp = 1 << index;
        temp = ~temp;
        this._indexBitsUsed &= temp;
    },

    _glView: null,

    handleTouchesBegin: function (touches) {
        var selTouch, index, curTouch, touchID, handleTouches = [], locTouchIntDict = this._touchesIntegerDict;
        for(var i = 0, len = touches.length; i< len; i ++){
            selTouch = touches[i];
            touchID = selTouch.getID();
            index = locTouchIntDict[touchID];

            if(index == null){
                var unusedIndex = this._getUnUsedIndex();
                if (unusedIndex == -1) {
                    cc.log("The touches is more than MAX_TOUCHES, nUnusedIndex = " + unusedIndex);
                    continue;
                }
                curTouch = this._touches[unusedIndex] = selTouch;
                locTouchIntDict[touchID] = unusedIndex;
                handleTouches.push(curTouch);
            }
        }
        if(handleTouches.length > 0){
            this._glView._convertTouchesWithScale(handleTouches);
            var touchEvent = new cc.EventTouch(handleTouches);
            touchEvent._eventCode = cc.EventTouch.EventCode.BEGAN;
            cc.eventManager.dispatchEvent(touchEvent);
        }
    },

    handleTouchesMove: function(touches){
        var selTouch, index, touchID, handleTouches = [], locTouches = this._touches;
        for(var i = 0, len = touches.length; i< len; i ++){
            selTouch = touches[i];
            touchID = selTouch.getID();
            index = this._touchesIntegerDict[touchID];

            if(index == null){
                //cc.log("if the index doesn't exist, it is an error");
                continue;
            }
            if(locTouches[index]){
                locTouches[index]._setPoint(selTouch._point);
                locTouches[index]._setPrevPoint(selTouch._prevPoint);
                handleTouches.push(locTouches[index]);
            }
        }
        if(handleTouches.length > 0){
            this._glView._convertTouchesWithScale(handleTouches);
            var touchEvent = new cc.EventTouch(handleTouches);
            touchEvent._eventCode = cc.EventTouch.EventCode.MOVED;
            cc.eventManager.dispatchEvent(touchEvent);
        }
    },

    handleTouchesEnd: function(touches){
        var handleTouches = this.getSetOfTouchesEndOrCancel(touches);
        if(handleTouches.length > 0) {
            this._glView._convertTouchesWithScale(handleTouches);
            var touchEvent = new cc.EventTouch(handleTouches);
            touchEvent._eventCode = cc.EventTouch.EventCode.ENDED;
            cc.eventManager.dispatchEvent(touchEvent);
        }
    },

    handleTouchesCancel: function(touches){
        var handleTouches = this.getSetOfTouchesEndOrCancel(touches);
        if(handleTouches.length > 0) {
            this._glView._convertTouchesWithScale(handleTouches);
            var touchEvent = new cc.EventTouch(handleTouches);
            touchEvent._eventCode = cc.EventTouch.EventCode.CANCELLED;
            cc.eventManager.dispatchEvent(touchEvent);
        }
    },

    getSetOfTouchesEndOrCancel: function(touches) {
        var selTouch, index, touchID, handleTouches = [], locTouches = this._touches, locTouchesIntDict = this._touchesIntegerDict;
        for(var i = 0, len = touches.length; i< len; i ++){
            selTouch = touches[i];
            touchID = selTouch.getID();
            index = locTouchesIntDict[touchID];

            if(index == null){
                continue;  //cc.log("if the index doesn't exist, it is an error");
            }
            if(locTouches[index]){
                locTouches[index]._setPoint(selTouch._point);
                locTouches[index]._setPrevPoint(selTouch._prevPoint);         //TODO
                handleTouches.push(locTouches[index]);
                this._removeUsedIndexBit(index);
                delete locTouchesIntDict[touchID];
            }
        }
        return handleTouches;
    },

    getHTMLElementPosition: function (element) {
        var docElem = document.documentElement;
        var win = window;
        var box = null;
        if (typeof element.getBoundingClientRect === 'function') {
            box = element.getBoundingClientRect();
        } else {
            if (element instanceof HTMLCanvasElement) {
                box = {
                    left: 0,
                    top: 0,
                    width: element.width,
                    height: element.height
                };
            } else {
                box = {
                    left: 0,
                    top: 0,
                    width: parseInt(element.style.width),
                    height: parseInt(element.style.height)
                };
            }
        }
        return {
            left: box.left + win.pageXOffset - docElem.clientLeft,
            top: box.top + win.pageYOffset - docElem.clientTop,
            width: box.width,
            height: box.height
        };
    },

    getPreTouch: function(touch){
        var preTouch = null;
        var locPreTouchPool = this._preTouchPool;
        var id = touch.getId();
        for (var i = locPreTouchPool.length - 1; i >= 0; i--) {
            if (locPreTouchPool[i].getId() == id) {
                preTouch = locPreTouchPool[i];
                break;
            }
        }
        if (!preTouch)
            preTouch = touch;
        return preTouch;
    },

    setPreTouch: function(touch){
        var find = false;
        var locPreTouchPool = this._preTouchPool;
        var id = touch.getId();
        for (var i = locPreTouchPool.length - 1; i >= 0; i--) {
            if (locPreTouchPool[i].getId() == id) {
                locPreTouchPool[i] = touch;
                find = true;
                break;
            }
        }
        if (!find) {
            if (locPreTouchPool.length <= 50) {
                locPreTouchPool.push(touch);
            } else {
                locPreTouchPool[this._preTouchPoolPointer] = touch;
                this._preTouchPoolPointer = (this._preTouchPoolPointer + 1) % 50;
            }
        }
    },

    getTouchByXY: function(tx, ty, pos){
        var locPreTouch = this._preTouchPoint;
        var location = this._glView.convertToLocationInView(tx, ty, pos);
        var touch = new cc.Touch(location.x,  location.y);
        touch._setPrevPoint(locPreTouch.x, locPreTouch.y);
        locPreTouch.x = location.x;
        locPreTouch.y = location.y;
        return touch;
    },

    getMouseEvent: function(location, pos, eventType){
        var locPreMouse = this._prevMousePoint;
        this._glView._convertMouseToLocationInView(location, pos);
        var mouseEvent = new cc.EventMouse(eventType);
        mouseEvent.setLocation(location.x, location.y);
        mouseEvent._setPrevCursor(locPreMouse.x, locPreMouse.y);
        locPreMouse.x = location.x;
        locPreMouse.y = location.y;
        return mouseEvent;
    },

    getPointByEvent: function(event, pos){
        if (event.pageX != null)  //not avalable in <= IE8
            return {x: event.pageX, y: event.pageY};

        pos.left -= document.body.scrollLeft;
        pos.top -= document.body.scrollTop;
        return {x: event.clientX, y: event.clientY};
    },

    getTouchesByEvent: function(event, pos){
        var touchArr = [], locView = this._glView;
        var touch_event, touch, preLocation;
        var locPreTouch = this._preTouchPoint;

        var length = event.changedTouches.length;
        for (var i = 0; i < length; i++) {
            touch_event = event.changedTouches[i];
            if (touch_event) {
                var location = locView.convertToLocationInView(touch_event.clientX, touch_event.clientY, pos);
                if (touch_event.identifier != null) {
                    touch = new cc.Touch(location.x, location.y, touch_event.identifier);
                    //use Touch Pool
                    preLocation = this.getPreTouch(touch).getLocation();
                    touch._setPrevPoint(preLocation.x, preLocation.y);
                    this.setPreTouch(touch);
                } else {
                    touch = new cc.Touch(location.x, location.y);
                    touch._setPrevPoint(locPreTouch.x, locPreTouch.y);
                }
                locPreTouch.x = location.x;
                locPreTouch.y = location.y;
                touchArr.push(touch);
            }
        }
        return touchArr;
    },

    registerSystemEvent: function(element){
        if(this._isRegisterEvent) return;

        var locView = this._glView = cc.view;
        var selfPointer = this;
        var supportMouse = ('mouse' in cc.sys.capabilities), supportTouches = ('touches' in cc.sys.capabilities);

        //register touch event
        if (supportMouse) {
            window.addEventListener('mousedown', function () {
                selfPointer._mousePressed = true;
            }, false);

            window.addEventListener('mouseup', function (event) {
                var savePressed = selfPointer._mousePressed;
                selfPointer._mousePressed = false;

                if(!savePressed)
                    return;

                var pos = selfPointer.getHTMLElementPosition(element);
                var location = selfPointer.getPointByEvent(event, pos);
                if (!cc.rectContainsPoint(new cc.Rect(pos.left, pos.top, pos.width, pos.height), location)){
                    if(!supportTouches)
                        selfPointer.handleTouchesEnd([selfPointer.getTouchByXY(location.x, location.y, pos)]);

                    var mouseEvent = selfPointer.getMouseEvent(location,pos,cc.EventMouse.UP);
                    mouseEvent.setButton(event.button);
                    cc.eventManager.dispatchEvent(mouseEvent);
                }
            }, false);

            //register canvas mouse event
            element.addEventListener("mousedown", function (event) {
                selfPointer._mousePressed = true;

                var pos = selfPointer.getHTMLElementPosition(element);
                var location = selfPointer.getPointByEvent(event, pos);
                if(!supportTouches)
                    selfPointer.handleTouchesBegin([selfPointer.getTouchByXY(location.x, location.y, pos)]);

                var mouseEvent = selfPointer.getMouseEvent(location,pos,cc.EventMouse.DOWN);
                mouseEvent.setButton(event.button);
                cc.eventManager.dispatchEvent(mouseEvent);

                event.stopPropagation();
                event.preventDefault();
            }, false);

            element.addEventListener("mouseup", function (event) {
                selfPointer._mousePressed = false;

                var pos = selfPointer.getHTMLElementPosition(element);
                var location = selfPointer.getPointByEvent(event, pos);

                if(!supportTouches)
                    selfPointer.handleTouchesEnd([selfPointer.getTouchByXY(location.x, location.y, pos)]);

                var mouseEvent = selfPointer.getMouseEvent(location,pos,cc.EventMouse.UP);
                mouseEvent.setButton(event.button);
                cc.eventManager.dispatchEvent(mouseEvent);

                event.stopPropagation();
                event.preventDefault();
            }, false);

            element.addEventListener("mousemove", function (event) {
                if(!selfPointer._mousePressed)
                    return;

                var pos = selfPointer.getHTMLElementPosition(element);
                var location = selfPointer.getPointByEvent(event, pos);

                if(!supportTouches)
                    selfPointer.handleTouchesMove([selfPointer.getTouchByXY(location.x, location.y, pos)]);

                var mouseEvent = selfPointer.getMouseEvent(location,pos,cc.EventMouse.MOVE);
                mouseEvent.setButton(event.button);
                cc.eventManager.dispatchEvent(mouseEvent);

                event.stopPropagation();
                event.preventDefault();
            }, false);

            element.addEventListener("mousewheel", function (event) {
                var pos = selfPointer.getHTMLElementPosition(element);
                var location = selfPointer.getPointByEvent(event, pos);

                var mouseEvent = selfPointer.getMouseEvent(location,pos,cc.EventMouse.SCROLL);
                mouseEvent.setButton(event.button);
                mouseEvent.setScrollData(0, event.wheelDelta);
                cc.eventManager.dispatchEvent(mouseEvent);

                event.stopPropagation();
                event.preventDefault();
            }, false);

            /* firefox fix */
            element.addEventListener("DOMMouseScroll", function(event) {
                var pos = selfPointer.getHTMLElementPosition(element);
                var location = selfPointer.getPointByEvent(event, pos);

                var mouseEvent = selfPointer.getMouseEvent(location,pos,cc.EventMouse.SCROLL);
                mouseEvent.setButton(event.button);
                mouseEvent.setScrollData(0, event.detail * -120);
                cc.eventManager.dispatchEvent(mouseEvent);

                event.stopPropagation();
                event.preventDefault();
            }, false);
        }

        if(window.navigator.msPointerEnabled){
            var _pointerEventsMap = {
                "MSPointerDown"     : "handleTouchesBegin",
                "MSPointerMove"     : "handleTouchesMove",
                "MSPointerUp"       : "handleTouchesEnd",
                "MSPointerCancel"   : "handleTouchesCancel"
            };

            for(var eventName in _pointerEventsMap){
                (function(_pointerEvent, _touchEvent){
                    element.addEventListener(_pointerEvent, function (event){
                        var pos = selfPointer.getHTMLElementPosition(element);
                        pos.left -= document.body.scrollLeft;
                        pos.top -= document.body.scrollTop;

                        selfPointer[_touchEvent]([selfPointer.getTouchByXY(event.clientX, event.clientY, pos)]);
                        event.stopPropagation();
                        event.preventDefault();
                    }, false);
                })(eventName, _pointerEventsMap[eventName]);
            }
        }

        if(supportTouches) {
            //register canvas touch event
            element.addEventListener("touchstart", function (event) {
                if (!event.changedTouches) return;

                var pos = selfPointer.getHTMLElementPosition(element);
                pos.left -= document.body.scrollLeft;
                pos.top -= document.body.scrollTop;
                selfPointer.handleTouchesBegin(selfPointer.getTouchesByEvent(event, pos));
                event.stopPropagation();
                event.preventDefault();
            }, false);

            element.addEventListener("touchmove", function (event) {
                if (!event.changedTouches) return;

                var pos = selfPointer.getHTMLElementPosition(element);
                pos.left -= document.body.scrollLeft;
                pos.top -= document.body.scrollTop;
                selfPointer.handleTouchesMove(selfPointer.getTouchesByEvent(event, pos));
                event.stopPropagation();
                event.preventDefault();
            }, false);

            element.addEventListener("touchend", function (event) {
                if (!event.changedTouches) return;

                var pos = selfPointer.getHTMLElementPosition(element);
                pos.left -= document.body.scrollLeft;
                pos.top -= document.body.scrollTop;
                selfPointer.handleTouchesEnd(selfPointer.getTouchesByEvent(event, pos));
                event.stopPropagation();
                event.preventDefault();
            }, false);

            element.addEventListener("touchcancel", function (event) {
                if (!event.changedTouches) return;

                var pos = selfPointer.getHTMLElementPosition(element);
                pos.left -= document.body.scrollLeft;
                pos.top -= document.body.scrollTop;
                locView.handleTouchesCancel(selfPointer.getTouchesByEvent(event, pos));
                event.stopPropagation();
                event.preventDefault();
            }, false);
        }

        //register keyboard event
        this._registerKeyboardEvent();

        //register Accelerometer event
        this._registerAccelerometerEvent();

        this._isRegisterEvent = true;
    },

    _registerKeyboardEvent: function(){
        document.addEventListener("keydown", function (e) {
            cc.eventManager.dispatchEvent(new cc.EventKeyboard(e.keyCode, true));
        });
        document.addEventListener("keyup", function (e) {
            cc.eventManager.dispatchEvent(new cc.EventKeyboard(e.keyCode, false));
        });
    },

    _registerAccelerometerEvent: function(){
        this._acceleration = new cc.Acceleration();
        var w = window;
        this._accelDeviceEvent = w.DeviceMotionEvent || w.DeviceOrientationEvent;

        //TODO fix DeviceMotionEvent bug on QQ Browser version 4.1 and below.
        if (cc.sys.browserType == cc.sys.BROWSER_TYPE_MOBILE_QQ)
            this._accelDeviceEvent = window.DeviceOrientationEvent;

        var _deviceEventType = (this._accelDeviceEvent == w.DeviceMotionEvent) ? "devicemotion" : "deviceorientation";
        var ua = navigator.userAgent;
        if (/Android/.test(ua) || (/Adr/.test(ua) && cc.sys.browserType == cc.BROWSER_TYPE_UC)) {
            this._minus = -1;
        }

        w.addEventListener(_deviceEventType, this.didAccelerate.bind(this), false);
    },

    didAccelerate: function (eventData) {
        if (!this._accelEnabled)
            return;

        var mAcceleration = this._acceleration;
        if (this._accelDeviceEvent == window.DeviceMotionEvent) {
            var eventAcceleration = eventData["accelerationIncludingGravity"];
            mAcceleration.x = this._accelMinus * eventAcceleration.x * 0.1;
            mAcceleration.y = this._accelMinus * eventAcceleration.y * 0.1;
            mAcceleration.z = eventAcceleration.z * 0.1;
        } else {
            mAcceleration.x = (eventData["gamma"] / 90) * 0.981;
            mAcceleration.y = -(eventData["beta"] / 90) * 0.981;
            mAcceleration.z = (eventData["alpha"] / 90) * 0.981;
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
        if(this._accelCurTime > this._accelInterval){
            this._accelCurTime -= this._accelInterval;
            cc.eventManager.dispatchEvent(new cc.EventAcceleration(this._acceleration));
        }
        this._accelCurTime += dt;
    }
};
