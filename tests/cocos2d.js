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
cc.COCOS2D_DEBUG = 2;
cc._DEBUG = 1;
cc._IS_RETINA_DISPLAY_SUPPORTED = 0;
//html5 selector method
cc.$ = function (x) {
    return document.querySelector(x);
};
cc.$new = function (x) {
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

cc.loadjs = function (filename) {
    //add the file to the que
    var script = cc.$new('script');
    script.src = cc.Dir + filename;
    script.order = cc.loadQue.length;
    cc.loadQue.push(script);

    script.onload = function () {
        //file have finished loading,
        //if there is more file to load, we should put the next file on the head
        if (this.order + 1 < cc.loadQue.length) {
            cc.$('head').appendChild(cc.loadQue[this.order + 1]);
            //console.log(this.order);
        }
        else {
            cc.setup("gameCanvas");
            //we are ready to run the game
            cc.Loader.shareLoader().onloading = function () {
                cc.LoaderScene.shareLoaderScene().draw();
            };
            cc.Loader.shareLoader().onload = function () {
                cc.AppController.shareAppController().didFinishLaunchingWithOptions();
            };
            //preload ressources
            cc.Loader.shareLoader().preload(g_ressources);
        }
    };
    if (script.order === 0)//if the first file to load, then we put it on the head
    {
        cc.$('head').appendChild(script);
    }
};


cc.loadjs('platform/CCClass.js');//0
cc.loadjs('platform/CCCommon.js');//1
cc.loadjs('platform/platform.js');//2
cc.loadjs('platform/JXGUtil.js');//4
cc.loadjs('platform/base64.js');//4
cc.loadjs('platform/gzip.js');//4
cc.loadjs('cocoa/CCGeometry.js');//3
cc.loadjs('cocoa/CCSet.js');//4
cc.loadjs('platform/CCTypes.js');//5
cc.loadjs('cocoa/CCAffineTransform.js');//5
cc.loadjs('support/CCPointExtension.js');//12
cc.loadjs('base_nodes/CCNode.js');//6
cc.loadjs('base_nodes/CCdomNode.js');
cc.loadjs('platform/ccMacro.js');//7
cc.loadjs('platform/ccConfig.js');//7
cc.loadjs('textures/CCTexture2D.js');//12
cc.loadjs('textures/CCTextureCache.js');//12
cc.loadjs('textures/CCTextureAtlas.js');//12
cc.loadjs('actions/CCAction.js');//7
cc.loadjs('platform/CCFileUtils.js');//7
cc.loadjs('actions/CCActionInterval.js');//7
cc.loadjs('actions/CCActionInstant.js');//7
cc.loadjs('actions/CCActionManager.js');//7
cc.loadjs('actions/CCActionProgressTimer.js');//7
cc.loadjs('actions/CCActionCamera.js');//7
cc.loadjs('layers_scenes_transitions_nodes/CCScene.js');//8
cc.loadjs('layers_scenes_transitions_nodes/CCLayer.js');//9
cc.loadjs('layers_scenes_transitions_nodes/CCTransition.js');//9
cc.loadjs('layers_scenes_transitions_nodes/CCTransitionRadial.js');//9
cc.loadjs('layers_scenes_transitions_nodes/CCTransitionPageTurn.js');//9
cc.loadjs('sprite_nodes/CCSprite.js');//10
cc.loadjs('sprite_nodes/CCAnimation.js');
cc.loadjs('sprite_nodes/CCSpriteFrame.js');
cc.loadjs('sprite_nodes/CCSpriteFrameCache.js');
cc.loadjs('sprite_nodes/CCSpriteBatchNode.js');//10
cc.loadjs('label_nodes/CCLabelTTF.js');//11
cc.loadjs('particle_nodes/CCParticleSystem.js');//11
cc.loadjs('particle_nodes/CCParticleSystemQuad.js');//11
cc.loadjs('particle_nodes/CCParticleSystemPoint.js');//11
cc.loadjs('particle_nodes/CCParticleExamples.js');//11
cc.loadjs('touch_dispatcher/CCTouchDelegateProtocol.js');//12
cc.loadjs('touch_dispatcher/CCTouchHandler.js');//12
cc.loadjs('touch_dispatcher/CCTouchDispatcher.js');//12
cc.loadjs('keypad_dispatcher/CCKeypadDelegate.js');//12
cc.loadjs('keypad_dispatcher/CCKeypadDispatcher.js');//12
cc.loadjs('misc_nodes/CCProgressTimer.js');//11
cc.loadjs('CCDirector.js');//13
cc.loadjs('CCCamera.js');//13
cc.loadjs('CCScheduler.js');//14
cc.loadjs('CCLoader.js');//14
cc.loadjs('CCDrawingPrimitives.js');//15
cc.loadjs('platform/CCApplication.js');//16
cc.loadjs('platform/CCSAXParser.js');//16
cc.loadjs('../tests/Classes/AppDelegate.js');//17
cc.loadjs('platform/AppControl.js');//18
cc.loadjs('menu_nodes/CCdomMenuItem.js');
cc.loadjs('menu_nodes/CCdomMenu.js');
cc.loadjs('tileMap_parallax_nodes/CCTMXTiledMap.js');
cc.loadjs('tileMap_parallax_nodes/CCTMXXMLParser.js');
cc.loadjs('tileMap_parallax_nodes/CCTMXObjectGroup.js');
cc.loadjs('tileMap_parallax_nodes/CCTMXLayer.js');
cc.loadjs('../CocosDenshion/SimpleAudioEngine.js');
cc.loadjs('../tests/testbasic.js');
cc.loadjs('../tests/testResource.js');
cc.loadjs('../tests/Classes/tests/TouchesTest/Ball.js');
cc.loadjs('../tests/Classes/tests/TouchesTest/Paddle.js');
cc.loadjs('../tests/Classes/tests/TouchesTest/TouchesTest.js');
cc.loadjs('../tests/Classes/tests/SchedulerTest/SchedulerTest.js');
cc.loadjs('../tests/Classes/tests/ClickAndMoveTest/ClickAndMoveTest.js');
cc.loadjs('../tests/Classes/tests/MenuTest/MenuTest.js');
cc.loadjs('../tests/Classes/tests/ActionsTest/ActionsTest.js');
cc.loadjs('../tests/Classes/tests/TileMapTest/TileMapTest.js');
cc.loadjs('../tests/Classes/tests/TransitionsTest/TransitionsTest.js');
cc.loadjs('../tests/Classes/tests/DrawPrimitivesTest/DrawPrimitivesTest.js');
cc.loadjs('../tests/Classes/tests/ParticleTest/ParticleTest.js');
cc.loadjs('../tests/Classes/tests/ProgressActionsTest/ProgressActionsTest.js');
cc.loadjs('../tests/Classes/tests/LayerTest/LayerTest.js');
cc.loadjs('../tests/Classes/tests/SceneTest/SceneTest.js');
cc.loadjs('../tests/Classes/tests/TextureCacheTest/TextureCacheTest.js');
cc.loadjs('../tests/Classes/tests/SpriteTest/SpriteTest.js');
