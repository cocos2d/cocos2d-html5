/****************************************************************************
 Copyright (c) 2013-2014 Chukong Technologies Inc.

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

(function(){

    cc.RenderTexture.CanvasRenderCmd = function(renderableObject){
        cc.Node.CanvasRenderCmd.call(this, renderableObject);
        this._needDraw = true;

        this._clearColor = cc.color(255, 255, 255, 255);
        this._clearColorStr = "rgba(255,255,255,1)";

        //
        // the off-screen canvas for rendering and storing the texture
        // @type HTMLCanvasElement
        //
        this._cacheCanvas = cc.newElement('canvas');
        /**
         * stores a reference to the canvas context object
         * @type CanvasRenderingContext2D
         */
        this._cacheContext = this._cacheCanvas.getContext('2d');
    };

    var proto = cc.RenderTexture.CanvasRenderCmd.prototype = Object.create(cc.Node.CanvasRenderCmd.prototype);
    proto.constructor = cc.RenderTexture.CanvasRenderCmd;

    proto.cleanup = function(){
        var node = this._node;
        this._cacheContext = null;
        this._cacheCanvas = null;
    };

    proto.initWithWidthAndHeight = function(width, height, format, depthStencilFormat){
        var node = this._node;
        var locCacheCanvas = this._cacheCanvas, locScaleFactor = cc.contentScaleFactor();
        locCacheCanvas.width = 0 | (width * locScaleFactor);
        locCacheCanvas.height = 0 | (height * locScaleFactor);
        this._cacheContext.translate(0, locCacheCanvas.height);
        var texture = new cc.Texture2D();
        texture.initWithElement(locCacheCanvas);
        texture.handleLoadedTexture();
        var locSprite = node.sprite = new cc.Sprite(texture);
        locSprite.setBlendFunc(cc.ONE, cc.ONE_MINUS_SRC_ALPHA);
        // Disabled by default.
        node.autoDraw = false;
        // add sprite for backward compatibility
        node.addChild(locSprite);
        return true;
    };

    proto.begin = function(){};

    proto._beginWithClear = function(r, g, b, a, depthValue, stencilValue, flags){
        var node = this._node;
        node.begin();

        r = r || 0;
        g = g || 0;
        b = b || 0;
        a = isNaN(a) ? 1 : a;

        //var context = cc._renderContext;
        var context = this._cacheContext;
        var locCanvas = this._cacheCanvas;
        context.save();
        context.fillStyle = "rgba(" + (0 | r) + "," + (0 | g) + "," + (0 | b) + "," + a / 255 + ")";
        context.clearRect(0, 0, locCanvas.width, -locCanvas.height);
        context.fillRect(0, 0, locCanvas.width, -locCanvas.height);
        context.restore();
    };

    proto.end = function(){

        var node = this._node;

        //old code
        //cc._renderContext = cc._mainRenderContextBackup;
        //cc.view._resetScale();

        var scale = cc.contentScaleFactor();
        cc.renderer._renderingToCacheCanvas(this._cacheContext, node.__instanceId, scale, scale);

        //TODO
        /*//restore viewport
         director.setViewport();
         cc.kmGLMatrixMode(cc.KM_GL_PROJECTION);
         cc.kmGLPopMatrix();
         cc.kmGLMatrixMode(cc.KM_GL_MODELVIEW);
         cc.kmGLPopMatrix();*/
    };

    proto.clearRect = function(x, y, width, height){
        this._cacheContext.clearRect(x, y, width, -height);
    };

    proto.clearDepth = function(depthValue){
        cc.log("clearDepth isn't supported on Cocos2d-Html5");
    };

    proto.visit = function(ctx){
        var node = this._node;
        ctx = ctx || cc._renderContext;
        node.transform(ctx);
        node.sprite.visit(ctx);
    };

    proto.draw = function(){
        var node = this._node;
        if (node.clearFlags) {
            var locCanvas = this._cacheCanvas;
            ctx.save();
            ctx.fillStyle = this._clearColorStr;
            ctx.clearRect(0, 0, locCanvas.width, -locCanvas.height);
            ctx.fillRect(0, 0, locCanvas.width, -locCanvas.height);
            ctx.restore();
        }

        //! make sure all children are drawn
        node.sortAllChildren();
        var locChildren = node._children;
        var childrenLen = locChildren.length;
        var selfSprite = node.sprite;
        for (var i = 0; i < childrenLen; i++) {
            var getChild = locChildren[i];
            if (getChild != selfSprite)
                getChild.visit();
        }
        node.end();
    };

})();


(function(){

    cc.RenderTexture.WebGLRenderCmd = function(renderableObject){
        cc.Node.WebGLRenderCmd.call(this, renderableObject);
        this._needDraw = true;

        this._clearColor = cc.color(0, 0, 0, 0);
    };

    var proto = cc.RenderTexture.WebGLRenderCmd.prototype = Object.create(cc.Node.WebGLRenderCmd.prototype);
    proto.constructor = cc.RenderTexture.WebGLRenderCmd;

    proto.rendering = function (ctx) {
        var gl = ctx || cc._renderContext;
        var node = this._node;
        if (node.autoDraw) {
            node.begin();

            var locClearFlags = node.clearFlags;
            if (locClearFlags) {
                var oldClearColor = [0.0, 0.0, 0.0, 0.0];
                var oldDepthClearValue = 0.0;
                var oldStencilClearValue = 0;

                // backup and set
                if (locClearFlags & gl.COLOR_BUFFER_BIT) {
                    oldClearColor = gl.getParameter(gl.COLOR_CLEAR_VALUE);
                    gl.clearColor(this._clearColor.r / 255, this._clearColor.g / 255, this._clearColor.b / 255, this._clearColor.a / 255);
                }

                if (locClearFlags & gl.DEPTH_BUFFER_BIT) {
                    oldDepthClearValue = gl.getParameter(gl.DEPTH_CLEAR_VALUE);
                    gl.clearDepth(node.clearDepthVal);
                }

                if (locClearFlags & gl.STENCIL_BUFFER_BIT) {
                    oldStencilClearValue = gl.getParameter(gl.STENCIL_CLEAR_VALUE);
                    gl.clearStencil(node.clearStencilVal);
                }

                // clear
                gl.clear(locClearFlags);

                // restore
                if (locClearFlags & gl.COLOR_BUFFER_BIT)
                    gl.clearColor(oldClearColor[0], oldClearColor[1], oldClearColor[2], oldClearColor[3]);

                if (locClearFlags & gl.DEPTH_BUFFER_BIT)
                    gl.clearDepth(oldDepthClearValue);

                if (locClearFlags & gl.STENCIL_BUFFER_BIT)
                    gl.clearStencil(oldStencilClearValue);
            }

            //! make sure all children are drawn
            node.sortAllChildren();
            var locChildren = node._children;
            for (var i = 0; i < locChildren.length; i++) {
                var getChild = locChildren[i];
                if (getChild != node.sprite)
                    getChild.visit();
            }
            node.end();
        }
    };

    proto.cleanup = function(){
        var node = this._node;
        //node.sprite = null;
        node._textureCopy = null;

        var gl = cc._renderContext;
        gl.deleteFramebuffer(node._fBO);
        if (node._depthRenderBuffer)
            gl.deleteRenderbuffer(node._depthRenderBuffer);
        node._uITextureImage = null;
        //if (node._texture)
        //    node._texture.releaseTexture();
    };

    proto.initWithWidthAndHeight = function(width, height, format, depthStencilFormat){
        var node = this._node;
        if(format == cc.Texture2D.PIXEL_FORMAT_A8)
            cc.log( "cc.RenderTexture._initWithWidthAndHeightForWebGL() : only RGB and RGBA formats are valid for a render texture;");

        var gl = cc._renderContext, locScaleFactor = cc.contentScaleFactor();

        width = 0 | (width * locScaleFactor);
        height = 0 | (height * locScaleFactor);

        node._oldFBO = gl.getParameter(gl.FRAMEBUFFER_BINDING);

        // textures must be power of two squared
        var powW , powH;

        if (cc.configuration.supportsNPOT()) {
            powW = width;
            powH = height;
        } else {
            powW = cc.NextPOT(width);
            powH = cc.NextPOT(height);
        }

        //void *data = malloc(powW * powH * 4);
        var dataLen = powW * powH * 4;
        var data = new Uint8Array(dataLen);
        //memset(data, 0, (int)(powW * powH * 4));
        for (var i = 0; i < powW * powH * 4; i++)
            data[i] = 0;

        this._pixelFormat = format;

        this._texture = new cc.Texture2D();
        if (!node._texture)
            return false;

        var locTexture = node._texture;
        locTexture.initWithData(data, node._pixelFormat, powW, powH, cc.size(width, height));
        //free( data );

        var oldRBO = gl.getParameter(gl.RENDERBUFFER_BINDING);

        if (cc.configuration.checkForGLExtension("GL_QCOM")) {
            node._textureCopy = new cc.Texture2D();
            if (!node._textureCopy)
                return false;
            this._textureCopy.initWithData(data, node._pixelFormat, powW, powH, cc.size(width, height));
        }

        // generate FBO
        node._fBO = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, node._fBO);

        // associate texture with FBO
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, locTexture._webTextureObj, 0);

        if (depthStencilFormat != 0) {
            //create and attach depth buffer
            node._depthRenderBuffer = gl.createRenderbuffer();
            gl.bindRenderbuffer(gl.RENDERBUFFER, node._depthRenderBuffer);
            gl.renderbufferStorage(gl.RENDERBUFFER, depthStencilFormat, powW, powH);
            if(depthStencilFormat == gl.DEPTH_STENCIL)
                gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, gl.RENDERBUFFER, node._depthRenderBuffer);
            else if(depthStencilFormat == gl.STENCIL_INDEX || depthStencilFormat == gl.STENCIL_INDEX8)
                gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.STENCIL_ATTACHMENT, gl.RENDERBUFFER, node._depthRenderBuffer);
            else if(depthStencilFormat == gl.DEPTH_COMPONENT16)
                gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, node._depthRenderBuffer);
        }

        // check if it worked (probably worth doing :) )
        if(gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE)
            cc.log("Could not attach texture to the framebuffer");

        locTexture.setAliasTexParameters();

        node.sprite = new cc.Sprite(locTexture);
        var locSprite = node.sprite;
        locSprite.scaleY = -1;
        locSprite.setBlendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

        gl.bindRenderbuffer(gl.RENDERBUFFER, oldRBO);
        gl.bindFramebuffer(gl.FRAMEBUFFER, node._oldFBO);

        // Disabled by default.
        node.autoDraw = false;

        // add sprite for backward compatibility
        node.addChild(locSprite);
        return true;
    };

    proto.begin = function(){
        var node = this;
        // Save the current matrix
        cc.kmGLMatrixMode(cc.KM_GL_PROJECTION);
        cc.kmGLPushMatrix();
        cc.kmGLMatrixMode(cc.KM_GL_MODELVIEW);
        cc.kmGLPushMatrix();

        var director = cc.director;
        director.setProjection(director.getProjection());

        var texSize = node._texture.getContentSizeInPixels();

        // Calculate the adjustment ratios based on the old and new projections
        var size = cc.director.getWinSizeInPixels();
        var widthRatio = size.width / texSize.width;
        var heightRatio = size.height / texSize.height;

        var gl = cc._renderContext;

        // Adjust the orthographic projection and viewport
        gl.viewport(0, 0, texSize.width, texSize.height);

        var orthoMatrix = new cc.kmMat4();
        cc.kmMat4OrthographicProjection(orthoMatrix, -1.0 / widthRatio, 1.0 / widthRatio,
                -1.0 / heightRatio, 1.0 / heightRatio, -1, 1);
        cc.kmGLMultMatrix(orthoMatrix);

        node._oldFBO = gl.getParameter(gl.FRAMEBUFFER_BINDING);
        gl.bindFramebuffer(gl.FRAMEBUFFER, node._fBO);//Will direct drawing to the frame buffer created above

        /*  Certain Qualcomm Andreno gpu's will retain data in memory after a frame buffer switch which corrupts the render to the texture.
         *   The solution is to clear the frame buffer before rendering to the texture. However, calling glClear has the unintended result of clearing the current texture.
         *   Create a temporary texture to overcome this. At the end of CCRenderTexture::begin(), switch the attached texture to the second one, call glClear,
         *   and then switch back to the original texture. This solution is unnecessary for other devices as they don't have the same issue with switching frame buffers.
         */
        if (cc.configuration.checkForGLExtension("GL_QCOM")) {
            // -- bind a temporary texture so we can clear the render buffer without losing our texture
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, node._textureCopy._webTextureObj, 0);
            //cc.checkGLErrorDebug();
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, node._texture._webTextureObj, 0);
        }
    };

    proto._beginWithClear = function(r, g, b, a, depthValue, stencilValue, flags){
        var node = this._node;
        r = r / 255;
        g = g / 255;
        b = b / 255;
        a = a / 255;

        node.begin();

        var gl = cc._renderContext;

        // save clear color
        var clearColor = [0.0, 0.0, 0.0, 0.0];
        var depthClearValue = 0.0;
        var stencilClearValue = 0;

        if (flags & gl.COLOR_BUFFER_BIT) {
            clearColor = gl.getParameter(gl.COLOR_CLEAR_VALUE);
            gl.clearColor(r, g, b, a);
        }

        if (flags & gl.DEPTH_BUFFER_BIT) {
            depthClearValue = gl.getParameter(gl.DEPTH_CLEAR_VALUE);
            gl.clearDepth(depthValue);
        }

        if (flags & gl.STENCIL_BUFFER_BIT) {
            stencilClearValue = gl.getParameter(gl.STENCIL_CLEAR_VALUE);
            gl.clearStencil(stencilValue);
        }

        gl.clear(flags);

        // restore
        if (flags & gl.COLOR_BUFFER_BIT)
            gl.clearColor(clearColor[0], clearColor[1], clearColor[2], clearColor[3]);

        if (flags & gl.DEPTH_BUFFER_BIT)
            gl.clearDepth(depthClearValue);

        if (flags & gl.STENCIL_BUFFER_BIT)
            gl.clearStencil(stencilClearValue);
    };

    proto.end = function(){
        var node = this.node
        cc.renderer._renderingToBuffer(node.__instanceId);

        var gl = cc._renderContext;
        var director = cc.director;
        gl.bindFramebuffer(gl.FRAMEBUFFER, node._oldFBO);

        //restore viewport
        director.setViewport();
        cc.kmGLMatrixMode(cc.KM_GL_PROJECTION);
        cc.kmGLPopMatrix();
        cc.kmGLMatrixMode(cc.KM_GL_MODELVIEW);
        cc.kmGLPopMatrix();

        /* var size = director.getWinSizeInPixels();

         // restore viewport
         gl.viewport(0, 0, size.width * cc.contentScaleFactor(), size.height * cc.contentScaleFactor());

         // special viewport for 3d projection + retina display
         if (director.getProjection() == cc.Director.PROJECTION_3D && cc.contentScaleFactor() != 1) {
         gl.viewport((-size.width / 2), (-size.height / 2), (size.width * cc.contentScaleFactor()), (size.height * cc.contentScaleFactor()));
         }

         director.setProjection(director.getProjection());*/
    };

    proto.clearRect = function(x, y, width, height){
        //TODO need to implement
    };

    proto.clearDepth = function(depthValue){
        var node = this._node;
        node.begin();

        var gl = cc._renderContext;
        //! save old depth value
        var depthClearValue = gl.getParameter(gl.DEPTH_CLEAR_VALUE);

        gl.clearDepth(depthValue);
        gl.clear(gl.DEPTH_BUFFER_BIT);

        // restore clear color
        gl.clearDepth(depthClearValue);
        node.end();
    };

    proto.visit = function(ctx){
        var node = this._node;
        cc.kmGLPushMatrix();

        /*        var locGrid = this.grid;
         if (locGrid && locGrid.isActive()) {
         locGrid.beforeDraw();
         this.transformAncestors();
         }*/

        node.transform(ctx);
        //this.toRenderer();

        node.sprite.visit();
        //this.draw(ctx);

        cc.renderer.pushRenderCommand(this);

        //TODO GridNode
        /*        if (locGrid && locGrid.isActive())
         locGrid.afterDraw(this);*/

        cc.kmGLPopMatrix();
    };

    proto.draw = function(ctx){
        var node = this._node;
        var gl = cc._renderContext;
        var locClearFlags = node.clearFlags;
        if (locClearFlags) {
            var oldClearColor = [0.0, 0.0, 0.0, 0.0];
            var oldDepthClearValue = 0.0;
            var oldStencilClearValue = 0;

            // backup and set
            if (locClearFlags & gl.COLOR_BUFFER_BIT) {
                oldClearColor = gl.getParameter(gl.COLOR_CLEAR_VALUE);
                gl.clearColor(this._clearColor.r/255, this._clearColor.g/255, this._clearColor.b/255, this._clearColor.a/255);
            }

            if (locClearFlags & gl.DEPTH_BUFFER_BIT) {
                oldDepthClearValue = gl.getParameter(gl.DEPTH_CLEAR_VALUE);
                gl.clearDepth(node.clearDepthVal);
            }

            if (locClearFlags & gl.STENCIL_BUFFER_BIT) {
                oldStencilClearValue = gl.getParameter(gl.STENCIL_CLEAR_VALUE);
                gl.clearStencil(node.clearStencilVal);
            }

            // clear
            gl.clear(locClearFlags);

            // restore
            if (locClearFlags & gl.COLOR_BUFFER_BIT)
                gl.clearColor(oldClearColor[0], oldClearColor[1], oldClearColor[2], oldClearColor[3]);

            if (locClearFlags & gl.DEPTH_BUFFER_BIT)
                gl.clearDepth(oldDepthClearValue);

            if (locClearFlags & gl.STENCIL_BUFFER_BIT)
                gl.clearStencil(oldStencilClearValue);
        }

        //! make sure all children are drawn
        this.sortAllChildren();
        var locChildren = node._children;
        for (var i = 0; i < locChildren.length; i++) {
            var getChild = locChildren[i];
            if (getChild != node.sprite)
                getChild.visit();
        }

        this.end();
    };

})();