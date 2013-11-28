var cc = cc || {};
cc.resCfg = cc.resCfg || {};

/**
 * cc.resCfg[js.cocos2d_html5.a_js] = {ref : [], res : []}
 */

var resCfg = cc.resCfg;

//base for core module
resCfg["ccbase64toimg"] = {
    ref : [
        js.ccbase64toimg.CCPNGReader_js,
        js.ccbase64toimg.CCTIFFReader_js
    ]
};
