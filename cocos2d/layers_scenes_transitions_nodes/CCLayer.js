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

/*cc.LayerRGBAColor = function(color) {

 }*/
//
// cc.Layer
//
/** @brief cc.Layer is a subclass of cc.Node that implements the TouchEventsDelegate protocol.

 All features from cc.Node are valid, plus the following new features:
 - It can receive iPhone Touches
 - It can receive Accelerometer input
 */

cc.Layer = cc.Node.extend({
    _isTouchEnabled:false,
    _isAccelerometerEnabled:false,
    _isKeypadEnabled:false,

    ctor:function () {
        this._super();
        this.setAnchorPoint(cc.ccp(0.5, 0.5));
        this._isRelativeAnchorPoint = false;
        //this.initLayer();
        var director = cc.Director.sharedDirector();
        if (!director) {
            return false;
        }
        this.setContentSize(director.getWinSize());
        this._isTouchEnabled = false;
        this._isAccelerometerEnabled = false;
    },

    init:function () {
        /*var director = cc.Director.sharedDirector();
        if (!director) {
            return false;
        }
        this.setContentSize(director.getWinSize());
        this._isTouchEnabled = false;*/

        // success
        return true;
    },
    type:"layer",

    /// Touch and Accelerometer related
    /** If isTouchEnabled, this method is called onEnter. Override it to change the
     way CCLayer receives touch events.
     ( Default: CCTouchDispatcher.sharedDispatcher().addStandardDelegate(this,0); )
     Example:
     CCLayer.registerWithTouchDispatcher()
     {
     CCTouchDispatcher.sharedDispatcher().addTargetedDelegate(this,INT_MIN+1,true);
     }
     @since v0.8.0
     */
    registerWithTouchDispatcher:function () {
        cc.TouchDispatcher.sharedDispatcher().addStandardDelegate(this, 0);
    },

    /** whether or not it will receive Touch events.
     You can enable / disable touch events with this property.
     Only the touches of this node will be affected. This "method" is not propagated to it's children.
     @since v0.8.1
     */
    /// isTouchEnabled getter
    getIsTouchEnabled:function () {
        return this._isTouchEnabled;
    },
    /// isTouchEnabled setter
    setIsTouchEnabled:function (enabled) {
        if (this._isTouchEnabled != enabled) {
            this._isTouchEnabled = enabled;


            if (this._isRunning) {
                if (enabled) {
                    this.registerWithTouchDispatcher();
                } else {
                    // have problems?
                    cc.TouchDispatcher.sharedDispatcher().removeDelegate(this);
                }
            }
        }
    },
    /** whether or not it will receive Accelerometer events
     You can enable / disable accelerometer events with this property.
     @since v0.8.1
     */
    /// isAccelerometerEnabled getter
    getIsAccelerometerEnabled:function () {
        return this._isAccelerometerEnabled;
    },
    /// isAccelerometerEnabled setter
    setIsAccelerometerEnabled:function (enabled) {
        if (enabled != this._isAccelerometerEnabled) {
            this._isAccelerometerEnabled = enabled;

            if (this._isRunning) {
                if (enabled) {
                    cc.Accelerometer.sharedAccelerometer().setDelegate(this);
                }
                else {
                    cc.Accelerometer.sharedAccelerometer().setDelegate(null);
                }
            }
        }
    },
    /** whether or not it will receive keypad events
     You can enable / disable accelerometer events with this property.
     it's new in cocos2d-x
     */
    /// isKeypadEnabled getter
    getIsKeypadEnabled:function () {
        return this._isKeypadEnabled;
    },
    /// isKeypadEnabled setter
    setIsKeypadEnabled:function (enabled) {
        if (enabled != this._isKeypadEnabled) {
            this._isKeypadEnabled = enabled;
            if (this._isRunning) {
                if (enabled) {
                    cc.KeypadDispatcher.sharedDispatcher().addDelegate(this);
                } else {
                    cc.KeypadDispatcher.sharedDispatcher().removeDelegate(this);
                }
            }
        }
    },

/// Callbacks
    onEnter:function () {
        // register 'parent' nodes first
        // since events are propagated in reverse order
        if (this._isTouchEnabled) {
            this.registerWithTouchDispatcher();
        }

        // then iterate over all the children
        //cc.Node.onEnter();
        this._super();

        // add this layer to concern the Accelerometer Sensor
        if (this._isAccelerometerEnabled) {
            cc.Accelerometer.sharedAccelerometer().setDelegate(this);
        }

        // add this layer to concern the kaypad msg
        if (this._isKeypadEnabled) {
            cc.KeypadDispatcher.sharedDispatcher().addDelegate(this);
        }
    },
    onExit:function () {
        if (this._isTouchEnabled) {
            cc.TouchDispatcher.sharedDispatcher().removeDelegate(this);
        }

        // remove this layer from the delegates who concern Accelerometer Sensor
        if (this._isAccelerometerEnabled) {
            cc.Accelerometer.sharedAccelerometer().setDelegate(null);
        }

        // remove this layer from the delegates who concern the kaypad msg
        if (this._isKeypadEnabled) {
            cc.KeypadDispatcher.sharedDispatcher().removeDelegate(this);
        }

        this._super();
    },
    onEnterTransitionDidFinish:function () {
        if (this._isAccelerometerEnabled) {
            cc.Accelerometer.sharedAccelerometer().setDelegate(this);
        }
        this._super();
    },
    // default implements are used to call script callback if exist
    ccTouchBegan:function (touch, event) {
        cc.Assert(false, "Layer#ccTouchBegan override me");
        return true;
    },
    ccTouchMoved:function (touch, event) {
    },
    ccTouchEnded:function (touch, event) {
    },
    ccTouchCancelled:function (touch, event) {
    },

    // default implements are used to call script callback if exist
    ccTouchesBegan:function (touch, event) {
    },
    ccTouchesMoved:function (touch, event) {
    },
    ccTouchesEnded:function (touch, event) {
    },
    ccTouchesCancelled:function (touch, event) {
    },

    didAccelerate:function (pAccelerationValue) {
    },

    addLayer:function (layer) {
        cc.Assert(this.layers, "cc.Layer addLayer");
        this.layers.addObject(layer);
    }
});

cc.Layer.node = function () {
    var ret = new cc.Layer();
    if (ret && ret.init()) {
        return ret;
    }
    else {
        return null;
    }
};


//
// CCLayerColor
//
/** @brief CCLayerColor is a subclass of CCLayer that implements the CCRGBAProtocol protocol.

 All features from CCLayer are valid, plus the following new features:
 - opacity
 - RGB colors
 */
cc.LayerColor = cc.Layer.extend({
    _squareVertices:[],
    _squareColors:[],
    _opacity:0,
    _color:new cc.Color3B(255, 255, 255),
    _blendFunc:new cc.BlendFunc(cc.BLEND_SRC, cc.BLEND_DST),

    /// ColorLayer
    ctor:function () {
        this._squareVertices = [new cc.Vertex2F(0, 0), new cc.Vertex2F(0, 0), new cc.Vertex2F(0, 0), new cc.Vertex2F(0, 0)];
        this._squareColors = [new cc.Color4B(0, 0, 0, 1), new cc.Color4B(0, 0, 0, 1), new cc.Color4B(0, 0, 0, 1), new cc.Color4B(0, 0, 0, 1)];
        this._color = new cc.Color3B(0, 0, 0);
        this._super();
    },

    // Opacity and RGB color protocol
    /// opacity getter
    getOpacity:function () {
        return this._opacity;
    },

    /// opacity setter
    setOpacity:function (Var) {
        this._opacity = Var;
        this._updateColor();

        //this._addDirtyRegionToDirector(this.boundingBoxToWorld());
        this.setNodeDirty();
    },
    /// color getter
    getColor:function () {
        return this._color;
    },
    /// color setter
    setColor:function (Var) {
        this._color = Var;
        this._updateColor();

        //this._addDirtyRegionToDirector(this.boundingBoxToWorld());
        this.setNodeDirty();
    },
    /// blendFunc getter
    getBlendFunc:function () {
        return this._blendFunc;
    },
    /// blendFunc setter
    setBlendFunc:function (Var) {
        this._blendFunc = Var;
    },

    initWithColor:function (color) {
        var s = cc.Director.sharedDirector().getWinSize();
        this.initWithColorWidthHeight(color, s.width, s.height);
        return true;
    },

    initWithColorWidthHeight:function (color, width, height) {
        this._blendFunc.src = cc.BLEND_SRC;
        this._blendFunc.dst = cc.BLEND_DST;
        this._color = new cc.Color3B(color.r, color.g, color.b);
        this._opacity = color.a;

        for (var i = 0; i < this._squareVertices.length; i++) {
            this._squareVertices[i].x = 0.0;
            this._squareVertices[i].y = 0.0;
        }
        this._updateColor();
        this.setContentSize(cc.SizeMake(width, height));
        return true;
    },
    /// override contentSize
    setContentSize:function (size) {
        this._squareVertices[1].x = size.width * cc.CONTENT_SCALE_FACTOR();
        this._squareVertices[2].y = size.height * cc.CONTENT_SCALE_FACTOR();
        this._squareVertices[3].x = size.width * cc.CONTENT_SCALE_FACTOR();
        this._squareVertices[3].y = size.height * cc.CONTENT_SCALE_FACTOR();
        this._super(size);
    },
    /** change width and height in Points
     @since v0.8
     */
    changeWidthAndHeight:function (w, h) {
        this.setContentSize(cc.SizeMake(w, h));
    },
    /** change width in Points*/
    changeWidth:function (w) {
        this.setContentSize(cc.SizeMake(w, this._contentSize.height));
    },
    /** change height in Points*/
    changeHeight:function (h) {
        this.setContentSize(cc.SizeMake(this._contentSize.width, h));
    },
    _updateColor:function () {
        for (var i = 0; i < 4; i++) {
            this._squareColors[i].r = Math.round(this._color.r);
            this._squareColors[i].g = Math.round(this._color.g);
            this._squareColors[i].b = Math.round(this._color.b);
            this._squareColors[i].a = Math.round(this._opacity);
        }
    },
    setIsOpacityModifyRGB:function (value) {
    },
    getIsOpacityModifyRGB:function () {
        return false;
    },

    draw:function (ctx) {
        //TODO need to fix child position in relation to parent
        var context = ctx || cc.renderContext;

        if (cc.renderContextType == cc.CANVAS) {
            //context.globalAlpha = this.getOpacity() / 255;
            var tWidth = this.getContentSize().width;
            var tHeight = this.getContentSize().height;
            var tGradient = context.createLinearGradient(-this.getAnchorPointInPixels().x, this.getAnchorPointInPixels().y,
                -this.getAnchorPointInPixels().x + tWidth, -(this.getAnchorPointInPixels().y + tHeight));

            tGradient.addColorStop(0, "rgba(" + this._squareColors[0].r + "," + this._squareColors[0].g + ","
                + this._squareColors[0].b + "," + this._squareColors[0].a / 255 + ")");
            tGradient.addColorStop(1, "rgba(" + this._squareColors[3].r + "," + this._squareColors[3].g + ","
                + this._squareColors[3].b + "," + this._squareColors[3].a / 255 + ")");

            context.fillStyle = tGradient;
            context.fillRect(-this.getAnchorPointInPixels().x, this.getAnchorPointInPixels().y, tWidth, -tHeight);
        }
        this._super();
        return;
        // Default GL states: GL_TEXTURE_2D, GL_VERTEX_ARRAY, GL_COLOR_ARRAY, GL_TEXTURE_COORD_ARRAY
        // Needed states: GL_VERTEX_ARRAY, GL_COLOR_ARRAY
        // Unneeded states: GL_TEXTURE_2D, GL_TEXTURE_COORD_ARRAY

        // glDisableClientState(GL_TEXTURE_COORD_ARRAY);

        // glDisable(GL_TEXTURE_2D);

        // glVertexPointer(2, GL_FLOAT, 0, this._squareVertices);

        // glColorPointer(4, GL_UNSIGNED_BYTE, 0, this._squareColors);

        var newBlend = false;
        if (this._blendFunc.src != cc.BLEND_SRC || this._blendFunc.dst != cc.BLEND_DST) {
            newBlend = true;
            //glBlendFunc(this._blendFunc.src, this._blendFunc.dst);
        }
        else if (this._opacity != 255) {
            newBlend = true;
            // glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
        }

        // glDrawArrays(GL_TRIANGLE_STRIP, 0, 4);

        if (newBlend) {
            // glBlendFunc(cc.BLEND_SRC, cc.BLEND_DST);
        }
        // restore default GL state
        // glEnableClientState(GL_TEXTURE_COORD_ARRAY);
        // glEnable(GL_TEXTURE_2D);

    }
});

/** creates a CCLayer with color, width and height in Points */
cc.LayerColor.layerWithColorWidthHeight = function (color, width, height) {
    var layer = new cc.LayerColor();
    if (layer && layer.initWithColorWidthHeight(color, width, height)) {
        return layer;
    }
    return null;
};

/** creates a CCLayer with color. Width and height are the window size. */
cc.LayerColor.layerWithColor = function (color) {
    var layer = new cc.LayerColor();
    if (layer && layer.initWithColor(color)) {
        return layer;
    }
    return null;
};

cc.LayerColor.node = function () {
    var ret = new cc.LayerColor();
    if (ret && ret.init()) {
        return ret;
    }
    return null;
};

//
// CCLayerGradient
//
/** CCLayerGradient is a subclass of CCLayerColor that draws gradients across
 the background.

 All features from CCLayerColor are valid, plus the following new features:
 - direction
 - final color
 - interpolation mode

 Color is interpolated between the startColor and endColor along the given
 vector (starting at the origin, ending at the terminus).  If no vector is
 supplied, it defaults to (0, -1) -- a fade from top to bottom.

 If 'compressedInterpolation' is disabled, you will not see either the start or end color for
 non-cardinal vectors; a smooth gradient implying both end points will be still
 be drawn, however.

 If ' compressedInterpolation' is enabled (default mode) you will see both the start and end colors of the gradient.

 @since v0.99.5
 */
cc.LayerGradient = cc.LayerColor.extend({
    _startColor:new cc.Color3B(0, 0, 0),
    _endColor:new cc.Color3B(0, 0, 0),
    _startOpacity:null,
    _endOpacity:null,
    _alongVector:null,
    _compressedInterpolation:false,
    ctor:function () {
        this._startColor = new cc.Color3B(0, 0, 0);
        this._endColor = new cc.Color3B(0, 0, 0);
        this._super();
    },
    getStartColor:function () {
        return this._color;
    },
    setStartColor:function (color) {
        this.setColor(color);
    },
    setEndColor:function (color) {
        this._endColor = color;
        this._updateColor();
    },
    getEndColor:function () {
        return this._endColor;
    },
    setStartOpacity:function (o) {
        this._startOpacity = o;
        this._updateColor();
    },
    getStartOpacity:function () {
        return this._startOpacity;
    },
    setEndOpacity:function (o) {
        this._endOpacity = o;
        this._updateColor();
    },
    getEndOpacity:function () {
        return this._endOpacity;
    },
    setVector:function (Var) {
        this.alongVector = Var;
        this._updateColor();
    },
    getVector:function () {
        return this.alongVector;
    },
    getIsCompressedInterpolation:function () {
        return this._compressedInterpolation;
    },
    setIsCompressedInterpolation:function (compress) {
        this._compressedInterpolation = compress;
        this._updateColor();
    },
    initWithColor:function (start, end, v) {
        var argnum = arguments.length;
        if (argnum == 2) {
            /** Initializes the CCLayer with a gradient between start and end. */
            v = cc.ccp(0, -1);
        }

        /** Initializes the CCLayer with a gradient between start and end in the direction of v. */
        this._startColor.r = start.r;
        this._startColor.g = start.g;
        this._startColor.b = start.b;
        this._startOpacity = start.a;

        this._endColor.r = end.r;
        this._endColor.g = end.g;
        this._endColor.b = end.b;
        this._endOpacity = end.a;

        this.alongVector = v;

        this._compressedInterpolation = true;

        return this._super(cc.ccc4(start.r, start.g, start.b, 255));
    },

    _updateColor:function () {
        //todo need fixed for webGL
        this._super();
        /*
         this._squareColors[0].r = Math.round(this._startColor.r);
         this._squareColors[0].g = Math.round(this._startColor.g);
         this._squareColors[0].b = Math.round(this._startColor.b);
         this._squareColors[0].a = Math.round(this._startColor.a);

         this._squareColors[3].r = Math.round(this._endColor.r);
         this._squareColors[3].g = Math.round(this._endColor.g);
         this._squareColors[3].b = Math.round(this._endColor.b);
         this._squareColors[3].a = Math.round(this._endColor.a);
         return;
         */


        var h = cc.ccpLength(this.alongVector);
        if (h == 0)
            return;

        var c = Math.sqrt(2.0);
        var u = new cc.Point();
        u = cc.ccp(this.alongVector.x / h, this.alongVector.y / h);

        // Compressed Interpolation mode
        if (this._compressedInterpolation) {
            var h2 = 1 / ( Math.abs(u.x) + Math.abs(u.y) );
            u = cc.ccpMult(u, h2 * c);
        }

        var opacityf = this._opacity / 255.0;

        var S = new cc.Color4B(this._startColor.r, this._startColor.g, this._startColor.b, this._startOpacity * opacityf);

        var E = new cc.Color4B(this._endColor.r, this._endColor.g, this._endColor.b, this._endOpacity * opacityf);

        // (-1, -1)
        this._squareColors[0].r = parseInt((E.r + (S.r - E.r) * ((c + u.x + u.y) / (2.0 * c))));
        this._squareColors[0].g = parseInt((E.g + (S.g - E.g) * ((c + u.x + u.y) / (2.0 * c))));
        this._squareColors[0].b = parseInt((E.b + (S.b - E.b) * ((c + u.x + u.y) / (2.0 * c))));
        this._squareColors[0].a = parseInt((E.a + (S.a - E.a) * ((c + u.x + u.y) / (2.0 * c))));
        // (1, -1)
        this._squareColors[1].r = parseInt((E.r + (S.r - E.r) * ((c - u.x + u.y) / (2.0 * c))));
        this._squareColors[1].g = parseInt((E.g + (S.g - E.g) * ((c - u.x + u.y) / (2.0 * c))));
        this._squareColors[1].b = parseInt((E.b + (S.b - E.b) * ((c - u.x + u.y) / (2.0 * c))));
        this._squareColors[1].a = parseInt((E.a + (S.a - E.a) * ((c - u.x + u.y) / (2.0 * c))));
        // (-1, 1)
        this._squareColors[2].r = parseInt((E.r + (S.r - E.r) * ((c + u.x - u.y) / (2.0 * c))));
        this._squareColors[2].g = parseInt((E.g + (S.g - E.g) * ((c + u.x - u.y) / (2.0 * c))));
        this._squareColors[2].b = parseInt((E.b + (S.b - E.b) * ((c + u.x - u.y) / (2.0 * c))));
        this._squareColors[2].a = parseInt((E.a + (S.a - E.a) * ((c + u.x - u.y) / (2.0 * c))));
        // (1, 1)
        this._squareColors[3].r = parseInt((E.r + (S.r - E.r) * ((c - u.x - u.y) / (2.0 * c))));
        this._squareColors[3].g = parseInt((E.g + (S.g - E.g) * ((c - u.x - u.y) / (2.0 * c))));
        this._squareColors[3].b = parseInt((E.b + (S.b - E.b) * ((c - u.x - u.y) / (2.0 * c))));
        this._squareColors[3].a = parseInt((E.a + (S.a - E.a) * ((c - u.x - u.y) / (2.0 * c))));
    }
});


// cc.LayerGradient
//
cc.LayerGradient.layerWithColor = function (start, end, v) {
    var argnum = arguments.length;
    var layer = new cc.LayerGradient();
    switch (argnum) {
        case 2:
            /** Creates a full-screen CCLayer with a gradient between start and end. */
            if (layer && layer.initWithColor(start, end)) {
                return layer;
            }
            return null;
            break;
        case 3:
            /** Creates a full-screen CCLayer with a gradient between start and end in the direction of v. */
            if (layer && layer.initWithColor(start, end, v)) {
                return layer;
            }
            return null;
            break;
        default:
            throw "Argument must be non-nil ";
            break;
    }
};
cc.LayerGradient.node = function () {
    var ret = new cc.LayerGradient();
    if (ret && ret.init()) {
        return ret;
    }
    return null;
};

/** @brief CCMultipleLayer is a CCLayer with the ability to multiplex it's children.
 Features:
 - It supports one or more children
 - Only one children will be active a time
 */
/// MultiplexLayer
cc.LayerMultiplex = cc.Layer.extend({
    enabledLayer:0,
    layers:null,
    ctor:function () {
        this._super();
    },
    initWithLayer:function (layer) {
        this.layers = [];
        this.layers.push(layer);
        this.enabledLayer = 0;
        this.addChild(layer);
        return true;
    },
    initWithLayers:function (args) {
        this.layers = args;
        this.enabledLayer = 0;
        this.addChild(this.layers[this.enabledLayer]);
        return true;
    },
    /** switches to a certain layer indexed by n.
     * The current (old) layer will be removed from it's parent with 'cleanup:YES'.
     */
    switchTo:function (n) {
        cc.Assert(n < this.layers.length, "Invalid index in MultiplexLayer switchTo message");

        this.removeChild(this.layers[this.enabledLayer], true);

        this.enabledLayer = n;

        this.addChild(this.layers[n]);
    },
    /** release the current layer and switches to another layer indexed by n.
     The current (old) layer will be removed from it's parent with 'cleanup:YES'.
     */
    switchToAndReleaseMe:function (n) {
        cc.Assert(n < this.layers.count(), "Invalid index in MultiplexLayer switchTo message");

        this.removeChild(this.layers[this.enabledLayer], true);

        //[layers replaceObjectAtIndex:enabledLayer withObject:[NSNull null]];
        this.layers[this.enabledLayer] = null;

        this.enabledLayer = n;

        this.addChild(this.layers[n]);
    }
});
/** creates a CCLayerMultiplex with one or more layers using a variable argument list. */
cc.LayerMultiplex.layerWithLayers = function (/*Multiple Arguments*/) {
    var multiplexLayer = new cc.LayerMultiplex();
    if (multiplexLayer.initWithLayers(arguments)) {
        return multiplexLayer;
    }
    return null;
};
/**
 * lua script can not init with undetermined number of variables
 * so add these functinons to be used with lua.
 */
cc.LayerMultiplex.layerWithLayer = function (layer) {
    var multiplexLayer = new cc.LayerMultiplex();
    multiplexLayer.initWithLayer(layer);
    return multiplexLayer;
};
cc.LayerMultiplex.node = function () {
    var ret = new cc.LayerMultiplex();
    if (ret && ret.init()) {
        return ret;
    }
    return null;
};


cc.LazyLayer = cc.Node.extend({
    _layerCanvas:null,
    _layerContext:null,
    _isNeedUpdate:false,
    _canvasZOrder: -10,

    ctor:function(){
        this._super();
        this.setAnchorPoint(new cc.Point(0,0));
        //setup html
        this._setupHtml();
    },

    setLayerZOrder:function(zOrder){
        if(zOrder >= 0){
            throw "LazyLayer zOrder must Less than Zero.Because LazyLayer is a background Layer!";
        }
        this._canvasZOrder = zOrder;
        this._layerCanvas.style.zIndex = this._canvasZOrder;
    },

    getLayerZOrder:function(){
        return this._canvasZOrder;
    },

    _setupHtml:function(){
        var gameContainer = document.getElementById("Cocos2dGameContainer");
        if(!gameContainer){
            cc.setupHTML();
            gameContainer = document.getElementById("Cocos2dGameContainer");
        }

        this._layerCanvas = document.createElement("canvas");
        this._layerCanvas.width = cc.canvas.width;
        this._layerCanvas.height = cc.canvas.height;
        this._layerCanvas.id = "lazyCanvas" +  Date.now();
        this._layerCanvas.style.zIndex = this._canvasZOrder;
        this._layerCanvas.style.position = "absolute";
        this._layerCanvas.style.top = "0";
        this._layerCanvas.style.left = "0";
        this._layerContext = this._layerCanvas.getContext("2d");
        this._layerContext.fillStyle = "rgba(0,0,0,1)";
        this._layerContext.translate(0, this._layerCanvas.height);
        gameContainer.appendChild(this._layerCanvas);
        var selfPointer = this;
        window.addEventListener("resize", function (event) {
            selfPointer.adjustSizeForCanvas();
        });
    },

    adjustSizeForCanvas:function(){
        this._isNeedUpdate = true;
        this._layerCanvas.width = cc.canvas.width;
        this._layerCanvas.height = cc.canvas.height;
        var xScale = cc.canvas.width / cc.originalCanvasSize.width ;
        var yScale = cc.canvas.height / cc.originalCanvasSize.height;
        if (xScale > yScale) {
            xScale = yScale;
        }
        this._layerContext.translate(0, this._layerCanvas.height);
        this._layerContext.scale(xScale, xScale);
    },

    addChild:function(child, zOrder, tag){
        this._isNeedUpdate = true;
        this._super(child, zOrder, tag);
    },

    removeChild:function (child, cleanup) {
        this._isNeedUpdate = true;
        this._super(child, cleanup);
    },

    visit:function(){
        // quick return if not visible
        if (!this._isVisible) {
            return;
        }
        if(!this._isNeedUpdate){
            return;
        }

        this._isNeedUpdate = false;
        var context = this._layerContext;
        context.save();

        context.clearRect(0, 0, this._layerCanvas.width, -this._layerCanvas.height);

        if (this._grid && this._grid.isActive()) {
            this._grid.beforeDraw();
            this.transformAncestors();
        }

        //this.transform(context);
        if (this._children) {
            // draw children zOrder < 0
            for (var i = 0; i < this._children.length; i++) {
                var node = this._children[i];
                if (node && node._zOrder < 0) {
                    node.visit(context);
                }
            }
        }

        // draw children zOrder >= 0
        if (this._children) {
            for (var i = 0; i < this._children.length; i++) {
                var node = this._children[i];
                if (node && node._zOrder >= 0) {
                    node.visit(context);
                }
            }
        }

        if (this._grid && this._grid.isActive()) {
            this._grid.afterDraw(this);
        }
        context.restore();
    },

    _setNodeDirtyForCache:function () {
        this._isCacheDirty = true;
        this._isNeedUpdate = true;
    }
});
