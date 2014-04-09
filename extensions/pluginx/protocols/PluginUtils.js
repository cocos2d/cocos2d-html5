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

/**
 * Open an URL address
 * @function
 */
cc.openURL = function (url) {
    if (this.isMobile) {
        var size = cc.director.getWinSize();
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
            //TODO need delete
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
    } else {
        window.open(url);
    }
};

plugin.PluginData = function (obj, className) {
    this.obj = obj;
    this.className = className;
};

plugin.PluginUtils = {
    _objMap:{},
    _pluginMap:{},
    initPlugin: function (tmpPlugin, obj, className) {
        var data = new plugin.PluginData(obj,className);
        this.setPluginData(tmpPlugin, data);
    },

    getPluginData: function (keyObj) {
        return this._objMap[keyObj._pluginName];
    },

    setPluginData: function (plugin, data) {
        this.erasePluginData(plugin);
        this._objMap[data.className] = data;
        this._pluginMap[data.className] = plugin;
    },

    erasePluginData: function (keyObj) {
       var data = this._objMap[keyObj];
       if(data){
           var key = data.className;

           var pluginIt = this._pluginMap[key];
           if (pluginIt)
           {
               delete this._pluginMap[key];
           }

           delete this._objMap[keyObj]
        }
    },

    getPluginPtr: function (obj) {
        return this._pluginMap[obj.className];
    },

    getObjFromParam: function (param) {

    },

    createDictFromMap: function (paramMap) {
        return paramMap;
    },

    /**
     @brief method don't have return value
     */
    callOCFunctionWithName_oneParam: function (tmpPlugin, funcName, param) {

    },
    callOCFunctionWithName: function (tmpPlugin, funcName) {
    },

    /**
     @brief method return int value
     */
    callOCIntFunctionWithName_oneParam: function (tmpPlugin, funcName, param) {
    },
    callOCIntFunctionWithName: function (tmpPlugin, funcName) {
    },

    /**
     @brief method return float value
     */
    callOCFloatFunctionWithName_oneParam: function (tmpPlugin, funcName, param) {
    },
    callOCFloatFunctionWithName: function (tmpPlugin, funcName) {
    },

    /**
     @brief method return bool value
     */
    callOCBoolFunctionWithName_oneParam: function (tmpPlugin, funcName, param) {
    },
    callOCBoolFunctionWithName: function (tmpPlugin, funcName) {
    },

    /**
     @brief method return string value
     */
    callOCStringFunctionWithName_oneParam: function (tmpPlugin, funcName, param) {
    },
    callOCStringFunctionWithName: function (tmpPlugin, funcName) {
    },

    callRetFunctionWithParam: function (tmpPlugin, funcName, param) {
    },
    callRetFunction: function (tmpPlugin, funcName) {
    }
};