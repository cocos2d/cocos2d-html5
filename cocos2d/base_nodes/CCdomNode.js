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
cc.Browser = cc.Class.extend({
    ctor:function () {
        this.ua = navigator.userAgent.toLowerCase();
        this.platform = navigator.platform.toLowerCase();
        this.UA = this.ua.match(/(opera|ie|firefox|chrome|version)[\s\/:]([\w\d\.]+)?.*?(safari|version[\s\/:]([\w\d\.]+)|$)/) || [null, 'unknown', 0];
        this.mode = this.UA[1] == 'ie' && document.documentMode;
    }
});
cc.Browser.init = function () {
    if (!cc.Browser.ins) {
        cc.Browser.ins = new cc.Browser();
    }
    return cc.Browser.ins;
};
//type, version, platform are actual variables not functions
cc.Browser.type = function () {
    var that = cc.Browser.init();
    return (that.UA[1] == 'version') ? that.UA[3] : that.UA[1];
}();
cc.Browser.version = function () {
    var that = cc.Browser.init();
    return parseFloat(that.mode || (that.UA[1] == 'opera' && that.UA[4]) ? that.UA[4] : that.UA[2]);
}();
cc.Browser.platform = function () {
    var that = cc.Browser.init();
    return that.ua.match(/ip(?:ad|od|hone)/) ? 'ios' : (that.ua.match(/(?:webos|android)/) || that.platform.match(/mac|win|linux/) || ['other'])[0]
}();
cc.Browser.prefix = function () {
    switch (cc.Browser.type) {
        case "firefox":
            return "Moz";
        case "chrome":
        case "safari":
            return "webkit";
        case "opera":
            return "-o-";
        case "ie":
            return "-ms-";
        default:
            return "";
    }
}();
cc.domNode = cc.Node.extend({
    isDomNode:true,
    _m_nZOrder:0, //z-index;
    _m_fRotation:0.0,
    _m_fScaleX:1.0,
    _m_fScaleY:1.0,
    _m_tPosition:{x:0, y:0}, //canvas position
    _m_tPositionInPixels:{x:0, y:0},
    _m_fSkewX:0.0,
    _m_fSkewY:0.0,
    _m_pChildren:null,
    _m_tAnchorPoint:cc.PointZero(),
    _m_pParent:null,
    _domElement:null,
    _m_tContentSize:cc.PointZero(),

    _m_bIsRelativeAnchorPoint:true,
    _previousParent:null,
    getElement:function () {
        return this._domElement
    },
    transform:function () {
        //if position is relative to parent
        if (this._m_bIsRelativeAnchorPoint) {
            //get parent position
            if (this.getParent()) {
                //parent anchor point
                var pap = this.getParent().getAnchorPointInPixels();
                //parent position
                var parentPos = this.getParent().convertToWorldSpace(cc.PointZero());
                //if its not same position as last time
                if (!cc.ccpSameAs(parentPos, this._previousParent.pos)) {
                    this.setRotation(this.getParent().getRotation());
                    this.setScale(this.getParent().getScale());
                    this._previousParent.pos.x = parentPos.x;
                    this._previousParent.pos.y = parentPos.y;
                    //change the position according to parent
                    this.setPosition(this._m_tPosition.x, -this._m_tPosition.y);
                    //cc.renderContext.translate(this.getPositionX() - pAp.x, -(this.getPositionY() - pAp.y ));
                    //console.log(this.getParent());
                }
            }
            //
            //cc.renderContext.transform(this.getScaleX(), -Math.tan(cc.DEGREES_TO_RADIANS(this.getSkewY())), -Math.tan(cc.DEGREES_TO_RADIANS(this.getSkewX())),this.getScaleY(), 0, 0);

            //cc.renderContext.rotate(cc.DEGREES_TO_RADIANS(this.getRotation()));
        }
        //console.log(this.c++);
    },
    _transform:{
        skew:function (x, y) {
            return "skew(" + x + "deg, " + y + "deg)";
        },
        skewX:function (x) {
            return "skewX(" + x + "deg)";
        },
        skewY:function (Y) {
            return "skewY(" + Y + "deg)";
        },
        rotate:function (x) {
            return "rotateZ(" + x + "deg)";
        },
        translate:function (x, y) {
            return "translate3d(" + x + "px, " + y + "px,0px)";
        },
        translateX:function (x) {
            return "translateX(" + x + "px)";
        },
        translateY:function (y) {
            return "translateY(" + y + "px)";
        },
        scale:function (x, y) {
            return "scale(" + x + ", " + y + ")";
        },
        scaleX:function (x) {
            return "scaleX(" + x + ")";
        },
        scaleY:function (Y) {
            return "scaleY(" + Y + ")";
        }
    },
    ctor:function () {
        this._m_pChildren = [];
        this._domElement = cc.$new('div');
        this.style = this._domElement.style;
        this.style[cc.Browser.prefix + "transform-origin"] = "50% 50%";
        //this.style["float"] = "left";
        this.style[cc.Browser.prefix + "user-select"] = "none";
        this._previousParent = {};
        this._previousParent.pos = cc.PointZero();
    },
    id:function (x) {
        if (x != null) {
            this._domElement.id = x;
        }
        else {
            return this._domElement.id;
        }
    },
    getZOrder:function () {
        return this.style.zIndex;
    },
    getSkewX:function () {
        return this._m_fSkewX;
    },
    setSkewX:function (newSkewX) {
        this._m_fSkewX = newSkewX;
        //this._domElement.style.transform
    },
    //set local position
    setPosition:function (x, y) {
        //if only 1 param, then x is an object
        if (arguments.length == 1) {
            this._m_tPosition = {x:x.x, y:-x.y};
        }
        else {
            this._m_tPosition = {x:x, y:-y};
        }
        //this.transform.translate;
        var parent, parentPos;
        if (parent = this.getParent()) {
            if (parent.isDomNode) {
                //TODO need to implement convertToWorldSpace for domnode
                parentPos = {x:0, y:0};
            }
            else {
                parentPos = parent.convertToWorldSpace(cc.PointZero());
            }
        }
        else {
            parentPos = {x:0, y:0};
        }
        this.style[cc.Browser.prefix + "Transform"] = this._transform.translate(this._m_tPosition.x + parentPos.x, this._m_tPosition.y - parentPos.y)
                                                    + " " + this._transform.rotate(this._m_fRotation)
                                                    + " " + this._transform.scale(this._m_fScaleX, this._m_fScaleY);
    },
    setColor:function(c){
        this.style.color = "rgb("+c.r+", "+c.g+", "+c.b+")";
    },
    getPosition:function () {
        return cc.ccp(this._m_tPosition.x, -this._m_tPosition.y);
    },
    addChild:function (child, z, t) {
        //check if child is dom, and handle accordingly
        if(child.isDomNode){
            child._m_nZOrder = child.style.zIndex = (z == null)? 0 : z;
            var tag = (t == null)? cc.kCCNodeTagInvalid : t;
            child.setTag(tag);
            child.setParent(this);
            this._m_pChildren.push(child);
        }
        else{
            this._super(child, z, t);
        }
    },
    _setZOrder:function (z) {
        this.style.zIndex = z+100;
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
    resumeSchedulerAndActions:function () {
        cc.Scheduler.sharedScheduler().resumeTarget(this);
        cc.ActionManager.sharedManager().resumeTarget(this);
    },
    onEnterTransitionDidFinish:function () {
        this._arrayMakeObjectsPerformSelector(this._m_pChildren, "onEnter");
    },
    visit:function () {
        if (this.style.visibility == "hidden") {
            return;
        }
        this.transform();
    },
    onEnter:function () {
        this._arrayMakeObjectsPerformSelector(this._m_pChildren, "onEnter");
        this.resumeSchedulerAndActions();
        this._m_bIsRunning = true;
        this.show();
    },
    onExit:function () {
        this.pauseSchedulerAndActions();
        this._m_bIsRunning = false;
        this._arrayMakeObjectsPerformSelector(this._m_pChildren, "onExit");
        this.hide();
    },
    //hide all children!
    hide:function (){
        this.style.visibility = "hidden";
    },
    show:function () {
        this.style.visibility = "visible";
    },
    pauseSchedulerAndActions:function () {
        cc.Scheduler.sharedScheduler().pauseTarget(this);
        cc.ActionManager.sharedManager().pauseTarget(this);
    },
    cleanup:function () {
        // actions
        this.stopAllActions();
        this.unscheduleAllSelectors();

        // timers
        this._arrayMakeObjectsPerformSelector(this._m_pChildren, "cleanup");
    },
    stopAllActions:function () {
        cc.ActionManager.sharedManager().removeAllActionsFromTarget(this);
    },
    unscheduleAllSelectors:function () {
        cc.Scheduler.sharedScheduler().unscheduleAllSelectorsForTarget(this);
    },
    setContentSize:function (size) {
        if (!cc.Size.CCSizeEqualToSize(size, this._m_tContentSize)) {
            this._m_tContentSize = size;

            if (cc.CONTENT_SCALE_FACTOR() == 1) {
                this._m_tContentSizeInPixels = this._m_tContentSize;
            }
            else {
                this._m_tContentSizeInPixels = cc.SizeMake(size.width * cc.CONTENT_SCALE_FACTOR(), size.height * cc.CONTENT_SCALE_FACTOR());
            }

            //this._m_tAnchorPointInPixels = cc.ccp(this._m_tContentSizeInPixels.width * this._m_tAnchorPoint.x, this._m_tContentSizeInPixels.height * this._m_tAnchorPoint.y);
            //this._m_bIsTransformDirty = this._m_bIsInverseDirty = true;
            if (cc.NODE_TRANSFORM_USING_AFFINE_MATRIX) {
                this._m_bIsTransformGLDirty = true;
            }
        }
    }
});
cc.domNode.getTextSize = function (pText, pFontSize, fontfamily, pStyle) {
    var lDiv = cc.$new('lDiv');

    document.body.appendChild(lDiv);
    lDiv.style.fontSize = (isNaN(pFontSize))?pFontSize:("" + pFontSize + "px");
    lDiv.style.position = "absolute";
    lDiv.style.left = -1000;
    lDiv.style.top = -1000;
    lDiv.style.fontFamily = fontfamily || "default";
    if (pStyle != null) {
        lDiv.style = pStyle;
    }

    lDiv.innerHTML = pText;

    var lResult = {
        width: lDiv.clientWidth,
        height: lDiv.clientHeight
    };

    document.body.removeChild(lDiv);
    lDiv = null;

    return lResult;
};