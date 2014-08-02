(function(){

    if(cc === undefined){
        return;
    }

    var config = cc.game.config.plugin || {};

    //Native plugin usage
    var PluginManager = function(){};

    PluginManager.prototype = {
        constructor: PluginManager,

        /**
         * @returns {PluginManager}
         */
        getInstance: function(){
            return this;
        },

        /**
         * @param {String} pluginName
         */
        loadPlugin: function(pluginName){

        },

        /**
         *
         * @param pluginName
         */
        unloadPlugin: function(pluginName){

        }
    };

    var PluginAssembly = function(){};

    PluginAssembly.prototype = {
        constructor: PluginAssembly,

        /**
         * @param {Boolean} debug
         */
        setDebugMode: function(debug){},

        /**
         * @param {String} appKey
         */
        startSession: function(appKey){},

        /**
         * @param {Boolean} Capture
         */
        setCaptureUncaughtException: function(Capture){},

        /**
         * @param {String} funName
         * @param {All} Params
         */
        callFuncWithParam: function(funName){
            if(typeof this[funName] === 'function'){
                return this[funName].apply(this, Array.prototype.splice.call(arguments, 1));
            }else{
                cc.log("function is not define");
            }
        },

        /**
         * @param {String} funName
         * @param {All} Params
         */
        callStringFuncWithParam: function(funName){
            this.callFuncWithParam.apply(arguments);
        },

        /**
         * @returns {String}
         */
        getPluginName: function(){
            return this._name;
        },

        /**
         * @returns {String}
         */
        getPluginVersion: function(){
            return this._version;
        }
    };

    PluginAssembly.extend = function(name, porp){
        var p, prototype = {};
        for(p in PluginAssembly.prototype){
            prototype[p] = PluginAssembly.prototype[p];
        }
        for(p in porp){
            prototype[p] = porp[p];
        }
        var tmp = eval("(function " + name + "Plugin(){})");
        prototype.constructor = tmp;
        tmp.prototype = prototype;
        return tmp;
    };

    //Param
    var Param = function(type, value){
        var paramType = plugin.PluginParam.ParamType,tmpValue;
        switch(type){
            case paramType.TypeInt:
                tmpValue = parseInt(value);
                break;
            case paramType.TypeFloat:
                tmpValue = parseFloat(value);
                break;
            case paramType.TypeBool:
                tmpValue = Boolean(value);
                break;
            case paramType.TypeString:
                tmpValue = String(value);
                break;
            case paramType.TypeStringMap:
                tmpValue = value//JSON.stringify(value);
                break;
            default:
                tmpValue = value;
        }
        return tmpValue
    };

    Param.ParamType = {
        TypeInt:1,
        TypeFloat:2,
        TypeBool:3,
        TypeString:4,
        TypeStringMap:5
    };

    Param.AdsResultCode = {
        AdsReceived:0,
        FullScreenViewShown:1,
        FullScreenViewDismissed:2,
        PointsSpendSucceed:3,
        PointsSpendFailed:4,
        NetworkError:5,
        UnknownError:6
    };

    Param.PayResultCode = {
        PaySuccess:0,
        PayFail:1,
        PayCancel:2,
        PayTimeOut:3
    };

    Param.ShareResultCode = {
        ShareSuccess:0,
        ShareFail:1,
        ShareCancel:2,
        ShareTimeOut:3
    };

    var PluginList = {};

    var Plugin = {

        extend: function(name, extend){
            PluginList[name] = new (PluginAssembly.extend(name, extend));
            typeof PluginList[name].ctor === "function" && PluginList[name].ctor(config[name]);
        },

        PluginList: PluginList,

        PluginParam: Param,

        PluginManager: new PluginManager()

    };

    window.plugin = Plugin;

})();