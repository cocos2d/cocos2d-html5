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

ccs.ActionManagerEx = ccs.Class.extend({

    initWithDictionary: function(jsonName, dic, root){
        var path = jsonName;
        var pos = path.lastIndexOf("/");
        var fileName = path.substr(pos+1,path.length());
        cc.log("filename == %s",fileName.toString());
        var actionList = [];
        var actionCount = dic["actionlist"];
        for (var i=0; i<actionCount; i++) {
            var action = new ActionObject();
            var actionDic = dic["actionlist"][i];
            action.initWithDictionary(actionDic,root);
            actionList.push(action);
        }
        this._actionDic[fileName] =  actionList;
    },
    getActionByName: function(jsonName, actionName){
        var iterator = this._actionDic[jsonName];
        if (!iterator)
        {
            return;
        }
        var actionList = iterator;
        for (var i = 0; i < actionList.length; i++)
        {
            var action = actionList[i];
            if (actionName == action.getName())
            {
                return action;
            }
        }
        return;
    },
    playActionByName: function(jsonName, actionName){
        var action = this.getActionByName(jsonName,actionName);
        if (action)
        {
            action.play();
        }
        return action;
    },
    releaseActions: function(){
        var iter;
        for (iter in this._actionDic)
        {
            delete this._actionDic[iter];
        }

        this._actionDic = [];
    }
});