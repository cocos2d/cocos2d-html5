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

/**
 * @constant
 * @type {Number}
 */
cc.SHADERTYPE_POSITION_TEXTURECOLOR = 0;
/**
 * @constant
 * @type {Number}
 */
cc.SHADERTYPE_POSITION_TEXTURECOLOR_ALPHATEST = 1;
/**
 * @constant
 * @type {Number}
 */
cc.SHADERTYPE_POSITION_COLOR = 2;
/**
 * @constant
 * @type {Number}
 */
cc.SHADERTYPE_POSITION_TEXTURE = 3;
/**
 * @constant
 * @type {Number}
 */
cc.SHADERTYPE_POSITION_TEXTURE_UCOLOR = 4;
/**
 * @constant
 * @type {Number}
 */
cc.SHADERTYPE_POSITION_TEXTURE_A8COLOR = 5;
/**
 * @constant
 * @type {Number}
 */
cc.SHADERTYPE_POSITION_UCOLOR = 6;
/**
 * @constant
 * @type {Number}
 */
cc.SHADERTYPE_POSITION_LENGTH_TEXTURECOLOR = 7;
/**
 * @constant
 * @type {Number}
 */
cc.SHADERTYPE_MAX = 8;

cc._sharedShaderCache = null;

/**
 * Singleton that stores manages GL shaders
 * @class
 * @extends cc.Class
 */
cc.ShaderCache = cc.Class.extend({
    _programs: null,

    _init: function () {
        this.loadDefaultShaders();
        return true;
    },

    _loadDefaultShader: function (program, type) {
        switch (type) {
            case cc.SHADERTYPE_POSITION_TEXTURECOLOR:
                program.initWithVertexShaderByteArray(cc.SHADER_POSITION_TEXTURE_COLOR_VERT, cc.SHADER_POSITION_TEXTURE_COLOR_FRAG);

                program.addAttribute(cc.ATTRIBUTE_NAME_POSITION, cc.VERTEX_ATTRIB_POSITION);
                program.addAttribute(cc.ATTRIBUTE_NAME_COLOR, cc.VERTEX_ATTRIB_COLOR);
                program.addAttribute(cc.ATTRIBUTE_NAME_TEX_COORD, cc.VERTEX_ATTRIB_TEX_COORDS);
                break;
            case cc.SHADERTYPE_POSITION_TEXTURECOLOR_ALPHATEST:
                program.initWithVertexShaderByteArray(cc.SHADER_POSITION_TEXTURE_COLOR_VERT, cc.SHADER_POSITION_TEXTURE_COLOR_ALPHATEST_FRAG);

                program.addAttribute(cc.ATTRIBUTE_NAME_POSITION, cc.VERTEX_ATTRIB_POSITION);
                program.addAttribute(cc.ATTRIBUTE_NAME_COLOR, cc.VERTEX_ATTRIB_COLOR);
                program.addAttribute(cc.ATTRIBUTE_NAME_TEX_COORD, cc.VERTEX_ATTRIB_TEX_COORDS);
                break;
            case cc.SHADERTYPE_POSITION_COLOR:
                program.initWithVertexShaderByteArray(cc.SHADER_POSITION_COLOR_VERT, cc.SHADER_POSITION_COLOR_FRAG);

                program.addAttribute(cc.ATTRIBUTE_NAME_POSITION, cc.VERTEX_ATTRIB_POSITION);
                program.addAttribute(cc.ATTRIBUTE_NAME_COLOR, cc.VERTEX_ATTRIB_COLOR);
                break;
            case cc.SHADERTYPE_POSITION_TEXTURE:
                program.initWithVertexShaderByteArray(cc.SHADER_POSITION_TEXTURE_VERT, cc.SHADER_POSITION_TEXTURE_FRAG);

                program.addAttribute(cc.ATTRIBUTE_NAME_POSITION, cc.VERTEX_ATTRIB_POSITION);
                program.addAttribute(cc.ATTRIBUTE_NAME_TEX_COORD, cc.VERTEX_ATTRIB_TEX_COORDS);
                break;
            case cc.SHADERTYPE_POSITION_TEXTURE_UCOLOR:
                program.initWithVertexShaderByteArray(cc.SHADER_POSITION_TEXTURE_UCOLOR_VERT, cc.SHADER_POSITION_TEXTURE_UCOLOR_FRAG);

                program.addAttribute(cc.ATTRIBUTE_NAME_POSITION, cc.VERTEX_ATTRIB_POSITION);
                program.addAttribute(cc.ATTRIBUTE_NAME_TEX_COORD, cc.VERTEX_ATTRIB_TEX_COORDS);
                break;
            case cc.SHADERTYPE_POSITION_TEXTURE_A8COLOR:
                program.initWithVertexShaderByteArray(cc.SHADER_POSITION_TEXTURE_A8COLOR_VERT, cc.SHADER_POSITION_TEXTURE_A8COLOR_FRAG);

                program.addAttribute(cc.ATTRIBUTE_NAME_POSITION, cc.VERTEX_ATTRIB_POSITION);
                program.addAttribute(cc.ATTRIBUTE_NAME_COLOR, cc.VERTEX_ATTRIB_COLOR);
                program.addAttribute(cc.ATTRIBUTE_NAME_TEX_COORD, cc.VERTEX_ATTRIB_TEX_COORDS);
                break;
            case cc.SHADERTYPE_POSITION_UCOLOR:
                program.initWithVertexShaderByteArray(cc.SHADER_POSITION_UCOLOR_VERT, cc.SHADER_POSITION_UCOLOR_FRAG);
                program.addAttribute("aVertex", cc.VERTEX_ATTRIB_POSITION);
                break;
            case cc.SHADERTYPE_POSITION_LENGTH_TEXTURECOLOR:
                program.initWithVertexShaderByteArray(cc.SHADER_POSITION_COLOR_LENGTH_TEXTURE_VERT, cc.SHADER_POSITION_COLOR_LENGTH_TEXTURE_FRAG);

                program.addAttribute(cc.ATTRIBUTE_NAME_POSITION, cc.VERTEX_ATTRIB_POSITION);
                program.addAttribute(cc.ATTRIBUTE_NAME_TEX_COORD, cc.VERTEX_ATTRIB_TEX_COORDS);
                program.addAttribute(cc.ATTRIBUTE_NAME_COLOR, cc.VERTEX_ATTRIB_COLOR);
                break;
            default:
                cc.log("cocos2d: cc.ShaderCache._loadDefaultShader, error shader type");
                return;
        }

        program.link();
        program.updateUniforms();

        //cc.CHECK_GL_ERROR_DEBUG();
    },

    /**
     * Constructor
     * @override
     */
    ctor: function () {
        this._programs = {};
    },

    /**
     * loads the default shaders
     */
    loadDefaultShaders: function () {
        // Position Texture Color shader
        var program = new cc.GLProgram();
        this._loadDefaultShader(program, cc.SHADERTYPE_POSITION_TEXTURECOLOR);
        this._programs[cc.SHADER_POSITION_TEXTURECOLOR] = program;
        this._programs["ShaderPositionTextureColor"] = program;

        // Position Texture Color alpha test
        program = new cc.GLProgram();
        this._loadDefaultShader(program, cc.SHADERTYPE_POSITION_TEXTURECOLOR_ALPHATEST);
        this._programs[cc.SHADER_POSITION_TEXTURECOLORALPHATEST] = program;
        this._programs["ShaderPositionTextureColorAlphaTest"] = program;

        //
        // Position, Color shader
        //
        program = new cc.GLProgram();
        this._loadDefaultShader(program, cc.SHADERTYPE_POSITION_COLOR);
        this._programs[cc.SHADER_POSITION_COLOR] = program;
        this._programs["ShaderPositionColor"] = program;

        //
        // Position Texture shader
        //
        program = new cc.GLProgram();
        this._loadDefaultShader(program, cc.SHADERTYPE_POSITION_TEXTURE);
        this._programs[cc.SHADER_POSITION_TEXTURE] = program;
        this._programs["ShaderPositionTexture"] = program;

        //
        // Position, Texture attribs, 1 Color as uniform shader
        //
        program = new cc.GLProgram();
        this._loadDefaultShader(program, cc.SHADERTYPE_POSITION_TEXTURE_UCOLOR);
        this._programs[cc.SHADER_POSITION_TEXTURE_UCOLOR] = program;
        this._programs["ShaderPositionTextureUColor"] = program;

        //
        // Position Texture A8 Color shader
        //
        program = new cc.GLProgram();
        this._loadDefaultShader(program, cc.SHADERTYPE_POSITION_TEXTURE_A8COLOR);
        this._programs[cc.SHADER_POSITION_TEXTUREA8COLOR] = program;
        this._programs["ShaderPositionTextureA8Color"] = program;

        //
        // Position and 1 color passed as a uniform (to similate glColor4ub )
        //
        program = new cc.GLProgram();
        this._loadDefaultShader(program, cc.SHADERTYPE_POSITION_UCOLOR);
        this._programs[cc.SHADER_POSITION_UCOLOR] = program;
        this._programs["ShaderPositionUColor"] = program;

        //
        // Position, Legth(TexCoords, Color (used by Draw Node basically )
        //
        program = new cc.GLProgram();
        this._loadDefaultShader(program, cc.SHADERTYPE_POSITION_LENGTH_TEXTURECOLOR);
        this._programs[cc.SHADER_POSITION_LENGTHTEXTURECOLOR] = program;
        this._programs["ShaderPositionLengthTextureColor"] = program;
    },

    /**
     * reload the default shaders
     */
    reloadDefaultShaders: function () {
        // reset all programs and reload them

        // Position Texture Color shader
        var program = this.programForKey(cc.SHADER_POSITION_TEXTURECOLOR);
        program.reset();
        this._loadDefaultShader(program, cc.SHADERTYPE_POSITION_TEXTURECOLOR);

        // Position Texture Color alpha test
        program = this.programForKey(cc.SHADER_POSITION_TEXTURECOLORALPHATEST);
        program.reset();
        this._loadDefaultShader(program, cc.SHADERTYPE_POSITION_TEXTURECOLOR_ALPHATEST);

        //
        // Position, Color shader
        //
        program = this.programForKey(cc.SHADER_POSITION_COLOR);
        program.reset();
        this._loadDefaultShader(program, cc.SHADERTYPE_POSITION_COLOR);

        //
        // Position Texture shader
        //
        program = this.programForKey(cc.SHADER_POSITION_TEXTURE);
        program.reset();
        this._loadDefaultShader(program, cc.SHADERTYPE_POSITION_TEXTURE);

        //
        // Position, Texture attribs, 1 Color as uniform shader
        //
        program = this.programForKey(cc.SHADER_POSITION_TEXTURE_UCOLOR);
        program.reset();
        this._loadDefaultShader(program, cc.SHADERTYPE_POSITION_TEXTURE_UCOLOR);

        //
        // Position Texture A8 Color shader
        //
        program = this.programForKey(cc.SHADER_POSITION_TEXTUREA8COLOR);
        program.reset();
        this._loadDefaultShader(program, cc.SHADERTYPE_POSITION_TEXTURE_A8COLOR);

        //
        // Position and 1 color passed as a uniform (to similate glColor4ub )
        //
        program = this.programForKey(cc.SHADER_POSITION_UCOLOR);
        program.reset();
        this._loadDefaultShader(program, cc.SHADERTYPE_POSITION_UCOLOR);
    },

    /** returns a GL program for a given key */
    programForKey: function (key) {
        return this._programs[key];
    },

    /**
     * returns a GL program for a shader name
     * @param {String} shaderName
     * @return cc.GLProgram
     */
    getProgram: function (shaderName) {
        return this._programs[shaderName];
    },

    /** adds a CCGLProgram to the cache for a given name */
    addProgram: function (program, key) {
        this._programs[key] = program;
    }
});

/**  */
/**
 *  returns the cc.ShaderCache instance
 * @return {cc.ShaderCache}
 */
cc.ShaderCache.getInstance = function () {
    if (!cc._sharedShaderCache) {
        cc._sharedShaderCache = new cc.ShaderCache();
        cc._sharedShaderCache._init();
    }
    return cc._sharedShaderCache;
};

/**
 *  purges the cache. It releases the retained instance.
 */
cc.ShaderCache.purgeSharedShaderCache = function () {
    cc._sharedShaderCache = null;
};