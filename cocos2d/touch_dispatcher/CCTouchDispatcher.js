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

cc.TouchSelectorBeganBit =1 << 0;
cc.TouchSelectorMovedBit = 1 << 1;
cc.TouchSelectorEndedBit = 1 << 2;
cc.TouchSelectorCancelledBit = 1 << 3;
cc.TouchSelectorAllBits = ( cc.TouchSelectorBeganBit | cc.TouchSelectorMovedBit | cc.TouchSelectorEndedBit | cc.TouchSelectorCancelledBit);

cc.TOUCHBEGAN = 0;
cc.TOUCHMOVED = 1;
cc.TOUCHENDED = 2;
cc.TOUCHCANCELLED = 3;
cc.TouchMax = 4;

cc.less = function(p1,p2){
    return p1.getPriority() < p2.getPriority();
};

 cc.TouchHandlerHelperData=function(mType){
    // we only use the type
    this.m_type = mType;
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
    _m_pTargetedHandlers:null,
    _m_pStandardHandlers:null,
    _m_bLocked:false,
    _m_bToAdd:false,
    _m_bToRemove:false,
    _m_pHandlersToAdd:null,
    _m_pHandlersToRemove:null,
    _m_bToQuit:false,
    _m_bDispatchEvents:false,

    _m_sHandlerHelperData:[new cc.TouchHandlerHelperData(cc.TOUCHBEGAN),new cc.TouchHandlerHelperData(cc.TOUCHMOVED),
        new cc.TouchHandlerHelperData(cc.TOUCHENDED),new cc.TouchHandlerHelperData(cc.TOUCHCANCELLED)],

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
    init:function(){
        this._m_bDispatchEvents = true;
        this._m_pTargetedHandlers = new Array();
        this._m_pStandardHandlers = new Array();

        this._m_pHandlersToAdd = new Array();
        this._m_pHandlersToRemove = new Array();

        this._m_bToRemove = false;
        this._m_bToAdd = false;
        this._m_bToQuit = false;
        this._m_bLocked = false;

        return true;
    },

    /** Whether or not the events are going to be dispatched. Default: true */
    isDispatchEvents:function(){return this._m_bDispatchEvents;},
    setDispatchEvents:function(bDispatchEvents){this._m_bDispatchEvents = bDispatchEvents;},

    /** Adds a standard touch delegate to the dispatcher's list.
     See StandardTouchDelegate description.
     IMPORTANT: The delegate will be retained.
     */
    addStandardDelegate:function(pDelegate,nPriority){
        var pHandler = cc.StandardTouchHandler.handlerWithDelegate(pDelegate, nPriority);

        if (! this._m_bLocked) {
            this._m_pStandardHandlers = this.forceAddHandler(pHandler, this._m_pStandardHandlers);
        }else{
            /* If pHandler is contained in m_pHandlersToRemove, if so remove it from m_pHandlersToRemove and retrun.
             * Refer issue #752(cocos2d-x)
             */
            if (this._m_pHandlersToRemove.indexOf(pDelegate) != -1){
                cc.ArrayRemoveObject(this._m_pHandlersToRemove, pDelegate);
                return;
            }

            this._m_pHandlersToAdd.push(pHandler);
            this._m_bToAdd = true;
        }
    },

    addTargetedDelegate:function(pDelegate,nPriority,bSwallowsTouches){
        var pHandler = cc.TargetedTouchHandler.handlerWithDelegate(pDelegate, nPriority, bSwallowsTouches);
        if (! this._m_bLocked){
            this._m_pTargetedHandlers = this.forceAddHandler(pHandler, this._m_pTargetedHandlers);
        }else{
            /* If pHandler is contained in m_pHandlersToRemove, if so remove it from m_pHandlersToRemove and retrun.
             * Refer issue #752(cocos2d-x)
             */
            if (this._m_pHandlersToRemove.indexOf(pDelegate) != -1){
                cc.ArrayRemoveObject(this._m_pHandlersToRemove, pDelegate);
                return;
            }

            this._m_pHandlersToAdd.push(pHandler);
            this._m_bToAdd = true;
        }
    },

    forceAddHandler:function(pHandler,pArray){
        var u = 0;

        for(var i=0;i< pArray.length;i++){
            var h = pArray[i];
            if(h){
                if(h.getPriority()<pHandler.getPriority()){
                    ++u;
                }
                if (h.getDelegate() == pHandler.getDelegate()){
                    cc.Assert(0, "TouchDispatcher.forceAddHandler()");
                    return;
                }
            }
        }

        return cc.ArrayAppendObjectToIndex(pArray,pHandler,u);
    },

    forceRemoveAllDelegates:function(){
        this._m_pStandardHandlers.length = 0;
        this._m_pTargetedHandlers.length = 0;
    },
    /** Removes a touch delegate.
     The delegate will be released
     */
    removeDelegate:function(pDelegate){
        if (pDelegate == null){
            return;
        }

        if (! this._m_bLocked){
            this.forceRemoveDelegate(pDelegate);
        }else{
            /* If pHandler is contained in m_pHandlersToAdd, if so remove it from m_pHandlersToAdd and retrun.
             * Refer issue #752(cocos2d-x)
             */
            var pHandler = this.findHandler(this._m_pHandlersToAdd, pDelegate);
            if (pHandler){
                cc.ArrayRemoveObject(this._m_pHandlersToAdd,pHandler);
                return;
            }

            this._m_pHandlersToRemove.push(pDelegate);
            this._m_bToRemove = true;
        }
    },

    /** Removes all touch delegates, releasing all the delegates */
    removeAllDelegates:function(){
        if (! this._m_bLocked){
            this.forceRemoveAllDelegates();
        }else{
            this._m_bToQuit = true;
        }
    },

    /** Changes the priority of a previously added delegate. The lower the number,
     the higher the priority */
    setPriority:function(nPriority,pDelegate){
        cc.Assert(pDelegate != null, "TouchDispatcher.setPriority():Arguments is null");

        var handler = this.findHandler(pDelegate);

        cc.Assert(handler != null, "TouchDispatcher.setPriority():Cant find TouchHandler");

        handler.setPriority(nPriority);

        this.rearrangeHandlers(this._m_pTargetedHandlers);
        this.rearrangeHandlers(this._m_pStandardHandlers);
    },

    touches:function(pTouches,pEvent,uIndex){
        cc.Assert(uIndex >= 0 && uIndex < 4, "TouchDispatcher.touches()");

        var pMutableTouches;
        this._m_bLocked = true;

        // optimization to prevent a mutable copy when it is not necessary
        var uTargetedHandlersCount = this._m_pTargetedHandlers.length;
        var uStandardHandlersCount = this._m_pStandardHandlers.length;
        var bNeedsMutableSet = (uTargetedHandlersCount && uStandardHandlersCount);
        //console.log("uTargetedHandlersCount:" + uTargetedHandlersCount+ "   uStandardHandlersCount:" + uStandardHandlersCount);
        pMutableTouches = (bNeedsMutableSet ? pTouches.slice() : pTouches);
        var sHelper = this._m_sHandlerHelperData[uIndex];
        //
        // process the target handlers 1st
        //
        if (uTargetedHandlersCount > 0)
        {
            var pTouch;
            for (var i = 0; i< pTouches.length; i++){
                pTouch = pTouches[i];
                var pHandler;
                for (var j=0;i<this._m_pTargetedHandlers.length; i++){
                    pHandler = this._m_pTargetedHandlers[j];

                    if (! pHandler){
                        break;
                    }

                    var bClaimed = false;
                    if (uIndex == cc.TOUCHBEGAN){
                        bClaimed = pHandler.getDelegate().ccTouchBegan(pTouch, pEvent);

                        if (bClaimed){
                            pHandler.getClaimedTouches().push(pTouch);
                        }
                    } else if (pHandler.getClaimedTouches().indexOf(pTouch)> -1){
                        // moved ended cancelled
                        bClaimed = true;
                        switch (sHelper.m_type){
                            case cc.TOUCHMOVED:
                                pHandler.getDelegate().ccTouchMoved(pTouch, pEvent);
                                break;
                            case cc.TOUCHENDED:
                                pHandler.getDelegate().ccTouchEnded(pTouch, pEvent);
                                cc.ArrayRemoveObject(pHandler.getClaimedTouches(),pTouch);
                                break;
                            case cc.TOUCHCANCELLED:
                                pHandler.getDelegate().ccTouchCancelled(pTouch, pEvent);
                                cc.ArrayRemoveObject(pHandler.getClaimedTouches(),pTouch);
                                break;
                        }
                    }

                    if (bClaimed && pHandler.isSwallowsTouches()){
                        if (bNeedsMutableSet){
                            cc.ArrayRemoveObject(pMutableTouches,pTouch);
                        }
                        break;
                    }
                }
            }
        }

        //
        // process standard handlers 2nd
        //
        if (uStandardHandlersCount > 0 && pMutableTouches.length > 0){
            for (i =0; i<this._m_pStandardHandlers.length;i++){
                pHandler = this._m_pStandardHandlers[i];

                if (! pHandler){
                    break;
                }

                switch (sHelper.m_type){
                    case cc.TOUCHBEGAN:
                        pHandler.getDelegate().ccTouchesBegan(pMutableTouches, pEvent);
                        break;
                    case cc.TOUCHMOVED:
                        pHandler.getDelegate().ccTouchesMoved(pMutableTouches, pEvent);
                        break;
                    case cc.TOUCHENDED:
                        pHandler.getDelegate().ccTouchesEnded(pMutableTouches, pEvent);
                        break;
                    case cc.TOUCHCANCELLED:
                        pHandler.getDelegate().ccTouchesCancelled(pMutableTouches, pEvent);
                        break;
                }
            }
        }

        if (bNeedsMutableSet){
            pMutableTouches=null;
        }

        //
        // Optimization. To prevent a [handlers copy] which is expensive
        // the add/removes/quit is done after the iterations
        //
        this._m_bLocked = false;
        if (this._m_bToRemove){
            this._m_bToRemove = false;
            for ( i = 0; i < this._m_pHandlersToRemove.length; i++)
            {
                this.forceRemoveDelegate(this._m_pHandlersToRemove[i]);
            }
            this._m_pHandlersToRemove.length = 0;
        }

        if (this._m_bToAdd){
            this._m_bToAdd = false;

            for (i =0;i<this._m_pHandlersToAdd.length;i++){
                pHandler = this._m_pHandlersToAdd[i];
                if (! pHandler){
                    break;
                }

                if (pHandler  instanceof cc.TargetedTouchHandler){
                    this.forceAddHandler(pHandler, this._m_pTargetedHandlers);
                }else{
                    this.forceAddHandler(pHandler, this._m_pStandardHandlers);
                }
            }
            this._m_pHandlersToAdd.lenght = 0;
        }

        if (this._m_bToQuit){
            this._m_bToQuit = false;
            this.forceRemoveAllDelegates();
        }
    },

    touchesBegan:function(touches,pEvent){
        if (this._m_bDispatchEvents){
            this.touches(touches, pEvent, cc.TOUCHBEGAN);
        }
    },
    touchesMoved:function(touches,pEvent){
        if (this._m_bDispatchEvents){
            this.touches(touches, pEvent, cc.TOUCHMOVED);
        }
    },
    touchesEnded:function(touches,pEvent){
        if (this._m_bDispatchEvents){
            this.touches(touches, pEvent, cc.TOUCHENDED);
        }
    },
    touchesCancelled:function(touches,pEvent){
        if (this._m_bDispatchEvents){
            this.touches(touches, pEvent, cc.TOUCHCANCELLED);
        }
    },

    findHandler:function(pArray,pDelegate){
        switch(arguments.length){
            case 1:
                pDelegate =  arguments[0];
                for(var i =0;i< this._m_pTargetedHandlers.length;i++){
                    if(this._m_pTargetedHandlers[i].getDelegate() == pDelegate){
                        return this._m_pTargetedHandlers[i];
                    }
                }
                for(i=0;i< this._m_pStandardHandlers.length;i++){
                    if(this._m_pStandardHandlers[i].getDelegate() == pDelegate){
                        return this._m_pStandardHandlers[i];
                    }
                }
                return null;
                break;
            case 2:
                cc.Assert(pArray != null && pDelegate != null, "TouchDispatcher.findHandler():Arguments is null");

                for( i=0;i<pArray.length;i++){
                    if(pArray[i].getDelegate() == pDelegate){
                        return pArray[i];
                    }
                }

                return null;
                break;
            default:
                throw "Argument must be non-nil ";
                break;
        }
    },

    forceRemoveDelegate:function(pDelegate){
        var pHandler;
        // XXX: remove it from both handlers ???
        // remove handler from m_pStandardHandlers
        for(var i =0; i< this._m_pStandardHandlers.length;i++){
            pHandler = this._m_pStandardHandlers[i];
            if(pHandler && pHandler.getDelegate() == pDelegate){
                cc.ArrayRemoveObject(this._m_pStandardHandlers,pHandler);
                break;
            }
        }

        for(i=0;i< this._m_pTargetedHandlers.length;i++){
            pHandler = this._m_pTargetedHandlers[i];
            if(pHandler && pHandler.getDelegate() == pDelegate){
                cc.ArrayRemoveObject(this._m_pTargetedHandlers,pHandler);
                break;
            }
        }
    },

    rearrangeHandlers:function(pArray){
        pArray.sort(cc.less);
    }
});

cc._pSharedDispatcher = null;
cc.TouchDispatcher.sharedDispatcher = function(){
    if (cc._pSharedDispatcher == null){
        //console.log("TouchDispatcher.sharedDispatcher()");
        cc._pSharedDispatcher = new cc.TouchDispatcher();
        cc._pSharedDispatcher.init();

        //register canvas mouse event
        cc.canvas.addEventListener("mousedown",function(event){
            var el = cc.canvas;
            var pos = {left: 0, top: 0};
            while( el != null ) {
                pos.left += el.offsetLeft;
                pos.top += el.offsetTop;
                el = el.offsetParent;
            }
            var tx = event.pageX;
            var ty = event.pageY;

            var mouseX = (tx - pos.left)/cc.Director.sharedDirector().getContentScaleFactor();
            var mouseY = (ty - pos.top)/cc.Director.sharedDirector().getContentScaleFactor();

            var touch = new cc.Touch();
            touch.SetTouchInfo(0,mouseX,mouseY);
            var pSet = [];
            pSet.push(touch);
            cc.TouchDispatcher.sharedDispatcher().touchesBegan(pSet,null);
        });

        cc.canvas.addEventListener("mouseup",function(event){
            var el = cc.canvas;
            var pos = {left: 0, top: 0};
            while( el != null ) {
                pos.left += el.offsetLeft;
                pos.top += el.offsetTop;
                el = el.offsetParent;
            }
            var tx = event.pageX;
            var ty = event.pageY;

            var mouseX = (tx - pos.left)/cc.Director.sharedDirector().getContentScaleFactor();
            var mouseY = (ty - pos.top)/cc.Director.sharedDirector().getContentScaleFactor();

            var touch = new cc.Touch();
            touch.SetTouchInfo(0,mouseX,mouseY);
            var pSet = [];
            pSet.push(touch);
            cc.TouchDispatcher.sharedDispatcher().touchesEnded(pSet,null);
        });

        cc.canvas.addEventListener("mousemove",function(event){
            var el = cc.canvas;
            var pos = {left: 0, top: 0};
            while( el != null ) {
                pos.left += el.offsetLeft;
                pos.top += el.offsetTop;
                el = el.offsetParent;
            }
            var tx = event.pageX;
            var ty = event.pageY;

            var mouseX = (tx - pos.left)/cc.Director.sharedDirector().getContentScaleFactor();
            var mouseY = (ty - pos.top)/cc.Director.sharedDirector().getContentScaleFactor();
            var touch = new cc.Touch();
            touch.SetTouchInfo(0,mouseX,mouseY);
            var pSet = [];
            pSet.push(touch);
            cc.TouchDispatcher.sharedDispatcher().touchesMoved(pSet,null);
        });

        //register canvas touch event
        cc.canvas.addEventListener("touchstart",function(event){
            if(!event.touches)
                return;

            var pSet = [];
            var el = cc.canvas;
            var pos = {left: 0, top: 0};
            while( el != null ) {
                pos.left += el.offsetLeft;
                pos.top += el.offsetTop;
                el = el.offsetParent;
            }

            for(var i = 0; i< event.touches.length;i++){
                var tx = event.touches[i].pageX;
                var ty = event.touches[i].pageY;
                if( event.touches[i] ) {
                    tx = event.touches[i].clientX;
                    ty = event.touches[i].clientY;
                }
                var mouseX = (tx - pos.left)/cc.Director.sharedDirector().getContentScaleFactor();
                var mouseY = (ty - pos.top)/cc.Director.sharedDirector().getContentScaleFactor();
                var touch = new cc.Touch();
                touch.SetTouchInfo(0,mouseX,mouseY);
                pSet.push(touch);
            }
            cc.TouchDispatcher.sharedDispatcher().touchesBegan(pSet,null);
            event.stopPropagation();
            event.preventDefault();
        });
        cc.canvas.addEventListener("touchmove",function(event){
            if(!event.touches)
                return;

            var pSet = [];
            var el = cc.canvas;
            var pos = {left: 0, top: 0};
            while( el != null ) {
                pos.left += el.offsetLeft;
                pos.top += el.offsetTop;
                el = el.offsetParent;
            }

            for(var i = 0; i< event.touches.length;i++){
                var tx = event.touches[i].pageX;
                var ty = event.touches[i].pageY;
                if( event.touches[i] ) {
                    tx = event.touches[i].clientX;
                    ty = event.touches[i].clientY;
                }
                var mouseX = (tx - pos.left)/cc.Director.sharedDirector().getContentScaleFactor();
                var mouseY = (ty - pos.top)/cc.Director.sharedDirector().getContentScaleFactor();
                var touch = new cc.Touch();
                touch.SetTouchInfo(0,mouseX,mouseY);
                pSet.push(touch);
            }
            cc.TouchDispatcher.sharedDispatcher().touchesMoved(pSet,null);
            event.stopPropagation();
            event.preventDefault();
        });
        cc.canvas.addEventListener("touchend",function(event){
            if(!event.touches)
                return;

            var pSet = [];
            var el = cc.canvas;
            var pos = {left: 0, top: 0};
            while( el != null ) {
                pos.left += el.offsetLeft;
                pos.top += el.offsetTop;
                el = el.offsetParent;
            }

            for(var i = 0; i< event.touches.length;i++){
                var tx = event.touches[i].pageX;
                var ty = event.touches[i].pageY;
                if( event.touches[i] ) {
                    tx = event.touches[i].clientX;
                    ty = event.touches[i].clientY;
                }
                var mouseX = (tx - pos.left)/cc.Director.sharedDirector().getContentScaleFactor();
                var mouseY = (ty - pos.top)/cc.Director.sharedDirector().getContentScaleFactor();
                var touch = new cc.Touch();
                touch.SetTouchInfo(0,mouseX,mouseY);
                pSet.push(touch);
            }
            cc.TouchDispatcher.sharedDispatcher().touchesEnded(pSet,null);
            event.stopPropagation();
            event.preventDefault();
        });
        cc.canvas.addEventListener("touchcancel",function(event){
            if(!event.touches)
                return;

            var pSet = [];
            var el = cc.canvas;
            var pos = {left: 0, top: 0};
            while( el != null ) {
                pos.left += el.offsetLeft;
                pos.top += el.offsetTop;
                el = el.offsetParent;
            }

            for(var i = 0; i< event.touches.length;i++){
                var tx = event.touches[i].pageX;
                var ty = event.touches[i].pageY;
                if( event.touches[i] ) {
                    tx = event.touches[i].clientX;
                    ty = event.touches[i].clientY;
                }
                var mouseX = (tx - pos.left)/cc.Director.sharedDirector().getContentScaleFactor();
                var mouseY = (ty - pos.top)/cc.Director.sharedDirector().getContentScaleFactor();
                var touch = new cc.Touch();
                touch.SetTouchInfo(0,mouseX,mouseY);
                pSet.push(touch);
            }
            cc.TouchDispatcher.sharedDispatcher().touchesCancelled(pSet,null);
            event.stopPropagation();
            event.preventDefault();
        });
    }

    return cc._pSharedDispatcher;
};
