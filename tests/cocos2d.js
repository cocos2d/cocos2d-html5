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
        menuType:'canvas', //whether to use canvas mode menu or dom menu
        COCOS2D_DEBUG:2, //0 to turn debug off, 1 for basic debug, and 2 for full debug
        box2d:true,
        showFPS:true,
        frameRate:60,
        tag:'gameCanvas', //the dom element to run cocos2d on
        engineDir:'../cocos2d/',
        //SingleEngineFile:'',
        appFiles:[//'src/AppDelegate.js',
            'src/testbasic.js',
            'src/testResource.js',
            'src/tests/TouchesTest/Ball.js',
            'src/tests/TouchesTest/Paddle.js',
            'src/tests/TouchesTest/TouchesTest.js',
            'src/tests/SchedulerTest/SchedulerTest.js',
            'src/tests/ClickAndMoveTest/ClickAndMoveTest.js',
            'src/tests/MenuTest/MenuTest.js',
            'src/tests/MultiTouchTest/MultiTouchTest.js',
            'src/tests/ActionsTest/ActionsTest.js',
            'src/tests/TileMapTest/TileMapTest.js',
            'src/tests/TransitionsTest/TransitionsTest.js',
            'src/tests/DrawPrimitivesTest/DrawPrimitivesTest.js',
            'src/tests/ParticleTest/ParticleTest.js',
            'src/tests/ProgressActionsTest/ProgressActionsTest.js',
            'src/tests/LayerTest/LayerTest.js',
            'src/tests/SceneTest/SceneTest.js',
            'src/tests/TextureCacheTest/TextureCacheTest.js',
            'src/tests/SpriteTest/SpriteTest.js',
            'src/tests/CocosDenshionTest/CocosDenshionTest.js',
            'src/tests/CocosNodeTest/CocosNodeTest.js',
            'src/tests/RotateWorldTest/RotateWorldTest.js',
            'src/tests/IntervelTest/IntervelTest.js',
            'src/tests/ActionManagerTest/ActionManagerTest.js',
            'src/tests/EaseActionsTest/EaseActionsTest.js',
            'src/tests/ParallaxTest/ParallaxTest.js',
            'src/tests/PerformanceTest/PerformanceTest.js',
            'src/tests/PerformanceTest/PerformanceSpriteTest.js',
            'src/tests/PerformanceTest/PerformanceParticleTest.js',
            'src/tests/PerformanceTest/PerformanceNodeChildrenTest.js',
            'src/tests/PerformanceTest/PerformanceTextureTest.js',
            'src/tests/FontTest/FontTest.js',
            'src/tests/PerformanceTest/PerformanceTouchesTest.js',
            'src/tests/LabelTest/LabelTest.js',
            'src/tests/CurrentLanguageTest/CurrentLanguageTest.js',
            'src/tests/TextInputTest/TextInputTest.js',
            'src/tests/Box2dTest/Box2dTest.js']
    };
    window.addEventListener('DOMContentLoaded', function () {
        //first load engine file if specified
        var s = d.createElement('script');
        /*********Delete this section if you have packed all files into one*******/
        if (c.SingleEngineFile && !c.engineDir) {
            s.src = c.SingleEngineFile;
        }
        else if (c.engineDir && !c.SingleEngineFile) {
            s.src = c.engineDir + 'platform/jsloader.js';
        }
        else {
            alert('You must specify either the single engine file OR the engine directory in "cocos2d.js"');
        }
        /*********Delete this section if you have packed all files into one*******/

            //s.src = 'Packed_Release_File.js'; //IMPORTANT: Un-comment this line if you have packed all files into one

        d.body.appendChild(s);
        s.c = c;
        s.id = 'cocos2d-html5';
        //else if single file specified, load singlefile
    });
})();
