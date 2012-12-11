/*
 * Copyright (c) 2010-2012 cocos2d-x.org
 * Copyright (C) 2009 Matt Oswald
 * Copyright (c) 2009-2010 Ricardo Quesada
 * Copyright (c) 2011 Zynga Inc.
 * Copyright (c) 2011 Marco Tillemans
 *
 * http://www.cocos2d-x.org
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 */

/**
 * paticle default capacity
 * @constant
 * @type Number
 */
cc.PARTICLE_DEFAULT_CAPACITY = 100;

/**
 * <p>
 *    cc.ParticleBatchNode is like a batch node: if it contains children, it will draw them in 1 single OpenGL call  <br/>
 *    (often known as "batch draw").  </br>
 *
 *    A cc.ParticleBatchNode can reference one and only one texture (one image file, one texture atlas).<br/>
 *    Only the cc.ParticleSystems that are contained in that texture can be added to the cc.SpriteBatchNode.<br/>
 *    All cc.ParticleSystems added to a cc.SpriteBatchNode are drawn in one OpenGL ES draw call.<br/>
 *    If the cc.ParticleSystems are not added to a cc.ParticleBatchNode then an OpenGL ES draw call will be needed for each one, which is less efficient.</br>
 *
 *    Limitations:<br/>
 *    - At the moment only cc.ParticleSystemQuad is supported<br/>
 *    - All systems need to be drawn with the same parameters, blend function, aliasing, texture<br/>
 *
 *    Most efficient usage<br/>
 *    - Initialize the ParticleBatchNode with the texture and enough capacity for all the particle systems<br/>
 *    - Initialize all particle systems and add them as child to the batch node<br/>
 * </p>
 * @class
 * @extends cc.ParticleSystem
 */
cc.ParticleBatchNode = cc.Node.extend(/** @lends cc.ParticleBatchNode# */{
    TextureProtocol:true,
    //the blend function used for drawing the quads
    _blendFunc:{src:cc.BLEND_SRC, dst:cc.BLEND_DST},
    _textureAtlas:null,

    /**
     * initializes the particle system with cc.Texture2D, a capacity of particles
     * @param {cc.Texture2D|HTMLImageElement|HTMLCanvasElement} texture
     * @param {Number} capacity
     * @return {Boolean}
     */
    initWithTexture:function (texture, capacity) {
        this._textureAtlas = new cc.TextureAtlas();
        this._textureAtlas.initWithTexture(texture, capacity);

        // no lazy alloc in this node
        this._children = [];

        this._blendFunc.src = cc.BLEND_SRC;
        this._blendFunc.dst = cc.BLEND_DST;

        //this.setShaderProgram(cc.ShaderCache.getInstance().programForKey(kCCShader_PositionTextureColor));
        return true;
    },

    /**
     * initializes the particle system with the name of a file on disk (for a list of supported formats look at the cc.Texture2D class), a capacity of particles
     * @param {String} fileImage
     * @param {Number} capacity
     * @return {Boolean}
     */
    init:function (fileImage, capacity) {
        var tex = cc.TextureCache.getInstance().addImage(fileImage);
        return this.initWithTexture(tex, capacity);
    },

    /**
     * Add a child into the cc.ParticleBatchNode
     * @param {cc.Node} child
     * @param {Number} zOrder
     * @param {Number} tag
     */
    addChild:function (child, zOrder, tag) {
        switch (arguments.length) {
            case 1:
                this._super(child);
                break;
            case 2:
                this._super(child, zOrder);
                break;
            case 3:
                cc.Assert(child != null, "Argument must be non-NULL");
                cc.Assert(child instanceof cc.ParticleSystem, "cc.ParticleBatchNode only supports cc.QuadParticleSystems as children");
                cc.Assert(child.getTexture() == this._textureAtlas.getTexture(), "cc.ParticleSystem is not using the same texture id");
                // If this is the 1st children, then copy blending function
                if (this._children.length == 0) {
                    var blend = child.getBlendFunc();
                    this.setBlendFunc(blend.src, blend.dst);
                }

                cc.Assert(this._blendFunc.src == child.getBlendFunc().src && this._blendFunc.dst == pChild.getBlendFunc().dst,
                    "Can't add a PaticleSystem that uses a differnt blending function");

                //no lazy sorting, so don't call super addChild, call helper instead
                var pos = this._addChildHelper(pChild, zOrder, tag);

                //get new atlasIndex
                var atlasIndex = 0;

                if (pos != 0) {
                    var p = this._children[pos - 1];
                    atlasIndex = p.getAtlasIndex() + p.getTotalParticles();
                } else {
                    atlasIndex = 0;
                }

                this.insertChild(child, atlasIndex);

                // update quad info
                child.setBatchNode(this);
                break;
            default:
                throw "Argument must be non-nil ";
                break;
        }
    },

    /**
     * Inserts a child into the cc.ParticleBatchNode
     * @param {cc.ParticleSystem} pSystem
     * @param {Number} index
     */
    insertChild:function (pSystem, index) {
        pSystem.setAtlasIndex(index);

        if (this._textureAtlas.getTotalQuads() + pSystem.getTotalParticles() > this._textureAtlas.getCapacity()) {
            this._increaseAtlasCapacityTo(this._textureAtlas.getTotalQuads() + pSystem.getTotalParticles());

            // after a realloc empty quads of textureAtlas can be filled with gibberish (realloc doesn't perform calloc), insert empty quads to prevent it
            this._textureAtlas.fillWithEmptyQuadsFromIndex(this._textureAtlas.getCapacity() - pSystem.getTotalParticles(), pSystem.getTotalParticles());
        }

        // make room for quads, not necessary for last child
        if (pSystem.getAtlasIndex() + pSystem.getTotalParticles() != this._textureAtlas.getTotalQuads()) {
            this._textureAtlas.moveQuadsFromIndex(index, index + pSystem.getTotalParticles());
        }

        // increase totalParticles here for new particles, update method of particlesystem will fill the quads
        this._textureAtlas.increaseTotalQuadsWith(pSystem.getTotalParticles());

        this._updateAllAtlasIndexes();
    },

    /**
     * @param {cc.Node} child
     * @param {Boolean} cleanup
     */
    removeChild:function (child, cleanup) {
        // explicit nil handling
        if (child == null) {
            return;
        }

        cc.Assert(child instanceof cc.ParticleSystem, "cc.ParticleBatchNode only supports cc.QuadParticleSystems as children");
        cc.Assert(this._children.indexOf(child) > -1, "cc.ParticleBatchNode doesn't contain the sprite. Can't remove it");

        this._super(child, cleanup);

        // remove child helper
        this._textureAtlas.removeQuadsAtIndex(child.getAtlasIndex(), pChild.getTotalParticles());

        // after memmove of data, empty the quads at the end of array
        this._textureAtlas.fillWithEmptyQuadsFromIndex(this._textureAtlas.getTotalQuads(), child.getTotalParticles());

        // paticle could be reused for self rendering
        child.setBatchNode(null);

        this._updateAllAtlasIndexes();
    },

    /**
     * Reorder will be done in this function, no "lazy" reorder to particles
     * @param {cc.Node} child
     * @param {Number} zOrder
     */
    reorderChild:function (child, zOrder) {
        cc.Assert(child != null, "Child must be non-NULL");
        cc.Assert(child instanceof cc.ParticleSystem, "cc.ParticleBatchNode only supports cc.QuadParticleSystems as children");

        if (zOrder == child.getZOrder()) {
            return;
        }

        // no reordering if only 1 child
        if (this._children.length > 1) {
            var getIndexes = this._getCurrentIndex(child, zOrder);

            if (getIndexes.oldIndex != getIndexes.newIndex) {
                // reorder m_pChildren.array
                cc.ArrayRemoveObjectAtIndex(this._children, getIndexes.oldIndex);
                this._children = cc.ArrayAppendObjectToIndex(this._children, child, getIndexes.newIndex);

                // save old altasIndex
                var oldAtlasIndex = child.getAtlasIndex();

                // update atlas index
                this._updateAllAtlasIndexes();

                // Find new AtlasIndex
                var newAtlasIndex = 0;
                for (var i = 0; i < this._children.length; i++) {
                    var pNode = this._children[i];
                    if (pNode == child) {
                        newAtlasIndex = child.getAtlasIndex();
                        break;
                    }
                }

                // reorder textureAtlas quads
                this._textureAtlas.moveQuadsFromIndex(oldAtlasIndex, child.getTotalParticles(), newAtlasIndex);

                child.updateWithNoTime();
            }
        }

        child._setZOrder(zOrder);
    },

    /**
     * @param {Number} index
     * @param {Boolean} doCleanup
     */
    removeChildAtIndex:function (index, doCleanup) {
        this.removeChild(this._children[i], doCleanup);
    },

    /**
     * @param {Boolean} doCleanup
     */
    removeAllChildren:function (doCleanup) {
        for (var i = 0; i < this._children.length; i++) {
            this._children[i].setBatchNode(null);
        }
        this._super(doCleanup);
        this._textureAtlas.removeAllQuads();
    },

    /**
     * disables a particle by inserting a 0'd quad into the texture atlas
     * @param {Number} particleIndex
     */
    disableParticle:function (particleIndex) {
        var quad = ((this._textureAtlas.getQuads())[particleIndex]);
        quad.br.vertices.x = quad.br.vertices.y = quad.tr.vertices.x = quad.tr.vertices.y =
            quad.tl.vertices.x = quad.tl.vertices.y = quad.bl.vertices.x = quad.bl.vertices.y = 0.0;
    },

    /**
     * @override
     * @param {CanvasContext} ctx
     */
     // XXX: Remove the "XXX_" prefix once WebGL is supported
    XXX_draw:function (ctx) {
        cc.PROFILER_STOP("CCParticleBatchNode - draw");
        if (this._textureAtlas.getTotalQuads() == 0) {
            return;
        }

        cc.NODE_DRAW_SETUP();

        ccGLBlendFunc(m_tBlendFunc.src, m_tBlendFunc.dst);

        this._textureAtlas.drawQuads();

        cc.PROFILER_STOP("CCParticleBatchNode - draw");
    },

    /**
     * returns the used texture
     * @return {cc.Texture2D|HTMLImageElement|HTMLCanvasElement}
     */
    getTexture:function () {
        return this._textureAtlas.getTexture();
    },

    /**
     * sets a new texture. it will be retained
     * @param {cc.Texture2D|HTMLImageElement|HTMLCanvasElement} texture
     */
    setTexture:function (texture) {
        this._textureAtlas.setTexture(texture);

        // If the new texture has No premultiplied alpha, AND the blendFunc hasn't been changed, then update it
        if (texture && !texture.hasPremultipliedAlpha() && ( m_tBlendFunc.src == gl.BLEND_SRC && m_tBlendFunc.dst == gl.BLEND_DST )) {
            this._blendFunc.src = gl.SRC_ALPHA;
            this._blendFunc.dst = gl.ONE_MINUS_SRC_ALPHA;
        }
    },

    /**
     * set the blending function used for the texture
     * @param {Number} src
     * @param {Number} dst
     */
    setBlendFunc:function (src, dst) {
        if(arguments.length == 1)
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

    // override visit.
    // Don't call visit on it's children
    // XXX: Remove the "XXX_" prefix once WebGL is supported
    XXX_visit:function (ctx) {
        // CAREFUL:
        // This visit is almost identical to cc.Node#visit
        // with the exception that it doesn't call visit on it's children
        //
        // The alternative is to have a void cc.Sprite#visit, but
        // although this is less mantainable, is faster
        //
        if (!this._visible) {
            return;
        }

        kmGLPushMatrix();
        if (this._grid && this._grid.isActive()) {
            this._grid.beforeDraw();
            this.transformAncestors();
        }

        this.transform();
        this.draw();

        if (this._grid && this._grid.isActive()) {
            this._grid.afterDraw(this);
        }
        kmGLPopMatrix();
    },

    _updateAllAtlasIndexes:function () {
        var index = 0;

        for (var i = 0; i < this._children[0].length; i++) {
            var child = this._children[i];
            child.setAtlasIndex(index);
            index += child.getTotalParticles();
        }
    },

    _increaseAtlasCapacityTo:function (quantity) {
        cc.log("cocos2d: cc.ParticleBatchNode: resizing TextureAtlas capacity from [" + this._textureAtlas.getCapacity()
            + "] to [" + quantity + "].");

        if (!this._textureAtlas.resizeCapacity(quantity)) {
            // serious problems
            cc.log("cocos2d: WARNING: Not enough memory to resize the atlas");
            cc.Assert(false, "XXX: cc.ParticleBatchNode #increaseAtlasCapacity SHALL handle this assert");
        }
    },

    _searchNewPositionInChildrenForZ:function (z) {
        var count = this._children.length;
        for (var i = 0; i < count; i++) {
            if (this._children[i].getZOrder() > z) {
                return i;
            }
        }
        return count;
    },

    _getCurrentIndex:function (child, z) {
        var foundCurrentIdx = false;
        var foundNewIdx = false;

        var newIndex = 0;
        var oldIndex = 0;

        var minusOne = 0;
        var count = this._children.length;

        for (var i = 0; i < count; i++) {
            var pNode = this._children[i];
            // new index
            if (pNode.getZOrder() > z && !foundNewIdx) {
                newIndex = i;
                foundNewIdx = true;

                if (foundCurrentIdx && foundNewIdx) {
                    break;
                }
            }
            // current index
            if (child == pNode) {
                oldIndex = i;
                foundCurrentIdx = true;
                if (!foundNewIdx) {
                    minusOne = -1;
                }
                if (foundCurrentIdx && foundNewIdx) {
                    break;
                }
            }
        }

        if (!foundNewIdx) {
            newIndex = count;
        }
        newIndex += minusOne;
        return {newIndex:newIndex, oldIndex:oldIndex};
    },

    // don't use lazy sorting, reordering the particle systems quads afterwards would be too complex
    // XXX research whether lazy sorting + freeing current quads and calloc a new block with size of capacity would be faster
    // XXX or possibly using vertexZ for reordering, that would be fastest
    // this helper is almost equivalent to CCNode's addChild, but doesn't make use of the lazy sorting
    _addChildHelper:function (child, z, aTag) {
        cc.Assert(child != null, "Argument must be non-nil");
        cc.Assert(child.getParent() == null, "child already added. It can't be added again");

        if (!this._children) {
            this._children = [];
        }

        //don't use a lazy insert
        var pos = this._searchNewPositionInChildrenForZ(z);

        this._children = cc.ArrayAppendObjectToIndex(this._children, child, pos);

        child.setTag(aTag);
        child._setZOrder(z);

        child.setParent(this);

        if (this._running) {
            child.onEnter();
            child.onEnterTransitionDidFinish();
        }
        return pos;
    },

    _updateBlendFunc:function () {
        if (!this._textureAtlas.getTexture().hasPremultipliedAlpha()) {
            this._blendFunc.src = gl.SRC_ALPHA;
            this._blendFunc.dst = gl.ONE_MINUS_SRC_ALPHA;
        }
    },

    _getTextureAtlas:function () {
    },
    _setTextureAtlas:function (textureAtlas) {
    }
});

/**
 * initializes the particle system with cc.Texture2D, a capacity of particles, which particle system to use
 * @param {cc.Texture2D|HTMLImageElement|HTMLCanvasElement} texture
 * @param {Number} capacity
 * @return {cc.ParticleBatchNode}
 */
cc.ParticleBatchNode.createWithTexture = function (texture, capacity) {
    var ret = new cc.ParticleBatchNode();
    if (ret && ret.initWithTexture(texture, capacity)) {
        return ret;
    }
    return null;
};

/**
 * initializes the particle system with the name of a file on disk (for a list of supported formats look at the cc.Texture2D class), a capacity of particles
 * @param {String} fileImage
 * @param capacity
 * @return {cc.ParticleBatchNode}
 */
cc.ParticleBatchNode.create = function (fileImage, capacity) {
    var ret = new cc.ParticleBatchNode();
    if (ret && ret.init(fileImage, capacity)) {
        return ret;
    }
    return null;
};
