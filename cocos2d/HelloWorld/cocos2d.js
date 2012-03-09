/****************************************************************************
 Copyright (c) 2010-2012 cocos2d-x.org
 Copyright (c) 2008-2010 Ricardo Quesada
 Copyright (c) 2011      Zynga Inc.

 http://www.cocos2d-x.org

 Created by JetBrains WebStorm.
 User: wuhao
 Date: 12-3-8

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
//Cocos2d directory
CC.CCDir = '../';//in relate to the html file or use absolute
CC.loadQue = [];//the load que which js files are loaded
CC.COCOS2D_DEBUG =2;
CC._DEBUG =1;
CC.CC_IS_RETINA_DISPLAY_SUPPORTED = 0;
//html5 selector method
CC.$ = function(x)
{
    return document.querySelector(x);
};
CC.$new = function(x)
{
    return document.createElement(x);
};
//function to load files into html
/*
CC.loadjs = function(filename)
{
    //get a ref to header
    var head = CC.$('head');
    var insert = document.createElement('script');
    insert.setAttribute('src',CC.CCDir+filename);
    head.appendChild(insert);
};*/

CC.loadjs = function(filename)
{
    //add the file to the que
    var script = CC.$new('script');
    script.src = CC.CCDir + filename;
    script.order = CC.loadQue.length;
    CC.loadQue.push(script);


    script.onload = function()
    {
        //file have finished loading,
        //if there is more file to load, we should put the next file on the head
        if(this.order+1 < CC.loadQue.length)
        {
            CC.$('head').appendChild(CC.loadQue[this.order+1]);
            CC.CCLOG(this.order);
        }
        else
        {
            //we are ready to run the game
            CC.AppController.shareAppController().didFinishLaunchingWithOptions();
        }
    };
    if(script.order === 0)//if the first file to load, then we put it on the head
    {
        CC.$('head').appendChild(script);
    }
};


CC.loadjs('platform/CCClass.js');//0
CC.loadjs('platform/CCCommon.js');//1
CC.loadjs('platform/platform.js');//2
CC.loadjs('cocoa/CCGeometry.js');//3
CC.loadjs('cocoa/CCSet.js');//4
CC.loadjs('platform/CCTypes.js');//5
CC.loadjs('base_nodes/CCNode.js');//6
CC.loadjs('platform/ccMacro.js');//7
CC.loadjs('layers_scenes_transitions_nodes/CCScene.js');//8
CC.loadjs('layers_scenes_transitions_nodes/CCLayer.js');//9
CC.loadjs('sprite_nodes/CCSprite.js');//10
CC.loadjs('CCDirector.js');//11
CC.loadjs('CCScheduler.js');//12
CC.loadjs('platform/CCApplication.js');//13
CC.loadjs('HelloWorld/Classes/AppDelegate.js');//14
CC.loadjs('HelloWorld/AppControl.js');//15
CC.loadjs('HelloWorld/Classes/Helloworld.js');//16