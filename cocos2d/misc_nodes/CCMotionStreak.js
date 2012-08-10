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

/**
 * cc.MotionStreak manages a Ribbon based on it's motion in absolute space.<br/>
 * You construct it with a fadeTime, minimum segment size, texture path, texture<br/>
 * length and color. The fadeTime controls how long it takes each vertex in<br/>
 * the streak to fade out, the minimum segment size it how many pixels the<br/>
 * streak will move before adding a new ribbon segment, and the texture<br/>
 * length is the how many pixels the texture is stretched across. The texture<br/>
 * is vertically aligned along the streak segment.
 * @class
 * @extends cc.Node
 */
cc.MotionStreak = cc.Node.extend(/** @lends cc.MotionStreak# */{
    _segThreshold:0,
    _width:0,
    _lastLocation:cc.PointZero(),

    /**
     * @type cc.Ribbon
     */
    _ribbon:null,

    /**
     * Ribbon used by MotionStreak (weak reference)
     * @return {cc.Ribbon}
     */
    getRibbon:function () {
        return this._ribbon;
    },

    /**
     * @return {cc.Texture2D}
     */
    getTexture:function () {
        return this._ribbon.getTexture();
    },

    /**
     * @param {cc.Texture2D} texture
     */
    setTexture:function (texture) {
        this._ribbon.setTexture(texture);
    },

    /**
     * @return {cc.BlendFunc}
     */
    getBlendFunc:function () {
        return this._ribbon.getBlendFunc();
    },

    /**
     * @param {Number} src
     * @param {Number} dst
     */
    setBlendFunc:function (src, dst) {
        this._ribbon.setBlendFunc(src, dst);
    },

    /**
     * Constructor
     */
    ctor:function () {
        this._super();
    },

    /**
     * initializes a MotionStreak. The file will be loaded using the TextureMgr.
     * @param {Number} fade
     * @param {Number} seg
     * @param {String} imagePath
     * @param {Number} width
     * @param {Number} length
     * @param {cc.Color4B} color
     * @return {Boolean}
     */
    initWithFade:function (fade, seg, imagePath, width, length, color) {
        this._segThreshold = seg;
        this._width = width;
        this._lastLocation = cc.PointZero();
        this._ribbon = cc.Ribbon.create(this._width, imagePath, length, color, fade);
        this.addChild(this._ribbon);

        // update ribbon position. Use schedule:interval and not scheduleUpdated. (cocos2d-iphone)issue #1075
        this.schedule(this.update, 0);
        return true;
    },

    /**
     * polling function
     */
    update:function (delta) {
        var location = this.convertToWorldSpace(cc.PointZero());
        this._ribbon.setPosition(cc.p(-1 * location.x, -1 * location.y));
        var len = cc.pLength(cc.pSub(this._lastLocation, location));
        if (len > this._segThreshold) {
            this._ribbon.addPointAt(location, this._width);
            this._lastLocation = location;
        }
        this._ribbon.update(delta);
    }
});

/**
 * creates the a MotionStreak. The image will be loaded using the TextureMgr.
 * @param {Number} fade time to fade
 * @param {Number} seg minimum segment size
 * @param {String} imagePath texture path
 * @param {Number} width texture width
 * @param {Number} length texture length
 * @param {cc.Color4B} color color
 * @return {cc.MotionStreak}
 */
cc.MotionStreak.create = function (fade, seg, imagePath, width, length, color) {
    var ret = new cc.MotionStreak();
    if (ret && ret.initWithFade(fade, seg, imagePath, width, length, color)) {
        return ret;
    }
    return null;
};
