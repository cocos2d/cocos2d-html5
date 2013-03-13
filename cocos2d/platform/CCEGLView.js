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

cc.EGLView = cc.EGLViewProtocol.extend({
    _captured:false,
    _wnd:null,
    _hDC:null,
    _hRC:null,
    _accelerometerKeyHook:null,
    _supportTouch:false,

    _menu:null,
    _wndProc:null,

    _frameZoomFactor:1.0,

    ctor:function(){
        this._super();
        this._viewName = "Cocos2dHTML5";
        this._initGL();
    },

    isOpenGLReady:function(){
        return (this._hDC != null && this._hRC != null);
    },

    end:function(){
        // do nothing
    },

    swapBuffers:function(){
        // do nothing
    },

    setFrameSize:function(width, height){
        this._super(width,height);

        this.centerWindow();
    },

    setIMEKeyboardState:function(open){
        // do nothing
    },

    setMenuResource:function(menu){
        // do nothing
    },

    setWndProc:function(proc){
        this._wndProc = proc;
    },

    _initGL:function(){
        this._hDC = cc.canvas;
        this._hRC = cc.renderContext;

        var glVersion = this._hRC.getParameter(this._hRC.VERSION);
        cc.log("WebGL version = " + glVersion );
    },

    _destroyGL:function(){
        if(this._hDC)
            this._hDC = null;

        if(this._hRC)
            this._hRC = null;
    },

    /*
     * Set zoom factor for frame. This method is for debugging big resolution (e.g.new ipad) app on desktop.
     */
    setFrameZoomFactor:function(zoomFactor){
        this._frameZoomFactor = zoomFactor;
        this.centerWindow();
        cc.Director.getInstance().setProjection(cc.Director.getInstance().getProjection());
    },

    getFrameZoomFactor:function(){
        return this._frameZoomFactor;
    },

    centerWindow:function(){
        //do nothing
    },

    setAccelerometerKeyHook:function(accelerometerKeyHook){
        this._accelerometerKeyHook = accelerometerKeyHook;
    },

    setViewPortInPoints:function(x, y, w, h){
        this._gl.viewport((x * this._scaleX * this._frameZoomFactor + this._viewPortRect.origin.x * this._frameZoomFactor),
            (y * this._scaleY  * this._frameZoomFactor + this._viewPortRect.origin.y * this._frameZoomFactor),
            (w * this._scaleX * this._frameZoomFactor),
            (h * this._scaleY * this._frameZoomFactor));
    },

    setScissorInPoints:function(x, y, w, h){
        this._gl.scissor((x * this._scaleX * this._frameZoomFactor + this._viewPortRect.origin.x * this._frameZoomFactor),
            (y * this._scaleY * this._frameZoomFactor + this._viewPortRect.origin.y * this._frameZoomFactor),
            (w * this._scaleX * this._frameZoomFactor),
            (h * this._scaleY * this._frameZoomFactor));
    }
});

cc.EGLView._eglViewObject = null;
/**
 * get the shared main open gl window
 */
cc.EGLView.getInstance = function(){
     if(cc.EGLView._eglViewObject == null)
         cc.EGLView._eglViewObject = new cc.EGLView();

    return cc.EGLView._eglViewObject;
};