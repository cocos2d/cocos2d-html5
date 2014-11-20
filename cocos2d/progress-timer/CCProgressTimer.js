/****************************************************************************
 Copyright (c) 2008-2010 Ricardo Quesada
 Copyright (c) 2011-2012 cocos2d-x.org
 Copyright (c) 2013-2014 Chukong Technologies Inc.
 Copyright (c) 2010      Lam Pham

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
 * cc.Progresstimer is a subclass of cc.Node.   <br/>
 * It renders the inner sprite according to the percentage.<br/>
 * The progress can be Radial, Horizontal or vertical.
 * @class
 * @extends cc.Node
 *
 * @property {cc.Point}     midPoint        <p>- Midpoint is used to modify the progress start position.<br/>
 *                                          If you're using radials type then the midpoint changes the center point<br/>
 *                                          If you're using bar type the the midpoint changes the bar growth<br/>
 *                                              it expands from the center but clamps to the sprites edge so:<br/>
 *                                              you want a left to right then set the midpoint all the way to cc.p(0,y)<br/>
 *                                              you want a right to left then set the midpoint all the way to cc.p(1,y)<br/>
 *                                              you want a bottom to top then set the midpoint all the way to cc.p(x,0)<br/>
 *                                              you want a top to bottom then set the midpoint all the way to cc.p(x,1)</p>
 * @property {cc.Point}     barChangeRate   - This allows the bar type to move the component at a specific rate.
 * @property {enum}         type            - Type of the progress timer: cc.ProgressTimer.TYPE_RADIAL|cc.ProgressTimer.TYPE_BAR.
 * @property {Number}       percentage      - Percentage to change progress, from 0 to 100.
 * @property {cc.Sprite}    sprite          - The sprite to show the progress percentage.
 * @property {Boolean}      reverseDir      - Indicate whether the direction is reversed.
 *
 */
cc.ProgressTimer = cc.Node.extend(/** @lends cc.ProgressTimer# */{
    _type:null,
    _percentage:0.0,
    _sprite:null,

    _midPoint:null,
    _barChangeRate:null,
    _reverseDirection:false,
    _className:"ProgressTimer",

    /**
     *    Midpoint is used to modify the progress start position.
     *    If you're using radials type then the midpoint changes the center point
     *    If you're using bar type the the midpoint changes the bar growth
     *        it expands from the center but clamps to the sprites edge so:
     *        you want a left to right then set the midpoint all the way to cc.p(0,y)
     *        you want a right to left then set the midpoint all the way to cc.p(1,y)
     *        you want a bottom to top then set the midpoint all the way to cc.p(x,0)
     *        you want a top to bottom then set the midpoint all the way to cc.p(x,1)
     *  @return {cc.Point}
     */
    getMidpoint:function () {
        return cc.p(this._midPoint.x, this._midPoint.y);
    },

    /**
     * Midpoint setter
     * @param {cc.Point} mpoint
     */
    setMidpoint:function (mpoint) {
        this._midPoint = cc.pClamp(mpoint, cc.p(0, 0), cc.p(1, 1));
    },

    /**
     *    This allows the bar type to move the component at a specific rate
     *    Set the component to 0 to make sure it stays at 100%.
     *    For example you want a left to right bar but not have the height stay 100%
     *    Set the rate to be cc.p(0,1); and set the midpoint to = cc.p(0,.5f);
     *  @return {cc.Point}
     */
    getBarChangeRate:function () {
        return cc.p(this._barChangeRate.x, this._barChangeRate.y);
    },

    /**
     * @param {cc.Point} barChangeRate
     */
    setBarChangeRate:function (barChangeRate) {
        this._barChangeRate = cc.pClamp(barChangeRate, cc.p(0, 0), cc.p(1, 1));
    },

    /**
     *  Change the percentage to change progress
     * @return {cc.ProgressTimer.TYPE_RADIAL|cc.ProgressTimer.TYPE_BAR}
     */
    getType:function () {
        return this._type;
    },

    /**
     * Percentages are from 0 to 100
     * @return {Number}
     */
    getPercentage:function () {
        return this._percentage;
    },

    /**
     * The image to show the progress percentage, retain
     * @return {cc.Sprite}
     */
    getSprite:function () {
        return this._sprite;
    },

    /**
     * from 0-100
     * @param {Number} percentage
     */
    setPercentage:function (percentage) {
        if (this._percentage != percentage) {
            this._percentage = cc.clampf(percentage, 0, 100);
            this._updateProgress();
        }
    },
    /**
     * only use for jsbinding
     * @param bValue
     */
    setOpacityModifyRGB:function (bValue) {
    },
    /**
     * only use for jsbinding
     * @returns {boolean}
     */
    isOpacityModifyRGB:function () {
        return false;
    },
    /**
     * return if reverse direction
     * @returns {boolean}
     */
    isReverseDirection:function () {
        return this._reverseDirection;
    },

    _boundaryTexCoord:function (index) {
        if (index < cc.ProgressTimer.TEXTURE_COORDS_COUNT) {
            var locProTextCoords = cc.ProgressTimer.TEXTURE_COORDS;
            if (this._reverseDirection)
                return cc.p((locProTextCoords >> (7 - (index << 1))) & 1, (locProTextCoords >> (7 - ((index << 1) + 1))) & 1);
            else
                return cc.p((locProTextCoords >> ((index << 1) + 1)) & 1, (locProTextCoords >> (index << 1)) & 1);
        }
        return cc.p(0,0);
    },

    /**
     * constructor of cc.cc.ProgressTimer
     * @function
     * @param {cc.Sprite} sprite
     */
    ctor: function(){
        cc.Node.prototype.ctor.call(this);
        cc.Node.prototype.ctor.call(this);

        this._type = cc.ProgressTimer.TYPE_RADIAL;
        this._percentage = 0.0;
        this._midPoint = cc.p(0, 0);
        this._barChangeRate = cc.p(0, 0);
        this._reverseDirection = false;

        this._sprite = null;
        this.sprite && this._renderCmd.initWithSprite(this.sprite);

    },

    /**
     * set color of sprite
     * @param {cc.Color} color
     */
    setColor:function (color) {
        this._sprite.color = color;
        this._updateColor();
    },

    /**
     *  set opacity of sprite
     * @param {Number} opacity
     */
    setOpacity:function (opacity) {
        this._sprite.opacity = opacity;
        this._updateColor();
    },

    /**
     * return color of sprite
     * @return {cc.Color}
     */
    getColor:function () {
        return this._sprite.color;
    },

    /**
     * return Opacity of sprite
     * @return {Number}
     */
    getOpacity:function () {
        return this._sprite.opacity;
    },

    /**
     * set reverse cc.ProgressTimer
     * @function
     * @param {Boolean} reverse
     */
    setReverseProgress: function(reverse){
        this._renderCmd.setReverseProgress(reverse);
    },

    /**
     * set sprite for cc.ProgressTimer
     * @function
     * @param {cc.Sprite} sprite
     */
    setSprite: function(sprite){
        this._renderCmd.setSprite(sprite);
    },

    /**
     * set Progress type of cc.ProgressTimer
     * @function
     * @param {cc.ProgressTimer.TYPE_RADIAL|cc.ProgressTimer.TYPE_BAR} type
     */
    setType: function(type){
        this._renderCmd.setType(type);
    },

    /**
     * Reverse Progress setter
     * @function
     * @param {Boolean} reverse
     */
    setReverseDirection: function(reverse){
        this._renderCmd.setReverseDirection(reverse);
    },

    /**
     * @param {cc.Point} alpha
     * @return {cc.Vertex2F | Object} the vertex position from the texture coordinate
     * @private
     */
    _textureCoordFromAlphaPoint:function (alpha) {
        var locSprite = this._sprite;
        if (!locSprite) {
            return {u:0, v:0}; //new cc.Tex2F(0, 0);
        }
        var quad = locSprite.quad;
        var min = cc.p(quad.bl.texCoords.u, quad.bl.texCoords.v);
        var max = cc.p(quad.tr.texCoords.u, quad.tr.texCoords.v);

        //  Fix bug #1303 so that progress timer handles sprite frame texture rotation
        if (locSprite.textureRectRotated) {
            var temp = alpha.x;
            alpha.x = alpha.y;
            alpha.y = temp;
        }
        return {u: min.x * (1 - alpha.x) + max.x * alpha.x, v: min.y * (1 - alpha.y) + max.y * alpha.y};
    },

    _vertexFromAlphaPoint:function (alpha) {
        if (!this._sprite) {
            return {x: 0, y: 0};
        }
        var quad = this._sprite.quad;
        var min = cc.p(quad.bl.vertices.x, quad.bl.vertices.y);
        var max = cc.p(quad.tr.vertices.x, quad.tr.vertices.y);
        return {x: min.x * (1 - alpha.x) + max.x * alpha.x, y: min.y * (1 - alpha.y) + max.y * alpha.y};
    },

    /**
     * Initializes a progress timer with the sprite as the shape the timer goes through
     * @function
     * @param {cc.Sprite} sprite
     * @return {Boolean}
     */
    initWithSprite: function(sprite){
        this._renderCmd.initWithSprite(sprite);
    },

    /**
     * Stuff gets drawn here
     * @function
     * @param {CanvasRenderingContext2D} ctx
     */
    draw: function(ctx){
        this._renderCmd.draw(ctx);
    },

    /**
     * <p>
     *    Update does the work of mapping the texture onto the triangles            <br/>
     *    It now doesn't occur the cost of free/alloc data every update cycle.      <br/>
     *    It also only changes the percentage point but no other points if they have not been modified.       <br/>
     *                                                                              <br/>
     *    It now deals with flipped texture. If you run into this problem, just use the                       <br/>
     *    sprite property and enable the methods flipX, flipY.                      <br/>
     * </p>
     * @private
     */
    _updateRadial:function () {
        if (!this._sprite)
            return;

        var i, locMidPoint = this._midPoint;
        var alpha = this._percentage / 100;
        var angle = 2 * (cc.PI) * ( this._reverseDirection ? alpha : 1.0 - alpha);

        //    We find the vector to do a hit detection based on the percentage
        //    We know the first vector is the one @ 12 o'clock (top,mid) so we rotate
        //    from that by the progress angle around the m_tMidpoint pivot
        var topMid = cc.p(locMidPoint.x, 1);
        var percentagePt = cc.pRotateByAngle(topMid, locMidPoint, angle);

        var index = 0;
        var hit;

        if (alpha == 0) {
            //    More efficient since we don't always need to check intersection
            //    If the alpha is zero then the hit point is top mid and the index is 0.
            hit = topMid;
            index = 0;
        } else if (alpha == 1) {
            //    More efficient since we don't always need to check intersection
            //    If the alpha is one then the hit point is top mid and the index is 4.
            hit = topMid;
            index = 4;
        } else {
            //    We run a for loop checking the edges of the texture to find the
            //    intersection point
            //    We loop through five points since the top is split in half

            var min_t = cc.FLT_MAX;
            var locProTextCoordsCount = cc.ProgressTimer.TEXTURE_COORDS_COUNT;
            for (i = 0; i <= locProTextCoordsCount; ++i) {
                var pIndex = (i + (locProTextCoordsCount - 1)) % locProTextCoordsCount;

                var edgePtA = this._boundaryTexCoord(i % locProTextCoordsCount);
                var edgePtB = this._boundaryTexCoord(pIndex);

                //    Remember that the top edge is split in half for the 12 o'clock position
                //    Let's deal with that here by finding the correct endpoints
                if (i == 0)
                    edgePtB = cc.pLerp(edgePtA, edgePtB, 1 - locMidPoint.x);
                else if (i == 4)
                    edgePtA = cc.pLerp(edgePtA, edgePtB, 1 - locMidPoint.x);

                // retPoint are returned by ccpLineIntersect
                var retPoint = cc.p(0, 0);
                if (cc.pLineIntersect(edgePtA, edgePtB, locMidPoint, percentagePt, retPoint)) {
                    //    Since our hit test is on rays we have to deal with the top edge
                    //    being in split in half so we have to test as a segment
                    if ((i == 0 || i == 4)) {
                        //    s represents the point between edgePtA--edgePtB
                        if (!(0 <= retPoint.x && retPoint.x <= 1))
                            continue;
                    }
                    //    As long as our t isn't negative we are at least finding a
                    //    correct hitpoint from m_tMidpoint to percentagePt.
                    if (retPoint.y >= 0) {
                        //    Because the percentage line and all the texture edges are
                        //    rays we should only account for the shortest intersection
                        if (retPoint.y < min_t) {
                            min_t = retPoint.y;
                            index = i;
                        }
                    }
                }
            }

            //    Now that we have the minimum magnitude we can use that to find our intersection
            hit = cc.pAdd(locMidPoint, cc.pMult(cc.pSub(percentagePt, locMidPoint), min_t));
        }

        //    The size of the vertex data is the index from the hitpoint
        //    the 3 is for the m_tMidpoint, 12 o'clock point and hitpoint position.
        var sameIndexCount = true;
        if (this._renderCmd._vertexDataCount != index + 3) {
            sameIndexCount = false;
            this._renderCmd._vertexData = null;
            this._renderCmd._vertexArrayBuffer = null;
            this._renderCmd._vertexDataCount = 0;
        }

        if (!this._renderCmd._vertexData) {
            this._renderCmd._vertexDataCount = index + 3;
            var locCount = this._renderCmd._vertexDataCount, vertexDataLen = cc.V2F_C4B_T2F.BYTES_PER_ELEMENT;
            this._renderCmd._vertexArrayBuffer = new ArrayBuffer(locCount * vertexDataLen);
            var locData = [];
            for (i = 0; i < locCount; i++)
                locData[i] = new cc.V2F_C4B_T2F(null, null, null, this._renderCmd._vertexArrayBuffer, i * vertexDataLen);

            this._renderCmd._vertexData = locData;
            if(!this._renderCmd._vertexData){
                cc.log( "cc.ProgressTimer._updateRadial() : Not enough memory");
                return;
            }
        }
        this._updateColor();

        var locVertexData = this._renderCmd._vertexData;
        if (!sameIndexCount) {
            //    First we populate the array with the m_tMidpoint, then all
            //    vertices/texcoords/colors of the 12 'o clock start and edges and the hitpoint
            locVertexData[0].texCoords = this._textureCoordFromAlphaPoint(locMidPoint);
            locVertexData[0].vertices = this._vertexFromAlphaPoint(locMidPoint);

            locVertexData[1].texCoords = this._textureCoordFromAlphaPoint(topMid);
            locVertexData[1].vertices = this._vertexFromAlphaPoint(topMid);

            for (i = 0; i < index; i++) {
                var alphaPoint = this._boundaryTexCoord(i);
                locVertexData[i + 2].texCoords = this._textureCoordFromAlphaPoint(alphaPoint);
                locVertexData[i + 2].vertices = this._vertexFromAlphaPoint(alphaPoint);
            }
        }

        //    hitpoint will go last
        locVertexData[this._renderCmd._vertexDataCount - 1].texCoords = this._textureCoordFromAlphaPoint(hit);
        locVertexData[this._renderCmd._vertexDataCount - 1].vertices = this._vertexFromAlphaPoint(hit);
    },

    _updateProgress: function(){
        this._renderCmd._updateProgress();
    },

    _createRenderCmd: function(){
        if(cc._renderType === cc._RENDER_TYPE_CANVAS)
            return new cc.ProgressTimer.CanvasRenderCmd(this);
        else
            return new cc.ProgressTimer.WebGLRenderCmd(this);
    }
});

// Extended properties
/** @expose */
_p.midPoint;
cc.defineGetterSetter(_p, "midPoint", _p.getMidpoint, _p.setMidpoint);
/** @expose */
_p.barChangeRate;
cc.defineGetterSetter(_p, "barChangeRate", _p.getBarChangeRate, _p.setBarChangeRate);
/** @expose */
_p.type;
cc.defineGetterSetter(_p, "type", _p.getType, _p.setType);
/** @expose */
_p.percentage;
cc.defineGetterSetter(_p, "percentage", _p.getPercentage, _p.setPercentage);
/** @expose */
_p.sprite;
cc.defineGetterSetter(_p, "sprite", _p.getSprite, _p.setSprite);
/** @expose */
_p.reverseDir;
cc.defineGetterSetter(_p, "reverseDir", _p.isReverseDirection, _p.setReverseDirection);


/**
 * create a progress timer object with image file name that renders the inner sprite according to the percentage
 * @deprecated since v3.0,please use new cc.ProgressTimer(sprite) instead.
 * @param {cc.Sprite} sprite
 * @return {cc.ProgressTimer}
 */
cc.ProgressTimer.create = function (sprite) {
    return new cc.ProgressTimer(sprite);
};

/**
 * @constant
 * @type Number
 */
cc.ProgressTimer.TEXTURE_COORDS_COUNT = 4;

/**
 * @constant
 * @type Number
 */
cc.ProgressTimer.TEXTURE_COORDS = 0x4b;

/**
 * Radial Counter-Clockwise
 * @type Number
 * @constant
 */
cc.ProgressTimer.TYPE_RADIAL = 0;

/**
 * Bar
 * @type Number
 * @constant
 */
cc.ProgressTimer.TYPE_BAR = 1;
