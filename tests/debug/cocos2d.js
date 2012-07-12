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
var menuType = menuType || 'canvas';
cc.COCOS2D_DEBUG = 0;
cc.engineDir = '../../cocos2d/';
cc.gameDir = '';
cc.loaded = 0;
cc.engine = [
    'platform/miniFramework.js',
    'platform/CCClass.js',
    'platform/CCCommon.js',
    'platform/platform.js',
    'platform/ZipUtils.js',
    'platform/base64.js',
    'platform/gzip.js',
    'platform/CCMacro.js',
    'platform/CCFileUtils.js',
    'platform/CCTypes.js',
    'cocoa/CCGeometry.js',
    'platform/CCConfig.js',
    'cocoa/CCSet.js',
    'cocoa/CCNS.js',
    'cocoa/CCAffineTransform.js',
    'support/CCPointExtension.js',
    'base_nodes/CCNode.js',
    'base_nodes/CCAtlasNode.js',
    'textures/CCTexture2D.js',
    'textures/CCTextureCache.js',
    'textures/CCTextureAtlas.js',
    'misc_nodes/CCRenderTexture.js',
    'misc_nodes/CCProgressTimer.js',
    'effects/CCGrid.js',
    'effects/CCGrabber.js',
    'actions/CCAction.js',
    'actions/CCActionInterval.js',
    'actions/CCActionInstant.js',
    'actions/CCActionManager.js',
    'actions/CCActionProgressTimer.js',
    'actions/CCActionCamera.js',
    'actions/CCActionEase.js',
    'actions/CCActionGrid.js',
    'actions/CCActionTiledGrid.js',
    'actions/CCActionGrid.js',
    'actions/CCActionCatmullRom.js',
    'layers_scenes_transitions_nodes/CCScene.js',
    'layers_scenes_transitions_nodes/CCLayer.js',
    'layers_scenes_transitions_nodes/CCTransition.js',
    'layers_scenes_transitions_nodes/CCTransitionProgress.js',
    'layers_scenes_transitions_nodes/CCTransitionPageTurn.js',
    'sprite_nodes/CCSprite.js',
    'sprite_nodes/CCAnimation.js',
    'sprite_nodes/CCAnimationCache.js',
    'sprite_nodes/CCSpriteFrame.js',
    'sprite_nodes/CCSpriteFrameCache.js',
    'sprite_nodes/CCSpriteBatchNode.js',
    'label_nodes/CCLabelAtlas.js',
    'label_nodes/CCLabelTTF.js',
    'label_nodes/CCLabelBMFont.js',
    'particle_nodes/CCParticleSystem.js',
    'particle_nodes/CCParticleSystemQuad.js',
    'particle_nodes/CCParticleSystemPoint.js',
    'particle_nodes/CCParticleExamples.js',
    'touch_dispatcher/CCTouchDelegateProtocol.js',
    'touch_dispatcher/CCTouchHandler.js',
    'touch_dispatcher/CCTouchDispatcher.js',
    'keypad_dispatcher/CCKeypadDelegate.js',
    'keypad_dispatcher/CCKeypadDispatcher.js',
    'text_input_node/CCIMEDispatcher.js',
    'text_input_node/CCTextFieldTTF.js',
    'CCDirector.js',
    'CCCamera.js',
    'CCScheduler.js',
    'CCLoader.js',
    'CCDrawingPrimitives.js',
    'platform/CCApplication.js',
    'platform/CCSAXParser.js',
    'platform/AppControl.js',
    'menu_nodes/CCMenuItem.js',
    'menu_nodes/CCMenu.js',
    'tileMap_parallax_nodes/CCTMXTiledMap.js',
    'tileMap_parallax_nodes/CCTMXXMLParser.js',
    'tileMap_parallax_nodes/CCTMXObjectGroup.js',
    'tileMap_parallax_nodes/CCTMXLayer.js',
    'tileMap_parallax_nodes/CCParallaxNode.js',
    '../CocosDenshion/SimpleAudioEngine.js',
    '../box2d/box2d.js'
];
(menuType != 'dom') ?
    cc.engine.push('menu_nodes/CCMenuItem.js', 'menu_nodes/CCMenu.js') :
    cc.engine.push('base_nodes/CCdomNode.js', 'menu_nodes/CCdomMenuItem.js', 'menu_nodes/CCdomMenu.js');
cc.game = ['Classes/AppDelegate.js',
    'testbasic.js',
    'testResource.js',
    'Classes/tests/TouchesTest/Ball.js',
    'Classes/tests/TouchesTest/Paddle.js',
    'Classes/tests/TouchesTest/TouchesTest.js',
    'Classes/tests/SchedulerTest/SchedulerTest.js',
    'Classes/tests/ClickAndMoveTest/ClickAndMoveTest.js',
    'Classes/tests/MenuTest/MenuTest.js',
    'Classes/tests/ActionsTest/ActionsTest.js',
    'Classes/tests/TileMapTest/TileMapTest.js',
    'Classes/tests/TransitionsTest/TransitionsTest.js',
    'Classes/tests/DrawPrimitivesTest/DrawPrimitivesTest.js',
    'Classes/tests/ParticleTest/ParticleTest.js',
    'Classes/tests/ProgressActionsTest/ProgressActionsTest.js',
    'Classes/tests/LayerTest/LayerTest.js',
    'Classes/tests/SceneTest/SceneTest.js',
    'Classes/tests/TextureCacheTest/TextureCacheTest.js',
    'Classes/tests/SpriteTest/SpriteTest.js',
    'Classes/tests/CocosDenshionTest/CocosDenshionTest.js',
    'Classes/tests/CocosNodeTest/CocosNodeTest.js',
    'Classes/tests/RotateWorldTest/RotateWorldTest.js',
    'Classes/tests/IntervelTest/IntervelTest.js',
    'Classes/tests/ActionManagerTest/ActionManagerTest.js',
    'Classes/tests/EaseActionsTest/EaseActionsTest.js',
    'Classes/tests/ParallaxTest/ParallaxTest.js',
    'Classes/tests/DirectorTest/DirectorTest.js',
    'Classes/tests/PerformanceTest/PerformanceTest.js',
    'Classes/tests/PerformanceTest/PerformanceSpriteTest.js',
    'Classes/tests/PerformanceTest/PerformanceParticleTest.js',
    'Classes/tests/PerformanceTest/PerformanceNodeChildrenTest.js',
    'Classes/tests/PerformanceTest/PerformanceTextureTest.js',
    'Classes/tests/FontTest/FontTest.js',
    'Classes/tests/PerformanceTest/PerformanceTouchesTest.js',
    'Classes/tests/LabelTest/LabelTest.js',
    'Classes/tests/CurrentLanguageTest/CurrentLanguageTest.js',
    'Classes/tests/TextInputTest/TextInputTest.js',
    'Classes/tests/Box2dTest/Box2dTest.js'
];

cc.engine.forEach(function (e, i) {
    cc.engine[i] = cc.engineDir + e;
});
cc.game.forEach(function (e, i) {
    cc.game[i] = cc.gameDir + e;
});
cc.que = cc.engine.concat(cc.game);
window.addEventListener('DOMContentLoaded', function () {
    var d = document, p;
    var cs = function () {
        return d.createElement('script')
    };
    if (navigator.userAgent.indexOf("Trident/5") > -1) {
        //ie9
        this.serial = -1;
        var loadNext = function () {
            var s = this.serial + 1;
            if (s < cc.que.length) {
                var f = cs();
                f.src = cc.que[s];
                f.serial = s;
                f.onload = loadNext;
                d.body.appendChild(f);
                p = s / (cc.que.length - 1);
                if (p == 1)
                    cc.gamestart();
            }
        };
        loadNext();
    }
    else {
        var loaded = 0;
        cc.que.forEach(function (f, i) {
            var s = cs();
            s.async = false;
            s.src = f;
            s.onload = function () {
                loaded++;
                p = loaded / cc.que.length;
                if (p == 1)
                    cc.gamestart();
            };
            d.body.appendChild(s);
            cc.que[i] = s;
        });
    }
});
cc.gamestart = function () {
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
};