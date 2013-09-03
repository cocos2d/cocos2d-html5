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

/**
 * returns true if both ccColor3B are equal. Otherwise it returns false.
 * @param {cc.Color3B} color1
 * @param {cc.Color3B} color2
 * @return {Boolean}  true if both ccColor3B are equal. Otherwise it returns false.
 */
cc.c3BEqual = function(color1, color2){
    return color1.r === color2.r && color1.g === color2.g && color1.b === color2.b;
};

//ccColor3B predefined colors
Object.defineProperties(cc, {
    WHITE: {
        get: function () {
            return cc.c3b(255, 255, 255);
        }
    },
    YELLOW: {
        get: function () {
            return cc.c3b(255, 255, 0);
        }
    },
    BLUE: {
        get: function () {
            return cc.c3b(0, 0, 255);
        }
    },
    GREEN: {
        get: function () {
            return cc.c3b(0, 255, 0);
        }
    },
    RED: {
        get: function () {
            return cc.c3b(255, 0, 0);
        }
    },
    MAGENTA: {
        get: function () {
            return cc.c3b(255, 0, 255);
        }
    },
    BLACK: {
        get: function () {
            return cc.c3b(0, 0, 0);
        }
    },
    ORANGE: {
        get: function () {
            return cc.c3b(255, 127, 0);
        }
    },
    GRAY: {
        get: function () {
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
 * Returns a cc.Color4B from a cc.Color4F.
 * @param {cc.Color4F} c
 * @return {cc.Color4B}
 */
cc.c4BFromccc4F = function (c) {
    return new cc.Color4B(0 | (c.r * 255), 0 | (c.g * 255), 0 | (c.b * 255), 0 | (c.a * 255));
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
 * @deprecated
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
 * @deprecated
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
 * A Triangle of ccV2F_C4B_T2F
 * @Class
 * @Construct
 * @param {cc.V2F_C4B_T2F} a
 * @param {cc.V2F_C4B_T2F} b
 * @param {cc.V2F_C4B_T2F} c
 */
cc.V2F_C4B_T2F_Triangle = function (a, b, c) {
    this.a = a || new cc.V2F_C4B_T2F();
    this.b = b || new cc.V2F_C4B_T2F();
    this.c = c || new cc.V2F_C4B_T2F();
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

cc.V3F_C4B_T2F_QuadCopy = function (sourceQuad) {
    if (!sourceQuad)
        return  cc.V3F_C4B_T2F_QuadZero();
    var tl = sourceQuad.tl, bl = sourceQuad.bl, tr = sourceQuad.tr, br = sourceQuad.br;
    return new cc.V3F_C4B_T2F_Quad(
        new cc.V3F_C4B_T2F(new cc.Vertex3F(sourceQuad.tl.vertices.x, sourceQuad.tl.vertices.y, sourceQuad.tl.vertices.z),
            new cc.Color4B(sourceQuad.tl.colors.r, sourceQuad.tl.colors.g, sourceQuad.tl.colors.b, sourceQuad.tl.colors.a),
            new cc.Tex2F(sourceQuad.tl.texCoords.u, sourceQuad.tl.texCoords.v)),
        new cc.V3F_C4B_T2F(new cc.Vertex3F(sourceQuad.bl.vertices.x, sourceQuad.bl.vertices.y, sourceQuad.bl.vertices.z),
            new cc.Color4B(sourceQuad.bl.colors.r, sourceQuad.bl.colors.g, sourceQuad.bl.colors.b, sourceQuad.bl.colors.a),
            new cc.Tex2F(sourceQuad.bl.texCoords.u, sourceQuad.bl.texCoords.v)),
        new cc.V3F_C4B_T2F(new cc.Vertex3F(sourceQuad.tr.vertices.x, sourceQuad.tr.vertices.y, sourceQuad.tr.vertices.z),
            new cc.Color4B(sourceQuad.tr.colors.r, sourceQuad.tr.colors.g, sourceQuad.tr.colors.b, sourceQuad.tr.colors.a),
            new cc.Tex2F(sourceQuad.tr.texCoords.u, sourceQuad.tr.texCoords.v)),
        new cc.V3F_C4B_T2F(new cc.Vertex3F(sourceQuad.br.vertices.x, sourceQuad.br.vertices.y, sourceQuad.br.vertices.z),
            new cc.Color4B(sourceQuad.br.colors.r, sourceQuad.br.colors.g, sourceQuad.br.colors.b, sourceQuad.br.colors.a),
            new cc.Tex2F(sourceQuad.br.texCoords.u, sourceQuad.br.texCoords.v)));
};

cc.V3F_C4B_T2F_QuadsCopy = function (sourceQuads) {
    if (!sourceQuads)
        return  [];

    var retArr = [];
    for (var i = 0; i < sourceQuads.length; i++) {
        retArr.push(cc.V3F_C4B_T2F_QuadCopy(sourceQuads[i]));
    }
    return retArr;
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

cc.BlendFuncDisable = function () {
    return new cc.BlendFunc(gl.ONE, gl.ZERO);
};

/**
 * texture coordinates for a quad
 * @param {cc.Tex2F} bl
 * @param {cc.Tex2F} br
 * @param {cc.Tex2F} tl
 * @param {cc.Tex2F} tr
 * @constructor
 */
cc.T2F_Quad = function(bl, br, tl, tr){
    this.bl = bl;
    this.br = br;
    this.tl = tl;
    this.tr = tr;
};

/**
 * struct that holds the size in pixels, texture coordinates and delays for animated cc.ParticleSystemQuad
 * @param {cc.T2F_Quad} texCoords
 * @param delay
 * @param size
 * @constructor
 */
cc.AnimationFrameData = function(texCoords, delay, size){
    this.texCoords = texCoords;
    this.delay = delay;
    this.size = size;
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

if(cc.Browser.supportWebGL){
    //redefine some types with ArrayBuffer for WebGL

    //redefine cc.Color4B
    cc.Color4B = function (r, g, b, a, arrayBuffer, offset) {
        this._arrayBuffer = arrayBuffer || new ArrayBuffer(cc.Color4B.BYTES_PER_ELEMENT);
        this._offset = offset || 0;

        var locArrayBuffer = this._arrayBuffer, locOffset = this._offset, locElementLen = Uint8Array.BYTES_PER_ELEMENT;
        this._rU8 = new Uint8Array(locArrayBuffer, locOffset, 1);
        this._gU8 = new Uint8Array(locArrayBuffer, locOffset + locElementLen, 1);
        this._bU8 = new Uint8Array(locArrayBuffer, locOffset + locElementLen * 2, 1);
        this._aU8 = new Uint8Array(locArrayBuffer, locOffset + locElementLen * 3, 1);

        this._rU8[0] = r || 0;
        this._gU8[0] = g || 0;
        this._bU8[0] = b || 0;
        this._aU8[0] = a || 0;
    };
    cc.Color4B.BYTES_PER_ELEMENT = 4;
    Object.defineProperties(cc.Color4B.prototype, {
        r: {
            get: function () {
                return this._rU8[0];
            },
            set: function (xValue) {
                this._rU8[0] = xValue;
            },
            enumerable: true
        },
        g: {
            get: function () {
                return this._gU8[0];
            },
            set: function (yValue) {
                this._gU8[0]= yValue;
            },
            enumerable: true
        },
        b: {
            get: function () {
                return this._bU8[0];
            },
            set: function (xValue) {
                this._bU8[0] = xValue;
            },
            enumerable: true
        },
        a: {
            get: function () {
                return this._aU8[0];
            },
            set: function (yValue) {
                this._aU8[0] = yValue;
            },
            enumerable: true
        }
    });

    //redefine cc.Color4F
    cc.Color4F = function (r, g, b, a, arrayBuffer, offset) {
        this._arrayBuffer = arrayBuffer || new ArrayBuffer(cc.Color4F.BYTES_PER_ELEMENT);
        this._offset = offset || 0;

        var locArrayBuffer = this._arrayBuffer, locOffset = this._offset, locElementLen = Float32Array.BYTES_PER_ELEMENT;
        this._rF32 = new Float32Array(locArrayBuffer, locOffset, 1);
        this._rF32[0] = r || 0;
        this._gF32 = new Float32Array(locArrayBuffer, locOffset + locElementLen, 1);
        this._gF32[0] = g || 0;
        this._bF32 = new Float32Array(locArrayBuffer, locOffset + locElementLen * 2, 1);
        this._bF32[0] = b || 0;
        this._aF32 = new Float32Array(locArrayBuffer, locOffset + locElementLen * 3, 1);
        this._aF32[0] = a || 0;
    };
    cc.Color4F.BYTES_PER_ELEMENT = 16;
    Object.defineProperties(cc.Color4F.prototype, {
        r: {
            get: function () {
                return this._rF32[0];
            },
            set: function (rValue) {
                this._rF32[0]  = rValue;
            },
            enumerable: true
        },
        g: {
            get: function () {
                return this._gF32[0];
            },
            set: function (rValue) {
                this._gF32[0]  = rValue;
            },
            enumerable: true
        },
        b: {
            get: function () {
                return this._bF32[0];
            },
            set: function (rValue) {
                this._bF32[0]  = rValue;
            },
            enumerable: true
        },
        a: {
            get: function () {
                return this._aF32[0];
            },
            set: function (rValue) {
                this._aF32[0]  = rValue;
            },
            enumerable: true
        }
    });

    //redefine cc.Vertex2F
    cc.Vertex2F = function (x, y, arrayBuffer, offset) {
        this._arrayBuffer = arrayBuffer || new ArrayBuffer(cc.Vertex2F.BYTES_PER_ELEMENT);
        this._offset = offset || 0;

        this._xF32 = new Float32Array(this._arrayBuffer, this._offset, 1);
        this._yF32 = new Float32Array(this._arrayBuffer, this._offset + 4, 1);
        this._xF32[0] = x || 0;
        this._yF32[0] = y || 0;
    };
    cc.Vertex2F.BYTES_PER_ELEMENT = 8;
    Object.defineProperties(cc.Vertex2F.prototype, {
        x: {
            get: function () {
                return this._xF32[0];
            },
            set: function (xValue) {
                this._xF32[0] = xValue;
            },
            enumerable: true
        },
        y: {
            get: function () {
                return this._yF32[0];
            },
            set: function (yValue) {
                this._yF32[0] = yValue;
            },
            enumerable: true
        }
    });

    // redefine cc.Vertex3F
    cc.Vertex3F = function (x, y, z, arrayBuffer, offset) {
        this._arrayBuffer = arrayBuffer || new ArrayBuffer(cc.Vertex3F.BYTES_PER_ELEMENT);
        this._offset = offset || 0;

        var locArrayBuffer = this._arrayBuffer, locOffset = this._offset;
        this._xF32 = new Float32Array(locArrayBuffer, locOffset, 1);
        this._xF32[0] = x || 0;
        this._yF32 = new Float32Array(locArrayBuffer, locOffset + Float32Array.BYTES_PER_ELEMENT, 1);
        this._yF32[0] = y || 0;
        this._zF32 = new Float32Array(locArrayBuffer, locOffset + Float32Array.BYTES_PER_ELEMENT * 2, 1);
        this._zF32[0] = z || 0;
    };
    cc.Vertex3F.BYTES_PER_ELEMENT = 12;
    Object.defineProperties(cc.Vertex3F.prototype, {
        x: {
            get: function () {
                return this._xF32[0];
            },
            set: function (xValue) {
                this._xF32[0] = xValue;
            },
            enumerable: true
        },
        y: {
            get: function () {
                return this._yF32[0];
            },
            set: function (yValue) {
                this._yF32[0] = yValue;
            },
            enumerable: true
        },
        z: {
            get: function () {
                return this._zF32[0];
            },
            set: function (zValue) {
                this._zF32[0] = zValue;
            },
            enumerable: true
        }
    });

    // redefine cc.Tex2F
    cc.Tex2F = function (u, v, arrayBuffer, offset) {
        this._arrayBuffer = arrayBuffer || new ArrayBuffer(cc.Tex2F.BYTES_PER_ELEMENT);
        this._offset = offset || 0;

        this._uF32 = new Float32Array(this._arrayBuffer, this._offset, 1);
        this._vF32 = new Float32Array(this._arrayBuffer, this._offset + 4, 1);
        this._uF32[0] = u || 0;
        this._vF32[0] = v || 0;
    };
    cc.Tex2F.BYTES_PER_ELEMENT = 8;
    Object.defineProperties(cc.Tex2F.prototype, {
        u: {
            get: function () {
                return this._uF32[0];
            },
            set: function (xValue) {
                this._uF32[0] = xValue;
            },
            enumerable: true
        },
        v: {
            get: function () {
                return this._vF32[0];
            },
            set: function (yValue) {
                this._vF32[0] = yValue;
            },
            enumerable: true
        }
    });

    //redefine cc.Quad2
    cc.Quad2 = function (tl, tr, bl, br, arrayBuffer, offset) {
        this._arrayBuffer = arrayBuffer || new ArrayBuffer(cc.Quad2.BYTES_PER_ELEMENT);
        this._offset = offset || 0;

        var locArrayBuffer = this._arrayBuffer, locElementLen = cc.Vertex2F.BYTES_PER_ELEMENT;
        this._tl = tl ? new cc.Vertex2F(tl.x, tl.y, locArrayBuffer, 0) : new cc.Vertex2F(0, 0, locArrayBuffer, 0);
        this._tr = tr ? new cc.Vertex2F(tr.x, tr.y, locArrayBuffer, locElementLen) : new cc.Vertex2F(0, 0, locArrayBuffer, locElementLen);
        this._bl = bl ? new cc.Vertex2F(bl.x, bl.y, locArrayBuffer, locElementLen * 2) : new cc.Vertex2F(0, 0, locArrayBuffer, locElementLen * 2);
        this._br = br ? new cc.Vertex2F(br.x, br.y, locArrayBuffer, locElementLen * 3) : new cc.Vertex2F(0, 0, locArrayBuffer, locElementLen * 3);
    };
    cc.Quad2.BYTES_PER_ELEMENT = 32;
    Object.defineProperties(cc.Quad2.prototype, {
        tl: {
            get: function () {
                return this._tl;
            },
            set: function (tlValue) {
                this._tl.x = tlValue.x;
                this._tl.y = tlValue.y;
            },
            enumerable: true
        },
        tr: {
            get: function () {
                return this._tr;
            },
            set: function (trValue) {
                this._tr.x = trValue.x;
                this._tr.y = trValue.y;
            },
            enumerable: true
        },
        bl: {
            get: function () {
                return this._bl;
            },
            set: function (blValue) {
                this._bl.x = blValue.x;
                this._bl.y = blValue.y;
            },
            enumerable: true
        },
        br: {
            get: function () {
                return this._br;
            },
            set: function (brValue) {
                this._br.x = brValue.x;
                this._br.y = brValue.y;
            },
            enumerable: true
        }
    });

    //redefine cc.V3F_C4B_T2F
    cc.V3F_C4B_T2F = function (vertices, colors, texCoords, arrayBuffer, offset) {
        this._arrayBuffer = arrayBuffer || new ArrayBuffer(cc.V3F_C4B_T2F.BYTES_PER_ELEMENT);
        this._offset = offset || 0;

        var locArrayBuffer = this._arrayBuffer, locOffset = this._offset, locElementLen = cc.Vertex3F.BYTES_PER_ELEMENT;
        this._vertices = vertices ? new cc.Vertex3F(vertices.x, vertices.y, vertices.z, locArrayBuffer, locOffset) :
            new cc.Vertex3F(0, 0, 0, locArrayBuffer, locOffset);
        this._colors = colors ? new cc.Color4B(colors.r, colors.g, colors.b, colors.a, locArrayBuffer, locOffset + locElementLen) :
            new cc.Color4B(0, 0, 0, 0, locArrayBuffer, locOffset + locElementLen);
        this._texCoords = texCoords ? new cc.Tex2F(texCoords.u, texCoords.v, locArrayBuffer, locOffset + locElementLen + cc.Color4B.BYTES_PER_ELEMENT) :
            new cc.Tex2F(0, 0, locArrayBuffer, locOffset + locElementLen + cc.Color4B.BYTES_PER_ELEMENT);
    };
    cc.V3F_C4B_T2F.BYTES_PER_ELEMENT = 24;
    Object.defineProperties(cc.V3F_C4B_T2F.prototype, {
        vertices: {
            get: function () {
                return this._vertices;
            },
            set: function (verticesValue) {
                var locVertices = this._vertices;
                locVertices.x = verticesValue.x;
                locVertices.y = verticesValue.y;
                locVertices.z = verticesValue.z;
            },
            enumerable: true
        },
        colors: {
            get: function () {
                return this._colors;
            },
            set: function (colorValue) {
                var locColors = this._colors;
                locColors.r = colorValue.r;
                locColors.g = colorValue.g;
                locColors.b = colorValue.b;
                locColors.a = colorValue.a;
            },
            enumerable: true
        },
        texCoords: {
            get: function () {
                return this._texCoords;
            },
            set: function (texValue) {
                this._texCoords.u = texValue.u;
                this._texCoords.v = texValue.v;
            },
            enumerable: true
        }
    });

    //redefine cc.V3F_C4B_T2F_Quad
    cc.V3F_C4B_T2F_Quad = function (tl, bl, tr, br, arrayBuffer, offset) {
        this._arrayBuffer = arrayBuffer || new ArrayBuffer(cc.V3F_C4B_T2F_Quad.BYTES_PER_ELEMENT);
        this._offset = offset || 0;

        var locArrayBuffer = this._arrayBuffer, locOffset = this._offset, locElementLen = cc.V3F_C4B_T2F.BYTES_PER_ELEMENT;
        this._tl = tl ? new cc.V3F_C4B_T2F(tl.vertices, tl.colors, tl.texCoords, locArrayBuffer, locOffset) :
            new cc.V3F_C4B_T2F(null, null, null, locArrayBuffer, locOffset);
        this._bl = bl ? new cc.V3F_C4B_T2F(bl.vertices, bl.colors, bl.texCoords, locArrayBuffer, locOffset + locElementLen) :
            new cc.V3F_C4B_T2F(null, null, null, locArrayBuffer, locOffset + locElementLen);
        this._tr = tr ? new cc.V3F_C4B_T2F(tr.vertices, tr.colors, tr.texCoords, locArrayBuffer, locOffset + locElementLen * 2) :
            new cc.V3F_C4B_T2F(null, null, null, locArrayBuffer, locOffset + locElementLen * 2);
        this._br = br ? new cc.V3F_C4B_T2F(br.vertices, br.colors, br.texCoords, locArrayBuffer, locOffset + locElementLen * 3) :
            new cc.V3F_C4B_T2F(null, null, null, locArrayBuffer, locOffset + locElementLen * 3);
    };
    cc.V3F_C4B_T2F_Quad.BYTES_PER_ELEMENT = 96;
    Object.defineProperties(cc.V3F_C4B_T2F_Quad.prototype, {
        tl:{
            get: function () {
                return this._tl;
            },
            set: function (tlValue) {
                var locTl = this._tl;
                locTl.vertices = tlValue.vertices;
                locTl.colors = tlValue.colors;
                locTl.texCoords = tlValue.texCoords;
            },
            enumerable: true
        },
        bl:{
            get: function () {
                return this._bl;
            },
            set: function (blValue) {
                var locBl = this._bl;
                locBl.vertices = blValue.vertices;
                locBl.colors = blValue.colors;
                locBl.texCoords = blValue.texCoords;
            },
            enumerable: true
        },
        tr:{
            get: function () {
                return this._tr;
            },
            set: function (trValue) {
                var locTr = this._tr;
                locTr.vertices = trValue.vertices;
                locTr.colors = trValue.colors;
                locTr.texCoords = trValue.texCoords;
            },
            enumerable: true
        },
        br:{
            get: function () {
                return this._br;
            },
            set: function (brValue) {
                var locBr = this._br;
                locBr.vertices = brValue.vertices;
                locBr.colors = brValue.colors;
                locBr.texCoords = brValue.texCoords;
            },
            enumerable: true
        },
        arrayBuffer:{
            get: function () {
                return this._arrayBuffer;
            },
            enumerable: true
        }
    });
    cc.V3F_C4B_T2F_QuadZero = function(){
        return new cc.V3F_C4B_T2F_Quad();
    };

    cc.V3F_C4B_T2F_QuadCopy = function (sourceQuad) {
        if (!sourceQuad)
            return  cc.V3F_C4B_T2F_QuadZero();

        //return new cc.V3F_C4B_T2F_Quad(sourceQuad,tl,sourceQuad,bl,sourceQuad.tr,sourceQuad.br,null,0);
        var srcTL = sourceQuad.tl, srcBL = sourceQuad.bl, srcTR = sourceQuad.tr, srcBR = sourceQuad.br;
        return {
            tl: {vertices: {x: srcTL.vertices.x, y: srcTL.vertices.y, z: srcTL.vertices.z},
                colors: {r: srcTL.colors.r, g: srcTL.colors.g, b: srcTL.colors.b, a: srcTL.colors.a},
                texCoords: {u: srcTL.texCoords.u, v: srcTL.texCoords.v}},
            bl: {vertices: {x: srcBL.vertices.x, y: srcBL.vertices.y, z: srcBL.vertices.z},
                colors: {r: srcBL.colors.r, g: srcBL.colors.g, b: srcBL.colors.b, a: srcBL.colors.a},
                texCoords: {u: srcBL.texCoords.u, v: srcBL.texCoords.v}},
            tr: {vertices: {x: srcTR.vertices.x, y: srcTR.vertices.y, z: srcTR.vertices.z},
                colors: {r: srcTR.colors.r, g: srcTR.colors.g, b: srcTR.colors.b, a: srcTR.colors.a},
                texCoords: {u: srcTR.texCoords.u, v: srcTR.texCoords.v}},
            br: {vertices: {x: srcBR.vertices.x, y: srcBR.vertices.y, z: srcBR.vertices.z},
                colors: {r: srcBR.colors.r, g: srcBR.colors.g, b: srcBR.colors.b, a: srcBR.colors.a},
                texCoords: {u: srcBR.texCoords.u, v: srcBR.texCoords.v}}
        };
    };

    //redefine cc.V2F_C4B_T2F
    cc.V2F_C4B_T2F = function (vertices, colors, texCoords, arrayBuffer, offset) {
        this._arrayBuffer = arrayBuffer || new ArrayBuffer(cc.V2F_C4B_T2F.BYTES_PER_ELEMENT);
        this._offset = offset || 0;

        var locArrayBuffer = this._arrayBuffer, locOffset = this._offset, locElementLen = cc.Vertex2F.BYTES_PER_ELEMENT;
        this._vertices = vertices ? new cc.Vertex2F(vertices.x, vertices.y, locArrayBuffer, locOffset) :
            new cc.Vertex2F(0, 0, locArrayBuffer, locOffset);
        this._colors = colors ? new cc.Color4B(colors.r, colors.g, colors.b, colors.a, locArrayBuffer, locOffset + locElementLen) :
            new cc.Color4B(0, 0, 0, 0, locArrayBuffer, locOffset + locElementLen);
        this._texCoords = texCoords ? new cc.Tex2F(texCoords.u, texCoords.v, locArrayBuffer, locOffset + locElementLen + cc.Color4B.BYTES_PER_ELEMENT) :
            new cc.Tex2F(0, 0, locArrayBuffer, locOffset + locElementLen + cc.Color4B.BYTES_PER_ELEMENT);
    };
    cc.V2F_C4B_T2F.BYTES_PER_ELEMENT = 20;
    Object.defineProperties(cc.V2F_C4B_T2F.prototype, {
        vertices: {
            get: function () {
                return this._vertices;
            },
            set: function (verticesValue) {
                this._vertices.x = verticesValue.x;
                this._vertices.y = verticesValue.y;
            },
            enumerable: true
        },
        colors: {
            get: function () {
                return this._colors;
            },
            set: function (colorValue) {
                var locColors = this._colors;
                locColors.r = colorValue.r;
                locColors.g = colorValue.g;
                locColors.b = colorValue.b;
                locColors.a = colorValue.a;
            },
            enumerable: true
        },
        texCoords: {
            get: function () {
                return this._texCoords;
            },
            set: function (texValue) {
                this._texCoords.u = texValue.u;
                this._texCoords.v = texValue.v;
            },
            enumerable: true
        }
    });

    //redefine cc.V2F_C4B_T2F_Triangle
    cc.V2F_C4B_T2F_Triangle = function (a, b, c, arrayBuffer, offset) {
        this._arrayBuffer = arrayBuffer || new ArrayBuffer(cc.V2F_C4B_T2F_Triangle.BYTES_PER_ELEMENT);
        this._offset = offset || 0;

        var locArrayBuffer = this._arrayBuffer, locOffset = this._offset, locElementLen = cc.V2F_C4B_T2F.BYTES_PER_ELEMENT;
        this._a = a ? new cc.V2F_C4B_T2F(a.vertices, a.colors, a.texCoords, locArrayBuffer, locOffset) :
            new cc.V2F_C4B_T2F(null, null, null, locArrayBuffer, locOffset);
        this._b = b ? new cc.V2F_C4B_T2F(b.vertices, b.colors, b.texCoords, locArrayBuffer, locOffset + locElementLen) :
            new cc.V2F_C4B_T2F(null, null, null, locArrayBuffer, locOffset + locElementLen);
        this._c = c ? new cc.V2F_C4B_T2F(c.vertices, c.colors, c.texCoords, locArrayBuffer, locOffset + locElementLen * 2) :
            new cc.V2F_C4B_T2F(null, null, null, locArrayBuffer, locOffset + locElementLen * 2);
    };
    cc.V2F_C4B_T2F_Triangle.BYTES_PER_ELEMENT = 60;
    Object.defineProperties(cc.V2F_C4B_T2F_Triangle.prototype, {
        a:{
            get: function () {
                return this._a;
            },
            set: function (aValue) {
                var locA = this._a;
                locA.vertices = aValue.vertices;
                locA.colors = aValue.colors;
                locA.texCoords = aValue.texCoords;
            },
            enumerable: true
        },
        b:{
            get: function () {
                return this._b;
            },
            set: function (bValue) {
                var locB = this._b;
                locB.vertices = bValue.vertices;
                locB.colors = bValue.colors;
                locB.texCoords = bValue.texCoords;
            },
            enumerable: true
        },
        c:{
            get: function () {
                return this._c;
            },
            set: function (cValue) {
                var locC = this._c;
                locC.vertices = cValue.vertices;
                locC.colors = cValue.colors;
                locC.texCoords = cValue.texCoords;
            },
            enumerable: true
        }
    });
}

/**
 * convert a string of color for style to Color3B.
 * e.g. "#ff06ff"  to : Color3B(255,6,255)
 * @param {String} clrSt
 * @return {cc.Color3B}
 */
cc.convertHexNumToColor3B = function (clrSt) {
    var nAr = clrSt.substr(1).split("");
    var r = parseInt("0x" + nAr[0] + nAr[1]);
    var g = parseInt("0x" + nAr[2] + nAr[3]);
    var b = parseInt("0x" + nAr[4] + nAr[5]);
    return new cc.Color3B(r, g, b);
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

cc._Dictionary = cc.Class.extend({
    _keyMapTb: null,
    _valueMapTb: null,
    __currId: 0,

    ctor: function () {
        this._keyMapTb = {};
        this._valueMapTb = {};
        this.__currId = 2 << (0 | (Math.random() * 10));
    },

    __getKey: function () {
        this.__currId++;
        return "key_" + this.__currId;
    },

    setObject: function (value, key) {
        if (key == null)
            return;

        var keyId = this.__getKey();
        this._keyMapTb[keyId] = key;
        this._valueMapTb[keyId] = value;
    },

    objectForKey: function (key) {
        if (key == null)
            return null;

        var locKeyMapTb = this._keyMapTb;
        for (var keyId in locKeyMapTb) {
            if (locKeyMapTb[keyId] === key)
                return this._valueMapTb[keyId];
        }
        return null;
    },

    valueForKey: function (key) {
        return this.objectForKey(key);
    },

    removeObjectForKey: function (key) {
        if (key == null)
            return;

        var locKeyMapTb = this._keyMapTb;
        for (var keyId in locKeyMapTb) {
            if (locKeyMapTb[keyId] === key) {
                delete this._valueMapTb[keyId];
                delete locKeyMapTb[keyId];
                return;
            }
        }
    },

    removeObjectsForKeys: function (keys) {
        if (keys == null)
            return;

        for (var i = 0; i < keys.length; i++)
            this.removeObjectForKey(keys[i]);
    },

    allKeys: function () {
        var keyArr = [], locKeyMapTb = this._keyMapTb;
        for (var key in locKeyMapTb)
            keyArr.push(locKeyMapTb[key]);
        return keyArr;
    },

    removeAllObjects: function () {
        this._keyMapTb = {};
        this._valueMapTb = {};
    },

    count: function() {
        return this.allKeys().length;
    }
});

cc.FontDefinition = function(){
    this.fontName = "Arial";
    this.fontSize = 12;
    this.fontAlignmentH = cc.TEXT_ALIGNMENT_CENTER;
    this.fontAlignmentV = cc.VERTICAL_TEXT_ALIGNMENT_TOP;
    this.fontFillColor = cc.WHITE;
    this.fontDimensions = cc.size(0,0);

    this.strokeEnabled = false;
    this.strokeColor = cc.WHITE;
    this.strokeSize = 1;

    this.shadowEnabled = false;
    this.shadowOffset = cc.size(0,0);
    this.shadowBlur = 0;
    this.shadowOpacity = 1.0;
};
