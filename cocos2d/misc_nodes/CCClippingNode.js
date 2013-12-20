/****************************************************************************
 Copyright (c) 2010-2013 cocos2d-x.org
 Copyright (c) 2008-2010 Ricardo Quesada
 Copyright (c) 2011      Zynga Inc.
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

cc.stencilBits = -1;

cc.setProgram = function (node, program) {
    node.setShaderProgram(program);

    var children = node.getChildren();
    if (!children)
        return;

    for (var i = 0; i < children.length; i++)
        cc.setProgram(children[i], program);
};

/**
 * <p>
 *     cc.ClippingNode is a subclass of cc.Node.                                                            <br/>
 *     It draws its content (childs) clipped using a stencil.                                               <br/>
 *     The stencil is an other cc.Node that will not be drawn.                                               <br/>
 *     The clipping is done using the alpha part of the stencil (adjusted with an alphaThreshold).
 * </p>
 * @class
 * @extends cc.Node
 */
cc.ClippingNode = cc.Node.extend(/** @lends cc.ClippingNode# */{
    _stencil: null,
    _alphaThreshold: 0,
    _inverted: false,
    _godhelpme: false,

    ctor: function () {
        cc.Node.prototype.ctor.call(this);
        this._stencil = null;
        this._alphaThreshold = 0;
        this._inverted = false;
    },

    /**
     * Initializes a clipping node with an other node as its stencil.                          <br/>
     * The stencil node will be retained, and its parent will be set to this clipping node.
     * @param {cc.Node} [stencil=null]
     */
    init: null,

    _initForWebGL: function (stencil) {
        this._stencil = stencil;

        this._alphaThreshold = 1;
        this._inverted = false;
        // get (only once) the number of bits of the stencil buffer
        cc.ClippingNode._init_once = true;
        if (cc.ClippingNode._init_once) {
            cc.stencilBits = cc.renderContext.getParameter(cc.renderContext.STENCIL_BITS);
            if (cc.stencilBits <= 0)
                cc.log("Stencil buffer is not enabled.");
            cc.ClippingNode._init_once = false;
        }
        return true;
    },

    _initForCanvas: function (stencil) {
        this._stencil = stencil;
        this._alphaThreshold = 1;
        this._inverted = false;
    },

    onEnter: function () {
        cc.Node.prototype.onEnter.call(this);
        this._stencil.onEnter();
    },

    onEnterTransitionDidFinish: function () {
        cc.Node.prototype.onEnterTransitionDidFinish.call(this);
        this._stencil.onEnterTransitionDidFinish();
    },

    onExitTransitionDidStart: function () {
        this._stencil.onExitTransitionDidStart();
        cc.Node.prototype.onExitTransitionDidStart.call(this);
    },

    onExit: function () {
        this._stencil.onExit();
        cc.Node.prototype.onExit.call(this);
    },

    visit: null,

    _visitForWebGL: function (ctx) {
        var gl = ctx || cc.renderContext;

        // if stencil buffer disabled
        if (cc.stencilBits < 1) {
            // draw everything, as if there where no stencil
            cc.Node.prototype.visit.call(this, ctx);
            return;
        }

        // return fast (draw nothing, or draw everything if in inverted mode) if:
        // - nil stencil node
        // - or stencil node invisible:
        if (!this._stencil || !this._stencil.isVisible()) {
            if (this._inverted)
                cc.Node.prototype.visit.call(this, ctx);   // draw everything
            return;
        }

        // store the current stencil layer (position in the stencil buffer),
        // this will allow nesting up to n CCClippingNode,
        // where n is the number of bits of the stencil buffer.
        cc.ClippingNode._layer = -1;

        // all the _stencilBits are in use?
        if (cc.ClippingNode._layer + 1 == cc.stencilBits) {
            // warn once
            cc.ClippingNode._visit_once = true;
            if (cc.ClippingNode._visit_once) {
                cc.log("Nesting more than " + cc.stencilBits + "stencils is not supported. Everything will be drawn without stencil for this node and its childs.");
                cc.ClippingNode._visit_once = false;
            }
            // draw everything, as if there where no stencil
            cc.Node.prototype.visit.call(this, ctx);
            return;
        }

        ///////////////////////////////////
        // INIT

        // increment the current layer
        cc.ClippingNode._layer++;

        // mask of the current layer (ie: for layer 3: 00000100)
        var mask_layer = 0x1 << cc.ClippingNode._layer;
        // mask of all layers less than the current (ie: for layer 3: 00000011)
        var mask_layer_l = mask_layer - 1;
        // mask of all layers less than or equal to the current (ie: for layer 3: 00000111)
        var mask_layer_le = mask_layer | mask_layer_l;

        // manually save the stencil state
        var currentStencilEnabled = gl.isEnabled(gl.STENCIL_TEST);
        var currentStencilWriteMask = gl.getParameter(gl.STENCIL_WRITEMASK);
        var currentStencilFunc = gl.getParameter(gl.STENCIL_FUNC);
        var currentStencilRef = gl.getParameter(gl.STENCIL_REF);
        var currentStencilValueMask = gl.getParameter(gl.STENCIL_VALUE_MASK);
        var currentStencilFail = gl.getParameter(gl.STENCIL_FAIL);
        var currentStencilPassDepthFail = gl.getParameter(gl.STENCIL_PASS_DEPTH_FAIL);
        var currentStencilPassDepthPass = gl.getParameter(gl.STENCIL_PASS_DEPTH_PASS);

        // enable stencil use
        gl.enable(gl.STENCIL_TEST);
        // check for OpenGL error while enabling stencil test
        //cc.CHECK_GL_ERROR_DEBUG();

        // all bits on the stencil buffer are readonly, except the current layer bit,
        // this means that operation like glClear or glStencilOp will be masked with this value
        gl.stencilMask(mask_layer);

        // manually save the depth test state
        //GLboolean currentDepthTestEnabled = GL_TRUE;
        //currentDepthTestEnabled = glIsEnabled(GL_DEPTH_TEST);
        var currentDepthWriteMask = gl.getParameter(gl.DEPTH_WRITEMASK);

        // disable depth test while drawing the stencil
        //glDisable(GL_DEPTH_TEST);
        // disable update to the depth buffer while drawing the stencil,
        // as the stencil is not meant to be rendered in the real scene,
        // it should never prevent something else to be drawn,
        // only disabling depth buffer update should do
        gl.depthMask(false);

        ///////////////////////////////////
        // CLEAR STENCIL BUFFER

        // manually clear the stencil buffer by drawing a fullscreen rectangle on it
        // setup the stencil test func like this:
        // for each pixel in the fullscreen rectangle
        //     never draw it into the frame buffer
        //     if not in inverted mode: set the current layer value to 0 in the stencil buffer
        //     if in inverted mode: set the current layer value to 1 in the stencil buffer
        gl.stencilFunc(gl.NEVER, mask_layer, mask_layer);
        gl.stencilOp(!this._inverted ? gl.ZERO : gl.REPLACE, gl.KEEP, gl.KEEP);

        // draw a fullscreen solid rectangle to clear the stencil buffer
        //ccDrawSolidRect(CCPointZero, ccpFromSize([[CCDirector sharedDirector] winSize]), ccc4f(1, 1, 1, 1));
        cc.drawingUtil.drawSolidRect(cc.PointZero(), cc.pFromSize(cc.Director.getInstance().getWinSize()), cc.c4f(1, 1, 1, 1));

        ///////////////////////////////////
        // DRAW CLIPPING STENCIL

        // setup the stencil test func like this:
        // for each pixel in the stencil node
        //     never draw it into the frame buffer
        //     if not in inverted mode: set the current layer value to 1 in the stencil buffer
        //     if in inverted mode: set the current layer value to 0 in the stencil buffer
        gl.stencilFunc(gl.NEVER, mask_layer, mask_layer);
        gl.stencilOp(!this._inverted ? gl.REPLACE : gl.ZERO, gl.KEEP, gl.KEEP);

        if (this._alphaThreshold < 1) {
            // since glAlphaTest do not exists in OES, use a shader that writes
            // pixel only if greater than an alpha threshold
            var program = cc.ShaderCache.getInstance().programForKey(cc.SHADER_POSITION_TEXTURECOLORALPHATEST);
            var alphaValueLocation = gl.getUniformLocation(program.getProgram(), cc.UNIFORM_ALPHA_TEST_VALUE_S);
            // set our alphaThreshold
            cc.glUseProgram(program.getProgram());
            program.setUniformLocationWith1f(alphaValueLocation, this._alphaThreshold);
            // we need to recursively apply this shader to all the nodes in the stencil node
            // XXX: we should have a way to apply shader to all nodes without having to do this
            cc.setProgram(this._stencil, program);
        }

        // draw the stencil node as if it was one of our child
        // (according to the stencil test func/op and alpha (or alpha shader) test)
        cc.kmGLPushMatrix();
        this.transform();
        this._stencil.visit();
        cc.kmGLPopMatrix();

        // restore alpha test state
        //if (this._alphaThreshold < 1) {
        // XXX: we need to find a way to restore the shaders of the stencil node and its childs
        //}

        // restore the depth test state
        gl.depthMask(currentDepthWriteMask);
        //if (currentDepthTestEnabled) {
        //    glEnable(GL_DEPTH_TEST);
        //}

        ///////////////////////////////////
        // DRAW CONTENT

        // setup the stencil test func like this:
        // for each pixel of this node and its childs
        //     if all layers less than or equals to the current are set to 1 in the stencil buffer
        //         draw the pixel and keep the current layer in the stencil buffer
        //     else
        //         do not draw the pixel but keep the current layer in the stencil buffer
        gl.stencilFunc(gl.EQUAL, mask_layer_le, mask_layer_le);
        gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);

        // draw (according to the stencil test func) this node and its childs
        cc.Node.prototype.visit.call(this, ctx);

        ///////////////////////////////////
        // CLEANUP

        // manually restore the stencil state
        gl.stencilFunc(currentStencilFunc, currentStencilRef, currentStencilValueMask);
        gl.stencilOp(currentStencilFail, currentStencilPassDepthFail, currentStencilPassDepthPass);
        gl.stencilMask(currentStencilWriteMask);
        if (!currentStencilEnabled)
            gl.disable(gl.STENCIL_TEST);

        // we are done using this layer, decrement
        cc.ClippingNode._layer--;
    },

    _visitForCanvas: function (ctx) {
        // return fast (draw nothing, or draw everything if in inverted mode) if:
        // - nil stencil node
        // - or stencil node invisible:
        if (!this._stencil || !this._stencil.isVisible()) {
            if (this._inverted)
                cc.Node.prototype.visit.call(this, ctx);   // draw everything
            return;
        }

        // Composition mode, costy but support texture stencil
        if (this._cangodhelpme() || this._stencil instanceof cc.Sprite) {
            var context = ctx || cc.renderContext;
            // Cache the current canvas, for later use (This is a little bit heavy, replace this solution with other walkthrough)
            var canvas = context.canvas;
            var locCache = cc.ClippingNode._getSharedCache();
            locCache.width = canvas.width;
            locCache.height = canvas.height;
            var locCacheCtx = locCache.getContext("2d");
            locCacheCtx.drawImage(canvas, 0, 0);

            context.save();
            // Draw everything first using node visit function
            this._super(context);

            context.globalCompositeOperation = this._inverted ? "destination-out" : "destination-in";

            this.transform(context);
            this._stencil.visit();

            context.restore();

            // Redraw the cached canvas, so that the cliped area shows the background etc.
            context.save();
            context.setTransform(1, 0, 0, 1, 0, 0);
            context.globalCompositeOperation = "destination-over";
            context.drawImage(locCache, 0, 0);
            context.restore();
        }
        // Clip mode, fast, but only support cc.DrawNode
        else {
            var context = ctx || cc.renderContext, i, children = this._children, locChild;

            context.save();
            this.transform(context);
            this._stencil.visit(context);
            context.clip();

            // Clip mode doesn't support recusive stencil, so once we used a clip stencil,
            // so if it has ClippingNode as a child, the child must uses composition stencil.
            this._cangodhelpme(true);
            var len = children.length;
            if (len > 0) {
                this.sortAllChildren();
                // draw children zOrder < 0
                for (i = 0; i < len; i++) {
                    locChild = children[i];
                    if (locChild._zOrder < 0)
                        locChild.visit(context);
                    else
                        break;
                }
                this.draw(context);
                for (; i < len; i++) {
                    children[i].visit(context);
                }
            } else
                this.draw(context);
            this._cangodhelpme(false);

            context.restore();
        }
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
     * @param {cc.Node} stencil
     */
    setStencil: null,

    _setStencilForWebGL: function (stencil) {
        this._stencil = stencil;
    },

    _setStencilForCanvas: function (stencil) {
        this._stencil = stencil;
        var locEGL_ScaleX = cc.EGLView.getInstance().getScaleX(), locEGL_ScaleY = cc.EGLView.getInstance().getScaleY();
        var locContext = cc.renderContext;
        // For texture stencil, use the sprite itself
        if (stencil instanceof cc.Sprite) {
            return;
        }
        // For shape stencil, rewrite the draw of stencil ,only init the clip path and draw nothing.
        else if (stencil instanceof cc.DrawNode) {
            stencil.draw = function () {
                for (var i = 0; i < stencil._buffer.length; i++) {
                    var element = stencil._buffer[i];
                    var vertices = element.verts;
                    var firstPoint = vertices[0];
                    locContext.beginPath();
                    locContext.moveTo(firstPoint.x * locEGL_ScaleX, -firstPoint.y * locEGL_ScaleY);
                    for (var j = 1, len = vertices.length; j < len; j++)
                        locContext.lineTo(vertices[j].x * locEGL_ScaleX, -vertices[j].y * locEGL_ScaleY);
                }
            }
        }
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
        return this._inverted;
    },


    /**
     * set whether or not invert of stencil
     * @param {Boolean} inverted
     */
    setInverted: function (inverted) {
        this._inverted = inverted;
    },

    _cangodhelpme: function (godhelpme) {
        if (godhelpme === true || godhelpme === false)
            cc.ClippingNode.prototype._godhelpme = godhelpme;
        return cc.ClippingNode.prototype._godhelpme;
    }
});

if (cc.Browser.supportWebGL) {
    //WebGL
    cc.ClippingNode.prototype.init = cc.ClippingNode.prototype._initForWebGL;
    cc.ClippingNode.prototype.visit = cc.ClippingNode.prototype._visitForWebGL;
    cc.ClippingNode.prototype.setStencil = cc.ClippingNode.prototype._setStencilForWebGL;
} else {
    cc.ClippingNode.prototype.init = cc.ClippingNode.prototype._initForCanvas;
    cc.ClippingNode.prototype.visit = cc.ClippingNode.prototype._visitForCanvas;
    cc.ClippingNode.prototype.setStencil = cc.ClippingNode.prototype._setStencilForCanvas;
}

cc.ClippingNode._init_once = null;
cc.ClippingNode._visit_once = null;
cc.ClippingNode._layer = null;
cc.ClippingNode._sharedCache = null;

cc.ClippingNode._getSharedCache = function () {
    return (cc.ClippingNode._sharedCache) || (cc.ClippingNode._sharedCache = document.createElement("canvas"));
}

/**
 * Creates and initializes a clipping node with an other node as its stencil.                               <br/>
 * The stencil node will be retained.
 * @param {cc.Node} [stencil=null]
 * @return {cc.ClippingNode}
 */
cc.ClippingNode.create = function (stencil) {
    var node = new cc.ClippingNode();
    node.init(stencil);
    return node;
};
