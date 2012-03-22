/****************************************************************************
 Copyright (c) 2010-2012 cocos2d-x.org
 Copyright (c) 2008-2010 Ricardo Quesada
 Copyright (c) 2011      Zynga Inc.

 http://www.cocos2d-x.org

 Created by JetBrains WebStorm.
 User: wuhao
 Date: 12-3-22

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
//browser detection, based on mootools
cc.Browser = cc.Class.extend({
    ctor:function()
    {
        this.ua = navigator.userAgent.toLowerCase();
        this.platform = navigator.platform.toLowerCase();
        this.UA = this.ua.match(/(opera|ie|firefox|chrome|version)[\s\/:]([\w\d\.]+)?.*?(safari|version[\s\/:]([\w\d\.]+)|$)/) || [null, 'unknown', 0];
        this.mode = this.UA[1] == 'ie' && document.documentMode;
    }
});
cc.Browser.init = function()
{
    if(!cc.Browser.ins)
    {
        cc.Browser.ins = new cc.Browser();
    }
    return cc.Browser.ins;
};
//type, version, platform are actual variables not functions
cc.Browser.type = function()
{
    var that = cc.Browser.init();
    return (that.UA[1] == 'version') ? that.UA[3] : that.UA[1];
}();
cc.Browser.version = function()
{
    var that = cc.Browser.init();
    return parseFloat(that.mode || (that.UA[1] == 'opera' && that.UA[4]) ? that.UA[4] : that.UA[2]);
}();
cc.Browser.platform = function()
{
    var that = cc.Browser.init();
    return that.ua.match(/ip(?:ad|od|hone)/) ? 'ios' : (that.ua.match(/(?:webos|android)/) || that.platform.match(/mac|win|linux/) || ['other'])[0]
}();
cc.Browser.prefix = function()
{
    switch(cc.Browser.type)
    {
        case "firefox":
            return "-moz-";
        case "chrome":
        case "safari":
            return "-webkit-";
        case "opera":
            return "-o-";
        case "ie":
            return "-ms-";
        default:
            return "";
    }
}();
cc.domNode = cc.Class.extend({
    _m_nZOrder:0,//z-index;
    _m_fRotation:0.0,
    _m_fScaleX:1.0,
    _m_fScaleY:1.0,
    _m_tPosition:{x:0,y:0},
    _m_tPositionInPixels:{x:0,y:0},
    _m_fSkewX:0.0,
    _m_fSkewY:0.0,
    _m_pChildren:[],
    _m_tAnchorPoint:cc.PointZero(),
    _m_pParent:null,
    _domElement:null,
    getElement: function(){return this._domElement},
    transform: function()
    {

    },
    _transform:{
        skew:function(x,y)
        {
            return "skew("+x+"deg, "+y+"deg)";
        },
        skewX:function(x)
        {
            return "skewX("+x+"deg)";
        },
        skewY:function(Y)
        {
            return "skewY("+Y+"deg)";
        },
        rotate:function(x)
        {
            return "rotate("+x+"deg)";
        },
        translate:function(x,y)
        {
            return "translate("+x+"px, "+y+"px)";
        },
        translateX:function(x)
        {
            return "translateX("+x+"px)";
        },
        translateY:function(y)
        {
            return "translateY("+y+"px)";
        },
        scale:function(x,y)
        {
            return "scale("+x+", "+y+")";
        },
        scaleX:function(x)
        {
            return "scaleX("+x+")";
        },
        scaleY:function(Y)
        {
            return "scaleY("+Y+")";
        }
    },
    ctor:function()
    {
        this._domElement = cc.$new('div');
        this.style = this._domElement.style;
        this.style[cc.Browser.prefix+"transform-origin"] = "50% 50%";
        this.style["float"] = "left";
    },
    test:function()
    {
        this.style.background = "red";
        this.style.height = "200px";
        this.style.width = "200px";
        this.style["float"] ="left";

        cc.$("body").appendChild(this._domElement);
    },
    getSkewX:function () {
        return this._m_fSkewX;
    },
    setSkewX:function (newSkewX) {
        this._m_fSkewX = newSkewX;
        //this._domElement.style.transform
    },
    setPosition: function(x,y)
    {
        if(!y)//if only 1 param, then x is an object
        {
            this._m_tPosition = x;
        }
        else{
            this._m_tPosition = {x:x, y:y};
        }
        //this.transform.translate;
        this.style[cc.Browser.prefix+"transform"] = this._transform.translate(x, y);
    }
});