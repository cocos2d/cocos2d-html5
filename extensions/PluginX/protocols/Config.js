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
