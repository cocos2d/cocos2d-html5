/****************************************************************************
 Copyright (c) 2010-2011 cocos2d-x.org
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


/// Radial Counter-Clockwise
cc.kCCProgressTimerTypeRadialCCW = 0;
/// Radial ClockWise
cc.kCCProgressTimerTypeRadialCW = 1;
/// Horizontal Left-Right
cc.kCCProgressTimerTypeHorizontalBarLR = 2;
/// Horizontal Right-Left
cc.kCCProgressTimerTypeHorizontalBarRL = 3;
/// Vertical Bottom-top
cc.kCCProgressTimerTypeVerticalBarBT = 4;
/// Vertical Top-Bottom
cc.kCCProgressTimerTypeVerticalBarTB = 5;

cc.kProgressTextureCoordsCount = 4;
cc.kProgressTextureCoords = 0x1e;
/**
 @brief CCProgresstimer is a subclass of CCNode.
 It renders the inner sprite according to the percentage.
 The progress can be Radial, Horizontal or vertical.
 @since v0.99.1
 */
cc.ProgressTimer = cc.Node.extend({

    /**    Change the percentage to change progress. */
    getType:function () {
        return this._type;
    },

    /** Percentages are from 0 to 100 */
    getPercentage:function () {
        return this._percentage;
    },

    /** The image to show the progress percentage, retain */
    getSprite:function () {
        return this._sprite;
    },

    initWithFile:function (fileName) {
        return this.initWithTexture(cc.TextureCache.sharedTextureCache().addImage(fileName));
    },

    initWithTexture:function (texture) {
        this._sprite = cc.Sprite.spriteWithTexture(texture);

        this._percentage = 0.0;
        this._vertexData = null;
        this._vertexDataCount = 0;
        this.setAnchorPoint(cc.ccp(0.5, 0.5));
        this.setContentSize(this._sprite.getContentSize());
        this._type = cc.kCCProgressTimerTypeRadialCCW;

        return true;
    },

    setPercentage:function (percentage) {
        if (this._percentage != percentage) {
            this._percentage = cc.clampf(percentage, 0, 100);
            this._updateProgress();
        }
    },
    setSprite:function (sprite) {
        if (this._sprite != sprite) {
            this._sprite = sprite;
            this.setContentSize(this._sprite.getContentSize());

            //	Everytime we set a new sprite, we free the current vertex data
            if (this._vertexData) {
                this._vertexData = null;
                this._vertexDataCount = 0;
            }
        }
    },

    setType:function (type) {
        if (type != this._type) {
            //	release all previous information
            if (this._vertexData) {
                this._vertexData = null;
                this._vertexDataCount = 0;
            }

            this._type = type;
        }

    },

    draw:function (ctx) {
        if (cc.renderContextType == cc.kCanvas) {
            var context = ctx || cc.renderContext;
            if (this._type > 1) {
                var pos = new cc.Point(0 | ( -this._anchorPointInPixels.x + this._drawPosition.x),
                    0 | ( -this._anchorPointInPixels.y + this._drawPosition.y));
                context.drawImage(this._sprite._texture, this._origin.x, this._origin.y, this._drawSize.width, this._drawSize.height,
                    pos.x, -(pos.y + this._drawSize.height),
                    this._drawSize.width, this._drawSize.height);
            }else{
                var tSize = this.getContentSize();
                context.beginPath();
                var startAngle_1= (Math.PI/180)*this._startAngle;
                var endAngle_1=(Math.PI/180)*this._endAngle;
                var radius = tSize.width > tSize.height?tSize.width:tSize.height;
                context.arc(0,0,radius,startAngle_1,endAngle_1,false);
                context.lineTo(0,0);
                context.clip();
                context.closePath();

                var offsetPixels = this._sprite._offsetPositionInPixels;
                var pos = new cc.Point(0 | ( -this._sprite._anchorPointInPixels.x + offsetPixels.x),
                    0 | ( -this._sprite._anchorPointInPixels.y + offsetPixels.y));
                context.drawImage(this._sprite._texture,
                    this._sprite._rect.origin.x, this._sprite._rect.origin.y,
                    this._sprite._rect.size.width, this._sprite._rect.size.height,
                    pos.x, -(pos.y + this._sprite._rect.size.height),
                    this._sprite._rect.size.width, this._sprite._rect.size.height);
            }
        } else {
            this._super();

            if (!this._vertexData) {
                return;
            }

            if (!this._sprite) {
                return;
            }

            var bf = this._sprite.getBlendFunc();
            var newBlend = (bf.src != cc.BLEND_SRC || bf.dst != cc.BLEND_DST) ? true : false;
            if (newBlend) {
                //glBlendFunc(bf.src, bf.dst);
            }

            ///	========================================================================
            //	Replaced [texture_ drawAtPoint:CCPointZero] with my own vertexData
            //	Everything above me and below me is copied from CCTextureNode's draw
            //glBindTexture(GL_TEXTURE_2D, sprite->getTexture()->getName());
            //glVertexPointer(2, GL_FLOAT, sizeof(ccV2F_C4B_T2F), &vertexData[0].vertices);
            //glTexCoordPointer(2, GL_FLOAT, sizeof(ccV2F_C4B_T2F), &vertexData[0].texCoords);
            //glColorPointer(4, GL_UNSIGNED_BYTE, sizeof(ccV2F_C4B_T2F), &vertexData[0].colors);

            if (this._type == cc.kCCProgressTimerTypeRadialCCW || this._type == cc.kCCProgressTimerTypeRadialCW) {
                //glDrawArrays(GL_TRIANGLE_FAN, 0, vertexDataCount);
            } else if (this._type == cc.kCCProgressTimerTypeHorizontalBarLR ||
                this._type == cc.kCCProgressTimerTypeHorizontalBarRL ||
                this._type == cc.kCCProgressTimerTypeVerticalBarBT ||
                this._type == cc.kCCProgressTimerTypeVerticalBarTB) {
                //glDrawArrays(GL_TRIANGLE_STRIP, 0, vertexDataCount);
            }
            //glDrawElements(GL_TRIANGLES, indicesCount_, GL_UNSIGNED_BYTE, indices_);
            ///	========================================================================

            if (newBlend) {
                //glBlendFunc(CC_BLEND_SRC, CC_BLEND_DST);
            }
        }
    },

    _vertexFromTexCoord:function (texCoord) {
        var tmp;
        var ret = new cc.Vertex2F(0, 0);

        var texture = this._sprite.getTexture();
        if (texture) {
            var fXMax = Math.max(this._sprite.getQuad().br.texCoords.u, this._sprite.getQuad().bl.texCoords.u);
            var fXMin = Math.min(this._sprite.getQuad().br.texCoords.u, this._sprite.getQuad().bl.texCoords.u);
            var fYMax = Math.max(this._sprite.getQuad().tl.texCoords.v, this._sprite.getQuad().bl.texCoords.v);
            var fYMin = Math.min(this._sprite.getQuad().tl.texCoords.v, this._sprite.getQuad().bl.texCoords.v);
            var tMax = cc.ccp(fXMax, fYMax);
            var tMin = cc.ccp(fXMin, fYMin);

            var texSize = cc.SizeMake(this._sprite.getQuad().br.vertices.x - this._sprite.getQuad().bl.vertices.x,
                this._sprite.getQuad().tl.vertices.y - this._sprite.getQuad().bl.vertices.y);
            tmp = cc.ccp(texSize.width * (texCoord.x - tMin.x) / (tMax.x - tMin.x),
                texSize.height * (1 - (texCoord.y - tMin.y) / (tMax.y - tMin.y)));
        } else {
            tmp = cc.PointZero();
        }

        ret.x = tmp.x;
        ret.y = tmp.y;
        return ret;

    },

    _origin:cc.PointZero(),
    _drawSize:cc.SizeZero(),
    _drawPosition:cc.PointZero(),
    _startAngle:270,
    _endAngle:270,
    _updateProgress:function () {
        if (cc.renderContextType == cc.kCanvas) {
            var size = this.getContentSize();
            switch (this._type) {
                case cc.kCCProgressTimerTypeRadialCW:
                    this._endAngle = 270 + 3.6 * this._percentage;
                    break;
                case cc.kCCProgressTimerTypeRadialCCW:
                    this._startAngle = 270 - 3.6 * this._percentage;
                    break;
                case cc.kCCProgressTimerTypeHorizontalBarLR:
                    //left to right
                    this._origin = cc.PointZero();
                    this._drawPosition = cc.PointZero();
                    this._drawSize = cc.SizeMake(0 | ((this._percentage / 100) * size.width), size.height);
                    break;
                case cc.kCCProgressTimerTypeHorizontalBarRL:
                    //right to left
                    this._drawSize = cc.SizeMake(0 | ((this._percentage / 100) * size.width), size.height);
                    this._origin = cc.ccp((size.width - this._drawSize.width) | 0, 0);
                    this._drawPosition = cc.ccp(size.width - this._drawSize.width, 0);
                    break;
                case cc.kCCProgressTimerTypeVerticalBarBT:
                    //buttom to top
                    this._drawSize = cc.SizeMake(size.width, 0 | ((this._percentage / 100) * size.height));
                    this._drawPosition = cc.PointZero();
                    this._origin = cc.ccp(0, 0 | (size.height - this._drawSize.height));
                    break;
                case cc.kCCProgressTimerTypeVerticalBarTB:
                    //top to buttom
                    this._drawSize = cc.SizeMake(size.width, 0 | ((this._percentage / 100) * size.height));
                    this._drawPosition = cc.ccp(0, (size.height - this._drawSize.height) | 0);
                    this._origin = cc.ccp(0, 0);
                    break;
            }
        } else {
            switch (this._type) {
                case cc.kCCProgressTimerTypeRadialCW:
                case cc.kCCProgressTimerTypeRadialCCW:
                    this._updateRadial();
                    break;
                case cc.kCCProgressTimerTypeHorizontalBarLR:
                case cc.kCCProgressTimerTypeHorizontalBarRL:
                case cc.kCCProgressTimerTypeVerticalBarBT:
                case cc.kCCProgressTimerTypeVerticalBarTB:
                    this._updateBar();
                    break;
                default:
                    break;
            }
        }
    },
    _updateBar:function () {
        var alpha = this._percentage / 100;

        var fXMax = Math.max(this._sprite.getQuad().br.texCoords.u, this._sprite.getQuad().bl.texCoords.u);
        var fXMin = Math.min(this._sprite.getQuad().br.texCoords.u, this._sprite.getQuad().bl.texCoords.u);
        var fYMax = Math.max(this._sprite.getQuad().tl.texCoords.v, this._sprite.getQuad().bl.texCoords.v);
        var fYMin = Math.min(this._sprite.getQuad().tl.texCoords.v, this._sprite.getQuad().bl.texCoords.v);
        var tMax = cc.ccp(fXMax, fYMax);
        var tMin = cc.ccp(fXMin, fYMin);

        var vIndexes = [];
        var index = 0;

        //	We know vertex data is always equal to the 4 corners
        //	If we don't have vertex data then we create it here and populate
        //	the side of the bar vertices that won't ever change.
        if (!this._vertexData) {
            this._vertexDataCount = cc.kProgressTextureCoordsCount;
            this._vertexData = [];
            for (var i = 0; i < this._vertexDataCount; i++) {
                this._vertexData[i] = cc.V2F_C4B_T2F_QuadZero();
            }
            cc.Assert(this._vertexData, "");

            if (this._type == cc.kCCProgressTimerTypeHorizontalBarLR) {
                this._vertexData[vIndexes[0] = 0].texCoords = cc.tex2(tMin.x, tMin.y);
                this._vertexData[vIndexes[1] = 1].texCoords = cc.tex2(tMin.x, tMax.y);
            } else if (this._type == cc.kCCProgressTimerTypeHorizontalBarRL) {
                this._vertexData[vIndexes[0] = 2].texCoords = cc.tex2(tMax.x, tMax.y);
                this._vertexData[vIndexes[1] = 3].texCoords = cc.tex2(tMax.x, tMin.y);
            } else if (this._type == cc.kCCProgressTimerTypeVerticalBarBT) {
                this._vertexData[vIndexes[0] = 1].texCoords = cc.tex2(tMin.x, tMax.y);
                this._vertexData[vIndexes[1] = 3].texCoords = cc.tex2(tMax.x, tMax.y);
            } else if (this._type == cc.kCCProgressTimerTypeVerticalBarTB) {
                this._vertexData[vIndexes[0] = 0].texCoords = cc.tex2(tMin.x, tMin.y);
                this._vertexData[vIndexes[1] = 2].texCoords = cc.tex2(tMax.x, tMin.y);
            }

            index = vIndexes[0];
            this._vertexData[index].vertices = this._vertexFromTexCoord(cc.ccp(this._vertexData[index].texCoords.u,
                this._vertexData[index].texCoords.v));

            index = vIndexes[1];
            this._vertexData[index].vertices = this._vertexFromTexCoord(cc.ccp(this._vertexData[index].texCoords.u,
                this._vertexData[index].texCoords.v));

            if (this._sprite.isFlipY() || this._sprite.isFlipX()) {
                if (this._sprite.isFlipX()) {
                    index = vIndexes[0];
                    this._vertexData[index].texCoords.u = tMin.x + tMax.x - this._vertexData[index].texCoords.u;
                    index = vIndexes[1];
                    this._vertexData[index].texCoords.u = tMin.x + tMax.x - this._vertexData[index].texCoords.u;
                }

                if (this._sprite.isFlipY()) {
                    index = vIndexes[0];
                    this._vertexData[index].texCoords.v = tMin.y + tMax.y - this._vertexData[index].texCoords.v;
                    index = vIndexes[1];
                    this._vertexData[index].texCoords.v = tMin.y + tMax.y - this._vertexData[index].texCoords.v;
                }
            }

            this._updateColor();
        }

        if (this._type == cc.kCCProgressTimerTypeHorizontalBarLR) {
            this._vertexData[vIndexes[0] = 3].texCoords = cc.tex2(tMin.x + (tMax.x - tMin.x) * alpha, tMax.y);
            this._vertexData[vIndexes[1] = 2].texCoords = cc.tex2(tMin.x + (tMax.x - tMin.x) * alpha, tMin.y);
        } else if (this._type == cc.kCCProgressTimerTypeHorizontalBarRL) {
            this._vertexData[vIndexes[0] = 1].texCoords = cc.tex2(tMin.x + (tMax.x - tMin.x) * (1.0 - alpha), tMin.y);
            this._vertexData[vIndexes[1] = 0].texCoords = cc.tex2(tMin.x + (tMax.x - tMin.x) * (1.0 - alpha), tMax.y);
        } else if (this._type == cc.kCCProgressTimerTypeVerticalBarBT) {
            this._vertexData[vIndexes[0] = 0].texCoords = cc.tex2(tMin.x, tMin.y + (tMax.y - tMin.y) * (1.0 - alpha));
            this._vertexData[vIndexes[1] = 2].texCoords = cc.tex2(tMax.x, tMin.y + (tMax.y - tMin.y) * (1.0 - alpha));
        } else if (this._type == cc.kCCProgressTimerTypeVerticalBarTB) {
            this._vertexData[vIndexes[0] = 1].texCoords = cc.tex2(tMin.x, tMin.y + (tMax.y - tMin.y) * alpha);
            this._vertexData[vIndexes[1] = 3].texCoords = cc.tex2(tMax.x, tMin.y + (tMax.y - tMin.y) * alpha);
        }

        index = vIndexes[0];
        this._vertexData[index].vertices = this._vertexFromTexCoord(cc.ccp(this._vertexData[index].texCoords.u,
            this._vertexData[index].texCoords.v));
        index = vIndexes[1];
        this._vertexData[index].vertices = this._vertexFromTexCoord(cc.ccp(this._vertexData[index].texCoords.u,
            this._vertexData[index].texCoords.v));

        if (this._sprite.isFlipY() || this._sprite.isFlipX()) {
            if (this._sprite.isFlipX()) {
                index = vIndexes[0];
                this._vertexData[index].texCoords.u = tMin.x + tMax.x - this._vertexData[index].texCoords.u;
                index = vIndexes[1];
                this._vertexData[index].texCoords.u = tMin.x + tMax.x - this._vertexData[index].texCoords.u;
            }

            if (this._sprite.isFlipY()) {
                index = vIndexes[0];
                this._vertexData[index].texCoords.v = tMin.y + tMax.y - this._vertexData[index].texCoords.v;
                index = vIndexes[1];
                this._vertexData[index].texCoords.v = tMin.y + tMax.y - this._vertexData[index].texCoords.v;
            }
        }

    },
    _updateRadial:function () {
        //	Texture Max is the actual max coordinates to deal with non-power of 2 textures
        var fXMax = Math.max(this._sprite.getQuad().br.texCoords.u, this._sprite.getQuad().bl.texCoords.u);
        var fXMin = Math.min(this._sprite.getQuad().br.texCoords.u, this._sprite.getQuad().bl.texCoords.u);
        var fYMax = Math.max(this._sprite.getQuad().tl.texCoords.v, this._sprite.getQuad().bl.texCoords.v);
        var fYMin = Math.min(this._sprite.getQuad().tl.texCoords.v, this._sprite.getQuad().bl.texCoords.v);
        var tMax = cc.ccp(fXMax, fYMax);
        var tMin = cc.ccp(fXMin, fYMin);

        //	Grab the midpoint
        var midpoint = cc.ccpAdd(tMin, cc.ccpCompMult(this._anchorPoint, cc.ccpSub(tMax, tMin)));  //??? anchorPoint

        var alpha = this._percentage / 100;

        //	Otherwise we can get the angle from the alpha
        var angle = 2.0 * (Math.PI) * (this._type == cc.kCCProgressTimerTypeRadialCW ? alpha : 1.0 - alpha);

        //	We find the vector to do a hit detection based on the percentage
        //	We know the first vector is the one @ 12 o'clock (top,mid) so we rotate
        //	from that by the progress angle around the midpoint pivot
        var topMid = cc.ccp(midpoint.x, tMin.y);
        var percentagePt = cc.ccpRotateByAngle(topMid, midpoint, angle);

        var index = 0;
        var hit = cc.PointZero();

        if (alpha == 0.0) {
            //	More efficient since we don't always need to check intersection
            //	If the alpha is zero then the hit point is top mid and the index is 0.
            hit = topMid;
            index = 0;
        } else if (alpha == 1.0) {
            //	More efficient since we don't always need to check intersection
            //	If the alpha is one then the hit point is top mid and the index is 4.
            hit = topMid;
            index = 4;
        } else {
            //	We run a for loop checking the edges of the texture to find the
            //	intersection point
            //	We loop through five points since the top is split in half

            var min_t = Infinity;

            for (var i = 0; i <= cc.kProgressTextureCoordsCount; ++i) {
                var pIndex = (i + (cc.kProgressTextureCoordsCount - 1)) % cc.kProgressTextureCoordsCount;

                var edgePtA = cc.ccpAdd(tMin, cc.ccpCompMult(this._boundaryTexCoord(i % cc.kProgressTextureCoordsCount), cc.ccpSub(tMax, tMin)));
                var edgePtB = cc.ccpAdd(tMin, cc.ccpCompMult(this._boundaryTexCoord(pIndex), cc.ccpSub(tMax, tMin)));

                //	Remember that the top edge is split in half for the 12 o'clock position
                //	Let's deal with that here by finding the correct endpoints
                if (i == 0) {
                    edgePtB = cc.ccpLerp(edgePtA, edgePtB, 0.5);
                } else if (i == 4) {
                    edgePtA = cc.ccpLerp(edgePtA, edgePtB, 0.5);
                }

                //	s and t are returned by ccpLineIntersect
                var reP = cc.PointZero();

                if (cc.ccpLineIntersect(edgePtA, edgePtB, midpoint, percentagePt, reP)) {
                    //	Since our hit test is on rays we have to deal with the top edge
                    //	being in split in half so we have to test as a segment
                    if (i == 0 || i == 4) {
                        //	s represents the point between edgePtA--edgePtB
                        if (!(0.0 <= reP.x && reP.x <= 1.0)) {
                            continue;
                        }
                    }

                    //	As long as our t isn't negative we are at least finding a
                    //	correct hitpoint from midpoint to percentagePt.
                    if (reP.y >= 0.0) {
                        //	Because the percentage line and all the texture edges are
                        //	rays we should only account for the shortest intersection
                        if (reP.y < min_t) {
                            min_t = reP.y;
                            index = i;
                        }
                    }
                }

            }

            //	Now that we have the minimum magnitude we can use that to find our intersection
            hit = cc.ccpAdd(midpoint, cc.ccpMult(cc.ccpSub(percentagePt, midpoint), min_t));
        }

        //	The size of the vertex data is the index from the hitpoint
        //	the 3 is for the midpoint, 12 o'clock point and hitpoint position.

        var sameIndexCount = true;
        if (this._vertexDataCount != index + 3) {
            sameIndexCount = false;
            if (this._vertexData) {
                this._vertexData = null;
                this._vertexDataCount = 0;
            }
        }

        if (!this._vertexData) {
            this._vertexDataCount = index + 3;
            this._vertexData = [];
            for (var i = 0; i < this._vertexDataCount; i++) {
                this._vertexData[i] = cc.V2F_C4B_T2F_QuadZero();
            }
            cc.Assert(this._vertexData, "");

            this._updateColor();
        }

        if (!sameIndexCount) {
            //	First we populate the array with the midpoint, then all
            //	vertices/texcoords/colors of the 12 'o clock start and edges and the hitpoint
            this._vertexData[0].texCoords = cc.tex2(midpoint.x, midpoint.y);
            this._vertexData[0].vertices = this._vertexFromTexCoord(midpoint);

            this._vertexData[1].texCoords = cc.tex2(midpoint.x, tMin.y);
            this._vertexData[1].vertices = this._vertexFromTexCoord(cc.ccp(midpoint.x, tMin.y));

            for (var i = 0; i < index; ++i) {
                var texCoords = cc.ccpAdd(tMin, cc.ccpCompMult(this._boundaryTexCoord(i), cc.ccpSub(tMax, tMin)));

                this._vertexData[i + 2].texCoords = cc.tex2(texCoords.x, texCoords.y);
                this._vertexData[i + 2].vertices = this._vertexFromTexCoord(texCoords);
            }

            //	Flip the texture coordinates if set
            if (this._sprite.isFlipX() || this._sprite.isFlipY()) {
                for (var i = 0; i < this._vertexDataCount - 1; ++i) {
                    if (this._sprite.isFlipX()) {
                        this._vertexData[i].texCoords.u = tMin.x + tMax.x - this._vertexData[i].texCoords.u;
                    }

                    if (this._sprite.isFlipY()) {
                        this._vertexData[i].texCoords.v = tMin.y + tMax.y - this._vertexData[i].texCoords.v;
                    }
                }
            }
        }

        //	hitpoint will go last
        this._vertexData[this._vertexDataCount - 1].texCoords = cc.tex2(hit.x, hit.y);
        this._vertexData[this._vertexDataCount - 1].vertices = this._vertexFromTexCoord(hit);

        if (this._sprite.isFlipX() || this._sprite.isFlipY()) {
            if (this._sprite.isFlipX()) {
                this._vertexData[this._vertexDataCount - 1].texCoords.u = tMin.x + tMax.x - this._vertexData[this._vertexDataCount - 1].texCoords.u;
            }

            if (this._sprite.isFlipY()) {
                this._vertexData[this._vertexDataCount - 1].texCoords.v = tMin.y + tMax.y - this._vertexData[this._vertexDataCount - 1].texCoords.v;
            }
        }

    },
    _updateColor:function () {
        var op = this._sprite.getOpacity();
        var c3b = this._sprite.getColor();

        var color = new cc.Color4B(c3b.r, c3b.g, c3b.b, op);
        if ((this._sprite.getTexture() instanceof HTMLImageElement) || (this._sprite.getTexture() instanceof HTMLCanvasElement)) {
            color.r *= op / 255;
            color.g *= op / 255;
            color.b *= op / 255;
        } else {
            if (this._sprite.getTexture().getHasPremultipliedAlpha()) {
                color.r *= op / 255;
                color.g *= op / 255;
                color.b *= op / 255;
            }
        }

        if (this._vertexData) {
            for (var i = 0; i < this._vertexDataCount; ++i) {
                this._vertexData[i].colors = color;
            }
        }

    },
    _boundaryTexCoord:function (index) {
        if (index < cc.kProgressTextureCoordsCount) {
            switch (this._type) {
                case cc.kCCProgressTimerTypeRadialCW:
                    return cc.ccp(((cc.kProgressTextureCoords >> ((index << 1) + 1)) & 1), ((cc.kProgressTextureCoords >> (index << 1)) & 1));
                case cc.kCCProgressTimerTypeRadialCCW:
                    return cc.ccp(((cc.kProgressTextureCoords >> (7 - (index << 1))) & 1), ((cc.kProgressTextureCoords >> (7 - ((index << 1) + 1))) & 1));
                default:
                    break;
            }
        }
        return cc.PointZero();
    },
    _type:null,
    _percentage:0.0,
    _sprite:null,
    _vertexDataCount:0,
    _vertexData:null
});

cc.ProgressTimer.progressWithFile = function (fileName) {
    var pProgressTimer = new cc.ProgressTimer();
    if (pProgressTimer.initWithFile(fileName)) {
        return pProgressTimer;
    } else {
        return null;
    }
};
cc.ProgressTimer.progressWithTexture = function (texture) {
    var pProgressTimer = new cc.ProgressTimer();
    if (pProgressTimer.initWithTexture(texture)) {
        return pProgressTimer;
    } else {
        return null;
    }
};
