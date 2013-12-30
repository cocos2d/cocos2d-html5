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
 *
 * @type Object
 */
cc.VisibleRect = {
    _topLeft:cc._pConst(0,0),
    _topRight:cc._pConst(0,0),
    _top:cc._pConst(0,0),
    _bottomLeft:cc._pConst(0,0),
    _bottomRight:cc._pConst(0,0),
    _bottom:cc._pConst(0,0),
    _center:cc._pConst(0,0),
    _left:cc._pConst(0,0),
    _right:cc._pConst(0,0),
    _width:0,
    _height:0,
    init:function(size){
        this._width = size.width;
        this._height = size.height;

        var w = this._width;
        var h = this._height;

        //top
        this._topLeft._y = h;
        this._topRight._x = w;
        this._topRight._y = h;
        this._top._x = w/2;
        this._top._y = h;

        //bottom
        this._bottomRight._x = w;
        this._bottom._x = w/2;

        //center
        this._center._x = w/2;
        this._center._y = h/2;

        //left
        this._left._y = h/2;

        //right
        this._right._x = w;
        this._right._y = h/2;
    },
    getWidth:function(){
        return this._width;
    },
    getHeight:function(){
        return this._height;
    },
    topLeft:function(){
        return this._topLeft;
    },
    topRight:function(){
        return this._topRight;
    },
    top:function(){
        return this._top;
    },
    bottomLeft:function(){
        return this._bottomLeft;
    },
    bottomRight:function(){
        return this._bottomRight;
    },
    bottom:function(){
        return this._bottom;
    },
    center:function(){
        return this._center;
    },
    left:function(){
        return this._left;
    },
    right:function(){
        return this._right;
    }
};