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
        'cocos/platform/CCClass.js',
        'cocos/cocoa/CCGeometry.js',
        'cocos/platform/Sys.js',
        'cocos/platform/CCConfig.js',
        'cocos/platform/miniFramework.js',
        'cocos/platform/CCCommon.js',
        'cocos/platform/ZipUtils.js',
        'cocos/platform/base64.js',
        'cocos/platform/gzip.js',
        'cocos/platform/CCMacro.js',
        'cocos/platform/CCFileUtils.js',
        'cocos/platform/CCTypes.js',
        'cocos/platform/CCAccelerometer.js',
        'cocos/platform/zlib.min.js',
        'cocos/platform/CCEGLView.js',
        'cocos/platform/CCImage.js',
        'cocos/platform/CCScreen.js',
        'cocos/platform/CCVisibleRect.js',
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
        'cocos/cocoa/CCNS.js',
        'cocos/cocoa/CCAffineTransform.js',
        'cocos/support/CCPointExtension.js',
        'cocos/support/CCUserDefault.js',
        'cocos/support/CCVertex.js',
        'cocos/support/TransformUtils.js',
        'cocos/support/CCTGAlib.js',
        'cocos/support/CCPNGReader.js',
        'cocos/support/CCTIFFReader.js',
        'cocos/support/component/CCComponent.js',
        'cocos/support/component/CCComponentContainer.js',
        'shaders/CCShaders.js',
        'shaders/CCShaderCache.js',
        'shaders/CCGLProgram.js',
        'shaders/CCGLStateCache.js',
        'cocos/base_nodes/CCNode.js',
        'cocos/base_nodes/CCAtlasNode.js',
        'cocos/textures/CCTexture2D.js',
        'cocos/textures/CCTextureCache.js',
        'cocos/textures/CCTextureAtlas.js',
        'misc_nodes/CCRenderTexture.js',
        'misc_nodes/CCMotionStreak.js',
        'misc_nodes/CCClippingNode.js',
        'effects/CCGrid.js',
        'effects/CCGrabber.js',
        'draw_nodes/CCDrawNode.js',
        'actions/CCAction.js',
        'actions/CCActionInterval.js',
        'actions/CCActionInstant.js',
        'actions/CCActionManager.js',
        'actions/CCActionCamera.js',
        'actions/CCActionEase.js',
        'actions/CCActionCatmullRom.js',
        'actions/CCActionTween.js',
        'actions3d/CCActionGrid.js',
        'actions3d/CCActionGrid3D.js',
        'actions3d/CCActionTiledGrid.js',
        'actions3d/CCActionPageTurn3D.js',
        'progress_timer/CCProgressTimer.js',
        'progress_timer/CCActionProgressTimer.js',
        'cocos/scenes_nodes/CCScene.js',
        'cocos/layers_nodes/CCLayer.js',
        'transitions_nodes/CCTransition.js',
        'transitions_nodes/CCTransitionProgress.js',
        'transitions_nodes/CCTransitionPageTurn.js',
        'cocos/sprite_nodes/CCSprite.js',
        'cocos/sprite_nodes/CCAnimation.js',
        'cocos/sprite_nodes/CCAnimationCache.js',
        'cocos/sprite_nodes/CCSpriteFrame.js',
        'cocos/sprite_nodes/CCSpriteFrameCache.js',
        'cocos/sprite_nodes/CCSpriteBatchNode.js',
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
        'cocos/CCConfiguration.js',
        'cocos/CCDirector.js',
        'cocos/CCCamera.js',
        'cocos/CCScheduler.js',
        'cocos/CCLoader.js',
        'CCDrawingPrimitives.js',
        'cocos/platform/CCApplication.js',
        'cocos/platform/CCSAXParser.js',
        'cocos/platform/AppControl.js',
        'menu_nodes/CCMenuItem.js',
        'menu_nodes/CCMenu.js',
        'tileMap_nodes/CCTMXTiledMap.js',
        'tileMap_nodes/CCTMXXMLParser.js',
        'tileMap_nodes/CCTMXObjectGroup.js',
        'tileMap_nodes/CCTMXLayer.js',
        'parallax_nodes/CCParallaxNode.js',
        'cocos/base_nodes/CCdomNode.js',
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
            '../extensions/CCEditBox/CCEditBox.js',

            '../extensions/CocoStudio/CocoStudio.js',
            // CocoStudio Armature
            '../extensions/CocoStudio/Armature/utils/CCArmatureDefine.js',
            '../extensions/CocoStudio/Armature/utils/CCDataReaderHelper.js',
            '../extensions/CocoStudio/Armature/utils/CCSpriteFrameCacheHelper.js',
            '../extensions/CocoStudio/Armature/utils/CCTransformHelp.js',
            '../extensions/CocoStudio/Armature/utils/CCTweenFunction.js',
            '../extensions/CocoStudio/Armature/utils/CCUtilMath.js',
            '../extensions/CocoStudio/Armature/utils/CCArmatureDataManager.js',
            '../extensions/CocoStudio/Armature/datas/CCDatas.js',
            '../extensions/CocoStudio/Armature/display/CCDecorativeDisplay.js',
            '../extensions/CocoStudio/Armature/display/CCDisplayFactory.js',
            '../extensions/CocoStudio/Armature/display/CCDisplayManager.js',
            '../extensions/CocoStudio/Armature/display/CCSkin.js',
            '../extensions/CocoStudio/Armature/animation/CCProcessBase.js',
            '../extensions/CocoStudio/Armature/animation/CCArmatureAnimation.js',
            '../extensions/CocoStudio/Armature/animation/CCTween.js',
            '../extensions/CocoStudio/Armature/physics/CCColliderDetector.js',
            '../extensions/CocoStudio/Armature/CCArmature.js',
            '../extensions/CocoStudio/Armature/CCBone.js',
            // CocoStudio Action
            '../extensions/CocoStudio/Action/CCActionFrame.js',
            '../extensions/CocoStudio/Action/CCActionManager.js',
            '../extensions/CocoStudio/Action/CCActionNode.js',
            '../extensions/CocoStudio/Action/CCActionObject.js',
            // CocoStudio Components
            '../extensions/CocoStudio/Components/CCComAttribute.js',
            '../extensions/CocoStudio/Components/CCComAudio.js',
            '../extensions/CocoStudio/Components/CCComController.js',
            '../extensions/CocoStudio/Components/CCComRender.js',
            // CocoStudio GUI
            '../extensions/CocoStudio/GUI/BaseClasses/UIWidget.js',
            '../extensions/CocoStudio/GUI/Layouts/UILayout.js',
            '../extensions/CocoStudio/GUI/BaseClasses/UIRootWidget.js',
            '../extensions/CocoStudio/GUI/Layouts/UILayoutParameter.js',
            '../extensions/CocoStudio/GUI/Layouts/UILayoutDefine.js',
            '../extensions/CocoStudio/GUI/System/CocosGUI.js',
            '../extensions/CocoStudio/GUI/System/UIHelper.js',
            '../extensions/CocoStudio/GUI/System/UIInputManager.js',
            '../extensions/CocoStudio/GUI/System/UILayer.js',
            '../extensions/CocoStudio/GUI/UIWidgets/UIButton.js',
            '../extensions/CocoStudio/GUI/UIWidgets/UICheckBox.js',
            '../extensions/CocoStudio/GUI/UIWidgets/UIImageView.js',
            '../extensions/CocoStudio/GUI/UIWidgets/UILabel.js',
            '../extensions/CocoStudio/GUI/UIWidgets/UILabelAtlas.js',
            '../extensions/CocoStudio/GUI/UIWidgets/UILabelBMFont.js',
            '../extensions/CocoStudio/GUI/UIWidgets/UILoadingBar.js',
            '../extensions/CocoStudio/GUI/UIWidgets/UISlider.js',
            '../extensions/CocoStudio/GUI/UIWidgets/UISwitch.js',
            '../extensions/CocoStudio/GUI/UIWidgets/UITextField.js',
            '../extensions/CocoStudio/GUI/UIWidgets/Compatible/CompatibleClasses.js',
            '../extensions/CocoStudio/GUI/UIWidgets/ScrollWidget/UIScrollView.js',
            '../extensions/CocoStudio/GUI/UIWidgets/ScrollWidget/UIListView.js',
            '../extensions/CocoStudio/GUI/UIWidgets/ScrollWidget/UIPageView.js',
            '../extensions/CocoStudio/GUI/UIWidgets/ScrollWidget/UIScrollInterface.js',
            '../extensions/CocoStudio/Reader/GUIReader.js',
            '../extensions/CocoStudio/Reader/SceneReader.js'

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
    }
    if (typeof c.box2d === "string") {
        engine.push(c.box2d);
    }
    if (typeof c.chipmunk === "string") {
        engine.push(c.chipmunk);
    }

    var loadJsImg = document.getElementById("cocos2d_loadJsImg");
    if(!loadJsImg){
        loadJsImg = document.createElement('img');
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
