/****************************************************************************
 Copyright (c) 2013-2016 Chukong Technologies Inc.

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

(function() {
    if(!cc.Node.WebGLRenderCmd) return;

    ccui.Scale9Sprite.WebGLRenderCmd = function (renderable) {
        cc.Node.WebGLRenderCmd.call(this, renderable);

        this._needDraw = true;

        this._color = new Uint32Array(1);
        this._dirty = false;
        this._shaderProgram = cc.shaderCache.programForKey(cc.SHADER_SPRITE_POSITION_TEXTURECOLOR);
    };



    var Scale9Sprite = ccui.Scale9Sprite;
    var proto = ccui.Scale9Sprite.WebGLRenderCmd.prototype = Object.create(cc.Node.WebGLRenderCmd.prototype);
    proto.constructor = ccui.Scale9Sprite.WebGLRenderCmd;

    proto.needDraw = function () {
        return this._needDraw && this._node.loaded();
    };

    proto._uploadSliced = function (vertices, uvs, color, z, f32buffer, ui32buffer, offset) {
        var off;
        for (var r = 0; r < 3; ++r) {
            for (var c = 0; c < 3; ++c) {
                off = r*8 + c*2;
                // lb
                f32buffer[offset] = vertices[off];
                f32buffer[offset+1] = vertices[off+1];
                f32buffer[offset+2] = z;
                ui32buffer[offset+3] = color[0];
                f32buffer[offset+4] = uvs[off];
                f32buffer[offset+5] = uvs[off+1];
                offset += 6;
                // rb
                f32buffer[offset] = vertices[off+2];
                f32buffer[offset + 1] = vertices[off+3];
                f32buffer[offset + 2] = z;
                ui32buffer[offset + 3] = color[0];
                f32buffer[offset + 4] = uvs[off+2];
                f32buffer[offset + 5] = uvs[off+3];
                offset += 6;
                // lt
                f32buffer[offset] = vertices[off+8];
                f32buffer[offset + 1] = vertices[off+9];
                f32buffer[offset + 2] = z;
                ui32buffer[offset + 3] = color[0];
                f32buffer[offset + 4] = uvs[off+8];
                f32buffer[offset + 5] = uvs[off+9];
                offset += 6;
                // rt
                f32buffer[offset] = vertices[off+10];
                f32buffer[offset + 1] = vertices[off+11];
                f32buffer[offset + 2] = z;
                ui32buffer[offset + 3] = color[0];
                f32buffer[offset + 4] = uvs[off+10];
                f32buffer[offset + 5] = uvs[off+11];
                offset += 6;
            }
        }
        return 36;
    };

    proto.transform = function (parentCmd, recursive) {
        this.originTransform(parentCmd, recursive);
        this._node._rebuildQuads();
    };

    proto._setColorDirty = function () {
    };

    proto.uploadData = function (f32buffer, ui32buffer, vertexDataOffset){
        var node = this._node;
        if (this._displayedOpacity === 0) {
            return 0;
        }

        // Rebuild vertex data
        if (node._quadsDirty) {
            node._rebuildQuads();
        }

        // Color & z
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
        this._color[0] = ((opacity<<24) | (b<<16) | (g<<8) | r);
        var z = node._vertexZ;

        // Upload data
        var vertices = node._vertices;
        var uvs = node._uvs;
        var types = Scale9Sprite.RenderingType;
        var offset = vertexDataOffset;
        var len = 0;
        switch (node._renderingType) {
          case types.SIMPLE:
              // Inline for performance
              len = this._node._vertCount;
              for (var i = 0, srcOff = 0; i < len; i++, srcOff += 2) {
                  f32buffer[offset] = vertices[srcOff];
                  f32buffer[offset + 1] = vertices[srcOff+1];
                  f32buffer[offset + 2] = z;
                  ui32buffer[offset + 3] = this._color[0];
                  f32buffer[offset + 4] = uvs[srcOff];
                  f32buffer[offset + 5] = uvs[srcOff+1];
                  offset += 6;
              }
              break;
          case types.SLICED:
              len = this._uploadSliced(vertices, uvs, this._color, z, f32buffer, ui32buffer, offset);
              break;
        }
        return len;
    };

    proto.setState = function (state) {
        if (state === Scale9Sprite.state.NORMAL) {
            this._shaderProgram = cc.shaderCache.programForKey(cc.SHADER_SPRITE_POSITION_TEXTURECOLOR);
        } else if (state === Scale9Sprite.state.GRAY) {
            this._shaderProgram = cc.shaderCache.programForKey(cc.SHADER_SPRITE_POSITION_TEXTURECOLOR_GRAY);
        }
    };


})();
