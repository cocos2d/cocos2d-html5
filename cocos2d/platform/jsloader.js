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
            '../extensions/CocoStudio/Armature/utils/CCArmatureDefine.js',
            '../extensions/CocoStudio/Armature/utils/CCDataReaderHelper.js',
            '../extensions/CocoStudio/Armature/utils/CCSpriteFrameCacheHelper.js',
            '../extensions/CocoStudio/Armature/utils/CCTransformHelp.js',
            '../extensions/CocoStudio/Armature/utils/CCTweenFunction.js',
            '../extensions/CocoStudio/Armature/utils/CCUtilMath.js',
            '../extensions/CocoStudio/Armature/utils/CSArmatureDataManager.js',
            '../extensions/CocoStudio/Armature/datas/CCDatas.js',
            '../extensions/CocoStudio/Armature/display/CCBatchNode.js',
            '../extensions/CocoStudio/Armature/display/CCDecorativeDisplay.js',
            '../extensions/CocoStudio/Armature/display/CCDisplayFactory.js',
            '../extensions/CocoStudio/Armature/display/CCDisplayManager.js',
            '../extensions/CocoStudio/Armature/display/CCSkin.js',
            '../extensions/CocoStudio/Armature/animation/CCProcessBase.js',
            '../extensions/CocoStudio/Armature/animation/CCArmatureAnimation.js',
            '../extensions/CocoStudio/Armature/animation/CCTween.js',
            '../extensions/CocoStudio/Armature/physics/CCColliderDetector.js',
            '../extensions/CocoStudio/Armature/CCArmature.js',
            '../extensions/CocoStudio/Armature/CCBone.js'

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

    var loadJsImg = document.getElementById("cocos2d_loadJsImg");
    if(!loadJsImg){
        loadJsImg = new Image();
        loadJsImg.src = "data:image/gif;base64,R0lGODlhEAAQALMNAD8/P7+/vyoqKlVVVX9/fxUVFUBAQGBgYMDAwC8vL5CQkP///wAAAP///wAAAAAAACH/C05FVFNDQVBFMi4wAwEAAAAh+QQFAAANACwAAAAAEAAQAAAEO5DJSau9OOvNex0IMnDIsiCkiW6g6BmKYlBFkhSUEgQKlQCARG6nEBwOgl+QApMdCIRD7YZ5RjlGpCUCACH5BAUAAA0ALAAAAgAOAA4AAAQ6kLGB0JA4M7QW0hrngRllkYyhKAYqKUGguAws0ypLS8JxCLQDgXAIDg+FRKIA6v0SAECCBpXSkstMBAAh+QQFAAANACwAAAAACgAQAAAEOJDJORAac6K1kDSKYmydpASBUl0mqmRfaGTCcQgwcxDEke+9XO2WkxQSiUIuAQAkls0n7JgsWq8RACH5BAUAAA0ALAAAAAAOAA4AAAQ6kMlplDIzTxWC0oxwHALnDQgySAdBHNWFLAvCukc215JIZihVIZEogDIJACBxnCSXTcmwGK1ar1hrBAAh+QQFAAANACwAAAAAEAAKAAAEN5DJKc4RM+tDyNFTkSQF5xmKYmQJACTVpQSBwrpJNteZSGYoFWjIGCAQA2IGsVgglBOmEyoxIiMAIfkEBQAADQAsAgAAAA4ADgAABDmQSVZSKjPPBEDSGucJxyGA1XUQxAFma/tOpDlnhqIYN6MEAUXvF+zldrMBAjHoIRYLhBMqvSmZkggAIfkEBQAADQAsBgAAAAoAEAAABDeQyUmrnSWlYhMASfeFVbZdjHAcgnUQxOHCcqWylKEohqUEAYVkgEAMfkEJYrFA6HhKJsJCNFoiACH5BAUAAA0ALAIAAgAOAA4AAAQ3kMlJq704611SKloCAEk4lln3DQgyUMJxCBKyLAh1EMRR3wiDQmHY9SQslyIQUMRmlmVTIyRaIgA7";

        var canvasNode = document.getElementById(c.tag);
        canvasNode.style.backgroundColor = "black";
        canvasNode.parentNode.appendChild(loadJsImg);
        
        var canvasStyle = getComputedStyle?getComputedStyle(canvasNode):canvasNode.currentStyle;
        loadJsImg.style.left = canvasNode.offsetLeft + (parseFloat(canvasStyle.width) - loadJsImg.width)/2 + "px";
        loadJsImg.style.top = canvasNode.offsetTop + (parseFloat(canvasStyle.height) - loadJsImg.height)/2 + "px";
        loadJsImg.style.position = "absolute";
    }
    
    var updateLoading = function(p){
        if(p>=1) {
            loadJsImg.parentNode.removeChild(loadJsImg);
        }
    };

    var loaded = 0;
    var que = engine.concat(c.appFiles);
    que.push('main.js');

    if (navigator.userAgent.indexOf("Trident/5") > -1) {
        //ie9
        var i = -1;
        var loadNext = function () {
            i++;
            if (i < que.length) {
                var f = d.createElement('script');
                f.src = que[i];
                f.addEventListener('load',function(){
                    loadNext();
                    updateLoading(loaded / que.length);
                    this.removeEventListener('load', arguments.callee, false);
                },false);
                d.body.appendChild(f);
            }
            updateLoading(i / (que.length - 1));
        };
        loadNext();
    }
    else {
        que.forEach(function (f, i) {
            var s = d.createElement('script');
            s.async = false;
            s.src = f;
            s.addEventListener('load',function(){
                loaded++;
                updateLoading(loaded / que.length);
                this.removeEventListener('load', arguments.callee, false);
            },false);
            d.body.appendChild(s);
        });
    }
})();
