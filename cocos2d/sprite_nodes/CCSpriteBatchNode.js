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

/**
 * @constant
 * @type Number
 */
cc.DEFAULT_SPRITE_BATCH_CAPACITY = 29;

/**
 * <p>
 *     In Canvas render mode ,cc.SpriteBatchNodeCanvas is like a normal node: if it contains children.             <br/>
 *     If its _useCache is set to true, it can cache the result that all children of SpriteBatchNodeCanvas to a canvas <br/>
 *     (often known as "batch draw").<br/>
 *     <br/>
 *     A cc.SpriteBatchNode can reference one and only one texture (one image file, one texture atlas).<br/>
 *     Only the cc.Sprites that are contained in that texture can be added to the cc.SpriteBatchNode.<br/>
 *     All cc.Sprites added to a cc.SpriteBatchNode are drawn in one WebGL draw call. <br/>
 *     If the cc.Sprites are not added to a cc.SpriteBatchNode then an WebGL draw call will be needed for each one, which is less efficient. <br/>
 *     <br/>
 *     Limitations:<br/>
 *       - The only object that is accepted as child (or grandchild, grand-grandchild, etc...) is cc.Sprite or any subclass of cc.Sprite. <br/>
 *          eg: particles, labels and layer can't be added to a cc.SpriteBatchNode. <br/>
 *       - Either all its children are Aliased or Antialiased. It can't be a mix. <br/>
 *          This is because "alias" is a property of the texture, and all the sprites share the same texture. </br>
 * </p>
 * @class
 * @extends cc.Node
 * @example
 * //create a SpriteBatchNode
 * var parent2 = cc.SpriteBatchNodeCanvas.create("res/animations/grossini.png", 50);
 */
cc.SpriteBatchNodeCanvas = cc.Node.extend(/** @lends cc.SpriteBatchNodeCanvas# */{
    /// ---- common properties start ----
    _textureAtlas:null,
    _blendFunc:null,
    // all descendants: chlidren, gran children, etc...
    _descendants:null,

    /**
     * <p>
     *    This is the opposite of "addQuadFromSprite.<br/>
     *    It add the sprite to the children and descendants array, but it doesn't update add it to the texture atlas<br/>
     * </p>
     * @param {cc.Sprite} child
     * @param {Number} z zOrder
     * @param {Number} aTag
     * @return {cc.SpriteBatchNode}
     */
    addSpriteWithoutQuad:function (child, z, aTag) {
        cc.Assert(child != null, "SpriteBatchNode.addQuadFromSprite():Argument must be non-nil");
        cc.Assert((child instanceof cc.Sprite), "cc.SpriteBatchNode only supports cc.Sprites as children");

        // quad index is Z
        child.setAtlasIndex(z);

        // XXX: optimize with a binary search
        var i = 0;
        if (this._descendants && this._descendants.length > 0) {
            for (var index = 0; index < this._descendants.length; index++) {
                var obj = this._descendants[index];
                if (obj && (obj.getAtlasIndex() >= z))
                    ++i;
            }
        }
        this._descendants = cc.ArrayAppendObjectToIndex(this._descendants, child, i);

        // IMPORTANT: Call super, and not self. Avoid adding it to the texture atlas array
        cc.Node.prototype.addChild.call(this, child, z, aTag);

        //#issue 1262 don't use lazy sorting, tiles are added as quads not as sprites, so sprites need to be added in order
        this.reorderBatch(false);
        return this;
    },

    // property
    /**
     * Return TextureAtlas of cc.SpriteBatchNode
     * @return {cc.TextureAtlas}
     */
    getTextureAtlas:function () {
        return this._textureAtlas;
    },

    /**
     * TextureAtlas of cc.SpriteBatchNode setter
     * @param {cc.TextureAtlas} textureAtlas
     */
    setTextureAtlas:function (textureAtlas) {
        if (textureAtlas != this._textureAtlas) {
            this._textureAtlas = textureAtlas;
        }
    },

    /**
     * Return Descendants of cc.SpriteBatchNode
     * @return {Array}
     */
    getDescendants:function () {
        return  this._descendants;
    },

    /**
     * <p>
     *    initializes a cc.SpriteBatchNode with a file image (.png, .jpeg, .pvr, etc) and a capacity of children.<br/>
     *    The capacity will be increased in 33% in runtime if it run out of space.<br/>
     *    The file will be loaded using the TextureMgr.
     * </p>
     * @param {String} fileImage
     * @param {Number} capacity
     * @return {Boolean}
     */
    initWithFile:function (fileImage, capacity) {
        var texture2D = cc.TextureCache.getInstance().textureForKey(fileImage);
        if (!texture2D)
            texture2D = cc.TextureCache.getInstance().addImage(fileImage);
        return this.initWithTexture(texture2D, capacity);
    },

    _setNodeDirtyForCache:function () {
        this._cacheDirty = true;
    },

    /**
     * <p>
     *    initializes a cc.SpriteBatchNode with a file image (.png, .jpeg, .pvr, etc) and a capacity of children.<br/>
     *    The capacity will be increased in 33% in runtime if it run out of space.<br/>
     *    The file will be loaded using the TextureMgr.
     * </p>
     * @param {String} fileImage
     * @param {Number} capacity
     * @return {Boolean}
     */
    init:function (fileImage, capacity) {
        var texture2D = cc.TextureCache.getInstance().textureForKey(fileImage);
        if (!texture2D)
            texture2D = cc.TextureCache.getInstance().addImage(fileImage);
        return this.initWithTexture(texture2D, capacity);
    },

    /**
     * increase Atlas Capacity
     */
    increaseAtlasCapacity:function () {
        // if we're going beyond the current TextureAtlas's capacity,
        // all the previously initialized sprites will need to redo their texture coords
        // this is likely computationally expensive
        var quantity = Math.floor((this._textureAtlas.getCapacity() + 1) * 4 / 3);

        cc.log("cocos2d: CCSpriteBatchNode: resizing TextureAtlas capacity from " + this._textureAtlas.getCapacity() + " to " + quantity + ".");

        if (!this._textureAtlas.resizeCapacity(quantity)) {
            // serious problems
            cc.log("cocos2d: WARNING: Not enough memory to resize the atlas");
            cc.Assert(false, "Not enough memory to resize the atla");
        }
    },

    /**
     * removes a child given a certain index. It will also cleanup the running actions depending on the cleanup parameter.
     * @warning Removing a child from a cc.SpriteBatchNode is very slow
     * @param {Number} index
     * @param {Boolean} doCleanup
     */
    removeChildAtIndex:function (index, doCleanup) {
        this.removeChild(this._children[index], doCleanup);
    },

    /**
     * rebuild index in order for child
     * @param {cc.Sprite} pobParent
     * @param {Number} index
     * @return {Number}
     */
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
        if (!pobParent == this) {
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

    /**
     * get highest atlas index in child
     * @param {cc.Sprite} sprite
     * @return {Number}
     */
    highestAtlasIndexInChild:function (sprite) {
        var children = sprite.getChildren();

        if (!children || children.length == 0)
            return sprite.getAtlasIndex();
        else
            return this.highestAtlasIndexInChild(children[children.length - 1]);
    },

    /**
     * get lowest atlas index in child
     * @param {cc.Sprite} sprite
     * @return {Number}
     */
    lowestAtlasIndexInChild:function (sprite) {
        var children = sprite.getChildren();

        if (!children || children.length == 0)
            return sprite.getAtlasIndex();
        else
            return this.lowestAtlasIndexInChild(children[children.length - 1]);
    },

    /**
     * get atlas index for child
     * @param {cc.Sprite} sprite
     * @param {Number} nZ
     * @return {Number}
     */
    atlasIndexForChild:function (sprite, nZ) {
        var brothers = sprite.getParent().getChildren();
        var childIndex = cc.ArrayGetIndexOfObject(brothers, sprite);

        // ignore parent Z if parent is spriteSheet
        var ignoreParent = sprite.getParent() == this;
        var previous = null;
        if (childIndex > 0 && childIndex < cc.UINT_MAX)
            previous = brothers[childIndex - 1];

        // first child of the sprite sheet
        if (ignoreParent) {
            if (childIndex == 0)
                return 0;
            return this.highestAtlasIndexInChild(previous) + 1;
        }

        // parent is a cc.Sprite, so, it must be taken into account
        // first child of an cc.Sprite ?
        var selParent;
        if (childIndex == 0) {
            selParent = sprite.getParent();

            // less than parent and brothers
            if (nZ < 0)
                return selParent.getAtlasIndex();
            else
                return selParent.getAtlasIndex() + 1;
        } else {
            // previous & sprite belong to the same branch
            if ((previous.getZOrder() < 0 && nZ < 0) || (previous.getZOrder() >= 0 && nZ >= 0))
                return this.highestAtlasIndexInChild(previous) + 1;

            // else (previous < 0 and sprite >= 0 )
            selParent = sprite.getParent();
            return selParent.getAtlasIndex() + 1;
        }
    },

    /**
     * Sprites use this to start sortChildren, don't call this manually
     * @param {Boolean} reorder
     */
    reorderBatch:function (reorder) {
        this._reorderChildDirty = reorder;
    },

    /**
     * set the source blending function for the texture
     * @param {Number | cc.BlendFunc} src
     * @param {Number} dst
     */
    setBlendFunc:function (src, dst) {
        if (arguments.length == 1)
            this._blendFunc = src;
        else
            this._blendFunc = {src:src, dst:dst};
    },

    /**
     * returns the blending function used for the texture
     * @return {cc.BlendFunc}
     */
    getBlendFunc:function () {
        return this._blendFunc;
    },

    /**
     *  (override reorderChild of cc.Node)
     * @override
     * @param {cc.Sprite} child
     * @param {Number} zOrder
     */
    reorderChild:function (child, zOrder) {
        cc.Assert(child != null, "SpriteBatchNode.addChild():the child should not be null");
        cc.Assert(this._children.indexOf(child) > -1, "SpriteBatchNode.addChild():Child doesn't belong to Sprite");

        if (zOrder === child.getZOrder())
            return;

        //set the z-order and sort later
        this._super(child, zOrder);
        this.setNodeDirty();
    },

    /**
     * remove child from cc.SpriteBatchNode (override removeChild of cc.Node)
     * @param {cc.Sprite} child
     * @param cleanup
     */
    removeChild:function (child, cleanup) {
        // explicit null handling
        if (child == null)
            return;

        cc.Assert(this._children.indexOf(child) > -1, "SpriteBatchNode.addChild():sprite batch node should contain the child");

        // cleanup before removing
        this.removeSpriteFromAtlas(child);

        this._super(child, cleanup);
    },
    /// ---- common properties end   ----

    _textureForCanvas:null,
    _renderTexture:null,
    _useCache:false,
    _originalTexture:null,

    /**
     * Constructor
     * @param {String} fileImage
     */
    ctor:function (fileImage) {
        this._super();
        if (fileImage)
            this.init(fileImage, cc.DEFAULT_SPRITE_BATCH_CAPACITY);

        this._renderTexture = cc.RenderTexture.create(cc.canvas.width, cc.canvas.height);
        this.setContentSize(cc.size(cc.canvas.width, cc.canvas.height));
    },

    /**
     * <p>
     *   Updates a quad at a certain index into the texture atlas. The CCSprite won't be added into the children array.                 <br/>
     *   This method should be called only when you are dealing with very big AtlasSrite and when most of the cc.Sprite won't be updated.<br/>
     *   For example: a tile map (cc.TMXMap) or a label with lots of characters (BitmapFontAtlas)<br/>
     * </p>
     * @param {cc.Sprite} sprite
     * @param {Number} index
     */
    updateQuadFromSprite:function (sprite, index) {
        cc.Assert(sprite != null, "SpriteBatchNode.addQuadFromSprite():Argument must be non-nil");
        cc.Assert((sprite instanceof cc.Sprite), "cc.SpriteBatchNode only supports cc.Sprites as children");

        //
        // update the quad directly. Don't add the sprite to the scene graph
        //
        sprite.setBatchNode(this);
        sprite.setAtlasIndex(index);

        sprite.setDirty(true);
        // UpdateTransform updates the textureAtlas quad
        sprite.updateTransform();
    },

    /**
     * <p>
     *    Inserts a quad at a certain index into the texture atlas. The cc.Sprite won't be added into the children array.                    <br/>
     *    This method should be called only when you are dealing with very big AtlasSprite and when most of the cc.Sprite won't be updated.  <br/>
     *    For example: a tile map (cc.TMXMap) or a label with lots of characters (cc.LabelBMFont)
     * </p>
     * @param {cc.Sprite} sprite
     * @param {Number} index
     */
    insertQuadFromSprite:function (sprite, index) {
        cc.Assert(sprite != null, "Argument must be non-NULL");
        cc.Assert(sprite instanceof cc.Sprite, "cc.SpriteBatchNode only supports cc.Sprites as children");

        //
        // update the quad directly. Don't add the sprite to the scene graph
        //
        sprite.setBatchNode(this);
        sprite.setAtlasIndex(index);

        // XXX: updateTransform will update the textureAtlas too, using updateQuad.
        // XXX: so, it should be AFTER the insertQuad
        sprite.setDirty(true);
        sprite.updateTransform();
        this._children = cc.ArrayAppendObjectToIndex(this._children, sprite, index);
    },

    setContentSize:function (size) {
        if (!size)
            return;
        this._super(size);
        this._renderTexture.setContentSize(size);
    },

    /**
     * <p>
     *    initializes a CCSpriteBatchNode with a texture2d and capacity of children.<br/>
     *    The capacity will be increased in 33% in runtime if it run out of space.
     * </p>
     * @param {cc.Texture2D} tex
     * @param {Number} capacity
     * @return {Boolean}
     */
    initWithTexture:function (tex, capacity) {
        this._children = [];
        this._descendants = [];

        this._blendFunc = new cc.BlendFunc(cc.BLEND_SRC, cc.BLEND_DST);

        this._originalTexture = tex;
        this._textureForCanvas = tex;
        return true;
    },

    /**
     * addChild helper, faster than insertChild
     * @param {cc.Sprite} sprite
     */
    appendChild:function (sprite) {
        this._reorderChildDirty = true;
        sprite.setBatchNode(this);
        sprite.setDirty(true);

        cc.ArrayAppendObject(this._descendants, sprite);
        var index = this._descendants.length - 1;
        sprite.setAtlasIndex(index);

        // add children recursively
        var children = sprite.getChildren();
        for (var i = 0; i < children.length; i++)
            this.appendChild(children[i]);
    },

    /**
     * remove sprite from TextureAtlas
     * @param {cc.Sprite} sprite
     */
    removeSpriteFromAtlas:function (sprite) {
        // Cleanup sprite. It might be reused (issue #569)
        sprite.setBatchNode(null);

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
            for (var i = 0; i < children.length; i++)
                if (children[i])
                    this.removeSpriteFromAtlas(children[i]);
        }
    },
    // CCTextureProtocol
    /**
     * Return texture of cc.SpriteBatchNode
     * @return {cc.Texture2D|HTMLImageElement|HTMLCanvasElement}
     */
    getTexture:function () {
        if (this._useCache)
            return this._renderTexture.getCanvas();
        return this._textureForCanvas;
    },

    /**
     * texture of cc.SpriteBatchNode setter
     * @param {cc.Texture2D} texture
     */
    setTexture:function (texture) {
        this._textureForCanvas = texture;
        for (var i = 0; i < this._children.length; i++)
            this._children[i].setTexture(texture);
    },

    /**
     * don't call visit on it's children ( override visit of cc.Node )
     * @override
     * @param {CanvasContext} ctx
     */
    visit:function (ctx) {
        var context = ctx || cc.renderContext;
        // quick return if not visible
        if (!this._visible)
            return;

        context.save();
        this.transform(ctx);
        var i;
        if (this._useCache) {
            if (this._cacheDirty) {
                //add dirty region
                this._renderTexture.clear();
                this._renderTexture.context.save();
                this._renderTexture.context.translate(this._anchorPointInPoints.x, -(this._anchorPointInPoints.y ));
                if (this._children) {
                    this.sortAllChildren();
                    for (i = 0; i < this._children.length; i++) {
                        if (this._children[i])
                            this._children[i].visit(this._renderTexture.context);
                    }
                }
                this._renderTexture.context.restore();
                this._cacheDirty = false;
            }
            // draw RenderTexture
            this.draw(ctx);
        } else {
            if (this._children) {
                this.sortAllChildren();
                for (i = 0; i < this._children.length; i++) {
                    if (this._children[i])
                        this._children[i].visit(context);
                }
            }
        }
        context.restore();
    },

    /**
     * add child to cc.SpriteBatchNode (override addChild of cc.Node)
     * @override
     * @param {cc.Sprite} child
     * @param {Number} zOrder
     * @param {Number} tag
     */
    addChild:function (child, zOrder, tag) {
        if (child == null)
            return;

        if (arguments.length === 4)
            if (arguments[3] == true) {
                this._super(child, zOrder, tag);
                this.setNodeDirty();
                return;
            }

        zOrder = (zOrder == null) ? child.getZOrder() : zOrder;
        tag = (tag == null) ? child.getTag() : tag;

        cc.Assert(child != null, "SpriteBatchNode.addChild():child should not be null");
        cc.Assert((child instanceof cc.Sprite), "cc.SpriteBatchNode only supports cc.Sprites as children");

        this._super(child, zOrder, tag);
        this.appendChild(child);
        this.setNodeDirty();
    },

    /**
     * <p>Removes all children from the container and do a cleanup all running actions depending on the cleanup parameter. <br/>
     * (override removeAllChildren of cc.Node)</p>
     * @param {Boolean} cleanup
     */
    removeAllChildren:function (cleanup) {
        // Invalidate atlas index. issue #569
        // useSelfRender should be performed on all descendants. issue #1216
        if (this._descendants && this._descendants.length > 0) {
            for (var i = 0; i < this._descendants.length; i++) {
                if (this._descendants[i])
                    this._descendants[i].setBatchNode(null);
            }
        }

        this._super(cleanup);
        this._descendants = [];
    },

    sortAllChildren:function () {
        if (this._reorderChildDirty) {
            var i = 0, j = 0, length = this._children.length;
            //insertion sort
            for (i = 1; i < length; i++) {
                var tempItem = this._children[i];
                j = i - 1;

                //continue moving element downwards while zOrder is smaller or when zOrder is the same but orderOfArrival is smaller
                while (j >= 0 && (tempItem.getZOrder() < this._children[j].getZOrder() ||
                    (tempItem.getZOrder() == this._children[j].getZOrder() && tempItem.getOrderOfArrival() < this._children[j].getOrderOfArrival()))) {
                    this._children[j + 1] = this._children[j];
                    j--;
                }
                this._children[j + 1] = tempItem;
            }

            //sorted now check all children
            if (this._children.length > 0) {
                //first sort all children recursively based on zOrder
                this._arrayMakeObjectsPerformSelector(this._children, cc.Node.StateCallbackType.sortAllChildren);
            }
            this._reorderChildDirty = false;
        }
    },

    /**
     * draw cc.SpriteBatchNode (override draw of cc.Node)
     * @param {CanvasContext} ctx
     */
    draw:function (ctx) {
        var context = ctx || cc.renderContext;
        //context.globalAlpha = this._opacity / 255;
        var pos = cc.p(0 | ( -this._anchorPointInPoints.x), 0 | ( -this._anchorPointInPoints.y));
        //direct draw image by canvas drawImage
        if (this._renderTexture)
            context.drawImage(this._renderTexture.getCanvas(), pos.x, -(pos.y + this._renderTexture.getCanvas().height));
    }
});

/**
 * <p>
 *    creates a cc.SpriteBatchNodeCanvas with a file image (.png, .jpg etc) with a default capacity of 29 children.<br/>
 *    The capacity will be increased in 33% in runtime if it run out of space.<br/>
 *    The file will be loaded using the TextureMgr.<br/>
 * </p>
 * @param {String} fileImage
 * @param {Number} capacity
 * @return {cc.SpriteBatchNodeCanvas}
 * @example
 * //create a SpriteBatchNode
 * var parent2 = cc.SpriteBatchNode.create("res/animations/grossini.png", 50);
 */
cc.SpriteBatchNodeCanvas.create = function (fileImage, capacity) {
    capacity = capacity || cc.DEFAULT_SPRITE_BATCH_CAPACITY;
    var batchNode = new cc.SpriteBatchNodeCanvas();
    batchNode.init(fileImage, capacity);
    return batchNode;
};

/**
 * <p>
 *   creates a cc.SpriteBatchNodeCanvas with a texture2d and a default capacity of 29 children.   <br/>
 *   The capacity will be increased in 33% in runtime if it run out of space.               <br/>
 * </p>
 * @param {cc.Texture2D} texture
 * @param {Number} capacity
 * @return {cc.SpriteBatchNodeCanvas}
 */
cc.SpriteBatchNodeCanvas.createWithTexture = function (texture, capacity) {
    capacity = capacity || cc.DEFAULT_SPRITE_BATCH_CAPACITY;
    var batchNode = new cc.SpriteBatchNodeCanvas();
    batchNode.initWithTexture(texture, capacity);
    return batchNode;
};

/**
 * <p>
 *     In WebGL render mode ,cc.SpriteBatchNode is like a batch node: if it contains children, it will draw them in 1 single OpenGL call<br/>
 *     (often known as "batch draw").<br/>
 *     <br/>
 *     A cc.SpriteBatchNode can reference one and only one texture (one image file, one texture atlas).<br/>
 *     Only the cc.Sprites that are contained in that texture can be added to the cc.SpriteBatchNode.<br/>
 *     All cc.Sprites added to a cc.SpriteBatchNode are drawn in one WebGL draw call. <br/>
 *     If the cc.Sprites are not added to a cc.SpriteBatchNode then an WebGL draw call will be needed for each one, which is less efficient. <br/>
 *     <br/>
 *     Limitations:<br/>
 *       - The only object that is accepted as child (or grandchild, grand-grandchild, etc...) is cc.Sprite or any subclass of cc.Sprite. <br/>
 *          eg: particles, labels and layer can't be added to a cc.SpriteBatchNode. <br/>
 *       - Either all its children are Aliased or Antialiased. It can't be a mix. <br/>
 *          This is because "alias" is a property of the texture, and all the sprites share the same texture. </br>
 * </p>
 * @class
 * @extends cc.Node
 * @example
 * //create a SpriteBatchNodeWebGL
 * var parent2 = cc.SpriteBatchNodeWebGL.create("res/animations/grossini.png", 50);
 */
cc.SpriteBatchNodeWebGL = cc.Node.extend(/** @lends cc.SpriteBatchNodeWebGL# */{
    /// ---- common properties start ----
    _textureAtlas:null,
    _blendFunc:null,
    // all descendants: chlidren, gran children, etc...
    _descendants:null,

    /**
     * <p>
     *    This is the opposite of "addQuadFromSprite.<br/>
     *    It add the sprite to the children and descendants array, but it doesn't update add it to the texture atlas<br/>
     * </p>
     * @param {cc.Sprite} child
     * @param {Number} z zOrder
     * @param {Number} aTag
     * @return {cc.SpriteBatchNode}
     */
    addSpriteWithoutQuad:function (child, z, aTag) {
        cc.Assert(child != null, "SpriteBatchNode.addQuadFromSprite():Argument must be non-nil");
        cc.Assert((child instanceof cc.Sprite), "cc.SpriteBatchNode only supports cc.Sprites as children");

        // quad index is Z
        child.setAtlasIndex(z);

        // XXX: optimize with a binary search
        var i = 0;
        if (this._descendants && this._descendants.length > 0) {
            for (var index = 0; index < this._descendants.length; index++) {
                var obj = this._descendants[index];
                if (obj && (obj.getAtlasIndex() >= z))
                    ++i;
            }
        }
        this._descendants = cc.ArrayAppendObjectToIndex(this._descendants, child, i);

        // IMPORTANT: Call super, and not self. Avoid adding it to the texture atlas array
        cc.Node.prototype.addChild.call(this, child, z, aTag);

        //#issue 1262 don't use lazy sorting, tiles are added as quads not as sprites, so sprites need to be added in order
        this.reorderBatch(false);
        return this;
    },

    // property
    /**
     * Return TextureAtlas of cc.SpriteBatchNode
     * @return {cc.TextureAtlas}
     */
    getTextureAtlas:function () {
        return this._textureAtlas;
    },

    /**
     * TextureAtlas of cc.SpriteBatchNode setter
     * @param {cc.TextureAtlas} textureAtlas
     */
    setTextureAtlas:function (textureAtlas) {
        if (textureAtlas != this._textureAtlas) {
            this._textureAtlas = textureAtlas;
        }
    },

    /**
     * Return Descendants of cc.SpriteBatchNode
     * @return {Array}
     */
    getDescendants:function () {
        return  this._descendants;
    },

    /**
     * <p>
     *    initializes a cc.SpriteBatchNode with a file image (.png, .jpeg, .pvr, etc) and a capacity of children.<br/>
     *    The capacity will be increased in 33% in runtime if it run out of space.<br/>
     *    The file will be loaded using the TextureMgr.
     * </p>
     * @param {String} fileImage
     * @param {Number} capacity
     * @return {Boolean}
     */
    initWithFile:function (fileImage, capacity) {
        var texture2D = cc.TextureCache.getInstance().textureForKey(fileImage);
        if (!texture2D)
            texture2D = cc.TextureCache.getInstance().addImage(fileImage);
        return this.initWithTexture(texture2D, capacity);
    },

    _setNodeDirtyForCache:function () {
        this._cacheDirty = true;
    },

    /**
     * <p>
     *    initializes a cc.SpriteBatchNode with a file image (.png, .jpeg, .pvr, etc) and a capacity of children.<br/>
     *    The capacity will be increased in 33% in runtime if it run out of space.<br/>
     *    The file will be loaded using the TextureMgr.
     * </p>
     * @param {String} fileImage
     * @param {Number} capacity
     * @return {Boolean}
     */
    init:function (fileImage, capacity) {
        var texture2D = cc.TextureCache.getInstance().textureForKey(fileImage);
        if (!texture2D)
            texture2D = cc.TextureCache.getInstance().addImage(fileImage);
        return this.initWithTexture(texture2D, capacity);
    },

    /**
     * increase Atlas Capacity
     */
    increaseAtlasCapacity:function () {
        // if we're going beyond the current TextureAtlas's capacity,
        // all the previously initialized sprites will need to redo their texture coords
        // this is likely computationally expensive
        var quantity = 0 | ((this._textureAtlas.getCapacity() + 1) * 4 / 3);

        cc.log("cocos2d: CCSpriteBatchNode: resizing TextureAtlas capacity from " + this._textureAtlas.getCapacity() + " to [" + quantity + "].");

        if (!this._textureAtlas.resizeCapacity(quantity)) {
            // serious problems
            cc.log("cocos2d: WARNING: Not enough memory to resize the atlas");
            cc.Assert(false, "Not enough memory to resize the atla");
        }
    },

    /**
     * removes a child given a certain index. It will also cleanup the running actions depending on the cleanup parameter.
     * @warning Removing a child from a cc.SpriteBatchNode is very slow
     * @param {Number} index
     * @param {Boolean} doCleanup
     */
    removeChildAtIndex:function (index, doCleanup) {
        this.removeChild(this._children[index], doCleanup);
    },

    /**
     * rebuild index in order for child
     * @param {cc.Sprite} pobParent
     * @param {Number} index
     * @return {Number}
     */
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
        if (!pobParent == this) {
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

    /**
     * get highest atlas index in child
     * @param {cc.Sprite} sprite
     * @return {Number}
     */
    highestAtlasIndexInChild:function (sprite) {
        var children = sprite.getChildren();

        if (!children || children.length == 0)
            return sprite.getAtlasIndex();
        else
            return this.highestAtlasIndexInChild(children[children.length - 1]);
    },

    /**
     * get lowest atlas index in child
     * @param {cc.Sprite} sprite
     * @return {Number}
     */
    lowestAtlasIndexInChild:function (sprite) {
        var children = sprite.getChildren();

        if (!children || children.length == 0)
            return sprite.getAtlasIndex();
        else
            return this.lowestAtlasIndexInChild(children[children.length - 1]);
    },

    /**
     * get atlas index for child
     * @param {cc.Sprite} sprite
     * @param {Number} nZ
     * @return {Number}
     */
    atlasIndexForChild:function (sprite, nZ) {
        var brothers = sprite.getParent().getChildren();
        var childIndex = cc.ArrayGetIndexOfObject(brothers, sprite);

        // ignore parent Z if parent is spriteSheet
        var ignoreParent = sprite.getParent() == this;
        var previous = null;
        if (childIndex > 0 && childIndex < cc.UINT_MAX)
            previous = brothers[childIndex - 1];

        // first child of the sprite sheet
        if (ignoreParent) {
            if (childIndex == 0)
                return 0;
            return this.highestAtlasIndexInChild(previous) + 1;
        }

        // parent is a cc.Sprite, so, it must be taken into account
        // first child of an cc.Sprite ?
        var selParent;
        if (childIndex == 0) {
            selParent = sprite.getParent();

            // less than parent and brothers
            if (nZ < 0)
                return selParent.getAtlasIndex();
            else
                return selParent.getAtlasIndex() + 1;
        } else {
            // previous & sprite belong to the same branch
            if ((previous.getZOrder() < 0 && nZ < 0) || (previous.getZOrder() >= 0 && nZ >= 0))
                return this.highestAtlasIndexInChild(previous) + 1;

            // else (previous < 0 and sprite >= 0 )
            selParent = sprite.getParent();
            return selParent.getAtlasIndex() + 1;
        }
    },

    /**
     * Sprites use this to start sortChildren, don't call this manually
     * @param {Boolean} reorder
     */
    reorderBatch:function (reorder) {
        this._reorderChildDirty = reorder;
    },

    /**
     * set the source blending function for the texture
     * @param {Number | cc.BlendFunc} src
     * @param {Number} dst
     */
    setBlendFunc:function (src, dst) {
        if (arguments.length == 1)
            this._blendFunc = src;
        else
            this._blendFunc = {src:src, dst:dst};
    },

    /**
     * returns the blending function used for the texture
     * @return {cc.BlendFunc}
     */
    getBlendFunc:function () {
        return this._blendFunc;
    },

    /**
     *  (override reorderChild of cc.Node)
     * @override
     * @param {cc.Sprite} child
     * @param {Number} zOrder
     */
    reorderChild:function (child, zOrder) {
        cc.Assert(child != null, "SpriteBatchNode.addChild():the child should not be null");
        cc.Assert(this._children.indexOf(child) > -1, "SpriteBatchNode.addChild():Child doesn't belong to Sprite");

        if (zOrder === child.getZOrder())
            return;

        //set the z-order and sort later
        this._super(child, zOrder);
        this.setNodeDirty();
    },

    /**
     * remove child from cc.SpriteBatchNode (override removeChild of cc.Node)
     * @param {cc.Sprite} child
     * @param cleanup
     */
    removeChild:function (child, cleanup) {
        // explicit null handling
        if (child == null)
            return;

        cc.Assert(this._children.indexOf(child) > -1, "SpriteBatchNode.addChild():sprite batch node should contain the child");

        // cleanup before removing
        this.removeSpriteFromAtlas(child);

        this._super(child, cleanup);
    },
    /// ---- common properties end   ----

    /**
     * Constructor
     * @param {String} fileImage
     */
    ctor:function (fileImage) {
        this._super();
        if (fileImage)
            this.init(fileImage, cc.DEFAULT_SPRITE_BATCH_CAPACITY);
    },

    /**
     * <p>
     *   Updates a quad at a certain index into the texture atlas. The CCSprite won't be added into the children array.                 <br/>
     *   This method should be called only when you are dealing with very big AtlasSrite and when most of the cc.Sprite won't be updated.<br/>
     *   For example: a tile map (cc.TMXMap) or a label with lots of characters (BitmapFontAtlas)<br/>
     * </p>
     * @param {cc.Sprite} sprite
     * @param {Number} index
     */
    updateQuadFromSprite:function (sprite, index) {
        cc.Assert(sprite != null, "SpriteBatchNode.addQuadFromSprite():Argument must be non-nil");
        cc.Assert((sprite instanceof cc.Sprite), "cc.SpriteBatchNode only supports cc.Sprites as children");

        // make needed room
        while (index >= this._textureAtlas.getCapacity() || this._textureAtlas.getCapacity() == this._textureAtlas.getTotalQuads()) {
            this.increaseAtlasCapacity();
        }

        //
        // update the quad directly. Don't add the sprite to the scene graph
        //
        sprite.setBatchNode(this);
        sprite.setAtlasIndex(index);

        sprite.setDirty(true);
        // UpdateTransform updates the textureAtlas quad
        sprite.updateTransform();
    },

    _swap:function (oldIndex, newIndex) {
        var quads = this._textureAtlas.getQuads();
        var tempItem = this._descendants[oldIndex];
        var tempIteQuad = quads[oldIndex];

        //update the index of other swapped item
        this._descendants[newIndex].setAtlasIndex(oldIndex);
        this._descendants[oldIndex] = this._descendants[newIndex];

        this._textureAtlas.updateQuad(quads[newIndex], oldIndex);
        this._descendants[newIndex] = tempItem;
        this._textureAtlas.updateQuad(tempIteQuad, newIndex);
    },

    /**
     * <p>
     *    Inserts a quad at a certain index into the texture atlas. The cc.Sprite won't be added into the children array.                    <br/>
     *    This method should be called only when you are dealing with very big AtlasSprite and when most of the cc.Sprite won't be updated.  <br/>
     *    For example: a tile map (cc.TMXMap) or a label with lots of characters (cc.LabelBMFont)
     * </p>
     * @param {cc.Sprite} sprite
     * @param {Number} index
     */
    insertQuadFromSprite:function (sprite, index) {
        cc.Assert(sprite != null, "Argument must be non-NULL");
        cc.Assert(sprite instanceof cc.Sprite, "cc.SpriteBatchNode only supports cc.Sprites as children");

        // make needed room
        while (index >= this._textureAtlas.getCapacity() || this._textureAtlas.getCapacity() === this._textureAtlas.getTotalQuads())
            this.increaseAtlasCapacity();

        //
        // update the quad directly. Don't add the sprite to the scene graph
        //
        sprite.setBatchNode(this);
        sprite.setAtlasIndex(index);
        this._textureAtlas.insertQuad(sprite.getQuad(), index);

        // XXX: updateTransform will update the textureAtlas too, using updateQuad.
        // XXX: so, it should be AFTER the insertQuad
        sprite.setDirty(true);
        sprite.updateTransform();
    },

    _updateAtlasIndex:function (sprite, curIndex) {
        var count = 0;
        var pArray = sprite.getChildren();
        if (pArray)
            count = pArray.length;

        var oldIndex = 0;
        if (count == 0) {
            oldIndex = sprite.getAtlasIndex();
            sprite.setAtlasIndex(curIndex);
            sprite.setOrderOfArrival(0);
            if (oldIndex != curIndex)
                this._swap(oldIndex, curIndex);
            curIndex++;
        } else {
            var needNewIndex = true;
            if (pArray[0].getZOrder() >= 0) {
                //all children are in front of the parent
                oldIndex = sprite.getAtlasIndex();
                sprite.setAtlasIndex(curIndex);
                sprite.setOrderOfArrival(0);
                if (oldIndex != curIndex)
                    this._swap(oldIndex, curIndex);
                curIndex++;
                needNewIndex = false;
            }
            for (var i = 0; i < pArray.length; i++) {
                var child = pArray[i];
                if (needNewIndex && child.getZOrder() >= 0) {
                    oldIndex = sprite.getAtlasIndex();
                    sprite.setAtlasIndex(curIndex);
                    sprite.setOrderOfArrival(0);
                    if (oldIndex != curIndex) {
                        this._swap(oldIndex, curIndex);
                    }
                    curIndex++;
                    needNewIndex = false;
                }
                curIndex = this._updateAtlasIndex(child, curIndex);
            }

            if (needNewIndex) {
                //all children have a zOrder < 0)
                oldIndex = sprite.getAtlasIndex();
                sprite.setAtlasIndex(curIndex);
                sprite.setOrderOfArrival(0);
                if (oldIndex != curIndex) {
                    this._swap(oldIndex, curIndex);
                }
                curIndex++;
            }
        }

        return curIndex;
    },

    _updateBlendFunc:function () {
        if (!this._textureAtlas.getTexture().hasPremultipliedAlpha()) {
            this._blendFunc.src = gl.SRC_ALPHA;
            this._blendFunc.dst = gl.ONE_MINUS_SRC_ALPHA;
        }
    },

    /**
     * <p>
     *    initializes a CCSpriteBatchNode with a texture2d and capacity of children.<br/>
     *    The capacity will be increased in 33% in runtime if it run out of space.
     * </p>
     * @param {cc.Texture2D} tex
     * @param {Number} capacity
     * @return {Boolean}
     */
    initWithTexture:function (tex, capacity) {
        this._children = [];
        this._descendants = [];

        this._blendFunc = new cc.BlendFunc(cc.BLEND_SRC, cc.BLEND_DST);
        capacity = capacity || cc.DEFAULT_SPRITE_BATCH_CAPACITY;
        this._textureAtlas = new cc.TextureAtlas();
        this._textureAtlas.initWithTexture(tex, capacity);
        this._updateBlendFunc();
        this.setShaderProgram(cc.ShaderCache.getInstance().programForKey(cc.SHADER_POSITION_TEXTURECOLOR));
        return true;
    },
    /**
     * add child helper
     * @param {cc.Sprite} sprite
     * @param {Number} index
     */
    insertChild:function (sprite, index) {
        sprite.setBatchNode(this);
        sprite.setAtlasIndex(index);
        sprite.setDirty(true);

        if (this._textureAtlas.getTotalQuads() == this._textureAtlas.getCapacity())
            this.increaseAtlasCapacity();

        this._textureAtlas.insertQuad(sprite.getQuad(), index);
        this._descendants = cc.ArrayAppendObjectToIndex(this._descendants, sprite, index);

        // update indices
        var i = index + 1;
        if (this._descendants && this._descendants.length > 0) {
            for (; i < this._descendants.length; i++)
                this._descendants[i].setAtlasIndex(this._descendants[i].getAtlasIndex() + 1);
        }

        // add children recursively
        var children = sprite.getChildren();
        if (children && children.length > 0) {
            for (i = 0; i < children.length; i++) {
                if (children[i]) {
                    var getIndex = this.atlasIndexForChild(children[i], children[i].getZOrder());
                    this.insertChild(children[i], getIndex);
                }
            }
        }
    },

    /**
     * addChild helper, faster than insertChild
     * @param {cc.Sprite} sprite
     */
    appendChild:function (sprite) {
        this._reorderChildDirty = true;
        sprite.setBatchNode(this);
        sprite.setDirty(true);

        cc.ArrayAppendObject(this._descendants, sprite);
        var index = this._descendants.length - 1;
        sprite.setAtlasIndex(index);

        if (this._textureAtlas.getTotalQuads() == this._textureAtlas.getCapacity())
            this.increaseAtlasCapacity();
        this._textureAtlas.insertQuad(sprite.getQuad(), index);

        // add children recursively
        var children = sprite.getChildren();
        for (var i = 0; i < children.length; i++)
            this.appendChild(children[i]);
    },

    /**
     * remove sprite from TextureAtlas
     * @param {cc.Sprite} sprite
     */
    removeSpriteFromAtlas:function (sprite) {
        this._textureAtlas.removeQuadAtIndex(sprite.getAtlasIndex());   // remove from TextureAtlas

        // Cleanup sprite. It might be reused (issue #569)
        sprite.setBatchNode(null);

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
            for (var i = 0; i < children.length; i++)
                if (children[i])
                    this.removeSpriteFromAtlas(children[i]);
        }
    },

    // CCTextureProtocol
    /**
     * Return texture of cc.SpriteBatchNode
     * @return {cc.Texture2D|HTMLImageElement|HTMLCanvasElement}
     */
    getTexture:function () {
        return this._textureAtlas.getTexture();
    },

    /**
     * texture of cc.SpriteBatchNode setter
     * @param {cc.Texture2D} texture
     */
    setTexture:function (texture) {
        this._textureAtlas.setTexture(texture);
        this._updateBlendFunc();
    },

    /**
     * don't call visit on it's children ( override visit of cc.Node )
     * @override
     * @param {CanvasContext} ctx
     */
    visit:function (ctx) {
        var gl = ctx || cc.renderContext;
        //cc.PROFILER_START_CATEGORY(kCCProfilerCategoryBatchSprite, "CCSpriteBatchNode - visit");

        // CAREFUL:
        // This visit is almost identical to CocosNode#visit
        // with the exception that it doesn't call visit on it's children
        //
        // The alternative is to have a void CCSprite#visit, but
        // although this is less mantainable, is faster
        //
        if (!this._visible)
            return;
        cc.kmGLPushMatrix();
        if (this._grid && this._grid.isActive()) {
            this._grid.beforeDraw();
            this.transformAncestors();
        }
        this.sortAllChildren();
        this.transform(gl);
        this.draw(gl);
        if (this._grid && this._grid.isActive())
            this._grid.afterDraw(this);
        cc.kmGLPopMatrix();
        this.setOrderOfArrival(0);
        //cc.PROFILER_STOP_CATEGORY(kCCProfilerCategoryBatchSprite, "CCSpriteBatchNode - visit");
    },

    /**
     * add child to cc.SpriteBatchNode (override addChild of cc.Node)
     * @override
     * @param {cc.Sprite} child
     * @param {Number} zOrder
     * @param {Number} tag
     */
    addChild:function (child, zOrder, tag) {
        if (child == null)
            return;

        if (arguments.length === 4)
            if (arguments[3] == true) {
                this._super(child, zOrder, tag);
                this.setNodeDirty();
                return;
            }

        zOrder = (zOrder == null) ? child.getZOrder() : zOrder;
        tag = (tag == null) ? child.getTag() : tag;

        cc.Assert(child != null, "SpriteBatchNode.addChild():child should not be null");
        cc.Assert((child instanceof cc.Sprite), "cc.SpriteBatchNode only supports cc.Sprites as children");

        // check cc.Sprite is using the same texture id
        cc.Assert(child.getTexture()._webTextureObj == this._textureAtlas.getTexture()._webTextureObj,
            "SpriteBatchNode.addChild():cc.Sprite is not using the same texture id");
        this._super(child, zOrder, tag);
        this.appendChild(child);
        this.setNodeDirty();
    },

    /**
     * <p>Removes all children from the container and do a cleanup all running actions depending on the cleanup parameter. <br/>
     * (override removeAllChildren of cc.Node)</p>
     * @param {Boolean} cleanup
     */
    removeAllChildren:function (cleanup) {
        // Invalidate atlas index. issue #569
        // useSelfRender should be performed on all descendants. issue #1216
        if (this._descendants && this._descendants.length > 0) {
            for (var i = 0; i < this._descendants.length; i++) {
                if (this._descendants[i])
                    this._descendants[i].setBatchNode(null);
            }
        }
        this._super(cleanup);
        this._descendants = [];
        this._textureAtlas.removeAllQuads();
    },

    sortAllChildren:function () {
        if (this._reorderChildDirty) {
            var i = 0, j = 0, length = this._children.length;
            //insertion sort
            for (i = 1; i < length; i++) {
                var tempItem = this._children[i];
                j = i - 1;

                //continue moving element downwards while zOrder is smaller or when zOrder is the same but orderOfArrival is smaller
                while (j >= 0 && (tempItem.getZOrder() < this._children[j].getZOrder() ||
                    (tempItem.getZOrder() == this._children[j].getZOrder() && tempItem.getOrderOfArrival() < this._children[j].getOrderOfArrival()))) {
                    this._children[j + 1] = this._children[j];
                    j--;
                }
                this._children[j + 1] = tempItem;
            }

            //sorted now check all children
            if (this._children.length > 0) {
                //first sort all children recursively based on zOrder
                this._arrayMakeObjectsPerformSelector(this._children, cc.Node.StateCallbackType.sortAllChildren);

                var index = 0;
                //fast dispatch, give every child a new atlasIndex based on their relative zOrder (keep parent -> child relations intact)
                // and at the same time reorder descedants and the quads to the right index
                for (i = 0; i < this._children.length; i++)
                    index = this._updateAtlasIndex(this._children[i], index);
            }
            this._reorderChildDirty = false;
        }
    },
    /**
     * draw cc.SpriteBatchNode (override draw of cc.Node)
     * @param {CanvasContext} ctx
     */
    draw:function (ctx) {
        // Optimization: Fast Dispatch
        if (this._textureAtlas.getTotalQuads() === 0)
            return;

        cc.NODE_DRAW_SETUP(this);
        this._arrayMakeObjectsPerformSelector(this._children, cc.Node.StateCallbackType.updateTransform);
        cc.glBlendFunc(this._blendFunc.src, this._blendFunc.dst);

        this._textureAtlas.drawQuads();
    }
});

/**
 * <p>
 *    creates a cc.SpriteBatchNodeCanvas with a file image (.png, .jpg etc) with a default capacity of 29 children.<br/>
 *    The capacity will be increased in 33% in runtime if it run out of space.<br/>
 *    The file will be loaded using the TextureMgr.<br/>
 * </p>
 * @param {String} fileImage
 * @param {Number} capacity
 * @return {cc.SpriteBatchNodeCanvas}
 * @example
 * //create a SpriteBatchNode
 * var parent2 = cc.SpriteBatchNode.create("res/animations/grossini.png", 50);
 */
cc.SpriteBatchNodeWebGL.create = function (fileImage, capacity) {
    capacity = capacity || cc.DEFAULT_SPRITE_BATCH_CAPACITY;
    var batchNode = new cc.SpriteBatchNodeWebGL();
    batchNode.init(fileImage, capacity);
    return batchNode;
};

/**
 * <p>
 *   creates a cc.SpriteBatchNodeCanvas with a texture2d and a default capacity of 29 children.   <br/>
 *   The capacity will be increased in 33% in runtime if it run out of space.               <br/>
 * </p>
 * @param {cc.Texture2D} texture
 * @param {Number} capacity
 * @return {cc.SpriteBatchNodeCanvas}
 */
cc.SpriteBatchNodeWebGL.createWithTexture = function (texture, capacity) {
    capacity = capacity || cc.DEFAULT_SPRITE_BATCH_CAPACITY;
    var batchNode = new cc.SpriteBatchNodeWebGL();
    batchNode.initWithTexture(texture, capacity);
    return batchNode;
};

cc.SpriteBatchNode = (cc.Browser.supportWebGL)?cc.SpriteBatchNodeWebGL:cc.SpriteBatchNodeCanvas;


