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

        if(this._radians > 360)
            this._radians = 0;
        cc.drawingUtil.drawCircle(this.getPosition(),30,cc.DEGREES_TO_RADIANS(this._radians),60,false);

        //tools.drawQuadBezier(new cc.Point(30,20),new cc.Point(150,20),new cc.Point(50,300),50);
        //tools.drawCubicBezier(new cc.Point(30,50),new cc.Point(150,20),new cc.Point(350,120),new cc.Point(150,300),50);
    },
    myUpdate:function(dt){
        this._radians += 6;
    }
});

var Cocos2dSprite = cc.Sprite.extend({
    _dirX : 5,
    _dirY:5,
    _speedPx:30,

    ctor:function(){
        this._super();
        this.initWithFile("Resources/cocos64.png");
        this.setPosition(cc.ccp(Math.random() * cc.canvas.width,Math.random()*cc.canvas.height));
        this.schedule(this.randomMove,0);
    },
    randomMove:function(){
        if((this.getPositionX()< 80 ) || (this.getPositionX() > (cc.canvas.width-80))){
            this._dirX = -this._dirX;
        }

        if((this.getPositionY()< 80 ) || (this.getPositionY() > (cc.canvas.height-80))){
            this._dirY = -this._dirY;
        }
        var mX = Math.random() * this._speedPx -6;
        var mY = Math.random() * this._speedPx -6;
        if(this._dirX < 0){
            mX = -mX;
        }
        if(this._dirY < 0){
            mY = -mY;
        }
        //this.runAction(cc.MoveBy.actionWithDuration(1,cc.ccp(mX ,mY)));
        this.setPosition(cc.ccp(this.getPositionX() + mX ,this.getPositionY() + mY));
    }
});


var Helloworld = cc.Layer.extend({
    bIsMouseDown :false,
    helloImg:null,
    helloLb:null,
    circle:null,
    pSprite:null,
    // Here's a difference. Method 'init' in cocos2d-x returns bool, instead of returning 'id' in cocos2d-iphone
    init: function()
    {
        var selfPoint = this;

         this._super();

        var pCloseItem = cc.MenuItemImage.itemFromNormalImage(
            "Resources/CloseNormal.png",
            "Resources/CloseSelected.png",
            this,
            function(){selfPoint.addSprite();} );
        pCloseItem.setPosition(cc.canvas.width-20,20);
        var pMenu = cc.Menu.menuWithItems(pCloseItem, null);

        var size = cc.Director.sharedDirector().getWinSize();

        this.helloLb = cc.LabelTTF.labelWithString("Sprite Count: 3", "Arial", 30);
        this.helloLb.setPosition(cc.ccp(180,0));
        this.addChild(this.helloLb,5);
        this.helloLb.runAction(cc.MoveTo.actionWithDuration(3.5,cc.ccp(540,570)));
        this.schedule(this.showChildCount,1);

        this.pSprite = cc.Sprite.spriteWithFile("Resources/HelloWorld.png");
        this.pSprite.setPosition(cc.ccp(160,140));
        this.pSprite.setIsVisible(true);
        this.pSprite.setAnchorPoint(cc.ccp(0.5,0.5));
        this.pSprite.setScale(0.5);
        this.pSprite.setRotation(180);
        this.addChild(this.pSprite,0);

        var rotateToA = cc.RotateTo.actionWithDuration(2,0);
        var scaleToA = cc.ScaleTo.actionWithDuration(2,1,1);

        this.pSprite.runAction(cc.Sequence.actions(rotateToA,scaleToA));

        this.circle = new CircleSprite();
        this.circle.setPosition(new cc.Point(40,560));
        this.addChild(this.circle,2);
        this.circle.schedule(this.circle.myUpdate,1/60);

        this.setIsTouchEnabled(true);
        return true;
    },
    showChildCount:function(){
        this.helloLb.setString("Sprite Count:" + this.getChildrenCount());
    },
    addSprite:function(){
        for(var i = 0; i< 100;i++){
            var cocosSp = new Cocos2dSprite();
            this.addChild(cocosSp,1);
        }
    },
    // a selector callback
    menuCloseCallback: function(pSender)
    {
        cc.Director.sharedDirector().end();
    },
    ccTouchesBegan:function(pTouches,pEvent){
        this.bIsMouseDown = true;
    },
    ccTouchesMoved:function(pTouches,pEvent){
        if(this.bIsMouseDown){
            if(pTouches){
                //console.log(pTouches[0].locationInView().x +"   "+pTouches[0].locationInView().y);
                this.circle.setPosition(new cc.Point(pTouches[0].locationInView(0).x,pTouches[0].locationInView(0).y));
            }
        }
    },
    ccTouchesEnded:function(pTouches,pEvent){
        this.bIsMouseDown = false;
    },
    ccTouchesCancelled:function(pTouches,pEvent){
        console.log("ccTouchesCancelled");
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



