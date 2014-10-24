/****************************************************************************
 Copyright (c) 2013-2014 Chukong Technologies Inc.

 http://www.cocos2d-x.org

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 ****************************************************************************/

ccui.actionTimelineCacheStatic = {
    FrameType_VisibleFrame       : "VisibleFrame",
    FrameType_PositionFrame      : "PositionFrame",
    FrameType_ScaleFrame         : "ScaleFrame",
    FrameType_RotationFrame      : "RotationFrame",
    FrameType_SkewFrame          : "SkewFrame",
    FrameType_RotationSkewFrame  : "RotationSkewFrame",
    FrameType_AnchorFrame        : "AnchorPointFrame",
    FrameType_InnerActionFrame   : "InnerActionFrame",
    FrameType_ColorFrame         : "ColorFrame",
    FrameType_TextureFrame       : "TextureFrame",
    FrameType_EventFrame         : "EventFrame",
    FrameType_ZOrderFrame        : "ZOrderFrame",

    ACTION           : "action",
    DURATION         : "duration",
    TIMELINES        : "timelines",
    FRAME_TYPE       : "frameType",
    FRAMES           : "frames",
    FRAME_INDEX      : "frameIndex",
    TWEEN            : "tween",
    TIME_SPEED       : "speed",
    ACTION_TAG       : "actionTag",
    INNER_ACTION     : "innerActionType",
    START_FRAME      : "startFrame",

    X                : "x",
    Y                : "y",
    ROTATION         : "rotation",
    ALPHA            : "alpha",
    RED              : "red",
    GREEN            : "green",
    BLUE             : "blue",
    Value            : "value"
};

/**
 * action timeline cache
 * @name ccs.ActionTimelineCache
 * @namespace
 */
ccs.actionTimelineCache = {

    _FrameCreateFunc: null,
    _Pair: null,
    _funcs: null,
    _animationActions: null,

    /**
     * The initialization part object
     */
    init: function(){

        this._animationActions = {};
        this._funcs = {};
        this._funcs["VisibleFrame"]      = this._loadVisibleFrame;
        this._funcs["PositionFrame"]     = this._loadPositionFrame;
        this._funcs["ScaleFrame"]        = this._loadScaleFrame;
        this._funcs["RotationFrame"]     = this._loadRotationFrame;
        this._funcs["SkewFrame"]         = this._loadSkewFrame;
        this._funcs["RotationSkewFrame"] = this._loadRotationSkewFrame;
        this._funcs["AnchorFrame"]       = this._loadAnchorPointFrame;
        this._funcs["InnerActionFrame"]  = this._loadInnerActionFrame;
        this._funcs["ColorFrame"]        = this._loadColorFrame;
        this._funcs["TextureFrame"]      = this._loadTextureFrame;
        this._funcs["EventFrame"]        = this._loadEventFrame;
        this._funcs["ZOrderFrame"]       = this._loadZOrderFrame;
    },

    /**
     * remove Action
     * @param {string} fileName
     */
    removeAction: function(fileName){
        if (this._animationActions[fileName]) {
            delete this._animationActions[fileName];
        }
    },

    /**
     * Create new action
     * @param {string} filename
     * @returns {*}
     */
    createAction: function(filename){

        var path = filename;
        var pos = path.lastIndexOf('.');
        var suffix = path.substr(pos + 1, path.length);
        //cc.log("suffix = %s", suffix);

        var cache = ccs.actionTimelineCache;
        if (suffix == "csb"){
            return cache.createActionFromProtocolBuffers(filename);
        }else if (suffix == "json" || suffix == "ExportJson"){
            return cache.createActionFromJson(filename);
        }else if(suffix == "xml") {
            cc.log("Does not support");
        }
        return null;
    },

    /**
     * Create new action
     * @param {string} fileName
     * @returns {*}
     */
    createActionFromJson: function(fileName){

        var action = this._animationActions[fileName];
        if (action == null) {
            action = this.loadAnimationActionWithFile(fileName);
        }
        return action.clone();
    },

    /**
     * load Animation Action With File
     * @param {string} fileName
     * @returns {*}
     */
    loadAnimationActionWithFile: function(fileName){
        // Read content from file
        //TODO Whether you need a complete path splicing?
        var contentStr = cc.loader.getRes(fileName);
        return this.loadAnimationActionWithContent(fileName, contentStr);

    },

    /**
     * Load animation action with content.
     * @param {string} fileName
     * @param {Object} content
     * @returns {*}
     */
    loadAnimationActionWithContent: function(fileName, content){
        // if already exists an action with filename, then return this action
        var action = this._animationActions[fileName];
        if(action)
            return action;

        var json = content[ccui.actionTimelineCacheStatic.ACTION];

        action = new ccs.ActionTimeline();

        action.setDuration(json[ccui.actionTimelineCacheStatic.DURATION]);
        action.setTimeSpeed(json[ccui.actionTimelineCacheStatic.TIME_SPEED] || 1);

        var timelineLength = json[ccui.actionTimelineCacheStatic.TIMELINES].length;
        for (var i = 0; i<timelineLength; i++)
        {
            var dic = json[ccui.actionTimelineCacheStatic.TIMELINES][i];
            var timeline = this._loadTimeline(dic);

            if(timeline)
                action.addTimeline(timeline);
        }

        this._animationActions[fileName] = action;

        return action;

    },

    createActionFromProtocolBuffers: function(fileName){
        var action = this._animationActions[fileName];
        if(action == null){
            action = this.loadAnimationActionWithFileFromProtocolBuffers(fileName);
        }
        return action.clone();
    },

    loadAnimationActionWithFileFromProtocolBuffers: function(fileName){
        // if already exists an action with filename, then return this action
        var action = this._animationActions[fileName];
        if(action){
            return action;
        }

        var binary = cc.loader.getRes(fileName);
        var buffer = PBP["CSParseBinary"]["decode"](binary);

        var actionProtobuf = buffer["action"];
        action = new ccs.ActionTimeline();
        action.setDuration(actionProtobuf["duration"]);
        action.setTimeSpeed(actionProtobuf["speed"]!==null?actionProtobuf["speed"]:1);

        var timelineLength = actionProtobuf["timelines"].length;
        for(var i=0;i<timelineLength;i++){
            var timelineProtobuf = actionProtobuf["timelines"][i];
            var timeline = this.loadTimelineFromProtocolBuffers(timelineProtobuf);
        }
        for (var i = 0; i < timelineLength; i++){
            var timelineProtobuf = actionProtobuf["timelines"][i];
            var timeline = this.loadTimelineFromProtocolBuffers(timelineProtobuf);

            if(timeline){
                action.addTimeline(timeline);
            }
        }

        this._animationActions[fileName] = action;

        return action;

    },

    _loadTimeline: function(json){
        var timeline = null;

        // get frame type
        var frameType = json[ccui.actionTimelineCacheStatic.FRAME_TYPE];
        if(frameType == null)
            return null;

        if(frameType && this._funcs[frameType]){
            timeline = new ccs.Timeline();

            var actionTag = json[ccui.actionTimelineCacheStatic.ACTION_TAG];
            timeline.setActionTag(actionTag);

            var func = this._funcs[frameType];

            var length = json[ccui.actionTimelineCacheStatic.FRAMES].length;
            for (var i = 0; i<length; i++){
                var dic = json[ccui.actionTimelineCacheStatic.FRAMES][i];

                var frame = null;

                if (func != null){
                    frame = func(dic);

                    var frameIndex = dic[ccui.actionTimelineCacheStatic.FRAME_INDEX];
                    frame.setFrameIndex(frameIndex);

                    var tween = dic[ccui.actionTimelineCacheStatic.TWEEN] || false;
                    frame.setTween(tween);
                }

                timeline.addFrame(frame);
            }
        }

        return timeline;
    },

    _loadVisibleFrame: function(json){
        var frame = new ccs.VisibleFrame();

        var visible = json[ccui.actionTimelineCacheStatic.Value];
        frame.setVisible(visible);

        return frame;
    },
    _loadPositionFrame: function(json){
        var frame = new ccs.PositionFrame();

        var x = json[ccui.actionTimelineCacheStatic.X];
        var y = json[ccui.actionTimelineCacheStatic.Y];
        frame.setPosition(cc.p(x,y));

        return frame;

    },
    _loadScaleFrame: function(json){
        var frame = new ccs.ScaleFrame();

        var scalex = json[ccui.actionTimelineCacheStatic.X];
        var scaley = json[ccui.actionTimelineCacheStatic.Y];

        frame.setScaleX(scalex);
        frame.setScaleY(scaley);

        return frame;
    },
    _loadSkewFrame: function(json){
        var frame = new ccs.SkewFrame();

        var skewx = json[ccui.actionTimelineCacheStatic.X];
        var skewy = json[ccui.actionTimelineCacheStatic.Y];

        frame.setSkewX(skewx);
        frame.setSkewY(skewy);

        return frame;
    },
    _loadRotationSkewFrame: function(json){
        var frame = new ccs.RotationSkewFrame();

        var skewx = json[ccui.actionTimelineCacheStatic.X];
        var skewy = json[ccui.actionTimelineCacheStatic.Y];

        frame.setSkewX(skewx);
        frame.setSkewY(skewy);

        return frame;

    },
    _loadRotationFrame: function(json){
        var frame = new ccs.RotationFrame();

        var rotation = json[ccui.actionTimelineCacheStatic.ROTATION];
        frame.setRotation(rotation);

        return frame;
    },
    _loadAnchorPointFrame: function(json){
        var frame = new ccs.AnchorPointFrame();

        var anchorx = json[ccui.actionTimelineCacheStatic.X];
        var anchory = json[ccui.actionTimelineCacheStatic.Y];

        frame.setAnchorPoint(Point(anchorx, anchory));

        return frame;
    },
    _loadInnerActionFrame: function(json){
        var frame = new ccs.InnerActionFrame();

        var type = json[ccui.actionTimelineCacheStatic.INNER_ACTION];
        var startFrame = json[ccui.actionTimelineCacheStatic.START_FRAME];

        frame.setInnerActionType(type);
        frame.setStartFrameIndex(startFrame);

        return frame;
    },
    _loadColorFrame: function(json){
        var frame = new ccs.ColorFrame();

        var alpha = json[ccui.actionTimelineCacheStatic.ALPHA];
        var red   = json[ccui.actionTimelineCacheStatic.RED];
        var green = json[ccui.actionTimelineCacheStatic.GREEN];
        var blue  = json[ccui.actionTimelineCacheStatic.BLUE];

        frame.setAlpha(alpha);
        frame.setColor(cc.color(red, green, blue));

        return frame;
    },
    _loadTextureFrame: function(json){
        var frame = new ccs.TextureFrame();

        var texture = json[ccui.actionTimelineCacheStatic.Value];

        if(texture != null) {
            var path = texture;

            var spriteFrame = cc.spriteFrameCache.getSpriteFrame(path);
            if(spriteFrame == null)
            {
                var jsonPath = ccs.csLoader.getJsonPath();
                path = jsonPath + texture;
            }

            frame.setTextureName(path);
        }
        return frame;

    },
    _loadEventFrame: function(json){
        var frame = new ccs.EventFrame();

        var evnt = json[ccui.actionTimelineCacheStatic.Value];

        if(evnt != null)
            frame.setEvent(evnt);

        return frame;
    },
    _loadZOrderFrame: function(json){
        var frame = new ccs.ZOrderFrame();

        var zorder = json[ccui.actionTimelineCacheStatic.Value];
        frame.setZOrder(zorder);

        return frame;
    },

    loadTimelineFromProtocolBuffers: function(timelineProtobuf){
        var timeline = null;

        //get frame type
        var frameType = timelineProtobuf["frameType"];
        if(frameType == null){
            return null;
        }

        //cc.log("frameType = %s", frameType);

        if(frameType){
            timeline = new ccs.Timeline();
            var actionTag = timelineProtobuf["actionTag"];
            timeline.setActionTag(actionTag);

            var length = timelineProtobuf["frames"].length;
            for (var i = 0; i < length; i++){
                var frameProtobuf = timelineProtobuf["frames"][i];

                var frame = null;
                if (ccui.actionTimelineCacheStatic.FrameType_VisibleFrame === frameType){
                    var visibleFrame = frameProtobuf["visibleFrame"];
                    frame = this.loadVisibleFrameFromProtocolBuffers(visibleFrame);

                }else if (ccui.actionTimelineCacheStatic.FrameType_PositionFrame === frameType){
                    var positionFrame = frameProtobuf["positionFrame"];
                    frame = this.loadPositionFrameFromProtocolBuffers(positionFrame);
                }else if(ccui.actionTimelineCacheStatic.FrameType_ScaleFrame === frameType){
                    var scaleFrame = frameProtobuf["scaleFrame"];
                    frame = this.loadScaleFrameFromProtocolBuffers(scaleFrame);
                }else if (ccui.actionTimelineCacheStatic.FrameType_RotationSkewFrame === frameType){
                    var rotationSkewFrame = frameProtobuf["rotationSkewFrame"];
                    frame = this.loadRotationSkewFrameFromProtocolBuffers(rotationSkewFrame);
                }else if (ccui.actionTimelineCacheStatic.FrameType_AnchorFrame === frameType){
                    var anchorFrame = frameProtobuf["anchorPointFrame"];
                    frame = this.loadAnchorPointFrameFromProtocolBuffers(anchorFrame);
                }else if (ccui.actionTimelineCacheStatic.FrameType_ColorFrame === frameType){
                    var colorFrame = frameProtobuf["colorFrame"];
                    frame = this.loadColorFrameFromProtocolBuffers(colorFrame);
                }else if (ccui.actionTimelineCacheStatic.FrameType_TextureFrame === frameType){
                    var textureFrame = frameProtobuf["textureFrame"];
                    frame = this.loadTextureFrameFromProtocolBuffers(textureFrame);
                }else if (ccui.actionTimelineCacheStatic.FrameType_EventFrame === frameType){
                    var eventFrame = frameProtobuf["eventFrame"];
                    frame = this.loadEventFrameFromProtocolBuffers(eventFrame);
                }else if (ccui.actionTimelineCacheStatic.FrameType_ZOrderFrame === frameType){
                    var zOrderFrame = frameProtobuf["zOrderFrame"];
                    frame = this.loadZOrderFrameFromProtocolBuffers(zOrderFrame);
                }

                timeline.addFrame(frame);
            }
        }

        return timeline;
    },

    loadVisibleFrameFromProtocolBuffers: function(frameProtobuf){
        var frame = new ccs.VisibleFrame();

        var visible = frameProtobuf["value"];
        frame.setVisible(visible);

        //cc.log("visible = %d", visible);

        var frameIndex = frameProtobuf["frameIndex"]!==null ? frameProtobuf["frameIndex"] : 0;
        frame.setFrameIndex(frameIndex);
        var tween = (frameProtobuf["tween"]!==null ? frameProtobuf["tween"] : false);
        frame.setTween(tween);
        return frame;
    },

    loadPositionFrameFromProtocolBuffers: function(frameProtobuf){
        var frame = new ccs.PositionFrame();

        var x = frameProtobuf["x"];
        var y = frameProtobuf["y"];
        frame.setPosition(cc.p(x,y));

        //cc.log("x = %f", x);
        //cc.log("y = %f", y);

        var frameIndex = frameProtobuf["frameIndex"]!==null ? frameProtobuf["frameIndex"] : 0;
        frame.setFrameIndex(frameIndex);

        var tween = (frameProtobuf["tween"]!==null ? frameProtobuf["tween"] : false);
        frame.setTween(tween);

        return frame;
    },

    loadScaleFrameFromProtocolBuffers: function(frameProtobuf){
        var frame = new ccs.ScaleFrame();

        var scalex = frameProtobuf["x"];
        var scaley = frameProtobuf["y"];

        frame.setScaleX(scalex);
        frame.setScaleY(scaley);

        //cc.log("scalex = %f", scalex);
        //cc.log("scaley = %f", scaley);

        var frameIndex = frameProtobuf["frameIndex"]!==null ? frameProtobuf["frameIndex"] : 0;
        frame.setFrameIndex(frameIndex);

        var tween = (frameProtobuf["tween"]!==null ? frameProtobuf["tween"] : false);
        frame.setTween(tween);

        return frame;
    },

    loadRotationSkewFrameFromProtocolBuffers: function(frameProtobuf){
        var frame = new ccs.RotationSkewFrame();

        var skewx = frameProtobuf["x"];
        var skewy = frameProtobuf["y"];

        frame.setSkewX(skewx);
        frame.setSkewY(skewy);

        var frameIndex = frameProtobuf["frameIndex"]!==null ? frameProtobuf["frameIndex"] : 0;
        frame.setFrameIndex(frameIndex);

        var tween = (frameProtobuf["tween"]!==null ? frameProtobuf["tween"] : false);
        frame.setTween(tween);

        return frame;
    },

    loadAnchorPointFrameFromProtocolBuffers: function(frameProtobuf){
        var frame = new ccs.AnchorPointFrame();

        var anchorx = frameProtobuf["x"];
        var anchory = frameProtobuf["y"];

        frame.setAnchorPoint(cc.p(anchorx, anchory));

        //cc.log("anchorx = %f", anchorx);
        //cc.log("anchory = %f", anchory);

        var frameIndex = frameProtobuf["frameIndex"]!==null ? frameProtobuf["frameIndex"] : 0;
        frame.setFrameIndex(frameIndex);

        var tween = (frameProtobuf["tween"]!==null ? frameProtobuf["tween"] : false);
        frame.setTween(tween);

        return frame;
    },

    loadColorFrameFromProtocolBuffers: function(frameProtobuf){
        var frame = new ccs.ColorFrame();

        var alpha = frameProtobuf["alpha"];
        var red   = frameProtobuf["red"];
        var green = frameProtobuf["green"];
        var blue  = frameProtobuf["blue"];

        frame.setAlpha(alpha);
        frame.setColor(cc.color(red, green, blue));

        //cc.log("alpha = %d", alpha);
        //cc.log("red = %d", red);
        //cc.log("green = %d", green);
        //cc.log("blue = %d", blue);

        var frameIndex = frameProtobuf["frameIndex"]!==null ? frameProtobuf["frameIndex"] : 0;
        frame.setFrameIndex(frameIndex);

        var tween = (frameProtobuf["tween"]!==null ? frameProtobuf["tween"] : false);
        frame.setTween(tween);

        return frame;
    },

    loadTextureFrameFromProtocolBuffers: function(frameProtobuf){
        var frame = new ccs.TextureFrame();

        var texture = frameProtobuf["filepath"];

        if (texture != null)
            frame.setTextureName(texture);

        //cc.log("texture = %s", texture);

        var frameIndex = frameProtobuf["frameIndex"]!==null ? frameProtobuf["frameIndex"] : 0;
        frame.setFrameIndex(frameIndex);

        var tween = (frameProtobuf["tween"]!==null ? frameProtobuf["tween"] : false);
        frame.setTween(tween);

        return frame;
    },

    loadEventFrameFromProtocolBuffers: function(frameProtobuf){
        var frame = new ccs.EventFrame();

        var evnt = frameProtobuf["value"];

        if (evnt != null)
            frame.setEvent(evnt);

        //cc.log("evnt = %s", evnt);

        var frameIndex = frameProtobuf["frameIndex"]!==null ? frameProtobuf["frameIndex"] : 0;
        frame.setFrameIndex(frameIndex);

        var tween = (frameProtobuf["tween"]!==null ? frameProtobuf["tween"] : false);
        frame.setTween(tween);

        return frame;
    },

    loadZOrderFrameFromProtocolBuffers: function(frameProtobuf){
        var frame = new ccs.ZOrderFrame();

        var zorder = frameProtobuf["value"];
        frame.setZOrder(zorder);

        //cc.log("zorder = %d", zorder);

        var frameIndex = frameProtobuf["frameIndex"]!==null ? frameProtobuf["frameIndex"] : 0;
        frame.setFrameIndex(frameIndex);

        var tween = (frameProtobuf["tween"]!==null ? frameProtobuf["tween"] : false);
        frame.setTween(tween);

        return frame;
    },

    createActionFromXML: function(fileName)
    {
        var action = this._animationActions[fileName];
        if (action == null)
        {
            action = this.loadAnimationActionWithFileFromXML(fileName);
        }
        return action.clone();
    },
    
    loadAnimationActionWithFileFromXML: function(fileName)
    {
        // if already exists an action with filename, then return this action
        var action = this._animationActions[fileName];
        if (action)
            return action;
    
        // Read content from file
        var content = cc.loader.getRes(fileName);

        // xml parse
        var document = new tinyxml2.XMLDocument();
        document.Parse(content);
    
        var rootElement = document.RootElement();// Root
        //cc.log("rootElement name = %s", rootElement.Name());
    
        var element = rootElement.FirstChildElement();
    
        var createEnabled = false;
        var rootType = "";
    
        while (element)
        {
            //cc.log("entity name = %s", element.Name());
    
            if (strcmp("Content", element.Name()) == 0)
            {
                var attribute = element.FirstAttribute();
    
                if (!attribute)
                {
                    createEnabled = true;
                }
            }
    
            if (createEnabled)
            {
                break;
            }
    
            var child = element.FirstChildElement();
            if (child)
            {
                element = child;
            }
            else
            {
                element = element.NextSiblingElement();
            }
        }
    
    
        // serialize
        if (createEnabled)
        {
            var child = element.FirstChildElement();
    
            while (child)
            {
                var name = child.Name();
    
                if (name == "Animation") // action
                {
                    var animation = child;
                    action = this.loadActionTimelineFromXML(animation);
                }
    
                child = child.NextSiblingElement();
            }
        }
    
        return action;
    },
    
    loadActionTimelineFromXML: function(animationElement)
    {
        var action = new ccs.ActionTimeline();
        //cc.log("animationElement name = %s", animationElement.Name());
    
        // ActionTimeline
        var attribute = animationElement.FirstAttribute();
    
        // attibutes
        while (attribute)
        {
            var name = attribute.Name();
            var value = attribute.Value();
    
            if (name == "Duration")
            {
                action.setDuration(atoi(value.c_str()));
            }
            else if (name == "Speed")
            {
                action.setTimeSpeed(atof(value.c_str()));
            }
    
            attribute = attribute.Next();
        }
    
        // all Timeline
        var timelineElement = animationElement.FirstChildElement();
        while (timelineElement)
        {
            var timeline = loadTimelineFromXML(timelineElement);
            if (timeline)
            {
                action.addTimeline(timeline);
            }
    
            timelineElement = timelineElement.NextSiblingElement();
        }
    
        return action;
    },
    
    loadTimelineFromXML: function(timelineElement)
    {
        var timeline = null;
    
        // TimelineData attrsibutes
        var actionTag = 0;
        var frameType = "";
        var attribute = timelineElement.FirstAttribute();
        while (attribute)
        {
            var name = attribute.Name();
            var value = attribute.Value();
    
            if (name == "ActionTag")
            {
                actionTag = atoi(value.c_str());
            }
            else if (name == "FrameType")
            {
                frameType = value;
            }
    
            attribute = attribute.Next();
        }
    
        if (frameType != "")
        {
            timeline = new ccs.Timeline();
            timeline.setActionTag(actionTag);
        }
    
        // all Frame
        var frameElement = timelineElement.FirstChildElement();
        while (frameElement)
        {
            var frame = null;
    
            if (frameType == FrameType_VisibleFrame)
            {
                frame = loadVisibleFrameFromXML(frameElement);
            }
            else if (frameType == FrameType_PositionFrame)
            {
                frame = loadPositionFrameFromXML(frameElement);
            }
            else if (frameType == FrameType_ScaleFrame)
            {
                frame = loadScaleFrameFromXML(frameElement);
            }
            else if (frameType == FrameType_RotationSkewFrame)
            {
                frame = loadRotationSkewFrameFromXML(frameElement);
            }
            else if (frameType == FrameType_AnchorFrame)
            {
                frame = loadAnchorPointFrameFromXML(frameElement);
            }
            else if (frameType == FrameType_ColorFrame)
            {
                frame = loadColorFrameFromXML(frameElement);
            }
            else if (frameType == FrameType_TextureFrame)
            {
                frame = loadTextureFrameFromXML(frameElement);
            }
            else if (frameType == FrameType_EventFrame)
            {
                frame = loadEventFrameFromXML(frameElement);
            }
            else if (frameType == FrameType_ZOrderFrame)
            {
                frame = loadZOrderFrameFromXML(frameElement);
            }
    
            if (frame)
            {
                timeline.addFrame(frame);
            }
    
            frameElement = frameElement.NextSiblingElement();
        }
    
        return timeline;
    },
    
    loadVisibleFrameFromXML: function(frameElement)
    {
        var frame = new ccs.VisibleFrame();
    
        frame.setTween(true);
    
        var attribute = frameElement.FirstAttribute();
        while (attribute)
        {
            var name = attribute.Name();
            var value = attribute.Value();
    
            if (name == "Value")
            {
                frame.setVisible((value == "True") ? true : false);
            }
            else if (name == "FrameIndex")
            {
                frame.setFrameIndex(atoi(value));
            }
            else if (name == "Tween")
            {
                frame.setTween((value == "True") ? true : false);
            }
    
            attribute = attribute.Next();
        }
    
        return frame;
    },
    
    loadPositionFrameFromXML: function(frameElement)
    {
        var frame = new ccs.PositionFrame();
    
        frame.setTween(true);
    
        var attribute = frameElement.FirstAttribute();
        while (attribute)
        {
            var name = attribute.Name();
            var value = attribute.Value();
    
            if (name == "X")
            {
                frame.setX(atof(value));
            }
            else if (name == "Y")
            {
                frame.setY(atof(value));
            }
            else if (name == "FrameIndex")
            {
                frame.setFrameIndex(atoi(value));
            }
            else if (name == "Tween")
            {
                frame.setTween((value == "True") ? true : false);
            }
    
            attribute = attribute.Next();
        }
    
        return frame;
    },
    
    loadScaleFrameFromXML: function(frameElement)
    {
        var frame = new ccs.ScaleFrame();
    
        frame.setTween(true);
    
        var attribute = frameElement.FirstAttribute();
        while (attribute)
        {
            var name = attribute.Name();
            var value = attribute.Value();
    
            if (name == "X")
            {
                frame.setScaleX(atof(value));
            }
            else if (name == "Y")
            {
                frame.setScaleY(atof(value));
            }
            else if (name == "FrameIndex")
            {
                frame.setFrameIndex(atoi(value));
            }
            else if (name == "Tween")
            {
                frame.setTween((value == "True") ? true : false);
            }
    
            attribute = attribute.Next();
        }
    
        return frame;
    },
    
    loadRotationSkewFrameFromXML: function(frameElement)
    {
        var frame = new ccs.RotationSkewFrame();
    
        frame.setTween(true);
    
        var attribute = frameElement.FirstAttribute();
        while (attribute)
        {
            var name = attribute.Name();
            var value = attribute.Value();
    
            if (name == "X")
            {
                frame.setSkewX(atof(value));
            }
            else if (name == "Y")
            {
                frame.setSkewY(atof(value));
            }
            else if (name == "FrameIndex")
            {
                frame.setFrameIndex(atoi(value));
            }
            else if (name == "Tween")
            {
                frame.setTween((value == "True") ? true : false);
            }
    
            attribute = attribute.Next();
        }
    
        return frame;
    },
    
    loadAnchorPointFrameFromXML: function(frameElement)
    {
        var frame = new ccs.AnchorPointFrame();
    
        var anchor_x = 0.5, anchor_y = 0.5;
    
        frame.setTween(true);
    
        var attribute = frameElement.FirstAttribute();
        while (attribute)
        {
            var name = attribute.Name();
            var value = attribute.Value();
    
            if (name == "X")
            {
                anchor_x = atof(value);
            }
            else if (name == "Y")
            {
                anchor_y = atof(value);
            }
            else if (name == "FrameIndex")
            {
                frame.setFrameIndex(atoi(value));
            }
            else if (name == "Tween")
            {
                frame.setTween((value == "True") ? true : false);
            }
    
            attribute = attribute.Next();
        }
    
        frame.setAnchorPoint(cc.p(anchor_x, anchor_y));
    
        return frame;
    },
    
    loadColorFrameFromXML: function(frameElement)
    {
        var frame = new ccs.ColorFrame();
    
        var red = 255, green = 255, blue = 255;
    
        frame.setTween(true);
    
        var attribute = frameElement.FirstAttribute();
        while (attribute)
        {
            var name = attribute.Name();
            var value = attribute.Value();
    
            if (name == "FrameIndex")
            {
                frame.setFrameIndex(atoi(value));
            }
            else if (name == "Alpha")
            {
                frame.setAlpha(atoi(value));
            }
            else if (name == "Tween")
            {
                frame.setTween((value == "True") ? true : false);
            }
    
            attribute = attribute.Next();
        }
    
        // color
        var child = frameElement.FirstChildElement();
        while (child)
        {
            var attribute = child.FirstAttribute();
            while (attribute)
            {
                var name = attribute.Name();
                var value = attribute.Value();
    
                if (name == "R")
                {
                    red = atoi(value);
                }
                else if (name == "G")
                {
                    green = atoi(value);
                }
                else if (name == "B")
                {
                    blue = atoi(value);
                }
    
                attribute = attribute.Next();
            }
    
            child = child.NextSiblingElement();
        }
    
        frame.setColor(cc.color(red, green, blue));
    
        return frame;
    },

    loadTextureFrameFromXML: function(frameElement)
    {
        var frame = new ccs.TextureFrame();
    
        frame.setTween(true);
    
        var attribute = frameElement.FirstAttribute();
        while (attribute)
        {
            var name = attribute.Name();
            var value = attribute.Value();
    
            if (name == "Path") // to be gonna modify
            {
                frame.setTextureName(value);
            }
            else if (name == "FrameIndex")
            {
                frame.setFrameIndex(atoi(value.c_str()));
            }
            else if (name == "Tween")
            {
                frame.setTween((value == "True") ? true : false);
            }
    
            attribute = attribute.Next();
        }
    
        return frame;
    },
    
    loadEventFrameFromXML: function(frameElement)
    {
        var frame = new ccs.EventFrame();
    
        frame.setTween(true);
    
        var attribute = frameElement.FirstAttribute();
        while (attribute)
        {
            var name = attribute.Name();
            var value = attribute.Value();
    
            if (name == "EventStr") // to be gonna modify
            {
                frame.setEvent(value);
            }
            else if (name == "FrameIndex")
            {
                frame.setFrameIndex(atoi(value.c_str()));
            }
            else if (name == "Tween")
            {
                frame.setTween((value == "True") ? true : false);
            }
    
            attribute = attribute.Next();
        }
    
        return frame;
    },
    
    loadZOrderFrameFromXML: function(varframeElement)
    {
        var frame = new ccs.ZOrderFrame();
    
        frame.setTween(true);
    
        var attribute = frameElement.FirstAttribute();
        while (attribute)
        {
            var name = attribute.Name();
            var value = attribute.Value();
    
            if (name == "zorder") // to be gonna modify
            {
                frame.setZOrder(atoi(value));
            }
            else if (name == "FrameIndex")
            {
                frame.setFrameIndex(atoi(value));
            }
            else if (name == "Tween")
            {
                frame.setTween((value == "True") ? true : false);
            }
    
            attribute = attribute.Next();
        }
    
        return frame;
    }

};

ccs.actionTimelineCache.init();

ccs.actionTimelineCache._sharedActionCache = null;