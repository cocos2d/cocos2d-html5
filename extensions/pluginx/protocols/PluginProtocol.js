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

/**
 * @class PluginProtocol
 */
plugin.PluginProtocol = cc.Class.extend({
    _pluginName:null,

    setPluginName:function (name) {
       this._pluginName = name;
    },
    getPluginName:function () {
       return this._pluginName;
    },

    /**
     * plug-in info methods(name, version, SDK version)
     */
    getPluginVersion:function () {
        var verName;

        var data = plugin.PluginUtils.getPluginData(this);
        if (data) {
            var obj = data.obj;
            verName = obj.getPluginVersion();
        } else {
            throw "Plugin " + this.getPluginName() + " not right initilized";
        }

        return verName;
    },

    /**
     * @method getSDKVersion
     * @return A value converted from C/C++ "const char*"
     */
    getSDKVersion:function () {
        var verName;

        var data = plugin.PluginUtils.getPluginData(this);
        if (data) {
            var pOCObj = data.obj;
            verName = pOCObj.getSDKVersion();
        } else {
            throw ("Plugin "+this.getPluginName()+" not right initilized");
        }

        return verName;
    },

    /**
     * switch debug plug-in on/off
     * @param {Boolean} debug
     */
    setDebugMode:function (debug) {
        /*NSNumber* debug = [NSNumber numberWithBool:isDebugMode];
        plugin.PluginUtils.callOCFunctionWithName_oneParam(this, "setDebugMode", debug);*/

    },

    /**
     * methods for reflections
     */
    callFuncWithParam:function (funcName, param) {
    },

    callStringFuncWithParam:function (funcName, param) {
    },

    callIntFuncWithParam:function (funcName, param) {
    },

    callBoolFuncWithParam:function (funcName, param) {
    },

    callFloatFuncWithParam:function (funcName, param) {
    }

});