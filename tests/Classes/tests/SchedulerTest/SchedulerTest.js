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
var kTagAnimationDance = 1;
var MAX_TESTS = 8;
var sceneIdx = -1;

var createSchedulerTest = function (nIndex) {
    var pLayer = null;

    switch (nIndex) {
        case 0:
            pLayer = new SchedulerAutoremove();
            break;
        case 1:
            pLayer = new SchedulerPauseResume();
            break;
        case 2:
            pLayer = new SchedulerUnscheduleAll();
            break;
        case 3:
            pLayer = new SchedulerUnscheduleAllHard();
            break;
        case 4:
            pLayer = new SchedulerSchedulesAndRemove();
            break;
        case 5:
            pLayer = new SchedulerUpdate();
            break;
        case 6:
            pLayer = new SchedulerUpdateAndCustom();
            break;
        case 7:
            pLayer = new SchedulerUpdateFromCustom();
            break;
        default:
            break;
    }

    return pLayer;
};

var nextSchedulerTest = function () {
    sceneIdx++;
    sceneIdx = sceneIdx % MAX_TESTS;

    return createSchedulerTest(sceneIdx);
};

var backSchedulerTest = function () {
    sceneIdx--;
    if (sceneIdx < 0)
        sceneIdx += MAX_TESTS;

    return createSchedulerTest(sceneIdx);
};

var restartSchedulerTest = function () {
    return createSchedulerTest(sceneIdx);
};

var SchedulerTestLayer = cc.Layer.extend({
    onEnter:function () {
        this._super();

        var s = cc.Director.sharedDirector().getWinSize();

        var label = cc.LabelTTF.labelWithString(this.title(), "Arial", 30);
        this.addChild(label);
        label.setPosition(cc.ccp(s.width / 2, s.height - 50));

        var subTitle = this.subtitle();
        if (subTitle != "") {
            var subLabel = cc.LabelTTF.labelWithString(subTitle, "Thonburi", 13);
            this.addChild(subLabel, 1);
            subLabel.setPosition(cc.ccp(s.width / 2, s.height - 80));
        }

        var item1 = cc.MenuItemImage.itemFromNormalImage("Resources/Images/b1.png", "Resources/Images/b2.png", this, this.backCallback);
        var item2 = cc.MenuItemImage.itemFromNormalImage("Resources/Images/r1.png", "Resources/Images/r2.png", this, this.restartCallback);
        var item3 = cc.MenuItemImage.itemFromNormalImage("Resources/Images/f1.png", "Resources/Images/f2.png", this, this.nextCallback);

        var menu = cc.Menu.menuWithItems(item1, item2, item3, null);
        menu.setPosition(cc.PointZero());
        item1.setPosition(cc.ccp(s.width / 2 - 100, 30));
        item2.setPosition(cc.ccp(s.width / 2, 30));
        item3.setPosition(cc.ccp(s.width / 2 + 100, 30));

        this.addChild(menu, 1)
    },
    title:function () {
        return "No title";
    },
    subtitle:function () {
        return "";
    },

    backCallback:function (pSender) {
        var pScene = new SchedulerTestScene();
        var pLayer = backSchedulerTest();

        pScene.addChild(pLayer);
        cc.Director.sharedDirector().replaceScene(pScene);
    },
    nextCallback:function (pSender) {
        var pScene = new SchedulerTestScene();
        var pLayer = nextSchedulerTest();

        pScene.addChild(pLayer);
        cc.Director.sharedDirector().replaceScene(pScene);
    },
    restartCallback:function (pSender) {
        var pScene = new SchedulerTestScene();
        var pLayer = restartSchedulerTest();

        pScene.addChild(pLayer);
        cc.Director.sharedDirector().replaceScene(pScene);
    }
});

var SchedulerAutoremove = SchedulerTestLayer.extend({
    _accum:0,

    onEnter:function () {
        this._super();

        this.schedule(this.autoremove, 0.5);
        this.schedule(this.tick, 0.5);
        this._accum = 0;
    },
    title:function () {
        return "Self-remove an scheduler";
    },
    subtitle:function () {
        return "1 scheduler will be autoremoved in 3 seconds. See console";
    },

    autoremove:function (dt) {
        this._accum += dt;
        cc.Log("Time: " + this._accum);

        if (this._accum > 3) {
            this.unschedule(this.autoremove);
            cc.Log("scheduler removed");
        }
    },
    tick:function (dt) {
        cc.Log("This scheduler should not be removed");
    }
});

var SchedulerPauseResume = SchedulerTestLayer.extend({
    onEnter:function () {
        this._super();

        this.schedule(this.tick1, 0.5);
        this.schedule(this.tick2, 0.5);
        this.schedule(this.pause, 0.5);
    },
    title:function () {
        return "Pause / Resume";
    },
    subtitle:function () {
        return "Scheduler should be paused after 3 seconds. See console";
    },

    tick1:function (dt) {
        cc.Log("tick1");
    },
    tick2:function (dt) {
        cc.Log("tick2");
    },
    pause:function (dt) {
        cc.Scheduler.sharedScheduler().pauseTarget(this);
    }
});

var SchedulerUnscheduleAll = SchedulerTestLayer.extend({
    onEnter:function () {
        this._super();

        this.schedule(this.tick1, 0.5);
        this.schedule(this.tick2, 1.0);
        this.schedule(this.tick3, 1.5);
        this.schedule(this.tick4, 1.5);
        this.schedule(this.unscheduleAll, 4);
    },
    title:function () {
        return "Unschedule All selectors";
    },
    subtitle:function () {
        return "All scheduled selectors will be unscheduled in 4 seconds. See console";
    },

    tick1:function (dt) {
        cc.Log("tick1");
    },
    tick2:function (dt) {
        cc.Log("tick2");
    },
    tick3:function (dt) {
        cc.Log("tick3");
    },
    tick4:function (dt) {
        cc.Log("tick4");
    },
    unscheduleAll:function (dt) {
        this.unscheduleAllSelectors();
    }
});

var SchedulerUnscheduleAllHard = SchedulerTestLayer.extend({
    onEnter:function () {
        this._super();

        this.schedule(this.tick1, 0.5);
        this.schedule(this.tick2, 1.0);
        this.schedule(this.tick3, 1.5);
        this.schedule(this.tick4, 1.5);
        this.schedule(this.unscheduleAll, 4);
    },
    title:function () {
        return "Unschedule All selectors #2";
    },
    subtitle:function () {
        return "Unschedules all selectors after 4s. Uses CCScheduler. See console";
    },

    tick1:function (dt) {
        cc.Log("tick1");
    },
    tick2:function (dt) {
        cc.Log("tick2");
    },
    tick3:function (dt) {
        cc.Log("tick3");
    },
    tick4:function (dt) {
        cc.Log("tick4");
    },
    unscheduleAll:function (dt) {
        cc.Scheduler.sharedScheduler().unscheduleAllSelectors();
    }
});

var SchedulerSchedulesAndRemove = SchedulerTestLayer.extend({
    onEnter:function () {
        this._super();

        this.schedule(this.tick1, 0.5);
        this.schedule(this.tick2, 1.0);
        this.schedule(this.scheduleAndUnschedule, 4.0);
    },
    title:function () {
        return "Schedule from Schedule";
    },
    subtitle:function () {
        return "Will unschedule and schedule selectors in 4s. See console";
    },

    tick1:function (dt) {
        cc.Log("tick1");
    },
    tick2:function (dt) {
        cc.Log("tick2");
    },
    tick3:function (dt) {
        cc.Log("tick3");
    },
    tick4:function (dt) {
        cc.Log("tick4");
    },
    scheduleAndUnschedule:function (dt) {
        this.unschedule(this.tick1);
        this.unschedule(this.tick2);
        this.unschedule(this.scheduleAndUnschedule);

        this.schedule(this.tick3, 1.0);
        this.schedule(this.tick4, 1.0);
    }
});

var TestNode = cc.Node.extend({
    _pString:"",

    initWithString:function (pStr, priority) {
        this._pString = pStr;
        this.scheduleUpdateWithPriority(priority);
    }
});

var SchedulerUpdate = SchedulerTestLayer.extend({
    onEnter:function () {
        this._super();

        var d = new TestNode();
        var pStr = "---";
        d.initWithString(pStr, 50);
        this.addChild(d);


        var b = new TestNode();
        pStr = "3rd";
        b.initWithString(pStr, 0);
        this.addChild(b);

        var a = new TestNode();
        pStr = "1st";
        a.initWithString(pStr, -10);
        this.addChild(a);

        var c = new TestNode();
        pStr = "4th";
        c.initWithString(pStr, 10);
        this.addChild(c);

        var e = new TestNode();
        pStr = "5th";
        e.initWithString(pStr, 20);
        this.addChild(e);

        var f = new TestNode();
        pStr = "2nd";
        f.initWithString(pStr, -5);
        this.addChild(f);

        this.schedule(this.removeUpdates, 4.0);
    },
    title:function () {
        return "Schedule update with priority";
    },
    subtitle:function () {
        return "3 scheduled updates. Priority should work. Stops in 4s. See console";
    },

    removeUpdates:function (dt) {
        var children = this.getChildren();

        for (var i = 0; i < children.length; i++) {
            var pNode = children[i];
            if (pNode) {
                pNode.unscheduleAllSelectors();
            }
        }
    }
});

var SchedulerUpdateAndCustom = SchedulerTestLayer.extend({
    onEnter:function () {
        this._super();

        this.scheduleUpdate();
        this.schedule(this.tick);
        this.schedule(this.stopSelectors, 0.4);
    },
    title:function () {
        return "Schedule Update + custom selector";
    },
    subtitle:function () {
        return "Update + custom selector at the same time. Stops in 4s. See console";
    },

    update:function (dt) {
        cc.Log("update called:" + dt);
    },
    tick:function (dt) {
        cc.Log("custom selector called:" + dt);
    },
    stopSelectors:function (dt) {
        this.unscheduleAllSelectors();
    }
});

var SchedulerUpdateFromCustom = SchedulerTestLayer.extend({
    onEnter:function () {
        this._super();

        this.schedule(this.schedUpdate, 2.0);
    },
    title:function () {
        return "Schedule Update in 2 sec";
    },
    subtitle:function () {
        return "Update schedules in 2 secs. Stops 2 sec later. See console";
    },

    update:function (dt) {
        cc.Log("update called:" + dt);
    },
    schedUpdate:function (dt) {
        this.unschedule(this.schedUpdate);
        this.scheduleUpdate();
        this.schedule(this.stopUpdate, 2.0);
    },
    stopUpdate:function (dt) {
        this.unscheduleUpdate();
        this.unschedule(this.stopUpdate);
    }
});


var RescheduleSelector = SchedulerTestLayer.extend({
    _interval:1.0,
    _ticks:0,

    onEnter:function () {
        this._super();

        this._interval = 1.0;
        this._ticks = 0;
        this.schedule(this.schedUpdate, this._interval);
    },
    title:function () {
        return "Reschedule Selector";
    },
    subtitle:function () {
        return "Interval is 1 second, then 2, then 3...";
    },

    schedUpdate:function (dt) {
        this._ticks++;

        cc.Log("schedUpdate: " + dt.toFixed(2));
        if (this._ticks > 3) {
            this._interval += 1.0;
            this.schedule(this.schedUpdate, this._interval);
            this._ticks = 0;
        }
    }
});

var SchedulerTestScene = TestScene.extend({
    runThisTest:function () {
        var pLayer = nextSchedulerTest();
        this.addChild(pLayer);

        cc.Director.sharedDirector().replaceScene(this);
    }
});