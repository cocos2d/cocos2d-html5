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

cc.m_pCapabilities = {
    mp3:false,
    ogg:false,
    ma4:false,
    wav:false
};
/**
 @class          SimpleAudioEngine
 @brief          offer a VERY simple interface to play background music & sound effect
 */
cc.AudioManager = cc.Class.extend({
    // supported Audio Format
    m_pSupportedFormat:[ "mp3", "ogg", "wav" ],
    m_sRequestedFormat:null,
    m_bSound_enable:true,
    s_List:[],
    m_sBackground:null,
    m_bBackgroundPlaying:false,
    m_EffectsVolume:1,
    m_Callback:null,
    ctor:function () {
        /*  // init some audio variables
         var a = document.createElement('audio');

         if (a.canPlayType) {
         cc.m_pCapabilities.mp3 = ("no" != a.canPlayType("audio/mpeg"))
         && ("" != a.canPlayType("audio/mpeg"));

         cc.m_pCapabilities.ogg = ("no" != a.canPlayType('audio/ogg; codecs="vorbis"'))
         && ("" != a.canPlayType('audio/ogg; codecs="vorbis"'));

         cc.m_pCapabilities.wav = ("no" != a.canPlayType('audio/wav; codecs="1"'))
         && ("" != a.canPlayType('audio/wav; codecs="1"'));

         // enable sound if any of the audio format is supported
         this.sound = cc.m_pCapabilities.mp3 ||
         cc.m_pCapabilities.ogg ||
         cc.m_pCapabilities.wav;
         }*/
    },
    /**
     @brief Preload background music
     @param pszFilePath The path of the background music file,or the FileName of T_SoundResInfo
     */
    preloadBackgroundMusic:function (obj) {
        var soundCache = new Audio(obj.src);

        soundCache.preload = 'auto';

        soundCache.addEventListener('canplaythrough', function (e) {
            this.removeEventListener('canplaythrough', arguments.callee, false);
        }, false);

        soundCache.addEventListener("error", function (e) {
            //soundLoadError(sound.name);
        }, false);
        soundCache.addEventListener("playing", function (e) {
            cc.s_SharedEngine.m_bBackgroundPlaying = true;
        }, false);
        soundCache.addEventListener("pause", function (e) {
            cc.s_SharedEngine.m_bBackgroundPlaying = false;
        }, false);

        soundCache.src = obj.src;

        // load it
        soundCache.load();

        this.m_sBackground = soundCache;

        if (this.m_Callback) {
            this.m_Callback();
        }
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
        if (this.s_List) {
            for (var i in this.s_List) {
                this.s_List[i].volume = this.m_EffectsVolume;
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
        if (this.s_List[nSoundId]) {
            this.s_List[nSoundId].pause();
        }
    },

    /**
     @brief Pause all playing sound effect
     @param nSoundId The return value of function playEffect
     */
    pauseAllEffects:function () {
        if (this.s_List) {
            for (var i in this.s_List) {
                this.s_List[i].pause();
            }
        }
    },

    /**
     @brief Resume playing sound effect
     @param nSoundId The return value of function playEffect
     */
    resumeEffect:function (nSoundId) {
        if (this.s_List[nSoundId]) {
            this.s_List[nSoundId].play();
        }
    },

    /**
     @brief Resume all playing sound effect
     @param nSoundId The return value of function playEffect
     */
    resumeAllEffects:function () {
        if (this.s_List) {
            for (var i in this.s_List) {
                this.s_List[i].play();
            }
        }
    },

    /**
     @brief Stop playing sound effect
     @param nSoundId The return value of function playEffect
     */
    stopEffect:function (nSoundId) {
        if (this.s_List[nSoundId]) {
            this.s_List[nSoundId].pause();
            this.s_List[nSoundId].currentTime = 0;
        }
    },

    /**
     @brief Stop all playing sound effects
     */
    stopAllEffects:function () {
        if (this.s_List) {
            for (var i in this.s_List) {
                this.s_List[i].pause();
                this.s_List[i].currentTime = 0;
            }
        }
    },

    /**
     @brief          preload a compressed audio file
     @details        the compressed audio will be decode to wave, then write into an
     internal buffer in SimpleaudioEngine
     */
    preloadEffect:function (obj) {
        var soundCache = new Audio(obj.src);

        soundCache.preload = 'auto';

        soundCache.addEventListener('canplaythrough', function (e) {
            this.removeEventListener('canplaythrough', arguments.callee,
                false);
        }, false);

        soundCache.addEventListener("error", function (e) {
            //soundLoadError(sound.name);
        }, false);

        soundCache.src = obj.src;

        // load it
        soundCache.load();
        var EffectName = this.getEffectName(obj.src);
        this.s_List[EffectName] = soundCache;
        if (this.m_Callback) {
            this.m_Callback();
        }
    },

    /**
     @brief          unload the preloaded effect from internal buffer
     @param in        pszFilePath        The path of the effect file,or the FileName of T_SoundResInfo
     */
    unloadEffect:function (pszFilePath) {
        var nRet = this.getEffectName(pszFilePath);
        delete(this.s_List[nRet]);
    },
    getEffectName:function (Effect) {
        return Effect.toString();
    },
    getEffectList:function (elt) {
        if (this.s_List != null) {
            return this.s_List[elt];
        }
        else {
            return null;
        }
    },
    setCallback:function (callback) {
        this.m_Callback = callback;
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