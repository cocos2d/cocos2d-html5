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
        return this._m_eType;
    },

    /** Percentages are from 0 to 100 */
    getPercentage:function () {
        return this._m_fPercentage;
    },

    /** The image to show the progress percentage, retain */
    getSprite:function () {
        return this._m_pSprite;
    },

    initWithFile:function (pszFileName) {
        return this.initWithTexture(cc.TextureCache.sharedTextureCache().addImage(pszFileName));
    },

    initWithTexture:function (pTexture) {
        this._m_pSprite = cc.Sprite.spriteWithTexture(pTexture);

        this._m_fPercentage = 0.0;
        this._m_pVertexData = null;
        this._m_nVertexDataCount = 0;
        this.setAnchorPoint(cc.ccp(0.5, 0.5));
        this.setContentSize(this._m_pSprite.getContentSize());
        this._m_eType = cc.kCCProgressTimerTypeRadialCCW;

        return true;

    },

    setPercentage:function (fPercentage) {
        if (this._m_fPercentage != fPercentage) {
            this._m_fPercentage = cc.clampf(fPercentage, 0, 100);
            this._updateProgress();
        }
    },
    setSprite:function (pSprite) {
        if (this._m_pSprite != pSprite) {
            this._m_pSprite = pSprite;
            this.setContentSize(this._m_pSprite.getContentSize());

            //	Everytime we set a new sprite, we free the current vertex data
            if (this._m_pVertexData) {
                this._m_pVertexData = null;
                this._m_nVertexDataCount = 0;
            }
        }
    },

    setType:function (type) {
        if (type != this._m_eType) {
            //	release all previous information
            if (this._m_pVertexData) {
                this._m_pVertexData = null;
                this._m_nVertexDataCount = 0;
            }

            this._m_eType = type;
        }

    },

    draw:function () {

        this._super();

        if (!this._m_pVertexData) {
            return;
        }

        if (!this._m_pSprite) {
            return;
        }

        var bf = this._m_pSprite.getBlendFunc();
        var newBlend = (bf.src != cc.BLEND_SRC || bf.dst != cc.BLEND_DST) ? true : false;
        if (newBlend) {
            //glBlendFunc(bf.src, bf.dst);
        }

        ///	========================================================================
        //	Replaced [texture_ drawAtPoint:CCPointZero] with my own vertexData
        //	Everything above me and below me is copied from CCTextureNode's draw
        //glBindTexture(GL_TEXTURE_2D, m_pSprite->getTexture()->getName());
        //glVertexPointer(2, GL_FLOAT, sizeof(ccV2F_C4B_T2F), &m_pVertexData[0].vertices);
        //glTexCoordPointer(2, GL_FLOAT, sizeof(ccV2F_C4B_T2F), &m_pVertexData[0].texCoords);
        //glColorPointer(4, GL_UNSIGNED_BYTE, sizeof(ccV2F_C4B_T2F), &m_pVertexData[0].colors);

        if (this._m_eType == cc.kCCProgressTimerTypeRadialCCW || this._m_eType == cc.kCCProgressTimerTypeRadialCW) {
            //glDrawArrays(GL_TRIANGLE_FAN, 0, m_nVertexDataCount);
        } else if (this._m_eType == cc.kCCProgressTimerTypeHorizontalBarLR ||
            this._m_eType == cc.kCCProgressTimerTypeHorizontalBarRL ||
            this._m_eType == cc.kCCProgressTimerTypeVerticalBarBT ||
            this._m_eType == cc.kCCProgressTimerTypeVerticalBarTB) {
            //glDrawArrays(GL_TRIANGLE_STRIP, 0, m_nVertexDataCount);
        }
        //glDrawElements(GL_TRIANGLES, indicesCount_, GL_UNSIGNED_BYTE, indices_);
        ///	========================================================================

        if (newBlend) {
            //glBlendFunc(CC_BLEND_SRC, CC_BLEND_DST);
        }

    },


    _vertexFromTexCoord:function (texCoord) {
        var tmp;
        var ret = new cc.Vertex2F(0, 0);

        var pTexture = this._m_pSprite.getTexture();
        if (pTexture) {
            var fXMax = Math.max(this._m_pSprite.getQuad().br.texCoords.u, this._m_pSprite.getQuad().bl.texCoords.u);
            var fXMin = Math.min(this._m_pSprite.getQuad().br.texCoords.u, this._m_pSprite.getQuad().bl.texCoords.u);
            var fYMax = Math.max(this._m_pSprite.getQuad().tl.texCoords.v, this._m_pSprite.getQuad().bl.texCoords.v);
            var fYMin = Math.min(this._m_pSprite.getQuad().tl.texCoords.v, this._m_pSprite.getQuad().bl.texCoords.v);
            var tMax = cc.ccp(fXMax, fYMax);
            var tMin = cc.ccp(fXMin, fYMin);

            var texSize = cc.SizeMake(this._m_pSprite.getQuad().br.vertices.x - this._m_pSprite.getQuad().bl.vertices.x,
                this._m_pSprite.getQuad().tl.vertices.y - this._m_pSprite.getQuad().bl.vertices.y);
            tmp = cc.ccp(texSize.width * (texCoord.x - tMin.x) / (tMax.x - tMin.x),
                texSize.height * (1 - (texCoord.y - tMin.y) / (tMax.y - tMin.y)));
        } else {
            tmp = cc.PointZero();
        }

        ret.x = tmp.x;
        ret.y = tmp.y;
        return ret;

    },

    _updateProgress:function () {
        switch (this._m_eType) {
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

    },
    _updateBar:function () {
        var alpha = this._m_fPercentage / 100;

        var fXMax = Math.max(this._m_pSprite.getQuad().br.texCoords.u, this._m_pSprite.getQuad().bl.texCoords.u);
        var fXMin = Math.min(this._m_pSprite.getQuad().br.texCoords.u, this._m_pSprite.getQuad().bl.texCoords.u);
        var fYMax = Math.max(this._m_pSprite.getQuad().tl.texCoords.v, this._m_pSprite.getQuad().bl.texCoords.v);
        var fYMin = Math.min(this._m_pSprite.getQuad().tl.texCoords.v, this._m_pSprite.getQuad().bl.texCoords.v);
        var tMax = cc.ccp(fXMax, fYMax);
        var tMin = cc.ccp(fXMin, fYMin);

        var vIndexes = [];
        var index = 0;

        //	We know vertex data is always equal to the 4 corners
        //	If we don't have vertex data then we create it here and populate
        //	the side of the bar vertices that won't ever change.
        if (!this._m_pVertexData) {
            this._m_nVertexDataCount = cc.kProgressTextureCoordsCount;
            this._m_pVertexData = [];
            for (var i = 0; i < this._m_nVertexDataCount; i++) {
                this._m_pVertexData[i] = cc.V2F_C4B_T2F_QuadZero();
            }
            cc.Assert(this._m_pVertexData, "");

            if (this._m_eType == cc.kCCProgressTimerTypeHorizontalBarLR) {
                this._m_pVertexData[vIndexes[0] = 0].texCoords = cc.tex2(tMin.x, tMin.y);
                this._m_pVertexData[vIndexes[1] = 1].texCoords = cc.tex2(tMin.x, tMax.y);
            } else if (this._m_eType == cc.kCCProgressTimerTypeHorizontalBarRL) {
                this._m_pVertexData[vIndexes[0] = 2].texCoords = cc.tex2(tMax.x, tMax.y);
                this._m_pVertexData[vIndexes[1] = 3].texCoords = cc.tex2(tMax.x, tMin.y);
            } else if (this._m_eType == cc.kCCProgressTimerTypeVerticalBarBT) {
                this._m_pVertexData[vIndexes[0] = 1].texCoords = cc.tex2(tMin.x, tMax.y);
                this._m_pVertexData[vIndexes[1] = 3].texCoords = cc.tex2(tMax.x, tMax.y);
            } else if (this._m_eType == cc.kCCProgressTimerTypeVerticalBarTB) {
                this._m_pVertexData[vIndexes[0] = 0].texCoords = cc.tex2(tMin.x, tMin.y);
                this._m_pVertexData[vIndexes[1] = 2].texCoords = cc.tex2(tMax.x, tMin.y);
            }

            index = vIndexes[0];
            this._m_pVertexData[index].vertices = this._vertexFromTexCoord(cc.ccp(this._m_pVertexData[index].texCoords.u,
                this._m_pVertexData[index].texCoords.v));

            index = vIndexes[1];
            this._m_pVertexData[index].vertices = this._vertexFromTexCoord(cc.ccp(this._m_pVertexData[index].texCoords.u,
                this._m_pVertexData[index].texCoords.v));

            if (this._m_pSprite.isFlipY() || this._m_pSprite.isFlipX()) {
                if (this._m_pSprite.isFlipX()) {
                    index = vIndexes[0];
                    this._m_pVertexData[index].texCoords.u = tMin.x + tMax.x - this._m_pVertexData[index].texCoords.u;
                    index = vIndexes[1];
                    this._m_pVertexData[index].texCoords.u = tMin.x + tMax.x - this._m_pVertexData[index].texCoords.u;
                }

                if (this._m_pSprite.isFlipY()) {
                    index = vIndexes[0];
                    this._m_pVertexData[index].texCoords.v = tMin.y + tMax.y - this._m_pVertexData[index].texCoords.v;
                    index = vIndexes[1];
                    this._m_pVertexData[index].texCoords.v = tMin.y + tMax.y - this._m_pVertexData[index].texCoords.v;
                }
            }

            this._updateColor();
        }

        if (this._m_eType == cc.kCCProgressTimerTypeHorizontalBarLR) {
            this._m_pVertexData[vIndexes[0] = 3].texCoords = cc.tex2(tMin.x + (tMax.x - tMin.x) * alpha, tMax.y);
            this._m_pVertexData[vIndexes[1] = 2].texCoords = cc.tex2(tMin.x + (tMax.x - tMin.x) * alpha, tMin.y);
        } else if (this._m_eType == cc.kCCProgressTimerTypeHorizontalBarRL) {
            this._m_pVertexData[vIndexes[0] = 1].texCoords = cc.tex2(tMin.x + (tMax.x - tMin.x) * (1.0 - alpha), tMin.y);
            this._m_pVertexData[vIndexes[1] = 0].texCoords = cc.tex2(tMin.x + (tMax.x - tMin.x) * (1.0 - alpha), tMax.y);
        } else if (this._m_eType == cc.kCCProgressTimerTypeVerticalBarBT) {
            this._m_pVertexData[vIndexes[0] = 0].texCoords = cc.tex2(tMin.x, tMin.y + (tMax.y - tMin.y) * (1.0 - alpha));
            this._m_pVertexData[vIndexes[1] = 2].texCoords = cc.tex2(tMax.x, tMin.y + (tMax.y - tMin.y) * (1.0 - alpha));
        } else if (this._m_eType == cc.kCCProgressTimerTypeVerticalBarTB) {
            this._m_pVertexData[vIndexes[0] = 1].texCoords = cc.tex2(tMin.x, tMin.y + (tMax.y - tMin.y) * alpha);
            this._m_pVertexData[vIndexes[1] = 3].texCoords = cc.tex2(tMax.x, tMin.y + (tMax.y - tMin.y) * alpha);
        }

        index = vIndexes[0];
        this._m_pVertexData[index].vertices = this._vertexFromTexCoord(cc.ccp(this._m_pVertexData[index].texCoords.u,
            this._m_pVertexData[index].texCoords.v));
        index = vIndexes[1];
        this._m_pVertexData[index].vertices = this._vertexFromTexCoord(cc.ccp(this._m_pVertexData[index].texCoords.u,
            this._m_pVertexData[index].texCoords.v));

        if (this._m_pSprite.isFlipY() || this._m_pSprite.isFlipX()) {
            if (this._m_pSprite.isFlipX()) {
                index = vIndexes[0];
                this._m_pVertexData[index].texCoords.u = tMin.x + tMax.x - this._m_pVertexData[index].texCoords.u;
                index = vIndexes[1];
                this._m_pVertexData[index].texCoords.u = tMin.x + tMax.x - this._m_pVertexData[index].texCoords.u;
            }

            if (this._m_pSprite.isFlipY()) {
                index = vIndexes[0];
                this._m_pVertexData[index].texCoords.v = tMin.y + tMax.y - this._m_pVertexData[index].texCoords.v;
                index = vIndexes[1];
                this._m_pVertexData[index].texCoords.v = tMin.y + tMax.y - this._m_pVertexData[index].texCoords.v;
            }
        }

    },
    _updateRadial:function () {
        //	Texture Max is the actual max coordinates to deal with non-power of 2 textures
        var fXMax = Math.max(this._m_pSprite.getQuad().br.texCoords.u, this._m_pSprite.getQuad().bl.texCoords.u);
        var fXMin = Math.min(this._m_pSprite.getQuad().br.texCoords.u, this._m_pSprite.getQuad().bl.texCoords.u);
        var fYMax = Math.max(this._m_pSprite.getQuad().tl.texCoords.v, this._m_pSprite.getQuad().bl.texCoords.v);
        var fYMin = Math.min(this._m_pSprite.getQuad().tl.texCoords.v, this._m_pSprite.getQuad().bl.texCoords.v);
        var tMax = cc.ccp(fXMax, fYMax);
        var tMin = cc.ccp(fXMin, fYMin);

        //	Grab the midpoint
        var midpoint = cc.ccpAdd(tMin, cc.ccpCompMult(this._m_tAnchorPoint, cc.ccpSub(tMax, tMin)));  //??? m_tAnchorPoint

        var alpha = this._m_fPercentage / 100;

        //	Otherwise we can get the angle from the alpha
        var angle = 2.0 * (Math.PI) * (this._m_eType == cc.kCCProgressTimerTypeRadialCW ? alpha : 1.0 - alpha);

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
        if (_m_nVertexDataCount != index + 3) {
            sameIndexCount = false;
            if (_m_pVertexData) {
                _m_pVertexData = null;
                _m_nVertexDataCount = 0;
            }
        }

        if (!_m_pVertexData) {
            this._m_nVertexDataCount = index + 3;
            this._m_pVertexData = [];
            for (var i = 0; i < this._m_nVertexDataCount; i++) {
                this._m_pVertexData[i] = cc.V2F_C4B_T2F_QuadZero();
            }
            cc.Assert(this._m_pVertexData, "");

            this._updateColor();
        }

        if (!sameIndexCount) {
            //	First we populate the array with the midpoint, then all
            //	vertices/texcoords/colors of the 12 'o clock start and edges and the hitpoint
            this._m_pVertexData[0].texCoords = cc.tex2(midpoint.x, midpoint.y);
            this._m_pVertexData[0].vertices = this._vertexFromTexCoord(midpoint);

            this._m_pVertexData[1].texCoords = cc.tex2(midpoint.x, tMin.y);
            this._m_pVertexData[1].vertices = this._vertexFromTexCoord(cc.ccp(midpoint.x, tMin.y));

            for (var i = 0; i < index; ++i) {
                var texCoords = cc.ccpAdd(tMin, cc.ccpCompMult(this._boundaryTexCoord(i), cc.ccpSub(tMax, tMin)));

                this._m_pVertexData[i + 2].texCoords = cc.tex2(texCoords.x, texCoords.y);
                this._m_pVertexData[i + 2].vertices = this._vertexFromTexCoord(texCoords);
            }

            //	Flip the texture coordinates if set
            if (this._m_pSprite.isFlipX() || this._m_pSprite.isFlipY()) {
                for (var i = 0; i < this._m_nVertexDataCount - 1; ++i) {
                    if (this._m_pSprite.isFlipX()) {
                        this._m_pVertexData[i].texCoords.u = tMin.x + tMax.x - this._m_pVertexData[i].texCoords.u;
                    }

                    if (this._m_pSprite.isFlipY()) {
                        this._m_pVertexData[i].texCoords.v = tMin.y + tMax.y - this._m_pVertexData[i].texCoords.v;
                    }
                }
            }
        }

        //	hitpoint will go last
        this._m_pVertexData[this._m_nVertexDataCount - 1].texCoords = cc.tex2(hit.x, hit.y);
        this._m_pVertexData[this._m_nVertexDataCount - 1].vertices = this._vertexFromTexCoord(hit);

        if (this._m_pSprite.isFlipX() || this._m_pSprite.isFlipY()) {
            if (this._m_pSprite.isFlipX()) {
                this._m_pVertexData[this._m_nVertexDataCount - 1].texCoords.u = tMin.x + tMax.x - this._m_pVertexData[this._m_nVertexDataCount - 1].texCoords.u;
            }

            if (this._m_pSprite.isFlipY()) {
                this._m_pVertexData[this._m_nVertexDataCount - 1].texCoords.v = tMin.y + tMax.y - this._m_pVertexData[this._m_nVertexDataCount - 1].texCoords.v;
            }
        }

    },
    _updateColor:function () {
        var op = this._m_pSprite.getOpacity();
        var c3b = this._m_pSprite.getColor();

        var color = new cc.Color4B(c3b.r, c3b.g, c3b.b, op);
        if (this._m_pSprite.getTexture().getHasPremultipliedAlpha()) {
            color.r *= op / 255;
            color.g *= op / 255;
            color.b *= op / 255;
        }

        if (this._m_pVertexData) {
            for (var i = 0; i < this._m_nVertexDataCount; ++i) {
                this._m_pVertexData[i].colors = color;
            }
        }

    },
    _boundaryTexCoord:function (index) {
        if (index < cc.kProgressTextureCoordsCount) {
            switch (this._m_eType) {
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

    _m_eType:null,
    _m_fPercentage:0.0,
    _m_pSprite:null,
    _m_nVertexDataCount:0,
    _m_pVertexData:null

});


cc.ProgressTimer.progressWithFile = function (pszFileName) {
    var pProgressTimer = new cc.ProgressTimer();
    if (pProgressTimer.initWithFile(pszFileName)) {
        //pProgressTimer.autorelease();
    } else {
        pProgressTimer = null;
    }

    return pProgressTimer;

};
cc.ProgressTimer.progressWithTexture = function (pTexture) {
    var pProgressTimer = new cc.ProgressTimer();
    if (pProgressTimer.initWithTexture(pTexture)) {
        //pProgressTimer->autorelease();
    } else {
        pProgressTimer = null;
    }
    return pProgressTimer;

};
