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
 * Set to true to enalbe DOM debugging/editing, which allows you to move, rotate, scale, skew an element.
 * Set to false to turn off debugging/editing
 * @type Boolean
 */
cc.DOMEditMode = true;
/**
 * @function
 * @private
 * @param x
 */
cc.DOM.addMethods = function (x) {
    for (funcs in cc.DOM.methods) {
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
        this.dom.style[cc.$.pfx + 'TransformOrigin'] = '' + this._anchorPointInPoints.x + 'px ' + this._anchorPointInPoints.y + 'px';
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
        if (cc.DOMEditMode && !this.placeholder) {
            this.dom.style.width = this._contentSize.width + 'px';
            this.dom.style.height = this._contentSize.height + 'px';
            this.dom.addClass('CCDOMEdit');
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

        this._rotation = newRotation;
        this._rotationRadians = this._rotation * (Math.PI / 180);
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
            this.dom.style.visibility = (x) ? 'visible' : 'hidden';
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
        p.setAnchorPoint(p.getAnchorPoint());
        this.setNodeDirty();
        cc.DOM.parentDOM(this);
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
    if (cc.DOMEditMode) {
        x.dom.style.width = x.getContentSize().width + 'px';
        x.dom.style.height = x.getContentSize().height + 'px';
        x.dom.addClass('CCDOMEdit');
    }
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
 * @function
 * @private
 * @param x
 */
cc.DOM.forMenuToggler = function (x) {
    x.dom = cc.$new('div');
    x.dom2 = cc.$new('div');
    x.dom.appendChild(x.dom2);
    for (var i = 0; i < x._subItems.length; i++) {
        cc.DOM.convert(x._subItems[i]);
        x.dom2.appendChild(x._subItems[i].dom);
        x._subItems[i].setPosition(cc.p(0, 0));
    }
    x.dom.style.marginLeft = 0;
    x.setSelectedIndex = function (SelectedIndex) {
        this._selectedIndex = SelectedIndex;
        for (var i = 0; i < this._subItems.length; i++) {
            this._subItems[i].setVisible(false);
        }
        this._subItems[SelectedIndex].setVisible(true);
    };


    x.setSelectedIndex(x.getSelectedIndex());
    x.dom2.addEventListener('click', function () {
        x.activate();
    });
    x.dom2.addEventListener('mousedown', function () {
        for (var i = 0; i < x._subItems.length; i++) {
            x._subItems[i]._isEnabled = true;
            x._subItems[i]._running = true;
            x._subItems[i].selected();
            x._subItems[i]._isEnabled = false;
            x._subItems[i]._running = false;
        }
        x._subItems[x.getSelectedIndex()]._isEnabled = true;
        x._subItems[x.getSelectedIndex()]._running = true;

    });
    x.dom2.addEventListener('mouseup', function () {
        for (var i = 0; i < x._subItems.length; i++) {
            x._subItems[i]._isEnabled = true;
            x._subItems[i].unselected();
            x._subItems[i]._isEnabled = false;
        }
        x._subItems[x.getSelectedIndex()]._isEnabled = true;
    });
    x.dom2.addEventListener('mouseout', function () {
        if (x.mouseDown) {
            for (var i = 0; i < x._subItems.length; i++) {
                x._subItems[i]._isEnabled = true;
                x._subItems[i].unselected();
                x._subItems[i]._isEnabled = false;
            }
            x._subItems[x.getSelectedIndex()]._isEnabled = true;
            x.mouseDown = false;
        }
    });
    x.dom.style.position = "absolute";
    x.isToggler = true;
};

/**
 * @function
 * @private
 * @param x
 */
cc.DOM.forMenuItem = function (x) {
    x.dom = cc.$new('div');
    x.canvas = cc.$new('canvas');
    x.canvas.width = x.getContentSize().width;
    x.canvas.height = x.getContentSize().height;
    if (cc.DOMEditMode) {
        x.dom.style.width = x.getContentSize().width + 'px';
        x.dom.style.height = x.getContentSize().height + 'px';
        x.dom.addClass('CCDOMEdit');
    }
    x.dom.style.position = 'absolute';
    x.dom.style.bottom = 0;
    x.ctx = x.canvas.getContext('2d');
    x.dom.appendChild(x.canvas);
    if (x.getParent()) {
        cc.DOM.parentDOM(x);
    }
    if (x._selector) {
        //if menu item have callback
        x.canvas.addEventListener('click', function () {
            x.activate();
        });
        x.canvas.addEventListener('mousedown', function () {
            x.selected();
            x.ctx.save();
            x.ctx.setTransform(1, 0, 0, 1, 0, 0);
            x.ctx.clearRect(0, 0, x.canvas.width, x.canvas.height);
            x.ctx.restore();
            x.mouseDown = true;
            cc.Sprite.prototype.visit.call(x, x.ctx);
        });
        x.canvas.addEventListener('mouseup', function () {
            x.unselected();
            x.ctx.save();
            x.ctx.setTransform(1, 0, 0, 1, 0, 0);
            x.ctx.clearRect(0, 0, x.canvas.width, x.canvas.height);
            x.ctx.restore();
            cc.Sprite.prototype.visit.call(x, x.ctx);
        });
        x.canvas.addEventListener('mouseout', function () {
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
 * @param {cc.Sprite|cc.MenuItem|Array}
    * * @example
 * // example
 * cc.DOM.convert(Sprite1, Sprite2, Menuitem);
 *
 * var myDOMElements = [Sprite1, Sprite2, MenuItem];
 * cc.DOM.convert(myDOMElements);
 */
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
        } else if (args[i] instanceof cc.MenuItemToggle) {
            if (!args[i].dom)
                cc.DOM.forMenuToggler(args[i]);
        } else if (args[i] instanceof cc.MenuItem) {
            if (!args[i].dom)
                cc.DOM.forMenuItem(args[i]);
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
        if (cc.DOMEditMode) {
            //add hover event to popup inspector
            if (!cc.DOM.tooltip) {
                var style = cc.$new('style');
                style.textContent = ".CCDOMEdit:hover{border: rgba(255,0,0,0.5) 2px dashed;left: -2px;} .CCDOMEdit "
                    + " #CCCloseButton{width:80px;height:15px;background: rgba(0,0,0,0.4);border:1px solid #aaaaaa;font-size: 9px;line-height:9px;color:#bbbbbb;} "
                    + " .CCTipWindow .CCTipMove{cursor:move;} .CCTipWindow .CCTipRotate{cursor:w-resize;} .CCTipWindow .CCTipScale{cursor:ne-resize;} "
                    + ".CCTipWindow .CCTipSkew{cursor:se-resize;} .CCTipWindow input{width:40px;background: rgba(0,0,0,0.5);color:white;border:none;border-bottom: 1px solid #fff;} "
                    + "div.CCTipWindow:hover{color:rgb(50,50,255);}";
                document.body.appendChild(style);
                cc.container.style.overflow = "visible";
                var tip = cc.DOM.tooltip = cc.$new('div');
                tip.mouseDown = false;
                document.body.appendChild(tip);
                tip.addClass('CCTipWindow');
                tip.style.width = '140px';
                tip.style.height = '134px';
                tip.style.background = 'rgba(50,50,50,0.5)';
                tip.style.border = '1px rgba(255,255,255,0.5) solid';
                tip.style.borderRadius = '5px';
                tip.style.color = 'rgb(255,255,255)';
                tip.style.boxShadow = '0 0 10px 1px rgba(0,0,0,0.5)';
                tip.style.position = 'absolute';
                tip.style.display = 'none';
                tip.style.top = 0;
                tip.style.left = '-150px';
                tip.style[cc.$.pfx + "Transform"] = 'translate3d(0,0,100px)';
                tip.style[cc.$.pfx + 'UserSelect'] = 'none';
                tip.innerHTML = '<table><tr>' +
                    '<td><label class="CCTipMove">Move</label></td><td><input type="text" value="12" id="posx"/></td><td><input type="text" value="12" id="posy"/></td></tr>' +
                    '<tr><td><label class="CCTipRotate">Rotate</label></td><td><input type="text" value="12" id="rot"/></td></tr>' +
                    '<tr><td><label class="CCTipScale">Scale</label></td><td><input type="text" value="12" id="scalex"/></td><td><input type="text" value="12" id="scaley"/></td></tr>' +
                    '<tr><td><label class="CCTipSkew">Skew</label></td><td><input type="text" value="12" id="skewx"/></td><td><input type="text" value="12" id="skewy"/></td></tr>' +
                    '</table><button id="CCCloseButton">Close</button>';
                tip.updateNumbers = function () {
                    var t = cc.DOM.tooltip;
                    if (t.target) {
                        t.find("#posx").value = t.target._position.x;
                        t.find("#posy").value = t.target._position.y;
                        t.find("#rot").value = t.target._rotation;
                        t.find("#scalex").value = t.target._scaleX;
                        t.find("#scaley").value = t.target._scaleY;
                        t.find("#skewx").value = t.target._skewX;
                        t.find("#skewy").value = t.target._skewY;
                    }
                };
                tip.find('.CCTipMove').addEventListener('mousedown', function (e) {
                    tip.mode = 'move';
                    tip.initialpos = {x:e.clientX, y:e.clientY};
                    tip.mouseDown = true;
                });
                tip.find('.CCTipRotate').addEventListener('mousedown', function (e) {
                    //find out the position of cc.canvas
                    var canvaspos = cc.$.findpos(cc.canvas);
                    //find out the bottom left position of cc.canvas, adding canvas height to canvaspos
                    var canvaspos = {x:canvaspos.x, y:canvaspos.y + cc.canvas.height};
                    //add the position of the element from canvas bottom left
                    tip.nodepos = tip.target.getPosition();
                    tip.nodepos = {x:canvaspos.x + tip.nodepos.x, y:canvaspos.y - tip.nodepos.y};
                    tip.startPos = {x:e.x, y:e.y};
                    tip.mode = 'rot';
                    tip.initialpos = {x:e.clientX, y:e.clientY};
                    tip.mouseDown = true;
                    //also need to find out the starting angle
                    var C = {x:tip.startPos.x, y:tip.nodepos.y};
                    var A = tip.startPos;
                    var B = tip.nodepos;
                    var a = Math.sqrt(Math.pow((B.x - C.x), 2) + Math.pow((B.y - C.y), 2));
                    var b = Math.sqrt(Math.pow((A.x - C.x), 2) + Math.pow((A.y - C.y), 2));
                    var c = Math.sqrt(Math.pow((A.x - B.x), 2) + Math.pow((A.y - B.y), 2));
                    var theta = ((a * a) + (c * c) - (b * b)) / (2 * a * c);
                    var theta = Math.acos(theta) * (180 / cc.PI);
                    tip.startAngle = theta;
                    tip.startRot = tip.target.getRotation();
                });
                tip.find('.CCTipScale').addEventListener('mousedown', function (e) {
                    tip.mode = 'scale';
                    tip.initialpos = {x:e.clientX, y:e.clientY};
                    tip.mouseDown = true;
                });
                tip.find('.CCTipSkew').addEventListener('mousedown', function (e) {
                    tip.mode = 'skew';
                    tip.initialpos = {x:e.clientX, y:e.clientY};
                    tip.mouseDown = true;
                });
                document.body.addEventListener('mousemove', function (e) {
                    if (tip.mode == 'move') {
                        var movex = e.clientX - tip.initialpos.x;
                        var movey = e.clientY - tip.initialpos.y;
                        var nodepos = tip.target.getPosition();
                        tip.target.setPosition(movex + nodepos.x, -movey + nodepos.y);
                        tip.initialpos = {x:e.clientX, y:e.clientY};
                        tip.updateNumbers();
                    }
                    else if (tip.mode == 'rot') {
                        //get the third point position
                        var C = {x:e.x, y:e.y};
                        var A = tip.startPos;
                        var B = tip.nodepos;
                        var a = Math.sqrt(Math.pow((B.x - C.x), 2) + Math.pow((B.y - C.y), 2));
                        var b = Math.sqrt(Math.pow((A.x - C.x), 2) + Math.pow((A.y - C.y), 2));
                        var c = Math.sqrt(Math.pow((A.x - B.x), 2) + Math.pow((A.y - B.y), 2));
                        var theta = ((a * a) + (c * c) - (b * b)) / (2 * a * c);
                        var theta = Math.acos(theta) * (180 / cc.PI);
                        //console.log({a:a,b:b,c:c,A:A,B:B,C:C});


                        //get current mouse
                        var movey = e.clientY - tip.initialpos.y;
                        var movex = e.clientX - tip.initialpos.x;
                        if (e.y > tip.startPos.y) {
                            tip.target.setRotation(-theta + tip.startRot);
                        }
                        else {
                            tip.target.setRotation(theta + tip.startRot);
                        }
                        tip.updateNumbers();
                    }
                    else if (tip.mode == 'scale') {
                        //find out the position of cc.canvas
                        //find out the bottom left position of cc.canvas
                        //add the position of the element from canvas bottom left
                        var movey = e.clientY - tip.initialpos.y;
                        var movex = e.clientX - tip.initialpos.x;
                        var nodescalex = tip.target.getScaleX();
                        var nodescaley = tip.target.getScaleY();
                        tip.target.setScale(nodescalex - (movex / 150), nodescaley + (movey / 150));
                        tip.initialpos = {x:e.clientX, y:e.clientY};
                        tip.updateNumbers();
                    }
                    else if (tip.mode == 'skew') {
                        var movey = e.clientY - tip.initialpos.y;
                        var movex = e.clientX - tip.initialpos.x;
                        var nodeskewx = tip.target.getSkewX();
                        var nodeskewy = tip.target.getSkewY();
                        tip.target.setSkewX(nodeskewx - (movex / 4));
                        tip.target.setSkewY(nodeskewy + (movey / 4));
                        tip.initialpos = {x:e.clientX, y:e.clientY};
                        tip.updateNumbers();
                    }
                });
                tip.find('#CCCloseButton').addEventListener('click', function () {
                    tip.mode = null;
                    tip.style.display = 'none';
                    tip.mouseDown = false;
                });
                document.addEventListener('mouseup', function () {
                    tip.mode = null;
                    tip.mouseDown = false;
                });
            }
            args[i].dom.ccnode = args[i];
            var that = args[i];
            args[i].dom.addEventListener('mouseover', function () {
                this.style.zIndex = 999999;

                if(this.showTooltipDiv !== undefined && this.showTooltipDiv === false)
                    return;

                if (!cc.DOM.tooltip.mouseDown) {
                    var pos = cc.$.findpos(this);
                    cc.DOM.tooltip.style.display = 'block';
                    cc.DOM.tooltip.prependTo(this);
                    cc.DOM.tooltip.target = that;
                    this.style.zIndex = 999999;
                    cc.DOM.tooltip.updateNumbers();
                }
            });
            args[i].dom.addEventListener('mouseout', function () {
                this.style.zIndex = this.ccnode._zOrder;
            });
        }
    }
};