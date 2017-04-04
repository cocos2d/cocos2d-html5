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

/**
 @brief A transition which peels back the bottom right hand corner of a scene
 to transition to the scene beneath it simulating a page turn.

 This uses a 3DAction so it's strongly recommended that depth buffering
 is turned on in cc.Director using:

 cc.Director.sharedDirector().setDepthBufferFormat(kDepthBuffer16);

 @since v0.8.2
 */
cc.TransitionPageTurn = cc.TransitionScene.extend({
    _m_bBack:null,
    /**
     * Creates a base transition with duration and incoming scene.
     * If back is true then the effect is reversed to appear as if the incoming
     * scene is being turned from left over the outgoing scene.
     */
    initWithDuration:function (t, scene, backwards) {
        // XXX: needed before [super init]
        this._m_bBack = backwards;

        if (cc.TransitionScene.initWithDuration(t, scene)) {
            // do something
        }
        return true;
    },

    actionWithSize:function (vector) {
        if (this._m_bBack) {
            // Get hold of the PageTurn3DAction
            return cc.ReverseTime.actionWithAction
                (
                    cc.PageTurn3D.actionWithSize(vector, this._m_fDuration)
                );
        } else {
            // Get hold of the PageTurn3DAction
            return cc.PageTurn3D.actionWithSize(vector, this._m_fDuration);
        }
    },
    onEnter:function () {
        cc.TransitionScene.onEnter();
        var s = cc.Director.sharedDirector().getWinSize();
        var x, y;
        if (s.width > s.height) {
            x = 16;
            y = 12;
        } else {
            x = 12;
            y = 16;
        }

        var action = this.actionWithSize(cc.ccg(x, y));

        if (!this._m_bBack) {
            this._m_pOutScene.runAction
                (
                    cc.Sequence.actions
                        (
                            action,
                            cc.CallFunc.actionWithTarget(this, cc.TransitionScene.finish),
                            cc.StopGrid.action(),
                            null
                        )
                );
        } else {
            // to prevent initial flicker
            this._m_pInScene.setIsVisible(false);
            this._m_pInScene.runAction
                (
                    cc.Sequence.actions(
                        cc.Show.action(),
                        action,
                        cc.CallFunc.actionWithTarget(this, cc.TransitionScene.finish),
                        cc.StopGrid.action(),
                        null)
                );
        }
    },
    _sceneOrder:function () {
        this.m_bIsInSceneOnTop = this._m_bBack;
    }
});

/**
 * Creates a base transition with duration and incoming scene.
 * If back is true then the effect is reversed to appear as if the incoming
 * scene is being turned from left over the outgoing scene.
 */
cc.TransitionPageTurn.transitionWithDuration = function (t, scene, backwards) {
    var pTransition = new cc.TransitionPageTurn();
    pTransition.initWithDuration(t, scene, backwards);
    return pTransition;
};