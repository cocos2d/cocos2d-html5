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

/** cc.Layer is a subclass of cc.Node that implements the TouchEventsDelegate protocol.<br/>
 * All features from cc.Node are valid, plus the bake feature: Baked layer can cache a static layer to improve performance
 * @class
 * @extends cc.Node
 */
cc.Layer = cc.Node.extend(/** @lends cc.Layer# */{
    _isBaked: false,
    _bakeSprite: null,
    _bakeRenderCmd: null,
    _className: "Layer",

    /**
     * <p>Constructor of cc.Layer, override it to extend the construction behavior, remember to call "this._super()" in the extended "ctor" function.</p>
     */
    ctor: function () {
        var nodep = cc.Node.prototype;
        nodep.ctor.call(this);
        this._ignoreAnchorPointForPosition = true;
        nodep.setAnchorPoint.call(this, 0.5, 0.5);
        nodep.setContentSize.call(this, cc.winSize);
    },

    /**
     * Initialization of the layer, please do not call this function by yourself, you should pass the parameters to constructor to initialize a layer
     */
    init: function(){
        var _t = this;
        _t._ignoreAnchorPointForPosition = true;
        _t.setAnchorPoint(0.5, 0.5);
        _t.setContentSize(cc.winSize);
        _t.cascadeOpacity = false;
        _t.cascadeColor = false;
        return true;
    },

    /**
     * Sets the layer to cache all of children to a bake sprite, and draw itself by bake sprite. recommend using it in UI.<br/>
     * This is useful only in html5 engine
     * @function
     * @see cc.Layer#unbake
     */
    bake: null,

    /**
     * Cancel the layer to cache all of children to a bake sprite.<br/>
     * This is useful only in html5 engine
     * @function
     * @see cc.Layer#bake
     */
    unbake: null,

    _bakeRendering: null,

    /**
     * Determines if the layer is baked.
     * @function
     * @returns {boolean}
     * @see cc.Layer#bake and cc.Layer#unbake
     */
    isBaked: function(){
        return this._isBaked;
    },

    visit: null
});

/**
 * Creates a layer
 * @deprecated since v3.0, please use the new construction instead
 * @see cc.Layer
 * @return {cc.Layer|Null}
 */
cc.Layer.create = function () {
    return new cc.Layer();
};

if (cc._renderType === cc._RENDER_TYPE_CANVAS) {
    var p = cc.Layer.prototype;
    p.bake = function(){
        if (!this._isBaked) {
            cc.renderer.childrenOrderDirty = true;
            //limit: 1. its children's blendfunc are invalid.
            this._isBaked = this._cacheDirty = true;
            if(!this._bakeRenderCmd && this._bakeRendering)
                this._bakeRenderCmd = new cc.CustomRenderCmdCanvas(this, this._bakeRendering);

            this._cachedParent = this;
            var children = this._children;
            for(var i = 0, len = children.length; i < len; i++)
                children[i]._setCachedParent(this);

            if (!this._bakeSprite){
                this._bakeSprite = new cc.BakeSprite();
                this._bakeSprite._parent = this;
            }
        }
    };

    p.unbake = function(){
        if (this._isBaked) {
            cc.renderer.childrenOrderDirty = true;
            this._isBaked = false;
            this._cacheDirty = true;

            this._cachedParent = null;
            var children = this._children;
            for(var i = 0, len = children.length; i < len; i++)
                children[i]._setCachedParent(null);
        }
    };

    p.addChild = function(child, localZOrder, tag){
        cc.Node.prototype.addChild.call(this, child, localZOrder, tag);
        if(child._parent == this && this._isBaked)
            child._setCachedParent(this);
    };

    p._bakeRendering = function(){
        if(this._cacheDirty){
            var _t = this;
            var children = _t._children, locBakeSprite = this._bakeSprite;
            //compute the bounding box of the bake layer.
            var boundingBox = this._getBoundingBoxForBake();
            boundingBox.width = 0 | boundingBox.width;
            boundingBox.height = 0 | boundingBox.height;
            var bakeContext = locBakeSprite.getCacheContext();
            locBakeSprite.resetCanvasSize(boundingBox.width, boundingBox.height);
            bakeContext.translate(0 - boundingBox.x, boundingBox.height + boundingBox.y);

            //  invert
            var t = cc.affineTransformInvert(this._transformWorld);
            var scaleX = cc.view.getScaleX(), scaleY = cc.view.getScaleY();
            bakeContext.transform(t.a, t.c, t.b, t.d, t.tx * scaleX, -t.ty * scaleY);

            //reset the bake sprite's position
            var anchor = locBakeSprite.getAnchorPointInPoints();
            locBakeSprite.setPosition(anchor.x + boundingBox.x, anchor.y + boundingBox.y);

            //visit for canvas
            _t.sortAllChildren();
            cc.renderer._turnToCacheMode(this.__instanceId);
            for (var i = 0, len = children.length; i < len; i++) {
                children[i].visit(bakeContext);
            }
            cc.renderer._renderingToCacheCanvas(bakeContext, this.__instanceId);
            this._cacheDirty = false;
        }
    };

    p.visit = function(ctx){
        if(!this._isBaked){
            cc.Node.prototype.visit.call(this, ctx);
            return;
        }

        var context = ctx || cc._renderContext;
        var _t = this;
        var children = _t._children;
        var len = children.length;
        // quick return if not visible
        if (!_t._visible || len === 0)
            return;

        _t.transform(context);

        if(_t._bakeRenderCmd)
            cc.renderer.pushRenderCommand(_t._bakeRenderCmd);

        //the bakeSprite is drawing
        this._bakeSprite.visit(context);
    };

    p._getBoundingBoxForBake = function () {
        var rect = null;

        //query child's BoundingBox
        if (!this._children || this._children.length === 0)
            return cc.rect(0, 0, 10, 10);

        var locChildren = this._children;
        for (var i = 0; i < locChildren.length; i++) {
            var child = locChildren[i];
            if (child && child._visible) {
                if(rect){
                    var childRect = child._getBoundingBoxToCurrentNode();
                    if (childRect)
                        rect = cc.rectUnion(rect, childRect);
                }else{
                    rect = child._getBoundingBoxToCurrentNode();
                }
            }
        }
        return rect;
    };
    p = null;
}else{
    cc.assert(cc.isFunction(cc._tmp.LayerDefineForWebGL), cc._LogInfos.MissingFile, "CCLayerWebGL.js");
    cc._tmp.LayerDefineForWebGL();
    delete cc._tmp.LayerDefineForWebGL;
}

/**
 * <p>
 * CCLayerColor is a subclass of CCLayer that implements the CCRGBAProtocol protocol.       <br/>
 *  All features from CCLayer are valid, plus the following new features:                   <br/>
 * - opacity                                                                     <br/>
 * - RGB colors                                                                </p>
 * @class
 * @extends cc.Layer
 *
 * @param {cc.Color} [color=] The color of the layer
 * @param {Number} [width=] The width of the layer
 * @param {Number} [height=] The height of the layer
 *
 * @example
 * // Example
 * //Create a yellow color layer as background
 * var yellowBackground = new cc.LayerColor(cc.color(255,255,0,255));
 * //If you didnt pass in width and height, it defaults to the same size as the canvas
 *
 * //create a yellow box, 200 by 200 in size
 * var yellowBox = new cc.LayerColor(cc.color(255,255,0,255), 200, 200);
 */
cc.LayerColor = cc.Layer.extend(/** @lends cc.LayerColor# */{
    _blendFunc: null,
    _className: "LayerColor",

    /**
     * Returns the blend function
     * @return {cc.BlendFunc}
     */
    getBlendFunc: function () {
        return this._blendFunc;
    },

    /**
     * Changes width and height
     * @deprecated since v3.0 please use setContentSize instead
     * @see cc.Node#setContentSize
     * @param {Number} w width
     * @param {Number} h height
     */
    changeWidthAndHeight: function (w, h) {
        this.width = w;
        this.height = h;
    },

    /**
     * Changes width in Points
     * @deprecated since v3.0 please use setContentSize instead
     * @see cc.Node#setContentSize
     * @param {Number} w width
     */
    changeWidth: function (w) {
        this.width = w;
    },

    /**
     * change height in Points
     * @deprecated since v3.0 please use setContentSize instead
     * @see cc.Node#setContentSize
     * @param {Number} h height
     */
    changeHeight: function (h) {
        this.height = h;
    },

    setOpacityModifyRGB: function (value) {
    },

    isOpacityModifyRGB: function () {
        return false;
    },

    setColor: function (color) {
        cc.Layer.prototype.setColor.call(this, color);
        this._updateColor();
    },

    setOpacity: function (opacity) {
        cc.Layer.prototype.setOpacity.call(this, opacity);
        this._updateColor();
    },

    _blendFuncStr: "source",

    /**
     * Constructor of cc.LayerColor
     * @function
     * @param {cc.Color} [color=]
     * @param {Number} [width=]
     * @param {Number} [height=]
     */
    ctor: null,

    /**
     * Initialization of the layer, please do not call this function by yourself, you should pass the parameters to constructor to initialize a layer
     * @param {cc.Color} [color=]
     * @param {Number} [width=]
     * @param {Number} [height=]
     * @return {Boolean}
     */
    init: function (color, width, height) {
        if (cc._renderType !== cc._RENDER_TYPE_CANVAS)
            this.shaderProgram = cc.shaderCache.programForKey(cc.SHADER_POSITION_COLOR);

        var winSize = cc.director.getWinSize();
        color = color || cc.color(0, 0, 0, 255);
        width = width === undefined ? winSize.width : width;
        height = height === undefined ? winSize.height : height;

        var locDisplayedColor = this._displayedColor;
        locDisplayedColor.r = color.r;
        locDisplayedColor.g = color.g;
        locDisplayedColor.b = color.b;

        var locRealColor = this._realColor;
        locRealColor.r = color.r;
        locRealColor.g = color.g;
        locRealColor.b = color.b;

        this._displayedOpacity = color.a;
        this._realOpacity = color.a;

        var proto = cc.LayerColor.prototype;
        proto.setContentSize.call(this, width, height);
        proto._updateColor.call(this);
        return true;
    },

    /**
     * Sets the blend func, you can pass either a cc.BlendFunc object or source and destination value separately
     * @param {Number|cc.BlendFunc} src
     * @param {Number} [dst]
     */
    setBlendFunc: function (src, dst) {
        var _t = this, locBlendFunc = this._blendFunc;
        if (dst === undefined) {
            locBlendFunc.src = src.src;
            locBlendFunc.dst = src.dst;
        } else {
            locBlendFunc.src = src;
            locBlendFunc.dst = dst;
        }
        if (cc._renderType === cc._RENDER_TYPE_CANVAS)
            _t._blendFuncStr = cc._getCompositeOperationByBlendFunc(locBlendFunc);
    },

    _setWidth: null,

    _setHeight: null,

    _updateColor: null,

    updateDisplayedColor: function (parentColor) {
        cc.Layer.prototype.updateDisplayedColor.call(this, parentColor);
        this._updateColor();
    },

    updateDisplayedOpacity: function (parentOpacity) {
        cc.Layer.prototype.updateDisplayedOpacity.call(this, parentOpacity);
        this._updateColor();
    },

    draw: null
});

/**
 * Creates a cc.Layer with color, width and height in Points
 * @deprecated since v3.0 please use the new construction instead
 * @see cc.LayerColor
 * @param {cc.Color} color
 * @param {Number|Null} [width=]
 * @param {Number|Null} [height=]
 * @return {cc.LayerColor}
 */
cc.LayerColor.create = function (color, width, height) {
    return new cc.LayerColor(color, width, height);
};

if (cc._renderType === cc._RENDER_TYPE_CANVAS) {
    //cc.LayerColor define start
    var _p = cc.LayerColor.prototype;
    _p.ctor = function (color, width, height) {
        cc.Layer.prototype.ctor.call(this);
        this._blendFunc = new cc.BlendFunc(cc.BLEND_SRC, cc.BLEND_DST);
        cc.LayerColor.prototype.init.call(this, color, width, height);
    };
    _p._initRendererCmd = function(){
        this._rendererCmd = new cc.RectRenderCmdCanvas(this);
    };
    _p._setWidth = function(width){
        cc.Node.prototype._setWidth.call(this, width);
    };
    _p._setHeight = function(height){
        cc.Node.prototype._setHeight.call(this, height);
    };
    _p._updateColor = function () {
        var locCmd = this._rendererCmd;
        if(!locCmd || !locCmd._color)
            return;
        var locColor = this._displayedColor;
        locCmd._color.r = locColor.r;
        locCmd._color.g = locColor.g;
        locCmd._color.b = locColor.b;
        locCmd._color.a = this._displayedOpacity / 255;
    };

    _p.draw = function (ctx) {
        var context = ctx || cc._renderContext, _t = this;
        var locEGLViewer = cc.view, locDisplayedColor = _t._displayedColor;

        context.fillStyle = "rgba(" + (0 | locDisplayedColor.r) + "," + (0 | locDisplayedColor.g) + ","
            + (0 | locDisplayedColor.b) + "," + _t._displayedOpacity / 255 + ")";
        context.fillRect(0, 0, _t.width * locEGLViewer.getScaleX(), -_t.height * locEGLViewer.getScaleY());
        cc.g_NumberOfDraws++;
    };

    _p._bakeRendering = function(){
        if(this._cacheDirty){
            var _t = this;
            var locBakeSprite = _t._bakeSprite, children = this._children;
            var len = children.length, i;

            //compute the bounding box of the bake layer.
            var boundingBox = this._getBoundingBoxForBake();
            boundingBox.width = 0 | boundingBox.width;
            boundingBox.height = 0 | boundingBox.height;
            var bakeContext = locBakeSprite.getCacheContext();
            locBakeSprite.resetCanvasSize(boundingBox.width, boundingBox.height);
            var anchor = locBakeSprite.getAnchorPointInPoints(), locPos = this._position;
            if(this._ignoreAnchorPointForPosition){
                bakeContext.translate(0 - boundingBox.x + locPos.x, boundingBox.height + boundingBox.y - locPos.y);
                //reset the bake sprite's position
                locBakeSprite.setPosition(anchor.x + boundingBox.x - locPos.x, anchor.y + boundingBox.y - locPos.y);
            } else {
                var selfAnchor = this.getAnchorPointInPoints();
                var selfPos = {x: locPos.x - selfAnchor.x, y: locPos.y - selfAnchor.y};
                bakeContext.translate(0 - boundingBox.x + selfPos.x, boundingBox.height + boundingBox.y - selfPos.y);
                locBakeSprite.setPosition(anchor.x + boundingBox.x - selfPos.x, anchor.y + boundingBox.y - selfPos.y);
            }
            //  invert
            var t = cc.affineTransformInvert(this._transformWorld);
            var scaleX = cc.view.getScaleX(), scaleY = cc.view.getScaleY();
            bakeContext.transform(t.a, t.c, t.b, t.d, t.tx * scaleX, -t.ty * scaleY);

            var child;
            cc.renderer._turnToCacheMode(this.__instanceId);
            //visit for canvas
            if (len > 0) {
                _t.sortAllChildren();
                // draw children zOrder < 0
                for (i = 0; i < len; i++) {
                    child = children[i];
                    if (child._localZOrder < 0)
                        child.visit(bakeContext);
                    else
                        break;
                }
                if(_t._rendererCmd)
                    cc.renderer.pushRenderCommand(_t._rendererCmd);
                for (; i < len; i++) {
                    children[i].visit(bakeContext);
                }
            } else
            if(_t._rendererCmd)
                cc.renderer.pushRenderCommand(_t._rendererCmd);
            cc.renderer._renderingToCacheCanvas(bakeContext, this.__instanceId);
            this._cacheDirty = false;
        }
    };

    //for bake
    _p.visit = function(ctx){
        if(!this._isBaked){
            cc.Node.prototype.visit.call(this, ctx);
            return;
        }

        var context = ctx || cc._renderContext;
        var _t = this;
        // quick return if not visible
        if (!_t._visible)
            return;

        _t.transform(context);

        if(_t._bakeRenderCmd)
            cc.renderer.pushRenderCommand(_t._bakeRenderCmd);

        //the bakeSprite is drawing
        this._bakeSprite.visit(context);
    };

    _p._getBoundingBoxForBake = function () {
        //default size
        var rect = cc.rect(0, 0, this._contentSize.width, this._contentSize.height);
        var trans = this.nodeToWorldTransform();
        rect = cc.rectApplyAffineTransform(rect, this.nodeToWorldTransform());

        //query child's BoundingBox
        if (!this._children || this._children.length === 0)
            return rect;

        var locChildren = this._children;
        for (var i = 0; i < locChildren.length; i++) {
            var child = locChildren[i];
            if (child && child._visible) {
                var childRect = child._getBoundingBoxToCurrentNode(trans);
                rect = cc.rectUnion(rect, childRect);
            }
        }
        return rect;
    };

    //cc.LayerColor define end
    _p = null;
} else {
    cc.assert(cc.isFunction(cc._tmp.WebGLLayerColor), cc._LogInfos.MissingFile, "CCLayerWebGL.js");
    cc._tmp.WebGLLayerColor();
    delete cc._tmp.WebGLLayerColor;
}

cc.assert(cc.isFunction(cc._tmp.PrototypeLayerColor), cc._LogInfos.MissingFile, "CCLayerPropertyDefine.js");
cc._tmp.PrototypeLayerColor();
delete cc._tmp.PrototypeLayerColor;

/**
 * <p>
 * CCLayerGradient is a subclass of cc.LayerColor that draws gradients across the background.<br/>
 *<br/>
 * All features from cc.LayerColor are valid, plus the following new features:<br/>
 * <ul><li>direction</li>
 * <li>final color</li>
 * <li>interpolation mode</li></ul>
 * <br/>
 * Color is interpolated between the startColor and endColor along the given<br/>
 * vector (starting at the origin, ending at the terminus).  If no vector is<br/>
 * supplied, it defaults to (0, -1) -- a fade from top to bottom.<br/>
 * <br/>
 * If 'compressedInterpolation' is disabled, you will not see either the start or end color for<br/>
 * non-cardinal vectors; a smooth gradient implying both end points will be still<br/>
 * be drawn, however.<br/>
 *<br/>
 * If 'compressedInterpolation' is enabled (default mode) you will see both the start and end colors of the gradient.
 * </p>
 * @class
 * @extends cc.LayerColor
 *
 * @param {cc.Color} start Starting color
 * @param {cc.Color} end Ending color
 * @param {cc.Point} [v=cc.p(0, -1)] A vector defines the gradient direction, default direction is from top to bottom
 *
 * @property {cc.Color} startColor              - Start color of the color gradient
 * @property {cc.Color} endColor                - End color of the color gradient
 * @property {Number}   startOpacity            - Start opacity of the color gradient
 * @property {Number}   endOpacity              - End opacity of the color gradient
 * @property {Number}   vector                  - Direction vector of the color gradient
 * @property {Number}   compresseInterpolation  - Indicate whether or not the interpolation will be compressed
 */
cc.LayerGradient = cc.LayerColor.extend(/** @lends cc.LayerGradient# */{
    _endColor: null,
    _startOpacity: 255,
    _endOpacity: 255,
    _alongVector: null,
    _compressedInterpolation: false,
    _className: "LayerGradient",

    /**
     * Constructor of cc.LayerGradient
     * @param {cc.Color} start
     * @param {cc.Color} end
     * @param {cc.Point} [v=cc.p(0, -1)]
     */
    ctor: function (start, end, v) {
        var _t = this;
        cc.LayerColor.prototype.ctor.call(_t);

        _t._endColor = cc.color(0, 0, 0, 255);
        _t._alongVector = cc.p(0, -1);
        _t._startOpacity = 255;
        _t._endOpacity = 255;
        cc.LayerGradient.prototype.init.call(_t, start, end, v);
    },

    _initRendererCmd: function(){
        this._rendererCmd = new cc.GradientRectRenderCmdCanvas(this);
    },

    /**
     * Initialization of the layer, please do not call this function by yourself, you should pass the parameters to constructor to initialize a layer
     * @param {cc.Color} start starting color
     * @param {cc.Color} end
     * @param {cc.Point|Null} v
     * @return {Boolean}
     */
    init: function (start, end, v) {
        start = start || cc.color(0, 0, 0, 255);
        end = end || cc.color(0, 0, 0, 255);
        v = v || cc.p(0, -1);
        var _t = this;

        // Initializes the CCLayer with a gradient between start and end in the direction of v.
        var locEndColor = _t._endColor;
        _t._startOpacity = start.a;

        locEndColor.r = end.r;
        locEndColor.g = end.g;
        locEndColor.b = end.b;
        _t._endOpacity = end.a;

        _t._alongVector = v;
        _t._compressedInterpolation = true;

        cc.LayerColor.prototype.init.call(_t, cc.color(start.r, start.g, start.b, 255));
        cc.LayerGradient.prototype._updateColor.call(_t);
        return true;
    },

    /**
     * Sets the untransformed size of the LayerGradient.
     * @param {cc.Size|Number} size The untransformed size of the LayerGradient or The untransformed size's width of the LayerGradient.
     * @param {Number} [height] The untransformed size's height of the LayerGradient.
     */
    setContentSize: function (size, height) {
        cc.LayerColor.prototype.setContentSize.call(this, size, height);
        this._updateColor();
    },

    _setWidth: function (width) {
        cc.LayerColor.prototype._setWidth.call(this, width);
        this._updateColor();
    },
    _setHeight: function (height) {
        cc.LayerColor.prototype._setHeight.call(this, height);
        this._updateColor();
    },

    /**
     * Returns the starting color
     * @return {cc.Color}
     */
    getStartColor: function () {
        return this._realColor;
    },

    /**
     * Sets the starting color
     * @param {cc.Color} color
     * @example
     * // Example
     * myGradientLayer.setStartColor(cc.color(255,0,0));
     * //set the starting gradient to red
     */
    setStartColor: function (color) {
        this.color = color;
    },

    /**
     * Sets the end gradient color
     * @param {cc.Color} color
     * @example
     * // Example
     * myGradientLayer.setEndColor(cc.color(255,0,0));
     * //set the ending gradient to red
     */
    setEndColor: function (color) {
        this._endColor = color;
        this._updateColor();
    },

    /**
     * Returns the end color
     * @return {cc.Color}
     */
    getEndColor: function () {
        return this._endColor;
    },

    /**
     * Sets starting gradient opacity
     * @param {Number} o from 0 to 255, 0 is transparent
     */
    setStartOpacity: function (o) {
        this._startOpacity = o;
        this._updateColor();
    },

    /**
     * Returns the starting gradient opacity
     * @return {Number}
     */
    getStartOpacity: function () {
        return this._startOpacity;
    },

    /**
     * Sets the end gradient opacity
     * @param {Number} o
     */
    setEndOpacity: function (o) {
        this._endOpacity = o;
        this._updateColor();
    },

    /**
     * Returns the end gradient opacity
     * @return {Number}
     */
    getEndOpacity: function () {
        return this._endOpacity;
    },

    /**
     * Sets the direction vector of the gradient
     * @param {cc.Point} Var
     */
    setVector: function (Var) {
        this._alongVector.x = Var.x;
        this._alongVector.y = Var.y;
        this._updateColor();
    },

    /**
     * Returns the direction vector of the gradient
     * @return {cc.Point}
     */
    getVector: function () {
        return cc.p(this._alongVector.x, this._alongVector.y);
    },

    /**
     * Returns whether compressed interpolation is enabled
     * @return {Boolean}
     */
    isCompressedInterpolation: function () {
        return this._compressedInterpolation;
    },

    /**
     * Sets whether compressed interpolation is enabled
     * @param {Boolean} compress
     */
    setCompressedInterpolation: function (compress) {
        this._compressedInterpolation = compress;
        this._updateColor();
    },

    _draw: null,

    _updateColor: null
});

/**
 * Creates a gradient layer
 * @deprecated since v3.0, please use the new construction instead
 * @see cc.layerGradient
 * @param {cc.Color} start starting color
 * @param {cc.Color} end ending color
 * @param {cc.Point|Null} v
 * @return {cc.LayerGradient}
 */
cc.LayerGradient.create = function (start, end, v) {
    return new cc.LayerGradient(start, end, v);
};

if (cc._renderType === cc._RENDER_TYPE_CANVAS) {
    //cc.LayerGradient define start
    var _p = cc.LayerGradient.prototype;
    _p._updateColor = function () {
        var _t = this;
        var locAlongVector = _t._alongVector, tWidth = _t.width * 0.5, tHeight = _t.height * 0.5;

        var locCmd = this._rendererCmd;
        locCmd._startPoint.x = tWidth * (-locAlongVector.x) + tWidth;
        locCmd._startPoint.y = tHeight * locAlongVector.y - tHeight;
        locCmd._endPoint.x = tWidth * locAlongVector.x + tWidth;
        locCmd._endPoint.y = tHeight * (-locAlongVector.y) - tHeight;

        var locStartColor = this._displayedColor, locEndColor = this._endColor, opacity = this._displayedOpacity / 255;
        var startOpacity = this._startOpacity, endOpacity = this._endOpacity;
        locCmd._startStopStr = "rgba(" + Math.round(locStartColor.r) + "," + Math.round(locStartColor.g) + ","
            + Math.round(locStartColor.b) + "," + startOpacity.toFixed(4) + ")";
        locCmd._endStopStr = "rgba(" + Math.round(locEndColor.r) + "," + Math.round(locEndColor.g) + ","
            + Math.round(locEndColor.b) + "," + endOpacity.toFixed(4) + ")";
    };
    //cc.LayerGradient define end
    _p = null;
} else {
    cc.assert(cc.isFunction(cc._tmp.WebGLLayerGradient), cc._LogInfos.MissingFile, "CCLayerWebGL.js");
    cc._tmp.WebGLLayerGradient();
    delete cc._tmp.WebGLLayerGradient;
}

cc.assert(cc.isFunction(cc._tmp.PrototypeLayerGradient), cc._LogInfos.MissingFile, "CCLayerPropertyDefine.js");
cc._tmp.PrototypeLayerGradient();
delete cc._tmp.PrototypeLayerGradient;

/**
 * CCMultipleLayer is a CCLayer with the ability to multiplex it's children.<br/>
 * Features:<br/>
 *  <ul><li>- It supports one or more children</li>
 *  <li>- Only one children will be active a time</li></ul>
 * @class
 * @extends cc.Layer
 * @param {Array} layers an array of cc.Layer
 * @example
 * // Example
 * var multiLayer = new cc.LayerMultiple(layer1, layer2, layer3);//any number of layers
 */
cc.LayerMultiplex = cc.Layer.extend(/** @lends cc.LayerMultiplex# */{
    _enabledLayer: 0,
    _layers: null,
    _className: "LayerMultiplex",

    /**
     * Constructor of cc.LayerMultiplex
     * @param {Array} layers an array of cc.Layer
     */
    ctor: function (layers) {
        cc.Layer.prototype.ctor.call(this);
        if (layers instanceof Array)
            cc.LayerMultiplex.prototype.initWithLayers.call(this, layers);
        else
            cc.LayerMultiplex.prototype.initWithLayers.call(this, Array.prototype.slice.call(arguments));
    },

    /**
     * Initialization of the layer multiplex, please do not call this function by yourself, you should pass the parameters to constructor to initialize a layer multiplex
     * @param {Array} layers an array of cc.Layer
     * @return {Boolean}
     */
    initWithLayers: function (layers) {
        if ((layers.length > 0) && (layers[layers.length - 1] == null))
            cc.log(cc._LogInfos.LayerMultiplex_initWithLayers);

        this._layers = layers;
        this._enabledLayer = 0;
        this.addChild(this._layers[this._enabledLayer]);
        return true;
    },

    /**
     * Switches to a certain layer indexed by n.<br/>
     * The current (old) layer will be removed from it's parent with 'cleanup:YES'.
     * @param {Number} n the layer index to switch to
     */
    switchTo: function (n) {
        if (n >= this._layers.length) {
            cc.log(cc._LogInfos.LayerMultiplex_switchTo);
            return;
        }

        this.removeChild(this._layers[this._enabledLayer], true);
        this._enabledLayer = n;
        this.addChild(this._layers[n]);
    },

    /**
     * Release the current layer and switches to another layer indexed by n.<br/>
     * The current (old) layer will be removed from it's parent with 'cleanup:YES'.
     * @param {Number} n the layer index to switch to
     */
    switchToAndReleaseMe: function (n) {
        if (n >= this._layers.length) {
            cc.log(cc._LogInfos.LayerMultiplex_switchToAndReleaseMe);
            return;
        }

        this.removeChild(this._layers[this._enabledLayer], true);

        //[layers replaceObjectAtIndex:_enabledLayer withObject:[NSNull null]];
        this._layers[this._enabledLayer] = null;
        this._enabledLayer = n;
        this.addChild(this._layers[n]);
    },

    /**
     * Add a layer to the multiplex layers list
     * @param {cc.Layer} layer
     */
    addLayer: function (layer) {
        if (!layer) {
            cc.log(cc._LogInfos.LayerMultiplex_addLayer);
            return;
        }
        this._layers.push(layer);
    }
});

/**
 * Creates a cc.LayerMultiplex with one or more layers using a variable argument list.
 * @deprecated since v3.0, please use new construction instead
 * @see cc.LayerMultiplex
 * @return {cc.LayerMultiplex|Null}
 */
cc.LayerMultiplex.create = function (/*Multiple Arguments*/) {
    return new cc.LayerMultiplex(Array.prototype.slice.call(arguments));
};