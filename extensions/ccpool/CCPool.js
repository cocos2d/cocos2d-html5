/****************************************************************************
 Copyright (c) 2008-2010 Ricardo Quesada
 Copyright (c) 2011-2012 cocos2d-x.org
 Copyright (c) 2013-2014 Chukong Technologies Inc.

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

var CCPool = cc.Class.extend({
    _pool: null,
    ctor: function () {
        this._pool = {};
    },

    /**
     * Put the obj in pool
     * @param obj
     */
    putInPool: function (obj) {
        if (obj instanceof cc.Node) {
            var pid = obj.constructor.prototype.__pid;
            if (!pid) {
                var desc = { writable: true, enumerable: false, configurable: true };
                desc.value = ClassManager.getNewID();
                Object.defineProperty(obj.constructor.prototype, '__pid', desc);
            }
            if (!this._pool[pid]) {
                this._pool[pid] = [];
            }
            obj.unuse();
            obj.retain();//use for jsb
            this._pool[pid].push(obj);
        }
    },

    /**
     * Check if this kind of obj has already in pool
     * @param objClass
     * @returns {boolean} if this kind of obj is already in pool return true,else return false;
     */
    hasObj: function (objClass) {
        var pid = objClass.prototype.__pid;
        var list = this._pool[pid];
        if (!list || list.length == 0) {
            return false;
        }
        return true;
    },

    /**
     * Remove the obj if you want to delete it;
     * @param obj
     */
    removeObj: function (obj) {
        var pid = obj.constructor.prototype.__pid;
        if (pid) {
            var list = this._pool[pid];
            if (list) {
                for (var i = 0; i < list.length; i++) {
                    if (obj === list[i]) {
                        obj.release()//use for jsb
                        list.splice(i, 1);
                    }
                }
            }
        }
    },

    /**
     * Get the obj from pool
     * @param args
     * @returns {*} call the reuse function an return the obj
     */
    getFromPool: function (objClass/*,args*/) {
        if (this.hasObj(objClass)) {
            var pid = objClass.prototype.__pid;
            var list = this._pool[pid];
            var args = Array.prototype.slice.call(arguments);
            args.shift();
            var obj = list.pop();
            obj.reuse.apply(obj, args);
            return obj;
        }
    },

    /**
     *  remove all objs in pool and reset the pool
     */
    drainAllPools: function () {
        for (var i in this._pool) {
            for (var j = 0; j < this._pool[i].length; j++) {
                var obj = this._pool[i][j];
                obj.release()
            }
        }
        this._pool = {};
    }
});
CCPool._instance = null;
CCPool._getInstance = function () {
    if (!CCPool._instance) {
        CCPool._instance = new CCPool();
    }
    return CCPool._instance;
}
cc.pool = CCPool._getInstance();