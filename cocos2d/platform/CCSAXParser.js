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
 * a SAX Parser
 * @class
 * @extends cc.Class
 */
cc.SAXParser = cc.Class.extend(/** @lends cc.SAXParser# */{
    xmlDoc:null,
    parser:null,
    _xmlDict:null,
    plist:null,

    ctor:function () {
        this._xmlDict = {};
        this.plist = {};
    },

    /**
     * parse a xml from a string (xmlhttpObj.responseText)
     * @param {String} textxml plist xml contents
     * @return {Array} plist object array
     */
    parse:function (textxml) {
        textxml = this.getList(textxml);
        // get a reference to the requested corresponding xml file
        if (window.DOMParser) {
            this.parser = new DOMParser();
            this.xmlDoc = this.parser.parseFromString(textxml, "text/xml");
        } else {// Internet Explorer (untested!)
            this.xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
            this.xmlDoc.async = "false";
            this.xmlDoc.loadXML(textxml);
        }
        if (this.xmlDoc == null)
            cc.log("cocos2d:xml " + this.xmlDoc + " not found!");

        var plist = this.xmlDoc.documentElement;
        if (plist.tagName != 'plist')
            throw "cocos2d:Not a plist file";

        // Get first real node
        var node = null;
        for (var i = 0, len = plist.childNodes.length; i < len; i++) {
            node = plist.childNodes[i];
            if (node.nodeType == 1)
                break
        }
        this.plist = this._parseNode(node);
        return this.plist;
    },

    /**
     * parse a tilemap xml from a string (xmlhttpObj.responseText)
     * @param  {String} textxml  tilemap xml content
     * @return {Document} xml document
     */
    tmxParse:function (textxml, isXMLString) {
        if((isXMLString == null) || (isXMLString === false))
            textxml = this.getList(textxml);

        // get a reference to the requested corresponding xml file
        if (window.DOMParser) {
            this.parser = new DOMParser();
            this.xmlDoc = this.parser.parseFromString(textxml, "text/xml");
        } else { // Internet Explorer (untested!)
            this.xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
            this.xmlDoc.async = "false";
            this.xmlDoc.loadXML(textxml);
        }
        if (this.xmlDoc == null)
            cc.log("cocos2d:xml " + this.xmlDoc + " not found!");

        return this.xmlDoc;
    },

    _parseNode:function (node) {
        var data = null;
        switch (node.tagName) {
            case 'dict':
                data = this._parseDict(node);
                break;
            case 'array':
                data = this._parseArray(node);
                break;
            case 'string':
                if (node.childNodes.length == 1)
                    data = node.firstChild.nodeValue;
                else {
                    //handle Firefox's 4KB nodeValue limit
                    data = "";
                    for (var i = 0; i < node.childNodes.length; i++)
                        data += node.childNodes[i].nodeValue;
                }
                break;
            case 'false':
                data = false;
                break;
            case 'true':
                data = true;
                break;
            case 'real':
                data = parseFloat(node.firstChild.nodeValue);
                break;
            case 'integer':
                data = parseInt(node.firstChild.nodeValue, 10);
                break;
        }

        return data;
    },

    _parseArray:function (node) {
        var data = [];
        for (var i = 0, len = node.childNodes.length; i < len; i++) {
            var child = node.childNodes[i];
            if (child.nodeType != 1)
                continue;
            data.push(this._parseNode(child));
        }
        return data;
    },

    _parseDict:function (node) {
        var data = {};

        var key = null;
        for (var i = 0, len = node.childNodes.length; i < len; i++) {
            var child = node.childNodes[i];
            if (child.nodeType != 1)
                continue;

            // Grab the key, next noe should be the value
            if (child.tagName == 'key')
                key = child.firstChild.nodeValue;
            else
                data[key] = this._parseNode(child);                 // Parse the value node
        }
        return data;
    },

    /**
     * Preload plist file
     * @param {String} filePath
     */
    preloadPlist:function (filePath) {
        filePath = cc.FileUtils.getInstance().fullPathForFilename(filePath);

        if (window.XMLHttpRequest) {
            // for IE7+, Firefox, Chrome, Opera, Safari brower
            var xmlhttp = new XMLHttpRequest();
            // is xml file?
            if (xmlhttp.overrideMimeType)
                xmlhttp.overrideMimeType('text/xml');
        } else {
            // for IE6, IE5 brower
            xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
        }
        if (xmlhttp != null) {
            var that = this;
            xmlhttp.onreadystatechange = function () {
                if (xmlhttp.readyState == 4) {
                    if (xmlhttp.responseText) {
                        cc.Loader.getInstance().onResLoaded();
                        that._xmlDict[filePath] = xmlhttp.responseText;
                        xmlhttp = null;
                    } else
                        cc.Assert("cocos2d:There was a problem retrieving the xml data:" + xmlhttp.statusText);
                }
            };
            // load xml
            xmlhttp.open("GET", filePath, true);
            xmlhttp.send(null);
        } else
            cc.Assert("cocos2d:Your browser does not support XMLHTTP.");
    },

    /**
     * get filename from filepath
     * @param {String} filePath
     * @return {String}
     */
    getName:function (filePath) {
        var startPos = filePath.lastIndexOf("/", filePath.length) + 1;
        var endPos = filePath.lastIndexOf(".", filePath.length);
        return filePath.substring(startPos, endPos);
    },

    /**
     * get file extension name from filepath
     * @param {String} filePath
     * @return {String}
     */
    getExt:function (filePath) {
        var startPos = filePath.lastIndexOf(".", filePath.length) + 1;
        return filePath.substring(startPos, filePath.length);
    },

    /**
     * get value by key from xmlList
     * @param {String} key
     * @return {String} xml content
     */
    getList:function (key) {
        if (this._xmlDict != null) {
            return this._xmlDict[key];
        }
        return null;
    }
});

/**
 * get a singleton SAX parser
 * @function
 * @return {cc.SAXParser}
 */
cc.SAXParser.getInstance = function () {
    if (!this._instance) {
        this._instance = new cc.SAXParser();
    }
    return this._instance;
};

cc.SAXParser._instance = null;