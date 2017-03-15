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

/**
 * cc.shaderCache is a singleton object that stores manages GL shaders
 * @class
 * @name cc.shaderCache
 */
cc.shaderCache = /** @lends cc.shaderCache# */{

    /**
     * @public
     * @constant
     * @type {Number}
     */
    TYPE_POSITION_TEXTURECOLOR: 0,
    /**
     * @public
     * @constant
     * @type {Number}
     */
    TYPE_POSITION_TEXTURECOLOR_ALPHATEST: 1,
    /**
     * @public
     * @constant
     * @type {Number}
     */
    TYPE_POSITION_COLOR: 2,
    /**
     * @public
     * @constant
     * @type {Number}
     */
    TYPE_POSITION_TEXTURE: 3,
    /**
     * @public
     * @constant
     * @type {Number}
     */
    TYPE_POSITION_TEXTURE_UCOLOR: 4,
    /**
     * @public
     * @constant
     * @type {Number}
     */
    TYPE_POSITION_TEXTURE_A8COLOR: 5,
    /**
     * @public
     * @constant
     * @type {Number}
     */
    TYPE_POSITION_UCOLOR: 6,
    /**
     * @public
     * @constant
     * @type {Number}
     */
    TYPE_POSITION_LENGTH_TEXTURECOLOR: 7,
    /**
     * @public
     * @constant
     * @type {Number}
     */
    TYPE_SPRITE_POSITION_TEXTURECOLOR: 8,
    /**
     * @public
     * @constant
     * @type {Number}
     */
    TYPE_SPRITE_POSITION_TEXTURECOLOR_ALPHATEST: 9,
    /**
     * @public
     * @constant
     * @type {Number}
     */
    TYPE_SPRITE_POSITION_COLOR: 10,
    /**
     * @public
     * @constant
     * @type {Number}
     */
    TYPE_SPRITE_POSITION_TEXTURECOLOR_GRAY: 11,
    /**
     * @public
     * @constant
     * @type {Number}
     */
    TYPE_MAX: 11,

    _keyMap: [
        cc.SHADER_POSITION_TEXTURECOLOR,
        cc.SHADER_POSITION_TEXTURECOLORALPHATEST,
        cc.SHADER_POSITION_COLOR,
        cc.SHADER_POSITION_TEXTURE,
        cc.SHADER_POSITION_TEXTURE_UCOLOR,
        cc.SHADER_POSITION_TEXTUREA8COLOR,
        cc.SHADER_POSITION_UCOLOR,
        cc.SHADER_POSITION_LENGTHTEXTURECOLOR,
        cc.SHADER_SPRITE_POSITION_TEXTURECOLOR,
        cc.SHADER_SPRITE_POSITION_TEXTURECOLORALPHATEST,
        cc.SHADER_SPRITE_POSITION_COLOR,
        cc.SHADER_SPRITE_POSITION_TEXTURECOLOR_GRAY
    ],

    _programs: {},

    _init: function () {
        this.loadDefaultShaders();
        return true;
    },

    _loadDefaultShader: function (program, type) {
        switch (type) {
            case cc.SHADER_POSITION_TEXTURECOLOR:
                program.initWithVertexShaderByteArray(cc.SHADER_POSITION_TEXTURE_COLOR_VERT, cc.SHADER_POSITION_TEXTURE_COLOR_FRAG);
                program.addAttribute(cc.ATTRIBUTE_NAME_POSITION, cc.VERTEX_ATTRIB_POSITION);
                program.addAttribute(cc.ATTRIBUTE_NAME_COLOR, cc.VERTEX_ATTRIB_COLOR);
                program.addAttribute(cc.ATTRIBUTE_NAME_TEX_COORD, cc.VERTEX_ATTRIB_TEX_COORDS);
                break;
            case cc.SHADER_SPRITE_POSITION_TEXTURECOLOR:
                program.initWithVertexShaderByteArray(cc.SHADER_SPRITE_POSITION_TEXTURE_COLOR_VERT, cc.SHADER_POSITION_TEXTURE_COLOR_FRAG);
                program.addAttribute(cc.ATTRIBUTE_NAME_POSITION, cc.VERTEX_ATTRIB_POSITION);
                program.addAttribute(cc.ATTRIBUTE_NAME_COLOR, cc.VERTEX_ATTRIB_COLOR);
                program.addAttribute(cc.ATTRIBUTE_NAME_TEX_COORD, cc.VERTEX_ATTRIB_TEX_COORDS);
              break;
            case cc.SHADER_SPRITE_POSITION_TEXTURECOLOR_GRAY:
              program.initWithVertexShaderByteArray(cc.SHADER_SPRITE_POSITION_TEXTURE_COLOR_VERT, cc.SHADER_SPRITE_POSITION_TEXTURE_COLOR_GRAY_FRAG);
              program.addAttribute(cc.ATTRIBUTE_NAME_POSITION, cc.VERTEX_ATTRIB_POSITION);
              program.addAttribute(cc.ATTRIBUTE_NAME_COLOR, cc.VERTEX_ATTRIB_COLOR);
              program.addAttribute(cc.ATTRIBUTE_NAME_TEX_COORD, cc.VERTEX_ATTRIB_TEX_COORDS);
              break;
            case cc.SHADER_POSITION_TEXTURECOLORALPHATEST:
                program.initWithVertexShaderByteArray(cc.SHADER_POSITION_TEXTURE_COLOR_VERT, cc.SHADER_POSITION_TEXTURE_COLOR_ALPHATEST_FRAG);
                program.addAttribute(cc.ATTRIBUTE_NAME_POSITION, cc.VERTEX_ATTRIB_POSITION);
                program.addAttribute(cc.ATTRIBUTE_NAME_COLOR, cc.VERTEX_ATTRIB_COLOR);
                program.addAttribute(cc.ATTRIBUTE_NAME_TEX_COORD, cc.VERTEX_ATTRIB_TEX_COORDS);
                break;
            case cc.SHADER_SPRITE_POSITION_TEXTURECOLORALPHATEST:
                program.initWithVertexShaderByteArray(cc.SHADER_SPRITE_POSITION_TEXTURE_COLOR_VERT, cc.SHADER_POSITION_TEXTURE_COLOR_ALPHATEST_FRAG);
                program.addAttribute(cc.ATTRIBUTE_NAME_POSITION, cc.VERTEX_ATTRIB_POSITION);
                program.addAttribute(cc.ATTRIBUTE_NAME_COLOR, cc.VERTEX_ATTRIB_COLOR);
                program.addAttribute(cc.ATTRIBUTE_NAME_TEX_COORD, cc.VERTEX_ATTRIB_TEX_COORDS);
                break;
            case cc.SHADER_POSITION_COLOR:
                program.initWithVertexShaderByteArray(cc.SHADER_POSITION_COLOR_VERT, cc.SHADER_POSITION_COLOR_FRAG);
                program.addAttribute(cc.ATTRIBUTE_NAME_POSITION, cc.VERTEX_ATTRIB_POSITION);
                program.addAttribute(cc.ATTRIBUTE_NAME_COLOR, cc.VERTEX_ATTRIB_COLOR);
                break;
            case cc.SHADER_SPRITE_POSITION_COLOR:
                program.initWithVertexShaderByteArray(cc.SHADER_SPRITE_POSITION_COLOR_VERT, cc.SHADER_POSITION_COLOR_FRAG);
                program.addAttribute(cc.ATTRIBUTE_NAME_POSITION, cc.VERTEX_ATTRIB_POSITION);
                program.addAttribute(cc.ATTRIBUTE_NAME_COLOR, cc.VERTEX_ATTRIB_COLOR);
                break;
            case cc.SHADER_POSITION_TEXTURE:
                program.initWithVertexShaderByteArray(cc.SHADER_POSITION_TEXTURE_VERT, cc.SHADER_POSITION_TEXTURE_FRAG);
                program.addAttribute(cc.ATTRIBUTE_NAME_POSITION, cc.VERTEX_ATTRIB_POSITION);
                program.addAttribute(cc.ATTRIBUTE_NAME_TEX_COORD, cc.VERTEX_ATTRIB_TEX_COORDS);
                break;
            case cc.SHADER_POSITION_TEXTURE_UCOLOR:
                program.initWithVertexShaderByteArray(cc.SHADER_POSITION_TEXTURE_UCOLOR_VERT, cc.SHADER_POSITION_TEXTURE_UCOLOR_FRAG);
                program.addAttribute(cc.ATTRIBUTE_NAME_POSITION, cc.VERTEX_ATTRIB_POSITION);
                program.addAttribute(cc.ATTRIBUTE_NAME_TEX_COORD, cc.VERTEX_ATTRIB_TEX_COORDS);
                break;
            case cc.SHADER_POSITION_TEXTUREA8COLOR:
                program.initWithVertexShaderByteArray(cc.SHADER_POSITION_TEXTURE_A8COLOR_VERT, cc.SHADER_POSITION_TEXTURE_A8COLOR_FRAG);
                program.addAttribute(cc.ATTRIBUTE_NAME_POSITION, cc.VERTEX_ATTRIB_POSITION);
                program.addAttribute(cc.ATTRIBUTE_NAME_COLOR, cc.VERTEX_ATTRIB_COLOR);
                program.addAttribute(cc.ATTRIBUTE_NAME_TEX_COORD, cc.VERTEX_ATTRIB_TEX_COORDS);
                break;
            case cc.SHADER_POSITION_UCOLOR:
                program.initWithVertexShaderByteArray(cc.SHADER_POSITION_UCOLOR_VERT, cc.SHADER_POSITION_UCOLOR_FRAG);
                program.addAttribute("aVertex", cc.VERTEX_ATTRIB_POSITION);
                break;
            case cc.SHADER_POSITION_LENGTHTEXTURECOLOR:
                program.initWithVertexShaderByteArray(cc.SHADER_POSITION_COLOR_LENGTH_TEXTURE_VERT, cc.SHADER_POSITION_COLOR_LENGTH_TEXTURE_FRAG);
                program.addAttribute(cc.ATTRIBUTE_NAME_POSITION, cc.VERTEX_ATTRIB_POSITION);
                program.addAttribute(cc.ATTRIBUTE_NAME_TEX_COORD, cc.VERTEX_ATTRIB_TEX_COORDS);
                program.addAttribute(cc.ATTRIBUTE_NAME_COLOR, cc.VERTEX_ATTRIB_COLOR);
                break;
            default:
                cc.log("cocos2d: cc.shaderCache._loadDefaultShader, error shader type");
                return;
        }

        program.link();
        program.updateUniforms();

        //cc.checkGLErrorDebug();
    },

    /**
     * loads the default shaders
     */
    loadDefaultShaders: function () {
        for (var i = 0; i < this.TYPE_MAX; ++i) {
            var key = this._keyMap[i];
            this.programForKey(key);
        }
    },

    /**
     * reload the default shaders
     */
    reloadDefaultShaders: function () {
        // reset all programs and reload them

        // Position Texture Color shader
        var program = this.programForKey(cc.SHADER_POSITION_TEXTURECOLOR);
        program.reset();
        this._loadDefaultShader(program, cc.SHADER_POSITION_TEXTURECOLOR);

        // Sprite Position Texture Color shader
        program = this.programForKey(cc.SHADER_SPRITE_POSITION_TEXTURECOLOR);
        program.reset();
        this._loadDefaultShader(program, cc.SHADER_SPRITE_POSITION_TEXTURECOLOR);

        // Position Texture Color alpha test
        program = this.programForKey(cc.SHADER_POSITION_TEXTURECOLORALPHATEST);
        program.reset();
        this._loadDefaultShader(program, cc.SHADER_POSITION_TEXTURECOLORALPHATEST);

        // Sprite Position Texture Color alpha shader
        program = this.programForKey(cc.SHADER_SPRITE_POSITION_TEXTURECOLORALPHATEST);
        program.reset();
        this._loadDefaultShader(program, cc.SHADER_SPRITE_POSITION_TEXTURECOLORALPHATEST);

        //
        // Position, Color shader
        //
        program = this.programForKey(cc.SHADER_POSITION_COLOR);
        program.reset();
        this._loadDefaultShader(program, cc.SHADER_POSITION_COLOR);

        //
        // Position Texture shader
        //
        program = this.programForKey(cc.SHADER_POSITION_TEXTURE);
        program.reset();
        this._loadDefaultShader(program, cc.SHADER_POSITION_TEXTURE);

        //Position Texture Gray shader
        program = this.programForKey(cc.SHADER_SPRITE_POSITION_TEXTURE_COLOR_GRAY_FRAG);
        program.reset();
        this._loadDefaultShader(program, cc.SHADER_SPRITE_POSITION_TEXTURE_COLOR_GRAY_FRAG);

        //
        // Position, Texture attribs, 1 Color as uniform shader
        //
        program = this.programForKey(cc.SHADER_POSITION_TEXTURE_UCOLOR);
        program.reset();
        this._loadDefaultShader(program, cc.SHADER_POSITION_TEXTURE_UCOLOR);

        //
        // Position Texture A8 Color shader
        //
        program = this.programForKey(cc.SHADER_POSITION_TEXTUREA8COLOR);
        program.reset();
        this._loadDefaultShader(program, cc.SHADER_POSITION_TEXTUREA8COLOR);

        //
        // Position and 1 color passed as a uniform (to similate glColor4ub )
        //
        program = this.programForKey(cc.SHADER_POSITION_UCOLOR);
        program.reset();
        this._loadDefaultShader(program, cc.SHADER_POSITION_UCOLOR);
    },

    /**
     * returns a GL program for a given key
     * @param {String} key
     */
    programForKey: function (key) {
        if (!this._programs[key]) {
            var program = new cc.GLProgram();
            this._loadDefaultShader(program, key);
            this._programs[key] = program;
        }

        return this._programs[key];
    },

    /**
     * returns a GL program for a shader name
     * @param {String} shaderName
     * @return {cc.GLProgram}
     */
    getProgram: function (shaderName) {
        return this.programForKey(shaderName);
    },

    /**
     * adds a CCGLProgram to the cache for a given name
     * @param {cc.GLProgram} program
     * @param {String} key
     */
    addProgram: function (program, key) {
        this._programs[key] = program;
    }
};
