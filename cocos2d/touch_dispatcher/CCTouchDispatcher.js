/****************************************************************************
 Copyright (c) 2010-2012 cocos2d-x.org
 Copyright (c) 2008-2010 Ricardo Quesada
 Copyright (c) 2011      Zynga Inc.

 http://www.cocos2d-x.org

 Created by JetBrains WebStorm.
 User: wuhao
 Date: 12-3-5

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

cc.TouchSelectorBeganBit = 1 << 0;
cc.TouchSelectorMovedBit = 1 << 1;
cc.TouchSelectorEndedBit = 1 << 2;
cc.TouchSelectorCancelledBit = 1 << 3;
cc.TouchSelectorAllBits = ( cc.TouchSelectorBeganBit | cc.TouchSelectorMovedBit | cc.TouchSelectorEndedBit | cc.TouchSelectorCancelledBit);

cc.TOUCH_BEGAN = 0;
cc.TOUCH_MOVED = 1;
cc.TOUCH_ENDED = 2;
cc.TOUCH_CANCELLED = 3;
cc.TouchMax = 4;

cc.less = function (p1, p2) {
    return p1.getPriority() > p2.getPriority();
};

cc.TouchHandlerHelperData = function (type) {
    // we only use the type
    this.type = type;
};
/** @brief CCTouchDispatcher.
 Singleton that handles all the touch events.
 The dispatcher dispatches events to the registered TouchHandlers.
 There are 2 different type of touch handlers:
 - Standard Touch Handlers
 - Targeted Touch Handlers

 The Standard Touch Handlers work like the CocoaTouch touch handler: a set of touches is passed to the delegate.
 On the other hand, the Targeted Touch Handlers only receive 1 touch at the time, and they can "swallow" touches (avoid the propagation of the event).

 Firstly, the dispatcher sends the received touches to the targeted touches.
 These touches can be swallowed by the Targeted Touch Handlers. If there are still remaining touches, then the remaining touches will be sent
 to the Standard Touch Handlers.

 @since v0.8.0
 */
cc.TouchDispatcher = cc.Class.extend({
    _targetedHandlers:null,
    _standardHandlers:null,
    _locked:false,
    _toAdd:false,
    _toRemove:false,
    _handlersToAdd:null,
    _handlersToRemove:null,
    _toQuit:false,
    _dispatchEvents:false,

    _handlerHelperData:[new cc.TouchHandlerHelperData(cc.TOUCH_BEGAN), new cc.TouchHandlerHelperData(cc.TOUCH_MOVED),
        new cc.TouchHandlerHelperData(cc.TOUCH_ENDED), new cc.TouchHandlerHelperData(cc.TOUCH_CANCELLED)],

    /*
     +(id) allocWithZone:(CCZone *)zone
     {
     @synchronized(self) {
     CCAssert(sharedDispatcher == nil, @"Attempted to allocate a second instance of a singleton.");
     return [super allocWithZone:zone];
     }
     return nil; // on subsequent allocation attempts return nil
     }
     */
    init:function () {
        this._dispatchEvents = true;
        this._targetedHandlers = new Array();
        this._standardHandlers = new Array();

        this._handlersToAdd = new Array();
        this._handlersToRemove = new Array();

        this._toRemove = false;
        this._toAdd = false;
        this._toQuit = false;
        this._locked = false;

        return true;
    },

    /** Whether or not the events are going to be dispatched. Default: true */
    isDispatchEvents:function () {
        return this._dispatchEvents;
    },
    setDispatchEvents:function (bDispatchEvents) {
        this._dispatchEvents = bDispatchEvents;
    },

    /** Adds a standard touch delegate to the dispatcher's list.
     See StandardTouchDelegate description.
     IMPORTANT: The delegate will be retained.
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

    forceAddHandler:function (handler, array) {
        var u = 0;

        for (var i = 0; i < array.length; i++) {
            var h = array[i];
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

    forceRemoveAllDelegates:function () {
        this._standardHandlers.length = 0;
        this._targetedHandlers.length = 0;
    },
    /** Removes a touch delegate.
     The delegate will be released
     */
    removeDelegate:function (delegate) {
        if (delegate == null) {
            return;
        }

        if (!this._locked) {
            this.forceRemoveDelegate(delegate);
        } else {
            /* If handler is contained in m_pHandlersToAdd, if so remove it from m_pHandlersToAdd and retrun.
             * Refer issue #752(cocos2d-x)
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

    /** Removes all touch delegates, releasing all the delegates */
    removeAllDelegates:function () {
        if (!this._locked) {
            this.forceRemoveAllDelegates();
        } else {
            this._toQuit = true;
        }
    },

    /** Changes the priority of a previously added delegate. The lower the number,
     the higher the priority */
    setPriority:function (priority, delegate) {
        cc.Assert(delegate != null, "TouchDispatcher.setPriority():Arguments is null");

        var handler = this.findHandler(delegate);

        cc.Assert(handler != null, "TouchDispatcher.setPriority():Cant find TouchHandler");

        handler.setPriority(priority);

        this.rearrangeHandlers(this._targetedHandlers);
        this.rearrangeHandlers(this._standardHandlers);
    },

    touches:function (touches, event, index) {
        cc.Assert(index >= 0 && index < 4, "TouchDispatcher.touches()");

        this._locked = true;

        // optimization to prevent a mutable copy when it is not necessary
        var targetedHandlersCount = this._targetedHandlers.length;
        var standardHandlersCount = this._standardHandlers.length;
        var needsMutableSet = (targetedHandlersCount && standardHandlersCount);

        var mutableTouches = (needsMutableSet ? touches.slice() : touches);
        var helper = this._handlerHelperData[index];
        //
        // process the target handlers 1st
        //
        if (targetedHandlersCount > 0) {
            var touch;
            for (var i = 0; i < touches.length; i++) {
                touch = touches[i];
                var handler;

                for (var j = 0; j < this._targetedHandlers.length; j++) {
                    handler = this._targetedHandlers[j];

                    if (!handler) {
                        break;
                    }

                    var claimed = false;
                    if (index == cc.TOUCH_BEGAN) {
                        claimed = handler.getDelegate().ccTouchBegan(touch, event);

                        if (claimed) {
                            handler.getClaimedTouches().push(touch);
                        }
                        //} else if (handler.getClaimedTouches().indexOf(touch)> -1){
                    } else if (handler.getClaimedTouches().length > 0) {
                        // moved ended cancelled
                        claimed = true;
                        switch (helper.type) {
                            case cc.TOUCH_MOVED:
                                handler.getDelegate().ccTouchMoved(touch, event);
                                break;
                            case cc.TOUCH_ENDED:
                                handler.getDelegate().ccTouchEnded(touch, event);
                                handler.getClaimedTouches().length = 0;
                                //cc.ArrayRemoveObject(handler.getClaimedTouches(),touch);
                                break;
                            case cc.TOUCH_CANCELLED:
                                handler.getDelegate().ccTouchCancelled(touch, event);
                                handler.getClaimedTouches().length = 0;
                                //cc.ArrayRemoveObject(handler.getClaimedTouches(),touch);
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
        if (standardHandlersCount > 0) {
            for (i = 0; i < this._standardHandlers.length; i++) {
                handler = this._standardHandlers[i];

                if (!handler) {
                    break;
                }

                switch (helper.type) {
                    case cc.TOUCH_BEGAN:
                        if (mutableTouches.length > 0) {
                            handler.getDelegate().ccTouchesBegan(mutableTouches, event);
                        }
                        break;
                    case cc.TOUCH_MOVED:
                        if (mutableTouches.length > 0) {
                            handler.getDelegate().ccTouchesMoved(mutableTouches, event);
                        }
                        break;
                    case cc.TOUCH_ENDED:
                        handler.getDelegate().ccTouchesEnded(mutableTouches, event);
                        break;
                    case cc.TOUCH_CANCELLED:
                        handler.getDelegate().ccTouchesCancelled(mutableTouches, event);
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
            for (i = 0; i < this._handlersToRemove.length; i++) {
                this.forceRemoveDelegate(this._handlersToRemove[i]);
            }
            this._handlersToRemove.length = 0;
        }

        if (this._toAdd) {
            this._toAdd = false;

            for (i = 0; i < this._handlersToAdd.length; i++) {
                handler = this._handlersToAdd[i];
                if (!handler) {
                    break;
                }

                if (handler  instanceof cc.TargetedTouchHandler) {
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

    touchesBegan:function (touches, event) {
        if (this._dispatchEvents) {
            this.touches(touches, event, cc.TOUCH_BEGAN);
        }
    },
    touchesMoved:function (touches, event) {
        if (this._dispatchEvents) {
            this.touches(touches, event, cc.TOUCH_MOVED);
        }
    },
    touchesEnded:function (touches, event) {
        if (this._dispatchEvents) {
            this.touches(touches, event, cc.TOUCH_ENDED);
        }
    },
    touchesCancelled:function (touches, event) {
        if (this._dispatchEvents) {
            this.touches(touches, event, cc.TOUCH_CANCELLED);
        }
    },

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

    rearrangeHandlers:function (array) {
        array.sort(cc.less);
    }
});
cc.TouchDispatcher.preTouchPoint = new cc.Point(0, 0);
cc.TouchDispatcher.registerHtmlElementEvent = function (element) {
    //register canvas mouse event
    element.addEventListener("mousedown", function (event) {
        var el = element;
        var pos = null;
        if (element instanceof HTMLCanvasElement) {
            pos = {left:0, top:0, height:el.height};
        } else {
            pos = {left:0, top:0, height:parseInt(el.style.height)};
        }
        while (el != null) {
            pos.left += el.offsetLeft;
            pos.top += el.offsetTop;
            el = el.offsetParent;
        }

        var tx = event.pageX;
        var ty = event.pageY;

        var mouseX = (tx - pos.left) / cc.Director.sharedDirector().getContentScaleFactor();
        var mouseY = (pos.height - (ty - pos.top)) / cc.Director.sharedDirector().getContentScaleFactor();

        var touch = new cc.Touch(0, mouseX, mouseY);
        touch._setPrevPoint(cc.TouchDispatcher.preTouchPoint.x, cc.TouchDispatcher.preTouchPoint.y);
        cc.TouchDispatcher.preTouchPoint.x = mouseX;
        cc.TouchDispatcher.preTouchPoint.y = mouseY;

        var set = [];
        set.push(touch);
        cc.TouchDispatcher.sharedDispatcher().touchesBegan(set, null);
    });
    element.addEventListener("mouseup", function (event) {
        var el = element;
        var pos = null;
        if (element instanceof HTMLCanvasElement) {
            pos = {left:0, top:0, height:el.height};
        } else {
            pos = {left:0, top:0, height:parseInt(el.style.height)};
        }
        while (el != null) {
            pos.left += el.offsetLeft;
            pos.top += el.offsetTop;
            el = el.offsetParent;
        }
        var tx = event.pageX;
        var ty = event.pageY;

        var mouseX = (tx - pos.left) / cc.Director.sharedDirector().getContentScaleFactor();
        var mouseY = (pos.height - (ty - pos.top)) / cc.Director.sharedDirector().getContentScaleFactor();

        var touch = new cc.Touch(0, mouseX, mouseY);
        touch._setPrevPoint(cc.TouchDispatcher.preTouchPoint.x, cc.TouchDispatcher.preTouchPoint.y);
        cc.TouchDispatcher.preTouchPoint.x = mouseX;
        cc.TouchDispatcher.preTouchPoint.y = mouseY;

        var set = [];
        set.push(touch);
        cc.TouchDispatcher.sharedDispatcher().touchesEnded(set, null);
    });
    element.addEventListener("mousemove", function (event) {
        var el = element;
        var pos = null;
        if (element instanceof HTMLCanvasElement) {
            pos = {left:0, top:0, height:el.height};
        } else {
            pos = {left:0, top:0, height:parseInt(el.style.height)};
        }
        while (el != null) {
            pos.left += el.offsetLeft;
            pos.top += el.offsetTop;
            el = el.offsetParent;
        }
        var tx = event.pageX;
        var ty = event.pageY;

        var mouseX = (tx - pos.left) / cc.Director.sharedDirector().getContentScaleFactor();
        var mouseY = (pos.height - (ty - pos.top)) / cc.Director.sharedDirector().getContentScaleFactor();

        var touch = new cc.Touch(0, mouseX, mouseY);
        touch._setPrevPoint(cc.TouchDispatcher.preTouchPoint.x, cc.TouchDispatcher.preTouchPoint.y);
        cc.TouchDispatcher.preTouchPoint.x = mouseX;
        cc.TouchDispatcher.preTouchPoint.y = mouseY;

        var set = [];
        set.push(touch);

        cc.TouchDispatcher.sharedDispatcher().touchesMoved(set, null);
    });

    //register canvas touch event
    element.addEventListener("touchstart", function (event) {
        if (!event.touches)
            return;

        var set = [];
        var el = element;
        var pos = null;
        if (element instanceof HTMLCanvasElement) {
            pos = {left:0, top:0, height:el.height};
        } else {
            pos = {left:0, top:0, height:parseInt(el.style.height)};
        }
        while (el != null) {
            pos.left += el.offsetLeft;
            pos.top += el.offsetTop;
            el = el.offsetParent;
        }
        pos.left -= document.body.scrollLeft;
        pos.top -= document.body.scrollTop;

        for (var i = 0; i < event.touches.length; i++) {
            var tx = event.touches[i].pageX;
            var ty = event.touches[i].pageY;
            if (event.touches[i]) {
                tx = event.touches[i].clientX;
                ty = event.touches[i].clientY;
            }
            var mouseX = (tx - pos.left) / cc.Director.sharedDirector().getContentScaleFactor();
            var mouseY = (pos.height - (ty - pos.top)) / cc.Director.sharedDirector().getContentScaleFactor();

            var touch = new cc.Touch(0, mouseX, mouseY);
            touch._setPrevPoint(cc.TouchDispatcher.preTouchPoint.x, cc.TouchDispatcher.preTouchPoint.y);
            cc.TouchDispatcher.preTouchPoint.x = mouseX;
            cc.TouchDispatcher.preTouchPoint.y = mouseY;

            set.push(touch);
        }
        cc.TouchDispatcher.sharedDispatcher().touchesBegan(set, null);
        event.stopPropagation();
        event.preventDefault();
    }, false);
    element.addEventListener("touchmove", function (event) {
        if (!event.touches)
            return;

        var set = [];
        var el = element;
        var pos = null;
        if (element instanceof HTMLCanvasElement) {
            pos = {left:0, top:0, height:el.height};
        } else {
            pos = {left:0, top:0, height:parseInt(el.style.height)};
        }
        while (el != null) {
            pos.left += el.offsetLeft;
            pos.top += el.offsetTop;
            el = el.offsetParent;
        }
        pos.left -= document.body.scrollLeft;
        pos.top -= document.body.scrollTop;

        for (var i = 0; i < event.touches.length; i++) {
            var tx = event.touches[i].pageX;
            var ty = event.touches[i].pageY;
            if (event.touches[i]) {
                tx = event.touches[i].clientX;
                ty = event.touches[i].clientY;
            }
            var mouseX = (tx - pos.left) / cc.Director.sharedDirector().getContentScaleFactor();
            var mouseY = (pos.height - (ty - pos.top)) / cc.Director.sharedDirector().getContentScaleFactor();

            var touch = new cc.Touch(0, mouseX, mouseY);
            touch._setPrevPoint(cc.TouchDispatcher.preTouchPoint.x, cc.TouchDispatcher.preTouchPoint.y);
            cc.TouchDispatcher.preTouchPoint.x = mouseX;
            cc.TouchDispatcher.preTouchPoint.y = mouseY;

            set.push(touch);
        }
        cc.TouchDispatcher.sharedDispatcher().touchesMoved(set, null);
        event.stopPropagation();
        event.preventDefault();
    }, false);
    element.addEventListener("touchend", function (event) {
        if (!event.touches)
            return;

        var set = [];
        var el = element;
        var pos = null;
        if (element instanceof HTMLCanvasElement) {
            pos = {left:0, top:0, height:el.height};
        } else {
            pos = {left:0, top:0, height:parseInt(el.style.height)};
        }
        while (el != null) {
            pos.left += el.offsetLeft;
            pos.top += el.offsetTop;
            el = el.offsetParent;
        }
        pos.left -= document.body.scrollLeft;
        pos.top -= document.body.scrollTop;

        var fireTouches = event.touches;
        if(!fireTouches ||(fireTouches.length == 0)){
            fireTouches = event.changedTouches;
        }
        for (var i = 0; i < fireTouches.length; i++) {
            var tx = fireTouches[i].pageX;
            var ty = fireTouches[i].pageY;
            if (fireTouches[i]) {
                tx = fireTouches[i].clientX;
                ty = fireTouches[i].clientY;
            }

            var mouseX = (tx - pos.left)/ cc.Director.sharedDirector().getContentScaleFactor();
            var mouseY = (pos.height - (ty - pos.top))/ cc.Director.sharedDirector().getContentScaleFactor();

            var touch = new cc.Touch(0, mouseX, mouseY);
            touch._setPrevPoint(cc.TouchDispatcher.preTouchPoint.x, cc.TouchDispatcher.preTouchPoint.y);
            cc.TouchDispatcher.preTouchPoint.x = mouseX;
            cc.TouchDispatcher.preTouchPoint.y = mouseY;

            set.push(touch);
        }
        cc.TouchDispatcher.sharedDispatcher().touchesEnded(set, null);
        event.stopPropagation();
        event.preventDefault();
    }, false);
    element.addEventListener("touchcancel", function (event) {
        if (!event.touches)
            return;

        var set = [];
        var el = element;
        var pos = null;
        if (element instanceof HTMLCanvasElement) {
            pos = {left:0, top:0, height:el.height};
        } else {
            pos = {left:0, top:0, height:parseInt(el.style.height)};
        }
        while (el != null) {
            pos.left += el.offsetLeft;
            pos.top += el.offsetTop;
            el = el.offsetParent;
        }
        pos.left -= document.body.scrollLeft;
        pos.top -= document.body.scrollTop;

        for (var i = 0; i < event.touches.length; i++) {
            var tx = event.touches[i].pageX;
            var ty = event.touches[i].pageY;
            if (event.touches[i]) {
                tx = event.touches[i].clientX;
                ty = event.touches[i].clientY;
            }
            var mouseX = (tx - pos.left) / cc.Director.sharedDirector().getContentScaleFactor();
            var mouseY = (pos.height - (ty - pos.top)) / cc.Director.sharedDirector().getContentScaleFactor();

            var touch = new cc.Touch(0, mouseX, mouseY);
            touch._setPrevPoint(cc.TouchDispatcher.preTouchPoint.x, cc.TouchDispatcher.preTouchPoint.y);
            cc.TouchDispatcher.preTouchPoint.x = mouseX;
            cc.TouchDispatcher.preTouchPoint.y = mouseY;

            set.push(touch);
        }
        cc.TouchDispatcher.sharedDispatcher().touchesCancelled(set, null);
        event.stopPropagation();
        event.preventDefault();
    }, false);
};

cc._pSharedDispatcher = null;
cc.TouchDispatcher.sharedDispatcher = function () {
    if (cc._pSharedDispatcher == null) {
        //console.log("TouchDispatcher.sharedDispatcher()");
        cc._pSharedDispatcher = new cc.TouchDispatcher();
        cc._pSharedDispatcher.init();

        cc.TouchDispatcher.registerHtmlElementEvent(cc.canvas);
    }

    return cc._pSharedDispatcher;
};
