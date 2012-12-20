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

//-------------kCCVertexAttrib-----------
cc.VERTEX_ATTRIB_POSITION = 0;
cc.VERTEX_ATTRIB_COLOR = 1;
cc.VERTEX_ATTRIB_TEXCOORDS = 2;
cc.VERTEX_ATTRIB_MAX = 3;

//------------kCCUniform------------------
cc.UNIFORM_PMATRIX = 0;
cc.UNIFORM_MVMATRIX = 1;
cc.UNIFORM_MVPMATRIX = 2;
cc.UNIFORM_TIME = 3;
cc.UNIFORM_SINTIME = 4;
cc.UNIFORM_COSTIME = 5;
cc.UNIFORM_RANDOM01 = 6;
cc.UNIFORM_SAMPLER = 7;
cc.UNIFORM_MAX = 8;

//------------kCCShader name---------------
cc.SHADER_POSITION_TEXTURECOLOR = "ShaderPositionTextureColor";
cc.SHADER_POSITION_TEXTURECOLORALPHATEST = "ShaderPositionTextureColorAlphaTest";
cc.SHADER_POSITION_COLOR = "ShaderPositionColor";
cc.SHADER_POSITION_TEXTURE = "ShaderPositionTexture";
cc.SHADER_POSITION_TEXTURE_UCOLOR = "ShaderPositionTexture_uColor";
cc.SHADER_POSITION_TEXTUREA8COLOR = "ShaderPositionTextureA8Color";
cc.SHADER_POSITION_UCOLOR = "ShaderPosition_uColor";
cc.SHADER_POSITION_LENGTHTEXTURECOLOR = "ShaderPositionLengthTextureColor";

//------------uniform names----------------
cc.UNIFORM_PMATRIX_S = "CC_PMatrix";
cc.UNIFORM_MVMATRIX_S = "CC_MVMatrix";
cc.UNIFORM_MVPMATRIX_S = "u_MVPMatrix";
cc.UNIFORM_TIME_S = "CC_Time";
cc.UNIFORM_SINTIME_S = "CC_SinTime";
cc.UNIFORM_COSTIME_S = "CC_CosTime";
cc.UNIFORM_RANDOM01_S = "CC_Random01";
cc.UNIFORM_SAMPLER_S = "CC_Texture0";
cc.UNIFORM_ALPHATEST_VALUE = "CC_alpha_value";

//------------Attribute names--------------
cc.ATTRIBUTE_NAME_COLOR = "a_color";
cc.ATTRIBUTE_NAME_POSITION = "a_position";
cc.ATTRIBUTE_NAME_TEXCOORD = "a_texCoord";

cc.HashUniformEntry = function (value, location, hh) {
    this.value = value || 0;
    this.location = location || 0;
    this.hh = hh || {};
};

/**
 * Class that implements a glProgram
 * @class
 * @extends cc.Class
 */
cc.GLProgram = cc.Class.extend({
    _glContext:null,
    _programObj:null,
    _vertShader:null,
    _fragShader:null,
    _uniforms:null,
    _hashForUniforms:null,
    _usesTime:false,

    // Uniform cache
    _updateUniformLocation:function (location, data, bytes) {
        if(location == null)
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

    _description:function () {
        return "<CCGLProgram = " + this.toString() + " | Program = " + this._programObj.toString() + ", VertexShader = " +
            this._vertShader.toString() + ", FragmentShader = " + this._fragShader.toString() + ">";
    },

    _compileShader:function (shader, type, source) {
        if (!source || !shader)
            return false;

        //shader = this._glContext.createShader(type);
        this._glContext.shaderSource(shader, source);
        cc.CHECK_GL_ERROR_DEBUG();
        this._glContext.compileShader(shader);
        cc.CHECK_GL_ERROR_DEBUG();

        var status = this._glContext.getShaderParameter(shader, this._glContext.COMPILE_STATUS);
        cc.CHECK_GL_ERROR_DEBUG();

        if (!status) {
            if (type == this._glContext.VERTEX_SHADER)
                cc.log("cocos2d: " + this.vertexShaderLog());
            else
                cc.log("cocos2d: " + this.fragmentShaderLog());
        }
        return ( status == 1 );
    },

    ctor:function (glContext) {
        this._programObj = null;
        this._vertShader = null;
        this._fragShader = null;
        this._uniforms = [];
        this._hashForUniforms = [];
        this._glContext = glContext || cc.webglContext;
    },

    destroyProgram:function(){
        this._vertShader = null;
        this._fragShader = null;
        this._uniforms = null;
        this._hashForUniforms = null;

        this._glContext.deleteProgram(this._programObj);
    },

    /**
     * Initializes the cc.GLProgram with a vertex and fragment with string
     * @param {string} vertShaderStr
     * @param {string} fragShaderStr
     * @return {Boolean}
     */
    initWithVertexShaderByteArray:function (vertShaderStr, fragShaderStr) {
        this._programObj = cc.webglContext.createProgram();
        cc.CHECK_GL_ERROR_DEBUG();

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
     * It will add a new attribute to the shader
     * @param attributeName
     * @param index
     */
    addAttribute:function (attributeName, index) {
        this._glContext.bindAttribLocation(this._programObj, index, attributeName);
    },

    /**
     * links the glProgram
     * @return {Boolean}
     */
    link:function () {
        cc.Assert(this._programObj != null, "Cannot link invalid program");

        this._glContext.linkProgram(this._programObj);

        if (this._vertShader)
            this._glContext.deleteShader(this._vertShader);
        if (this._fragShader)
            this._glContext.deleteShader(this._fragShader);

        this._vertShader = null;
        this._fragShader = null;

        if(cc.COCOS2D_DEBUG){
            var status = this._glContext.getProgramParameter(this._programObj, this._glContext.LINK_STATUS);
            if(!status){
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
    use:function () {
        cc.glUseProgram(this._programObj);
    },

    /**
     * It will create 4 uniforms:
     *  cc.UNIFORM_PMATRIX
     *  cc.UNIFORM_MVMATRIX
     *  cc.UNIFORM_MVPMATRIX
     *  cc.UNIFORM_SAMPLER
     */
    updateUniforms:function () {
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

    getUniformMVPMatrix:function () {
        return this._uniforms[cc.UNIFORM_MVPMATRIX];
    },

    getUniformSampler:function () {
        return this._uniforms[cc.UNIFORM_SAMPLER];
    },

    /**
     * calls glUniform1i only if the values are different than the previous call for this same shader program.
     * @param {WebGLUniformLocation} location
     * @param {Number} i1
     */
    setUniformLocationWith1i:function (location, i1) {
        var updated = this._updateUniformLocation(location, i1);
        if (updated)
            this._glContext.uniform1i(location, i1);
    },

    /**
     * calls glUniform1f only if the values are different than the previous call for this same shader program.
     * @param {WebGLUniformLocation} location
     * @param {Number} f1
     */
    setUniformLocationWith1f:function (location, f1) {
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
    setUniformLocationWith2f:function (location, f1, f2) {
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
    setUniformLocationWith3f:function (location, f1, f2, f3) {
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
    setUniformLocationWith4f:function (location, f1, f2, f3, f4) {
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
    setUniformLocationWith2fv:function (location, floatArray, numberOfArrays) {
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
    setUniformLocationWith3fv:function (location, floatArray, numberOfArrays) {
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
    setUniformLocationWith4fv:function (location, floatArray, numberOfArrays) {
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
    setUniformLocationWithMatrix4fv:function (location, matrixArray, numberOfMatrices) {
        var updated = this._updateUniformLocation(location, matrixArray);
        if (updated)
            this._glContext.uniformMatrix4fv(location, false, matrixArray);
    },

    /**
     * will update the builtin uniforms if they are different than the previous call for this same shader program.
     */
    setUniformsForBuiltins:function(){
        var matrixP = new cc.kmMat4();
        var matrixMV = new cc.kmMat4();
        var matrixMVP = new cc.kmMat4();

        cc.kmGLGetMatrix(cc.KM_GL_PROJECTION, matrixP);
        cc.kmGLGetMatrix(cc.KM_GL_MODELVIEW, matrixMV);

        cc.kmMat4Multiply(matrixMVP, matrixP, matrixMV);

        this.setUniformLocationWithMatrix4fv(this._uniforms[cc.UNIFORM_PMATRIX], matrixP.mat, 1);
        this.setUniformLocationWithMatrix4fv(this._uniforms[cc.UNIFORM_MVMATRIX], matrixMV.mat, 1);
        this.setUniformLocationWithMatrix4fv(this._uniforms[cc.UNIFORM_MVPMATRIX], matrixMVP.mat, 1);

        if(this._usesTime) {
            var director = cc.Director.getInstance();
            // This doesn't give the most accurate global time value.
            // Cocos2D doesn't store a high precision time value, so this will have to do.
            // Getting Mach time per frame per shader using time could be extremely expensive.
            var time = director.getTotalFrames() * director.getAnimationInterval();

            this.setUniformLocationWith4f(this._uniforms[cc.UNIFORM_TIME], time/10.0, time, time*2, time*4);
            this.setUniformLocationWith4f(this._uniforms[cc.UNIFORM_SINTIME], time/8.0, time/4.0, time/2.0, Math.sin(time));
            this.setUniformLocationWith4f(this._uniforms[cc.UNIFORM_COSTIME], time/8.0, time/4.0, time/2.0, Math.cos(time));
        }

        if (this._uniforms[cc.UNIFORM_RANDOM01] != -1)
            this.setUniformLocationWith4f(this._uniforms[cc.UNIFORM_RANDOM01], Math.random(), Math.random(), Math.random(), Math.random());
    },

    /**
     * will update the MVP matrix on the MVP uniform if it is different than the previous call for this same shader program.
     */
    setUniformForModelViewProjectionMatrix:function () {
        this._glContext.uniformMatrix4fv(this._uniforms[cc.UNIFORM_MVPMATRIX], false,
            cc.getMat4MultiplyValue(cc.projection_matrix_stack.top, cc.modelview_matrix_stack.top));
        //this.setUniformLocationwithMatrix4fv(this._uniforms[cc.kCCUniformMVPMatrix],
        //cc.getMat4MultiplyValue(cc.projection_matrix_stack.top, cc.modelview_matrix_stack.top), 1);
    },

    setUniformForModelViewProjectionMatrixWithMat4:function (swapMat4) {
        cc.kmMat4Multiply(swapMat4, cc.projection_matrix_stack.top, cc.modelview_matrix_stack.top);
        this._glContext.uniformMatrix4fv(this._uniforms[cc.UNIFORM_MVPMATRIX], false, swapMat4.mat);
    },

    /**
     * returns the vertexShader error log
     * @return {String}
     */
    vertexShaderLog:function () {
        return this._glContext.getShaderInfoLog(this._vertShader);
    },

    /**
     * returns the fragmentShader error log
     * @return {String}
     */
    fragmentShaderLog:function () {
        return this._glContext.getShaderInfoLog(this._fragShader);
    },

    /**
     * returns the program error log
     * @return {String}
     */
    programLog:function () {
        return this._glContext.getProgramInfoLog(this._programObj);
    },

    // reload all shaders, this function is designed for android
    // when opengl context lost, so don't call it.
    reset:function () {
        this._vertShader = null;
        this._fragShader = null;
        this._uniforms = [];

        // it is already deallocated by android
        //ccGLDeleteProgram(m_uProgram);
        this._programObj = null;

        // Purge uniform hash
        for (var i = 0; i < this._hashForUniforms.length; i++) {
            this._hashForUniforms[i].value = null;
            this._hashForUniforms[i] = null;
        }

        this._hashForUniforms = [];
    },

    getProgram:function () {
        return this._programObj;
    }
});