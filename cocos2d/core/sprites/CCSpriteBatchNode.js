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
 *     If its _useCache is set to true, it can cache the result that all children of SpriteBatchNode to a canvas <br/>
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
 *
 * @property {cc.TextureAtlas}  textureAtlas    - The texture atlas
 * @property {Array}            descendants     - <@readonly> Descendants of sprite batch node
 *
 * @example
 * //create a SpriteBatchNode
 * var parent2 = cc.SpriteBatchNode.create("res/animations/grossini.png", 50);
 */
cc.SpriteBatchNode = cc.Node.extend(/** @lends cc.SpriteBatchNode# */{
    textureAtlas:null,

	_blendFunc:null,
    // all descendants: chlidren, gran children, etc...
    _descendants:null,
    _className:"SpriteBatchNode",

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
        if(!child)
            throw "cc.SpriteBatchNode.addQuadFromSprite(): child should be non-null";
        if(!(child instanceof cc.Sprite)){
            cc.log("cc.SpriteBatchNode.addQuadFromSprite(): SpriteBatchNode only supports cc.Sprites as children");
            return null;
        }

        // quad index is Z
        child.atlasIndex = z;

        // XXX: optimize with a binary search
        var i = 0, locDescendants = this._descendants;
        if (locDescendants && locDescendants.length > 0) {
            for (var index = 0; index < locDescendants.length; index++) {
                var obj = locDescendants[index];
                if (obj && (obj.atlasIndex >= z))
                    ++i;
            }
        }
        locDescendants.splice(i, 0, child);

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
        return this.textureAtlas;
    },

    /**
     * TextureAtlas of cc.SpriteBatchNode setter
     * @param {cc.TextureAtlas} textureAtlas
     */
    setTextureAtlas:function (textureAtlas) {
        if (textureAtlas != this.textureAtlas) {
            this.textureAtlas = textureAtlas;
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
        var texture2D = cc.textureCache.textureForKey(fileImage);
        if (!texture2D)
            texture2D = cc.textureCache.addImage(fileImage);
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
        var texture2D = cc.textureCache.textureForKey(fileImage);
        if (!texture2D)
            texture2D = cc.textureCache.addImage(fileImage);
        return this.initWithTexture(texture2D, capacity);
    },

    /**
     * increase Atlas Capacity
     */
    increaseAtlasCapacity:function () {
        // if we're going beyond the current TextureAtlas's capacity,
        // all the previously initialized sprites will need to redo their texture coords
        // this is likely computationally expensive
        var locCapacity = this.textureAtlas.capacity;
        var quantity = Math.floor((locCapacity + 1) * 4 / 3);

        cc.log("cocos2d: CCSpriteBatchNode: resizing TextureAtlas capacity from " + locCapacity + " to " + quantity + ".");

        if (!this.textureAtlas.resizeCapacity(quantity)) {
            // serious problems
            cc.log("cocos2d: WARNING: Not enough memory to resize the atlas");
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
        var children = pobParent.children;
        if (children && children.length > 0) {
            for (var i = 0; i < children.length; i++) {
                var obj = children[i];
                if (obj && (obj.zIndex < 0)) {
                    index = this.rebuildIndexInOrder(obj, index);
                }
            }
        }
        // ignore self (batch node)
        if (!pobParent == this) {
            pobParent.atlasIndex = index;
            index++;
        }
        if (children && children.length > 0) {
            for (i = 0; i < children.length; i++) {
                obj = children[i];
                if (obj && (obj.zIndex >= 0)) {
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
        var children = sprite.children;

        if (!children || children.length == 0)
            return sprite.atlasIndex;
        else
            return this.highestAtlasIndexInChild(children[children.length - 1]);
    },

    /**
     * get lowest atlas index in child
     * @param {cc.Sprite} sprite
     * @return {Number}
     */
    lowestAtlasIndexInChild:function (sprite) {
        var children = sprite.children;

        if (!children || children.length == 0)
            return sprite.atlasIndex;
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
	    var selParent = sprite.parent;
        var brothers = selParent.children;
        var childIndex = brothers.indexOf(sprite);

        // ignore parent Z if parent is spriteSheet
        var ignoreParent = selParent == this;
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
        if (childIndex == 0) {
            // less than parent and brothers
            if (nZ < 0)
                return selParent.atlasIndex;
            else
                return selParent.atlasIndex + 1;
        } else {
            // previous & sprite belong to the same branch
            if ((previous.zIndex < 0 && nZ < 0) || (previous.zIndex >= 0 && nZ >= 0))
                return this.highestAtlasIndexInChild(previous) + 1;

            // else (previous < 0 and sprite >= 0 )
            return selParent.atlasIndex + 1;
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
        if (dst === undefined)
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
        if(!child)
            throw "cc.SpriteBatchNode.addChild():child should be non-null";
        if(this._children.indexOf(child) === -1) {
            cc.log("cc.SpriteBatchNode.addChild(): Child doesn't belong to Sprite");
            return;
        }

        if (zOrder === child.zIndex)
            return;

        //set the z-order and sort later
        cc.Node.prototype.reorderChild.call(this, child, zOrder);
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
        if(this._children.indexOf(child) === -1){
            cc.log("cc.SpriteBatchNode.addChild(): sprite batch node should contain the child");
            return;
        }

        // cleanup before removing
        this.removeSpriteFromAtlas(child);
        cc.Node.prototype.removeChild.call(this, child, cleanup);
    },

    _mvpMatrix:null,
    _textureForCanvas:null,
    _useCache:false,
    _originalTexture:null,

    /**
     * <p>
     *    Constructor
     *    creates a cc.SpriteBatchNodeCanvas with a file image (.png, .jpg etc) with a default capacity of 29 children.<br/>
     *    The capacity will be increased in 33% in runtime if it run out of space.<br/>
     *    The file will be loaded using the TextureMgr.<br/>
     * </p>
     * @function
     * @constructor
     * @param {String} fileImage
     * @param {Number} capacity
     * @example
     * 1.
     * //create a SpriteBatchNode with image path
     * var spriteBatchNode = cc.SpriteBatchNode.create("res/animations/grossini.png", 50);
     * 2.
     * //create a SpriteBatchNode with texture
     * var texture = cc.textureCache.addImage("res/animations/grossini.png");
     * var spriteBatchNode = cc.SpriteBatchNode.create(texture,50);
     */
    ctor: null,

    /**
     * <p>
     *   Updates a quad at a certain index into the texture atlas. The CCSprite won't be added into the children array.                 <br/>
     *   This method should be called only when you are dealing with very big AtlasSrite and when most of the cc.Sprite won't be updated.<br/>
     *   For example: a tile map (cc.TMXMap) or a label with lots of characters (BitmapFontAtlas)<br/>
     * </p>
     * @function
     * @param {cc.Sprite} sprite
     * @param {Number} index
     */
    updateQuadFromSprite:null,

    _swap:function (oldIndex, newIndex) {
        var locDescendants = this._descendants;
        var locTextureAtlas = this.textureAtlas;
        var quads = locTextureAtlas.quads;
        var tempItem = locDescendants[oldIndex];
        var tempIteQuad = cc.V3F_C4B_T2F_QuadCopy(quads[oldIndex]);

        //update the index of other swapped item
        locDescendants[newIndex].atlasIndex = oldIndex;
        locDescendants[oldIndex] = locDescendants[newIndex];

        locTextureAtlas.updateQuad(quads[newIndex], oldIndex);
        locDescendants[newIndex] = tempItem;
        locTextureAtlas.updateQuad(tempIteQuad, newIndex);
    },

    /**
     * <p>
     *    Inserts a quad at a certain index into the texture atlas. The cc.Sprite won't be added into the children array.                    <br/>
     *    This method should be called only when you are dealing with very big AtlasSprite and when most of the cc.Sprite won't be updated.  <br/>
     *    For example: a tile map (cc.TMXMap) or a label with lots of characters (cc.LabelBMFont)
     * </p>
     * @function
     * @param {cc.Sprite} sprite
     * @param {Number} index
     */
    insertQuadFromSprite:null,

    _updateAtlasIndex:function (sprite, curIndex) {
        var count = 0;
        var pArray = sprite.children;
        if (pArray)
            count = pArray.length;

        var oldIndex = 0;
        if (count === 0) {
            oldIndex = sprite.atlasIndex;
            sprite.atlasIndex = curIndex;
            sprite.arrivalOrder = 0;
            if (oldIndex != curIndex)
                this._swap(oldIndex, curIndex);
            curIndex++;
        } else {
            var needNewIndex = true;
            if (pArray[0].zIndex >= 0) {
                //all children are in front of the parent
                oldIndex = sprite.atlasIndex;
                sprite.atlasIndex = curIndex;
                sprite.arrivalOrder = 0;
                if (oldIndex != curIndex)
                    this._swap(oldIndex, curIndex);
                curIndex++;
                needNewIndex = false;
            }
            for (var i = 0; i < pArray.length; i++) {
                var child = pArray[i];
                if (needNewIndex && child.zIndex >= 0) {
                    oldIndex = sprite.atlasIndex;
                    sprite.atlasIndex = curIndex;
                    sprite.arrivalOrder = 0;
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
                oldIndex = sprite.atlasIndex;
                sprite.atlasIndex = curIndex;
                sprite.arrivalOrder = 0;
                if (oldIndex != curIndex) {
                    this._swap(oldIndex, curIndex);
                }
                curIndex++;
            }
        }

        return curIndex;
    },

    _updateBlendFunc:function () {
        if (!this.textureAtlas.texture.hasPremultipliedAlpha()) {
            this._blendFunc.src = cc.SRC_ALPHA;
            this._blendFunc.dst = cc.ONE_MINUS_SRC_ALPHA;
        }
    },

    /**
     * <p>
     *    initializes a CCSpriteBatchNode with a texture2d and capacity of children.<br/>
     *    The capacity will be increased in 33% in runtime if it run out of space.
     * </p>
     * @function
     * @param {cc.Texture2D} tex
     * @param {Number} [capacity]
     * @return {Boolean}
     */
    initWithTexture:null,

    /**
     * add child helper
     * @param {cc.Sprite} sprite
     * @param {Number} index
     */
    insertChild:function (sprite, index) {
        sprite.batchNode = this;
        sprite.atlasIndex = index;
        sprite.dirty = true;

        var locTextureAtlas = this.textureAtlas;
        if (locTextureAtlas.totalQuads >= locTextureAtlas.capacity)
            this.increaseAtlasCapacity();

        locTextureAtlas.insertQuad(sprite.quad, index);
        this._descendants.splice(index, 0, sprite);

        // update indices
        var i = index + 1, locDescendant = this._descendants;
        if (locDescendant && locDescendant.length > 0) {
            for (; i < locDescendant.length; i++)
                locDescendant[i].atlasIndex++;
        }

        // add children recursively
        var locChildren = sprite.children, child;
        if (locChildren) {
            for (i = 0, l = locChildren.length || 0; i < l; i++) {
				child = locChildren[i];
                if (child) {
                    var getIndex = this.atlasIndexForChild(child, child.zIndex);
                    this.insertChild(child, getIndex);
                }
            }
        }
    },

    /**
     * addChild helper, faster than insertChild
     * @function
     * @param {cc.Sprite} sprite
     */
    appendChild:null,

    /**
     * remove sprite from TextureAtlas
     * @function
     * @param {cc.Sprite} sprite
     */
    removeSpriteFromAtlas:null,

    // CCTextureProtocol
    /**
     * Return texture of cc.SpriteBatchNode
     * @function
     * @return {cc.Texture2D|HTMLImageElement|HTMLCanvasElement}
     */
    getTexture:null,

    /**
     * Texture of cc.SpriteBatchNode setter
     * @function
     * @param {cc.Texture2D} texture
     */
    setTexture:null,

    /**
     * Don't call visit on it's children ( override visit of cc.Node )
     * @function
     * @override
     * @param {CanvasRenderingContext2D} ctx
     */
    visit:null,

    /**
     * Add child to cc.SpriteBatchNode (override addChild of cc.Node)
     * @function
     * @override
     * @param {cc.Sprite} child
     * @param {Number} [zOrder]
     * @param {Number} [tag]
     */
    addChild: null,

    /**
     * <p>Removes all children from the container and do a cleanup all running actions depending on the cleanup parameter. <br/>
     * (override removeAllChildren of cc.Node)</p>
     * @function
     * @param {Boolean} cleanup
     */
    removeAllChildren:null,

    sortAllChildren:null,

    /**
     * draw cc.SpriteBatchNode (override draw of cc.Node)
     * @function
     */
    draw:null

});

/**
 * <p>
 *    creates a cc.SpriteBatchNodeCanvas with a file image (.png, .jpg etc) with a default capacity of 29 children.<br/>
 *    The capacity will be increased in 33% in runtime if it run out of space.<br/>
 *    The file will be loaded using the TextureMgr.<br/>
 * </p>
 * @param {String|cc.Texture2D} fileImage
 * @param {Number} capacity
 * @return {cc.SpriteBatchNode}
 * @example
 * 1.
 * //create a SpriteBatchNode with image path
 * var spriteBatchNode = cc.SpriteBatchNode.create("res/animations/grossini.png", 50);
 * 2.
 * //create a SpriteBatchNode with texture
 * var texture = cc.textureCache.addImage("res/animations/grossini.png");
 * var spriteBatchNode = cc.SpriteBatchNode.create(texture,50);
 */
cc.SpriteBatchNode.create = function (fileImage, capacity) {
    return new cc.SpriteBatchNode(fileImage, capacity);
};
