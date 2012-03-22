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
cc.MenuItem = cc.domNode.extend({
    _image:null,
    init: function(file){
        //create div containing an image - div created in ctor
        //craete image
        this._image = new Image();
        this._image.src = file;
        this._image.id ="test";
        //add to the div
        this._domElement.appendChild(this._image);
    }
});


cc.MenuItemImage = cc.MenuItem.extend({

});
cc.MenuItemImage.itemFromNormalImage = function(normal, selected, target, callback)
{
    //create div containing an image - should be done in menuitem
    var that = new this();
    that.init(normal);
    //attach script to swapout image on hover
    var tmp = new Image();
    tmp.src = selected;
    that._image.addEventListener("mouseover",function(){this.src = selected;});
    that._image.addEventListener("mouseout",function(){this.src = normal;});
    that._image.addEventListener("click", callback);
    //attach callback to onclick
    return that;
};