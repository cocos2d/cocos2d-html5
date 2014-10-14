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

var ActionTimelineCacheStatic = {
    FrameType_VisibleFrame       : "VisibleFrame",
    FrameType_PositionFrame      : "PositionFrame",
    FrameType_ScaleFrame         : "ScaleFrame",
    FrameType_RotationFrame      : "RotationFrame",
    FrameType_SkewFrame          : "SkewFrame",
    FrameType_RotationSkewFrame  : "RotationSkewFrame",
    FrameType_AnchorFrame        : "AnchorFrame",
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
ccs.ActionTimelineCache = {

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
     * @param {string} fileName
     * @returns {*}
     */
    createAction: function(fileName){

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

        var json = content[ActionTimelineCacheStatic.ACTION];

        action = new ccs.ActionTimeline();

        action.setDuration(json[ActionTimelineCacheStatic.DURATION]);
        action.setTimeSpeed(json[ActionTimelineCacheStatic.TIME_SPEED] || 1);

        var timelineLength = json[ActionTimelineCacheStatic.TIMELINES].length;
        for (var i = 0; i<timelineLength; i++)
        {
            var dic = json[ActionTimelineCacheStatic.TIMELINES][i];
            var timeline = this._loadTimeline(dic);

            if(timeline)
                action.addTimeline(timeline);
        }

        this._animationActions[fileName] = action;

        return action;

    },

    _loadTimeline: function(json){
        var timeline = null;

        // get frame type
        var frameType = json[ActionTimelineCacheStatic.FRAME_TYPE];
        if(frameType == null)
            return null;

        if(frameType && this._funcs[frameType]){
            timeline = new ccs.Timeline();

            var actionTag = json[ActionTimelineCacheStatic.ACTION_TAG];
            timeline.setActionTag(actionTag);

            var func = this._funcs[frameType];

            var length = json[ActionTimelineCacheStatic.FRAMES].length;
            for (var i = 0; i<length; i++){
                var dic = json[ActionTimelineCacheStatic.FRAMES][i];

                var frame = null;

                if (func != null){
                    frame = func(dic);

                    var frameIndex = dic[ActionTimelineCacheStatic.FRAME_INDEX];
                    frame.setFrameIndex(frameIndex);

                    var tween = dic[ActionTimelineCacheStatic.TWEEN] || false;
                    frame.setTween(tween);
                }

                timeline.addFrame(frame);
            }
        }

        return timeline;
    },

    _loadVisibleFrame: function(json){
        var frame = new ccs.VisibleFrame();

        var visible = json[ActionTimelineCacheStatic.Value];
        frame.setVisible(visible);

        return frame;
    },
    _loadPositionFrame: function(json){
        var frame = new ccs.PositionFrame();

        var x = json[ActionTimelineCacheStatic.X];
        var y = json[ActionTimelineCacheStatic.Y];
        frame.setPosition(cc.p(x,y));

        return frame;

    },
    _loadScaleFrame: function(json){
        var frame = new ccs.ScaleFrame();

        var scalex = json[ActionTimelineCacheStatic.X];
        var scaley = json[ActionTimelineCacheStatic.Y];

        frame.setScaleX(scalex);
        frame.setScaleY(scaley);

        return frame;
    },
    _loadSkewFrame: function(json){
        var frame = new ccs.SkewFrame();

        var skewx = json[ActionTimelineCacheStatic.X];
        var skewy = json[ActionTimelineCacheStatic.Y];

        frame.setSkewX(skewx);
        frame.setSkewY(skewy);

        return frame;
    },
    _loadRotationSkewFrame: function(json){
        var frame = new ccs.RotationSkewFrame();

        var skewx = json[ActionTimelineCacheStatic.X];
        var skewy = json[ActionTimelineCacheStatic.Y];

        frame.setSkewX(skewx);
        frame.setSkewY(skewy);

        return frame;

    },
    _loadRotationFrame: function(json){
        var frame = new ccs.RotationFrame();

        var rotation = json[ActionTimelineCacheStatic.ROTATION];
        frame.setRotation(rotation);

        return frame;
    },
    _loadAnchorPointFrame: function(json){
        var frame = new ccs.AnchorPointFrame();

        var anchorx = json[ActionTimelineCacheStatic.X];
        var anchory = json[ActionTimelineCacheStatic.Y];

        frame.setAnchorPoint(Point(anchorx, anchory));

        return frame;
    },
    _loadInnerActionFrame: function(json){
        var frame = new ccs.InnerActionFrame();

        var type = json[ActionTimelineCacheStatic.INNER_ACTION];
        var startFrame = json[ActionTimelineCacheStatic.START_FRAME];

        frame.setInnerActionType(type);
        frame.setStartFrameIndex(startFrame);

        return frame;
    },
    _loadColorFrame: function(json){
        var frame = new ccs.ColorFrame();

        var alpha = json[ActionTimelineCacheStatic.ALPHA];
        var red   = json[ActionTimelineCacheStatic.RED];
        var green = json[ActionTimelineCacheStatic.GREEN];
        var blue  = json[ActionTimelineCacheStatic.BLUE];

        frame.setAlpha(alpha);
        frame.setColor(cc.color(red, green, blue));

        return frame;
    },
    _loadTextureFrame: function(json){
        var frame = new ccs.TextureFrame();

        var texture = json[ActionTimelineCacheStatic.Value];

        if(texture != null) {
            var path = texture;

            var spriteFrame = cc.spriteFrameCache.getSpriteFrame(path);
            if(spriteFrame == null)
            {
                var jsonPath = ccs.NodeReader.getJsonPath();
                path = jsonPath + texture;
            }

            frame.setTextureName(path);
        }
        return frame;

    },
    _loadEventFrame: function(json){
        var frame = new ccs.EventFrame();

        var evnt = json[ActionTimelineCacheStatic.Value];

        if(evnt != null)
            frame.setEvent(evnt);

        return frame;
    },
    _loadZOrderFrame: function(json){
        var frame = new ccs.ZOrderFrame();

        var zorder = json[ActionTimelineCacheStatic.Value];
        frame.setZOrder(zorder);

        return frame;
    }


};

ccs.ActionTimelineCache.init();

ccs.ActionTimelineCache._sharedActionCache = null;