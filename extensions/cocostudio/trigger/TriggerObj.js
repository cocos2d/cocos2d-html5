/****************************************************************************
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

ccs.BaseTriggerCondition = ccs.Class.extend({
    ctor:function(){

    },

    init: function () {
        return true;
    },

    detect: function () {
        return true;
    },

    serialize: function (jsonVal) {
    },

    removeAll: function () {
    }
});
ccs.BaseTriggerAction = ccs.Class.extend({
    ctor:function(){

    },

    init: function () {
        return true;
    },

    done: function () {

    },

    serialize: function (jsonVal) {
    },

    removeAll: function () {
    }
});

ccs.TriggerObj = ccs.Class.extend({
    _cons: null,
    _acts: null,
    _id: 0,
    _enable: true,
    _vInt: null,

    ctor: function () {
        this._id = 0;
        this._enable = true;
    },

    init: function () {
        this._cons = [];
        this._acts = [];
        this._vInt = [];
        return true;
    },

    detect: function () {
        if (!this._enable || this._cons.length == 0) {
            return true;
        }
        var ret = true;
        var obj = null;
        for (var i = 0; i < this._cons.length; i++) {
            obj = this._cons[i];
            if (obj && obj.detect) {
                ret = ret && obj.detect();
            }
        }
        return ret;
    },

    done: function () {
        if (!this._enable || this._acts.length == 0) {
            return;
        }
        var obj;
        for (var i = 0; i < this._acts.length; i++) {
            obj = this._acts[i];
            if (obj && obj.done) {
                obj.done();
            }
        }
    },

    removeAll: function () {
        var obj = null;
        for (var i = 0; i < this._cons.length; i++) {
            obj = this._cons[i];
            if (obj)
                obj.removeAll();
        }
        this._cons = [];
        for (var i = 0; i < this._acts.length; i++) {
            obj = this._acts[i];
            if (obj)
                obj.removeAll();
        }
        this._acts = [];
    },

    serialize: function (jsonVal) {
        this._id = jsonVal["id"] || 0;
        var conditions = jsonVal["conditions"] || [];
        for (var i = 0; i < conditions.length; i++) {
            var subDict = conditions[i];
            var classname = subDict["classname"];
            var con = ccs.objectFactory.createObject(classname);
            if (!con) {
                cc.log("class named classname(" + classname + ") can not implement!");
                continue;
            }

            con.serialize(subDict);
            con.init();
            this._cons.push(con);
        }

        var actions = jsonVal["actions"] || [];
        for (var i = 0; i < actions.length; i++) {
            var subDict = actions[i];
            var classname = subDict["classname"];
            var act = ccs.objectFactory.createObject(classname);
            if (!act) {
                cc.log("class named classname(" + classname + ") can not implement!");
                continue;
            }

            act.serialize(subDict);
            act.init();
            this._acts.push(act);
        }

        var events = jsonVal["events"] || [];
        for (var i = 0; i < events.length; i++) {
            var subDict = events[i];
            var event = subDict["id"];
            if (event < 0) {
                continue;
            }
            this._vInt.push(event);
        }
    },

    getId: function () {
        return this._id;
    },

    setEnable: function (enable) {
        this._enable = enable;
    },

    getEvents: function () {
        return this._vInt;
    }
});

ccs.TriggerObj.create = function () {
    var ret = new ccs.TriggerObj();
    if (ret.init())
        return ret;
    return null;
};