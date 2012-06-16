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
 FITNESS FOR A PARTICULAR PURPOSE AND NON INFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 ****************************************************************************/


cc._fontSize = 32;
cc._fontName = '"Comic Sans MS", "cursive"';

/**
 * DomMenuitem base class is the same as domnode
 * @class
 * @extends cc.domNode
 */
cc.MenuItem = cc.domNode;

/**
 * Menuitem image
 * @class
 * @extends cc.MenuItem
 */
cc.MenuItemImage = cc.MenuItem.extend(/** @lends cc.MenuItemImage# */{

    /**
     * @param {String} file
     */
    init:function (file) {
        var texture = cc.TextureCache.sharedTextureCache().textureForKey(file);
        if (!texture) {
            texture = cc.TextureCache.sharedTextureCache().addImage(file);
        }
        //create div containing an image - div created in ctor
        if (texture.width) {//image already loaded
            this._image = texture.cloneNode(true);
            this.setContentSize(cc.SizeMake(texture.width, texture.height));
            this.dom.appendChild(this._image);
        }
        else {
            this._image = texture.cloneNode(true);
            this._image.parent = this;
            //when image is loaded, set the position and translation
            var onloadcallback = function () {
                //this.parent.dom.style.width = this.width+"px";
                //this.parent.dom.style.height = this.height+"px";
                this.parent.setContentSize(cc.SizeMake(this.width, this.height));
                //cc.CSS3.Transform(this.parent);
                this.removeEventListener("load", onloadcallback);
                //add to the div
                this.parent.dom.appendChild(this);
            };
            this._image.addEventListener("load", onloadcallback);
        }
    }
});

/**
 * creates a new DOM menu item image
 * @param {String} normal file name for normal state
 * @param {String|Null} selected image for selected state
 * @param {cc.Node|Null} target cc.Node target to run callback when clicked
 * @param {String|function|Null} callback callback function, either name in string, or pass the whole function
 * @return {cc.MenuItemImage}
 * @example
 * // Example
 * var item = cc.MenuItemImage.create('normal.png', 'selected.png')
 * //create a dom menu item with normal state and selected, but nothing will happen when you click on it
 *
 * var item = cc.MenuItemImage.create('normal.png', 'selected.png', gameScene, 'run')
 * //create a dom menu item with normal and selected state, when clicked it will run the run function from gameScene object
 *
 * var item = cc.MenuItemImage.create('normal.png', 'selected.png', gameScene, gameScene.run)
 * //same as above, but pass in the actual function
 */
cc.MenuItemImage.create = function (normal, selected, target, callback) {
    var that = new this();
    that.init(normal);
    if (selected instanceof HTMLImageElement) {
        selected = selected.cloneNode(true);
    }
    //create div containing an image - should be done in menuitem
    //attach script to swapout image on hover
    if (selected != null) {
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
    if (callback != null) {
        that._image.addEventListener("click", function () {
            _domLabelCallback(that, target, callback);
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
    that.dom.style.cursor = (callback) ? "pointer" : "default";
    function _domLabelCallback(event, target, selector) {
        if (target && (typeof(selector) == "string")) {
            target[selector](event);
        } else if (target && (typeof(selector) == "function")) {
            selector.call(target, event);
        }
    }

    return that;

};

/**
 * dom menu item sprite
 * @class
 * @extends cc.MenuItemImage
 */
cc.MenuItemSprite = cc.MenuItemImage.extend(/** @lends cc.MenuItemSprite# */{

});

/**
 * create a dom menu item from sprite
 * @param {Image} normal normal state image
 * @param {Image|Null} selected selected state image
 * @param {Image|cc.Node|Null} three disabled state image OR target node
 * @param {String|function|cc.Node|Null} four callback function name in string or actual function, OR target Node
 * @param {String|function|Null} five callback function name in string or actual function
 * @return {cc.MenuItemSprite}
 * @example
 * // Example
 * var item = cc.MenuItemSprite.create(normalImage)//create a dom menu item from a sprite with no functionality
 *
 * var item = cc.MenuItemSprite.create(normalImage, selectedImage)//create a dom menu Item, nothing will happen when clicked
 *
 * var item = cc.MenuItemSprite.create(normalImage, SelectedImage, disabledImage)//same above, but with disabled state image
 *
 * var item = cc.MenuItemSprite.create(normalImage, SelectedImage, targetNode, 'callback')//create a dom menu item, when clicked runs targetNode.callback()
 *
 * var item = cc.MenuItemSprite.create(normalImage, SelectedImage, disabledImage, targetNode, targetNode.callback)
 * //same as above, but with disabled image, and passing in callback function
 */
cc.MenuItemSprite.create = function (normal, selected, three, four, five) {
    var that = new this();
    if (five) {
        //threee is disabled, four is target, five is selector
        var target = four;
        var selector = five;
    }
    else if (four) {
        //there is no disabled image
        var target = three;
        var selector = four;
    }
    else {
        //there is 3 image, but no callback func
        var target = null;
        var selector = null;
    }
    if (normal != null)normal = normal.src || normal;
    if (selected != null)selected = selected.src || selected;
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
    that._image.addEventListener("click", function (event) {
        _domSpriteCallback(that, target, selector)
    });
    that._image.addEventListener("touchstart", function (event) {
        this.src = selected;
        _domSpriteCallback(event, target, selector);
    });
    that._image.addEventListener("touchend", function () {
        this.src = normal;
    });
    //attach callback to onclick
    that.dom.style.cursor = (selector) ? "pointer" : "default";
    return that;
    function _domSpriteCallback(event, target, selector) {
        if (target && (typeof(selector) == "string")) {
            target[selector](event);
        } else if (target && (typeof(selector) == "function")) {
            selector.call(target, event);
        }
    }
};

/**
 * dom Menu item label
 * @class
 * @extends cc.MenuItem
 */
cc.MenuItemLabel = cc.MenuItem.extend(/** @lends cc.MenuItemLabel# */{
    _text:'',
    _fontSize:"14px",
    _fontName:'',

    /**
     * @param {cc.LabelTTF} label
     */
    init:function (label) {
        this._text = label.getString();
        this._fontName = label._fontName;
        this._fontSize = label._fontSize + "px";
        //create a div containing the text
        this.dom.textContent = this._text;
        //this._domElement.contentText = this._domElement.innerText;
        this.dom.style.fontFamily = this._fontName;
        this.dom.style.fontSize = this._fontSize;
        var color = label.getColor();
        this.dom.style.color = "rgb(" + color.r + ", " + color.g + ", " + color.b + ")";
        this.dom.style.textAlign = "center";
        //console.log(cc.domNode.getTextSize(this._text, this._fontSize, this._fontName));
        //console.log(this.dom.clientWidth);
        var tmp = cc.domNode.getTextSize(this._text, this._fontSize, this._fontName);
        this.setContentSize(cc.SizeMake(tmp.width, tmp.height));
        this.setPosition(label.getPositionX(), label.getPositionY());
        this._updateTransform();
    },

    /**
     * @return {cc.Color3B}
     */
    getDisabledColor:function () {
        return this._disabledColor;
    },

    /**
     * @param {cc.Color3B} color
     */
    setDisabledColor:function (color) {
        this._disabledColor = color;
    }
});

/**
 * create a dom menu item from label
 * @return {cc.MenuItemLabel}
 * @example
 * // Example
 * var item = cc.MenuItemLabel.create(label)//creates a dom menu item from a label, (not really recommended)
 *
 * var item = cc.MenuItemLabel.create(label, target, 'callback')//create an item, when clicked wil run target.callback
 *
 * var item = cc.MenuItemLabel.create(label, target, target.run)//same as above, but passing in the whole function instead of function name
 */
cc.MenuItemLabel.create = function (label, two, three, four) {
    var that = new this();
    that.init(label);
    that.dom.addEventListener("mousedown", function (e) {
        var evt = e || window.event;
        evt.preventDefault();
        return false;
    });
    if (arguments.length == 4) {
        that.dom.addEventListener("click", function (event) {
            _domLabelCallback(event, three, four)
        });
        that.dom.addEventListener("touchstart", function (event) {
            _domLabelCallback(event, three, four)
        });
        that.dom.style.cursor = "pointer";
    }
    else if (arguments.length <= 2) {
        cc.Assert(0, "Not enough parameters.");
        //that.dom.addEventListener("click", two);//the second argument is now the selector
        //that.dom.addEventListener("touchstart", two);
        //that.style.cursor = "pointer";
    }
    else if (arguments.length == 3) {
        that.dom.addEventListener("click", function (event) {
            _domLabelCallback(that, two, three)
        });
        that.dom.addEventListener("touchstart", function (event) {
            _domLabelCallback(that, two, three)
        });
        that.dom.style.cursor = "pointer";
    }
    return that;
    function _domLabelCallback(event, target, selector) {
        if (target && (typeof(selector) == "string")) {
            target[selector](event);
        } else if (target && (typeof(selector) == "function")) {
            selector.call(target, event);
        }
    }
};

/**
 * create a dom menu item from string
 * @class
 * @extends cc.MenuItem
 */
cc.MenuItemFont = cc.MenuItem.extend(/** @lends cc.MenuItemFont# */{

    /**
     * Constructor
     */
    ctor:function () {
        this._super();
    },

    /**
     * @param {String} value
     * @param {cc.Node} target
     * @param {String|function} selector
     */
    initFromString:function (value, target, selector) {
        this._text = value;
        //create a div containing the text
        this.dom.textContent = this._text;
        this.dom.style.fontFamily = cc._fontName;
        this.dom.style.fontSize = cc._fontSize + "px";
        this.dom.style.color = "#FFF";
        this.dom.style.textAlign = "center";
        var tmp = cc.domNode.getTextSize(this._text, cc._fontSize, cc._fontName);
        this.setContentSize(cc.SizeMake(tmp.width, tmp.height));
        var that = this;
        if (selector != null) {
            this.dom.addEventListener("click", function (event) {
                _domFontCallback(that)
            });
            this.dom.addEventListener("touchstart", function (event) {
                _domFontCallback(that)
            });
            this.dom.style.cursor = "pointer";
        }
        //this.update();

        function _domFontCallback(event) {
            if (target && (typeof(selector) == "string")) {
                target[selector](event);
            } else if (target && (typeof(selector) == "function")) {
                selector.call(target, event);
            }
        }
    },

    /**
     * @param {Number} s
     */
    setFontSizeObj:function (s) {
        this.dom.style.fontSize = s + "px";
        var tmp = cc.domNode.getTextSize(this._text, cc._fontSize, cc._fontName);
        this.setContentSize(cc.SizeMake(tmp.width, tmp.height));
    },

    /**
     * @return {Number}
     */
    fontSizeObj:function () {
        return this.style.fontSize;
    },

    /**
     * @param {String} s
     */
    setFontName:function (s) {
        this.style.fontFamily = s;
    },

    /**
     * @return {Number}
     */
    fontNameObj:function () {
        return this.style.fontFamily;
    },
    _recreateLabel:function () {
    },
    _fontSize:0,
    _fontName:''
});

/**
 * a shared function to set the fontSize for menuitem font
 * @param {Number} s
 */
cc.MenuItemFont.setFontSize = function (s) {
    cc._fontSize = s;
};

/**
 * a shared function to get the font size for menuitem font
 * @return {Number}
 */
cc.MenuItemFont.fontSize = function () {
    return cc._fontSize;
};

/**
 * a shared function to set the fontsize for menuitem font
 * @param name
 */
cc.MenuItemFont.setFontName = function (name) {
    if (cc._fontNameRelease) {
        cc._fontName = '';
    }
    cc._fontName = name;
    cc._fontNameRelease = true;
};

/**
 * a shared function to get the font name for menuitem font
 * @return {String}
 */
cc.MenuItemFont.fontName = function () {
    return cc._fontName
};

/**
 * create a dom menu item from string
 * @param {String} value the text to display
 * @param {cc.Node|Null} target the target to run callback
 * @param {String|function|Null} selector the callback to run, either in function name or pass in the actual function
 * @return {cc.MenuItemFont}
 * @example
 * // Example
 * var item = cc.MenuItemFont.create("Game start", Game, 'start')
 * //creates a menu item from string "Game start", and when clicked, it will run Game.start()
 *
 * var item = cc.MenuItemFont.create("Game start", Game, game.start)//same as above
 *
 * var item = cc.MenuItemFont.create("i do nothing")//create a text menu item that does nothing
 *
 * //you can set font size and name before or after
 * cc.MenuItemFont.setFontName('my Fancy Font');
 * cc.MenuItemFont.setFontSize(62);
 */
cc.MenuItemFont.create = function (value, target, selector) {
    var ret = new cc.MenuItemFont();
    ret.initFromString(value, target, selector);
    return ret;
};