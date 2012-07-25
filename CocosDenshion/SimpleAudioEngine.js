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

/**
 * Offer a VERY simple interface to play background music & sound effect.
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
     * Preload background music resource.<br />
     * This method is called when cc.Loader preload  resources.
     * @param {String} path The path of the background music file without filename extension.
     */
    preloadBackgroundMusic:function (path) {
        if (this._sound_enable) {
            if (this._activeAudioExt == -1) return;
            var soundPath = path + "." + this._activeAudioExt;
            var soundCache = new Audio(soundPath);
            soundCache.preload = 'auto';

            soundCache.addEventListener('canplaythrough', function (e) {
                this.removeEventListener('canplaythrough', arguments.callee, false);
            }, false);
            soundCache.addEventListener("error", function (e) {
                cc.Loader.shareLoader().onResLoadingErr();
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
        cc.Loader.shareLoader().onResLoaded();
    },
    /**
     * Play background music.
     * @param {String} path The path of the background music file without filename extension.
     * @param {Boolean} loop Whether the background music loop or not.
     * @example
     * //example
     * cc.AudioEngine.getInstance().playBackgroundMusic(path, false);
     */
    playBackgroundMusic:function (path, loop) {
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
     * Stop playing background music.
     * @param {Boolean} releaseData If release the background music data or not.As default value is false.
     * @example
     * //example
     * cc.AudioEngine.getInstance().stopBackgroundMusic();
     */
    stopBackgroundMusic:function (releaseData) {
        if (this._bgmList[this._playingBgm]) {
            this._bgmList[this._playingBgm].pause();
            if (releaseData && this._bgmList.hasOwnProperty(this._playingBgm)) {
                delete this._bgmList[this._playingBgm];
            }
        }
    },
    /**
     * Pause playing background music.
     * @example
     * //example
     * cc.AudioEngine.getInstance().pauseBackgroundMusic();
     */
    pauseBackgroundMusic:function () {
        if (this._bgmList[this._playingBgm]) {
            this._bgmList[this._playingBgm].pause();
        }
    },
    /**
     * Resume playing background music.
     * @example
     * //example
     * cc.AudioEngine.getInstance().resumeBackgroundMusic();
     */
    resumeBackgroundMusic:function () {
        if (this._bgmList[this._playingBgm]) {
            this._bgmList[this._playingBgm].play();
        }
    },

    /**
     * Rewind playing background music.
     * @example
     * //example
     * cc.AudioEngine.getInstance().rewindBackgroundMusic();
     */
    rewindBackgroundMusic:function () {
        if (this._bgmList[this._playingBgm]) {
            this._bgmList[this._playingBgm].currentTime = 0;
            this._bgmList[this._playingBgm].play();
        }
    },
    willPlayBackgroundMusic:function () {
        return false;
    },

    /**
     * Whether the background music is playing.
     * @return {Boolean} If is playing return true,or return false.
     * @example
     * //example
     *  if (cc.AudioEngine.getInstance().isBackgroundMusicPlaying()) {
     *      cc.log("background music is playing");
     *  }
     *  else {
     *      cc.log("background music is not playing");
     *  }
     */
    isBackgroundMusicPlaying:function () {
        return cc.sharedEngine._isBgmPlaying;
    },

    /**
     * The volume of the background music max value is 1.0,the min value is 0.0 .
     * @return {Number}
     * @example
     * //example
     * var volume = cc.AudioEngine.getInstance().getBackgroundMusicVolume();
     */
    getBackgroundMusicVolume:function () {
        if (this._bgmList[this._playingBgm]) {
            return this._bgmList[this._playingBgm].volume;
        }
        else {
            return 0;
        }
    },

    /**
     * Set the volume of background music.
     * @param {Number} volume Volume must be in 0.0~1.0 .
     * @example
     * //example
     * cc.AudioEngine.getInstance().setBackgroundMusicVolume(0.5);
     */
    setBackgroundMusicVolume:function (volume) {
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
            for (var i in this._audioList) {
                this._audioList[i].volume = this._effectsVolume;
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
        var soundCache = this._getEffectList(path);
        if (soundCache) {
            soundCache.loop = loop || false;
            soundCache.play();
        }
        return path;
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
            this._audioList[path].pause();
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
            for (var i in this._audioList) {
                this._audioList[i].pause();
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
            this._audioList[path].play();
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
            for (var i in this._audioList) {
                this._audioList[i].play();
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
            this._audioList[path].pause();
            this._audioList[path].currentTime = 0;
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
            for (var i in this._audioList) {
                this._audioList[i].pause();
                this._audioList[i].currentTime = 0;
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
            var soundCache = new Audio(soundPath);
            soundCache.preload = 'auto';

            soundCache.addEventListener('canplaythrough', function (e) {
                this.removeEventListener('canplaythrough', arguments.callee,
                    false);
            }, false);
            soundCache.addEventListener("error", function (e) {
                cc.Loader.shareLoader().onResLoadingErr();
            }, false);

            // load it
            soundCache.load();
            this._audioList[path] = soundCache;
        }
        cc.Loader.shareLoader().onResLoaded();
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
     *  Stop all background music and sound effects
     * @example
     * //example
     * cc.AudioEngine.getInstance().end();
     */
    end:function () {
        this.stopBackgroundMusic();
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
