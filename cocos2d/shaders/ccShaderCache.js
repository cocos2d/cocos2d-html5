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

cc.kCCShaderType_PositionTextureColor = 0;

cc.kCCShaderType_PositionTextureColorAlphaTest = 1;

cc.kCCShaderType_PositionColor = 2;

cc.kCCShaderType_PositionTexture = 3;

cc.kCCShaderType_PositionTexture_uColor = 4;

cc.kCCShaderType_PositionTextureA8Color = 5;

cc.kCCShaderType_Position_uColor = 6;

cc.kCCShaderType_MAX = 7;

cc._sharedShaderCache = null;


/** CCShaderCache
 Singleton that stores manages GL shaders
 @since v2.0
 */
 cc.ShaderCache = cc.Class.extend({
     _programs:null,

     _init:function(){
         this._programs = {};
         this.loadDefaultShaders();
         return true;
     },

     _loadDefaultShader:function(p, type){
         switch (type) {
             case cc.kCCShaderType_PositionTextureColor:
                 p.initWithVertexShaderByteArray(cc.Shader_PositionTextureColor_vert, cc.Shader_PositionTextureColor_frag);

                 p.addAttribute(cc.ATTRIBUTE_NAME_POSITION, cc.VERTEX_ATTRIB_POSITION);
                 p.addAttribute(cc.ATTRIBUTE_NAME_COLOR, cc.VERTEX_ATTRIB_COLOR);
                 p.addAttribute(cc.ATTRIBUTE_NAME_TEXCOORD, cc.VERTEX_ATTRIB_TEXCOORDS);
                 break;
             case cc.kCCShaderType_PositionTextureColorAlphaTest:
                 p.initWithVertexShaderByteArray(cc.Shader_PositionTextureColor_vert, cc.Shader_PositionTextureColorAlphaTest_frag);

                 p.addAttribute(cc.ATTRIBUTE_NAME_POSITION, cc.VERTEX_ATTRIB_POSITION);
                 p.addAttribute(cc.ATTRIBUTE_NAME_COLOR, cc.VERTEX_ATTRIB_COLOR);
                 p.addAttribute(cc.ATTRIBUTE_NAME_TEXCOORD, cc.VERTEX_ATTRIB_TEXCOORDS);
                 break;
             case cc.kCCShaderType_PositionColor:
                 p.initWithVertexShaderByteArray(cc.Shader_PositionColor_vert ,cc.Shader_PositionColor_frag);

                 p.addAttribute(cc.ATTRIBUTE_NAME_POSITION, cc.VERTEX_ATTRIB_POSITION);
                 p.addAttribute(cc.ATTRIBUTE_NAME_COLOR, cc.VERTEX_ATTRIB_COLOR);
                 break;
             case cc.kCCShaderType_PositionTexture:
                 p.initWithVertexShaderByteArray(cc.Shader_PositionTexture_vert ,cc.Shader_PositionTexture_frag);

                 p.addAttribute(cc.ATTRIBUTE_NAME_POSITION, cc.VERTEX_ATTRIB_POSITION);
                 p.addAttribute(cc.ATTRIBUTE_NAME_TEXCOORD, cc.VERTEX_ATTRIB_TEXCOORDS);
                 break;
             case cc.kCCShaderType_PositionTexture_uColor:
                 p.initWithVertexShaderByteArray(cc.Shader_PositionTexture_uColor_vert, cc.Shader_PositionTexture_uColor_frag);

                 p.addAttribute(cc.ATTRIBUTE_NAME_POSITION, cc.VERTEX_ATTRIB_POSITION);
                 p.addAttribute(cc.ATTRIBUTE_NAME_TEXCOORD, cc.VERTEX_ATTRIB_TEXCOORDS);
                 break;
             case cc.kCCShaderType_PositionTextureA8Color:
                 p.initWithVertexShaderByteArray(cc.Shader_PositionTextureA8Color_vert, cc.Shader_PositionTextureA8Color_frag);

                 p.addAttribute(cc.ATTRIBUTE_NAME_POSITION, cc.VERTEX_ATTRIB_POSITION);
                 p.addAttribute(cc.ATTRIBUTE_NAME_COLOR, cc.VERTEX_ATTRIB_COLOR);
                 p.addAttribute(cc.ATTRIBUTE_NAME_TEXCOORD, cc.VERTEX_ATTRIB_TEXCOORDS);
                 break;
             case cc.kCCShaderType_Position_uColor:
                 p.initWithVertexShaderByteArray(cc.Shader_Position_uColor_vert, cc.Shader_Position_uColor_frag);

                 //p.addAttribute("aVertex", cc.kCCVertexAttrib_Position);
                 p.addAttribute(cc.ATTRIBUTE_NAME_POSITION, cc.VERTEX_ATTRIB_POSITION);
                 break;
             default:
                 cc.log("cocos2d: cc.ShaderCache._loadDefaultShader, error shader type");
                 return;
         }

         p.link();
         p.updateUniforms();

         cc.CHECK_GL_ERROR_DEBUG();
     },

     ctor:function(){
         this._programs = {};
     },

     /** loads the default shaders */
     loadDefaultShaders:function(){
         // Position Texture Color shader
         var p = new cc.GLProgram();
         this._loadDefaultShader(p, cc.kCCShaderType_PositionTextureColor);
         this._programs[cc.SHADER_POSITION_TEXTURECOLOR] = p;

         // Position Texture Color alpha test
         p = new cc.GLProgram();
         this._loadDefaultShader(p, cc.kCCShaderType_PositionTextureColorAlphaTest);
         this._programs[cc.SHADER_POSITION_TEXTURECOLORALPHATEST] = p;

         //
         // Position, Color shader
         //
         p = new cc.GLProgram();
         this._loadDefaultShader(p, cc.kCCShaderType_PositionColor);
         this._programs[cc.SHADER_POSITION_COLOR] = p;

         //
         // Position Texture shader
         //
         p = new cc.GLProgram();
         this._loadDefaultShader(p, cc.kCCShaderType_PositionTexture);
         this._programs[cc.SHADER_POSITION_TEXTURE] = p;

         //
         // Position, Texture attribs, 1 Color as uniform shader
         //
         p = new cc.GLProgram();
         this._loadDefaultShader(p, cc.kCCShaderType_PositionTexture_uColor);
         this._programs[cc.SHADER_POSITION_TEXTURE_UCOLOR] = p;

         //
         // Position Texture A8 Color shader
         //
         p = new cc.GLProgram();
         this._loadDefaultShader(p, cc.kCCShaderType_PositionTextureA8Color);
         this._programs[cc.SHADER_POSITION_TEXTUREA8COLOR] = p;

         //
         // Position and 1 color passed as a uniform (to similate glColor4ub )
         //
         p = new cc.GLProgram();
         this._loadDefaultShader(p, cc.kCCShaderType_Position_uColor);
         this._programs[cc.SHADER_POSITION_UCOLOR] = p;
     },

     /** reload the default shaders */
     reloadDefaultShaders:function(){
         // reset all programs and reload them

         // Position Texture Color shader
         var p = this.programForKey(cc.SHADER_POSITION_TEXTURECOLOR);
         p.reset();
         this._loadDefaultShader(p, cc.kCCShaderType_PositionTextureColor);

         // Position Texture Color alpha test
         p = this.programForKey(cc.SHADER_POSITION_TEXTURECOLORALPHATEST);
         p.reset();
         this._loadDefaultShader(p, cc.kCCShaderType_PositionTextureColorAlphaTest);

         //
         // Position, Color shader
         //
         p = this.programForKey(cc.SHADER_POSITION_COLOR);
         p.reset();
         this._loadDefaultShader(p, cc.kCCShaderType_PositionColor);

         //
         // Position Texture shader
         //
         p = this.programForKey(cc.SHADER_POSITION_TEXTURE);
         p.reset();
         this._loadDefaultShader(p, cc.kCCShaderType_PositionTexture);

         //
         // Position, Texture attribs, 1 Color as uniform shader
         //
         p = this.programForKey(cc.SHADER_POSITION_TEXTURE_UCOLOR);
         p.reset();
         this._loadDefaultShader(p,cc.kCCShaderType_PositionTexture_uColor);

         //
         // Position Texture A8 Color shader
         //
         p = this.programForKey(cc.SHADER_POSITION_TEXTUREA8COLOR);
         p.reset();
         this._loadDefaultShader(p, cc.kCCShaderType_PositionTextureA8Color);

         //
         // Position and 1 color passed as a uniform (to similate glColor4ub )
         //
         p = this.programForKey(cc.SHADER_POSITION_UCOLOR);
         p.reset();
         this._loadDefaultShader(p, cc.kCCShaderType_Position_uColor);
     },

     /** returns a GL program for a given key */
     programForKey:function(key){
         if(this._programs.hasOwnProperty(key))
            return this._programs[key];

         return null;
     },

     /** adds a CCGLProgram to the cache for a given name */
     addProgram:function(program, key){
         this._programs[key] = program;
     }
 });

/** returns the shared instance */
cc.ShaderCache.getInstance = function(){
    if (!cc._sharedShaderCache) {
        cc._sharedShaderCache = new cc.ShaderCache();
        cc._sharedShaderCache._init();
    }
    return cc._sharedShaderCache;
};

/** purges the cache. It releases the retained instance. */
cc.ShaderCache.purgeSharedShaderCache = function(){
    cc._sharedShaderCache = null;
};