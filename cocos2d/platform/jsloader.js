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
    var engine = [
        'platform/CCClass.js',
        'platform/miniFramework.js',
        'platform/CCCommon.js',
        'platform/ZipUtils.js',
        'platform/base64.js',
        'platform/gzip.js',
        'platform/CCMacro.js',
        'platform/CCFileUtils.js',
        'platform/CCTypes.js',
        'platform/CCAccelerometer.js',
        'platform/zlib.min.js',
        'cocoa/CCGeometry.js',
        'platform/Sys.js',
        'platform/CCConfig.js',
        'cocoa/CCSet.js',
        'cocoa/CCNS.js',
        'cocoa/CCAffineTransform.js',
        'support/CCPointExtension.js',
        'support/CCUserDefault.js',
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
        'particle_nodes/CCParticleExamples.js',
        'particle_nodes/CCParticleBatchNode.js',
        'touch_dispatcher/CCTouchDelegateProtocol.js',
        'touch_dispatcher/CCTouchHandler.js',
        'touch_dispatcher/CCTouchDispatcher.js',
        'touch_dispatcher/CCMouseDispatcher.js',
        'keyboard_dispatcher/CCKeyboardDelegate.js',
        'keyboard_dispatcher/CCKeyboardDispatcher.js',
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
        'base_nodes/CCdomNode.js',
        '../CocosDenshion/SimpleAudioEngine.js'

    ];

    var d = document;
    var c = d.ccConfig;

    if (c.loadExtension != null && c.loadExtension == true) {
        engine = engine.concat([
            '../extensions/GUI/CCControlExtension/CCControl.js',
            '../extensions/GUI/CCControlExtension/CCControlButton.js',
            '../extensions/GUI/CCControlExtension/CCControlUtils.js',
            '../extensions/GUI/CCControlExtension/CCInvocation.js',
            '../extensions/GUI/CCControlExtension/CCScale9Sprite.js',
            '../extensions/GUI/CCControlExtension/CCMenuPassive.js',
            '../extensions/GUI/CCControlExtension/CCControlSaturationBrightnessPicker.js',
            '../extensions/GUI/CCControlExtension/CCControlHuePicker.js',
            '../extensions/GUI/CCControlExtension/CCControlColourPicker.js',
            '../extensions/GUI/CCControlExtension/CCControlSlider.js',
            '../extensions/GUI/CCControlExtension/CCControlSwitch.js',
            '../extensions/GUI/CCScrollView/CCScrollView.js',
            '../extensions/GUI/CCScrollView/CCSorting.js',
            '../extensions/GUI/CCScrollView/CCTableView.js',
            '../extensions/CCBReader/CCNodeLoader.js',
            '../extensions/CCBReader/CCBReaderUtil.js',
            '../extensions/CCBReader/CCControlLoader.js',
            '../extensions/CCBReader/CCSpriteLoader.js',
            '../extensions/CCBReader/CCNodeLoaderLibrary.js',
            '../extensions/CCBReader/CCBReader.js',
            '../extensions/CCBReader/CCBValue.js',
            '../extensions/CCBReader/CCBKeyframe.js',
            '../extensions/CCBReader/CCBSequence.js',
            '../extensions/CCBReader/CCBRelativePositioning.js',
            '../extensions/CCBReader/CCBAnimationManager.js',
            '../extensions/CCControlEditBox.js'
        ]);
    }

    if (!c.engineDir) {
        engine = [];
    }
    else {
        if(c.box2d || c.chipmunk){
            engine.push('Draw_Nodes/CCDrawNode.js');
            engine.push('physics_nodes/CCPhysicsSprite.js');
            engine.push('physics_nodes/CCPhysicsDebugNode.js');
            if (c.box2d)
                engine.push('../box2d/box2d.js');
            if (c.chipmunk)
                engine.push('../chipmunk/chipmunk.js');
        }
        engine.forEach(function (e, i) {
            engine[i] = c.engineDir + e;
        });
    }

    var loaded = 0;
    var que = engine.concat(c.appFiles);
    que.push('main.js');
    if (navigator.userAgent.indexOf("Trident/5") > -1) {
        //ie9
        this.serial = -1;
        var loadNext = function () {
            var s = this.serial + 1;
            if (s < que.length) {
                var f = d.createElement('script');
                f.src = que[s];
                f.serial = s;
                f.onload = loadNext;
                d.body.appendChild(f);
                p = s / (que.length - 1);
                //TODO: code for updating progress bar
            }
        };
        loadNext();
    }
    else {
        que.forEach(function (f, i) {
            var s = d.createElement('script');
            s.async = false;
            s.src = f;
            s.onload = function () {
                loaded++;
                p = loaded / que.length;
                //TODO: code for updating progress bar
            };
            d.body.appendChild(s);
            que[i] = s;

        });
    }
})();
