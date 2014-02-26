/**
 * Put the `tools` in the root of your project, then run this script with nodejs.
 * @type {exports|*}
 */

var fs = require("fs");
var path = require("path");

var projectJson = require("../project.json");
var engineDir = projectJson.engineDir;
var moduleConfig = require(path.join("../", engineDir, "moduleConfig.json"));
var ccModuleMap = moduleConfig.module;
var modules = projectJson.modules;

var ccJsList = ccModuleMap.core;
var userJsList = projectJson.jsList;

for(var i = 0, li = modules.length; i < li; i++){
    var tempJsList = ccModuleMap[modules[i]];
    if(tempJsList) ccJsList = ccJsList.concat(tempJsList);
}

var ccJsListStr = "";
for(var i = 0, li = ccJsList.length; i < li; i++){
    var jsPath = ccJsList[i];
    ccJsListStr += '                <file name="' + jsPath + '"/>'
    if(i < li - 1) ccJsListStr += '\r\n';
}

if(fs.existsSync(path.join(__dirname, "../main.js"))) userJsList.push("main.js");
else if(fs.existsSync(path.join(__dirname, "../src/main.js"))) userJsList.push("src/main.js");
var userJsListStr = "";
for(var i = 0, li = userJsList.length; i < li; i++){
    var jsPath = userJsList[i];
    userJsListStr += '              <file name="' + jsPath + '"/>'
    if(i < li - 1) userJsListStr += '\r\n';
}

var buildContent = fs.readFileSync(path.join(__dirname, "template/build.xml")).toString();
buildContent = buildContent.replace(/%engineDir%/g, engineDir);
buildContent = buildContent.replace(/%ccJsList%/g, ccJsListStr);
buildContent = buildContent.replace(/%userJsList%/g, userJsListStr);
fs.writeFileSync(path.join(__dirname, "../build.xml"), buildContent);
