/**
 * Created with JetBrains WebStorm.
 * User: Administrator
 * Date: 13-6-19
 * Time: 上午10:28
 * To change this template use File | Settings | File Templates.
 */

var ENABLE_PHYSICS_DETECT = false;
cc.fmodf = function (x, y) {
    while (x >= y) {
        x -= y;
    }
    return x;
};
var CC_SAFE_RELEASE = function (obj) {
    if (obj && obj.release) {
        obj.release();
    }
};

cc.isSpriteContainPoint = function (sprite, point, outPoint) {
    var p = cc.p(0, 0);
    if (outPoint) {
        p = sprite.convertToNodeSpace(point);
    }
    var s = sprite.getContentSize();
    var r = cc.rect(0, 0, s.width, s.height);
    return cc.rectContainsPoint(r, p);
};
cc.SPRITE_CONTAIN_POINT = cc.isSpriteContainPoint;
cc.SPRITE_CONTAIN_POINT_WITH_RETURN = cc.isSpriteContainPoint;

cc.extBezierTo = function (t, point1, point2, point3, point4) {
    var p = cc.p(0, 0);
    if (point3 && !point4) {
        p.x = Math.pow((1 - t), 2) * point1.x + 2 * t * (1 - t) * point2.x + Math.pow(t, 2) * point3.x;
        p.y = Math.pow((1 - t), 2) * point1.y + 2 * t * (1 - t) * point2.y + Math.pow(t, 2) * point3.y;
    }
    if (point4) {
        p.x = point1.x * Math.pow((1 - t), 3) + 3 * t * point2.x * Math.pow((1 - t), 2) + 3 * point3.x * Math.pow(t, 2) * (1 - t) + point4.x * Math.pow(t, 3);
        p.y = point1.y * Math.pow((1 - t), 3) + 3 * t * point2.y * Math.pow((1 - t), 2) + 3 * point3.y * Math.pow(t, 2) * (1 - t) + point4.y * Math.pow(t, 3);
    }
    return p;
};

cc.extCircleTo = function (t, center, radius, fromRadian, radianDif) {
    var p = cc.p(0, 0);
    p.x = center.x + radius * Math.cos(fromRadian + radianDif * t);
    p.y = center.y + radius * Math.sin(fromRadian + radianDif * t);
    return p;
};