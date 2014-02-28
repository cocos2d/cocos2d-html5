/****************************************************************************
 Copyright (c) 2012+2013 cocos2d-x.org

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


plugin.PluginData = function (obj, className) {
    this.obj = obj;
    this.className = className;
};

plugin.PluginUtils = {
    _objMap:{},
    _pluginMap:{},
    initPlugin: function (tmpPlugin, obj, className) {
        var data = new plugin.PluginData(obj,className);
        this.setPluginData(tmpPlugin, data);
    },

    getPluginData: function (keyObj) {
        return this._objMap[keyObj._pluginName];
    },

    setPluginData: function (plugin, data) {
        this.erasePluginData(plugin);
        this._objMap[data.className] = data;
        this._pluginMap[data.className] = plugin;
    },

    erasePluginData: function (keyObj) {
       var data = this._objMap[keyObj];
       if(data){
           var key = data.className;

           var pluginIt = this._pluginMap[key];
           if (pluginIt)
           {
               delete this._pluginMap[key];
           }

           delete this._objMap[keyObj]
        }
    },

    getPluginPtr: function (obj) {
        return this._pluginMap[obj.className];
    },

    getObjFromParam: function (param) {

    },

    createDictFromMap: function (paramMap) {
        return paramMap;
    },

    /**
     @brief method don't have return value
     */
    callOCFunctionWithName_oneParam: function (tmpPlugin, funcName, param) {

    },
    callOCFunctionWithName: function (tmpPlugin, funcName) {
    },

    /**
     @brief method return int value
     */
    callOCIntFunctionWithName_oneParam: function (tmpPlugin, funcName, param) {
    },
    callOCIntFunctionWithName: function (tmpPlugin, funcName) {
    },

    /**
     @brief method return float value
     */
    callOCFloatFunctionWithName_oneParam: function (tmpPlugin, funcName, param) {
    },
    callOCFloatFunctionWithName: function (tmpPlugin, funcName) {
    },

    /**
     @brief method return bool value
     */
    callOCBoolFunctionWithName_oneParam: function (tmpPlugin, funcName, param) {
    },
    callOCBoolFunctionWithName: function (tmpPlugin, funcName) {
    },

    /**
     @brief method return string value
     */
    callOCStringFunctionWithName_oneParam: function (tmpPlugin, funcName, param) {
    },
    callOCStringFunctionWithName: function (tmpPlugin, funcName) {
    },

    callRetFunctionWithParam: function (tmpPlugin, funcName, param) {
    },
    callRetFunction: function (tmpPlugin, funcName) {
    }
};