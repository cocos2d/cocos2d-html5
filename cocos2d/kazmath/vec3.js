/**
 Copyright (c) 2008-2010 Ricardo Quesada
 Copyright (c) 2011-2012 cocos2d-x.org
 Copyright (c) 2013-2014 Chukong Technologies Inc.
 Copyright (c) 2008, Luke Benstead.
 All rights reserved.

 Redistribution and use in source and binary forms, with or without modification,
 are permitted provided that the following conditions are met:

 Redistributions of source code must retain the above copyright notice,
 this list of conditions and the following disclaimer.
 Redistributions in binary form must reproduce the above copyright notice,
 this list of conditions and the following disclaimer in the documentation
 and/or other materials provided with the distribution.

 THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
 ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
 ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

(function(cc) {
    /**
     * A 3d vector.
     * @class
     * @param {number} [x]
     * @param {number} [y]
     * @param {number} [z]
     */

    cc.math.Vec3 = cc.kmVec3 = function (x, y, z) {
        if(x && y === undefined){
            this.x = x.x;
            this.y = x.y;
            this.z = x.z;
        } else {
            this.x = x || 0;
            this.y = y || 0;
            this.z = z || 0;
        }
    };

    cc.math.vec3 = function(x, y, z){
        return new cc.math.Vec3(x, y, z);
    };

    var _p = cc.math.Vec3.prototype;

    _p.fill = function (x, y, z) {    // =cc.kmVec3Fill
        if (x && y === undefined) {
            this.x = x.x;
            this.y = x.y;
            this.z = x.z;
        } else {
            this.x = x;
            this.y = y;
            this.z = z;
        }
        return this;
    };

    _p.length = function () {     //=cc.kmVec3Length
        return Math.sqrt(cc.math.square(this.x) + cc.math.square(this.y) + cc.math.square(this.z));
    };

    _p.lengthSq = function () {   //=cc.kmVec3LengthSq
        return cc.math.square(this.x) + cc.math.square(this.y) + cc.math.square(this.z)
    };

    _p.normalize = function () {  //= cc.kmVec3Normalize
        var l = 1.0 / this.length();
        this.x *= l;
        this.y *= l;
        this.z *= l;
        return this;
    };

    _p.cross = function (vec3) {   //= cc.kmVec3Cross
        var x = this.x, y = this.y, z = this.z;
        this.x = (y * vec3.z) - (z * vec3.y);
        this.y = (z * vec3.x) - (x * vec3.z);
        this.z = (x * vec3.y) - (y * vec3.x);
        return this;
    };

    _p.dot = function (vec) {     //= cc.kmVec3Dot
        return (  this.x * vec.x + this.y * vec.y + this.z * vec.z );
    };

    _p.add = function(vec){      //= cc.kmVec3Add
        this.x += vec.x;
        this.y += vec.y;
        this.z += vec.z;
        return this;
    };

    _p.subtract = function (vec) {  // = cc.kmVec3Subtract
        this.x -= vec.x;
        this.y -= vec.y;
        this.z -= vec.z;
        return this;
    };

    _p.transform = function (mat4) {             // = cc.kmVec3Transform
        var x = this.x, y = this.y, z = this.z, mat = mat4.mat;
        this.x = x * mat[0] + y * mat[4] + z * mat[8] + mat[12];
        this.y = x * mat[1] + y * mat[5] + z * mat[9] + mat[13];
        this.z = x * mat[2] + y * mat[6] + z * mat[10] + mat[14];
        return this;
    };

    _p.transformNormal = function(mat4){
        /*
         a = (Vx, Vy, Vz, 0)
         b = (a×M)T
         Out = (bx, by, bz)
         */
        //Omits the translation, only scaling + rotating
        var x = this.x, y = this.y, z = this.z, mat = mat4.mat;
        this.x = x * mat[0] + y * mat[4] + z * mat[8];
        this.y = x * mat[1] + y * mat[5] + z * mat[9];
        this.z = x * mat[2] + y * mat[6] + z * mat[10];
        return this;
    };

    _p.transformCoord = function(mat4){        // = cc.kmVec3TransformCoord
        /*
         a = (Vx, Vy, Vz, 1)
         b = (a×M)T
         Out = 1⁄bw(bx, by, bz)
         */
        var v = new cc.math.Vec4(this.x, this.y, this.z, 1.0);
        v.transform(mat4);
        this.x = v.x / v.w;
        this.y = v.y / v.w;
        this.z = v.z / v.w;
        return this;
    };

    _p.scale = function(scale){             // = cc.kmVec3Scale
        this.x *= scale;
        this.y *= scale;
        this.z *= scale;
        return this;
    };

    _p.equals = function(vec){    // = cc.kmVec3AreEqual
        var EPSILON = cc.math.EPSILON;
        return (this.x < (vec.x + EPSILON) && this.x > (vec.x - EPSILON)) &&
            (this.y < (vec.y + EPSILON) && this.y > (vec.y - EPSILON)) &&
            (this.z < (vec.z + EPSILON) && this.z > (vec.z - EPSILON));
    };

    _p.inverseTransform = function(mat4){   //= cc.kmVec3InverseTransform
        var mat = mat4.mat;
        var v1 = new cc.math.Vec3(this.x - mat[12], this.y - mat[13], this.z - mat[14]);
        this.x = v1.x * mat[0] + v1.y * mat[1] + v1.z * mat[2];
        this.y = v1.x * mat[4] + v1.y * mat[5] + v1.z * mat[6];
        this.z = v1.x * mat[8] + v1.y * mat[9] + v1.z * mat[10];
        return this;
    };

    _p.inverseTransformNormal = function(mat4){   // = cc.kmVec3InverseTransformNormal
        var x = this.x, y = this.y, z = this.z, mat = mat4.mat;
        this.x = x * mat[0] + y * mat[1] + z * mat[2];
        this.y = x * mat[4] + y * mat[5] + z * mat[6];
        this.z = x * mat[8] + y * mat[9] + z * mat[10];
        return this;
    };

    _p.assignFrom = function(vec){
        if(!vec)
            return this;
        this.x = vec.x;
        this.y = vec.y;
        this.z = vec.z;
         return this;
    };

    cc.math.Vec3.zero = function(vec){   // = cc.kmVec3Zero
        vec.x = vec.y = vec.z = 0.0;
        return vec;
    };

    _p.toTypeArray = function(){           //cc.kmVec3ToTypeArray
        var tyArr = new Float32Array(3);
        tyArr[0] = this.x;
        tyArr[1] = this.y;
        tyArr[2] = this.z;
        return tyArr;
    };
})(cc);
