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
	// the pre fullscreenchange function
    _preOnFullScreenChange: null,
    _touchEvent: "",
	_fn: null,
	// Function mapping for cross browser support
	_fnMap: [
		[
			'requestFullscreen',
			'exitFullscreen',
			'fullscreenchange',
			'fullscreenEnabled',
			'fullscreenElement'
		],
		[
			'requestFullScreen',
			'exitFullScreen',
			'fullScreenchange',
			'fullScreenEnabled',
			'fullScreenElement'
		],
		[
			'webkitRequestFullScreen',
			'webkitCancelFullScreen',
			'webkitfullscreenchange',
			'webkitIsFullScreen',
			'webkitCurrentFullScreenElement'
		],
		[
			'mozRequestFullScreen',
			'mozCancelFullScreen',
			'mozfullscreenchange',
			'mozFullScreen',
			'mozFullScreenElement'
		],
		[
			'msRequestFullscreen',
			'msExitFullscreen',
			'MSFullscreenChange',
			'msFullscreenEnabled',
			'msFullscreenElement'
		]
	],

    init: function () {
	    this._fn = {};
	    var i, val, map = this._fnMap, valL;
	    for (i = 0, l = map.length; i < l; i++ ) {
		    val = map[ i ];
		    if ( val && val[1] in document ) {
			    for ( i = 0, valL = val.length; i < valL; i++ ) {
				    this._fn[ map[0][ i ] ] = val[ i ];
			    }
			    break;
		    }
	    }

		this._supportsFullScreen = (this._fn.requestFullscreen != undefined);
        this._touchEvent = ('ontouchstart' in window) ? 'touchstart' : 'mousedown';
    },

    /**
     * return true if it's full now.
     * @returns {Boolean}
     */
    fullScreen: function() {
	    return this._supportsFullScreen && document[ this._fn.fullscreenEnabled ];
    },

    /**
     * change the screen to full mode.
     * @param {Element} element
     * @param {Function} onFullScreenChange
     * @returns {*}
     */
    requestFullScreen: function (element, onFullScreenChange) {
	    if (!this._supportsFullScreen) return;

	    element = element || document.documentElement;
	    element[ this._fn.requestFullscreen ]();

	    if (onFullScreenChange) {
		    var eventName = this._fn.fullscreenchange;
		    if (this._preOnFullScreenChange)
			    document.removeEventListener(eventName, this._preOnFullScreenChange);
		    this._preOnFullScreenChange = onFullScreenChange;
		    document.addEventListener(eventName, onFullScreenChange, false);
	    }

        return element[ this._fn.requestFullscreen ]();
    },

    /**
     * exit the full mode.
     * @returns {*}
     */
    exitFullScreen: function () {
        return this._supportsFullScreen ? document[ this._fn.exitFullscreen ]() : true;
    },

    /**
     * Automatically request full screen with a touch/click event
     * @param {Element} element
     * @param {Function} onFullScreenChange
     */
    autoFullScreen: function (element, onFullScreenChange) {
	    element = element || document.body;
	    var touchTarget = cc.canvas || element;
        var theScreen = this;
        // Function bind will be too complicated here because we need the callback function's reference to remove the listener
        function callback() {
            theScreen.requestFullScreen(element, onFullScreenChange);
            touchTarget.removeEventListener(theScreen._touchEvent, callback);
        }
        this.requestFullScreen(element, onFullScreenChange);
        touchTarget.addEventListener(this._touchEvent, callback);
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
