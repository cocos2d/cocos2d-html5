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

function publish(list, index, cb){
    if(index >= list.length) return cb(null);

    var targetPath = path.join(basePath, list[index]);

    var pkgJsonPath = path.join(targetPath, "package.json");
    var pkgJson = require(pkgJsonPath);
    var version = pkgJson.version;
    var arr = version.split(".");
    var l = arr.length;
    arr[l - 1] = parseInt(arr[l - 1]) + 1;
    var content = fs.readFileSync(pkgJsonPath).toString();
    content = content.replace(/"version"[\s]*:[\s]*"[\d\.\-]+"/, '"version":"' + arr.join(".") + '"');
    fs.writeFileSync(pkgJsonPath, content);

    exec("npm publish " + path.relative(process.cwd(), targetPath), function(err, stdout, stderr){
        console.log(stderr);
        console.log(stdout);
        if(err)console.error(err);
        console.log("-----------------------" + list[index] + " ends------------------------");
        publish(list, index+1, cb);
    });
}

publish(list, 0, function(err){});