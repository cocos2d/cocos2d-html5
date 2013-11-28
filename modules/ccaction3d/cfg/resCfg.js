var cc = cc || {};
cc.resCfg = cc.resCfg || {};

/**
 * cc.resCfg[js.cocos2d_html5.a_js] = {ref : [], res : []}
 */

var resCfg = cc.resCfg;

//base for core module
resCfg["ccaction3d"] = {
    ref : [
        js.ccaction3d.CCActionGrid_js,
        js.ccaction3d.CCActionGrid3D_js,
        js.ccaction3d.CCActionTiledGrid_js,
        js.ccaction3d.CCActionPageTurn3D_js
    ]
};
