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
 * @example
 * //create a SpriteBatchNode
 * var parent2 = cc.SpriteBatchNode.create("res/animations/grossini.png", 50);
 */
cc.SpriteBatchNode = cc.Node.extend(/** @lends cc.SpriteBatchNode# */{
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
        if(!child)
            throw "cc.SpriteBatchNode.addQuadFromSprite(): child should be non-null";
        if(!(child instanceof cc.Sprite)){
            cc.log("cc.SpriteBatchNode.addQuadFromSprite(): SpriteBatchNode only supports cc.Sprites as children");
            return null;
        }

        // quad index is Z
        child.setAtlasIndex(z);

        // XXX: optimize with a binary search
        var i = 0, locDescendants = this._descendants;
        if (locDescendants && locDescendants.length > 0) {
            for (var index = 0; index < locDescendants.length; index++) {
                var obj = locDescendants[index];
                if (obj && (obj.getAtlasIndex() >= z))
                    ++i;
            }
        }
        this._descendants = cc.ArrayAppendObjectToIndex(locDescendants, child, i);

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
        var locCapacity = this._textureAtlas.getCapacity();
        var quantity = Math.floor((locCapacity + 1) * 4 / 3);

        cc.log("cocos2d: CCSpriteBatchNode: resizing TextureAtlas capacity from " + locCapacity + " to " + quantity + ".");

        if (!this._textureAtlas.resizeCapacity(quantity)) {
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

        if (zOrder === child.getZOrder())
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
     * Constructor
     * @param {String} fileImage
     */
    ctor: null,

    _ctorForCanvas: function (fileImage) {
        cc.Node.prototype.ctor.call(this);
        if (fileImage)
            this.init(fileImage, cc.DEFAULT_SPRITE_BATCH_CAPACITY);
    },

    _ctorForWebGL: function (fileImage) {
        cc.Node.prototype.ctor.call(this);
        this._mvpMatrix = new cc.kmMat4();
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
    updateQuadFromSprite:null,

    _updateQuadFromSpriteForCanvas:function (sprite, index) {
        if(!sprite)
            throw "cc.SpriteBatchNode.updateQuadFromSprite(): sprite should be non-null";
        if(!(sprite instanceof cc.Sprite)){
            cc.log("cc.SpriteBatchNode.updateQuadFromSprite(): cc.SpriteBatchNode only supports cc.Sprites as children");
            return;
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

    _updateQuadFromSpriteForWebGL:function (sprite, index) {
        if(!sprite)
            throw "cc.SpriteBatchNode.updateQuadFromSprite(): sprite should be non-null";
        if(!(sprite instanceof cc.Sprite)){
            cc.log("cc.SpriteBatchNode.updateQuadFromSprite(): cc.SpriteBatchNode only supports cc.Sprites as children");
            return;
        }

        // make needed room
        var locCapacity = this._textureAtlas.getCapacity();
        while (index >= locCapacity || locCapacity == this._textureAtlas.getTotalQuads()) {
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
        var locDescendants = this._descendants;
        var locTextureAtlas = this._textureAtlas;
        var quads = locTextureAtlas.getQuads();
        var tempItem = locDescendants[oldIndex];
        var tempIteQuad = cc.V3F_C4B_T2F_QuadCopy(quads[oldIndex]);

        //update the index of other swapped item
        locDescendants[newIndex].setAtlasIndex(oldIndex);
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
     * @param {cc.Sprite} sprite
     * @param {Number} index
     */
    insertQuadFromSprite:null,

    _insertQuadFromSpriteForCanvas:function (sprite, index) {
        if(!sprite)
            throw "cc.SpriteBatchNode.insertQuadFromSprite(): sprite should be non-null";
        if(!(sprite instanceof cc.Sprite)){
            cc.log("cc.SpriteBatchNode.insertQuadFromSprite(): cc.SpriteBatchNode only supports cc.Sprites as children");
            return;
        }

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

    _insertQuadFromSpriteForWebGL:function (sprite, index) {
        if(!sprite)
            throw "cc.SpriteBatchNode.insertQuadFromSprite(): sprite should be non-null";
        if(!(sprite instanceof cc.Sprite)){
            cc.log("cc.SpriteBatchNode.insertQuadFromSprite(): cc.SpriteBatchNode only supports cc.Sprites as children");
            return;
        }

        // make needed room
        var locTextureAtlas = this._textureAtlas;
        while (index >= locTextureAtlas.getCapacity() || locTextureAtlas.getCapacity() === locTextureAtlas.getTotalQuads())
            this.increaseAtlasCapacity();

        //
        // update the quad directly. Don't add the sprite to the scene graph
        //
        sprite.setBatchNode(this);
        sprite.setAtlasIndex(index);
        locTextureAtlas.insertQuad(sprite.getQuad(), index);

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
        if (count === 0) {
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
     * @param {Number} [capacity]
     * @return {Boolean}
     */
    initWithTexture:null,

    _initWithTextureForCanvas:function (tex, capacity) {
        this._children = [];
        this._descendants = [];

        this._blendFunc = new cc.BlendFunc(cc.BLEND_SRC, cc.BLEND_DST);

        this._originalTexture = tex;
        this._textureForCanvas = tex;
        return true;
    },

    _initWithTextureForWebGL:function (tex, capacity) {
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

        var locTextureAtlas = this._textureAtlas;
        if (locTextureAtlas.getTotalQuads() >= locTextureAtlas.getCapacity())
            this.increaseAtlasCapacity();

        locTextureAtlas.insertQuad(sprite.getQuad(), index);
        this._descendants = cc.ArrayAppendObjectToIndex(this._descendants, sprite, index);

        // update indices
        var i = index + 1, locDescendant = this._descendants;
        if (locDescendant && locDescendant.length > 0) {
            for (; i < locDescendant.length; i++)
                locDescendant[i].setAtlasIndex(locDescendant[i].getAtlasIndex() + 1);
        }

        // add children recursively
        var locChildren = sprite.getChildren();
        if (locChildren && locChildren.length > 0) {
            for (i = 0; i < locChildren.length; i++) {
                if (locChildren[i]) {
                    var getIndex = this.atlasIndexForChild(locChildren[i], locChildren[i].getZOrder());
                    this.insertChild(locChildren[i], getIndex);
                }
            }
        }
    },

    /**
     * addChild helper, faster than insertChild
     * @param {cc.Sprite} sprite
     */
    appendChild:null,

    _appendChildForCanvas:function (sprite) {
        this._reorderChildDirty = true;
        sprite.setBatchNode(this);
        sprite.setDirty(true);

        this._descendants.push(sprite);
        var index = this._descendants.length - 1;
        sprite.setAtlasIndex(index);

        // add children recursively
        var children = sprite.getChildren();
        for (var i = 0; i < children.length; i++)
            this.appendChild(children[i]);
    },

    _appendChildForWebGL:function (sprite) {
        this._reorderChildDirty = true;
        sprite.setBatchNode(this);
        sprite.setDirty(true);

        this._descendants.push(sprite);
        var index = this._descendants.length - 1;
        sprite.setAtlasIndex(index);

        var locTextureAtlas = this._textureAtlas;
        if (locTextureAtlas.getTotalQuads() == locTextureAtlas.getCapacity())
            this.increaseAtlasCapacity();
        locTextureAtlas.insertQuad(sprite.getQuad(), index);

        // add children recursively
        var children = sprite.getChildren();
        for (var i = 0; i < children.length; i++)
            this.appendChild(children[i]);
    },

    /**
     * remove sprite from TextureAtlas
     * @param {cc.Sprite} sprite
     */
    removeSpriteFromAtlas:null,

    _removeSpriteFromAtlasForCanvas:function (sprite) {
        // Cleanup sprite. It might be reused (issue #569)
        sprite.setBatchNode(null);
        var locDescendants = this._descendants;
        var index = cc.ArrayGetIndexOfObject(locDescendants, sprite);
        if (index != -1) {
            cc.ArrayRemoveObjectAtIndex(locDescendants, index);

            // update all sprites beyond this one
            var len = locDescendants.length;
            for (; index < len; ++index) {
                var s = locDescendants[index];
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

    _removeSpriteFromAtlasForWebGL:function (sprite) {
        this._textureAtlas.removeQuadAtIndex(sprite.getAtlasIndex());   // remove from TextureAtlas

        // Cleanup sprite. It might be reused (issue #569)
        sprite.setBatchNode(null);

        var locDescendants = this._descendants;
        var index = cc.ArrayGetIndexOfObject(locDescendants, sprite);
        if (index != -1) {
            cc.ArrayRemoveObjectAtIndex(locDescendants, index);

            // update all sprites beyond this one

            var len = locDescendants.length;
            for (; index < len; ++index) {
                var s = locDescendants[index];
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
    getTexture:null,

    _getTextureForCanvas:function () {
        return this._textureForCanvas;
    },

    _getTextureForWebGL:function () {
        return this._textureAtlas.getTexture();
    },

    /**
     * texture of cc.SpriteBatchNode setter
     * @param {cc.Texture2D} texture
     */
    setTexture:null,

    _setTextureForCanvas:function (texture) {
        this._textureForCanvas = texture;
        var locChildren = this._children;
        for (var i = 0; i < locChildren.length; i++)
            locChildren[i].setTexture(texture);
    },

    _setTextureForWebGL:function (texture) {
        this._textureAtlas.setTexture(texture);
        this._updateBlendFunc();
    },

    /**
     * don't call visit on it's children ( override visit of cc.Node )
     * @override
     * @param {CanvasRenderingContext2D} ctx
     */
    visit:null,

    _visitForCanvas:function (ctx) {
        var context = ctx || cc.renderContext;
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

    _visitForWebGL:function (ctx) {
        var gl = ctx || cc.renderContext;

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
        var locGrid = this._grid;
        if (locGrid && locGrid.isActive()) {
            locGrid.beforeDraw();
            this.transformAncestors();
        }
        this.sortAllChildren();
        this.transform(gl);
        this.draw(gl);
        if (locGrid && locGrid.isActive())
            locGrid.afterDraw(this);
        cc.kmGLPopMatrix();
        this.setOrderOfArrival(0);
    },

    /**
     * add child to cc.SpriteBatchNode (override addChild of cc.Node)
     * @override
     * @param {cc.Sprite} child
     * @param {Number} [zOrder]
     * @param {Number} [tag]
     */
    addChild: null,

    _addChildForCanvas: function (child, zOrder, tag) {
        if (child == null)
            throw "cc.SpriteBatchNode.addChild(): child should be non-null";
        if(!(child instanceof cc.Sprite)){
           cc.log( "cc.SpriteBatchNode.addChild(): cc.SpriteBatchNode only supports cc.Sprites as children");
            return;
        }

        zOrder = (zOrder == null) ? child.getZOrder() : zOrder;
        tag = (tag == null) ? child.getTag() : tag;

        cc.Node.prototype.addChild.call(this, child, zOrder, tag);
        this.appendChild(child);
        this.setNodeDirty();
    },

    _addChildForWebGL: function (child, zOrder, tag) {
        if (child == null)
            throw "cc.SpriteBatchNode.addChild(): child should be non-null";
        if(!(child instanceof cc.Sprite)){
            cc.log( "cc.SpriteBatchNode.addChild(): cc.SpriteBatchNode only supports cc.Sprites as children");
            return;
        }
        if(child.getTexture() != this._textureAtlas.getTexture()){                    // check cc.Sprite is using the same texture id
            cc.log( "cc.SpriteBatchNode.addChild(): cc.Sprite is not using the same texture");
            return;
        }

        zOrder = (zOrder == null) ? child.getZOrder() : zOrder;
        tag = (tag == null) ? child.getTag() : tag;

        cc.Node.prototype.addChild.call(this, child, zOrder, tag);
        this.appendChild(child);
        this.setNodeDirty();
    },

    /**
     * <p>Removes all children from the container and do a cleanup all running actions depending on the cleanup parameter. <br/>
     * (override removeAllChildren of cc.Node)</p>
     * @param {Boolean} cleanup
     */
    removeAllChildren:null,

    _removeAllChildrenForCanvas:function (cleanup) {
        // Invalidate atlas index. issue #569
        // useSelfRender should be performed on all descendants. issue #1216
        var locDescendants = this._descendants;
        if (locDescendants && locDescendants.length > 0) {
            for (var i = 0, len = locDescendants.length; i < len; i++) {
                if (locDescendants[i])
                    locDescendants[i].setBatchNode(null);
            }
        }

        cc.Node.prototype.removeAllChildren.call(this, cleanup);
        this._descendants.length = 0;
    },

    _removeAllChildrenForWebGL:function (cleanup) {
        // Invalidate atlas index. issue #569
        // useSelfRender should be performed on all descendants. issue #1216
        var locDescendants = this._descendants;
        if (locDescendants && locDescendants.length > 0) {
            for (var i = 0, len = locDescendants.length; i < len; i++) {
                if (locDescendants[i])
                    locDescendants[i].setBatchNode(null);
            }
        }
        cc.Node.prototype.removeAllChildren.call(this, cleanup);
        this._descendants.length = 0;
        this._textureAtlas.removeAllQuads();
    },

    sortAllChildren:null,

    _sortAllChildrenForCanvas:function () {
        if (this._reorderChildDirty) {
            var i, j = 0, locChildren = this._children;
            var length = locChildren.length, tempChild;
            //insertion sort
            for (i = 1; i < length; i++) {
                var tempItem = locChildren[i];
                j = i - 1;
                tempChild =  locChildren[j];

                //continue moving element downwards while zOrder is smaller or when zOrder is the same but mutatedIndex is smaller
                while (j >= 0 && ( tempItem._zOrder < tempChild._zOrder ||
                    ( tempItem._zOrder == tempChild._zOrder && tempItem._orderOfArrival < tempChild._orderOfArrival ))) {
                    locChildren[j + 1] = tempChild;
                    j = j - 1;
                    tempChild =  locChildren[j];
                }
                locChildren[j + 1] = tempItem;
            }

            //sorted now check all children
            if (locChildren.length > 0) {
                //first sort all children recursively based on zOrder
                this._arrayMakeObjectsPerformSelector(locChildren, cc.Node.StateCallbackType.sortAllChildren);
            }
            this._reorderChildDirty = false;
        }
    },

    _sortAllChildrenForWebGL:function () {
        if (this._reorderChildDirty) {
            var childrenArr = this._children;
            var i, j = 0, length = childrenArr.length, tempChild;
            //insertion sort
            for (i = 1; i < length; i++) {
                var tempItem = childrenArr[i];
                j = i - 1;
                tempChild =  childrenArr[j];

                //continue moving element downwards while zOrder is smaller or when zOrder is the same but mutatedIndex is smaller
                while (j >= 0 && ( tempItem._zOrder < tempChild._zOrder ||
                    ( tempItem._zOrder == tempChild._zOrder && tempItem._orderOfArrival < tempChild._orderOfArrival ))) {
                    childrenArr[j + 1] = tempChild;
                    j = j - 1;
                    tempChild =  childrenArr[j];
                }
                childrenArr[j + 1] = tempItem;
            }

            //sorted now check all children
            if (childrenArr.length > 0) {
                //first sort all children recursively based on zOrder
                this._arrayMakeObjectsPerformSelector(childrenArr, cc.Node.StateCallbackType.sortAllChildren);

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
     * draw cc.SpriteBatchNode (override draw of cc.Node)
     */
    draw:null,

    _drawForWebGL:function () {
        // Optimization: Fast Dispatch
        if (this._textureAtlas.getTotalQuads() === 0)
            return;

        //cc.NODE_DRAW_SETUP(this);
        this._shaderProgram.use();
        this._shaderProgram.setUniformForModelViewAndProjectionMatrixWithMat4();
        this._arrayMakeObjectsPerformSelector(this._children, cc.Node.StateCallbackType.updateTransform);
        cc.glBlendFunc(this._blendFunc.src, this._blendFunc.dst);

        this._textureAtlas.drawQuads();
    }
});

if(cc.Browser.supportWebGL){
    cc.SpriteBatchNode.prototype.ctor = cc.SpriteBatchNode.prototype._ctorForWebGL;
    cc.SpriteBatchNode.prototype.updateQuadFromSprite = cc.SpriteBatchNode.prototype._updateQuadFromSpriteForWebGL;
    cc.SpriteBatchNode.prototype.insertQuadFromSprite = cc.SpriteBatchNode.prototype._insertQuadFromSpriteForWebGL;
    cc.SpriteBatchNode.prototype.initWithTexture = cc.SpriteBatchNode.prototype._initWithTextureForWebGL;
    cc.SpriteBatchNode.prototype.appendChild = cc.SpriteBatchNode.prototype._appendChildForWebGL;
    cc.SpriteBatchNode.prototype.removeSpriteFromAtlas = cc.SpriteBatchNode.prototype._removeSpriteFromAtlasForWebGL;
    cc.SpriteBatchNode.prototype.getTexture = cc.SpriteBatchNode.prototype._getTextureForWebGL;
    cc.SpriteBatchNode.prototype.setTexture = cc.SpriteBatchNode.prototype._setTextureForWebGL;
    cc.SpriteBatchNode.prototype.visit = cc.SpriteBatchNode.prototype._visitForWebGL;
    cc.SpriteBatchNode.prototype.addChild = cc.SpriteBatchNode.prototype._addChildForWebGL;
    cc.SpriteBatchNode.prototype.removeAllChildren = cc.SpriteBatchNode.prototype._removeAllChildrenForWebGL;
    cc.SpriteBatchNode.prototype.sortAllChildren = cc.SpriteBatchNode.prototype._sortAllChildrenForWebGL;
    cc.SpriteBatchNode.prototype.draw = cc.SpriteBatchNode.prototype._drawForWebGL;
} else {
    cc.SpriteBatchNode.prototype.ctor = cc.SpriteBatchNode.prototype._ctorForCanvas;
    cc.SpriteBatchNode.prototype.updateQuadFromSprite = cc.SpriteBatchNode.prototype._updateQuadFromSpriteForCanvas;
    cc.SpriteBatchNode.prototype.insertQuadFromSprite = cc.SpriteBatchNode.prototype._insertQuadFromSpriteForCanvas;
    cc.SpriteBatchNode.prototype.initWithTexture = cc.SpriteBatchNode.prototype._initWithTextureForCanvas;
    cc.SpriteBatchNode.prototype.appendChild = cc.SpriteBatchNode.prototype._appendChildForCanvas;
    cc.SpriteBatchNode.prototype.removeSpriteFromAtlas = cc.SpriteBatchNode.prototype._removeSpriteFromAtlasForCanvas;
    cc.SpriteBatchNode.prototype.getTexture = cc.SpriteBatchNode.prototype._getTextureForCanvas;
    cc.SpriteBatchNode.prototype.setTexture = cc.SpriteBatchNode.prototype._setTextureForCanvas;
    cc.SpriteBatchNode.prototype.visit = cc.SpriteBatchNode.prototype._visitForCanvas;
    cc.SpriteBatchNode.prototype.removeAllChildren = cc.SpriteBatchNode.prototype._removeAllChildrenForCanvas;
    cc.SpriteBatchNode.prototype.addChild = cc.SpriteBatchNode.prototype._addChildForCanvas;
    cc.SpriteBatchNode.prototype.sortAllChildren = cc.SpriteBatchNode.prototype._sortAllChildrenForCanvas;
    cc.SpriteBatchNode.prototype.draw = cc.Node.prototype.draw;
}

/**
 * <p>
 *    creates a cc.SpriteBatchNodeCanvas with a file image (.png, .jpg etc) with a default capacity of 29 children.<br/>
 *    The capacity will be increased in 33% in runtime if it run out of space.<br/>
 *    The file will be loaded using the TextureMgr.<br/>
 * </p>
 * @param {String} fileImage
 * @param {Number} capacity
 * @return {cc.SpriteBatchNode}
 * @example
 * //create a SpriteBatchNode
 * var parent2 = cc.SpriteBatchNode.create("res/animations/grossini.png", 50);
 */
cc.SpriteBatchNode.create = function (fileImage, capacity) {
    capacity = capacity || cc.DEFAULT_SPRITE_BATCH_CAPACITY;
    var batchNode = new cc.SpriteBatchNode();
    batchNode.init(fileImage, capacity);
    return batchNode;
};

/**
 * <p>
 *   creates a cc.SpriteBatchNodeCanvas with a texture2d and a default capacity of 29 children.   <br/>
 *   The capacity will be increased in 33% in runtime if it run out of space.               <br/>
 * </p>
 * @param {cc.Texture2D} texture
 * @param {Number} [capacity]
 * @return {cc.SpriteBatchNode}
 */
cc.SpriteBatchNode.createWithTexture = function (texture, capacity) {
    capacity = capacity || cc.DEFAULT_SPRITE_BATCH_CAPACITY;
    var batchNode = new cc.SpriteBatchNode();
    batchNode.initWithTexture(texture, capacity);
    return batchNode;
};