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

var cc = cc = cc || {};

cc.SAX_NONE = 0;
cc.SAX_KEY = 1;
cc.SAX_DICT = 2;
cc.SAX_INT = 3;
cc.SAX_REAL = 4;
cc.SAX_STRING = 5;
cc.SAX_ARRAY = 6;
cc.s_pszResourcePath = [];

cc.FileUtils = cc.Class.extend({});

/**
 @brief Get resource file data
 @param in]  pszFileName The resource file name which contain the path
 @param in]  pszMode The read mode of the file
 @param out] pSize If get the file data succeed the it will be the data size,or it will be 0
 @return if success,the pointer of data will be returned,or null is returned
 @warning If you get the file data succeed,you must delete it after used.
 */
cc.FileUtils.getFileData = function (pszFileName, pszMode, pSize) {

};

/**
 @brief Get resource file data from zip file
 @param in]  pszFileName The resource file name which contain the relative path of zip file
 @param out] pSize If get the file data succeed the it will be the data size,or it will be 0
 @return if success,the pointer of data will be returned,or null is returned
 @warning If you get the file data succeed,you must delete it after used.
 */
cc.FileUtils.getFileDataFromZip = function (pszZipFilePath, pszFileName, pSize) {

};

/** removes the HD suffix from a path
 @returns const char * without the HD suffix
 @since v0.99.5
 */
cc.FileUtils.ccRemoveHDSuffixFromFile = function (path) {

};
//////////////////////////////////////////////////////////////////////////
// Notification support when getFileData from invalid file path.
//////////////////////////////////////////////////////////////////////////
cc.s_bPopupNotify = true;
/**
 @brief   Generate the absolute path of the file.
 @param   pszRelativePath     The relative path of the file.
 @return  The absolute path of the file.
 @warning We only add the ResourcePath before the relative path of the file.
 If you have not set the ResourcePath,the function add "/NEWPLUS/TDA_DATA/UserData/" as default.
 You can set ResourcePath by function void setResourcePath(const char *pszResourcePath);
 */
cc.FileUtils.fullPathFromRelativePath = function (pszRelativePath) {
    return pszRelativePath;
};

/// @cond
cc.FileUtils.fullPathFromRelativeFile = function (pszFilename, pszRelativeFile) {

};
/// @endcond

/**
 @brief  Set the ResourcePath,we will find resource in this path
 @param pszResourcePath  The absolute resource path
 @warning Don't call this function in android and iOS, it has not effect.
 In android, if you want to read file other than apk, you shoud use invoke getFileData(), and pass the
 absolute path.
 */
cc.FileUtils.setResourcePath = function (pszResourcePath) {

};

/**
 @brief   Generate a cc.Dictionary pointer by file
 @param   pFileName  The file name of *.plist file
 @return  The cc.Dictionary pointer generated from the file
 */
cc.FileUtils.dictionaryWithContentsOfFile = function (pFileName) {
    var ret = this.dictionaryWithContentsOfFileThreadSafe(pFileName);
    return ret;
};

/*
 @brief The same meaning as dictionaryWithContentsOfFile(), but it doesn't call autorelease, so the
 invoker should call release().
 */
cc.FileUtils.dictionaryWithContentsOfFileThreadSafe = function (pFileName) {
    var tMaker = new cc.DictMaker();
    return tMaker.dictionaryWithContentsOfFile(pFileName);
};

/**
 @brief   Get the writeable path
 @return  The path that can write/read file
 */
cc.FileUtils.getWriteablePath = function () {

};

/**
 @brief Set/Get whether pop-up a message box when the image load failed
 */
cc.FileUtils.setIsPopupNotify = function (bNotify) {
    cc.s_bPopupNotify = bNotify;
};
cc.FileUtils.getIsPopupNotify = function () {
    return cc.s_bPopupNotify;
};

///////////////////////////////////////////////////
// interfaces on wophone
///////////////////////////////////////////////////
/**
 @brief  Set the resource zip file name
 @param pszZipFileName The relative path of the .zip file
 */
cc.FileUtils.setResource = function (pszZipFileName) {

};

///////////////////////////////////////////////////
// interfaces on ios
///////////////////////////////////////////////////
cc.FileUtils.ccLoadFileIntoMemory = function (filename, out) {

};

cc.FileData = cc.Class.extend({
    _m_pBuffer:0,
    _m_uSize:0,
    ctor:function (pszFileName, pszMode) {
        this._m_pBuffer = cc.FileUtils.getFileData(pszFileName, pszMode, this._m_uSize);
    },
    reset:function (pszFileName, pszMode) {
        this._m_uSize = 0;
        this._m_pBuffer = cc.FileUtils.getFileData(pszFileName, pszMode, this._m_uSize);
        return (this._m_pBuffer) ? true : false;
    },
    getBuffer:function () {
        return this._m_pBuffer;
    },
    getSize:function () {
        return this._m_uSize;
    }
});

cc.DictMaker = cc.Class.extend({
    m_pRootDict:[],
    /*m_pCurDict:null,
     m_tDictStack:null,
     m_sCurKey:null,
     m_tState:cc.SAX_NONE,
     m_pArray:null,
     m_tArrayStack:null,
     m_tStateStack:null,*/
    dictionaryWithContentsOfFile:function (pFileName) {
        var parser = cc.SAXParser.shareParser();
        var parserName = parser.getName(pFileName);
        this.m_pRootDict = parser.parse(parserName);
        return this.m_pRootDict;
    }
});