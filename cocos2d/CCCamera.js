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
 A CCCamera is used in every CCNode.
 Useful to look at the object from different views.
 The OpenGL gluLookAt() function is used to locate the
 camera.

 If the object is transformed by any of the scale, rotation or
 position attributes, then they will override the camera.

 IMPORTANT: Either your use the camera or the rotation/scale/position properties. You can't use both.
 World coordinates won't work if you use the camera.

 Limitations:

 - Some nodes, like CCParallaxNode, CCParticle uses world node coordinates, and they won't work properly if you move them (or any of their ancestors)
 using the camera.

 - It doesn't work on batched nodes like CCSprite objects when they are parented to a CCSpriteBatchNode object.

 - It is recommended to use it ONLY if you are going to create 3D effects. For 2D effecs, use the action CCFollow or position/scale/rotate.

 */
cc.Camera = cc.Class.extend({
    /*protected:*/
    _eyeX:null,
    _eyeY:null,
    _eyeZ:null,
    _centerX:null,
    _centerY:null,
    _centerZ:null,
    _upX:null,
    _upY:null,
    _upZ:null,
    _dirty:null,

    /*public:*/
    ctor:function () {
        this.restore();
    },
    description:function () {
        return "<CCCamera | center =(" + this._centerX + "," + this._centerY + "," + this._centerZ + ")>";
    },
    /** sets the dirty value */
    setDirty:function (value) {
        this._dirty = value;
    },
    /** get the dirty value */
    getDirty:function () {
        return this._dirty;
    },

    /** sets the camera in the default position */
    restore:function () {
        this._eyeX = this._eyeY = 0.0;
        this._eyeZ = cc.Camera.getZEye();

        this._centerX = this._centerY = this._centerZ = 0.0;

        this._upX = 0.0;
        this._upY = 1.0;
        this._upZ = 0.0;

        this._dirty = false;
    },
    /** Sets the camera using gluLookAt using its eye, center and up_vector */
    locate:function () {
        if (this._dirty) {
            //TODO gl
            //gluLookAt(this._eyeX, this._eyeY, this._eyeZ,this._centerX, this._centerY, this._centerZ,this._upX, this._upY, this._upZ);
        }

    },
    /** sets the eye values in points */
    setEyeXYZ:function (eyeX, eyeY, eyeZ) {
        this._eyeX = eyeX * cc.CONTENT_SCALE_FACTOR;
        this._eyeY = eyeY * cc.CONTENT_SCALE_FACTOR;
        this._eyeZ = eyeZ * cc.CONTENT_SCALE_FACTOR;

        this._dirty = true;
    },
    /** sets the center values in points */
    setCenterXYZ:function (centerX, centerY, fenterZ) {
        this._centerX = centerX * cc.CONTENT_SCALE_FACTOR;
        this._centerY = centerY * cc.CONTENT_SCALE_FACTOR;
        this._centerZ = fenterZ * cc.CONTENT_SCALE_FACTOR;

        this._dirty = true;
    },
    /** sets the up values */
    setUpXYZ:function (upX, upY, upZ) {
        this._upX = upX;
        this._upY = upY;
        this._upZ = upZ;

        this._dirty = true;
    },

    /** get the eye vector values in points */
    getEyeXYZ:function (eyeX, eyeY, eyeZ) {
        eyeX = this._eyeX / cc.CONTENT_SCALE_FACTOR;
        eyeY = this._eyeY / cc.CONTENT_SCALE_FACTOR;
        eyeZ = this._eyeZ / cc.CONTENT_SCALE_FACTOR;
    },
    /** get the center vector values int points */
    getCenterXYZ:function (centerX, centerY, centerZ) {
        centerX = this._centerX / cc.CONTENT_SCALE_FACTOR;
        centerY = this._centerY / cc.CONTENT_SCALE_FACTOR;
        centerZ = this._centerZ / cc.CONTENT_SCALE_FACTOR;
    },
    /** get the up vector values */
    getUpXYZ:function (upX, upY, upZ) {
        upX = this._upX;
        upY = this._upY;
        upZ = this._upZ;
    },

    /*private:*/
    _DISALLOW_COPY_AND_ASSIGN:function (CCCamera) {

    }
});
/** returns the Z eye */
cc.Camera.getZEye = function () {
    return cc.FLT_EPSILON;
};

//cc.CONTENT_SCALE_FACTOR = cc.Director.getInstance().getContentScaleFactor();
