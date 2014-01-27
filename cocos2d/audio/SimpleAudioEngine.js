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
    _supportedFormat:null,
    _soundSupported:false,                                        // if sound is not enabled, this engine's init() will return false
    _effectsVolume:1,                                              // the volume applied to all effects
    _playingMusic:null,                                           // the music being played, when null, no music is being played; when not null, it may be playing or paused
    _resPath : "",          //root path for resources
    _pausedPlayings: null,

    ctor:function(){
        this._audioIDList = {};
        this._supportedFormat = [];
        this._pausedPlayings = [];
    },

    /**
     * Set root path for music resources.
     * @param resPath
     */
    setResPath : function(resPath){
        if(!resPath || resPath.length == 0) return;
        this._resPath = resPath.substring(resPath.length - 1) == "/" ? resPath : resPath + "/";
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

            capabilities["mp3"] = _check("audio/mpeg");
            capabilities["mp4"] = _check("audio/mp4");
            capabilities["m4a"] = _check("audio/x-m4a") || _check("audio/aac");
            capabilities["ogg"] = _check('audio/ogg; codecs="vorbis"');
            capabilities["wav"] = _check('audio/wav; codecs="1"');
        } else {
            // <audio> tag is not supported, nothing is supported
            var formats = ["mp3", "mp4", "m4a", "ogg", "wav"];
            for (var idx in formats) {
                capabilities[formats[idx]] = false;
            }
        }
    },

    /**
     * Helper function for cutting out the extension from the path
     * @param {String} fullpath
     * @return {String|null} path without ext name
     * @protected
     */
    _getPathWithoutExt: function (fullpath) {
        if (typeof(fullpath) != "string") {
            return null;
        }
        var endPos = fullpath.lastIndexOf(".");
        if (endPos !== -1)
            return fullpath.substring(0, endPos);
        return fullpath;
    },

    /**
     * Helper function for extracting the extension from the path
     * @param {String} fullpath
     * @protected
     */
    _getExtFromFullPath: function (fullpath) {
        var startPos = fullpath.lastIndexOf(".");
        if (startPos !== -1) {
            return fullpath.substring(startPos + 1, fullpath.length);
        }
        return -1;
    },

    /**
     * Indicates whether any background music can be played or not.
     * @returns {boolean} <i>true</i> if the background music is playing, otherwise <i>false</i>
     */
    willPlayMusic: function() {
        return false;
    },

    /**
     * Preload music resource.
     * @param {String} path
     */
    preloadMusic:function(path){
        this.preloadSound(path);
    },

    /**
     * Preload effect resource.
     * @param {String} path
     */
    preloadEffect:function(path){
        this.preloadSound(path);
    },

    /**
     * search in this._supportedFormat if ext is there
     * @param {String} ext
     * @returns {Boolean}
     */
    isFormatSupported: function (ext) {
        var locSupportedFormat = this._supportedFormat;
        for (var i = 0, len = locSupportedFormat.length; i < len; i++) {
            if (locSupportedFormat[i] == ext)
                return true;
        }
        return false;
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
    _effectList:null,
    _soundList:null,
    _maxAudioInstance:5,
    _canPlay:true,
    _musicListenerBound:null,
    _musicIsStopped: false,

    /**
     * Constructor
     */
    ctor:function () {
        cc.AudioEngine.prototype.ctor.call(this);
        this._effectList = {};
        this._soundList = {};
        this._musicListenerBound = this._musicListener.bind(this);
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
        // gather capabilities information, enable sound if any of the audio format is supported
        var capabilities = {};
        this._checkCanPlay(capabilities);

        var formats = ["ogg", "mp3", "wav", "mp4", "m4a"], locSupportedFormat = this._supportedFormat;
        for (var idx in formats) {
            var name = formats[idx];
            if (capabilities[name])
                locSupportedFormat.push(name);
        }
        this._soundSupported = locSupportedFormat.length > 0;
        return this._soundSupported;
    },

    /**
     * Preload music resource.<br />
     * This method is called when cc.Loader preload  resources.
     * @param {String} path The path of the music file with filename extension.
     */
    preloadSound:function (path) {
        if (this._soundSupported) {
            var realPath = this._resPath + path;
            var extName = this._getExtFromFullPath(path);
            var keyname = this._getPathWithoutExt(path);
            if (!this._soundList[keyname] && this.isFormatSupported(extName)) {
                if(this._canPlay){
                    var sfxCache = new cc.SimpleSFX();
                    sfxCache.ext = extName;
                    sfxCache.audio = new Audio(realPath);
                    sfxCache.audio.preload = 'auto';
                    var soundPreloadCanplayHandler = function () {
                        cc.Loader.getInstance().onResLoaded();
                        this.removeEventListener('canplaythrough', soundPreloadCanplayHandler, false);
                        this.removeEventListener('error', soundPreloadErrorHandler, false);
                    };
                    var soundPreloadErrorHandler = function (e) {
                        cc.Loader.getInstance().onResLoadingErr(e.srcElement.src);
                        this.removeEventListener('canplaythrough', soundPreloadCanplayHandler, false);
                        this.removeEventListener('error', soundPreloadErrorHandler, false);
                    };
                    sfxCache.audio.addEventListener('canplaythrough', soundPreloadCanplayHandler, false);
                    sfxCache.audio.addEventListener("error", soundPreloadErrorHandler, false);

                    this._soundList[keyname] = sfxCache;
                    sfxCache.audio.load();
                    return;
                }
            }
        }
        cc.Loader.getInstance().onResLoaded();
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
        if (!this._soundSupported)
            return;

        var keyname = this._getPathWithoutExt(path);
        var extName = this._getExtFromFullPath(path);
        var au;

        var locSoundList = this._soundList;
        if (locSoundList[this._playingMusic])
            locSoundList[this._playingMusic].audio.pause();

        this._playingMusic = keyname;
        if (locSoundList[this._playingMusic])
            au = locSoundList[this._playingMusic].audio;
        else {
            var sfxCache = new cc.SimpleSFX();
            sfxCache.ext = extName;
            au = sfxCache.audio = new Audio(path);
            sfxCache.audio.preload = 'auto';
            locSoundList[keyname] = sfxCache;
            sfxCache.audio.load();
        }

        au.addEventListener("pause", this._musicListenerBound , false);
        au.loop = loop || false;
        au.play();
        cc.AudioEngine.isMusicPlaying = true;
        this._musicIsStopped = false;
    },

    _musicListener:function(e){
        cc.AudioEngine.isMusicPlaying = false;
        if (this._soundList[this._playingMusic]) {
            var au = this._soundList[this._playingMusic].audio;
            au.removeEventListener('pause', this._musicListener, false);
        }
    },

    /**
     * Stop playing music.
     * @param {Boolean} releaseData If release the music data or not.As default value is false.
     * @example
     * //example
     * cc.AudioEngine.getInstance().stopMusic();
     */
    stopMusic:function (releaseData) {
        var locSoundList = this._soundList, locPlayingMusic = this._playingMusic;
        if (locSoundList[locPlayingMusic]) {
            var au = locSoundList[locPlayingMusic].audio;
            au.pause();
            au.duration && (au.currentTime = au.duration);
            if (releaseData)
                delete locSoundList[locPlayingMusic];
            cc.AudioEngine.isMusicPlaying = false;
            this._musicIsStopped = true;
        }
    },

    /**
     * Pause playing music.
     * @example
     * //example
     * cc.AudioEngine.getInstance().pauseMusic();
     */
    pauseMusic:function () {
        if (!this._musicIsStopped && this._soundList[this._playingMusic]) {
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
        if (!this._musicIsStopped && this._soundList[this._playingMusic]) {
            var au = this._soundList[this._playingMusic].audio;
            au.play();
            au.addEventListener("pause", this._musicListenerBound , false);
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
        if (this._soundList[this._playingMusic]) {
            var au = this._soundList[this._playingMusic].audio;
            au.currentTime = 0;
            au.play();
            au.addEventListener("pause", this._musicListenerBound , false);
            cc.AudioEngine.isMusicPlaying = true;
            this._musicIsStopped = false;
        }
    },

    /**
     * The volume of the music max value is 1.0,the min value is 0.0 .
     * @return {Number}
     * @example
     * //example
     * var volume = cc.AudioEngine.getInstance().getMusicVolume();
     */
    getMusicVolume:function () {
        if (this._soundList[this._playingMusic]) {
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
        if (this._soundList[this._playingMusic]) {
            var music = this._soundList[this._playingMusic].audio;
            if (volume > 1) {
                music.volume = 1;
            } else if (volume < 0) {
                music.volume = 0;
            } else {
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
     * @return {Number|null} the audio id
     * @example
     * //example
     * var soundId = cc.AudioEngine.getInstance().playEffect(path);
     */
    playEffect: function (path, loop) {
        if (!this._soundSupported)
            return null;

        var keyname = this._getPathWithoutExt(path), actExt;
        if (this._soundList[keyname]) {
            actExt = this._soundList[keyname].ext;
        } else {
            actExt = this._getExtFromFullPath(path);
        }

        var reclaim = this._getEffectList(keyname), au;
        if (reclaim.length > 0) {
            for (var i = 0; i < reclaim.length; i++) {
                //if one of the effect ended, play it
                if (reclaim[i].ended) {
                    au = reclaim[i];
                    au.currentTime = 0;
                    if (window.chrome)
                        au.load();
                    break;
                }
            }
        }

        if (!au) {
            if (reclaim.length >= this._maxAudioInstance) {
                cc.log("Error: " + path + " greater than " + this._maxAudioInstance);
                return null;
            }
            au = new Audio(keyname + "." + actExt);
            au.volume = this._effectsVolume;
            reclaim.push(au);
        }

        if (loop)
            au.loop = loop;
        au.play();
        var audioID = this._audioID++;
        this._audioIDList[audioID] = au;
        return audioID;
    },

    /**
     * Set the volume of sound effects.
     * @param {Number} volume Volume must be in 0.0~1.0 .
     * @example
     * //example
     * cc.AudioEngine.getInstance().setEffectsVolume(0.5);
     */
    setEffectsVolume:function (volume) {
        if (volume > 1)
            this._effectsVolume = 1;
        else if (volume < 0)
            this._effectsVolume = 0;
        else
            this._effectsVolume = volume;

        var tmpArr, au, locEffectList = this._effectList;
        for (var key in locEffectList) {
            tmpArr = locEffectList[key];
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

        if (this._audioIDList[audioID]) {
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
        var locEffectList = this._effectList;
        for (var i in locEffectList) {
            tmpArr = locEffectList[i];
            for (var j = 0; j < tmpArr.length; j++) {
                au = tmpArr[j];
                if (!au.ended)
                    au.pause();
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

        if (this._audioIDList[audioID]) {
            var au = this._audioIDList[audioID];
            if (!au.ended)
                au.play();
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
        var locEffectList = this._effectList;
        for (var i in locEffectList) {
            tmpArr = locEffectList[i];
            if (tmpArr.length > 0) {
                for (var j = 0; j < tmpArr.length; j++) {
                    au = tmpArr[j];
                    if (!au.ended)
                        au.play();
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

        if (this._audioIDList[audioID]) {
            var au = this._audioIDList[audioID];
            if (!au.ended) {
                au.loop = false;
                au.duration && (au.currentTime = au.duration);
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
        var tmpArr, au, locEffectList = this._effectList;
        for (var i in locEffectList) {
            tmpArr = locEffectList[i];
            for (var j = 0; j < tmpArr.length; j++) {
                au = tmpArr[j];
                if (!au.ended) {
                    au.loop = false;
                    au.duration && (au.currentTime = au.duration);
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
        if (this._effectList[keyname]) {
            delete this._effectList[keyname];
        }

        var au, pathName, locAudioIDList = this._audioIDList;
        for (var k in locAudioIDList) {
            au = locAudioIDList[k];
            pathName  = this._getPathWithoutExt(au.src);
            if(pathName.indexOf(keyname) > -1){
                this.stopEffect(k);
                delete locAudioIDList[k];
            }
        }
    },

    _getEffectList:function (elt) {
        var locEffectList = this._effectList;
        if (locEffectList[elt]) {
            return locEffectList[elt];
        } else {
            locEffectList[elt] = [];
            return locEffectList[elt];
        }
    },

    _pausePlaying: function(){
        var locPausedPlayings = this._pausedPlayings, locSoundList = this._soundList;
        var tmpArr, au;
        if (!this._musicIsStopped && locSoundList[this._playingMusic]) {
            au = locSoundList[this._playingMusic].audio;
            if (!au.paused) {
                au.pause();
                cc.AudioEngine.isMusicPlaying = false;
                locPausedPlayings.push(au);
            }
        }

        var locEffectList = this._effectList;
        for (var selKey in locEffectList) {
            tmpArr = locEffectList[selKey];
            for (var j = 0; j < tmpArr.length; j++) {
                au = tmpArr[j];
                if (!au.ended && !au.paused) {
                    au.pause();
                    locPausedPlayings.push(au);
                }
            }
        }
    },

    _resumePlaying: function(){
        var locPausedPlayings = this._pausedPlayings, locSoundList = this._soundList;
        var tmpArr, au;
        if (!this._musicIsStopped && locSoundList[this._playingMusic]) {
            au = locSoundList[this._playingMusic].audio;
            if (locPausedPlayings.indexOf(au) !== -1) {
                au.play();
                au.addEventListener("pause", this._musicListenerBound, false);
                cc.AudioEngine.isMusicPlaying = true;
            }
        }

        var locEffectList = this._effectList;
        for (var selKey in locEffectList) {
            tmpArr = locEffectList[selKey];
            for (var j = 0; j < tmpArr.length; j++) {
                au = tmpArr[j];
                if (!au.ended && locPausedPlayings.indexOf(au) !== -1)
                    au.play();
            }
        }
        locPausedPlayings.length = 0;
    }
});

cc.PlayingTask = function(id, audio,isLoop, status){
    this.id = id;
    this.audio = audio;
    this.isLoop = isLoop || false;
    this.status = status || cc.PlayingTaskStatus.stop;
};

cc.PlayingTaskStatus = {playing:1, pause:2, stop:3, waiting:4};

cc.SimpleAudioEngineForMobile = cc.SimpleAudioEngine.extend({
    _playingList: null,
    _currentTask:null,
    _isPauseForList: false,
    _checkFlag: true,
    _audioEndedCallbackBound: null,

    ctor:function(){
        cc.SimpleAudioEngine.prototype.ctor.call(this);
        this._maxAudioInstance = 2;
        this._playingList = [];
        this._isPauseForList = false;
        this._checkFlag = true;
        this._audioEndedCallbackBound = this._audioEndCallback.bind(this);
    },

    _stopAllEffectsForList: function(){
        var tmpArr, au, locEffectList = this._effectList;
        for (var i in locEffectList) {
            tmpArr = locEffectList[i];
            for (var j = 0; j < tmpArr.length; j++) {
                au = tmpArr[j];
                if (!au.ended) {
                    au.removeEventListener('ended', this._audioEndedCallbackBound, false);
                    au.loop = false;
                    au.duration && (au.currentTime = au.duration);
                }
            }
        }
        this._playingList.length = 0;
        this._currentTask = null;
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
        if (!this._soundSupported)
            return;

        this._stopAllEffectsForList();

        var keyname = this._getPathWithoutExt(path);
        var extName = this._getExtFromFullPath(path);
        var au;

        var locSoundList = this._soundList;
        if (locSoundList[this._playingMusic]){
            var currMusic = locSoundList[this._playingMusic];
            currMusic.audio.removeEventListener("pause",this._musicListenerBound , false)
            currMusic.audio.pause();
        }

        this._playingMusic = keyname;
        if (locSoundList[this._playingMusic])
            au = locSoundList[this._playingMusic].audio;
        else {
            var sfxCache = new cc.SimpleSFX();
            sfxCache.ext = extName;
            au = sfxCache.audio = new Audio(path);
            sfxCache.audio.preload = 'auto';
            locSoundList[keyname] = sfxCache;
            sfxCache.audio.load();
        }

        au.addEventListener("pause", this._musicListenerBound , false);
        au.loop = loop || false;
        au.play();
        cc.AudioEngine.isMusicPlaying = true;
        this._musicIsStopped = false;
    },

    isMusicPlaying:function(){
        var locSoundList = this._soundList, locPlayingMusic = this._playingMusic;
        if (locSoundList[locPlayingMusic]) {
            var au = locSoundList[locPlayingMusic].audio;
            return (!au.paused && !au.ended);
        }
        return false;
    },

    _musicListener:function(){
        cc.AudioEngine.isMusicPlaying = false;
        if (this._soundList[this._playingMusic]) {
            var au = this._soundList[this._playingMusic].audio;
            au.removeEventListener('pause', this._musicListener, false);
        }
        if(this._checkFlag)
            this._isPauseForList = false;
        else
            this._checkFlag = true;
    },

    _stopExpiredTask:function(expendTime){
        var locPlayingList = this._playingList, locAudioIDList = this._audioIDList;
        for(var i = 0; i < locPlayingList.length; ){
            var selTask = locPlayingList[i];
            if ((selTask.status === cc.PlayingTaskStatus.waiting)){
                if (selTask.audio.currentTime + expendTime >= selTask.audio.duration) {
                    locPlayingList.splice(i, 1);
                    if (locAudioIDList[selTask.id]) {
                        var au = locAudioIDList[selTask.id];
                        if (!au.ended) {
                            au.removeEventListener('ended', this._audioEndedCallbackBound, false);
                            au.loop = false;
                            au.duration && (au.currentTime = au.duration);
                        }
                    }
                    continue;
                } else
                    selTask.audio.currentTime = selTask.audio.currentTime + expendTime;
            }
            i++;
        }
    },

    _audioEndCallback: function () {
        var locCurrentTask = this._currentTask;
        var expendTime = locCurrentTask.audio.currentTime;
        this._stopExpiredTask(expendTime);

        if (locCurrentTask.isLoop) {
            locCurrentTask.audio.play();
            return;
        }

        locCurrentTask.audio.removeEventListener('ended', this._audioEndedCallbackBound, false);
        cc.ArrayRemoveObject(this._playingList, locCurrentTask);

        locCurrentTask = this._getNextTaskToPlay();
        if (!locCurrentTask) {
            this._currentTask = null;
            if (this._isPauseForList) {
                this._isPauseForList = false;
                this.resumeMusic();
            }
        } else {
            this._currentTask = locCurrentTask;
            locCurrentTask.status = cc.PlayingTaskStatus.playing;
            locCurrentTask.audio.play();
        }
    },

    _pushingPlayingTask: function(playingTask){
        if(!playingTask)
            throw "cc.SimpleAudioEngineForMobile._pushingPlayingTask(): playingTask should be non-null.";

        var locPlayingTaskList = this._playingList;
        if(!this._currentTask){
            if(this.isMusicPlaying()){
                this._checkFlag = false;
                this.pauseMusic();
                this._isPauseForList = true;
            }
        }else{
            this._currentTask.status = cc.PlayingTaskStatus.waiting;
            this._currentTask.audio.pause();
        }
        locPlayingTaskList.push(playingTask);
        this._currentTask = playingTask;
        this._playingAudioTask(playingTask)
    },

    _playingAudioTask: function(playTask){
        playTask.audio.addEventListener("ended", this._audioEndedCallbackBound, false);
        playTask.audio.play();
        playTask.status = cc.PlayingTaskStatus.playing;
    },

    _getPlayingTaskFromList:function(audioID){
        var locPlayList = this._playingList;
        for(var i = 0, len = locPlayList.length;i< len;i++){
            if(locPlayList[i].id === audioID)
                return locPlayList[i];
        }
        return null;
    },

    _getNextTaskToPlay: function(){
        var locPlayingList = this._playingList;
        for(var i = locPlayingList.length -1; i >= 0; i--){
            var selTask = locPlayingList[i];
            if(selTask.status === cc.PlayingTaskStatus.waiting)
                return selTask;
        }
        return null;
    },

    _playingNextTask:function(){
        var locCurrentTask = this._currentTask = this._getNextTaskToPlay();
        if(locCurrentTask){
            locCurrentTask.status = cc.PlayingTaskStatus.playing;
            locCurrentTask.audio.play();
        } else {
            if(this._isPauseForList){
                this._isPauseForList = false;
                this.resumeMusic();
            }
        }
    },

    _deletePlayingTaskFromList: function(audioID){
        var locPlayList = this._playingList;
        for(var i = 0, len = locPlayList.length;i< len;i++){
            var selTask = locPlayList[i];
            if(selTask.id === audioID){
                locPlayList.splice(i,1);
                if(selTask == this._currentTask)
                    this._playingNextTask();
                return;
            }
        }
    },

    _pausePlayingTaskFromList: function (audioID) {
        var locPlayList = this._playingList;
        for (var i = 0, len = locPlayList.length; i < len; i++) {
            var selTask = locPlayList[i];
            if (selTask.id === audioID) {
                selTask.status = cc.PlayingTaskStatus.pause;
                if (selTask == this._currentTask)
                    this._playingNextTask();
                return;
            }
        }
    },

    _resumePlayingTaskFromList: function(audioID){
        var locPlayList = this._playingList;
        for (var i = 0, len = locPlayList.length; i < len; i++) {
            var selTask = locPlayList[i];
            if (selTask.id === audioID) {
                selTask.status = cc.PlayingTaskStatus.waiting;
                if(!this._currentTask){
                    var locCurrentTask = this._getNextTaskToPlay();
                    if(locCurrentTask){
                        //pause music
                        if(this.isMusicPlaying()){
                            this._checkFlag = false;
                            this.pauseMusic();
                            this._isPauseForList = true;
                        }
                        locCurrentTask.status = cc.PlayingTaskStatus.playing;
                        locCurrentTask.audio.play();
                    }
                }
                return;
            }
        }
    },

    /**
     * Play sound effect.
     * @param {String} path The path of the sound effect with filename extension.
     * @param {Boolean} loop Whether to loop the effect playing, default value is false
     * @return {Number|null} the audio id
     * @example
     * //example
     * var soundId = cc.AudioEngine.getInstance().playEffect(path);
     */
    playEffect: function (path, loop) {
        if (!this._soundSupported)
            return null;

        var keyname = this._getPathWithoutExt(path), actExt;
        if (this._soundList[keyname])
            actExt = this._soundList[keyname].ext;
        else
            actExt = this._getExtFromFullPath(path);

        var reclaim = this._getEffectList(keyname), au;
        if (reclaim.length > 0) {
            for (var i = 0; i < reclaim.length; i++) {
                //if one of the effect ended, play it
                if (reclaim[i].ended) {
                    au = reclaim[i];
                    au.currentTime = 0;
                    if (window.chrome)
                        au.load();
                    break;
                }
            }
        }

        if (!au) {
            if (reclaim.length >= this._maxAudioInstance) {
                cc.log("Error: " + path + " greater than " + this._maxAudioInstance);
                return null;
            }
            au = new Audio(keyname + "." + actExt);
            au.volume = this._effectsVolume;
            reclaim.push(au);
        }

        var playingTask = new cc.PlayingTask(this._audioID++, au, loop);
        this._pushingPlayingTask(playingTask);
        this._audioIDList[playingTask.id] = au;
        return playingTask.id;
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

        var strID = audioID.toString();
        if (this._audioIDList[strID]) {
            var au = this._audioIDList[strID];
            if (!au.ended) au.pause();
        }
        this._pausePlayingTaskFromList(audioID);
    },

    /**
     * Pause all playing sound effect.
     * @example
     * //example
     * cc.AudioEngine.getInstance().pauseAllEffects();
     */
    pauseAllEffects:function () {
        var tmpArr, au;
        var locEffectList = this._effectList;
        for (var selKey in locEffectList) {
            tmpArr = locEffectList[selKey];
            for (var j = 0; j < tmpArr.length; j++) {
                au = tmpArr[j];
                if (!au.ended) au.pause();
            }
        }

        var locPlayTask = this._playingList;
        for(var i = 0, len = locPlayTask.length; i < len; i++)
            locPlayTask[i].status = cc.PlayingTaskStatus.pause;
        this._currentTask = null;

        if(this._isPauseForList){
            this._isPauseForList = false;
            this.resumeMusic();
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

        if (this._audioIDList[audioID]) {
            var au = this._audioIDList[audioID];
            if (!au.ended)
                au.play();
        }
        this._resumePlayingTaskFromList(audioID);
    },

    /**
     * Resume all playing sound effect
     * @example
     * //example
     * cc.AudioEngine.getInstance().resumeAllEffects();
     */
    resumeAllEffects:function () {
        var tmpArr, au;
        var locEffectList = this._effectList;
        for (var selKey in locEffectList) {
            tmpArr = locEffectList[selKey];
            if (tmpArr.length > 0) {
                for (var j = 0; j < tmpArr.length; j++) {
                    au = tmpArr[j];
                    if (!au.ended) au.play();
                }
            }
        }

        var locPlayingList = this._playingList;
        for(var i = 0, len = locPlayingList.length; i < len; i++){
             var selTask = locPlayingList[i];
            if(selTask.status === cc.PlayingTaskStatus.pause)
                selTask.status = cc.PlayingTaskStatus.waiting;
        }
        if(this._currentTask == null){
            var locCurrentTask = this._getNextTaskToPlay();
            if(locCurrentTask){
                //pause music
                if(this.isMusicPlaying()){
                    this._checkFlag = false;
                    this.pauseMusic();
                    this._isPauseForList = true;
                }
                locCurrentTask.status = cc.PlayingTaskStatus.playing;
                locCurrentTask.audio.play();
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

        if (this._audioIDList[audioID]) {
            var au = this._audioIDList[audioID];
            if (!au.ended) {
                au.removeEventListener('ended', this._audioEndedCallbackBound, false);
                au.loop = false;
                au.duration && (au.currentTime = au.duration);
            }
        }
        this._deletePlayingTaskFromList(audioID);
    },

    /**
     * Stop all playing sound effects.
     * @example
     * //example
     * cc.AudioEngine.getInstance().stopAllEffects();
     */
    stopAllEffects:function () {
        var tmpArr, au, locEffectList = this._effectList;
        for (var i in locEffectList) {
            tmpArr = locEffectList[i];
            for (var j = 0; j < tmpArr.length; j++) {
                au = tmpArr[j];
                if (!au.ended) {
                    au.removeEventListener('ended', this._audioEndedCallbackBound, false);
                    au.loop = false;
                    au.duration && (au.currentTime = au.duration);
                }
            }
        }

        this._playingList.length = 0;
        this._currentTask = null;

        if(this._isPauseForList){
            this._isPauseForList = false;
            this.resumeMusic();
        }
    },

    _pausePlaying: function(){
        var locPausedPlayings = this._pausedPlayings, locSoundList = this._soundList, au;
        if (!this._musicIsStopped && locSoundList[this._playingMusic]) {
            au = locSoundList[this._playingMusic].audio;
            if (!au.paused) {
                au.pause();
                cc.AudioEngine.isMusicPlaying = false;
                locPausedPlayings.push(au);
            }
        }
        this.stopAllEffects();
    },

    _resumePlaying: function(){
        var locPausedPlayings = this._pausedPlayings, locSoundList = this._soundList, au;
        if (!this._musicIsStopped && locSoundList[this._playingMusic]) {
            au = locSoundList[this._playingMusic].audio;
            if (locPausedPlayings.indexOf(au) !== -1) {
                au.play();
                au.addEventListener("pause", this._musicListenerBound, false);
                cc.AudioEngine.isMusicPlaying = true;
            }
        }
        locPausedPlayings.length = 0;
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
    // containing all binary buffers of loaded audio resources
    _audioData: null,
    /*
     *   Issue: When loading two resources with different suffixes asynchronously, the second one might start loading
     * when the first one is already loading!
     *   To avoid this duplication, loading synchronously somehow doesn't work. _ctx.decodeAudioData() would throw an
     * exception "DOM exception 12", it should be a bug of the browser.
     *   So just add something to mark some audios as LOADING so as to avoid duplication.
     */
    _audiosLoading: null,
    // the volume applied to the music
    _musicVolume: 1,
    // the effects being played: { key => [cc.WebAudioSFX] }, many effects of the same resource may be played simultaneously
    _effects: null,

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
        this._audioData = {};
        this._audiosLoading = {};
        this._effects = {};
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

        var formats = ["ogg", "mp3", "wav", "mp4", "m4a"], locSupportedFormat = this._supportedFormat;
        for (var idx in formats) {
            var name = formats[idx];
            if (capabilities[name])
                locSupportedFormat.push(name);
        }
        this._soundSupported = locSupportedFormat.length > 0;
        return this._soundSupported;
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
        var realPath = this._resPath + url;
        req.open('GET', realPath, true);
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
        if (!this._soundSupported)
            return;

        var extName = this._getExtFromFullPath(path);
        var keyName = this._getPathWithoutExt(path);

        // not supported, already loaded, already loading
        if (this._audioData[keyName] || this._audiosLoading[keyName] || !this.isFormatSupported(extName)) {
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
     * assuming that key exists in this._audioData
     * @param {String} key
     * @param {Boolean} loop Default value is false
     * @param {Number} volume 0.0 - 1.0, default value is 1.0
     * @param {Number} [offset] Where to start playing (in seconds)
     * @private
     */
    _beginSound: function(key, loop, volume, offset) {
        var sfxCache = new cc.WebAudioSFX();
        loop = loop == null ? false : loop;
        volume = volume == null ? 1 : volume;
        offset = offset || 0;

        var locCtx = this._ctx;
        sfxCache.key = key;
        sfxCache.sourceNode = this._ctx.createBufferSource();
        sfxCache.sourceNode.buffer = this._audioData[key];
        sfxCache.sourceNode.loop = loop;
        if(locCtx.createGain)
            sfxCache.volumeNode = this._ctx.createGain();
        else
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
     * <p>
     * According to the spec: dvcs.w3.org/hg/audio/raw-file/tip/webaudio/specification.html                                      <br/>
     *      const unsigned short UNSCHEDULED_STATE = 0;                                                                          <br/>
     *      const unsigned short SCHEDULED_STATE = 1;                                                                            <br/>
     *      const unsigned short PLAYING_STATE = 2;     // this means it is playing                                              <br/>
     *      const unsigned short FINISHED_STATE = 3;                                                                             <br/>
     * However, the older specification doesn't include this property, such as this one: http://www.w3.org/2011/audio/drafts/2WD/Overview.html
     * </p>
     * @param {Object} sfxCache Assuming not null
     * @returns {Boolean} Whether sfxCache is playing or not
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
        return this._playingMusic ? this._isSoundPlaying(this._playingMusic) : false;
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

        if (this._playingMusic) {
            // there is a music being played currently, stop it (may be paused)
            this.stopMusic();
        }

        if (this._audioData[keyName]) {
            // already loaded, just play it
            this._playingMusic = this._beginSound(keyName, loop, this._musicVolume);
        } else if (!this._audiosLoading[keyName] && this.isFormatSupported(extName)) {
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
	    if (sfxCache.sourceNode.playbackState && sfxCache.sourceNode.playbackState == 3)
	        return;
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
     * @param {Boolean} [releaseData] If release the music data or not.As default value is false.
     * @example
     * //example
     * cc.AudioEngine.getInstance().stopMusic();
     */
    stopMusic: function(releaseData) {
        // can stop when it's playing/paused
        var locMusic = this._playingMusic;
        if (!locMusic)
            return;

        var key = locMusic.key;
        this._endSound(locMusic);
        this._playingMusic = null;

        if (releaseData)
            delete this._audioData[key];
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
        if (!this.isMusicPlaying())
            return;
        this._pauseSound(this._playingMusic);
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
        var locMusic = this._playingMusic;
        // can resume only when it's paused
        if (!locMusic || !this._isSoundPaused(locMusic)) {
            return;
        }
        this._playingMusic = this._resumeSound(locMusic, this.getMusicVolume());
    },

    /**
     * Rewind playing music.
     * @example
     * //example
     * cc.AudioEngine.getInstance().rewindMusic();
     */
    rewindMusic: function() {
        var locMusic = this._playingMusic;
        // can rewind when it's playing or paused
        if (!locMusic)
            return;

        var key = locMusic.key;
        var loop = locMusic.sourceNode.loop;
        var volume = this.getMusicVolume();

        this._endSound(locMusic);
        this._playingMusic = this._beginSound(key, loop, volume);
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
        if (volume > 1)
            volume = 1;
         else if (volume < 0)
            volume = 0;

        if (this.getMusicVolume() == volume)                   // it is the same, no need to update
            return;

        this._musicVolume = volume;
        if (this._playingMusic)
            this._setSoundVolume(this._playingMusic, volume);
    },

    /**
     * Play sound effect.
     * @param {String} path The path of the sound effect with filename extension.
     * @param {Boolean} loop Whether to loop the effect playing, default value is false
     * @return {Number|null}
     * @example
     * //example
     * cc.AudioEngine.getInstance().playEffect(path);
     */
    playEffect: function(path, loop) {
        var keyName = this._getPathWithoutExt(path), extName = this._getExtFromFullPath(path), audioID;

        loop = loop || false;

        if (this._audioData[keyName]) {
            // the resource has been loaded, just play it
            var locEffects = this._effects;
            if (!locEffects[keyName]) {
                locEffects[keyName] = [];
            }
            // a list of sound objects from the same resource
            var effectList = locEffects[keyName];
            for (var idx = 0, len = effectList.length; idx < len; idx++) {
                var sfxCache = effectList[idx];
                if (!this._isSoundPlaying(sfxCache) && !this._isSoundPaused(sfxCache)) {
                    // not playing && not paused => it is finished, this position can be reused
                    effectList[idx] = this._beginSound(keyName, loop, this.getEffectsVolume());
                    audioID = this._audioID++;
                    this._audioIDList[audioID] = effectList[idx];
                    return audioID;
                }
            }
            // no new sound was created to replace an old one in the list, then just append one
            var addSFX = this._beginSound(keyName, loop, this.getEffectsVolume());
            effectList.push(addSFX);
            audioID = this._audioID++;
            this._audioIDList[audioID] = addSFX;
            return audioID;
        } else if (!this._audiosLoading[keyName] && this.isFormatSupported(extName)) {
            // load now only if the type is supported and it is not being loaded currently
            this._audiosLoading[keyName] = true;
            var engine = this;
            audioID = this._audioID++;
            this._audioIDList[audioID] = null;
            this._fetchData(path, function(buffer) {
                // resource fetched, save it and call playEffect() again, this time it should be alright
                engine._audioData[keyName] = buffer;
                delete engine._audiosLoading[keyName];
                var asynSFX = engine._beginSound(keyName, loop, engine.getEffectsVolume());
                engine._audioIDList[audioID] = asynSFX;
                var locEffects = engine._effects;
                if (!locEffects[keyName])
                    locEffects[keyName] = [];
                locEffects[keyName].push(asynSFX);
            }, function() {
                // resource fetching failed, doing nothing here
                delete engine._audiosLoading[keyName];
                delete engine._audioIDList[audioID];
                /*
                 * Potential Bug: if fetching data fails every time, loading will be tried again and again.
                 * Preloading would prevent this issue: if it fails to fetch, preloading procedure will not achieve 100%.
                 */
            });
            return audioID;
        }
        return null;
    },

    /**
     * Set the volume of sound effects.
     * @param {Number} volume Volume must be in 0.0~1.0 .
     * @example
     * //example
     * cc.AudioEngine.getInstance().setEffectsVolume(0.5);
     */
    setEffectsVolume: function(volume) {
        if (volume > 1)
            volume = 1;
        else if (volume < 0)
            volume = 0;

        if (this._effectsVolume == volume) {
            // it is the same, no need to update
            return;
        }

        this._effectsVolume = volume;
        var locEffects = this._effects;
        for (var key in locEffects) {
            var effectList = locEffects[key];
            for (var idx = 0, len = effectList.length; idx < len; idx++)
                this._setSoundVolume(effectList[idx], volume);
        }
    },

    /**
     * Used in pauseEffect() and pauseAllEffects()
     * @param {Array} effectList A list of sounds, each sound may be playing/paused/finished
     * @private
     */
    _pauseSoundList: function(effectList) {
        for (var idx = 0, len = effectList.length; idx < len; idx++) {
            var sfxCache = effectList[idx];
            if (sfxCache && this._isSoundPlaying(sfxCache))
                this._pauseSound(sfxCache);
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
        if (audioID == null)
            return;

        if (this._audioIDList[audioID]){
            var sfxCache = this._audioIDList[audioID];
            if (sfxCache && this._isSoundPlaying(sfxCache))
                this._pauseSound(sfxCache);
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
     * @param {Array} effectList A list of sounds, each sound may be playing/paused/finished
     * @param {Number} volume
     * @private
     */
    _resumeSoundList: function(effectList, volume) {
        for (var idx = 0, len = effectList.length; idx < len; idx++) {
            var sfxCache = effectList[idx];
            if (this._isSoundPaused(sfxCache)) {
                effectList[idx] = this._resumeSound(sfxCache, volume);
                this._updateEffectsList(sfxCache, effectList[idx]);
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
        if (audioID == null)
            return;

        if (this._audioIDList[audioID]){
            var sfxCache = this._audioIDList[audioID];
            if (sfxCache && this._isSoundPaused(sfxCache)){
                this._audioIDList[audioID] = this._resumeSound(sfxCache, this.getEffectsVolume());
                this._updateEffectsList(sfxCache, this._audioIDList[audioID]);
            }
        }
    },

    _updateEffectsList:function(oldSFX, newSFX){
        var locEffects = this._effects, locEffectList;
        for(var eKey in locEffects){
            locEffectList = locEffects[eKey];
            for(var i = 0; i< locEffectList.length; i++){
                if(locEffectList[i] == oldSFX)
                    locEffectList[i] = newSFX;
            }
        }
    },

    /**
     * Resume all playing sound effect
     * @example
     * //example
     * cc.AudioEngine.getInstance().resumeAllEffects();
     */
    resumeAllEffects: function() {
        var locEffects = this._effects;
        for (var key in locEffects)
            this._resumeSoundList(locEffects[key], this.getEffectsVolume());
    },

    /**
     * Stop playing sound effect.
     * @param {Number} audioID The return value of function playEffect.
     * @example
     * //example
     * cc.AudioEngine.getInstance().stopEffect(audioID);
     */
    stopEffect: function(audioID) {
        if (audioID == null)
            return;

        var locAudioIDList = this._audioIDList;
        if (locAudioIDList[audioID])
            this._endSound(locAudioIDList[audioID]);
    },

    /**
     * Stop all playing sound effects.
     * @example
     * //example
     * cc.AudioEngine.getInstance().stopAllEffects();
     */
    stopAllEffects: function() {
        var locEffects = this._effects;
        for (var key in locEffects) {
            var effectList = locEffects[key];
            for (var idx = 0, len = effectList.length; idx < len; idx++)
                this._endSound(effectList[idx]);
            /*
             * Another way is to set this._effects = {} outside this for loop.
             * However, the cc.Class.extend() put all properties in the prototype.
             * If I reassign a new {} to it, that will be appear in the instance.
             * In other words, the dict in prototype won't release its children.
             */
            delete locEffects[key];
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
        if (!path)
            return;

        var keyName = this._getPathWithoutExt(path);
        if (this._effects[keyName]){
            var locEffect = this._effects[keyName];
            delete this._effects[keyName];
            var locAudioIDList = this._audioIDList;
            for(var auID in locAudioIDList){
                if(locEffect.indexOf(locAudioIDList[auID]) > -1){
                    this.stopEffect(auID);
                    delete locAudioIDList[auID];
                }
            }
        }

        if (this._audioData[keyName])
            delete this._audioData[keyName];
    },

    _pausePlaying: function(){
        var locPausedPlayings = this._pausedPlayings;
        if (this.isMusicPlaying()){
            locPausedPlayings.push(this._playingMusic);
            this._pauseSound(this._playingMusic);
        }

        var locEffects = this._effects;
        for (var selKey in locEffects) {
            var selEffectList = locEffects[selKey];
            for (var idx = 0, len = selEffectList.length; idx < len; idx++) {
                var sfxCache = selEffectList[idx];
                if (sfxCache && this._isSoundPlaying(sfxCache)) {
                    locPausedPlayings.push(sfxCache);
                    this._pauseSound(sfxCache);
                }
            }
        }
    },

    _resumePlaying: function(){
        var locPausedPlayings = this._pausedPlayings, locVolume = this.getMusicVolume();

        var locMusic = this._playingMusic;
        // can resume only when it's paused
        if (locMusic && this._isSoundPaused(locMusic) && locPausedPlayings.indexOf(locMusic) != -1)
            this._playingMusic = this._resumeSound(locMusic, locVolume);

        var locEffects = this._effects;
        for (var selKey in locEffects){
            var selEffects = locEffects[selKey];
            for (var idx = 0, len = selEffects.length; idx < len; idx++) {
                var sfxCache = selEffects[idx];
                if (this._isSoundPaused(sfxCache) &&locPausedPlayings.indexOf(sfxCache) != -1)  {
                    selEffects[idx] = this._resumeSound(sfxCache, locVolume);
                    this._updateEffectsList(sfxCache, selEffects[idx]);
                }
            }
        }
        locPausedPlayings.length = 0;
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
            if (cc.Browser.multipleAudioWhiteList.indexOf(cc.Browser.type) !== -1)
                this._instance = new cc.SimpleAudioEngine();
            else
                this._instance = new cc.SimpleAudioEngineForMobile();
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
