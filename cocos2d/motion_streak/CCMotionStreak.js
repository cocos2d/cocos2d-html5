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
 * @extends cc.NodeRGBA
 */
cc.MotionStreak = cc.NodeRGBA.extend(/** @lends cc.MotionStreak# */{
    _fastMode:false,
    _startingPositionInitialized:false,

    /** texture used for the motion streak */
    _texture:null,
    _blendFunc:null,
    _positionR:null,

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
     * Constructor
     */
    ctor: function () {
        cc.NodeRGBA.prototype.ctor.call(this);
        this._positionR = cc._pConst(0, 0);
        this._blendFunc = new cc.BlendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        this._vertexWebGLBuffer = cc.renderContext.createBuffer();

        this._fastMode = false;
        this._startingPositionInitialized = false;

        this._texture = null;

        this._stroke = 0;
        this._fadeDelta = 0;
        this._minSeg = 0;

        this._maxPoints = 0;
        this._nuPoints = 0;
        this._previousNuPoints = 0;

        /** Pointers */
        this._pointVertexes = null;
        this._pointState = null;

        // webgl
        this._vertices = null;
        this._colorPointer = null;
        this._texCoords = null;

        this._verticesBuffer = null;
        this._colorPointerBuffer = null;
        this._texCoordsBuffer = null;
    },

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
        if (dst === undefined) {
            this._blendFunc = src;
        } else {
            this._blendFunc.src = src;
            this._blendFunc.dst = dst;
        }
    },

    getOpacity:function () {
        cc.log("cc.MotionStreak.getOpacity has not been supported.");
        return 0;
    },

    setOpacity:function (opacity) {
        cc.log("cc.MotionStreak.setOpacity has not been supported.");
    },

    setOpacityModifyRGB:function (value) {
    },

    isOpacityModifyRGB:function () {
        return false;
    },

    onExit:function(){
        cc.Node.prototype.onExit.call(this);
        if(this._verticesBuffer)
            cc.renderContext.deleteBuffer(this._verticesBuffer);
        if(this._texCoordsBuffer)
            cc.renderContext.deleteBuffer(this._texCoordsBuffer);
        if(this._colorPointerBuffer)
            cc.renderContext.deleteBuffer(this._colorPointerBuffer);
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
        if(!texture)
            throw "cc.MotionStreak.initWithFade(): Invalid filename or texture";

        if (typeof(texture) === "string")
            texture = cc.TextureCache.getInstance().addImage(texture);

        cc.Node.prototype.setPosition.call(this, cc.PointZero());
        this.setAnchorPoint(0,0);
        this.ignoreAnchorPointForPosition(true);
        this._startingPositionInitialized = false;

        this._fastMode = true;
        this._minSeg = (minSeg == -1.0) ? (stroke / 5.0) : minSeg;
        this._minSeg *= this._minSeg;

        this._stroke = stroke;
        this._fadeDelta = 1.0 / fade;

        var locMaxPoints = (0 | (fade * 60)) + 2;
        this._nuPoints = 0;
        this._pointState = new Float32Array(locMaxPoints);
        this._pointVertexes = new Float32Array(locMaxPoints * 2);

        this._vertices = new Float32Array(locMaxPoints * 4);
        this._texCoords = new Float32Array(locMaxPoints * 4);
        this._colorPointer = new Uint8Array(locMaxPoints * 8);
        this._maxPoints = locMaxPoints;

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

        return true;
    },

    /**
     * color used for the tint
     * @param {cc.Color3B} colors
     */
    tintWithColor:function (colors) {
        this.setColor(colors);

        // Fast assignation
        var locColorPointer = this._colorPointer;
        for (var i = 0, len = this._nuPoints * 2; i < len; i++) {
            locColorPointer[i * 4] = colors.r;
            locColorPointer[i * 4 + 1] = colors.g;
            locColorPointer[i * 4 + 2] = colors.b;
        }
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
    setPosition:function (position, yValue) {
        this._startingPositionInitialized = true;
        if(yValue === undefined){
            this._positionR._x = position.x;
            this._positionR._y = position.y;
        } else {
            this._positionR._x = position;
            this._positionR._y = yValue;
        }
    },

    /**
     * @override
     * @param {WebGLRenderingContext} ctx
     */
    draw:function (ctx) {
        if (this._nuPoints <= 1)
            return;

        if(this._texture && this._texture.isLoaded()){
            ctx = ctx || cc.renderContext;
            cc.NODE_DRAW_SETUP(this);
            cc.glEnableVertexAttribs(cc.VERTEX_ATTRIB_FLAG_POS_COLOR_TEX);
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
            cc.g_NumberOfDraws ++;
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
        var locNuPoints = this._nuPoints;
        var locPointState = this._pointState, locPointVertexes = this._pointVertexes, locVertices = this._vertices;
        var locColorPointer = this._colorPointer;

        for (i = 0; i < locNuPoints; i++) {
            locPointState[i] -= delta;

            if (locPointState[i] <= 0)
                mov++;
            else {
                newIdx = i - mov;
                if (mov > 0) {
                    // Move data
                    locPointState[newIdx] = locPointState[i];
                    // Move point
                    locPointVertexes[newIdx * 2] = locPointVertexes[i * 2];
                    locPointVertexes[newIdx * 2 + 1] = locPointVertexes[i * 2 + 1];

                    // Move vertices
                    i2 = i * 2;
                    newIdx2 = newIdx * 2;
                    locVertices[newIdx2 * 2] = locVertices[i2 * 2];
                    locVertices[newIdx2 * 2 + 1] = locVertices[i2 * 2 + 1];
                    locVertices[(newIdx2 + 1) * 2] = locVertices[(i2 + 1) * 2];
                    locVertices[(newIdx2 + 1) * 2 + 1] = locVertices[(i2 + 1) * 2 + 1];

                    // Move color
                    i2 *= 4;
                    newIdx2 *= 4;
                    locColorPointer[newIdx2 + 0] = locColorPointer[i2 + 0];
                    locColorPointer[newIdx2 + 1] = locColorPointer[i2 + 1];
                    locColorPointer[newIdx2 + 2] = locColorPointer[i2 + 2];
                    locColorPointer[newIdx2 + 4] = locColorPointer[i2 + 4];
                    locColorPointer[newIdx2 + 5] = locColorPointer[i2 + 5];
                    locColorPointer[newIdx2 + 6] = locColorPointer[i2 + 6];
                } else
                    newIdx2 = newIdx * 8;

                var op = locPointState[newIdx] * 255.0;
                locColorPointer[newIdx2 + 3] = op;
                locColorPointer[newIdx2 + 7] = op;
            }
        }
        locNuPoints -= mov;

        // Append new point
        var appendNewPoint = true;
        if (locNuPoints >= this._maxPoints)
            appendNewPoint = false;
        else if (locNuPoints > 0) {
            var a1 = cc.pDistanceSQ(cc.p(locPointVertexes[(locNuPoints - 1) * 2], locPointVertexes[(locNuPoints - 1) * 2 + 1]),
                this._positionR) < this._minSeg;
            var a2 = (locNuPoints == 1) ? false : (cc.pDistanceSQ(
                cc.p(locPointVertexes[(locNuPoints - 2) * 2], locPointVertexes[(locNuPoints - 2) * 2 + 1]), this._positionR) < (this._minSeg * 2.0));
            if (a1 || a2)
                appendNewPoint = false;
        }

        if (appendNewPoint) {
            locPointVertexes[locNuPoints * 2] = this._positionR._x;
            locPointVertexes[locNuPoints * 2 + 1] = this._positionR._y;
            locPointState[locNuPoints] = 1.0;

            // Color assignment
            var offset = locNuPoints * 8;

            var locDisplayedColor = this._displayedColor;
            locColorPointer[offset] = locDisplayedColor.r;
            locColorPointer[offset + 1] = locDisplayedColor.g;
            locColorPointer[offset + 2] = locDisplayedColor.b;
            //*((ccColor3B*)(m_pColorPointer + offset+4)) = this._color;
            locColorPointer[offset + 4] = locDisplayedColor.r;
            locColorPointer[offset + 5] = locDisplayedColor.g;
            locColorPointer[offset + 6] = locDisplayedColor.b;

            // Opacity
            locColorPointer[offset + 3] = 255;
            locColorPointer[offset + 7] = 255;

            // Generate polygon
            if (locNuPoints > 0 && this._fastMode) {
                if (locNuPoints > 1)
                    cc.vertexLineToPolygon(locPointVertexes, this._stroke, this._vertices, locNuPoints, 1);
                else
                    cc.vertexLineToPolygon(locPointVertexes, this._stroke, this._vertices, 0, 2);
            }
            locNuPoints++;
        }

        if (!this._fastMode)
            cc.vertexLineToPolygon(locPointVertexes, this._stroke, this._vertices, 0, locNuPoints);

        // Updated Tex Coords only if they are different than previous step
        if (locNuPoints && this._previousNuPoints != locNuPoints) {
            var texDelta = 1.0 / locNuPoints;
            var locTexCoords = this._texCoords;
            for (i = 0; i < locNuPoints; i++) {
                locTexCoords[i * 4] = 0;
                locTexCoords[i * 4 + 1] = texDelta * i;

                locTexCoords[(i * 2 + 1) * 2] = 1;
                locTexCoords[(i * 2 + 1) * 2 + 1] = texDelta * i;
            }

            this._previousNuPoints = locNuPoints;
        }

        this._nuPoints = locNuPoints;
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
