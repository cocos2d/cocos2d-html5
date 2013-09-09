/****************************************************************************
 Copyright (c) 2010-2012 cocos2d-x.org

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

cc.ColliderBody = cc.Class.extend({
    _shape: null,
    _contourData: null,
    ctor: function (contourData) {
        this._contourData = contourData;
    },
    getContourData: function () {
        return this._contourData;
    },
    setContourData: function (contourData) {
        this._contourData = contourData;
    },
    getShape: function () {
        return this._shape;
    },
    setShape: function (shage) {
        this._shape = shage;
    }
});
cc.ColliderDetector = cc.Class.extend({
    _colliderBodyList: null,
    _bone: null,
    _body: null,
    _active: false,
    ctor: function () {
        this._colliderBodyList = [];
    },
    init: function (bone) {
        this._colliderBodyList = [];
        if (bone)
            this._bone = bone;
        return true;
    },
    addContourData: function (contourData) {
        var colliderBody = new cc.ColliderBody(contourData);
        this._colliderBodyList.push(colliderBody);
    },
    addContourDataList: function (contourDataList) {
        for (var i = 0; i < contourDataList.length; i++) {
            this.addContourData(contourDataList[i]);
        }
    },
    removeContourData: function (contourData) {
        //todo
        //cc.ArrayRemoveObject(this._colliderBodyList,contourData);
    },
    removeAll: function () {
        this._colliderBodyList = [];
    },

    setColliderFilter: function (filter) {

    },
    setActive: function (active) {
        if (this._active == active)
            return;
        this._active = active;
        if (this._body) {
            var colliderBody = null;
            if (this._active) {
                for (var i = 0; i < this._colliderBodyList.length; i++) {
                    colliderBody = this._colliderBodyList[i];
                    var shape = colliderBody.getShape();
                    this._body.space.addShape(shape);
                }
            }
            else {
                for (var i = 0; i < this._colliderBodyList.length; i++) {
                    colliderBody = this._colliderBodyList[i];
                    var shape = colliderBody.getShape();
                    this._body.space.removeShape(shape);
                }
            }
        }
    },
    getActive: function () {
        return this._active;
    },
    getColliderBodyList: function () {
        return this._colliderBodyList;
    },
    helpPoint: cc.p(0, 0),
    updateTransform: function (t) {
        if (!this._active)
            return;

        var colliderBody = null;
        if(!cc.Browser.supportWebGL){
            t.b*=-1;
            t.c*=-1;
        }
        for (var i = 0; i < this._colliderBodyList.length; i++) {
            colliderBody = this._colliderBodyList[i];
            var contourData = colliderBody.getContourData();
            var shape = null;
            if (this._body)
                shape = colliderBody.getShape();
            this._body.p.x = t.tx;
            this._body.p.y = t.ty;
            this._body.p.a = t.a;
            var vs = contourData.vertexList;
            for (var i = 0; i < vs.length; i++) {
                this.helpPoint.x = vs[i].x;
                this.helpPoint.y = vs[i].y;
                this.helpPoint = cc.PointApplyAffineTransform(this.helpPoint, t);
                if (shape) {
                    var v = new cp.Vect(0, 0);
                    v.x = this.helpPoint.x;
                    v.y = this.helpPoint.y;
                    shape.verts[i * 2] = this.helpPoint.x - t.tx;
                    shape.verts[i * 2 + 1] = this.helpPoint.y - t.ty;
                }
            }
        }
    },
    getBody: function () {
        return this._body;
    },
    setBody: function (body) {
        this._body = body;
        var colliderBody;
        for (var i = 0; i < this._colliderBodyList.length; i++) {
            colliderBody = this._colliderBodyList[i];
            var contourData = colliderBody.getContourData();
            var verts = [];
            var vs = contourData.vertexList;
            for (var i = 0; i < vs.length; i++) {
                var v = vs[i];
                verts.push(v.x);
                verts.push(v.y);
            }
            var shape = new cp.PolyShape(this._body, verts, cp.vzero);
            shape.sensor = true;
            shape.data = this._bone;
            this._body.space.addShape(shape);
            colliderBody.setShape(shape);
        }
    }
});
cc.ColliderDetector.create = function (bone) {
    var colliderDetector = new cc.ColliderDetector();
    if (colliderDetector && colliderDetector.init(bone)) {
        return colliderDetector;
    }
    return null;
};