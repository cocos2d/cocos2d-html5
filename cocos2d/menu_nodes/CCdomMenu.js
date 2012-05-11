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
cc.kCCMenuStateWaiting = 0;
cc.kCCMenuStateTrackingTouch = 1;
cc.kCCMenuTouchPriority = -128;
cc.kDefaultPadding = 5;
cc.Menu = cc.domNode.extend({
    _container:null,//the container div that encloses all the menus
    init:function () {
        if (!cc.$("#Cocos2dGameContainer")) {
            this.setupHTML();
        }
        else {
            this._container = cc.$("#Cocos2dGameContainer");
        }
        this._m_bIsRelativeAnchorPoint = false;
    },
    setupHTML:function () {
        //set up html;
        //get the canvas
        var canvas = cc.canvas;
        canvas.style.zIndex = 0;


        this._container = cc.$new("div");
        this._container.id = "Cocos2dGameContainer";
        this._container.style.position = "absolute";
        this._container.style.overflow = "visible";//TODO make it hidden when finished debugging
        //this._container.style.backgroundColor="RGBA(100,100,200,0.5)";
        this._container.style.top = canvas.offsetTop+parseInt(canvas.style.borderTopWidth)+"px";
        this._container.style.left = canvas.offsetLeft+parseInt(canvas.style.borderLeftWidth)+"px";
        this._container.style.height = canvas.clientHeight+"px";
        this._container.style.width = canvas.clientWidth+"px";
        cc.TouchDispatcher.registerHtmlElementEvent(this.dom);
        cc.gameDiv.insertBefore(this._container, canvas);
        this._container.appendChild(canvas);
    },
    initWithItems:function (args) {
        this.init();
        this.dom.id = "Cocos2dMenuLayer" + Date.now();
        this.dom.className = "Cocos2dMenuLayer";
        this.style.zIndex = 100;
        this.style.width = cc.Director.sharedDirector().getWinSize().width + "px";
        this.style.height = 0;
        this.style.position = "absolute";
        this._container.appendChild(this.dom);
        this._m_bIsRelativeAnchorPoint= false;
        this.setAnchorPoint(cc.ccp(0.5, 0.5));
        this.setContentSize(cc.Director.sharedDirector().getWinSize());
        this.style.cursor = "crosshair";

        for (var i = 0; i < args.length; i++) {
            if (args[i]) {
                this.dom.appendChild(args[i].dom);
                this.addChild(args[i]);
            }
        }
    },
    alignItemsVertically:function () {
        this.alignItemsVerticallyWithPadding(cc.kDefaultPadding);
    },
    alignItemsVerticallyWithPadding:function (padding) {
        var s = cc.Director.sharedDirector().getWinSize();//get window size
        var height = -padding;
        if (this.getChildren().length) {
            for (var i = 0; i < this.getChildren.length; i++) {
                var childheight = cc.domNode.getTextSize(this.getChildren()[i].dom.textContent,
                    this.getChildren()[i].style.fontSize,
                    this.getChildren()[i].style.fontFamily).height;//loop through children, and get their individual height
                height += childheight + padding;//TODO * scale
            }
        }

        var y = height / 2.0;
        if (this.getChildren().length > 0) {
            for (i = 0; i < this._m_pChildren.length; i++) {
                var childheight = cc.domNode.getTextSize(this._m_pChildren[i].dom.textContent,
                    this.getChildren()[i].style.fontSize,
                    this.getChildren()[i].style.fontFamily).height;
                this.getChildren()[i].setPosition(cc.ccp(s.width / 2, s.height / 2 + y - childheight/* * this._m_pChildren[i].getScaleY()*/ / 2));
                y -= childheight /** this._m_pChildren[i].getScaleY()*/ + padding;
            }
        }
    },
    alignItemsHorizontally:function () {
        this.alignItemsHorizontallyWithPadding(cc.kDefaultPadding);
    },
    alignItemsHorizontallyWithPadding:function (padding) {
        var s = cc.Director.sharedDirector().getWinSize();
        var width = -padding;
        if (this.getChildren().length > 0) {
            for (var i = 0; i < this.getChildren().length; i++) {
                var childwidth = cc.domNode.getTextSize(this.getChildren()[i].dom.textContent,
                    this.getChildren()[i].style.fontSize,
                    this.getChildren()[i].style.fontFamily).width;
                width += childwidth + padding;//TODO * scale
            }
        }
        var y = width / 2.0;
        if (this.getChildren().length > 0) {
            for (i = 0; i < this.getChildren().length; i++) {
                var childwidth = cc.domNode.getTextSize(this.getChildren()[i].dom.textContent,
                    this.getChildren()[i].style.fontSize,
                    this.getChildren()[i].style.fontFamily).width;
                this.getChildren()[i].setPosition(cc.ccp( -y + childwidth,0/* * this._m_pChildren[i].getScaleY()*/));
                //console.log(cc.ccp(s.width / 2 + y - childwidth, -s.height / 2/* * this._m_pChildren[i].getScaleY()*/));
                y -= childwidth /** this._m_pChildren[i].getScaleY()*/ + padding;
            }
        }
    }
});
cc.Menu.menuWithItems = function () {
    pret = new cc.Menu();
    pret.initWithItems(arguments);
    return pret;
};
cc.Menu.menuWithItem = function () {
    pret = new cc.Menu();
    pret.initWithItems(arguments);
    return pret;
};