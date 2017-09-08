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

//Sprite's WebGL render command
(function () {

    cc.Sprite.WebGLRenderCmd = function (renderable) {
        this._rootCtor(renderable);
        this._needDraw = true;

        this._vertices = [
            {x: 0, y: 0, u: 0, v: 0}, // tl
            {x: 0, y: 0, u: 0, v: 0}, // bl
            {x: 0, y: 0, u: 0, v: 0}, // tr
            {x: 0, y: 0, u: 0, v: 0}  // br
        ];
        this._color = new Uint32Array(1);
        this._dirty = false;
        this._recursiveDirty = false;

        this._shaderProgram = cc.shaderCache.programForKey(cc.SHADER_SPRITE_POSITION_TEXTURECOLOR);
    };

    var proto = cc.Sprite.WebGLRenderCmd.prototype = Object.create(cc.Node.WebGLRenderCmd.prototype);
    proto.constructor = cc.Sprite.WebGLRenderCmd;
    proto._spriteCmdCtor = cc.Sprite.WebGLRenderCmd;

    proto.updateBlendFunc = function (blendFunc) {
    };

    proto.setDirtyFlag = function (dirtyFlag) {
        cc.Node.WebGLRenderCmd.prototype.setDirtyFlag.call(this, dirtyFlag);
        this._dirty = true;
    };

    proto.setDirtyRecursively = function (value) {
        this._recursiveDirty = value;
        this._dirty = value;
        // recursively set dirty
        var locChildren = this._node._children, child, l = locChildren ? locChildren.length : 0;
        for (var i = 0; i < l; i++) {
            child = locChildren[i];
            (child instanceof cc.Sprite) && child._renderCmd.setDirtyRecursively(value);
        }
    };

    proto._setBatchNodeForAddChild = function (child) {
        var node = this._node;
        if (node._batchNode) {
            if (!(child instanceof cc.Sprite)) {
                cc.log(cc._LogInfos.Sprite_addChild);
                return false;
            }
            if (child.texture._webTextureObj !== node.textureAtlas.texture._webTextureObj)
                cc.log(cc._LogInfos.Sprite_addChild_2);

            //put it in descendants array of batch node
            node._batchNode.appendChild(child);
            if (!node._reorderChildDirty)
                node._setReorderChildDirtyRecursively();
        }
        return true;
    };

    proto._handleTextureForRotatedTexture = function (texture) {
        return texture;
    };

    proto.isFrameDisplayed = function (frame) {
        var node = this._node;
        return (cc.rectEqualToRect(frame.getRect(), node._rect) && frame.getTexture().getName() === node._texture.getName()
        && cc.pointEqualToPoint(frame.getOffset(), node._unflippedOffsetPositionFromCenter));
    };

    proto._textureLoadedCallback = function (sender) {
        if (this._textureLoaded)
            return;

        this._textureLoaded = true;
        var locRect = this._rect;
        if (!locRect) {
            locRect = cc.rect(0, 0, sender.width, sender.height);
        } else if (cc._rectEqualToZero(locRect)) {
            locRect.width = sender.width;
            locRect.height = sender.height;
        }

        this.texture = sender;
        this.setTextureRect(locRect, this._rectRotated);

        // by default use "Self Render".
        // if the sprite is added to a batchnode, then it will automatically switch to "batchnode Render"
        this.setBatchNode(this._batchNode);
        this.dispatchEvent("load");

        // Force refresh the render command list
        cc.renderer.childrenOrderDirty = true;
    };

    proto._setTextureCoords = function (rect, needConvert) {
        if (needConvert === undefined)
            needConvert = true;
        if (needConvert)
            rect = cc.rectPointsToPixels(rect);
        var node = this._node;

        var tex = node._batchNode ? node.textureAtlas.texture : node._texture;
        var uvs = this._vertices;
        if (!tex)
            return;

        var atlasWidth = tex.pixelsWidth;
        var atlasHeight = tex.pixelsHeight;

        var left, right, top, bottom, tempSwap;
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

            uvs[0].u = right;  // tl
            uvs[0].v = top;    // tl
            uvs[1].u = left;   // bl
            uvs[1].v = top;    // bl
            uvs[2].u = right;  // tr
            uvs[2].v = bottom; // tr
            uvs[3].u = left;   // br
            uvs[3].v = bottom; // br
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

            uvs[0].u = left;   // tl
            uvs[0].v = top;    // tl
            uvs[1].u = left;   // bl
            uvs[1].v = bottom; // bl
            uvs[2].u = right;  // tr
            uvs[2].v = top;    // tr
            uvs[3].u = right;  // br
            uvs[3].v = bottom; // br
        }
    };

    proto._setColorDirty = function () {
    };

    proto._updateBlendFunc = function () {
        if (this._batchNode) {
            cc.log(cc._LogInfos.Sprite__updateBlendFunc);
            return;
        }

        // it's possible to have an untextured sprite
        var node = this._node,
            blendFunc = node._blendFunc;
        if (!node._texture || !node._texture.hasPremultipliedAlpha()) {
            if (blendFunc.src === cc.ONE && blendFunc.dst === cc.BLEND_DST) {
                blendFunc.src = cc.SRC_ALPHA;
            }
            node.opacityModifyRGB = false;
        } else {
            if (blendFunc.src === cc.SRC_ALPHA && blendFunc.dst === cc.BLEND_DST) {
                blendFunc.src = cc.ONE;
            }
            node.opacityModifyRGB = true;
        }
    };

    proto._setTexture = function (texture) {
        var node = this._node;
        if (node._texture !== texture) {
            node._textureLoaded = texture ? texture._textureLoaded : false;
            node._texture = texture;

            // Update texture rect and blend func
            if (texture) {
                var texSize = texture._contentSize;
                var rect = cc.rect(0, 0, texSize.width, texSize.height);
                node.setTextureRect(rect);
                this._updateBlendFunc();
            }

            if (node._textureLoaded) {
                // Force refresh the render command list
                cc.renderer.childrenOrderDirty = true;
            }
        }
    };

    proto._checkTextureBoundary = function (texture, rect, rotated) {
        if (texture && texture.url) {
            var _x, _y;
            if (rotated) {
                _x = rect.x + rect.height;
                _y = rect.y + rect.width;
            } else {
                _x = rect.x + rect.width;
                _y = rect.y + rect.height;
            }
            if (_x > texture.width) {
                cc.error(cc._LogInfos.RectWidth, texture.url);
            }
            if (_y > texture.height) {
                cc.error(cc._LogInfos.RectHeight, texture.url);
            }
        }
    };

    proto.transform = function (parentCmd, recursive) {
        this.originTransform(parentCmd, recursive);

        var node = this._node,
            lx = node._offsetPosition.x, rx = lx + node._rect.width,
            by = node._offsetPosition.y, ty = by + node._rect.height,
            wt = this._worldTransform,
            wtx = wt.tx, wty = wt.ty,
            lxa = lx * wt.a, lxb = lx * wt.b, rxa = rx * wt.a, rxb = rx * wt.b,
            tyc = ty * wt.c, tyd = ty * wt.d, byc = by * wt.c, byd = by * wt.d;

        var vertices = this._vertices;
        vertices[0].x = lxa + tyc + wtx; // tl
        vertices[0].y = lxb + tyd + wty;
        vertices[1].x = lxa + byc + wtx; // bl
        vertices[1].y = lxb + byd + wty;
        vertices[2].x = rxa + tyc + wtx; // tr
        vertices[2].y = rxb + tyd + wty;
        vertices[3].x = rxa + byc + wtx; // br
        vertices[3].y = rxb + byd + wty;
    };

    proto.needDraw = function () {
        var node = this._node, locTexture = node._texture;
        return (this._needDraw && locTexture);
    };

    proto.uploadData = function (f32buffer, ui32buffer, vertexDataOffset) {
        var node = this._node, locTexture = node._texture;
        if (!(locTexture && locTexture._textureLoaded && node._rect.width && node._rect.height) || !this._displayedOpacity)
            return 0;

        // Fill in vertex data with quad information (4 vertices for sprite)
        var opacity = this._displayedOpacity;
        var r = this._displayedColor.r,
            g = this._displayedColor.g,
            b = this._displayedColor.b;
        if (node._opacityModifyRGB) {
            var a = opacity / 255;
            r *= a;
            g *= a;
            b *= a;
        }
        this._color[0] = ((opacity << 24) | (b << 16) | (g << 8) | r);
        var z = node._vertexZ;

        var vertices = this._vertices;
        var i, len = vertices.length, vertex, offset = vertexDataOffset;
        for (i = 0; i < len; ++i) {
            vertex = vertices[i];
            f32buffer[offset] = vertex.x;
            f32buffer[offset + 1] = vertex.y;
            f32buffer[offset + 2] = z;
            ui32buffer[offset + 3] = this._color[0];
            f32buffer[offset + 4] = vertex.u;
            f32buffer[offset + 5] = vertex.v;
            offset += 6;
        }

        return len;
    };
})();
