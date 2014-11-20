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

/**
 * cc.AtlasNode's rendering objects of Canvas
 */
(function(){
    cc.AtlasNode.CanvasRenderCmd = function(renderableObject){
        cc.Node.WebGLRenderCmd.call(this, renderableObject);
        this._needDraw = true;
    };

    var proto = cc.AtlasNode.CanvasRenderCmd.prototype = Object.create(cc.Node.CanvasRenderCmd.prototype);
    proto.constructor = cc.AtlasNode.CanvasRenderCmd;

    proto.initWithTexture = function(texture, tileWidth, tileHeight, itemsToRender){
        var node = this._node;
        node._itemWidth = tileWidth;
        node._itemHeight = tileHeight;

        node._opacityModifyRGB = true;
        node._originalTexture = texture;
        if (!node._originalTexture) {
            cc.log(cc._LogInfos.AtlasNode__initWithTexture);
            return false;
        }
        node._textureForCanvas = node._originalTexture;
        node._calculateMaxItems();

        node.quadsToDraw = itemsToRender;
        return true;
    };

    proto.draw = cc.Node.prototype.draw;

    proto.setColor = function(color3){
        var node = this;
        var locRealColor = node._realColor;
        if ((locRealColor.r == color3.r) && (locRealColor.g == color3.g) && (locRealColor.b == color3.b))
            return;
        var temp = cc.color(color3.r, color3.g, color3.b);
        this._colorUnmodified = color3;

        if (node._opacityModifyRGB) {
            var locDisplayedOpacity = node._displayedOpacity;
            temp.r = temp.r * locDisplayedOpacity / 255;
            temp.g = temp.g * locDisplayedOpacity / 255;
            temp.b = temp.b * locDisplayedOpacity / 255;
        }
//        cc.Node.prototype.setColor.call(this, color3);
        this._changeTextureColor();
    };

    if(cc.sys._supportCanvasNewBlendModes)
        proto._changeTextureColor = function(){
            var node = this._node;
            var locTexture = node.getTexture();
            if (locTexture && node._originalTexture) {
                var element = node._originalTexture.getHtmlElementObj();
                if(!element)
                    return;
                var locElement = locTexture.getHtmlElementObj();
                var textureRect = cc.rect(0, 0, element.width, element.height);
                if (locElement instanceof HTMLCanvasElement)
                    cc.Sprite.CanvasRenderCmd._generateTintImageWithMultiply(element, node._colorUnmodified, textureRect, locElement);
                else {
                    locElement = cc.Sprite.CanvasRenderCmd._generateTintImageWithMultiply(element, node._colorUnmodified, textureRect);
                    locTexture = new cc.Texture2D();
                    locTexture.initWithElement(locElement);
                    locTexture.handleLoadedTexture();
                    node.setTexture(locTexture);
                }
            }
        };
    else
        proto._changeTextureColor = function(){
            var node = this._node;
            var locElement, locTexture = node.getTexture();
            if (locTexture && node._originalTexture) {
                locElement = locTexture.getHtmlElementObj();
                if (!locElement)
                    return;
                var element = node._originalTexture.getHtmlElementObj();
                var cacheTextureForColor = cc.textureCache.getTextureColors(element);
                if (cacheTextureForColor) {
                    var textureRect = cc.rect(0, 0, element.width, element.height);
                    if (locElement instanceof HTMLCanvasElement)
                        cc.Sprite.CanvasRenderCmd._generateTintImage(locElement, cacheTextureForColor, node._displayedColor, textureRect, locElement);
                    else {
                        locElement = cc.Sprite.CanvasRenderCmd._generateTintImage(locElement, cacheTextureForColor, node._displayedColor, textureRect);
                        locTexture = new cc.Texture2D();
                        locTexture.initWithElement(locElement);
                        locTexture.handleLoadedTexture();
                        node.setTexture(locTexture);
                    }
                }
            }
        };

    proto.setOpacity = function(opacity){
        var node = this._node;
        cc.Node.prototype.setOpacity.call(node, opacity);
        // special opacity for premultiplied textures
        if (node._opacityModifyRGB) {
            node.color = node._colorUnmodified;
        }
    };

    proto.getTexture = function(){
        return this._node._textureForCanvas;
    };

    proto.setTexture = function (texture) {
        this._node._textureForCanvas = texture;
    };

    proto._calculateMaxItems = function(){
        var node = this._node;
        var selTexture = node.texture;
        var size = selTexture.getContentSize();

        node._itemsPerColumn = 0 | (size.height / node._itemHeight);
        node._itemsPerRow = 0 | (size.width / node._itemWidth);
    };
})();

/**
 * cc.AtlasNode's rendering objects of Canvas
 */
(function(){
    cc.AtlasNode.WebGLRenderCmd = function(renderableObject){
        cc.Node.WebGLRenderCmd.call(this, renderableObject);
        this._needDraw = true;
    };

    var proto = cc.AtlasNode.WebGLRenderCmd.prototype = Object.create(cc.Node.WebGLRenderCmd.prototype);
    proto.constructor = cc.AtlasNode.WebGLRenderCmd;

    proto.rendering = function (ctx) {
        var context = ctx || cc._renderContext, node = this._node;

        node._shaderProgram.use();
        node._shaderProgram._setUniformForMVPMatrixWithMat4(node._stackMatrix);

        cc.glBlendFunc(node._blendFunc.src, node._blendFunc.dst);
        if (node._uniformColor && node._colorF32Array) {
            context.uniform4fv(node._uniformColor, node._colorF32Array);
            node.textureAtlas.drawNumberOfQuads(node.quadsToDraw, 0);
        }
    };

    proto.initWithTexture = function(texture, tileWidth, tileHeight, itemsToRender){
        var node = this._node;
        node._itemWidth = tileWidth;
        node._itemHeight = tileHeight;
        node._colorUnmodified = cc.color.WHITE;
        node._opacityModifyRGB = true;

        node._blendFunc.src = cc.BLEND_SRC;
        node._blendFunc.dst = cc.BLEND_DST;

        var locRealColor = node._realColor;
        node._colorF32Array = new Float32Array([locRealColor.r / 255.0, locRealColor.g / 255.0, locRealColor.b / 255.0, node._realOpacity / 255.0]);
        node.textureAtlas = new cc.TextureAtlas();
        node.textureAtlas.initWithTexture(texture, itemsToRender);

        if (!node.textureAtlas) {
            cc.log(cc._LogInfos.AtlasNode__initWithTexture);
            return false;
        }

        node._updateBlendFunc();
        node._updateOpacityModifyRGB();
        node._calculateMaxItems();
        node.quadsToDraw = itemsToRender;

        //shader stuff
        node.shaderProgram = cc.shaderCache.programForKey(cc.SHADER_POSITION_TEXTURE_UCOLOR);
        node._uniformColor = cc._renderContext.getUniformLocation(node.shaderProgram.getProgram(), "u_color");
        return true;
    };

    proto.draw = function(ctx){
        var context = ctx || cc._renderContext;
        cc.nodeDrawSetup(this);
        cc.glBlendFunc(this._blendFunc.src, this._blendFunc.dst);
        if(this._uniformColor && this._colorF32Array){
            context.uniform4fv(this._uniformColor, this._colorF32Array);
            this.textureAtlas.drawNumberOfQuads(this.quadsToDraw, 0);
        }
    };

    proto.setColor = function(color3){
        var temp = cc.color(color3.r, color3.g, color3.b);
        this._colorUnmodified = color3;
        var locDisplayedOpacity = this._displayedOpacity;
        if (this._opacityModifyRGB) {
            temp.r = temp.r * locDisplayedOpacity / 255;
            temp.g = temp.g * locDisplayedOpacity / 255;
            temp.b = temp.b * locDisplayedOpacity / 255;
        }
        cc.Node.prototype.setColor.call(this, color3);
        var locDisplayedColor = this._displayedColor;
        this._colorF32Array = new Float32Array([locDisplayedColor.r / 255.0, locDisplayedColor.g / 255.0,
                locDisplayedColor.b / 255.0, locDisplayedOpacity / 255.0]);
    };

    proto.setOpacity = function(opacity){
        var node = this._node;
        cc.Node.prototype.setOpacity.call(node, opacity);
        // special opacity for premultiplied textures
        if (node._opacityModifyRGB) {
            node.color = node._colorUnmodified;
        } else {
            var locDisplayedColor = node._displayedColor;
            node._colorF32Array = new Float32Array([locDisplayedColor.r / 255.0, locDisplayedColor.g / 255.0,
                    locDisplayedColor.b / 255.0, node._displayedOpacity / 255.0]);
        }
    };

    proto.getTexture = function(){
        return this._node.textureAtlas.texture;
    };

    proto.setTexture = function(texture){
        var node = this._node;
        node.textureAtlas.texture = texture;
        node._updateBlendFunc();
        node._updateOpacityModifyRGB();
    };

    proto._calculateMaxItems = function(){
        var node = this._node;
        var selTexture = node.texture;
        var size = selTexture.getContentSize();
        if (node._ignoreContentScaleFactor)
            size = selTexture.getContentSizeInPixels();

        node._itemsPerColumn = 0 | (size.height / node._itemHeight);
        node._itemsPerRow = 0 | (size.width / node._itemWidth);
    };
})();