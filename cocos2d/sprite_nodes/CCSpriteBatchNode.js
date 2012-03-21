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
    _m_pobTextureAtlas:null,
    _m_blendFunc:null,
    // all descendants: chlidren, gran children, etc...
    _m_pobDescendants:[],

    _updateBlendFunc:function(){
        if (! this._m_pobTextureAtlas.getTexture().getHasPremultipliedAlpha())
        {
            this._m_blendFunc.src = cc.GL_SRC_ALPHA;
            this._m_blendFunc.dst = cc.GL_ONE_MINUS_SRC_ALPHA;
        }
    },

    /* IMPORTANT XXX IMPORTNAT:
     * These 2 methods can't be part of CCTMXLayer since they call [super add...], and CCSpriteSheet#add SHALL not be called
     */

    /* Adds a quad into the texture atlas but it won't be added into the children array.
     This method should be called only when you are dealing with very big AtlasSrite and when most of the CCSprite won't be updated.
     For example: a tile map (CCTMXMap) or a label with lots of characters (BitmapFontAtlas)
     */
    addQuadFromSprite:function(sprite,index){
        cc.Assert( sprite != null, "SpriteBatchNode.addQuadFromSprite():Argument must be non-nil");

        /// @todo CCAssert( [sprite isKindOfClass:[CCSprite class]], @"CCSpriteSheet only supports CCSprites as children");

        while(index >= this._m_pobTextureAtlas.getCapacity() || this._m_pobTextureAtlas.getCapacity() == this._m_pobTextureAtlas.getTotalQuads()){
            this.increaseAtlasCapacity();
        }
        //
        // update the quad directly. Don't add the sprite to the scene graph
        //
        sprite.useBatchNode(this);
        sprite.setAtlasIndex(index);

        var quad = sprite.getQuad();
        this._m_pobTextureAtlas.insertQuad(quad, index);

        // XXX: updateTransform will update the textureAtlas too using updateQuad.
        // XXX: so, it should be AFTER the insertQuad
        sprite.setDirty(true);
        sprite.updateTransform();
    },

    /* This is the opposite of "addQuadFromSprite.
     It add the sprite to the children and descendants array, but it doesn't update add it to the texture atlas
     */
    addSpriteWithoutQuad:function(child,z,aTag){
        cc.Assert( child != NULL, "SpriteBatchNode.addQuadFromSprite():Argument must be non-nil");
        /// @todo CCAssert( [child isKindOfClass:[CCSprite class]], @"CCSpriteSheet only supports CCSprites as children");

        // quad index is Z
        child.setAtlasIndex(z);

        // XXX: optimize with a binary search
        var i=0;
        if (this._m_pobDescendants && this._m_pobDescendants.length > 0){
            var pObject = null;
            for(var index in this._m_pobDescendants){
                pObject = this._m_pobDescendants[index];
                if (pChild && (pChild.getAtlasIndex() >= z)){
                    ++i;
                }
            }
        }
        cc.ArrayAppendObjectToIndex(this._m_pobDescendants,child, i);

        // IMPORTANT: Call super, and not self. Avoid adding it to the texture atlas array
        this._superprototype.addChild.call(this,child, z, aTag);
        //CCNode::addChild(child, z, aTag);
        return this;
    },

    // property
    getTextureAtlas:function(){return this._m_pobTextureAtlas;},
    setTextureAtlas:function(textureAtlas){
        if (textureAtlas != this._m_pobTextureAtlas)
        {
            //CC_SAFE_RETAIN(textureAtlas);
            //CC_SAFE_RELEASE(m_pobTextureAtlas);
            this._m_pobTextureAtlas = textureAtlas;
        }
    },

    getDescendants:function(){return  this._m_pobDescendants; },

    /** initializes a CCSpriteBatchNode with a texture2d and capacity of children.
     The capacity will be increased in 33% in runtime if it run out of space.
     */
    initWithTexture:function(tex,capacity){
        this._m_blendFunc.src = cc.BLEND_SRC;
        this._m_blendFunc.dst = cc.BLEND_DST;
        this._m_pobTextureAtlas = new cc.TextureAtlas();
        this._m_pobTextureAtlas.initWithTexture(tex, capacity);

        this._updateBlendFunc();

        // no lazy alloc in this node
        this._m_pChildren = [];
        this._m_pobDescendants = [];
        return true;
    },

    /** initializes a CCSpriteBatchNode with a file image (.png, .jpeg, .pvr, etc) and a capacity of children.
     The capacity will be increased in 33% in runtime if it run out of space.
     The file will be loaded using the TextureMgr.
     */
    initWithFile:function(fileImage,capacity){
       var pTexture2D = cc.TextureCache.sharedTextureCache().addImage(fileImage);
        return initWithTexture(pTexture2D, capacity);
    },

    increaseAtlasCapacity:function(){
        // if we're going beyond the current TextureAtlas's capacity,
        // all the previously initialized sprites will need to redo their texture coords
        // this is likely computationally expensive
        var quantity = (this._m_pobTextureAtlas.getCapacity() + 1) * 4 / 3;

        cc.LOG("cocos2d: CCSpriteBatchNode: resizing TextureAtlas capacity from " +this._m_pobTextureAtlas.getCapacity()+" to ["+quantity+"].");

        if (! this._m_pobTextureAtlas.resizeCapacity(quantity)){
            // serious problems
            cc.LOG("cocos2d: WARNING: Not enough memory to resize the atlas");
            cc.Assert(false, "Not enough memory to resize the atla");
        }
    },

    /** removes a child given a certain index. It will also cleanup the running actions depending on the cleanup parameter.
     @warning Removing a child from a CCSpriteBatchNode is very slow
     */
    removeChildAtIndex:function(uIndex,bDoCleanup){
        //TODO index
        this.removeChild(this._m_pChildren[uIndex], bDoCleanup);
    },

    // add child helper
    insertChild:function(pobSprite,uIndex){
        pobSprite.useBatchNode(this);
        pobSprite.setAtlasIndex(uIndex);
        pobSprite.setDirty(true);

        if (this._m_pobTextureAtlas.getTotalQuads() == this._m_pobTextureAtlas.getCapacity()) {
            this.increaseAtlasCapacity();
        }

        var quad = pobSprite.getQuad();
        this._m_pobTextureAtlas.insertQuad(quad, uIndex);

        cc.ArrayAppendObjectToIndex(this._m_pobDescendants,pobSprite,uIndex);
        //this._m_pobDescendants.insertObject(pobSprite, uIndex);

        // update indices
        var i = 0;
        if (this._m_pobDescendants && this._m_pobDescendants.length > 0)
        {
            var  pObject = null;
            for(var index in this._m_pobDescendants){
                pObject = this._m_pobDescendants[index];
                if(pObject){
                    if(i>uIndex){
                        pObject.setAtlasIndex(pObject.getAtlasIndex() +1);
                    }
                    ++i;
                }
            }
        }

        // add children recursively
        var pChildren = pobSprite.getChildren();
        if (pChildren && pChildren.length > 0){
            var pObject = null;
            for(var index in this._m_pobDescendants){
                pObject = this._m_pobDescendants[index];
                if(pObject){
                    var getIndex = this.atlasIndexForChild(pObject,pObject.getZOrder());
                    this.insertChild(pChild, getIndex);
                }
            }
        }
    },
    removeSpriteFromAtlas:function(pobSprite){
        // remove from TextureAtlas
        this._m_pobTextureAtlas.removeQuadAtIndex(pobSprite.getAtlasIndex());

        // Cleanup sprite. It might be reused (issue #569)
        pobSprite.useSelfRender();

        var uIndex = cc.ArrayGetIndexOfObject(this._m_pobDescendants,pobSprite);
        if (uIndex != -1){
            cc.ArrayRemoveObjectAtIndex(this._m_pobDescendants,uIndex);

            // update all sprites beyond this one
            var len = this._m_pobDescendants.length;
            for(; uIndex < len; ++uIndex){
                var s = this._m_pobDescendants[uIndex];
                s.setAtlasIndex( s.getAtlasIndex() - 1 );
            }
        }

        // remove children recursively
        var pChildren = pobSprite.getChildren();
        if (pChildren && pChildren.length > 0){
            var pObject = null;
            for(var i in pChildren){
                pObject = pChildren[i];
                if(pObject){
                    this.removeSpriteFromAtlas(pObject);
                }
            }
        }
    },

    rebuildIndexInOrder:function(pobParent,uIndex){

        var pChildren = pobParent.getChildren();

        if (pChildren && pChildren.length > 0){
            var pObject = null;
            for(var i  in pChildren){
                pObject = pChildren[i];
                if(pObject && (pObject.getZOrder() < 0)){
                    uIndex = this.rebuildIndexInOrder(pObject, uIndex);
                }
            }
        }

        // ignore self (batch node)
        if (! pobParent.isEqual(this)){
            pobParent.setAtlasIndex(uIndex);
            uIndex++;
        }

        if (pChildren && pChildren.length > 0){
            var pObject = null;
            for(var i  in pChildren){
                pObject = pChildren[i];
                if(pObject && (pObject.getZOrder() >= 0)){
                    uIndex = this.rebuildIndexInOrder(pObject, uIndex);
                }
            }
        }

        return uIndex;
    },
    highestAtlasIndexInChild:function(pSprite){
        var pChildren = pSprite.getChildren();

        if (! pChildren || pChildren.length == 0){
            return pSprite.getAtlasIndex();
        } else {
            return this.highestAtlasIndexInChild(pChildren.pop());
        }
    },
    lowestAtlasIndexInChild:function(pSprite){
        var pChildren = pSprite.getChildren();

        if (! pChildren || pChildren.length == 0){
            return pSprite.getAtlasIndex();
        } else {
            return this.lowestAtlasIndexInChild(pChildren.pop());
        }
    },

    atlasIndexForChild:function(pobSprite,nZ){
        var pBrothers = pobSprite.getParent().getChildren();
        var uChildIndex = cc.ArrayGetIndexOfObject(pBrothers,pobSprite);

        // ignore parent Z if parent is spriteSheet
        var bIgnoreParent = pobSprite.getParent() == this;
        var pPrevious = null;
        if (uChildIndex > 0 && uChildIndex < cc.UINT_MAX){
            pPrevious = pBrothers[uChildIndex - 1];
        }

        // first child of the sprite sheet
        if (bIgnoreParent){
            if (uChildIndex == 0){
                return 0;
            }
            return this.highestAtlasIndexInChild(pPrevious) + 1;
        }

        // parent is a CCSprite, so, it must be taken into account
        // first child of an CCSprite ?
        if (uChildIndex == 0){
            var p = pobSprite.getParent();

            // less than parent and brothers
            if (nZ < 0){
                return p.getAtlasIndex();
            } else {
                return p.getAtlasIndex() + 1;
            }
        } else {
            // previous & sprite belong to the same branch
            if ((pPrevious.getZOrder() < 0 && nZ < 0) || (pPrevious.getZOrder() >= 0 && nZ >= 0)){
                return this.highestAtlasIndexInChild(pPrevious) + 1;
            }

            // else (previous < 0 and sprite >= 0 )
            var p = pobSprite.getParent();
            return p.getAtlasIndex() + 1;
        }

        // Should not happen. Error calculating Z on SpriteSheet
        cc.Assert(0, "CCSpriteBatchNode.atlasIndexForChild():should not run here");
        return 0;
    },

    // CCTextureProtocol
    getTexture:function(){return this._m_pobTextureAtlas.getTexture();},
    setTexture:function(texture){
        this._m_pobTextureAtlas.setTexture(texture);
        this._updateBlendFunc();
    },
    setBlendFunc:function(blendFunc){this._m_blendFunc = blendFunc;},
    getBlendFunc:function(){return this._m_blendFunc;},

    // override visit
    // don't call visit on it's children
    visit:function(){
        // CAREFUL:
        // This visit is almost identical to CocosNode#visit
        // with the exception that it doesn't call visit on it's children
        //
        // The alternative is to have a void CCSprite#visit, but
        // although this is less mantainable, is faster
        //
        if(!this._m_bIsVisible){
            return;
        }

        //TODO Code for OpenGL
        //glPushMatrix();

        if (this._m_pGrid && this._m_pGrid.isActive()){
            this._m_pGrid.beforeDraw();
            this.transformAncestors();
        }

        this.transform();
        this.draw();

        if (this._m_pGrid && this._m_pGrid.isActive()){
            this._m_pGrid.afterDraw(this);
        }

        //glPopMatrix();
    },

    addChild:function(child,zOrder,tag){
        switch(arguments.length){
            case 1:
                this._super(child);
                break;
            case 2:
                this._super(child,zOrder);
                break;
            case 3:
                cc.Assert(child != null, "SpriteBatchNode.addChild():child should not be null");

                var pSprite = child;
                // check CCSprite is using the same texture id
                cc.Assert(pSprite.getTexture().getName() == m_pobTextureAtlas.getTexture().getName(), "SpriteBatchNode.addChild():check CCSprite is using the same texture id");

                this._super(child, zOrder, tag);

                var uIndex = this.atlasIndexForChild(pSprite, zOrder);
                this.insertChild(pSprite, uIndex);
                break;
            default:
                throw "Argument must be non-nil ";
                break;
        }
    },

    // override reorderChild
    reorderChild:function(child,zOrder){
        cc.Assert(child != null, "SpriteBatchNode.addChild():the child should not be null");
        cc.Assert(this._m_pChildren.containsObject(child), "SpriteBatchNode.addChild():sprite batch node should contain the child");

        if (zOrder == child.getZOrder()){
            return;
        }

        // xxx: instead of removing/adding, it is more efficient ot reorder manually
        this.removeChild(child, false);
        this.addChild(child, zOrder);
    },

    // override remove child
    removeChild:function(child,cleanup){
        // explicit null handling
        if (child == null){
            return;
        }

        cc.Assert(this._m_pChildren.containsObject(child), "SpriteBatchNode.addChild():sprite batch node should contain the child");

        // cleanup before removing
        this.removeSpriteFromAtlas(child);
        this._super(child,cleanup);
    },
    removeAllChildrenWithCleanup:function(cleanup){
        // Invalidate atlas index. issue #569
        if (this._m_pChildren && this._m_pChildren.length > 0){
            var pObject = null;
            for(var i in this._m_pChildren){
                pObject = this._m_pChildren[i];
                if(pObject){
                    this.removeSpriteFromAtlas(pObject);
                }
            }
        }

        this._super(cleanup);
        this._m_pobDescendants = [];
        this._m_pobTextureAtlas.removeAllQuads();
    },

    // draw
    draw:function(){
        this._super();

        // Optimization: Fast Dispatch
        if (this._m_pobTextureAtlas.getTotalQuads() == 0){
            return;
        }

        if (this._m_pobDescendants && this._m_pobDescendants.length > 0){
            var pObject = null;
            for(var i in this._m_pobDescendants){
                pObject = this._m_pobDescendants[i];
                if(pObject){
                    pObject.updateTransform();

                    // issue #528
                    var rect = pObject.boundingBox();
                    var vertices=[
                        cc.ccp(rect.origin.x,rect.origin.y),
                        cc.ccp(rect.origin.x+rect.size.width,rect.origin.y),
                        cc.ccp(rect.origin.x+rect.size.width,rect.origin.y+rect.size.height),
                        cc.ccp(rect.origin.x,rect.origin.y+rect.size.height)
                    ];
                    cc.drawingUtil.drawPoly(vertices, 4, true);
                }
            }
        }

        // Default GL states: GL_TEXTURE_2D, GL_VERTEX_ARRAY, GL_COLOR_ARRAY, GL_TEXTURE_COORD_ARRAY
        // Needed states: GL_TEXTURE_2D, GL_VERTEX_ARRAY, GL_COLOR_ARRAY, GL_TEXTURE_COORD_ARRAY
        // Unneeded states: -
        //TODO OpenGL Method
        var newBlend = this._m_blendFunc.src != cc.BLEND_SRC || this._m_blendFunc.dst != cc.BLEND_DST;
        if (newBlend){
            //glBlendFunc(m_blendFunc.src, m_blendFunc.dst);
        }

        this._m_pobTextureAtlas.drawQuads();
        if (newBlend){
            //glBlendFunc(CC_BLEND_SRC, CC_BLEND_DST);
        }
    }
});

/** creates a CCSpriteBatchNode with a texture2d and a default capacity of 29 children.
 The capacity will be increased in 33% in runtime if it run out of space.
 */
cc.SpriteBatchNode.batchNodeWithTexture = function(tex,capacity){
    if(!capacity){
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
cc.SpriteBatchNode.batchNodeWithFile = function(fileImage,capacity){
    if(!capacity){
        capacity = cc.defaultCapacity;
    }

    var batchNode = new cc.SpriteBatchNode();
    batchNode.initWithFile(fileImage, capacity);

    return batchNode;
};


