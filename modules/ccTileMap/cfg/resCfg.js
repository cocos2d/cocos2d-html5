var cc = cc || {};
cc.resCfg = cc.resCfg || {};

/**
 * cc.resCfg[js.cocos2d_html5.a_js] = {ref : [], res : []}
 */

var resCfg = cc.resCfg;

//base for core module
resCfg["cctilemap"] = {
    ref : [
        js.cctilemap.CCTileMapAtlas_js,
        js.cctilemap.CCTMXTiledMap_js,
        js.cctilemap.CCTMXXMLParser_js,
        js.cctilemap.CCTMXObjectGroup_js,
        js.cctilemap.CCTMXLayer_js
    ]
};
