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

CC.DL_APPEND = function(head,add){
    if(head != null){
        add.prev = head.prev;
        head.prev.next = add;
        head.prev = add;
        add.next = null;
    }else{
        head = add;
        head.prev = head;
        head.next = null;
    }
};

CC.DL_PREPEND = function(head,add){
    add.next = head;
    if(head != null){
        add.prev = head.prev;
        head.prev = add;
    }else{
        add.prev = add;
    }
};

CC.DL_DELETE = function(head,del){
    if(del.prev == del){
        head = null;
    }else if(del == head){
        del.next.prev = del.prev;
        head = del.next;
    }else{
        del.prev.next = del.next;
        if(del.next != null){
            del.next.prev = del.prev;
        }else{
            head.prev = del.prev;
        }
    }
};

/** Removes object at specified index and pushes back all subsequent objects.
 Behaviour undefined if index outside [0, num-1]. */
CC.ccArrayRemoveObjectAtIndex = function(arr,index){
    arr.splice(index,1);
};

/** Removes object at specified index and fills the gap with the last object,
 thereby avoiding the need to push back subsequent objects.
 Behaviour undefined if index outside [0, num-1]. */
CC.ccArrayFastRemoveObjectAtIndex = function(arr,index){
    arr.splice(index,1);
};

CC.ccArrayFastRemoveObject = function(arr,delObj){
    CC.ccArrayRemoveObject(arr,delObj);
};

/** Searches for the first occurance of object and removes it. If object is not
 found the function has no effect. */
CC.ccArrayRemoveObject = function(arr,delObj){
    for(var i = 0; i< arr.length;i++){
        if(arr[i] == delObj){
            arr.splice(i,1);
        }
    }
};

/** Removes from arr all values in minusArr. For each Value in minusArr, the
 first matching instance in arr will be removed. */
CC.ccArrayRemoveArray = function(arr,minusArr){
    for(var i=0;i<minusArr.length;i++){
        CC.ccArrayRemoveObject(arr,minusArr[i]);
    }
};

/** Returns index of first occurence of value, NSNotFound if value not found. */
CC.ccCArrayGetIndexOfValue = function(arr,value){
    for(var i=0;i<arr.length;i++){
        if(arr[i] == value){
            return i;
        }
    }
    return -1;
};

CC.ccArrayAppendObject = function(arr,addObj){
    arr.push(addObj);
};

CC.ccArrayGetIndexOfObject = function(arr,findObj){
    for(var i =0; i < arr.length;i++){
        if(arr[i] == findObj)
            return i;
    }
    return -1;
};

CC.ccArrayContainsObject = function(arr,findObj){
  return CC.ccArrayGetIndexOfObject(arr,findObj) != -1;
};

CC.HASH_FIND_INT = function(head,findInt){
    var ret = null;

    if(head == null){
        return ret;
    }

    if(head.hh.target == findInt)
        return head;

    for(var curr = head.hh;curr != null;){
        if(curr.target == findInt){
            return curr;
        }
        curr = curr.hh;
    }

    return ret;
};

CC.HASH_ADD_INT = function(head,intfield,add){
    //TODO
    CC.Log("HASH_ADD_INT no implemetion!");
};

CC.HASH_DEL = function(head,delptr){
    //TODO
    CC.Log("HASH_DEL no implemetion!");
};

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
CC.CCTimer = CC.Class.extend({
    _m_fInterval:0.0,
    _m_pfnSelector:"",

    _m_pTarget:null,
    _m_fElapsed:0.0,

    /**
     * CCTimer's Constructor
     * @private
     */
    ctor:function(){
    },

    getInterval:function(){
        return this._m_fInterval;
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

            this._m_pTarget = pTarget;
            this._m_pfnSelector = pfnSelector;
            this._m_fElapsed = -1;
            this._m_fInterval = fSeconds;

            return true;
        }catch(e){
            return false;
        }
    },

    /** triggers the timer
     * @param {float} dt
     * */
    update:function(dt){
        if(this._m_fElapsed == -1){
            this._m_fElapsed = 0;
        }else{
            this._m_fElapsed += dt;
        }

        if(this._m_fElapsed >= this._m_fInterval){
            if(this._m_pfnSelector != null){
                this._m_pTarget[this._m_pfnSelector](this._m_fElapsed);
                this._m_fElapsed = 0;
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
CC.CCTimer.timerWithTarget = function(pTarget,pfnSelector,fSeconds){
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
CC.CCScheduler = CC.Class.extend({
    _m_fTimeScale:0.0,
    _m_pUpdatesNegList:null,                             // list of priority < 0
    _m_pUpdates0List:null,                               // list priority == 0
    _m_pUpdatesPosList:null,                             // list priority > 0
    _m_pHashForUpdates:null,                             // hash used to fetch quickly the list entries for pause,delete,etc

    _m_pHashForSelectors:null,                           //Used for "selectors with interval"
    _m_pCurrentTarget:null,
    _m_bCurrentTargetSalvaged:false,
    _m_bUpdateHashLocked:false,                          //If true unschedule will not remove anything from a hash. Elements will only be marked for deletion.
    _m_pHashForScriptFunctions:null,                    // Used for "script function call back with interval"

    ctor:function(){
    },

    //-----------------------private method----------------------
    /**
     * @private
     */
    _removeHashElement:function(pElement){
        pElement.Timer = null;

        pElement.target = null;

        this._arrayRemove(this._m_pHashForSelectors,pElement);

        pElement = null;
    },

    /**
     * @brief delete object from Array
     * @private
     * @param Source Array
     * @param delete Object
     */
    _arrayRemove:function(array,delObj){
        for(var i = 0; i< array.length;i++){
            if(array[i] == delObj){
                array.splice(i,1);
            }
        }
    },

    /**
     * @brief find Object from Array
     * @param Source Array
     * @param destination object
     * @return object if finded, or return null
     */
    _findElementFromArray:function(array,target){
        for(var i=0; i< array.length; i++){
            if(array[i].target == target){
                return array[i];
            }
        }
        return null;
    },

    /**
     * @private
     */
    _removeUpdateFromHash:function(entry){
        var element = this._findElementFromArray(this._m_pHashForUpdates,entry.target);

        if(element!=null){
            //list entry
            this._arrayRemove(element.list,element.entry);
            element.entry = null;

            //hash entry
            element.target = null;
            this._arrayRemove(this._m_pHashForUpdates,element);
            element == null;
        }
    },

    /**
     * @private
     */
    _init:function(){
        this._m_fTimeScale = 1.0;

        this._m_pUpdatesNegList = null;
        this._m_pUpdates0List = null;
        this._m_pUpdatesPosList = null;
        this._m_pHashForUpdates = null;
        this._m_pHashForSelectors = null;
        this._m_pCurrentTarget = null;
        this._m_bCurrentTargetSalvaged = false;
        this._m_pHashForScriptFunctions = null;
        this._m_bUpdateHashLocked = false;

        return true;
    },

    /**
     * @private
     */
    _priorityIn:function(ppList,pTarget,nPriority,bPaused){
        var pListElement = new tListEntry(null,null,pTarget,nPriority,bPaused,false);

        // empey list ?
        if(!ppList){
            CC.DL_APPEND(ppList, pListElement);
        }else{
            var bAdded = false;

            for(var pElement = ppList;pElement == null;pElement = pElement.next){
                if(nPriority < pElement.priority){
                    if(pElement == ppList){
                        CC.DL_PREPEND(ppList, pListElement);
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
                CC.DL_APPEND(ppList, pListElement);
            }
        }

        //update hash entry for quick access
        var pHashElement = new tHashUpdateEntry(ppList,pListElement,pTarget,null);

        // HASH_ADD_INT(_m_pHashForUpdates, target, pHashElement);
    },

    /**
     * @private
     */
    _appendIn:function(ppList,pTarget,bPaused){
        var pListElement = new tListEntry(null,null,pTarget,0,bPaused,false);

        CC.DL_APPEND(ppList, pListElement);

        //update hash entry for quicker access
        var pHashElement = new tHashUpdateEntry(ppList,pListElement,pTarget,null);

        CC.HASH_ADD_INT(this._m_pHashForUpdates, target, pHashElement);
    },

    //-----------------------public method-------------------------
    /** Modifies the time of all scheduled callbacks.
     You can use this property to create a 'slow motion' or 'fast forward' effect.
     Default is 1.0. To create a 'slow motion' effect, use values below 1.0.
     To create a 'fast forward' effect, use values higher than 1.0.
     @warning It will affect EVERY scheduled selector / action.
     */
    setTimeScale:function(fTimeScale){
        this.__m_fTimeScale = fTimeScale;
    },

    getTimeScale:function(){
        return this.__m_fTimeScale;
    },

    /** 'tick' the scheduler. main loop
     You should NEVER call this method, unless you know what you are doing.
     */
    tick:function(dt){
        this._m_bUpdateHashLocked = true;

        if(this._m_fTimeScale != 1.0){
            dt *= this._m_fTimeScale;
        }

        //Iterate all over the Updates selectors
        var pEntry,pTmp;
        for(pEntry = this._m_pUpdatesNegList;(pEntry != null) &&(pTmp = pEntry.next,1);pEntry = pTmp){
            if((!pEntry.paused)&&(!pEntry.makedForDeletion)){
                pEntry.target.update(dt);
            }
        }

        // updates with priority == 0
        for(pEntry = this._m_pUpdates0List;(pEntry != null) &&(pTmp = pEntry.next,1);pEntry = pTmp){
            if((!pEntry.paused)&&(!pEntry.makedForDeletion)){
                pEntry.target.update(dt);
            }
        }

        // updates with priority > 0
        for(pEntry = this._m_pUpdatesPosList;(pEntry != null) &&(pTmp = pEntry.next,1);pEntry = pTmp){
            if((!pEntry.paused)&&(!pEntry.makedForDeletion)){
                pEntry.target.update(dt);
            }
        }

        //Interate all over the custom selectors
        for(var elt = this._m_pHashForSelectors; elt != null;){
            this._m_pCurrentTarget = elt;
            this._m_bCurrentTargetSalvaged = false;

            if(!this._m_pCurrentTarget.paused){
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
            if((this._m_bCurrentTargetSalvaged) &&(this._m_pCurrentTarget.timers.length == 0)){
                this._removeHashElement(this._m_pCurrentTarget);
            }
        }

        //delete all updates that are marked for deletion
        // updates with priority < 0
        for(pEntry = this._m_pUpdatesNegList;(pEntry != null) &&(pTmp = pEntry.next,1);pEntry = pTmp){
            if(pEntry.makedForDeletion){
                this._removeUpdateFromHash(pEntry);
            }
        }

        // updates with priority == 0
        for(pEntry = this._m_pUpdates0List;(pEntry != null) &&(pTmp = pEntry.next,1);pEntry = pTmp){
            if(pEntry.makedForDeletion){
                this._removeUpdateFromHash(pEntry);
            }
        }

        // updates with priority > 0
        for(pEntry = this._m_pUpdatesPosList;(pEntry != null) &&(pTmp = pEntry.next,1);pEntry = pTmp){
            if(pEntry.makedForDeletion){
                this._removeUpdateFromHash(pEntry);
            }
        }

        this._m_bUpdateHashLocked = false;
        this._m_pCurrentTarget = null;

        //Interate all script functions
        for(var elt = this._m_pHashForScriptFunctions;elt != null;){
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
        CC.CCAssert(pfnSelector, "");
        CC.CCAssert(pTarget, "");

        var pElement = CC.HASH_FIND_INT(this._m_pHashForSelectors,pTarget);

        if(pElement != null){
            // Is this the 1st element ? Then set the pause level to all the selectors of this target
            pElement = new tHashSelectorEntry(null,pTarget,0,null,null,bPaused,null);

            CC.HASH_ADD_INT(this._m_pHashForSelectors, target, pElement);
        }else{
          CC.CCAssert(pElement.paused == bPaused, "");
        }

        if(pElement.timers == null){
            pElement.timers = [];
        }else{
            for(var i =0; i<pElement.timers.length;i++){
                var timer = pElement.timers[i];
                if(pfnSelector == timer._m_pfnSelector){
                    CC.CCLOG("CCSheduler#scheduleSelector. Selector already scheduled.");
                    timer._m_fInterval = fInterval;
                    return;
                }
            }
        }

        var pTimer = new CCTimer();
        pTimer.initWithTarget(pTarget,pfnSelector,fInterval);
        pElement.timers.push(pTimer);
        pTimer = null;
    },

    /** Schedules the 'update' selector for a given target with a given priority.
     The 'update' selector will be called every frame.
     The lower the priority, the earlier it is called.
     @since v0.99.3
     */
    scheduleUpdateForTarget:function(pTarget,nPriority,bPaused){
        var pHashElement = CC.HASH_FIND_INT(this._m_pHashForUpdates,pTarget);

        if(pHashElement != null){
            if (CC.COCOS2D_DEBUG >= 1){
                CC.CCAssert(pHashElement.entry.markedForDeletion,"");
            }
            // TODO: check if priority has changed!

            pHashElement.entry.markedForDeletion = false;
            return;
        }

        // most of the updates are going to be 0, that's way there
        // is an special list for updates with priority 0
        if(nPriority == 0){
            this._appendIn(this._m_pUpdates0List,pTarget,bPaused);
        }else if(nPriority <0){
            this._priorityIn(this._m_pUpdatesNegList,pTarget,nPriority,bPaused);
        }else{
            // priority > 0
            this._priorityIn(this._m_pUpdatesPosList,pTarget,nPriority,bPaused);
        }
    },

    /** Unschedule a selector for a given target.
     If you want to unschedule the "update", use unscheudleUpdateForTarget.
     @since v0.99.3
     */
    unscheduleSelector:function(pfnSelector,pTarget){
        // explicity handle nil arguments when removing an object
        if((pTarget == null) || (pfnSelector == null)){
            return;
        }

        ////CCAssert(pTarget);
        ////CCAssert(pfnSelector);

        var pElement = CC.HASH_FIND_INT(this._m_pHashForSelectors,pTarget);

        if(pElement != null){
            for(var i =0; i < pElement.timers.length;i++){
                var pTimer = pElement.timers[i];
                if(pfnSelector == pTimer._m_pfnSelector){
                    if((pTimer == pElement.currentTimer)&&(!pElement.currentTimerSalvaged)){
                        pElement.currentTimerSalvaged = true;
                    }

                    CC.ccArrayRemoveObjectAtIndex(pElement.timers, i);

                    //update timerIndex in case we are in tick;, looping over the actions
                    if(pElement.timerIndex >= i){
                        pElement.timerIndex--;
                    }

                    if(pElement.timers.length == 0){
                        if(this._m_pCurrentTarget == pElement){
                            this._m_bCurrentTargetSalvaged = true;
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
        if(pTarget == null){
            return;
        }

        var pElement = CC.HASH_FIND_INT(this._m_pHashForUpdates,pTarget);

        if(pElement != null){
            if(this._m_bUpdateHashLocked){
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
        //explicit NULL handling
        if(pTarget == null){
            return;
        }

        var pElement = CC.HASH_FIND_INT(this._m_pHashForSelectors,pTarget);

        if(pElement != null){
            if((!pElement.currentTimerSalvaged) &&(CC.ccArrayContainsObject(pElement.timers, pElement.currentTimer))
                ){
                pElement.currentTimerSalvaged = true;
            }
            pElement.timers.length = 0;

            if(this._m_pCurrentTarget == pElement){
                this._m_bCurrentTargetSalvaged = true;
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
        // Custom Selectors
        var pElement = null;
        var pNextElement = null;
        for(pElement = this._m_pHashForSelectors;pElement != null;){
            // pElement may be removed in unscheduleAllSelectorsForTarget
            pNextElement = pElement.hh.next;
            this.unscheduleAllSelectorsForTarget(pElement.target);
            pElement = pNextElement;
        }

        //updates selectors
        var pEntry = null, pTmp = null;
        for(pEntry = this._m_pUpdates0List;(pEntry != null) &&(pTmp = pEntry.next,1);pEntry = pTmp){
            this.unscheduleUpdateForTarget(pEntry.target);
        }

        for(pEntry = this._m_pUpdatesNegList;(pEntry != null) &&(pTmp = pEntry.next,1);pEntry = pTmp){
            this.unscheduleUpdateForTarget(pEntry.target);
        }

        for(pEntry = this._m_pUpdatesPosList;(pEntry != null) &&(pTmp = pEntry.next,1);pEntry = pTmp){
            this.unscheduleUpdateForTarget(pEntry.target);
        }

        //unschedule all script functions
        for(var elt = this._m_pHashForScriptFunctions;elt != null;){
            var pNextElement = elt.hh.next;
            //elt.timer.release();
            CC.HASH_DEL(this._m_pHashForScriptFunctions, elt);
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
        CC.CCAssert(pTarget != null,"");

        //customer selectors
        var pElement = CC.HASH_FIND_INT(this._m_pHashForSelectors,pTarget);
        if(pElement != null){
            pElement.paused = true;
        }

        //update selector
        var pElementUpdate = CC.HASH_FIND_INT(this._m_pHashForUpdates,pTarget);
        if(pElementUpdate != null){
            CC.CCAssert(pElementUpdate.entry != NULL, "");
            pElementUpdate.entry.paused = true;
        }
    },

    /** Resumes the target.
     The 'target' will be unpaused, so all schedule selectors/update will be 'ticked' again.
     If the target is not present, nothing happens.
     @since v0.99.3
     */
    resumeTarget:function(pTarget){
        CC.CCAssert(pTarget != NULL, "");

        // custom selectors
        var pElement = CC.HASH_FIND_INT(this._m_pHashForSelectors,pTarget);

        if(pElement != null){
            pElement.paused = false;
        }

        //update selector
        var pElementUpdate = CC.HASH_FIND_INT(this._m_pHashForUpdates,pTarget);

        if(pElementUpdate != null){
            CC.CCAssert(pElementUpdate.entry != NULL, "");
            pElementUpdate.entry.paused = false;
        }
    },

    /** Returns whether or not the target is paused
     @since v1.0.0
     */
    isTargetPaused:function(pTarget){
        CC.CCAssert( pTarget != NULL, "target must be non nil" );

        // Custom selectors
        var pElement = CC.HASH_FIND_INT(this._m_pHashForSelectors,pTarget);
        if(pElement != null){
            return pElement.paused;
        }
        return false;
    }
});

CC.CCScheduler.sharedScheduler = function(){
    if(!CC._pSharedScheduler){
        CC._pSharedScheduler = new CCScheduler();
        CC._pSharedScheduler._init();
    }
    return CC._pSharedScheduler;
}

CC.CCScheduler.purgeSharedScheduler = function(){
    CC._pSharedScheduler = null;
}


