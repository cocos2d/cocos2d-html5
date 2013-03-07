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
 * cc.TransitionProgress transition.
 * @class
 * @extends cc.TransitionScene
 */
cc.TransitionProgress = cc.TransitionScene.extend(/** @lends cc.TransitionProgress# */{
    _to:0,
    _from:0,
    _sceneToBeModified:null,

    /**
     * @override
     */
    onEnter:function () {
        this._super();

        this._setupTransition();

        // create a transparent color layer
        // in which we are going to add our rendertextures
        var winSize = cc.Director.getInstance().getWinSize();

        // create the second render texture for outScene
        var texture = cc.RenderTexture.create(winSize.width, winSize.height);
        texture.getSprite().setAnchorPoint(cc.p(0.5, 0.5));
        texture.setPosition(cc.p(winSize.width / 2, winSize.height / 2));
        texture.setAnchorPoint(cc.p(0.5, 0.5));

        if (cc.renderContextType === cc.CANVAS) {
            // render outScene to its texturebuffer
            texture.clear();
            this._sceneToBeModified.visit(texture.context);
        } else {
            // render outScene to its texturebuffer
            texture.clear(0, 0, 0, 1);
            texture.begin();
            this._sceneToBeModified.visit();
            texture.end();
        }
        //    Since we've passed the outScene to the texture we don't need it.
        if (this._sceneToBeModified == this._outScene) {
            this.hideOutShowIn();
        }
        //    We need the texture in RenderTexture.
        var pNode = this._progressTimerNodeWithRenderTexture(texture);

        // create the blend action
        var layerAction = cc.Sequence.create(
            cc.ProgressFromTo.create(this._duration, this._from, this._to),
            cc.CallFunc.create(this.finish, this));
        // run the blend action
        pNode.runAction(layerAction);

        // add the layer (which contains our two rendertextures) to the scene
        this.addChild(pNode, 2, cc.SCENE_RADIAL);

    },

    /**
     * @override
     */
    onExit:function () {
        // remove our layer and release all containing objects
        this.removeChildByTag(cc.SCENE_RADIAL, false);
        this._super();
    },

    _setupTransition:function () {
        this._sceneToBeModified = this._outScene;
        this._from = 100;
        this._to = 0;
    },

    _progressTimerNodeWithRenderTexture:function (texture) {
        cc.Assert(false, "override me - abstract class");
        return null;
    },

    _sceneOrder:function () {
        this._isInSceneOnTop = false;
    }
});

/**
 * create a cc.TransitionProgress object
 * @function
 * @param {Number} t time
 * @param {cc.Scene} scene
 * @return {cc.TransitionProgress}
 */
cc.TransitionProgress.create = function (t, scene) {
    var tempScene = new cc.TransitionProgress();
    if ((tempScene != null) && (tempScene.initWithDuration(t, scene))) {
        return tempScene;
    }
    return null;
};

/**
 *  cc.TransitionRadialCCW transition.<br/>
 *  A counter colock-wise radial transition to the next scene
 * @class
 * @extends cc.TransitionProgress
 */
cc.TransitionProgressRadialCCW = cc.TransitionProgress.extend(/** @lends cc.TransitionProgressRadialCCW# */{
    _progressTimerNodeWithRenderTexture:function (texture) {
        var size = cc.Director.getInstance().getWinSize();

        var pNode = cc.ProgressTimer.create(texture.getSprite());

        // but it is flipped upside down so we flip the sprite
        if (cc.renderContextType === cc.WEBGL)
            pNode.getSprite().setFlipY(true);
        pNode.setType(cc.PROGRESS_TIMER_TYPE_RADIAL);

        //    Return the radial type that we want to use
        pNode.setReverseDirection(false);
        pNode.setPercentage(100);
        pNode.setPosition(cc.p(size.width / 2, size.height / 2));
        pNode.setAnchorPoint(cc.p(0.5, 0.5));

        return pNode;
    }
});

/**
 * create a cc.TransitionProgressRadialCCW object
 * @function
 * @param {Number} t time
 * @param {cc.Scene} scene
 * @return {cc.TransitionProgressRadialCCW}
 */
cc.TransitionProgressRadialCCW.create = function (t, scene) {
    var tempScene = new cc.TransitionProgressRadialCCW();
    if ((tempScene != null) && (tempScene.initWithDuration(t, scene))) {
        return tempScene;
    }
    return null;
};

/**
 * cc.TransitionRadialCW transition.<br/>
 * A counter colock-wise radial transition to the next scene
 * @class
 * @extends cc.TransitionProgress
 */
cc.TransitionProgressRadialCW = cc.TransitionProgress.extend(/** @lends cc.TransitionProgressRadialCW# */{
    _progressTimerNodeWithRenderTexture:function (texture) {
        var size = cc.Director.getInstance().getWinSize();

        var pNode = cc.ProgressTimer.create(texture.getSprite());

        // but it is flipped upside down so we flip the sprite
        if (cc.renderContextType === cc.WEBGL)
            pNode.getSprite().setFlipY(true);
        pNode.setType(cc.PROGRESS_TIMER_TYPE_RADIAL);

        //    Return the radial type that we want to use
        pNode.setReverseDirection(true);
        pNode.setPercentage(100);
        pNode.setPosition(cc.p(size.width / 2, size.height / 2));
        pNode.setAnchorPoint(cc.p(0.5, 0.5));

        return pNode;
    }
});

/**
 * create a cc.TransitionProgressRadialCW object
 * @function
 * @param {Number} t time
 * @param {cc.Scene} scene
 * @return {cc.TransitionProgressRadialCW}
 */
cc.TransitionProgressRadialCW.create = function (t, scene) {
    var tempScene = new cc.TransitionProgressRadialCW();
    if ((tempScene != null) && (tempScene.initWithDuration(t, scene))) {
        return tempScene;
    }
    return null;
};

/**
 * cc.TransitionProgressHorizontal transition.<br/>
 * A  colock-wise radial transition to the next scene
 * @class
 * @extends cc.TransitionProgress
 */
cc.TransitionProgressHorizontal = cc.TransitionProgress.extend(/** @lends cc.TransitionProgressHorizontal# */{
    _progressTimerNodeWithRenderTexture:function (texture) {
        var size = cc.Director.getInstance().getWinSize();

        var pNode = cc.ProgressTimer.create(texture.getSprite());

        // but it is flipped upside down so we flip the sprite
        if (cc.renderContextType == cc.WEBGL)
            pNode.getSprite().setFlipY(true);
        pNode.setType(cc.PROGRESS_TIMER_TYPE_BAR);

        pNode.setMidpoint(cc.p(1, 0));
        pNode.setBarChangeRate(cc.p(1, 0));

        pNode.setPercentage(100);
        pNode.setPosition(cc.p(size.width / 2, size.height / 2));
        pNode.setAnchorPoint(cc.p(0.5, 0.5));

        return pNode;
    }
});

/**
 * create a cc.TransitionProgressHorizontal object
 * @function
 * @param {Number} t time
 * @param {cc.Scene} scene
 * @return {cc.TransitionProgressHorizontal}
 */
cc.TransitionProgressHorizontal.create = function (t, scene) {
    var tempScene = new cc.TransitionProgressHorizontal();
    if ((tempScene != null) && (tempScene.initWithDuration(t, scene))) {
        return tempScene;
    }
    return null;
};

/**
 * cc.TransitionProgressVertical transition.
 * @class
 * @extends cc.TransitionProgress
 */
cc.TransitionProgressVertical = cc.TransitionProgress.extend(/** @lends cc.TransitionProgressVertical# */{
    _progressTimerNodeWithRenderTexture:function (texture) {
        var size = cc.Director.getInstance().getWinSize();

        var pNode = cc.ProgressTimer.create(texture.getSprite());

        // but it is flipped upside down so we flip the sprite
        if (cc.renderContextType == cc.WEBGL)
            pNode.getSprite().setFlipY(true);
        pNode.setType(cc.PROGRESS_TIMER_TYPE_BAR);

        pNode.setMidpoint(cc.p(0, 0));
        pNode.setBarChangeRate(cc.p(0, 1));

        pNode.setPercentage(100);
        pNode.setPosition(cc.p(size.width / 2, size.height / 2));
        pNode.setAnchorPoint(cc.p(0.5, 0.5));

        return pNode;
    }
});

/**
 * create a cc.TransitionProgressVertical object
 * @function
 * @param {Number} t time
 * @param {cc.Scene} scene
 * @return {cc.TransitionProgressVertical}
 */
cc.TransitionProgressVertical.create = function (t, scene) {
    var tempScene = new cc.TransitionProgressVertical();
    if ((tempScene != null) && (tempScene.initWithDuration(t, scene))) {
        return tempScene;
    }
    return null;
};

/**
 * cc.TransitionProgressInOut transition.
 * @class
 * @extends cc.TransitionProgress
 */
cc.TransitionProgressInOut = cc.TransitionProgress.extend(/** @lends cc.TransitionProgressInOut# */{
    _progressTimerNodeWithRenderTexture:function (texture) {
        var size = cc.Director.getInstance().getWinSize();
        var pNode = cc.ProgressTimer.create(texture.getSprite());

        // but it is flipped upside down so we flip the sprite
        if (cc.renderContextType == cc.WEBGL)
            pNode.getSprite().setFlipY(true);
        pNode.setType(cc.PROGRESS_TIMER_TYPE_BAR);

        pNode.setMidpoint(cc.p(0.5, 0.5));
        pNode.setBarChangeRate(cc.p(1, 1));

        pNode.setPercentage(0);
        pNode.setPosition(cc.p(size.width / 2, size.height / 2));
        pNode.setAnchorPoint(cc.p(0.5, 0.5));

        return pNode;
    },
    _sceneOrder:function () {
        this._isInSceneOnTop = false;
    },
    _setupTransition:function () {
        this._sceneToBeModified = this._inScene;
        this._from = 0;
        this._to = 100;
    }
});

/**
 * create a cc.TransitionProgressInOut object
 * @function
 * @param {Number} t time
 * @param {cc.Scene} scene
 * @return {cc.TransitionProgressInOut}
 */
cc.TransitionProgressInOut.create = function (t, scene) {
    var tempScene = new cc.TransitionProgressInOut();
    if ((tempScene != null) && (tempScene.initWithDuration(t, scene))) {
        return tempScene;
    }
    return null;
};

/**
 * cc.TransitionProgressOutIn transition.
 * @class
 * @extends cc.TransitionProgress
 */
cc.TransitionProgressOutIn = cc.TransitionProgress.extend(/** @lends cc.TransitionProgressOutIn# */{
    _progressTimerNodeWithRenderTexture:function (texture) {
        var size = cc.Director.getInstance().getWinSize();
        var pNode = cc.ProgressTimer.create(texture.getSprite());

        // but it is flipped upside down so we flip the sprite
        if (cc.renderContextType == cc.WEBGL)
            pNode.getSprite().setFlipY(true);
        pNode.setType(cc.PROGRESS_TIMER_TYPE_BAR);

        pNode.setMidpoint(cc.p(0.5, 0.5));
        pNode.setBarChangeRate(cc.p(1, 1));

        pNode.setPercentage(100);
        pNode.setPosition(cc.p(size.width / 2, size.height / 2));
        pNode.setAnchorPoint(cc.p(0.5, 0.5));

        return pNode;
    }
});

/**
 * create a cc.TransitionProgressOutIn object
 * @function
 * @param {Number} t time
 * @param {cc.Scene} scene
 * @return {cc.TransitionProgressOutIn}
 */
cc.TransitionProgressOutIn.create = function (t, scene) {
    var tempScene = new cc.TransitionProgressOutIn();
    if ((tempScene != null) && (tempScene.initWithDuration(t, scene))) {
        return tempScene;
    }
    return null;
};
