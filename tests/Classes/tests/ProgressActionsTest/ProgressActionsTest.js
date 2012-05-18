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
var sceneIdx_Progress = -1;
var MAX_LAYER_Progress = 3;

var nextProgressAction = function () {
    sceneIdx_Progress++;
    sceneIdx_Progress = sceneIdx_Progress % MAX_LAYER_Progress;

    return createLayer(sceneIdx_Progress);
};
var backProgressAction = function () {
    sceneIdx_Progress--;
    if (sceneIdx_Progress < 0)
        sceneIdx_Progress += MAX_LAYER_Progress;

    return createLayer(sceneIdx_Progress);
};
var restartProgressAction = function () {
    return createLayer(sceneIdx_Progress);
};

var createLayer = function (nIndex) {
    switch (nIndex) {
        case 0:
            return new SpriteProgressToRadial();
        case 1:
            return new SpriteProgressToHorizontal();
        case 2:
            return new SpriteProgressToVertical();
    }
    return null;
};

var SpriteDemo = cc.Layer.extend({
    ctor:function () {
        this._super();
    },
    title:function () {
        return "ProgressActionsTest";
    },
    subtitle:function () {
        return "";
    },
    onEnter:function () {
        this._super();

        var winSize = cc.Director.sharedDirector().getWinSize();

        var label = cc.LabelTTF.labelWithString(this.title(), "Arial", 18);
        this.addChild(label, 1);
        label.setPosition(cc.PointMake(winSize.width / 2, winSize.height - 50));

        var strSubtitle = this.subtitle();
        if (strSubtitle != "") {
            var l = cc.LabelTTF.labelWithString(strSubtitle, "Thonburi", 22);
            this.addChild(l, 1);
            l.setPosition(cc.PointMake(winSize.width / 2, winSize.height - 80));
        }

        var item1 = cc.MenuItemImage.itemFromNormalImage(s_pPathB1, s_pPathB2, this, this.backCallback);
        var item2 = cc.MenuItemImage.itemFromNormalImage(s_pPathR1, s_pPathR2, this, this.restartCallback);
        var item3 = cc.MenuItemImage.itemFromNormalImage(s_pPathF1, s_pPathF2, this, this.nextCallback);

        var menu = cc.Menu.menuWithItems(item1, item2, item3);

        menu.setPosition(cc.PointZero());
        item1.setPosition(cc.PointMake(winSize.width / 2 - 100, 30));
        item2.setPosition(cc.PointMake(winSize.width / 2, 30));
        item3.setPosition(cc.PointMake(winSize.width / 2 + 100, 30));

        this.addChild(menu, 1);
    },
    restartCallback:function (pSender) {
        var scene = new ProgressActionsTestScene();
        scene.addChild(restartProgressAction());
        cc.Director.sharedDirector().replaceScene(scene);
    },
    nextCallback:function (pSender) {
        var scene = new ProgressActionsTestScene();
        scene.addChild(nextProgressAction());
        cc.Director.sharedDirector().replaceScene(scene);
    },
    backCallback:function (pSender) {
        var scene = new ProgressActionsTestScene();
        scene.addChild(backProgressAction());
        cc.Director.sharedDirector().replaceScene(scene);
    }
});

var SpriteProgressToRadial = SpriteDemo.extend({
    onEnter:function () {
        this._super();
        var winSize = cc.Director.sharedDirector().getWinSize();

        var to1 = cc.ProgressTo.actionWithDuration(2, 100);
        var to2 = cc.ProgressTo.actionWithDuration(2, 100);

        var left = cc.ProgressTimer.progressWithFile(s_pPathSister1);
        left.setType(cc.kCCProgressTimerTypeRadialCW);
        this.addChild(left);
        left.setPosition(cc.PointMake(100, winSize.height / 2));
        left.runAction(cc.RepeatForever.actionWithAction(to1));

        var right = cc.ProgressTimer.progressWithFile(s_pPathBlock);
        right.setType(cc.kCCProgressTimerTypeRadialCCW);
        this.addChild(right);
        right.setPosition(cc.PointMake(winSize.width - 100, winSize.height / 2));
        right.runAction(cc.RepeatForever.actionWithAction(to2));
    },
    subtitle:function () {
        return "ProgressTo Radial";
    }
});

var SpriteProgressToHorizontal = SpriteDemo.extend({
    onEnter:function () {
        this._super();

        var winSize = cc.Director.sharedDirector().getWinSize();

        var to1 = cc.ProgressTo.actionWithDuration(2, 100);
        var to2 = cc.ProgressTo.actionWithDuration(2, 100);

        var left = cc.ProgressTimer.progressWithFile(s_pPathSister1);
        left.setType(cc.kCCProgressTimerTypeHorizontalBarLR);
        this.addChild(left);
        left.setPosition(cc.PointMake(100, winSize.height / 2));
        left.runAction(cc.RepeatForever.actionWithAction(to1));

        var right = cc.ProgressTimer.progressWithFile(s_pPathSister2);
        right.setType(cc.kCCProgressTimerTypeHorizontalBarRL);
        this.addChild(right);
        right.setPosition(cc.PointMake(winSize.width - 100, winSize.height / 2));
        right.runAction(cc.RepeatForever.actionWithAction(to2));
    },
    subtitle:function () {
        return "ProgressTo Horizontal";
    }
});

var SpriteProgressToVertical = SpriteDemo.extend({
    onEnter:function () {
        this._super();

        var winSize = cc.Director.sharedDirector().getWinSize();

        var to1 = cc.ProgressTo.actionWithDuration(2, 100);
        var to2 = cc.ProgressTo.actionWithDuration(2, 100);

        var left = cc.ProgressTimer.progressWithFile(s_pPathSister1);
        left.setType(cc.kCCProgressTimerTypeVerticalBarBT);
        this.addChild(left);
        left.setPosition(cc.PointMake(100, winSize.height / 2));
        left.runAction(cc.RepeatForever.actionWithAction(to1));

        var right = cc.ProgressTimer.progressWithFile(s_pPathSister2);
        right.setType(cc.kCCProgressTimerTypeVerticalBarTB);
        this.addChild(right);
        right.setPosition(cc.PointMake(winSize.width - 100, winSize.height / 2));
        right.runAction(cc.RepeatForever.actionWithAction(to2));
    },
    subtitle:function () {
        return "ProgressTo Vertical";
    }
});

var ProgressActionsTestScene = TestScene.extend({
    runThisTest:function () {
        sceneIdx_Progress = -1;
        MAX_LAYER_Progress = 3;
        this.addChild(nextProgressAction());
        cc.Director.sharedDirector().replaceScene(this);
    }
});