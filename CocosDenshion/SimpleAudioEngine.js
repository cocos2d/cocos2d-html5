/****************************************************************************
 Copyright (c) 2010-2012 cocos2d-x.org
 Copyright (c) 2008-2010 Ricardo Quesada
 Copyright (c) 2011      Zynga Inc.

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

var cc = cc || {};


/**
 * A simple Audio Engine engine API.
 * @class
 * @extends   cc.Class
 */
cc.AudioEngine = cc.Class.extend(/** @lends cc.AudioEngine# */{

    /**
     * Check each type to see if it can be played by current browser
     * @param capabilities: the results are filled into this dict
     * @protected
     */
    _checkCanPlay: function(capabilities) {
        var au = document.createElement('audio');
        if (au.canPlayType) {
            // <audio> tag is supported, go on
            function _check(typeStr) {
                var result = au.canPlayType(typeStr);
                return result != "no" && result != "";
            }

            capabilities.mp3 = _check("audio/mpeg");
            capabilities.mp4 = _check("audio/mp4");
            capabilities.m4a = _check("audio/x-m4a") || _check("audio/aac");
            capabilities.ogg = _check('audio/ogg; codecs="vorbis"');
            capabilities.wav = _check('audio/wav; codecs="1"');
        } else {
            // <audio> tag is not supported, nothing is supported
            var formats = ['mp3', 'mp4', 'm4a', 'ogg', 'wav'];
            for (var idx in formats) {
                capabilities[formats[idx]] = false;
            }
        }
    },

    /**
     * Helper function for cutting out the extension from the path
     * @param {string} fullpath
     * @protected
     */
    _getPathWithoutExt: function (fullpath) {
        if (typeof(fullpath) != "string") {
            return;
        }
        var endPos = fullpath.lastIndexOf(".");
        if (endPos != -1) {
            return fullpath.substring(0, endPos);
        }
        return fullpath;
    },

    /**
     * Helper function for extracting the extension from the path
     * @param {string} fullpath
     * @protected
     */
    _getExtFromFullPath: function (fullpath) {
        var startPos = fullpath.lastIndexOf(".");
        if (startPos != -1) {
            return fullpath.substring(startPos + 1, fullpath.length);
        }
        return -1;
    }
});



/**
 * the entity stored in soundList and effectList, containing the audio element and the extension name.
 * used in cc.SimpleAudioEngine
 */
cc.SimpleSFX = function (audio, ext) {
    this.audio = audio;
    this.ext = ext || ".ogg";
};

/**
 * The Audio Engine implementation via <audio> tag in HTML5.
 * @class
 * @extends   cc.AudioEngine
 */
cc.SimpleAudioEngine = cc.AudioEngine.extend(/** @lends cc.SimpleAudioEngine# */{
    _supportedFormat:[],
    _soundEnable:false,
    _effectList:{},
    _soundList:{},
    _playingMusic:null,
    _effectsVolume:1,
    _maxAudioInstance:10,
    _canPlay:true,
    _capabilities:{
        mp3:false,
        ogg:false,
        wav:false,
        mp4:false,
        m4a:false
    },

    /**
     * Constructor
     */
    ctor:function () {
        this._supportedFormat = [];

        this._checkCanPlay(this._capabilities);

        // enable sound if any of the audio format is supported
        this._soundEnable = this._capabilities.mp3 || this._capabilities.mp4
            || this._capabilities.m4a || this._capabilities.ogg
            || this._capabilities.wav;

        var ua = navigator.userAgent;
        if(/Mobile/.test(ua) && (/iPhone OS/.test(ua)||/iPad/.test(ua)||/Firefox/.test(ua)) || /MSIE/.test(ua)){
            this._canPlay = false;
        }
    },

    /**
     * Initialize sound type
     * @return {Boolean}
     */
    init:function () {
        // detect the prefered audio format
        this._getSupportedAudioFormat();
        return this._soundEnable;
    },

    /**
     * Preload music resource.<br />
     * This method is called when cc.Loader preload  resources.
     * @param {String} path The path of the music file with filename extension.
     */
    preloadSound:function (path) {
        if (this._soundEnable) {
            var extName = this._getExtFromFullPath(path);
            var keyname = this._getPathWithoutExt(path);
            if (this._checkAudioFormatSupported(extName) && !this._soundList.hasOwnProperty(keyname)) {
                if(this._canPlay){
                    var sfxCache = new cc.SimpleSFX();
                    sfxCache.ext = extName;
                    sfxCache.audio = new Audio(path);
                    sfxCache.audio.preload = 'auto';
                    sfxCache.audio.addEventListener('canplaythrough', function (e) {
                        cc.Loader.getInstance().onResLoaded();
                        this.removeEventListener('canplaythrough', arguments.callee, false);
                    }, false);

                    sfxCache.audio.addEventListener("error", function (e) {
                        cc.Loader.getInstance().onResLoadingErr(e.srcElement.src);
                        this.removeEventListener('error', arguments.callee, false);
                    }, false);

                    this._soundList[keyname] = sfxCache;
                    sfxCache.audio.load();
                }
                else{
                    cc.Loader.getInstance().onResLoaded();
                }
            }
            else {
                cc.Loader.getInstance().onResLoaded();
            }
        }

        //cc.Loader.getInstance().onResLoaded();
    },

    /**
     * Play music.
     * @param {String} path The path of the music file without filename extension.
     * @param {Boolean} loop Whether the music loop or not.
     * @example
     * //example
     * cc.AudioEngine.getInstance().playMusic(path, false);
     */
    playMusic:function (path, loop) {
        var keyname = this._getPathWithoutExt(path);
        var extName = this._getExtFromFullPath(path);
        var au;

        if (this._soundList.hasOwnProperty(this._playingMusic)) {
            this._soundList[this._playingMusic].audio.pause();
        }

        this._playingMusic = keyname;
        if (this._soundList.hasOwnProperty(this._playingMusic)) {
            au = this._soundList[this._playingMusic].audio;
        }
        else {
            var sfxCache = new cc.SimpleSFX();
            sfxCache.ext = extName;
            au = sfxCache.audio = new Audio(path);
            sfxCache.audio.preload = 'auto';
            this._soundList[keyname] = sfxCache;
            sfxCache.audio.load();
        }

        au.addEventListener("pause", this._musicListener , false);

        au.loop = loop || false;
        au.play();
        cc.AudioEngine.isMusicPlaying = true;
    },

    _musicListener:function(e){
        cc.AudioEngine.isMusicPlaying = false;
        this.removeEventListener('pause', arguments.callee, false);
    },

    /**
     * Stop playing music.
     * @param {Boolean} releaseData If release the music data or not.As default value is false.
     * @example
     * //example
     * cc.AudioEngine.getInstance().stopMusic();
     */
    stopMusic:function (releaseData) {
        if (this._soundList.hasOwnProperty(this._playingMusic)) {
            var au = this._soundList[this._playingMusic].audio;
            au.pause();
            au.currentTime = au.duration;
            if (releaseData) {
                delete this._soundList[this._playingMusic];
            }
            cc.AudioEngine.isMusicPlaying = false;
        }
    },

    /**
     * Pause playing music.
     * @example
     * //example
     * cc.AudioEngine.getInstance().pauseMusic();
     */
    pauseMusic:function () {
        if (this._soundList.hasOwnProperty(this._playingMusic)) {
            var au = this._soundList[this._playingMusic].audio;
            au.pause();
            cc.AudioEngine.isMusicPlaying = false;
        }
    },

    /**
     * Resume playing music.
     * @example
     * //example
     * cc.AudioEngine.getInstance().resumeMusic();
     */
    resumeMusic:function () {
        if (this._soundList.hasOwnProperty(this._playingMusic)) {
            var au = this._soundList[this._playingMusic].audio;
            au.play();
            au.addEventListener("pause", this._musicListener , false);
            cc.AudioEngine.isMusicPlaying = true;
        }
    },

    /**
     * Rewind playing music.
     * @example
     * //example
     * cc.AudioEngine.getInstance().rewindMusic();
     */
    rewindMusic:function () {
        if (this._soundList.hasOwnProperty(this._playingMusic)) {
            var au = this._soundList[this._playingMusic].audio;
            au.currentTime = 0;
            au.play();
            au.addEventListener("pause", this._musicListener , false);
            cc.AudioEngine.isMusicPlaying = true;
        }
    },

    willPlayMusic:function () {
        return false;
    },

    /**
     * The volume of the music max value is 1.0,the min value is 0.0 .
     * @return {Number}
     * @example
     * //example
     * var volume = cc.AudioEngine.getInstance().getMusicVolume();
     */
    getMusicVolume:function () {
        if (this._soundList.hasOwnProperty(this._playingMusic)) {
            return this._soundList[this._playingMusic].audio.volume;
        }
        return 0;
    },

    /**
     * Set the volume of music.
     * @param {Number} volume Volume must be in 0.0~1.0 .
     * @example
     * //example
     * cc.AudioEngine.getInstance().setMusicVolume(0.5);
     */
    setMusicVolume:function (volume) {
        if (this._soundList.hasOwnProperty(this._playingMusic)) {
            var music = this._soundList[this._playingMusic].audio;
            if (volume > 1) {
                music.volume = 1;
            }
            else if (volume < 0) {
                music.volume = 0;
            }
            else {
                music.volume = volume;
            }
        }
    },

    /**
     * Whether the music is playing.
     * @return {Boolean} If is playing return true,or return false.
     * @example
     * //example
     *  if (cc.AudioEngine.getInstance().isMusicPlaying()) {
     *      cc.log("music is playing");
     *  }
     *  else {
     *      cc.log("music is not playing");
     *  }
     */
    isMusicPlaying: function () {
        return cc.AudioEngine.isMusicPlaying;
    },

    /**
     * Play sound effect.
     * @param {String} path The path of the sound effect with filename extension.
     * @param {Boolean} loop Whether to loop the effect playing, default value is false
     * @example
     * //example
     * var soundId = cc.AudioEngine.getInstance().playEffect(path);
     */
    playEffect:function (path, loop) {
        var keyname = this._getPathWithoutExt(path), actExt;
        if (this._soundList.hasOwnProperty(keyname)) {
            actExt = this._soundList[keyname].ext;
        }
        else {
            actExt = this._getExtFromFullPath(path);
        }

        var reclaim = this._getEffectList(keyname), au;
        if (reclaim.length > 0) {
            for (var i = 0; i < reclaim.length; i++) {
                //if one of the effect ended, play it
                if (reclaim[i].ended) {
                    au = reclaim[i];
                    au.currentTime = 0;
                    break;
                }
            }
        }

        if (!au) {
            if (reclaim.length >= this._maxAudioInstance) {
                cc.log("Error: " + path + " greater than " + this._maxAudioInstance);
                return path;
            }
            au = new Audio(keyname + "." + actExt);
            au.volume = this._effectsVolume;
            reclaim.push(au);
        }

        if (loop) {
            au.loop = loop;
        }
        au.play();

        return path;
    },

    /**
     *The volume of the effects max value is 1.0,the min value is 0.0 .
     * @return {Number}
     * @example
     * //example
     * var effectVolume = cc.AudioEngine.getInstance().getEffectsVolume();
     */
    getEffectsVolume:function () {
        return this._effectsVolume;
    },

    /**
     * Set the volume of sound effecs.
     * @param {Number} volume Volume must be in 0.0~1.0 .
     * @example
     * //example
     * cc.AudioEngine.getInstance().setEffectsVolume(0.5);
     */
    setEffectsVolume:function (volume) {
        if (volume > 1) {
            this._effectsVolume = 1;
        }
        else if (volume < 0) {
            this._effectsVolume = 0;
        }
        else {
            this._effectsVolume = volume;
        }

        var tmpArr, au;
        for (var i in this._effectList) {
            tmpArr = this._effectList[i];
            if (tmpArr.length > 0) {
                for (var j = 0; j < tmpArr.length; j++) {
                    au = tmpArr[j];
                    au.volume = this._effectsVolume;
                }
            }
        }
    },

    /**
     * Pause playing sound effect.
     * @param {String} path The return value of function playEffect.
     * @example
     * //example
     * cc.AudioEngine.getInstance().pauseEffect(path);
     */
    pauseEffect:function (path) {
        if (!path) return;
        var keyname = this._getPathWithoutExt(path);
        if (this._effectList.hasOwnProperty(keyname)) {
            var tmpArr = this._effectList[keyname], au;
            for (var i = tmpArr.length - 1; i >= 0; i--) {
                au = tmpArr[i];
                if (!au.ended) {
                    au.pause();
                }
            }
        }
    },

    /**
     * Pause all playing sound effect.
     * @example
     * //example
     * cc.AudioEngine.getInstance().pauseAllEffects();
     */
    pauseAllEffects:function () {
        var tmpArr, au;
        for (var i in this._effectList) {
            tmpArr = this._effectList[i];
            for (var j = 0; j < tmpArr.length; j++) {
                au = tmpArr[j];
                if (!au.ended) {
                    au.pause();
                }
            }
        }
    },

    /**
     * Resume playing sound effect.
     * @param {String} path The return value of function playEffect.
     * @example
     * //example
     * cc.AudioEngine.getInstance().resumeEffect(path);
     */
    resumeEffect:function (path) {
        if (!path) return;
        var tmpArr, au;
        var keyname = this._getPathWithoutExt(path);
        if (this._effectList.hasOwnProperty(keyname)) {
            tmpArr = this._effectList[keyname];
            if (tmpArr.length > 0) {
                for (var i = 0; i < tmpArr.length; i++) {
                    au = tmpArr[i];
                    if (!au.ended) {
                        au.play();
                    }
                }
            }
        }
    },

    /**
     * Resume all playing sound effect
     * @example
     * //example
     * cc.AudioEngine.getInstance().resumeAllEffects();
     */
    resumeAllEffects:function () {
        var tmpArr, au;
        for (var i in this._effectList) {
            tmpArr = this._effectList[i];
            if (tmpArr.length > 0) {
                for (var j = 0; j < tmpArr.length; j++) {
                    au = tmpArr[j];
                    if (!au.ended) {
                        au.play();
                    }
                }
            }
        }
    },

    /**
     * Stop playing sound effect.
     * @param {String} path The return value of function playEffect.
     * @example
     * //example
     * cc.AudioEngine.getInstance().stopEffect(path);
     */
    stopEffect:function (path) {
        if (!path) return;
        var tmpArr, au;
        var keyname = this._getPathWithoutExt(path);
        if (this._effectList.hasOwnProperty(keyname)) {
            tmpArr = this._effectList[keyname];
            if (tmpArr.length > 0) {
                for (var i = 0; i < tmpArr.length; i++) {
                    au = tmpArr[i];
                    if (!au.ended) {
                        au.loop = false;
                        au.currentTime = au.duration;
                    }
                }
            }
        }
    },

    /**
     * Stop all playing sound effects.
     * @example
     * //example
     * cc.AudioEngine.getInstance().stopAllEffects();
     */
    stopAllEffects:function () {
        var tmpArr, au;
        for (var i in this._effectList) {
            tmpArr = this._effectList[i];
            for (var j = 0; j < tmpArr.length; j++) {
                au = tmpArr[j];
                if (!au.ended) {
                    au.loop = false;
                    au.currentTime = au.duration;
                }
            }
        }
    },

    /**
     * Unload the preloaded effect from internal buffer
     * @param {String} path
     * @example
     * //example
     * cc.AudioEngine.getInstance().unloadEffect(EFFECT_FILE);
     */
    unloadEffect:function (path) {
        if (!path) return;
        var keyname = this._getPathWithoutExt(path);
        if (this._effectList.hasOwnProperty(keyname)) {
            this.stopEffect(path);
            delete this._effectList[keyname];
        }
    },

    _getEffectList:function (elt) {
        if (this._effectList.hasOwnProperty(elt)) {
            return this._effectList[elt];
        }
        else {
            this._effectList[elt] = [];
            return this._effectList[elt];
        }
    },

    _checkAudioFormatSupported:function (ext) {
        var tmpExt;
        for (var i = 0; i < this._supportedFormat.length; i++) {
            tmpExt = this._supportedFormat[i];
            if (tmpExt == ext) {
                return true;
            }
        }
        return false;
    },

    _getSupportedAudioFormat:function () {
        // check for sound support by the browser
        if (!this._soundEnable) {
            return;
        }

        var formats = ['ogg', 'mp3', 'wav', 'mp4', 'm4a'];
        for (var idx in formats) {
            var name = formats[idx];
            if (this._capabilities[name]) {
                this._supportedFormat.push(name);
            }
        }
    }
});



/**
 * the entity stored in soundList and effectList, used in cc.WebAudioEngine
 */
cc.WebAudioSFX = function(key, sourceNode, volumeNode, startTime, pauseTime) {
    // the name of the relevant audio resource
    this.key = key;
    // the node used in Web Audio API in charge of the source data
    this.sourceNode = sourceNode;
    // the node used in Web Audio API in charge of volume
    this.volumeNode = volumeNode;
    /*
     * when playing started from beginning, startTime is set to the current time of AudioContext.currentTime
     * when paused, pauseTime is set to the current time of AudioContext.currentTime
     * so how long the music has been played can be calculated
     * these won't be used in other cases
     */
    this.startTime = startTime || 0;
    this.pauseTime = pauseTime || 0;
};

/**
 * The Audio Engine implementation via Web Audio API.
 * @class
 * @extends   cc.AudioEngine
 */
cc.WebAudioEngine = cc.AudioEngine.extend(/** @lends cc.WebAudioEngine# */{
    // the Web Audio Context
    _ctx: null,
    // may be: mp3, ogg, wav, mp4, m4a
    _supportedFormat: [],
    // if sound is not enabled, this engine's init() will return false
    _soundEnable: false,
    // TODO do I really know what this is?
    _canPlay: true,
    // containing all binary buffers of loaded audio resources
    _audioData: {},
    // the music being played now, cc.WebAudioSFX, when null, no music is being played; when not null, it may be paused
    _musicPlaying: null,
    // the volume applied to the music
    _musicVolume: 1,
    // the effects being played now, { key => cc.WebAudioSFX }, empty => no effects are currently being played
    _effectsPlaying: {},
    // the volume applied to all effects
    _effectsVolume: 1,

    // TODO following?
    _maxAudioInstance: 10,

    /**
     * Constructor
     */
    ctor: function() {},

    /**
     * Initialization
     * @return {Boolean}
     */
    init: function() {
        /*
         * browser has proved to support Web Audio API in miniFramework.js
         * only in that case will cc.WebAudioEngine be chosen to run, thus the following is guaranteed to work
         */
        this._ctx = new (window.AudioContext || window.webkitAudioContext || window.mozAudioContext)();

        // gather capabilities information, enable sound if any of the audio format is supported
        var capabilities = {};
        this._checkCanPlay(capabilities);

        var formats = ['ogg', 'mp3', 'wav', 'mp4', 'm4a'];
        for (var idx in formats) {
            var name = formats[idx];
            if (capabilities[name]) {
                this._supportedFormat.push(name);
            }
        }
        this._soundEnable = this._supportedFormat.length > 0;

        // TODO check if the following this._canPlay is still required
        var ua = navigator.userAgent;
        if(/Mobile/.test(ua) && (/iPhone OS/.test(ua)||/iPad/.test(ua)||/Firefox/.test(ua)) || /MSIE/.test(ua)){
            this._canPlay = false;
        }

        return this._soundEnable;
    },

    /**
     * search in this._supportedFormat if @param ext is there
     * @returns {boolean}
     * @private
     */
    _isFormatSupported: function(ext) {
        for (var idx in this._supportedFormat) {
            if (ext === this._supportedFormat[idx]) {
                return true;
            }
        }
        return false;
    },

    /**
     * Using XMLHttpRequest to retrieve the resource data from server.
     * Not using cc.FileUtils.getByteArrayFromFile() because it is synchronous,
     * so doing the retrieving here is more handful.
     * @param url: the url to retrieve data
     * @param onSuccess: the callback to run when retrieving succeeds, the binary data array is passed into it
     * @param onError: the callback to run when retrieving fails
     * @private
     */
    _fetchData: function(url, onSuccess, onError) {
        // currently, only the webkit browsers support Web Audio API, so it should be fine just writing like this.
        var req = new window.XMLHttpRequest();
        req.open('GET', url, true);
        req.responseType = 'arraybuffer';
        var engine = this;
        req.onload = function() {
            // when context decodes the array buffer successfully, call onSuccess
            engine._ctx.decodeAudioData(req.response, onSuccess, onError);
        };
        req.onerror = onError;
        req.send();
    },

    /**
     * Preload music resource.<br />
     * This method is called when cc.Loader preload  resources.
     * @param {String} path The path of the music file with filename extension.
     */
    preloadSound: function(path) {
        if (!this._soundEnable) {
            return;
        }

        var extName = this._getExtFromFullPath(path);
        var keyName = this._getPathWithoutExt(path);

        if (!this._isFormatSupported(extName) || keyName in this._audioData) {
            cc.Loader.getInstance().onResLoaded();
            return;
        }

        if (!this._canPlay) {
            // TODO not sure what this._canPlay means
            cc.Loader.getInstance().onResLoaded();
            return;
        }

        var engine = this;
        this._fetchData(path, function(buffer) {
            // resource fetched, in @param buffer
            engine._audioData[keyName] = buffer;
            cc.Loader.getInstance().onResLoaded();
        }, function() {
            // resource fetching failed
            cc.Loader.getInstance().onResLoadingErr(path);
        });
    },

    /**
     * Init a new WebAudioSFX and play it, return this WebAudioSFX object
     * assuming that @param key exists in this._audioData
     * @param key {String}
     * @param loop {Boolean}, default value: false
     * @param volume {float}: 0.0 - 1.0, default value: 1.0
     * @param offset {Long/Integer}: where to start playing (unit: seconds)
     * @private
     */
    _beginSound: function(key, loop, volume, offset) {
        var sfxCache = new cc.WebAudioSFX();
        loop = loop || false;
        volume = volume || 1;
        offset = offset || 0;

        sfxCache.key = key;
        sfxCache.sourceNode = this._ctx.createBufferSource();
        sfxCache.sourceNode.buffer = this._audioData[key];
        sfxCache.sourceNode.loop = loop;
        sfxCache.volumeNode = this._ctx.createGainNode();
        sfxCache.volumeNode.gain.value = volume;

        sfxCache.sourceNode.connect(sfxCache.volumeNode);
        sfxCache.volumeNode.connect(this._ctx.destination);

        // starting from offset means resuming from where it paused last time
        sfxCache.sourceNode.start(0, offset);
        // currentTime - offset is necessary for pausing multiple times!
        sfxCache.startTime = this._ctx.currentTime - offset;
        sfxCache.pauseTime = sfxCache.startTime;

        return sfxCache;
    },

    /**
     * Whether it is playing any music
     * @return {Boolean} If is playing return true,or return false.
     * @example
     * //example
     *  if (cc.AudioEngine.getInstance().isMusicPlaying()) {
     *      cc.log("music is playing");
     *  }
     *  else {
     *      cc.log("music is not playing");
     *  }
     */
    isMusicPlaying: function () {
        /*
         * cc.AudioEngine.isMusicPlaying property is not going to be used here in cc.WebAudioEngine
         * that is only used in cc.SimpleAudioEngine
         * WebAudioEngine uses Web Audio API which contains a playbackState property in AudioBufferSourceNode
         * So there is also no need to be any method like setMusicPlaying(), it is done automatically
         * According to the spec: dvcs.w3.org/hg/audio/raw-file/tip/webaudio/specification.html
         *      const unsigned short UNSCHEDULED_STATE = 0;
         *      const unsigned short SCHEDULED_STATE = 1;
         *      const unsigned short PLAYING_STATE = 2;     // this means it is playing
         *      const unsigned short FINISHED_STATE = 3;
         */
        return this._musicPlaying && this._musicPlaying.sourceNode.playbackState == 2;
    },

    /**
     * Play music.
     * @param {String} path The path of the music file without filename extension.
     * @param {Boolean} loop Whether the music loop or not.
     * @example
     * //example
     * cc.AudioEngine.getInstance().playMusic(path, false);
     */
    playMusic: function (path, loop) {
        var keyName = this._getPathWithoutExt(path);
        var extName = this._getExtFromFullPath(path);
        loop = loop || false;

        if (this._musicPlaying) {
            // there is a music being played currently, stop it (may be paused)
            this.stopMusic();
        }

        if (keyName in this._audioData) {
            // already loaded, just play it
            this._musicPlaying = this._beginSound(keyName, loop, this._musicVolume);
        } else if (this._isFormatSupported(extName)) {
            // if the resource type is not supported, there is no need to download it
            var engine = this;
            this._fetchData(path, function(buffer) {
                // resource fetched, in @param buffer
                engine._audioData[keyName] = buffer;
                engine._musicPlaying = engine._beginSound(keyName, loop, this._musicVolume);
            }, function() {
                // resource fetching failed, doing nothing here
            });
        }
    },

    /**
     * In addition to stop() or noteOff(), also disconnect the previously connected nodes
     * @private
     */
    _endSound: function(sfxCache) {
        if (!sfxCache) {
            return;
        }

        sfxCache.sourceNode.stop(0);
        // Do not call disconnect()! Otherwise the sourceNode's playbackState may not be updated correctly
        // sfxCache.sourceNode.disconnect();
        // sfxCache.volumeNode.disconnect();
    },

    /**
     * Stop playing music.
     * @param {Boolean} releaseData If release the music data or not.As default value is false.
     * @example
     * //example
     * cc.AudioEngine.getInstance().stopMusic();
     */
    stopMusic: function (releaseData) {
        // can stop when it's playing/paused
        if (!this._musicPlaying) {
            return;
        }

        var key = this._musicPlaying.key;
        this._endSound(this._musicPlaying);
        this._musicPlaying = null;

        if (releaseData) {
            delete this._audioData[key];
        }
    },

    /**
     * Pause playing music.
     * @example
     * //example
     * cc.AudioEngine.getInstance().pauseMusic();
     */
    pauseMusic: function () {
        // can pause only when it's playing
        if (!this.isMusicPlaying()) {
            return;
        }

        this._musicPlaying.pauseTime = this._ctx.currentTime;
        this._endSound(this._musicPlaying);
    },

    /**
     * Resume playing music.
     * @example
     * //example
     * cc.AudioEngine.getInstance().resumeMusic();
     */
    resumeMusic: function () {
        // can resume only when it's paused
        if (!this._musicPlaying || this.isMusicPlaying()) {
            return;
        }

        var key = this._musicPlaying.key;
        var loop = this._musicPlaying.sourceNode.loop;
        var volume = this.getMusicVolume();
        var offset = this._musicPlaying.pauseTime - this._musicPlaying.startTime;

        this._musicPlaying = this._beginSound(key, loop, volume, offset);
    },

    /**
     * Rewind playing music.
     * @example
     * //example
     * cc.AudioEngine.getInstance().rewindMusic();
     */
    rewindMusic: function () {
        // can rewind when it's playing or paused
        if (!this._musicPlaying) {
            return;
        }

        var key = this._musicPlaying.key;
        var loop = this._musicPlaying.sourceNode.loop;
        var volume = this.getMusicVolume();

        this._endSound(this._musicPlaying);
        this._musicPlaying = this._beginSound(key, loop, volume);
    },

    willPlayMusic: function () {
        // TODO what is the purpose of this method?
        return false;
    },

    /**
     * The volume of the music max value is 1.0,the min value is 0.0 .
     * @return {Number}
     * @example
     * //example
     * var volume = cc.AudioEngine.getInstance().getMusicVolume();
     */
    getMusicVolume: function () {
        return this._musicVolume;
    },

    /**
     * Set the volume of music.
     * @param {Number} volume Volume must be in 0.0~1.0 .
     * @example
     * //example
     * cc.AudioEngine.getInstance().setMusicVolume(0.5);
     */
    setMusicVolume: function (volume) {
        if (volume > 1) {
            volume = 1;
        } else if (volume < 0) {
            volume = 0;
        }

        if (this.getMusicVolume() == volume) {
            // it is the same, no need to update
            return;
        }

        this._musicVolume = volume;
        if (this._musicPlaying) {
            this._musicPlaying.volumeNode.gain.value = volume;
        }
    },

    /**
     * Play sound effect.
     * @param {String} path The path of the sound effect with filename extension.
     * @param {Boolean} loop Whether to loop the effect playing, default value is false
     * @example
     * //example
     * var soundId = cc.AudioEngine.getInstance().playEffect(path);
     */
    playEffect: function (path, loop) {
        // TODO
        return

        var keyname = this._getPathWithoutExt(path), actExt;
        if (this._soundList.hasOwnProperty(keyname)) {
            actExt = this._soundList[keyname].ext;
        }
        else {
            actExt = this._getExtFromFullPath(path);
        }

        var reclaim = this._getEffectList(keyname), au;
        if (reclaim.length > 0) {
            for (var i = 0; i < reclaim.length; i++) {
                //if one of the effect ended, play it
                if (reclaim[i].ended) {
                    au = reclaim[i];
                    au.currentTime = 0;
                    break;
                }
            }
        }

        if (!au) {
            if (reclaim.length >= this._maxAudioInstance) {
                cc.log("Error: " + path + " greater than " + this._maxAudioInstance);
                return path;
            }
            au = new Audio(keyname + "." + actExt);
            au.volume = this._effectsVolume;
            reclaim.push(au);
        }

        if (loop) {
            au.loop = loop;
        }
        au.play();

        return path;
    },

    /**
     *The volume of the effects max value is 1.0,the min value is 0.0 .
     * @return {Number}
     * @example
     * //example
     * var effectVolume = cc.AudioEngine.getInstance().getEffectsVolume();
     */
    getEffectsVolume: function () {
        return this._effectsVolume;
    },

    /**
     * Set the volume of sound effecs.
     * @param {Number} volume Volume must be in 0.0~1.0 .
     * @example
     * //example
     * cc.AudioEngine.getInstance().setEffectsVolume(0.5);
     */
    setEffectsVolume: function (volume) {
        if (volume > 1) {
            volume = 1;
        } else if (volume < 0) {
            volume = 0;
        }
        if (this.getEffectsVolume() == volume) {
            // it is the same, no need to update
            return;
        }

        this._effectsVolume = volume;
        // TODO update volume in each effect

        var tmpArr, au;
        for (var i in this._effectList) {
            tmpArr = this._effectList[i];
            if (tmpArr.length > 0) {
                for (var j = 0; j < tmpArr.length; j++) {
                    au = tmpArr[j];
                    au.volume = this._effectsVolume;
                }
            }
        }
    },

    /**
     * Pause playing sound effect.
     * @param {String} path The return value of function playEffect.
     * @example
     * //example
     * cc.AudioEngine.getInstance().pauseEffect(path);
     */
    pauseEffect: function (path) {
        // TODO
        return;

        if (!path) return;
        var keyname = this._getPathWithoutExt(path);
        if (this._effectList.hasOwnProperty(keyname)) {
            var tmpArr = this._effectList[keyname], au;
            for (var i = tmpArr.length - 1; i >= 0; i--) {
                au = tmpArr[i];
                if (!au.ended) {
                    au.pause();
                }
            }
        }
    },

    /**
     * Pause all playing sound effect.
     * @example
     * //example
     * cc.AudioEngine.getInstance().pauseAllEffects();
     */
    pauseAllEffects: function () {
        // TODO
        return;

        var tmpArr, au;
        for (var i in this._effectList) {
            tmpArr = this._effectList[i];
            for (var j = 0; j < tmpArr.length; j++) {
                au = tmpArr[j];
                if (!au.ended) {
                    au.pause();
                }
            }
        }
    },

    /**
     * Resume playing sound effect.
     * @param {String} path The return value of function playEffect.
     * @example
     * //example
     * cc.AudioEngine.getInstance().resumeEffect(path);
     */
    resumeEffect: function (path) {
        // TODO
        return;

        if (!path) return;
        var tmpArr, au;
        var keyname = this._getPathWithoutExt(path);
        if (this._effectList.hasOwnProperty(keyname)) {
            tmpArr = this._effectList[keyname];
            if (tmpArr.length > 0) {
                for (var i = 0; i < tmpArr.length; i++) {
                    au = tmpArr[i];
                    if (!au.ended) {
                        au.play();
                    }
                }
            }
        }
    },

    /**
     * Resume all playing sound effect
     * @example
     * //example
     * cc.AudioEngine.getInstance().resumeAllEffects();
     */
    resumeAllEffects: function () {
        // TODO
        return;

        var tmpArr, au;
        for (var i in this._effectList) {
            tmpArr = this._effectList[i];
            if (tmpArr.length > 0) {
                for (var j = 0; j < tmpArr.length; j++) {
                    au = tmpArr[j];
                    if (!au.ended) {
                        au.play();
                    }
                }
            }
        }
    },

    /**
     * Stop playing sound effect.
     * @param {String} path The return value of function playEffect.
     * @example
     * //example
     * cc.AudioEngine.getInstance().stopEffect(path);
     */
    stopEffect: function (path) {
        // TODO
        return;

        if (!path) return;
        var tmpArr, au;
        var keyname = this._getPathWithoutExt(path);
        if (this._effectList.hasOwnProperty(keyname)) {
            tmpArr = this._effectList[keyname];
            if (tmpArr.length > 0) {
                for (var i = 0; i < tmpArr.length; i++) {
                    au = tmpArr[i];
                    if (!au.ended) {
                        au.loop = false;
                        au.currentTime = au.duration;
                    }
                }
            }
        }
    },

    /**
     * Stop all playing sound effects.
     * @example
     * //example
     * cc.AudioEngine.getInstance().stopAllEffects();
     */
    stopAllEffects: function () {
        // TODO
        return;

        var tmpArr, au;
        for (var i in this._effectList) {
            tmpArr = this._effectList[i];
            for (var j = 0; j < tmpArr.length; j++) {
                au = tmpArr[j];
                if (!au.ended) {
                    au.loop = false;
                    au.currentTime = au.duration;
                }
            }
        }
    },

    /**
     * Unload the preloaded effect from internal buffer
     * @param {String} path
     * @example
     * //example
     * cc.AudioEngine.getInstance().unloadEffect(EFFECT_FILE);
     */
    unloadEffect: function (path) {
        // TODO
        return;

        if (!path) return;
        var keyname = this._getPathWithoutExt(path);
        if (this._effectList.hasOwnProperty(keyname)) {
            this.stopEffect(path);
            delete this._effectList[keyname];
        }
    },

    _getEffectList: function (elt) {
        // TODO
        return;

        if (this._effectList.hasOwnProperty(elt)) {
            return this._effectList[elt];
        }
        else {
            this._effectList[elt] = [];
            return this._effectList[elt];
        }
    }
});



cc.AudioEngine._instance = null;

cc.AudioEngine.isMusicPlaying = false;

/**
 * Get the shared Engine object, it will new one when first time be called.
 * @return {cc.AudioEngine}
 */
cc.AudioEngine.getInstance = function () {
    if (!this._instance) {
        if (cc.Browser.supportWebAudio) {
            this._instance = new cc.WebAudioEngine();
        } else {
            this._instance = new cc.SimpleAudioEngine();
        }
        this._instance.init();
    }
    return this._instance;
};


/**
 *  Stop all music and sound effects
 * @example
 * //example
 * cc.AudioEngine.end();
 */
cc.AudioEngine.end = function () {
    if (this._instance) {
        this._instance.stopMusic();
        this._instance.stopAllEffects();
    }
    this._instance = null;
};
