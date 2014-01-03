var preBtn = document.getElementById("preBtn");
var rePlayBtn = document.getElementById("rePlayBtn");
var nextBtn = document.getElementById("nextBtn");
var testTitle = document.getElementById("testTitle");
var testJsPath = document.getElementById("testJsPath");
var testConsole = document.getElementById("testConsole");
var custDiv = document.getElementById("custDiv");
var scriptContent = document.getElementById("scriptContent");
var menuUl = document.getElementById("menuUl");

var testCaseIndex = -1;
var loadCache = {};

function playTestCase(flag){
    var resCfg = cc.resCfg;
    var gms = cc.gameModules;
    testCaseIndex += flag;
    testCaseIndex = testCaseIndex >= gms.length ? 0 : testCaseIndex;
    testCaseIndex = testCaseIndex < 0 ? gms.length - 1 : testCaseIndex;
    var cfgName = gms[testCaseIndex];
    showTestCase(cfgName, resCfg[cfgName]);
}

function showTestCase(cfgName, cfg){
    testTitle.innerHTML = cfg.title || "";
    testJsPath.innerHTML = cfgName.replace(/\[\%[\w\d\-_]*\%\]/, "");
    clearTextConsole();
    custDiv.innerHTML = "";
    getFileContent(testJsPath.innerHTML, function(content){
        scriptContent.innerHTML = content;
        scriptContent.className = "prettyprint";
        prettyPrint();
    });
    cc.test(cfgName, loadCache[cfgName] ? cc.Loader : null);
    loadCache[cfgName] = true;
}

preBtn.addEventListener("click", function(){
    playTestCase(-1);
});
rePlayBtn.addEventListener("click", function(){
    playTestCase(0);
});
nextBtn.addEventListener("click", function(){
    playTestCase(1);
});

function logTest(msg){
    if(testConsole.hidden) testConsole.hidden = null;
    msg = typeof msg == "string" ? msg : JSON.stringify(msg);
    testConsole.value = testConsole.value + msg + "\r\n";
};

function clearTextConsole(){
    if(!testConsole.hidden) testConsole.hidden = "hidden";
    testConsole.value = "TextConsole...\r\n";
};

function createBtnContainer(parent){
    var div = document.createElement("div");
    div.className = "test-btn-container";
    if(parent) parent.appendChild(div);
    return div;
};

function createBtn(container, text, func){
    var btn = document.createElement("button");
    btn.innerHTML = text;
    btn.addEventListener("click", func);
    btn.className = "btn btn_black";
    if(container) container.appendChild(btn);
    return btn;
};

function createMenuItem(cfgName, cfg, index){
    var li = document.createElement("li");
    var a = document.createElement("a");
    li.appendChild(a);
    a.href = "javascript:;";
    a.innerHTML = cfg.layer || cfg.sprite || cfg.scene || cfg.ccbi;
    a.addEventListener("click", function(){
        testCaseIndex = index;
        showTestCase(cfgName, cfg);
    });
    menuUl.appendChild(li);
}

function getFileContent(url, callback) {
    var httpRequest;
    if (window.XMLHttpRequest) { // Mozilla, Safari, ...
        httpRequest = new XMLHttpRequest();
    } else if (window.ActiveXObject) { // IE
        try {
            httpRequest = new ActiveXObject("Msxml2.XMLHTTP");
        }
        catch (e) {
            try {
                httpRequest = new ActiveXObject("Microsoft.XMLHTTP");
            }
            catch (e) {}
        }
    }
    if (!httpRequest) return false;

    httpRequest.onreadystatechange = function() {
        if (httpRequest.readyState === 4) {
            if (httpRequest.status === 200) callback(httpRequest.responseText);
            else callback(null);
        }
    };

    httpRequest.open('GET', url, true);
    httpRequest.send();
}

var gms = cc.gameModules;
for(var i = 0, li = gms.length; i < li; i++){
    var cfgName = gms[i];
    createMenuItem(cfgName, cc.resCfg[cfgName], i);
}

var cocos2dApp = cc.Application.extend({
    config : document["ccConfig"],
    ctor : function(){
        this._super();
        cc.COCOS2D_DEBUG = this.config["COCOS2D_DEBUG"];
        cc.initDebugSetting();
        cc.setup(this.config["tag"]);
        cc.AppController.shareAppController().didFinishLaunchingWithOptions();
    },

    applicationDidFinishLaunching : function(){
        var config = this.config;
        // initialize director
        var director = cc.Director.getInstance();

        // turn on display FPS
        director.setDisplayStats(config['showFPS']);

        // set FPS. the default value is 1.0/60 if you don't call this
        director.setAnimationInterval(1.0 / config['frameRate']);

        playTestCase(1);
        return true;
    }

});

new cocos2dApp();