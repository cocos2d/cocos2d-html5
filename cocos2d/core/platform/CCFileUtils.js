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
    _defaultResRootPath:"",

    ctor:function () {
        this._fileDataCache = {};
        this._textFileCache = {};

        this._searchPathArray = [];
        this._searchPathArray.push(this._defaultResRootPath);

        this._searchResolutionsOrderArray = [];
        this._searchResolutionsOrderArray.push("");
    },

    /**
     * <p>
     *      Purges the file searching cache.                                                                           <br/>
     *                                                                                                                 <br/>
     *      @note It should be invoked after the resources were updated.                                              <br/>
     *           For instance, in the CocosPlayer sample, every time you run application from CocosBuilder,            <br/>
     *           All the resources will be downloaded to the writable folder, before new js app launchs,               <br/>
     *           this method should be invoked to clean the file search cache.
     * </p>
     */
    purgeCachedEntries:function(){
        this._searchPathArray.length = 0;
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
        fileName = this.fullPathForFilename(fileName);
        if (this._fileDataCache[fileName])
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

    unloadBinaryFileData:function (fileUrl) {
        if (this._fileDataCache[fileUrl])
            delete this._fileDataCache[fileUrl];
    },

    preloadBinaryFileData:function (fileUrl) {
        fileUrl = this.fullPathForFilename(fileUrl);
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
                    } else {
                        cc.Loader.getInstance().onResLoadingErr(fileUrl);
                    }
                    cc.Loader.getInstance().onResLoaded();
                }
            };
        } else {
            if (xhr.overrideMimeType)
                xhr.overrideMimeType("text\/plain; charset=x-user-defined");

            xhr.onload = function (e) {
                var fileContents = xhr.responseText;
                if (fileContents) {
                    selfPointer._fileDataCache[fileUrl] = selfPointer._stringConvertToArray(fileContents);
                } else {
                    cc.Loader.getInstance().onResLoadingErr(fileUrl);
                }
                cc.Loader.getInstance().onResLoaded();
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
            if (req.status != 200) {
                cc.log("cocos2d: Unable to load file: " + fileUrl);
                return null;
            }

            var fileContents = cc._convertResponseBodyToText(req["responseBody"]);
            if (fileContents) {
                arrayInfo = this._stringConvertToArray(fileContents);
                this._fileDataCache[fileUrl] = arrayInfo;
            }
        } else {
            if (req.overrideMimeType)
                req.overrideMimeType('text\/plain; charset=x-user-defined');
            req.send(null);
            if (req.status != 200) {
                cc.log("cocos2d: Unable to load file: " + fileUrl);
                return null;
            }

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

    unloadTextFileData:function (fileUrl) {
        fileUrl = this.fullPathForFilename(fileUrl);
        if (this._textFileCache[fileUrl])
            delete this._textFileCache[fileUrl];
    },

    preloadTextFileData:function (fileUrl) {
        fileUrl = this.fullPathForFilename(fileUrl);
        var selfPointer = this;

        var xhr = this._getXMLHttpRequest();
        xhr.open("GET", fileUrl, true);
        if (/msie/i.test(navigator.userAgent) && !/opera/i.test(navigator.userAgent)) {
            // IE-specific logic here
            xhr.setRequestHeader("Accept-Charset", "utf-8");
            xhr.onreadystatechange = function (event) {
                if (xhr.readyState == 4) {
                    if (xhr.status == 200) {
                        var fileContents = xhr.responseText;
                        if (fileContents)
                            selfPointer._textFileCache[fileUrl] = fileContents;
                    } else {
                        cc.Loader.getInstance().onResLoadingErr(fileUrl);
                    }
                    cc.Loader.getInstance().onResLoaded();
                }
            };
        } else {
            if (xhr.overrideMimeType)
                xhr.overrideMimeType("text\/plain; charset=utf-8");
            xhr.onload = function (e) {
                if (xhr.responseText) {
                    selfPointer._textFileCache[fileUrl] = xhr.responseText;
                } else {
                    cc.Loader.getInstance().onResLoadingErr(fileUrl);
                }
                cc.Loader.getInstance().onResLoaded();
            };
        }
        xhr.send(null);
    },

    _loadTextFileData:function (fileUrl) {
        var req = this._getXMLHttpRequest();
        req.open('GET', fileUrl, false);
        var fileContents = null;
        if (/msie/i.test(navigator.userAgent) && !/opera/i.test(navigator.userAgent)) {
            req.setRequestHeader("Accept-Charset", "utf-8");
        } else {
            if (req.overrideMimeType)
                req.overrideMimeType('text\/plain; charset=utf-8');
        }
        req.send(null);
        if (req.status != 200)
            return null;

        fileContents = req.responseText;
        if (fileContents) {
            this._textFileCache[fileUrl] = fileContents;
        }
        return fileContents;
    },

    /**
     *  Gets resource file data
     * @param {String} fileUrl The resource file name which contains the path.
     * @returns {String}
     */
    getTextFileData:function (fileUrl) {
        fileUrl = this.fullPathForFilename(fileUrl);
        if (this._textFileCache[fileUrl])
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
     *      First it will try to get a new filename from the "filenameLookup" dictionary.                                                                                          </br>
     *      If a new filename can't be found on the dictionary, it will use the original filename.                                                                                 </br>
     *      Then it will try obtain the full path of the filename using the CCFileUtils search rules:  resources directory and search paths.                                       </br>
     *      The file search is based on the array element order of search paths and resolution directories.                                                                        </br>
     *                                                                                                                                                                             </br>
     *      For instance:                                                                                                                                                          </br>
     *                                                                                                                                                                             </br>
     *          We set two elements("/mnt/sdcard/", "internal_dir/") to search paths vector by setSearchPaths,                                                                     </br>
     *          and set three elements("resources-ipadhd/", "resources-ipad/", "resources-iphonehd")                                                                               </br>
     *          to resolutions vector by setSearchResolutionsOrder. The "internal_dir" is relative to "Resources/".                                                                </br>
     *                                                                                                                                                                             </br>
     *          If we have a file named 'sprite.png', the mapping in fileLookup dictionary contains `key: sprite.png -> value: sprite.pvr.gz`.                                     </br>
     *          Firstly, it will replace 'sprite.png' with 'sprite.pvr.gz', then searching the file sprite.pvr.gz as follows:                                                      </br>
     *              /mnt/sdcard/resources-ipadhd/sprite.pvr.gz      (if not found, search next)                                                                                    </br>
     *              /mnt/sdcard/resources-ipad/sprite.pvr.gz        (if not found, search next)                                                                                    </br>
     *              /mnt/sdcard/resources-iphonehd/sprite.pvr.gz    (if not found, search next)                                                                                    </br>
     *              /mnt/sdcard/sprite.pvr.gz                       (if not found, search next)                                                                                    </br>
     *              internal_dir/resources-ipadhd/sprite.pvr.gz     (if not found, search next)                                                                                    </br>
     *              internal_dir/resources-ipad/sprite.pvr.gz       (if not found, search next)                                                                                    </br>
     *              internal_dir/resources-iphonehd/sprite.pvr.gz   (if not found, search next)                                                                                    </br>
     *              internal_dir/sprite.pvr.gz                      (if not found, return "sprite.png")                                                                            </br>
     *                                                                                                                                                                             </br>
     *         If the filename contains relative path like "gamescene/uilayer/sprite.png",                                                                                         </br>
     *         and the mapping in fileLookup dictionary contains `key: gamescene/uilayer/sprite.png -> value: gamescene/uilayer/sprite.pvr.gz`.                                    </br>
     *         The file search order will be:                                                                                                                                      </br>
     *              /mnt/sdcard/gamescene/uilayer/resources-ipadhd/sprite.pvr.gz      (if not found, search next)                                                                  </br>
     *              /mnt/sdcard/gamescene/uilayer/resources-ipad/sprite.pvr.gz        (if not found, search next)                                                                  </br>
     *              /mnt/sdcard/gamescene/uilayer/resources-iphonehd/sprite.pvr.gz    (if not found, search next)                                                                  </br>
     *              /mnt/sdcard/gamescene/uilayer/sprite.pvr.gz                       (if not found, search next)                                                                  </br>
     *              internal_dir/gamescene/uilayer/resources-ipadhd/sprite.pvr.gz     (if not found, search next)                                                                  </br>
     *              internal_dir/gamescene/uilayer/resources-ipad/sprite.pvr.gz       (if not found, search next)                                                                  </br>
     *              internal_dir/gamescene/uilayer/resources-iphonehd/sprite.pvr.gz   (if not found, search next)                                                                  </br>
     *              internal_dir/gamescene/uilayer/sprite.pvr.gz                      (if not found, return "gamescene/uilayer/sprite.png")                                        </br>
     *                                                                                                                                                                             </br>
     *         If the new file can't be found on the file system, it will return the parameter pszFileName directly.                                                               </br>
     *                                                                                                                                                                             </br>
     *         This method was added to simplify multiplatform support. Whether you are using cocos2d-js or any cross-compilation toolchain like StellaSDK or Apportable,          </br>
     *         you might need to load different resources for a given file in the different platforms.
     * </p>
     * @param {String} filename
     * @return {String} full path for a given filename.
     */
    fullPathForFilename:function (filename) {
        var found = false;

        var newFileName = this._getNewFilename(filename);
        var fullPath;

        //if (newFileName && newFileName.length > 1)
        //    return newFileName;

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

    /**
     * Sets the filenameLookup dictionary.
     * @param {Object} filenameLookupDict The dictionary for replacing filename.
     */
    setFilenameLookupDictionary:function (filenameLookupDict) {
        this._filenameLookupDict = filenameLookupDict;
    },

    /**
     * Gets full path from a file name and the path of the reletive file.
     * @param {String} filename The file name.
     * @param {String} relativeFile The path of the relative file.
     * @return {String} The full path.
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
     *     Sets the array that contains the search order of the resources.
     * </p>
     * @see getSearchResolutionsOrder(void), fullPathForFilename(const char*).
     * @param {Array} searchResolutionsOrder
     */
    setSearchResolutionsOrder:function (searchResolutionsOrder) {
        this._searchResolutionsOrderArray = searchResolutionsOrder;
    },

    /**
     * Gets the array that contains the search order of the resources.
     * @see setSearchResolutionsOrder(), fullPathForFilename(const char*).
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
     * @deprecated
     * @param fileName The file name of *.plist file
     * @return {object} The Dictionary of object generated from the file
     */
    dictionaryWithContentsOfFile:function (fileName) {
        cc.log("dictionaryWithContentsOfFile is deprecated. Use createDictionaryWithContentsOfFile instead");
        return this.createDictionaryWithContentsOfFile(fileName);
    },

    /**
     * Generate an Dictionary of object by file
     * @param filename The file name of *.plist file
     * @return {object} The Dictionary of object generated from the file
     */
    createDictionaryWithContentsOfFile: function(filename){
        return  cc.SAXParser.getInstance().parse(filename);
    },

    /**
     * get string  from file
     * @function
     * @param {String} fileName
     * @return {String}
     */
    getStringFromFile:function (fileName) {
        return this.getTextFileData(fileName); //cc.SAXParser.getInstance().getList(fileName);
    },

    /**
     * The same meaning as dictionaryWithContentsOfFile(), but it doesn't call autorelease, so the invoker should call release().
     * @function
     * @param {String} fileName
     * @return {object} The Dictionary of object generated from the file
     */
    dictionaryWithContentsOfFileThreadSafe:function (fileName) {
        return cc.SAXParser.getInstance().parse(fileName);
    },

    /**
     * Get the writeable path
     * @return {String}  The path that can write/read file
     * @deprecated
     */
    getWritablePath:function () {
        return "";
    },

    /**
     * Set whether pop-up a message box when the image load failed
     * @param {Boolean} notify
     */
    setPopupNotify:function (notify) {
        cc.popupNotify = notify;
    },

    /**
     * Get whether pop-up a message box when the image load failed
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

    /**
     * Gets the new filename from the filename lookup dictionary.
     * @param {String} filename
     * @return {String|null}  The new filename after searching in the filename lookup dictionary. If the original filename wasn't in the dictionary, it will return the original filename.
     * @private
     */
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

    /**
     * Gets full path for filename, resolution directory and search path.
     * @param {String} filename
     * @param {String} resourceDirectory
     * @param {String} searchPath
     * @return {String} The full path of the file. It will return an empty string if the full path of the file doesn't exist.
     * @private
     */
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
    },

    /**
     * Gets full path for the directory and the filename.
     * @param {String} directory The directory contains the file we are looking for.
     * @param {String} fileName The name of the file.
     * @return {Boolean} The full path of the file, if the file can't be found, it will return an empty string.
     * @private
     */
    _getFullPathForDirectoryAndFilename:function(directory, fileName){

    },

    /**
     * <p>
     *     Sets the array of search paths.                                                                                                                 <br/>
     *                                                                                                                                                     <br/>
     *     You can use this array to modify the search path of the resources.                                                                              <br/>
     *     If you want to use "themes" or search resources in the "cache", you can do it easily by adding new entries in this array.                       <br/>
     *                                                                                                                                                     <br/>
     *     @note This method could access relative path and absolute path.                                                                                <br/>
     *            If the relative path was passed to the vector, CCFileUtils will add the default resource directory before the relative path.             <br/>
     *            For instance:                                                                                                                            <br/>
     *              On Android, the default resource root path is "assets/".                                                                               <br/>
     *              If "/mnt/sdcard/" and "resources-large" were set to the search paths vector,                                                           <br/>
     *              "resources-large" will be converted to "assets/resources-large" since it was a relative path.
     * </p>
     * @see fullPathForFilename(const char*)
     * @param {Array} searchPaths The array contains search paths.
     */
    setSearchPaths:function (searchPaths) {
        var existDefaultRootPath = false;

        var locPathArray = this._searchPathArray;
        locPathArray.length = 0;
        for (var i = 0; i < searchPaths.length; i++) {
            var iter = searchPaths[i];

            var strPrefix;
            var path;
            if (!this.isAbsolutePath(iter)) { // Not an absolute path
                strPrefix = this._defaultResRootPath;
            }
            path = strPrefix + iter;
            if (path.length > 0 && path[path.length - 1] != '/') {
                path += "/";
            }
            if (!existDefaultRootPath && path == this._defaultResRootPath) {
                existDefaultRootPath = true;
            }
            locPathArray.push(path);
        }

        if (!existDefaultRootPath) {
            //cc.log("Default root path doesn't exist, adding it.");
            locPathArray.push(this._defaultResRootPath);
        }
    },

    /**
     * Add search path.
     * @param {String} path
     */
    addSearchPath:function (path) {
        var strPrefix;
        if (!this.isAbsolutePath(path)) { // Not an absolute path
            strPrefix = this._defaultResRootPath;
        }
        path = strPrefix + path;
        if (path.length > 0 && path[path.length - 1] != '/') {
            path += "/";
        }
        this._searchPathArray.push(path);
    },

    /**
     *  Gets the array of search paths.
     *  @see fullPathForFilename(const char*).
     *  @return {Array} The array of search paths.
     */
    getSearchPaths:function(){

    },

    /**
     * Checks whether the path is an absolute path.
     * @param {String} strPath The path that needs to be checked.
     * @returns {boolean} true if it's an absolute path, otherwise it will return false.
     */
    isAbsolutePath:function (strPath) {
        return (strPath[0] == '/');
    }
});

cc.s_SharedFileUtils = null;
/**
 * Gets the instance of CCFileUtils.
 * @returns {cc.FileUtils}
 */
cc.FileUtils.getInstance = function () {
    if (cc.s_SharedFileUtils == null) {
        cc.s_SharedFileUtils = new cc.FileUtils();
    }
    return cc.s_SharedFileUtils;
};
