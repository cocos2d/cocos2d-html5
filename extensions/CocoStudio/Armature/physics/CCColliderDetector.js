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
ccs.PT_RATIO = 32;
/**
 * Base class for ccs.ColliderFilter
 * @class
 * @extends ccs.Class
 */
ccs.ColliderFilter = ccs.Class.extend(/** @lends ccs.ColliderFilter# */{
    _collisionType: 0,
    _group: 0,
    ctor: function (collisionType, group) {
        this._collisionType = collisionType || 0;
        this._group = group || 0;
    },
    updateShape: function (shape) {
        shape.collision_type = this._collisionType;
        shape.group = this._group;
    }
});
/**
 * Base class for ccs.ColliderBody
 * @class
 * @extends ccs.Class
 */
ccs.ColliderBody = ccs.Class.extend(/** @lends ccs.ColliderBody# */{
    _shape: null,
    _contourData: null,
    _filter:null,
    _calculatedVertexList:null,
    ctor: function (contourData) {
        this._shape = null;
        this._contourData = contourData;
        this._filter = new ccs.ColliderFilter();
        if(ccs.ENABLE_PHYSICS_SAVE_CALCULATED_VERTEX){
            this._calculatedVertexList = [];
        }
    },

    /**
     * contourData getter
     * @returns {ccs.ContourData}
     */
    getContourData: function () {
        return this._contourData;
    },

    /**
     * contourData setter
     * @param {ccs.ContourData}contourData
     */
    setContourData: function (contourData) {
        this._contourData = contourData;
    },

    /**
     * shape setter
     * @param {cs.Shape}contourData
     */
    getShape: function () {
        return this._shape;
    },

    /**
     * shape getter
     * @param {cs.Shape} shage
     */
    setShape: function (shage) {
        this._shape = shage;
    },

    /**
     * colliderFilter getter
     * @returns {ccs.ColliderFilter}
     */
    getColliderFilter: function () {
        return this._filter;
    },

    /**
     * colliderFilter setter
     * @param {ccs.ColliderFilter} filter
     */
    setColliderFilter: function (filter) {
        this._filter = filter;
    },

    /**
     * get calculated vertex list
     * @returns {Array}
     */
    getCalculatedVertexList:function(){
        return this._calculatedVertexList;
    }
});

/**
 * Base class for ccs.ColliderDetector
 * @class
 * @extends ccs.Class
 */
ccs.ColliderDetector = ccs.Class.extend(/** @lends ccs.ColliderDetector# */{
    _colliderBodyList: null,
    _bone: null,
    _body: null,
    _active: false,
    _filter: null,
    ctor: function () {
        this._colliderBodyList = [];
        this._bone = null;
        this._body = null;
        this._active = false;
        this._filter = null;
    },
    init: function (bone) {
        this._colliderBodyList = [];
        if (bone)
            this._bone = bone;
        this._filter = new ccs.ColliderFilter();
        return true;
    },

    /**
     *  add contourData
     * @param {ccs.ContourData} contourData
     */
    addContourData: function (contourData) {
        var colliderBody = new ccs.ColliderBody(contourData);
        this._colliderBodyList.push(colliderBody);
        if (ccs.ENABLE_PHYSICS_SAVE_CALCULATED_VERTEX) {
            var calculatedVertexList = colliderBody.getCalculatedVertexList();
            var vertexList = contourData.vertexList;
            for (var i = 0; i < vertexList.length; i++) {
                var newVertex = new ccs.ContourVertex2(0, 0);
                calculatedVertexList.push(newVertex);
            }
        }
    },

    /**
     * add contourData
     * @param {Array} contourDataList
     */
    addContourDataList: function (contourDataList) {
        for (var i = 0; i < contourDataList.length; i++) {
            this.addContourData(contourDataList[i]);
        }
    },

    /**
     * remove contourData
     * @param contourData
     */
    removeContourData: function (contourData) {
        var locColliderBodyList = this._colliderBodyList;
        for (var i = 0; i < locColliderBodyList.length; i++) {
            if(locColliderBodyList[i].getContourData()==contourData){
                locColliderBodyList.splice(i, 1);
                return;
            }
        }
    },

    /**
     * remove all body
     */
    removeAll: function () {
        this._colliderBodyList = [];
    },

    /**
     * set colliderFilter
     * @param {ccs.ColliderFilter} filter
     */
    setColliderFilter: function (filter) {
        this._filter = filter;
        for (var i = 0; i < this._colliderBodyList.length; i++) {
            var colliderBody = this._colliderBodyList[i];
            colliderBody.setColliderFilter(filter);
            if (ccs.ENABLE_PHYSICS_CHIPMUNK_DETECT) {
                if (colliderBody.getShape()) {
                    colliderBody.getColliderFilter().updateShape(colliderBody.getShape());
                }
            }
        }
    },

    /**
     * get colliderFilter
     * @returns {ccs.ColliderFilter}
     */
    getColliderFilter:function(){
        return this._filter;
    },

    setActive: function (active) {
        if (this._active == active)
            return;
        this._active = active;
        var locBody = this._body;
        var locShape;
        if (locBody) {
            var colliderBody = null;
            if (this._active) {
                for (var i = 0; i < this._colliderBodyList.length; i++) {
                    colliderBody = this._colliderBodyList[i];
                    locShape = colliderBody.getShape();
                    locBody.space.addShape(locShape);
                }
            }
            else {
                for (var i = 0; i < this._colliderBodyList.length; i++) {
                    colliderBody = this._colliderBodyList[i];
                    locShape = colliderBody.getShape();
                    locBody.space.removeShape(locShape);
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
        var locBody = this._body;
        var locHelpPoint = this.helpPoint;
        for (var i = 0; i < this._colliderBodyList.length; i++) {
            colliderBody = this._colliderBodyList[i];
            var contourData = colliderBody.getContourData();
            var shape = null;
            if (locBody) {
                shape = colliderBody.getShape();
                locBody.p.x = t.tx;
                locBody.p.y = t.ty;
                locBody.p.a = t.a;
            }
            var vs = contourData.vertexList;
            var cvs = colliderBody.getCalculatedVertexList();
            for (var i = 0; i < vs.length; i++) {
                locHelpPoint.x = vs[i].x;
                locHelpPoint.y = vs[i].y;
                locHelpPoint = cc.PointApplyAffineTransform(locHelpPoint, t);
                if (shape) {
                    shape.verts[i * 2] = locHelpPoint.x - t.tx;
                    shape.verts[i * 2 + 1] = locHelpPoint.y - t.ty;
                }
                if (ccs.ENABLE_PHYSICS_SAVE_CALCULATED_VERTEX) {
                    var v =  cc.p(0, 0);
                    v.x = locHelpPoint.x;
                    v.y = locHelpPoint.y;
                    cvs[i] = v;
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
            if (this._active){
                this._body.space.addShape(shape);
            }
            colliderBody.setShape(shape);
            colliderBody.getColliderFilter().updateShape(shape);
        }
    }
});
ccs.ColliderDetector.create = function (bone) {
    var colliderDetector = new ccs.ColliderDetector();
    if (colliderDetector && colliderDetector.init(bone)) {
        return colliderDetector;
    }
    return null;
};