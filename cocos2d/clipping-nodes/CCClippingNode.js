/****************************************************************************
 Copyright (c) 2008-2010 Ricardo Quesada
 Copyright (c) 2011-2012 cocos2d-x.org
 Copyright (c) 2013-2014 Chukong Technologies Inc.
 Copyright (c) 2012 Pierre-David Bélanger

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
 * the value of stencil bits.
 * @type Number
 */
cc.stencilBits = -1;

/**
 * <p>
 *     cc.ClippingNode is a subclass of cc.Node.                                                            <br/>
 *     It draws its content (children) clipped using a stencil.                                               <br/>
 *     The stencil is an other cc.Node that will not be drawn.                                               <br/>
 *     The clipping is done using the alpha part of the stencil (adjusted with an alphaThreshold).
 * </p>
 * @class
 * @extends cc.Node
 * @param {cc.Node} [stencil=null]
 *
 * @property {Number}   alphaThreshold  - Threshold for alpha value.
 * @property {Boolean}  inverted        - Indicate whether in inverted mode.
 * @property {cc.Node}  stencil         - he cc.Node to use as a stencil to do the clipping.
 */
cc.ClippingNode = cc.Node.extend(/** @lends cc.ClippingNode# */{
    inverted: false,
    _alphaThreshold: 0,

    _stencil: null,
    _className: "ClippingNode",

    _originStencilProgram: null,

    /**
     * Constructor function, override it to extend the construction behavior, remember to call "this._super()" in the extended "ctor" function.
     * @param {cc.Node} [stencil=null]
     */
    ctor: function (stencil) {
        stencil = stencil || null;
        cc.Node.prototype.ctor.call(this);
        this._stencil = stencil;
        if (stencil) {
            this._originStencilProgram = stencil.getShaderProgram();
        }
        this.alphaThreshold = 1;
        this.inverted = false;
        this._renderCmd.initStencilBits();
    },

    /**
     * <p>
     *     Event callback that is invoked every time when node enters the 'stage'.                                   <br/>
     *     If the CCNode enters the 'stage' with a transition, this event is called when the transition starts.        <br/>
     *     During onEnter you can't access a "sister/brother" node.                                                    <br/>
     *     If you override onEnter, you must call its parent's onEnter function with this._super().
     * </p>
     * @function
     */
    onEnter: function () {
        cc.Node.prototype.onEnter.call(this);
        if (this._stencil)
            this._stencil._performRecursive(cc.Node._stateCallbackType.onEnter);
    },

    /**
     * <p>
     *     Event callback that is invoked when the node enters in the 'stage'.                                                        <br/>
     *     If the node enters the 'stage' with a transition, this event is called when the transition finishes.                       <br/>
     *     If you override onEnterTransitionDidFinish, you shall call its parent's onEnterTransitionDidFinish with this._super()
     * </p>
     * @function
     */
    onEnterTransitionDidFinish: function () {
        cc.Node.prototype.onEnterTransitionDidFinish.call(this);
        if (this._stencil)
            this._stencil._performRecursive(cc.Node._stateCallbackType.onEnterTransitionDidFinish);
    },

    /**
     * <p>
     *     callback that is called every time the node leaves the 'stage'.  <br/>
     *     If the node leaves the 'stage' with a transition, this callback is called when the transition starts. <br/>
     *     If you override onExitTransitionDidStart, you shall call its parent's onExitTransitionDidStart with this._super()
     * </p>
     * @function
     */
    onExitTransitionDidStart: function () {
        this._stencil._performRecursive(cc.Node._stateCallbackType.onExitTransitionDidStart);
        cc.Node.prototype.onExitTransitionDidStart.call(this);
    },

    /**
     * <p>
     * callback that is called every time the node leaves the 'stage'. <br/>
     * If the node leaves the 'stage' with a transition, this callback is called when the transition finishes. <br/>
     * During onExit you can't access a sibling node.                                                             <br/>
     * If you override onExit, you shall call its parent's onExit with this._super().
     * </p>
     * @function
     */
    onExit: function () {
        this._stencil._performRecursive(cc.Node._stateCallbackType.onExit);
        cc.Node.prototype.onExit.call(this);
    },

    visit: function (parent) {
        this._renderCmd.clippingVisit(parent && parent._renderCmd);
    },

    _visitChildren: function () {
        var renderer = cc.renderer;
        if (this._reorderChildDirty) {
            this.sortAllChildren();
        }
        var children = this._children, child;
        for (var i = 0, len = children.length; i < len; i++) {
            child = children[i];
            if (child && child._visible) {
                child.visit(this);
            }
        }
        this._renderCmd._dirtyFlag = 0;
    },

    /**
     * <p>
     * The alpha threshold.                                                                                   <br/>
     * The content is drawn only where the stencil have pixel with alpha greater than the alphaThreshold.     <br/>
     * Should be a float between 0 and 1.                                                                     <br/>
     * This default to 1 (so alpha test is disabled).
     * </P>
     * @return {Number}
     */
    getAlphaThreshold: function () {
        return this._alphaThreshold;
    },

    /**
     * set alpha threshold.
     * @param {Number} alphaThreshold
     */
    setAlphaThreshold: function (alphaThreshold) {
        if (alphaThreshold === 1 && alphaThreshold !== this._alphaThreshold) {
            // should reset program used by _stencil
            this._renderCmd.resetProgramByStencil();
        }
        this._alphaThreshold = alphaThreshold;
    },

    /**
     * <p>
     *     Inverted. If this is set to YES,                                                                 <br/>
     *     the stencil is inverted, so the content is drawn where the stencil is NOT drawn.                 <br/>
     *     This default to NO.
     * </p>
     * @return {Boolean}
     */
    isInverted: function () {
        return this.inverted;
    },

    /**
     * set whether or not invert of stencil
     * @param {Boolean} inverted
     */
    setInverted: function (inverted) {
        this.inverted = inverted;
    },

    /**
     * The cc.Node to use as a stencil to do the clipping.                                   <br/>
     * The stencil node will be retained. This default to nil.
     * @return {cc.Node}
     */
    getStencil: function () {
        return this._stencil;
    },

    /**
     * Set stencil.
     * @function
     * @param {cc.Node} stencil
     */
    setStencil: function (stencil) {
        if (this._stencil === stencil)
            return;
        if (stencil)
            this._originStencilProgram = stencil.getShaderProgram();
        this._renderCmd.setStencil(stencil);
    },

    _createRenderCmd: function () {
        if (cc._renderType === cc.game.RENDER_TYPE_CANVAS)
            return new cc.ClippingNode.CanvasRenderCmd(this);
        else
            return new cc.ClippingNode.WebGLRenderCmd(this);
    }
});

var _p = cc.ClippingNode.prototype;

// Extended properties
/** @expose */
_p.stencil;
cc.defineGetterSetter(_p, "stencil", _p.getStencil, _p.setStencil);
/** @expose */
_p.alphaThreshold;
cc.defineGetterSetter(_p, "alphaThreshold", _p.getAlphaThreshold, _p.setAlphaThreshold);


/**
 * Creates and initializes a clipping node with an other node as its stencil. <br/>
 * The stencil node will be retained.
 * @deprecated since v3.0, please use "new cc.ClippingNode(stencil)" instead
 * @param {cc.Node} [stencil=null]
 * @return {cc.ClippingNode}
 * @example
 * //example
 * new cc.ClippingNode(stencil);
 */
cc.ClippingNode.create = function (stencil) {
    return new cc.ClippingNode(stencil);
};
