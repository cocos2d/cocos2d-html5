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
        'cocoa/CCGeometry.js',
        'platform/Sys.js',
        'platform/CCConfig.js',
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
        'platform/CCEGLView.js',
        'platform/CCImage.js',
        'kazmath/utility.js',
        'kazmath/vec2.js',
        'kazmath/vec3.js',
        'kazmath/vec4.js',
        'kazmath/ray2.js',
        'kazmath/mat3.js',
        'kazmath/mat4.js',
        'kazmath/plane.js',
        'kazmath/quaternion.js',
        'kazmath/aabb.js',
        'kazmath/GL/mat4stack.js',
        'kazmath/GL/matrix.js',
        'cocoa/CCSet.js',
        'cocoa/CCNS.js',
        'cocoa/CCAffineTransform.js',
        'support/CCPointExtension.js',
        'support/CCUserDefault.js',
        'support/CCVertex.js',
        'support/TransformUtils.js',
        'support/CCTGAlib.js',
        'support/CCPNGReader.js',
        'support/CCTIFFReader.js',
        'support/component/CCComponent.js',
        'support/component/CCComponentContainer.js',
        'shaders/CCShaders.js',
        'shaders/CCShaderCache.js',
        'shaders/CCGLProgram.js',
        'shaders/CCGLStateCache.js',
        'base_nodes/CCNode.js',
        'base_nodes/CCAtlasNode.js',
        'textures/CCTexture2D.js',
        'textures/CCTextureCache.js',
        'textures/CCTextureAtlas.js',
        'misc_nodes/CCRenderTexture.js',
        'misc_nodes/CCProgressTimer.js',
        'misc_nodes/CCMotionStreak.js',
        'misc_nodes/CCClippingNode.js',
        'effects/CCGrid.js',
        'effects/CCGrabber.js',
        'draw_nodes/CCDrawNode.js',
        'actions/CCAction.js',
        'actions/CCActionInterval.js',
        'actions/CCActionInstant.js',
        'actions/CCActionManager.js',
        'actions/CCActionProgressTimer.js',
        'actions/CCActionCamera.js',
        'actions/CCActionEase.js',
        'actions/CCActionGrid.js',
        'actions/CCActionGrid3D.js',
        'actions/CCActionTiledGrid.js',
        'actions/CCActionCatmullRom.js',
        'actions/CCActionPageTurn3D.js',
        'actions/CCActionTween.js',
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
        'CCConfiguration.js',
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
    var c = d["ccConfig"];

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
            '../extensions/GUI/CCControlExtension/CCControlStepper.js',
            '../extensions/GUI/CCControlExtension/CCControlPotentiometer.js',
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
            '../extensions/CCEditBox.js',
            '../extensions/CCArmature/utils/CCArmatureDefine.js',
            '../extensions/CCArmature/utils/CCDataReaderHelper.js',
            '../extensions/CCArmature/utils/CCSpriteFrameCacheHelper.js',
            '../extensions/CCArmature/utils/CCTransformHelp.js',
            '../extensions/CCArmature/utils/CCTweenFunction.js',
            '../extensions/CCArmature/utils/CCUtilMath.js',
            '../extensions/CCArmature/utils/CSArmatureDataManager.js',
            '../extensions/CCArmature/datas/CCDatas.js',
            '../extensions/CCArmature/display/CCBatchNode.js',
            '../extensions/CCArmature/display/CCDecorativeDisplay.js',
            '../extensions/CCArmature/display/CCDisplayFactory.js',
            '../extensions/CCArmature/display/CCDisplayManager.js',
            '../extensions/CCArmature/display/CCShaderNode.js',
            '../extensions/CCArmature/display/CCSkin.js',
            '../extensions/CCArmature/animation/CCProcessBase.js',
            '../extensions/CCArmature/animation/CCArmatureAnimation.js',
            '../extensions/CCArmature/animation/CCTween.js',
            '../extensions/CCArmature/physics/CCColliderDetector.js',
            '../extensions/CCArmature/physics/CCPhysicsWorld.js',
            '../extensions/CCArmature/CCArmature.js',
            '../extensions/CCArmature/CCBone.js'

        ]);
    }

    if (c.loadPluginx != null && c.loadPluginx == true) {
        engine = engine.concat([
            //protocols
            '../extensions/PluginX/protocols/Config.js',
            '../extensions/PluginX/protocols/PluginUtils.js',
            '../extensions/PluginX/protocols/PluginProtocol.js',
            '../extensions/PluginX/protocols/ProtocolSocial.js',
            //'../extensions/PluginX/protocols/ProtocolAds.js',
            //'../extensions/PluginX/protocols/ProtocolAnalytics.js',
            //'../extensions/PluginX/protocols/ProtocolIAP.js',
            '../extensions/PluginX/protocols/PluginFactory.js',
            '../extensions/PluginX/protocols/PluginManager.js',

            //plugins
            '../extensions/PluginX/plugins/SocialWeibo.js',
            '../extensions/PluginX/plugins/SocialQQWeibo.js',
            '../extensions/PluginX/plugins/SocialQzone.js',
            '../extensions/PluginX/plugins/SocialTwitter.js',
            '../extensions/PluginX/plugins/SocialFacebook.js'
            //'../extensions/PluginX/plugins/AdsGoogle.js'
        ]);
    }

    if (!c.engineDir) {
        engine = [];
    }
    else {
        if(c.box2d || c.chipmunk){
            engine.push('physics_nodes/CCPhysicsSprite.js');
            engine.push('physics_nodes/CCPhysicsDebugNode.js');
            if (c.box2d === true)
                engine.push('../box2d/box2d.js');
            if (c.chipmunk === true)
                engine.push('../chipmunk/chipmunk.js');
        }
        engine.forEach(function (e, i) {
            engine[i] = c.engineDir + e;
        });
        if(typeof c.box2d === "string")
        {
            engine.push(c.box2d);
        }
        if(typeof c.chipmunk === "string")
        {
            engine.push(c.chipmunk);
        }

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
                //TODO: code for updating progress bar
                //p = s / (que.length - 1);
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
                //TODO: code for updating progress bar
                //p = loaded / que.length;
            };
            d.body.appendChild(s);
            que[i] = s;

        });
    }
})();
