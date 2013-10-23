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
 * Base class for cc.ComAudio
 * @class
 * @extends cc.Component
 */
cc.ComAudio = cc.Component.extend({
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

    isEnabled: function () {
        return this._enabled;
    },

    setEnabled: function (bool) {
        this._enabled = bool;
    },

    end: function () {
        cc.AudioEngine.end();
    },

    preloadBackgroundMusic: function (pszFilePath) {
        cc.AudioEngine.getInstance().preloadMusic(pszFilePath);
    },

    playBackgroundMusic: function (pszFilePath, loop) {
        cc.AudioEngine.getInstance().playMusic(pszFilePath, loop);
    },

    stopBackgroundMusic: function (releaseData) {
        cc.AudioEngine.getInstance().stopMusic(releaseData);
    },

    pauseBackgroundMusic: function () {
        cc.AudioEngine.getInstance().pauseMusic();
    },

    resumeBackgroundMusic: function () {
        cc.AudioEngine.getInstance().resumeMusic();
    },

    rewindBackgroundMusic: function () {
        cc.AudioEngine.getInstance().rewindMusic();
    },

    willPlayBackgroundMusic: function () {
        return cc.AudioEngine.getInstance().willPlayMusic();
    },

    isBackgroundMusicPlaying: function () {
        return cc.AudioEngine.getInstance().isMusicPlaying();
    },

    getBackgroundMusicVolume: function () {
        return cc.AudioEngine.getInstance().getMusicVolume();
    },

    setBackgroundMusicVolume: function (volume) {
        cc.AudioEngine.getInstance().setMusicVolume(volume);
    },

    getEffectsVolume: function () {
        return cc.AudioEngine.getInstance().getEffectsVolume();
    },

    setEffectsVolume: function (volume) {
        cc.AudioEngine.getInstance().setEffectsVolume(volume);
    },

    playEffect: function (pszFilePath, loop) {
        return cc.AudioEngine.getInstance().playEffect(pszFilePath, loop);
    },

    pauseEffect: function (soundId) {
        cc.AudioEngine.getInstance().pauseEffect(soundId);
    },

    pauseAllEffects: function () {
        cc.AudioEngine.getInstance().pauseAllEffects();
    },

    resumeEffect: function (soundId) {
        cc.AudioEngine.getInstance().resumeEffect(soundId);
    },

    resumeAllEffects: function () {
        cc.AudioEngine.getInstance().resumeAllEffects();
    },

    stopEffect: function (soundId) {
        cc.AudioEngine.getInstance().stopEffect(soundId);
    },

    stopAllEffects: function () {
        cc.AudioEngine.getInstance().stopAllEffects();
    },

    preloadEffect: function (pszFilePath) {
        cc.AudioEngine.getInstance().preloadEffect(pszFilePath);
    },

    unloadEffect: function (pszFilePath) {
        cc.AudioEngine.getInstance().unloadEffect(pszFilePath);
    },

    setFile: function (pszFilePath) {
        this._filePath = pszFilePath;
    },

    setLoop: function (loop) {
        this._loop = loop;
    },

    getFile: function () {
        return this._filePath;
    },

    isLoop: function () {
        return this._loop;
    }
});
cc.ComAudio.create = function () {
    var com = new cc.ComAudio();
    if (com && com.init()) {
        return com;
    }
    return null;
};