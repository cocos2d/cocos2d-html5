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
 * copy an new object
 * @function
 * @param {object|Array} obj source object
 * @return {Array|object}
 */
cc.clone = function (obj) {
    // Cloning is better if the new object is having the same prototype chain
    // as the copied obj (or otherwise, the cloned object is certainly going to
    // have a different hidden class). Play with C1/C2 of the
    // PerformanceVirtualMachineTests suite to see how this makes an impact
    // under extreme conditions.
    //
    // Object.create(Object.getPrototypeOf(obj)) doesn't work well because the
    // prototype lacks a link to the constructor (Carakan, V8) so the new
    // object wouldn't have the hidden class that's associated with the
    // constructor (also, for whatever reasons, utilizing
    // Object.create(Object.getPrototypeOf(obj)) + Object.defineProperty is even
    // slower than the original in V8). Therefore, we call the constructor, but
    // there is a big caveat - it is possible that the this.init() in the
    // constructor would throw with no argument. It is also possible that a
    // derived class forgets to set "constructor" on the prototype. We ignore
    // these possibities for and the ultimate solution is a standardized
    // Object.clone(<object>).
    var newObj = new obj.constructor;

    // Assuming that the constuctor above initialized all properies on obj, the
    // following keyed assignments won't turn newObj into dictionary mode
    // becasue they're not *appending new properties* but *assigning existing
    // ones* (note that appending indexed properties is another story). See
    // CCClass.js for a link to the devils when the assumption fails.
    for (var key in obj) {
        var copy = obj[key];
        // Beware that typeof null == "object" !
        if (((typeof copy) == "object") && copy &&
            !(copy instanceof cc.Node) && !(copy instanceof HTMLElement)) {
            newObj[key] = cc.clone(copy);
        } else {
            newObj[key] = copy;
        }
    }
    return newObj;
};

/**
 * Function added for JS bindings compatibility. Not needed in cocos2d-html5.
 * @function
 * @param {object} jsobj subclass
 * @param {object} klass superclass
 */
cc.associateWithNative = function (jsobj, superclass) {
};

/**
 * Is show bebug info on web page
 * @constant
 * @type {Boolean}
 */
cc.IS_SHOW_DEBUG_ON_PAGE = cc.IS_SHOW_DEBUG_ON_PAGE || false;

cc._logToWebPage = function (message) {
    var logList = document.getElementById("logInfoList");
    if (!logList) {
        var logDiv = document.createElement("Div");
        logDiv.setAttribute("id", "logInfoDiv");
        cc.canvas.parentNode.appendChild(logDiv);
        logDiv.setAttribute("width", "300");
        logDiv.setAttribute("height", cc.canvas.height);
        logDiv.style.zIndex = "99999";
        logDiv.style.position = "absolute";
        logDiv.style.top = "0";
        logDiv.style.left = "0";

        logList = document.createElement("ul");
        logDiv.appendChild(logList);
        logList.setAttribute("id", "logInfoList");
        logList.style.height = "450px";
        logList.style.color = "#fff";
        logList.style.textAlign = "left";
        logList.style.listStyle = "disc outside";
        logList.style.fontSize = "12px";
        logList.style.fontFamily = "arial";
        logList.style.padding = "0 0 0 20px";
        logList.style.margin = "0";
        logList.style.textShadow = "0 0 3px #000";
        logList.style.zIndex = "99998";
        logList.style.position = "absolute";
        logList.style.top = "0";
        logList.style.left = "0";
        logList.style.overflowY = "hidden";

        var tempDiv = document.createElement("Div");
        logDiv.appendChild(tempDiv);
        tempDiv.style.width = "300px";
        tempDiv.style.height = cc.canvas.height + "px";
        tempDiv.style.opacity = "0.1";
        tempDiv.style.background = "#fff";
        tempDiv.style.border = "1px solid #dfdfdf";
        tempDiv.style.borderRadius = "8px";
    }
    var addMessage = document.createElement("li");
    //var now = new Date();
    //addMessage.innerHTML = now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds() + " " + now.getMilliseconds() + " " + message;
    addMessage.innerHTML = message;
    if (logList.childNodes.length == 0) {
        logList.appendChild(addMessage);
    } else {
        logList.insertBefore(addMessage, logList.childNodes[0]);
    }
};

/**
 * Output Debug message.
 * @function
 * @param {String} message
 */
cc.log = function (message) {
    if (!cc.IS_SHOW_DEBUG_ON_PAGE) {
        console.log(message);
    } else {
        cc._logToWebPage(message);
    }
};

/**
 * Pop out a message box
 * @param {String} message
 * @function
 */
cc.MessageBox = function (message) {
    console.log(message);
};

/**
 * Output Assert message.
 * @function
 * @param {Boolean} cond If cond is false, assert.
 * @param {String} message
 */
cc.Assert = function (cond, message) {
    if (console.assert)
        console.assert(cond, message);
    else {
        if (!cond) {
            if (message)
                alert(message);
        }
    }
};

/**
 * Update Debug setting.
 * @function
 */
cc.initDebugSetting = function () {
    // cocos2d debug
    if (cc.COCOS2D_DEBUG == 0) {
        cc.log = function () {
        };
        cc.logINFO = function () {
        };
        cc.logERROR = function () {
        };
        cc.Assert = function () {
        };
    } else if (cc.COCOS2D_DEBUG == 1) {
        cc.logINFO = cc.log;
        cc.logERROR = function () {
        };
    } else if (cc.COCOS2D_DEBUG > 1) {
        cc.logINFO = cc.log;
        cc.logERROR = cc.log;
    }// COCOS2D_DEBUG
};

// Enum the language type supportted now
/**
 * English language code
 * @constant
 * @type Number
 */
cc.LANGUAGE_ENGLISH = 0;

/**
 * Chinese language code
 * @constant
 * @type Number
 */
cc.LANGUAGE_CHINESE = 1;

/**
 * French language code
 * @constant
 * @type Number
 */
cc.LANGUAGE_FRENCH = 2;

/**
 * Italian language code
 * @constant
 * @type Number
 */
cc.LANGUAGE_ITALIAN = 3;

/**
 * German language code
 * @constant
 * @type Number
 */
cc.LANGUAGE_GERMAN = 4;

/**
 * Spanish language code
 * @constant
 * @type Number
 */
cc.LANGUAGE_SPANISH = 5;

/**
 * Russian language code
 * @constant
 * @type Number
 */
cc.LANGUAGE_RUSSIAN = 6;

/**
 * Korean language code
 * @constant
 * @type Number
 */
cc.LANGUAGE_KOREAN = 7;

/**
 * Japanese language code
 * @constant
 * @type Number
 */
cc.LANGUAGE_JAPANESE = 8;

/**
 * Hungarian language code
 * @constant
 * @type Number
 */
cc.LANGUAGE_HUNGARIAN = 9;

/**
 * Portuguese language code
 * @constant
 * @type Number
 */
cc.LANGUAGE_PORTUGUESE = 10;

/**
 * Arabic language code
 * @constant
 * @type Number
 */
cc.LANGUAGE_ARABIC = 11;

/**
 * Norwegian language code
 * @constant
 * @type Number
 */
cc.LANGUAGE_NORWEGIAN = 12;

/**
 * Polish language code
 * @constant
 * @type Number
 */
cc.LANGUAGE_POLISH = 13;


