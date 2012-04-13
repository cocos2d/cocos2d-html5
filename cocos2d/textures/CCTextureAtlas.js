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
var cc = cc = cc || {};

/** @brief A class that implements a Texture Atlas.
 Supported features:
 * The atlas file can be a PVRTC, PNG or any other fomrat supported by Texture2D
 * Quads can be udpated in runtime
 * Quads can be added in runtime
 * Quads can be removed in runtime
 * Quads can be re-ordered in runtime
 * The TextureAtlas capacity can be increased or decreased in runtime
 * OpenGL component: V3F, C4B, T2F.
 The quads are rendered using an OpenGL ES VBO.
 To render the quads using an interleaved vertex array list, you should modify the ccConfig.h file
 */
cc.TextureAtlas = cc.Class.extend({
    _m_pIndices:[],
    //0: vertex  1: indices
    _m_pBuffersVBO:[0,1],
    //indicates whether or not the array buffer of the VBO needs to be updated
    _m_bDirty:false,
    _m_uCapacity:0,
    _m_pTexture:null,
    _m_pQuads:[],
    /**
     * Property
     */
    /** quantity of quads that are going to be drawn */
    getTotalQuads:function(){return this._m_pQuads.length;},
    /** quantity of quads that can be stored with the current texture atlas size */
    getCapacity:function(){return this._m_uCapacity;},
    /** Texture of the texture atlas */
    getTexture:function(){return this._m_pTexture;},
    setTexture:function(texture){this._m_pTexture = texture;},
    /** Quads that are going to be rendered */
    getQuads:function(){return this._m_pQuads;},
    setQuads:function(quads){this._m_pQuads = quads;},

    description:function(){return '<CCTextureAtlas | totalQuads ='+ this._m_uTotalQuads +'>';},

    _initIndices:function(){
        if (this._m_uCapacity == 0)
            return;

        for( var i=0; i < this._m_uCapacity; i++){
            this._m_pIndices[i*6+0] = i*4+0;
            this._m_pIndices[i*6+1] = i*4+0;
            this._m_pIndices[i*6+2] = i*4+2;
            this._m_pIndices[i*6+3] = i*4+1;
            this._m_pIndices[i*6+4] = i*4+3;
            this._m_pIndices[i*6+5] = i*4+3;
        }

        //TODO GL
        //glBindBuffer(GL_ARRAY_BUFFER, m_pBuffersVBO[0]);
        //glBufferData(GL_ARRAY_BUFFER, sizeof(m_pQuads[0]) * m_uCapacity, m_pQuads, GL_DYNAMIC_DRAW);
        //glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, m_pBuffersVBO[1]);
        //glBufferData(GL_ELEMENT_ARRAY_BUFFER, sizeof(m_pIndices[0]) * m_uCapacity * 6, m_pIndices, GL_STATIC_DRAW);
        //glBindBuffer(GL_ARRAY_BUFFER, 0);
        //glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, 0);
    },



    /** initializes a TextureAtlas with a filename and with a certain capacity for Quads.
     * The TextureAtlas capacity can be increased in runtime.
     *
     * WARNING: Do not reinitialize the TextureAtlas because it will leak memory (issue #706)
     */
    initWithFile:function(file,capacity){
        // retained in property
        var texture = cc.TextureCache.sharedTextureCache().addImage(file);

        if (texture){
            return this.initWithTexture(texture, capacity);
        }else{
            cc.LOG("cocos2d: Could not open file: "+ file);
            return null;
        }
    },

    /** initializes a TextureAtlas with a previously initialized Texture2D object, and
     * with an initial capacity for Quads.
     * The TextureAtlas capacity can be increased in runtime.
     *
     * WARNING: Do not reinitialize the TextureAtlas because it will leak memory (issue #706)
     */
    initWithTexture:function(texture,capacity){
        cc.Assert(texture != null, "TextureAtlas.initWithTexture():texture should not be null");
        this._m_uCapacity = capacity;

        // retained in property
        this._m_pTexture = texture;

        // Re-initialization is not allowed
        cc.Assert(this._m_pQuads.length == 0 && this._m_pIndices.length == 0, "TextureAtlas.initWithTexture():_m_pQuads and _m_pIndices should not be null");

        //TODO init array
        this._m_pQuads = [];
        this._m_pIndices = [];

        if( ! ( this._m_pQuads && this._m_pIndices) && this._m_uCapacity > 0) {
            return false;
        }
        // initial binding
        //TODO GL
        //glGenBuffers(2, &m_pBuffersVBO[0]);
        this._m_bDirty = true;

        this._initIndices();

        return true;
    },

    /** updates a Quad (texture, vertex and color) at a certain index
     * index must be between 0 and the atlas capacity - 1
     @since v0.8
     */
    updateQuad:function(quad,index){
        //cc.Assert( index >= 0 && index < this._m_uCapacity, "TextureAtlas.updateQuad():updateQuadWithTexture: Invalid index");

        this._m_pQuads[index] = quad;
        this._m_bDirty = true;
    },

    /** Inserts a Quad (texture, vertex and color) at a certain index
     index must be between 0 and the atlas capacity - 1
     @since v0.8
     */
    insertQuad:function(quad,index){
        //cc.Assert( index < this._m_uCapacity, "TextureAtlas.insertQuad():insertQuadWithTexture: Invalid index");

        this._m_pQuads = cc.ArrayAppendObjectToIndex(this._m_pQuads,quad,index);
        this._m_bDirty = true;
    },

    /** Removes the quad that is located at a certain index and inserts it at a new index
     This operation is faster than removing and inserting in a quad in 2 different steps
     @since v0.7.2
     */
    insertQuadFromIndex:function(fromIndex,newIndex){
        //cc.Assert( newIndex >= 0 && newIndex < this._m_pQuads.length, "TextureAtlas.insertQuadFromIndex():atIndex: Invalid index");
        //cc.Assert( fromIndex >= 0 && fromIndex < this._m_pQuads.length, "TextureAtlas.insertQuadFromIndex():atIndex: Invalid index");

        if( fromIndex == newIndex )
            return;

        var quad = this._m_pQuads[fromIndex];
        cc.ArrayRemoveObjectAtIndex(this._m_pQuads,fromIndex);
        if(fromIndex > newIndex){
            this._m_pQuads = cc.ArrayAppendObjectToIndex(this._m_pQuads,quad,newIndex);
        }else{
            this._m_pQuads = cc.ArrayAppendObjectToIndex(this._m_pQuads,quad,newIndex-1);
        }

        this._m_bDirty = true;
    },

    /** removes a quad at a given index number.
     The capacity remains the same, but the total number of quads to be drawn is reduced in 1
     @since v0.7.2
     */
    removeQuadAtIndex:function(index){
        //cc.Assert( index < this._m_pQuads.length, "TextureAtlas.insertQuadFromIndex():removeQuadAtIndex: Invalid index");
        cc.ArrayRemoveObjectAtIndex(this._m_pQuads,index);

        this._m_bDirty = true;
    },

    /** removes all Quads.
     The TextureAtlas capacity remains untouched. No memory is freed.
     The total number of quads to be drawn will be 0
     @since v0.7.2
     */
    removeAllQuads:function(){
        this._m_pQuads.length = 0;
    },

    /** resize the capacity of the CCTextureAtlas.
     * The new capacity can be lower or higher than the current one
     * It returns YES if the resize was successful.
     * If it fails to resize the capacity it will return NO with a new capacity of 0.
     * no used for js
     */
    resizeCapacity:function(newCapacity){
        if( newCapacity == this._m_uCapacity )
            return true;

        return true;
    },

    /** draws n quads from an index (offset).
     n + start can't be greater than the capacity of the atlas

     @since v1.0
     */
    drawNumberOfQuads:function(n,start){
        // Default GL states: GL_TEXTURE_2D, GL_VERTEX_ARRAY, GL_COLOR_ARRAY, GL_TEXTURE_COORD_ARRAY
        // Needed states: GL_TEXTURE_2D, GL_VERTEX_ARRAY, GL_COLOR_ARRAY, GL_TEXTURE_COORD_ARRAY
        // Unneeded states: -
        if (0 == n)
            return;

        //TODO Code for OpenGL
        /****
         *

        glBindTexture(GL_TEXTURE_2D, m_pTexture->getName());


            glBindBuffer(GL_ARRAY_BUFFER, m_pBuffersVBO[0]);


            glBufferData(GL_ARRAY_BUFFER, sizeof(m_pQuads[0]) * m_uCapacity, m_pQuads, GL_DYNAMIC_DRAW);


        // XXX: update is done in draw... perhaps it should be done in a timer
        if (m_bDirty)
        {
            glBufferSubData(GL_ARRAY_BUFFER, sizeof(m_pQuads[0]) * start, sizeof(m_pQuads[0]) * n, &m_pQuads[start]);
            m_bDirty = false;
        }


        // vertices
        glVertexPointer(3, GL_FLOAT, kQuadSize, (GLvoid*) offsetof( ccV3F_C4B_T2F, vertices));

        // colors
        glColorPointer(4, GL_UNSIGNED_BYTE, kQuadSize, (GLvoid*) offsetof( ccV3F_C4B_T2F, colors));

        // texture coords
        glTexCoordPointer(2, GL_FLOAT, kQuadSize, (GLvoid*) offsetof( ccV3F_C4B_T2F, texCoords));

        glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, m_pBuffersVBO[1]);


            glBufferData(GL_ELEMENT_ARRAY_BUFFER, sizeof(m_pIndices[0]) * m_uCapacity * 6, m_pIndices, GL_STATIC_DRAW);



            glDrawElements(GL_TRIANGLE_STRIP, (GLsizei)n*6, GL_UNSIGNED_SHORT, (GLvoid*)(start * 6 * sizeof(m_pIndices[0])));

        glDrawElements(GL_TRIANGLES, (GLsizei)n*6, GL_UNSIGNED_SHORT, (GLvoid*)(start * 6 * sizeof(m_pIndices[0])));


        glBindBuffer(GL_ARRAY_BUFFER, 0);
        glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, 0);



        unsigned int offset = (unsigned int)m_pQuads;

        // vertex
        unsigned int diff = offsetof( ccV3F_C4B_T2F, vertices);
        glVertexPointer(3, GL_FLOAT, kQuadSize, (GLvoid*) (offset + diff) );

        // color
        diff = offsetof( ccV3F_C4B_T2F, colors);
        glColorPointer(4, GL_UNSIGNED_BYTE, kQuadSize, (GLvoid*)(offset + diff));

        // texture coords
        diff = offsetof( ccV3F_C4B_T2F, texCoords);
        glTexCoordPointer(2, GL_FLOAT, kQuadSize, (GLvoid*)(offset + diff));


            glDrawElements(GL_TRIANGLE_STRIP, n*6, GL_UNSIGNED_SHORT, m_pIndices + start * 6);

        glDrawElements(GL_TRIANGLES, n*6, GL_UNSIGNED_SHORT, m_pIndices + start * 6);
         */
    },

    /** draws all the Atlas's Quads
     */
    drawQuads:function(){
        this.drawNumberOfQuads(this._m_pQuads.length,0);
    }
});

/** creates a TextureAtlas with an filename and with an initial capacity for Quads.
 * The TextureAtlas capacity can be increased in runtime.
 */
cc.TextureAtlas.textureAtlasWithFile=function(file,capacity){
    var pTextureAtlas = new cc.TextureAtlas();
    if(pTextureAtlas && pTextureAtlas.initWithFile(file, capacity)){
        return pTextureAtlas;
    }
    return null;
};

/** creates a TextureAtlas with a previously initialized Texture2D object, and
 * with an initial capacity for n Quads.
 * The TextureAtlas capacity can be increased in runtime.
 */
cc.TextureAtlas.textureAtlasWithTexture = function(texture,capacity){
    var pTextureAtlas = new cc.TextureAtlas();
    if (pTextureAtlas && pTextureAtlas.initWithTexture(texture, capacity)){
        return pTextureAtlas;
    }
    return null;
};