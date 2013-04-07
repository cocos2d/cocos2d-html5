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
 * cc.AnimationCache.getInstance().addAnimation(animation,"animation1");
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
    removeAnimation:function (name) {
        if (!name) {
            return;
        }
        if (this._animations.hasOwnProperty(name)) {
            delete this._animations[name];
        }
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
    getAnimation:function (name) {
        if (this._animations.hasOwnProperty(name))
            return this._animations[name];
        return null;
    },

    /**
     * <p>
     *     Adds an animation from an NSDictionary<br/>
     *     Make sure that the frames were previously loaded in the cc.SpriteFrameCache.
     * </p>
     * @param {object} dictionary
     */
    addAnimationsWithDictionary:function (dictionary) {
        var animations = dictionary["animations"];
        if (!animations) {
            cc.log("cocos2d: cc.AnimationCache: No animations were found in provided dictionary.");
            return;
        }

        var version = 1;
        var properties = dictionary["properties"];
        if (properties) {
            version = (properties["format"] != null) ? parseInt(properties["format"]) : version;
            var spritesheets = properties["spritesheets"];
            for (var i = 0; i < spritesheets.length; i++) {
                cc.SpriteFrameCache.getInstance().addSpriteFrames(spritesheets[i]);
            }
        }

        switch (version) {
            case 1:
                this._parseVersion1(animations);
                break;
            case 2:
                this._parseVersion2(animations);
                break;
            default :
                cc.Assert(false, "Invalid animation format");
                break;
        }
    },

    /**
     * <p>
     *    Adds an animation from a plist file.<br/>
     *    Make sure that the frames were previously loaded in the cc.SpriteFrameCache.
     * </p>
     * @param {String} plist
     */
    addAnimations:function (plist) {
        cc.Assert(plist, "Invalid texture file name");

        var path = cc.FileUtils.getInstance().fullPathFromRelativePath(plist);
        var dict = cc.FileUtils.getInstance().dictionaryWithContentsOfFileThreadSafe(path);

        cc.Assert(dict, "cc.AnimationCache: File could not be found");

        this.addAnimationsWithDictionary(dict);
    },

    _parseVersion1:function (animations) {
        var frameCache = cc.SpriteFrameCache.getInstance();

        for (var key in animations) {
            var animationDict = animations[key];
            var frameNames = animationDict["frames"];
            var delay = parseFloat(animationDict["delay"]) || 0;
            var animation = null;
            if (!frameNames) {
                cc.log("cocos2d: cc.AnimationCache: Animation '" + key + "' found in dictionary without any frames - cannot add to animation cache.");
                continue;
            }

            var frames = [];
            for (var i = 0; i < frameNames.length; i++) {
                var spriteFrame = frameCache.getSpriteFrame(frameNames[i]);
                if (!spriteFrame) {
                    cc.log("cocos2d: cc.AnimationCache: Animation '" + key + "' refers to frame '" + frameNames[i]
                        + "' which is not currently in the cc.SpriteFrameCache. This frame will not be added to the animation.");
                    continue;
                }
                var animFrame = new cc.AnimationFrame();
                animFrame.initWithSpriteFrame(spriteFrame, 1, null);
                frames.push(animFrame);
            }

            if (frames.length === 0) {
                cc.log("cocos2d: cc.AnimationCache: None of the frames for animation '" + key
                    + "' were found in the cc.SpriteFrameCache. Animation is not being added to the Animation Cache.");
                continue;
            } else if (frames.length != frameNames.length) {
                cc.log("cocos2d: cc.AnimationCache: An animation in your dictionary refers to a frame which is not in the cc.SpriteFrameCache." +
                    " Some or all of the frames for the animation '" + key + "' may be missing.");
            }
            animation = cc.Animation.createWithAnimationFrames(frames, delay, 1);
            cc.AnimationCache.getInstance().addAnimation(animation, key);
        }
    },

    _parseVersion2:function (animations) {
        var frameCache = cc.SpriteFrameCache.getInstance();

        for (var key in animations) {
            var animationDict = animations[key];

            var loopsTemp = parseInt(animationDict["loops"]);
            var loops = (isNaN(loopsTemp)) ? 1 : loopsTemp;
            var restoreOriginalFrame = (animationDict["restoreOriginalFrame"] && animationDict["restoreOriginalFrame"] == true) ? true : false;
            var frameArray = animationDict["frames"];

            if (!frameArray) {
                cc.log("cocos2d: CCAnimationCache: Animation '" + key + "' found in dictionary without any frames - cannot add to animation cache.");
                continue;
            }

            //Array of AnimationFrames
            var arr = [];
            for (var i = 0; i < frameArray.length; i++) {
                var entry = frameArray[i];
                var spriteFrameName = entry["spriteframe"];
                var spriteFrame = frameCache.getSpriteFrame(spriteFrameName);
                if (!spriteFrame) {
                    cc.log("cocos2d: cc.AnimationCache: Animation '" + key + "' refers to frame '" + spriteFrameName
                        + "' which is not currently in the cc.SpriteFrameCache. This frame will not be added to the animation.");
                    continue;
                }

                var delayUnits = parseFloat(entry["delayUnits"]) || 0;
                var userInfo = entry["notification"];
                var animFrame = new cc.AnimationFrame();
                animFrame.initWithSpriteFrame(spriteFrame, delayUnits, userInfo);
                arr.push(animFrame);
            }

            var delayPerUnit = parseFloat(animationDict["delayPerUnit"]) || 0;
            var animation = new cc.Animation();
            animation.initWithAnimationFrames(arr, delayPerUnit, loops);
            animation.setRestoreOriginalFrame(restoreOriginalFrame);
            cc.AnimationCache.getInstance().addAnimation(animation, key);
        }
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
    if (cc.s_sharedAnimationCache) {
        cc.s_sharedAnimationCache._animations = null;
        cc.s_sharedAnimationCache = null;
    }
};

/**
 * Retruns ths shared instance of the Animation cache
 * @return {cc.AnimationCache}
 */
cc.AnimationCache.getInstance = function () {
    if (cc.s_sharedAnimationCache === null) {
        cc.s_sharedAnimationCache = new cc.AnimationCache();
        cc.s_sharedAnimationCache.init();
    }
    return cc.s_sharedAnimationCache;
};

cc.s_sharedAnimationCache = null;
