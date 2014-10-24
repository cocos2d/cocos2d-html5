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

/**
 * Default Node tag
 * @constant
 * @type Number
 */
cc.NODE_TAG_INVALID = -1;

/**
 * XXX: Yes, nodes might have a sort problem once every 15 days if the game runs at 60 FPS and each frame sprites are reordered.
 */
cc.s_globalOrderOfArrival = 1;

/**
 * <p>cc.Node is the root class of all node. Anything that gets drawn or contains things that get drawn is a cc.Node.<br/>
 * The most popular cc.Nodes are: cc.Scene, cc.Layer, cc.Sprite, cc.Menu.</p>
 *
 * <p>The main features of a cc.Node are: <br/>
 * - They can contain other cc.Node nodes (addChild, getChildByTag, removeChild, etc) <br/>
 * - They can schedule periodic callback (schedule, unschedule, etc) <br/>
 * - They can execute actions (runAction, stopAction, etc) <br/></p>
 *
 * <p>Some cc.Node nodes provide extra functionality for them or their children.</p>
 *
 * <p>Subclassing a cc.Node usually means (one/all) of: <br/>
 * - overriding constructor function "ctor" to initialize resources and schedule callbacks<br/>
 * - create callbacks to handle the advancement of time<br/></p>
 *
 * <p>Features of cc.Node: <br/>
 * - position  <br/>
 * - scale (x, y) <br/>
 * - rotation (in degrees, clockwise)<br/>
 * - anchor point<br/>
 * - size <br/>
 * - color <br/>
 * - opacity <br/>
 * - visible<br/>
 * - z-order<br/>
 * - WebGL z position<br/></P>
 *
 * <p> Default values: <br/>
 * - rotation: 0 <br/>
 * - position: (x=0,y=0) <br/>
 * - scale: (x=1,y=1) <br/>
 * - contentSize: (x=0,y=0)<br/>
 * - anchorPoint: (x=0,y=0)<br/>
 * - color: (r=255,g=255,b=255)<br/>
 * - opacity: 255</p>
 *
 * <p> Limitations:<br/>
 * - A cc.Node is a "void" object. It doesn't have a texture <br/></P>
 *
 * <p>Order in transformations with grid disabled <br/>
 * -# The node will be translated (position)  <br/>
 * -# The node will be rotated (rotation)<br/>
 * -# The node will be scaled (scale)  <br/>
 *
 * <p>Order in transformations with grid enabled<br/>
 * -# The node will be translated (position)<br/>
 * -# The node will be rotated (rotation) <br/>
 * -# The node will be scaled (scale) <br/>
 * -# The grid will capture the screen <br/>
 * -# The node will be moved according to the camera values (camera) <br/>
 * -# The grid will render the captured screen <br/></P>
 *
 * @class
 * @extends cc.Class
 *
 * @property {Number}               x                   - x axis position of node
 * @property {Number}               y                   - y axis position of node
 * @property {Number}               width               - Width of node
 * @property {Number}               height              - Height of node
 * @property {Number}               anchorX             - Anchor point's position on x axis
 * @property {Number}               anchorY             - Anchor point's position on y axis
 * @property {Boolean}              ignoreAnchor        - Indicate whether ignore the anchor point property for positioning
 * @property {Number}               skewX               - Skew x
 * @property {Number}               skewY               - Skew y
 * @property {Number}               zIndex              - Z order in depth which stands for the drawing order
 * @property {Number}               vertexZ             - WebGL Z vertex of this node, z order works OK if all the nodes uses the same openGL Z vertex
 * @property {Number}               rotation            - Rotation of node
 * @property {Number}               rotationX           - Rotation on x axis
 * @property {Number}               rotationY           - Rotation on y axis
 * @property {Number}               scale               - Scale of node
 * @property {Number}               scaleX              - Scale on x axis
 * @property {Number}               scaleY              - Scale on y axis
 * @property {Boolean}              visible             - Indicate whether node is visible or not
 * @property {cc.Color}             color               - Color of node, default value is white: (255, 255, 255)
 * @property {Boolean}              cascadeColor        - Indicate whether node's color value affect its child nodes, default value is false
 * @property {Number}               opacity             - Opacity of node, default value is 255
 * @property {Boolean}              opacityModifyRGB    - Indicate whether opacity affect the color value, default value is false
 * @property {Boolean}              cascadeOpacity      - Indicate whether node's opacity value affect its child nodes, default value is false
 * @property {Array}                children            - <@readonly> All children nodes
 * @property {Number}               childrenCount       - <@readonly> Number of children
 * @property {cc.Node}              parent              - Parent node
 * @property {Boolean}              running             - <@readonly> Indicate whether node is running or not
 * @property {Number}               tag                 - Tag of node
 * @property {Object}               userData            - Custom user data
 * @property {Object}               userObject          - User assigned CCObject, similar to userData, but instead of holding a void* it holds an id
 * @property {Number}               arrivalOrder        - The arrival order, indicates which children is added previously
 * @property {cc.ActionManager}     actionManager       - The CCActionManager object that is used by all actions.
 * @property {cc.Scheduler}         scheduler           - cc.Scheduler used to schedule all "updates" and timers.
 * @property {cc.GridBase}          grid                - grid object that is used when applying effects
 * @property {cc.GLProgram}         shaderProgram       - The shader program currently used for this node
 * @property {Number}               glServerState       - The state of OpenGL server side
 */
cc.Node = cc.Class.extend(/** @lends cc.Node# */{
    _localZOrder: 0,                                     ///< Local order (relative to its siblings) used to sort the node
    _globalZOrder: 0,                                    ///< Global order used to sort the node
    _vertexZ: 0.0,

    _rotationX: 0,
    _rotationY: 0.0,
    _scaleX: 1.0,
    _scaleY: 1.0,
    _position: null,

    _normalizedPosition:null,
    _usingNormalizedPosition: false,
    _normalizedPositionDirty: false,

    _skewX: 0.0,
    _skewY: 0.0,
    // children (lazy allocs),
    _children: null,
    // lazy alloc,
    _visible: true,
    _anchorPoint: null,
    _anchorPointInPoints: null,
    _contentSize: null,
    _running: false,
    _parent: null,
    // "whole screen" objects. like Scenes and Layers, should set _ignoreAnchorPointForPosition to true
    _ignoreAnchorPointForPosition: false,
    tag: cc.NODE_TAG_INVALID,
    // userData is always initialized as nil
    userData: null,
    userObject: null,
    _transformDirty: true,
    _inverseDirty: true,
    _cacheDirty: false,
    // Cached parent serves to construct the cached parent chain
    _cachedParent: null,
    _transformGLDirty: null,
    _transform: null,                            //local transform
    _transformWorld: null,                       //world transform
    _inverse: null,

    //since 2.0 api
    _reorderChildDirty: false,
    _shaderProgram: null,
    arrivalOrder: 0,

    _actionManager: null,
    _scheduler: null,
    _eventDispatcher: null,

    _initializedNode: false,
    _additionalTransformDirty: false,
    _additionalTransform: null,
    _componentContainer: null,
    _isTransitionFinished: false,

    _rotationRadiansX: 0,
    _rotationRadiansY: 0,
    _className: "Node",
    _showNode: false,
    _name: "",                     ///<a string label, an user defined string to identify this node

    _displayedOpacity: 255,
    _realOpacity: 255,
    _displayedColor: null,
    _realColor: null,
    _cascadeColorEnabled: false,
    _cascadeOpacityEnabled: false,
    _hashOfName: 0,

    _curLevel: -1,                           //for new renderer
    _rendererCmd:null,
    _renderCmdDirty: false,

    _initNode: function () {
        var _t = this;
        _t._anchorPoint = cc.p(0, 0);
        _t._anchorPointInPoints = cc.p(0, 0);
        _t._contentSize = cc.size(0, 0);
        _t._position = cc.p(0, 0);
        _t._normalizedPosition = cc.p(0,0);
        _t._children = [];
        _t._transform = {a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0};
        _t._transformWorld = {a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0};

        var director = cc.director;
        _t._actionManager = director.getActionManager();
        _t._scheduler = director.getScheduler();
        _t._initializedNode = true;
        _t._additionalTransform = cc.affineTransformMakeIdentity();
        if (cc.ComponentContainer) {
            _t._componentContainer = new cc.ComponentContainer(_t);
        }

        this._displayedOpacity = 255;
        this._realOpacity = 255;
        this._displayedColor = cc.color(255, 255, 255, 255);
        this._realColor = cc.color(255, 255, 255, 255);
        this._cascadeColorEnabled = false;
        this._cascadeOpacityEnabled = false;
    },

    /**
     * Initializes the instance of cc.Node
     * @function
     * @returns {boolean} Whether the initialization was successful.
     */
    init: function () {
        if (this._initializedNode === false)
            this._initNode();
        return true;
    },

    _arrayMakeObjectsPerformSelector: function (array, callbackType) {
        if (!array || array.length === 0)
            return;

        var i, len = array.length, node;
        var nodeCallbackType = cc.Node._StateCallbackType;
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
                cc.assert(0, cc._LogInfos.Node__arrayMakeObjectsPerformSelector);
                break;
        }
    },

    /**
     * Sets node's dirty flag to true so that it can be updated in visit function of the next frame
     * @function
     */
    setNodeDirty: null,

    /**
     * <p>Properties configuration function </br>
     * All properties in attrs will be set to the node, </br>
     * when the setter of the node is available, </br>
     * the property will be set via setter function.</br>
     * </p>
     * @function
     * @param {Object} attrs Properties to be set to node
     */
    attr: function (attrs) {
        for (var key in attrs) {
            this[key] = attrs[key];
        }
    },

    /**
     * <p>Returns the skew degrees in X </br>
     * The X skew angle of the node in degrees.  <br/>
     * This angle describes the shear distortion in the X direction.<br/>
     * Thus, it is the angle between the Y axis and the left edge of the shape </br>
     * The default skewX angle is 0. Positive values distort the node in a CW direction.</br>
     * </p>
     * @function
     * @return {Number} The X skew angle of the node in degrees.
     */
    getSkewX: function () {
        return this._skewX;
    },

    /**
     * <p>
     * Changes the X skew angle of the node in degrees.                                                    <br/>
     * <br/>
     * This angle describes the shear distortion in the X direction.                                       <br/>
     * Thus, it is the angle between the Y axis and the left edge of the shape                             <br/>
     * The default skewX angle is 0. Positive values distort the node in a CW direction.
     * </p>
     * @function
     * @param {Number} newSkewX The X skew angle of the node in degrees.
     */
    setSkewX: function (newSkewX) {
        this._skewX = newSkewX;
        this.setNodeDirty();
    },

    /**
     * <p>Returns the skew degrees in Y               <br/>
     * The Y skew angle of the node in degrees.                            <br/>
     * This angle describes the shear distortion in the Y direction.       <br/>
     * Thus, it is the angle between the X axis and the bottom edge of the shape       <br/>
     * The default skewY angle is 0. Positive values distort the node in a CCW direction.    <br/>
     * </p>
     * @function
     * @return {Number} The Y skew angle of the node in degrees.
     */
    getSkewY: function () {
        return this._skewY;
    },

    /**
     * <p>
     * Changes the Y skew angle of the node in degrees.                                                        <br/>
     *                                                                                                         <br/>
     * This angle describes the shear distortion in the Y direction.                                           <br/>
     * Thus, it is the angle between the X axis and the bottom edge of the shape                               <br/>
     * The default skewY angle is 0. Positive values distort the node in a CCW direction.                      <br/>
     * </p>
     * @function
     * @param {Number} newSkewY  The Y skew angle of the node in degrees.
     */
    setSkewY: function (newSkewY) {
        this._skewY = newSkewY;
        this.setNodeDirty();
    },

    /**
     * <p> LocalZOrder is the 'key' used to sort the node relative to its siblings.                                    <br/>
     *                                                                                                                 <br/>
     * The Node's parent will sort all its children based ont the LocalZOrder value.                                   <br/>
     * If two nodes have the same LocalZOrder, then the node that was added first to the children's array              <br/>
     * will be in front of the other node in the array.                                                                <br/>
     * <br/>
     * Also, the Scene Graph is traversed using the "In-Order" tree traversal algorithm ( http://en.wikipedia.org/wiki/Tree_traversal#In-order )
     * <br/>
     * And Nodes that have LocalZOder values < 0 are the "left" subtree                                                 <br/>
     * While Nodes with LocalZOder >=0 are the "right" subtree.    </p>
     * @function
     * @param {Number} localZOrder
     */
    setLocalZOrder: function (localZOrder) {
        this._localZOrder = localZOrder;
        if (this._parent)
            this._parent.reorderChild(this, localZOrder);
        cc.eventManager._setDirtyForNode(this);
    },

    //Helper function used by `setLocalZOrder`. Don't use it unless you know what you are doing.
    _setLocalZOrder: function (localZOrder) {
        this._localZOrder = localZOrder;
    },

    /**
     * Returns the local Z order of this node.
     * @function
     * @returns {Number} The local (relative to its siblings) Z order.
     */
    getLocalZOrder: function () {
        return this._localZOrder;
    },

    /**
     * Returns z order of this node
     * @function
     * @return {Number}
     * @deprecated since 3.0, please use getLocalZOrder instead
     */
    getZOrder: function () {
        cc.log(cc._LogInfos.Node_getZOrder);
        return this.getLocalZOrder();
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
     * @function
     * @param {Number} z Z order of this node.
     * @deprecated since 3.0, please use setLocalZOrder instead
     */
    setZOrder: function (z) {
        cc.log(cc._LogInfos.Node_setZOrder);
        this.setLocalZOrder(z);
    },

    /**
     * <p>Defines the oder in which the nodes are renderer.                                                                               <br/>
     * Nodes that have a Global Z Order lower, are renderer first.                                                                        <br/>
     *                                                                                                                                    <br/>
     * In case two or more nodes have the same Global Z Order, the oder is not guaranteed.                                                <br/>
     * The only exception if the Nodes have a Global Z Order == 0. In that case, the Scene Graph order is used.                           <br/>
     *                                                                                                                                    <br/>
     * By default, all nodes have a Global Z Order = 0. That means that by default, the Scene Graph order is used to render the nodes.    <br/>
     *                                                                                                                                    <br/>
     * Global Z Order is useful when you need to render nodes in an order different than the Scene Graph order.                           <br/>
     *                                                                                                                                    <br/>
     * Limitations: Global Z Order can't be used used by Nodes that have SpriteBatchNode as one of their ancestors.                       <br/>
     * And if ClippingNode is one of the ancestors, then "global Z order" will be relative to the ClippingNode.   </p>
     * @function
     * @param {Number} globalZOrder
     */
    setGlobalZOrder: function (globalZOrder) {
        if (this._globalZOrder != globalZOrder) {
            this._globalZOrder = globalZOrder;
            cc.eventManager._setDirtyForNode(this);
        }
    },

    /**
     * Return the Node's Global Z Order.
     * @function
     * @returns {number} The node's global Z order
     */
    getGlobalZOrder: function () {
        return this._globalZOrder;
    },

    /**
     * Returns WebGL Z vertex of this node.
     * @function
     * @return {Number} WebGL Z vertex of this node
     */
    getVertexZ: function () {
        return this._vertexZ;
    },

    /**
     * <p>
     *     Sets the real WebGL Z vertex.                                                                          <br/>
     *                                                                                                            <br/>
     *      Differences between openGL Z vertex and cocos2d Z order:                                              <br/>
     *      - WebGL Z modifies the Z vertex, and not the Z order in the relation between parent-children         <br/>
     *      - WebGL Z might require to set 2D projection                                                         <br/>
     *      - cocos2d Z order works OK if all the nodes uses the same WebGL Z vertex. eg: vertexZ = 0            <br/>
     *                                                                                                            <br/>
     *      @warning Use it at your own risk since it might break the cocos2d parent-children z order
     * </p>
     * @function
     * @param {Number} Var
     */
    setVertexZ: function (Var) {
        this._vertexZ = Var;
    },

    /**
     * Returns the rotation (angle) of the node in degrees. 0 is the default rotation angle. Positive values rotate node clockwise.
     * @function
     * @return {Number} The rotation of the node in degrees.
     */
    getRotation: function () {
        if (this._rotationX !== this._rotationY)
            cc.log(cc._LogInfos.Node_getRotation);
        return this._rotationX;
    },

    /**
     * <p>
     *     Sets the rotation (angle) of the node in degrees.                                             <br/>
     *                                                                                                   <br/>
     *      0 is the default rotation angle.                                                             <br/>
     *      Positive values rotate node clockwise, and negative values for anti-clockwise.
     * </p>
     * @function
     * @param {Number} newRotation The rotation of the node in degrees.
     */
    setRotation: function (newRotation) {
        this._rotationX = this._rotationY = newRotation;
        this._rotationRadiansX = this._rotationX * 0.017453292519943295; //(Math.PI / 180);
        this._rotationRadiansY = this._rotationY * 0.017453292519943295; //(Math.PI / 180);
        this.setNodeDirty();
    },

    /**
     * Returns the X axis rotation (angle) which represent a horizontal rotational skew of the node in degrees. <br/>
     * 0 is the default rotation angle. Positive values rotate node clockwise<br/>
     * (support only in WebGL rendering mode)
     * @function
     * @return {Number} The X rotation in degrees.
     */
    getRotationX: function () {
        return this._rotationX;
    },

    /**
     * <p>
     *     Sets the X rotation (angle) of the node in degrees which performs a horizontal rotational skew.        <br/>
     *     (support only in WebGL rendering mode)                                                                 <br/>
     *     0 is the default rotation angle.                                                                       <br/>
     *     Positive values rotate node clockwise, and negative values for anti-clockwise.
     * </p>
     * @param {Number} rotationX The X rotation in degrees which performs a horizontal rotational skew.
     */
    setRotationX: function (rotationX) {
        this._rotationX = rotationX;
        this._rotationRadiansX = this._rotationX * 0.017453292519943295; //(Math.PI / 180);
        this.setNodeDirty();
    },

    /**
     * Returns the Y axis rotation (angle) which represent a vertical rotational skew of the node in degrees. <br/>
     * 0 is the default rotation angle. Positive values rotate node clockwise<br/>
     * (support only in WebGL rendering mode)
     * @function
     * @return {Number} The Y rotation in degrees.
     */
    getRotationY: function () {
        return this._rotationY;
    },

    /**
     * <p>
     *    Sets the Y rotation (angle) of the node in degrees which performs a vertical rotational skew.         <br/>
     *    (support only in WebGL rendering mode)                                                                <br/>
     *    0 is the default rotation angle.                                                                      <br/>
     *    Positive values rotate node clockwise, and negative values for anti-clockwise.
     * </p>
     * @param rotationY The Y rotation in degrees.
     */
    setRotationY: function (rotationY) {
        this._rotationY = rotationY;
        this._rotationRadiansY = this._rotationY * 0.017453292519943295;  //(Math.PI / 180);
        this.setNodeDirty();
    },

    /**
     * Returns the scale factor of the node.
     * @warning: Assertion will fail when _scaleX != _scaleY.
     * @function
     * @return {Number} The scale factor
     */
    getScale: function () {
        if (this._scaleX !== this._scaleY)
            cc.log(cc._LogInfos.Node_getScale);
        return this._scaleX;
    },

    /**
     * Sets the scale factor of the node. 1.0 is the default scale factor. This function can modify the X and Y scale at the same time.
     * @function
     * @param {Number} scale or scaleX value
     * @param {Number} [scaleY=]
     */
    setScale: function (scale, scaleY) {
        this._scaleX = scale;
        this._scaleY = (scaleY || scaleY === 0) ? scaleY : scale;
        this.setNodeDirty();
    },

    /**
     * Returns the scale factor on X axis of this node
     * @function
     * @return {Number} The scale factor on X axis.
     */
    getScaleX: function () {
        return this._scaleX;
    },

    /**
     * <p>
     *     Changes the scale factor on X axis of this node                                   <br/>
     *     The deafult value is 1.0 if you haven't changed it before
     * </p>
     * @function
     * @param {Number} newScaleX The scale factor on X axis.
     */
    setScaleX: function (newScaleX) {
        this._scaleX = newScaleX;
        this.setNodeDirty();
    },

    /**
     * Returns the scale factor on Y axis of this node
     * @function
     * @return {Number} The scale factor on Y axis.
     */
    getScaleY: function () {
        return this._scaleY;
    },

    /**
     * <p>
     *     Changes the scale factor on Y axis of this node                                            <br/>
     *     The Default value is 1.0 if you haven't changed it before.
     * </p>
     * @function
     * @param {Number} newScaleY The scale factor on Y axis.
     */
    setScaleY: function (newScaleY) {
        this._scaleY = newScaleY;
        this.setNodeDirty();
    },

    /**
     * <p>
     *     Changes the position (x,y) of the node in cocos2d coordinates.<br/>
     *     The original point (0,0) is at the left-bottom corner of screen.<br/>
     *     Usually we use cc.p(x,y) to compose CCPoint object.<br/>
     *     and Passing two numbers (x,y) is more efficient than passing CCPoint object.
     * </p>
     * @function
     * @param {cc.Point|Number} newPosOrxValue The position (x,y) of the node in coordinates or the X coordinate for position
     * @param {Number} [yValue] Y coordinate for position
     * @example
     *    var size = cc.winSize;
     *    node.setPosition(size.width/2, size.height/2);
     */
    setPosition: function (newPosOrxValue, yValue) {
        var locPosition = this._position;
        if (yValue === undefined) {
            locPosition.x = newPosOrxValue.x;
            locPosition.y = newPosOrxValue.y;
        } else {
            locPosition.x = newPosOrxValue;
            locPosition.y = yValue;
        }
        this.setNodeDirty();
        this._usingNormalizedPosition = false;
    },

    /**
     * <p>
     * Sets the position (x,y) using values between 0 and 1.                                                <br/>
     * The positions in pixels is calculated like the following:                                            <br/>
     *   _position = _normalizedPosition * parent.getContentSize()
     * </p>
     * @param {cc.Point|Number} posOrX
     * @param {Number} [y]
     */
    setNormalizedPosition: function(posOrX, y){
        var locPosition = this._normalizedPosition;
        if (y === undefined) {
            locPosition.x = posOrX.x;
            locPosition.y = posOrX.y;
        } else {
            locPosition.x = posOrX;
            locPosition.y = y;
        }
        this.setNodeDirty();
        this._normalizedPositionDirty = this._usingNormalizedPosition = true;
    },

    /**
     * <p>Returns a copy of the position (x,y) of the node in cocos2d coordinates. (0,0) is the left-bottom corner.</p>
     * @function
     * @return {cc.Point} The position (x,y) of the node in OpenGL coordinates
     */
    getPosition: function () {
        return cc.p(this._position);
    },

    /**
     * returns the normalized position
     * @returns {cc.Point}
     */
    getNormalizedPosition: function(){
        return cc.p(this._normalizedPosition);
    },

    /**
     * <p>Returns the x axis position of the node in cocos2d coordinates.</p>
     * @function
     * @return {Number}
     */
    getPositionX: function () {
        return this._position.x;
    },

    /**
     * <p>Sets the x axis position of the node in cocos2d coordinates.</p>
     * @function
     * @param {Number} x The new position in x axis
     */
    setPositionX: function (x) {
        this._position.x = x;
        this.setNodeDirty();
    },

    /**
     * <p>Returns the y axis position of the node in cocos2d coordinates.</p>
     * @function
     * @return {Number}
     */
    getPositionY: function () {
        return  this._position.y;
    },

    /**
     * <p>Sets the y axis position of the node in cocos2d coordinates.</p>
     * @function
     * @param {Number} y The new position in y axis
     */
    setPositionY: function (y) {
        this._position.y = y;
        this.setNodeDirty();
    },

    /**
     * Returns the amount of children.
     * @function
     * @return {Number} The amount of children.
     */
    getChildrenCount: function () {
        return this._children.length;
    },

    /**
     * Returns an array of all children  <br/>
     * Composing a "tree" structure is a very important feature of CCNode
     * @function
     * @return {Array} An array of children
     * @example
     *  //This sample code traverses all children nodes, and set their position to (0,0)
     *  var allChildren = parent.getChildren();
     *  for(var i = 0; i< allChildren.length; i++) {
     *      allChildren[i].setPosition(0,0);
     *  }
     */
    getChildren: function () {
        return this._children;
    },

    /**
     * Returns if the node is visible
     * @function
     * @see cc.Node#setVisible
     * @return {Boolean} true if the node is visible, false if the node is hidden.
     */
    isVisible: function () {
        return this._visible;
    },

    /**
     * Sets whether the node is visible <br/>
     * The default value is true
     * @function
     * @param {Boolean} visible Pass true to make the node visible, false to hide the node.
     */
    setVisible: function (visible) {
        if(this._visible != visible){
            this._visible = visible;
            if(visible) this.setNodeDirty();
            cc.renderer.childrenOrderDirty = true;
        }
    },

    /**
     *  <p>Returns a copy of the anchor point.<br/>
     *  Anchor point is the point around which all transformations and positioning manipulations take place.<br/>
     *  It's like a pin in the node where it is "attached" to its parent. <br/>
     *  The anchorPoint is normalized, like a percentage. (0,0) means the bottom-left corner and (1,1) means the top-right corner. <br/>
     *  But you can use values higher than (1,1) and lower than (0,0) too.  <br/>
     *  The default anchor point is (0.5,0.5), so it starts at the center of the node. <br/></p>
     * @function
     * @return {cc.Point}  The anchor point of node.
     */
    getAnchorPoint: function () {
        return cc.p(this._anchorPoint);
    },

    /**
     * <p>
     *     Sets the anchor point in percent.                                                                                              <br/>
     *                                                                                                                                    <br/>
     *     anchor point is the point around which all transformations and positioning manipulations take place.                            <br/>
     *     It's like a pin in the node where it is "attached" to its parent.                                                              <br/>
     *     The anchorPoint is normalized, like a percentage. (0,0) means the bottom-left corner and (1,1) means the top-right corner.     <br/>
     *     But you can use values higher than (1,1) and lower than (0,0) too.                                                             <br/>
     *     The default anchor point is (0.5,0.5), so it starts at the center of the node.
     * </p>
     * @function
     * @param {cc.Point|Number} point The anchor point of node or The x axis anchor of node.
     * @param {Number} [y] The y axis anchor of node.
     */
    setAnchorPoint: function (point, y) {
        var locAnchorPoint = this._anchorPoint;
        if (y === undefined) {
            if ((point.x === locAnchorPoint.x) && (point.y === locAnchorPoint.y))
                return;
            locAnchorPoint.x = point.x;
            locAnchorPoint.y = point.y;
        } else {
            if ((point === locAnchorPoint.x) && (y === locAnchorPoint.y))
                return;
            locAnchorPoint.x = point;
            locAnchorPoint.y = y;
        }
        var locAPP = this._anchorPointInPoints, locSize = this._contentSize;
        locAPP.x = locSize.width * locAnchorPoint.x;
        locAPP.y = locSize.height * locAnchorPoint.y;
        this.setNodeDirty();
    },

    _getAnchor: function () {
        return this._anchorPoint;
    },
    _setAnchor: function (p) {
        var x = p.x, y = p.y;
        if (this._anchorPoint.x !== x) {
            this._anchorPoint.x = x;
            this._anchorPointInPoints.x = this._contentSize.width * x;
        }
        if (this._anchorPoint.y !== y) {
            this._anchorPoint.y = y;
            this._anchorPointInPoints.y = this._contentSize.height * y;
        }
        this.setNodeDirty();
    },
    _getAnchorX: function () {
        return this._anchorPoint.x;
    },
    _setAnchorX: function (x) {
        if (this._anchorPoint.x === x) return;
        this._anchorPoint.x = x;
        this._anchorPointInPoints.x = this._contentSize.width * x;
        this.setNodeDirty();
    },
    _getAnchorY: function () {
        return this._anchorPoint.y;
    },
    _setAnchorY: function (y) {
        if (this._anchorPoint.y === y) return;
        this._anchorPoint.y = y;
        this._anchorPointInPoints.y = this._contentSize.height * y;
        this.setNodeDirty();
    },

    /**
     * Returns a copy of the anchor point in absolute pixels.  <br/>
     * you can only read it. If you wish to modify it, use setAnchorPoint
     * @see cc.Node#getAnchorPoint
     * @function
     * @return {cc.Point} The anchor point in absolute pixels.
     */
    getAnchorPointInPoints: function () {
        return cc.p(this._anchorPointInPoints);
    },

    _getWidth: function () {
        return this._contentSize.width;
    },
    _setWidth: function (width) {
        this._contentSize.width = width;
        this._anchorPointInPoints.x = width * this._anchorPoint.x;
        this.setNodeDirty();
    },
    _getHeight: function () {
        return this._contentSize.height;
    },
    _setHeight: function (height) {
        this._contentSize.height = height;
        this._anchorPointInPoints.y = height * this._anchorPoint.y;
        this.setNodeDirty();
    },

    /**
     * <p>Returns a copy the untransformed size of the node. <br/>
     * The contentSize remains the same no matter the node is scaled or rotated.<br/>
     * All nodes has a size. Layer and Scene has the same size of the screen by default. <br/></p>
     * @function
     * @return {cc.Size} The untransformed size of the node.
     */
    getContentSize: function () {
        return cc.size(this._contentSize);
    },

    /**
     * <p>
     *     Sets the untransformed size of the node.                                             <br/>
     *                                                                                          <br/>
     *     The contentSize remains the same no matter the node is scaled or rotated.            <br/>
     *     All nodes has a size. Layer and Scene has the same size of the screen.
     * </p>
     * @function
     * @param {cc.Size|Number} size The untransformed size of the node or The untransformed size's width of the node.
     * @param {Number} [height] The untransformed size's height of the node.
     */
    setContentSize: function (size, height) {
        var locContentSize = this._contentSize;
        if (height === undefined) {
            if ((size.width === locContentSize.width) && (size.height === locContentSize.height))
                return;
            locContentSize.width = size.width;
            locContentSize.height = size.height;
        } else {
            if ((size === locContentSize.width) && (height === locContentSize.height))
                return;
            locContentSize.width = size;
            locContentSize.height = height;
        }
        var locAPP = this._anchorPointInPoints, locAnchorPoint = this._anchorPoint;
        locAPP.x = locContentSize.width * locAnchorPoint.x;
        locAPP.y = locContentSize.height * locAnchorPoint.y;
        this.setNodeDirty();
    },

    /**
     * <p>
     *     Returns whether or not the node accepts event callbacks.                                     <br/>
     *     Running means the node accept event callbacks like onEnter(), onExit(), update()
     * </p>
     * @function
     * @return {Boolean} Whether or not the node is running.
     */
    isRunning: function () {
        return this._running;
    },

    /**
     * Returns a reference to the parent node
     * @function
     * @return {cc.Node} A reference to the parent node
     */
    getParent: function () {
        return this._parent;
    },

    /**
     * Sets the parent node
     * @param {cc.Node} parent A reference to the parent node
     */
    setParent: function (parent) {
        this._parent = parent;
    },

    /**
     * Returns whether the anchor point will be ignored when you position this node.<br/>
     * When anchor point ignored, position will be calculated based on the origin point (0, 0) in parent's coordinates.
     * @function
     * @see cc.Node#ignoreAnchorPointForPosition
     * @return {Boolean} true if the anchor point will be ignored when you position this node.
     */
    isIgnoreAnchorPointForPosition: function () {
        return this._ignoreAnchorPointForPosition;
    },

    /**
     * <p>
     *     Sets whether the anchor point will be ignored when you position this node.                              <br/>
     *     When anchor point ignored, position will be calculated based on the origin point (0, 0) in parent's coordinates.  <br/>
     *     This is an internal method, only used by CCLayer and CCScene. Don't call it outside framework.        <br/>
     *     The default value is false, while in CCLayer and CCScene are true
     * </p>
     * @function
     * @param {Boolean} newValue true if anchor point will be ignored when you position this node
     */
    ignoreAnchorPointForPosition: function (newValue) {
        if (newValue != this._ignoreAnchorPointForPosition) {
            this._ignoreAnchorPointForPosition = newValue;
            this.setNodeDirty();
        }
    },

    /**
     * Returns a tag that is used to identify the node easily.
     * @function
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
    getTag: function () {
        return this.tag;
    },

    /**
     * Changes the tag that is used to identify the node easily. <br/>
     * Please refer to getTag for the sample code.
     * @function
     * @see cc.Node#getTag
     * @param {Number} tag A integer that identifies the node.
     */
    setTag: function (tag) {
        this.tag = tag;
    },

    /**
     * Changes the name that is used to identify the node easily.
     * @function
     * @param {String} name
     */
    setName: function(name){
         this._name = name;
    },

    /**
     * Returns a string that is used to identify the node.
     * @function
     * @returns {string} A string that identifies the node.
     */
    getName: function(){
        return this._name;
    },

    /**
     * <p>
     *     Returns a custom user data pointer                                                               <br/>
     *     You can set everything in UserData pointer, a data block, a structure or an object.
     * </p>
     * @function
     * @return {object}  A custom user data pointer
     */
    getUserData: function () {
        return this.userData;
    },

    /**
     * <p>
     *    Sets a custom user data reference                                                                   <br/>
     *    You can set everything in UserData reference, a data block, a structure or an object, etc.
     * </p>
     * @function
     * @warning Don't forget to release the memory manually in JSB, especially before you change this data pointer, and before this node is autoreleased.
     * @param {object} Var A custom user data
     */
    setUserData: function (Var) {
        this.userData = Var;
    },

    /**
     * Returns a user assigned cocos2d object.                             <br/>
     * Similar to userData, but instead of holding all kinds of data it can only hold a cocos2d object
     * @function
     * @return {object} A user assigned CCObject
     */
    getUserObject: function () {
        return this.userObject;
    },

    /**
     * <p>
     *      Sets a user assigned cocos2d object                                                                                       <br/>
     *      Similar to UserData, but instead of holding all kinds of data it can only hold a cocos2d object                        <br/>
     *      In JSB, the UserObject will be retained once in this method, and the previous UserObject (if existed) will be release. <br/>
     *      The UserObject will be released in CCNode's destruction.
     * </p>
     * @param {object} newValue A user cocos2d object
     */
    setUserObject: function (newValue) {
        if (this.userObject != newValue) {
            this.userObject = newValue;
        }
    },


    /**
     * Returns the arrival order, indicates which children should be added previously.
     * @function
     * @return {Number} The arrival order.
     */
    getOrderOfArrival: function () {
        return this.arrivalOrder;
    },

    /**
     * <p>
     *     Sets the arrival order when this node has a same ZOrder with other children.                             <br/>
     *                                                                                                              <br/>
     *     A node which called addChild subsequently will take a larger arrival order,                              <br/>
     *     If two children have the same Z order, the child with larger arrival order will be drawn later.
     * </p>
     * @function
     * @warning This method is used internally for zOrder sorting, don't change this manually
     * @param {Number} Var  The arrival order.
     */
    setOrderOfArrival: function (Var) {
        this.arrivalOrder = Var;
    },

    /**
     * <p>Returns the CCActionManager object that is used by all actions.<br/>
     * (IMPORTANT: If you set a new cc.ActionManager, then previously created actions are going to be removed.)</p>
     * @function
     * @see cc.Node#setActionManager
     * @return {cc.ActionManager} A CCActionManager object.
     */
    getActionManager: function () {
        if (!this._actionManager) {
            this._actionManager = cc.director.getActionManager();
        }
        return this._actionManager;
    },

    /**
     * <p>Sets the cc.ActionManager object that is used by all actions. </p>
     * @function
     * @warning If you set a new CCActionManager, then previously created actions will be removed.
     * @param {cc.ActionManager} actionManager A CCActionManager object that is used by all actions.
     */
    setActionManager: function (actionManager) {
        if (this._actionManager != actionManager) {
            this.stopAllActions();
            this._actionManager = actionManager;
        }
    },

    /**
     * <p>
     *   Returns the cc.Scheduler object used to schedule all "updates" and timers.
     * </p>
     * @function
     * @return {cc.Scheduler} A CCScheduler object.
     */
    getScheduler: function () {
        if (!this._scheduler) {
            this._scheduler = cc.director.getScheduler();
        }
        return this._scheduler;
    },

    /**
     * <p>
     *   Sets a CCScheduler object that is used to schedule all "updates" and timers.           <br/>
     *   IMPORTANT: If you set a new cc.Scheduler, then previously created timers/update are going to be removed.
     * </p>
     * @function
     * @warning If you set a new CCScheduler, then previously created timers/update are going to be removed.
     * @param scheduler A cc.Scheduler object that is used to schedule all "update" and timers.
     */
    setScheduler: function (scheduler) {
        if (this._scheduler != scheduler) {
            this.unscheduleAllCallbacks();
            this._scheduler = scheduler;
        }
    },

    /**
     * Returns a "local" axis aligned bounding box of the node. <br/>
     * @deprecated since v3.0, please use getBoundingBox instead
     * @return {cc.Rect}
     */
    boundingBox: function(){
        cc.log(cc._LogInfos.Node_boundingBox);
        return this.getBoundingBox();
    },

    /**
     * Returns a "local" axis aligned bounding box of the node. <br/>
     * The returned box is relative only to its parent.
     * @function
     * @return {cc.Rect} The calculated bounding box of the node
     */
    getBoundingBox: function () {
        var rect = cc.rect(0, 0, this._contentSize.width, this._contentSize.height);
        return cc._rectApplyAffineTransformIn(rect, this.getNodeToParentTransform());
    },

    /**
     * Stops all running actions and schedulers
     * @function
     */
    cleanup: function () {
        // actions
        this.stopAllActions();
        this.unscheduleAllCallbacks();

        // event
        cc.eventManager.removeListeners(this);

        // timers
        this._arrayMakeObjectsPerformSelector(this._children, cc.Node._StateCallbackType.cleanup);
    },

    // composition: GET
    /**
     * Returns a child from the container given its tag
     * @function
     * @param {Number} aTag An identifier to find the child node.
     * @return {cc.Node} a CCNode object whose tag equals to the input parameter
     */
    getChildByTag: function (aTag) {
        var __children = this._children;
        if (__children != null) {
            for (var i = 0; i < __children.length; i++) {
                var node = __children[i];
                if (node && node.tag == aTag)
                    return node;
            }
        }
        return null;
    },

    /**
     * Returns a child from the container given its name
     * @function
     * @param {Number} name An identifier to find the child node.
     * @return {cc.Node} a CCNode object whose name equals to the input parameter
     */
    getChildByName: function(name){
        if(!name){
            cc.log("Invalid name");
            return null;
        }

        var locChildren = this._children;
        for(var i = 0, len = locChildren.length; i < len; i++){
           if(locChildren[i]._name == name)
            return locChildren[i];
        }
        return null;
    },

    // composition: ADD

    /** <p>"add" logic MUST only be in this method <br/> </p>
     *
     * <p>If the child is added to a 'running' node, then 'onEnter' and 'onEnterTransitionDidFinish' will be called immediately.</p>
     * @function
     * @param {cc.Node} child  A child node
     * @param {Number} [localZOrder=]  Z order for drawing priority. Please refer to setZOrder(int)
     * @param {Number} [tag=]  A integer to identify the node easily. Please refer to setTag(int)
     */
    addChild: function (child, localZOrder, tag) {
        localZOrder = localZOrder === undefined ? child._localZOrder : localZOrder;
        var name, setTag = false;
        if(cc.isUndefined(tag)){
            tag = undefined;
            name = child._name;
        } else if(cc.isString(tag)){
            name = tag;
            tag = undefined;
        } else if(cc.isNumber(tag)){
            setTag = true;
            name = "";
        }

        cc.assert(child, cc._LogInfos.Node_addChild_3);
        cc.assert(child._parent === null, "child already added. It can't be added again");

        this._addChildHelper(child, localZOrder, tag, name, setTag);
    },

    _addChildHelper: function(child, localZOrder, tag, name, setTag){
        if(!this._children)
            this._children = [];

        this._insertChild(child, localZOrder);
        if(setTag)
            child.setTag(tag);
        else
            child.setName(name);

        child.setParent(this);
        child.setOrderOfArrival(cc.s_globalOrderOfArrival++);

        if( this._running ){
            child.onEnter();
            // prevent onEnterTransitionDidFinish to be called twice when a node is added in onEnter
            if (this._isTransitionFinished)
                child.onEnterTransitionDidFinish();
        }

        if (this._cascadeColorEnabled)
            this._enableCascadeColor();
        if (this._cascadeOpacityEnabled)
            this._enableCascadeOpacity();
    },

    // composition: REMOVE
    /**
     * Remove itself from its parent node. If cleanup is true, then also remove all actions and callbacks. <br/>
     * If the cleanup parameter is not passed, it will force a cleanup. <br/>
     * If the node orphan, then nothing happens.
     * @function
     * @param {Boolean} cleanup true if all actions and callbacks on this node should be removed, false otherwise.
     * @see cc.Node#removeFromParentAndCleanup
     */
    removeFromParent: function (cleanup) {
        if (this._parent) {
            if (cleanup == null)
                cleanup = true;
            this._parent.removeChild(this, cleanup);
        }
    },

    /**
     * Removes this node itself from its parent node.  <br/>
     * If the node orphan, then nothing happens.
     * @deprecated since v3.0, please use removeFromParent() instead
     * @param {Boolean} cleanup true if all actions and callbacks on this node should be removed, false otherwise.
     */
    removeFromParentAndCleanup: function (cleanup) {
        cc.log(cc._LogInfos.Node_removeFromParentAndCleanup);
        this.removeFromParent(cleanup);
    },

    /** <p>Removes a child from the container. It will also cleanup all running actions depending on the cleanup parameter. </p>
     * If the cleanup parameter is not passed, it will force a cleanup. <br/>
     * <p> "remove" logic MUST only be on this method  <br/>
     * If a class wants to extend the 'removeChild' behavior it only needs <br/>
     * to override this method </p>
     * @function
     * @param {cc.Node} child  The child node which will be removed.
     * @param {Boolean|null} [cleanup=null]  true if all running actions and callbacks on the child node will be cleanup, false otherwise.
     */
    removeChild: function (child, cleanup) {
        // explicit nil handling
        if (this._children.length === 0)
            return;

        if (cleanup == null)
            cleanup = true;
        if (this._children.indexOf(child) > -1)
            this._detachChild(child, cleanup);

        this.setNodeDirty();
        cc.renderer.childrenOrderDirty = true;
    },

    /**
     * Removes a child from the container by tag value. It will also cleanup all running actions depending on the cleanup parameter.
     * If the cleanup parameter is not passed, it will force a cleanup. <br/>
     * @function
     * @param {Number} tag An integer number that identifies a child node
     * @param {Boolean} cleanup true if all running actions and callbacks on the child node will be cleanup, false otherwise.
     * @see cc.Node#removeChildByTag
     */
    removeChildByTag: function (tag, cleanup) {
        if (tag === cc.NODE_TAG_INVALID)
            cc.log(cc._LogInfos.Node_removeChildByTag);

        var child = this.getChildByTag(tag);
        if (child == null)
            cc.log(cc._LogInfos.Node_removeChildByTag_2, tag);
        else
            this.removeChild(child, cleanup);
    },

    /**
     * Removes all children from the container and do a cleanup all running actions depending on the cleanup parameter.
     * @param {Boolean | null } cleanup
     */
    removeAllChildrenWithCleanup: function (cleanup) {
        //cc.log(cc._LogInfos.Node_removeAllChildrenWithCleanup);        //TODO It should be discuss in v3.0
        this.removeAllChildren(cleanup);
    },

    /**
     * Removes all children from the container and do a cleanup all running actions depending on the cleanup parameter. <br/>
     * If the cleanup parameter is not passed, it will force a cleanup. <br/>
     * @function
     * @param {Boolean | null } cleanup true if all running actions on all children nodes should be cleanup, false otherwise.
     */
    removeAllChildren: function (cleanup) {
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
                    node.parent = null;
                }
            }
            this._children.length = 0;
        }
    },

    _detachChild: function (child, doCleanup) {
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
        child.parent = null;
        child._cachedParent = null;

        cc.arrayRemoveObject(this._children, child);
    },

    _insertChild: function (child, z) {
        cc.renderer.childrenOrderDirty = this._reorderChildDirty = true;
        this._children.push(child);
        child._setLocalZOrder(z);
    },

    /** Reorders a child according to a new z value. <br/>
     * The child MUST be already added.
     * @function
     * @param {cc.Node} child An already added child node. It MUST be already added.
     * @param {Number} zOrder Z order for drawing priority. Please refer to setZOrder(int)
     */
    reorderChild: function (child, zOrder) {
        cc.assert(child, cc._LogInfos.Node_reorderChild);
        cc.renderer.childrenOrderDirty = this._reorderChildDirty = true;
        child.arrivalOrder = cc.s_globalOrderOfArrival;
        cc.s_globalOrderOfArrival++;
        child._setLocalZOrder(zOrder);
        this.setNodeDirty();
    },

    /**
     * <p>
     *     Sorts the children array once before drawing, instead of every time when a child is added or reordered.    <br/>
     *     This approach can improves the performance massively.
     * </p>
     * @function
     * @note Don't call this manually unless a child added needs to be removed in the same frame
     */
    sortAllChildren: function () {
        if (this._reorderChildDirty) {
            var _children = this._children;

            // insertion sort
            var len = _children.length, i, j, tmp;
            for(i=1; i<len; i++){
                tmp = _children[i];
                j = i - 1;

                //continue moving element downwards while zOrder is smaller or when zOrder is the same but mutatedIndex is smaller
                while(j >= 0){
                    if(tmp._localZOrder < _children[j]._localZOrder){
                        _children[j+1] = _children[j];
                    }else if(tmp._localZOrder === _children[j]._localZOrder && tmp.arrivalOrder < _children[j].arrivalOrder){
                        _children[j+1] = _children[j];
                    }else{
                        break;
                    }
                    j--;
                }
                _children[j+1] = tmp;
            }

            //don't need to check children recursively, that's done in visit of each child
            this._reorderChildDirty = false;
        }
    },

    /**
     * Render function using the canvas 2d context or WebGL context, internal usage only, please do not call this function
     * @function
     * @param {CanvasRenderingContext2D | WebGLRenderingContext} ctx The render context
     */
    draw: function (ctx) {
        // override me
        // Only use- this function to draw your staff.
        // DON'T draw your stuff outside this method
    },

    // Internal use only, do not call it by yourself,
    transformAncestors: function () {
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
     *     If you override onEnter, you must call its parent's onEnter function with this._super().
     * </p>
     * @function
     */
    onEnter: function () {
        this._isTransitionFinished = false;
        this._running = true;//should be running before resumeSchedule
        this._arrayMakeObjectsPerformSelector(this._children, cc.Node._StateCallbackType.onEnter);
        this.resume();
    },

    /**
     * <p>
     *     Event callback that is invoked when the CCNode enters in the 'stage'.                                                        <br/>
     *     If the CCNode enters the 'stage' with a transition, this event is called when the transition finishes.                       <br/>
     *     If you override onEnterTransitionDidFinish, you shall call its parent's onEnterTransitionDidFinish with this._super()
     * </p>
     * @function
     */
    onEnterTransitionDidFinish: function () {
        this._isTransitionFinished = true;
        this._arrayMakeObjectsPerformSelector(this._children, cc.Node._StateCallbackType.onEnterTransitionDidFinish);
    },

    /**
     * <p>callback that is called every time the cc.Node leaves the 'stage'.  <br/>
     * If the cc.Node leaves the 'stage' with a transition, this callback is called when the transition starts. <br/>
     * If you override onExitTransitionDidStart, you shall call its parent's onExitTransitionDidStart with this._super()</p>
     * @function
     */
    onExitTransitionDidStart: function () {
        this._arrayMakeObjectsPerformSelector(this._children, cc.Node._StateCallbackType.onExitTransitionDidStart);
    },

    /**
     * <p>
     * callback that is called every time the cc.Node leaves the 'stage'.                                         <br/>
     * If the cc.Node leaves the 'stage' with a transition, this callback is called when the transition finishes. <br/>
     * During onExit you can't access a sibling node.                                                             <br/>
     * If you override onExit, you shall call its parent's onExit with this._super().
     * </p>
     * @function
     */
    onExit: function () {
        this._running = false;
        this.pause();
        this._arrayMakeObjectsPerformSelector(this._children, cc.Node._StateCallbackType.onExit);
        this.removeAllComponents();
    },

    // actions
    /**
     * Executes an action, and returns the action that is executed.<br/>
     * The node becomes the action's target. Refer to cc.Action's getTarget()
     * @function
     * @warning Starting from v0.8 actions don't retain their target anymore.
     * @param {cc.Action} action
     * @return {cc.Action} An Action pointer
     */
    runAction: function (action) {

        cc.assert(action, cc._LogInfos.Node_runAction);

        this.actionManager.addAction(action, this, !this._running);
        return action;
    },

    /**
     * Stops and removes all actions from the running action list .
     * @function
     */
    stopAllActions: function () {
        this.actionManager && this.actionManager.removeAllActionsFromTarget(this);
    },

    /**
     * Stops and removes an action from the running action list.
     * @function
     * @param {cc.Action} action An action object to be removed.
     */
    stopAction: function (action) {
        this.actionManager.removeAction(action);
    },

    /**
     * Removes an action from the running action list by its tag.
     * @function
     * @param {Number} tag A tag that indicates the action to be removed.
     */
    stopActionByTag: function (tag) {
        if (tag === cc.ACTION_TAG_INVALID) {
            cc.log(cc._LogInfos.Node_stopActionByTag);
            return;
        }
        this.actionManager.removeActionByTag(tag, this);
    },

    /**
     * Returns an action from the running action list by its tag.
     * @function
     * @see cc.Node#getTag and cc.Node#setTag
     * @param {Number} tag
     * @return {cc.Action} The action object with the given tag.
     */
    getActionByTag: function (tag) {
        if (tag === cc.ACTION_TAG_INVALID) {
            cc.log(cc._LogInfos.Node_getActionByTag);
            return null;
        }
        return this.actionManager.getActionByTag(tag, this);
    },

    /** <p>Returns the numbers of actions that are running plus the ones that are schedule to run (actions in actionsToAdd and actions arrays).<br/>
     *    Composable actions are counted as 1 action. Example:<br/>
     *    If you are running 1 Sequence of 7 actions, it will return 1. <br/>
     *    If you are running 7 Sequences of 2 actions, it will return 7.</p>
     * @function
     * @return {Number} The number of actions that are running plus the ones that are schedule to run
     */
    getNumberOfRunningActions: function () {
        return this.actionManager.numberOfRunningActionsInTarget(this);
    },

    // cc.Node - Callbacks
    // timers
    /**
     * <p>schedules the "update" method.                                                                           <br/>
     * It will use the order number 0. This method will be called every frame.                                  <br/>
     * Scheduled methods with a lower order value will be called before the ones that have a higher order value.<br/>
     * Only one "update" method could be scheduled per node.</p>
     * @function
     */
    scheduleUpdate: function () {
        this.scheduleUpdateWithPriority(0);
    },

    /**
     * <p>
     * schedules the "update" callback function with a custom priority.
     * This callback function will be called every frame.<br/>
     * Scheduled callback functions with a lower priority will be called before the ones that have a higher value.<br/>
     * Only one "update" callback function could be scheduled per node (You can't have 2 'update' callback functions).<br/>
     * </p>
     * @function
     * @param {Number} priority
     */
    scheduleUpdateWithPriority: function (priority) {
        this.scheduler.scheduleUpdateForTarget(this, priority, !this._running);
    },

    /**
     * Unschedules the "update" method.
     * @function
     * @see cc.Node#scheduleUpdate
     */
    unscheduleUpdate: function () {
        this.scheduler.unscheduleUpdateForTarget(this);
    },

    /**
     * <p>Schedules a custom selector.         <br/>
     * If the selector is already scheduled, then the interval parameter will be updated without scheduling it again.</p>
     * @function
     * @param {function} callback_fn A function wrapped as a selector
     * @param {Number} interval  Tick interval in seconds. 0 means tick every frame. If interval = 0, it's recommended to use scheduleUpdate() instead.
     * @param {Number} repeat    The selector will be executed (repeat + 1) times, you can use kCCRepeatForever for tick infinitely.
     * @param {Number} delay     The amount of time that the first tick will wait before execution.
     */
    schedule: function (callback_fn, interval, repeat, delay) {
        interval = interval || 0;

        cc.assert(callback_fn, cc._LogInfos.Node_schedule);

        cc.assert(interval >= 0, cc._LogInfos.Node_schedule_2);

        repeat = (repeat == null) ? cc.REPEAT_FOREVER : repeat;
        delay = delay || 0;

        this.scheduler.scheduleCallbackForTarget(this, callback_fn, interval, repeat, delay, !this._running);
    },

    /**
     * Schedules a callback function that runs only once, with a delay of 0 or larger
     * @function
     * @see cc.Node#schedule
     * @param {function} callback_fn  A function wrapped as a selector
     * @param {Number} delay  The amount of time that the first tick will wait before execution.
     */
    scheduleOnce: function (callback_fn, delay) {
        this.schedule(callback_fn, 0.0, 0, delay);
    },

    /**
     * unschedules a custom callback function.
     * @function
     * @see cc.Node#schedule
     * @param {function} callback_fn  A function wrapped as a selector
     */
    unschedule: function (callback_fn) {
        // explicit nil handling
        if (!callback_fn)
            return;

        this.scheduler.unscheduleCallbackForTarget(this, callback_fn);
    },

    /**
     * <p>unschedule all scheduled callback functions: custom callback functions, and the 'update' callback function.<br/>
     * Actions are not affected by this method.</p>
     * @function
     */
    unscheduleAllCallbacks: function () {
        this.scheduler.unscheduleAllCallbacksForTarget(this);
    },

    /**
     * Resumes all scheduled selectors and actions.<br/>
     * This method is called internally by onEnter
     * @function
     * @deprecated since v3.0, please use resume() instead
     */
    resumeSchedulerAndActions: function () {
        cc.log(cc._LogInfos.Node_resumeSchedulerAndActions);
        this.resume();
    },

    /**
     * <p>Resumes all scheduled selectors and actions.<br/>
     * This method is called internally by onEnter</p>
     */
    resume: function () {
        this.scheduler.resumeTarget(this);
        this.actionManager && this.actionManager.resumeTarget(this);
        cc.eventManager.resumeTarget(this);
    },

    /**
     * <p>Pauses all scheduled selectors and actions.<br/>
     * This method is called internally by onExit</p>
     * @deprecated since v3.0, please use pause instead
     * @function
     */
    pauseSchedulerAndActions: function () {
        cc.log(cc._LogInfos.Node_pauseSchedulerAndActions);
        this.pause();
    },

    /**
     * <p>Pauses all scheduled selectors and actions.<br/>
     * This method is called internally by onExit</p>
     * @function
     */
    pause: function () {
        this.scheduler.pauseTarget(this);
        this.actionManager && this.actionManager.pauseTarget(this);
        cc.eventManager.pauseTarget(this);
    },

    /**
     *<p>Sets the additional transform.<br/>
     *  The additional transform will be concatenated at the end of getNodeToParentTransform.<br/>
     *  It could be used to simulate `parent-child` relationship between two nodes (e.g. one is in BatchNode, another isn't).<br/>
     *  </p>
     *  @function
     *  @param {cc.AffineTransform} additionalTransform  The additional transform
     *  @example
     * // create a batchNode
     * var batch = new cc.SpriteBatchNode("Icon-114.png");
     * this.addChild(batch);
     *
     * // create two sprites, spriteA will be added to batchNode, they are using different textures.
     * var spriteA = new cc.Sprite(batch->getTexture());
     * var spriteB = new cc.Sprite("Icon-72.png");
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
     * var t = spriteA.getNodeToParentTransform();
     *
     * // Sets the additional transform to spriteB, spriteB's position will based on its pseudo parent i.e. spriteA.
     * spriteB.setAdditionalTransform(t);
     *
     * //scale
     * spriteA.setScale(2);
     *
     * // Gets the spriteA's transform.
     * t = spriteA.getNodeToParentTransform();
     *
     * // Sets the additional transform to spriteB, spriteB's scale will based on its pseudo parent i.e. spriteA.
     * spriteB.setAdditionalTransform(t);
     *
     * //rotation
     * spriteA.setRotation(20);
     *
     * // Gets the spriteA's transform.
     * t = spriteA.getNodeToParentTransform();
     *
     * // Sets the additional transform to spriteB, spriteB's rotation will based on its pseudo parent i.e. spriteA.
     * spriteB.setAdditionalTransform(t);
     */
    setAdditionalTransform: function (additionalTransform) {
        this._additionalTransform = additionalTransform;
        this._transformDirty = true;
        this._additionalTransformDirty = true;
    },

    /**
     * Returns the matrix that transform parent's space coordinates to the node's (local) space coordinates.<br/>
     * The matrix is in Pixels.
     * @function
     * @return {cc.AffineTransform}
     */
    getParentToNodeTransform: function () {
        if (this._inverseDirty) {
            this._inverse = cc.affineTransformInvert(this.getNodeToParentTransform());
            this._inverseDirty = false;
        }
        return this._inverse;
    },

    /**
     * @function
     * @deprecated since v3.0, please use getParentToNodeTransform instead
     */
    parentToNodeTransform: function () {
        return this.getParentToNodeTransform();
    },

    /**
     * Returns the world affine transform matrix. The matrix is in Pixels.
     * @function
     * @return {cc.AffineTransform}
     */
    getNodeToWorldTransform: function () {
        var t = this.getNodeToParentTransform();
        for (var p = this._parent; p != null; p = p.parent)
            t = cc.affineTransformConcat(t, p.getNodeToParentTransform());
        return t;
    },

    /**
     * @function
     * @deprecated since v3.0, please use getNodeToWorldTransform instead
     */
    nodeToWorldTransform: function(){
        return this.getNodeToWorldTransform();
    },

    /**
     * Returns the inverse world affine transform matrix. The matrix is in Pixels.
     * @function
     * @return {cc.AffineTransform}
     */
    getWorldToNodeTransform: function () {
        return cc.affineTransformInvert(this.getNodeToWorldTransform());
    },

    /**
     * @function
     * @deprecated since v3.0, please use getWorldToNodeTransform instead
     */
    worldToNodeTransform: function () {
        return this.getWorldToNodeTransform();
    },

    /**
     * Converts a Point to node (local) space coordinates. The result is in Points.
     * @function
     * @param {cc.Point} worldPoint
     * @return {cc.Point}
     */
    convertToNodeSpace: function (worldPoint) {
        return cc.pointApplyAffineTransform(worldPoint, this.getWorldToNodeTransform());
    },

    /**
     * Converts a Point to world space coordinates. The result is in Points.
     * @function
     * @param {cc.Point} nodePoint
     * @return {cc.Point}
     */
    convertToWorldSpace: function (nodePoint) {
        nodePoint = nodePoint || cc.p(0,0);
        return cc.pointApplyAffineTransform(nodePoint, this.getNodeToWorldTransform());
    },

    /**
     * Converts a Point to node (local) space coordinates. The result is in Points.<br/>
     * treating the returned/received node point as anchor relative.
     * @function
     * @param {cc.Point} worldPoint
     * @return {cc.Point}
     */
    convertToNodeSpaceAR: function (worldPoint) {
        return cc.pSub(this.convertToNodeSpace(worldPoint), this._anchorPointInPoints);
    },

    /**
     * Converts a local Point to world space coordinates.The result is in Points.<br/>
     * treating the returned/received node point as anchor relative.
     * @function
     * @param {cc.Point} nodePoint
     * @return {cc.Point}
     */
    convertToWorldSpaceAR: function (nodePoint) {
        nodePoint = nodePoint || cc.p(0,0);
        var pt = cc.pAdd(nodePoint, this._anchorPointInPoints);
        return this.convertToWorldSpace(pt);
    },

    _convertToWindowSpace: function (nodePoint) {
        var worldPoint = this.convertToWorldSpace(nodePoint);
        return cc.director.convertToUI(worldPoint);
    },

    /** convenience methods which take a cc.Touch instead of cc.Point
     * @function
     * @param {cc.Touch} touch The touch object
     * @return {cc.Point}
     */
    convertTouchToNodeSpace: function (touch) {
        var point = touch.getLocation();
        //TODO This point needn't convert to GL in HTML5
        //point = cc.director.convertToGL(point);
        return this.convertToNodeSpace(point);
    },

    /**
     * converts a cc.Touch (world coordinates) into a local coordiante. This method is AR (Anchor Relative).
     * @function
     * @param {cc.Touch} touch The touch object
     * @return {cc.Point}
     */
    convertTouchToNodeSpaceAR: function (touch) {
        var point = touch.getLocation();
        point = cc.director.convertToGL(point);
        return this.convertToNodeSpaceAR(point);
    },

    /**
     * Update will be called automatically every frame if "scheduleUpdate" is called when the node is "live".<br/>
     * The default behavior is to invoke the visit function of node's componentContainer.<br/>
     * Override me to implement your own update logic.
     * @function
     * @param {Number} dt Delta time since last update
     */
    update: function (dt) {
        if (this._componentContainer && !this._componentContainer.isEmpty())
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
     * @function
     */
    updateTransform: function () {
        // Recursively iterate over children
        this._arrayMakeObjectsPerformSelector(this._children, cc.Node._StateCallbackType.updateTransform);
    },

    /**
     * <p>Currently JavaScript Bindings (JSB), in some cases, needs to use retain and release. This is a bug in JSB,
     * and the ugly workaround is to use retain/release. So, these 2 methods were added to be compatible with JSB.
     * This is a hack, and should be removed once JSB fixes the retain/release bug<br/>
     * You will need to retain an object if you created an engine object and haven't added it into the scene graph during the same frame.<br/>
     * Otherwise, JSB's native autorelease pool will consider this object a useless one and release it directly,<br/>
     * when you want to use it later, a "Invalid Native Object" error will be raised.<br/>
     * The retain function can increase a reference count for the native object to avoid it being released,<br/>
     * you need to manually invoke release function when you think this object is no longer needed, otherwise, there will be memory learks.<br/>
     * retain and release function call should be paired in developer's game code.</p>
     * @function
     * @see cc.Node#release
     */
    retain: function () {
    },
    /**
     * <p>Currently JavaScript Bindings (JSB), in some cases, needs to use retain and release. This is a bug in JSB,
     * and the ugly workaround is to use retain/release. So, these 2 methods were added to be compatible with JSB.
     * This is a hack, and should be removed once JSB fixes the retain/release bug<br/>
     * You will need to retain an object if you created an engine object and haven't added it into the scene graph during the same frame.<br/>
     * Otherwise, JSB's native autorelease pool will consider this object a useless one and release it directly,<br/>
     * when you want to use it later, a "Invalid Native Object" error will be raised.<br/>
     * The retain function can increase a reference count for the native object to avoid it being released,<br/>
     * you need to manually invoke release function when you think this object is no longer needed, otherwise, there will be memory learks.<br/>
     * retain and release function call should be paired in developer's game code.</p>
     * @function
     * @see cc.Node#retain
     */
    release: function () {
    },

    /**
     * Returns a component identified by the name given.
     * @function
     * @param {String} name The name to search for
     * @return {cc.Component} The component found
     */
    getComponent: function (name) {
        if(this._componentContainer)
            return this._componentContainer.getComponent(name);
        return null;
    },

    /**
     * Adds a component to the node's component container.
     * @function
     * @param {cc.Component} component
     */
    addComponent: function (component) {
        if(this._componentContainer)
            this._componentContainer.add(component);
    },

    /**
     * Removes a component identified by the given name or removes the component object given
     * @function
     * @param {String|cc.Component} component
     */
    removeComponent: function (component) {
        if(this._componentContainer)
            return this._componentContainer.remove(component);
        return false;
    },

    /**
     * Removes all components of cc.Node, it called when cc.Node is exiting from stage.
     * @function
     */
    removeAllComponents: function () {
        if(this._componentContainer)
            this._componentContainer.removeAll();
    },

    grid: null,

    /**
     * Constructor function, override it to extend the construction behavior, remember to call "this._super()" in the extended "ctor" function.
     * @function
     */
    ctor: null,

    /**
     * Recursive method that visit its children and draw them
     * @function
     * @param {CanvasRenderingContext2D|WebGLRenderingContext} ctx
     */
    visit: null,

    /**
     * Performs view-matrix transformation based on position, scale, rotation and other attributes.
     * @function
     * @param {CanvasRenderingContext2D|WebGLRenderingContext} ctx Render context
     */
    transform: null,

    /**
     * <p>Returns the matrix that transform the node's (local) space coordinates into the parent's space coordinates.<br/>
     * The matrix is in Pixels.</p>
     * @function
     * @return {cc.AffineTransform}
     * @deprecated since v3.0, please use getNodeToParentTransform instead
     */
    nodeToParentTransform: function(){
        return this.getNodeToParentTransform();
    },

    /**
     * Returns the matrix that transform the node's (local) space coordinates into the parent's space coordinates.<br/>
     * The matrix is in Pixels.
     * @function
     * @return {cc.AffineTransform} The affine transform object
     */
    getNodeToParentTransform: null,

    _setNodeDirtyForCache: function () {
        if (this._cacheDirty === false) {
            this._cacheDirty = true;

            var cachedP = this._cachedParent;
            //var cachedP = this._parent;
            cachedP && cachedP != this && cachedP._setNodeDirtyForCache();
        }
    },

    _setCachedParent: function(cachedParent){
        if(this._cachedParent ==  cachedParent)
            return;

        this._cachedParent = cachedParent;
        var children = this._children;
        for(var i = 0, len = children.length; i < len; i++)
            children[i]._setCachedParent(cachedParent);
    },

    /**
     * Returns a camera object that lets you move the node using a gluLookAt
     * @function
     * @return {cc.Camera} A CCCamera object that lets you move the node using a gluLookAt
     * @deprecated since v3.0, no alternative function
     * @example
     * var camera = node.getCamera();
     * camera.setEye(0, 0, 415/2);
     * camera.setCenter(0, 0, 0);
     */
    getCamera: function () {
        if (!this._camera) {
            this._camera = new cc.Camera();
        }
        return this._camera;
    },

    /**
     * <p>Returns a grid object that is used when applying effects.<br/>
     * This function have been deprecated, please use cc.NodeGrid to run grid actions</p>
     * @function
     * @return {cc.GridBase} A CCGrid object that is used when applying effects
     * @deprecated since v3.0, no alternative function
     */
    getGrid: function () {
        return this.grid;
    },

    /**
     * <p>Changes a grid object that is used when applying effects<br/>
     * This function have been deprecated, please use cc.NodeGrid to run grid actions</p>
     * @function
     * @param {cc.GridBase} grid A CCGrid object that is used when applying effects
     * @deprecated since v3.0, no alternative function
     */
    setGrid: function (grid) {
        this.grid = grid;
    },

    /**
     * Return the shader program currently used for this node
     * @function
     * @return {cc.GLProgram} The shader program currently used for this node
     */
    getShaderProgram: function () {
        return this._shaderProgram;
    },

    /**
     * <p>
     *     Sets the shader program for this node
     *
     *     Since v2.0, each rendering node must set its shader program.
     *     It should be set in initialize phase.
     * </p>
     * @function
     * @param {cc.GLProgram} newShaderProgram The shader program which fetchs from CCShaderCache.
     * @example
     * node.setGLProgram(cc.shaderCache.programForKey(cc.SHADER_POSITION_TEXTURECOLOR));
     */
    setShaderProgram: function (newShaderProgram) {
        this._shaderProgram = newShaderProgram;
    },

    /**
     * Returns the state of OpenGL server side.
     * @function
     * @return {Number} The state of OpenGL server side.
     * @deprecated since v3.0, no need anymore
     */
    getGLServerState: function () {
        return this._glServerState;
    },

    /**
     * Sets the state of OpenGL server side.
     * @function
     * @param {Number} state The state of OpenGL server side.
     * @deprecated since v3.0, no need anymore
     */
    setGLServerState: function (state) {
        this._glServerState = state;
    },

    /**
     * Returns a "world" axis aligned bounding box of the node.
     * @function
     * @return {cc.Rect}
     */
    getBoundingBoxToWorld: function () {
        var rect = cc.rect(0, 0, this._contentSize.width, this._contentSize.height);
        var trans = this.getNodeToWorldTransform();
        rect = cc.rectApplyAffineTransform(rect, this.getNodeToWorldTransform());

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
        var rect = cc.rect(0, 0, this._contentSize.width, this._contentSize.height);
        var trans = (parentTransform == null) ? this.getNodeToParentTransform() : cc.affineTransformConcat(this.getNodeToParentTransform(), parentTransform);
        rect = cc.rectApplyAffineTransform(rect, trans);

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

    _getNodeToParentTransformForWebGL: function () {
        var _t = this;
        if(_t._usingNormalizedPosition && _t._parent){        //TODO need refactor
            var conSize = _t._parent._contentSize;
            _t._position.x = _t._normalizedPosition.x * conSize.width;
            _t._position.y = _t._normalizedPosition.y * conSize.height;
            _t._normalizedPositionDirty = false;
        }
        if (_t._transformDirty) {
            // Translate values
            var x = _t._position.x;
            var y = _t._position.y;
            var apx = _t._anchorPointInPoints.x, napx = -apx;
            var apy = _t._anchorPointInPoints.y, napy = -apy;
            var scx = _t._scaleX, scy = _t._scaleY;

            if (_t._ignoreAnchorPointForPosition) {
                x += apx;
                y += apy;
            }

            // Rotation values
            // Change rotation code to handle X and Y
            // If we skew with the exact same value for both x and y then we're simply just rotating
            var cx = 1, sx = 0, cy = 1, sy = 0;
            if (_t._rotationX !== 0 || _t._rotationY !== 0) {
                cx = Math.cos(-_t._rotationRadiansX);
                sx = Math.sin(-_t._rotationRadiansX);
                cy = Math.cos(-_t._rotationRadiansY);
                sy = Math.sin(-_t._rotationRadiansY);
            }
            var needsSkewMatrix = ( _t._skewX || _t._skewY );

            // optimization:
            // inline anchor point calculation if skew is not needed
            // Adjusted transform calculation for rotational skew
            if (!needsSkewMatrix && (apx !== 0 || apy !== 0)) {
                x += cy * napx * scx + -sx * napy * scy;
                y += sy * napx * scx + cx * napy * scy;
            }

            // Build Transform Matrix
            // Adjusted transform calculation for rotational skew
            var t = _t._transform;
            t.a = cy * scx;
            t.b = sy * scx;
            t.c = -sx * scy;
            t.d = cx * scy;
            t.tx = x;
            t.ty = y;

            // XXX: Try to inline skew
            // If skew is needed, apply skew and then anchor point
            if (needsSkewMatrix) {
                t = cc.affineTransformConcat({a: 1.0, b: Math.tan(cc.degreesToRadians(_t._skewY)),
                    c: Math.tan(cc.degreesToRadians(_t._skewX)), d: 1.0, tx: 0.0, ty: 0.0}, t);

                // adjust anchor point
                if (apx !== 0 || apy !== 0)
                    t = cc.affineTransformTranslate(t, napx, napy);
            }

            if (_t._additionalTransformDirty) {
                t = cc.affineTransformConcat(t, _t._additionalTransform);
                _t._additionalTransformDirty = false;
            }
            _t._transform = t;
            _t._transformDirty = false;
        }
        return _t._transform;
    },

    _updateColor: function(){
        //TODO
    },

    /**
     * Returns the opacity of Node
     * @function
     * @returns {number} opacity
     */
    getOpacity: function () {
        return this._realOpacity;
    },

    /**
     * Returns the displayed opacity of Node,
     * the difference between displayed opacity and opacity is that displayed opacity is calculated based on opacity and parent node's opacity when cascade opacity enabled.
     * @function
     * @returns {number} displayed opacity
     */
    getDisplayedOpacity: function () {
        return this._displayedOpacity;
    },

    /**
     * Sets the opacity of Node
     * @function
     * @param {Number} opacity
     */
    setOpacity: function (opacity) {
        this._displayedOpacity = this._realOpacity = opacity;

        var parentOpacity = 255, locParent = this._parent;
        if (locParent && locParent.cascadeOpacity)
            parentOpacity = locParent.getDisplayedOpacity();
        this.updateDisplayedOpacity(parentOpacity);

        this._displayedColor.a = this._realColor.a = opacity;
    },

    /**
     * Update displayed opacity
     * @function
     * @param {Number} parentOpacity
     */
    updateDisplayedOpacity: function (parentOpacity) {
        this._displayedOpacity = this._realOpacity * parentOpacity / 255.0;
        if(this._rendererCmd && this._rendererCmd._opacity !== undefined)
            this._rendererCmd._opacity = this._displayedOpacity / 255;
        if (this._cascadeOpacityEnabled) {
            var selChildren = this._children;
            for (var i = 0; i < selChildren.length; i++) {
                var item = selChildren[i];
                if (item)
                    item.updateDisplayedOpacity(this._displayedOpacity);
            }
        }
    },

    /**
     * Returns whether node's opacity value affect its child nodes.
     * @function
     * @returns {boolean}
     */
    isCascadeOpacityEnabled: function () {
        return this._cascadeOpacityEnabled;
    },

    /**
     * Enable or disable cascade opacity, if cascade enabled, child nodes' opacity will be the multiplication of parent opacity and its own opacity.
     * @function
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
        if (locParent && locParent.cascadeOpacity)
            parentOpacity = locParent.getDisplayedOpacity();
        this.updateDisplayedOpacity(parentOpacity);
    },

    _disableCascadeOpacity: function () {
        this._displayedOpacity = this._realOpacity;

        var selChildren = this._children;
        for (var i = 0; i < selChildren.length; i++) {
            var item = selChildren[i];
            if (item)
                item.updateDisplayedOpacity(255);
        }
    },

    /**
     * Returns the color of Node
     * @function
     * @returns {cc.Color}
     */
    getColor: function () {
        var locRealColor = this._realColor;
        return cc.color(locRealColor.r, locRealColor.g, locRealColor.b, locRealColor.a);
    },

    /**
     * Returns the displayed color of Node,
     * the difference between displayed color and color is that displayed color is calculated based on color and parent node's color when cascade color enabled.
     * @function
     * @returns {cc.Color}
     */
    getDisplayedColor: function () {
        var tmpColor = this._displayedColor;
        return cc.color(tmpColor.r, tmpColor.g, tmpColor.b, tmpColor.a);
    },

    /**
     * <p>Sets the color of Node.<br/>
     * When color doesn't include opacity value like cc.color(128,128,128), this function only change the color. <br/>
     * When color include opacity like cc.color(128,128,128,100), then this function will change the color and the opacity.</p>
     * @function
     * @param {cc.Color} color The new color given
     */
    setColor: function (color) {
        var locDisplayedColor = this._displayedColor, locRealColor = this._realColor;
        locDisplayedColor.r = locRealColor.r = color.r;
        locDisplayedColor.g = locRealColor.g = color.g;
        locDisplayedColor.b = locRealColor.b = color.b;

        var parentColor, locParent = this._parent;
        if (locParent && locParent.cascadeColor)
            parentColor = locParent.getDisplayedColor();
        else
            parentColor = cc.color.WHITE;
        this.updateDisplayedColor(parentColor);

        /*if (color.a !== undefined && !color.a_undefined) {              //setColor doesn't support changing opacity, please use setOpacity
            this.setOpacity(color.a);
        }*/
    },

    /**
     * Update the displayed color of Node
     * @function
     * @param {cc.Color} parentColor
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
                if (item)
                    item.updateDisplayedColor(locDispColor);
            }
        }
    },

    /**
     * Returns whether node's color value affect its child nodes.
     * @function
     * @returns {boolean}
     */
    isCascadeColorEnabled: function () {
        return this._cascadeColorEnabled;
    },

    /**
     * Enable or disable cascade color, if cascade enabled, child nodes' opacity will be the cascade value of parent color and its own color.
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
        if (locParent && locParent.cascadeColor)
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

        var selChildren = this._children, whiteColor = cc.color.WHITE;
        for (var i = 0; i < selChildren.length; i++) {
            var item = selChildren[i];
            if (item)
                item.updateDisplayedColor(whiteColor);
        }
    },

    /**
     * Set whether color should be changed with the opacity value,
     * useless in cc.Node, but this function is override in some class to have such behavior.
     * @function
     * @param {Boolean} opacityValue
     */
    setOpacityModifyRGB: function (opacityValue) {
    },

    /**
     * Get whether color should be changed with the opacity value
     * @function
     * @return {Boolean}
     */
    isOpacityModifyRGB: function () {
        return false;
    },

    _initRendererCmd: function(){
    },

    _transformForRenderer: null
});

/**
 * Allocates and initializes a node.
 * @deprecated since v3.0, please use new construction instead.
 * @see cc.Node
 * @return {cc.Node}
 */
cc.Node.create = function () {
    return new cc.Node();
};

cc.Node._StateCallbackType = {onEnter: 1, onExit: 2, cleanup: 3, onEnterTransitionDidFinish: 4, updateTransform: 5, onExitTransitionDidStart: 6, sortAllChildren: 7};

if (cc._renderType === cc._RENDER_TYPE_CANVAS) {
    //redefine cc.Node
    var _p = cc.Node.prototype;
    _p.ctor = function () {
        this._initNode();
        this._initRendererCmd();
    };

    _p.setNodeDirty = function () {
        var _t = this;
        if(_t._transformDirty === false){
            _t._setNodeDirtyForCache();
            _t._renderCmdDiry = _t._transformDirty = _t._inverseDirty = true;
            cc.renderer.pushDirtyNode(this);
        }
    };

    _p.visit = function (ctx) {
        var _t = this;
        // quick return if not visible
        if (!_t._visible)
            return;

        if( _t._parent)
            _t._curLevel = _t._parent._curLevel + 1;

        //visit for canvas
        var i, children = _t._children, child;
        _t.transform();
        var len = children.length;
        if (len > 0) {
            _t.sortAllChildren();
            // draw children zOrder < 0
            for (i = 0; i < len; i++) {
                child = children[i];
                if (child._localZOrder < 0)
                    child.visit();
                else
                    break;
            }
            //_t.draw(context);
            if(this._rendererCmd)
                cc.renderer.pushRenderCommand(this._rendererCmd);
            for (; i < len; i++) {
                children[i].visit();
            }
        } else{
            if(this._rendererCmd)
                cc.renderer.pushRenderCommand(this._rendererCmd);
        }
        this._cacheDirty = false;
    };

    _p._transformForRenderer = function () {
        var t = this.nodeToParentTransform(), worldT = this._transformWorld;
        if(this._parent){
            var pt = this._parent._transformWorld;
            //worldT = cc.AffineTransformConcat(t, pt);
            worldT.a = t.a * pt.a + t.b * pt.c;                               //a
            worldT.b = t.a * pt.b + t.b * pt.d;                               //b
            worldT.c = t.c * pt.a + t.d * pt.c;                               //c
            worldT.d = t.c * pt.b + t.d * pt.d;                               //d
            if(!this._skewX || this._skewY){
                var plt = this._parent._transform;
                var xOffset = -(plt.b + plt.c) * t.ty ;
                var yOffset = -(plt.b + plt.c) * t.tx;
                worldT.tx = (t.tx * pt.a + t.ty * pt.c + pt.tx + xOffset);        //tx
                worldT.ty = (t.tx * pt.b + t.ty * pt.d + pt.ty + yOffset);		  //ty
            }else{
                worldT.tx = (t.tx * pt.a + t.ty * pt.c + pt.tx);          //tx
                worldT.ty = (t.tx * pt.b + t.ty * pt.d + pt.ty);		  //ty
            }
        } else {
            worldT.a = t.a;
            worldT.b = t.b;
            worldT.c = t.c;
            worldT.d = t.d;
            worldT.tx = t.tx;
            worldT.ty = t.ty;
        }
        this._renderCmdDiry = false;
        if(!this._children || this._children.length === 0)
            return;
        var i, len, locChildren = this._children;
        for(i = 0, len = locChildren.length; i< len; i++){
            locChildren[i]._transformForRenderer();
        }
    };

    _p.transform = function (ctx) {
        // transform for canvas
        var t = this.getNodeToParentTransform(),
            worldT = this._transformWorld;         //get the world transform

        if(this._parent){
            var pt = this._parent._transformWorld;
            // cc.AffineTransformConcat is incorrect at get world transform
            worldT.a = t.a * pt.a + t.b * pt.c;                               //a
            worldT.b = t.a * pt.b + t.b * pt.d;                               //b
            worldT.c = t.c * pt.a + t.d * pt.c;                               //c
            worldT.d = t.c * pt.b + t.d * pt.d;                               //d

            var plt = this._parent._transform;
            var xOffset = -(plt.b + plt.c) * t.ty;
            var yOffset = -(plt.b + plt.c) * t.tx;
            worldT.tx = (t.tx * pt.a + t.ty * pt.c + pt.tx + xOffset);        //tx
            worldT.ty = (t.tx * pt.b + t.ty * pt.d + pt.ty + yOffset);		  //ty
        } else {
            worldT.a = t.a;
            worldT.b = t.b;
            worldT.c = t.c;
            worldT.d = t.d;
            worldT.tx = t.tx;
            worldT.ty = t.ty;
        }
    };

    _p.getNodeToParentTransform = function () {
        var _t = this;
        if(_t._usingNormalizedPosition && _t._parent){        //TODO need refactor
            var conSize = _t._parent._contentSize;
            _t._position.x = _t._normalizedPosition.x * conSize.width;
            _t._position.y = _t._normalizedPosition.y * conSize.height;
            _t._normalizedPositionDirty = false;
        }
        if (_t._transformDirty) {
            var t = _t._transform;// quick reference

            // base position
            t.tx = _t._position.x;
            t.ty = _t._position.y;

            // rotation Cos and Sin
            var Cos = 1, Sin = 0;
            if (_t._rotationX) {
                Cos = Math.cos(_t._rotationRadiansX);
                Sin = Math.sin(_t._rotationRadiansX);
            }

            // base abcd
            t.a = t.d = Cos;
            t.b = -Sin;
            t.c = Sin;

            var lScaleX = _t._scaleX, lScaleY = _t._scaleY;
            var appX = _t._anchorPointInPoints.x, appY = _t._anchorPointInPoints.y;

            // Firefox on Vista and XP crashes
            // GPU thread in case of scale(0.0, 0.0)
            var sx = (lScaleX < 0.000001 && lScaleX > -0.000001) ? 0.000001 : lScaleX,
                sy = (lScaleY < 0.000001 && lScaleY > -0.000001) ? 0.000001 : lScaleY;

            // skew
            if (_t._skewX || _t._skewY) {
                // offset the anchorpoint
                var skx = Math.tan(-_t._skewX * Math.PI / 180);
                var sky = Math.tan(-_t._skewY * Math.PI / 180);
                if(skx === Infinity){
                    skx = 99999999;
                }
                if(sky === Infinity){
                    sky = 99999999;
                }
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
            if (_t._ignoreAnchorPointForPosition) {
                t.tx += appX;
                t.ty += appY;
            }

            if (_t._additionalTransformDirty) {
                _t._transform = cc.affineTransformConcat(t, _t._additionalTransform);
                _t._additionalTransformDirty = false;
            }

            _t._transformDirty = false;
        }
        return _t._transform;
    };

    _p = null;

} else {
    cc.assert(cc.isFunction(cc._tmp.WebGLCCNode), cc._LogInfos.MissingFile, "BaseNodesWebGL.js");
    cc._tmp.WebGLCCNode();
    delete cc._tmp.WebGLCCNode;
}
cc.assert(cc.isFunction(cc._tmp.PrototypeCCNode), cc._LogInfos.MissingFile, "BaseNodesPropertyDefine.js");
cc._tmp.PrototypeCCNode();
delete cc._tmp.PrototypeCCNode;