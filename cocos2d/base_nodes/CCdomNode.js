/****************************************************************************
 Copyright (c) 2010-2012 cocos2d-x.org
 Copyright (c) 2008-2010 Ricardo Quesada
 Copyright (c) 2011      Zynga Inc.

 http://www.cocos2d-x.org

 Created by JetBrains WebStorm.
 User: wuhao
 Date: 12-3-22

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
//browser detection, based on mootools
cc.Browser = {};
(function () {
    cc.Browser.ua = navigator.userAgent.toLowerCase();
    cc.Browser.platform = navigator.platform.toLowerCase();
    cc.Browser.UA = cc.Browser.ua.match(/(opera|ie|firefox|chrome|version)[\s\/:]([\w\d\.]+)?.*?(safari|version[\s\/:]([\w\d\.]+)|$)/) || [null, 'unknown', 0];
    cc.Browser.mode = cc.Browser.UA[1] == 'ie' && document.documentMode;
    cc.Browser.type = (cc.Browser.UA[1] == 'version') ? cc.Browser.UA[3] : cc.Browser.UA[1];
})();
cc.CSS3 = {};
(function () {
    var res = "";
    switch (cc.Browser.type) {
        case "firefox":
            res = "Moz";
            break;
        case "chrome":
        case "safari":
            res = "webkit";
            break;
        case "opera":
            res = "o";
            break;
        case "ie":
            res = "ms";
    }
    //TODO these works for firefox and webkit, havnt test in other browsers yet
    cc.CSS3._trans = res + "Transform";
    cc.CSS3.origin = res + "TransformOrigin";
    cc.CSS3.userSelect = res + "UserSelect";
})();
//transform the element by the passed in array which contains transformation commands
cc.CSS3.Transform = function (ele, translate, rotate, scale, skew) {
    if (arguments.length == 1 && ele.isDomNode) {
        var size = ele.getContentSize();
        var rot = ele.getRotation();
        var pos = ele.getPosition();
        var skewX = ele.getSkewX();
        var skewY = ele.getSkewY();
        var scaleX = ele.getScaleX();
        var scaleY = ele.getScaleY();
        var style = ele.dom.style;

        if (ele._m_bIsRelativeAnchorPoint) {
            ele.style.marginLeft = "-" + (ele.getAnchorPoint().x * ele.getContentSize().width) + "px";
            ele.style.top = (ele.getAnchorPoint().y * ele.getContentSize().height) + "px";
        }
        else {
            ele.style.marginLeft = 0;
            ele.style.top = 0;
        }
        ele.style[cc.CSS3.origin] = (ele.getAnchorPoint().x * 100) + "% " + (ele.getAnchorPoint().y * ele.getContentSize().height) + "px";

        style[cc.CSS3._trans] = cc.CSS3.Translate(pos.x, pos.y + size.height) +
            cc.CSS3.Rotate(rot) +
            cc.CSS3.Scale(scaleX, scaleY) +
            cc.CSS3.Skew(skewX, -skewY);
    }
    //if domMenu
    else if (arguments.length == 5) {
        ele.style[cc.CSS3._trans] = translate + rotate + scale + skew;
        //return translate + rotate + scale + skew;
    }

    return false;
};
//generate the translate string based on browser
cc.CSS3.Translate = function (x, y) {
    if (typeof x == "object") {
        y = x.y;
        x = x.x;
    }
    return "translate3d(" + parseInt(x) + "px" + ", " + ( cc.canvas.height - parseInt(y)) + "px" + ",0px) ";
};
//rotate by degree
cc.CSS3.Rotate = function (r) {
    var deg = (isNaN(r)) ? "" : "deg";
    return "rotateZ(" + r + deg + ") ";
};
cc.CSS3.Scale = function (x, y) {

    return "scale(" + x + ", " + y + ") ";
};
cc.CSS3.Skew = function (x, y) {
    var deg = (isNaN(x) && isNaN(y)) ? "" : "deg";
    return "skew(" + x + deg + ", " + y + deg + ") ";
};

cc.domNode = cc.Class.extend({
    isDomNode:true,
    _domID:0,
    _rotation:0,
    _scaleX:1,
    _scaleY:1,
    _skewX:0,
    _skewY:0,
    _pos:null, //init in ctor cc.Point
    _contentSize:null, //size of the thing
    _AnchorPoint:null,
    _children:null, //array
    _parent:null, //parent obj
    dom:null, //dom element
    style:null, //an alias of this._dom.style
    _tag:-1,
    _m_bIsRelativeAnchorPoint:true,
    _m_bIsRunning:false,
    _IsVisible:true,
    ctor:function () {
        //init member variables
        this._pos = new cc.Point();
        this._children = [];
        this._contentSize = cc.SizeZero();
        this._AnchorPoint = cc.PointZero();

        this.dom = cc.$new("div");
        this._domID = "M" + Date.now();
        this.dom.id = this._domID;
        this.style = this.dom.style;
        this.style.position = "absolute";
    },
    //Gets
    getZOrder:function () {
        return this.style.zIndex;
    },
    getSkewX:function () {
        return this._skewX;
    },
    getSkewY:function () {
        return this._skewY;
    },
    getScale:function () {
        cc.Assert(this._scaleX == this._scaleY, "cc.Node#scale. ScaleX != ScaleY. Don't know which one to return");
        return this._scaleX;
    },
    getScaleX:function () {
        return this._scaleX;
    },
    getScaleY:function () {
        return this._scaleY;
    },
    getPosition:function () {
        //return cc.PointMake(this._pos.x, this._pos.y);
        if (this._pos.x == 0) {
            //throw "sadasd"
        }
        return new cc.Point(this._pos.x, this._pos.y);
    },
    getPositionX:function () {
        return this._pos.x;
    },
    getPositionY:function () {
        return this._pos.y;
    },
    getRotation:function () {
        return this._rotation;
    },
    getTag:function () {
        return this._tag;
    },
    getAnchorPoint:function () {
        return this._AnchorPoint;
    },
    getContentSize:function () {
        return this._contentSize;
    },

    //Sets
    _setZOrder:function (z) {
        this.style.zIndex = z;
    },
    setColor:function (c) {
        this.style.color = "rgb(" + c.r + ", " + c.g + ", " + c.b + ")";
    },
    setSkewX:function (x) {
        this._skewX = -x;
        this.update();
    },
    setSkewY:function (y) {
        this._skewY = -y;
        this.update();
    },
    setRotation:function (r) {
        this._rotation = r;
        this.update();
    },
    setScale:function (s) {
        this._scaleX = s;
        this._scaleY = s;
        this.update();
    },
    setScaleX:function (x) {
        this._scaleX = x;
        this.update();
    },
    setScaleY:function (y) {
        this._scaleY = y;
        this.update();
    },
    setPosition:function (x, y) {
        if (arguments.length == 2) {
            this._pos.x = x;
            this._pos.y = y;
        }
        else {
            this._pos.x = x.x;
            this._pos.y = x.y;
        }
        this.update();
    },
    setTag:function (t) {
        this._tag = t;
    },
    setContentSize:function (size) {
        this._contentSize.width = size.width;
        this._contentSize.height = size.height;
        this.update();
    },
    setAnchorPoint:function (s) {
        this._AnchorPoint = s;
        if (this._m_bIsRelativeAnchorPoint) {
            this.style.left = "-" + (s.x * this.getContentSize().width) + "px";
            this.style.top = "-" + (s.y * this.getContentSize().height) + "px";
            this.style[cc.CSS3.origin] = (s.x * 100) + "% " + (s.y * 100) + "%";
        }
        else {
            this.style[cc.CSS3.origin] = (s.x * 100) + "% " + (s.y * this.getContentSize().height) + "px";
            this.style.top = 0;
            this.style.left = 0;
        }
        this.update();
    },

    //update Dom, its like draw, but you dont call it everyframe, only called when its changed
    update:function () {
        /*cc.CSS3.Transform(this.dom, cc.CSS3.Translate(this.getPositionX(), this.getPositionY(),
         cc.CSS3.Rotate(this.getRotation()),
         cc.CSS3.Scale(this.getScaleX(),this.getScaleY()),
         cc.CSS3.Skew(this.getSkewX(),-this.getSkewY())));*/
        cc.CSS3.Transform(this);
    },


    //parent and children
    getParent:function () {
        return this._parent;
    },
    getChildren:function () {
        return this._children;
    },
    getChildByTag:function (t) {
        cc.Assert(t != -1, "Invalid tag");
        if (this._children != null) {
            for (var i = 0; i < this._children.length; i++) {
                var pNode = this._children[i];
                if (pNode && pNode._tag == t)
                    return pNode;
            }
        }
    },
    addChild:function (child, z, tag) {
        switch (arguments.length) {
            case 1:
                //add child
                z = child.getZOrder();
                tag = child.getTag();
                break;
            case 2:
                //add child with z order no tag
                tag = child.getTag();
        }
        if (z != null)child._setZOrder(z);
        child.setParent(this);
        child.setTag(tag);
        this._children.push(child);
        if (this._m_bIsRunning) {
            child.onEnter();
            child.onEnterTransitionDidFinish();
        }
    },
    setParent:function (p, child) {
        child = child || this;
        this._parent = p;
        //check to see if dom
        if (p.isDomNode) {
            p.dom.appendChild(child.dom);
        }
        else {//a CC Node
            this.makeParentDivs(child);
        }
    },
    makeParentDivs:function (p) {
        if (p.dom == null)this.makeDiv(p);
        if (p.getParent() != null)//if the passed in obj have parent
        {
            if (p.getParent().dom == null) {
                this.makeDiv(p.getParent())
            }
            p.getParent().dom.appendChild(p.dom);
            this.makeParentDivs(p.getParent());
        }
        else {//the passed in obj dont have a parent
            cc.$("#Cocos2dGameContainer").appendChild(p.dom);
        }
    },
    makeDiv:function (p) {
        /*        p.dom = cc.$new("div");
         var size = p.getContentSize();
         var rot = p.getRotation();
         var pos = p.getPosition();
         var skewX = p.getSkewX();
         var skewY = p.getSkewY();
         var scaleX = p.getScaleX();
         var scaleY = p.getScaleY();
         var style = p.dom.style;
         style.width = size.width+"px";
         style.float = "left";
         style.position="absolute";
         if(p._m_bIsRelativeAnchorPoint){
         style.marginLeft = "-"+(size.width*p.getAnchorPoint().x*scaleX)+"px";
         style.top = (size.height*p.getAnchorPoint().y*scaleY)+"px";
         }
         else{
         style.marginLeft = 0;
         style.top = 0;
         }
         style[cc.CSS3.origin] = (p.getAnchorPoint().x*100)+"% "+(-p.getAnchorPoint().y*size.height)+"px";
         cc.CSS3.Transform(p.dom,cc.CSS3.Translate(pos.x*scaleX, pos.y*scaleY+size.height),
         cc.CSS3.Rotate(rot),
         cc.CSS3.Scale(scaleX,scaleY),
         cc.CSS3.Skew(skewX,-skewY));
         return p.dom;*/
        p.dom = cc.$new("div");
        var style = p.dom.style;
        style.float = "left";
        style.position = "absolute";
        p.updateDom();
        return p.dom;
    },


    //on enter and exit
    onEnter:function () {
        this._arrayMakeObjectsPerformSelector(this.getChildren(), "onEnter");
        this.resumeSchedulerAndActions();
        this._m_bIsRunning = true;
        this.show();
    },
    onExit:function () {
        this.pauseSchedulerAndActions();
        this._m_bIsRunning = false;
        this._arrayMakeObjectsPerformSelector(this.getChildren(), "onExit");
        this.hide();
        var that = cc.$("#" + this.id());
        var cur = this.dom;
        for (cur = this.dom; cur.parentNode; cur = cur.parentNode) {
            if (cur.parentNode.id == "Cocos2dGameContainer") {
                break;
            }
        }
        if (cur.parentNode) {
            cur.parentNode.removeChild(cur);
        }
        that = null;
    },
    onEnterTransitionDidFinish:function () {
        this._arrayMakeObjectsPerformSelector(this.getChildren(), "onEnter");
    },
    hide:function () {
        this.style.visibility = "hidden";
    },
    show:function () {
        this.style.visibility = "visible";
    },
    pauseSchedulerAndActions:function () {
        cc.Scheduler.sharedScheduler().pauseTarget(this);
        cc.ActionManager.sharedManager().pauseTarget(this);
    },
    resumeSchedulerAndActions:function () {
        cc.Scheduler.sharedScheduler().resumeTarget(this);
        cc.ActionManager.sharedManager().resumeTarget(this);
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
    id:function (x) {
        if (x != null) {
            this.dom.id = x;
        }
        else {
            return this.dom.id;
        }
    },


    //CCNODE stuff
    cleanup:function () {
        // actions
        this.stopAllActions();
        this.unscheduleAllSelectors();

        // timers
        this._arrayMakeObjectsPerformSelector(this.getChildren(), "cleanup");
    },
    stopAllActions:function () {
        cc.ActionManager.sharedManager().removeAllActionsFromTarget(this);
    },
    unscheduleAllSelectors:function () {
        cc.Scheduler.sharedScheduler().unscheduleAllSelectorsForTarget(this);
    }

});
cc.domNode.getTextSize = function (pText, pFontSize, fontfamily, pStyle) {
    var lDiv = cc.$new('lDiv');

    document.body.appendChild(lDiv);
    lDiv.style.fontSize = (isNaN(pFontSize)) ? pFontSize : ("" + pFontSize + "px");
    lDiv.style.position = "absolute";
    lDiv.style.left = -1000 + "px";
    lDiv.style.top = -1000 + "px";
    lDiv.style.fontFamily = fontfamily || "default";
    if (pStyle != null) {
        lDiv.style = pStyle;
    }

    lDiv.textContent = pText;

    var lResult = {
        width:lDiv.clientWidth,
        height:lDiv.clientHeight
    };

    document.body.removeChild(lDiv);
    lDiv = null;

    return lResult;
};

cc.Node.implement({
    updateDom:function () {
        if (this.dom != null) {
            var size = this.getContentSize();
            if (!size.height) {//TODO, this is because some scene/layer dont set their content size in constructor
                size.height = cc.canvas.height;
                size.width = cc.canvas.width;
            }
            var rot = this.getRotation();
            var pos = this.getPosition();
            var skewX = this.getSkewX();
            var skewY = this.getSkewY();
            var scaleX = this.getScaleX();
            var scaleY = this.getScaleY();
            var style = this.dom.style;
            style.visibility = "hidden";
            style.width = size.width + "px";
            //style.height = size.height+"px";
            //style.border = "1px red solid";
            //style.pointerEvents="none";
            style[cc.CSS3.origin] = (this.getAnchorPoint().x * 100) + "% " + (this.getAnchorPoint().y * size.height) + "px";
            //style[cc.CSS3.origin]=(this.getAnchorPoint().x*100)+"% "+(this.getAnchorPoint().y*100)+"%";
            if (this._m_bIsRelativeAnchorPoint) {
                style.left = "-" + (size.width * this.getAnchorPoint().x) + "px";
                style.top = (size.height * this.getAnchorPoint().y) + "px";
            }
            else {
                style.left = 0;
                style.top = 0;
            }
            cc.CSS3.Transform(this.dom, cc.CSS3.Translate(pos.x, pos.y + size.height),
                cc.CSS3.Rotate(rot),
                cc.CSS3.Scale(scaleX, scaleY),
                cc.CSS3.Skew(skewX, -skewY));
            style.visibility = "visible";
        }
    },
    setRotation:function (newRotation) {
        this._m_fRotation = newRotation;
        this._m_bIsTransformDirty = this._m_bIsInverseDirty = true;
        if (cc.NODE_TRANSFORM_USING_AFFINE_MATRIX) {
            this._m_bIsTransformGLDirty = true;
        }
        this.updateDom();
    },
    setScale:function (scale) {
        this._m_fScaleX = scale;
        this._m_fScaleY = scale;
        this._m_bIsTransformDirty = this._m_bIsInverseDirty = true;
        if (cc.NODE_TRANSFORM_USING_AFFINE_MATRIX) {
            this._m_bIsTransformGLDirty = true;
        }
        this.updateDom();
    },
    setScaleX:function (newScaleX) {
        this._m_fScaleX = newScaleX;
        this._m_bIsTransformDirty = this._m_bIsInverseDirty = true;
        if (cc.NODE_TRANSFORM_USING_AFFINE_MATRIX) {
            this._m_bIsTransformGLDirty = true;
        }
        this.updateDom();
    },
    setScaleY:function (newScaleY) {
        this._m_fScaleY = newScaleY;
        this._m_bIsTransformDirty = this._m_bIsInverseDirty = true;
        if (cc.NODE_TRANSFORM_USING_AFFINE_MATRIX) {
            this._m_bIsTransformGLDirty = true;
        }
        this.updateDom();
    },
    setPosition:function (newPosition) {
        this._m_tPosition = newPosition;
        if (cc.CONTENT_SCALE_FACTOR() == 1) {
            this._m_tPositionInPixels = this._m_tPosition;
        }
        else {
            this._m_tPositionInPixels = cc.ccpMult(newPosition, cc.CONTENT_SCALE_FACTOR());
        }
        this._m_bIsTransformDirty = this._m_bIsInverseDirty = true;
        if (cc.NODE_TRANSFORM_USING_AFFINE_MATRIX) {
            this._m_bIsTransformGLDirty = true;
        }
        this.updateDom();
    },
    setPositionInPixels:function (newPosition) {
        this._m_tPositionInPixels = newPosition;
        if (cc.CONTENT_SCALE_FACTOR() == 1) {
            this._m_tPosition = this._m_tPositionInPixels;
        } else {
            this._m_tPosition = cc.ccpMult(newPosition, 1 / cc.CONTENT_SCALE_FACTOR());
        }
        this._m_bIsTransformDirty = this._m_bIsInverseDirty = true;
        if (cc.NODE_TRANSFORM_USING_AFFINE_MATRIX) {
            this._m_bIsTransformGLDirty = true;
        }// CC_NODE_TRANSFORM_USING_AFFINE_MATRIX
        this.updateDom();
    },
    setSkewX:function (newSkewX) {
        this._m_fSkewX = newSkewX;
        this._m_bIsTransformDirty = this._m_bIsInverseDirty = true;
        if (cc.NODE_TRANSFORM_USING_AFFINE_MATRIX) {
            this._m_bIsTransformGLDirty = true;
        }
        this.updateDom();
    },
    setSkewY:function (newSkewY) {
        this._m_fSkewY = newSkewY;
        this._m_bIsTransformDirty = this._m_bIsInverseDirty = true;
        if (cc.NODE_TRANSFORM_USING_AFFINE_MATRIX) {
            this._m_bIsTransformGLDirty = true;
        }
        this.updateDom();
    }
});
//TODO, change -1 to cc.kCCNodeTagInvalid