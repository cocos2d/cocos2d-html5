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
var cc = cc = cc || {};

cc.DL_APPEND = function(head,add){
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

cc.DL_PREPEND = function(head,add){
    add.next = head;
    if(head != null){
        add.prev = head.prev;
        head.prev = add;
    }else{
        add.prev = add;
    }
};

cc.DL_DELETE = function(head,del){
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
cc.ArrayRemoveObjectAtIndex = function(arr,index){
    arr.splice(index,1);
};

/** Removes object at specified index and fills the gap with the last object,
 thereby avoiding the need to push back subsequent objects.
 Behaviour undefined if index outside [0, num-1]. */
cc.ArrayFastRemoveObjectAtIndex = function(arr,index){
    arr.splice(index,1);
};

cc.ArrayFastRemoveObject = function(arr,delObj){
    cc.ArrayRemoveObject(arr,delObj);
};

/** Searches for the first occurance of object and removes it. If object is not
 found the function has no effect. */
cc.ArrayRemoveObject = function(arr,delObj){
    for(var i = 0; i< arr.length;i++){
        if(arr[i] == delObj){
            arr.splice(i,1);
        }
    }
};

/** Removes from arr all values in minusArr. For each Value in minusArr, the
 first matching instance in arr will be removed. */
cc.ArrayRemoveArray = function(arr,minusArr){
    for(var i=0;i<minusArr.length;i++){
        cc.ArrayRemoveObject(arr,minusArr[i]);
    }
};

/** Returns index of first occurence of value, NSNotFound if value not found. */
cc.CArrayGetIndexOfValue = function(arr,value){
    for(var i=0;i<arr.length;i++){
        if(arr[i] == value){
            return i;
        }
    }
    return -1;
};

cc.ArrayAppendObject = function(arr,addObj){
    arr.push(addObj);
};

cc.ArrayAppendObjectToIndex = function(arr,addObj,index){
    var part1 = arr.slice( 0, index );
    var part2 = arr.slice( index );
    part1.push( addObj );
    arr = (part1.concat( part2 ));
    return arr;
};

cc.ArrayGetIndexOfObject = function(arr,findObj){
    for(var i =0; i < arr.length;i++){
        if(arr[i] == findObj)
            return i;
    }
    return -1;
};

cc.ArrayContainsObject = function(arr,findObj){
  return cc.ArrayGetIndexOfObject(arr,findObj) != -1;
};

cc.HASH_FIND_INT = function(arr,findInt){
    if(arr == null){
        return null;
    }
    for(var i=0; i< arr.length;i++){
        if(arr[i].target == findInt){
            return arr[i];
        }
    }
    return null;
};

cc.HASH_ADD_INT = function(head,intfield,add){
    //TODO
    cc.Log("HASH_ADD_INT no implemetion!");
};

cc.HASH_DEL = function(head,delptr){
    //TODO
    cc.Log("HASH_DEL no implemetion!");
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


/** @brief Light weight timer */
cc.Timer = cc.Class.extend({
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
                //TODO NEED TEST
                if(typeof(this._m_pfnSelector)=="string"){
                    this._m_pTarget[this._m_pfnSelector](this._m_fElapsed);
                }else if(typeof(this._m_pfnSelector) == "function"){
                    this._m_pfnSelector.call(this._m_pTarget,this._m_fElapsed);
                }
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
cc.Timer.timerWithTarget = function(pTarget,pfnSelector,fSeconds){
    if(arguments < 2)
        throw new Error("timerWithTarget'argument can't is null");

    if(arguments.length > 2){
        var pTimer = new cc.Timer();
        pTimer.initWithTarget(pTarget,pfnSelector);
        return pTimer;
    }else{
        var pTimer = new cc.Timer();
        pTimer.initWithTarget(pTarget,pfnSelector,fSeconds);
        return pTimer;
    }
}

cc._pSharedScheduler = null;
/** @brief Scheduler is responsible of triggering the scheduled callbacks.
 You should not use NSTimer. Instead use this class.

 There are 2 different types of callbacks (selectors):

 - update selector: the 'update' selector will be called every frame. You can customize the priority.
 - custom selector: A custom selector will be called every frame, or with a custom interval of time

 The 'custom selectors' should be avoided when possible. It is faster, and consumes less memory to use the 'update selector'.

 */
cc.Scheduler = cc.Class.extend({
    _m_fTimeScale:0.0,
    _m_pUpdatesNegList:[],                             // list of priority < 0
    _m_pUpdates0List:[],                               // list priority == 0
    _m_pUpdatesPosList:[],                             // list priority > 0
    _m_pHashForUpdates:[],                             // hash used to fetch quickly the list entries for pause,delete,etc

    _m_pHashForSelectors:[],                           //Used for "selectors with interval"

    _m_pCurrentTarget:null,
    _m_bCurrentTargetSalvaged:false,
    _m_bUpdateHashLocked:false,                          //If true unschedule will not remove anything from a hash. Elements will only be marked for deletion.

    ctor:function(){
    },

    //-----------------------private method----------------------
    /**
     * @private
     */
    _removeHashElement:function(pElement){
        pElement.Timer = null;

        pElement.target = null;

        cc.ArrayRemoveObject(this._m_pHashForSelectors,pElement);

        pElement = null;
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
            cc.ArrayRemoveObject(element.list,element.entry);
            element.entry = null;

            //hash entry
            element.target = null;
            cc.ArrayRemoveObject(this._m_pHashForUpdates,element);
            element == null;
        }
    },

    /**
     * @private
     */
    _init:function(){
        this._m_fTimeScale = 1.0;

        this._m_pUpdatesNegList = [];
        this._m_pUpdates0List = [];
        this._m_pUpdatesPosList = [];

        this._m_pHashForUpdates = [];
        this._m_pHashForSelectors = [];

        this._m_pCurrentTarget = null;
        this._m_bCurrentTargetSalvaged = false;
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
            ppList = [];
            ppList.push(pListElement);
        }else{
            var bAdded = false;
            for(var i=0; i< ppList.length;i++){
                if(nPriority < ppList[i].priority){
                    ppList = cc.ArrayAppendObjectToIndex(ppList,pListElement,i);
                    bAdded = true;
                    break;
                }
            }

            // Not added? priority has the higher value. Append it.
            if(!bAdded){
                ppList.push(pListElement);
            }
        }

        //update hash entry for quick access
        var pHashElement = new tHashUpdateEntry(ppList,pListElement,pTarget,null);
        //cc.HASH_ADD_INT(this._m_pHashForUpdates, pTarget, pHashElement);
        this._m_pHashForUpdates.push(pHashElement);
    },

    /**
     * @private
     */
    _appendIn:function(ppList,pTarget,bPaused){
        var pListElement = new tListEntry(null,null,pTarget,0,bPaused,false);
        //cc.DL_APPEND(ppList, pListElement);
        ppList.push(pListElement);

        //update hash entry for quicker access
        var pHashElement = new tHashUpdateEntry(ppList,pListElement,pTarget,null);
        this._m_pHashForUpdates.push(pHashElement);
        //cc.HASH_ADD_INT(this._m_pHashForUpdates, pTarget, pHashElement);
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
        var i =0;
        for(i=0;i<this._m_pUpdatesNegList.length;i++){
            pEntry = this._m_pUpdatesNegList[i];
            if((!pEntry.paused)&&(!pEntry.makedForDeletion)){
                pEntry.target.update(dt);
            }
        }

        // updates with priority == 0
        for(i=0;i<this._m_pUpdates0List.length;i++){
            pEntry = this._m_pUpdates0List[i];
            if((!pEntry.paused)&&(!pEntry.makedForDeletion)){
                pEntry.target.update(dt);
            }
        }

        // updates with priority > 0
        for(i=0;i<this._m_pUpdatesPosList.length;i++){
            pEntry = this._m_pUpdatesPosList[i];
            if((!pEntry.paused)&&(!pEntry.makedForDeletion)){
                pEntry.target.update(dt);
            }
        }

        //Interate all over the custom selectors
        var elt ;
        for(i =0;i<this._m_pHashForSelectors.length ; i++){
            this._m_pCurrentTarget = this._m_pHashForSelectors[i];
            elt = this._m_pCurrentTarget;
            this._m_bCurrentTargetSalvaged = false;

            if(!this._m_pCurrentTarget.paused){
                // The 'timers' array may change while inside this loop
                for(elt.timerIndex = 0; elt.timerIndex < elt.timers.length;elt.timerIndex++){
                    elt.currentTimer = elt.timers[elt.timerIndex];
                    elt.currentTimerSalvaged = false;

                    elt.currentTimer.update(dt);
                    elt.currentTimer = null;
                }
            }

            if((this._m_bCurrentTargetSalvaged) &&(this._m_pCurrentTarget.timers.length == 0)){
                this._removeHashElement(this._m_pCurrentTarget);
            }
        }

        //delete all updates that are marked for deletion
        // updates with priority < 0
        for(i=0;i<this._m_pUpdatesNegList.length;i++){
            if(this._m_pUpdatesNegList[i].makedForDeletion){
                this._removeUpdateFromHash(pEntry);
            }
        }

        // updates with priority == 0
        for(i=0;i<this._m_pUpdates0List.length;i++){
            if(this._m_pUpdates0List[i].makedForDeletion){
                this._removeUpdateFromHash(pEntry);
            }
        }

        // updates with priority > 0
        for(i=0;i<this._m_pUpdatesPosList.length;i++){
            if(this._m_pUpdatesPosList[i].makedForDeletion){
                this._removeUpdateFromHash(pEntry);
            }
        }

        this._m_bUpdateHashLocked = false;
        this._m_pCurrentTarget = null;
    },

    /** The scheduled method will be called every 'interval' seconds.
     If paused is YES, then it won't be called until it is resumed.
     If 'interval' is 0, it will be called every frame, but if so, it recommened to use 'scheduleUpdateForTarget:' instead.
     If the selector is already scheduled, then only the interval parameter will be updated without re-scheduling it again.

     @since v0.99.3
     */
    scheduleSelector:function(pfnSelector, pTarget,fInterval,bPaused){
        cc.Assert(pfnSelector, "scheduler.scheduleSelector()");
        cc.Assert(pTarget, "");

        var pElement = cc.HASH_FIND_INT(this._m_pHashForSelectors,pTarget);

        if(!pElement){
            // Is this the 1st element ? Then set the pause level to all the selectors of this target
            pElement = new tHashSelectorEntry(null,pTarget,0,null,null,bPaused,null);
            this._m_pHashForSelectors.push(pElement);
            //cc.HASH_ADD_INT(this._m_pHashForSelectors, pTarget, pElement);
        }else{
            cc.Assert(pElement.paused == bPaused, "Sheduler.scheduleSelector()");
        }

        if(pElement.timers == null){
            pElement.timers = [];
        }else{
            for(var i =0; i<pElement.timers.length;i++){
                var timer = pElement.timers[i];
                if(pfnSelector == timer._m_pfnSelector){
                    cc.LOG("CCSheduler#scheduleSelector. Selector already scheduled.");
                    timer._m_fInterval = fInterval;
                    return;
                }
            }
        }

        var pTimer = new cc.Timer();
        pTimer.initWithTarget(pTarget,pfnSelector,fInterval);
        pElement.timers.push(pTimer);
    },

    /** Schedules the 'update' selector for a given target with a given priority.
     The 'update' selector will be called every frame.
     The lower the priority, the earlier it is called.
     @since v0.99.3
     */
    scheduleUpdateForTarget:function(pTarget,nPriority,bPaused){
        var pHashElement = cc.HASH_FIND_INT(this._m_pHashForUpdates,pTarget);

        if(pHashElement){
            if (cc.COCOS2D_DEBUG >= 1){
                cc.Assert(pHashElement.entry.markedForDeletion,"");
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
        var pElement = cc.HASH_FIND_INT(this._m_pHashForSelectors,pTarget);
        if(pElement != null){
            for(var i =0; i < pElement.timers.length;i++){
                var pTimer = pElement.timers[i];
                if(pfnSelector == pTimer._m_pfnSelector){
                    if((pTimer == pElement.currentTimer)&&(!pElement.currentTimerSalvaged)){
                        pElement.currentTimerSalvaged = true;
                    }
                    cc.ArrayRemoveObjectAtIndex(pElement.timers, i);
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

        var pElement = cc.HASH_FIND_INT(this._m_pHashForUpdates,pTarget);

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

        var pElement = cc.HASH_FIND_INT(this._m_pHashForSelectors,pTarget);

        if(pElement != null){
            if((!pElement.currentTimerSalvaged) &&(cc.ArrayContainsObject(pElement.timers, pElement.currentTimer))){
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
        var i = 0;
        for(i=0; i<this._m_pHashForSelectors.length;i++){
            // pElement may be removed in unscheduleAllSelectorsForTarget
            this.unscheduleAllSelectorsForTarget(this._m_pHashForSelectors[i].target);
        }

        //updates selectors
        var pEntry = null, pTmp = null;
        for(i = 0;i<this._m_pUpdates0List.length;i++){
            this.unscheduleUpdateForTarget(this._m_pUpdates0List[i].target);
        }
        for(i = 0;i<this._m_pUpdatesNegList.length;i++){
            this.unscheduleUpdateForTarget(this._m_pUpdatesNegList[i].target);
        }
        for(i = 0;i<this._m_pUpdatesPosList.length;i++){
            this.unscheduleUpdateForTarget(this._m_pUpdatesPosList[i].target);
        }
    },

    /** Pauses the target.
     All scheduled selectors/update for a given target won't be 'ticked' until the target is resumed.
     If the target is not present, nothing happens.
     @since v0.99.3
     */
    pauseTarget:function(pTarget){
        cc.Assert(pTarget != null,"Scheduler.pauseTarget():entry must be non nil");

        //customer selectors
        var pElement = cc.HASH_FIND_INT(this._m_pHashForSelectors,pTarget);
        if(pElement != null){
            pElement.paused = true;
        }

        //update selector
        var pElementUpdate = cc.HASH_FIND_INT(this._m_pHashForUpdates,pTarget);
        if(pElementUpdate != null){
            cc.Assert(pElementUpdate.entry != null, "Scheduler.pauseTarget():entry must be non nil");
            pElementUpdate.entry.paused = true;
        }
    },

    /** Resumes the target.
     The 'target' will be unpaused, so all schedule selectors/update will be 'ticked' again.
     If the target is not present, nothing happens.
     @since v0.99.3
     */
    resumeTarget:function(pTarget){
        cc.Assert(pTarget != null, "");

        // custom selectors
        var pElement = cc.HASH_FIND_INT(this._m_pHashForSelectors,pTarget);

        if(pElement != null){
            pElement.paused = false;
        }

        //update selector
        var pElementUpdate = cc.HASH_FIND_INT(this._m_pHashForUpdates,pTarget);

        if(pElementUpdate != null){
            cc.Assert(pElementUpdate.entry != null, "Scheduler.resumeTarget():entry must be non nil");
            pElementUpdate.entry.paused = false;
        }
    },

    /** Returns whether or not the target is paused
     @since v1.0.0
     */
    isTargetPaused:function(pTarget){
        cc.Assert( pTarget != null, "Scheduler.isTargetPaused():target must be non nil" );

        // Custom selectors
        var pElement = cc.HASH_FIND_INT(this._m_pHashForSelectors,pTarget);
        if(pElement != null){
            return pElement.paused;
        }
        return false;
    }
});

cc.Scheduler.sharedScheduler = function(){
    if(!cc._pSharedScheduler){
        cc._pSharedScheduler = new cc.Scheduler();
        cc._pSharedScheduler._init();
    }
    return cc._pSharedScheduler;
}

cc.Scheduler.purgeSharedScheduler = function(){
    cc._pSharedScheduler = null;
}


