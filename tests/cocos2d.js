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
        } else {
            cc.setup("gameCanvas");

            //init audio
            cc.AudioManager.sharedEngine().init("mp3,ogg");

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
    if (script.order === 0) {        //if the first file to load, then we put it on the head
        cc.$('head').appendChild(script);
    }
};

//Canvas or DOM
var menuType = menuType || "DOM";

cc.loadjs('platform/CCClass.js');
cc.loadjs('platform/CCCommon.js');
cc.loadjs('platform/platform.js');
cc.loadjs('platform/JXGUtil.js');
cc.loadjs('platform/base64.js');
cc.loadjs('platform/gzip.js');
cc.loadjs('platform/ccMacro.js');
cc.loadjs('platform/ccConfig.js');
cc.loadjs('platform/CCFileUtils.js');
cc.loadjs('platform/CCTypes.js');
cc.loadjs('cocoa/CCGeometry.js');
cc.loadjs('cocoa/CCSet.js');
cc.loadjs('cocoa/CCAffineTransform.js');
cc.loadjs('support/CCPointExtension.js');
cc.loadjs('base_nodes/CCNode.js');
cc.loadjs('base_nodes/CCAtlasNode.js');
cc.loadjs('textures/CCTexture2D.js');
cc.loadjs('textures/CCTextureCache.js');
cc.loadjs('textures/CCTextureAtlas.js');
cc.loadjs('misc_nodes/CCRenderTexture.js');
cc.loadjs('misc_nodes/CCProgressTimer.js');
cc.loadjs('effects/CCGrid.js');
cc.loadjs('effects/CCGrabber.js');
cc.loadjs('actions/CCAction.js');
cc.loadjs('actions/CCActionInterval.js');
cc.loadjs('actions/CCActionInstant.js');
cc.loadjs('actions/CCActionManager.js');
cc.loadjs('actions/CCActionProgressTimer.js');
cc.loadjs('actions/CCActionCamera.js');
cc.loadjs('actions/CCActionEase.js');
cc.loadjs('actions/CCActionGrid.js');
cc.loadjs('actions/CCActionTiledGrid.js');
cc.loadjs('actions/CCActionGrid.js');
cc.loadjs('layers_scenes_transitions_nodes/CCScene.js');
cc.loadjs('layers_scenes_transitions_nodes/CCLayer.js');
cc.loadjs('layers_scenes_transitions_nodes/CCTransition.js');
cc.loadjs('layers_scenes_transitions_nodes/CCTransitionRadial.js');
cc.loadjs('layers_scenes_transitions_nodes/CCTransitionPageTurn.js');
cc.loadjs('sprite_nodes/CCSprite.js');
cc.loadjs('sprite_nodes/CCAnimation.js');
cc.loadjs('sprite_nodes/CCAnimationCache.js');
cc.loadjs('sprite_nodes/CCSpriteFrame.js');
cc.loadjs('sprite_nodes/CCSpriteFrameCache.js');
cc.loadjs('sprite_nodes/CCSpriteBatchNode.js');
cc.loadjs('label_nodes/CCLabelAtlas.js');
cc.loadjs('label_nodes/CCLabelTTF.js');
cc.loadjs('label_nodes/CCLabelBMFont.js');
cc.loadjs('particle_nodes/CCParticleSystem.js');
cc.loadjs('particle_nodes/CCParticleSystemQuad.js');
cc.loadjs('particle_nodes/CCParticleSystemPoint.js');
cc.loadjs('particle_nodes/CCParticleExamples.js');
cc.loadjs('touch_dispatcher/CCTouchDelegateProtocol.js');
cc.loadjs('touch_dispatcher/CCTouchHandler.js');
cc.loadjs('touch_dispatcher/CCTouchDispatcher.js');
cc.loadjs('keypad_dispatcher/CCKeypadDelegate.js');
cc.loadjs('keypad_dispatcher/CCKeypadDispatcher.js');
cc.loadjs('text_input_node/CCIMEDispatcher.js');
cc.loadjs('text_input_node/CCTextFieldTTF.js');
cc.loadjs('CCDirector.js');
cc.loadjs('CCCamera.js');
cc.loadjs('CCScheduler.js');
cc.loadjs('CCLoader.js');
cc.loadjs('CCDrawingPrimitives.js');
cc.loadjs('platform/CCApplication.js');
cc.loadjs('platform/CCSAXParser.js');
cc.loadjs('platform/AppControl.js');
if (menuType == "DOM") {
    cc.loadjs('base_nodes/CCdomNode.js');
    cc.loadjs('menu_nodes/CCdomMenuItem.js');
    cc.loadjs('menu_nodes/CCdomMenu.js');
} else {
    cc.loadjs('menu_nodes/CCMenuItem.js');
    cc.loadjs('menu_nodes/CCMenu.js');
}
cc.loadjs('tileMap_parallax_nodes/CCTMXTiledMap.js');
cc.loadjs('tileMap_parallax_nodes/CCTMXXMLParser.js');
cc.loadjs('tileMap_parallax_nodes/CCTMXObjectGroup.js');
cc.loadjs('tileMap_parallax_nodes/CCTMXLayer.js');
cc.loadjs('tileMap_parallax_nodes/CCParallaxNode.js');

cc.loadjs('../CocosDenshion/SimpleAudioEngine.js');

cc.loadjs('../box2d/box2d.js');

cc.loadjs('../tests/Classes/AppDelegate.js');
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
cc.loadjs('../tests/Classes/tests/CocosDenshionTest/CocosDenshionTest.js');
cc.loadjs('../tests/Classes/tests/CocosNodeTest/CocosNodeTest.js');
cc.loadjs('../tests/Classes/tests/RotateWorldTest/RotateWorldTest.js');
cc.loadjs('../tests/Classes/tests/IntervelTest/IntervelTest.js');
cc.loadjs('../tests/Classes/tests/ActionManagerTest/ActionManagerTest.js');
cc.loadjs('../tests/Classes/tests/EaseActionsTest/EaseActionsTest.js');
cc.loadjs('../tests/Classes/tests/ParallaxTest/ParallaxTest.js');
cc.loadjs('../tests/Classes/tests/DirectorTest/DirectorTest.js');
cc.loadjs('../tests/Classes/tests/PerformanceTest/PerformanceTest.js');
cc.loadjs('../tests/Classes/tests/PerformanceTest/PerformanceSpriteTest.js');
cc.loadjs('../tests/Classes/tests/PerformanceTest/PerformanceParticleTest.js');
cc.loadjs('../tests/Classes/tests/PerformanceTest/PerformanceNodeChildrenTest.js');
cc.loadjs('../tests/Classes/tests/PerformanceTest/PerformanceTextureTest.js');
cc.loadjs('../tests/Classes/tests/FontTest/FontTest.js');
cc.loadjs('../tests/Classes/tests/PerformanceTest/PerformanceTouchesTest.js');
cc.loadjs('../tests/Classes/tests/LabelTest/LabelTest.js');
cc.loadjs('../tests/Classes/tests/CurrentLanguageTest/CurrentLanguageTest.js');
cc.loadjs('../tests/Classes/tests/TextInputTest/TextInputTest.js');
cc.loadjs('../tests/Classes/tests/Box2dTest/Box2dTest.js');
