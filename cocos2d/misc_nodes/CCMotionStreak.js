/****************************************************************************
 Copyright (c) 2010-2012 cocos2d-x.org
 Copyright (c) 2008-2010 Ricardo Quesada
 Copyright (c) 2011      Zynga Inc.
 Copyright (c) 2008-2009 Jason Booth

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

/*
 * Motion Streak manages a Ribbon based on it's motion in absolute space.
 * You construct it with a fadeTime, minimum segment size, texture path, texture
 * length and color. The fadeTime controls how long it takes each vertex in
 * the streak to fade out, the minimum segment size it how many pixels the
 * streak will move before adding a new ribbon segement, and the texture
 * length is the how many pixels the texture is stretched across. The texture
 * is vertically aligned along the streak segemnts.
 */

/**
 * @brief CCMotionStreak manages a Ribbon based on it's motion in absolute space.
 * You construct it with a fadeTime, minimum segment size, texture path, texture
 * length and color. The fadeTime controls how long it takes each vertex in
 * the streak to fade out, the minimum segment size it how many pixels the
 * streak will move before adding a new ribbon segement, and the texture
 * length is the how many pixels the texture is stretched across. The texture
 * is vertically aligned along the streak segemnts.
 *
 * Limitations:
 *   CCMotionStreak, by default, will use the GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA blending function.
 *   This blending function might not be the correct one for certain textures.
 *   But you can change it by using:
 *     [obj setBlendFunc: (ccBlendfunc) {new_src_blend_func, new_dst_blend_func}];
 *
 * @since v0.8.1
 */
cc.MotionStreak = cc.Node.extend({
    _segThreshold:0,
    _width:0,
    _lastLocation:cc.PointZero(),

    _ribbon:null,
    /** Ribbon used by MotionStreak (weak reference) */
    getRibbon:function(){return this._ribbon;},

    //CCTextureProtocol methods
    getTexture:function(){return this._ribbon.getTexture();},
    getTexture:function(texture){this._ribbon.setTexture(texture);},

    getBlendFunc:function(){ return this._ribbon.getBlendFunc();},
    setBlendFunc:function(blendFunc){this._ribbon.setBlendFunc(blendFunc);},

    ctor:function(){
        this._super();
    },

    /** initializes a MotionStreak. The file will be loaded using the TextureMgr. */
    initWithFade:function(fade,seg,imagePath,width,length,color){
        this._segThreshold = seg;
        this._width = width;
        this._lastLocation = cc.PointZero();
        this._ribbon = cc.Ribbon.ribbonWithWidth(this._width, imagePath, length, color, fade);
        this.addChild(this._ribbon);

        // update ribbon position. Use schedule:interval and not scheduleUpdated. (cocos2d-iphone)issue #1075
        this.schedule(this.update, 0);
        return true;
    },

    /** polling function */
    update:function(delta){
        var location = this.convertToWorldSpace(cc.PointZero());
        this._ribbon.setPosition(cc.ccp(-1*location.x, -1*location.y));
        var len = cc.ccpLength(cc.ccpSub(this._lastLocation, location));
        if (len > this._segThreshold) {
            this._ribbon.addPointAt(location, this._width);
            this._lastLocation = location;
        }
        this._ribbon.update(delta);
    }
});

/** creates the a MotionStreak. The image will be loaded using the TextureMgr. */
cc.MotionStreak.streakWithFade = function(fade,seg,imagePath,width,length,color){
    var ret = new cc.MotionStreak();
    if(ret && ret.initWithFade(fade, seg, imagePath, width, length, color)){
        return ret;
    }
    return null;
};