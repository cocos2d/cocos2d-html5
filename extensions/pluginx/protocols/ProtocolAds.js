/****************************************************************************
 Copyright (c) 2012+2013 cocos2d-x.org

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

plugin.AdsResultCode = {
    AdsReceived: 0,
    FullScreenViewShown: 1,
    FullScreenViewDismissed: 2,
    PointsSpendSucceed: 3,
	PointsSpendFailed: 4,
	NetworkError: 5,
	UnknownError: 6
};

plugin.AdsType = {
	BannerAd: 0,
	FullScreenAd: 1
};

plugin.AdsPos = {
	Center: 0,
	Top: 1,
	TopLeft: 2,
	TopRight: 3,
	Bottom: 4,
	BottomLeft: 5,
	BottomRight: 6
};

plugin.AdsResultListener = cc.Class.extend({
    /**
    @brief The advertisement request result
	@param code The result code
	@param msg The message
    */
    onAdsResult: function (code, msg) {
	},
	
    /**
    @brief Player get points from advertisement(For example: Tapjoy)
    @param points The point number player has got.
    @param pAdsPlugin  The plugin which the player get points. Used to spend the points.
    */
    onPlayerGetPoints: function (adsPlugin, points) {
	}
});

/**
 * @class ProtocolAds
 */
plugin.ProtocolAds = plugin.PluginProtocol.extend({
    /**
    @brief config the application info
    @param devInfo This parameter is the info of aplication,
           different plugin have different format
    @warning Must invoke this interface before other interfaces.
             And invoked only once.
    */
    configDeveloperInfo: function (devInfo) {
        if (typeof devInfo !== 'object') {
            cc.log("The devInfo is not an object for configDeveloperInfo() in " + this.getPluginName());
        }
        else {
            plugin.PluginUtils.getPluginData(this).obj.configDeveloperInfo(devInfo);
        }
	},

    /**
    @brief show adview
    @param type The adview type need to show.
    @param sizeEnum The size of the banner view.
                (only used when type is kBannerAd)
                In different plugin, it's have different mean.
                Pay attention to the subclass definition
    @param pos The position where the adview be shown.
               (only used when type is kBannerAd)
    */
    showAds: function (type, sizeEnum, pos) {
        if (typeof type === 'undefined') {
            cc.log("The type is empty for showAds() in " + this.getPluginName());
        }
        else {
            plugin.PluginUtils.getPluginData(this).obj.showAds(type, sizeEnum, pos);
        }
	},

    /**
    @brief Hide the adview
    @param type The adview type need to hide.
    */
    hideAds: function (type) {
        plugin.PluginUtils.getPluginData(this).obj.hideAds(type);
 	},

    /**
    @brief Spend the points.
           Use this method to notify server spend points.
    @param points Need spend number of points
    */
    spendPoints: function (points) {
        if (typeof points === 'undefined') {
            cc.log("Points is empty for spendPoints() in " + this.getPluginName());
        }
        else {
            plugin.PluginUtils.getPluginData(this).obj.spendPoints(points);
        }
	},

    /**
     @brief set the Ads listener
	 @param An instance of plugin.AdsResultListener
    */
    setAdsListener: function (listener) {
        if (typeof listener === 'undefined') {
            cc.log("Listener is empty for setAdsListener() in " + this.getPluginName());
        }
        else {
            plugin.PluginUtils.getPluginData(this).obj.setAdsListener(listener);
        }
	},

    /**
     @brief set debug mode
	 @param enabled
    */
    setDebugMode:function(enabled){
        plugin.PluginUtils.getPluginData(this).obj.setDebugMode(enabled ? true : false);
	}
});

