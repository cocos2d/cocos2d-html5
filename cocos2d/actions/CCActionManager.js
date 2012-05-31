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
/**
 @brief CCActionManager is a singleton that manages all the actions.
 Normally you won't need to use this singleton directly. 99% of the cases you will use the CCNode interface,
 which uses this singleton.
 But there are some cases where you might need to use this singleton.
 Examples:
 - When you want to run an action where the target is different from a CCNode.
 - When you want to pause / resume the actions

 @since v0.8
 */
cc.tHashElement = cc.Class.extend({
    actions:null,
    target:null, //ccobject
    actionIndex:0,
    currentAction:null, //CCAction
    currentActionSalvaged:false,
    paused:false,
    hh:null, //ut hash handle
    ctor:function () {
        this.actions = [];
    }
});
cc.ActionManager = cc.Class.extend({
    _targets:null,
    _currentTarget:null,
    _currentTargetSalvaged:false,

    _searchElementByTarget:function (arr, target) {
        for (var k = 0; k < arr.length; k++) {
            if (target == arr[k].target) {
                return arr[k];
            }
        }
        return null;
    },

    ctor:function () {
        cc.Assert(cc.gSharedManager == null, "");
        this._targets = [];
    },

    init:function () {
        cc.Scheduler.sharedScheduler().scheduleUpdateForTarget(this, 0, false);
        return true;
    },
    /** Adds an action with a target.
     If the target is already present, then the action will be added to the existing target.
     If the target is not present, a new instance of this target will be created either paused or not, and the action will be added to the newly created target.
     When the target is paused, the queued actions won't be 'ticked'.
     */
    selTarget:null,
    addAction:function (action, target, paused) {
        cc.Assert(action != null, "no action");
        cc.Assert(target != null, "");
        //check if the action target already exists
        var element = this._searchElementByTarget(this._targets, target);
        //if doesnt exists, create a hashelement and push in mpTargets
        if (!element) {
            element = new cc.tHashElement();
            element.paused = paused;
            element.target = target;
            element.id = target.id || "no id";
            this.selTarget = element;
            this._targets.push(element);
        }
        //creates a array for that eleemnt to hold the actions
        this._actionAllocWithHashElement(element);
        cc.Assert((element.actions.indexOf(action) == -1), "ActionManager.addAction(),");

        element.actions.push(action);
        action.startWithTarget(target);
    },
    /** Removes all actions from all the targets.
     */
    removeAllActions:function () {
        for (var i = 0; i < this._targets.length; i++) {
            var element = this._targets[i];
            if (element) {
                this.removeAllActionsFromTarget(element.target);
            }
        }
    },
    /** Removes all actions from a certain target.
     All the actions that belongs to the target will be removed.
     */
    removeAllActionsFromTarget:function (target) {
        // explicit null handling
        if (target == null) {
            return;
        }
        var element = this._searchElementByTarget(this._targets, target);

        //var element = (target in this._targets)? this._targets[ptarget]: null;
        if (element) {
            if (element.currentAction in element.actions && !(element.currentActionSalvaged)) {
                element.currentActionSalvaged = true;
            }

            element.actions = [];
            if (this._currentTarget == element) {
                this._currentTargetSalvaged = true;
            }
            else {
                this._deleteHashElement(element);
            }
        } else {
            //cc.Log("cocos2d: removeAllActionsFromTarget: Target not found");
        }
    },
    /** Removes an action given an action reference.
     */
    removeAction:function (action) {
        // explicit null handling
        if (action == null) {
            return;
        }
        var target = action.getOriginalTarget();
        var element = this._searchElementByTarget(this._targets, target);

        if (element) {
            for (var i = 0; i < element.actions.length; i++) {
                if (element.actions[i] == action) {
                    element.actions.splice(i, 1);
                    break;
                }
            }
        } else {
            cc.LOG("cocos2d: removeAction: Target not found");
        }
    },
    /** Removes an action given its tag and the target */
    removeActionByTag:function (tag, target) {
        cc.Assert(tag != cc.CCACTION_TAG_INVALID, "");
        cc.Assert(target != null, "");

        var element = this._searchElementByTarget(this._targets, target);

        if (element) {
            var limit = element.actions.length;
            for (var i = 0; i < limit; ++i) {
                var action = element.actions[i];
                if (action) {
                    if (action.getTag() == tag && action.getOriginalTarget() == target) {
                        this._removeActionAtIndex(i, element);
                        break;
                    }
                }
            }
        }
    },
    /** Gets an action given its tag an a target
     @return the Action the with the given tag
     */
    getActionByTag:function (tag, target) {
        cc.Assert(tag != cc.CCACTION_TAG_INVALID, "");
        var element = this._searchElementByTarget(this._targets, target);
        if (element) {
            if (element.actions != null) {
                for (var i = 0; i < element.actions.length; ++i) {
                    var action = element.actions[i];
                    if (action) {
                        if (action.getTag() == tag) {
                            return action;
                        }
                    }
                }
            }
        }

        return null;
    },


    /** Returns the numbers of actions that are running in a certain target.
     * Composable actions are counted as 1 action. Example:
     * - If you are running 1 Sequence of 7 actions, it will return 1.
     * - If you are running 7 Sequences of 2 actions, it will return 7.
     */
    numberOfRunningActionsInTarget:function (target) {
        var element = this._searchElementByTarget(this._targets, target);
        if (element) {
            return (element.actions) ? element.actions.length : 0;
        }

        return 0;
    },
    /** Pauses the target: all running actions and newly added actions will be paused.
     */
    pauseTarget:function (target) {
        var element = this._searchElementByTarget(this._targets, target);
        if (element) {
            element.paused = true;
        }
    },
    /** Resumes the target. All queued actions will be resumed.
     */
    resumeTarget:function (target) {
        var element = this._searchElementByTarget(this._targets, target);
        if (element) {
            element.paused = false;
        }
    },
    /** purges the shared action manager. It releases the retained instance.
     * because it uses this, so it can not be static
     @since v0.99.0
     */
    purgeSharedManager:function () {
        cc.Scheduler.sharedScheduler().unscheduleUpdateForTarget(this);
    },

    //protected
    _removeActionAtIndex:function (index, element) {
        var action = element.actions[index];

        if ((action == element.currentAction) && (!element.currentActionSalvaged)) {
            element.currentActionSalvaged = true;
        }

        element.actions[index] = null;

        // update actionIndex in case we are in tick. looping over the actions
        if (element.actionIndex >= index) {
            element.actionIndex--;
        }

        if (element.actions.length == 0) {
            if (this._currentTarget == element) {
                this._currentTargetSalvaged = true;
            }
            else {
                this._deleteHashElement(element);
            }
        }
    },

    _deleteHashElement:function (element) {
        cc.ArrayRemoveObject(this._targets, element);
        if (element) {
            element.actions = null;
            element.target = null;
        }
    },

    _actionAllocWithHashElement:function (element) {
        // 4 actions per Node by default
        if (element.actions == null) {
            element.actions = [];
        }
    },

    update:function (dt) {
        for (var elt = 0; elt < this._targets.length; elt++) {
            this._currentTarget = this._targets[elt];
            this._currentTargetSalvaged = false;
            if (!this._currentTarget.paused) {
                // The 'actions' CCMutableArray may change while inside this loop.
                for (this._currentTarget.actionIndex = 0; this._currentTarget.actionIndex < this._currentTarget.actions.length;
                     this._currentTarget.actionIndex++) {
                    this._currentTarget.currentAction = this._currentTarget.actions[this._currentTarget.actionIndex];
                    if (this._currentTarget.currentAction == null) {
                        continue;
                    }

                    this._currentTarget.currentActionSalvaged = false;

                    this._currentTarget.currentAction.step(dt);

                    if (this._currentTarget.currentActionSalvaged) {
                        // The currentAction told the node to remove it. To prevent the action from
                        // accidentally deallocating itself before finishing its step, we retained
                        // it. Now that step is done, it's safe to release it.
                        this._currentTarget.currentAction = null;//release
                    } else if (this._currentTarget.currentAction.isDone()) {
                        this._currentTarget.currentAction.stop();

                        var action = this._currentTarget.currentAction;
                        // Make currentAction nil to prevent removeAction from salvaging it.
                        this._currentTarget.currentAction = null;
                        this.removeAction(action);
                    }

                    this._currentTarget.currentAction = null;
                }
            }

            // elt, at this moment, is still valid
            // so it is safe to ask this here (issue #490)

            // only delete currentTarget if no actions were scheduled during the cycle (issue #481)
            if (this._currentTargetSalvaged && this._currentTarget.actions.length == 0) {
                this._deleteHashElement(this._currentTarget);
            }
        }
    }
});
/** purges the shared action manager. It releases the retained instance.
 * because it uses this, so it can not be static
 @since v0.99.0
 */
cc.ActionManager.sharedManager = function () {
    if (!cc.gSharedManager) {
        cc.gSharedManager = new cc.ActionManager();
        if (!cc.gSharedManager.init()) {
            //delete CCActionManager if init error
            delete cc.gSharedManager;
        }
    }
    return cc.gSharedManager;
};

cc.gSharedManager = null;