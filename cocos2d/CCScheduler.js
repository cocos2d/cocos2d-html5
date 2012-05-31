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

cc.DL_APPEND = function (head, add) {
    if (head != null) {
        add.prev = head.prev;
        head.prev.next = add;
        head.prev = add;
        add.next = null;
    } else {
        head = add;
        head.prev = head;
        head.next = null;
    }
};

cc.DL_PREPEND = function (head, add) {
    add.next = head;
    if (head != null) {
        add.prev = head.prev;
        head.prev = add;
    } else {
        add.prev = add;
    }
};

cc.DL_DELETE = function (head, del) {
    if (del.prev == del) {
        head = null;
    } else if (del == head) {
        del.next.prev = del.prev;
        head = del.next;
    } else {
        del.prev.next = del.next;
        if (del.next != null) {
            del.next.prev = del.prev;
        } else {
            head.prev = del.prev;
        }
    }
};

/** Removes object at specified index and pushes back all subsequent objects.
 Behaviour undefined if index outside [0, num-1]. */
cc.ArrayRemoveObjectAtIndex = function (arr, index) {
    arr.splice(index, 1);
};

/** Removes object at specified index and fills the gap with the last object,
 thereby avoiding the need to push back subsequent objects.
 Behaviour undefined if index outside [0, num-1]. */
cc.ArrayFastRemoveObjectAtIndex = function (arr, index) {
    arr.splice(index, 1);
};

cc.ArrayFastRemoveObject = function (arr, delObj) {
    cc.ArrayRemoveObject(arr, delObj);
};

/** Searches for the first occurance of object and removes it. If object is not
 found the function has no effect. */
cc.ArrayRemoveObject = function (arr, delObj) {
    for (var i = 0; i < arr.length; i++) {
        if (arr[i] == delObj) {
            arr.splice(i, 1);
        }
    }
};

/** Removes from arr all values in minusArr. For each Value in minusArr, the
 first matching instance in arr will be removed. */
cc.ArrayRemoveArray = function (arr, minusArr) {
    for (var i = 0; i < minusArr.length; i++) {
        cc.ArrayRemoveObject(arr, minusArr[i]);
    }
};

/** Returns index of first occurence of value, NSNotFound if value not found. */
cc.CArrayGetIndexOfValue = function (arr, value) {
    for (var i = 0; i < arr.length; i++) {
        if (arr[i] == value) {
            return i;
        }
    }
    return -1;
};

cc.ArrayAppendObject = function (arr, addObj) {
    arr.push(addObj);
};

cc.ArrayAppendObjectToIndex = function (arr, addObj, index) {
    var part1 = arr.slice(0, index);
    var part2 = arr.slice(index);
    part1.push(addObj);
    arr = (part1.concat(part2));
    return arr;
};

cc.ArrayGetIndexOfObject = function (arr, findObj) {
    for (var i = 0; i < arr.length; i++) {
        if (arr[i] == findObj)
            return i;
    }
    return -1;
};

cc.ArrayContainsObject = function (arr, findObj) {
    return cc.ArrayGetIndexOfObject(arr, findObj) != -1;
};

cc.HASH_FIND_INT = function (arr, findInt) {
    if (arr == null) {
        return null;
    }
    for (var i = 0; i < arr.length; i++) {
        if (arr[i].target == findInt) {
            return arr[i];
        }
    }
    return null;
};

cc.HASH_ADD_INT = function (head, intfield, add) {
    cc.Log("HASH_ADD_INT no implemetion!");
};

cc.HASH_DEL = function (head, delptr) {
    cc.Log("HASH_DEL no implemetion!");
};

//data structures
cc.tListEntry = function(prev, next, target, priority, paused, markedForDeletion) {
    this.prev = prev;
    this.next = next;
    this.target = target;                           // not retained (retained by hashUpdateEntry)
    this.priority = priority;
    this.paused = paused;
    this.makedForDeletion = markedForDeletion;      // selector will no longer be called and entry will be removed at end of the next tick
};

cc.tHashUpdateEntry = function(list, entry, target, hh) {
    this.list = list;                                   // Which list does it belong to ?
    this.entry = entry;                                 // entry in the list
    this.target = target;                               // hash key (retained)
    this.hh = hh;
};

// Hash Element used for "selectors with interval"
cc.tHashSelectorEntry = function(timers, target, timerIndex, currentTimer, currentTimerSalvaged, paused, hh) {
    this.timers = timers;
    this.target = target;                                // hash key (retained)
    this.timerIndex = timerIndex;
    this.currentTimer = currentTimer;
    this.currentTimerSalvaged = currentTimerSalvaged;
    this.paused = paused;
    this.hh = hh;
};


/** @brief Light weight timer */
cc.Timer = cc.Class.extend({
    _interval:0.0,
    _selector:"",

    _target:null,
    _elapsed:0.0,

    /**
     * CCTimer's Constructor
     * @private
     */
    ctor:function () {
    },

    getInterval:function () {
        return this._interval;
    },

    /** Initializes a timer with a target, a selector and an interval in seconds.
     *
     * @param target target
     * @param selector Selector
     * @param seconds second
     *
     * @return {Boolean} <tt>true</tt> if inintialized
     * * */
    initWithTarget:function (target, selector, seconds) {
        try {
            this._target = target;
            this._selector = selector;
            this._elapsed = -1;
            this._interval = seconds || 0;
            return true;
        } catch (e) {
            return false;
        }
    },

    /** triggers the timer
     * @param {float} dt
     * */
    update:function (dt) {
        if (this._elapsed == -1) {
            this._elapsed = 0;
        } else {
            this._elapsed += dt;
        }

        if (this._elapsed >= this._interval) {
            if (this._selector) {
                if (typeof(this._selector) == "string") {
                    this._target[this._selector](this._elapsed);
                } else if (typeof(this._selector) == "function") {
                    this._selector.call(this._target, this._elapsed);
                }
                this._elapsed = 0;
            }
        }
    }
});

/** Allocates a timer with a target, a selector and an interval in seconds.
 *
 * @param target target
 * @param selector Selector
 * @param seconds second
 *
 * @return a CCTimer instance
 * */
cc.Timer.timerWithTarget = function (target, selector, seconds) {
    if (arguments < 2)
        throw new Error("timerWithTarget'argument can't is null");

    var timer = new cc.Timer();
    if (arguments.length == 2) {
        timer.initWithTarget(target, selector, 0);
    } else {
        timer.initWithTarget(target, selector, seconds);
    }
    return timer;
};

cc._sharedScheduler = null;
/** @brief Scheduler is responsible of triggering the scheduled callbacks.
 You should not use NSTimer. Instead use this class.

 There are 2 different types of callbacks (selectors):

 - update selector: the 'update' selector will be called every frame. You can customize the priority.
 - custom selector: A custom selector will be called every frame, or with a custom interval of time

 The 'custom selectors' should be avoided when possible. It is faster, and consumes less memory to use the 'update selector'.

 */
cc.Scheduler = cc.Class.extend({
    _timeScale:0.0,
    _updatesNegList:[], // list of priority < 0
    _updates0List:[], // list priority == 0
    _updatesPosList:[], // list priority > 0
    _hashForUpdates:[], // hash used to fetch quickly the list entries for pause,delete,etc

    _hashForSelectors:[], //Used for "selectors with interval"

    _currentTarget:null,
    _currentTargetSalvaged:false,
    _updateHashLocked:false, //If true unschedule will not remove anything from a hash. Elements will only be marked for deletion.

    ctor:function () {
    },

    //-----------------------private method----------------------
    /**
     * @private
     */
    _removeHashElement:function (element) {
        element.Timer = null;
        element.target = null;
        cc.ArrayRemoveObject(this._hashForSelectors, element);
        element = null;
    },

    /**
     * @brief find Object from Array
     * @param Source Array
     * @param destination object
     * @return object if finded, or return null
     */
    _findElementFromArray:function (array, target) {
        for (var i = 0; i < array.length; i++) {
            if (array[i].target == target) {
                return array[i];
            }
        }
        return null;
    },

    /**
     * @private
     */
    _removeUpdateFromHash:function (entry) {
        var element = this._findElementFromArray(this._hashForUpdates, entry.target);
        if (element) {
            //list entry
            cc.ArrayRemoveObject(element.list, element.entry);
            element.entry = null;

            //hash entry
            element.target = null;
            cc.ArrayRemoveObject(this._hashForUpdates, element);
        }
    },

    /**
     * @private
     */
    _init:function () {
        this._timeScale = 1.0;

        this._updatesNegList = [];
        this._updates0List = [];
        this._updatesPosList = [];

        this._hashForUpdates = [];
        this._hashForSelectors = [];

        this._currentTarget = null;
        this._currentTargetSalvaged = false;
        this._updateHashLocked = false;

        return true;
    },

    /**
     * @private
     */
    _priorityIn:function (ppList, target, priority, paused) {
        var listElement = new cc.tListEntry(null, null, target, priority, paused, false);

        // empey list ?
        if (!ppList) {
            ppList = [];
            ppList.push(listElement);
        } else {
            var added = false;
            for (var i = 0; i < ppList.length; i++) {
                if (priority < ppList[i].priority) {
                    ppList = cc.ArrayAppendObjectToIndex(ppList, listElement, i);
                    added = true;
                    break;
                }
            }

            // Not added? priority has the higher value. Append it.
            if (!added) {
                ppList.push(listElement);
            }
        }

        //update hash entry for quick access
        var hashElement = new cc.tHashUpdateEntry(ppList, listElement, target, null);
        this._hashForUpdates.push(hashElement);
    },

    /**
     * @private
     */
    _appendIn:function (ppList, target, paused) {
        var listElement = new cc.tListEntry(null, null, target, 0, paused, false);
        ppList.push(listElement);

        //update hash entry for quicker access
        var hashElement = new cc.tHashUpdateEntry(ppList, listElement, target, null);
        this._hashForUpdates.push(hashElement);
    },

    //-----------------------public method-------------------------
    /** Modifies the time of all scheduled callbacks.
     You can use this property to create a 'slow motion' or 'fast forward' effect.
     Default is 1.0. To create a 'slow motion' effect, use values below 1.0.
     To create a 'fast forward' effect, use values higher than 1.0.
     @warning It will affect EVERY scheduled selector / action.
     */
    setTimeScale:function (timeScale) {
        this._timeScale = timeScale;
    },

    getTimeScale:function () {
        return this._timeScale;
    },

    /** 'tick' the scheduler. main loop
     You should NEVER call this method, unless you know what you are doing.
     */
    tick:function (dt) {
        this._updateHashLocked = true;

        if (this._timeScale != 1.0) {
            dt *= this._timeScale;
        }

        //Iterate all over the Updates selectors
        var tmpEntry;
        var i = 0;
        for (i = 0; i < this._updatesNegList.length; i++) {
            tmpEntry = this._updatesNegList[i];
            if ((!tmpEntry.paused) && (!tmpEntry.makedForDeletion)) {
                tmpEntry.target.update(dt);
            }
        }

        // updates with priority == 0
        for (i = 0; i < this._updates0List.length; i++) {
            tmpEntry = this._updates0List[i];
            if ((!tmpEntry.paused) && (!tmpEntry.makedForDeletion)) {
                tmpEntry.target.update(dt);
            }
        }

        // updates with priority > 0
        for (i = 0; i < this._updatesPosList.length; i++) {
            tmpEntry = this._updatesPosList[i];
            if ((!tmpEntry.paused) && (!tmpEntry.makedForDeletion)) {
                tmpEntry.target.update(dt);
            }
        }

        //Interate all over the custom selectors
        var elt;
        for (i = 0; i < this._hashForSelectors.length; i++) {
            this._currentTarget = this._hashForSelectors[i];
            elt = this._currentTarget;
            this._currentTargetSalvaged = false;

            if (!this._currentTarget.paused) {
                // The 'timers' array may change while inside this loop
                for (elt.timerIndex = 0; elt.timerIndex < elt.timers.length; elt.timerIndex++) {
                    elt.currentTimer = elt.timers[elt.timerIndex];
                    elt.currentTimerSalvaged = false;

                    elt.currentTimer.update(dt);
                    elt.currentTimer = null;
                }
            }

            if ((this._currentTargetSalvaged) && (this._currentTarget.timers.length == 0)) {
                this._removeHashElement(this._currentTarget);
            }
        }

        //delete all updates that are marked for deletion
        // updates with priority < 0
        for (i = 0; i < this._updatesNegList.length; i++) {
            if (this._updatesNegList[i].makedForDeletion) {
                this._removeUpdateFromHash(tmpEntry);
            }
        }

        // updates with priority == 0
        for (i = 0; i < this._updates0List.length; i++) {
            if (this._updates0List[i].makedForDeletion) {
                this._removeUpdateFromHash(tmpEntry);
            }
        }

        // updates with priority > 0
        for (i = 0; i < this._updatesPosList.length; i++) {
            if (this._updatesPosList[i].makedForDeletion) {
                this._removeUpdateFromHash(tmpEntry);
            }
        }

        this._updateHashLocked = false;
        this._currentTarget = null;
    },

    /** The scheduled method will be called every 'interval' seconds.
     If paused is YES, then it won't be called until it is resumed.
     If 'interval' is 0, it will be called every frame, but if so, it recommened to use 'scheduleUpdateForTarget:' instead.
     If the selector is already scheduled, then only the interval parameter will be updated without re-scheduling it again.

     @since v0.99.3
     */
    scheduleSelector:function (selector, target, interval, paused) {
        cc.Assert(selector, "scheduler.scheduleSelector()");
        cc.Assert(target, "");

        var element = cc.HASH_FIND_INT(this._hashForSelectors, target);

        if (!element) {
            // Is this the 1st element ? Then set the pause level to all the selectors of this target
            element = new cc.tHashSelectorEntry(null, target, 0, null, null, paused, null);
            this._hashForSelectors.push(element);
        } else {
            cc.Assert(element.paused == paused, "Sheduler.scheduleSelector()");
        }

        if (element.timers == null) {
            element.timers = [];
        } else {
            for (var i = 0; i < element.timers.length; i++) {
                var timer = element.timers[i];
                if (selector == timer._selector) {
                    cc.LOG("CCSheduler#scheduleSelector. Selector already scheduled.");
                    timer._interval = interval;
                    return;
                }
            }
        }

        var timer = new cc.Timer();
        timer.initWithTarget(target, selector, interval);
        element.timers.push(timer);
    },

    /** Schedules the 'update' selector for a given target with a given priority.
     The 'update' selector will be called every frame.
     The lower the priority, the earlier it is called.
     @since v0.99.3
     */
    scheduleUpdateForTarget:function (target, priority, paused) {
        var hashElement = cc.HASH_FIND_INT(this._hashForUpdates, target);

        if (hashElement) {
            if (cc.COCOS2D_DEBUG >= 1) {
                cc.Assert(hashElement.entry.markedForDeletion, "");
            }
            // TODO: check if priority has changed!
            hashElement.entry.markedForDeletion = false;
            return;
        }

        // most of the updates are going to be 0, that's way there
        // is an special list for updates with priority 0
        if (priority == 0) {
            this._appendIn(this._updates0List, target, paused);
        } else if (priority < 0) {
            this._priorityIn(this._updatesNegList, target, priority, paused);
        } else {
            // priority > 0
            this._priorityIn(this._updatesPosList, target, priority, paused);
        }
    },

    /** Unschedule a selector for a given target.
     If you want to unschedule the "update", use unscheudleUpdateForTarget.
     @since v0.99.3
     */
    unscheduleSelector:function (selector, target) {
        // explicity handle nil arguments when removing an object
        if ((target == null) || (selector == null)) {
            return;
        }

        ////CCAssert(target);
        ////CCAssert(selector);
        var element = cc.HASH_FIND_INT(this._hashForSelectors, target);
        if (element != null) {
            for (var i = 0; i < element.timers.length; i++) {
                var timer = element.timers[i];
                if (selector == timer._selector) {
                    if ((timer == element.currentTimer) && (!element.currentTimerSalvaged)) {
                        element.currentTimerSalvaged = true;
                    }
                    cc.ArrayRemoveObjectAtIndex(element.timers, i);
                    //update timerIndex in case we are in tick;, looping over the actions
                    if (element.timerIndex >= i) {
                        element.timerIndex--;
                    }

                    if (element.timers.length == 0) {
                        if (this._currentTarget == element) {
                            this._currentTargetSalvaged = true;
                        } else {

                            this._removeHashElement(element);
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
    unscheduleUpdateForTarget:function (target) {
        if (target == null) {
            return;
        }

        var element = cc.HASH_FIND_INT(this._hashForUpdates, target);
        if (element != null) {
            if (this._updateHashLocked) {
                element.entry.markedForDeletion = true;
            } else {
                this._removeUpdateFromHash(element.entry);
            }
        }
    },

    /** Unschedules all selectors for a given target.
     This also includes the "update" selector.
     @since v0.99.3
     */
    unscheduleAllSelectorsForTarget:function (target) {
        //explicit NULL handling
        if (target == null) {
            return;
        }

        var element = cc.HASH_FIND_INT(this._hashForSelectors, target);
        if (element) {
            if ((!element.currentTimerSalvaged) && (cc.ArrayContainsObject(element.timers, element.currentTimer))) {
                element.currentTimerSalvaged = true;
            }
            element.timers.length = 0;

            if (this._currentTarget == element) {
                this._currentTargetSalvaged = true;
            } else {
                this._removeHashElement(element);
            }
        }
        // update selector
        this.unscheduleUpdateForTarget(target);
    },

    /** Unschedules all selectors from all targets.
     You should NEVER call this method, unless you know what you are doing.

     @since v0.99.3
     */
    unscheduleAllSelectors:function () {
        // Custom Selectors
        var i = 0;
        for (i = 0; i < this._hashForSelectors.length; i++) {
            // element may be removed in unscheduleAllSelectorsForTarget
            this.unscheduleAllSelectorsForTarget(this._hashForSelectors[i].target);
        }

        //updates selectors
        for (i = 0; i < this._updates0List.length; i++) {
            this.unscheduleUpdateForTarget(this._updates0List[i].target);
        }
        for (i = 0; i < this._updatesNegList.length; i++) {
            this.unscheduleUpdateForTarget(this._updatesNegList[i].target);
        }
        for (i = 0; i < this._updatesPosList.length; i++) {
            this.unscheduleUpdateForTarget(this._updatesPosList[i].target);
        }
    },

    /** Pauses the target.
     All scheduled selectors/update for a given target won't be 'ticked' until the target is resumed.
     If the target is not present, nothing happens.
     @since v0.99.3
     */
    pauseTarget:function (target) {
        cc.Assert(target != null, "Scheduler.pauseTarget():entry must be non nil");

        //customer selectors
        var element = cc.HASH_FIND_INT(this._hashForSelectors, target);
        if (element) {
            element.paused = true;
        }

        //update selector
        var elementUpdate = cc.HASH_FIND_INT(this._hashForUpdates, target);
        if (elementUpdate) {
            cc.Assert(elementUpdate.entry != null, "Scheduler.pauseTarget():entry must be non nil");
            elementUpdate.entry.paused = true;
        }
    },

    /** Resumes the target.
     The 'target' will be unpaused, so all schedule selectors/update will be 'ticked' again.
     If the target is not present, nothing happens.
     @since v0.99.3
     */
    resumeTarget:function (target) {
        cc.Assert(target != null, "");

        // custom selectors
        var element = cc.HASH_FIND_INT(this._hashForSelectors, target);

        if (element) {
            element.paused = false;
        }

        //update selector
        var elementUpdate = cc.HASH_FIND_INT(this._hashForUpdates, target);

        if (elementUpdate) {
            cc.Assert(elementUpdate.entry != null, "Scheduler.resumeTarget():entry must be non nil");
            elementUpdate.entry.paused = false;
        }
    },

    /** Returns whether or not the target is paused
     @since v1.0.0
     */
    isTargetPaused:function (target) {
        cc.Assert(target != null, "Scheduler.isTargetPaused():target must be non nil");

        // Custom selectors
        var element = cc.HASH_FIND_INT(this._hashForSelectors, target);
        if (element) {
            return element.paused;
        }
        return false;
    }
});

cc.Scheduler.sharedScheduler = function () {
    if (!cc._sharedScheduler) {
        cc._sharedScheduler = new cc.Scheduler();
        cc._sharedScheduler._init();
    }
    return cc._sharedScheduler;
};

cc.Scheduler.purgeSharedScheduler = function () {
    cc._sharedScheduler = null;
};


