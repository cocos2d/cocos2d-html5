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

/**
 @class          SimpleAudioEngine
 @brief          offer a VERY simple interface to play background music & sound effect
 */
cc.AudioManager = cc.Class.extend({
    // supported Audio Format
    m_pSupportedFormat : [ "mp3", "ogg", "wav" ],
    m_sRequestedFormat : null,
    m_bSound_enable : true,
    m_pCapabilities: {
    mp3 : false,
    ogg : false,
    ma4 : false,
    wav : false
    },
    ctor:function(){

        // init some audio variables
        var a = document.createElement('audio');

        if (a.canPlayType) {
            this.m_pCapabilities.mp3 = ("no" != a.canPlayType("audio/mpeg"))
                && ("" != a.canPlayType("audio/mpeg"));

            this.m_pCapabilities.ogg = ("no" != a.canPlayType('audio/ogg; codecs="vorbis"'))
                && ("" != a.canPlayType('audio/ogg; codecs="vorbis"'));

            this.m_pCapabilities.wav = ("no" != a.canPlayType('audio/wav; codecs="1"'))
                && ("" != a.canPlayType('audio/wav; codecs="1"'));

            // enable sound if any of the audio format is supported
            //todo
            this.sound = this.m_pCapabilities.mp3 ||
                this.m_pCapabilities.ogg ||
                this.m_pCapabilities.wav;
        }
    },
    /**
     @brief Preload background music
     @param pszFilePath The path of the background music file,or the FileName of T_SoundResInfo
     */
    preloadBackgroundMusic:function (pszFilePath) {
    },

    /**
     @brief Play background music
     @param pszFilePath The path of the background music file,or the FileName of T_SoundResInfo
     @param bLoop Whether the background music loop or not
     */
    playBackgroundMusic:function (pszFilePath, bLoop) {
        bLoop = false;
    },

    /**
     @brief Stop playing background music
     @param bReleaseData If release the background music data or not.As default value is false
     */
    stopBackgroundMusic:function (bReleaseData) {
        bReleaseData = false;
    },

    /**
     @brief Pause playing background music
     */
    pauseBackgroundMusic:function () {

    },

    /**
     @brief Resume playing background music
     */
    resumeBackgroundMusic:function () {

    },

    /**
     @brief Rewind playing background music
     */
    rewindBackgroundMusic:function () {

    },

    willPlayBackgroundMusic:function () {

    },

    /**
     @brief Whether the background music is playing
     @return If is playing return true,or return false
     */
    isBackgroundMusicPlaying:function () {

    },

// properties
    /**
     @brief The volume of the background music max value is 1.0,the min value is 0.0
     */
    getBackgroundMusicVolume:function () {

    },

    /**
     @brief set the volume of background music
     @param volume must be in 0.0~1.0
     */
    setBackgroundMusicVolume:function (volume) {

    },

    /**
     @brief The volume of the effects max value is 1.0,the min value is 0.0
     */
    getEffectsVolume:function () {

    },

    /**
     @brief set the volume of sound effecs
     @param volume must be in 0.0~1.0
     */
    setEffectsVolume:function (volume) {

    },

// for sound effects
    /**
     @brief Play sound effect
     @param pszFilePath The path of the effect file,or the FileName of T_SoundResInfo
     @bLoop Whether to loop the effect playing, default value is false
     */
    playEffect:function (pszFilePath, bLoop) {
        bLoop = false;
    },

    /**
     @brief Pause playing sound effect
     @param nSoundId The return value of function playEffect
     */
    pauseEffect:function (nSoundId) {

    },

    /**
     @brief Pause all playing sound effect
     @param nSoundId The return value of function playEffect
     */
    pauseAllEffects:function () {

    },

    /**
     @brief Resume playing sound effect
     @param nSoundId The return value of function playEffect
     */
    resumeEffect:function (nSoundId) {

    },

    /**
     @brief Resume all playing sound effect
     @param nSoundId The return value of function playEffect
     */
    resumeAllEffects:function () {

    },

    /**
     @brief Stop playing sound effect
     @param nSoundId The return value of function playEffect
     */
    stopEffect:function (nSoundId) {

    },

    /**
     @brief Stop all playing sound effects
     */
    stopAllEffects:function () {

    },

    /**
     @brief          preload a compressed audio file
     @details        the compressed audio will be decode to wave, then write into an
     internal buffer in SimpleaudioEngine
     */
    preloadEffect:function (pszFilePath) {

    },

    /**
     @brief          unload the preloaded effect from internal buffer
     @param in        pszFilePath        The path of the effect file,or the FileName of T_SoundResInfo
     */
    unloadEffect:function (pszFilePath) {

    }
});

/**
 @brief Get the shared Engine object,it will new one when first time be called
 */
cc.AudioManager.sharedEngine = function () {

};

/**
 @brief Release the shared Engine object
 @warning It must be called before the application exit, or a memroy leak will be casued.
 */
cc.AudioManager.end = function () {
};

/**
 @brief  Set the zip file name
 @param pszZipFileName The relative path of the .zip file
 */
cc.AudioManager.setResource = function (pszZipFileName) {
};