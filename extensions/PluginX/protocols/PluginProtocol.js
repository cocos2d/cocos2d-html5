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