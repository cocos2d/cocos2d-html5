var cc = cc || {};
cc.resCfg = cc.resCfg || {};

/**
 * cc.resCfg[js.cocos2d_html5.a_js] = {ref : [], res : []}
 */

var resCfg = cc.resCfg;

//base for core module
resCfg["ccpluginx"] = {
    ref : [
        js.ccpluginx.Config_js,
        js.ccpluginx.PluginUtils_js,
        js.ccpluginx.PluginProtocol_js,
        js.ccpluginx.ProtocolSocial_js,
        js.ccpluginx.PluginFactory_js,
        js.ccpluginx.PluginManager_js,
        js.ccpluginx.SocialWeibo_js,
        js.ccpluginx.SocialQQWeibo_js,
        js.ccpluginx.SocialQzone_js,
        js.ccpluginx.SocialTwitter_js,
        js.ccpluginx.SocialFacebook_js
    ]
};
