var exec = require("child_process").exec;
var path = require("path");
var fs = require('fs');

var basePath = path.join(__dirname, "../../../");
var list = [
    "cocos2d/accelerometer",
    "cocos2d/actions",
    "cocos2d/actions3d",
    "cocos2d/audio",
    "cocos2d/clipping_nodes",
    "cocos2d/compress",
    "cocos2d/core",
    "cocos2d/shape_nodes",
    "cocos2d/effects",
    "cocos2d/kazmath",
    "cocos2d/keyboard_dispatcher",
    "cocos2d/label_nodes",
    "cocos2d/menu_nodes",
    "cocos2d/motion_streak",
    "cocos2d/parallax_nodes",
    "cocos2d/particle_nodes",
    "cocos2d/physics_nodes",
    "cocos2d/progress_timer",
    "cocos2d/render_texture",
    "cocos2d/shaders",
    "cocos2d/text_input_node",
    "cocos2d/tileMap_nodes",
    "cocos2d/touch_dispatcher",
    "cocos2d/transitions_nodes",
    "extensions/CCBReader",
    "extensions/CCEditBox",
    "extensions/CocoStudio",
    "extensions/GUI",
    "extensions/PluginX",
    "external/box2d",
    "external/chipmunk"
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