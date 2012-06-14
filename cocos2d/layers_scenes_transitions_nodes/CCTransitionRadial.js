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

/**
 * tag for scene redial
 * @constant
 * @type Number
 */
cc.SCENE_RADIAL = 0xc001;

/**
 * A counter colock-wise radial transition to the next scene
 * @class
 * @extends cc.TransitionScene
 */
cc.TransitionRadialCCW = cc.TransitionScene.extend(/** @lends cc.TransitionRadialCCW# */{

    /**
     * custom on enter
     */
    onEnter:function () {
        this._super();
        // create a transparent color layer
        // in which we are going to add our rendertextures
        var size = cc.Director.sharedDirector().getWinSize();

        // create the second render texture for outScene
        var outTexture = cc.RenderTexture.create(size.width, size.height);

        if (null == outTexture) {
            return;
        }

        outTexture.getSprite().setAnchorPoint(cc.ccp(0.5, 0.5));
        outTexture.setPosition(cc.ccp(size.width / 2, size.height / 2));
        outTexture.setAnchorPoint(cc.ccp(0.5, 0.5));

        // render outScene to its texturebuffer
        outTexture.clear(0, 0, 0, 1);
        outTexture.begin();
        this._outScene.visit();
        outTexture.end();

        //	Since we've passed the outScene to the texture we don't need it.
        this.hideOutShowIn();

        //	We need the texture in RenderTexture.
        var outNode = cc.ProgressTimer.createWithTexture(outTexture.getSprite().getTexture());
        // but it's flipped upside down so we flip the sprite
        outNode.getSprite().setFlipY(true);
        //	Return the radial type that we want to use
        outNode.setType(_radialType());
        outNode.setPercentage(100);
        outNode.setPosition(cc.ccp(size.width / 2, size.height / 2));
        outNode.setAnchorPoint(cc.ccp(0.5, 0.5));

        // create the blend action
        var layerAction = cc.Sequence.create
            (
                cc.ProgressFromTo.create(this._duration, 100.0, 0.0),
                cc.CallFunc.create(this, cc.TransitionScene.finish),
                null
            );
        // run the blend action
        outNode.runAction(layerAction);

        // add the layer (which contains our two rendertextures) to the scene
        this.addChild(outNode, 2, cc.SCENE_RADIAL);
    },

    /**
     * custom on exit
     */
    onExit:function () {
// remove our layer and release all containing objects
        this.removeChildByTag(cc.SCENE_RADIAL, false);
        this._super();
    },
    _sceneOrder:function () {
        this._isInSceneOnTop = false;
    },
    _radialType:function () {
        return cc.CCPROGRESS_TIMER_RADIAL_CCW;
    }
});

/**
 * A counter colock-wise radial transition to the next scene
 * @class
 * @extends cc.TransitionRadialCCW
 */
cc.TransitionRadialCW = cc.TransitionRadialCCW.extend(/** @lends cc.TransitionRadialCW# */{
    _radialType:function () {
        return cc.CCPROGRESS_TIMER_TYPE_RADIAL_CW;
    }
});

/**
 * create a counter colock-wise radial transition to the next scene
 * @param {Number} t time in seconds
 * @param {cc.Scene} scene
 * @return {cc.TransitionRadialCCW}
 * @example
 * // Example
 * var myTransition = cc.TransitionRadialCCW.create(1.5, nextScene)//Redial that turns counter clock wise (left)
 */
cc.TransitionRadialCCW.create = function (t, scene) {
    var tmpScene = new cc.TransitionRadialCCW();
    tmpScene.initWithDuration(t, scene);
    return tmpScene;
};

/**
 * create a colock-wise radial transition to the next scene
 * @param {Number} t time in seconds
 * @param {cc.Scene} scene
 * @return {cc.TransitionRadialCW}
 * @example
 * // Example
 * var myTransition = cc.TransitionRadialCW.create(1.5, nextScene)//Redial that turns clock wise (right)
 */
cc.TransitionRadialCW.create = function (t, scene) {
    var tmpScene = new cc.TransitionRadialCW();
    tmpScene.initWithDuration(t, scene);
    return tmpScene;
};