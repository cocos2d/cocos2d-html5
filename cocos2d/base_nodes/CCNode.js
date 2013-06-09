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



//cc.NodeBase = cc.Class.extend(/** @lends cc.Node# */{

/** <p>cc.Node is the main element. Anything thats gets drawn or contains things that get drawn is a cc.Node.<br/>
 The most popular cc.Nodes are: cc.Scene, cc.Layer, cc.Sprite, cc.Menu. (WebGL implement)<br/></p>

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
 - cc.Camera (an interface to gluLookAt ) <br/>
 - cc.GridBase (to do mesh transformations)  <br/>
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
 -# The node will be moved according to the camera values (camera) <br/></p>

 <p>Order in transformations with grid enabled<br/>
 -# The node will be translated (position)<br/>
 -# The node will be rotated (rotation) <br/>
 -# The node will be scaled (scale) <br/>
 -# The grid will capture the screen <br/>
 -# The node will be moved according to the camera values (camera) <br/>
 -# The grid will render the captured screen <br/></P>

 <p>Camera:  <br/>
 - Each node has a camera. By default it points to the center of the cc.Node.</P>
 * @class
 * @extends cc.Class
 * @example
 * // example
 * cc.Sprite = cc.Node.extend({});
 * cc.Sprite.initWithImage = function(){
 * };
 */
cc.NodeWebGL = cc.Class.extend(/** @lends cc.NodeWebGL# */{
    /// ---- common properties start ----
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

    _initNode:function () {
        this._anchorPoint = cc.p(0, 0);
        this._anchorPointInPoints = cc.p(0, 0);
        this._contentSize = cc.size(0, 0);
        this._position = cc.p(0, 0);

        var director = cc.Director.getInstance();
        this._actionManager = director.getActionManager();
        this._scheduler = director.getScheduler();
        this._initializedNode = true;
        this._additionalTransform = cc.AffineTransformMakeIdentity();
        this._additionalTransformDirty = false;
    },

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

        var i, len = array.length;
        var nodeCallbackType = cc.Node.StateCallbackType;
        switch (callbackType) {
            case nodeCallbackType.onEnter:
                for (i = 0; i < len; i++) {
                    if (array[i])
                        array[i].onEnter();
                }
                break;
            case nodeCallbackType.onExit:
                for (i = 0; i < len; i++) {
                    if (array[i])
                        array[i].onExit();
                }
                break;
            case nodeCallbackType.onEnterTransitionDidFinish:
                for (i = 0; i < len; i++) {
                    if (array[i])
                        array[i].onEnterTransitionDidFinish();
                }
                break;
            case nodeCallbackType.cleanup:
                for (i = 0; i < len; i++) {
                    if (array[i])
                        array[i].cleanup();
                }
                break;
            case nodeCallbackType.updateTransform:
                for (i = 0; i < len; i++) {
                    if (array[i])
                        array[i].updateTransform();
                }
                break;
            case nodeCallbackType.onExitTransitionDidStart:
                for (i = 0; i < len; i++) {
                    if (array[i])
                        array[i].onExitTransitionDidStart();
                }
                break;
            case nodeCallbackType.sortAllChildren:
                for (i = 0; i < len; i++) {
                    if (array[i])
                        array[i].sortAllChildren();
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
    setNodeDirty:function () {
        this._transformDirty = this._inverseDirty = true;
    },

    /**
     *  <p>get the skew degrees in X </br>
     *  The X skew angle of the node in degrees.  <br/>
     *  This angle describes the shear distortion in the X direction.<br/>
     *  Thus, it is the angle between the Y axis and the left edge of the shape </br>
     *  The default skewX angle is 0. Positive values distort the node in a CW direction.</br>
     *  </p>
     * @return {Number}
     */
    getSkewX:function () {
        return this._skewX;
    },

    /**
     * set the skew degrees in X
     * @param {Number} newSkewX
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
     * @return {Number}
     */
    getSkewY:function () {
        return this._skewY;
    },

    /**
     * set the skew degrees in Y
     * @param {Number} newSkewY
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

    /** zOrder setter : private method
     * used internally to alter the zOrder variable. DON'T call this method manually
     * @param {Number} z
     * @private
     */
    _setZOrder:function (z) {
        this._zOrder = z;
    },

    setZOrder:function (z) {
        this._setZOrder(z);
        if (this._parent)
            this._parent.reorderChild(this, z);
    },

    /**
     * ertexZ getter
     * @return {Number}
     */
    getVertexZ:function () {
        return this._vertexZ;
    },

    /**
     * vertexZ setter
     * @param {Number} Var
     */
    setVertexZ:function (Var) {
        this._vertexZ = Var;
    },

    /**
     * The rotation (angle) of the node in degrees. 0 is the default rotation angle. Positive values rotate node CW.
     * @return {Number}
     */
    getRotation:function () {
        cc.Assert(this._rotationX == this._rotationY, "CCNode#rotation. RotationX != RotationY. Don't know which one to return");
        return this._rotationX;
    },

    _rotationRadiansX: 0,
    _rotationRadiansY: 0,
    /**
     * rotation setter
     * @param {Number} newRotation
     */
    setRotation: function (newRotation) {
        this._rotationX = this._rotationY = newRotation;
        this._rotationRadiansX = this._rotationX * (Math.PI / 180);
        this._rotationRadiansY = this._rotationY * (Math.PI / 180);

        this.setNodeDirty();
    },

    /**
     * The rotation (angle) of the node in degrees. 0 is the default rotation angle. <br/>
     * Positive values rotate node CW. It only modifies the X rotation performing a horizontal rotational skew .
     * (support only in WebGl rendering mode)
     * @return {Number}
     */
    getRotationX:function () {
        return this._rotationX;
    },

    /**
     * rotationX setter
     * @param {Number} rotationX
     */
    setRotationX:function (rotationX) {
        this._rotationX = rotationX;
        this._rotationRadiansX = this._rotationX * (Math.PI / 180);
        this.setNodeDirty();
    },

    /**
     * The rotation (angle) of the node in degrees. 0 is the default rotation angle.  <br/>
     * Positive values rotate node CW. It only modifies the Y rotation performing a vertical rotational skew .
     * @return {Number}
     */
    getRotationY:function () {
        return this._rotationY;
    },

    setRotationY:function (rotationY) {
        this._rotationY = rotationY;
        this._rotationRadiansY = this._rotationY * (Math.PI / 180);
        this.setNodeDirty();
    },

    /** Get the scale factor of the node.
     * @warning: Assert when _scaleX != _scaleY.
     * @return {Number}
     */
    getScale:function () {
        cc.Assert(this._scaleX == this._scaleY, "cc.Node#scale. ScaleX != ScaleY. Don't know which one to return");
        return this._scaleX;
    },

    /**
     * The scale factor of the node. 1.0 is the default scale factor. It modifies the X and Y scale at the same time.
     * @param {Number} scale or scaleX value
     * @param {Number} scaleY
     */
    setScale:function (scale, scaleY) {
        this._scaleX = scale;
        this._scaleY = scaleY || scale;
        this.setNodeDirty();
    },

    /**
     * scaleX getter
     * @return {Number}
     */
    getScaleX:function () {
        return this._scaleX;
    },

    /**
     * scaleX setter
     * @param {Number} newScaleX
     */
    setScaleX:function (newScaleX) {
        this._scaleX = newScaleX;
        this.setNodeDirty();
    },

    /**
     * scaleY getter
     * @return {Number}
     */
    getScaleY:function () {
        return this._scaleY;
    },

    /**
     * scaleY setter
     * @param {Number} newScaleY
     */
    setScaleY:function (newScaleY) {
        this._scaleY = newScaleY;
        this.setNodeDirty();
    },

    /**
     * position setter
     * @param {cc.Point|Number} newPosOrxValue
     * @param {Number}  yValue
     */
    setPosition:function (newPosOrxValue, yValue) {
        if (arguments.length == 2) {
            this._position = new cc.Point(newPosOrxValue, yValue);
        } else if (arguments.length == 1) {
            this._position = new cc.Point(newPosOrxValue.x, newPosOrxValue.y);
        }
        this.setNodeDirty();
    },

    _setPositionByValue:function (newPosOrxValue, yValue) {
        if (arguments.length == 2) {
            this._position.x = newPosOrxValue;
            this._position.y = yValue;
        } else if (arguments.length == 1) {
            this._position.x = newPosOrxValue.x;
            this._position.y = newPosOrxValue.y;
        }
        this.setNodeDirty();
    },

    /**
     * <p>Position (x,y) of the node in OpenGL coordinates. (0,0) is the left-bottom corner. </p>
     * @return {cc.Point}
     */
    getPosition:function () {
        return cc.p(this._position.x, this._position.y);
    },

    /**
     * @return {Number}
     */
    getPositionX:function () {
        return this._position.x;
    },

    /**
     * @param {Number} x
     */
    setPositionX:function (x) {
        this._position.x = x;
        this.setNodeDirty();
    },

    /**
     * @return {Number}
     */
    getPositionY:function () {
        return  this._position.y;
    },

    /**
     * @param {Number} y
     */
    setPositionY:function (y) {
        this._position.y = y;
        this.setNodeDirty();
    },

    /**
     * Get children count
     * @return {Number}
     */

    getChildrenCount:function () {
        return this._children ? this._children.length : 0;
    },

    /**
     * children getter
     * @return {object}
     */
    getChildren:function () {
        if (!this._children)
            this._children = [];
        return this._children;
    },

    /**
     * isVisible getter
     * @return {Boolean}
     */
    isVisible:function () {
        return this._visible;
    },

    /**
     * isVisible setter
     * @param {Boolean} Var
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
     * @return {cc.Point}
     */
    getAnchorPoint:function () {
        return cc.p(this._anchorPoint.x, this._anchorPoint.y);
    },

    /**
     * @param {cc.Point} point
     */
    setAnchorPoint:function (point) {
        if (!cc.pointEqualToPoint(point, this._anchorPoint)) {
            this._anchorPoint = new cc.Point(point.x, point.y);
            this._anchorPointInPoints = new cc.Point(this._contentSize.width * point.x, this._contentSize.height * point.y);
            this.setNodeDirty();
        }
    },

    /**
     *  The anchorPoint in absolute pixels.  <br/>
     *  you can only read it. If you wish to modify it, use anchorPoint instead
     * @return {cc.Point}
     */
    getAnchorPointInPoints:function () {
        return cc.p(this._anchorPointInPoints.x, this._anchorPointInPoints.y);
    },

    /** <p>The untransformed size of the node. <br/>
     The contentSize remains the same no matter the node is scaled or rotated.<br/>
     All nodes has a size. Layer and Scene has the same size of the screen. <br/></p>
     * @return {cc.Size}
     */
    getContentSize:function () {
        return cc.size(this._contentSize.width, this._contentSize.height);
    },

    /**
     * @param {cc.Size} size
     */
    setContentSize:function (size) {
        if (!cc.sizeEqualToSize(size, this._contentSize)) {
            this._contentSize = new cc.Size(size.width, size.height);
            this._anchorPointInPoints = new cc.Point(this._contentSize.width * this._anchorPoint.x, this._contentSize.height * this._anchorPoint.y);
            this.setNodeDirty();
        }
    },

    /**
     * whether or not the node is running
     * @return {Boolean}
     */
    isRunning:function () {
        return this._running;
    },

    /** A weak reference to the parent
     * @return {cc.Node}
     */
    getParent:function () {
        return this._parent;
    },

    /** parent setter
     * @param {cc.Node} Var
     */
    setParent:function (Var) {
        this._parent = Var;
    },

    /**
     * If true, the Anchor Point will be (0,0) when you position the CCNode.<br/>
     * Used by CCLayer and CCScene
     * @return {Boolean}
     */
    isIgnoreAnchorPointForPosition:function () {
        return this._ignoreAnchorPointForPosition;
    },

    /**
     * ignoreAnchorPointForPosition setter
     * @param {Boolean} newValue
     */
    ignoreAnchorPointForPosition:function (newValue) {
        if (newValue != this._ignoreAnchorPointForPosition) {
            this._ignoreAnchorPointForPosition = newValue;
            this.setNodeDirty();
        }
    },

    /**
     * A tag used to identify the node easily
     * @return {Number}
     */
    getTag:function () {
        return this._tag;
    },

    /** tag setter
     * @param {Number} Var
     */
    setTag:function (Var) {
        this._tag = Var;
    },

    /**
     * A custom user data pointer
     * @return {object}
     */
    getUserData:function () {
        return this._userData;
    },

    /**
     * @param {object} Var
     */
    setUserData:function (Var) {
        this._userData = Var;
    },

    /**
     * Similar to userData, but instead of holding a void* it holds an id
     * @return {object}
     */
    getUserObject:function () {
        return this._userObject;
    },

    /**
     * Similar to userData, but instead of holding a void* it holds an id
     * @param {object} newValue
     */
    setUserObject:function (newValue) {
        if (this._userObject != newValue) {
            this._userObject = newValue;
        }
    },


    /**
     * used internally for zOrder sorting, don't change this manually
     * @return {Number}
     */
    getOrderOfArrival:function () {
        return this._orderOfArrival;
    },

    /**
     * used internally for zOrder sorting, don't change this manually
     * @param {Number} Var
     */
    setOrderOfArrival:function (Var) {
        this._orderOfArrival = Var;
    },

    /**
     * <p>cc.ActionManager used by all the actions. <br/>
     * (IMPORTANT: If you set a new cc.ActionManager, then previously created actions are going to be removed.)</p>
     * @return {cc.ActionManager}
     */
    getActionManager:function () {
        if (!this._actionManager) {
            this._actionManager = cc.Director.getInstance().getActionManager();
        }
        return this._actionManager;
    },

    /**
     * <p>cc.ActionManager used by all the actions. <br/>
     * (IMPORTANT: If you set a new cc.ActionManager, then previously created actions are going to be removed.)</p>
     * @param {cc.ActionManager} actionManager
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
     * @return {cc.Scheduler}
     */
    getScheduler:function () {
        if (!this._scheduler) {
            this._scheduler = cc.Director.getInstance().getScheduler();
        }
        return this._scheduler;
    },

    /**
     * <p>
     *   cc.Scheduler used to schedule all "updates" and timers.<br/>
     *   IMPORTANT: If you set a new cc.Scheduler, then previously created timers/update are going to be removed.
     * </p>
     */
    setScheduler:function (scheduler) {
        if (this._scheduler != scheduler) {
            this.unscheduleAllCallbacks();
            this._scheduler = scheduler;
        }
    },

    /** returns a "local" axis aligned bounding box of the node. <br/>
     * The returned box is relative only to its parent.
     * @return {cc.Rect}
     */
    getBoundingBox:function () {
        var rect = cc.rect(0, 0, this._contentSize.width, this._contentSize.height);
        return cc.RectApplyAffineTransform(rect, this.nodeToParentTransform());
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

    /** Node description
     * @return {String}
     */
    description:function () {
        return "<cc.Node | Tag =" + this._tag + ">";
    },

    _childrenAlloc:function () {
        this._children = [];
    },

    // composition: GET
    /**
     * Gets a child from the container given its tag
     * @param {Number} aTag
     * @return {cc.Node}
     */
    getChildByTag:function (aTag) {
        //cc.Assert(aTag != cc.NODE_TAG_INVALID, "Invalid tag");
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
     * <p>If a class want's to extend the 'addChild' behaviour it only needs  <br/>
     * to override this method </p>
     *
     * @param {cc.Node} child
     * @param {Number} zOrder
     * @param {Number} tag
     */
    addChild:function (child, zOrder, tag) {
        if (child === this) {
            console.warn('cc.Node.addChild: An Node can\'t be added as a child of itself.');
            return;
        }

        cc.Assert(child != null, "Argument must be non-nil");
        if (child._parent !== null) {
            cc.Assert(child._parent === null, "child already added. It can't be added again");
            return;
        }
        var tempzOrder = (zOrder != null) ? zOrder : child.getZOrder();
        var tmptag = (tag != null) ? tag : child.getTag();
        child.setTag(tmptag);

        if (!this._children)
            this._childrenAlloc();

        this._insertChild(child, tempzOrder);

        child.setParent(this);
        if (this._running) {
            child.onEnter();
            child.onEnterTransitionDidFinish();
        }
    },

    // composition: REMOVE
    /**
     * Remove itself from its parent node. If cleanup is true, then also remove all actions and callbacks. <br/>
     * If the cleanup parameter is not passed, it will force a cleanup. <br/>
     * If the node orphan, then nothing happens.
     * @param {Boolean} cleanup
     */
    removeFromParent:function (cleanup) {
        if (this._parent) {
            if (cleanup == null)
                cleanup = true;
            this._parent.removeChild(this, cleanup);
        }
    },

    /**
     * Remove itself from its parent node.
     * @deprecated
     * @param {Boolean} cleanup
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
     * @param {cc.Node} child
     * @param {Boolean} cleanup
     */
    removeChild:function (child, cleanup) {
        // explicit nil handling
        if (this._children == null)
            return;

        if (cleanup == null)
            cleanup = true;
        if (this._children.indexOf(child) > -1) {
            this._detachChild(child, cleanup);
        }

        this.setNodeDirty();
    },

    /**
     * Removes a child from the container by tag value. It will also cleanup all running actions depending on the cleanup parameter.
     * If the cleanup parameter is not passed, it will force a cleanup. <br/>
     * @param {Number} tag
     * @param {Boolean} cleanup
     */
    removeChildByTag:function (tag, cleanup) {
        cc.Assert(tag != cc.NODE_TAG_INVALID, "Invalid tag");

        var child = this.getChildByTag(tag);
        if (child == null)
            cc.log("cocos2d: removeChildByTag: child not found!");
        else
            this.removeChild(child, cleanup);
    },

    /**
     * Removes all children from the container and do a cleanup all running actions depending on the cleanup parameter.
     * @deprecated
     * @param {Boolean | null} cleanup
     */
    removeAllChildrenWithCleanup:function (cleanup) {
        cc.log("removeAllChildrenWithCleanup is deprecated. Use removeAllChildren instead");
        this.removeAllChildren(cleanup);
    },

    /**
     * Removes all children from the container and do a cleanup all running actions depending on the cleanup parameter. <br/>
     * If the cleanup parameter is not passed, it will force a cleanup. <br/>
     * @param {Boolean | null } cleanup
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
        var __children = this._children;
        var a = __children[__children.length - 1];
        if (!a || a.getZOrder() <= z)
            __children.push(child);
        else {
            for (var i = 0; i < __children.length; i++) {
                var node = __children[i];
                if (node && (node.getZOrder() > z )) {
                    this._children = cc.ArrayAppendObjectToIndex(__children, child, i);
                    break;
                }
            }
        }
        child._setZOrder(z);
    },

    /** Reorders a child according to a new z value. <br/>
     * The child MUST be already added.
     * @param {cc.Node} child
     * @param {Number} zOrder
     */
    reorderChild:function (child, zOrder) {
        cc.Assert(child != null, "Child must be non-nil");
        this._reorderChildDirty = true;
        child.setOrderOfArrival(cc.s_globalOrderOfArrival++);
        child._setZOrder(zOrder);
        this.setNodeDirty();
    },

    /**
     * <p>performance improvement, Sort the children array once before drawing, instead of every time when a child is added or reordered <br/>
     * don't call this manually unless a child added needs to be removed in the same frame </p>
     */
    sortAllChildren:function () {
        if (this._reorderChildDirty) {
            var i, j, length = this._children.length;
            var localChildren = this._children;
            // insertion sort
            for (i = 0; i < length; i++) {
                var tempItem = localChildren[i];
                j = i - 1;

                //continue moving element downwards while zOrder is smaller or when zOrder is the same but mutatedIndex is smaller
                while (j >= 0 && ( tempItem._zOrder < localChildren[j]._zOrder ||
                    ( tempItem._zOrder == localChildren[j]._zOrder && tempItem._orderOfArrival < localChildren[j]._orderOfArrival ))) {
                    localChildren[j + 1] = localChildren[j];
                    j = j - 1;
                }
                localChildren[j + 1] = tempItem;
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
        //cc.Assert(0);
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
     * callback that is called every time the cc.Node enters the 'stage'.<br/>
     * If the cc.Node enters the 'stage' with a transition, this callback is called when the transition starts.
     * During onEnter you can't a "sister/brother" node.
     */
    onEnter:function () {
        this._running = true;//should be running before resumeSchedule
        this._arrayMakeObjectsPerformSelector(this._children, cc.Node.StateCallbackType.onEnter);
        this.resumeSchedulerAndActions();
    },

    /**
     * <p>callback that is called when the cc.Node enters in the 'stage'.  <br/>
     * If the cc.Node enters the 'stage' with a transition, this callback is called when the transition finishes.</p>
     */
    onEnterTransitionDidFinish:function () {
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
     * callback that is called every time the cc.Node leaves the 'stage'.<br/>
     * If the cc.Node leaves the 'stage' with a transition, this callback is called when the transition finishes. <br/>
     * During onExit you can't access a sibling node.
     */
    onExit:function () {
        this._running = false;
        this.pauseSchedulerAndActions();
        this._arrayMakeObjectsPerformSelector(this._children, cc.Node.StateCallbackType.onExit);
    },

    // actions
    /**
     * Executes an action, and returns the action that is executed.<br/>
     * The node becomes the action's target.
     * @warning Starting from v0.8 actions don't retain their target anymore.
     * @param {cc.Action} action
     * @return {cc.Action}
     */
    runAction:function (action) {
        cc.Assert(action != null, "Argument must be non-nil");
        this.getActionManager().addAction(action, this, !this._running);
        return action;
    },

    /**
     * Removes all actions from the running action list
     */
    stopAllActions:function () {
        this.getActionManager().removeAllActionsFromTarget(this);
    },

    /**
     * Removes an action from the running action list
     * @param {cc.Action} action
     */
    stopAction:function (action) {
        this.getActionManager().removeAction(action);
    },

    /**
     * Removes an action from the running action list given its tag
     * @param {Number} tag
     */
    stopActionByTag:function (tag) {
        cc.Assert(tag != cc.ACTION_TAG_INVALID, "Invalid tag");
        this.getActionManager().removeActionByTag(tag, this);
    },

    /**
     * Gets an action from the running action list given its tag
     * @param {Number} tag
     * @return {cc.Action}
     */
    getActionByTag:function (tag) {
        cc.Assert(tag != cc.ACTION_TAG_INVALID, "Invalid tag");
        return this.getActionManager().getActionByTag(tag, this);
    },

    /** Returns the numbers of actions that are running plus the ones that are schedule to run (actions in actionsToAdd and actions arrays).<br/>
     *    Composable actions are counted as 1 action. Example:<br/>
     *    If you are running 1 Sequence of 7 actions, it will return 1. <br/>
     *    If you are running 7 Sequences of 2 actions, it will return 7.
     * @return {Number}
     */
    numberOfRunningActions:function () {
        return this.getActionManager().numberOfRunningActionsInTarget(this);
    },

    // cc.Node - Callbacks
    // timers
    /**
     * schedules the "update" method. It will use the order number 0. This method will be called every frame.<br/>
     * Scheduled methods with a lower order value will be called before the ones that have a higher order value.<br/>
     * Only one "update" method could be scheduled per node.
     */
    scheduleUpdate:function () {
        this.scheduleUpdateWithPriority(0);
    },

    /**
     * schedules the "update" callback function with a custom priority. This callback function will be called every frame.<br/>
     * Scheduled callback functions with a lower priority will be called before the ones that have a higher value.<br/>
     * Only one "update" callback function could be scheduled per node (You can't have 2 'update' callback functions).<br/>
     * @param {Number} priority
     */
    scheduleUpdateWithPriority:function (priority) {
        this.getScheduler().scheduleUpdateForTarget(this, priority, !this._running);
    },

    /**
     * unschedules the "update" method.
     */
    unscheduleUpdate:function () {
        this.getScheduler().unscheduleUpdateForTarget(this);
    },

    /**
     * schedules a callback function with interval, repeat and delay.
     * @param {function} callback_fn
     * @param {Number} interval
     */
    schedule:function (callback_fn, interval, repeat, delay) {
        interval = interval || 0;

        cc.Assert(callback_fn, "Argument must be non-nil");
        cc.Assert(interval >= 0, "Argument must be positive");

        repeat = (repeat == null) ? cc.REPEAT_FOREVER : repeat;
        delay = delay || 0;

        this.getScheduler().scheduleCallbackForTarget(this, callback_fn, interval, repeat, delay, !this._running);
    },

    /**
     * Schedules a callback function that runs only once, with a delay of 0 or larger
     * @param {cc.Class} callback_fn
     * @param {Number} delay
     */
    scheduleOnce:function (callback_fn, delay) {
        this.schedule(callback_fn, 0.0, 0, delay);
    },

    /**
     * unschedules a custom callback function.
     * @param {function} callback_fn
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
     * resumes all scheduled callback functions and actions.<br/>
     * Called internally by onEnter
     */
    resumeSchedulerAndActions:function () {
        this.getScheduler().resumeTarget(this);
        this.getActionManager().resumeTarget(this);
    },

    /**
     * pauses all scheduled selectors and actions.<br/>
     * Called internally by onExit
     */
    pauseSchedulerAndActions:function () {
        this.getScheduler().pauseTarget(this);
        this.getActionManager().pauseTarget(this);
    },

    /**
     *<p>  Sets the additional transform.<br/>
     *  The additional transform will be concatenated at the end of nodeToParentTransform.<br/>
     *  It could be used to simulate `parent-child` relationship between two nodes (e.g. one is in BatchNode, another isn't).<br/>
     * // create a batchNode<br/>
     * var batch= cc.SpriteBatchNode.create("Icon-114.png");<br/>
     * this.addChild(batch);<br/>
     *<br/>
     * // create two sprites, spriteA will be added to batchNode, they are using different textures.<br/>
     * var spriteA = cc.Sprite.createWithTexture(batch->getTexture());<br/>
     * var spriteB = cc.Sprite.create("Icon-72.png");<br/>
     *<br/>
     * batch.addChild(spriteA);<br/>
     *<br/>
     * // We can't make spriteB as spriteA's child since they use different textures. So just add it to layer.<br/>
     * // But we want to simulate `parent-child` relationship for these two node.<br/>
     * this.addChild(spriteB);<br/>
     *<br/>
     * //position<br/>
     * spriteA.setPosition(ccp(200, 200));<br/>
     *<br/>
     * // Gets the spriteA's transform.<br/>
     * var t = spriteA.nodeToParentTransform();<br/>
     *<br/>
     * // Sets the additional transform to spriteB, spriteB's postion will based on its pseudo parent i.e. spriteA. <br/>
     * spriteB.setAdditionalTransform(t);<br/>
     *<br/>
     * //scale<br/>
     * spriteA.setScale(2);<br/>
     *<br/>
     // Gets the spriteA's transform.<br/>
     * * t = spriteA.nodeToParentTransform();<br/>
     *<br/>
     * // Sets the additional transform to spriteB, spriteB's scale will based on its pseudo parent i.e. spriteA. <br/>
     * spriteB.setAdditionalTransform(t);<br/>
     *<br/>
     * //rotation<br/>
     * spriteA.setRotation(20);<br/>
     *<br/>
     * // Gets the spriteA's transform.<br/>
     * t = spriteA.nodeToParentTransform();<br/>
     *<br/>
     * // Sets the additional transform to spriteB, spriteB's rotation will based on its pseudo parent i.e. spriteA. <br/>
     * spriteB.setAdditionalTransform(t);<br/>
     </p>
     */
    setAdditionalTransform:function (additionalTransform) {
        this._additionalTransform = additionalTransform;
        this._transformDirty = true;
        this._additionalTransformDirty = true;
    },

    /**
     * Returns the matrix that transform parent's space coordinates to the node's (local) space coordinates.<br/>
     * The matrix is in Pixels.
     * @return {Number}
     */
    parentToNodeTransform:function () {
        if (this._inverseDirty) {
            this._inverse = cc.AffineTransformInvert(this.nodeToParentTransform());
            this._inverseDirty = false;
        }
        return this._inverse;
    },

    /**
     *  Retrusn the world affine transform matrix. The matrix is in Pixels.
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
     * @param {Number} dt
     */
    update:function (dt) {
    },

    /**
     * updates the quad according the the rotation, position, scale values.
     */
    updateTransform:function () {
        // Recursively iterate over children
        this._arrayMakeObjectsPerformSelector(this._children, cc.Node.StateCallbackType.updateTransform);
    },

    /**
     * Currently JavaScript Bindigns (JSB), in some cases, needs to use retain and release. This is a bug in JSB,
     * and the ugly workaround is to use retain/release. So, these 2 methods were added to be compatible with JSB.
     * This is a hack, and should be removed once JSB fixes the retain/release bug
     */
    retain:function () {
    },
    release:function () {
    },
    /// ---- common properties end  ----

    _transform4x4:null,
    _stackMatrix:null,
    _glServerState:null,
    _camera:null,
    _grid:null,

    ctor:function () {
        this._initNode();
        var mat4 = new cc.kmMat4();
        mat4.mat[2] = mat4.mat[3] = mat4.mat[6] = mat4.mat[7] = mat4.mat[8] = mat4.mat[9] = mat4.mat[11] = mat4.mat[14] = 0.0;
        mat4.mat[10] = mat4.mat[15] = 1.0;
        this._transform4x4 = mat4;
        this._glServerState = 0;
        this._stackMatrix = new cc.kmMat4();
    },

    /**
     * recursive method that visit its children and draw them
     */
    visit: function () {
        // quick return if not visible
        if (!this._visible)
            return;

        var context = cc.renderContext, i, currentStack = cc.current_stack;
        this._stackMatrix = this._stackMatrix || new cc.kmMat4();
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
        if (locGrid && locGrid.isActive())
            locGrid.afterDraw(this);

        //cc.kmGLPopMatrix();
        //optimize performance for javascript
        currentStack.top = currentStack.stack.pop();
    },

    transform:function () {
        //optimize performance for javascript
        var t4x4 = this._transform4x4,  topMat4 = cc.current_stack.top;
        if(!t4x4){
            t4x4 = new cc.kmMat4();
            t4x4.mat[2] = t4x4.mat[3] = t4x4.mat[6] = t4x4.mat[7] = t4x4.mat[8] = t4x4.mat[9] = t4x4.mat[11] = t4x4.mat[14] = 0.0;
            t4x4.mat[10] = t4x4.mat[15] = 1.0;
            this._transform4x4 = t4x4;
        }

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
            var apx = this._anchorPointInPoints.x, apy = this._anchorPointInPoints.y;
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
    nodeToParentTransform:function () {
        if (this._transformDirty) {
            // Translate values
            var x = this._position.x;
            var y = this._position.y;
            var apx = this._anchorPointInPoints.x, napx = -apx;
            var apy = this._anchorPointInPoints.y, napy = -apy;
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
            var t = {a: cy * scx, b: sy * scx, c: -sx * scy, d: cx * scy, tx: x, ty: y};

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

    /**
     * set the dirty node
     */
    setNodeDirty:function () {
        this._transformDirty = this._inverseDirty = true;
    },

    /**
     * A CCCamera object that lets you move the node using a gluLookAt
     * @return {cc.Camera}
     */
    getCamera:function () {
        if (!this._camera) {
            this._camera = new cc.Camera();
        }
        return this._camera;
    },

    /**
     * grid getter
     * A CCGrid object that is used when applying effects
     * @return {cc.GridBase}
     */
    getGrid:function () {
        return this._grid;
    },

    /**
     * grid setter
     * @param {cc.GridBase} grid
     */
    setGrid:function (grid) {
        this._grid = grid;
    },

    /**
     * Shader Program getter
     * @return {object}
     */
    getShaderProgram:function () {
        return this._shaderProgram;
    },

    /**
     * Shader Program setter
     * @param {object} newShaderProgram
     */
    setShaderProgram:function (newShaderProgram) {
        this._shaderProgram = newShaderProgram;
    },

    /**
     * GL server side state getter
     * @return {Number}
     */
    getGLServerState:function () {
        return this._glServerState;
    },

    /**
     * GL server side state setter
     * @param {Number} state
     */
    setGLServerState:function (state) {
        this._glServerState = state;
    }
});

/**
 * cc.Node's state callback type
 * @constant
 * @type Number
 */
cc.NodeWebGL.StateCallbackType = {onEnter:1, onExit:2, cleanup:3, onEnterTransitionDidFinish:4, updateTransform:5, onExitTransitionDidStart:6, sortAllChildren:7};

/**
 * allocates and initializes a node.
 * @constructs
 * @return {cc.NodeWebGL}
 * @example
 * // example
 * var node = cc.NodeWebGL.create();
 */
cc.NodeWebGL.create = function () {
    return new cc.NodeWebGL();
};

/** <p>cc.Node is the main element. Anything thats gets drawn or contains things that get drawn is a cc.Node.<br/>
 The most popular cc.Nodes are: cc.Scene, cc.Layer, cc.Sprite, cc.Menu. (Canvas implement)<br/></p>

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
cc.NodeCanvas = cc.Class.extend(/** @lends cc.NodeCanvas# */{
    /// ---- common properties start ----
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

    _initNode:function () {
        this._anchorPoint = cc.p(0, 0);
        this._anchorPointInPoints = cc.p(0, 0);
        this._contentSize = cc.size(0, 0);
        this._position = cc.p(0, 0);

        var director = cc.Director.getInstance();
        this._actionManager = director.getActionManager();
        this._scheduler = director.getScheduler();
        this._initializedNode = true;
        this._additionalTransform = cc.AffineTransformMakeIdentity();
        this._additionalTransformDirty = false;
    },

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

        var i, len = array.length;
        var nodeCallbackType = cc.Node.StateCallbackType;
        switch (callbackType) {
            case nodeCallbackType.onEnter:
                for (i = 0; i < len; i++) {
                    if (array[i])
                        array[i].onEnter();
                }
                break;
            case nodeCallbackType.onExit:
                for (i = 0; i < len; i++) {
                    if (array[i])
                        array[i].onExit();
                }
                break;
            case nodeCallbackType.onEnterTransitionDidFinish:
                for (i = 0; i < len; i++) {
                    if (array[i])
                        array[i].onEnterTransitionDidFinish();
                }
                break;
            case nodeCallbackType.cleanup:
                for (i = 0; i < len; i++) {
                    if (array[i])
                        array[i].cleanup();
                }
                break;
            case nodeCallbackType.updateTransform:
                for (i = 0; i < len; i++) {
                    if (array[i])
                        array[i].updateTransform();
                }
                break;
            case nodeCallbackType.onExitTransitionDidStart:
                for (i = 0; i < len; i++) {
                    if (array[i])
                        array[i].onExitTransitionDidStart();
                }
                break;
            case nodeCallbackType.sortAllChildren:
                for (i = 0; i < len; i++) {
                    if (array[i])
                        array[i].sortAllChildren();
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
    setNodeDirty:function () {
        this._transformDirty = this._inverseDirty = true;
    },

    /**
     *  <p>get the skew degrees in X </br>
     *  The X skew angle of the node in degrees.  <br/>
     *  This angle describes the shear distortion in the X direction.<br/>
     *  Thus, it is the angle between the Y axis and the left edge of the shape </br>
     *  The default skewX angle is 0. Positive values distort the node in a CW direction.</br>
     *  </p>
     * @return {Number}
     */
    getSkewX:function () {
        return this._skewX;
    },

    /**
     * set the skew degrees in X
     * @param {Number} newSkewX
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
     * @return {Number}
     */
    getSkewY:function () {
        return this._skewY;
    },

    /**
     * set the skew degrees in Y
     * @param {Number} newSkewY
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

    /** zOrder setter : private method
     * used internally to alter the zOrder variable. DON'T call this method manually
     * @param {Number} z
     * @private
     */
    _setZOrder:function (z) {
        this._zOrder = z;
    },

    setZOrder:function (z) {
        this._setZOrder(z);
        if (this._parent)
            this._parent.reorderChild(this, z);
    },

    /**
     * ertexZ getter
     * @return {Number}
     */
    getVertexZ:function () {
        return this._vertexZ;
    },

    /**
     * vertexZ setter
     * @param {Number} Var
     */
    setVertexZ:function (Var) {
        this._vertexZ = Var;
    },

    /**
     * The rotation (angle) of the node in degrees. 0 is the default rotation angle. Positive values rotate node CW.
     * @return {Number}
     */
    getRotation:function () {
        cc.Assert(this._rotationX == this._rotationY, "CCNode#rotation. RotationX != RotationY. Don't know which one to return");
        return this._rotationX;
    },

    _rotationRadiansX:0,
    _rotationRadiansY:0,
    /**
     * rotation setter
     * @param {Number} newRotation
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
     * @return {Number}
     */
    getRotationX:function () {
        return this._rotationX;
    },

    /**
     * rotationX setter
     * @param {Number} rotationX
     */
    setRotationX:function (rotationX) {
        this._rotationX = rotationX;
        this._rotationRadiansX = this._rotationX * 0.017453292519943295; //(Math.PI / 180);
        this.setNodeDirty();
    },

    /**
     * The rotation (angle) of the node in degrees. 0 is the default rotation angle.  <br/>
     * Positive values rotate node CW. It only modifies the Y rotation performing a vertical rotational skew .
     * @return {Number}
     */
    getRotationY:function () {
        return this._rotationY;
    },

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
        cc.Assert(this._scaleX == this._scaleY, "cc.Node#scale. ScaleX != ScaleY. Don't know which one to return");
        return this._scaleX;
    },

    /**
     * The scale factor of the node. 1.0 is the default scale factor. It modifies the X and Y scale at the same time.
     * @param {Number} scale or scaleX value
     * @param {Number} scaleY
     */
    setScale:function (scale, scaleY) {
        this._scaleX = scale;
        this._scaleY = scaleY || scale;
        this.setNodeDirty();
    },

    /**
     * scaleX getter
     * @return {Number}
     */
    getScaleX:function () {
        return this._scaleX;
    },

    /**
     * scaleX setter
     * @param {Number} newScaleX
     */
    setScaleX:function (newScaleX) {
        this._scaleX = newScaleX;
        this.setNodeDirty();
    },

    /**
     * scaleY getter
     * @return {Number}
     */
    getScaleY:function () {
        return this._scaleY;
    },

    /**
     * scaleY setter
     * @param {Number} newScaleY
     */
    setScaleY:function (newScaleY) {
        this._scaleY = newScaleY;
        this.setNodeDirty();
    },

    /**
     * position setter
     * @param {cc.Point|Number} newPosOrxValue
     * @param {Number}  yValue
     */
    setPosition:function (newPosOrxValue, yValue) {
        if (arguments.length === 2) {
            this._position = new cc.Point(newPosOrxValue, yValue);
        } else if (arguments.length === 1) {
            this._position = new cc.Point(newPosOrxValue.x, newPosOrxValue.y);
        }
        this.setNodeDirty();
    },

    _setPositionByValue:function (newPosOrxValue, yValue) {
        if (arguments.length === 2) {
            this._position.x = newPosOrxValue;
            this._position.y = yValue;
        } else if (arguments.length === 1) {
            this._position.x = newPosOrxValue.x;
            this._position.y = newPosOrxValue.y;
        }
        this.setNodeDirty();
    },

    /**
     * <p>Position (x,y) of the node in OpenGL coordinates. (0,0) is the left-bottom corner. </p>
     * @return {cc.Point}
     */
    getPosition:function () {
        return cc.p(this._position.x, this._position.y);
    },

    /**
     * @return {Number}
     */
    getPositionX:function () {
        return this._position.x;
    },

    /**
     * @param {Number} x
     */
    setPositionX:function (x) {
        this._position.x = x;
        this.setNodeDirty();
    },

    /**
     * @return {Number}
     */
    getPositionY:function () {
        return  this._position.y;
    },

    /**
     * @param {Number} y
     */
    setPositionY:function (y) {
        this._position.y = y;
        this.setNodeDirty();
    },

    /**
     * Get children count
     * @return {Number}
     */

    getChildrenCount:function () {
        return this._children ? this._children.length : 0;
    },

    /**
     * children getter
     * @return {object}
     */
    getChildren:function () {
        if (!this._children)
            this._children = [];
        return this._children;
    },

    /**
     * isVisible getter
     * @return {Boolean}
     */
    isVisible:function () {
        return this._visible;
    },

    /**
     * isVisible setter
     * @param {Boolean} Var
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
     * @return {cc.Point}
     */
    getAnchorPoint:function () {
        return cc.p(this._anchorPoint.x, this._anchorPoint.y);
    },

    /**
     * @param {cc.Point} point
     */
    setAnchorPoint:function (point) {
        if (!cc.pointEqualToPoint(point, this._anchorPoint)) {
            this._anchorPoint = new cc.Point(point.x, point.y);
            this._anchorPointInPoints = new cc.Point(this._contentSize.width * point.x, this._contentSize.height * point.y);
            this.setNodeDirty();
        }
    },

    /**
     *  The anchorPoint in absolute pixels.  <br/>
     *  you can only read it. If you wish to modify it, use anchorPoint instead
     * @return {cc.Point}
     */
    getAnchorPointInPoints:function () {
        return cc.p(this._anchorPointInPoints.x, this._anchorPointInPoints.y);
    },

    /** <p>The untransformed size of the node. <br/>
     The contentSize remains the same no matter the node is scaled or rotated.<br/>
     All nodes has a size. Layer and Scene has the same size of the screen. <br/></p>
     * @return {cc.Size}
     */
    getContentSize:function () {
        return cc.size(this._contentSize.width, this._contentSize.height);
    },

    /**
     * @param {cc.Size} size
     */
    setContentSize:function (size) {
        if (!cc.sizeEqualToSize(size, this._contentSize)) {
            this._contentSize = new cc.Size(size.width, size.height);
            this._anchorPointInPoints = new cc.Point(this._contentSize.width * this._anchorPoint.x, this._contentSize.height * this._anchorPoint.y);
            this.setNodeDirty();
        }
    },

    /**
     * whether or not the node is running
     * @return {Boolean}
     */
    isRunning:function () {
        return this._running;
    },

    /** A weak reference to the parent
     * @return {cc.Node}
     */
    getParent:function () {
        return this._parent;
    },

    /** parent setter
     * @param {cc.Node} Var
     */
    setParent:function (Var) {
        this._parent = Var;
    },

    /**
     * If true, the Anchor Point will be (0,0) when you position the CCNode.<br/>
     * Used by CCLayer and CCScene
     * @return {Boolean}
     */
    isIgnoreAnchorPointForPosition:function () {
        return this._ignoreAnchorPointForPosition;
    },

    /**
     * ignoreAnchorPointForPosition setter
     * @param {Boolean} newValue
     */
    ignoreAnchorPointForPosition:function (newValue) {
        if (newValue != this._ignoreAnchorPointForPosition) {
            this._ignoreAnchorPointForPosition = newValue;
            this.setNodeDirty();
        }
    },

    /**
     * A tag used to identify the node easily
     * @return {Number}
     */
    getTag:function () {
        return this._tag;
    },

    /** tag setter
     * @param {Number} Var
     */
    setTag:function (Var) {
        this._tag = Var;
    },

    /**
     * A custom user data pointer
     * @return {object}
     */
    getUserData:function () {
        return this._userData;
    },

    /**
     * @param {object} Var
     */
    setUserData:function (Var) {
        this._userData = Var;
    },

    /**
     * Similar to userData, but instead of holding a void* it holds an id
     * @return {object}
     */
    getUserObject:function () {
        return this._userObject;
    },

    /**
     * Similar to userData, but instead of holding a void* it holds an id
     * @param {object} newValue
     */
    setUserObject:function (newValue) {
        if (this._userObject != newValue) {
            this._userObject = newValue;
        }
    },


    /**
     * used internally for zOrder sorting, don't change this manually
     * @return {Number}
     */
    getOrderOfArrival:function () {
        return this._orderOfArrival;
    },

    /**
     * used internally for zOrder sorting, don't change this manually
     * @param {Number} Var
     */
    setOrderOfArrival:function (Var) {
        this._orderOfArrival = Var;
    },

    /**
     * <p>cc.ActionManager used by all the actions. <br/>
     * (IMPORTANT: If you set a new cc.ActionManager, then previously created actions are going to be removed.)</p>
     * @return {cc.ActionManager}
     */
    getActionManager:function () {
        if (!this._actionManager) {
            this._actionManager = cc.Director.getInstance().getActionManager();
        }
        return this._actionManager;
    },

    /**
     * <p>cc.ActionManager used by all the actions. <br/>
     * (IMPORTANT: If you set a new cc.ActionManager, then previously created actions are going to be removed.)</p>
     * @param {cc.ActionManager} actionManager
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
     * @return {cc.Scheduler}
     */
    getScheduler:function () {
        if (!this._scheduler) {
            this._scheduler = cc.Director.getInstance().getScheduler();
        }
        return this._scheduler;
    },

    /**
     * <p>
     *   cc.Scheduler used to schedule all "updates" and timers.<br/>
     *   IMPORTANT: If you set a new cc.Scheduler, then previously created timers/update are going to be removed.
     * </p>
     */
    setScheduler:function (scheduler) {
        if (this._scheduler != scheduler) {
            this.unscheduleAllCallbacks();
            this._scheduler = scheduler;
        }
    },

    /** returns a "local" axis aligned bounding box of the node. <br/>
     * The returned box is relative only to its parent.
     * @return {cc.Rect}
     */
    getBoundingBox:function () {
        var rect = cc.rect(0, 0, this._contentSize.width, this._contentSize.height);
        return cc.RectApplyAffineTransform(rect, this.nodeToParentTransform());
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

    /** Node description
     * @return {String}
     */
    description:function () {
        return "<cc.Node | Tag =" + this._tag + ">";
    },

    _childrenAlloc:function () {
        this._children = [];
    },

    // composition: GET
    /**
     * Gets a child from the container given its tag
     * @param {Number} aTag
     * @return {cc.Node}
     */
    getChildByTag:function (aTag) {
        //cc.Assert(aTag != cc.NODE_TAG_INVALID, "Invalid tag");
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
     * <p>If a class want's to extend the 'addChild' behaviour it only needs  <br/>
     * to override this method </p>
     *
     * @param {cc.Node} child
     * @param {Number} zOrder
     * @param {Number} tag
     */
    addChild:function (child, zOrder, tag) {
        if (child === this) {
            console.warn('cc.Node.addChild: An Node can\'t be added as a child of itself.');
            return;
        }

        cc.Assert(child != null, "Argument must be non-nil");
        if (child._parent !== null) {
            cc.Assert(child._parent === null, "child already added. It can't be added again");
            return;
        }
        var tempzOrder = (zOrder != null) ? zOrder : child.getZOrder();
        var tmptag = (tag != null) ? tag : child.getTag();
        child.setTag(tmptag);

        if (!this._children)
            this._childrenAlloc();

        this._insertChild(child, tempzOrder);

        child.setParent(this);
        if (this._running) {
            child.onEnter();
            child.onEnterTransitionDidFinish();
        }
    },

    // composition: REMOVE
    /**
     * Remove itself from its parent node. If cleanup is true, then also remove all actions and callbacks. <br/>
     * If the cleanup parameter is not passed, it will force a cleanup. <br/>
     * If the node orphan, then nothing happens.
     * @param {Boolean} cleanup
     */
    removeFromParent:function (cleanup) {
        if (this._parent) {
            if (cleanup == null)
                cleanup = true;
            this._parent.removeChild(this, cleanup);
        }
    },

    /**
     * Remove itself from its parent node.
     * @deprecated
     * @param {Boolean} cleanup
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
     * @param {cc.Node} child
     * @param {Boolean} cleanup
     */
    removeChild:function (child, cleanup) {
        // explicit nil handling
        if (this._children == null)
            return;

        if (cleanup == null)
            cleanup = true;
        if (this._children.indexOf(child) > -1) {
            this._detachChild(child, cleanup);
        }

        this.setNodeDirty();
    },

    /**
     * Removes a child from the container by tag value. It will also cleanup all running actions depending on the cleanup parameter.
     * If the cleanup parameter is not passed, it will force a cleanup. <br/>
     * @param {Number} tag
     * @param {Boolean} cleanup
     */
    removeChildByTag:function (tag, cleanup) {
        cc.Assert(tag != cc.NODE_TAG_INVALID, "Invalid tag");

        var child = this.getChildByTag(tag);
        if (child == null)
            cc.log("cocos2d: removeChildByTag: child not found!");
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
     * @param {Boolean | null } cleanup
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
        var __children = this._children;
        var a = __children[__children.length - 1];
        if (!a || a.getZOrder() <= z)
            __children.push(child);
        else {
            for (var i = 0; i < __children.length; i++) {
                var node = __children[i];
                if (node && (node.getZOrder() > z )) {
                    this._children = cc.ArrayAppendObjectToIndex(__children, child, i);
                    break;
                }
            }
        }
        child._setZOrder(z);
    },

    /** Reorders a child according to a new z value. <br/>
     * The child MUST be already added.
     * @param {cc.Node} child
     * @param {Number} zOrder
     */
    reorderChild:function (child, zOrder) {
        cc.Assert(child != null, "Child must be non-nil");
        this._reorderChildDirty = true;
        child.setOrderOfArrival(cc.s_globalOrderOfArrival++);
        child._setZOrder(zOrder);
        this.setNodeDirty();
    },

    /**
     * <p>performance improvement, Sort the children array once before drawing, instead of every time when a child is added or reordered <br/>
     * don't call this manually unless a child added needs to be removed in the same frame </p>
     */
    sortAllChildren:function () {
        if (this._reorderChildDirty) {
            var i, j, length = this._children.length;

            // insertion sort
            for (i = 0; i < length; i++) {
                var tempItem = this._children[i];
                j = i - 1;

                //continue moving element downwards while zOrder is smaller or when zOrder is the same but mutatedIndex is smaller
                while (j >= 0 && ( tempItem._zOrder < this._children[j]._zOrder ||
                    ( tempItem._zOrder == this._children[j]._zOrder && tempItem._orderOfArrival < this._children[j]._orderOfArrival ))) {
                    this._children[j + 1] = this._children[j];
                    j = j - 1;
                }
                this._children[j + 1] = tempItem;
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
        //cc.Assert(0);
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
     * callback that is called every time the cc.Node enters the 'stage'.<br/>
     * If the cc.Node enters the 'stage' with a transition, this callback is called when the transition starts.
     * During onEnter you can't a "sister/brother" node.
     */
    onEnter:function () {
        this._running = true;//should be running before resumeSchedule
        this._arrayMakeObjectsPerformSelector(this._children, cc.Node.StateCallbackType.onEnter);
        this.resumeSchedulerAndActions();
    },

    /**
     * <p>callback that is called when the cc.Node enters in the 'stage'.  <br/>
     * If the cc.Node enters the 'stage' with a transition, this callback is called when the transition finishes.</p>
     */
    onEnterTransitionDidFinish:function () {
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
     * callback that is called every time the cc.Node leaves the 'stage'.<br/>
     * If the cc.Node leaves the 'stage' with a transition, this callback is called when the transition finishes. <br/>
     * During onExit you can't access a sibling node.
     */
    onExit:function () {
        this._running = false;
        this.pauseSchedulerAndActions();
        this._arrayMakeObjectsPerformSelector(this._children, cc.Node.StateCallbackType.onExit);
    },

    // actions
    /**
     * Executes an action, and returns the action that is executed.<br/>
     * The node becomes the action's target.
     * @warning Starting from v0.8 actions don't retain their target anymore.
     * @param {cc.Action} action
     * @return {cc.Action}
     */
    runAction:function (action) {
        cc.Assert(action != null, "Argument must be non-nil");
        this.getActionManager().addAction(action, this, !this._running);
        return action;
    },

    /**
     * Removes all actions from the running action list
     */
    stopAllActions:function () {
        this.getActionManager().removeAllActionsFromTarget(this);
    },

    /**
     * Removes an action from the running action list
     * @param {cc.Action} action
     */
    stopAction:function (action) {
        this.getActionManager().removeAction(action);
    },

    /**
     * Removes an action from the running action list given its tag
     * @param {Number} tag
     */
    stopActionByTag:function (tag) {
        cc.Assert(tag != cc.ACTION_TAG_INVALID, "Invalid tag");
        this.getActionManager().removeActionByTag(tag, this);
    },

    /**
     * Gets an action from the running action list given its tag
     * @param {Number} tag
     * @return {cc.Action}
     */
    getActionByTag:function (tag) {
        cc.Assert(tag != cc.ACTION_TAG_INVALID, "Invalid tag");
        return this.getActionManager().getActionByTag(tag, this);
    },

    /** Returns the numbers of actions that are running plus the ones that are schedule to run (actions in actionsToAdd and actions arrays).<br/>
     *    Composable actions are counted as 1 action. Example:<br/>
     *    If you are running 1 Sequence of 7 actions, it will return 1. <br/>
     *    If you are running 7 Sequences of 2 actions, it will return 7.
     * @return {Number}
     */
    numberOfRunningActions:function () {
        return this.getActionManager().numberOfRunningActionsInTarget(this);
    },

    // cc.Node - Callbacks
    // timers
    /**
     * schedules the "update" method. It will use the order number 0. This method will be called every frame.<br/>
     * Scheduled methods with a lower order value will be called before the ones that have a higher order value.<br/>
     * Only one "update" method could be scheduled per node.
     */
    scheduleUpdate:function () {
        this.scheduleUpdateWithPriority(0);
    },

    /**
     * schedules the "update" callback function with a custom priority. This callback function will be called every frame.<br/>
     * Scheduled callback functions with a lower priority will be called before the ones that have a higher value.<br/>
     * Only one "update" callback function could be scheduled per node (You can't have 2 'update' callback functions).<br/>
     * @param {Number} priority
     */
    scheduleUpdateWithPriority:function (priority) {
        this.getScheduler().scheduleUpdateForTarget(this, priority, !this._running);
    },

    /**
     * unschedules the "update" method.
     */
    unscheduleUpdate:function () {
        this.getScheduler().unscheduleUpdateForTarget(this);
    },

    /**
     * schedules a callback function with interval, repeat and delay.
     * @param {function} callback_fn
     * @param {Number} interval
     */
    schedule:function (callback_fn, interval, repeat, delay) {
        interval = interval || 0;

        cc.Assert(callback_fn, "Argument must be non-nil");
        cc.Assert(interval >= 0, "Argument must be positive");

        repeat = (repeat == null) ? cc.REPEAT_FOREVER : repeat;
        delay = delay || 0;

        this.getScheduler().scheduleCallbackForTarget(this, callback_fn, interval, repeat, delay, !this._running);
    },

    /**
     * Schedules a callback function that runs only once, with a delay of 0 or larger
     * @param {cc.Class} callback_fn
     * @param {Number} delay
     */
    scheduleOnce:function (callback_fn, delay) {
        this.schedule(callback_fn, 0.0, 0, delay);
    },

    /**
     * unschedules a custom callback function.
     * @param {function} callback_fn
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
     * resumes all scheduled callback functions and actions.<br/>
     * Called internally by onEnter
     */
    resumeSchedulerAndActions:function () {
        this.getScheduler().resumeTarget(this);
        this.getActionManager().resumeTarget(this);
    },

    /**
     * pauses all scheduled selectors and actions.<br/>
     * Called internally by onExit
     */
    pauseSchedulerAndActions:function () {
        this.getScheduler().pauseTarget(this);
        this.getActionManager().pauseTarget(this);
    },

    /**
     *<p>  Sets the additional transform.<br/>
     *  The additional transform will be concatenated at the end of nodeToParentTransform.<br/>
     *  It could be used to simulate `parent-child` relationship between two nodes (e.g. one is in BatchNode, another isn't).<br/>
     * // create a batchNode<br/>
     * var batch= cc.SpriteBatchNode.create("Icon-114.png");<br/>
     * this.addChild(batch);<br/>
     *<br/>
     * // create two sprites, spriteA will be added to batchNode, they are using different textures.<br/>
     * var spriteA = cc.Sprite.createWithTexture(batch->getTexture());<br/>
     * var spriteB = cc.Sprite.create("Icon-72.png");<br/>
     *<br/>
     * batch.addChild(spriteA);<br/>
     *<br/>
     * // We can't make spriteB as spriteA's child since they use different textures. So just add it to layer.<br/>
     * // But we want to simulate `parent-child` relationship for these two node.<br/>
     * this.addChild(spriteB);<br/>
     *<br/>
     * //position<br/>
     * spriteA.setPosition(ccp(200, 200));<br/>
     *<br/>
     * // Gets the spriteA's transform.<br/>
     * var t = spriteA.nodeToParentTransform();<br/>
     *<br/>
     * // Sets the additional transform to spriteB, spriteB's postion will based on its pseudo parent i.e. spriteA. <br/>
     * spriteB.setAdditionalTransform(t);<br/>
     *<br/>
     * //scale<br/>
     * spriteA.setScale(2);<br/>
     *<br/>
     // Gets the spriteA's transform.<br/>
     * * t = spriteA.nodeToParentTransform();<br/>
     *<br/>
     * // Sets the additional transform to spriteB, spriteB's scale will based on its pseudo parent i.e. spriteA. <br/>
     * spriteB.setAdditionalTransform(t);<br/>
     *<br/>
     * //rotation<br/>
     * spriteA.setRotation(20);<br/>
     *<br/>
     * // Gets the spriteA's transform.<br/>
     * t = spriteA.nodeToParentTransform();<br/>
     *<br/>
     * // Sets the additional transform to spriteB, spriteB's rotation will based on its pseudo parent i.e. spriteA. <br/>
     * spriteB.setAdditionalTransform(t);<br/>
     </p>
     */
    setAdditionalTransform:function (additionalTransform) {
        this._additionalTransform = additionalTransform;
        this._transformDirty = true;
        this._additionalTransformDirty = true;
    },

    /**
     * Returns the matrix that transform parent's space coordinates to the node's (local) space coordinates.<br/>
     * The matrix is in Pixels.
     * @return {Number}
     */
    parentToNodeTransform:function () {
        if (this._inverseDirty) {
            this._inverse = cc.AffineTransformInvert(this.nodeToParentTransform());
            this._inverseDirty = false;
        }
        return this._inverse;
    },

    /**
     *  Retrusn the world affine transform matrix. The matrix is in Pixels.
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
     * @param {Number} dt
     */
    update:function (dt) {
    },

    /**
     * updates the quad according the the rotation, position, scale values.
     */
    updateTransform:function () {
        // Recursively iterate over children
        this._arrayMakeObjectsPerformSelector(this._children, cc.Node.StateCallbackType.updateTransform);
    },

    /**
     * Currently JavaScript Bindigns (JSB), in some cases, needs to use retain and release. This is a bug in JSB,
     * and the ugly workaround is to use retain/release. So, these 2 methods were added to be compatible with JSB.
     * This is a hack, and should be removed once JSB fixes the retain/release bug
     */
    retain:function () {
    },
    release:function () {
    },
    /// ---- common properties end  ----

    /**
     * Constructor
     */
    ctor:function () {
        this._initNode();
    },

    /**
     * recursive method that visit its children and draw them
     * @param {CanvasContext} ctx
     */
    visit:function (ctx) {
        // quick return if not visible
        if (!this._visible)
            return;

        //visit for canvas
        var context = ctx || cc.renderContext, i;
        var children = this._children;
        context.save();
        this.transform(context);
        if (children && children.length > 0) {
            var len = children.length;
            this.sortAllChildren();
            // draw children zOrder < 0
            for (i = 0; i < len; i++) {
                if (children[i] && children[i]._zOrder < 0)
                    children[i].visit(context);
                else
                    break;
            }
            this.draw(context);
            for (; i < len; i++) {
                if (children[i] && children[i]._zOrder >= 0)
                    children[i].visit(context);
            }

        } else
            this.draw(context);

        this._orderOfArrival = 0;
        context.restore();
    },

    transform:function (ctx) {
        // transform for canvas
        var context = ctx || cc.renderContext;
        var t = this.nodeToParentTransform();
        context.transform(t.a, t.b, t.c, t.d, t.tx, -t.ty);
    },

    /** Returns the matrix that transform the node's (local) space coordinates into the parent's space coordinates.<br/>
     * The matrix is in Pixels.
     * @return {cc.AffineTransform}
     */
    nodeToParentTransform:function () {
        if (!this._transform)
            this._transform = {a:1, b:0, c:0, d:1, tx:0, ty:0};
        if (this._transformDirty) {
            var t = this._transform;// quick reference
            // base position
            t.tx = this._position.x;
            t.ty = this._position.y;

            // rotation Cos and Sin
            var Cos = 1, Sin = 0;
            if (this._rotationX) {
                Cos = Math.cos(this._rotationRadiansX);
                Sin = Math.sin(this._rotationRadiansX);
            }

            // base abcd
            t.a = t.d = Cos;
            t.c = -Sin;
            t.b = Sin;

            var lScaleX = this._scaleX, lScaleY = this._scaleY;
            var appX = this._anchorPointInPoints.x, appY = this._anchorPointInPoints.y;

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
                t.c = Cos * skx + -Sin;
                t.b = Sin + Cos * sky;
                t.d = Sin * skx + Cos;
                t.tx += Cos * xx + -Sin * yy;
                t.ty += Sin * xx + Cos * yy;
            }

            // scale
            if (lScaleX !== 1 || lScaleY !== 1) {
                t.a *= sx;
                t.b *= sx;
                t.c *= sy;
                t.d *= sy;
            }

            // adjust anchorPoint
            t.tx += Cos * -appX * sx + -Sin * appY * sy;
            t.ty -= Sin * -appX * sx + Cos * appY * sy;

            // if ignore anchorPoint
            if (this._ignoreAnchorPointForPosition) {
                t.tx += appX
                t.ty += appY;
            }

            if (this._additionalTransformDirty) {
                this._transform = cc.AffineTransformConcat(this._transform, this._additionalTransform);
                //Because the cartesian coordination is inverted in html5 canvas, these needs to be inverted as well
                this._transform.b *= -1;
                this._transform.c *= -1;

                this._additionalTransformDirty = false;
            }

            t.tx = t.tx | 0;
            t.ty = t.ty | 0;
            this._transformDirty = false;
        }
        return this._transform;
    },

    /**
     * set the dirty node
     */
    setNodeDirty:function () {
        this._setNodeDirtyForCache();
        this._transformDirty = this._inverseDirty = true;
    },

    _setNodeDirtyForCache:function () {
        this._cacheDirty = true;
        if (this._parent) {
            this._parent._setNodeDirtyForCache();
        }
    },

    /** returns a "world" axis aligned bounding box of the node. <br/>
     * @return {cc.Rect}
     */
    getBoundingBoxToWorld:function () {
        var rect = cc.rect(0, 0, this._contentSize.width, this._contentSize.height);
        rect = cc.RectApplyAffineTransform(rect, this.nodeToWorldTransform());
        rect = cc.rect(0 | rect.x - 4, 0 | rect.y - 4, 0 | rect.width + 8, 0 | rect.height + 8);
        //query child's BoundingBox
        if (!this._children)
            return rect;

        var locChildren = this._children;
        for (var i = 0; i < locChildren.length; i++) {
            var child = locChildren[i];
            if (child && child._visible) {
                var childRect = child.getBoundingBoxToWorld();
                if (childRect)
                    rect = cc.rectUnion(rect, childRect);
            }
        }
        return rect;
    }
});

/**
 * cc.Node's state callback type
 * @constant
 * @type Number
 */
cc.NodeCanvas.StateCallbackType = {onEnter:1, onExit:2, cleanup:3, onEnterTransitionDidFinish:4, updateTransform:5, onExitTransitionDidStart:6, sortAllChildren:7};

/**
 * allocates and initializes a node.
 * @constructs
 * @return {cc.NodeCanvas}
 * @example
 * // example
 * var node = cc.NodeWebGL.create();
 */
cc.NodeCanvas.create = function () {
    return new cc.NodeCanvas();
};

cc.Node = cc.Browser.supportWebGL ? cc.NodeWebGL : cc.NodeCanvas;

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
    _displayedOpacity:0,
    _realOpacity:0,
    _displayedColor:null,
    _realColor:null,
    _cascadeColorEnabled:false,
    _cascadeOpacityEnabled:false,

    ctor:function(){
        cc.Node.prototype.ctor.call(this);
        this._displayedOpacity = 255;
        this._realOpacity = 255;
        this._displayedColor = cc.WHITE;
        this._realColor = cc.WHITE;
        this._cascadeColorEnabled = false;
        this._cascadeOpacityEnabled = false;
    },

    init:function(){
        if(cc.Node.prototype.init.call(this)){
            this._displayedOpacity = this._realOpacity = 255;
            this._displayedColor = cc.WHITE;
            this._realColor = cc.WHITE;
            this._cascadeOpacityEnabled = this._cascadeColorEnabled = false;
            return true;
        }
        return false;
    },

    getOpacity:function(){
        return this._realOpacity;
    },

    getDisplayedOpacity:function(){
        return this._displayedOpacity;
    },

    setOpacity:function(opacity){
        this._displayedOpacity = this._realOpacity = opacity;

        if (this._cascadeOpacityEnabled) {
            var parentOpacity = 255;
            if (this._parent && this._parent.RGBAProtocol && this._parent.isCascadeOpacityEnabled())
                parentOpacity = this._parent.getDisplayedOpacity();
            this.updateDisplayedOpacity(parentOpacity);
        }
    },

    updateDisplayedOpacity:function(parentOpacity){
        this._displayedOpacity = this._realOpacity * parentOpacity/255.0;
        if (this._cascadeOpacityEnabled) {
            var selChildren = this._children;
            for(var i = 0; i< selChildren.length;i++){
                var item = selChildren[i];
                if(item && item.RGBAProtocol)
                    item.updateDisplayedOpacity(this._displayedOpacity);
            }
        }
    },

    isCascadeOpacityEnabled:function(){
        return this._cascadeOpacityEnabled;
    },

    setCascadeOpacityEnabled:function(cascadeOpacityEnabled){
        this._cascadeOpacityEnabled = cascadeOpacityEnabled;
    },

    getColor:function(){
        return this._realColor;
    },

    getDisplayedColor:function(){
        return this._displayedColor;
    },

    setColor:function(color){
        this._displayedColor = this._realColor = color;

        if (this._cascadeColorEnabled) {
            var parentColor = cc.WHITE;
            if (this._parent && this._parent.RGBAProtocol &&  this._parent.isCascadeColorEnabled())
                parentColor = this._parent.getDisplayedColor();
            this.updateDisplayedColor(parentColor);
        }
    },

    updateDisplayedColor:function(parentColor){
        this._displayedColor.r = this._realColor.r * parentColor.r/255.0;
        this._displayedColor.g = this._realColor.g * parentColor.g/255.0;
        this._displayedColor.b = this._realColor.b * parentColor.b/255.0;

        if (this._cascadeColorEnabled){
            var selChildren = this._children;
            for(var i = 0; i< selChildren.length;i++){
                var item = selChildren[i];
                if(item && item.RGBAProtocol)
                    item.updateDisplayedColor(this._displayedColor);
            }
        }
    },

    isCascadeColorEnabled:function(){
        return this._cascadeColorEnabled;
    },

    setCascadeColorEnabled:function(cascadeColorEnabled){
        this._cascadeColorEnabled = cascadeColorEnabled;
    },

    setOpacityModifyRGB:function(opacityValue){},

    isOpacityModifyRGB:function(){
        return false;
    }
});
