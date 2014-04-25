/****************************************************************************
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

plugin.AnalyticsFlurry = cc.Class.extend({
	debug: false,

    /**
     methods of InterfaceAnalytics protocol
	 */
    init: function () {
        if (typeof FlurryAgent === 'undefined') {
			cc.log("FlurryAgent unavailable. Please ensure that flurry.js has been pre-loaded.");
		}
    },

	startSession: function(appKey){
		this.debugLog("Starting Flurry session");
		FlurryAgent.startSession(appKey);
	},

	stopSession: function(){
		this.debugLog("Ending Flurry session");
		FlurryAgent.endSession();
	},

	setSessionContinueMillis: function(millis) {
		var seconds = parseInt(millis / 1000);
		this.debugLog("Setting Flurry session continue seconds to " + seconds + "s");
		FlurryAgent.setSessionContinueSeconds(seconds);
	},
    
	logError: function(errorId, message) {
		this.debugLog("Logging Flurry error: " + errorId + ": " + message);
		FlurryAgent.logError(errorId, message);
	},
    
	logEvent: function(eventId, params) {
		this.debugLog("Logging Flurry event: " + eventId);
		FlurryAgent.logEvent(eventId, params);
	},
    
	logTimedEventBegin: function(eventId) {
		this.debugLog("Logging timed Flurry event: " + eventId);
		FlurryAgent.logEvent(eventId, {}, true);
	},
    
	logTimedEventEnd: function(eventId) {
		this.debugLog("Logging end of timed Flurry event: " + eventId);
		FlurryAgent.endTimedEvent(eventId);
	},
    
	setCaptureUncaughtException: function(enabled) {
		this.debugLog("Flurry setCaptureUncaughtException unavailable with HTML5");
	},

    setDebugMode: function (debug) {
		this.debug = (debug ? true : false);
		FlurryAgent.setDebugLogEnabled(this.debug);
    },
	
	debugLog: function() {
		if (this.debug) {
			cc.log(arguments);
		}
	},

    getSDKVersion: function () {
		return FlurryAgent.getFlurryAgentVersion();
    },

    getPluginVersion: function () {
        return plugin.Version;
    }
});
