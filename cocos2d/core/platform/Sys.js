/****************************************************************************

 http://www.cocos2d-html5.org
 http://www.cocos2d-iphone.org
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

var sys = sys || {};

/** LocalStorage is a local storage component.
*/
try{
	sys.localStorage = window.localStorage;
	window.localStorage.setItem("storage", "");
	window.localStorage.removeItem("storage");

}catch(e){

	if( e.name === "SECURITY_ERR" || e.name === "QuotaExceededError" ) {
		console.log("Warning: localStorage isn't enabled. Please confirm browser cookie or privacy option");
	}
	sys.localStorage = function(){};
}

/** Capabilities
*/
Object.defineProperties(sys,
{
	capabilities : {
		get : function(){
			var capabilities = {"canvas":true};

			// if (window.DeviceOrientationEvent!==undefined || window.OrientationEvent!==undefined)
			//   capabilities["accelerometer"] = true;
            if(cc.Browser.supportWebGL)
                capabilities["opengl"] = true;

			if( document.documentElement['ontouchstart'] !== undefined || window.navigator.msPointerEnabled)
				capabilities["touches"] = true;

			else if( document.documentElement['onmouseup'] !== undefined )
				capabilities["mouse"] = true;

			if( document.documentElement['onkeyup'] !== undefined )
				capabilities["keyboard"] = true;

            if(window.DeviceMotionEvent || window.DeviceOrientationEvent)
                capabilities["accelerometer"] = true;

			return capabilities;
        },
		enumerable : true,
		configurable : true
	},
	os : {
		get : function() {
			var iOS = ( navigator.userAgent.match(/(iPad|iPhone|iPod)/i) ? true : false );
			var isAndroid = navigator.userAgent.match(/android/i) || navigator.platform.match(/android/i) ? true : false;
			var OSName=navigator.appVersion;
			if (navigator.appVersion.indexOf("Win")!=-1)
				OSName="Windows";
			else if( iOS )
				OSName = "iOS";
			else if (navigator.appVersion.indexOf("Mac")!=-1)
				OSName="OS X";
			else if (navigator.appVersion.indexOf("X11")!=-1)
				OSName="UNIX";
			else if (navigator.appVersion.indexOf("Linux")!=-1)
				OSName="Linux";
			else if( isAndroid )
				OSName = "Android";
			return OSName;
		},
		enumerable : true,
		configurable : true
	},
	platform : {
		get : function(){
			return "browser";
		},
		enumerable : true,
		configurable : true
	},
	version : {
		get : function(){
			return cc.ENGINE_VERSION;
		},
		enumerable : true,
		configurable : true
	}
});

// Forces the garbage collector
sys.garbageCollect = function() {
	// N/A in cocos2d-html5
};

// Dumps rooted objects
sys.dumpRoot = function() {
	// N/A in cocos2d-html5
};

// restarts the JS VM
sys.restartVM = function() {
	// N/A in cocos2d-html5
};
