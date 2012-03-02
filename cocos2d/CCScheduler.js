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
var CC = CC = CC || {};

//data structures
function tListEntry(prev,next,target,priority,paused,markedForDeletion){
    this.prev = prev;
    this.next = next;
    this.target = target;                           // not retained (retained by hashUpdateEntry)
    this.priority = priority;
    this.paused = paused;
    this.makedForDeletion = markedForDeletion;      // selector will no longer be called and entry will be removed at end of the next tick
}

function tHashUpdateEntry(list,entry,target,hh){
    this.list = list;                                   // Which list does it belong to ?
    this.entry = entry;                                 // entry in the list
    this.target = target;                               // hash key (retained)
    this.hh = hh;
}

// Hash Element used for "selectors with interval"
function tHashSelectorEntry(timers,target,timerIndex,currentTimer,currentTimerSalvaged,paused,hh){
    this.timers = timers;
    this.target = target;                                // hash key (retained)
    this.timerIndex = timerIndex;
    this.currentTimer= currentTimer;
    this.currentTimerSalvaged = currentTimerSalvaged;
    this.paused = paused;
    this.hh = hh;
}

// Hash Element used for "script functions with interval"
function tHashScriptFuncEntry(timer,paused,funcName,hh){
    this.timer = timer;
    this.paused = paused;
    this.funcName = funcName;
    this.hh = hh;
}


/** @brief Light weight timer */
var CCTimer = CCClass.extend({
    m_fInterval:0.0,
    m_pfnSelector:"",

    m_pTarget:null,
    m_fElapsed:0.0,

    /**
     * CCTimer's Constructor
     * @private
     */
    ctor:function(){
    },

    getInterval:function(){
        return this.m_fInterval;
    },

    /** Initializes a timer with a target, a selector and an interval in seconds.
     *
     * @param pTarget target
     * @param pfnSelector Selector
     * @param fSeconds second
     *
     * @return {Boolean} <tt>true</tt> if inintialized
     * * */
    initWithTarget:function(pTarget,pfnSelector,fSeconds){
        try{
            if(fSeconds == undefined){
                fSeconds = 0;
            }

            this.m_pTarget = pTarget;
            this.m_pfnSelector = pfnSelector;
            this.m_fElapsed = -1;
            this.m_fInterval = fSeconds;

            return true;
        }catch(e){
            return false;
        }
    },

    /** triggers the timer
     * @param {float} dt
     * */
    update:function(dt){
        if(this.m_fElapsed == -1){
            this.m_fElapsed = 0;
        }else{
            this.m_fElapsed += dt;
        }

        if(this.m_fElapsed >= this.m_fInterval){
            if(this.m_pfnSelector != null){
                this.m_pTarget[this.m_pfnSelector](this.m_fElapsed);
                this.m_fElapsed = 0;
            }
        }
    }
});

/** Allocates a timer with a target, a selector and an interval in seconds.
 *
 * @param pTarget target
 * @param pfnSelector Selector
 * @param fSeconds second
 *
 * @return a CCTimer instance
 * */
CCTimer.timerWithTarget = function(pTarget,pfnSelector,fSeconds){
    if(arguments < 2)
        throw new Error("timerWithTarget'argument can't is null");

    if(arguments.length > 2){
        var pTimer = new CCTimer();
        pTimer.initWithTarget(pTarget,pfnSelector);
        return pTimer;
    }else{
        var pTimer = new CCTimer();
        pTimer.initWithTarget(pTarget,pfnSelector,fSeconds);
        return pTimer;
    }
}

CC._pSharedScheduler = null;
/** @brief Scheduler is responsible of triggering the scheduled callbacks.
 You should not use NSTimer. Instead use this class.

 There are 2 different types of callbacks (selectors):

 - update selector: the 'update' selector will be called every frame. You can customize the priority.
 - custom selector: A custom selector will be called every frame, or with a custom interval of time

 The 'custom selectors' should be avoided when possible. It is faster, and consumes less memory to use the 'update selector'.

 */
var CCScheduler = CCClass.extend({
    m_fTimeScale:0.0,
    m_pUpdatesNegList:null,                             // list of priority < 0
    m_pUpdates0List:null,                               // list priority == 0
    m_pUpdatesPosList:null,                             // list priority > 0
    m_pHashForUpdates:null,                             // hash used to fetch quickly the list entries for pause,delete,etc

    m_pHashForSelecotrs:null,                           //Used for "selectors with interval"
    m_pCurrentTarget:null,
    m_bCurrentTargetSalvaged:false,
    m_bUpdateHashLocked:false,                          //If true unschedule will not remove anything from a hash. Elements will only be marked for deletion.
    m_pHashForScriptFunctions:null,                    // Used for "script function call back with interval"

    ctor:function(){
    },

    //-----------------------private method----------------------
    /**
     * @private
     */
    _removeHashElement:function(pElement){
        pElement.Timer = null;
        //dynamic_cast<CCObject*>(pElement->target)->release();
        pElement.target = null;
        //TODO
        //HASH_DEL(m_pHashForSelectors, pElement);
        pElement = null;
    },

    /**
     * @private
     */
    _removeUpdateFromHash:function(entry){
        var element = new tHashUpdateEntry(null,null,null,null);

        //TODO
        //HASH_FIND_INT(m_pHashForUpdates, &entry->target, element);
        if(element!=null){
            //list entry
            //DL_DELETE(*element->list, element->entry);
            element.entry = null;

            //hash entry
            //dynamic_cast<CCObject*>(element->target)->release();
            //HASH_DEL(m_pHashForUpdates, element);
            element == null;
        }
    },

    /**
     * @private
     */
    _init:function(){
        this.m_fTimeScale = 1.0;

        this.m_pUpdatesNegList = null;
        this.m_pUpdates0List = null;
        this.m_pUpdatesPosList = null;
        this.m_pHashForUpdates = null;
        this.m_pHashForSelecotrs = null;
        this.m_pCurrentTarget = null;
        this.m_bCurrentTargetSalvaged = false;
        this.m_pHashForScriptFunctions = null;
        this.m_bUpdateHashLocked = false;

        return true;
    },

    /**
     * @private
     */
    _priorityIn:function(ppList,pTarget,nPriority,bPaused){
        var pListElement = new tListEntry(null,null,pTarget,nPriority,bPaused,false);
        // TODO
        // empey list ?
        if(!ppList){
            //DL_APPEND(*ppList, pListElement);
        }else{
            var bAdded = false;

            for(var pElement = ppList;pElement == null;pElement = pElement.next){
                if(nPriority < pElement.priority){
                    if(pElement == ppList){
                        //DL_PREPEND(*ppList, pListElement);
                    }else{
                        pListElement.next = pElement;
                        pListElement.prev = pElement.prev;

                        pElement.prev.next = pListElement;
                        pElement.prev = pListElement;
                    }
                    bAdded = true;
                    break;
                }
            }

            // Not added? priority has the higher value. Append it.
            if(!bAdded){
                //DL_APPEND(*ppList, pListElement);
            }
        }

        //update hash entry for quick access
        var pHashElement = new tHashUpdateEntry(ppList,pListElement,pTarget,null);
        //dynamic_cast<CCObject*>(pTarget)->retain();
        // HASH_ADD_INT(m_pHashForUpdates, target, pHashElement);
    },

    /**
     * @private
     */
    _appendIn:function(ppList,pTarget,bPaused){
        var pListElement = new tListEntry(null,null,pTarget,0,bPaused,false);

        //TODO
        //DL_APPEND(*ppList, pListElement);

        //update hash entry for quicker access
        var pHashElement = new tHashUpdateEntry(ppList,pListElement,pTarget,null);
        //dynamic_cast<CCObject*>(pTarget)->retain();
        //HASH_ADD_INT(m_pHashForUpdates, target, pHashElement);
    },

    //-----------------------public method-------------------------
    /** Modifies the time of all scheduled callbacks.
     You can use this property to create a 'slow motion' or 'fast forward' effect.
     Default is 1.0. To create a 'slow motion' effect, use values below 1.0.
     To create a 'fast forward' effect, use values higher than 1.0.
     @warning It will affect EVERY scheduled selector / action.
     */
    setTimeScale:function(fTimeScale){
        this._m_fTimeScale = fTimeScale;
    },

    getTimeScale:function(){
        return this._m_fTimeScale;
    },

    /** 'tick' the scheduler. main loop
     You should NEVER call this method, unless you know what you are doing.
     */
    tick:function(dt){
        this.m_bUpdateHashLocked = true;

        if(this.m_fTimeScale != 1.0){
            dt *= this.m_fTimeScale;
        }
        //TODO
        //Iterate all over the Updates selectors
        var pEntry,pTmp;
        //DL_FOREACH_SAFE(m_pUpdatesNegList, pEntry, pTmp){
            if((!pEntry.paused)&&(!pEntry.makedForDeletion)){
                pEntry.target.update(dt);
            }
        //}

        // updates with priority == 0
        // DL_FOREACH_SAFE(m_pUpdates0List, pEntry, pTmp){
            if((!pEntry.paused)&&(!pEntry.makedForDeletion)){
                pEntry.target.update(dt);
            }
        //}

        // updates with priority > 0
        // DL_FOREACH_SAFE(m_pUpdatesPosList, pEntry, pTmp){
        if((!pEntry.paused)&&(!pEntry.makedForDeletion)){
            pEntry.target.update(dt);
        }
        //}

        //Interate all over the custom selectors
        for(var elt = this.m_pHashForSelectors; elt != null;){
            this.m_pCurrentTarget = elt;
            this.m_bCurrentTargetSalvaged = false;

            if(!this.m_pCurrentTarget.paused){
                // The 'timers' array may change while inside this loop
                for(elt.timerIndex = 0; elt.timerIndex < elt.timers.length;++(elt.timerIndex)){
                    elt.currentTimer = elt.timers[elt.timerIndex];
                    elt.currentTimerSalvaged = false;

                    elt.currentTimer.update(dt);

                    if(elt.currentTimerSalvaged){
                        // The currentTimer told the remove itself. To prevent the timer from
                        // accidentally deallocating itself before finishing its step, we retained
                        // it. Now that step is done, it's safe to release it.
                        elt.currentTimer.release();
                    }
                    elt.currentTimer = null;
                }
            }

            elt = elt.hh.next;
            if((this.m_bCurrentTargetSalvaged) &&(this.m_pCurrentTarget.timers.length == 0)){
                this._removeHashElement(this.m_pCurrentTarget);
            }
        }

        //delete all updates that are marked for deletion
        // updates with priority < 0
        //DL_FOREACH_SAFE(m_pUpdatesNegList, pEntry, pTmp){
            if(pEntry.makedForDeletion){
                this._removeUpdateFromHash(pEntry);
            }
        //}

        // updates with priority == 0
        // DL_FOREACH_SAFE(m_pUpdates0List, pEntry, pTmp){
            if(pEntry.makedForDeletion){
                this._removeUpdateFromHash(pEntry);
            }
        //}

        // updates with priority > 0
        // DL_FOREACH_SAFE(m_pUpdatesPosList, pEntry, pTmp){
            if(pEntry.makedForDeletion){
                this._removeUpdateFromHash(pEntry);
            }
        //}

        this.m_bUpdateHashLocked = false;
        this.m_pCurrentTarget = null;

        //Interate all script functions
        for(var elt = this.m_pHashForScriptFunctions;elt != null;){
            if(!elt.paused){
                elt.timer.update(dt);
            }
            elt = elt.hh.next;
        }
    },

    /** The scheduled method will be called every 'interval' seconds.
     If paused is YES, then it won't be called until it is resumed.
     If 'interval' is 0, it will be called every frame, but if so, it recommened to use 'scheduleUpdateForTarget:' instead.
     If the selector is already scheduled, then only the interval parameter will be updated without re-scheduling it again.

     @since v0.99.3
     */
    scheduleSelector:function(pfnSelector, pTarget,fInterval,bPaused){
        //TODO
        //CCAssert(pfnSelector, "");
        //CCAssert(pTarget, "");

        var pElement = null;
        //HASH_FIND_INT(m_pHashForSelectors, &pTarget, pElement);

        if(pElement != null){
            // Is this the 1st element ? Then set the pause level to all the selectors of this target
            pElement = new tHashSelectorEntry(null,pTarget,0,null,null,bPaused,null);
            //if (pTarget)
            //{
            //    dynamic_cast<CCObject*>(pTarget)->retain();
            //}
            //HASH_ADD_INT(m_pHashForSelectors, target, pElement);
        }else{
          //CCAssert(pElement->paused == bPaused, "");
        }

        if(pElement.timers == null){
            pElement.timers = [];
        }else{
            for(var i =0; i<pElement.timers.length;i++){
                var timer = pElement.timers[i];
                if(pfnSelector == timer.m_pfnSelector){
                    //CCLOG("CCSheduler#scheduleSelector. Selector already scheduled.");
                    timer.m_fInterval = fInterval;
                    return;
                }
            }
            //TODO
            //ccArrayEnsureExtraCapacity(pElement->timers, 1);
        }

        var pTimer = new CCTimer();
        pTimer.initWithTarget(pTarget,pfnSelector,fInterval);
        //ccArrayAppendObject(pElement->timers, pTimer);==
        pElement.timers.push(pTimer);
        //pTimer.release();
    },

    /** Schedules the 'update' selector for a given target with a given priority.
     The 'update' selector will be called every frame.
     The lower the priority, the earlier it is called.
     @since v0.99.3
     */
    scheduleUpdateForTarget:function(pTarget,nPriority,bPaused){
        //TODO
        var pHashElement = null;
        //HASH_FIND_INT(m_pHashForUpdates, &pTarget, pHashElement);
        if(pHashElement != null){
            //#if COCOS2D_DEBUG >= 1
            //    CCAssert(pHashElement->entry->markedForDeletion,"");
            //#endif
            // TODO: check if priority has changed!

            pHashElement.entry.markedForDeletion = false;
            return;
        }

        // most of the updates are going to be 0, that's way there
        // is an special list for updates with priority 0
        if(nPriority == 0){
            this._appendIn(this.m_pUpdates0List,pTarget,bPaused);
        }else if(nPriority <0){
            this._priorityIn(this.m_pUpdatesNegList,pTarget,nPriority,bPaused);
        }else{
            // priority > 0
            this._priorityIn(this.m_pUpdatesPosList,pTarget,nPriority,bPaused);
        }
    },

    /** Unschedule a selector for a given target.
     If you want to unschedule the "update", use unscheudleUpdateForTarget.
     @since v0.99.3
     */
    unscheduleSelector:function(pfnSelector,pTarget){
        //TODO
        // explicity handle nil arguments when removing an object
        if((pTarget == null) || (pfnSelector == null)){
            return;
        }

        ////CCAssert(pTarget);
        ////CCAssert(pfnSelector);

        var pElement = null;
        //HASH_FIND_INT(m_pHashForSelectors, &pTarget, pElement);

        if(pElement != null){
            for(var i =0; i < pElement.timers.length;i++){
                var pTimer = pElement.timers[i];
                if(pfnSelector == pTimer.m_pfnSelector){
                    if((pTimer == pElement.currentTimer)&&(!pElement.currentTimerSalvaged)){
                        //pElement.currentTimer.retain();
                        pElement.currentTimerSalvaged = true;
                    }

                    //ccArrayRemoveObjectAtIndex(pElement->timers, i );

                    //update timerIndex in case we are in tick;, looping over the actions
                    if(pElement.timerIndex >= i){
                        pElement.timerIndex--;
                    }

                    if(pElement.timers.length == 0){
                        if(this.m_pCurrentTarget == pElement){
                            this.m_bCurrentTargetSalvaged = true;
                        }else{
                            this._removeHashElement(pElement);
                        }
                    }
                    return;
                }
            }
        }
    },

    /** Unschedules the update selector for a given target
     @since v0.99.3
     */
    unscheduleUpdateForTarget:function(pTarget){
       //TODO
        if(pTarget == null){
            return;
        }

        var pElement = null;
        //HASH_FIND_INT(m_pHashForUpdates, &pTarget, pElement);
        if(pElement != null){
            if(this.m_bUpdateHashLocked){
                pElement.entry.markedForDeletion = true;
            }else{
                this._removeUpdateFromHash(pElement.entry);
            }
        }
    },

    /** Unschedules all selectors for a given target.
     This also includes the "update" selector.
     @since v0.99.3
     */
    unscheduleAllSelectorsForTarget:function(pTarget){
        //TODO
        //explicit NULL handling
        if(pTarget == null){
            return;
        }

        var pElement = null;
        //HASH_FIND_INT(m_pHashForSelectors, &pTarget, pElement);
        if(pElement != null){
            if((!pElement.currentTimerSalvaged)
                //&&(ccArrayContainsObject(pElement->timers, pElement->currentTimer))
                ){
                //pElement.currentTimer.retain();
                pElement.currentTimerSalvaged = true;
            }
            //ccArrayRemoveAllObjects(pElement->timers);

            if(this.m_pCurrentTarget == pElement){
                this.m_bCurrentTargetSalvaged = true;
            }else{
                this._removeHashElement(pElement);
            }
        }
        // update selector
        this.unscheduleUpdateForTarget(pTarget);
    },

    /** Unschedules all selectors from all targets.
     You should NEVER call this method, unless you know what you are doing.

     @since v0.99.3
     */
    unscheduleAllSelectors:function(){
        //TODO
        // Custom Selectors
        var pElement = null;
        var pNextElement = null;
        for(pElement = this.m_pHashForSelecotrs;pElement != null;){
            // pElement may be removed in unscheduleAllSelectorsForTarget
            pNextElement = pElement.hh.next;
            this.unscheduleAllSelectorsForTarget(pElement.target);
            pElement = pNextElement;
        }

        //updates selectors
        var pEntry = null, pTmp = null;
        //DL_FOREACH_SAFE(m_pUpdates0List, pEntry, pTmp){
            unscheduleUpdateForTarget(pEntry.target);
        //}
        //DL_FOREACH_SAFE(m_pUpdatesNegList, pEntry, pTmp){
            unscheduleUpdateForTarget(pEntry.target);
        //}
        //DL_FOREACH_SAFE(m_pUpdatesPosList, pEntry, pTmp){
            unscheduleUpdateForTarget(pEntry.target);
        //}

        //unschedule all script functions
        for(var elt = this.m_pHashForScriptFunctions;elt != null;){
            var pNextElement = elt.hh.next;
            //elt.timer.release();
            //HASH_DEL(m_pHashForScriptFunctions, elt);
            //elt = null;
            elt = pNextElement;
        }
    },

    /** Pauses the target.
     All scheduled selectors/update for a given target won't be 'ticked' until the target is resumed.
     If the target is not present, nothing happens.
     @since v0.99.3
     */
    pauseTarget:function(pTarget){
        /*
         CCAssert(pTarget != NULL, "");

         // custom selectors
         tHashSelectorEntry *pElement = NULL;
         HASH_FIND_INT(m_pHashForSelectors, &pTarget, pElement);
         if (pElement)
         {
         pElement->paused = true;
         }

         // update selector
         tHashUpdateEntry *pElementUpdate = NULL;
         HASH_FIND_INT(m_pHashForUpdates, &pTarget, pElementUpdate);
         if (pElementUpdate)
         {
         CCAssert(pElementUpdate->entry != NULL, "");
         pElementUpdate->entry->paused = true;
         }
         */
        //TODO
        CC.CCAssert(pTarget != null,"");
    },

    /** Resumes the target.
     The 'target' will be unpaused, so all schedule selectors/update will be 'ticked' again.
     If the target is not present, nothing happens.
     @since v0.99.3
     */
    resumeTarget:function(pTarget){
        //TODO
        //CCAssert(pTarget != NULL, "");

        // custom selectors
        var pElement = null;
        //HASH_FIND_INT(m_pHashForSelectors, &pTarget, pElement);
        if(pElement != null){
            pElement.paused = false;
        }

        //update selector
        var pElementUpdate = null;
        //HASH_FIND_INT(m_pHashForUpdates, &pTarget, pElementUpdate);
        if(pElementUpdate != null){
            //CCAssert(pElementUpdate->entry != NULL, "");
            pElementUpdate.entry.paused = false;
        }
    },

    /** Returns whether or not the target is paused
     @since v1.0.0
     */
    isTargetPaused:function(pTarget){
        //CCAssert( pTarget != NULL, "target must be non nil" );

        // Custom selectors
        var pElement = null;
        //TODO
        //HASH_FIND_INT(m_pHashForSelectors, &pTarget, pElement);
        if(pElement != null){
            return pElement.paused;
        }
        return false;
    }
});

CCScheduler.sharedScheduler = function(){
    if(!CC._pSharedScheduler){
        CC._pSharedScheduler = new CCScheduler();
        CC._pSharedScheduler._init();
    }
    return CC._pSharedScheduler;
}

CCScheduler.purgeSharedScheduler = function(){
    CC._pSharedScheduler = null;
}


