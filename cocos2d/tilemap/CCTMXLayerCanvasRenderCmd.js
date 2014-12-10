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
    cc.TMXLayer.CanvasRenderCmd = function(renderable){
        cc.SpriteBatchNode.CanvasRenderCmd.call(this, renderable);
        this._needDraw = true;
        this._childrenRenderCmds = [];

        var locCanvas = cc._canvas;
        var tmpCanvas = cc.newElement('canvas');
        tmpCanvas.width = locCanvas.width;
        tmpCanvas.height = locCanvas.height;
        this._cacheCanvas = tmpCanvas;
        this._cacheContext = this._cacheCanvas.getContext('2d');
        var tempTexture = new cc.Texture2D();
        tempTexture.initWithElement(tmpCanvas);
        tempTexture.handleLoadedTexture();
        this._cacheTexture = tempTexture;
        // This class uses cache, so its default cachedParent should be himself
        this._cacheDirty = false;
    };

    var proto = cc.TMXLayer.CanvasRenderCmd.prototype = Object.create(cc.SpriteBatchNode.CanvasRenderCmd.prototype);
    proto.constructor = cc.TMXLayer.CanvasRenderCmd;

    proto._copyRendererCmds = function (rendererCmds) {
        if (!rendererCmds)
            return;

        var locCacheCmds = this._childrenRenderCmds;
        locCacheCmds.length = 0;
        for (var i = 0, len = rendererCmds.length; i < len; i++) {
            locCacheCmds[i] = rendererCmds[i];
        }
    };

    //set the cache dirty flag for canvas
    proto._setNodeDirtyForCache = function () {
        this._cacheDirty  = true;
    };

    proto._renderingChildToCache = function (scaleX, scaleY) {
        if (this._cacheDirty) {
            var locCacheCmds = this._childrenRenderCmds, locCacheContext = this._cacheContext, locCanvas = this._cacheCanvas;

            locCacheContext.save();
            locCacheContext.clearRect(0, 0, locCanvas.width, -locCanvas.height);
            //reset the cache context
            var t = cc.affineTransformInvert(this._worldTransform);
            locCacheContext.transform(t.a, t.c, t.b, t.d, t.tx * scaleX, -t.ty * scaleY);

            for (var i = 0, len = locCacheCmds.length; i < len; i++) {
                locCacheCmds[i].rendering(locCacheContext, scaleX, scaleY);
                locCacheCmds[i]._cacheDirty = false;
            }
            locCacheContext.restore();
            this._cacheDirty = false;
        }
    };

    proto.rendering = function (ctx, scaleX, scaleY) {
        var node = this._node;
        var alpha = this._displayedOpacity / 255;
        if (alpha <= 0)
            return;

        this._renderingChildToCache(scaleX, scaleY);
        var context = ctx || cc._renderContext;
        context.globalAlpha = alpha;
        var posX = 0 | ( -this._anchorPointInPoints.x), posY = 0 | ( -this._anchorPointInPoints.y);
        var locCacheCanvas = this._cacheCanvas, t = this._worldTransform;
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

    proto._updateCacheContext = function(size, height){
        var node = this._node,
            locContentSize = node._contentSize,
            locCanvas = this._cacheCanvas,
            scaleFactor = cc.contentScaleFactor();
        locCanvas.width = 0 | (locContentSize.width * 1.5 * scaleFactor);
        locCanvas.height = 0 | (locContentSize.height * 1.5 * scaleFactor);

        if(node.layerOrientation === cc.TMX_ORIENTATION_HEX)
            this._cacheContext.translate(0, locCanvas.height - (node._mapTileSize.height * 0.5));                  //translate for hexagonal
        else
            this._cacheContext.translate(0, locCanvas.height);
        var locTexContentSize = this._cacheTexture._contentSize;
        locTexContentSize.width = locCanvas.width;
        locTexContentSize.height = locCanvas.height;
    };

    proto.getTexture = function(){
        return this._cacheTexture;
    };

    proto.visit = function(parentCmd){
        var node = this._node;
        //TODO it will implement dynamic compute child cutting automation.
        var i, len, locChildren = node._children;
        // quick return if not visible
        if (!node._visible || !locChildren || locChildren.length === 0)
            return;

        parentCmd = parentCmd || this.getParentRenderCmd();
        if (parentCmd)
            this._curLevel = parentCmd._curLevel + 1;

        //node.transform(node._parent && node._parent._renderCmd);
        this._syncStatus(parentCmd);

        if (this._cacheDirty) {
            var locCacheContext = this._cacheContext, locCanvas = this._cacheCanvas, locView = cc.view,
                instanceID = node.__instanceId, renderer = cc.renderer;
            //begin cache
            renderer._turnToCacheMode(instanceID);

           node.sortAllChildren();
            for (i = 0, len =  locChildren.length; i < len; i++) {
               if (locChildren[i]){
                  var selCmd = locChildren[i]._renderCmd;
                    if(selCmd){
                        selCmd.visit(this);
                        selCmd._cacheDirty = false;
                    }
                }
           }

            //copy cached render cmd array to TMXLayer renderer
            this._copyRendererCmds(renderer._cacheToCanvasCmds[instanceID]);

            locCacheContext.save();
            locCacheContext.clearRect(0, 0, locCanvas.width, -locCanvas.height);
            var t = cc.affineTransformInvert(this._worldTransform);
            locCacheContext.transform(t.a, t.c, t.b, t.d, t.tx * locView.getScaleX(), -t.ty * locView.getScaleY());

            //draw to cache canvas
            renderer._renderingToCacheCanvas(locCacheContext, instanceID);
            locCacheContext.restore();
            this._cacheDirty = false
        }
        cc.renderer.pushRenderCommand(this);
        this._dirtyFlag = 0;
    };

    proto.initImageSize = function(){
        var node = this._node;
        node.tileset.imageSize = this._originalTexture.getContentSizeInPixels();
    };

    proto._reusedTileWithRect = function(rect){
        var node = this._node;
        node._reusedTile = new cc.Sprite();
        node._reusedTile.initWithTexture(node._renderCmd._texture, rect, false);
        node._reusedTile.batchNode = node;
        node._reusedTile.parent = node;
        node._reusedTile._renderCmd._cachedParent = node._renderCmd;
        return node._reusedTile;
    };
})();