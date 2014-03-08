/**
 * Put the `tools` in the root of your project, then run this script with nodejs.
 * @type {exports|*}
 */

var fs = require("fs");
var path = require("path");


module.exports = function(projectDir, projectJson, buildOpt){
    //获取到引擎所在目录，不填默认为frameworks/cocos2d-html5
    var engineDir = projectJson.engineDir || "frameworks/cocos2d-html5";
    //获取引擎真实目录
    var realEngineDir = path.join(projectDir, engineDir);
    //获取发布地址
    var realPublishDir = path.join(projectDir, "publish/html5");
    //tools真实路径
    var realToolsDir = path.dirname(__filename);
    //根据引擎所在目录，获取到引擎的模块配置
    var moduleConfig = require(path.join(realEngineDir, "moduleConfig.json"));
    //得到引擎的模块配置映射`module`
    var ccModuleMap = moduleConfig.module;
    //获取到该项目所需要的模块，不填默认为["core"]
    var modules = projectJson.modules || ["core"];
    //获取到引擎的渲染模式，不填默认为0
    var renderMode = projectJson.renderMode || 0;
    //入口js文件路径，默认为main.js
    var mainJs = projectJson.main || "main.js";


    //引擎js列表存储数组，需要放入CCBoot.js
    var ccJsList = [moduleConfig.bootFile];
    //用户js列表存储数组
    var userJsList = projectJson.jsList || [];

    //如果renderMode不为1（canvas模式），那么需要加入webgl依赖
    if(renderMode != 1 && modules.indexOf("base4webgl") < 0){
        modules.splice(0, 0, "base4webgl");
    }


    //cache for js and module that has added into jsList to be loaded.
    var _jsAddedCache = {};
    //该方法是为了递归根据模块配置，获取到相应的js列表
    function _getJsListOfModule(moduleMap, moduleName){
        var jsAddedCache = _jsAddedCache;
        if(jsAddedCache[moduleName]) return null;
        jsAddedCache[moduleName] = true;
        var jsList = [];
        var tempList = moduleMap[moduleName];
        if(!tempList) throw "can not find module [" + moduleName + "]";
        for(var i = 0, li = tempList.length; i < li; i++){
            var item = tempList[i];
            if(jsAddedCache[item]) continue;
            var extname = path.extname(item);
            if(!extname) {
                var arr = _getJsListOfModule(moduleMap, item);
                if(arr) jsList = jsList.concat(arr);
            }else if(extname.toLowerCase() == ".js") jsList.push(item);
            jsAddedCache[item] = true;
        }
        return jsList;
    };



    for(var i = 0, li = modules.length; i < li; i++){
        var item = modules[i];
        var arr = _getJsListOfModule(ccModuleMap, item, "");
        if(arr) ccJsList = ccJsList.concat(arr);
    }

    //根据js列表，获取到需要替换到模板中的字符串
    function getFileArrStr(jsList){
        var str = "";
        for(var i = 0, li = jsList.length; i < li; i++){
            str += '                <file name="' + jsList[i] + '"/>'
            if(i < li - 1) str += '\r\n';
        }
        return str;
    }

    //记得，main.js需要放在最后面，因为其一引入就会调用cc.game.run
    userJsList.push(mainJs);

    //获取到build.xml模板内容
    var buildContent = fs.readFileSync(path.join(realToolsDir, "template/build.xml")).toString();
    //替换项目路径
    buildContent = buildContent.replace(/%projectDir%/gi, projectDir);
    //替换引擎路径
    buildContent = buildContent.replace(/%engineDir%/gi, realEngineDir);
    //替换发布路径
    buildContent = buildContent.replace(/%publishDir%/gi, realPublishDir);
    //替换发布路径
    buildContent = buildContent.replace(/%outputFileName%/gi, buildOpt.outputFileName);
    //替换tools路径
    buildContent = buildContent.replace(/%toolsDir%/gi, realToolsDir);
    //替换tools路径
    buildContent = buildContent.replace(/%compilationLevel%/gi, buildOpt.compilationLevel);
    //替换sourceMap配置
    buildContent = buildContent.replace(/%sourceMapCfg%/gi, buildOpt.sourceMapOpened ? 'sourceMapOutputFile="' + path.join(realPublishDir, "sourcemap") + '" sourceMapFormat="V3"' : "");
    //替换引擎js列表
    buildContent = buildContent.replace(/%ccJsList%/gi, getFileArrStr(ccJsList));
    //替换用户js列表
    buildContent = buildContent.replace(/%userJsList%/gi, getFileArrStr(userJsList));
    //生成项目的build.xml
    fs.writeFileSync(path.join(realPublishDir, "build.xml"), buildContent);

};
