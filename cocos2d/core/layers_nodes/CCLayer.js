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
	// This is only useful in mode TOUCH_ONE_BY_ONE
	_swallowTouch:true,

    ctor: function () {
        cc.Node.prototype.ctor.call(this);
        this._isTouchEnabled = false;
        this._isAccelerometerEnabled = false;
        this._isKeyboardEnabled = false;
        this._touchPriority = 0;
        this._touchMode = cc.TOUCH_ALL_AT_ONCE;
        this._isMouseEnabled = false;
        this._mousePriority = 0;
    },

    _initLayer:function () {
        this.setAnchorPoint(0.5, 0.5);
        this._ignoreAnchorPointForPosition = true;

        var director = cc.Director.getInstance();
        this.setContentSize(director.getWinSize());
    },

    /**
     *
     * @return {Boolean}
     */
    init:function () {
        cc.Node.prototype.init.call(this);
        this._initLayer();
        return true;
    },

    /**
     * If isTouchEnabled, this method is called onEnter.
     */
    registerWithTouchDispatcher:function () {
        if (this._touchMode === cc.TOUCH_ALL_AT_ONCE)
            cc.registerStandardDelegate(this,this._touchPriority);
        else
            cc.registerTargetedDelegate(this._touchPriority, this._swallowTouch, this);
    },

    isMouseEnabled:function () {
        return this._isMouseEnabled;
    },

    setMouseEnabled:function (enabled) {
        if(!cc.MouseDispatcher)
            throw "cc.MouseDispatcher is undefined, maybe it has been removed from js loading list.";

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
        if(!cc.MouseDispatcher)
            throw "cc.MouseDispatcher is undefined, maybe it has been removed from js loading list.";

        if (this._mousePriority !== priority) {
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
     * @param {Boolean} [swallow=true] if the event listener will swallow touch after been triggered
     */
    setTouchEnabled:function (enabled, swallow) {
        if (this._isTouchEnabled !== enabled) {
            this._isTouchEnabled = enabled;
	        this._swallowTouch = (swallow === false ? false : true);

            if (this._running) {
                if (enabled) {
                    this.registerWithTouchDispatcher();
                } else {
                    // have problems?
                    cc.unregisterTouchDelegate(this);
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
        if (this._touchPriority !== priority) {
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
        if (this._touchMode !== mode) {
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
     * @param {Boolean} enabled
     */
    setAccelerometerEnabled:function (enabled) {
        if(!cc.Accelerometer)
            throw "cc.Accelerometer is undefined, maybe it has been removed from js loading list.";
        if (enabled !== this._isAccelerometerEnabled) {
            this._isAccelerometerEnabled = enabled;
            if (this._running) {
                var director = cc.Director.getInstance();
                if (enabled)
                    director.getAccelerometer().setDelegate(this);
                else
                    director.getAccelerometer().setDelegate(null);
            }
        }
    },

    /**
     * accelerometerInterval setter
     * @param {Number} interval
     */
    setAccelerometerInterval:function (interval) {
        if (this._isAccelerometerEnabled && cc.Accelerometer)
            cc.Director.getInstance().getAccelerometer().setAccelerometerInterval(interval);
    },

    onAccelerometer:function (accelerationValue) {
        cc.log("onAccelerometer event should be handled.")
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
        if(!cc.KeyboardDispatcher)
            throw "cc.KeyboardDispatcher is undefined, maybe it has been removed from js loading list.";

        if (enabled !== this._isKeyboardEnabled) {
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
        if (this._isTouchEnabled)
            this.registerWithTouchDispatcher();

        // then iterate over all the children
        cc.Node.prototype.onEnter.call(this);

        // add this layer to concern the Accelerometer Sensor
        if (this._isAccelerometerEnabled && cc.Accelerometer)
            director.getAccelerometer().setDelegate(this);

        // add this layer to concern the kaypad msg
        if (this._isKeyboardEnabled && cc.KeyboardDispatcher)
            director.getKeyboardDispatcher().addDelegate(this);

        if (this._isMouseEnabled && cc.MouseDispatcher)
            director.getMouseDispatcher().addMouseDelegate(this, this._mousePriority);
    },

    /**
     * @function
     */
    onExit:function () {
        var director = cc.Director.getInstance();
        if (this._isTouchEnabled)
            cc.unregisterTouchDelegate(this);

        // remove this layer from the delegates who concern Accelerometer Sensor
        if (this._isAccelerometerEnabled && cc.Accelerometer)
            director.getAccelerometer().setDelegate(null);

        // remove this layer from the delegates who concern the kaypad msg
        if (this._isKeyboardEnabled && cc.KeyboardDispatcher)
            director.getKeyboardDispatcher().removeDelegate(this);

        if (this._isMouseEnabled && cc.MouseDispatcher)
            director.getMouseDispatcher().removeMouseDelegate(this);

        cc.Node.prototype.onExit.call(this);
    },

    /**
     * this is called when ever a layer is a child of a scene that just finished a transition
     */
    onEnterTransitionDidFinish:function () {
        if (this._isAccelerometerEnabled && cc.Accelerometer)
            cc.Director.getInstance().getAccelerometer().setDelegate(this);
        cc.Node.prototype.onEnterTransitionDidFinish.call(this);
    },

    // ---------------------CCTouchDelegate interface------------------------------

    /**
     * default implements are used to call script callback if exist<br/>
     * you must override these touch functions if you wish to utilize them
     * @param {cc.Touch} touch
     * @param {event} event
     * @return {Boolean}
     */
    onTouchBegan:function (touch, event) {
        cc.log("onTouchBegan event should be handled.");
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
     * Touches is the same as onTouchBegan, except this one can handle multi-touch
     * @param {array} touches
     * @param {event} event
     */
    onTouchesBegan:function (touches, event) {
    },

    /**
     * @param {array} touches
     * @param {event} event
     */
    onTouchesMoved:function (touches, event) {
    },

    /**
     * @param {array} touches
     * @param {event} event
     */
    onTouchesEnded:function (touches, event) {
    },

    /**
     * @param {array} touches
     * @param event
     */
    onTouchesCancelled:function (touches, event) {
    },

    // ---------------------CCMouseEventDelegate interface------------------------------

    /**
     * <p>called when the "mouseDown" event is received. <br/>
     * Return YES to avoid propagating the event to other delegates.  </p>
     * @param {cc.Mouse} mouse
     * @return {Boolean}
     */
    onMouseDown:function (mouse) {
        return false;
    },

    /**
     * <p>called when the "mouseDragged" event is received.         <br/>
     * Return YES to avoid propagating the event to other delegates.</p>
     * @param {cc.Mouse} mouse
     * @return {Boolean}
     */
    onMouseDragged:function (mouse) {
        return false;
    },

    /**
     * <p> called when the "mouseMoved" event is received.            <br/>
     * Return YES to avoid propagating the event to other delegates.  </p>
     * @param {cc.Mouse} mouse
     * @return {Boolean}
     */
    onMouseMoved:function (mouse) {
        return false;
    },

    /**
     * <p> called when the "mouseUp" event is received.               <br/>
     * Return YES to avoid propagating the event to other delegates.  </p>
     * @param {cc.Mouse} mouse
     * @return {Boolean}
     */
    onMouseUp:function (mouse) {
        return false;
    },

    //right
    /**
     * <p> called when the "rightMouseDown" event is received.        <br/>
     * Return YES to avoid propagating the event to other delegates.  </p>
     * @param {cc.Mouse} mouse
     * @return {Boolean}
     */
    onRightMouseDown:function (mouse) {
        return false;
    },

    /**
     * <p> called when the "rightMouseDragged" event is received.    <br/>
     * Return YES to avoid propagating the event to other delegates. </p>
     * @param {cc.Mouse} mouse
     * @return {Boolean}
     */
    onRightMouseDragged:function (mouse) {
        return false;
    },

    /**
     * <p> called when the "rightMouseUp" event is received.          <br/>
     * Return YES to avoid propagating the event to other delegates.  </p>
     * @param {cc.Mouse} mouse
     * @return {Boolean}
     */
    onRightMouseUp:function (mouse) {
        return false;
    },

    //other
    /**
     * <p>called when the "otherMouseDown" event is received.         <br/>
     * Return YES to avoid propagating the event to other delegates.  </p>
     * @param {cc.Mouse} mouse
     * @return {Boolean}
     */
    onOtherMouseDown:function (mouse) {
        return false;
    },

    /**
     * <p> called when the "otherMouseDragged" event is received.     <br/>
     * Return YES to avoid propagating the event to other delegates.  </p>
     * @param {cc.Mouse} mouse
     * @return {Boolean}
     */
    onOtherMouseDragged:function (mouse) {
        return false;
    },

    /**
     * <p> called when the "otherMouseUp" event is received.          <br/>
     * Return YES to avoid propagating the event to other delegates.  </p>
     * @param {cc.Mouse} mouse
     * @return {Boolean}
     */
    onOtherMouseUp:function (mouse) {
        return false;
    },

    //scroll wheel
    /**
     * <p> called when the "scrollWheel" event is received.           <br/>
     * Return YES to avoid propagating the event to other delegates.  </p>
     * @param {cc.Mouse} mouse
     * @return {Boolean}
     */
    onScrollWheel:function (mouse) {
        return false;
    },

    // enter / exit
    /**
     *  <p> called when the "mouseEntered" event is received.         <br/>
     *  Return YES to avoid propagating the event to other delegates. </p>
     * @param {cc.Mouse} mouse
     * @return {Boolean}
     */
    onMouseEntered:function (mouse) {
        return false;
    },

    /**
     * <p> called when the "mouseExited" event is received.          <br/>
     * Return YES to avoid propagating the event to other delegates. </p>
     * @param {cc.Mouse} mouse
     * @return {Boolean}
     */
    onMouseExited:function (mouse) {
        return false;
    },

    // ---------------------CCKeyboardDelegate interface------------------------------

    /**
     * Call back when a key is pressed down
     * @param {Number} keyCode
     * @example
     * // example
     * if(keyCode == cc.KEY.w){}
     */
    onKeyDown:function (keyCode) {
    },

    /**
     * Call back when a key is released
     * @param {Number} keyCode
     * @example
     * // example
     * if(keyCode == cc.KEY.w){}
     */
    onKeyUp:function (keyCode) {
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
    if (ret && ret.init())
        return ret;
    return null;
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
 */
cc.LayerRGBA = cc.Layer.extend(/** @lends cc.LayerRGBA# */{
    RGBAProtocol:true,
    _displayedOpacity: 0,
    _realOpacity: 0,
    _displayedColor: null,
    _realColor: null,
    _cascadeOpacityEnabled: false,
    _cascadeColorEnabled: false,

    ctor: function () {
        cc.Layer.prototype.ctor.call(this);
        this.RGBAProtocol = true;
        this._displayedOpacity = 255;
        this._realOpacity = 255;
        this._displayedColor = cc.white();
        this._realColor = cc.white();
        this._cascadeOpacityEnabled = false;
        this._cascadeColorEnabled = false;
    },

    init: function () {
        if(cc.Layer.prototype.init.call(this)){
            this.setCascadeOpacityEnabled(false);
            this.setCascadeColorEnabled(false);
            return true;
        }
        return false;
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
        this._displayedOpacity = this._realOpacity = opacity;

        var parentOpacity = 255, locParent = this._parent;
        if (locParent && locParent.RGBAProtocol && locParent.isCascadeOpacityEnabled())
            parentOpacity = locParent.getDisplayedOpacity();
        this.updateDisplayedOpacity(parentOpacity);
    },

    /**
     * Update displayed opacity of Layer
     * @param {Number} parentOpacity
     */
    updateDisplayedOpacity: function (parentOpacity) {
        this._displayedOpacity = 0 | (this._realOpacity * parentOpacity / 255.0);

        if (this._cascadeOpacityEnabled) {
            var locChildren = this._children;
            for (var i = 0; i < locChildren.length; i++) {
                var selItem = locChildren[i];
                if (selItem && selItem.RGBAProtocol)
                    selItem.updateDisplayedOpacity(this._displayedOpacity);
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
        if(this._cascadeOpacityEnabled === cascadeOpacityEnabled)
            return;

        this._cascadeOpacityEnabled = cascadeOpacityEnabled;
        if(cascadeOpacityEnabled)
            this._enableCascadeOpacity();
        else
            this._disableCascadeOpacity();
    },

    _enableCascadeOpacity:function(){
        var parentOpacity = 255, locParent = this._parent;
        if (locParent && locParent.RGBAProtocol && locParent.isCascadeOpacityEnabled())
            parentOpacity = locParent.getDisplayedOpacity();
        this.updateDisplayedOpacity(parentOpacity);
    },

    _disableCascadeOpacity:function(){
        this._displayedOpacity = this._realOpacity;
        var selChildren = this._children;
        for(var i = 0; i< selChildren.length;i++){
            var item = selChildren[i];
            if(item && item.RGBAProtocol)
                item.updateDisplayedOpacity(255);
        }
    },

    /**
     * Get the color of Layer
     * @returns {cc.Color3B}
     */
    getColor: function () {
        var locRealColor = this._realColor;
        return cc.c3b(locRealColor.r, locRealColor.g, locRealColor.b);
    },

    /**
     * Get the displayed color of Layer
     * @returns {cc.Color3B}
     */
    getDisplayedColor: function () {
        var locDisplayedColor = this._displayedColor;
        return cc.c3b(locDisplayedColor.r, locDisplayedColor.g, locDisplayedColor.b);
    },

    /**
     * Set the color of Layer
     * @param {cc.Color3B} color
     */
    setColor: function (color) {
        var locDisplayed = this._displayedColor, locRealColor = this._realColor;
        locDisplayed.r = locRealColor.r = color.r;
        locDisplayed.g = locRealColor.g = color.g;
        locDisplayed.b = locRealColor.b = color.b;

        var parentColor, locParent = this._parent;
        if (locParent && locParent.RGBAProtocol && locParent.isCascadeColorEnabled())
            parentColor = locParent.getDisplayedColor();
        else
            parentColor = cc.white();
        this.updateDisplayedColor(parentColor);
    },

    /**
     * update the displayed color of Node
     * @param {cc.Color3B} parentColor
     */
    updateDisplayedColor: function (parentColor) {
        var locDisplayedColor = this._displayedColor, locRealColor = this._realColor;
        locDisplayedColor.r = 0 | (locRealColor.r * parentColor.r / 255.0);
        locDisplayedColor.g = 0 | (locRealColor.g * parentColor.g / 255.0);
        locDisplayedColor.b = 0 | (locRealColor.b * parentColor.b / 255.0);

        if (this._cascadeColorEnabled) {
            var locChildren = this._children;
            for (var i = 0; i < locChildren.length; i++) {
                var selItem = locChildren[i];
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
        if(this._cascadeColorEnabled === cascadeColorEnabled)
            return;
        this._cascadeColorEnabled = cascadeColorEnabled;
        if(this._cascadeColorEnabled)
            this._enableCascadeColor();
        else
            this._disableCascadeColor();
    },

    _enableCascadeColor: function(){
        var parentColor , locParent =  this._parent;
        if (locParent && locParent.RGBAProtocol &&  locParent.isCascadeColorEnabled())
            parentColor = locParent.getDisplayedColor();
        else
            parentColor = cc.white();
        this.updateDisplayedColor(parentColor);
    },

    _disableCascadeColor: function(){
        var locDisplayedColor = this._displayedColor, locRealColor = this._realColor;
        locDisplayedColor.r = locRealColor.r;
        locDisplayedColor.g = locRealColor.g;
        locDisplayedColor.b = locRealColor.b;

        var selChildren = this._children, whiteColor = cc.white();
        for(var i = 0; i< selChildren.length;i++){
            var item = selChildren[i];
            if(item && item.RGBAProtocol)
                item.updateDisplayedColor(whiteColor);
        }
    },

    /**
     * add a child to layer
     * @overried
     * @param {cc.Node} child  A child node
     * @param {Number} [zOrder=]  Z order for drawing priority. Please refer to setZOrder(int)
     * @param {Number} [tag=]  A integer to identify the node easily. Please refer to setTag(int)
     */
    addChild:function(child, zOrder, tag){
        cc.Node.prototype.addChild.call(this, child, zOrder, tag);

        if(this._cascadeColorEnabled)
            this._enableCascadeColor();
        if(this._cascadeOpacityEnabled)
            this._enableCascadeOpacity();
    },

    setOpacityModifyRGB: function (bValue) {
    },

    isOpacityModifyRGB: function () {
        return false;
    }
});

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
    _blendFunc:null,

    /**
     * blendFunc getter
     * @return {cc.BlendFunc}
     */
    getBlendFunc:function () {
        return this._blendFunc;
    },

    /**
     * change width and height in Points
     * @param {Number} w width
     * @param {Number} h height
     */
    changeWidthAndHeight:function (w, h) {
        this.setContentSize(w, h);
    },

    /**
     * change width in Points
     * @param {Number} w width
     */
    changeWidth:function (w) {
        this.setContentSize(w, this._contentSize._height);
    },

    /**
     * change height in Points
     * @param {Number} h height
     */
    changeHeight:function (h) {
        this.setContentSize(this._contentSize._width, h);
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

    setColor:function(color){
        cc.LayerRGBA.prototype.setColor.call(this, color);
        this._updateColor();
    },

    setOpacity:function(opacity){
        cc.LayerRGBA.prototype.setOpacity.call(this, opacity);
        this._updateColor();
    },

    _isLighterMode:false,
    _squareVertices:null,
    _squareColors:null,
    _verticesFloat32Buffer:null,
    _colorsUint8Buffer:null,
    _squareVerticesAB:null,
    _squareColorsAB:null,

    _ctorForCanvas: function () {
        cc.LayerRGBA.prototype.ctor.call(this);
        this._blendFunc = new cc.BlendFunc(cc.BLEND_SRC, cc.BLEND_DST);
    },

    _ctorForWebGL: function () {
        cc.LayerRGBA.prototype.ctor.call(this);
        this._blendFunc = new cc.BlendFunc(cc.BLEND_SRC, cc.BLEND_DST);

        this._squareVerticesAB = new ArrayBuffer(32);
        this._squareColorsAB = new ArrayBuffer(64);

        var locSquareVerticesAB = this._squareVerticesAB, locSquareColorsAB = this._squareColorsAB;
        var locVertex2FLen = cc.Vertex2F.BYTES_PER_ELEMENT, locColor4FLen = cc.Color4F.BYTES_PER_ELEMENT;
        this._squareVertices = [new cc.Vertex2F(0, 0, locSquareVerticesAB, 0),
            new cc.Vertex2F(0, 0, locSquareVerticesAB, locVertex2FLen),
            new cc.Vertex2F(0, 0, locSquareVerticesAB, locVertex2FLen * 2),
            new cc.Vertex2F(0, 0, locSquareVerticesAB, locVertex2FLen * 3)];
        this._squareColors = [new cc.Color4F(0, 0, 0, 1, locSquareColorsAB, 0),
            new cc.Color4F(0, 0, 0, 1, locSquareColorsAB, locColor4FLen),
            new cc.Color4F(0, 0, 0, 1, locSquareColorsAB, locColor4FLen * 2),
            new cc.Color4F(0, 0, 0, 1, locSquareColorsAB, locColor4FLen * 3)];
        this._verticesFloat32Buffer = cc.renderContext.createBuffer();
        this._colorsUint8Buffer = cc.renderContext.createBuffer();
    },

    /**
     * blendFunc setter
     * @param {Number} src
     * @param {Number} dst
     */
    setBlendFunc:function (src, dst) {
        if (dst === undefined)
            this._blendFunc = src;
        else
            this._blendFunc = {src:src, dst:dst};
        if(cc.renderContextType === cc.CANVAS)
            this._isLighterMode = (this._blendFunc && (this._blendFunc.src == 1) && (this._blendFunc.dst == 771));
    },

    /**
     * @param {cc.Color4B} [color=]
     * @param {Number} [width=]
     * @param {Number} [height=]
     * @return {Boolean}
     */
    init:function (color, width, height) {
        if(!cc.Layer.prototype.init.call(this))
            return false;

        if(cc.renderContextType !== cc.CANVAS)
            this.setShaderProgram(cc.ShaderCache.getInstance().programForKey(cc.SHADER_POSITION_COLOR));

        var winSize = cc.Director.getInstance().getWinSize();
        color = color || new cc.Color4B(0, 0, 0, 255);
        width = width || winSize.width;
        height = height || winSize.height;

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

        this.setContentSize(width, height);
        this._updateColor();
        return true;
    },

    /**
     * Sets the untransformed size of the LayerColor.
     * @override
     * @param {cc.Size|Number} size The untransformed size of the LayerColor or The untransformed size's width of the LayerColor.
     * @param {Number} [height] The untransformed size's height of the LayerColor.
     */
    setContentSize:null,

    _setContentSizeForWebGL:function (size, height) {
        var locSquareVertices = this._squareVertices;
        if (height === undefined) {
	        locSquareVertices[1].x = size.width;
	        locSquareVertices[2].y = size.height;
	        locSquareVertices[3].x = size.width;
	        locSquareVertices[3].y = size.height;
        } else {
	        locSquareVertices[1].x = size;
	        locSquareVertices[2].y = height;
	        locSquareVertices[3].x = size;
	        locSquareVertices[3].y = height;
        }
	    this._bindLayerVerticesBufferData();
	    cc.Layer.prototype.setContentSize.call(this, size, height);
    },

    _updateColor:null,

    _updateColorForCanvas:function () {
    },

    _updateColorForWebGL:function () {
        var locDisplayedColor = this._displayedColor;
        var locDisplayedOpacity = this._displayedOpacity, locSquareColors = this._squareColors;
        for (var i = 0; i < 4; i++) {
            locSquareColors[i].r = locDisplayedColor.r / 255;
            locSquareColors[i].g = locDisplayedColor.g / 255;
            locSquareColors[i].b = locDisplayedColor.b / 255;
            locSquareColors[i].a = locDisplayedOpacity / 255;
        }
        this._bindLayerColorsBufferData();
    },

    updateDisplayedColor:function(parentColor){
        cc.LayerRGBA.prototype.updateDisplayedColor.call(this, parentColor);
        this._updateColor();
    },

    updateDisplayedOpacity: function(parentOpacity){
        cc.LayerRGBA.prototype.updateDisplayedOpacity.call(this, parentOpacity);
        this._updateColor();
    },

    _bindLayerVerticesBufferData:function () {
        var glContext = cc.renderContext;
        glContext.bindBuffer(glContext.ARRAY_BUFFER, this._verticesFloat32Buffer);
        glContext.bufferData(glContext.ARRAY_BUFFER, this._squareVerticesAB , glContext.STATIC_DRAW);
    },

    _bindLayerColorsBufferData:function () {
        var glContext = cc.renderContext;
        glContext.bindBuffer(glContext.ARRAY_BUFFER, this._colorsUint8Buffer);
        glContext.bufferData(glContext.ARRAY_BUFFER, this._squareColorsAB, glContext.STATIC_DRAW);
    },

    /**
     * renders the layer
     * @param {CanvasRenderingContext2D|Null} ctx
     */
    draw:null,

    _drawForCanvas:function (ctx) {
        var context = ctx || cc.renderContext;

        var locContentSize = this.getContentSize(), locEGLViewer = cc.EGLView.getInstance();

        var locDisplayedColor = this._displayedColor;

        context.fillStyle = "rgba(" + (0 | locDisplayedColor.r) + "," + (0 | locDisplayedColor.g) + ","
            + (0 | locDisplayedColor.b) + "," + this._displayedOpacity / 255 + ")";
        context.fillRect(0, 0, locContentSize.width * locEGLViewer.getScaleX(), -locContentSize.height * locEGLViewer.getScaleY());

        cc.g_NumberOfDraws++;
    },

    _drawForWebGL:function (ctx) {
        var context = ctx || cc.renderContext;

        cc.NODE_DRAW_SETUP(this);
        cc.glEnableVertexAttribs(cc.VERTEX_ATTRIB_FLAG_POSITION | cc.VERTEX_ATTRIB_FLAG_COLOR);

        //
        // Attributes
        //
        context.bindBuffer(context.ARRAY_BUFFER, this._verticesFloat32Buffer);
        context.vertexAttribPointer(cc.VERTEX_ATTRIB_POSITION, 2, context.FLOAT, false, 0, 0);

        context.bindBuffer(context.ARRAY_BUFFER, this._colorsUint8Buffer);
        context.vertexAttribPointer(cc.VERTEX_ATTRIB_COLOR, 4, context.FLOAT, false, 0, 0);

        cc.glBlendFunc(this._blendFunc.src, this._blendFunc.dst);
        context.drawArrays(context.TRIANGLE_STRIP, 0, 4);
    }
});

if(cc.Browser.supportWebGL){
    cc.LayerColor.prototype.ctor = cc.LayerColor.prototype._ctorForWebGL;
    cc.LayerColor.prototype.setContentSize = cc.LayerColor.prototype._setContentSizeForWebGL;
    cc.LayerColor.prototype._updateColor = cc.LayerColor.prototype._updateColorForWebGL;
    cc.LayerColor.prototype.draw = cc.LayerColor.prototype._drawForWebGL;
} else {
    cc.LayerColor.prototype.ctor = cc.LayerColor.prototype._ctorForCanvas;
    cc.LayerColor.prototype.setContentSize = cc.LayerRGBA.prototype.setContentSize;
    cc.LayerColor.prototype._updateColor = cc.LayerColor.prototype._updateColorForCanvas;
    cc.LayerColor.prototype.draw = cc.LayerColor.prototype._drawForCanvas;
}


/**
 * creates a cc.Layer with color, width and height in Points
 * @param {cc.Color4B} color
 * @param {Number|Null} [width=]
 * @param {Number|Null} [height=]
 * @return {cc.LayerColor}
 * @example
 * // Example
 * //Create a yellow color layer as background
 * var yellowBackground = cc.LayerColor.create(cc.c4b(255,255,0,255));
 * //If you didnt pass in width and height, it defaults to the same size as the canvas
 *
 * //create a yellow box, 200 by 200 in size
 * var yellowBox = cc.LayerColor.create(cc.c4b(255,255,0,255), 200, 200);
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
        cc.LayerColor.prototype.ctor.call(this);

        this._startColor = new cc.Color3B(0, 0, 0);
        this._endColor = new cc.Color3B(0, 0, 0);
        this._alongVector = cc.p(0, -1);
        this._startOpacity = 255;
        this._endOpacity = 255;
        this._gradientStartPoint = cc.p(0, 0);
        this._gradientEndPoint = cc.p(0, 0);
    },

    /**
     * Sets the untransformed size of the LayerGradient.
     * @override
     * @param {cc.Size|Number} size The untransformed size of the LayerGradient or The untransformed size's width of the LayerGradient.
     * @param {Number} [height] The untransformed size's height of the LayerGradient.
     */
    setContentSize:function(size, height){
	    cc.LayerColor.prototype.setContentSize.call(this,size, height);
        this._updateColor();
    },

    /**
     * get the starting color
     * @return {cc.Color3B}
     */
    getStartColor:function () {
        return this._realColor;
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
        this._alongVector.x = Var.x;
        this._alongVector.y = Var.y;
        this._updateColor();
    },

    /**
     * @return {cc.Point}
     */
    getVector:function () {
        return cc.p(this._alongVector.x, this._alongVector.y);
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
     * @param {cc.Color4B} start starting color
     * @param {cc.Color4B} end
     * @param {cc.Point|Null} v
     * @return {Boolean}
     */
    init:function (start, end, v) {
        start = start || cc.c4(0,0,0,255);
        end = end || cc.c4(0,0,0,255);
        v = v || cc.p(0, -1);

        // Initializes the CCLayer with a gradient between start and end in the direction of v.
        var locStartColor = this._startColor, locEndColor = this._endColor;
        locStartColor.r = start.r;
        locStartColor.g = start.g;
        locStartColor.b = start.b;
        this._startOpacity = start.a;

        locEndColor.r = end.r;
        locEndColor.g = end.g;
        locEndColor.b = end.b;
        this._endOpacity = end.a;

        this._alongVector = v;
        this._compressedInterpolation = true;

        cc.LayerColor.prototype.init.call(this,cc.c4b(start.r, start.g, start.b, 255));
        return true;
    },

    draw:function (ctx) {
        if (cc.renderContextType === cc.WEBGL){
            cc.LayerColor.prototype.draw.call(this, ctx);
            return;
        }

        var context = ctx || cc.renderContext;
        if (this._isLighterMode)
            context.globalCompositeOperation = 'lighter';

        context.save();
        var locEGLViewer = cc.EGLView.getInstance(), opacityf = this._displayedOpacity / 255.0;
        var tWidth = this.getContentSize().width * locEGLViewer.getScaleX();
        var tHeight = this.getContentSize().height * locEGLViewer.getScaleY();
        var tGradient = context.createLinearGradient(this._gradientStartPoint.x, this._gradientStartPoint.y,
            this._gradientEndPoint.x, this._gradientEndPoint.y);
        var locDisplayedColor = this._displayedColor;
        var locEndColor = this._endColor;
        tGradient.addColorStop(0, "rgba(" + Math.round(locDisplayedColor.r) + "," + Math.round(locDisplayedColor.g) + ","
            + Math.round(locDisplayedColor.b) + "," + (opacityf * (this._startOpacity / 255)).toFixed(4) + ")");
        tGradient.addColorStop(1, "rgba(" + Math.round(locEndColor.r) + "," + Math.round(locEndColor.g) + ","
            + Math.round(locEndColor.b) + "," + (opacityf * (this._endOpacity / 255)).toFixed(4) + ")");
        context.fillStyle = tGradient;
        context.fillRect(0, 0, tWidth, -tHeight);

        if (this._rotation != 0)
            context.rotate(this._rotationRadians);
        context.restore();
    },

    _updateColor:function () {
        var locAlongVector = this._alongVector;
        if (cc.renderContextType === cc.CANVAS) {
            var tWidth = this.getContentSize().width * 0.5;
            var tHeight = this.getContentSize().height * 0.5;

            this._gradientStartPoint.x = tWidth * (-locAlongVector.x) + tWidth;
            this._gradientStartPoint.y = tHeight * locAlongVector.y - tHeight;
            this._gradientEndPoint.x = tWidth * locAlongVector.x + tWidth;
            this._gradientEndPoint.y = tHeight * (-locAlongVector.y) - tHeight;
        } else {
            var h = cc.pLength(locAlongVector);
            if (h === 0)
                return;

            var c = Math.sqrt(2.0);
            var u = cc.p(locAlongVector.x / h, locAlongVector.y / h);

            // Compressed Interpolation mode
            if (this._compressedInterpolation) {
                var h2 = 1 / ( Math.abs(u.x) + Math.abs(u.y) );
                u = cc.pMult(u, h2 * c);
            }

            var opacityf = this._displayedOpacity / 255.0;
            var locDisplayedColor = this._displayedColor, locEndColor = this._endColor;
            var S = { r: locDisplayedColor.r / 255, g: locDisplayedColor.g / 255, b: locDisplayedColor.b / 255, a: (this._startOpacity * opacityf) / 255};
            var E = {r: locEndColor.r / 255, g: locEndColor.g / 255, b: locEndColor.b / 255, a: (this._endOpacity * opacityf) / 255};

            // (-1, -1)
            var locSquareColors = this._squareColors;
            var locSquareColor0 = locSquareColors[0], locSquareColor1 = locSquareColors[1], locSquareColor2 = locSquareColors[2],locSquareColor3 = locSquareColors[3];
            locSquareColor0.r = ((E.r + (S.r - E.r) * ((c + u.x + u.y) / (2.0 * c))));
            locSquareColor0.g = ((E.g + (S.g - E.g) * ((c + u.x + u.y) / (2.0 * c))));
            locSquareColor0.b = ((E.b + (S.b - E.b) * ((c + u.x + u.y) / (2.0 * c))));
            locSquareColor0.a = ((E.a + (S.a - E.a) * ((c + u.x + u.y) / (2.0 * c))));
            // (1, -1)
            locSquareColor1.r = ((E.r + (S.r - E.r) * ((c - u.x + u.y) / (2.0 * c))));
            locSquareColor1.g = ((E.g + (S.g - E.g) * ((c - u.x + u.y) / (2.0 * c))));
            locSquareColor1.b = ((E.b + (S.b - E.b) * ((c - u.x + u.y) / (2.0 * c))));
            locSquareColor1.a = ((E.a + (S.a - E.a) * ((c - u.x + u.y) / (2.0 * c))));
            // (-1, 1)
            locSquareColor2.r = ((E.r + (S.r - E.r) * ((c + u.x - u.y) / (2.0 * c))));
            locSquareColor2.g = ((E.g + (S.g - E.g) * ((c + u.x - u.y) / (2.0 * c))));
            locSquareColor2.b = ((E.b + (S.b - E.b) * ((c + u.x - u.y) / (2.0 * c))));
            locSquareColor2.a = ((E.a + (S.a - E.a) * ((c + u.x - u.y) / (2.0 * c))));
            // (1, 1)
            locSquareColor3.r = ((E.r + (S.r - E.r) * ((c - u.x - u.y) / (2.0 * c))));
            locSquareColor3.g = ((E.g + (S.g - E.g) * ((c - u.x - u.y) / (2.0 * c))));
            locSquareColor3.b = ((E.b + (S.b - E.b) * ((c - u.x - u.y) / (2.0 * c))));
            locSquareColor3.a = ((E.a + (S.a - E.a) * ((c - u.x - u.y) / (2.0 * c))));

            this._bindLayerColorsBufferData();
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
            if (layer && layer.init(start, end))
                return layer;
            break;
        case 3:
            /** Creates a full-screen CCLayer with a gradient between start and end in the direction of v. */
            if (layer && layer.init(start, end, v))
                return layer;
            break;
        case 0:
            if (layer && layer.init())
                return layer;
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
        if(n >= this._layers.length){
            cc.log("cc.LayerMultiplex.switchTo():Invalid index in MultiplexLayer switchTo message");
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
    switchToAndReleaseMe:function (n) {
        if(n >= this._layers.length){
            cc.log("cc.LayerMultiplex.switchToAndReleaseMe():Invalid index in MultiplexLayer switchTo message");
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
    addLayer:function (layer) {
        if(!layer){
            cc.log("cc.Layer.addLayer(): layer should be non-null");
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
    if((arguments.length > 0) && (arguments[arguments.length-1] == null))
        cc.log("parameters should not be ending with null in Javascript");
    var multiplexLayer = new cc.LayerMultiplex();
    if (multiplexLayer.initWithLayers(arguments)) {
        return multiplexLayer;
    }
    return null;
};

