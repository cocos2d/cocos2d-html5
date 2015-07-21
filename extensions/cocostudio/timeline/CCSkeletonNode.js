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
        _suitMap: null,

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
            BoneNode.prototype.ctor.call(this);
            this._subBonesMap = {};

            this._anchorPoint = type.p(.5, .5);
            this._rackLength = this._rackWidth = 20;
            this._updateVertices();
            this._rootSkeleton = this;
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

        addSuitInfo: function(suitName, boneSkinNameMap){
            this._suitMap[suitName] = boneSkinNameMap;
        },

        addSkinGroup: function(groupName, boneSkinNameMap){
            //todo _skinGroupMap
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
                var r = cc.rectApplyAffineTransform(bone.getVisibleSkinsRect(), bone.getBoneToSkeletonAffineTransform());
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
            return cc.rectApplyAffineTransform(boundingBox, this.getNodeToParentAffineTransform());
        },

        // protected
        _updateVertices: function(){
            if(this._rackLength != this._squareVertices[6].x || this._rackWidth != this._squareVertices[3].y){
                var radiusl = this._rackLength * .5;
                var radiusw = this._rackWidth * .5;
                var radiusl_2 = radiusl * .25;
                var radiusw_2 = radiusw * .25;
                this._squareVertices[0].x = this._squareVertices[4].x = this._squareVertices[7].x = this._squareVertices[3].x = radiusl;
                this._squareVertices[5].y = this._squareVertices[2].y = this._squareVertices[1].y = this._squareVertices[6].y = radiusw;
                this._squareVertices[6].x = this._rackLength;  this._squareVertices[3].y = this._rackWidth;
                this._squareVertices[1].x = radiusl + radiusl_2; this._squareVertices[7].y = radiusw + radiusw_2;
                this._squareVertices[2].x = radiusl - radiusl_2; this._squareVertices[4].y = radiusw - radiusw_2;
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

        //_batchDrawAllSubBones
    });

    SkeletonNode.create = function(){
        return new SkeletonNode;
    };

    return SkeletonNode;

})();