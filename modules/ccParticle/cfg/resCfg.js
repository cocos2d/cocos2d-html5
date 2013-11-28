var cc = cc || {};
cc.resCfg = cc.resCfg || {};

/**
 * cc.resCfg[js.cocos2d_html5.a_js] = {ref : [], res : []}
 */

var resCfg = cc.resCfg;

//base for core module
resCfg["ccparticle"] = {
    ref : [
        js.ccparticle.CCParticleSystem_js,
        js.ccparticle.CCParticleBatchNode_js,
        js.ccparticle.CCParticleExamples_js
    ]
};
