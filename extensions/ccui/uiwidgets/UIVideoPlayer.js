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

ccui.VideoPlayer = ccui.Widget.extend({

    ctor: function(path){
        ccui.Widget.prototype.ctor.call(this);
        this._EventList = {};
        if(path)
            this.setURL(path);
    },

    _createRenderCmd: function(){
        return new ccui.VideoPlayer.RenderCmd(this);
    },

    /**
     * Set the video address
     * Automatically replace extname
     * All supported video formats will be added to the video
     * @param {String} address
     */
    setURL: function(address){
        this._renderCmd.updateURL(address);
    },

    /**
     * Get the video path
     * @returns {String}
     */
    getURL: function() {
        var video = this._renderCmd._video;
        if (video) {
            var source = video.getElementsByTagName("source");
            if (source && source[0])
                return source[0].src;
        }

        return "";
    },

    /**
     * Play the video
     */
    play: function(){
        var video = this._renderCmd._video;
        if(video)
            video.play();
    },

    /**
     * Pause the video
     */
    pause: function(){
        var video = this._renderCmd._video;
        if(video)
            video.pause();
    },

    /**
     * Resume the video
     */
    resume: function(){
        var video = this._renderCmd._video;
        if(video)
            video.play();
    },

    /**
     * Stop the video
     */
    stop: function(){
        var self = this,
            video = self._renderCmd._video;
        if(video){
            video.pause();
            video.currentTime = 0;
        }

        setTimeout(function(){
            self._dispatchEvent(ccui.VideoPlayer.EventType.STOPPED);
        }, 0);
    },
    /**
     * Jump to the specified point in time
     * @param {Number} sec
     */
    seekTo: function(sec){
        var video = this._renderCmd._video;
        if(video){
            video.currentTime = sec;
        }
    },

    /**
     * Whether the video is playing
     * @returns {boolean}
     */
    isPlaying: function(){
        var video = this._renderCmd._video;
        return (video && video.paused === false);
    },

    /**
     * Whether to keep the aspect ratio
     */
    setKeepAspectRatioEnabled: function(enable){
        cc.log("On the web is always keep the aspect ratio");
    },
    isKeepAspectRatioEnabled: function(){
        return false;
    },

    /**
     * Set whether the full screen
     * May appear inconsistent in different browsers
     * @param {boolean} enable
     */
    setFullScreenEnabled: function(enable){
        var video = this._renderCmd._video;
        if(video){
            if(enable)
                cc.screen.requestFullScreen(video);
            else
                cc.screen.exitFullScreen(video);
        }
    },

    /**
     * Determine whether already full screen
     */
    isFullScreenEnabled: function(){
        cc.log("Can't know status");
    },

    /**
     * The binding event
     * @param {ccui.VideoPlayer.EventType} event
     * @param {Function} callback
     */
    setEventListener: function(event, callback){
        this._EventList[event] = callback;
    },

    /**
     * Delete events
     * @param {ccui.VideoPlayer.EventType} event
     */
    removeEventListener: function(event){
        this._EventList[event] = null;
    },

    _dispatchEvent: function(event) {
        var callback = this._EventList[event];
        if (callback)
            callback.call(this, this, this._renderCmd._video.src);
    },

    /**
     * Trigger playing events
     */
    onPlayEvent: function(){
        var list = this._EventList[ccui.VideoPlayer.EventType.PLAYING];
        if(list)
            for(var i=0; i<list.length; i++)
                list[i].call(this, this, this._renderCmd._video.src);
    },

    //_createCloneInstance: function(){},
    //_copySpecialProperties: function(){},

    setContentSize: function(w, h){
        ccui.Widget.prototype.setContentSize.call(this, w, h);
        if(h === undefined){
            h = w.height;
            w = w.width;
        }
        this._renderCmd.changeSize(w, h);
    },

    cleanup: function(){
        this._renderCmd.removeDom();
        this.stopAllActions();
        this.unscheduleAllCallbacks();
    }

});

/**
 * The VideoPlayer support list of events
 * @type {{PLAYING: string, PAUSED: string, STOPPED: string, COMPLETED: string}}
 */
ccui.VideoPlayer.EventType = {
    PLAYING: "play",
    PAUSED: "pause",
    STOPPED: "stop",
    COMPLETED: "complete"
};

(function(video){
    /**
     * Adapter various machines
     * @devicePixelRatio Whether you need to consider devicePixelRatio calculated position
     * @event To get the data using events
     */
    video._polyfill = {
        devicePixelRatio: false,
        event: "canplay",
        canPlayType: []
    };

    (function(){
        var dom = document.createElement("video");
        if(dom.canPlayType("video/ogg"))
            video._polyfill.canPlayType.push(".ogg");
        if(dom.canPlayType("video/mp4"))
            video._polyfill.canPlayType.push(".mp4");
    })();

    if(cc.sys.OS_IOS === cc.sys.os){
        video._polyfill.devicePixelRatio = true;
        video._polyfill.event = "progress";
    }

})(ccui.VideoPlayer);

(function(polyfill){
    ccui.VideoPlayer.RenderCmd = function(node){
        cc.Node.CanvasRenderCmd.call(this, node);
        this._video = document.createElement("video");
        //this._video.controls = "controls";
        this._video.preload = "metadata";
        this._video.style["visibility"] = "hidden";
        this._loaded = false;
        this._listener = null;
        this.initStyle();
    };

    var proto = ccui.VideoPlayer.RenderCmd.prototype = Object.create(cc.Node.CanvasRenderCmd.prototype);
    proto.constructor = ccui.VideoPlayer.RenderCmd;

    proto.visit = function(){
        var self = this,
            container = cc.container,
            eventManager = cc.eventManager;
        if(this._node._visible){
            container.appendChild(this._video);
            if(this._listener === null)
                this._listener = cc.eventManager.addCustomListener(cc.game.EVENT_RESIZE, function () {
                    self.resize();
                });
        }else{
            var hasChild = false;
            if('contains' in container) {
                hasChild = container.contains(this._video);
            }else {
                hasChild = container.compareDocumentPosition(this._video) % 16;
            }
            if(hasChild)
                container.removeChild(this._video);
            var list = eventManager._listenersMap[cc.game.EVENT_RESIZE].getFixedPriorityListeners();
            eventManager._removeListenerInVector(list, this._listener);
            this._listener = null;
        }
        this.updateStatus();
    };

    proto.updateStatus = function(){
        polyfill.devicePixelRatio = cc.view.isRetinaEnabled();
        var flags = cc.Node._dirtyFlags, locFlag = this._dirtyFlag;
        if(locFlag & flags.transformDirty){
            //update the transform
            this.transform(this.getParentRenderCmd(), true);
            this.updateMatrix(this._worldTransform, cc.view._scaleX, cc.view._scaleY);
            this._dirtyFlag = this._dirtyFlag & cc.Node._dirtyFlags.transformDirty ^ this._dirtyFlag;
        }
    };

    proto.resize = function(view){
        view = view || cc.view;
        var node = this._node,
            eventManager = cc.eventManager;
        if(node._parent && node._visible)
            this.updateMatrix(this._worldTransform, view._scaleX, view._scaleY);
        else{
            var list = eventManager._listenersMap[cc.game.EVENT_RESIZE].getFixedPriorityListeners();
            eventManager._removeListenerInVector(list, this._listener);
            this._listener = null;
        }
    };

    proto.updateMatrix = function(t, scaleX, scaleY){
        var node = this._node;
        if(polyfill.devicePixelRatio){
            var dpr = window.devicePixelRatio;
            scaleX = scaleX / dpr;
            scaleY = scaleY / dpr;
        }
        if(this._loaded === false) return;
        var cw = node._contentSize.width,
            ch = node._contentSize.height;
        var a = t.a * scaleX,
            b = t.b,
            c = t.c,
            d = t.d * scaleY,
            tx = t.tx*scaleX - cw/2 + cw*node._scaleX/2*scaleX,
            ty = t.ty*scaleY - ch/2 + ch*node._scaleY/2*scaleY;
        var matrix = "matrix(" + a + "," + b + "," + c + "," + d + "," + tx + "," + -ty + ")";
        this._video.style["transform"] = matrix;
        this._video.style["-webkit-transform"] = matrix;
    };

    proto.updateURL = function(path){
        var video = this._video;
        var source = document.createElement("source");
        source.src = path;
        video.appendChild(source);
        var extname = cc.path.extname(path);
        for(var i=0; i<polyfill.canPlayType.length; i++){
            if(extname !== polyfill.canPlayType[i]){
                source = document.createElement("source");
                source.src = path.replace(extname, polyfill.canPlayType[i]);
                video.appendChild(source);
            }
        }
        var self = this;

        var cb = function(){
            self._loaded = true;
            self.setDirtyFlag(cc.Node._dirtyFlags.transformDirty);
            self.changeSize(0, 0);
            video.removeEventListener(polyfill.event, cb);
            video.style["visibility"] = "visible";
            //IOS does not display video images
            video.play();
            video.currentTime = 0;
            video.pause();
            video.currentTime = 0;
            setTimeout(function(){
                self.bindEvent();
            }, 0);
        };
        video.addEventListener(polyfill.event, cb);
    };

    proto.bindEvent = function(){
        var node = this._node,
            video = this._video;
        //binding event
        video.addEventListener("ended", function(){
            node._dispatchEvent(ccui.VideoPlayer.EventType.COMPLETED);
        });
        video.addEventListener("play", function(){
            node._dispatchEvent(ccui.VideoPlayer.EventType.PLAYING);
        });
        video.addEventListener("pause", function(){
            node._dispatchEvent(ccui.VideoPlayer.EventType.PAUSED);
        });
    };

    proto.initStyle = function(){
        if(!this._video)  return;
        var video = this._video;
        video.style.position = "absolute";
        video.style.bottom = "0px";
        video.style.left = "0px";
    };

    proto.changeSize = function(w, h){
        var video = this._video;
        if(video){
            if(w !== undefined && w !== 0)
                video.width = w;
            if(h !== undefined && h !== 0)
                video.height = h;
        }
    };

    proto.removeDom = function(){
        var video = this._video;
        if(video){
            var hasChild = false;
            if('contains' in cc.container) {
                hasChild = cc.container.contains(video);
            }else {
                hasChild = cc.container.compareDocumentPosition(video) % 16;
            }
            if(hasChild)
                cc.container.removeChild(video);
        }
    };

})(ccui.VideoPlayer._polyfill);