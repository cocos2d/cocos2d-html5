/****************************************************************************
 Copyright (c) 2010-2012 cocos2d-x.org
 Copyright (c) 2008-2010 Ricardo Quesada
 Copyright (c) 2011      Zynga Inc.

 http://www.cocos2d-x.org

 Created by JetBrains WebStorm.
 User: wuhao
 Date: 12-3-8

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
    draw:function(){
        cc.renderContext.fillStyle = "rgba(255,255,255,1)";
        cc.renderContext.strokeStyle = "rgba(255,255,255,1)";
        //gameContext.clearRect(0,0,480,320);

        //var points = [new cc.Point(20,20),new cc.Point(300,100),new cc.Point(400,350),new cc.Point(100,400)];
        //tools.drawPoly(points,3,true,false);

        //tools.drawLine(new cc.Point(20,50),new cc.Point(300,350));
        //tools.drawPoint(new cc.Point(200,100));
        //tools.drawImage(helloImg, new cc.Point(0,0));

        this._radians += 6;
        if(this._radians > 360)
            this._radians = 0;
        cc.drawingUtil.drawCircle(new cc.Point(40,280),30,cc.DEGREES_TO_RADIANS(this._radians),60,false);

        //tools.drawQuadBezier(new cc.Point(30,20),new cc.Point(150,20),new cc.Point(50,300),50);
        //tools.drawCubicBezier(new cc.Point(30,50),new cc.Point(150,20),new cc.Point(350,120),new cc.Point(150,300),50);
    }
});

var Helloworld = cc.Layer.extend({
    helloImg:null,
    // Here's a difference. Method 'init' in cocos2d-x returns bool, instead of returning 'id' in cocos2d-iphone
    init: function()
    {
        //////////////////////////////
        // 1. super init first
        var test = this._super();
        cc.LOG(test);
        if ( !test )
        {

            return false;
        }

        this.helloImg = new Image();
        this.helloImg.src = "helloworld.png";

        /////////////////////////////
        // 2. add a menu item with "X" image, which is clicked to quit the program
        //    you may modify it.

        // add a "close" icon to exit the progress. it's an autorelease object
        /*
        var pCloseItem = cc.MenuItemImage.itemFromNormalImage(
            "CloseNormal.png",
            "CloseSelected.png",
            this,
            cc.menu_selector(Helloworld.menuCloseCallback) );
        pCloseItem.setPosition( cc.ccp(cc.Director.sharedDirector().getWinSize().width - 20, 20) );

        // create menu, it's an autorelease object
        var pMenu = cc.Menu.menuWithItems(pCloseItem, null);
        pMenu.setPosition( cc.PointZero );
        this.addChild(pMenu, 1);
        */
        /////////////////////////////
        // 3. add your codes below...

        // add a label shows "Hello World"
        // create and initialize a label
        //var pLabel = cc.LabelTTF.labelWithString("Hello World", "Arial", 24);
        // ask director the window size
        var size = cc.Director.sharedDirector().getWinSize();

        // position the label on the center of the screen
        //pLabel.setPosition( cc.ccp(size.width / 2, size.height - 50) );

        // add the label as a child to this layer
        //this.addChild(pLabel, 1);

        // add "HelloWorld" splash screen"
        /*******************
        var pSprite = cc.Sprite.spriteWithFile("HelloWorld.png");

        // position the sprite on the center of the screen
        pSprite.setPosition( cc.ccp(size.width/2, size.height/2) );

        // add the sprite as a child to this layer
        this.addChild(pSprite, 0);
        *******************/
        //var helloSprite = cc.Sprite.spriteWithFile("helloworld.png");

        //this.addChild(helloSprite,0);
        var pSprite = new cc.Sprite();
        pSprite.setSpriteImage(this.helloImg);
        this.addChild(pSprite,-1);

        var lb = cc.LabelTTF.labelWithString("Hello World", "Arial", 24);
        lb.setPosition(cc.ccp(180,300));
        this.addChild(lb,1);

        var circle = new CircleSprite();
        this.addChild(circle,2);

        return true;
    },
    // a selector callback
    menuCloseCallback: function(pSender)
    {
        cc.Director.sharedDirector().end();
    }
});
// there's no 'id' in cpp, so we recommand to return the exactly class pointer
Helloworld.scene = function(){
    // 'scene' is an autorelease object
    var scene = cc.Scene.node();

    // 'layer' is an autorelease object
    var layer = this.node();
    scene.addChild(layer);
    return scene;
};
// implement the "static node()" method manually
Helloworld.node = function(){
    var pRet = new Helloworld();
    if(pRet && pRet.init())
    {
        return pRet;
    }
    else
    {
        pRet = null;
        return null;
    }
};

