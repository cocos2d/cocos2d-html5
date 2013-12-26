var __PUBLISH = true;
var cc = cc || {};
var js = {};
/**
 * Load game module.
 * @param moduleName
 * @param cb
 * @returns {*}
 */
cc.loadGameModule = function(moduleName, cb){
    var res4GM = cc.res4GameModules[moduleName];
    if(!res4GM) return cb([]);
    var arr = [];
    for(var i = 0; i < res4GM.length; ++i){
        arr.push({src : res4GM[i]})
    }
    cb(arr);
}