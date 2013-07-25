/**
 * @namespace
 */
var plugin = plugin || {};

plugin.Version = "0.2.0";

/**
 * plugin param
 * @type {Object}
 */
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
            tmpValue = JSON.stringify(value);
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
