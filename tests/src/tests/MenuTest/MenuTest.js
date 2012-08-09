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


var TAG_MENU = 77771;
var TAG_MENU0 = 77770;
var TAG_MENU1 = 77771;


//------------------------------------------------------------------
//
// MenuLayer1
//
//------------------------------------------------------------------
var MenuLayer1 = cc.Layer.extend({
    ctor:function () {
        cc.MenuItemFont.setFontSize(30);
        cc.MenuItemFont.setFontName("Courier New");
        this.setTouchEnabled(true);
        // Font Item

        var spriteNormal = cc.Sprite.create(s_menuItem, cc.rect(0, 23 * 2, 115, 23));
        var spriteSelected = cc.Sprite.create(s_menuItem, cc.rect(0, 23, 115, 23));
        var spriteDisabled = cc.Sprite.create(s_menuItem, cc.rect(0, 0, 115, 23));

        var item1 = cc.MenuItemSprite.create(spriteNormal, spriteSelected, spriteDisabled, this, this.menuCallback);

        // Image Item
        var item2 = cc.MenuItemImage.create(s_sendScore, s_pressSendScore, this, this.menuCallback2);

        // Label Item (LabelAtlas)
        var labelAtlas = cc.LabelAtlas.create("0123456789", s_fpsImages, 16, 24, '.');
        var item3 = cc.MenuItemLabel.create(labelAtlas, this, this.menuCallbackDisabled);
        item3.setDisabledColor(cc.c3b(32, 32, 64));
        item3.setColor(cc.c3b(200, 200, 255));

        // Font Item
        var item4 = cc.MenuItemFont.create("I toggle enable items", this, this.menuCallbackEnabled);

        item4.setFontSizeObj(20);
        cc.MenuItemFont.setFontName("Marker Felt");

        // Label Item (CCLabelBMFont)
        var label = cc.LabelBMFont.create("configuration", s_bitmapFontTest3_fnt);
        var item5 = cc.MenuItemLabel.create(label, this, this.menuCallbackConfig);

        // Testing issue #500
        item5.setScale(0.8);

        // Font Item
        var item6 = cc.MenuItemFont.create("Quit", this, this.onQuit);

        var color_action = cc.TintBy.create(0.5, 0, -255, -255);
        var color_back = color_action.reverse();
        var seq = cc.Sequence.create(color_action, color_back, null);
        item6.runAction(cc.RepeatForever.create(seq));

        var menu = cc.Menu.create(item1, item2, item3, item4, item5, item6, null);
        menu.alignItemsVertically();

        // elastic effect
        var s = cc.Director.getInstance().getWinSize();

        var child;
        var array = menu.getChildren();
        for (var i = 0; i < array.length; i++) {
            if (array[i] == null)
                break;

            child = array[i];

            var dstPoint = child.getPosition();
            var offset = (s.width / 2 + 50);
            if (i % 2 == 0)
                offset = -offset;

            child.setPosition(cc.p(dstPoint.x + offset, dstPoint.y));
            child.runAction(
                cc.EaseElasticOut.create(cc.MoveBy.create(2, cc.p(dstPoint.x - offset, 0)), 0.35)
            );
        }
        this._disabledItem = item3;
        this._disabledItem.setEnabled(false);

        this.addChild(menu);
    },
    registerWithTouchDispatcher:function () {
        cc.Director.getInstance().getTouchDispatcher().addTargetedDelegate(this, cc.MENU_HANDLER_PRIORITY + 1, true);
    },
    onTouchBegan:function () {
        return true;
    },
    menuCallback:function (sender) {
        this._parent.switchTo(1);
    },
    menuCallbackConfig:function (sender) {
        this._parent.switchTo(3);
    },
    allowTouches:function (dt) {
        cc.Director.getInstance().getTouchDispatcher().setPriority(cc.MENU_HANDLER_PRIORITY + 1, this);
        this.unscheduleAllSelectors();
        cc.log("Touches allowed again!");
    },
    menuCallbackDisabled:function (sender) {
        // hijack all touch events for 5 seconds
        cc.Director.getInstance().getTouchDispatcher().setPriority(cc.MENU_HANDLER_PRIORITY - 1, this);
        this.schedule(this.allowTouches, 5.0);
        cc.log("TOUCHES DISABLED FOR 5 SECONDS");
    },
    menuCallbackEnabled:function (sender) {
        this._disabledItem.setEnabled(!this._disabledItem.isEnabled());
    },
    menuCallback2:function (sender) {
        this._parent.switchTo(2);
    },
    onQuit:function (sender) {
        cc.Assert(0, "Quit!");
    }
});

//------------------------------------------------------------------
//
// MenuLayer2
//
//------------------------------------------------------------------
var MenuLayer2 = cc.Layer.extend({
    ctor:function () {
        for (var i = 0; i < 2; i++) {
            var item1 = cc.MenuItemImage.create(s_playNormal, s_playSelect, this, this.menuCallback);
            var item2 = cc.MenuItemImage.create(s_highNormal, s_highSelect, this, this.menuCallbackOpacity);
            var item3 = cc.MenuItemImage.create(s_aboutNormal, s_aboutSelect, this, this.menuCallbackAlign);
            item1.setScaleX(1.5);
            item2.setScaleX(0.5);
            item3.setScaleX(0.5);
            var menu = cc.Menu.create(item1, item2, item3);
            menu.setTag(TAG_MENU);
            this.addChild(menu, 0, 100 + i);
            this._centeredMenu = menu.getPosition();
        }
        this._alignedH = true;
        this.alignMenuH();
    },
    alignMenuH:function () {
        for (var i = 0; i < 2; i++) {
            var menu = this.getChildByTag(100 + i);
            menu.setPosition(this._centeredMenu);
            if (i == 0) {
                menu.alignItemsHorizontally();
                var p = menu.getPosition();
                menu.setPosition(cc.pAdd(p, cc.p(0, 30)));
            }
            else {
                menu.alignItemsHorizontallyWithPadding(40);
                var p = menu.getPosition();
                menu.setPosition(cc.pSub(p, cc.p(0, 30)));
            }
        }
    },
    alignMenusV:function () {
        for (var i = 0; i < 2; i++) {
            var menu = this.getChildByTag(100 + i);
            menu.setPosition(this._centeredMenu);
            if (i == 0) {
                menu.alignItemsVertically();
                var p = menu.getPosition();
                menu.setPosition(cc.pAdd(p, cc.p(100, 0)));
            }
            else {
                menu.alignItemsVerticallyWithPadding(40);
                var p = menu.getPosition();
                menu.setPosition(cc.pSub(p, cc.p(100, 0)));
            }
        }
    },
    menuCallback:function (sender) {
        this._parent.switchTo(0);
    },
    menuCallbackOpacity:function (sender) {
        var menu = sender.getParent();
        var opacity = menu.getOpacity();
        if (opacity == 128)
            menu.setOpacity(255);
        else
            menu.setOpacity(128);
    },
    menuCallbackAlign:function (sender) {
        this._alignedH = !this._alignedH;
        if (this._alignedH)
            this.alignMenuH();
        else
            this.alignMenusV();
    }
});

//------------------------------------------------------------------
//
// MenuLayer3
//
//------------------------------------------------------------------
var MenuLayer3 = cc.Layer.extend({
    ctor:function () {
        cc.MenuItemFont.setFontName("Marker Felt");
        cc.MenuItemFont.setFontSize(28);

        var label = cc.LabelBMFont.create("Enable AtlasItem", s_bitmapFontTest3_fnt);
        var item1 = cc.MenuItemLabel.create(label, this, this.menuCallback2);
        var item2 = cc.MenuItemFont.create("--- Go Back ---", this, this.menuCallback);

        var spriteNormal = cc.Sprite.create(s_menuItem, cc.rect(0, 23 * 2, 115, 23));
        var spriteSelected = cc.Sprite.create(s_menuItem, cc.rect(0, 23, 115, 23));
        var spriteDisabled = cc.Sprite.create(s_menuItem, cc.rect(0, 0, 115, 23));


        var item3 = cc.MenuItemSprite.create(spriteNormal, spriteSelected, spriteDisabled, this, this.menuCallback3);
        this._disabledItem = item3;
        this._disabledItem.setEnabled(false);

        var menu = cc.Menu.create(item1, item2, item3);
        menu.setPosition(cc.p(0, 0));

        var s = cc.Director.getInstance().getWinSize();

        item1.setPosition(cc.p(s.width / 2 - 150, s.height / 2));
        item2.setPosition(cc.p(s.width / 2 - 200, s.height / 2));
        item3.setPosition(cc.p(s.width / 2, s.height / 2 - 100));

        var jump = cc.JumpBy.create(3, cc.p(400, 0), 50, 4);
        item2.runAction(cc.RepeatForever.create(
            (cc.Sequence.create(jump, jump.reverse()))
        )
        );
        var spin1 = cc.RotateBy.create(3, 360);
        var spin2 = spin1.copy();
        var spin3 = spin1.copy();

        item1.runAction(cc.RepeatForever.create(spin1));
        item2.runAction(cc.RepeatForever.create(spin2));
        item3.runAction(cc.RepeatForever.create(spin3));

        this.addChild(menu);
    },
    menuCallback:function (sender) {
        this._parent.switchTo(0);
    },
    menuCallback2:function (sender) {
        this._disabledItem.setEnabled(!this._disabledItem.isEnabled());
        this._disabledItem.stopAllActions();
    },
    menuCallback3:function () {
        cc.log("do something")
    }
});

var MenuLayer4 = cc.Layer.extend({
    ctor:function () {
        cc.MenuItemFont.setFontName("American Typewriter");
        cc.MenuItemFont.setFontSize(18);

        var title1 = cc.MenuItemFont.create("Sound");
        title1.setEnabled(false);
        cc.MenuItemFont.setFontName("Marker Felt");
        cc.MenuItemFont.setFontSize(34);
        var item1 = cc.MenuItemToggle.create(this,
            this.menuCallback,
            cc.MenuItemFont.create("On"),
            cc.MenuItemFont.create("Off"));

        cc.MenuItemFont.setFontName("American Typewriter");
        cc.MenuItemFont.setFontSize(18);
        var title2 = cc.MenuItemFont.create("Music");
        title2.setEnabled(false);
        cc.MenuItemFont.setFontName("Marker Felt");
        cc.MenuItemFont.setFontSize(34);
        var item2 = cc.MenuItemToggle.create(this,
            this.menuCallback,
            cc.MenuItemFont.create("On"),
            cc.MenuItemFont.create("Off"));

        cc.MenuItemFont.setFontName("American Typewriter");
        cc.MenuItemFont.setFontSize(18);
        var title3 = cc.MenuItemFont.create("Quality");
        title3.setEnabled(false);
        cc.MenuItemFont.setFontName("Marker Felt");
        cc.MenuItemFont.setFontSize(34);
        var item3 = cc.MenuItemToggle.create(this,
            this.menuCallback,
            cc.MenuItemFont.create("High"),
            cc.MenuItemFont.create("Low"));

        cc.MenuItemFont.setFontName("American Typewriter");
        cc.MenuItemFont.setFontSize(18);
        var title4 = cc.MenuItemFont.create("Orientation");
        title4.setEnabled(false);
        cc.MenuItemFont.setFontName("Marker Felt");
        cc.MenuItemFont.setFontSize(34);
        var item4 = cc.MenuItemToggle.create(this,
            this.menuCallback,
            cc.MenuItemFont.create("Off"));

        item4.getSubItems().push(cc.MenuItemFont.create("33%"));
        item4.getSubItems().push(cc.MenuItemFont.create("66%"));
        item4.getSubItems().push(cc.MenuItemFont.create("100%"));

        // you can change the one of the items by doing this
        item4.setSelectedIndex(2);

        cc.MenuItemFont.setFontName("Marker Felt");
        cc.MenuItemFont.setFontSize(34);

        var label = cc.LabelBMFont.create("go back", s_bitmapFontTest3_fnt);
        var back = cc.MenuItemLabel.create(label, this, this.backCallback);

        var menu = cc.Menu.create(
            title1, title2,
            item1, item2,
            title3, title4,
            item3, item4,
            back); // 9 items.

        menu.alignItemsInColumns(2, 2, 2, 2, 1, null);

        this.addChild(menu);
    },
    menuCallback:function () {
    },
    backCallback:function (sender) {
        this._parent.switchTo(0);
    }
});

var MenuTestScene = TestScene.extend({
    runThisTest:function () {
        var Layer1 = new MenuLayer1();
        var Layer2 = new MenuLayer2();
        var Layer3 = new MenuLayer3();
        var Layer4 = new MenuLayer4();

        var layer = cc.LayerMultiplex.create(Layer1, Layer2, Layer3, Layer4, null);
        this.addChild(layer, 0);
        cc.Director.getInstance().replaceScene(this);
    }
});
