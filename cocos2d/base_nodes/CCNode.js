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

/** @brief CCNode is the main element. Anything thats gets drawn or contains things that get drawn is a CCNode.
 The most popular CCNodes are: CCScene, CCLayer, CCSprite, CCMenu.

 The main features of a CCNode are:
 - They can contain other CCNode nodes (addChild, getChildByTag, removeChild, etc)
 - They can schedule periodic callback (schedule, unschedule, etc)
 - They can execute actions (runAction, stopAction, etc)

 Some CCNode nodes provide extra functionality for them or their children.

 Subclassing a CCNode usually means (one/all) of:
 - overriding init to initialize resources and schedule callbacks
 - create callbacks to handle the advancement of time
 - overriding draw to render the node

 Features of CCNode:
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
 - A CCNode is a "void" object. It doesn't have a texture

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
 - Each node has a camera. By default it points to the center of the CCNode.
 */

cc.Node = cc.Class.extend({
    m_nZOrder:0,
    m_fVertexZ:0.0,
    m_fRotation:0.0,
    m_fScaleX:1.0,
    m_fScaleY:1.0,
    m_tPosition:cc.PointZero,
    m_tPositionInPixels:cc.PointZero,
    m_fSkewX:0.0,
    m_fSkewY:0.0,
    // children (lazy allocs),
    m_pChildren:null,
    // lazy alloc,
    m_pCamera:null,
    m_pGrid:null,
    m_bIsVisible:true,
    m_tAnchorPoint:cc.PointZero,
    m_tAnchorPointInPixels:cc.PointZero,
    m_tContentSize:cc.SizeZero,
    m_tContentSizeInPixels:cc.SizeZero,
    m_bIsRunning:false,
    m_pParent:null,
    // "whole screen" objects. like Scenes and Layers, should set isRelativeAnchorPoint to false
    m_bIsRelativeAnchorPoint:true,
    m_nTag:cc.kCCNodeTagInvalid,
    // userData is always inited as nil
    m_pUserData:null,
    _m_bIsTransformDirty:true,
    _m_bIsInverseDirty:true,
    _m_bIsTransformGLDirty:null,
    _m_tTransform:null,
    _m_tInverse:null,
    _m_pTransformGL:null,
    _m_nScriptHandler:0,

    ctor:function () {
        if (cc.NODE_TRANSFORM_USING_AFFINE_MATRIX) {
            this._m_bIsTransformGLDirty = true;
        }
        if(cc.NODE_TRANSFORM_USING_AFFINE_MATRIX){
            this._m_pTransformGL = new cc.GLfloat();
        }
    },
    _arrayMakeObjectsPerformSelector:function (pArray, func) {
        if (pArray && pArray.count() > 0) {
            var child = new Object();
            for(child in pArray)
            {
                var pNode = child;
                if (pNode && (0 != func)) {
                    (pNode.func)();
                }
            }

        }
    },
    getSkewX:function () {
        return this.m_fSkewX;
    },
    setSkewX:function (newSkewX) {
        this.m_fSkewX = newSkewX;
        this._m_bIsTransformDirty = this._m_bIsInverseDirty = true;
        if (cc.NODE_TRANSFORM_USING_AFFINE_MATRIX) {
            this._m_bIsTransformGLDirty = true;
        }
    },
    getSkewY:function () {
        this._m_bIsTransformDirty = this._m_bIsInverseDirty = true;
        if (cc.NODE_TRANSFORM_USING_AFFINE_MATRIX) {
            this._m_bIsTransformGLDirty = true;
        }
        return this.m_fSkewY;
    },
    setSkewY:function (newSkewY) {
        this.m_fSkewY = newSkewY;
    },
    // zOrder getter
    getZOrder:function () {
        return this.m_nZOrder;
    },
    // zOrder setter : private method
    // used internally to alter the zOrder variable. DON'T call this method manually
    _setZOrder:function (z) {
        this.m_nZOrder = z
    },
    // ertexZ getter
    getVertexZ:function () {
        return this.m_fVertexZ / cc.CONTENT_SCALE_FACTOR();
    },
    // vertexZ setter
    setVertexZ:function (Var) {
        this.m_fVertexZ = Var * cc.CONTENT_SCALE_FACTOR();
    },
    // rotation getter
    getRotation:function () {
        return this.m_fRotation;
    },
    // rotation setter
    setRotation:function (newRotation) {
        this.m_fRotation = newRotation;
        this._m_bIsTransformDirty = this._m_bIsInverseDirty = true;
        if (cc.NODE_TRANSFORM_USING_AFFINE_MATRIX) {
            this._m_bIsTransformGLDirty = true;
        }
    },
    /** Get the scale factor of the node.
     @warning: Assert when m_fScaleX != m_fScaleY.
     */
    getScale:function () {
        cc.Assert(this.m_fScaleX == this.m_fScaleY, "cc.Node#scale. ScaleX != ScaleY. Don't know which one to return");
        return this.m_fScaleX;
    },
    /** The scale factor of the node. 1.0 is the default scale factor. It modifies the X and Y scale at the same time. */
    setScale:function (scale) {
        this.m_fScaleX = this.m_fScaleY = scale;
        this._m_bIsTransformDirty = this._m_bIsInverseDirty = true;
        if (cc.NODE_TRANSFORM_USING_AFFINE_MATRIX) {
            this._m_bIsTransformGLDirty = true;
        }
    },

    /// scaleX getter
    getScaleX:function () {
        return this.m_fScaleX;
    },
    /// scaleX setter
    setScaleX:function (newScaleX) {
        this.m_fScaleX = newScaleX;
        this._m_bIsTransformDirty = this._m_bIsInverseDirty = true;
        if (cc.NODE_TRANSFORM_USING_AFFINE_MATRIX) {
            this._m_bIsTransformGLDirty = true;
        }
    },
    /// scaleY getter
    getScaleY:function () {
        return this.m_fScaleY;
    },
    /// scaleY setter
    setScaleY:function (newScaleY) {
        this.m_fScaleY = newScaleY;
        this._m_bIsTransformDirty = this._m_bIsInverseDirty = true;
        if (cc.NODE_TRANSFORM_USING_AFFINE_MATRIX) {
            this._m_bIsTransformGLDirty = true;
        }
    },
    /// position getter
    getPosition:function () {
        return this.m_tPosition;
    },
    /// position setter
    setPosition:function (newPosition) {
        this.m_tPosition = newPosition;
        if (cc.CONTENT_SCALE_FACTOR() == 1) {
            this.m_tPositionInPixels = this.m_tPosition;
        }
        else {
            this.m_tPositionInPixels = cc.ccpMult(newPosition, cc.CONTENT_SCALE_FACTOR());
        }
        this._m_bIsTransformDirty = this._m_bIsInverseDirty = true;
        if (cc.NODE_TRANSFORM_USING_AFFINE_MATRIX) {
            this._m_bIsTransformGLDirty = true;
        }
    },
    setPositionInPixels:function (newPosition) {
        this.m_tPositionInPixels = newPosition;
        if (cc.CONTENT_SCALE_FACTOR() == 1) {
            this.m_tPosition = this.m_tPositionInPixels;
        }
        else {
            this.m_tPosition = cc.ccpMult(newPosition, 1 / cc.CONTENT_SCALE_FACTOR());
        }
        this._m_bIsTransformDirty = this._m_bIsInverseDirty = true;
        if (cc.NODE_TRANSFORM_USING_AFFINE_MATRIX) {
            this._m_bIsTransformGLDirty = true;
        }// CC_NODE_TRANSFORM_USING_AFFINE_MATRIX
    },
    getPositionInPixels:function () {
        return this.m_tPositionInPixels;
    },
    /// children getter
    getChildren:function () {
        return this.m_pChildren;
    },
    /// camera getter: lazy alloc
    getCamera:function () {
        if (!this.m_pCamera) {
            this.m_pCamera = new cc.Camera();
        }

        return this.m_pCamera;
    },
    /// grid getter
    getGrid:function () {
        return this.m_pGrid;
    },
    /// grid setter
    setGrid:function (pGrid) {
        cc.SAFE_RETAIN(pGrid);
        cc.SAFE_RELEASE(this.m_pGrid);
        this.m_pGrid = pGrid;
    },
    /// isVisible getter
    getIsVisible:function () {
        return this.m_bIsVisible;
    },
    /// isVisible setter
    setIsVisible:function (Var) {
        this.m_bIsVisible = Var;
    },
    /// anchorPoint getter
    setAnchorPoint:function (point) {
        var argnum = arguments.length;
        if (argnum < 1) {
            return this.m_tAnchorPoint;
        }
        else {
            if (!cc.Point.CCPointEqualToPoint(point, this.m_tAnchorPoint)) {
                this.m_tAnchorPoint = point;
                this.m_tAnchorPointInPixels = cc.ccp(this.m_tContentSizeInPixels.width * this.m_tAnchorPoint.x, this.m_tContentSizeInPixels.height * this.m_tAnchorPoint.y);
                this._m_bIsTransformDirty = this._m_bIsInverseDirty = true;
                if (cc.NODE_TRANSFORM_USING_AFFINE_MATRIX) {
                    this._m_bIsTransformGLDirty = true;
                }
            }
        }
    },
    /// anchorPointInPixels getter
    getAnchorPointInPixels:function () {
        return this.m_tAnchorPointInPixels;
    },
    setContentSize:function (size) {
        var argnum = arguments.length;
        if (argnum < 1) {
            return this.m_tContentSize;
        }
        else {
            if (!cc.Size.CCSizeEqualToSize(size, this.m_tContentSize)) {
                this.m_tContentSize = size;
                if (cc.CONTENT_SCALE_FACTOR() == 1) {
                    this.m_tContentSizeInPixels = this.m_tContentSize;
                }
                else {
                    this.m_tContentSizeInPixels = cc.SizeMake(size.width * cc.CONTENT_SCALE_FACTOR(), size.height * cc.CONTENT_SCALE_FACTOR());
                }
                this.m_tAnchorPointInPixels = cc.ccp(this.m_tContentSizeInPixels.width * this.m_tAnchorPoint.x, this.m_tContentSizeInPixels.height * this.m_tAnchorPoint.y);
                this._m_bIsTransformDirty = this._m_bIsInverseDirty = true;
                if (cc.NODE_TRANSFORM_USING_AFFINE_MATRIX) {
                    this._m_bIsTransformGLDirty = true;
                }
            }
        }
    },
    setContentSizeInPixels:function (size) {
        if (!cc.Size.CCSizeEqualToSize(size, this.m_tContentSizeInPixels)) {
            this.m_tContentSizeInPixels = size;
            if (cc.CONTENT_SCALE_FACTOR() == 1) {
                this.m_tContentSize = this.m_tContentSizeInPixels;
            }
            else {
                this.m_tContentSize = cc.SizeMake(size.width / cc.CONTENT_SCALE_FACTOR(), size.height / cc.CONTENT_SCALE_FACTOR());
            }
            this.m_tAnchorPointInPixels = cc.ccp(this.m_tContentSizeInPixels.width * this.m_tAnchorPoint.x, this.m_tContentSizeInPixels.height * this.m_tAnchorPoint.y);
            this._m_bIsTransformDirty = this._m_bIsInverseDirty = true;
            if (cc.NODE_TRANSFORM_USING_AFFINE_MATRIX) {
                this._m_bIsTransformGLDirty = true;
            } // CC_NODE_TRANSFORM_USING_AFFINE_MATRIX
        }
    },
    getContentSizeInPixels:function () {
        return this.m_tContentSizeInPixels;
    },
    // isRunning getter
    getIsRunning:function () {
        return this.m_bIsRunning;
    },
    /// parent getter
    getParent:function () {
        return this.m_pParent;
    },
    /// parent setter
    setParent:function (Var) {
        this.m_pParent = Var;
    },
    /// isRelativeAnchorPoint getter
    getIsRelativeAnchorPoint:function () {
        return this.m_bIsRelativeAnchorPoint;
    },
    /// isRelativeAnchorPoint setter
    setIsRelativeAnchorPoint:function (newValue) {
        this.m_bIsRelativeAnchorPoint = newValue;
        this._m_bIsTransformDirty = this._m_bIsInverseDirty = true;
        if (cc.NODE_TRANSFORM_USING_AFFINE_MATRIX) {
            this._m_bIsTransformGLDirty = true;
        }
    },
    /// tag getter
    getTag:function () {
        return this.m_nTag;
    },
    /// tag setter
    setTag:function (Var) {
        this.m_nTag = Var;
    },
    getUserData:function () {
        return this.m_pUserData;
    },
    setUserData:function (Var) {
        this.m_pUserData = Var;
    },
    /** returns a "local" axis aligned bounding box of the node.
     The returned box is relative only to its parent.

     @since v0.8.2
     */
    boundingBox:function () {
        var ret = new cc.Rect();
        ret = this.boundingBoxInPixels();
        return cc.RECT_PIXELS_TO_POINTS(ret);
    },
    /** returns a "local" axis aligned bounding box of the node in pixels.
     The returned box is relative only to its parent.
     The returned box is in Points.

     @since v0.99.5
     */
    boundingBoxInPixels:function () {
        var rect = new cc.Rect();
        rect = cc.RectMake(0, 0, this.m_tContentSizeInPixels.width, this.m_tContentSizeInPixels.height);
        return cc.RectApplyAffineTransform(rect, this.nodeToParentTransform());
    },
    /** Stops all running actions and schedulers
     @since v0.8
     */
    cleanup:function () {
        // actions
        this.stopAllActions();
        this.unscheduleAllSelectors();

        // timers
        this._arrayMakeObjectsPerformSelector(this.m_pChildren, this.cleanup());
    },
    description:function () {
        var ret = "<CCNode | Tag =" + this.m_nTag + ">";
        return ret;
    },
    _childrenAlloc:function () {
        this.m_pChildren = [];
        
    },
    // composition: GET
    /** Gets a child from the container given its tag
     @return returns a CCNode object
     @since v0.7.1
     */
    getChildByTag:function (aTag) {
        cc.Assert(aTag != cc.kCCNodeTagInvalid, "Invalid tag");
        if (this.m_pChildren && this.m_pChildren.count() > 0) {
            var child = new Object();
            for(child in this.m_pChildren)
            {
                var pNode = new child();
                if (pNode && pNode.m_nTag == aTag)
                    return pNode;
            }
        }
        return null;
    },
    // composition: ADD

    /* "add" logic MUST only be on this method
     * If a class want's to extend the 'addChild' behaviour it only needs
     * to override this method
     */
    addChild:function (child, zOrder, tag) {
        var argnum = arguments.length;
        switch (argnum) {
        /** Adds a child to the container with z-order as 0.
         If the child is added to a 'running' node, then 'onEnter' and 'onEnterTransitionDidFinish' will be called immediately.
         @since v0.7.1
         */
            case 1:
                cc.Assert(child != null, "Argument must be non-nil");
                this.addChild(child, child.m_nZOrder, child.m_nTag);
                break;
        /** Adds a child to the container with a z-order
         If the child is added to a 'running' node, then 'onEnter' and 'onEnterTransitionDidFinish' will be called immediately.
         @since v0.7.1
         */
            case 2:
                cc.Assert(child != null, "Argument must be non-nil");
                this.addChild(child, zOrder, child.m_nTag);
                break;
        /** Adds a child to the container with z order and tag
         If the child is added to a 'running' node, then 'onEnter' and 'onEnterTransitionDidFinish' will be called immediately.
         @since v0.7.1
         */
            case 3:
                cc.Assert(child != null, "Argument must be non-nil");
                cc.Assert(child.m_pParent == null, "child already added. It can't be added again");

                if (!this.m_pChildren) {
                    this._childrenAlloc();
                }
                this._insertChild(child, zOrder);
                child.m_nTag = tag;
                child.setParent(this);
                if (this.m_bIsRunning) {
                    child.onEnter();
                    child.onEnterTransitionDidFinish();
                }
                break;
            default:
                throw "Argument must be non-nil ";
                break;
        }

    },
    // composition: REMOVE

    /** Remove itself from its parent node. If cleanup is true, then also remove all actions and callbacks.
     If the node orphan, then nothing happens.
     @since v0.99.3
     */
    removeFromParentAndCleanup:function (cleanup) {
        this.m_pParent.removeChild(this, cleanup);
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
        if (this.m_pChildren == null) {
            return;
        }

        if (this.m_pChildren.containsObject(child)) {
            this._detachChild(child, cleanup);
        }
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
        if (this.m_pChildren && this.m_pChildren.count() > 0) {
            var child = new Object();
            for(child in this.m_pChildren)
            {
                var pNode = child;
                if (pNode) {
                    // IMPORTANT:
                    //  -1st do onExit
                    //  -2nd cleanup
                    if (this.m_bIsRunning) {
                        pNode.onExit();
                    }
                    if (cleanup) {
                        pNode.cleanup();
                    }
                    // set parent nil at the end
                    pNode.setParent(null);
                }
            }
            this.m_pChildren.removeAllObjects();
        }
    },
    _detachChild:function (child, doCleanup) {
        // IMPORTANT:
        //  -1st do onExit
        //  -2nd cleanup
        if (this.m_bIsRunning) {
            child.onExit();
        }

        // If you don't do cleanup, the child's actions will not get removed and the
        // its scheduledSelectors_ dict will not get released!
        if (doCleanup) {
            child.cleanup();
        }

        // set parent nil at the end
        child.setParent(NULL);

        this.m_pChildren.removeObject(child);
    },
    // helper used by reorderChild & add
    _insertChild:function (child, z) {
        var index = 0;
        var a = this.m_pChildren[this.m_pChildren.length -1];
        if (!a || a.getZOrder() <= z) {
            this.m_pChildren.push(child);
        }
        else {
            var pObject = new Object();
            for(pObject in this.m_pChildren)
            {
                var pNode = pObject;
                if (pNode && (pNode.m_nZOrder > z )) {
                    this.m_pChildren.insertObject(child, index);
                }
                index++;
            }
        }
        child._setZOrder(z);
    },
    /** Reorders a child according to a new z value.
     * The child MUST be already added.
     */
    reorderChild:function (child, zOrder) {
        cc.Assert(child != null, "Child must be non-nil");

        child.retain();
        this.m_pChildren.removeObject(child);

        this._insertChild(child, zOrder);
        child.release();
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
    draw:function () {
        //CCAssert(0);
        // override me
        // Only use- this function to draw your staff.
        // DON'T draw your stuff outside this method
    },
    /** recursive method that visit its children and draw them */
    visit:function () {
        // quick return if not visible
        if (!this.m_bIsVisible) {
            return;
        }
        //TODO
        //glPushMatrix();

        if (this.m_pGrid && this.m_pGrid.isActive()) {
            this.m_pGrid.beforeDraw();
            this.transformAncestors();
        }

        this.transform();

        var pNode = null;
        var i = 0;

        if (this.m_pChildren && this.m_pChildren.length > 0) {
            // draw children zOrder < 0
            for (; i < this.m_pChildren.length; i++) {
                pNode = this.m_pChildren[i];

                if (pNode && pNode.m_nZOrder < 0) {
                    pNode.visit();
                }
                else {
                    break;
                }
            }
        }

        // self draw
        this.draw();

        // draw children zOrder >= 0
        if (this.m_pChildren && this.m_pChildren.length > 0) {
            for (; i < this.m_pChildren.length; i++) {
                pNode = this.m_pChildren[i];
                if (pNode) {
                    pNode.visit();
                }
            }
        }

        if (this.m_pGrid && this.m_pGrid.isActive()) {
            this.m_pGrid.afterDraw(this);
        }
        //TODO
        //glPopMatrix();
    },
    /** performs OpenGL view-matrix transformation of it's ancestors.
     Generally the ancestors are already transformed, but in certain cases (eg: attaching a FBO)
     it's necessary to transform the ancestors again.
     @since v0.7.2
     */
    transformAncestors:function () {
        if (this.m_pParent != null) {
            this.m_pParent.transformAncestors();
            this.m_pParent.transform();
        }
    },

    // transformations
    /** performs OpenGL view-matrix transformation based on position, scale, rotation and other attributes. */
    transform:function () {
        // transformations

        if (cc.NODE_TRANSFORM_USING_AFFINE_MATRIX) {
            // BEGIN alternative -- using cached transform
            //
            if (this._m_bIsTransformGLDirty) {
                var t = new cc.AffineTransform();
                t = this.nodeToParentTransform();
                cc.CGAffineToGL(t, this._m_pTransformGL);
                this._m_bIsTransformGLDirty = false;
            }
            //TODO
            //glMultMatrixf(this._m_pTransformGL);
            if (this.m_fVertexZ) {
                //TODO
                //glTranslatef(0, 0, this.m_fVertexZ);
            }

            // XXX: Expensive calls. Camera should be integrated into the cached affine matrix
            if (this.m_pCamera && !(this.m_pGrid && this.m_pGrid.isActive())) {
                var ranslate = (this.m_tAnchorPointInPixels.x != 0.0 || this.m_tAnchorPointInPixels.y != 0.0);

                if (translate) {
                    //TODO
                    //cc.glTranslate(RENDER_IN_SUBPIXEL(this.m_tAnchorPointInPixels.x), RENDER_IN_SUBPIXEL(this.m_tAnchorPointInPixels.y), 0);
                }

                this.m_pCamera.locate();

                if (translate) {
                    //TODO
                    //cc.glTranslate(RENDER_IN_SUBPIXEL(-this.m_tAnchorPointInPixels.x), RENDER_IN_SUBPIXEL(-this.m_tAnchorPointInPixels.y), 0);
                }
            }


            // END alternative

        } else {
            // BEGIN original implementation
            //
            // translate
            if (this.m_bIsRelativeAnchorPoint && (this.m_tAnchorPointInPixels.x != 0 || this.m_tAnchorPointInPixels.y != 0 )) {
                //TODO
                //cc.glTranslatef(RENDER_IN_SUBPIXEL(-this.m_tAnchorPointInPixels.x), RENDER_IN_SUBPIXEL(-this.m_tAnchorPointInPixels.y), 0);
            }
            if (this.m_tAnchorPointInPixels.x != 0 || this.m_tAnchorPointInPixels.y != 0){
                //TODO
                //cc.glTranslatef(RENDER_IN_SUBPIXEL(this.m_tPositionInPixels.x + this.m_tAnchorPointInPixels.x), RENDER_IN_SUBPIXEL(this.m_tPositionInPixels.y + this.m_tAnchorPointInPixels.y), this.m_fVertexZ);
            }
            else if (this.m_tPositionInPixels.x != 0 || this.m_tPositionInPixels.y != 0 || this.m_fVertexZ != 0){
                //TODO
                //cc.glTranslatef(RENDER_IN_SUBPIXEL(this.m_tPositionInPixels.x), RENDER_IN_SUBPIXEL(this.m_tPositionInPixels.y), this.m_fVertexZ);
            }
            // rotate
            if (this.m_fRotation != 0.0)
            //TODO
            //glRotatef(-this.m_fRotation, 0.0, 0.0, 1.0);

            // skew
                if ((skewX_ != 0.0) || (skewY_ != 0.0)) {
                    var skewMatrix = new cc.AffineTransform();
                    skewMatrix = cc.AffineTransformMake(1.0, Math.tan(cc.DEGREES_TO_RADIANS(skewY_)), Math.tan(cc.DEGREES_TO_RADIANS(skewX_)), 1.0, 0.0, 0.0);
                    //TODO
                    // glMatrix = new GLfloat();
                    cc.AffineToGL(skewMatrix, glMatrix);
                    //TODO
                    // glMultMatrixf(glMatrix);
                }

            // scale
            if (this.m_fScaleX != 1.0 || this.m_fScaleY != 1.0){
                //TODO
                // glScalef(this.m_fScaleX, this.m_fScaleY, 1.0);
            }
            if (this.m_pCamera && !(this.m_pGrid && this.m_pGrid.isActive())) this.m_pCamera.locate();

            // restore and re-position point
            if (this.m_tAnchorPointInPixels.x != 0.0 || this.m_tAnchorPointInPixels.y != 0.0){
                //TODO
                // glTranslatef(RENDER_IN_SUBPIXEL(-this.m_tAnchorPointInPixels.x), RENDER_IN_SUBPIXEL(-this.m_tAnchorPointInPixels.y), 0);
            }
            //
            // END original implementation
        }
    },
    //scene managment

    /** callback that is called every time the CCNode enters the 'stage'.
     If the CCNode enters the 'stage' with a transition, this callback is called when the transition starts.
     During onEnter you can't a "sister/brother" node.
     */
    onEnter:function () {
        this._arrayMakeObjectsPerformSelector(this.m_pChildren, this.onEnter);
        this.resumeSchedulerAndActions();
        this.m_bIsRunning = true;
    },

    /** callback that is called when the CCNode enters in the 'stage'.
     If the CCNode enters the 'stage' with a transition, this callback is called when the transition finishes.
     @since v0.8
     */
    onEnterTransitionDidFinish:function () {
        this._arrayMakeObjectsPerformSelector(this.m_pChildren, this.onEnterTransitionDidFinish);
    },
    /** callback that is called every time the CCNode leaves the 'stage'.
     If the CCNode leaves the 'stage' with a transition, this callback is called when the transition finishes.
     During onExit you can't access a sibling node.
     */
    onExit:function () {
        this.pauseSchedulerAndActions();
        this.m_bIsRunning = false;
        this._arrayMakeObjectsPerformSelector(this.m_pChildren, this.onExit);
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
        cc.ActionManager.sharedManager().addAction(action, this, !this.m_bIsRunning);
        return action;
    },
    /** Removes all actions from the running action list */
    stopAllActions:function (action) {
        var argnum = arguments.length;
        if (argnum < 1) {
            cc.ActionManager.sharedManager().removeAllActionsFromTarget(this);
        }
        else {
            cc.Assert(action != null, "Argument must be non-nil");
            cc.ActionManager.sharedManager().addAction(action, this, !this.m_bIsRunning);
            return action;
        }
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

    // CCNode - Callbacks
    // timers

    /** check whether a selector is scheduled. */
    isScheduled:function (selector) {
        //can't find this function in the CCNode.cpp file
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
        cc.Scheduler.sharedScheduler().scheduleUpdateForTarget(this, priority, !this.m_bIsRunning);
    },
    /* unschedules the "update" method.

     @since v0.99.3
     */
    unscheduleUpdate:function () {
        cc.Scheduler.sharedScheduler().unscheduleUpdateForTarget(this);
    },
    schedule:function (selector, interval) {
        var argnum = arguments.length;
        /** schedules a selector.
         The scheduled selector will be ticked every frame
         */
        if (argnum < 2) {
            this.schedule(selector, 0);
        }
        /** schedules a custom selector with an interval time in seconds.
         If time is 0 it will be ticked every frame.
         If time is 0, it is recommended to use 'scheduleUpdate' instead.
         If the selector is already scheduled, then the interval parameter
         will be updated without scheduling it again.
         */
        else {
            cc.Assert(selector, "Argument must be non-nil");
            cc.Assert(interval >= 0, "Argument must be positive");
            cc.Scheduler.sharedScheduler().scheduleSelector(selector, this, interval, !this.m_bIsRunning);
        }

    },
    /** unschedules a custom selector.*/
    unschedule:function (selector) {
        // explicit nil handling
        if (selector == 0)
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

            this._m_tTransform = cc.AffineTransformIdentity;
            if (!this.m_bIsRelativeAnchorPoint && !cc.Point.CCPointEqualToPoint(this.m_tAnchorPointInPixels, cc.PointZero)) {
                this._m_tTransform = cc.AffineTransformTranslate(this._m_tTransform, this.m_tAnchorPointInPixels.x, this.m_tAnchorPointInPixels.y);
            }

            if (!cc.Point.CCPointEqualToPoint(this.m_tPositionInPixels, cc.PointZero)) {
                this._m_tTransform = cc.AffineTransformTranslate(this._m_tTransform, this.m_tPositionInPixels.x, this.m_tPositionInPixels.y);
            }

            if (this.m_fRotation != 0) {
                this._m_tTransform = cc.AffineTransformRotate(this._m_tTransform, -cc.DEGREES_TO_RADIANS(this.m_fRotation));
            }

            if (this.m_fSkewX != 0 || this.m_fSkewY != 0) {
                // create a skewed coordinate system
                var skew = new cc.AffineTransform();
                skew = cc.AffineTransformMake(1.0, Math.tan(cc.DEGREES_TO_RADIANS(this.m_fSkewY)), Math.tan(cc.DEGREES_TO_RADIANS(this.m_fSkewX)), 1.0, 0.0, 0.0);
                // apply the skew to the transform
                this._m_tTransform = cc.AffineTransformConcat(skew, this._m_tTransform);
            }

            if (!(this.m_fScaleX == 1 && this.m_fScaleY == 1)) {
                this._m_tTransform = cc.AffineTransformScale(this._m_tTransform, this.m_fScaleX, this.m_fScaleY);
            }

            if (!cc.Point.CCPointEqualToPoint(this.m_tAnchorPointInPixels, cc.PointZero)) {
                this._m_tTransform = cc.AffineTransformTranslate(this._m_tTransform, -this.m_tAnchorPointInPixels.x, -this.m_tAnchorPointInPixels.y);
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
        var t = new cc.AffineTransform();
        t = this.nodeToParentTransform();
        for (var p = this.m_pParent; p != null; p = p.getParent())
            t = cc.AffineTransformConcat(t, p.nodeToParentTransform());

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
        var nodePoint = new cc.Point();
        nodePoint = convertToNodeSpace(worldPoint);
        var anchorInPoints = new cc.Point();
        if (cc.CONTENT_SCALE_FACTOR() == 1) {
            anchorInPoints = this.m_tAnchorPointInPixels;
        }
        else {
            anchorInPoints = cc.ccpMult(this.m_tAnchorPointInPixels, 1 / cc.CONTENT_SCALE_FACTOR());
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
            anchorInPoints = this.m_tAnchorPointInPixels;
        }
        else {
            anchorInPoints = cc.ccpMult(this.m_tAnchorPointInPixels, 1 / cc.CONTENT_SCALE_FACTOR());
        }
        var pt = new cc.Point();
        pt = ccpAdd(nodePoint, anchorInPoints);
        return convertToWorldSpace(pt);
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
        var point = new cc.Point();
        point = touch.locationInView(touch.view());
        point = cc.Director.sharedDirector().convertToGL(point);
        return this.convertToNodeSpace(point);
    },
    /** converts a CCTouch (world coordinates) into a local coordiante. This method is AR (Anchor Relative).
     @since v0.7.1
     */
    convertTouchToNodeSpaceAR:function (touch) {
        var point = new cc.Point();
        point = touch.locationInView(touch.view());
        point = cc.Director.sharedDirector().convertToGL(point);
        return this.convertToNodeSpaceAR(point);
    }
});
/** allocates and initializes a node.
 */
cc.Node.node = function () {
    var pRet = new cc.Node();
    return pRet;
};

