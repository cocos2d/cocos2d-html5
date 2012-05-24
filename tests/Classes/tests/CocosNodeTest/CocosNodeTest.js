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

var kTagSprite1 = 1;
var kTagSprite2 = 2;
var kTagSprite3 = 3;
var kTagSlider = 4;

var sceneIdx = -1;
var MAX_LAYER = 9;

var nextCocosNodeAction = function () {
    sceneIdx++;
    sceneIdx = sceneIdx % MAX_LAYER;
    return createCocosNodeLayer(sceneIdx);
};

var backCocosNodeAction = function () {
    sceneIdx--;
    if (sceneIdx < 0)
        sceneIdx += MAX_LAYER;
    return createCocosNodeLayer(sceneIdx);
};

var restartCocosNodeAction = function () {
    return createCocosNodeLayer(sceneIdx);
};

var createCocosNodeLayer = function (nIndex) {
    switch (nIndex) {
        case 0:
            return new CCNodeTest2();
        case 1:
            return new CCNodeTest4();
        case 2:
            return new CCNodeTest5();
        case 3:
            return new CCNodeTest6();
        case 4:
            return new StressTest1();
        case 5:
            return new StressTest2();
        case 6:
            return new NodeToWorld();
        case 7:
            return new SchedulerTest1();
        case 8:
            return new ConvertToNode();
    }
    return null;
};

var TestCocosNodeDemo = cc.Layer.extend({
    ctor:function () {
    },
    title:function () {
        return "No title";
    },
    subtitle:function () {
        return "";
    },
    onEnter:function () {
        this._super();

        var s = cc.Director.sharedDirector().getWinSize();

        var label = cc.LabelTTF.labelWithString(this.title(), "Arial", 32);
        this.addChild(label, 1);
        label.setPosition(cc.PointMake(s.width / 2, s.height - 50));

        var strSubtitle = this.subtitle();
        if (!strSubtitle == "") {
            var l = cc.LabelTTF.labelWithString(strSubtitle, "Thonburi", 16);
            this.addChild(l, 1);
            l.setPosition(cc.PointMake(s.width / 2, s.height - 80));
        }

        var item1 = cc.MenuItemImage.itemFromNormalImage(s_pPathB1, s_pPathB2, this, this.backCallback);
        var item2 = cc.MenuItemImage.itemFromNormalImage(s_pPathR1, s_pPathR2, this, this.restartCallback);
        var item3 = cc.MenuItemImage.itemFromNormalImage(s_pPathF1, s_pPathF2, this, this.nextCallback);

        var menu = cc.Menu.menuWithItems(item1, item2, item3);

        menu.setPosition(cc.PointZero());
        item1.setPosition(cc.PointMake(s.width / 2 - 100, 30));
        item2.setPosition(cc.PointMake(s.width / 2, 30));
        item3.setPosition(cc.PointMake(s.width / 2 + 100, 30));

        this.addChild(menu, 1);
    },

    restartCallback:function (pSender) {
        var s = new CocosNodeTestScene();
        s.addChild(restartCocosNodeAction());
        cc.Director.sharedDirector().replaceScene(s);
    },
    nextCallback:function (pSender) {
        var s = new CocosNodeTestScene();
        s.addChild(nextCocosNodeAction());
        cc.Director.sharedDirector().replaceScene(s);
    },
    backCallback:function (pSender) {
        var s = new CocosNodeTestScene();
        s.addChild(backCocosNodeAction());
        cc.Director.sharedDirector().replaceScene(s);
    }
});

var CCNodeTest2 = TestCocosNodeDemo.extend({
    onEnter:function () {
        this._super();

        var s = cc.Director.sharedDirector().getWinSize();

        var sp1 = cc.Sprite.spriteWithFile(s_pPathSister1);
        var sp2 = cc.Sprite.spriteWithFile(s_pPathSister2);
        var sp3 = cc.Sprite.spriteWithFile(s_pPathSister1);
        var sp4 = cc.Sprite.spriteWithFile(s_pPathSister2);

        sp1.setPosition(cc.PointMake(150, s.height / 2));
        sp2.setPosition(cc.PointMake(s.width - 150, s.height / 2));
        this.addChild(sp1);
        this.addChild(sp2);

        sp3.setScale(0.25);
        sp4.setScale(0.25);

        sp1.addChild(sp3);
        sp2.addChild(sp4);

        var a1 = cc.RotateBy.actionWithDuration(2, 360);
        var a2 = cc.ScaleBy.actionWithDuration(2, 2);

        var action1 = cc.RepeatForever.actionWithAction(cc.Sequence.actions(a1, a2, a2.reverse()));
        var action2 = cc.RepeatForever.actionWithAction(cc.Sequence.actions(
            a1.copy(), a2.copy(), a2.reverse()));

        sp2.setAnchorPoint(cc.PointMake(0, 0));

        sp1.runAction(action1);
        sp2.runAction(action2);
    },
    title:function () {
        return "anchorPoint and children";
    }
});

var SID_DELAY2 = 1;
var SID_DELAY4 = 2;
var CCNodeTest4 = TestCocosNodeDemo.extend({
    ctor:function () {
        var sp1 = cc.Sprite.spriteWithFile(s_pPathSister1);
        var sp2 = cc.Sprite.spriteWithFile(s_pPathSister2);
        var s = cc.Director.sharedDirector().getWinSize();
        sp1.setPosition(cc.PointMake(150, s.height / 2));
        sp2.setPosition(cc.PointMake(s.width - 150, s.height / 2));

        this.addChild(sp1, 0, 2);
        this.addChild(sp2, 0, 3);

        this.schedule(this.delay2, 2.0);
        this.schedule(this.delay4, 4.0);
    },
    delay2:function (dt) {
        var node = this.getChildByTag(2);
        var action1 = cc.RotateBy.actionWithDuration(1, 360);
        node.runAction(action1);
    },
    delay4:function (dt) {
        this.unschedule(this.delay4);
        this.removeChildByTag(3, false);
    },
    title:function () {
        return "tags";
    }
});

var CCNodeTest5 = TestCocosNodeDemo.extend({
    ctor:function () {
        var sp1 = cc.Sprite.spriteWithFile(s_pPathSister1);
        var sp2 = cc.Sprite.spriteWithFile(s_pPathSister2);
        var s = cc.Director.sharedDirector().getWinSize();
        sp1.setPosition(cc.PointMake(150, s.height / 2));
        sp2.setPosition(cc.PointMake(s.width - 150, s.height / 2));

        var rot = cc.RotateBy.actionWithDuration(2, 360);
        var rot_back = rot.reverse();
        var forever = cc.RepeatForever.actionWithAction(cc.Sequence.actions(rot, rot_back));
        var forever2 = forever.copy();
        forever.setTag(101);
        forever2.setTag(102);

        this.addChild(sp1, 0, kTagSprite1);
        this.addChild(sp2, 0, kTagSprite2);

        sp1.runAction(forever);
        sp2.runAction(forever2);

        this.schedule(this.addAndRemove, 2.0);
    },
    addAndRemove:function (dt) {
        var sp1 = this.getChildByTag(kTagSprite1);
        var sp2 = this.getChildByTag(kTagSprite2);

        this.removeChild(sp1, false);
        this.removeChild(sp2, true);

        this.addChild(sp1, 0, kTagSprite1);
        this.addChild(sp2, 0, kTagSprite2);
    },
    title:function () {
        return "remove and cleanup";
    }
});

var CCNodeTest6 = TestCocosNodeDemo.extend({
    ctor:function () {
        var sp1 = cc.Sprite.spriteWithFile(s_pPathSister1);
        var sp11 = cc.Sprite.spriteWithFile(s_pPathSister1);

        var sp2 = cc.Sprite.spriteWithFile(s_pPathSister2);
        var sp21 = cc.Sprite.spriteWithFile(s_pPathSister2);

        var s = cc.Director.sharedDirector().getWinSize();
        sp1.setPosition(cc.PointMake(150, s.height / 2));
        sp2.setPosition(cc.PointMake(s.width - 150, s.height / 2));

        var rot = cc.RotateBy.actionWithDuration(2, 360);
        var rot_back = rot.reverse();
        var forever1 = cc.RepeatForever.actionWithAction(cc.Sequence.actions(rot, rot_back));
        var forever11 = forever1.copy();

        var forever2 = forever1.copy();
        var forever21 = forever1.copy();

        this.addChild(sp1, 0, kTagSprite1);
        sp1.addChild(sp11);
        this.addChild(sp2, 0, kTagSprite2);
        sp2.addChild(sp21);

        sp1.runAction(forever1);
        sp11.runAction(forever11);
        sp2.runAction(forever2);
        sp21.runAction(forever21);

        this.schedule(this.addAndRemove, 2.0);
    },
    addAndRemove:function (dt) {
        var sp1 = this.getChildByTag(kTagSprite1);
        var sp2 = this.getChildByTag(kTagSprite2);

        this.removeChild(sp1, false);
        this.removeChild(sp2, true);

        this.addChild(sp1, 0, kTagSprite1);
        this.addChild(sp2, 0, kTagSprite2);
    },
    title:function () {
        return "remove/cleanup with children";
    }
});

var StressTest1 = TestCocosNodeDemo.extend({
    ctor:function () {
        var s = cc.Director.sharedDirector().getWinSize();

        var sp1 = cc.Sprite.spriteWithFile(s_pPathSister1);
        this.addChild(sp1, 0, kTagSprite1);

        sp1.setPosition(cc.PointMake(s.width / 2, s.height / 2));

        this.schedule(this.shouldNotCrash, 1.0);
    },
    shouldNotCrash:function (dt) {
        this.unschedule(this.shouldNotCrash);

        var s = cc.Director.sharedDirector().getWinSize();

        // if the node has timers, it crashes
        var explosion = cc.ParticleSun.node();
        explosion.setTexture(cc.TextureCache.sharedTextureCache().addImage(s_fire));

        explosion.setPosition(cc.PointMake(s.width / 2, s.height / 2));

        this.runAction(cc.Sequence.actions(
            cc.RotateBy.actionWithDuration(2, 360),
            cc.CallFunc.actionWithTarget(this, this.removeMe)));

        this.addChild(explosion);
    },
    removeMe:function (node) {
        this._m_pParent.removeChild(node, true);
        this.nextCallback(this);
    },
    title:function () {
        return "stress test #1: no crashes";
    }
});

var StressTest2 = TestCocosNodeDemo.extend({
    ctor:function () {
        var s = cc.Director.sharedDirector().getWinSize();

        var sublayer = cc.Layer.node();

        var sp1 = cc.Sprite.spriteWithFile(s_pPathSister1);
        sp1.setPosition(cc.PointMake(80, s.height / 2));

        var move = cc.MoveBy.actionWithDuration(3, cc.PointMake(350, 0));
        var move_ease_inout3 = cc.EaseInOut.actionWithAction(move.copy(), 2.0);
        var move_ease_inout_back3 = move_ease_inout3.reverse();
        var seq3 = cc.Sequence.actions(move_ease_inout3, move_ease_inout_back3);
        sp1.runAction(cc.RepeatForever.actionWithAction(seq3));
        sublayer.addChild(sp1, 1);

        var fire = cc.ParticleFire.node();
        fire.setTexture(cc.TextureCache.sharedTextureCache().addImage(s_fire));
        fire.setPosition(cc.PointMake(80, s.height / 2 - 50));

        var copy_seq3 = seq3.copy();

        fire.runAction(cc.RepeatForever.actionWithAction(copy_seq3));
        sublayer.addChild(fire, 2);

        this.schedule(this.shouldNotLeak, 6.0);

        this.addChild(sublayer, 0, kTagSprite1);
    },
    shouldNotLeak:function (dt) {
        this.unschedule(this.shouldNotLeak);
        var sublayer = this.getChildByTag(kTagSprite1);
        sublayer.removeAllChildrenWithCleanup(true);
    },
    title:function () {
        return "stress test #2: no leaks";
    }
});

var SchedulerTest1 = TestCocosNodeDemo.extend({
    ctor:function () {
        var layer = cc.Layer.node();
        //UXLOG("retain count after init is %d", layer.retainCount());                // 1

        this.addChild(layer, 0);
        //UXLOG("retain count after addChild is %d", layer.retainCount());      // 2

        layer.schedule(this.doSomething);
        //UXLOG("retain count after schedule is %d", layer.retainCount());      // 3 : (object-c viersion), but win32 version is still 2, because CCTimer class don't save target.

        layer.unschedule(this.doSomething);
        //UXLOG("retain count after unschedule is %d", layer.retainCount());		// STILL 3!  (win32 is '2')
    },
    doSomething:function (dt) {
    },
    title:function () {
        return "cocosnode scheduler test #1";
    }
});

var NodeToWorld = TestCocosNodeDemo.extend({
    ctor:function () {
        //
        // This code tests that nodeToParent works OK:
        //  - It tests different anchor Points
        //  - It tests different children anchor points

        var back = cc.Sprite.spriteWithFile(s_back3);
        this.addChild(back, -10);
        back.setAnchorPoint(cc.PointMake(0, 0));
        var backSize = back.getContentSize();

        var item = cc.MenuItemImage.itemFromNormalImage(s_PlayNormal, s_PlaySelect);
        var menu = cc.Menu.menuWithItems(item, null);
        menu.alignItemsVertically();
        menu.setPosition(cc.PointMake(backSize.width / 2, backSize.height / 2));
        back.addChild(menu);

        var rot = cc.RotateBy.actionWithDuration(5, 360);
        var fe = cc.RepeatForever.actionWithAction(rot);
        item.runAction(fe);

        var move = cc.MoveBy.actionWithDuration(3, cc.PointMake(200, 0));
        var move_back = move.reverse();
        var seq = cc.Sequence.actions(move, move_back);
        var fe2 = cc.RepeatForever.actionWithAction(seq);
        back.runAction(fe2);
    },
    title:function () {
        return "nodeToParent transform";
    }
});

var CameraOrbitTest = TestCocosNodeDemo.extend({
    ctor:function () {
        var s = cc.Director.sharedDirector().getWinSize();

        var p = cc.Sprite.spriteWithFile(s_back3);
        this.addChild(p, 0);
        p.setPosition(cc.PointMake(s.width / 2, s.height / 2));
        p.setOpacity(128);

        // LEFT
        s = p.getContentSize();
        var sprite = cc.Sprite.spriteWithFile(s_pPathGrossini);
        sprite.setScale(0.5);
        p.addChild(sprite, 0);
        sprite.setPosition(cc.PointMake(s.width / 4 * 1, s.height / 2));
        var cam = sprite.getCamera();
        var orbit = cc.OrbitCamera.actionWithDuration(2, 1, 0, 0, 360, 0, 0);
        sprite.runAction(cc.RepeatForever.actionWithAction(orbit));

        // CENTER
        sprite = cc.Sprite.spriteWithFile(s_pPathGrossini);
        sprite.setScale(1.0);
        p.addChild(sprite, 0);
        sprite.setPosition(cc.PointMake(s.width / 4 * 2, s.height / 2));
        orbit = cc.OrbitCamera.actionWithDuration(2, 1, 0, 0, 360, 45, 0);
        sprite.runAction(cc.RepeatForever.actionWithAction(orbit));

        // RIGHT
        sprite = cc.Sprite.spriteWithFile(s_pPathGrossini);
        sprite.setScale(2.0);
        p.addChild(sprite, 0);
        sprite.setPosition(cc.PointMake(s.width / 4 * 3, s.height / 2));
        var ss = sprite.getContentSize();
        orbit = cc.OrbitCamera.actionWithDuration(2, 1, 0, 0, 360, 90, -45);
        sprite.runAction(cc.RepeatForever.actionWithAction(orbit));

        // PARENT
        orbit = cc.OrbitCamera.actionWithDuration(10, 1, 0, 0, 360, 0, 90);
        p.runAction(cc.RepeatForever.actionWithAction(orbit));

        this.setScale(1);
    },
    onEnter:function () {
        this._super();
        cc.Director.sharedDirector().setProjection(cc.kCCDirectorProjection3D);
    },
    onExit:function () {
        cc.Director.sharedDirector().setProjection(cc.kCCDirectorProjection2D);
        this._super();
    },
    title:function () {
        return "Camera Orbit test";
    }
});

var CameraZoomTest = TestCocosNodeDemo.extend({
    _m_z:0,
    ctor:function () {
        var s = cc.Director.sharedDirector().getWinSize();

        // LEFT
        var sprite = cc.Sprite.spriteWithFile(s_pPathGrossini);
        this.addChild(sprite, 0);
        sprite.setPosition(cc.PointMake(s.width / 4 * 1, s.height / 2));
        var cam = sprite.getCamera();
        cam.setEyeXYZ(0, 0, 415);

        // CENTER
        sprite = cc.Sprite.spriteWithFile(s_pPathGrossini);
        this.addChild(sprite, 0, 40);
        sprite.setPosition(cc.PointMake(s.width / 4 * 2, s.height / 2));
//		cam = [sprite camera);
//		[cam setEyeX:0 eyeY:0 eyeZ:415/2);

        // RIGHT
        sprite = cc.Sprite.spriteWithFile(s_pPathGrossini);
        this.addChild(sprite, 0, 20);
        sprite.setPosition(cc.PointMake(s.width / 4 * 3, s.height / 2));
//		cam = [sprite camera);
//		[cam setEyeX:0 eyeY:0 eyeZ:-485);
//		[cam setCenterX:0 centerY:0 centerZ:0);

        this._m_z = 0;
        this.scheduleUpdate();
    },
    update:function (dt) {
        this._m_z += dt * 100;

        var sprite = this.getChildByTag(20);
        var cam = sprite.getCamera();
        cam.setEyeXYZ(0, 0, this._m_z);

        sprite = this.getChildByTag(40);
        cam = sprite.getCamera();
        cam.setEyeXYZ(0, 0, this._m_z);
    },

    onEnter:function () {
        this._super();
        cc.Director.sharedDirector().setProjection(cc.kCCDirectorProjection3D);
    },
    onExit:function () {
        cc.Director.sharedDirector().setProjection(cc.kCCDirectorProjection2D);
        this._super();
    },
    title:function () {
        return "Camera Zoom test";
    }
});

var CameraCenterTest = TestCocosNodeDemo.extend({
    ctor:function () {
        var s = cc.Director.sharedDirector().getWinSize();

        // LEFT-TOP
        var sprite = new cc.Sprite();//.node();
        sprite.init();
        this.addChild(sprite, 0);
        sprite.setPosition(cc.PointMake(s.width / 5 * 1, s.height / 5 * 1));
        sprite.setColor(cc.RED());
        sprite.setTextureRect(cc.RectMake(0, 0, 120, 50));
        var orbit = cc.OrbitCamera.actionWithDuration(10, 1, 0, 0, 360, 0, 0);
        sprite.runAction(cc.RepeatForever.actionWithAction(orbit));

        // LEFT-BOTTOM
        sprite = new cc.Sprite();//.node();
        sprite.init();
        this.addChild(sprite, 0, 40);
        sprite.setPosition(cc.PointMake(s.width / 5 * 1, s.height / 5 * 4));
        sprite.setColor(cc.BLUE());
        sprite.setTextureRect(cc.RectMake(0, 0, 120, 50));
        orbit = cc.OrbitCamera.actionWithDuration(10, 1, 0, 0, 360, 0, 0);
        sprite.runAction(cc.RepeatForever.actionWithAction(orbit));

        // RIGHT-TOP
        sprite = new cc.Sprite();//.node();
        sprite.init();
        this.addChild(sprite, 0);
        sprite.setPosition(cc.PointMake(s.width / 5 * 4, s.height / 5 * 1));
        sprite.setColor(cc.YELLOW());
        sprite.setTextureRect(cc.RectMake(0, 0, 120, 50));
        orbit = cc.OrbitCamera.actionWithDuration(10, 1, 0, 0, 360, 0, 0);
        sprite.runAction(cc.RepeatForever.actionWithAction(orbit));

        // RIGHT-BOTTOM
        sprite = new cc.Sprite();//.node();
        sprite.init();
        this.addChild(sprite, 0, 40);
        sprite.setPosition(cc.PointMake(s.width / 5 * 4, s.height / 5 * 4));
        sprite.setColor(cc.GREEN());
        sprite.setTextureRect(cc.RectMake(0, 0, 120, 50));
        orbit = cc.OrbitCamera.actionWithDuration(10, 1, 0, 0, 360, 0, 0);
        sprite.runAction(cc.RepeatForever.actionWithAction(orbit));

        // CENTER
        sprite = new cc.Sprite();
        sprite.init();
        this.addChild(sprite, 0, 40);
        sprite.setPosition(cc.PointMake(s.width / 2, s.height / 2));
        sprite.setColor(cc.WHITE());
        sprite.setTextureRect(cc.RectMake(0, 0, 120, 50));
        orbit = cc.OrbitCamera.actionWithDuration(10, 1, 0, 0, 360, 0, 0);
        sprite.runAction(cc.RepeatForever.actionWithAction(orbit));
    },
    title:function () {
        return "Camera Center test";
    },
    subtitle:function () {
        return "Sprites should rotate at the same speed";
    }
});

var ConvertToNode = TestCocosNodeDemo.extend({
    ctor:function () {
        this.setIsTouchEnabled(true);
        var s = cc.Director.sharedDirector().getWinSize();

        var rotate = cc.RotateBy.actionWithDuration(10, 360);
        var action = cc.RepeatForever.actionWithAction(rotate);
        for (var i = 0; i < 3; i++) {
            var sprite = cc.Sprite.spriteWithFile(s_pPathGrossini);
            sprite.setPosition(cc.ccp(s.width / 4 * (i + 1), s.height / 2));

            var point = cc.Sprite.spriteWithFile(s_pPathR1);
            point.setScale(0.25);
            point.setPosition(sprite.getPosition());
            this.addChild(point, 10, 100 + i);

            switch (i) {
                case 0:
                    sprite.setAnchorPoint(cc.PointZero());
                    break;
                case 1:
                    sprite.setAnchorPoint(cc.ccp(0.5, 0.5));
                    break;
                case 2:
                    sprite.setAnchorPoint(cc.ccp(1, 1));
                    break;
            }

            point.setPosition(sprite.getPosition());

            var copy = action.copy();
            sprite.runAction(copy);
            this.addChild(sprite, i);
        }
    },
    ccTouchesEnded:function (touches, event) {
        for (var it = 0; it < touches.length; it++) {
            var touch = touches[it];
            var location = touch.locationInView(touch.view());

            location = cc.Director.sharedDirector().convertToGL(location);

            for (var i = 0; i < 3; i++) {
                var node = this.getChildByTag(100 + i);

                var p1 = node.convertToNodeSpaceAR(location);
                var p2 = node.convertToNodeSpace(location);

                cc.LOG("AR: x=" + p1.x.toFixed(2) + ", y=" + p1.y.toFixed(2) + " -- Not AR: x=" + p2.x.toFixed(2) + ", y=" + p2.y.toFixed(2));
            }
        }
    },
    title:function () {
        return "Convert To Node Space";
    },
    subtitle:function () {
        return "testing convertToNodeSpace / AR. Touch and see console";
    }
});

var CocosNodeTestScene = TestScene.extend({
    runThisTest:function () {
        sceneIdx = -1;
        MAX_LAYER = 9;
        var pLayer = nextCocosNodeAction();
        this.addChild(pLayer);

        cc.Director.sharedDirector().replaceScene(this);
    }
});

