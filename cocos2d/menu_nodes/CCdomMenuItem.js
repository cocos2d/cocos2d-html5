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

});


cc.MenuItemImage = cc.MenuItem.extend({
    _image:null,
    init:function (file) {
        //create div containing an image - div created in ctor
        //craete image
        this._image = new Image();
        this._image.src = file;
        this._image.id = "test";
        this._image.style.margin = "auto";
        this._image.style.right = "50%";
        this._image.style.left = "-50%";
        this._image.style.top = "-50%";
        this._image.style.bottom = "50%";
        this._image.style.position = "absolute";
        //add to the div
        this._domElement.appendChild(this._image);
    }
});
cc.MenuItemImage.itemFromNormalImage = function (normal, selected, target, callback) {
    if (normal.src) {
        normal = normal.src;
    }
    if (selected.src) {
        selected = selected.src;
    }
    //create div containing an image - should be done in menuitem
    var that = new this();
    that.init(normal);
    //attach script to swapout image on hover
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
    that._image.addEventListener("click", callback);
    that._image.addEventListener("touchstart", function(){
        this.src = selected;
        callback();
    });
    that._image.addEventListener("touchend", function(){
        this.src = normal;
    });
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
        var callback = five;
    }
    else if(four){
        //there is no disabled image
        var callback = four;
    }
    else{
        //there is 3 image, but no callback func
        var callback = null;
    }
    if (normal.src) {
        normal = normal.src;
    }
    if (selected.src) {
        selected = selected.src;
    }
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
    that._image.addEventListener("click", callback);
    that._image.addEventListener("touchstart", function(){
        this.src = selected;
        callback();
    });
    that._image.addEventListener("touchend", function(){
        this.src = normal;
    });
    //attach callback to onclick
    that.style.cursor = (callback) ? "pointer" : "default";
    return that;
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
        this._domElement.textContent = this._text;
        //this._domElement.contentText = this._domElement.innerText;
        this.style.fontFamily = this._fontName;
        this.style.fontSize = this._fontSize;
        this.style.color = "#FFF";
        this.style.position = "absolute";
        this.style.bottom = "0px";
        this.style.margin = "auto";
        this.style.right = "50%";
        this.style.left = "-50%";
        this.style.top = "-50%";
        this.style.bottom = "50%";
        this.style.textAlign = "center";
        var tmp = cc.domNode.getTextSize(this._text,this._fontSize, this._fontName);
        this.style.width = tmp.width+"px";
        this.style.height = tmp.height+"px";
    }
});
cc.MenuItemLabel.itemWithLabel = function (label, dimension, target, selector) {
    var that = new this();
    that.init(label);
    that._domElement.addEventListener("mousedown", function (e) {
        var evt = e || window.event;
        evt.preventDefault();
        return false;
    });
    if (arguments.length == 4) {
        that._domElement.addEventListener("click", selector);
        that._domElement.addEventListener("touchstart", selector);
        that.style.cursor = "pointer";
    }
    else if (arguments.length == 2) {
        that._domElement.addEventListener("click", dimension);//the second argument is now the selector
        that._domElement.addEventListener("touchstart", dimension);
        that.style.cursor = "pointer";
    }
    else if (arguments.length == 3) {
        that._domElement.addEventListener("click", target);
        that._domElement.addEventListener("touchstart", target);
        that.style.cursor = "pointer";
    }
    return that;
};

cc.MenuItemFont = cc.MenuItem.extend({
    initFromString: function(value, target, selector){
        this._text = value;
        //create a div containing the text
        this._domElement.textContent = this._text;
        this.style.fontFamily = cc._fontName;
        this.style.fontSize = cc._fontSize+"px";
        this.style.color = "#FFF";
        this.style.position = "absolute";
        this.style.bottom = "0px";
        this.style.margin = "auto";
        this.style.right = "50%";
        this.style.left = "-50%";
        this.style.top = "-50%";
        this.style.bottom = "50%";
        this.style.textAlign = "center";
        if(selector != null){
            this._domElement.addEventListener("click",selector);
            this._domElement.addEventListener("touchstart",selector);
            this.style.cursor = "pointer";
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