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
 * <p>
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
 * @example
 *
 * // 1. create a SpriteBatchNode with image path
 * var spriteBatchNode = new cc.SpriteBatchNode("res/animations/grossini.png");
 *
 * // 2. create a SpriteBatchNode with texture
 * var texture = cc.textureCache.addImage("res/animations/grossini.png");
 * var spriteBatchNode = new cc.SpriteBatchNode(texture);
 *
 * @property {cc.TextureAtlas}  textureAtlas    - The texture atlas
 * @property {Array}            descendants     - <@readonly> Descendants of sprite batch node
 */
cc.SpriteBatchNode = cc.Node.extend(/** @lends cc.SpriteBatchNode# */{
    _blendFunc: null,
    // all descendants: chlidren, gran children, etc...
    _texture: null,
    _className: "SpriteBatchNode",

    ctor: function (fileImage) {
        cc.Node.prototype.ctor.call(this);
        this._blendFunc = new cc.BlendFunc(cc.BLEND_SRC, cc.BLEND_DST);

        var texture2D;
        if (cc.isString(fileImage)) {
            texture2D = cc.textureCache.getTextureForKey(fileImage);
            if (!texture2D)
                texture2D = cc.textureCache.addImage(fileImage);
        }else if (fileImage instanceof cc.Texture2D)
            texture2D = fileImage;

        texture2D && this.initWithTexture(texture2D);
    },

    /**
     * <p>
     *    Same as addChild
     * </p>
     * @param {cc.Sprite} child
     * @param {Number} z zOrder
     * @param {Number} aTag
     * @return {cc.SpriteBatchNode}
     * @deprecated since v3.12
     */
    addSpriteWithoutQuad: function (child, z, aTag) {
        this.addChild(child, z, aTag);
        return this;
    },

    // property
    /**
     * Return null, no texture atlas is used any more
     * @return {cc.TextureAtlas}
     * @deprecated since v3.12
     */
    getTextureAtlas: function () {
        return null;
    },

    /**
     * TextureAtlas of cc.SpriteBatchNode setter
     * @param {cc.TextureAtlas} textureAtlas
     * @deprecated since v3.12
     */
    setTextureAtlas: function (textureAtlas) {},

    /**
     * Return Descendants of cc.SpriteBatchNode
     * @return {Array}
     * @deprecated since v3.12
     */
    getDescendants: function () {
        return this._children;
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
     * Do nothing
     * @deprecated since v3.12
     */
    increaseAtlasCapacity: function () {},

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
     * Do nothing
     * @param {cc.Sprite} pobParent
     * @param {Number} index
     * @return {Number}
     * @deprecated since v3.12
     */
    rebuildIndexInOrder: function (pobParent, index) {
        return index;
    },

    /**
     * Returns highest atlas index in child
     * @param {cc.Sprite} sprite
     * @return {Number}
     * @deprecated since v3.12
     */
    highestAtlasIndexInChild: function (sprite) {
        var children = sprite.children;
        if (!children || children.length === 0)
            return sprite.zIndex;
        else
            return this.highestAtlasIndexInChild(children[children.length - 1]);
    },

    /**
     * Returns lowest atlas index in child
     * @param {cc.Sprite} sprite
     * @return {Number}
     * @deprecated since v3.12
     */
    lowestAtlasIndexInChild: function (sprite) {
        var children = sprite.children;
        if (!children || children.length === 0)
            return sprite.zIndex;
        else
            return this.lowestAtlasIndexInChild(children[children.length - 1]);
    },

    /**
     * Returns index for child
     * @param {cc.Sprite} sprite
     * @return {Number}
     * @deprecated since v3.12
     */
    atlasIndexForChild: function (sprite) {
        return sprite.zIndex;
    },

    /**
     * Sprites use this to start sortChildren, don't call this manually
     * @param {Boolean} reorder
     * @deprecated since v3.12
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
        return new cc.BlendFunc(this._blendFunc.src,this._blendFunc.dst);
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
    updateQuadFromSprite: function (sprite, index) {
        cc.assert(sprite, cc._LogInfos.CCSpriteBatchNode_updateQuadFromSprite_2);
        if (!(sprite instanceof cc.Sprite)) {
            cc.log(cc._LogInfos.CCSpriteBatchNode_updateQuadFromSprite);
            return;
        }

        //
        // update the quad directly. Don't add the sprite to the scene graph
        //
        sprite.dirty = true;
        // UpdateTransform updates the textureAtlas quad
        sprite._renderCmd.transform(this._renderCmd, true);
    },

    /**
     * <p>
     *    Same as addChild(sprite, index)
     * </p>
     * @function
     * @param {cc.Sprite} sprite
     * @param {Number} index
     * @deprecated since v3.12
     */
    insertQuadFromSprite: function (sprite, index) {
        this.addChild(sprite, index);
    },

    /**
     * Same as addChild(sprite, index)
     * @param {cc.Sprite} sprite The child sprite
     * @param {Number} index The insert index
     * @deprecated since v3.12
     */
    insertChild: function (sprite, index) {
        this.addChild(sprite, index);
    },

    /**
     * Add child at the end
     * @function
     * @param {cc.Sprite} sprite
     */
    appendChild: function (sprite) {
        this.sortAllChildren();
        var lastLocalZOrder = this._children[this._children.length-1]._localZOrder;
        this.addChild(sprite. lastLocalZOrder + 1);
    },

    /**
     * Same as removeChild
     * @function
     * @param {cc.Sprite} sprite
     * @param {Boolean} [cleanup=true]  true if all running actions and callbacks on the child node will be cleanup, false otherwise.
     * @deprecated since v3.12
     */
    removeSpriteFromAtlas: function (sprite, cleanup) {
        this.removeChild(sprite, cleanup);
    },

    /**
     * Set the texture property
     * @function
     * @param {cc.Texture2D} tex
     * @return {Boolean}
     */
    initWithTexture: function (tex) {
        this.setTexture(tex);
        return true;
    },

    // CCTextureProtocol
    /**
     * Returns texture of the sprite batch node
     * @function
     * @return {cc.Texture2D}
     */
    getTexture: function () {
        return this._texture;
    },

    /**
     * Sets the texture of the sprite batch node.
     * @function
     * @param {cc.Texture2D} texture
     */
    setTexture: function(texture){
        this._texture = texture;

        if (texture._textureLoaded) {
            var children = this._children, i, len = children.length;
            for (i = 0; i < len; ++i) {
                children[i].setTexture(texture);
            }
        }
        else {
            texture.addEventListener("load", function(){
                var children = this._children, i, len = children.length;
                for (i = 0; i < len; ++i) {
                    children[i].setTexture(texture);
                }
            }, this);
        }
    },

    setShaderProgram: function (newShaderProgram) {
        this._renderCmd.setShaderProgram(newShaderProgram);
        var children = this._children, i, len = children.length;
        for (i = 0; i < len; ++i) {
            children[i].setShaderProgram(newShaderProgram);
        }
    },

    /**
     * Add child to the sprite batch node (override addChild of cc.Node)
     * @function
     * @override
     * @param {cc.Sprite} child
     * @param {Number} [zOrder]
     * @param {Number} [tag]
     */
    addChild: function (child, zOrder, tag) {
        cc.assert(child !== undefined, cc._LogInfos.CCSpriteBatchNode_addChild_3);

        if(!this._isValidChild(child))
            return;

        zOrder = (zOrder === undefined) ? child.zIndex : zOrder;
        tag = (tag === undefined) ? child.tag : tag;
        cc.Node.prototype.addChild.call(this, child, zOrder, tag);
        
        // Apply shader
        if (this._renderCmd._shaderProgram) {
            child.shaderProgram = this._renderCmd._shaderProgram;
        }
    },

    _isValidChild: function (child) {
        if (!(child instanceof cc.Sprite)) {
            cc.log(cc._LogInfos.Sprite_addChild_4);
            return false;
        }
        if (child.texture !== this._texture) {
            cc.log(cc._LogInfos.Sprite_addChild_5);
            return false;
        }
        return true;
    }
});

var _p = cc.SpriteBatchNode.prototype;

// Override properties
cc.defineGetterSetter(_p, "texture", _p.getTexture, _p.setTexture);
cc.defineGetterSetter(_p, "shaderProgram", _p.getShaderProgram, _p.setShaderProgram);


/**
 * <p>
 *    creates a cc.SpriteBatchNodeCanvas with a file image (.png, .jpg etc) with a default capacity of 29 children.<br/>
 *    The capacity will be increased in 33% in runtime if it run out of space.<br/>
 *    The file will be loaded using the TextureMgr.<br/>
 * </p>
 * @deprecated since v3.0, please use new construction instead
 * @see cc.SpriteBatchNode
 * @param {String|cc.Texture2D} fileImage
 * @return {cc.SpriteBatchNode}
 */
cc.SpriteBatchNode.create = function (fileImage) {
    return new cc.SpriteBatchNode(fileImage);
};

/**
 * @deprecated since v3.0, please use new construction instead
 * @see cc.SpriteBatchNode
 * @function
 */
cc.SpriteBatchNode.createWithTexture = cc.SpriteBatchNode.create;
