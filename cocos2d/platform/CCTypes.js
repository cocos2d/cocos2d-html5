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

/** RGB color composed of bytes 3 bytes
 @since v0.8
 */
cc.Color3B = function(r1,g1,b1)
{
    this.r = r1;
    this.g = g1;
    this.b = b1;
};

//! helper macro that creates an ccColor3B type
cc.ccc3 = function(r,g,b)
{
    return new cc.Color3B(r,g,b);
};


//ccColor3B predefined colors
//! White color (255,255,255)
cc.WHITE = new cc.Color3B(255, 255, 255);
//! Yellow color (255,255,0)
cc.YELLOW = new cc.Color3B(255, 255, 0);
//! Blue color (0,0,255)
cc.BLUE = new cc.Color3B(0,0,255);
//! Green Color (0,255,0)
cc.GREEN = new cc.Color3B(0,255,0);
//! Red Color (255,0,0,)
cc.RED = new cc.Color3B(255,0,0);
//! Magenta Color (255,0,255)
cc.MAGENTA = new cc.Color3B(255,0,255);
//! Black Color (0,0,0)
cc.BLACK = new cc.Color3B(0,0,0);
//! Orange Color (255,127,0)
cc.ORANGE = new cc.Color3B(255,127,0);
//! Gray Color (166,166,166)
cc.GRAY = new cc.Color3B(166,166,166);

/** RGBA color composed of 4 bytes
 @since v0.8
 */
cc.Color4B = function(r1, g1, b1, a1)
{
    this.r = r1;
    this.g = g1;
    this.b = b1;
    this.a = a1;
};

//! helper macro that creates an ccColor4B type
cc.cs4 = function(r, g, b, o)
{
    return new cc.Color4B(r, g, b, o);
};


/** RGBA color composed of 4 floats
 @since v0.8
 */
cc.Color4F = function(r1, g1, b1, a1)
{
    this.r = r1;
    this.g = g1;
    this.b = b1;
    this.a = a1;
} ;

/** Returns a ccColor4F from a ccColor3B. Alpha will be 1.
 @since v0.99.1
 */
cc.c4FFromccc3B= function(c)
{
    return new cc.Color4B(c.r/255.0, c.g/255.0, c.b/255.0, 1.0);
};

/** Returns a ccColor4F from a ccColor4B.
 @since v0.99.1
 */
cc.c4FFromccc4B = function(c)
{
    return new cc.Color4B(c.r/255.0, c.g/255.0, c.b/255.0, c.a/255.0);
};

/** returns YES if both ccColor4F are equal. Otherwise it returns NO.
 @since v0.99.1
 */
cc.c4FEqual = function( a,  b)
{
    return a.r == b.r && a.g == b.g && a.b == b.b && a.a == b.a;
};

/** A vertex composed of 2 floats: x, y
 @since v0.8
 */
cc.Vertex2F = function(x1,y1)
{
    this.x = x1;
    this.y = y1;
};

cc.Vertex2 = function( x,  y)
{
    return new cc.Vertex2F(x, y);
};


/** A vertex composed of 2 floats: x, y
 @since v0.8
 */
cc.Vertex3F = function(x1, y1, z1)
{
    this.x = x1;
    this.y = y1;
    this.Z = z1;
};

cc.vertex3 = function(x, y, z)
{
    return new cc.Vertex3F(x, y, z);
};

/** A texcoord composed of 2 floats: u, y
 @since v0.8
 */
cc.Tex2F = function(u1, v1)
{
    this.u = u1;
    this.v = v1;
};

cc.tex2 = function(u, v)
{
    return new cc.Tex2F(u , v);
};


//! Point Sprite component
cc.PointSprite = function(pos1, color1, size1)
{
    this.pos = pos1;         // 8 bytes
    this.color = color1;     // 4 bytes
    this.size =  size1;      // 4 bytes
};

//!	A 2D Quad. 4 * 2 floats
cc.Quad2 = function(tl1, tr1, bl1, br1)
{
    this.tl = tl1;
    this.tr = tr1;
    this.bl = bl1;
    this.br = br1;
};


//!	A 3D Quad. 4 * 3 floats
cc.Quad3 = function(bl1, br1, tl1, tr1)
{
    this.bl = bl1;
    this.br = br1;
    this.tl = tl1;
    this.tr = tr1;
};

//! A 2D grid size
cc.GridSize = function(x1, y1)
{
    this.x = x1;
    this.y = y1;
};

//! helper function to create a ccGridSize
cc.ccg = function(x, y)
{
    return new cc.GridSize (x, y);
};

//! a Point with a vertex point, a tex coord point and a color 4B
cc.V2F_C4B_T2F = function(vertices1, colors1, texCoords1)
{
    //! vertices (2F)
    this.vertices =  vertices1;
    //! colors (4B)
    this.colors = colors1;
    //! tex coords (2F)
    this.texCoords = texCoords1;
};

//! a Point with a vertex point, a tex coord point and a color 4F
cc.V2F_C4F_T2F = function(vertices1, colors1, texCoords1)
{
    //! vertices (2F)
    this.vertices =  vertices1;
    //! colors (4F)
    this.colors = colors1;
    //! tex coords (2F)
    this.texCoords = texCoords1;
};

//! a Point with a vertex point, a tex coord point and a color 4B
cc.V3F_C4B_T2F = function(vertices1, colors1, texCoords1)
{
    //! vertices (3F)
    this.vertices = vertices1;    // 12 bytes
//	char __padding__[4];

    //! colors (4B)
    this.colors = colors1;        // 4 bytes
//	char __padding2__[4];

    // tex coords (2F)
    this.texCoords = texCoords1;  // 8 byts
};

//! 4 ccVertex2FTex2FColor4B Quad
cc.V2F_C4B_T2F_Quad = function(bl1, br1, tl1, tr1)
{
    //! bottom left
    this.bl = bl1;
    //! bottom right
    this.br = br1;
    //! top left
    this.tl =  tl1;
    //! top right
    this.tr =  tr1;
};

//! 4 ccVertex3FTex2FColor4B
cc.V3F_C4B_T2F_Quad =  function(tl1, bl1, tr1, br1)
{
    //! top left
    this.tl = tl1;
    //! bottom left
    this.bl = bl1;
    //! top right
    this.tr = tr1;
    //! bottom right
    this.br = br1;
};

//! 4 ccVertex2FTex2FColor4F Quad
cc.V2F_C4F_T2F_Quad = function(bl1, br1, tl1, tr1)
{
    //! bottom left
    this.bl = bl1;
    //! bottom right
    this.br = br1;
    //! top left
    this.tl = tl1;
    //! top right
    this.tr =  tr1;
};

//! Blend Function used for textures
cc.BlendFunc = function(src1, dst1)
{
    //! source blend function
    this.src = src1;
    //! destination blend function
    this.dst = dst1;
};

//typedef double ccTime;
cc.TextAlignmentLeft = 0;
cc.TextAlignmentCenter = 1;
cc.TextAlignmentRight = 2;
