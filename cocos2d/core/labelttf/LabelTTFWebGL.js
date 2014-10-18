/****************************************************************************
 Copyright (c) 2008-2010 Ricardo Quesada
 Copyright (c) 2011-2012 cocos2d-x.org
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

cc._tmp.WebGLLabelTTF = function () {

    var _p = cc.LabelTTF.prototype;

    _p.setColor = cc.Sprite.prototype.setColor;

    _p._transformForRenderer = function(){
        if (this._needUpdateTexture) {
            this._needUpdateTexture = false;
            this._updateTexture();
        }
        cc.Node.prototype._transformForRenderer.call(this);
    };

    _p._setColorsString = function () {
        this._needUpdateTexture = true;
        var locStrokeColor = this._strokeColor, locFontFillColor = this._textFillColor;
        this._shadowColorStr = "rgba(128,128,128," + this._shadowOpacity + ")";
        this._fillColorStr = "rgba(" + (0 | locFontFillColor.r) + "," + (0 | locFontFillColor.g) + "," + (0 | locFontFillColor.b) + ", 1)";
        this._strokeColorStr = "rgba(" + (0 | locStrokeColor.r) + "," + (0 | locStrokeColor.g) + "," + (0 | locStrokeColor.b) + ", 1)";
    };

    _p.updateDisplayedColor = cc.Sprite.prototype.updateDisplayedColor;

    _p.setOpacity = cc.Sprite.prototype.setOpacity;

    _p.updateDisplayedOpacity = cc.Sprite.prototype.updateDisplayedOpacity;

    _p.initWithStringAndTextDefinition = function (text, textDefinition) {
        if (!cc.Sprite.prototype.init.call(this))
            return false;

        // shader program
        this.shaderProgram = cc.shaderCache.programForKey(cc.LabelTTF._SHADER_PROGRAM);

        // prepare everything needed to render the label
        this._updateWithTextDefinition(textDefinition, false);

        // set the string
        this.string = text;

        return true;
    };

    _p.setFontFillColor = function (tintColor) {
        var locTextFillColor = this._textFillColor;
        if (locTextFillColor.r != tintColor.r || locTextFillColor.g != tintColor.g || locTextFillColor.b != tintColor.b) {
            locTextFillColor.r = tintColor.r;
            locTextFillColor.g = tintColor.g;
            locTextFillColor.b = tintColor.b;
            this._setColorsString();
            this._needUpdateTexture = true;
        }
    };

    _p.draw = function (ctx) {
        if (!this._string || this._string == "")
            return;

        var gl = ctx || cc._renderContext, locTexture = this._texture;

        if (locTexture && locTexture._isLoaded) {
            this._shaderProgram.use();
            this._shaderProgram.setUniformForModelViewAndProjectionMatrixWithMat4();

            cc.glBlendFunc(this._blendFunc.src, this._blendFunc.dst);
            cc.glBindTexture2D(locTexture);

            cc.glEnableVertexAttribs(cc.VERTEX_ATTRIB_FLAG_POS_COLOR_TEX);

            gl.bindBuffer(gl.ARRAY_BUFFER, this._quadWebBuffer);
            if (this._quadDirty) {
                gl.bufferData(gl.ARRAY_BUFFER, this._quad.arrayBuffer, gl.STATIC_DRAW);
                this._quadDirty = false;
            }
            gl.vertexAttribPointer(cc.VERTEX_ATTRIB_POSITION, 3, gl.FLOAT, false, 24, 0);
            gl.vertexAttribPointer(cc.VERTEX_ATTRIB_TEX_COORDS, 2, gl.FLOAT, false, 24, 16);
            gl.vertexAttribPointer(cc.VERTEX_ATTRIB_COLOR, 4, gl.UNSIGNED_BYTE, true, 24, 12);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        }

        if (cc.SPRITE_DEBUG_DRAW === 1) {
            // draw bounding box
            var locQuad = this._quad;
            var verticesG1 = [
                cc.p(locQuad.tl.vertices.x, locQuad.tl.vertices.y),
                cc.p(locQuad.bl.vertices.x, locQuad.bl.vertices.y),
                cc.p(locQuad.br.vertices.x, locQuad.br.vertices.y),
                cc.p(locQuad.tr.vertices.x, locQuad.tr.vertices.y)
            ];
            cc._drawingUtil.drawPoly(verticesG1, 4, true);
        } else if (cc.SPRITE_DEBUG_DRAW === 2) {
            // draw texture box
            var drawSizeG2 = this.getTextureRect();
            var offsetPixG2X = this.offsetX, offsetPixG2Y = this.offsetY;
            var verticesG2 = [cc.p(offsetPixG2X, offsetPixG2Y), cc.p(offsetPixG2X + drawSizeG2.width, offsetPixG2Y),
                cc.p(offsetPixG2X + drawSizeG2.width, offsetPixG2Y + drawSizeG2.height), cc.p(offsetPixG2X, offsetPixG2Y + drawSizeG2.height)];
            cc._drawingUtil.drawPoly(verticesG2, 4, true);
        } // CC_SPRITE_DEBUG_DRAW
        cc.g_NumberOfDraws++;
    };

    //TODO: cc.Sprite.prototype._setTextureRectForWebGL
    _p.setTextureRect = cc.Sprite.prototype.setTextureRect;
};