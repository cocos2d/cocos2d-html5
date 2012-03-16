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

/** @brief CCAtlasNode is a subclass of CCNode that implements the CCRGBAProtocol and
 CCTextureProtocol protocol

 It knows how to render a TextureAtlas object.
 If you are going to render a TextureAtlas consider subclassing CCAtlasNode (or a subclass of CCAtlasNode)

 All features from CCNode are valid, plus the following features:
 - opacity and RGB colors
 */
cc.AtlasNode = cc.Node.extend(
{

    //! chars per row
    _m_uItemsPerRow:0,
    //! chars per column
    _m_uItemsPerColumn:0,

    //! width of each char
    _m_uItemWidth:0,
    //! height of each char
    _m_uItemHeight:0,

    _m_tColorUnmodified: new cc.Color3B(0,0,0),

    _m_pTextureAtlas:null,


    // protocol variables
    _m_bIsOpacityModifyRGB:false,
    _m_tBlendFunc:null,
    _m_cOpacity:0,
    _m_tColor:null,

    // quads to draw
    _m_uQuadsToDraw:0,

    /** creates a CCAtlasNode  with an Atlas file the width and height of each item and the quantity of items to render*/
    atlasWithTileFile:function(tile, tileWidth, tileHeight, itemsToRender){
        var pRet = new cc.AtlasNode();
        if (pRet.initWithTileFile(tile, tileWidth, tileHeight, itemsToRender))
        {
            return pRet;
        }
        return null;

    },

    /** initializes an CCAtlasNode  with an Atlas file the width and height of each item and the quantity of items to render*/
    initWithTileFile:function(tile, tileWidth, tileHeight, itemsToRender){
        cc.Assert(tile != NULL, "title should not be null");
        this._m_uItemWidth  = tileWidth * cc.CONTENT_SCALE_FACTOR();
        this._m_uItemHeight = tileHeight * cc.CONTENT_SCALE_FACTOR();

        this._m_cOpacity = 255;
        this._m_tColor = this._m_tColorUnmodified = cc.WHITE;
        this._m_bIsOpacityModifyRGB = true;

        this._m_tBlendFunc.src = cc.BLEND_SRC;
        this._m_tBlendFunc.dst = cc.BLEND_DST;

        // double retain to avoid the autorelease pool
        // also, using: self.textureAtlas supports re-initialization without leaking
        this._m_pTextureAtlas = new cc.TextureAtlas();
        this._m_pTextureAtlas.initWithFile(tile, itemsToRender);

        if (! this._m_pTextureAtlas)
        {
            cc.LOG("cocos2d: Could not initialize CCAtlasNode. Invalid Texture.");
            return false;
        }

        this._updateBlendFunc();
        this._updateOpacityModifyRGB();

        this._calculateMaxItems();

        this._m_uQuadsToDraw = itemsToRender;

        return true;

    },

    /** updates the Atlas (indexed vertex array).
     * Shall be overriden in subclasses
     */
    updateAtlasValues:function(){
        cc.Assert(false, "CCAtlasNode:Abstract updateAtlasValue not overriden");
    },

    draw:function(){
        this._super();

        // Default GL states: GL_TEXTURE_2D, GL_VERTEX_ARRAY, GL_COLOR_ARRAY, GL_TEXTURE_COORD_ARRAY
        // Needed states: GL_TEXTURE_2D, GL_VERTEX_ARRAY, GL_TEXTURE_COORD_ARRAY
        // Unneeded states: GL_COLOR_ARRAY
        //TODO, for webgl porting.
        //glDisableClientState(GL_COLOR_ARRAY);

        // glColor4ub isn't implement on some android devices
        // glColor4ub( m_tColor.r, m_tColor.g, m_tColor.b, m_cOpacity);
        //glColor4f(((GLfloat)m_tColor.r) / 255, ((GLfloat)m_tColor.g) / 255, ((GLfloat)m_tColor.b) / 255, ((GLfloat)m_cOpacity) / 255);
        var newBlend = this._m_tBlendFunc.src != cc.BLEND_SRC || this._m_tBlendFunc.dst != cc.BLEND_DST;
        if(newBlend)
        {
            // TODO, need to be fixed
            //glBlendFunc( m_tBlendFunc.src, m_tBlendFunc.dst );
        }

        this._m_pTextureAtlas.drawNumberOfQuads(m_uQuadsToDraw, 0);

        if( newBlend ){
            //glBlendFunc(cc.BLEND_SRC, cc.BLEND_DST);
        }

        // is this chepear than saving/restoring color state ?
        // XXX: There is no need to restore the color to (255,255,255,255). Objects should use the color
        // XXX: that they need
        //	glColor4ub( 255, 255, 255, 255);

        // restore default GL state
        //TODO, need to be fixed.
        //glEnableClientState(GL_COLOR_ARRAY);

    },

    // CCAtlasNode - RGBA protocol

    getColor:function()
    {
        if(this._m_bIsOpacityModifyRGB)
        {
            return this._m_tColorUnmodified;
        }
        return this._m_tColor;
    },

    setColor:function(color3)
    {
        this._m_tColor = this._m_tColorUnmodified = color3;

        if( this._m_bIsOpacityModifyRGB )
        {
            this._m_tColor.r = color3.r * this._m_cOpacity/255;
            this._m_tColor.g = color3.g * this._m_cOpacity/255;
            this._m_tColor.b = color3.b * this._m_cOpacity/255;
        }
    },

    getOpacity:function()
    {
        return this._m_cOpacity;
    },

    setOpacity:function(opacity)
    {
        this._m_cOpacity = opacity;

        // special opacity for premultiplied textures
        if( this._m_bIsOpacityModifyRGB ){
            this.setColor(this._m_tColorUnmodified);
        }
    },

    setIsOpacityModifyRGB:function(bValue)
    {
        var oldColor	= this._m_tColor;
        this._m_bIsOpacityModifyRGB = bValue;
        this._m_tColor	= oldColor;
    },

    getIsOpacityModifyRGB:function()
    {
        return this._m_bIsOpacityModifyRGB;
    },

    updateOpacityModifyRGB:function()
    {
        this._m_bIsOpacityModifyRGB = this._m_pTextureAtlas.getTexture().getHasPremultipliedAlpha();
    },

    // CCAtlasNode - CocosNodeTexture protocol

    getBlendFunc:function()
    {
        return this._m_tBlendFunc;
    },

    setBlendFunc:function(blendFunc)
    {
        this._m_tBlendFunc = blendFunc;
    },


    // CC Texture protocol

    /** returns the used texture*/
    getTexture:function(){
        return this._m_pTextureAtlas.getTexture();
    },

    /** sets a new texture. it will be retained*/
    setTexture:function(texture){
        this._m_pTextureAtlas.setTexture(texture);
        this._updateBlendFunc();
        this._updateOpacityModifyRGB();
    },

    setTextureAtlas:function(value)
    {
        this._m_pTextureAtlas = value;
    },

    getTextureAtlas:function()
    {
        return this._m_pTextureAtlas;
    },

    getQuadsToDraw:function()
    {
        return this._m_uQuadsToDraw;
    },

    setQuadsToDraw:function(uQuadsToDraw)
    {
        this._m_uQuadsToDraw = uQuadsToDraw;
    },


    _calculateMaxItems:function(){
        var s = this._m_pTextureAtlas.getTexture().getContentSizeInPixels();
        this._m_uItemsPerColumn = s.height / this._m_uItemHeight;
        this._m_uItemsPerRow = s.width / this._m_uItemWidth;


    },

    _updateBlendFunc:function(){
        if( ! this._m_pTextureAtlas.getTexture().getHasPremultipliedAlpha() ) {
            this._m_tBlendFunc.src = cc.GL_SRC_ALPHA;
            this._m_tBlendFunc.dst = cc.GL_ONE_MINUS_SRC_ALPHA;
        }

    },

    _updateOpacityModifyRGB:function(){
        this._m_bIsOpacityModifyRGB = this._m_pTextureAtlas.getTexture().getHasPremultipliedAlpha();

    }

});
