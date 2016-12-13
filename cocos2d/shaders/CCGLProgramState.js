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

var types = 
	{
		GL_FLOAT: 0,
		GL_INT: 1,
		GL_FLOAT_VEC2: 2,
		GL_FLOAT_VEC3: 3,
		GL_FLOAT_VEC4: 4,
		GL_FLOAT_MAT4: 5,
		GL_CALLBACK: 6,
		GL_TEXTURE: 7
	};

cc.UniformValue = cc.Class.extend({		
	_uniform: null,
	_glprogram: null,
	_value: null,
	_type: -1,

	ctor: function ctor(uniform, glprogram) {
		this._uniform = uniform;
		this._glprogram = glprogram;
	},

	setFloat: function setFloat(value) {
		this._value = value;
		this._type = types.GL_FLOAT;
	}, 

	setInt: function setInt(value) {
		this._value = value;
		this._type = types.GL_INT;
	},

	setVec2: function setVec2(v1, v2) {
		this._value = [v1, v2];
		this._type = types.GL_FLOAT_VEC2;
	},

	setVec2v: function setVec2v(value) {
		this._value = value;
		this._type = types.GL_FLOAT_VEC2;
	},

	setVec3: function setVec3(v1, v2, v3) {
		this._value = [v1, v2, v3];
		this._type = types.GL_FLOAT_VEC3;
	},

	setVec3v: function setVec3v(value) {
		this._value = value;
		this._type = types.GL_FLOAT_VEC3;
	},

	setVec4: function setVec4(v1, v2, v3, v4) {
		this._value = [v1, v2, v3, v4];
		this._type = types.GL_FLOAT_VEC4;
	},

	setVec4v: function setVec4v(value) {
		this._value = value;
		this._type = types.GL_FLOAT_VEC4;
	},

	setMat4: function setMat4(value) {
		this._value = value;
		this._type = types.GL_FLOAT_MAT4;
	},

	setCallback: function setCallback(fn) {
		this._value = fn;
		this._type = types.GL_CALLBACK;
	},

	setTexture: function setTexture(textureId, textureUnit) {
		this._value = textureUnit;
		this._textureId = textureId;
		this._type = types.GL_TEXTURE;
	},

	apply: function apply() {
		switch (this._type) {
			case types.GL_INT:
				this._glprogram.setUniformLocationWith1i(this._uniform.location, this._value);
				break;
			case types.GL_FLOAT:
				this._glprogram.setUniformLocationWith1f(this._uniform.location, this._value);
				break;
			case types.GL_FLOAT_VEC2:
				this._glprogram.setUniformLocationWith2f(this._uniform.location, this._value[0], this._value[1]);
				break;
			case types.GL_FLOAT_VEC3:
				this._glprogram.setUniformLocationWith3f(this._uniform.location, this._value[0], 
					this._value[1], this._value[2]);
				break;
			case types.GL_FLOAT_VEC4:
				this._glprogram.setUniformLocationWith4f(this._uniform.location, this._value[0], 
					this._value[1], this._value[2], this._value[3]);
				break;
			case types.GL_FLOAT_MAT4:
				this._glprogram.setUniformLocationWithMatrix4fv(this._uniform.location, this._value);
				break;
			case types.GL_CALLBACK:
				this._value(this._glprogram, this._uniform);
				break;
			case types.GL_TEXTURE:
				this._glprogram.setUniformLocationWith1i(this._uniform.location, this._value);
				cc.glBindTexture2DN(this._value, this._textureId);
				break;
			default:
				;
		}
	},
});

cc.GLProgramState = cc.Class.extend({
	_glprogram: null,
	_uniformsByName: null,
	_uniformsByLocation: null,
	_boundTextureUnits: null,
	_textureUnitIndex: 0,

	init: function init(glprogram) {
		this._glprogram = glprogram;
		this._uniformsByName = {};
		this._uniformsByLocation = {};
		this._boundTextureUnits = {};
		this._textureUnitIndex = 1; // Start at 1, as CC_Texture0 is bound to 0
		var userUniformKeys = Object.keys(glprogram._userUniforms);
		for (var i = 0; i < userUniformKeys.length; ++i) {
			var uniform = glprogram._userUniforms[userUniformKeys[i]];
			var uniformValue = new cc.UniformValue(uniform, glprogram);
			this._uniformsByName[uniform.name] = uniformValue;
			this._uniformsByLocation[uniform.location] = uniformValue;
		}
	},

	apply: function apply(modelView) {
		this.applyGLProgram(modelView);
		this.applyUniforms();
	},

	applyGLProgram: function applyGLProgram(modelView) {
		this._glprogram.use();
		if (modelView) {
			this._glprogram._setUniformForMVPMatrixWithMat4(modelView);
		}
	},

	applyUniforms: function applyUniforms() {
		var uniformKeys = Object.keys(this._uniformsByName); 
		for (var i = 0; i < uniformKeys.length; ++i) {
			var uniform = this._uniformsByName[uniformKeys[i]];
			uniform.apply();
		}
	},

	setGLProgram: function setGLProgram(glprogram) {
		this._glprogram = glprogram;
	},

	getGLProgram: function getGLProgram() {
		return this._glprogram;
	},

	getUniformCount: function getUniformCount() {
		return Object.keys(this._uniformsByName).length;
	},

	getUniformValue: function getUniformValue(uniform) 
	{
		if (typeof uniform === 'string') {
			return this._uniformsByName[uniform];
		} else { 
			return this._uniformsByLocation[uniform];
		}
	},

	// Accepts either string or uniform location
	setUniformInt: function setUniformInt(uniform, value) {
		var v = this.getUniformValue(uniform);
		if (v) {
			v.setInt(value);
		} else {
			cc.log("cocos2d: warning: Uniform not found: " + uniform);
		}
	},

	setUniformFloat: function setUniformFloat(uniform, value) {
		var v = this.getUniformValue(uniform);
		if (v) {
			v.setFloat(value);
		} else {
			cc.log("cocos2d: warning: Uniform not found: " + uniform);
		}
	},

	setUniformVec2: function setUniformVec2(uniform, v1, v2) {
		var v = this.getUniformValue(uniform);
		if (v) {
			v.setVec2(v1, v2);
		} else {
			cc.log("cocos2d: warning: Uniform not found: " + uniform);
		}
	},
    
	setUniformVec2v: function setUniformVec2v(uniform, value) {
		var v = this.getUniformValue(uniform);
		if (v) {
			v.setVec2v(value);
		} else {
			cc.log("cocos2d: warning: Uniform not found: " + uniform);
		}
	},
    
	setUniformVec3: function setUniformVec3(uniform, v1, v2, v3) {
		var v = this.getUniformValue(uniform);
		if (v) {
			v.setVec3(v1, v2, v3);
		} else {
			cc.log("cocos2d: warning: Uniform not found: " + uniform);
		}
	},

	setUniformVec3v: function setUniformVec3v(uniform, value) {
		var v = this.getUniformValue(uniform);
		if (v) {
			v.setVec3v(value);
		} else {
			cc.log("cocos2d: warning: Uniform not found: " + uniform);
		}
	},
    
	setUniformVec4: function setUniformVec4(uniform, v1, v2, v3, v4) {
		var v = this.getUniformValue(uniform);
		if (v) {
			v.setVec4(v1, v2, v3, v4);
		} else {
			cc.log("cocos2d: warning: Uniform not found: " + uniform);
		}
	},

	setUniformVec4v: function setUniformVec4v(uniform, value) {
		var v = this.getUniformValue(uniform);
		if (v) {
			v.setVec4v(value);
		} else {
			cc.log("cocos2d: warning: Uniform not found: " + uniform);
		}
	},

    
	setUniformMat4: function setUniformMat4(uniform, value) {
		var v = this.getUniformValue(uniform);
		if (v) {
			v.setMat4(value);
		} else {
			cc.log("cocos2d: warning: Uniform not found: " + uniform);
		}

	},

	setUniformCallback: function setUniformCallback(uniform, callback) {
		var v = this.getUniformValue(uniform);
		if (v) {
			v.setCallback(callback);
		} else {
			cc.log("cocos2d: warning: Uniform not found: " + uniform);
		}

	},
	
	setUniformTexture: function setUniformTexture(uniform, texture) {
		var uniformValue = this.getUniformValue(uniform);
		if (uniformValue) {
		    var textureUnit = this._boundTextureUnits[uniform];
		    if (textureUnit) {
			uniformValue.setTexture(texture, textureUnit);
		    } else {
			uniformValue.setTexture(texture, this._textureUnitIndex);
			this._boundTextureUnits[uniform] = this._textureUnitIndex++;	
		    }
		}
	}
});

cc.GLProgramState._cache = {};
cc.GLProgramState.getOrCreateWithGLProgram = function (glprogram) {
	var programState = cc.GLProgramState._cache[glprogram.__instanceId];
	if (!programState) {
		programState = new cc.GLProgramState();
		programState.init(glprogram);
		cc.GLProgramState._cache[glprogram.__instanceId] = programState;
	}

	return programState;
};
