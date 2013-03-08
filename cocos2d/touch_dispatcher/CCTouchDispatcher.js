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
 * @constant
 * @type Number
 */
cc.TouchSelectorBeganBit = 1 << 0;

/**
 * @constant
 * @type Number
 */
cc.TouchSelectorMovedBit = 1 << 1;

/**
 * @constant
 * @type Number
 */
cc.TouchSelectorEndedBit = 1 << 2;

/**
 * @constant
 * @type Number
 */
cc.TouchSelectorCancelledBit = 1 << 3;

/**
 * @constant
 * @type Number
 */
cc.TouchSelectorAllBits = (cc.TouchSelectorBeganBit | cc.TouchSelectorMovedBit | cc.TouchSelectorEndedBit | cc.TouchSelectorCancelledBit);

/**
 * @constant
 * @type Number
 */
cc.TOUCH_BEGAN = 0;

/**
 * @constant
 * @type Number
 */
cc.TOUCH_MOVED = 1;

/**
 * @constant
 * @type Number
 */
cc.TOUCH_ENDED = 2;

/**
 * @constant
 * @type Number
 */
cc.TOUCH_CANCELLED = 3;

/**
 * @constant
 * @type Number
 */
cc.TouchMax = 4;

/**
 * @function
 * @param {cc.TouchHandler} p1
 * @param {cc.TouchHandler} p2
 * @return {Boolean}
 */
cc.less = function (p1, p2) {
    return p1.getPriority() > p2.getPriority();
};

/**
 * @param {Number} type
 * Constructor
 */
cc.TouchHandlerHelperData = function (type) {
    // we only use the type
    this.type = type;
};

/**
 * cc.TouchDispatcher.
 * Singleton that handles all the touch events.
 * The dispatcher dispatches events to the registered TouchHandlers.
 * There are 2 different type of touch handlers:
 * - Standard Touch Handlers
 * - Targeted Touch Handlers
 *
 * The Standard Touch Handlers work like the CocoaTouch touch handler: a set of touches is passed to the delegate.
 * On the other hand, the Targeted Touch Handlers only receive 1 touch at the time, and they can "swallow" touches (avoid the propagation of the event).
 *
 * Firstly, the dispatcher sends the received touches to the targeted touches.
 * These touches can be swallowed by the Targeted Touch Handlers. If there are still remaining touches, then the remaining touches will be sent
 * to the Standard Touch Handlers.
 * @class
 * @extends cc.Class
 */
cc.TouchDispatcher = cc.Class.extend(/** @lends cc.TouchDispatcher# */ {
    _mousePressed:false,
    _targetedHandlers:null,
    _standardHandlers:null,
    _locked:false,
    _toAdd:false,
    _toRemove:false,
    _handlersToAdd:null,
    _handlersToRemove:null,
    _toQuit:false,
    _dispatchEvents:false,
    _handlerHelperData:[new cc.TouchHandlerHelperData(cc.TOUCH_BEGAN), new cc.TouchHandlerHelperData(cc.TOUCH_MOVED), new cc.TouchHandlerHelperData(cc.TOUCH_ENDED), new cc.TouchHandlerHelperData(cc.TOUCH_CANCELLED)],

    /**
     * @return {Boolean}
     */
    init:function () {
        this._dispatchEvents = true;
        this._targetedHandlers = [];
        this._standardHandlers = [];
        this._handlersToAdd = [];
        this._handlersToRemove = [];
        this._toRemove = false;
        this._toAdd = false;
        this._toQuit = false;
        this._locked = false;
        this._mousePressed = false;
        cc.TouchDispatcher.registerHtmlElementEvent(cc.canvas);
        return true;
    },

    _setMousePressed:function (pressed) {
        this._mousePressed = pressed;
    },

    _getMousePressed:function () {
        return this._mousePressed;
    },

    /**
     * Whether or not the events are going to be dispatched. Default: true
     * @return {Boolean}
     */
    isDispatchEvents:function () {
        return this._dispatchEvents;
    },

    /**
     * @param {Boolean} dispatchEvents
     */
    setDispatchEvents:function (dispatchEvents) {
        this._dispatchEvents = dispatchEvents;
    },

    /**
     * Adds a standard touch delegate to the dispatcher's list.
     * See StandardTouchDelegate description.
     * IMPORTANT: The delegate will be retained.
     * @param {cc.TouchDelegate} delegate
     * @param {Number} priority
     */
    addStandardDelegate:function (delegate, priority) {
        var handler = cc.StandardTouchHandler.handlerWithDelegate(delegate, priority);

        if (!this._locked) {
            this._standardHandlers = this.forceAddHandler(handler, this._standardHandlers);
        } else {
            /* If handler is contained in m_pHandlersToRemove, if so remove it from m_pHandlersToRemove and retrun.
             * Refer issue #752(cocos2d-x)
             */
            if (this._handlersToRemove.indexOf(delegate) != -1) {
                cc.ArrayRemoveObject(this._handlersToRemove, delegate);
                return;
            }

            this._handlersToAdd.push(handler);
            this._toAdd = true;
        }
    },

    /**
     * @param {cc.TouchDelegate} delegate
     * @param {Number} priority
     * @param {Boolean} swallowsTouches
     */
    addTargetedDelegate:function (delegate, priority, swallowsTouches) {
        var handler = cc.TargetedTouchHandler.handlerWithDelegate(delegate, priority, swallowsTouches);
        if (!this._locked) {
            this._targetedHandlers = this.forceAddHandler(handler, this._targetedHandlers);
        } else {
            /* If handler is contained in m_pHandlersToRemove, if so remove it from m_pHandlersToRemove and retrun.
             * Refer issue #752(cocos2d-x)
             */
            if (this._handlersToRemove.indexOf(delegate) != -1) {
                cc.ArrayRemoveObject(this._handlersToRemove, delegate);
                return;
            }

            this._handlersToAdd.push(handler);
            this._toAdd = true;
        }
    },

    /**
     *  Force add handler
     * @param {cc.TouchHandler} handler
     * @param {Array} array
     * @return {Array}
     */
    forceAddHandler:function (handler, array) {
        var u = 0,
            h;

        for (var i = 0; i < array.length; i++) {
            h = array[i];
            if (h) {
                if (h.getPriority() < handler.getPriority()) {
                    ++u;
                }
                if (h.getDelegate() == handler.getDelegate()) {
                    cc.Assert(0, "TouchDispatcher.forceAddHandler()");
                    return array;
                }
            }
        }
        return cc.ArrayAppendObjectToIndex(array, handler, u);
    },

    /**
     *  Force remove all delegates
     */
    forceRemoveAllDelegates:function () {
        this._standardHandlers.length = 0;
        this._targetedHandlers.length = 0;
    },

    /**
     * Removes a touch delegate.
     * The delegate will be released
     * @param {cc.TouchDelegate} delegate
     */
    removeDelegate:function (delegate) {
        if (delegate == null) {
            return;
        }

        if (!this._locked) {
            this.forceRemoveDelegate(delegate);
        } else {
            /*
             * If handler is contained in m_pHandlersToAdd, if so remove it from m_pHandlersToAdd and return.
             */
            var handler = this.findHandler(this._handlersToAdd, delegate);
            if (handler) {
                cc.ArrayRemoveObject(this._handlersToAdd, handler);
                return;
            }

            this._handlersToRemove.push(delegate);
            this._toRemove = true;
        }
    },

    /**
     * Removes all touch delegates, releasing all the delegates
     */
    removeAllDelegates:function () {
        if (!this._locked) {
            this.forceRemoveAllDelegates();
        } else {
            this._toQuit = true;
        }
    },

    /**
     * Changes the priority of a previously added delegate. The lower the number,  the higher the priority
     * @param {Number} priority
     * @param {cc.TouchDelegate} delegate
     */
    setPriority:function (priority, delegate) {
        cc.Assert(delegate != null, "TouchDispatcher.setPriority():Arguments is null");

        var handler = this.findHandler(delegate);

        cc.Assert(handler != null, "TouchDispatcher.setPriority():Cant find TouchHandler");

        if (handler.getPriority() != priority) {
            handler.setPriority(priority);

            this.rearrangeHandlers(this._targetedHandlers);
            this.rearrangeHandlers(this._standardHandlers);
        }
    },

    /**
     * @param {Array} touches
     * @param {event} event
     * @param {Number} index
     */
    touches:function (touches, event, index) {
        cc.Assert(index >= 0 && index < 4, "TouchDispatcher.touches()");

        this._locked = true;

        // optimization to prevent a mutable copy when it is not necessary
        var targetedHandlersCount = this._targetedHandlers.length;
        var standardHandlersCount = this._standardHandlers.length;
        var needsMutableSet = (targetedHandlersCount && standardHandlersCount);

        var mutableTouches = (needsMutableSet ? touches.slice() : touches);
        var helper = this._handlerHelperData[index];

        var i, j, k, handler;
        //
        // process the target handlers 1st
        //
        if (targetedHandlersCount > 0) {
            var touch, claimed;
            var touchesLength = touches.length;
            for (i = 0; i < touchesLength; i++) {
                touch = touches[i];

                for (j = 0; j < targetedHandlersCount; j++) {
                    handler = this._targetedHandlers[j];

                    if (!handler) {
                        break;
                    }

                    claimed = false;
                    if (index == cc.TOUCH_BEGAN) {
                        if (handler.getDelegate().onTouchBegan) {
                            claimed = handler.getDelegate().onTouchBegan(touch, event);
                            if (claimed) {
                                handler.getClaimedTouches().push(touch);
                            }
                        }
                    } else if (cc.ArrayContainsObject(handler.getClaimedTouches(), touch)) {
                        claimed = true;
                        // moved ended cancelled
                        switch (helper.type) {
                            case cc.TOUCH_MOVED:
                                if (cc.Browser.isMobile) {
                                    if (handler.getDelegate().onTouchMoved) handler.getDelegate().onTouchMoved(touch, event);
                                } else {
                                    if (this._mousePressed) if (handler.getDelegate().onTouchMoved) handler.getDelegate().onTouchMoved(touch, event);
                                }
                                break;
                            case cc.TOUCH_ENDED:
                                if (handler.getDelegate().onTouchEnded) handler.getDelegate().onTouchEnded(touch, event);
                                cc.ArrayRemoveObject(handler.getClaimedTouches(), touch);
                                break;
                            case cc.TOUCH_CANCELLED:
                                if (handler.getDelegate().onTouchCancelled) handler.getDelegate().onTouchCancelled(touch, event);
                                cc.ArrayRemoveObject(handler.getClaimedTouches(), touch);
                                break;
                        }
                    }

                    if (claimed && handler.isSwallowsTouches()) {
                        if (needsMutableSet) {
                            cc.ArrayRemoveObject(mutableTouches, touch);
                        }
                        break;
                    }
                }
            }
        }

        //
        // process standard handlers 2nd
        //
        if (standardHandlersCount > 0 && mutableTouches.length > 0) {
            for (i = 0; i < standardHandlersCount; i++) {
                handler = this._standardHandlers[i];

                if (!handler) {
                    break;
                }

                switch (helper.type) {
                    case cc.TOUCH_BEGAN:
                        if (handler.getDelegate().onTouchesBegan) handler.getDelegate().onTouchesBegan(mutableTouches, event);
                        break;
                    case cc.TOUCH_MOVED:
                        if (cc.Browser.isMobile) {
                            if (handler.getDelegate().onTouchesMoved) handler.getDelegate().onTouchesMoved(mutableTouches, event);
                        } else {
                            if (this._mousePressed) if (handler.getDelegate().onTouchesMoved) handler.getDelegate().onTouchesMoved(mutableTouches, event);
                        }
                        break;
                    case cc.TOUCH_ENDED:
                        if (handler.getDelegate().onTouchesEnded) handler.getDelegate().onTouchesEnded(mutableTouches, event);
                        break;
                    case cc.TOUCH_CANCELLED:
                        if (handler.getDelegate().onTouchesCancelled) handler.getDelegate().onTouchesCancelled(mutableTouches, event);
                        break;
                }
            }
        }

        if (needsMutableSet) {
            mutableTouches = null;
        }

        //
        // Optimization. To prevent a [handlers copy] which is expensive
        // the add/removes/quit is done after the iterations
        //
        this._locked = false;
        if (this._toRemove) {
            this._toRemove = false;
            var handlersToRemoveLength = this._handlersToRemove.length;
            for (i = 0; i < handlersToRemoveLength; i++) {
                this.forceRemoveDelegate(this._handlersToRemove[i]);
            }
            this._handlersToRemove.length = 0;
        }

        if (this._toAdd) {
            this._toAdd = false;

            var handlersToAddLength = this._handlersToAdd.length;
            for (i = 0; i < handlersToAddLength; i++) {
                handler = this._handlersToAdd[i];
                if (!handler) {
                    break;
                }

                if (handler instanceof cc.TargetedTouchHandler) {
                    this._targetedHandlers = this.forceAddHandler(handler, this._targetedHandlers);
                } else {
                    this._standardHandlers = this.forceAddHandler(handler, this._standardHandlers);
                }
            }
            this._handlersToAdd.length = 0;
        }

        if (this._toQuit) {
            this._toQuit = false;
            this.forceRemoveAllDelegates();
        }
    },

    /**
     * @param {Array} touchesArray
     * @param {Number} id
     */
    _searchIndexOfTouchWithId:function (touchesArray, id) {
        var ret = -1;
        var touchesArrayLength = touchesArray.length;
        for (var i = 0; i < touchesArrayLength; i++) {
            if (touchesArray[i].getId() == id) {
                ret = i;
                break;
            }
        }
        return ret;
    },

    /**
     * @param {Array} touches
     * @param {event} event
     */
    touchesBegan:function (touches, event) {
        if (this._dispatchEvents) {
            this.touches(touches, event, cc.TOUCH_BEGAN);
        }
    },

    /**
     * @param {Array} touches
     * @param {event} event
     */
    touchesMoved:function (touches, event) {
        if (this._dispatchEvents) {
            this.touches(touches, event, cc.TOUCH_MOVED);
        }
    },

    /**
     * @param {Array} touches
     * @param {event} event
     */
    touchesEnded:function (touches, event) {
        if (this._dispatchEvents) {
            this.touches(touches, event, cc.TOUCH_ENDED);
        }
    },

    /**
     * @param {Array} touches
     * @param {event} event
     */
    touchesCancelled:function (touches, event) {
        if (this._dispatchEvents) {
            this.touches(touches, event, cc.TOUCH_CANCELLED);
        }
    },

    /**
     * @param {Array||cc.TouchDelegate} array array or delegate
     * @param {cc.TouchDelegate} delegate
     * @return {cc.TargetedTouchHandler|cc.StandardTouchHandler|Null}
     */
    findHandler:function (array, delegate) {
        switch (arguments.length) {
            case 1:
                delegate = arguments[0];
                for (var i = 0; i < this._targetedHandlers.length; i++) {
                    if (this._targetedHandlers[i].getDelegate() == delegate) {
                        return this._targetedHandlers[i];
                    }
                }
                for (i = 0; i < this._standardHandlers.length; i++) {
                    if (this._standardHandlers[i].getDelegate() == delegate) {
                        return this._standardHandlers[i];
                    }
                }
                return null;
                break;
            case 2:
                cc.Assert(array != null && delegate != null, "TouchDispatcher.findHandler():Arguments is null");

                for (i = 0; i < array.length; i++) {
                    if (array[i].getDelegate() == delegate) {
                        return array[i];
                    }
                }

                return null;
                break;
            default:
                throw "Argument must be non-nil ";
                break;
        }
    },

    /**
     * @param {cc.TouchDelegate} delegate
     */
    forceRemoveDelegate:function (delegate) {
        var handler;
        // XXX: remove it from both handlers ???
        // remove handler from m_pStandardHandlers
        for (var i = 0; i < this._standardHandlers.length; i++) {
            handler = this._standardHandlers[i];
            if (handler && handler.getDelegate() == delegate) {
                cc.ArrayRemoveObject(this._standardHandlers, handler);
                break;
            }
        }

        for (i = 0; i < this._targetedHandlers.length; i++) {
            handler = this._targetedHandlers[i];
            if (handler && handler.getDelegate() == delegate) {
                cc.ArrayRemoveObject(this._targetedHandlers, handler);
                break;
            }
        }
    },

    /**
     * @param {Array} array
     */
    rearrangeHandlers:function (array) {
        array.sort(cc.less);
    }
});

/**
 * @type {cc.Touch}
 */
cc.TouchDispatcher.activeTouch = new cc.Touch();

cc.TouchDispatcher.isRegisterEvent = false;

/**
 * @type {cc.Dictionary}
 */
cc.TouchDispatcher._preTouchCache = null;

cc.getHTMLElementPosition = function (element) {
    var docElem = document.documentElement;
    var win = window;
    var box = null;
    if (typeof element.getBoundingClientRect === 'function') {
        box = element.getBoundingClientRect();

    } else {
        if (element instanceof HTMLCanvasElement) {
            box = {
                left:0,
                top:0,
                width:element.width,
                height:element.height
            };
        } else {
            box = {
                left:0,
                top:0,
                width:parseInt(element.style.width),
                height:parseInt(element.style.height)
            };
        }
    }
    return {
        left:box.left + win.pageXOffset - docElem.clientLeft,
        top:box.top + win.pageYOffset - docElem.clientTop,
        width:box.width,
        height:box.height
    };
};

cc.ProcessMouseupEvent = function (element, event, rectTest) {
    var pos = cc.getHTMLElementPosition(element);

    var tx, ty;
    if ((event.pageX) != undefined) { //not avalable in <= IE8
        tx = event.pageX;
        ty = event.pageY;
    } else {
        pos.left -= document.body.scrollLeft || document.documentElement.scrollLeft;
        pos.top -= document.body.scrollTop || document.documentElement.scrollTop;
        tx = event.clientX;
        ty = event.clientY;
    }

    var rectContainsPoint;
    if (rectTest) {
        rectContainsPoint = (!cc.rectContainsPoint(new cc.Rect(pos.left, pos.top, pos.width, pos.height), cc.p(tx, ty)));
    } else {
        rectContainsPoint = true;
    }

    if (rectContainsPoint) {
        var mouseX = (tx - pos.left) / cc.Director.getInstance().getContentScaleFactor();
        var mouseY = (pos.height - (ty - pos.top)) / cc.Director.getInstance().getContentScaleFactor();

        var touch = cc.TouchDispatcher.activeTouch;
        touch.setTouchInfo(0, mouseX, mouseY);

        var posArr = [];
        posArr.push(touch);
        cc.Director.getInstance().getTouchDispatcher().touchesEnded(posArr, null);
    }
};
/**
 * @param {HTMLCanvasElement|HTMLDivElement} element
 */
cc.TouchDispatcher.registerHtmlElementEvent = function (element) {
    if (cc.TouchDispatcher.isRegisterEvent) return;

    if (!cc.Browser.isMobile) {
        window.addEventListener('mousedown', function (event) {
            cc.Director.getInstance().getTouchDispatcher()._setMousePressed(true);
        });

        window.addEventListener('mouseup', function (event) {
            cc.Director.getInstance().getTouchDispatcher()._setMousePressed(false);
            cc.ProcessMouseupEvent(element, event, true);
        });

        //register canvas mouse event
        element.addEventListener("mousedown", function (event) {
            var pos = cc.getHTMLElementPosition(element);

            var tx, ty;
            if ((event.pageX) != undefined) { //not avalable in <= IE8
                tx = event.pageX;
                ty = event.pageY;
            } else {
                pos.left -= document.body.scrollLeft || document.documentElement.scrollLeft;
                pos.top -= document.body.scrollTop || document.documentElement.scrollTop;
                tx = event.clientX;
                ty = event.clientY;
            }

            var mouseX = (tx - pos.left) / cc.Director.getInstance().getContentScaleFactor();
            var mouseY = (pos.height - (ty - pos.top)) / cc.Director.getInstance().getContentScaleFactor();

            var touch = cc.TouchDispatcher.activeTouch;
            touch.setTouchInfo(0, mouseX, mouseY);

            var posArr = [];
            posArr.push(touch);
            cc.Director.getInstance().getTouchDispatcher().touchesBegan(posArr, null);
        });

        element.addEventListener("mouseup", function (event) {
            cc.ProcessMouseupEvent(element, event, false);
        });

        element.addEventListener("mousemove", function (event) {
            var pos = cc.getHTMLElementPosition(element);

            var tx, ty;
            if ((event.pageX) != undefined) { //not avalable in <= IE8
                tx = event.pageX;
                ty = event.pageY;
            } else {
                pos.left -= document.body.scrollLeft || document.documentElement.scrollLeft;
                pos.top -= document.body.scrollTop || document.documentElement.scrollTop;
                tx = event.clientX;
                ty = event.clientY;
            }

            var mouseX = (tx - pos.left) / cc.Director.getInstance().getContentScaleFactor();
            var mouseY = (pos.height - (ty - pos.top)) / cc.Director.getInstance().getContentScaleFactor();

            var touch = cc.TouchDispatcher.activeTouch;
            touch.setTouchInfo(0, mouseX, mouseY);

            var posArr = [];
            posArr.push(touch);

            cc.Director.getInstance().getTouchDispatcher().touchesMoved(posArr, null);
        });
    } else {
        if (!(cc.TouchDispatcher._preTouchCache)) {
            cc.TouchDispatcher._preTouchCache = cc.Dictionary.create(50);
        }

        //register canvas touch event
        element.addEventListener("touchstart", function (event) {
            if (!event.changedTouches) return;

            var posArr = [];
            var pos = cc.getHTMLElementPosition(element);

            pos.left -= document.body.scrollLeft || document.documentElement.scrollLeft;
            pos.top -= document.body.scrollTop || document.documentElement.scrollTop;

            var touch_event, tx, ty, mouseX, mouseY, touch, preLocation, preTouch;
            var length = event.changedTouches.length;
            for (var i = 0; i < length; i++) {
                touch_event = event.changedTouches[i];
                //tx = touch_event.pageX;
                //ty = touch_event.pageY;
                if (touch_event) {
                    tx = touch_event.clientX;
                    ty = touch_event.clientY;

                    mouseX = (tx - pos.left) / cc.Director.getInstance().getContentScaleFactor();
                    mouseY = (pos.height - (ty - pos.top)) / cc.Director.getInstance().getContentScaleFactor();
                    touch = null;
                    if (touch_event.hasOwnProperty("identifier")) {
                        touch = cc.TouchDispatcher._preTouchCache.getObjectForKey(touch_event.identifier);
                        if (!touch) {
                            touch = new cc.Touch(mouseX, mouseY, touch_event.identifier);
                            cc.TouchDispatcher._preTouchCache.setObjectForKey(touch, touch.getId());
                        }
                        touch.setTouchInfo(touch.getId(), mouseX, mouseY);
                    } else {
                        touch = cc.TouchDispatcher.activeTouch;
                        touch.setTouchInfo(0, mouseX, mouseY);
                    }

                    posArr.push(touch);
                }
            }
            cc.Director.getInstance().getTouchDispatcher().touchesBegan(posArr, null);
            event.stopPropagation();
            event.preventDefault();
        }, false);

        element.addEventListener("touchmove", function (event) {
            if (!event.changedTouches) return;

            var posArr = [];
            var pos = cc.getHTMLElementPosition(element);

            pos.left -= document.body.scrollLeft || document.documentElement.scrollLeft;
            pos.top -= document.body.scrollTop || document.documentElement.scrollTop;

            var touch_event, tx, ty, mouseX, mouseY, touch, preLocation, preTouch;
            var length = event.changedTouches.length;
            for (var i = 0; i < length; i++) {
                touch_event = event.changedTouches[i];
                //tx = touch_event.pageX;
                //ty = touch_event.pageY;
                if (touch_event) {
                    tx = touch_event.clientX;
                    ty = touch_event.clientY;

                    mouseX = (tx - pos.left) / cc.Director.getInstance().getContentScaleFactor();
                    mouseY = (pos.height - (ty - pos.top)) / cc.Director.getInstance().getContentScaleFactor();

                    touch = null;
                    if (touch_event.hasOwnProperty("identifier")) {
                        touch = cc.TouchDispatcher._preTouchCache.getObjectForKey(touch_event.identifier);
                        if (!touch) {
                            touch = new cc.Touch(mouseX, mouseY, touch_event.identifier);
                            cc.TouchDispatcher._preTouchCache.setObjectForKey(touch, touch.getId());
                        }
                        touch.setTouchInfo(touch.getId(), mouseX, mouseY);
                    } else {
                        touch = cc.TouchDispatcher.activeTouch;
                        touch.setTouchInfo(0, mouseX, mouseY);
                    }

                    posArr.push(touch);
                }
            }
            cc.Director.getInstance().getTouchDispatcher().touchesMoved(posArr, null);
            event.stopPropagation();
            event.preventDefault();
        }, false);

        element.addEventListener("touchend", function (event) {
            if (!event.changedTouches) return;

            var posArr = [];
            var pos = cc.getHTMLElementPosition(element);

            pos.left -= document.body.scrollLeft || document.documentElement.scrollLeft;
            pos.top -= document.body.scrollTop || document.documentElement.scrollTop;

            var touch_event, tx, ty, mouseX, mouseY, touch, preLocation, preTouch;
            var length = event.changedTouches.length;
            for (var i = 0; i < length; i++) {
                touch_event = event.changedTouches[i];
                //tx = touch_event.pageX;
                //ty = touch_event.pageY;
                if (touch_event) {
                    tx = touch_event.clientX;
                    ty = touch_event.clientY;

                    mouseX = (tx - pos.left) / cc.Director.getInstance().getContentScaleFactor();
                    mouseY = (pos.height - (ty - pos.top)) / cc.Director.getInstance().getContentScaleFactor();

                    touch = null;
                    if (touch_event.hasOwnProperty("identifier")) {
                        touch = cc.TouchDispatcher._preTouchCache.getObjectForKey(touch_event.identifier);
                        if (!touch) {
                            touch = new cc.Touch(mouseX, mouseY, touch_event.identifier);
                        }
                        touch.setTouchInfo(touch.getId(), mouseX, mouseY);
                        cc.TouchDispatcher._preTouchCache.removeObjectForKey(touch.getId());
                    } else {
                        touch = cc.TouchDispatcher.activeTouch;
                        touch.setTouchInfo(0, mouseX, mouseY);
                    }

                    posArr.push(touch);
                }
            }
            cc.Director.getInstance().getTouchDispatcher().touchesEnded(posArr, null);
            event.stopPropagation();
            event.preventDefault();
        }, false);

        element.addEventListener("touchcancel", function (event) {
            if (!event.changedTouches) return;

            var posArr = [];
            var pos = cc.getHTMLElementPosition(element);

            pos.left -= document.body.scrollLeft || document.documentElement.scrollLeft;
            pos.top -= document.body.scrollTop || document.documentElement.scrollTop;

            var touch_event, tx, ty, mouseX, mouseY, touch, preLocation, preTouch;
            var length = event.changedTouches.length;
            for (var i = 0; i < length; i++) {
                touch_event = event.changedTouches[i];
                //tx = touch_event.pageX;
                //ty = touch_event.pageY;
                if (touch_event) {
                    tx = touch_event.clientX;
                    ty = touch_event.clientY;

                    mouseX = (tx - pos.left) / cc.Director.getInstance().getContentScaleFactor();
                    mouseY = (pos.height - (ty - pos.top)) / cc.Director.getInstance().getContentScaleFactor();

                    touch = null;
                    if (touch_event.hasOwnProperty("identifier")) {
                        touch = cc.TouchDispatcher._preTouchCache.getObjectForKey(touch_event.identifier);
                        if (!touch) {
                            touch = new cc.Touch(mouseX, mouseY, touch_event.identifier);
                        }
                        touch.setTouchInfo(touch.getId(), mouseX, mouseY);
                        cc.TouchDispatcher._preTouchCache.removeObjectForKey(touch.getId());
                    } else {
                        touch = cc.TouchDispatcher.activeTouch;
                        touch.setTouchInfo(0, mouseX, mouseY);
                    }

                    posArr.push(touch);
                }
            }
            cc.Director.getInstance().getTouchDispatcher().touchesCancelled(posArr, null);
            event.stopPropagation();
            event.preventDefault();
        }, false);
    }

    cc.TouchDispatcher.isRegisterEvent = true;
};

/**
 * cc.Dictionary
 *
 * A generic implementation of a Dictionary/Map, with a optional maximum size.
 * It uses an separate key, for a faster search.
 * All keys are unique, objects must not.
 *
 * @class
 * @extends cc.Class
 */
cc.Dictionary = cc.Class.extend({
    _valueList: {},
    _keyList: null,
    _maxLength: 0,
    _writePointer: 0,

    /**
     * Constructor
     * @param {cc.Dictionary} dictionaryObject
     */
    ctor:function (dictionaryObject) {
        if (dictionaryObject) {
            if (dictionaryObject._maxLength > 0) {
                this._keyList = [].concat(dictionaryObject._keyList);
                this._maxLength = dictionaryObject._maxLength;
                this._writePointer = dictionaryObject._writePointer;
            }

            for (var key in dictionaryObject._valueList) {
                this._valueList[key] = dictionaryObject._valueList[key];
            }
        }
    },

    /**
     * @param {Number} maxLength
     */
    initWithMaxLength:function (maxLength) {
        cc.Assert(maxLength >= 0, "");
        if (maxLength && maxLength >= 0) {
            this._keyList = [];
            this._maxLength = maxLength;
        }
        return true;
    },

    /**
     * Return a copy of the cc.Dictionary, it will copy all the elments.
     * @return {cc.Dictionary}
     */
    copy:function () {
        return new cc.Dictionary(this);
    },

    /**
     * It is the same as copy().
     * @return {cc.Dictionary}
     */
    mutableCopy:function () {
        return this.copy();
    },

    /**
     * Return the number of keys the cc.Dictionary contains.
     * @return {Number} keylist length
     */
    count:function () {
        var length = 0;
        if (!this._keyList) {
            var key;
            for (key in this._valueList) {
                if (this._valueList.hasOwnProperty(key)) {
                    length++;
                }
            }
        } else {
            length = this._keyList.length;
        }
        return length;
    },

    /**
     * Return a list of all keys the cc.Dictionary contains.
     * @return {Array} keylist
     */
    getKeyList:function () {
        var keylist = this._keyList;
        if (!keylist) {
            keylist = [];

            var i = 0, key;
            for (key in this._valueList) {
                if (this._valueList.hasOwnProperty(key)) {
                    keyist[i] = key;
                    i++;
                }
            }
        }
        return keylist;
    },

    /**
     * Return the object for a key.
     * @param {*} key
     */
    getObjectForKey:function (key) {
        return this._valueList[key];
    },

    /**
     * Add a object for the given key.
     * @param {*} object for key
     * @param {*} key
     */
    setObjectForKey:function (obj, key) {
        if (this._maxLength > 0) {
            if (!this._valueList[key]) {
                if (this._keyList.length <= this._maxLength) {
                    this._keyList.push(key);
                } else {
                    //use it as a ringBuffer (override the oldest one)
                    delete this._valueList[this._keyList[this._writePointer]];
                    this._keyList[this._writePointer] = key;
                    this._writePointer = (this._writePointer + 1) % this._maxLength;
                }
                //debug (to test with maxLength){
                //cc.log("DataCache.length: " + this._keyList.length);
                //cc.log("valueList: ");
                //cc.log(this._valueList);
                //}
            }
        }
        this._valueList[key] = obj;
        //debug (to test without maxLength){
        //cc.log("DataCache.length: " + this.getLength());
        //cc.log("keyList: ");
        //cc.log(this.getKeyList());
        //}
    },

    /**
     * Remove the object and the key for the given key, nothing todo if no element equals key.
     * @param {*} key
     */
    removeObjectForKey:function (key) {
        if (this._maxLength > 0) {
            cc.ArrayRemoveObject(this._keyList, key);
        }
        delete this._valueList[key];
    }


});

cc.Dictionary.create = function (maxLength) {
    var dictionary = new cc.Dictionary();
    if (maxLength) {
        dictionary.initWithMaxLength(maxLength);
    }
    return dictionary;
};