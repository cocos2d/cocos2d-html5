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

/**
 * @class ProtocolAnalytics
 */
plugin.ProtocolAnalytics = plugin.PluginProtocol.extend({

    /**
     * start analytics session
     * @param {String} appKey
     */
	startSession: function(appKey){
        if (typeof appKey !== 'string' || appKey.length === 0) {
            cc.log("The app key is empty for " + this.getPluginName());
        }
        else {
            plugin.PluginUtils.getPluginData(this).obj.startSession(appKey);
        }
	},

	/**
     @brief Stop a session.
     @warning This interface only worked on android
     */
	stopSession: function(){
        plugin.PluginUtils.getPluginData(this).obj.stopSession();
	},

    /**
     @brief Set the timeout for expiring a session.
     @param millis In milliseconds as the unit of time.
     */
	setSessionContinueMillis: function(millis) {
        if (typeof millis !== 'number') {
            cc.log("The parameter milliseconds is not a number for " + this.getPluginName());
        }
        else {
            plugin.PluginUtils.getPluginData(this).obj.setSessionContinueMillis(millis);
        }
	},
    
    /**
     @brief log an error
     @param errorId The identity of error
     @param message Extern message for the error
     */
	logError: function(errorId, message) {
        if (typeof errorId === 'undefined' || typeof message === 'undefined') {
            cc.log("The errorId or message is empty for " + this.getPluginName());
        }
        else {
            plugin.PluginUtils.getPluginData(this).obj.logError(errorId, message);
        }
	},
    
	/**
     @brief log an event.
     @param eventId The identity of event
     @param paramMap Extern parameters of the event, use NULL if not needed.
     */
	logEvent: function(eventId, params) {
        if (typeof eventId === 'undefined') {
            cc.log("The eventId is empty for " + this.getPluginName());
        }
        else {
            plugin.PluginUtils.getPluginData(this).obj.logEvent(eventId, params);
        }
	},
    
    /**
     @brief Track an event begin.
     @param eventId The identity of event
     */
	logTimedEventBegin: function(eventId) {
        if (typeof eventId === 'undefined') {
            cc.log("The eventId is empty for " + this.getPluginName());
        }
        else {
            plugin.PluginUtils.getPluginData(this).obj.logTimedEventBegin(eventId);
        }
	},
    
    /**
     @brief Track an event end.
     @param eventId The identity of event
     */
	logTimedEventEnd: function(eventId) {
        if (typeof eventId === 'undefined') {
            cc.log("The eventId is empty for " + this.getPluginName());
        }
        else {
            plugin.PluginUtils.getPluginData(this).obj.logTimedEventEnd(eventId);
        }
	},
    
	/**
     @brief Whether to catch uncaught exceptions to server.
     */
	setCaptureUncaughtException: function(enabled) {
        plugin.PluginUtils.getPluginData(this).obj.setCaptureUncaughtException(enabled);
	},
	
	/**
	 @brief Sets debug mode
	 @param enabled Boolean
	 */
	setDebugMode: function(enabled) {
		plugin.PluginUtils.getPluginData(this).obj.setDebugMode(enabled);
	}
});
