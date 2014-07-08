/****************************************************************************
 Copyright (c) 2014 Chukong Technologies Inc.

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
 * @namespace jsb
 * @name jsb
 */
var jsb = jsb || {};

/**
 * @type {Object}
 * @name jsb.fileUtils
 * jsb.fileUtils is the native file utils singleton object,
 * please refer to Cocos2d-x API to know how to use it.
 * Only available in JSB
 */
jsb.fileUtils = {

    /**
     * @method fullPathForFilename
     * @param {String} arg0
     * @return {String}
     */
    fullPathForFilename : function (str)
    {
        return ;
    },

    /**
     * @method getStringFromFile
     * @param {String} arg0
     * @return {String}
     */
    getStringFromFile : function (str)
    {
        return ;
    },

    /**
     * @method removeFile
     * @param {String} arg0
     * @return {bool}
     */
    removeFile : function (str)
    {
        return false;
    },

    /**
     * @method isAbsolutePath
     * @param {String} arg0
     * @return {bool}
     */
    isAbsolutePath : function (str)
    {
        return false;
    },

    /**
     * @method renameFile
     * @param {String} arg0
     * @param {String} arg1
     * @param {String} arg2
     * @return {bool}
     */
    renameFile : function (str, str, str)
    {
        return false;
    },

    /**
     * @method loadFilenameLookupDictionaryFromFile
     * @param {String} arg0
     */
    loadFilenameLookupDictionaryFromFile : function (str)
    {
    },

    /**
     * @method isPopupNotify
     * @return {bool}
     */
    isPopupNotify : function ()
    {
        return false;
    },

    /**
     * @method getValueVectorFromFile
     * @param {String} arg0
     * @return {Array}
     */
    getValueVectorFromFile : function (str)
    {
        return new Array();
    },

    /**
     * @method getSearchPaths
     * @return {Array}
     */
    getSearchPaths : function ()
    {
        return new Array();
    },

    /**
     * @method writeToFile
     * @param {map_object} arg0
     * @param {String} arg1
     * @return {bool}
     */
    writeToFile : function (map, str)
    {
        return false;
    },

    /**
     * @method getValueMapFromFile
     * @param {String} arg0
     * @return {map_object}
     */
    getValueMapFromFile : function (str)
    {
        return map_object;
    },

    /**
     * @method getFileSize
     * @param {String} arg0
     * @return {long}
     */
    getFileSize : function (str)
    {
        return 0;
    },

    /**
     * @method removeDirectory
     * @param {String} arg0
     * @return {bool}
     */
    removeDirectory : function (str)
    {
        return false;
    },

    /**
     * @method setSearchPaths
     * @param {Array} arg0
     */
    setSearchPaths : function (array)
    {
    },

    /**
     * @method writeStringToFile
     * @param {String} arg0
     * @param {String} arg1
     * @return {bool}
     */
    writeStringToFile : function (str, str)
    {
        return false;
    },

    /**
     * @method setSearchResolutionsOrder
     * @param {Array} arg0
     */
    setSearchResolutionsOrder : function (array)
    {
    },

    /**
     * @method addSearchResolutionsOrder
     * @param {String} arg0
     */
    addSearchResolutionsOrder : function (str)
    {
    },

    /**
     * @method addSearchPath
     * @param {String} arg0
     */
    addSearchPath : function (str)
    {
    },

    /**
     * @method isFileExist
     * @param {String} arg0
     * @return {bool}
     */
    isFileExist : function (str)
    {
        return false;
    },

    /**
     * @method purgeCachedEntries
     */
    purgeCachedEntries : function ()
    {
    },

    /**
     * @method fullPathFromRelativeFile
     * @param {String} arg0
     * @param {String} arg1
     * @return {String}
     */
    fullPathFromRelativeFile : function (str, str)
    {
        return ;
    },

    /**
     * @method isDirectoryExist
     * @param {String} arg0
     * @return {bool}
     */
    isDirectoryExist : function (str)
    {
        return false;
    },

    /**
     * @method getSearchResolutionsOrder
     * @return {Array}
     */
    getSearchResolutionsOrder : function ()
    {
        return new Array();
    },

    /**
     * @method createDirectory
     * @param {String} arg0
     * @return {bool}
     */
    createDirectory : function (str)
    {
        return false;
    },

    /**
     * @method createDirectories
     * @param {String} arg0
     * @return {bool}
     */
    createDirectories : function (str)
    {
        return false;
    },

    /**
     * @method getWritablePath
     * @return {String}
     */
    getWritablePath : function ()
    {
        return ;
    }

};

/**
 * @class jsb.AssetsManager
 * jsb.AssetsManager is the native AssetsManager for your game resources or scripts.
 * please refer to this document to know how to use it: http://www.cocos2d-x.org/docs/manual/framework/html5/v3/assets-manager/en
 * Only available in JSB
 */
jsb.AssetsManager = {

    /**
     * @method getState
     * @return {jsb.AssetsManager::State}
     */
    getState : function ()
    {
        return 0;
    },

    /**
     * @method checkUpdate
     */
    checkUpdate : function ()
    {
    },

    /**
     * @method getStoragePath
     * @return {String}
     */
    getStoragePath : function ()
    {
        return ;
    },

    /**
     * @method update
     */
    update : function ()
    {
    },

    /**
     * @method getLocalManifest
     * @return {jsb.Manifest}
     */
    getLocalManifest : function ()
    {
        return cc.Manifest;
    },

    /**
     * @method getRemoteManifest
     * @return {jsb.Manifest}
     */
    getRemoteManifest : function ()
    {
        return cc.Manifest;
    },

    /**
     * @method downloadFailedAssets
     */
    downloadFailedAssets : function ()
    {
    },

    /**
     * @method create
     * @param {String} arg0
     * @param {String} arg1
     * @return {jsb.AssetsManager}
     */
    create : function (str, str)
    {
        return cc.AssetsManager;
    },

    /**
     * @method AssetsManager
     * @constructor
     * @param {String} arg0
     * @param {String} arg1
     */
    ctor : function (str, str)
    {
    }

};

/**
 * @class jsb.Manifest
 */
jsb.Manifest = {

    /**
     * @method getManifestFileUrl
     * @return {String}
     */
    getManifestFileUrl : function ()
    {
        return ;
    },

    /**
     * @method isVersionLoaded
     * @return {bool}
     */
    isVersionLoaded : function ()
    {
        return false;
    },

    /**
     * @method isLoaded
     * @return {bool}
     */
    isLoaded : function ()
    {
        return false;
    },

    /**
     * @method getPackageUrl
     * @return {String}
     */
    getPackageUrl : function ()
    {
        return ;
    },

    /**
     * @method getVersion
     * @return {String}
     */
    getVersion : function ()
    {
        return ;
    },

    /**
     * @method getVersionFileUrl
     * @return {String}
     */
    getVersionFileUrl : function ()
    {
        return ;
    }
};

/**
 * @type {Object}
 * @name jsb.reflection
 * jsb.reflection is a bridge to let you invoke Java static functions.
 * please refer to this document to know how to use it: http://www.cocos2d-x.org/docs/manual/framework/html5/v3/reflection/en
 * Only available on Android platform
 */
jsb.reflection = {
    /**
     * @method callStaticMethod
     */
    callStaticMethod : function(){
    }
};