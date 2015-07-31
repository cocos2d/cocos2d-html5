/****************************************************************************
 Copyright (c) 2015-2016 Chukong Technologies Inc.

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
 * SkeletonNode
 * base class
 * @class
 */
ccs.SkeletonNode = (function(){

    var BoneNode = ccs.BoneNode;

    var type = {
        p: cc.p,
        size: cc.size,
        rect: cc.rect
    };

    var SkeletonNode = BoneNode.extend(/** @lends ccs.SkeletonNode# */{
        _subBonesMap: null,

        _squareVertices: null,
        _squareColors: null,
        _noMVPVertices: null,
        _skinGroupMap: null,

        _sortedAllBonesDirty: false,
        _sortedAllBones: null,
        _batchedBoneVetices: null,
        _batchedBoneColors: null,
        _batchedVeticesCount: null,
        _batchBoneCommand: null,

        ctor: function(){
            this._squareVertices = [
                {x: 0, y: 0}, {x: 0, y: 0}, {x: 0, y: 0}, {x: 0, y: 0},
                {x: 0, y: 0}, {x: 0, y: 0}, {x: 0, y: 0}, {x: 0, y: 0}
            ];
            this._rootSkeleton = this;
            BoneNode.prototype.ctor.call(this);
            this._subBonesMap = {};

            this._skinGroupMap = {};

            this._rackLength = this._rackWidth = 20;
            this._updateVertices();
        },

        getBoneNode: function(boneName){
            var item = this._subBonesMap[boneName];
            if(item)
                return item;
            return null;
        },

        getAllSubBonesMap: function(){
            return this._subBonesMap;
        },

        changeSkins: function(boneSkinNameMap){
            //boneSkinNameMap
            //suitName
            if(typeof boneSkinNameMap === "object"){
                var boneSkin;
                for(var name in boneSkinNameMap){
                    boneSkin = boneSkinNameMap[name];
                    var bone = this.getBoneNode(name);
                    if(null !== bone)
                        bone.displaySkin(boneSkin, true);
                }
            }else{
                var suit = this._suitMap[boneSkinNameMap/*suitName*/];
                if (suit)
                    this.changeSkins(suit, true);
            }
        },

        addSkinGroup: function(groupName, boneSkinNameMap){
            this._skinGroupMap[groupName] = boneSkinNameMap;
        },

        getBoundingBox: function(){
            var minx, miny, maxx, maxy = 0;
            minx = miny = maxx = maxy;
            var boundingBox = this.getVisibleSkinsRect();
            var first = true;
            if(boundingBox.x !== 0 || boundingBox.y !== 0 || boundingBox.width !== 0 || boundingBox.height !== 0){
                minx = cc.rectGetMinX(boundingBox);
                miny = cc.rectGetMinY(boundingBox);
                maxx = cc.rectGetMaxX(boundingBox);
                maxy = cc.rectGetMaxY(boundingBox);
                first = false;
            }
            var allBones = this.getAllSubBones();
            for(var bone, i=0; i<allBones.length; i++){
                bone = allBones[i];
                var r = cc.rectApplyAffineTransform(bone.getVisibleSkinsRect(), bone.getNodeToParentTransform(bone.getRootSkeletonNode()));
                if (r.x === 0 && r.y === 0 && r.width === 0 && r.height === 0)
                    continue;

                if(first){
                    minx = cc.rectGetMinX(r);
                    miny = cc.rectGetMinY(r);
                    maxx = cc.rectGetMaxX(r);
                    maxy = cc.rectGetMaxY(r);

                    first = false;
                }else{
                    minx = Math.min(cc.rectGetMinX(r), minx);
                    miny = Math.min(cc.rectGetMinY(r), miny);
                    maxx = Math.max(cc.rectGetMaxX(r), maxx);
                    maxy = Math.max(cc.rectGetMaxY(r), maxy);
                }
            }
            boundingBox.x = minx;
            boundingBox.y = miny;
            boundingBox.width = maxx - minx;
            boundingBox.height = maxy - miny;
            return cc.rectApplyAffineTransform(boundingBox, this.getNodeToParentTransform());
        },

        // protected
        _updateVertices: function(){
            var squareVertices = this._squareVertices,
                anchorPointInPoints = this._renderCmd._anchorPointInPoints;
            if(this._rackLength != squareVertices[6].x - anchorPointInPoints.x ||
                this._rackWidth != squareVertices[3].y - anchorPointInPoints.y){
                var radiusl = this._rackLength * .5;
                var radiusw = this._rackWidth * .5;
                var radiusl_2 = radiusl * .25;
                var radiusw_2 = radiusw * .25;
                squareVertices[5].y = squareVertices[2].y = squareVertices[1].y = squareVertices[6].y
                    = squareVertices[0].x = squareVertices[4].x = squareVertices[7].x = squareVertices[3].x = .0;
                squareVertices[5].x = -radiusl; squareVertices[0].y = -radiusw;
                squareVertices[6].x =  radiusl;  squareVertices[3].y = radiusw;
                squareVertices[1].x =  radiusl_2; squareVertices[7].y = radiusw_2;
                squareVertices[2].x = - radiusl_2; squareVertices[4].y = - radiusw_2;
                for(var i=0; i<squareVertices.length; i++){
                    squareVertices[i].x += anchorPointInPoints.x;
                    squareVertices[i].y += anchorPointInPoints.y;
                }
            }
        },

        _updateAllDrawBones: function(){
            this._subDrawBones = {}; //.clear()
            for(var name in this._subBonesMap){
                var bone = this._subBonesMap[name];
                if (bone.isVisible() && bone.isDebugDrawEnabled())
                    this._subDrawBones.push(bone);
            }
            this._sortArray(this._sortedAllBones);
            this._subDrawBones = false;
        }

    });

    SkeletonNode.create = function(){
        return new SkeletonNode;
    };

    return SkeletonNode;

})();