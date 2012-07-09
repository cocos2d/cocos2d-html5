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
cc.Dir = './';//in relate to the html file or use absolute
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
        }
        else {
            cc.setup("gameCanvas");

            //init audio,mp3 or ogg
            //for example:
            // cc.AudioManager.sharedEngine().init("mp3,ogg");
            cc.AudioManager.sharedEngine().init("mp3");

            //we are ready to run the game
            cc.Loader.shareLoader().onloading = function () {
                cc.LoaderScene.shareLoaderScene().draw();
            };
            cc.Loader.shareLoader().onload = function () {
                cc.AppController.shareAppController().didFinishLaunchingWithOptions();
            };
            //preload ressources
            cc.Loader.shareLoader().preload([
                {type:"image", src:"Resources/HelloWorld.png"},
                {type:"image", src:"Resources/CloseNormal.png"},
                {type:"image", src:"Resources/CloseSelected.png"}
            ]);
        }
    };
    if (script.order === 0)//if the first file to load, then we put it on the head
    {
        cc.$('head').appendChild(script);
    }
};

var isDebugMode = true;

if(!isDebugMode){
    cc.loadjs('../lib/Cocos2d-html5-canvasmenu-min.js');
}else{
    cc.loadjs('../cocos2d/platform/CCClass.js');
    cc.loadjs('../cocos2d/platform/CCCommon.js');
    cc.loadjs('../cocos2d/platform/platform.js');
    cc.loadjs('../cocos2d/platform/miniFramework.js');
    cc.loadjs('../cocos2d/platform/ZipUtils.js');
    cc.loadjs('../cocos2d/platform/base64.js');
    cc.loadjs('../cocos2d/platform/gzip.js');
    cc.loadjs('../cocos2d/platform/CCMacro.js');
    cc.loadjs('../cocos2d/platform/CCFileUtils.js');
    cc.loadjs('../cocos2d/platform/CCTypes.js');
    cc.loadjs('../cocos2d/cocoa/CCGeometry.js');
    cc.loadjs('../cocos2d/platform/CCConfig.js');
    cc.loadjs('../cocos2d/cocoa/CCNS.js');
    cc.loadjs('../cocos2d/cocoa/CCSet.js');
    cc.loadjs('../cocos2d/cocoa/CCAffineTransform.js');
    cc.loadjs('../cocos2d/support/CCPointExtension.js');
    cc.loadjs('../cocos2d/base_nodes/CCNode.js');
    cc.loadjs('../cocos2d/base_nodes/CCAtlasNode.js');
    cc.loadjs('../cocos2d/textures/CCTexture2D.js');
    cc.loadjs('../cocos2d/textures/CCTextureCache.js');
    cc.loadjs('../cocos2d/textures/CCTextureAtlas.js');
    cc.loadjs('../cocos2d/misc_nodes/CCRenderTexture.js');
    cc.loadjs('../cocos2d/misc_nodes/CCProgressTimer.js');
    cc.loadjs('../cocos2d/effects/CCGrid.js');
    cc.loadjs('../cocos2d/effects/CCGrabber.js');
    cc.loadjs('../cocos2d/actions/CCAction.js');
    cc.loadjs('../cocos2d/actions/CCActionInterval.js');
    cc.loadjs('../cocos2d/actions/CCActionInstant.js');
    cc.loadjs('../cocos2d/actions/CCActionManager.js');
    cc.loadjs('../cocos2d/actions/CCActionProgressTimer.js');
    cc.loadjs('../cocos2d/actions/CCActionCamera.js');
    cc.loadjs('../cocos2d/actions/CCActionEase.js');
    cc.loadjs('../cocos2d/actions/CCActionGrid.js');
    cc.loadjs('../cocos2d/actions/CCActionTiledGrid.js');
    cc.loadjs('../cocos2d/actions/CCActionGrid.js');
    cc.loadjs('../cocos2d/layers_scenes_transitions_nodes/CCScene.js');
    cc.loadjs('../cocos2d/layers_scenes_transitions_nodes/CCLayer.js');
    cc.loadjs('../cocos2d/layers_scenes_transitions_nodes/CCTransition.js');
    cc.loadjs('../cocos2d/layers_scenes_transitions_nodes/CCTransitionProgress.js');
    cc.loadjs('../cocos2d/layers_scenes_transitions_nodes/CCTransitionPageTurn.js');
    cc.loadjs('../cocos2d/sprite_nodes/CCSprite.js');
    cc.loadjs('../cocos2d/sprite_nodes/CCAnimation.js');
    cc.loadjs('../cocos2d/sprite_nodes/CCAnimationCache.js');
    cc.loadjs('../cocos2d/sprite_nodes/CCSpriteFrame.js');
    cc.loadjs('../cocos2d/sprite_nodes/CCSpriteFrameCache.js');
    cc.loadjs('../cocos2d/sprite_nodes/CCSpriteBatchNode.js');
    cc.loadjs('../cocos2d/label_nodes/CCLabelAtlas.js');
    cc.loadjs('../cocos2d/label_nodes/CCLabelTTF.js');
    cc.loadjs('../cocos2d/label_nodes/CCLabelBMFont.js');
    cc.loadjs('../cocos2d/particle_nodes/CCParticleSystem.js');
    cc.loadjs('../cocos2d/particle_nodes/CCParticleSystemQuad.js');
    cc.loadjs('../cocos2d/particle_nodes/CCParticleSystemPoint.js');
    cc.loadjs('../cocos2d/particle_nodes/CCParticleExamples.js');
    cc.loadjs('../cocos2d/touch_dispatcher/CCTouchDelegateProtocol.js');
    cc.loadjs('../cocos2d/touch_dispatcher/CCTouchHandler.js');
    cc.loadjs('../cocos2d/touch_dispatcher/CCTouchDispatcher.js');
    cc.loadjs('../cocos2d/keypad_dispatcher/CCKeypadDelegate.js');
    cc.loadjs('../cocos2d/keypad_dispatcher/CCKeypadDispatcher.js');
    cc.loadjs('../cocos2d/text_input_node/CCIMEDispatcher.js');
    cc.loadjs('../cocos2d/text_input_node/CCTextFieldTTF.js');
    cc.loadjs('../cocos2d/CCDirector.js');
    cc.loadjs('../cocos2d/CCCamera.js');
    cc.loadjs('../cocos2d/CCScheduler.js');
    cc.loadjs('../cocos2d/CCLoader.js');
    cc.loadjs('../cocos2d/CCDrawingPrimitives.js');
    cc.loadjs('../cocos2d/platform/CCApplication.js');
    cc.loadjs('../cocos2d/platform/CCSAXParser.js');
    cc.loadjs('../cocos2d/platform/AppControl.js');

    cc.loadjs('../cocos2d/menu_nodes/CCMenuItem.js');
    cc.loadjs('../cocos2d/menu_nodes/CCMenu.js');

    cc.loadjs('../cocos2d/tileMap_parallax_nodes/CCTMXTiledMap.js');
    cc.loadjs('../cocos2d/tileMap_parallax_nodes/CCTMXXMLParser.js');
    cc.loadjs('../cocos2d/tileMap_parallax_nodes/CCTMXObjectGroup.js');
    cc.loadjs('../cocos2d/tileMap_parallax_nodes/CCTMXLayer.js');
    cc.loadjs('../cocos2d/tileMap_parallax_nodes/CCParallaxNode.js');

    cc.loadjs('../CocosDenshion/SimpleAudioEngine.js');
}

// User files
cc.loadjs('Classes/AppDelegate.js');//17
cc.loadjs('Helloworld.js');//19
