/****************************************************************************
 Copyright (c) 2008-2010 Ricardo Quesada
 Copyright (c) 2011-2012 cocos2d-x.org
 Copyright (c) 2013-2014 Chukong Technologies Inc.

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
 * @param {String|cc.Texture2D} fileImage
 * @param {Number} capacity
 * @example
 *
 * // 1. create a SpriteBatchNode with image path
 * var spriteBatchNode = new cc.SpriteBatchNode("res/animations/grossini.png", 50);
 *
 * // 2. create a SpriteBatchNode with texture
 * var texture = cc.textureCache.addImage("res/animations/grossini.png");
 * var spriteBatchNode = new cc.SpriteBatchNode(texture,50);
 *
 * @property {cc.TextureAtlas}  textureAtlas    - The texture atlas
 * @property {Array}            descendants     - <@readonly> Descendants of sprite batch node
 */
cc.SpriteBatchNode = cc.Node.extend(/** @lends cc.SpriteBatchNode# */{
    textureAtlas: null,

    _blendFunc: null,
    // all descendants: chlidren, gran children, etc...
    _descendants: null,
    _className: "SpriteBatchNode",

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
    addSpriteWithoutQuad: function (child, z, aTag) {

        cc.assert(child, cc._LogInfos.SpriteBatchNode_addSpriteWithoutQuad_2);

        if (!(child instanceof cc.Sprite)) {
            cc.log(cc._LogInfos.SpriteBatchNode_addSpriteWithoutQuad);
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
    getTextureAtlas: function () {
        return this.textureAtlas;
    },

    /**
     * TextureAtlas of cc.SpriteBatchNode setter
     * @param {cc.TextureAtlas} textureAtlas
     */
    setTextureAtlas: function (textureAtlas) {
        if (textureAtlas != this.textureAtlas) {
            this.textureAtlas = textureAtlas;
        }
    },

    /**
     * Return Descendants of cc.SpriteBatchNode
     * @return {Array}
     */
    getDescendants: function () {
        return  this._descendants;
    },

    /**
     * <p>
     *    Initializes a cc.SpriteBatchNode with a file image (.png, .jpeg, .pvr, etc) and a capacity of children.<br/>
     *    The capacity will be increased in 33% in runtime if it run out of space.<br/>
     *    The file will be loaded using the TextureMgr.<br/>
     *    Please pass parameters to constructor to initialize the sprite batch node, do not call this function yourself.
     * </p>
     * @param {String} fileImage
     * @param {Number} capacity
     * @return {Boolean}
     */
    initWithFile: function (fileImage, capacity) {
        var texture2D = cc.textureCache.getTextureForKey(fileImage);
        if (!texture2D)
            texture2D = cc.textureCache.addImage(fileImage);
        return this.initWithTexture(texture2D, capacity);
    },

    _setNodeDirtyForCache: function () {
        this._cacheDirty = true;
    },

    /**
     * <p>
     *    initializes a cc.SpriteBatchNode with a file image (.png, .jpeg, .pvr, etc) and a capacity of children.<br/>
     *    The capacity will be increased in 33% in runtime if it run out of space.<br/>
     *    The file will be loaded using the TextureMgr.<br/>
     *    Please pass parameters to constructor to initialize the sprite batch node, do not call this function yourself.
     * </p>
     * @param {String} fileImage
     * @param {Number} capacity
     * @return {Boolean}
     */
    init: function (fileImage, capacity) {
        var texture2D = cc.textureCache.getTextureForKey(fileImage);
        if (!texture2D)
            texture2D = cc.textureCache.addImage(fileImage);
        return this.initWithTexture(texture2D, capacity);
    },

    /**
     * Increase Atlas Capacity
     */
    increaseAtlasCapacity: function () {
        // if we're going beyond the current TextureAtlas's capacity,
        // all the previously initialized sprites will need to redo their texture coords
        // this is likely computationally expensive
        var locCapacity = this.textureAtlas.capacity;
        var quantity = Math.floor((locCapacity + 1) * 4 / 3);

        cc.log(cc._LogInfos.SpriteBatchNode_increaseAtlasCapacity, locCapacity, quantity);

        if (!this.textureAtlas.resizeCapacity(quantity)) {
            // serious problems
            cc.log(cc._LogInfos.SpriteBatchNode_increaseAtlasCapacity_2);
        }
    },

    /**
     * Removes a child given a certain index. It will also cleanup the running actions depending on the cleanup parameter.
     * @warning Removing a child from a cc.SpriteBatchNode is very slow
     * @param {Number} index
     * @param {Boolean} doCleanup
     */
    removeChildAtIndex: function (index, doCleanup) {
        this.removeChild(this._children[index], doCleanup);
    },

    /**
     * Rebuild index in order for child
     * @param {cc.Sprite} pobParent
     * @param {Number} index
     * @return {Number}
     */
    rebuildIndexInOrder: function (pobParent, index) {
        var children = pobParent.children;
        if (children && children.length > 0) {
            for (var i = 0; i < children.length; i++) {
                var obj = children[i];
                if (obj && (obj.zIndex < 0))
                    index = this.rebuildIndexInOrder(obj, index);
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
                if (obj && (obj.zIndex >= 0))
                    index = this.rebuildIndexInOrder(obj, index);
            }
        }
        return index;
    },

    /**
     * Returns highest atlas index in child
     * @param {cc.Sprite} sprite
     * @return {Number}
     */
    highestAtlasIndexInChild: function (sprite) {
        var children = sprite.children;

        if (!children || children.length == 0)
            return sprite.atlasIndex;
        else
            return this.highestAtlasIndexInChild(children[children.length - 1]);
    },

    /**
     * Returns lowest atlas index in child
     * @param {cc.Sprite} sprite
     * @return {Number}
     */
    lowestAtlasIndexInChild: function (sprite) {
        var children = sprite.children;

        if (!children || children.length == 0)
            return sprite.atlasIndex;
        else
            return this.lowestAtlasIndexInChild(children[children.length - 1]);
    },

    /**
     * Returns atlas index for child
     * @param {cc.Sprite} sprite
     * @param {Number} nZ
     * @return {Number}
     */
    atlasIndexForChild: function (sprite, nZ) {
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
    reorderBatch: function (reorder) {
        this._reorderChildDirty = reorder;
    },

    /**
     * Sets the source and destination blending function for the texture
     * @param {Number | cc.BlendFunc} src
     * @param {Number} dst
     */
    setBlendFunc: function (src, dst) {
        if (dst === undefined)
            this._blendFunc = src;
        else
            this._blendFunc = {src: src, dst: dst};
    },

    /**
     * Returns the blending function used for the texture
     * @return {cc.BlendFunc}
     */
    getBlendFunc: function () {
        return this._blendFunc;
    },

    /**
     * Reorder children (override reorderChild of cc.Node)
     * @override
     * @param {cc.Sprite} child
     * @param {Number} zOrder
     */
    reorderChild: function (child, zOrder) {

        cc.assert(child, cc._LogInfos.SpriteBatchNode_reorderChild_2);

        if (this._children.indexOf(child) === -1) {
            cc.log(cc._LogInfos.SpriteBatchNode_reorderChild);
            return;
        }

        if (zOrder === child.zIndex)
            return;

        //set the z-order and sort later
        cc.Node.prototype.reorderChild.call(this, child, zOrder);
        this.setNodeDirty();
    },

    /**
     * Removes a child from cc.SpriteBatchNode (override removeChild of cc.Node)
     * @param {cc.Sprite} child
     * @param {Boolean} cleanup
     */
    removeChild: function (child, cleanup) {
        // explicit null handling
        if (child == null)
            return;
        if (this._children.indexOf(child) === -1) {
            cc.log(cc._LogInfos.SpriteBatchNode_removeChild);
            return;
        }

        // cleanup before removing
        this.removeSpriteFromAtlas(child);
        cc.Node.prototype.removeChild.call(this, child, cleanup);
    },

    _textureForCanvas: null,
    _useCache: false,
    _originalTexture: null,

    ctor: null,

    _ctorForCanvas: function (fileImage, capacity) {
        cc.Node.prototype.ctor.call(this);

        var texture2D;
        capacity = capacity || cc.DEFAULT_SPRITE_BATCH_CAPACITY;
        if (cc.isString(fileImage)) {
            texture2D = cc.textureCache.getTextureForKey(fileImage);
            if (!texture2D)
                texture2D = cc.textureCache.addImage(fileImage);
        }
        else if (fileImage instanceof cc.Texture2D)
            texture2D = fileImage;

        texture2D && this.initWithTexture(texture2D, capacity);
    },

    _ctorForWebGL: function (fileImage, capacity) {
        cc.Node.prototype.ctor.call(this);

        var texture2D;
        capacity = capacity || cc.DEFAULT_SPRITE_BATCH_CAPACITY;
        if (cc.isString(fileImage)) {
            texture2D = cc.textureCache.getTextureForKey(fileImage);
            if (!texture2D)
                texture2D = cc.textureCache.addImage(fileImage);
        } else if (fileImage instanceof cc.Texture2D)
            texture2D = fileImage;
        texture2D && this.initWithTexture(texture2D, capacity);
    },

    _initRendererCmd: function(){
         if(cc._renderType === cc._RENDER_TYPE_WEBGL)
            this._rendererCmd = new cc.SpriteBatchNodeRenderCmdWebGL(this);
    },

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
    updateQuadFromSprite: null,

    _updateQuadFromSpriteForCanvas: function (sprite, index) {

        cc.assert(sprite, cc._LogInfos.CCSpriteBatchNode_updateQuadFromSprite_2);

        if (!(sprite instanceof cc.Sprite)) {
            cc.log(cc._LogInfos.CCSpriteBatchNode_updateQuadFromSprite);
            return;
        }

        //
        // update the quad directly. Don't add the sprite to the scene graph
        //
        sprite.batchNode = this;
        sprite.atlasIndex = index;

        sprite.dirty = true;
        // UpdateTransform updates the textureAtlas quad
        sprite.updateTransform();
    },

    _updateQuadFromSpriteForWebGL: function (sprite, index) {

        cc.assert(sprite, cc._LogInfos.CCSpriteBatchNode_updateQuadFromSprite);

        if (!(sprite instanceof cc.Sprite)) {
            cc.log(cc._LogInfos.CCSpriteBatchNode_updateQuadFromSprite);
            return;
        }

        // make needed room
        var locCapacity = this.textureAtlas.capacity;
        while (index >= locCapacity || locCapacity == this.textureAtlas.totalQuads) {
            this.increaseAtlasCapacity();
        }

        //
        // update the quad directly. Don't add the sprite to the scene graph
        //
        sprite.batchNode = this;
        sprite.atlasIndex = index;

        sprite.dirty = true;
        // UpdateTransform updates the textureAtlas quad
        sprite.updateTransform();
    },

    _swap: function (oldIndex, newIndex) {
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
    insertQuadFromSprite: null,

    _insertQuadFromSpriteForCanvas: function (sprite, index) {

        cc.assert(sprite, cc._LogInfos.CCSpriteBatchNode_insertQuadFromSprite_2);

        if (!(sprite instanceof cc.Sprite)) {
            cc.log(cc._LogInfos.CCSpriteBatchNode_insertQuadFromSprite);
            return;
        }

        //
        // update the quad directly. Don't add the sprite to the scene graph
        //
        sprite.batchNode = this;
        sprite.atlasIndex = index;

        // XXX: updateTransform will update the textureAtlas too, using updateQuad.
        // XXX: so, it should be AFTER the insertQuad
        sprite.dirty = true;
        sprite.updateTransform();
        sprite._setCachedParent(this);
        this._children.splice(index, 0, sprite);
    },

    _insertQuadFromSpriteForWebGL: function (sprite, index) {

        cc.assert(sprite, cc._LogInfos.Sprite_insertQuadFromSprite_2);

        if (!(sprite instanceof cc.Sprite)) {
            cc.log(cc._LogInfos.Sprite_insertQuadFromSprite);
            return;
        }

        // make needed room
        var locTextureAtlas = this.textureAtlas;
        while (index >= locTextureAtlas.capacity || locTextureAtlas.capacity === locTextureAtlas.totalQuads)
            this.increaseAtlasCapacity();

        //
        // update the quad directly. Don't add the sprite to the scene graph
        //
        sprite.batchNode = this;
        sprite.atlasIndex = index;
        locTextureAtlas.insertQuad(sprite.quad, index);

        // XXX: updateTransform will update the textureAtlas too, using updateQuad.
        // XXX: so, it should be AFTER the insertQuad
        sprite.dirty = true;
        sprite.updateTransform();
    },

    _updateAtlasIndex: function (sprite, curIndex) {
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

    _updateBlendFunc: function () {
        if (!this.textureAtlas.texture.hasPremultipliedAlpha()) {
            this._blendFunc.src = cc.SRC_ALPHA;
            this._blendFunc.dst = cc.ONE_MINUS_SRC_ALPHA;
        }
    },

    /**
     * <p>
     *    Initializes a cc.SpriteBatchNode with a texture2d and capacity of children.<br/>
     *    The capacity will be increased in 33% in runtime if it run out of space.<br/>
     *    Please pass parameters to constructor to initialize the sprite batch node, do not call this function yourself.
     * </p>
     * @function
     * @param {cc.Texture2D} tex
     * @param {Number} [capacity]
     * @return {Boolean}
     */
    initWithTexture: null,

    _initWithTextureForCanvas: function (tex, capacity) {
        this._children = [];
        this._descendants = [];

        this._blendFunc = new cc.BlendFunc(cc.BLEND_SRC, cc.BLEND_DST);

        this._originalTexture = tex;
        this._textureForCanvas = tex;
        return true;
    },

    _initWithTextureForWebGL: function (tex, capacity) {
        this._children = [];
        this._descendants = [];

        this._blendFunc = new cc.BlendFunc(cc.BLEND_SRC, cc.BLEND_DST);
        capacity = capacity || cc.DEFAULT_SPRITE_BATCH_CAPACITY;
        this.textureAtlas = new cc.TextureAtlas();
        this.textureAtlas.initWithTexture(tex, capacity);
        this._updateBlendFunc();
        this.shaderProgram = cc.shaderCache.programForKey(cc.SHADER_POSITION_TEXTURECOLOR);
        return true;
    },

    /**
     * Insert a child
     * @param {cc.Sprite} sprite The child sprite
     * @param {Number} index The insert index
     */
    insertChild: function (sprite, index) {
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
     * Add child at the end, faster than insert child
     * @function
     * @param {cc.Sprite} sprite
     */
    appendChild: null,

    _appendChildForCanvas: function (sprite) {
        this._reorderChildDirty = true;
        sprite.batchNode = this;
        sprite.dirty = true;

        this._descendants.push(sprite);
        sprite.atlasIndex = this._descendants.length - 1;

        // add children recursively
        var children = sprite.children;
        for (var i = 0, l = children.length || 0; i < l; i++)
            this.appendChild(children[i]);
    },

    _appendChildForWebGL: function (sprite) {
        this._reorderChildDirty = true;
        sprite.batchNode = this;
        sprite.dirty = true;

        this._descendants.push(sprite);
        var index = this._descendants.length - 1;
        sprite.atlasIndex = index;

        var locTextureAtlas = this.textureAtlas;
        if (locTextureAtlas.totalQuads == locTextureAtlas.capacity)
            this.increaseAtlasCapacity();
        locTextureAtlas.insertQuad(sprite.quad, index);

        // add children recursively
        var children = sprite.children;
        for (var i = 0, l = children.length || 0; i < l; i++)
            this.appendChild(children[i]);
    },

    /**
     * Removes sprite from TextureAtlas
     * @function
     * @param {cc.Sprite} sprite
     */
    removeSpriteFromAtlas: null,

    _removeSpriteFromAtlasForCanvas: function (sprite) {
        // Cleanup sprite. It might be reused (issue #569)
        sprite.batchNode = null;
        var locDescendants = this._descendants;
        var index = locDescendants.indexOf(sprite);
        if (index != -1) {
            locDescendants.splice(index, 1)

            // update all sprites beyond this one
            var len = locDescendants.length;
            for (; index < len; ++index) {
                var s = locDescendants[index];
                s.atlasIndex--;
            }
        }

        // remove children recursively
        var children = sprite.children;
        if (children) {
            for (var i = 0, l = children.length || 0; i < l; i++)
                children[i] && this.removeSpriteFromAtlas(children[i]);
        }
    },

    _removeSpriteFromAtlasForWebGL: function (sprite) {
        this.textureAtlas.removeQuadAtIndex(sprite.atlasIndex);   // remove from TextureAtlas

        // Cleanup sprite. It might be reused (issue #569)
        sprite.batchNode = null;

        var locDescendants = this._descendants;
        var index = locDescendants.indexOf(sprite);
        if (index != -1) {
            locDescendants.splice(index, 1);

            // update all sprites beyond this one

            var len = locDescendants.length;
            for (; index < len; ++index) {
                var s = locDescendants[index];
                s.atlasIndex--;
            }
        }

        // remove children recursively
        var children = sprite.children;
        if (children) {
            for (var i = 0, l = children.length || 0; i < l; i++)
                children[i] && this.removeSpriteFromAtlas(children[i]);
        }
    },
    // CCTextureProtocol
    /**
     * Returns texture of the sprite batch node
     * @function
     * @return {cc.Texture2D|HTMLImageElement|HTMLCanvasElement}
     */
    getTexture: null,

    _getTextureForCanvas: function () {
        return this._textureForCanvas;
    },

    _getTextureForWebGL: function () {
        return this.textureAtlas.texture;
    },

    /**
     * Sets the texture of the sprite batch node.
     * @function
     * @param {cc.Texture2D} texture
     */
    setTexture: null,

    _setTextureForCanvas: function (texture) {
        this._textureForCanvas = texture;
        var locChildren = this._children;
        for (var i = 0; i < locChildren.length; i++)
            locChildren[i].texture = texture;
    },

    _setTextureForWebGL: function (texture) {
        this.textureAtlas.texture = texture;
        this._updateBlendFunc();
    },

    /**
     * Don't call visit on its children ( override visit of cc.Node )
     * @function
     * @override
     * @param {CanvasRenderingContext2D} ctx
     */
    visit: null,

    _visitForCanvas: function (ctx) {
        var context = ctx || cc._renderContext;
        // quick return if not visible
        if (!this._visible)
            return;

        context.save();
        this.transform(ctx);
        var i, locChildren = this._children;
        if (locChildren) {
            this.sortAllChildren();
            for (i = 0; i < locChildren.length; i++) {
                if (locChildren[i])
                    locChildren[i].visit(context);
            }
        }
        context.restore();
    },

    _visitForWebGL: function (ctx) {
        var gl = ctx || cc._renderContext;

        // CAREFUL:
        // This visit is almost identical to CocosNode#visit
        // with the exception that it doesn't call visit on it's children
        //
        // The alternative is to have a void CCSprite#visit, but
        // although this is less mantainable, is faster
        //
        if (!this._visible)
            return;

        var currentStack = cc.current_stack;
        currentStack.stack.push(currentStack.top);
        cc.kmMat4Assign(this._stackMatrix, currentStack.top);
        currentStack.top = this._stackMatrix;

/*        var locGrid = this.grid;
        if (locGrid && locGrid.isActive()) {
            locGrid.beforeDraw();
            this.transformAncestors();
        }*/

        this.sortAllChildren();
        this.transform(gl);
        //this.draw(gl);
        if(this._rendererCmd)
            cc.renderer.pushRenderCommand(this._rendererCmd);

/*        if (locGrid && locGrid.isActive())
            locGrid.afterDraw(this);*/

        //optimize performance for javascript
        currentStack.top = currentStack.stack.pop();
    },

    /**
     * Add child to the sprite batch node (override addChild of cc.Node)
     * @function
     * @override
     * @param {cc.Sprite} child
     * @param {Number} [zOrder]
     * @param {Number} [tag]
     */
    addChild: null,

    _addChildForCanvas: function (child, zOrder, tag) {

        cc.assert(child != null, cc._LogInfos.CCSpriteBatchNode_addChild_3);

        if (!(child instanceof cc.Sprite)) {
            cc.log(cc._LogInfos.CCSpriteBatchNode_addChild);
            return;
        }

        zOrder = (zOrder == null) ? child.zIndex : zOrder;
        tag = (tag == null) ? child.tag : tag;

        cc.Node.prototype.addChild.call(this, child, zOrder, tag);
        this.appendChild(child);
        this.setNodeDirty();
    },

    _addChildForWebGL: function (child, zOrder, tag) {

        cc.assert(child != null, cc._LogInfos.Sprite_addChild_6);

        if (!(child instanceof cc.Sprite)) {
            cc.log(cc._LogInfos.Sprite_addChild_4);
            return;
        }
        if (child.texture != this.textureAtlas.texture) {                    // check cc.Sprite is using the same texture id
            cc.log(cc._LogInfos.Sprite_addChild_5);
            return;
        }

        zOrder = (zOrder == null) ? child.zIndex : zOrder;
        tag = (tag == null) ? child.tag : tag;

        cc.Node.prototype.addChild.call(this, child, zOrder, tag);
        this.appendChild(child);
        this.setNodeDirty();
    },

    /**
     * Removes all children from the container and do a cleanup all running actions depending on the cleanup parameter. <br/>
     * (override removeAllChildren of cc.Node)
     * @function
     * @param {Boolean} cleanup
     */
    removeAllChildren: null,

    _removeAllChildrenForCanvas: function (cleanup) {
        // Invalidate atlas index. issue #569
        // useSelfRender should be performed on all descendants. issue #1216
        var locDescendants = this._descendants;
        if (locDescendants && locDescendants.length > 0) {
            for (var i = 0, len = locDescendants.length; i < len; i++) {
                if (locDescendants[i])
                    locDescendants[i].batchNode = null;
            }
        }

        cc.Node.prototype.removeAllChildren.call(this, cleanup);
        this._descendants.length = 0;
    },

    _removeAllChildrenForWebGL: function (cleanup) {
        // Invalidate atlas index. issue #569
        // useSelfRender should be performed on all descendants. issue #1216
        var locDescendants = this._descendants;
        if (locDescendants && locDescendants.length > 0) {
            for (var i = 0, len = locDescendants.length; i < len; i++) {
                if (locDescendants[i])
                    locDescendants[i].batchNode = null;
            }
        }
        cc.Node.prototype.removeAllChildren.call(this, cleanup);
        this._descendants.length = 0;
        this.textureAtlas.removeAllQuads();
    },

    /**
     * Sort all children nodes (override draw of cc.Node)
     */
    sortAllChildren: null,

    _sortAllChildrenForCanvas: function () {
        if (this._reorderChildDirty) {
            var i, j = 0, locChildren = this._children;
            var length = locChildren.length, tempChild;
            //insertion sort
            for (i = 1; i < length; i++) {
                var tempItem = locChildren[i];
                j = i - 1;
                tempChild = locChildren[j];

                //continue moving element downwards while zOrder is smaller or when zOrder is the same but mutatedIndex is smaller
                while (j >= 0 && ( tempItem._localZOrder < tempChild._localZOrder ||
                    ( tempItem._localZOrder == tempChild._localZOrder && tempItem.arrivalOrder < tempChild.arrivalOrder ))) {
                    locChildren[j + 1] = tempChild;
                    j = j - 1;
                    tempChild = locChildren[j];
                }
                locChildren[j + 1] = tempItem;
            }

            //sorted now check all children
            if (locChildren.length > 0) {
                //first sort all children recursively based on zOrder
                this._arrayMakeObjectsPerformSelector(locChildren, cc.Node._StateCallbackType.sortAllChildren);
            }
            this._reorderChildDirty = false;
        }
    },

    _sortAllChildrenForWebGL: function () {
        if (this._reorderChildDirty) {
            var childrenArr = this._children;
            var i, j = 0, length = childrenArr.length, tempChild;
            //insertion sort
            for (i = 1; i < length; i++) {
                var tempItem = childrenArr[i];
                j = i - 1;
                tempChild = childrenArr[j];

                //continue moving element downwards while zOrder is smaller or when zOrder is the same but mutatedIndex is smaller
                while (j >= 0 && ( tempItem._localZOrder < tempChild._localZOrder ||
                    ( tempItem._localZOrder == tempChild._localZOrder && tempItem.arrivalOrder < tempChild.arrivalOrder ))) {
                    childrenArr[j + 1] = tempChild;
                    j = j - 1;
                    tempChild = childrenArr[j];
                }
                childrenArr[j + 1] = tempItem;
            }

            //sorted now check all children
            if (childrenArr.length > 0) {
                //first sort all children recursively based on zOrder
                this._arrayMakeObjectsPerformSelector(childrenArr, cc.Node._StateCallbackType.sortAllChildren);

                var index = 0;
                //fast dispatch, give every child a new atlasIndex based on their relative zOrder (keep parent -> child relations intact)
                // and at the same time reorder descedants and the quads to the right index
                for (i = 0; i < childrenArr.length; i++)
                    index = this._updateAtlasIndex(childrenArr[i], index);
            }
            this._reorderChildDirty = false;
        }
    },

    /**
     * Draw the sprite batch node (override draw of cc.Node)
     * @function
     */
    draw: null,

    _drawForWebGL: function () {
        // Optimization: Fast Dispatch
        if (this.textureAtlas.totalQuads === 0)
            return;

        //cc.nodeDrawSetup(this);
        this._shaderProgram.use();
        this._shaderProgram.setUniformForModelViewAndProjectionMatrixWithMat4();
        this._arrayMakeObjectsPerformSelector(this._children, cc.Node._StateCallbackType.updateTransform);
        cc.glBlendFunc(this._blendFunc.src, this._blendFunc.dst);

        this.textureAtlas.drawQuads();
    }
});

var _p = cc.SpriteBatchNode.prototype;

if (cc._renderType === cc._RENDER_TYPE_WEBGL) {
    _p.ctor = _p._ctorForWebGL;
    _p.updateQuadFromSprite = _p._updateQuadFromSpriteForWebGL;
    _p.insertQuadFromSprite = _p._insertQuadFromSpriteForWebGL;
    _p.initWithTexture = _p._initWithTextureForWebGL;
    _p.appendChild = _p._appendChildForWebGL;
    _p.removeSpriteFromAtlas = _p._removeSpriteFromAtlasForWebGL;
    _p.getTexture = _p._getTextureForWebGL;
    _p.setTexture = _p._setTextureForWebGL;
    _p.visit = _p._visitForWebGL;
    _p.addChild = _p._addChildForWebGL;
    _p.removeAllChildren = _p._removeAllChildrenForWebGL;
    _p.sortAllChildren = _p._sortAllChildrenForWebGL;
    _p.draw = _p._drawForWebGL;
} else {
    _p.ctor = _p._ctorForCanvas;
    _p.updateQuadFromSprite = _p._updateQuadFromSpriteForCanvas;
    _p.insertQuadFromSprite = _p._insertQuadFromSpriteForCanvas;
    _p.initWithTexture = _p._initWithTextureForCanvas;
    _p.appendChild = _p._appendChildForCanvas;
    _p.removeSpriteFromAtlas = _p._removeSpriteFromAtlasForCanvas;
    _p.getTexture = _p._getTextureForCanvas;
    _p.setTexture = _p._setTextureForCanvas;
    _p.visit = _p._visitForCanvas;
    _p.removeAllChildren = _p._removeAllChildrenForCanvas;
    _p.addChild = _p._addChildForCanvas;
    _p.sortAllChildren = _p._sortAllChildrenForCanvas;
    _p.draw = cc.Node.prototype.draw;
}

// Override properties
cc.defineGetterSetter(_p, "texture", _p.getTexture, _p.setTexture);

// Extended properties
/** @expose */
_p.descendants;
cc.defineGetterSetter(_p, "descendants", _p.getDescendants);


/**
 * <p>
 *    creates a cc.SpriteBatchNodeCanvas with a file image (.png, .jpg etc) with a default capacity of 29 children.<br/>
 *    The capacity will be increased in 33% in runtime if it run out of space.<br/>
 *    The file will be loaded using the TextureMgr.<br/>
 * </p>
 * @deprecated since v3.0, please use new construction instead
 * @see cc.SpriteBatchNode
 * @param {String|cc.Texture2D} fileImage
 * @param {Number} capacity
 * @return {cc.SpriteBatchNode}
 */
cc.SpriteBatchNode.create = function (fileImage, capacity) {
    return new cc.SpriteBatchNode(fileImage, capacity);
};

/**
 * @deprecated since v3.0, please use new construction instead
 * @see cc.SpriteBatchNode
 * @function
 */
cc.SpriteBatchNode.createWithTexture = cc.SpriteBatchNode.create;