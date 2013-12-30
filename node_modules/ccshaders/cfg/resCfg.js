var resCfg = cc.resCfg;
var jsRes = js.ccshaders;

resCfg["ccshaders"] = {
    ref : [
        jsRes.CCShaders_js,
        jsRes.CCShaderCache_js,
        jsRes.CCGLProgram_js,
        jsRes.CCGLStateCache_js
    ]//Base references for the project.
};