var fs = require("fs");
var path = require("path");
var core4cc = require("cocos-utils").core4cc;

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


for(var i = 0, li = list.length; i < li; i++){
    var targetPath = path.join(basePath, list[i], ".npmignore");
    core4cc.copyFiles(path.join(__dirname, "../template/base/.npmignore"), targetPath);
}