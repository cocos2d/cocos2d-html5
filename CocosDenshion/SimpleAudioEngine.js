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
 * Whether the sound on or not
 * @type Boolean
 */
cc.sound = true;

/**
 * Support audio format
 * @type Boolean
 */
cc.capabilities = {
    mp3:false,
    ogg:false,
    wav:false
};
cc.MAX_AUDIO_INSTANCES = 10;
/**
 * Offer a VERY simple interface to play music & sound effect.
 * @class
 * @extends   cc.Class
 */
cc.AudioEngine = cc.Class.extend(/** @lends cc.AudioEngine# */{
    _initialized:false,
    _supportedFormat:[ "mp3", "ogg", "wav" ],
    _requestedFormat:null,
    _sound_enable:true,
    _audioList:{},
    _activeAudioExt:-1,
    _bgmList:{},
    _isBgmPlaying:false,
    _playingBgm:null,
    _effectsVolume:1,
    /**
     * Constructor
     */
    ctor:function () {
        if (this._initialized)
            return;

        // init audio
        var au = document.createElement('audio');
        if (au.canPlayType) {
            cc.capabilities.mp3 = ("no" != au.canPlayType("audio/mpeg"))
                && ("" != au.canPlayType("audio/mpeg"));

            cc.capabilities.ogg = ("no" != au.canPlayType('audio/ogg; codecs="vorbis"'))
                && ("" != au.canPlayType('audio/ogg; codecs="vorbis"'));

            cc.capabilities.wav = ("no" != au.canPlayType('audio/wav; codecs="1"'))
                && ("" != au.canPlayType('audio/wav; codecs="1"'));

            // enable sound if any of the audio format is supported
            cc.sound = cc.capabilities.mp3 || cc.capabilities.ogg || cc.capabilities.wav;
        }
        this._initialized = true;
    },
    /**
     * Initialize sound type
     * @param {String} audioType
     * @return {Boolean}
     * @example
     * //example
     * cc.AudioEngine.getInstance().init("mp3,ogg");
     */
    init:function (audioType) {
        if (audioType) {
            this._requestedFormat = new String(audioType)
        }
        else {
            // if no param is given to init we use mp3 by default
            this._requestedFormat = new String("mp3");
        }

        // detect the prefered audio format
        this._activeAudioExt = this._getSupportedAudioFormat();
        return this._sound_enable;
    },
    _getSupportedAudioFormat:function () {
        var extIdx = 0;
        // check for sound support by the browser
        if (!cc.sound) {
            this._sound_enable = false;
            return;
        }

        // check for MP3
        if ((this._requestedFormat.search(/mp3/i) != -1) && cc.capabilities.mp3) {
            return this._supportedFormat[extIdx];
        }

        // check for OGG/Vorbis
        if ((this._requestedFormat.search(/ogg/i) != -1) && cc.capabilities.ogg) {
            return this._supportedFormat[++extIdx];
        }

        // check for WAV
        if ((this._requestedFormat.search(/wav/i) != -1) && cc.capabilities.wav) {
            return this._supportedFormat[++extIdx];
        }

        // deactivate sound
        this._sound_enable = false;

        return -1;
    },
    /**
     * Preload music resource.<br />
     * This method is called when cc.Loader preload  resources.
     * @param {String} path The path of the music file without filename extension.
     */
    preloadMusic:function (path) {
        if (this._sound_enable) {
            if (this._activeAudioExt == -1) return;
            var soundPath = path + "." + this._activeAudioExt;
            var soundCache = new Audio(soundPath);
            soundCache.preload = 'auto';

            soundCache.addEventListener('canplaythrough', function (e) {
                this.removeEventListener('canplaythrough', arguments.callee, false);
            }, false);
            soundCache.addEventListener("error", function (e) {
                cc.Loader.getInstance().onResLoadingErr();
            }, false);
            soundCache.addEventListener("playing", function (e) {
                cc.sharedEngine._isBgmPlaying = true;
            }, false);
            soundCache.addEventListener("pause", function (e) {
                cc.sharedEngine._isBgmPlaying = false;
            }, false);

            // load it
            soundCache.load();

            this._bgmList[path] = soundCache
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
        if (this._bgmList[this._playingBgm]) {
            this._bgmList[this._playingBgm].pause();
        }
        this._playingBgm = path;
        if (this._bgmList[this._playingBgm]) {
            this._bgmList[this._playingBgm].loop = loop || false;
            this._bgmList[this._playingBgm].play();
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
        if (this._bgmList[this._playingBgm]) {
            this._bgmList[this._playingBgm].pause();
            if (releaseData && this._bgmList.hasOwnProperty(this._playingBgm)) {
                delete this._bgmList[this._playingBgm];
            }
        }
    },
    /**
     * Pause playing music.
     * @example
     * //example
     * cc.AudioEngine.getInstance().pauseMusic();
     */
    pauseMusic:function () {
        if (this._bgmList[this._playingBgm]) {
            this._bgmList[this._playingBgm].pause();
        }
    },
    /**
     * Resume playing music.
     * @example
     * //example
     * cc.AudioEngine.getInstance().resumeMusic();
     */
    resumeMusic:function () {
        if (this._bgmList[this._playingBgm]) {
            this._bgmList[this._playingBgm].play();
        }
    },

    /**
     * Rewind playing music.
     * @example
     * //example
     * cc.AudioEngine.getInstance().rewindMusic();
     */
    rewindMusic:function () {
        if (this._bgmList[this._playingBgm]) {
            this._bgmList[this._playingBgm].currentTime = 0;
            this._bgmList[this._playingBgm].play();
        }
    },
    willPlayMusic:function () {
        return false;
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
    isMusicPlaying:function () {
        return cc.sharedEngine._isBgmPlaying;
    },

    /**
     * The volume of the music max value is 1.0,the min value is 0.0 .
     * @return {Number}
     * @example
     * //example
     * var volume = cc.AudioEngine.getInstance().getMusicVolume();
     */
    getMusicVolume:function () {
        if (this._bgmList[this._playingBgm]) {
            return this._bgmList[this._playingBgm].volume;
        }
        else {
            return 0;
        }
    },

    /**
     * Set the volume of music.
     * @param {Number} volume Volume must be in 0.0~1.0 .
     * @example
     * //example
     * cc.AudioEngine.getInstance().setMusicVolume(0.5);
     */
    setMusicVolume:function (volume) {
        if (this._bgmList[this._playingBgm]) {
            if (volume > 1) {
                this._bgmList[this._playingBgm].volume = 1;
            }
            else if (volume < 0) {
                this._bgmList[this._playingBgm].volume = 0;
            }
            else {
                this._bgmList[this._playingBgm].volume = volume;
            }
        }
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
        if (this._audioList) {
            var au;
            for (var i in this._audioList) {
                au = this._audioList[i];
                if (au) {
                    au.volume = this._effectsVolume;
                }
            }
        }
    },

    /**
     * Play sound effect.
     * @param {String} path The path of the sound effect  without filename extension.
     * @param {Boolean} loop Whether to loop the effect playing, default value is false
     * @example
     * //example
     * var soundId = cc.AudioEngine.getInstance().playEffect(path);
     */
    playEffect:function (path, loop) {
        /*        var soundCache = this._getEffectList(path);
         if (soundCache) {
         if (soundCache.ended) {
         soundCache.loop = loop || false;
         soundCache.play();
         }
         else {
         var tempsoundCache = soundCache.cloneNode(true);
         tempsoundCache.addEventListener('ended', function () {
         tempsoundCache = null;
         });
         tempsoundCache.play();
         }
         }*/
        var soundPath = this._getEffectList(path);
        for (var i = 0; i < soundPath.length; i++) {
            //if one of the effect ended, play it
            if (soundPath[i].ended) {
                if (loop) {
                    soundPath[i].loop = loop;
                    soundPath[i].currentTime = 0;
                }
                soundPath[i].play();
                return path;
            }
        }
        //If code reach here, means no cache or all cache are playing, then we create new one
        var cache = this._pushEffectCache(path);
        if (cache) {
            if (loop) {
                cache.loop = loop;
            }
            cache.play();
        }
        return path;
    },
    _pushEffectCache:function (path) {
        var soundPath = this._getEffectList(path);
        if (soundPath.length < cc.MAX_AUDIO_INSTANCES) {
            var effect = new Audio(path + "." + this._activeAudioExt);
            soundPath.push(effect);
            return effect;
        }
        else {
            cc.log("error: " + path + " greater than " + cc.MAX_AUDIO_INSTANCES);
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
        if (this._audioList[path]) {
            for (var i = this._audioList[path].length - 1; i >= 0; i--) {
                if (!this._audioList[path][i].ended) {
                    this._audioList[path][i].pause();
                    return;
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
        if (this._audioList) {
            var au;
            for (var i in this._audioList) {
                au = this._audioList[i];
                if (au) {
                    for (var j = 0; j < au.length; j++) {
                        au[j].pause();
                    }
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
        if (this._audioList[path]) {
            for (var i = 0; i < this._audioList[path].length; i++) {
                if (!this._audioList[path][i].ended)
                    this._audioList[path][i].play();
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
        if (this._audioList) {
            var au;
            for (var i in this._audioList) {
                au = this._audioList[i];
                for (var j = 0; j < au.length; j++) {
                    if (au[j] && !au[j].ended) {
                        au[j].play();
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
        if (this._audioList[path]) {
            for (var i = this._audioList[path].length - 1; i >= 0; i--) {
                if (!this._audioList[path][i].ended) {
                    this._audioList[path][i].loop = false;
                    this._audioList[path][i].currentTime = this._audioList[path][i].duration;
                    return;
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
        if (this._audioList) {
            var au;
            for (var i in this._audioList) {
                au = this._audioList[i];
                for (var j = 0; j < au.length; j++) {
                    if (au[j] && !au[j].ended) {
                        au[j].loop = false;
                        au[j].currentTime = au[j].duration;
                    }
                }
            }
        }
    },

    /**
     * Preload sound effect resource.
     * This method is called when cc.Loader preload  resources.
     * @param {String} path The path of the sound effect file without filename extension.
     */
    preloadEffect:function (path) {
        if (this._sound_enable) {
            if (this._activeAudioExt == -1) return;
            var soundPath = path + "." + this._activeAudioExt;
            //var soundCache = new Audio(soundPath);

            /*soundCache.addEventListener('canplaythrough', function (e) {
             this.removeEventListener('canplaythrough', arguments.callee,
             false);
             }, false);
             soundCache.addEventListener("error", function (e) {
             cc.Loader.getInstance().onResLoadingErr();
             }, false);*/

            // load it
            //soundCache.load();
            //this._audioList[path] = soundCache;
            this._audioList[path] = [];
            this._pushEffectCache(path);
        }
        cc.Loader.getInstance().onResLoaded();
    },

    /**
     * Unload the preloaded effect from internal buffer
     * @param {String} path
     * @example
     * //example
     * cc.AudioEngine.getInstance().unloadEffect(EFFECT_FILE);
     */
    unloadEffect:function (path) {
        if (this._audioList.hasOwnProperty(path)) {
            this._audioList[path] = null;
            delete this._audioList[path];
        }
    },
    _getEffectList:function (elt) {
        if (this._audioList != null) {
            return this._audioList[elt];
        }
        else {
            return null;
        }
    },
    /**
     *  Stop all music and sound effects
     * @example
     * //example
     * cc.AudioEngine.getInstance().end();
     */
    end:function () {
        this.stopMusic();
        this.stopAllEffects();
    }
});

/**
 * Get the shared Engine object, it will new one when first time be called.
 * @return {cc.AudioEngine}
 */
cc.AudioEngine.getInstance = function () {
    if (!cc.sharedEngine) {
        cc.sharedEngine = new cc.AudioEngine();
    }
    return cc.sharedEngine;
};
