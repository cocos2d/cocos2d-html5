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
    _audioID:0,
    _audioIDList:null,
    ctor:function(){
        this._audioIDList = {};
    },
    /**
     * Check each type to see if it can be played by current browser
     * @param {Object} capabilities The results are filled into this dict
     * @protected
     */
    _checkCanPlay: function(capabilities) {
        var au = document.createElement('audio');
        if (au.canPlayType) {
            // <audio> tag is supported, go on
            var _check = function(typeStr) {
                var result = au.canPlayType(typeStr);
                return result != "no" && result != "";
            };

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
     * @param {String} fullpath
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
     * @param {String} fullpath
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
        cc.AudioEngine.prototype.ctor.call(this);

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
            if (this.isFormatSupported(extName) && !this._soundList.hasOwnProperty(keyname)) {
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
        var audioID = this._audioID++;
        this._audioIDList[audioID] = au;

        return audioID;
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
     * @param {Number} audioID The return value of function playEffect.
     * @example
     * //example
     * cc.AudioEngine.getInstance().pauseEffect(audioID);
     */
    pauseEffect:function (audioID) {
        if (audioID == null) return;

        if (this._audioIDList.hasOwnProperty(audioID)) {
            var au = this._audioIDList[audioID];
            if (!au.ended) {
                au.pause();
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
     * @param {Number} audioID The return value of function playEffect.
     * @audioID
     * //example
     * cc.AudioEngine.getInstance().resumeEffect(audioID);
     */
    resumeEffect:function (audioID) {
        if (audioID == null) return;

        if (this._audioIDList.hasOwnProperty(audioID)) {
            var au = this._audioIDList[audioID];
            if (!au.ended) {
                au.play();
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
     * @param {Number} audioID The return value of function playEffect.
     * @example
     * //example
     * cc.AudioEngine.getInstance().stopEffect(audioID);
     */
    stopEffect:function (audioID) {
        if (audioID == null) return;

        if (this._audioIDList.hasOwnProperty(audioID)) {
            var au = this._audioIDList[audioID];
            if (!au.ended) {
                au.loop = false;
                au.currentTime = au.duration;
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

        var au,pathName;
        for (var k in this._audioIDList) {
            au = this._audioIDList[k];
            pathName  = this._getPathWithoutExt(au.src);
            if(pathName == keyname){
                delete this._audioIDList[k];
            }
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

    /**
     * search in this._supportedFormat if @param ext is there
     * @param {String} ext
     * @returns {Boolean}
     */
    isFormatSupported:function (ext) {
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
 * The entity stored in cc.WebAudioEngine, representing a sound object
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
    // by only sourceNode's playbackState, it cannot distinguish finished state from paused state
    this.isPaused = false;
};

/**
 * The Audio Engine implementation via Web Audio API.
 * @class
 * @extends cc.AudioEngine
 */
cc.WebAudioEngine = cc.AudioEngine.extend(/** @lends cc.WebAudioEngine# */{
    // the Web Audio Context
    _ctx: null,
    // may be: mp3, ogg, wav, mp4, m4a
    _supportedFormat: [],
    // if sound is not enabled, this engine's init() will return false
    _soundEnable: false,
    // containing all binary buffers of loaded audio resources
    _audioData: {},
    /*
     *   Issue: When loading two resources with different suffixes asynchronously, the second one might start loading
     * when the first one is already loading!
     *   To avoid this duplication, loading synchronously somehow doesn't work. _ctx.decodeAudioData() would throw an
     * exception "DOM exception 12", it should be a bug of the browser.
     *   So just add something to mark some audios as LOADING so as to avoid duplication.
     */
    _audiosLoading: {},
    // the music being played, cc.WebAudioSFX, when null, no music is being played; when not null, it may be playing or paused
    _music: null,
    // the volume applied to the music
    _musicVolume: 1,
    // the effects being played: { key => [cc.WebAudioSFX] }, many effects of the same resource may be played simultaneously
    _effects: {},
    // the volume applied to all effects
    _effectsVolume: 1,

    /*
     * _canPlay is a property in cc.SimpleAudioEngine, but not used in cc.WebAudioEngine.
     * Only those which support Web Audio API will be using this cc.WebAudioEngine, so no need to add an extra check.
     */
    // _canPlay: true,
    /*
     * _maxAudioInstance is also a property in cc.SimpleAudioEngine, but not used here
     */
    // _maxAudioInstance: 10,


    /**
     * Constructor
     */
    ctor: function() {
        cc.AudioEngine.prototype.ctor.call(this);
    },

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

        return this._soundEnable;
    },

    /**
     * search in this._supportedFormat if @param ext is there
     * @param {String} ext
     * @returns {Boolean}
     */
    isFormatSupported: function(ext) {
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
     * @param {String} url The url to retrieve data
     * @param {Object} onSuccess The callback to run when retrieving succeeds, the binary data array is passed into it
     * @param {Object} onError The callback to run when retrieving fails
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

        // not supported, already loaded, already loading
        if (!this.isFormatSupported(extName) || keyName in this._audioData || keyName in this._audiosLoading) {
            cc.Loader.getInstance().onResLoaded();
            return;
        }

        this._audiosLoading[keyName] = true;
        var engine = this;
        this._fetchData(path, function(buffer) {
            // resource fetched, in @param buffer
            engine._audioData[keyName] = buffer;
            delete engine._audiosLoading[keyName];
            cc.Loader.getInstance().onResLoaded();
        }, function() {
            // resource fetching failed
            delete engine._audiosLoading[keyName];
            cc.Loader.getInstance().onResLoadingErr(path);
        });
    },

    /**
     * Init a new WebAudioSFX and play it, return this WebAudioSFX object
     * assuming that @param key exists in this._audioData
     * @param {String} key
     * @param {Boolean} loop Default value is false
     * @param {Number} volume 0.0 - 1.0, default value is 1.0
     * @param {Number} offset Where to start playing (in seconds)
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

        /*
         * Safari on iOS 6 only supports noteOn(), noteGrainOn(), and noteOff() now.(iOS 6.1.3)
         * The latest version of chrome has supported start() and stop()
         * start() & stop() are specified in the latest specification (written on 04/26/2013)
         *      Reference: https://dvcs.w3.org/hg/audio/raw-file/tip/webaudio/specification.html
         * noteOn(), noteGrainOn(), and noteOff() are specified in Draft 13 version (03/13/2012)
         *      Reference: http://www.w3.org/2011/audio/drafts/2WD/Overview.html
         */
        if (sfxCache.sourceNode.start) {
            // starting from offset means resuming from where it paused last time
            sfxCache.sourceNode.start(0, offset);
        } else if (sfxCache.sourceNode.noteGrainOn) {
            var duration = sfxCache.sourceNode.buffer.duration;
            if (loop) {
                /*
                 * On Safari on iOS 6, if loop == true, the passed in @param duration will be the duration from now on.
                 * In other words, the sound will keep playing the rest of the music all the time.
                 * On latest chrome desktop version, the passed in duration will only be the duration in this cycle.
                 * Now that latest chrome would have start() method, it is prepared for iOS here.
                 */
                sfxCache.sourceNode.noteGrainOn(0, offset, duration);
            } else {
                sfxCache.sourceNode.noteGrainOn(0, offset, duration - offset);
            }
        } else {
            // if only noteOn() is supported, resuming sound will NOT work
            sfxCache.sourceNode.noteOn(0);
        }

        // currentTime - offset is necessary for pausing multiple times!
        sfxCache.startTime = this._ctx.currentTime - offset;
        sfxCache.pauseTime = sfxCache.startTime;
        sfxCache.isPaused = false;

        return sfxCache;
    },

    /**
     * According to the spec: dvcs.w3.org/hg/audio/raw-file/tip/webaudio/specification.html
     *      const unsigned short UNSCHEDULED_STATE = 0;
     *      const unsigned short SCHEDULED_STATE = 1;
     *      const unsigned short PLAYING_STATE = 2;     // this means it is playing
     *      const unsigned short FINISHED_STATE = 3;
     * However, the older specification doesn't include this property, such as this one: http://www.w3.org/2011/audio/drafts/2WD/Overview.html
     * @param {Object} sfxCache Assuming not null
     * @returns {Boolean} Whether @param sfxCache is playing or not
     * @private
     */
    _isSoundPlaying: function(sfxCache) {
        return sfxCache.sourceNode.playbackState == 2;
    },

    /**
     * To distinguish 3 kinds of status for each sound (PLAYING, PAUSED, FINISHED), _isSoundPlaying() is not enough
     * @param {Object} sfxCache Assuming not null
     * @returns {Boolean}
     * @private
     */
    _isSoundPaused: function(sfxCache) {
        // checking _isSoundPlaying() won't hurt
        return this._isSoundPlaying(sfxCache) ? false : sfxCache.isPaused;
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
         */
        return this._music ? this._isSoundPlaying(this._music) : false;
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

        if (this._music) {
            // there is a music being played currently, stop it (may be paused)
            this.stopMusic();
        }

        if (keyName in this._audioData) {
            // already loaded, just play it
            this._music = this._beginSound(keyName, loop, this.getMusicVolume());
        } else if (this.isFormatSupported(extName) && !(keyName in this._audiosLoading)) {
            // load now only if the type is supported and it is not being loaded currently
            this._audiosLoading[keyName] = true;
            var engine = this;
            this._fetchData(path, function(buffer) {
                // resource fetched, save it and call playMusic() again, this time it should be alright
                engine._audioData[keyName] = buffer;
                delete engine._audiosLoading[keyName];
                engine.playMusic(path, loop);
            }, function() {
                // resource fetching failed, doing nothing here
                delete engine._audiosLoading[keyName];
                /*
                 * Potential Bug: if fetching data fails every time, loading will be tried again and again.
                 * Preloading would prevent this issue: if it fails to fetch, preloading procedure will not achieve 100%.
                 */
            });
        }
    },

    /**
     * Ends a sound, call stop() or noteOff() accordingly
     * @param {Object} sfxCache Assuming not null
     * @private
     */
    _endSound: function(sfxCache) {
        if (sfxCache.sourceNode.stop) {
            sfxCache.sourceNode.stop(0);
        } else {
            sfxCache.sourceNode.noteOff(0);
        }
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
    stopMusic: function(releaseData) {
        // can stop when it's playing/paused
        if (!this._music) {
            return;
        }

        var key = this._music.key;
        this._endSound(this._music);
        this._music = null;

        if (releaseData) {
            delete this._audioData[key];
        }
    },

    /**
     * Used in pauseMusic() & pauseEffect() & pauseAllEffects()
     * @param {Object} sfxCache Assuming not null
     * @private
     */
    _pauseSound: function(sfxCache) {
        sfxCache.pauseTime = this._ctx.currentTime;
        sfxCache.isPaused = true;
        this._endSound(sfxCache);
    },

    /**
     * Pause playing music.
     * @example
     * //example
     * cc.AudioEngine.getInstance().pauseMusic();
     */
    pauseMusic: function() {
        // can pause only when it's playing
        if (!this.isMusicPlaying()) {
            return;
        }

        this._pauseSound(this._music);
    },

    /**
     * Used in resumeMusic() & resumeEffect() & resumeAllEffects()
     * @param {Object} paused The paused WebAudioSFX, assuming not null
     * @param {Number} volume Can be getMusicVolume() or getEffectsVolume()
     * @returns {Object} A new WebAudioSFX object representing the resumed sound
     * @private
     */
    _resumeSound: function(paused, volume) {
        var key = paused.key;
        var loop = paused.sourceNode.loop;
        // the paused sound may have been playing several loops, (pauseTime - startTime) may be too large
        var offset = (paused.pauseTime - paused.startTime) % paused.sourceNode.buffer.duration;

        return this._beginSound(key, loop, volume, offset);
    },

    /**
     * Resume playing music.
     * @example
     * //example
     * cc.AudioEngine.getInstance().resumeMusic();
     */
    resumeMusic: function() {
        // can resume only when it's paused
        if (!this._music || !this._isSoundPaused(this._music)) {
            return;
        }

        this._music = this._resumeSound(this._music, this.getMusicVolume());
    },

    /**
     * Rewind playing music.
     * @example
     * //example
     * cc.AudioEngine.getInstance().rewindMusic();
     */
    rewindMusic: function() {
        // can rewind when it's playing or paused
        if (!this._music) {
            return;
        }

        var key = this._music.key;
        var loop = this._music.sourceNode.loop;
        var volume = this.getMusicVolume();

        this._endSound(this._music);
        this._music = this._beginSound(key, loop, volume);
    },

    willPlayMusic: function() {
        // TODO what is the purpose of this method? This is just a copy from cc.SimpleAudioEngine
        return false;
    },

    /**
     * The volume of the music max value is 1.0,the min value is 0.0 .
     * @return {Number}
     * @example
     * //example
     * var volume = cc.AudioEngine.getInstance().getMusicVolume();
     */
    getMusicVolume: function() {
        return this._musicVolume;
    },

    /**
     * update volume, used in setMusicVolume() or setEffectsVolume()
     * @param {Object} sfxCache Assuming not null
     * @param {Number} volume
     * @private
     */
    _setSoundVolume: function(sfxCache, volume) {
        sfxCache.volumeNode.gain.value = volume;
    },

    /**
     * Set the volume of music.
     * @param {Number} volume Volume must be in 0.0~1.0 .
     * @example
     * //example
     * cc.AudioEngine.getInstance().setMusicVolume(0.5);
     */
    setMusicVolume: function(volume) {
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
        if (this._music) {
            this._setSoundVolume(this._music, volume);
        }
    },

    /**
     * Play sound effect.
     * @param {String} path The path of the sound effect with filename extension.
     * @param {Boolean} loop Whether to loop the effect playing, default value is false
     * @example
     * //example
     * cc.AudioEngine.getInstance().playEffect(path);
     */
    playEffect: function(path, loop) {
        var keyName = this._getPathWithoutExt(path);
        var extName = this._getExtFromFullPath(path);
        loop = loop || false;

        if (keyName in this._audioData) {
            // the resource has been loaded, just play it
            if (!(keyName in this._effects)) {
                this._effects[keyName] = [];
            }
            // a list of sound objects from the same resource
            var effectList = this._effects[keyName];
            for (var idx in effectList) {
                var sfxCache = effectList[idx];
                if (!this._isSoundPlaying(sfxCache) && !this._isSoundPaused(sfxCache)) {
                    // not playing && not paused => it is finished, this position can be reused
                    effectList[idx] = this._beginSound(keyName, loop, this.getEffectsVolume());
                    return path;
                }
            }
            // no new sound was created to replace an old one in the list, then just append one
            effectList.push(this._beginSound(keyName, loop, this.getEffectsVolume()));
        } else if (this.isFormatSupported(extName) && !(keyName in this._audiosLoading)) {
            // load now only if the type is supported and it is not being loaded currently
            this._audiosLoading[keyName] = true;
            var engine = this;
            this._fetchData(path, function(buffer) {
                // resource fetched, save it and call playEffect() again, this time it should be alright
                engine._audioData[keyName] = buffer;
                delete engine._audiosLoading[keyName];
                engine.playEffect(path, loop);
            }, function() {
                // resource fetching failed, doing nothing here
                delete engine._audiosLoading[keyName];
                /*
                 * Potential Bug: if fetching data fails every time, loading will be tried again and again.
                 * Preloading would prevent this issue: if it fails to fetch, preloading procedure will not achieve 100%.
                 */
            });
        }

        // cc.SimpleAudioEngine returns path, just do the same for backward compatibility. DO NOT rely on this, though!
        var audioID = this._audioID++;
        this._audioIDList[audioID] = this._effects[keyName];

        return audioID;
    },

    /**
     * The volume of the effects max value is 1.0,the min value is 0.0 .
     * @return {Number}
     * @example
     * //example
     * var effectVolume = cc.AudioEngine.getInstance().getEffectsVolume();
     */
    getEffectsVolume: function() {
        return this._effectsVolume;
    },

    /**
     * Set the volume of sound effects.
     * @param {Number} volume Volume must be in 0.0~1.0 .
     * @example
     * //example
     * cc.AudioEngine.getInstance().setEffectsVolume(0.5);
     */
    setEffectsVolume: function(volume) {
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
        for (var key in this._effects) {
            var effectList = this._effects[key];
            for (var idx in effectList) {
                this._setSoundVolume(effectList[idx], volume);
            }
        }
    },

    /**
     * Used in pauseEffect() and pauseAllEffects()
     * @param {Object} effectList A list of sounds, each sound may be playing/paused/finished
     * @private
     */
    _pauseSoundList: function(effectList) {
        for (var idx in effectList) {
            var sfxCache = effectList[idx];
            if (this._isSoundPlaying(sfxCache)) {
                this._pauseSound(sfxCache);
            }
        }
    },

    /**
     * Pause playing sound effect.
     * @param {Number} audioID The return value of function playEffect.
     * @example
     * //example
     * cc.AudioEngine.getInstance().pauseEffect(audioID);
     */
    pauseEffect: function(audioID) {
        if (audioID == null) {
            return;
        }

        if (this._audioIDList.hasOwnProperty(audioID)) {
            this._pauseSoundList(this._audioIDList[audioID]);
        }
    },

    /**
     * Pause all playing sound effect.
     * @example
     * //example
     * cc.AudioEngine.getInstance().pauseAllEffects();
     */
    pauseAllEffects: function() {
        for (var key in this._effects) {
            this._pauseSoundList(this._effects[key]);
        }
    },

    /**
     * Used in resumeEffect() and resumeAllEffects()
     * @param {Object} effectList A list of sounds, each sound may be playing/paused/finished
     * @private
     */
    _resumeSoundList: function(effectList, volume) {
        for (var idx in effectList) {
            var sfxCache = effectList[idx];
            if (this._isSoundPaused(sfxCache)) {
                effectList[idx] = this._resumeSound(sfxCache, volume);
            }
        }
    },

    /**
     * Resume playing sound effect.
     * @param {Number} audioID The return value of function playEffect.
     * @example
     * //example
     * cc.AudioEngine.getInstance().resumeEffect(audioID);
     */
    resumeEffect: function(audioID) {
        if (audioID == null) {
            return;
        }

        if (this._audioIDList.hasOwnProperty(audioID)) {
            this._resumeSoundList(this._audioIDList[audioID], this.getEffectsVolume());
        }
    },

    /**
     * Resume all playing sound effect
     * @example
     * //example
     * cc.AudioEngine.getInstance().resumeAllEffects();
     */
    resumeAllEffects: function() {
        for (var key in this._effects) {
            this._resumeSoundList(this._effects[key], this.getEffectsVolume());
        }
    },

    /**
     * Stop playing sound effect.
     * @param {Number} audioID The return value of function playEffect.
     * @example
     * //example
     * cc.AudioEngine.getInstance().stopEffect(audioID);
     */
    stopEffect: function(audioID) {
        if (audioID == null) {
            return;
        }

        if (this._audioIDList.hasOwnProperty(audioID)) {
            this._endSound(this._audioIDList[audioID]);
        }
    },

    /**
     * Stop all playing sound effects.
     * @example
     * //example
     * cc.AudioEngine.getInstance().stopAllEffects();
     */
    stopAllEffects: function() {
        for (var key in this._effects) {
            var effectList = this._effects[key];
            for (var idx in effectList) {
                this._endSound(effectList[idx]);
            }
            /*
             * Another way is to set this._effects = {} outside this for loop.
             * However, the cc.Class.extend() put all properties in the prototype.
             * If I reassign a new {} to it, that will be appear in the instance.
             * In other words, the dict in prototype won't release its children.
             */
            delete this._effects[key];
        }
    },

    /**
     * Unload the preloaded effect from internal buffer
     * @param {String} path
     * @example
     * //example
     * cc.AudioEngine.getInstance().unloadEffect(EFFECT_FILE);
     */
    unloadEffect: function(path) {
        if (!path) {
            return;
        }

        var keyName = this._getPathWithoutExt(path);
        if (keyName in this._effects) {
            this.stopEffect(path);
        }

        if (keyName in this._audioData) {
            delete this._audioData[keyName];
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
        var ua = navigator.userAgent;
        if (cc.Browser.supportWebAudio && (/iPhone OS/.test(ua)||/iPad/.test(ua))) {
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
