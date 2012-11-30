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
 * RGB color composed of bytes 3 bytes
 * @Class
 * @Construct
 * @param {Number | cc.Color3B} r1 red value (0 to 255) or destination color of new color
 * @param {Number} g1 green value (0 to 255)
 * @param {Number} b1 blue value (0 to 255)
 * @example
 * //create an empty color
 * var color1 = new cc.Color3B();
 *
 * //create a red color
 * var redColor = new cc.Color3B(255,0,0);
 *
 * //create a new color with color
 * var newColor = new cc.Color3B(redColor);
 */
cc.Color3B = function (r1, g1, b1) {
    switch (arguments.length) {
        case 0:
            this.r = 0;
            this.g = 0;
            this.b = 0;
            break;
        case 1:
            if (r1 && r1 instanceof cc.Color3B) {
                this.r = (0 | r1.r) || 0;
                this.g = (0 | r1.g) || 0;
                this.b = (0 | r1.b) || 0;
            } else {
                this.r = 0;
                this.g = 0;
                this.b = 0;
            }
            break;
        case 3:
            this.r = (0 | r1) || 0;
            this.g = (0 | g1) || 0;
            this.b = (0 | b1) || 0;
            break;
        default:
            throw "unknown argument type";
            break;
    }
};

/**
 * helper macro that creates an ccColor3B type
 * @function
 * @param {Number} r red value (0 to 255)
 * @param {Number} g green value (0 to 255)
 * @param {Number} b blue value (0 to 255)
 * @return {Number,Number,Number}
 */
cc.c3b = function (r, g, b) {
    return new cc.Color3B(r, g, b);
};

cc.integerToColor3B = function (intValue) {
    intValue = intValue || 0;

    var offset = 0xff;
    var retColor = new cc.Color3B();
    retColor.r = intValue & (offset);
    retColor.g = (intValue >> 8) & offset;
    retColor.b = (intValue >> 16) & offset;
    return retColor;
};

// compatibility
cc.c3 = cc.c3b;


//ccColor3B predefined colors
Object.defineProperties(cc, {
    WHITE:{
        get:function () {
            return cc.c3b(255, 255, 255);
        }
    },
    YELLOW:{
        get:function () {
            return cc.c3b(255, 255, 0);
        }
    },
    BLUE:{
        get:function () {
            return cc.c3b(0, 0, 255);
        }
    },
    GREEN:{
        get:function () {
            return cc.c3b(0, 255, 0);
        }
    },
    RED:{
        get:function () {
            return cc.c3b(255, 0, 0);
        }
    },
    MAGENTA:{
        get:function () {
            return cc.c3b(255, 0, 255);
        }
    },
    BLACK:{
        get:function () {
            return cc.c3b(0, 0, 0);
        }
    },
    ORANGE:{
        get:function () {
            return cc.c3b(255, 127, 0);
        }
    },
    GRAY:{
        get:function () {
            return cc.c3b(166, 166, 166);
        }
    }
});

/**
 *  White color (255,255,255)
 * @constant
 * @type {Number,Number,Number}
 */
cc.white = function () {
    return new cc.Color3B(255, 255, 255);
};

/**
 *  Yellow color (255,255,0)
 * @constant
 * @type {Number,Number,Number}
 */
cc.yellow = function () {
    return new cc.Color3B(255, 255, 0);
};

/**
 *  Blue color (0,0,255)
 * @constant
 * @type {Number,Number,Number}
 */
cc.blue = function () {
    return new cc.Color3B(0, 0, 255);
};

/**
 *  Green Color (0,255,0)
 * @constant
 * @type {Number,Number,Number}
 */
cc.green = function () {
    return new cc.Color3B(0, 255, 0);
};

/**
 *  Red Color (255,0,0,)
 * @constant
 * @type {Number,Number,Number}
 */
cc.red = function () {
    return new cc.Color3B(255, 0, 0);
};

/**
 *  Magenta Color (255,0,255)
 * @constant
 * @type {Number,Number,Number}
 */
cc.magenta = function () {
    return new cc.Color3B(255, 0, 255);
};

/**
 *  Black Color (0,0,0)
 * @constant
 * @type {Number,Number,Number}
 */
cc.black = function () {
    return new cc.Color3B(0, 0, 0);
};

/**
 *  Orange Color (255,127,0)
 * @constant
 * @type {Number,Number,Number}
 */
cc.orange = function () {
    return new cc.Color3B(255, 127, 0);
};

/**
 *  Gray Color (166,166,166)
 * @constant
 * @type {Number,Number,Number}
 */
cc.gray = function () {
    return new cc.Color3B(166, 166, 166);
};

/**
 * RGBA color composed of 4 bytes
 * @Class
 * @Construct
 * @param {Number} r1 red value (0 to 255)
 * @param {Number} g1 green value (0 to 255)
 * @param {Number} b1 blue value (0 to 255)
 * @param {Number} a1 Alpha value (0 to 255)
 * @example
 * //create a red color
 * var redColor = new cc.Color4B(255,0,0,255);
 */
cc.Color4B = function (r1, g1, b1, a1) {
    this.r = 0 | r1;
    this.g = 0 | g1;
    this.b = 0 | b1;
    this.a = 0 | a1;
};

/**
 * helper macro that creates an ccColor4B type
 * @function
 * @param {Number} r red value (0 to 255)
 * @param {Number} g green value (0 to 255)
 * @param {Number} b blue value (0 to 255)
 * @param {Number} a Alpha value (0 to 255)
 * @return {Number,Number,Number,Number}
 */
cc.c4b = function (r, g, b, a) {
    return new cc.Color4B(r, g, b, a);
};

// backwards compatibility
cc.c4 = cc.c4b;

/**
 * RGBA color composed of 4 floats
 * @Class
 * @Construct
 * @param {Number} r1 red value (0 to 1)
 * @param {Number} g1 green value (0 to 1)
 * @param {Number} b1 blue value (0 to 1)
 * @param {Number} a1 Alpha value (0 to 1)
 * @example
 * //create a red color
 * var redColor = new cc.Color4F(1,0,0,1);
 */
cc.Color4F = function (r1, g1, b1, a1) {
    this.r = r1;
    this.g = g1;
    this.b = b1;
    this.a = a1;
};


/**
 * helper macro that creates an ccColor4F type
 * @Class
 * @Construct
 * @param {Number} r red value (0 to 1)
 * @param {Number} g green value (0 to 1)
 * @param {Number} b blue value (0 to 1)
 * @param {Number} a Alpha value (0 to 1)
 * @example
 * //create a red color
 * var redColor = cc.c4f(1,0,0,1);
 */
cc.c4f = function (r, g, b, a) {
    return new cc.Color4F(r, g, b, a);
};

/**
 * Returns a cc.Color4F from a cc.Color3B. Alpha will be 1.
 * @function
 * @param {cc.Color3B} c color
 * @return {cc.Color4F}
 */
cc.c4FFromccc3B = function (c) {
    return new cc.Color4F(c.r / 255.0, c.g / 255.0, c.b / 255.0, 1.0);
};

/**
 * Returns a cc.Color4F from a cc.Color4B.
 * @function
 * @param {cc.Color4B} c Color
 * @return {cc.Color4F}
 */
cc.c4FFromccc4B = function (c) {
    return new cc.Color4F(c.r / 255.0, c.g / 255.0, c.b / 255.0, c.a / 255.0);
};

/**
 * returns YES if both cc.Color4F are equal. Otherwise it returns NO.
 * @param {cc.Color4F} a color1
 * @param {cc.Color4F} b color2
 * @return {Boolean}
 */
cc.c4FEqual = function (a, b) {
    return a.r == b.r && a.g == b.g && a.b == b.b && a.a == b.a;
};

/**
 * A vertex composed of 2 floats: x, y
 * @Class
 * @Construct
 * @param {Number} x1
 * @param {Number} y1
 */
cc.Vertex2F = function (x1, y1) {
    this.x = x1 || 0;
    this.y = y1 || 0;
};

/**
 * helper macro that creates an Vertex2F type
 * @function
 * @param {Number} x
 * @param {Number} y
 * @return {cc.Vertex2F}
 */
cc.Vertex2 = function (x, y) {
    return new cc.Vertex2F(x, y);
};

/**
 * A vertex composed of 3 floats: x, y, z
 * @Class
 * @Construct
 * @param {Number} x1
 * @param {Number} y1
 * @param {Number} z1
 */
cc.Vertex3F = function (x1, y1, z1) {
    this.x = x1 || 0;
    this.y = y1 || 0;
    this.z = z1 || 0;
};

/**
 * helper macro that creates an Vertex3F type
 * @function
 * @param {Number} x
 * @param {Number} y
 * @param {Number} z
 * @return {cc.Vertex3F}
 */
cc.vertex3 = function (x, y, z) {
    return new cc.Vertex3F(x, y, z);
};

/**
 * A texcoord composed of 2 floats: u, y
 * @Class
 * @Construct
 * @param {Number} u1
 * @param {Number} v1
 */
cc.Tex2F = function (u1, v1) {
    this.u = u1 || 0;
    this.v = v1 || 0;
};

/**
 * helper macro that creates an Tex2F type
 * @function
 * @param {Number} u
 * @param {Number} v
 * @return {cc.Tex2F}
 */
cc.tex2 = function (u, v) {
    return new cc.Tex2F(u, v);
};

/**
 * Point Sprite component
 * @Class
 * @Construct
 * @param {cc.Vertex2F} pos1
 * @param {cc.Color4B} color1
 * @param {Number} size1
 */
cc.PointSprite = function (pos1, color1, size1) {
    this.pos = pos1 || new cc.Vertex2F(0, 0);
    this.color = color1 || new cc.Color4B(0, 0, 0, 0);
    this.size = size1 || 0;
};

/**
 * A 2D Quad. 4 * 2 floats
 * @Class
 * @Construct
 * @param {cc.Vertex2F} tl1
 * @param {cc.Vertex2F} tr1
 * @param {cc.Vertex2F} bl1
 * @param {cc.Vertex2F} br1
 */
cc.Quad2 = function (tl1, tr1, bl1, br1) {
    this.tl = tl1 || new cc.Vertex2F(0, 0);
    this.tr = tr1 || new cc.Vertex2F(0, 0);
    this.bl = bl1 || new cc.Vertex2F(0, 0);
    this.br = br1 || new cc.Vertex2F(0, 0);
};

/**
 * A 3D Quad. 4 * 3 floats
 * @Class
 * @Construct
 * @param {cc.Vertex3F} bl1
 * @param {cc.Vertex3F} br1
 * @param {cc.Vertex3F} tl1
 * @param {cc.Vertex3F} tr1
 */
cc.Quad3 = function (bl1, br1, tl1, tr1) {
    this.bl = bl1 || new cc.Vertex3F(0, 0, 0);
    this.br = br1 || new cc.Vertex3F(0, 0, 0);
    this.tl = tl1 || new cc.Vertex3F(0, 0, 0);
    this.tr = tr1 || new cc.Vertex3F(0, 0, 0);
};

/**
 * A 2D grid size
 * @Class
 * @Construct
 * @param {Number} x1
 * @param {Number} y1
 */
cc.GridSize = function (x1, y1) {
    this.x = x1;
    this.y = y1;
};

/**
 * helper function to create a cc.GridSize
 * @function
 * @param {Number} x
 * @param {Number} y
 * @return {cc.GridSize}
 */
cc.g = function (x, y) {
    return new cc.GridSize(x, y);
};

/**
 * a Point with a vertex point, a tex coord point and a color 4B
 * @Class
 * @Construct
 * @param {cc.Vertex2F} vertices1
 * @param {cc.Color4B} colors1
 * @param {cc.Tex2F} texCoords1
 */
cc.V2F_C4B_T2F = function (vertices1, colors1, texCoords1) {
    this.vertices = vertices1 || new cc.Vertex2F(0, 0);
    this.colors = colors1 || new cc.Color4B(0, 0, 0, 0);
    this.texCoords = texCoords1 || new cc.Tex2F(0, 0);
};

/**
 * a Point with a vertex point, a tex coord point and a color 4F
 * @Class
 * @Construct
 * @param {cc.Vertex2F} vertices1
 * @param {cc.Color4F} colors1
 * @param {cc.Tex2F} texCoords1
 */
cc.V2F_C4F_T2F = function (vertices1, colors1, texCoords1) {
    this.vertices = vertices1 || new cc.Vertex2F(0, 0);
    this.colors = colors1 || new cc.Color4F(0, 0, 0, 0);
    this.texCoords = texCoords1 || new cc.Tex2F(0, 0);
};

/**
 * a Point with a vertex point, a tex coord point and a color 4B
 * @Class
 * @Construct
 * @param {cc.Vertex3F} vertices1
 * @param {cc.Color4B} colors1
 * @param {cc.Tex2F} texCoords1
 */
cc.V3F_C4B_T2F = function (vertices1, colors1, texCoords1) {
    this.vertices = vertices1 || new cc.Vertex3F(0, 0, 0);
    this.colors = colors1 || new cc.Color4B(0, 0, 0, 0);
    this.texCoords = texCoords1 || new cc.Tex2F(0, 0);
};

/**
 * 4 ccVertex2FTex2FColor4B Quad
 * @Class
 * @Construct
 * @param {cc.V2F_C4B_T2F} bl1 bottom left
 * @param {cc.V2F_C4B_T2F} br1 bottom right
 * @param {cc.V2F_C4B_T2F} tl1 top left
 * @param {cc.V2F_C4B_T2F} tr1 top right
 */
cc.V2F_C4B_T2F_Quad = function (bl1, br1, tl1, tr1) {
    this.bl = bl1 || new cc.V2F_C4B_T2F();
    this.br = br1 || new cc.V2F_C4B_T2F();
    this.tl = tl1 || new cc.V2F_C4B_T2F();
    this.tr = tr1 || new cc.V2F_C4B_T2F();
};

/**
 * helper function to create a cc.V2F_C4B_T2F_Quad
 * @function
 * @return {cc.V2F_C4B_T2F_Quad}
 */
cc.V2F_C4B_T2F_QuadZero = function () {
    return new cc.V2F_C4B_T2F_Quad(
        new cc.V2F_C4B_T2F(new cc.Vertex2F(0, 0), new cc.Color4B(0, 0, 0, 255), new cc.Tex2F(0, 0)),
        new cc.V2F_C4B_T2F(new cc.Vertex2F(0, 0), new cc.Color4B(0, 0, 0, 255), new cc.Tex2F(0, 0)),
        new cc.V2F_C4B_T2F(new cc.Vertex2F(0, 0), new cc.Color4B(0, 0, 0, 255), new cc.Tex2F(0, 0)),
        new cc.V2F_C4B_T2F(new cc.Vertex2F(0, 0), new cc.Color4B(0, 0, 0, 255), new cc.Tex2F(0, 0))
    );
};

/**
 * 4 ccVertex3FTex2FColor4B
 * @Class
 * @Construct
 * @param {cc.V3F_C4B_T2F} tl1 top left
 * @param {cc.V3F_C4B_T2F} bl1 bottom left
 * @param {cc.V3F_C4B_T2F} tr1 top right
 * @param {cc.V3F_C4B_T2F} br1 bottom right
 */
cc.V3F_C4B_T2F_Quad = function (tl1, bl1, tr1, br1) {
    this.tl = tl1 || new cc.V3F_C4B_T2F();
    this.bl = bl1 || new cc.V3F_C4B_T2F();
    this.tr = tr1 || new cc.V3F_C4B_T2F();
    this.br = br1 || new cc.V3F_C4B_T2F();
};

/**
 * helper function to create a cc.V3F_C4B_T2F_Quad
 * @function
 * @return {cc.V3F_C4B_T2F_Quad}
 */
cc.V3F_C4B_T2F_QuadZero = function () {
    return new cc.V3F_C4B_T2F_Quad(
        new cc.V3F_C4B_T2F(new cc.Vertex3F(0, 0, 0), new cc.Color4B(0, 0, 0, 255), new cc.Tex2F(0, 0)),
        new cc.V3F_C4B_T2F(new cc.Vertex3F(0, 0, 0), new cc.Color4B(0, 0, 0, 255), new cc.Tex2F(0, 0)),
        new cc.V3F_C4B_T2F(new cc.Vertex3F(0, 0, 0), new cc.Color4B(0, 0, 0, 255), new cc.Tex2F(0, 0)),
        new cc.V3F_C4B_T2F(new cc.Vertex3F(0, 0, 0), new cc.Color4B(0, 0, 0, 255), new cc.Tex2F(0, 0)));
};

/**
 * 4 ccVertex2FTex2FColor4F Quad
 * @Class
 * @Construct
 * @param {cc.V2F_C4F_T2F} bl1 bottom left
 * @param {cc.V2F_C4F_T2F} br1 bottom right
 * @param {cc.V2F_C4F_T2F} tl1 top left
 * @param {cc.V2F_C4F_T2F} tr1 top right
 * Constructor
 */
cc.V2F_C4F_T2F_Quad = function (bl1, br1, tl1, tr1) {
    this.bl = bl1 || new cc.V2F_C4F_T2F();
    this.br = br1 || new cc.V2F_C4F_T2F();
    this.tl = tl1 || new cc.V2F_C4F_T2F();
    this.tr = tr1 || new cc.V2F_C4F_T2F();
};

/**
 * Blend Function used for textures
 * @Class
 * @Construct
 * @param {Number} src1 source blend function
 * @param {Number} dst1 destination blend function
 */
cc.BlendFunc = function (src1, dst1) {
    this.src = src1;
    this.dst = dst1;
};


/**
 * convert Color3B to a string of color for style.
 * e.g.  Color3B(255,6,255)  to : "#ff06ff"
 * @param clr
 * @return {String}
 */
cc.convertColor3BtoHexString = function (clr) {
    var hR = clr.r.toString(16);
    var hG = clr.g.toString(16);
    var hB = clr.b.toString(16);
    var stClr = "#" + (clr.r < 16 ? ("0" + hR) : hR) + (clr.g < 16 ? ("0" + hG) : hG) + (clr.b < 16 ? ("0" + hB) : hB);
    return stClr;
};

/**
 * convert a string of color for style to Color3B.
 * e.g. "#ff06ff"  to : Color3B(255,6,255)
 * @param clr
 * @return {String}
 */
cc.convertHexNumToColor3B  = function(clrSt)
{
    var nAr = clrSt.substr(1).split("");
    var r = parseInt("0x"+nAr[0]+nAr[1]);
    var g = parseInt("0x"+nAr[2]+nAr[3]);
    var b = parseInt("0x"+nAr[4]+nAr[5]);
    return new cc.Color3B(r,g,b);
};


/**
 * text alignment : left
 * @constant
 * @type Number
 */
cc.TEXT_ALIGNMENT_LEFT = 0;

/**
 * text alignment : center
 * @constant
 * @type Number
 */
cc.TEXT_ALIGNMENT_CENTER = 1;

/**
 * text alignment : right
 * @constant
 * @type Number
 */
cc.TEXT_ALIGNMENT_RIGHT = 2;

/**
 * text alignment : top
 * @constant
 * @type Number
 */
cc.VERTICAL_TEXT_ALIGNMENT_TOP = 0;

/**
 * text alignment : center
 * @constant
 * @type Number
 */
cc.VERTICAL_TEXT_ALIGNMENT_CENTER = 1;

/**
 * text alignment : bottom
 * @constant
 * @type Number
 */
cc.VERTICAL_TEXT_ALIGNMENT_BOTTOM = 2;
