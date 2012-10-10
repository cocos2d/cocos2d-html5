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
    var newObj = (obj instanceof Array) ? [] : {};
    for (var key in obj) {
        var copy = obj[key];
        if (copy instanceof Array) {
            newObj[key] = cc.clone(copy);
        } else if (((typeof copy) == "object") && !(copy instanceof cc.Node)
            && !(copy instanceof HTMLElement)) {
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
    if ((typeof console.assert) == "function") {
        console.assert(cond, message);
    } else {
        if (!cond) {
            if (message) {
                alert(message);
            }
        }
    }
}

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
    }
    else if (cc.COCOS2D_DEBUG == 1) {
        cc.logINFO = cc.log;
        cc.logERROR = function () {
        };
    }
    else if (cc.COCOS2D_DEBUG > 1) {
        cc.logINFO = cc.log;
        cc.logERROR = cc.log;
    }// COCOS2D_DEBUG
}

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
