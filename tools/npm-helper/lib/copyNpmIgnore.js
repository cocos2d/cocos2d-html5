var fs = require("fs");
var path = require("path");
var core4cc = require("cocos-utils").core4cc;

var basePath = path.join(__dirname, "../../../node_modules");
var list = [
    "ccaccelerometer",
    "ccactions",
    "ccactions3d",
    "ccaudio",
    "cccliping",
    "cccompress",
    "cocos2d-html5",
    "ccshapenode",
    "cceffects",
    "cckazmath",
    "cckeyboard",
    "cclabel",
    "ccmenu",
    "ccmotionstreak",
    "ccparallax",
    "ccparticle",
    "ccphysics",
    "ccprogress",
    "ccrendertexture",
    "ccshaders",
    "cctextinput",
    "cctilemap",
    "cctouch",
    "cctransitions",
    "cocosbuilder",
    "cceditbox",
    "cocostudio",
    "ccgui",
    "ccpluginx",
    "ccbox2d",
    "ccchipmunk"
];


for(var i = 0, li = list.length; i < li; i++){
    var targetPath = path.join(basePath, list[i], ".npmignore");
    core4cc.copyFiles(path.join(__dirname, "../template/base/.npmignore"), targetPath);
}