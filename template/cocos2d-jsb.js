require("jsb.js");

document1 = {
    COCOS2D_DEBUG:2, //0 to turn debug off, 1 for basic debug, and 2 for full debug
    box2d:false,
    chipmunk:false,
    showFPS:true,
    loadExtension:false,
    frameRate:60,
    tag:'gameCanvas', //the dom element to run cocos2d on
    engineDir:'../cocos2d/',
    //SingleEngineFile:'',
    appFiles:[
        'src/resource.js',
        'src/myApp.js',//add your own files in order here
        'main.js'//add your own files in order here
    ]
};

cc.dumpConfig();

for( var i=0; i < document1.appFiles.length; i++) {
    require(document1.appFiles[i] );
}