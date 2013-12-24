var exec = require("child_process").exec;
var path = require("path");

var basePath = path.join(__dirname, "../../../");
var list = [
//    "ccaccelerometer@2.2.2",
    "ccactions@2.2.2",
//    "ccactions3d@2.2.2",
//    "ccaudio@2.2.2",
//    "cccliping@2.2.2",
//    "cccompress@2.2.2",
//    "cocos2d-html5@2.2.2",
//    "ccshapenode@2.2.2",
//    "cceffects@2.2.2",
//    "cckazmath@2.2.2",
//    "cckeyboard@2.2.2",
//    "cclabel@2.2.2",
//    "ccmenu@2.2.2",
//    "ccmotionstreak@2.2.2",
//    "ccparallax@2.2.2",
//    "ccparticle@2.2.2",
//    "ccphysics@2.2.2",
//    "ccprogress@2.2.2",
//    "ccrendertexture@2.2.2",
//    "ccshaders@2.2.2",
//    "cctextinput@2.2.2",
//    "cctilemap@2.2.2",
//    "cctouch@2.2.2",
//    "cctransitions@2.2.2",
//    "cocosbuilder@2.2.2",
//    "cceditbox@2.2.2",
//    "cocostudio@2.2.2",
//    "ccgui@2.2.2",
//    "ccpluginx@2.2.2",
//    "ccbox2d@2.2.2",
//    "ccchipmunk@2.2.2"
];
for(var i = 0, li = list.length; i < li; i++){
    var targetPath = path.join(basePath, list[i]);
    exec("npm unpublish " + targetPath , function(err, data, info){
        if(err) return console.error(err);
        console.log(data);
        console.log(info);
    });
}