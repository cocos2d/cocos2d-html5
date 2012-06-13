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
 * <p>
 *     Singleton that manages the Animations.<br/>
 *     It saves in a cache the animations. You should use this class if you want to save your animations in a cache.<br/>
 * </p>
 * @class
 * @extends cc.Class
 *
 * @example
 * cc.AnimationCache.sharedAnimationCache().addAnimation(animation,"animation1");
 */
cc.AnimationCache = cc.Class.extend(/** @lends cc.AnimationCache# */{

    /**
     * Adds a cc.Animation with a name.
     * @param {cc.Animation} animation
     * @param {String} name
     */
    addAnimation:function (animation, name) {
        this._animations[name] = animation;
    },

    /**
     *  Deletes a cc.Animation from the cache.
      * @param  {String} name
     */
    removeAnimationByName:function (name) {
        if (!name) {
            return;
        }
        delete this._animations[name];
    },

    /**
     * <p>
     *     Returns a cc.Animation that was previously added.<br/>
     *      If the name is not found it will return nil.<br/>
     *      You should retain the returned copy if you are going to use it.</br>
     * </p>
     * @param {String} name
     * @return {cc.Animation}
     */
    animationByName:function (name) {
        return this._animations[name];
    },

    /**
     * initialize cc.AnimationCache
     * @return {Boolean}
     */
    init:function () {
        this._animations = {};
        return true;
    },

    _animations:null
});

/**
 * Purges the cache. It releases all the cc.Animation objects and the shared instance.
 */
cc.AnimationCache.purgeSharedAnimationCache = function () {
    cc.sharedAnimationCache = null;
};

/**
 * Retruns ths shared instance of the Animation cache
 * @return {cc.AnimationCache}
 */
cc.AnimationCache.sharedAnimationCache = function () {
    if (cc.sharedAnimationCache == null) {
        cc.sharedAnimationCache = new cc.AnimationCache();
        cc.sharedAnimationCache.init();
    }
    return cc.sharedAnimationCache;
};

cc.sharedAnimationCache = null;
