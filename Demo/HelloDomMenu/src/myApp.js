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

var g_ressources = [
    {src:"res/HelloWorld.png"},
    {src:"res/CloseNormal.png"},
    {src:"res/CloseSelected.png"}
];

var Helloworld = cc.Layer.extend({
    isMouseDown:false,
    helloImg:null,
    helloLb:null,
    circle:null,
    sprite:null,

    init:function () {
        var selfPointer = this;
        //////////////////////////////
        // 1. super init first
        this._super();

        var size = cc.Director.getInstance().getWinSize();

        //this.helloLb = cc.LabelTTF.create("Hello World", "Arial", 24);
        // position the label on the center of the screen
        //this.helloLb.setPosition(cc.p(cc.Director.getInstance().getWinSize().width / 2, 0));
        // add the label as a child to this layer
        //this.addChild(this.helloLb, 5);

        // add "HelloWorld" splash screen"
        this.sprite = cc.Sprite.create("res/HelloWorld.png");
        this.sprite.setPosition(cc.p(size.width / 2, size.height / 2));
        this.sprite.setVisible(true);
        this.sprite.setAnchorPoint(cc.p(0.5, 0.5));
        this.sprite.setScale(0.5);
        this.sprite.setRotation(180);
        this.addChild(this.sprite, 0);


        var actionTo = cc.SkewTo.create(5, 0., 45);
        var actionToBack = cc.SkewTo.create(5, 0, 0);
        var rotateTo = cc.RotateTo.create(5, 300.0);
        var rotateToBack = cc.RotateTo.create(5, 0);
        var actionScaleTo = cc.ScaleTo.create(5, -0.44, 0.47);
        var actionScaleToBack = cc.ScaleTo.create(5, 1.0, 1.0);
        var actionBy = cc.MoveBy.create(5, cc.p(80, 80));
        var actionByBack = actionBy.reverse();

        //this.sprite.runAction(cc.Sequence.create(rotateToA, scaleToA));


        this.sprite.runAction(cc.Sequence.create(actionTo, actionToBack, null));
        this.sprite.runAction(cc.Sequence.create(rotateTo, rotateToBack, null));
        this.sprite.runAction(cc.Sequence.create(actionScaleTo, actionScaleToBack));
        this.sprite.runAction(cc.Sequence.create(actionBy, actionByBack));


        this.setTouchEnabled(true);


        var closeItem = cc.MenuItemImage.create(
            "res/CloseNormal.png",
            "res/CloseSelected.png",
            this.menuCloseCallback,
            this
        );
        var text = cc.MenuItemFont.create("Hello Dom", function () {
        }, this);
        text.setColor({r:255, g:0, b:0});
        text.setPosition(cc.p(cc.canvas.width / 2, cc.canvas.height / 2));
        closeItem.setPosition(cc.p(cc.canvas.width - 20, 20));
        var menu = cc.Menu.create(closeItem, text);
        menu.setPosition(cc.p(0, 0));
        this.sprite.addChild(menu);
        //cc.fullscreen();

        cc.DOM.convert(this.sprite, closeItem, text);
        return true;
    },
    // a selector callback
    menuCloseCallback:function (sender) {
        history.go(-1);
    }

});
var HelloWorldScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new Helloworld();
        layer.init();
        this.addChild(layer);
    }
});


