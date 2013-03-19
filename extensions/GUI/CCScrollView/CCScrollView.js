/****************************************************************************
 Copyright (c) 2010-2012 cocos2d-x.org
 Copyright (c) 2010 Sangwoo Im

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

 Created by Sangwoo Im on 6/3/10.
 ****************************************************************************/

cc.SCROLLVIEW_DIRECTION_NONE = -1;

cc.SCROLLVIEW_DIRECTION_HORIZONTAL = 0;

cc.SCROLLVIEW_DIRECTION_VERTICAL = 1;

cc.SCROLLVIEW_DIRECTION_BOTH = 2;

var SCROLL_DEACCEL_RATE = 0.95;
var SCROLL_DEACCEL_DIST = 1.0;
var BOUNCE_DURATION = 0.15;
var INSET_RATIO = 0.2;

cc.ScrollViewDelegate = cc.Class.extend({
    scrollViewDidScroll:function (view) {
    },
    scrollViewDidZoom:function (view) {
    }
});

/**
 * ScrollView support for cocos2d for iphone.
 * It provides scroll view functionalities to cocos2d projects natively.
 */
cc.ScrollView = cc.Layer.extend({
    _zoomScale:0,
    _minZoomScale:0,
    _maxZoomScale:0,
    _delegate:null,
    _direction:cc.SCROLLVIEW_DIRECTION_BOTH,
    _dragging:false,
    _contentOffset:null,
    _container:null,
    _touchMoved:false,
    _maxInset:null,
    _minInset:null,
    _bounceable:false,
    _clippingToBounds:false,
    _scrollDistance:null,
    _touchPoint:null,
    _touchLength:0,
    _touches:null,
    _viewSize:null,
    _minScale:0,
    _maxScale:0,

    ctor:function () {
        this._maxInset = new cc.Point(0, 0);
        this._minInset = new cc.Point(0, 0);
        this._scrollDistance = new cc.Point(0, 0);
        this._touchPoint = new cc.Point(0, 0);
        this._touches = [];
        this._viewSize = new cc.Size(0, 0);
        this._isTouched = false;
    },

    init:function (isDirectCall) {
        if ((isDirectCall != null) && (isDirectCall == true))
            return this._super();
        return this.initWithViewSize(cc.SizeMake(200, 200), null);
    },

    registerWithTouchDispatcher:function () {
        cc.Director.getInstance().getTouchDispatcher().addTargetedDelegate(this, 0, false);
    },

    /**
     * Returns a scroll view object
     * @param {cc.Size} size
     * @param {cc.Node} container
     * @return {Boolean}
     */
    initWithViewSize:function (size, container) {
        if (this.init(true)) {
            this._container = container;

            if (!this._container) {
                this._container = cc.Layer.create();
                this._container.ignoreAnchorPointForPosition(false);
                this._container.setAnchorPoint(cc.p(0.0, 0.0));
            }

            this.setViewSize(size);

            this.setTouchEnabled(true);
            this._touches = [];
            this._delegate = null;
            this._bounceable = true;
            this._clippingToBounds = true;

            //this._container.setContentSize(CCSizeZero);
            this._direction = cc.SCROLLVIEW_DIRECTION_BOTH;
            this._container.setPosition(cc.p(0.0, 0.0));
            this._touchLength = 0.0;

            this.addChild(this._container);
            this._minScale = this._maxScale = 1.0;
            return true;
        }
        return false;
    },

    /**
     * Sets a new content offset. It ignores max/min offset. It just sets what's given. (just like UIKit's UIScrollView)
     *
     * @param {cc.Point} offset new offset
     * @param {Number} animated, the view scrolls to the new offset
     */
    setContentOffset:function (offset, animated) {
        if (animated) { //animate scrolling
            this.setContentOffsetInDuration(offset, BOUNCE_DURATION);
        } else { //set the container position directly
            if (!this._bounceable) {
                var minOffset = this.minContainerOffset();
                var maxOffset = this.maxContainerOffset();

                offset.x = Math.max(minOffset.x, Math.min(maxOffset.x, offset.x));
                offset.y = Math.max(minOffset.y, Math.min(maxOffset.y, offset.y));
            }

            this._container.setPosition(offset);
            if (this._delegate != null && this._delegate.scrollViewDidScroll) {
                this._delegate.scrollViewDidScroll(this);
            }
        }
    },

    getContentOffset:function () {
        return this._container.getPosition();
    },

    /**
     * Sets a new content offset. It ignores max/min offset. It just sets what's given. (just like UIKit's UIScrollView)
     * You can override the animation duration with this method.
     *
     * @param offset new offset
     * @param dt duration
     */
    setContentOffsetInDuration:function (offset, dt) {
        var scroll = cc.MoveTo.create(dt, offset);
        var expire = cc.CallFunc.create(this._stoppedAnimatedScroll, this);
        this._container.runAction(cc.Sequence.create(scroll, expire));
        this.schedule(this._performedAnimatedScroll);
    },

    /**
     * Sets a new scale and does that for a predefined duration.
     *
     * @param s a new scale vale
     * @param animated if YES, scaling is animated
     */
    setZoomScale:function (s, animated) {
        if (arguments.length == 1) {
            if (this._container.getScale() != s) {
                var oldCenter, newCenter;
                var center;

                if (this._touchLength == 0.0) {
                    center = cc.p(this._viewSize.width * 0.5, this._viewSize.height * 0.5);
                    center = this.convertToWorldSpace(center);
                } else {
                    center = this._touchPoint;
                }

                oldCenter = this._container.convertToNodeSpace(center);
                this._container.setScale(Math.max(this._minScale, Math.min(this._maxScale, s)));
                newCenter = this._container.convertToWorldSpace(oldCenter);

                var offset = cc.pSub(center, newCenter);
                if (this._delegate != null) {
                    this._delegate.scrollViewDidZoom(this);
                }
                this.setContentOffset(cc.pAdd(this._container.getPosition(), offset));
            }
        } else if (arguments.length == 2) {
            if (animated) {
                this.setZoomScaleInDuration(s, BOUNCE_DURATION);
            } else {
                this.setZoomScale(s);
            }
        }
    },

    getZoomScale:function () {
        return this._container.getScale();
    },

    /**
     * Sets a new scale for container in a given duration.
     *
     * @param s a new scale value
     * @param animation duration
     */
    setZoomScaleInDuration:function (s, dt) {
        if (dt > 0) {
            if (this._container.getScale() != s) {
                var scaleAction = cc.ActionTween.create(dt, "zoomScale", this._container.getScale(), s);
                this.runAction(scaleAction);
            }
        } else {
            this.setZoomScale(s);
        }
    },

    /**
     * Returns the current container's minimum offset. You may want this while you animate scrolling by yourself
     */
    minContainerOffset:function () {
        return cc.p(this._viewSize.width - this._container.getContentSize().width * this._container.getScaleX(),
            this._viewSize.height - this._container.getContentSize().height * this._container.getScaleY());
    },

    /**
     * Returns the current container's maximum offset. You may want this while you animate scrolling by yourself
     */
    maxContainerOffset:function () {
        return cc.p(0.0, 0.0);
    },

    /**
     * Determines if a given node's bounding box is in visible bounds
     *
     * @return YES if it is in visible bounds
     */
    isNodeVisible:function (node) {
        var offset = this.getContentOffset();
        var size = this.getViewSize();
        var scale = this.getZoomScale();

        var viewRect = cc.RectMake(-offset.x / scale, -offset.y / scale, size.width / scale, size.height / scale);

        return cc.CCRectIntersectsRect(viewRect, node.getBoundingBox());
    },

    /**
     * Provided to make scroll view compatible with SWLayer's pause method
     */
    pause:function (sender) {
        this._container.pauseSchedulerAndActions();
        var selChildren = this._container.getChildren();
        for (var i = 0; i < selChildren.length; i++) {
            selChildren[i].pauseSchedulerAndActions();
        }
    },

    /**
     * Provided to make scroll view compatible with SWLayer's resume method
     */
    resume:function (sender) {
        var selChildren = this._container.getChildren();
        for (var i = 0; i < selChildren.length; i++) {
            selChildren[i].resumeSchedulerAndActions();
        }

        this._container.resumeSchedulerAndActions();
    },

    isDragging:function () {
        return this._dragging;
    },
    isTouchMoved:function () {
        return this._touchMoved;
    },
    isBounceable:function () {
        return this._bounceable;
    },
    setBounceable:function (bounceable) {
        this._bounceable = bounceable;
    },

    /**
     * size to clip. CCNode boundingBox uses contentSize directly.
     * It's semantically different what it actually means to common scroll views.
     * Hence, this scroll view will use a separate size property.
     */
    getViewSize:function () {
        return this._viewSize;
    },

    setViewSize:function (size) {
        this._viewSize = size;
        this.setContentSize(size, true);
    },

    getContainer:function () {
        return this._container;
    },

    setContainer:function (container) {
        this.removeAllChildren(true);

        if (!container)
            return;

        this._container = container;
        this._container.ignoreAnchorPointForPosition(false);
        this._container.setAnchorPoint(cc.p(0.0, 0.0));

        this.addChild(this._container);
        this.setViewSize(this._viewSize);
    },

    /**
     * direction allowed to scroll. CCScrollViewDirectionBoth by default.
     */
    getDirection:function () {
        return this._direction;
    },
    setDirection:function (direction) {
        this._direction = direction;
    },

    getDelegate:function () {
        return this._delegate;
    },
    setDelegate:function (delegate) {
        this._delegate = delegate;
    },

    /** override functions */
    // optional
    onTouchBegan:function (touch, event) {
        if (!this.isVisible())
            return false;

        var frame = cc.RectMake(this.getPosition().x, this.getPosition().y, this._viewSize.width, this._viewSize.height);

        //dispatcher does not know about clipping. reject touches outside visible bounds.
        var locPoint = this._container.convertToWorldSpace(this._container.convertTouchToNodeSpace(touch));
        if (this._touches.length > 2 || this._touchMoved || !cc.Rect.CCRectContainsPoint(frame, locPoint))
            return false;

        //if (!cc.ArrayContainsObject(this._touches, touch)) {
        this._touches.push(touch);
        //}

        if (this._touches.length == 1) { // scrolling
            this._touchPoint = this.convertTouchToNodeSpace(touch);
            this._touchMoved = false;
            this._dragging = true; //dragging started
            this._scrollDistance = cc.p(0.0, 0.0);
            this._touchLength = 0.0;
        } else if (this._touches.length == 2) {
            this._touchPoint = cc.pMidpoint(this.convertTouchToNodeSpace(this._touches[0]),
                this.convertTouchToNodeSpace(this._touches[1]));
            this._touchLength = cc.pDistance(this._container.convertTouchToNodeSpace(this._touches[0]),
                this._container.convertTouchToNodeSpace(this._touches[1]));
            this._dragging = false;
        }
        return true;
    },

    onTouchMoved:function (touch, event) {
        if (!this.isVisible())
            return;

        //if (cc.ArrayContainsObject(this._touches, touch)) {
        if (this._touches.length == 1 && this._dragging) { // scrolling
            this._touchMoved = true;
            var frame = cc.RectMake(this.getPosition().x, this.getPosition().y, this._viewSize.width, this._viewSize.height);
            //var newPoint = this.convertTouchToNodeSpace(this._touches[0]);
            var newPoint = this.convertTouchToNodeSpace(touch);
            var moveDistance = cc.pSub(newPoint, this._touchPoint);
            this._touchPoint = newPoint;

            if (cc.Rect.CCRectContainsPoint(frame, this.convertToWorldSpace(newPoint))) {
                switch (this._direction) {
                    case cc.SCROLLVIEW_DIRECTION_VERTICAL:
                        moveDistance = cc.p(0.0, moveDistance.y);
                        break;
                    case cc.SCROLLVIEW_DIRECTION_HORIZONTAL:
                        moveDistance = cc.p(moveDistance.x, 0.0);
                        break;
                    default:
                        break;
                }

                this._container.setPosition(cc.pAdd(this._container.getPosition(), moveDistance));
                var maxInset = this._maxInset;
                var minInset = this._minInset;

                //check to see if offset lies within the inset bounds
                var newX = Math.min(this._container.getPosition().x, maxInset.x);
                newX = Math.max(newX, minInset.x);
                var newY = Math.min(this._container.getPosition().y, maxInset.y);
                newY = Math.max(newY, minInset.y);

                 this._scrollDistance = cc.pSub(moveDistance, cc.p(newX - this._container.getPosition().x, newY - this._container.getPosition().y));
                 this.setContentOffset(cc.p(newX, newY));
            }
        } else if (this._touches.length == 2 && !this._dragging) {
            var len = cc.pDistance(this._container.convertTouchToNodeSpace(this._touches[0]),
                this._container.convertTouchToNodeSpace(this._touches[1]));
            this.setZoomScale(this.getZoomScale() * len / this._touchLength);
        }
    },

    onTouchEnded:function (touch, event) {
        if (!this.isVisible())
            return;

        if (this._touches.length == 1 && this._touchMoved)
            this.schedule(this._deaccelerateScrolling);

        this._touches.length = 0;
        this._dragging = false;
        this._touchMoved = false;
    },

    onTouchCancelled:function (touch, event) {
        if (!this.isVisible())
            return;

        this._touches.length = 0;
        this._dragging = false;
        this._touchMoved = false;
    },

    setContentSize:function (size, isDirectCall) {
        if ((isDirectCall != null) && (isDirectCall == true))
            this._super(size);
        else {
            if (this.getContainer() != null) {
                this.getContainer().setContentSize(size);
                this.updateInset();
            }
        }
    },

    getContentSize:function () {
        return this._container.getContentSize();
    },

    updateInset:function () {
        if (this.getContainer() != null) {
            this._maxInset = this.maxContainerOffset();
            this._maxInset = cc.p(this._maxInset.x + this._viewSize.width * INSET_RATIO,
                this._maxInset.y + this._viewSize.height * INSET_RATIO);
            this._minInset = this.minContainerOffset();
            this._minInset = cc.p(this._minInset.x - this._viewSize.width * INSET_RATIO,
                this._minInset.y - this._viewSize.height * INSET_RATIO);
        }
    },

    /**
     * Determines whether it clips its children or not.
     */
    isClippingToBounds:function () {
        return this._clippingToBounds;
    },

    setClippingToBounds:function (clippingToBounds) {
        this._clippingToBounds = clippingToBounds;
    },

    visit:function (ctx) {
        // quick return if not visible
        if (!this.isVisible())
            return;

        var context = ctx || cc.renderContext;
        var i;
        if (cc.renderContextType == cc.CANVAS) {
            context.save();
            this.transform(context);
            this._beforeDraw(context);

            if (this._children && this._children.length > 0) {
                this.sortAllChildren();
                // draw children zOrder < 0
                for (i = 0; i < this._children.length; i++) {
                    if (this._children[i] && this._children[i]._zOrder < 0)
                        this._children[i].visit(context);
                    else
                        break;
                }

                this.draw(context);             // self draw

                // draw children zOrder >= 0
                if (this._children) {
                    for (; i < this._children.length; i++) {
                        if (this._children[i] && this._children[i]._zOrder >= 0)
                            this._children[i].visit(context);
                    }
                }
            } else
                this.draw(context);             // self draw

            this._afterDraw();

            context.restore();
        } else {
            //TODO visit by WebGL
            /*cc.kmGLPushMatrix();

             //	glPushMatrix();

             if (this._grid && this._grid.isActive()) {
             this._grid.beforeDraw();
             this.transformAncestors();
             }

             this.transform();
             this.beforeDraw();

             if (this._children) {
             var i = 0;

             // draw children zOrder < 0
             for (; i < this._children.length; i++) {
             if (this._children[i].getZOrder() < 0)
             this._children[i].visit();
             else
             break;
             }

             // this draw
             this.draw();

             // draw children zOrder >= 0
             for (; i < this._children.length; i++) {
             this._children[i].visit();
             }
             } else {
             this.draw();
             }

             this.afterDraw();
             if (this._grid && this._grid.isActive()) {
             this._grid.afterDraw(this);
             }

             cc.kmGLPopMatrix();
             //	glPopMatrix();*/
        }
    },

    addChild:function (child, zOrder, tag) {
        if (!child)
            throw new Error("child must not nil!");

        zOrder = zOrder || child.getZOrder();
        tag = tag || child.getTag();

        child.ignoreAnchorPointForPosition(false);
        child.setAnchorPoint(cc.p(0.0, 0.0));
        if (this._container != child) {
            this._container.addChild(child, zOrder, tag);
        } else {
            this._super(child, zOrder, tag);
        }
    },

    setTouchEnabled:function (e) {
        this._super(e);
        if (!e) {
            this._dragging = false;
            this._touchMoved = false;
            this._touches.length = 0;
        }
    },

    /**
     * Init this object with a given size to clip its content.
     *
     * @param size view size
     * @return initialized scroll view object
     */
    _initWithViewSize:function (size) {
        return null;
    },

    /**
     * Relocates the container at the proper offset, in bounds of max/min offsets.
     *
     * @param animated If YES, relocation is animated
     */
    _relocateContainer:function (animated) {
        var min = this.minContainerOffset();
        var max = this.maxContainerOffset();

        var oldPoint = this._container.getPosition();
        var newX = oldPoint.x;
        var newY = oldPoint.y;
        if (this._direction == cc.SCROLLVIEW_DIRECTION_BOTH || this._direction == cc.SCROLLVIEW_DIRECTION_HORIZONTAL) {
            newX = Math.min(newX, max.x);
            newX = Math.max(newX, min.x);
        }

        if (this._direction == cc.SCROLLVIEW_DIRECTION_BOTH || this._direction == cc.SCROLLVIEW_DIRECTION_VERTICAL) {
            newY = Math.min(newY, max.y);
            newY = Math.max(newY, min.y);
        }

        if (newY != oldPoint.y || newX != oldPoint.x) {
            this.setContentOffset(cc.p(newX, newY), animated);
        }
    },
    /**
     * implements auto-scrolling behavior. change SCROLL_DEACCEL_RATE as needed to choose
     * deacceleration speed. it must be less than 1.0f.
     *
     * @param dt delta
     */
    _deaccelerateScrolling:function (dt) {
        if (this._dragging) {
            this.unschedule(this._deaccelerateScrolling);
            return;
        }

        var maxInset, minInset;
        this._container.setPosition(cc.pAdd(this._container.getPosition(), this._scrollDistance));
        if (this._bounceable) {
            maxInset = this._maxInset;
            minInset = this._minInset;
        } else {
            maxInset = this.maxContainerOffset();
            minInset = this.minContainerOffset();
        }

        //check to see if offset lies within the inset bounds
        var newX = Math.min(this._container.getPosition().x, maxInset.x);
        newX = Math.max(newX, minInset.x);
        var newY = Math.min(this._container.getPosition().y, maxInset.y);
        newY = Math.max(newY, minInset.y);

        this._scrollDistance = cc.pSub(this._scrollDistance, cc.p(newX - this._container.getPosition().x, newY - this._container.getPosition().y));
        this._scrollDistance = cc.pMult(this._scrollDistance, SCROLL_DEACCEL_RATE);
        this.setContentOffset(cc.p(newX, newY));

        if ((Math.abs(this._scrollDistance.x) <= SCROLL_DEACCEL_DIST &&
            Math.abs(this._scrollDistance.y) <= SCROLL_DEACCEL_DIST) ||
            newX == maxInset.x || newX == minInset.x ||
            newY == maxInset.y || newY == minInset.y) {
            this.unschedule(this._deaccelerateScrolling);
            this._relocateContainer(true);
        }
    },
    /**
     * This method makes sure auto scrolling causes delegate to invoke its method
     */
    _performedAnimatedScroll:function (dt) {
        if (this._dragging) {
            this.unschedule(this._performedAnimatedScroll);
            return;
        }

        if (this._delegate != null) {
            this._delegate.scrollViewDidScroll(this);
        }
    },
    /**
     * Expire animated scroll delegate calls
     */
    _stoppedAnimatedScroll:function (node) {
        this.unschedule(this._performedAnimatedScroll);
    },

    /**
     * clip this view so that outside of the visible bounds can be hidden.
     */
    _beforeDraw:function (context) {
        if (this._clippingToBounds) {
            var screenPos = this.getParent().getPosition();  //this.convertToWorldSpace(this.getParent().getPosition());
            var scaleValue = this.getScale();

            if (cc.renderContextType == cc.CANVAS) {
                var ctx = context || cc.renderContext;

                var getWidth = (this._viewSize.width * scaleValue);
                var getHeight = (this._viewSize.height * scaleValue);
                var startX = screenPos.x * scaleValue;
                var startY = screenPos.y * scaleValue;// + this._anchorPointInPoints.y;

                ctx.beginPath();
                ctx.rect(startX, startY, getWidth, -getHeight);
                ctx.clip();
                ctx.closePath();
            } else {
                // TODO: This scrollview should respect parents' positions
                //glEnable(GL_SCISSOR_TEST);

                //clip
                //CCEGLView::sharedOpenGLView()->setScissorInPoints(screenPos.x*s, screenPos.y*s, m_tViewSize.width*s, m_tViewSize.height*s);
            }
        }
    },
    /**
     * retract what's done in beforeDraw so that there's no side effect to
     * other nodes.
     */
    _afterDraw:function () {
        if (this._clippingToBounds) {
            if (cc.renderContextType == cc.WEBGL) {
                //TODO disable clip
                //glDisable(GL_SCISSOR_TEST);
            }
        }
    },
    /**
     * Zoom handling
     */
    _handleZoom:function () {
    }
});

/**
 * Returns an autoreleased scroll view object.
 *
 * @param size view size
 * @param container parent object
 * @return autoreleased scroll view object
 */
cc.ScrollView.create = function (size, container) {
    var pRet = new cc.ScrollView();
    if (arguments.length == 2) {
        if (pRet && pRet.initWithViewSize(size, container))
            return pRet;
    } else {
        if (pRet && pRet.init())
            return pRet;
    }
    return null;
};