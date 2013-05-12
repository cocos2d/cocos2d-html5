/****************************************************************************
 Copyright (c) 2010-2012 cocos2d-x.org
 Copyright (c) 2008-2010 Ricardo Quesada
 Copyright 2011 Jeff Lamarche
 Copyright 2012 Goffredo Marocchi
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

//-------------Vertex Attributes-----------
/**
 * @constant
 * @type {Number}
 */
cc.VERTEX_ATTRIB_POSITION = 0;
/**
 * @constant
 * @type {Number}
 */
cc.VERTEX_ATTRIB_COLOR = 1;
/**
 * @constant
 * @type {Number}
 */
cc.VERTEX_ATTRIB_TEX_COORDS = 2;
/**
 * @constant
 * @type {Number}
 */
cc.VERTEX_ATTRIB_MAX = 3;

//------------Uniforms------------------
/**
 * @constant
 * @type {Number}
 */
cc.UNIFORM_PMATRIX = 0;
/**
 * @constant
 * @type {Number}
 */
cc.UNIFORM_MVMATRIX = 1;
/**
 * @constant
 * @type {Number}
 */
cc.UNIFORM_MVPMATRIX = 2;
/**
 * @constant
 * @type {Number}
 */
cc.UNIFORM_TIME = 3;
/**
 * @constant
 * @type {Number}
 */
cc.UNIFORM_SINTIME = 4;
/**
 * @constant
 * @type {Number}
 */
cc.UNIFORM_COSTIME = 5;
/**
 * @constant
 * @type {Number}
 */
cc.UNIFORM_RANDOM01 = 6;
/**
 * @constant
 * @type {Number}
 */
cc.UNIFORM_SAMPLER = 7;
/**
 * @constant
 * @type {Number}
 */
cc.UNIFORM_MAX = 8;

//------------Shader Name---------------
/**
 * @constant
 * @type {String}
 */
cc.SHADER_POSITION_TEXTURECOLOR = "ShaderPositionTextureColor";
/**
 * @constant
 * @type {String}
 */
cc.SHADER_POSITION_TEXTURECOLORALPHATEST = "ShaderPositionTextureColorAlphaTest";
/**
 * @constant
 * @type {String}
 */
cc.SHADER_POSITION_COLOR = "ShaderPositionColor";
/**
 * @constant
 * @type {String}
 */
cc.SHADER_POSITION_TEXTURE = "ShaderPositionTexture";
/**
 * @constant
 * @type {String}
 */
cc.SHADER_POSITION_TEXTURE_UCOLOR = "ShaderPositionTexture_uColor";
/**
 * @constant
 * @type {String}
 */
cc.SHADER_POSITION_TEXTUREA8COLOR = "ShaderPositionTextureA8Color";
/**
 * @constant
 * @type {String}
 */
cc.SHADER_POSITION_UCOLOR = "ShaderPosition_uColor";
/**
 * @constant
 * @type {String}
 */
cc.SHADER_POSITION_LENGTHTEXTURECOLOR = "ShaderPositionLengthTextureColor";

//------------uniform names----------------
/**
 * @constant
 * @type {String}
 */
cc.UNIFORM_PMATRIX_S = "CC_PMatrix";
/**
 * @constant
 * @type {String}
 */
cc.UNIFORM_MVMATRIX_S = "CC_MVMatrix";
/**
 * @constant
 * @type {String}
 */
cc.UNIFORM_MVPMATRIX_S = "CC_MVPMatrix";
/**
 * @constant
 * @type {String}
 */
cc.UNIFORM_TIME_S = "CC_Time";
/**
 * @constant
 * @type {String}
 */
cc.UNIFORM_SINTIME_S = "CC_SinTime";
/**
 * @constant
 * @type {String}
 */
cc.UNIFORM_COSTIME_S = "CC_CosTime";
/**
 * @constant
 * @type {String}
 */
cc.UNIFORM_RANDOM01_S = "CC_Random01";
/**
 * @constant
 * @type {String}
 */
cc.UNIFORM_SAMPLER_S = "CC_Texture0";
/**
 * @constant
 * @type {String}
 */
cc.UNIFORM_ALPHA_TEST_VALUE_S = "CC_alpha_value";

//------------Attribute names--------------
/**
 * @constant
 * @type {String}
 */
cc.ATTRIBUTE_NAME_COLOR = "a_color";
/**
 * @constant
 * @type {String}
 */
cc.ATTRIBUTE_NAME_POSITION = "a_position";
/**
 * @constant
 * @type {String}
 */
cc.ATTRIBUTE_NAME_TEX_COORD = "a_texCoord";

cc.HashUniformEntry = function (value, location, hh) {
    this.value = value;
    this.location = location;
    this.hh = hh || {};
};

/**
 * Class that implements a glProgram
 * @class
 * @extends cc.Class
 */
cc.GLProgram = cc.Class.extend({
    _glContext: null,
    _programObj: null,
    _vertShader: null,
    _fragShader: null,
    _uniforms: null,
    _hashForUniforms: null,
    _usesTime: false,

    // Uniform cache
    _updateUniformLocation: function (location, data, bytes) {
        if (location == null)
            return false;

        var updated = true;
        var element = null;
        for (var i = 0; i < this._hashForUniforms.length; i++)
            if (this._hashForUniforms[i].location == location)
                element = this._hashForUniforms[i];

        if (!element) {
            element = new cc.HashUniformEntry();
            // key
            element.location = location;
            // value
            element.value = data;
            this._hashForUniforms.push(element);
        } else {
            if (element.value == data)
                updated = false;
            else
                element.value = data;
        }

        return updated;
    },

    _description: function () {
        return "<CCGLProgram = " + this.toString() + " | Program = " + this._programObj.toString() + ", VertexShader = " +
            this._vertShader.toString() + ", FragmentShader = " + this._fragShader.toString() + ">";
    },

    _compileShader: function (shader, type, source) {
        if (!source || !shader)
            return false;

        var preStr = (type == this._glContext.VERTEX_SHADER) ? "precision highp float;\n" : "precision mediump float;\n";

        source = preStr
            + "uniform mat4 CC_PMatrix;          \n"
            + "uniform mat4 CC_MVMatrix;        \n"
            + "uniform mat4 CC_MVPMatrix;       \n"
            + "uniform vec4 CC_Time;            \n"
            + "uniform vec4 CC_SinTime;         \n"
            + "uniform vec4 CC_CosTime;         \n"
            + "uniform vec4 CC_Random01;        \n"
            + "//CC INCLUDES END                \n  \n" + source;

        this._glContext.shaderSource(shader, source);
        this._glContext.compileShader(shader);
        var status = this._glContext.getShaderParameter(shader, this._glContext.COMPILE_STATUS);

        if (!status) {
            cc.log("cocos2d: ERROR: Failed to compile shader:\n" + this._glContext.getShaderSource(shader));
            if (type == this._glContext.VERTEX_SHADER)
                cc.log("cocos2d: \n" + this.vertexShaderLog());
            else
                cc.log("cocos2d: \n" + this.fragmentShaderLog());
        }
        return ( status == 1 );
    },

    ctor: function (glContext) {
        this._programObj = null;
        this._vertShader = null;
        this._fragShader = null;
        this._uniforms = [];
        this._hashForUniforms = [];
        this._glContext = glContext || cc.renderContext;
    },

    destroyProgram: function () {
        this._vertShader = null;
        this._fragShader = null;
        this._uniforms = null;
        this._hashForUniforms = null;

        this._glContext.deleteProgram(this._programObj);
    },

    /**
     * Initializes the cc.GLProgram with a vertex and fragment with string
     * @param {String} vertShaderStr
     * @param {String} fragShaderStr
     * @return {Boolean}
     */
    initWithVertexShaderByteArray: function (vertShaderStr, fragShaderStr) {
        this._programObj = cc.renderContext.createProgram();
        //cc.CHECK_GL_ERROR_DEBUG();

        this._vertShader = null;
        this._fragShader = null;

        if (vertShaderStr) {
            this._vertShader = this._glContext.createShader(this._glContext.VERTEX_SHADER);
            if (!this._compileShader(this._vertShader, this._glContext.VERTEX_SHADER, vertShaderStr)) {
                cc.log("cocos2d: ERROR: Failed to compile vertex shader");
            }
        }

        // Create and compile fragment shader
        if (fragShaderStr) {
            this._fragShader = this._glContext.createShader(this._glContext.FRAGMENT_SHADER);
            if (!this._compileShader(this._fragShader, this._glContext.FRAGMENT_SHADER, fragShaderStr)) {
                cc.log("cocos2d: ERROR: Failed to compile fragment shader");
            }
        }

        if (this._vertShader)
            this._glContext.attachShader(this._programObj, this._vertShader);
        cc.CHECK_GL_ERROR_DEBUG();

        if (this._fragShader)
            this._glContext.attachShader(this._programObj, this._fragShader);
        this._hashForUniforms = [];

        cc.CHECK_GL_ERROR_DEBUG();
        return true;
    },

    /**
     * Initializes the cc.GLProgram with a vertex and fragment with string
     * @param {String} vertShaderStr
     * @param {String} fragShaderStr
     * @return {Boolean}
     */
    initWithString: function (vertShaderStr, fragShaderStr) {
        return this.initWithVertexShaderByteArray(vertShaderStr, fragShaderStr);
    },

    /**
     * Initializes the CCGLProgram with a vertex and fragment with contents of filenames
     * @param {String} vShaderFilename
     * @param {String} fShaderFileName
     * @return {Boolean}
     */
    initWithVertexShaderFilename: function (vShaderFilename, fShaderFileName) {
        var vertexSource = cc.FileUtils.getInstance().getTextFileData(vShaderFilename);
        var fragmentSource = cc.FileUtils.getInstance().getTextFileData(fShaderFileName);
        return this.initWithVertexShaderByteArray(vertexSource, fragmentSource);
    },

    /**
     * Initializes the CCGLProgram with a vertex and fragment with contents of filenames
     * @param {String} vShaderFilename
     * @param {String} fShaderFileName
     * @return {Boolean}
     */
    init: function (vShaderFilename, fShaderFileName) {
        return this.initWithVertexShaderFilename(vShaderFilename, fShaderFileName);
    },

    /**
     * It will add a new attribute to the shader
     * @param {String} attributeName
     * @param {Number} index
     */
    addAttribute: function (attributeName, index) {
        this._glContext.bindAttribLocation(this._programObj, index, attributeName);
    },

    /**
     * links the glProgram
     * @return {Boolean}
     */
    link: function () {
        cc.Assert(this._programObj != null, "Cannot link invalid program");

        this._glContext.linkProgram(this._programObj);

        if (this._vertShader)
            this._glContext.deleteShader(this._vertShader);
        if (this._fragShader)
            this._glContext.deleteShader(this._fragShader);

        this._vertShader = null;
        this._fragShader = null;

        if (cc.COCOS2D_DEBUG) {
            var status = this._glContext.getProgramParameter(this._programObj, this._glContext.LINK_STATUS);
            if (!status) {
                cc.log("cocos2d: ERROR: Failed to link program: " + this._programObj);
                cc.glDeleteProgram(this._programObj);
                this._programObj = null;
                return false;
            }
        }

        return true;
    },

    /**
     * it will call glUseProgram()
     */
    use: function () {
        cc.glUseProgram(this._programObj);
    },

    /**
     * It will create 4 uniforms:
     *  cc.UNIFORM_PMATRIX
     *  cc.UNIFORM_MVMATRIX
     *  cc.UNIFORM_MVPMATRIX
     *  cc.UNIFORM_SAMPLER
     */
    updateUniforms: function () {
        this._uniforms[cc.UNIFORM_PMATRIX] = this._glContext.getUniformLocation(this._programObj, cc.UNIFORM_PMATRIX_S);
        this._uniforms[cc.UNIFORM_MVMATRIX] = this._glContext.getUniformLocation(this._programObj, cc.UNIFORM_MVMATRIX_S);
        this._uniforms[cc.UNIFORM_MVPMATRIX] = this._glContext.getUniformLocation(this._programObj, cc.UNIFORM_MVPMATRIX_S);
        this._uniforms[cc.UNIFORM_TIME] = this._glContext.getUniformLocation(this._programObj, cc.UNIFORM_TIME_S);
        this._uniforms[cc.UNIFORM_SINTIME] = this._glContext.getUniformLocation(this._programObj, cc.UNIFORM_SINTIME_S);
        this._uniforms[cc.UNIFORM_COSTIME] = this._glContext.getUniformLocation(this._programObj, cc.UNIFORM_COSTIME_S);

        this._usesTime = (this._uniforms[cc.UNIFORM_TIME] != null || this._uniforms[cc.UNIFORM_SINTIME] != null || this._uniforms[cc.UNIFORM_COSTIME] != null);

        this._uniforms[cc.UNIFORM_RANDOM01] = this._glContext.getUniformLocation(this._programObj, cc.UNIFORM_RANDOM01_S);
        this._uniforms[cc.UNIFORM_SAMPLER] = this._glContext.getUniformLocation(this._programObj, cc.UNIFORM_SAMPLER_S);

        this.use();
        // Since sample most probably won't change, set it to 0 now.
        this.setUniformLocationWith1i(this._uniforms[cc.UNIFORM_SAMPLER], 0);
    },

    getUniformMVPMatrix: function () {
        return this._uniforms[cc.UNIFORM_MVPMATRIX];
    },

    getUniformSampler: function () {
        return this._uniforms[cc.UNIFORM_SAMPLER];
    },

    /**
     * calls glUniform1i only if the values are different than the previous call for this same shader program.
     * @param {WebGLUniformLocation} location
     * @param {Number} i1
     */
    setUniformLocationWith1i: function (location, i1) {
        var updated = this._updateUniformLocation(location, i1);
        if (updated)
            this._glContext.uniform1i(location, i1);
    },

    /**
     * calls glUniform1i only if the values are different than the previous call for this same shader program.
     * @param {WebGLUniformLocation} location
     * @param {Number} i1
     */
    setUniformLocationI32: function (location, i1) {
        this.setUniformLocationWith1i(arguments[0], arguments[1]);
    },

    /**
     * calls glUniform1f only if the values are different than the previous call for this same shader program.
     * @param {WebGLUniformLocation} location
     * @param {Number} f1
     */
    setUniformLocationWith1f: function (location, f1) {
        var updated = this._updateUniformLocation(location, f1);
        if (updated)
            this._glContext.uniform1f(location, f1);
    },

    /**
     * calls glUniform2f only if the values are different than the previous call for this same shader program.
     * @param {WebGLUniformLocation} location
     * @param {Number} f1
     * @param {Number} f2
     */
    setUniformLocationWith2f: function (location, f1, f2) {
        var floats = [f1, f2];
        var updated = this._updateUniformLocation(location, floats);
        if (updated)
            this._glContext.uniform2f(location, f1, f2);
    },

    /**
     * calls glUniform3f only if the values are different than the previous call for this same shader program.
     * @param {WebGLUniformLocation} location
     * @param {Number} f1
     * @param {Number} f2
     * @param {Number} f3
     */
    setUniformLocationWith3f: function (location, f1, f2, f3) {
        var floats = [f1, f2, f3];
        var updated = this._updateUniformLocation(location, floats);
        if (updated)
            this._glContext.uniform3f(location, f1, f2, f3);
    },

    /**
     * calls glUniform4f only if the values are different than the previous call for this same shader program.
     * @param {WebGLUniformLocation} location
     * @param {Number} f1
     * @param {Number} f2
     * @param {Number} f3
     * @param {Number} f4
     */
    setUniformLocationWith4f: function (location, f1, f2, f3, f4) {
        var floats = [f1, f2, f3, f4];
        var updated = this._updateUniformLocation(location, floats);
        if (updated)
            this._glContext.uniform4f(location, f1, f2, f3, f4);
    },

    /**
     * calls glUniform2fv only if the values are different than the previous call for this same shader program.
     * @param {WebGLUniformLocation} location
     * @param {Float32Array} floatArray
     * @param {Number} numberOfArrays
     */
    setUniformLocationWith2fv: function (location, floatArray, numberOfArrays) {
        var updated = this._updateUniformLocation(location, floatArray);
        if (updated)
            this._glContext.uniform2fv(location, floatArray);
    },

    /**
     * calls glUniform3fv only if the values are different than the previous call for this same shader program.
     * @param {WebGLUniformLocation} location
     * @param {Float32Array} floatArray
     * @param {Number} numberOfArrays
     */
    setUniformLocationWith3fv: function (location, floatArray, numberOfArrays) {
        var updated = this._updateUniformLocation(location, floatArray);
        if (updated)
            this._glContext.uniform3fv(location, floatArray);
    },

    /**
     * calls glUniform4fv only if the values are different than the previous call for this same shader program.
     * @param {WebGLUniformLocation} location
     * @param {Float32Array} floatArray
     * @param {Number} numberOfArrays
     */
    setUniformLocationWith4fv: function (location, floatArray, numberOfArrays) {
        var updated = this._updateUniformLocation(location, floatArray);
        if (updated)
            this._glContext.uniform4fv(location, floatArray);
    },

    /**
     * calls glUniformMatrix4fv only if the values are different than the previous call for this same shader program.
     * @param {WebGLUniformLocation} location
     * @param {Float32Array} matrixArray
     * @param {Number} numberOfMatrices
     */
    setUniformLocationWithMatrix4fv: function (location, matrixArray, numberOfMatrices) {
        var updated = this._updateUniformLocation(location, matrixArray);
        if (updated)
            this._glContext.uniformMatrix4fv(location, false, matrixArray);
    },

    setUniformLocationF32: function () {
        if (arguments.length < 2)
            return;

        switch (arguments.length) {
            case 2:
                this.setUniformLocationWith1f(arguments[0], arguments[1]);
                break;
            case 3:
                this.setUniformLocationWith2f(arguments[0], arguments[1], arguments[2]);
                break;
            case 4:
                this.setUniformLocationWith3f(arguments[0], arguments[1], arguments[2], arguments[3]);
                break;
            case 5:
                this.setUniformLocationWith4f(arguments[0], arguments[1], arguments[2], arguments[3], arguments[4]);
                break;
        }
    },

    /**
     * will update the builtin uniforms if they are different than the previous call for this same shader program.
     */
    setUniformsForBuiltins: function () {
        var matrixP = new cc.kmMat4();
        var matrixMV = new cc.kmMat4();
        var matrixMVP = new cc.kmMat4();

        cc.kmGLGetMatrix(cc.KM_GL_PROJECTION, matrixP);
        cc.kmGLGetMatrix(cc.KM_GL_MODELVIEW, matrixMV);

        cc.kmMat4Multiply(matrixMVP, matrixP, matrixMV);

        this.setUniformLocationWithMatrix4fv(this._uniforms[cc.UNIFORM_PMATRIX], matrixP.mat, 1);
        this.setUniformLocationWithMatrix4fv(this._uniforms[cc.UNIFORM_MVMATRIX], matrixMV.mat, 1);
        this.setUniformLocationWithMatrix4fv(this._uniforms[cc.UNIFORM_MVPMATRIX], matrixMVP.mat, 1);

        if (this._usesTime) {
            var director = cc.Director.getInstance();
            // This doesn't give the most accurate global time value.
            // Cocos2D doesn't store a high precision time value, so this will have to do.
            // Getting Mach time per frame per shader using time could be extremely expensive.
            var time = director.getTotalFrames() * director.getAnimationInterval();

            this.setUniformLocationWith4f(this._uniforms[cc.UNIFORM_TIME], time / 10.0, time, time * 2, time * 4);
            this.setUniformLocationWith4f(this._uniforms[cc.UNIFORM_SINTIME], time / 8.0, time / 4.0, time / 2.0, Math.sin(time));
            this.setUniformLocationWith4f(this._uniforms[cc.UNIFORM_COSTIME], time / 8.0, time / 4.0, time / 2.0, Math.cos(time));
        }

        if (this._uniforms[cc.UNIFORM_RANDOM01] != -1)
            this.setUniformLocationWith4f(this._uniforms[cc.UNIFORM_RANDOM01], Math.random(), Math.random(), Math.random(), Math.random());
    },

    /**
     * will update the MVP matrix on the MVP uniform if it is different than the previous call for this same shader program.
     */
    setUniformForModelViewProjectionMatrix: function () {
        this._glContext.uniformMatrix4fv(this._uniforms[cc.UNIFORM_MVPMATRIX], false,
            cc.getMat4MultiplyValue(cc.projection_matrix_stack.top, cc.modelview_matrix_stack.top));
        //this.setUniformLocationwithMatrix4fv(this._uniforms[cc.kCCUniformMVPMatrix],
        //cc.getMat4MultiplyValue(cc.projection_matrix_stack.top, cc.modelview_matrix_stack.top), 1);
    },

    setUniformForModelViewProjectionMatrixWithMat4: function (swapMat4) {
        cc.kmMat4Multiply(swapMat4, cc.projection_matrix_stack.top, cc.modelview_matrix_stack.top);
        this._glContext.uniformMatrix4fv(this._uniforms[cc.UNIFORM_MVPMATRIX], false, swapMat4.mat);
    },

    /**
     * returns the vertexShader error log
     * @return {String}
     */
    vertexShaderLog: function () {
        return this._glContext.getShaderInfoLog(this._vertShader);
    },

    /**
     * returns the vertexShader error log
     * @return {String}
     */
    getVertexShaderLog: function () {
        return this._glContext.getShaderInfoLog(this._vertShader);
    },

    /**
     * returns the fragmentShader error log
     * @returns {String}
     */
    getFragmentShaderLog: function () {
        return this._glContext.getShaderInfoLog(this._vertShader);
    },

    /**
     * returns the fragmentShader error log
     * @return {String}
     */
    fragmentShaderLog: function () {
        return this._glContext.getShaderInfoLog(this._fragShader);
    },

    /**
     * returns the program error log
     * @return {String}
     */
    programLog: function () {
        return this._glContext.getProgramInfoLog(this._programObj);
    },

    /**
     * returns the program error log
     * @return {String}
     */
    getProgramLog: function () {
        return this._glContext.getProgramInfoLog(this._programObj);
    },

    /**
     *  reload all shaders, this function is designed for android  <br/>
     *  when opengl context lost, so don't call it.
     */
    reset: function () {
        this._vertShader = null;
        this._fragShader = null;
        this._uniforms = [];

        // it is already deallocated by android
        //ccGLDeleteProgram(m_uProgram);
        this._glContext.deleteProgram(this._programObj);
        this._programObj = null;

        // Purge uniform hash
        for (var i = 0; i < this._hashForUniforms.length; i++) {
            this._hashForUniforms[i].value = null;
            this._hashForUniforms[i] = null;
        }

        this._hashForUniforms = [];
    },

    /**
     * get WebGLProgram object
     * @return {WebGLProgram}
     */
    getProgram: function () {
        return this._programObj;
    },

    /**
     * Currently JavaScript Bindigns (JSB), in some cases, needs to use retain and release. This is a bug in JSB,
     * and the ugly workaround is to use retain/release. So, these 2 methods were added to be compatible with JSB.
     * This is a hack, and should be removed once JSB fixes the retain/release bug
     */
    retain: function () {
    },
    release: function () {
    }
});

/**
 * Create a cc.GLProgram object
 * @param {String} vShaderFileName
 * @param {String} fShaderFileName
 * @returns {cc.GLProgram}
 */
cc.GLProgram.create = function (vShaderFileName, fShaderFileName) {
    var program = new cc.GLProgram();
    if (program.init(vShaderFileName, fShaderFileName))
        return program;
    return null;
};
