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
 * Base class for ccs.ActionManager
 * @class
 * @extends ccs.Class
 */
ccs.ActionManager = ccs.Class.extend(/** @lends ccs.ActionManager# */{
    _actionDic: null,
    ctor: function () {
        this._actionDic = {};
    },

    /**
     * Init properties with json dictionary
     * @param {String} jsonName
     * @param {Object} dic
     * @param {Object} root
     */
    initWithDictionary: function (jsonName, dic, root) {
        var path = jsonName;
        var pos = path.lastIndexOf("/");
        var fileName = path.substr(pos + 1, path.length);
        var actionList = dic["actionlist"];
        var locActionList = [];
        for (var i = 0; i < actionList.length; i++) {
            var locAction = new ccs.ActionObject();
            var locActionDic = actionList[i];
            locAction.initWithDictionary(locActionDic, root);
            locActionList.push(locAction);
        }
        this._actionDic[fileName] = locActionList;
    },

    /**
     * Gets an actionObject with a name.
     * @param {String} jsonName
     * @param {String} actionName
     * @returns {ccs.ActionObject}
     */
    getActionByName: function (jsonName, actionName) {
        var actionList = this._actionDic[jsonName];
        if (!actionList) {
            return null;
        }
        for (var i = 0; i < actionList.length; i++) {
            var locAction = actionList[i];
            if (actionName == locAction.getName()) {
                return locAction;
            }
        }
        return null;
    },

    /**
     * Play an Action with a name.
     * @param {String} jsonName
     * @param {String} actionName
     * @param {cc.CallFunc} fun
     */
    playActionByName: function (jsonName, actionName, fun) {
        var action = this.getActionByName(jsonName, actionName);
        if (action) {
            action.play(fun);
        }
    },

    /**
     * Release all actions.
     */
    releaseActions: function () {
        this._actionDic = {};

    }
});
ccs.ActionManager._instance = null;

/**
 * returns a shared instance of the CCSActionManager
 * @function
 * @return {ccs.ActionManager}
 */
ccs.ActionManager.getInstance = function () {
    if (!this._instance) {
        this._instance = new ccs.ActionManager();
    }
    return this._instance;
};

/**
 * Purges ActionManager point.
 */
ccs.ActionManager.purge = function(){
    this._instance = null;
};