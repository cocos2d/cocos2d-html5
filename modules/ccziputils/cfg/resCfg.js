var cc = cc || {};
cc.resCfg = cc.resCfg || {};

/**
 * cc.resCfg[js.cocos2d_html5.a_js] = {ref : [], res : []}
 */

var resCfg = cc.resCfg;

//base for core module
resCfg["ccziputils"] = {
    ref : [
        js.ccziputils.ZipUtils_js,
        js.ccziputils.base64_js,
        js.ccziputils.gzip_js,
        js.ccziputils.zlib_min_js
    ]
};
