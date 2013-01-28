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

/** Layer will receive all the touches at once The onTouchesXXX API will be called
 */
cc.TOUCH_ALL_AT_ONCE = 0;

/** Layer will receive only one touch at the time. The onTouchXXX API will be called */
cc.TOUCH_ONE_BY_ONE = 1;

/** cc.Layer is a subclass of cc.Node that implements the TouchEventsDelegate protocol.<br/>
 * All features from cc.Node are valid, plus the following new features:<br/>
 * It can receive iPhone Touches<br/>
 * It can receive Accelerometer input
 * @class
 * @extends cc.Node
 */
cc.Layer = cc.Node.extend(/** @lends cc.Layer# */{
    _isTouchEnabled:false,
    _isAccelerometerEnabled:false,
    _isKeyboardEnabled:false,
    _touchPriority:0,
    _touchMode:cc.TOUCH_ALL_AT_ONCE,
    _isMouseEnabled:false,
    _mousePriority:0,

    /**
     * Constructor
     */
    ctor:function () {
        this._super();

        //this._initLayer();
    },

    _initLayer:function () {
        this.setAnchorPoint(cc.p(0.5, 0.5));
        this._ignoreAnchorPointForPosition = true;

        var director = cc.Director.getInstance();
        this.setContentSize(director.getWinSize());
        this._isTouchEnabled = false;
        this._isAccelerometerEnabled = false;
        this._isMouseEnabled = false;
        this._touchMode = cc.TOUCH_ALL_AT_ONCE;
        this._touchPriority = 0;
    },

    /**
     *
     * @return {Boolean}
     */
    init:function () {
        /*var director = cc.Director.getInstance();
         if (!director) {
         return false;
         }
         this.setContentSize(director.getWinSize());
         this._isTouchEnabled = false;*/
        this._super();
        this._initLayer();
        return true;
    },

    /**
     * If isTouchEnabled, this method is called onEnter.
     */
    registerWithTouchDispatcher:function () {
        if (this._touchMode === cc.TOUCH_ALL_AT_ONCE)
            cc.Director.getInstance().getTouchDispatcher().addStandardDelegate(this, this._touchPriority);
        else
            cc.Director.getInstance().getTouchDispatcher().addTargetedDelegate(this, this._touchPriority, true);
    },

    isMouseEnabled:function () {
        return this._isMouseEnabled;
    },

    setMouseEnabled:function (enabled) {
        if (this._isMouseEnabled != enabled) {
            this._isMouseEnabled = enabled;
            if (this._running) {
                if (enabled)
                    cc.Director.getInstance().getMouseDispatcher().addMouseDelegate(this, this._mousePriority);
                else
                    cc.Director.getInstance().getMouseDispatcher().removeMouseDelegate(this);
            }
        }
    },

    setMousePriority:function (priority) {
        if (this._mousePriority != priority) {
            this._mousePriority = priority;
            // Update touch priority with handler
            if (this._isMouseEnabled) {
                this.setMouseEnabled(false);
                this.setMouseEnabled(true);
            }
        }
    },

    getMousePriority:function () {
        return this._mousePriority;
    },

    /**
     * whether or not it will receive Touch events.<br/>
     * You can enable / disable touch events with this property.<br/>
     * Only the touches of this node will be affected. This "method" is not propagated to it's children.<br/>
     * @return {Boolean}
     */
    isTouchEnabled:function () {
        return this._isTouchEnabled;
    },

    /**
     * Enable touch events
     * @param {Boolean} enabled
     */
    setTouchEnabled:function (enabled) {
        if (this._isTouchEnabled != enabled) {
            this._isTouchEnabled = enabled;

            if (this._running) {
                if (enabled) {
                    this.registerWithTouchDispatcher();
                } else {
                    // have problems?
                    cc.Director.getInstance().getTouchDispatcher().removeDelegate(this);
                }
            }
        }
    },

    /** returns the priority of the touch event handler
     * @return {Number}
     */
    getTouchPriority:function () {
        return this._touchPriority;
    },

    /** Sets the touch event handler priority. Default is 0.
     * @param {Number} priority
     */
    setTouchPriority:function (priority) {
        if (this._touchPriority != priority) {
            this._touchPriority = priority;
            // Update touch priority with handler
            if (this._isTouchEnabled) {
                this.setTouchEnabled(false);
                this.setTouchEnabled(true);
            }
        }
    },

    /** returns the touch mode.
     * @return {Number}
     */
    getTouchMode:function () {
        return this._touchMode;
    },

    /** Sets the touch mode.
     * @param {Number} mode
     */
    setTouchMode:function (mode) {
        if (this._touchMode != mode) {
            this._touchMode = mode;
            // update the mode with handler
            if (this._isTouchEnabled) {
                this.setTouchEnabled(false);
                this.setTouchEnabled(true);
            }
        }
    },

    /**
     * whether or not it will receive Accelerometer events<br/>
     * You can enable / disable accelerometer events with this property.
     * @return {Boolean}
     */
    isAccelerometerEnabled:function () {
        return this._isAccelerometerEnabled;
    },

    /**
     * isAccelerometerEnabled setter
     * @param enabled
     */
    setAccelerometerEnabled:function (enabled) {
        if (enabled != this._isAccelerometerEnabled) {
            this._isAccelerometerEnabled = enabled;

            if (this._running) {
                var director = cc.Director.getInstance();
                if (enabled) {
                    director.getAccelerometer().setDelegate(this);
                } else {
                    director.getAccelerometer().setDelegate(null);
                }
            }
        }
    },

    /**
     * whether or not it will receive keyboard events<br/>
     * You can enable / disable accelerometer events with this property.<br/>
     * it's new in cocos2d-x
     * @return {Boolean}
     */
    isKeyboardEnabled:function () {
        return this._isKeyboardEnabled;
    },

    /**
     * Enable Keyboard interaction
     * @param {Boolean} enabled
     */
    setKeyboardEnabled:function (enabled) {
        if (enabled != this._isKeyboardEnabled) {
            this._isKeyboardEnabled = enabled;
            if (this._running) {
                var director = cc.Director.getInstance();
                if (enabled) {
                    director.getKeyboardDispatcher().addDelegate(this);
                } else {
                    director.getKeyboardDispatcher().removeDelegate(this);
                }
            }
        }
    },

    /**
     * This is run when ever a layer just become visible
     */
    onEnter:function () {
        var director = cc.Director.getInstance();
        // register 'parent' nodes first
        // since events are propagated in reverse order
        if (this._isTouchEnabled) {
            this.registerWithTouchDispatcher();
        }

        // then iterate over all the children
        this._super();

        //TODO not supported
        // add this layer to concern the Accelerometer Sensor
/*        if (this._isAccelerometerEnabled){
           director.getAccelerometer().setDelegate(this);
        }*/


        // add this layer to concern the kaypad msg
        if (this._isKeyboardEnabled)
            director.getKeyboardDispatcher().addDelegate(this);

        if (this._isMouseEnabled)
            director.getMouseDispatcher().addMouseDelegate(this, this._mousePriority);
    },

    /**
     * @function
     */
    onExit:function () {
        var director = cc.Director.getInstance();
        if (this._isTouchEnabled) {
            director.getTouchDispatcher().removeDelegate(this);
        }

        // remove this layer from the delegates who concern Accelerometer Sensor
        //TODO not supported
/*        if (this._isAccelerometerEnabled) {
            director.getAccelerometer().setDelegate(null);
        }*/

        // remove this layer from the delegates who concern the kaypad msg
        if (this._isKeyboardEnabled) {
            director.getKeyboardDispatcher().removeDelegate(this);
        }

        if (this._isMouseEnabled)
            director.getMouseDispatcher().removeMouseDelegate(this);

        this._super();
    },

    /**
     * this is called when ever a layer is a child of a scene that just finished a transition
     */
    onEnterTransitionDidFinish:function () {
        //TODO not supported
        /*if (this._isAccelerometerEnabled) {
            cc.Director.getInstance().getAccelerometer().setDelegate(this);
        }*/
        this._super();
    },

    /**
     * default implements are used to call script callback if exist<br/>
     * you must override these touch functions if you wish to utilize them
     * @param {cc.Touch} touch
     * @param {event} event
     * @return {Boolean}
     */
    onTouchBegan:function (touch, event) {
        cc.Assert(false, "Layer#onTouchBegan override me");
        return true;
    },

    /**
     * callback when a touch event moved
     * @param {cc.Touch} touch
     * @param {event} event
     */
    onTouchMoved:function (touch, event) {
    },

    /**
     * callback when a touch event finished
     * @param {cc.Touch} touch
     * @param {event} event
     */
    onTouchEnded:function (touch, event) {
    },

    /**
     * @param {cc.Touch} touch
     * @param {event} event
     */
    onTouchCancelled:function (touch, event) {
    },

    /**
     * Touches is the same as Touch, except this one can handle multi-touch
     * @param {cc.Touch} touch
     * @param {event} event
     */
    onTouchesBegan:function (touch, event) {
    },

    /**
     * when a touch moved
     * @param {cc.Touch} touch
     * @param {event} event
     */
    onTouchesMoved:function (touch, event) {
    },

    /**
     * when a touch finished
     * @param {cc.Touch} touch
     * @param {event} event
     */
    onTouchesEnded:function (touch, event) {
    },

    /**
     * @param touch
     * @param event
     */
    onTouchesCancelled:function (touch, event) {
    },

    didAccelerate:function (pAccelerationValue) {
    },

    // ---------------------CCMouseEventDelegate interface------------------------------

    /**
     * <p>called when the "mouseDown" event is received. <br/>
     * Return YES to avoid propagating the event to other delegates.  </p>
     * @param event
     * @return {Boolean}
     */
    onMouseDown:function (event) {
        return false;
    },

    /**
     * <p>called when the "mouseDragged" event is received.         <br/>
     * Return YES to avoid propagating the event to other delegates.</p>
     * @param event
     * @return {Boolean}
     */
    onMouseDragged:function (event) {
        return false;
    },

    /**
     * <p> called when the "mouseMoved" event is received.            <br/>
     * Return YES to avoid propagating the event to other delegates.  </p>
     * @param event
     * @return {Boolean}
     */
    onMouseMoved:function (event) {
        return false;
    },

    /**
     * <p> called when the "mouseUp" event is received.               <br/>
     * Return YES to avoid propagating the event to other delegates.  </p>
     * @param event
     * @return {Boolean}
     */
    onMouseUp:function (event) {
        return false;
    },

    //right
    /**
     * <p> called when the "rightMouseDown" event is received.        <br/>
     * Return YES to avoid propagating the event to other delegates.  </p>
     * @param event
     * @return {Boolean}
     */
    onRightMouseDown:function (event) {
        return false;
    },

    /**
     * <p> called when the "rightMouseDragged" event is received.    <br/>
     * Return YES to avoid propagating the event to other delegates. </p>
     * @param event
     * @return {Boolean}
     */
    onRightMouseDragged:function (event) {
        return false;
    },

    /**
     * <p> called when the "rightMouseUp" event is received.          <br/>
     * Return YES to avoid propagating the event to other delegates.  </p>
     * @param event
     * @return {Boolean}
     */
    onRightMouseUp:function (event) {
        return false;
    },

    //other
    /**
     * <p>called when the "otherMouseDown" event is received.         <br/>
     * Return YES to avoid propagating the event to other delegates.  </p>
     * @param event
     * @return {Boolean}
     */
    onOtherMouseDown:function (event) {
        return false;
    },

    /**
     * <p> called when the "otherMouseDragged" event is received.     <br/>
     * Return YES to avoid propagating the event to other delegates.  </p>
     * @param event
     * @return {Boolean}
     */
    onOtherMouseDragged:function (event) {
        return false;
    },

    /**
     * <p> called when the "otherMouseUp" event is received.          <br/>
     * Return YES to avoid propagating the event to other delegates.  </p>
     * @param event
     * @return {Boolean}
     */
    onOtherMouseUp:function (event) {
        return false;
    },

    //scroll wheel
    /**
     * <p> called when the "scrollWheel" event is received.           <br/>
     * Return YES to avoid propagating the event to other delegates.  </p>
     * @param event
     * @return {Boolean}
     */
    onScrollWheel:function (event) {
        return false;
    },

    // enter / exit
    /**
     *  <p> called when the "mouseEntered" event is received.         <br/>
     *  Return YES to avoid propagating the event to other delegates. </p>
     * @param theEvent
     * @return {Boolean}
     */
    onMouseEntered:function (theEvent) {
        return false;
    },

    /**
     * <p> called when the "mouseExited" event is received.          <br/>
     * Return YES to avoid propagating the event to other delegates. </p>
     * @param theEvent
     * @return {Boolean}
     */
    onMouseExited:function (theEvent) {
        return false;
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
    var ret = new cc.Layer();
    if (ret && ret.init()) {
        return ret;
    }
    return null;
};


/**
 * CCLayerColor is a subclass of CCLayer that implements the CCRGBAProtocol protocol.<br/>
 *  All features from CCLayer are valid, plus the following new features:<br/>
 * <ul><li>opacity</li>
 * <li>RGB colors</li></ul>
 * @class
 * @extends cc.Layer
 */
cc.LayerColor = cc.Layer.extend(/** @lends cc.LayerColor# */{
    RGBAProtocol:true,
    _squareVertices:[],
    _squareColors:[],
    _opacity:0,
    _color:new cc.Color3B(255, 255, 255),
    _blendFunc:new cc.BlendFunc(cc.BLEND_SRC, cc.BLEND_DST),
    _layerColorStr:null,

    /**
     * Constructor
     */
    ctor:function () {
        this._squareVertices = [new cc.Vertex2F(0, 0), new cc.Vertex2F(0, 0), new cc.Vertex2F(0, 0), new cc.Vertex2F(0, 0)];
        this._squareColors = [new cc.Color4F(0, 0, 0, 1), new cc.Color4F(0, 0, 0, 1), new cc.Color4F(0, 0, 0, 1), new cc.Color4F(0, 0, 0, 1)];
        this._color = new cc.Color4B(0, 0, 0, 0);
        this._opacity = 255;
        this._super();
        this._layerColorStr = this._getLayerColorString();
    },

    _getLayerColorString:function () {
        return "rgba(" + (0 | this._color.r) + "," + (0 | this._color.g) + "," + (0 | this._color.b) + "," + (this.getOpacity() / 255).toFixed(5) + ")";
    },

    /**
     * opacity getter
     * @return {Number}
     */
    getOpacity:function () {
        return this._opacity;
    },

    /**
     * opacity setter
     * @param {Number} Var a number between 0 and 255, 0 is totally transparent
     */
    setOpacity:function (Var) {
        this._opacity = Var;
        this._updateColor();
        this.setNodeDirty();
    },

    /**
     * color getter
     * @return {cc.Color3B}
     */
    getColor:function () {
        return this._color;
    },

    /**
     * color setter
     * @param {cc.Color3B} Var
     */
    setColor:function (Var) {
        this._color = Var;
        this._updateColor();
        this.setNodeDirty();
    },

    /**
     * blendFunc getter
     * @return {cc.BlendFunc}
     */
    getBlendFunc:function () {
        return this._blendFunc;
    },

    _isLighterMode:false,
    /**
     * blendFunc setter
     * @param {Number} src
     * @param {Number} dst
     */
    setBlendFunc:function (src, dst) {
        if (arguments.length == 1) {
            this._blendFunc = src;
        } else {
            this._blendFunc = {src:src, dst:dst};
        }
        this._isLighterMode = (this._blendFunc && (this._blendFunc.src == 1) && (this._blendFunc.dst == 771));
    },

    /**
     * @param {cc.Color4B} color
     * @param {Number} width
     * @param {Number} height
     * @return {Boolean}
     */
    init:function (color, width, height) {
        this._initLayer();

        var winSize = cc.Director.getInstance().getWinSize();

        color = color || new cc.Color4B(0, 0, 0, 255);
        width = width || winSize.width;
        height = height || winSize.height;

        this._blendFunc.src = cc.BLEND_SRC;
        this._blendFunc.dst = cc.BLEND_DST;

        this._color = new cc.Color3B(color.r, color.g, color.b);
        this._opacity = color.a;

        for (var i = 0; i < this._squareVertices.length; i++) {
            this._squareVertices[i].x = 0.0;
            this._squareVertices[i].y = 0.0;
        }

        this.setContentSize(cc.size(width, height));

        this._updateColor();
        //this.setShaderProgram(cc.ShaderCache.getInstance().programForKey(kCCShader_PositionColor));

        return true;
    },

    /**
     * override contentSize
     * @param {cc.Size} size
     */
    setContentSize:function (size) {
        this._squareVertices[1].x = size.width;
        this._squareVertices[2].y = size.height;
        this._squareVertices[3].x = size.width;
        this._squareVertices[3].y = size.height;
        this._super(size);
    },

    /**
     * change width and height in Points
     * @param {Number} w width
     * @param {Number} h height
     */
    changeWidthAndHeight:function (w, h) {
        this.setContentSize(cc.size(w, h));
    },

    /**
     * change width in Points
     * @param {Number} w width
     */
    changeWidth:function (w) {
        this.setContentSize(cc.size(w, this._contentSize.height));
    },

    /**
     * change height in Points
     * @param {Number} h height
     */
    changeHeight:function (h) {
        this.setContentSize(cc.size(this._contentSize.width, h));
    },

    _updateColor:function () {
        for (var i = 0; i < 4; i++) {
            this._squareColors[i].r = this._color.r / 255;
            this._squareColors[i].g = this._color.g / 255;
            this._squareColors[i].b = this._color.b / 255;
            this._squareColors[i].a = this._opacity / 255;
        }
    },

    /**
     * set OpacityModifyRGB of cc.LayerColor
     * @param {Boolean}  value
     */
    setOpacityModifyRGB:function (value) {
    },

    /**
     * is OpacityModifyRGB
     * @return {Boolean}
     */
    isOpacityModifyRGB:function () {
        return false;
    },

    /**
     * renders the layer
     * @param {CanvasContext|Null} ctx
     */
    draw:function (ctx) {
        var context = ctx || cc.renderContext;

        var tWidth = this.getContentSize().width;
        var tHeight = this.getContentSize().height;
        var apip = this.getAnchorPointInPoints();

        context.fillStyle = "rgba(" + (0 | this._color.r) + "," + (0 | this._color.g) + "," + (0 | this._color.b) + "," + this.getOpacity() / 255 + ")";
        context.fillRect(-apip.x, apip.y, tWidth, -tHeight);

        cc.INCREMENT_GL_DRAWS(1);
    },

    _drawForWebGL:function (ctx) {
        /*cc.NODE_DRAW_SETUP();
         ccGLEnableVertexAttribs( kCCVertexAttribFlag_Position | kCCVertexAttribFlag_Color );

         //
         // Attributes
         //
         glVertexAttribPointer(kCCVertexAttrib_Position, 2, GL_FLOAT, GL_FALSE, 0, m_pSquareVertices);
         glVertexAttribPointer(kCCVertexAttrib_Color, 4, GL_FLOAT, GL_FALSE, 0, m_pSquareColors);
         ccGLBlendFunc( m_tBlendFunc.src, m_tBlendFunc.dst );
         glDrawArrays(GL_TRIANGLE_STRIP, 0, 4);   */
    }
});

/**
 * creates a cc.Layer with color, width and height in Points
 * @param {cc.Color4B} color
 * @param {Number|Null} width
 * @param {Number|Null} height
 * @return {cc.LayerColor}
 * @example
 * // Example
 * //Create a yellow color layer as background
 * var yellowBackground = cc.LayerColor.create(cc.c4b(255,255,0,255));
 * //If you didnt pass in width and height, it defaults to the same size as the canvas
 *
 * //create a yellow box, 200 by 200 in size
 * var yellowBox = cc.LayerColor.create(cc.c3b(255,255,0,255), 200, 200);
 */
cc.LayerColor.create = function (color, width, height) {
    var ret = new cc.LayerColor();
    switch (arguments.length) {
        case 0:
            ret.init();
            break;
        case 1:
            ret.init(color);
            break;
        case 3:
            ret.init(color, width, height);
            break;
        default :
            ret.init();
            break;
    }
    return ret;
};


/**
 * CCLayerGradient is a subclass of cc.LayerColor that draws gradients across<br/>
 * the background.<br/>
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
 * If ' compressedInterpolation' is enabled (default mode) you will see both the start and end colors of the gradient.
 * @class
 * @extends cc.LayerColor
 */
cc.LayerGradient = cc.LayerColor.extend(/** @lends cc.LayerGradient# */{
    _startColor:null,
    _endColor:null,
    _startOpacity:null,
    _endOpacity:null,
    _alongVector:null,
    _compressedInterpolation:false,

    _gradientStartPoint:null,
    _gradientEndPoint:null,

    /**
     * Constructor
     * @function
     */
    ctor:function () {
        this._super();

        this._color = new cc.Color3B(0, 0, 0);
        this._startColor = new cc.Color3B(0, 0, 0);
        this._endColor = new cc.Color3B(0, 0, 0);
        this._alongVector = cc.p(0, -1);
        this._startOpacity = 255;
        this._endOpacity = 255;

        this._gradientStartPoint = cc.p(0, 0);
        this._gradientEndPoint = cc.p(0, 0);
    },

    /**
     * get the starting color
     * @return {cc.Color3B}
     */
    getStartColor:function () {
        return this._color;
    },

    /**
     * set the starting color
     * @param {cc.Color3B} color
     * @example
     * // Example
     * myGradientLayer.setStartColor(cc.c3b(255,0,0));
     * //set the starting gradient to red
     */
    setStartColor:function (color) {
        this.setColor(color);
    },

    /**
     * set the end gradient color
     * @param {cc.Color3B} color
     * @example
     * // Example
     * myGradientLayer.setEndColor(cc.c3b(255,0,0));
     * //set the ending gradient to red
     */
    setEndColor:function (color) {
        this._endColor = color;
        this._updateColor();
    },

    /**
     * get the end color
     * @return {cc.Color3B}
     */
    getEndColor:function () {
        return this._endColor;
    },

    /**
     * set starting gradient opacity
     * @param {Number} o from 0 to 255, 0 is transparent
     */
    setStartOpacity:function (o) {
        this._startOpacity = o;
        this._updateColor();
    },

    /**
     * get the starting gradient opacity
     * @return {Number}
     */
    getStartOpacity:function () {
        return this._startOpacity;
    },

    /**
     * set the end gradient opacity
     * @param {Number} o
     */
    setEndOpacity:function (o) {
        this._endOpacity = o;
        this._updateColor();
    },

    /**
     * get the end gradient opacity
     * @return {Number}
     */
    getEndOpacity:function () {
        return this._endOpacity;
    },

    /**
     * set vector
     * @param {cc.Point} Var
     */
    setVector:function (Var) {
        this._alongVector = Var;
        this._updateColor();
    },

    /**
     * @return {cc.Point}
     */
    getVector:function () {
        return this._alongVector;
    },

    /** is Compressed Interpolation
     * @return {Boolean}
     */
    isCompressedInterpolation:function () {
        return this._compressedInterpolation;
    },

    /**
     * @param {Boolean} compress
     */
    setCompressedInterpolation:function (compress) {
        this._compressedInterpolation = compress;
        this._updateColor();
    },

    /**
     * @param {cc.Color3B} start starting color
     * @param {cc.Color3B} end
     * @param {cc.Point|Null} v
     * @return {Boolean}
     */
    init:function (start, end, v) {
        var argnum = arguments.length;

        if (argnum == 0)
            return this._super();

        if (argnum == 2) {
            // Initializes the CCLayer with a gradient between start and end.
            v = cc.p(0, -1);
        }

        // Initializes the CCLayer with a gradient between start and end in the direction of v.
        this._startColor.r = start.r;
        this._startColor.g = start.g;
        this._startColor.b = start.b;
        this._startOpacity = start.a;

        this._endColor.r = end.r;
        this._endColor.g = end.g;
        this._endColor.b = end.b;
        this._endOpacity = end.a;

        this._alongVector = v;

        this._compressedInterpolation = true;

        this._super(cc.c4b(start.r, start.g, start.b, 255));
        return true;
    },

    _updateColor:function () {
        if (cc.renderContextType === cc.CANVAS) {
            var tWidth = this.getContentSize().width / 2;
            var tHeight = this.getContentSize().height / 2;
            var apip = this.getAnchorPointInPoints();
            var offWidth = tWidth - apip.x;
            var offHeight = tHeight - apip.y;

            this._gradientStartPoint = cc.p(tWidth * -this._alongVector.x + offWidth, tHeight * this._alongVector.y - offHeight);
            this._gradientEndPoint = cc.p(tWidth * this._alongVector.x + offWidth, tHeight * -this._alongVector.y - offHeight);
        } else {
            //todo need fixed for webGL
            this._super();

            var h = cc.pLength(this._alongVector);
            if (h == 0)
                return;

            var c = Math.sqrt(2.0);
            var u = cc.p(this._alongVector.x / h, this._alongVector.y / h);

            // Compressed Interpolation mode
            if (this._compressedInterpolation) {
                var h2 = 1 / ( Math.abs(u.x) + Math.abs(u.y) );
                u = cc.pMult(u, h2 * c);
            }

            var opacityf = this._opacity / 255.0;

            var S = new cc.Color4F(this._color.r / 255, this._color.g / 255, this._color.b / 255, (this._startOpacity * opacityf) / 255);

            var E = new cc.Color4F(this._endColor.r / 255, this._endColor.g / 255, this._endColor.b / 255, (this._endOpacity * opacityf) / 255);

            // (-1, -1)
            this._squareColors[0].r = ((E.r + (S.r - E.r) * ((c + u.x + u.y) / (2.0 * c))));
            this._squareColors[0].g = ((E.g + (S.g - E.g) * ((c + u.x + u.y) / (2.0 * c))));
            this._squareColors[0].b = ((E.b + (S.b - E.b) * ((c + u.x + u.y) / (2.0 * c))));
            this._squareColors[0].a = ((E.a + (S.a - E.a) * ((c + u.x + u.y) / (2.0 * c))));
            // (1, -1)
            this._squareColors[1].r = ((E.r + (S.r - E.r) * ((c - u.x + u.y) / (2.0 * c))));
            this._squareColors[1].g = ((E.g + (S.g - E.g) * ((c - u.x + u.y) / (2.0 * c))));
            this._squareColors[1].b = ((E.b + (S.b - E.b) * ((c - u.x + u.y) / (2.0 * c))));
            this._squareColors[1].a = ((E.a + (S.a - E.a) * ((c - u.x + u.y) / (2.0 * c))));
            // (-1, 1)
            this._squareColors[2].r = ((E.r + (S.r - E.r) * ((c + u.x - u.y) / (2.0 * c))));
            this._squareColors[2].g = ((E.g + (S.g - E.g) * ((c + u.x - u.y) / (2.0 * c))));
            this._squareColors[2].b = ((E.b + (S.b - E.b) * ((c + u.x - u.y) / (2.0 * c))));
            this._squareColors[2].a = ((E.a + (S.a - E.a) * ((c + u.x - u.y) / (2.0 * c))));
            // (1, 1)
            this._squareColors[3].r = ((E.r + (S.r - E.r) * ((c - u.x - u.y) / (2.0 * c))));
            this._squareColors[3].g = ((E.g + (S.g - E.g) * ((c - u.x - u.y) / (2.0 * c))));
            this._squareColors[3].b = ((E.b + (S.b - E.b) * ((c - u.x - u.y) / (2.0 * c))));
            this._squareColors[3].a = ((E.a + (S.a - E.a) * ((c - u.x - u.y) / (2.0 * c))));
        }
    },

    draw:function (ctx) {
        var context = ctx || cc.renderContext;
        if (cc.renderContextType == cc.CANVAS) {
            if (this._isLighterMode)
                context.globalCompositeOperation = 'lighter';

            context.save();
            var tWidth = this.getContentSize().width;
            var tHeight = this.getContentSize().height;
            var apip = this.getAnchorPointInPoints();
            var tGradient = context.createLinearGradient(this._gradientStartPoint.x, this._gradientStartPoint.y,
                this._gradientEndPoint.x, this._gradientEndPoint.y);
            tGradient.addColorStop(0, "rgba(" + Math.round(this._color.r) + "," + Math.round(this._color.g) + ","
                + Math.round(this._color.b) + "," + (this._startOpacity / 255).toFixed(4) + ")");
            tGradient.addColorStop(1, "rgba(" + Math.round(this._endColor.r) + "," + Math.round(this._endColor.g) + ","
                + Math.round(this._endColor.b) + "," + (this._endOpacity / 255).toFixed(4) + ")");
            context.fillStyle = tGradient;
            context.fillRect(-apip.x, apip.y, tWidth, -tHeight);

            if (this._rotation != 0)
                context.rotate(this._rotationRadians);
            context.restore();
        }
    }
});

/**
 * creates a gradient layer
 * @param {cc.Color3B} start starting color
 * @param {cc.Color3B} end ending color
 * @param {cc.Point|Null} v
 * @return {cc.LayerGradient}
 */
cc.LayerGradient.create = function (start, end, v) {
    var layer = new cc.LayerGradient();
    switch (arguments.length) {
        case 2:
            /** Creates a full-screen CCLayer with a gradient between start and end. */
            if (layer && layer.init(start, end)) {
                return layer;
            }
            break;
        case 3:
            /** Creates a full-screen CCLayer with a gradient between start and end in the direction of v. */
            if (layer && layer.init(start, end, v)) {
                return layer;
            }
            break;
        case 0:
            if (layer && layer.init()) {
                return layer;
            }
            break;
        default:
            throw "Arguments error ";
            break;
    }
    return null;
};


/**
 * CCMultipleLayer is a CCLayer with the ability to multiplex it's children.<br/>
 * Features:<br/>
 *  <ul><li>- It supports one or more children</li>
 *  <li>- Only one children will be active a time</li></ul>
 *  @class
 *  @extends cc.Layer
 */
cc.LayerMultiplex = cc.Layer.extend(/** @lends cc.LayerMultiplex# */{
    _enabledLayer:0,
    _layers:null,

    /**
     * Constructor
     */
    ctor:function () {
        this._super();
    },

    /**
     * @param {cc.Layer} layer
     * @deprecated merged with initWithLayers
     * @return {Boolean}
     */
    initWithLayer:function (layer) {
        this._layers = [];
        this._layers.push(layer);
        this._enabledLayer = 0;
        this.addChild(layer);
        return true;
    },

    /**
     * @param {Array} args an array of cc.Layer
     * @return {Boolean}
     */
    initWithLayers:function (args) {
        this._layers = args;
        this._enabledLayer = 0;
        this.addChild(this._layers[this._enabledLayer]);
        return true;
    },

    /**
     * switches to a certain layer indexed by n.<br/>
     * The current (old) layer will be removed from it's parent with 'cleanup:YES'.
     * @param {Number} n the layer index to switch to
     */
    switchTo:function (n) {
        cc.Assert(n < this._layers.length, "Invalid index in MultiplexLayer switchTo message");

        this.removeChild(this._layers[this._enabledLayer], true);

        this._enabledLayer = n;

        this.addChild(this._layers[n]);
    },

    /** release the current layer and switches to another layer indexed by n.<br/>
     * The current (old) layer will be removed from it's parent with 'cleanup:YES'.
     * @param {Number} n the layer index to switch to
     */
    switchToAndReleaseMe:function (n) {
        cc.Assert(n < this._layers.count(), "Invalid index in MultiplexLayer switchTo message");

        this.removeChild(this._layers[this._enabledLayer], true);

        //[layers replaceObjectAtIndex:_enabledLayer withObject:[NSNull null]];
        this._layers[this._enabledLayer] = null;

        this._enabledLayer = n;

        this.addChild(this._layers[n]);
    },

    /**
     * @param {cc.Layer} layer
     */
    addLayer:function (layer) {
        cc.Assert(this._layers, "cc.Layer addLayer");
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
    var multiplexLayer = new cc.LayerMultiplex();
    if (multiplexLayer.initWithLayers(arguments)) {
        return multiplexLayer;
    }
    return null;
};


/**
 * a layer that does not get redraw if not needed, and its always gets placed on the bottom layer
 * @class
 * @extends cc.Node
 * @example
 * // Example
 * var veryLazy = new cc.LazyLayer();
 * veryLazy.addChild(mySprite);
 */
cc.LazyLayer = cc.Node.extend(/** @lends cc.LazyLayer# */{
    _layerCanvas:null,
    _layerContext:null,
    _isNeedUpdate:false,
    _canvasZOrder:-10,
    _layerId:"",

    /**
     * Constructor
     */
    ctor:function () {
        this._super();
        this.setAnchorPoint(cc.p(0, 0));
        //setup html
        this._setupHtml();
    },

    /**
     * @param {Number} zOrder
     */
    setLayerZOrder:function (zOrder) {
        if (zOrder >= 0) {
            throw "LazyLayer zOrder must Less than Zero.Because LazyLayer is a background Layer!";
        }
        this._canvasZOrder = zOrder;
        this._layerCanvas.style.zIndex = this._canvasZOrder;
    },

    /**
     *
     * @return {Number}
     */
    getLayerZOrder:function () {
        return this._canvasZOrder;
    },

    _setupHtml:function () {
        this._layerCanvas = document.createElement("canvas");
        this._layerCanvas.width = cc.canvas.width;
        this._layerCanvas.height = cc.canvas.height;
        this._layerId = "lazyCanvas" + Date.now();
        this._layerCanvas.id = this._layerId;
        this._layerCanvas.style.zIndex = this._canvasZOrder;
        this._layerCanvas.style.position = "absolute";
        this._layerCanvas.style.top = "0";
        this._layerCanvas.style.left = "0";
        this._layerContext = this._layerCanvas.getContext("2d");
        this._layerContext.fillStyle = "rgba(0,0,0,1)";
        this._layerContext.translate(0, this._layerCanvas.height);
        cc.container.appendChild(this._layerCanvas);
        var selfPointer = this;
        window.addEventListener("resize", function (event) {
            selfPointer.adjustSizeForCanvas();
        });
    },

    /**
     * make it the same size as canvas, in case canvas resized
     */
    adjustSizeForCanvas:function () {
        this._isNeedUpdate = true;
        this._layerCanvas.width = cc.canvas.width;
        this._layerCanvas.height = cc.canvas.height;
        var xScale = cc.canvas.width / cc.originalCanvasSize.width;
        var yScale = cc.canvas.height / cc.originalCanvasSize.height;
        if (xScale > yScale) {
            xScale = yScale;
        }
        this._layerContext.translate(0, this._layerCanvas.height);
        this._layerContext.scale(xScale, xScale);
    },

    /**
     * return lazylayer's canvas
     * @return {HTMLCanvasElement}
     */
    getLayerCanvas:function () {
        return this._layerCanvas;
    },

    /**
     * same as cc.Node
     * @param {cc.Node} child
     * @param {Number|Null} zOrder
     * @param {Number|Null} tag
     */
    addChild:function (child, zOrder, tag) {
        this._isNeedUpdate = true;
        this._super(child, zOrder, tag);
    },

    /**
     * @param {cc.Node} child
     * @param {Boolean} cleanup
     */
    removeChild:function (child, cleanup) {
        this._isNeedUpdate = true;
        this._super(child, cleanup);
    },

    /**
     * stuff gets drawn in here
     */
    visit:function () {
        // quick return if not visible
        if (!this._visible) {
            return;
        }
        if (!this._isNeedUpdate) {
            return;
        }

        this._isNeedUpdate = false;
        var context = this._layerContext;
        context.save();
        context.clearRect(0, 0, this._layerCanvas.width, -this._layerCanvas.height);

        if (this._children && this._children.length > 0) {
            this.sortAllChildren();
            // draw children zOrder < 0
            for (var i = 0; i < this._children.length; i++) {
                this._children[i].visit(context);
            }
        }

        context.restore();
    },

    /**
     * override onExit of cc.Node
     * @override
     */
    onExit:function () {
        this._super();

        //clear canvas element from parent element
        if (this._layerCanvas.parentNode) {
            this._layerCanvas.parentNode.removeChild(this._layerCanvas);
        }
    },

    _setNodeDirtyForCache:function () {
        this._cacheDirty = true;
        this._isNeedUpdate = true;
    }
});
