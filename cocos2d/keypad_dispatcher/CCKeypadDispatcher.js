/****************************************************************************
 Copyright (c) 2010-2012 cocos2d-x.org
 Copyright (c) 2008-2010 Ricardo Quesada
 Copyright (c) 2011      Zynga Inc.

 http://www.cocos2d-x.org

 Created by JetBrains WebStorm.
 User: wuhao
 Date: 12-3-5

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

CC.kTypeBackClicked = 1;
CC.kTypeMenuClicked = 2;

CC.s_KeypadDispatcher = null;
/**
 @class CCKeypadDispatcher
 @brief Dispatch the keypad message from the phone
 */
CC.CCKeypadDispatcher = CC.Class.extend({
    /**
     @brief add delegate to concern keypad msg
     */
    addDelegate: function(pDelegate)
    {
        if (!pDelegate)
        {
            return;
        }

        if (! this._m_bLocked)
        {
            this.forceAddDelegate(pDelegate);
        }
        else
        {
            this._m_pHandlersToAdd.push(pDelegate);
            this._m_bToAdd = true;
        }
    },
    /**
     @brief remove the delegate from the delegates who concern keypad msg
     */
    removeDelegate: function(pDelegate)
    {
        if (!pDelegate)
        {
            return;
        }
        if (! this._m_bLocked)
        {
            this.forceRemoveDelegate(pDelegate);
        }
        else
        {
            this._m_pHandlersToRemove.push(pDelegate);
            this._m_bToRemove = true;
        }
    },
    /**
     @brief force add the delegate
     */
    forceAddDelegate: function(pDelegate)
    {
        var pHandler = CC.CCKeypadHandler.handlerWithDelegate(pDelegate);

        if (pHandler)
        {
            this._m_pDelegates.addObject(pHandler);
        }
    },
    /**
     @brief force remove the delegate
     */
    forceRemoveDelegate: function(pDelegate)
    {
        var pHandler;
        var iter;

        for (iter = this._m_pDelegates.begin(); iter != this._m_pDelegates.end(); ++iter)
        {
            pHandler = iter;
            if (pHandler && pHandler.getDelegate() == pDelegate)
            {
                this._m_pDelegates.removeObject(pHandler);
                break;
            }
        }
    },
    /**
     @brief dispatch the key pad msg
     */
    dispatchKeypadMSG: function(nMsgType)
    {
        var pHandler;
        var pDelegate;
        var iter;

        this._m_bLocked = true;

        if (this._m_pDelegates.count() > 0)
        {
            for (iter = this._m_pDelegates.begin(); iter != this_m_pDelegates.end(); ++iter)
            {
                CC.CC_BREAK_IF(!(iter));

                pHandler = iter;
                pDelegate = pHandler.getDelegate();

                switch (nMsgType)
                {
                    case kTypeBackClicked:
                        pDelegate.keyBackClicked();
                        break;
                    case kTypeMenuClicked:
                        pDelegate.keyMenuClicked();
                        break;
                    default:
                        break;
                }
            }
        }

        this._m_bLocked = false;
        if (this._m_bToRemove)
        {
            this._m_bToRemove = false;
            for (var i = 0; i < this._m_pHandlersToRemove.num; ++i)
            {
                this.forceRemoveDelegate(this._m_pHandlersToRemove.arr[i]);
            }
            delete this._m_pHandlersToRemove;
            this._m_pHandlersToRemove = [];
        }

        if (this._m_bToAdd)
        {
            this._m_bToAdd = false;
            for (var i = 0; i < this._m_pHandlersToAdd.num; ++i)
            {
                this.forceAddDelegate(this._m_pHandlersToAdd.arr[i]);
            }
            delete this._m_pHandlersToAdd;
            this._m_pHandlersToAdd = [];
        }

        return true;
    },

    //private
    _KeypadDelegateArray: [],
    _m_pDelegates: [],
    _m_bLocked: false,
    _m_bToAdd: false,
    _m_bToRemove: false,
    _m_pHandlersToAdd: [],
    _m_pHandlersToRemove: []
});
/**
 @brief Returns the shared CCKeypadDispatcher object for the system.
 */
CC.CCKeypadDispatcher.sharedDispatcher = function()
{
    if(! CC.s_KeypadDispatcher)
    {
        CC.s_KeypadDispatcher = new CCKeypadDispatcher();
    }
    return CC.s_KeypadDispatcher;
};
/**
 @brief Release the shared CCKeypadDispatcher object from the system.
 */
CC.CCKeypadDispatcher.purgeSharedDispatcher = function()
{
    if (CC.s_KeypadDispatcher)
    {
        delete CC.s_KeypadDispatcher;
        CC.s_KeypadDispatcher = null;
    }
};