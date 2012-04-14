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

cc.kSceneRadial = 0xc001;
/**
 @brief A counter colock-wise radial transition to the next scene
 */
cc.TransitionRadialCCW = cc.TransitionScene.extend({
    onEnter:function () {
        this._super();
        // create a transparent color layer
        // in which we are going to add our rendertextures
        var size = cc.Director.sharedDirector().getWinSize();

        // create the second render texture for outScene
        var outTexture = cc.RenderTexture.renderTextureWithWidthAndHeight(size.width, size.height);

        if (null == outTexture){
            return;
        }

        outTexture.getSprite().setAnchorPoint(cc.ccp(0.5,0.5));
        outTexture.setPosition(cc.ccp(size.width/2, size.height/2));
        outTexture.setAnchorPoint(cc.ccp(0.5,0.5));

        // render outScene to its texturebuffer
        outTexture.clear(0,0,0,1);
        outTexture.begin();
        this._m_pOutScene.visit();
        outTexture.end();

        //	Since we've passed the outScene to the texture we don't need it.
        this.hideOutShowIn();

        //	We need the texture in RenderTexture.
        var outNode = cc.ProgressTimer.progressWithTexture(outTexture.getSprite().getTexture());
        // but it's flipped upside down so we flip the sprite
        outNode.getSprite().setFlipY(true);
        //	Return the radial type that we want to use
        outNode.setType(_radialType());
        outNode.setPercentage(100);
        outNode.setPosition(cc.ccp(size.width/2, size.height/2));
        outNode.setAnchorPoint(cc.ccp(0.5,0.5));

        // create the blend action
        var layerAction = cc.Sequence.actions
            (
                cc.ProgressFromTo.actionWithDuration(this._m_fDuration, 100.0, 0.0),
        cc.CallFunc.actionWithTarget(this, cc.TransitionScene.finish),
            null
        );
        // run the blend action
        outNode.runAction(layerAction);

        // add the layer (which contains our two rendertextures) to the scene
        this.addChild(outNode, 2, cc.kSceneRadial);
    },
    onExit:function () {
// remove our layer and release all containing objects
        this.removeChildByTag(cc.kSceneRadial, false);
        this._super();
    },
    _sceneOrder:function () {
        this._m_bIsInSceneOnTop = false;
    },
    _radialType:function () {
        return cc.kCCProgressTimerTypeRadialCCW;
    }
});

/**
 @brief A counter colock-wise radial transition to the next scene
 */
cc.TransitionRadialCW = cc.TransitionRadialCCW.extend({
    _radialType:function () {
        return cc.kCCProgressTimerTypeRadialCW;
    }
});

cc.TransitionRadialCCW.transitionWithDuration = function (t, scene) {
    var pScene = new cc.TransitionRadialCCW();
    pScene.initWithDuration(t, scene);
    return pScene;
};

cc.TransitionRadialCW.transitionWithDuration = function (t, scene) {
    var pScene = new cc.TransitionRadialCW();
    pScene.initWithDuration(t, scene);
    return pScene;
};