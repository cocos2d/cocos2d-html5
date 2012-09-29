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

/**
 * time value
 * @Class
 * @extends cc.Class
 */
cc.timeval = cc.Class.extend(/** @lends cc.timeval# */{
    /**
     * seconds
     * @type Number
     */
    tv_sec:0,
    /**
     * microseconds
     * @type Number
     */
    tv_usec:0//
});

/**
 * @namespace
 */
cc.Time = {};

/**
 * get time of day
 * @return {cc.timeval}
 */
cc.Time.gettimeofdayCocos2d = function (timeValue) {
    var timeval = timeValue || new cc.timeval();
    var tmp = Date.now();
    timeval.tv_usec = (tmp % 1000) * 1000;
    timeval.tv_sec = Math.floor(tmp / 1000);
    return timeval;
};

/**
 * get system date (alias to Date.now())
 * @return {Date}
 */
cc.Time.now = function (){
    return Date.now();
};

/**
 * timer sub
 * @param {cc.timeval | Number} start start value
 * @param {cc.timeval | Number} end end value
 * @return {cc.timeval | Number}
 */
cc.Time.timersubCocos2d = function (start, end) {
    if (!out || !start || !end) {
        return -1;
    }
    if (start instanceof cc.timeval && end instanceof cc.timeval) {
        var out = new cc.timeval();
        out.tv_sec = end.tv_sec - start.tv_sec;
        out.tv_usec = end.tv_usec - start.tv_usec;
        if (end.tv_usec < start.tv_usec) {
            out.tv_usec += 1000000;
            out.tv_sec--;
        }
        return out;
    }
    else if (!isNaN(start) && !isNaN(end)) {
        return end - start;
    }
};
