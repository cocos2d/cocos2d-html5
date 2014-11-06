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

cc.TMXLayer.CanvasRenderCmd = function(renderableObject){
    cc.Node.CanvasRenderCmd.call(this, renderableObject);
    this._childrenRenderCmds = [];
    this._needDraw = true;
};

cc.TMXLayer.CanvasRenderCmd.prototype = Object.create(cc.Node.CanvasRenderCmd.prototype);
cc.TMXLayer.CanvasRenderCmd.prototype.constructor = cc.TMXLayer.CanvasRenderCmd;

cc.TMXLayer.CanvasRenderCmd.prototype._copyRendererCmds = function (rendererCmds) {
    if (!rendererCmds)
        return;

    var locCacheCmds = this._childrenRenderCmds;
    locCacheCmds.length = 0;
    for (var i = 0, len = rendererCmds.length; i < len; i++) {
        locCacheCmds[i] = rendererCmds[i];
    }
};

cc.TMXLayer.CanvasRenderCmd.prototype._renderingChildToCache = function (scaleX, scaleY) {
    var locNode = this._node;
    if (locNode._cacheDirty) {
        var locCacheCmds = this._childrenRenderCmds, locCacheContext = locNode._cacheContext, locCanvas = locNode._cacheCanvas;

        locCacheContext.save();
        locCacheContext.clearRect(0, 0, locCanvas.width, -locCanvas.height);
        //reset the cache context
        var t = cc.affineTransformInvert(locNode._transformWorld);
        locCacheContext.transform(t.a, t.c, t.b, t.d, t.tx * scaleX, -t.ty * scaleY);

        for (var i = 0, len = locCacheCmds.length; i < len; i++) {
            locCacheCmds[i].rendering(locCacheContext, scaleX, scaleY);
            if (locCacheCmds[i]._node)
                locCacheCmds[i]._node._cacheDirty = false;
        }
        locCacheContext.restore();
        locNode._cacheDirty = false;
    }
};

cc.TMXLayer.CanvasRenderCmd.prototype.rendering = function (ctx, scaleX, scaleY) {
    var node = this._node;
    var alpha = node._displayedOpacity / 255;
    if (alpha <= 0)
        return;

    this._renderingChildToCache(scaleX, scaleY);
    var context = ctx || cc._renderContext;
    context.globalAlpha = alpha;
    var posX = 0 | ( -node._anchorPointInPoints.x), posY = 0 | ( -node._anchorPointInPoints.y);
    var locCacheCanvas = node._cacheCanvas, t = node._transformWorld;
    //direct draw image by canvas drawImage
    if (locCacheCanvas && locCacheCanvas.width !== 0 && locCacheCanvas.height !== 0) {
        context.save();
        //transform
        context.transform(t.a, t.c, t.b, t.d, t.tx * scaleX, -t.ty * scaleY);

        var locCanvasHeight = locCacheCanvas.height * scaleY;

        if (node.layerOrientation === cc.TMX_ORIENTATION_HEX) {
            var halfTileSize = node._mapTileSize.height * 0.5 * scaleY;
            context.drawImage(locCacheCanvas, 0, 0, locCacheCanvas.width, locCacheCanvas.height,
                posX, -(posY + locCanvasHeight) + halfTileSize, locCacheCanvas.width * scaleX, locCanvasHeight);
        } else {
            context.drawImage(locCacheCanvas, 0, 0, locCacheCanvas.width, locCacheCanvas.height,
                posX, -(posY + locCanvasHeight), locCacheCanvas.width * scaleX, locCanvasHeight);
        }
        context.restore();
    }
    cc.g_NumberOfDraws++;
};

cc.TMXLayer.WebGLRenderCmd = function(renderableObject){
    cc.Node.WebGLRenderCmd.call(this, renderableObject);
    this._needDraw = true;
};

cc.TMXLayer.WebGLRenderCmd.prototype.rendering = cc.SpriteBatchNodeRenderCmdWebGL.prototype.rendering;