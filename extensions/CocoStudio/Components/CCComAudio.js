/****************************************************************************
 Copyright (c) 2010-2012 cocos2d-x.org

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
 * Base class for ccs.ComAudio
 * @class
 * @extends ccs.Component
 */
ccs.ComAudio = ccs.Component.extend(/** @lends ccs.ComAudio# */{
    _filePath: "",
    _loop: false,
    ctor: function () {
        cc.Component.prototype.ctor.call(this);
        this._name = "Audio";
    },
    init: function () {
        return true;
    },

    onEnter: function () {
    },

    onExit: function () {
        this.stopBackgroundMusic(true);
        this.stopAllEffects();
    },

    end: function () {
        cc.AudioEngine.end();
    },

    /**
     * Preload background music resource
     * @param {String} pszFilePath
     */
    preloadBackgroundMusic: function (pszFilePath) {
        cc.AudioEngine.getInstance().preloadMusic(pszFilePath);
    },

    /**
     * Play background music
     * @param {String} pszFilePath
     * @param {Boolean} loop
     */
    playBackgroundMusic: function (pszFilePath, loop) {
        if(pszFilePath){
            cc.AudioEngine.getInstance().playMusic(pszFilePath, loop);
        }else{
            cc.AudioEngine.getInstance().playMusic(this._filePath, this._loop);
        }
    },

    /**
     * Stop background music
     * @param {String} releaseData
     */
    stopBackgroundMusic: function (releaseData) {
        cc.AudioEngine.getInstance().stopMusic(releaseData);
    },

    /**
     * Pause background music
     */
    pauseBackgroundMusic: function () {
        cc.AudioEngine.getInstance().pauseMusic();
    },

    /**
     * Resume background music
     */
    resumeBackgroundMusic: function () {
        cc.AudioEngine.getInstance().resumeMusic();
    },

    /**
     * Rewind background music
     */
    rewindBackgroundMusic: function () {
        cc.AudioEngine.getInstance().rewindMusic();
    },

    /**
     * Indicates whether any background music can be played or not.
     * @returns {boolean}
     */
    willPlayBackgroundMusic: function () {
        return cc.AudioEngine.getInstance().willPlayMusic();
    },

    /**
     * Whether the music is playing.
     * @returns {Boolean}
     */
    isBackgroundMusicPlaying: function () {
        return cc.AudioEngine.getInstance().isMusicPlaying();
    },

    /**
     * The volume of the music max value is 1.0,the min value is 0.0 .
     * @returns {Number}
     */
    getBackgroundMusicVolume: function () {
        return cc.AudioEngine.getInstance().getMusicVolume();
    },

    /**
     * Set the volume of music.
     * @param {Number} volume   must be in 0.0~1.0 .
     */
    setBackgroundMusicVolume: function (volume) {
        cc.AudioEngine.getInstance().setMusicVolume(volume);
    },

    /**
     * The volume of the effects max value is 1.0,the min value is 0.0 .
     * @returns {Number}
     */
    getEffectsVolume: function () {
        return cc.AudioEngine.getInstance().getEffectsVolume();
    },

    /**
     * Set the volume of sound effects.
     * @param {Number} volume
     */
    setEffectsVolume: function (volume) {
        cc.AudioEngine.getInstance().setEffectsVolume(volume);
    },

    /**
     * Play sound effect.
     * @param {String} pszFilePath
     * @param {Boolean} loop
     * @returns {Boolean}
     */
    playEffect: function (pszFilePath, loop) {
        if (pszFilePath) {
            return cc.AudioEngine.getInstance().playEffect(pszFilePath, loop);
        } else {
            return cc.AudioEngine.getInstance().playEffect(this._filePath, this._loop);
        }
    },

    /**
     * Pause playing sound effect.
     * @param {Number} soundId
     */
    pauseEffect: function (soundId) {
        cc.AudioEngine.getInstance().pauseEffect(soundId);
    },

    /**
     * Pause all effects
     */
    pauseAllEffects: function () {
        cc.AudioEngine.getInstance().pauseAllEffects();
    },

    /**
     * Resume effect
     * @param {Number} soundId
     */
    resumeEffect: function (soundId) {
        cc.AudioEngine.getInstance().resumeEffect(soundId);
    },

    /**
     * Resume all effects
     */
    resumeAllEffects: function () {
        cc.AudioEngine.getInstance().resumeAllEffects();
    },

    /**
     * Stop effect
     * @param {Number} soundId
     */
    stopEffect: function (soundId) {
        cc.AudioEngine.getInstance().stopEffect(soundId);
    },

    /**
     * stop all effects
     */
    stopAllEffects: function () {
        cc.AudioEngine.getInstance().stopAllEffects();
    },

    /**
     * Preload effect
     * @param {String} pszFilePath
     */
    preloadEffect: function (pszFilePath) {
        cc.AudioEngine.getInstance().preloadEffect(pszFilePath);
        this.setFile(pszFilePath);
        this.setLoop(false);
    },

    /**
     * Unload effect
     * @param {String} pszFilePath
     */
    unloadEffect: function (pszFilePath) {
        cc.AudioEngine.getInstance().unloadEffect(pszFilePath);
    },

    /**
     * File path setter
     * @param {String} pszFilePath
     */
    setFile: function (pszFilePath) {
        this._filePath = pszFilePath;
    },

    /**
     * Set loop
     * @param {Boolean} loop
     */
    setLoop: function (loop) {
        this._loop = loop;
    },

    /**
     * File path Getter
     * @returns {string}
     */
    getFile: function () {
        return this._filePath;
    },

    /**
     * Whether is loop
     * @returns {boolean}
     */
    isLoop: function () {
        return this._loop;
    }
});
/**
 * allocates and initializes a ComAudio.
 * @constructs
 * @return {ccs.ComAudio}
 * @example
 * // example
 * var com = ccs.ComAudio.create();
 */
ccs.ComAudio.create = function () {
    var com = new ccs.ComAudio();
    if (com && com.init()) {
        return com;
    }
    return null;
};