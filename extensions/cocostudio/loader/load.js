ccs._load = (function(){

    /**
     * load file
     * @param file
     * @param type - ccui|node|action
     * @returns {*}
     */
    var load = function(file, type){

        var json = cc.loader.getRes(file);

        if(!json)
            return cc.log("%s is not exists", file);
        var ext = extname(file).toLocaleLowerCase();
        if(ext !== "json" && ext !== "exportjson")
            return cc.log("%s load error, must be json file", file);

        var parse;
        if(!type){
            if(json["widgetTree"])
                parse = parser["ccui"];
            else if(json["nodeTree"])
                parse = parser["timeline"];
            else if(json["Content"] && json["Content"]["Content"])
                parse = parser["timeline"];
        }else{
            parse = parser[type];
        }

        if(!parse){
            cc.log("Can't find the parser : %s", file);
            return new cc.Node();
        }
        var version = json["version"] || json["Version"];
        var currentParser = getParser(parse, version);
        if(!currentParser){
            cc.log("Can't find the parser : %s", file);
            return new cc.Node();
        }

        return currentParser.parse(file, json) || null;
    };

    var parser = {
        "ccui": {},
        "timeline": {},
        "action": {}
    };

    load.registerParser = function(name, version, target){
        if(!name || !version || !target)
            return cc.log("register parser error");
        if(!parser[name])
            parser[name] = {};
        parser[name][version] = target;
    };

    load.getParser = function(name, version){
        if(name && version)
            return parser[name] ? parser[name][version] : undefined;
        if(name)
            return parser[name];
        return parser;
    };

    //Gets the file extension
    var extname = function(fileName){
        var arr = fileName.match(extnameReg);
        return ( arr && arr[1] ) ? arr[1] : null;
    };
    var extnameReg = /\.([^\.]+)$/;


    var parserReg = /([^\.](\.\*)?)*$/;
    var getParser = function(parser, version){
        if(parser[version])
            return parser[version];
        else if(version === "*")
            return null;
        else
            return getParser(parser, version.replace(parserReg, "*"));
    };

    return load;

})();

ccs._parser = cc.Class.extend({

    ctor: function(){
        this.parsers = {};
    },

    _dirnameReg: /\S*\//,
    _dirname: function(path){
        var arr = path.match(this._dirnameReg);
        return (arr && arr[0]) ? arr[0] : "";
    },

    getClass: function(json){
        return json["classname"];
    },

    getNodeJson: function(json){
        return json["widgetTree"];
    },

    parse: function(file, json){
        var resourcePath = this._dirname(file);
        this.pretreatment(json, resourcePath);
        var node = this.parseNode(this.getNodeJson(json), resourcePath);
        node && this.deferred(json, resourcePath, node, file);
        return node;
    },

    pretreatment: function(json, resourcePath, file){},

    deferred: function(json, resourcePath, node, file){},

    parseNode: function(json, resourcePath){
        var parser = this.parsers[this.getClass(json)];
        var widget = null;
        if(parser)
            widget = parser.call(this, json, resourcePath);
        else
            cc.log("Can't find the parser : %s", this.getClass(json));

        return widget;
    },

    registerParser: function(widget, parse){
        this.parsers[widget] = parse;
    }
});

/**
 * Analysis of studio JSON file
 * The incoming file name, parse out the corresponding object
 * Temporary support file list:
 *   ui 1.*
 *   node 1.* - 2.*
 *   action 1.* - 2.*
 * @param {String} file
 * @returns {{node: cc.Node, action: cc.Action}}
 */
ccs.load = function(file){
    var object = {
        node: null,
        action: null
    };
    try{
        object.node = ccs._load(file);
        object.action = ccs._load(file, "action");
    }catch(error){
        cc.log("ccs.load has encountered some problems");
    }
    return object;
};