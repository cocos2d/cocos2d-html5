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
 * the DOM object
 * @class
 * @type {Object}
 */
cc.DOM = {};

/**
 * @function
 * @private
 * @param x
 */
cc.DOM.addMethods = function (x) {
    for (var funcs in cc.DOM.methods) {
        x[funcs] = cc.DOM.methods[funcs];
    }
};
cc.DOM.methods = /** @lends cc.DOM# */{
    /**
     * Replace the set position of ccNode
     * @param {object|Number} x
     * @param {Number} y
     */
    setPosition:function (x, y) {
        if (arguments.length == 2) {
            this._position.x = x;
            this._position.y = y;
            //this._position = cc.p(newPosOrxValue,yValue);
        } else {
            this._position = x;
        }
        this.setNodeDirty();
        this.dom.translates(this._position.x, -this._position.y);
    },
    /**
     * replace set Position Y of ccNode
     * @param {Number} y
     */
    setPositionY:function (y) {
        this._position.y = y;
        this.setNodeDirty();
        this.dom.translates(this._position.x, -this._position.y);
    },

    /**
     * replace set Position X of ccNode
     * @param {Number} x
     */
    setPositionX:function (x) {
        this._position.x = x;
        this.setNodeDirty();
        this.dom.translates(this._position.x, -this._position.y);
    },

    /**
     * replace set Scale of ccNode
     * @param {object|Number} scale
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
        this.dom.resize(this._scaleX, this._scaleY);
    },

    /**
     * replace set Scale X of ccNode
     * @param {Number} x
     */
    setScaleX:function (x) {
        this._scaleX = x;
        this.setNodeDirty();
        this.dom.resize(this._scaleX, this._scaleY);
    },

    /**
     * replace set Scale Y of ccNode
     * @param {Number} y
     */
    setScaleY:function (y) {
        this._scaleY = y;
        this.setNodeDirty();
        this.dom.resize(this._scaleX, this._scaleY);
    },

    /**
     * replace set anchorpoint of ccNode
     * @param {object} point
     */
    setAnchorPoint:function (point) {
        this._anchorPoint = point;
        this._anchorPointInPoints = cc.p(this._contentSize.width * this._anchorPoint.x,
            this._contentSize.height * this._anchorPoint.y);
        this.dom.style[cc.$.pfx + 'TransformOrigin'] = '' + this._anchorPointInPoints.x + 'px ' + -this._anchorPointInPoints.y + 'px';
        if (this.isIgnoreAnchorPointForPosition()) {
            this.dom.style.marginLeft = 0;
            this.dom.style.marginBottom = 0;
        }
        else {
            this.dom.style.marginLeft = (this.isToggler) ? 0 : -this._anchorPointInPoints.x + 'px';
            this.dom.style.marginBottom = -this._anchorPointInPoints.y + 'px';
        }
        this.setNodeDirty();
    },

    /**
     * replace set ContentSize of ccNode
     * @param {cc.Size} size
     */
    setContentSize:function (size) {
        if (!cc.sizeEqualToSize(size, this._contentSize)) {
            this._contentSize = size;
            this._anchorPointInPoints = cc.p(this._contentSize.width * this._anchorPoint.x,
                this._contentSize.height * this._anchorPoint.y);
            this.dom.width = size.width;
            this.dom.height = size.height;
            this.setAnchorPoint(this.getAnchorPoint());
        }
        if (this.canvas) {
            this.canvas.width = this._contentSize.width;
            this.canvas.height = this._contentSize.height;
        }
        this.setNodeDirty();
        this.redraw();
    },

    /**
     * replace set Rotation of ccNode
     * @param {Number} newRotation
     */
    setRotation:function (newRotation) {
        if (this._rotation == newRotation)
            return;
        //save dirty region when before change
        //this._addDirtyRegionToDirector(this.getBoundingBoxToWorld());

        this._rotationX = this._rotationY = newRotation;
        this._rotationRadiansX = this._rotationX * (Math.PI / 180);
        this._rotationRadiansY = this._rotationY * (Math.PI / 180);

        this.setNodeDirty();
        this.dom.rotate(newRotation);
    },

    /**
     * replace set SkewX of ccNode
     * @param {Number} x
     */
    setSkewX:function (x) {
        this._skewX = x;
        this.setNodeDirty();
        this.dom.setSkew(this._skewX, this._skewY);
    },

    /**
     * replace set SkewY of ccNode
     * @param {Number} y
     */
    setSkewY:function (y) {
        this._skewY = y;
        this.setNodeDirty();
        this.dom.setSkew(this._skewX, this._skewY);
    },

    /**
     * replace set Visible of ccNode
     * @param {Boolean} x
     */
    setVisible:function (x) {
        this._visible = x;
        this.setNodeDirty();
        if (this.dom)
            this.dom.style.display = (x) ? 'block' : 'none';
    },
    _setZOrder:function (z) {
        this._zOrder = z
        this.setNodeDirty();
        if (this.dom)
            this.dom.zIndex = z;
    },

    /**
     * replace set Parent of ccNode
     * @param {cc.Node} p
     */
    setParent:function (p) {
        this._parent = p;

        if (p !== null) {
            p.setAnchorPoint(p.getAnchorPoint());
            this.setNodeDirty();
            cc.DOM.parentDOM(this);
        }
    },

    /**
     * replace resume Schedule and actions of ccNode
     */
    resumeSchedulerAndActions:function () {
        this.getScheduler().resumeTarget(this);
        this.getActionManager().resumeTarget(this);
        //if dom does not have parent, but node has no parent and its running
        if (this.dom && !this.dom.parentNode) {
            if (!this.getParent()) {
                this.dom.appendTo(cc.container);
            }
            else {
                cc.DOM.parentDOM(this);
            }
        }
        if (this.dom)
            this.dom.style.visibility = "visible";
    },

    /**
     * replace pause Schedule and Actions of ccNode
     */
    pauseSchedulerAndActions:function () {
        this.getScheduler().pauseTarget(this);
        this.getActionManager().pauseTarget(this);
        if (this.dom) {
            this.dom.style.visibility = 'hidden';
        }
    },

    /**
     * replace clean up of ccNode
     */
    cleanup:function () {
        // actions
        this.stopAllActions();
        this.unscheduleAllCallbacks();

        // timers
        this._arrayMakeObjectsPerformSelector(this._children, cc.Node.StateCallbackType.cleanup);
        if (this.dom) {
            this.dom.remove();
        }
    },
    /**
     * replace remove from parent and clean up of ccNode
     */
    removeFromParentAndCleanup:function () {
        this.dom.remove();
    },
    setOpacity:function (o) {
        this._opacity = o;
        this.dom.style.opacity = o / 255;
    },
    /**
     * refresh/updates the DOM element
     */
    redraw:function () {
        if (this.isSprite) {
            var tmp = this._children;
            this._children = null;
            cc.Sprite.prototype.visit.call(this, this.ctx);
            this._children = tmp;
        }
        else {
            cc.Sprite.prototype.visit.call(this, this.ctx);
        }
    }
};
/**
 * @function
 * @private
 * @param x
 * @return {Boolean}
 */
cc.DOM.parentDOM = function (x) {
    var p = x.getParent();
    //if has parent, parent need to have dom too
    if (!p || !x.dom)
        return false;
    if (!p.dom) {
        cc.DOM.placeHolder(p);
        p.setParent = cc.DOM.methods.setParent;
    }
    //if parent have dom, attach self to parent
    x.dom.appendTo(p.dom);
    p.setAnchorPoint(p.getAnchorPoint());

    if (p.getParent()) {
        cc.DOM.parentDOM(p);
    } else {
        //parent has no more parent, if its running, then add it to the container
        //if (p.isRunning()) {
        //find EGLView div
        var eglViewDiv = cc.$("#EGLViewDiv");
        if(eglViewDiv){
            p.dom.appendTo(eglViewDiv);
        } else {
            eglViewDiv = cc.$new("div");
            eglViewDiv.id = "EGLViewDiv";

            var eglViewer = cc.EGLView.getInstance();
            var designSize = eglViewer.getDesignResolutionSize();
            var viewPortRect = eglViewer.getViewPortRect();
            var screenSize = eglViewer.getFrameSize();
            var designSizeWidth = designSize.width, designSizeHeight = designSize.height;
            if((designSize.width === 0) && (designSize.height === 0)){
                designSizeWidth = screenSize.width;
                designSizeHeight = screenSize.height;
            }

            var viewPortWidth = viewPortRect.size.width, viewPortHeight = viewPortRect.size.height;
            if((viewPortRect.size.width === 0) && (viewPortRect.size.height === 0)){
                viewPortWidth = screenSize.width;
                viewPortHeight = screenSize.height;
            }

            eglViewDiv.style.position = 'absolute';
            eglViewDiv.style.bottom = 0;
            //x.dom.style.display='block';
            eglViewDiv.style.width = designSizeWidth + "px";
            eglViewDiv.style.maxHeight = designSizeHeight + "px";
            eglViewDiv.style.margin = 0;

            eglViewDiv.resize(eglViewer.getScaleX(), eglViewer.getScaleX());
            eglViewDiv.style.left = ((viewPortWidth - designSizeWidth) / 2
                + (screenSize.width - viewPortWidth ) / 2) + "px";
            eglViewDiv.style.bottom = ((screenSize.height - viewPortHeight ) / 2) + "px";

            p.dom.appendTo(eglViewDiv);
            eglViewDiv.appendTo(cc.container);
        }
        //}
    }
    return true;
};

/**
 * @function
 * @private
 * @param x
 */
cc.DOM.setTransform = function (x) {
    if (x.ctx) {
        /*        x.ctx.save();
         x.ctx.setTransform(1,0,0,1,0,0);
         x.ctx.clearRect(0,0,x.canvas.width, x.canvas.height);
         x.ctx.restore();*/
        x.ctx.translate(x.getAnchorPointInPoints().x, x.getAnchorPointInPoints().y);
        if (x.isSprite) {
            var tmp = x._children;
            x._children = null;
            cc.Sprite.prototype.visit.call(x, x.ctx);
            x._children = tmp;
        }
        else {
            cc.Sprite.prototype.visit.call(x, x.ctx);
        }
    }
    if (x.dom) {
        x.dom.position.x = x.getPosition().x;
        x.dom.position.y = -x.getPosition().y;
        x.dom.rotation = x.getRotation();
        x.dom.scale = {x:x.getScaleX(), y:x.getScaleY()};
        x.dom.skew = {x:x.getSkewX(), y:x.getSkewY()};
        if (x.setAnchorPoint)
            x.setAnchorPoint(x.getAnchorPoint());
        x.dom.transforms();
        x.dom.position.y = -x.getPosition().y;
        x.dom.rotation = x.getRotation();
        x.dom.scale = {x:x.getScaleX(), y:x.getScaleY()};
        x.dom.skew = {x:x.getSkewX(), y:x.getSkewY()};
        if (x.setAnchorPoint)
            x.setAnchorPoint(x.getAnchorPoint());
        x.dom.transforms();
    }

};

/**
 * @function
 * @private
 * @param x
 */
cc.DOM.forSprite = function (x) {
    x.dom = cc.$new('div');
    x.canvas = cc.$new('canvas');
    x.canvas.width = x.getContentSize().width;
    x.canvas.height = x.getContentSize().height;
    x.dom.style.position = 'absolute';
    x.dom.style.bottom = 0;
    x.ctx = x.canvas.getContext('2d');
    x.dom.appendChild(x.canvas);
    if (x.getParent()) {
        cc.DOM.parentDOM(x);
    }
    x.isSprite = true;
};

/**
 * This creates divs for parent Nodes that are related to the current node
 * @function
 * @private
 * @param x
 */
cc.DOM.placeHolder = function (x) {
    //creating a placeholder dom to simulate other ccNode in the hierachy
    x.dom = cc.$new('div');
    x.placeholder = true;
    x.dom.style.position = 'absolute';
    x.dom.style.bottom = 0;
    //x.dom.style.display='block';
    x.dom.style.width = (x.getContentSize().width || cc.Director.getInstance().getWinSize().width) + "px";
    x.dom.style.maxHeight = (x.getContentSize().height || cc.Director.getInstance().getWinSize().height) + "px";
    x.dom.style.margin = 0;
    cc.DOM.setTransform(x);
    x.dom.transforms();
    cc.DOM.addMethods(x);
    //x.dom.style.border = 'red 1px dotted';
};

/**
 * Converts cc.Sprite or cc.MenuItem to DOM elements <br/>
 * It currently only supports cc.Sprite and cc.MenuItem
 * @function
 * @param {cc.Sprite|cc.MenuItem|Array} nodeObject
    * * @example
 * // example
 * cc.DOM.convert(Sprite1, Sprite2, Menuitem);
 *
 * var myDOMElements = [Sprite1, Sprite2, MenuItem];
 * cc.DOM.convert(myDOMElements);
 */
cc.DOM.convert = function (nodeObject) {
    //if passing by list, make it an array
    if (arguments.length > 1) {
        cc.DOM.convert(arguments);
        return;
    } else if (arguments.length == 1 && !arguments[0].length) {
        cc.DOM.convert([arguments[0]]);
        return;
    }
    var args = arguments[0];
    for (var i = 0; i < args.length; i++) {
        //first check if its sprite
        if (args[i] instanceof cc.Sprite) {
            // create a canvas
            if (!args[i].dom)
                cc.DOM.forSprite(args[i]);
        } else {
            cc.log('DOM converter only supports sprite and menuitems yet');
        }
        cc.DOM.addMethods(args[i]);
        args[i].visit = function () {
        };
        args[i].transform = function () {
        };
        cc.DOM.setTransform(args[i]);
        args[i].setVisible(args[i].isVisible());
    }
};