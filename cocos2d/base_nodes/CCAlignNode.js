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
cc.AlignNode = cc.Node.extend({
    ctor:function(align, parent, children){
        this.setAlign(align);
        if(parent)
        {
            parent.addChild(this);
        }
        if(arguments.length > 2)
        {
            for(var i = 2; i < arguments.length; i++)
            {
                this.addChild(arguments[i]);
            }
        }
    },
    setAlign:function(align){
        switch (align)
        {
            case cc.ALIGN_TOP_LEFT:
                this._position = cc.AlignNode.manager.TL;
                break;
            case cc.ALIGN_TOP:
                this._position = cc.AlignNode.manager.TC;
                break;
            case cc.ALIGN_TOP_RIGHT:
                this._position = cc.AlignNode.manager.TR;
                break;
            case cc.ALIGN_LEFT:
                this._position = cc.AlignNode.manager.CL;
                break;
            case cc.ALIGN_CENTER:
                this._position = cc.AlignNode.manager.C;
                break;
            case cc.ALIGN_RIGHT:
                this._position = cc.AlignNode.manager.CR;
                break;
            case cc.ALIGN_BOTTOM_LEFT:
                this._position = cc.AlignNode.manager.BL;
                break;
            case cc.ALIGN_BOTTOM_RIGHT:
                this._position = cc.AlignNode.manager.BR;
                break;
            case cc.ALIGN_BOTTOM:
                this._position = cc.AlignNode.manager.BC;
                break;
            default:
                cc.assert(false,"Invalid align argument");
        }
        return true;
    },
    setPosition:function(){
        //disabled for position Node
        cc.assert(false,"you can not manually move a position node");
        return;
    },
    setPositionX:this.setPosition,
    setPositionY:this.setPosition,
    setRotation:function(){
        //disabled for position Node
        cc.assert(false,"you can not manually rotate a position node");
        return;
    },
    setSkewX:function(){
        //disabled for position Node
        cc.assert(false,"you can not manually skew a position node");
        return;
    },
    setSkewY:this.setSkewX,
    setContentSize:function(){
        //disabled for position Node
        cc.assert(false,"you can not set a contentSize for position node");
        return;
    }
});
cc.AlignNode.create = function(align){
    if(align > cc.align.BR || align < 0 || isNaN(align))
    {
        cc.assert(false,"you can not manually move a position node");
        return;
    }
    return new cc.AlignNode(align);
};
cc.AlignNode.manager = {
    TL:cc.p(0,0),
    TC:cc.p(0,0),
    TR:cc.p(0,0),
    CL:cc.p(0,0),
    C:cc.p(0,0),
    CR:cc.p(0,0),
    BL:cc.p(0,0),//this don't need update
    BC:cc.p(0,0),
    BR:cc.p(0,0),
    updatePositionNodes:function(width,height){
        this.TL.y = this.TC.y = this.TR.y = height;
        this.CL.y = this.C.y = this.CR.y = height/2;

        this.TC.x = this.C.x = this.BC.x = width/2;
        this.TR.x = this.CR.x = this.BR.x = width;
    }
};