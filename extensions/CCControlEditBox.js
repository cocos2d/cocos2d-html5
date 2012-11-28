/*
 * CCControlButton.m
 *
 * Copyright (c) 2010-2012 cocos2d-x.org
 * Copyright 2012 Yannick Loriot.
 * http://yannickloriot.com
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
cc.ControlEditBox = cc.Node.extend({
      _edDiv : null,
      _edTxt : null,
      _edWidth : 0,
      _edHeight : 0,
      _edFontSize : 0,
      _edBgClr : "#ffff00",
      _edFontClr : "blue",
      _edBorderClr : "#ffccdd",
      _posX : 0,
      _posY : 0,
      _id:"",
      _passwordMode:1,
      _textMode:2,

    ctor:function(w,h,size){
        this._super();
        this._edDiv = document.createElement("div"),
        this._edTxt = document.createElement("input");
        this._edTxt.type ="text";
        this._edWidth = w;
        this._edHeight = h;
        this._edFontSize = size;
        this._edDiv.style.backgroundColor = this._edBgClr;
        this._edDiv.style.width = this._edWidth.toString()+"px";
        this._edDiv.style.height = this._edHeight.toString()+"px";
        this._edDiv.style.borderColor = this._edBorderClr;
        this._edDiv.style.borderStyle = "solid";
        this._edDiv.style.border = 2;
        this._edDiv.style.borderRadius = "8px";

        this._edTxt.style.fontSize = this._edFontSize+"px";
        this._edTxt.style.color = this._edFontClr;
        this._edTxt.style.border = 0;
        this._edTxt.style.background ="transparent";
        this._edTxt.style.paddingLeft = "2px";
        this._edTxt.style.width = "100%";
        this._edTxt.style.height = "100%";
        this._edTxt.style.active = 0;
        this._edTxt.style.outline = "medium";

        this._edDiv.appendChild(this._edTxt);

        this.passwordMode = 1;
        this.textMode = 2;

    },

    onEnter:function(){
        //
    },

    onExit:function(){
       this.hideEditBox();
    },

    setWidth : function(w)
   {
       this._edWidth = w;
       this._edDiv.style.width = w.toString()+"px";
   },
    setHeight : function(h)
   {
       this._edHeight = h;
       this._edDiv.style.height = h.toString()+"px";
   },
   setFontSize : function(size)
  {
      this._edFontSize = size;
      this._edTxt.style.fontSize = this._edFontSize+"px";
  },
  setText : function(pText)
 {
     this._edTxt.value = pText;
 },
  setFontColor : function(color)
  {
     this._edTxt.style.color = color;
  },
  setBgClr : function(color)
  {
     this._edDiv.style.backgroundColor = color;
  },
  setBorderClr : function(color)
 {
     this._edDiv.style.borderColor = color;
 },

  setMaxLength : function(maxLength)
 {
     if(!isNaN(maxLength) && maxLength>0)
     {
         this._edTxt.maxLength = maxLength;
     }
 },

  setPosition : function(x,y)
 {
     this._edDiv.style.position ="absolute";
     this._edDiv.style.left = x.toString()+"px";
     this._edDiv.style.top =  y.toString()+"px";
 },

   setZIndex:function(z)
  {
     this._edDiv.zIndex = z;
  },

    setImgStyle:function(url)
    {
        this._edDiv.style.backgroundImage = "url('"+url+"')";
        this._edDiv.style.border = 0;
    },


  setInputMode:function(inputMode)
  {
      var cInput = inputMode.toLocaleLowerCase();
      if(cInput == "password")
      {
          this._edTxt.type ="password";
      }
      else if(cInput == "text")
      {
          this._edTxt.type = "text";
      }

  },
    getText : function()
    {
        return this._edTxt.value;
    },

    hideEditBox : function()
    {
        this._edDiv.style.display = "none";
    }


});

cc.ControlEditBox.create = function(w,h,size)
{
    var edbox1 = new cc.ControlEditBox(w,h,size);
    cc.$("#Cocos2dGameContainer").appendChild(edbox1._edDiv);
    return edbox1;
};




