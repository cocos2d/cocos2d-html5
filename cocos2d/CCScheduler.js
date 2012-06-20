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
 * Removes object at specified index and pushes back all subsequent objects.Behaviour undefined if index outside [0, num-1].
 * @function
 * @param {Array} arr Source Array
 * @param {Number} index index of remove object
 */
cc.ArrayRemoveObjectAtIndex = function (arr, index) {
    arr.splice(index, 1);
};

/**
 * Searches for the first occurance of object and removes it. If object is not found the function has no effect.
 * @function
 * @param {Array} arr Source Array
 * @param {*} delObj  remove object
 */
cc.ArrayRemoveObject = function (arr, delObj) {
    for (var i = 0; i < arr.length; i++) {
        if (arr[i] == delObj) {
            arr.splice(i, 1);
        }
    }
};

/**
 * Removes from arr all values in minusArr. For each Value in minusArr, the first matching instance in arr will be removed.
 * @function
 * @param {Array} arr Source Array
 * @param {Array} minusArr minus Array
 */
cc.ArrayRemoveArray = function (arr, minusArr) {
    for (var i = 0; i < minusArr.length; i++) {
        cc.ArrayRemoveObject(arr, minusArr[i]);
    }
};

/**
 * Returns index of first occurence of value, -1 if value not found.
 * @function
 * @param {Array} arr Source Array
 * @param {*} value find value
 * @return {Number} index of first occurence of value
 */
cc.ArrayGetIndexOfValue = function (arr, value) {
    for (var i = 0; i < arr.length; i++) {
        if (arr[i] == value) {
            return i;
        }
    }
    return -1;
};

/**
 * append an object to array
 * @function
 * @param {Array} arr
 * @param {*} addObj
 */
cc.ArrayAppendObject = function (arr, addObj) {
    arr.push(addObj);
};

/**
 * Inserts an object at index
 * @function
 * @param {Array} arr
 * @param {*} addObj
 * @param {Number} index
 * @return {Array}
 */
cc.ArrayAppendObjectToIndex = function (arr, addObj, index) {
    var part1 = arr.slice(0, index);
    var part2 = arr.slice(index);
    part1.push(addObj);
    arr = (part1.concat(part2));
    return arr;
};

/**
 * Returns index of first occurence of object, -1 if value not found.
 * @function
 * @param {Array} arr Source Array
 * @param {*} findObj find object
 * @return {Number} index of first occurence of value
 */
cc.ArrayGetIndexOfObject = function (arr, findObj) {
    for (var i = 0; i < arr.length; i++) {
        if (arr[i] == findObj)
            return i;
    }
    return -1;
};

/**
 * Returns a Boolean value that indicates whether value is present in the array.
 * @function
 * @param {Array} arr
 * @param {*} findObj
 * @return {Boolean}
 */
cc.ArrayContainsObject = function (arr, findObj) {
    return cc.ArrayGetIndexOfObject(arr, findObj) != -1;
};

/**
 * find object from array by target
 * @param {Array} arr source array
 * @param {cc.ListEntry|cc.HashUpdateEntry|cc.HashSelectorEntry} findInt find target
 * @return {cc.ListEntry|cc.HashUpdateEntry|cc.HashSelectorEntry}
 */
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

//data structures
/**
 * A list double-linked list used for "updates with priority"
 * @Class
 * @Construct
 * @param {cc.ListEntry} prev
 * @param {cc.ListEntry} next
 * @param {cc.Class} target not retained (retained by hashUpdateEntry)
 * @param {Number} priority
 * @param {Boolean} paused
 * @param {Boolean} markedForDeletion selector will no longer be called and entry will be removed at end of the next tick
 */
cc.ListEntry = function (prev, next, target, priority, paused, markedForDeletion) {
    this.prev = prev;
    this.next = next;
    this.target = target;
    this.priority = priority;
    this.paused = paused;
    this.makedForDeletion = markedForDeletion;
};

/**
 *  a update entry list
 * @Class
 * @Construct
 * @param {cc.ListEntry} list Which list does it belong to ?
 * @param {cc.ListEntry} entry entry in the list
 * @param {cc.Class} target hash key (retained)
 * @param {Array} hh
 */
cc.HashUpdateEntry = function (list, entry, target, hh) {
    this.list = list;
    this.entry = entry;
    this.target = target;
    this.hh = hh;
};

//
/**
 * Hash Element used for "selectors with interval"
 * @Class
 * @Construct
 * @param {Array} timers
 * @param {cc.Class} target  hash key (retained)
 * @param {Number} timerIndex
 * @param {cc.Timer} currentTimer
 * @param {Boolean} currentTimerSalvaged
 * @param {Boolean} paused
 * @param {Array} hh
 */
cc.HashSelectorEntry = function (timers, target, timerIndex, currentTimer, currentTimerSalvaged, paused, hh) {
    this.timers = timers;
    this.target = target;
    this.timerIndex = timerIndex;
    this.currentTimer = currentTimer;
    this.currentTimerSalvaged = currentTimerSalvaged;
    this.paused = paused;
    this.hh = hh;
};

/**
 * Light weight timer
 * @class
 * @extends cc.Class
 */
cc.Timer = cc.Class.extend(/** @lends cc.Timer# */{
    _interval:0.0,
    _selector:"",

    _target:null,
    _elapsed:0.0,

    /**
     * cc.Timer's Constructor
     * Constructor
     */
    ctor:function () {
    },

    /**
     * returns interval of timer
     * @return {Number}
     */
    getInterval:function () {
        return this._interval;
    },

    /**
     * Initializes a timer with a target, a selector and an interval in seconds.
     * @param {cc.Class} target target
     * @param {String|function} selector Selector
     * @param {Number} seconds second
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

    /**
     * triggers the timer
     * @param {Number} dt delta time
     */
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

/**
 * Allocates a timer with a target, a selector and an interval in seconds.
 * @function
 * @param {cc.Class} target
 * @param {String|function} selector Selector
 * @param {Number} seconds
 * @return {cc.Timer} a cc.Timer instance
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
/**
 * <p>
 *    Scheduler is responsible of triggering the scheduled callbacks.<br/>
 *    You should not use NSTimer. Instead use this class.<br/>
 *    <br/>
 *    There are 2 different types of callbacks (selectors):<br/>
 *       - update selector: the 'update' selector will be called every frame. You can customize the priority.<br/>
 *       - custom selector: A custom selector will be called every frame, or with a custom interval of time<br/>
 *       <br/>
 *    The 'custom selectors' should be avoided when possible. It is faster, and consumes less memory to use the 'update selector'. *
 * </p>
 * @class
 * @extends cc.Class
 *
 * @example
 * //register a schedule to scheduler
 * cc.Scheduler.sharedScheduler().scheduleSelector(selector, this, interval, !this._isRunning);
 */
cc.Scheduler = cc.Class.extend(/** @lends cc.Scheduler# */{
    _timeScale:0.0,
    _updatesNegList:[], // list of priority < 0
    _updates0List:[], // list priority == 0
    _updatesPosList:[], // list priority > 0
    _hashForUpdates:[], // hash used to fetch quickly the list entries for pause,delete,etc

    _hashForSelectors:[], //Used for "selectors with interval"

    _currentTarget:null,
    _currentTargetSalvaged:false,
    _updateHashLocked:false, //If true unschedule will not remove anything from a hash. Elements will only be marked for deletion.

    /**
     * Constructor
     */
    ctor:function () {
    },

    //-----------------------private method----------------------
    _removeHashElement:function (element) {
        element.Timer = null;
        element.target = null;
        cc.ArrayRemoveObject(this._hashForSelectors, element);
        element = null;
    },

    /**
     * find Object from Array
     * @private
     * @param {Array} Source Array
     * @param {cc.Class} destination object
     * @return {cc.ListEntry} object if finded, or return null
     */
    _findElementFromArray:function (array, target) {
        for (var i = 0; i < array.length; i++) {
            if (array[i].target == target) {
                return array[i];
            }
        }
        return null;
    },

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

    _priorityIn:function (ppList, target, priority, paused) {
        var listElement = new cc.ListEntry(null, null, target, priority, paused, false);

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
        var hashElement = new cc.HashUpdateEntry(ppList, listElement, target, null);
        this._hashForUpdates.push(hashElement);
    },

    _appendIn:function (ppList, target, paused) {
        var listElement = new cc.ListEntry(null, null, target, 0, paused, false);
        ppList.push(listElement);

        //update hash entry for quicker access
        var hashElement = new cc.HashUpdateEntry(ppList, listElement, target, null);
        this._hashForUpdates.push(hashElement);
    },

    //-----------------------public method-------------------------
    /**
     * <p>
     *    Modifies the time of all scheduled callbacks.<br/>
     *    You can use this property to create a 'slow motion' or 'fast forward' effect.<br/>
     *    Default is 1.0. To create a 'slow motion' effect, use values below 1.0.<br/>
     *    To create a 'fast forward' effect, use values higher than 1.0.<br/>
     *    @warning It will affect EVERY scheduled selector / action.
     * </p>
     * @param {Number} timeScale
     */
    setTimeScale:function (timeScale) {
        this._timeScale = timeScale;
    },

    /**
     * returns time scale of scheduler
     * @return {Number}
     */
    getTimeScale:function () {
        return this._timeScale;
    },

    /**
     * 'tick' the scheduler. main loop (You should NEVER call this method, unless you know what you are doing.)
     * @param {Number} dt delta time
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

    /**
     * <p>
     *   The scheduled method will be called every 'interval' seconds.</br>
     *   If paused is YES, then it won't be called until it is resumed.<br/>
     *   If 'interval' is 0, it will be called every frame, but if so, it recommened to use 'scheduleUpdateForTarget:' instead.<br/>
     *   If the selector is already scheduled, then only the interval parameter will be updated without re-scheduling it again.
     * </p>
     * @param {function} selector
     * @param {cc.Class} target
     * @param {Number} interval
     * @param {Boolean} paused
     * @example
     * //register a schedule to scheduler
     * cc.Scheduler.sharedScheduler().scheduleSelector(selector, this, interval, !this._isRunning);
     */
    scheduleSelector:function (selector, target, interval, paused) {
        cc.Assert(selector, "scheduler.scheduleSelector()");
        cc.Assert(target, "");

        var element = cc.HASH_FIND_INT(this._hashForSelectors, target);

        if (!element) {
            // Is this the 1st element ? Then set the pause level to all the selectors of this target
            element = new cc.HashSelectorEntry(null, target, 0, null, null, paused, null);
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
                    cc.Log("CCSheduler#scheduleSelector. Selector already scheduled.");
                    timer._interval = interval;
                    return;
                }
            }
        }

        var timer = new cc.Timer();
        timer.initWithTarget(target, selector, interval);
        element.timers.push(timer);
    },

    /**
     * <p>
     *    Schedules the 'update' selector for a given target with a given priority.<br/>
     *    The 'update' selector will be called every frame.<br/>
     *    The lower the priority, the earlier it is called.
     * </p>
     * @param {cc.Class} target
     * @param {Number} priority
     * @param {Boolean} paused
     * @example
     * //register this object to scheduler
     * cc.Scheduler.sharedScheduler().scheduleUpdateForTarget(this, priority, !this._isRunning);
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

    /**
     * <p>
     *   Unschedule a selector for a given target.<br/>
     *   If you want to unschedule the "update", use unscheudleUpdateForTarget.
     * </p>
     * @param {function} selector
     * @param {cc.Class} target
     * @example
     * //unschedule a selector of target
     * cc.Scheduler.sharedScheduler().unscheduleSelector(selector, this);
     */
    unscheduleSelector:function (selector, target) {
        // explicity handle nil arguments when removing an object
        if ((target == null) || (selector == null)) {
            return;
        }

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

    /**
     * Unschedules the update selector for a given target
     * @param {cc.Class} target
     * @example
     * //unschedules the "update" method.
     * cc.Scheduler.sharedScheduler().unscheduleUpdateForTarget(this);
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

    /**
     * Unschedules all selectors for a given target. This also includes the "update" selector.
     * @param {cc.Class} target
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

    /**
     *  <p>
     *      Unschedules all selectors from all targets. <br/>
     *      You should NEVER call this method, unless you know what you are doing.
     *  </p>
     */
    unscheduleAllSelectors:function () {
        // Custom Selectors
        var i;
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

    /**
     * <p>
     *    Pauses the target.<br/>
     *    All scheduled selectors/update for a given target won't be 'ticked' until the target is resumed.<br/>
     *    If the target is not present, nothing happens.
     * </p>
     * @param {cc.Class} target
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

    /**
     * Resumes the target.<br/>
     * The 'target' will be unpaused, so all schedule selectors/update will be 'ticked' again.<br/>
     * If the target is not present, nothing happens.
     * @param {cc.Class} target
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

    /**
     * Returns whether or not the target is paused
     * @param {cc.Class} target
     * @return {Boolean}
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

/**
 * returns a shared instance of the Scheduler
 * @function
 * @return {cc.Scheduler}
 */
cc.Scheduler.sharedScheduler = function () {
    if (!cc._sharedScheduler) {
        cc._sharedScheduler = new cc.Scheduler();
        cc._sharedScheduler._init();
    }
    return cc._sharedScheduler;
};

/**
 * purges the shared scheduler. It releases the retained instance.
 * @function
 */
cc.Scheduler.purgeSharedScheduler = function () {
    cc._sharedScheduler = null;
};


