//@defineStart
//This is a special area that will be remove while publishing.
//It is used for the -d option of uglifyjs.
var __PUBLISH = false;
//@defineEnd

var cc = cc || {};
var js = {};
if(__PUBLISH){//for publish
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
}else{//This content will not exist after publish.
    cc.CFG_DIR = "cfg/";//Cfg dir based on each module base dir.
    cc.COCOS_JSON = "package.json";//Name of cocos cfg file.
    cc._moduleCache = {};//The cache to judge whether the module has been loaded.
    cc._projDir = "../../";//Default value of the dir of current project.
    cc._projName = "";//The name of current project.
    cc._modulesDir = "";//The dir of modules, where puts all modules.
    cc._cfgCache = {};//The cache to judge whether the cfg of resCfg has been loaded.
    cc._gameModules = [];//Modules for the current game project, used for loading resources for each module.
    cc._jsLoadCount = 0;
    cc._jsCount = 0;
    /**
     * Desc: Get data from server by http.
     * @returns {*}
     * @private
     */
    cc._getXMLHttpRequest = function () {
        if (window.XMLHttpRequest) {
            return new window.XMLHttpRequest();
        } else {
            return new ActiveXObject("MSXML2.XMLHTTP");
        }
    };
    /**
     * Desc: Load json.
     * @param fileUrl
     * @param cb
     */
    cc.loadJson = function (fileUrl, cb) {
        var selfPointer = this;
        var xhr = cc._getXMLHttpRequest();
        xhr.open("GET", fileUrl, true);
        if (/msie/i.test(navigator.userAgent) && !/opera/i.test(navigator.userAgent)) {
            // IE-specific logic here
            xhr.setRequestHeader("Accept-Charset", "utf-8");
        } else {
            if (xhr.overrideMimeType)
                xhr.overrideMimeType("text\/plain; charset=utf-8");
        }
        xhr.onreadystatechange = function (event) {
            if (xhr.readyState == 4) {
                if (xhr.status == 200) {
                    cb(null, JSON.parse(xhr.responseText));
                } else {
                    cb(null, null);
                }
            }
        };
        xhr.send(null);
    };
    /**
     * Load js files.
     * @param baseDir   The pre path for jsList.
     * @param jsList    List of js path.
     * @param cb        Callback function
     *
     *      If the arguments.length == 2, then the baseDir turns to be "".
     * @returns {*}
     */
    cc.loadJs = function(baseDir, jsList, cb){
        if(arguments.length < 1) return;
        if(arguments.length == 1){
            jsList = baseDir instanceof Array ? baseDir : [baseDir];
            baseDir = "";
        }else if(arguments.length == 2){
            if(typeof jsList == "function"){
                cb = jsList;
                jsList = baseDir instanceof Array ? baseDir : [baseDir];
                baseDir = "";
            }else{
                jsList = jsList instanceof Array ? jsList : [jsList];
            }
        }else{
            jsList = jsList instanceof Array ? jsList : [jsList];
        }
        return cc._loadJsList(baseDir, jsList, 0, cb);
    };
    /**
     * Add next after loaded.
     * @param baseDir
     * @param jsList
     * @param index
     * @param cb
     * @returns {*}
     * @private
     */
    cc._loadJsList4Dependency = function(baseDir, jsList, index, cb){
        if(index >= jsList.length) {
            if(cb) cb();
            return;
        }
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = baseDir + jsList[index];
        script.addEventListener('load',function(){
            cc._loadJsList4Dependency(baseDir, jsList, index+1, cb);
            this.removeEventListener('load', arguments.callee, false);
        },false);
        document.body.appendChild(script);
    };
    /**
     * Desc: A private function to load js list.
     * @param baseDir   The pre path for jsList.
     * @param jsList    Js list.
     * @param index     Index of current js to be loaded.
     * @param cb        Callback function
     * @private
     */
    cc._loadJsList = function(baseDir, jsList, index, cb){
        baseDir = baseDir || "";
        if(index >= jsList.length) {
            if(cb) cb();
            return;
        }
        var d = document;

        if (navigator.userAgent.indexOf("Trident/5") > -1) {
            cc._loadJsList4Dependency(baseDir, jsList, index, cb);
        }
        else {
            /* var updateLoading = function(p){
             if(p>=1) {
             loadJsImg.parentNode.removeChild(loadJsImg);
             }
             };*/
            jsList.forEach(function (f, i) {
                var s = d.createElement('script');
                s.async = false;
                s.src = baseDir + f;
                s.addEventListener('load',function(){
//                    cc._jsLoadCount++;
//                    updateLoading(loaded / que.length);
                    this.removeEventListener('load', arguments.callee, false);
                },false);
                d.body.appendChild(s);
            });
            cb();
        }
    };

    /**
     * Desc: Return array of dependencies.
     * @param objDependencies   Info of dependencies.
     * @returns {Array}
     * @private
     */
    cc._getDependencies = function(objDependencies){
        var dependencies = [];
        for(var key in objDependencies){
            dependencies.push(key);
        };
        return dependencies;
    }
    /**
     * Desc: load dependencies
     * @param dependencies  Dependencies of module named moduleName.
     * @param index         Index of current dependency.
     * @param moduleName    Name of current module.
     * @param cb            Callback.
     * @private
     */
    cc._loadDependencies = function(dependencies, index, moduleName, cb){
        if(cc._moduleCache[moduleName]){
            if(cb) cb();
            return;
        }
        if(index >= dependencies.length || !dependencies[index]) {
            var cfgDir = moduleName == cc._projName ? cc._projDir + cc.CFG_DIR  : cc._modulesDir + moduleName + "/" + cc.CFG_DIR ;
            cc._loadJsList4Dependency(cfgDir, ["jsRes.js", "resCfg.js"], 0, function(){
                //load base of self
                cc.loadRes(moduleName, function(result){
                    cc.loadJs(result.js, cb);
                });
            });
            return;
        }
        var dependency = dependencies[index];
        cc.loadJson(cc._modulesDir + dependency + "/" + cc.COCOS_JSON, function(err, data){
            if(err){
                console.error(err);
                console.error("Please install the module [" + dependency + "] first!");
            }else{
                cc._loadDependencies(cc._getDependencies((data.dependencies)), 0, dependency, function(){
                    cc._loadDependencies(dependencies, index+1, moduleName, cb);
                });
            }
        });
    };

    /**
     * Desc: Load current resources.
     * @param cfgName        Cfg name for resCfg.
     * @param ref       References.
     * @param index     Index of current reference.
     * @param cb        Callback.
     * @param result    The cache to store res.
     * @returns {*}
     * @private
     */
    cc._loadCurrRes = function(cfgName, ref, index, cb, result){
        if(cc._cfgCache[cfgName]) return cc.loadRes(ref, index + 1, cb, result);
        cc._cfgCache[cfgName] = true;
        var cfg = resCfg[cfgName];
        if(cfg && cfg.res && cfg.res.length > 0) result.res = result.res.concat(cfg.res);
        if(typeof  cfgName == "string" && cfgName.length > 3
            && cfgName.toLowerCase().indexOf(".js") == cfgName.length - 3){//a js path
            var results = cfgName.match(/\[\%[\w_\d\-]+\%\]/);
            if(results && results.length > 0){
                var moduleName = results[0].substring(2, results[0].length - 2);
                var dir = moduleName == cc._projName ? cc._projDir : cc._modulesDir + moduleName + "/";
                cfgName = cfgName.replace(/\[\%[\w_\d\-]+\%\]/, dir);
            }
            result.js.push(cfgName);
            if(index < ref.length - 1) cc.loadRes(ref, index + 1, cb, result);
            else cb(result);
        }else if(index < ref.length - 1)cc.loadRes(ref, index + 1, cb, result);
        else cb(result);
    };
    /**
     * Desc: Load res. The args for callback would be: {js : [...], res : [...]}。
     * @param ref       References.
     * @param index     Index of current reference.
     * @param cb        Callback.
     * @param result    The cache to store res.
     * @returns {*}
     */
    cc.loadRes = function(ref, index, cb, result){
        if(arguments.length == 2){
            cb = index;
            index = 0;
            ref = [ref];
        }
        result = result || {js : [], res : []};
        var cfgName = ref[index];
        if(!cfgName) return cb(result);
        var cfg = typeof cfgName == "string" ? cc.resCfg[cfgName] : cfgName;

        if(cfg && cfg.ref){//has references
            cc.loadRes(cfg.ref, 0, function(result){
                //load curr cfg
                cc._loadCurrRes(cfgName, ref, index, cb, result);
            }, result);
        }else{
            cc._loadCurrRes(cfgName, ref, index, cb, result);
        }
    };

    /**
     * Load game module.
     * @param moduleName
     * @param cb
     */
    cc.loadGameModule = function(moduleName, cb){
        cc.loadRes(moduleName, function(result){
            cc.loadJs(result.js, function(){
                var resArr = result.res;
                var arr = [];
                for(var i = 0; i < resArr.length; ++i){
                    arr.push({src : resArr[i]})
                }
                cb(arr);
            });
        });
    }

    /**
     * Draw a loading gif while loading js.
     * @returns {HTMLElement}
     * @private
     */
    cc._loadJsImg = function(){
        var jsLoadingImg = document.getElementById("cocos2d_loadJsImg");
        if(!jsLoadingImg){
            jsLoadingImg = document.createElement('img');
            jsLoadingImg.src = "data:image/gif;base64,R0lGODlhEAAQALMNAD8/P7+/vyoqKlVVVX9/fxUVFUBAQGBgYMDAwC8vL5CQkP///wAAAP///wAAAAAAACH/C05FVFNDQVBFMi4wAwEAAAAh+QQFAAANACwAAAAAEAAQAAAEO5DJSau9OOvNex0IMnDIsiCkiW6g6BmKYlBFkhSUEgQKlQCARG6nEBwOgl+QApMdCIRD7YZ5RjlGpCUCACH5BAUAAA0ALAAAAgAOAA4AAAQ6kLGB0JA4M7QW0hrngRllkYyhKAYqKUGguAws0ypLS8JxCLQDgXAIDg+FRKIA6v0SAECCBpXSkstMBAAh+QQFAAANACwAAAAACgAQAAAEOJDJORAac6K1kDSKYmydpASBUl0mqmRfaGTCcQgwcxDEke+9XO2WkxQSiUIuAQAkls0n7JgsWq8RACH5BAUAAA0ALAAAAAAOAA4AAAQ6kMlplDIzTxWC0oxwHALnDQgySAdBHNWFLAvCukc215JIZihVIZEogDIJACBxnCSXTcmwGK1ar1hrBAAh+QQFAAANACwAAAAAEAAKAAAEN5DJKc4RM+tDyNFTkSQF5xmKYmQJACTVpQSBwrpJNteZSGYoFWjIGCAQA2IGsVgglBOmEyoxIiMAIfkEBQAADQAsAgAAAA4ADgAABDmQSVZSKjPPBEDSGucJxyGA1XUQxAFma/tOpDlnhqIYN6MEAUXvF+zldrMBAjHoIRYLhBMqvSmZkggAIfkEBQAADQAsBgAAAAoAEAAABDeQyUmrnSWlYhMASfeFVbZdjHAcgnUQxOHCcqWylKEohqUEAYVkgEAMfkEJYrFA6HhKJsJCNFoiACH5BAUAAA0ALAIAAgAOAA4AAAQ3kMlJq704611SKloCAEk4lln3DQgyUMJxCBKyLAh1EMRR3wiDQmHY9SQslyIQUMRmlmVTIyRaIgA7";

            var canvasNode = document.getElementById(document["ccConfig"].tag);
            canvasNode.style.backgroundColor = "black";
            canvasNode.parentNode.appendChild(jsLoadingImg);

            var canvasStyle = getComputedStyle?getComputedStyle(canvasNode):canvasNode.currentStyle;
            jsLoadingImg.style.left = canvasNode.offsetLeft + (parseFloat(canvasStyle.width) - jsLoadingImg.width)/2 + "px";
            jsLoadingImg.style.top = canvasNode.offsetTop + (parseFloat(canvasStyle.height) - jsLoadingImg.height)/2 + "px";
            jsLoadingImg.style.position = "absolute";
        }
        return jsLoadingImg;
    };

    /**
     * Load base for game, such as js.
     * @param cb
     */
    cc.loadGame = function(){
        cc._loadJsList4Dependency("", [cc._projDir + cc.CFG_DIR  + "res.js", "ccConfig.js"], 0, function(){
            var jsLoadingImg = cc._loadJsImg();
            cc.loadJson(cc._projDir + "/" + cc.COCOS_JSON, function(err, data){
                if(err){
                    console.error(err);
                }else{
                    var dependencies = cc._getDependencies(data.dependencies);
                    cc._projName = data.name;
                    cc._modulesDir = cc._projDir + "node_modules/";

                    //load by list generated by script
                    var baseJsList = baseJsList || null;
                    if(baseJsList && baseJsList.length > 0){
                        cc._loadJsList("", baseJsList, 0, function(){
                            jsLoadingImg.parentNode.removeChild(jsLoadingImg);//remove loading gif
                            cc._loadJsList("", ["main.js"], 0, function(){});
                        });
                        return;
                    }

                    //load dependencies of current project
                    cc._loadDependencies(dependencies, 0, data.name, function(){
                        jsLoadingImg.parentNode.removeChild(jsLoadingImg);//remove loading gif
                        cc._loadJsList("", ["main.js"], 0, function(){});
                    });
                }
            });
        });
    };

    //======================test unit=====================

    /**
     * Get class by class path.
     * @param classPath
     * @returns {*}
     */
    cc.getClazz = function(classPath){
        var clazz = null;
        var arr = classPath.split(".");
        for(var i = 0; i < arr.length; ++i){
            clazz = clazz == null ? window[arr[i]] : clazz[arr[i]];
        }
        return clazz;
    };
    /**
     * Test for sprite.
     * @param cfgName
     */
    cc.testSprite = function(clazz, args){
        var layer = cc.Layer.create();
        var sprite = clazz.create(args || {});
        layer.addChild(sprite);
        var winSize = cc.Director.getInstance().getWinSize();
        sprite.setPosition(winSize.width/2, winSize.height/2);
        var scene = cc.Scene.create();
        scene.addChild(layer);
        cc.Director.getInstance().replaceScene(scene);
    };
    /**
     * Test for layer.
     * @param cfgName
     */
    cc.testLayer = function(clazz, args){
        var scene = cc.Scene.create();
        scene.addChild(clazz.create(args || {}));
        cc.Director.getInstance().replaceScene(scene);
    };
    /**
     * Test for scene.
     * @param cfgName
     */
    cc.testScene = function(clazz, args){
        var scene = clazz.create(args || {});
        cc.Director.getInstance().replaceScene(scene);
    };
    /**
     * Desc: Test for ccbi.This function requires ccb module.
     * @param cfgName
     */
    cc.testCCBI = function(cfgName, cfg){
        var node = cc.BuilderReader.load(cfgName);
        var scene = cc.Scene.create();
        if(node != null) scene.addChild(node);
        cc.Director.getInstance().replaceScene(scene);
    };

    //unit map
    cc.unitMap = {
        scene : cc.testScene,
        layer : cc.testLayer,
        sprite : cc.testSprite,
        ccbi : cc.testCCBI
    };
    //unit map for custom
    cc.unitMap4Cust = {
        ccbi : true
    };
    cc._trans4Res = function(resArr){
        var arr = [];
        for(var i = 0, li = resArr.length; i < li; i++){
            var itemi = resArr[i];
            arr.push({src : itemi});
        }
        return arr;
    }
    /**
     * Desc: Enter point of test unit.
     * @param cfgName
     */
    cc.test = function(cfgName){
        cc.loadRes(cfgName, function(result){
            cc.loadJs(result.js, function(){
                cc.LoaderScene.preload(cc._trans4Res(result.res), function(){
                    var cfg = resCfg[cfgName];
                    if(!cfg) throw "Please config the info of [" + cfgName + "] in resCfg.js first!"
                    for (var key in cc.unitMap) {
                        if(!key) continue;
                        if(!cfg[key]) continue;
                        //for custom, the args will be cfgName and cfg
                        if(cc.unitMap4Cust[key]) return c.unitMap[key](cfgName, cfg);
                        var clazz = cc.getClazz(cfg[key]);
                        if(!clazz) return console.error("class of [" + cfg[key] + "] not exists!");
                        //for normal, the args will be class and args of cfg.
                        return cc.unitMap[key](clazz, cfg.args);
                    }
                });
            });
        });
    };
    cc.loadGame();
}

