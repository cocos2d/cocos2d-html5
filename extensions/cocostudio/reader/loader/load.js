ccs.loadNode = (function(){

    /**
     * load file
     * @param file
     * @param type - ui|timeline|action
     * @returns {*}
     */
    var load = function(file, type){

        var json = cc.loader.getRes(file);

        if(!json)
            return cc.log("%s is not exists", file);
        var ext = extname(file).toLocaleLowerCase();
        if(ext !== "json" && ext !== "exportjson")
            return cc.log("%s load error, must be json file", file);

        //  Judging the parser (uiParse or timelineParse, Temporarily blank)
        //  The judgment condition is unknown
        var parse;
        if(json["widgetTree"])
            parse = parser["ccui"];
        else if(json["nodeTree"])
            parse = parser["timeline"];
        else if(json["Content"])
            parse = parser["timeline"];

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

        return currentParser.parse(file, json) || new cc.Node();
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
        this.deferred(json, resourcePath, node, file);
        return node;
    },

    pretreatment: function(json, resourcePath, file){},

    deferred: function(json, resourcePath, node, file){},

    parseNode: function(json, resourcePath){
        var parser = this.parsers[this.getClass(json)];
        var widget = null;
        if(parser)
            widget = parser.call(this, json, this.parseNode, resourcePath);
        else
            cc.log("Can't find the parser : %s", this.getClass(json));

        return widget;
    },

    registerParser: function(widget, parse){
        this.parsers[widget] = parse;
    }
});
