/****************************************************************************
 Copyright (c) 2008-2010 Ricardo Quesada
 Copyright (c) 2011-2012 cocos2d-x.org
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

if (cc.sys._supportWebAudio) {
    var _ctx = cc.webAudioContext = new (window.AudioContext || window.webkitAudioContext || window.mozAudioContext)();
    /**
     * A class of Web Audio.
     * @class
     * @param src
     * @extends cc.Class
     */
    cc.WebAudio = cc.Class.extend({
        _events: null,
        _buffer: null,
        _sourceNode: null,
        _volumeNode: null,

        src: null,
        preload: null,//"none" or "metadata" or "auto" or "" (empty string) or empty    TODO not used here
        autoplay: null,  //"autoplay" or "" (empty string) or empty
        controls: null,  //"controls" or "" (empty string) or empty    TODO not used here
        mediagroup: null,

        //The following IDL attributes and methods are exposed to dynamic scripts.
        currentTime: 0,
        startTime: 0,
        duration: 0,   //    TODO not used here

        _loop: null,      //"loop" or "" (empty string) or empty
        _volume: 1,

        _pauseTime: 0,
        _paused: false,
        _stopped: true,

        _loadState: -1,//-1 : not loaded, 0 : waiting, 1 : loaded, -2 : load failed

        /**
         * Constructor function, override it to extend the construction behavior, remember to call "this._super()" in the extended "ctor" function.
         * @param src
         */
        ctor: function (src) {
            var self = this;
            self._events = {};
            self.src = src;

            if (_ctx["createGain"])
                self._volumeNode = _ctx["createGain"]();
            else
                self._volumeNode = _ctx["createGainNode"]();

            self._onSuccess1 = self._onSuccess.bind(this);
            self._onError1 = self._onError.bind(this);
        },

        _play: function (offset) {
            var self = this;
            var sourceNode = self._sourceNode = _ctx["createBufferSource"]();
            var volumeNode = self._volumeNode;
            offset = offset || 0;

            sourceNode.buffer = self._buffer;
            volumeNode["gain"].value = self._volume;
            sourceNode["connect"](volumeNode);
            volumeNode["connect"](_ctx["destination"]);
            sourceNode.loop = self._loop;
            sourceNode._stopped = false;

            if(!sourceNode["playbackState"]){
                sourceNode["onended"] = function(){
                    this._stopped = true;
                };
            }

            self._paused = false;
            self._stopped = false;

            /*
             * Safari on iOS 6 only supports noteOn(), noteGrainOn(), and noteOff() now.(iOS 6.1.3)
             * The latest version of chrome has supported start() and stop()
             * start() & stop() are specified in the latest specification (written on 04/26/2013)
             *      Reference: https://dvcs.w3.org/hg/audio/raw-file/tip/webaudio/specification.html
             * noteOn(), noteGrainOn(), and noteOff() are specified in Draft 13 version (03/13/2012)
             *      Reference: http://www.w3.org/2011/audio/drafts/2WD/Overview.html
             */
            if (sourceNode.start) {
                // starting from offset means resuming from where it paused last time
                sourceNode.start(0, offset);
            } else if (sourceNode["noteGrainOn"]) {
                var duration = sourceNode.buffer.duration;
                if (self.loop) {
                    /*
                     * On Safari on iOS 6, if loop == true, the passed in @param duration will be the duration from now on.
                     * In other words, the sound will keep playing the rest of the music all the time.
                     * On latest chrome desktop version, the passed in duration will only be the duration in this cycle.
                     * Now that latest chrome would have start() method, it is prepared for iOS here.
                     */
                    sourceNode["noteGrainOn"](0, offset, duration);
                } else {
                    sourceNode["noteGrainOn"](0, offset, duration - offset);
                }
            } else {
                // if only noteOn() is supported, resuming sound will NOT work
                sourceNode["noteOn"](0);
            }
            self._pauseTime = 0;
        },

        _stop: function () {
            var self = this, sourceNode = self._sourceNode;
            if (self._stopped)
                return;
            if (sourceNode.stop)
                sourceNode.stop(0);
            else
                sourceNode.noteOff(0);
            self._stopped = true;
        },

        /**
         * Play the audio.
         */
        play: function () {
            var self = this;
            if (self._loadState == -1) {
                self._loadState = 0;
                return;
            } else if (self._loadState != 1)
                return;

            var sourceNode = self._sourceNode;
            if (!self._stopped && sourceNode && (sourceNode["playbackState"] == 2 || !sourceNode._stopped))
                return;//playing

            self.startTime = _ctx.currentTime;
            this._play(0);
        },

        /**
         * Pause the audio.
         */
        pause: function () {
            this._pauseTime = _ctx.currentTime;
            this._paused = true;
            this._stop();
        },

        /**
         * Resume the pause audio.
         */
        resume: function () {
            var self = this;
            if (self._paused) {
                var offset = self._buffer ? (self._pauseTime - self.startTime) % self._buffer.duration : 0;
                this._play(offset);
            }
        },

        /**
         * Stop the play audio.
         */
        stop: function () {
            this._pauseTime = 0;
            this._paused = false;
            this._stop();
        },

        /**
         * Load this audio.
         */
        load: function () {
            var self = this;
            if (self._loadState == 1)
                return;
            self._loadState = -1;//not loaded

            self.played = false;
            self.ended = true;
            var request = new XMLHttpRequest();
            request.open("GET", self.src, true);
            request.responseType = "arraybuffer";

            // Our asynchronous callback
            request.onload = function () {
                _ctx["decodeAudioData"](request.response, self._onSuccess1, self._onError1);
            };
            request.send();
        },

        /**
         * Bind event to the audio element.
         * @param {String} eventName
         * @param {Function} event
         */
        addEventListener: function (eventName, event) {
            this._events[eventName] = event.bind(this);
        },

        /**
         * Remove event of audio element.
         * @param {String} eventName
         */
        removeEventListener: function (eventName) {
            delete this._events[eventName];
        },

        /**
         * Checking webaudio support.
         * @returns {Boolean}
         */
        canplay: function () {
            return cc.sys._supportWebAudio;
        },

        _onSuccess: function (buffer) {
            var self = this;
            self._buffer = buffer;

            var success = self._events["success"], canplaythrough = self._events["canplaythrough"];
            if (success)
                success();
            if (canplaythrough)
                canplaythrough();
            if (self._loadState == 0 || self.autoplay == "autoplay" || self.autoplay == true)
                self._play();
            self._loadState = 1;//loaded
        },

        _onError: function () {
            var error = this._events["error"];
            if (error)
                error();
            this._loadState = -2;//load failed
        },

        /**
         * to copy object with deep copy.
         *
         * @return {cc.WebAudio}
         */
        cloneNode: function () {
            var self = this, obj = new cc.WebAudio(self.src);
            obj.volume = self.volume;
            obj._loadState = self._loadState;
            obj._buffer = self._buffer;
            if (obj._loadState == 0 || obj._loadState == -1)
                obj.load();
            return obj;
        }

    });
    var _p = cc.WebAudio.prototype;
    /** @expose */
    _p.loop;
    cc.defineGetterSetter(_p, "loop", function () {
        return this._loop;
    }, function (loop) {
        this._loop = loop;
        if (this._sourceNode)
            this._sourceNode.loop = loop;
    });
    /** @expose */
    _p.volume;
    cc.defineGetterSetter(_p, "volume", function () {
        return this._volume;
    }, function (volume) {
        this._volume = volume;
        this._volumeNode["gain"].value = volume;
    });
    /** @expose */
    _p.paused;
    cc.defineGetterSetter(_p, "paused", function () {
        return this._paused;
    });
    /** @expose */
    _p.ended;
    cc.defineGetterSetter(_p, "ended", function () {
        var sourceNode = this._sourceNode;
        if(this._paused)
           return false;
        if(this._stopped && !sourceNode)
            return true;
        if(sourceNode["playbackState"] == null)
            return sourceNode._stopped;
        else
            return sourceNode["playbackState"] == 3;
    });
    /** @expose */
    _p.played;
    cc.defineGetterSetter(_p, "played", function () {
        var sourceNode = this._sourceNode;
        return sourceNode && (sourceNode["playbackState"] == 2 || !sourceNode._stopped);
    });
}

/**
 * cc.audioEngine is the singleton object, it provide simple audio APIs.
 * @class
 * @name cc.audioEngine
 */
cc.AudioEngine = cc.Class.extend(/** @lends cc.audioEngine# */{
    _soundSupported: false,      // if sound is not enabled, this engine's init() will return false

    _currMusic: null,
    _currMusicPath: null,
    _musicPlayState: 0, //0 : stopped, 1 : paused, 2 : playing

    _audioID: 0,
    _effects: {},        //effects cache
    _audioPool: {},    //audio pool for effects
    _effectsVolume: 1,   // the volume applied to all effects
    _maxAudioInstance: 5,//max count of audios that has same url

    _effectPauseCb: null,

    _playings: [],//only store when window is hidden

    /**
     * Constructor function, override it to extend the construction behavior, remember to call "this._super()" in the extended "ctor" function.
     */
    ctor: function () {
        var self = this;
        self._soundSupported = cc._audioLoader._supportedAudioTypes.length > 0;
        if (self._effectPauseCb)
            self._effectPauseCb = self._effectPauseCb.bind(self);
    },

    /**
     * Indicates whether any background music can be played or not.
     * @returns {boolean} <i>true</i> if the background music is playing, otherwise <i>false</i>
     */
    willPlayMusic: function () {
        return false;
    },

    /**
     * The volume of the effects max value is 1.0,the min value is 0.0 .
     * @return {Number}
     * @example
     * //example
     * var effectVolume = cc.audioEngine.getEffectsVolume();
     */
    getEffectsVolume: function () {
        return this._effectsVolume;
    },

    //music begin
    /**
     * Play music.
     * @param {String} url The path of the music file without filename extension.
     * @param {Boolean} loop Whether the music loop or not.
     * @example
     * //example
     * cc.audioEngine.playMusic(path, false);
     */
    playMusic: function (url, loop) {
        var self = this;
        if (!self._soundSupported)
            return;

        var audio = self._currMusic;
        if (audio)
            this._stopAudio(audio);
        if(cc.sys.isMobile && cc.sys.os == cc.sys.OS_IOS){
            audio = self._getAudioByUrl(url);
            self._currMusic = audio.cloneNode();
            self._currMusicPath = url;
        }else{
            if (url != self._currMusicPath) {
                audio = self._getAudioByUrl(url);
                self._currMusic = audio;
                self._currMusicPath = url;
            }
        }
        if (!self._currMusic)
            return;
        self._currMusic.loop = loop || false;
        self._playMusic(self._currMusic);
    },

    _getAudioByUrl: function (url) {
        var locLoader = cc.loader, audio = locLoader.getRes(url);
        if (!audio) {
            locLoader.load(url);
            audio = locLoader.getRes(url);
        }
        return audio;
    },

    _playMusic: function (audio) {
        if (!audio.ended) {
            if (audio.stop) {//cc.WebAudio
                audio.stop();
            } else {
                audio.pause();
                if (audio.readyState > 2)
                    audio.currentTime = 0;
            }
        }
        this._musicPlayState = 2;
        audio.play();
    },

    /**
     * Stop playing music.
     * @param {Boolean} [releaseData] If release the music data or not.As default value is false.
     * @example
     * //example
     * cc.audioEngine.stopMusic();
     */
    stopMusic: function (releaseData) {
        if (this._musicPlayState > 0) {
            var audio = this._currMusic;
            if (!audio) return;
            if (!this._stopAudio(audio))
                return;
            if (releaseData)
                cc.loader.release(this._currMusicPath);
            this._currMusic = null;
            this._currMusicPath = null;
            this._musicPlayState = 0;
        }
    },

    _stopAudio: function (audio) {
        if (audio && !audio.ended) {
            if (audio.stop) {//cc.WebAudio
                audio.stop();
            } else {
                audio.pause();
                if (audio.readyState > 2 && audio.duration && audio.duration != Infinity)
                    audio.currentTime = audio.duration;
            }
            return true;
        }
        return false;
    },

    /**
     * Pause playing music.
     * @example
     * //example
     * cc.audioEngine.pauseMusic();
     */
    pauseMusic: function () {
        if (this._musicPlayState == 2) {
            this._currMusic.pause();
            this._musicPlayState = 1;
        }
    },

    /**
     * Resume playing music.
     * @example
     * //example
     * cc.audioEngine.resumeMusic();
     */
    resumeMusic: function () {
        if (this._musicPlayState == 1) {
            var audio = this._currMusic;
            this._resumeAudio(audio);
            this._musicPlayState = 2;
        }
    },

    _resumeAudio: function (audio) {
        if (audio && !audio.ended) {
            if (audio.resume)
                audio.resume();//cc.WebAudio
            else
                audio.play();
        }
    },

    /**
     * Rewind playing music.
     * @example
     * //example
     * cc.audioEngine.rewindMusic();
     */
    rewindMusic: function () {
        if (this._currMusic)
            this._playMusic(this._currMusic);
    },

    /**
     * The volume of the music max value is 1.0,the min value is 0.0 .
     * @return {Number}
     * @example
     * //example
     * var volume = cc.audioEngine.getMusicVolume();
     */
    getMusicVolume: function () {
        return this._musicPlayState == 0 ? 0 : this._currMusic.volume;
    },

    /**
     * Set the volume of music.
     * @param {Number} volume Volume must be in 0.0~1.0 .
     * @example
     * //example
     * cc.audioEngine.setMusicVolume(0.5);
     */
    setMusicVolume: function (volume) {
        if (this._musicPlayState > 0) {
            this._currMusic.volume = Math.min(Math.max(volume, 0), 1);
        }
    },

    /**
     * Whether the music is playing.
     * @return {Boolean} If is playing return true,or return false.
     * @example
     * //example
     *  if (cc.audioEngine.isMusicPlaying()) {
     *      cc.log("music is playing");
     *  }
     *  else {
     *      cc.log("music is not playing");
     *  }
     */
    isMusicPlaying: function () {
        return this._musicPlayState == 2 && this._currMusic && !this._currMusic.ended;
    },
    //music end

    //effect begin
    _getEffectList: function (url) {
        var list = this._audioPool[url];
        if (!list)
            list = this._audioPool[url] = [];
        return list;
    },

    _getEffect: function (url) {
        var self = this, audio;
        if (!self._soundSupported) return null;

        var effList = this._getEffectList(url);
        if(cc.sys.isMobile && cc.sys.os == cc.sys.OS_IOS){
            audio = this._getEffectAudio(effList, url);
        }else{
            for (var i = 0, li = effList.length; i < li; i++) {
                var eff = effList[i];
                if (eff.ended) {
                    audio = eff;
                    if (audio.readyState > 2)
                        audio.currentTime = 0;
                    if (window.chrome)
                        audio.load();
                    break;
                }
            }
            if (!audio) {
                audio = this._getEffectAudio(effList, url);
                audio && effList.push(audio);
            }
        }
        return audio;
    },

    _getEffectAudio: function(effList, url){
        var audio;
        if (effList.length >= this._maxAudioInstance) {
            cc.log("Error: " + url + " greater than " + this._maxAudioInstance);
            return null;
        }
        audio = this._getAudioByUrl(url);
        if (!audio)
            return null;
        audio = audio.cloneNode(true);
        if (this._effectPauseCb)
            cc._addEventListener(audio, "pause", this._effectPauseCb);
        audio.volume = this._effectsVolume;
        return audio;
    },

    /**
     * Play sound effect.
     * @param {String} url The path of the sound effect with filename extension.
     * @param {Boolean} loop Whether to loop the effect playing, default value is false
     * @return {Number|null} the audio id
     * @example
     * //example
     * var soundId = cc.audioEngine.playEffect(path);
     */
    playEffect: function (url, loop) {
        var audio = this._getEffect(url);
        if (!audio) return null;
        audio.loop = loop || false;
        audio.play();
        var audioId = this._audioID++;
        this._effects[audioId] = audio;
        return audioId;
    },

    /**
     * Set the volume of sound effects.
     * @param {Number} volume Volume must be in 0.0~1.0 .
     * @example
     * //example
     * cc.audioEngine.setEffectsVolume(0.5);
     */
    setEffectsVolume: function (volume) {
        volume = this._effectsVolume = Math.min(Math.max(volume, 0), 1);
        var effects = this._effects;
        for (var key in effects) {
            effects[key].volume = volume;
        }
    },

    /**
     * Pause playing sound effect.
     * @param {Number} audioID The return value of function playEffect.
     * @example
     * //example
     * cc.audioEngine.pauseEffect(audioID);
     */
    pauseEffect: function (audioID) {
        var audio = this._effects[audioID];
        if (audio && !audio.ended) {
            audio.pause();
        }
    },

    /**
     * Pause all playing sound effect.
     * @example
     * //example
     * cc.audioEngine.pauseAllEffects();
     */
    pauseAllEffects: function () {
        var effects = this._effects;
        for (var key in effects) {
            var eff = effects[key];
            if (!eff.ended) eff.pause();
        }
    },

    /**
     * Resume playing sound effect.
     * @param {Number} effectId The return value of function playEffect.
     * @audioID
     * //example
     * cc.audioEngine.resumeEffect(audioID);
     */
    resumeEffect: function (effectId) {
        this._resumeAudio(this._effects[effectId])
    },

    /**
     * Resume all playing sound effect
     * @example
     * //example
     * cc.audioEngine.resumeAllEffects();
     */
    resumeAllEffects: function () {
        var effects = this._effects;
        for (var key in effects) {
            this._resumeAudio(effects[key]);
        }
    },

    /**
     * Stop playing sound effect.
     * @param {Number} effectId The return value of function playEffect.
     * @example
     * //example
     * cc.audioEngine.stopEffect(audioID);
     */
    stopEffect: function (effectId) {
        this._stopAudio(this._effects[effectId]);
        delete this._effects[effectId];
    },

    /**
     * Stop all playing sound effects.
     * @example
     * //example
     * cc.audioEngine.stopAllEffects();
     */
    stopAllEffects: function () {
        var effects = this._effects;
        for (var key in effects) {
            this._stopAudio(effects[key]);
            delete effects[key];
        }
    },

    /**
     * Unload the preloaded effect from internal buffer
     * @param {String} url
     * @example
     * //example
     * cc.audioEngine.unloadEffect(EFFECT_FILE);
     */
    unloadEffect: function (url) {
        var locLoader = cc.loader, locEffects = this._effects, effectList = this._getEffectList(url);
        locLoader.release(url);//release the resource in cc.loader first.
        if (effectList.length == 0) return;
        var realUrl = effectList[0].src;
        delete this._audioPool[url];
        for (var key in locEffects) {
            if (locEffects[key].src == realUrl) {
                this._stopAudio(locEffects[key]);
                delete locEffects[key];
            }
        }
    },
    //effect end

    /**
     * End music and effects.
     */
    end: function () {
        this.stopMusic();
        this.stopAllEffects();
    },

    /**
     * Called only when the hidden event of window occurs.
     * @private
     */
    _pausePlaying: function () {//in this function, do not change any status of audios
        var self = this, effects = self._effects, eff;
        for (var key in effects) {
            eff = effects[key];
            if (eff && !eff.ended && !eff.paused) {
                self._playings.push(eff);
                eff.pause();
            }
        }
        if (self.isMusicPlaying()) {
            self._playings.push(self._currMusic);
            self._currMusic.pause();
        }
    },

    /**
     * Called only when the hidden event of window occurs.
     * @private
     */
    _resumePlaying: function () {//in this function, do not change any status of audios
        var self = this, playings = this._playings;
        for (var i = 0, li = playings.length; i < li; i++) {
            self._resumeAudio(playings[i]);
        }
        playings.length = 0;
    }

});

if (!cc.sys._supportWebAudio && !cc.sys._supportMultipleAudio) {
    cc.AudioEngineForSingle = cc.AudioEngine.extend({
        _waitingEffIds: [],
        _pausedEffIds: [],
        _currEffect: null,
        _maxAudioInstance: 2,
        _effectCache4Single: {},//{url:audio},
        _needToResumeMusic: false,
        _expendTime4Music: 0,

        _isHiddenMode: false,

        _playMusic: function (audio) {
            this._stopAllEffects();
            this._super(audio);
        },

        resumeMusic: function () {
            var self = this;
            if (self._musicPlayState == 1) {
                self._stopAllEffects();
                self._needToResumeMusic = false;
                self._expendTime4Music = 0;
                self._super();
            }
        },

        playEffect: function (url, loop) {
            var self = this, currEffect = self._currEffect;
            var audio = loop ? self._getEffect(url) : self._getSingleEffect(url);
            if (!audio) return null;
            audio.loop = loop || false;
            var audioId = self._audioID++;
            self._effects[audioId] = audio;

            if (self.isMusicPlaying()) {
                self.pauseMusic();
                self._needToResumeMusic = true;
            }
            if (currEffect) {
                if (currEffect != audio) self._waitingEffIds.push(self._currEffectId);
                self._waitingEffIds.push(audioId);
                currEffect.pause();
            } else {
                self._currEffect = audio;
                self._currEffectId = audioId;
                audio.play();
            }
            return audioId;
        },

        pauseEffect: function (effectId) {
            cc.log("pauseEffect not supported in single audio mode!");
        },

        pauseAllEffects: function () {
            var self = this, waitings = self._waitingEffIds, pauseds = self._pausedEffIds, currEffect = self._currEffect;
            if (!currEffect) return;
            for (var i = 0, li = waitings.length; i < li; i++) {
                pauseds.push(waitings[i]);
            }
            waitings.length = 0;//clear
            pauseds.push(self._currEffectId);
            currEffect.pause();
        },

        resumeEffect: function (effectId) {
            cc.log("resumeEffect not supported in single audio mode!");
        },

        resumeAllEffects: function () {
            var self = this, waitings = self._waitingEffIds, pauseds = self._pausedEffIds;

            if (self.isMusicPlaying()) {//if music is playing, pause it first
                self.pauseMusic();
                self._needToResumeMusic = true;
            }

            for (var i = 0, li = pauseds.length; i < li; i++) {//move pauseds to waitings
                waitings.push(pauseds[i]);
            }
            pauseds.length = 0;//clear
            if (!self._currEffect && waitings.length >= 0) {//is none currEff, resume the newest effect in waitings
                var effId = waitings.pop();
                var eff = self._effects[effId];
                if (eff) {
                    self._currEffectId = effId;
                    self._currEffect = eff;
                    self._resumeAudio(eff);
                }
            }
        },

        stopEffect: function (effectId) {
            var self = this, currEffect = self._currEffect, waitings = self._waitingEffIds, pauseds = self._pausedEffIds;
            if (currEffect && this._currEffectId == effectId) {//if the eff to be stopped is currEff
                this._stopAudio(currEffect);
            } else {//delete from waitings or pauseds
                var index = waitings.indexOf(effectId);
                if (index >= 0) {
                    waitings.splice(index, 1);
                } else {
                    index = pauseds.indexOf(effectId);
                    if (index >= 0) pauseds.splice(index, 1);
                }
            }
        },

        stopAllEffects: function () {
            var self = this;
            self._stopAllEffects();
            if (!self._currEffect && self._needToResumeMusic) {//need to resume music
                self._resumeAudio(self._currMusic);
                self._musicPlayState = 2;
                self._needToResumeMusic = false;
                self._expendTime4Music = 0;
            }
        },

        unloadEffect: function (url) {
            var self = this, locLoader = cc.loader, locEffects = self._effects, effCache = self._effectCache4Single,
                effectList = self._getEffectList(url), currEffect = self._currEffect;
            locLoader.release(url);//release the resource in cc.loader first.
            if (effectList.length == 0 && !effCache[url]) return;
            var realUrl = effectList.length > 0 ? effectList[0].src : effCache[url].src;
            delete self._audioPool[url];
            delete effCache[url];
            for (var key in locEffects) {
                if (locEffects[key].src == realUrl) {
                    delete locEffects[key];
                }
            }
            if (currEffect && currEffect.src == realUrl) self._stopAudio(currEffect);//need to stop currEff
        },

        //When `loop == false`, one url one audio.
        _getSingleEffect: function (url) {
            var self = this, audio = self._effectCache4Single[url], locLoader = cc.loader,
                waitings = self._waitingEffIds, pauseds = self._pausedEffIds, effects = self._effects;
            if (audio) {
                if (audio.readyState > 2)
                    audio.currentTime = 0;                          //reset current time
            } else {
                audio = self._getAudioByUrl(url);
                if (!audio) return null;
                audio = audio.cloneNode(true);
                if (self._effectPauseCb)
                    cc._addEventListener(audio, "pause", self._effectPauseCb);
                audio.volume = self._effectsVolume;
                self._effectCache4Single[url] = audio;
            }
            for (var i = 0, li = waitings.length; i < li;) {//reset waitings
                if (effects[waitings[i]] == audio) {
                    waitings.splice(i, 1);
                } else
                    i++;
            }
            for (var i = 0, li = pauseds.length; i < li;) {//reset pauseds
                if (effects[pauseds[i]] == audio) {
                    pauseds.splice(i, 1);
                } else
                    i++;
            }
            audio._isToPlay = true;//custom flag
            return audio;
        },

        _stopAllEffects: function () {
            var self = this, currEffect = self._currEffect, audioPool = self._audioPool, sglCache = self._effectCache4Single,
                waitings = self._waitingEffIds, pauseds = self._pausedEffIds;
            if (!currEffect && waitings.length == 0 && pauseds.length == 0)
                return;
            for (var key in sglCache) {
                var eff = sglCache[key];
                if (eff.readyState > 2 && eff.duration && eff.duration != Infinity)
                    eff.currentTime = eff.duration;
            }
            waitings.length = 0;
            pauseds.length = 0;
            for (var key in audioPool) {//reset audios in pool to be ended
                var list = audioPool[key];
                for (var i = 0, li = list.length; i < li; i++) {
                    var eff = list[i];
                    eff.loop = false;
                    if (eff.readyState > 2 && eff.duration && eff.duration != Infinity)
                        eff.currentTime = eff.duration;
                }
            }
            if (currEffect) self._stopAudio(currEffect);
        },

        _effectPauseCb: function () {
            var self = this;
            if (self._isHiddenMode) return;//in this mode, return
            var currEffect = self._getWaitingEffToPlay();//get eff to play
            if (currEffect) {
                if (currEffect._isToPlay) {
                    delete currEffect._isToPlay;
                    currEffect.play();
                }
                else self._resumeAudio(currEffect);
            } else if (self._needToResumeMusic) {
                var currMusic = self._currMusic;
                if (currMusic.readyState > 2 && currMusic.duration && currMusic.duration != Infinity) {//calculate current time
                    var temp = currMusic.currentTime + self._expendTime4Music;
                    temp = temp - currMusic.duration * ((temp / currMusic.duration) | 0);
                    currMusic.currentTime = temp;
                }
                self._expendTime4Music = 0;
                self._resumeAudio(currMusic);
                self._musicPlayState = 2;
                self._needToResumeMusic = false;
            }
        },

        _getWaitingEffToPlay: function () {
            var self = this, waitings = self._waitingEffIds, effects = self._effects,
                currEffect = self._currEffect;

            var expendTime = currEffect ? currEffect.currentTime - (currEffect.startTime || 0) : 0;
            self._expendTime4Music += expendTime;

            while (true) {//get a audio to play
                if (waitings.length == 0)
                    break;
                var effId = waitings.pop();
                var eff = effects[effId];
                if (!eff)
                    continue;
                if (eff._isToPlay || eff.loop || (eff.duration && eff.currentTime + expendTime < eff.duration)) {
                    self._currEffectId = effId;
                    self._currEffect = eff;
                    if (!eff._isToPlay && eff.readyState > 2 && eff.duration && eff.duration != Infinity) {
                        var temp = eff.currentTime + expendTime;
                        temp = temp - eff.duration * ((temp / eff.duration) | 0);
                        eff.currentTime = temp;
                    }
                    eff._isToPlay = false;
                    return eff;
                } else {
                    if (eff.readyState > 2 && eff.duration && eff.duration != Infinity)
                        eff.currentTime = eff.duration;
                }
            }
            self._currEffectId = null;
            self._currEffect = null;
            return null;
        },

        _pausePlaying: function () {//in this function, do not change any status of audios
            var self = this, currEffect = self._currEffect;
            self._isHiddenMode = true;
            var audio = self._musicPlayState == 2 ? self._currMusic : currEffect;
            if (audio) {
                self._playings.push(audio);
                audio.pause();
            }

        },
        _resumePlaying: function () {//in this function, do not change any status of audios
            var self = this, playings = self._playings;
            self._isHiddenMode = false;
            if (playings.length > 0) {
                self._resumeAudio(playings[0]);
                playings.length = 0;
            }
        }

    });
}

cc._audioLoader = {
    _supportedAudioTypes: null,

    // Get audio default path.
    getBasePath: function () {
        return cc.loader.audioPath;
    },

    // pre-load the audio.                                                                                                                                                     <br/>
    // note: If the preload audio type doesn't be supported on current platform, loader will use other audio format to try, but its key is still the origin audio format.      <br/>
    // for example: a.mp3 doesn't be supported on some browser, loader will load a.ogg, if a.ogg loads success, user still uses a.mp3 to play audio.
    _load: function (realUrl, url, res, count, tryArr, audio, cb) {
        var self = this, locLoader = cc.loader, path = cc.path;
        var types = this._supportedAudioTypes;
        var extname = "";
        if (types.length == 0)
            return cb("can not support audio!");
        if (count == -1) {
            extname = (path.extname(realUrl) || "").toLowerCase();
            if (!self.audioTypeSupported(extname)) {
                extname = types[0];
                count = 0;
            }
        } else if (count < types.length) {
            extname = types[count];
        } else {
            return cb("can not found the resource of audio! Last match url is : " + realUrl);
        }
        if (tryArr.indexOf(extname) >= 0)
            return self._load(realUrl, url, res, count + 1, tryArr, audio, cb);
        realUrl = path.changeExtname(realUrl, extname);
        tryArr.push(extname);
        var delFlag = (count == types.length -1);
        audio = self._loadAudio(realUrl, audio, function (err) {
            if (err)
                return self._load(realUrl, url, res, count + 1, tryArr, audio, cb);//can not found
            cb(null, audio);
        }, delFlag);
        locLoader.cache[url] = audio;
    },

    //Check whether to support this type of file
    audioTypeSupported: function (type) {
        if (!type) return false;
        return this._supportedAudioTypes.indexOf(type.toLowerCase()) >= 0;
    },

    _loadAudio: function (url, audio, cb, delFlag) {
        var _Audio;
        if (!cc.isObject(window["cc"]) && cc.sys.browserType == "firefox")
            _Audio = Audio;                  //The WebAudio of FireFox  doesn't work after google closure compiler compiled with advanced mode
        else
            _Audio = (location.origin == "file://") ? Audio : (cc.WebAudio || Audio);
        if (arguments.length == 2) {
            cb = audio;
            audio = new _Audio();
        } else if ((arguments.length > 3 ) && !audio) {
            audio = new _Audio();
        }
        audio.src = url;
        audio.preload = "auto";

        var ua = navigator.userAgent;
        if (/Mobile/.test(ua) && (/iPhone OS/.test(ua) || /iPad/.test(ua) || /Firefox/.test(ua)) || /MSIE/.test(ua)) {
            audio.load();
            cb(null, audio);
        } else {
            var canplaythrough = "canplaythrough", error = "error";
            cc._addEventListener(audio, canplaythrough, function () {
                cb(null, audio);
                this.removeEventListener(canplaythrough, arguments.callee, false);
                this.removeEventListener(error, arguments.callee, false);
            }, false);

            var audioCB = function () {
                audio.removeEventListener("emptied", audioCB);
                audio.removeEventListener(error, audioCB);
                cb("load " + url + " failed");
                if(delFlag){
                    this.removeEventListener(canplaythrough, arguments.callee, false);
                    this.removeEventListener(error, arguments.callee, false);
                }
            };

            if(cc.sys.browserType === cc.sys.BROWSER_TYPE_WECHAT){
                cc._addEventListener(audio, "emptied", audioCB, false);
            }

            cc._addEventListener(audio, error, audioCB, false);
            audio.load();
        }
        return audio;
    },

    // Load this audio.
    load: function (realUrl, url, res, cb) {
        var tryArr = [];
        this._load(realUrl, url, res, -1, tryArr, null, cb);
    }
};

cc._audioLoader._supportedAudioTypes = function () {
    var au = cc.newElement('audio'), arr = [];
    if (au.canPlayType) {
        // <audio> tag is supported, go on
        var _check = function (typeStr) {
            var result = au.canPlayType(typeStr);
            return result != "no" && result != "";
        };
        if (_check('audio/ogg; codecs="vorbis"')) arr.push(".ogg");
        if (_check("audio/mpeg")) arr.push(".mp3");
        if (_check('audio/wav; codecs="1"')) arr.push(".wav");
        if (_check("audio/mp4")) arr.push(".mp4");
        if (_check("audio/x-m4a") || _check("audio/aac")) arr.push(".m4a");
    }
    return arr;
}();

cc.loader.register(["mp3", "ogg", "wav", "mp4", "m4a"], cc._audioLoader);

// Initialize Audio engine singleton
cc.audioEngine = cc.AudioEngineForSingle ? new cc.AudioEngineForSingle() : new cc.AudioEngine();
cc.eventManager.addCustomListener(cc.game.EVENT_HIDE, function () {
    cc.audioEngine._pausePlaying();
});
cc.eventManager.addCustomListener(cc.game.EVENT_SHOW, function () {
    cc.audioEngine._resumePlaying();
});
