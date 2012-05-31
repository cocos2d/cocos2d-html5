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




IntervalLayer = cc.Layer.extend({

    label0:null,
    label1:null,
    label2:null,
    label3:null,
    label4:null,

    time0:null,
    time1:null,
    time2:null,
    time3:null,
    time4:null,

    ctor:function () {
        this.time0 = this.time1 = this.time2 = this.time3 = this.time4 = 0.0;

        var s = cc.Director.sharedDirector().getWinSize();
        // sun
        var sun = cc.ParticleSun.node();
        sun.setTexture(cc.TextureCache.sharedTextureCache().addImage(s_fire));
        sun.setPosition(cc.PointMake(s.width - 32, s.height - 32));

        sun.setTotalParticles(130);
        sun.setLife(0.6);
        this.addChild(sun);

        // timers
        this.label0 = cc.LabelTTF.labelWithString("0", "Arial", 24);
        this.label1 = cc.LabelTTF.labelWithString("0", "Arial", 24);
        this.label2 = cc.LabelTTF.labelWithString("0", "Arial", 24);
        this.label3 = cc.LabelTTF.labelWithString("0", "Arial", 24);
        this.label4 = cc.LabelTTF.labelWithString("0", "Arial", 24);

        this.scheduleUpdate();
        this.schedule(this.step1);
        this.schedule(this.step2, 0);
        this.schedule(this.step3, 1.0);
        this.schedule(this.step4, 2.0);

        this.label0.setPosition(cc.PointMake(s.width * 1 / 6, s.height / 2));
        this.label1.setPosition(cc.PointMake(s.width * 2 / 6, s.height / 2));
        this.label2.setPosition(cc.PointMake(s.width * 3 / 6, s.height / 2));
        this.label3.setPosition(cc.PointMake(s.width * 4 / 6, s.height / 2));
        this.label4.setPosition(cc.PointMake(s.width * 5 / 6, s.height / 2));

        this.addChild(this.label0);
        this.addChild(this.label1);
        this.addChild(this.label2);
        this.addChild(this.label3);
        this.addChild(this.label4);

        // Sprite
        var sprite = cc.Sprite.spriteWithFile(s_pathGrossini);
        sprite.setPosition(cc.PointMake(40, 50));

        var jump = cc.JumpBy.actionWithDuration(3, cc.PointMake(s.width - 80, 0), 50, 4);

        this.addChild(sprite);
        sprite.runAction(cc.RepeatForever.actionWithAction(cc.Sequence.actions(jump, jump.reverse(), null)));

        // pause button
        var item1 = cc.MenuItemFont.itemFromString("Pause", this, this.onPause);
        var menu = cc.Menu.menuWithItems(item1, null);
        menu.setPosition(cc.PointMake(s.width / 2, s.height - 50));

        this.addChild(menu);

    },

    onPause:function (sender) {
        if (cc.Director.sharedDirector().isPaused()) {
            cc.Director.sharedDirector().resume();
        } else {
            cc.Director.sharedDirector().pause();
        }
    },

    onExit:function () {
        if (cc.Director.sharedDirector().isPaused()) {
            cc.Director.sharedDirector().resume();
        }
        this._super();
    },

    step1:function (dt) {
        this.time1 += dt;
        this.label1.setString(this.time1.toFixed(1));
    },
    step2:function (dt) {
        this.time2 += dt;
        this.label2.setString(this.time2.toFixed(1));
    },
    step3:function (dt) {
        this.time3 += dt;
        this.label3.setString(this.time3.toFixed(1));
    },
    step4:function (dt) {
        this.time4 += dt;
        this.label4.setString(this.time4.toFixed(1));
    },
    update:function (dt) {
        this.time0 += dt;

        this.label0.setString(this.time0.toFixed(1));
    }

    //CREATE_NODE(IntervalLayer);
});

IntervalTestScene = TestScene.extend({

    runThisTest:function () {
        var layer = new IntervalLayer();
        this.addChild(layer);
        cc.Director.sharedDirector().replaceScene(this);
    }
});