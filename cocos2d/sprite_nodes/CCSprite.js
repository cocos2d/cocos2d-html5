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
    _textureAtlas:null,
    _atlasIndex:0,
    _batchNode:null,
    _honorParentTransform:null,
    _dirty:null,
    _recursiveDirty:null,
    _hasChildren:null,
    //
    // Data used when the sprite is self-rendered
    //
    _blendFunc:new cc.BlendFunc(),
    _texture:new cc.Texture2D(),
    _originalTexture:null,
    //
    // Shared data
    //
    // whether or not it's parent is a CCSpriteBatchNode
    _usesBatchNode:null,
    // texture
    _rect:new cc.Rect(),
    _rectInPixels:cc.RectZero(),
    _rectRotated:null,

    // Offset Position (used by Zwoptex)
    _offsetPositionInPixels:cc.PointZero(), // absolute
    _unflippedOffsetPositionFromCenter:cc.PointZero(),

    // vertex coords, texture coords and color info
    _quad:cc.V3F_C4B_T2F_QuadZero(),

    // opacity and RGB protocol
    colorUnmodified:null,
    _opacityModifyRGB:null,

    // image is flipped
    _flipX:null,
    _flipY:null,

    _opacity:255,

    ctor:function (fileName) {
        this._super();
        if (fileName) {
            if (typeof(fileName) == "string") {
                var frame = cc.SpriteFrameCache.sharedSpriteFrameCache().spriteFrameByName(fileName);
                this.initWithSpriteFrame(frame);
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
        return this._dirty;
    },
    /** make the Sprite to be updated in the Atlas. */
    setDirty:function (bDirty) {
        this._dirty = bDirty;
    },
    /** get the quad (tex coords, vertex coords and color) information */
    getQuad:function () {
        return this._quad;
    },
    /** returns whether or not the texture rectangle is rotated */
    isTextureRectRotated:function () {
        return this._rectRotated;
    },
    /** Set the index used on the TextureAtlas. */
    getAtlasIndex:function () {
        return this._atlasIndex;
    },
    /** Set the index used on the TextureAtlas.
     @warning Don't modify this value unless you know what you are doing
     */
    setAtlasIndex:function (atlasIndex) {
        this._atlasIndex = atlasIndex;
    },
    /** returns the rect of the CCSprite in points */
    getTextureRect:function () {
        return new cc.Rect(this._rect);
    },
    /** whether or not the Sprite is rendered using a CCSpriteBatchNode */
    isUsesBatchNode:function () {
        return this._usesBatchNode;
    },
    /** make the Sprite been rendered using a CCSpriteBatchNode */
    setUsesSpriteBatchNode:function (usesSpriteBatchNode) {
        this._usesBatchNode = usesSpriteBatchNode;
    },
    getTextureAtlas:function (pobTextureAtlas) {
        return this._textureAtlas;
    },
    setTextureAtlas:function (textureAtlas) {
        this._textureAtlas = textureAtlas;
    },
    getSpriteBatchNode:function () {
        return this._batchNode;
    },
    setSpriteBatchNode:function (spriteBatchNode) {
        this._batchNode = spriteBatchNode;
    },
    /** whether or not to transform according to its parent transformations.
     Useful for health bars. eg: Don't rotate the health bar, even if the parent rotates.
     IMPORTANT: Only valid if it is rendered using an CCSpriteSheet.
     @since v0.99.0
     */
    getHonorParentTransform:function () {
        return this._honorParentTransform;
    },
    /** whether or not to transform according to its parent transformations.
     Useful for health bars. eg: Don't rotate the health bar, even if the parent rotates.
     IMPORTANT: Only valid if it is rendered using an CCSpriteSheet.
     @since v0.99.0
     */
    setHonorParentTransform:function (honorParentTransform) {
        this._honorParentTransform = honorParentTransform;
    },
    /** Get offset position of the sprite. Calculated automatically by editors like Zwoptex.
     @since v0.99.0
     */
    getOffsetPositionInPixels:function () {
        return new cc.Point(this._offsetPositionInPixels.x, this._offsetPositionInPixels.y);
    },
    /** conforms to CCTextureProtocol protocol */
    getBlendFunc:function () {
        return this._blendFunc;
    },
    /** conforms to CCTextureProtocol protocol */
    setBlendFunc:function (blendFunc) {
        this._blendFunc = blendFunc;
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
        this._dirty = this._recursiveDirty = false;
        // by default use "Self Render".
        // if the sprite is added to an batchnode, then it will automatically switch to "SpriteSheet Render"
        this.useSelfRender();

        this._opacityModifyRGB = true;
        this._opacity = 255;
        this._color = cc.WHITE();
        this._colorUnmodified = cc.WHITE();

        this._blendFunc.src = cc.BLEND_SRC;
        this._blendFunc.dst = cc.BLEND_DST;

        // update texture (calls _updateBlendFunc)
        this.setTexture(null);

        this._flipX = this._flipY = false;

        // default transform anchor: center
        this.setAnchorPoint(cc.ccp(0.5, 0.5));

        // zwoptex default values
        this._offsetPositionInPixels = cc.PointZero();

        this._honorParentTransform = cc.HONOR_PARENT_TRANSFORM_ALL;
        this._hasChildren = false;

        // Atlas: Color
        var tmpColor = new cc.Color4B(255, 255, 255, 255);
        this._quad.bl.colors = tmpColor;
        this._quad.br.colors = tmpColor;
        this._quad.tl.colors = tmpColor;
        this._quad.tr.colors = tmpColor;

        // Atlas: Vertex

        // updated in "useSelfRender"

        // Atlas: TexCoords
        this.setTextureRectInPixels(cc.RectZero(), false, cc.SizeZero());

        return true;
    },
    initWithTexture:function (texture, rect) {
        var argnum = arguments.length;
        if (argnum == 0)
            throw "Sprite.initWithTexture(): Argument must be non-nil ";

        cc.Assert(texture != null, "");

        if (argnum == 1) {
            rect = new cc.Rect();
            if (texture instanceof cc.Texture2D)
                rect.size = texture.getContentSize();
            else if ((texture instanceof HTMLImageElement) || (texture instanceof HTMLCanvasElement))
                rect.size = new cc.Size(texture.width, texture.height);
        }

        if (cc.renderContextType == cc.CANVAS) {
            this._originalTexture = texture;
        }
        // IMPORTANT: [self init] and not [super init];
        this.init();
        this.setTexture(texture);
        this.setTextureRect(rect);
        return true;
    },

    initWithFile:function (filename, rect) {
        var argnum = arguments.length;
        cc.Assert(filename != null, "");
        var texture = cc.TextureCache.sharedTextureCache().textureForKey(filename);
        if (!texture) {
            texture = cc.TextureCache.sharedTextureCache().addImage(filename);
        }
        switch (argnum) {
            case 1:
                /** Initializes an sprite with an image filename.
                 The rect used will be the size of the image.
                 The offset will be (0,0).
                 */
                if (texture) {
                    rect = cc.RectZero();
                    if (cc.renderContextType == cc.CANVAS)
                        rect.size = new cc.Size(texture.width, texture.height);
                    else
                        rect.size = texture.getContentSize();
                    return this.initWithTexture(texture, rect);
                }
                // when load texture failed, it's better to get a "transparent" sprite then a crashed program
                return false;
                break;
            case 2:
                /** Initializes an sprite with an image filename, and a rect.
                 The offset will be (0,0).
                 */
                if (texture) {


                    return this.initWithTexture(texture, rect);
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
    initWithSpriteFrame:function (spriteFrame) {
        cc.Assert(spriteFrame != null, "");
        var ret = this.initWithTexture(spriteFrame.getTexture(), spriteFrame.getRect());
        this.setDisplayFrame(spriteFrame);

        return ret;
    },
    /** Initializes an sprite with an sprite frame name.
     An CCSpriteFrame will be fetched from the CCSpriteFrameCache by name.
     If the CCSpriteFrame doesn't exist it will raise an exception.
     @since v0.9
     */
    initWithSpriteFrameName:function (spriteFrameName) {
        cc.Assert(spriteFrameName != null, "");
        var frame = cc.SpriteFrameCache.sharedSpriteFrameCache().spriteFrameByName(spriteFrameName);
        return this.initWithSpriteFrame(frame);
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
     var texture  = new cc.Texture2D();
     texture = cc.TextureCache.sharedTextureCache().addCGImage(pImage, pszKey);
     var size = new cc.Size(),rect = new cc.Rect();
     size = texture.getContentSize();
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
        this._atlasIndex = cc.SpriteIndexNotInitialized;
        this._usesBatchNode = false;
        this._textureAtlas = null;
        this._batchNode = null;
        this._dirty = this._recursiveDirty = false;

        var x1 = 0 + this._offsetPositionInPixels.x;
        var y1 = 0 + this._offsetPositionInPixels.y;
        var x2 = x1 + this._rectInPixels.size.width;
        var y2 = y1 + this._rectInPixels.size.height;
        this._quad.bl.vertices = cc.vertex3(x1, y1, 0);
        this._quad.br.vertices = cc.vertex3(x2, y1, 0);
        this._quad.tl.vertices = cc.vertex3(x1, y2, 0);
        this._quad.tr.vertices = cc.vertex3(x2, y2, 0);
    },
    /** tell the sprite to use batch node render.
     @since v0.99.0
     */
    useBatchNode:function (batchNode) {
        this._usesBatchNode = true;
        this._textureAtlas = batchNode.getTextureAtlas(); // weak ref
        this._batchNode = batchNode;
    },
    /** updates the texture rect of the CCSprite in points. */
    setTextureRect:function (rect) {
        var rectInPixels = cc.RECT_POINTS_TO_PIXELS(rect);
        this.setTextureRectInPixels(rectInPixels, false, rectInPixels.size);
    },
    /** updates the texture rect, rectRotated and untrimmed size of the CCSprite in pixels
     */
    setTextureRectInPixels:function (rect, rotated, size) {
        this._rectInPixels = rect;
        this._rect = cc.RECT_PIXELS_TO_POINTS(rect);
        this._rectRotated = rotated;

        this.setContentSizeInPixels(size);
        this._updateTextureCoords(this._rectInPixels);

        var relativeOffsetInPixels = this._unflippedOffsetPositionFromCenter;

        /* WEBGL Code
         if (this._flipX) {
         //relativeOffsetInPixels.x = -relativeOffsetInPixels.x;
         }
         if (this._flipY) {
         //relativeOffsetInPixels.y = -relativeOffsetInPixels.y;
         }
         */

        this._offsetPositionInPixels.x = relativeOffsetInPixels.x + (this._contentSizeInPixels.width - this._rectInPixels.size.width) / 2;
        this._offsetPositionInPixels.y = relativeOffsetInPixels.y + (this._contentSizeInPixels.height - this._rectInPixels.size.height) / 2;

        // rendering using batch node
        if (this._usesBatchNode) {
            // update dirty_, don't update recursiveDirty_
            this._dirty = true;
        } else {
            // self rendering

            // Atlas: Vertex
            var x1 = 0 + this._offsetPositionInPixels.x;
            var y1 = 0 + this._offsetPositionInPixels.y;
            var x2 = x1 + this._rectInPixels.size.width;
            var y2 = y1 + this._rectInPixels.size.height;

            // Don't update Z.
            this._quad.bl.vertices = cc.vertex3(x1, y1, 0);
            this._quad.br.vertices = cc.vertex3(x2, y1, 0);
            this._quad.tl.vertices = cc.vertex3(x1, y2, 0);
            this._quad.tr.vertices = cc.vertex3(x2, y2, 0);
        }
    },
    _updateTextureCoords:function (rect) {
        if (cc.renderContextType == cc.WEBGL) {
            var tex = this._usesBatchNode ? this._textureAtlas.getTexture() : this._texture;
            if (!tex) {
                return;
            }

            var atlasWidth = tex.getPixelsWide();
            var atlasHeight = tex.getPixelsHigh();

            var left, right, top, bottom;

            if (this._rectRotated) {
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


                if (this._flipX) {
                    cc.SWAP(top, bottom);
                }

                if (this._flipY) {
                    cc.SWAP(left, right);
                }

                this._quad.bl.texCoords.u = left;
                this._quad.bl.texCoords.v = top;
                this._quad.br.texCoords.u = left;
                this._quad.br.texCoords.v = bottom;
                this._quad.tl.texCoords.u = right;
                this._quad.tl.texCoords.v = top;
                this._quad.tr.texCoords.u = right;
                this._quad.tr.texCoords.v = bottom;
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

                if (this._flipX) {
                    cc.SWAP(left, right);
                }

                if (this._flipY) {
                    cc.SWAP(top, bottom);
                }

                this._quad.bl.texCoords.u = left;
                this._quad.bl.texCoords.v = bottom;
                this._quad.br.texCoords.u = right;
                this._quad.br.texCoords.v = bottom;
                this._quad.tl.texCoords.u = left;
                this._quad.tl.texCoords.v = top;
                this._quad.tr.texCoords.u = right;
                this._quad.tr.texCoords.v = top;
            }
        }
    },
    // BatchNode methods
    /** updates the quad according the the rotation, position, scale values. */
    updateTransform:function () {
        cc.Assert(this._usesBatchNode, "");

        // optimization. Quick return if not dirty
        if (!this._dirty) {
            return;
        }

        var matrix = new cc.AffineTransform();

        // Optimization: if it is not visible, then do nothing
        if (!this._isVisible) {
            this._quad.br.vertices = this._quad.tl.vertices = this._quad.tr.vertices = this._quad.bl.vertices = cc.vertex3(0, 0, 0);
            this._textureAtlas.updateQuad(this._quad, this._atlasIndex)
            this._dirty = this._recursiveDirty = false;
            return;
        }

        // Optimization: If parent is batchnode, or parent is nil
        // build Affine transform manually
        if (!this._parent || this._parent == this._batchNode) {
            var radians = -cc.DEGREES_TO_RADIANS(this._rotation);
            var c = Math.cos(radians);
            var s = Math.sin(radians);

            matrix = cc.AffineTransformMake(c * this._scaleX, s * this._scaleX, -s * this._scaleY, c * this._scaleY,
                this._positionInPixels.x, this._positionInPixels.y);
            if (this._skewX || this._skewY) {
                var skewMatrix = cc.AffineTransformMake(1.0, Math.tan(cc.DEGREES_TO_RADIANS(this._skewY)), Math.tan(cc.DEGREES_TO_RADIANS(this._skewX)), 1.0, 0.0, 0.0);
                matrix = cc.AffineTransformConcat(skewMatrix, matrix);
            }
            matrix = cc.AffineTransformTranslate(matrix, -this._anchorPointInPixels.x, -this._anchorPointInPixels.y);
        } else // parent_ != batchNode_
        {
            // else do affine transformation according to the HonorParentTransform
            matrix = cc.AffineTransformIdentity();
            var prevHonor = cc.HONOR_PARENT_TRANSFORM_ALL;

            for (var p = this; p && p != this._batchNode; p = p.getParent()) {
                // Might happen. Issue #1053
                // how to implement, we can not use dynamic
                // cc.Assert( [p isKindOfClass:[CCSprite class]], @"CCSprite should be a CCSprite subclass. Probably you initialized an sprite with a batchnode, but you didn't add it to the batch node." );

                var tv = new transformValues_();
                p._getTransformValues(tv);

                // If any of the parents are not visible, then don't draw this node
                if (!tv.visible) {
                    this._quad.br.vertices = this._quad.tl.vertices = this._quad.tr.vertices = this._quad.bl.vertices = cc.vertex3(0, 0, 0);
                    this._textureAtlas.updateQuad(this._quad, this._atlasIndex);
                    this._dirty = this._recursiveDirty = false;
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
        size = this._rectInPixels.size;

        var x1 = this._offsetPositionInPixels.x;
        var y1 = this._offsetPositionInPixels.y;

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

        this._quad.bl.vertices = cc.vertex3(cc.RENDER_IN_SUBPIXEL(ax), cc.RENDER_IN_SUBPIXEL(ay), this._vertexZ);
        this._quad.br.vertices = cc.vertex3(cc.RENDER_IN_SUBPIXEL(bx), cc.RENDER_IN_SUBPIXEL(by), this._vertexZ);
        this._quad.tl.vertices = cc.vertex3(cc.RENDER_IN_SUBPIXEL(dx), cc.RENDER_IN_SUBPIXEL(dy), this._vertexZ);
        this._quad.tr.vertices = cc.vertex3(cc.RENDER_IN_SUBPIXEL(cx), cc.RENDER_IN_SUBPIXEL(cy), this._vertexZ);

        this._textureAtlas.updateQuad(this._quad, this._atlasIndex);
        this._dirty = this._recursiveDirty = false;
    },
// XXX: Optimization: instead of calling 5 times the parent sprite to obtain: position, scale.x, scale.y, anchorpoint and rotation,
// this fuction return the 5 values in 1 single call
    _getTransformValues:function (tv) {
        tv.pos = this._positionInPixels;
        tv.scale.x = this._scaleX;
        tv.scale.y = this._scaleY;
        tv.rotation = this._rotation;
        tv.skew.x = this._skewX;
        tv.skew.y = this._skewY;
        tv.ap = this._anchorPointInPixels;
        tv.visible = this._isVisible;
        return tv
    },

// draw
    draw:function (ctx) {
        this._super();

        var context = ctx || cc.renderContext;
        if (cc.renderContextType == cc.CANVAS) {
            context.globalAlpha = this._opacity / 255;
            if (this._flipX) {
                context.scale(-1, 1);
            }
            if (this._flipY) {
                context.scale(1, -1);
            }
            var offsetPixels = this._offsetPositionInPixels;
            var pos = new cc.Point(0 | ( -this._anchorPointInPixels.x + offsetPixels.x), 0 | ( -this._anchorPointInPixels.y + offsetPixels.y));
            if (this._texture) {
                //direct draw image by canvas drawImage
                if (this._texture instanceof HTMLImageElement) {
                    if ((this._contentSize.width == 0) && (this._contentSize.height == 0)) {
                        this.setContentSize(new cc.Size(this._texture.width, this._texture.height));
                        this._rect.size.width = this._texture.width;
                        this._rect.size.height = this._texture.height;
                        context.drawImage(this._texture, pos.x, -(pos.y + this._texture.height));
                    } else {
                        context.drawImage(this._texture,
                            this._rect.origin.x, this._rect.origin.y,
                            this._rect.size.width, this._rect.size.height,
                            pos.x, -(pos.y + this._rect.size.height),
                            this._rect.size.width, this._rect.size.height);
                    }
                } else {
                    if ((this._contentSize.width == 0) && (this._contentSize.height == 0)) {
                        this.setContentSize(new cc.Size(this._texture.width, this._texture.height));
                        this._rect.size.width = this._texture.width;
                        this._rect.size.height = this._texture.height;
                        context.drawImage(this._texture, pos.x, -(pos.y + this._texture.height));
                    } else {
                        context.drawImage(this._texture,
                            0, 0,
                            this._rect.size.width, this._rect.size.height,
                            pos.x, -(pos.y + this._rect.size.height),
                            this._rect.size.width, this._rect.size.height);
                    }
                }
            } else {
                context.fillStyle = "rgba(" + this._color.r + "," + this._color.g + "," + this._color.b + ",1)";
                context.fillRect(pos.x, pos.y, this._contentSize.width, this._contentSize.height);
            }

            //TODO need to fixed
            if (cc.SPRITE_DEBUG_DRAW == 1) {
                // draw bounding box
                var s = this._contentSize;
                var vertices = [cc.ccp(0, 0), cc.ccp(s.width, 0), cc.ccp(s.width, s.height), cc.ccp(0, s.height)];
                cc.drawingUtil.drawPoly(vertices, 4, true);
            } else if (cc.SPRITE_DEBUG_DRAW == 2) {
                // draw texture box
                var s = this._rect.size;
                var offsetPix = this.getOffsetPositionInPixels();
                var vertices = [cc.ccp(offsetPix.x, offsetPix.y), cc.ccp(offsetPix.x + s.width, offsetPix.y),
                    cc.ccp(offsetPix.x + s.width, offsetPix.y + s.height), cc.ccp(offsetPix.x, offsetPix.y + s.height)];
                cc.drawingUtil.drawPoly(vertices, 4, true);
            }
        } else {
            cc.Assert(!this._usesBatchNode, "");

            // Default GL states: GL_TEXTURE_2D, GL_VERTEX_ARRAY, GL_COLOR_ARRAY, GL_TEXTURE_COORD_ARRAY
            // Needed states: GL_TEXTURE_2D, GL_VERTEX_ARRAY, GL_COLOR_ARRAY, GL_TEXTURE_COORD_ARRAY
            // Unneeded states: -
            var newBlend = this._blendFunc.src != cc.BLEND_SRC || this._blendFunc.dst != cc.BLEND_DST;
            if (newBlend) {
                //TODO
                //glBlendFunc(this._blendFunc.src, this._blendFunc.dst);
            }

            //#define kQuadSize  sizeof(this._quad.bl)
            if (this._texture) {
                //TODO
                //glBindTexture(GL_TEXTURE_2D, this._texture.getName());
            }
            else {
                //TODO
                //glBindTexture(GL_TEXTURE_2D, 0);
            }

            var offset = this._quad;

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
                var s = this._contentSize;
                var vertices = [cc.ccp(0, 0), cc.ccp(s.width, 0), cc.ccp(s.width, s.height), cc.ccp(0, s.height)];
                cc.drawingUtil.drawPoly(vertices, 4, true);
            }
            else if (cc.SPRITE_DEBUG_DRAW == 2) {
                // draw texture box
                var s = this._rect.size;
                var offsetPix = new cc.Point();
                offsetPix = this.getOffsetPositionInPixels();
                var vertices = [cc.ccp(offsetPix.x, offsetPix.y), cc.ccp(offsetPix.x + s.width, offsetPix.y),
                    cc.ccp(offsetPix.x + s.width, offsetPix.y + s.height), cc.ccp(offsetPix.x, offsetPix.y + s.height)];
                cc.drawingUtil.drawPoly(vertices, 4, true);
            } // CC_SPRITE_DEBUG_DRAW
        }
    },
// CCNode overrides
    addChild:function (child, zOrder, tag) {
        var argnum = arguments.length;
        switch (argnum) {
            case 1:
                this._super(child);
                break;
            case 2:
                this._super(child, zOrder);
                break;
            case 3:
                cc.Assert(child != null, "");
                this._super(child, zOrder, tag);

                if (cc.renderContextType == cc.WEBGL) {
                    if (this._usesBatchNode) {
                        cc.Assert(child.getTexture().getName() == this._textureAtlas.getTexture().getName(), "");
                        var index = this._batchNode.atlasIndexForChild(child, zOrder);
                        this._batchNode._insertChild(child, index);
                    }
                    this._hasChildren = true;
                }
                break;
            default:
                throw "Sprite.addChild():Argument must be non-nil ";
                break;
        }
    },
    reorderChild:function (child, zOrder) {
        cc.Assert(child != null, "child is null");
        cc.Assert(this._children.indexOf(child) > -1, "");

        if (zOrder == child.getZOrder()) {
            return;
        }

        if (this._usesBatchNode) {
            // XXX: Instead of removing/adding, it is more efficient to reorder manually
            this.removeChild(child, false);
            this.addChild(child, zOrder);
        }
        else {
            this._super(child, zOrder);
        }
    },
    removeChild:function (child, cleanup) {
        if (this._usesBatchNode) {
            this._batchNode.removeSpriteFromAtlas(child);
        }
        this._super(child, cleanup);
    },
    removeAllChildrenWithCleanup:function (cleanup) {
        if (this._usesBatchNode) {
            if (this._children != null) {
                for (var i in this._children) {
                    if (this._children[i] instanceof cc.Sprite) {
                        this._batchNode.removeSpriteFromAtlas(this._children[i]);
                    }
                }
            }
        }

        this._super(cleanup);
        this._hasChildren = false;
    },
//
// CCNode property overloads
// used only when parent is CCSpriteBatchNode
//

    setDirtyRecursively:function (value) {
        this._dirty = this._recursiveDirty = value;
        // recursively set dirty
        if (this._children != null) {
            for (var i in this._children) {
                if (this._children[i] instanceof cc.Sprite) {
                    this._children[i].setDirtyRecursively(true);
                }
            }
        }
    },

// XXX HACK: optimization
    SET_DIRTY_RECURSIVELY:function () {
        if (this._usesBatchNode && !this._recursiveDirty) {
            this._dirty = this._recursiveDirty = true;
            if (this._hasChildren)
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
    setScaleX:function (scaleX) {
        this._super(scaleX);
        this.SET_DIRTY_RECURSIVELY();
    },
    setScaleY:function (scaleY) {
        this._super(scaleY);
        this.SET_DIRTY_RECURSIVELY();
    },
    setScale:function (scale) {
        this._super(scale);
        this.SET_DIRTY_RECURSIVELY();
    },
    setVertexZ:function (vertexZ) {
        this._super(vertexZ);
        this.SET_DIRTY_RECURSIVELY();
    },
    setAnchorPoint:function (anchor) {
        this._super(anchor);
        this.SET_DIRTY_RECURSIVELY();
    },
    setIsRelativeAnchorPoint:function (relative) {
        cc.Assert(!this._usesBatchNode, "");
        this._super(relative);
    },
    setIsVisible:function (visible) {
        this._super(visible);
        this.SET_DIRTY_RECURSIVELY();
    },
    setFlipX:function (flipX) {
        if (this._flipX != flipX) {
            //save dirty region when before change
            //this._addDirtyRegionToDirector(this.boundingBoxToWorld());

            this._flipX = flipX;
            this.setTextureRectInPixels(this._rectInPixels, this._rectRotated, this._contentSizeInPixels);

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
        return this._flipX;
    },
    /** whether or not the sprite is flipped vertically.
     It only flips the texture of the sprite, and not the texture of the sprite's children.
     Also, flipping the texture doesn't alter the anchorPoint.
     If you want to flip the anchorPoint too, and/or to flip the children too use:

     sprite->setScaleY(sprite->getScaleY() * -1);
     */
    setFlipY:function (flipY) {
        if (this._flipY != flipY) {
            //save dirty region when before change
            //this._addDirtyRegionToDirector(this.boundingBoxToWorld());

            this._flipY = flipY;
            //this.setTextureRectInPixels(this._rectInPixels, this._rectRotated, this._contentSizeInPixels);

            //save dirty region when after changed
            //this._addDirtyRegionToDirector(this.boundingBoxToWorld());
            this.setNodeDirty();
        }

    },
    isFlipY:function () {
        return this._flipY;
    },
//
// RGBA protocol
//

    updateColor:function () {
        var color4 = new cc.Color4B(this._color.r, this._color.g, this._color.b, this._opacity);

        this._quad.bl.colors = color4;
        this._quad.br.colors = color4;
        this._quad.tl.colors = color4;
        this._quad.tr.colors = color4;

// renders using Sprite Manager
        if (this._usesBatchNode) {
            if (this._atlasIndex != cc.SpriteIndexNotInitialized) {
                this._textureAtlas.updateQuad(this._quad, this._atlasIndex)
            } else {
                // no need to set it recursively
                // update dirty_, don't update recursiveDirty_
                this._dirty = true;
            }
        }

// self render
// do nothing
    },
    getOpacity:function () {
        return this._opacity;
    },
    setOpacity:function (opacity) {
        this._opacity = opacity;

        //this._addDirtyRegionToDirector(this.boundingBoxToWorld());
        this.setNodeDirty();
        //TODO in canvas
        return;
        // special opacity for premultiplied textures
        if (this._opacityModifyRGB) {
            this.setColor(this._colorUnmodified);
        }

        this.updateColor();
    },
     getColor:function () {
        if (this._opacityModifyRGB) {
            return new cc.Color3B(this._colorUnmodified);
        }
        return new cc.Color3B(this._color);
    },

    setColor:function (color3) {
        this._color = this._colorUnmodified = new cc.Color3B(color3.r, color3.g, color3.b);

        if (this.getTexture()) {
            if (cc.renderContextType == cc.CANVAS) {
                var cacheTextureForColor = cc.TextureCache.sharedTextureCache().getTextureColors(this._originalTexture);
                if (cacheTextureForColor) {
                    //generate color texture cache
                    var colorTexture = cc.generateTintImage(this.getTexture(), cacheTextureForColor, this._color, this.getTextureRect());
                    this.setTexture(colorTexture);
                }
            }
        }

        /*
         if (this._opacityModifyRGB) {
         this._color.r = Math.round(color3.r * this._opacity / 255);
         this._color.g = Math.round(color3.g * this._opacity / 255);
         this._color.b = Math.round(color3.b * this._opacity / 255);
         }
         */
        this.updateColor();
        //save dirty region when after changed
        //this._addDirtyRegionToDirector(this.boundingBoxToWorld());

        this.setNodeDirty();
    },
    // RGBAProtocol
    /** opacity: conforms to CCRGBAProtocol protocol */
    setIsOpacityModifyRGB:function (value) {
        var oldColor = this._color;
        this._opacityModifyRGB = value;
        this._color = oldColor;
    },
    getIsOpacityModifyRGB:function () {
        return this._opacityModifyRGB;
    },
    // Frames
    /** sets a new display frame to the CCSprite. */
    setDisplayFrame:function (newFrame) {
        this.setNodeDirty();
        this._unflippedOffsetPositionFromCenter = newFrame.getOffsetInPixels();
        var pNewTexture = newFrame.getTexture();
        // update texture before updating texture rect
        if (pNewTexture != this._texture) {
            this.setTexture(pNewTexture);
        }
        // update rect
        this._rectRotated = newFrame.isRotated();
        this.setTextureRectInPixels(newFrame.getRectInPixels(), newFrame.isRotated(), newFrame.getOriginalSizeInPixels());
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
    isFrameDisplayed:function (frame) {
        if (cc.renderContextType == cc.CANVAS) {
            if (frame.getTexture() != this._texture)
                return false;
            return cc.Rect.CCRectEqualToRect(frame.getRect(), this._rect);
        } else {
            return (cc.Rect.CCRectEqualToRect(frame.getRect(), this._rect) && frame.getTexture().getName() == this._texture.getName());
        }
    },
    /** returns the current displayed frame. */
    displayedFrame:function () {
        if (cc.renderContextType == cc.CANVAS) {
            return cc.SpriteFrame.frameWithTextureForCanvas(this._texture,
                this._rectInPixels,
                this._rectRotated,
                this._unflippedOffsetPositionFromCenter,
                this._contentSizeInPixels);
        } else {
            return cc.SpriteFrame.frameWithTexture(this._texture,
                this._rectInPixels,
                this._rectRotated,
                this._unflippedOffsetPositionFromCenter,
                this._contentSizeInPixels);
        }
    },
// Texture protocol

    _updateBlendFunc:function () {
        if (cc.renderContextType == cc.WEBGL) {
            cc.Assert(!this._usesBatchNode, "CCSprite: _updateBlendFunc doesn't work when the sprite is rendered using a CCSpriteSheet");
            // it's possible to have an untextured sprite
            if (!this._texture || !this._texture.getHasPremultipliedAlpha()) {
                this._blendFunc.src = cc.GL_SRC_ALPHA;
                this._blendFunc.dst = cc.GL_ONE_MINUS_SRC_ALPHA;
                this.setIsOpacityModifyRGB(false);
            } else {
                this._blendFunc.src = cc.BLEND_SRC;
                this._blendFunc.dst = cc.BLEND_DST;
                this.setIsOpacityModifyRGB(true);
            }
        }
    },
    // CCTextureProtocol
    setTexture:function (texture) {
        // CCSprite: setTexture doesn't work when the sprite is rendered using a CCSpriteSheet
        if (cc.renderContextType != cc.CANVAS) {
            cc.Assert(!this._usesBatchNode, "setTexture doesn't work when the sprite is rendered using a CCSpriteSheet");
        }

        // we can not use RTTI, so we do not known the type of object
        // accept texture==nil as argument
        /*cc.Assert((! texture) || dynamic_cast<CCTexture2D*>(texture));*/

        this._texture = texture;
        this._updateBlendFunc();
    },
    getTexture:function () {
        return this._texture;
    }
});
cc.Sprite.spriteWithTexture = function (texture, rect, offset) {
    var argnum = arguments.length;
    var sprite = new cc.Sprite();
    switch (argnum) {
        case 1:
            /** Creates an sprite with a texture.
             The rect used will be the size of the texture.
             The offset will be (0,0).
             */
            if (sprite && sprite.initWithTexture(texture)) {
                return sprite;
            }
            return null;
            break;

        case 2:
            /** Creates an sprite with a texture and a rect.
             The offset will be (0,0).
             */
            if (sprite && sprite.initWithTexture(texture, rect)) {
                return sprite;
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
cc.Sprite.spriteWithSpriteFrame = function (spriteFrame) {
    var sprite = new cc.Sprite();
    if (sprite && sprite.initWithSpriteFrame(spriteFrame)) {
        return sprite;
    }
    return null;
};
/** Creates an sprite with an sprite frame name.
 An CCSpriteFrame will be fetched from the CCSpriteFrameCache by name.
 If the CCSpriteFrame doesn't exist it will raise an exception.
 @since v0.9
 */
cc.Sprite.spriteWithSpriteFrameName = function (spriteFrameName) {
    var frame = cc.SpriteFrameCache.sharedSpriteFrameCache().spriteFrameByName(spriteFrameName);
    var msg = "Invalid spriteFrameName:" + spriteFrameName;
    cc.Assert(frame != null, msg);
    return cc.Sprite.spriteWithSpriteFrame(frame);
};

cc.Sprite.spriteWithFile = function (fileName, rect) {
    var argnum = arguments.length;
    var sprite = new cc.Sprite();
    if (argnum < 2) {
        /** Creates an sprite with an image filename.
         The rect used will be the size of the image.
         The offset will be (0,0).
         */
        if (sprite && sprite.initWithFile(fileName)) {
            return sprite;
        }
        return null;
    }
    else {
        /** Creates an sprite with an CCBatchNode and a rect
         */
        if (sprite && sprite.initWithFile(fileName, rect)) {
            return sprite;
        }
        return null;
    }
};

cc.Sprite.spriteWithBatchNode = function (batchNode, rect) {
    var sprite = new cc.Sprite();
    if (sprite && sprite.initWithBatchNode(batchNode, rect)) {
        return sprite;
    }
    return null;
};