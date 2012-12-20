/****************************************************************************
 Copyright (c) 2010-2012 cocos2d-x.org
 Copyright (c) 2008-2010 Ricardo Quesada
 Copyright (c) 2011      Zynga Inc.

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

/** vertex attrib flags */
cc.kCCVertexAttribFlag_None = 0;

cc.kCCVertexAttribFlag_Position = 1 << 0;

cc.kCCVertexAttribFlag_Color = 1 << 1;

cc.kCCVertexAttribFlag_TexCoords = 1 << 2;

cc.kCCVertexAttribFlag_PosColorTex = ( cc.kCCVertexAttribFlag_Position | cc.kCCVertexAttribFlag_Color | cc.kCCVertexAttribFlag_TexCoords );

/** GL server side states */
cc.GL_BLEND = 1 << 3;

cc.GL_ALL = cc.GL_BLEND;

cc.s_uCurrentProjectionMatrix = -1;
cc.s_bVertexAttribPosition = false;
cc.s_bVertexAttribColor = false;
cc.s_bVertexAttribTexCoords = false;

if (cc.ENABLE_GL_STATE_CACHE ) {
    cc.kCCMaxActiveTexture = 16;

    cc.s_uCurrentShaderProgram = -1;
    cc.s_uCurrentBoundTexture = [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1];
    cc.s_eCurrentActiveTexture = 0; //cc.webglContext.TEXTURE0 - cc.webglContext.TEXTURE0;
    cc.s_eBlendingSource = -1;
    cc.s_eBlendingDest = -1;
    cc.s_eGLServerState = 0;
}

// GL State Cache functions

/** Invalidates the GL state cache.
 If CC_ENABLE_GL_STATE_CACHE it will reset the GL state cache.
 @since v2.0.0
 */
cc.glInvalidateStateCache = function () {
    cc.kmGLFreeAll();
    cc.s_uCurrentProjectionMatrix = -1;
    cc.s_bVertexAttribPosition = false;
    cc.s_bVertexAttribColor = false;
    cc.s_bVertexAttribTexCoords = false;
    if (cc.ENABLE_GL_STATE_CACHE) {
        cc.s_uCurrentShaderProgram = -1;
        for (var i = 0; i < cc.kCCMaxActiveTexture; i++) {
            cc.s_uCurrentBoundTexture[i] = -1;
        }
        cc.s_eCurrentActiveTexture = cc.webglContext.TEXTURE0 - cc.webglContext.TEXTURE0;
        cc.s_eBlendingSource = -1;
        cc.s_eBlendingDest = -1;
        cc.s_eGLServerState = 0;
    }
};

/** Uses the GL program in case program is different than the current one.
 If CC_ENABLE_GL_STATE_CACHE is disabled, it will the glUseProgram() directly.
 @since v2.0.0
 */
cc.glUseProgram = function (program) {
    if (cc.ENABLE_GL_STATE_CACHE) {
        if (program != cc.s_uCurrentShaderProgram)
            cc.s_uCurrentShaderProgram = program;
    }
    cc.webglContext.useProgram(program);
};

/** Deletes the GL program. If it is the one that is being used, it invalidates it.
 If CC_ENABLE_GL_STATE_CACHE is disabled, it will the glDeleteProgram() directly.
 @since v2.0.0
 */
cc.glDeleteProgram = function (program) {
    if (cc.ENABLE_GL_STATE_CACHE) {
        if (program == cc.s_uCurrentShaderProgram)
            cc.s_uCurrentShaderProgram = -1;
    }
    cc.webglContext.deleteProgram(program);
};

/** Uses a blending function in case it not already used.
 If CC_ENABLE_GL_STATE_CACHE is disabled, it will the glBlendFunc() directly.
 @since v2.0.0
 */
cc.glBlendFunc = function (sfactor, dfactor) {
    if (cc.ENABLE_GL_STATE_CACHE) {
        if (sfactor != cc.s_eBlendingSource || dfactor != cc.s_eBlendingDest) {
            cc.s_eBlendingSource = sfactor;
            cc.s_eBlendingDest = dfactor;
        }
    }
    cc.webglContext.blendFunc(sfactor, dfactor);
};

/** sets the projection matrix as dirty
 @since v2.0.0
 */
cc.setProjectionMatrixDirty = function () {
    cc.s_uCurrentProjectionMatrix = -1;
};

/** Will enable the vertex attribs that are passed as flags.
 Possible flags:

 * kCCVertexAttribFlag_Position
 * kCCVertexAttribFlag_Color
 * kCCVertexAttribFlag_TexCoords

 These flags can be ORed. The flags that are not present, will be disabled.

 @since v2.0.0
 */
cc.glEnableVertexAttribs = function (flags) {
    /* Position */
    var enablePosition =( flags & cc.kCCVertexAttribFlag_Position ) != 0;

    if( enablePosition != cc.s_bVertexAttribPosition ) {
        if( enablePosition )
            cc.webglContext.enableVertexAttribArray( cc.VERTEX_ATTRIB_POSITION );
        else
            cc.webglContext.disableVertexAttribArray( cc.VERTEX_ATTRIB_POSITION );

        cc.s_bVertexAttribPosition = enablePosition;
    }

    /* Color */
    var enableColor = (flags & cc.kCCVertexAttribFlag_Color) != 0;

    if( enableColor != cc.s_bVertexAttribColor ) {
        if( enableColor )
            cc.webglContext.enableVertexAttribArray( cc.VERTEX_ATTRIB_COLOR );
        else
            cc.webglContext.disableVertexAttribArray( cc.VERTEX_ATTRIB_COLOR );

        cc.s_bVertexAttribColor = enableColor;
    }

    /* Tex Coords */
    var enableTexCoords = (flags & cc.kCCVertexAttribFlag_TexCoords) != 0 ;

    if( enableTexCoords != cc.s_bVertexAttribTexCoords ) {
        if( enableTexCoords )
            cc.webglContext.enableVertexAttribArray( cc.VERTEX_ATTRIB_TEXCOORDS );
        else
            cc.webglContext.disableVertexAttribArray( cc.VERTEX_ATTRIB_TEXCOORDS );

        cc.s_bVertexAttribTexCoords = enableTexCoords;
    }
};

/** If the active texture is not textureEnum, then it will active it.
 If CC_ENABLE_GL_STATE_CACHE is disabled, it will call glActiveTexture() directly.
 @since v2.0.0
 */
cc.glActiveTexture = function (textureEnum) {
    if (cc.ENABLE_GL_STATE_CACHE) {
        cc.Assert((textureEnum - cc.webglContext.TEXTURE0) < cc.kCCMaxActiveTexture, "cocos2d ERROR: Increase kCCMaxActiveTexture to kCCMaxActiveTexture!");
        if ((textureEnum - cc.webglContext.TEXTURE0) != cc.s_eCurrentActiveTexture) {
            cc.s_eCurrentActiveTexture = (textureEnum - cc.webglContext.TEXTURE0);
        }
    }
    cc.webglContext.activeTexture(textureEnum);
};

/** Returns the active texture.
 If CC_ENABLE_GL_STATE_CACHE is disabled, it will call glGetIntegerv(GL_ACTIVE_TEXTURE);
 @since v2.0.0
 */
cc.glGetActiveTexture = function () {
    if (cc.ENABLE_GL_STATE_CACHE)
        return cc.s_eCurrentActiveTexture + cc.webglContext.TEXTURE0;
    else {
        //TODO need find webgl method
        //GLenum activeTexture;
        //cc.webglContext.getIntegerv(cc.webglContext.ACTIVE_TEXTURE, (GLint*)&activeTexture);
        //return activeTexture;
        return cc.webglContext.ACTIVE_TEXTURE;
    }
};

/** If the texture is not already bound, it binds it.
 If CC_ENABLE_GL_STATE_CACHE is disabled, it will call glBindTexture() directly.
 @since v2.0.0
 */
cc.glBindTexture2D = function (textureId) {
    if (cc.ENABLE_GL_STATE_CACHE) {
        if (cc.s_uCurrentBoundTexture[ cc.s_eCurrentActiveTexture ] != textureId)
            cc.s_uCurrentBoundTexture[ cc.s_eCurrentActiveTexture ] = textureId;
    }
    cc.webglContext.bindTexture(cc.webglContext.TEXTURE_2D, textureId);
};

/** It will delete a given texture. If the texture was bound, it will invalidate the cached.
 If CC_ENABLE_GL_STATE_CACHE is disabled, it will call glDeleteTextures() directly.
 @since v2.0.0
 */
cc.glDeleteTexture = function (textureId) {
    if (cc.ENABLE_GL_STATE_CACHE) {
        if (textureId == cc.s_uCurrentBoundTexture[ cc.s_eCurrentActiveTexture ])
            cc.s_uCurrentBoundTexture[ cc.s_eCurrentActiveTexture ] = -1;
    }
    cc.webglContext.deleteTexture(textureId);
};

/** It will enable / disable the server side GL states.
 If CC_ENABLE_GL_STATE_CACHE is disabled, it will call glEnable() directly.
 @since v2.0.0
 */
cc.glEnable = function (flags) {
    if (cc.ENABLE_GL_STATE_CACHE) {
        var enabled;

        /* GL_BLEND */
        if ((enabled = (flags & cc.GL_BLEND)) != (cc.s_eGLServerState & cc.GL_BLEND)) {
            if (enabled) {
                cc.webglContext.enable(cc.webglContext.BLEND);
                cc.s_eGLServerState |= cc.GL_BLEND;
            } else {
                cc.webglContext.disable(cc.webglContext.BLEND);
                cc.s_eGLServerState &= ~cc.GL_BLEND;
            }
        }
    } else {
        if ((flags & cc.GL_BLEND))
            cc.webglContext.enable(cc.webglContext.BLEND);
        else
            cc.webglContext.disable(cc.webglContext.BLEND);
    }
};

