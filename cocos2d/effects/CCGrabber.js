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

/** FBO class that grabs the the contents of the screen */
cc.Grabber = cc.Class.extend({
    _fbo:0,
    _oldFBO:0,
    _glesVersion:null,
    ctor:function () {
        // generate FBO
        //todo gl
        //ccglGenFramebuffers(1, this._fbo);
    },
    grab:function (texture) {
        //todo gl
        /*glGetIntegerv(CC_GL_FRAMEBUFFER_BINDING, this._oldFBO);

         // bind
         ccglBindFramebuffer(CC_GL_FRAMEBUFFER, this._fbo);

         // associate texture with FBO
         ccglFramebufferTexture2D(CC_GL_FRAMEBUFFER, CC_GL_COLOR_ATTACHMENT0, GL_TEXTURE_2D,
         texture.getName(), 0);

         // check if it worked (probably worth doing :) )
         var status = ccglCheckFramebufferStatus(CC_GL_FRAMEBUFFER);
         if (status != CC_GL_FRAMEBUFFER_COMPLETE) {
         cc.log("Frame Grabber: could not attach texture to frmaebuffer");
         }

         ccglBindFramebuffer(CC_GL_FRAMEBUFFER, this._oldFBO);*/
    },
    beforeRender:function (texture) {
        //todo gl
        /*glGetIntegerv(CC_GL_FRAMEBUFFER_BINDING, this._oldFBO);
         ccglBindFramebuffer(CC_GL_FRAMEBUFFER, this._fbo);

         // BUG XXX: doesn't work with RGB565.

         */
        /*glClearColor(0, 0, 0, 0);*/
        /*

         // BUG #631: To fix #631, uncomment the lines with #631
         // Warning: But it CCGrabber won't work with 2 effects at the same time
         glClearColor(0.0, 0.0, 0.0, 1.0);	// #631

         glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

         glColorMask(true, true, true, false);	// #631*/
    },
    afterRender:function (texture) {
        //todo gl
        /* ccglBindFramebuffer(CC_GL_FRAMEBUFFER, this._oldFBO);
         glColorMask(true, true, true, true);	// #631*/
    }
});
