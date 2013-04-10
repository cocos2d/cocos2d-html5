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

/** FBO class that grabs the the contents of the screen */
cc.Grabber = cc.Class.extend({
    _fbo:null,
    _oldFBO:null,
    _oldClearColor:null,

    _gl:null,

    ctor:function () {
        this._gl = cc.renderContext;
        this._oldClearColor = [0, 0, 0, 0];
        // generate FBO
        this._fbo = this._gl.createFramebuffer();
    },

    grab:function (texture) {
        this._oldFBO = this._gl.getParameter(this._gl.FRAMEBUFFER_BINDING);
        // bind
        this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, this._fbo);
        // associate texture with FBO
        this._gl.framebufferTexture2D(this._gl.FRAMEBUFFER, this._gl.COLOR_ATTACHMENT0, this._gl.TEXTURE_2D, texture._webTextureObj, 0);

        // check if it worked (probably worth doing :) )
        var status = this._gl.checkFramebufferStatus(this._gl.FRAMEBUFFER);
        if (status != this._gl.FRAMEBUFFER_COMPLETE)
            cc.log("Frame Grabber: could not attach texture to frmaebuffer");
        this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, this._oldFBO);
    },

    beforeRender:function (texture) {
        this._oldFBO = this._gl.getParameter(this._gl.FRAMEBUFFER_BINDING);
        this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, this._fbo);

        // save clear color
        this._oldClearColor = this._gl.getParameter(this._gl.COLOR_CLEAR_VALUE);

        // BUG XXX: doesn't work with RGB565.
        this._gl.clearColor(0, 0, 0, 0);

        // BUG #631: To fix #631, uncomment the lines with #631
        // Warning: But it CCGrabber won't work with 2 effects at the same time
        //  glClearColor(0.0f,0.0f,0.0f,1.0f);    // #631

        this._gl.clear(this._gl.COLOR_BUFFER_BIT | this._gl.DEPTH_BUFFER_BIT);

        //  glColorMask(true, true, true, false);    // #631
    },

    afterRender:function (texture) {
        this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, this._oldFBO);
        this._gl.colorMask(true, true, true, true);      // #631
    },

    destroy:function(){
        this._gl.deleteFramebuffer(this._fbo);
    }
});
