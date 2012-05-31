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

/** A CCAnimation object is used to perform animations on the CCSprite objects.

 The CCAnimation object contains CCSpriteFrame objects, and a possible delay between the frames.
 You can animate a CCAnimation object by using the CCAnimate action. Example:

 [sprite runAction:[CCAnimate actionWithAnimation:animation]];

 */
cc.Animation = cc.Class.extend({
    _name:"",
    _delay:0,
    _frames:null,
    ctor:function () {
        this._frames = [];
    },
    // attributes
    /** get name of the animation */
    getName:function () {
        return this._name;
    },
    /** set name of the animation */
    setName:function (name) {
        this._name = name;
    },

    /** get delay between frames in seconds */
    getDelay:function () {
        return this._delay;
    },
    /** set delay between frames in seconds */
    setDelay:function (delay) {
        this._delay = delay;
    },

    /** get array of frames */
    getFrames:function () {
        return this._frames;
    },
    /** set array of frames, the Frames is retained */
    setFrames:function (frames) {
        this._frames = frames;
    },

    /** Initializes a CCAnimation with frames and a delay between frames
     @since v0.99.5
     */

    initWithFrames:function (frames, delay) {
        this._delay = delay;
        if (frames)
            this._frames = frames;
        else
            this._frames = [];

        return true;
    },

    /** adds a frame to a CCAnimation */
    addFrame:function (frame) {
        this._frames.push(frame);
    },

    /** Adds a frame with an image filename. Internally it will create a CCSpriteFrame and it will add it.
     Added to facilitate the migration from v0.8 to v0.9.
     */
    addFrameWithFileName:function (fileName) {
        var texture = cc.TextureCache.sharedTextureCache().addImage(fileName);
        var rect = cc.RectZero();
        if ((texture instanceof HTMLImageElement) || (texture instanceof HTMLCanvasElement)) {
            rect.size = cc.SizeMake(texture.width, texture.height);
        } else {
            rect.size = texture.getContentSize();
        }

        var frame = cc.SpriteFrame.frameWithTexture(texture, rect);

        this._frames.push(frame);
    },

    /** Adds a frame with a texture and a rect. Internally it will create a CCSpriteFrame and it will add it.
     Added to facilitate the migration from v0.8 to v0.9.
     */
    addFrameWithTexture:function (texture, rect) {
        var pFrame = cc.SpriteFrame.frameWithTexture(texture, rect);
        this._frames.push(pFrame);
    },

    init:function () {
        return this.initWithFrames(null, 0);
    }
});

/** Creates an animation
 @since v0.99.5
 */
cc.Animation.animation = function () {
    var animation = new cc.Animation();
    animation.init();

    return animation;
};

/* Creates an animation with frames and a delay between frames.
 @since v0.99.5
 */
cc.Animation.animationWithFrames = function (frames, delay) {
    if (!delay)
        delay = 0;

    var animation = new cc.Animation();
    animation.initWithFrames(frames, delay);

    return animation;
};
