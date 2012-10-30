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
 * @constant
 * @type Number
 */
cc.SAX_NONE = 0;

/**
 * @constant
 * @type Number
 */
cc.SAX_KEY = 1;

/**
 * @constant
 * @type Number
 */
cc.SAX_DICT = 2;

/**
 * @constant
 * @type Number
 */
cc.SAX_INT = 3;

/**
 * @constant
 * @type Number
 */
cc.SAX_REAL = 4;

/**
 * @constant
 * @type Number
 */
cc.SAX_STRING = 5;

/**
 * @constant
 * @type Number
 */
cc.SAX_ARRAY = 6;

/**
 * @namespace
 */
cc.FileUtils = cc.Class.extend({
    _fileDataCache:null,

    ctor:function(){
       this._fileDataCache = {};
    },
    /**
     * Get resource file data
     * @function
     * @param {String} fileName The resource file name which contain the path
     * @param {String} mode mode The read mode of the file
     * @param {Number} size If get the file data succeed the it will be the data size,or it will be 0
     * @warning If you get the file data succeed,you must delete it after used.
     */
    getFileData:function (fileName, mode, size) {
        if(this._fileDataCache.hasOwnProperty(fileName))
            return this._fileDataCache[fileName];

        return this._loadBinaryFileData(fileName);
    },

    preloadBinaryFileData:function(fileUrl){
        var selfPointer = this;
        var xhr = new XMLHttpRequest();
        xhr.open("GET", fileUrl, true);
        if(xhr.overrideMimeType)
            xhr.overrideMimeType("text\/plain; charset=x-user-defined");
        xhr.onload = function(e) {
            var arrayStr = xhr.responseText;
            if(arrayStr){
                cc.Loader.getInstance().onResLoaded();
                selfPointer._fileDataCache[fileUrl] = selfPointer._stringConvertToArray(arrayStr);
            }
        };
        xhr.send(null);
    },

    _loadBinaryFileData:function(fileUrl){
        var req = new XMLHttpRequest();
        req.open('GET', fileUrl, false);
        if(req.overrideMimeType)
            req.overrideMimeType('text\/plain; charset=x-user-defined');
        req.send(null);
        if (req.status != 200)
            return '';

        var arrayInfo = this._stringConvertToArray(req.responseText);
        this._fileDataCache[fileUrl] = arrayInfo;
        return arrayInfo;
    },

    _stringConvertToArray:function(strData){
        if(!strData)
            return null;

        var arrData = new Uint8Array(strData.length);
        for(var i = 0; i< strData.length; i++){
            arrData[i] = strData.charCodeAt(i) ; //& 0xff;
        }
        return arrData;
    },

    /**
     * Get resource file data from zip file
     * @function
     * @param {String} pszZipFilePath
     * @param {String} fileName fileName The resource file name which contain the relative path of zip file
     * @param {Number} size size If get the file data succeed the it will be the data size,or it will be 0
     * @warning If you get the file data succeed,you must delete it after used.
     * @deprecated
     */
    getFileDataFromZip:function (pszZipFilePath, fileName, size) {
    },

    /**
     * removes the HD suffix from a path
     * @function
     * @param {String} path
     * @deprecated
     */
    removeSuffixFromFile:function (path) {
    },

//////////////////////////////////////////////////////////////////////////
// Notification support when getFileData from invalid file path.
//////////////////////////////////////////////////////////////////////////
    /**
     * Notification support when getFileData from invalid file path.
     * @function
     * @type {Boolean}
     */
    popupNotify:true,

    /**
     * Generate the absolute path of the file.
     * @function
     * @param {String} pszRelativePath
     * @return {String} The absolute path of the file.
     * @warning We only add the ResourcePath before the relative path of the file. <br/>
     * If you have not set the ResourcePath,the function add "/NEWPLUS/TDA_DATA/UserData/" as default.<br/>
     * You can set ResourcePath by function void setResourcePath(const char *resourcePath);
     */
    fullPathFromRelativePath:function (pszRelativePath) {
        return pszRelativePath;
    },

    /**
     * Generate the relative path of the file.
     * @function
     * @param {String} filename
     * @param {String} relativeFile
     * @return {String}
     */
    fullPathFromRelativeFile:function (filename, relativeFile) {
        var tmpPath;
        if (filename) {
            tmpPath = relativeFile.substring(0, relativeFile.lastIndexOf("/") + 1);
            return tmpPath + filename;
        }
        else {
            tmpPath = relativeFile.substring(0, relativeFile.lastIndexOf("."));
            tmpPath = tmpPath + ".png";
            return tmpPath;
        }
    },

    /**
     * Set the ResourcePath,we will find resource in this path
     * @function
     * @param {String} resourcePath The absolute resource path
     * @warning Don't call this function in android and iOS, it has not effect.<br/>
     * In android, if you want to read file other than apk, you shoud use invoke getFileData(), and pass the<br/>
     * absolute path.
     * @deprecated
     */
    setResourcePath:function (resourcePath) {
    },

    /**
     * Generate an Dictionary of object by file
     * @function
     * @param fileName The file name of *.plist file
     * @return {object} The Dictionary of object generated from the file
     */
    dictionaryWithContentsOfFile:function (fileName) {
        var parser = cc.SAXParser.getInstance();
        this.rootDict = parser.parse(fileName);
        return this.rootDict;
    },

    /**
     * The same meaning as dictionaryWithContentsOfFile(), but it doesn't call autorelease, so the invoker should call release().
     * @function
     * @param {String} fileName
     * @return {object} The Dictionary of object generated from the file
     */
    dictionaryWithContentsOfFileThreadSafe:function (fileName) {
        var tMaker = new cc.DictMaker();
        return tMaker.dictionaryWithContentsOfFile(fileName);
    },

    /**
     * Get the writeable path
     * @function
     * @return  The path that can write/read file
     * @deprecated
     */
    getWriteablePath:function () {
    },

    /**
     * Set whether pop-up a message box when the image load failed
     * @function
     * @param {Boolean} notify
     */
    setPopupNotify:function (notify) {
        cc.popupNotify = notify;
    },

    /**
     * Get whether pop-up a message box when the image load failed
     * @function
     * @return {Boolean}
     */
    isPopupNotify:function () {
        return cc.popupNotify;
    }
});

cc.s_SharedFileUtils = null;
cc.FileUtils.getInstance =  function(){
    if(cc.s_SharedFileUtils == null){
        cc.s_SharedFileUtils =  new cc.FileUtils();
    }
    return cc.s_SharedFileUtils;
};

/**
 * plist Dictionary Maker
 * @class
 * @extends cc.Class
 * @example
 * //create a DictMaker
 * var tMaker = new cc.DictMaker();
 * tMaker.dictionaryWithContentsOfFile(fileName);
 */
cc.DictMaker = cc.Class.extend(/** @lends cc.DictMaker# */{
    rootDict:[],
    /**
     * Generate dictionary with contents of file
     * @param {String} fileName
     * @return {Array}
     */
    dictionaryWithContentsOfFile:function (fileName) {
        var parser = cc.SAXParser.getInstance();
        this.rootDict = parser.parse(fileName);
        return this.rootDict;
    }
});
