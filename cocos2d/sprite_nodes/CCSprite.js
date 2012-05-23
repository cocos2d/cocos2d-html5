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

cc.imageRGBAColor = function (img, color) {
    if (!img)
        return null;
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, canvas.width, canvas.height);
    try {
        var imgPixels = ctx.getImageData(0, 0, img.width, img.height);
    } catch (e) {
        imgPixels = ctx.getImageData(0, 0, img.width - 1, img.height - 1);
    }

    if (color instanceof cc.Color3B) {
        var r = color.r / 255;
        var g = color.g / 255;
        var b = color.b / 255;
        for (var i = 0; i < imgPixels.data.length / 4; i++) {
            imgPixels.data[i * 4] = imgPixels.data[i * 4] * r;
            imgPixels.data[i * 4 + 1] = imgPixels.data[i * 4 + 1] * g;
            imgPixels.data[i * 4 + 2] = imgPixels.data[i * 4 + 2] * b;
        }
    } else if (color instanceof cc.Color4F) {
        for (var i = 0; i < imgPixels.data.length / 4; i++) {
            imgPixels.data[i * 4] = imgPixels.data[i * 4] * color.r;
            imgPixels.data[i * 4 + 1] = imgPixels.data[i * 4 + 1] * color.g;
            imgPixels.data[i * 4 + 2] = imgPixels.data[i * 4 + 2] * color.b;
            imgPixels.data[i * 4 + 3] = imgPixels.data[i * 4 + 3] * color.a;
        }
    }
    ctx.putImageData(imgPixels, 0, 0, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL();
};

cc.pixelsDataRGBAColor = function (imgPixels, color) {
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    var tempPixelsData = ctx.createImageData(imgPixels.width, imgPixels.height);
    if (color instanceof cc.Color3B) {
        var r = color.r / 255;
        var g = color.g / 255;
        var b = color.b / 255;
        for (var i = 0; i < imgPixels.data.length / 4; i++) {
            tempPixelsData.data[i * 4] = imgPixels.data[i * 4] * r;
            tempPixelsData.data[i * 4 + 1] = imgPixels.data[i * 4 + 1] * g;
            tempPixelsData.data[i * 4 + 2] = imgPixels.data[i * 4 + 2] * b;
        }
    } else if (color instanceof cc.Color4F) {
        for (var i = 0; i < imgPixels.data.length / 4; i++) {
            tempPixelsData.data[i * 4] = imgPixels.data[i * 4] * color.r;
            tempPixelsData.data[i * 4 + 1] = imgPixels.data[i * 4 + 1] * color.g;
            tempPixelsData.data[i * 4 + 2] = imgPixels.data[i * 4 + 2] * color.b;
            tempPixelsData.data[i * 4 + 3] = imgPixels.data[i * 4 + 3] * color.a;
        }
    }

    return tempPixelsData;
};

cc.getImagePixelsData = function (imageElement, orign, size) {
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    canvas.width = size.width;
    canvas.height = size.height;
    ctx.drawImage(imageElement, orign.x, orign.y, size.width, size.height);
    return ctx.getImageData(0, 0, canvas.width, canvas.height);
};

cc.cutImageByCanvas = function (sourceImage, orign, size) {
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    canvas.width = size.width;
    canvas.height = size.height;
    ctx.drawImage(sourceImage, orign.x, orign.y, size.width, size.height, 0, 0, size.width, size.height);
    //var cuttedImage = new Image();
    //cuttedImage.src = canvas.toDataURL();
    return canvas;
};

cc.generateTextureCacheForColor = function (texture) {
    var w = texture.width;
    var h = texture.height;
    var rgbks = [];

    var canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;

    var ctx = canvas.getContext("2d");
    ctx.drawImage(texture, 0, 0);

    var tempCanvas = document.createElement("canvas");
    tempCanvas.width = w;
    tempCanvas.height = h;
    var tempCtx = tempCanvas.getContext('2d');

    var pixels = ctx.getImageData(0, 0, w, h).data;

    for (var rgbI = 0; rgbI < 4; rgbI++) {
        var cacheCanvas = document.createElement("canvas");
        cacheCanvas.width = w;
        cacheCanvas.height = h;
        var cacheCtx = cacheCanvas.getContext('2d');

        tempCtx.drawImage(texture, 0, 0);
        var to = tempCtx.getImageData(0, 0, w, h);
        var toData = to.data;

        for (var i = 0; i < pixels.length; i += 4) {
            toData[i  ] = (rgbI === 0) ? pixels[i  ] : 0;
            toData[i + 1] = (rgbI === 1) ? pixels[i + 1] : 0;
            toData[i + 2] = (rgbI === 2) ? pixels[i + 2] : 0;
            toData[i + 3] = pixels[i + 3];
        }
        cacheCtx.putImageData(to, 0, 0);
        //ctx.putImageData(to, 0, 0);
        //var imgComp = new Image();
        //imgComp.src = canvas.toDataURL();
        //rgbks.push(imgComp);
        rgbks.push(cacheCanvas);
    }
    return rgbks;
};

cc.generateTintImage = function (img, rgbks, color, rect) {
    if (!rect) {
        rect = new cc.Rect();
        rect.size = new cc.Size(img.width, img.height);
    }
    var selColor;
    if (color instanceof cc.Color4F) {
        selColor = cc.ccc3(color.r * 255, color.g * 255, color.b * 255);
    } else {
        selColor = color;
    }
    var buff = document.createElement("canvas");
    buff.width = rect.size.width;
    buff.height = rect.size.height;
    var ctx = buff.getContext("2d");
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'copy';
    ctx.drawImage(rgbks[3], rect.origin.x, rect.origin.y, rect.size.width, rect.size.height, 0, 0, rect.size.width, rect.size.height);

    ctx.globalCompositeOperation = 'lighter';
    if (selColor.r > 0) {
        ctx.globalAlpha = selColor.r / 255.0;
        ctx.drawImage(rgbks[0], rect.origin.x, rect.origin.y, rect.size.width, rect.size.height, 0, 0, rect.size.width, rect.size.height);
    }
    if (selColor.g > 0) {
        ctx.globalAlpha = selColor.g / 255.0;
        ctx.drawImage(rgbks[1], rect.origin.x, rect.origin.y, rect.size.width, rect.size.height, 0, 0, rect.size.width, rect.size.height);
    }
    if (selColor.b > 0) {
        ctx.globalAlpha = selColor.b / 255.0;
        ctx.drawImage(rgbks[2], rect.origin.x, rect.origin.y, rect.size.width, rect.size.height, 0, 0, rect.size.width, rect.size.height);
    }
    return buff;
};
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
function transformValues_(pos, scale, rotation, skew, ap, visible) {
    this.pos = pos;		// position x and y
    this.scale = scale;		// scale x and y
    this.rotation = rotation;
    this.skew = skew;		// skew x and y
    this.ap = ap;			// anchor point in pixels
    this.visible = visible;
}
cc.RENDER_IN_SUBPIXEL = function (A) {
    if (cc.SPRITEBATCHNODE_RENDER_SUBPIXEL) {
        return A;
    } else {
        return parseInt(A);
    }
};

cc.Sprite = cc.Node.extend({
    //
    // Data used when the sprite is rendered using a CCSpriteSheet
    //
    _m_pobTextureAtlas:null,
    _m_uAtlasIndex:0,
    _m_pobBatchNode:null,
    _m_eHonorParentTransform:null,
    _m_bDirty:null,
    _m_bRecursiveDirty:null,
    _m_bHasChildren:null,
    //
    // Data used when the sprite is self-rendered
    //
    _m_sBlendFunc:new cc.BlendFunc(),
    _m_pobTexture:new cc.Texture2D(),
    _m_originalTexture:null,
    //
    // Shared data
    //
    // whether or not it's parent is a CCSpriteBatchNode
    _m_bUsesBatchNode:null,
    // texture
    _m_obRect:new cc.Rect(),
    _m_obRectInPixels:cc.RectZero(),
    _m_bRectRotated:null,

    // Offset Position (used by Zwoptex)
    _m_obOffsetPositionInPixels:cc.PointZero(), // absolute
    _m_obUnflippedOffsetPositionFromCenter:cc.PointZero(),

    // vertex coords, texture coords and color info
    _m_sQuad:cc.V3F_C4B_T2F_QuadZero(),

    // opacity and RGB protocol
    m_sColorUnmodified:null,
    _m_bOpacityModifyRGB:null,

    // image is flipped
    _m_bFlipX:null,
    _m_bFlipY:null,

    _m_nOpacity:255,

    ctor:function (fileName) {
        this._super();
        if (fileName) {
            if (typeof(fileName) == "string") {
                var pFrame = cc.SpriteFrameCache.sharedSpriteFrameCache().spriteFrameByName(fileName);
                this.initWithSpriteFrame(pFrame);
            } else if (typeof(fileName) == "object") {
                if (fileName instanceof cc.SpriteFrame) {
                    this.initWithSpriteFrame(fileName);
                } else if (fileName instanceof cc.SpriteBatchNode) {
                    if (arguments.length > 1) {
                        var rect = arguments[1];
                        if (rect instanceof cc.Rect) {
                            this.initWithBatchNode(fileName, rect);
                        }
                    }
                } else if ((fileName instanceof HTMLImageElement) || (fileName instanceof HTMLCanvasElement)) {
                    this.initWithTexture(fileName)
                } else if (fileName instanceof cc.Texture2D) {
                    this.initWithTexture(fileName)
                }
            }
        }
    },

    /** whether or not the Sprite needs to be updated in the Atlas */
    isDirty:function () {
        return this._m_bDirty;
    },
    /** make the Sprite to be updated in the Atlas. */
    setDirty:function (bDirty) {
        this._m_bDirty = bDirty;
    },
    /** get the quad (tex coords, vertex coords and color) information */
    getQuad:function () {
        return this._m_sQuad;
    },
    /** returns whether or not the texture rectangle is rotated */
    isTextureRectRotated:function () {
        return this._m_bRectRotated;
    },
    /** Set the index used on the TextureAtlas. */
    getAtlasIndex:function () {
        return this._m_uAtlasIndex;
    },
    /** Set the index used on the TextureAtlas.
     @warning Don't modify this value unless you know what you are doing
     */
    setAtlasIndex:function (uAtlasIndex) {
        this._m_uAtlasIndex = uAtlasIndex;
    },
    /** returns the rect of the CCSprite in points */
    getTextureRect:function () {
        return new cc.Rect(this._m_obRect);
    },
    /** whether or not the Sprite is rendered using a CCSpriteBatchNode */
    isUsesBatchNode:function () {
        return this._m_bUsesBatchNode;
    },
    /** make the Sprite been rendered using a CCSpriteBatchNode */
    setUsesSpriteBatchNode:function (bUsesSpriteBatchNode) {
        this._m_bUsesBatchNode = bUsesSpriteBatchNode;
    },
    getTextureAtlas:function (pobTextureAtlas) {
        return this._m_pobTextureAtlas;
    },
    setTextureAtlas:function (pobTextureAtlas) {
        this._m_pobTextureAtlas = pobTextureAtlas;
    },
    getSpriteBatchNode:function () {
        return this._m_pobBatchNode;
    },
    setSpriteBatchNode:function (pobSpriteBatchNode) {
        this._m_pobBatchNode = pobSpriteBatchNode;
    },
    /** whether or not to transform according to its parent transformations.
     Useful for health bars. eg: Don't rotate the health bar, even if the parent rotates.
     IMPORTANT: Only valid if it is rendered using an CCSpriteSheet.
     @since v0.99.0
     */
    getHonorParentTransform:function () {
        return this._m_eHonorParentTransform;
    },
    /** whether or not to transform according to its parent transformations.
     Useful for health bars. eg: Don't rotate the health bar, even if the parent rotates.
     IMPORTANT: Only valid if it is rendered using an CCSpriteSheet.
     @since v0.99.0
     */
    setHonorParentTransform:function (eHonorParentTransform) {
        this._m_eHonorParentTransform = eHonorParentTransform;
    },
    /** Get offset position of the sprite. Calculated automatically by editors like Zwoptex.
     @since v0.99.0
     */
    getOffsetPositionInPixels:function () {
        return new cc.Point(this._m_obOffsetPositionInPixels.x, this._m_obOffsetPositionInPixels.y);
    },
    /** conforms to CCTextureProtocol protocol */
    getBlendFunc:function () {
        return this._m_sBlendFunc;
    },
    /** conforms to CCTextureProtocol protocol */
    setBlendFunc:function (blendFunc) {
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
        this._m_sColor = cc.WHITE();
        this._m_sColorUnmodified = cc.WHITE();

        this._m_sBlendFunc.src = cc.BLEND_SRC;
        this._m_sBlendFunc.dst = cc.BLEND_DST;

        // update texture (calls _updateBlendFunc)
        this.setTexture(null);

        this._m_bFlipX = this._m_bFlipY = false;

        // default transform anchor: center
        this.setAnchorPoint(cc.ccp(0.5, 0.5));

        // zwoptex default values
        this._m_obOffsetPositionInPixels = cc.PointZero();

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
        this.setTextureRectInPixels(cc.RectZero(), false, cc.SizeZero());

        return true;
    },
    initWithTexture:function (pTexture, rect) {
        var argnum = arguments.length;
        if (argnum == 0)
            throw "Sprite.initWithTexture(): Argument must be non-nil ";

        cc.Assert(pTexture != null, "");

        if (argnum == 1) {
            rect = new cc.Rect();
            if (pTexture instanceof cc.Texture2D)
                rect.size = pTexture.getContentSize();
            else if ((pTexture instanceof HTMLImageElement) || (pTexture instanceof HTMLCanvasElement))
                rect.size = new cc.Size(pTexture.width, pTexture.height);
        }

        if (cc.renderContextType == cc.kCanvas) {
            this._m_originalTexture = pTexture;
        }
        // IMPORTANT: [self init] and not [super init];
        this.init();
        this.setTexture(pTexture);
        this.setTextureRect(rect);
        return true;
    },

    initWithFile:function (pszFilename, rect) {
        var argnum = arguments.length;
        cc.Assert(pszFilename != null, "");
        var pTexture = cc.TextureCache.sharedTextureCache().textureForKey(pszFilename);
        if (!pTexture) {
            pTexture = cc.TextureCache.sharedTextureCache().addImage(pszFilename);
        }
        switch (argnum) {
            case 1:
                /** Initializes an sprite with an image filename.
                 The rect used will be the size of the image.
                 The offset will be (0,0).
                 */
                if (pTexture) {
                    rect = cc.RectZero();
                    if (cc.renderContextType == cc.kCanvas)
                        rect.size = new cc.Size(pTexture.width, pTexture.height);
                    else
                        rect.size = pTexture.getContentSize();
                    return this.initWithTexture(pTexture, rect);
                }
                // when load texture failed, it's better to get a "transparent" sprite then a crashed program
                return false;
                break;
            case 2:
                /** Initializes an sprite with an image filename, and a rect.
                 The offset will be (0,0).
                 */
                if (pTexture) {


                    return this.initWithTexture(pTexture, rect);
                }
                // when load texture failed, it's better to get a "transparent" sprite then a crashed program
                return false;
                break;
            default:
                throw "initWithFile():Argument must be non-nil ";
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
        var pFrame = cc.SpriteFrameCache.sharedSpriteFrameCache().spriteFrameByName(pszSpriteFrameName);
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
        this._m_pobTextureAtlas = null;
        this._m_pobBatchNode = null;
        this._m_bDirty = this._m_bRecursiveDirty = false;

        var x1 = 0 + this._m_obOffsetPositionInPixels.x;
        var y1 = 0 + this._m_obOffsetPositionInPixels.y;
        var x2 = x1 + this._m_obRectInPixels.size.width;
        var y2 = y1 + this._m_obRectInPixels.size.height;
        this._m_sQuad.bl.vertices = cc.vertex3(x1, y1, 0);
        this._m_sQuad.br.vertices = cc.vertex3(x2, y1, 0);
        this._m_sQuad.tl.vertices = cc.vertex3(x1, y2, 0);
        this._m_sQuad.tr.vertices = cc.vertex3(x2, y2, 0);
    },
    /** tell the sprite to use batch node render.
     @since v0.99.0
     */
    useBatchNode:function (batchNode) {
        this._m_bUsesBatchNode = true;
        this._m_pobTextureAtlas = batchNode.getTextureAtlas(); // weak ref
        this._m_pobBatchNode = batchNode;
    },
    /** updates the texture rect of the CCSprite in points. */
    setTextureRect:function (rect) {
        var rectInPixels = cc.RECT_POINTS_TO_PIXELS(rect);
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

        var relativeOffsetInPixels = this._m_obUnflippedOffsetPositionFromCenter;

        /* WEBGL Code
         if (this._m_bFlipX) {
         //relativeOffsetInPixels.x = -relativeOffsetInPixels.x;
         }
         if (this._m_bFlipY) {
         //relativeOffsetInPixels.y = -relativeOffsetInPixels.y;
         }
         */

        this._m_obOffsetPositionInPixels.x = relativeOffsetInPixels.x + (this._m_tContentSizeInPixels.width - this._m_obRectInPixels.size.width) / 2;
        this._m_obOffsetPositionInPixels.y = relativeOffsetInPixels.y + (this._m_tContentSizeInPixels.height - this._m_obRectInPixels.size.height) / 2;

        // rendering using batch node
        if (this._m_bUsesBatchNode) {
            // update dirty_, don't update recursiveDirty_
            this._m_bDirty = true;
        } else {
            // self rendering

            // Atlas: Vertex
            var x1 = 0 + this._m_obOffsetPositionInPixels.x;
            var y1 = 0 + this._m_obOffsetPositionInPixels.y;
            var x2 = x1 + this._m_obRectInPixels.size.width;
            var y2 = y1 + this._m_obRectInPixels.size.height;

            // Don't update Z.
            this._m_sQuad.bl.vertices = cc.vertex3(x1, y1, 0);
            this._m_sQuad.br.vertices = cc.vertex3(x2, y1, 0);
            this._m_sQuad.tl.vertices = cc.vertex3(x1, y2, 0);
            this._m_sQuad.tr.vertices = cc.vertex3(x2, y2, 0);
        }
    },
    _updateTextureCoords:function (rect) {
        if (cc.renderContextType == cc.kWebGL) {
            var tex = this._m_bUsesBatchNode ? this._m_pobTextureAtlas.getTexture() : this._m_pobTexture;
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
                } else {
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
            } else {
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
        if (!this._m_bIsVisible) {
            this._m_sQuad.br.vertices = this._m_sQuad.tl.vertices = this._m_sQuad.tr.vertices = this._m_sQuad.bl.vertices = cc.vertex3(0, 0, 0);
            this._m_pobTextureAtlas.updateQuad(this._m_sQuad, this._m_uAtlasIndex)
            this._m_bDirty = this._m_bRecursiveDirty = false;
            return;
        }

        // Optimization: If parent is batchnode, or parent is nil
        // build Affine transform manually
        if (!this._m_pParent || this._m_pParent == this._m_pobBatchNode) {
            var radians = -cc.DEGREES_TO_RADIANS(this._m_fRotation);
            var c = Math.cos(radians);
            var s = Math.sin(radians);

            matrix = cc.AffineTransformMake(c * this._m_fScaleX, s * this._m_fScaleX, -s * this._m_fScaleY, c * this._m_fScaleY,
                this._m_tPositionInPixels.x, this._m_tPositionInPixels.y);
            if (this._m_fSkewX || this._m_fSkewY) {
                var skewMatrix = cc.AffineTransformMake(1.0, Math.tan(cc.DEGREES_TO_RADIANS(this._m_fSkewY)), Math.tan(cc.DEGREES_TO_RADIANS(this._m_fSkewX)), 1.0, 0.0, 0.0);
                matrix = cc.AffineTransformConcat(skewMatrix, matrix);
            }
            matrix = cc.AffineTransformTranslate(matrix, -this._m_tAnchorPointInPixels.x, -this._m_tAnchorPointInPixels.y);
        } else // parent_ != batchNode_
        {
            // else do affine transformation according to the HonorParentTransform
            matrix = cc.AffineTransformIdentity();
            var prevHonor = cc.HONOR_PARENT_TRANSFORM_ALL;

            for (var p = this; p && p != this._m_pobBatchNode; p = p.getParent()) {
                // Might happen. Issue #1053
                // how to implement, we can not use dynamic
                // cc.Assert( [p isKindOfClass:[CCSprite class]], @"CCSprite should be a CCSprite subclass. Probably you initialized an sprite with a batchnode, but you didn't add it to the batch node." );

                var tv = new transformValues_();
                p._getTransformValues(tv);

                // If any of the parents are not visible, then don't draw this node
                if (!tv.visible) {
                    this._m_sQuad.br.vertices = this._m_sQuad.tl.vertices = this._m_sQuad.tr.vertices = this._m_sQuad.bl.vertices = cc.vertex3(0, 0, 0);
                    this._m_pobTextureAtlas.updateQuad(this._m_sQuad, this._m_uAtlasIndex);
                    this._m_bDirty = this._m_bRecursiveDirty = false;
                    return;
                }

                var newMatrix = cc.AffineTransformIdentity();

                // 2nd: Translate, Skew, Rotate, Scale
                if (prevHonor & cc.HONOR_PARENT_TRANSFORM_TRANSLATE) {
                    newMatrix = cc.AffineTransformTranslate(newMatrix, tv.pos.x, tv.pos.y);
                }

                if (prevHonor & cc.HONOR_PARENT_TRANSFORM_ROTATE) {
                    newMatrix = cc.AffineTransformRotate(newMatrix, -cc.DEGREES_TO_RADIANS(tv.rotation));
                }

                if (prevHonor & cc.HONOR_PARENT_TRANSFORM_SKEW) {
                    var skew = new cc.AffineTransform();
                    skew = cc.AffineTransformMake(1.0, Math.tan(cc.DEGREES_TO_RADIANS(tv.skew.y)), Math.tan(cc.DEGREES_TO_RADIANS(tv.skew.x)), 1.0, 0.0, 0.0);
                    // apply the skew to the transform
                    newMatrix = cc.AffineTransformConcat(skew, newMatrix);
                }

                if (prevHonor & cc.HONOR_PARENT_TRANSFORM_SCALE) {
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

        this._m_sQuad.bl.vertices = cc.vertex3(cc.RENDER_IN_SUBPIXEL(ax), cc.RENDER_IN_SUBPIXEL(ay), this._m_fVertexZ);
        this._m_sQuad.br.vertices = cc.vertex3(cc.RENDER_IN_SUBPIXEL(bx), cc.RENDER_IN_SUBPIXEL(by), this._m_fVertexZ);
        this._m_sQuad.tl.vertices = cc.vertex3(cc.RENDER_IN_SUBPIXEL(dx), cc.RENDER_IN_SUBPIXEL(dy), this._m_fVertexZ);
        this._m_sQuad.tr.vertices = cc.vertex3(cc.RENDER_IN_SUBPIXEL(cx), cc.RENDER_IN_SUBPIXEL(cy), this._m_fVertexZ);

        this._m_pobTextureAtlas.updateQuad(this._m_sQuad, this._m_uAtlasIndex);
        this._m_bDirty = this._m_bRecursiveDirty = false;
    },
// XXX: Optimization: instead of calling 5 times the parent sprite to obtain: position, scale.x, scale.y, anchorpoint and rotation,
// this fuction return the 5 values in 1 single call
    _getTransformValues:function (tv) {
        tv.pos = this._m_tPositionInPixels;
        tv.scale.x = this._m_fScaleX;
        tv.scale.y = this._m_fScaleY;
        tv.rotation = this._m_fRotation;
        tv.skew.x = this._m_fSkewX;
        tv.skew.y = this._m_fSkewY;
        tv.ap = this._m_tAnchorPointInPixels;
        tv.visible = this._m_bIsVisible;
        return tv
    },

// draw
    draw:function (ctx) {
        this._super();

        var context = ctx || cc.renderContext;
        if (cc.renderContextType == cc.kCanvas) {
            context.globalAlpha = this._m_nOpacity / 255;
            if (this._m_bFlipX) {
                context.scale(-1, 1);
            }
            if (this._m_bFlipY) {
                context.scale(1, -1);
            }
            var offsetPixels = this._m_obOffsetPositionInPixels;
            var pos = new cc.Point(0 | ( -this._m_tAnchorPointInPixels.x + offsetPixels.x), 0 | ( -this._m_tAnchorPointInPixels.y + offsetPixels.y));
            if (this._m_pobTexture) {
                //direct draw image by canvas drawImage
                if (this._m_pobTexture instanceof HTMLImageElement) {
                    if ((this._m_tContentSize.width == 0) && (this._m_tContentSize.height == 0)) {
                        this.setContentSize(new cc.Size(this._m_pobTexture.width, this._m_pobTexture.height));
                        this._m_obRect.size.width = this._m_pobTexture.width;
                        this._m_obRect.size.height = this._m_pobTexture.height;
                        context.drawImage(this._m_pobTexture, pos.x, -(pos.y + this._m_pobTexture.height));
                    } else {
                        context.drawImage(this._m_pobTexture,
                            this._m_obRect.origin.x, this._m_obRect.origin.y,
                            this._m_obRect.size.width, this._m_obRect.size.height,
                            pos.x, -(pos.y + this._m_obRect.size.height),
                            this._m_obRect.size.width, this._m_obRect.size.height);
                    }
                } else {
                    if ((this._m_tContentSize.width == 0) && (this._m_tContentSize.height == 0)) {
                        this.setContentSize(new cc.Size(this._m_pobTexture.width, this._m_pobTexture.height));
                        this._m_obRect.size.width = this._m_pobTexture.width;
                        this._m_obRect.size.height = this._m_pobTexture.height;
                        context.drawImage(this._m_pobTexture, pos.x, -(pos.y + this._m_pobTexture.height));
                    } else {
                        context.drawImage(this._m_pobTexture,
                            0, 0,
                            this._m_obRect.size.width, this._m_obRect.size.height,
                            pos.x, -(pos.y + this._m_obRect.size.height),
                            this._m_obRect.size.width, this._m_obRect.size.height);
                    }
                }
            } else {
                context.fillStyle = "rgba(" + this._m_sColor.r + "," + this._m_sColor.g + "," + this._m_sColor.b + ",1)";
                context.fillRect(pos.x, pos.y, this._m_tContentSize.width, this._m_tContentSize.height);
            }

            //TODO need to fixed
            if (cc.SPRITE_DEBUG_DRAW == 1) {
                // draw bounding box
                var s = this._m_tContentSize;
                var vertices = [cc.ccp(0, 0), cc.ccp(s.width, 0), cc.ccp(s.width, s.height), cc.ccp(0, s.height)];
                cc.drawingUtil.drawPoly(vertices, 4, true);
            } else if (cc.SPRITE_DEBUG_DRAW == 2) {
                // draw texture box
                var s = this._m_obRect.size;
                var offsetPix = this.getOffsetPositionInPixels();
                var vertices = [cc.ccp(offsetPix.x, offsetPix.y), cc.ccp(offsetPix.x + s.width, offsetPix.y),
                    cc.ccp(offsetPix.x + s.width, offsetPix.y + s.height), cc.ccp(offsetPix.x, offsetPix.y + s.height)];
                cc.drawingUtil.drawPoly(vertices, 4, true);
            }
        } else {
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
            var diff = cc.offsetof(cc.V3F_C4B_T2F, cc.vertices);
            //TODO
            // glVertexPointer(3, GL_FLOAT, kQuadSize, (offset + diff));

            // color
            diff = cc.offsetof(cc.V3F_C4B_T2F, cc.colors);
            //TODO
            // glColorPointer(4, GL_UNSIGNED_BYTE, kQuadSize, (offset + diff));

            // tex coords
            diff = cc.offsetof(cc.V3F_C4B_T2F, cc.texCoords);
            //TODO
            //glTexCoordPointer(2, GL_FLOAT, kQuadSize, (offset + diff));

            //glDrawArrays(GL_TRIANGLE_STRIP, 0, 4);

            if (newBlend) {
                //glBlendFunc(cc.BLEND_SRC, cc.BLEND_DST);
            }

            if (cc.SPRITE_DEBUG_DRAW == 1) {
                // draw bounding box
                var s = this._m_tContentSize;
                var vertices = [cc.ccp(0, 0), cc.ccp(s.width, 0), cc.ccp(s.width, s.height), cc.ccp(0, s.height)];
                cc.drawingUtil.drawPoly(vertices, 4, true);
            }
            else if (cc.SPRITE_DEBUG_DRAW == 2) {
                // draw texture box
                var s = this._m_obRect.size;
                var offsetPix = new cc.Point();
                offsetPix = this.getOffsetPositionInPixels();
                var vertices = [cc.ccp(offsetPix.x, offsetPix.y), cc.ccp(offsetPix.x + s.width, offsetPix.y),
                    cc.ccp(offsetPix.x + s.width, offsetPix.y + s.height), cc.ccp(offsetPix.x, offsetPix.y + s.height)];
                cc.drawingUtil.drawPoly(vertices, 4, true);
            } // CC_SPRITE_DEBUG_DRAW
        }
    },
// CCNode overrides
    addChild:function (pChild, zOrder, tag) {
        var argnum = arguments.length;
        switch (argnum) {
            case 1:
                this._super(pChild);
                break;
            case 2:
                this._super(pChild, zOrder);
                break;
            case 3:
                cc.Assert(pChild != null, "");
                this._super(pChild, zOrder, tag);

                if (cc.renderContextType == cc.kWebGL) {
                    if (this._m_bUsesBatchNode) {
                        cc.Assert(pChild.getTexture().getName() == this._m_pobTextureAtlas.getTexture().getName(), "");
                        var index = this._m_pobBatchNode.atlasIndexForChild(pChild, zOrder);
                        this._m_pobBatchNode._insertChild(pChild, index);
                    }
                    this._m_bHasChildren = true;
                }
                break;
            default:
                throw "Sprite.addChild():Argument must be non-nil ";
                break;
        }
    },
    reorderChild:function (pChild, zOrder) {
        cc.Assert(pChild != null, "pChild is null");
        cc.Assert(this._m_pChildren.indexOf(pChild) > -1, "");

        if (zOrder == pChild.getZOrder()) {
            return;
        }

        if (this._m_bUsesBatchNode) {
            // XXX: Instead of removing/adding, it is more efficient to reorder manually
            this.removeChild(pChild, false);
            this.addChild(pChild, zOrder);
        }
        else {
            this._super(pChild, zOrder);
        }
    },
    removeChild:function (pChild, bCleanup) {
        if (this._m_bUsesBatchNode) {
            this._m_pobBatchNode.removeSpriteFromAtlas(pChild);
        }
        this._super(pChild, bCleanup);
    },
    removeAllChildrenWithCleanup:function (bCleanup) {
        if (this._m_bUsesBatchNode) {
            if (this._m_pChildren != null) {
                for (var i in this._m_pChildren) {
                    if (this._m_pChildren[i] instanceof cc.Sprite) {
                        this._m_pobBatchNode.removeSpriteFromAtlas(this._m_pChildren[i]);
                    }
                }
            }
        }

        this._super(bCleanup);
        this._m_bHasChildren = false;
    },
//
// CCNode property overloads
// used only when parent is CCSpriteBatchNode
//

    setDirtyRecursively:function (bValue) {
        this._m_bDirty = this._m_bRecursiveDirty = bValue;
        // recursively set dirty
        if (this._m_pChildren != null) {
            for (var i in this._m_pChildren) {
                if (this._m_pChildren[i] instanceof cc.Sprite) {
                    this._m_pChildren[i].setDirtyRecursively(true);
                }
            }
        }
    },

// XXX HACK: optimization
    SET_DIRTY_RECURSIVELY:function () {
        if (this._m_bUsesBatchNode && !this._m_bRecursiveDirty) {
            this._m_bDirty = this._m_bRecursiveDirty = true;
            if (this._m_bHasChildren)
                this.setDirtyRecursively(true);
        }
    },
    setPosition:function (pos) {
        this._super(pos);
        this.SET_DIRTY_RECURSIVELY();
    },
    setPositionInPixels:function (pos) {
        this._super(pos);
        this.SET_DIRTY_RECURSIVELY();
    },
    setRotation:function (fRotation) {
        this._super(fRotation);
        this.SET_DIRTY_RECURSIVELY();
    },
    setSkewX:function (sx) {
        this._super(sx);
        this.SET_DIRTY_RECURSIVELY();
    },
    setSkewY:function (sy) {
        this._super(sy);
        this.SET_DIRTY_RECURSIVELY();
    },
    setScaleX:function (fScaleX) {
        this._super(fScaleX);
        this.SET_DIRTY_RECURSIVELY();
    },
    setScaleY:function (fScaleY) {
        this._super(fScaleY);
        this.SET_DIRTY_RECURSIVELY();
    },
    setScale:function (fScale) {
        this._super(fScale);
        this.SET_DIRTY_RECURSIVELY();
    },
    setVertexZ:function (fVertexZ) {
        this._super(fVertexZ);
        this.SET_DIRTY_RECURSIVELY();
    },
    setAnchorPoint:function (anchor) {
        this._super(anchor);
        this.SET_DIRTY_RECURSIVELY();
    },
    setIsRelativeAnchorPoint:function (bRelative) {
        cc.Assert(!this._m_bUsesBatchNode, "");
        this._super(bRelative);
    },
    setIsVisible:function (bVisible) {
        this._super(bVisible);
        this.SET_DIRTY_RECURSIVELY();
    },
    setFlipX:function (bFlipX) {
        if (this._m_bFlipX != bFlipX) {
            //save dirty region when before change
            //this._addDirtyRegionToDirector(this.boundingBoxToWorld());

            this._m_bFlipX = bFlipX;
            this.setTextureRectInPixels(this._m_obRectInPixels, this._m_bRectRotated, this._m_tContentSizeInPixels);

            //save dirty region when after changed
            //this._addDirtyRegionToDirector(this.boundingBoxToWorld());
            this.setNodeDirty();
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
            //save dirty region when before change
            //this._addDirtyRegionToDirector(this.boundingBoxToWorld());

            this._m_bFlipY = bFlipY;
            //this.setTextureRectInPixels(this._m_obRectInPixels, this._m_bRectRotated, this._m_tContentSizeInPixels);

            //save dirty region when after changed
            //this._addDirtyRegionToDirector(this.boundingBoxToWorld());
            this.setNodeDirty();
        }

    },
    isFlipY:function () {
        return this._m_bFlipY;
    },
//
// RGBA protocol
//

    updateColor:function () {
        var color4 = new cc.Color4B(this._m_sColor.r, this._m_sColor.g, this._m_sColor.b, this._m_nOpacity);

        this._m_sQuad.bl.colors = color4;
        this._m_sQuad.br.colors = color4;
        this._m_sQuad.tl.colors = color4;
        this._m_sQuad.tr.colors = color4;

// renders using Sprite Manager
        if (this._m_bUsesBatchNode) {
            if (this._m_uAtlasIndex != cc.SpriteIndexNotInitialized) {
                this._m_pobTextureAtlas.updateQuad(this._m_sQuad, this._m_uAtlasIndex)
            } else {
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

        //this._addDirtyRegionToDirector(this.boundingBoxToWorld());
        this.setNodeDirty();
        //TODO in canvas
        return;
        // special opacity for premultiplied textures
        if (this._m_bOpacityModifyRGB) {
            this.setColor(this._m_sColorUnmodified);
        }

        this.updateColor();
    },
     getColor:function () {
        if (this._m_bOpacityModifyRGB) {
            return new cc.Color3B(this._m_sColorUnmodified);
        }
        return new cc.Color3B(this._m_sColor);
    },

    setColor:function (color3) {
        this._m_sColor = this._m_sColorUnmodified = new cc.Color3B(color3.r, color3.g, color3.b);

        if (this.getTexture()) {
            if (cc.renderContextType == cc.kCanvas) {
                var cacheTextureForColor = cc.TextureCache.sharedTextureCache().getTextureColors(this._m_originalTexture);
                if (cacheTextureForColor) {
                    //generate color texture cache
                    var colorTexture = cc.generateTintImage(this.getTexture(), cacheTextureForColor, this._m_sColor, this.getTextureRect());
                    this.setTexture(colorTexture);
                }
            }
        }

        /*
         if (this._m_bOpacityModifyRGB) {
         this._m_sColor.r = Math.round(color3.r * this._m_nOpacity / 255);
         this._m_sColor.g = Math.round(color3.g * this._m_nOpacity / 255);
         this._m_sColor.b = Math.round(color3.b * this._m_nOpacity / 255);
         }
         */
        this.updateColor();
        //save dirty region when after changed
        //this._addDirtyRegionToDirector(this.boundingBoxToWorld());

        this.setNodeDirty();
    },
    // RGBAProtocol
    /** opacity: conforms to CCRGBAProtocol protocol */
    setIsOpacityModifyRGB:function (bValue) {
        var oldColor = this._m_sColor;
        this._m_bOpacityModifyRGB = bValue;
        this._m_sColor = oldColor;
    },
    getIsOpacityModifyRGB:function () {
        return this._m_bOpacityModifyRGB;
    },
    // Frames
    /** sets a new display frame to the CCSprite. */
    setDisplayFrame:function (pNewFrame) {
        this.setNodeDirty();
        this._m_obUnflippedOffsetPositionFromCenter = pNewFrame.getOffsetInPixels();
        var pNewTexture = pNewFrame.getTexture();
        // update texture before updating texture rect
        if (pNewTexture != this._m_pobTexture) {
            this.setTexture(pNewTexture);
        }
        // update rect
        this._m_bRectRotated = pNewFrame.isRotated();
        this.setTextureRectInPixels(pNewFrame.getRectInPixels(), pNewFrame.isRotated(), pNewFrame.getOriginalSizeInPixels());
        //save dirty region when after changed
        //this._addDirtyRegionToDirector(this.boundingBoxToWorld());
    },
    // Animation

    /** changes the display frame with animation name and index.
     The animation name will be get from the CCAnimationCache
     @since v0.99.5
     */
    setDisplayFrameWithAnimationName:function (animationName, frameIndex) {
        cc.Assert(animationName, "");
        var a = cc.AnimationCache.sharedAnimationCache().animationByName(animationName);
        cc.Assert(a, "");
        var frame = a.getFrames()[frameIndex];
        cc.Assert(frame, "");
        this.setDisplayFrame(frame);
    },
    /** returns whether or not a CCSpriteFrame is being displayed */
    isFrameDisplayed:function (pFrame) {
        if (cc.renderContextType == cc.kCanvas) {
            if (pFrame.getTexture() != this._m_pobTexture)
                return false;
            return cc.Rect.CCRectEqualToRect(pFrame.getRect(), this._m_obRect);
        } else {
            return (cc.Rect.CCRectEqualToRect(pFrame.getRect(), this._m_obRect) && pFrame.getTexture().getName() == this._m_pobTexture.getName());
        }
    },
    /** returns the current displayed frame. */
    displayedFrame:function () {
        if (cc.renderContextType == cc.kCanvas) {
            return cc.SpriteFrame.frameWithTextureForCanvas(this._m_pobTexture,
                this._m_obRectInPixels,
                this._m_bRectRotated,
                this._m_obUnflippedOffsetPositionFromCenter,
                this._m_tContentSizeInPixels);
        } else {
            return cc.SpriteFrame.frameWithTexture(this._m_pobTexture,
                this._m_obRectInPixels,
                this._m_bRectRotated,
                this._m_obUnflippedOffsetPositionFromCenter,
                this._m_tContentSizeInPixels);
        }
    },
// Texture protocol

    _updateBlendFunc:function () {
        if (cc.renderContextType == cc.kWebGL) {
            cc.Assert(!this._m_bUsesBatchNode, "CCSprite: _updateBlendFunc doesn't work when the sprite is rendered using a CCSpriteSheet");
            // it's possible to have an untextured sprite
            if (!this._m_pobTexture || !this._m_pobTexture.getHasPremultipliedAlpha()) {
                this._m_sBlendFunc.src = cc.GL_SRC_ALPHA;
                this._m_sBlendFunc.dst = cc.GL_ONE_MINUS_SRC_ALPHA;
                this.setIsOpacityModifyRGB(false);
            } else {
                this._m_sBlendFunc.src = cc.BLEND_SRC;
                this._m_sBlendFunc.dst = cc.BLEND_DST;
                this.setIsOpacityModifyRGB(true);
            }
        }
    },
    // CCTextureProtocol
    setTexture:function (texture) {
        // CCSprite: setTexture doesn't work when the sprite is rendered using a CCSpriteSheet
        if (cc.renderContextType != cc.kCanvas) {
            cc.Assert(!this._m_bUsesBatchNode, "setTexture doesn't work when the sprite is rendered using a CCSpriteSheet");
        }

        // we can not use RTTI, so we do not known the type of object
        // accept texture==nil as argument
        /*cc.Assert((! texture) || dynamic_cast<CCTexture2D*>(texture));*/

        this._m_pobTexture = texture;
        this._updateBlendFunc();
    },
    getTexture:function () {
        return this._m_pobTexture;
    }
});
cc.Sprite.spriteWithTexture = function (pTexture, rect, offset) {
    var argnum = arguments.length;
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
            return null;
            break;

        case 2:
            /** Creates an sprite with a texture and a rect.
             The offset will be (0,0).
             */
            if (pobSprite && pobSprite.initWithTexture(pTexture, rect)) {
                return pobSprite;
            }
            return null;
            break;

        case 3:
            /** Creates an sprite with a texture, a rect and offset. */
                // not implement
            cc.Assert(0, "");
            return null;
            break;

        default:
            throw "Sprite.spriteWithTexture(): Argument must be non-nil ";
            break;
    }
};
/** Creates an sprite with an sprite frame. */
cc.Sprite.spriteWithSpriteFrame = function (pSpriteFrame) {
    var pobSprite = new cc.Sprite();
    if (pobSprite && pobSprite.initWithSpriteFrame(pSpriteFrame)) {
        return pobSprite;
    }
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
    return cc.Sprite.spriteWithSpriteFrame(pFrame);
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
        return null;
    }
    else {
        /** Creates an sprite with an CCBatchNode and a rect
         */
        if (pobSprite && pobSprite.initWithFile(pszFileName, rect)) {
            return pobSprite;
        }
        return null;
    }
};

cc.Sprite.spriteWithBatchNode = function (batchNode, rect) {
    var pobSprite = new cc.Sprite();
    if (pobSprite && pobSprite.initWithBatchNode(batchNode, rect)) {
        return pobSprite;
    }
    return null;
};