var cc = cc || {};
cc.resCfg = cc.resCfg || {};

/**
 * cc.resCfg[js.cocos2d_html5.a_js] = {ref : [], res : []}
 */

var resCfg = cc.resCfg;

//base for core module
resCfg["cctransition"] = {
    ref : [
        js.cctransition.CCTransition_js,
        js.cctransition.CCTransitionProgress_js,
        js.cctransition.CCTransitionPageTurn_js
    ]
};
