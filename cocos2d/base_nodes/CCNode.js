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
cc.CCNODE_TAG_INVALID = -1;
/**
 * Node on enter
 * @constant
 */
cc.CCNODE_ON_ENTER = null;
/**
 * Node on exit
 * @constant
 */
cc.CCNODE_ON_EXIT = null;

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
    _position:cc.PointZero(),
    _positionInPixels:cc.PointZero(),
    _skewX:0.0,
    _skewY:0.0,
    // children (lazy allocs),
    _children:null,
    // lazy alloc,
    _camera:null,
    _grid:null,
    _isVisible:true,
    _anchorPoint:new cc.Point(0, 0),
    _anchorPointInPixels:new cc.Point(0, 0),
    _contentSize:cc.SizeZero(),
    _contentSizeInPixels:cc.SizeZero(),
    _isRunning:false,
    _parent:null,
    // "whole screen" objects. like Scenes and Layers, should set isRelativeAnchorPoint to false
    _isRelativeAnchorPoint:true,
    _tag:cc.CCNODE_TAG_INVALID,
    // userData is always inited as nil
    _userData:null,
    _isTransformDirty:true,
    _isInverseDirty:true,
    _isCacheDirty:true,
    _isTransformGLDirty:null,
    _transform:null,
    _inverse:null,
    _transformGL:null,

    /**
     * Constructor
     */
    ctor:function () {
        if (cc.NODE_TRANSFORM_USING_AFFINE_MATRIX) {
            this._isTransformGLDirty = true;
            this._transformGL = 0.0;
        }
        this._anchorPoint = new cc.Point(0, 0);
        this._anchorPointInPixels = new cc.Point(0, 0);
        this._contentSize = new cc.Size(0, 0);
        this._contentSizeInPixels = new cc.Size(0, 0);
    },

    /**
     * @param {Array} array
     * @param {function} func
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
        //cc.Director.sharedDirector().addRegionToDirtyRegion(rect);
        //}
    },

    _isInDirtyRegion:function () {
        //if (!cc.firstRun) {
        //    return cc.Director.sharedDirector().rectIsInDirtyRegion(this.boundingBoxToWorld());
        //}
    },

    /**
     * set the dirty node
     */
    setNodeDirty:function () {
        this._setNodeDirtyForCache();
        this._isTransformDirty = this._isInverseDirty = true;
        if (cc.NODE_TRANSFORM_USING_AFFINE_MATRIX) {
            this._isTransformGLDirty = true;
        }
    },

    _setNodeDirtyForCache:function () {
        this._isCacheDirty = true;
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
        //this._addDirtyRegionToDirector(this.boundingBoxToWorld());

        this._skewX = newSkewX;

        //save dirty region when after changed
        //this._addDirtyRegionToDirector(this.boundingBoxToWorld());
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
        //this._addDirtyRegionToDirector(this.boundingBoxToWorld());

        this._skewY = newSkewY;
        //save dirty region when after changed
        //this._addDirtyRegionToDirector(this.boundingBoxToWorld());
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
        this._zOrder = z
    },

    /**
     * ertexZ getter
     * @return {Number}
     */
    getVertexZ:function () {
        return this._vertexZ / cc.CONTENT_SCALE_FACTOR();
    },

    /**
     * vertexZ setter
     * @param {Number} Var
     */
    setVertexZ:function (Var) {
        this._vertexZ = Var * cc.CONTENT_SCALE_FACTOR();
    },

    /**
     * rotation getter
     * @return {Number}
     */
    getRotation:function () {
        return this._rotation;
    },

    /**
     * rotation setter
     * @param {Number} newRotation
     */
    setRotation:function (newRotation) {
        //save dirty region when before change
        //this._addDirtyRegionToDirector(this.boundingBoxToWorld());

        this._rotation = newRotation;

        //save dirty region when after changed
        //this._addDirtyRegionToDirector(this.boundingBoxToWorld());
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
     * @param {Number} scale
     */
    setScale:function (scale) {
        //save dirty region when before change
        //this._addDirtyRegionToDirector(this.boundingBoxToWorld());

        this._scaleX = scale;
        this._scaleY = scale;

        //save dirty region when after changed
        //this._addDirtyRegionToDirector(this.boundingBoxToWorld());
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
        //this._addDirtyRegionToDirector(this.boundingBoxToWorld());

        this._scaleX = newScaleX;

        //save dirty region when after changed
        //this._addDirtyRegionToDirector(this.boundingBoxToWorld());
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
        //this._addDirtyRegionToDirector(this.boundingBoxToWorld());

        this._scaleY = newScaleY;

        //save dirty region when after changed
        //this._addDirtyRegionToDirector(this.boundingBoxToWorld());
        this.setNodeDirty();
    },

    /**
     * position setter
     * @param {cc.Point} newPosition
     */
    setPosition:function (newPosition) {
        //save dirty region when before change
        //this._addDirtyRegionToDirector(this.boundingBoxToWorld());

        this._position = newPosition;
        if (cc.CONTENT_SCALE_FACTOR() == 1) {
            this._positionInPixels = this._position;
        } else {
            this._positionInPixels = cc.ccpMult(newPosition, cc.CONTENT_SCALE_FACTOR());
        }

        //save dirty region when after changed
        //this._addDirtyRegionToDirector(this.boundingBoxToWorld());
        this.setNodeDirty();
    },

    /**
     * set position in pixels
     * @param {cc.Point} newPosition
     */
    setPositionInPixels:function (newPosition) {
        //save dirty region when before change
        //this._addDirtyRegionToDirector(this.boundingBoxToWorld());

        this._positionInPixels = newPosition;
        if (cc.CONTENT_SCALE_FACTOR() == 1) {
            this._position = this._positionInPixels;
        } else {
            this._position = cc.ccpMult(newPosition, 1 / cc.CONTENT_SCALE_FACTOR());
        }
        //save dirty region when after changed
        //this._addDirtyRegionToDirector(this.boundingBoxToWorld());
        this.setNodeDirty();// CC_NODE_TRANSFORM_USING_AFFINE_MATRIX
    },

    /**
     * get position in pixels
     * @return {cc.Point}
     */
    getPositionInPixels:function () {
        return new cc.Point(this._positionInPixels.x, this._positionInPixels.y);
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
        return new cc.Point(this._position.x, this._position.y);
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
        this.setPosition(cc.ccp(x, this._position.y));
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
        this.setPosition(cc.ccp(this._position.x, y));
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
    getIsVisible:function () {
        return this._isVisible;
    },

    /**
     * isVisible setter
     * @param {Boolean} Var
     */
    setIsVisible:function (Var) {
        this._isVisible = Var;
        //this._addDirtyRegionToDirector(this.boundingBoxToWorld());
        this.setNodeDirty();
    },

    /** <p>anchorPoint is the point around which all transformations and positioning manipulations take place.<br/>
     It's like a pin in the node where it is "attached" to its parent. <br/>
     The anchorPoint is normalized, like a percentage. (0,0) means the bottom-left corner and (1,1) means the top-right corner. <br/>
     But you can use values higher than (1,1) and lower than (0,0) too.  <br/>
     The default anchorPoint is (0.5,0.5), so it starts in the center of the node. <br/></p>
     */
    getAnchorPoint:function () {
        return new cc.Point(this._anchorPoint.x, this._anchorPoint.y);
    },

    /**
     * @param {cc.Point} point
     */
    setAnchorPoint:function (point) {
        if (!cc.Point.CCPointEqualToPoint(point, this._anchorPoint)) {
            //save dirty region when before change
            //this._addDirtyRegionToDirector(this.boundingBoxToWorld());

            this._anchorPoint = point;
            this._anchorPointInPixels = new cc.Point(this._contentSizeInPixels.width * this._anchorPoint.x,
                this._contentSizeInPixels.height * this._anchorPoint.y);

            //save dirty region when after changed
            //this._addDirtyRegionToDirector(this.boundingBoxToWorld());
            this.setNodeDirty();
        }
    },

    /** anchorPointInPixels getter
     * @return {cc.Point}
     */
    getAnchorPointInPixels:function () {
        return new cc.Point(this._anchorPointInPixels.x, this._anchorPointInPixels.y);
    },

    /**
     * @param {ss.Size} size
     */
    setContentSizeInPixels:function (size) {
        if (!cc.Size.CCSizeEqualToSize(size, this._contentSizeInPixels)) {
            //save dirty region when before change
            //this._addDirtyRegionToDirector(this.boundingBoxToWorld());
            this._contentSizeInPixels = size;
            if (cc.CONTENT_SCALE_FACTOR() == 1) {
                this._contentSize = this._contentSizeInPixels;
            } else {
                this._contentSize = new cc.Size(size.width / cc.CONTENT_SCALE_FACTOR(), size.height / cc.CONTENT_SCALE_FACTOR());
            }
            this._anchorPointInPixels = new cc.Point(this._contentSizeInPixels.width * this._anchorPoint.x,
                this._contentSizeInPixels.height * this._anchorPoint.y);

            //save dirty region when before change
            //this._addDirtyRegionToDirector(this.boundingBoxToWorld());
            this.setNodeDirty(); // CC_NODE_TRANSFORM_USING_AFFINE_MATRIX
        }
    },

    /** <p>The untransformed size of the node. <br/>
     The contentSize remains the same no matter the node is scaled or rotated.<br/>
     All nodes has a size. Layer and Scene has the same size of the screen. <br/></p>
     * @return {cc.Size}
     */
    getContentSize:function () {
        return new cc.Size(this._contentSize.width, this._contentSize.height);
    },

    /**
     * @param {cc.Size} size
     */
    setContentSize:function (size) {
        if (!cc.Size.CCSizeEqualToSize(size, this._contentSize)) {
            //save dirty region when before change
            //this._addDirtyRegionToDirector(this.boundingBoxToWorld());
            this._contentSize = size;

            if (cc.CONTENT_SCALE_FACTOR() == 1) {
                this._contentSizeInPixels = this._contentSize;
            }
            else {
                this._contentSizeInPixels = new cc.Size(size.width * cc.CONTENT_SCALE_FACTOR(), size.height * cc.CONTENT_SCALE_FACTOR());
            }

            this._anchorPointInPixels = new cc.Point(this._contentSizeInPixels.width * this._anchorPoint.x,
                this._contentSizeInPixels.height * this._anchorPoint.y);
            //save dirty region when before change
            //this._addDirtyRegionToDirector(this.boundingBoxToWorld());
            this.setNodeDirty();
        }
    },

    /**
     * @return {cc.Size}
     */
    getContentSizeInPixels:function () {
        return new cc.Size(this._contentSizeInPixels.width, this._contentSizeInPixels.height);
    },

    /**
     * isRunning getter
     * @return {Boolean}
     */
    getIsRunning:function () {
        return this._isRunning;
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

    /** isRelativeAnchorPoint getter
     * @return {Boolean}
     */
    getIsRelativeAnchorPoint:function () {
        return this._isRelativeAnchorPoint;
    },

    /** isRelativeAnchorPoint setter
     * @param {Boolean} newValue
     */
    setIsRelativeAnchorPoint:function (newValue) {
        //save dirty region when before change
        //this._addDirtyRegionToDirector(this.boundingBoxToWorld());

        this._isRelativeAnchorPoint = newValue;

        //save dirty region when before change
        //this._addDirtyRegionToDirector(this.boundingBoxToWorld());
        this.setNodeDirty();
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

    /** returns a "local" axis aligned bounding box of the node. <br/>
     * The returned box is relative only to its parent.
     * @return {Number}
     */
    boundingBox:function () {
        var ret = this.boundingBoxInPixels();
        return cc.RECT_PIXELS_TO_POINTS(ret);
    },

    /**
     * returns a "local" axis aligned bounding box of the node in pixels.<br/>
     * The returned box is relative only to its parent.<br/>
     * The returned box is in Points.
     * @return {cc.Rect}
     */
    boundingBoxInPixels:function () {
        var rect = cc.RectMake(0, 0, this._contentSizeInPixels.width, this._contentSizeInPixels.height);
        return cc.RectApplyAffineTransform(rect, this.nodeToParentTransform());
    },

    /**
     * @return {cc.Rect}
     */
    boundingBoxToWorld:function () {
        var rect = cc.RectMake(0, 0, this._contentSizeInPixels.width, this._contentSizeInPixels.height);
        rect = cc.RectApplyAffineTransform(rect, this.nodeToWorldTransform());
        rect = new cc.Rect(0 | rect.origin.x - 4, 0 | rect.origin.y - 4, 0 | rect.size.width + 8, 0 | rect.size.height + 8);
        //query child's boundingBox
        if (!this._children)
            return rect;

        for (var i = 0; i < this._children.length; i++) {
            var child = this._children[i];
            if (child && child._isVisible) {
                var childRect = child.boundingBoxToWorld();
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
        this.unscheduleAllSelectors();

        // timers
        this._arrayMakeObjectsPerformSelector(this._children, cc.Node.StateCallbackType.cleanup);
    },

    /**
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
        cc.Assert(aTag != cc.CCNODE_TAG_INVALID, "Invalid tag");
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
        var argnum = arguments.length;
        cc.Assert(child != null, "Argument must be non-nil");
        cc.Assert(child._parent == null, "child already added. It can't be added again");
        var tempzOrder = (zOrder != null) ? zOrder : child.getZOrder();
        var tmptag = (tag != null) ? tag : child.getTag();
        child.setTag(tmptag);

        if (!this._children) {
            this._childrenAlloc();
        }

        this._insertChild(child, tempzOrder);

        child.setParent(this);
        if (this._isRunning) {
            child.onEnter();
            child.onEnterTransitionDidFinish();
        }

    },

    // composition: REMOVE
    /** Remove itself from its parent node. If cleanup is true, then also remove all actions and callbacks. <br/>
     *  If the node orphan, then nothing happens.
     * @param {Boolean} cleanup
     */
    removeFromParentAndCleanup:function (cleanup) {
        this._parent.removeChild(this, cleanup);
    },

    /** <p>Removes a child from the container. It will also cleanup all running actions depending on the cleanup parameter. </p>
     *
     *<p> "remove" logic MUST only be on this method  <br/>
     * If a class want's to extend the 'removeChild' behavior it only needs <br/>
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

        if (this._children.indexOf(child) > -1) {
            this._detachChild(child, cleanup);
        }

        //this._addDirtyRegionToDirector(this.boundingBoxToWorld());
        this.setNodeDirty();
    },

    /**
     * Removes a child from the container by tag value. It will also cleanup all running actions depending on the cleanup parameter
     * @param {Number} tag
     * @param {Boolean} cleanup
     */
    removeChildByTag:function (tag, cleanup) {
        cc.Assert(tag != cc.CCNODE_TAG_INVALID, "Invalid tag");

        var child = this.getChildByTag(tag);
        if (child == null) {
            cc.Log("cocos2d: removeChildByTag: child not found!");
        }
        else {
            this.removeChild(child, cleanup);
        }
    },

    /**
     * Removes all children from the container and do a cleanup all running actions depending on the cleanup parameter.
     * @param {Boolean} cleanup
     */
    removeAllChildrenWithCleanup:function (cleanup) {
        // not using detachChild improves speed here
        if (this._children != null) {
            for (var i = 0; i < this._children.length; i++) {
                var node = this._children[i];
                if (node) {
                    // IMPORTANT:
                    //  -1st do onExit
                    //  -2nd cleanup
                    if (this._isRunning) {
                        node.onExit();
                    }
                    if (cleanup) {
                        node.cleanup();
                    }
                    // set parent nil at the end
                    node.setParent(null);
                }
            }
            this._children = [];
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
        if (this._isRunning) {
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

        //save dirty region when before change
        //this._addDirtyRegionToDirector(this.boundingBoxToWorld());

        cc.ArrayRemoveObject(this._children, child);
        this._insertChild(child, zOrder);

        //save dirty region when after changed
        //this._addDirtyRegionToDirector(this.boundingBoxToWorld());
        this.setNodeDirty();
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
        // quick return if not visible
        if (!this._isVisible) {
            return;
        }
        var context = ctx || cc.renderContext;
        context.save();

        if (this._grid && this._grid.isActive()) {
            this._grid.beforeDraw();
            this.transformAncestors();
        }

        this.transform(context);
        var i, node;
        if (this._children) {
            // draw children zOrder < 0
            for (i = 0; i < this._children.length; i++) {
                node = this._children[i];
                if (node && node._zOrder < 0) {
                    node.visit(context);
                } else {
                    break;
                }
            }
        }

        //if (this._isInDirtyRegion()) {
        // self draw
        this.draw(context);
        //}

        // draw children zOrder >= 0
        if (this._children) {
            for (; i < this._children.length; i++) {
                node = this._children[i];
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
        var context = ctx || cc.renderContext;
        // transformations
        if (cc.renderContextType == cc.CANVAS) {
            var pAp;
            if (this._isRelativeAnchorPoint) {
                if (this._parent) {
                    pAp = this._parent._anchorPointInPixels;
                } else {
                    pAp = new cc.Point(0, 0);
                }
                context.translate(0 | (this._position.x - pAp.x), -(0 | (this._position.y - pAp.y)));
            } else {
                if (this._parent) {
                    pAp = this._parent._anchorPointInPixels;
                } else {
                    pAp = new cc.Point(0, 0);
                }
                var lAp = this._anchorPointInPixels;
                context.translate(0 | ( this._position.x - pAp.x + lAp.x), -(0 | (this._position.y - pAp.y + lAp.y)));
            }

            if (this._rotation != 0) {
                context.rotate(cc.DEGREES_TO_RADIANS(this._rotation));
            }
            if ((this._scaleX != 1) || (this._scaleY != 1)) {
                context.scale(this._scaleX, this._scaleY);
            }
            if ((this._skewX != 0) || (this._skewY != 0)) {
                context.transform(1,
                    -Math.tan(cc.DEGREES_TO_RADIANS(this._skewY)),
                    -Math.tan(cc.DEGREES_TO_RADIANS(this._skewX)),
                    1, 0, 0);
            }
        } else {
            //Todo WebGL implement need fixed
            if (cc.NODE_TRANSFORM_USING_AFFINE_MATRIX) {
                // BEGIN alternative -- using cached transform
                //
                if (this._isTransformGLDirty) {
                    var t = this.nodeToParentTransform();
                    //cc.CGAffineToGL(t, this._transformGL);
                    this._isTransformGLDirty = false;
                }
                //glMultMatrixf(this._transformGL);
                if (this._vertexZ) {
                    //glTranslatef(0, 0, this._vertexZ);
                }

                // XXX: Expensive calls. Camera should be integrated into the cached affine matrix
                if (this._camera && !(this._grid && this._grid.isActive())) {
                    var translate = (this._anchorPointInPixels.x != 0.0 || this._anchorPointInPixels.y != 0.0);

                    if (translate) {
                        //cc.glTranslate(RENDER_IN_SUBPIXEL(this._anchorPointInPixels.x), RENDER_IN_SUBPIXEL(this._anchorPointInPixels.y), 0);
                    }
                    this._camera.locate();
                    if (translate) {
                        //cc.glTranslate(RENDER_IN_SUBPIXEL(-this._anchorPointInPixels.x), RENDER_IN_SUBPIXEL(-this._anchorPointInPixels.y), 0);
                    }
                }
                // END alternative
            } else {
                // BEGIN original implementation
                //
                // translate
                if (this._isRelativeAnchorPoint && (this._anchorPointInPixels.x != 0 || this._anchorPointInPixels.y != 0 )) {
                    //cc.glTranslatef(RENDER_IN_SUBPIXEL(-this._anchorPointInPixels.x), RENDER_IN_SUBPIXEL(-this._anchorPointInPixels.y), 0);
                }
                if (this._anchorPointInPixels.x != 0 || this._anchorPointInPixels.y != 0) {
                    //cc.glTranslatef(RENDER_IN_SUBPIXEL(this._positionInPixels.x + this._anchorPointInPixels.x), RENDER_IN_SUBPIXEL(this._positionInPixels.y + this._anchorPointInPixels.y), this._vertexZ);
                }
                else if (this._positionInPixels.x != 0 || this._positionInPixels.y != 0 || this._vertexZ != 0) {
                    //cc.glTranslatef(RENDER_IN_SUBPIXEL(this._positionInPixels.x), RENDER_IN_SUBPIXEL(this._positionInPixels.y), this._vertexZ);
                }
                // rotate
                if (this._rotation != 0.0) {
                    //glRotatef(-this._rotation, 0.0, 0.0, 1.0);
                }

                // skew
                //if ((skewX_ != 0.0) || (skewY_ != 0.0)) {
                //var skewMatrix = new cc.AffineTransform();
                //skewMatrix = cc.AffineTransformMake(1.0, Math.tan(cc.DEGREES_TO_RADIANS(skewY_)), Math.tan(cc.DEGREES_TO_RADIANS(skewX_)), 1.0, 0.0, 0.0);
                //TODO
                // glMatrix = new GLfloat();
                //cc.AffineToGL(skewMatrix, glMatrix);
                //TODO
                // glMultMatrixf(glMatrix);
                // }

                // scale
                if (this._scaleX != 1.0 || this._scaleY != 1.0) {
                    // glScalef(this._scaleX, this._scaleY, 1.0);
                }
                if (this._camera && !(this._grid && this._grid.isActive()))
                    this._camera.locate();

                // restore and re-position point
                if (this._anchorPointInPixels.x != 0.0 || this._anchorPointInPixels.y != 0.0) {
                    // glTranslatef(RENDER_IN_SUBPIXEL(-this._anchorPointInPixels.x), RENDER_IN_SUBPIXEL(-this._anchorPointInPixels.y), 0);
                }
                //
                // END original implementation
            }
        }
    },

    //scene managment
    /**
     * callback that is called every time the cc.Node enters the 'stage'.<br/>
     * If the cc.Node enters the 'stage' with a transition, this callback is called when the transition starts.
     * During onEnter you can't a "sister/brother" node.
     */
    onEnter:function () {
        this._arrayMakeObjectsPerformSelector(this._children, cc.Node.StateCallbackType.onEnter);
        this.resumeSchedulerAndActions();
        this._isRunning = true;
    },

    /**
     * callback that is called when the cc.Node enters in the 'stage'.  <br/>
     * If the cc.Node enters the 'stage' with a transition, this callback is called when the transition finishes.
     */
    onEnterTransitionDidFinish:function () {
        this._arrayMakeObjectsPerformSelector(this._children, cc.Node.StateCallbackType.onEnterTransitionDidFinish);
    },

    /**
     * callback that is called every time the cc.Node leaves the 'stage'.<br/>
     * If the cc.Node leaves the 'stage' with a transition, this callback is called when the transition finishes. <br/>
     * During onExit you can't access a sibling node.
     */
    onExit:function () {
        this.pauseSchedulerAndActions();
        this._isRunning = false;
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
        cc.ActionManager.sharedManager().addAction(action, this, !this._isRunning);
        return action;
    },

    /**
     * Removes all actions from the running action list
     */
    stopAllActions:function () {
        cc.ActionManager.sharedManager().removeAllActionsFromTarget(this);
    },

    /**
     * Removes an action from the running action list
     * @param {cc.Action} action
     */
    stopAction:function (action) {
        cc.ActionManager.sharedManager().removeAction(action);
    },

    /**
     * Removes an action from the running action list given its tag
     * @param {Number} tag
     */
    stopActionByTag:function (tag) {
        cc.Assert(tag != cc.CCACTION_TAG_INVALID, "Invalid tag");
        cc.ActionManager.sharedManager().removeActionByTag(tag, this);
    },

    /**
     * Gets an action from the running action list given its tag
     * @param {Number} tag
     * @return {cc.Action}
     */
    getActionByTag:function (tag) {
        cc.Assert(tag != cc.CCACTION_TAG_INVALID, "Invalid tag");
        return cc.ActionManager.sharedManager().getActionByTag(tag, this);
    },

    /** Returns the numbers of actions that are running plus the ones that are schedule to run (actions in actionsToAdd and actions arrays).<br/>
     *    Composable actions are counted as 1 action. Example:<br/>
     *    If you are running 1 Sequence of 7 actions, it will return 1. <br/>
     *    If you are running 7 Sequences of 2 actions, it will return 7.
     * @return {Number}
     */
    numberOfRunningActions:function () {
        return cc.ActionManager.sharedManager.numberOfRunningActionsInTarget(this);
    },

    // cc.Node - Callbacks
    // timers

    /**
     * check whether a selector is scheduled.
     * @param {function} selector
     */
    isScheduled:function (selector) {
        //can't find this function in the cc.Node.cpp file
    },

    /**
     * schedules the "update" method. It will use the order number 0. This method will be called every frame.<br/>
     * Scheduled methods with a lower order value will be called before the ones that have a higher order value.<br/>
     * Only one "update" method could be scheduled per node.
     */
    scheduleUpdate:function () {
        this.scheduleUpdateWithPriority(0);
    },

    /**
     * schedules the "update" selector with a custom priority. This selector will be called every frame.<br/>
     * Scheduled selectors with a lower priority will be called before the ones that have a higher value.<br/>
     * Only one "update" selector could be scheduled per node (You can't have 2 'update' selectors).<br/>
     * @param {Number} priority
     */
    scheduleUpdateWithPriority:function (priority) {
        cc.Scheduler.sharedScheduler().scheduleUpdateForTarget(this, priority, !this._isRunning);
    },

    /**
     * unschedules the "update" method.
     */
    unscheduleUpdate:function () {
        cc.Scheduler.sharedScheduler().unscheduleUpdateForTarget(this);
    },

    /**
     * schedule
     * @param {function} selector
     * @param {Number} interval
     */
    schedule:function (selector, interval) {
        if (!interval)
            interval = 0;

        cc.Assert(selector, "Argument must be non-nil");
        cc.Assert(interval >= 0, "Argument must be positive");
        cc.Scheduler.sharedScheduler().scheduleSelector(selector, this, interval, !this._isRunning);
    },

    /**
     * unschedules a custom selector.
     * @param {function} selector
     */
    unschedule:function (selector) {
        // explicit nil handling
        if (!selector)
            return;

        cc.Scheduler.sharedScheduler().unscheduleSelector(selector, this);
    },

    /**
     * unschedule all scheduled selectors: custom selectors, and the 'update' selector.<br/>
     * Actions are not affected by this method.
     */
    unscheduleAllSelectors:function () {
        cc.Scheduler.sharedScheduler().unscheduleAllSelectorsForTarget(this);
    },

    /**
     * resumes all scheduled selectors and actions.<br/>
     * Called internally by onEnter
     */
    resumeSchedulerAndActions:function () {
        cc.Scheduler.sharedScheduler().resumeTarget(this);
        cc.ActionManager.sharedManager().resumeTarget(this);
    },

    /**
     * pauses all scheduled selectors and actions.<br/>
     * Called internally by onExit
     */
    pauseSchedulerAndActions:function () {
        cc.Scheduler.sharedScheduler().pauseTarget(this);
        cc.ActionManager.sharedManager().pauseTarget(this);
    },

    /** Returns the matrix that transform the node's (local) space coordinates into the parent's space coordinates.<br/>
     * The matrix is in Pixels.
     * @return {cc.AffineTransform}
     */
    nodeToParentTransform:function () {
        if (this._isTransformDirty) {
            this._transform = cc.AffineTransformIdentity();
            if (!this._isRelativeAnchorPoint && !cc.Point.CCPointEqualToPoint(this._anchorPointInPixels, cc.PointZero())) {
                this._transform = cc.AffineTransformTranslate(this._transform, this._anchorPointInPixels.x, this._anchorPointInPixels.y);
            }

            if (!cc.Point.CCPointEqualToPoint(this._positionInPixels, cc.PointZero())) {
                this._transform = cc.AffineTransformTranslate(this._transform, this._positionInPixels.x, this._positionInPixels.y);
            }

            if (this._rotation != 0) {
                this._transform = cc.AffineTransformRotate(this._transform, -cc.DEGREES_TO_RADIANS(this._rotation));
            }

            if (this._skewX != 0 || this._skewY != 0) {
                // create a skewed coordinate system
                var skew = cc.AffineTransformMake(1.0, Math.tan(cc.DEGREES_TO_RADIANS(this._skewY)), Math.tan(cc.DEGREES_TO_RADIANS(this._skewX)), 1.0, 0.0, 0.0);
                // apply the skew to the transform
                this._transform = cc.AffineTransformConcat(skew, this._transform);
            }

            if (!(this._scaleX == 1 && this._scaleY == 1)) {
                this._transform = cc.AffineTransformScale(this._transform, this._scaleX, this._scaleY);
            }

            if (!cc.Point.CCPointEqualToPoint(this._anchorPointInPixels, cc.PointZero())) {
                this._transform = cc.AffineTransformTranslate(this._transform, -this._anchorPointInPixels.x, -this._anchorPointInPixels.y);
            }

            this._isTransformDirty = false;
        }

        return this._transform;
    },

    /**
     * Returns the matrix that transform parent's space coordinates to the node's (local) space coordinates.<br/>
     * The matrix is in Pixels.
     * @return {Number}
     */
    parentToNodeTransform:function () {
        if (this._isInverseDirty) {
            this._inverse = cc.AffineTransformInvert(this.nodeToParentTransform());
            this._isInverseDirty = false;
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
        var ret = new cc.Point();
        if (cc.CONTENT_SCALE_FACTOR() == 1) {
            ret = cc.PointApplyAffineTransform(worldPoint, this.worldToNodeTransform());
        }
        else {
            ret = cc.ccpMult(worldPoint, cc.CONTENT_SCALE_FACTOR());
            ret = cc.PointApplyAffineTransform(ret, this.worldToNodeTransform());
            ret = cc.ccpMult(ret, 1 / cc.CONTENT_SCALE_FACTOR());
        }
        return ret;
    },

    /**
     * Converts a Point to world space coordinates. The result is in Points.
     * @param {cc.Point} nodePoint
     * @return {cc.Point}
     */
    convertToWorldSpace:function (nodePoint) {
        var ret = new cc.Point();
        if (cc.CONTENT_SCALE_FACTOR() == 1) {
            ret = cc.PointApplyAffineTransform(nodePoint, this.nodeToWorldTransform());
        }
        else {
            ret = cc.ccpMult(nodePoint, cc.CONTENT_SCALE_FACTOR());
            ret = cc.PointApplyAffineTransform(ret, this.nodeToWorldTransform());
            ret = cc.ccpMult(ret, 1 / cc.CONTENT_SCALE_FACTOR());
        }

        return ret;
    },

    /**
     * Converts a Point to node (local) space coordinates. The result is in Points.<br/>
     * treating the returned/received node point as anchor relative.
     * @param {cc.Point} worldPoint
     * @return {cc.Point}
     */
    convertToNodeSpaceAR:function (worldPoint) {
        var nodePoint = this.convertToNodeSpace(worldPoint);
        var anchorInPoints = new cc.Point();
        if (cc.CONTENT_SCALE_FACTOR() == 1) {
            anchorInPoints = this._anchorPointInPixels;
        } else {
            anchorInPoints = cc.ccpMult(this._anchorPointInPixels, 1 / cc.CONTENT_SCALE_FACTOR());
        }
        return cc.ccpSub(nodePoint, anchorInPoints);
    },

    /**
     * Converts a local Point to world space coordinates.The result is in Points.<br/>
     * treating the returned/received node point as anchor relative.
     * @param {cc.Point} nodePoint
     * @return {cc.Point}
     */
    convertToWorldSpaceAR:function (nodePoint) {
        var anchorInPoints = new cc.Point();
        if (cc.CONTENT_SCALE_FACTOR() == 1) {
            anchorInPoints = this._anchorPointInPixels;
        } else {
            anchorInPoints = cc.ccpMult(this._anchorPointInPixels, 1 / cc.CONTENT_SCALE_FACTOR());
        }
        var pt = new cc.Point();
        pt = cc.ccpAdd(nodePoint, anchorInPoints);
        return this.convertToWorldSpace(pt);
    },

    /**
     * @param nodePoint
     * @return {cc.Point}
     * @private
     */
    _convertToWindowSpace:function (nodePoint) {
        var worldPoint = new cc.Point();
        worldPoint = this.convertToWorldSpace(nodePoint);
        return cc.Director.sharedDirector().convertToUI(worldPoint);
    },

    /** convenience methods which take a cc.Touch instead of cc.Point
     * @param {cc.Touch} touch
     * @return {cc.Point}
     */
    convertTouchToNodeSpace:function (touch) {
        var point = touch.locationInView(touch.view());
        point = cc.Director.sharedDirector().convertToGL(point);
        return this.convertToNodeSpace(point);
    },

    /**
     * converts a cc.Touch (world coordinates) into a local coordiante. This method is AR (Anchor Relative).
     * @param {cc.Touch}touch
     * @return {cc.Point}
     */
    convertTouchToNodeSpaceAR:function (touch) {
        var point = touch.locationInView(touch.view());
        point = cc.Director.sharedDirector().convertToGL(point);
        return this.convertToNodeSpaceAR(point);
    },

    /** implement cc.Object's method
     * @param {Number} dt
     */
    update:function (dt) {
    }
});

/**
 * cc.Node's state callback type
 * @constant
 * @type Number
 */
cc.Node.StateCallbackType = {onEnter:1, onExit:2, cleanup:3, onEnterTransitionDidFinish:4, updateTransform:5};


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

