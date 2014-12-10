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




var cc = cc || {};

/**
 * @namespace
 * @name ClassManager
 */
var ClassManager = {
    id : (0|(Math.random()*998)),

    instanceId : (0|(Math.random()*998)),

    compileSuper : function(func, name, id){
        //make the func to a string
        var str = func.toString();
        //find parameters
        var pstart = str.indexOf('('), pend = str.indexOf(')');
        var params = str.substring(pstart+1, pend);
        params = params.trim();

        //find function body
        var bstart = str.indexOf('{'), bend = str.lastIndexOf('}');
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

            //replace this._super
            str = str.substring(0, sp)+  'ClassManager['+id+'].'+name+'.call(this'+coma+str.substring(bp+1);
        }
        return Function(params, str);
    },

    getNewID : function(){
        return this.id++;
    },

    getNewInstanceId : function(){
        return this.instanceId++;
    }
};
ClassManager.compileSuper.ClassManager = ClassManager;

/* Managed JavaScript Inheritance
 * Based on John Resig's Simple JavaScript Inheritance http://ejohn.org/blog/simple-javascript-inheritance/
 * MIT Licensed.
 */
(function () {
    var fnTest = /\b_super\b/;
    var config = cc.game.config;
    var releaseMode = config[cc.game.CONFIG_KEY.classReleaseMode];
    if(releaseMode) {
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
     * @static
     * @param {object} props
     * @return {function}
     */
    cc.Class.extend = function (props) {
        var _super = this.prototype,
        // Instantiate a base Class (but only create the instance,
        // don't run the init constructor)
            prototype = Object.create(_super),
            classId = ClassManager.getNewID(),
        // Copy the properties over onto the new prototype. We make function
        // properties non-eumerable as this makes typeof === 'function' check
        // unneccessary in the for...in loop used 1) for generating Class()
        // 2) for cc.clone and perhaps more. It is also required to make
        // these function properties cacheable in Carakan.
            desc = { writable: true, enumerable: false, configurable: true },
            i, idx, li, prop, name, isFunc, override, hasSuperCall, supportProp,
            getter, setter, propertyName;

        ClassManager[classId] = _super;

	    prototype.__instanceId = null;

	    // The dummy Class constructor
	    function Class() {
		    this.__instanceId = ClassManager.getNewInstanceId();
		    // All construction is actually done in the init method
		    if (this.ctor)
			    this.ctor.apply(this, arguments);
	    }

	    Class.id = classId;
	    // desc = { writable: true, enumerable: false, configurable: true,
	    //          value: XXX }; Again, we make this non-enumerable.
	    desc.value = classId;
	    Object.defineProperty(prototype, '__pid', desc);

	    // Populate our constructed prototype object
	    Class.prototype = prototype;

	    // Enforce the constructor to be what we expect
	    desc.value = Class;
	    Object.defineProperty(Class.prototype, 'constructor', desc);

	    // Copy getter/setter
	    this.__getters__ && (Class.__getters__ = cc.clone(this.__getters__));
	    this.__setters__ && (Class.__setters__ = cc.clone(this.__setters__));

        for(idx = 0, li = arguments.length; idx < li; ++idx) {
            prop = arguments[idx];
            for (name in prop) {
                isFunc = (typeof prop[name] === "function");
                override = (typeof _super[name] === "function");
                hasSuperCall = fnTest.test(prop[name]);

                if (isFunc && override && hasSuperCall) {
                    desc.value = (function (name, fn) {
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
                    Object.defineProperty(prototype, name, desc);
                } else if (isFunc) {
                    desc.value = prop[name];
                    Object.defineProperty(prototype, name, desc);
                } else {
                    prototype[name] = prop[name];
                }

                if (isFunc) {
                    // Override registered getter/setter
                    if (this.__getters__ && this.__getters__[name]) {
                        propertyName = this.__getters__[name];
                        for (i in this.__setters__) {
                            if (this.__setters__[i] == propertyName) {
                                setter = i;
                                break;
                            }
                        }
                        cc.defineGetterSetter(prototype, propertyName, prop[name], prop[setter] ? prop[setter] : prototype[setter], name, setter);
                    }
                    if (this.__setters__ && this.__setters__[name]) {
                        propertyName = this.__setters__[name];
                        for (i in this.__getters__) {
                            if (this.__getters__[i] == propertyName) {
                                getter = i;
                                break;
                            }
                        }
                        cc.defineGetterSetter(prototype, propertyName, prop[getter] ? prop[getter] : prototype[getter], prop[name], getter, name);
                    }
                }
            }
        }

        // And make this Class extendable
        Class.extend = cc.Class.extend;

        //add implementation method
        Class.implement = function (prop) {
            for (name in prop) {
                prototype[name] = prop[name];
            }
        };
        return Class;
    };
})();

/**
 * Common getter setter configuration function
 * @function
 * @param {Object}   proto      A class prototype or an object to config<br/>
 * @param {String}   prop       Property name
 * @param {function} getter     Getter function for the property
 * @param {function} setter     Setter function for the property
 * @param {String}   getterName Name of getter function for the property
 * @param {String}   setterName Name of setter function for the property
 */
cc.defineGetterSetter = function (proto, prop, getter, setter, getterName, setterName){
    if (proto.__defineGetter__) {
        getter && proto.__defineGetter__(prop, getter);
        setter && proto.__defineSetter__(prop, setter);
    } else if (Object.defineProperty) {
        var desc = { enumerable: true, configurable: true };
        getter && (desc.get = getter);
        setter && (desc.set = setter);
        Object.defineProperty(proto, prop, desc);
    } else {
        throw new Error("browser does not support getters");
    }

    if(!getterName && !setterName) {
        // Lookup getter/setter function
        var hasGetter = (getter != null), hasSetter = (setter != undefined), props = Object.getOwnPropertyNames(proto);
        for (var i = 0; i < props.length; i++) {
            var name = props[i];

            if( (proto.__lookupGetter__ ? proto.__lookupGetter__(name)
                                        : Object.getOwnPropertyDescriptor(proto, name))
                || typeof proto[name] !== "function" )
                continue;

            var func = proto[name];
            if (hasGetter && func === getter) {
                getterName = name;
                if(!hasSetter || setterName) break;
            }
            if (hasSetter && func === setter) {
                setterName = name;
                if(!hasGetter || getterName) break;
            }
        }
    }

    // Found getter/setter
    var ctor = proto.constructor;
    if (getterName) {
        if (!ctor.__getters__) {
            ctor.__getters__ = {};
        }
        ctor.__getters__[getterName] = prop;
    }
    if (setterName) {
        if (!ctor.__setters__) {
            ctor.__setters__ = {};
        }
        ctor.__setters__[setterName] = prop;
    }
};

/**
 * Create a new object and copy all properties in an exist object to the new object
 * @function
 * @param {object|Array} obj The source object
 * @return {Array|object} The created object
 */
cc.clone = function (obj) {
    // Cloning is better if the new object is having the same prototype chain
    // as the copied obj (or otherwise, the cloned object is certainly going to
    // have a different hidden class). Play with C1/C2 of the
    // PerformanceVirtualMachineTests suite to see how this makes an impact
    // under extreme conditions.
    //
    // Object.create(Object.getPrototypeOf(obj)) doesn't work well because the
    // prototype lacks a link to the constructor (Carakan, V8) so the new
    // object wouldn't have the hidden class that's associated with the
    // constructor (also, for whatever reasons, utilizing
    // Object.create(Object.getPrototypeOf(obj)) + Object.defineProperty is even
    // slower than the original in V8). Therefore, we call the constructor, but
    // there is a big caveat - it is possible that the this.init() in the
    // constructor would throw with no argument. It is also possible that a
    // derived class forgets to set "constructor" on the prototype. We ignore
    // these possibities for and the ultimate solution is a standardized
    // Object.clone(<object>).
    var newObj = (obj.constructor) ? new obj.constructor : {};

    // Assuming that the constuctor above initialized all properies on obj, the
    // following keyed assignments won't turn newObj into dictionary mode
    // becasue they're not *appending new properties* but *assigning existing
    // ones* (note that appending indexed properties is another story). See
    // CCClass.js for a link to the devils when the assumption fails.
    for (var key in obj) {
        var copy = obj[key];
        // Beware that typeof null == "object" !
        if (((typeof copy) == "object") && copy &&
            !(copy instanceof cc.Node) && !(copy instanceof HTMLElement)) {
            newObj[key] = cc.clone(copy);
        } else {
            newObj[key] = copy;
        }
    }
    return newObj;
};
cc.Serializer = {
    specialCases:[],
    specialCasesMethods:[],
    compact:false,
    getMethods:function(key){
        var idx = cc.Serializer.specialCases.indexOf(key);
        if(idx !== -1)
        {
            return cc.Serializer.specialCasesMethods[idx];
        }
    },
    /**
     * add special case methods for serialization,
     * @function
     * @param {String} key
     * @param {Function} getFunc This function will be called during serialization of an object that matches the key,
     *                           This function will be called from the actual key owner,
     *                           for example, the key is "_position", and the object is a cc.Node instance, then function "this" refers to that cc.Node instance
     *                           parameter : the value of the key will be passed to the function as the only parameter
     *                           return    : function should return a formatted object ready to be serialized
     *
     *                           example   : format color to "stringify friendly" object
     *                                       function(val){return {r:val.r, g:val.g, b:val.b, a:val.a}}
     *
     *                           example   : return the children array, or do nothing if its empty
     *                                       function(){ return this._children.length? this._children : undefined; }
     *
     * @param {Function} setFunc This function will be called during re-creation of an object that matches the key,
     *                           This function will be called from the actual key owner,
     *                           This function is to process serialized object that require more than a value copy, such as children needs to be passed through .addChild()
     *                           for example, the key is "_position", and the object is a cc.Node instance, then function "this" refers to that cc.Node instance
     *                           parameter : the value of the key will be passed to the function as the only parameter
     *                           return    : void, this function
     *
     *                           example   : add Children through Node.addChild()
     *                                      function(val){
     *                                          for(var i = 0; i < val.length; i++){
     *                                              this.addChild(val[i]);
     *                                          }
     *                                      }
     */
    addMethods: function(key, getFunc, setFunc){
        cc.Serializer.specialCases.push(key);
        cc.Serializer.specialCasesMethods.push({g:getFunc,s:setFunc});
    },
    _addToStructure:function(struct, node){
        if(typeof node === "object" && node !== null){
            if(node.uid)//object is a node
            {
                if(struct.nodes[node.uid])//if already exists in struct
                {
                    if(struct.nodes[node.uid] !== node)
                    throw "duplicate node uid encountered";
                }
                else if(!struct.nodes[node.uid])//else if doesnt exists in struct, add to it
                {
                    struct.nodes[node.uid] = node;
                    var keys = Object.keys(node);
                    for(var i = 0; i < keys.length; i++)
                    {
                        var o = node[keys[i]];
                        this._addToStructure(struct, o);
                    }
                }
            }
            else if(node.length)//object is an non-empty array, then go into it
            {
                for(var i = 0; i < node.length; i++)
                {
                    var o = node[i];
                    this._addToStructure(struct, o);
                }
            }
        }
    },
    serialize:function(node){
        var structure = {
            SerializerVersion:"1.0",
            root:node.uid,
            nodes:{}
        };
        // find all nodes and add them to structure.nodes
        this._addToStructure(structure, node);
        //node is the base, build the tree based on it

//        for(var k in structure.nodes)
//        {
//            var n = structure.nodes[k];
//            structure.tree[n.uid] = [];
////            for(var j = 0; j< n._children.length; j++)
////            {
////                structure.tree[n.uid].push(n._children[j].uid);
////            }
//        }


        return JSON.stringify(structure, function(key, val){
            if(val === null || key[1] === "_"){
                return;
            }
            var special = cc.Serializer.getMethods(key);
            if(special && special.g)
            {
                return special.g.call(this,val);
            }
            if(typeof val === "object")
            {
                //if its object
                if(val.uid)
                {
                    //this is a node
                    if(this === structure.nodes)
                    {
                        // we are in the nodes, proceed to stringify
                        //copy type to local
                        val._type_ = val._type_;
                        return val;
                    }
                    else{
                        // we should not stringify this, but leave uid
                        return {ref:val.uid};
                    }
                }
                else if(val instanceof HTMLElement)
                {
                    //we don't want anything to do with htmlelement
                    return;
                }
                else if(val.toJSON)
                {
                    //this object has tojson method, so we should let it pass
                    return val;
                }
                else{
                    return val;
                }
            }
            else{
                //not an object is always a good value
                return val;
            }
        },this.compact?0:4);

//        return JSON.stringify(node, function(key, val){
//            if(val === null || key[1] == '_')
//                return undefined;
//
//            //debug - remove these when finished
//            if(val instanceof HTMLElement)
//            {
//                console.log("html",this,  key, val);
//                return undefined;
//            }
//            //end debug
//
//            var special = cc.Serializer.getMethods(key);
//            if(special && special.g)
//            {
//                return special.g.call(this,val);
//            }
//            else if(typeof val === "object" && val._type_)
//            {
//                //copy the object type to local, so it gets serialized
//                val._type_ = val._type_;
//            }
//            return val;
//        },this.compact?0:4);
    },
    _fixlinks:function(unserializedMirror, revivedNodes){
        for(var key in unserializedMirror)
        {
            var uns = unserializedMirror[key];
            if(typeof uns === "object")
            {
                if(uns.ref)
                {
                    //this is a node, make this a link to the revived Nodes
                    unserializedMirror[key] = revivedNodes[uns.ref];
                }
                else{
                    this._fixlinks(uns, revivedNodes);
                }
            }
        }
    },
    unSerialize:function(json)
    {
        var unSerializedObj = JSON.parse(json);
        //start reviving nodes
        var revivedNodes = {};
        //first revive all nodes and add them to the nodes list
        for(var uid in unSerializedObj.nodes)
        {
            var unSerializedNode = unSerializedObj.nodes[uid];
            var cls = cc.Serializer._getClass(unSerializedNode._type_);
            var revivedObj = new cls;
            revivedNodes[uid] = revivedObj;
        }
        //fix all linking issue by scanning everything recursively
        for(var uid in unSerializedObj.nodes)
        {
            this._fixlinks(unSerializedObj.nodes[uid], revivedNodes);
        }

        //try to revive the values for each node
        for(uid in revivedNodes)
        {
            var revivedObj = revivedNodes[uid];
            var keys = Object.keys(unSerializedObj.nodes[uid]);
            for(var i = 0; i < keys.length; i ++)
            {

                var key = keys[i];
                var value = unSerializedObj.nodes[uid][key];
                if(value.ref)
                {
                    value = revivedNodes[value.ref];
                }
                var reviver = this.getMethods(key);
                if(reviver){
                    reviver.s.call(revivedObj, value, revivedNodes,unSerializedObj.nodes[uid]);
                }
                else{
                    revivedObj[key] = unSerializedObj.nodes[uid][key];
                }
            }
        }

        return revivedNodes[unSerializedObj.root];


//        var specialList = [];
//        var ret = JSON.parse(json, function(key, val){
//            var special = cc.Serializer.getMethods(key);
//            if(special && special.s)
//            {
//                specialList.push({func:special.s, that:this, val:val});
//                return undefined;
//            }
//            //if we defined a type for this object then
//            if(typeof val === "object" && val._type_)
//            {
//                var cls = cc.Serializer._getClass(val._type_);
//                var ret = new cls;
//                var keys = Object.keys(val);
//                for(var i = 0; i < keys.length; i++)
//                {
//                    ret[keys[i]] = val[keys[i]];
//                }
//                return ret;
//            }
//            return val;
//        });
//        for(var i = 0; i < specialList.length; i++)
//        {
//            var o = specialList[i];
//            o.func.call(o.that, o.val, this);
//        }
//        return ret;
    },
    _getClass:function(str){
        //not using eval to prevent code injection
        var scopes = str.split(".");
        var ret = window[scopes[0]];
        for(var i = 1; i < scopes.length; i++)
        {
            if(!ret[scopes[i]]) throw "Error recreating " + str +" object, maybe it doesn't exists?";
            ret = ret[scopes[i]];
        }
        return ret;
    }
};