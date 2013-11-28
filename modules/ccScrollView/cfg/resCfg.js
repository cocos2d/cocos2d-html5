var cc = cc || {};
cc.resCfg = cc.resCfg || {};

/**
 * cc.resCfg[js.cocos2d_html5.a_js] = {ref : [], res : []}
 */

var resCfg = cc.resCfg;

//base for core module
resCfg["ccscrollview"] = {
    ref : [
        js.ccscrollview.CCScrollView_js,
        js.ccscrollview.CCSorting_js,
        js.ccscrollview.CCTableView_js
    ]
};
