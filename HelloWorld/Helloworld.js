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

var CircleSprite = cc.Sprite.extend({
    _radians:0,
    ctor:function(){
        this._super();
    },
    draw:function () {
        cc.renderContext.fillStyle = "rgba(255,255,255,1)";
        cc.renderContext.strokeStyle = "rgba(255,255,255,1)";

        if (this._radians < 0)
            this._radians = 360;
        cc.drawingUtil.drawCircle(cc.PointZero(), 30, cc.DEGREES_TO_RADIANS(this._radians), 60, true);
    },
    myUpdate:function (dt) {
        this._radians -= 6;
        //this._addDirtyRegionToDirector(this.boundingBoxToWorld());
    }
});


var Helloworld = cc.Layer.extend({
    bIsMouseDown:false,
    helloImg:null,
    helloLb:null,
    circle:null,
    pSprite:null,

    init:function () {
        var selfPointer = this;
        //////////////////////////////
        // 1. super init first
        var test = this._super();
        cc.LOG(test);
        if (!test) {
            return false;
        }

        /////////////////////////////
        // 2. add a menu item with "X" image, which is clicked to quit the program
        //    you may modify it.

        // add a "close" icon to exit the progress. it's an autorelease object
        var pCloseItem = cc.MenuItemImage.itemFromNormalImage(
            "Resources/CloseNormal.png",
            "Resources/CloseSelected.png",
            this,
            function () {
                alert("Bye Bye");
            });
        pCloseItem.setPosition(cc.canvas.width - 20, 20);
        var pMenu = cc.Menu.menuWithItems(pCloseItem, null);
        //pMenu.setPosition( cc.PointZero() );
        //this.addChild(pMenu, 1);


        /////////////////////////////
        // 3. add your codes below...
        // ask director the window size
        var size = cc.Director.sharedDirector().getWinSize();

        // add a label shows "Hello World"
        // create and initialize a label
        this.helloLb = cc.LabelTTF.labelWithString("Hello World", "Arial", 24);
        // position the label on the center of the screen
        this.helloLb.setPosition(cc.ccp(cc.Director.sharedDirector().getWinSize().width / 2, 0));
        // add the label as a child to this layer
        this.addChild(this.helloLb, 5);

        // add "HelloWorld" splash screen"
        this.pSprite = cc.Sprite.spriteWithFile("Resources/HelloWorld.png");
        this.pSprite.setPosition(cc.ccp(cc.Director.sharedDirector().getWinSize().width / 2, cc.Director.sharedDirector().getWinSize().height / 2));
        this.pSprite.setIsVisible(true);
        this.pSprite.setAnchorPoint(cc.ccp(0.5, 0.5));
        this.pSprite.setScale(0.5);
        this.pSprite.setRotation(180);
        this.addChild(this.pSprite, 0);


        var rotateToA = cc.RotateTo.actionWithDuration(2, 0);
        var scaleToA = cc.ScaleTo.actionWithDuration(2, 1, 1);

        this.pSprite.runAction(cc.Sequence.actions(rotateToA, scaleToA));

        this.circle = new CircleSprite();
        this.circle.setPosition(new cc.Point(40, 280));
        this.addChild(this.circle, 2);
        this.circle.schedule(this.circle.myUpdate, 1 / 60);

        this.helloLb.runAction(cc.MoveBy.actionWithDuration(2.5, cc.ccp(0, 280)));

        this.setIsTouchEnabled(true);
        this.adjustSizeForWindow();

        window.addEventListener("resize", function (event) {
            selfPointer.adjustSizeForWindow();
        });
        return true;
    },

    adjustSizeForWindow:function () {
        //first, make body margin go away
        var body = document.body.style;
        body.margin = "0";
        body.padding = "0";
        body.background="#000";
        //find out browser aspect ratio
        var aspect = window.innerWidth / window.innerHeight;
        var container = cc.$("#Cocos2dGameContainer");
/*        console.log(container.style.cssText);
        if(aspect >= 1.5){//if aspect is bigger than 4:3 such as 16:9
            //then the height is the limiting factor, we will set height and change the width in px
            var dcssText = "width:"+(window.innerHeight*1.5)+"px; height:100%; overflow:hidden; position:absolute; left:"+(window.innerWidth/2 - (window.innerHeight*1.5)/2)+"px;";
            container.style.cssText = dcssText;
            console.log(container);
        }*/


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
        cc.Director.sharedDirector().setContentScaleFactor(xScale);
        container.style[cc.CSS3.origin] = "0% 0%";
        container.style[cc.CSS3._trans] = cc.CSS3.Scale(xScale,xScale);
        container.style.top = cc.canvas.offsetTop+parseInt(cc.canvas.style.borderTopWidth)+"px";
        container.style.left = cc.canvas.offsetLeft+parseInt(cc.canvas.style.borderLeftWidth)+"px";
    },
    // a selector callback
    menuCloseCallback:function (pSender) {
        cc.Director.sharedDirector().end();
    },
    ccTouchesBegan:function (pTouches, pEvent) {
        this.bIsMouseDown = true;
    },
    ccTouchesMoved:function (pTouches, pEvent) {
        if (this.bIsMouseDown) {
            if (pTouches) {
                this.circle.setPosition(new cc.Point(pTouches[0].locationInView(0).x, pTouches[0].locationInView(0).y));
            }
        }
    },
    ccTouchesEnded:function (pTouches, pEvent) {
        this.bIsMouseDown = false;
    },
    ccTouchesCancelled:function (pTouches, pEvent) {
        console.log("ccTouchesCancelled");
    }
});

Helloworld.scene = function () {
    // 'scene' is an autorelease object
    var scene = cc.Scene.node();

    // 'layer' is an autorelease object
    var layer = this.node();
    scene.addChild(layer);
    return scene;
};
// implement the "static node()" method manually
Helloworld.node = function () {
    var pRet = new Helloworld();

    // Init the helloworld display layer.
    if (pRet && pRet.init()) {
        return pRet;
    }
    else {
        pRet = null;
        return null;
    }
};



