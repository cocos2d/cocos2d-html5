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

cc._currentProjectionMatrix = -1;

if (cc.ENABLE_GL_STATE_CACHE) {
    cc.MAX_ACTIVETEXTURE = 16;

    cc._currentShaderProgram = -1;
    cc._currentBoundTexture = [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1];
    cc._blendingSource = -1;
    cc._blendingDest = -1;
    cc._GLServerState = 0;
    if(cc.TEXTURE_ATLAS_USE_VAO)
        cc._uVAO = 0;

    var _currBuffers = {};
    var _currBuffer;

    WebGLRenderingContext.prototype.glBindBuffer = WebGLRenderingContext.prototype.bindBuffer;
    WebGLRenderingContext.prototype.bindBuffer = function (target, buffer) {
        if (_currBuffers[target] !== buffer) {
            _currBuffers[target] = buffer;
            this.glBindBuffer(target, buffer);
        }

        if (!_currBuffer || _currBuffer !== buffer) {
            _currBuffer = buffer;
            return false;
        }
        else {
            return true;
        }
    };

    WebGLRenderingContext.prototype.glEnableVertexAttribArray = WebGLRenderingContext.prototype.enableVertexAttribArray;
    WebGLRenderingContext.prototype.enableVertexAttribArray = function (index) {
        if (index === cc.VERTEX_ATTRIB_FLAG_POSITION) {
            if (!this._vertexAttribPosition) {
                this.glEnableVertexAttribArray(index);
                this._vertexAttribPosition = true;
            }
        }
        else if (index === cc.VERTEX_ATTRIB_FLAG_COLOR) {
            if (!this._vertexAttribColor) {
                this.glEnableVertexAttribArray(index);
                this._vertexAttribColor = true;
            }
        }
        else if (index === cc.VERTEX_ATTRIB_FLAG_TEX_COORDS) {
            if (!this._vertexAttribTexCoords) {
                this.glEnableVertexAttribArray(index);
                this._vertexAttribTexCoords = true;
            }
        }
        else {
            this.glEnableVertexAttribArray(index);
        }
    };

    WebGLRenderingContext.prototype.glDisableVertexAttribArray = WebGLRenderingContext.prototype.disableVertexAttribArray;
    WebGLRenderingContext.prototype.disableVertexAttribArray = function (index) {
        if (index === cc.VERTEX_ATTRIB_FLAG_COLOR) {
            if (this._vertexAttribColor) {
                this.glDisableVertexAttribArray(index);
                this._vertexAttribColor = false;
            }
        }
        else if (index === cc.VERTEX_ATTRIB_FLAG_TEX_COORDS) {
            if (this._vertexAttribTexCoords) {
                this.glDisableVertexAttribArray(index);
                this._vertexAttribTexCoords = false;
            }
        }
        else if (index !== 0) {
            this.glDisableVertexAttribArray(index);
        }
    };
}

// GL State Cache functions

/**
 * Invalidates the GL state cache.<br/>
 * If CC_ENABLE_GL_STATE_CACHE it will reset the GL state cache.
 * @function
 */
cc.glInvalidateStateCache = function () {
    cc.kmGLFreeAll();
    cc._currentProjectionMatrix = -1;
    if (cc.ENABLE_GL_STATE_CACHE) {
        cc._currentShaderProgram = -1;
        for (var i = 0; i < cc.MAX_ACTIVETEXTURE; i++) {
            cc._currentBoundTexture[i] = -1;
        }
        cc._blendingSource = -1;
        cc._blendingDest = -1;
        cc._GLServerState = 0;
    }
};

/**
 * Uses the GL program in case program is different than the current one.<br/>
 * If CC_ENABLE_GL_STATE_CACHE is disabled, it will the glUseProgram() directly.
 * @function
 * @param {WebGLProgram} program
 */
cc.glUseProgram = function (program) {
    if (program !== cc._currentShaderProgram) {
        cc._currentShaderProgram = program;
        cc._renderContext.useProgram(program);
    }
};

if(!cc.ENABLE_GL_STATE_CACHE){
    cc.glUseProgram = function (program) {
        cc._renderContext.useProgram(program);
    };
}

/**
 * Deletes the GL program. If it is the one that is being used, it invalidates it.<br/>
 * If CC_ENABLE_GL_STATE_CACHE is disabled, it will the glDeleteProgram() directly.
 * @function
 * @param {WebGLProgram} program
 */
cc.glDeleteProgram = function (program) {
    if (cc.ENABLE_GL_STATE_CACHE) {
        if (program === cc._currentShaderProgram)
            cc._currentShaderProgram = -1;
    }
    gl.deleteProgram(program);
};

/**
 * Uses a blending function in case it not already used.<br/>
 * If CC_ENABLE_GL_STATE_CACHE is disabled, it will the glBlendFunc() directly.
 * @function
 * @param {Number} sfactor
 * @param {Number} dfactor
 */
cc.glBlendFunc = function (sfactor, dfactor) {
    if ((sfactor !== cc._blendingSource) || (dfactor !== cc._blendingDest)) {
        cc._blendingSource = sfactor;
        cc._blendingDest = dfactor;
        cc.setBlending(sfactor, dfactor);
    }
};

/**
 * @function
 * @param {Number} sfactor
 * @param {Number} dfactor
 */
cc.setBlending = function (sfactor, dfactor) {
    var ctx = cc._renderContext;
    if ((sfactor === ctx.ONE) && (dfactor === ctx.ZERO)) {
        ctx.disable(ctx.BLEND);
    } else {
        ctx.enable(ctx.BLEND);
        cc._renderContext.blendFunc(sfactor,dfactor);
        //TODO need fix for WebGL
        //ctx.blendFuncSeparate(ctx.SRC_ALPHA, dfactor, sfactor, dfactor);
    }
};

/**
 * @function
 * @param {Number} sfactor
 * @param {Number} dfactor
 */
cc.glBlendFuncForParticle = function(sfactor, dfactor) {
    if ((sfactor !== cc._blendingSource) || (dfactor !== cc._blendingDest)) {
        cc._blendingSource = sfactor;
        cc._blendingDest = dfactor;
        var ctx = cc._renderContext;
        if ((sfactor === ctx.ONE) && (dfactor === ctx.ZERO)) {
            ctx.disable(ctx.BLEND);
        } else {
            ctx.enable(ctx.BLEND);
            //TODO need fix for WebGL
            ctx.blendFuncSeparate(ctx.SRC_ALPHA, dfactor, sfactor, dfactor);
        }
    }
};

if (!cc.ENABLE_GL_STATE_CACHE) {
    cc.glBlendFunc = cc.setBlending;
}

/**
 * Resets the blending mode back to the cached state in case you used glBlendFuncSeparate() or glBlendEquation().<br/>
 * If CC_ENABLE_GL_STATE_CACHE is disabled, it will just set the default blending mode using GL_FUNC_ADD.
 * @function
 */
cc.glBlendResetToCache = function () {
    var ctx = cc._renderContext;
    ctx.blendEquation(ctx.FUNC_ADD);
    if (cc.ENABLE_GL_STATE_CACHE)
        cc.setBlending(cc._blendingSource, cc._blendingDest);
    else
        cc.setBlending(ctx.BLEND_SRC, ctx.BLEND_DST);
};

/**
 * sets the projection matrix as dirty
 * @function
 */
cc.setProjectionMatrixDirty = function () {
    cc._currentProjectionMatrix = -1;
};

/**
 * If the texture is not already bound, it binds it.<br/>
 * If CC_ENABLE_GL_STATE_CACHE is disabled, it will call glBindTexture() directly.
 * @function
 * @param {cc.Texture2D} textureId
 */
cc.glBindTexture2D = function (textureId) {
    cc.glBindTexture2DN(0, textureId);
};

/**
 * If the texture is not already bound to a given unit, it binds it.<br/>
 * If CC_ENABLE_GL_STATE_CACHE is disabled, it will call glBindTexture() directly.
 * @function
 * @param {Number} textureUnit
 * @param {cc.Texture2D} textureId
 */
cc.glBindTexture2DN = function (textureUnit, textureId) {
    if (cc._currentBoundTexture[textureUnit] === textureId)
        return;
    cc._currentBoundTexture[textureUnit] = textureId;

    var ctx = cc._renderContext;
    ctx.activeTexture(ctx.TEXTURE0 + textureUnit);
    if(textureId)
        ctx.bindTexture(ctx.TEXTURE_2D, textureId._webTextureObj);
    else
        ctx.bindTexture(ctx.TEXTURE_2D, null);
};
if (!cc.ENABLE_GL_STATE_CACHE){
    cc.glBindTexture2DN = function (textureUnit, textureId) {
        var ctx = cc._renderContext;
        ctx.activeTexture(ctx.TEXTURE0 + textureUnit);
        if(textureId)
            ctx.bindTexture(ctx.TEXTURE_2D, textureId._webTextureObj);
        else
            ctx.bindTexture(ctx.TEXTURE_2D, null);
    };
}

/**
 * It will delete a given texture. If the texture was bound, it will invalidate the cached. <br/>
 * If CC_ENABLE_GL_STATE_CACHE is disabled, it will call glDeleteTextures() directly.
 * @function
 * @param {WebGLTexture} textureId
 */
cc.glDeleteTexture = function (textureId) {
    cc.glDeleteTextureN(0, textureId);
};

/**
 * It will delete a given texture. If the texture was bound, it will invalidate the cached for the given texture unit.<br/>
 * If CC_ENABLE_GL_STATE_CACHE is disabled, it will call glDeleteTextures() directly.
 * @function
 * @param {Number} textureUnit
 * @param {WebGLTexture} textureId
 */
cc.glDeleteTextureN = function (textureUnit, textureId) {
    if (cc.ENABLE_GL_STATE_CACHE) {
        if (textureId === cc._currentBoundTexture[ textureUnit ])
            cc._currentBoundTexture[ textureUnit ] = -1;
    }
    cc._renderContext.deleteTexture(textureId);
};

/**
 * If the vertex array is not already bound, it binds it.<br/>
 * If CC_ENABLE_GL_STATE_CACHE is disabled, it will call glBindVertexArray() directly.
 * @function
 * @param {Number} vaoId
 */
cc.glBindVAO = function (vaoId) {
    if (!cc.TEXTURE_ATLAS_USE_VAO)
        return;

    if (cc.ENABLE_GL_STATE_CACHE) {
        if (cc._uVAO !== vaoId) {
            cc._uVAO = vaoId;
            //TODO need fixed
            //glBindVertexArray(vaoId);
        }
    } else {
        //glBindVertexArray(vaoId);
    }
};

/**
 * It will enable / disable the server side GL states.<br/>
 * If CC_ENABLE_GL_STATE_CACHE is disabled, it will call glEnable() directly.
 * @function
 * @param {Number} flags
 */
cc.glEnable = function (flags) {
    if (cc.ENABLE_GL_STATE_CACHE) {
        /*var enabled;

         */
        /* GL_BLEND */
        /*
         if ((enabled = (flags & cc.GL_BLEND)) != (cc._GLServerState & cc.GL_BLEND)) {
         if (enabled) {
         cc._renderContext.enable(cc._renderContext.BLEND);
         cc._GLServerState |= cc.GL_BLEND;
         } else {
         cc._renderContext.disable(cc._renderContext.BLEND);
         cc._GLServerState &= ~cc.GL_BLEND;
         }
         }*/
    } else {
        /*if ((flags & cc.GL_BLEND))
         cc._renderContext.enable(cc._renderContext.BLEND);
         else
         cc._renderContext.disable(cc._renderContext.BLEND);*/
    }
};
