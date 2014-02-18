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

/**
 * Default Node tag
 * @constant
 * @type Number
 */
cc.NODE_TAG_INVALID = -1;
/**
 * Node on enter
 * @constant
 */
cc.NODE_ON_ENTER = null;
/**
 * Node on exit
 * @constant
 */
cc.NODE_ON_EXIT = null;

/**
 *  XXX: Yes, nodes might have a sort problem once every 15 days if the game runs at 60 FPS and each frame sprites are reordered.
 * @type Number
 */
cc.s_globalOrderOfArrival = 1;

/** <p>cc.Node is the main element. Anything thats gets drawn or contains things that get drawn is a cc.Node.<br/>
 The most popular cc.Nodes are: cc.Scene, cc.Layer, cc.Sprite, cc.Menu.<br/></p>

 <p>The main features of a cc.Node are: <br/>
 - They can contain other cc.Node nodes (addChild, getChildByTag, removeChild, etc) <br/>
 - They can schedule periodic callback (schedule, unschedule, etc) <br/>
 - They can execute actions (runAction, stopAction, etc) <br/></p>

 <p>Some cc.Node nodes provide extra functionality for them or their children.</p>

 <p>Subclassing a cc.Node usually means (one/all) of: <br/>
 - overriding init to initialize resources and schedule callbacks  <br/>
 - create callbacks to handle the advancement of time <br/>
 - overriding draw to render the node   <br/></p>

 <p>Features of cc.Node: <br/>
 - position  <br/>
 - scale (x, y) <br/>
 - rotation (in degrees, clockwise) <br/>
 - anchor point<br/>
 - size <br/>
 - visible<br/>
 - z-order <br/>
 - openGL z position <br/></P>

 <p> Default values: <br/>
 - rotation: 0 <br/>
 - position: (x=0,y=0) <br/>
 - scale: (x=1,y=1) <br/>
 - contentSize: (x=0,y=0)<br/>
 - anchorPoint: (x=0,y=0)<br/></p>

 <p> Limitations:<br/>
 - A cc.Node is a "void" object. It doesn't have a texture <br/></P>

 <p>Order in transformations with grid disabled <br/>
 -# The node will be translated (position)  <br/>
 -# The node will be rotated (rotation)<br/>
 -# The node will be scaled (scale)  <br/>

 <p>Order in transformations with grid enabled<br/>
 -# The node will be translated (position)<br/>
 -# The node will be rotated (rotation) <br/>
 -# The node will be scaled (scale) <br/>
 -# The grid will capture the screen <br/>
 -# The node will be moved according to the camera values (camera) <br/>
 -# The grid will render the captured screen <br/></P>
 * @class
 * @extends cc.Class
 * @example
 * // example
 * cc.Sprite = cc.Node.extend({});
 * cc.Sprite.initWithImage = function(){
 * };
 */
cc.Node = cc.Class.extend(/** @lends cc.Node# */{
    _zOrder:0,
    _vertexZ:0.0,

    _rotationX:0,
    _rotationY:0.0,
    _scaleX:1.0,
    _scaleY:1.0,
    _position:null,
    _skewX:0.0,
    _skewY:0.0,
    // children (lazy allocs),
    _children:null,
    // lazy alloc,
    _visible:true,
    _anchorPoint:null,
    _anchorPointInPoints:null,
    _contentSize:null,
    _running:false,
    _parent:null,
    // "whole screen" objects. like Scenes and Layers, should set _ignoreAnchorPointForPosition to true
    _ignoreAnchorPointForPosition:false,
    _tag:cc.NODE_TAG_INVALID,
    // userData is always inited as nil
    _userData:null,
    _userObject:null,
    _transformDirty:true,
    _inverseDirty:true,
    _cacheDirty:true,
    _transformGLDirty:null,
    _transform:null,
    _inverse:null,

    //since 2.0 api
    _reorderChildDirty:false,
    _shaderProgram:null,
    _orderOfArrival:0,

    _actionManager:null,
    _scheduler:null,

    _initializedNode:false,
    _additionalTransformDirty:false,
    _additionalTransform:null,
    _componentContainer:null,
    _isTransitionFinished:false,

    _rotationRadiansX:0,
    _rotationRadiansY:0,

    _initNode:function () {
        this._anchorPoint = cc._pConst(0, 0);
        this._anchorPointInPoints = cc._pConst(0, 0);
        this._contentSize = cc._sizeConst(0, 0);
        this._position = cc._pConst(0, 0);
        this._children = [];
        this._transform = {a:1, b:0, c:0, d:1, tx:0, ty:0};

        var director = cc.Director.getInstance();
        this._actionManager = director.getActionManager();
        this._scheduler = director.getScheduler();
        this._initializedNode = true;
        this._additionalTransform = cc.AffineTransformMakeIdentity();
        if(cc.ComponentContainer){
            this._componentContainer = new cc.ComponentContainer(this);
        }
    },

    /**
     * Initializes the instance of cc.Node
     * @returns {boolean} Whether the initialization was successful.
     */
    init:function () {
        if (this._initializedNode === false)
            this._initNode();
        return true;
    },

    /**
     * @param {Array} array
     * @param {cc.Node.StateCallbackType} callbackType
     * @private
     */
    _arrayMakeObjectsPerformSelector:function (array, callbackType) {
        if (!array || array.length === 0)
            return;

        var i, len = array.length,node;
        var nodeCallbackType = cc.Node.StateCallbackType;
        switch (callbackType) {
            case nodeCallbackType.onEnter:
                for (i = 0; i < len; i++) {
                    node = array[i];
                    if (node)
                        node.onEnter();
                }
                break;
            case nodeCallbackType.onExit:
                for (i = 0; i < len; i++) {
                    node = array[i];
                    if (node)
                        node.onExit();
                }
                break;
            case nodeCallbackType.onEnterTransitionDidFinish:
                for (i = 0; i < len; i++) {
                    node = array[i];
                    if (node)
                        node.onEnterTransitionDidFinish();
                }
                break;
            case nodeCallbackType.cleanup:
                for (i = 0; i < len; i++) {
                    node = array[i];
                    if (node)
                        node.cleanup();
                }
                break;
            case nodeCallbackType.updateTransform:
                for (i = 0; i < len; i++) {
                    node = array[i];
                    if (node)
                        node.updateTransform();
                }
                break;
            case nodeCallbackType.onExitTransitionDidStart:
                for (i = 0; i < len; i++) {
                    node = array[i];
                    if (node)
                        node.onExitTransitionDidStart();
                }
                break;
            case nodeCallbackType.sortAllChildren:
                for (i = 0; i < len; i++) {
                    node = array[i];
                    if (node)
                        node.sortAllChildren();
                }
                break;
            default :
                throw "Unknown callback function";
                break;
        }
    },

    /**
     * set the dirty node
     */
    setNodeDirty:null,

    _setNodeDirtyForCanvas:function () {
        this._setNodeDirtyForCache();
        if(this._transformDirty === false)
            this._transformDirty = this._inverseDirty = true;
    },

    _setNodeDirtyForWebGL:function () {
        if(this._transformDirty === false)
            this._transformDirty = this._inverseDirty = true;
    },

    /**
     *  <p>get the skew degrees in X </br>
     *  The X skew angle of the node in degrees.  <br/>
     *  This angle describes the shear distortion in the X direction.<br/>
     *  Thus, it is the angle between the Y axis and the left edge of the shape </br>
     *  The default skewX angle is 0. Positive values distort the node in a CW direction.</br>
     *  </p>
     * @return {Number} The X skew angle of the node in degrees.
     */
    getSkewX:function () {
        return this._skewX;
    },

    /**
     * <p>
     *     Changes the X skew angle of the node in degrees.                                                    <br/>
     *                                                                                                         <br/>
     *      This angle describes the shear distortion in the X direction.                                      <br/>
     *      Thus, it is the angle between the Y axis and the left edge of the shape                            <br/>
     *      The default skewX angle is 0. Positive values distort the node in a CW direction.
     * </p>
     * @param {Number} newSkewX The X skew angle of the node in degrees.
     */
    setSkewX:function (newSkewX) {
        this._skewX = newSkewX;
        this.setNodeDirty();
    },

    /**
     * <p>get the skew degrees in Y               <br/>
     * The Y skew angle of the node in degrees.                            <br/>
     * This angle describes the shear distortion in the Y direction.       <br/>
     * Thus, it is the angle between the X axis and the bottom edge of the shape       <br/>
     * The default skewY angle is 0. Positive values distort the node in a CCW direction.    <br/>
     * </p>
     * @return {Number} The Y skew angle of the node in degrees.
     */
    getSkewY:function () {
        return this._skewY;
    },

    /**
     * <p>
     * Changes the Y skew angle of the node in degrees.
     *
     * This angle describes the shear distortion in the Y direction.
     * Thus, it is the angle between the X axis and the bottom edge of the shape
     * The default skewY angle is 0. Positive values distort the node in a CCW direction.
     * </p>
     * @param {Number} newSkewY  The Y skew angle of the node in degrees.
     */
    setSkewY:function (newSkewY) {
        this._skewY = newSkewY;
        this.setNodeDirty();
    },

    /**
     * zOrder getter
     * @return {Number}
     */
    getZOrder:function () {
        return this._zOrder;
    },

    /**
     * <p>
     *     Sets the z order which stands for the drawing order                                                     <br/>
     *                                                                                                             <br/>
     *     This is an internal method. Don't call it outside the framework.                                        <br/>
     *     The difference between setZOrder(int) and _setOrder(int) is:                                            <br/>
     *        - _setZOrder(int) is a pure setter for m_nZOrder member variable                                    <br/>
     *        - setZOrder(int) firstly changes m_nZOrder, then recorder this node in its parent's children array.
     * </p>
     * @param {Number} z
     * @private
     */
    _setZOrder:function (z) {
        this._zOrder = z;
    },

    /**
     * <p>
     *     Sets the Z order which stands for the drawing order, and reorder this node in its parent's children array.     <br/>
     *                                                                                                                    <br/>
     *      The Z order of node is relative to its "brothers": children of the same parent.                               <br/>
     *      It's nothing to do with OpenGL's z vertex. This one only affects the draw order of nodes in cocos2d.          <br/>
     *      The larger number it is, the later this node will be drawn in each message loop.                              <br/>
     *      Please refer to setVertexZ(float) for the difference.
     * </p>
     * @param {Number} z Z order of this node.
     */
    setZOrder:function (z) {
        this._setZOrder(z);
        if (this._parent)
            this._parent.reorderChild(this, z);
    },

    /**
     * Gets WebGL Z vertex of this node.
     * @return {Number} WebGL Z vertex of this node
     */
    getVertexZ:function () {
        return this._vertexZ;
    },

    /**
     * <p>
     *     Sets the real WebGL Z vertex.                                                                          <br/>
     *                                                                                                            <br/>
     *      Differences between openGL Z vertex and cocos2d Z order:                                              <br/>
     *      - OpenGL Z modifies the Z vertex, and not the Z order in the relation between parent-children         <br/>
     *      - OpenGL Z might require to set 2D projection                                                         <br/>
     *      - cocos2d Z order works OK if all the nodes uses the same openGL Z vertex. eg: vertexZ = 0            <br/>
     *                                                                                                            <br/>
     *      @warning Use it at your own risk since it might break the cocos2d parent-children z order
     * </p>
     * @param {Number} Var
     */
    setVertexZ:function (Var) {
        this._vertexZ = Var;
    },

    /**
     * The rotation (angle) of the node in degrees. 0 is the default rotation angle. Positive values rotate node CW.
     * @return {Number} The rotation of the node in degrees.
     */
    getRotation:function () {
        if(this._rotationX !== this._rotationY)
            cc.log("cc.Node.rotation(): RotationX != RotationY. Don't know which one to return");
        return this._rotationX;
    },

    /**
     * <p>
     *     Sets the rotation (angle) of the node in degrees.                                             <br/>
     *                                                                                                   <br/>
     *      0 is the default rotation angle.                                                             <br/>
     *      Positive values rotate node clockwise, and negative values for anti-clockwise.
     * </p>
     * @param {Number} newRotation The rotation of the node in degrees.
     */
    setRotation:function (newRotation) {
        this._rotationX = this._rotationY = newRotation;
        this._rotationRadiansX = this._rotationX * 0.017453292519943295; //(Math.PI / 180);
        this._rotationRadiansY = this._rotationY * 0.017453292519943295; //(Math.PI / 180);
        this.setNodeDirty();
    },

    /**
     * The rotation (angle) of the node in degrees. 0 is the default rotation angle. <br/>
     * Positive values rotate node CW. It only modifies the X rotation performing a horizontal rotational skew .
     * (support only in WebGl rendering mode)
     * @return {Number} The X rotation in degrees.
     */
    getRotationX:function () {
        return this._rotationX;
    },

    /**
     * <p>
     *     Sets the X rotation (angle) of the node in degrees which performs a horizontal rotational skew.        <br/>
     *                                                                                                            <br/>
     *     0 is the default rotation angle.                                                                       <br/>
     *     Positive values rotate node clockwise, and negative values for anti-clockwise.
     * </p>
     * @param {Number} rotationX The X rotation in degrees which performs a horizontal rotational skew.
     */
    setRotationX:function (rotationX) {
        this._rotationX = rotationX;
        this._rotationRadiansX = this._rotationX * 0.017453292519943295; //(Math.PI / 180);
        this.setNodeDirty();
    },

    /**
     * The rotation (angle) of the node in degrees. 0 is the default rotation angle.  <br/>
     * Positive values rotate node CW. It only modifies the Y rotation performing a vertical rotational skew .
     * @return {Number} The Y rotation in degrees.
     */
    getRotationY:function () {
        return this._rotationY;
    },

    /**
     * <p>
     *    Sets the Y rotation (angle) of the node in degrees which performs a vertical rotational skew.         <br/>
     *                                                                                                          <br/>
     *      0 is the default rotation angle.                                                                    <br/>
     *      Positive values rotate node clockwise, and negative values for anti-clockwise.
     * </p>
     * @param rotationY The Y rotation in degrees.
     */
    setRotationY:function (rotationY) {
        this._rotationY = rotationY;
        this._rotationRadiansY = this._rotationY * 0.017453292519943295;  //(Math.PI / 180);
        this.setNodeDirty();
    },

    /** Get the scale factor of the node.
     * @warning: Assert when _scaleX != _scaleY.
     * @return {Number}
     */
    getScale:function () {
        if(this._scaleX !== this._scaleY)
            cc.log("cc.Node.getScale(): ScaleX != ScaleY. Don't know which one to return");
        return this._scaleX;
    },

    /**
     * The scale factor of the node. 1.0 is the default scale factor. It modifies the X and Y scale at the same time.
     * @param {Number} scale or scaleX value
     * @param {Number} [scaleY=]
     */
    setScale:function (scale, scaleY) {
        this._scaleX = scale;
        this._scaleY = (scaleY || scaleY === 0) ? scaleY : scale;
        this.setNodeDirty();
    },

    /**
     * Returns the scale factor on X axis of this node
     * @return {Number} The scale factor on X axis.
     */
    getScaleX:function () {
        return this._scaleX;
    },

    /**
     * <p>
     *     Changes the scale factor on X axis of this node                                   <br/>
     *     The deafult value is 1.0 if you haven't changed it before
     * </p>
     * @param {Number} newScaleX The scale factor on X axis.
     */
    setScaleX:function (newScaleX) {
        this._scaleX = newScaleX;
        this.setNodeDirty();
    },

    /**
     * Returns the scale factor on Y axis of this node
     * @return {Number} The scale factor on Y axis.
     */
    getScaleY:function () {
        return this._scaleY;
    },

    /**
     * <p>
     *     Changes the scale factor on Y axis of this node                                            <br/>
     *     The Default value is 1.0 if you haven't changed it before.
     * </p>
     * @param {Number} newScaleY The scale factor on Y axis.
     */
    setScaleY:function (newScaleY) {
        this._scaleY = newScaleY;
        this.setNodeDirty();
    },

    /**
     * <p>
     *     Changes the position (x,y) of the node in OpenGL coordinates
     *     Usually we use ccp(x,y) to compose CCPoint object.
     *     The original point (0,0) is at the left-bottom corner of screen.
     *     and Passing two numbers (x,y) is much efficient than passing CCPoint object.
     * </p>
     * @param {cc.Point|Number} newPosOrxValue The position (x,y) of the node in coordinates or  X coordinate for position
     * @param {Number} [yValue] Y coordinate for position
     * @example
     *    var size = cc.Director.getInstance().getWinSize();
     *    node.setPosition(size.width/2, size.height/2);
     */
    setPosition:function (newPosOrxValue, yValue) {
        var locPosition = this._position;
        if (yValue === undefined) {
            locPosition._x = newPosOrxValue.x;
            locPosition._y = newPosOrxValue.y;
        }
	    else {
	        locPosition._x = newPosOrxValue;
	        locPosition._y = yValue;
        }
        this.setNodeDirty();
    },

    /**
     * <p>Position (x,y) of the node in OpenGL coordinates. (0,0) is the left-bottom corner. </p>
     * @const
     * @return {cc.Point} The position (x,y) of the node in OpenGL coordinates
     */
    getPosition:function () {
        return this._position;
    },

    /**
     * @return {Number}
     */
    getPositionX:function () {
        return this._position._x;
    },

    /**
     * @param {Number} x
     */
    setPositionX:function (x) {
        this._position._x = x;
        this.setNodeDirty();
    },

    /**
     * @return {Number}
     */
    getPositionY:function () {
        return  this._position._y;
    },

    /**
     * @param {Number} y
     */
    setPositionY:function (y) {
        this._position._y = y;
        this.setNodeDirty();
    },

    /**
     * Get the amount of children.
     * @return {Number} The amount of children.
     */
    getChildrenCount:function () {
        return this._children.length;
    },

    /**
     * Return an array of children  <br/>
     * Composing a "tree" structure is a very important feature of CCNode
     * @return {Array} An array of children
     * @example
     *  //This sample code traverses all children nodes, and set their position to (0,0)
     *  var allChildren = parent.getChildren();
     * for(var i = 0; i< allChildren.length; i++) {
     *     allChildren[i].setPosition(0,0);
     * }
     */
    getChildren:function () {
        return this._children;
    },

    /**
     * Determines if the node is visible
     * @see setVisible(bool)
     * @return {Boolean} true if the node is visible, false if the node is hidden.
     */
    isVisible:function () {
        return this._visible;
    },

    /**
     * Sets whether the node is visible <br/>
     * The default value is true, a node is default to visible
     * @param {Boolean} Var true if the node is visible, false if the node is hidden.
     */
    setVisible:function (Var) {
        this._visible = Var;
        this.setNodeDirty();
    },

    /**
     *  <p>anchorPoint is the point around which all transformations and positioning manipulations take place.<br/>
     *  It's like a pin in the node where it is "attached" to its parent. <br/>
     *  The anchorPoint is normalized, like a percentage. (0,0) means the bottom-left corner and (1,1) means the top-right corner. <br/>
     *  But you can use values higher than (1,1) and lower than (0,0) too.  <br/>
     *  The default anchorPoint is (0.5,0.5), so it starts in the center of the node. <br/></p>
     *  @const
     * @return {cc.Point}  The anchor point of node.
     */
    getAnchorPoint:function () {
        return this._anchorPoint;
    },

    /**
     * <p>
     *     Sets the anchor point in percent.                                                                                              <br/>
     *                                                                                                                                    <br/>
     *     anchorPoint is the point around which all transformations and positioning manipulations take place.                            <br/>
     *     It's like a pin in the node where it is "attached" to its parent.                                                              <br/>
     *     The anchorPoint is normalized, like a percentage. (0,0) means the bottom-left corner and (1,1) means the top-right corner.     <br/>
     *     But you can use values higher than (1,1) and lower than (0,0) too.                                                             <br/>
     *     The default anchorPoint is (0.5,0.5), so it starts in the center of the node.
     * </p>
     * @param {cc.Point|Number} point The anchor point of node or The anchor point.x of node.
     * @param {Number} [y] The anchor point.y of node.
     */
    setAnchorPoint:function (point, y) {
        var locAnchorPoint = this._anchorPoint;
        if (y === undefined) {
	        if ((point.x === locAnchorPoint._x) && (point.y === locAnchorPoint._y))
		        return;
	        locAnchorPoint._x = point.x;
	        locAnchorPoint._y = point.y;
        } else {
	        if ((point === locAnchorPoint._x) && (y === locAnchorPoint._y))
		        return;
	        locAnchorPoint._x = point;
	        locAnchorPoint._y = y;
        }
        var locAPP = this._anchorPointInPoints, locSize = this._contentSize;
        locAPP._x = locSize._width * locAnchorPoint._x;
        locAPP._y = locSize._height * locAnchorPoint._y;
        this.setNodeDirty();
    },

    /**
     *  The anchorPoint in absolute pixels.  <br/>
     *  you can only read it. If you wish to modify it, use anchorPoint instead
     *  @see getAnchorPoint()
     *  @const
     * @return {cc.Point} The anchor point in absolute pixels.
     */
    getAnchorPointInPoints:function () {
        return this._anchorPointInPoints;
    },

    /**
     * <p>The untransformed size of the node. <br/>
     * The contentSize remains the same no matter the node is scaled or rotated.<br/>
     * All nodes has a size. Layer and Scene has the same size of the screen. <br/></p>
     * @const
     * @return {cc.Size} The untransformed size of the node.
     */
    getContentSize:function () {
        return this._contentSize;
    },

    /**
     * <p>
     *     Sets the untransformed size of the node.                                             <br/>
     *                                                                                          <br/>
     *     The contentSize remains the same no matter the node is scaled or rotated.            <br/>
     *     All nodes has a size. Layer and Scene has the same size of the screen.
     * </p>
     * @param {cc.Size|Number} size The untransformed size of the node or The untransformed size's width of the node.
     * @param {Number} [height] The untransformed size's height of the node.
     */
    setContentSize:function (size, height) {
        var locContentSize = this._contentSize;
        if (height === undefined) {
	        if ((size.width === locContentSize._width) && (size.height === locContentSize._height))
		        return;
	        locContentSize._width = size.width;
	        locContentSize._height = size.height;
        } else {
	        if ((size === locContentSize._width) && (height === locContentSize._height))
		        return;
	        locContentSize._width = size;
	        locContentSize._height = height;
        }
        var locAPP = this._anchorPointInPoints, locAnchorPoint = this._anchorPoint;
        locAPP._x = locContentSize._width * locAnchorPoint._x;
        locAPP._y = locContentSize._height * locAnchorPoint._y;
        this.setNodeDirty();
    },

    /**
     * <p>
     *     Returns whether or not the node accepts event callbacks.                                     <br/>
     *     Running means the node accept event callbacks like onEnter(), onExit(), update()
     * </p>
     * @return {Boolean} Whether or not the node is running.
     */
    isRunning:function () {
        return this._running;
    },

    /**
     * Returns a pointer to the parent node
     * @return {cc.Node} A pointer to the parent node
     */
    getParent:function () {
        return this._parent;
    },

    /**
     * Sets the parent node
     * @param {cc.Node} Var A pointer to the parent node
     */
    setParent:function (Var) {
        this._parent = Var;
    },

    /**
     * Gets whether the anchor point will be (0,0) when you position this node.
     * @see ignoreAnchorPointForPosition(bool)
     * @return {Boolean} true if the anchor point will be (0,0) when you position this node.
     */
    isIgnoreAnchorPointForPosition:function () {
        return this._ignoreAnchorPointForPosition;
    },

    /**
     * <p>
     *     Sets whether the anchor point will be (0,0) when you position this node.                              <br/>
     *                                                                                                           <br/>
     *     This is an internal method, only used by CCLayer and CCScene. Don't call it outside framework.        <br/>
     *     The default value is false, while in CCLayer and CCScene are true
     * </p>
     * @param {Boolean} newValue true if anchor point will be (0,0) when you position this node
     */
    ignoreAnchorPointForPosition:function (newValue) {
        if (newValue != this._ignoreAnchorPointForPosition) {
            this._ignoreAnchorPointForPosition = newValue;
            this.setNodeDirty();
        }
    },

    /**
     * Returns a tag that is used to identify the node easily.
     *
     * @return {Number} An integer that identifies the node.
     * @example
     *  //You can set tags to node then identify them easily.
     * // set tags
     * node1.setTag(TAG_PLAYER);
     * node2.setTag(TAG_MONSTER);
     * node3.setTag(TAG_BOSS);
     * parent.addChild(node1);
     * parent.addChild(node2);
     * parent.addChild(node3);
     * // identify by tags
     * var allChildren = parent.getChildren();
     * for(var i = 0; i < allChildren.length; i++){
     *     switch(node.getTag()) {
     *         case TAG_PLAYER:
     *             break;
     *         case TAG_MONSTER:
     *             break;
     *         case TAG_BOSS:
     *             break;
     *     }
     * }
     */
    getTag:function () {
        return this._tag;
    },

    /**
     * Changes the tag that is used to identify the node easily. <br/>
     * Please refer to getTag for the sample code.
     * @param {Number} Var A integer that identifies the node.
     */
    setTag:function (Var) {
        this._tag = Var;
    },

    /**
     * <p>
     *     Returns a custom user data pointer                                                               <br/>
     *     You can set everything in UserData pointer, a data block, a structure or an object.
     * </p>
     * @return {object}  A custom user data pointer
     */
    getUserData:function () {
        return this._userData;
    },

    /**
     * <p>
     *    Sets a custom user data pointer                                                                   <br/>
     *    You can set everything in UserData pointer, a data block, a structure or an object, etc.
     * </p>
     * @warning Don't forget to release the memory manually,especially before you change this data pointer, and before this node is autoreleased.
     * @param {object} Var A custom user data
     */
    setUserData:function (Var) {
        this._userData = Var;
    },

    /**
     * Returns a user assigned CCObject.                             <br/>
     * Similar to userData, but instead of holding a void* it holds an id
     * @return {object} A user assigned CCObject
     */
    getUserObject:function () {
        return this._userObject;
    },

    /**
     * <p>
     *      Returns a user assigned CCObject                                                                                       <br/>
     *      Similar to UserData, but instead of holding a void* it holds an object.                                               <br/>
     *      The UserObject will be retained once in this method, and the previous UserObject (if existed) will be release.         <br/>
     *      The UserObject will be released in CCNode's destruction.
     * </p>
     * @param {object} newValue A user assigned CCObject
     */
    setUserObject:function (newValue) {
        if (this._userObject != newValue) {
            this._userObject = newValue;
        }
    },


    /**
     * Returns the arrival order, indicates which children is added previously.
     * @return {Number} The arrival order.
     */
    getOrderOfArrival:function () {
        return this._orderOfArrival;
    },

    /**
     * <p>
     *     Sets the arrival order when this node has a same ZOrder with other children.                             <br/>
     *                                                                                                              <br/>
     *     A node which called addChild subsequently will take a larger arrival order,                              <br/>
     *     If two children have the same Z order, the child with larger arrival order will be drawn later.
     * </p>
     * @warning This method is used internally for zOrder sorting, don't change this manually
     * @param {Number} Var  The arrival order.
     */
    setOrderOfArrival:function (Var) {
        this._orderOfArrival = Var;
    },

    /**
     * <p>Gets the CCActionManager object that is used by all actions.<br/>
     * (IMPORTANT: If you set a new cc.ActionManager, then previously created actions are going to be removed.)</p>
     * @see setActionManager()
     * @return {cc.ActionManager} A CCActionManager object.
     */
    getActionManager:function () {
        if (!this._actionManager) {
            this._actionManager = cc.Director.getInstance().getActionManager();
        }
        return this._actionManager;
    },

    /**
     * <p>Sets the cc.ActionManager object that is used by all actions. </p>
     * @warning If you set a new CCActionManager, then previously created actions will be removed.
     * @param {cc.ActionManager} actionManager A CCActionManager object that is used by all actions.
     */
    setActionManager:function (actionManager) {
        if (this._actionManager != actionManager) {
            this.stopAllActions();
            this._actionManager = actionManager;
        }
    },

    /**
     * <p>
     *   cc.Scheduler used to schedule all "updates" and timers.<br/>
     *   IMPORTANT: If you set a new cc.Scheduler, then previously created timers/update are going to be removed.
     * </p>
     * @return {cc.Scheduler} A CCScheduler object.
     */
    getScheduler:function () {
        if (!this._scheduler) {
            this._scheduler = cc.Director.getInstance().getScheduler();
        }
        return this._scheduler;
    },

    /**
     * <p>
     *   Sets a CCScheduler object that is used to schedule all "updates" and timers.           <br/>
     * </p>
     * @warning If you set a new CCScheduler, then previously created timers/update are going to be removed.
     * @param scheduler A cc.Scheduler object that is used to schedule all "update" and timers.
     */
    setScheduler:function (scheduler) {
        if (this._scheduler != scheduler) {
            this.unscheduleAllCallbacks();
            this._scheduler = scheduler;
        }
    },

    /**
     * Returns a "local" axis aligned bounding box of the node. <br/>
     * The returned box is relative only to its parent.
     * @note This method returns a temporary variable, so it can't returns const CCRect&
     * @const
     * @return {cc.Rect}
     */
    getBoundingBox:function () {
        var rect = cc.rect(0, 0, this._contentSize._width, this._contentSize._height);
        return cc._RectApplyAffineTransformIn(rect, this.nodeToParentTransform());
    },

    /**
     * Stops all running actions and schedulers
     */
    cleanup:function () {
        // actions
        this.stopAllActions();
        this.unscheduleAllCallbacks();

        // timers
        this._arrayMakeObjectsPerformSelector(this._children, cc.Node.StateCallbackType.cleanup);
    },

    /**
     * Gets the description string. It makes debugging easier.
     * @return {String}
     */
    description:function () {
        return "<cc.Node | Tag =" + this._tag + ">";
    },

    // composition: GET
    /**
     * Gets a child from the container given its tag
     * @param {Number} aTag An identifier to find the child node.
     * @return {cc.Node} a CCNode object whose tag equals to the input parameter
     */
    getChildByTag:function (aTag) {
        var __children = this._children;
        if (__children != null) {
            for (var i = 0; i < __children.length; i++) {
                var node = __children[i];
                if (node && node._tag == aTag)
                    return node;
            }
        }
        //throw "not found";
        return null;
    },
    // composition: ADD

    /** <p>"add" logic MUST only be on this method <br/> </p>
     *
     * <p>If the child is added to a 'running' node, then 'onEnter' and 'onEnterTransitionDidFinish' will be called immediately.</p>
     *
     * @param {cc.Node} child  A child node
     * @param {Number} [zOrder=]  Z order for drawing priority. Please refer to setZOrder(int)
     * @param {Number} [tag=]  A integer to identify the node easily. Please refer to setTag(int)
     */
    addChild:function (child, zOrder, tag) {
        if(!child)
            throw "cc.Node.addChild(): child must be non-null";
        if (child === this) {
            cc.log('cc.Node.addChild(): An Node can\'t be added as a child of itself.');
            return;
        }

        if (child._parent !== null) {
            cc.log("cc.Node.addChild(): child already added. It can't be added again");
            return;
        }

        var tmpzOrder = (zOrder != null) ? zOrder : child._zOrder;
        child._tag = (tag != null) ? tag : child._tag;
        this._insertChild(child, tmpzOrder);
        child._parent = this;

        if (this._running) {
            child.onEnter();
            // prevent onEnterTransitionDidFinish to be called twice when a node is added in onEnter
            if(this._isTransitionFinished)
                child.onEnterTransitionDidFinish();
        }
    },

    // composition: REMOVE
    /**
     * Remove itself from its parent node. If cleanup is true, then also remove all actions and callbacks. <br/>
     * If the cleanup parameter is not passed, it will force a cleanup. <br/>
     * If the node orphan, then nothing happens.
     * @param {Boolean} cleanup true if all actions and callbacks on this node should be removed, false otherwise.
     * @see removeFromParentAndCleanup(bool)
     */
    removeFromParent:function (cleanup) {
        if (this._parent) {
            if (cleanup == null)
                cleanup = true;
            this._parent.removeChild(this, cleanup);
        }
    },

    /**
     * Removes this node itself from its parent node.  <br/>
     * If the node orphan, then nothing happens.
     * @deprecated
     * @param {Boolean} cleanup true if all actions and callbacks on this node should be removed, false otherwise.
     */
    removeFromParentAndCleanup:function (cleanup) {
        cc.log("removeFromParentAndCleanup is deprecated. Use removeFromParent instead");
        this.removeFromParent(cleanup);
    },

    /** <p>Removes a child from the container. It will also cleanup all running actions depending on the cleanup parameter. </p>
     * If the cleanup parameter is not passed, it will force a cleanup. <br/>
     *<p> "remove" logic MUST only be on this method  <br/>
     * If a class wants to extend the 'removeChild' behavior it only needs <br/>
     * to override this method </p>
     *
     * @param {cc.Node} child  The child node which will be removed.
     * @param {Boolean|null} [cleanup=null]  true if all running actions and callbacks on the child node will be cleanup, false otherwise.
     */
    removeChild:function (child, cleanup) {
        // explicit nil handling
        if (this._children.length === 0)
            return;

        if (cleanup == null)
            cleanup = true;
        if (this._children.indexOf(child) > -1)
            this._detachChild(child, cleanup);

        this.setNodeDirty();
    },

    /**
     * Removes a child from the container by tag value. It will also cleanup all running actions depending on the cleanup parameter.
     * If the cleanup parameter is not passed, it will force a cleanup. <br/>
     * @param {Number} tag An integer number that identifies a child node
     * @param {Boolean} cleanup true if all running actions and callbacks on the child node will be cleanup, false otherwise.
     * @see removeChildByTag(int, bool)
     */
    removeChildByTag:function (tag, cleanup) {
        if(tag === cc.NODE_TAG_INVALID)
            cc.log("cc.Node.removeChildByTag(): argument tag is an invalid tag");

        var child = this.getChildByTag(tag);
        if (child == null)
            cc.log("cocos2d: removeChildByTag(tag = " + tag + "): child not found!");
        else
            this.removeChild(child, cleanup);
    },

    /**
     * Removes all children from the container and do a cleanup all running actions depending on the cleanup parameter.
     * @deprecated
     * @param {Boolean | null } cleanup
     */
    removeAllChildrenWithCleanup:function (cleanup) {
        cc.log("removeAllChildrenWithCleanup is deprecated. Use removeAllChildren instead");
        this.removeAllChildren(cleanup);
    },

    /**
     * Removes all children from the container and do a cleanup all running actions depending on the cleanup parameter. <br/>
     * If the cleanup parameter is not passed, it will force a cleanup. <br/>
     * @param {Boolean | null } cleanup true if all running actions on all children nodes should be cleanup, false otherwise.
     */
    removeAllChildren:function (cleanup) {
        // not using detachChild improves speed here
        var __children = this._children;
        if (__children != null) {
            if (cleanup == null)
                cleanup = true;
            for (var i = 0; i < __children.length; i++) {
                var node = __children[i];
                if (node) {
                    // IMPORTANT:
                    //  -1st do onExit
                    //  -2nd cleanup
                    if (this._running) {
                        node.onExitTransitionDidStart();
                        node.onExit();
                    }
                    if (cleanup)
                        node.cleanup();
                    // set parent nil at the end
                    node.setParent(null);
                }
            }
            this._children.length = 0;
        }
    },

    /**
     * @param {cc.Node} child
     * @param {Boolean} doCleanup
     * @private
     */
    _detachChild:function (child, doCleanup) {
        // IMPORTANT:
        //  -1st do onExit
        //  -2nd cleanup
        if (this._running) {
            child.onExitTransitionDidStart();
            child.onExit();
        }

        // If you don't do cleanup, the child's actions will not get removed and the
        // its scheduledSelectors_ dict will not get released!
        if (doCleanup)
            child.cleanup();

        // set parent nil at the end
        child.setParent(null);

        cc.ArrayRemoveObject(this._children, child);
    },

    /** helper used by reorderChild & add
     * @param {cc.Node} child
     * @param {Number} z
     * @private
     */
    _insertChild:function (child, z) {
        this._reorderChildDirty = true;
        this._children.push(child);
        child._setZOrder(z);
    },

    /** Reorders a child according to a new z value. <br/>
     * The child MUST be already added.
     * @param {cc.Node} child An already added child node. It MUST be already added.
     * @param {Number} zOrder Z order for drawing priority. Please refer to setZOrder(int)
     */
    reorderChild:function (child, zOrder) {
        if(!child)
            throw "cc.Node.reorderChild(): child must be non-null";
        this._reorderChildDirty = true;
        child.setOrderOfArrival(cc.s_globalOrderOfArrival++);
        child._setZOrder(zOrder);
        this.setNodeDirty();
    },

    /**
     * <p>
     *     Sorts the children array once before drawing, instead of every time when a child is added or reordered.    <br/>
     *     This approach can improves the performance massively.
     * </p>
     * @note Don't call this manually unless a child added needs to be removed in the same frame
     */
    sortAllChildren:function () {
        if (this._reorderChildDirty) {
            var _children = this._children;
            var i, j, length = _children.length,tempChild;

            // insertion sort
            for (i = 0; i < length; i++) {
                var tempItem = _children[i];
                j = i - 1;
                tempChild =  _children[j];

                //continue moving element downwards while zOrder is smaller or when zOrder is the same but mutatedIndex is smaller
                while (j >= 0 && ( tempItem._zOrder < tempChild._zOrder ||
                    ( tempItem._zOrder == tempChild._zOrder && tempItem._orderOfArrival < tempChild._orderOfArrival ))) {
                    _children[j + 1] = tempChild;
                    j = j - 1;
                    tempChild =  _children[j];
                }
                _children[j + 1] = tempItem;
            }

            //don't need to check children recursively, that's done in visit of each child
            this._reorderChildDirty = false;
        }
    },

    // draw
    /** <p>Override this method to draw your own node. <br/>
     * The following GL states will be enabled by default: <br/>
     - glEnableClientState(GL_VERTEX_ARRAY);  <br/>
     - glEnableClientState(GL_COLOR_ARRAY); <br/>
     - glEnableClientState(GL_TEXTURE_COORD_ARRAY); <br/>
     - glEnable(GL_TEXTURE_2D); </p>

     <p>AND YOU SHOULD NOT DISABLE THEM AFTER DRAWING YOUR NODE</p>

     <p>But if you enable any other GL state, you should disable it after drawing your node. </p>
     * @param {CanvasContext} ctx
     */
    draw:function (ctx) {
        // override me
        // Only use- this function to draw your staff.
        // DON'T draw your stuff outside this method
    },

    /** performs OpenGL view-matrix transformation of it's ancestors.<br/>
     * Generally the ancestors are already transformed, but in certain cases (eg: attaching a FBO) <br/>
     * it's necessary to transform the ancestors again.
     */
    transformAncestors:function () {
        if (this._parent != null) {
            this._parent.transformAncestors();
            this._parent.transform();
        }
    },

    //scene managment
    /**
     * <p>
     *     Event callback that is invoked every time when CCNode enters the 'stage'.                                   <br/>
     *     If the CCNode enters the 'stage' with a transition, this event is called when the transition starts.        <br/>
     *     During onEnter you can't access a "sister/brother" node.                                                    <br/>
     *     If you override onEnter, you shall call its parent's one, e.g., CCNode::onEnter().
     * </p>
     */
    onEnter:function () {
        this._isTransitionFinished = false;
        this._running = true;//should be running before resumeSchedule
        this._arrayMakeObjectsPerformSelector(this._children, cc.Node.StateCallbackType.onEnter);
        this.resumeSchedulerAndActions();
    },

    /**
     * <p>
     *     Event callback that is invoked when the CCNode enters in the 'stage'.                                                        <br/>
     *     If the CCNode enters the 'stage' with a transition, this event is called when the transition finishes.                       <br/>
     *     If you override onEnterTransitionDidFinish, you shall call its parent's one, e.g. CCNode::onEnterTransitionDidFinish()
     * </p>
     */
    onEnterTransitionDidFinish:function () {
        this._isTransitionFinished = true;
        this._arrayMakeObjectsPerformSelector(this._children, cc.Node.StateCallbackType.onEnterTransitionDidFinish);
    },

    /**
     * <p>callback that is called every time the cc.Node leaves the 'stage'.  <br/>
     * If the cc.Node leaves the 'stage' with a transition, this callback is called when the transition starts. </p>
     */
    onExitTransitionDidStart:function () {
        this._arrayMakeObjectsPerformSelector(this._children, cc.Node.StateCallbackType.onExitTransitionDidStart);
    },

    /**
     * <p>
     * callback that is called every time the cc.Node leaves the 'stage'.                                         <br/>
     * If the cc.Node leaves the 'stage' with a transition, this callback is called when the transition finishes. <br/>
     * During onExit you can't access a sibling node.                                                             <br/>
     * If you override onExit, you shall call its parent's one, e.g., CCNode::onExit().
     * </p>
     */
    onExit:function () {
        this._running = false;
        this.pauseSchedulerAndActions();
        this._arrayMakeObjectsPerformSelector(this._children, cc.Node.StateCallbackType.onExit);
        if(this._componentContainer){
            this._componentContainer.removeAll();
        }
    },

    // actions
    /**
     * Executes an action, and returns the action that is executed.<br/>
     * The node becomes the action's target. Refer to CCAction::getTarget()
     * @warning Starting from v0.8 actions don't retain their target anymore.
     * @param {cc.Action} action
     * @return {cc.Action} An Action pointer
     */
    runAction:function (action) {
        if(!action)
            throw "cc.Node.runAction(): action must be non-null";
        this.getActionManager().addAction(action, this, !this._running);
        return action;
    },

    /**
     * Stops and removes all actions from the running action list .
     */
    stopAllActions:function () {
        this.getActionManager().removeAllActionsFromTarget(this);
    },

    /**
     * Stops and removes an action from the running action list.
     * @param {cc.Action} action An action object to be removed.
     */
    stopAction:function (action) {
        this.getActionManager().removeAction(action);
    },

    /**
     * Removes an action from the running action list by its tag.
     * @param {Number} tag A tag that indicates the action to be removed.
     */
    stopActionByTag:function (tag) {
        if(tag === cc.ACTION_TAG_INVALID){
            cc.log("cc.Node.stopActionBy(): argument tag an invalid tag");
            return;
        }
        this.getActionManager().removeActionByTag(tag, this);
    },

    /**
     * Gets an action from the running action list by its tag.
     * @see setTag(int), getTag().
     * @param {Number} tag
     * @return {cc.Action} The action object with the given tag.
     */
    getActionByTag:function (tag) {
        if(tag === cc.ACTION_TAG_INVALID){
            cc.log("cc.Node.getActionByTag(): argument tag is an invalid tag");
            return null;
        }
        return this.getActionManager().getActionByTag(tag, this);
    },

    /** Returns the numbers of actions that are running plus the ones that are schedule to run (actions in actionsToAdd and actions arrays).<br/>
     *    Composable actions are counted as 1 action. Example:<br/>
     *    If you are running 1 Sequence of 7 actions, it will return 1. <br/>
     *    If you are running 7 Sequences of 2 actions, it will return 7.
     * @return {Number} The number of actions that are running plus the ones that are schedule to run
     */
    getNumberOfRunningActions:function () {
        return this.getActionManager().numberOfRunningActionsInTarget(this);
    },

    // cc.Node - Callbacks
    // timers
    /**
     * schedules the "update" method.                                                                           <br/>
     * It will use the order number 0. This method will be called every frame.                                  <br/>
     * Scheduled methods with a lower order value will be called before the ones that have a higher order value.<br/>
     * Only one "update" method could be scheduled per node.
     */
    scheduleUpdate:function () {
        this.scheduleUpdateWithPriority(0);
    },

    /**
     * <p>
     * schedules the "update" callback function with a custom priority.
     * This callback function will be called every frame.<br/>
     * Scheduled callback functions with a lower priority will be called before the ones that have a higher value.<br/>
     * Only one "update" callback function could be scheduled per node (You can't have 2 'update' callback functions).<br/>
     * </p>
     * @param {Number} priority
     */
    scheduleUpdateWithPriority:function (priority) {
        this.getScheduler().scheduleUpdateForTarget(this, priority, !this._running);
    },

    /**
     * unschedules the "update" method.
     * @see scheduleUpdate();
     */
    unscheduleUpdate:function () {
        this.getScheduler().unscheduleUpdateForTarget(this);
    },

    /**
     * Schedules a custom selector.         <br/>
     * If the selector is already scheduled, then the interval parameter will be updated without scheduling it again.
     *
     * @param {function} callback_fn A function wrapped as a selector
     * @param {Number} interval  Tick interval in seconds. 0 means tick every frame. If interval = 0, it's recommended to use scheduleUpdate() instead.
     * @param {Number} repeat    The selector will be executed (repeat + 1) times, you can use kCCRepeatForever for tick infinitely.
     * @param {Number} delay     The amount of time that the first tick will wait before execution.
     */
    schedule:function (callback_fn, interval, repeat, delay) {
        interval = interval || 0;

        if(!callback_fn)
            throw "cc.Node.schedule(): callback function must be non-null";
        if(interval < 0)
            throw "cc.Node.schedule(): interval must be positive";

        repeat = (repeat == null) ? cc.REPEAT_FOREVER : repeat;
        delay = delay || 0;

        this.getScheduler().scheduleCallbackForTarget(this, callback_fn, interval, repeat, delay, !this._running);
    },

    /**
     * Schedules a callback function that runs only once, with a delay of 0 or larger
     * @see schedule(SEL_SCHEDULE, float, unsigned int, float)
     * @param {function} callback_fn  A function wrapped as a selector
     * @param {Number} delay  The amount of time that the first tick will wait before execution.
     */
    scheduleOnce:function (callback_fn, delay) {
        this.schedule(callback_fn, 0.0, 0, delay);
    },

    /**
     * unschedules a custom callback function.
     * @see schedule(SEL_SCHEDULE, float, unsigned int, float)
     * @param {function} callback_fn  A function wrapped as a selector
     */
    unschedule:function (callback_fn) {
        // explicit nil handling
        if (!callback_fn)
            return;

        this.getScheduler().unscheduleCallbackForTarget(this, callback_fn);
    },

    /**
     * unschedule all scheduled callback functions: custom callback functions, and the 'update' callback function.<br/>
     * Actions are not affected by this method.
     */
    unscheduleAllCallbacks:function () {
        this.getScheduler().unscheduleAllCallbacksForTarget(this);
    },

    /**
     * Resumes all scheduled selectors and actions.<br/>
     * This method is called internally by onEnter
     */
    resumeSchedulerAndActions:function () {
        this.getScheduler().resumeTarget(this);
        this.getActionManager().resumeTarget(this);
    },

    /**
     * Pauses all scheduled selectors and actions.<br/>
     * This method is called internally by onExit
     */
    pauseSchedulerAndActions:function () {
        this.getScheduler().pauseTarget(this);
        this.getActionManager().pauseTarget(this);
    },

    /**
     *<p>  Sets the additional transform.<br/>
     *  The additional transform will be concatenated at the end of nodeToParentTransform.<br/>
     *  It could be used to simulate `parent-child` relationship between two nodes (e.g. one is in BatchNode, another isn't).<br/>
     *  </p>
     *  @example
     * // create a batchNode
     * var batch= cc.SpriteBatchNode.create("Icon-114.png");
     * this.addChild(batch);
     *
     * // create two sprites, spriteA will be added to batchNode, they are using different textures.
     * var spriteA = cc.Sprite.createWithTexture(batch->getTexture());
     * var spriteB = cc.Sprite.create("Icon-72.png");
     *
     * batch.addChild(spriteA);
     *
     * // We can't make spriteB as spriteA's child since they use different textures. So just add it to layer.
     * // But we want to simulate `parent-child` relationship for these two node.
     * this.addChild(spriteB);
     *
     * //position
     * spriteA.setPosition(ccp(200, 200));
     *
     * // Gets the spriteA's transform.
     * var t = spriteA.nodeToParentTransform();
     *
     * // Sets the additional transform to spriteB, spriteB's position will based on its pseudo parent i.e. spriteA.
     * spriteB.setAdditionalTransform(t);
     *
     * //scale
     * spriteA.setScale(2);
     *
     * // Gets the spriteA's transform.
     * t = spriteA.nodeToParentTransform();
     *
     * // Sets the additional transform to spriteB, spriteB's scale will based on its pseudo parent i.e. spriteA.
     * spriteB.setAdditionalTransform(t);
     *
     * //rotation
     * spriteA.setRotation(20);
     *
     * // Gets the spriteA's transform.
     * t = spriteA.nodeToParentTransform();
     *
     * // Sets the additional transform to spriteB, spriteB's rotation will based on its pseudo parent i.e. spriteA.
     * spriteB.setAdditionalTransform(t);
     */
    setAdditionalTransform:function (additionalTransform) {
        this._additionalTransform = additionalTransform;
        this._transformDirty = true;
        this._additionalTransformDirty = true;
    },

    /**
     * Returns the matrix that transform parent's space coordinates to the node's (local) space coordinates.<br/>
     * The matrix is in Pixels.
     * @return {cc.AffineTransform}
     */
    parentToNodeTransform:function () {
        if (this._inverseDirty) {
            this._inverse = cc.AffineTransformInvert(this.nodeToParentTransform());
            this._inverseDirty = false;
        }
        return this._inverse;
    },

    /**
     *  Returns the world affine transform matrix. The matrix is in Pixels.
     * @return {cc.AffineTransform}
     */
    nodeToWorldTransform:function () {
        var t = this.nodeToParentTransform();
        for (var p = this._parent; p != null; p = p.getParent())
            t = cc.AffineTransformConcat(t, p.nodeToParentTransform());
        return t;
    },

    /**
     * Returns the inverse world affine transform matrix. The matrix is in Pixels.
     * @return {cc.AffineTransform}
     */
    worldToNodeTransform:function () {
        return cc.AffineTransformInvert(this.nodeToWorldTransform());
    },

    /**
     * Converts a Point to node (local) space coordinates. The result is in Points.
     * @param {cc.Point} worldPoint
     * @return {cc.Point}
     */
    convertToNodeSpace:function (worldPoint) {
        return cc.PointApplyAffineTransform(worldPoint, this.worldToNodeTransform());
    },

    /**
     * Converts a Point to world space coordinates. The result is in Points.
     * @param {cc.Point} nodePoint
     * @return {cc.Point}
     */
    convertToWorldSpace:function (nodePoint) {
        return cc.PointApplyAffineTransform(nodePoint, this.nodeToWorldTransform());
    },

    /**
     * Converts a Point to node (local) space coordinates. The result is in Points.<br/>
     * treating the returned/received node point as anchor relative.
     * @param {cc.Point} worldPoint
     * @return {cc.Point}
     */
    convertToNodeSpaceAR:function (worldPoint) {
        return cc.pSub(this.convertToNodeSpace(worldPoint), this._anchorPointInPoints);
    },

    /**
     * Converts a local Point to world space coordinates.The result is in Points.<br/>
     * treating the returned/received node point as anchor relative.
     * @param {cc.Point} nodePoint
     * @return {cc.Point}
     */
    convertToWorldSpaceAR:function (nodePoint) {
        var pt = cc.pAdd(nodePoint, this._anchorPointInPoints);
        return this.convertToWorldSpace(pt);
    },

    _convertToWindowSpace:function (nodePoint) {
        var worldPoint = this.convertToWorldSpace(nodePoint);
        return cc.Director.getInstance().convertToUI(worldPoint);
    },

    /** convenience methods which take a cc.Touch instead of cc.Point
     * @param {cc.Touch} touch
     * @return {cc.Point}
     */
    convertTouchToNodeSpace:function (touch) {
        var point = touch.getLocation();
        //TODO This point needn't convert to GL in HTML5
        //point = cc.Director.getInstance().convertToGL(point);
        return this.convertToNodeSpace(point);
    },

    /**
     * converts a cc.Touch (world coordinates) into a local coordiante. This method is AR (Anchor Relative).
     * @param {cc.Touch}touch
     * @return {cc.Point}
     */
    convertTouchToNodeSpaceAR:function (touch) {
        var point = touch.getLocation();
        point = cc.Director.getInstance().convertToGL(point);
        return this.convertToNodeSpaceAR(point);
    },

    /**
     * Update will be called automatically every frame if "scheduleUpdate" is called, and the node is "live" <br/>
     * (override me)
     * @param {Number} dt deltaTime
     */
    update:function (dt) {
        if(this._componentContainer && !this._componentContainer.isEmpty())
            this._componentContainer.visit(dt);
    },

    /**
     * <p>
     * Calls children's updateTransform() method recursively.                                        <br/>
     *                                                                                               <br/>
     * This method is moved from CCSprite, so it's no longer specific to CCSprite.                   <br/>
     * As the result, you apply CCSpriteBatchNode's optimization on your customed CCNode.            <br/>
     * e.g., batchNode->addChild(myCustomNode), while you can only addChild(sprite) before.
     * </p>
     */
    updateTransform:function () {
        // Recursively iterate over children
        this._arrayMakeObjectsPerformSelector(this._children, cc.Node.StateCallbackType.updateTransform);
    },

    /**
     * Currently JavaScript Bindings (JSB), in some cases, needs to use retain and release. This is a bug in JSB,
     * and the ugly workaround is to use retain/release. So, these 2 methods were added to be compatible with JSB.
     * This is a hack, and should be removed once JSB fixes the retain/release bug
     */
    retain:function () {
    },
    release:function () {
    },

    /**
     * gets a component by its name
     * @param {String} name
     * @return {cc.Component} gets a component by its name
     */
    getComponent:function(name){
        return this._componentContainer.getComponent(name);
    },

    /**
     * adds a component
     * @param {cc.Component} component
     */
    addComponent:function(component){
        this._componentContainer.add(component);
    },

    /**
     * removes a component by its name
     * @param {String} name
     */
    removeComponent:function(name){
        return this._componentContainer.remove(name);
    },

    /**
     * removes all components
     */
    removeAllComponents:function(){
        this._componentContainer.removeAll();
    },

    _transform4x4:null,
    _stackMatrix:null,
    _glServerState:null,
    _camera:null,
    _grid:null,

    /**
     * Constructor
     */
    ctor: null,

    _ctorForCanvas: function () {
        this._initNode();

        //Canvas
    },

    _ctorForWebGL: function () {
        this._initNode();

        //WebGL
        var mat4 = new cc.kmMat4();
        mat4.mat[2] = mat4.mat[3] = mat4.mat[6] = mat4.mat[7] = mat4.mat[8] = mat4.mat[9] = mat4.mat[11] = mat4.mat[14] = 0.0;
        mat4.mat[10] = mat4.mat[15] = 1.0;
        this._transform4x4 = mat4;
        this._glServerState = 0;
        this._stackMatrix = new cc.kmMat4();
    },

    /**
     * recursive method that visit its children and draw them
     * @param {CanvasRenderingContext2D|WebGLRenderingContext} ctx
     */
    visit:null,

    _visitForCanvas:function (ctx) {
        // quick return if not visible
        if (!this._visible)
            return;

        //visit for canvas
        var context = ctx || cc.renderContext, i;
        var children = this._children,child;
        context.save();
        this.transform(context);
        var len = children.length;
        if (len > 0) {
            this.sortAllChildren();
            // draw children zOrder < 0
            for (i = 0; i < len; i++) {
                child = children[i];
                if (child._zOrder < 0)
                    child.visit(context);
                else
                    break;
            }
            this.draw(context);
            for (; i < len; i++) {
                children[i].visit(context);
            }
        } else
            this.draw(context);

        this._orderOfArrival = 0;
        context.restore();
    },

    _visitForWebGL: function(){
        // quick return if not visible
        if (!this._visible)
            return;
        var context = cc.renderContext, i, currentStack = cc.current_stack;

        //cc.kmGLPushMatrixWitMat4(this._stackMatrix);
        //optimize performance for javascript
        currentStack.stack.push(currentStack.top);
        cc.kmMat4Assign(this._stackMatrix, currentStack.top);
        currentStack.top = this._stackMatrix;

        var locGrid = this._grid;
        if (locGrid && locGrid._active)
            locGrid.beforeDraw();

        this.transform();

        var locChildren = this._children;
        if (locChildren && locChildren.length > 0) {
            var childLen = locChildren.length;
            this.sortAllChildren();
            // draw children zOrder < 0
            for (i = 0; i < childLen; i++) {
                if (locChildren[i] && locChildren[i]._zOrder < 0)
                    locChildren[i].visit();
                else
                    break;
            }
            this.draw(context);
            // draw children zOrder >= 0
            for (; i < childLen; i++) {
                if (locChildren[i]) {
                    locChildren[i].visit();
                }
            }
        } else
            this.draw(context);

        this._orderOfArrival = 0;
        if (locGrid && locGrid._active)
            locGrid.afterDraw(this);

        //cc.kmGLPopMatrix();
        //optimize performance for javascript
        currentStack.top = currentStack.stack.pop();
    },

    /**
     * Performs OpenGL view-matrix transformation based on position, scale, rotation and other attributes.
     */
    transform:null,

    _transformForCanvas: function (ctx) {
        // transform for canvas
        var context = ctx || cc.renderContext, eglViewer = cc.EGLView.getInstance();

        var t = this.nodeToParentTransform();
        context.transform(t.a, t.c, t.b, t.d, t.tx * eglViewer.getScaleX(), -t.ty * eglViewer.getScaleY());
    },

    _transformForWebGL: function () {
        //optimize performance for javascript
        var t4x4 = this._transform4x4,  topMat4 = cc.current_stack.top;

        // Convert 3x3 into 4x4 matrix
        //cc.CGAffineToGL(this.nodeToParentTransform(), this._transform4x4.mat);
        var trans = this.nodeToParentTransform();
        var t4x4Mat = t4x4.mat;
        t4x4Mat[0] = trans.a;
        t4x4Mat[4] = trans.c;
        t4x4Mat[12] = trans.tx;
        t4x4Mat[1] = trans.b;
        t4x4Mat[5] = trans.d;
        t4x4Mat[13] = trans.ty;

        // Update Z vertex manually
        //this._transform4x4.mat[14] = this._vertexZ;
        t4x4Mat[14] = this._vertexZ;

        //optimize performance for Javascript
        cc.kmMat4Multiply(topMat4, topMat4, t4x4); // = cc.kmGLMultMatrix(this._transform4x4);

        // XXX: Expensive calls. Camera should be integrated into the cached affine matrix
        if (this._camera != null && !(this._grid != null && this._grid.isActive())) {
            var apx = this._anchorPointInPoints._x, apy = this._anchorPointInPoints._y;
            var translate = (apx !== 0.0 || apy !== 0.0);
            if (translate){
                cc.kmGLTranslatef(cc.RENDER_IN_SUBPIXEL(apx), cc.RENDER_IN_SUBPIXEL(apy), 0);
                this._camera.locate();
                cc.kmGLTranslatef(cc.RENDER_IN_SUBPIXEL(-apx), cc.RENDER_IN_SUBPIXEL(-apy), 0);
            } else {
                this._camera.locate();
            }
        }
    },

    /** Returns the matrix that transform the node's (local) space coordinates into the parent's space coordinates.<br/>
     * The matrix is in Pixels.
     * @return {cc.AffineTransform}
     */
    nodeToParentTransform: null,

    _nodeToParentTransformForCanvas:function () {
        if (this._transformDirty) {
            var t = this._transform;// quick reference

            // base position
            t.tx = this._position._x;
            t.ty = this._position._y;

            // rotation Cos and Sin
            var Cos = 1, Sin = 0;
            if (this._rotationX) {
                Cos = Math.cos(this._rotationRadiansX);
                Sin = Math.sin(this._rotationRadiansX);
            }

            // base abcd
            t.a = t.d = Cos;
            t.b = -Sin;
            t.c = Sin;

            var lScaleX = this._scaleX, lScaleY = this._scaleY;
            var appX = this._anchorPointInPoints._x, appY = this._anchorPointInPoints._y;

            // Firefox on Vista and XP crashes
            // GPU thread in case of scale(0.0, 0.0)
            var sx = (lScaleX < 0.000001 && lScaleX > -0.000001)?  0.000001 : lScaleX,
                sy = (lScaleY < 0.000001 && lScaleY > -0.000001)? 0.000001 : lScaleY;

            // skew
            if (this._skewX || this._skewY) {
                // offset the anchorpoint
                var skx = Math.tan(-this._skewX * Math.PI / 180);
                var sky = Math.tan(-this._skewY * Math.PI / 180);
                var xx = appY * skx * sx;
                var yy = appX * sky * sy;
                t.a = Cos + -Sin * sky;
                t.b = Cos * skx + -Sin;
                t.c = Sin + Cos * sky;
                t.d = Sin * skx + Cos;
                t.tx += Cos * xx + -Sin * yy;
                t.ty += Sin * xx + Cos * yy;
            }

            // scale
            if (lScaleX !== 1 || lScaleY !== 1) {
                t.a *= sx;
                t.c *= sx;
                t.b *= sy;
                t.d *= sy;
            }

            // adjust anchorPoint
            t.tx += Cos * -appX * sx + -Sin * appY * sy;
            t.ty -= Sin * -appX * sx + Cos * appY * sy;

            // if ignore anchorPoint
            if (this._ignoreAnchorPointForPosition) {
                t.tx += appX;
                t.ty += appY;
            }

            if (this._additionalTransformDirty) {
                this._transform = cc.AffineTransformConcat(t, this._additionalTransform);
                this._additionalTransformDirty = false;
            }

            this._transformDirty = false;
        }
        return this._transform;
    },

    _nodeToParentTransformForWebGL:function () {
        if (this._transformDirty) {
            // Translate values
            var x = this._position._x;
            var y = this._position._y;
            var apx = this._anchorPointInPoints._x, napx = -apx;
            var apy = this._anchorPointInPoints._y, napy = -apy;
            var scx = this._scaleX, scy = this._scaleY;

            if (this._ignoreAnchorPointForPosition) {
                x += apx;
                y += apy;
            }

            // Rotation values
            // Change rotation code to handle X and Y
            // If we skew with the exact same value for both x and y then we're simply just rotating
            var cx = 1, sx = 0, cy = 1, sy = 0;
            if (this._rotationX !== 0 || this._rotationY !== 0) {
                cx = Math.cos(-this._rotationRadiansX);
                sx = Math.sin(-this._rotationRadiansX);
                cy = Math.cos(-this._rotationRadiansY);
                sy = Math.sin(-this._rotationRadiansY);
            }
            var needsSkewMatrix = ( this._skewX || this._skewY );

            // optimization:
            // inline anchor point calculation if skew is not needed
            // Adjusted transform calculation for rotational skew
            if (!needsSkewMatrix && (apx !== 0 || apy !== 0)) {
                x += cy * napx * scx + -sx * napy * scy;
                y += sy * napx * scx + cx * napy * scy;
            }

            // Build Transform Matrix
            // Adjusted transform calculation for rotational skew
            var t = this._transform;
            t.a = cy * scx;
            t.b = sy * scx;
            t.c = -sx * scy;
            t.d = cx * scy;
            t.tx = x;
            t.ty = y;

            // XXX: Try to inline skew
            // If skew is needed, apply skew and then anchor point
            if (needsSkewMatrix) {
                t = cc.AffineTransformConcat({a: 1.0, b: Math.tan(cc.DEGREES_TO_RADIANS(this._skewY)),
                    c: Math.tan(cc.DEGREES_TO_RADIANS(this._skewX)), d: 1.0, tx: 0.0, ty: 0.0}, t);

                // adjust anchor point
                if (apx !== 0 || apy !== 0)
                    t = cc.AffineTransformTranslate(t, napx, napy);
            }

            if (this._additionalTransformDirty) {
                t = cc.AffineTransformConcat(t, this._additionalTransform);
                this._additionalTransformDirty = false;
            }
            this._transform = t;
            this._transformDirty = false;
        }
        return this._transform;
    },

    _setNodeDirtyForCache:function () {
        this._cacheDirty = true;
        if (this._parent) {
            this._parent._setNodeDirtyForCache();
        }
    },

    /**
     * Returns a camera object that lets you move the node using a gluLookAt
     * @return {cc.Camera} A CCCamera object that lets you move the node using a gluLookAt
     * @example
     * var camera = node.getCamera();
     * camera.setEye(0, 0, 415/2);
     * camera.setCenter(0, 0, 0);
     */
    getCamera:function () {
        if (!this._camera) {
            this._camera = new cc.Camera();
        }
        return this._camera;
    },

    /**
     * Returns a grid object that is used when applying effects
     * @return {cc.GridBase} A CCGrid object that is used when applying effects
     */
    getGrid:function () {
        return this._grid;
    },

    /**
     * Changes a grid object that is used when applying effects
     * @param {cc.GridBase} grid A CCGrid object that is used when applying effects
     */
    setGrid:function (grid) {
        this._grid = grid;
    },

    /**
     * Return the shader program currently used for this node
     * @return {cc.GLProgram} The shader program currelty used for this node
     */
    getShaderProgram:function () {
        return this._shaderProgram;
    },

    /**
     * <p>
     *     Sets the shader program for this node
     *
     *     Since v2.0, each rendering node must set its shader program.
     *     It should be set in initialize phase.
     * </p>
     * @param {cc.GLProgram} newShaderProgram The shader program which fetchs from CCShaderCache.
     * @example
     *  node.setShaderProgram(cc.ShaderCache.getInstance().programForKey(cc.SHADER_POSITION_TEXTURECOLOR));
     */
    setShaderProgram:function (newShaderProgram) {
        this._shaderProgram = newShaderProgram;
    },

    /**
     * Returns the state of OpenGL server side.
     * @return {Number} The state of OpenGL server side.
     */
    getGLServerState:function () {
        return this._glServerState;
    },

    /**
     * Sets the state of OpenGL server side.
     * @param {Number} state The state of OpenGL server side.
     */
    setGLServerState:function (state) {
        this._glServerState = state;
    },

    /** returns a "world" axis aligned bounding box of the node. <br/>
     * @return {cc.Rect}
     */
    getBoundingBoxToWorld:function () {
        var rect = cc.rect(0, 0, this._contentSize._width, this._contentSize._height);
        var trans = this.nodeToWorldTransform();
        rect = cc.RectApplyAffineTransform(rect, this.nodeToWorldTransform());
        //rect = cc.rect(0 | rect.x - 4, 0 | rect.y - 4, 0 | rect.width + 8, 0 | rect.height + 8);

        //query child's BoundingBox
        if (!this._children)
            return rect;

        var locChildren = this._children;
        for (var i = 0; i < locChildren.length; i++) {
            var child = locChildren[i];
            if (child && child._visible) {
                var childRect = child._getBoundingBoxToCurrentNode(trans);
                if (childRect)
                    rect = cc.rectUnion(rect, childRect);
            }
        }
        return rect;
    },

    _getBoundingBoxToCurrentNode: function (parentTransform) {
        var rect = cc.rect(0, 0, this._contentSize._width, this._contentSize._height);
        var trans = (parentTransform == null) ? this.nodeToParentTransform() : cc.AffineTransformConcat(this.nodeToParentTransform(), parentTransform);
        rect = cc.RectApplyAffineTransform(rect, trans);

        //query child's BoundingBox
        if (!this._children)
            return rect;

        var locChildren = this._children;
        for (var i = 0; i < locChildren.length; i++) {
            var child = locChildren[i];
            if (child && child._visible) {
                var childRect = child._getBoundingBoxToCurrentNode(trans);
                if (childRect)
                    rect = cc.rectUnion(rect, childRect);
            }
        }
        return rect;
    }
});

if(cc.Browser.supportWebGL){
    //WebGL
    cc.Node.prototype.ctor = cc.Node.prototype._ctorForWebGL;
    cc.Node.prototype.setNodeDirty = cc.Node.prototype._setNodeDirtyForWebGL;
    cc.Node.prototype.visit = cc.Node.prototype._visitForWebGL;
    cc.Node.prototype.transform = cc.Node.prototype._transformForWebGL;
    cc.Node.prototype.nodeToParentTransform = cc.Node.prototype._nodeToParentTransformForWebGL;
}else{
    //Canvas
    cc.Node.prototype.ctor = cc.Node.prototype._ctorForCanvas;
    cc.Node.prototype.setNodeDirty = cc.Node.prototype._setNodeDirtyForCanvas;
    cc.Node.prototype.visit = cc.Node.prototype._visitForCanvas;
    cc.Node.prototype.transform = cc.Node.prototype._transformForCanvas;
    cc.Node.prototype.nodeToParentTransform = cc.Node.prototype._nodeToParentTransformForCanvas;
}

/**
 * allocates and initializes a node.
 * @constructs
 * @return {cc.Node}
 * @example
 * // example
 * var node = cc.Node.create();
 */
cc.Node.create = function () {
    return new cc.Node();
};

/**
 * cc.Node's state callback type
 * @constant
 * @type Number
 */
cc.Node.StateCallbackType = {onEnter:1, onExit:2, cleanup:3, onEnterTransitionDidFinish:4, updateTransform:5, onExitTransitionDidStart:6, sortAllChildren:7};

/**
 * <p>
 *     cc.NodeRGBA is a subclass of cc.Node that implements the CCRGBAProtocol protocol.                       <br/>
 *     <br/>
 *     All features from CCNode are valid, plus the following new features:                                     <br/>
 *      - opacity                                                                                               <br/>
 *      - RGB colors                                                                                            <br/>
 *     <br/>
 *     Opacity/Color propagates into children that conform to the CCRGBAProtocol if cascadeOpacity/cascadeColor is enabled.   <br/>
 * </p>
 *
 * @class
 * @extends cc.Node
 */
cc.NodeRGBA = cc.Node.extend(/** @lends cc.NodeRGBA# */{
    RGBAProtocol:true,
    _displayedOpacity:255,
    _realOpacity:255,
    _displayedColor:null,
    _realColor:null,
    _cascadeColorEnabled:false,
    _cascadeOpacityEnabled:false,

    ctor:function(){
        cc.Node.prototype.ctor.call(this);
        this._displayedOpacity = 255;
        this._realOpacity = 255;
        this._displayedColor = cc.white();
        this._realColor = cc.white();
        this._cascadeColorEnabled = false;
        this._cascadeOpacityEnabled = false;
    },

    /**
     * Get the opacity of Node
     * @returns {number} opacity
     */
    getOpacity:function(){
        return this._realOpacity;
    },

    /**
     * Get the displayed opacity of Node
     * @returns {number} displayed opacity
     */
    getDisplayedOpacity:function(){
        return this._displayedOpacity;
    },

    /**
     * Set the opacity of Node
     * @param {Number} opacity
     */
    setOpacity:function(opacity){
        this._displayedOpacity = this._realOpacity = opacity;

        var parentOpacity = 255, locParent = this._parent;
        if (locParent && locParent.RGBAProtocol && locParent.isCascadeOpacityEnabled())
            parentOpacity = locParent.getDisplayedOpacity();
        this.updateDisplayedOpacity(parentOpacity);
    },

    /**
     * Update displayed opacity
     * @param {Number} parentOpacity
     */
    updateDisplayedOpacity: function (parentOpacity) {
        this._displayedOpacity = this._realOpacity * parentOpacity / 255.0;
        if (this._cascadeOpacityEnabled) {
            var selChildren = this._children;
            for (var i = 0; i < selChildren.length; i++) {
                var item = selChildren[i];
                if (item && item.RGBAProtocol)
                    item.updateDisplayedOpacity(this._displayedOpacity);
            }
        }
    },

    /**
     * whether or not it will set cascade opacity.
     * @returns {boolean}
     */
    isCascadeOpacityEnabled:function(){
        return this._cascadeOpacityEnabled;
    },

    /**
     * Enable or disable cascade opacity
     * @param {boolean} cascadeOpacityEnabled
     */
    setCascadeOpacityEnabled:function(cascadeOpacityEnabled){
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
     * Get the color of Node
     * @returns {cc.Color3B}
     */
    getColor:function(){
        var locRealColor = this._realColor;
        return new cc.Color3B(locRealColor.r, locRealColor.g, locRealColor.b);
    },

    /**
     * Get the displayed color of Node
     * @returns {cc.Color3B}
     */
    getDisplayedColor:function(){
        return this._displayedColor;
    },

    /**
     * Set the color of Node
     * @param {cc.Color3B} color
     */
    setColor:function(color){
        var locDisplayedColor = this._displayedColor, locRealColor = this._realColor;
        locDisplayedColor.r = locRealColor.r = color.r;
        locDisplayedColor.g = locRealColor.g = color.g;
        locDisplayedColor.b = locRealColor.b = color.b;

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
        var locDispColor = this._displayedColor, locRealColor = this._realColor;
        locDispColor.r = 0 | (locRealColor.r * parentColor.r / 255.0);
        locDispColor.g = 0 | (locRealColor.g * parentColor.g / 255.0);
        locDispColor.b = 0 | (locRealColor.b * parentColor.b / 255.0);

        if (this._cascadeColorEnabled) {
            var selChildren = this._children;
            for (var i = 0; i < selChildren.length; i++) {
                var item = selChildren[i];
                if (item && item.RGBAProtocol)
                    item.updateDisplayedColor(locDispColor);
            }
        }
    },

    /**
     * whether or not it will set cascade color.
     * @returns {boolean}
     */
    isCascadeColorEnabled:function(){
        return this._cascadeColorEnabled;
    },

    /**
     * Enable or disable cascade color
     * @param {boolean} cascadeColorEnabled
     */
    setCascadeColorEnabled:function(cascadeColorEnabled){
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
     * add a child to node
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

    setOpacityModifyRGB:function(opacityValue){},

    isOpacityModifyRGB:function(){
        return false;
    }
});
cc.NodeRGBA.create = function () {
    var res = new cc.NodeRGBA();
    res.init();
    return res;
};
