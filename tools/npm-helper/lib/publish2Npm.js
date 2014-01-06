var exec = require("child_process").exec;
var path = require("path");
var fs = require('fs');

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

var baseVersion = "2.2.2";
var isChgBaseVersion = false;
var baseContent = {};

for(var i = 0, li = list.length; i < li; i++){
    var targetPath = path.join(basePath, list[i]);
    var pkgJsonPath = path.join(targetPath, "package.json");
    var pkgJson = require(pkgJsonPath);
    var version = pkgJson.version;
    if(isChgBaseVersion){
        version = baseVersion;
    }else{
        var arr = version.split("-");
        var l = arr.length;
        if(l != 1 && l != 2) {
            console.log(list[i] + ": version error!");
            continue;
        }else if(l == 1 && baseVersion == arr[0]) {
            version = baseVersion + "-1";
        }else{
            version = arr[0] + "-" + (parseInt(arr[1]) + 1);
        }
    }
    var content = fs.readFileSync(pkgJsonPath).toString();
    baseContent[pkgJsonPath] = content;
    content = content.replace(/"version"[\s]*:[\s]*"[\d\.\-]+"/, '"version":"' + version + '"');
    fs.writeFileSync(pkgJsonPath, content);

    exec("npm publish " + path.relative(process.cwd(), targetPath), function(err, stdout, stderr){
        console.log(stderr);
        console.log(stdout);
        if(err){
            fs.writeFileSync(this.pkgJsonPath, baseContent[this.pkgJsonPath]);//出错了，还原package.json
            console.error(err);
        }
        console.log("-----------------------" + this.module + " ends------------------------");
    }.bind({module : list[i], pkgJsonPath : pkgJsonPath}));
}