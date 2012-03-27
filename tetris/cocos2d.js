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

var cc = cc = cc || {};
//Cocos2d directory
cc.Dir = '../cocos2d/';//in relate to the html file or use absolute
cc.loadQue = [];//the load que which js files are loaded
cc.COCOS2D_DEBUG =2;
cc._DEBUG =1;
cc._IS_RETINA_DISPLAY_SUPPORTED = 0;

var g_ressources= [
    // images res
   {name: "background",  type:"image",	src: "Resources/background.png"},
    {name: "tiles",  type:"image",	src: "Resources/tiles.png"},

    {name: "asdfa",  type:"image",	src: "http://bbs.html5china.com/uc_server/data/avatar/000/00/00/03_avatar_middle.jpg"},
    {name: "asdfsd",  type:"image",	src: "http://www.html5china.com/uploads/101229/1-101229144029609.jpg"},
    {name: "asdf",  type:"image",	src: "http://www.html5china.com/uploads/101229/1-101229160405930.jpg"},
    {name: "adsfasd",  type:"image",	src: "http://www.html5china.com/uploads/101229/1-101229160622351.jpg"},
    {name: "asdf",  type:"image",	src: "http://www.html5china.com/uploads/101230/1-10123009544J57.jpg"},
    {name: "dsd",  type:"image",	src: "http://www.html5china.com/uploads/101230/1-1012301FG2329.jpg"},
    {name: "xcv",  type:"image",	src: "http://www.html5china.com/uploads/101230/1-1012301I525Z4.jpg"},

    {name: "zcv",  type:"image",	src: "http://d.lanrentuku.com/down/png/1203/iron-man-avatars/iron_man_mark_i-01.png"},
    {name: "sdsd",  type:"image",	src: "http://d.lanrentuku.com/down/png/1203/iron-man-avatars/iron_man_mark_iv-01.png"},
    {name: "dsd",  type:"image",	src: "http://d.lanrentuku.com/down/png/1203/iron-man-avatars/iron_man_mark_ii-01.png"},
    {name: "zv",  type:"image",	src: "http://d.lanrentuku.com/down/png/1203/iron-man-avatars/iron_man_mark_ii-01.png"},
    {name: "asdf",  type:"image",	src: "http://d.lanrentuku.com/down/png/1203/iron-man-avatars/iron_man_mark_iii-01.png"},
    {name: "asdfasd",  type:"image",	src: "http://d.lanrentuku.com/down/png/1203/iron-man-avatars/iron_man_mark_v-01.png"},

    {name: "sdsd",  type:"image",	src: "http://pic4.nipic.com/20090901/2676157_073228068362_2.jpg"},
    {name: "dsd",  type:"image",	src: "http://pic1a.nipic.com/2009-02-04/200924836944_2.jpg"},
    {name: "ewe",  type:"image",	src: "http://pic2.nipic.com/20090406/1296346_215050048_2.jpg"},
    {name: "ewe",  type:"image",	src: "http://pic9.nipic.com/20100916/2531170_093514212258_2.jpg"},
    {name: "adfs",  type:"image",	src: "http://pic7.nipic.com/20100607/2032250_202440073984_2.jpg"},
    {name: "xcsds",  type:"image",	src: "http://pic1a.nipic.com/20090310/1988006_233249082_2.jpg"},

    // audio ressources
    {name: "music",            type: "bgm",    src: "Resources/music.mp3"},
    {name: "check_in",            type: "effect",    src: "Resources/check_in.ogg"}
];

//html5 selector method
cc.$ = function(x)
{
    return document.querySelector(x);
};
cc.$new = function(x)
{
    return document.createElement(x);
};
//function to load files into html
/*
cc.loadjs = function(filename)
{
    //get a ref to header
    var head = cc.$('head');
    var insert = document.createElement('script');
    insert.setAttribute('src',cc.Dir+filename);
    head.appendChild(insert);
};*/

cc.loadjs = function(filename)
{
    //add the file to the que
    var script = cc.$new('script');
    script.src = cc.Dir + filename;
    script.order = cc.loadQue.length;
    cc.loadQue.push(script);


    script.onload = function()
    {
        //file have finished loading,
        //if there is more file to load, we should put the next file on the head
        if(this.order+1 < cc.loadQue.length)
        {
            cc.$('head').appendChild(cc.loadQue[this.order+1]);
            //console.log(this.order);
        }
        else
        {
            cc.setup("gameCanvas");
            //run the
            cc.Loader.shareLoader().onloading=function(){
                cc.LoaderScene.shareLoaderScene().draw();
            };
            cc.Loader.shareLoader().onload=function(){
                cc.AppController.shareAppController().didFinishLaunchingWithOptions();
            };
            //preload ressources
            cc.Loader.shareLoader().preload(g_ressources);
        }
    };
    if(script.order === 0)//if the first file to load, then we put it on the head
    {
        cc.$('head').appendChild(script);
    }
};


cc.loadjs('platform/CCClass.js');//0
cc.loadjs('CCLoader.js');//14
cc.loadjs('platform/CCCommon.js');//1
cc.loadjs('platform/platform.js');//2
cc.loadjs('cocoa/CCGeometry.js');//3
cc.loadjs('cocoa/CCSet.js');//4
cc.loadjs('cocoa/CCNS.js');//4
cc.loadjs('platform/CCTypes.js');//5
cc.loadjs('cocoa/CCAffineTransform.js');//5
cc.loadjs('support/CCPointExtension.js');//12
cc.loadjs('base_nodes/CCNode.js');//6
cc.loadjs('platform/ccMacro.js');//7
cc.loadjs('platform/ccConfig.js');//7
cc.loadjs('platform/CCSAXParser.js');//7
cc.loadjs('platform/CCFileUtils.js');//7
cc.loadjs('textures/CCTexture2D.js');//12
cc.loadjs('textures/CCTextureCache.js');//12
cc.loadjs('textures/CCTextureAtlas.js');//12
cc.loadjs('actions/CCAction.js');//7
cc.loadjs('actions/CCActionInterval.js');//7
cc.loadjs('actions/CCActionManager.js');//7
cc.loadjs('layers_scenes_transitions_nodes/CCScene.js');//8
cc.loadjs('layers_scenes_transitions_nodes/CCLayer.js');//9
cc.loadjs('sprite_nodes/CCSprite.js');//10
cc.loadjs('sprite_nodes/CCSpriteBatchNode.js');//10
cc.loadjs('sprite_nodes/CCSpriteFrame.js');//10
cc.loadjs('sprite_nodes/CCSpriteFrameCache.js');//10
cc.loadjs('sprite_nodes/CCAnimationCache.js');//10
cc.loadjs('label_nodes/CCLabelTTF.js');//11
cc.loadjs('touch_dispatcher/CCTouchDelegateProtocol.js');//12
cc.loadjs('touch_dispatcher/CCTouchHandler.js');//12
cc.loadjs('touch_dispatcher/CCTouchDispatcher.js');//12
cc.loadjs('keypad_dispatcher/CCKeypadDelegate.js');//12
cc.loadjs('keypad_dispatcher/CCKeypadDispatcher.js');//12
cc.loadjs('CCDirector.js');//13
cc.loadjs('CCScheduler.js');//14
cc.loadjs('CCDrawingPrimitives.js');//15
cc.loadjs('platform/CCApplication.js');//16
cc.loadjs('menu_nodes/CCMenu.js');
cc.loadjs('../CocosDenshion/SimpleAudioEngine.js');
//cc.loadjs('menu_nodes/ccMenuItem.js');
cc.loadjs('../tetris/Classes/AppDelegate.js');//17
cc.loadjs('platform/AppControl.js');//18
cc.loadjs('../tetris/game.js');//19
cc.loadjs('../tetris/block.js');//20
cc.loadjs('../tetris/menuScene.js');//21
//cc.loadjs('../tetris/newTest.js');//21