/*

Functions available from FlurryAgent v1.0.0:

setAppVersion: function,
getFlurryAgentVersion: function,
setShowErrorInLogEnabled: function,
setDebugLogEnabled: function,
setSessionContinueSeconds: function,
setRequestInterval: function,
startSession: function,
endSession: function,
pauseSession: function,
logEvent: function,
endTimedEvent: function,
timedEvents: function,
logError: function,
logPurchase: function,
setUserId: function,
setAge: function,
setGender: function,
setLocation: function,
setEventLogging: function,
requestCallback: function

*/

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
