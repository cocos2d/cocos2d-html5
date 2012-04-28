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
    m_pVerts:[],
    m_pCoords:[],
    m_pColors:[],
    m_pCreationTime:[],
    m_bFinished:false,
    m_uEnd:0,
    m_uBegin:0,

    description:function () {
        return "<cc.RibbonSegment | end = " + this.m_uEnd + ", begin = " + this.m_uBegin + ">";
    },
    init:function () {
        this.reset();
        return true;
    },
    reset:function () {
        this.m_uEnd = 0;
        this.m_uBegin = 0;
        this.m_bFinished = false;
    },
    draw:function (curTime, fadeTime, color) {
        var r = color.r;
        var g = color.g;
        var b = color.b;
        var a = color.a;

        //TODO
        if (this.m_uBegin < 50) {
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
                var i = this.m_uBegin;
                for (; i < this.m_uEnd; ++i) {
                    var idx = i * 8;
                    this.m_pColors[idx] = r;
                    this.m_pColors[idx + 1] = g;
                    this.m_pColors[idx + 2] = b;
                    this.m_pColors[idx + 4] = r;
                    this.m_pColors[idx + 5] = g;
                    this.m_pColors[idx + 6] = b;
                    var alive = ((curTime - this.m_pCreationTime[i]) / fadeTime);
                    if (alive > 1) {
                        this.m_uBegin++;
                        this.m_pColors[idx + 3] = 0;
                        this.m_pColors[idx + 7] = 0;
                    } else {
                        this.m_pColors[idx + 3] = 255 - (alive * 255);
                        this.m_pColors[idx + 7] = this.m_pColors[idx + 3];
                    }
                }
                glColorPointer(4, GL_UNSIGNED_BYTE, 0, this.m_pColors[this.m_uBegin * 8]);
            }
            glVertexPointer(3, GL_FLOAT, 0, this.m_pVerts[this.m_uBegin * 6]);
            glTexCoordPointer(2, GL_FLOAT, 0, this.m_pCoords[this.m_uBegin * 4]);
            glDrawArrays(GL_TRIANGLE_STRIP, 0, (this.m_uEnd - this.m_uBegin) * 2);
        } else {
            this.m_bFinished = true;
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
    _m_pSegments:null,
    _m_pDeletedSegments:null,
    _m_tLastPoint1:cc.PointZero(),
    _m_tLastPoint2:cc.PointZero(),
    _m_tLastLocation:null,
    _m_fTexVPos:0,
    _m_fCurTime:0,
    _m_fFadeTime:0,
    _m_fDelta:0,
    _m_fLastWidth:0,
    _m_fLastSign:0,
    _m_bPastFirstPoint:false,

    /** rotates a point around 0, 0 */
    _rotatePoint:function (vec, rotation) {
        var ret = new cc.Point();
        ret.x = (vec.x * Math.cos(rotation)) - (vec.y * Math.sin(rotation));
        ret.y = (vec.x * Math.sin(rotation)) + (vec.y * Math.cos(rotation));
        return ret;
    },

    /** Texture used by the ribbon. Conforms to CCTextureProtocol protocol */
    _m_pTexture:null,
    getTexture:function () {
        return this._m_pTexture;
    },
    setTexture:function (texture) {
        this._m_pTexture = texture;
        if (cc.renderContextType == cc.kCanvas) {
        } else {
            this.setContentSize(this._m_pTexture.getContentSizeInPixels());
        }
    },

    /** Texture lengths in pixels */
    _m_fTextureLength:0,
    getTextureLength:function () {
        return this._m_fTextureLength;
    },
    setTextureLength:function (length) {
        this._m_fTextureLength = length;
    },

    /** GL blendind function */
    _m_tBlendFunc:new cc.BlendFunc(cc.BLEND_SRC, cc.BLEND_DST),
    getBlendFunc:function () {
        return this._m_tBlendFunc;
    },
    setBlendFunc:function (blendFunc) {
        this._m_tBlendFunc = blendFunc;
    },

    /** color used by the Ribbon (RGBA) */
    _m_tColor:null,
    getColor:function () {
        return this._m_tColor;
    },
    setColor:function (color) {
        this._m_tColor = color;
    },

    ctor:function () {
        this._super();
    },

    /** init the ribbon */
    initWithWidth:function (width, path, length, color, fade) {
        this._m_pSegments = [];
        this._m_pDeletedSegments = [];

        /* 1 initial segment */
        var seg = new cc.RibbonSegment();
        seg.init();
        this._m_pSegments.push(seg);

        this._m_fTextureLength = length;

        this._m_tColor = color;
        this._m_fFadeTime = fade;
        this._m_tLastLocation = cc.PointZero();
        this._m_fLastWidth = w / 2;
        this._m_fTexVPos = 0.0;

        this._m_fCurTime = 0;
        this._m_bPastFirstPoint = false;

        /* XXX:
         Ribbon, by default uses this blend function, which might not be correct
         if you are using premultiplied alpha images,
         but 99% you might want to use this blending function regarding of the texture
         */
        //TODO
        //m_tBlendFunc.src = GL_SRC_ALPHA;
        //m_tBlendFunc.dst = GL_ONE_MINUS_SRC_ALPHA;

        this._m_pTexture = cc.TextureCache.sharedTextureCache().addImage(path);

        /* default texture parameter */
        //var params = { GL_LINEAR, GL_LINEAR, GL_REPEAT, GL_REPEAT };
        //m_pTexture.setTexParameters(&params);
        return true;
    },

    /** add a point to the ribbon */
    addPointAt:function (location, width) {
        location.x *= cc.CONTENT_SCALE_FACTOR();
        location.y *= cc.CONTENT_SCALE_FACTOR();

        width = width * 0.5;
        // if this is the first point added, cache it and return
        if (!this._m_bPastFirstPoint) {
            this._m_fLastWidth = width;
            this._m_tLastLocation = location;
            this._m_bPastFirstPoint = true;
            return;
        }

        var sub = cc.ccpSub(this._m_tLastLocation, location);
        var r = cc.ccpToAngle(sub) + Math.PI / 2;
        var p1 = cc.ccpAdd(this._rotatePoint(cc.ccp(-width, 0), r), location);
        var p2 = cc.ccpAdd(this._rotatePoint(cc.ccp(+width, 0), r), location);
        var len = Math.sqrt(Math.pow(this._m_tLastLocation.x - location.x, 2) + Math.pow(this._m_tLastLocation.y - location.y, 2));
        var tend = this._m_fTexVPos + len / this._m_fTextureLength;
        // grab last segment
        var seg = this._m_pSegments.length > 0 ? this._m_pSegments[this._m_pSegments.length - 1] : null;
        // lets kill old segments
        if (this._m_pSegments && this._m_pSegments.length > 0) {
            for (var i = 0; i < this._m_pSegments.length; i++) {
                if (this._m_pSegments[i] != seg && this._m_pSegments[i].m_bFinished) {
                    this._m_pDeletedSegments.push(this._m_pSegments[i]);
                }
            }
        }

        cc.ArrayRemoveArray(this._m_pSegments, this._m_pDeletedSegments);
        // is the segment full?
        if (seg.m_uEnd >= 50) {
            cc.ArrayRemoveArray(this._m_pSegments, this._m_pDeletedSegments);
        }
        // grab last segment and append to it if it's not full
        seg = this._m_pSegments.length > 0 ? this._m_pSegments[this._m_pSegments.length - 1] : null;
        // is the segment full?
        if (seg.m_uEnd >= 50) {
            var newSeg;
            // grab it from the cache if we can
            if (this._m_pDeletedSegments.length > 0) {
                newSeg = this._m_pDeletedSegments[0];						// will be released later
                cc.ArrayRemoveObject(this._m_pDeletedSegments, newSeg);
            } else {
                newSeg = new cc.RibbonSegment(); // will be released later
                newSeg.init();
            }

            newSeg.m_pCreationTime[0] = seg.m_pCreationTime[seg.m_uEnd - 1];
            var v = (seg.m_uEnd - 1) * 6;
            var c = (seg.m_uEnd - 1) * 4;
            newSeg.m_pVerts[0] = seg.m_pVerts[v];
            newSeg.m_pVerts[1] = seg.m_pVerts[v + 1];
            newSeg.m_pVerts[2] = seg.m_pVerts[v + 2];
            newSeg.m_pVerts[3] = seg.m_pVerts[v + 3];
            newSeg.m_pVerts[4] = seg.m_pVerts[v + 4];
            newSeg.m_pVerts[5] = seg.m_pVerts[v + 5];

            newSeg.m_pCoords[0] = seg.m_pCoords[c];
            newSeg.m_pCoords[1] = seg.m_pCoords[c + 1];
            newSeg.m_pCoords[2] = seg.m_pCoords[c + 2];
            newSeg.m_pCoords[3] = seg.m_pCoords[c + 3];
            newSeg.m_uEnd++;
            seg = newSeg;
            this._m_pSegments.push(seg);
        }
        if (seg.m_uEnd == 0) {
            // first edge has to get rotation from the first real polygon
            var lp1 = cc.ccpAdd(this._rotatePoint(cc.ccp(-m_fLastWidth, 0), r), m_tLastLocation);
            var lp2 = cc.ccpAdd(this._rotatePoint(cc.ccp(+m_fLastWidth, 0), r), m_tLastLocation);
            seg.m_pCreationTime[0] = this._m_fCurTime - this._m_fDelta;
            seg.m_pVerts[0] = lp1.x;
            seg.m_pVerts[1] = lp1.y;
            seg.m_pVerts[2] = 0.0;
            seg.m_pVerts[3] = lp2.x;
            seg.m_pVerts[4] = lp2.y;
            seg.m_pVerts[5] = 0.0;
            seg.m_pCoords[0] = 0.0;
            seg.m_pCoords[1] = this._m_fTexVPos;
            seg.m_pCoords[2] = 1.0;
            seg.m_pCoords[3] = this._m_fTexVPos;
            seg.m_uEnd++;
        }

        v = seg.m_uEnd * 6;
        c = seg.m_uEnd * 4;
        // add new vertex
        seg.m_pCreationTime[seg.m_uEnd] = this._m_fCurTime;
        seg.m_pVerts[v] = p1.x;
        seg.m_pVerts[v + 1] = p1.y;
        seg.m_pVerts[v + 2] = 0.0;
        seg.m_pVerts[v + 3] = p2.x;
        seg.m_pVerts[v + 4] = p2.y;
        seg.m_pVerts[v + 5] = 0.0;


        seg.m_pCoords[c] = 0.0;
        seg.m_pCoords[c + 1] = tend;
        seg.m_pCoords[c + 2] = 1.0;
        seg.m_pCoords[c + 3] = tend;

        this._m_fTexVPos = tend;
        this._m_tLastLocation = location;
        this._m_tLastPoint1 = p1;
        this._m_tLastPoint2 = p2;
        this._m_fLastWidth = width;
        seg.m_uEnd++;
    },

    /** polling function */
    update:function (delta) {
        this._m_fCurTime += delta;
        this._m_fDelta = delta;
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
        if (this._m_pSegments.length > 0) {
            // Default GL states: GL_TEXTURE_2D, GL_VERTEX_ARRAY, GL_COLOR_ARRAY, GL_TEXTURE_COORD_ARRAY
            // Needed states: GL_TEXTURE_2D, GL_VERTEX_ARRAY, GL_TEXTURE_COORD_ARRAY
            // Unneeded states: GL_COLOR_ARRAY
            glDisableClientState(GL_COLOR_ARRAY);

            glBindTexture(GL_TEXTURE_2D, this._m_pTexture.getName());

            var newBlend = ( this._m_tBlendFunc.src != cc.BLEND_SRC || this._m_tBlendFunc.dst != cc.BLEND_DST ) ? true : false;
            if (newBlend) {
                glBlendFunc(this._m_tBlendFunc.src, this._m_tBlendFunc.dst);
            }

            if (this._m_pSegments && this._m_pSegments.length > 0) {
                for (var i = 0; i < this._m_pSegments.length; i++) {
                    this._m_pSegments[i].draw(this._m_fCurTime, this._m_fFadeTime, this._m_tColor);
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
    var pRet = new cc.Ribbon();
    if (pRet && pRet.initWithWidth(w, path, length, color, fade)) {
        return pRet;
    }
    return null;
};

