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
(function () {
    var d = document;
    var c = {
        menuType:'canvas', //wether to use canvas mode menu or dom menu
        COCOS2D_DEBUG:2, //0 to turn debug off, 1 for basic debug, and 2 for full debug
        box2d:true,
        showFPS:true,
        frameRate:60,
        tag:'gameCanvas', //the dom element to run cocos2d on
        engineDir:'../cocos2d/',
        appFiles:[//'Classes/AppDelegate.js',
            'testbasic.js',
            'testResource.js',
            'Classes/tests/TouchesTest/Ball.js',
            'Classes/tests/TouchesTest/Paddle.js',
            'Classes/tests/TouchesTest/TouchesTest.js',
            'Classes/tests/SchedulerTest/SchedulerTest.js',
            'Classes/tests/ClickAndMoveTest/ClickAndMoveTest.js',
            'Classes/tests/MenuTest/MenuTest.js',
            'Classes/tests/MultiTouchTest/MultiTouchTest.js',
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
            'Classes/tests/Box2dTest/Box2dTest.js']
    };
    window.addEventListener('DOMContentLoaded', function () {
        //first load engine file if specified
        var s = d.createElement('script');
        s.src = c.engineDir + 'platform/jsloader.js';
        d.body.appendChild(s);
        s.c = c;
        s.id = 'cocos2d-html5';
        //else if single file specified, load singlefile
    });
})();