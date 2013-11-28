var cc = cc || {};
cc.resCfg = cc.resCfg || {};

/**
 * cc.resCfg[js.cocos2d_html5.a_js] = {ref : [], res : []}
 */

var resCfg = cc.resCfg;

//base for core module
resCfg["ccinput"] = {
    ref : [
        js.ccinput.CCAccelerometer_js,
        js.ccinput.CCMouseDispatcher_js,
        js.ccinput.CCKeyboardDelegate_js,
        js.ccinput.CCKeyboardDispatcher_js,
        js.ccinput.CCIMEDispatcher_js,
        js.ccinput.CCTextFieldTTF_js
    ]
};
