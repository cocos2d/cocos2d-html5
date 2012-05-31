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

    _ratio:null,
    _offset:null,
    _child:null,

    getRatio:function () {
        return this._ratio;
    },
    setRatio:function (value) {
        this._ratio = value;
    },
    getOffset:function () {
        return this._offset;
    },
    setOffset:function (value) {
        this._offset = value;
    },
    getChild:function () {
        return this._child;
    },
    setChild:function (value) {
        this._child = value;
    },

    initWithCCPoint:function (ratio, offset) {
        this._ratio = ratio;
        this._offset = offset;
        this._child = null;
        return true;
    }
});
cc.PointObject.pointWithCCPoint = function (ratio, offset) {
    var ret = new cc.PointObject();
    ret.initWithCCPoint(ratio, offset);
    return ret;
}
cc.ParallaxNode = cc.Node.extend({

    /** array that holds the offset / ratio of the children */
    _parallaxArray:[],

    getParallaxArray:function () {
        return this._parallaxArray;
    },
    setParallaxArray:function (value) {
        this._parallaxArray = value;
    },

    /** Adds a child to the container with a z-order, a parallax ratio and a position offset
     It returns self, so you can chain several addChilds.
     @since v0.8
     */
    ctor:function () {
        this._parallaxArray = [];
        this._lastPosition = cc.PointMake(-100, -100);
    },

    addChild:function (child, z, ratio, offset) {
        if (arguments.length == 3) {
            cc.Assert(0, "ParallaxNode: use addChild:z:parallaxRatio:positionOffset instead");
            return;
        }
        cc.Assert(child != null, "Argument must be non-nil");
        var obj = cc.PointObject.pointWithCCPoint(ratio, offset);
        obj.setChild(child);
        this._parallaxArray.push(obj);

        var pos = this._position;
        pos.x = pos.x * ratio.x + offset.x;
        pos.y = pos.y * ratio.y + offset.y;
        child.setPosition(pos);

        this._super(child, z, child.getTag());

    },
    // super methods
    removeChild:function (child, cleanup) {
        for (var i = 0; i < this._parallaxArray.length; i++) {
            var point = this._parallaxArray[i];
            if (point.getChild().isEqual(child)) {
                //ccArrayRemoveObjectAtIndex(m_pParallaxArray, i);
                this._parallaxArray.splice(i, 1);
                break;
            }
        }
        this._super(child, cleanup);
    },
    removeAllChildrenWithCleanup:function (cleanup) {
        this._parallaxArray = [];
        this._super(cleanup);
    },
    visit:function () {
        //	CCPoint pos = position_;
        //	CCPoint	pos = [self convertToWorldSpace:CCPointZero];
        var pos = this._absolutePosition();
        if (!cc.Point.CCPointEqualToPoint(pos, this._lastPosition)) {
            for (var i = 0; i < this._parallaxArray.length; i++) {
                var point = this._parallaxArray[i];
                var x = -pos.x + pos.x * point.getRatio().x + point.getOffset().x;
                var y = -pos.y + pos.y * point.getRatio().y + point.getOffset().y;
                point.getChild().setPosition(cc.ccp(x, y));
            }
            lastPosition = pos;
        }
        this._super();
    },
    _absolutePosition:function () {
        var ret = this._position;
        var cn = this;
        while (cn.getParent() != null) {
            cn = cn.getParent();
            ret = cc.ccpAdd(ret, cn.getPosition());
        }
        return ret;
    },

    _lastPosition:null
});

cc.ParallaxNode.node = function () {
    var ret = new cc.ParallaxNode();
    return ret;
}