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
 * Base class for cc.ActionNode
 * @class
 * @extends cc.Class
 */
cc.ActionNode = cc.Class.extend({
    _currentFrameIndex: 0,
    _destFrameIndex: 0,
    _unitTime: 0,
    _actionTag: 0,
    _bject: null,
    _actionSpawn: null,
    _action: null,
    _frameArray: [],
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
        this._frameArrayNum = cc.FrameType.Max;
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
            var existPosition = actionFrameDic["positionx"];
            if (existPosition) {
                var positionX = actionFrameDic["positionx"];
                var positionY = actionFrameDic["positiony"];
                var actionFrame = new cc.ActionMoveFrame();
                actionFrame.setFrameIndex(frameInex);
                actionFrame.setPosition(cc.p(positionX, positionY));
                var actionArray = this._frameArray[cc.FrameType.Move];
                actionArray.push(actionFrame);
            }

            var existScale = actionFrameDic["scalex"];
            if (existScale) {
                var scaleX = actionFrameDic["scalex"];
                var scaleY = actionFrameDic["scaley"];
                var actionFrame = new cc.ActionScaleFrame();
                actionFrame.setFrameIndex(frameInex);
                actionFrame.setScaleX(scaleX);
                actionFrame.setScaleY(scaleY);
                var actionArray = this._frameArray[cc.FrameType.Scale];
                actionArray.push(actionFrame);
            }

            var existRotation = actionFrameDic["rotation"];
            if (existRotation) {
                var rotation = actionFrameDic["rotation"];
                var actionFrame = new cc.ActionRotationFrame();
                actionFrame.setFrameIndex(frameInex);
                actionFrame.setRotation(rotation);
                var actionArray = this._frameArray[cc.FrameType.Rotate];
                actionArray.push(actionFrame);
            }

            var existOpacity = actionFrameDic["opacity"];
            if (existOpacity) {
                var opacity = actionFrameDic["opacity"];
                var actionFrame = new cc.ActionFadeFrame();
                actionFrame.setFrameIndex(frameInex);
                actionFrame.setOpacity(opacity);
                var actionArray = this._frameArray[cc.FrameType.Fade];
                actionArray.push(actionFrame);
            }

            var existColor = actionFrameDic["colorr"];
            if (existColor) {
                var colorR = actionFrameDic["colorr"];
                var colorG = actionFrameDic["colorg"];
                var colorB = actionFrameDic["colorb"];
                var actionFrame = new cc.ActionTintFrame();
                actionFrame.setFrameIndex(frameInex);
                actionFrame.setColor(cc.c3b(colorR, colorG, colorB));
                var actionArray = this._frameArray[cc.FrameType.Tint];
                actionArray.push(actionFrame);
            }
            actionFrameDic = null;
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
        else if (this._object instanceof cc.UIWidget) {
            return this._object.getRenderer();
        }
        return null;
    },

    /**
     * Insets a ActionFrame to ActionNode.
     * @param {number} index
     * @param {cc.ActionFrame} frame
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
     * @param {cc.ActionFrame} frame
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
     * @param {cc.ActionFrame} frame
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
        var spawnArray = [];
        for (var n = 0; n < this._frameArrayNum; n++) {
            var array = this._frameArray[n];
            if (array.length <= 0) {
                continue;
            }
            var sequenceArray = [];
            var frameCount = array.length;
            for (var i = 0; i < frameCount; i++) {
                var frame = array[i];
                if (i != 0) {
                    var srcFrame = array[i - 1];
                    var duration = (frame.getFrameIndex() - srcFrame.getFrameIndex()) * this.getUnitTime();
                    var action = frame.getAction(duration);
                    sequenceArray.push(action);
                }
            }
            var sequence = cc.Sequence.create(sequenceArray);
            if (sequence != null) {
                spawnArray.push(sequence);
            }
        }

        if (this._action == null) {
            this._actionSpawn = null;
        }
        else {
            this._action = null;
        }

        this._actionSpawn = cc.Spawn.create(spawnArray);
        return this._actionSpawn;
    },

    /**
     * Play the action.
     * @param {Boolean} loop
     */
    playAction: function (loop) {
        if (this._object == null || this._actionSpawn == null) {
            return;
        }
        if (loop) {
            this._action = cc.RepeatForever.create(this._actionSpawn);
        }
        else {
            this._action = cc.Sequence.create(this._actionSpawn, null);
        }
        this._action.retain();
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
            node.stopAction(this._action);
        }
    },

    /**
     * Gets index of first ActionFrame.
     * @returns {number}
     */
    getFirstFrameIndex: function () {
        var frameindex = 99999;
        var isFindFrame = false;
        for (var i = 0; i < this._frameArrayNum; i++) {
            var array = this._frameArray[i];
            if (array.length <= 0) {
                continue;
            }
            isFindFrame = true;
            var frame = array[0];
            var locFrameIndex = frame.getFrameIndex();
            frameindex = frameindex > locFrameIndex ? locFrameIndex : frameindex;
        }
        if (!isFindFrame) {
            frameindex = 0;
        }
        return frameindex;
    },

    /**
     * Gets index of last ActionFrame.
     * @returns {number}
     */
    getLastFrameIndex: function () {
        var frameindex = -1;
        var isFindFrame = false;
        for (var n = 0; n < this._frameArrayNum; n++) {
            var array = this._frameArray[n];
            if (array.length <= 0) {
                continue;
            }
            isFindFrame = true;
            var frame = array[array.length - 1];
            var locFrameIndex = frame.getFrameIndex();
            frameindex = frameindex < locFrameIndex ? locFrameIndex : frameindex;
        }
        if (!isFindFrame) {
            frameindex = 0;
        }
        return frameindex;
    },

    /**
     * Updates action states to some time.
     * @param time
     * @returns {boolean}
     */
    updateActionToTimeLine: function (time) {
        var isFindFrame = false;
        var srcFrame = null;

        for (var n = 0; n < this._frameArrayNum; n++) {
            var array = this._frameArray[n];
            if (array == null) {
                continue;
            }
            var frameCount = array.length;
            for (var i = 0; i < frameCount; i++) {
                var frame = array[i];

                if (frame.getFrameIndex() * this.getUnitTime() == time) {
                    this.easingToFrame(1.0, 1.0, frame);
                    isFindFrame = true;
                    break;
                }
                else if (frame.getFrameIndex() * this.getUnitTime() > time) {
                    if (i == 0) {
                        this.easingToFrame(1.0, 1.0, frame);
                        isFindFrame = false;
                    }
                    else {
                        srcFrame = array[i - 1];
                        var duration = (frame.getFrameIndex() - srcFrame.getFrameIndex()) * this.getUnitTime();
                        var delaytime = time - srcFrame.getFrameIndex() * this.getUnitTime();
                        this.easingToFrame(duration, 1.0, srcFrame);
                        this.easingToFrame(duration, delaytime / duration, frame);
                        isFindFrame = true;
                    }
                    break;
                }
            }
        }
        return isFindFrame;
    },

    /**
     * Easing to frame
     * @param {number} duration
     * @param {number} delayTime
     * @param {cc.ActionFrame} destFrame
     */
    easingToFrame: function (duration, delayTime, destFrame) {
        var action = destFrame.getAction(duration);
        var node = this.getActionNode();
        if (action == null || node == null) {
            return;
        }
        action.startWithTarget(node);
        action.update(delayTime);
    }
});