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
var cc = cc = cc || {};

cc.SpriteIndexNotInitialized = "0xffffffff";
/// CCSprite invalid index on the CCSpriteBatchode

/**
 Whether or not an CCSprite will rotate, scale or translate with it's parent.
 Useful in health bars, when you want that the health bar translates with it's parent but you don't
 want it to rotate with its parent.
 @since v0.99.0
 */
//! Translate with it's parent
cc.HONOR_PARENT_TRANSFORM_TRANSLATE = 1 << 0;
//! Rotate with it's parent
cc.HONOR_PARENT_TRANSFORM_ROTATE = 1 << 1;
//! Scale with it's parent
cc.HONOR_PARENT_TRANSFORM_SCALE = 1 << 2;
//! Skew with it's parent
cc.HONOR_PARENT_TRANSFORM_SKEW = 1 << 3;
//! All possible transformation enabled. Default value.
cc.HONOR_PARENT_TRANSFORM_ALL = cc.HONOR_PARENT_TRANSFORM_TRANSLATE | cc.HONOR_PARENT_TRANSFORM_ROTATE | cc.HONOR_PARENT_TRANSFORM_SCALE | cc.HONOR_PARENT_TRANSFORM_SKEW;


/** CCSprite is a 2d image ( http://en.wikipedia.org/wiki/Sprite_(computer_graphics) )
 *
 * CCSprite can be created with an image, or with a sub-rectangle of an image.
 *
 * If the parent or any of its ancestors is a CCSpriteBatchNode then the following features/limitations are valid
 *    - Features when the parent is a CCBatchNode:
 *        - MUCH faster rendering, specially if the CCSpriteBatchNode has many children. All the children will be drawn in a single batch.
 *
 *    - Limitations
 *        - Camera is not supported yet (eg: CCOrbitCamera action doesn't work)
 *        - GridBase actions are not supported (eg: CCLens, CCRipple, CCTwirl)
 *        - The Alias/Antialias property belongs to CCSpriteBatchNode, so you can't individually set the aliased property.
 *        - The Blending function property belongs to CCSpriteBatchNode, so you can't individually set the blending function property.
 *        - Parallax scroller is not supported, but can be simulated with a "proxy" sprite.
 *
 *  If the parent is an standard CCNode, then CCSprite behaves like any other CCNode:
 *    - It supports blending functions
 *    - It supports aliasing / antialiasing
 *    - But the rendering will be slower: 1 draw per children.
 *
 * The default anchorPoint in CCSprite is (0.5, 0.5).
 */
// XXX: Optmization
function transformValues(pos, scale, rotation, skew, ap, visible) {
    this.pos = pos;		// position x and y
    this.scale = scale;		// scale x and y
    this.rotation = rotation;
    this.skew = skew;		// skew x and y
    this.ap = ap;			// anchor point in pixels
    this.visible = visible;
}

cc.Sprite = cc.Node.extend({
    //
    // Data used when the sprite is rendered using a CCSpriteSheet
    //
    __m_pobTextureAtlas:null,
    _m_uAtlasIndex:0,
    _m_pobBatchNode:null,
    _m_eHonorParentTransform:null,
    _m_bDirty:null,
    _m_bRecursiveDirty:null,
    _m_bHasChildren:null,
    //
    // Data used when the sprite is self-rendered
    //
    _m_sBlendFunc:null,
    _m_pobTexture:null,

    //
    // Shared data
    //
    // whether or not it's parent is a CCSpriteBatchNode
    _m_bUsesBatchNode:null,
    // texture
    _m_obRect:null,
    _m_obRectInPixels:null,
    _m_bRectRotated:null,

     // Offset Position (used by Zwoptex)
     _m_obOffsetPositionInPixels:null, // absolute
     _m_obUnflippedOffsetPositionFromCenter:null,

     // vertex coords, texture coords and color info
     _m_sQuad:null,

     // opacity and RGB protocol
     m_sColorUnmodified:null,
     _m_bOpacityModifyRGB:null,

     // image is flipped
     _m_bFlipX:null,
     _m_bFlipY:null,

    _m_nOpacity:null,

    /** whether or not the Sprite needs to be updated in the Atlas */
    isDirty:function(){
        return this._m_bDirty;
    },
    /** make the Sprite to be updated in the Atlas. */
    setDirty:function(bDirty){
        this._m_bDirty = bDirty;
    },
    /** get the quad (tex coords, vertex coords and color) information */
    getQuad:function(){
        return this._m_sQuad;
    },
    /** returns whether or not the texture rectangle is rotated */
    isTextureRectRotated:function(){
        return this._m_bRectRotated;
    },
    /** Set the index used on the TextureAtlas. */
    getAtlasIndex:function(){
        return this._m_uAtlasIndex;
    },
    /** Set the index used on the TextureAtlas.
     @warning Don't modify this value unless you know what you are doing
     */
    setAtlasIndex:function(uAtlasIndex){
        this._m_uAtlasIndex = uAtlasIndex;
    },
    /** returns the rect of the CCSprite in points */
    getTextureRect:function(){
        return this._m_obRect;
    },
    /** whether or not the Sprite is rendered using a CCSpriteBatchNode */
    isUsesBatchNode:function(){
        return this._m_bUsesBatchNode;
    },
    /** make the Sprite been rendered using a CCSpriteBatchNode */
    setUsesSpriteBatchNode:function(bUsesSpriteBatchNode){
        this._m_bUsesBatchNode = bUsesSpriteBatchNode;
    },
    getTextureAtlas:function(pobTextureAtlas){
        return this.__m_pobTextureAtlas;
    },
    setTextureAtlas:function(pobTextureAtlas){
        this.__m_pobTextureAtlas = pobTextureAtlas;
    },
    getSpriteBatchNode:function(){
        return this._m_pobBatchNode;
    },
    setSpriteBatchNode:function(pobSpriteBatchNode){
        this._m_pobBatchNode = pobSpriteBatchNode;
    },
    /** whether or not to transform according to its parent transformations.
     Useful for health bars. eg: Don't rotate the health bar, even if the parent rotates.
     IMPORTANT: Only valid if it is rendered using an CCSpriteSheet.
     @since v0.99.0
     */
    getHonorParentTransform:function(){
        return this._m_eHonorParentTransform;
    },
    /** whether or not to transform according to its parent transformations.
     Useful for health bars. eg: Don't rotate the health bar, even if the parent rotates.
     IMPORTANT: Only valid if it is rendered using an CCSpriteSheet.
     @since v0.99.0
     */
    setHonorParentTransform:function(eHonorParentTransform){
        this._m_eHonorParentTransform = eHonorParentTransform;
    },
    /** Get offset position of the sprite. Calculated automatically by editors like Zwoptex.
     @since v0.99.0
     */
    getOffsetPositionInPixels:function(){
        return this._m_obOffsetPositionInPixels;
    },
    /** conforms to CCTextureProtocol protocol */
    getBlendFunc:function(){
        return this._m_sBlendFunc;
    },
    /** conforms to CCTextureProtocol protocol */
    setBlendFunc:function(blendFunc){
        this._m_sBlendFunc = blendFunc;
    },
    /** Initializes an sprite with an CCSpriteBatchNode and a rect in points */
    initWithBatchNode:function (batchNode, rect) {
        if (this.initWithTexture(batchNode.getTexture(), rect)) {
            this.useBatchNode(batchNode);
            return true;
        }
        return false;
    },
    /** Initializes an sprite with an CCSpriteBatchNode and a rect in pixels
     @since v0.99.5
     */
    initWithBatchNodeRectInPixels:function (batchNode, rect) {
        if (this.initWithTexture(batchNode.getTexture())) {
            this.setTextureRectInPixels(rect, false, rect.size);
            this.useBatchNode(batchNode);
            return true;
        }
        return false;
    },
    init:function () {
        this._m_bDirty = this._m_bRecursiveDirty = false;
        // by default use "Self Render".
        // if the sprite is added to an batchnode, then it will automatically switch to "SpriteSheet Render"
        this.useSelfRender();

        this._m_bOpacityModifyRGB = true;
        this._m_nOpacity = 255;
        this._m_sColor = this._m_sColorUnmodified = cc.WHITE;

        this._m_sBlendFunc.src = cc.BLEND_SRC;
        this._m_sBlendFunc.dst = cc.BLEND_DST;

        // update texture (calls _updateBlendFunc)
        this.setTexture(null);

        // clean the Quad
        cc.memset(this._m_sQuad, 0, sizeof(this._m_sQuad));

        this._m_bFlipX = this._m_bFlipY = false;

        // default transform anchor: center
        this.setAnchorPoint(ccp(0.5, 0.5));

        // zwoptex default values
        this._m_obOffsetPositionInPixels = cc.PointZero;

        this._m_eHonorParentTransform = cc.HONOR_PARENT_TRANSFORM_ALL;
        this._m_bHasChildren = false;

        // Atlas: Color
        var tmpColor = new cc.Color4B(255, 255, 255, 255);
        this._m_sQuad.bl.colors = tmpColor;
        this._m_sQuad.br.colors = tmpColor;
        this._m_sQuad.tl.colors = tmpColor;
        this._m_sQuad.tr.colors = tmpColor;

        // Atlas: Vertex

        // updated in "useSelfRender"

        // Atlas: TexCoords
        this.setTextureRectInPixels(cc.RectZero, false, cc.SizeZero);

        return true;
    },
    initWithTexture:function (pTexture, rect) {
        var argnum = arguments.length;
        switch(argnum){
            case 1:
                /** Initializes an sprite with a texture.
                 The rect used will be the size of the texture.
                 The offset will be (0,0).
                 */
                cc.Assert(pTexture != null, "");
                var rect = new cc.Rect();
                rect.size = pTexture.getContentSize();
                return this.initWithTexture(pTexture, rect);
                break;
            case 2:
                /** Initializes an sprite with a texture and a rect.
                 The offset will be (0,0).
                 */
                cc.Assert(pTexture != null, "");
                // IMPORTANT: [self init] and not [super init];
                this.init();
                this.setTexture(pTexture);
                this.setTextureRect(rect);
                return true;
                break;
            default:
                throw "Argument must be non-nil ";
                break;
        }
    },

    initWithFile:function (pszFilename, rect) {
        var argnum = arguments.length;
        switch (argnum) {
            case 1:
                /** Initializes an sprite with an image filename.
                 The rect used will be the size of the image.
                 The offset will be (0,0).
                 */
                cc.Assert(pszFilename != null, "");
                var pTexture = new cc.Texture2D();
                pTexture = cc.TextureCache.sharedTextureCache().addImage(pszFilename);
                if (pTexture) {
                    var rect = new cc.Rect();
                    rect = cc.RectZero;
                    rect.size = pTexture.getContentSize();
                    return this.initWithTexture(pTexture, rect);
                }

                // don't release here.
                // when load texture failed, it's better to get a "transparent" sprite then a crashed program
                // this.release();
                return false;
                break;
            case 2:
                /** Initializes an sprite with an image filename, and a rect.
                 The offset will be (0,0).
                 */
                cc.Assert(pszFilename != null, "");
                var pTexture = new cc.Texture2D();
                pTexture = cc.TextureCache.sharedTextureCache().addImage(pszFilename);
                if (pTexture) {
                    return this.initWithTexture(pTexture, rect);
                }

                // don't release here.
                // when load texture failed, it's better to get a "transparent" sprite then a crashed program
                // this.release();
                return false;
                break;
            default:
                throw "Argument must be non-nil ";
                break;
        }
    },
    // Initializes an sprite with an sprite frame.
    initWithSpriteFrame:function (pSpriteFrame) {
        cc.Assert(pSpriteFrame != null, "");
        var bRet = this.initWithTexture(pSpriteFrame.getTexture(), pSpriteFrame.getRect());
        this.setDisplayFrame(pSpriteFrame);

        return bRet;
    },
    /** Initializes an sprite with an sprite frame name.
     An CCSpriteFrame will be fetched from the CCSpriteFrameCache by name.
     If the CCSpriteFrame doesn't exist it will raise an exception.
     @since v0.9
     */
    initWithSpriteFrameName:function (pszSpriteFrameName) {
        cc.Assert(pszSpriteFrameName != null, "");
        var pFrame = new cc.SpriteFrame();
        pFrame = cc.SpriteFrameCache.sharedSpriteFrameCache().spriteFrameByName(pszSpriteFrameName);
        return this.initWithSpriteFrame(pFrame);
    },
    // XXX: deprecated
    /* initWithCGImage:function(pImage, pszKey){
         var argnum = arguments.length;
         switch(argnum){
             case 1:
                 // todo
                 // because it is deprecated, so we do not impelment it
                 return null;
                 break;
             case 2:
                 cc.Assert(pImage != null);
                 var pTexture  = new cc.Texture2D();
                 pTexture = cc.TextureCache.sharedTextureCache().addCGImage(pImage, pszKey);
                 var size = new cc.Size(),rect = new cc.Rect();
                 size = pTexture.getContentSize();
                 rect = cc.RectMake(0 ,0, size.width, size.height);
                 return this.initWithTexture(texture, rect);
                 break;
             default:
                 throw "Argument must be non-nil ";
                 break;
         }

     },*/

    /** tell the sprite to use self-render.
     @since v0.99.0
     */
    useSelfRender:function () {
        this._m_uAtlasIndex = cc.SpriteIndexNotInitialized;
        this._m_bUsesBatchNode = false;
        this.__m_pobTextureAtlas = null;
        this._m_pobBatchNode = null;
        this._m_bDirty = this._m_bRecursiveDirty = false;

        var x1 = 0 + this._m_obOffsetPositionInPixels.x;
        var y1 = 0 + this._m_obOffsetPositionInPixels.y;
        var x2 = x1 + this._m_obRectInPixels.size.width;
        var y2 = y1 + this._m_obRectInPixels.size.height;
        this._m_sQuad.bl.vertices = vertex3(x1, y1, 0);
        this._m_sQuad.br.vertices = vertex3(x2, y1, 0);
        this._m_sQuad.tl.vertices = vertex3(x1, y2, 0);
        this._m_sQuad.tr.vertices = vertex3(x2, y2, 0);
    },
    /** tell the sprite to use batch node render.
     @since v0.99.0
     */
    useBatchNode:function (batchNode) {
        this._m_bUsesBatchNode = true;
        this.__m_pobTextureAtlas = batchNode.getTextureAtlas(); // weak ref
        this._m_pobBatchNode = batchNode;
    },
    /** updates the texture rect of the CCSprite in points. */
    setTextureRect:function (rect) {
        var rectInPixels = new cc.Rect();
        rectInPixels = cc.RECT_POINTS_TO_PIXELS(rect);
        this.setTextureRectInPixels(rectInPixels, false, rectInPixels.size);
    },
    /** updates the texture rect, rectRotated and untrimmed size of the CCSprite in pixels
     */
    setTextureRectInPixels:function (rect, rotated, size) {
        this._m_obRectInPixels = rect;
        this._m_obRect = cc.RECT_PIXELS_TO_POINTS(rect);
        this._m_bRectRotated = rotated;

        this.setContentSizeInPixels(size);
        this._updateTextureCoords(this._m_obRectInPixels);

        var relativeOffsetInPixels = new cc.Point();
        relativeOffsetInPixels = this._m_obUnflippedOffsetPositionFromCenter;

        if (this._m_bFlipX) {
            relativeOffsetInPixels.x = -relativeOffsetInPixels.x;
        }
        if (this._m_bFlipY) {
            relativeOffsetInPixels.y = -relativeOffsetInPixels.y;
        }

        this._m_obOffsetPositionInPixels.x = relativeOffsetInPixels.x + (this.m_tContentSizeInPixels.width - this._m_obRectInPixels.size.width) / 2;
        this._m_obOffsetPositionInPixels.y = relativeOffsetInPixels.y + (this.m_tContentSizeInPixels.height - this._m_obRectInPixels.size.height) / 2;

        // rendering using batch node
        if (this._m_bUsesBatchNode) {
            // update dirty_, don't update recursiveDirty_
            this._m_bDirty = true;
        }
        else {
            // self rendering

            // Atlas: Vertex
            var x1 = 0 + this._m_obOffsetPositionInPixels.x;
            var y1 = 0 + this._m_obOffsetPositionInPixels.y;
            var x2 = x1 + this._m_obRectInPixels.size.width;
            var y2 = y1 + this._m_obRectInPixels.size.height;

            // Don't update Z.
            this._m_sQuad.bl.vertices = vertex3(x1, y1, 0);
            this._m_sQuad.br.vertices = vertex3(x2, y1, 0);
            this._m_sQuad.tl.vertices = vertex3(x1, y2, 0);
            this._m_sQuad.tr.vertices = vertex3(x2, y2, 0);
        }
    },
    _updateTextureCoords:function (rect) {
        var tex = new cc.Texture2D();
        tex = this._m_bUsesBatchNode ? this.__m_pobTextureAtlas.getTexture() : this._m_pobTexture;
        if (!tex) {
            return;
        }

        var atlasWidth = tex.getPixelsWide();
        var atlasHeight = tex.getPixelsHigh();

        var left, right, top, bottom;

        if (this._m_bRectRotated) {
            if (cc.FIX_ARTIFACTS_BY_STRECHING_TEXEL) {
                left = (2 * rect.origin.x + 1) / (2 * atlasWidth);
                right = left + (rect.size.height * 2 - 2) / (2 * atlasWidth);
                top = (2 * rect.origin.y + 1) / (2 * atlasHeight);
                bottom = top + (rect.size.width * 2 - 2) / (2 * atlasHeight);
            }
            else {
                left = rect.origin.x / atlasWidth;
                right = left + (rect.size.height / atlasWidth);
                top = rect.origin.y / atlasHeight;
                bottom = top + (rect.size.width / atlasHeight);
            }// CC_FIX_ARTIFACTS_BY_STRECHING_TEXEL


            if (this._m_bFlipX) {
                cc.SWAP(top, bottom);
            }

            if (this._m_bFlipY) {
                cc.SWAP(left, right);
            }

            this._m_sQuad.bl.texCoords.u = left;
            this._m_sQuad.bl.texCoords.v = top;
            this._m_sQuad.br.texCoords.u = left;
            this._m_sQuad.br.texCoords.v = bottom;
            this._m_sQuad.tl.texCoords.u = right;
            this._m_sQuad.tl.texCoords.v = top;
            this._m_sQuad.tr.texCoords.u = right;
            this._m_sQuad.tr.texCoords.v = bottom;
        }
        else {
            if (cc.FIX_ARTIFACTS_BY_STRECHING_TEXEL) {
                left = (2 * rect.origin.x + 1) / (2 * atlasWidth);
                right = left + (rect.size.width * 2 - 2) / (2 * atlasWidth);
                top = (2 * rect.origin.y + 1) / (2 * atlasHeight);
                bottom = top + (rect.size.height * 2 - 2) / (2 * atlasHeight);
            }
            else {
                left = rect.origin.x / atlasWidth;
                right = left + rect.size.width / atlasWidth;
                top = rect.origin.y / atlasHeight;
                bottom = top + rect.size.height / atlasHeight;
            } // ! CC_FIX_ARTIFACTS_BY_STRECHING_TEXEL

            if (this._m_bFlipX) {
                cc.SWAP(left, right);
            }

            if (this._m_bFlipY) {
                cc.SWAP(top, bottom);
            }

            this._m_sQuad.bl.texCoords.u = left;
            this._m_sQuad.bl.texCoords.v = bottom;
            this._m_sQuad.br.texCoords.u = right;
            this._m_sQuad.br.texCoords.v = bottom;
            this._m_sQuad.tl.texCoords.u = left;
            this._m_sQuad.tl.texCoords.v = top;
            this._m_sQuad.tr.texCoords.u = right;
            this._m_sQuad.tr.texCoords.v = top;
        }
    },
    // BatchNode methods
    /** updates the quad according the the rotation, position, scale values. */
    updateTransform:function () {
        cc.Assert(this._m_bUsesBatchNode, "");

        // optimization. Quick return if not dirty
        if (!this._m_bDirty) {
            return;
        }

        var matrix = new cc.AffineTransform();

        // Optimization: if it is not visible, then do nothing
        if (!this.m_bIsVisible) {
            this._m_sQuad.br.vertices = this._m_sQuad.tl.vertices = this._m_sQuad.tr.vertices = this._m_sQuad.bl.vertices = vertex3(0, 0, 0);
            this.__m_pobTextureAtlas.updateQuad(this._m_sQuad, this._m_uAtlasIndex)
            this._m_bDirty = this._m_bRecursiveDirty = false;
            return;
        }

        // Optimization: If parent is batchnode, or parent is nil
        // build Affine transform manually
        if (!this.m_pParent || this.m_pParent == this._m_pobBatchNode) {
            var radians = -cc.DEGREES_TO_RADIANS(this.m_fRotation);
            var c = Math.cos(radians);
            var s = Math.sin(radians);

            matrix = cc.AffineTransformMake(c * this.m_fScaleX, s * this.m_fScaleX, -s * this.m_fScaleY, c * this.m_fScaleY,
                this.m_tPositionInPixels.x, this.m_tPositionInPixels.y);
            if (this.m_fSkewX || this.m_fSkewY) {
                var skewMatrix = new cc.AffineTransform();
                skewMatrix = cc.AffineTransformMake(1.0, Math.tan(cc.DEGREES_TO_RADIANS(this.m_fSkewY)), Math.tan(cc.DEGREES_TO_RADIANS(this.m_fSkewX)), 1.0, 0.0, 0.0);
                matrix = cc.AffineTransformConcat(skewMatrix, matrix);
            }
            matrix = cc.AffineTransformTranslate(matrix, -this.m_tAnchorPointInPixels.x, -this.m_tAnchorPointInPixels.y);
        } else // parent_ != batchNode_
        {
            // else do affine transformation according to the HonorParentTransform
            matrix = cc.AffineTransformIdentity;
            var prevHonor = new cc.HonorParentTransform();
            prevHonor = cc.HONOR_PARENT_TRANSFORM_ALL;

            for (var p = this; p && p != this._m_pobBatchNode; p = p.getParent()) {
                // Might happen. Issue #1053
                // how to implement, we can not use dynamic
                // cc.Assert( [p isKindOfClass:[CCSprite class]], @"CCSprite should be a CCSprite subclass. Probably you initialized an sprite with a batchnode, but you didn't add it to the batch node." );
                var tv = new this._getTransformValues();
                p._getTransformValues(tv);

                // If any of the parents are not visible, then don't draw this node
                if (!tv.visible) {
                    this._m_sQuad.br.vertices = this._m_sQuad.tl.vertices = this._m_sQuad.tr.vertices = this._m_sQuad.bl.vertices = vertex3(0, 0, 0);
                    this.__m_pobTextureAtlas.updateQuad(this._m_sQuad, this._m_uAtlasIndex);
                    this._m_bDirty = this._m_bRecursiveDirty = false;
                    return;
                }

                var newMatrix = new cc.AffineTransform();
                newMatrix = cc.AffineTransformIdentity;

                // 2nd: Translate, Skew, Rotate, Scale
                if (prevHonor && cc.HONOR_PARENT_TRANSFORM_TRANSLATE) {
                    newMatrix = cc.AffineTransformTranslate(newMatrix, tv.pos.x, tv.pos.y);
                }

                if (prevHonor && cc.HONOR_PARENT_TRANSFORM_ROTATE) {
                    newMatrix = cc.AffineTransformRotate(newMatrix, -cc.DEGREES_TO_RADIANS(tv.rotation));
                }

                if (prevHonor && cc.HONOR_PARENT_TRANSFORM_SKEW) {
                    var skew = new cc.AffineTransform();
                    skew = cc.AffineTransformMake(1.0, Math.tan(cc.DEGREES_TO_RADIANS(tv.skew.y)), Math.tan(cc.DEGREES_TO_RADIANS(tv.skew.x)), 1.0, 0.0, 0.0);
                    // apply the skew to the transform
                    newMatrix = cc.AffineTransformConcat(skew, newMatrix);
                }

                if (prevHonor && cc.HONOR_PARENT_TRANSFORM_SCALE) {
                    newMatrix = cc.AffineTransformScale(newMatrix, tv.scale.x, tv.scale.y);
                }

                // 3rd: Translate anchor point
                newMatrix = cc.AffineTransformTranslate(newMatrix, -tv.ap.x, -tv.ap.y);

                // 4th: Matrix multiplication
                matrix = cc.AffineTransformConcat(matrix, newMatrix);

                prevHonor = p;
                this.getHonorParentTransform();
            }
        }

        //
        // calculate the Quad based on the Affine Matrix
        //
        var size = new cc.Size();
        size = this._m_obRectInPixels.size;

        var x1 = this._m_obOffsetPositionInPixels.x;
        var y1 = this._m_obOffsetPositionInPixels.y;

        var x2 = x1 + size.width;
        var y2 = y1 + size.height;
        var x = matrix.tx;
        var y = matrix.ty;

        var cr = matrix.a;
        var sr = matrix.b;
        var cr2 = matrix.d;
        var sr2 = -matrix.c;
        var ax = x1 * cr - y1 * sr2 + x;
        var ay = x1 * sr + y1 * cr2 + y;

        var bx = x2 * cr - y1 * sr2 + x;
        var by = x2 * sr + y1 * cr2 + y;

        var cx = x2 * cr - y2 * sr2 + x;
        var cy = x2 * sr + y2 * cr2 + y;

        var dx = x1 * cr - y2 * sr2 + x;
        var dy = x1 * sr + y2 * cr2 + y;

        this._m_sQuad.bl.vertices = vertex3(RENDER_IN_SUBPIXEL(ax), RENDER_IN_SUBPIXEL(ay), this.m_fVertexZ);
        this._m_sQuad.br.vertices = vertex3(RENDER_IN_SUBPIXEL(bx), RENDER_IN_SUBPIXEL(by), this.m_fVertexZ);
        this._m_sQuad.tl.vertices = vertex3(RENDER_IN_SUBPIXEL(dx), RENDER_IN_SUBPIXEL(dy), this.m_fVertexZ);
        this._m_sQuad.tr.vertices = vertex3(RENDER_IN_SUBPIXEL(cx), RENDER_IN_SUBPIXEL(cy), this.m_fVertexZ);

        this.__m_pobTextureAtlas.updateQuad(this._m_sQuad, this._m_uAtlasIndex);
        this._m_bDirty = this._m_bRecursiveDirty = false;
    },
// XXX: Optimization: instead of calling 5 times the parent sprite to obtain: position, scale.x, scale.y, anchorpoint and rotation,
// this fuction return the 5 values in 1 single call
    _getTransformValues:function (tv) {
        tv.pos = this.m_tPositionInPixels;
        tv.scale.x = this.m_fScaleX;
        tv.scale.y = this.m_fScaleY;
        tv.rotation = this.m_fRotation;
        tv.skew.x = this.m_fSkewX;
        tv.skew.y = this.m_fSkewY;
        tv.ap = this.m_tAnchorPointInPixels;
        tv.visible = this.m_bIsVisible;
        return tv
    },
// draw
    draw:function () {
        cc.Node.draw();

        cc.Assert(!this._m_bUsesBatchNode, "");

        // Default GL states: GL_TEXTURE_2D, GL_VERTEX_ARRAY, GL_COLOR_ARRAY, GL_TEXTURE_COORD_ARRAY
        // Needed states: GL_TEXTURE_2D, GL_VERTEX_ARRAY, GL_COLOR_ARRAY, GL_TEXTURE_COORD_ARRAY
        // Unneeded states: -
        var newBlend = this._m_sBlendFunc.src != cc.BLEND_SRC || this._m_sBlendFunc.dst != cc.BLEND_DST;
        if (newBlend) {
            //TODO
            //glBlendFunc(this._m_sBlendFunc.src, this._m_sBlendFunc.dst);
        }

        //#define kQuadSize  sizeof(this._m_sQuad.bl)
        if (this._m_pobTexture) {
            //TODO
            //glBindTexture(GL_TEXTURE_2D, this._m_pobTexture.getName());
        }
        else {
            //TODO
            //glBindTexture(GL_TEXTURE_2D, 0);
        }

        var offset = this._m_sQuad;

        // vertex
        var diff = cc.offsetof(ccV3F_C4B_T2F, vertices);
        //TODO
        // glVertexPointer(3, GL_FLOAT, kQuadSize, (offset + diff));

        // color
        diff = cc.offsetof(ccV3F_C4B_T2F, colors);
        //TODO
        // glColorPointer(4, GL_UNSIGNED_BYTE, kQuadSize, (offset + diff));

        // tex coords
        diff = cc.offsetof(ccV3F_C4B_T2F, texCoords);
        //TODO
        //glTexCoordPointer(2, GL_FLOAT, kQuadSize, (offset + diff));

        //glDrawArrays(GL_TRIANGLE_STRIP, 0, 4);

        if (newBlend) {
            //glBlendFunc(cc.BLEND_SRC, cc.BLEND_DST);
        }

        if (cc.SPRITE_DEBUG_DRAW == 1) {
            // draw bounding box
            var s = new cc.Size();
            s = this.m_tContentSize;
            var vertices =[cc.ccp(0, 0), cc.ccp(s.width, 0),cc.ccp(s.width, s.height), cc.ccp(0, s.height)];
            cc.DrawPoly(vertices, 4, true);
        }
        else if (cc.SPRITE_DEBUG_DRAW == 2) {
            // draw texture box
            var s = new cc.Size();
            s = this._m_obRect.size;
            var offsetPix = new cc.Point();
            offsetPix = this.getOffsetPositionInPixels();
            var vertices  = [cc.ccp(offsetPix.x, offsetPix.y), cc.ccp(offsetPix.x + s.width, offsetPix.y), cc.ccp(offsetPix.x + s.width, offsetPix.y + s.height), cc.ccp(offsetPix.x, offsetPix.y + s.height)];
            cc.DrawPoly(vertices, 4, true);
        } // CC_SPRITE_DEBUG_DRAW
    },
// CCNode overrides
    addChild:function (pChild, zOrder) {
        var argnum = arguments.length;
        switch(argnum){
            case 1:
                cc.Node.addChild(pChild);
                break;
            case 2:
                cc.Node.addChild(pChild, zOrder);
                break;
            case 3:
                cc.Assert(pChild != null, "");
                cc.Node.addChild(pChild, zOrder, tag);

                if (this._m_bUsesBatchNode) {
                    cc.Assert(pChild.getTexture().getName() == this.__m_pobTextureAtlas.getTexture().getName(), "");
                    var index = this._m_pobBatchNode.atlasIndexForChild(pChild, zOrder);
                    this._m_pobBatchNode.insertChild(pChild, index);
                }
                this._m_bHasChildren = true;
                break;
            default:
                throw "Argument must be non-nil ";
                break;
        }

    },
    reorderChild:function (pChild, zOrder) {
        cc.Assert(pChild != null, "");
        cc.Assert(this.m_pChildren.containsObject(pChild), "");

        if (zOrder == pChild.getZOrder()) {
            return;
        }

        if (this._m_bUsesBatchNode) {
            // XXX: Instead of removing/adding, it is more efficient to reorder manually
            pChild.retain();
            this.removeChild(pChild, false);
            this.addChild(pChild, zOrder);
            pChild.release();
        }
        else {
            cc.Node.reorderChild(pChild, zOrder);
        }
    },
    removeChild:function (pChild, bCleanup) {
        if (this._m_bUsesBatchNode) {
            this._m_pobBatchNode.removeSpriteFromAtlas(pChild);
        }
        cc.Node.removeChild(pChild, bCleanup);
    },
    removeAllChildrenWithCleanup:function (bCleanup) {
        if (this._m_bUsesBatchNode) {
            var pObject = new Object();
            for(pObject in this.m_pChildren)
            {
                var pChild = new cc.Sprite();
                pChild = pObject;
                if (pChild) {
                    this._m_pobBatchNode.removeSpriteFromAtlas(pChild);
                }
            }
        }

        cc.Node.removeAllChildrenWithCleanup(bCleanup);
        this._m_bHasChildren = false;
    },
//
// CCNode property overloads
// used only when parent is CCSpriteBatchNode
//

    setDirtyRecursively:function (bValue) {
        this._m_bDirty = this._m_bRecursiveDirty = bValue;
        // recursively set dirty
        if (this._m_bHasChildren) {
            var pObject = new Object();
            for (pObject in this.m_pChildren)
            {
                var pChild = new cc.Sprite();
                pChild = pObject;
                if (pChild) {
                    pChild.setDirtyRecursively(true);
                }
            }
        }
    },

// XXX HACK: optimization
     SET_DIRTY_RECURSIVELY:function()  {
     if (this._m_bUsesBatchNode && !this._m_bRecursiveDirty) {
     this._m_bDirty = this._m_bRecursiveDirty = true;
     if (this._m_bHasChildren)
     this.setDirtyRecursively(true);
     }
     },
    setPosition:function (pos) {
        cc.Node.setPosition(pos);
        cc.SET_DIRTY_RECURSIVELY();
    },
    setPositionInPixels:function (pos) {
        cc.Node.setPositionInPixels(pos);
        cc.SET_DIRTY_RECURSIVELY();
    },
    setRotation:function (fRotation) {
        cc.Node.setRotation(fRotation);
        cc.SET_DIRTY_RECURSIVELY();
    },
    setSkewX:function (sx) {
        cc.Node.setSkewX(sx);
        cc.SET_DIRTY_RECURSIVELY();
    },
    setSkewY:function (sy) {
        cc.Node.setSkewY(sy);
        cc.SET_DIRTY_RECURSIVELY();
    },
    setScaleX:function (fScaleX) {
        cc.Node.setScaleX(fScaleX);
        cc.SET_DIRTY_RECURSIVELY();
    },
    setScaleY:function (fScaleY) {
        cc.Node.setScaleY(fScaleY);
        cc.SET_DIRTY_RECURSIVELY();
    },
    setScale:function (fScale) {
        cc.Node.setScale(fScale);
        cc.SET_DIRTY_RECURSIVELY();
    },
    setVertexZ:function (fVertexZ) {
        cc.Node.setVertexZ(fVertexZ);
        cc.SET_DIRTY_RECURSIVELY();
    },
    setAnchorPoint:function (anchor) {
        cc.Node.setAnchorPoint(anchor);
        cc.SET_DIRTY_RECURSIVELY();
    },
    setIsRelativeAnchorPoint:function (bRelative) {
        cc.Assert(!this._m_bUsesBatchNode, "");
        cc.Node.setIsRelativeAnchorPoint(bRelative);
    },
    setIsVisible:function (bVisible) {
        cc.Node.setIsVisible(bVisible);
        cc.SET_DIRTY_RECURSIVELY();
    },
    setFlipX:function (bFlipX) {
        if (this._m_bFlipX != bFlipX) {
            this._m_bFlipX = bFlipX;
            this.setTextureRectInPixels(this._m_obRectInPixels, this._m_bRectRotated, this.m_tContentSizeInPixels);
        }
    },
    /** whether or not the sprite is flipped horizontally.
     It only flips the texture of the sprite, and not the texture of the sprite's children.
     Also, flipping the texture doesn't alter the anchorPoint.
     If you want to flip the anchorPoint too, and/or to flip the children too use:

     sprite->setScaleX(sprite->getScaleX() * -1);
     */
    isFlipX:function () {
        return this._m_bFlipX;
    },
    /** whether or not the sprite is flipped vertically.
     It only flips the texture of the sprite, and not the texture of the sprite's children.
     Also, flipping the texture doesn't alter the anchorPoint.
     If you want to flip the anchorPoint too, and/or to flip the children too use:

     sprite->setScaleY(sprite->getScaleY() * -1);
     */
    setFlipY:function (bFlipY) {
        if (this._m_bFlipY != bFlipY) {
            this._m_bFlipY = bFlipY;
            this.setTextureRectInPixels(this._m_obRectInPixels, this._m_bRectRotated, this.m_tContentSizeInPixels);
        }
    },
    isFlipY:function () {
        return this._m_bFlipY;
    },
//
// RGBA protocol
//

    updateColor:function () {
        var color4 = new cc.Color4B();
        color4 = (this._m_sColor.r, this._m_sColor.g, this._m_sColor.b, this._m_nOpacity);

        this._m_sQuad.bl.colors = color4;
        this._m_sQuad.br.colors = color4;
        this._m_sQuad.tl.colors = color4;
        this._m_sQuad.tr.colors = color4;

// renders using Sprite Manager
        if (this._m_bUsesBatchNode) {
            if (this._m_uAtlasIndex != cc.SpriteIndexNotInitialized) {
                this.__m_pobTextureAtlas.updateQuad(this._m_sQuad, this._m_uAtlasIndex)
            }
            else {
                // no need to set it recursively
                // update dirty_, don't update recursiveDirty_
                this._m_bDirty = true;
            }
        }

// self render
// do nothing
    },
    getOpacity:function () {
        return this._m_nOpacity;
    },
    setOpacity:function (opacity) {
        this._m_nOpacity = opacity;

        // special opacity for premultiplied textures
        if (this._m_bOpacityModifyRGB) {
            this.setColor(this._m_sColorUnmodified);
        }

        this.updateColor();
    },
    getColor:function () {
        if (this._m_bOpacityModifyRGB) {
            return this._m_sColorUnmodified;
        }
        return this._m_sColor;
    },
    setColor:function (color3) {
        this._m_sColor = this._m_sColorUnmodified = color3;

        if (this._m_bOpacityModifyRGB) {
            this._m_sColor.r = color3.r * this._m_nOpacity / 255;
            this._m_sColor.g = color3.g * this._m_nOpacity / 255;
            this._m_sColor.b = color3.b * this._m_nOpacity / 255;
        }

        this.updateColor();
    },
    // RGBAProtocol
    /** opacity: conforms to CCRGBAProtocol protocol */
    setIsOpacityModifyRGB:function (bValue) {
        var oldColor = new cc.Color3B();
        oldColor = this._m_sColor;
        this._m_bOpacityModifyRGB = bValue;
        this._m_sColor = oldColor;
    },
    getIsOpacityModifyRGB:function () {
        return this._m_bOpacityModifyRGB;
    },
   // Frames
    /** sets a new display frame to the CCSprite. */
    setDisplayFrame:function (pNewFrame) {
        this._m_obUnflippedOffsetPositionFromCenter = pNewFrame.getOffsetInPixels();
        var pNewTexture = new cc.Texture2D();
        pNewTexture = pNewFrame.getTexture();
        // update texture before updating texture rect
        if (pNewTexture != this._m_pobTexture) {
            this.setTexture(pNewTexture);
        }

        // update rect
        this._m_bRectRotated = pNewFrame.isRotated();
        this.setTextureRectInPixels(pNewFrame.getRectInPixels(), pNewFrame.isRotated(), pNewFrame.getOriginalSizeInPixels());
    },
    // Animation

    /** changes the display frame with animation name and index.
     The animation name will be get from the CCAnimationCache
     @since v0.99.5
     */
    setDisplayFrameWithAnimationName:function (animationName, frameIndex) {
        cc.Assert(animationName, "");
        var a = new cc.Animation();
        a = cc.AnimationCache.sharedAnimationCache().animationByName(animationName);

        cc.Assert(a, "");

        var frame = new cc.SpriteFrame();
        frame = a.getFrames().getObjectAtIndex(frameIndex);

        cc.Assert(frame, "");

        this.setDisplayFrame(frame);
    },
    /** returns whether or not a CCSpriteFrame is being displayed */
    isFrameDisplayed:function (pFrame) {
        var r = new cc.Rect();
        r = pFrame.getRect();

        return (cc.Rect.CCRectEqualToRect(r, this._m_obRect) && pFrame.getTexture().getName() == this._m_pobTexture.getName());
    },
    /** returns the current displayed frame. */
    displayedFrame:function () {
        return cc.SpriteFrame.frameWithTexture(this._m_pobTexture,
            this._m_obRectInPixels,
            this._m_bRectRotated,
            this._m_obUnflippedOffsetPositionFromCenter,
            this.m_tContentSizeInPixels);
    },
// Texture protocol

    _updateBlendFunc:function () {
        cc.Assert(!this._m_bUsesBatchNode, "CCSprite: _updateBlendFunc doesn't work when the sprite is rendered using a CCSpriteSheet");

        // it's possible to have an untextured sprite
        if (!this._m_pobTexture || !this._m_pobTexture.getHasPremultipliedAlpha()) {
            this._m_sBlendFunc.src = cc.GL_SRC_ALPHA;
            this._m_sBlendFunc.dst = cc.GL_ONE_MINUS_SRC_ALPHA;
            this.setIsOpacityModifyRGB(false);
        }
        else {
            this._m_sBlendFunc.src = cc.BLEND_SRC;
            this._m_sBlendFunc.dst = cc.BLEND_DST;
            this.setIsOpacityModifyRGB(true);
        }
    },
    // CCTextureProtocol
    setTexture:function (texture) {
        // CCSprite: setTexture doesn't work when the sprite is rendered using a CCSpriteSheet
        cc.Assert(!this._m_bUsesBatchNode, "setTexture doesn't work when the sprite is rendered using a CCSpriteSheet");

        // we can not use RTTI, so we do not known the type of object
        // accept texture==nil as argument
        /*cc.Assert((! texture) || dynamic_cast<CCTexture2D*>(texture));*/

        cc.SAFE_RELEASE(this._m_pobTexture);

        this._m_pobTexture = texture;
        if (texture) {
            texture.retain();
        }

        this._updateBlendFunc();
    },
    getTexture:function () {
        return this._m_pobTexture;
    }
});
cc.Sprite.spriteWithTexture = function (pTexture, rect, offset) {
    var argnum = arguments;
    var pobSprite = new cc.Sprite();
    switch (argnum) {
        case 1:
            /** Creates an sprite with a texture.
             The rect used will be the size of the texture.
             The offset will be (0,0).
             */
            if (pobSprite && pobSprite.initWithTexture(pTexture)) {
                return pobSprite;
            }
            cc.SAFE_DELETE(pobSprite);
            return null;
            break;

        case 2:
            /** Creates an sprite with a texture and a rect.
             The offset will be (0,0).
             */
            if (pobSprite && pobSprite.initWithTexture(pTexture, rect)) {
                return pobSprite;
            }
            cc.SAFE_DELETE(pobSprite);
            return null;
            break;

        case 3:
            /** Creates an sprite with a texture, a rect and offset. */
            cc.UNUSED_PARAM(pTexture);
            cc.UNUSED_PARAM(rect);
            cc.UNUSED_PARAM(offset);
            // not implement
            cc.Assert(0, "");
            return null;
            break;

        default:
            throw "Argument must be non-nil ";
            break;
    }
};
/** Creates an sprite with an sprite frame. */
cc.Sprite.spriteWithSpriteFrame = function (pSpriteFrame) {
    var pobSprite = new cc.Sprite();
    if (pobSprite && pobSprite.initWithSpriteFrame(pSpriteFrame)) {
        return pobSprite;
    }
    cc.SAFE_DELETE(pobSprite);
    return null;
};
/** Creates an sprite with an sprite frame name.
 An CCSpriteFrame will be fetched from the CCSpriteFrameCache by name.
 If the CCSpriteFrame doesn't exist it will raise an exception.
 @since v0.9
 */
cc.Sprite.spriteWithSpriteFrameName = function (pszSpriteFrameName) {
    var pFrame = cc.SpriteFrameCache.sharedSpriteFrameCache().spriteFrameByName(pszSpriteFrameName);
    var msg = "Invalid spriteFrameName:" + pszSpriteFrameName;
    cc.Assert(pFrame != null, msg);
    return this.spriteWithSpriteFrame(pFrame);
};

cc.Sprite.spriteWithFile = function (pszFileName, rect) {
    var argnum = arguments.length;
    var pobSprite = new cc.Sprite();
    if (argnum < 2) {
        /** Creates an sprite with an image filename.
         The rect used will be the size of the image.
         The offset will be (0,0).
         */
        if (pobSprite && pobSprite.initWithFile(pszFileName)) {
            return pobSprite;
        }
        cc.SAFE_DELETE(pobSprite);
        return null;
    }
    else {
        /** Creates an sprite with an CCBatchNode and a rect
         */
        if (pobSprite && pobSprite.initWithFile(pszFileName, rect)) {
            return pobSprite;
        }
        cc.SAFE_DELETE(pobSprite);
        return null;
    }
};

cc.Sprite.spriteWithBatchNode = function (batchNode, rect) {
    var pobSprite = new cc.Sprite();
    if (pobSprite && pobSprite.initWithBatchNode(batchNode, rect)) {
        return pobSprite;
    }
    cc.SAFE_DELETE(pobSprite);
    return null;
};