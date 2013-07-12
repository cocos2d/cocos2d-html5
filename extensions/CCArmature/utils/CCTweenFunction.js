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

cc.TweenType = {
    TWEEN_EASING_MIN:-1,
    Linear:0,

    Sine_EaseIn:1,
    Sine_EaseInOut:2,
    Sine_EaseOut:3,


    Quad_EaseIn:4,
    Quad_EaseOut:5,
    Quad_EaseInOut:6,

    Cubic_EaseIn:7,
    Cubic_EaseOut:8,
    Cubic_EaseInOut:9,

    Quart_EaseIn:10,
    Quart_EaseOut:11,
    Quart_EaseInOut:12,

    Quint_EaseIn:13,
    Quint_EaseOut:14,
    Quint_EaseInOut:15,

    Expo_EaseIn:16,
    Expo_EaseOut:17,
    Expo_EaseInOut:18,

    Circ_EaseIn:19,
    Circ_EaseOut:20,
    Circ_EaseInOut:21,

    Elastic_EaseIn:22,
    Elastic_EaseOut:23,
    Elastic_EaseInOut:24,

    Back_EaseIn:25,
    Back_EaseOut:26,
    Back_EaseInOut:27,

    Bounce_EaseIn:28,
    Bounce_EaseOut:29,
    Bounce_EaseInOut:30,

    TWEEN_EASING_MAX:10000
};

cc.TweenFunction = cc.TweenFunction || {};

cc.TweenFunction.tweenTo = function (from, change, time, duration, tweenType) {
    var delta = 0;

    switch (tweenType) {
        case cc.TweenType.Linear:
            delta = this.linear(time, 0, 1, duration);
            break;

        case cc.TweenType.Sine_EaseIn:
            delta = this.sineEaseIn(time, 0, 1, duration);
            break;
        case cc.TweenType.Sine_EaseOut:
            delta = this.sineEaseOut(time, 0, 1, duration);
            break;
        case cc.TweenType.Sine_EaseInOut:
            delta = this.sineEaseInOut(time, 0, 1, duration);
            break;

        case cc.TweenType.Quad_EaseIn:
            delta = this.quadEaseIn(time, 0, 1, duration);
            break;
        case cc.TweenType.Quad_EaseOut:
            delta = this.quadEaseOut(time, 0, 1, duration);
            break;
        case cc.TweenType.Quad_EaseInOut:
            delta = this.quadEaseInOut(time, 0, 1, duration);
            break;

        case cc.TweenType.Cubic_EaseIn:
            delta = this.cubicEaseIn(time, 0, 1, duration);
            break;
        case cc.TweenType.Cubic_EaseOut:
            delta = this.cubicEaseOut(time, 0, 1, duration);
            break;
        case cc.TweenType.Cubic_EaseInOut:
            delta = this.cubicEaseInOut(time, 0, 1, duration);
            break;

        case cc.TweenType.Quart_EaseIn:
            delta = this.quartEaseIn(time, 0, 1, duration);
            break;
        case cc.TweenType.Quart_EaseOut:
            delta = this.quartEaseOut(time, 0, 1, duration);
            break;
        case cc.TweenType.Quart_EaseInOut:
            delta = this.quartEaseInOut(time, 0, 1, duration);
            break;

        case cc.TweenType.Quint_EaseIn:
            delta = this.quintEaseIn(time, 0, 1, duration);
            break;
        case cc.TweenType.Quint_EaseOut:
            delta = this.quintEaseOut(time, 0, 1, duration);
            break;
        case cc.TweenType.Quint_EaseInOut:
            delta = this.quintEaseInOut(time, 0, 1, duration);
            break;

        case cc.TweenType.Expo_EaseIn:
            delta = this.expoEaseIn(time, 0, 1, duration);
            break;
        case cc.TweenType.Expo_EaseOut:
            delta = this.expoEaseOut(time, 0, 1, duration);
            break;
        case cc.TweenType.Expo_EaseInOut:
            delta = this.expoEaseInOut(time, 0, 1, duration);
            break;

        case cc.TweenType.Circ_EaseIn:
            delta = this.circEaseIn(time, 0, 1, duration);
            break;
        case cc.TweenType.Circ_EaseOut:
            delta = this.circEaseOut(time, 0, 1, duration);
            break;
        case cc.TweenType.Circ_EaseInOut:
            delta = this.circEaseInOut(time, 0, 1, duration);
            break;

        case cc.TweenType.Elastic_EaseIn:
            delta = this.elasticEaseIn(time, 0, 1, duration);
            break;
        case cc.TweenType.Elastic_EaseOut:
            delta = this.elasticEaseOut(time, 0, 1, duration);
            break;
        case cc.TweenType.Elastic_EaseInOut:
            delta = this.elasticEaseInOut(time, 0, 1, duration);
            break;
        case cc.TweenType.Back_EaseIn:
            delta = this.backEaseIn(time, 0, 1, duration);
            break;
        case cc.TweenType.Back_EaseOut:
            delta = this.backEaseOut(time, 0, 1, duration);
            break;
        case cc.TweenType.Back_EaseInOut:
            delta = this.backEaseInOut(time, 0, 1, duration);
            break;

        case cc.TweenType.Bounce_EaseIn:
            delta = this.bounceEaseIn(time, 0, 1, duration);
            break;
        case cc.TweenType.Bounce_EaseOut:
            delta = this.bounceEaseOut(time, 0, 1, duration);
            break;
        case cc.TweenType.Bounce_EaseInOut:
            delta = this.bounceEaseInOut(time, 0, 1, duration);
            break;

        default:
            delta = this.sineEaseInOut(time, 0, 1, duration);
            break;
    }

    return delta;
};

cc.TweenFunction.linear = function (t, b, c, d) {
    return c * t / d + b;
};

cc.TweenFunction.quadEaseIn = function (t, b, c, d) {
    return c * (t /= d) * t + b;
};
cc.TweenFunction.quadEaseOut = function (t, b, c, d) {
    return -c * (t /= d) * (t - 2) + b;
};
cc.TweenFunction.quadEaseInOut = function (t, b, c, d) {
    if ((t /= d / 2) < 1)
        return c / 2 * t * t + b;
    return -c / 2 * ((--t) * (t - 2) - 1) + b;
};

cc.TweenFunction.cubicEaseIn = function (t, b, c, d) {
    return c * (t /= d) * t * t + b;
};
cc.TweenFunction.cubicEaseOut = function (t, b, c, d) {
    return c * (( t = t / d - 1) * t * t + 1) + b;
};
cc.TweenFunction.cubicEaseInOut = function (t, b, c, d) {
    if ((t /= d / 2) < 1)
        return c / 2 * t * t * t + b;
    return c / 2 * ((t -= 2) * t * t + 2) + b;
};

cc.TweenFunction.quartEaseIn = function (t, b, c, d) {
    return c * (t /= d) * t * t * t + b;
};
cc.TweenFunction.quartEaseOut = function (t, b, c, d) {
    return -c * (( t = t / d - 1) * t * t * t - 1) + b;
};
cc.TweenFunction.quartEaseInOut = function (t, b, c, d) {
    if ((t /= d / 2) < 1)
        return c / 2 * t * t * t * t + b;
    return -c / 2 * ((t -= 2) * t * t * t - 2) + b;
};

cc.TweenFunction.quintEaseIn = function (t, b, c, d) {
    return c * (t /= d) * t * t * t * t + b;
};
cc.TweenFunction.quintEaseOut = function (t, b, c, d) {
    return c * (( t = t / d - 1) * t * t * t * t + 1) + b;
};
cc.TweenFunction.quintEaseInOut = function (t, b, c, d) {
    if ((t /= d / 2) < 1)
        return c / 2 * t * t * t * t * t + b;
    return c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
};

cc.TweenFunction.sineEaseIn = function (t, b, c, d) {
    return -c * Math.cos(t / d * (cc.PI / 2)) + c + b;
};
cc.TweenFunction.sineEaseOut = function (t, b, c, d) {
    return c * Math.sin(t / d * (cc.PI / 2)) + b;
};
cc.TweenFunction.sineEaseInOut = function (t, b, c, d) {
    return -c / 2 * (Math.cos(cc.PI * t / d) - 1) + b;
};

cc.TweenFunction.expoEaseIn = function (t, b, c, d) {
    return (t == 0) ? b : c * Math.pow(2, 10 * (t / d - 1)) + b;
};
cc.TweenFunction.expoEaseOut = function (t, b, c, d) {
    return (t == d) ? b + c : c * (-Math.pow(2, -10 * t / d) + 1) + b;
};
cc.TweenFunction.expoEaseInOut = function (t, b, c, d) {
    if (t == 0)
        return b;
    if (t == d)
        return b + c;
    if ((t /= d / 2) < 1)
        return c / 2 * Math.pow(2, 10 * (t - 1)) + b;
    return c / 2 * (-Math.pow(2, -10 * --t) + 2) + b;
};

cc.TweenFunction.circEaseIn = function (t, b, c, d) {
    return -c * (Math.sqrt(1 - (t /= d) * t) - 1) + b;
};
cc.TweenFunction.circEaseOut = function (t, b, c, d) {
    return c * Math.sqrt(1 - ( t = t / d - 1) * t) + b;
};
cc.TweenFunction.circEaseInOut = function (t, b, c, d) {
    if ((t /= d / 2) < 1)
        return -c / 2 * (Math.sqrt(1 - t * t) - 1) + b;
    return c / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1) + b;
};

cc.TweenFunction.elasticEaseIn = function (t, b, c, d, a, p) {
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
cc.TweenFunction.elasticEaseOut = function (t, b, c, d, a, p) {
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
cc.TweenFunction.elasticEaseInOut = function (t, b, c, d, a, p) {
    var s = 0;
    if (t == 0)
        return b;
    if ((t /= d / 2) == 2)
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

cc.TweenFunction.backEaseIn = function (t, b, c, d, s) {
    if (s == 0)
        s = 1.70158;
    return c * (t /= d) * t * ((s + 1) * t - s) + b;
};
cc.TweenFunction.backEaseOut = function (t, b, c, d, s) {
    if (s == 0)
        s = 1.70158;
    return c * (( t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
};
cc.TweenFunction.backEaseInOut = function (t, b, c, d, s) {
    if (s == 0)
        s = 1.70158;
    if ((t /= d / 2) < 1)
        return c / 2 * (t * t * (((s *= (1.525)) + 1) * t - s)) + b;
    return c / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2) + b;
};

cc.TweenFunction.bounceEaseIn = function (t, b, c, d) {
    return c - this.bounceEaseOut(d - t, 0, c, d) + b;
};

cc.TweenFunction.bounceEaseOut = function (t, b, c, d) {
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

cc.TweenFunction.bounceEaseInOut = function (t, b, c, d) {
    if (t < d / 2)
        return this.bounceEaseIn(t * 2, 0, c, d) * .5 + b;
    else
        return this.bounceEaseOut(t * 2 - d, 0, c, d) * .5 + c * .5 + b;
};