/****************************************************************************
 Copyright (c) 2010-2012 cocos2d-x.org
 Copyright (c) 2008-2010 Ricardo Quesada
 Copyright (c) 2011      Zynga Inc.
 Copyright (c) 2008-2009 Jason Booth

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


/** @brief object to hold ribbon segment data */
cc.RibbonSegment = cc.Class.extend({
    verts:[],
    coords:[],
    colors:[],
    creationTime:[],
    finished:false,
    end:0,
    begin:0,

    description:function () {
        return "<cc.RibbonSegment | end = " + this.end + ", begin = " + this.begin + ">";
    },
    init:function () {
        this.reset();
        return true;
    },
    reset:function () {
        this.end = 0;
        this.begin = 0;
        this.finished = false;
    },
    draw:function (curTime, fadeTime, color) {
        var r = color.r;
        var g = color.g;
        var b = color.b;
        var a = color.a;

        //TODO
        if (this.begin < 50) {
            // the motion streak class will call update and cause time to change, thus, if curTime_ != 0
            // we have to generate alpha for the ribbon each frame.
            if (curTime == 0) {
                // no alpha over time, so just set the color
                // glColor4ub isn't implement on some android devices
                // glColor4ub(r,g,b,a);
                glColor4f(r / 255, g / 255, b / 255, a / 255);
            } else {
                // generate alpha/color for each point
                glEnableClientState(GL_COLOR_ARRAY);
                var i = this.begin;
                for (; i < this.end; ++i) {
                    var idx = i * 8;
                    this.colors[idx] = r;
                    this.colors[idx + 1] = g;
                    this.colors[idx + 2] = b;
                    this.colors[idx + 4] = r;
                    this.colors[idx + 5] = g;
                    this.colors[idx + 6] = b;
                    var alive = ((curTime - this.creationTime[i]) / fadeTime);
                    if (alive > 1) {
                        this.begin++;
                        this.colors[idx + 3] = 0;
                        this.colors[idx + 7] = 0;
                    } else {
                        this.colors[idx + 3] = 255 - (alive * 255);
                        this.colors[idx + 7] = this.colors[idx + 3];
                    }
                }
                glColorPointer(4, GL_UNSIGNED_BYTE, 0, this.colors[this.begin * 8]);
            }
            glVertexPointer(3, GL_FLOAT, 0, this.verts[this.begin * 6]);
            glTexCoordPointer(2, GL_FLOAT, 0, this.coords[this.begin * 4]);
            glDrawArrays(GL_TRIANGLE_STRIP, 0, (this.end - this.begin) * 2);
        } else {
            this.finished = true;
        }
    }
});

/**
 * @brief A CCRibbon is a dynamically generated list of polygons drawn as a single or series
 * of triangle strips. The primary use of CCRibbon is as the drawing class of Motion Streak,
 * but it is quite useful on it's own. When manually drawing a ribbon, you can call addPointAt
 * and pass in the parameters for the next location in the ribbon. The system will automatically
 * generate new polygons, texture them accourding to your texture width, etc, etc.
 *
 * CCRibbon data is stored in a CCRibbonSegment class. This class statically allocates enough verticies and
 * texture coordinates for 50 locations (100 verts or 48 triangles). The ribbon class will allocate
 * new segments when they are needed, and reuse old ones if available. The idea is to avoid constantly
 * allocating new memory and prefer a more static method. However, since there is no way to determine
 * the maximum size of some ribbons (motion streaks), a truely static allocation is not possible.
 *
 * @since v0.8.1
 */

cc.Ribbon = cc.Node.extend({
    _segments:null,
    _deletedSegments:null,
    _lastPoint1:cc.PointZero(),
    _lastPoint2:cc.PointZero(),
    _lastLocation:null,
    _texVPos:0,
    _curTime:0,
    _fadeTime:0,
    _delta:0,
    _lastWidth:0,
    _lastSign:0,
    _pastFirstPoint:false,

    /** rotates a point around 0, 0 */
    _rotatePoint:function (vec, rotation) {
        var ret = new cc.Point();
        ret.x = (vec.x * Math.cos(rotation)) - (vec.y * Math.sin(rotation));
        ret.y = (vec.x * Math.sin(rotation)) + (vec.y * Math.cos(rotation));
        return ret;
    },

    /** Texture used by the ribbon. Conforms to CCTextureProtocol protocol */
    _texture:null,
    getTexture:function () {
        return this._texture;
    },
    setTexture:function (texture) {
        this._texture = texture;
        if (cc.renderContextType == cc.CANVAS) {
        } else {
            this.setContentSize(this._texture.getContentSizeInPixels());
        }
    },

    /** Texture lengths in pixels */
    _textureLength:0,
    getTextureLength:function () {
        return this._textureLength;
    },
    setTextureLength:function (length) {
        this._textureLength = length;
    },

    /** GL blendind function */
    _blendFunc:new cc.BlendFunc(cc.BLEND_SRC, cc.BLEND_DST),
    getBlendFunc:function () {
        return this._blendFunc;
    },
    setBlendFunc:function (blendFunc) {
        this._blendFunc = blendFunc;
    },

    /** color used by the Ribbon (RGBA) */
    _color:null,
    getColor:function () {
        return this._color;
    },
    setColor:function (color) {
        this._color = color;
    },

    ctor:function () {
        this._super();
    },

    /** init the ribbon */
    initWithWidth:function (width, path, length, color, fade) {
        this._segments = [];
        this._deletedSegments = [];

        /* 1 initial segment */
        var seg = new cc.RibbonSegment();
        seg.init();
        this._segments.push(seg);

        this._textureLength = length;

        this._color = color;
        this._fadeTime = fade;
        this._lastLocation = cc.PointZero();
        this._lastWidth = w / 2;
        this._texVPos = 0.0;

        this._curTime = 0;
        this._pastFirstPoint = false;

        /* XXX:
         Ribbon, by default uses this blend function, which might not be correct
         if you are using premultiplied alpha images,
         but 99% you might want to use this blending function regarding of the texture
         */
        //TODO
        //blendFunc.src = GL_SRC_ALPHA;
        //blendFunc.dst = GL_ONE_MINUS_SRC_ALPHA;

        this._texture = cc.TextureCache.sharedTextureCache().addImage(path);

        /* default texture parameter */
        //var params = { GL_LINEAR, GL_LINEAR, GL_REPEAT, GL_REPEAT };
        //texture.setTexParameters(&params);
        return true;
    },

    /** add a point to the ribbon */
    addPointAt:function (location, width) {
        location.x *= cc.CONTENT_SCALE_FACTOR();
        location.y *= cc.CONTENT_SCALE_FACTOR();

        width = width * 0.5;
        // if this is the first point added, cache it and return
        if (!this._pastFirstPoint) {
            this._lastWidth = width;
            this._lastLocation = location;
            this._pastFirstPoint = true;
            return;
        }

        var sub = cc.ccpSub(this._lastLocation, location);
        var r = cc.ccpToAngle(sub) + Math.PI / 2;
        var p1 = cc.ccpAdd(this._rotatePoint(cc.ccp(-width, 0), r), location);
        var p2 = cc.ccpAdd(this._rotatePoint(cc.ccp(+width, 0), r), location);
        var len = Math.sqrt(Math.pow(this._lastLocation.x - location.x, 2) + Math.pow(this._lastLocation.y - location.y, 2));
        var tend = this._texVPos + len / this._textureLength;
        // grab last segment
        var seg = this._segments.length > 0 ? this._segments[this._segments.length - 1] : null;
        // lets kill old segments
        if (this._segments && this._segments.length > 0) {
            for (var i = 0; i < this._segments.length; i++) {
                if (this._segments[i] != seg && this._segments[i].finished) {
                    this._deletedSegments.push(this._segments[i]);
                }
            }
        }

        cc.ArrayRemoveArray(this._segments, this._deletedSegments);
        // is the segment full?
        if (seg.end >= 50) {
            cc.ArrayRemoveArray(this._segments, this._deletedSegments);
        }
        // grab last segment and append to it if it's not full
        seg = this._segments.length > 0 ? this._segments[this._segments.length - 1] : null;
        // is the segment full?
        if (seg.end >= 50) {
            var newSeg;
            // grab it from the cache if we can
            if (this._deletedSegments.length > 0) {
                newSeg = this._deletedSegments[0];						// will be released later
                cc.ArrayRemoveObject(this._deletedSegments, newSeg);
            } else {
                newSeg = new cc.RibbonSegment(); // will be released later
                newSeg.init();
            }

            newSeg.creationTime[0] = seg.creationTime[seg.end - 1];
            var v = (seg.end - 1) * 6;
            var c = (seg.end - 1) * 4;
            newSeg.verts[0] = seg.verts[v];
            newSeg.verts[1] = seg.verts[v + 1];
            newSeg.verts[2] = seg.verts[v + 2];
            newSeg.verts[3] = seg.verts[v + 3];
            newSeg.verts[4] = seg.verts[v + 4];
            newSeg.verts[5] = seg.verts[v + 5];

            newSeg.coords[0] = seg.coords[c];
            newSeg.coords[1] = seg.coords[c + 1];
            newSeg.coords[2] = seg.coords[c + 2];
            newSeg.coords[3] = seg.coords[c + 3];
            newSeg.end++;
            seg = newSeg;
            this._segments.push(seg);
        }
        if (seg.end == 0) {
            // first edge has to get rotation from the first real polygon
            var lp1 = cc.ccpAdd(this._rotatePoint(cc.ccp(-lastWidth, 0), r), lastLocation);
            var lp2 = cc.ccpAdd(this._rotatePoint(cc.ccp(+lastWidth, 0), r), lastLocation);
            seg.creationTime[0] = this._curTime - this._delta;
            seg.verts[0] = lp1.x;
            seg.verts[1] = lp1.y;
            seg.verts[2] = 0.0;
            seg.verts[3] = lp2.x;
            seg.verts[4] = lp2.y;
            seg.verts[5] = 0.0;
            seg.coords[0] = 0.0;
            seg.coords[1] = this._texVPos;
            seg.coords[2] = 1.0;
            seg.coords[3] = this._texVPos;
            seg.end++;
        }

        v = seg.end * 6;
        c = seg.end * 4;
        // add new vertex
        seg.creationTime[seg.end] = this._curTime;
        seg.verts[v] = p1.x;
        seg.verts[v + 1] = p1.y;
        seg.verts[v + 2] = 0.0;
        seg.verts[v + 3] = p2.x;
        seg.verts[v + 4] = p2.y;
        seg.verts[v + 5] = 0.0;


        seg.coords[c] = 0.0;
        seg.coords[c + 1] = tend;
        seg.coords[c + 2] = 1.0;
        seg.coords[c + 3] = tend;

        this._texVPos = tend;
        this._lastLocation = location;
        this._lastPoint1 = p1;
        this._lastPoint2 = p2;
        this._lastWidth = width;
        seg.end++;
    },

    /** polling function */
    update:function (delta) {
        this._curTime += delta;
        this._delta = delta;
    },

    /** determine side of line */
    sideOfLine:function (p, l1, l2) {
        var vp = cc.ccpPerp(cc.ccpSub(l1, l2));
        var vx = cc.ccpSub(p, l1);
        return cc.ccpDot(vx, vp);
    },
    // super method
    draw:function () {
        this._super();

        //TODO
        if (this._segments.length > 0) {
            // Default GL states: GL_TEXTURE_2D, GL_VERTEX_ARRAY, GL_COLOR_ARRAY, GL_TEXTURE_COORD_ARRAY
            // Needed states: GL_TEXTURE_2D, GL_VERTEX_ARRAY, GL_TEXTURE_COORD_ARRAY
            // Unneeded states: GL_COLOR_ARRAY
            glDisableClientState(GL_COLOR_ARRAY);

            glBindTexture(GL_TEXTURE_2D, this._texture.getName());

            var newBlend = ( this._blendFunc.src != cc.BLEND_SRC || this._blendFunc.dst != cc.BLEND_DST ) ? true : false;
            if (newBlend) {
                glBlendFunc(this._blendFunc.src, this._blendFunc.dst);
            }

            if (this._segments && this._segments.length > 0) {
                for (var i = 0; i < this._segments.length; i++) {
                    this._segments[i].draw(this._curTime, this._fadeTime, this._color);
                }
            }

            if (newBlend) {
                glBlendFunc(cc.BLEND_SRC, cc.BLEND_DST);
            }

            // restore default GL state
            glEnableClientState(GL_COLOR_ARRAY);
        }
    }
});

cc.Ribbon.ribbonWithWidth = function (width, path, length, color, fade) {
    var ret = new cc.Ribbon();
    if (ret && ret.initWithWidth(w, path, length, color, fade)) {
        return ret;
    }
    return null;
};

