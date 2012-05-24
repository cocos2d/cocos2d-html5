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

cc.kCCNodeTagInvalid = -1;
cc.kCCNodeOnEnter = null;
cc.kCCNodeOnExit = null;

cc.saveContext = function () {
    if (cc.renderContextType == cc.kCanvas) {
        cc.renderContext.save();
    } else {
        //glPushMatrix();
    }
};
cc.restoreContext = function () {
    if (cc.renderContextType == cc.kCanvas) {
        cc.renderContext.restore();
    } else {
        //glPopMatrix();
    }
};

/** @brief cc.Node is the main element. Anything thats gets drawn or contains things that get drawn is a cc.Node.
 The most popular CCNodes are: CCScene, CCLayer, CCSprite, CCMenu.

 The main features of a cc.Node are:
 - They can contain other cc.Node nodes (addChild, getChildByTag, removeChild, etc)
 - They can schedule periodic callback (schedule, unschedule, etc)
 - They can execute actions (runAction, stopAction, etc)

 Some cc.Node nodes provide extra functionality for them or their children.

 Subclassing a cc.Node usually means (one/all) of:
 - overriding init to initialize resources and schedule callbacks
 - create callbacks to handle the advancement of time
 - overriding draw to render the node

 Features of cc.Node:
 - position
 - scale (x, y)
 - rotation (in degrees, clockwise)
 - CCCamera (an interface to gluLookAt )
 - CCGridBase (to do mesh transformations)
 - anchor point
 - size
 - visible
 - z-order
 - openGL z position

 Default values:
 - rotation: 0
 - position: (x=0,y=0)
 - scale: (x=1,y=1)
 - contentSize: (x=0,y=0)
 - anchorPoint: (x=0,y=0)

 Limitations:
 - A cc.Node is a "void" object. It doesn't have a texture

 Order in transformations with grid disabled
 -# The node will be translated (position)
 -# The node will be rotated (rotation)
 -# The node will be scaled (scale)
 -# The node will be moved according to the camera values (camera)

 Order in transformations with grid enabled
 -# The node will be translated (position)
 -# The node will be rotated (rotation)
 -# The node will be scaled (scale)
 -# The grid will capture the screen
 -# The node will be moved according to the camera values (camera)
 -# The grid will render the captured screen

 Camera:
 - Each node has a camera. By default it points to the center of the cc.Node.
 */

cc.Node = cc.Class.extend({
    _m_nZOrder:0,
    _m_fVertexZ:0.0,
    _m_fRotation:0.0,
    _m_fScaleX:1.0,
    _m_fScaleY:1.0,
    _m_tPosition:cc.PointZero(),
    _m_tPositionInPixels:cc.PointZero(),
    _m_fSkewX:0.0,
    _m_fSkewY:0.0,
    // children (lazy allocs),
    _m_pChildren:null,
    // lazy alloc,
    _m_pCamera:null,
    _m_pGrid:null,
    _m_bIsVisible:true,
    _m_tAnchorPoint:new cc.Point(0, 0),
    _m_tAnchorPointInPixels:new cc.Point(0, 0),
    _m_tContentSize:cc.SizeZero(),
    _m_tContentSizeInPixels:cc.SizeZero(),
    _m_bIsRunning:false,
    _m_pParent:null,
    // "whole screen" objects. like Scenes and Layers, should set isRelativeAnchorPoint to false
    _m_bIsRelativeAnchorPoint:true,
    _m_nTag:cc.kCCNodeTagInvalid,
    // userData is always inited as nil
    _m_pUserData:null,
    _m_bIsTransformDirty:true,
    _m_bIsInverseDirty:true,
    _isCacheDirty:true,
    _m_bIsTransformGLDirty:null,
    _m_tTransform:null,
    _m_tInverse:null,
    _m_pTransformGL:null,

    ctor:function () {
        if (cc.NODE_TRANSFORM_USING_AFFINE_MATRIX) {
            this._m_bIsTransformGLDirty = true;
            this._m_pTransformGL = 0.0;
        }
        this._m_tAnchorPoint = new cc.Point(0, 0);
        this._m_tAnchorPointInPixels = new cc.Point(0, 0);
        this._m_tContentSize = new cc.Size(0,0);
        this._m_tContentSizeInPixels = new cc.Size(0,0);
    },

    _arrayMakeObjectsPerformSelector:function (pArray, func) {
        if (pArray && pArray.length > 0) {
            for (var i = 0; i < pArray.length; i++) {
                var pNode = pArray[i];
                if (pNode && (typeof(func) == "string")) {
                    pNode[func]();
                } else if (pNode && (typeof(func) == "function")) {
                    func.call(pNode);
                }
            }
        }
    },
    _addDirtyRegionToDirector:function (rect) {
        //if (!cc.s_bFirstRun) {
            //cc.Director.sharedDirector().addRegionToDirtyRegion(rect);
        //}
    },
    _isInDirtyRegion:function () {
        //if (!cc.s_bFirstRun) {
        //    return cc.Director.sharedDirector().rectIsInDirtyRegion(this.boundingBoxToWorld());
        //}
    },

    setNodeDirty:function () {
        this._setNodeDirtyForCache();
        this._m_bIsTransformDirty = this._m_bIsInverseDirty = true;
        if (cc.NODE_TRANSFORM_USING_AFFINE_MATRIX) {
            this._m_bIsTransformGLDirty = true;
        }
    },

    _setNodeDirtyForCache:function () {
        this._isCacheDirty = true;
        if (this._m_pParent) {
            this._m_pParent._setNodeDirtyForCache();
        }
    },

    getSkewX:function () {
        return this._m_fSkewX;
    },
    setSkewX:function (newSkewX) {
        //save dirty region when before change
        //this._addDirtyRegionToDirector(this.boundingBoxToWorld());

        this._m_fSkewX = newSkewX;

        //save dirty region when after changed
        //this._addDirtyRegionToDirector(this.boundingBoxToWorld());
        this.setNodeDirty();
    },
    getSkewY:function () {
        return this._m_fSkewY;
    },
    setSkewY:function (newSkewY) {
        //save dirty region when before change
        //this._addDirtyRegionToDirector(this.boundingBoxToWorld());

        this._m_fSkewY = newSkewY;
        //save dirty region when after changed
        //this._addDirtyRegionToDirector(this.boundingBoxToWorld());
        this.setNodeDirty();
    },

    // zOrder getter
    getZOrder:function () {
        return this._m_nZOrder;
    },
    // zOrder setter : private method
    // used internally to alter the zOrder variable. DON'T call this method manually
    _setZOrder:function (z) {
        this._m_nZOrder = z
    },
    // ertexZ getter
    getVertexZ:function () {
        return this._m_fVertexZ / cc.CONTENT_SCALE_FACTOR();
    },
    // vertexZ setter
    setVertexZ:function (Var) {
        this._m_fVertexZ = Var * cc.CONTENT_SCALE_FACTOR();
    },
    // rotation getter
    getRotation:function () {
        return this._m_fRotation;
    },
    // rotation setter
    setRotation:function (newRotation) {
        //save dirty region when before change
        //this._addDirtyRegionToDirector(this.boundingBoxToWorld());

        this._m_fRotation = newRotation;

        //save dirty region when after changed
        //this._addDirtyRegionToDirector(this.boundingBoxToWorld());
        this.setNodeDirty();
    },
    /** Get the scale factor of the node.
     @warning: Assert when _m_fScaleX != _m_fScaleY.
     */
    getScale:function () {
        cc.Assert(this._m_fScaleX == this._m_fScaleY, "cc.Node#scale. ScaleX != ScaleY. Don't know which one to return");
        return this._m_fScaleX;
    },
    /** The scale factor of the node. 1.0 is the default scale factor. It modifies the X and Y scale at the same time. */
    setScale:function (scale) {
        //save dirty region when before change
        //this._addDirtyRegionToDirector(this.boundingBoxToWorld());

        this._m_fScaleX = scale;
        this._m_fScaleY = scale;

        //save dirty region when after changed
        //this._addDirtyRegionToDirector(this.boundingBoxToWorld());
        this.setNodeDirty();
    },
    /// scaleX getter
    getScaleX:function () {
        return this._m_fScaleX;
    },
    /// scaleX setter
    setScaleX:function (newScaleX) {
        //save dirty region when before change
        //this._addDirtyRegionToDirector(this.boundingBoxToWorld());

        this._m_fScaleX = newScaleX;

        //save dirty region when after changed
        //this._addDirtyRegionToDirector(this.boundingBoxToWorld());
        this.setNodeDirty();
    },
    /// scaleY getter
    getScaleY:function () {
        return this._m_fScaleY;
    },
    /// scaleY setter
    setScaleY:function (newScaleY) {
        //save dirty region when before change
        //this._addDirtyRegionToDirector(this.boundingBoxToWorld());

        this._m_fScaleY = newScaleY;

        //save dirty region when after changed
        //this._addDirtyRegionToDirector(this.boundingBoxToWorld());
        this.setNodeDirty();
    },
    /// position setter
    setPosition:function (newPosition) {
        //save dirty region when before change
        //this._addDirtyRegionToDirector(this.boundingBoxToWorld());

        this._m_tPosition = newPosition;
        if (cc.CONTENT_SCALE_FACTOR() == 1) {
            this._m_tPositionInPixels = this._m_tPosition;
        } else {
            this._m_tPositionInPixels = cc.ccpMult(newPosition, cc.CONTENT_SCALE_FACTOR());
        }

        //save dirty region when after changed
        //this._addDirtyRegionToDirector(this.boundingBoxToWorld());
        this.setNodeDirty();
    },
    setPositionInPixels:function (newPosition) {
        //save dirty region when before change
        //this._addDirtyRegionToDirector(this.boundingBoxToWorld());

        this._m_tPositionInPixels = newPosition;
        if (cc.CONTENT_SCALE_FACTOR() == 1) {
            this._m_tPosition = this._m_tPositionInPixels;
        } else {
            this._m_tPosition = cc.ccpMult(newPosition, 1 / cc.CONTENT_SCALE_FACTOR());
        }
        //save dirty region when after changed
        //this._addDirtyRegionToDirector(this.boundingBoxToWorld());
        this.setNodeDirty();// CC_NODE_TRANSFORM_USING_AFFINE_MATRIX
    },
    getPositionInPixels:function () {
        return new cc.Point(this._m_tPositionInPixels.x, this._m_tPositionInPixels.y);
    },
    /** get/set Position for Lua (pass number faster than CCPoint object)

     lua code:
     local x, y = node:getPosition()    -- return x, y values from C++
     local x    = node:getPositionX()
     local y    = node:getPositionY()
     node:setPosition(x, y)             -- pass x, y values to C++
     node:setPositionX(x)
     node:setPositionY(y)
     node:setPositionInPixels(x, y)     -- pass x, y values to C++
     */
    getPosition:function () {
        return new cc.Point(this._m_tPosition.x, this._m_tPosition.y);
    },
    getPositionX:function () {
        return this._m_tPosition.x;
    },
    setPositionX:function (x) {
        this.setPosition(cc.ccp(x, this._m_tPosition.y));
    },
    getPositionY:function () {
        return  this._m_tPosition.y;
    },
    setPositionY:function (y) {
        this.setPosition(cc.ccp(this._m_tPosition.x, y));
    },
    /** Get children count */
    getChildrenCount:function () {
        return this._m_pChildren ? this._m_pChildren.length : 0;
    },
    /// children getter
    getChildren:function () {
        return this._m_pChildren;
    },
    /// camera getter: lazy alloc
    getCamera:function () {
        if (!this._m_pCamera) {
            this._m_pCamera = new cc.Camera();
        }
        return this._m_pCamera;
    },
    /// grid getter
    getGrid:function () {
        return this._m_pGrid;
    },
    /// grid setter
    setGrid:function (pGrid) {
        this._m_pGrid = pGrid;
    },
    /// isVisible getter
    getIsVisible:function () {
        return this._m_bIsVisible;
    },
    /// isVisible setter
    setIsVisible:function (Var) {
        this._m_bIsVisible = Var;
        //this._addDirtyRegionToDirector(this.boundingBoxToWorld());
        this.setNodeDirty();
    },

    /** anchorPoint is the point around which all transformations and positioning manipulations take place.
     It's like a pin in the node where it is "attached" to its parent.
     The anchorPoint is normalized, like a percentage. (0,0) means the bottom-left corner and (1,1) means the top-right corner.
     But you can use values higher than (1,1) and lower than (0,0) too.
     The default anchorPoint is (0.5,0.5), so it starts in the center of the node.
     @since v0.8
     */
    getAnchorPoint:function () {
        return new cc.Point(this._m_tAnchorPoint.x, this._m_tAnchorPoint.y);
    },
    setAnchorPoint:function (point) {
        if (!cc.Point.CCPointEqualToPoint(point, this._m_tAnchorPoint)) {
            //save dirty region when before change
            //this._addDirtyRegionToDirector(this.boundingBoxToWorld());

            this._m_tAnchorPoint = point;
            this._m_tAnchorPointInPixels = new cc.Point(this._m_tContentSizeInPixels.width * this._m_tAnchorPoint.x,
                this._m_tContentSizeInPixels.height * this._m_tAnchorPoint.y);

            //save dirty region when after changed
            //this._addDirtyRegionToDirector(this.boundingBoxToWorld());
            this.setNodeDirty();
        }
    },
    /// anchorPointInPixels getter
    getAnchorPointInPixels:function () {
        return new cc.Point(this._m_tAnchorPointInPixels.x, this._m_tAnchorPointInPixels.y);
    },
    setContentSizeInPixels:function (size) {
        if (!cc.Size.CCSizeEqualToSize(size, this._m_tContentSizeInPixels)) {
            //save dirty region when before change
            //this._addDirtyRegionToDirector(this.boundingBoxToWorld());
            this._m_tContentSizeInPixels = size;
            if (cc.CONTENT_SCALE_FACTOR() == 1) {
                this._m_tContentSize = this._m_tContentSizeInPixels;
            } else {
                this._m_tContentSize = new cc.Size(size.width / cc.CONTENT_SCALE_FACTOR(), size.height / cc.CONTENT_SCALE_FACTOR());
            }
            this._m_tAnchorPointInPixels = new cc.Point(this._m_tContentSizeInPixels.width * this._m_tAnchorPoint.x,
                this._m_tContentSizeInPixels.height * this._m_tAnchorPoint.y);

            //save dirty region when before change
            //this._addDirtyRegionToDirector(this.boundingBoxToWorld());
            this.setNodeDirty(); // CC_NODE_TRANSFORM_USING_AFFINE_MATRIX
        }
    },
    /** The untransformed size of the node.
     The contentSize remains the same no matter the node is scaled or rotated.
     All nodes has a size. Layer and Scene has the same size of the screen.
     @since v0.8
     */
    getContentSize:function () {
        return new cc.Size(this._m_tContentSize.width, this._m_tContentSize.height);
    },
    setContentSize:function (size) {
        if (!cc.Size.CCSizeEqualToSize(size, this._m_tContentSize)) {
            //save dirty region when before change
            //this._addDirtyRegionToDirector(this.boundingBoxToWorld());
            this._m_tContentSize = size;

            if (cc.CONTENT_SCALE_FACTOR() == 1) {
                this._m_tContentSizeInPixels = this._m_tContentSize;
            }
            else {
                this._m_tContentSizeInPixels = new cc.Size(size.width * cc.CONTENT_SCALE_FACTOR(), size.height * cc.CONTENT_SCALE_FACTOR());
            }

            this._m_tAnchorPointInPixels = new cc.Point(this._m_tContentSizeInPixels.width * this._m_tAnchorPoint.x,
                this._m_tContentSizeInPixels.height * this._m_tAnchorPoint.y);
            //save dirty region when before change
            //this._addDirtyRegionToDirector(this.boundingBoxToWorld());
            this.setNodeDirty();
        }
    },
    getContentSizeInPixels:function () {
        return new cc.Size(this._m_tContentSizeInPixels.width, this._m_tContentSizeInPixels.height);
    },
    // isRunning getter
    getIsRunning:function () {
        return this._m_bIsRunning;
    },
    /// parent getter
    getParent:function () {
        return this._m_pParent;
    },
    /// parent setter
    setParent:function (Var) {
        this._m_pParent = Var;
    },
    /// isRelativeAnchorPoint getter
    getIsRelativeAnchorPoint:function () {
        return this._m_bIsRelativeAnchorPoint;
    },
    /// isRelativeAnchorPoint setter
    setIsRelativeAnchorPoint:function (newValue) {
        //save dirty region when before change
        //this._addDirtyRegionToDirector(this.boundingBoxToWorld());

        this._m_bIsRelativeAnchorPoint = newValue;

        //save dirty region when before change
        //this._addDirtyRegionToDirector(this.boundingBoxToWorld());
        this.setNodeDirty();
    },
    /// tag getter
    getTag:function () {
        return this._m_nTag;
    },
    /// tag setter
    setTag:function (Var) {
        this._m_nTag = Var;
    },
    getUserData:function () {
        return this._m_pUserData;
    },
    setUserData:function (Var) {
        this._m_pUserData = Var;
    },
    /** returns a "local" axis aligned bounding box of the node.
     The returned box is relative only to its parent.

     @since v0.8.2
     */
    boundingBox:function () {
        var ret = this.boundingBoxInPixels();
        return cc.RECT_PIXELS_TO_POINTS(ret);
    },
    /** returns a "local" axis aligned bounding box of the node in pixels.
     The returned box is relative only to its parent.
     The returned box is in Points.

     @since v0.99.5
     */
    boundingBoxInPixels:function () {
        var rect = cc.RectMake(0, 0, this._m_tContentSizeInPixels.width, this._m_tContentSizeInPixels.height);
        return cc.RectApplyAffineTransform(rect, this.nodeToParentTransform());
    },

    boundingBoxToWorld:function () {
        var rect = cc.RectMake(0, 0, this._m_tContentSizeInPixels.width, this._m_tContentSizeInPixels.height);
        rect = cc.RectApplyAffineTransform(rect, this.nodeToWorldTransform());
        rect = new cc.Rect(0 | rect.origin.x - 4, 0 | rect.origin.y - 4, 0 | rect.size.width + 8, 0 | rect.size.height + 8);
        //query child's boundingBox
        if (!this._m_pChildren)
            return rect;

        for (var i = 0; i < this._m_pChildren.length; i++) {
            var child = this._m_pChildren[i];
            if (child && child._m_bIsVisible) {
                var childRect = child.boundingBoxToWorld();
                if (childRect) {
                    rect = cc.Rect.CCRectUnion(rect, childRect);
                }
            }
        }
        return rect;
    },
    /** Stops all running actions and schedulers
     @since v0.8
     */
    cleanup:function () {
        // actions
        this.stopAllActions();
        this.unscheduleAllSelectors();

        // timers
        this._arrayMakeObjectsPerformSelector(this._m_pChildren, "cleanup");
    },
    description:function () {
        return "<cc.Node | Tag =" + this._m_nTag + ">";
    },
    _childrenAlloc:function () {
        this._m_pChildren = [];
    },
    // composition: GET
    /** Gets a child from the container given its tag
     @return returns a cc.Node object
     @since v0.7.1
     */
    getChildByTag:function (aTag) {
        cc.Assert(aTag != cc.kCCNodeTagInvalid, "Invalid tag");
        if (this._m_pChildren != null) {
            for (var i = 0; i < this._m_pChildren.length; i++) {
                var pNode = this._m_pChildren[i];
                if (pNode && pNode._m_nTag == aTag){
                    return pNode;
                }
            }
        }
        //throw "not found";
        return null;
    },
    // composition: ADD

    /* "add" logic MUST only be on this method
     * If a class want's to extend the 'addChild' behaviour it only needs
     * to override this method
     */
    addChild:function (child, zOrder, tag) {
        var argnum = arguments.length;
        cc.Assert(child != null, "Argument must be non-nil");
        cc.Assert(child._m_pParent == null, "child already added. It can't be added again");
        var tempzOrder = (zOrder!=null) ? zOrder : child.getZOrder();
        var tmptag =  (tag!=null) ? tag : child.getTag();
        child.setTag(tmptag);

        if (!this._m_pChildren) {
            this._childrenAlloc();
        }

        this._insertChild(child, tempzOrder);

        child.setParent(this);
        if (this._m_bIsRunning) {
            child.onEnter();
            child.onEnterTransitionDidFinish();
        }

    },
    // composition: REMOVE

    /** Remove itself from its parent node. If cleanup is true, then also remove all actions and callbacks.
     If the node orphan, then nothing happens.
     @since v0.99.3
     */
    removeFromParentAndCleanup:function (cleanup) {
        this._m_pParent.removeChild(this, cleanup);
    },
    /** Removes a child from the container. It will also cleanup all running actions depending on the cleanup parameter.
     @since v0.7.1
     */
    /* "remove" logic MUST only be on this method
     * If a class want's to extend the 'removeChild' behavior it only needs
     * to override this method
     */
    removeChild:function (child, cleanup) {
        // explicit nil handling
        if (this._m_pChildren == null) {
            return;
        }

        if (this._m_pChildren.indexOf(child) > -1) {
            this._detachChild(child, cleanup);
        }

        //this._addDirtyRegionToDirector(this.boundingBoxToWorld());
        this.setNodeDirty();
    },
    /** Removes a child from the container by tag value. It will also cleanup all running actions depending on the cleanup parameter
     @since v0.7.1
     */
    removeChildByTag:function (tag, cleanup) {
        cc.Assert(tag != cc.kCCNodeTagInvalid, "Invalid tag");

        var child = this.getChildByTag(tag);
        if (child == null) {
            cc.LOG("cocos2d: removeChildByTag: child not found!");
        }
        else {
            this.removeChild(child, cleanup);
        }
    },
    /** Removes all children from the container and do a cleanup all running actions depending on the cleanup parameter.
     @since v0.7.1
     */
    removeAllChildrenWithCleanup:function (cleanup) {
        // not using detachChild improves speed here
        if (this._m_pChildren != null) {
            for (var i = 0; i < this._m_pChildren.length; i++) {
                var pNode = this._m_pChildren[i];
                if (pNode) {
                    // IMPORTANT:
                    //  -1st do onExit
                    //  -2nd cleanup
                    if (this._m_bIsRunning) {
                        pNode.onExit();
                    }
                    if (cleanup) {
                        pNode.cleanup();
                    }
                    // set parent nil at the end
                    pNode.setParent(null);
                }
            }
            this._m_pChildren = [];
        }
    },
    _detachChild:function (child, doCleanup) {
        // IMPORTANT:
        //  -1st do onExit
        //  -2nd cleanup
        if (this._m_bIsRunning) {
            child.onExit();
        }

        // If you don't do cleanup, the child's actions will not get removed and the
        // its scheduledSelectors_ dict will not get released!
        if (doCleanup) {
            child.cleanup();
        }

        // set parent nil at the end
        child.setParent(null);

        cc.ArrayRemoveObject(this._m_pChildren, child);
    },
    // helper used by reorderChild & add
    _insertChild:function (child, z) {
        var a = this._m_pChildren[this._m_pChildren.length - 1];
        if (!a || a.getZOrder() <= z) {
            this._m_pChildren.push(child);
        } else {
            for (var i = 0; i < this._m_pChildren.length; i++) {
                var pNode = this._m_pChildren[i];
                if (pNode && (pNode.getZOrder() > z )) {
                    this._m_pChildren = cc.ArrayAppendObjectToIndex(this._m_pChildren, child, i);
                    break;
                }
            }
        }
        child._setZOrder(z);
    },
    /** Reorders a child according to a new z value.
     * The child MUST be already added.
     */
    reorderChild:function (child, zOrder) {
        cc.Assert(child != null, "Child must be non-nil");

        //save dirty region when before change
        //this._addDirtyRegionToDirector(this.boundingBoxToWorld());

        cc.ArrayRemoveObject(this._m_pChildren, child);
        this._insertChild(child, zOrder);

        //save dirty region when after changed
        //this._addDirtyRegionToDirector(this.boundingBoxToWorld());
        this.setNodeDirty();
    },
    // draw

    /** Override this method to draw your own node.
     The following GL states will be enabled by default:
     - glEnableClientState(GL_VERTEX_ARRAY);
     - glEnableClientState(GL_COLOR_ARRAY);
     - glEnableClientState(GL_TEXTURE_COORD_ARRAY);
     - glEnable(GL_TEXTURE_2D);

     AND YOU SHOULD NOT DISABLE THEM AFTER DRAWING YOUR NODE

     But if you enable any other GL state, you should disable it after drawing your node.
     */
    draw:function (ctx) {
        //CCAssert(0);
        // override me
        // Only use- this function to draw your staff.
        // DON'T draw your stuff outside this method
    },

    /** recursive method that visit its children and draw them */
    visit:function (ctx) {
        // quick return if not visible
        if (!this._m_bIsVisible) {
            return;
        }
        var context = ctx || cc.renderContext;
        context.save();

        if (this._m_pGrid && this._m_pGrid.isActive()) {
            this._m_pGrid.beforeDraw();
            this.transformAncestors();
        }

        this.transform(context);
        if (this._m_pChildren) {
            // draw children zOrder < 0
            for (var i = 0; i < this._m_pChildren.length; i++) {
                var pNode = this._m_pChildren[i];
                if (pNode && pNode._m_nZOrder < 0) {
                    pNode.visit(context);
                }
            }
        }

        //if (this._isInDirtyRegion()) {
        // self draw
        this.draw(context);
        //}

        // draw children zOrder >= 0
        if (this._m_pChildren) {
            for (var i = 0; i < this._m_pChildren.length; i++) {
                var pNode = this._m_pChildren[i];
                if (pNode && pNode._m_nZOrder >= 0) {
                    pNode.visit(context);
                }
            }
        }

        if (this._m_pGrid && this._m_pGrid.isActive()) {
            this._m_pGrid.afterDraw(this);
        }

        context.restore();
    },
    /** performs OpenGL view-matrix transformation of it's ancestors.
     Generally the ancestors are already transformed, but in certain cases (eg: attaching a FBO)
     it's necessary to transform the ancestors again.
     @since v0.7.2
     */
    transformAncestors:function () {
        if (this._m_pParent != null) {
            this._m_pParent.transformAncestors();
            this._m_pParent.transform();
        }
    },

    // transformations
    /** performs OpenGL view-matrix transformation based on position, scale, rotation and other attributes. */
    transform:function (ctx) {
        var context = ctx || cc.renderContext;
        // transformations
        if (cc.renderContextType == cc.kCanvas) {
            if (this._m_bIsRelativeAnchorPoint) {
                var pAp = new cc.Point(0, 0);
                if (this._m_pParent) {
                    pAp = this._m_pParent._m_tAnchorPointInPixels;
                }
                context.translate(0 | (this._m_tPosition.x - pAp.x), -(0 | (this._m_tPosition.y - pAp.y)));
            } else {
                var pAp = new cc.Point(0, 0);
                if (this._m_pParent) {
                    pAp = this._m_pParent._m_tAnchorPointInPixels;
                }
                var lAp = this._m_tAnchorPointInPixels;
                context.translate(0 | ( this._m_tPosition.x - pAp.x + lAp.x), -(0 | (this._m_tPosition.y - pAp.y + lAp.y)));
            }

            if (this._m_fRotation != 0) {
                context.rotate(cc.DEGREES_TO_RADIANS(this._m_fRotation));
            }
            if ((this._m_fScaleX != 1) || (this._m_fScaleY != 1)) {
                context.scale(this._m_fScaleX, this._m_fScaleY);
            }
            if ((this._m_fSkewX != 0) || (this._m_fSkewY != 0)) {
                context.transform(1,
                    -Math.tan(cc.DEGREES_TO_RADIANS(this._m_fSkewY)),
                    -Math.tan(cc.DEGREES_TO_RADIANS(this._m_fSkewX)),
                    1, 0, 0);
            }
        } else {
            //Todo WebGL implement need fixed
            if (cc.NODE_TRANSFORM_USING_AFFINE_MATRIX) {
                // BEGIN alternative -- using cached transform
                //
                if (this._m_bIsTransformGLDirty) {
                    var t = this.nodeToParentTransform();
                    //cc.CGAffineToGL(t, this._m_pTransformGL);
                    this._m_bIsTransformGLDirty = false;
                }
                //glMultMatrixf(this._m_pTransformGL);
                if (this._m_fVertexZ) {
                    //glTranslatef(0, 0, this._m_fVertexZ);
                }

                // XXX: Expensive calls. Camera should be integrated into the cached affine matrix
                if (this._m_pCamera && !(this._m_pGrid && this._m_pGrid.isActive())) {
                    var translate = (this._m_tAnchorPointInPixels.x != 0.0 || this._m_tAnchorPointInPixels.y != 0.0);

                    if (translate) {
                        //cc.glTranslate(RENDER_IN_SUBPIXEL(this._m_tAnchorPointInPixels.x), RENDER_IN_SUBPIXEL(this._m_tAnchorPointInPixels.y), 0);
                    }
                    this._m_pCamera.locate();
                    if (translate) {
                        //cc.glTranslate(RENDER_IN_SUBPIXEL(-this._m_tAnchorPointInPixels.x), RENDER_IN_SUBPIXEL(-this._m_tAnchorPointInPixels.y), 0);
                    }
                }
                // END alternative
            } else {
                // BEGIN original implementation
                //
                // translate
                if (this._m_bIsRelativeAnchorPoint && (this._m_tAnchorPointInPixels.x != 0 || this._m_tAnchorPointInPixels.y != 0 )) {
                    //cc.glTranslatef(RENDER_IN_SUBPIXEL(-this._m_tAnchorPointInPixels.x), RENDER_IN_SUBPIXEL(-this._m_tAnchorPointInPixels.y), 0);
                }
                if (this._m_tAnchorPointInPixels.x != 0 || this._m_tAnchorPointInPixels.y != 0) {
                    //cc.glTranslatef(RENDER_IN_SUBPIXEL(this._m_tPositionInPixels.x + this._m_tAnchorPointInPixels.x), RENDER_IN_SUBPIXEL(this._m_tPositionInPixels.y + this._m_tAnchorPointInPixels.y), this._m_fVertexZ);
                }
                else if (this._m_tPositionInPixels.x != 0 || this._m_tPositionInPixels.y != 0 || this._m_fVertexZ != 0) {
                    //cc.glTranslatef(RENDER_IN_SUBPIXEL(this._m_tPositionInPixels.x), RENDER_IN_SUBPIXEL(this._m_tPositionInPixels.y), this._m_fVertexZ);
                }
                // rotate
                if (this._m_fRotation != 0.0) {
                    //glRotatef(-this._m_fRotation, 0.0, 0.0, 1.0);
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
                if (this._m_fScaleX != 1.0 || this._m_fScaleY != 1.0) {
                    // glScalef(this._m_fScaleX, this._m_fScaleY, 1.0);
                }
                if (this._m_pCamera && !(this._m_pGrid && this._m_pGrid.isActive()))
                    this._m_pCamera.locate();

                // restore and re-position point
                if (this._m_tAnchorPointInPixels.x != 0.0 || this._m_tAnchorPointInPixels.y != 0.0) {
                    // glTranslatef(RENDER_IN_SUBPIXEL(-this._m_tAnchorPointInPixels.x), RENDER_IN_SUBPIXEL(-this._m_tAnchorPointInPixels.y), 0);
                }
                //
                // END original implementation
            }
        }
    },
    //scene managment

    /** callback that is called every time the cc.Node enters the 'stage'.
     If the cc.Node enters the 'stage' with a transition, this callback is called when the transition starts.
     During onEnter you can't a "sister/brother" node.
     */
    onEnter:function () {
        this._arrayMakeObjectsPerformSelector(this._m_pChildren, "onEnter");
        this.resumeSchedulerAndActions();
        this._m_bIsRunning = true;
    },

    /** callback that is called when the cc.Node enters in the 'stage'.
     If the cc.Node enters the 'stage' with a transition, this callback is called when the transition finishes.
     @since v0.8
     */
    onEnterTransitionDidFinish:function () {
        this._arrayMakeObjectsPerformSelector(this._m_pChildren, "onEnterTransitionDidFinish");
    },
    /** callback that is called every time the cc.Node leaves the 'stage'.
     If the cc.Node leaves the 'stage' with a transition, this callback is called when the transition finishes.
     During onExit you can't access a sibling node.
     */
    onExit:function () {
        this.pauseSchedulerAndActions();
        this._m_bIsRunning = false;
        this._arrayMakeObjectsPerformSelector(this._m_pChildren, "onExit");
    },
    // actions

    /** Executes an action, and returns the action that is executed.
     The node becomes the action's target.
     @warning Starting from v0.8 actions don't retain their target anymore.
     @since v0.7.1
     @return An Action pointer
     */
    runAction:function (action) {
        cc.Assert(action != null, "Argument must be non-nil");
        cc.ActionManager.sharedManager().addAction(action, this, !this._m_bIsRunning);
        return action;
    },
    /** Removes all actions from the running action list */
    stopAllActions:function () {
        cc.ActionManager.sharedManager().removeAllActionsFromTarget(this);
    },
    /** Removes an action from the running action list */
    stopAction:function (action) {
        cc.ActionManager.sharedManager().removeAction(action);
    },
    /** Removes an action from the running action list given its tag
     @since v0.7.1
     */
    stopActionByTag:function (tag) {
        cc.Assert(tag != cc.kCCActionTagInvalid, "Invalid tag");
        cc.ActionManager.sharedManager().removeActionByTag(tag, this);
    },
    /** Gets an action from the running action list given its tag
     @since v0.7.1
     @return the Action the with the given tag
     */
    getActionByTag:function (tag) {
        cc.Assert(tag != cc.kCCActionTagInvalid, "Invalid tag");
        return cc.ActionManager.sharedManager().getActionByTag(tag, this);
    },
    /** Returns the numbers of actions that are running plus the ones that are schedule to run (actions in actionsToAdd and actions arrays).
     * Composable actions are counted as 1 action. Example:
     *    If you are running 1 Sequence of 7 actions, it will return 1.
     *    If you are running 7 Sequences of 2 actions, it will return 7.
     */
    numberOfRunningActions:function () {
        return cc.ActionManager.sharedManager.numberOfRunningActionsInTarget(this);
    },

    // cc.Node - Callbacks
    // timers

    /** check whether a selector is scheduled. */
    isScheduled:function (selector) {
        //can't find this function in the cc.Node.cpp file
    },
    /** schedules the "update" method. It will use the order number 0. This method will be called every frame.
     Scheduled methods with a lower order value will be called before the ones that have a higher order value.
     Only one "update" method could be scheduled per node.

     @since v0.99.3
     */
    scheduleUpdate:function () {
        this.scheduleUpdateWithPriority(0);
    },
    /** schedules the "update" selector with a custom priority. This selector will be called every frame.
     Scheduled selectors with a lower priority will be called before the ones that have a higher value.
     Only one "update" selector could be scheduled per node (You can't have 2 'update' selectors).

     @since v0.99.3
     */
    scheduleUpdateWithPriority:function (priority) {
        cc.Scheduler.sharedScheduler().scheduleUpdateForTarget(this, priority, !this._m_bIsRunning);
    },
    /* unschedules the "update" method.

     @since v0.99.3
     */
    unscheduleUpdate:function () {
        cc.Scheduler.sharedScheduler().unscheduleUpdateForTarget(this);
    },
    schedule:function (selector, interval) {
        if (!interval)
            interval = 0;

        cc.Assert(selector, "Argument must be non-nil");
        cc.Assert(interval >= 0, "Argument must be positive");
        cc.Scheduler.sharedScheduler().scheduleSelector(selector, this, interval, !this._m_bIsRunning);
    },
    /** unschedules a custom selector.*/
    unschedule:function (selector) {
        // explicit nil handling
        if (!selector)
            return;

        cc.Scheduler.sharedScheduler().unscheduleSelector(selector, this);
    },
    /** unschedule all scheduled selectors: custom selectors, and the 'update' selector.
     Actions are not affected by this method.
     @since v0.99.3
     */
    unscheduleAllSelectors:function () {
        cc.Scheduler.sharedScheduler().unscheduleAllSelectorsForTarget(this);
    },
    /** resumes all scheduled selectors and actions.
     Called internally by onEnter
     */
    resumeSchedulerAndActions:function () {
        cc.Scheduler.sharedScheduler().resumeTarget(this);
        cc.ActionManager.sharedManager().resumeTarget(this);
    },
    /** pauses all scheduled selectors and actions.
     Called internally by onExit
     */
    pauseSchedulerAndActions:function () {
        cc.Scheduler.sharedScheduler().pauseTarget(this);
        cc.ActionManager.sharedManager().pauseTarget(this);
    },
    /** Returns the matrix that transform the node's (local) space coordinates into the parent's space coordinates.
     The matrix is in Pixels.
     @since v0.7.1
     */
    nodeToParentTransform:function () {
        if (this._m_bIsTransformDirty) {
            this._m_tTransform = cc.AffineTransformIdentity();
            if (!this._m_bIsRelativeAnchorPoint && !cc.Point.CCPointEqualToPoint(this._m_tAnchorPointInPixels, cc.PointZero())) {
                this._m_tTransform = cc.AffineTransformTranslate(this._m_tTransform, this._m_tAnchorPointInPixels.x, this._m_tAnchorPointInPixels.y);
            }

            if (!cc.Point.CCPointEqualToPoint(this._m_tPositionInPixels, cc.PointZero())) {
                this._m_tTransform = cc.AffineTransformTranslate(this._m_tTransform, this._m_tPositionInPixels.x, this._m_tPositionInPixels.y);
            }

            if (this._m_fRotation != 0) {
                this._m_tTransform = cc.AffineTransformRotate(this._m_tTransform, -cc.DEGREES_TO_RADIANS(this._m_fRotation));
            }

            if (this._m_fSkewX != 0 || this._m_fSkewY != 0) {
                // create a skewed coordinate system
                var skew = cc.AffineTransformMake(1.0, Math.tan(cc.DEGREES_TO_RADIANS(this._m_fSkewY)), Math.tan(cc.DEGREES_TO_RADIANS(this._m_fSkewX)), 1.0, 0.0, 0.0);
                // apply the skew to the transform
                this._m_tTransform = cc.AffineTransformConcat(skew, this._m_tTransform);
            }

            if (!(this._m_fScaleX == 1 && this._m_fScaleY == 1)) {
                this._m_tTransform = cc.AffineTransformScale(this._m_tTransform, this._m_fScaleX, this._m_fScaleY);
            }

            if (!cc.Point.CCPointEqualToPoint(this._m_tAnchorPointInPixels, cc.PointZero())) {
                this._m_tTransform = cc.AffineTransformTranslate(this._m_tTransform, -this._m_tAnchorPointInPixels.x, -this._m_tAnchorPointInPixels.y);
            }

            this._m_bIsTransformDirty = false;
        }

        return this._m_tTransform;
    },
    /** Returns the matrix that transform parent's space coordinates to the node's (local) space coordinates.
     The matrix is in Pixels.
     @since v0.7.1
     */
    parentToNodeTransform:function () {
        if (this._m_bIsInverseDirty) {
            this._m_tInverse = cc.AffineTransformInvert(this.nodeToParentTransform());
            this._m_bIsInverseDirty = false;
        }

        return this._m_tInverse;
    },
    /** Retrusn the world affine transform matrix. The matrix is in Pixels.
     @since v0.7.1
     */
    nodeToWorldTransform:function () {
        var t = this.nodeToParentTransform();
        for (var p = this._m_pParent; p != null; p = p.getParent()) {
            t = cc.AffineTransformConcat(t, p.nodeToParentTransform());
        }
        return t;
    },
    /** Returns the inverse world affine transform matrix. The matrix is in Pixels.
     @since v0.7.1
     */
    worldToNodeTransform:function () {
        return cc.AffineTransformInvert(this.nodeToWorldTransform());
    },
    /** Converts a Point to node (local) space coordinates. The result is in Points.
     @since v0.7.1
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
    /** Converts a Point to world space coordinates. The result is in Points.
     @since v0.7.1
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
    /** Converts a Point to node (local) space coordinates. The result is in Points.
     treating the returned/received node point as anchor relative.
     @since v0.7.1
     */
    convertToNodeSpaceAR:function (worldPoint) {
        var nodePoint = this.convertToNodeSpace(worldPoint);
        var anchorInPoints = new cc.Point();
        if (cc.CONTENT_SCALE_FACTOR() == 1) {
            anchorInPoints = this._m_tAnchorPointInPixels;
        } else {
            anchorInPoints = cc.ccpMult(this._m_tAnchorPointInPixels, 1 / cc.CONTENT_SCALE_FACTOR());
        }
        return cc.ccpSub(nodePoint, anchorInPoints);
    },
    /** Converts a local Point to world space coordinates.The result is in Points.
     treating the returned/received node point as anchor relative.
     @since v0.7.1
     */
    convertToWorldSpaceAR:function (nodePoint) {
        var anchorInPoints = new cc.Point();
        if (cc.CONTENT_SCALE_FACTOR() == 1) {
            anchorInPoints = this._m_tAnchorPointInPixels;
        } else {
            anchorInPoints = cc.ccpMult(this._m_tAnchorPointInPixels, 1 / cc.CONTENT_SCALE_FACTOR());
        }
        var pt = new cc.Point();
        pt = cc.ccpAdd(nodePoint, anchorInPoints);
        return this.convertToWorldSpace(pt);
    },
    _convertToWindowSpace:function (nodePoint) {
        var worldPoint = new cc.Point();
        worldPoint = this.convertToWorldSpace(nodePoint);
        return cc.Director.sharedDirector().convertToUI(worldPoint);
    },
    /** convenience methods which take a CCTouch instead of CCPoint
     @since v0.7.1
     */
    // convenience methods which take a CCTouch instead of CCPoint
    convertTouchToNodeSpace:function (touch) {
        var point = touch.locationInView(touch.view());
        point = cc.Director.sharedDirector().convertToGL(point);
        return this.convertToNodeSpace(point);
    },
    /** converts a CCTouch (world coordinates) into a local coordiante. This method is AR (Anchor Relative).
     @since v0.7.1
     */
    convertTouchToNodeSpaceAR:function (touch) {
        var point = touch.locationInView(touch.view());
        point = cc.Director.sharedDirector().convertToGL(point);
        return this.convertToNodeSpaceAR(point);
    },

    //implement CCObject's method
    update:function (dt) {
    }
});

/** allocates and initializes a node.
 */
cc.Node.node = function () {
    return new cc.Node();
};

