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
 * The fullscreen API provides an easy way for web content to be presented using the user's entire screen.
 * It's invalid on safari,QQbrowser and android browser
 * @class
 * @extends cc.Class
 */
cc.Screen = cc.Class.extend({
    _supportsFullScreen: false,
    _browserPrefix: "",
    _preElement: null,//the pre element to show in full screen mode.
    _preOnFullScreenChange: null,//the pre fullscreenchange function
    _touchEvent: "",
    init: function () {
        var browserPres = 'webkit,moz,o,ms,khtml'.split(',');
        var body = document.body;
        if (body["requestFullScreen"]) {
            this._supportsFullScreen = true;
        } else {
            for (var i = 0, il = browserPres.length, prefix; i < il; i++) {
                prefix = browserPres[i];
                if (body[prefix + "RequestFullScreen"]) {
                    this._supportsFullScreen = true;
                    this._browserPrefix = prefix;
                    break;
                }
            }
        }

        this._touchEvent = ('ontouchstart' in window) ? 'touchstart' : 'mousedown';
    },

    /**
     * return true if it's full now.
     * @returns {Boolean}
     */
    fullScreen: function () {
        var d = document;
        if (this._supportsFullScreen) {
            switch (this._browserPrefix) {
                case '':
                    return d["fullScreen"];
                case 'webkit':
                    return d["webkitIsFullScreen"];
                default:
                    return d[this._browserPrefix + 'FullScreen'];
            }
        }
        return false;
    },

    /**
     * change the screen to full mode.
     * @param {Element} element
     * @param {Function} onFullScreenChange
     * @returns {*}
     */
    requestFullScreen: function (element, onFullScreenChange) {
        if (!this._supportsFullScreen || this.fullScreen()) return;
        if (onFullScreenChange) {
            var eventName = this._browserPrefix + "fullscreenchange";
            if (this._preElement && this._preOnFullScreenChange) this._preElement.removeEventListener(eventName, this._preOnFullScreenChange);
            this._preElement = element;
            this._preOnFullScreenChange = onFullScreenChange;
            element.addEventListener(eventName, onFullScreenChange, false);
        }
        return (this._browserPrefix === '') ? element["requestFullScreen"]() : element[this._browserPrefix + 'RequestFullScreen']();
    },

    /**
     * exit the full mode.
     * @returns {*}
     */
    exitFullScreen: function () {
        if (!this._supportsFullScreen || !this.fullScreen()) return;
        return (this._browserPrefix === '') ? document.body["cancelFullScreen"]() : document.body[this._browserPrefix + 'CancelFullScreen']();
    },

    /**
     * Automatically request full screen with a touch/click event
     */
    autoFullScreen: function (element, onFullScreenChange) {
        var theScreen = this;
        // Function bind will be too complicated here because we need the callback function's reference to remove the listener
        function callback() {
            theScreen.requestFullScreen(element, onFullScreenChange);
            element.removeEventListener(theScreen._touchEvent, callback);
        }
        this.requestFullScreen(element, onFullScreenChange);
        element.addEventListener(this._touchEvent, callback);
    }
});

/**
 * returns a shared instance of the cc.Screen
 * @function
 * @return {cc.Screen}
 */
cc.Screen.getInstance = function () {
    if (!this._instance){
        var screen = new cc.Screen();
        screen.init();
        this._instance = screen;
    }
    return this._instance;
};
