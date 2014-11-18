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

cc.Sprite.CanvasRenderCmd = function(renderable){
    cc.Node.CanvasRenderCmd.call(this, renderable);
    this._needDraw = true;
    this._textureCoord = {
        renderX: 0,                             //the x of texture coordinate for render, when texture tinted, its value doesn't equal x.
        renderY: 0,                             //the y of texture coordinate for render, when texture tinted, its value doesn't equal y.
        x: 0,                                   //the x of texture coordinate for node.
        y: 0,                                   //the y of texture coordinate for node.
        width: 0,
        height: 0,
        validRect: false
    };
    this._blendFuncStr = "source-over";
    this._colorized = false;

    this._originalTexture = null;
    this._drawSizeCanvas = null;
};

cc.Sprite.CanvasRenderCmd.prototype = Object.create(cc.Node.CanvasRenderCmd.prototype);
cc.Sprite.CanvasRenderCmd.prototype.constructor = cc.Sprite.CanvasRenderCmd;

cc.Sprite.CanvasRenderCmd.prototype._init = function(){};

cc.Sprite.CanvasRenderCmd.prototype._resetForBatchNode = function(){};

cc.Sprite.CanvasRenderCmd.prototype._setTexture = function(texture){
    var node = this._node;
    if (node._texture != texture) {
        if (texture && texture.getHtmlElementObj() instanceof  HTMLImageElement) {
            this._originalTexture = texture;
        }
        node._texture = texture;
    }
};

cc.Sprite.CanvasRenderCmd.prototype._updateColor = function(){
    this.setDirtyFlag(cc.Node._dirtyFlags.colorDirty|cc.Node._dirtyFlags.opacityDirty);
};

cc.Sprite.CanvasRenderCmd.prototype.isFrameDisplayed = function(frame){
    //TODO there maybe has a bug
    var node = this._node;
    if (frame.getTexture() != node._texture)
        return false;
    return cc.rectEqualToRect(frame.getRect(), node._rect);
};

cc.Sprite.CanvasRenderCmd.prototype.updateBlendFunc = function(blendFunc){
    this._blendFuncStr = cc.Node.CanvasRenderCmd._getCompositeOperationByBlendFunc(blendFunc);
};

cc.Sprite.CanvasRenderCmd.prototype._setBatchNodeForAddChild = function(child){
    return true;
};

cc.Sprite.CanvasRenderCmd.prototype._handleTextureForRotatedTexture = function(texture, rect, rotated){
    if (rotated && texture.isLoaded()) {
        var tempElement = texture.getHtmlElementObj();
        tempElement = cc.Sprite.CanvasRenderCmd._cutRotateImageToCanvas(tempElement, rect);
        var tempTexture = new cc.Texture2D();
        tempTexture.initWithElement(tempElement);
        tempTexture.handleLoadedTexture();
        texture = tempTexture;
        this._node._rect = cc.rect(0, 0, rect.width, rect.height);
    }
    return texture;
};

cc.Sprite.CanvasRenderCmd.prototype._checkTextureBoundary = function(texture, rect, rotated){
    if(texture && texture.url) {
        var _x = rect.x + rect.width, _y = rect.y + rect.height;
        if(_x > texture.width){
            cc.error(cc._LogInfos.RectWidth, texture.url);
        }
        if(_y > texture.height){
            cc.error(cc._LogInfos.RectHeight, texture.url);
        }
    }
    this._node._originalTexture = texture;
};

cc.Sprite.CanvasRenderCmd.prototype.rendering = function (ctx, scaleX, scaleY) {
    var self = this,
        node = self._node;

    var context = ctx || cc._renderContext,
        locTextureCoord = self._textureCoord;

    if (node._texture && (locTextureCoord.width === 0 || locTextureCoord.height === 0))
        return;
    if (!locTextureCoord.validRect && node._displayedOpacity === 0)
        return;  //draw nothing

    if (node._texture && !node._texture._isLoaded)  //set texture but the texture isn't loaded.
        return;

    var t = node._transformWorld,
        locX = node._offsetPosition.x,
        locY = -node._offsetPosition.y - node._rect.height,
        locWidth = node._rect.width,
        locHeight = node._rect.height,
        image, curColor, contentSize;

    var blendChange = (node._blendFuncStr !== "source-over"), alpha = (node._displayedOpacity / 255);

    if (t.a !== 1 || t.b !== 0 || t.c !== 0 || t.d !== 1 || node._flippedX || node._flippedY) {
        context.save();

        context.globalAlpha = alpha;
        //transform
        context.transform(t.a, t.c, t.b, t.d, t.tx * scaleX, -t.ty * scaleY);
        if (blendChange)
            context.globalCompositeOperation = node._blendFuncStr;

        if (node._flippedX) {
            locX = -locX - locWidth;
            context.scale(-1, 1);
        }
        if (node._flippedY) {
            locY = node._offsetPosition.y;
            context.scale(1, -1);
        }

        if (node._texture) {
            image = node._texture._htmlElementObj;

            if (node._texture._pattern != "") {
                context.save();
                context.fillStyle = context.createPattern(image, node._texture._pattern);
                context.fillRect(locX * scaleX, locY * scaleY, locWidth * scaleX, locHeight * scaleY);
                context.restore();
            } else {
                if (node._colorized) {
                    context.drawImage(image,
                        0,
                        0,
                        locTextureCoord.width,
                        locTextureCoord.height,
                            locX * scaleX,
                            locY * scaleY,
                            locWidth * scaleX,
                            locHeight * scaleY
                    );
                } else {
                    context.drawImage(image,
                        locTextureCoord.renderX,
                        locTextureCoord.renderY,
                        locTextureCoord.width,
                        locTextureCoord.height,
                            locX * scaleX,
                            locY * scaleY,
                            locWidth * scaleX,
                            locHeight * scaleY
                    );
                }
            }
        } else {
            contentSize = node._contentSize;
            if (locTextureCoord.validRect) {
                curColor = node._displayedColor;
                context.fillStyle = "rgba(" + curColor.r + "," + curColor.g + "," + curColor.b + ",1)";
                context.fillRect(locX * scaleX, locY * scaleY, contentSize.width * scaleX, contentSize.height * scaleY);
            }
        }
        context.restore();
    } else {
        if (blendChange) {
            context.save();
            context.globalCompositeOperation = node._blendFuncStr;
        }

        context.globalAlpha = alpha;
        if (node._texture) {
            image = node._texture.getHtmlElementObj();
            if (node._texture._pattern != "") {
                context.save();
                context.transform(t.a, t.c, t.b, t.d, t.tx * scaleX, -t.ty * scaleY);
                context.fillStyle = context.createPattern(image, node._texture._pattern);
                context.fillRect(locX * scaleX, locY * scaleY, locWidth * scaleX, locHeight * scaleY);
                context.restore();
            } else {
                if (node._colorized) {
                    context.drawImage(image,
                        0,
                        0,
                        locTextureCoord.width,
                        locTextureCoord.height,
                            (t.tx + locX) * scaleX,
                            (-t.ty + locY) * scaleY,
                            locWidth * scaleX,
                            locHeight * scaleY);
                } else {
                    context.drawImage(
                        image,
                        locTextureCoord.renderX,
                        locTextureCoord.renderY,
                        locTextureCoord.width,
                        locTextureCoord.height,
                            (t.tx + locX) * scaleX,
                            (-t.ty + locY) * scaleY,
                            locWidth * scaleX,
                            locHeight * scaleY);
                }
            }
        } else {
            contentSize = node._contentSize;
            if (locTextureCoord.validRect) {
                curColor = node._displayedColor;
                context.fillStyle = "rgba(" + curColor.r + "," + curColor.g + "," + curColor.b + ",1)";
                context.fillRect((t.tx + locX) * scaleX, (-t.ty + locY) * scaleY, contentSize.width * scaleX, contentSize.height * scaleY);
            }
        }
        if (blendChange)
            context.restore();
    }
    cc.g_NumberOfDraws++;
};

cc.Sprite.CanvasRenderCmd.prototype._changeTextureColor = function(){
    if(!cc.sys._supportCanvasNewBlendModes){
        var locElement, locTexture = this._texture, locRect = this._renderCmd._textureCoord;
        if (locTexture && locRect.validRect && this._originalTexture) {
            locElement = locTexture.getHtmlElementObj();
            if (!locElement)
                return;

            if(!cc.sys._supportCanvasNewBlendModes) {
                var cacheTextureForColor = cc.textureCache.getTextureColors(this._originalTexture.getHtmlElementObj());
                if (cacheTextureForColor) {
                    this._colorized = true;
                    //generate color texture cache
                    if (locElement instanceof HTMLCanvasElement && !this._rectRotated && !this._newTextureWhenChangeColor)
                        cc.Sprite.CanvasRenderCmd._generateTintImage(locElement, cacheTextureForColor, this._displayedColor, locRect, locElement);
                    else {
                        locElement = cc.Sprite.CanvasRenderCmd._generateTintImage(locElement, cacheTextureForColor, this._displayedColor, locRect);
                        locTexture = new cc.Texture2D();
                        locTexture.initWithElement(locElement);
                        locTexture.handleLoadedTexture();
                        this.texture = locTexture;
                    }
                }
            } else {
                this._colorized = true;
                if (locElement instanceof HTMLCanvasElement && !this._rectRotated && !this._newTextureWhenChangeColor
                    && this._originalTexture._htmlElementObj != locElement)
                    cc.Sprite.CanvasRenderCmd._generateTintImageWithMultiply(this._originalTexture._htmlElementObj, this._displayedColor, locRect, locElement);
                else {
                    locElement = cc.Sprite.CanvasRenderCmd._generateTintImageWithMultiply(this._originalTexture._htmlElementObj, this._displayedColor, locRect);
                    locTexture = new cc.Texture2D();
                    locTexture.initWithElement(locElement);
                    locTexture.handleLoadedTexture();
                    this.texture = locTexture;
                }
            }
        }
    }
};

cc.Sprite.CanvasRenderCmd.prototype.getQuad = function(){
    //throw an error. it doesn't support this function.
    return null;
};

cc.Sprite.CanvasRenderCmd.prototype._updateForSetSpriteFrame = function(pNewTexture, textureLoaded){
    var node = this._node;
    if (node._rectRotated)
        node._originalTexture = pNewTexture;      //TODO
    this._colorized = false;
    this._textureCoord.renderX = this._textureCoord.x;
    this._textureCoord.renderY = this._textureCoord.y;
    if (textureLoaded) {
        var curColor = node.getColor();
        if (curColor.r !== 255 || curColor.g !== 255 || curColor.b !== 255)
            this._changeTextureColor();
    }
};

cc.Sprite.CanvasRenderCmd.prototype.updateTransform = function(){
    var _t = this, node = this._node;

    // re-calculate matrix only if it is dirty
    if (node.dirty) {
        // If it is not visible, or one of its ancestors is not visible, then do nothing:
        var locParent = node._parent;
        if (!node._visible || ( locParent && locParent != node._batchNode && locParent._shouldBeHidden)) {
            node._shouldBeHidden = true;
        } else {
            node._shouldBeHidden = false;

            if (!locParent || locParent == node._batchNode) {
                node._transformToBatch = _t.getNodeToParentTransform();
            } else {
                //cc.assert(_t._parent instanceof cc.Sprite, "Logic error in CCSprite. Parent must be a CCSprite");
                node._transformToBatch = cc.affineTransformConcat(_t.getNodeToParentTransform(), locParent._transformToBatch);
            }
        }
        node._recursiveDirty = false;
        node.dirty = false;
    }

    // recursively iterate over children
    if (node._hasChildren)
        node._arrayMakeObjectsPerformSelector(node._children, cc.Node._stateCallbackType.updateTransform);
};

cc.Sprite.CanvasRenderCmd.prototype._updateDisplayColor = function(parentColor){
    cc.Node.CanvasRenderCmd.prototype._updateDisplayColor.call(this, parentColor);
    this._changeTextureColor();
};

cc.Sprite.CanvasRenderCmd.prototype._spriteFrameLoadedCallback = function(spriteFrame){
    var _t = this;
    _t.setNodeDirty(true);
    _t.setTextureRect(spriteFrame.getRect(), spriteFrame.isRotated(), spriteFrame.getOriginalSize());

    //TODO change
    var curColor = _t.getColor();
    if (curColor.r !== 255 || curColor.g !== 255 || curColor.b !== 255)
        _t._changeTextureColor();

    _t.dispatchEvent("load");
};

cc.Sprite.CanvasRenderCmd.prototype._textureLoadedCallback = function (sender) {
    var _t = this;
    if(_t._textureLoaded)
        return;

    _t._textureLoaded = true;
    var locRect = _t._rect, locRenderCmd = this._renderCmd;
    if (!locRect) {
        locRect = cc.rect(0, 0, sender.width, sender.height);
    } else if (cc._rectEqualToZero(locRect)) {
        locRect.width = sender.width;
        locRect.height = sender.height;
    }
    locRenderCmd._originalTexture = sender;

    _t.texture = sender;
    _t.setTextureRect(locRect, _t._rectRotated);

    //set the texture's color after the it loaded
    var locColor = locRenderCmd._displayedColor;
    if(locColor.r != 255 || locColor.g != 255 || locColor.b != 255)
        _t._changeTextureColor();

    // by default use "Self Render".
    // if the sprite is added to a batchnode, then it will automatically switch to "batchnode Render"
    _t.setBatchNode(_t._batchNode);
    _t.dispatchEvent("load");
};

cc.Sprite.CanvasRenderCmd.prototype._setTextureCoords = function(rect, needConvert){
    if(needConvert === undefined)
        needConvert = true;
    var locTextureRect = this._textureCoord,
        scaleFactor = needConvert ? cc.contentScaleFactor() : 1;
    locTextureRect.renderX = locTextureRect.x = 0 | (rect.x * scaleFactor);
    locTextureRect.renderY = locTextureRect.y = 0 | (rect.y * scaleFactor);
    locTextureRect.width = 0 | (rect.width * scaleFactor);
    locTextureRect.height = 0 | (rect.height * scaleFactor);
    locTextureRect.validRect = !(locTextureRect.width === 0 || locTextureRect.height === 0 || locTextureRect.x < 0 || locTextureRect.y < 0);
};

//TODO need refactor these functions
//utils for tint
// Tint a texture using the "multiply" operation
cc.Sprite.CanvasRenderCmd._generateTintImageWithMultiply = function(image, color, rect, renderCanvas){
    renderCanvas = renderCanvas || cc.newElement("canvas");
    rect = rect || cc.rect(0,0, image.width, image.height);
    var context = renderCanvas.getContext( "2d" );
    if(renderCanvas.width != rect.width || renderCanvas.height != rect.height){
        renderCanvas.width = rect.width;
        renderCanvas.height = rect.height;
    }else{
        context.globalCompositeOperation = "source-over";
    }

    context.fillStyle = "rgb(" + (0|color.r) + "," + (0|color.g) + "," + (0|color.b) + ")";
    context.fillRect(0, 0, rect.width, rect.height);
    context.globalCompositeOperation = "multiply";
    context.drawImage(image,
        rect.x,
        rect.y,
        rect.width,
        rect.height,
        0,
        0,
        rect.width,
        rect.height);
    context.globalCompositeOperation = "destination-atop";
    context.drawImage(image,
        rect.x,
        rect.y,
        rect.width,
        rect.height,
        0,
        0,
        rect.width,
        rect.height);
    return renderCanvas;
};

//Generate tinted texture with lighter.
cc.Sprite.CanvasRenderCmd._generateTintImage = function (texture, tintedImgCache, color, rect, renderCanvas) {
    if (!rect)
        rect = cc.rect(0, 0, texture.width, texture.height);

    var r = color.r / 255, g = color.g / 255, b = color.b / 255;
    var w = Math.min(rect.width, tintedImgCache[0].width);
    var h = Math.min(rect.height, tintedImgCache[0].height);
    var buff = renderCanvas, ctx;
    // Create a new buffer if required
    if (!buff) {
        buff = cc.newElement("canvas");
        buff.width = w;
        buff.height = h;
        ctx = buff.getContext("2d");
    } else {
        ctx = buff.getContext("2d");
        ctx.clearRect(0, 0, w, h);
    }

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    // Make sure to keep the renderCanvas alpha in mind in case of overdraw
    var a = ctx.globalAlpha;
    if (r > 0) {
        ctx.globalAlpha = r * a;
        ctx.drawImage(tintedImgCache[0], rect.x, rect.y, w, h, 0, 0, w, h);
    }
    if (g > 0) {
        ctx.globalAlpha = g * a;
        ctx.drawImage(tintedImgCache[1], rect.x, rect.y, w, h, 0, 0, w, h);
    }
    if (b > 0) {
        ctx.globalAlpha = b * a;
        ctx.drawImage(tintedImgCache[2], rect.x, rect.y, w, h, 0, 0, w, h);
    }
    if (r + g + b < 1) {
        ctx.globalAlpha = a;
        ctx.drawImage(tintedImgCache[3], rect.x, rect.y, w, h, 0, 0, w, h);
    }
    ctx.restore();
    return buff;
};

cc.Sprite.CanvasRenderCmd._generateTextureCacheForColor = function (texture) {
    if (texture.channelCache) {
        return texture.channelCache;
    }

    var textureCache = [
        cc.newElement("canvas"),
        cc.newElement("canvas"),
        cc.newElement("canvas"),
        cc.newElement("canvas")
    ];

    function renderToCache() {
        var ref = cc.Sprite.CanvasRenderCmd._generateTextureCacheForColor;

        var w = texture.width;
        var h = texture.height;

        textureCache[0].width = w;
        textureCache[0].height = h;
        textureCache[1].width = w;
        textureCache[1].height = h;
        textureCache[2].width = w;
        textureCache[2].height = h;
        textureCache[3].width = w;
        textureCache[3].height = h;

        ref.canvas.width = w;
        ref.canvas.height = h;

        var ctx = ref.canvas.getContext("2d");
        ctx.drawImage(texture, 0, 0);

        ref.tempCanvas.width = w;
        ref.tempCanvas.height = h;

        var pixels = ctx.getImageData(0, 0, w, h).data;

        for (var rgbI = 0; rgbI < 4; rgbI++) {
            var cacheCtx = textureCache[rgbI].getContext('2d');
            cacheCtx.getImageData(0, 0, w, h).data;
            ref.tempCtx.drawImage(texture, 0, 0);

            var to = ref.tempCtx.getImageData(0, 0, w, h);
            var toData = to.data;

            for (var i = 0; i < pixels.length; i += 4) {
                toData[i  ] = (rgbI === 0) ? pixels[i  ] : 0;
                toData[i + 1] = (rgbI === 1) ? pixels[i + 1] : 0;
                toData[i + 2] = (rgbI === 2) ? pixels[i + 2] : 0;
                toData[i + 3] = pixels[i + 3];
            }
            cacheCtx.putImageData(to, 0, 0);
        }
        texture.onload = null;
    }

    try {
        renderToCache();
    } catch (e) {
        texture.onload = renderToCache;
    }

    texture.channelCache = textureCache;
    return textureCache;
};

cc.Sprite.CanvasRenderCmd._generateTextureCacheForColor.canvas = cc.newElement('canvas');
cc.Sprite.CanvasRenderCmd._generateTextureCacheForColor.tempCanvas = cc.newElement('canvas');
cc.Sprite.CanvasRenderCmd._generateTextureCacheForColor.tempCtx = cc.Sprite.CanvasRenderCmd._generateTextureCacheForColor.tempCanvas.getContext('2d');

cc.Sprite.CanvasRenderCmd._cutRotateImageToCanvas = function (texture, rect) {
    if (!texture)
        return null;

    if (!rect)
        return texture;

    var nCanvas = cc.newElement("canvas");
    nCanvas.width = rect.width;
    nCanvas.height = rect.height;
    var ctx = nCanvas.getContext("2d");
    ctx.translate(nCanvas.width / 2, nCanvas.height / 2);
    ctx.rotate(-1.5707963267948966);
    ctx.drawImage(texture, rect.x, rect.y, rect.height, rect.width, -rect.height / 2, -rect.width / 2, rect.height, rect.width);
    return nCanvas;
};

//++++++++++++++++++++++++++++++WebGL+++++++++++++++++++++++++++++++++++++++++++
//Sprite's WebGL render command
cc.Sprite.WebGLRenderCmd = function(renderable){
    cc.Node.WebGLRenderCmd.call(this, renderable);
    this._needDraw = true;

    this._quad = new cc.V3F_C4B_T2F_Quad();
    this._quadWebBuffer = cc._renderContext.createBuffer();
    this._quadDirty = true;
};

cc.Sprite.WebGLRenderCmd.prototype = Object.create(cc.Node.WebGLRenderCmd);
cc.Sprite.WebGLRenderCmd.prototype.constructor = cc.Sprite.WebGLRenderCmd;

cc.Sprite.WebGLRenderCmd.prototype.updateBlendFunc = function(blendFunc){
    //do nothing
};

cc.Sprite.WebGLRenderCmd.prototype._setBatchNodeForAddChild = function(child){
    var node = this._node;
    if (node._batchNode) {
        if(!(child instanceof cc.Sprite)){
            cc.log(cc._LogInfos.Sprite_addChild);
            return false;
        }
        if(child.texture._webTextureObj !== node.textureAtlas.texture._webTextureObj)
            cc.log(cc._LogInfos.Sprite_addChild_2);

        //put it in descendants array of batch node
        node._batchNode.appendChild(child);
        if (!node._reorderChildDirty)
            node._setReorderChildDirtyRecursively();
    }
    return true;
};

cc.Sprite.WebGLRenderCmd.prototype._handleTextureForRotatedTexture = function(){
     //do nothing.
};

cc.Sprite.WebGLRenderCmd.prototype.isFrameDisplayed = function(frame){
    var node = this._node;
    return (cc.rectEqualToRect(frame.getRect(), node._rect) && frame.getTexture().getName() == node._texture.getName()
        && cc.pointEqualToPoint(frame.getOffset(), node._unflippedOffsetPositionFromCenter));
};

cc.Sprite.WebGLRenderCmd.prototype._init = function(){
    var tempColor = {r: 255, g: 255, b: 255, a: 255}, quad = this._quad;
    quad.bl.colors = tempColor;
    quad.br.colors = tempColor;
    quad.tl.colors = tempColor;
    quad.tr.colors = tempColor;
    this._quadDirty = true;
};

cc.Sprite.WebGLRenderCmd.prototype._resetForBatchNode = function(){
    var node = this._node;
    var x1 = node._offsetPosition.x;
    var y1 = node._offsetPosition.y;
    var x2 = x1 + node._rect.width;
    var y2 = y1 + node._rect.height;
    var locQuad = this._quad;
    locQuad.bl.vertices = {x:x1, y:y1, z:0};
    locQuad.br.vertices = {x:x2, y:y1, z:0};
    locQuad.tl.vertices = {x:x1, y:y2, z:0};
    locQuad.tr.vertices = {x:x2, y:y2, z:0};
    this._quadDirty = true;
};

cc.Sprite.WebGLRenderCmd.prototype.getQuad = function(){
    return this._quad;
};

cc.Sprite.WebGLRenderCmd.prototype._updateForSetSpriteFrame = function(){};

cc.Sprite.WebGLRenderCmd.prototype._spriteFrameLoadedCallback = function(spriteFrame){
    this.setNodeDirty(true);
    this.setTextureRect(spriteFrame.getRect(), spriteFrame.isRotated(), spriteFrame.getOriginalSize());
    this.dispatchEvent("load");
};

cc.Sprite.WebGLRenderCmd.prototype._textureLoadedCallback = function (sender) {
    var node = this._node;
    if(node._textureLoaded)
        return;

    node._textureLoaded = true;
    var locRect = node._rect;
    if (!locRect) {
        locRect = cc.rect(0, 0, sender.width, sender.height);
    } else if (cc._rectEqualToZero(locRect)) {
        locRect.width = sender.width;
        locRect.height = sender.height;
    }

    node.texture = sender;
    node.setTextureRect(locRect, node._rectRotated);

    // by default use "Self Render".
    // if the sprite is added to a batchnode, then it will automatically switch to "batchnode Render"
    node.setBatchNode(node._batchNode);
    this._quadDirty = true;
    node.dispatchEvent("load");
};

cc.Sprite.WebGLRenderCmd.prototype._setTextureCoords = function (rect, needConvert) {
    if(needConvert === undefined)
        needConvert = true;
    if(needConvert)
        rect = cc.rectPointsToPixels(rect);
    var node = this._node;

    var tex = node._batchNode ? node.textureAtlas.texture : node._texture;
    if (!tex)
        return;

    var atlasWidth = tex.pixelsWidth;
    var atlasHeight = tex.pixelsHeight;

    var left, right, top, bottom, tempSwap, locQuad = this._quad;
    if (node._rectRotated) {
        if (cc.FIX_ARTIFACTS_BY_STRECHING_TEXEL) {
            left = (2 * rect.x + 1) / (2 * atlasWidth);
            right = left + (rect.height * 2 - 2) / (2 * atlasWidth);
            top = (2 * rect.y + 1) / (2 * atlasHeight);
            bottom = top + (rect.width * 2 - 2) / (2 * atlasHeight);
        } else {
            left = rect.x / atlasWidth;
            right = (rect.x + rect.height) / atlasWidth;
            top = rect.y / atlasHeight;
            bottom = (rect.y + rect.width) / atlasHeight;
        }

        if (node._flippedX) {
            tempSwap = top;
            top = bottom;
            bottom = tempSwap;
        }

        if (node._flippedY) {
            tempSwap = left;
            left = right;
            right = tempSwap;
        }

        locQuad.bl.texCoords.u = left;
        locQuad.bl.texCoords.v = top;
        locQuad.br.texCoords.u = left;
        locQuad.br.texCoords.v = bottom;
        locQuad.tl.texCoords.u = right;
        locQuad.tl.texCoords.v = top;
        locQuad.tr.texCoords.u = right;
        locQuad.tr.texCoords.v = bottom;
    } else {
        if (cc.FIX_ARTIFACTS_BY_STRECHING_TEXEL) {
            left = (2 * rect.x + 1) / (2 * atlasWidth);
            right = left + (rect.width * 2 - 2) / (2 * atlasWidth);
            top = (2 * rect.y + 1) / (2 * atlasHeight);
            bottom = top + (rect.height * 2 - 2) / (2 * atlasHeight);
        } else {
            left = rect.x / atlasWidth;
            right = (rect.x + rect.width) / atlasWidth;
            top = rect.y / atlasHeight;
            bottom = (rect.y + rect.height) / atlasHeight;
        }

        if (node._flippedX) {
            tempSwap = left;
            left = right;
            right = tempSwap;
        }

        if (node._flippedY) {
            tempSwap = top;
            top = bottom;
            bottom = tempSwap;
        }

        locQuad.bl.texCoords.u = left;
        locQuad.bl.texCoords.v = bottom;
        locQuad.br.texCoords.u = right;
        locQuad.br.texCoords.v = bottom;
        locQuad.tl.texCoords.u = left;
        locQuad.tl.texCoords.v = top;
        locQuad.tr.texCoords.u = right;
        locQuad.tr.texCoords.v = top;
    }
    this._quadDirty = true;
};

cc.Sprite.WebGLRenderCmd.prototype._updateDisplayColor = function(parentColor){
    cc.Node.WebGLRenderCmd.prototype._updateDisplayColor.call(this, parentColor);
    this._updateColor();
};

cc.Sprite.WebGLRenderCmd.prototype._updateDisplayOpacity = function(parentOpacity){
    cc.Node.WebGLRenderCmd.prototype._updateDisplayOpacity.call(this, parentOpacity);
    this._updateColor();
};

cc.Sprite.WebGLRenderCmd.prototype._updateColor = function () {
    var locDisplayedColor = this._displayedColor, locDisplayedOpacity = this._displayedOpacity;
    var color4 = {r: locDisplayedColor.r, g: locDisplayedColor.g, b: locDisplayedColor.b, a: locDisplayedOpacity};
    // special opacity for premultiplied textures
    if (this._opacityModifyRGB) {
        color4.r *= locDisplayedOpacity / 255.0;
        color4.g *= locDisplayedOpacity / 255.0;
        color4.b *= locDisplayedOpacity / 255.0;
    }
    var locQuad = this._quad, node = this._node;
    locQuad.bl.colors = color4;
    locQuad.br.colors = color4;
    locQuad.tl.colors = color4;
    locQuad.tr.colors = color4;

    // renders using Sprite Manager
    if (node._batchNode) {
        if (node.atlasIndex != cc.Sprite.INDEX_NOT_INITIALIZED) {
            node.textureAtlas.updateQuad(locQuad, node.atlasIndex)
        } else {
            // no need to set it recursively
            // update dirty_, don't update recursiveDirty_
            node.dirty = true;
        }
    }
    // self render
    // do nothing
    this._quadDirty = true;
};

cc.Sprite.WebGLRenderCmd.prototype._updateBlendFunc = function(){
    if(this._batchNode){
        cc.log(cc._LogInfos.Sprite__updateBlendFunc);
        return;
    }

    // it's possible to have an untextured sprite
    if (!this._texture || !this._texture.hasPremultipliedAlpha()) {
        this._blendFunc.src = cc.SRC_ALPHA;
        this._blendFunc.dst = cc.ONE_MINUS_SRC_ALPHA;
        this.opacityModifyRGB = false;
    } else {
        this._blendFunc.src = cc.BLEND_SRC;
        this._blendFunc.dst = cc.BLEND_DST;
        this.opacityModifyRGB = true;
    }
};

cc.Sprite.WebGLRenderCmd.prototype._setTexture = function(texture){
    var node = this._node;
    // If batchnode, then texture id should be the same
    if(node._batchNode && node._batchNode.texture != texture) {
        cc.log(cc._LogInfos.Sprite_setTexture);
        return;
    }

    if (texture)
        node.shaderProgram = cc.shaderCache.programForKey(cc.SHADER_POSITION_TEXTURECOLOR);
    else
        node.shaderProgram = cc.shaderCache.programForKey(cc.SHADER_POSITION_COLOR);

    if (!node._batchNode && node._texture != texture) {
        node._texture = texture;
        this._updateBlendFunc();
    }
};

cc.Sprite.WebGLRenderCmd.prototype.updateTransform = function () {
    var _t = this, node = this._node;

    // recalculate matrix only if it is dirty
    if (node.dirty) {
        var locQuad = _t._quad, locParent = node._parent;
        // If it is not visible, or one of its ancestors is not visible, then do nothing:
        if (!node._visible || ( locParent && locParent != node._batchNode && locParent._shouldBeHidden)) {
            locQuad.br.vertices = locQuad.tl.vertices = locQuad.tr.vertices = locQuad.bl.vertices = {x: 0, y: 0, z: 0};
            node._shouldBeHidden = true;
        } else {
            node._shouldBeHidden = false;

            if (!locParent || locParent == node._batchNode) {
                node._transformToBatch = _t.getNodeToParentTransform();
            } else {
                //cc.assert(_t._parent instanceof cc.Sprite, "Logic error in CCSprite. Parent must be a CCSprite");
                node._transformToBatch = cc.affineTransformConcat(_t.getNodeToParentTransform(), locParent._transformToBatch);
            }

            //
            // calculate the Quad based on the Affine Matrix
            //
            var locTransformToBatch = node._transformToBatch;
            var rect = node._rect;
            var x1 = node._offsetPosition.x;
            var y1 = node._offsetPosition.y;

            var x2 = x1 + rect.width;
            var y2 = y1 + rect.height;
            var x = locTransformToBatch.tx;
            var y = locTransformToBatch.ty;

            var cr = locTransformToBatch.a;
            var sr = locTransformToBatch.b;
            var cr2 = locTransformToBatch.d;
            var sr2 = -locTransformToBatch.c;
            var ax = x1 * cr - y1 * sr2 + x;
            var ay = x1 * sr + y1 * cr2 + y;

            var bx = x2 * cr - y1 * sr2 + x;
            var by = x2 * sr + y1 * cr2 + y;

            var cx = x2 * cr - y2 * sr2 + x;
            var cy = x2 * sr + y2 * cr2 + y;

            var dx = x1 * cr - y2 * sr2 + x;
            var dy = x1 * sr + y2 * cr2 + y;

            var locVertexZ = _t._vertexZ;
            if(!cc.SPRITEBATCHNODE_RENDER_SUBPIXEL) {
                ax = 0 | ax;
                ay = 0 | ay;
                bx = 0 | bx;
                by = 0 | by;
                cx = 0 | cx;
                cy = 0 | cy;
                dx = 0 | dx;
                dy = 0 | dy;
            }
            locQuad.bl.vertices = {x: ax, y: ay, z: locVertexZ};
            locQuad.br.vertices = {x: bx, y: by, z: locVertexZ};
            locQuad.tl.vertices = {x: dx, y: dy, z: locVertexZ};
            locQuad.tr.vertices = {x: cx, y: cy, z: locVertexZ};
        }
        node.textureAtlas.updateQuad(locQuad, _t.atlasIndex);
        node._recursiveDirty = false;
        node.dirty = false;
    }

    // recursively iterate over children
    if (node._hasChildren)
        node._arrayMakeObjectsPerformSelector(_t._children, cc.Node._stateCallbackType.updateTransform);

    if (cc.SPRITE_DEBUG_DRAW) {
        // draw bounding box
        var vertices = [
            cc.p(_t._quad.bl.vertices.x, _t._quad.bl.vertices.y),
            cc.p(_t._quad.br.vertices.x, _t._quad.br.vertices.y),
            cc.p(_t._quad.tr.vertices.x, _t._quad.tr.vertices.y),
            cc.p(_t._quad.tl.vertices.x, _t._quad.tl.vertices.y)
        ];
        cc._drawingUtil.drawPoly(vertices, 4, true);
    }
};

cc.Sprite.WebGLRenderCmd.prototype._checkTextureBoundary = function(texture, rect, rotated){
    if(texture && texture.url) {
        var _x, _y;
        if(rotated){
            _x = rect.x + rect.height;
            _y = rect.y + rect.width;
        }else{
            _x = rect.x + rect.width;
            _y = rect.y + rect.height;
        }
        if(_x > texture.width){
            cc.error(cc._LogInfos.RectWidth, texture.url);
        }
        if(_y > texture.height){
            cc.error(cc._LogInfos.RectHeight, texture.url);
        }
    }
};

cc.Sprite.WebGLRenderCmd.prototype.rendering = function (ctx) {
    var _t = this._node;
    if (!_t._textureLoaded || this._displayedOpacity === 0)
        return;

    var gl = ctx || cc._renderContext, locTexture = _t._texture;
    //cc.assert(!_t._batchNode, "If cc.Sprite is being rendered by cc.SpriteBatchNode, cc.Sprite#draw SHOULD NOT be called");

    if (locTexture) {
        if (locTexture._isLoaded) {
            _t._shaderProgram.use();
            _t._shaderProgram._setUniformForMVPMatrixWithMat4(this._stackMatrix);

            cc.glBlendFunc(_t._blendFunc.src, _t._blendFunc.dst);
            //optimize performance for javascript
            cc.glBindTexture2DN(0, locTexture);                   // = cc.glBindTexture2D(locTexture);
            cc.glEnableVertexAttribs(cc.VERTEX_ATTRIB_FLAG_POS_COLOR_TEX);

            gl.bindBuffer(gl.ARRAY_BUFFER, _t._quadWebBuffer);
            if (this._quadDirty) {
                gl.bufferData(gl.ARRAY_BUFFER, this._quad.arrayBuffer, gl.DYNAMIC_DRAW);
                this._quadDirty = false;
            }
            gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 24, 0);                   //cc.VERTEX_ATTRIB_POSITION
            gl.vertexAttribPointer(1, 4, gl.UNSIGNED_BYTE, true, 24, 12);           //cc.VERTEX_ATTRIB_COLOR
            gl.vertexAttribPointer(2, 2, gl.FLOAT, false, 24, 16);                  //cc.VERTEX_ATTRIB_TEX_COORDS
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        }
    } else {
        _t._shaderProgram.use();
        _t._shaderProgram._setUniformForMVPMatrixWithMat4(_t._stackMatrix);

        cc.glBlendFunc(_t._blendFunc.src, _t._blendFunc.dst);
        cc.glBindTexture2D(null);

        cc.glEnableVertexAttribs(cc.VERTEX_ATTRIB_FLAG_POSITION | cc.VERTEX_ATTRIB_FLAG_COLOR);

        gl.bindBuffer(gl.ARRAY_BUFFER, _t._quadWebBuffer);
        if (_t._quadDirty) {
            gl.bufferData(gl.ARRAY_BUFFER, _t._quad.arrayBuffer, gl.STATIC_DRAW);
            _t._quadDirty = false;
        }
        gl.vertexAttribPointer(cc.VERTEX_ATTRIB_POSITION, 3, gl.FLOAT, false, 24, 0);
        gl.vertexAttribPointer(cc.VERTEX_ATTRIB_COLOR, 4, gl.UNSIGNED_BYTE, true, 24, 12);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
    cc.g_NumberOfDraws++;

    if (cc.SPRITE_DEBUG_DRAW === 0 && !_t._showNode)
        return;

    if (cc.SPRITE_DEBUG_DRAW === 1 || _t._showNode) {
        // draw bounding box
        var locQuad = _t._quad;
        var verticesG1 = [
            cc.p(locQuad.tl.vertices.x, locQuad.tl.vertices.y),
            cc.p(locQuad.bl.vertices.x, locQuad.bl.vertices.y),
            cc.p(locQuad.br.vertices.x, locQuad.br.vertices.y),
            cc.p(locQuad.tr.vertices.x, locQuad.tr.vertices.y)
        ];
        cc._drawingUtil.drawPoly(verticesG1, 4, true);
    } else if (cc.SPRITE_DEBUG_DRAW === 2) {
        // draw texture box
        var drawRectG2 = _t.getTextureRect();
        var offsetPixG2 = _t.getOffsetPosition();
        var verticesG2 = [cc.p(offsetPixG2.x, offsetPixG2.y), cc.p(offsetPixG2.x + drawRectG2.width, offsetPixG2.y),
            cc.p(offsetPixG2.x + drawRectG2.width, offsetPixG2.y + drawRectG2.height), cc.p(offsetPixG2.x, offsetPixG2.y + drawRectG2.height)];
        cc._drawingUtil.drawPoly(verticesG2, 4, true);
    } // CC_SPRITE_DEBUG_DRAW
};