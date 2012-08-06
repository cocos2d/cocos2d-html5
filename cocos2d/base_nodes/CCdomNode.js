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

cc.DOM = {};
cc.DOM.addMethods = function (x) {
    for (funcs in cc.DOM.methods) {
        x[funcs] = cc.DOM.methods[funcs];
    }
};
cc.DOM.methods = {
    setPosition:function (x, y) {
        if (y) {
            this._position.x = x;
            this._position.y = y;
            //this._position = cc.p(newPosOrxValue,yValue);
        } else if (x instanceof  cc.Point) {
            this._position = x;
        }
        this.dom.translate(this._position.x, -this._position.y);
    },
    setScale:function (scale, scaleY) {
        //save dirty region when before change
        //this._addDirtyRegionToDirector(this.boundingBoxToWorld());

        this._scaleX = scale;
        this._scaleY = scaleY || scale;

        //save dirty region when after changed
        //this._addDirtyRegionToDirector(this.boundingBoxToWorld());
        this.dom.resize(this._scaleX, this._scaleY);
    },
    setScaleX:function (x) {
        this._scaleX = x;
        this.dom.resize(this._scaleX, this._scaleY);
    },
    setScaleY:function (y) {
        this._scaleY = y;
        this.dom.resize(this._scaleX, this._scaleY);
    },
    setAnchorpoint:function (point) {
        this._anchorPoint = point;
        this._anchorPointInPoints = cc.p(this._contentSize.width * this._anchorPoint.x,
            this._contentSize.height * this._anchorPoint.y);
        this.dom.style[cc.$.pfx + 'TransformOrigin'] = '' + this._anchorPointInPoints.x + 'px ' + this._anchorPointInPoints.y + 'px';
        if (this.isIgnoreAnchorPointForPosition()) {
            this.dom.style.marginLeft = 0;
            this.dom.style.marginBottom = 0;
        }
        else {
            this.dom.style.marginLeft = -this._anchorPointInPoints.x + 'px';
            this.dom.style.marginBottom = -this._anchorPointInPoints.y + 'px';
        }
    },
    setContentSize:function (size) {
        if (!cc.Size.CCSizeEqualToSize(size, this._contentSize)) {
            this._contentSize = size;
            this._anchorPointInPoints = cc.p(this._contentSize.width * this._anchorPoint.x,
                this._contentSize.height * this._anchorPoint.y);
            this.dom.width = size.width;
            this.dom.height = size.height;
            this.setAnchorpoint(this.getAnchorPoint());
        }
    },
    setRotation:function (newRotation) {
        if (this._rotation == newRotation)
            return;
        //save dirty region when before change
        //this._addDirtyRegionToDirector(this.boundingBoxToWorld());

        this._rotation = newRotation;
        this._rotationRadians = this._rotation * (Math.PI / 180);
        this.dom.rotate(newRotation);
    },
    setSkewX:function (x) {
        this._skewX = x;
        this.dom.setSkew(this._skewX, this._skewY);
    },
    setSkewY:function (y) {
        this._skewY = y;
        this.dom.setSkew(this._skewX, this._skewY);
    },
    setVisible:function (x) {
        this._isVisible = x;
        this.dom.style.visibilityb = (x) ? 'visible' : 'hidden';
    },
    _setZOrder:function (z) {
        this._zOrder = z;
        this.dom.zIndex = z;
    },
    setParent:function (p) {
        this._parent = p;
        cc.DOM.parentDOM(this);
    },
    resumeSchedulerAndActions:function () {
        this.getScheduler().resumeTarget(this);
        this.getActionManager().resumeTarget(this);
        //if dom does not have parent, but node has no parent and its running
        if (!this.dom.parentNode) {
            if (!this.getParent()) {
                this.dom.appendTo(cc.container);
            }
            else {
                cc.DOM.parentDOM(this);
            }
        }
        this.dom.style.visibility = "visible";
    },
    pauseSchedulerAndActions:function () {
        this.getScheduler().pauseTarget(this);
        this.getActionManager().pauseTarget(this);
        this.dom.style.visibility = 'hidden';
    },
    cleanup:function () {
        // actions
        this.stopAllActions();
        this.unscheduleAllSelectors();

        // timers
        this._arrayMakeObjectsPerformSelector(this._children, cc.Node.StateCallbackType.cleanup);
        this.dom.remove();
    }
};
cc.DOM.parentDOM = function (x) {
    var p = x.getParent();
    //if has parent, parent need to have dom too
    if (!p.dom) {
        cc.DOM.placeHolder(p);
        p.setParent = cc.DOM.methods.setParent;
    }
    //if parent have dom, attach self to parent
    x.dom.appendTo(p.dom);
    var pp;
    if (pp = p.getParent()) {
        cc.DOM.parentDOM(p);
    }
    else {
        //parent has no more parent, if its running, then add it to the container
        if (p.isRunning()) {
            p.dom.appendTo(cc.container);
        }
    }
    //x.dom.appendTo(cc.container);
    /*    var pp;
     if(pp = p.getParent())
     {
     p.parentDiv = p.parentDiv || this.parentDiv;
     }*/
};
cc.DOM.setTransform = function (x) {
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
    x.dom.position.x = x.getPosition().x;
    x.dom.position.y = -x.getPosition().y;
    x.dom.rotation = x.getRotation();
    x.dom.scale = {x:x.getScaleX(), y:x.getScaleY()};
    x.dom.skew = {x:x.getSkewX(), y:x.getSkewY()};
    x.setAnchorpoint(x.getAnchorPoint());
    x.dom.transforms();

};
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
cc.DOM.forMenuItem = function (x) {
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
    if (x._selector) {
        //if menu item have callback
        x.dom.addEventListener('click', function () {
            x.activate();
        });
        x.dom.addEventListener('mousedown', function () {
            x.selected();
            x.ctx.save();
            x.ctx.setTransform(1, 0, 0, 1, 0, 0);
            x.ctx.clearRect(0, 0, x.canvas.width, x.canvas.height);
            x.ctx.restore();
            x.mouseDown = true;
            cc.Sprite.prototype.visit.call(x, x.ctx);
        });
        x.dom.addEventListener('mouseup', function () {
            x.unselected();
            x.ctx.save();
            x.ctx.setTransform(1, 0, 0, 1, 0, 0);
            x.ctx.clearRect(0, 0, x.canvas.width, x.canvas.height);
            x.ctx.restore();
            cc.Sprite.prototype.visit.call(x, x.ctx);
        });
        x.dom.addEventListener('mouseout', function () {
            if (x.mouseDown) {
                x.unselected();
                x.ctx.save();
                x.ctx.setTransform(1, 0, 0, 1, 0, 0);
                x.ctx.clearRect(0, 0, x.canvas.width, x.canvas.height);
                x.ctx.restore();
                cc.Sprite.prototype.visit.call(x, x.ctx);
                x.mouseDown = false;
            }
        })
    }
};
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
    x.dom.transforms();
    cc.DOM.addMethods(x);
    //x.dom.style.border = 'red 1px dotted';
};
//does not return, only convert
cc.DOM.convert = function () {
    //if passing by list, make it an array
    if (arguments.length > 1) {
        return cc.DOM.convert(arguments);
    }
    else if (arguments.length == 1 && !arguments[0].length) {
        return cc.DOM.convert([arguments[0]]);
    }
    var args = arguments[0];
    for (var i = 0; i < args.length; i++) {
        //first check if its sprite or menuitem
        if (args[i] instanceof cc.Sprite) {
            // create a canvas
            if (!args[i].dom)
                cc.DOM.forSprite(args[i]);
        }
        else if (args[i] instanceof cc.MenuItem) {
            if (!args[i].dom)
                cc.DOM.forMenuItem(args[i]);
        }
        else {
            cc.Log('DOM converter only supports sprite and menuitems yet');
        }
        cc.DOM.addMethods(args[i]);
        args[i].visit = function () {
        };
        args[i].transform = function () {
        };
        cc.DOM.setTransform(args[i]);
    }

};
