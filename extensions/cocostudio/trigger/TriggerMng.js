/****************************************************************************
 Copyright (c) 2013 cocos2d-x.org

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

ccs.triggerManager = {
    _eventTriggers: {},
    _triggerObjs: {},
    _movementDispatches: [],

    destroyInstance: function () {
        this.removeAll();
        this._instance = null;
    },

    parse: function (triggers) {
        for (var i = 0; i < triggers.length; ++i) {
            var subDict = triggers[i];
            var triggerObj = ccs.TriggerObj.create();
            triggerObj.serialize(subDict);
            var events = triggerObj.getEvents();
            for (var j = 0; j < events.length; j++) {
                var event = events[j];
                this.add(event, triggerObj);
            }
            this._triggerObjs[triggerObj.getId()] = triggerObj;
        }
    },

    get: function (event) {
        return this._eventTriggers[event];
    },

    getTriggerObj: function (id) {
        return this._triggerObjs[id];
    },

    add: function (event, triggerObj) {
        var eventTriggers = this._eventTriggers[event];
        if (!eventTriggers) {
            eventTriggers = [];
        }
        if (eventTriggers.indexOf(triggerObj) == -1) {
            eventTriggers.push(triggerObj);
            this._eventTriggers[event] = eventTriggers;
        }
    },

    removeAll: function () {
        for (var key in this._eventTriggers) {
            var triObjArr = this._eventTriggers[key];
            for (var j = 0; j < triObjArr.length; j++) {
                var obj = triObjArr[j];
                obj.removeAll();
            }
        }
        this._eventTriggers = {};
    },

    remove: function (event, Obj) {
        if (Obj) {
            return this._removeObj(event, Obj);
        }
        var bRet = false;
        do
        {
            var triObjects = this._eventTriggers[event];
            if (!triObjects) break;
            for (var i = 0; i < triObjects.length; i++) {
                var triObject = triObjects[i];
                if (triObject) {
                    triObject.removeAll();
                }
            }
            delete this._eventTriggers[event];
            bRet = true;
        } while (0);
        return bRet;
    },

    _removeObj: function (event, Obj) {
        var bRet = false;
        do
        {
            var triObjects = this._eventTriggers[event];
            if (!triObjects) break;
            for (var i = 0; i < triObjects.length; i++) {
                var triObject = triObjects[i];
                if (triObject && triObject == Obj) {
                    triObject.removeAll();
                    triObjects.splice(i, 1);
                    break;
                }
            }
            bRet = true;
        } while (0);
        return bRet;
    },

    removeTriggerObj: function (id) {
        var obj = this.getTriggerObj(id);
        if (!obj) {
            return false;
        }
        var events = obj.getEvents();
        for (var i = 0; i < events.length; i++) {
            var event = events[i];
            this.remove(event, obj);
        }
        return true;
    },
    isEmpty: function () {
        return !this._eventTriggers || this._eventTriggers.length <= 0;
    },

    addArmatureMovementCallBack: function (armature, callFunc, target) {
        if (armature == null || target == null || callFunc == null) {
            return;
        }
        var locAmd, hasADD = false;
        for (var i = 0; i < this._movementDispatches.length; i++) {
            locAmd = this._movementDispatches[i];
            if (locAmd && locAmd[0] == armature) {
                locAmd.addAnimationEventCallBack(callFunc, target);
                hasADD = true;
            }
        }
        if (!hasADD) {
            var newAmd = new ccs.ArmatureMovementDispatcher();
            armature.getAnimation().setMovementEventCallFunc(newAmd.animationEvent, newAmd);
            newAmd.addAnimationEventCallBack(callFunc, target);
            this._movementDispatches.push([armature, newAmd]);
        }
    },

    removeArmatureMovementCallBack: function (armature, target, callFunc) {
        if (armature == null || target == null || callFunc == null) {
            return;
        }
        var locAmd;
        for (var i = 0; i < this._movementDispatches.length; i++) {
            locAmd = this._movementDispatches[i];
            if (locAmd && locAmd[0] == armature) {
                locAmd.removeAnimationEventCallBack(callFunc, target);
            }
        }
    },

    removeArmatureAllMovementCallBack: function (armature) {
        if (armature == null) {
            return;
        }
        var locAmd;
        for (var i = 0; i < this._movementDispatches.length; i++) {
            locAmd = this._movementDispatches[i];
            if (locAmd && locAmd[0] == armature) {
                this._movementDispatches.splice(i, 1);
                break;
            }
        }
    },

    removeAllArmatureMovementCallBack: function () {
        this._movementDispatches = [];
    },

	version: function () {
		return "1.2.0.0";
	}
};

ccs.ArmatureMovementDispatcher = ccs.Class.extend({
    _mapEventAnimation: null,
    ctor: function () {
        this._mapEventAnimation = [];
    },

    animationEvent: function (armature, movementType, movementID) {
        var locEventAni, locTarget, locFunc;
        for (var i = 0; i < this._mapEventAnimation.length; i++) {
            locEventAni = this._mapEventAnimation[i];
            locTarget = locEventAni[0];
            locFunc = locEventAni[1];
            if (locFunc)
                locFunc.call(locTarget, armature, movementType, movementID);
        }
    },

    addAnimationEventCallBack: function (callFunc, target) {
        this._mapEventAnimation.push([target, callFunc]);
    },

    removeAnimationEventCallBack: function (callFunc, target) {
        var locEventAni;
        for (var i = 0; i < this._mapEventAnimation.length; i++) {
            locEventAni = this._mapEventAnimation[i];
            if (locEventAni[0] == target) {
                this._mapEventAnimation.splice(i, 1);
            }
        }
    }
});