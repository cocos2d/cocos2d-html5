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

var CC = CC = CC || {};

/**
 @brief Output Debug message.
 */
CC.CCLog = function(message)
{
    console.log(message);
};

/**
 @brief Pop out a message box
 */
CC.CCMessageBox = function(message)
{
    console.log(message);
};

// cocos2d debug
if(CC.COCOS2D_DEBUG == 0){
    CC.CCLOG  = function(){};
    CC.CCLOGINFO = function(){};
    CC.CCLOGERROR = function(){};
}
else if (CC.COCOS2D_DEBUG == 1){
    CC.CCLOG = CC.CCLog;
    CC.CCLOGINFO = CC.CCLog;
    CC.CCLOGERROR = function(){};
}
else if(CC.COCOS2D_DEBUG > 1){
    CC.CCLOG = CC.CCLog;
    CC.CCLOGINFO = CC.CCLog;
    CC.CCLOGERROR = CC.CCLog;
}// COCOS2D_DEBUG

if(CC._DEBUG){
    CC.CCAssert = function(cond, message){
        if(!cond){
            if(message){
                alert(message);
                var temp = this;
            }
            else{
                alert("No message!");
            }
        }
    }
}
else {
    CC.CCAssert = function(){};
}
/**
 @brief Enum the language type supportted now
 */
CC.kLanguageEnglish = 0;
CC.kLanguageChinese = 1;
CC.kLanguageFrench = 2;
CC.kLanguageItalian = 3;
CC.kLanguageGerman = 4;
CC.kLanguageSpanish = 5;
CC.kLanguageRussian = 6;
