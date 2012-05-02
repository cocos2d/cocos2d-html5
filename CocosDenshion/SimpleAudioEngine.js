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
var cc = cc = cc || {};

cc.sound = true;

cc.pCapabilities = {
    mp3:false,
    ogg:false,
    wav:false
};
/**
 @class          SimpleAudioEngine
 @brief          offer a VERY simple interface to play background music & sound effect
 */
cc.AudioManager = cc.Class.extend({
    // supported Audio Format
    m_initialized:false,
    m_pSupportedFormat:[ "mp3", "ogg", "wav" ],
    m_sRequestedFormat:null,
    m_bSound_enable:true,
    m_pAudioList:[],
    m_activeAudioExt:-1,
    m_sBackground:null,
    m_bBackgroundPlaying:false,
    m_EffectsVolume:1,
    ctor:function () {
        if (this.m_initialized)
            return;

        // init audio
        var au = document.createElement('audio');
        if (au.canPlayType) {
            cc.pCapabilities.mp3 = ("no" != au.canPlayType("audio/mpeg"))
                && ("" != au.canPlayType("audio/mpeg"));

            cc.pCapabilities.ogg = ("no" != au.canPlayType('audio/ogg; codecs="vorbis"'))
                && ("" != au.canPlayType('audio/ogg; codecs="vorbis"'));

            cc.pCapabilities.wav = ("no" != au.canPlayType('audio/wav; codecs="1"'))
                && ("" != au.canPlayType('audio/wav; codecs="1"'));

            // enable sound if any of the audio format is supported
            cc.sound = cc.pCapabilities.mp3 || cc.pCapabilities.ogg || cc.pCapabilities.wav;
        }
        this.m_initialized = true;
    },
    /**
     @brief init audio
     @param audioType
     */
    init:function (audioType) {
        if (audioType) {
            this.m_sRequestedFormat = new String(audioType)
        }
        else {
            // if no param is given to init we use mp3 by default
            this.m_sRequestedFormat = new String("mp3");
        }

        // detect the prefered audio format
        this.m_activeAudioExt = this._getSupportedAudioFormat();
        return this.m_bSound_enable;
    },
    _getSupportedAudioFormat:function () {
        var extIdx = 0;
        // check for sound support by the browser
        if (!cc.sound) {
            this.m_bSound_enable = false;
            return;
        }

        // check for MP3
        if ((this.m_sRequestedFormat.search(/mp3/i) != -1) && cc.pCapabilities.mp3) {
            return this.m_pSupportedFormat[extIdx];
        }

        // check for OGG/Vorbis
        if ((this.m_sRequestedFormat.search(/ogg/i) != -1) && cc.pCapabilities.ogg) {
            return this.m_pSupportedFormat[++extIdx];
        }

        // check for WAV
        if ((this.m_sRequestedFormat.search(/wav/i) != -1) && cc.pCapabilities.wav) {
            return this.m_pSupportedFormat[++extIdx];
        }

        // deactivate sound
        this.m_bSound_enable = false;

        return -1;
    },
    /**
     @brief Preload background music
     @param pszFilePath The path of the background music file,or the FileName of T_SoundResInfo
     */
    preloadBackgroundMusic:function (obj) {
        if (this.m_bSound_enable) {
            if (this.m_activeAudioExt == -1) return;
            var soundPath = obj + "." + this.m_activeAudioExt;
            var soundCache = new Audio(soundPath);
            soundCache.preload = 'auto';

            soundCache.addEventListener('canplaythrough', function (e) {
                this.removeEventListener('canplaythrough', arguments.callee, false);
            }, false);
            soundCache.addEventListener("error", function (e) {
                cc.Loader.shareLoader().onResLoadingErr();
            }, false);
            soundCache.addEventListener("playing", function (e) {
                cc.s_SharedEngine.m_bBackgroundPlaying = true;
            }, false);
            soundCache.addEventListener("pause", function (e) {
                cc.s_SharedEngine.m_bBackgroundPlaying = false;
            }, false);

            // load it
            soundCache.load();

            this.m_sBackground = soundCache
        }
        cc.Loader.shareLoader().onResLoaded();
    },
    /**
     @brief Play background music
     @param pszFilePath The path of the background music file,or the FileName of T_SoundResInfo
     @param bLoop Whether the background music loop or not
     */
    playBackgroundMusic:function (pszFilePath, bLoop) {
        if (this.m_sBackground) {
            this.m_sBackground.loop = bLoop || false;
            this.m_sBackground.play();
        }
    },

    /**
     @brief Stop playing background music
     @param bReleaseData If release the background music data or not.As default value is false
     */
    stopBackgroundMusic:function (bReleaseData) {
        if (this.m_sBackground) {
            this.m_sBackground.pause();
            this.m_sBackground.currentTime = 0;
            if (bReleaseData) this.m_sBackground = null;
        }
    },

    /**
     @brief Pause playing background music
     */
    pauseBackgroundMusic:function () {
        if (this.m_sBackground) {
            this.m_sBackground.pause();
        }
    },

    /**
     @brief Resume playing background music
     */
    resumeBackgroundMusic:function () {
        if (this.m_sBackground) {
            this.m_sBackground.play();
        }
    },

    /**
     @brief Rewind playing background music
     */
    rewindBackgroundMusic:function () {
        if (this.m_sBackground) {
            this.m_sBackground.currentTime = 0;
            this.m_sBackground.play();
        }
    },

    willPlayBackgroundMusic:function () {
        return false;
    },

    /**
     @brief Whether the background music is playing
     @return If is playing return true,or return false
     */
    isBackgroundMusicPlaying:function () {
        return cc.s_SharedEngine.m_bBackgroundPlaying;
    },

// properties
    /**
     @brief The volume of the background music max value is 1.0,the min value is 0.0
     */
    getBackgroundMusicVolume:function () {
        if (this.m_sBackground) {
            return this.m_sBackground.volume;
        }
        else {
            return 0;
        }
    },

    /**
     @brief set the volume of background music
     @param volume must be in 0.0~1.0
     */
    setBackgroundMusicVolume:function (volume) {
        if (this.m_sBackground) {
            if (volume > 1) {
                this.m_sBackground.volume = 1;
            }
            else if (volume < 0) {
                this.m_sBackground.volume = 0;
            }
            else {
                this.m_sBackground.volume = volume;
            }
        }
    },

    /**
     @brief The volume of the effects max value is 1.0,the min value is 0.0
     */
    getEffectsVolume:function () {
        return this.m_EffectsVolume;
    },

    /**
     @brief set the volume of sound effecs
     @param volume must be in 0.0~1.0
     */
    setEffectsVolume:function (volume) {
        if (volume > 1) {
            this.m_EffectsVolume = 1;
        }
        else if (volume < 0) {
            this.m_EffectsVolume = 0;
        }
        else {
            this.m_EffectsVolume = volume;
        }
        if (this.m_pAudioList) {
            for (var i in this.m_pAudioList) {
                this.m_pAudioList[i].volume = this.m_EffectsVolume;
            }
        }
    },

// for sound effects
    /**
     @brief Play sound effect
     @param pszFilePath The path of the effect file,or the FileName of T_SoundResInfo
     @bLoop Whether to loop the effect playing, default value is false
     */
    playEffect:function (objName, bLoop) {
        var soundCache = this.getEffectList(objName);
        if (soundCache) {
            soundCache.currentTime = 0;
            soundCache.loop = bLoop || false;
            soundCache.play();
        }
        return objName;
    },

    /**
     @brief Pause playing sound effect
     @param nSoundId The return value of function playEffect
     */
    pauseEffect:function (nSoundId) {
        if (this.m_pAudioList[nSoundId]) {
            this.m_pAudioList[nSoundId].pause();
        }
    },

    /**
     @brief Pause all playing sound effect
     @param nSoundId The return value of function playEffect
     */
    pauseAllEffects:function () {
        if (this.m_pAudioList) {
            for (var i in this.m_pAudioList) {
                this.m_pAudioList[i].pause();
            }
        }
    },

    /**
     @brief Resume playing sound effect
     @param nSoundId The return value of function playEffect
     */
    resumeEffect:function (nSoundId) {
        if (this.m_pAudioList[nSoundId]) {
            this.m_pAudioList[nSoundId].play();
        }
    },

    /**
     @brief Resume all playing sound effect
     @param nSoundId The return value of function playEffect
     */
    resumeAllEffects:function () {
        if (this.m_pAudioList) {
            for (var i in this.m_pAudioList) {
                this.m_pAudioList[i].play();
            }
        }
    },

    /**
     @brief Stop playing sound effect
     @param nSoundId The return value of function playEffect
     */
    stopEffect:function (nSoundId) {
        if (this.m_pAudioList[nSoundId]) {
            this.m_pAudioList[nSoundId].pause();
            this.m_pAudioList[nSoundId].currentTime = 0;
        }
    },

    /**
     @brief Stop all playing sound effects
     */
    stopAllEffects:function () {
        if (this.m_pAudioList) {
            for (var i in this.m_pAudioList) {
                this.m_pAudioList[i].pause();
                this.m_pAudioList[i].currentTime = 0;
            }
        }
    },

    /**
     @brief          preload a compressed audio file
     @details        the compressed audio will be decode to wave, then write into an
     internal buffer in SimpleaudioEngine
     */
    preloadEffect:function (obj) {
        if (this.m_bSound_enable) {
            if (this.m_activeAudioExt == -1) return;
            var soundPath = obj + "." + this.m_activeAudioExt;
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
            var EffectName = this.getEffectName(obj);
            this.m_pAudioList[EffectName] = soundCache;
        }
        cc.Loader.shareLoader().onResLoaded();
    },

    /**
     @brief          unload the preloaded effect from internal buffer
     @param in        pszFilePath        The path of the effect file,or the FileName of T_SoundResInfo
     */
    unloadEffect:function (pszFilePath) {
        var nRet = this.getEffectName(pszFilePath);
        delete(this.m_pAudioList[nRet]);
    },
    getEffectName:function (Effect) {
        return Effect;
    },
    getEffectList:function (elt) {
        if (this.m_pAudioList != null) {
            return this.m_pAudioList[elt];
        }
        else {
            return null;
        }
    },
    end:function(){
         this.stopBackgroundMusic();
         this.stopAllEffects();
    }
});

/**
 @brief Get the shared Engine object,it will new one when first time be called
 */
cc.AudioManager.sharedEngine = function () {
    if (!cc.s_SharedEngine) {
        cc.s_SharedEngine = new cc.AudioManager();
    }
    return cc.s_SharedEngine;
};