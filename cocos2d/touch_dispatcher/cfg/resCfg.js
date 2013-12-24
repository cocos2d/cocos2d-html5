var resCfg = cc.resCfg;
var jsRes = js.cctouch;

resCfg["cctouch"] = {
    ref : [
        jsRes.CCTouchDelegateProtocol_js,
        jsRes.CCTouchHandler_js,
        jsRes.CCTouchDispatcher_js,
        jsRes.CCMouseDispatcher_js
    ]//Base references for the project.
};