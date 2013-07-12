/**
 * Created with JetBrains WebStorm.
 * User: Administrator
 * Date: 13-6-20
 * Time: 下午2:29
 * To change this template use File | Settings | File Templates.
 */

cc.DecotativeDisplay = cc.Class.extend({
    _display:null,
    _colliderDetector:null,
    _displayData:null,

    ctor:function () {
        this._display = null;
        this._colliderDetector = null;
        this._displayData = null;
    },

    init:function () {

        return true;
    },
    anchorPointChanged:function(pointX, pointY){

    },
    setDisplay:function (display) {
        this._display = display;
    },

    getDisplay:function () {
        return this._display;
    },

    setColliderDetector:function (colliderDetector) {
        this._colliderDetector = colliderDetector;
    },

    getColliderDetector:function () {
        return this._colliderDetector;
    },

    setDisplayData:function (displayData) {
        this._displayData = displayData;
    },
    getDisplayData:function () {
        return this._displayData;
    },
    release:function () {
        CC_SAFE_RELEASE(this._display);
        this._display = null;
        CC_SAFE_RELEASE(this._displayData);
        this._displayData = null;
        CC_SAFE_RELEASE(this._colliderDetector);
        this._colliderDetector = null;
    }

});

cc.DecotativeDisplay.create = function () {
    var decotativeDisplay = new cc.DecotativeDisplay();
    if (decotativeDisplay && decotativeDisplay.init()) {
        return decotativeDisplay;
    }
    return null;
};