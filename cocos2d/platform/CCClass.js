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
/* Managed JavaScript Inheritance
 * Based on John Resig's Simple JavaScript Inheritance http://ejohn.org/blog/simple-javascript-inheritance/
 * MIT Licensed.
 */

/**
 * @namespace
 */
var cc = cc || {};

//
function ClassManager(){
    //tells own name
    return arguments.callee.name || (arguments.callee.toString()).match(/^function ([^(]+)/)[1];
}
ClassManager.id=(0|(Math.random()*998));
ClassManager.compileSuper=function(func, name, id){
    //make the func to a string
    var str = func.toString();
    //find parameters
    var pstart = str.indexOf('(');
    var pend = str.indexOf(')');
    var params = str.substring(pstart+1, pend);
    params = params.trim();

    //find function body
    var bstart = str.indexOf('{');
    var bend = str.lastIndexOf('}');
    var str = str.substring(bstart+1, bend);

    //now we have the content of the function, replace this._super
    //find this._super
    while(str.indexOf('this._super')!= -1)
    {
        var sp = str.indexOf('this._super');
        //find the first '(' from this._super)
        var bp = str.indexOf('(', sp);

        //find if we are passing params to super
        var bbp = str.indexOf(')', bp);
        var superParams = str.substring(bp+1, bbp);
        superParams = superParams.trim();
        var coma = superParams? ',':'';

        //find name of ClassManager
        var Cstr = arguments.callee.ClassManager();

        //replace this._super
        str = str.substring(0, sp)+  Cstr+'['+id+'].'+name+'.call(this'+coma+str.substring(bp+1);
    }
    return Function(params, str);
};
ClassManager.compileSuper.ClassManager = ClassManager;
ClassManager.getNewID=function(){
    return this.id++;
};


(function () {
    var initializing = false, fnTest = /\b_super\b/;
    var releaseMode = (document['ccConfig'] && document['ccConfig']['CLASS_RELEASE_MODE']) ? document['ccConfig']['CLASS_RELEASE_MODE'] : null;
    if(releaseMode)
    {
        console.log("release Mode");
    }

    /**
     * The base Class implementation (does nothing)
     * @class
     */
    cc.Class = function () {
    };

    /**
     * Create a new Class that inherits from this Class
     * @param {object} prop
     * @return {function}
     */
    cc.Class.extend = function (prop) {
        var _super = this.prototype;

        // Instantiate a base Class (but only create the instance,
        // don't run the init constructor)
        initializing = true;
        var prototype = new this();
        initializing = false;

        // The dummy Class constructor
        function Class() {
            // All construction is actually done in the init method
            if (!initializing && this.ctor)
                this.ctor.apply(this, arguments);
        }
        Class.id = ClassManager.getNewID();
        ClassManager[Class.id] = _super;
        // Copy the properties over onto the new prototype
        for (var name in prop) {
            if(releaseMode && typeof prop[name] == "function" && typeof _super[name] == "function" && fnTest.test(prop[name]))
            {
                prototype[name] = ClassManager.compileSuper(prop[name], name, Class.id);
            }
            else if(typeof prop[name] == "function" && typeof _super[name] == "function" && fnTest.test(prop[name])){
                prototype[name] = (function (name, fn) {
                    return function () {
                        var tmp = this._super;

                        // Add a new ._super() method that is the same method
                        // but on the super-Class
                        this._super = _super[name];

                        // The method only need to be bound temporarily, so we
                        // remove it when we're done executing
                        var ret = fn.apply(this, arguments);
                        this._super = tmp;

                        return ret;
                    };
                })(name, prop[name]);
            }
            else{
                prototype[name] = prop[name];
            }
        }
        prototype.__pid = Class.id;

        // Populate our constructed prototype object
        Class.prototype = prototype;

        // Enforce the constructor to be what we expect
        Class.prototype.constructor = Class;

        // And make this Class extendable
        Class.extend = arguments.callee;

        //add implementation method
        Class.implement = function (prop) {
            for (var name in prop) {
                prototype[name] = prop[name];
            }
        };
        return Class;
    };
})();

//
// Another way to subclass: Using Google Closure.
// The following code was copied + pasted from goog.base / goog.inherits
//
cc.inherits = function (childCtor, parentCtor) {
    /** @constructor */
    function tempCtor() {}
    tempCtor.prototype = parentCtor.prototype;
    childCtor.superClass_ = parentCtor.prototype;
    childCtor.prototype = new tempCtor();
    childCtor.prototype.constructor = childCtor;

    // Copy "static" method, but doesn't generate subclasses.
//  for( var i in parentCtor ) {
//      childCtor[ i ] = parentCtor[ i ];
//  }
};
cc.base = function(me, opt_methodName, var_args) {
    var caller = arguments.callee.caller;
    if (caller.superClass_) {
        // This is a constructor. Call the superclass constructor.
        ret =  caller.superClass_.constructor.apply( me, Array.prototype.slice.call(arguments, 1));
        return ret;
    }

    var args = Array.prototype.slice.call(arguments, 2);
    var foundCaller = false;
    for (var ctor = me.constructor;
        ctor; ctor = ctor.superClass_ && ctor.superClass_.constructor) {
        if (ctor.prototype[opt_methodName] === caller) {
            foundCaller = true;
        } else if (foundCaller) {
            return ctor.prototype[opt_methodName].apply(me, args);
        }
    }

    // If we did not find the caller in the prototype chain,
    // then one of two things happened:
    // 1) The caller is an instance method.
    // 2) This method was not called by the right caller.
    if (me[opt_methodName] === caller) {
        return me.constructor.prototype[opt_methodName].apply(me, args);
    } else {
        throw Error(
                    'cc.base called from a method of one name ' +
                    'to a method of a different name');
    }
};

cc.concatObjectProperties = function(dstObject, srcObject){
    if(!dstObject)
        dstObject = {};

    for(var selKey in srcObject){
        dstObject[selKey] = srcObject[selKey];
    }
    return dstObject;
};
