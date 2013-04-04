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

/**
 * cc.MotionStreak manages a Ribbon based on it's motion in absolute space.                 <br/>
 * You construct it with a fadeTime, minimum segment size, texture path, texture            <br/>
 * length and color. The fadeTime controls how long it takes each vertex in                 <br/>
 * the streak to fade out, the minimum segment size it how many pixels the                  <br/>
 * streak will move before adding a new ribbon segment, and the texture                     <br/>
 * length is the how many pixels the texture is stretched across. The texture               <br/>
 * is vertically aligned along the streak segment.
 * @class
 * @extends cc.Node
 */
cc.MotionStreak = cc.Node.extend(/** @lends cc.MotionStreak# */{
    _fastMode:false,
    _startingPositionInitialized:false,

    /** texture used for the motion streak */
    _texture:null,
    _blendFunc:null,
    _positionR:null,
    _color:null,

    _stroke:0,
    _fadeDelta:0,
    _minSeg:0,

    _maxPoints:0,
    _nuPoints:0,
    _previousNuPoints:0,

    /** Pointers */
    _pointVertexes:null,
    _pointState:null,

    // webgl
    _vertices:null,
    _colorPointer:null,
    _texCoords:null,
    _verticesBuffer:null,
    _colorPointerBuffer:null,
    _texCoordsBuffer:null,

    /**
     * @return {cc.Texture2D}
     */
    getTexture:function () {
        return this._texture;
    },

    /**
     * @param {cc.Texture2D} texture
     */
    setTexture:function (texture) {
        if (this._texture != texture)
            this._texture = texture;
    },

    /**
     * @return {cc.BlendFunc}
     */
    getBlendFunc:function () {
        return this._blendFunc;
    },

    /**
     * @param {Number} src
     * @param {Number} dst
     */
    setBlendFunc:function (src, dst) {
        if (arguments.length == 1) {
            this._blendFunc = src;
        } else if (arguments.length == 2) {
            this._blendFunc.src = src;
            this._blendFunc.dst = dst;
        }
    },

    setColor:function (color) {
        this._color = color;
    },

    getColor:function () {
        return this._color;
    },

    getOpacity:function () {
        cc.Assert(false, "Opacity no supported");
        return 0;
    },

    setOpacity:function (opacity) {
        cc.Assert(false, "Set opacity no supported");
    },

    setOpacityModifyRGB:function (value) {
    },

    isOpacityModifyRGB:function () {
        return false;
    },

    /**
     * Constructor
     */
    ctor:function () {
        this._super();
        this._positionR = cc.PointZero();
        this._color = cc.c3(0, 0, 0);
        this._blendFunc = new cc.BlendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    },

    isFastMode:function () {
        return this._fastMode;
    },

    /**
     * set fast mode
     * @param {Boolean} fastMode
     */
    setFastMode:function (fastMode) {
        this._fastMode = fastMode;
    },

    isStartingPositionInitialized:function () {
        return this._startingPositionInitialized;
    },

    setStartingPositionInitialized:function (startingPositionInitialized) {
        this._startingPositionInitialized = startingPositionInitialized;
    },

    /**
     * initializes a motion streak with fade in seconds, minimum segments, stroke's width, color and texture filename or texture
     * @param {Number} fade time to fade
     * @param {Number} minSeg minimum segment size
     * @param {Number} stroke stroke's width
     * @param {Number} color
     * @param {string|cc.Texture2D} texture texture filename or texture
     * @return {Boolean}
     */
    initWithFade:function (fade, minSeg, stroke, color, texture) {
        cc.Assert(texture != null, "Invalid filename or texture");

        if (typeof(texture) === "string")
            texture = cc.TextureCache.getInstance().addImage(texture);

        cc.Node.prototype.setPosition.call(this, cc.PointZero());
        this.setAnchorPoint(cc.PointZero());
        this.ignoreAnchorPointForPosition(true);
        this._startingPositionInitialized = false;

        this._positionR = cc.PointZero();
        this._fastMode = true;
        this._minSeg = (minSeg == -1.0) ? (stroke / 5.0) : minSeg;
        this._minSeg *= this._minSeg;

        this._stroke = stroke;
        this._fadeDelta = 1.0 / fade;

        this._maxPoints = (0 | (fade * 60)) + 2;
        this._nuPoints = 0;
        this._pointState = new Float32Array(this._maxPoints);
        this._pointVertexes = new Float32Array(this._maxPoints * 2);

        this._vertices = new Float32Array(this._maxPoints * 4);
        this._texCoords = new Float32Array(this._maxPoints * 4);
        this._colorPointer = new Uint8Array(this._maxPoints * 8);

        var gl = cc.renderContext;

        this._verticesBuffer = gl.createBuffer();
        this._texCoordsBuffer = gl.createBuffer();
        this._colorPointerBuffer = gl.createBuffer();

        // Set blend mode
        this._blendFunc.src = gl.SRC_ALPHA;
        this._blendFunc.dst = gl.ONE_MINUS_SRC_ALPHA;

        // shader program
        this.setShaderProgram(cc.ShaderCache.getInstance().programForKey(cc.SHADER_POSITION_TEXTURECOLOR));

        this.setTexture(texture);
        this.setColor(color);
        this.scheduleUpdate();

        //bind buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, this._verticesBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this._vertices, gl.DYNAMIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, this._texCoordsBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this._texCoords, gl.DYNAMIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, this._colorPointerBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this._colorPointer, gl.DYNAMIC_DRAW);
        this._isDirty = true;

        return true;
    },

    /**
     * color used for the tint
     * @param {cc.Color3B} colors
     */
    tintWithColor:function (colors) {
        this.setColor(colors);

        // Fast assignation
        for (var i = 0; i < this._nuPoints * 2; i++) {
            this._colorPointer[i * 4] = colors.r;
            this._colorPointer[i * 4 + 1] = colors.g;
            this._colorPointer[i * 4 + 2] = colors.b;
        }
        this._isDirty = true;
    },

    /**
     * Remove all living segments of the ribbon
     */
    reset:function () {
        this._nuPoints = 0;
    },

    /**
     * @override
     * @param {cc.Point} position
     */
    setPosition:function (position) {
        this._startingPositionInitialized = true;
        this._positionR = cc.p(position.x,position.y);
    },

    /**
     * @override
     * @param {cc.WebGLRenderingContext} ctx
     */
    draw:function (ctx) {
        if (this._nuPoints <= 1)
            return;

        if(this._texture && this._texture.isLoaded()){
            ctx = ctx || cc.renderContext;
            cc.NODE_DRAW_SETUP(this);
            cc.glEnableVertexAttribs(cc.VERTEX_ATTRIB_FLAG_POSCOLORTEX);
            cc.glBlendFunc(this._blendFunc.src, this._blendFunc.dst);

            cc.glBindTexture2D(this._texture);

            //position
            ctx.bindBuffer(ctx.ARRAY_BUFFER, this._verticesBuffer);
            ctx.bufferData(ctx.ARRAY_BUFFER, this._vertices, ctx.DYNAMIC_DRAW);
            ctx.vertexAttribPointer(cc.VERTEX_ATTRIB_POSITION, 2, ctx.FLOAT, false, 0, 0);

            //texcoords
            ctx.bindBuffer(ctx.ARRAY_BUFFER, this._texCoordsBuffer);
            ctx.bufferData(ctx.ARRAY_BUFFER, this._texCoords, ctx.DYNAMIC_DRAW);
            ctx.vertexAttribPointer(cc.VERTEX_ATTRIB_TEX_COORDS, 2, ctx.FLOAT, false, 0, 0);

            //colors
            ctx.bindBuffer(ctx.ARRAY_BUFFER, this._colorPointerBuffer);
            ctx.bufferData(ctx.ARRAY_BUFFER, this._colorPointer, ctx.DYNAMIC_DRAW);
            ctx.vertexAttribPointer(cc.VERTEX_ATTRIB_COLOR, 4, ctx.UNSIGNED_BYTE, true, 0, 0);

            ctx.drawArrays(ctx.TRIANGLE_STRIP, 0, this._nuPoints * 2);
            cc.INCREMENT_GL_DRAWS(1);
        }
    },

    /**
     * @override
     * @param {Number} delta
     */
    update:function (delta) {
        if (!this._startingPositionInitialized)
            return;

        delta *= this._fadeDelta;

        var newIdx, newIdx2, i, i2;
        var mov = 0;

        // Update current points
        for (i = 0; i < this._nuPoints; i++) {
            this._pointState[i] -= delta;

            if (this._pointState[i] <= 0)
                mov++;
            else {
                newIdx = i - mov;
                if (mov > 0) {
                    // Move data
                    this._pointState[newIdx] = this._pointState[i];
                    // Move point
                    this._pointVertexes[newIdx * 2] = this._pointVertexes[i * 2];
                    this._pointVertexes[newIdx * 2 + 1] = this._pointVertexes[i * 2 + 1];

                    // Move vertices
                    i2 = i * 2;
                    newIdx2 = newIdx * 2;
                    this._vertices[newIdx2 * 2] = this._vertices[i2 * 2];
                    this._vertices[newIdx2 * 2 + 1] = this._vertices[i2 * 2 + 1];
                    this._vertices[(newIdx2 + 1) * 2] = this._vertices[(i2 + 1) * 2];
                    this._vertices[(newIdx2 + 1) * 2 + 1] = this._vertices[(i2 + 1) * 2 + 1];

                    // Move color
                    i2 *= 4;
                    newIdx2 *= 4;
                    this._colorPointer[newIdx2 + 0] = this._colorPointer[i2 + 0];
                    this._colorPointer[newIdx2 + 1] = this._colorPointer[i2 + 1];
                    this._colorPointer[newIdx2 + 2] = this._colorPointer[i2 + 2];
                    this._colorPointer[newIdx2 + 4] = this._colorPointer[i2 + 4];
                    this._colorPointer[newIdx2 + 5] = this._colorPointer[i2 + 5];
                    this._colorPointer[newIdx2 + 6] = this._colorPointer[i2 + 6];
                } else
                    newIdx2 = newIdx * 8;

                var op = this._pointState[newIdx] * 255.0;
                this._colorPointer[newIdx2 + 3] = op;
                this._colorPointer[newIdx2 + 7] = op;
            }
        }
        this._nuPoints -= mov;

        // Append new point
        var appendNewPoint = true;
        if (this._nuPoints >= this._maxPoints)
            appendNewPoint = false;
        else if (this._nuPoints > 0) {
            var a1 = cc.pDistanceSQ(cc.p(this._pointVertexes[(this._nuPoints - 1) * 2], this._pointVertexes[(this._nuPoints - 1) * 2 + 1]),
                this._positionR) < this._minSeg;
            var a2 = (this._nuPoints == 1) ? false : (cc.pDistanceSQ(
                cc.p(this._pointVertexes[(this._nuPoints - 2) * 2], this._pointVertexes[(this._nuPoints - 2) * 2 + 1]), this._positionR) < (this._minSeg * 2.0));
            if (a1 || a2)
                appendNewPoint = false;
        }

        if (appendNewPoint) {
            this._pointVertexes[this._nuPoints * 2] = this._positionR.x;
            this._pointVertexes[this._nuPoints * 2 + 1] = this._positionR.y;
            this._pointState[this._nuPoints] = 1.0;

            // Color assignment
            var offset = this._nuPoints * 8;

            this._colorPointer[offset] = this._color.r;
            this._colorPointer[offset + 1] = this._color.g;
            this._colorPointer[offset + 2] = this._color.b;
            //*((ccColor3B*)(m_pColorPointer + offset+4)) = this._color;
            this._colorPointer[offset + 4] = this._color.r;
            this._colorPointer[offset + 5] = this._color.g;
            this._colorPointer[offset + 6] = this._color.b;

            // Opacity
            this._colorPointer[offset + 3] = 255;
            this._colorPointer[offset + 7] = 255;

            // Generate polygon
            if (this._nuPoints > 0 && this._fastMode) {
                if (this._nuPoints > 1)
                    cc.vertexLineToPolygon(this._pointVertexes, this._stroke, this._vertices, this._nuPoints, 1);
                else
                    cc.vertexLineToPolygon(this._pointVertexes, this._stroke, this._vertices, 0, 2);
            }
            this._nuPoints++;
        }

        if (!this._fastMode)
            cc.vertexLineToPolygon(this._pointVertexes, this._stroke, this._vertices, 0, this._nuPoints);

        // Updated Tex Coords only if they are different than previous step
        if (this._nuPoints && this._previousNuPoints != this._nuPoints) {
            var texDelta = 1.0 / this._nuPoints;
            for (i = 0; i < this._nuPoints; i++) {
                this._texCoords[i * 4] = 0;
                this._texCoords[i * 4 + 1] = texDelta * i;

                this._texCoords[(i * 2 + 1) * 2] = 1;
                this._texCoords[(i * 2 + 1) * 2 + 1] = texDelta * i;
            }

            this._previousNuPoints = this._nuPoints;
        }
    }
});

/**
 * creates and initializes a motion streak with fade in seconds, minimum segments, stroke's width, color, texture filename or texture
 * @param {Number} fade time to fade
 * @param {Number} minSeg minimum segment size
 * @param {Number} stroke stroke's width
 * @param {Number} color
 * @param {string|cc.Texture2D} texture texture filename or texture
 * @return {cc.MotionStreak}
 */
cc.MotionStreak.create = function (fade, minSeg, stroke, color, texture) {
    var ret = new cc.MotionStreak();
    if (ret && ret.initWithFade(fade, minSeg, stroke, color, texture))
        return ret;
    return null;
};
