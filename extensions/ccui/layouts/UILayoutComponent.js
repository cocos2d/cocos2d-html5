/****************************************************************************
 Copyright (c) 2011-2012 cocos2d-x.org
 Copyright (c) 2013-2014 Chukong Technologies Inc.

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

ccui.LayoutComponent_ReferencePoint = {
    BOTTOM_LEFT: 0,
    TOP_LEFT: 1,
    BOTTOM_RIGHT: 2,
    TOP_RIGHT: 3
};
ccui.LayoutComponent_PositionType = {
    Position: 0,
    RelativePosition: 1,
    PreRelativePosition: 2,
    PreRelativePositionEnable: 3
};
ccui.LayoutComponent_SizeType = {
    Size: 0,
    PreSize: 1,
    PreSizeEnable: 2
};

ccui.LayoutComponent = cc.Component.extend({

    _percentContentSize: null,
    _usingPercentContentSize: false,

    _referencePoint: ccui.LayoutComponent_ReferencePoint.BOTTOM_LEFT,
    _relativePosition: null,
    _percentPosition: null,
    _usingPercentPosition: false,
    _actived: true,


    init: function(){
        var ret = true;
        do
        {
            if (!cc.Component.prototype.init.call(this))
            {
                ret = false;
                break;
            }

            //put layout component initalized code here

        } while (0);
        return ret;
    },

    isUsingPercentPosition: function(){
        return this._usingPercentPosition;
    },
    setUsingPercentPosition: function(flag){
        this._usingPercentPosition = flag;
        this.RefreshLayoutPosition(ccui.LayoutComponent_PositionType.PreRelativePositionEnable, cc.p(0,0));
    },

    getPercentPosition: function(){
        return this._percentPosition;
    },
    setPercentPosition: function(percent){
        this.RefreshLayoutPosition(ccui.LayoutComponent_PositionType.PreRelativePosition, percent);
    },

    getRelativePosition: function(){
        return this._relativePosition;
    },
    setRelativePosition: function(position){
        this.RefreshLayoutPosition(ccui.LayoutComponent_PositionType.RelativePosition, position);
    },

    setReferencePoint: function(point){
        this._referencePoint = point;
        this.RefreshLayoutPosition(ccui.LayoutComponent_PositionType.RelativePosition, this._relativePosition)
    },
    getReferencePoint: function(){
        return this._referencePoint;
    },

    getOwnerPosition: function(){
        return this.getOwner().getPosition();
    },
    setOwnerPosition: function(point){
        this.RefreshLayoutPosition(ccui.LayoutComponent_PositionType.Position, point);
    },

    RefreshLayoutPosition: function(pType, point){
        var parentNode = this.getOwner().getParent();
        var basePoint = point;
        if (parentNode != null && this._actived)
        {
            var parentSize = parentNode.getContentSize();

            if ( pType == ccui.LayoutComponent_PositionType.PreRelativePosition)
            {
                this._percentPosition = point;
                basePoint = cc.p(this._percentPosition.x * parentSize.width, this._percentPosition.y * parentSize.height);
            }
            else if(pType == ccui.LayoutComponent_PositionType.PreRelativePositionEnable)
            {
                if (this._usingPercentPosition)
                {
                    if (parentSize.width != 0)
                    {
                        this._percentPosition.x = this._relativePosition.x / parentSize.width;
                    }
                    else
                    {
                        this._percentPosition.x = 0;
                        this._relativePosition.x = 0;
                    }

                    if (parentSize.height != 0)
                    {
                        this._percentPosition.y = this._relativePosition.y / parentSize.height;
                    }
                    else
                    {
                        this._percentPosition.y = 0;
                        this._relativePosition.y = 0;
                    }
                }
                basePoint = this._relativePosition;
            }

            var inversePoint = basePoint;
            switch (this._referencePoint)
            {
            case ccui.LayoutComponent_ReferencePoint.TOP_LEFT:
                inversePoint.y = parentSize.height - inversePoint.y;
                break;
            case ccui.LayoutComponent_ReferencePoint.BOTTOM_RIGHT:
                inversePoint.x = parentSize.width - inversePoint.x;
                break;
            case ccui.LayoutComponent_ReferencePoint.TOP_RIGHT:
                inversePoint.x = parentSize.width - inversePoint.x;
                inversePoint.y = parentSize.height - inversePoint.y;
                break;
            default:
                break;
            }

            switch (pType)
            {
            case ccui.LayoutComponent_PositionType.Position:
                this.getOwner().setPosition(basePoint);
                this._relativePosition = inversePoint;
                if (parentSize.width != 0 && parentSize.height != 0)
                {
                    this._percentPosition = cc.p(this._relativePosition.x / parentSize.width, this._relativePosition.y / parentSize.height);
                }
                else
                {
                    this._percentPosition = cc.p(0,0);
                }
                break;
            case ccui.LayoutComponent_PositionType.RelativePosition:
                this.getOwner().setPosition(inversePoint);
                this._relativePosition = basePoint;
                if (parentSize.width != 0 && parentSize.height != 0)
                {
                    this._percentPosition = cc.p(this._relativePosition.x / parentSize.width, this._relativePosition.y / parentSize.height);
                }
                else
                {
                    this._percentPosition = cc.p(0,0);
                }
                break;
            case ccui.LayoutComponent_PositionType.PreRelativePosition:
                this.getOwner().setPosition(inversePoint);
                this._relativePosition = basePoint;
                break;
            case ccui.LayoutComponent_PositionType.PreRelativePositionEnable:
                this.getOwner().setPosition(inversePoint);
                this._relativePosition = basePoint;
                break;
            default:
                break;
            }
        }
        else
        {
            switch (pType)
            {
            case ccui.LayoutComponent_PositionType.Position:
                this.getOwner().setPosition(basePoint);
                if (this._referencePoint == ccui.LayoutComponent_ReferencePoint.BOTTOM_LEFT)
                {
                    this._relativePosition = basePoint;
                }
                break;
            case ccui.LayoutComponent_PositionType.RelativePosition:
                this._relativePosition = basePoint;
                break;
            case ccui.LayoutComponent_PositionType.PreRelativePosition:
                this._percentPosition = basePoint;
                break;
            default:
                break;
            }
        }
    },

    getOwnerContentSize: function(){
        return this.getOwner().getContentSize();
    },
    setOwnerContentSize: function(percent){
        this.RefreshLayoutSize(ccui.LayoutComponent_SizeType.Size, percent);
    },

    getPercentContentSize: function(){
        return this._percentContentSize;
    },
    setPercentContentSize: function(percent){
        this.RefreshLayoutSize(ccui.LayoutComponent_SizeType.PreSize, percent);
    },

    isUsingPercentContentSize: function(){
        return this._usingPercentContentSize;
    },
    setUsingPercentContentSize: function(flag){
        this._usingPercentContentSize = flag;
        this.RefreshLayoutSize(ccui.LayoutComponent_SizeType.PreSizeEnable, cc.p(0,0));
    },

    RefreshLayoutSize: function(sType, size){
        var parentNode = this.getOwner().getParent();
        if (parentNode != null && this._actived)
        {
            var parentSize = parentNode.getContentSize();

            switch (sType)
            {
            case ccui.LayoutComponent_SizeType.Size:
                if (parentSize.width != 0 && parentSize.height != 0)
                {
                    this._percentContentSize = cc.p(size.x/parentSize.width,size.y/parentSize.height);
                }
                else
                {
                    this._percentContentSize = cc.p(0,0);
                }
                this.getOwner().setContentSize(cc.size(size.x,size.y));
                break;
            case ccui.LayoutComponent_SizeType.PreSize:
                cc.p_percentContentSize = size;
                if (this._usingPercentContentSize)
                {
                    this.getOwner().setContentSize(cc.size(size.x*parentSize.width,size.y*parentSize.height));
                }
                break;
            case ccui.LayoutComponent_SizeType.PreSizeEnable:
                if (this._usingPercentContentSize)
                {
                    var baseSize = this.getOwner().getContentSize();
                    if (parentSize.width != 0)
                    {
                        this._percentContentSize.x = baseSize.width/parentSize.width;
                    }
                    else
                    {
                        this._percentContentSize.x = 0;
                        baseSize.width = 0;
                    }

                    if (parentSize.height != 0)
                    {
                        this._percentContentSize.y = baseSize.height/parentSize.height;
                    }
                    else
                    {
                        this._percentContentSize.y = 0;
                        baseSize.height = 0;
                    }

                    this.getOwner().setContentSize(baseSize);
                }
                break;
            default:
                break;
            }
        }
        else
        {
            switch (sType)
            {
            case ccui.LayoutComponent_SizeType.Size:
                this.getOwner().setContentSize(cc.size(size.x,size.y));
                break;
            case ccui.LayoutComponent_SizeType.PreSize:
                this._percentContentSize = size;
                break;
            default:
                break;
            }
        }
    },
    SetActiveEnable: function(enable){
        this._actived = enable;
    }

});