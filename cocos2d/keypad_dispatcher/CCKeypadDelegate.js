/****************************************************************************
 Copyright (c) 2010-2012 cocos2d-x.org
 Copyright (c) 2008-2010 Ricardo Quesada
 Copyright (c) 2011      Zynga Inc.

 http://www.cocos2d-x.org

 Created by JetBrains WebStorm.
 User: wuhao
 Date: 12-3-16

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
cc.KeypadDelegate = cc.Class.extend({
    keyDown:function(){},
    keyUp:function(){}
});


cc.KeypadHandler = cc.Class.extend({
    getDelegate: function(){return this._m_pDelegate;},
    setDelegate: function(pdelegate)
    {
        this._m_pDelegate = pdelegate;
    },
    initWithDelegate: function(pDelegate)
    {
        cc.Assert(pDelegate != null, "It's a wrong delegate!");

        this._m_pDelegate = pDelegate;

        return true;
    },
    _m_pDelegate: null
});
cc.KeypadHandler.handlerWithDelegate= function(pDelegate)
{
    var pHandler = new cc.KeypadHandler;
    pHandler.initWithDelegate(pDelegate);
    return pHandler;
};