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

(function() {
    if(!cc.Node.WebGLRenderCmd)
        return;
    ccui.Scale9Sprite.WebGLRenderCmd = function (renderable) {
        cc.Node.WebGLRenderCmd.call(this, renderable);
        this._cachedParent = null;
        this._cacheDirty = false;
    };

    var proto = ccui.Scale9Sprite.WebGLRenderCmd.prototype = Object.create(cc.Node.WebGLRenderCmd.prototype);
    proto.constructor = ccui.Scale9Sprite.WebGLRenderCmd;

    proto.setShaderProgram = function (shaderProgram) {
        var node = this._node;
        if (node._scale9Enabled) {
            var renderers = node._renderers, l = renderers.length;
            for (var i = 0; i < l; i++) {
                if (renderers[i]) {
                    renderers[i]._renderCmd._shaderProgram = shaderProgram;
                }
            }
        }
        else {
            node._scale9Image._renderCmd._shaderProgram = shaderProgram;
        }
        this._shaderProgram = shaderProgram;
    };

    proto.visit = function(parentCmd) {
        var node = this._node;
        if (!node._visible)
            return;
        if (!node._scale9Image)
            return;

        if (node._positionsAreDirty) {
            node._updatePositions();
            node._positionsAreDirty = false;
        }

        parentCmd = parentCmd || this.getParentRenderCmd();
        if (node._parent && node._parent._renderCmd)
            this._curLevel = node._parent._renderCmd._curLevel + 1;

        this._syncStatus(parentCmd);

        if (node._scale9Enabled) {
            var locRenderers = node._renderers;
            var rendererLen = locRenderers.length;
            for (var j=0; j < rendererLen; j++) {
                var renderer = locRenderers[j];
                if (renderer) {
                    var tempCmd = renderer._renderCmd;
                    tempCmd.visit(this);
                }
                else
                    break;
            }
        }
        else {
            node._adjustScale9ImageScale();
            node._adjustScale9ImagePosition();
            node._scale9Image._renderCmd.visit(this);
        }
        this._dirtyFlag = 0;
        this.originVisit(parentCmd);
    };

    proto.transform = function(parentCmd, recursive){
        var node = this._node;
        parentCmd = parentCmd || this.getParentRenderCmd();
        this.originTransform(parentCmd, recursive);
        if (node._positionsAreDirty) {
            node._updatePositions();
            node._positionsAreDirty = false;
        }
        if(node._scale9Enabled) {
            var locRenderers = node._renderers;
            var protectChildLen = locRenderers.length;
            var flags = cc.Node._dirtyFlags;
            for(var j=0; j < protectChildLen; j++) {
                var pchild = locRenderers[j];
                if(pchild) {
                    pchild._vertexZ = parentCmd._node._vertexZ;
                    var tempCmd = pchild._renderCmd;
                    tempCmd.transform(this, true);
                    tempCmd._dirtyFlag = tempCmd._dirtyFlag & flags.transformDirty ^ tempCmd._dirtyFlag;
                }
                else {
                    break;
                }
            }
        }
        else {
            node._adjustScale9ImageScale();
            node._adjustScale9ImagePosition();
            node._scale9Image._renderCmd.transform(this, true);
        }
    };

    proto.setDirtyFlag = function (dirtyFlag, child) {
        // ignore cache dirty, it's only for canvas
        if (dirtyFlag === cc.Node._dirtyFlags.cacheDirty)
            dirtyFlag = cc.Node._dirtyFlags.transformDirty;
        cc.Node.RenderCmd.prototype.setDirtyFlag.call(this, dirtyFlag, child);
    };

    proto._syncStatus = function (parentCmd){
        cc.Node.WebGLRenderCmd.prototype._syncStatus.call(this, parentCmd);
        this._updateDisplayColor(this._displayedColor);
        this._updateDisplayOpacity(this._displayedOpacity);
    };

    proto._updateDisplayColor = function(parentColor){
        cc.Node.WebGLRenderCmd.prototype._updateDisplayColor.call(this, parentColor);
        var node = this._node;
        var scale9Image = node._scale9Image;
        parentColor = this._displayedColor;
        if(node._scale9Enabled) {
            var pChildren = node._renderers;
            for(var i=0; i<pChildren.length; i++) {
                pChildren[i]._renderCmd._updateDisplayColor(parentColor);
                pChildren[i]._renderCmd._updateColor();
            }
        }
        else {
            scale9Image._renderCmd._updateDisplayColor(parentColor);
            scale9Image._renderCmd._updateColor();
        }
    };

    proto._updateDisplayOpacity = function(parentOpacity){
        cc.Node.WebGLRenderCmd.prototype._updateDisplayOpacity.call(this, parentOpacity);
        var node = this._node;
        var scale9Image = node._scale9Image;
        parentOpacity = this._displayedOpacity;
        if(node._scale9Enabled) {
            var pChildren = node._renderers;
            for(var i=0; i<pChildren.length; i++)
            {
                pChildren[i]._renderCmd._updateDisplayOpacity(parentOpacity);
                pChildren[i]._renderCmd._updateColor();
            }
        }
        else
        {
            scale9Image._renderCmd._updateDisplayOpacity(parentOpacity);
            scale9Image._renderCmd._updateColor();
        }
    };

    proto.setState = function (state) {
        if (state === ccui.Scale9Sprite.state.NORMAL) {
            this.setShaderProgram(cc.shaderCache.programForKey(cc.SHADER_SPRITE_POSITION_TEXTURECOLOR));
        }
        else if (state === ccui.Scale9Sprite.state.GRAY) {
            this.setShaderProgram(ccui.Scale9Sprite.WebGLRenderCmd._getGrayShaderProgram());
        }
    };

    ccui.Scale9Sprite.WebGLRenderCmd._grayShaderProgram = null;
    ccui.Scale9Sprite.WebGLRenderCmd._getGrayShaderProgram = function(){
        var grayShader = ccui.Scale9Sprite.WebGLRenderCmd._grayShaderProgram;
        if(grayShader)
            return grayShader;

        grayShader = new cc.GLProgram();
        grayShader.initWithVertexShaderByteArray(cc.SHADER_SPRITE_POSITION_TEXTURE_COLOR_VERT, ccui.Scale9Sprite.WebGLRenderCmd._grayShaderFragment);
        grayShader.addAttribute(cc.ATTRIBUTE_NAME_POSITION, cc.VERTEX_ATTRIB_POSITION);
        grayShader.addAttribute(cc.ATTRIBUTE_NAME_COLOR, cc.VERTEX_ATTRIB_COLOR);
        grayShader.addAttribute(cc.ATTRIBUTE_NAME_TEX_COORD, cc.VERTEX_ATTRIB_TEX_COORDS);
        grayShader.link();
        grayShader.updateUniforms();

        ccui.Scale9Sprite.WebGLRenderCmd._grayShaderProgram = grayShader;
        return grayShader;
    };

    ccui.Scale9Sprite.WebGLRenderCmd._grayShaderFragment =
        "precision lowp float;\n"
        + "varying vec4 v_fragmentColor; \n"
        + "varying vec2 v_texCoord; \n"
        + "void main() \n"
        + "{ \n"
        + "    vec4 c = texture2D(CC_Texture0, v_texCoord); \n"
        + "    gl_FragColor.xyz = vec3(0.2126*c.r + 0.7152*c.g + 0.0722*c.b); \n"
        +"     gl_FragColor.w = c.w ; \n"
        + "}";
})();
