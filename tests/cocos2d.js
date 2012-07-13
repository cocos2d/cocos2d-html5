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
cc.Dir = '../';//in relate to the html file or use absolute
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
var isDebugMode = true;

if (!isDebugMode) {
    if (menuType == "DOM") {
        cc.loadjs('lib/Cocos2d-html5-dommenu-min.js');
    } else {
        cc.loadjs('lib/Cocos2d-html5-canvasmenu-min.js');
    }
    cc.loadjs('box2d/box2d.js');
    cc.loadjs('tests/cocos2d-html5-testcases.js');
} else {
    cc.loadjs('cocos2d/platform/CCClass.js');
    cc.loadjs('cocos2d/platform/CCCommon.js');
    cc.loadjs('cocos2d/platform/platform.js');
    cc.loadjs('cocos2d/platform/miniFramework.js');
    cc.loadjs('cocos2d/platform/ZipUtils.js');
    cc.loadjs('cocos2d/platform/base64.js');
    cc.loadjs('cocos2d/platform/gzip.js');
    cc.loadjs('cocos2d/platform/CCMacro.js');
    cc.loadjs('cocos2d/platform/CCFileUtils.js');
    cc.loadjs('cocos2d/platform/CCTypes.js');
    cc.loadjs('cocos2d/cocoa/CCGeometry.js');
    cc.loadjs('cocos2d/platform/CCConfig.js');
    cc.loadjs('cocos2d/cocoa/CCNS.js');
    cc.loadjs('cocos2d/cocoa/CCSet.js');
    cc.loadjs('cocos2d/cocoa/CCAffineTransform.js');
    cc.loadjs('cocos2d/support/CCPointExtension.js');
    cc.loadjs('cocos2d/base_nodes/CCNode.js');
    cc.loadjs('cocos2d/base_nodes/CCAtlasNode.js');
    cc.loadjs('cocos2d/textures/CCTexture2D.js');
    cc.loadjs('cocos2d/textures/CCTextureCache.js');
    cc.loadjs('cocos2d/textures/CCTextureAtlas.js');
    cc.loadjs('cocos2d/misc_nodes/CCRenderTexture.js');
    cc.loadjs('cocos2d/misc_nodes/CCProgressTimer.js');
    cc.loadjs('cocos2d/effects/CCGrid.js');
    cc.loadjs('cocos2d/effects/CCGrabber.js');
    cc.loadjs('cocos2d/actions/CCAction.js');
    cc.loadjs('cocos2d/actions/CCActionInterval.js');
    cc.loadjs('cocos2d/actions/CCActionInstant.js');
    cc.loadjs('cocos2d/actions/CCActionManager.js');
    cc.loadjs('cocos2d/actions/CCActionProgressTimer.js');
    cc.loadjs('cocos2d/actions/CCActionCamera.js');
    cc.loadjs('cocos2d/actions/CCActionEase.js');
    cc.loadjs('cocos2d/actions/CCActionGrid.js');
    cc.loadjs('cocos2d/actions/CCActionTiledGrid.js');
    cc.loadjs('cocos2d/actions/CCActionGrid.js');
    cc.loadjs('cocos2d/actions/CCActionCatmullRom.js');
    cc.loadjs('cocos2d/layers_scenes_transitions_nodes/CCScene.js');
    cc.loadjs('cocos2d/layers_scenes_transitions_nodes/CCLayer.js');
    cc.loadjs('cocos2d/layers_scenes_transitions_nodes/CCTransition.js');
    cc.loadjs('cocos2d/layers_scenes_transitions_nodes/CCTransitionProgress.js');
    cc.loadjs('cocos2d/layers_scenes_transitions_nodes/CCTransitionPageTurn.js');
    cc.loadjs('cocos2d/sprite_nodes/CCSprite.js');
    cc.loadjs('cocos2d/sprite_nodes/CCAnimation.js');
    cc.loadjs('cocos2d/sprite_nodes/CCAnimationCache.js');
    cc.loadjs('cocos2d/sprite_nodes/CCSpriteFrame.js');
    cc.loadjs('cocos2d/sprite_nodes/CCSpriteFrameCache.js');
    cc.loadjs('cocos2d/sprite_nodes/CCSpriteBatchNode.js');
    cc.loadjs('cocos2d/label_nodes/CCLabelAtlas.js');
    cc.loadjs('cocos2d/label_nodes/CCLabelTTF.js');
    cc.loadjs('cocos2d/label_nodes/CCLabelBMFont.js');
    cc.loadjs('cocos2d/particle_nodes/CCParticleSystem.js');
    cc.loadjs('cocos2d/particle_nodes/CCParticleSystemQuad.js');
    cc.loadjs('cocos2d/particle_nodes/CCParticleExamples.js');
    cc.loadjs('cocos2d/touch_dispatcher/CCTouchDelegateProtocol.js');
    cc.loadjs('cocos2d/touch_dispatcher/CCTouchHandler.js');
    cc.loadjs('cocos2d/touch_dispatcher/CCTouchDispatcher.js');
    cc.loadjs('cocos2d/keypad_dispatcher/CCKeypadDelegate.js');
    cc.loadjs('cocos2d/keypad_dispatcher/CCKeypadDispatcher.js');
    cc.loadjs('cocos2d/text_input_node/CCIMEDispatcher.js');
    cc.loadjs('cocos2d/text_input_node/CCTextFieldTTF.js');
    cc.loadjs('cocos2d/CCDirector.js');
    cc.loadjs('cocos2d/CCCamera.js');
    cc.loadjs('cocos2d/CCScheduler.js');
    cc.loadjs('cocos2d/CCLoader.js');
    cc.loadjs('cocos2d/CCDrawingPrimitives.js');
    cc.loadjs('cocos2d/platform/CCApplication.js');
    cc.loadjs('cocos2d/platform/CCSAXParser.js');
    cc.loadjs('cocos2d/platform/AppControl.js');
    if (menuType == "DOM") {
        cc.loadjs('cocos2d/base_nodes/CCdomNode.js');
        cc.loadjs('cocos2d/menu_nodes/CCdomMenuItem.js');
        cc.loadjs('cocos2d/menu_nodes/CCdomMenu.js');
    } else {
        cc.loadjs('cocos2d/menu_nodes/CCMenuItem.js');
        cc.loadjs('cocos2d/menu_nodes/CCMenu.js');
    }
    cc.loadjs('cocos2d/tileMap_parallax_nodes/CCTMXTiledMap.js');
    cc.loadjs('cocos2d/tileMap_parallax_nodes/CCTMXXMLParser.js');
    cc.loadjs('cocos2d/tileMap_parallax_nodes/CCTMXObjectGroup.js');
    cc.loadjs('cocos2d/tileMap_parallax_nodes/CCTMXLayer.js');
    cc.loadjs('cocos2d/tileMap_parallax_nodes/CCParallaxNode.js');

    cc.loadjs('CocosDenshion/SimpleAudioEngine.js');

    cc.loadjs('box2d/box2d.js');

    cc.loadjs('tests/Classes/AppDelegate.js');
    cc.loadjs('tests/testbasic.js');
    cc.loadjs('tests/testResource.js');
    cc.loadjs('tests/Classes/tests/TouchesTest/Ball.js');
    cc.loadjs('tests/Classes/tests/TouchesTest/Paddle.js');
    cc.loadjs('tests/Classes/tests/TouchesTest/TouchesTest.js');
    cc.loadjs('tests/Classes/tests/SchedulerTest/SchedulerTest.js');
    cc.loadjs('tests/Classes/tests/ClickAndMoveTest/ClickAndMoveTest.js');
    cc.loadjs('tests/Classes/tests/MenuTest/MenuTest.js');
    cc.loadjs('tests/Classes/tests/ActionsTest/ActionsTest.js');
    cc.loadjs('tests/Classes/tests/TileMapTest/TileMapTest.js');
    cc.loadjs('tests/Classes/tests/TransitionsTest/TransitionsTest.js');
    cc.loadjs('tests/Classes/tests/DrawPrimitivesTest/DrawPrimitivesTest.js');
    cc.loadjs('tests/Classes/tests/ParticleTest/ParticleTest.js');
    cc.loadjs('tests/Classes/tests/ProgressActionsTest/ProgressActionsTest.js');
    cc.loadjs('tests/Classes/tests/LayerTest/LayerTest.js');
    cc.loadjs('tests/Classes/tests/SceneTest/SceneTest.js');
    cc.loadjs('tests/Classes/tests/TextureCacheTest/TextureCacheTest.js');
    cc.loadjs('tests/Classes/tests/SpriteTest/SpriteTest.js');
    cc.loadjs('tests/Classes/tests/CocosDenshionTest/CocosDenshionTest.js');
    cc.loadjs('tests/Classes/tests/CocosNodeTest/CocosNodeTest.js');
    cc.loadjs('tests/Classes/tests/RotateWorldTest/RotateWorldTest.js');
    cc.loadjs('tests/Classes/tests/IntervelTest/IntervelTest.js');
    cc.loadjs('tests/Classes/tests/ActionManagerTest/ActionManagerTest.js');
    cc.loadjs('tests/Classes/tests/EaseActionsTest/EaseActionsTest.js');
    cc.loadjs('tests/Classes/tests/ParallaxTest/ParallaxTest.js');
    cc.loadjs('tests/Classes/tests/DirectorTest/DirectorTest.js');
    cc.loadjs('tests/Classes/tests/PerformanceTest/PerformanceTest.js');
    cc.loadjs('tests/Classes/tests/PerformanceTest/PerformanceSpriteTest.js');
    cc.loadjs('tests/Classes/tests/PerformanceTest/PerformanceParticleTest.js');
    cc.loadjs('tests/Classes/tests/PerformanceTest/PerformanceNodeChildrenTest.js');
    cc.loadjs('tests/Classes/tests/PerformanceTest/PerformanceTextureTest.js');
    cc.loadjs('tests/Classes/tests/FontTest/FontTest.js');
    cc.loadjs('tests/Classes/tests/PerformanceTest/PerformanceTouchesTest.js');
    cc.loadjs('tests/Classes/tests/LabelTest/LabelTest.js');
    cc.loadjs('tests/Classes/tests/CurrentLanguageTest/CurrentLanguageTest.js');
    cc.loadjs('tests/Classes/tests/TextInputTest/TextInputTest.js');
    cc.loadjs('tests/Classes/tests/Box2dTest/Box2dTest.js');
}

