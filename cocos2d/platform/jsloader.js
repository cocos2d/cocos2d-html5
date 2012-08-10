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
var cc = cc || cc || {};
(function () {
    var engine = [
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
        'touch_dispatcher/CCTouchDelegateProtocol.js',
        'touch_dispatcher/CCTouchHandler.js',
        'touch_dispatcher/CCTouchDispatcher.js',
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
        'menu_nodes/CCMenuItem.js',
        'menu_nodes/CCMenu.js',
        'base_nodes/CCdomNode.js',
        '../CocosDenshion/SimpleAudioEngine.js'
    ];
    var d = document;
    var c = d.querySelector('#cocos2d-html5').c;
    if (c.box2d)
        engine.push('../box2d/box2d.js');
    var loaded = 0;
    engine.forEach(function (e, i) {
        engine[i] = c.engineDir + e;
    });
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
