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
(function () {
    cc.Browser.ua = navigator.userAgent.toLowerCase();
    cc.Browser.platform = navigator.platform.toLowerCase();
    cc.Browser.UA = cc.Browser.ua.match(/(opera|ie|firefox|chrome|version)[\s\/:]([\w\d\.]+)?.*?(safari|version[\s\/:]([\w\d\.]+)|$)/) || [null, 'unknown', 0];
    cc.Browser.mode = cc.Browser.UA[1] == 'ie' && document.documentMode;
    cc.Browser.type = (cc.Browser.UA[1] == 'version') ? cc.Browser.UA[3] : cc.Browser.UA[1];
    cc.Browser.isMobile = (cc.Browser.ua.indexOf('mobile') != -1 || cc.Browser.ua.indexOf('android') != -1);

    var c = document["ccConfig"];
    // check supportWebGL item
    cc._userRenderMode = parseInt(c["renderMode"]) || 0;

    if(cc._userRenderMode === 1) {
         //canvas only
        cc.Browser.supportWebGL = false;
    } else{
        // WebGL first
        cc.Browser.supportWebGL = !(window.WebGLRenderingContext == null);
        var tempCanvas = document.createElement("Canvas");
        var tempContext = cc.create3DContext(tempCanvas, {'stencil':true, 'preserveDrawingBuffer':true });
        cc.Browser.supportWebGL = !(tempContext == null)
    }
    if(cc._userRenderMode === 2 && !cc.Browser.supportWebGL){
        // WebGL render only, but browser doesn't support WebGL.
        cc.__renderDoesnotSupport = true;
    }
})();

cc.RenderDoesnotSupport = function(){
    if(cc.__renderDoesnotSupport === "undefined")
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

        el.position = el.position || {x:0, y:0};
        el.rotation = el.rotation || 0;
        el.scale = el.scale || {x:1, y:1};
        el.skew = el.skew || {x:0, y:0};

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
    return {x:curleft, y:curtop};
};
