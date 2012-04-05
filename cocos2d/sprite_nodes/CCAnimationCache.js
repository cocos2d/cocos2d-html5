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


/** Singleton that manages the Animations.
 It saves in a cache the animations. You should use this class if you want to save your animations in a cache.

 Before v0.99.5, the recommend way was to save them on the CCSprite. Since v0.99.5, you should use this class instead.

 @since v0.99.5
 */
cc.AnimationCache = cc.Class.extend(
    {

        /** Adds a CCAnimation with a name.
         */
        addAnimation:function(animation, name){
            this._m_pAnimations[name] = animation;
        },

        /** Deletes a CCAnimation from the cache.
         */
        removeAnimationByName:function(name){
            if(!name){
                return;
            }
            delete this._m_pAnimations[name];
        },

        /** Returns a CCAnimation that was previously added.
         If the name is not found it will return nil.
         You should retain the returned copy if you are going to use it.
         */
        animationByName:function(name){
            return this._m_pAnimations[name];
        },

        init:function(){
            this._m_pAnimations = new Object();
            return true;
        },

        _m_pAnimations:null

    });

/** Purges the cache. It releases all the CCAnimation objects and the shared instance.
 */
cc.AnimationCache.purgeSharedAnimationCache = function(){
    cc.s_pSharedAnimationCache = null;
};

/** Retruns ths shared instance of the Animation cache */
cc.AnimationCache.shareAnimationCache = function(){
    if(cc.s_pSharedAnimationCache == null){
        cc.s_pSharedAnimationCache =  new cc.AnimationCache();
        cc.s_pSharedAnimationCache.init();
    }
    return cc.s_pSharedAnimationCache;
};

cc.s_pSharedAnimationCache = null;
