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
 * All features from cc.Node are valid, plus the following new features:<br/>
 * It can receive iPhone Touches<br/>
 * It can receive Accelerometer input
 * @class
 * @extends cc.Node
 */
cc.Layer = cc.Node.extend(/** @lends cc.Layer# */{
    /**
     * init layer
     * @return {Boolean}
     */
    _className: "Layer",

    /**
     * Constructor of cc.Layer
     */
    ctor: function () {
        var nodep = cc.Node.prototype;
        nodep.ctor.call(this);
        this._ignoreAnchorPointForPosition = true;
        nodep.setAnchorPoint.call(this, 0.5, 0.5);
        nodep.setContentSize.call(this, cc.winSize);
    }
});

/**
 * creates a layer
 * @example
 * // Example
 * var myLayer = cc.Layer.create();
 * //Yes! it's that simple
 * @return {cc.Layer|Null}
 */
cc.Layer.create = function () {
    return new cc.Layer();
};

/**
 * <p>
 *     CCLayerRGBA is a subclass of CCLayer that implements the CCRGBAProtocol protocol using a solid color as the background.                        <br/>
 *     All features from CCLayer are valid, plus the following new features that propagate into children that conform to the CCRGBAProtocol:          <br/>
 *       - opacity                                                                                                                                    <br/>
 *       - RGB colors
 * </p>
 * @class
 * @extends cc.Layer
 *
 * @property {Number}       opacity             - Opacity of layer
 * @property {Boolean}      opacityModifyRGB    - Indicate whether or not the opacity modify color
 * @property {Boolean}      cascadeOpacity      - Indicate whether or not it will set cascade opacity
 * @property {cc.Color}     color               - Color of layer
 * @property {Boolean}      cascadeColor        - Indicate whether or not it will set cascade color
 */
cc.LayerRGBA = cc.Layer.extend(/** @lends cc.LayerRGBA# */{
    RGBAProtocol: true,
    _displayedOpacity: 255,
    _realOpacity: 255,
    _displayedColor: null,
    _realColor: null,
    _cascadeOpacityEnabled: false,
    _cascadeColorEnabled: false,
    _className: "LayerRGBA",

    /**
     * Constructor of cc.LayerRGBA
     */
    ctor: function () {
        cc.Layer.prototype.ctor.call(this);
        this._displayedColor = cc.color(255, 255, 255, 255);
        this._realColor = cc.color(255, 255, 255, 255);
    },

    init: function () {
        var nodep = cc.Layer.prototype, _t = this;
        _t._ignoreAnchorPointForPosition = true;
        nodep.setAnchorPoint.call(_t, 0.5, 0.5);
        nodep.setContentSize.call(_t, cc.winSize);
        _t.cascadeOpacity = false;
        _t.cascadeColor = false;
        return true;
    },

    /**
     * Get the opacity of Layer
     * @returns {number} opacity
     */
    getOpacity: function () {
        return this._realOpacity;
    },

    /**
     * Get the displayed opacity of Layer
     * @returns {number} displayed opacity
     */
    getDisplayedOpacity: function () {
        return this._displayedOpacity;
    },

    /**
     * Override synthesized setOpacity to recurse items
     * @param {Number} opacity
     */
    setOpacity: function (opacity) {
        var _t = this;
        _t._displayedOpacity = _t._realOpacity = opacity;

        var parentOpacity = 255, locParent = _t._parent;
        if (locParent && locParent.RGBAProtocol && locParent.cascadeOpacity)
            parentOpacity = locParent.getDisplayedOpacity();
        _t.updateDisplayedOpacity(parentOpacity);

        _t._displayedColor.a = _t._realColor.a = opacity;
    },

    /**
     * Update displayed opacity of Layer
     * @param {Number} parentOpacity
     */
    updateDisplayedOpacity: function (parentOpacity) {
        var _t = this;
        _t._displayedOpacity = 0 | (_t._realOpacity * parentOpacity / 255.0);

        if (_t._cascadeOpacityEnabled) {
            var locChildren = _t._children, selItem;
            for (var i = 0; i < locChildren.length; i++) {
                selItem = locChildren[i];
                if (selItem && selItem.RGBAProtocol)
                    selItem.updateDisplayedOpacity(_t._displayedOpacity);
            }
        }
    },

    /**
     * whether or not it will set cascade opacity.
     * @returns {boolean}
     */
    isCascadeOpacityEnabled: function () {
        return this._cascadeOpacityEnabled;
    },

    /**
     * Enable or disable cascade opacity
     * @param {boolean} cascadeOpacityEnabled
     */
    setCascadeOpacityEnabled: function (cascadeOpacityEnabled) {
        if (this._cascadeOpacityEnabled === cascadeOpacityEnabled)
            return;

        this._cascadeOpacityEnabled = cascadeOpacityEnabled;
        if (cascadeOpacityEnabled)
            this._enableCascadeOpacity();
        else
            this._disableCascadeOpacity();
    },

    _enableCascadeOpacity: function () {
        var parentOpacity = 255, locParent = this._parent;
        if (locParent && locParent.RGBAProtocol && locParent.cascadeOpacity)
            parentOpacity = locParent.getDisplayedOpacity();
        this.updateDisplayedOpacity(parentOpacity);
    },

    _disableCascadeOpacity: function () {
        this._displayedOpacity = this._realOpacity;
        var selChildren = this._children, item;
        for (var i = 0; i < selChildren.length; i++) {
            item = selChildren[i];
            if (item && item.RGBAProtocol)
                item.updateDisplayedOpacity(255);
        }
    },

    /**
     * Get the color of Layer
     * @returns {cc.Color}
     */
    getColor: function () {
        var locRealColor = this._realColor;
        return cc.color(locRealColor.r, locRealColor.g, locRealColor.b, locRealColor.a);
    },

    /**
     * Get the displayed color of Layer
     * @returns {cc.Color}
     */
    getDisplayedColor: function () {
        var locDisplayedColor = this._displayedColor;
        return cc.color(locDisplayedColor.r, locDisplayedColor.g, locDisplayedColor.b);
    },

    /**
     * Set the color of Layer
     * @param {cc.Color} color
     */
    setColor: function (color) {
        var locDisplayed = this._displayedColor, locRealColor = this._realColor;
        locDisplayed.r = locRealColor.r = color.r;
        locDisplayed.g = locRealColor.g = color.g;
        locDisplayed.b = locRealColor.b = color.b;

        var parentColor, locParent = this._parent;
        if (locParent && locParent.RGBAProtocol && locParent.cascadeColor)
            parentColor = locParent.getDisplayedColor();
        else
            parentColor = cc.color.WHITE;
        this.updateDisplayedColor(parentColor);
    },

    /**
     * update the displayed color of Node
     * @param {cc.Color} parentColor
     */
    updateDisplayedColor: function (parentColor) {
        var locDisplayedColor = this._displayedColor, locRealColor = this._realColor;
        locDisplayedColor.r = 0 | (locRealColor.r * parentColor.r / 255.0);
        locDisplayedColor.g = 0 | (locRealColor.g * parentColor.g / 255.0);
        locDisplayedColor.b = 0 | (locRealColor.b * parentColor.b / 255.0);

        if (this._cascadeColorEnabled) {
            var locChildren = this._children, selItem;
            for (var i = 0; i < locChildren.length; i++) {
                selItem = locChildren[i];
                if (selItem && selItem.RGBAProtocol)
                    selItem.updateDisplayedColor(locDisplayedColor);
            }
        }
    },

    /**
     * whether or not it will set cascade color.
     * @returns {boolean}
     */
    isCascadeColorEnabled: function () {
        return this._cascadeColorEnabled;
    },

    /**
     * Enable or disable cascade color
     * @param {boolean} cascadeColorEnabled
     */
    setCascadeColorEnabled: function (cascadeColorEnabled) {
        if (this._cascadeColorEnabled === cascadeColorEnabled)
            return;
        this._cascadeColorEnabled = cascadeColorEnabled;
        if (this._cascadeColorEnabled)
            this._enableCascadeColor();
        else
            this._disableCascadeColor();
    },

    _enableCascadeColor: function () {
        var parentColor , locParent = this._parent;
        if (locParent && locParent.RGBAProtocol && locParent.cascadeColor)
            parentColor = locParent.getDisplayedColor();
        else
            parentColor = cc.color.WHITE;
        this.updateDisplayedColor(parentColor);
    },

    _disableCascadeColor: function () {
        var locDisplayedColor = this._displayedColor, locRealColor = this._realColor;
        locDisplayedColor.r = locRealColor.r;
        locDisplayedColor.g = locRealColor.g;
        locDisplayedColor.b = locRealColor.b;

        var selChildren = this._children, whiteColor = cc.color.WHITE, item, i;
        for (i = 0; i < selChildren.length; i++) {
            item = selChildren[i];
            if (item && item.RGBAProtocol)
                item.updateDisplayedColor(whiteColor);
        }
    },

    /**
     * add a child to layer
     * @overried
     * @param {cc.Node} child  A child node
     * @param {Number} [zOrder=]  Z order for drawing priority. Please refer to setLocalZOrder(int)
     * @param {Number} [tag=]  A integer to identify the node easily. Please refer to setTag(int)
     */
    addChild: function (child, zOrder, tag) {
        cc.Node.prototype.addChild.call(this, child, zOrder, tag);

        if (this._cascadeColorEnabled)
            this._enableCascadeColor();
        if (this._cascadeOpacityEnabled)
            this._enableCascadeOpacity();
    },

    setOpacityModifyRGB: function (bValue) {
    },

    isOpacityModifyRGB: function () {
        return false;
    }
});

cc.assert(typeof cc._tmp.PrototypeLayerRGBA === "function", cc._LogInfos.MissingFile, "CCLayerPropertyDefine.js");
cc._tmp.PrototypeLayerRGBA();
delete cc._tmp.PrototypeLayerRGBA;

/**
 * <p>
 * CCLayerColor is a subclass of CCLayer that implements the CCRGBAProtocol protocol.       <br/>
 *  All features from CCLayer are valid, plus the following new features:                   <br/>
 * <ul><li>opacity</li>                                                                     <br/>
 * <li>RGB colors</li></ul>                                                                 <br/>
 * </p>
 * @class
 * @extends cc.LayerRGBA
 */
cc.LayerColor = cc.LayerRGBA.extend(/** @lends cc.LayerColor# */{
    _blendFunc: null,
    _className: "LayerColor",

    /**
     * blendFunc getter
     * @return {cc.BlendFunc}
     */
    getBlendFunc: function () {
        return this._blendFunc;
    },

    /**
     * change width and height in Points
     * @deprecated
     * @param {Number} w width
     * @param {Number} h height
     */
    changeWidthAndHeight: function (w, h) {
        this.width = w;
        this.height = h;
    },

    /**
     * change width in Points
     * @deprecated
     * @param {Number} w width
     */
    changeWidth: function (w) {
        this.width = w;
    },

    /**
     * change height in Points
     * @deprecated
     * @param {Number} h height
     */
    changeHeight: function (h) {
        this.height = h;
    },

    /**
     * set OpacityModifyRGB of cc.LayerColor
     * @param {Boolean}  value
     */
    setOpacityModifyRGB: function (value) {
    },

    /**
     * is OpacityModifyRGB
     * @return {Boolean}
     */
    isOpacityModifyRGB: function () {
        return false;
    },

    setColor: function (color) {
        cc.LayerRGBA.prototype.setColor.call(this, color);
        this._updateColor();
    },

    setOpacity: function (opacity) {
        cc.LayerRGBA.prototype.setOpacity.call(this, opacity);
        this._updateColor();
    },

    _isLighterMode: false,
    /**
     * Constructor of cc.LayerColor
     * @function
     * @param {cc.Color} [color=]
     * @param {Number} [width=]
     * @param {Number} [height=]
     */
    ctor: null,

    /**
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
     * blendFunc setter
     * @param {Number} src
     * @param {Number} dst
     */
    setBlendFunc: function (src, dst) {
        var _t = this;
        if (dst === undefined)
            _t._blendFunc = src;
        else
            _t._blendFunc = {src: src, dst: dst};
        if (cc._renderType === cc._RENDER_TYPE_CANVAS)
            _t._isLighterMode = (_t._blendFunc && (_t._blendFunc.src == 1) && (_t._blendFunc.dst == 771));
    },

    _setWidth: null,

    _setHeight: null,

    _updateColor: null,

    updateDisplayedColor: function (parentColor) {
        cc.LayerRGBA.prototype.updateDisplayedColor.call(this, parentColor);
        this._updateColor();
    },

    updateDisplayedOpacity: function (parentOpacity) {
        cc.LayerRGBA.prototype.updateDisplayedOpacity.call(this, parentOpacity);
        this._updateColor();
    },

    /**
     * Renders the layer
     * @function
     * @param {CanvasRenderingContext2D|WebGLRenderingContext} ctx
     */
    draw: null
});

/**
 * creates a cc.Layer with color, width and height in Points
 * @param {cc.Color} color
 * @param {Number|Null} [width=]
 * @param {Number|Null} [height=]
 * @return {cc.LayerColor}
 * @example
 * // Example
 * //Create a yellow color layer as background
 * var yellowBackground = cc.LayerColor.create(cc.color(255,255,0,255));
 * //If you didn't pass in width and height, it defaults to the same size as the canvas
 *
 * //create a yellow box, 200 by 200 in size
 * var yellowBox = cc.LayerColor.create(cc.color(255,255,0,255), 200, 200);
 */
cc.LayerColor.create = function (color, width, height) {
    return new cc.LayerColor(color, width, height);
};

if (cc._renderType === cc._RENDER_TYPE_CANVAS) {
    //cc.LayerColor define start
    var _p = cc.LayerColor.prototype;
    _p.ctor = function (color, width, height) {
        cc.LayerRGBA.prototype.ctor.call(this);
        this._blendFunc = new cc.BlendFunc(cc.BLEND_SRC, cc.BLEND_DST);
        cc.LayerColor.prototype.init.call(this, color, width, height);
    };
    _p.initRendererCmd = function(){
        this._rendererCmd = new cc.RectRenderCmdCanvas(this);
    };
    _p._setWidth = function(width){
        cc.Node.prototype._setWidth.call(this, width);
        this._rendererCmd._drawingRect.width = width;
    };
    _p._setHeight = function(height){
        cc.Node.prototype._setHeight.call(this, height);
        this._rendererCmd._drawingRect.height = height;
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

    _p.toRenderer = function(){
        if(!this._rendererCmd)
            return;

        var locCmd = this._rendererCmd;
        var locColor = this._displayedColor;
        locCmd._isLighterMode = this._isLighterMode;

        locCmd._color.r = locColor.r;
        locCmd._color.g = locColor.g;
        locCmd._color.b = locColor.b;
        locCmd._color.a = this._displayedOpacity / 255;

        locCmd._drawingRect.width = this.width * cc.view.getScaleX();
        locCmd._drawingRect.height = this.height * cc.view.getScaleY();
    };

    _p.draw = function (ctx) {
        var context = ctx || cc._renderContext, _t = this;
        var locEGLViewer = cc.view, locDisplayedColor = _t._displayedColor;

        context.fillStyle = "rgba(" + (0 | locDisplayedColor.r) + "," + (0 | locDisplayedColor.g) + ","
            + (0 | locDisplayedColor.b) + "," + _t._displayedOpacity / 255 + ")";
        context.fillRect(0, 0, _t.width * locEGLViewer.getScaleX(), -_t.height * locEGLViewer.getScaleY());
        cc.g_NumberOfDraws++;
    };
    //cc.LayerGradient define end
    _p = null;
} else {
    cc.assert(typeof cc._tmp.WebGLLayerColor === "function", cc._LogInfos.MissingFile, "CCLayerWebGL.js");
    cc._tmp.WebGLLayerColor();
    delete cc._tmp.WebGLLayerColor;
}

cc.assert(typeof cc._tmp.PrototypeLayerColor === "function", cc._LogInfos.MissingFile, "CCLayerPropertyDefine.js");
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
 * @property {cc.Color} startColor              - Start color of the color gradient
 * @property {cc.Color} endColor                - End color of the color gradient
 * @property {Number}   startOpacity            - Start opacity of the color gradient
 * @property {Number}   endOpacity              - End opacity of the color gradient
 * @property {Number}   vector                  - Direction vector of the color gradient
 * @property {Number}   compresseInterpolation  - Indicate whether or not the interpolation will be compressed
 */
cc.LayerGradient = cc.LayerColor.extend(/** @lends cc.LayerGradient# */{
    _startColor: null,
    _endColor: null,
    _startOpacity: 255,
    _endOpacity: 255,
    _alongVector: null,
    _compressedInterpolation: false,
    _className: "LayerGradient",

    /**
     * Constructor of cc.LayerGradient
     * @param {cc.Color} start starting color
     * @param {cc.Color} end
     * @param {cc.Point|Null} v
     */
    ctor: function (start, end, v) {
        var _t = this;
        cc.LayerColor.prototype.ctor.call(_t);

        _t._startColor = cc.color(0, 0, 0, 255);
        _t._endColor = cc.color(0, 0, 0, 255);
        _t._alongVector = cc.p(0, -1);
        _t._startOpacity = 255;
        _t._endOpacity = 255;
        cc.LayerGradient.prototype.init.call(_t, start, end, v);
    },

    initRendererCmd: function(){
        this._rendererCmd = new cc.GradientRectRenderCmdCanvas(this);
    },

    /**
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
        var locStartColor = _t._startColor, locEndColor = _t._endColor;
        locStartColor.r = start.r;
        locStartColor.g = start.g;
        locStartColor.b = start.b;
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
     * @override
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
     * get the starting color
     * @return {cc.Color}
     */
    getStartColor: function () {
        return this._realColor;
    },

    /**
     * set the starting color
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
     * set the end gradient color
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
     * get the end color
     * @return {cc.Color}
     */
    getEndColor: function () {
        return this._endColor;
    },

    /**
     * set starting gradient opacity
     * @param {Number} o from 0 to 255, 0 is transparent
     */
    setStartOpacity: function (o) {
        this._startOpacity = o;
        this._updateColor();
    },

    /**
     * get the starting gradient opacity
     * @return {Number}
     */
    getStartOpacity: function () {
        return this._startOpacity;
    },

    /**
     * set the end gradient opacity
     * @param {Number} o
     */
    setEndOpacity: function (o) {
        this._endOpacity = o;
        this._updateColor();
    },

    /**
     * get the end gradient opacity
     * @return {Number}
     */
    getEndOpacity: function () {
        return this._endOpacity;
    },

    /**
     * set vector
     * @param {cc.Point} Var
     */
    setVector: function (Var) {
        this._alongVector.x = Var.x;
        this._alongVector.y = Var.y;
        this._updateColor();
    },

    /**
     * @return {cc.Point}
     */
    getVector: function () {
        return cc.p(this._alongVector.x, this._alongVector.y);
    },

    /** is Compressed Interpolation
     * @return {Boolean}
     */
    isCompressedInterpolation: function () {
        return this._compressedInterpolation;
    },

    /**
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
 * creates a gradient layer
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
    _p.toRenderer = function(){
        if(!this._rendererCmd)
            return;

        var locCmd = this._rendererCmd;
        //set the data to the rendererCmd
        var locColor = this._displayedColor, locEndColor = this._endColor;
        locCmd._isLighterMode = this._isLighterMode;
        locCmd._opacity = this._displayedOpacity/255;

        locCmd._startColor.r = locColor.r;
        locCmd._startColor.g = locColor.g;
        locCmd._startColor.b = locColor.b;
        locCmd._startColor.a = locColor.a;

        locCmd._endColor.r = locEndColor.r;
        locCmd._endColor.g = locEndColor.g;
        locCmd._endColor.b = locEndColor.b;
        locCmd._endColor.a = locEndColor.a;

        locCmd._drawingRect.width = this.width * cc.view.getScaleX();
        locCmd._drawingRect.height = this.height * cc.view.getScaleY();
    };

    _p._updateColor = function () {
        var _t = this;
        var locAlongVector = _t._alongVector, tWidth = _t.width * 0.5, tHeight = _t.height * 0.5;

        var locCmd = this._rendererCmd;
        locCmd._startPoint.x = tWidth * (-locAlongVector.x) + tWidth;
        locCmd._startPoint.y = tHeight * locAlongVector.y - tHeight;
        locCmd._endPoint.x = tWidth * locAlongVector.x + tWidth;
        locCmd._endPoint.y = tHeight * (-locAlongVector.y) - tHeight;
    };
    //cc.LayerGradient define end
    _p = null;
} else {
    cc.assert(typeof cc._tmp.WebGLLayerGradient === "function", cc._LogInfos.MissingFile, "CCLayerWebGL.js");
    cc._tmp.WebGLLayerGradient();
    delete cc._tmp.WebGLLayerGradient;
}

cc.assert(typeof cc._tmp.PrototypeLayerGradient === "function", cc._LogInfos.MissingFile, "CCLayerPropertyDefine.js");
cc._tmp.PrototypeLayerGradient();
delete cc._tmp.PrototypeLayerGradient;

/**
 * CCMultipleLayer is a CCLayer with the ability to multiplex it's children.<br/>
 * Features:<br/>
 *  <ul><li>- It supports one or more children</li>
 *  <li>- Only one children will be active a time</li></ul>
 *  @class
 *  @extends cc.Layer
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
        layers && cc.LayerMultiplex.prototype.initWithLayers.call(this, layers);
    },

    /**
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
     * switches to a certain layer indexed by n.<br/>
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

    /** release the current layer and switches to another layer indexed by n.<br/>
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
 * creates a cc.LayerMultiplex with one or more layers using a variable argument list.
 * @return {cc.LayerMultiplex|Null}
 * @example
 * // Example
 * var multiLayer = cc.LayerMultiple.create(layer1, layer2, layer3);//any number of layers
 */
cc.LayerMultiplex.create = function (/*Multiple Arguments*/) {
    return new cc.LayerMultiplex(arguments);
};

