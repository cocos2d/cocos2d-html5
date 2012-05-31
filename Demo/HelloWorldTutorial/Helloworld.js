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
    isMouseDown:false,
    helloImg:null,
    helloLabel:null,
    circle:null,
    sprite:null,

    init:function () {
        var selfPointer = this;
        //////////////////////////////
        // 1. super init first
        this._super();

        /////////////////////////////
        // 2. add a menu item with "X" image, which is clicked to quit the program
        //    you may modify it.
        // ask director the window size
        var size = cc.Director.sharedDirector().getWinSize();

        // add a "close" icon to exit the progress. it's an autorelease object
        var closeItem = cc.MenuItemImage.itemFromNormalImage(
            "Resources/CloseNormal.png",
            "Resources/CloseSelected.png",
            this,
            function () {
                history.go(-1);
            });
        closeItem.setAnchorPoint(new cc.Point(0.5,0.5));

        var menu = cc.Menu.menuWithItems(closeItem, null);
        menu.setPosition( cc.PointZero() );
        this.addChild(menu, 1);
        closeItem.setPosition(new cc.Point(size.width -20 , 20));

        /////////////////////////////
        // 3. add your codes below...
        // add a label shows "Hello World"
        // create and initialize a label
        this.helloLabel = cc.LabelTTF.labelWithString("Hello World", "Arial", 38);
        // position the label on the center of the screen
        this.helloLabel.setPosition(cc.ccp(size.width / 2, 0));
        // add the label as a child to this layer
        this.addChild(this.helloLabel, 5);

        var lazyLayer = new cc.LazyLayer();
        this.addChild(lazyLayer);

        // add "HelloWorld" splash screen"
        this.sprite = cc.Sprite.spriteWithFile("Resources/HelloWorld.png");
        this.sprite.setPosition(cc.ccp(size.width / 2, size.height / 2));
        this.sprite.setScale(0.5);
        this.sprite.setRotation(180);

        lazyLayer.addChild(this.sprite, 0);

        var rotateToA = cc.RotateTo.actionWithDuration(2, 0);
        var scaleToA = cc.ScaleTo.actionWithDuration(2, 1, 1);

        this.sprite.runAction(cc.Sequence.actions(rotateToA, scaleToA));

        this.circle = new CircleSprite();
        this.circle.setPosition(new cc.Point(40, size.height - 60));
        this.addChild(this.circle, 2);
        this.circle.schedule(this.circle.myUpdate, 1 / 60);

        this.helloLabel.runAction(cc.MoveBy.actionWithDuration(2.5, cc.ccp(0, size.height - 40)));

        this.setIsTouchEnabled(true);
        this.adjustSizeForWindow();
        lazyLayer.adjustSizeForCanvas();

        window.addEventListener("resize", function (event) {
            selfPointer.adjustSizeForWindow();
        });
        return true;
    },

    adjustSizeForWindow:function () {
        var margin = document.documentElement.clientWidth - document.body.clientWidth;
        if (document.documentElement.clientWidth < cc.originalCanvasSize.width) {
            cc.canvas.width = cc.originalCanvasSize.width;
        } else {
            cc.canvas.width = document.documentElement.clientWidth - margin;
        }
        if (document.documentElement.clientHeight < cc.originalCanvasSize.height) {
            cc.canvas.height = cc.originalCanvasSize.height;
        } else {
            cc.canvas.height = document.documentElement.clientHeight - margin;
        }

        var xScale = cc.canvas.width / cc.originalCanvasSize.width;
        var yScale = cc.canvas.height / cc.originalCanvasSize.height;
        if (xScale > yScale) {
            xScale = yScale;
        }
        cc.canvas.width = cc.originalCanvasSize.width * xScale;
        cc.canvas.height = cc.originalCanvasSize.height * xScale;
        cc.renderContext.translate(0, cc.canvas.height);
        cc.renderContext.scale(xScale, xScale);
        cc.Director.sharedDirector().setContentScaleFactor(xScale);
    },
    // a selector callback
    menuCloseCallback:function (sender) {
        cc.Director.sharedDirector().end();
    },
    ccTouchesBegan:function (touches, event) {
        this.isMouseDown = true;
    },
    ccTouchesMoved:function (touches, event) {
        if (this.isMouseDown) {
            if (touches) {
                //this.circle.setPosition(new cc.Point(touches[0].locationInView(0).x, touches[0].locationInView(0).y));
            }
        }
    },
    ccTouchesEnded:function (touches, event) {
        this.isMouseDown = false;
    },
    ccTouchesCancelled:function (touches, event) {
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
    var ret = new Helloworld();

    // Init the helloworld display layer.
    if (ret && ret.init()) {
        return ret;
    }

    return null;
};



