var cc = cc || {};
cc.resCfg = cc.resCfg || {};

/**
 * cc.resCfg[js.cocos2d_html5.a_js] = {ref : [], res : []}
 */

var resCfg = cc.resCfg;

//base for core module
resCfg["ccanimation"] = {
    ref : [
        js.ccanimation.CCAnimation_js,
        js.ccanimation.CCAnimationCache_js
    ]
};
