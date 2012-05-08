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

/** @brief CCParallaxNode: A node that simulates a parallax scroller

 The children will be moved faster / slower than the parent according the the parallax ratio.

 */
cc.PointObject = cc.Class.extend({

    _m_tRatio:null,
    _m_tOffset:null,
    _m_pChild:null,

    getRatio:function () {
        return this._m_tRatio;
    },
    setRatio:function (value) {
        this._m_tRatio = value;
    },
    getOffset:function () {
        return this._m_tOffset;
    },
    setOffset:function (value) {
        this._m_tOffset = value;
    },
    getChild:function () {
        return this._m_pChild;
    },
    setChild:function (value) {
        this._m_pChild = value;
    },

    initWithCCPoint:function (ratio, offset) {
        this._m_tRatio = ratio;
        this._m_tOffset = offset;
        this._m_pChild = null;
        return true;
    }
});
cc.PointObject.pointWithCCPoint = function (ratio, offset) {
    var pRet = new cc.PointObject();
    pRet.initWithCCPoint(ratio, offset);
    return pRet;
}
cc.ParallaxNode = cc.Node.extend({

    /** array that holds the offset / ratio of the children */
    _m_pParallaxArray:[],

    getParallaxArray:function () {
        return this._m_pParallaxArray;
    },
    setParallaxArray:function (value) {
        this._m_pParallaxArray = value;
    },

    /** Adds a child to the container with a z-order, a parallax ratio and a position offset
     It returns self, so you can chain several addChilds.
     @since v0.8
     */
    ctor:function () {
        this._m_pParallaxArray = [];
        this._m_tLastPosition = cc.PointMake(-100, -100);
    },

    addChild:function (child, z, ratio, offset) {
        if (arguments.length == 3) {
            cc.Assert(0, "ParallaxNode: use addChild:z:parallaxRatio:positionOffset instead");
            return;
        }
        cc.Assert(child != null, "Argument must be non-nil");
        var obj = cc.PointObject.pointWithCCPoint(ratio, offset);
        obj.setChild(child);
        this._m_pParallaxArray.push(obj);

        var pos = this._m_tPosition;
        pos.x = pos.x * ratio.x + offset.x;
        pos.y = pos.y * ratio.y + offset.y;
        child.setPosition(pos);

        this._super(child, z, child.getTag());

    },
    // super methods
    removeChild:function (child, cleanup) {
        for (var i = 0; i < this._m_pParallaxArray.length; i++) {
            var point = this._m_pParallaxArray[i];
            if (point.getChild().isEqual(child)) {
                //ccArrayRemoveObjectAtIndex(m_pParallaxArray, i);
                this._m_pParallaxArray.splice(i, 1);
                break;
            }
        }
        this._super(child, cleanup);
    },
    removeAllChildrenWithCleanup:function (cleanup) {
        this._m_pParallaxArray = [];
        this._super(cleanup);
    },
    visit:function () {
        //	CCPoint pos = position_;
        //	CCPoint	pos = [self convertToWorldSpace:CCPointZero];
        var pos = this._absolutePosition();
        if (!cc.Point.CCPointEqualToPoint(pos, this._m_tLastPosition)) {
            for (var i = 0; i < this._m_pParallaxArray.length; i++) {
                var point = this._m_pParallaxArray[i];
                var x = -pos.x + pos.x * point.getRatio().x + point.getOffset().x;
                var y = -pos.y + pos.y * point.getRatio().y + point.getOffset().y;
                point.getChild().setPosition(cc.ccp(x, y));
            }
            m_tLastPosition = pos;
        }
        this._super();
    },
    _absolutePosition:function () {
        var ret = this._m_tPosition;
        var cn = this;
        while (cn.getParent() != null) {
            cn = cn.getParent();
            ret = cc.ccpAdd(ret, cn.getPosition());
        }
        return ret;
    },

    _m_tLastPosition:null
});

cc.ParallaxNode.node = function () {
    var pRet = new cc.ParallaxNode();
    return pRet;
}