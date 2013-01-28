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
 * save the context
 * @function
 */
cc.saveContext = function () {
    if (cc.renderContextType == cc.CANVAS) {
        cc.renderContext.save();
    } else {
        //glPushMatrix();
    }
};

/**
 * restore the context
 * @function
 */
cc.restoreContext = function () {
    if (cc.renderContextType == cc.CANVAS) {
        cc.renderContext.restore();
    } else {
        //glPopMatrix();
    }
};

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
cc.Node = cc.Class.extend(/** @lends cc.Node# */{
    _zOrder:0,
    _vertexZ:0.0,
    _rotation:0.0,
    _scaleX:1.0,
    _scaleY:1.0,
    _position:cc.p(0, 0),
    _skewX:0.0,
    _skewY:0.0,
    // children (lazy allocs),
    _children:null,
    // lazy alloc,
    _camera:null,
    _grid:null,
    _visible:true,
    _anchorPoint:cc.p(0, 0),
    _anchorPointInPoints:cc.p(0, 0),
    _contentSize:cc.SizeZero(),
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
    _glServerState:null,
    _actionManager:null,
    _scheduler:null,

    _initializedNode:false,

    /**
     * Constructor
     */
    ctor:function () {
        this._initNode();
    },

    _initNode:function () {
        if (cc.NODE_TRANSFORM_USING_AFFINE_MATRIX) {
            this._transformGLDirty = true;
        }
        this._anchorPoint = cc.p(0, 0);
        this._anchorPointInPoints = cc.p(0, 0);
        this._contentSize = cc.size(0, 0);
        this._position = cc.p(0, 0);

        var director = cc.Director.getInstance();
        this._actionManager = director.getActionManager();
        this.getActionManager = function () {
            return this._actionManager;
        };
        this._scheduler = director.getScheduler();
        this.getScheduler = function () {
            return this._scheduler;
        };
        this._initializedNode = true;
    },

    init:function () {
        if (this._initializedNode === false)
            this._initNode();
        return true;
    },

    /**
     * @param {Array} array
     * @param {cc.Node.StateCallbackType} function Type
     * @private
     */
    _arrayMakeObjectsPerformSelector:function (array, callbackType) {
        if (!array || array.length == 0)
            return;

        var i;
        switch (callbackType) {
            case cc.Node.StateCallbackType.onEnter:
                for (i = 0; i < array.length; i++) {
                    if (array[i])
                        array[i].onEnter();
                }
                break;
            case cc.Node.StateCallbackType.onExit:
                for (i = 0; i < array.length; i++) {
                    if (array[i])
                        array[i].onExit();
                }
                break;
            case cc.Node.StateCallbackType.onEnterTransitionDidFinish:
                for (i = 0; i < array.length; i++) {
                    if (array[i])
                        array[i].onEnterTransitionDidFinish();
                }
                break;
            case cc.Node.StateCallbackType.cleanup:
                for (i = 0; i < array.length; i++) {
                    if (array[i])
                        array[i].cleanup();
                }
                break;
            case cc.Node.StateCallbackType.updateTransform:
                for (i = 0; i < array.length; i++) {
                    if (array[i])
                        array[i].updateTransform();
                }
                break;
            case cc.Node.StateCallbackType.onExitTransitionDidStart:
                for (i = 0; i < array.length; i++) {
                    if (array[i])
                        array[i].onExitTransitionDidStart();
                }
                break;
            case cc.Node.StateCallbackType.sortAllChildren:
                for (i = 0; i < array.length; i++) {
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
     * @param {cc.Rect} rect
     * @private
     */
    _addDirtyRegionToDirector:function (rect) {
        //if (!cc.firstRun) {
        //cc.Director.getInstance().addRegionToDirtyRegion(rect);
        //}
    },

    _isInDirtyRegion:function () {
        //if (!cc.firstRun) {
        //    return cc.Director.getInstance().rectIsInDirtyRegion(this.getBoundingBoxToWorld());
        //}
    },

    /**
     * set the dirty node
     */
    setNodeDirty:function () {
        this._setNodeDirtyForCache();
        this._transformDirty = this._inverseDirty = true;
        if (cc.NODE_TRANSFORM_USING_AFFINE_MATRIX) {
            this._transformGLDirty = true;
        }
    },

    _setNodeDirtyForCache:function () {
        this._cacheDirty = true;
        if (this._parent) {
            this._parent._setNodeDirtyForCache();
        }
    },

    /**
     *  get the skew degrees in X
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
        //save dirty region when before change
        //this._addDirtyRegionToDirector(this.getBoundingBoxToWorld());

        this._skewX = newSkewX;

        //save dirty region when after changed
        //this._addDirtyRegionToDirector(this.getBoundingBoxToWorld());
        this.setNodeDirty();
    },

    /** get the skew degrees in Y
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
        //save dirty region when before change
        //this._addDirtyRegionToDirector(this.getBoundingBoxToWorld());

        this._skewY = newSkewY;
        //save dirty region when after changed
        //this._addDirtyRegionToDirector(this.getBoundingBoxToWorld());
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
        if (this._parent) {
            this._parent.reorderChild(this, z);
        }
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
     * rotation getter
     * @return {Number}
     */
    getRotation:function () {
        return this._rotation;
    },

    _rotationRadians:0,
    /**
     * rotation setter
     * @param {Number} newRotation
     */
    setRotation:function (newRotation) {
        if (this._rotation == newRotation)
            return;
        this._rotation = newRotation;
        this._rotationRadians = this._rotation * (Math.PI / 180);

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
     * The scale factor of the node. 1.0 is the default scale factor.
     * @param {Number} scale or scaleX value
     * @param {Number} scaleY
     */
    setScale:function (scale, scaleY) {
        //save dirty region when before change
        //this._addDirtyRegionToDirector(this.getBoundingBoxToWorld());

        this._scaleX = scale;
        this._scaleY = scaleY || scale;

        //save dirty region when after changed
        //this._addDirtyRegionToDirector(this.getBoundingBoxToWorld());
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
        //save dirty region when before change
        //this._addDirtyRegionToDirector(this.getBoundingBoxToWorld());

        this._scaleX = newScaleX;

        //save dirty region when after changed
        //this._addDirtyRegionToDirector(this.getBoundingBoxToWorld());
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
        //save dirty region when before change
        //this._addDirtyRegionToDirector(this.getBoundingBoxToWorld());

        this._scaleY = newScaleY;

        //save dirty region when after changed
        //this._addDirtyRegionToDirector(this.getBoundingBoxToWorld());
        this.setNodeDirty();
    },

    /**
     * position setter
     * @param {cc.Point|Number} newPosOrxValue
     * @param {Number}  yValue
     */
    setPosition:function (newPosOrxValue, yValue) {
        //save dirty region when before change
        //this._addDirtyRegionToDirector(this.getBoundingBoxToWorld());
        if (arguments.length == 2) {
            this._position = new cc.Point(newPosOrxValue, yValue);
            //this.setPosition = this._setPositionByValue;
        } else if (arguments.length == 1) {
            this._position = new cc.Point(newPosOrxValue.x, newPosOrxValue.y);
            //this.setPosition = this._setPositionByValue;
        }
        //save dirty region when after changed
        //this._addDirtyRegionToDirector(this.getBoundingBoxToWorld());
        this.setNodeDirty();
    },

    _setPositionByValue:function (newPosOrxValue, yValue) {
        if (arguments.length == 2) {
            this._position.x = newPosOrxValue;
            this._position.y = yValue;
            //this._position = cc.p(newPosOrxValue,yValue);
        } else if (arguments.length == 1) {
            this._position.x = newPosOrxValue.x;
            this._position.y = newPosOrxValue.y;
        }
        this.setNodeDirty();
    },

    /** <p>get/set Position for Lua (pass number faster than cc.Point object)</p>

     <p>lua code:<br/>
     local x, y = node:getPosition()    -- return x, y values from C++ <br/>
     local x    = node:getPositionX()<br/>
     local y    = node:getPositionY()<br/>
     node:setPosition(x, y)             -- pass x, y values to C++ <br/>
     node:setPositionX(x) <br/>
     node:setPositionY(y)<br/>
     node:setPositionInPixels(x, y)     -- pass x, y values to C++ <br/></P>
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
        //this._position = cc.p(x,this._position.y);
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
        //this._position = cc.p(this._position.x, y);
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
     * camera getter: lazy alloc
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
        //this._addDirtyRegionToDirector(this.getBoundingBoxToWorld());
        this.setNodeDirty();
    },

    /** <p>anchorPoint is the point around which all transformations and positioning manipulations take place.<br/>
     It's like a pin in the node where it is "attached" to its parent. <br/>
     The anchorPoint is normalized, like a percentage. (0,0) means the bottom-left corner and (1,1) means the top-right corner. <br/>
     But you can use values higher than (1,1) and lower than (0,0) too.  <br/>
     The default anchorPoint is (0.5,0.5), so it starts in the center of the node. <br/></p>
     */
    getAnchorPoint:function () {
        return cc.p(this._anchorPoint.x, this._anchorPoint.y);
    },

    /**
     * @param {cc.Point} point
     */
    setAnchorPoint:function (point) {
        if (!cc.Point.CCPointEqualToPoint(point, this._anchorPoint)) {
            //save dirty region when before change
            //this._addDirtyRegionToDirector(this.getBoundingBoxToWorld());

            this._anchorPoint = new cc.Point(point.x, point.y);
            this._anchorPointInPoints = new cc.Point(this._contentSize.width * this._anchorPoint.x, this._contentSize.height * this._anchorPoint.y);

            //this.setAnchorPoint = this._setAnchorPointByValue;

            //save dirty region when after changed
            //this._addDirtyRegionToDirector(this.getBoundingBoxToWorld());
            this.setNodeDirty();
        }
    },

    _setAnchorPointByValue:function (point) {
        if (!cc.Point.CCPointEqualToPoint(point, this._anchorPoint)) {
            this._anchorPoint.x = point.x;
            this._anchorPoint.y = point.y;
            this._anchorPointInPoints.x = this._contentSize.width * this._anchorPoint.x;
            this._anchorPointInPoints.y = this._contentSize.height * this._anchorPoint.y;
            this.setNodeDirty();
        }
    },

    /** AnchorPointInPoints getter
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
        if (!cc.Size.CCSizeEqualToSize(size, this._contentSize)) {
            //save dirty region when before change
            //this._addDirtyRegionToDirector(this.getBoundingBoxToWorld());
            this._contentSize = new cc.Size(size.width, size.height);
            this._anchorPointInPoints = new cc.Point(this._contentSize.width * this._anchorPoint.x, this._contentSize.height * this._anchorPoint.y);
            //save dirty region when before change
            //this._addDirtyRegionToDirector(this.getBoundingBoxToWorld());
            //this.setContentSize = this._setContentSizeByValue;
            this.setNodeDirty();
        }
    },

    _setContentSizeByValue:function (size) {
        if (!cc.Size.CCSizeEqualToSize(size, this._contentSize)) {
            this._contentSize.width = size.width;
            this._contentSize.height = size.height;
            this._anchorPointInPoints.x = this._contentSize.width * this._anchorPoint.x;
            this._anchorPointInPoints.y = this._contentSize.height * this._anchorPoint.y;
            this.setNodeDirty();
        }
    },

    /**
     * isRunning getter
     * @return {Boolean}
     */
    isRunning:function () {
        return this._running;
    },

    /** parent getter
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

    /** ignoreAnchorPointForPosition getter
     * @return {Boolean}
     */
    isIgnoreAnchorPointForPosition:function () {
        return this._ignoreAnchorPointForPosition;
    },

    /** ignoreAnchorPointForPosition setter
     * @param {Boolean} newValue
     */
    ignoreAnchorPointForPosition:function (newValue) {
        if (newValue != this._ignoreAnchorPointForPosition) {
            //save dirty region when before change
            //this._addDirtyRegionToDirector(this.getBoundingBoxToWorld());

            this._ignoreAnchorPointForPosition = newValue;

            //save dirty region when before change
            //this._addDirtyRegionToDirector(this.getBoundingBoxToWorld());
            this.setNodeDirty();
        }
    },

    /**
     * tag getter
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
     * Shader Program getter
     * @return {object}
     */
    getShaderProgram:function () {
        return this._shaderProgram;
    },

    /**
     * Shader Program setter
     * @param {object} newValue
     */
    setShaderProgram:function (newValue) {
        if (this._shaderProgram != newValue) {
            this._shaderProgram = newValue;
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
     * GL server side state getter
     * @return {Number}
     */
    getGLServerState:function () {
        return this._glServerState;
    },

    /**
     * GL server side state setter
     * @param {Number} Var
     */
    setGLServerState:function (Var) {
        this._glServerState = Var;
    },

    /**
     * <p>cc.ActionManager used by all the actions. <br/>
     * (IMPORTANT: If you set a new cc.ActionManager, then previously created actions are going to be removed.)</p>
     * @return {cc.ActionManager}
     */
    getActionManager:function () {
        if (!this._actionManager) {
            this._actionManager = cc.Director.getInstance().getActionManager();
            this.getActionManager = function () {
                return this._actionManager;
            };
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
            this._shaderProgram = actionManager;
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
            this.getScheduler = function () {
                return this._scheduler;
            };
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

    /** returns a "world" axis aligned bounding box of the node. <br/>
     * @return {cc.Rect}
     */
    getBoundingBoxToWorld:function () {
        var rect = cc.rect(0, 0, this._contentSize.width, this._contentSize.height);
        rect = cc.RectApplyAffineTransform(rect, this.nodeToWorldTransform());
        rect = cc.rect(0 | rect.origin.x - 4, 0 | rect.origin.y - 4, 0 | rect.size.width + 8, 0 | rect.size.height + 8);
        //query child's BoundingBox
        if (!this._children)
            return rect;

        for (var i = 0; i < this._children.length; i++) {
            var child = this._children[i];
            if (child && child._visible) {
                var childRect = child.getBoundingBoxToWorld();
                if (childRect) {
                    rect = cc.Rect.CCRectUnion(rect, childRect);
                }
            }
        }
        return rect;
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
        cc.Assert(aTag != cc.NODE_TAG_INVALID, "Invalid tag");
        if (this._children != null) {
            for (var i = 0; i < this._children.length; i++) {
                var node = this._children[i];
                if (node && node._tag == aTag) {
                    return node;
                }
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
        if(child._parent !== null){
            cc.Assert(child._parent === null, "child already added. It can't be added again");
            return;
        }
        var tempzOrder = (zOrder != null) ? zOrder : child.getZOrder();
        var tmptag = (tag != null) ? tag : child.getTag();
        child.setTag(tmptag);

        if (!this._children) {
            this._childrenAlloc();
        }

        this._insertChild(child, tempzOrder);

        child.setParent(this);
        if (this._running) {
            child.onEnter();
            child.onEnterTransitionDidFinish();
        }

    },

    // composition: REMOVE
    /** Remove itself from its parent node. If cleanup is true, then also remove all actions and callbacks. <br/>
     * If the cleanup parameter is not passed, it will force a cleanup. <br/>
     * If the node orphan, then nothing happens.
     * @param {Boolean} cleanup
     */
    removeFromParent:function (cleanup) {
        if (this._parent) {
            if (cleanup == null){
                cleanup = true;
            }
            this._parent.removeChild(this, cleanup);
        }
    },
    /** XXX deprecated */
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
        if (this._children == null) {
            return;
        }

        if (cleanup == null){
            cleanup = true;
        }
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
        if (child == null) {
            cc.log("cocos2d: removeChildByTag: child not found!");
        } else {
            this.removeChild(child, cleanup);
        }
    },

    /* XXX deprecated */
    removeAllChildrenWithCleanup:function (cleanup) {
        cc.log("removeAllChildrenWithCleanup is deprecated. Use removeAllChildren instead");
        this.removeAllChildren(cleanup);
    },

    /**
     * Removes all children from the container and do a cleanup all running actions depending on the cleanup parameter.
     * If the cleanup parameter is not passed, it will force a cleanup. <br/>
     * @param {Boolean} cleanup
     */
    removeAllChildren:function (cleanup) {
        // not using detachChild improves speed here
        if (this._children != null) {
            if (cleanup == null){
                cleanup = true;
            }
            for (var i = 0; i < this._children.length; i++) {
                var node = this._children[i];
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
        if (doCleanup) {
            child.cleanup();
        }

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
        var a = this._children[this._children.length - 1];
        if (!a || a.getZOrder() <= z) {
            this._children.push(child);
        } else {
            for (var i = 0; i < this._children.length; i++) {
                var node = this._children[i];
                if (node && (node.getZOrder() > z )) {
                    this._children = cc.ArrayAppendObjectToIndex(this._children, child, i);
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

        //save dirty region when before change
        //this._addDirtyRegionToDirector(this.getBoundingBoxToWorld());

        child.setOrderOfArrival(cc.s_globalOrderOfArrival++);
        child._setZOrder(zOrder);

        //save dirty region when after changed
        //this._addDirtyRegionToDirector(this.getBoundingBoxToWorld());
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

    /**
     * recursive method that visit its children and draw them
     * @param {CanvasContext} ctx
     */
    visit:function (ctx) {
        //visit for canvas

        // quick return if not visible
        if (!this._visible)
            return;

        var context = ctx || cc.renderContext, i;
        context.save();
        this.transform(context);
        if (this._children && this._children.length > 0) {
            this.sortAllChildren();
            // draw children zOrder < 0
            for (i = 0; i < this._children.length; i++) {
                if (this._children[i] && this._children[i]._zOrder < 0)
                    this._children[i].visit(context);
                else
                    break;
            }
            this.draw(context);
            if (this._children) {
                for (; i < this._children.length; i++) {
                    if (this._children[i] && this._children[i]._zOrder >= 0)
                        this._children[i].visit(context);
                }
            }
        } else
            this.draw(context);

        this._orderOfArrival = 0;
        context.restore();
    },

    _visitForWebGL:function (ctx) {
        if (!this._visible)
            return;

        var context = ctx, i;

        context.save();

        if (this._grid && this._grid.isActive()) {
            this._grid.beforeDraw();
        }

        this.transform(context);
        if (this._children && this._children.length > 0) {
            this.sortAllChildren();
            // draw children zOrder < 0
            for (i = 0; i < this._children.length; i++) {
                if (this._children[i] && this._children[i]._zOrder < 0) {
                    this._children[i].visit(context);
                } else {
                    break;
                }
            }

            //if (this._isInDirtyRegion()) {
            // self draw
            this.draw(context);
            //}

            // draw children zOrder >= 0
            if (this._children) {
                for (; i < this._children.length; i++) {
                    if (this._children[i] && this._children[i]._zOrder >= 0) {
                        this._children[i].visit(context);
                    }
                }
            }
        } else {
            //if (this._isInDirtyRegion()) {
            // self draw
            this.draw(context);
            //}
        }

        this._orderOfArrival = 0;
        if (this._grid && this._grid.isActive()) {
            this._grid.afterDraw(this);
        }
        context.restore();
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

    /** transformations <br/>
     * performs OpenGL view-matrix transformation based on position, scale, rotation and other attributes.
     * @param {CanvasContext} ctx
     */
    transform:function (ctx) {
        // transform for canvas
        var context = ctx || cc.renderContext;

        // transformations
        if (!this._ignoreAnchorPointForPosition) {
            if (this._parent)
                context.translate((this._position.x - this._parent._anchorPointInPoints.x), -((this._position.y - this._parent._anchorPointInPoints.y)));
            else
                context.translate(this._position.x, -(this._position.y));
        } else {
            if (this._parent) {
                context.translate(( this._position.x - this._parent._anchorPointInPoints.x + this._anchorPointInPoints.x),
                    -((this._position.y - this._parent._anchorPointInPoints.y + this._anchorPointInPoints.y)));
            } else {
                context.translate(( this._position.x + this._anchorPointInPoints.x), -((this._position.y + this._anchorPointInPoints.y)));
            }
        }

        if (this._rotation != 0)
            context.rotate(this._rotationRadians);

        if ((this._scaleX != 1) || (this._scaleY != 1))
            context.scale(this._scaleX, this._scaleY);

        if ((this._skewX != 0) || (this._skewY != 0)) {
            context.transform(1,
                -Math.tan(cc.DEGREES_TO_RADIANS(this._skewY)),
                -Math.tan(cc.DEGREES_TO_RADIANS(this._skewX)),
                1, 0, 0);
        }
    },

    _transformForWebGL:function (ctx) {
        var context = ctx;

        //Todo WebGL implement need fixed
        var transfrom4x4;

        // Convert 3x3 into 4x4 matrix
        var tmpAffine = this.nodeToParentTransform();
        //CGAffineToGL(&tmpAffine, transfrom4x4.mat);

        // Update Z vertex manually
        //transfrom4x4.mat[14] = m_fVertexZ;

        //kmGLMultMatrix( &transfrom4x4 );


        // XXX: Expensive calls. Camera should be integrated into the cached affine matrix
        /*if ( m_pCamera != NULL && !(m_pGrid != NULL && m_pGrid->isActive()) ) {
         bool translate = (m_tAnchorPointInPoints.x != 0.0f || m_tAnchorPointInPoints.y != 0.0f);

         if( translate )
         kmGLTranslatef(RENDER_IN_SUBPIXEL(m_tAnchorPointInPoints.x), RENDER_IN_SUBPIXEL(m_tAnchorPointInPoints.y), 0 );

         m_pCamera->locate();

         if( translate )
         kmGLTranslatef(RENDER_IN_SUBPIXEL(-m_tAnchorPointInPoints.x), RENDER_IN_SUBPIXEL(-m_tAnchorPointInPoints.y), 0 );
         }*/
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

    /** Returns the matrix that transform the node's (local) space coordinates into the parent's space coordinates.<br/>
     * The matrix is in Pixels.
     * @return {cc.AffineTransform}
     */
    nodeToParentTransform:function () {
        if (this._transformDirty) {
            // Translate values
            var x = this._position.x;
            var y = this._position.y;

            if (this._ignoreAnchorPointForPosition) {
                x += this._anchorPointInPoints.x;
                y += this._anchorPointInPoints.y;
            }

            // Rotation values
            var c = 1, s = 0;
            if (this._rotation) {
                //var radians = -cc.DEGREES_TO_RADIANS(this._rotation);
                c = Math.cos(-this._rotationRadians);
                s = Math.sin(-this._rotationRadians);
            }

            var needsSkewMatrix = ( this._skewX || this._skewY );

            // optimization:
            // inline anchor point calculation if skew is not needed
            if (!needsSkewMatrix && !cc.Point.CCPointEqualToPoint(this._anchorPointInPoints, cc.p(0, 0))) {
                x += c * -this._anchorPointInPoints.x * this._scaleX + -s * -this._anchorPointInPoints.y * this._scaleY;
                y += s * -this._anchorPointInPoints.x * this._scaleX + c * -this._anchorPointInPoints.y * this._scaleY;
            }

            // Build Transform Matrix
            this._transform = cc.AffineTransformMake(c * this._scaleX, s * this._scaleX,
                -s * this._scaleY, c * this._scaleY, x, y);

            // XXX: Try to inline skew
            // If skew is needed, apply skew and then anchor point
            if (needsSkewMatrix) {
                var skewMatrix = cc.AffineTransformMake(1.0, Math.tan(cc.DEGREES_TO_RADIANS(this._skewY)),
                    Math.tan(cc.DEGREES_TO_RADIANS(this._skewX)), 1.0, 0.0, 0.0);
                this._transform = cc.AffineTransformConcat(skewMatrix, this._transform);

                // adjust anchor point
                if (!cc.Point.CCPointEqualToPoint(this._anchorPointInPoints, cc.p(0, 0))) {
                    this._transform = cc.AffineTransformTranslate(this._transform, -this._anchorPointInPoints.x, -this._anchorPointInPoints.y);
                }
            }

            this._transformDirty = false;
        }

        return this._transform;
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
        for (var p = this._parent; p != null; p = p.getParent()) {
            t = cc.AffineTransformConcat(t, p.nodeToParentTransform());
        }
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
        //TODO in canvas point don't convert to GL
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

    /** implement cc.Object's method (override me)
     * @param {Number} dt
     */
    update:function (dt) {
    },

    updateTransform:function(){
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
    }
});

/**
 * cc.Node's state callback type
 * @constant
 * @type Number
 */
cc.Node.StateCallbackType = {onEnter:1, onExit:2, cleanup:3, onEnterTransitionDidFinish:4, updateTransform:5, onExitTransitionDidStart:6, sortAllChildren:7};


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

