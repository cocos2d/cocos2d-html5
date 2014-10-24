/****************************************************************************
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
 * A class inhert from cc.Node, use for saving some protected children in other list.
 * @class
 * @extends cc.Node
 */
cc.ProtectedNode = cc.Node.extend(/** @lends cc.ProtectedNode# */{
    _protectedChildren: null,
    _reorderProtectedChildDirty: false,

    _insertProtectedChild: function(child, z){
        this._reorderProtectedChildDirty = true;
        this._protectedChildren.push(child);
        child._setLocalZOrder(z);
    },

    /**
     * Constructor function, override it to extend the construction behavior, remember to call "this._super()" in the extended "ctor" function.
     * @function
     */
    ctor: function(){
        cc.Node.prototype.ctor.call(this);
        this._protectedChildren = [];
    },

    /**
     * <p>
     *  Adds a child to the container with z order and tag                                                                         <br/>
     *  If the child is added to a 'running' node, then 'onEnter' and 'onEnterTransitionDidFinish' will be called immediately.     <br/>
     *  </p>
     * @param {cc.Node} child  A child node
     * @param {Number} [localZOrder]  Z order for drawing priority. Please refer to `setLocalZOrder(int)`
     * @param {Number} [tag]  An integer to identify the node easily. Please refer to `setTag(int)`
     */
    addProtectedChild: function(child, localZOrder, tag){
         cc.assert(child != null, "child must be non-nil");
         cc.assert(!child.parent, "child already added. It can't be added again");

        localZOrder = localZOrder || child.getLocalZOrder();
        if(tag)
            child.setTag(tag);

        this._insertProtectedChild(child, localZOrder);
        child.setParent(this);
        child.setOrderOfArrival(cc.s_globalOrderOfArrival);

        //TODO USE PHYSICS
        if(this._running){
            child.onEnter();
            // prevent onEnterTransitionDidFinish to be called twice when a node is added in onEnter
            if(this._isTransitionFinished)
                child.onEnterTransitionDidFinish();
        }
        if(this._cascadeColorEnabled)
            this._enableCascadeColor();
        if (this._cascadeOpacityEnabled)
            this._enableCascadeOpacity();
    },

    /**
     * Gets a child from the container with its tag
     * @param {Number} tag An identifier to find the child node.
     * @return {cc.Node} a Node object whose tag equals to the input parameter
     */
    getProtectedChildByTag: function(tag){
        cc.assert(tag != cc.NODE_TAG_INVALID, "Invalid tag");
        var locChildren = this._protectedChildren;
        for(var i = 0, len = locChildren.length; i < len; i++)
            if(locChildren.getTag() == tag)
                return locChildren[i];
        return null;
    },

    /**
     * Removes a child from the container. It will also cleanup all running actions depending on the cleanup parameter.
     * @param {cc.Node} child  The child node which will be removed.
     * @param {Boolean} [cleanup=true] true if all running actions and callbacks on the child node will be cleanup, false otherwise.
     */
    removeProtectedChild: function(child,  cleanup){
        if(cleanup == null)
            cleanup = true;
         var locChildren = this._protectedChildren;
        if(locChildren.length === 0)
            return;
        var idx = locChildren.indexOf(child);
        if(idx > -1){
             if(this._running){
                 child.onExitTransitionDidStart();
                 child.onExit();
             }
            //TODO  USE PHYSICS

            // If you don't do cleanup, the child's actions will not get removed and the
            // its scheduledSelectors_ dict will not get released!
            if (cleanup)
                child.cleanup();

            // set parent nil at the end
            child.setParent(null);
            locChildren.splice(idx, 1);
        }
    },

    /**
     * Removes a child from the container by tag value.                                    <br/>
     * It will also cleanup all running actions depending on the cleanup parameter
     * @param {Number} tag
     * @param {Boolean} [cleanup=true]
     */
    removeProtectedChildByTag: function(tag, cleanup){
        cc.assert( tag != cc.NODE_TAG_INVALID, "Invalid tag");

        if(cleanup == null)
            cleanup = true;

        var child = this.getProtectedChildByTag(tag);

        if (child == null)
            cc.log("cocos2d: removeChildByTag(tag = %d): child not found!", tag);
        else
            this.removeProtectedChild(child, cleanup);
    },

    /**
     * Removes all children from the container with a cleanup.
     * @see cc.ProtectedNode#removeAllProtectedChildrenWithCleanup
     */
    removeAllProtectedChildren: function(){
        this.removeAllProtectedChildrenWithCleanup(true);
    },

    /**
     * Removes all children from the container, and do a cleanup to all running actions depending on the cleanup parameter.
     * @param {Boolean} [cleanup=true] true if all running actions on all children nodes should be cleanup, false otherwise.
     */
    removeAllProtectedChildrenWithCleanup: function(cleanup){
        if(cleanup == null)
            cleanup = true;
        var locChildren = this._protectedChildren;
        // not using detachChild improves speed here
        for (var i = 0, len = locChildren.length; i< len; i++) {
            var child = locChildren[i];
            // IMPORTANT:
            //  -1st do onExit
            //  -2nd cleanup
            if(this._running){
                child.onExitTransitionDidStart();
                child.onExit();
            }

            //TODO USE PHYSICS
            if (cleanup)
                child.cleanup();
            // set parent nil at the end
            child.setParent(null);
        }
        locChildren.length = 0;
    },

    /**
     * Reorders a child according to a new z value.
     * @param {cc.Node} child An already added child node. It MUST be already added.
     * @param {Number} localZOrder Z order for drawing priority. Please refer to setLocalZOrder(int)
     */
    reorderProtectedChild: function(child, localZOrder){
        cc.assert( child != null, "Child must be non-nil");
        this._reorderProtectedChildDirty = true;
        child.setOrderOfArrival(cc.s_globalOrderOfArrival++);
        child._setLocalZOrder(localZOrder);
    },

    /**
     * <p>
     *     Sorts the children array once before drawing, instead of every time when a child is added or reordered.       <br/>
     *     This approach can improves the performance massively.                                                         <br/>
     *     @note Don't call this manually unless a child added needs to be removed in the same frame
     * </p>
     */
    sortAllProtectedChildren: function(){
        if (this._reorderProtectedChildDirty) {
            var _children = this._protectedChildren;

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
                    }else
                        break;
                    j--;
                }
                _children[j+1] = tmp;
            }

            //don't need to check children recursively, that's done in visit of each child
            this._reorderProtectedChildDirty = false;
        }
    },

    /**
     * transforms and draws itself, and visit its children and protected children.
     * @override
     * @function
     * @param {CanvasRenderingContext2D|WebGLRenderingContext} ctx context of renderer
     */
    visit: null,

    _visitForCanvas: function(ctx){
        var _t = this;
        // quick return if not visible
        if (!_t._visible)
            return;

        //visit for canvas
        var context = ctx || cc._renderContext, i, j;
        var children = _t._children, child;
        var locChildren = _t._children, locProtectedChildren = this._protectedChildren;
        var childLen = locChildren.length, pLen = locProtectedChildren.length;
//        context.save();
        _t.transform(context);

        _t.sortAllChildren();
        _t.sortAllProtectedChildren();

        // draw children zOrder < 0
        for (i = 0; i < childLen; i++) {
            child = children[i];
            if (child._localZOrder < 0)
                child.visit(context);
            else
                break;
        }
        for (j = 0; j < pLen; j++) {
            child = locProtectedChildren[j];
            if (child._localZOrder < 0)
                child.visit(context);
            else
                break;
        }

//        _t.draw(context);
        if(this._rendererCmd)
            cc.renderer.pushRenderCommand(this._rendererCmd);

        for (; i < childLen; i++)
            children[i] && children[i].visit(context);
        for (; j < pLen; j++)
            locProtectedChildren[j] && locProtectedChildren[j].visit(context);

        this._cacheDirty = false;
//        context.restore();
    },

    _visitForWebGL: function(){
        var _t = this;
        // quick return if not visible
        if (!_t._visible)
            return;
        var context = cc._renderContext, i, currentStack = cc.current_stack, j;

        //optimize performance for javascript
        currentStack.stack.push(currentStack.top);
        cc.kmMat4Assign(_t._stackMatrix, currentStack.top);
        currentStack.top = _t._stackMatrix;

        var locGrid = _t.grid;
        if (locGrid && locGrid._active)
            locGrid.beforeDraw();

        _t.transform();

        var locChildren = _t._children, locProtectedChildren = this._protectedChildren;
        var childLen = locChildren.length, pLen = locProtectedChildren.length;
        _t.sortAllChildren();
        _t.sortAllProtectedChildren();

        // draw children zOrder < 0
        for (i = 0; i < childLen; i++) {
            if (locChildren[i] && locChildren[i]._localZOrder < 0)
                locChildren[i].visit();
            else
                break;
        }
        for(j = 0; j < pLen; j++){
            if (locProtectedChildren[j] && locProtectedChildren[j]._localZOrder < 0)
                locProtectedChildren[j].visit();
            else
                break;
        }
//        _t.draw(context);
        if(this._rendererCmd)
            cc.renderer.pushRenderCommand(this._rendererCmd);

        // draw children zOrder >= 0
        for (; i < childLen; i++) {
            locChildren[i] && locChildren[i].visit();
        }
        for (; j < pLen; j++) {
            locProtectedChildren[j] && locProtectedChildren[j].visit();
        }

        if (locGrid && locGrid._active)
            locGrid.afterDraw(_t);

        //optimize performance for javascript
        currentStack.top = currentStack.stack.pop();
    },

    /**
     * Stops itself and its children and protected children's all running actions and schedulers
     * @override
     */
    cleanup: function(){
       cc.Node.prototype.cleanup.call(this);
       var locChildren = this._protectedChildren;
        for(var i = 0 , len = locChildren.length; i  < len; i++)
            locChildren[i].cleanup();
    },

    /**
     * Calls its parent's onEnter and calls its protected children's onEnter
     * @override
     */
    onEnter: function(){
        cc.Node.prototype.onEnter.call(this);
        var locChildren = this._protectedChildren;
        for(var i = 0, len = locChildren.length;i< len;i++)
            locChildren[i].onEnter();
    },

    /**
     *  <p>
     *     Event callback that is invoked when the Node enters in the 'stage'.                                          <br/>
     *     If the Node enters the 'stage' with a transition, this event is called when the transition finishes.         <br/>
     *     If you override onEnterTransitionDidFinish, you shall call its parent's one, e.g. Node::onEnterTransitionDidFinish()
     *  </p>
     *  @override
     */
    onEnterTransitionDidFinish: function(){
        cc.Node.prototype.onEnterTransitionDidFinish.call(this);
        var locChildren = this._protectedChildren;
        for(var i = 0, len = locChildren.length;i< len;i++)
            locChildren[i].onEnterTransitionDidFinish();
    },

    /**
     * Calls its parent's onExit and calls its protected children's onExit
     * @override
     */
    onExit:function(){
        cc.Node.prototype.onExit.call(this);
        var locChildren = this._protectedChildren;
        for(var i = 0, len = locChildren.length;i< len;i++)
            locChildren[i].onExit();
    },

    /**
     * <p>
     *      Event callback that is called every time the Node leaves the 'stage'.                                      <br/>
     *      If the Node leaves the 'stage' with a transition, this callback is called when the transition starts.
     * </p>
     */
    onExitTransitionDidStart: function(){
        cc.Node.prototype.onExitTransitionDidStart.call(this);
        var locChildren = this._protectedChildren;
        for(var i = 0, len = locChildren.length;i< len;i++)
            locChildren[i].onExitTransitionDidStart();
    },

    /**
     * Updates itself and its protected children displayed opacity, if opacity cascade is enable, its children also update.
     * @param {Number} parentOpacity
     * @override
     */
    updateDisplayedOpacity: function(parentOpacity){
        this._displayedOpacity = this._realOpacity * parentOpacity/255.0;
        this._updateColor();

        var i,len, locChildren, _opacity = this._displayedOpacity;
        if (this._cascadeOpacityEnabled){
            locChildren = this._children;
            for(i = 0, len = locChildren.length;i < len; i++){
                if(locChildren[i].updateDisplayedOpacity)
                    locChildren[i].updateDisplayedOpacity(_opacity);
            }
        }
        locChildren = this._protectedChildren;
        for(i = 0, len = locChildren.length;i < len; i++){
            if(locChildren[i])
                locChildren[i].updateDisplayedOpacity(_opacity);
        }
    },

    /**
     * Updates itself and its protected children displayed color, if opacity cascade is enable, its children also update.
     * @param {cc.Color} parentColor
     * @override
     */
    updateDisplayedColor: function(parentColor){
        var displayedColor = this._displayedColor, realColor = this._realColor;
        displayedColor.r = realColor.r * parentColor.r/255.0;
        displayedColor.g = realColor.g * parentColor.g/255.0;
        displayedColor.b = realColor.b * parentColor.b/255.0;
        this._updateColor();

        var i, len, locChildren;
        if (this._cascadeColorEnabled){
            locChildren = this._children;
            for(i = 0, len = locChildren.length; i < len; i++){
                if(locChildren[i].updateDisplayedColor)
                    locChildren[i].updateDisplayedColor(displayedColor);
            }
        }

        locChildren = this._protectedChildren;
        for(i =0, len = locChildren.length; i < len; i++) {
            if (locChildren[i])
                locChildren[i].updateDisplayedColor(displayedColor);
        }
    },

    _disableCascadeOpacity: function () {
        this._displayedOpacity = this._realOpacity;

        var selChildren = this._children, i, item;
        for (i = 0; i < selChildren.length; i++) {
            item = selChildren[i];
            if (item)
                item.updateDisplayedOpacity(255);
        }

        selChildren = this._protectedChildren;
        for (i = 0; i < selChildren.length; i++) {
            item = selChildren[i];
            if (item)
                item.updateDisplayedOpacity(255);
        }
    },

    _disableCascadeColor: function(){
        var white = cc.color.WHITE;
        var i, len, locChildren = this._children;
        for(i = 0, len = locChildren.length; i < len; i++)
            locChildren[i].updateDisplayedColor(white);

        locChildren = this._protectedChildren;
        for(i =0, len = locChildren.length; i < len; i++)
            locChildren[i].setColor(white);
    }
});

if (cc._renderType === cc._RENDER_TYPE_CANVAS) {
    cc.ProtectedNode.prototype.visit =  cc.ProtectedNode.prototype._visitForCanvas;
    cc.ProtectedNode.prototype._transformForRenderer = function () {
        var t = this.nodeToParentTransform(), worldT = this._transformWorld;
        if(this._parent){
            var pt = this._parent._transformWorld;
            //worldT = cc.AffineTransformConcat(t, pt);
            worldT.a = t.a * pt.a + t.b * pt.c;                               //a
            worldT.b = t.a * pt.b + t.b * pt.d;                               //b
            worldT.c = t.c * pt.a + t.d * pt.c;                               //c
            worldT.d = t.c * pt.b + t.d * pt.d;                               //d
            if(this._skewX || this._skewY){
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
        var i, len, locChildren = this._children;
        for(i = 0, len = locChildren.length; i< len; i++){
            locChildren[i]._transformForRenderer();
        }
        locChildren = this._protectedChildren;
        for( i = 0, len = locChildren.length; i< len; i++)
            locChildren[i]._transformForRenderer();
    };
}else{
    cc.ProtectedNode.prototype.visit =  cc.ProtectedNode.prototype._visitForWebGL;
    cc.ProtectedNode.prototype._transformForRenderer = function () {
        var t4x4 = this._transform4x4, stackMatrix = this._stackMatrix,
            parentMatrix = this._parent ? this._parent._stackMatrix : cc.current_stack.top;

        // Convert 3x3 into 4x4 matrix
        var trans = this.nodeToParentTransform();
        var t4x4Mat = t4x4.mat;
        t4x4Mat[0] = trans.a;
        t4x4Mat[4] = trans.c;
        t4x4Mat[12] = trans.tx;
        t4x4Mat[1] = trans.b;
        t4x4Mat[5] = trans.d;
        t4x4Mat[13] = trans.ty;

        // Update Z vertex manually
        t4x4Mat[14] = this._vertexZ;

        //optimize performance for Javascript
        cc.kmMat4Multiply(stackMatrix, parentMatrix, t4x4);

        this._renderCmdDiry = false;
        var i, len, locChildren = this._children;
        for(i = 0, len = locChildren.length; i< len; i++){
            locChildren[i]._transformForRenderer();
        }
        locChildren = this._protectedChildren;
        for( i = 0, len = locChildren.length; i< len; i++)
            locChildren[i]._transformForRenderer();
    };
}

/**
 * create a cc.ProtectedNode object;
 * @deprecated since v3.0, please use new cc.ProtectedNode() instead.
 * @return cc.ProtectedNode
 */
cc.ProtectedNode.create = function(){
    return new cc.ProtectedNode();
};