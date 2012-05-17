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
cc._fontSize = 32;
cc._fontName = '"Comic Sans MS", "cursive"';
cc.MenuItem = cc.domNode.extend({
    ctor:function(){
        this._super();
        this.setAnchorPoint(cc.ccp(0.5,0.5));//this wont work as the div size is unknown at this point
        this.style[cc.CSS3.origin] = (this._AnchorPoint*100)+"% "+(this._AnchorPoint*100)+"%";
    }
});


cc.MenuItemImage = cc.MenuItem.extend({
    init:function (file) {
        //create div containing an image - div created in ctor
        //craete image
        this._image = new Image();
        this._image.src = file;
        this._image.parent = this;
        //add to the div
        this.dom.appendChild(this._image);
        //when image is loaded, set the position and translation
        this._image.parent.setAnchorPoint(cc.ccp(0.5, 0.5));
        var onloadcallback = function(){
            //this.parent.dom.style.width = this.width+"px";
            //this.parent.dom.style.height = this.height+"px";
            this.parent.setContentSize(cc.SizeMake(this.width, this.height));
            //cc.CSS3.Transform(this.parent);
            this.removeEventListener("load", onloadcallback);
        };
        this._image.addEventListener("load",onloadcallback);
    }
});
cc.MenuItemImage.itemFromNormalImage = function (normal, selected, target, callback) {
    if(normal != null)normal = normal.src || normal;
    if(selected != null)selected = selected.src || selected;
    //create div containing an image - should be done in menuitem
    var that = new this();
    that.init(normal);
    //attach script to swapout image on hover
    if(selected != null){
        var tmp = new Image();
        tmp.src = selected;
        that._image.addEventListener("mouseover", function () {
            this.src = selected;
        });
        that._image.addEventListener("mouseout", function () {
            this.src = normal;
        });
    }
    that._image.addEventListener("mousedown", function (e) {
        var evt = e || window.event;
        evt.preventDefault();
        return false;
    });
    if(callback!= null){
        that._image.addEventListener("click", function(){
            callback.call(target,arguments);
        });
/*        that._image.addEventListener("touchstart", function(){
            if(selected!=null)this.src = selected;
            callback.call(target,arguments);
        });
        if(selected!=null){
            that._image.addEventListener("touchend", function(){
                this.src = normal;
            });
        }*/
    }
    //attach callback to onclick
    that.style.cursor = (callback) ? "pointer" : "default";
    return that;

};
cc.MenuItemSprite = cc.MenuItemImage.extend({

});
cc.MenuItemSprite.itemFromNormalSprite = function(normal, selected, three, four, five){
    var that=  new this();
    if(five){
        //threee is disabled, four is target, five is selector
        var target = four;
        var selector = five;
    }
    else if(four){
        //there is no disabled image
        var target = three;
        var selector = four;
    }
    else{
        //there is 3 image, but no callback func
        var target = null;
        var selector = null;
    }
    if(normal != null)normal = normal.src || normal;
    if(selected != null)selected = selected.src || selected;
    that.init(normal);
    var tmp = new Image();
    tmp.src = selected;
    that._image.addEventListener("mouseover", function () {
        this.src = selected;
    });
    that._image.addEventListener("mouseout", function () {
        this.src = normal;
    });
    that._image.addEventListener("mousedown", function (e) {
        var evt = e || window.event;
        evt.preventDefault();
        return false;
    });
    that._image.addEventListener("click", function(event){_domSpriteCallback(event, target, selector)});
    that._image.addEventListener("touchstart", function(event){
        this.src = selected;
        _domSpriteCallback(event, target, selector);
    });
    that._image.addEventListener("touchend", function(){
        this.src = normal;
    });
    //attach callback to onclick
    that.style.cursor = (callback) ? "pointer" : "default";
    return that;
    function _domSpriteCallback(event, target, selector){
        if (target && (typeof(selector) == "string")) {
            target[selector](event);
        } else if (target && (typeof(selector) == "function")) {
            selector.call(target,event);
        }
    }
};
cc.MenuItemLabel = cc.MenuItem.extend({
    _text:'',
    _fontSize:"14px",
    _fontName:'',
    init:function (label) {
        this._text = label.getString();
        this._fontName = label._m_pFontName;
        this._fontSize = label._m_fFontSize + "px";
        //create a div containing the text
        this.dom.textContent = this._text;
        //this._domElement.contentText = this._domElement.innerText;
        this.style.fontFamily = this._fontName;
        this.style.fontSize = this._fontSize;
        this.style.color = "#FFF";
/*        this.style.position = "absolute";
        this.style.bottom = "0px";
        this.style.margin = "auto";
        this.style.right = "50%";
        this.style.left = "-50%";
        this.style.top = "-50%";
        this.style.bottom = "50%";*/
        this.style.textAlign = "center";
        //console.log(cc.domNode.getTextSize(this._text, this._fontSize, this._fontName));
        //console.log(this.dom.clientWidth);
        var tmp = cc.domNode.getTextSize(this._text,this._fontSize, this._fontName);
        this.setContentSize(cc.SizeMake(tmp.width, tmp.height));
        var size = this.getContentSize();
        this.style.left = "-"+(size.width*this.getAnchorPoint().x)+"px";
        this.style.top = "-"+(size.height*this.getAnchorPoint().y)+"px";
        this.setPosition(label.getPositionX(), label.getPositionY());
        cc.CSS3.Transform(this);
    }
});
cc.MenuItemLabel.itemWithLabel = function (label, two, three, four) {
    var that = new this();
    that.init(label);
    that.dom.addEventListener("mousedown", function (e) {
        var evt = e || window.event;
        evt.preventDefault();
        return false;
    });
    if (arguments.length == 4) {
        that.dom.addEventListener("click", function(event){_domLabelCallback(event, three, four)});
        that.dom.addEventListener("touchstart", function(event){_domLabelCallback(event, three, four)});
        that.style.cursor = "pointer";
    }
    else if (arguments.length <= 2) {
        cc.Assert(0,"Not enough parameters.");
        //that.dom.addEventListener("click", two);//the second argument is now the selector
        //that.dom.addEventListener("touchstart", two);
        //that.style.cursor = "pointer";
    }
    else if (arguments.length == 3) {
        that.dom.addEventListener("click", function(event){_domLabelCallback(event, two, three)});
        that.dom.addEventListener("touchstart", function(event){_domLabelCallback(event, two, three)});
        that.style.cursor = "pointer";
    }
    return that;
    function _domLabelCallback(event, target, selector){
        if (target && (typeof(selector) == "string")) {
            target[selector](event);
        } else if (target && (typeof(selector) == "function")) {
            selector.call(target,event);
        }
    }
};

cc.MenuItemFont = cc.MenuItem.extend({
    ctor:function(){
        this._super();
    },
    initFromString: function(value, target, selector){
        this._text = value;
        //create a div containing the text
        this.dom.textContent = this._text;
        this.style.fontFamily = cc._fontName;
        this.style.fontSize = cc._fontSize+"px";
        this.style.color = "#FFF";
        this.style.textAlign = "center";
        var tmp = cc.domNode.getTextSize(this._text,cc._fontSize, cc._fontName);
        this.setContentSize(cc.SizeMake(tmp.width, tmp.height));
        var size = this.getContentSize();
        this.style.left = "-"+(size.width*this.getAnchorPoint().x)+"px";
        this.style.top = "-"+(size.height*this.getAnchorPoint().y)+"px";
        this.style.width = this.offsetWidth+"px";
        this.style.height = this.offsetHeight+"px";
        cc.CSS3.Transform(this);

        if(selector != null){
            this.dom.addEventListener("click",function(event){_domFontCallback(event)});
            this.dom.addEventListener("touchstart",function(event){_domFontCallback(event)});
            this.style.cursor = "pointer";
        }
        this.update();

        function _domFontCallback(event){
            if (target && (typeof(selector) == "string")) {
                target[selector](event);
            } else if (target && (typeof(selector) == "function")) {
                selector.call(target,event);
            }
        }
    },
    setFontSizeObj:function(s){
        this.style.fontSize = s;
    },
    fontSizeObj:function(){
        return this.style.fontSize;
    },
    setFontName:function(s){
        this.style.fontFamily = s;
    },
    fontNameObj:function(){
        return this.style.fontFamily;
    },
    _recreateLabel:function(){},
    _m_uFontSize:0,
    _m_strFontName:''
});
cc.MenuItemFont.setFontSize = function(s){
    cc._fontSize = s;
};
cc.MenuItemFont.fontSize = function(){
    return cc._fontSize;
};
cc.MenuItemFont.setFontName = function (name) {
    if (cc._fontNameRelease) {
        cc._fontName = '';
    }
    cc._fontName = name;
    cc._fontNameRelease = true;
};
cc.MenuItemFont.fontName = function () {
    return cc._fontName
};
cc.MenuItemFont.itemFromString = function (value, target, selector) {
    var pRet = new cc.MenuItemFont();
    pRet.initFromString(value, target, selector);
    return pRet;
};