(function(load, baseParser){

    var Parser = baseParser.extend({

        getNodeJson: function(json){
            return json["Content"]["Content"]["Animation"];
        },

        parseNode: function(json, resourcePath, file){
            var self = this;
            //The process of analysis
            var timelines = json["Timelines"];
            timelines.forEach(function(timeline){
                var parser = self.parsers[timeline["FrameType"]];
                parser.call(self, timeline, resourcePath);
            });
            return new cc.Action();
        }

    });
    var parser = new Parser();

    parser.registerParser("RotationSkewFrame", function(options, resourcePath){

    });

    load.registerParser("action", "2.*", parser);

})(ccs._load, ccs._parser);