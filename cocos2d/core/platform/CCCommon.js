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
 * copy an new object
 * @function
 * @param {object|Array} obj source object
 * @return {Array|object}
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

/**
 * Function added for JS bindings compatibility. Not needed in cocos2d-html5.
 * @function
 * @param {object} jsObj subclass
 * @param {object} superclass
 */
cc.associateWithNative = function (jsObj, superclass) {
};

/**
 * keymap
 * @example
 * //Example
 * //to mark a keydown
 * cc.keyDown[65] = true;
 * //or
 * cc.keyMap[cc.KEY.a]
 *
 * //to mark a keyup
 * do cc.keyDown[65] = false;
 *
 * //to find out if a key is down, check
 * if(cc.keyDown[65])
 * //or
 * if,(cc.keyDown[cc.KEY.space])
 * //if its undefined or false or null, its not pressed
 * @constant
 * @type object
 */
cc.KEY = {
    backspace:8,
    tab:9,
    enter:13,
    shift:16, //should use shiftkey instead
    ctrl:17, //should use ctrlkey
    alt:18, //should use altkey
    pause:19,
    capslock:20,
    escape:27,
    pageup:33,
    pagedown:34,
    end:35,
    home:36,
    left:37,
    up:38,
    right:39,
    down:40,
    insert:45,
    Delete:46,
    0:48,
    1:49,
    2:50,
    3:51,
    4:52,
    5:53,
    6:54,
    7:55,
    8:56,
    9:57,
    a:65,
    b:66,
    c:67,
    d:68,
    e:69,
    f:70,
    g:71,
    h:72,
    i:73,
    j:74,
    k:75,
    l:76,
    m:77,
    n:78,
    o:79,
    p:80,
    q:81,
    r:82,
    s:83,
    t:84,
    u:85,
    v:86,
    w:87,
    x:88,
    y:89,
    z:90,
    num0:96,
    num1:97,
    num2:98,
    num3:99,
    num4:100,
    num5:101,
    num6:102,
    num7:103,
    num8:104,
    num9:105,
    '*':106,
    '+':107,
    '-':109,
    'numdel':110,
    '/':111,
    f1:112, //f1-f12 dont work on ie
    f2:113,
    f3:114,
    f4:115,
    f5:116,
    f6:117,
    f7:118,
    f8:119,
    f9:120,
    f10:121,
    f11:122,
    f12:123,
    numlock:144,
    scrolllock:145,
    semicolon:186,
    ',':186,
    equal:187,
    '=':187,
    ';':188,
    comma:188,
    dash:189,
    '.':190,
    period:190,
    forwardslash:191,
    grave:192,
    '[':219,
    openbracket:219,
    ']':221,
    closebracket:221,
    backslash:220,
    quote:222,
    space:32
};


/**
 * Image Format:JPG
 * @constant
 * @type Number
 */
cc.FMT_JPG = 0;

/**
 * Image Format:PNG
 * @constant
 * @type Number
 */
cc.FMT_PNG = 1;

/**
 * Image Format:TIFF
 * @constant
 * @type Number
 */
cc.FMT_TIFF = 2;

/**
 * Image Format:RAWDATA
 * @constant
 * @type Number
 */
cc.FMT_RAWDATA = 3;

/**
 * Image Format:WEBP
 * @constant
 * @type Number
 */
cc.FMT_WEBP = 4;

/**
 * Image Format:UNKNOWN
 * @constant
 * @type Number
 */
cc.FMT_UNKNOWN = 5;

cc.getImageFormatByData = function (imgData) {
	// if it is a png file buffer.
	if (imgData.length > 8) {
		if (imgData[0] == 0x89
			&& imgData[1] == 0x50
			&& imgData[2] == 0x4E
			&& imgData[3] == 0x47
			&& imgData[4] == 0x0D
			&& imgData[5] == 0x0A
			&& imgData[6] == 0x1A
			&& imgData[7] == 0x0A) {
			return cc.FMT_PNG;
		}
	}

	// if it is a tiff file buffer.
	if (imgData.length > 2) {
		if ((imgData[0] == 0x49 && imgData[1] == 0x49)
			|| (imgData[0] == 0x4d && imgData[1] == 0x4d)
			|| (imgData[0] == 0xff && imgData[1] == 0xd8)) {
			return cc.FMT_TIFF;
		}
	}

	return cc.FMT_UNKNOWN;
};


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
cc.defineGetterSetter = function (proto, prop, getter, setter, getterName, setterName)
{
	if (proto.__defineGetter__) {
		getter && proto.__defineGetter__(prop, getter);
		setter && proto.__defineSetter__(prop, setter);
	}
	else if (Object.defineProperty) {
		var desc = { enumerable: false, configurable: true };
		getter && (desc.get = getter);
		setter && (desc.set = setter);
		Object.defineProperty(proto, prop, desc);
	}
	else {
		throw new Error("browser does not support getters");
		return;
	}

	if(!getterName && !setterName) {
		// Lookup getter/setter function
		var hasGetter = (getter != null), hasSetter = (setter != undefined);
		var props = Object.getOwnPropertyNames(proto);
		for (var i = 0; i < props.length; i++) {
			var name = props[i];
			if( proto.__lookupGetter__(name) || typeof proto[name] !== "function" ) continue;
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
 * copy an array's item to a new array (its performance is better than Array.slice)
 * @param {Array} arr
 * @returns {Array}
 */
cc.copyArray = function(arr){
	var i, len = arr.length, arr_clone = new Array(len);
	for (i = 0; i < len; i += 1)
		arr_clone[i] = arr[i];
	return arr_clone;
};
