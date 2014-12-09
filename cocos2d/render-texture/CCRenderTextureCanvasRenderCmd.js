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
        this._clearColorStr = "rgba(255,255,255,1)";

        this._cacheCanvas = cc.newElement('canvas');
        this._cacheContext = this._cacheCanvas.getContext('2d');
    };

    var proto = cc.RenderTexture.CanvasRenderCmd.prototype = Object.create(cc.Node.CanvasRenderCmd.prototype);
    proto.constructor = cc.RenderTexture.CanvasRenderCmd;

    proto.cleanup = function(){
        this._cacheContext = null;
        this._cacheCanvas = null;
    };

    proto.clearStencil = function (stencilValue) { };

    proto.updateClearColor = function(clearColor){
        this._clearColorStr = "rgba(" + (0 | clearColor.r) + "," + (0 | clearColor.g) + "," + (0 | clearColor.b) + "," + clearColor.a / 255 + ")";
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

        //restore viewport
    };

    proto.clearRect = function(x, y, width, height){
        this._cacheContext.clearRect(x, y, width, -height);
    };

    proto.clearDepth = function(depthValue){
        cc.log("clearDepth isn't supported on Cocos2d-Html5");
    };

    proto.visit = function(parentCmd){
        var node = this._node;
        this._syncStatus(parentCmd);
        node.sprite.visit(this);
        this._dirtyFlag = 0;
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
                getChild.visit(this);
        }
        node.end();
    };

})();