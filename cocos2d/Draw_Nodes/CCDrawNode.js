/****************************************************************************
 Copyright (c) 2010-2012 cocos2d-x.org
 Copyright (c) 2008-2010 Ricardo Quesada
 Copyright (c) 2011      Zynga Inc.
 Copyright (c) 2012 Scott Lembcke and Howling Moon Software

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

/*
 * Code copied & pasted from SpacePatrol game https://github.com/slembcke/SpacePatrol
 *
 * Renamed and added some changes for cocos2d
 *
 */

cc.v2f = function (x, y) {
    return new cc.Vertex2F(x, y);
};

cc.v2fadd = function (v0, v1) {
    return cc.v2f(v0.x + v1.x, v0.y + v1.y);
};

cc.v2fsub = function (v0, v1) {
    return cc.v2f(v0.x - v1.x, v0.y - v1.y);
};

cc.v2fmult = function (v, s) {
    return cc.v2f(v.x * s, v.y * s);
};

cc.v2fperp = function (p0) {
    return cc.v2f(-p0.y, p0.x);
};

cc.v2fneg = function (p0) {
    return cc.v2f(-p0.x, -p0.y);
};

cc.v2fdot = function (p0, p1) {
    return  p0.x * p1.x + p0.y * p1.y;
};

cc.v2fforangle = function (_a_) {
    return cc.v2f(Math.cos(_a_), Math.sin(_a_));
};

cc.v2fnormalize = function (p) {
    var r = cc.pNormalize(cc.p(p.x, p.y));
    return cc.v2f(r.x, r.y);
};

cc.__v2f = function (v) {
    return cc.v2f(v.x, v.y);
};

cc.__t = function (v) {
    return new cc.Tex2F(v.x, v.y);
};

/** CCDrawNode
 Node that draws dots, segments and polygons.
 Faster than the "drawing primitives" since they it draws everything in one single batch.
 */
cc.DrawNode = cc.Node.extend({
    _vao:0,
    _vbo:0,

    _bufferCapacity:0,
    _bufferCount:0,
    _buffer:null,

    _blendFunc:null,

    _dirty:false,

    ctor:function () {
        this._buffer = [];
    },

    ensureCapacity:function (count) {
    },

    init:function () {
        if (this._super()) {
            this._blendFunc = new cc.BlendFunc(cc.BLEND_SRC, cc.BLEND_DST);
            //this.ensureCapacity(512);
            this._dirty = true;
            return true;
        }
        return false;
    },

    render:function () {
        /*if( this._dirty ) {
         glBindBuffer(GL_ARRAY_BUFFER, _vbo);
         glBufferData(GL_ARRAY_BUFFER, sizeof(ccV2F_C4B_T2F)*_bufferCapacity, _buffer, GL_STREAM_DRAW);
         glBindBuffer(GL_ARRAY_BUFFER, 0);
         this._dirty = false;
         }

         ccGLBindVAO(_vao);
         glDrawArrays(GL_TRIANGLES, 0, _bufferCount);

         CC_INCREMENT_GL_DRAWS(1);

         CHECK_GL_ERROR();*/
    },

    draw:function (ctx) {

        var context = ctx || cc.renderContext;

        if ((this._blendFunc && (this._blendFunc.src == gl.SRC_ALPHA) && (this._blendFunc.dst == gl.ONE)))
            context.globalCompositeOperation = 'lighter';

        for (var i = 0; i < this._buffer.length; i++) {
            var element = this._buffer[i];
            if (element.type === cc.DRAWNODE_TYPE_DOT) {
                context.fillStyle = "rgba(" + (0|(element.color.r * 255)) + "," + (0|(element.color.g * 255)) + "," + (0|(element.color.b * 255)) + "," + element.color.a + ")";
                cc.drawingUtil.drawPoint(element.position, element.radius);
            }

            if (element.type === cc.DRAWNODE_TYPE_SEGMENT) {
                context.strokeStyle = "rgba(" + (0|(element.color.r * 255)) + "," + (0|(element.color.g * 255)) + "," + (0|(element.color.b * 255)) + "," + element.color.a + ")";
                context.lineWidth = element.radius * 2;
                context.lineCap = "round";
                cc.drawingUtil.drawLine(element.from, element.to);
            }

            if (element.type === cc.DRAWNODE_TYPE_POLY) {
                context.fillStyle = "rgba(" + (0|(element.fillColor.r * 255)) + "," + (0|(element.fillColor.g * 255)) + ","
                    + (0|(element.fillColor.b * 255)) + "," + element.fillColor.a + ")";
                cc.drawingUtil.drawPoly(element.verts, element.count, false, true);
                context.lineWidth = element.borderWidth * 2;
                context.lineCap = "round";
                context.strokeStyle = "rgba(" + (0|(element.borderColor.r * 255)) + "," + (0|(element.borderColor.g * 255)) + ","
                    + (0|(element.borderColor.b * 255)) + "," + element.borderColor.a + ")";
                cc.drawingUtil.drawPoly(element.verts, element.count, true, false);
            }
        }

        //TODO WEBGL
        /*this.render();
         ccGLBlendFunc(_blendFunc.src, _blendFunc.dst);

         [shaderProgram_ use];
         [shaderProgram_ setUniformsForBuiltins];

         [self render];*/
    },

    getBlendFunc:function () {
        return this._blendFunc;
    },

    setBlendFunc:function (blendFunc) {
        this._blendFunc = blendFunc;
    },

    /** draw a dot at a position, with a given radius and color */
    drawDot:function (pos, radius, color) {
        var element = new cc._DrawNodeElement(cc.DRAWNODE_TYPE_DOT);
        element.position = pos;
        element.radius = radius;
        element.color = color;
        this._buffer.push(element);

        //TODO WEBGL
        /* var vertex_count = 2*3;
         this.ensureCapacity(vertex_count);

         ccV2F_C4B_T2F a = {{pos.x - radius, pos.y - radius}, ccc4BFromccc4F(color), {-1.0, -1.0} };
         ccV2F_C4B_T2F b = {{pos.x - radius, pos.y + radius}, ccc4BFromccc4F(color), {-1.0,  1.0} };
         ccV2F_C4B_T2F c = {{pos.x + radius, pos.y + radius}, ccc4BFromccc4F(color), { 1.0,  1.0} };
         ccV2F_C4B_T2F d = {{pos.x + radius, pos.y - radius}, ccc4BFromccc4F(color), { 1.0, -1.0} };

         ccV2F_C4B_T2F_Triangle *triangles = (ccV2F_C4B_T2F_Triangle *)(_buffer + _bufferCount);
         triangles[0] = (ccV2F_C4B_T2F_Triangle){a, b, c};
         triangles[1] = (ccV2F_C4B_T2F_Triangle){a, c, d};


         this._bufferCount += vertex_count;*/
    },

    /** draw a segment with a radius and color */
    drawSegment:function (a, b, radius, color) {
        var element = new cc._DrawNodeElement(cc.DRAWNODE_TYPE_SEGMENT);
        element.from = a;
        element.to = b;
        element.radius = radius;
        element.color = color;
        this._buffer.push(element);

        //TODO WEBGL
        /*
         var vertex_count = 6*3;
         this.ensureCapacity(vertex_count);

         ccVertex2F a = __v2f(_a);
         ccVertex2F b = __v2f(_b);


         ccVertex2F n = v2fnormalize(v2fperp(v2fsub(b, a)));
         ccVertex2F t = v2fperp(n);

         ccVertex2F nw = v2fmult(n, radius);
         ccVertex2F tw = v2fmult(t, radius);
         ccVertex2F v0 = v2fsub(b, v2fadd(nw, tw));
         ccVertex2F v1 = v2fadd(b, v2fsub(nw, tw));
         ccVertex2F v2 = v2fsub(b, nw);
         ccVertex2F v3 = v2fadd(b, nw);
         ccVertex2F v4 = v2fsub(a, nw);
         ccVertex2F v5 = v2fadd(a, nw);
         ccVertex2F v6 = v2fsub(a, v2fsub(nw, tw));
         ccVertex2F v7 = v2fadd(a, v2fadd(nw, tw));


         ccV2F_C4B_T2F_Triangle *triangles = (ccV2F_C4B_T2F_Triangle *)(_buffer + _bufferCount);

         triangles[0] = (ccV2F_C4B_T2F_Triangle) {
         {v0, ccc4BFromccc4F(color), __t(v2fneg(v2fadd(n, t))) },
         {v1, ccc4BFromccc4F(color), __t(v2fsub(n, t)) },
         {v2, ccc4BFromccc4F(color), __t(v2fneg(n)) },
         };

         triangles[1] = (ccV2F_C4B_T2F_Triangle){
         {v3, ccc4BFromccc4F(color), __t(n)},
         {v1, ccc4BFromccc4F(color), __t(v2fsub(n, t)) },
         {v2, ccc4BFromccc4F(color), __t(v2fneg(n)) },
         };

         triangles[2] = (ccV2F_C4B_T2F_Triangle){
         {v3, ccc4BFromccc4F(color), __t(n)},
         {v4, ccc4BFromccc4F(color), __t(v2fneg(n)) },
         {v2, ccc4BFromccc4F(color), __t(v2fneg(n)) },
         };
         triangles[3] = (ccV2F_C4B_T2F_Triangle){
         {v3, ccc4BFromccc4F(color), __t(n) },
         {v4, ccc4BFromccc4F(color), __t(v2fneg(n)) },
         {v5, ccc4BFromccc4F(color), __t(n) },
         };
         triangles[4] = (ccV2F_C4B_T2F_Triangle){
         {v6, ccc4BFromccc4F(color), __t(v2fsub(t, n))},
         {v4, ccc4BFromccc4F(color), __t(v2fneg(n)) },
         {v5, ccc4BFromccc4F(color), __t(n)},
         };
         triangles[5] = (ccV2F_C4B_T2F_Triangle){
         {v6, ccc4BFromccc4F(color), __t(v2fsub(t, n)) },
         {v7, ccc4BFromccc4F(color), __t(v2fadd(n, t)) },
         {v5, ccc4BFromccc4F(color), __t(n)},
         };

         this._bufferCount += vertex_count;
         this._dirty = true; */
    },

    /** draw a polygon with a fill color and line color */
    drawPoly:function (verts, fillColor, width, borderColor) {
        var element = new cc._DrawNodeElement(cc.DRAWNODE_TYPE_POLY);
        element.verts = verts;
        element.count = verts.length;
        element.fillColor = fillColor;
        element.borderWidth = width;
        element.borderColor = borderColor;
        this._buffer.push(element);

        //TODO WEBGL
        /* struct ExtrudeVerts {ccVertex2F offset, n;};
         struct ExtrudeVerts extrude[count];
         bzero(extrude, sizeof(extrude) );

         for(int i=0; i<count; i++){
         ccVertex2F v0 = __v2f( verts[(i-1+count)%count] );
         ccVertex2F v1 = __v2f( verts[i] );
         ccVertex2F v2 = __v2f( verts[(i+1)%count] );

         ccVertex2F n1 = v2fnormalize(v2fperp(v2fsub(v1, v0)));
         ccVertex2F n2 = v2fnormalize(v2fperp(v2fsub(v2, v1)));

         ccVertex2F offset = v2fmult(v2fadd(n1, n2), 1.0/(v2fdot(n1, n2) + 1.0));
         extrude[i] = (struct ExtrudeVerts){offset, n2};
         }

         var outline = (line.a > 0.0 && width > 0.0);

         var triangle_count = 3*count - 2;
         var vertex_count = 3*triangle_count;

         this.ensureCapacity(vertex_count);

         ccV2F_C4B_T2F_Triangle *triangles = (ccV2F_C4B_T2F_Triangle *)(_buffer + _bufferCount);
         ccV2F_C4B_T2F_Triangle *cursor = triangles;

         var inset = (outline == 0.0 ? 0.5 : 0.0);
         for(int i=0; i<count-2; i++){
         ccVertex2F v0 = v2fsub( __v2f(verts[0  ]), v2fmult(extrude[0  ].offset, inset));
         ccVertex2F v1 = v2fsub( __v2f(verts[i+1]), v2fmult(extrude[i+1].offset, inset));
         ccVertex2F v2 = v2fsub( __v2f(verts[i+2]), v2fmult(extrude[i+2].offset, inset));

         *cursor++ = (ccV2F_C4B_T2F_Triangle){
         {v0, ccc4BFromccc4F(fill), __t(v2fzero) },
         {v1, ccc4BFromccc4F(fill), __t(v2fzero) },
         {v2, ccc4BFromccc4F(fill), __t(v2fzero) },
         };
         }

         for(int i=0; i<count; i++){
         int j = (i+1)%count;
         ccVertex2F v0 = __v2f( verts[i] );
         ccVertex2F v1 = __v2f( verts[j] );

         ccVertex2F n0 = extrude[i].n;

         ccVertex2F offset0 = extrude[i].offset;
         ccVertex2F offset1 = extrude[j].offset;

         if(outline){
         ccVertex2F inner0 = v2fsub(v0, v2fmult(offset0, width));
         ccVertex2F inner1 = v2fsub(v1, v2fmult(offset1, width));
         ccVertex2F outer0 = v2fadd(v0, v2fmult(offset0, width));
         ccVertex2F outer1 = v2fadd(v1, v2fmult(offset1, width));

         *cursor++ = (ccV2F_C4B_T2F_Triangle){
         {inner0, ccc4BFromccc4F(line), __t(v2fneg(n0))},
         {inner1, ccc4BFromccc4F(line), __t(v2fneg(n0))},
         {outer1, ccc4BFromccc4F(line), __t(n0)}
         };
         *cursor++ = (ccV2F_C4B_T2F_Triangle){
         {inner0, ccc4BFromccc4F(line), __t(v2fneg(n0))},
         {outer0, ccc4BFromccc4F(line), __t(n0)},
         {outer1, ccc4BFromccc4F(line), __t(n0)}
         };
         } else {
         ccVertex2F inner0 = v2fsub(v0, v2fmult(offset0, 0.5));
         ccVertex2F inner1 = v2fsub(v1, v2fmult(offset1, 0.5));
         ccVertex2F outer0 = v2fadd(v0, v2fmult(offset0, 0.5));
         ccVertex2F outer1 = v2fadd(v1, v2fmult(offset1, 0.5));

         *cursor++ = (ccV2F_C4B_T2F_Triangle){
         {inner0, ccc4BFromccc4F(fill), __t(v2fzero)},
         {inner1, ccc4BFromccc4F(fill), __t(v2fzero)},
         {outer1, ccc4BFromccc4F(fill), __t(n0)}
         };
         *cursor++ = (ccV2F_C4B_T2F_Triangle){
         {inner0, ccc4BFromccc4F(fill), __t(v2fzero)},
         {outer0, ccc4BFromccc4F(fill), __t(n0)},
         {outer1, ccc4BFromccc4F(fill), __t(n0)}
         };
         }
         }

         this._bufferCount += vertex_count;
         this._dirty = true; */
    },

    /** Clear the geometry in the node's buffer. */
    clear:function () {
        this._buffer.length = 0;
        this._bufferCount = 0;
        this._dirty = true;
    }
});

cc.DrawNode.create = function(){
   var ret = new cc.DrawNode();
    if(ret && ret.init())
        return ret;
    return null;
};

cc._DrawNodeElement = function (type) {
    this.type = type;
};

cc.DRAWNODE_TYPE_DOT = 0;
cc.DRAWNODE_TYPE_SEGMENT = 1;
cc.DRAWNODE_TYPE_POLY = 2;
