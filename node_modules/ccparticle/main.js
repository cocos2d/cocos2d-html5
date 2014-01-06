var MODULE_NAMES = ["ccaccelerometer", "ccactions", "ccactions3d", "ccaudio", "ccbox2d", "ccchipmunk",
                    "cccliping", "cccompress", "cceditbox", "cceffects", "ccgui", "cckazmath", "cckeyboard",
                    "cclabel", "ccmenu", "ccmotionstreak", "ccparallax", "ccphysics", "ccpluginx", "ccprogress",
                    "ccrendertexture", "ccshaders", "ccshapenode", "cctextinput", "cctilemap", "cctouch",
                    "cctransitions", "cocos2d-html5", "cocosbuilder", "cocostudio"];
var ERRSTATUS = /4|5\d+/;

var preBtn = document.getElementById("preBtn");
var rePlayBtn = document.getElementById("rePlayBtn");
var nextBtn = document.getElementById("nextBtn");
var testTitle = document.getElementById("testTitle");
var testJsPath = document.getElementById("testJsPath");
var testConsole = document.getElementById("testConsole");
var custDiv = document.getElementById("custDiv");
var scriptContent = document.getElementById("scriptContent");
var menuUl = document.getElementById("menuUl");
var rootUl = document.getElementById("rootUl");
var menuContainer = document.getElementById("menuContainer");

var testCaseIndex = -1;
var isCurr = false;

function playTestCase(flag){
    var resCfg = cc.resCfg;
    var gms = cc.gameModules;
    isCurr = flag == 0;
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
    getFileContent(testJsPath.innerHTML, function(content){
        scriptContent.innerHTML = content;
        scriptContent.className = "prettyprint";
        prettyPrint();
    });
    cc.test(cfgName, isCurr ? cc.Loader : null);
    isCurr = false;
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
        isCurr = testCaseIndex == index;
        testCaseIndex = index;
        showTestCase(cfgName, cfg);
    });
    menuUl.appendChild(li);
}

function createHttpReq() {
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
    else return httpRequest;
}
function getFileContent(url, callback) {
    var httpRequest = createHttpReq();
    if(!httpRequest) return false;

    httpRequest.onreadystatechange = function() {
        if (httpRequest.readyState === 4) {
            if (ERRSTATUS.test(httpRequest.status)) callback(null);
            else callback(httpRequest.responseText);
        }
    };

    httpRequest.open('GET', url, true);
    httpRequest.send();
    return true;
}

function checkUrl(url) {
    var httpreq = createHttpReq();
    if(!httpreq) return false;
    httpreq.open('HEAD', url, false);
    httpreq.send();
    return ERRSTATUS.test(httpreq.status) ? false : true;
}

function switchToRoot() {
    rootUl.className = "active";
    menuUl.className = "";
    menuContainer.style.height = rootUl.clientHeight+20 + "px";
}
function switchToMenu() {
    rootUl.className = "";
    menuUl.className = "active";
    menuContainer.style.height = menuUl.clientHeight+20 + "px";
}

for(var i = 0, l = MODULE_NAMES.length; i < l; i++) {
    var name = MODULE_NAMES[i], url = "../"+name;
    var li = document.createElement("li");
    // Module exist
    if(checkUrl(url)) {
        var a = document.createElement("a");
        li.appendChild(a);
        a.href = url;
        a.innerHTML = name;
        rootUl.appendChild(li);
    }
    else {
        li.innerHTML = name;
        li.className = "inactive";
        rootUl.appendChild(li);
    }
}

var gms = cc.gameModules;
for(var i = 0, li = gms.length; i < li; i++){
    var cfgName = gms[i];
    createMenuItem(cfgName, cc.resCfg[cfgName], i);
}

switchToMenu();

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