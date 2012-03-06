/****************************************************************************
 Copyright (c) 2010-2012 cocos2d-x.org
 Copyright (c) 2008-2010 Ricardo Quesada
 Copyright (c) 2011      Zynga Inc.

 http://www.cocos2d-x.org

 Created by JetBrains WebStorm.
 User: wuhao
 Date: 12-3-6

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


var CC = CC = CC || {};
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
CC.tHashElement = CC.Class.extend({
    actions: [],
    target:null,//ccobject
    actionIndex: 0,
    currentAction: null,//CCAction
    currentActionSalvaged: false,
    paused: false,
    hh: null//ut hash handle
});
CC.CCActionManager = CC.Class.extend({
    _m_pTargets: null,
    _m_pCurrentTarget: null,
    _m_bCurrentTargetSalvaged: false,
    ctor: function(){
        CC.CCAssert(CC.gSharedManager == null,"");
    },
    init:function()
    {
        CC.CCScheduler.sharedScheduler().scheduleUpdateForTarget(this, 0, false);
        this._m_pTargets = null;

        return true;
    },
    /** Adds an action with a target.
     If the target is already present, then the action will be added to the existing target.
     If the target is not present, a new instance of this target will be created either paused or not, and the action will be added to the newly created target.
     When the target is paused, the queued actions won't be 'ticked'.
     */
    addAction: function(pAction, pTarget, paused)
    {
        CC.CCAssert(pAction != null, "");
        CC.CCAssert(pTarget != null, "");

        //var pElement = null;
        if(pTarget in this._m_pTargets)
        {
            this._m_pTargets.paused = paused;
            this._m_pTargets.target = pTarget;
            //TODO HASH ADD INT
        }
        this._actionAllocWithHashElement(this._m_pTargets);
        CC.CCAssert(!(pAction in this._m_pTargets.actions),"");
        this._m_pTargets.actions.push(pAction);
        pAction.startWithTarget(pTarget);
    },
    /** Removes all actions from all the targets.
     */
    removeAllActions: function()
    {
        for(var pElement in this._m_pTargets)
        {
            var pTarget = pElement.target;
            this.removeAllActionsFromTarget(pTarget);
        }
    },
    /** Removes all actions from a certain target.
     All the actions that belongs to the target will be removed.
     */
    removeAllActionsFromTarget: function(pTarget)
    {
        // explicit null handling
        if (pTarget == null)
        {
            return;
        }

        var pElement = (pTarget in this._m_pTargets)? this._m_pTargets: null;
        if (pElement)
        {
            if (pElement.currentAction in pElement.actions && !(pElement.currentActionSalvaged))
            {
                pElement.currentActionSalvaged = true;
            }

            pElement.actions = [];
            if (this._m_pCurrentTarget == pElement)
            {
                this._m_bCurrentTargetSalvaged = true;
            }
            else
            {
                this._deleteHashElement(pElement);
            }
        }
        else
        {
            //CCLOG("cocos2d: removeAllActionsFromTarget: Target not found");
        }
    },
    /** Removes an action given an action reference.
     */
    removeAction: function(pAction)
    {
        // explicit null handling
        if (pAction == null)
        {
            return;
        }
        var pTarget = pAction.getOriginalTarget();
        var pElement = (pTarget in this._m_pTargets)? this._m_pTargets: null;

        if (pElement)
        {
            for(var i = 0; i < pElement.actions.length; i++)
            {
                if(pElement.actions[i] == pAction)
                {
                    pElement.actions[i] = null;
                    break;
                }
            }
        }
        else
        {
            CC.CCLOG("cocos2d: removeAction: Target not found");
        }
    },
    /** Removes an action given its tag and the target */
    removeActionByTag: function(tag, pTarget)
    {
        CC.CCAssert(tag != CC.kCCActionTagInvalid, "");
        CC.CCAssert(pTarget != null, "");

        var pElement = (pTarget in this._m_pTargets)? this._m_pTargets: null;

        if (pElement)
        {
            var limit = pElement.actions.length;
            for (var i = 0; i < limit; ++i)
            {
                var pAction = pElement.actions[i];

                if (pAction.getTag() == tag && pAction.getOriginalTarget() == pTarget)
                {
                    this._removeActionAtIndex(i, pElement);
                    break;
                }
            }
        }
    },
    /** Gets an action given its tag an a target
     @return the Action the with the given tag
     */
    getActionByTag: function(tag, pTarget)
    {
        CC.CCAssert(tag != CC.kCCActionTagInvalid, "");

        var pElement = (pTarget in this._m_pTargets)? this._m_pTargets: null;

        if (pElement)
        {
            if (pElement.actions != null)
            {
                var limit = pElement.actions.length;
                for (var i = 0; i < limit; ++i)
                {
                    var pAction = pElement.actions[i];

                    if (pAction.getTag() == tag)
                    {
                        return pAction;
                    }
                }
            }
            CC.CCLOG("cocos2d : getActionByTag: Action not found");
        }
        else
        {
            CC.CCLOG("cocos2d : getActionByTag: Target not found");
        }

        return null;
    },
    /** Returns the numbers of actions that are running in a certain target.
     * Composable actions are counted as 1 action. Example:
     * - If you are running 1 Sequence of 7 actions, it will return 1.
     * - If you are running 7 Sequences of 2 actions, it will return 7.
     */
    numberOfRunningActionsInTarget: function(pTarget)
    {
        var pElement = (pTarget in this._m_pTargets)? this._m_pTargets: null;
        if (pElement)
        {
            return (pElement.actions) ? pElement.actions.length : 0;
        }

        return 0;
    },
    /** Pauses the target: all running actions and newly added actions will be paused.
     */
    pauseTarget:function(pTarget)
    {
        if(pTarget in this._m_pTargets)
        {
            this._m_pTargets[pTarget] = true;
        }
    },
    /** Resumes the target. All queued actions will be resumed.
     */
    resumeTarget: function(pTarget)
    {
        if(pTarget in this._m_pTargets)
        {
            this._m_pTargets[pTarget] = false;
        }
    },
    /** purges the shared action manager. It releases the retained instance.
     * because it uses this, so it can not be static
     @since v0.99.0
     */
    purgeSharedManager: function()
    {
        CC.CCScheduler.sharedScheduler().unscheduleUpdateForTarget(this);
    },
    //protected
    _removeActionAtIndex: function(uIndex, pElement)
    {
        var pAction = pElement.actions.arr[uIndex] = new CC.CCAction();

        if (pAction == pElement.currentAction && (! pElement.currentActionSalvaged))
        {
            pElement.currentAction.retain();
            pElement.currentActionSalvaged = true;
        }

        pElement.actions[uIndex]= null;

        // update actionIndex in case we are in tick. looping over the actions
        if (pElement.actionIndex >= uIndex)
        {
            pElement.actionIndex--;
        }

        if (pElement.actions.num == 0)
        {
            if (this._m_pCurrentTarget == pElement)
            {
                this._m_bCurrentTargetSalvaged = true;
            }
            else
            {
                this._deleteHashElement(pElement);
            }
        }
    },
    _deleteHashElement: function(pElement)
    {
        /*TODO no need memory management in js?
        ccArrayFree(pElement->actions);
        HASH_DEL(m_pTargets, pElement);
        pElement->target->release();
        free(pElement);*/
    },
    _actionAllocWithHashElement: function(pElement)
    {
        // 4 actions per Node by default
        if (pElement.actions == null)
        {
            pElement.actions = [];
        }
    },
    _update: function(dt)
    {
        for (var elt = 0; elt < this._m_pTargets.length; elt++)
        {
            this._m_pCurrentTarget =this._m_pTargets[elt];
            this._m_bCurrentTargetSalvaged = false;

            if (! this._m_pCurrentTarget.paused)
            {
                // The 'actions' CCMutableArray may change while inside this loop.
                for (this._m_pCurrentTarget.actionIndex = 0; this._m_pCurrentTarget.actionIndex < this._m_pCurrentTarget.actions.length;
                     this._m_pCurrentTarget.actionIndex++)
                {
                    this._m_pCurrentTarget.currentAction = this._m_pCurrentTarget.actions[this._m_pCurrentTarget.actionIndex];
                    if (this._m_pCurrentTarget.currentAction == null)
                    {
                        continue;
                    }

                    this._m_pCurrentTarget.currentActionSalvaged = false;

                    this._m_pCurrentTarget.currentAction.step(dt);

                    if (this._m_pCurrentTarget.currentActionSalvaged)
                    {
                        // The currentAction told the node to remove it. To prevent the action from
                        // accidentally deallocating itself before finishing its step, we retained
                        // it. Now that step is done, it's safe to release it.
                        this._m_pCurrentTarget.currentAction = null;//release
                    } else
                    if (this._m_pCurrentTarget.currentAction.isDone())
                    {
                        this._m_pCurrentTarget.currentAction.stop();

                        var pAction = this._m_pCurrentTarget.currentAction;
                        // Make currentAction nil to prevent removeAction from salvaging it.
                        this._m_pCurrentTarget.currentAction = null;
                        this.removeAction(pAction);
                    }

                    this._m_pCurrentTarget.currentAction = null;
                }
            }

            // elt, at this moment, is still valid
            // so it is safe to ask this here (issue #490)

            // only delete currentTarget if no actions were scheduled during the cycle (issue #481)
            if (this._m_bCurrentTargetSalvaged && this._m_pCurrentTarget.actions.length == 0)
            {
                this._deleteHashElement(this._m_pCurrentTarget);
            }
        }

        // issue #635
        this._m_pCurrentTarget = null;
    }
});
/** purges the shared action manager. It releases the retained instance.
 * because it uses this, so it can not be static
 @since v0.99.0
 */
CC.CCActionManager.sharedManager = function()
{
    var pRet = CC.gSharedManager;
    if(!CC.gSharedManager)
    {
        CC.gSharedManager = new CC.CCActionManager();
        if(! CC.gSharedManager.init())
        {
            //delete CCActionManager if init error
            delete CC.gSharedManager;
        }
    }
    return pRet;
};

CC.gSharedManager = null;