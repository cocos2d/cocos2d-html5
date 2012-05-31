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

/** CCSpriteBatchNode is like a batch node: if it contains children, it will draw them in 1 single OpenGL call
 * (often known as "batch draw").
 *
 * A CCSpriteBatchNode can reference one and only one texture (one image file, one texture atlas).
 * Only the CCSprites that are contained in that texture can be added to the CCSpriteBatchNode.
 * All CCSprites added to a CCSpriteBatchNode are drawn in one OpenGL ES draw call.
 * If the CCSprites are not added to a CCSpriteBatchNode then an OpenGL ES draw call will be needed for each one, which is less efficient.
 *
 *
 * Limitations:
 *  - The only object that is accepted as child (or grandchild, grand-grandchild, etc...) is CCSprite or any subclass of CCSprite. eg: particles, labels and layer can't be added to a CCSpriteBatchNode.
 *  - Either all its children are Aliased or Antialiased. It can't be a mix. This is because "alias" is a property of the texture, and all the sprites share the same texture.
 *
 * @since v0.7.1
 */

cc.defaultCapacity = 29;
cc.UINT_MAX = 0xffffffff;
cc.GL_SRC_ALPHA = 0x0302;
cc.GL_ONE_MINUS_SRC_ALPHA = 0x0303;

cc.SpriteBatchNode = cc.Node.extend({
    _textureAtlas:new cc.TextureAtlas(),
    _blendFunc:new cc.BlendFunc(0, 0),
    // all descendants: chlidren, gran children, etc...
    _descendants:[],
    _renderTexture:null,
    _isUseCache:false,

    ctor:function (fileImage) {
        this._super();
        if (fileImage) {
            this.initWithFile(fileImage, cc.defaultCapacity);
        }
        this.setContentSize(new cc.Size(cc.canvas.width, cc.canvas.height));
        this._renderTexture = cc.RenderTexture.renderTextureWithWidthAndHeight(cc.canvas.width, cc.canvas.height);
    },

    _updateBlendFunc:function () {
        if (!this._textureAtlas.getTexture().getHasPremultipliedAlpha()) {
            this._blendFunc.src = cc.GL_SRC_ALPHA;
            this._blendFunc.dst = cc.GL_ONE_MINUS_SRC_ALPHA;
        }
    },

    /* IMPORTANT XXX IMPORTNAT:
     * These 2 methods can't be part of CCTMXLayer since they call [super add...], and CCSpriteSheet#add SHALL not be called
     */

    /* Adds a quad into the texture atlas but it won't be added into the children array.
     This method should be called only when you are dealing with very big AtlasSrite and when most of the CCSprite won't be updated.
     For example: a tile map (CCTMXMap) or a label with lots of characters (BitmapFontAtlas)
     */
    addQuadFromSprite:function (sprite, index) {
        cc.Assert(sprite != null, "SpriteBatchNode.addQuadFromSprite():Argument must be non-nil");
        /// @todo CCAssert( [sprite isKindOfClass:[CCSprite class]], @"CCSpriteSheet only supports CCSprites as children");

        /*while(index >= this._textureAtlas.getCapacity() || this._textureAtlas.getCapacity() == this._textureAtlas.getTotalQuads()){
         this.increaseAtlasCapacity();
         }*/
        //todo fixed
        //
        // update the quad directly. Don't add the sprite to the scene graph
        //
        sprite.useBatchNode(this);
        sprite.setAtlasIndex(index);
        var quad = sprite.getQuad();

        this._textureAtlas.insertQuad(quad, index);
        // XXX: updateTransform will update the textureAtlas too using updateQuad.
        // XXX: so, it should be AFTER the insertQuad
        sprite.setDirty(true);
        sprite.updateTransform();
        this._children = cc.ArrayAppendObjectToIndex(this._children, sprite, index);
    },

    /* This is the opposite of "addQuadFromSprite.
     It add the sprite to the children and descendants array, but it doesn't update add it to the texture atlas
     */
    addSpriteWithoutQuad:function (child, z, aTag) {
        cc.Assert(child != null, "SpriteBatchNode.addQuadFromSprite():Argument must be non-nil");
        /// @todo CCAssert( [child isKindOfClass:[CCSprite class]], @"CCSpriteSheet only supports CCSprites as children");

        // quad index is Z
        child.setAtlasIndex(z);

        // XXX: optimize with a binary search
        var i = 0;
        if (this._descendants && this._descendants.length > 0) {
            var obj = null;
            for (var index = 0; index < this._descendants.length; index++) {
                obj = this._descendants[index];
                if (obj && (obj.getAtlasIndex() >= z)) {
                    ++i;
                }
            }
        }
        this._descendants = cc.ArrayAppendObjectToIndex(this._descendants, child, i);

        // IMPORTANT: Call super, and not self. Avoid adding it to the texture atlas array
        this.addChild(child, z, aTag, true);
        //CCNode::addChild(child, z, aTag);
        return this;
    },

    // property
    getTextureAtlas:function () {
        return this._textureAtlas;
    },
    setTextureAtlas:function (textureAtlas) {
        if (textureAtlas != this._textureAtlas) {
            this._textureAtlas = textureAtlas;
        }
    },

    getDescendants:function () {
        return  this._descendants;
    },

    /** initializes a CCSpriteBatchNode with a texture2d and capacity of children.
     The capacity will be increased in 33% in runtime if it run out of space.
     */
    initWithTexture:function (tex, capacity) {
        this._children = [];
        this._descendants = [];

        this._blendFunc.src = cc.BLEND_SRC;
        this._blendFunc.dst = cc.BLEND_DST;
        this._textureAtlas = new cc.TextureAtlas();
        this._textureAtlas.initWithTexture(tex, capacity);

        if (cc.renderContextType == cc.WEBGL) {
            this._updateBlendFunc();
        }
        // no lazy alloc in this node
        return true;
    },

    setNodeDirty:function () {
        this._setNodeDirtyForCache();
        this._isTransformDirty = this._isInverseDirty = true;
        if (cc.NODE_TRANSFORM_USING_AFFINE_MATRIX) {
            this._isTransformGLDirty = true;
        }
    },

    _setNodeDirtyForCache:function () {
        this._isCacheDirty = true;
    },

    setContentSizeInPixels:function (size) {
        if (!size) {
            return;
        }

        //if (!cc.Size.CCSizeEqualToSize(size, this._contentSize)) {
        this._super(size);
        this._renderTexture.setContentSize(size);
        //}
    },

    /** initializes a CCSpriteBatchNode with a file image (.png, .jpeg, .pvr, etc) and a capacity of children.
     The capacity will be increased in 33% in runtime if it run out of space.
     The file will be loaded using the TextureMgr.
     */
    initWithFile:function (fileImage, capacity) {
        var texture2D = cc.TextureCache.sharedTextureCache().textureForKey(fileImage);
        if (!texture2D)
            texture2D = cc.TextureCache.sharedTextureCache().addImage(fileImage);
        return this.initWithTexture(texture2D, capacity);
    },

    increaseAtlasCapacity:function () {
        // if we're going beyond the current TextureAtlas's capacity,
        // all the previously initialized sprites will need to redo their texture coords
        // this is likely computationally expensive
        var quantity = (this._textureAtlas.getCapacity() + 1) * 4 / 3;

        cc.LOG("cocos2d: CCSpriteBatchNode: resizing TextureAtlas capacity from " + this._textureAtlas.getCapacity() + " to [" + quantity + "].");

        if (!this._textureAtlas.resizeCapacity(quantity)) {
            // serious problems
            cc.LOG("cocos2d: WARNING: Not enough memory to resize the atlas");
            cc.Assert(false, "Not enough memory to resize the atla");
        }
    },

    /** removes a child given a certain index. It will also cleanup the running actions depending on the cleanup parameter.
     @warning Removing a child from a CCSpriteBatchNode is very slow
     */
    removeChildAtIndex:function (index, doCleanup) {
        //TODO index
        this.removeChild(this._children[index], doCleanup);
    },

    // add child helper
    insertChild:function (sprite, index) {
        sprite.useBatchNode(this);
        sprite.setAtlasIndex(index);
        sprite.setDirty(true);

        if (this._textureAtlas.getTotalQuads() == this._textureAtlas.getCapacity()) {
            this.increaseAtlasCapacity();
        }

        var quad = sprite.getQuad();
        this._textureAtlas.insertQuad(quad, index);

        this._descendants = cc.ArrayAppendObjectToIndex(this._descendants, sprite, index);
        //this._descendants.insertObject(sprite, index);

        // update indices
        var i = 0;
        if (this._descendants && this._descendants.length > 0) {
            for (var index = 0; index < this._descendants.length; index++) {
                var obj = this._descendants[index];
                if (obj) {
                    if (i > index) {
                        obj.setAtlasIndex(obj.getAtlasIndex() + 1);
                    }
                    ++i;
                }
            }
        }

        // add children recursively
        var children = sprite.getChildren();
        if (children && children.length > 0) {
            for (index = 0; index < this._descendants.length; index++) {
                obj = this._descendants[index];
                if (obj) {
                    var getIndex = this.atlasIndexForChild(obj, obj.getZOrder());
                    this.insertChild(obj, getIndex);
                }
            }
        }
    },
    removeSpriteFromAtlas:function (sprite) {
        // remove from TextureAtlas
        this._textureAtlas.removeQuadAtIndex(sprite.getAtlasIndex());

        // Cleanup sprite. It might be reused (issue #569)
        sprite.useSelfRender();

        var index = cc.ArrayGetIndexOfObject(this._descendants, sprite);
        if (index != -1) {
            cc.ArrayRemoveObjectAtIndex(this._descendants, index);

            // update all sprites beyond this one
            var len = this._descendants.length;
            for (; index < len; ++index) {
                var s = this._descendants[index];
                s.setAtlasIndex(s.getAtlasIndex() - 1);
            }
        }

        // remove children recursively
        var children = sprite.getChildren();
        if (children && children.length > 0) {
            for (var i = 0; i < children.length; i++) {
                if (children[i]) {
                    this.removeSpriteFromAtlas(children[i]);
                }
            }
        }
    },

    rebuildIndexInOrder:function (pobParent, index) {

        var children = pobParent.getChildren();

        if (children && children.length > 0) {
            for (var i = 0; i < children.length; i++) {
                var obj = children[i];
                if (obj && (obj.getZOrder() < 0)) {
                    index = this.rebuildIndexInOrder(obj, index);
                }
            }
        }

        // ignore self (batch node)
        if (!pobParent.isEqual(this)) {
            pobParent.setAtlasIndex(index);
            index++;
        }

        if (children && children.length > 0) {
            for (i = 0; i < children.length; i++) {
                obj = children[i];
                if (obj && (obj.getZOrder() >= 0)) {
                    index = this.rebuildIndexInOrder(obj, index);
                }
            }
        }

        return index;
    },
    highestAtlasIndexInChild:function (sprite) {
        var children = sprite.getChildren();

        if (!children || children.length == 0) {
            return sprite.getAtlasIndex();
        } else {
            return this.highestAtlasIndexInChild(children.pop());
        }
    },
    lowestAtlasIndexInChild:function (sprite) {
        var children = sprite.getChildren();

        if (!children || children.length == 0) {
            return sprite.getAtlasIndex();
        } else {
            return this.lowestAtlasIndexInChild(children.pop());
        }
    },

    atlasIndexForChild:function (sprite, nZ) {
        var brothers = sprite.getParent().getChildren();
        var childIndex = cc.ArrayGetIndexOfObject(brothers, sprite);

        // ignore parent Z if parent is spriteSheet
        var ignoreParent = sprite.getParent() == this;
        var previous = null;
        if (childIndex > 0 && childIndex < cc.UINT_MAX) {
            previous = brothers[childIndex - 1];
        }

        // first child of the sprite sheet
        if (ignoreParent) {
            if (childIndex == 0) {
                return 0;
            }
            return this.highestAtlasIndexInChild(previous) + 1;
        }

        // parent is a CCSprite, so, it must be taken into account
        // first child of an CCSprite ?
        if (childIndex == 0) {
            var p = sprite.getParent();

            // less than parent and brothers
            if (nZ < 0) {
                return p.getAtlasIndex();
            } else {
                return p.getAtlasIndex() + 1;
            }
        } else {
            // previous & sprite belong to the same branch
            if ((previous.getZOrder() < 0 && nZ < 0) || (previous.getZOrder() >= 0 && nZ >= 0)) {
                return this.highestAtlasIndexInChild(previous) + 1;
            }

            // else (previous < 0 and sprite >= 0 )
            var p = sprite.getParent();
            return p.getAtlasIndex() + 1;
        }

        // Should not happen. Error calculating Z on SpriteSheet
        cc.Assert(0, "CCSpriteBatchNode.atlasIndexForChild():should not run here");
        return 0;
    },

    // CCTextureProtocol
    getTexture:function () {
        return this._textureAtlas.getTexture();
    },
    setTexture:function (texture) {
        this._textureAtlas.setTexture(texture);
        for (var i = 0; i < this._children.length; i++) {
            this._children[i].setTexture(texture);
        }
        //this._updateBlendFunc();
    },
    setBlendFunc:function (blendFunc) {
        this._blendFunc = blendFunc;
    },
    getBlendFunc:function () {
        return this._blendFunc;
    },

    // override visit
    // don't call visit on it's children
    visit:function (ctx) {
        if (cc.renderContextType == cc.CANVAS) {
            var context = ctx || cc.renderContext;
            // quick return if not visible
            if (!this._isVisible) {
                return;
            }
            context.save();
            if (this._grid && this._grid.isActive()) {
                this._grid.beforeDraw();
                this.transformAncestors();
            }
            this.transform();

            if (this._isUseCache) {
                if (this._isCacheDirty) {
                    //add dirty region
                    this._renderTexture.clear();
                    this._renderTexture.context.translate(this._anchorPointInPixels.x, -this._anchorPointInPixels.y);
                    if (this._children) {
                        // draw children zOrder < 0
                        for (var i = 0; i < this._children.length; i++) {
                            var node = this._children[i];
                            if (node && node._zOrder < 0) {
                                node.visit(this._renderTexture.context);
                            }
                        }
                    }
                    // draw children zOrder >= 0
                    if (this._children) {
                        for (i = 0; i < this._children.length; i++) {
                            node = this._children[i];
                            if (node && node._zOrder >= 0) {
                                node.visit(this._renderTexture.context);
                            }
                        }
                    }
                    this._isCacheDirty = false;
                }
                // draw RenderTexture
                this.draw();
            } else {
                if (this._children) {
                    // draw children zOrder < 0
                    for (var i = 0; i < this._children.length; i++) {
                        var node = this._children[i];
                        if (node && node._zOrder < 0) {
                            node.visit(context);
                        }
                    }
                }

                // draw children zOrder >= 0
                if (this._children) {
                    for (var i = 0; i < this._children.length; i++) {
                        var node = this._children[i];
                        if (node && node._zOrder >= 0) {
                            node.visit(context);
                        }
                    }
                }
            }


            if (this._grid && this._grid.isActive()) {
                this._grid.afterDraw(this);
            }
            context.restore();
        }
    },

    addChild:function (child, zOrder, tag) {
        switch (arguments.length) {
            case 1:
                this._super(child);
                break;
            case 2:
                this._super(child, zOrder);
                break;
            case 3:
                cc.Assert(child != null, "SpriteBatchNode.addChild():child should not be null");

                var sprite = child;
                // check CCSprite is using the same texture id
                if (cc.renderContextType != cc.CANVAS) {
                    cc.Assert(sprite.getTexture().getName() == this._textureAtlas.getTexture().getName(),
                        "SpriteBatchNode.addChild():check CCSprite is using the same texture id");
                }

                this._super(child, zOrder, tag);

                var index = this.atlasIndexForChild(sprite, zOrder);
                this.insertChild(sprite, index);
                break;
            case 4:
                if (arguments[3]) {
                    this._super(child, zOrder, tag);
                }
                break;
            default:
                throw "Argument must be non-nil ";
                break;
        }

        //this._addDirtyRegionToDirector(this.boundingBoxToWorld());
        this.setNodeDirty();
    },

    // override reorderChild
    reorderChild:function (child, zOrder) {
        cc.Assert(child != null, "SpriteBatchNode.addChild():the child should not be null");
        cc.Assert(this._children.indexOf(child) > -1, "SpriteBatchNode.addChild():sprite batch node should contain the child");

        if (zOrder == child.getZOrder()) {
            return;
        }

        //save dirty region when before change
        //this._addDirtyRegionToDirector(this.boundingBoxToWorld());

        // xxx: instead of removing/adding, it is more efficient ot reorder manually
        this.removeChild(child, false);
        this.addChild(child, zOrder);

        //save dirty region when after changed
        //this._addDirtyRegionToDirector(this.boundingBoxToWorld());
        this.setNodeDirty();
    },

    // override remove child
    removeChild:function (child, cleanup) {
        // explicit null handling
        if (child == null) {
            return;
        }
        cc.Assert(this._children.indexOf(child) > -1, "SpriteBatchNode.addChild():sprite batch node should contain the child");

        // cleanup before removing
        this.removeSpriteFromAtlas(child);

        this._super(child, cleanup);
    },
    removeAllChildrenWithCleanup:function (cleanup) {
        // Invalidate atlas index. issue #569
        if (this._children && this._children.length > 0) {
            for (var i = 0; i < this._children.length; i++) {
                var obj = this._children[i];
                if (obj) {
                    this.removeSpriteFromAtlas(obj);
                }
            }
        }

        this._super(cleanup);
        this._descendants = [];
        this._textureAtlas.removeAllQuads();
    },

    // draw
    draw:function (ctx) {
        this._super();

        if (cc.renderContextType == cc.CANVAS) {
            var context = ctx || cc.renderContext;
            //context.globalAlpha = this._opacity / 255;
            var pos = new cc.Point(0 | ( -this._anchorPointInPixels.x), 0 | ( -this._anchorPointInPixels.y));
            if (this._renderTexture) {
                //direct draw image by canvas drawImage
                context.drawImage(this._renderTexture.getCanvas(), pos.x, -(pos.y + this._renderTexture.getCanvas().height));
            }

            /*
             var pAp = cc.PointZero();
             if (this.getParent()) {
             pAp = this.getParent().getAnchorPointInPixels();
             }
             for (var index = 0; index < this._children.length; index++) {
             var sp = this._children[index];
             if (sp.getIsVisible()) {
             cc.saveContext();
             cc.renderContext.translate(sp.getPositionX() - pAp.x, -(sp.getPositionY() - pAp.y ));

             cc.renderContext.scale(sp.getScaleX(), sp.getScaleY());
             cc.renderContext.transform(1.0, -Math.tan(cc.DEGREES_TO_RADIANS(sp.getSkewY())), -Math.tan(cc.DEGREES_TO_RADIANS(sp.getSkewX())), 1.0, 0, 0);

             cc.renderContext.rotate(cc.DEGREES_TO_RADIANS(sp.getRotation()));
             cc.renderContext.globalAlpha = sp.getOpacity() / 255;
             if (sp._flipX) {
             cc.renderContext.scale(-1, 1);
             }
             if (sp._flipY) {
             cc.renderContext.scale(1, -1);
             }

             if ((sp.getContentSize().width == 0) && (sp.getContentSize().height == 0)) {
             cc.drawingUtil.drawImage(sp.getTexture(), cc.ccp(0 - sp.getAnchorPointInPixels().x, 0 - sp.getAnchorPointInPixels().y));
             } else {
             cc.drawingUtil.drawImage(sp.getTexture(), sp.getTextureRect().origin, sp.getTextureRect().size
             , cc.ccp(0 - sp.getAnchorPointInPixels().x, 0 - sp.getAnchorPointInPixels().y), sp.getContentSize());
             }
             cc.restoreContext();
             }
             }
             */
        } else {
            // Optimization: Fast Dispatch
            if (this._textureAtlas.getTotalQuads() == 0) {
                return;
            }

            if (this._descendants && this._descendants.length > 0) {
                var obj = null;
                for (var i = 0; i < this._descendants.length; i++) {
                    obj = this._descendants[i];
                    if (obj) {
                        obj.updateTransform();

                        // issue #528
                        var rect = obj.boundingBox();
                        var vertices = [
                            cc.ccp(rect.origin.x, rect.origin.y),
                            cc.ccp(rect.origin.x + rect.size.width, rect.origin.y),
                            cc.ccp(rect.origin.x + rect.size.width, rect.origin.y + rect.size.height),
                            cc.ccp(rect.origin.x, rect.origin.y + rect.size.height)
                        ];
                        cc.drawingUtil.drawPoly(vertices, 4, true);
                    }
                }
            }

            // Default GL states: GL_TEXTURE_2D, GL_VERTEX_ARRAY, GL_COLOR_ARRAY, GL_TEXTURE_COORD_ARRAY
            // Needed states: GL_TEXTURE_2D, GL_VERTEX_ARRAY, GL_COLOR_ARRAY, GL_TEXTURE_COORD_ARRAY
            // Unneeded states: -
            //TODO OpenGL Method
            var newBlend = this._blendFunc.src != cc.BLEND_SRC || this._blendFunc.dst != cc.BLEND_DST;
            if (newBlend) {
                //glBlendFunc(m_blendFunc.src, m_blendFunc.dst);
            }

            this._textureAtlas.drawQuads();
            if (newBlend) {
                //glBlendFunc(CC_BLEND_SRC, CC_BLEND_DST);
            }
        }
    }
});

/** creates a CCSpriteBatchNode with a texture2d and a default capacity of 29 children.
 The capacity will be increased in 33% in runtime if it run out of space.
 */
cc.SpriteBatchNode.batchNodeWithTexture = function (tex, capacity) {
    if (!capacity) {
        capacity = cc.defaultCapacity;
    }

    var batchNode = new cc.SpriteBatchNode();
    batchNode.initWithTexture(tex, capacity);

    return batchNode;
};

/** creates a CCSpriteBatchNode with a file image (.png, .jpeg, .pvr, etc) with a default capacity of 29 children.
 The capacity will be increased in 33% in runtime if it run out of space.
 The file will be loaded using the TextureMgr.
 */
cc.SpriteBatchNode.batchNodeWithFile = function (fileImage, capacity) {
    if (!capacity) {
        capacity = cc.defaultCapacity;
    }

    var batchNode = new cc.SpriteBatchNode();
    batchNode.initWithFile(fileImage, capacity);

    return batchNode;
};
cc.share_pobTextureAtlas = function () {
    var shareSpriteBatchNode = new cc.SpriteBatchNode();
    return shareSpriteBatchNode._textureAtlas;
};
