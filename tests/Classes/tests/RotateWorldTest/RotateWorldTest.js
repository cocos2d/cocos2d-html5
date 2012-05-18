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

var RotateWorldTestScene = TestScene.extend({
    runThisTest:function () {
        var pLayer = RotateWorldMainLayer.node();
        this.addChild(pLayer);
        this.runAction(cc.RotateBy.actionWithDuration(4, -360));
        cc.Director.sharedDirector().replaceScene(this);
    }
});

var SpriteLayer = cc.Layer.extend({
    onEnter:function () {
        this._super();

        var x, y;

        var size = cc.Director.sharedDirector().getWinSize();
        x = size.width;
        y = size.height;

        var sprite = cc.Sprite.spriteWithFile(s_pPathGrossini);
        var spriteSister1 = cc.Sprite.spriteWithFile(s_pPathSister1);
        var spriteSister2 = cc.Sprite.spriteWithFile(s_pPathSister2);

        sprite.setScale(1.5);
        spriteSister1.setScale(1.5);
        spriteSister2.setScale(1.5);

        sprite.setPosition(cc.PointMake(x / 2, y / 2));
        spriteSister1.setPosition(cc.PointMake(40, y / 2));
        spriteSister2.setPosition(cc.PointMake(x - 40, y / 2));

        var rot = cc.RotateBy.actionWithDuration(16, -3600);

        this.addChild(sprite);
        this.addChild(spriteSister1);
        this.addChild(spriteSister2);

        sprite.runAction(rot);

        var jump1 = cc.JumpBy.actionWithDuration(4, cc.PointMake(-400, 0), 100, 4);
        var jump2 = jump1.reverse();

        var rot1 = cc.RotateBy.actionWithDuration(4, 360 * 2);
        var rot2 = rot1.reverse();

        spriteSister1.runAction(cc.Repeat.actionWithAction(cc.Sequence.actions(jump2, jump1, null), 5));
        spriteSister2.runAction(cc.Repeat.actionWithAction(cc.Sequence.actions(jump1.copy(), jump2.copy(), null), 5));

        spriteSister1.runAction(cc.Repeat.actionWithAction(cc.Sequence.actions(rot1, rot2, null), 5));
        spriteSister2.runAction(cc.Repeat.actionWithAction(cc.Sequence.actions(rot2.copy(), rot1.copy(), null), 5));
    }
});

SpriteLayer.node = function () {
    var pNode = new SpriteLayer();
    return pNode;
};

var TestLayer = cc.Layer.extend({
    onEnter:function () {
        this._super();

        var x, y;

        var size = cc.Director.sharedDirector().getWinSize();
        x = size.width;
        y = size.height;

        //cc.MutableArray *array = [UIFont familyNames];
        //for( cc.String *s in array )
        //	NSLog( s );
        var label = cc.LabelTTF.labelWithString("cocos2d", "Tahoma", 64);

        label.setPosition(cc.PointMake(x / 2, y / 2));

        this.addChild(label);
    }
});

TestLayer.node = function () {
    var pNode = new TestLayer();
    return pNode;
};

var RotateWorldMainLayer = cc.Layer.extend({
    onEnter:function () {
        this._super();
        var x, y;

        var size = cc.Director.sharedDirector().getWinSize();
        x = size.width;
        y = size.height;

        var blue = cc.LayerColor.layerWithColor(cc.ccc4(0, 0, 255, 255));
        var red = cc.LayerColor.layerWithColor(cc.ccc4(255, 0, 0, 255));
        var green = cc.LayerColor.layerWithColor(cc.ccc4(0, 255, 0, 255));
        var white = cc.LayerColor.layerWithColor(cc.ccc4(255, 255, 255, 255));

        blue.setScale(0.5);
        blue.setPosition(cc.PointMake(-x / 4, -y / 4));
        blue.addChild(SpriteLayer.node());

        red.setScale(0.5);
        red.setPosition(cc.PointMake(x / 4, -y / 4));

        green.setScale(0.5);
        green.setPosition(cc.PointMake(-x / 4, y / 4));
        green.addChild(TestLayer.node());

        white.setScale(0.5);
        white.setPosition(cc.PointMake(x / 4, y / 4));

        this.addChild(blue, -1);
        this.addChild(white);
        this.addChild(green);
        this.addChild(red);

        var rot = cc.RotateBy.actionWithDuration(8, 720);

        blue.runAction(rot);
        red.runAction(rot.copy());
        green.runAction(rot.copy());
        white.runAction(rot.copy());
    }
});

RotateWorldMainLayer.node = function () {
    var pNode = new RotateWorldMainLayer();
    return pNode;
};