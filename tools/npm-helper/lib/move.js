var path = require("path");
var fs = require("fs");
var core4cc = require("cocos-utils").core4cc;
var fileFmt = require("cocos-utils").fileFmt;
var exec = require("child_process").exec;
var msgCode = require("cocos-utils").msgCode;


/**
 * Desc: Run plugin.
 * @param srcDir
 * @param targetDir
 * @param list
 */
function move(srcDir, targetDir, list){
    var pubFmt = fileFmt.pubFmt;
    for(var i = 0, li = list.length; i < li; i++){
        var itemi = list[i];
        var dir = itemi.dir;
        var sPath = path.join(srcDir, dir);
        var tPath = path.join(targetDir, dir);
        var libPath = path.join(tPath, "lib");
        core4cc.mkdirSyncRecursive(libPath);
        core4cc.copyFiles(sPath, libPath);

        var cfgPath = path.join(tPath, "cfg");
        core4cc.mkdirSyncRecursive(cfgPath);

        var packagePath = path.join(tPath, "pacakge.json");

        if(!fs.existsSync(packagePath)){
            var handler = new fileFmt.Handler({name : itemi.name, version : itemi.version}, {
                "package.json" : pubFmt,
                "resCfg.js" : pubFmt
            });
            core4cc.copyFiles(path.join(__dirname, "../template/base"), tPath, handler);
        }else{
            var content = fs.readFileSync(packagePath).toString();
            content = content.replace(/"version"[\s]*:[\s]*"[\d\.\-]+"/, '"version" : "' + itemi.version + '"');
        }
        exec("cocos genJsRes " + tPath, function(err, data, info){
            console.log(data);
            if(err) return console.error(err);
            core4cc.log(msgCode.SUCCESS_PATH, {path : sPath + "--->" + tPath})
        });
    }
};


var srcDir = "/Users/small/WebstormProjects/cocos2d-html5-test";
var targetDir = path.join(__dirname, "../../../");
var version = "2.2.2";
var list = [
    {name : "ccaccelerometer",  version : version, dir : "cocos2d/accelerometer"},
    {name : "ccactions",        version : version, dir : "cocos2d/actions"},
    {name : "ccactions3d",      version : version, dir : "cocos2d/actions3d"},
    {name : "ccaudio",          version : version, dir : "cocos2d/audio"},
    {name : "cccliping",        version : version, dir : "cocos2d/clipping_nodes"},
    {name : "cccompress",       version : version, dir : "cocos2d/compress"},
    {name : "cocos2d-html5",    version : version, dir : "cocos2d/core"},
    {name : "ccdraw",           version : version, dir : "cocos2d/draw_nodes"},
    {name : "cceffects",        version : version, dir : "cocos2d/effects"},
    {name : "cckazmath",        version : version, dir : "cocos2d/kazmath"},
    {name : "cckeyboard",       version : version, dir : "cocos2d/keyboard_dispatcher"},
    {name : "cclabel",          version : version, dir : "cocos2d/label_nodes"},
    {name : "ccmenu",           version : version, dir : "cocos2d/menu_nodes"},
    {name : "ccmotionstreak",   version : version, dir : "cocos2d/motion_streak"},
    {name : "ccparallax",       version : version, dir : "cocos2d/parallax_nodes"},
    {name : "ccparticle",       version : version, dir : "cocos2d/particle_nodes"},
    {name : "ccphysics",        version : version, dir : "cocos2d/physics_nodes"},
    {name : "ccprogress",       version : version, dir : "cocos2d/progress_timer"},
    {name : "ccrendertexture",  version : version, dir : "cocos2d/render_texture"},
    {name : "ccshaders",        version : version, dir : "cocos2d/shaders"},
    {name : "cctextinput",      version : version, dir : "cocos2d/text_input_node"},
    {name : "cctilemap",        version : version, dir : "cocos2d/tileMap_nodes"},
    {name : "cctouch",          version : version, dir : "cocos2d/touch_dispatcher"},
    {name : "cctransitions",    version : version, dir : "cocos2d/transitions_nodes"},
    {name : "cocosbuilder",     version : version, dir : "extensions/CCBReader"},
    {name : "cceditbox",        version : version, dir : "extensions/CCEditBox"},
    {name : "cocostudio",       version : version, dir : "extensions/CocoStudio"},
    {name : "ccgui",            version : version, dir : "extensions/GUI"},
    {name : "ccpluginx",        version : version, dir : "extensions/PluginX"},
    {name : "ccbox2d",          version : version, dir : "external/box2d"},
    {name : "ccchipmunk",       version : version, dir : "external/chipmunk"}
];

move(srcDir, targetDir, list);