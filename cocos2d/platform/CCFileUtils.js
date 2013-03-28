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

//Compatibility with IE9
var Uint8Array = Uint8Array || Array;

if (/msie/i.test(navigator.userAgent) && !/opera/i.test(navigator.userAgent)) {
    var IEBinaryToArray_ByteStr_Script =
        "<!-- IEBinaryToArray_ByteStr -->\r\n" +
            //"<script type='text/vbscript'>\r\n" +
            "Function IEBinaryToArray_ByteStr(Binary)\r\n" +
            "   IEBinaryToArray_ByteStr = CStr(Binary)\r\n" +
            "End Function\r\n" +
            "Function IEBinaryToArray_ByteStr_Last(Binary)\r\n" +
            "   Dim lastIndex\r\n" +
            "   lastIndex = LenB(Binary)\r\n" +
            "   if lastIndex mod 2 Then\r\n" +
            "       IEBinaryToArray_ByteStr_Last = Chr( AscB( MidB( Binary, lastIndex, 1 ) ) )\r\n" +
            "   Else\r\n" +
            "       IEBinaryToArray_ByteStr_Last = " + '""' + "\r\n" +
            "   End If\r\n" +
            "End Function\r\n";// +
    //"</script>\r\n";

    // inject VBScript
    //document.write(IEBinaryToArray_ByteStr_Script);
    var myVBScript = document.createElement('script');
    myVBScript.type = "text/vbscript";
    myVBScript.textContent = IEBinaryToArray_ByteStr_Script;
    document.body.appendChild(myVBScript);

    // helper to convert from responseBody to a "responseText" like thing
    cc._convertResponseBodyToText = function (binary) {
        var byteMapping = {};
        for (var i = 0; i < 256; i++) {
            for (var j = 0; j < 256; j++) {
                byteMapping[ String.fromCharCode(i + j * 256) ] =
                    String.fromCharCode(i) + String.fromCharCode(j);
            }
        }
        var rawBytes = IEBinaryToArray_ByteStr(binary);
        var lastChr = IEBinaryToArray_ByteStr_Last(binary);
        return rawBytes.replace(/[\s\S]/g,
            function (match) {
                return byteMapping[match];
            }) + lastChr;
    };
}

/**
 * @namespace
 */
cc.FileUtils = cc.Class.extend({
    _fileDataCache:null,
    _textFileCache:null,

    _directory:null,
    _filenameLookupDict:null,
    _searchResolutionsOrderArray:null,
    _searchPathArray:null,

    ctor:function () {
        this._fileDataCache = {};
        this._textFileCache = {};

        this._searchPathArray = [];
        this._searchPathArray.push("");

        this._searchResolutionsOrderArray = [];
        this._searchResolutionsOrderArray.push("");
    },
    /**
     * Get Byte Array from file
     * @function
     * @param {String} fileName The resource file name which contain the path
     * @param {String} mode mode The read mode of the file
     * @param {Number} size If get the file data succeed the it will be the data size,or it will be 0
     * @warning If you get the file data succeed,you must delete it after used.
     */
    getByteArrayFromFile:function (fileName, mode, size) {
        if (this._fileDataCache.hasOwnProperty(fileName))
            return this._fileDataCache[fileName];
        return this._loadBinaryFileData(fileName);
    },

    _getXMLHttpRequest:function () {
        if (window.XMLHttpRequest) {
            return new window.XMLHttpRequest();
        } else {
            return new ActiveXObject("MSXML2.XMLHTTP");
        }
    },

    unloadBinaryFileData:function(fileUrl){
        if (this._fileDataCache.hasOwnProperty(fileUrl))
            delete this._fileDataCache[fileUrl];
    },

    preloadBinaryFileData:function (fileUrl) {
        fileUrl = this.fullPathFromRelativePath(fileUrl);
        var selfPointer = this;

        var xhr = this._getXMLHttpRequest();
        xhr.open("GET", fileUrl, true);
        if (/msie/i.test(navigator.userAgent) && !/opera/i.test(navigator.userAgent)) {
            // IE-specific logic here
            xhr.setRequestHeader("Accept-Charset", "x-user-defined");
            xhr.onreadystatechange = function (event) {
                if (xhr.readyState == 4) {
                    if (xhr.status == 200) {
                        var fileContents = cc._convertResponseBodyToText(xhr["responseBody"]);
                        if (fileContents)
                            selfPointer._fileDataCache[fileUrl] = selfPointer._stringConvertToArray(fileContents);
                    }
                    cc.Loader.getInstance().onResLoaded();
                }
            };
        } else {
            if (xhr.overrideMimeType)
                xhr.overrideMimeType("text\/plain; charset=x-user-defined");
            xhr.onload = function (e) {
                var arrayStr = xhr.responseText;
                if (arrayStr) {
                    cc.Loader.getInstance().onResLoaded();
                    selfPointer._fileDataCache[fileUrl] = selfPointer._stringConvertToArray(arrayStr);
                }
            };
        }
        xhr.send(null);
    },

    _loadBinaryFileData:function (fileUrl) {
        var req = this._getXMLHttpRequest();
        req.open('GET', fileUrl, false);
        var arrayInfo = null;
        if (/msie/i.test(navigator.userAgent) && !/opera/i.test(navigator.userAgent)) {
            req.setRequestHeader("Accept-Charset", "x-user-defined");
            req.send(null);
            if (req.status != 200)
                return null;

            var fileContents = cc._convertResponseBodyToText(req["responseBody"]);
            if (fileContents) {
                arrayInfo = this._stringConvertToArray(fileContents);
                this._fileDataCache[fileUrl] = arrayInfo;
            }
        } else {
            if (req.overrideMimeType)
                req.overrideMimeType('text\/plain; charset=x-user-defined');
            req.send(null);
            if (req.status != 200)
                return null;

            arrayInfo = this._stringConvertToArray(req.responseText);
            this._fileDataCache[fileUrl] = arrayInfo;
        }
        return arrayInfo;
    },

    _stringConvertToArray:function (strData) {
        if (!strData)
            return null;

        var arrData = new Uint8Array(strData.length);
        for (var i = 0; i < strData.length; i++) {
            arrData[i] = strData.charCodeAt(i) & 0xff;
        }
        return arrData;
    },

    unloadTextFileData:function(fileUrl){
        if (this._textFileCache.hasOwnProperty(fileUrl))
            delete this._textFileCache[fileUrl];
    },

    preloadTextFileData:function(fileUrl){
        fileUrl = this.fullPathFromRelativePath(fileUrl);
        var selfPointer = this;

        var xhr = this._getXMLHttpRequest();
        xhr.open("GET", fileUrl, true);
        if (/msie/i.test(navigator.userAgent) && !/opera/i.test(navigator.userAgent)) {
            // IE-specific logic here
            xhr.setRequestHeader("Accept-Charset", "x-user-defined");
            xhr.onreadystatechange = function (event) {
                if (xhr.readyState == 4) {
                    if (xhr.status == 200) {
                        var fileContents = cc._convertResponseBodyToText(xhr.responseBody);
                        if (fileContents)
                            selfPointer._textFileCache[fileUrl] = fileContents;
                    }
                    cc.Loader.getInstance().onResLoaded();
                }
            };
        } else {
            if (xhr.overrideMimeType)
                xhr.overrideMimeType("text\/plain; charset=x-user-defined");
            xhr.onload = function (e) {
                if (xhr.responseText) {
                    cc.Loader.getInstance().onResLoaded();
                    selfPointer._fileDataCache[fileUrl] = xhr.responseText;
                }
            };
        }
        xhr.send(null);
    },

    _loadTextFileData:function(fileUrl){
        var req = this._getXMLHttpRequest();
        req.open('GET', fileUrl, false);
        var arrayInfo = null;
        if (/msie/i.test(navigator.userAgent) && !/opera/i.test(navigator.userAgent)) {
            req.setRequestHeader("Accept-Charset", "x-user-defined");
            req.send(null);
            if (req.status != 200)
                return null;

            var fileContents = cc._convertResponseBodyToText(req.responseBody);
            if (fileContents) {
                arrayInfo = fileContents;
                this._textFileCache[fileUrl] = fileContents;
            }
        } else {
            if (req.overrideMimeType)
                req.overrideMimeType('text\/plain; charset=x-user-defined');
            req.send(null);
            if (req.status != 200)
                return null;

            arrayInfo = req.responseText;
            this._textFileCache[fileUrl] = arrayInfo;
        }
        return arrayInfo;
    },

    getTextFileData:function(fileUrl){
        if (this._textFileCache.hasOwnProperty(fileUrl))
            return this._textFileCache[fileUrl];
        return this._loadTextFileData(fileUrl);
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
    // Notification support when getByteArrayFromFile from invalid file path.
    //////////////////////////////////////////////////////////////////////////
    /**
     * Notification support when getByteArrayFromFile from invalid file path.
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
     * <p>
     *      Returns the fullpath for a given filename.                                                                                                                             </br>
     *      First it will try to get a new filename from the "filenameLookup" dictionary. If a new filename can't be found on the dictionary, it will use the original filename.   </br>
     *      Then it will try obtain the full path of the filename using the CCFileUtils search rules:  resources directory                                                         </br>
     *                                                                                                                                                                             </br>
     *      If the filename can't be found on resource directory(e.g. Resources/iphone-hd), it will go back to the root of asset folder(e.g. Resources/) to find the filename.     </br>
     *                                                                                                                                                                             </br>
     *      If the filename can't be found on the file system, it will return the filename directly.                                                                               </br>
     *                                                                                                                                                                             </br>
     *      This method was added to simplify multiplatform support. Whether you are using cocos2d-js or any cross-compilation toolchain like StellaSDK or Apportable,             </br>
     *      you might need to load differerent resources for a given file in the different platforms.                                                                              </br>
     *                                                                                                                                                                             </br>
     *      Examples:                                                                                                                                                              </br>
     *      * In iOS: "image.png" -> "image.pvr" -> "/full/path/res_dir/image.pvr"                                                                                                 </br>
     *      * In Android: "image.png" -> "image.png" -> "/full/path/res_dir/image.png"                                                                                             </br>
     * </p>
     * @param {String} filename
     * @return {String} fullpath for a given filename.
     */
    fullPathForFilename:function (filename) {
        var found = false;

        var newFileName = this._getNewFilename(filename);
        var fullPath;

        if (newFileName && newFileName.length > 1 && (newFileName.indexOf(":") == 1))
            return newFileName;

        for (var i = 0; i < this._searchPathArray.length; i++) {
            var searchPath = this._searchPathArray[i];
            for (var j = 0; j < this._searchResolutionsOrderArray.length; j++) {
                var resourceDirectory = this._searchResolutionsOrderArray[j];
                fullPath = this._getPathForFilename(newFileName, resourceDirectory, searchPath);
                if (fullPath) {
                    found = true;
                    break;
                }
            }
            if (found)
                break;
        }

        return found ? fullPath : newFileName;
    },

    /**
     * <p>
     *     Loads the filenameLookup dictionary from the contents of a filename.                                        <br/>
     *                                                                                                                 <br/>
     *     @note The plist file name should follow the format below:                                                   <br/>
     *     <?xml version="1.0" encoding="UTF-8"?>                                                                      <br/>
     *         <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">  <br/>
     *             <plist version="1.0">                                                                               <br/>
     *                 <dict>                                                                                          <br/>
     *                     <key>filenames</key>                                                                        <br/>
     *                     <dict>                                                                                      <br/>
     *                         <key>sounds/click.wav</key>                                                             <br/>
     *                         <string>sounds/click.caf</string>                                                       <br/>
     *                         <key>sounds/endgame.wav</key>                                                           <br/>
     *                         <string>sounds/endgame.caf</string>                                                     <br/>
     *                         <key>sounds/gem-0.wav</key>                                                             <br/>
     *                         <string>sounds/gem-0.caf</string>                                                       <br/>
     *                     </dict>                                                                                     <br/>
     *                     <key>metadata</key>                                                                         <br/>
     *                     <dict>                                                                                      <br/>
     *                         <key>version</key>                                                                      <br/>
     *                         <integer>1</integer>                                                                    <br/>
     *                     </dict>                                                                                     <br/>
     *                 </dict>                                                                                         <br/>
     *              </plist>                                                                                           <br/>
     * </p>
     * @param {String} filename  The plist file name.
     */
    loadFilenameLookup:function (filename) {
        var fullPath = this.fullPathForFilename(filename);
        if (fullPath.length > 0) {
            var dict = cc.SAXParser.getInstance().parse(fullPath);
            var metadataDict = dict["metadata"];
            var version = parseInt(metadataDict["version"]);
            if (version != 1) {
                cc.log("cocos2d: ERROR: Invalid filenameLookup dictionary version: " + version + ". Filename: " + filename);
                return;
            }
            this.setFilenameLookupDictionary(dict["filenames"]);
        }
    },

    setFilenameLookupDictionary:function (filenameLookupDict) {
        this._filenameLookupDict = filenameLookupDict;
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
     * <p>
     *     Array that contains the search order of the resources based for the device.
     *     By default it will try to load resources in the following order until one is found:
     *     - On iPad HD: iPad HD resources, iPad resources, resources not associated with any device
     *     - On iPad: iPad resources, resources not associated with any device
     *     - On iPhone 5 HD: iPhone 5 HD resources, iPhone HD resouces, iPhone 5 resources, iPhone resources, resources not associated with any device
     *     - On iPhone HD: iPhone HD resources, iPhone resouces, resources not associated with any device
     *     - On iPhone: iPhone resources, resources not associated with any device
     *
     *     - On Mac HD: Mac HD resources, Mac resources, resources not associated with any device
     *     - On Mac: Mac resources, resources not associated with any device
     *
     *     If the property "enableiPhoneResourcesOniPad" is enabled, it will also search for iPhone resources if you are in an iPad.
     * </p>
     * @param {Array} searchResolutionsOrder
     */
    setSearchResolutionsOrder:function (searchResolutionsOrder) {
        this._searchResolutionsOrderArray = searchResolutionsOrder;
    },

    /**
     * return Array that contains the search order of the resources based for the device.
     * @return {Array}
     */
    getSearchResolutionsOrder:function () {
        return this._searchResolutionsOrderArray;
    },

    /**
     * <p>
     *     Array of search paths.                                                                                                  <br/>
     *     You can use this array to modify the search path of the resources.                                                      <br/>
     *     If you want to use "themes" or search resources in the "cache", you can do it easily by adding new entries in this array.  <br/>
     *                                                                                                                                <br/>
     *     By default it is an array with only the "" (empty string) element.                                                         <br/>
     * </p>
     * @param {Array} searchPaths
     */
    setSearchPath:function (searchPaths) {
        this._searchPathArray = searchPaths;
    },

    /**
     * return Array of search paths.
     * @return {Array}
     */
    getSearchPath:function () {
        return this._searchPathArray;
    },

    getResourceDirectory:function () {
        return this._directory;
    },


    /**
     * Set the ResourcePath,we will find resource in this path
     * @function
     * @param {String} resourcePath The absolute resource path
     * @warning Don't call this function in android and iOS, it has not effect.<br/>
     * In android, if you want to read file other than apk, you shoud use invoke getByteArrayFromFile(), and pass the<br/>
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
     * get string  from file
     * @function
     * @param {String} fileName
     * @return {String}
     */
    getStringFromFile:function (fileName) {
        return cc.SAXParser.getInstance().getList(fileName);
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
        return "";
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
    },

    _resourceRootPath:"",
    getResourceRootPath:function () {
        return this._resourceRootPath;
    },

    setResourceRootPath:function (resourceRootPath) {
        this._resourceRootPath = resourceRootPath;
    },

    _getNewFilename:function (filename) {
        var newFileName = null;
        var fileNameFound = this._filenameLookupDict ? this._filenameLookupDict[filename] : null;
        if (!fileNameFound || fileNameFound.length === 0)
            newFileName = filename;
        else {
            newFileName = fileNameFound;
            cc.log("FOUND NEW FILE NAME: " + newFileName);
        }
        return newFileName;
    },

    _getPathForFilename:function (filename, resourceDirectory, searchPath) {
        var ret;
        var resourceRootPath = this.getResourceRootPath(); //cc.Application.getInstance().getResourceRootPath();

        if (filename && (filename.length > 0) && (filename.indexOf('/') === 0 || filename.indexOf("\\") === 0)) {
            ret = "";
        } else if (resourceRootPath.length > 0) {
            ret = resourceRootPath;
            if (ret[ret.length - 1] != '\\' && ret[ret.length - 1] != '/')
                ret += "/";
        } else {
            ret = resourceRootPath;
        }

        var file = filename;
        var file_path = "";
        var pos = filename.lastIndexOf('/');
        if (pos != -1) {
            file_path = filename.substr(0, pos + 1);
            file = filename.substr(pos + 1);
        }
        var path = searchPath;
        if (path.length > 0 && path.lastIndexOf('/') !== path.length - 1)
            path += '/';
        path += file_path;
        path += resourceDirectory;
        if (path.length > 0 && path.lastIndexOf("/") !== path.length - 1)
            path += '/';
        path += file;
        ret += path;
        return ret;
    }
});

cc.s_SharedFileUtils = null;
cc.FileUtils.getInstance = function () {
    if (cc.s_SharedFileUtils == null) {
        cc.s_SharedFileUtils = new cc.FileUtils();
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
