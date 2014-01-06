/****************************************************************************
 Copyright (c) 2010-2012 cocos2d-x.org

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
 * layoutBackGround color type
 * @type {Object}
 */
ccs.LayoutBackGroundColorType = {
    none: 0,
    solid: 1,
    gradient: 2
};

/**
 * Layout type
 * @type {Object}
 */
ccs.LayoutType = {
    absolute: 0,
    linearVertical: 1,
    linearHorizontal: 2,
    relative: 3
};

/**
 * Layout type
 * @type {Object}
 */
ccs.LayoutClippingType = {
    stencil: 0,
    scissor: 1
};

ccs.BACKGROUNDIMAGEZ = -2;
ccs.BACKGROUNDCOLORRENDERERZ = -2;
/**
 * Base class for ccs.Layout
 * @class
 * @extends ccs.Widget
 */
ccs.Layout = ccs.Widget.extend(/** @lends ccs.Layout# */{
    _clippingEnabled: null,
    _backGroundScale9Enabled: null,
    _backGroundImage: null,
    _backGroundImageFileName: null,
    _backGroundImageCapInsets: null,
    _colorType: null,
    _bgImageTexType: null,
    _colorRender: null,
    _gradientRender: null,
    _color: null,
    _startColor: null,
    _endColor: null,
    _alongVector: null,
    _opacity: null,
    _backGroundImageTextureSize: null,
    _layoutType: null,
    _doLayoutDirty: false,
    _clippingType : null,
    _clippingStencil: null,
    _handleScissor: false,
    _scissorRectDirty: false,
    _clippingRect: null,
    _clippingParent: null,
    ctor: function () {
        ccs.Widget.prototype.ctor.call(this);
        this._clippingEnabled = false;
        this._backGroundScale9Enabled = false;
        this._backGroundImage = null;
        this._backGroundImageFileName = "";
        this._backGroundImageCapInsets = cc.RectZero();
        this._colorType = ccs.LayoutBackGroundColorType.none;
        this._bgImageTexType = ccs.TextureResType.local;
        this._colorRender = null;
        this._gradientRender = null;
        this._color = cc.white();
        this._startColor = cc.white();
        this._endColor = cc.white();
        this._alongVector = cc.p(0, -1);
        this._opacity = 255;
        this._backGroundImageTextureSize = cc.SizeZero();
        this._layoutType = ccs.LayoutType.absolute;
        this._widgetType = ccs.WidgetType.container;
        this._doLayoutDirty = false;
        this._clippingType = ccs.LayoutClippingType.stencil;
        this._clippingStencil = null;
        this._handleScissor = false;
        this._scissorRectDirty = false;
        this._clippingRect = cc.rect(0, 0, 0, 0);
        this._clippingParent = null;
    },
    init: function () {
        if (cc.NodeRGBA.prototype.init.call(this)){
            this._layoutParameterDictionary = {};
            this._widgetChildren = [];
            this.initRenderer();
            this.setCascadeColorEnabled(false);
            this.setCascadeOpacityEnabled(false);
            this.ignoreContentAdaptWithSize(false);
            this.setSize(cc.SizeZero());
            this.setBright(true);
            this.setAnchorPoint(0, 0);
            this.initStencil();
            return true;
        }
        return false;
    },
    initStencil : null,
    _initStencilForWebGL:function(){
        this._clippingStencil = cc.DrawNode.create();
        ccs.Layout._init_once = true;
        if (ccs.Layout._init_once) {
            cc.stencilBits = cc.renderContext.getParameter(cc.renderContext.STENCIL_BITS);
            if (cc.stencilBits <= 0)
                cc.log("Stencil buffer is not enabled.");
            ccs.Layout._init_once = false;
        }
    },
    _initStencilForCanvas: function () {
        this._clippingStencil = cc.DrawNode.create();
        var locEGL_ScaleX = cc.EGLView.getInstance().getScaleX(), locEGL_ScaleY = cc.EGLView.getInstance().getScaleY();
        var locContext = cc.renderContext;
        var stencil = this._clippingStencil;
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
    },

    /**
     * Adds a locChild to the container.
     * @param {ccs.Widget} locChild
     * @param {Number} zOrder
     * @param {Number} tag
     */
    addChild: function (child, zOrder, tag) {
        if(!(child instanceof ccs.Widget))
            return;
        this.supplyTheLayoutParameterLackToChild(child);
        ccs.Widget.prototype.addChild.call(this, child, zOrder, tag);
        this._doLayoutDirty = true;
    },

    /**
     * Gets if layout is clipping enabled.
     * @returns {Boolean}
     */
    isClippingEnabled: function () {
        return this._clippingEnabled;
    },

    visit: function (ctx) {
        if (!this._enabled) {
            return;
        }
        if (this._clippingEnabled) {
            switch (this._clippingType) {
                case ccs.LayoutClippingType.stencil:
                    this.stencilClippingVisit(ctx);
                    break;
                case ccs.LayoutClippingType.scissor:
                    this.scissorClippingVisit(ctx);
                    break;
                default:
                    break;
            }
        }
        else {
            cc.NodeRGBA.prototype.visit.call(this,ctx);
        }
    },

    sortAllChildren: function () {
        ccs.Widget.prototype.sortAllChildren.call(this);
        this.doLayout();
    },

    stencilClippingVisit : null,

    _stencilClippingVisitForWebGL: function (ctx) {
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
        if (!this._clippingStencil || !this._clippingStencil.isVisible()) {
            return;
        }

        // store the current stencil layer (position in the stencil buffer),
        // this will allow nesting up to n CCClippingNode,
        // where n is the number of bits of the stencil buffer.
        ccs.Layout._layer = -1;

        // all the _stencilBits are in use?
        if (ccs.Layout._layer + 1 == cc.stencilBits) {
            // warn once
            ccs.Layout._visit_once = true;
            if (ccs.Layout._visit_once) {
                cc.log("Nesting more than " + cc.stencilBits + "stencils is not supported. Everything will be drawn without stencil for this node and its childs.");
                ccs.Layout._visit_once = false;
            }
            // draw everything, as if there where no stencil
            cc.Node.prototype.visit.call(this, ctx);
            return;
        }

        ///////////////////////////////////
        // INIT

        // increment the current layer
        ccs.Layout._layer++;

        // mask of the current layer (ie: for layer 3: 00000100)
        var mask_layer = 0x1 << ccs.Layout._layer;
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
        gl.stencilOp(gl.ZERO, gl.KEEP, gl.KEEP);

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
        gl.stencilOp(gl.REPLACE, gl.KEEP, gl.KEEP);


        // draw the stencil node as if it was one of our child
        // (according to the stencil test func/op and alpha (or alpha shader) test)
        cc.kmGLPushMatrix();
        this.transform();
        this._clippingStencil.visit();
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
        ccs.Layout._layer--;
    },

    _stencilClippingVisitForCanvas: function (ctx) {
        // return fast (draw nothing, or draw everything if in inverted mode) if:
        // - nil stencil node
        // - or stencil node invisible:
        if (!this._clippingStencil || !this._clippingStencil.isVisible()) {
            return;
        }

        // Composition mode, costy but support texture stencil
        if (this._cangodhelpme() || this._clippingStencil instanceof cc.Sprite) {
            var context = ctx || cc.renderContext;
            // Cache the current canvas, for later use (This is a little bit heavy, replace this solution with other walkthrough)
            var canvas = context.canvas;
            var locCache = ccs.Layout._getSharedCache();
            locCache.width = canvas.width;
            locCache.height = canvas.height;
            var locCacheCtx = locCache.getContext("2d");
            locCacheCtx.drawImage(canvas, 0, 0);

            context.save();
            // Draw everything first using node visit function
            this._super(context);

            context.globalCompositeOperation = "destination-in";

            this.transform(context);
            this._clippingStencil.visit();

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
            this._clippingStencil.visit(context);
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

    _godhelpme:false,
    _cangodhelpme: function (godhelpme) {
        if (godhelpme === true || godhelpme === false)
            cc.ClippingNode.prototype._godhelpme = godhelpme;
        return cc.ClippingNode.prototype._godhelpme;
    },

    scissorClippingVisit : null,
    _scissorClippingVisitForWebGL: function (ctx) {
        var clippingRect = this.getClippingRect();
        var gl = ctx || cc.renderContext;
        if (this._handleScissor) {
            gl.enable(gl.SCISSOR_TEST);
        }
        cc.EGLView.getInstance().setScissorInPoints(clippingRect.x, clippingRect.y, clippingRect.width, clippingRect.height);
        cc.NodeRGBA.prototype.visit.call(this);
        if (this._handleScissor) {
            gl.disable(gl.SCISSOR_TEST);
        }
    },

    /**
     * Changes if layout can clip it's content and locChild.
     * @param {Boolean} able
     */
    setClippingEnabled: function (able) {
        if (able == this._clippingEnabled) {
            return;
        }
        this._clippingEnabled = able;
        switch (this._clippingType) {
            case ccs.LayoutClippingType.stencil:
                if (able) {
                    this.setStencilClippingSize(this._size);
                }
                else {
                    this._clippingStencil = null;
                }
                break;
            default:
                break;
        }
    },

    /**
     * set clipping type
     * @param {ccs.LayoutClippingType} type
     */
    setClippingType: function (type) {
        if (type == this._clippingType) {
            return;
        }
        var clippingEnabled = this.isClippingEnabled();
        this.setClippingEnabled(false);
        this._clippingType = type;
        this.setClippingEnabled(clippingEnabled);
    },

    setStencilClippingSize: function (size) {
        if (this._clippingEnabled && this._clippingType == ccs.LayoutClippingType.stencil) {
            var rect = [];
            rect[0] = cc.p(0, 0);
            rect[1] = cc.p(size.width, 0);
            rect[2] = cc.p(size.width, size.height);
            rect[3] = cc.p(0, size.height);
            var green = cc.c4f(0, 1, 0, 1);
            this._clippingStencil.clear();
            this._clippingStencil.drawPoly(rect, 4, green, 0, green);
        }
    },

    rendererVisitCallBack: function () {
        this.doLayout();
    },

    getClippingRect: function () {
        this._handleScissor = true;
        var worldPos = this.convertToWorldSpace(cc.p(0, 0));
        var t = this.nodeToWorldTransform();
        var scissorWidth = this._size.width * t.a;
        var scissorHeight = this._size.height * t.d;
        var parentClippingRect;
        var parent = this;
        var firstClippingParentFounded = false;
        while (parent) {
            parent = parent.getParent();
            if (parent && parent instanceof ccs.Layout) {
                if (parent.isClippingEnabled()) {
                    if (!firstClippingParentFounded) {
                        this._clippingParent = parent;
                        firstClippingParentFounded = true;
                    }

                    if (parent._clippingType == ccs.LayoutClippingType.scissor) {
                        this._handleScissor = false;
                        break;
                    }
                }
            }
        }

        if (this._clippingParent) {
            parentClippingRect = this._clippingParent.getClippingRect();
            var finalX = worldPos.x - (scissorWidth * this._anchorPoint.x);
            var finalY = worldPos.y - (scissorHeight * this._anchorPoint.y);
            var finalWidth = scissorWidth;
            var finalHeight = scissorHeight;

            var leftOffset = worldPos.x - parentClippingRect.x;
            if (leftOffset < 0) {
                finalX = parentClippingRect.x;
                finalWidth += leftOffset;
            }
            var rightOffset = (worldPos.x + scissorWidth) - (parentClippingRect.x + parentClippingRect.width);
            if (rightOffset > 0) {
                finalWidth -= rightOffset;
            }
            var topOffset = (worldPos.y + scissorHeight) - (parentClippingRect.y + parentClippingRect.height);
            if (topOffset > 0) {
                finalHeight -= topOffset;
            }
            var bottomOffset = worldPos.y - parentClippingRect.y;
            if (bottomOffset < 0) {
                finalY = parentClippingRect.x;
                finalHeight += bottomOffset;
            }
            if (finalWidth < 0) {
                finalWidth = 0;
            }
            if (finalHeight < 0) {
                finalHeight = 0;
            }
            this._clippingRect.x = finalX;
            this._clippingRect.y = finalY;
            this._clippingRect.width = finalWidth;
            this._clippingRect.height = finalHeight;
        }
        else {
            this._clippingRect.x = worldPos.x - (scissorWidth * this._anchorPoint.x);
            this._clippingRect.y = worldPos.y - (scissorHeight * this._anchorPoint.y);
            this._clippingRect.width = scissorWidth;
            this._clippingRect.height = scissorHeight;
        }
        return this._clippingRect;
    },

    onSizeChanged: function () {
        ccs.Widget.prototype.onSizeChanged.call(this);
        this.setStencilClippingSize(this._size);
        this._doLayoutDirty = true;

        if (this._backGroundImage) {
            this._backGroundImage.setPosition(this._size.width / 2.0, this._size.height / 2.0);
            if (this._backGroundScale9Enabled) {
                if (this._backGroundImage instanceof cc.Scale9Sprite) {
                    this._backGroundImage.setPreferredSize(this._size);
                }
            }
        }
        if (this._colorRender) {
            this._colorRender.setContentSize(this._size);
        }
        if (this._gradientRender) {
            this._gradientRender.setContentSize(this._size);
        }
    },

    /**
     * Sets background iamge use scale9 renderer.
     * @param {Boolean} able
     */
    setBackGroundImageScale9Enabled: function (able) {
        if (this._backGroundScale9Enabled == able) {
            return;
        }
        cc.NodeRGBA.prototype.removeChild.call(this, this._backGroundImage, true);
        this._backGroundImage = null;
        this._backGroundScale9Enabled = able;
        if (this._backGroundScale9Enabled) {
            this._backGroundImage = cc.Scale9Sprite.create();
        }
        else {
            this._backGroundImage = cc.Sprite.create();
        }
        cc.NodeRGBA.prototype.addChild.call(this, this._backGroundImage, ccs.BACKGROUNDIMAGEZ, -1);
        this.setBackGroundImage(this._backGroundImageFileName, this._bgImageTexType);
        this.setBackGroundImageCapInsets(this._backGroundImageCapInsets);
    },

    /**
     * Sets a background image for layout
     * @param {String} fileName
     * @param {ccs.TextureResType} texType
     */
    setBackGroundImage: function (fileName, texType) {
        if (!fileName) {
            return;
        }
        texType = texType || ccs.TextureResType.local;
        if (this._backGroundImage == null) {
            this.addBackGroundImage();
        }
        this._backGroundImageFileName = fileName;
        this._bgImageTexType = texType;
        switch (this._bgImageTexType) {
            case ccs.TextureResType.local:
                this._backGroundImage.initWithFile(fileName);
                break;
            case ccs.TextureResType.plist:
                this._backGroundImage.initWithSpriteFrameName(fileName);
                break;
            default:
                break;
        }
        if (this._backGroundScale9Enabled) {
            this._backGroundImage.setPreferredSize(this._size);
        }
        this._backGroundImage.setColor(this.getColor());
        this._backGroundImage.setOpacity(this.getOpacity());
        this._backGroundImageTextureSize = this._backGroundImage.getContentSize();
        this._backGroundImage.setPosition(this._size.width / 2.0, this._size.height / 2.0);
    },

    /**
     * Sets a background image capinsets for layout, if the background image is a scale9 render.
     * @param {cc.Rect} capInsets
     */
    setBackGroundImageCapInsets: function (capInsets) {
        this._backGroundImageCapInsets = capInsets;
        if (this._backGroundScale9Enabled) {
            this._backGroundImage.setCapInsets(capInsets);
        }
    },

    supplyTheLayoutParameterLackToChild: function (locChild) {
        if (!locChild) {
            return;
        }
        switch (this._layoutType) {
            case ccs.LayoutType.absolute:
                break;
            case ccs.LayoutType.linearHorizontal:
            case ccs.LayoutType.linearVertical:
                var layoutParameter = locChild.getLayoutParameter(ccs.LayoutParameterType.linear);
                if (!layoutParameter) {
                    locChild.setLayoutParameter(ccs.LinearLayoutParameter.create());
                }
                break;
            case ccs.LayoutType.relative:
                var layoutParameter = locChild.getLayoutParameter(ccs.LayoutParameterType.relative);
                if (!layoutParameter) {
                    locChild.setLayoutParameter(ccs.RelativeLayoutParameter.create());
                }
                break;
            default:
                break;
        }
    },

    /**
     * init background image renderer.
     */
    addBackGroundImage: function () {
        if (this._backGroundScale9Enabled) {
            this._backGroundImage = cc.Scale9Sprite.create();
            this._backGroundImage.setPreferredSize(this._size);
        }
        else {
            this._backGroundImage = cc.Sprite.create();
        }
        cc.NodeRGBA.prototype.addChild.call(this, this._backGroundImage, ccs.BACKGROUNDIMAGEZ, -1);
        this._backGroundImage.setPosition(this._size.width / 2.0, this._size.height / 2.0);
    },

    /**
     * Remove the background image of layout.
     */
    removeBackGroundImage: function () {
        if (!this._backGroundImage) {
            return;
        }
        cc.NodeRGBA.prototype.removeChild.call(this, this._backGroundImage, true);
        this._backGroundImage = null;
        this._backGroundImageFileName = "";
        this._backGroundImageTextureSize = cc.SizeZero();
    },

    /**
     * Sets Color Type for layout.
     * @param {ccs.LayoutBackGroundColorType} type
     */
    setBackGroundColorType: function (type) {
        if (this._colorType == type) {
            return;
        }
        switch (this._colorType) {
            case ccs.LayoutBackGroundColorType.none:
                if (this._colorRender) {
                    cc.NodeRGBA.prototype.removeChild.call(this, this._colorRender, true);
                    this._colorRender = null;
                }
                if (this._gradientRender) {
                    cc.NodeRGBA.prototype.removeChild.call(this, this._gradientRender, true);
                    this._gradientRender = null;
                }
                break;
            case ccs.LayoutBackGroundColorType.solid:
                if (this._colorRender) {
                    cc.NodeRGBA.prototype.removeChild.call(this, this._colorRender, true);
                    this._colorRender = null;
                }
                break;
            case ccs.LayoutBackGroundColorType.gradient:
                if (this._gradientRender) {
                    cc.NodeRGBA.prototype.removeChild.call(this, this._gradientRender, true);
                    this._gradientRender = null;
                }
                break;
            default:
                break;
        }
        this._colorType = type;
        switch (this._colorType) {
            case ccs.LayoutBackGroundColorType.none:
                break;
            case ccs.LayoutBackGroundColorType.solid:
                this._colorRender = cc.LayerColor.create();
                this._colorRender.setContentSize(this._size);
                this._colorRender.setOpacity(this._opacity);
                this._colorRender.setColor(this._color);
                cc.NodeRGBA.prototype.addChild.call(this, this._colorRender, ccs.BACKGROUNDCOLORRENDERERZ, -1);
                break;
            case ccs.LayoutBackGroundColorType.gradient:
                this._gradientRender = cc.LayerGradient.create(cc.c4b(255, 0, 0, 255), cc.c4b(0, 255, 0, 255));
                this._gradientRender.setContentSize(this._size);
                this._gradientRender.setOpacity(this._opacity);
                this._gradientRender.setStartColor(this._startColor);
                this._gradientRender.setEndColor(this._endColor);
                this._gradientRender.setVector(this._alongVector);
                cc.NodeRGBA.prototype.addChild.call(this, this._gradientRender, ccs.BACKGROUNDCOLORRENDERERZ, -1);
                break;
            default:
                break;
        }
    },

    /**
     * Sets background color for layout, if color type is LAYOUT_COLOR_SOLID
     * @param {cc.c3b} color
     * @param {cc.c3b} endColor
     */
    setBackGroundColor: function (color, endColor) {
        if (!endColor) {
            this._color = color;
            if (this._colorRender) {
                this._colorRender.setColor(color);
            }
        } else {
            this._startColor = color;
            if (this._gradientRender) {
                this._gradientRender.setStartColor(color);
            }
            this._endColor = endColor;
            if (this._gradientRender) {
                this._gradientRender.setEndColor(endColor);
            }
        }
    },

    /**
     * Sets background opacity layout.
     * @param {number} opacity
     */
    setBackGroundColorOpacity: function (opacity) {
        this._opacity = opacity;
        switch (this._colorType) {
            case ccs.LayoutBackGroundColorType.none:
                break;
            case ccs.LayoutBackGroundColorType.solid:
                this._colorRender.setOpacity(opacity);
                break;
            case ccs.LayoutBackGroundColorType.gradient:
                this._gradientRender.setOpacity(opacity);
                break;
            default:
                break;
        }
    },

    /**
     * Sets background color vector for layout, if color type is LAYOUT_COLOR_GRADIENT
     * @param {cc.Point} vector
     */
    setBackGroundColorVector: function (vector) {
        this._alongVector = vector;
        if (this._gradientRender) {
            this._gradientRender.setVector(vector);
        }
    },

    /**
     * Gets background image texture size.
     * @returns {cc.Size}
     */
    getBackGroundImageTextureSize: function () {
        return this._backGroundImageTextureSize;
    },

    /**
     * Sets LayoutType.
     * @param {ccs.LayoutType} type
     */
    setLayoutType: function (type) {
        this._layoutType = type;
        var layoutChildrenArray = this._widgetChildren;
        var locChild = null;
        for (var i = 0; i < layoutChildrenArray.length; i++) {
            locChild = layoutChildrenArray[i];
            this.supplyTheLayoutParameterLackToChild(locChild);
        }
        this._doLayoutDirty = true;
    },

    /**
     * Gets LayoutType.
     * @returns {null}
     */
    getLayoutType: function () {
        return this._layoutType;
    },

    /**
     * request do layout
     */
    requestDoLayout: function () {
        this._doLayoutDirty = true;
    },

    doLayout_LINEAR_VERTICAL: function () {
        var layoutChildrenArray = this._widgetChildren;
        var layoutSize = this.getSize();
        var topBoundary = layoutSize.height;
        for (var i = 0; i < layoutChildrenArray.length; ++i) {
            var locChild = layoutChildrenArray[i];
            var locLayoutParameter = locChild.getLayoutParameter(ccs.LayoutParameterType.linear);

            if (locLayoutParameter) {
                var locChildGravity = locLayoutParameter.getGravity();
                var locAP = locChild.getAnchorPoint();
                var locSize = locChild.getSize();
                var locFinalPosX = locAP.x * locSize.width;
                var locFinalPosY = topBoundary - ((1 - locAP.y) * locSize.height);
                switch (locChildGravity) {
                    case ccs.LinearGravity.none:
                    case ccs.LinearGravity.left:
                        break;
                    case ccs.LinearGravity.right:
                        locFinalPosX = layoutSize.width - ((1 - locAP.x) * locSize.width);
                        break;
                    case ccs.LinearGravity.centerHorizontal:
                        locFinalPosX = layoutSize.width / 2 - locSize.width * (0.5 - locAP.x);
                        break;
                    default:
                        break;
                }
                var locMargin = locLayoutParameter.getMargin();
                locFinalPosX += locMargin.left;
                locFinalPosY -= locMargin.top;
                locChild.setPosition(cc.p(locFinalPosX, locFinalPosY));
                topBoundary = locChild.getBottomInParent() - locMargin.bottom;
            }
        }
    },
    doLayout_LINEAR_HORIZONTAL: function () {
        var layoutChildrenArray = this._widgetChildren;
        var layoutSize = this.getSize();
        var leftBoundary = 0;
        for (var i = 0; i < layoutChildrenArray.length; ++i) {
            var locChild = layoutChildrenArray[i];
            var locLayoutParameter = locChild.getLayoutParameter(ccs.LayoutParameterType.linear);

            if (locLayoutParameter) {
                var locChildGravity = locLayoutParameter.getGravity();
                var locAP = locChild.getAnchorPoint();
                var locSize = locChild.getSize();
                var locFinalPosX = leftBoundary + (locAP.x * locSize.width);
                var locFinalPosY = layoutSize.height - (1 - locAP.y) * locSize.height;
                switch (locChildGravity) {
                    case ccs.LinearGravity.none:
                    case ccs.LinearGravity.top:
                        break;
                    case ccs.LinearGravity.bottom:
                        locFinalPosY = locAP.y * locSize.height;
                        break;
                    case ccs.LinearGravity.centerVertical:
                        locFinalPosY = layoutSize.height / 2 - locSize.height * (0.5 - locAP.y);
                        break;
                    default:
                        break;
                }
                var locMargin = locLayoutParameter.getMargin();
                locFinalPosX += locMargin.left;
                locFinalPosY -= locMargin.top;
                locChild.setPosition(cc.p(locFinalPosX, locFinalPosY));
                leftBoundary = locChild.getRightInParent() + locMargin.right;
            }
        }
    },
    doLayout_RELATIVE: function () {
        var layoutChildrenArray = this._widgetChildren;
        var length = layoutChildrenArray.length;
        var unlayoutChildCount = length;
        var layoutSize = this.getSize();

        for (var i = 0; i < length; i++) {
            var locChild = layoutChildrenArray[i];
            var locLayoutParameter = locChild.getLayoutParameter(ccs.LayoutParameterType.relative);
            locLayoutParameter._put = false;
        }

        while (unlayoutChildCount > 0) {
            for (var i = 0; i < length; i++) {
                var locChild = layoutChildrenArray[i];
                var locLayoutParameter = locChild.getLayoutParameter(ccs.LayoutParameterType.relative);

                if (locLayoutParameter) {
                    if (locLayoutParameter._put) {
                        continue;
                    }
                    var locAP = locChild.getAnchorPoint();
                    var locSize = locChild.getSize();
                    var locAlign = locLayoutParameter.getAlign();
                    var locRelativeName = locLayoutParameter.getRelativeToWidgetName();
                    var locRelativeWidget = null;
                    var locRelativeWidgetLP = null;
                    var locFinalPosX = 0;
                    var locFinalPosY = 0;
                    if (locRelativeName) {
                        locRelativeWidget = ccs.UIHelper.seekWidgetByRelativeName(this, locRelativeName);
                        if (locRelativeWidget) {
                            locRelativeWidgetLP = locRelativeWidget.getLayoutParameter(ccs.LayoutParameterType.relative);
                        }
                    }
                    switch (locAlign) {
                        case ccs.RelativeAlign.alignNone:
                        case ccs.RelativeAlign.alignParentTopLeft:
                            locFinalPosX = locAP.x * locSize.width;
                            locFinalPosY = layoutSize.height - ((1 - locAP.y) * locSize.height);
                            break;
                        case ccs.RelativeAlign.alignParentTopCenterHorizontal:
                            locFinalPosX = layoutSize.width * 0.5 - locSize.width * (0.5 - locAP.x);
                            locFinalPosY = layoutSize.height - ((1 - locAP.y) * locSize.height);
                            break;
                        case ccs.RelativeAlign.alignParentTopRight:
                            locFinalPosX = layoutSize.width - ((1 - locAP.x) * locSize.width);
                            locFinalPosY = layoutSize.height - ((1 - locAP.y) * locSize.height);
                            break;
                        case ccs.RelativeAlign.alignParentLeftCenterVertical:
                            locFinalPosX = locAP.x * locSize.width;
                            locFinalPosY = layoutSize.height * 0.5 - locSize.height * (0.5 - locAP.y);
                            break;
                        case ccs.RelativeAlign.centerInParent:
                            locFinalPosX = layoutSize.width * 0.5 - locSize.width * (0.5 - locAP.x);
                            locFinalPosY = layoutSize.height * 0.5 - locSize.height * (0.5 - locAP.y);
                            break;
                        case ccs.RelativeAlign.alignParentRightCenterVertical:
                            locFinalPosX = layoutSize.width - ((1 - locAP.x) * locSize.width);
                            locFinalPosY = layoutSize.height * 0.5 - locSize.height * (0.5 - locAP.y);
                            break;
                        case ccs.RelativeAlign.alignParentLeftBottom:
                            locFinalPosX = locAP.x * locSize.width;
                            locFinalPosY = locAP.y * locSize.height;
                            break;
                        case ccs.RelativeAlign.alignParentBottomCenterHorizontal:
                            locFinalPosX = layoutSize.width * 0.5 - locSize.width * (0.5 - locAP.x);
                            locFinalPosY = locAP.y * locSize.height;
                            break;
                        case ccs.RelativeAlign.alignParentRightBottom:
                            locFinalPosX = layoutSize.width - ((1 - locAP.x) * locSize.width);
                            locFinalPosY = locAP.y * locSize.height;
                            break;

                        case ccs.RelativeAlign.locationAboveLeftAlign:
                            if (locRelativeWidget) {
                                if (locRelativeWidgetLP && !locRelativeWidgetLP._put) {
                                    continue;
                                }
                                var locationBottom = locRelativeWidget.getTopInParent();
                                var locationLeft = locRelativeWidget.getLeftInParent();
                                locFinalPosY = locationBottom + locAP.y * locSize.height;
                                locFinalPosX = locationLeft + locAP.x * locSize.width;
                            }
                            break;
                        case ccs.RelativeAlign.locationAboveCenter:
                            if (locRelativeWidget) {
                                if (locRelativeWidgetLP && !locRelativeWidgetLP._put) {
                                    continue;
                                }
                                var rbs = locRelativeWidget.getSize();
                                var locationBottom = locRelativeWidget.getTopInParent();

                                locFinalPosY = locationBottom + locAP.y * locSize.height;
                                locFinalPosX = locRelativeWidget.getLeftInParent() + rbs.width * 0.5 + locAP.x * locSize.width - locSize.width * 0.5;
                            }
                            break;
                        case ccs.RelativeAlign.locationAboveRightAlign:
                            if (locRelativeWidget) {
                                if (locRelativeWidgetLP && !locRelativeWidgetLP._put) {
                                    continue;
                                }
                                var locationBottom = locRelativeWidget.getTopInParent();
                                var locationRight = locRelativeWidget.getRightInParent();
                                locFinalPosY = locationBottom + locAP.y * locSize.height;
                                locFinalPosX = locationRight - (1 - locAP.x) * locSize.width;
                            }
                            break;
                        case ccs.RelativeAlign.locationLeftOfTopAlign:
                            if (locRelativeWidget) {
                                if (locRelativeWidgetLP && !locRelativeWidgetLP._put) {
                                    continue;
                                }
                                var locationTop = locRelativeWidget.getTopInParent();
                                var locationRight = locRelativeWidget.getLeftInParent();
                                locFinalPosY = locationTop - (1 - locAP.y) * locSize.height;
                                locFinalPosX = locationRight - (1 - locAP.x) * locSize.width;
                            }
                            break;
                        case ccs.RelativeAlign.locationLeftOfCenter:
                            if (locRelativeWidget) {
                                if (locRelativeWidgetLP && !locRelativeWidgetLP._put) {
                                    continue;
                                }
                                var rbs = locRelativeWidget.getSize();
                                var locationRight = locRelativeWidget.getLeftInParent();
                                locFinalPosX = locationRight - (1 - locAP.x) * locSize.width;

                                locFinalPosY = locRelativeWidget.getBottomInParent() + rbs.height * 0.5 + locAP.y * locSize.height - locSize.height * 0.5;
                            }
                            break;
                        case ccs.RelativeAlign.locationLeftOfBottomAlign:
                            if (locRelativeWidget) {
                                if (locRelativeWidgetLP && !locRelativeWidgetLP._put) {
                                    continue;
                                }
                                var locationBottom = locRelativeWidget.getBottomInParent();
                                var locationRight = locRelativeWidget.getLeftInParent();
                                locFinalPosY = locationBottom + locAP.y * locSize.height;
                                locFinalPosX = locationRight - (1 - locAP.x) * locSize.width;
                            }
                            break;
                        case ccs.RelativeAlign.locationRightOfTopAlign:
                            if (locRelativeWidget) {
                                if (locRelativeWidgetLP && !locRelativeWidgetLP._put) {
                                    continue;
                                }
                                var locationTop = locRelativeWidget.getTopInParent();
                                var locationLeft = locRelativeWidget.getRightInParent();
                                locFinalPosY = locationTop - (1 - locAP.y) * locSize.height;
                                locFinalPosX = locationLeft + locAP.x * locSize.width;
                            }
                            break;
                        case ccs.RelativeAlign.locationRightOfCenter:
                            if (locRelativeWidget) {
                                if (locRelativeWidgetLP && !locRelativeWidgetLP._put) {
                                    continue;
                                }
                                var rbs = locRelativeWidget.getSize();
                                var locationLeft = locRelativeWidget.getRightInParent();
                                locFinalPosX = locationLeft + locAP.x * locSize.width;

                                locFinalPosY = locRelativeWidget.getBottomInParent() + rbs.height * 0.5 + locAP.y * locSize.height - locSize.height * 0.5;
                            }
                            break;
                        case ccs.RelativeAlign.locationRightOfBottomAlign:
                            if (locRelativeWidget) {
                                if (locRelativeWidgetLP && !locRelativeWidgetLP._put) {
                                    continue;
                                }
                                var locationBottom = locRelativeWidget.getBottomInParent();
                                var locationLeft = locRelativeWidget.getRightInParent();
                                locFinalPosY = locationBottom + locAP.y * locSize.height;
                                locFinalPosX = locationLeft + locAP.x * locSize.width;
                            }
                            break;
                        case ccs.RelativeAlign.locationBelowLeftAlign:
                            if (locRelativeWidget) {
                                if (locRelativeWidgetLP && !locRelativeWidgetLP._put) {
                                    continue;
                                }
                                var locationTop = locRelativeWidget.getBottomInParent();
                                var locationLeft = locRelativeWidget.getLeftInParent();
                                locFinalPosY = locationTop - (1 - locAP.y) * locSize.height;
                                locFinalPosX = locationLeft + locAP.x * locSize.width;
                            }
                            break;
                        case ccs.RelativeAlign.locationBelowCenter:
                            if (locRelativeWidget) {
                                if (locRelativeWidgetLP && !locRelativeWidgetLP._put) {
                                    continue;
                                }
                                var rbs = locRelativeWidget.getSize();
                                var locationTop = locRelativeWidget.getBottomInParent();

                                locFinalPosY = locationTop - (1 - locAP.y) * locSize.height;
                                locFinalPosX = locRelativeWidget.getLeftInParent() + rbs.width * 0.5 + locAP.x * locSize.width - locSize.width * 0.5;
                            }
                            break;
                        case ccs.RelativeAlign.locationBelowRightAlign:
                            if (locRelativeWidget) {
                                if (locRelativeWidgetLP && !locRelativeWidgetLP._put) {
                                    continue;
                                }
                                var locationTop = locRelativeWidget.getBottomInParent();
                                var locationRight = locRelativeWidget.getRightInParent();
                                locFinalPosY = locationTop - (1 - locAP.y) * locSize.height;
                                locFinalPosX = locationRight - (1 - locAP.x) * locSize.width;
                            }
                            break;
                        default:
                            break;
                    }
                    var locRelativeWidgetMargin,locRelativeWidgetLPAlign;
                    var locMargin = locLayoutParameter.getMargin();
                    if (locRelativeWidgetLP) {
                        locRelativeWidgetMargin = locRelativeWidgetLP.getMargin();
                        locRelativeWidgetLPAlign = locRelativeWidgetLP.getAlign();
                    }
                    //handle margin
                    switch (locAlign) {
                        case ccs.RelativeAlign.alignNone:
                        case ccs.RelativeAlign.alignParentTopLeft:
                            locFinalPosX += locMargin.left;
                            locFinalPosY -= locMargin.top;
                            break;
                        case ccs.RelativeAlign.alignParentTopCenterHorizontal:
                            locFinalPosY -= locMargin.top;
                            break;
                        case ccs.RelativeAlign.alignParentTopRight:
                            locFinalPosX -= locMargin.right;
                            locFinalPosY -= locMargin.top;
                            break;
                        case ccs.RelativeAlign.alignParentLeftCenterVertical:
                            locFinalPosX += locMargin.left;
                            break;
                        case ccs.RelativeAlign.centerInParent:
                            break;
                        case ccs.RelativeAlign.alignParentRightCenterVertical:
                            locFinalPosX -= locMargin.right;
                            break;
                        case ccs.RelativeAlign.alignParentLeftBottom:
                            locFinalPosX += locMargin.left;
                            locFinalPosY += locMargin.bottom;
                            break;
                        case ccs.RelativeAlign.alignParentBottomCenterHorizontal:
                            locFinalPosY += locMargin.bottom;
                            break;
                        case ccs.RelativeAlign.alignParentRightBottom:
                            locFinalPosX -= locMargin.right;
                            locFinalPosY += locMargin.bottom;
                            break;

                        case ccs.RelativeAlign.locationAboveLeftAlign:
                            locFinalPosY += locMargin.bottom;
                            if (locRelativeWidgetLPAlign != ccs.RelativeAlign.alignParentTopCenterHorizontal
                                && locRelativeWidgetLPAlign != ccs.RelativeAlign.alignParentTopLeft
                                && locRelativeWidgetLPAlign != ccs.RelativeAlign.alignNone
                                && locRelativeWidgetLPAlign != ccs.RelativeAlign.alignParentTopRight)
                            {
                                locFinalPosY += locRelativeWidgetMargin.top;
                            }
                            locFinalPosY += locMargin.left;
                            break;
                        case ccs.RelativeAlign.locationAboveCenter:
                            locFinalPosY += locMargin.bottom;
                            if (locRelativeWidgetLPAlign != ccs.RelativeAlign.alignParentTopCenterHorizontal
                                && locRelativeWidgetLPAlign != ccs.RelativeAlign.alignParentTopLeft
                                && locRelativeWidgetLPAlign != ccs.RelativeAlign.alignNone
                                && locRelativeWidgetLPAlign != ccs.RelativeAlign.alignParentTopRight)
                            {
                                locFinalPosY += locRelativeWidgetMargin.top;
                            }
                            break;
                        case ccs.RelativeAlign.locationAboveRightAlign:
                            locFinalPosY += locMargin.bottom;
                            if (locRelativeWidgetLPAlign != ccs.RelativeAlign.alignParentTopCenterHorizontal
                                && locRelativeWidgetLPAlign != ccs.RelativeAlign.alignParentTopLeft
                                && locRelativeWidgetLPAlign != ccs.RelativeAlign.alignNone
                                && locRelativeWidgetLPAlign != ccs.RelativeAlign.alignParentTopRight)
                            {
                                locFinalPosY += locRelativeWidgetMargin.top;
                            }
                            locFinalPosX -= locMargin.right;
                            break;
                        case ccs.RelativeAlign.locationLeftOfTopAlign:
                            locFinalPosX -= locMargin.right;
                            if (locRelativeWidgetLPAlign != ccs.RelativeAlign.alignParentTopLeft
                                && locRelativeWidgetLPAlign != ccs.RelativeAlign.alignNone
                                && locRelativeWidgetLPAlign != ccs.RelativeAlign.alignParentLeftBottom
                                && locRelativeWidgetLPAlign != ccs.RelativeAlign.alignParentLeftCenterVertical)
                            {
                                locFinalPosX -= locRelativeWidgetMargin.left;
                            }
                            locFinalPosY -= locMargin.top;
                            break;
                        case ccs.RelativeAlign.locationLeftOfCenter:
                            locFinalPosX -= locMargin.right;
                            if (locRelativeWidgetLPAlign != ccs.RelativeAlign.alignParentTopLeft
                                && locRelativeWidgetLPAlign != ccs.RelativeAlign.alignNone
                                && locRelativeWidgetLPAlign != ccs.RelativeAlign.alignParentLeftBottom
                                && locRelativeWidgetLPAlign != ccs.RelativeAlign.alignParentLeftCenterVertical)
                            {
                                locFinalPosX -= locRelativeWidgetMargin.left;
                            }
                            break;
                        case ccs.RelativeAlign.locationLeftOfBottomAlign:
                            locFinalPosX -= locMargin.right;
                            if (locRelativeWidgetLPAlign != ccs.RelativeAlign.alignParentTopLeft
                                && locRelativeWidgetLPAlign != ccs.RelativeAlign.alignNone
                                && locRelativeWidgetLPAlign != ccs.RelativeAlign.alignParentLeftBottom
                                && locRelativeWidgetLPAlign != ccs.RelativeAlign.alignParentLeftCenterVertical)
                            {
                                locFinalPosX -= locRelativeWidgetMargin.left;
                            }
                            locFinalPosY += locMargin.bottom;
                            break;
                            break;
                        case ccs.RelativeAlign.locationRightOfTopAlign:
                            locFinalPosX += locMargin.left;
                            if (locRelativeWidgetLPAlign != ccs.RelativeAlign.alignParentTopRight
                                && locRelativeWidgetLPAlign != ccs.RelativeAlign.alignParentRightBottom
                                && locRelativeWidgetLPAlign != ccs.RelativeAlign.alignParentRightCenterVertical)
                            {
                                locFinalPosX += locRelativeWidgetMargin.right;
                            }
                            locFinalPosY -= locMargin.top;
                            break;
                        case ccs.RelativeAlign.locationRightOfCenter:
                            locFinalPosX += locMargin.left;
                            if (locRelativeWidgetLPAlign != ccs.RelativeAlign.alignParentTopRight
                                && locRelativeWidgetLPAlign != ccs.RelativeAlign.alignParentRightBottom
                                && locRelativeWidgetLPAlign != ccs.RelativeAlign.alignParentRightCenterVertical)
                            {
                                locFinalPosX += locRelativeWidgetMargin.right;
                            }
                            break;
                        case ccs.RelativeAlign.locationRightOfBottomAlign:
                            locFinalPosX += locMargin.left;
                            if (locRelativeWidgetLPAlign != ccs.RelativeAlign.alignParentTopRight
                                && locRelativeWidgetLPAlign != ccs.RelativeAlign.alignParentRightBottom
                                && locRelativeWidgetLPAlign != ccs.RelativeAlign.alignParentRightCenterVertical)
                            {
                                locFinalPosX += locRelativeWidgetMargin.right;
                            }
                            locFinalPosY += locMargin.bottom;
                            break;
                            break;
                        case ccs.RelativeAlign.locationBelowLeftAlign:
                            locFinalPosY -= locMargin.top;
                            if (locRelativeWidgetLPAlign != ccs.RelativeAlign.alignParentLeftBottom
                                && locRelativeWidgetLPAlign != ccs.RelativeAlign.alignParentRightBottom
                                && locRelativeWidgetLPAlign != ccs.RelativeAlign.alignParentBottomCenterHorizontal)
                            {
                                locFinalPosY -= locRelativeWidgetMargin.bottom;
                            }
                            locFinalPosX += locMargin.left;
                            break;
                        case ccs.RelativeAlign.locationBelowCenter:
                            locFinalPosY -= locMargin.top;
                            if (locRelativeWidgetLPAlign != ccs.RelativeAlign.alignParentLeftBottom
                                && locRelativeWidgetLPAlign != ccs.RelativeAlign.alignParentRightBottom
                                && locRelativeWidgetLPAlign != ccs.RelativeAlign.alignParentBottomCenterHorizontal)
                            {
                                locFinalPosY -= locRelativeWidgetMargin.bottom;
                            }
                            break;
                        case ccs.RelativeAlign.locationBelowRightAlign:
                            locFinalPosY -= locMargin.top;
                            if (locRelativeWidgetLPAlign != ccs.RelativeAlign.alignParentLeftBottom
                                && locRelativeWidgetLPAlign != ccs.RelativeAlign.alignParentRightBottom
                                && locRelativeWidgetLPAlign != ccs.RelativeAlign.alignParentBottomCenterHorizontal)
                            {
                                locFinalPosY -= locRelativeWidgetMargin.bottom;
                            }
                            locFinalPosX -= locMargin.right;
                            break;
                        default:
                            break;
                    }
                    locChild.setPosition(cc.p(locFinalPosX, locFinalPosY));
                    locLayoutParameter._put = true;
                    unlayoutChildCount--;
                }
            }
        }
    },
    doLayout: function () {
        if(!this._doLayoutDirty){
            return;
        }
        switch (this._layoutType) {
            case ccs.LayoutType.absolute:
                break;
            case ccs.LayoutType.linearVertical:
                this.doLayout_LINEAR_VERTICAL();
                break;
            case ccs.LayoutType.linearHorizontal:
                this.doLayout_LINEAR_HORIZONTAL();
                break;
            case ccs.LayoutType.relative:
                this.doLayout_RELATIVE();
                break;
            default:
                break;
        }
        this._doLayoutDirty = false;
    },

    /**
     * Returns the "class name" of widget.
     * @returns {string}
     */
    getDescription: function () {
        return "Layout";
    },

    createCloneInstance: function () {
        return ccs.Layout.create();
    },

    copyClonedWidgetChildren: function (model) {
        ccs.Widget.prototype.copyClonedWidgetChildren.call(this, model);
    },

    copySpecialProperties: function (layout) {
        this.setBackGroundImageScale9Enabled(layout._backGroundScale9Enabled);
        this.setBackGroundImage(layout._backGroundImageFileName, layout._bgImageTexType);
        this.setBackGroundImageCapInsets(layout._backGroundImageCapInsets);
        this.setBackGroundColorType(layout._colorType);
        this.setBackGroundColor(layout._color);
        this.setBackGroundColor(layout._startColor, layout._endColor);
        this.setBackGroundColorOpacity(layout._opacity);
        this.setBackGroundColorVector(layout._alongVector);
        this.setLayoutType(layout._layoutType);
        this.setClippingEnabled(layout._clippingEnabled);
        this.setClippingType(layout._clippingType);
    }
});
ccs.Layout._init_once = null;
ccs.Layout._visit_once = null;
ccs.Layout._layer = null;
ccs.Layout._sharedCache = null;

if (cc.Browser.supportWebGL) {
    //WebGL
    ccs.Layout.prototype.initStencil = ccs.Layout.prototype._initStencilForWebGL;
    ccs.Layout.prototype.stencilClippingVisit = ccs.Layout.prototype._stencilClippingVisitForWebGL;
    ccs.Layout.prototype.scissorClippingVisit = ccs.Layout.prototype._scissorClippingVisitForWebGL;
}else{
    ccs.Layout.prototype.initStencil = ccs.Layout.prototype._initStencilForCanvas;
    ccs.Layout.prototype.stencilClippingVisit = ccs.Layout.prototype._stencilClippingVisitForCanvas;
    ccs.Layout.prototype.scissorClippingVisit = ccs.Layout.prototype._stencilClippingVisitForCanvas;
}
ccs.Layout._getSharedCache = function () {
    return (cc.ClippingNode._sharedCache) || (cc.ClippingNode._sharedCache = document.createElement("canvas"));
};
/**
 * allocates and initializes a UILayout.
 * @constructs
 * @return {ccs.Layout}
 * @example
 * // example
 * var uiLayout = ccs.Layout.create();
 */
ccs.Layout.create = function () {
    var layout = new ccs.Layout();
    if (layout && layout.init()) {
        return layout;
    }
    return null;
};
