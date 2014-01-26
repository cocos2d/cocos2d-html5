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
 * create a webgl context
 * @param {HTMLCanvasElement} canvas
 * @param {Object} opt_attribs
 * @return {WebGLRenderingContext}
 */
cc.create3DContext = function (canvas, opt_attribs) {
    var names = ["webgl", "experimental-webgl", "webkit-3d", "moz-webgl"];
    var context = null;
    for (var ii = 0; ii < names.length; ++ii) {
        try {
            context = canvas.getContext(names[ii], opt_attribs);
        } catch (e) {
        }
        if (context) {
            break;
        }
    }
    return context;
};

/**
 * Browser detection, based on mootools<br/>
 * platform will print out win32, mac, etc<br/>
 * type is the browser type, chrome, firefox etc
 * @type {Object}
 */
cc.Browser = {};

/**
 * Browsers that Cocos2d-HTML5 support well in WebGL render mode
 * @type {Array}
 */
cc.Browser.webglWhiteList = ["baidubrowser", "opera", "firefox", "chrome", "safari"];

/**
 * Browsers that multiple audio support well
 * @type {Array}
 */
cc.Browser.multipleAudioWhiteList = ["baidubrowser", "opera", "firefox", "chrome", "safari", "ucbrowser", "qqbrowser", "mqqbrowser"];

(function () {
    var ua = navigator.userAgent;
    cc.Browser.ua = ua.toLowerCase();
    cc.Browser.platform = navigator.platform.toLowerCase();
    cc.Browser.isMobile = (cc.Browser.ua.indexOf('mobile') != -1 || cc.Browser.ua.indexOf('android') != -1);
    cc.Browser.type = (function () {
        var browserTypes = cc.Browser.ua.match(/micromessenger|qqbrowser|mqqbrowser|ucbrowser|360browser|baiduboxapp|baidubrowser|maxthon|ie|opera|miuibrowser|firefox/)
            || cc.Browser.ua.match(/chrome|safari/);

        if (browserTypes && browserTypes.length > 0) {
            var el = browserTypes[0];
            if (el == 'micromessenger') {
                return 'wechat';
            }else if( el === "safari" && (cc.Browser.ua.match(/android.*applewebkit/) != null))
                return "androidbrowser";
            return el;
        }
        return "unknow";
    })();
    cc.Browser.mode = cc.Browser.type == 'ie' && document.documentMode;

    if (!document["ccConfig"])
        document["ccConfig"] = {};

    var c = document["ccConfig"];
    // check supportWebGL item
    cc._userRenderMode = parseInt(c["renderMode"]) || 0;

    var notInWhiteList = cc.Browser.webglWhiteList.indexOf(cc.Browser.type) == -1;
    if (cc._userRenderMode === 1 || (cc._userRenderMode === 0 && (cc.Browser.isMobile || notInWhiteList))) {
        //canvas only
        cc.Browser.supportWebGL = false;
    } else {
        // WebGL first
        cc.Browser.supportWebGL = !(window.WebGLRenderingContext == null);
        var tempCanvas = document.createElement("Canvas");
        var tempContext = cc.create3DContext(tempCanvas, {'stencil': true, 'preserveDrawingBuffer': true });
        cc.Browser.supportWebGL = !(tempContext == null)
    }
    if (cc._userRenderMode === 2 && !cc.Browser.supportWebGL) {
        // WebGL render only, but browser doesn't support WebGL.
        cc.__renderDoesnotSupport = true;
    }

    // check if browser supports Web Audio
    cc.Browser.supportWebAudio = (function () {
        // check Web Audio's context
        try {
            var ctx = new (window.AudioContext || window.webkitAudioContext || window.mozAudioContext)();
            return ctx ? true : false;
        } catch (e) {
            return false;
        }
    })();


    cc.Browser.openURL = function (url) {
        if (this.isMobile) {
            var size = cc.Director.getInstance().getWinSize();
            var w = size.width + "px";
            var h = size.height + "px";

            var div = cc.$new("div");
            div.style.backgroundColor = "#ffffff";
            div.style.width = w;
            div.style.height = h;
            div.style.zindex = 1000;
            div.style.position = 'absolute';
            div.style.top = 0 + 'px';
            div.style.left = 0 + 'px';
            div.id = "cocos2d-browser";

            var iframe = cc.$new("iframe");
            iframe.src = url;
            iframe.style.width = w;
            iframe.style.height = h;
            iframe.setAttribute("frameborder", "no");
            iframe.setAttribute("scrolling", "no");
            div.appendChild(iframe);

            iframe.onload = function () {
                var close = document.createElement('img');
                close.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACEAAAAhCAYAAABX5MJvAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyRpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoTWFjaW50b3NoKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo5OERBMEM3OUQzRTMxMUUyODg2Q0RFNjU1QkU1RjlFQSIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo5OERBMEM3QUQzRTMxMUUyODg2Q0RFNjU1QkU1RjlFQSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjk4REEwQzc3RDNFMzExRTI4ODZDREU2NTVCRTVGOUVBIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjk4REEwQzc4RDNFMzExRTI4ODZDREU2NTVCRTVGOUVBIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+NwBuoAAAA/tJREFUeNrEWF0sW3EUb6+28zFhbGadsBaNhazV+kpDYhFWKRGWbHvwFV5IvPiIFw9evElEPEiWSUgsIWoIglhmUomPxj6aKC0zKVJjtPU5o9j5J7dLdbf33jKc5Jfc3v+v5/+755x7/j1lMoiNBRDh4AO88HvO2m+ACbAC+AJQAyz2JCbBFyMBWQA/xv+3DUAXLuivudhcY4BMwCuAB+NqDPmNAnAAOsCZvQgk4BnjeiwEwAbM2YoQA14yrteQEANgDcML7gXjZgw9OAuJkADu3JAIb7Q/hr+GtCwuLs6LDq+iooLvhBAREhFEl11ZWRne0tIiIeNIpVKv4uJi4dTUVApNt0EY3ohILSIiwqO7u1sql8vD8vLyJJ2dnXH2HDabzczPz3/Y1taWzOfz78XExDxSq9Vyd3d3jMK9F2pWr6lEtLa2RmVnZ4tt7w0NDWlTU1OVtkK7urqSQ0NDzzW5hYWFjcTExAGDwXDkyD+VSkZ7e3tsWlpamP19mUwWplQqk9B1UlKST3NzczxE4K49D4mCiDwn24PyPMjIyHjs6urKIVpLSEgInp6eZsM6Kzw8nEvEMZvNBxC1BbI9KCMhkUgUy8vLRpL1QIFA4EcSyZmcnJzpS4mYnZ3dj46O7p2fn193xIGi/CeiFovlFIp5pqGhYZ5qD1qFiQxCjk1OTsqEQmEAFReloL+/X0sVAadFWE2n02VA+O+TcVZXV01QkO8ODw9P6fjEnO2zvb2936g4XC7XG4rWm65P2iL8/f05kN8nBQUFQkqnGMYcGBjIys3N5dLxjY7ydDrE6urqsNLSUqmbmxuH1tOBkMzMTIHRaNxSqVTmS4soKyvjFRUViTw9PV2dTR901WAOh7M/MjKyeeHCbGpqEhcWFkY5Wl9aWtpUKBRaONziSbsii/Xm5OTk7EIdU6/X7zpaW1xc/Al5HxkfH9/e2dk5rqmpeUrE6+vr06ADzpEIlI5kMjFwPhh5PB5DJBKdK7KDg4Oj2tpaVUdHxw/0eWxszIjyj8Jvy4N60FdVVX2Grnt4dkaowYJESAG3yaLR09Oz5uvrexwbGxuAR2erpKTkI6RqxW5DM6RnLT09PQQV5vDwsDYlJWUU+I4EIDMhEQLAA6q0DA4OrqMCg/c/qL6+XtXY2Kgn4sGJuavRaFbFYrFPeXn5FIj6ReFa64KnIpJOpaMK39vbM9XV1X13lF9kc3Nz+xMTEwZo89s03A4ycRE1N/RjF/WPKgyfDRU39Gu7w1qYyNYAtwDB1yhgGPDBfgzU4bMi7xoEjAI6iWZRdGMGH80Cr2goRlP5W8B7qwBHfw1YO6kEH4yC8EnJ5QKbnuDFh17nr4BPRP9P/BFgAHo7ZNgI9EbHAAAAAElFTkSuQmCC";
                div.appendChild(close);
                close.style.zindex = 1000;
                close.style.position = 'absolute';
                close.style.bottom = 10 + 'px';
                close.style.right = 10 + 'px';
                close.onclick = function () {
                    div.remove();
                }
            };

            var tag = document['ccConfig'].tag;
            var parent = document.getElementById(tag).parentNode;
            if (parent) {
                parent.appendChild(div);
            }
        }
        else {
            window.open(url);
        }
    }
})();

cc.RenderDoesnotSupport = function () {
    if (cc.__renderDoesnotSupport === "undefined")
        return false;
    return cc.__renderDoesnotSupport;
};


/**
 * the dollar sign, classic like jquery, this selector add extra methods to HTMLElement without touching its prototype</br>
 * it is also chainable like jquery
 * @param {HTMLElement|String} x pass in a css selector in string or the whole HTMLElement
 * @class
 * @return {cc.$}
 */
cc.$ = function (x) {
    /** @lends cc.$# */
    var parent = (this == cc) ? document : this;

    /**
     * @type {HTMLElement}
     */
    var el = (x instanceof HTMLElement) ? x : parent.querySelector(x);

    if (el) {
        /**
         * find and return the child wth css selector (same as jquery.find)
         * @param {HTMLElement|String} x pass in a css selector in string or the whole HTMLElement
         * @return {cc.$}
         */
        el.find = el.find || cc.$;
        /**
         * check if a DOMNode has a specific class
         * @param {String} cls
         * @return {Boolean}
         */
        el.hasClass = el.hasClass || function (cls) {
            return this.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'));
        };
        /**
         * add a class to a DOMNode, returns self to allow chaining
         * @param {String} cls
         * @return {cc.$}
         */
        el.addClass = el.addClass || function (cls) {
            if (!this.hasClass(cls)) {
                if (this.className) {
                    this.className += " ";
                }
                this.className += cls;
            }
            return this;
        };
        /**
         * remove a specific class from a DOMNode, returns self to allow chaining
         * @param {String} cls
         * @return {cc.$}
         */
        el.removeClass = el.removeClass || function (cls) {
            if (this.hasClass(cls)) {
                this.className = this.className.replace(cls, '');
            }
            return this;
        };
        /**
         * detach it self from parent
         * @function
         */
        el.remove = el.remove || function () {
            if (this.parentNode)
                this.parentNode.removeChild(this);
            return this;
        };

        /**
         * add to another element as a child
         * @param {HTMLElement|cc.$} x
         * @return {cc.$}
         */
        el.appendTo = el.appendTo || function (x) {
            x.appendChild(this);
            return this;
        };

        /**
         * add to another element as a child and place on the top of the children list
         * @param {HTMLElement|cc.$} x
         * @return {cc.$}
         */
        el.prependTo = el.prependTo || function (x) {
            ( x.childNodes[0]) ? x.insertBefore(this, x.childNodes[0]) : x.appendChild(this);
            return this;
        };

        /**
         * helper function for updating the css transform
         * @return {cc.$}
         */
        el.transforms = el.transforms || function () {
            this.style[cc.$.trans] = cc.$.translate(this.position) + cc.$.rotate(this.rotation) + cc.$.scale(this.scale) + cc.$.skew(this.skew);
            return this;
        };

        el.position = el.position || {x: 0, y: 0};
        el.rotation = el.rotation || 0;
        el.scale = el.scale || {x: 1, y: 1};
        el.skew = el.skew || {x: 0, y: 0};

        /**
         * move the element
         * @param {Number} x in pixel
         * @param {Number} y in pixel
         * @return {cc.$}
         */
        el.translates = function (x, y) {
            this.position.x = x;
            this.position.y = y;
            this.transforms();
            return this
        };

        /**
         * rotate the element
         * @param {Number} x in degrees
         * @return {cc.$}
         */
        el.rotate = function (x) {
            this.rotation = x;
            this.transforms();
            return this
        };

        /**
         * resize the element
         * @param {Number} x
         * @param {Number} y
         * @return {cc.$}
         */
        el.resize = function (x, y) {
            this.scale.x = x;
            this.scale.y = y;
            this.transforms();
            return this
        };

        /**
         * skews the element
         * @param {Number} x in degrees
         * @param {Number} y
         * @return {cc.$}
         */
        el.setSkew = function (x, y) {
            this.skew.x = x;
            this.skew.y = y;
            this.transforms();
            return this
        };
    }
    return el;
};
//getting the prefix and css3 3d support
switch (cc.Browser.type) {
    case "firefox":
        cc.$.pfx = "Moz";
        cc.$.hd = true;
        break;
    case "chrome":
    case "safari":
        cc.$.pfx = "webkit";
        cc.$.hd = true;
        break;
    case "opera":
        cc.$.pfx = "O";
        cc.$.hd = false;
        break;
    case "ie":
        cc.$.pfx = "ms";
        cc.$.hd = false;
        break;
    default:
        cc.$.pfx = "webkit";
        cc.$.hd = true;
}
//cache for prefixed transform
cc.$.trans = cc.$.pfx + "Transform";
//helper function for constructing transform strings
cc.$.translate = (cc.$.hd) ? function (a) {
    return "translate3d(" + a.x + "px, " + a.y + "px, 0) "
} : function (a) {
    return "translate(" + a.x + "px, " + a.y + "px) "
};
cc.$.rotate = (cc.$.hd) ? function (a) {
    return "rotateZ(" + a + "deg) ";
} : function (a) {
    return "rotate(" + a + "deg) ";
};
cc.$.scale = function (a) {
    return "scale(" + a.x + ", " + a.y + ") "
};
cc.$.skew = function (a) {
    return "skewX(" + -a.x + "deg) skewY(" + a.y + "deg)";
};


/**
 * Creates a new element, and adds cc.$ methods
 * @param {String} x name of the element tag to create
 * @return {cc.$}
 */
cc.$new = function (x) {
    return cc.$(document.createElement(x))
};
cc.$.findpos = function (obj) {
    var curleft = 0;
    var curtop = 0;
    do {
        curleft += obj.offsetLeft;
        curtop += obj.offsetTop;
    } while (obj = obj.offsetParent);
    return {x: curleft, y: curtop};
};
