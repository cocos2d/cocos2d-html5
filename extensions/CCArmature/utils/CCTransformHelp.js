/**
 * Created with JetBrains WebStorm.
 * User: Administrator
 * Date: 13-6-19
 * Time: 下午2:31
 * To change this template use File | Settings | File Templates.
 */

cc.TransformHelp = {};

cc.TransformHelp.helpMatrix1 = cc.AffineTransformMake(1, 0, 0, 1, 0, 0);
cc.TransformHelp.helpMatrix2 = cc.AffineTransformMake(1, 0, 0, 1, 0, 0);
cc.TransformHelp.helpPoint1 = cc.p(0, 0);
cc.TransformHelp.helpPoint2 = cc.p(0, 0);

cc.TransformHelp.transformFromParent = function (bone, parentBone) {
    this.nodeToMatrix(bone, this.helpMatrix1);
    this.nodeToMatrix(parentBone, this.helpMatrix2);

    this.helpMatrix2 = cc.AffineTransformInvert(this.helpMatrix2);
    this.helpMatrix1 = cc.AffineTransformConcat(this.helpMatrix1, this.helpMatrix2);

    this.matrixToNode(this.helpMatrix1, bone);
};

cc.TransformHelp.nodeToMatrix = function (node, matrix) {
    matrix.a = node.scaleX * Math.cos(node.skewY);
    matrix.b = node.scaleX * Math.sin(node.skewY);
    matrix.c = node.scaleY * Math.sin(node.skewX);
    matrix.d = node.scaleY * Math.cos(node.skewX);
    matrix.tx = node.x;
    matrix.ty = node.y;
};

cc.TransformHelp.matrixToNode = function (matrix, node) {
    /*
     *  In as3 language, there is a function called "deltaTransformPoint", it calculate a point used give Transform
     *  but not used the tx, ty value. we simulate the function here
     */
    this.helpPoint1.x = 0;
    this.helpPoint1.y = 1;
    this.helpPoint1 = cc.PointApplyAffineTransform(this.helpPoint1, matrix);
    this.helpPoint1.x -= matrix.tx;
    this.helpPoint1.y -= matrix.ty;

    this.helpPoint2.x = 1;
    this.helpPoint2.y = 0;
    this.helpPoint2 = cc.PointApplyAffineTransform(this.helpPoint2, matrix);
    this.helpPoint2.x -= matrix.tx;
    this.helpPoint2.y -= matrix.ty;

    node.skewX = -(Math.atan2(this.helpPoint1.y, this.helpPoint1.x) - 1.5707964); //todo
    //node.skewX = -Math.atan2(this.helpPoint2.y, this.helpPoint2.x);
    node.skewY = Math.atan2(this.helpPoint2.y, this.helpPoint2.x);
    node.scaleX = Math.sqrt(matrix.a * matrix.a + matrix.b * matrix.b);
    node.scaleY = Math.sqrt(matrix.c * matrix.c + matrix.d * matrix.d);
    node.x = matrix.tx;
    node.y = matrix.ty;
};
cc.TransformHelp.nodeConcat = function (target, source) {
    target.x += source.x;
    target.y += source.y;
    target.skewX += source.skewX;
    target.skewY += source.skewY;
    target.scaleX += source.scaleX;
    target.scaleY += source.scaleY;
};