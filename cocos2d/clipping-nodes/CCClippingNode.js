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
 *     It draws its content (childs) clipped using a stencil.                                               <br/>
 *     The stencil is an other cc.Node that will not be drawn.                                               <br/>
 *     The clipping is done using the alpha part of the stencil (adjusted with an alphaThreshold).
 * </p>
 * @class
 * @extends cc.Node
 * @param {cc.Node} [stencil=null]
 *
 * @property {Number}   alphaThreshold  - Threshold for alpha value.
 * @property {Boolean}  inverted        - Indicate whether in inverted mode.
 */
//@property {cc.Node}  stencil         - he cc.Node to use as a stencil to do the clipping.
cc.ClippingNode = cc.Node.extend(/** @lends cc.ClippingNode# */{
    alphaThreshold: 0,
    inverted: false,

    _rendererSaveCmd: null,
    _rendererClipCmd: null,
    _rendererRestoreCmd: null,

    _beforeVisitCmd: null,
    _afterDrawStencilCmd: null,
    _afterVisitCmd: null,

    _stencil: null,
    _godhelpme: false,
    _clipElemType: null,

    _currentStencilFunc: null,
    _currentStencilRef: null,
    _currentStencilValueMask: null,
    _currentStencilFail: null,
    _currentStencilPassDepthFail: null,
    _currentStencilPassDepthPass:null,
    _currentStencilWriteMask:null,
    _currentStencilEnabled:null,
    _currentDepthWriteMask: null,
    _mask_layer_le: null,


    /**
     * Constructor function, override it to extend the construction behavior, remember to call "this._super()" in the extended "ctor" function.
     * @param {cc.Node} [stencil=null]
     */
    ctor: function (stencil) {
        cc.Node.prototype.ctor.call(this);
        this._stencil = null;
        this.alphaThreshold = 0;
        this.inverted = false;
        stencil = stencil || null;
        cc.ClippingNode.prototype.init.call(this, stencil);
    },

    _initRendererCmd: function(){
        if(cc._renderType === cc._RENDER_TYPE_CANVAS){
            this._rendererSaveCmd = new cc.ClippingNodeSaveRenderCmdCanvas(this);
            this._rendererClipCmd = new cc.ClippingNodeClipRenderCmdCanvas(this);
            this._rendererRestoreCmd = new cc.ClippingNodeRestoreRenderCmdCanvas(this);
        }else{
            this._beforeVisitCmd = new cc.CustomRenderCmdWebGL(this, this._onBeforeVisit);
            this._afterDrawStencilCmd  = new cc.CustomRenderCmdWebGL(this, this._onAfterDrawStencil);
            this._afterVisitCmd = new cc.CustomRenderCmdWebGL(this, this._onAfterVisit);
        }
    },

    /**
     * Initialization of the node, please do not call this function by yourself, you should pass the parameters to constructor to initialize it .
     * @function
     * @param {cc.Node} [stencil=null]
     */
    init: null,

    _className: "ClippingNode",

    _initForWebGL: function (stencil) {
        this._stencil = stencil;

        this.alphaThreshold = 1;
        this.inverted = false;
        // get (only once) the number of bits of the stencil buffer
        cc.ClippingNode._init_once = true;
        if (cc.ClippingNode._init_once) {
            cc.stencilBits = cc._renderContext.getParameter(cc._renderContext.STENCIL_BITS);
            if (cc.stencilBits <= 0)
                cc.log("Stencil buffer is not enabled.");
            cc.ClippingNode._init_once = false;
        }
        return true;
    },

    _initForCanvas: function (stencil) {
        this._stencil = stencil;
        this.alphaThreshold = 1;
        this.inverted = false;
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
        this._stencil.onEnter();
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
        this._stencil.onEnterTransitionDidFinish();
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
        this._stencil.onExitTransitionDidStart();
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
        this._stencil.onExit();
        cc.Node.prototype.onExit.call(this);
    },

    /**
     * Recursive method that visit its children and draw them
     * @function
     * @param {CanvasRenderingContext2D|WebGLRenderingContext} ctx
     */
    visit: null,

    _visitForWebGL: function (ctx) {
        var gl = ctx || cc._renderContext;

        // if stencil buffer disabled
        if (cc.stencilBits < 1) {
            // draw everything, as if there where no stencil
            cc.Node.prototype.visit.call(this, ctx);
            return;
        }

        if (!this._stencil || !this._stencil.visible) {
            if (this.inverted)
                cc.Node.prototype.visit.call(this, ctx);   // draw everything
            return;
        }

        if (cc.ClippingNode._layer + 1 == cc.stencilBits) {
            cc.ClippingNode._visit_once = true;
            if (cc.ClippingNode._visit_once) {
                cc.log("Nesting more than " + cc.stencilBits + "stencils is not supported. Everything will be drawn without stencil for this node and its childs.");
                cc.ClippingNode._visit_once = false;
            }
            // draw everything, as if there where no stencil
            cc.Node.prototype.visit.call(this, ctx);
            return;
        }

        cc.renderer.pushRenderCommand(this._beforeVisitCmd);

        //optimize performance for javascript
        var currentStack = cc.current_stack;
        currentStack.stack.push(currentStack.top);
        cc.kmMat4Assign(this._stackMatrix, currentStack.top);
        currentStack.top = this._stackMatrix;

        this.transform();
        //this._stencil._stackMatrix = this._stackMatrix;
        this._stencil.visit();

        cc.renderer.pushRenderCommand(this._afterDrawStencilCmd);

        // draw (according to the stencil test func) this node and its childs
        var locChildren = this._children;
        if (locChildren && locChildren.length > 0) {
            var childLen = locChildren.length;
            this.sortAllChildren();
            // draw children zOrder < 0
            for (var i = 0; i < childLen; i++) {
                if (locChildren[i] && locChildren[i]._localZOrder < 0)
                    locChildren[i].visit();
                else
                    break;
            }
            if(this._rendererCmd)
                cc.renderer.pushRenderCommand(this._rendererCmd);
            // draw children zOrder >= 0
            for (; i < childLen; i++) {
                if (locChildren[i]) {
                    locChildren[i].visit();
                }
            }
        } else{
            if(this._rendererCmd)
                cc.renderer.pushRenderCommand(this._rendererCmd);
        }

        cc.renderer.pushRenderCommand(this._afterVisitCmd);

        //optimize performance for javascript
        currentStack.top = currentStack.stack.pop();
    },

    _onBeforeVisit: function(ctx){
        var gl = ctx || cc._renderContext;
        ///////////////////////////////////
        // INIT

        // increment the current layer
        cc.ClippingNode._layer++;

        // mask of the current layer (ie: for layer 3: 00000100)
        var mask_layer = 0x1 << cc.ClippingNode._layer;
        // mask of all layers less than the current (ie: for layer 3: 00000011)
        var mask_layer_l = mask_layer - 1;
        // mask of all layers less than or equal to the current (ie: for layer 3: 00000111)
        //var mask_layer_le = mask_layer | mask_layer_l;
        this._mask_layer_le = mask_layer | mask_layer_l;
        // manually save the stencil state
        this._currentStencilEnabled = gl.isEnabled(gl.STENCIL_TEST);
        this._currentStencilWriteMask = gl.getParameter(gl.STENCIL_WRITEMASK);
        this._currentStencilFunc = gl.getParameter(gl.STENCIL_FUNC);
        this._currentStencilRef = gl.getParameter(gl.STENCIL_REF);
        this._currentStencilValueMask = gl.getParameter(gl.STENCIL_VALUE_MASK);
        this._currentStencilFail = gl.getParameter(gl.STENCIL_FAIL);
        this._currentStencilPassDepthFail = gl.getParameter(gl.STENCIL_PASS_DEPTH_FAIL);
        this._currentStencilPassDepthPass = gl.getParameter(gl.STENCIL_PASS_DEPTH_PASS);

        // enable stencil use
        gl.enable(gl.STENCIL_TEST);
        // check for OpenGL error while enabling stencil test
        //cc.checkGLErrorDebug();

        // all bits on the stencil buffer are readonly, except the current layer bit,
        // this means that operation like glClear or glStencilOp will be masked with this value
        gl.stencilMask(mask_layer);

        // manually save the depth test state
        //GLboolean currentDepthTestEnabled = GL_TRUE;
        //currentDepthTestEnabled = glIsEnabled(GL_DEPTH_TEST);
        //var currentDepthWriteMask = gl.getParameter(gl.DEPTH_WRITEMASK);
        this._currentDepthWriteMask = gl.getParameter(gl.DEPTH_WRITEMASK);
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
        gl.stencilOp(!this.inverted ? gl.ZERO : gl.REPLACE, gl.KEEP, gl.KEEP);

        this._drawFullScreenQuadClearStencil();

        // DRAW CLIPPING STENCIL
        // setup the stencil test func like this:
        // for each pixel in the stencil node
        //     never draw it into the frame buffer
        //     if not in inverted mode: set the current layer value to 1 in the stencil buffer
        //     if in inverted mode: set the current layer value to 0 in the stencil buffer
        gl.stencilFunc(gl.NEVER, mask_layer, mask_layer);
        gl.stencilOp(!this.inverted ? gl.REPLACE : gl.ZERO, gl.KEEP, gl.KEEP);

        if (this.alphaThreshold < 1) {            //TODO desktop
            // since glAlphaTest do not exists in OES, use a shader that writes
            // pixel only if greater than an alpha threshold
            var program = cc.shaderCache.programForKey(cc.SHADER_POSITION_TEXTURECOLORALPHATEST);
            var alphaValueLocation = gl.getUniformLocation(program.getProgram(), cc.UNIFORM_ALPHA_TEST_VALUE_S);
            // set our alphaThreshold
            cc.glUseProgram(program.getProgram());
            program.setUniformLocationWith1f(alphaValueLocation, this.alphaThreshold);
            // we need to recursively apply this shader to all the nodes in the stencil node
            // XXX: we should have a way to apply shader to all nodes without having to do this
            cc.setProgram(this._stencil, program);
        }
    },

    _drawFullScreenQuadClearStencil: function () {
        // draw a fullscreen solid rectangle to clear the stencil buffer
        cc.kmGLMatrixMode(cc.KM_GL_PROJECTION);
        cc.kmGLPushMatrix();
        cc.kmGLLoadIdentity();
        cc.kmGLMatrixMode(cc.KM_GL_MODELVIEW);
        cc.kmGLPushMatrix();
        cc.kmGLLoadIdentity();
        cc._drawingUtil.drawSolidRect(cc.p(-1, -1), cc.p(1, 1), cc.color(255, 255, 255, 255));
        cc.kmGLMatrixMode(cc.KM_GL_PROJECTION);
        cc.kmGLPopMatrix();
        cc.kmGLMatrixMode(cc.KM_GL_MODELVIEW);
        cc.kmGLPopMatrix();
    },

    _onAfterDrawStencil: function(ctx){
        var gl = ctx || cc._renderContext;
        // restore alpha test state
        //if (this.alphaThreshold < 1) {
        // XXX: we need to find a way to restore the shaders of the stencil node and its childs
        //}

        // restore the depth test state
        gl.depthMask(this._currentDepthWriteMask);

        ///////////////////////////////////
        // DRAW CONTENT

        // setup the stencil test func like this:
        // for each pixel of this node and its childs
        //     if all layers less than or equals to the current are set to 1 in the stencil buffer
        //         draw the pixel and keep the current layer in the stencil buffer
        //     else
        //         do not draw the pixel but keep the current layer in the stencil buffer
        gl.stencilFunc(gl.EQUAL, this._mask_layer_le, this._mask_layer_le);
        gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);
    },

    _onAfterVisit: function(ctx){
        var gl = ctx || cc._renderContext;
        ///////////////////////////////////
        // CLEANUP

        // manually restore the stencil state
        gl.stencilFunc(this._currentStencilFunc, this._currentStencilRef, this._currentStencilValueMask);
        gl.stencilOp(this._currentStencilFail, this._currentStencilPassDepthFail, this._currentStencilPassDepthPass);
        gl.stencilMask(this._currentStencilWriteMask);
        if (!this._currentStencilEnabled)
            gl.disable(gl.STENCIL_TEST);

        // we are done using this layer, decrement
        cc.ClippingNode._layer--;
    },

    _visitForCanvas: function (ctx) {
        // Composition mode, costy but support texture stencil
        this._clipElemType = (this._cangodhelpme() || this._stencil instanceof cc.Sprite);

        var context = ctx || cc._renderContext;
        var i, children = this._children, locChild;

        if (!this._stencil || !this._stencil.visible) {
            if (this.inverted)
                cc.Node.prototype.visit.call(this, ctx);   // draw everything
            return;
        }

        if(this._rendererSaveCmd)
            cc.renderer.pushRenderCommand(this._rendererSaveCmd);

        if(this._clipElemType){

            // Draw everything first using node visit function
            cc.Node.prototype.visit.call(this, context);
        }else{
            this._stencil.visit(context);
        }

        if(this._rendererClipCmd)
            cc.renderer.pushRenderCommand(this._rendererClipCmd);

        this.transform();

        if(this._clipElemType){
            this._stencil.visit();
        }else{
            // Clip mode doesn't support recusive stencil, so once we used a clip stencil,
            // so if it has ClippingNode as a child, the child must uses composition stencil.
            this._cangodhelpme(true);
            var len = children.length;
            if (len > 0) {
                this.sortAllChildren();
                // draw children zOrder < 0
                for (i = 0; i < len; i++) {
                    locChild = children[i];
                    if (locChild._localZOrder < 0)
                        locChild.visit(context);
                    else
                        break;
                }
                if(this._rendererCmd)
                    cc.renderer.pushRenderCommand(this._rendererCmd);
                for (; i < len; i++) {
                    children[i].visit(context);
                }
            } else
            if(this._rendererCmd)
                cc.renderer.pushRenderCommand(this._rendererCmd);
            this._cangodhelpme(false);

        }

        if(this._rendererRestoreCmd)
            cc.renderer.pushRenderCommand(this._rendererRestoreCmd);
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
    setStencil: null,

    _setStencilForWebGL: function (stencil) {
        if(this._stencil == stencil)
            return;
        if(this._stencil)
            this._stencil._parent = null;
        this._stencil = stencil;
        if(this._stencil)
            this._stencil._parent = this;
    },

    _setStencilForCanvas: function (stencil) {
        this._stencil = stencil;
        if(stencil._buffer){
            for(var i=0; i<stencil._buffer.length; i++){
                stencil._buffer[i].isFill = false;
                stencil._buffer[i].isStroke = false;
            }
        }
        var locContext = cc._renderContext;
        // For texture stencil, use the sprite itself
        //if (stencil instanceof cc.Sprite) {
        //    return;
        //}
        // For shape stencil, rewrite the draw of stencil ,only init the clip path and draw nothing.
        //else
        if (stencil instanceof cc.DrawNode) {
            stencil._rendererCmd.rendering = function (ctx, scaleX, scaleY) {
                scaleX = scaleX || cc.view.getScaleX();
                scaleY = scaleY ||cc.view.getScaleY();
                var context = ctx || cc._renderContext;
                var t = this._node._transformWorld;
                context.save();
                context.transform(t.a, t.b, t.c, t.d, t.tx * scaleX, -t.ty * scaleY);

                context.beginPath();
                for (var i = 0; i < stencil._buffer.length; i++) {
                    var vertices = stencil._buffer[i].verts;
                    //cc.assert(cc.vertexListIsClockwise(vertices),
                    //    "Only clockwise polygons should be used as stencil");

                    var firstPoint = vertices[0];
                    context.moveTo(firstPoint.x * scaleX, -firstPoint.y * scaleY);
                    for (var j = 1, len = vertices.length; j < len; j++)
                        context.lineTo(vertices[j].x * scaleX, -vertices[j].y * scaleY);
                }
                context.restore();
            };
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
        return this.alphaThreshold;
    },

    /**
     * set alpha threshold.
     * @param {Number} alphaThreshold
     */
    setAlphaThreshold: function (alphaThreshold) {
        this.alphaThreshold = alphaThreshold;
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

    _cangodhelpme: function (godhelpme) {
        if (godhelpme === true || godhelpme === false)
            cc.ClippingNode.prototype._godhelpme = godhelpme;
        return cc.ClippingNode.prototype._godhelpme;
    },

    _transformForRenderer: function(parentMatrix){
        cc.Node.prototype._transformForRenderer.call(this, parentMatrix);
        if(this._stencil)
            this._stencil._transformForRenderer(this._stackMatrix);
    }
});

var _p = cc.ClippingNode.prototype;

if (cc._renderType === cc._RENDER_TYPE_WEBGL) {
    //WebGL
    _p.init = _p._initForWebGL;
    _p.visit = _p._visitForWebGL;
    _p.setStencil = _p._setStencilForWebGL;
} else {
    _p.init = _p._initForCanvas;
    _p.visit = _p._visitForCanvas;
    _p.setStencil = _p._setStencilForCanvas;
}

// Extended properties
cc.defineGetterSetter(_p, "stencil", _p.getStencil, _p.setStencil);
/** @expose */
_p.stencil;


cc.ClippingNode._init_once = null;
cc.ClippingNode._visit_once = null;
cc.ClippingNode._layer = -1;
cc.ClippingNode._sharedCache = null;

cc.ClippingNode._getSharedCache = function () {
    return (cc.ClippingNode._sharedCache) || (cc.ClippingNode._sharedCache = document.createElement("canvas"));
};

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
