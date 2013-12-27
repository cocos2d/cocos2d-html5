var resCfg = cc.resCfg;
var jsRes = js.cccompress;

resCfg["cccompress"] = {
    ref : [
        jsRes.ZipUtils_js,
        jsRes.base64_js,
        jsRes.gzip_js,
        jsRes.zlib_min_js
    ]//Base references for the project.
};