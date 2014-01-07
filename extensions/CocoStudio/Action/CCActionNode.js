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
 * Base class for ccs.ActionNode
 * @class
 * @extends ccs.Class
 */
ccs.ActionNode = ccs.Class.extend({
    _currentFrameIndex: 0,
    _destFrameIndex: 0,
    _unitTime: 0,
    _actionTag: 0,
    _bject: null,
    _actionSpawn: null,
    _action: null,
    _frameArray: null,
    _frameArrayNum: 0,
    ctor: function () {
        this._currentFrameIndex = 0;
        this._destFrameIndex = 0;
        this._unitTime = 0.1;
        this._actionTag = 0;
        this._bject = null;
        this._actionSpawn = null;
        this._action = null;
        this._frameArray = [];
        this._frameArrayNum = ccs.FrameType.max;
        for (var i = 0; i < this._frameArrayNum; i++) {
            this._frameArray.push([]);
        }
    },

    /**
     *  Init properties with a json dictionary
     * @param {Object} dic
     * @param {Object} root
     */
    initWithDictionary: function (dic, root) {
        this.setActionTag(dic["ActionTag"]);
        var actionframelist = dic["actionframelist"];
        for (var i = 0; i < actionframelist.length; i++) {
            var actionFrameDic = actionframelist[i];
            var frameInex = actionFrameDic["frameid"];
            if (actionFrameDic.hasOwnProperty("positionx")) {
                var positionX = actionFrameDic["positionx"];
                var positionY = actionFrameDic["positiony"];
                var actionFrame = new ccs.ActionMoveFrame();
                actionFrame.setFrameIndex(frameInex);
                actionFrame.setPosition(cc.p(positionX, positionY));
                var actionArray = this._frameArray[ccs.FrameType.move];
                actionArray.push(actionFrame);
            }

            if (actionFrameDic.hasOwnProperty("scalex")) {
                var scaleX = actionFrameDic["scalex"];
                var scaleY = actionFrameDic["scaley"];
                var actionFrame = new ccs.ActionScaleFrame();
                actionFrame.setFrameIndex(frameInex);
                actionFrame.setScaleX(scaleX);
                actionFrame.setScaleY(scaleY);
                var actionArray = this._frameArray[ccs.FrameType.scale];
                actionArray.push(actionFrame);
            }

            if (actionFrameDic.hasOwnProperty("rotation")) {
                var rotation = actionFrameDic["rotation"];
                var actionFrame = new ccs.ActionRotationFrame();
                actionFrame.setFrameIndex(frameInex);
                actionFrame.setRotation(rotation);
                var actionArray = this._frameArray[ccs.FrameType.rotate];
                actionArray.push(actionFrame);
            }

            if (actionFrameDic.hasOwnProperty("opacity")) {
                var opacity = actionFrameDic["opacity"];
                var actionFrame = new ccs.ActionFadeFrame();
                actionFrame.setFrameIndex(frameInex);
                actionFrame.setOpacity(opacity);
                var actionArray = this._frameArray[ccs.FrameType.fade];
                actionArray.push(actionFrame);
            }

            if (actionFrameDic.hasOwnProperty("colorr")) {
                var colorR = actionFrameDic["colorr"];
                var colorG = actionFrameDic["colorg"];
                var colorB = actionFrameDic["colorb"];
                var actionFrame = new ccs.ActionTintFrame();
                actionFrame.setFrameIndex(frameInex);
                actionFrame.setColor(cc.c3b(colorR, colorG, colorB));
                var actionArray = this._frameArray[ccs.FrameType.tint];
                actionArray.push(actionFrame);
            }
            actionFrameDic = null;
        }
        this.initActionNodeFromRoot(root);
    },

    initActionNodeFromRoot: function (root) {
        if (root instanceof ccs.Widget) {
            var widget = ccs.UIHelper.seekActionWidgetByActionTag(root, this.getActionTag());
            if (widget) {
                this.setObject(widget);
            }
        }
    },

    /**
     * Sets the time interval of frame.
     * @param {number} time
     */
    setUnitTime: function (time) {
        this._unitTime = time;
        this.refreshActionProperty();
    },

    /**
     * Gets the time interval of frame.
     * @returns {number}
     */
    getUnitTime: function () {
        return this._unitTime;
    },

    /**
     * Sets tag for ActionNode
     * @param tag
     */
    setActionTag: function (tag) {
        this._actionTag = tag;
    },

    /**
     * Gets tag for ActionNode
     * @returns {number}
     */
    getActionTag: function () {
        return this._actionTag;
    },

    /**
     * Sets node which will run a action.
     * @param {Object} node
     */
    setObject: function (node) {
        this._object = node;
    },

    /**
     * Gets node which will run a action.
     * @returns {*}
     */
    getObject: function () {
        return this._object;
    },

    /**
     * get actionNode
     * @returns {cc.Node}
     */
    getActionNode: function () {
        if (this._object instanceof cc.Node) {
            return this._object;
        }
        else if (this._object instanceof ccs.Widget) {
            return this._object;
        }
        return null;
    },

    /**
     * Insets a ActionFrame to ActionNode.
     * @param {number} index
     * @param {ccs.ActionFrame} frame
     */
    insertFrame: function (index, frame) {
        if (frame == null) {
            return;
        }
        var frameType = frame.getFrameType();
        var array = this._frameArray[frameType];
        array[index] = frame;
    },

    /**
     * Pushs back a ActionFrame to ActionNode.
     * @param {ccs.ActionFrame} frame
     */
    addFrame: function (frame) {
        if (!frame) {
            return;
        }
        var frameType = frame.getFrameType();
        var array = this._frameArray[frameType];
        array.push(frame);
    },

    /**
     * Remove a ActionFrame from ActionNode.
     * @param {ccs.ActionFrame} frame
     */
    deleteFrame: function (frame) {
        if (frame == null) {
            return;
        }
        var frameType = frame.getFrameType();
        var array = this._frameArray[frameType];
        cc.ArrayRemoveObject(array, frame);
    },

    /**
     * Remove all ActionFrames from ActionNode.
     */
    clearAllFrame: function () {
        for (var i = 0; i < this._frameArrayNum; i++) {
            this._frameArray[i] = [];
        }
    },

    /**
     * Refresh  property of action
     * @returns {null}
     */
    refreshActionProperty: function () {
        if (this._object == null) {
            return null;
        }
        var locSpawnArray = [];
        for (var i = 0; i < this._frameArrayNum; i++) {
            var locArray = this._frameArray[i];
            if (locArray.length <= 0) {
                continue;
            }
            var locSequenceArray = [];
            for (var j = 0; j < locArray.length; j++) {
                var locFrame = locArray[j];
                if (j != 0) {
                    var locSrcFrame = locArray[j - 1];
                    var locDuration = (locFrame.getFrameIndex() - locSrcFrame.getFrameIndex()) * this.getUnitTime();
                    var locAction = locFrame.getAction(locDuration);
                    locSequenceArray.push(locAction);
                }
            }
            var locSequence = cc.Sequence.create(locSequenceArray);
            if (locSequence != null) {
                locSpawnArray.push(locSequence);
            }
        }

        this._action = null;
        this._actionSpawn = cc.Spawn.create(locSpawnArray);
        return this._actionSpawn;
    },

    /**
     * Play the action.
     * @param {Boolean} loop
     * @param {cc.CallFunc} fun
     */
    playAction: function (fun) {
        if (this._object == null || this._actionSpawn == null) {
            return;
        }
        if(fun){
            this._action = cc.Sequence.create(this._actionSpawn,fun);
        }else{
            this._action = cc.Sequence.create(this._actionSpawn);
        }
        this.runAction();
    },

    /**
     * Run action.
     */
    runAction: function () {
        var node = this.getActionNode();
        if (node != null && this._action != null) {
            node.runAction(this._action);
        }
    },

    /**
     * Stop action.
     */
    stopAction: function () {
        var node = this.getActionNode();
        if (node != null && this._action != null) {
            if(!this._action.isDone())
                node.stopAction(this._action);
        }
    },

    /**
     * Gets index of first ActionFrame.
     * @returns {number}
     */
    getFirstFrameIndex: function () {
        var locFrameindex = 99999;
        var locIsFindFrame = false;
        for (var i = 0; i < this._frameArrayNum; i++) {
            var locArray = this._frameArray[i];
            if (locArray.length <= 0) {
                continue;
            }
            locIsFindFrame = true;
            var locFrame = locArray[0];
            var locFrameIndex = locFrame.getFrameIndex();
            locFrameindex = locFrameindex > locFrameIndex ? locFrameIndex : locFrameindex;
        }
        if (!locIsFindFrame) {
            locFrameindex = 0;
        }
        return locFrameindex;
    },

    /**
     * Gets index of last ActionFrame.
     * @returns {number}
     */
    getLastFrameIndex: function () {
        var locFrameindex = -1;
        var locIsFindFrame = false;
        for (var i = 0; i < this._frameArrayNum; i++) {
            var locArray = this._frameArray[i];
            if (locArray.length <= 0) {
                continue;
            }
            locIsFindFrame = true;
            var locFrame = locArray[locArray.length - 1];
            var locFrameIndex = locFrame.getFrameIndex();
            locFrameindex = locFrameindex < locFrameIndex ? locFrameIndex : locFrameindex;
        }
        if (!locIsFindFrame) {
            locFrameindex = 0;
        }
        return locFrameindex;
    },

    /**
     * Updates action states to some time.
     * @param time
     * @returns {boolean}
     */
    updateActionToTimeLine: function (time) {
        var locIsFindFrame = false;
        var locUnitTime = this.getUnitTime();
        for (var i = 0; i < this._frameArrayNum; i++) {
            var locArray = this._frameArray[i];
            if (locArray == null) {
                continue;
            }

            for (var j = 0; j < locArray.length; j++) {
                var locFrame = locArray[j];
                if (locFrame.getFrameIndex() * locUnitTime == time) {
                    this.easingToFrame(1.0, 1.0, locFrame);
                    locIsFindFrame = true;
                    break;
                }
                else if (locFrame.getFrameIndex() * locUnitTime > time) {
                    if (j == 0) {
                        this.easingToFrame(1.0, 1.0, locFrame);
                        locIsFindFrame = false;
                    }
                    else {
                        var locSrcFrame = locArray[j - 1];
                        var locDuration = (locFrame.getFrameIndex() - locSrcFrame.getFrameIndex()) * locUnitTime;
                        var locDelaytime = time - locSrcFrame.getFrameIndex() * locUnitTime;
                        this.easingToFrame(locDuration, 1.0, locSrcFrame);
                        this.easingToFrame(locDuration, locDelaytime / locDuration, locFrame);
                        locIsFindFrame = true;
                    }
                    break;
                }
            }
        }
        return locIsFindFrame;
    },

    /**
     * Easing to frame
     * @param {number} duration
     * @param {number} delayTime
     * @param {ccs.ActionFrame} destFrame
     */
    easingToFrame: function (duration, delayTime, destFrame) {
        var action = destFrame.getAction(duration);
        var node = this.getActionNode();
        if (action == null || node == null) {
            return;
        }
        action.startWithTarget(node);
        action.update(delayTime);
    },

    isActionDoneOnce: function () {
        if (this._action == null) {
            return true;
        }
        return this._action.isDone();
    }
});