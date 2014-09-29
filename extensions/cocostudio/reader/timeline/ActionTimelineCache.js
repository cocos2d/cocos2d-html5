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

(function(studio){
    var tlparam = {
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
    studio.ActionTimelineCache = {

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

            var json = content[tlparam.ACTION];

            action = new studio.ActionTimeline();

            action.setDuration(json[tlparam.DURATION]);
            action.setTimeSpeed(json[tlparam.TIME_SPEED] || 1);

            var timelineLength = json[tlparam.TIMELINES].length;
            for (var i = 0; i<timelineLength; i++)
            {
                var dic = json[tlparam.TIMELINES][i];
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
            var frameType = json[tlparam.FRAME_TYPE];
            if(frameType == null)
                return null;

            if(frameType && this._funcs[frameType]){
                timeline = new studio.Timeline();

                var actionTag = json[tlparam.ACTION_TAG];
                timeline.setActionTag(actionTag);

                var func = this._funcs[frameType];

                var length = json[tlparam.FRAMES].length;
                for (var i = 0; i<length; i++){
                    var dic = json[tlparam.FRAMES][i];

                    var frame = null;

                    if (func != null){
                        frame = func(dic);

                        var frameIndex = dic[tlparam.FRAME_INDEX];
                        frame.setFrameIndex(frameIndex);

                        var tween = dic[tlparam.TWEEN] || false;
                        frame.setTween(tween);
                    }

                    timeline.addFrame(frame);
                }
            }

            return timeline;
        },

        _loadVisibleFrame: function(json){
            var frame = new studio.VisibleFrame();

            var visible = json[tlparam.Value];
            frame.setVisible(visible);

            return frame;
        },
        _loadPositionFrame: function(json){
            var frame = new studio.PositionFrame();

            var x = json[tlparam.X];
            var y = json[tlparam.Y];
            frame.setPosition(cc.p(x,y));

            return frame;

        },
        _loadScaleFrame: function(json){
            var frame = new studio.ScaleFrame();

            var scalex = json[tlparam.X];
            var scaley = json[tlparam.Y];

            frame.setScaleX(scalex);
            frame.setScaleY(scaley);

            return frame;
        },
        _loadSkewFrame: function(json){
            var frame = new studio.SkewFrame();

            var skewx = json[tlparam.X];
            var skewy = json[tlparam.Y];

            frame.setSkewX(skewx);
            frame.setSkewY(skewy);

            return frame;
        },
        _loadRotationSkewFrame: function(json){
            var frame = new studio.RotationSkewFrame();

            var skewx = json[tlparam.X];
            var skewy = json[tlparam.Y];

            frame.setSkewX(skewx);
            frame.setSkewY(skewy);

            return frame;

        },
        _loadRotationFrame: function(json){
            var frame = new studio.RotationFrame();

            var rotation = json[tlparam.ROTATION];
            frame.setRotation(rotation);

            return frame;
        },
        _loadAnchorPointFrame: function(json){
            var frame = new studio.AnchorPointFrame();

            var anchorx = json[tlparam.X];
            var anchory = json[tlparam.Y];

            frame.setAnchorPoint(Point(anchorx, anchory));

            return frame;
        },
        _loadInnerActionFrame: function(json){
            var frame = new studio.InnerActionFrame();

            var type = json[tlparam.INNER_ACTION];
            var startFrame = json[tlparam.START_FRAME];

            frame.setInnerActionType(type);
            frame.setStartFrameIndex(startFrame);

            return frame;
        },
        _loadColorFrame: function(json){
            var frame = new studio.ColorFrame();

            var alpha = json[tlparam.ALPHA];
            var red   = json[tlparam.RED];
            var green = json[tlparam.GREEN];
            var blue  = json[tlparam.BLUE];

            frame.setAlpha(alpha);
            frame.setColor(cc.color(red, green, blue));

            return frame;
        },
        _loadTextureFrame: function(json){
            var frame = new studio.TextureFrame();

            var texture = json[tlparam.Value];

            if(texture != null) {
                var path = texture;

                var spriteFrame = cc.spriteFrameCache.getSpriteFrame(path);
                if(spriteFrame == null)
                {
                    var jsonPath = studio.NodeReader.getJsonPath();
                    path = jsonPath + texture;
                }

                frame.setTextureName(path);
            }
            return frame;

        },
        _loadEventFrame: function(json){
            var frame = new studio.EventFrame();

            var evnt = json[tlparam.Value];

            if(evnt != null)
                frame.setEvent(evnt);

            return frame;
        },
        _loadZOrderFrame: function(json){
            var frame = new studio.ZOrderFrame();

            var zorder = json[tlparam.Value];
            frame.setZOrder(zorder);

            return frame;
        }


    };

    studio.ActionTimelineCache.init();

    studio.ActionTimelineCache._sharedActionCache = null;
})(ccs);
