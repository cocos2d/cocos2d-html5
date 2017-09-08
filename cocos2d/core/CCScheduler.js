/****************************************************************************
 Copyright (c) 2008-2010 Ricardo Quesada
 Copyright (c) 2011-2012 cocos2d-x.org
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

(function () {


var MAX_POOL_SIZE = 20;

//data structures
/**
 * A list double-linked list used for "updates with priority"
 * @param {ListEntry} prev
 * @param {ListEntry} next
 * @param {function} callback
 * @param {cc.Class} target not retained (retained by hashUpdateEntry)
 * @param {Number} priority
 * @param {Boolean} paused
 * @param {Boolean} markedForDeletion selector will no longer be called and entry will be removed at end of the next tick
 */
var ListEntry = function (prev, next, callback, target, priority, paused, markedForDeletion) {
    this.prev = prev;
    this.next = next;
    this.callback = callback;
    this.target = target;
    this.priority = priority;
    this.paused = paused;
    this.markedForDeletion = markedForDeletion;
};

var _listEntries = [];
ListEntry.get = function (prev, next, callback, target, priority, paused, markedForDeletion) {
    var result = _listEntries.pop();
    if (result) {
        result.prev = prev;
        result.next = next;
        result.callback = callback;
        result.target = target;
        result.priority = priority;
        result.paused = paused;
        result.markedForDeletion = markedForDeletion;
    }
    else {
        result = new ListEntry(prev, next, callback, target, priority, paused, markedForDeletion);
    }
    return result;
};
ListEntry.put = function (entry) {
    entry.prev = null;
    entry.next = null;
    entry.callback = null;
    entry.target = null;
    entry.priority = 0;
    entry.paused = false;
    entry.markedForDeletion = false;
    if (_listEntries.length < MAX_POOL_SIZE)
        _listEntries.push(entry);
};

/**
 * A update entry list
 * @param {Array} list Which list does it belong to ?
 * @param {ListEntry} entry entry in the list
 * @param {cc.Class} target hash key (retained)
 * @param {function} callback
 */
var HashUpdateEntry = function (list, entry, target, callback) {
    this.list = list;
    this.entry = entry;
    this.target = target;
    this.callback = callback;
};
var _hashUpdateEntries = [];
HashUpdateEntry.get = function (list, entry, target, callback) {
    var result = _hashUpdateEntries.pop();
    if (result) {
        result.list = list;
        result.entry = entry;
        result.target = target;
        result.callback = callback;
    }
    else {
        result = new HashUpdateEntry(list, entry, target, callback);
    }
    return result;
};
HashUpdateEntry.put = function (entry) {
    entry.list = null;
    entry.entry = null;
    entry.target = null;
    entry.callback = null;
    if (_hashUpdateEntries.length < MAX_POOL_SIZE)
        _hashUpdateEntries.push(entry);
};

//
/**
 * Hash Element used for "selectors with interval"
 * @param {Array} timers
 * @param {cc.Class} target  hash key (retained)
 * @param {Number} timerIndex
 * @param {CallbackTimer} currentTimer
 * @param {Boolean} currentTimerSalvaged
 * @param {Boolean} paused
 */
var HashTimerEntry = function (timers, target, timerIndex, currentTimer, currentTimerSalvaged, paused) {
    var _t = this;
    _t.timers = timers;
    _t.target = target;
    _t.timerIndex = timerIndex;
    _t.currentTimer = currentTimer;
    _t.currentTimerSalvaged = currentTimerSalvaged;
    _t.paused = paused;
};
var _hashTimerEntries = [];
HashTimerEntry.get = function (timers, target, timerIndex, currentTimer, currentTimerSalvaged, paused) {
    var result = _hashTimerEntries.pop();
    if (result) {
        result.timers = timers;
        result.target = target;
        result.timerIndex = timerIndex;
        result.currentTimer = currentTimer;
        result.currentTimerSalvaged = currentTimerSalvaged;
        result.paused = paused;
    }
    else {
        result = new HashTimerEntry(timers, target, timerIndex, currentTimer, currentTimerSalvaged, paused);
    }
    return result;
};
HashTimerEntry.put = function (entry) {
    entry.timers = null;
    entry.target = null;
    entry.timerIndex = 0;
    entry.currentTimer = null;
    entry.currentTimerSalvaged = false;
    entry.paused = false;
    if (_hashTimerEntries.length < MAX_POOL_SIZE)
        _hashTimerEntries.push(entry);
};

/**
 * Light weight timer
 * @extends cc.Class
 */
var CallbackTimer = function () {
    this._scheduler = null;
    this._elapsed = -1;
    this._runForever = false;
    this._useDelay = false;
    this._timesExecuted = 0;
    this._repeat = 0;
    this._delay = 0;
    this._interval = 0;

    this._target = null;
    this._callback = null;
    this._key = null;
};
cc.inject({
    initWithCallback: function (scheduler, callback, target, seconds, repeat, delay, key) {
        this._scheduler = scheduler;
        this._target = target;
        this._callback = callback;
        if (key)
            this._key = key;

        this._elapsed = -1;
        this._interval = seconds;
        this._delay = delay;
        this._useDelay = (this._delay > 0);
        this._repeat = repeat;
        this._runForever = (this._repeat === cc.REPEAT_FOREVER);
        return true;
    },
    /**
     * @return {Number} returns interval of timer
     */
    getInterval : function(){return this._interval;},
    /**
     * @param {Number} interval set interval in seconds
     */
    setInterval : function(interval){this._interval = interval;},

    /**
     * triggers the timer
     * @param {Number} dt delta time
     */
    update:function (dt) {
        if (this._elapsed === -1) {
            this._elapsed = 0;
            this._timesExecuted = 0;
        } else {
            this._elapsed += dt;
            if (this._runForever && !this._useDelay) {//standard timer usage
                if (this._elapsed >= this._interval) {
                    this.trigger();
                    this._elapsed = 0;
                }
            } else {//advanced usage
                if (this._useDelay) {
                    if (this._elapsed >= this._delay) {
                        this.trigger();

                        this._elapsed -= this._delay;
                        this._timesExecuted += 1;
                        this._useDelay = false;
                    }
                } else {
                    if (this._elapsed >= this._interval) {
                        this.trigger();

                        this._elapsed = 0;
                        this._timesExecuted += 1;
                    }
                }

                if (this._callback && !this._runForever && this._timesExecuted > this._repeat)
                    this.cancel();
            }
        }
    },

    getCallback: function(){
        return this._callback;
    },

    getKey: function(){
        return this._key;
    },

    trigger: function () {
        if (this._target && this._callback){
            this._callback.call(this._target, this._elapsed);
        }
    },

    cancel: function () {
        //override
        this._scheduler.unschedule(this._callback, this._target);
    }
}, CallbackTimer.prototype);

var _timers = [];
CallbackTimer.get = function () {
    return _timers.pop() || new CallbackTimer();
};
CallbackTimer.put = function (timer) {
    timer._scheduler = null;
    timer._elapsed = -1;
    timer._runForever = false;
    timer._useDelay = false;
    timer._timesExecuted = 0;
    timer._repeat = 0;
    timer._delay = 0;
    timer._interval = 0;
    timer._target = null;
    timer._callback = null;
    timer._key = null;
    if (_timers.length < MAX_POOL_SIZE)
        _timers.push(timer);
};

/**
 * <p>
 *    Scheduler is responsible of triggering the scheduled callbacks.<br/>
 *    You should not use NSTimer. Instead use this class.<br/>
 *    <br/>
 *    There are 2 different types of callbacks (selectors):<br/>
 *       - update callback: the 'update' callback will be called every frame. You can customize the priority.<br/>
 *       - custom callback: A custom callback will be called every frame, or with a custom interval of time<br/>
 *       <br/>
 *    The 'custom selectors' should be avoided when possible. It is faster, and consumes less memory to use the 'update callback'. *
 * </p>
 * @class
 * @extends cc.Class
 *
 * @example
 * //register a schedule to scheduler
 * cc.director.getScheduler().schedule(callback, this, interval, !this._isRunning);
 */
cc.Scheduler = cc.Class.extend(/** @lends cc.Scheduler# */{
    _timeScale:1.0,

    //_updates : null, //_updates[0] list of priority < 0, _updates[1] list of priority == 0, _updates[2] list of priority > 0,
    _updatesNegList: null,
    _updates0List: null,
    _updatesPosList: null,

    _hashForTimers:null, //Used for "selectors with interval"
    _arrayForTimers:null, //Speed up indexing
    _hashForUpdates:null, // hash used to fetch quickly the list entries for pause,delete,etc
    //_arrayForUpdates:null, //Speed up indexing

    _currentTarget:null,
    _currentTargetSalvaged:false,
    _updateHashLocked:false, //If true unschedule will not remove anything from a hash. Elements will only be marked for deletion.


    ctor:function () {
        this._timeScale = 1.0;
        this._updatesNegList = [];
        this._updates0List = [];
        this._updatesPosList = [];

        this._hashForUpdates = {};
        this._hashForTimers = {};
        this._currentTarget = null;
        this._currentTargetSalvaged = false;
        this._updateHashLocked = false;

        this._arrayForTimers = [];
        //this._arrayForUpdates = [];

    },

    //-----------------------private method----------------------

    _schedulePerFrame: function(callback, target, priority, paused){
        var hashElement = this._hashForUpdates[target.__instanceId];
        if (hashElement && hashElement.entry){
            // check if priority has changed
            if (hashElement.entry.priority !== priority){
                if (this._updateHashLocked){
                    cc.log("warning: you CANNOT change update priority in scheduled function");
                    hashElement.entry.markedForDeletion = false;
                    hashElement.entry.paused = paused;
                    return;
                }else{
                    // will be added again outside if (hashElement).
                    this.unscheduleUpdate(target);
                }
            }else{
                hashElement.entry.markedForDeletion = false;
                hashElement.entry.paused = paused;
                return;
            }
        }

        // most of the updates are going to be 0, that's why there
        // is an special list for updates with priority 0
        if (priority === 0){
            this._appendIn(this._updates0List, callback, target, paused);
        }else if (priority < 0){
            this._priorityIn(this._updatesNegList, callback, target, priority, paused);
        }else{
            // priority > 0
            this._priorityIn(this._updatesPosList, callback, target, priority, paused);
        }
    },

    _removeHashElement:function (element) {
        delete this._hashForTimers[element.target.__instanceId];
        var arr = this._arrayForTimers;
        for (var i = 0, l = arr.length; i < l; i++) {
            if (arr[i] === element) {
                arr.splice(i, 1);
                break;
            }
        }
        HashTimerEntry.put(element);
    },

    _removeUpdateFromHash:function (entry) {
        var self = this; 
        var element = self._hashForUpdates[entry.target.__instanceId];
        if (element) {
            // Remove list entry from list
            var list = element.list, listEntry = element.entry;
            for (var i = 0, l = list.length; i < l; i++) {
                if (list[i] === listEntry) {
                    list.splice(i, 1);
                    break;
                }
            }

            delete self._hashForUpdates[element.target.__instanceId];
            ListEntry.put(listEntry);
            HashUpdateEntry.put(element);
        }
    },

    _priorityIn:function (ppList, callback,  target, priority, paused) {
        var self = this,
            listElement = ListEntry.get(null, null, callback, target, priority, paused, false);

        // empey list ?
        if (!ppList) {
            ppList = [];
            ppList.push(listElement);
        } else {
            var index2Insert = ppList.length - 1;
            for(var i = 0; i <= index2Insert; i++){
                if (priority < ppList[i].priority) {
                    index2Insert = i;
                    break;
                }
            }
            ppList.splice(i, 0, listElement);
        }

        //update hash entry for quick access
        self._hashForUpdates[target.__instanceId] = HashUpdateEntry.get(ppList, listElement, target, null);

        return ppList;
    },

    _appendIn:function (ppList, callback, target, paused) {
        var self = this, 
            listElement = ListEntry.get(null, null, callback, target, 0, paused, false);
        ppList.push(listElement);

        //update hash entry for quicker access
        self._hashForUpdates[target.__instanceId] = HashUpdateEntry.get(ppList, listElement, target, null, null);
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
     * Returns time scale of scheduler
     * @return {Number}
     */
    getTimeScale:function () {
        return this._timeScale;
    },

    /**
     * 'update' the scheduler. (You should NEVER call this method, unless you know what you are doing.)
     * @param {Number} dt delta time
     */
    update:function (dt) {
        this._updateHashLocked = true;
        if(this._timeScale !== 1)
            dt *= this._timeScale;

        var i, list, len, entry;

        for(i=0,list=this._updatesNegList, len = list.length; i<len; i++){
            entry = list[i];
            if(!entry.paused && !entry.markedForDeletion)
                entry.callback(dt);
        }

        for(i=0, list=this._updates0List, len=list.length; i<len; i++){
            entry = list[i];
            if (!entry.paused && !entry.markedForDeletion)
                entry.callback(dt);
        }

        for(i=0, list=this._updatesPosList, len=list.length; i<len; i++){
            entry = list[i];
            if (!entry.paused && !entry.markedForDeletion)
                entry.callback(dt);
        }

        // Iterate over all the custom selectors
        var elt, arr = this._arrayForTimers;
        for(i=0; i<arr.length; i++){
            elt = arr[i];
            this._currentTarget = elt;
            this._currentTargetSalvaged = false;

            if (!elt.paused){
                // The 'timers' array may change while inside this loop
                for (elt.timerIndex = 0; elt.timerIndex < elt.timers.length; ++(elt.timerIndex)){
                    elt.currentTimer = elt.timers[elt.timerIndex];
                    elt.currentTimerSalvaged = false;

                    elt.currentTimer.update(dt);
                    elt.currentTimer = null;
                }
            }

            // elt, at this moment, is still valid
            // so it is safe to ask this here (issue #490)
            //elt = elt.hh.next;

            // only delete currentTarget if no actions were scheduled during the cycle (issue #481)
            if (this._currentTargetSalvaged && this._currentTarget.timers.length === 0)
                this._removeHashElement(this._currentTarget);
        }

        // delete all updates that are marked for deletion
        // updates with priority < 0
        for(i=0,list=this._updatesNegList; i<list.length; ){
            entry = list[i];
            if(entry.markedForDeletion)
                this._removeUpdateFromHash(entry);
            else
                i++;
        }

        for(i=0, list=this._updates0List; i<list.length; ){
            entry = list[i];
            if (entry.markedForDeletion)
                this._removeUpdateFromHash(entry);
            else
                i++;
        }

        for(i=0, list=this._updatesPosList; i<list.length; ){
            entry = list[i];
            if (entry.markedForDeletion)
                this._removeUpdateFromHash(entry);
            else
                i++;
        }

        this._updateHashLocked = false;
        this._currentTarget = null;
    },

    /**
     * <p>
     *   The scheduled method will be called every 'interval' seconds.</br>
     *   If paused is YES, then it won't be called until it is resumed.<br/>
     *   If 'interval' is 0, it will be called every frame, but if so, it recommended to use 'scheduleUpdateForTarget:' instead.<br/>
     *   If the callback function is already scheduled, then only the interval parameter will be updated without re-scheduling it again.<br/>
     *   repeat let the action be repeated repeat + 1 times, use cc.REPEAT_FOREVER to let the action run continuously<br/>
     *   delay is the amount of time the action will wait before it'll start<br/>
     * </p>
     * @deprecated since v3.4 please use .schedule
     * @param {cc.Class} target
     * @param {function} callback_fn
     * @param {Number} interval
     * @param {Number} repeat
     * @param {Number} delay
     * @param {Boolean} paused
     * @example
     * //register a schedule to scheduler
     * cc.director.getScheduler().scheduleCallbackForTarget(this, function, interval, repeat, delay, !this._isRunning );
     */
    scheduleCallbackForTarget: function(target, callback_fn, interval, repeat, delay, paused){
        //cc.log("scheduleCallbackForTarget is deprecated. Please use schedule.");
        this.schedule(callback_fn, target, interval, repeat, delay, paused, target.__instanceId + "");
    },

    schedule: function (callback, target, interval, repeat, delay, paused, key) {
        var isSelector = false;
        if (typeof callback !== "function") {
            var tmp = callback;
            callback = target;
            target = tmp;
            isSelector = true;
        }
        //callback, target, interval, repeat, delay, paused, key
        //callback, target, interval, paused, key
        if(arguments.length === 4 || arguments.length === 5){
            key = delay;
            paused = repeat;
            repeat = cc.REPEAT_FOREVER;
            delay = 0;
        }
        if (key === undefined) {
            key = target.__instanceId + "";
        }

        cc.assert(target, cc._LogInfos.Scheduler_scheduleCallbackForTarget_3);

        var element = this._hashForTimers[target.__instanceId];

        if (!element) {
            // Is this the 1st element ? Then set the pause level to all the callback_fns of this target
            element = HashTimerEntry.get(null, target, 0, null, null, paused);
            this._arrayForTimers.push(element);
            this._hashForTimers[target.__instanceId] = element;
        } else {
            cc.assert(element.paused === paused, "");
        }

        var timer, i;
        if (element.timers == null) {
            element.timers = [];
        } else {
            for (i = 0; i < element.timers.length; i++) {
                timer = element.timers[i];
                if (callback === timer._callback) {
                    cc.log(cc._LogInfos.Scheduler_scheduleCallbackForTarget, timer.getInterval().toFixed(4), interval.toFixed(4));
                    timer._interval = interval;
                    return;
                }
            }
        }

        timer = CallbackTimer.get();
        timer.initWithCallback(this, callback, target, interval, repeat, delay, key);
        element.timers.push(timer);
    },

    scheduleUpdate: function(target, priority, paused){
        this._schedulePerFrame(function(dt){
            target.update(dt);
        }, target, priority, paused);
    },

    _getUnscheduleMark: function(key, timer){
        //key, callback
        switch (typeof key){
            case "number":
            case "string":
                return key === timer._key;
            case "function":
                return key === timer._callback;
        }
    },
    unschedule: function (key, target) {
        //key, target
        //selector, target
        //callback, target - This is in order to increase compatibility

        // explicity handle nil arguments when removing an object
        if (!target || !key)
            return;

        var self = this, element = self._hashForTimers[target.__instanceId];
        if (element) {
            var timers = element.timers;
            for(var i = 0, li = timers.length; i < li; i++){
                var timer = timers[i];
                if (this._getUnscheduleMark(key, timer)) {
                    if ((timer === element.currentTimer) && (!element.currentTimerSalvaged)) {
                        element.currentTimerSalvaged = true;
                    }
                    timers.splice(i, 1);
                    CallbackTimer.put(timer);
                    //update timerIndex in case we are in tick;, looping over the actions
                    if (element.timerIndex >= i) {
                        element.timerIndex--;
                    }

                    if (timers.length === 0) {
                        if (self._currentTarget === element) {
                            self._currentTargetSalvaged = true;
                        } else {
                            self._removeHashElement(element);
                        }
                    }
                    return;
                }
            }
        }
    },

    unscheduleUpdate: function (target) {
        if (!target)
            return;

        var element = this._hashForUpdates[target.__instanceId];

        if (element) {
            if (this._updateHashLocked) {
                element.entry.markedForDeletion = true;
            } else {
                this._removeUpdateFromHash(element.entry);
            }
        }
    },

    unscheduleAllForTarget: function (target) {
        // explicit nullptr handling
        if (!target){
            return;
        }

        // Custom Selectors
        var element = this._hashForTimers[target.__instanceId];

        if (element) {
            var timers = element.timers;
            if (timers.indexOf(element.currentTimer) > -1 && 
                (!element.currentTimerSalvaged)) {
                element.currentTimerSalvaged = true;
            }
            for (var i = 0, l = timers.length; i < l; i++) {
                CallbackTimer.put(timers[i]);
            }
            timers.length = 0;

            if (this._currentTarget === element){
                this._currentTargetSalvaged = true;
            }else{
                this._removeHashElement(element);
            }
        }

        // update selector
        this.unscheduleUpdate(target);
    },

    unscheduleAll: function(){
        this.unscheduleAllWithMinPriority(cc.Scheduler.PRIORITY_SYSTEM);
    },

    unscheduleAllWithMinPriority: function(minPriority){
        // Custom Selectors
        var i, element, arr = this._arrayForTimers;
        for(i=arr.length-1; i>=0; i--){
            element = arr[i];
            this.unscheduleAllForTarget(element.target);
        }

        // Updates selectors
        var entry;
        var temp_length = 0;
        if(minPriority < 0){
            for(i=0; i<this._updatesNegList.length; ){
                temp_length = this._updatesNegList.length;
                entry = this._updatesNegList[i];
                if(entry && entry.priority >= minPriority)
                    this.unscheduleUpdate(entry.target);
                if (temp_length == this._updatesNegList.length)
                    i++;
            }
        }

        if(minPriority <= 0){
            for(i=0; i<this._updates0List.length; ){
                temp_length = this._updates0List.length;
                entry = this._updates0List[i];
                if (entry)
                    this.unscheduleUpdate(entry.target);
                if (temp_length == this._updates0List.length)
                    i++;
            }
        }

        for(i=0; i<this._updatesPosList.length; ){
            temp_length = this._updatesPosList.length;
            entry = this._updatesPosList[i];
            if(entry && entry.priority >= minPriority)
                this.unscheduleUpdate(entry.target);
            if (temp_length == this._updatesPosList.length)
                i++;
        }
    },

    isScheduled: function(callback, target){
        //key, target
        //selector, target
        cc.assert(callback, "Argument callback must not be empty");
        cc.assert(target, "Argument target must be non-nullptr");

        var element = this._hashForTimers[target.__instanceId];

        if (!element) {
            return false;
        }

        if (element.timers == null){
            return false;
        }
        else {
            var timers = element.timers;
            for (var i = 0; i < timers.length; ++i) {
                var timer =  timers[i];

                if (callback === timer._callback){
                    return true;
                }
            }
            return false;
        }
    },

    /**
     * <p>
     *  Pause all selectors from all targets.<br/>
     *  You should NEVER call this method, unless you know what you are doing.
     * </p>
     */
    pauseAllTargets:function () {
        return this.pauseAllTargetsWithMinPriority(cc.Scheduler.PRIORITY_SYSTEM);
    },

    /**
     * Pause all selectors from all targets with a minimum priority. <br/>
     * You should only call this with kCCPriorityNonSystemMin or higher.
     * @param {Number} minPriority
     */
    pauseAllTargetsWithMinPriority:function (minPriority) {
        var idsWithSelectors = [];

        var self = this, element, locArrayForTimers = self._arrayForTimers;
        var i, li;
        // Custom Selectors
        for(i = 0, li = locArrayForTimers.length; i < li; i++){
            element = locArrayForTimers[i];
            if (element) {
                element.paused = true;
                idsWithSelectors.push(element.target);
            }
        }

        var entry;
        if(minPriority < 0){
            for(i=0; i<this._updatesNegList.length; i++){
                entry = this._updatesNegList[i];
                if (entry) {
                    if(entry.priority >= minPriority){
						entry.paused = true;
                        idsWithSelectors.push(entry.target);
                    }
                }
            }
        }

        if(minPriority <= 0){
            for(i=0; i<this._updates0List.length; i++){
                entry = this._updates0List[i];
                if (entry) {
					entry.paused = true;
                    idsWithSelectors.push(entry.target);
                }
            }
        }

        for(i=0; i<this._updatesPosList.length; i++){
            entry = this._updatesPosList[i];
            if (entry) {
                if(entry.priority >= minPriority){
					entry.paused = true;
                    idsWithSelectors.push(entry.target);
                }
            }
        }

        return idsWithSelectors;
    },

    /**
     * Resume selectors on a set of targets.<br/>
     * This can be useful for undoing a call to pauseAllCallbacks.
     * @param {Array} targetsToResume
     */
    resumeTargets:function (targetsToResume) {
        if (!targetsToResume)
            return;

        for (var i = 0; i < targetsToResume.length; i++) {
            this.resumeTarget(targetsToResume[i]);
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

        cc.assert(target, cc._LogInfos.Scheduler_pauseTarget);

        //customer selectors
        var self = this, element = self._hashForTimers[target.__instanceId];
        if (element) {
            element.paused = true;
        }

        //update callback
        var elementUpdate = self._hashForUpdates[target.__instanceId];
        if (elementUpdate) {
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

        cc.assert(target, cc._LogInfos.Scheduler_resumeTarget);

        // custom selectors
        var self = this, element = self._hashForTimers[target.__instanceId];

        if (element) {
            element.paused = false;
        }

        //update callback
        var elementUpdate = self._hashForUpdates[target.__instanceId];

        if (elementUpdate) {
            elementUpdate.entry.paused = false;
        }
    },

    /**
     * Returns whether or not the target is paused
     * @param {cc.Class} target
     * @return {Boolean}
     */
    isTargetPaused:function (target) {

        cc.assert(target, cc._LogInfos.Scheduler_isTargetPaused);

        // Custom selectors
        var element = this._hashForTimers[target.__instanceId];
        if (element) {
            return element.paused;
        }
        var elementUpdate = this._hashForUpdates[target.__instanceId];
        if (elementUpdate) {
            return elementUpdate.entry.paused;
        }
        return false;
    },

    /**
     * <p>
     *    Schedules the 'update' callback_fn for a given target with a given priority.<br/>
     *    The 'update' callback_fn will be called every frame.<br/>
     *    The lower the priority, the earlier it is called.
     * </p>
     * @deprecated since v3.4 please use .scheduleUpdate
     * @param {cc.Class} target
     * @param {Number} priority
     * @param {Boolean} paused
     * @example
     * //register this object to scheduler
     * cc.director.getScheduler().scheduleUpdateForTarget(this, priority, !this._isRunning );
     */
    scheduleUpdateForTarget: function(target, priority, paused){
        //cc.log("scheduleUpdateForTarget is deprecated. Please use scheduleUpdate.");
        this.scheduleUpdate(target, priority, paused);
    },

    /**
     * <p>
     *   Unschedule a callback function for a given target.<br/>
     *   If you want to unschedule the "update", use unscheudleUpdateForTarget.
     * </p>
     * @deprecated since v3.4 please use .unschedule
     * @param {cc.Class} target
     * @param {function} callback callback[Function] or key[String]
     * @example
     * //unschedule a callback of target
     * cc.director.getScheduler().unscheduleCallbackForTarget(function, this);
     */
    unscheduleCallbackForTarget:function (target, callback) {
        //cc.log("unscheduleCallbackForTarget is deprecated. Please use unschedule.");
        this.unschedule(callback, target);
    },

    /**
     * Unschedules the update callback function for a given target
     * @param {cc.Class} target
     * @deprecated since v3.4 please use .unschedule
     * @example
     * //unschedules the "update" method.
     * cc.director.getScheduler().unscheduleUpdateForTarget(this);
     */
    unscheduleUpdateForTarget:function (target) {
        //cc.log("unscheduleUpdateForTarget is deprecated. Please use unschedule.");
        this.unscheduleUpdate(target);
    },

    /**
     * Unschedules all function callbacks for a given target. This also includes the "update" callback function.
     * @deprecated since v3.4 please use .unscheduleAll
     * @param {cc.Class} target
     */
    unscheduleAllCallbacksForTarget: function(target){
        //cc.log("unscheduleAllCallbacksForTarget is deprecated. Please use unscheduleAll.");
        this.unschedule(target.__instanceId + "", target);
    },

    /**
     *  <p>
     *      Unschedules all function callbacks from all targets. <br/>
     *      You should NEVER call this method, unless you know what you are doing.
     *  </p>
     * @deprecated since v3.4 please use .unscheduleAllWithMinPriority
     */
    unscheduleAllCallbacks: function(){
        //cc.log("unscheduleAllCallbacks is deprecated. Please use unscheduleAll.");
        this.unscheduleAllWithMinPriority(cc.Scheduler.PRIORITY_SYSTEM);
    },

    /**
     * <p>
     *    Unschedules all function callbacks from all targets with a minimum priority.<br/>
     *    You should only call this with kCCPriorityNonSystemMin or higher.
     * </p>
     * @deprecated since v3.4 please use .unscheduleAllWithMinPriority
     * @param {Number} minPriority
     */
    unscheduleAllCallbacksWithMinPriority:function (minPriority) {
        //cc.log("unscheduleAllCallbacksWithMinPriority is deprecated. Please use unscheduleAllWithMinPriority.");
        this.unscheduleAllWithMinPriority(minPriority);
    }
});

/**
 * Priority level reserved for system services.
 * @constant
 * @type Number
 */
cc.Scheduler.PRIORITY_SYSTEM = (-2147483647 - 1);

/**
 * Minimum priority level for user scheduling.
 * @constant
 * @type Number
 */
cc.Scheduler.PRIORITY_NON_SYSTEM = cc.Scheduler.PRIORITY_SYSTEM + 1;

})();
