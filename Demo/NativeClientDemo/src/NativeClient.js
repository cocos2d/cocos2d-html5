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


//For cocos2dnacl
var cocos2dnaclModule = null;  // Global application object.
var statusText = 'NO-STATUS';

var cocos2dNaclBlock = false;
var naclResult = null;
var asyncCmd = 'cocos2dNaclAsync';
var syncCmd = 'cocos2dNaclSync';

function tickLoop() {
    if (cocos2dNaclBlock == true) {
        cc.log("Thread was blocked for nacl.");
        setTimeout(tickLoop, 10);
    } else {
        cc.log("Thread was unblock.")
    }

}
function naclCmdProcess(cmdType, cmd) {
    if (cmdType == asyncCmd) {
        cc.log("AsyncCmd result from nacl.");
        cocos2dnaclModule.postMessage(asyncCmd + ": " + "I am cocos2d.");
        return;
    } else {
        cocos2dNaclBlock = true;
        cocos2dnaclModule.postMessage(syncCmd + ": " + "I am cocos2d.");
        //tickLoop();
        return naclResult;
    }
}

// Indicate load success.
function moduleDidLoad() {
    cocos2dnaclModule = document.getElementById('cocos2dnacl');
    updateStatus('SUCCESS');
    //Send a message to the NaCl module.
    //cocos2dnaclModule.postMessage(syncCmd + "I am cocos2d.");
}

// The 'message' event handler.  This handler is fired when the NaCl module
// posts a message to the browser by calling PPB_Messaging.PostMessage()
// (in C) or pp::Instance.PostMessage() (in C++).  This implementation
// simply displays the content of the message in an alert panel.
function handleMessage(message_event) {
    if (message_event.data.search(syncCmd) >= 0) {
        cocos2dNaclBlock = false;
        naclResult = message_event.data;

    } else {
        alert(message_event.data + "handleMessage.");
    }
}

// If the page loads before the Native Client module loads, then set the
// status message indicating that the module is still loading.  Otherwise,
// do not change the status message.
function pageDidLoad() {
    if (cocos2dnaclModule == null) {
        updateStatus('LOADING...');
    } else {
        // It's possible that the Native Client module onload event fired
        // before the page's onload event.  In this case, the status message
        // will reflect 'SUCCESS', but won't be displayed.  This call will
        // display the current message.
        updateStatus();
    }
}

// Set the global status message.  If the element with id 'statusField'
// exists, then set its HTML to the status message as well.
// opt_message The message test.  If this is null or undefined, then
// attempt to set the element with id 'statusField' to the value of
// |statusText|.
function updateStatus(opt_message) {
    if (opt_message)
        statusText = opt_message;
    var statusField = document.getElementById('status_field');
    if (statusField) {
        statusField.innerHTML = statusText;
    }
}


var g_ressources = [
    {src:"res/HelloWorld.png"},
    {src:"res/CloseNormal.png"},
    {src:"res/CloseSelected.png"}
];



var CircleSprite = cc.Sprite.extend({
    _radians:0,
    draw:function () {
        cc.renderContext.fillStyle = "rgba(255,255,255,1)";
        cc.renderContext.strokeStyle = "rgba(255,255,255,1)";

        if (this._radians < 0)
            this._radians = 360;
        cc.drawingUtil.drawCircle(cc.PointZero(), 30, cc.DEGREES_TO_RADIANS(this._radians), 60, true);
    },
    myUpdate:function (dt) {
        this._radians -= 6;
    }
});

var Helloworld = cc.Layer.extend({
    isMouseDown:false,
    helloImg:null,
    helloLb:null,
    circle:null,
    sprite:null,
    // Here's a difference. Method 'init' in cocos2d-x returns bool, instead of returning 'id' in cocos2d-iphone
    init:function () {
        var selfPointer = this;
        //////////////////////////////
        // 1. super init first
        this._super();

        /////////////////////////////
        // 2. add a menu item with "X" image, which is clicked to quit the program
        //    you may modify it.

        // add a "close" icon to exit the progress. it's an autorelease object
        var closeItem = cc.MenuItemImage.create(
            "res/CloseNormal.png",
            "res/CloseSelected.png",
            function () {
                alert("Bye Bye");
            },this);
        closeItem.setPosition(cc.canvas.width - 20, 20);
        var menu = cc.Menu.create(closeItem, null);

        /*
         var closeItem = cc.MenuItemImage.create(
         "CloseNormal.png",
         "CloseSelected.png",
         this,
         cc.menu_selector(Helloworld.menuCloseCallback) );
         closeItem.setPosition( cc.p(cc.Director.getInstance().getWinSize().width - 20, 20) );

         // create menu, it's an autorelease object
         var menu = cc.Menu.create(closeItem, null);
         menu.setPosition( cc.PointZero() );
         this.addChild(menu, 1);
         */
        /////////////////////////////
        // 3. add your codes below...

        // add a label shows "Hello World"
        // create and initialize a label
        //var pLabel = cc.LabelTTF.create("Hello World", "Arial", 24);
        // ask director the window size
        var size = cc.Director.getInstance().getWinSize();

        // position the label on the center of the screen
        //pLabel.setPosition( cc.p(size.width / 2, size.height - 50) );

        // add the label as a child to this layer
        //this.addChild(pLabel, 1);

        // add "HelloWorld" splash screen"
        /*******************
         var sprite = cc.Sprite.create("HelloWorld.png");

         // position the sprite on the center of the screen
         sprite.setPosition( cc.p(size.width/2, size.height/2) );

         // add the sprite as a child to this layer
         this.addChild(sprite, 0);
         *******************/
            //var helloSprite = cc.Sprite.create("helloworld.png");
            //this.addChild(helloSprite,0);

        this.helloLb = cc.LabelTTF.create("Hello World", "Arial", 24);
        this.helloLb.setPosition(cc.p(cc.Director.getInstance().getWinSize().width / 2, 0));
        this.addChild(this.helloLb, 5);

        this.sprite = cc.Sprite.create("res/HelloWorld.png");
        this.sprite.setPosition(cc.p(cc.Director.getInstance().getWinSize().width / 2, cc.Director.getInstance().getWinSize().height / 2));
        this.sprite.setVisible(true);
        this.sprite.setAnchorPoint(cc.p(0.5, 0.5));
        this.sprite.setScale(0.5);
        //this.sprite.setRotation(180);
        //this.sprite.setFlipY(true);
        this.addChild(this.sprite, 0);
        //this.sprite.setColor(new cc.Color3B(255,128,128));

        var rotateToA = cc.RotateTo.create(2, 0);
        var scaleToA = cc.ScaleTo.create(2, 1, 1);
        //this.sprite.setTexture(this.waveImageByCanvas(this.sprite._originalTexture,50));
        this.sprite.runAction(cc.Sequence.create(rotateToA, scaleToA));
        //this.schedule(this.waveSprite,0.3);

        this.circle = new CircleSprite();
        this.circle.setPosition(cc.p(40, 280));
        this.addChild(this.circle, 2);
        this.circle.schedule(this.circle.myUpdate, 1 / 60);

        this.helloLb.runAction(cc.MoveBy.create(2.5, cc.p(0, 280)));

        this.setTouchEnabled(true);
        //this.adjustSizeForWindow();

        window.addEventListener("resize", function (event) {
            //selfPointer.adjustSizeForWindow();
        });

        var listener = document.getElementById('listener');
        listener.addEventListener('message', handleMessage, true);
        pageDidLoad();
        moduleDidLoad();

        naclCmdProcess(asyncCmd, "I am cocos2d.");
        //var testValue = naclCmdProcess(syncCmd, "I am cocos2d.");
        //alert(testValue);

        return true;
    },
    waveDistance:0,
    waveSprite:function (dt) {
        this.waveDistance += 5;
        this.sprite.setTexture(this.waveImageByCanvas(this.sprite._originalTexture, this.waveDistance));
    },
    waveImageByCanvas:function (sourceImage, t) {
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');
        var destCanvas = document.createElement('canvas');
        var destCtx = destCanvas.getContext('2d');
        canvas.width = sourceImage.width;
        canvas.height = sourceImage.height;
        destCanvas.width = sourceImage.width + 50;
        destCanvas.height = sourceImage.height;
        ctx.drawImage(sourceImage, 0, 0);
        for (var i = 0; i < sourceImage.height; i++) {
            destCtx.putImageData(ctx.getImageData(20, i + Math.sin(t / 30 + i / 30) * i / 10, sourceImage.width, 1), Math.sin(t / 30 + i / 30) * i / 10, i);
        }
        var cuttedImage = new Image();
        cuttedImage.src = destCanvas.toDataURL();
        return cuttedImage;
    },

    adjustSizeForWindow:function () {
        var margin = document.documentElement.clientWidth - document.body.clientWidth;
        if (document.documentElement.clientWidth < 480) {
            cc.canvas.width = 480;
        } else {
            cc.canvas.width = document.documentElement.clientWidth - margin;
        }

        if (document.documentElement.clientHeight < 320) {
            cc.canvas.height = 320;
        } else {
            cc.canvas.height = document.documentElement.clientHeight - margin;
        }

        var xScale = cc.canvas.width / 480;
        var yScale = cc.canvas.height / 320;
        if (xScale > yScale) {
            xScale = yScale;
        }
        cc.canvas.width = 480 * xScale;
        cc.canvas.height = 320 * xScale;
        cc.renderContext.translate(0, cc.canvas.height);
        cc.renderContext.scale(xScale, xScale);
        cc.Director.getInstance().setContentScaleFactor(xScale);
    },
    // a selector callback
    menuCloseCallback:function (sender) {
        cc.Director.getInstance().end();
    },
    onTouchesBegan:function (touches, event) {
        this.isMouseDown = true;
    },
    onTouchesMoved:function (touches, event) {
        if (this.isMouseDown) {
            if (touches) {
                this.circle.setPosition(cc.p(touches[0].getLocation().x, touches[0].getLocation().y));
            }
        }
    },
    onTouchesEnded:function (touches, event) {
        this.isMouseDown = false;
    },
    onTouchesCancelled:function (touches, event) {
        console.log("onTouchesCancelled");
    }
});
var HelloWorldScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new Helloworld();
        this.addChild(layer);
        layer.init();
    }
});
