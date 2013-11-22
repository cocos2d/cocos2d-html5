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

var MyLayer = cc.Layer.extend({
    isMouseDown:false,
    helloImg:null,
    helloLabel:null,
    circle:null,
    sprite:null,

    init:function () {
        cc.SPRITE_DEBUG_DRAW = 1;

        this._super();
        cc.SpriteFrameCache.getInstance().addSpriteFrames("fight_blood_font.plist");
        cc.SpriteFrameCache.getInstance().addSpriteFrames("JSONarray.json");
        //cc.SpriteFrameCache.getInstance().addSpriteFrames("JSONHash.json");

        var s = cc.Sprite.createWithSpriteFrameName("fight_debuff_blood_minus.png");
        s.setPosition(cc.p(100,100));
        this.addChild(s);

        var s = cc.Sprite.createWithSpriteFrameName("goods_13.png");
        s.setPosition(cc.p(50,100));
        this.addChild(s);

        var s = cc.Sprite.createWithSpriteFrameName("goods_14.png");
        s.setPosition(cc.p(50,200));
        this.addChild(s);

        var s = cc.Sprite.createWithSpriteFrameName("goods_15.png");
        s.setPosition(cc.p(50,300));
        this.addChild(s);

        var s = cc.Sprite.createWithSpriteFrameName("goods_16.png");
        s.setPosition(cc.p(150,100));

        this.addChild(s);

        var s = cc.Sprite.createWithSpriteFrameName("goods_17.png");
        s.setPosition(cc.p(150,200));
        this.addChild(s);

        var s = cc.Sprite.createWithSpriteFrameName("goods_18.png");
        s.setPosition(cc.p(150,300));
        this.addChild(s);

        var s = cc.Sprite.createWithSpriteFrameName("goods_33.png");
        s.setPosition(cc.p(250,100));
        this.addChild(s);
    }
});

var MyScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new MyLayer();
        this.addChild(layer);
        layer.init();
    }
});
