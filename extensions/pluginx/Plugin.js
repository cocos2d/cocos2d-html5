(function(w){

    if(cc === undefined){
        return;
    }

    var config = cc.game.config.plugin || {};
    var SDK = {
        user: null,
        share: null,
        social: null
    };

    var Plugin = {
        getSDK: function(){
            return SDK;
        },
        isSupportFunction: function(name){
            if(typeof this[name] === 'function'){
                return true;
            }else{
                return false;
            }
        },
        getUserPlugin: function(){
            return {
                callStringFuncWithParam: function(){
                    return this.callFuncWithParam.apply(this, arguments);
                },
                callFuncWithParam: function(name, opt){
                    if(config['common'] && config['common']['user'] && pluginList[config['common']['user']]){
                        var _plugin = pluginList[config['common']['user']];
                        if(typeof _plugin.user[name] == 'function'){
                            return _plugin.user[name](opt);
                        }else if(typeof _plugin[name] == 'function'){
                            return _plugin[name](opt);
                        }
                    }
                }
            };
        },
        getSharePlugin: function(){
            return {
                callStringFuncWithParam: function(){
                    return this.callFuncWithParam.apply(this, arguments);
                },
                callFuncWithParam: function(name, opt){
                    if(config['common'] && config['common']['share'] && pluginList[config['common']['share']]){
                        var _plugin = pluginList[config['common']['share']];
                        if(typeof _plugin.share[name] == 'function'){
                            return _plugin.share[name](opt);
                        }else if(typeof _plugin[name] == 'function'){
                            return _plugin[name](opt);
                        }
                    }
                }
            };
        }
    };

    var pluginList = {};

    Plugin.extend = function(name, method){
        var use = false;
        for(var p in config['common']){
            if(config['common'][p] == name){
                for(var o in method[p]){
                    Plugin[o] = method[p][o];
                }
                use = true;
                SDK[p] = name;
            }
        }
        if(use){
            method.init(config[name]);
        }
        pluginList[name] = method;
    };

    var pluginManager = {
        loadPlugin: function(pluginName){
            if(!pluginName){
                cc.log("PliginManager - PluginName error");
                return null;
            }
            var info = pluginName.match(/[A-Z][a-z]+/g);

            if(info.length !== 2){
                cc.log("PliginManager - PluginName error");
                return null;
            }

            var pluginObj = {
                setDebugMode: function(){},
                startSession: function(){},
                setCaptureUncaughtException: function(){},
                callFuncWithParam: function(funName){
                    if(!pluginList[pluginN]){
                        return;
                    }
                    var _fun = pluginList[pluginN]['common'][funName];
                    if(_fun){
                        var _arg = Array.prototype.slice.call(arguments, 1);
                        return _fun.apply(_fun, _arg);
                    }
                    return;
                },
                getPluginName: function(){
                    return pluginN;
                },
                getPluginVersion: function(){
                    return "1.0";
                },
                callStringFuncWithParam: function(){
                    return pluginObj.callFuncWithParam.apply(pluginObj, arguments);
                }
            };
            var moduleN = info[0].toLowerCase();
            var pluginN = info[1].toLowerCase();
            if(!pluginList[pluginN]){
                cc.log("Plugin does not exist");
                return pluginObj;
            }
            pluginList[pluginN].init();
            for(var p in pluginList[pluginN][moduleN]){
                pluginObj[p] = pluginList[pluginN][moduleN][p];
            }
            return pluginObj;

        }
    };

    w['plugin'] = {
        extend: Plugin.extend,
        agentManager: Plugin,
        AgentManager: {
            getInstance: function(){
                return plugin.agentManager;
            }
        },
        PluginManager: {
            getInstance: function(){
                return pluginManager;
            }
        }
    };


    plugin.PluginParam = function(type, value){
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

    plugin.PluginParam.ParamType = {
        TypeInt:1,
        TypeFloat:2,
        TypeBool:3,
        TypeString:4,
        TypeStringMap:5
    };

    plugin.PluginParam.AdsResultCode = {
        AdsReceived:0,
        FullScreenViewShown:1,
        FullScreenViewDismissed:2,
        PointsSpendSucceed:3,
        PointsSpendFailed:4,
        NetworkError:5,
        UnknownError:6
    };

    plugin.PluginParam.PayResultCode = {
        PaySuccess:0,
        PayFail:1,
        PayCancel:2,
        PayTimeOut:3
    };

    plugin.PluginParam.ShareResultCode = {
        ShareSuccess:0,
        ShareFail:1,
        ShareCancel:2,
        ShareTimeOut:3
    };

})(window);