/****************************************************************************
 Copyright (c) 2010-2012 cocos2d-x.org

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
 * Base class for ccs.ActionObject
 * @class
 * @extends ccs.Class
 */
ccs.ActionObject = ccs.Class.extend(/** @lends ccs.ActionObject# */{
    _actionNodeList: null,
    _name: "",
    _loop: false,
    _pause: false,
    _playing: false,
    _unitTime: 0,
    _currentTime: 0,
    _scheduler:null,
    ctor: function () {
        this._actionNodeList = [];
        this._name = "";
        this._loop = false;
        this._pause = false;
        this._playing = false;
        this._unitTime = 0.1;
        this._currentTime = 0;
        this._scheduler = new cc.Scheduler();
        cc.director.getScheduler().scheduleUpdateForTarget(this._scheduler, 0, false);
    },

    /**
     * Sets name for object
     * @param {string} name
     */
    setName: function (name) {
        this._name = name;
    },

    /**
     * Gets name for object
     * @returns {string}
     */
    getName: function () {
        return this._name;
    },

    /**
     * Sets if the action will loop play.
     * @param {boolean} loop
     */
    setLoop: function (loop) {
        this._loop = loop;
    },

    /**
     * Gets if the action will loop play.
     * @returns {boolean}
     */
    getLoop: function () {
        return this._loop;
    },

    /**
     * Sets the time interval of frame.
     * @param {number} time
     */
    setUnitTime: function (time) {
        this._unitTime = time;
        var frameNum = this._actionNodeList.length;
        for (var i = 0; i < frameNum; i++) {
            var locActionNode = this._actionNodeList[i];
            locActionNode.setUnitTime(this._unitTime);
        }
    },

    /**
     * Gets the time interval of frame.
     * @returns {number}
     */
    getUnitTime: function () {
        return this._unitTime;
    },

    /**
     * Gets the current time of frame.
     * @returns {number}
     */
    getCurrentTime: function () {
        return this._currentTime;
    },

    /**
     * Sets the current time of frame.
     * @param time
     */
    setCurrentTime: function (time) {
        this._currentTime = time;
    },

    /**
     * Return if the action is playing.
     * @returns {boolean}
     */
    isPlaying: function () {
        return this._playing;
    },

    /**
     * Init properties with a json dictionary
     * @param {Object} dic
     * @param {Object} root
     */
    initWithDictionary: function (dic, root) {
        this.setName(dic["name"]);
        this.setLoop(dic["loop"]);
        this.setUnitTime(dic["unittime"]);
        var actionNodeList = dic["actionnodelist"];
        for (var i = 0; i < actionNodeList.length; i++) {
            var locActionNode = new ccs.ActionNode();
            var locActionNodeDic = actionNodeList[i];
            locActionNode.initWithDictionary(locActionNodeDic, root);
            locActionNode.setUnitTime(this.getUnitTime());
            this._actionNodeList.push(locActionNode);
            locActionNodeDic = null;
        }
    },

    /**
     * Adds a ActionNode to play the action.
     * @param {ccs.ActionNode} node
     */
    addActionNode: function (node) {
        if (!node) {
            return;
        }
        this._actionNodeList.push(node);
        node.setUnitTime(this._unitTime);
    },

    /**
     * Removes a ActionNode which play the action.
     * @param {ccs.ActionNode} node
     */
    removeActionNode: function (node) {
        if (node == null) {
            return;
        }
        cc.arrayRemoveObject(this._actionNodeList, node);
    },

    /**
     * Play the action.
     * @param {cc.CallFunc} fun
     */
    play: function (fun) {
        this.stop();
        this.updateToFrameByTime(0);
        var frameNum = this._actionNodeList.length;
        for (var i = 0; i < frameNum; i++) {
            var locActionNode = this._actionNodeList[i];
            locActionNode.playAction(fun);
        }
        if (this._loop) {
            this._scheduler.scheduleCallbackForTarget(this, this.simulationActionUpdate, 0, cc.REPEAT_FOREVER, 0, false);
    }
    },

    /**
     * pause the action.
     */
    pause: function () {
        this._pause = true;
    },

    /**
     * stop the action.
     */
    stop: function () {
        for (var i = 0; i < this._actionNodeList.length; i++) {
            var locActionNode = this._actionNodeList[i];
            locActionNode.stopAction();
        }
        this._scheduler.unscheduleCallbackForTarget(this, this.simulationActionUpdate);
        this._pause = false;
    },

    /**
     * Method of update frame .
     */
    updateToFrameByTime: function (time) {
        this._currentTime = time;
        for (var i = 0; i < this._actionNodeList.length; i++) {
            var locActionNode = this._actionNodeList[i];
            locActionNode.updateActionToTimeLine(time);
        }
    },
    simulationActionUpdate: function (dt) {
        if (this._loop) {
            var isEnd = true;
            var actionNodeList = this._actionNodeList;
            for (var i = 0; i < actionNodeList.length; i++) {
                var actionNode = actionNodeList[i];
                if (actionNode.isActionDoneOnce() == false) {
                    isEnd = false;
                    break;
                }
            }
            if (isEnd) {
                this.play();
            }
        }
    }
});