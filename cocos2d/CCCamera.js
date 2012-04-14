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
     _m_fEyeX:null,
    _m_fEyeY:null,
    _m_fEyeZ:null,
    _m_fCenterX:null,
     _m_fCenterY:null,
    _m_fCenterZ:null,
     _m_fUpX:null,
    _m_fUpY:null,
    _m_fUpZ:null,
     _m_bDirty:null,

    /*public:*/
    ctor:function(){
        this.restore();
    },
    description:function(){
        return "<CCCamera | center =("+this._m_fCenterX+","+this._m_fCenterY + "," +this._m_fCenterZ +")>";
    },
    /** sets the dirty value */
    setDirty:function(bValue) { this._m_bDirty = bValue; },
    /** get the dirty value */
    getDirty:function() { return this._m_bDirty; },

    /** sets the camera in the default position */
    restore:function(){
        this._m_fEyeX = this._m_fEyeY = 0.0;
        this._m_fEyeZ = cc.Camera.getZEye();

        this._m_fCenterX = this._m_fCenterY = this._m_fCenterZ = 0.0;

        this._m_fUpX = 0.0;
        this._m_fUpY = 1.0;
        this._m_fUpZ = 0.0;

        this._m_bDirty = false;
    },
    /** Sets the camera using gluLookAt using its eye, center and up_vector */
    locate:function(){
        if (this._m_bDirty){
            //TODO gl
            //gluLookAt(this._m_fEyeX, this._m_fEyeY, this._m_fEyeZ,this._m_fCenterX, this._m_fCenterY, this._m_fCenterZ,this._m_fUpX, this._m_fUpY, this._m_fUpZ);
        }

    },
    /** sets the eye values in points */
    setEyeXYZ:function( fEyeX,  fEyeY,  fEyeZ){
        this._m_fEyeX = fEyeX * cc.CONTENT_SCALE_FACTOR;
        this._m_fEyeY = fEyeY * cc.CONTENT_SCALE_FACTOR;
        this._m_fEyeZ = fEyeZ * cc.CONTENT_SCALE_FACTOR;

        this._m_bDirty = true;
    },
    /** sets the center values in points */
    setCenterXYZ:function( fCenterX,  fCenterY,  fCenterZ){
        this._m_fCenterX = fCenterX * cc.CONTENT_SCALE_FACTOR;
        this._m_fCenterY = fCenterY * cc.CONTENT_SCALE_FACTOR;
        this._m_fCenterZ = fCenterZ * cc.CONTENT_SCALE_FACTOR;

        this._m_bDirty = true;
    },
    /** sets the up values */
    setUpXYZ:function( fUpX,  fUpY,  fUpZ){
        this._m_fUpX = fUpX;
        this._m_fUpY = fUpY;
        this._m_fUpZ = fUpZ;

        this._m_bDirty = true;
    },

    /** get the eye vector values in points */
    getEyeXYZ:function( pEyeX,  pEyeY,  pEyeZ){
        pEyeX = this._m_fEyeX / cc.CONTENT_SCALE_FACTOR;
        pEyeY = this._m_fEyeY / cc.CONTENT_SCALE_FACTOR;
        pEyeZ = this._m_fEyeZ / cc.CONTENT_SCALE_FACTOR;
    },
    /** get the center vector values int points */
    getCenterXYZ:function(pCenterX, pCenterY, pCenterZ){
        pCenterX = this._m_fCenterX / cc.CONTENT_SCALE_FACTOR;
        pCenterY = this._m_fCenterY / cc.CONTENT_SCALE_FACTOR;
        pCenterZ = this._m_fCenterZ / cc.CONTENT_SCALE_FACTOR;
    },
    /** get the up vector values */
    getUpXYZ:function(pUpX, pUpY, pUpZ){
        pUpX = this._m_fUpX;
        pUpY = this._m_fUpY;
        pUpZ = this._m_fUpZ;
    },

    /*private:*/
     _DISALLOW_COPY_AND_ASSIGN:function(CCCamera){

     }
});
/** returns the Z eye */
cc.Camera.getZEye = function(){
    return cc.FLT_EPSILON;
};

cc.FLT_EPSILON = 1.192092896;