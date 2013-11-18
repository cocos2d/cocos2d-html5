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

ccs.TweenType = {
    tweenEasingMin:-1,
    linear:0,

    sineEaseIn:1,
    sineEaseOut:2,
    sineEaseInOut:3,

    quadEaseIn:4,
    quadEaseOut:5,
    quadEaseInOut:6,

    cubicEaseIn:7,
    cubicEaseOut:8,
    cubicEaseInOut:9,

    quartEaseIn:10,
    quartEaseOut:11,
    quartEaseInOut:12,

    quintEaseIn:13,
    quintEaseOut:14,
    quintEaseInOut:15,

    expoEaseIn:16,
    expoEaseOut:17,
    expoEaseInOut:18,

    circEaseIn:19,
    eircEaseOut:20,
    circEaseInOut:21,

    elasticEaseIn:22,
    elasticEaseOut:23,
    elasticEaseInOut:24,

    backEaseIn:25,
    backEaseOut:26,
    backEaseInOut:27,

    bounceEaseIn:28,
    bounceEaseOut:29,
    bounceEaseInOut:30,

    tweenEasingMax:10000
};

ccs.TweenFunction = ccs.TweenFunction || {};

ccs.TweenFunction.tweenTo = function (from, change, time, duration, tweenType) {
    var delta = 0;

    switch (tweenType) {
        case ccs.TweenType.linear:
            delta = this.linear(time, 0, 1, duration);
            break;

        case ccs.TweenType.sineEaseIn:
            delta = this.sineEaseIn(time, 0, 1, duration);
            break;
        case ccs.TweenType.sineEaseOut:
            delta = this.sineEaseOut(time, 0, 1, duration);
            break;
        case ccs.TweenType.sineEaseInOut:
            delta = this.sineEaseInOut(time, 0, 1, duration);
            break;

        case ccs.TweenType.quadEaseIn:
            delta = this.quadEaseIn(time, 0, 1, duration);
            break;
        case ccs.TweenType.quadEaseOut:
            delta = this.quadEaseOut(time, 0, 1, duration);
            break;
        case ccs.TweenType.quadEaseInOut:
            delta = this.quadEaseInOut(time, 0, 1, duration);
            break;

        case ccs.TweenType.cubicEaseIn:
            delta = this.cubicEaseIn(time, 0, 1, duration);
            break;
        case ccs.TweenType.cubicEaseOut:
            delta = this.cubicEaseOut(time, 0, 1, duration);
            break;
        case ccs.TweenType.cubicEaseInOut:
            delta = this.cubicEaseInOut(time, 0, 1, duration);
            break;

        case ccs.TweenType.quartEaseIn:
            delta = this.quartEaseIn(time, 0, 1, duration);
            break;
        case ccs.TweenType.quartEaseOut:
            delta = this.quartEaseOut(time, 0, 1, duration);
            break;
        case ccs.TweenType.quartEaseInOut:
            delta = this.quartEaseInOut(time, 0, 1, duration);
            break;

        case ccs.TweenType.quintEaseIn:
            delta = this.quintEaseIn(time, 0, 1, duration);
            break;
        case ccs.TweenType.quintEaseOut:
            delta = this.quintEaseOut(time, 0, 1, duration);
            break;
        case ccs.TweenType.quintEaseInOut:
            delta = this.quintEaseInOut(time, 0, 1, duration);
            break;

        case ccs.TweenType.expoEaseIn:
            delta = this.expoEaseIn(time, 0, 1, duration);
            break;
        case ccs.TweenType.expoEaseOut:
            delta = this.expoEaseOut(time, 0, 1, duration);
            break;
        case ccs.TweenType.expoEaseInOut:
            delta = this.expoEaseInOut(time, 0, 1, duration);
            break;

        case ccs.TweenType.circEaseIn:
            delta = this.circEaseIn(time, 0, 1, duration);
            break;
        case ccs.TweenType.eircEaseOut:
            delta = this.circEaseOut(time, 0, 1, duration);
            break;
        case ccs.TweenType.circEaseInOut:
            delta = this.circEaseInOut(time, 0, 1, duration);
            break;

        case ccs.TweenType.elasticEaseIn:
            delta = this.elasticEaseIn(time, 0, 1, duration);
            break;
        case ccs.TweenType.elasticEaseOut:
            delta = this.elasticEaseOut(time, 0, 1, duration);
            break;
        case ccs.TweenType.elasticEaseInOut:
            delta = this.elasticEaseInOut(time, 0, 1, duration);
            break;
        case ccs.TweenType.backEaseIn:
            delta = this.backEaseIn(time, 0, 1, duration);
            break;
        case ccs.TweenType.backEaseOut:
            delta = this.backEaseOut(time, 0, 1, duration);
            break;
        case ccs.TweenType.backEaseInOut:
            delta = this.backEaseInOut(time, 0, 1, duration);
            break;

        case ccs.TweenType.bounceEaseIn:
            delta = this.bounceEaseIn(time, 0, 1, duration);
            break;
        case ccs.TweenType.bounceEaseOut:
            delta = this.bounceEaseOut(time, 0, 1, duration);
            break;
        case ccs.TweenType.bounceEaseInOut:
            delta = this.bounceEaseInOut(time, 0, 1, duration);
            break;

        default:
            delta = this.sineEaseInOut(time, 0, 1, duration);
            break;
    }

    return delta;
};

ccs.TweenFunction.linear = function (t, b, c, d) {
    return c * t / d + b;
};

ccs.TweenFunction.quadEaseIn = function (t, b, c, d) {
    return c * (t /= d) * t + b;
};
ccs.TweenFunction.quadEaseOut = function (t, b, c, d) {
    return -c * (t /= d) * (t - 2) + b;
};
ccs.TweenFunction.quadEaseInOut = function (t, b, c, d) {
    t = t/d*2;
    if (t < 1)
        return c / 2 * t * t + b;
    return -c / 2 * ((--t) * (t - 2) - 1) + b;
};

ccs.TweenFunction.cubicEaseIn = function (t, b, c, d) {
    return c * (t /= d) * t * t + b;
};
ccs.TweenFunction.cubicEaseOut = function (t, b, c, d) {
    return c * (( t = t / d - 1) * t * t + 1) + b;
};
ccs.TweenFunction.cubicEaseInOut = function (t, b, c, d) {
    t = t/d*2;
    if (t < 1)
        return c / 2 * t * t * t + b;
    return c / 2 * ((t -= 2) * t * t + 2) + b;
};

ccs.TweenFunction.quartEaseIn = function (t, b, c, d) {
    return c * (t /= d) * t * t * t + b;
};
ccs.TweenFunction.quartEaseOut = function (t, b, c, d) {
    return -c * (( t = t / d - 1) * t * t * t - 1) + b;
};
ccs.TweenFunction.quartEaseInOut = function (t, b, c, d) {
    t = t/d*2;
    if (t < 1)
        return c / 2 * t * t * t * t + b;
    return -c / 2 * ((t -= 2) * t * t * t - 2) + b;
};

ccs.TweenFunction.quintEaseIn = function (t, b, c, d) {
    return c * (t /= d) * t * t * t * t + b;
};
ccs.TweenFunction.quintEaseOut = function (t, b, c, d) {
    return c * (( t = t / d - 1) * t * t * t * t + 1) + b;
};
ccs.TweenFunction.quintEaseInOut = function (t, b, c, d) {
    t = t/d*2;
    if (t < 1)
        return c / 2 * t * t * t * t * t + b;
    return c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
};

ccs.TweenFunction.sineEaseIn = function (t, b, c, d) {
    return -c * Math.cos(t / d * (cc.PI / 2)) + c + b;
};
ccs.TweenFunction.sineEaseOut = function (t, b, c, d) {
    return c * Math.sin(t / d * (cc.PI / 2)) + b;
};
ccs.TweenFunction.sineEaseInOut = function (t, b, c, d) {
    return -c / 2 * (Math.cos(cc.PI * t / d) - 1) + b;
};

ccs.TweenFunction.expoEaseIn = function (t, b, c, d) {
    return (t == 0) ? b : c * Math.pow(2, 10 * (t / d - 1)) + b;
};
ccs.TweenFunction.expoEaseOut = function (t, b, c, d) {
    return (t == d) ? b + c : c * (-Math.pow(2, -10 * t / d) + 1) + b;
};
ccs.TweenFunction.expoEaseInOut = function (t, b, c, d) {
    if (t == 0)
        return b;
    if (t == d)
        return b + c;
    if ((t /= d / 2) < 1)
        return c / 2 * Math.pow(2, 10 * (t - 1)) + b;
    return c / 2 * (-Math.pow(2, -10 * --t) + 2) + b;
};

ccs.TweenFunction.circEaseIn = function (t, b, c, d) {
    return -c * (Math.sqrt(1 - (t /= d) * t) - 1) + b;
};
ccs.TweenFunction.circEaseOut = function (t, b, c, d) {
    return c * Math.sqrt(1 - ( t = t / d - 1) * t) + b;
};
ccs.TweenFunction.circEaseInOut = function (t, b, c, d) {
    t = t / d * 2;
    if (t < 1)
        return -c / 2 * (Math.sqrt(1 - t * t) - 1) + b;
    return c / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1) + b;
};

ccs.TweenFunction.elasticEaseIn = function (t, b, c, d, a, p) {
    var s = 0;
    if (t == 0)
        return b;
    if ((t /= d) == 1)
        return b + c;
    if (!p)
        p = d * .3;
    if (!a || a < Math.abs(c)) {
        a = c;
        s = p / 4;
    } else
        s = p / (2 * cc.PI) * Math.asin(c / a);
    return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * cc.PI) / p)) + b;
};
ccs.TweenFunction.elasticEaseOut = function (t, b, c, d, a, p) {
    var s = 0;
    if (t == 0)
        return b;
    if ((t /= d) == 1)
        return b + c;
    if (!p)
        p = d * .3;
    if (!a || a < Math.abs(c)) {
        a = c;
        s = p / 4;
    } else
        s = p / (2 * cc.PI) * Math.asin(c / a);
    return (a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * cc.PI) / p) + c + b);
};
ccs.TweenFunction.elasticEaseInOut = function (t, b, c, d, a, p) {
    var s = 0;
    if (t == 0)
        return b;
    t = t / d * 2;
    if (t == 2)
        return b + c;
    if (!p)
        p = d * (.3 * 1.5);
    if (!a || a < Math.abs(c)) {
        a = c;
        s = p / 4;
    } else
        s = p / (2 * cc.PI) * Math.asin(c / a);
    if (t < 1)
        return -.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * cc.PI) / p)) + b;
    return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * d - s) * (2 * cc.PI) / p) * .5 + c + b;
};

ccs.TweenFunction.backEaseIn = function (t, b, c, d, s) {
    if (s == 0)
        s = 1.70158;
    return c * (t /= d) * t * ((s + 1) * t - s) + b;
};
ccs.TweenFunction.backEaseOut = function (t, b, c, d, s) {
    if (s == 0)
        s = 1.70158;
    return c * (( t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
};
ccs.TweenFunction.backEaseInOut = function (t, b, c, d, s) {
    if (s == 0)
        s = 1.70158;
    if ((t /= d / 2) < 1)
        return c / 2 * (t * t * (((s *= (1.525)) + 1) * t - s)) + b;
    return c / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2) + b;
};

ccs.TweenFunction.bounceEaseIn = function (t, b, c, d) {
    return c - this.bounceEaseOut(d - t, 0, c, d) + b;
};

ccs.TweenFunction.bounceEaseOut = function (t, b, c, d) {
    if ((t /= d) < (1 / 2.75)) {
        return c * (7.5625 * t * t) + b;
    } else if (t < (2 / 2.75)) {
        return c * (7.5625 * (t -= (1.5 / 2.75)) * t + .75) + b;
    } else if (t < (2.5 / 2.75)) {
        return c * (7.5625 * (t -= (2.25 / 2.75)) * t + .9375) + b;
    } else {
        return c * (7.5625 * (t -= (2.625 / 2.75)) * t + .984375) + b;
    }
};

ccs.TweenFunction.bounceEaseInOut = function (t, b, c, d) {
    if (t < d / 2)
        return this.bounceEaseIn(t * 2, 0, c, d) * .5 + b;
    else
        return this.bounceEaseOut(t * 2 - d, 0, c, d) * .5 + c * .5 + b;
};