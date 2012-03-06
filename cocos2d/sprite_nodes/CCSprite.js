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
var CC = CC = CC || {};
/**
 Whether or not an CCSprite will rotate, scale or translate with it's parent.
 Useful in health bars, when you want that the health bar translates with it's parent but you don't
 want it to rotate with its parent.
 @since v0.99.0
 */
//! Translate with it's parent
CC.CC_HONOR_PARENT_TRANSFORM_TRANSLATE = 1 << 0;
//! Rotate with it's parent
CC.CC_HONOR_PARENT_TRANSFORM_ROTATE = 1 << 1;
//! Scale with it's parent
CC.CC_HONOR_PARENT_TRANSFORM_SCALE = 1 << 2;
//! Skew with it's parent
CC.CC_HONOR_PARENT_TRANSFORM_SKEW = 1 << 3;
//! All possible transformation enabled. Default value.
CC.CC_HONOR_PARENT_TRANSFORM_ALL = CC.CC_HONOR_PARENT_TRANSFORM_TRANSLATE | CC.CC_HONOR_PARENT_TRANSFORM_ROTATE | CC.CC_HONOR_PARENT_TRANSFORM_SCALE | CC.CC_HONOR_PARENT_TRANSFORM_SKEW;


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

CC.CCSprite = CCNode.extend({
    //
    // Data used when the sprite is rendered using a CCSpriteSheet
    //
    m_pobTextureAtlas:null,
    m_uAtlasIndex:0,
    m_pobBatchNode:null,
    m_eHonorParentTransform:null,
    m_bDirty:null,
    m_bRecursiveDirty:null,
    m_bHasChildren:null,
    //
    // Data used when the sprite is self-rendered
    //
    m_sBlendFunc:null,
    m_pobTexture:null,

    //
    // Shared data
    //
    // whether or not it's parent is a CCSpriteBatchNode
    m_bUsesBatchNode:null,
    // texture
    m_obRect:null,
    m_obRectInPixels:null,
    m_bRectRotated:null,

     // Offset Position (used by Zwoptex)
     m_obOffsetPositionInPixels:null, // absolute
     m_obUnflippedOffsetPositionFromCenter:null,

     // vertex coords, texture coords and color info
     m_sQuad:null,

     // opacity and RGB protocol
     m_sColorUnmodified:null,
     m_bOpacityModifyRGB:null,

     // image is flipped
     m_bFlipX:null,
     m_bFlipY:null,

    /** whether or not the Sprite needs to be updated in the Atlas */
    isDirty:function(){
        return this.m_bDirty;
    },
    /** make the Sprite to be updated in the Atlas. */
    setDirty:function(bDirty){
        this.m_bDirty = bDirty;
    },
    /** get the quad (tex coords, vertex coords and color) information */
    getQuad:function(){
        return this.m_sQuad;
    },
    /** returns whether or not the texture rectangle is rotated */
    isTextureRectRotated:function(){
        return this.m_bRectRotated;
    },
    /** Set the index used on the TextureAtlas. */
    getAtlasIndex:function(){
        return this.m_uAtlasIndex;
    },
    /** Set the index used on the TextureAtlas.
     @warning Don't modify this value unless you know what you are doing
     */
    setAtlasIndex:function(uAtlasIndex){
        this.m_uAtlasIndex = uAtlasIndex;
    },
    /** returns the rect of the CCSprite in points */
    getTextureRect:function(){
        return this.m_obRect;
    },
    /** whether or not the Sprite is rendered using a CCSpriteBatchNode */
    isUsesBatchNode:function(){
        return this.m_bUsesBatchNode;
    },
    /** make the Sprite been rendered using a CCSpriteBatchNode */
    setUsesSpriteBatchNode:function(bUsesSpriteBatchNode){
        this.m_bUsesBatchNode = bUsesSpriteBatchNode;
    },
    getTextureAtlas:function(pobTextureAtlas){
        return this.m_pobTextureAtlas;
    },
    setTextureAtlas:function(pobTextureAtlas){
        this.m_pobTextureAtlas = pobTextureAtlas;
    },
    getSpriteBatchNode:function(){
        return this.m_pobBatchNode;
    },
    setSpriteBatchNode:function(pobSpriteBatchNode){
        this.m_pobBatchNode = pobSpriteBatchNode;
    },
    /** whether or not to transform according to its parent transformations.
     Useful for health bars. eg: Don't rotate the health bar, even if the parent rotates.
     IMPORTANT: Only valid if it is rendered using an CCSpriteSheet.
     @since v0.99.0
     */
    getHonorParentTransform:function(){
        return this.m_eHonorParentTransform;
    },
    /** whether or not to transform according to its parent transformations.
     Useful for health bars. eg: Don't rotate the health bar, even if the parent rotates.
     IMPORTANT: Only valid if it is rendered using an CCSpriteSheet.
     @since v0.99.0
     */
    setHonorParentTransform:function(eHonorParentTransform){
        this.m_eHonorParentTransform = eHonorParentTransform;
    },
    /** Get offset position of the sprite. Calculated automatically by editors like Zwoptex.
     @since v0.99.0
     */
    getOffsetPositionInPixels:function(){
        return this.m_obOffsetPositionInPixels;
    },
    /** conforms to CCTextureProtocol protocol */
    getBlendFunc:function(){
        return this.m_sBlendFunc;
    },
    /** conforms to CCTextureProtocol protocol */
    setBlendFunc:function(blendFunc){
        this.m_sBlendFunc = blendFunc;
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
        this.m_bDirty = this.m_bRecursiveDirty = false;
        // by default use "Self Render".
        // if the sprite is added to an batchnode, then it will automatically switch to "SpriteSheet Render"
        this.useSelfRender();

        this.m_bOpacityModifyRGB = true;
        this.m_nOpacity = 255;
        this.m_sColor = this.m_sColorUnmodified = CC.ccWHITE;

        this.m_sBlendFunc.src = CC.CC_BLEND_SRC;
        this.m_sBlendFunc.dst = CC.CC_BLEND_DST;

        // update texture (calls updateBlendFunc)
        this.setTexture(null);

        // clean the Quad
        CC.memset(this.m_sQuad, 0, sizeof(this.m_sQuad));

        this.m_bFlipX = this.m_bFlipY = false;

        // default transform anchor: center
        this.setAnchorPoint(ccp(0.5, 0.5));

        // zwoptex default values
        this.m_obOffsetPositionInPixels = CC.CCPointZero;

        this.m_eHonorParentTransform = CC.CC_HONOR_PARENT_TRANSFORM_ALL;
        this.m_bHasChildren = false;

        // Atlas: Color
        var tmpColor = new CC.ccColor4B(255, 255, 255, 255);
        this.m_sQuad.bl.colors = tmpColor;
        this.m_sQuad.br.colors = tmpColor;
        this.m_sQuad.tl.colors = tmpColor;
        this.m_sQuad.tr.colors = tmpColor;

        // Atlas: Vertex

        // updated in "useSelfRender"

        // Atlas: TexCoords
        this.setTextureRectInPixels(CC.CCRectZero, false, CC.CCSizeZero);

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
                CC.CCAssert(pTexture != null, "");
                var rect = new CC.CCRect();
                rect.size = pTexture.getContentSize();
                return this.initWithTexture(pTexture, rect);
                break;
            case 2:
                /** Initializes an sprite with a texture and a rect.
                 The offset will be (0,0).
                 */
                CC.CCAssert(pTexture != null, "");
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
                CC.CCAssert(pszFilename != null, "");
                var pTexture = new CC.CCTexture2D();
                pTexture = CC.CCTextureCache.sharedTextureCache().addImage(pszFilename);
                if (pTexture) {
                    var rect = new CC.CCRect();
                    rect = CC.CCRectZero;
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
                CC.CCAssert(pszFilename != null, "");
                var pTexture = new CC.CCTexture2D();
                pTexture = CC.CCTextureCache.sharedTextureCache().addImage(pszFilename);
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
        CC.CCAssert(pSpriteFrame != null, "");
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
        CC.CCAssert(pszSpriteFrameName != null, "");
        var pFrame = new CC.CCSpriteFrame();
        pFrame = CC.CCSpriteFrameCache.sharedSpriteFrameCache().spriteFrameByName(pszSpriteFrameName);
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
                 CC.CCAssert(pImage != null);
                 var pTexture  = new CC.CCTexture2D();
                 pTexture = CC.CCTextureCache.sharedTextureCache().addCGImage(pImage, pszKey);
                 var size = new CC.CCSize(),rect = new CC.CCRect();
                 size = pTexture.getContentSize();
                 rect = CC.CCRectMake(0 ,0, size.width, size.height);
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
        this.m_uAtlasIndex = CC.CCSpriteIndexNotInitialized;
        this.m_bUsesBatchNode = false;
        this.m_pobTextureAtlas = null;
        this.m_pobBatchNode = null;
        this.m_bDirty = this.m_bRecursiveDirty = false;

        var x1 = 0 + this.m_obOffsetPositionInPixels.x;
        var y1 = 0 + this.m_obOffsetPositionInPixels.y;
        var x2 = x1 + this.m_obRectInPixels.size.width;
        var y2 = y1 + this.m_obRectInPixels.size.height;
        this.m_sQuad.bl.vertices = vertex3(x1, y1, 0);
        this.m_sQuad.br.vertices = vertex3(x2, y1, 0);
        this.m_sQuad.tl.vertices = vertex3(x1, y2, 0);
        this.m_sQuad.tr.vertices = vertex3(x2, y2, 0);
    },
    /** tell the sprite to use batch node render.
     @since v0.99.0
     */
    useBatchNode:function (batchNode) {
        this.m_bUsesBatchNode = true;
        this.m_pobTextureAtlas = batchNode.getTextureAtlas(); // weak ref
        this.m_pobBatchNode = batchNode;
    },
    /** updates the texture rect of the CCSprite in points. */
    setTextureRect:function (rect) {
        var rectInPixels = new CC.CCRect();
        rectInPixels = CC.CC_RECT_POINTS_TO_PIXELS(rect);
        this.setTextureRectInPixels(rectInPixels, false, rectInPixels.size);
    },
    /** updates the texture rect, rectRotated and untrimmed size of the CCSprite in pixels
     */
    setTextureRectInPixels:function (rect, rotated, size) {
        this.m_obRectInPixels = rect;
        this.m_obRect = CC.CC_RECT_PIXELS_TO_POINTS(rect);
        this.m_bRectRotated = rotated;

        this.setContentSizeInPixels(size);
        this.updateTextureCoords(this.m_obRectInPixels);

        var relativeOffsetInPixels = new CC.CCPoint();
        relativeOffsetInPixels = this.m_obUnflippedOffsetPositionFromCenter;

        if (this.m_bFlipX) {
            relativeOffsetInPixels.x = -relativeOffsetInPixels.x;
        }
        if (this.m_bFlipY) {
            relativeOffsetInPixels.y = -relativeOffsetInPixels.y;
        }

        this.m_obOffsetPositionInPixels.x = relativeOffsetInPixels.x + (this.m_tContentSizeInPixels.width - this.m_obRectInPixels.size.width) / 2;
        this.m_obOffsetPositionInPixels.y = relativeOffsetInPixels.y + (this.m_tContentSizeInPixels.height - this.m_obRectInPixels.size.height) / 2;

        // rendering using batch node
        if (this.m_bUsesBatchNode) {
            // update dirty_, don't update recursiveDirty_
            this.m_bDirty = true;
        }
        else {
            // self rendering

            // Atlas: Vertex
            var x1 = 0 + this.m_obOffsetPositionInPixels.x;
            var y1 = 0 + this.m_obOffsetPositionInPixels.y;
            var x2 = x1 + this.m_obRectInPixels.size.width;
            var y2 = y1 + this.m_obRectInPixels.size.height;

            // Don't update Z.
            this.m_sQuad.bl.vertices = vertex3(x1, y1, 0);
            this.m_sQuad.br.vertices = vertex3(x2, y1, 0);
            this.m_sQuad.tl.vertices = vertex3(x1, y2, 0);
            this.m_sQuad.tr.vertices = vertex3(x2, y2, 0);
        }
    },
    updateTextureCoords:function (rect) {
        var tex = new CC.CCTexture2D();
        tex = this.m_bUsesBatchNode ? this.m_pobTextureAtlas.getTexture() : this.m_pobTexture;
        if (!tex) {
            return;
        }

        var atlasWidth = tex.getPixelsWide();
        var atlasHeight = tex.getPixelsHigh();

        var left, right, top, bottom;

        if (this.m_bRectRotated) {
            if (CC.CC_FIX_ARTIFACTS_BY_STRECHING_TEXEL) {
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


            if (this.m_bFlipX) {
                CC.CC_SWAP(top, bottom);
            }

            if (this.m_bFlipY) {
                CC.CC_SWAP(left, right);
            }

            this.m_sQuad.bl.texCoords.u = left;
            this.m_sQuad.bl.texCoords.v = top;
            this.m_sQuad.br.texCoords.u = left;
            this.m_sQuad.br.texCoords.v = bottom;
            this.m_sQuad.tl.texCoords.u = right;
            this.m_sQuad.tl.texCoords.v = top;
            this.m_sQuad.tr.texCoords.u = right;
            this.m_sQuad.tr.texCoords.v = bottom;
        }
        else {
            if (CC.CC_FIX_ARTIFACTS_BY_STRECHING_TEXEL) {
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

            if (this.m_bFlipX) {
                CC.CC_SWAP(left, right);
            }

            if (this.m_bFlipY) {
                CC.CC_SWAP(top, bottom);
            }

            this.m_sQuad.bl.texCoords.u = left;
            this.m_sQuad.bl.texCoords.v = bottom;
            this.m_sQuad.br.texCoords.u = right;
            this.m_sQuad.br.texCoords.v = bottom;
            this.m_sQuad.tl.texCoords.u = left;
            this.m_sQuad.tl.texCoords.v = top;
            this.m_sQuad.tr.texCoords.u = right;
            this.m_sQuad.tr.texCoords.v = top;
        }
    },
    // BatchNode methods
    /** updates the quad according the the rotation, position, scale values. */
    updateTransform:function () {
        CC.CCAssert(this.m_bUsesBatchNode, "");

        // optimization. Quick return if not dirty
        if (!this.m_bDirty) {
            return;
        }

        var matrix = new CC.CCAffineTransform();

        // Optimization: if it is not visible, then do nothing
        if (!this.m_bIsVisible) {
            this.m_sQuad.br.vertices = this.m_sQuad.tl.vertices = this.m_sQuad.tr.vertices = this.m_sQuad.bl.vertices = vertex3(0, 0, 0);
            this.m_pobTextureAtlas.updateQuad(this.m_sQuad, this.m_uAtlasIndex)
            this.m_bDirty = this.m_bRecursiveDirty = false;
            return;
        }

        // Optimization: If parent is batchnode, or parent is nil
        // build Affine transform manually
        if (!this.m_pParent || this.m_pParent == this.m_pobBatchNode) {
            var radians = -CC.CC_DEGREES_TO_RADIANS(this.m_fRotation);
            var c = Math.cos(radians);
            var s = Math.sin(radians);

            matrix = CC.CCAffineTransformMake(c * this.m_fScaleX, s * this.m_fScaleX, -s * this.m_fScaleY, c * this.m_fScaleY,
                this.m_tPositionInPixels.x, this.m_tPositionInPixels.y);
            if (this.m_fSkewX || this.m_fSkewY) {
                var skewMatrix = new CC.CCAffineTransform();
                skewMatrix = CC.CCAffineTransformMake(1.0, Math.tan(CC.CC_DEGREES_TO_RADIANS(this.m_fSkewY)), Math.tan(CC.CC_DEGREES_TO_RADIANS(this.m_fSkewX)), 1.0, 0.0, 0.0);
                matrix = CC.CCAffineTransformConcat(skewMatrix, matrix);
            }
            matrix = CC.CCAffineTransformTranslate(matrix, -this.m_tAnchorPointInPixels.x, -this.m_tAnchorPointInPixels.y);
        } else // parent_ != batchNode_
        {
            // else do affine transformation according to the HonorParentTransform
            matrix = CC.CCAffineTransformIdentity;
            var prevHonor = new CC.ccHonorParentTransform();
            prevHonor = CC.CC_HONOR_PARENT_TRANSFORM_ALL;

            for (var p = this; p && p != this.m_pobBatchNode; p = p.getParent()) {
                // Might happen. Issue #1053
                // how to implement, we can not use dynamic
                // CC.CCAssert( [p isKindOfClass:[CCSprite class]], @"CCSprite should be a CCSprite subclass. Probably you initialized an sprite with a batchnode, but you didn't add it to the batch node." );
                var tv = new this.getTransformValues();
                p.getTransformValues(tv);

                // If any of the parents are not visible, then don't draw this node
                if (!tv.visible) {
                    this.m_sQuad.br.vertices = this.m_sQuad.tl.vertices = this.m_sQuad.tr.vertices = this.m_sQuad.bl.vertices = vertex3(0, 0, 0);
                    this.m_pobTextureAtlas.updateQuad(this.m_sQuad, this.m_uAtlasIndex);
                    this.m_bDirty = this.m_bRecursiveDirty = false;
                    return;
                }

                var newMatrix = new CC.CCAffineTransform();
                newMatrix = CC.CCAffineTransformIdentity;

                // 2nd: Translate, Skew, Rotate, Scale
                if (prevHonor && CC.CC_HONOR_PARENT_TRANSFORM_TRANSLATE) {
                    newMatrix = CC.CCAffineTransformTranslate(newMatrix, tv.pos.x, tv.pos.y);
                }

                if (prevHonor && CC.CC_HONOR_PARENT_TRANSFORM_ROTATE) {
                    newMatrix = CC.CCAffineTransformRotate(newMatrix, -CC.CC_DEGREES_TO_RADIANS(tv.rotation));
                }

                if (prevHonor && CC.CC_HONOR_PARENT_TRANSFORM_SKEW) {
                    var skew = new CC.CCAffineTransform();
                    skew = CC.CCAffineTransformMake(1.0, Math.tan(CC.CC_DEGREES_TO_RADIANS(tv.skew.y)), Math.tan(CC.CC_DEGREES_TO_RADIANS(tv.skew.x)), 1.0, 0.0, 0.0);
                    // apply the skew to the transform
                    newMatrix = CC.CCAffineTransformConcat(skew, newMatrix);
                }

                if (prevHonor && CC.CC_HONOR_PARENT_TRANSFORM_SCALE) {
                    newMatrix = CC.CCAffineTransformScale(newMatrix, tv.scale.x, tv.scale.y);
                }

                // 3rd: Translate anchor point
                newMatrix = CC.CCAffineTransformTranslate(newMatrix, -tv.ap.x, -tv.ap.y);

                // 4th: Matrix multiplication
                matrix = CC.CCAffineTransformConcat(matrix, newMatrix);

                prevHonor = p;
                this.getHonorParentTransform();
            }
        }

        //
        // calculate the Quad based on the Affine Matrix
        //
        var size = new CC.CCSize();
        size = this.m_obRectInPixels.size;

        var x1 = this.m_obOffsetPositionInPixels.x;
        var y1 = this.m_obOffsetPositionInPixels.y;

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

        this.m_sQuad.bl.vertices = vertex3(RENDER_IN_SUBPIXEL(ax), RENDER_IN_SUBPIXEL(ay), this.m_fVertexZ);
        this.m_sQuad.br.vertices = vertex3(RENDER_IN_SUBPIXEL(bx), RENDER_IN_SUBPIXEL(by), this.m_fVertexZ);
        this.m_sQuad.tl.vertices = vertex3(RENDER_IN_SUBPIXEL(dx), RENDER_IN_SUBPIXEL(dy), this.m_fVertexZ);
        this.m_sQuad.tr.vertices = vertex3(RENDER_IN_SUBPIXEL(cx), RENDER_IN_SUBPIXEL(cy), this.m_fVertexZ);

        this.m_pobTextureAtlas.updateQuad(this.m_sQuad, this.m_uAtlasIndex);
        this.m_bDirty = this.m_bRecursiveDirty = false;
    },
// XXX: Optimization: instead of calling 5 times the parent sprite to obtain: position, scale.x, scale.y, anchorpoint and rotation,
// this fuction return the 5 values in 1 single call
    getTransformValues:function (tv) {
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
        CC.CCNode.draw();

        CC.CCAssert(!this.m_bUsesBatchNode, "");

        // Default GL states: GL_TEXTURE_2D, GL_VERTEX_ARRAY, GL_COLOR_ARRAY, GL_TEXTURE_COORD_ARRAY
        // Needed states: GL_TEXTURE_2D, GL_VERTEX_ARRAY, GL_COLOR_ARRAY, GL_TEXTURE_COORD_ARRAY
        // Unneeded states: -
        var newBlend = this.m_sBlendFunc.src != CC_BLEND_SRC || this.m_sBlendFunc.dst != CC.CC_BLEND_DST;
        if (newBlend) {
            //TODO
            //glBlendFunc(this.m_sBlendFunc.src, this.m_sBlendFunc.dst);
        }

        //#define kQuadSize  sizeof(this.m_sQuad.bl)
        if (this.m_pobTexture) {
            //TODO
            //glBindTexture(GL_TEXTURE_2D, this.m_pobTexture.getName());
        }
        else {
            //TODO
            //glBindTexture(GL_TEXTURE_2D, 0);
        }

        var offset = this.m_sQuad;

        // vertex
        var diff = CC.offsetof(ccV3F_C4B_T2F, vertices);
        //TODO
        // glVertexPointer(3, GL_FLOAT, kQuadSize, (offset + diff));

        // color
        diff = CC.offsetof(ccV3F_C4B_T2F, colors);
        //TODO
        // glColorPointer(4, GL_UNSIGNED_BYTE, kQuadSize, (offset + diff));

        // tex coords
        diff = CC.offsetof(ccV3F_C4B_T2F, texCoords);
        //TODO
        //glTexCoordPointer(2, GL_FLOAT, kQuadSize, (offset + diff));

        //glDrawArrays(GL_TRIANGLE_STRIP, 0, 4);

        if (newBlend) {
            //glBlendFunc(CC.CC_BLEND_SRC, CC_BLEND_DST);
        }

        if (CC.CC_SPRITE_DEBUG_DRAW == 1) {
            // draw bounding box
            var s = new CC.CCSize();
            s = this.m_tContentSize;
            var vertices =[CC.ccp(0, 0), CC.ccp(s.width, 0),CC.ccp(s.width, s.height), CC.ccp(0, s.height)];
            CC.ccDrawPoly(vertices, 4, true);
        }
        else if (CC.CC_SPRITE_DEBUG_DRAW == 2) {
            // draw texture box
            var s = new CC.CCSize();
            s = this.m_obRect.size;
            var offsetPix = new CC.CCPoint();
            offsetPix = this.getOffsetPositionInPixels();
            var vertices  = [CC.ccp(offsetPix.x, offsetPix.y), CC.ccp(offsetPix.x + s.width, offsetPix.y), CC.ccp(offsetPix.x + s.width, offsetPix.y + s.height), CC.ccp(offsetPix.x, offsetPix.y + s.height)];
            CC.ccDrawPoly(vertices, 4, true);
        } // CC_SPRITE_DEBUG_DRAW
    },
// CCNode overrides
    addChild:function (pChild, zOrder) {
        var argnum = arguments.length;
        switch(argnum){
            case 1:
                CC.CCNode.addChild(pChild);
                break;
            case 2:
                CC.CCNode.addChild(pChild, zOrder);
                break;
            case 3:
                CC.CCAssert(pChild != null, "");
                CC.CCNode.addChild(pChild, zOrder, tag);

                if (this.m_bUsesBatchNode) {
                    CC.CCAssert(pChild.getTexture().getName() == this.m_pobTextureAtlas.getTexture().getName(), "");
                    var index = this.m_pobBatchNode.atlasIndexForChild(pChild, zOrder);
                    this.m_pobBatchNode.insertChild(pChild, index);
                }
                this.m_bHasChildren = true;
                break;
            default:
                throw "Argument must be non-nil ";
                break;
        }

    },
    reorderChild:function (pChild, zOrder) {
        CC.CCAssert(pChild != null, "");
        CC.CCAssert(this.m_pChildren.containsObject(pChild), "");

        if (zOrder == pChild.getZOrder()) {
            return;
        }

        if (this.m_bUsesBatchNode) {
            // XXX: Instead of removing/adding, it is more efficient to reorder manually
            pChild.retain();
            this.removeChild(pChild, false);
            this.addChild(pChild, zOrder);
            pChild.release();
        }
        else {
            CC.CCNode.reorderChild(pChild, zOrder);
        }
    },
    removeChild:function (pChild, bCleanup) {
        if (this.m_bUsesBatchNode) {
            this.m_pobBatchNode.removeSpriteFromAtlas(pChild);
        }
        CC.CCNode.removeChild(pChild, bCleanup);
    },
    removeAllChildrenWithCleanup:function (bCleanup) {
        if (this.m_bUsesBatchNode) {
            var pObject = new Object();
            for(pObject in this.m_pChildren)
            {
                var pChild = new CC.CCSprite();
                pChild = pObject;
                if (pChild) {
                    this.m_pobBatchNode.removeSpriteFromAtlas(pChild);
                }
            }
        }

        CC.CCNode.removeAllChildrenWithCleanup(bCleanup);
        this.m_bHasChildren = false;
    },
//
// CCNode property overloads
// used only when parent is CCSpriteBatchNode
//

    setDirtyRecursively:function (bValue) {
        this.m_bDirty = this.m_bRecursiveDirty = bValue;
        // recursively set dirty
        if (this.m_bHasChildren) {
            var pObject = new Object();
            for (pObject in this.m_pChildren)
            {
                var pChild = new CC.CCSprite();
                pChild = pObject;
                if (pChild) {
                    pChild.setDirtyRecursively(true);
                }
            }
        }
    },

// XXX HACK: optimization
     SET_DIRTY_RECURSIVELY:function()  {
     if (this.m_bUsesBatchNode && !this.m_bRecursiveDirty) {
     this.m_bDirty = this.m_bRecursiveDirty = true;
     if (this.m_bHasChildren)
     this.setDirtyRecursively(true);
     }
     },
    setPosition:function (pos) {
        CC.CCNode.setPosition(pos);
        CC.SET_DIRTY_RECURSIVELY();
    },
    setPositionInPixels:function (pos) {
        CC.CCNode.setPositionInPixels(pos);
        CC.SET_DIRTY_RECURSIVELY();
    },
    setRotation:function (fRotation) {
        CC.CCNode.setRotation(fRotation);
        CC.SET_DIRTY_RECURSIVELY();
    },
    setSkewX:function (sx) {
        CC.CCNode.setSkewX(sx);
        CC.SET_DIRTY_RECURSIVELY();
    },
    setSkewY:function (sy) {
        CC.CCNode.setSkewY(sy);
        CC.SET_DIRTY_RECURSIVELY();
    },
    setScaleX:function (fScaleX) {
        CC.CCNode.setScaleX(fScaleX);
        CC.SET_DIRTY_RECURSIVELY();
    },
    setScaleY:function (fScaleY) {
        CC.CCNode.setScaleY(fScaleY);
        CC.SET_DIRTY_RECURSIVELY();
    },
    setScale:function (fScale) {
        CC.CCNode.setScale(fScale);
        CC.SET_DIRTY_RECURSIVELY();
    },
    setVertexZ:function (fVertexZ) {
        CC.CCNode.setVertexZ(fVertexZ);
        CC.SET_DIRTY_RECURSIVELY();
    },
    setAnchorPoint:function (anchor) {
        CC.CCNode.setAnchorPoint(anchor);
        CC.SET_DIRTY_RECURSIVELY();
    },
    setIsRelativeAnchorPoint:function (bRelative) {
        CC.CCAssert(!this.m_bUsesBatchNode, "");
        CC.CCNode.setIsRelativeAnchorPoint(bRelative);
    },
    setIsVisible:function (bVisible) {
        CC.CCNode.setIsVisible(bVisible);
        CC.SET_DIRTY_RECURSIVELY();
    },
    setFlipX:function (bFlipX) {
        if (this.m_bFlipX != bFlipX) {
            this.m_bFlipX = bFlipX;
            this.setTextureRectInPixels(this.m_obRectInPixels, this.m_bRectRotated, this.m_tContentSizeInPixels);
        }
    },
    /** whether or not the sprite is flipped horizontally.
     It only flips the texture of the sprite, and not the texture of the sprite's children.
     Also, flipping the texture doesn't alter the anchorPoint.
     If you want to flip the anchorPoint too, and/or to flip the children too use:

     sprite->setScaleX(sprite->getScaleX() * -1);
     */
    isFlipX:function () {
        return this.m_bFlipX;
    },
    /** whether or not the sprite is flipped vertically.
     It only flips the texture of the sprite, and not the texture of the sprite's children.
     Also, flipping the texture doesn't alter the anchorPoint.
     If you want to flip the anchorPoint too, and/or to flip the children too use:

     sprite->setScaleY(sprite->getScaleY() * -1);
     */
    setFlipY:function (bFlipY) {
        if (this.m_bFlipY != bFlipY) {
            this.m_bFlipY = bFlipY;
            this.setTextureRectInPixels(this.m_obRectInPixels, this.m_bRectRotated, this.m_tContentSizeInPixels);
        }
    },
    isFlipY:function () {
        return this.m_bFlipY;
    },
//
// RGBA protocol
//

    updateColor:function () {
        var color4 = new CC.ccColor4B();
        color4 = (this.m_sColor.r, this.m_sColor.g, this.m_sColor.b, this.m_nOpacity);

        this.m_sQuad.bl.colors = color4;
        this.m_sQuad.br.colors = color4;
        this.m_sQuad.tl.colors = color4;
        this.m_sQuad.tr.colors = color4;

// renders using Sprite Manager
        if (this.m_bUsesBatchNode) {
            if (this.m_uAtlasIndex != CC.CCSpriteIndexNotInitialized) {
                this.m_pobTextureAtlas.updateQuad(this.m_sQuad, this.m_uAtlasIndex)
            }
            else {
                // no need to set it recursively
                // update dirty_, don't update recursiveDirty_
                this.m_bDirty = true;
            }
        }

// self render
// do nothing
    },
    getOpacity:function () {
        return this.m_nOpacity;
    },
    setOpacity:function (opacity) {
        this.m_nOpacity = opacity;

        // special opacity for premultiplied textures
        if (this.m_bOpacityModifyRGB) {
            this.setColor(this.m_sColorUnmodified);
        }

        this.updateColor();
    },
    getColor:function () {
        if (this.m_bOpacityModifyRGB) {
            return this.m_sColorUnmodified;
        }
        return this.m_sColor;
    },
    setColor:function (color3) {
        this.m_sColor = this.m_sColorUnmodified = color3;

        if (this.m_bOpacityModifyRGB) {
            this.m_sColor.r = color3.r * this.m_nOpacity / 255;
            this.m_sColor.g = color3.g * this.m_nOpacity / 255;
            this.m_sColor.b = color3.b * this.m_nOpacity / 255;
        }

        this.updateColor();
    },
    // RGBAProtocol
    /** opacity: conforms to CCRGBAProtocol protocol */
    setIsOpacityModifyRGB:function (bValue) {
        var oldColor = new CC.ccColor3B();
        oldColor = this.m_sColor;
        this.m_bOpacityModifyRGB = bValue;
        this.m_sColor = oldColor;
    },
    getIsOpacityModifyRGB:function () {
        return this.m_bOpacityModifyRGB;
    },
   // Frames
    /** sets a new display frame to the CCSprite. */
    setDisplayFrame:function (pNewFrame) {
        this.m_obUnflippedOffsetPositionFromCenter = pNewFrame.getOffsetInPixels();
        var pNewTexture = new CC.CCTexture2D();
        pNewTexture = pNewFrame.getTexture();
        // update texture before updating texture rect
        if (pNewTexture != this.m_pobTexture) {
            this.setTexture(pNewTexture);
        }

        // update rect
        this.m_bRectRotated = pNewFrame.isRotated();
        this.setTextureRectInPixels(pNewFrame.getRectInPixels(), pNewFrame.isRotated(), pNewFrame.getOriginalSizeInPixels());
    },
    // Animation

    /** changes the display frame with animation name and index.
     The animation name will be get from the CCAnimationCache
     @since v0.99.5
     */
    setDisplayFrameWithAnimationName:function (animationName, frameIndex) {
        CC.CCAssert(animationName, "");
        var a = new CC.CCAnimation();
        a = CC.CCAnimationCache.sharedAnimationCache().animationByName(animationName);

        CC.CCAssert(a, "");

        var frame = new CC.CCSpriteFrame();
        frame = a.getFrames().getObjectAtIndex(frameIndex);

        CC.CCAssert(frame, "");

        this.setDisplayFrame(frame);
    },
    /** returns whether or not a CCSpriteFrame is being displayed */
    isFrameDisplayed:function (pFrame) {
        var r = new CC.CCRect();
        r = pFrame.getRect();

        return (CC.CCRect.CCRectEqualToRect(r, this.m_obRect) && pFrame.getTexture().getName() == this.m_pobTexture.getName());
    },
    /** returns the current displayed frame. */
    displayedFrame:function () {
        return CC.CCSpriteFrame.frameWithTexture(this.m_pobTexture,
            this.m_obRectInPixels,
            this.m_bRectRotated,
            this.m_obUnflippedOffsetPositionFromCenter,
            this.m_tContentSizeInPixels);
    },
// Texture protocol

    updateBlendFunc:function () {
        CC.CCAssert(!this.m_bUsesBatchNode, "CCSprite: updateBlendFunc doesn't work when the sprite is rendered using a CCSpriteSheet");

        // it's possible to have an untextured sprite
        if (!this.m_pobTexture || !this.m_pobTexture.getHasPremultipliedAlpha()) {
            this.m_sBlendFunc.src = CC.GL_SRC_ALPHA;
            this.m_sBlendFunc.dst = CC.GL_ONE_MINUS_SRC_ALPHA;
            this.setIsOpacityModifyRGB(false);
        }
        else {
            this.m_sBlendFunc.src = CC.CC_BLEND_SRC;
            this.m_sBlendFunc.dst = CC.CC_BLEND_DST;
            this.setIsOpacityModifyRGB(true);
        }
    },
    // CCTextureProtocol
    setTexture:function (texture) {
        // CCSprite: setTexture doesn't work when the sprite is rendered using a CCSpriteSheet
        CC.CCAssert(!this.m_bUsesBatchNode, "setTexture doesn't work when the sprite is rendered using a CCSpriteSheet");

        // we can not use RTTI, so we do not known the type of object
        // accept texture==nil as argument
        /*CC.CCAssert((! texture) || dynamic_cast<CCTexture2D*>(texture));*/

        CC.CC_SAFE_RELEASE(this.m_pobTexture);

        this.m_pobTexture = texture;
        if (texture) {
            texture.retain();
        }

        this.updateBlendFunc();
    },
    getTexture:function () {
        return this.m_pobTexture;
    }
});
CC.CCSprite.spriteWithTexture.prototype = function (pTexture, rect, offset) {
    var argnum = arguments;
    var pobSprite = new CC.CCSprite();
    switch (argnum) {
        case 1:
            /** Creates an sprite with a texture.
             The rect used will be the size of the texture.
             The offset will be (0,0).
             */
            if (pobSprite && pobSprite.initWithTexture(pTexture)) {
                return pobSprite;
            }
            CC.CC_SAFE_DELETE(pobSprite);
            return null;
            break;

        case 2:
            /** Creates an sprite with a texture and a rect.
             The offset will be (0,0).
             */
            if (pobSprite && pobSprite.initWithTexture(pTexture, rect)) {
                return pobSprite;
            }
            CC.CC_SAFE_DELETE(pobSprite);
            return null;
            break;

        case 3:
            /** Creates an sprite with a texture, a rect and offset. */
            CC.CC_UNUSED_PARAM(pTexture);
            CC.CC_UNUSED_PARAM(rect);
            CC.CC_UNUSED_PARAM(offset);
            // not implement
            CC.CCAssert(0, "");
            return null;
            break;

        default:
            throw "Argument must be non-nil ";
            break;
    }
};
/** Creates an sprite with an sprite frame. */
CC.CCSprite.spriteWithSpriteFrame.prototype = function (pSpriteFrame) {
    var pobSprite = new CC.CCSprite();
    if (pobSprite && pobSprite.initWithSpriteFrame(pSpriteFrame)) {
        return pobSprite;
    }
    CC.CC_SAFE_DELETE(pobSprite);
    return null;
};
/** Creates an sprite with an sprite frame name.
 An CCSpriteFrame will be fetched from the CCSpriteFrameCache by name.
 If the CCSpriteFrame doesn't exist it will raise an exception.
 @since v0.9
 */
CC.CCSprite.spriteWithSpriteFrameName = function (pszSpriteFrameName) {
    var pFrame = CC.CCSpriteFrameCache.sharedSpriteFrameCache().spriteFrameByName(pszSpriteFrameName);
    var msg = "Invalid spriteFrameName:" + pszSpriteFrameName;
    CC.CCAssert(pFrame != null, msg);
    return this.spriteWithSpriteFrame(pFrame);
};

CC.CCSprite.spriteWithFile = function (pszFileName, rect) {
    var argnum = arguments.length;
    var pobSprite = new CC.CCSprite();
    if (argnum < 2) {
        /** Creates an sprite with an image filename.
         The rect used will be the size of the image.
         The offset will be (0,0).
         */
        if (pobSprite && pobSprite.initWithFile(pszFileName)) {
            return pobSprite;
        }
        CC.CC_SAFE_DELETE(pobSprite);
        return null;
    }
    else {
        /** Creates an sprite with an CCBatchNode and a rect
         */
        if (pobSprite && pobSprite.initWithFile(pszFileName, rect)) {
            return pobSprite;
        }
        CC.CC_SAFE_DELETE(pobSprite);
        return null;
    }
};

CC.CCSprite.spriteWithBatchNode.prototype = function (batchNode, rect) {
    var pobSprite = new CC.CCSprite();
    if (pobSprite && pobSprite.initWithBatchNode(batchNode, rect)) {
        return pobSprite;
    }
    CC.CC_SAFE_DELETE(pobSprite);
    return null;
};