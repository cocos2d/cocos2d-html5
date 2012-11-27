/**
 * Created with JetBrains WebStorm.
 * User: Administrator
 * Date: 12-11-21
 * Time: 上午11:40
 * To change this template use File | Settings | File Templates.
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

    },

    onEnter:function(){
         //alert("onEnter");
    },

    onExit:function(){
       this.hideEditBox();
    },

    //设置宽
    setWidth : function(w)
   {
       this._edWidth = w;
       this._edDiv.style.width = w.toString()+"px";
   },
   //设置高
    setHeight : function(h)
   {
       this._edHeight = h;
       this._edDiv.style.height = h.toString()+"px";
   },
 //设置字号
   setFontSize : function(size)
  {
      this._edFontSize = size;
      this._edTxt.style.fontSize = this._edFontSize+"px";
  },
 //设置editbox文字
  setDefaultValue : function(st)
 {
     this._edTxt.value = st;
 },
 //设置字体颜色
 //接受一个字符串作为颜色参数
  setFontColor : function(clrSt)
  {
     this._edTxt.style.color = clrSt;
  },
 //设置背景色
  setBgClr : function(clrSt)
  {
     this._edDiv.style.backgroundColor = clrSt;
  },
 //设置边框颜色
  setBorderClr : function(clrSt)
 {
     this._edDiv.style.borderColor = clrSt;
 },

 //设置maxlength值
  setMaxLength : function(n)
 {
     if(!isNaN(n) && n>0)
     {
         this._edTxt.maxLength = n;
     }
 },

    //设置位置
  setPosition : function(x,y)
 {
     this._edDiv.style.position ="absolute";
     this._edDiv.style.left = x.toString()+"px";
     this._edDiv.style.top =  y.toString()+"px";
 },

  //设置zIndex
   setZIndex:function(z)
  {
     this._edDiv.zIndex = z;
  },

    setImgStyle:function(url)
    {
        this._edDiv.style.backgroundImage = "url('"+url+"')";
        this._edDiv.style.border = 0;
    },


//设置密码样式
  setPasswordStyle:function()
  {
      this._edTxt.type ="password";
  },
    //返回editBox的值
    getTxtValue : function()
    {
        return this._edTxt.value;
    },

    //隐藏EditBox
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




